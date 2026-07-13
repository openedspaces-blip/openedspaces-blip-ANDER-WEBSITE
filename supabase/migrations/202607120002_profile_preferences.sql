-- =========================================================
-- 202607120002_profile_preferences.sql
-- =========================================================
-- Persists the learner's active target language and CEFR level on
-- public.profiles, so learningPathState.language/.level survive a reload
-- or a new session instead of always resetting to english/A1.
-- Safe to run more than once.

alter table public.profiles
  add column if not exists preferred_language text not null default 'english',
  add column if not exists preferred_level text not null default 'A1';

alter table public.profiles
  drop constraint if exists profiles_preferred_language_check;
alter table public.profiles
  add constraint profiles_preferred_language_check
  check (preferred_language in ('english', 'spanish', 'french', 'italian', 'german'));

alter table public.profiles
  drop constraint if exists profiles_preferred_level_check;
alter table public.profiles
  add constraint profiles_preferred_level_check
  check (preferred_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

comment on column public.profiles.preferred_language is 'Last target language the learner had active (english/spanish/french/italian/german).';
comment on column public.profiles.preferred_level is 'Last CEFR level the learner had active (A1-C2).';

-- No RLS/policy changes needed: these are plain columns on public.profiles,
-- already covered by the existing "Users can view/update own profile"
-- policies from 202607020001_andergo_profiles.sql (auth.uid() = id).
