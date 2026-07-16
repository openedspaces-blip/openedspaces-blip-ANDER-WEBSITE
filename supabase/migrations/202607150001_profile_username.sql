-- =========================================================
-- 202607150001_profile_username.sql
-- =========================================================
-- Adds a username identity to public.profiles, on top of the existing
-- email-based Supabase Auth accounts. Safe to run more than once and safe
-- to run against a table that already has real users:
--   - username / username_normalized / display_name are all NULLable -
--     no existing row is touched, no NOT NULL is enforced yet.
--   - the unique index is PARTIAL (`where username_normalized is not
--     null`), so any number of existing NULL usernames can coexist.
--   - handle_new_user() keeps every column the previous version
--     (202607080002_gamification_trigger.sql) set, it only adds username
--     handling on top.

alter table public.profiles
  add column if not exists username text,
  add column if not exists username_normalized text,
  add column if not exists display_name text;

-- Partial unique index: only rows that HAVE chosen a username are
-- compared, so the many existing accounts without one never collide.
create unique index if not exists idx_profiles_username_normalized
  on public.profiles (username_normalized)
  where username_normalized is not null;

-- ==============================================================================
-- AUTH USER PROFILE SYNC - extended for username
-- ==============================================================================
-- Reads username (as typed, original case) from
-- auth.users.raw_user_meta_data ->> 'username', set by
-- authService.register()'s supabase.auth.signUp({ options: { data: { username } } }).
-- Comparison/uniqueness always happens on the lower-cased
-- username_normalized column; the original-case username is kept only for
-- display.
--
-- Race safety: two signUps for the same username landing here at nearly
-- the same time will have one INSERT succeed and the other raise
-- unique_violation on idx_profiles_username_normalized. Supabase explicitly
-- warns that a failing trigger on auth.users can block ALL subsequent
-- signups (the trigger runs in the same transaction as the auth.users
-- insert) - so that violation is caught here and the profile is created
-- WITHOUT a username instead of aborting. The student who lost the race
-- still gets a working account; profiles.username stays null for them,
-- which is exactly the signal the "create your username" onboarding
-- (post-login, for accounts with a null username) checks for.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  incoming_username text := nullif(trim(NEW.raw_user_meta_data->>'username'), '');
  incoming_username_normalized text := lower(nullif(trim(NEW.raw_user_meta_data->>'username'), ''));
  incoming_display_name text := coalesce(
    nullif(trim(NEW.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(NEW.raw_user_meta_data->>'username'), '')
  );
BEGIN
  BEGIN
    INSERT INTO public.profiles (
      id,
      full_name,
      email,
      username,
      username_normalized,
      display_name,
      progress,
      streak,
      next_lesson,
      xp,
      level,
      badges,
      longest_streak,
      access_tier
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), NEW.email),
      NEW.email,
      incoming_username,
      incoming_username_normalized,
      incoming_display_name,
      0,
      0,
      'Listening A1',
      0,
      1,
      '[]'::jsonb,
      0,
      'free'
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      username = COALESCE(public.profiles.username, EXCLUDED.username),
      username_normalized = COALESCE(public.profiles.username_normalized, EXCLUDED.username_normalized),
      display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
      updated_at = timezone('utc'::text, now());
  EXCEPTION WHEN unique_violation THEN
    -- Username collided with another account created in the same instant.
    -- Never let this block the auth.users insert: create the profile
    -- without a username instead. The pre-registration availability check
    -- (GET /api/auth/username-available) makes this rare in practice; this
    -- is the fallback for the rare case it still happens.
    INSERT INTO public.profiles (
      id,
      full_name,
      email,
      progress,
      streak,
      next_lesson,
      xp,
      level,
      badges,
      longest_streak,
      access_tier
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), NEW.email),
      NEW.email,
      0,
      0,
      'Listening A1',
      0,
      1,
      '[]'::jsonb,
      0,
      'free'
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      updated_at = timezone('utc'::text, now());
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- NOTES
-- 1. No backfill/NOT NULL here on purpose - existing accounts keep
--    logging in with email+password and are prompted to create a
--    username after login (frontend checks profiles.username === null).
-- 2. username -> email resolution for login-by-username must only ever
--    happen server-side via getSupabaseAdmin() (service role, bypasses
--    RLS) - there is deliberately no public/anon SELECT policy added on
--    profiles for username lookups.
-- 3. RLS policies on profiles are unchanged by this migration (existing
--    "own row only" policies already cover the new columns).
