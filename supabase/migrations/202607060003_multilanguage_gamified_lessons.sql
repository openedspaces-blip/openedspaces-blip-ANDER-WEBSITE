-- ANDERGO Multilanguage Gamified Lessons
-- Migration: 202607060003_multilanguage_gamified_lessons
-- Adds language support and gamification metadata to lessons.

alter table public.lessons
  add column if not exists target_language text not null default 'english'
    check (target_language in ('english','spanish','french','italian','german','ai')),
  add column if not exists subtitle text,
  add column if not exists unit_title text,
  add column if not exists topic text,
  add column if not exists learning_goal text,
  add column if not exists can_do_statement text,
  add column if not exists is_published boolean not null default true,
  add column if not exists xp_reward integer not null default 20 check (xp_reward >= 0),
  add column if not exists cover_image_url text,
  add column if not exists audio_url text,
  add column if not exists video_url text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists keywords text[] not null default '{}';

-- The first migration allowed only six skills. Add mixed if it is not already present.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'lessons_skill_check'
      and conrelid = 'public.lessons'::regclass
  ) then
    alter table public.lessons drop constraint lessons_skill_check;
  end if;
end $$;

alter table public.lessons
  add constraint lessons_skill_check
  check (skill in ('listening','reading','writing','speaking','grammar','vocabulary','mixed'));

create index if not exists idx_lessons_target_language_level_skill
  on public.lessons(target_language, level, skill, order_index);

create index if not exists idx_lessons_published_free_language
  on public.lessons(target_language, is_published, is_free)
  where is_published = true and is_free = true;

create index if not exists idx_lessons_tags_gin
  on public.lessons using gin(tags);

create index if not exists idx_lessons_content_gin
  on public.lessons using gin(content_json);

-- More complete progress table, separate from the older lesson_completions table.
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  best_score integer not null default 0 check (best_score between 0 and 100),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  attempts_count integer not null default 0 check (attempts_count >= 0),
  started_at timestamptz,
  last_opened_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists idx_lesson_progress_user_status
  on public.lesson_progress(user_id, status);

create index if not exists idx_lesson_progress_lesson
  on public.lesson_progress(lesson_id);

alter table public.lesson_progress enable row level security;

drop policy if exists "Users can read their own lesson progress" on public.lesson_progress;
create policy "Users can read their own lesson progress"
  on public.lesson_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own lesson progress" on public.lesson_progress;
create policy "Users can insert their own lesson progress"
  on public.lesson_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own lesson progress" on public.lesson_progress;
create policy "Users can update their own lesson progress"
  on public.lesson_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Service role can manage lesson progress" on public.lesson_progress;
create policy "Service role can manage lesson progress"
  on public.lesson_progress for all
  to service_role
  using (true)
  with check (true);

-- Better public read policy: only published free lessons are visible to browser clients.
drop policy if exists "Free lessons are publicly readable" on public.lessons;
drop policy if exists "Public can read free published lessons" on public.lessons;
create policy "Public can read free published lessons"
  on public.lessons for select
  to anon, authenticated
  using (is_free = true and is_published = true);

grant select on public.lessons to anon, authenticated;
grant select, insert, update on public.lesson_progress to authenticated;
grant select, insert, update, delete on public.lessons to service_role;
grant select, insert, update, delete on public.lesson_progress to service_role;
