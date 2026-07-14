-- =========================================================
-- 202607140001_bridge_language.sql
-- =========================================================
-- Adds the learner's bridge language (the language they already speak,
-- used for explanations/hints) alongside the existing preferred_language
-- (the target/learning language, unchanged in meaning). Safe to run more
-- than once.

alter table public.profiles
  add column if not exists bridge_language text not null default 'spanish';

alter table public.profiles
  drop constraint if exists profiles_bridge_language_check;
alter table public.profiles
  add constraint profiles_bridge_language_check
  check (bridge_language in ('english', 'spanish', 'french', 'italian', 'german'));

alter table public.profiles
  drop constraint if exists profiles_bridge_not_target_check;
alter table public.profiles
  add constraint profiles_bridge_not_target_check
  check (bridge_language <> preferred_language);

comment on column public.profiles.bridge_language is
  'Language the learner already speaks, used for explanations/hints (must differ from preferred_language, the target language being learned).';

-- No RLS/policy changes needed: plain column on public.profiles, already
-- covered by the existing owner-only select/insert/update policies from
-- 202607020001_andergo_profiles.sql (auth.uid() = id).
