-- =========================================================
-- 202607080001_gamification.sql
-- =========================================================
-- Adds the columns the new gamification engine needs to public.profiles.
-- Safe to run more than once. Run this AFTER SUPABASE_RUN_THIS.sql.

alter table public.profiles
  add column if not exists xp integer not null default 0 check (xp >= 0),
  add column if not exists level integer not null default 1 check (level >= 1),
  add column if not exists badges jsonb not null default '[]'::jsonb,
  add column if not exists longest_streak integer not null default 0 check (longest_streak >= 0),
  add column if not exists last_active_date date,
  add column if not exists access_tier text not null default 'free' check (access_tier in ('free', 'premium'));

create index if not exists idx_profiles_xp on public.profiles(xp);

comment on column public.profiles.xp is 'Total experience points earned across all lessons.';
comment on column public.profiles.level is 'Derived from xp (100 xp per level); kept as a column for fast reads.';
comment on column public.profiles.badges is 'Array of unlocked badge ids, e.g. ["first-lesson", "streak-7"].';
comment on column public.profiles.access_tier is 'free until the user completes the (future) premium purchase flow.';
