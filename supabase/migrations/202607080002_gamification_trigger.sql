-- =========================================================
-- 202607080002_gamification_trigger.sql
-- =========================================================
-- Updates handle_new_user() to explicitly set the gamification columns
-- (xp, level, badges, longest_streak, access_tier) added by
-- 202607080001_gamification.sql. Must run after that migration - the
-- columns referenced below don't exist until it has applied.
--
-- No backfill is needed for existing rows: 202607080001 added these
-- columns with constant DEFAULTs, which Postgres applies to all
-- existing rows at ALTER TABLE time.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
