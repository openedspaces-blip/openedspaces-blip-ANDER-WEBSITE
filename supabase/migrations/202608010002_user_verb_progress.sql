create table if not exists public.user_verb_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  language_code text not null
    check (language_code in ('english', 'french', 'spanish')),
  verb_id text not null check (char_length(verb_id) between 1 and 160),
  mastery text not null default 'new'
    check (mastery in ('new', 'learning', 'practicing', 'mastered')),
  favorite boolean not null default false,
  attempts_count integer not null default 0 check (attempts_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  incorrect_count integer not null default 0 check (incorrect_count >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  last_practiced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, language_code, verb_id)
);

create index if not exists idx_user_verb_progress_user_language
  on public.user_verb_progress(user_id, language_code);

alter table public.user_verb_progress enable row level security;

drop policy if exists "Users can read their own verb progress"
  on public.user_verb_progress;
create policy "Users can read their own verb progress"
  on public.user_verb_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own verb progress"
  on public.user_verb_progress;
create policy "Users can insert their own verb progress"
  on public.user_verb_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own verb progress"
  on public.user_verb_progress;
create policy "Users can update their own verb progress"
  on public.user_verb_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own verb progress"
  on public.user_verb_progress;
create policy "Users can delete their own verb progress"
  on public.user_verb_progress
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.user_verb_progress to authenticated;
grant select, insert, update, delete on public.user_verb_progress to service_role;
