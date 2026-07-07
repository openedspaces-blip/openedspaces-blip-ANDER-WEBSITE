-- ANDERGO Supabase Database Schema
-- Execute this SQL in the Supabase SQL editor.
-- It is safe to run more than once.

-- ==============================================================================
-- PROFILES TABLE
-- ==============================================================================
-- This table stores user progress and learning metadata
-- It is linked to Supabase auth.users table via foreign key

CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary key: UUID from Supabase auth.users
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User Information
  full_name text,
  email text,
  
  -- Learning Progress
  progress integer DEFAULT 0 CHECK (progress >= 0),
  streak integer DEFAULT 0 CHECK (streak >= 0),
  next_lesson text DEFAULT 'Listening A1',
  
  -- Timestamps
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Keep table ownership/API access compatible with Supabase defaults.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Enable Row Level Security (RLS) for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Recreate policies safely so this file can be run more than once.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update profiles" ON public.profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy 2b: Users can insert their own profile if the server trigger did not.
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 3: Service role can read all profiles (for admin and server-side operations)
CREATE POLICY "Service role can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Policy 4: Service role can insert profiles
CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy 5: Service role can update profiles
CREATE POLICY "Service role can update profiles"
  ON public.profiles
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- ==============================================================================
-- INDEXES (Performance optimization)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- ==============================================================================
-- TRIGGERS (Optional: Keep updated_at timestamp current)
-- ==============================================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- AUTH USER PROFILE SYNC
-- ==============================================================================
-- Automatically creates a public profile whenever Supabase Auth creates a user.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    progress,
    streak,
    next_lesson
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), NEW.email),
    NEW.email,
    0,
    0,
    'Listening A1'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for users that already existed before this schema was run.
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  progress,
  streak,
  next_lesson
)
SELECT
  users.id,
  COALESCE(users.raw_user_meta_data->>'name', split_part(users.email, '@', 1), users.email),
  users.email,
  0,
  0,
  'Listening A1'
FROM auth.users AS users
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
  updated_at = timezone('utc'::text, now());

-- ==============================================================================
-- NOTES
-- ==============================================================================
-- 1. The profiles table is automatically synced with auth.users via CASCADE DELETE
-- 2. RLS policies ensure users can only see/modify their own data
-- 3. Service role key can bypass RLS for server-side operations
-- 4. updated_at timestamp is automatically maintained by trigger
-- 5. A profile row is created automatically when a Supabase Auth user is created
