create table if not exists public.user_unit_verb_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id uuid not null references public.course_units(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  best_score integer not null default 0 check (best_score between 0 and 100),
  attempts_count integer not null default 0 check (attempts_count >= 0),
  last_score integer not null default 0 check (last_score between 0 and 100),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, unit_id)
);

create index if not exists idx_user_unit_verb_progress_user
  on public.user_unit_verb_progress(user_id);

create index if not exists idx_user_unit_verb_progress_unit
  on public.user_unit_verb_progress(unit_id);

alter table public.user_unit_verb_progress enable row level security;

drop policy if exists "Users can read their own unit verb progress"
  on public.user_unit_verb_progress;
create policy "Users can read their own unit verb progress"
  on public.user_unit_verb_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own unit verb progress"
  on public.user_unit_verb_progress;
create policy "Users can insert their own unit verb progress"
  on public.user_unit_verb_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own unit verb progress"
  on public.user_unit_verb_progress;
create policy "Users can update their own unit verb progress"
  on public.user_unit_verb_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.user_unit_verb_progress to authenticated;
grant select, insert, update, delete on public.user_unit_verb_progress to service_role;
