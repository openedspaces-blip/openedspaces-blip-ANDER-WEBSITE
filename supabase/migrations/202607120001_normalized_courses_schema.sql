-- =========================================================
-- 202607120001_normalized_courses_schema.sql
-- =========================================================
-- Normalized course/lesson/exercise schema for the English A1 MVP.
-- Coexists with the legacy public.lessons (content_json) table used by
-- every other language/level for now - lib/courseLessonsService.js only
-- takes over for languages/levels that actually have a row in
-- public.courses; everything else keeps using the legacy path.
--
-- Content tables (languages/levels/courses/course_lessons/lesson_sections/
-- exercises) are public-read, matching how public.lessons already works.
-- public.exercise_options is the one exception: it holds the correct
-- answer (is_correct), so it has NO public/anon policy at all - only the
-- service role (used exclusively by the Node backend) can read it. This
-- is the same "never ship the answer key to the browser" rule applied at
-- the database layer instead of just in application code.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Content tables
-- ---------------------------------------------------------------------

create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code in ('A1','A2','B1','B2','C1','C2')),
  name text not null,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  language_id uuid not null references public.languages(id) on delete cascade,
  level_id uuid not null references public.levels(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (language_id, level_id)
);

-- Named course_lessons (not "lessons") to avoid colliding with the legacy
-- content_json-based public.lessons table during the migration.
create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text unique not null,
  skill text not null check (skill in ('listening','speaking','reading','writing','grammar','vocabulary')),
  title text not null,
  description text,
  order_index integer not null default 0,
  xp_reward integer not null default 20,
  access_tier text not null default 'free' check (access_tier in ('free','premium')),
  estimated_minutes integer default 10,
  audio_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_course_lessons_course on public.course_lessons(course_id, order_index);

create table if not exists public.lesson_sections (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  type text not null check (type in ('intro','vocabulary_item','dialogue_line','reading')),
  order_index integer not null default 0,
  word text,
  translation text,
  example text,
  speaker text,
  line text,
  reading_title text,
  reading_text text,
  reading_questions jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_lesson_sections_lesson on public.lesson_sections(lesson_id, type, order_index);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  type text not null check (type in ('mcq','writing','speaking','practice')),
  prompt text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_exercises_lesson on public.exercises(lesson_id, order_index);

-- Holds the correct answer (is_correct) - service-role read only, see RLS below.
create table if not exists public.exercise_options (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  order_index integer not null default 0
);

create index if not exists idx_exercise_options_exercise on public.exercise_options(exercise_id, order_index);

-- ---------------------------------------------------------------------
-- Per-user tables
-- ---------------------------------------------------------------------

create table if not exists public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  progress_percent integer not null default 0,
  best_score integer,
  attempts_count integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists idx_user_lesson_progress_user on public.user_lesson_progress(user_id);

create table if not exists public.user_exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  selected_option_id uuid references public.exercise_options(id) on delete set null,
  is_correct boolean not null,
  attempted_at timestamptz not null default now()
);

create index if not exists idx_user_exercise_attempts_user on public.user_exercise_attempts(user_id, exercise_id);

