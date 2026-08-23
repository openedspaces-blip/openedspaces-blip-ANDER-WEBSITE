-- =========================================================
-- 202608230002_stable_social_usernames.sql
-- =========================================================
-- A social account receives one permanent ANDERGO username at creation.
-- Subscription access_tier is deliberately not used here: changing from
-- Free to Premium must never rename a learner.

CREATE OR REPLACE FUNCTION public.social_username_base(full_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT left(
    CASE
      WHEN length(first_part) >= 4 THEN first_part
      WHEN length(slug) >= 4 THEN slug
      ELSE first_part || '-user'
    END,
    20
  )
  FROM (
    SELECT
      split_part(slug, '-', 1) AS first_part,
      slug
    FROM (
      SELECT trim(both '-' FROM regexp_replace(
        translate(lower(coalesce(full_name, 'usuario')), 'áéíóúüñàèìòùäëïöüç', 'aeiouunaeiouaeiouc'),
        '[^a-z0-9]+', '-', 'g'
      )) AS slug
    ) AS normalized
  ) AS parts;
$$;

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
  generated_base text;
  candidate text;
  attempt integer;
BEGIN
  -- Password signups keep their chosen username. OAuth accounts have none,
  -- so derive a readable, stable base from the first name only once.
  generated_base := public.social_username_base(incoming_full_name);
  IF generated_base IN ('admin', 'administrator', 'root', 'support', 'andergo', 'tutor', 'system', 'moderator', 'api', 'null', 'undefined') THEN
    generated_base := generated_base || '-user';
  END IF;

  FOR attempt IN 0..99 LOOP
    candidate := CASE
      WHEN incoming_username IS NOT NULL THEN incoming_username
      WHEN attempt = 0 THEN generated_base
      ELSE left(generated_base, 20 - length(attempt::text) - 1) || '-' || attempt::text
    END;

    BEGIN
      INSERT INTO public.profiles (
        id, full_name, email, username, username_normalized, display_name,
        progress, streak, next_lesson, xp, level, badges, longest_streak, access_tier
      ) VALUES (
        NEW.id, incoming_full_name, NEW.email, candidate, lower(candidate),
        coalesce(incoming_display_name, candidate),
        0, 0, 'Listening A1', 0, 1, '[]'::jsonb, 0, 'free'
      )
      ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        username = COALESCE(public.profiles.username, EXCLUDED.username),
        username_normalized = COALESCE(public.profiles.username_normalized, EXCLUDED.username_normalized),
        display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
        updated_at = timezone('utc'::text, now());
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      -- A manual username collision follows the existing onboarding path;
      -- a generated social username simply tries Juan-2, Juan-3, etc.
      IF incoming_username IS NOT NULL THEN EXIT; END IF;
    END;
  END LOOP;

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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Give existing OAuth profiles that do not yet have a username the same
-- stable convention. Existing custom usernames and all learning data remain
-- untouched.
DO $$
DECLARE
  profile_row record;
  generated_base text;
  candidate text;
  attempt integer;
BEGIN
  FOR profile_row IN
    SELECT profile.id, profile.full_name, profile.email
    FROM public.profiles AS profile
    JOIN auth.users AS auth_user ON auth_user.id = profile.id
    WHERE (profile.username IS NULL OR btrim(profile.username) = '')
      AND auth_user.raw_app_meta_data->>'provider' IN ('google', 'facebook')
    ORDER BY profile.created_at, profile.id
  LOOP
    generated_base := public.social_username_base(coalesce(profile_row.full_name, profile_row.email));
    IF generated_base IN ('admin', 'administrator', 'root', 'support', 'andergo', 'tutor', 'system', 'moderator', 'api', 'null', 'undefined') THEN
      generated_base := generated_base || '-user';
    END IF;
    FOR attempt IN 0..99 LOOP
      candidate := CASE
        WHEN attempt = 0 THEN generated_base
        ELSE left(generated_base, 20 - length(attempt::text) - 1) || '-' || attempt::text
      END;
      BEGIN
        UPDATE public.profiles
        SET username = candidate,
            username_normalized = lower(candidate),
            display_name = coalesce(display_name, candidate)
        WHERE id = profile_row.id;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        -- Try the next numeric suffix without changing the profile's name.
      END;
    END LOOP;
  END LOOP;
END;
$$;
