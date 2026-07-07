-- ANDERGO Free English Lessons Schema
-- Migration: 202601010001_andergo_lessons
-- Style modeled on lingua.com: vocab first, then a short dialogue, then graded exercises.

create extension if not exists "pgcrypto";

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  level text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  skill text not null check (skill in ('listening','reading','writing','speaking','grammar','vocabulary')),
  title text not null,
  description text,
  order_index integer not null default 0,
  is_free boolean not null default true,
  estimated_minutes integer default 10,
  content_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lessons_level_skill on public.lessons(level, skill);
create index if not exists idx_lessons_order on public.lessons(order_index);
create index if not exists idx_lessons_free on public.lessons(is_free) where is_free = true;

-- updated_at trigger (mirrors public.profiles pattern)
create or replace function public.set_lessons_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_lessons_updated_at on public.lessons;
create trigger trg_lessons_updated_at
  before update on public.lessons
  for each row execute function public.set_lessons_updated_at();

alter table public.lessons enable row level security;

-- anyone can read free lessons; service_role bypasses RLS for admin writes
drop policy if exists "Free lessons are publicly readable" on public.lessons;
create policy "Free lessons are publicly readable"
  on public.lessons for select
  using (is_free = true);

drop policy if exists "Service role can manage lessons" on public.lessons;
create policy "Service role can manage lessons"
  on public.lessons for all
  to service_role
  using (true)
  with check (true);

-- Track which users completed which lessons (one row per user+lesson)
create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  score integer not null default 0 check (score between 0 and 100),
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists idx_lesson_completions_user on public.lesson_completions(user_id);
create index if not exists idx_lesson_completions_lesson on public.lesson_completions(lesson_id);

alter table public.lesson_completions enable row level security;

drop policy if exists "Users see their own completions" on public.lesson_completions;
create policy "Users see their own completions"
  on public.lesson_completions for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert their own completions" on public.lesson_completions;
create policy "Users insert their own completions"
  on public.lesson_completions for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Service role can manage completions" on public.lesson_completions;
create policy "Service role can manage completions"
  on public.lesson_completions for all
  to service_role
  using (true)
  with check (true);