create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_key text not null check (goal_key in ('daily','conversation','exam')),
  selected_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  lesson_id uuid references public.course_lessons(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_xp_events_user on public.user_xp_events(user_id, created_at);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  language text,
  level text,
  skill text,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_conversations_user on public.ai_conversations(user_id, created_at);

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------

alter table public.languages enable row level security;
alter table public.levels enable row level security;
alter table public.courses enable row level security;
alter table public.course_lessons enable row level security;
alter table public.lesson_sections enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_options enable row level security;
alter table public.user_lesson_progress enable row level security;
alter table public.user_exercise_attempts enable row level security;
alter table public.user_goals enable row level security;
alter table public.user_streaks enable row level security;
alter table public.user_xp_events enable row level security;
alter table public.ai_conversations enable row level security;

-- Content: public read, service role manages writes.
drop policy if exists "Public can read languages" on public.languages;
create policy "Public can read languages" on public.languages for select using (true);
drop policy if exists "Service role manages languages" on public.languages;
create policy "Service role manages languages" on public.languages for all using (auth.role() = 'service_role');

drop policy if exists "Public can read levels" on public.levels;
create policy "Public can read levels" on public.levels for select using (true);
drop policy if exists "Service role manages levels" on public.levels;
create policy "Service role manages levels" on public.levels for all using (auth.role() = 'service_role');

drop policy if exists "Public can read courses" on public.courses;
create policy "Public can read courses" on public.courses for select using (true);
drop policy if exists "Service role manages courses" on public.courses;
create policy "Service role manages courses" on public.courses for all using (auth.role() = 'service_role');

drop policy if exists "Public can read published course lessons" on public.course_lessons;
create policy "Public can read published course lessons" on public.course_lessons for select using (is_published = true);
drop policy if exists "Service role manages course lessons" on public.course_lessons;
create policy "Service role manages course lessons" on public.course_lessons for all using (auth.role() = 'service_role');

drop policy if exists "Public can read lesson sections" on public.lesson_sections;
create policy "Public can read lesson sections" on public.lesson_sections for select using (true);
drop policy if exists "Service role manages lesson sections" on public.lesson_sections;
create policy "Service role manages lesson sections" on public.lesson_sections for all using (auth.role() = 'service_role');

drop policy if exists "Public can read exercise prompts" on public.exercises;
create policy "Public can read exercise prompts" on public.exercises for select using (true);
drop policy if exists "Service role manages exercises" on public.exercises;
create policy "Service role manages exercises" on public.exercises for all using (auth.role() = 'service_role');

-- Intentionally NO public/anon select policy: this table holds the
-- correct answer. Only the service role (server-side only) can read it.
drop policy if exists "Service role manages exercise options" on public.exercise_options;
create policy "Service role manages exercise options" on public.exercise_options for all using (auth.role() = 'service_role');

-- Per-user tables: users see/manage only their own rows; service role manages all.
drop policy if exists "Users read own lesson progress" on public.user_lesson_progress;
create policy "Users read own lesson progress" on public.user_lesson_progress for select using (auth.uid() = user_id);
drop policy if exists "Service role manages lesson progress" on public.user_lesson_progress;
create policy "Service role manages lesson progress" on public.user_lesson_progress for all using (auth.role() = 'service_role');

drop policy if exists "Users read own exercise attempts" on public.user_exercise_attempts;
create policy "Users read own exercise attempts" on public.user_exercise_attempts for select using (auth.uid() = user_id);
drop policy if exists "Service role manages exercise attempts" on public.user_exercise_attempts;
create policy "Service role manages exercise attempts" on public.user_exercise_attempts for all using (auth.role() = 'service_role');

drop policy if exists "Users read own goals" on public.user_goals;
create policy "Users read own goals" on public.user_goals for select using (auth.uid() = user_id);
drop policy if exists "Users upsert own goals" on public.user_goals;
create policy "Users upsert own goals" on public.user_goals for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own goals" on public.user_goals;
create policy "Users update own goals" on public.user_goals for update using (auth.uid() = user_id);
drop policy if exists "Service role manages goals" on public.user_goals;
create policy "Service role manages goals" on public.user_goals for all using (auth.role() = 'service_role');

drop policy if exists "Users read own streak" on public.user_streaks;
create policy "Users read own streak" on public.user_streaks for select using (auth.uid() = user_id);
drop policy if exists "Service role manages streaks" on public.user_streaks;
create policy "Service role manages streaks" on public.user_streaks for all using (auth.role() = 'service_role');

drop policy if exists "Users read own xp events" on public.user_xp_events;
create policy "Users read own xp events" on public.user_xp_events for select using (auth.uid() = user_id);
drop policy if exists "Service role manages xp events" on public.user_xp_events;
create policy "Service role manages xp events" on public.user_xp_events for all using (auth.role() = 'service_role');

drop policy if exists "Users read own ai conversations" on public.ai_conversations;
create policy "Users read own ai conversations" on public.ai_conversations for select using (auth.uid() = user_id);
drop policy if exists "Service role manages ai conversations" on public.ai_conversations;
create policy "Service role manages ai conversations" on public.ai_conversations for all using (auth.role() = 'service_role');

-- updated_at triggers, mirroring the pattern already used for public.lessons.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_courses_updated_at on public.courses;
create trigger trg_courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

drop trigger if exists trg_course_lessons_updated_at on public.course_lessons;
create trigger trg_course_lessons_updated_at before update on public.course_lessons
  for each row execute function public.set_updated_at();

drop trigger if exists trg_user_lesson_progress_updated_at on public.user_lesson_progress;
create trigger trg_user_lesson_progress_updated_at before update on public.user_lesson_progress
  for each row execute function public.set_updated_at();
