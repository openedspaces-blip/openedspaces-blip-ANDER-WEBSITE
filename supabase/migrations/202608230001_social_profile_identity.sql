-- =========================================================
-- 202608230001_social_profile_identity.sql
-- =========================================================
-- Google and Facebook do not expose the display name under exactly the
-- same metadata key. Keep the profile identity independent from the OAuth
-- provider while preserving the user's existing learning data.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  incoming_username text := nullif(trim(NEW.raw_user_meta_data->>'username'), '');
  incoming_username_normalized text := lower(nullif(trim(NEW.raw_user_meta_data->>'username'), ''));
  incoming_display_name text := coalesce(
    nullif(trim(NEW.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(NEW.raw_user_meta_data->>'username'), '')
  );
  incoming_full_name text := coalesce(
    nullif(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(NEW.raw_user_meta_data->>'name'), ''),
    nullif(trim(NEW.raw_user_meta_data->>'preferred_username'), ''),
    nullif(trim(NEW.raw_user_meta_data->>'nickname'), ''),
    nullif(trim(NEW.email), '')
  );
BEGIN
  BEGIN
    INSERT INTO public.profiles (
      id, full_name, email, username, username_normalized, display_name,
      progress, streak, next_lesson, xp, level, badges, longest_streak, access_tier
    ) VALUES (
      NEW.id, incoming_full_name, NEW.email, incoming_username,
      incoming_username_normalized, incoming_display_name,
      0, 0, 'Listening A1', 0, 1, '[]'::jsonb, 0, 'free'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, public.profiles.email),
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      username = COALESCE(public.profiles.username, EXCLUDED.username),
      username_normalized = COALESCE(public.profiles.username_normalized, EXCLUDED.username_normalized),
      display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
      updated_at = timezone('utc'::text, now());
  EXCEPTION WHEN unique_violation THEN
    -- A simultaneous username collision must not prevent OAuth account creation.
    INSERT INTO public.profiles (
      id, full_name, email, progress, streak, next_lesson, xp, level, badges, longest_streak, access_tier
    ) VALUES (
      NEW.id, incoming_full_name, NEW.email,
      0, 0, 'Listening A1', 0, 1, '[]'::jsonb, 0, 'free'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, public.profiles.email),
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      updated_at = timezone('utc'::text, now());
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Bring existing OAuth accounts in line without replacing a chosen name or
-- resetting progress, streaks, XP, badges, goals, or lesson attempts.
UPDATE public.profiles AS profile
SET
  email = COALESCE(profile.email, users.email),
  full_name = COALESCE(
    profile.full_name,
    nullif(trim(users.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(users.raw_user_meta_data->>'name'), ''),
    nullif(trim(users.raw_user_meta_data->>'preferred_username'), ''),
    nullif(trim(users.raw_user_meta_data->>'nickname'), ''),
    users.email
  ),
  updated_at = timezone('utc'::text, now())
FROM auth.users AS users
WHERE profile.id = users.id
  AND (
    profile.email IS NULL
    OR profile.full_name IS NULL
    OR btrim(profile.full_name) = ''
  );
