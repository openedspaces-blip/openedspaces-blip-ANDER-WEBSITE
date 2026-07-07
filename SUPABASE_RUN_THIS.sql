
-- =========================================================
-- 202601010001_andergo_lessons.sql
-- =========================================================
-- ANDERGO Free English Lessons Schema
-- Migration: 202601010001_andergo_lessons
-- Style modeled on lingua.com: vocab first, then a short dialogue, then graded exercises.

create extension if not exists "pgcrypto";

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  level text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  skill text not null check (skill in ('listening','reading','writing','speaking','grammar','vocabulary')),
  title text not null,
  description text,
  order_index integer not null default 0,
  is_free boolean not null default true,
  estimated_minutes integer default 10,
  content_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lessons_level_skill on public.lessons(level, skill);
create index if not exists idx_lessons_order on public.lessons(order_index);
create index if not exists idx_lessons_free on public.lessons(is_free) where is_free = true;

-- updated_at trigger (mirrors public.profiles pattern)
create or replace function public.set_lessons_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_lessons_updated_at on public.lessons;
create trigger trg_lessons_updated_at
  before update on public.lessons
  for each row execute function public.set_lessons_updated_at();

alter table public.lessons enable row level security;

-- anyone can read free lessons; service_role bypasses RLS for admin writes
drop policy if exists "Free lessons are publicly readable" on public.lessons;
create policy "Free lessons are publicly readable"
  on public.lessons for select
  using (is_free = true);

drop policy if exists "Service role can manage lessons" on public.lessons;
create policy "Service role can manage lessons"
  on public.lessons for all
  to service_role
  using (true)
  with check (true);

-- Track which users completed which lessons (one row per user+lesson)
create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  score integer not null default 0 check (score between 0 and 100),
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists idx_lesson_completions_user on public.lesson_completions(user_id);
create index if not exists idx_lesson_completions_lesson on public.lesson_completions(lesson_id);

alter table public.lesson_completions enable row level security;

drop policy if exists "Users see their own completions" on public.lesson_completions;
create policy "Users see their own completions"
  on public.lesson_completions for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert their own completions" on public.lesson_completions;
create policy "Users insert their own completions"
  on public.lesson_completions for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Service role can manage completions" on public.lesson_completions;
create policy "Service role can manage completions"
  on public.lesson_completions for all
  to service_role
  using (true)
  with check (true);


-- =========================================================
-- 202607020001_andergo_profiles.sql
-- =========================================================
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


-- =========================================================
-- 202607060003_multilanguage_gamified_lessons.sql
-- =========================================================
-- ANDERGO Multilanguage Gamified Lessons
-- Migration: 202607060003_multilanguage_gamified_lessons
-- Adds language support and gamification metadata to lessons.

alter table public.lessons
  add column if not exists target_language text not null default 'english'
    check (target_language in ('english','spanish','french','italian','german','ai')),
  add column if not exists subtitle text,
  add column if not exists unit_title text,
  add column if not exists topic text,
  add column if not exists learning_goal text,
  add column if not exists can_do_statement text,
  add column if not exists is_published boolean not null default true,
  add column if not exists xp_reward integer not null default 20 check (xp_reward >= 0),
  add column if not exists cover_image_url text,
  add column if not exists audio_url text,
  add column if not exists video_url text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists keywords text[] not null default '{}';

-- The first migration allowed only six skills. Add mixed if it is not already present.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'lessons_skill_check'
      and conrelid = 'public.lessons'::regclass
  ) then
    alter table public.lessons drop constraint lessons_skill_check;
  end if;
end $$;

alter table public.lessons
  add constraint lessons_skill_check
  check (skill in ('listening','reading','writing','speaking','grammar','vocabulary','mixed'));

create index if not exists idx_lessons_target_language_level_skill
  on public.lessons(target_language, level, skill, order_index);

create index if not exists idx_lessons_published_free_language
  on public.lessons(target_language, is_published, is_free)
  where is_published = true and is_free = true;

create index if not exists idx_lessons_tags_gin
  on public.lessons using gin(tags);

create index if not exists idx_lessons_content_gin
  on public.lessons using gin(content_json);

-- More complete progress table, separate from the older lesson_completions table.
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  best_score integer not null default 0 check (best_score between 0 and 100),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  attempts_count integer not null default 0 check (attempts_count >= 0),
  started_at timestamptz,
  last_opened_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists idx_lesson_progress_user_status
  on public.lesson_progress(user_id, status);

create index if not exists idx_lesson_progress_lesson
  on public.lesson_progress(lesson_id);

alter table public.lesson_progress enable row level security;

drop policy if exists "Users can read their own lesson progress" on public.lesson_progress;
create policy "Users can read their own lesson progress"
  on public.lesson_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own lesson progress" on public.lesson_progress;
create policy "Users can insert their own lesson progress"
  on public.lesson_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own lesson progress" on public.lesson_progress;
create policy "Users can update their own lesson progress"
  on public.lesson_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Service role can manage lesson progress" on public.lesson_progress;
create policy "Service role can manage lesson progress"
  on public.lesson_progress for all
  to service_role
  using (true)
  with check (true);

-- Better public read policy: only published free lessons are visible to browser clients.
drop policy if exists "Free lessons are publicly readable" on public.lessons;
drop policy if exists "Public can read free published lessons" on public.lessons;
create policy "Public can read free published lessons"
  on public.lessons for select
  to anon, authenticated
  using (is_free = true and is_published = true);

grant select on public.lessons to anon, authenticated;
grant select, insert, update on public.lesson_progress to authenticated;
grant select, insert, update, delete on public.lessons to service_role;
grant select, insert, update, delete on public.lesson_progress to service_role;


-- =========================================================
-- 202607060004_seed_multilanguage_lessons.sql
-- =========================================================
-- ANDERGO Multilanguage Lesson Seeds
-- Migration: 202607060004_seed_multilanguage_lessons
-- Safe to run multiple times. Uses ON CONFLICT(slug) DO UPDATE.

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-a1-listening',
  'english',
  'A1',
  'listening',
  'English A1 · Listening Lab',
  'Survival English: Puedo saludar, presentarme y pedir información básica.',
  10,
  true,
  true,
  10,
  20,
  array['english', 'a1', 'listening'],
  array['Hello', 'Name', 'Teacher', 'Friend'],
  '{"language":"English","language_key":"english","level_title":"Survival English","intro":"Puedo saludar, presentarme y pedir información básica.","mission":"Preséntate en 4 frases usando my name is, I am, I like.","grammar":"Verb to be, pronouns, articles, plurals, present simple.","phrases":["My name is...","I am from...","Nice to meet you.","Can you repeat, please?"],"vocabulary":[{"word":"Hello","translation":"Hola","example":"Hello, my name is Ana."},{"word":"Name","translation":"Nombre","example":"My name is Luis."},{"word":"Teacher","translation":"Profesor/a","example":"My teacher is kind."},{"word":"Friend","translation":"Amigo/a","example":"She is my friend."},{"word":"Family","translation":"Familia","example":"My family is small."},{"word":"Good morning","translation":"Buenos días","example":"Good morning, class."}],"dialogue":[{"speaker":"Tutor","line":"My name is...","translation":"Frase modelo"},{"speaker":"Student","line":"I am from...","translation":"Respuesta guiada"}],"reading":{"text":"Sara is a student. She lives in Santo Domingo. Every morning, she says hello to her teacher and practices English with a friend.","questions":["Where does Sara live?","Who does she say hello to?","What does she practice?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hello\"?","options":["Hola","Nombre","Profesor/a","Amigo/a"],"answer":0},{"type":"writing","prompt":"Preséntate en 4 frases usando my name is, I am, I like.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: My name is...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-a1-speaking',
  'english',
  'A1',
  'speaking',
  'English A1 · Speaking Mission',
  'Survival English: Puedo saludar, presentarme y pedir información básica.',
  20,
  true,
  true,
  10,
  20,
  array['english', 'a1', 'speaking'],
  array['Hello', 'Name', 'Teacher', 'Friend'],
  '{"language":"English","language_key":"english","level_title":"Survival English","intro":"Puedo saludar, presentarme y pedir información básica.","mission":"Preséntate en 4 frases usando my name is, I am, I like.","grammar":"Verb to be, pronouns, articles, plurals, present simple.","phrases":["My name is...","I am from...","Nice to meet you.","Can you repeat, please?"],"vocabulary":[{"word":"Hello","translation":"Hola","example":"Hello, my name is Ana."},{"word":"Name","translation":"Nombre","example":"My name is Luis."},{"word":"Teacher","translation":"Profesor/a","example":"My teacher is kind."},{"word":"Friend","translation":"Amigo/a","example":"She is my friend."},{"word":"Family","translation":"Familia","example":"My family is small."},{"word":"Good morning","translation":"Buenos días","example":"Good morning, class."}],"dialogue":[{"speaker":"Tutor","line":"My name is...","translation":"Frase modelo"},{"speaker":"Student","line":"I am from...","translation":"Respuesta guiada"}],"reading":{"text":"Sara is a student. She lives in Santo Domingo. Every morning, she says hello to her teacher and practices English with a friend.","questions":["Where does Sara live?","Who does she say hello to?","What does she practice?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hello\"?","options":["Hola","Nombre","Profesor/a","Amigo/a"],"answer":0},{"type":"writing","prompt":"Preséntate en 4 frases usando my name is, I am, I like.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: My name is...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-a1-reading',
  'english',
  'A1',
  'reading',
  'English A1 · Reading Quest',
  'Survival English: Puedo saludar, presentarme y pedir información básica.',
  30,
  true,
  true,
  10,
  20,
  array['english', 'a1', 'reading'],
  array['Hello', 'Name', 'Teacher', 'Friend'],
  '{"language":"English","language_key":"english","level_title":"Survival English","intro":"Puedo saludar, presentarme y pedir información básica.","mission":"Preséntate en 4 frases usando my name is, I am, I like.","grammar":"Verb to be, pronouns, articles, plurals, present simple.","phrases":["My name is...","I am from...","Nice to meet you.","Can you repeat, please?"],"vocabulary":[{"word":"Hello","translation":"Hola","example":"Hello, my name is Ana."},{"word":"Name","translation":"Nombre","example":"My name is Luis."},{"word":"Teacher","translation":"Profesor/a","example":"My teacher is kind."},{"word":"Friend","translation":"Amigo/a","example":"She is my friend."},{"word":"Family","translation":"Familia","example":"My family is small."},{"word":"Good morning","translation":"Buenos días","example":"Good morning, class."}],"dialogue":[{"speaker":"Tutor","line":"My name is...","translation":"Frase modelo"},{"speaker":"Student","line":"I am from...","translation":"Respuesta guiada"}],"reading":{"text":"Sara is a student. She lives in Santo Domingo. Every morning, she says hello to her teacher and practices English with a friend.","questions":["Where does Sara live?","Who does she say hello to?","What does she practice?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hello\"?","options":["Hola","Nombre","Profesor/a","Amigo/a"],"answer":0},{"type":"writing","prompt":"Preséntate en 4 frases usando my name is, I am, I like.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: My name is...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-a1-writing',
  'english',
  'A1',
  'writing',
  'English A1 · Writing Challenge',
  'Survival English: Puedo saludar, presentarme y pedir información básica.',
  40,
  true,
  true,
  10,
  20,
  array['english', 'a1', 'writing'],
  array['Hello', 'Name', 'Teacher', 'Friend'],
  '{"language":"English","language_key":"english","level_title":"Survival English","intro":"Puedo saludar, presentarme y pedir información básica.","mission":"Preséntate en 4 frases usando my name is, I am, I like.","grammar":"Verb to be, pronouns, articles, plurals, present simple.","phrases":["My name is...","I am from...","Nice to meet you.","Can you repeat, please?"],"vocabulary":[{"word":"Hello","translation":"Hola","example":"Hello, my name is Ana."},{"word":"Name","translation":"Nombre","example":"My name is Luis."},{"word":"Teacher","translation":"Profesor/a","example":"My teacher is kind."},{"word":"Friend","translation":"Amigo/a","example":"She is my friend."},{"word":"Family","translation":"Familia","example":"My family is small."},{"word":"Good morning","translation":"Buenos días","example":"Good morning, class."}],"dialogue":[{"speaker":"Tutor","line":"My name is...","translation":"Frase modelo"},{"speaker":"Student","line":"I am from...","translation":"Respuesta guiada"}],"reading":{"text":"Sara is a student. She lives in Santo Domingo. Every morning, she says hello to her teacher and practices English with a friend.","questions":["Where does Sara live?","Who does she say hello to?","What does she practice?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hello\"?","options":["Hola","Nombre","Profesor/a","Amigo/a"],"answer":0},{"type":"writing","prompt":"Preséntate en 4 frases usando my name is, I am, I like.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: My name is...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-a1-grammar',
  'english',
  'A1',
  'grammar',
  'English A1 · Grammar Focus',
  'Survival English: Puedo saludar, presentarme y pedir información básica.',
  50,
  true,
  true,
  10,
  20,
  array['english', 'a1', 'grammar'],
  array['Hello', 'Name', 'Teacher', 'Friend'],
  '{"language":"English","language_key":"english","level_title":"Survival English","intro":"Puedo saludar, presentarme y pedir información básica.","mission":"Preséntate en 4 frases usando my name is, I am, I like.","grammar":"Verb to be, pronouns, articles, plurals, present simple.","phrases":["My name is...","I am from...","Nice to meet you.","Can you repeat, please?"],"vocabulary":[{"word":"Hello","translation":"Hola","example":"Hello, my name is Ana."},{"word":"Name","translation":"Nombre","example":"My name is Luis."},{"word":"Teacher","translation":"Profesor/a","example":"My teacher is kind."},{"word":"Friend","translation":"Amigo/a","example":"She is my friend."},{"word":"Family","translation":"Familia","example":"My family is small."},{"word":"Good morning","translation":"Buenos días","example":"Good morning, class."}],"dialogue":[{"speaker":"Tutor","line":"My name is...","translation":"Frase modelo"},{"speaker":"Student","line":"I am from...","translation":"Respuesta guiada"}],"reading":{"text":"Sara is a student. She lives in Santo Domingo. Every morning, she says hello to her teacher and practices English with a friend.","questions":["Where does Sara live?","Who does she say hello to?","What does she practice?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hello\"?","options":["Hola","Nombre","Profesor/a","Amigo/a"],"answer":0},{"type":"writing","prompt":"Preséntate en 4 frases usando my name is, I am, I like.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: My name is...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-a1-vocabulary',
  'english',
  'A1',
  'vocabulary',
  'English A1 · Vocabulary Boost',
  'Survival English: Puedo saludar, presentarme y pedir información básica.',
  60,
  true,
  true,
  10,
  10,
  array['english', 'a1', 'vocabulary'],
  array['Hello', 'Name', 'Teacher', 'Friend'],
  '{"language":"English","language_key":"english","level_title":"Survival English","intro":"Puedo saludar, presentarme y pedir información básica.","mission":"Preséntate en 4 frases usando my name is, I am, I like.","grammar":"Verb to be, pronouns, articles, plurals, present simple.","phrases":["My name is...","I am from...","Nice to meet you.","Can you repeat, please?"],"vocabulary":[{"word":"Hello","translation":"Hola","example":"Hello, my name is Ana."},{"word":"Name","translation":"Nombre","example":"My name is Luis."},{"word":"Teacher","translation":"Profesor/a","example":"My teacher is kind."},{"word":"Friend","translation":"Amigo/a","example":"She is my friend."},{"word":"Family","translation":"Familia","example":"My family is small."},{"word":"Good morning","translation":"Buenos días","example":"Good morning, class."}],"dialogue":[{"speaker":"Tutor","line":"My name is...","translation":"Frase modelo"},{"speaker":"Student","line":"I am from...","translation":"Respuesta guiada"}],"reading":{"text":"Sara is a student. She lives in Santo Domingo. Every morning, she says hello to her teacher and practices English with a friend.","questions":["Where does Sara live?","Who does she say hello to?","What does she practice?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hello\"?","options":["Hola","Nombre","Profesor/a","Amigo/a"],"answer":0},{"type":"writing","prompt":"Preséntate en 4 frases usando my name is, I am, I like.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: My name is...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-a2-listening',
  'english',
  'A2',
  'listening',
  'English A2 · Listening Lab',
  'Everyday English: Puedo hablar de rutinas, planes, compras y lugares.',
  70,
  true,
  true,
  10,
  20,
  array['english', 'a2', 'listening'],
  array['Usually', 'Market', 'Travel', 'Cheap'],
  '{"language":"English","language_key":"english","level_title":"Everyday English","intro":"Puedo hablar de rutinas, planes, compras y lugares.","mission":"Describe your daily routine in 5 short sentences.","grammar":"Past simple, present continuous, comparatives, frequency adverbs.","phrases":["I usually...","Last weekend...","How much is it?","I am going to..."],"vocabulary":[{"word":"Usually","translation":"Usualmente","example":"I usually study at night."},{"word":"Market","translation":"Mercado","example":"We go to the market."},{"word":"Travel","translation":"Viajar","example":"I want to travel."},{"word":"Cheap","translation":"Barato","example":"This bag is cheap."},{"word":"Weather","translation":"Clima","example":"The weather is sunny."},{"word":"Weekend","translation":"Fin de semana","example":"I work on weekends."}],"dialogue":[{"speaker":"Tutor","line":"I usually...","translation":"Frase modelo"},{"speaker":"Student","line":"Last weekend...","translation":"Respuesta guiada"}],"reading":{"text":"Tom usually wakes up at six. On Saturdays, he visits his grandmother and buys fruit at the market.","questions":["What time does Tom wake up?","Who does he visit?","Where does he buy fruit?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Usually\"?","options":["Usualmente","Mercado","Viajar","Barato"],"answer":0},{"type":"writing","prompt":"Describe your daily routine in 5 short sentences.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: I usually...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-a2-speaking',
  'english',
  'A2',
  'speaking',
  'English A2 · Speaking Mission',
  'Everyday English: Puedo hablar de rutinas, planes, compras y lugares.',
  80,
  true,
  true,
  10,
  20,
  array['english', 'a2', 'speaking'],
  array['Usually', 'Market', 'Travel', 'Cheap'],
  '{"language":"English","language_key":"english","level_title":"Everyday English","intro":"Puedo hablar de rutinas, planes, compras y lugares.","mission":"Describe your daily routine in 5 short sentences.","grammar":"Past simple, present continuous, comparatives, frequency adverbs.","phrases":["I usually...","Last weekend...","How much is it?","I am going to..."],"vocabulary":[{"word":"Usually","translation":"Usualmente","example":"I usually study at night."},{"word":"Market","translation":"Mercado","example":"We go to the market."},{"word":"Travel","translation":"Viajar","example":"I want to travel."},{"word":"Cheap","translation":"Barato","example":"This bag is cheap."},{"word":"Weather","translation":"Clima","example":"The weather is sunny."},{"word":"Weekend","translation":"Fin de semana","example":"I work on weekends."}],"dialogue":[{"speaker":"Tutor","line":"I usually...","translation":"Frase modelo"},{"speaker":"Student","line":"Last weekend...","translation":"Respuesta guiada"}],"reading":{"text":"Tom usually wakes up at six. On Saturdays, he visits his grandmother and buys fruit at the market.","questions":["What time does Tom wake up?","Who does he visit?","Where does he buy fruit?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Usually\"?","options":["Usualmente","Mercado","Viajar","Barato"],"answer":0},{"type":"writing","prompt":"Describe your daily routine in 5 short sentences.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: I usually...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-a2-reading',
  'english',
  'A2',
  'reading',
  'English A2 · Reading Quest',
  'Everyday English: Puedo hablar de rutinas, planes, compras y lugares.',
  90,
  true,
  true,
  10,
  20,
  array['english', 'a2', 'reading'],
  array['Usually', 'Market', 'Travel', 'Cheap'],
  '{"language":"English","language_key":"english","level_title":"Everyday English","intro":"Puedo hablar de rutinas, planes, compras y lugares.","mission":"Describe your daily routine in 5 short sentences.","grammar":"Past simple, present continuous, comparatives, frequency adverbs.","phrases":["I usually...","Last weekend...","How much is it?","I am going to..."],"vocabulary":[{"word":"Usually","translation":"Usualmente","example":"I usually study at night."},{"word":"Market","translation":"Mercado","example":"We go to the market."},{"word":"Travel","translation":"Viajar","example":"I want to travel."},{"word":"Cheap","translation":"Barato","example":"This bag is cheap."},{"word":"Weather","translation":"Clima","example":"The weather is sunny."},{"word":"Weekend","translation":"Fin de semana","example":"I work on weekends."}],"dialogue":[{"speaker":"Tutor","line":"I usually...","translation":"Frase modelo"},{"speaker":"Student","line":"Last weekend...","translation":"Respuesta guiada"}],"reading":{"text":"Tom usually wakes up at six. On Saturdays, he visits his grandmother and buys fruit at the market.","questions":["What time does Tom wake up?","Who does he visit?","Where does he buy fruit?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Usually\"?","options":["Usualmente","Mercado","Viajar","Barato"],"answer":0},{"type":"writing","prompt":"Describe your daily routine in 5 short sentences.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: I usually...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-a2-writing',
  'english',
  'A2',
  'writing',
  'English A2 · Writing Challenge',
  'Everyday English: Puedo hablar de rutinas, planes, compras y lugares.',
  100,
  true,
  true,
  10,
  20,
  array['english', 'a2', 'writing'],
  array['Usually', 'Market', 'Travel', 'Cheap'],
  '{"language":"English","language_key":"english","level_title":"Everyday English","intro":"Puedo hablar de rutinas, planes, compras y lugares.","mission":"Describe your daily routine in 5 short sentences.","grammar":"Past simple, present continuous, comparatives, frequency adverbs.","phrases":["I usually...","Last weekend...","How much is it?","I am going to..."],"vocabulary":[{"word":"Usually","translation":"Usualmente","example":"I usually study at night."},{"word":"Market","translation":"Mercado","example":"We go to the market."},{"word":"Travel","translation":"Viajar","example":"I want to travel."},{"word":"Cheap","translation":"Barato","example":"This bag is cheap."},{"word":"Weather","translation":"Clima","example":"The weather is sunny."},{"word":"Weekend","translation":"Fin de semana","example":"I work on weekends."}],"dialogue":[{"speaker":"Tutor","line":"I usually...","translation":"Frase modelo"},{"speaker":"Student","line":"Last weekend...","translation":"Respuesta guiada"}],"reading":{"text":"Tom usually wakes up at six. On Saturdays, he visits his grandmother and buys fruit at the market.","questions":["What time does Tom wake up?","Who does he visit?","Where does he buy fruit?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Usually\"?","options":["Usualmente","Mercado","Viajar","Barato"],"answer":0},{"type":"writing","prompt":"Describe your daily routine in 5 short sentences.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: I usually...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-a2-grammar',
  'english',
  'A2',
  'grammar',
  'English A2 · Grammar Focus',
  'Everyday English: Puedo hablar de rutinas, planes, compras y lugares.',
  110,
  true,
  true,
  10,
  20,
  array['english', 'a2', 'grammar'],
  array['Usually', 'Market', 'Travel', 'Cheap'],
  '{"language":"English","language_key":"english","level_title":"Everyday English","intro":"Puedo hablar de rutinas, planes, compras y lugares.","mission":"Describe your daily routine in 5 short sentences.","grammar":"Past simple, present continuous, comparatives, frequency adverbs.","phrases":["I usually...","Last weekend...","How much is it?","I am going to..."],"vocabulary":[{"word":"Usually","translation":"Usualmente","example":"I usually study at night."},{"word":"Market","translation":"Mercado","example":"We go to the market."},{"word":"Travel","translation":"Viajar","example":"I want to travel."},{"word":"Cheap","translation":"Barato","example":"This bag is cheap."},{"word":"Weather","translation":"Clima","example":"The weather is sunny."},{"word":"Weekend","translation":"Fin de semana","example":"I work on weekends."}],"dialogue":[{"speaker":"Tutor","line":"I usually...","translation":"Frase modelo"},{"speaker":"Student","line":"Last weekend...","translation":"Respuesta guiada"}],"reading":{"text":"Tom usually wakes up at six. On Saturdays, he visits his grandmother and buys fruit at the market.","questions":["What time does Tom wake up?","Who does he visit?","Where does he buy fruit?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Usually\"?","options":["Usualmente","Mercado","Viajar","Barato"],"answer":0},{"type":"writing","prompt":"Describe your daily routine in 5 short sentences.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: I usually...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-a2-vocabulary',
  'english',
  'A2',
  'vocabulary',
  'English A2 · Vocabulary Boost',
  'Everyday English: Puedo hablar de rutinas, planes, compras y lugares.',
  120,
  true,
  true,
  10,
  10,
  array['english', 'a2', 'vocabulary'],
  array['Usually', 'Market', 'Travel', 'Cheap'],
  '{"language":"English","language_key":"english","level_title":"Everyday English","intro":"Puedo hablar de rutinas, planes, compras y lugares.","mission":"Describe your daily routine in 5 short sentences.","grammar":"Past simple, present continuous, comparatives, frequency adverbs.","phrases":["I usually...","Last weekend...","How much is it?","I am going to..."],"vocabulary":[{"word":"Usually","translation":"Usualmente","example":"I usually study at night."},{"word":"Market","translation":"Mercado","example":"We go to the market."},{"word":"Travel","translation":"Viajar","example":"I want to travel."},{"word":"Cheap","translation":"Barato","example":"This bag is cheap."},{"word":"Weather","translation":"Clima","example":"The weather is sunny."},{"word":"Weekend","translation":"Fin de semana","example":"I work on weekends."}],"dialogue":[{"speaker":"Tutor","line":"I usually...","translation":"Frase modelo"},{"speaker":"Student","line":"Last weekend...","translation":"Respuesta guiada"}],"reading":{"text":"Tom usually wakes up at six. On Saturdays, he visits his grandmother and buys fruit at the market.","questions":["What time does Tom wake up?","Who does he visit?","Where does he buy fruit?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Usually\"?","options":["Usualmente","Mercado","Viajar","Barato"],"answer":0},{"type":"writing","prompt":"Describe your daily routine in 5 short sentences.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: I usually...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-b1-listening',
  'english',
  'B1',
  'listening',
  'English B1 · Listening Lab',
  'Confident Conversation: Puedo explicar experiencias, opiniones y planes con claridad.',
  130,
  false,
  true,
  15,
  20,
  array['english', 'b1', 'listening'],
  array['Opinion', 'Improve', 'Because', 'Experience'],
  '{"language":"English","language_key":"english","level_title":"Confident Conversation","intro":"Puedo explicar experiencias, opiniones y planes con claridad.","mission":"Give your opinion about learning languages and explain two reasons.","grammar":"Present perfect, modals, future forms, connectors.","phrases":["In my opinion...","One reason is...","I have learned...","I would like to..."],"vocabulary":[{"word":"Opinion","translation":"Opinión","example":"In my opinion, practice is essential."},{"word":"Improve","translation":"Mejorar","example":"I want to improve my pronunciation."},{"word":"Because","translation":"Porque","example":"I study because I need English."},{"word":"Experience","translation":"Experiencia","example":"It was a great experience."},{"word":"Goal","translation":"Meta","example":"My goal is fluency."},{"word":"Challenge","translation":"Reto","example":"This challenge is useful."}],"dialogue":[{"speaker":"Tutor","line":"In my opinion...","translation":"Frase modelo"},{"speaker":"Student","line":"One reason is...","translation":"Respuesta guiada"}],"reading":{"text":"Maya has studied English for one year. She still makes mistakes, but she feels more confident when she speaks with tourists.","questions":["How long has Maya studied English?","What still happens?","When does she feel confident?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Opinion\"?","options":["Opinión","Mejorar","Porque","Experiencia"],"answer":0},{"type":"writing","prompt":"Give your opinion about learning languages and explain two reasons.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: In my opinion...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-b1-speaking',
  'english',
  'B1',
  'speaking',
  'English B1 · Speaking Mission',
  'Confident Conversation: Puedo explicar experiencias, opiniones y planes con claridad.',
  140,
  false,
  true,
  15,
  20,
  array['english', 'b1', 'speaking'],
  array['Opinion', 'Improve', 'Because', 'Experience'],
  '{"language":"English","language_key":"english","level_title":"Confident Conversation","intro":"Puedo explicar experiencias, opiniones y planes con claridad.","mission":"Give your opinion about learning languages and explain two reasons.","grammar":"Present perfect, modals, future forms, connectors.","phrases":["In my opinion...","One reason is...","I have learned...","I would like to..."],"vocabulary":[{"word":"Opinion","translation":"Opinión","example":"In my opinion, practice is essential."},{"word":"Improve","translation":"Mejorar","example":"I want to improve my pronunciation."},{"word":"Because","translation":"Porque","example":"I study because I need English."},{"word":"Experience","translation":"Experiencia","example":"It was a great experience."},{"word":"Goal","translation":"Meta","example":"My goal is fluency."},{"word":"Challenge","translation":"Reto","example":"This challenge is useful."}],"dialogue":[{"speaker":"Tutor","line":"In my opinion...","translation":"Frase modelo"},{"speaker":"Student","line":"One reason is...","translation":"Respuesta guiada"}],"reading":{"text":"Maya has studied English for one year. She still makes mistakes, but she feels more confident when she speaks with tourists.","questions":["How long has Maya studied English?","What still happens?","When does she feel confident?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Opinion\"?","options":["Opinión","Mejorar","Porque","Experiencia"],"answer":0},{"type":"writing","prompt":"Give your opinion about learning languages and explain two reasons.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: In my opinion...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-b1-reading',
  'english',
  'B1',
  'reading',
  'English B1 · Reading Quest',
  'Confident Conversation: Puedo explicar experiencias, opiniones y planes con claridad.',
  150,
  false,
  true,
  15,
  20,
  array['english', 'b1', 'reading'],
  array['Opinion', 'Improve', 'Because', 'Experience'],
  '{"language":"English","language_key":"english","level_title":"Confident Conversation","intro":"Puedo explicar experiencias, opiniones y planes con claridad.","mission":"Give your opinion about learning languages and explain two reasons.","grammar":"Present perfect, modals, future forms, connectors.","phrases":["In my opinion...","One reason is...","I have learned...","I would like to..."],"vocabulary":[{"word":"Opinion","translation":"Opinión","example":"In my opinion, practice is essential."},{"word":"Improve","translation":"Mejorar","example":"I want to improve my pronunciation."},{"word":"Because","translation":"Porque","example":"I study because I need English."},{"word":"Experience","translation":"Experiencia","example":"It was a great experience."},{"word":"Goal","translation":"Meta","example":"My goal is fluency."},{"word":"Challenge","translation":"Reto","example":"This challenge is useful."}],"dialogue":[{"speaker":"Tutor","line":"In my opinion...","translation":"Frase modelo"},{"speaker":"Student","line":"One reason is...","translation":"Respuesta guiada"}],"reading":{"text":"Maya has studied English for one year. She still makes mistakes, but she feels more confident when she speaks with tourists.","questions":["How long has Maya studied English?","What still happens?","When does she feel confident?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Opinion\"?","options":["Opinión","Mejorar","Porque","Experiencia"],"answer":0},{"type":"writing","prompt":"Give your opinion about learning languages and explain two reasons.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: In my opinion...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-b1-writing',
  'english',
  'B1',
  'writing',
  'English B1 · Writing Challenge',
  'Confident Conversation: Puedo explicar experiencias, opiniones y planes con claridad.',
  160,
  false,
  true,
  15,
  20,
  array['english', 'b1', 'writing'],
  array['Opinion', 'Improve', 'Because', 'Experience'],
  '{"language":"English","language_key":"english","level_title":"Confident Conversation","intro":"Puedo explicar experiencias, opiniones y planes con claridad.","mission":"Give your opinion about learning languages and explain two reasons.","grammar":"Present perfect, modals, future forms, connectors.","phrases":["In my opinion...","One reason is...","I have learned...","I would like to..."],"vocabulary":[{"word":"Opinion","translation":"Opinión","example":"In my opinion, practice is essential."},{"word":"Improve","translation":"Mejorar","example":"I want to improve my pronunciation."},{"word":"Because","translation":"Porque","example":"I study because I need English."},{"word":"Experience","translation":"Experiencia","example":"It was a great experience."},{"word":"Goal","translation":"Meta","example":"My goal is fluency."},{"word":"Challenge","translation":"Reto","example":"This challenge is useful."}],"dialogue":[{"speaker":"Tutor","line":"In my opinion...","translation":"Frase modelo"},{"speaker":"Student","line":"One reason is...","translation":"Respuesta guiada"}],"reading":{"text":"Maya has studied English for one year. She still makes mistakes, but she feels more confident when she speaks with tourists.","questions":["How long has Maya studied English?","What still happens?","When does she feel confident?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Opinion\"?","options":["Opinión","Mejorar","Porque","Experiencia"],"answer":0},{"type":"writing","prompt":"Give your opinion about learning languages and explain two reasons.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: In my opinion...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-b1-grammar',
  'english',
  'B1',
  'grammar',
  'English B1 · Grammar Focus',
  'Confident Conversation: Puedo explicar experiencias, opiniones y planes con claridad.',
  170,
  false,
  true,
  15,
  20,
  array['english', 'b1', 'grammar'],
  array['Opinion', 'Improve', 'Because', 'Experience'],
  '{"language":"English","language_key":"english","level_title":"Confident Conversation","intro":"Puedo explicar experiencias, opiniones y planes con claridad.","mission":"Give your opinion about learning languages and explain two reasons.","grammar":"Present perfect, modals, future forms, connectors.","phrases":["In my opinion...","One reason is...","I have learned...","I would like to..."],"vocabulary":[{"word":"Opinion","translation":"Opinión","example":"In my opinion, practice is essential."},{"word":"Improve","translation":"Mejorar","example":"I want to improve my pronunciation."},{"word":"Because","translation":"Porque","example":"I study because I need English."},{"word":"Experience","translation":"Experiencia","example":"It was a great experience."},{"word":"Goal","translation":"Meta","example":"My goal is fluency."},{"word":"Challenge","translation":"Reto","example":"This challenge is useful."}],"dialogue":[{"speaker":"Tutor","line":"In my opinion...","translation":"Frase modelo"},{"speaker":"Student","line":"One reason is...","translation":"Respuesta guiada"}],"reading":{"text":"Maya has studied English for one year. She still makes mistakes, but she feels more confident when she speaks with tourists.","questions":["How long has Maya studied English?","What still happens?","When does she feel confident?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Opinion\"?","options":["Opinión","Mejorar","Porque","Experiencia"],"answer":0},{"type":"writing","prompt":"Give your opinion about learning languages and explain two reasons.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: In my opinion...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-b1-vocabulary',
  'english',
  'B1',
  'vocabulary',
  'English B1 · Vocabulary Boost',
  'Confident Conversation: Puedo explicar experiencias, opiniones y planes con claridad.',
  180,
  false,
  true,
  15,
  10,
  array['english', 'b1', 'vocabulary'],
  array['Opinion', 'Improve', 'Because', 'Experience'],
  '{"language":"English","language_key":"english","level_title":"Confident Conversation","intro":"Puedo explicar experiencias, opiniones y planes con claridad.","mission":"Give your opinion about learning languages and explain two reasons.","grammar":"Present perfect, modals, future forms, connectors.","phrases":["In my opinion...","One reason is...","I have learned...","I would like to..."],"vocabulary":[{"word":"Opinion","translation":"Opinión","example":"In my opinion, practice is essential."},{"word":"Improve","translation":"Mejorar","example":"I want to improve my pronunciation."},{"word":"Because","translation":"Porque","example":"I study because I need English."},{"word":"Experience","translation":"Experiencia","example":"It was a great experience."},{"word":"Goal","translation":"Meta","example":"My goal is fluency."},{"word":"Challenge","translation":"Reto","example":"This challenge is useful."}],"dialogue":[{"speaker":"Tutor","line":"In my opinion...","translation":"Frase modelo"},{"speaker":"Student","line":"One reason is...","translation":"Respuesta guiada"}],"reading":{"text":"Maya has studied English for one year. She still makes mistakes, but she feels more confident when she speaks with tourists.","questions":["How long has Maya studied English?","What still happens?","When does she feel confident?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Opinion\"?","options":["Opinión","Mejorar","Porque","Experiencia"],"answer":0},{"type":"writing","prompt":"Give your opinion about learning languages and explain two reasons.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: In my opinion...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-b2-listening',
  'english',
  'B2',
  'listening',
  'English B2 · Listening Lab',
  'Argument and Fluency: Puedo argumentar, comparar y comprender textos más complejos.',
  190,
  false,
  true,
  15,
  20,
  array['english', 'b2', 'listening'],
  array['Evidence', 'However', 'Although', 'Impact'],
  '{"language":"English","language_key":"english","level_title":"Argument and Fluency","intro":"Puedo argumentar, comparar y comprender textos más complejos.","mission":"Write a short argument about online education.","grammar":"Conditionals, passive voice, reported speech, phrasal verbs.","phrases":["On the one hand...","On the other hand...","This suggests that...","As a result..."],"vocabulary":[{"word":"Evidence","translation":"Evidencia","example":"The evidence supports this idea."},{"word":"However","translation":"Sin embargo","example":"However, there are disadvantages."},{"word":"Although","translation":"Aunque","example":"Although it is difficult, it is possible."},{"word":"Impact","translation":"Impacto","example":"Technology has a strong impact."},{"word":"Reliable","translation":"Confiable","example":"This source is reliable."},{"word":"Develop","translation":"Desarrollar","example":"Students develop autonomy."}],"dialogue":[{"speaker":"Tutor","line":"On the one hand...","translation":"Frase modelo"},{"speaker":"Student","line":"On the other hand...","translation":"Respuesta guiada"}],"reading":{"text":"Online education has expanded access to learning, but it also requires discipline, reliable internet and strong digital skills.","questions":["What has online education expanded?","What does it require?","What is one possible difficulty?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Evidence\"?","options":["Evidencia","Sin embargo","Aunque","Impacto"],"answer":0},{"type":"writing","prompt":"Write a short argument about online education.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: On the one hand...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-b2-speaking',
  'english',
  'B2',
  'speaking',
  'English B2 · Speaking Mission',
  'Argument and Fluency: Puedo argumentar, comparar y comprender textos más complejos.',
  200,
  false,
  true,
  15,
  20,
  array['english', 'b2', 'speaking'],
  array['Evidence', 'However', 'Although', 'Impact'],
  '{"language":"English","language_key":"english","level_title":"Argument and Fluency","intro":"Puedo argumentar, comparar y comprender textos más complejos.","mission":"Write a short argument about online education.","grammar":"Conditionals, passive voice, reported speech, phrasal verbs.","phrases":["On the one hand...","On the other hand...","This suggests that...","As a result..."],"vocabulary":[{"word":"Evidence","translation":"Evidencia","example":"The evidence supports this idea."},{"word":"However","translation":"Sin embargo","example":"However, there are disadvantages."},{"word":"Although","translation":"Aunque","example":"Although it is difficult, it is possible."},{"word":"Impact","translation":"Impacto","example":"Technology has a strong impact."},{"word":"Reliable","translation":"Confiable","example":"This source is reliable."},{"word":"Develop","translation":"Desarrollar","example":"Students develop autonomy."}],"dialogue":[{"speaker":"Tutor","line":"On the one hand...","translation":"Frase modelo"},{"speaker":"Student","line":"On the other hand...","translation":"Respuesta guiada"}],"reading":{"text":"Online education has expanded access to learning, but it also requires discipline, reliable internet and strong digital skills.","questions":["What has online education expanded?","What does it require?","What is one possible difficulty?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Evidence\"?","options":["Evidencia","Sin embargo","Aunque","Impacto"],"answer":0},{"type":"writing","prompt":"Write a short argument about online education.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: On the one hand...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-b2-reading',
  'english',
  'B2',
  'reading',
  'English B2 · Reading Quest',
  'Argument and Fluency: Puedo argumentar, comparar y comprender textos más complejos.',
  210,
  false,
  true,
  15,
  20,
  array['english', 'b2', 'reading'],
  array['Evidence', 'However', 'Although', 'Impact'],
  '{"language":"English","language_key":"english","level_title":"Argument and Fluency","intro":"Puedo argumentar, comparar y comprender textos más complejos.","mission":"Write a short argument about online education.","grammar":"Conditionals, passive voice, reported speech, phrasal verbs.","phrases":["On the one hand...","On the other hand...","This suggests that...","As a result..."],"vocabulary":[{"word":"Evidence","translation":"Evidencia","example":"The evidence supports this idea."},{"word":"However","translation":"Sin embargo","example":"However, there are disadvantages."},{"word":"Although","translation":"Aunque","example":"Although it is difficult, it is possible."},{"word":"Impact","translation":"Impacto","example":"Technology has a strong impact."},{"word":"Reliable","translation":"Confiable","example":"This source is reliable."},{"word":"Develop","translation":"Desarrollar","example":"Students develop autonomy."}],"dialogue":[{"speaker":"Tutor","line":"On the one hand...","translation":"Frase modelo"},{"speaker":"Student","line":"On the other hand...","translation":"Respuesta guiada"}],"reading":{"text":"Online education has expanded access to learning, but it also requires discipline, reliable internet and strong digital skills.","questions":["What has online education expanded?","What does it require?","What is one possible difficulty?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Evidence\"?","options":["Evidencia","Sin embargo","Aunque","Impacto"],"answer":0},{"type":"writing","prompt":"Write a short argument about online education.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: On the one hand...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-b2-writing',
  'english',
  'B2',
  'writing',
  'English B2 · Writing Challenge',
  'Argument and Fluency: Puedo argumentar, comparar y comprender textos más complejos.',
  220,
  false,
  true,
  15,
  20,
  array['english', 'b2', 'writing'],
  array['Evidence', 'However', 'Although', 'Impact'],
  '{"language":"English","language_key":"english","level_title":"Argument and Fluency","intro":"Puedo argumentar, comparar y comprender textos más complejos.","mission":"Write a short argument about online education.","grammar":"Conditionals, passive voice, reported speech, phrasal verbs.","phrases":["On the one hand...","On the other hand...","This suggests that...","As a result..."],"vocabulary":[{"word":"Evidence","translation":"Evidencia","example":"The evidence supports this idea."},{"word":"However","translation":"Sin embargo","example":"However, there are disadvantages."},{"word":"Although","translation":"Aunque","example":"Although it is difficult, it is possible."},{"word":"Impact","translation":"Impacto","example":"Technology has a strong impact."},{"word":"Reliable","translation":"Confiable","example":"This source is reliable."},{"word":"Develop","translation":"Desarrollar","example":"Students develop autonomy."}],"dialogue":[{"speaker":"Tutor","line":"On the one hand...","translation":"Frase modelo"},{"speaker":"Student","line":"On the other hand...","translation":"Respuesta guiada"}],"reading":{"text":"Online education has expanded access to learning, but it also requires discipline, reliable internet and strong digital skills.","questions":["What has online education expanded?","What does it require?","What is one possible difficulty?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Evidence\"?","options":["Evidencia","Sin embargo","Aunque","Impacto"],"answer":0},{"type":"writing","prompt":"Write a short argument about online education.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: On the one hand...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-b2-grammar',
  'english',
  'B2',
  'grammar',
  'English B2 · Grammar Focus',
  'Argument and Fluency: Puedo argumentar, comparar y comprender textos más complejos.',
  230,
  false,
  true,
  15,
  20,
  array['english', 'b2', 'grammar'],
  array['Evidence', 'However', 'Although', 'Impact'],
  '{"language":"English","language_key":"english","level_title":"Argument and Fluency","intro":"Puedo argumentar, comparar y comprender textos más complejos.","mission":"Write a short argument about online education.","grammar":"Conditionals, passive voice, reported speech, phrasal verbs.","phrases":["On the one hand...","On the other hand...","This suggests that...","As a result..."],"vocabulary":[{"word":"Evidence","translation":"Evidencia","example":"The evidence supports this idea."},{"word":"However","translation":"Sin embargo","example":"However, there are disadvantages."},{"word":"Although","translation":"Aunque","example":"Although it is difficult, it is possible."},{"word":"Impact","translation":"Impacto","example":"Technology has a strong impact."},{"word":"Reliable","translation":"Confiable","example":"This source is reliable."},{"word":"Develop","translation":"Desarrollar","example":"Students develop autonomy."}],"dialogue":[{"speaker":"Tutor","line":"On the one hand...","translation":"Frase modelo"},{"speaker":"Student","line":"On the other hand...","translation":"Respuesta guiada"}],"reading":{"text":"Online education has expanded access to learning, but it also requires discipline, reliable internet and strong digital skills.","questions":["What has online education expanded?","What does it require?","What is one possible difficulty?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Evidence\"?","options":["Evidencia","Sin embargo","Aunque","Impacto"],"answer":0},{"type":"writing","prompt":"Write a short argument about online education.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: On the one hand...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-b2-vocabulary',
  'english',
  'B2',
  'vocabulary',
  'English B2 · Vocabulary Boost',
  'Argument and Fluency: Puedo argumentar, comparar y comprender textos más complejos.',
  240,
  false,
  true,
  15,
  10,
  array['english', 'b2', 'vocabulary'],
  array['Evidence', 'However', 'Although', 'Impact'],
  '{"language":"English","language_key":"english","level_title":"Argument and Fluency","intro":"Puedo argumentar, comparar y comprender textos más complejos.","mission":"Write a short argument about online education.","grammar":"Conditionals, passive voice, reported speech, phrasal verbs.","phrases":["On the one hand...","On the other hand...","This suggests that...","As a result..."],"vocabulary":[{"word":"Evidence","translation":"Evidencia","example":"The evidence supports this idea."},{"word":"However","translation":"Sin embargo","example":"However, there are disadvantages."},{"word":"Although","translation":"Aunque","example":"Although it is difficult, it is possible."},{"word":"Impact","translation":"Impacto","example":"Technology has a strong impact."},{"word":"Reliable","translation":"Confiable","example":"This source is reliable."},{"word":"Develop","translation":"Desarrollar","example":"Students develop autonomy."}],"dialogue":[{"speaker":"Tutor","line":"On the one hand...","translation":"Frase modelo"},{"speaker":"Student","line":"On the other hand...","translation":"Respuesta guiada"}],"reading":{"text":"Online education has expanded access to learning, but it also requires discipline, reliable internet and strong digital skills.","questions":["What has online education expanded?","What does it require?","What is one possible difficulty?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Evidence\"?","options":["Evidencia","Sin embargo","Aunque","Impacto"],"answer":0},{"type":"writing","prompt":"Write a short argument about online education.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: On the one hand...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-c1-listening',
  'english',
  'C1',
  'listening',
  'English C1 · Listening Lab',
  'Advanced Expression: Puedo expresarme con precisión, matices y estilo.',
  250,
  false,
  true,
  15,
  20,
  array['english', 'c1', 'listening'],
  array['Nevertheless', 'Subtle', 'Approach', 'Outcome'],
  '{"language":"English","language_key":"english","level_title":"Advanced Expression","intro":"Puedo expresarme con precisión, matices y estilo.","mission":"Rewrite a simple opinion in a more formal academic style.","grammar":"Inversion, advanced passives, hedging, discourse markers.","phrases":["It is worth noting that...","This raises the question of...","To some extent...","From a broader perspective..."],"vocabulary":[{"word":"Nevertheless","translation":"No obstante","example":"Nevertheless, the results are relevant."},{"word":"Subtle","translation":"Sutil","example":"There is a subtle difference."},{"word":"Approach","translation":"Enfoque","example":"This approach is practical."},{"word":"Outcome","translation":"Resultado","example":"The outcome was positive."},{"word":"Assumption","translation":"Suposición","example":"That assumption is questionable."},{"word":"Enhance","translation":"Mejorar","example":"Reading enhances vocabulary."}],"dialogue":[{"speaker":"Tutor","line":"It is worth noting that...","translation":"Frase modelo"},{"speaker":"Student","line":"This raises the question of...","translation":"Respuesta guiada"}],"reading":{"text":"Language learning is not merely the memorization of forms; it is a social practice shaped by context, identity and purpose.","questions":["What is language learning not merely?","What shapes it?","What three ideas are mentioned?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nevertheless\"?","options":["No obstante","Sutil","Enfoque","Resultado"],"answer":0},{"type":"writing","prompt":"Rewrite a simple opinion in a more formal academic style.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: It is worth noting that...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-c1-speaking',
  'english',
  'C1',
  'speaking',
  'English C1 · Speaking Mission',
  'Advanced Expression: Puedo expresarme con precisión, matices y estilo.',
  260,
  false,
  true,
  15,
  20,
  array['english', 'c1', 'speaking'],
  array['Nevertheless', 'Subtle', 'Approach', 'Outcome'],
  '{"language":"English","language_key":"english","level_title":"Advanced Expression","intro":"Puedo expresarme con precisión, matices y estilo.","mission":"Rewrite a simple opinion in a more formal academic style.","grammar":"Inversion, advanced passives, hedging, discourse markers.","phrases":["It is worth noting that...","This raises the question of...","To some extent...","From a broader perspective..."],"vocabulary":[{"word":"Nevertheless","translation":"No obstante","example":"Nevertheless, the results are relevant."},{"word":"Subtle","translation":"Sutil","example":"There is a subtle difference."},{"word":"Approach","translation":"Enfoque","example":"This approach is practical."},{"word":"Outcome","translation":"Resultado","example":"The outcome was positive."},{"word":"Assumption","translation":"Suposición","example":"That assumption is questionable."},{"word":"Enhance","translation":"Mejorar","example":"Reading enhances vocabulary."}],"dialogue":[{"speaker":"Tutor","line":"It is worth noting that...","translation":"Frase modelo"},{"speaker":"Student","line":"This raises the question of...","translation":"Respuesta guiada"}],"reading":{"text":"Language learning is not merely the memorization of forms; it is a social practice shaped by context, identity and purpose.","questions":["What is language learning not merely?","What shapes it?","What three ideas are mentioned?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nevertheless\"?","options":["No obstante","Sutil","Enfoque","Resultado"],"answer":0},{"type":"writing","prompt":"Rewrite a simple opinion in a more formal academic style.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: It is worth noting that...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-c1-reading',
  'english',
  'C1',
  'reading',
  'English C1 · Reading Quest',
  'Advanced Expression: Puedo expresarme con precisión, matices y estilo.',
  270,
  false,
  true,
  15,
  20,
  array['english', 'c1', 'reading'],
  array['Nevertheless', 'Subtle', 'Approach', 'Outcome'],
  '{"language":"English","language_key":"english","level_title":"Advanced Expression","intro":"Puedo expresarme con precisión, matices y estilo.","mission":"Rewrite a simple opinion in a more formal academic style.","grammar":"Inversion, advanced passives, hedging, discourse markers.","phrases":["It is worth noting that...","This raises the question of...","To some extent...","From a broader perspective..."],"vocabulary":[{"word":"Nevertheless","translation":"No obstante","example":"Nevertheless, the results are relevant."},{"word":"Subtle","translation":"Sutil","example":"There is a subtle difference."},{"word":"Approach","translation":"Enfoque","example":"This approach is practical."},{"word":"Outcome","translation":"Resultado","example":"The outcome was positive."},{"word":"Assumption","translation":"Suposición","example":"That assumption is questionable."},{"word":"Enhance","translation":"Mejorar","example":"Reading enhances vocabulary."}],"dialogue":[{"speaker":"Tutor","line":"It is worth noting that...","translation":"Frase modelo"},{"speaker":"Student","line":"This raises the question of...","translation":"Respuesta guiada"}],"reading":{"text":"Language learning is not merely the memorization of forms; it is a social practice shaped by context, identity and purpose.","questions":["What is language learning not merely?","What shapes it?","What three ideas are mentioned?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nevertheless\"?","options":["No obstante","Sutil","Enfoque","Resultado"],"answer":0},{"type":"writing","prompt":"Rewrite a simple opinion in a more formal academic style.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: It is worth noting that...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-c1-writing',
  'english',
  'C1',
  'writing',
  'English C1 · Writing Challenge',
  'Advanced Expression: Puedo expresarme con precisión, matices y estilo.',
  280,
  false,
  true,
  15,
  20,
  array['english', 'c1', 'writing'],
  array['Nevertheless', 'Subtle', 'Approach', 'Outcome'],
  '{"language":"English","language_key":"english","level_title":"Advanced Expression","intro":"Puedo expresarme con precisión, matices y estilo.","mission":"Rewrite a simple opinion in a more formal academic style.","grammar":"Inversion, advanced passives, hedging, discourse markers.","phrases":["It is worth noting that...","This raises the question of...","To some extent...","From a broader perspective..."],"vocabulary":[{"word":"Nevertheless","translation":"No obstante","example":"Nevertheless, the results are relevant."},{"word":"Subtle","translation":"Sutil","example":"There is a subtle difference."},{"word":"Approach","translation":"Enfoque","example":"This approach is practical."},{"word":"Outcome","translation":"Resultado","example":"The outcome was positive."},{"word":"Assumption","translation":"Suposición","example":"That assumption is questionable."},{"word":"Enhance","translation":"Mejorar","example":"Reading enhances vocabulary."}],"dialogue":[{"speaker":"Tutor","line":"It is worth noting that...","translation":"Frase modelo"},{"speaker":"Student","line":"This raises the question of...","translation":"Respuesta guiada"}],"reading":{"text":"Language learning is not merely the memorization of forms; it is a social practice shaped by context, identity and purpose.","questions":["What is language learning not merely?","What shapes it?","What three ideas are mentioned?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nevertheless\"?","options":["No obstante","Sutil","Enfoque","Resultado"],"answer":0},{"type":"writing","prompt":"Rewrite a simple opinion in a more formal academic style.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: It is worth noting that...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-c1-grammar',
  'english',
  'C1',
  'grammar',
  'English C1 · Grammar Focus',
  'Advanced Expression: Puedo expresarme con precisión, matices y estilo.',
  290,
  false,
  true,
  15,
  20,
  array['english', 'c1', 'grammar'],
  array['Nevertheless', 'Subtle', 'Approach', 'Outcome'],
  '{"language":"English","language_key":"english","level_title":"Advanced Expression","intro":"Puedo expresarme con precisión, matices y estilo.","mission":"Rewrite a simple opinion in a more formal academic style.","grammar":"Inversion, advanced passives, hedging, discourse markers.","phrases":["It is worth noting that...","This raises the question of...","To some extent...","From a broader perspective..."],"vocabulary":[{"word":"Nevertheless","translation":"No obstante","example":"Nevertheless, the results are relevant."},{"word":"Subtle","translation":"Sutil","example":"There is a subtle difference."},{"word":"Approach","translation":"Enfoque","example":"This approach is practical."},{"word":"Outcome","translation":"Resultado","example":"The outcome was positive."},{"word":"Assumption","translation":"Suposición","example":"That assumption is questionable."},{"word":"Enhance","translation":"Mejorar","example":"Reading enhances vocabulary."}],"dialogue":[{"speaker":"Tutor","line":"It is worth noting that...","translation":"Frase modelo"},{"speaker":"Student","line":"This raises the question of...","translation":"Respuesta guiada"}],"reading":{"text":"Language learning is not merely the memorization of forms; it is a social practice shaped by context, identity and purpose.","questions":["What is language learning not merely?","What shapes it?","What three ideas are mentioned?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nevertheless\"?","options":["No obstante","Sutil","Enfoque","Resultado"],"answer":0},{"type":"writing","prompt":"Rewrite a simple opinion in a more formal academic style.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: It is worth noting that...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-c1-vocabulary',
  'english',
  'C1',
  'vocabulary',
  'English C1 · Vocabulary Boost',
  'Advanced Expression: Puedo expresarme con precisión, matices y estilo.',
  300,
  false,
  true,
  15,
  10,
  array['english', 'c1', 'vocabulary'],
  array['Nevertheless', 'Subtle', 'Approach', 'Outcome'],
  '{"language":"English","language_key":"english","level_title":"Advanced Expression","intro":"Puedo expresarme con precisión, matices y estilo.","mission":"Rewrite a simple opinion in a more formal academic style.","grammar":"Inversion, advanced passives, hedging, discourse markers.","phrases":["It is worth noting that...","This raises the question of...","To some extent...","From a broader perspective..."],"vocabulary":[{"word":"Nevertheless","translation":"No obstante","example":"Nevertheless, the results are relevant."},{"word":"Subtle","translation":"Sutil","example":"There is a subtle difference."},{"word":"Approach","translation":"Enfoque","example":"This approach is practical."},{"word":"Outcome","translation":"Resultado","example":"The outcome was positive."},{"word":"Assumption","translation":"Suposición","example":"That assumption is questionable."},{"word":"Enhance","translation":"Mejorar","example":"Reading enhances vocabulary."}],"dialogue":[{"speaker":"Tutor","line":"It is worth noting that...","translation":"Frase modelo"},{"speaker":"Student","line":"This raises the question of...","translation":"Respuesta guiada"}],"reading":{"text":"Language learning is not merely the memorization of forms; it is a social practice shaped by context, identity and purpose.","questions":["What is language learning not merely?","What shapes it?","What three ideas are mentioned?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nevertheless\"?","options":["No obstante","Sutil","Enfoque","Resultado"],"answer":0},{"type":"writing","prompt":"Rewrite a simple opinion in a more formal academic style.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: It is worth noting that...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-c2-listening',
  'english',
  'C2',
  'listening',
  'English C2 · Listening Lab',
  'Mastery and Nuance: Puedo comunicarme con naturalidad, precisión y dominio casi nativo.',
  310,
  false,
  true,
  15,
  20,
  array['english', 'c2', 'listening'],
  array['Nuance', 'Compelling', 'Concise', 'Flawless'],
  '{"language":"English","language_key":"english","level_title":"Mastery and Nuance","intro":"Puedo comunicarme con naturalidad, precisión y dominio casi nativo.","mission":"Produce a polished paragraph with nuance and rhetorical balance.","grammar":"Register, idiomatic nuance, rhetorical style, cohesion.","phrases":["The underlying issue is...","This is not to suggest that...","A more nuanced view would be...","What makes this compelling is..."],"vocabulary":[{"word":"Nuance","translation":"Matiz","example":"The nuance changes the message."},{"word":"Compelling","translation":"Convincente","example":"That is a compelling argument."},{"word":"Concise","translation":"Conciso","example":"Keep your answer concise."},{"word":"Flawless","translation":"Impecable","example":"Her delivery was flawless."},{"word":"Underlying","translation":"Subyacente","example":"The underlying issue is complex."},{"word":"Command","translation":"Dominio","example":"He has full command of the language."}],"dialogue":[{"speaker":"Tutor","line":"The underlying issue is...","translation":"Frase modelo"},{"speaker":"Student","line":"This is not to suggest that...","translation":"Respuesta guiada"}],"reading":{"text":"True mastery involves not only accuracy, but also timing, tone, cultural awareness and the ability to adapt language to subtle shifts in context.","questions":["What does mastery involve besides accuracy?","What must language adapt to?","Which word means dominio?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nuance\"?","options":["Matiz","Convincente","Conciso","Impecable"],"answer":0},{"type":"writing","prompt":"Produce a polished paragraph with nuance and rhetorical balance.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: The underlying issue is...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-c2-speaking',
  'english',
  'C2',
  'speaking',
  'English C2 · Speaking Mission',
  'Mastery and Nuance: Puedo comunicarme con naturalidad, precisión y dominio casi nativo.',
  320,
  false,
  true,
  15,
  20,
  array['english', 'c2', 'speaking'],
  array['Nuance', 'Compelling', 'Concise', 'Flawless'],
  '{"language":"English","language_key":"english","level_title":"Mastery and Nuance","intro":"Puedo comunicarme con naturalidad, precisión y dominio casi nativo.","mission":"Produce a polished paragraph with nuance and rhetorical balance.","grammar":"Register, idiomatic nuance, rhetorical style, cohesion.","phrases":["The underlying issue is...","This is not to suggest that...","A more nuanced view would be...","What makes this compelling is..."],"vocabulary":[{"word":"Nuance","translation":"Matiz","example":"The nuance changes the message."},{"word":"Compelling","translation":"Convincente","example":"That is a compelling argument."},{"word":"Concise","translation":"Conciso","example":"Keep your answer concise."},{"word":"Flawless","translation":"Impecable","example":"Her delivery was flawless."},{"word":"Underlying","translation":"Subyacente","example":"The underlying issue is complex."},{"word":"Command","translation":"Dominio","example":"He has full command of the language."}],"dialogue":[{"speaker":"Tutor","line":"The underlying issue is...","translation":"Frase modelo"},{"speaker":"Student","line":"This is not to suggest that...","translation":"Respuesta guiada"}],"reading":{"text":"True mastery involves not only accuracy, but also timing, tone, cultural awareness and the ability to adapt language to subtle shifts in context.","questions":["What does mastery involve besides accuracy?","What must language adapt to?","Which word means dominio?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nuance\"?","options":["Matiz","Convincente","Conciso","Impecable"],"answer":0},{"type":"writing","prompt":"Produce a polished paragraph with nuance and rhetorical balance.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: The underlying issue is...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-c2-reading',
  'english',
  'C2',
  'reading',
  'English C2 · Reading Quest',
  'Mastery and Nuance: Puedo comunicarme con naturalidad, precisión y dominio casi nativo.',
  330,
  false,
  true,
  15,
  20,
  array['english', 'c2', 'reading'],
  array['Nuance', 'Compelling', 'Concise', 'Flawless'],
  '{"language":"English","language_key":"english","level_title":"Mastery and Nuance","intro":"Puedo comunicarme con naturalidad, precisión y dominio casi nativo.","mission":"Produce a polished paragraph with nuance and rhetorical balance.","grammar":"Register, idiomatic nuance, rhetorical style, cohesion.","phrases":["The underlying issue is...","This is not to suggest that...","A more nuanced view would be...","What makes this compelling is..."],"vocabulary":[{"word":"Nuance","translation":"Matiz","example":"The nuance changes the message."},{"word":"Compelling","translation":"Convincente","example":"That is a compelling argument."},{"word":"Concise","translation":"Conciso","example":"Keep your answer concise."},{"word":"Flawless","translation":"Impecable","example":"Her delivery was flawless."},{"word":"Underlying","translation":"Subyacente","example":"The underlying issue is complex."},{"word":"Command","translation":"Dominio","example":"He has full command of the language."}],"dialogue":[{"speaker":"Tutor","line":"The underlying issue is...","translation":"Frase modelo"},{"speaker":"Student","line":"This is not to suggest that...","translation":"Respuesta guiada"}],"reading":{"text":"True mastery involves not only accuracy, but also timing, tone, cultural awareness and the ability to adapt language to subtle shifts in context.","questions":["What does mastery involve besides accuracy?","What must language adapt to?","Which word means dominio?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nuance\"?","options":["Matiz","Convincente","Conciso","Impecable"],"answer":0},{"type":"writing","prompt":"Produce a polished paragraph with nuance and rhetorical balance.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: The underlying issue is...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-c2-writing',
  'english',
  'C2',
  'writing',
  'English C2 · Writing Challenge',
  'Mastery and Nuance: Puedo comunicarme con naturalidad, precisión y dominio casi nativo.',
  340,
  false,
  true,
  15,
  20,
  array['english', 'c2', 'writing'],
  array['Nuance', 'Compelling', 'Concise', 'Flawless'],
  '{"language":"English","language_key":"english","level_title":"Mastery and Nuance","intro":"Puedo comunicarme con naturalidad, precisión y dominio casi nativo.","mission":"Produce a polished paragraph with nuance and rhetorical balance.","grammar":"Register, idiomatic nuance, rhetorical style, cohesion.","phrases":["The underlying issue is...","This is not to suggest that...","A more nuanced view would be...","What makes this compelling is..."],"vocabulary":[{"word":"Nuance","translation":"Matiz","example":"The nuance changes the message."},{"word":"Compelling","translation":"Convincente","example":"That is a compelling argument."},{"word":"Concise","translation":"Conciso","example":"Keep your answer concise."},{"word":"Flawless","translation":"Impecable","example":"Her delivery was flawless."},{"word":"Underlying","translation":"Subyacente","example":"The underlying issue is complex."},{"word":"Command","translation":"Dominio","example":"He has full command of the language."}],"dialogue":[{"speaker":"Tutor","line":"The underlying issue is...","translation":"Frase modelo"},{"speaker":"Student","line":"This is not to suggest that...","translation":"Respuesta guiada"}],"reading":{"text":"True mastery involves not only accuracy, but also timing, tone, cultural awareness and the ability to adapt language to subtle shifts in context.","questions":["What does mastery involve besides accuracy?","What must language adapt to?","Which word means dominio?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nuance\"?","options":["Matiz","Convincente","Conciso","Impecable"],"answer":0},{"type":"writing","prompt":"Produce a polished paragraph with nuance and rhetorical balance.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: The underlying issue is...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-c2-grammar',
  'english',
  'C2',
  'grammar',
  'English C2 · Grammar Focus',
  'Mastery and Nuance: Puedo comunicarme con naturalidad, precisión y dominio casi nativo.',
  350,
  false,
  true,
  15,
  20,
  array['english', 'c2', 'grammar'],
  array['Nuance', 'Compelling', 'Concise', 'Flawless'],
  '{"language":"English","language_key":"english","level_title":"Mastery and Nuance","intro":"Puedo comunicarme con naturalidad, precisión y dominio casi nativo.","mission":"Produce a polished paragraph with nuance and rhetorical balance.","grammar":"Register, idiomatic nuance, rhetorical style, cohesion.","phrases":["The underlying issue is...","This is not to suggest that...","A more nuanced view would be...","What makes this compelling is..."],"vocabulary":[{"word":"Nuance","translation":"Matiz","example":"The nuance changes the message."},{"word":"Compelling","translation":"Convincente","example":"That is a compelling argument."},{"word":"Concise","translation":"Conciso","example":"Keep your answer concise."},{"word":"Flawless","translation":"Impecable","example":"Her delivery was flawless."},{"word":"Underlying","translation":"Subyacente","example":"The underlying issue is complex."},{"word":"Command","translation":"Dominio","example":"He has full command of the language."}],"dialogue":[{"speaker":"Tutor","line":"The underlying issue is...","translation":"Frase modelo"},{"speaker":"Student","line":"This is not to suggest that...","translation":"Respuesta guiada"}],"reading":{"text":"True mastery involves not only accuracy, but also timing, tone, cultural awareness and the ability to adapt language to subtle shifts in context.","questions":["What does mastery involve besides accuracy?","What must language adapt to?","Which word means dominio?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nuance\"?","options":["Matiz","Convincente","Conciso","Impecable"],"answer":0},{"type":"writing","prompt":"Produce a polished paragraph with nuance and rhetorical balance.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: The underlying issue is...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'english-c2-vocabulary',
  'english',
  'C2',
  'vocabulary',
  'English C2 · Vocabulary Boost',
  'Mastery and Nuance: Puedo comunicarme con naturalidad, precisión y dominio casi nativo.',
  360,
  false,
  true,
  15,
  10,
  array['english', 'c2', 'vocabulary'],
  array['Nuance', 'Compelling', 'Concise', 'Flawless'],
  '{"language":"English","language_key":"english","level_title":"Mastery and Nuance","intro":"Puedo comunicarme con naturalidad, precisión y dominio casi nativo.","mission":"Produce a polished paragraph with nuance and rhetorical balance.","grammar":"Register, idiomatic nuance, rhetorical style, cohesion.","phrases":["The underlying issue is...","This is not to suggest that...","A more nuanced view would be...","What makes this compelling is..."],"vocabulary":[{"word":"Nuance","translation":"Matiz","example":"The nuance changes the message."},{"word":"Compelling","translation":"Convincente","example":"That is a compelling argument."},{"word":"Concise","translation":"Conciso","example":"Keep your answer concise."},{"word":"Flawless","translation":"Impecable","example":"Her delivery was flawless."},{"word":"Underlying","translation":"Subyacente","example":"The underlying issue is complex."},{"word":"Command","translation":"Dominio","example":"He has full command of the language."}],"dialogue":[{"speaker":"Tutor","line":"The underlying issue is...","translation":"Frase modelo"},{"speaker":"Student","line":"This is not to suggest that...","translation":"Respuesta guiada"}],"reading":{"text":"True mastery involves not only accuracy, but also timing, tone, cultural awareness and the ability to adapt language to subtle shifts in context.","questions":["What does mastery involve besides accuracy?","What must language adapt to?","Which word means dominio?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nuance\"?","options":["Matiz","Convincente","Conciso","Impecable"],"answer":0},{"type":"writing","prompt":"Produce a polished paragraph with nuance and rhetorical balance.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: The underlying issue is...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-a1-listening',
  'spanish',
  'A1',
  'listening',
  'Español A1 · Listening Lab',
  'Español esencial: Puedo saludar, decir mi nombre y hablar de mi país.',
  370,
  true,
  true,
  10,
  20,
  array['spanish', 'a1', 'listening'],
  array['Hola', 'Gracias', 'País', 'Amigo'],
  '{"language":"Español","language_key":"spanish","level_title":"Español esencial","intro":"Puedo saludar, decir mi nombre y hablar de mi país.","mission":"Preséntate en español con nombre, país y gusto personal.","grammar":"Ser/estar básico, artículos, género y número.","phrases":["Me llamo...","Soy de...","Mucho gusto.","No entiendo."],"vocabulary":[{"word":"Hola","translation":"Hello","example":"Hola, me llamo Ana."},{"word":"Gracias","translation":"Thank you","example":"Gracias por tu ayuda."},{"word":"País","translation":"Country","example":"Mi país es bonito."},{"word":"Amigo","translation":"Friend","example":"Él es mi amigo."},{"word":"Casa","translation":"House","example":"Mi casa es pequeña."},{"word":"Clase","translation":"Class","example":"La clase empieza ahora."}],"dialogue":[{"speaker":"Tutor","line":"Me llamo...","translation":"Frase modelo"},{"speaker":"Student","line":"Soy de...","translation":"Respuesta guiada"}],"reading":{"text":"Luis vive en Nagua. Él estudia español en la mañana y practica con sus amigos en la escuela.","questions":["¿Dónde vive Luis?","¿Cuándo estudia?","¿Con quién practica?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hola\"?","options":["Hello","Thank you","Country","Friend"],"answer":0},{"type":"writing","prompt":"Preséntate en español con nombre, país y gusto personal.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Me llamo...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-a1-speaking',
  'spanish',
  'A1',
  'speaking',
  'Español A1 · Speaking Mission',
  'Español esencial: Puedo saludar, decir mi nombre y hablar de mi país.',
  380,
  true,
  true,
  10,
  20,
  array['spanish', 'a1', 'speaking'],
  array['Hola', 'Gracias', 'País', 'Amigo'],
  '{"language":"Español","language_key":"spanish","level_title":"Español esencial","intro":"Puedo saludar, decir mi nombre y hablar de mi país.","mission":"Preséntate en español con nombre, país y gusto personal.","grammar":"Ser/estar básico, artículos, género y número.","phrases":["Me llamo...","Soy de...","Mucho gusto.","No entiendo."],"vocabulary":[{"word":"Hola","translation":"Hello","example":"Hola, me llamo Ana."},{"word":"Gracias","translation":"Thank you","example":"Gracias por tu ayuda."},{"word":"País","translation":"Country","example":"Mi país es bonito."},{"word":"Amigo","translation":"Friend","example":"Él es mi amigo."},{"word":"Casa","translation":"House","example":"Mi casa es pequeña."},{"word":"Clase","translation":"Class","example":"La clase empieza ahora."}],"dialogue":[{"speaker":"Tutor","line":"Me llamo...","translation":"Frase modelo"},{"speaker":"Student","line":"Soy de...","translation":"Respuesta guiada"}],"reading":{"text":"Luis vive en Nagua. Él estudia español en la mañana y practica con sus amigos en la escuela.","questions":["¿Dónde vive Luis?","¿Cuándo estudia?","¿Con quién practica?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hola\"?","options":["Hello","Thank you","Country","Friend"],"answer":0},{"type":"writing","prompt":"Preséntate en español con nombre, país y gusto personal.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Me llamo...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-a1-reading',
  'spanish',
  'A1',
  'reading',
  'Español A1 · Reading Quest',
  'Español esencial: Puedo saludar, decir mi nombre y hablar de mi país.',
  390,
  true,
  true,
  10,
  20,
  array['spanish', 'a1', 'reading'],
  array['Hola', 'Gracias', 'País', 'Amigo'],
  '{"language":"Español","language_key":"spanish","level_title":"Español esencial","intro":"Puedo saludar, decir mi nombre y hablar de mi país.","mission":"Preséntate en español con nombre, país y gusto personal.","grammar":"Ser/estar básico, artículos, género y número.","phrases":["Me llamo...","Soy de...","Mucho gusto.","No entiendo."],"vocabulary":[{"word":"Hola","translation":"Hello","example":"Hola, me llamo Ana."},{"word":"Gracias","translation":"Thank you","example":"Gracias por tu ayuda."},{"word":"País","translation":"Country","example":"Mi país es bonito."},{"word":"Amigo","translation":"Friend","example":"Él es mi amigo."},{"word":"Casa","translation":"House","example":"Mi casa es pequeña."},{"word":"Clase","translation":"Class","example":"La clase empieza ahora."}],"dialogue":[{"speaker":"Tutor","line":"Me llamo...","translation":"Frase modelo"},{"speaker":"Student","line":"Soy de...","translation":"Respuesta guiada"}],"reading":{"text":"Luis vive en Nagua. Él estudia español en la mañana y practica con sus amigos en la escuela.","questions":["¿Dónde vive Luis?","¿Cuándo estudia?","¿Con quién practica?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hola\"?","options":["Hello","Thank you","Country","Friend"],"answer":0},{"type":"writing","prompt":"Preséntate en español con nombre, país y gusto personal.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Me llamo...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-a1-writing',
  'spanish',
  'A1',
  'writing',
  'Español A1 · Writing Challenge',
  'Español esencial: Puedo saludar, decir mi nombre y hablar de mi país.',
  400,
  true,
  true,
  10,
  20,
  array['spanish', 'a1', 'writing'],
  array['Hola', 'Gracias', 'País', 'Amigo'],
  '{"language":"Español","language_key":"spanish","level_title":"Español esencial","intro":"Puedo saludar, decir mi nombre y hablar de mi país.","mission":"Preséntate en español con nombre, país y gusto personal.","grammar":"Ser/estar básico, artículos, género y número.","phrases":["Me llamo...","Soy de...","Mucho gusto.","No entiendo."],"vocabulary":[{"word":"Hola","translation":"Hello","example":"Hola, me llamo Ana."},{"word":"Gracias","translation":"Thank you","example":"Gracias por tu ayuda."},{"word":"País","translation":"Country","example":"Mi país es bonito."},{"word":"Amigo","translation":"Friend","example":"Él es mi amigo."},{"word":"Casa","translation":"House","example":"Mi casa es pequeña."},{"word":"Clase","translation":"Class","example":"La clase empieza ahora."}],"dialogue":[{"speaker":"Tutor","line":"Me llamo...","translation":"Frase modelo"},{"speaker":"Student","line":"Soy de...","translation":"Respuesta guiada"}],"reading":{"text":"Luis vive en Nagua. Él estudia español en la mañana y practica con sus amigos en la escuela.","questions":["¿Dónde vive Luis?","¿Cuándo estudia?","¿Con quién practica?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hola\"?","options":["Hello","Thank you","Country","Friend"],"answer":0},{"type":"writing","prompt":"Preséntate en español con nombre, país y gusto personal.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Me llamo...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-a1-grammar',
  'spanish',
  'A1',
  'grammar',
  'Español A1 · Grammar Focus',
  'Español esencial: Puedo saludar, decir mi nombre y hablar de mi país.',
  410,
  true,
  true,
  10,
  20,
  array['spanish', 'a1', 'grammar'],
  array['Hola', 'Gracias', 'País', 'Amigo'],
  '{"language":"Español","language_key":"spanish","level_title":"Español esencial","intro":"Puedo saludar, decir mi nombre y hablar de mi país.","mission":"Preséntate en español con nombre, país y gusto personal.","grammar":"Ser/estar básico, artículos, género y número.","phrases":["Me llamo...","Soy de...","Mucho gusto.","No entiendo."],"vocabulary":[{"word":"Hola","translation":"Hello","example":"Hola, me llamo Ana."},{"word":"Gracias","translation":"Thank you","example":"Gracias por tu ayuda."},{"word":"País","translation":"Country","example":"Mi país es bonito."},{"word":"Amigo","translation":"Friend","example":"Él es mi amigo."},{"word":"Casa","translation":"House","example":"Mi casa es pequeña."},{"word":"Clase","translation":"Class","example":"La clase empieza ahora."}],"dialogue":[{"speaker":"Tutor","line":"Me llamo...","translation":"Frase modelo"},{"speaker":"Student","line":"Soy de...","translation":"Respuesta guiada"}],"reading":{"text":"Luis vive en Nagua. Él estudia español en la mañana y practica con sus amigos en la escuela.","questions":["¿Dónde vive Luis?","¿Cuándo estudia?","¿Con quién practica?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hola\"?","options":["Hello","Thank you","Country","Friend"],"answer":0},{"type":"writing","prompt":"Preséntate en español con nombre, país y gusto personal.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Me llamo...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-a1-vocabulary',
  'spanish',
  'A1',
  'vocabulary',
  'Español A1 · Vocabulary Boost',
  'Español esencial: Puedo saludar, decir mi nombre y hablar de mi país.',
  420,
  true,
  true,
  10,
  10,
  array['spanish', 'a1', 'vocabulary'],
  array['Hola', 'Gracias', 'País', 'Amigo'],
  '{"language":"Español","language_key":"spanish","level_title":"Español esencial","intro":"Puedo saludar, decir mi nombre y hablar de mi país.","mission":"Preséntate en español con nombre, país y gusto personal.","grammar":"Ser/estar básico, artículos, género y número.","phrases":["Me llamo...","Soy de...","Mucho gusto.","No entiendo."],"vocabulary":[{"word":"Hola","translation":"Hello","example":"Hola, me llamo Ana."},{"word":"Gracias","translation":"Thank you","example":"Gracias por tu ayuda."},{"word":"País","translation":"Country","example":"Mi país es bonito."},{"word":"Amigo","translation":"Friend","example":"Él es mi amigo."},{"word":"Casa","translation":"House","example":"Mi casa es pequeña."},{"word":"Clase","translation":"Class","example":"La clase empieza ahora."}],"dialogue":[{"speaker":"Tutor","line":"Me llamo...","translation":"Frase modelo"},{"speaker":"Student","line":"Soy de...","translation":"Respuesta guiada"}],"reading":{"text":"Luis vive en Nagua. Él estudia español en la mañana y practica con sus amigos en la escuela.","questions":["¿Dónde vive Luis?","¿Cuándo estudia?","¿Con quién practica?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hola\"?","options":["Hello","Thank you","Country","Friend"],"answer":0},{"type":"writing","prompt":"Preséntate en español con nombre, país y gusto personal.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Me llamo...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-a2-listening',
  'spanish',
  'A2',
  'listening',
  'Español A2 · Listening Lab',
  'Vida cotidiana: Puedo describir rutinas, comida, familia y lugares.',
  430,
  true,
  true,
  10,
  20,
  array['spanish', 'a2', 'listening'],
  array['Desayuno', 'Trabajo', 'Tienda', 'Cerca'],
  '{"language":"Español","language_key":"spanish","level_title":"Vida cotidiana","intro":"Puedo describir rutinas, comida, familia y lugares.","mission":"Describe tu rutina diaria usando cinco verbos.","grammar":"Presente regular, pretérito básico, tener que, ir a.","phrases":["Todos los días...","Ayer fui a...","Me gusta...","Necesito comprar..."],"vocabulary":[{"word":"Desayuno","translation":"Breakfast","example":"El desayuno está listo."},{"word":"Trabajo","translation":"Work","example":"Voy al trabajo temprano."},{"word":"Tienda","translation":"Store","example":"Compro pan en la tienda."},{"word":"Cerca","translation":"Near","example":"La escuela está cerca."},{"word":"Ayer","translation":"Yesterday","example":"Ayer estudié mucho."},{"word":"Viaje","translation":"Trip","example":"El viaje fue corto."}],"dialogue":[{"speaker":"Tutor","line":"Todos los días...","translation":"Frase modelo"},{"speaker":"Student","line":"Ayer fui a...","translation":"Respuesta guiada"}],"reading":{"text":"María trabaja por la tarde. Después del trabajo, compra frutas y prepara la cena para su familia.","questions":["¿Cuándo trabaja María?","¿Qué compra?","¿Para quién prepara la cena?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Desayuno\"?","options":["Breakfast","Work","Store","Near"],"answer":0},{"type":"writing","prompt":"Describe tu rutina diaria usando cinco verbos.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Todos los días...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-a2-speaking',
  'spanish',
  'A2',
  'speaking',
  'Español A2 · Speaking Mission',
  'Vida cotidiana: Puedo describir rutinas, comida, familia y lugares.',
  440,
  true,
  true,
  10,
  20,
  array['spanish', 'a2', 'speaking'],
  array['Desayuno', 'Trabajo', 'Tienda', 'Cerca'],
  '{"language":"Español","language_key":"spanish","level_title":"Vida cotidiana","intro":"Puedo describir rutinas, comida, familia y lugares.","mission":"Describe tu rutina diaria usando cinco verbos.","grammar":"Presente regular, pretérito básico, tener que, ir a.","phrases":["Todos los días...","Ayer fui a...","Me gusta...","Necesito comprar..."],"vocabulary":[{"word":"Desayuno","translation":"Breakfast","example":"El desayuno está listo."},{"word":"Trabajo","translation":"Work","example":"Voy al trabajo temprano."},{"word":"Tienda","translation":"Store","example":"Compro pan en la tienda."},{"word":"Cerca","translation":"Near","example":"La escuela está cerca."},{"word":"Ayer","translation":"Yesterday","example":"Ayer estudié mucho."},{"word":"Viaje","translation":"Trip","example":"El viaje fue corto."}],"dialogue":[{"speaker":"Tutor","line":"Todos los días...","translation":"Frase modelo"},{"speaker":"Student","line":"Ayer fui a...","translation":"Respuesta guiada"}],"reading":{"text":"María trabaja por la tarde. Después del trabajo, compra frutas y prepara la cena para su familia.","questions":["¿Cuándo trabaja María?","¿Qué compra?","¿Para quién prepara la cena?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Desayuno\"?","options":["Breakfast","Work","Store","Near"],"answer":0},{"type":"writing","prompt":"Describe tu rutina diaria usando cinco verbos.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Todos los días...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-a2-reading',
  'spanish',
  'A2',
  'reading',
  'Español A2 · Reading Quest',
  'Vida cotidiana: Puedo describir rutinas, comida, familia y lugares.',
  450,
  true,
  true,
  10,
  20,
  array['spanish', 'a2', 'reading'],
  array['Desayuno', 'Trabajo', 'Tienda', 'Cerca'],
  '{"language":"Español","language_key":"spanish","level_title":"Vida cotidiana","intro":"Puedo describir rutinas, comida, familia y lugares.","mission":"Describe tu rutina diaria usando cinco verbos.","grammar":"Presente regular, pretérito básico, tener que, ir a.","phrases":["Todos los días...","Ayer fui a...","Me gusta...","Necesito comprar..."],"vocabulary":[{"word":"Desayuno","translation":"Breakfast","example":"El desayuno está listo."},{"word":"Trabajo","translation":"Work","example":"Voy al trabajo temprano."},{"word":"Tienda","translation":"Store","example":"Compro pan en la tienda."},{"word":"Cerca","translation":"Near","example":"La escuela está cerca."},{"word":"Ayer","translation":"Yesterday","example":"Ayer estudié mucho."},{"word":"Viaje","translation":"Trip","example":"El viaje fue corto."}],"dialogue":[{"speaker":"Tutor","line":"Todos los días...","translation":"Frase modelo"},{"speaker":"Student","line":"Ayer fui a...","translation":"Respuesta guiada"}],"reading":{"text":"María trabaja por la tarde. Después del trabajo, compra frutas y prepara la cena para su familia.","questions":["¿Cuándo trabaja María?","¿Qué compra?","¿Para quién prepara la cena?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Desayuno\"?","options":["Breakfast","Work","Store","Near"],"answer":0},{"type":"writing","prompt":"Describe tu rutina diaria usando cinco verbos.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Todos los días...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-a2-writing',
  'spanish',
  'A2',
  'writing',
  'Español A2 · Writing Challenge',
  'Vida cotidiana: Puedo describir rutinas, comida, familia y lugares.',
  460,
  true,
  true,
  10,
  20,
  array['spanish', 'a2', 'writing'],
  array['Desayuno', 'Trabajo', 'Tienda', 'Cerca'],
  '{"language":"Español","language_key":"spanish","level_title":"Vida cotidiana","intro":"Puedo describir rutinas, comida, familia y lugares.","mission":"Describe tu rutina diaria usando cinco verbos.","grammar":"Presente regular, pretérito básico, tener que, ir a.","phrases":["Todos los días...","Ayer fui a...","Me gusta...","Necesito comprar..."],"vocabulary":[{"word":"Desayuno","translation":"Breakfast","example":"El desayuno está listo."},{"word":"Trabajo","translation":"Work","example":"Voy al trabajo temprano."},{"word":"Tienda","translation":"Store","example":"Compro pan en la tienda."},{"word":"Cerca","translation":"Near","example":"La escuela está cerca."},{"word":"Ayer","translation":"Yesterday","example":"Ayer estudié mucho."},{"word":"Viaje","translation":"Trip","example":"El viaje fue corto."}],"dialogue":[{"speaker":"Tutor","line":"Todos los días...","translation":"Frase modelo"},{"speaker":"Student","line":"Ayer fui a...","translation":"Respuesta guiada"}],"reading":{"text":"María trabaja por la tarde. Después del trabajo, compra frutas y prepara la cena para su familia.","questions":["¿Cuándo trabaja María?","¿Qué compra?","¿Para quién prepara la cena?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Desayuno\"?","options":["Breakfast","Work","Store","Near"],"answer":0},{"type":"writing","prompt":"Describe tu rutina diaria usando cinco verbos.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Todos los días...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-a2-grammar',
  'spanish',
  'A2',
  'grammar',
  'Español A2 · Grammar Focus',
  'Vida cotidiana: Puedo describir rutinas, comida, familia y lugares.',
  470,
  true,
  true,
  10,
  20,
  array['spanish', 'a2', 'grammar'],
  array['Desayuno', 'Trabajo', 'Tienda', 'Cerca'],
  '{"language":"Español","language_key":"spanish","level_title":"Vida cotidiana","intro":"Puedo describir rutinas, comida, familia y lugares.","mission":"Describe tu rutina diaria usando cinco verbos.","grammar":"Presente regular, pretérito básico, tener que, ir a.","phrases":["Todos los días...","Ayer fui a...","Me gusta...","Necesito comprar..."],"vocabulary":[{"word":"Desayuno","translation":"Breakfast","example":"El desayuno está listo."},{"word":"Trabajo","translation":"Work","example":"Voy al trabajo temprano."},{"word":"Tienda","translation":"Store","example":"Compro pan en la tienda."},{"word":"Cerca","translation":"Near","example":"La escuela está cerca."},{"word":"Ayer","translation":"Yesterday","example":"Ayer estudié mucho."},{"word":"Viaje","translation":"Trip","example":"El viaje fue corto."}],"dialogue":[{"speaker":"Tutor","line":"Todos los días...","translation":"Frase modelo"},{"speaker":"Student","line":"Ayer fui a...","translation":"Respuesta guiada"}],"reading":{"text":"María trabaja por la tarde. Después del trabajo, compra frutas y prepara la cena para su familia.","questions":["¿Cuándo trabaja María?","¿Qué compra?","¿Para quién prepara la cena?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Desayuno\"?","options":["Breakfast","Work","Store","Near"],"answer":0},{"type":"writing","prompt":"Describe tu rutina diaria usando cinco verbos.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Todos los días...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-a2-vocabulary',
  'spanish',
  'A2',
  'vocabulary',
  'Español A2 · Vocabulary Boost',
  'Vida cotidiana: Puedo describir rutinas, comida, familia y lugares.',
  480,
  true,
  true,
  10,
  10,
  array['spanish', 'a2', 'vocabulary'],
  array['Desayuno', 'Trabajo', 'Tienda', 'Cerca'],
  '{"language":"Español","language_key":"spanish","level_title":"Vida cotidiana","intro":"Puedo describir rutinas, comida, familia y lugares.","mission":"Describe tu rutina diaria usando cinco verbos.","grammar":"Presente regular, pretérito básico, tener que, ir a.","phrases":["Todos los días...","Ayer fui a...","Me gusta...","Necesito comprar..."],"vocabulary":[{"word":"Desayuno","translation":"Breakfast","example":"El desayuno está listo."},{"word":"Trabajo","translation":"Work","example":"Voy al trabajo temprano."},{"word":"Tienda","translation":"Store","example":"Compro pan en la tienda."},{"word":"Cerca","translation":"Near","example":"La escuela está cerca."},{"word":"Ayer","translation":"Yesterday","example":"Ayer estudié mucho."},{"word":"Viaje","translation":"Trip","example":"El viaje fue corto."}],"dialogue":[{"speaker":"Tutor","line":"Todos los días...","translation":"Frase modelo"},{"speaker":"Student","line":"Ayer fui a...","translation":"Respuesta guiada"}],"reading":{"text":"María trabaja por la tarde. Después del trabajo, compra frutas y prepara la cena para su familia.","questions":["¿Cuándo trabaja María?","¿Qué compra?","¿Para quién prepara la cena?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Desayuno\"?","options":["Breakfast","Work","Store","Near"],"answer":0},{"type":"writing","prompt":"Describe tu rutina diaria usando cinco verbos.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Todos los días...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-b1-listening',
  'spanish',
  'B1',
  'listening',
  'Español B1 · Listening Lab',
  'Opiniones y experiencias: Puedo narrar experiencias y justificar opiniones.',
  490,
  false,
  true,
  15,
  20,
  array['spanish', 'b1', 'listening'],
  array['Aunque', 'Aprender', 'Recuerdo', 'Mejorar'],
  '{"language":"Español","language_key":"spanish","level_title":"Opiniones y experiencias","intro":"Puedo narrar experiencias y justificar opiniones.","mission":"Cuenta una experiencia importante y explica qué aprendiste.","grammar":"Pretérito/imperfecto, por/para, conectores.","phrases":["En mi opinión...","Cuando era niño...","Por esa razón...","Lo más importante fue..."],"vocabulary":[{"word":"Aunque","translation":"Although","example":"Aunque llueve, salimos."},{"word":"Aprender","translation":"To learn","example":"Quiero aprender más."},{"word":"Recuerdo","translation":"Memory","example":"Tengo un buen recuerdo."},{"word":"Mejorar","translation":"To improve","example":"Necesito mejorar mi acento."},{"word":"Consejo","translation":"Advice","example":"Te doy un consejo."},{"word":"Lograr","translation":"To achieve","example":"Podemos lograr la meta."}],"dialogue":[{"speaker":"Tutor","line":"En mi opinión...","translation":"Frase modelo"},{"speaker":"Student","line":"Cuando era niño...","translation":"Respuesta guiada"}],"reading":{"text":"Cuando Elena llegó a otro país, no entendía muchas expresiones. Con práctica diaria, empezó a comunicarse con más seguridad.","questions":["¿Qué no entendía Elena?","¿Qué hizo diariamente?","¿Cómo empezó a comunicarse?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Aunque\"?","options":["Although","To learn","Memory","To improve"],"answer":0},{"type":"writing","prompt":"Cuenta una experiencia importante y explica qué aprendiste.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: En mi opinión...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-b1-speaking',
  'spanish',
  'B1',
  'speaking',
  'Español B1 · Speaking Mission',
  'Opiniones y experiencias: Puedo narrar experiencias y justificar opiniones.',
  500,
  false,
  true,
  15,
  20,
  array['spanish', 'b1', 'speaking'],
  array['Aunque', 'Aprender', 'Recuerdo', 'Mejorar'],
  '{"language":"Español","language_key":"spanish","level_title":"Opiniones y experiencias","intro":"Puedo narrar experiencias y justificar opiniones.","mission":"Cuenta una experiencia importante y explica qué aprendiste.","grammar":"Pretérito/imperfecto, por/para, conectores.","phrases":["En mi opinión...","Cuando era niño...","Por esa razón...","Lo más importante fue..."],"vocabulary":[{"word":"Aunque","translation":"Although","example":"Aunque llueve, salimos."},{"word":"Aprender","translation":"To learn","example":"Quiero aprender más."},{"word":"Recuerdo","translation":"Memory","example":"Tengo un buen recuerdo."},{"word":"Mejorar","translation":"To improve","example":"Necesito mejorar mi acento."},{"word":"Consejo","translation":"Advice","example":"Te doy un consejo."},{"word":"Lograr","translation":"To achieve","example":"Podemos lograr la meta."}],"dialogue":[{"speaker":"Tutor","line":"En mi opinión...","translation":"Frase modelo"},{"speaker":"Student","line":"Cuando era niño...","translation":"Respuesta guiada"}],"reading":{"text":"Cuando Elena llegó a otro país, no entendía muchas expresiones. Con práctica diaria, empezó a comunicarse con más seguridad.","questions":["¿Qué no entendía Elena?","¿Qué hizo diariamente?","¿Cómo empezó a comunicarse?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Aunque\"?","options":["Although","To learn","Memory","To improve"],"answer":0},{"type":"writing","prompt":"Cuenta una experiencia importante y explica qué aprendiste.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: En mi opinión...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-b1-reading',
  'spanish',
  'B1',
  'reading',
  'Español B1 · Reading Quest',
  'Opiniones y experiencias: Puedo narrar experiencias y justificar opiniones.',
  510,
  false,
  true,
  15,
  20,
  array['spanish', 'b1', 'reading'],
  array['Aunque', 'Aprender', 'Recuerdo', 'Mejorar'],
  '{"language":"Español","language_key":"spanish","level_title":"Opiniones y experiencias","intro":"Puedo narrar experiencias y justificar opiniones.","mission":"Cuenta una experiencia importante y explica qué aprendiste.","grammar":"Pretérito/imperfecto, por/para, conectores.","phrases":["En mi opinión...","Cuando era niño...","Por esa razón...","Lo más importante fue..."],"vocabulary":[{"word":"Aunque","translation":"Although","example":"Aunque llueve, salimos."},{"word":"Aprender","translation":"To learn","example":"Quiero aprender más."},{"word":"Recuerdo","translation":"Memory","example":"Tengo un buen recuerdo."},{"word":"Mejorar","translation":"To improve","example":"Necesito mejorar mi acento."},{"word":"Consejo","translation":"Advice","example":"Te doy un consejo."},{"word":"Lograr","translation":"To achieve","example":"Podemos lograr la meta."}],"dialogue":[{"speaker":"Tutor","line":"En mi opinión...","translation":"Frase modelo"},{"speaker":"Student","line":"Cuando era niño...","translation":"Respuesta guiada"}],"reading":{"text":"Cuando Elena llegó a otro país, no entendía muchas expresiones. Con práctica diaria, empezó a comunicarse con más seguridad.","questions":["¿Qué no entendía Elena?","¿Qué hizo diariamente?","¿Cómo empezó a comunicarse?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Aunque\"?","options":["Although","To learn","Memory","To improve"],"answer":0},{"type":"writing","prompt":"Cuenta una experiencia importante y explica qué aprendiste.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: En mi opinión...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-b1-writing',
  'spanish',
  'B1',
  'writing',
  'Español B1 · Writing Challenge',
  'Opiniones y experiencias: Puedo narrar experiencias y justificar opiniones.',
  520,
  false,
  true,
  15,
  20,
  array['spanish', 'b1', 'writing'],
  array['Aunque', 'Aprender', 'Recuerdo', 'Mejorar'],
  '{"language":"Español","language_key":"spanish","level_title":"Opiniones y experiencias","intro":"Puedo narrar experiencias y justificar opiniones.","mission":"Cuenta una experiencia importante y explica qué aprendiste.","grammar":"Pretérito/imperfecto, por/para, conectores.","phrases":["En mi opinión...","Cuando era niño...","Por esa razón...","Lo más importante fue..."],"vocabulary":[{"word":"Aunque","translation":"Although","example":"Aunque llueve, salimos."},{"word":"Aprender","translation":"To learn","example":"Quiero aprender más."},{"word":"Recuerdo","translation":"Memory","example":"Tengo un buen recuerdo."},{"word":"Mejorar","translation":"To improve","example":"Necesito mejorar mi acento."},{"word":"Consejo","translation":"Advice","example":"Te doy un consejo."},{"word":"Lograr","translation":"To achieve","example":"Podemos lograr la meta."}],"dialogue":[{"speaker":"Tutor","line":"En mi opinión...","translation":"Frase modelo"},{"speaker":"Student","line":"Cuando era niño...","translation":"Respuesta guiada"}],"reading":{"text":"Cuando Elena llegó a otro país, no entendía muchas expresiones. Con práctica diaria, empezó a comunicarse con más seguridad.","questions":["¿Qué no entendía Elena?","¿Qué hizo diariamente?","¿Cómo empezó a comunicarse?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Aunque\"?","options":["Although","To learn","Memory","To improve"],"answer":0},{"type":"writing","prompt":"Cuenta una experiencia importante y explica qué aprendiste.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: En mi opinión...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-b1-grammar',
  'spanish',
  'B1',
  'grammar',
  'Español B1 · Grammar Focus',
  'Opiniones y experiencias: Puedo narrar experiencias y justificar opiniones.',
  530,
  false,
  true,
  15,
  20,
  array['spanish', 'b1', 'grammar'],
  array['Aunque', 'Aprender', 'Recuerdo', 'Mejorar'],
  '{"language":"Español","language_key":"spanish","level_title":"Opiniones y experiencias","intro":"Puedo narrar experiencias y justificar opiniones.","mission":"Cuenta una experiencia importante y explica qué aprendiste.","grammar":"Pretérito/imperfecto, por/para, conectores.","phrases":["En mi opinión...","Cuando era niño...","Por esa razón...","Lo más importante fue..."],"vocabulary":[{"word":"Aunque","translation":"Although","example":"Aunque llueve, salimos."},{"word":"Aprender","translation":"To learn","example":"Quiero aprender más."},{"word":"Recuerdo","translation":"Memory","example":"Tengo un buen recuerdo."},{"word":"Mejorar","translation":"To improve","example":"Necesito mejorar mi acento."},{"word":"Consejo","translation":"Advice","example":"Te doy un consejo."},{"word":"Lograr","translation":"To achieve","example":"Podemos lograr la meta."}],"dialogue":[{"speaker":"Tutor","line":"En mi opinión...","translation":"Frase modelo"},{"speaker":"Student","line":"Cuando era niño...","translation":"Respuesta guiada"}],"reading":{"text":"Cuando Elena llegó a otro país, no entendía muchas expresiones. Con práctica diaria, empezó a comunicarse con más seguridad.","questions":["¿Qué no entendía Elena?","¿Qué hizo diariamente?","¿Cómo empezó a comunicarse?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Aunque\"?","options":["Although","To learn","Memory","To improve"],"answer":0},{"type":"writing","prompt":"Cuenta una experiencia importante y explica qué aprendiste.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: En mi opinión...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-b1-vocabulary',
  'spanish',
  'B1',
  'vocabulary',
  'Español B1 · Vocabulary Boost',
  'Opiniones y experiencias: Puedo narrar experiencias y justificar opiniones.',
  540,
  false,
  true,
  15,
  10,
  array['spanish', 'b1', 'vocabulary'],
  array['Aunque', 'Aprender', 'Recuerdo', 'Mejorar'],
  '{"language":"Español","language_key":"spanish","level_title":"Opiniones y experiencias","intro":"Puedo narrar experiencias y justificar opiniones.","mission":"Cuenta una experiencia importante y explica qué aprendiste.","grammar":"Pretérito/imperfecto, por/para, conectores.","phrases":["En mi opinión...","Cuando era niño...","Por esa razón...","Lo más importante fue..."],"vocabulary":[{"word":"Aunque","translation":"Although","example":"Aunque llueve, salimos."},{"word":"Aprender","translation":"To learn","example":"Quiero aprender más."},{"word":"Recuerdo","translation":"Memory","example":"Tengo un buen recuerdo."},{"word":"Mejorar","translation":"To improve","example":"Necesito mejorar mi acento."},{"word":"Consejo","translation":"Advice","example":"Te doy un consejo."},{"word":"Lograr","translation":"To achieve","example":"Podemos lograr la meta."}],"dialogue":[{"speaker":"Tutor","line":"En mi opinión...","translation":"Frase modelo"},{"speaker":"Student","line":"Cuando era niño...","translation":"Respuesta guiada"}],"reading":{"text":"Cuando Elena llegó a otro país, no entendía muchas expresiones. Con práctica diaria, empezó a comunicarse con más seguridad.","questions":["¿Qué no entendía Elena?","¿Qué hizo diariamente?","¿Cómo empezó a comunicarse?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Aunque\"?","options":["Although","To learn","Memory","To improve"],"answer":0},{"type":"writing","prompt":"Cuenta una experiencia importante y explica qué aprendiste.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: En mi opinión...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-b2-listening',
  'spanish',
  'B2',
  'listening',
  'Español B2 · Listening Lab',
  'Debate y claridad: Puedo analizar problemas y defender puntos de vista.',
  550,
  false,
  true,
  15,
  20,
  array['spanish', 'b2', 'listening'],
  array['Desarrollo', 'Ventaja', 'Riesgo', 'Sin embargo'],
  '{"language":"Español","language_key":"spanish","level_title":"Debate y claridad","intro":"Puedo analizar problemas y defender puntos de vista.","mission":"Defiende una opinión sobre tecnología y educación.","grammar":"Subjuntivo, voz pasiva, oraciones relativas.","phrases":["Es necesario que...","No obstante...","Desde mi punto de vista...","La evidencia muestra..."],"vocabulary":[{"word":"Desarrollo","translation":"Development","example":"El desarrollo social es importante."},{"word":"Ventaja","translation":"Advantage","example":"Una ventaja es la rapidez."},{"word":"Riesgo","translation":"Risk","example":"Existe un riesgo claro."},{"word":"Sin embargo","translation":"However","example":"Sin embargo, hay límites."},{"word":"Propuesta","translation":"Proposal","example":"La propuesta es viable."},{"word":"Impacto","translation":"Impact","example":"El impacto fue positivo."}],"dialogue":[{"speaker":"Tutor","line":"Es necesario que...","translation":"Frase modelo"},{"speaker":"Student","line":"No obstante...","translation":"Respuesta guiada"}],"reading":{"text":"El uso de tecnología en la educación puede ampliar oportunidades, siempre que exista acompañamiento pedagógico y acceso equitativo.","questions":["¿Qué puede ampliar la tecnología?","¿Qué debe existir?","¿Cuál es el tema principal?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Desarrollo\"?","options":["Development","Advantage","Risk","However"],"answer":0},{"type":"writing","prompt":"Defiende una opinión sobre tecnología y educación.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Es necesario que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-b2-speaking',
  'spanish',
  'B2',
  'speaking',
  'Español B2 · Speaking Mission',
  'Debate y claridad: Puedo analizar problemas y defender puntos de vista.',
  560,
  false,
  true,
  15,
  20,
  array['spanish', 'b2', 'speaking'],
  array['Desarrollo', 'Ventaja', 'Riesgo', 'Sin embargo'],
  '{"language":"Español","language_key":"spanish","level_title":"Debate y claridad","intro":"Puedo analizar problemas y defender puntos de vista.","mission":"Defiende una opinión sobre tecnología y educación.","grammar":"Subjuntivo, voz pasiva, oraciones relativas.","phrases":["Es necesario que...","No obstante...","Desde mi punto de vista...","La evidencia muestra..."],"vocabulary":[{"word":"Desarrollo","translation":"Development","example":"El desarrollo social es importante."},{"word":"Ventaja","translation":"Advantage","example":"Una ventaja es la rapidez."},{"word":"Riesgo","translation":"Risk","example":"Existe un riesgo claro."},{"word":"Sin embargo","translation":"However","example":"Sin embargo, hay límites."},{"word":"Propuesta","translation":"Proposal","example":"La propuesta es viable."},{"word":"Impacto","translation":"Impact","example":"El impacto fue positivo."}],"dialogue":[{"speaker":"Tutor","line":"Es necesario que...","translation":"Frase modelo"},{"speaker":"Student","line":"No obstante...","translation":"Respuesta guiada"}],"reading":{"text":"El uso de tecnología en la educación puede ampliar oportunidades, siempre que exista acompañamiento pedagógico y acceso equitativo.","questions":["¿Qué puede ampliar la tecnología?","¿Qué debe existir?","¿Cuál es el tema principal?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Desarrollo\"?","options":["Development","Advantage","Risk","However"],"answer":0},{"type":"writing","prompt":"Defiende una opinión sobre tecnología y educación.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Es necesario que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-b2-reading',
  'spanish',
  'B2',
  'reading',
  'Español B2 · Reading Quest',
  'Debate y claridad: Puedo analizar problemas y defender puntos de vista.',
  570,
  false,
  true,
  15,
  20,
  array['spanish', 'b2', 'reading'],
  array['Desarrollo', 'Ventaja', 'Riesgo', 'Sin embargo'],
  '{"language":"Español","language_key":"spanish","level_title":"Debate y claridad","intro":"Puedo analizar problemas y defender puntos de vista.","mission":"Defiende una opinión sobre tecnología y educación.","grammar":"Subjuntivo, voz pasiva, oraciones relativas.","phrases":["Es necesario que...","No obstante...","Desde mi punto de vista...","La evidencia muestra..."],"vocabulary":[{"word":"Desarrollo","translation":"Development","example":"El desarrollo social es importante."},{"word":"Ventaja","translation":"Advantage","example":"Una ventaja es la rapidez."},{"word":"Riesgo","translation":"Risk","example":"Existe un riesgo claro."},{"word":"Sin embargo","translation":"However","example":"Sin embargo, hay límites."},{"word":"Propuesta","translation":"Proposal","example":"La propuesta es viable."},{"word":"Impacto","translation":"Impact","example":"El impacto fue positivo."}],"dialogue":[{"speaker":"Tutor","line":"Es necesario que...","translation":"Frase modelo"},{"speaker":"Student","line":"No obstante...","translation":"Respuesta guiada"}],"reading":{"text":"El uso de tecnología en la educación puede ampliar oportunidades, siempre que exista acompañamiento pedagógico y acceso equitativo.","questions":["¿Qué puede ampliar la tecnología?","¿Qué debe existir?","¿Cuál es el tema principal?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Desarrollo\"?","options":["Development","Advantage","Risk","However"],"answer":0},{"type":"writing","prompt":"Defiende una opinión sobre tecnología y educación.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Es necesario que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-b2-writing',
  'spanish',
  'B2',
  'writing',
  'Español B2 · Writing Challenge',
  'Debate y claridad: Puedo analizar problemas y defender puntos de vista.',
  580,
  false,
  true,
  15,
  20,
  array['spanish', 'b2', 'writing'],
  array['Desarrollo', 'Ventaja', 'Riesgo', 'Sin embargo'],
  '{"language":"Español","language_key":"spanish","level_title":"Debate y claridad","intro":"Puedo analizar problemas y defender puntos de vista.","mission":"Defiende una opinión sobre tecnología y educación.","grammar":"Subjuntivo, voz pasiva, oraciones relativas.","phrases":["Es necesario que...","No obstante...","Desde mi punto de vista...","La evidencia muestra..."],"vocabulary":[{"word":"Desarrollo","translation":"Development","example":"El desarrollo social es importante."},{"word":"Ventaja","translation":"Advantage","example":"Una ventaja es la rapidez."},{"word":"Riesgo","translation":"Risk","example":"Existe un riesgo claro."},{"word":"Sin embargo","translation":"However","example":"Sin embargo, hay límites."},{"word":"Propuesta","translation":"Proposal","example":"La propuesta es viable."},{"word":"Impacto","translation":"Impact","example":"El impacto fue positivo."}],"dialogue":[{"speaker":"Tutor","line":"Es necesario que...","translation":"Frase modelo"},{"speaker":"Student","line":"No obstante...","translation":"Respuesta guiada"}],"reading":{"text":"El uso de tecnología en la educación puede ampliar oportunidades, siempre que exista acompañamiento pedagógico y acceso equitativo.","questions":["¿Qué puede ampliar la tecnología?","¿Qué debe existir?","¿Cuál es el tema principal?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Desarrollo\"?","options":["Development","Advantage","Risk","However"],"answer":0},{"type":"writing","prompt":"Defiende una opinión sobre tecnología y educación.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Es necesario que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-b2-grammar',
  'spanish',
  'B2',
  'grammar',
  'Español B2 · Grammar Focus',
  'Debate y claridad: Puedo analizar problemas y defender puntos de vista.',
  590,
  false,
  true,
  15,
  20,
  array['spanish', 'b2', 'grammar'],
  array['Desarrollo', 'Ventaja', 'Riesgo', 'Sin embargo'],
  '{"language":"Español","language_key":"spanish","level_title":"Debate y claridad","intro":"Puedo analizar problemas y defender puntos de vista.","mission":"Defiende una opinión sobre tecnología y educación.","grammar":"Subjuntivo, voz pasiva, oraciones relativas.","phrases":["Es necesario que...","No obstante...","Desde mi punto de vista...","La evidencia muestra..."],"vocabulary":[{"word":"Desarrollo","translation":"Development","example":"El desarrollo social es importante."},{"word":"Ventaja","translation":"Advantage","example":"Una ventaja es la rapidez."},{"word":"Riesgo","translation":"Risk","example":"Existe un riesgo claro."},{"word":"Sin embargo","translation":"However","example":"Sin embargo, hay límites."},{"word":"Propuesta","translation":"Proposal","example":"La propuesta es viable."},{"word":"Impacto","translation":"Impact","example":"El impacto fue positivo."}],"dialogue":[{"speaker":"Tutor","line":"Es necesario que...","translation":"Frase modelo"},{"speaker":"Student","line":"No obstante...","translation":"Respuesta guiada"}],"reading":{"text":"El uso de tecnología en la educación puede ampliar oportunidades, siempre que exista acompañamiento pedagógico y acceso equitativo.","questions":["¿Qué puede ampliar la tecnología?","¿Qué debe existir?","¿Cuál es el tema principal?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Desarrollo\"?","options":["Development","Advantage","Risk","However"],"answer":0},{"type":"writing","prompt":"Defiende una opinión sobre tecnología y educación.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Es necesario que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-b2-vocabulary',
  'spanish',
  'B2',
  'vocabulary',
  'Español B2 · Vocabulary Boost',
  'Debate y claridad: Puedo analizar problemas y defender puntos de vista.',
  600,
  false,
  true,
  15,
  10,
  array['spanish', 'b2', 'vocabulary'],
  array['Desarrollo', 'Ventaja', 'Riesgo', 'Sin embargo'],
  '{"language":"Español","language_key":"spanish","level_title":"Debate y claridad","intro":"Puedo analizar problemas y defender puntos de vista.","mission":"Defiende una opinión sobre tecnología y educación.","grammar":"Subjuntivo, voz pasiva, oraciones relativas.","phrases":["Es necesario que...","No obstante...","Desde mi punto de vista...","La evidencia muestra..."],"vocabulary":[{"word":"Desarrollo","translation":"Development","example":"El desarrollo social es importante."},{"word":"Ventaja","translation":"Advantage","example":"Una ventaja es la rapidez."},{"word":"Riesgo","translation":"Risk","example":"Existe un riesgo claro."},{"word":"Sin embargo","translation":"However","example":"Sin embargo, hay límites."},{"word":"Propuesta","translation":"Proposal","example":"La propuesta es viable."},{"word":"Impacto","translation":"Impact","example":"El impacto fue positivo."}],"dialogue":[{"speaker":"Tutor","line":"Es necesario que...","translation":"Frase modelo"},{"speaker":"Student","line":"No obstante...","translation":"Respuesta guiada"}],"reading":{"text":"El uso de tecnología en la educación puede ampliar oportunidades, siempre que exista acompañamiento pedagógico y acceso equitativo.","questions":["¿Qué puede ampliar la tecnología?","¿Qué debe existir?","¿Cuál es el tema principal?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Desarrollo\"?","options":["Development","Advantage","Risk","However"],"answer":0},{"type":"writing","prompt":"Defiende una opinión sobre tecnología y educación.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Es necesario que...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-c1-listening',
  'spanish',
  'C1',
  'listening',
  'Español C1 · Listening Lab',
  'Precisión académica: Puedo escribir y hablar con registro formal y matices.',
  610,
  false,
  true,
  15,
  20,
  array['spanish', 'c1', 'listening'],
  array['Asimismo', 'Planteamiento', 'Matiz', 'Sostener'],
  '{"language":"Español","language_key":"spanish","level_title":"Precisión académica","intro":"Puedo escribir y hablar con registro formal y matices.","mission":"Reescribe una opinión con tono académico y conectores.","grammar":"Subjuntivo avanzado, perífrasis, marcadores discursivos.","phrases":["Cabe destacar que...","Desde una perspectiva...","No se trata solo de...","Resulta pertinente señalar..."],"vocabulary":[{"word":"Asimismo","translation":"Likewise","example":"Asimismo, se observan avances."},{"word":"Planteamiento","translation":"Approach","example":"El planteamiento es claro."},{"word":"Matiz","translation":"Nuance","example":"Hay un matiz importante."},{"word":"Sostener","translation":"To maintain","example":"El autor sostiene su idea."},{"word":"Alcance","translation":"Scope","example":"El alcance es amplio."},{"word":"Rigor","translation":"Rigor","example":"El texto tiene rigor."}],"dialogue":[{"speaker":"Tutor","line":"Cabe destacar que...","translation":"Frase modelo"},{"speaker":"Student","line":"Desde una perspectiva...","translation":"Respuesta guiada"}],"reading":{"text":"La competencia comunicativa exige dominio lingüístico, sensibilidad cultural y capacidad para ajustar el discurso a contextos específicos.","questions":["¿Qué exige la competencia comunicativa?","¿A qué se debe ajustar el discurso?","¿Qué palabra significa rigor?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Asimismo\"?","options":["Likewise","Approach","Nuance","To maintain"],"answer":0},{"type":"writing","prompt":"Reescribe una opinión con tono académico y conectores.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Cabe destacar que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-c1-speaking',
  'spanish',
  'C1',
  'speaking',
  'Español C1 · Speaking Mission',
  'Precisión académica: Puedo escribir y hablar con registro formal y matices.',
  620,
  false,
  true,
  15,
  20,
  array['spanish', 'c1', 'speaking'],
  array['Asimismo', 'Planteamiento', 'Matiz', 'Sostener'],
  '{"language":"Español","language_key":"spanish","level_title":"Precisión académica","intro":"Puedo escribir y hablar con registro formal y matices.","mission":"Reescribe una opinión con tono académico y conectores.","grammar":"Subjuntivo avanzado, perífrasis, marcadores discursivos.","phrases":["Cabe destacar que...","Desde una perspectiva...","No se trata solo de...","Resulta pertinente señalar..."],"vocabulary":[{"word":"Asimismo","translation":"Likewise","example":"Asimismo, se observan avances."},{"word":"Planteamiento","translation":"Approach","example":"El planteamiento es claro."},{"word":"Matiz","translation":"Nuance","example":"Hay un matiz importante."},{"word":"Sostener","translation":"To maintain","example":"El autor sostiene su idea."},{"word":"Alcance","translation":"Scope","example":"El alcance es amplio."},{"word":"Rigor","translation":"Rigor","example":"El texto tiene rigor."}],"dialogue":[{"speaker":"Tutor","line":"Cabe destacar que...","translation":"Frase modelo"},{"speaker":"Student","line":"Desde una perspectiva...","translation":"Respuesta guiada"}],"reading":{"text":"La competencia comunicativa exige dominio lingüístico, sensibilidad cultural y capacidad para ajustar el discurso a contextos específicos.","questions":["¿Qué exige la competencia comunicativa?","¿A qué se debe ajustar el discurso?","¿Qué palabra significa rigor?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Asimismo\"?","options":["Likewise","Approach","Nuance","To maintain"],"answer":0},{"type":"writing","prompt":"Reescribe una opinión con tono académico y conectores.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Cabe destacar que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-c1-reading',
  'spanish',
  'C1',
  'reading',
  'Español C1 · Reading Quest',
  'Precisión académica: Puedo escribir y hablar con registro formal y matices.',
  630,
  false,
  true,
  15,
  20,
  array['spanish', 'c1', 'reading'],
  array['Asimismo', 'Planteamiento', 'Matiz', 'Sostener'],
  '{"language":"Español","language_key":"spanish","level_title":"Precisión académica","intro":"Puedo escribir y hablar con registro formal y matices.","mission":"Reescribe una opinión con tono académico y conectores.","grammar":"Subjuntivo avanzado, perífrasis, marcadores discursivos.","phrases":["Cabe destacar que...","Desde una perspectiva...","No se trata solo de...","Resulta pertinente señalar..."],"vocabulary":[{"word":"Asimismo","translation":"Likewise","example":"Asimismo, se observan avances."},{"word":"Planteamiento","translation":"Approach","example":"El planteamiento es claro."},{"word":"Matiz","translation":"Nuance","example":"Hay un matiz importante."},{"word":"Sostener","translation":"To maintain","example":"El autor sostiene su idea."},{"word":"Alcance","translation":"Scope","example":"El alcance es amplio."},{"word":"Rigor","translation":"Rigor","example":"El texto tiene rigor."}],"dialogue":[{"speaker":"Tutor","line":"Cabe destacar que...","translation":"Frase modelo"},{"speaker":"Student","line":"Desde una perspectiva...","translation":"Respuesta guiada"}],"reading":{"text":"La competencia comunicativa exige dominio lingüístico, sensibilidad cultural y capacidad para ajustar el discurso a contextos específicos.","questions":["¿Qué exige la competencia comunicativa?","¿A qué se debe ajustar el discurso?","¿Qué palabra significa rigor?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Asimismo\"?","options":["Likewise","Approach","Nuance","To maintain"],"answer":0},{"type":"writing","prompt":"Reescribe una opinión con tono académico y conectores.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Cabe destacar que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-c1-writing',
  'spanish',
  'C1',
  'writing',
  'Español C1 · Writing Challenge',
  'Precisión académica: Puedo escribir y hablar con registro formal y matices.',
  640,
  false,
  true,
  15,
  20,
  array['spanish', 'c1', 'writing'],
  array['Asimismo', 'Planteamiento', 'Matiz', 'Sostener'],
  '{"language":"Español","language_key":"spanish","level_title":"Precisión académica","intro":"Puedo escribir y hablar con registro formal y matices.","mission":"Reescribe una opinión con tono académico y conectores.","grammar":"Subjuntivo avanzado, perífrasis, marcadores discursivos.","phrases":["Cabe destacar que...","Desde una perspectiva...","No se trata solo de...","Resulta pertinente señalar..."],"vocabulary":[{"word":"Asimismo","translation":"Likewise","example":"Asimismo, se observan avances."},{"word":"Planteamiento","translation":"Approach","example":"El planteamiento es claro."},{"word":"Matiz","translation":"Nuance","example":"Hay un matiz importante."},{"word":"Sostener","translation":"To maintain","example":"El autor sostiene su idea."},{"word":"Alcance","translation":"Scope","example":"El alcance es amplio."},{"word":"Rigor","translation":"Rigor","example":"El texto tiene rigor."}],"dialogue":[{"speaker":"Tutor","line":"Cabe destacar que...","translation":"Frase modelo"},{"speaker":"Student","line":"Desde una perspectiva...","translation":"Respuesta guiada"}],"reading":{"text":"La competencia comunicativa exige dominio lingüístico, sensibilidad cultural y capacidad para ajustar el discurso a contextos específicos.","questions":["¿Qué exige la competencia comunicativa?","¿A qué se debe ajustar el discurso?","¿Qué palabra significa rigor?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Asimismo\"?","options":["Likewise","Approach","Nuance","To maintain"],"answer":0},{"type":"writing","prompt":"Reescribe una opinión con tono académico y conectores.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Cabe destacar que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-c1-grammar',
  'spanish',
  'C1',
  'grammar',
  'Español C1 · Grammar Focus',
  'Precisión académica: Puedo escribir y hablar con registro formal y matices.',
  650,
  false,
  true,
  15,
  20,
  array['spanish', 'c1', 'grammar'],
  array['Asimismo', 'Planteamiento', 'Matiz', 'Sostener'],
  '{"language":"Español","language_key":"spanish","level_title":"Precisión académica","intro":"Puedo escribir y hablar con registro formal y matices.","mission":"Reescribe una opinión con tono académico y conectores.","grammar":"Subjuntivo avanzado, perífrasis, marcadores discursivos.","phrases":["Cabe destacar que...","Desde una perspectiva...","No se trata solo de...","Resulta pertinente señalar..."],"vocabulary":[{"word":"Asimismo","translation":"Likewise","example":"Asimismo, se observan avances."},{"word":"Planteamiento","translation":"Approach","example":"El planteamiento es claro."},{"word":"Matiz","translation":"Nuance","example":"Hay un matiz importante."},{"word":"Sostener","translation":"To maintain","example":"El autor sostiene su idea."},{"word":"Alcance","translation":"Scope","example":"El alcance es amplio."},{"word":"Rigor","translation":"Rigor","example":"El texto tiene rigor."}],"dialogue":[{"speaker":"Tutor","line":"Cabe destacar que...","translation":"Frase modelo"},{"speaker":"Student","line":"Desde una perspectiva...","translation":"Respuesta guiada"}],"reading":{"text":"La competencia comunicativa exige dominio lingüístico, sensibilidad cultural y capacidad para ajustar el discurso a contextos específicos.","questions":["¿Qué exige la competencia comunicativa?","¿A qué se debe ajustar el discurso?","¿Qué palabra significa rigor?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Asimismo\"?","options":["Likewise","Approach","Nuance","To maintain"],"answer":0},{"type":"writing","prompt":"Reescribe una opinión con tono académico y conectores.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Cabe destacar que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-c1-vocabulary',
  'spanish',
  'C1',
  'vocabulary',
  'Español C1 · Vocabulary Boost',
  'Precisión académica: Puedo escribir y hablar con registro formal y matices.',
  660,
  false,
  true,
  15,
  10,
  array['spanish', 'c1', 'vocabulary'],
  array['Asimismo', 'Planteamiento', 'Matiz', 'Sostener'],
  '{"language":"Español","language_key":"spanish","level_title":"Precisión académica","intro":"Puedo escribir y hablar con registro formal y matices.","mission":"Reescribe una opinión con tono académico y conectores.","grammar":"Subjuntivo avanzado, perífrasis, marcadores discursivos.","phrases":["Cabe destacar que...","Desde una perspectiva...","No se trata solo de...","Resulta pertinente señalar..."],"vocabulary":[{"word":"Asimismo","translation":"Likewise","example":"Asimismo, se observan avances."},{"word":"Planteamiento","translation":"Approach","example":"El planteamiento es claro."},{"word":"Matiz","translation":"Nuance","example":"Hay un matiz importante."},{"word":"Sostener","translation":"To maintain","example":"El autor sostiene su idea."},{"word":"Alcance","translation":"Scope","example":"El alcance es amplio."},{"word":"Rigor","translation":"Rigor","example":"El texto tiene rigor."}],"dialogue":[{"speaker":"Tutor","line":"Cabe destacar que...","translation":"Frase modelo"},{"speaker":"Student","line":"Desde una perspectiva...","translation":"Respuesta guiada"}],"reading":{"text":"La competencia comunicativa exige dominio lingüístico, sensibilidad cultural y capacidad para ajustar el discurso a contextos específicos.","questions":["¿Qué exige la competencia comunicativa?","¿A qué se debe ajustar el discurso?","¿Qué palabra significa rigor?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Asimismo\"?","options":["Likewise","Approach","Nuance","To maintain"],"answer":0},{"type":"writing","prompt":"Reescribe una opinión con tono académico y conectores.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Cabe destacar que...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-c2-listening',
  'spanish',
  'C2',
  'listening',
  'Español C2 · Listening Lab',
  'Dominio superior: Puedo expresarme con naturalidad, riqueza y precisión total.',
  670,
  false,
  true,
  15,
  20,
  array['spanish', 'c2', 'listening'],
  array['Elocuente', 'Sutileza', 'Contundente', 'Cabal'],
  '{"language":"Español","language_key":"spanish","level_title":"Dominio superior","intro":"Puedo expresarme con naturalidad, riqueza y precisión total.","mission":"Redacta una reflexión breve con tono elegante y persuasivo.","grammar":"Estilo, retórica, ironía, cohesión avanzada.","phrases":["Conviene advertir que...","Lejos de ser simple...","La cuestión de fondo...","En términos más precisos..."],"vocabulary":[{"word":"Elocuente","translation":"Eloquent","example":"Su discurso fue elocuente."},{"word":"Sutileza","translation":"Subtlety","example":"La sutileza del texto impresiona."},{"word":"Contundente","translation":"Forceful","example":"Presentó un argumento contundente."},{"word":"Cabal","translation":"Complete","example":"Tiene una comprensión cabal."},{"word":"Discernir","translation":"To discern","example":"Es necesario discernir."},{"word":"Matizado","translation":"Nuanced","example":"Ofrece un análisis matizado."}],"dialogue":[{"speaker":"Tutor","line":"Conviene advertir que...","translation":"Frase modelo"},{"speaker":"Student","line":"Lejos de ser simple...","translation":"Respuesta guiada"}],"reading":{"text":"El dominio pleno de una lengua permite no solo comunicar ideas, sino también modular intenciones, insinuar significados y construir presencia discursiva.","questions":["¿Qué permite el dominio pleno?","¿Qué puede modular?","¿Qué construye?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Elocuente\"?","options":["Eloquent","Subtlety","Forceful","Complete"],"answer":0},{"type":"writing","prompt":"Redacta una reflexión breve con tono elegante y persuasivo.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Conviene advertir que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-c2-speaking',
  'spanish',
  'C2',
  'speaking',
  'Español C2 · Speaking Mission',
  'Dominio superior: Puedo expresarme con naturalidad, riqueza y precisión total.',
  680,
  false,
  true,
  15,
  20,
  array['spanish', 'c2', 'speaking'],
  array['Elocuente', 'Sutileza', 'Contundente', 'Cabal'],
  '{"language":"Español","language_key":"spanish","level_title":"Dominio superior","intro":"Puedo expresarme con naturalidad, riqueza y precisión total.","mission":"Redacta una reflexión breve con tono elegante y persuasivo.","grammar":"Estilo, retórica, ironía, cohesión avanzada.","phrases":["Conviene advertir que...","Lejos de ser simple...","La cuestión de fondo...","En términos más precisos..."],"vocabulary":[{"word":"Elocuente","translation":"Eloquent","example":"Su discurso fue elocuente."},{"word":"Sutileza","translation":"Subtlety","example":"La sutileza del texto impresiona."},{"word":"Contundente","translation":"Forceful","example":"Presentó un argumento contundente."},{"word":"Cabal","translation":"Complete","example":"Tiene una comprensión cabal."},{"word":"Discernir","translation":"To discern","example":"Es necesario discernir."},{"word":"Matizado","translation":"Nuanced","example":"Ofrece un análisis matizado."}],"dialogue":[{"speaker":"Tutor","line":"Conviene advertir que...","translation":"Frase modelo"},{"speaker":"Student","line":"Lejos de ser simple...","translation":"Respuesta guiada"}],"reading":{"text":"El dominio pleno de una lengua permite no solo comunicar ideas, sino también modular intenciones, insinuar significados y construir presencia discursiva.","questions":["¿Qué permite el dominio pleno?","¿Qué puede modular?","¿Qué construye?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Elocuente\"?","options":["Eloquent","Subtlety","Forceful","Complete"],"answer":0},{"type":"writing","prompt":"Redacta una reflexión breve con tono elegante y persuasivo.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Conviene advertir que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-c2-reading',
  'spanish',
  'C2',
  'reading',
  'Español C2 · Reading Quest',
  'Dominio superior: Puedo expresarme con naturalidad, riqueza y precisión total.',
  690,
  false,
  true,
  15,
  20,
  array['spanish', 'c2', 'reading'],
  array['Elocuente', 'Sutileza', 'Contundente', 'Cabal'],
  '{"language":"Español","language_key":"spanish","level_title":"Dominio superior","intro":"Puedo expresarme con naturalidad, riqueza y precisión total.","mission":"Redacta una reflexión breve con tono elegante y persuasivo.","grammar":"Estilo, retórica, ironía, cohesión avanzada.","phrases":["Conviene advertir que...","Lejos de ser simple...","La cuestión de fondo...","En términos más precisos..."],"vocabulary":[{"word":"Elocuente","translation":"Eloquent","example":"Su discurso fue elocuente."},{"word":"Sutileza","translation":"Subtlety","example":"La sutileza del texto impresiona."},{"word":"Contundente","translation":"Forceful","example":"Presentó un argumento contundente."},{"word":"Cabal","translation":"Complete","example":"Tiene una comprensión cabal."},{"word":"Discernir","translation":"To discern","example":"Es necesario discernir."},{"word":"Matizado","translation":"Nuanced","example":"Ofrece un análisis matizado."}],"dialogue":[{"speaker":"Tutor","line":"Conviene advertir que...","translation":"Frase modelo"},{"speaker":"Student","line":"Lejos de ser simple...","translation":"Respuesta guiada"}],"reading":{"text":"El dominio pleno de una lengua permite no solo comunicar ideas, sino también modular intenciones, insinuar significados y construir presencia discursiva.","questions":["¿Qué permite el dominio pleno?","¿Qué puede modular?","¿Qué construye?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Elocuente\"?","options":["Eloquent","Subtlety","Forceful","Complete"],"answer":0},{"type":"writing","prompt":"Redacta una reflexión breve con tono elegante y persuasivo.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Conviene advertir que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-c2-writing',
  'spanish',
  'C2',
  'writing',
  'Español C2 · Writing Challenge',
  'Dominio superior: Puedo expresarme con naturalidad, riqueza y precisión total.',
  700,
  false,
  true,
  15,
  20,
  array['spanish', 'c2', 'writing'],
  array['Elocuente', 'Sutileza', 'Contundente', 'Cabal'],
  '{"language":"Español","language_key":"spanish","level_title":"Dominio superior","intro":"Puedo expresarme con naturalidad, riqueza y precisión total.","mission":"Redacta una reflexión breve con tono elegante y persuasivo.","grammar":"Estilo, retórica, ironía, cohesión avanzada.","phrases":["Conviene advertir que...","Lejos de ser simple...","La cuestión de fondo...","En términos más precisos..."],"vocabulary":[{"word":"Elocuente","translation":"Eloquent","example":"Su discurso fue elocuente."},{"word":"Sutileza","translation":"Subtlety","example":"La sutileza del texto impresiona."},{"word":"Contundente","translation":"Forceful","example":"Presentó un argumento contundente."},{"word":"Cabal","translation":"Complete","example":"Tiene una comprensión cabal."},{"word":"Discernir","translation":"To discern","example":"Es necesario discernir."},{"word":"Matizado","translation":"Nuanced","example":"Ofrece un análisis matizado."}],"dialogue":[{"speaker":"Tutor","line":"Conviene advertir que...","translation":"Frase modelo"},{"speaker":"Student","line":"Lejos de ser simple...","translation":"Respuesta guiada"}],"reading":{"text":"El dominio pleno de una lengua permite no solo comunicar ideas, sino también modular intenciones, insinuar significados y construir presencia discursiva.","questions":["¿Qué permite el dominio pleno?","¿Qué puede modular?","¿Qué construye?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Elocuente\"?","options":["Eloquent","Subtlety","Forceful","Complete"],"answer":0},{"type":"writing","prompt":"Redacta una reflexión breve con tono elegante y persuasivo.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Conviene advertir que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-c2-grammar',
  'spanish',
  'C2',
  'grammar',
  'Español C2 · Grammar Focus',
  'Dominio superior: Puedo expresarme con naturalidad, riqueza y precisión total.',
  710,
  false,
  true,
  15,
  20,
  array['spanish', 'c2', 'grammar'],
  array['Elocuente', 'Sutileza', 'Contundente', 'Cabal'],
  '{"language":"Español","language_key":"spanish","level_title":"Dominio superior","intro":"Puedo expresarme con naturalidad, riqueza y precisión total.","mission":"Redacta una reflexión breve con tono elegante y persuasivo.","grammar":"Estilo, retórica, ironía, cohesión avanzada.","phrases":["Conviene advertir que...","Lejos de ser simple...","La cuestión de fondo...","En términos más precisos..."],"vocabulary":[{"word":"Elocuente","translation":"Eloquent","example":"Su discurso fue elocuente."},{"word":"Sutileza","translation":"Subtlety","example":"La sutileza del texto impresiona."},{"word":"Contundente","translation":"Forceful","example":"Presentó un argumento contundente."},{"word":"Cabal","translation":"Complete","example":"Tiene una comprensión cabal."},{"word":"Discernir","translation":"To discern","example":"Es necesario discernir."},{"word":"Matizado","translation":"Nuanced","example":"Ofrece un análisis matizado."}],"dialogue":[{"speaker":"Tutor","line":"Conviene advertir que...","translation":"Frase modelo"},{"speaker":"Student","line":"Lejos de ser simple...","translation":"Respuesta guiada"}],"reading":{"text":"El dominio pleno de una lengua permite no solo comunicar ideas, sino también modular intenciones, insinuar significados y construir presencia discursiva.","questions":["¿Qué permite el dominio pleno?","¿Qué puede modular?","¿Qué construye?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Elocuente\"?","options":["Eloquent","Subtlety","Forceful","Complete"],"answer":0},{"type":"writing","prompt":"Redacta una reflexión breve con tono elegante y persuasivo.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Conviene advertir que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'spanish-c2-vocabulary',
  'spanish',
  'C2',
  'vocabulary',
  'Español C2 · Vocabulary Boost',
  'Dominio superior: Puedo expresarme con naturalidad, riqueza y precisión total.',
  720,
  false,
  true,
  15,
  10,
  array['spanish', 'c2', 'vocabulary'],
  array['Elocuente', 'Sutileza', 'Contundente', 'Cabal'],
  '{"language":"Español","language_key":"spanish","level_title":"Dominio superior","intro":"Puedo expresarme con naturalidad, riqueza y precisión total.","mission":"Redacta una reflexión breve con tono elegante y persuasivo.","grammar":"Estilo, retórica, ironía, cohesión avanzada.","phrases":["Conviene advertir que...","Lejos de ser simple...","La cuestión de fondo...","En términos más precisos..."],"vocabulary":[{"word":"Elocuente","translation":"Eloquent","example":"Su discurso fue elocuente."},{"word":"Sutileza","translation":"Subtlety","example":"La sutileza del texto impresiona."},{"word":"Contundente","translation":"Forceful","example":"Presentó un argumento contundente."},{"word":"Cabal","translation":"Complete","example":"Tiene una comprensión cabal."},{"word":"Discernir","translation":"To discern","example":"Es necesario discernir."},{"word":"Matizado","translation":"Nuanced","example":"Ofrece un análisis matizado."}],"dialogue":[{"speaker":"Tutor","line":"Conviene advertir que...","translation":"Frase modelo"},{"speaker":"Student","line":"Lejos de ser simple...","translation":"Respuesta guiada"}],"reading":{"text":"El dominio pleno de una lengua permite no solo comunicar ideas, sino también modular intenciones, insinuar significados y construir presencia discursiva.","questions":["¿Qué permite el dominio pleno?","¿Qué puede modular?","¿Qué construye?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Elocuente\"?","options":["Eloquent","Subtlety","Forceful","Complete"],"answer":0},{"type":"writing","prompt":"Redacta una reflexión breve con tono elegante y persuasivo.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Conviene advertir que...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-a1-listening',
  'french',
  'A1',
  'listening',
  'Français A1 · Listening Lab',
  'Français de survie: Puedo saludar, presentarme y usar frases básicas.',
  730,
  true,
  true,
  10,
  20,
  array['french', 'a1', 'listening'],
  array['Bonjour', 'Merci', 'Ami', 'Maison'],
  '{"language":"Français","language_key":"french","level_title":"Français de survie","intro":"Puedo saludar, presentarme y usar frases básicas.","mission":"Présente-toi en 4 phrases simples.","grammar":"Être, avoir, articles, género, presente básico.","phrases":["Je m’appelle...","Je suis de...","Enchanté.","Je ne comprends pas."],"vocabulary":[{"word":"Bonjour","translation":"Buenos días","example":"Bonjour, je m’appelle Ana."},{"word":"Merci","translation":"Gracias","example":"Merci beaucoup."},{"word":"Ami","translation":"Amigo","example":"Il est mon ami."},{"word":"Maison","translation":"Casa","example":"La maison est grande."},{"word":"École","translation":"Escuela","example":"Je vais à l’école."},{"word":"Famille","translation":"Familia","example":"Ma famille est ici."}],"dialogue":[{"speaker":"Tutor","line":"Je m’appelle...","translation":"Frase modelo"},{"speaker":"Student","line":"Je suis de...","translation":"Respuesta guiada"}],"reading":{"text":"Claire habite à Paris. Elle étudie le français le matin et parle avec son ami Paul.","questions":["Où habite Claire?","Quand étudie-t-elle?","Avec qui parle-t-elle?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Bonjour\"?","options":["Buenos días","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Présente-toi en 4 phrases simples.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Je m’appelle...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-a1-speaking',
  'french',
  'A1',
  'speaking',
  'Français A1 · Speaking Mission',
  'Français de survie: Puedo saludar, presentarme y usar frases básicas.',
  740,
  true,
  true,
  10,
  20,
  array['french', 'a1', 'speaking'],
  array['Bonjour', 'Merci', 'Ami', 'Maison'],
  '{"language":"Français","language_key":"french","level_title":"Français de survie","intro":"Puedo saludar, presentarme y usar frases básicas.","mission":"Présente-toi en 4 phrases simples.","grammar":"Être, avoir, articles, género, presente básico.","phrases":["Je m’appelle...","Je suis de...","Enchanté.","Je ne comprends pas."],"vocabulary":[{"word":"Bonjour","translation":"Buenos días","example":"Bonjour, je m’appelle Ana."},{"word":"Merci","translation":"Gracias","example":"Merci beaucoup."},{"word":"Ami","translation":"Amigo","example":"Il est mon ami."},{"word":"Maison","translation":"Casa","example":"La maison est grande."},{"word":"École","translation":"Escuela","example":"Je vais à l’école."},{"word":"Famille","translation":"Familia","example":"Ma famille est ici."}],"dialogue":[{"speaker":"Tutor","line":"Je m’appelle...","translation":"Frase modelo"},{"speaker":"Student","line":"Je suis de...","translation":"Respuesta guiada"}],"reading":{"text":"Claire habite à Paris. Elle étudie le français le matin et parle avec son ami Paul.","questions":["Où habite Claire?","Quand étudie-t-elle?","Avec qui parle-t-elle?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Bonjour\"?","options":["Buenos días","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Présente-toi en 4 phrases simples.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Je m’appelle...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-a1-reading',
  'french',
  'A1',
  'reading',
  'Français A1 · Reading Quest',
  'Français de survie: Puedo saludar, presentarme y usar frases básicas.',
  750,
  true,
  true,
  10,
  20,
  array['french', 'a1', 'reading'],
  array['Bonjour', 'Merci', 'Ami', 'Maison'],
  '{"language":"Français","language_key":"french","level_title":"Français de survie","intro":"Puedo saludar, presentarme y usar frases básicas.","mission":"Présente-toi en 4 phrases simples.","grammar":"Être, avoir, articles, género, presente básico.","phrases":["Je m’appelle...","Je suis de...","Enchanté.","Je ne comprends pas."],"vocabulary":[{"word":"Bonjour","translation":"Buenos días","example":"Bonjour, je m’appelle Ana."},{"word":"Merci","translation":"Gracias","example":"Merci beaucoup."},{"word":"Ami","translation":"Amigo","example":"Il est mon ami."},{"word":"Maison","translation":"Casa","example":"La maison est grande."},{"word":"École","translation":"Escuela","example":"Je vais à l’école."},{"word":"Famille","translation":"Familia","example":"Ma famille est ici."}],"dialogue":[{"speaker":"Tutor","line":"Je m’appelle...","translation":"Frase modelo"},{"speaker":"Student","line":"Je suis de...","translation":"Respuesta guiada"}],"reading":{"text":"Claire habite à Paris. Elle étudie le français le matin et parle avec son ami Paul.","questions":["Où habite Claire?","Quand étudie-t-elle?","Avec qui parle-t-elle?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Bonjour\"?","options":["Buenos días","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Présente-toi en 4 phrases simples.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Je m’appelle...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-a1-writing',
  'french',
  'A1',
  'writing',
  'Français A1 · Writing Challenge',
  'Français de survie: Puedo saludar, presentarme y usar frases básicas.',
  760,
  true,
  true,
  10,
  20,
  array['french', 'a1', 'writing'],
  array['Bonjour', 'Merci', 'Ami', 'Maison'],
  '{"language":"Français","language_key":"french","level_title":"Français de survie","intro":"Puedo saludar, presentarme y usar frases básicas.","mission":"Présente-toi en 4 phrases simples.","grammar":"Être, avoir, articles, género, presente básico.","phrases":["Je m’appelle...","Je suis de...","Enchanté.","Je ne comprends pas."],"vocabulary":[{"word":"Bonjour","translation":"Buenos días","example":"Bonjour, je m’appelle Ana."},{"word":"Merci","translation":"Gracias","example":"Merci beaucoup."},{"word":"Ami","translation":"Amigo","example":"Il est mon ami."},{"word":"Maison","translation":"Casa","example":"La maison est grande."},{"word":"École","translation":"Escuela","example":"Je vais à l’école."},{"word":"Famille","translation":"Familia","example":"Ma famille est ici."}],"dialogue":[{"speaker":"Tutor","line":"Je m’appelle...","translation":"Frase modelo"},{"speaker":"Student","line":"Je suis de...","translation":"Respuesta guiada"}],"reading":{"text":"Claire habite à Paris. Elle étudie le français le matin et parle avec son ami Paul.","questions":["Où habite Claire?","Quand étudie-t-elle?","Avec qui parle-t-elle?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Bonjour\"?","options":["Buenos días","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Présente-toi en 4 phrases simples.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Je m’appelle...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-a1-grammar',
  'french',
  'A1',
  'grammar',
  'Français A1 · Grammar Focus',
  'Français de survie: Puedo saludar, presentarme y usar frases básicas.',
  770,
  true,
  true,
  10,
  20,
  array['french', 'a1', 'grammar'],
  array['Bonjour', 'Merci', 'Ami', 'Maison'],
  '{"language":"Français","language_key":"french","level_title":"Français de survie","intro":"Puedo saludar, presentarme y usar frases básicas.","mission":"Présente-toi en 4 phrases simples.","grammar":"Être, avoir, articles, género, presente básico.","phrases":["Je m’appelle...","Je suis de...","Enchanté.","Je ne comprends pas."],"vocabulary":[{"word":"Bonjour","translation":"Buenos días","example":"Bonjour, je m’appelle Ana."},{"word":"Merci","translation":"Gracias","example":"Merci beaucoup."},{"word":"Ami","translation":"Amigo","example":"Il est mon ami."},{"word":"Maison","translation":"Casa","example":"La maison est grande."},{"word":"École","translation":"Escuela","example":"Je vais à l’école."},{"word":"Famille","translation":"Familia","example":"Ma famille est ici."}],"dialogue":[{"speaker":"Tutor","line":"Je m’appelle...","translation":"Frase modelo"},{"speaker":"Student","line":"Je suis de...","translation":"Respuesta guiada"}],"reading":{"text":"Claire habite à Paris. Elle étudie le français le matin et parle avec son ami Paul.","questions":["Où habite Claire?","Quand étudie-t-elle?","Avec qui parle-t-elle?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Bonjour\"?","options":["Buenos días","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Présente-toi en 4 phrases simples.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Je m’appelle...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-a1-vocabulary',
  'french',
  'A1',
  'vocabulary',
  'Français A1 · Vocabulary Boost',
  'Français de survie: Puedo saludar, presentarme y usar frases básicas.',
  780,
  true,
  true,
  10,
  10,
  array['french', 'a1', 'vocabulary'],
  array['Bonjour', 'Merci', 'Ami', 'Maison'],
  '{"language":"Français","language_key":"french","level_title":"Français de survie","intro":"Puedo saludar, presentarme y usar frases básicas.","mission":"Présente-toi en 4 phrases simples.","grammar":"Être, avoir, articles, género, presente básico.","phrases":["Je m’appelle...","Je suis de...","Enchanté.","Je ne comprends pas."],"vocabulary":[{"word":"Bonjour","translation":"Buenos días","example":"Bonjour, je m’appelle Ana."},{"word":"Merci","translation":"Gracias","example":"Merci beaucoup."},{"word":"Ami","translation":"Amigo","example":"Il est mon ami."},{"word":"Maison","translation":"Casa","example":"La maison est grande."},{"word":"École","translation":"Escuela","example":"Je vais à l’école."},{"word":"Famille","translation":"Familia","example":"Ma famille est ici."}],"dialogue":[{"speaker":"Tutor","line":"Je m’appelle...","translation":"Frase modelo"},{"speaker":"Student","line":"Je suis de...","translation":"Respuesta guiada"}],"reading":{"text":"Claire habite à Paris. Elle étudie le français le matin et parle avec son ami Paul.","questions":["Où habite Claire?","Quand étudie-t-elle?","Avec qui parle-t-elle?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Bonjour\"?","options":["Buenos días","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Présente-toi en 4 phrases simples.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Je m’appelle...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-a2-listening',
  'french',
  'A2',
  'listening',
  'Français A2 · Listening Lab',
  'Situations quotidiennes: Puedo hablar de rutinas, compras, horarios y gustos.',
  790,
  true,
  true,
  10,
  20,
  array['french', 'a2', 'listening'],
  array['Aujourd’hui', 'Magasin', 'Petit déjeuner', 'Voyage'],
  '{"language":"Français","language_key":"french","level_title":"Situations quotidiennes","intro":"Puedo hablar de rutinas, compras, horarios y gustos.","mission":"Décris ta journée avec cinq actions.","grammar":"Passé composé, futur proche, adjectifs, prépositions.","phrases":["Je voudrais...","Tous les jours...","Hier, je suis allé...","Il faut..."],"vocabulary":[{"word":"Aujourd’hui","translation":"Hoy","example":"Aujourd’hui, je travaille."},{"word":"Magasin","translation":"Tienda","example":"Je vais au magasin."},{"word":"Petit déjeuner","translation":"Desayuno","example":"Je prends le petit déjeuner."},{"word":"Voyage","translation":"Viaje","example":"Le voyage est court."},{"word":"Temps","translation":"Tiempo/clima","example":"Il fait beau."},{"word":"Après","translation":"Después","example":"Après la classe, je lis."}],"dialogue":[{"speaker":"Tutor","line":"Je voudrais...","translation":"Frase modelo"},{"speaker":"Student","line":"Tous les jours...","translation":"Respuesta guiada"}],"reading":{"text":"Marc travaille le matin. Après le travail, il achète du pain et prépare un café.","questions":["Quand travaille Marc?","Qu’achète-t-il?","Que prépare-t-il?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Aujourd’hui\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Décris ta journée avec cinq actions.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Je voudrais...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-a2-speaking',
  'french',
  'A2',
  'speaking',
  'Français A2 · Speaking Mission',
  'Situations quotidiennes: Puedo hablar de rutinas, compras, horarios y gustos.',
  800,
  true,
  true,
  10,
  20,
  array['french', 'a2', 'speaking'],
  array['Aujourd’hui', 'Magasin', 'Petit déjeuner', 'Voyage'],
  '{"language":"Français","language_key":"french","level_title":"Situations quotidiennes","intro":"Puedo hablar de rutinas, compras, horarios y gustos.","mission":"Décris ta journée avec cinq actions.","grammar":"Passé composé, futur proche, adjectifs, prépositions.","phrases":["Je voudrais...","Tous les jours...","Hier, je suis allé...","Il faut..."],"vocabulary":[{"word":"Aujourd’hui","translation":"Hoy","example":"Aujourd’hui, je travaille."},{"word":"Magasin","translation":"Tienda","example":"Je vais au magasin."},{"word":"Petit déjeuner","translation":"Desayuno","example":"Je prends le petit déjeuner."},{"word":"Voyage","translation":"Viaje","example":"Le voyage est court."},{"word":"Temps","translation":"Tiempo/clima","example":"Il fait beau."},{"word":"Après","translation":"Después","example":"Après la classe, je lis."}],"dialogue":[{"speaker":"Tutor","line":"Je voudrais...","translation":"Frase modelo"},{"speaker":"Student","line":"Tous les jours...","translation":"Respuesta guiada"}],"reading":{"text":"Marc travaille le matin. Après le travail, il achète du pain et prépare un café.","questions":["Quand travaille Marc?","Qu’achète-t-il?","Que prépare-t-il?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Aujourd’hui\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Décris ta journée avec cinq actions.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Je voudrais...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-a2-reading',
  'french',
  'A2',
  'reading',
  'Français A2 · Reading Quest',
  'Situations quotidiennes: Puedo hablar de rutinas, compras, horarios y gustos.',
  810,
  true,
  true,
  10,
  20,
  array['french', 'a2', 'reading'],
  array['Aujourd’hui', 'Magasin', 'Petit déjeuner', 'Voyage'],
  '{"language":"Français","language_key":"french","level_title":"Situations quotidiennes","intro":"Puedo hablar de rutinas, compras, horarios y gustos.","mission":"Décris ta journée avec cinq actions.","grammar":"Passé composé, futur proche, adjectifs, prépositions.","phrases":["Je voudrais...","Tous les jours...","Hier, je suis allé...","Il faut..."],"vocabulary":[{"word":"Aujourd’hui","translation":"Hoy","example":"Aujourd’hui, je travaille."},{"word":"Magasin","translation":"Tienda","example":"Je vais au magasin."},{"word":"Petit déjeuner","translation":"Desayuno","example":"Je prends le petit déjeuner."},{"word":"Voyage","translation":"Viaje","example":"Le voyage est court."},{"word":"Temps","translation":"Tiempo/clima","example":"Il fait beau."},{"word":"Après","translation":"Después","example":"Après la classe, je lis."}],"dialogue":[{"speaker":"Tutor","line":"Je voudrais...","translation":"Frase modelo"},{"speaker":"Student","line":"Tous les jours...","translation":"Respuesta guiada"}],"reading":{"text":"Marc travaille le matin. Après le travail, il achète du pain et prépare un café.","questions":["Quand travaille Marc?","Qu’achète-t-il?","Que prépare-t-il?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Aujourd’hui\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Décris ta journée avec cinq actions.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Je voudrais...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-a2-writing',
  'french',
  'A2',
  'writing',
  'Français A2 · Writing Challenge',
  'Situations quotidiennes: Puedo hablar de rutinas, compras, horarios y gustos.',
  820,
  true,
  true,
  10,
  20,
  array['french', 'a2', 'writing'],
  array['Aujourd’hui', 'Magasin', 'Petit déjeuner', 'Voyage'],
  '{"language":"Français","language_key":"french","level_title":"Situations quotidiennes","intro":"Puedo hablar de rutinas, compras, horarios y gustos.","mission":"Décris ta journée avec cinq actions.","grammar":"Passé composé, futur proche, adjectifs, prépositions.","phrases":["Je voudrais...","Tous les jours...","Hier, je suis allé...","Il faut..."],"vocabulary":[{"word":"Aujourd’hui","translation":"Hoy","example":"Aujourd’hui, je travaille."},{"word":"Magasin","translation":"Tienda","example":"Je vais au magasin."},{"word":"Petit déjeuner","translation":"Desayuno","example":"Je prends le petit déjeuner."},{"word":"Voyage","translation":"Viaje","example":"Le voyage est court."},{"word":"Temps","translation":"Tiempo/clima","example":"Il fait beau."},{"word":"Après","translation":"Después","example":"Après la classe, je lis."}],"dialogue":[{"speaker":"Tutor","line":"Je voudrais...","translation":"Frase modelo"},{"speaker":"Student","line":"Tous les jours...","translation":"Respuesta guiada"}],"reading":{"text":"Marc travaille le matin. Après le travail, il achète du pain et prépare un café.","questions":["Quand travaille Marc?","Qu’achète-t-il?","Que prépare-t-il?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Aujourd’hui\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Décris ta journée avec cinq actions.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Je voudrais...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-a2-grammar',
  'french',
  'A2',
  'grammar',
  'Français A2 · Grammar Focus',
  'Situations quotidiennes: Puedo hablar de rutinas, compras, horarios y gustos.',
  830,
  true,
  true,
  10,
  20,
  array['french', 'a2', 'grammar'],
  array['Aujourd’hui', 'Magasin', 'Petit déjeuner', 'Voyage'],
  '{"language":"Français","language_key":"french","level_title":"Situations quotidiennes","intro":"Puedo hablar de rutinas, compras, horarios y gustos.","mission":"Décris ta journée avec cinq actions.","grammar":"Passé composé, futur proche, adjectifs, prépositions.","phrases":["Je voudrais...","Tous les jours...","Hier, je suis allé...","Il faut..."],"vocabulary":[{"word":"Aujourd’hui","translation":"Hoy","example":"Aujourd’hui, je travaille."},{"word":"Magasin","translation":"Tienda","example":"Je vais au magasin."},{"word":"Petit déjeuner","translation":"Desayuno","example":"Je prends le petit déjeuner."},{"word":"Voyage","translation":"Viaje","example":"Le voyage est court."},{"word":"Temps","translation":"Tiempo/clima","example":"Il fait beau."},{"word":"Après","translation":"Después","example":"Après la classe, je lis."}],"dialogue":[{"speaker":"Tutor","line":"Je voudrais...","translation":"Frase modelo"},{"speaker":"Student","line":"Tous les jours...","translation":"Respuesta guiada"}],"reading":{"text":"Marc travaille le matin. Après le travail, il achète du pain et prépare un café.","questions":["Quand travaille Marc?","Qu’achète-t-il?","Que prépare-t-il?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Aujourd’hui\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Décris ta journée avec cinq actions.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Je voudrais...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-a2-vocabulary',
  'french',
  'A2',
  'vocabulary',
  'Français A2 · Vocabulary Boost',
  'Situations quotidiennes: Puedo hablar de rutinas, compras, horarios y gustos.',
  840,
  true,
  true,
  10,
  10,
  array['french', 'a2', 'vocabulary'],
  array['Aujourd’hui', 'Magasin', 'Petit déjeuner', 'Voyage'],
  '{"language":"Français","language_key":"french","level_title":"Situations quotidiennes","intro":"Puedo hablar de rutinas, compras, horarios y gustos.","mission":"Décris ta journée avec cinq actions.","grammar":"Passé composé, futur proche, adjectifs, prépositions.","phrases":["Je voudrais...","Tous les jours...","Hier, je suis allé...","Il faut..."],"vocabulary":[{"word":"Aujourd’hui","translation":"Hoy","example":"Aujourd’hui, je travaille."},{"word":"Magasin","translation":"Tienda","example":"Je vais au magasin."},{"word":"Petit déjeuner","translation":"Desayuno","example":"Je prends le petit déjeuner."},{"word":"Voyage","translation":"Viaje","example":"Le voyage est court."},{"word":"Temps","translation":"Tiempo/clima","example":"Il fait beau."},{"word":"Après","translation":"Después","example":"Après la classe, je lis."}],"dialogue":[{"speaker":"Tutor","line":"Je voudrais...","translation":"Frase modelo"},{"speaker":"Student","line":"Tous les jours...","translation":"Respuesta guiada"}],"reading":{"text":"Marc travaille le matin. Après le travail, il achète du pain et prépare un café.","questions":["Quand travaille Marc?","Qu’achète-t-il?","Que prépare-t-il?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Aujourd’hui\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Décris ta journée avec cinq actions.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Je voudrais...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-b1-listening',
  'french',
  'B1',
  'listening',
  'Français B1 · Listening Lab',
  'Conversation autonome: Puedo narrar, opinar y explicar razones.',
  850,
  false,
  true,
  15,
  20,
  array['french', 'b1', 'listening'],
  array['Avis', 'Raison', 'Expérience', 'Améliorer'],
  '{"language":"Français","language_key":"french","level_title":"Conversation autonome","intro":"Puedo narrar, opinar y explicar razones.","mission":"Donne ton opinion sur l’apprentissage des langues.","grammar":"Imparfait, conditionnel, pronoms, connecteurs.","phrases":["À mon avis...","Je pense que...","Parce que...","J’aimerais..."],"vocabulary":[{"word":"Avis","translation":"Opinión","example":"À mon avis, c’est utile."},{"word":"Raison","translation":"Razón","example":"La raison est simple."},{"word":"Expérience","translation":"Experiencia","example":"C’est une bonne expérience."},{"word":"Améliorer","translation":"Mejorar","example":"Je veux améliorer mon français."},{"word":"Choisir","translation":"Elegir","example":"Je dois choisir."},{"word":"Réussir","translation":"Lograr","example":"Il peut réussir."}],"dialogue":[{"speaker":"Tutor","line":"À mon avis...","translation":"Frase modelo"},{"speaker":"Student","line":"Je pense que...","translation":"Respuesta guiada"}],"reading":{"text":"Nadia apprend le français depuis six mois. Elle comprend mieux les conversations et ose parler en classe.","questions":["Depuis quand apprend-elle?","Que comprend-elle mieux?","Où ose-t-elle parler?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Avis\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Donne ton opinion sur l’apprentissage des langues.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: À mon avis...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-b1-speaking',
  'french',
  'B1',
  'speaking',
  'Français B1 · Speaking Mission',
  'Conversation autonome: Puedo narrar, opinar y explicar razones.',
  860,
  false,
  true,
  15,
  20,
  array['french', 'b1', 'speaking'],
  array['Avis', 'Raison', 'Expérience', 'Améliorer'],
  '{"language":"Français","language_key":"french","level_title":"Conversation autonome","intro":"Puedo narrar, opinar y explicar razones.","mission":"Donne ton opinion sur l’apprentissage des langues.","grammar":"Imparfait, conditionnel, pronoms, connecteurs.","phrases":["À mon avis...","Je pense que...","Parce que...","J’aimerais..."],"vocabulary":[{"word":"Avis","translation":"Opinión","example":"À mon avis, c’est utile."},{"word":"Raison","translation":"Razón","example":"La raison est simple."},{"word":"Expérience","translation":"Experiencia","example":"C’est une bonne expérience."},{"word":"Améliorer","translation":"Mejorar","example":"Je veux améliorer mon français."},{"word":"Choisir","translation":"Elegir","example":"Je dois choisir."},{"word":"Réussir","translation":"Lograr","example":"Il peut réussir."}],"dialogue":[{"speaker":"Tutor","line":"À mon avis...","translation":"Frase modelo"},{"speaker":"Student","line":"Je pense que...","translation":"Respuesta guiada"}],"reading":{"text":"Nadia apprend le français depuis six mois. Elle comprend mieux les conversations et ose parler en classe.","questions":["Depuis quand apprend-elle?","Que comprend-elle mieux?","Où ose-t-elle parler?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Avis\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Donne ton opinion sur l’apprentissage des langues.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: À mon avis...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-b1-reading',
  'french',
  'B1',
  'reading',
  'Français B1 · Reading Quest',
  'Conversation autonome: Puedo narrar, opinar y explicar razones.',
  870,
  false,
  true,
  15,
  20,
  array['french', 'b1', 'reading'],
  array['Avis', 'Raison', 'Expérience', 'Améliorer'],
  '{"language":"Français","language_key":"french","level_title":"Conversation autonome","intro":"Puedo narrar, opinar y explicar razones.","mission":"Donne ton opinion sur l’apprentissage des langues.","grammar":"Imparfait, conditionnel, pronoms, connecteurs.","phrases":["À mon avis...","Je pense que...","Parce que...","J’aimerais..."],"vocabulary":[{"word":"Avis","translation":"Opinión","example":"À mon avis, c’est utile."},{"word":"Raison","translation":"Razón","example":"La raison est simple."},{"word":"Expérience","translation":"Experiencia","example":"C’est une bonne expérience."},{"word":"Améliorer","translation":"Mejorar","example":"Je veux améliorer mon français."},{"word":"Choisir","translation":"Elegir","example":"Je dois choisir."},{"word":"Réussir","translation":"Lograr","example":"Il peut réussir."}],"dialogue":[{"speaker":"Tutor","line":"À mon avis...","translation":"Frase modelo"},{"speaker":"Student","line":"Je pense que...","translation":"Respuesta guiada"}],"reading":{"text":"Nadia apprend le français depuis six mois. Elle comprend mieux les conversations et ose parler en classe.","questions":["Depuis quand apprend-elle?","Que comprend-elle mieux?","Où ose-t-elle parler?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Avis\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Donne ton opinion sur l’apprentissage des langues.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: À mon avis...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-b1-writing',
  'french',
  'B1',
  'writing',
  'Français B1 · Writing Challenge',
  'Conversation autonome: Puedo narrar, opinar y explicar razones.',
  880,
  false,
  true,
  15,
  20,
  array['french', 'b1', 'writing'],
  array['Avis', 'Raison', 'Expérience', 'Améliorer'],
  '{"language":"Français","language_key":"french","level_title":"Conversation autonome","intro":"Puedo narrar, opinar y explicar razones.","mission":"Donne ton opinion sur l’apprentissage des langues.","grammar":"Imparfait, conditionnel, pronoms, connecteurs.","phrases":["À mon avis...","Je pense que...","Parce que...","J’aimerais..."],"vocabulary":[{"word":"Avis","translation":"Opinión","example":"À mon avis, c’est utile."},{"word":"Raison","translation":"Razón","example":"La raison est simple."},{"word":"Expérience","translation":"Experiencia","example":"C’est une bonne expérience."},{"word":"Améliorer","translation":"Mejorar","example":"Je veux améliorer mon français."},{"word":"Choisir","translation":"Elegir","example":"Je dois choisir."},{"word":"Réussir","translation":"Lograr","example":"Il peut réussir."}],"dialogue":[{"speaker":"Tutor","line":"À mon avis...","translation":"Frase modelo"},{"speaker":"Student","line":"Je pense que...","translation":"Respuesta guiada"}],"reading":{"text":"Nadia apprend le français depuis six mois. Elle comprend mieux les conversations et ose parler en classe.","questions":["Depuis quand apprend-elle?","Que comprend-elle mieux?","Où ose-t-elle parler?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Avis\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Donne ton opinion sur l’apprentissage des langues.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: À mon avis...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-b1-grammar',
  'french',
  'B1',
  'grammar',
  'Français B1 · Grammar Focus',
  'Conversation autonome: Puedo narrar, opinar y explicar razones.',
  890,
  false,
  true,
  15,
  20,
  array['french', 'b1', 'grammar'],
  array['Avis', 'Raison', 'Expérience', 'Améliorer'],
  '{"language":"Français","language_key":"french","level_title":"Conversation autonome","intro":"Puedo narrar, opinar y explicar razones.","mission":"Donne ton opinion sur l’apprentissage des langues.","grammar":"Imparfait, conditionnel, pronoms, connecteurs.","phrases":["À mon avis...","Je pense que...","Parce que...","J’aimerais..."],"vocabulary":[{"word":"Avis","translation":"Opinión","example":"À mon avis, c’est utile."},{"word":"Raison","translation":"Razón","example":"La raison est simple."},{"word":"Expérience","translation":"Experiencia","example":"C’est une bonne expérience."},{"word":"Améliorer","translation":"Mejorar","example":"Je veux améliorer mon français."},{"word":"Choisir","translation":"Elegir","example":"Je dois choisir."},{"word":"Réussir","translation":"Lograr","example":"Il peut réussir."}],"dialogue":[{"speaker":"Tutor","line":"À mon avis...","translation":"Frase modelo"},{"speaker":"Student","line":"Je pense que...","translation":"Respuesta guiada"}],"reading":{"text":"Nadia apprend le français depuis six mois. Elle comprend mieux les conversations et ose parler en classe.","questions":["Depuis quand apprend-elle?","Que comprend-elle mieux?","Où ose-t-elle parler?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Avis\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Donne ton opinion sur l’apprentissage des langues.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: À mon avis...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-b1-vocabulary',
  'french',
  'B1',
  'vocabulary',
  'Français B1 · Vocabulary Boost',
  'Conversation autonome: Puedo narrar, opinar y explicar razones.',
  900,
  false,
  true,
  15,
  10,
  array['french', 'b1', 'vocabulary'],
  array['Avis', 'Raison', 'Expérience', 'Améliorer'],
  '{"language":"Français","language_key":"french","level_title":"Conversation autonome","intro":"Puedo narrar, opinar y explicar razones.","mission":"Donne ton opinion sur l’apprentissage des langues.","grammar":"Imparfait, conditionnel, pronoms, connecteurs.","phrases":["À mon avis...","Je pense que...","Parce que...","J’aimerais..."],"vocabulary":[{"word":"Avis","translation":"Opinión","example":"À mon avis, c’est utile."},{"word":"Raison","translation":"Razón","example":"La raison est simple."},{"word":"Expérience","translation":"Experiencia","example":"C’est une bonne expérience."},{"word":"Améliorer","translation":"Mejorar","example":"Je veux améliorer mon français."},{"word":"Choisir","translation":"Elegir","example":"Je dois choisir."},{"word":"Réussir","translation":"Lograr","example":"Il peut réussir."}],"dialogue":[{"speaker":"Tutor","line":"À mon avis...","translation":"Frase modelo"},{"speaker":"Student","line":"Je pense que...","translation":"Respuesta guiada"}],"reading":{"text":"Nadia apprend le français depuis six mois. Elle comprend mieux les conversations et ose parler en classe.","questions":["Depuis quand apprend-elle?","Que comprend-elle mieux?","Où ose-t-elle parler?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Avis\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Donne ton opinion sur l’apprentissage des langues.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: À mon avis...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-b2-listening',
  'french',
  'B2',
  'listening',
  'Français B2 · Listening Lab',
  'Débat et argumentation: Puedo defender ideas y comprender opiniones complejas.',
  910,
  false,
  true,
  15,
  20,
  array['french', 'b2', 'listening'],
  array['Cependant', 'Enjeu', 'Preuve', 'Développer'],
  '{"language":"Français","language_key":"french","level_title":"Débat et argumentation","intro":"Puedo defender ideas y comprender opiniones complejas.","mission":"Écris un paragraphe sur les avantages du numérique.","grammar":"Subjonctif, discours rapporté, hypothèse, passif.","phrases":["D’une part...","D’autre part...","Il est essentiel que...","Cela montre que..."],"vocabulary":[{"word":"Cependant","translation":"Sin embargo","example":"Cependant, il faut réfléchir."},{"word":"Enjeu","translation":"Desafío","example":"C’est un enjeu social."},{"word":"Preuve","translation":"Evidencia","example":"La preuve est claire."},{"word":"Développer","translation":"Desarrollar","example":"Il faut développer les compétences."},{"word":"Nuance","translation":"Matiz","example":"La nuance est importante."},{"word":"D’après","translation":"Según","example":"D’après l’auteur..."}],"dialogue":[{"speaker":"Tutor","line":"D’une part...","translation":"Frase modelo"},{"speaker":"Student","line":"D’autre part...","translation":"Respuesta guiada"}],"reading":{"text":"Le numérique facilite l’accès au savoir, mais il exige aussi autonomie, esprit critique et accompagnement pédagogique.","questions":["Que facilite le numérique?","Qu’exige-t-il?","Quel est le thème?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Cependant\"?","options":["Sin embargo","Desafío","Evidencia","Desarrollar"],"answer":0},{"type":"writing","prompt":"Écris un paragraphe sur les avantages du numérique.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: D’une part...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-b2-speaking',
  'french',
  'B2',
  'speaking',
  'Français B2 · Speaking Mission',
  'Débat et argumentation: Puedo defender ideas y comprender opiniones complejas.',
  920,
  false,
  true,
  15,
  20,
  array['french', 'b2', 'speaking'],
  array['Cependant', 'Enjeu', 'Preuve', 'Développer'],
  '{"language":"Français","language_key":"french","level_title":"Débat et argumentation","intro":"Puedo defender ideas y comprender opiniones complejas.","mission":"Écris un paragraphe sur les avantages du numérique.","grammar":"Subjonctif, discours rapporté, hypothèse, passif.","phrases":["D’une part...","D’autre part...","Il est essentiel que...","Cela montre que..."],"vocabulary":[{"word":"Cependant","translation":"Sin embargo","example":"Cependant, il faut réfléchir."},{"word":"Enjeu","translation":"Desafío","example":"C’est un enjeu social."},{"word":"Preuve","translation":"Evidencia","example":"La preuve est claire."},{"word":"Développer","translation":"Desarrollar","example":"Il faut développer les compétences."},{"word":"Nuance","translation":"Matiz","example":"La nuance est importante."},{"word":"D’après","translation":"Según","example":"D’après l’auteur..."}],"dialogue":[{"speaker":"Tutor","line":"D’une part...","translation":"Frase modelo"},{"speaker":"Student","line":"D’autre part...","translation":"Respuesta guiada"}],"reading":{"text":"Le numérique facilite l’accès au savoir, mais il exige aussi autonomie, esprit critique et accompagnement pédagogique.","questions":["Que facilite le numérique?","Qu’exige-t-il?","Quel est le thème?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Cependant\"?","options":["Sin embargo","Desafío","Evidencia","Desarrollar"],"answer":0},{"type":"writing","prompt":"Écris un paragraphe sur les avantages du numérique.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: D’une part...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-b2-reading',
  'french',
  'B2',
  'reading',
  'Français B2 · Reading Quest',
  'Débat et argumentation: Puedo defender ideas y comprender opiniones complejas.',
  930,
  false,
  true,
  15,
  20,
  array['french', 'b2', 'reading'],
  array['Cependant', 'Enjeu', 'Preuve', 'Développer'],
  '{"language":"Français","language_key":"french","level_title":"Débat et argumentation","intro":"Puedo defender ideas y comprender opiniones complejas.","mission":"Écris un paragraphe sur les avantages du numérique.","grammar":"Subjonctif, discours rapporté, hypothèse, passif.","phrases":["D’une part...","D’autre part...","Il est essentiel que...","Cela montre que..."],"vocabulary":[{"word":"Cependant","translation":"Sin embargo","example":"Cependant, il faut réfléchir."},{"word":"Enjeu","translation":"Desafío","example":"C’est un enjeu social."},{"word":"Preuve","translation":"Evidencia","example":"La preuve est claire."},{"word":"Développer","translation":"Desarrollar","example":"Il faut développer les compétences."},{"word":"Nuance","translation":"Matiz","example":"La nuance est importante."},{"word":"D’après","translation":"Según","example":"D’après l’auteur..."}],"dialogue":[{"speaker":"Tutor","line":"D’une part...","translation":"Frase modelo"},{"speaker":"Student","line":"D’autre part...","translation":"Respuesta guiada"}],"reading":{"text":"Le numérique facilite l’accès au savoir, mais il exige aussi autonomie, esprit critique et accompagnement pédagogique.","questions":["Que facilite le numérique?","Qu’exige-t-il?","Quel est le thème?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Cependant\"?","options":["Sin embargo","Desafío","Evidencia","Desarrollar"],"answer":0},{"type":"writing","prompt":"Écris un paragraphe sur les avantages du numérique.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: D’une part...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-b2-writing',
  'french',
  'B2',
  'writing',
  'Français B2 · Writing Challenge',
  'Débat et argumentation: Puedo defender ideas y comprender opiniones complejas.',
  940,
  false,
  true,
  15,
  20,
  array['french', 'b2', 'writing'],
  array['Cependant', 'Enjeu', 'Preuve', 'Développer'],
  '{"language":"Français","language_key":"french","level_title":"Débat et argumentation","intro":"Puedo defender ideas y comprender opiniones complejas.","mission":"Écris un paragraphe sur les avantages du numérique.","grammar":"Subjonctif, discours rapporté, hypothèse, passif.","phrases":["D’une part...","D’autre part...","Il est essentiel que...","Cela montre que..."],"vocabulary":[{"word":"Cependant","translation":"Sin embargo","example":"Cependant, il faut réfléchir."},{"word":"Enjeu","translation":"Desafío","example":"C’est un enjeu social."},{"word":"Preuve","translation":"Evidencia","example":"La preuve est claire."},{"word":"Développer","translation":"Desarrollar","example":"Il faut développer les compétences."},{"word":"Nuance","translation":"Matiz","example":"La nuance est importante."},{"word":"D’après","translation":"Según","example":"D’après l’auteur..."}],"dialogue":[{"speaker":"Tutor","line":"D’une part...","translation":"Frase modelo"},{"speaker":"Student","line":"D’autre part...","translation":"Respuesta guiada"}],"reading":{"text":"Le numérique facilite l’accès au savoir, mais il exige aussi autonomie, esprit critique et accompagnement pédagogique.","questions":["Que facilite le numérique?","Qu’exige-t-il?","Quel est le thème?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Cependant\"?","options":["Sin embargo","Desafío","Evidencia","Desarrollar"],"answer":0},{"type":"writing","prompt":"Écris un paragraphe sur les avantages du numérique.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: D’une part...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-b2-grammar',
  'french',
  'B2',
  'grammar',
  'Français B2 · Grammar Focus',
  'Débat et argumentation: Puedo defender ideas y comprender opiniones complejas.',
  950,
  false,
  true,
  15,
  20,
  array['french', 'b2', 'grammar'],
  array['Cependant', 'Enjeu', 'Preuve', 'Développer'],
  '{"language":"Français","language_key":"french","level_title":"Débat et argumentation","intro":"Puedo defender ideas y comprender opiniones complejas.","mission":"Écris un paragraphe sur les avantages du numérique.","grammar":"Subjonctif, discours rapporté, hypothèse, passif.","phrases":["D’une part...","D’autre part...","Il est essentiel que...","Cela montre que..."],"vocabulary":[{"word":"Cependant","translation":"Sin embargo","example":"Cependant, il faut réfléchir."},{"word":"Enjeu","translation":"Desafío","example":"C’est un enjeu social."},{"word":"Preuve","translation":"Evidencia","example":"La preuve est claire."},{"word":"Développer","translation":"Desarrollar","example":"Il faut développer les compétences."},{"word":"Nuance","translation":"Matiz","example":"La nuance est importante."},{"word":"D’après","translation":"Según","example":"D’après l’auteur..."}],"dialogue":[{"speaker":"Tutor","line":"D’une part...","translation":"Frase modelo"},{"speaker":"Student","line":"D’autre part...","translation":"Respuesta guiada"}],"reading":{"text":"Le numérique facilite l’accès au savoir, mais il exige aussi autonomie, esprit critique et accompagnement pédagogique.","questions":["Que facilite le numérique?","Qu’exige-t-il?","Quel est le thème?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Cependant\"?","options":["Sin embargo","Desafío","Evidencia","Desarrollar"],"answer":0},{"type":"writing","prompt":"Écris un paragraphe sur les avantages du numérique.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: D’une part...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-b2-vocabulary',
  'french',
  'B2',
  'vocabulary',
  'Français B2 · Vocabulary Boost',
  'Débat et argumentation: Puedo defender ideas y comprender opiniones complejas.',
  960,
  false,
  true,
  15,
  10,
  array['french', 'b2', 'vocabulary'],
  array['Cependant', 'Enjeu', 'Preuve', 'Développer'],
  '{"language":"Français","language_key":"french","level_title":"Débat et argumentation","intro":"Puedo defender ideas y comprender opiniones complejas.","mission":"Écris un paragraphe sur les avantages du numérique.","grammar":"Subjonctif, discours rapporté, hypothèse, passif.","phrases":["D’une part...","D’autre part...","Il est essentiel que...","Cela montre que..."],"vocabulary":[{"word":"Cependant","translation":"Sin embargo","example":"Cependant, il faut réfléchir."},{"word":"Enjeu","translation":"Desafío","example":"C’est un enjeu social."},{"word":"Preuve","translation":"Evidencia","example":"La preuve est claire."},{"word":"Développer","translation":"Desarrollar","example":"Il faut développer les compétences."},{"word":"Nuance","translation":"Matiz","example":"La nuance est importante."},{"word":"D’après","translation":"Según","example":"D’après l’auteur..."}],"dialogue":[{"speaker":"Tutor","line":"D’une part...","translation":"Frase modelo"},{"speaker":"Student","line":"D’autre part...","translation":"Respuesta guiada"}],"reading":{"text":"Le numérique facilite l’accès au savoir, mais il exige aussi autonomie, esprit critique et accompagnement pédagogique.","questions":["Que facilite le numérique?","Qu’exige-t-il?","Quel est le thème?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Cependant\"?","options":["Sin embargo","Desafío","Evidencia","Desarrollar"],"answer":0},{"type":"writing","prompt":"Écris un paragraphe sur les avantages du numérique.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: D’une part...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-c1-listening',
  'french',
  'C1',
  'listening',
  'Français C1 · Listening Lab',
  'Expression avancée: Puedo usar registros, matices y estructuras sofisticadas.',
  970,
  false,
  true,
  15,
  20,
  array['french', 'c1', 'listening'],
  array['Néanmoins', 'Portée', 'Démarche', 'Soutenir'],
  '{"language":"Français","language_key":"french","level_title":"Expression avancée","intro":"Puedo usar registros, matices y estructuras sofisticadas.","mission":"Reformule une opinion avec un style soutenu.","grammar":"Subjonctif avancé, concession, nominalisation, style.","phrases":["Il convient de souligner que...","Dans cette perspective...","Il ne s’agit pas seulement de...","Cette analyse met en évidence..."],"vocabulary":[{"word":"Néanmoins","translation":"No obstante","example":"Néanmoins, l’idée reste valable."},{"word":"Portée","translation":"Alcance","example":"La portée est considérable."},{"word":"Démarche","translation":"Enfoque","example":"La démarche est pertinente."},{"word":"Soutenir","translation":"Sostener","example":"L’auteur soutient cette thèse."},{"word":"Approfondir","translation":"Profundizar","example":"Il faut approfondir le sujet."},{"word":"Pertinent","translation":"Pertinente","example":"C’est un exemple pertinent."}],"dialogue":[{"speaker":"Tutor","line":"Il convient de souligner que...","translation":"Frase modelo"},{"speaker":"Student","line":"Dans cette perspective...","translation":"Respuesta guiada"}],"reading":{"text":"La maîtrise d’une langue implique une capacité à interpréter les implicites, ajuster son registre et construire une pensée nuancée.","questions":["Qu’implique la maîtrise?","Que faut-il ajuster?","Quelle pensée faut-il construire?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Néanmoins\"?","options":["No obstante","Alcance","Enfoque","Sostener"],"answer":0},{"type":"writing","prompt":"Reformule une opinion avec un style soutenu.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Il convient de souligner que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-c1-speaking',
  'french',
  'C1',
  'speaking',
  'Français C1 · Speaking Mission',
  'Expression avancée: Puedo usar registros, matices y estructuras sofisticadas.',
  980,
  false,
  true,
  15,
  20,
  array['french', 'c1', 'speaking'],
  array['Néanmoins', 'Portée', 'Démarche', 'Soutenir'],
  '{"language":"Français","language_key":"french","level_title":"Expression avancée","intro":"Puedo usar registros, matices y estructuras sofisticadas.","mission":"Reformule une opinion avec un style soutenu.","grammar":"Subjonctif avancé, concession, nominalisation, style.","phrases":["Il convient de souligner que...","Dans cette perspective...","Il ne s’agit pas seulement de...","Cette analyse met en évidence..."],"vocabulary":[{"word":"Néanmoins","translation":"No obstante","example":"Néanmoins, l’idée reste valable."},{"word":"Portée","translation":"Alcance","example":"La portée est considérable."},{"word":"Démarche","translation":"Enfoque","example":"La démarche est pertinente."},{"word":"Soutenir","translation":"Sostener","example":"L’auteur soutient cette thèse."},{"word":"Approfondir","translation":"Profundizar","example":"Il faut approfondir le sujet."},{"word":"Pertinent","translation":"Pertinente","example":"C’est un exemple pertinent."}],"dialogue":[{"speaker":"Tutor","line":"Il convient de souligner que...","translation":"Frase modelo"},{"speaker":"Student","line":"Dans cette perspective...","translation":"Respuesta guiada"}],"reading":{"text":"La maîtrise d’une langue implique une capacité à interpréter les implicites, ajuster son registre et construire une pensée nuancée.","questions":["Qu’implique la maîtrise?","Que faut-il ajuster?","Quelle pensée faut-il construire?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Néanmoins\"?","options":["No obstante","Alcance","Enfoque","Sostener"],"answer":0},{"type":"writing","prompt":"Reformule une opinion avec un style soutenu.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Il convient de souligner que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-c1-reading',
  'french',
  'C1',
  'reading',
  'Français C1 · Reading Quest',
  'Expression avancée: Puedo usar registros, matices y estructuras sofisticadas.',
  990,
  false,
  true,
  15,
  20,
  array['french', 'c1', 'reading'],
  array['Néanmoins', 'Portée', 'Démarche', 'Soutenir'],
  '{"language":"Français","language_key":"french","level_title":"Expression avancée","intro":"Puedo usar registros, matices y estructuras sofisticadas.","mission":"Reformule une opinion avec un style soutenu.","grammar":"Subjonctif avancé, concession, nominalisation, style.","phrases":["Il convient de souligner que...","Dans cette perspective...","Il ne s’agit pas seulement de...","Cette analyse met en évidence..."],"vocabulary":[{"word":"Néanmoins","translation":"No obstante","example":"Néanmoins, l’idée reste valable."},{"word":"Portée","translation":"Alcance","example":"La portée est considérable."},{"word":"Démarche","translation":"Enfoque","example":"La démarche est pertinente."},{"word":"Soutenir","translation":"Sostener","example":"L’auteur soutient cette thèse."},{"word":"Approfondir","translation":"Profundizar","example":"Il faut approfondir le sujet."},{"word":"Pertinent","translation":"Pertinente","example":"C’est un exemple pertinent."}],"dialogue":[{"speaker":"Tutor","line":"Il convient de souligner que...","translation":"Frase modelo"},{"speaker":"Student","line":"Dans cette perspective...","translation":"Respuesta guiada"}],"reading":{"text":"La maîtrise d’une langue implique une capacité à interpréter les implicites, ajuster son registre et construire une pensée nuancée.","questions":["Qu’implique la maîtrise?","Que faut-il ajuster?","Quelle pensée faut-il construire?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Néanmoins\"?","options":["No obstante","Alcance","Enfoque","Sostener"],"answer":0},{"type":"writing","prompt":"Reformule une opinion avec un style soutenu.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Il convient de souligner que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-c1-writing',
  'french',
  'C1',
  'writing',
  'Français C1 · Writing Challenge',
  'Expression avancée: Puedo usar registros, matices y estructuras sofisticadas.',
  1000,
  false,
  true,
  15,
  20,
  array['french', 'c1', 'writing'],
  array['Néanmoins', 'Portée', 'Démarche', 'Soutenir'],
  '{"language":"Français","language_key":"french","level_title":"Expression avancée","intro":"Puedo usar registros, matices y estructuras sofisticadas.","mission":"Reformule une opinion avec un style soutenu.","grammar":"Subjonctif avancé, concession, nominalisation, style.","phrases":["Il convient de souligner que...","Dans cette perspective...","Il ne s’agit pas seulement de...","Cette analyse met en évidence..."],"vocabulary":[{"word":"Néanmoins","translation":"No obstante","example":"Néanmoins, l’idée reste valable."},{"word":"Portée","translation":"Alcance","example":"La portée est considérable."},{"word":"Démarche","translation":"Enfoque","example":"La démarche est pertinente."},{"word":"Soutenir","translation":"Sostener","example":"L’auteur soutient cette thèse."},{"word":"Approfondir","translation":"Profundizar","example":"Il faut approfondir le sujet."},{"word":"Pertinent","translation":"Pertinente","example":"C’est un exemple pertinent."}],"dialogue":[{"speaker":"Tutor","line":"Il convient de souligner que...","translation":"Frase modelo"},{"speaker":"Student","line":"Dans cette perspective...","translation":"Respuesta guiada"}],"reading":{"text":"La maîtrise d’une langue implique une capacité à interpréter les implicites, ajuster son registre et construire une pensée nuancée.","questions":["Qu’implique la maîtrise?","Que faut-il ajuster?","Quelle pensée faut-il construire?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Néanmoins\"?","options":["No obstante","Alcance","Enfoque","Sostener"],"answer":0},{"type":"writing","prompt":"Reformule une opinion avec un style soutenu.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Il convient de souligner que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-c1-grammar',
  'french',
  'C1',
  'grammar',
  'Français C1 · Grammar Focus',
  'Expression avancée: Puedo usar registros, matices y estructuras sofisticadas.',
  1010,
  false,
  true,
  15,
  20,
  array['french', 'c1', 'grammar'],
  array['Néanmoins', 'Portée', 'Démarche', 'Soutenir'],
  '{"language":"Français","language_key":"french","level_title":"Expression avancée","intro":"Puedo usar registros, matices y estructuras sofisticadas.","mission":"Reformule une opinion avec un style soutenu.","grammar":"Subjonctif avancé, concession, nominalisation, style.","phrases":["Il convient de souligner que...","Dans cette perspective...","Il ne s’agit pas seulement de...","Cette analyse met en évidence..."],"vocabulary":[{"word":"Néanmoins","translation":"No obstante","example":"Néanmoins, l’idée reste valable."},{"word":"Portée","translation":"Alcance","example":"La portée est considérable."},{"word":"Démarche","translation":"Enfoque","example":"La démarche est pertinente."},{"word":"Soutenir","translation":"Sostener","example":"L’auteur soutient cette thèse."},{"word":"Approfondir","translation":"Profundizar","example":"Il faut approfondir le sujet."},{"word":"Pertinent","translation":"Pertinente","example":"C’est un exemple pertinent."}],"dialogue":[{"speaker":"Tutor","line":"Il convient de souligner que...","translation":"Frase modelo"},{"speaker":"Student","line":"Dans cette perspective...","translation":"Respuesta guiada"}],"reading":{"text":"La maîtrise d’une langue implique une capacité à interpréter les implicites, ajuster son registre et construire une pensée nuancée.","questions":["Qu’implique la maîtrise?","Que faut-il ajuster?","Quelle pensée faut-il construire?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Néanmoins\"?","options":["No obstante","Alcance","Enfoque","Sostener"],"answer":0},{"type":"writing","prompt":"Reformule une opinion avec un style soutenu.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Il convient de souligner que...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-c1-vocabulary',
  'french',
  'C1',
  'vocabulary',
  'Français C1 · Vocabulary Boost',
  'Expression avancée: Puedo usar registros, matices y estructuras sofisticadas.',
  1020,
  false,
  true,
  15,
  10,
  array['french', 'c1', 'vocabulary'],
  array['Néanmoins', 'Portée', 'Démarche', 'Soutenir'],
  '{"language":"Français","language_key":"french","level_title":"Expression avancée","intro":"Puedo usar registros, matices y estructuras sofisticadas.","mission":"Reformule une opinion avec un style soutenu.","grammar":"Subjonctif avancé, concession, nominalisation, style.","phrases":["Il convient de souligner que...","Dans cette perspective...","Il ne s’agit pas seulement de...","Cette analyse met en évidence..."],"vocabulary":[{"word":"Néanmoins","translation":"No obstante","example":"Néanmoins, l’idée reste valable."},{"word":"Portée","translation":"Alcance","example":"La portée est considérable."},{"word":"Démarche","translation":"Enfoque","example":"La démarche est pertinente."},{"word":"Soutenir","translation":"Sostener","example":"L’auteur soutient cette thèse."},{"word":"Approfondir","translation":"Profundizar","example":"Il faut approfondir le sujet."},{"word":"Pertinent","translation":"Pertinente","example":"C’est un exemple pertinent."}],"dialogue":[{"speaker":"Tutor","line":"Il convient de souligner que...","translation":"Frase modelo"},{"speaker":"Student","line":"Dans cette perspective...","translation":"Respuesta guiada"}],"reading":{"text":"La maîtrise d’une langue implique une capacité à interpréter les implicites, ajuster son registre et construire une pensée nuancée.","questions":["Qu’implique la maîtrise?","Que faut-il ajuster?","Quelle pensée faut-il construire?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Néanmoins\"?","options":["No obstante","Alcance","Enfoque","Sostener"],"answer":0},{"type":"writing","prompt":"Reformule une opinion avec un style soutenu.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Il convient de souligner que...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-c2-listening',
  'french',
  'C2',
  'listening',
  'Français C2 · Listening Lab',
  'Maîtrise complète: Puedo expresarme con fineza, precisión y naturalidad.',
  1030,
  false,
  true,
  15,
  20,
  array['french', 'c2', 'listening'],
  array['Éloquent', 'Subtil', 'Abouti', 'Éclairer'],
  '{"language":"Français","language_key":"french","level_title":"Maîtrise complète","intro":"Puedo expresarme con fineza, precisión y naturalidad.","mission":"Rédige une réflexion persuasive avec nuance.","grammar":"Rhétorique, ironie, registre, cohésion experte.","phrases":["La question mérite d’être posée...","À y regarder de près...","Ce qui frappe, c’est...","Encore faut-il préciser que..."],"vocabulary":[{"word":"Éloquent","translation":"Elocuente","example":"Son discours est éloquent."},{"word":"Subtil","translation":"Sutil","example":"C’est un argument subtil."},{"word":"Abouti","translation":"Logrado","example":"Le texte est abouti."},{"word":"Éclairer","translation":"Aclarar","example":"Cela éclaire le débat."},{"word":"Saisir","translation":"Captar","example":"Il faut saisir la nuance."},{"word":"Raffiné","translation":"Refinado","example":"Le style est raffiné."}],"dialogue":[{"speaker":"Tutor","line":"La question mérite d’être posée...","translation":"Frase modelo"},{"speaker":"Student","line":"À y regarder de près...","translation":"Respuesta guiada"}],"reading":{"text":"Une expression pleinement maîtrisée permet de combiner rigueur, élégance, efficacité et sensibilité au contexte.","questions":["Que permet l’expression maîtrisée?","Quels quatre éléments combine-t-elle?","Quel mot signifie elegante?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Éloquent\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Rédige une réflexion persuasive avec nuance.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: La question mérite d’être posée...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-c2-speaking',
  'french',
  'C2',
  'speaking',
  'Français C2 · Speaking Mission',
  'Maîtrise complète: Puedo expresarme con fineza, precisión y naturalidad.',
  1040,
  false,
  true,
  15,
  20,
  array['french', 'c2', 'speaking'],
  array['Éloquent', 'Subtil', 'Abouti', 'Éclairer'],
  '{"language":"Français","language_key":"french","level_title":"Maîtrise complète","intro":"Puedo expresarme con fineza, precisión y naturalidad.","mission":"Rédige une réflexion persuasive avec nuance.","grammar":"Rhétorique, ironie, registre, cohésion experte.","phrases":["La question mérite d’être posée...","À y regarder de près...","Ce qui frappe, c’est...","Encore faut-il préciser que..."],"vocabulary":[{"word":"Éloquent","translation":"Elocuente","example":"Son discours est éloquent."},{"word":"Subtil","translation":"Sutil","example":"C’est un argument subtil."},{"word":"Abouti","translation":"Logrado","example":"Le texte est abouti."},{"word":"Éclairer","translation":"Aclarar","example":"Cela éclaire le débat."},{"word":"Saisir","translation":"Captar","example":"Il faut saisir la nuance."},{"word":"Raffiné","translation":"Refinado","example":"Le style est raffiné."}],"dialogue":[{"speaker":"Tutor","line":"La question mérite d’être posée...","translation":"Frase modelo"},{"speaker":"Student","line":"À y regarder de près...","translation":"Respuesta guiada"}],"reading":{"text":"Une expression pleinement maîtrisée permet de combiner rigueur, élégance, efficacité et sensibilité au contexte.","questions":["Que permet l’expression maîtrisée?","Quels quatre éléments combine-t-elle?","Quel mot signifie elegante?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Éloquent\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Rédige une réflexion persuasive avec nuance.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: La question mérite d’être posée...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-c2-reading',
  'french',
  'C2',
  'reading',
  'Français C2 · Reading Quest',
  'Maîtrise complète: Puedo expresarme con fineza, precisión y naturalidad.',
  1050,
  false,
  true,
  15,
  20,
  array['french', 'c2', 'reading'],
  array['Éloquent', 'Subtil', 'Abouti', 'Éclairer'],
  '{"language":"Français","language_key":"french","level_title":"Maîtrise complète","intro":"Puedo expresarme con fineza, precisión y naturalidad.","mission":"Rédige une réflexion persuasive avec nuance.","grammar":"Rhétorique, ironie, registre, cohésion experte.","phrases":["La question mérite d’être posée...","À y regarder de près...","Ce qui frappe, c’est...","Encore faut-il préciser que..."],"vocabulary":[{"word":"Éloquent","translation":"Elocuente","example":"Son discours est éloquent."},{"word":"Subtil","translation":"Sutil","example":"C’est un argument subtil."},{"word":"Abouti","translation":"Logrado","example":"Le texte est abouti."},{"word":"Éclairer","translation":"Aclarar","example":"Cela éclaire le débat."},{"word":"Saisir","translation":"Captar","example":"Il faut saisir la nuance."},{"word":"Raffiné","translation":"Refinado","example":"Le style est raffiné."}],"dialogue":[{"speaker":"Tutor","line":"La question mérite d’être posée...","translation":"Frase modelo"},{"speaker":"Student","line":"À y regarder de près...","translation":"Respuesta guiada"}],"reading":{"text":"Une expression pleinement maîtrisée permet de combiner rigueur, élégance, efficacité et sensibilité au contexte.","questions":["Que permet l’expression maîtrisée?","Quels quatre éléments combine-t-elle?","Quel mot signifie elegante?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Éloquent\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Rédige une réflexion persuasive avec nuance.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: La question mérite d’être posée...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-c2-writing',
  'french',
  'C2',
  'writing',
  'Français C2 · Writing Challenge',
  'Maîtrise complète: Puedo expresarme con fineza, precisión y naturalidad.',
  1060,
  false,
  true,
  15,
  20,
  array['french', 'c2', 'writing'],
  array['Éloquent', 'Subtil', 'Abouti', 'Éclairer'],
  '{"language":"Français","language_key":"french","level_title":"Maîtrise complète","intro":"Puedo expresarme con fineza, precisión y naturalidad.","mission":"Rédige une réflexion persuasive avec nuance.","grammar":"Rhétorique, ironie, registre, cohésion experte.","phrases":["La question mérite d’être posée...","À y regarder de près...","Ce qui frappe, c’est...","Encore faut-il préciser que..."],"vocabulary":[{"word":"Éloquent","translation":"Elocuente","example":"Son discours est éloquent."},{"word":"Subtil","translation":"Sutil","example":"C’est un argument subtil."},{"word":"Abouti","translation":"Logrado","example":"Le texte est abouti."},{"word":"Éclairer","translation":"Aclarar","example":"Cela éclaire le débat."},{"word":"Saisir","translation":"Captar","example":"Il faut saisir la nuance."},{"word":"Raffiné","translation":"Refinado","example":"Le style est raffiné."}],"dialogue":[{"speaker":"Tutor","line":"La question mérite d’être posée...","translation":"Frase modelo"},{"speaker":"Student","line":"À y regarder de près...","translation":"Respuesta guiada"}],"reading":{"text":"Une expression pleinement maîtrisée permet de combiner rigueur, élégance, efficacité et sensibilité au contexte.","questions":["Que permet l’expression maîtrisée?","Quels quatre éléments combine-t-elle?","Quel mot signifie elegante?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Éloquent\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Rédige une réflexion persuasive avec nuance.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: La question mérite d’être posée...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-c2-grammar',
  'french',
  'C2',
  'grammar',
  'Français C2 · Grammar Focus',
  'Maîtrise complète: Puedo expresarme con fineza, precisión y naturalidad.',
  1070,
  false,
  true,
  15,
  20,
  array['french', 'c2', 'grammar'],
  array['Éloquent', 'Subtil', 'Abouti', 'Éclairer'],
  '{"language":"Français","language_key":"french","level_title":"Maîtrise complète","intro":"Puedo expresarme con fineza, precisión y naturalidad.","mission":"Rédige une réflexion persuasive avec nuance.","grammar":"Rhétorique, ironie, registre, cohésion experte.","phrases":["La question mérite d’être posée...","À y regarder de près...","Ce qui frappe, c’est...","Encore faut-il préciser que..."],"vocabulary":[{"word":"Éloquent","translation":"Elocuente","example":"Son discours est éloquent."},{"word":"Subtil","translation":"Sutil","example":"C’est un argument subtil."},{"word":"Abouti","translation":"Logrado","example":"Le texte est abouti."},{"word":"Éclairer","translation":"Aclarar","example":"Cela éclaire le débat."},{"word":"Saisir","translation":"Captar","example":"Il faut saisir la nuance."},{"word":"Raffiné","translation":"Refinado","example":"Le style est raffiné."}],"dialogue":[{"speaker":"Tutor","line":"La question mérite d’être posée...","translation":"Frase modelo"},{"speaker":"Student","line":"À y regarder de près...","translation":"Respuesta guiada"}],"reading":{"text":"Une expression pleinement maîtrisée permet de combiner rigueur, élégance, efficacité et sensibilité au contexte.","questions":["Que permet l’expression maîtrisée?","Quels quatre éléments combine-t-elle?","Quel mot signifie elegante?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Éloquent\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Rédige une réflexion persuasive avec nuance.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: La question mérite d’être posée...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'french-c2-vocabulary',
  'french',
  'C2',
  'vocabulary',
  'Français C2 · Vocabulary Boost',
  'Maîtrise complète: Puedo expresarme con fineza, precisión y naturalidad.',
  1080,
  false,
  true,
  15,
  10,
  array['french', 'c2', 'vocabulary'],
  array['Éloquent', 'Subtil', 'Abouti', 'Éclairer'],
  '{"language":"Français","language_key":"french","level_title":"Maîtrise complète","intro":"Puedo expresarme con fineza, precisión y naturalidad.","mission":"Rédige une réflexion persuasive avec nuance.","grammar":"Rhétorique, ironie, registre, cohésion experte.","phrases":["La question mérite d’être posée...","À y regarder de près...","Ce qui frappe, c’est...","Encore faut-il préciser que..."],"vocabulary":[{"word":"Éloquent","translation":"Elocuente","example":"Son discours est éloquent."},{"word":"Subtil","translation":"Sutil","example":"C’est un argument subtil."},{"word":"Abouti","translation":"Logrado","example":"Le texte est abouti."},{"word":"Éclairer","translation":"Aclarar","example":"Cela éclaire le débat."},{"word":"Saisir","translation":"Captar","example":"Il faut saisir la nuance."},{"word":"Raffiné","translation":"Refinado","example":"Le style est raffiné."}],"dialogue":[{"speaker":"Tutor","line":"La question mérite d’être posée...","translation":"Frase modelo"},{"speaker":"Student","line":"À y regarder de près...","translation":"Respuesta guiada"}],"reading":{"text":"Une expression pleinement maîtrisée permet de combiner rigueur, élégance, efficacité et sensibilité au contexte.","questions":["Que permet l’expression maîtrisée?","Quels quatre éléments combine-t-elle?","Quel mot signifie elegante?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Éloquent\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Rédige une réflexion persuasive avec nuance.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: La question mérite d’être posée...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-a1-listening',
  'italian',
  'A1',
  'listening',
  'Italiano A1 · Listening Lab',
  'Italiano base: Puedo saludar, presentarme y entender frases simples.',
  1090,
  true,
  true,
  10,
  20,
  array['italian', 'a1', 'listening'],
  array['Ciao', 'Grazie', 'Amico', 'Casa'],
  '{"language":"Italiano","language_key":"italian","level_title":"Italiano base","intro":"Puedo saludar, presentarme y entender frases simples.","mission":"Presentati in italiano con nome, paese e gusto.","grammar":"Essere, avere, articoli, presente básico.","phrases":["Mi chiamo...","Sono di...","Piacere.","Non capisco."],"vocabulary":[{"word":"Ciao","translation":"Hola","example":"Ciao, mi chiamo Luca."},{"word":"Grazie","translation":"Gracias","example":"Grazie mille."},{"word":"Amico","translation":"Amigo","example":"Lui è un amico."},{"word":"Casa","translation":"Casa","example":"La casa è bella."},{"word":"Scuola","translation":"Escuela","example":"Vado a scuola."},{"word":"Famiglia","translation":"Familia","example":"La mia famiglia è qui."}],"dialogue":[{"speaker":"Tutor","line":"Mi chiamo...","translation":"Frase modelo"},{"speaker":"Student","line":"Sono di...","translation":"Respuesta guiada"}],"reading":{"text":"Giulia vive a Roma. Studia italiano la mattina e parla con la sua amica Sofia.","questions":["Dove vive Giulia?","Quando studia?","Con chi parla?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Ciao\"?","options":["Hola","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Presentati in italiano con nome, paese e gusto.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Mi chiamo...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-a1-speaking',
  'italian',
  'A1',
  'speaking',
  'Italiano A1 · Speaking Mission',
  'Italiano base: Puedo saludar, presentarme y entender frases simples.',
  1100,
  true,
  true,
  10,
  20,
  array['italian', 'a1', 'speaking'],
  array['Ciao', 'Grazie', 'Amico', 'Casa'],
  '{"language":"Italiano","language_key":"italian","level_title":"Italiano base","intro":"Puedo saludar, presentarme y entender frases simples.","mission":"Presentati in italiano con nome, paese e gusto.","grammar":"Essere, avere, articoli, presente básico.","phrases":["Mi chiamo...","Sono di...","Piacere.","Non capisco."],"vocabulary":[{"word":"Ciao","translation":"Hola","example":"Ciao, mi chiamo Luca."},{"word":"Grazie","translation":"Gracias","example":"Grazie mille."},{"word":"Amico","translation":"Amigo","example":"Lui è un amico."},{"word":"Casa","translation":"Casa","example":"La casa è bella."},{"word":"Scuola","translation":"Escuela","example":"Vado a scuola."},{"word":"Famiglia","translation":"Familia","example":"La mia famiglia è qui."}],"dialogue":[{"speaker":"Tutor","line":"Mi chiamo...","translation":"Frase modelo"},{"speaker":"Student","line":"Sono di...","translation":"Respuesta guiada"}],"reading":{"text":"Giulia vive a Roma. Studia italiano la mattina e parla con la sua amica Sofia.","questions":["Dove vive Giulia?","Quando studia?","Con chi parla?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Ciao\"?","options":["Hola","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Presentati in italiano con nome, paese e gusto.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Mi chiamo...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-a1-reading',
  'italian',
  'A1',
  'reading',
  'Italiano A1 · Reading Quest',
  'Italiano base: Puedo saludar, presentarme y entender frases simples.',
  1110,
  true,
  true,
  10,
  20,
  array['italian', 'a1', 'reading'],
  array['Ciao', 'Grazie', 'Amico', 'Casa'],
  '{"language":"Italiano","language_key":"italian","level_title":"Italiano base","intro":"Puedo saludar, presentarme y entender frases simples.","mission":"Presentati in italiano con nome, paese e gusto.","grammar":"Essere, avere, articoli, presente básico.","phrases":["Mi chiamo...","Sono di...","Piacere.","Non capisco."],"vocabulary":[{"word":"Ciao","translation":"Hola","example":"Ciao, mi chiamo Luca."},{"word":"Grazie","translation":"Gracias","example":"Grazie mille."},{"word":"Amico","translation":"Amigo","example":"Lui è un amico."},{"word":"Casa","translation":"Casa","example":"La casa è bella."},{"word":"Scuola","translation":"Escuela","example":"Vado a scuola."},{"word":"Famiglia","translation":"Familia","example":"La mia famiglia è qui."}],"dialogue":[{"speaker":"Tutor","line":"Mi chiamo...","translation":"Frase modelo"},{"speaker":"Student","line":"Sono di...","translation":"Respuesta guiada"}],"reading":{"text":"Giulia vive a Roma. Studia italiano la mattina e parla con la sua amica Sofia.","questions":["Dove vive Giulia?","Quando studia?","Con chi parla?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Ciao\"?","options":["Hola","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Presentati in italiano con nome, paese e gusto.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Mi chiamo...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-a1-writing',
  'italian',
  'A1',
  'writing',
  'Italiano A1 · Writing Challenge',
  'Italiano base: Puedo saludar, presentarme y entender frases simples.',
  1120,
  true,
  true,
  10,
  20,
  array['italian', 'a1', 'writing'],
  array['Ciao', 'Grazie', 'Amico', 'Casa'],
  '{"language":"Italiano","language_key":"italian","level_title":"Italiano base","intro":"Puedo saludar, presentarme y entender frases simples.","mission":"Presentati in italiano con nome, paese e gusto.","grammar":"Essere, avere, articoli, presente básico.","phrases":["Mi chiamo...","Sono di...","Piacere.","Non capisco."],"vocabulary":[{"word":"Ciao","translation":"Hola","example":"Ciao, mi chiamo Luca."},{"word":"Grazie","translation":"Gracias","example":"Grazie mille."},{"word":"Amico","translation":"Amigo","example":"Lui è un amico."},{"word":"Casa","translation":"Casa","example":"La casa è bella."},{"word":"Scuola","translation":"Escuela","example":"Vado a scuola."},{"word":"Famiglia","translation":"Familia","example":"La mia famiglia è qui."}],"dialogue":[{"speaker":"Tutor","line":"Mi chiamo...","translation":"Frase modelo"},{"speaker":"Student","line":"Sono di...","translation":"Respuesta guiada"}],"reading":{"text":"Giulia vive a Roma. Studia italiano la mattina e parla con la sua amica Sofia.","questions":["Dove vive Giulia?","Quando studia?","Con chi parla?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Ciao\"?","options":["Hola","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Presentati in italiano con nome, paese e gusto.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Mi chiamo...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-a1-grammar',
  'italian',
  'A1',
  'grammar',
  'Italiano A1 · Grammar Focus',
  'Italiano base: Puedo saludar, presentarme y entender frases simples.',
  1130,
  true,
  true,
  10,
  20,
  array['italian', 'a1', 'grammar'],
  array['Ciao', 'Grazie', 'Amico', 'Casa'],
  '{"language":"Italiano","language_key":"italian","level_title":"Italiano base","intro":"Puedo saludar, presentarme y entender frases simples.","mission":"Presentati in italiano con nome, paese e gusto.","grammar":"Essere, avere, articoli, presente básico.","phrases":["Mi chiamo...","Sono di...","Piacere.","Non capisco."],"vocabulary":[{"word":"Ciao","translation":"Hola","example":"Ciao, mi chiamo Luca."},{"word":"Grazie","translation":"Gracias","example":"Grazie mille."},{"word":"Amico","translation":"Amigo","example":"Lui è un amico."},{"word":"Casa","translation":"Casa","example":"La casa è bella."},{"word":"Scuola","translation":"Escuela","example":"Vado a scuola."},{"word":"Famiglia","translation":"Familia","example":"La mia famiglia è qui."}],"dialogue":[{"speaker":"Tutor","line":"Mi chiamo...","translation":"Frase modelo"},{"speaker":"Student","line":"Sono di...","translation":"Respuesta guiada"}],"reading":{"text":"Giulia vive a Roma. Studia italiano la mattina e parla con la sua amica Sofia.","questions":["Dove vive Giulia?","Quando studia?","Con chi parla?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Ciao\"?","options":["Hola","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Presentati in italiano con nome, paese e gusto.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Mi chiamo...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-a1-vocabulary',
  'italian',
  'A1',
  'vocabulary',
  'Italiano A1 · Vocabulary Boost',
  'Italiano base: Puedo saludar, presentarme y entender frases simples.',
  1140,
  true,
  true,
  10,
  10,
  array['italian', 'a1', 'vocabulary'],
  array['Ciao', 'Grazie', 'Amico', 'Casa'],
  '{"language":"Italiano","language_key":"italian","level_title":"Italiano base","intro":"Puedo saludar, presentarme y entender frases simples.","mission":"Presentati in italiano con nome, paese e gusto.","grammar":"Essere, avere, articoli, presente básico.","phrases":["Mi chiamo...","Sono di...","Piacere.","Non capisco."],"vocabulary":[{"word":"Ciao","translation":"Hola","example":"Ciao, mi chiamo Luca."},{"word":"Grazie","translation":"Gracias","example":"Grazie mille."},{"word":"Amico","translation":"Amigo","example":"Lui è un amico."},{"word":"Casa","translation":"Casa","example":"La casa è bella."},{"word":"Scuola","translation":"Escuela","example":"Vado a scuola."},{"word":"Famiglia","translation":"Familia","example":"La mia famiglia è qui."}],"dialogue":[{"speaker":"Tutor","line":"Mi chiamo...","translation":"Frase modelo"},{"speaker":"Student","line":"Sono di...","translation":"Respuesta guiada"}],"reading":{"text":"Giulia vive a Roma. Studia italiano la mattina e parla con la sua amica Sofia.","questions":["Dove vive Giulia?","Quando studia?","Con chi parla?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Ciao\"?","options":["Hola","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Presentati in italiano con nome, paese e gusto.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Mi chiamo...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-a2-listening',
  'italian',
  'A2',
  'listening',
  'Italiano A2 · Listening Lab',
  'Vita quotidiana: Puedo hablar de rutinas, comida, compras y planes.',
  1150,
  true,
  true,
  10,
  20,
  array['italian', 'a2', 'listening'],
  array['Oggi', 'Negozio', 'Colazione', 'Viaggio'],
  '{"language":"Italiano","language_key":"italian","level_title":"Vita quotidiana","intro":"Puedo hablar de rutinas, comida, compras y planes.","mission":"Descrivi la tua giornata in cinque frasi.","grammar":"Passato prossimo, futuro vicino, comparativi.","phrases":["Vorrei...","Ogni giorno...","Ieri sono andato...","Devo..."],"vocabulary":[{"word":"Oggi","translation":"Hoy","example":"Oggi lavoro."},{"word":"Negozio","translation":"Tienda","example":"Vado al negozio."},{"word":"Colazione","translation":"Desayuno","example":"Faccio colazione."},{"word":"Viaggio","translation":"Viaje","example":"Il viaggio è breve."},{"word":"Tempo","translation":"Clima/tiempo","example":"Il tempo è bello."},{"word":"Dopo","translation":"Después","example":"Dopo la lezione, leggo."}],"dialogue":[{"speaker":"Tutor","line":"Vorrei...","translation":"Frase modelo"},{"speaker":"Student","line":"Ogni giorno...","translation":"Respuesta guiada"}],"reading":{"text":"Marco lavora la mattina. Dopo il lavoro compra il pane e prepara un caffè.","questions":["Quando lavora Marco?","Che cosa compra?","Che cosa prepara?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Oggi\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Descrivi la tua giornata in cinque frasi.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Vorrei...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-a2-speaking',
  'italian',
  'A2',
  'speaking',
  'Italiano A2 · Speaking Mission',
  'Vita quotidiana: Puedo hablar de rutinas, comida, compras y planes.',
  1160,
  true,
  true,
  10,
  20,
  array['italian', 'a2', 'speaking'],
  array['Oggi', 'Negozio', 'Colazione', 'Viaggio'],
  '{"language":"Italiano","language_key":"italian","level_title":"Vita quotidiana","intro":"Puedo hablar de rutinas, comida, compras y planes.","mission":"Descrivi la tua giornata in cinque frasi.","grammar":"Passato prossimo, futuro vicino, comparativi.","phrases":["Vorrei...","Ogni giorno...","Ieri sono andato...","Devo..."],"vocabulary":[{"word":"Oggi","translation":"Hoy","example":"Oggi lavoro."},{"word":"Negozio","translation":"Tienda","example":"Vado al negozio."},{"word":"Colazione","translation":"Desayuno","example":"Faccio colazione."},{"word":"Viaggio","translation":"Viaje","example":"Il viaggio è breve."},{"word":"Tempo","translation":"Clima/tiempo","example":"Il tempo è bello."},{"word":"Dopo","translation":"Después","example":"Dopo la lezione, leggo."}],"dialogue":[{"speaker":"Tutor","line":"Vorrei...","translation":"Frase modelo"},{"speaker":"Student","line":"Ogni giorno...","translation":"Respuesta guiada"}],"reading":{"text":"Marco lavora la mattina. Dopo il lavoro compra il pane e prepara un caffè.","questions":["Quando lavora Marco?","Che cosa compra?","Che cosa prepara?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Oggi\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Descrivi la tua giornata in cinque frasi.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Vorrei...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-a2-reading',
  'italian',
  'A2',
  'reading',
  'Italiano A2 · Reading Quest',
  'Vita quotidiana: Puedo hablar de rutinas, comida, compras y planes.',
  1170,
  true,
  true,
  10,
  20,
  array['italian', 'a2', 'reading'],
  array['Oggi', 'Negozio', 'Colazione', 'Viaggio'],
  '{"language":"Italiano","language_key":"italian","level_title":"Vita quotidiana","intro":"Puedo hablar de rutinas, comida, compras y planes.","mission":"Descrivi la tua giornata in cinque frasi.","grammar":"Passato prossimo, futuro vicino, comparativi.","phrases":["Vorrei...","Ogni giorno...","Ieri sono andato...","Devo..."],"vocabulary":[{"word":"Oggi","translation":"Hoy","example":"Oggi lavoro."},{"word":"Negozio","translation":"Tienda","example":"Vado al negozio."},{"word":"Colazione","translation":"Desayuno","example":"Faccio colazione."},{"word":"Viaggio","translation":"Viaje","example":"Il viaggio è breve."},{"word":"Tempo","translation":"Clima/tiempo","example":"Il tempo è bello."},{"word":"Dopo","translation":"Después","example":"Dopo la lezione, leggo."}],"dialogue":[{"speaker":"Tutor","line":"Vorrei...","translation":"Frase modelo"},{"speaker":"Student","line":"Ogni giorno...","translation":"Respuesta guiada"}],"reading":{"text":"Marco lavora la mattina. Dopo il lavoro compra il pane e prepara un caffè.","questions":["Quando lavora Marco?","Che cosa compra?","Che cosa prepara?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Oggi\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Descrivi la tua giornata in cinque frasi.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Vorrei...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-a2-writing',
  'italian',
  'A2',
  'writing',
  'Italiano A2 · Writing Challenge',
  'Vita quotidiana: Puedo hablar de rutinas, comida, compras y planes.',
  1180,
  true,
  true,
  10,
  20,
  array['italian', 'a2', 'writing'],
  array['Oggi', 'Negozio', 'Colazione', 'Viaggio'],
  '{"language":"Italiano","language_key":"italian","level_title":"Vita quotidiana","intro":"Puedo hablar de rutinas, comida, compras y planes.","mission":"Descrivi la tua giornata in cinque frasi.","grammar":"Passato prossimo, futuro vicino, comparativi.","phrases":["Vorrei...","Ogni giorno...","Ieri sono andato...","Devo..."],"vocabulary":[{"word":"Oggi","translation":"Hoy","example":"Oggi lavoro."},{"word":"Negozio","translation":"Tienda","example":"Vado al negozio."},{"word":"Colazione","translation":"Desayuno","example":"Faccio colazione."},{"word":"Viaggio","translation":"Viaje","example":"Il viaggio è breve."},{"word":"Tempo","translation":"Clima/tiempo","example":"Il tempo è bello."},{"word":"Dopo","translation":"Después","example":"Dopo la lezione, leggo."}],"dialogue":[{"speaker":"Tutor","line":"Vorrei...","translation":"Frase modelo"},{"speaker":"Student","line":"Ogni giorno...","translation":"Respuesta guiada"}],"reading":{"text":"Marco lavora la mattina. Dopo il lavoro compra il pane e prepara un caffè.","questions":["Quando lavora Marco?","Che cosa compra?","Che cosa prepara?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Oggi\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Descrivi la tua giornata in cinque frasi.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Vorrei...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-a2-grammar',
  'italian',
  'A2',
  'grammar',
  'Italiano A2 · Grammar Focus',
  'Vita quotidiana: Puedo hablar de rutinas, comida, compras y planes.',
  1190,
  true,
  true,
  10,
  20,
  array['italian', 'a2', 'grammar'],
  array['Oggi', 'Negozio', 'Colazione', 'Viaggio'],
  '{"language":"Italiano","language_key":"italian","level_title":"Vita quotidiana","intro":"Puedo hablar de rutinas, comida, compras y planes.","mission":"Descrivi la tua giornata in cinque frasi.","grammar":"Passato prossimo, futuro vicino, comparativi.","phrases":["Vorrei...","Ogni giorno...","Ieri sono andato...","Devo..."],"vocabulary":[{"word":"Oggi","translation":"Hoy","example":"Oggi lavoro."},{"word":"Negozio","translation":"Tienda","example":"Vado al negozio."},{"word":"Colazione","translation":"Desayuno","example":"Faccio colazione."},{"word":"Viaggio","translation":"Viaje","example":"Il viaggio è breve."},{"word":"Tempo","translation":"Clima/tiempo","example":"Il tempo è bello."},{"word":"Dopo","translation":"Después","example":"Dopo la lezione, leggo."}],"dialogue":[{"speaker":"Tutor","line":"Vorrei...","translation":"Frase modelo"},{"speaker":"Student","line":"Ogni giorno...","translation":"Respuesta guiada"}],"reading":{"text":"Marco lavora la mattina. Dopo il lavoro compra il pane e prepara un caffè.","questions":["Quando lavora Marco?","Che cosa compra?","Che cosa prepara?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Oggi\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Descrivi la tua giornata in cinque frasi.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Vorrei...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-a2-vocabulary',
  'italian',
  'A2',
  'vocabulary',
  'Italiano A2 · Vocabulary Boost',
  'Vita quotidiana: Puedo hablar de rutinas, comida, compras y planes.',
  1200,
  true,
  true,
  10,
  10,
  array['italian', 'a2', 'vocabulary'],
  array['Oggi', 'Negozio', 'Colazione', 'Viaggio'],
  '{"language":"Italiano","language_key":"italian","level_title":"Vita quotidiana","intro":"Puedo hablar de rutinas, comida, compras y planes.","mission":"Descrivi la tua giornata in cinque frasi.","grammar":"Passato prossimo, futuro vicino, comparativi.","phrases":["Vorrei...","Ogni giorno...","Ieri sono andato...","Devo..."],"vocabulary":[{"word":"Oggi","translation":"Hoy","example":"Oggi lavoro."},{"word":"Negozio","translation":"Tienda","example":"Vado al negozio."},{"word":"Colazione","translation":"Desayuno","example":"Faccio colazione."},{"word":"Viaggio","translation":"Viaje","example":"Il viaggio è breve."},{"word":"Tempo","translation":"Clima/tiempo","example":"Il tempo è bello."},{"word":"Dopo","translation":"Después","example":"Dopo la lezione, leggo."}],"dialogue":[{"speaker":"Tutor","line":"Vorrei...","translation":"Frase modelo"},{"speaker":"Student","line":"Ogni giorno...","translation":"Respuesta guiada"}],"reading":{"text":"Marco lavora la mattina. Dopo il lavoro compra il pane e prepara un caffè.","questions":["Quando lavora Marco?","Che cosa compra?","Che cosa prepara?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Oggi\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Descrivi la tua giornata in cinque frasi.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Vorrei...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-b1-listening',
  'italian',
  'B1',
  'listening',
  'Italiano B1 · Listening Lab',
  'Conversazione sicura: Puedo contar experiencias y expresar opiniones.',
  1210,
  false,
  true,
  15,
  20,
  array['italian', 'b1', 'listening'],
  array['Opinione', 'Motivo', 'Esperienza', 'Migliorare'],
  '{"language":"Italiano","language_key":"italian","level_title":"Conversazione sicura","intro":"Puedo contar experiencias y expresar opiniones.","mission":"Esprimi la tua opinione su imparare una lingua.","grammar":"Imperfetto, condizionale, pronomi, connettori.","phrases":["Secondo me...","Penso che...","Perché...","Mi piacerebbe..."],"vocabulary":[{"word":"Opinione","translation":"Opinión","example":"Secondo me, è utile."},{"word":"Motivo","translation":"Razón","example":"Il motivo è chiaro."},{"word":"Esperienza","translation":"Experiencia","example":"È stata una bella esperienza."},{"word":"Migliorare","translation":"Mejorar","example":"Voglio migliorare."},{"word":"Scegliere","translation":"Elegir","example":"Devo scegliere."},{"word":"Riuscire","translation":"Lograr","example":"Puoi riuscire."}],"dialogue":[{"speaker":"Tutor","line":"Secondo me...","translation":"Frase modelo"},{"speaker":"Student","line":"Penso che...","translation":"Respuesta guiada"}],"reading":{"text":"Laura studia italiano da sei mesi. Capisce meglio le conversazioni e parla con più sicurezza.","questions":["Da quanto tempo studia?","Che cosa capisce meglio?","Come parla?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Opinione\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Esprimi la tua opinione su imparare una lingua.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Secondo me...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-b1-speaking',
  'italian',
  'B1',
  'speaking',
  'Italiano B1 · Speaking Mission',
  'Conversazione sicura: Puedo contar experiencias y expresar opiniones.',
  1220,
  false,
  true,
  15,
  20,
  array['italian', 'b1', 'speaking'],
  array['Opinione', 'Motivo', 'Esperienza', 'Migliorare'],
  '{"language":"Italiano","language_key":"italian","level_title":"Conversazione sicura","intro":"Puedo contar experiencias y expresar opiniones.","mission":"Esprimi la tua opinione su imparare una lingua.","grammar":"Imperfetto, condizionale, pronomi, connettori.","phrases":["Secondo me...","Penso che...","Perché...","Mi piacerebbe..."],"vocabulary":[{"word":"Opinione","translation":"Opinión","example":"Secondo me, è utile."},{"word":"Motivo","translation":"Razón","example":"Il motivo è chiaro."},{"word":"Esperienza","translation":"Experiencia","example":"È stata una bella esperienza."},{"word":"Migliorare","translation":"Mejorar","example":"Voglio migliorare."},{"word":"Scegliere","translation":"Elegir","example":"Devo scegliere."},{"word":"Riuscire","translation":"Lograr","example":"Puoi riuscire."}],"dialogue":[{"speaker":"Tutor","line":"Secondo me...","translation":"Frase modelo"},{"speaker":"Student","line":"Penso che...","translation":"Respuesta guiada"}],"reading":{"text":"Laura studia italiano da sei mesi. Capisce meglio le conversazioni e parla con più sicurezza.","questions":["Da quanto tempo studia?","Che cosa capisce meglio?","Come parla?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Opinione\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Esprimi la tua opinione su imparare una lingua.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Secondo me...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-b1-reading',
  'italian',
  'B1',
  'reading',
  'Italiano B1 · Reading Quest',
  'Conversazione sicura: Puedo contar experiencias y expresar opiniones.',
  1230,
  false,
  true,
  15,
  20,
  array['italian', 'b1', 'reading'],
  array['Opinione', 'Motivo', 'Esperienza', 'Migliorare'],
  '{"language":"Italiano","language_key":"italian","level_title":"Conversazione sicura","intro":"Puedo contar experiencias y expresar opiniones.","mission":"Esprimi la tua opinione su imparare una lingua.","grammar":"Imperfetto, condizionale, pronomi, connettori.","phrases":["Secondo me...","Penso che...","Perché...","Mi piacerebbe..."],"vocabulary":[{"word":"Opinione","translation":"Opinión","example":"Secondo me, è utile."},{"word":"Motivo","translation":"Razón","example":"Il motivo è chiaro."},{"word":"Esperienza","translation":"Experiencia","example":"È stata una bella esperienza."},{"word":"Migliorare","translation":"Mejorar","example":"Voglio migliorare."},{"word":"Scegliere","translation":"Elegir","example":"Devo scegliere."},{"word":"Riuscire","translation":"Lograr","example":"Puoi riuscire."}],"dialogue":[{"speaker":"Tutor","line":"Secondo me...","translation":"Frase modelo"},{"speaker":"Student","line":"Penso che...","translation":"Respuesta guiada"}],"reading":{"text":"Laura studia italiano da sei mesi. Capisce meglio le conversazioni e parla con più sicurezza.","questions":["Da quanto tempo studia?","Che cosa capisce meglio?","Come parla?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Opinione\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Esprimi la tua opinione su imparare una lingua.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Secondo me...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-b1-writing',
  'italian',
  'B1',
  'writing',
  'Italiano B1 · Writing Challenge',
  'Conversazione sicura: Puedo contar experiencias y expresar opiniones.',
  1240,
  false,
  true,
  15,
  20,
  array['italian', 'b1', 'writing'],
  array['Opinione', 'Motivo', 'Esperienza', 'Migliorare'],
  '{"language":"Italiano","language_key":"italian","level_title":"Conversazione sicura","intro":"Puedo contar experiencias y expresar opiniones.","mission":"Esprimi la tua opinione su imparare una lingua.","grammar":"Imperfetto, condizionale, pronomi, connettori.","phrases":["Secondo me...","Penso che...","Perché...","Mi piacerebbe..."],"vocabulary":[{"word":"Opinione","translation":"Opinión","example":"Secondo me, è utile."},{"word":"Motivo","translation":"Razón","example":"Il motivo è chiaro."},{"word":"Esperienza","translation":"Experiencia","example":"È stata una bella esperienza."},{"word":"Migliorare","translation":"Mejorar","example":"Voglio migliorare."},{"word":"Scegliere","translation":"Elegir","example":"Devo scegliere."},{"word":"Riuscire","translation":"Lograr","example":"Puoi riuscire."}],"dialogue":[{"speaker":"Tutor","line":"Secondo me...","translation":"Frase modelo"},{"speaker":"Student","line":"Penso che...","translation":"Respuesta guiada"}],"reading":{"text":"Laura studia italiano da sei mesi. Capisce meglio le conversazioni e parla con più sicurezza.","questions":["Da quanto tempo studia?","Che cosa capisce meglio?","Come parla?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Opinione\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Esprimi la tua opinione su imparare una lingua.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Secondo me...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-b1-grammar',
  'italian',
  'B1',
  'grammar',
  'Italiano B1 · Grammar Focus',
  'Conversazione sicura: Puedo contar experiencias y expresar opiniones.',
  1250,
  false,
  true,
  15,
  20,
  array['italian', 'b1', 'grammar'],
  array['Opinione', 'Motivo', 'Esperienza', 'Migliorare'],
  '{"language":"Italiano","language_key":"italian","level_title":"Conversazione sicura","intro":"Puedo contar experiencias y expresar opiniones.","mission":"Esprimi la tua opinione su imparare una lingua.","grammar":"Imperfetto, condizionale, pronomi, connettori.","phrases":["Secondo me...","Penso che...","Perché...","Mi piacerebbe..."],"vocabulary":[{"word":"Opinione","translation":"Opinión","example":"Secondo me, è utile."},{"word":"Motivo","translation":"Razón","example":"Il motivo è chiaro."},{"word":"Esperienza","translation":"Experiencia","example":"È stata una bella esperienza."},{"word":"Migliorare","translation":"Mejorar","example":"Voglio migliorare."},{"word":"Scegliere","translation":"Elegir","example":"Devo scegliere."},{"word":"Riuscire","translation":"Lograr","example":"Puoi riuscire."}],"dialogue":[{"speaker":"Tutor","line":"Secondo me...","translation":"Frase modelo"},{"speaker":"Student","line":"Penso che...","translation":"Respuesta guiada"}],"reading":{"text":"Laura studia italiano da sei mesi. Capisce meglio le conversazioni e parla con più sicurezza.","questions":["Da quanto tempo studia?","Che cosa capisce meglio?","Come parla?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Opinione\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Esprimi la tua opinione su imparare una lingua.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Secondo me...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-b1-vocabulary',
  'italian',
  'B1',
  'vocabulary',
  'Italiano B1 · Vocabulary Boost',
  'Conversazione sicura: Puedo contar experiencias y expresar opiniones.',
  1260,
  false,
  true,
  15,
  10,
  array['italian', 'b1', 'vocabulary'],
  array['Opinione', 'Motivo', 'Esperienza', 'Migliorare'],
  '{"language":"Italiano","language_key":"italian","level_title":"Conversazione sicura","intro":"Puedo contar experiencias y expresar opiniones.","mission":"Esprimi la tua opinione su imparare una lingua.","grammar":"Imperfetto, condizionale, pronomi, connettori.","phrases":["Secondo me...","Penso che...","Perché...","Mi piacerebbe..."],"vocabulary":[{"word":"Opinione","translation":"Opinión","example":"Secondo me, è utile."},{"word":"Motivo","translation":"Razón","example":"Il motivo è chiaro."},{"word":"Esperienza","translation":"Experiencia","example":"È stata una bella esperienza."},{"word":"Migliorare","translation":"Mejorar","example":"Voglio migliorare."},{"word":"Scegliere","translation":"Elegir","example":"Devo scegliere."},{"word":"Riuscire","translation":"Lograr","example":"Puoi riuscire."}],"dialogue":[{"speaker":"Tutor","line":"Secondo me...","translation":"Frase modelo"},{"speaker":"Student","line":"Penso che...","translation":"Respuesta guiada"}],"reading":{"text":"Laura studia italiano da sei mesi. Capisce meglio le conversazioni e parla con più sicurezza.","questions":["Da quanto tempo studia?","Che cosa capisce meglio?","Come parla?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Opinione\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Esprimi la tua opinione su imparare una lingua.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Secondo me...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-b2-listening',
  'italian',
  'B2',
  'listening',
  'Italiano B2 · Listening Lab',
  'Argomentazione: Puedo defender puntos de vista y comprender textos complejos.',
  1270,
  false,
  true,
  15,
  20,
  array['italian', 'b2', 'listening'],
  array['Tuttavia', 'Prova', 'Sviluppare', 'Impatto'],
  '{"language":"Italiano","language_key":"italian","level_title":"Argomentazione","intro":"Puedo defender puntos de vista y comprender textos complejos.","mission":"Scrivi un breve argomento sull’educazione online.","grammar":"Congiuntivo, periodo ipotetico, forma passiva.","phrases":["Da una parte...","Dall’altra parte...","È necessario che...","Questo dimostra che..."],"vocabulary":[{"word":"Tuttavia","translation":"Sin embargo","example":"Tuttavia, ci sono limiti."},{"word":"Prova","translation":"Evidencia","example":"La prova è chiara."},{"word":"Sviluppare","translation":"Desarrollar","example":"Bisogna sviluppare competenze."},{"word":"Impatto","translation":"Impacto","example":"L’impatto è forte."},{"word":"Affidabile","translation":"Confiable","example":"La fonte è affidabile."},{"word":"Approccio","translation":"Enfoque","example":"L’approccio è utile."}],"dialogue":[{"speaker":"Tutor","line":"Da una parte...","translation":"Frase modelo"},{"speaker":"Student","line":"Dall’altra parte...","translation":"Respuesta guiada"}],"reading":{"text":"La tecnologia facilita l’accesso alla conoscenza, ma richiede autonomia, disciplina e competenze digitali.","questions":["Che cosa facilita la tecnologia?","Che cosa richiede?","Qual è il tema?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Tuttavia\"?","options":["Sin embargo","Evidencia","Desarrollar","Impacto"],"answer":0},{"type":"writing","prompt":"Scrivi un breve argomento sull’educazione online.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Da una parte...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-b2-speaking',
  'italian',
  'B2',
  'speaking',
  'Italiano B2 · Speaking Mission',
  'Argomentazione: Puedo defender puntos de vista y comprender textos complejos.',
  1280,
  false,
  true,
  15,
  20,
  array['italian', 'b2', 'speaking'],
  array['Tuttavia', 'Prova', 'Sviluppare', 'Impatto'],
  '{"language":"Italiano","language_key":"italian","level_title":"Argomentazione","intro":"Puedo defender puntos de vista y comprender textos complejos.","mission":"Scrivi un breve argomento sull’educazione online.","grammar":"Congiuntivo, periodo ipotetico, forma passiva.","phrases":["Da una parte...","Dall’altra parte...","È necessario che...","Questo dimostra che..."],"vocabulary":[{"word":"Tuttavia","translation":"Sin embargo","example":"Tuttavia, ci sono limiti."},{"word":"Prova","translation":"Evidencia","example":"La prova è chiara."},{"word":"Sviluppare","translation":"Desarrollar","example":"Bisogna sviluppare competenze."},{"word":"Impatto","translation":"Impacto","example":"L’impatto è forte."},{"word":"Affidabile","translation":"Confiable","example":"La fonte è affidabile."},{"word":"Approccio","translation":"Enfoque","example":"L’approccio è utile."}],"dialogue":[{"speaker":"Tutor","line":"Da una parte...","translation":"Frase modelo"},{"speaker":"Student","line":"Dall’altra parte...","translation":"Respuesta guiada"}],"reading":{"text":"La tecnologia facilita l’accesso alla conoscenza, ma richiede autonomia, disciplina e competenze digitali.","questions":["Che cosa facilita la tecnologia?","Che cosa richiede?","Qual è il tema?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Tuttavia\"?","options":["Sin embargo","Evidencia","Desarrollar","Impacto"],"answer":0},{"type":"writing","prompt":"Scrivi un breve argomento sull’educazione online.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Da una parte...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-b2-reading',
  'italian',
  'B2',
  'reading',
  'Italiano B2 · Reading Quest',
  'Argomentazione: Puedo defender puntos de vista y comprender textos complejos.',
  1290,
  false,
  true,
  15,
  20,
  array['italian', 'b2', 'reading'],
  array['Tuttavia', 'Prova', 'Sviluppare', 'Impatto'],
  '{"language":"Italiano","language_key":"italian","level_title":"Argomentazione","intro":"Puedo defender puntos de vista y comprender textos complejos.","mission":"Scrivi un breve argomento sull’educazione online.","grammar":"Congiuntivo, periodo ipotetico, forma passiva.","phrases":["Da una parte...","Dall’altra parte...","È necessario che...","Questo dimostra che..."],"vocabulary":[{"word":"Tuttavia","translation":"Sin embargo","example":"Tuttavia, ci sono limiti."},{"word":"Prova","translation":"Evidencia","example":"La prova è chiara."},{"word":"Sviluppare","translation":"Desarrollar","example":"Bisogna sviluppare competenze."},{"word":"Impatto","translation":"Impacto","example":"L’impatto è forte."},{"word":"Affidabile","translation":"Confiable","example":"La fonte è affidabile."},{"word":"Approccio","translation":"Enfoque","example":"L’approccio è utile."}],"dialogue":[{"speaker":"Tutor","line":"Da una parte...","translation":"Frase modelo"},{"speaker":"Student","line":"Dall’altra parte...","translation":"Respuesta guiada"}],"reading":{"text":"La tecnologia facilita l’accesso alla conoscenza, ma richiede autonomia, disciplina e competenze digitali.","questions":["Che cosa facilita la tecnologia?","Che cosa richiede?","Qual è il tema?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Tuttavia\"?","options":["Sin embargo","Evidencia","Desarrollar","Impacto"],"answer":0},{"type":"writing","prompt":"Scrivi un breve argomento sull’educazione online.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Da una parte...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-b2-writing',
  'italian',
  'B2',
  'writing',
  'Italiano B2 · Writing Challenge',
  'Argomentazione: Puedo defender puntos de vista y comprender textos complejos.',
  1300,
  false,
  true,
  15,
  20,
  array['italian', 'b2', 'writing'],
  array['Tuttavia', 'Prova', 'Sviluppare', 'Impatto'],
  '{"language":"Italiano","language_key":"italian","level_title":"Argomentazione","intro":"Puedo defender puntos de vista y comprender textos complejos.","mission":"Scrivi un breve argomento sull’educazione online.","grammar":"Congiuntivo, periodo ipotetico, forma passiva.","phrases":["Da una parte...","Dall’altra parte...","È necessario che...","Questo dimostra che..."],"vocabulary":[{"word":"Tuttavia","translation":"Sin embargo","example":"Tuttavia, ci sono limiti."},{"word":"Prova","translation":"Evidencia","example":"La prova è chiara."},{"word":"Sviluppare","translation":"Desarrollar","example":"Bisogna sviluppare competenze."},{"word":"Impatto","translation":"Impacto","example":"L’impatto è forte."},{"word":"Affidabile","translation":"Confiable","example":"La fonte è affidabile."},{"word":"Approccio","translation":"Enfoque","example":"L’approccio è utile."}],"dialogue":[{"speaker":"Tutor","line":"Da una parte...","translation":"Frase modelo"},{"speaker":"Student","line":"Dall’altra parte...","translation":"Respuesta guiada"}],"reading":{"text":"La tecnologia facilita l’accesso alla conoscenza, ma richiede autonomia, disciplina e competenze digitali.","questions":["Che cosa facilita la tecnologia?","Che cosa richiede?","Qual è il tema?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Tuttavia\"?","options":["Sin embargo","Evidencia","Desarrollar","Impacto"],"answer":0},{"type":"writing","prompt":"Scrivi un breve argomento sull’educazione online.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Da una parte...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-b2-grammar',
  'italian',
  'B2',
  'grammar',
  'Italiano B2 · Grammar Focus',
  'Argomentazione: Puedo defender puntos de vista y comprender textos complejos.',
  1310,
  false,
  true,
  15,
  20,
  array['italian', 'b2', 'grammar'],
  array['Tuttavia', 'Prova', 'Sviluppare', 'Impatto'],
  '{"language":"Italiano","language_key":"italian","level_title":"Argomentazione","intro":"Puedo defender puntos de vista y comprender textos complejos.","mission":"Scrivi un breve argomento sull’educazione online.","grammar":"Congiuntivo, periodo ipotetico, forma passiva.","phrases":["Da una parte...","Dall’altra parte...","È necessario che...","Questo dimostra che..."],"vocabulary":[{"word":"Tuttavia","translation":"Sin embargo","example":"Tuttavia, ci sono limiti."},{"word":"Prova","translation":"Evidencia","example":"La prova è chiara."},{"word":"Sviluppare","translation":"Desarrollar","example":"Bisogna sviluppare competenze."},{"word":"Impatto","translation":"Impacto","example":"L’impatto è forte."},{"word":"Affidabile","translation":"Confiable","example":"La fonte è affidabile."},{"word":"Approccio","translation":"Enfoque","example":"L’approccio è utile."}],"dialogue":[{"speaker":"Tutor","line":"Da una parte...","translation":"Frase modelo"},{"speaker":"Student","line":"Dall’altra parte...","translation":"Respuesta guiada"}],"reading":{"text":"La tecnologia facilita l’accesso alla conoscenza, ma richiede autonomia, disciplina e competenze digitali.","questions":["Che cosa facilita la tecnologia?","Che cosa richiede?","Qual è il tema?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Tuttavia\"?","options":["Sin embargo","Evidencia","Desarrollar","Impacto"],"answer":0},{"type":"writing","prompt":"Scrivi un breve argomento sull’educazione online.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Da una parte...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-b2-vocabulary',
  'italian',
  'B2',
  'vocabulary',
  'Italiano B2 · Vocabulary Boost',
  'Argomentazione: Puedo defender puntos de vista y comprender textos complejos.',
  1320,
  false,
  true,
  15,
  10,
  array['italian', 'b2', 'vocabulary'],
  array['Tuttavia', 'Prova', 'Sviluppare', 'Impatto'],
  '{"language":"Italiano","language_key":"italian","level_title":"Argomentazione","intro":"Puedo defender puntos de vista y comprender textos complejos.","mission":"Scrivi un breve argomento sull’educazione online.","grammar":"Congiuntivo, periodo ipotetico, forma passiva.","phrases":["Da una parte...","Dall’altra parte...","È necessario che...","Questo dimostra che..."],"vocabulary":[{"word":"Tuttavia","translation":"Sin embargo","example":"Tuttavia, ci sono limiti."},{"word":"Prova","translation":"Evidencia","example":"La prova è chiara."},{"word":"Sviluppare","translation":"Desarrollar","example":"Bisogna sviluppare competenze."},{"word":"Impatto","translation":"Impacto","example":"L’impatto è forte."},{"word":"Affidabile","translation":"Confiable","example":"La fonte è affidabile."},{"word":"Approccio","translation":"Enfoque","example":"L’approccio è utile."}],"dialogue":[{"speaker":"Tutor","line":"Da una parte...","translation":"Frase modelo"},{"speaker":"Student","line":"Dall’altra parte...","translation":"Respuesta guiada"}],"reading":{"text":"La tecnologia facilita l’accesso alla conoscenza, ma richiede autonomia, disciplina e competenze digitali.","questions":["Che cosa facilita la tecnologia?","Che cosa richiede?","Qual è il tema?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Tuttavia\"?","options":["Sin embargo","Evidencia","Desarrollar","Impacto"],"answer":0},{"type":"writing","prompt":"Scrivi un breve argomento sull’educazione online.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Da una parte...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-c1-listening',
  'italian',
  'C1',
  'listening',
  'Italiano C1 · Listening Lab',
  'Espressione avanzata: Puedo expresarme con precisión, estilo y matices.',
  1330,
  false,
  true,
  15,
  20,
  array['italian', 'c1', 'listening'],
  array['Tuttavia', 'Portata', 'Sostenere', 'Approfondire'],
  '{"language":"Italiano","language_key":"italian","level_title":"Espressione avanzata","intro":"Puedo expresarme con precisión, estilo y matices.","mission":"Riscrivi un’opinione con stile formale.","grammar":"Congiuntivo avanzado, nominalizzazione, registro.","phrases":["È opportuno sottolineare che...","In questa prospettiva...","Non si tratta soltanto di...","L’analisi evidenzia..."],"vocabulary":[{"word":"Tuttavia","translation":"No obstante","example":"Tuttavia, il punto resta valido."},{"word":"Portata","translation":"Alcance","example":"La portata è ampia."},{"word":"Sostenere","translation":"Sostener","example":"L’autore sostiene la tesi."},{"word":"Approfondire","translation":"Profundizar","example":"Occorre approfondire."},{"word":"Pertinente","translation":"Pertinente","example":"È un esempio pertinente."},{"word":"Sfumatura","translation":"Matiz","example":"La sfumatura è importante."}],"dialogue":[{"speaker":"Tutor","line":"È opportuno sottolineare che...","translation":"Frase modelo"},{"speaker":"Student","line":"In questa prospettiva...","translation":"Respuesta guiada"}],"reading":{"text":"La padronanza di una lingua richiede la capacità di interpretare impliciti, modulare il registro e costruire pensiero sfumato.","questions":["Che cosa richiede la padronanza?","Che cosa bisogna modulare?","Che tipo di pensiero?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Tuttavia\"?","options":["No obstante","Alcance","Sostener","Profundizar"],"answer":0},{"type":"writing","prompt":"Riscrivi un’opinione con stile formale.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: È opportuno sottolineare che...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-c1-speaking',
  'italian',
  'C1',
  'speaking',
  'Italiano C1 · Speaking Mission',
  'Espressione avanzata: Puedo expresarme con precisión, estilo y matices.',
  1340,
  false,
  true,
  15,
  20,
  array['italian', 'c1', 'speaking'],
  array['Tuttavia', 'Portata', 'Sostenere', 'Approfondire'],
  '{"language":"Italiano","language_key":"italian","level_title":"Espressione avanzata","intro":"Puedo expresarme con precisión, estilo y matices.","mission":"Riscrivi un’opinione con stile formale.","grammar":"Congiuntivo avanzado, nominalizzazione, registro.","phrases":["È opportuno sottolineare che...","In questa prospettiva...","Non si tratta soltanto di...","L’analisi evidenzia..."],"vocabulary":[{"word":"Tuttavia","translation":"No obstante","example":"Tuttavia, il punto resta valido."},{"word":"Portata","translation":"Alcance","example":"La portata è ampia."},{"word":"Sostenere","translation":"Sostener","example":"L’autore sostiene la tesi."},{"word":"Approfondire","translation":"Profundizar","example":"Occorre approfondire."},{"word":"Pertinente","translation":"Pertinente","example":"È un esempio pertinente."},{"word":"Sfumatura","translation":"Matiz","example":"La sfumatura è importante."}],"dialogue":[{"speaker":"Tutor","line":"È opportuno sottolineare che...","translation":"Frase modelo"},{"speaker":"Student","line":"In questa prospettiva...","translation":"Respuesta guiada"}],"reading":{"text":"La padronanza di una lingua richiede la capacità di interpretare impliciti, modulare il registro e costruire pensiero sfumato.","questions":["Che cosa richiede la padronanza?","Che cosa bisogna modulare?","Che tipo di pensiero?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Tuttavia\"?","options":["No obstante","Alcance","Sostener","Profundizar"],"answer":0},{"type":"writing","prompt":"Riscrivi un’opinione con stile formale.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: È opportuno sottolineare che...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-c1-reading',
  'italian',
  'C1',
  'reading',
  'Italiano C1 · Reading Quest',
  'Espressione avanzata: Puedo expresarme con precisión, estilo y matices.',
  1350,
  false,
  true,
  15,
  20,
  array['italian', 'c1', 'reading'],
  array['Tuttavia', 'Portata', 'Sostenere', 'Approfondire'],
  '{"language":"Italiano","language_key":"italian","level_title":"Espressione avanzata","intro":"Puedo expresarme con precisión, estilo y matices.","mission":"Riscrivi un’opinione con stile formale.","grammar":"Congiuntivo avanzado, nominalizzazione, registro.","phrases":["È opportuno sottolineare che...","In questa prospettiva...","Non si tratta soltanto di...","L’analisi evidenzia..."],"vocabulary":[{"word":"Tuttavia","translation":"No obstante","example":"Tuttavia, il punto resta valido."},{"word":"Portata","translation":"Alcance","example":"La portata è ampia."},{"word":"Sostenere","translation":"Sostener","example":"L’autore sostiene la tesi."},{"word":"Approfondire","translation":"Profundizar","example":"Occorre approfondire."},{"word":"Pertinente","translation":"Pertinente","example":"È un esempio pertinente."},{"word":"Sfumatura","translation":"Matiz","example":"La sfumatura è importante."}],"dialogue":[{"speaker":"Tutor","line":"È opportuno sottolineare che...","translation":"Frase modelo"},{"speaker":"Student","line":"In questa prospettiva...","translation":"Respuesta guiada"}],"reading":{"text":"La padronanza di una lingua richiede la capacità di interpretare impliciti, modulare il registro e costruire pensiero sfumato.","questions":["Che cosa richiede la padronanza?","Che cosa bisogna modulare?","Che tipo di pensiero?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Tuttavia\"?","options":["No obstante","Alcance","Sostener","Profundizar"],"answer":0},{"type":"writing","prompt":"Riscrivi un’opinione con stile formale.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: È opportuno sottolineare che...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-c1-writing',
  'italian',
  'C1',
  'writing',
  'Italiano C1 · Writing Challenge',
  'Espressione avanzata: Puedo expresarme con precisión, estilo y matices.',
  1360,
  false,
  true,
  15,
  20,
  array['italian', 'c1', 'writing'],
  array['Tuttavia', 'Portata', 'Sostenere', 'Approfondire'],
  '{"language":"Italiano","language_key":"italian","level_title":"Espressione avanzata","intro":"Puedo expresarme con precisión, estilo y matices.","mission":"Riscrivi un’opinione con stile formale.","grammar":"Congiuntivo avanzado, nominalizzazione, registro.","phrases":["È opportuno sottolineare che...","In questa prospettiva...","Non si tratta soltanto di...","L’analisi evidenzia..."],"vocabulary":[{"word":"Tuttavia","translation":"No obstante","example":"Tuttavia, il punto resta valido."},{"word":"Portata","translation":"Alcance","example":"La portata è ampia."},{"word":"Sostenere","translation":"Sostener","example":"L’autore sostiene la tesi."},{"word":"Approfondire","translation":"Profundizar","example":"Occorre approfondire."},{"word":"Pertinente","translation":"Pertinente","example":"È un esempio pertinente."},{"word":"Sfumatura","translation":"Matiz","example":"La sfumatura è importante."}],"dialogue":[{"speaker":"Tutor","line":"È opportuno sottolineare che...","translation":"Frase modelo"},{"speaker":"Student","line":"In questa prospettiva...","translation":"Respuesta guiada"}],"reading":{"text":"La padronanza di una lingua richiede la capacità di interpretare impliciti, modulare il registro e costruire pensiero sfumato.","questions":["Che cosa richiede la padronanza?","Che cosa bisogna modulare?","Che tipo di pensiero?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Tuttavia\"?","options":["No obstante","Alcance","Sostener","Profundizar"],"answer":0},{"type":"writing","prompt":"Riscrivi un’opinione con stile formale.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: È opportuno sottolineare che...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-c1-grammar',
  'italian',
  'C1',
  'grammar',
  'Italiano C1 · Grammar Focus',
  'Espressione avanzata: Puedo expresarme con precisión, estilo y matices.',
  1370,
  false,
  true,
  15,
  20,
  array['italian', 'c1', 'grammar'],
  array['Tuttavia', 'Portata', 'Sostenere', 'Approfondire'],
  '{"language":"Italiano","language_key":"italian","level_title":"Espressione avanzata","intro":"Puedo expresarme con precisión, estilo y matices.","mission":"Riscrivi un’opinione con stile formale.","grammar":"Congiuntivo avanzado, nominalizzazione, registro.","phrases":["È opportuno sottolineare che...","In questa prospettiva...","Non si tratta soltanto di...","L’analisi evidenzia..."],"vocabulary":[{"word":"Tuttavia","translation":"No obstante","example":"Tuttavia, il punto resta valido."},{"word":"Portata","translation":"Alcance","example":"La portata è ampia."},{"word":"Sostenere","translation":"Sostener","example":"L’autore sostiene la tesi."},{"word":"Approfondire","translation":"Profundizar","example":"Occorre approfondire."},{"word":"Pertinente","translation":"Pertinente","example":"È un esempio pertinente."},{"word":"Sfumatura","translation":"Matiz","example":"La sfumatura è importante."}],"dialogue":[{"speaker":"Tutor","line":"È opportuno sottolineare che...","translation":"Frase modelo"},{"speaker":"Student","line":"In questa prospettiva...","translation":"Respuesta guiada"}],"reading":{"text":"La padronanza di una lingua richiede la capacità di interpretare impliciti, modulare il registro e costruire pensiero sfumato.","questions":["Che cosa richiede la padronanza?","Che cosa bisogna modulare?","Che tipo di pensiero?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Tuttavia\"?","options":["No obstante","Alcance","Sostener","Profundizar"],"answer":0},{"type":"writing","prompt":"Riscrivi un’opinione con stile formale.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: È opportuno sottolineare che...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-c1-vocabulary',
  'italian',
  'C1',
  'vocabulary',
  'Italiano C1 · Vocabulary Boost',
  'Espressione avanzata: Puedo expresarme con precisión, estilo y matices.',
  1380,
  false,
  true,
  15,
  10,
  array['italian', 'c1', 'vocabulary'],
  array['Tuttavia', 'Portata', 'Sostenere', 'Approfondire'],
  '{"language":"Italiano","language_key":"italian","level_title":"Espressione avanzata","intro":"Puedo expresarme con precisión, estilo y matices.","mission":"Riscrivi un’opinione con stile formale.","grammar":"Congiuntivo avanzado, nominalizzazione, registro.","phrases":["È opportuno sottolineare che...","In questa prospettiva...","Non si tratta soltanto di...","L’analisi evidenzia..."],"vocabulary":[{"word":"Tuttavia","translation":"No obstante","example":"Tuttavia, il punto resta valido."},{"word":"Portata","translation":"Alcance","example":"La portata è ampia."},{"word":"Sostenere","translation":"Sostener","example":"L’autore sostiene la tesi."},{"word":"Approfondire","translation":"Profundizar","example":"Occorre approfondire."},{"word":"Pertinente","translation":"Pertinente","example":"È un esempio pertinente."},{"word":"Sfumatura","translation":"Matiz","example":"La sfumatura è importante."}],"dialogue":[{"speaker":"Tutor","line":"È opportuno sottolineare che...","translation":"Frase modelo"},{"speaker":"Student","line":"In questa prospettiva...","translation":"Respuesta guiada"}],"reading":{"text":"La padronanza di una lingua richiede la capacità di interpretare impliciti, modulare il registro e costruire pensiero sfumato.","questions":["Che cosa richiede la padronanza?","Che cosa bisogna modulare?","Che tipo di pensiero?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Tuttavia\"?","options":["No obstante","Alcance","Sostener","Profundizar"],"answer":0},{"type":"writing","prompt":"Riscrivi un’opinione con stile formale.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: È opportuno sottolineare che...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-c2-listening',
  'italian',
  'C2',
  'listening',
  'Italiano C2 · Listening Lab',
  'Padronanza completa: Puedo comunicarme con naturalidad, elegancia y precisión total.',
  1390,
  false,
  true,
  15,
  20,
  array['italian', 'c2', 'listening'],
  array['Eloquente', 'Sottile', 'Compiuto', 'Chiarire'],
  '{"language":"Italiano","language_key":"italian","level_title":"Padronanza completa","intro":"Puedo comunicarme con naturalidad, elegancia y precisión total.","mission":"Scrivi una riflessione persuasiva e raffinata.","grammar":"Retorica, ironia, coesione, registro esperto.","phrases":["La questione merita attenzione...","A ben vedere...","Ciò che colpisce è...","Occorre precisare che..."],"vocabulary":[{"word":"Eloquente","translation":"Elocuente","example":"Il discorso è eloquente."},{"word":"Sottile","translation":"Sutil","example":"È una differenza sottile."},{"word":"Compiuto","translation":"Logrado","example":"Il testo è compiuto."},{"word":"Chiarire","translation":"Aclarar","example":"Questo chiarisce il punto."},{"word":"Cogliere","translation":"Captar","example":"Bisogna cogliere la sfumatura."},{"word":"Raffinato","translation":"Refinado","example":"Lo stile è raffinato."}],"dialogue":[{"speaker":"Tutor","line":"La questione merita attenzione...","translation":"Frase modelo"},{"speaker":"Student","line":"A ben vedere...","translation":"Respuesta guiada"}],"reading":{"text":"Un’espressione pienamente matura combina rigore, eleganza, efficacia e sensibilità al contesto comunicativo.","questions":["Che cosa combina?","A che cosa è sensibile?","Quale parola significa refinado?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Eloquente\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Scrivi una riflessione persuasiva e raffinata.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: La questione merita attenzione...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-c2-speaking',
  'italian',
  'C2',
  'speaking',
  'Italiano C2 · Speaking Mission',
  'Padronanza completa: Puedo comunicarme con naturalidad, elegancia y precisión total.',
  1400,
  false,
  true,
  15,
  20,
  array['italian', 'c2', 'speaking'],
  array['Eloquente', 'Sottile', 'Compiuto', 'Chiarire'],
  '{"language":"Italiano","language_key":"italian","level_title":"Padronanza completa","intro":"Puedo comunicarme con naturalidad, elegancia y precisión total.","mission":"Scrivi una riflessione persuasiva e raffinata.","grammar":"Retorica, ironia, coesione, registro esperto.","phrases":["La questione merita attenzione...","A ben vedere...","Ciò che colpisce è...","Occorre precisare che..."],"vocabulary":[{"word":"Eloquente","translation":"Elocuente","example":"Il discorso è eloquente."},{"word":"Sottile","translation":"Sutil","example":"È una differenza sottile."},{"word":"Compiuto","translation":"Logrado","example":"Il testo è compiuto."},{"word":"Chiarire","translation":"Aclarar","example":"Questo chiarisce il punto."},{"word":"Cogliere","translation":"Captar","example":"Bisogna cogliere la sfumatura."},{"word":"Raffinato","translation":"Refinado","example":"Lo stile è raffinato."}],"dialogue":[{"speaker":"Tutor","line":"La questione merita attenzione...","translation":"Frase modelo"},{"speaker":"Student","line":"A ben vedere...","translation":"Respuesta guiada"}],"reading":{"text":"Un’espressione pienamente matura combina rigore, eleganza, efficacia e sensibilità al contesto comunicativo.","questions":["Che cosa combina?","A che cosa è sensibile?","Quale parola significa refinado?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Eloquente\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Scrivi una riflessione persuasiva e raffinata.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: La questione merita attenzione...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-c2-reading',
  'italian',
  'C2',
  'reading',
  'Italiano C2 · Reading Quest',
  'Padronanza completa: Puedo comunicarme con naturalidad, elegancia y precisión total.',
  1410,
  false,
  true,
  15,
  20,
  array['italian', 'c2', 'reading'],
  array['Eloquente', 'Sottile', 'Compiuto', 'Chiarire'],
  '{"language":"Italiano","language_key":"italian","level_title":"Padronanza completa","intro":"Puedo comunicarme con naturalidad, elegancia y precisión total.","mission":"Scrivi una riflessione persuasiva e raffinata.","grammar":"Retorica, ironia, coesione, registro esperto.","phrases":["La questione merita attenzione...","A ben vedere...","Ciò che colpisce è...","Occorre precisare che..."],"vocabulary":[{"word":"Eloquente","translation":"Elocuente","example":"Il discorso è eloquente."},{"word":"Sottile","translation":"Sutil","example":"È una differenza sottile."},{"word":"Compiuto","translation":"Logrado","example":"Il testo è compiuto."},{"word":"Chiarire","translation":"Aclarar","example":"Questo chiarisce il punto."},{"word":"Cogliere","translation":"Captar","example":"Bisogna cogliere la sfumatura."},{"word":"Raffinato","translation":"Refinado","example":"Lo stile è raffinato."}],"dialogue":[{"speaker":"Tutor","line":"La questione merita attenzione...","translation":"Frase modelo"},{"speaker":"Student","line":"A ben vedere...","translation":"Respuesta guiada"}],"reading":{"text":"Un’espressione pienamente matura combina rigore, eleganza, efficacia e sensibilità al contesto comunicativo.","questions":["Che cosa combina?","A che cosa è sensibile?","Quale parola significa refinado?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Eloquente\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Scrivi una riflessione persuasiva e raffinata.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: La questione merita attenzione...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-c2-writing',
  'italian',
  'C2',
  'writing',
  'Italiano C2 · Writing Challenge',
  'Padronanza completa: Puedo comunicarme con naturalidad, elegancia y precisión total.',
  1420,
  false,
  true,
  15,
  20,
  array['italian', 'c2', 'writing'],
  array['Eloquente', 'Sottile', 'Compiuto', 'Chiarire'],
  '{"language":"Italiano","language_key":"italian","level_title":"Padronanza completa","intro":"Puedo comunicarme con naturalidad, elegancia y precisión total.","mission":"Scrivi una riflessione persuasiva e raffinata.","grammar":"Retorica, ironia, coesione, registro esperto.","phrases":["La questione merita attenzione...","A ben vedere...","Ciò che colpisce è...","Occorre precisare che..."],"vocabulary":[{"word":"Eloquente","translation":"Elocuente","example":"Il discorso è eloquente."},{"word":"Sottile","translation":"Sutil","example":"È una differenza sottile."},{"word":"Compiuto","translation":"Logrado","example":"Il testo è compiuto."},{"word":"Chiarire","translation":"Aclarar","example":"Questo chiarisce il punto."},{"word":"Cogliere","translation":"Captar","example":"Bisogna cogliere la sfumatura."},{"word":"Raffinato","translation":"Refinado","example":"Lo stile è raffinato."}],"dialogue":[{"speaker":"Tutor","line":"La questione merita attenzione...","translation":"Frase modelo"},{"speaker":"Student","line":"A ben vedere...","translation":"Respuesta guiada"}],"reading":{"text":"Un’espressione pienamente matura combina rigore, eleganza, efficacia e sensibilità al contesto comunicativo.","questions":["Che cosa combina?","A che cosa è sensibile?","Quale parola significa refinado?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Eloquente\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Scrivi una riflessione persuasiva e raffinata.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: La questione merita attenzione...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-c2-grammar',
  'italian',
  'C2',
  'grammar',
  'Italiano C2 · Grammar Focus',
  'Padronanza completa: Puedo comunicarme con naturalidad, elegancia y precisión total.',
  1430,
  false,
  true,
  15,
  20,
  array['italian', 'c2', 'grammar'],
  array['Eloquente', 'Sottile', 'Compiuto', 'Chiarire'],
  '{"language":"Italiano","language_key":"italian","level_title":"Padronanza completa","intro":"Puedo comunicarme con naturalidad, elegancia y precisión total.","mission":"Scrivi una riflessione persuasiva e raffinata.","grammar":"Retorica, ironia, coesione, registro esperto.","phrases":["La questione merita attenzione...","A ben vedere...","Ciò che colpisce è...","Occorre precisare che..."],"vocabulary":[{"word":"Eloquente","translation":"Elocuente","example":"Il discorso è eloquente."},{"word":"Sottile","translation":"Sutil","example":"È una differenza sottile."},{"word":"Compiuto","translation":"Logrado","example":"Il testo è compiuto."},{"word":"Chiarire","translation":"Aclarar","example":"Questo chiarisce il punto."},{"word":"Cogliere","translation":"Captar","example":"Bisogna cogliere la sfumatura."},{"word":"Raffinato","translation":"Refinado","example":"Lo stile è raffinato."}],"dialogue":[{"speaker":"Tutor","line":"La questione merita attenzione...","translation":"Frase modelo"},{"speaker":"Student","line":"A ben vedere...","translation":"Respuesta guiada"}],"reading":{"text":"Un’espressione pienamente matura combina rigore, eleganza, efficacia e sensibilità al contesto comunicativo.","questions":["Che cosa combina?","A che cosa è sensibile?","Quale parola significa refinado?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Eloquente\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Scrivi una riflessione persuasiva e raffinata.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: La questione merita attenzione...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'italian-c2-vocabulary',
  'italian',
  'C2',
  'vocabulary',
  'Italiano C2 · Vocabulary Boost',
  'Padronanza completa: Puedo comunicarme con naturalidad, elegancia y precisión total.',
  1440,
  false,
  true,
  15,
  10,
  array['italian', 'c2', 'vocabulary'],
  array['Eloquente', 'Sottile', 'Compiuto', 'Chiarire'],
  '{"language":"Italiano","language_key":"italian","level_title":"Padronanza completa","intro":"Puedo comunicarme con naturalidad, elegancia y precisión total.","mission":"Scrivi una riflessione persuasiva e raffinata.","grammar":"Retorica, ironia, coesione, registro esperto.","phrases":["La questione merita attenzione...","A ben vedere...","Ciò che colpisce è...","Occorre precisare che..."],"vocabulary":[{"word":"Eloquente","translation":"Elocuente","example":"Il discorso è eloquente."},{"word":"Sottile","translation":"Sutil","example":"È una differenza sottile."},{"word":"Compiuto","translation":"Logrado","example":"Il testo è compiuto."},{"word":"Chiarire","translation":"Aclarar","example":"Questo chiarisce il punto."},{"word":"Cogliere","translation":"Captar","example":"Bisogna cogliere la sfumatura."},{"word":"Raffinato","translation":"Refinado","example":"Lo stile è raffinato."}],"dialogue":[{"speaker":"Tutor","line":"La questione merita attenzione...","translation":"Frase modelo"},{"speaker":"Student","line":"A ben vedere...","translation":"Respuesta guiada"}],"reading":{"text":"Un’espressione pienamente matura combina rigore, eleganza, efficacia e sensibilità al contesto comunicativo.","questions":["Che cosa combina?","A che cosa è sensibile?","Quale parola significa refinado?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Eloquente\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Scrivi una riflessione persuasiva e raffinata.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: La questione merita attenzione...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-a1-listening',
  'german',
  'A1',
  'listening',
  'Deutsch A1 · Listening Lab',
  'Deutsch Start: Puedo saludar, decir mi nombre y usar frases básicas.',
  1450,
  true,
  true,
  10,
  20,
  array['german', 'a1', 'listening'],
  array['Hallo', 'Danke', 'Freund', 'Haus'],
  '{"language":"Deutsch","language_key":"german","level_title":"Deutsch Start","intro":"Puedo saludar, decir mi nombre y usar frases básicas.","mission":"Stell dich in vier einfachen Sätzen vor.","grammar":"Sein, haben, artículos, presente, orden básico.","phrases":["Ich heiße...","Ich komme aus...","Freut mich.","Ich verstehe nicht."],"vocabulary":[{"word":"Hallo","translation":"Hola","example":"Hallo, ich heiße Anna."},{"word":"Danke","translation":"Gracias","example":"Danke schön."},{"word":"Freund","translation":"Amigo","example":"Er ist mein Freund."},{"word":"Haus","translation":"Casa","example":"Das Haus ist groß."},{"word":"Schule","translation":"Escuela","example":"Ich gehe zur Schule."},{"word":"Familie","translation":"Familia","example":"Meine Familie ist hier."}],"dialogue":[{"speaker":"Tutor","line":"Ich heiße...","translation":"Frase modelo"},{"speaker":"Student","line":"Ich komme aus...","translation":"Respuesta guiada"}],"reading":{"text":"Lena wohnt in Berlin. Sie lernt Deutsch am Morgen und spricht mit ihrem Freund Max.","questions":["Wo wohnt Lena?","Wann lernt sie?","Mit wem spricht sie?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hallo\"?","options":["Hola","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Stell dich in vier einfachen Sätzen vor.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ich heiße...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-a1-speaking',
  'german',
  'A1',
  'speaking',
  'Deutsch A1 · Speaking Mission',
  'Deutsch Start: Puedo saludar, decir mi nombre y usar frases básicas.',
  1460,
  true,
  true,
  10,
  20,
  array['german', 'a1', 'speaking'],
  array['Hallo', 'Danke', 'Freund', 'Haus'],
  '{"language":"Deutsch","language_key":"german","level_title":"Deutsch Start","intro":"Puedo saludar, decir mi nombre y usar frases básicas.","mission":"Stell dich in vier einfachen Sätzen vor.","grammar":"Sein, haben, artículos, presente, orden básico.","phrases":["Ich heiße...","Ich komme aus...","Freut mich.","Ich verstehe nicht."],"vocabulary":[{"word":"Hallo","translation":"Hola","example":"Hallo, ich heiße Anna."},{"word":"Danke","translation":"Gracias","example":"Danke schön."},{"word":"Freund","translation":"Amigo","example":"Er ist mein Freund."},{"word":"Haus","translation":"Casa","example":"Das Haus ist groß."},{"word":"Schule","translation":"Escuela","example":"Ich gehe zur Schule."},{"word":"Familie","translation":"Familia","example":"Meine Familie ist hier."}],"dialogue":[{"speaker":"Tutor","line":"Ich heiße...","translation":"Frase modelo"},{"speaker":"Student","line":"Ich komme aus...","translation":"Respuesta guiada"}],"reading":{"text":"Lena wohnt in Berlin. Sie lernt Deutsch am Morgen und spricht mit ihrem Freund Max.","questions":["Wo wohnt Lena?","Wann lernt sie?","Mit wem spricht sie?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hallo\"?","options":["Hola","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Stell dich in vier einfachen Sätzen vor.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ich heiße...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-a1-reading',
  'german',
  'A1',
  'reading',
  'Deutsch A1 · Reading Quest',
  'Deutsch Start: Puedo saludar, decir mi nombre y usar frases básicas.',
  1470,
  true,
  true,
  10,
  20,
  array['german', 'a1', 'reading'],
  array['Hallo', 'Danke', 'Freund', 'Haus'],
  '{"language":"Deutsch","language_key":"german","level_title":"Deutsch Start","intro":"Puedo saludar, decir mi nombre y usar frases básicas.","mission":"Stell dich in vier einfachen Sätzen vor.","grammar":"Sein, haben, artículos, presente, orden básico.","phrases":["Ich heiße...","Ich komme aus...","Freut mich.","Ich verstehe nicht."],"vocabulary":[{"word":"Hallo","translation":"Hola","example":"Hallo, ich heiße Anna."},{"word":"Danke","translation":"Gracias","example":"Danke schön."},{"word":"Freund","translation":"Amigo","example":"Er ist mein Freund."},{"word":"Haus","translation":"Casa","example":"Das Haus ist groß."},{"word":"Schule","translation":"Escuela","example":"Ich gehe zur Schule."},{"word":"Familie","translation":"Familia","example":"Meine Familie ist hier."}],"dialogue":[{"speaker":"Tutor","line":"Ich heiße...","translation":"Frase modelo"},{"speaker":"Student","line":"Ich komme aus...","translation":"Respuesta guiada"}],"reading":{"text":"Lena wohnt in Berlin. Sie lernt Deutsch am Morgen und spricht mit ihrem Freund Max.","questions":["Wo wohnt Lena?","Wann lernt sie?","Mit wem spricht sie?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hallo\"?","options":["Hola","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Stell dich in vier einfachen Sätzen vor.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ich heiße...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-a1-writing',
  'german',
  'A1',
  'writing',
  'Deutsch A1 · Writing Challenge',
  'Deutsch Start: Puedo saludar, decir mi nombre y usar frases básicas.',
  1480,
  true,
  true,
  10,
  20,
  array['german', 'a1', 'writing'],
  array['Hallo', 'Danke', 'Freund', 'Haus'],
  '{"language":"Deutsch","language_key":"german","level_title":"Deutsch Start","intro":"Puedo saludar, decir mi nombre y usar frases básicas.","mission":"Stell dich in vier einfachen Sätzen vor.","grammar":"Sein, haben, artículos, presente, orden básico.","phrases":["Ich heiße...","Ich komme aus...","Freut mich.","Ich verstehe nicht."],"vocabulary":[{"word":"Hallo","translation":"Hola","example":"Hallo, ich heiße Anna."},{"word":"Danke","translation":"Gracias","example":"Danke schön."},{"word":"Freund","translation":"Amigo","example":"Er ist mein Freund."},{"word":"Haus","translation":"Casa","example":"Das Haus ist groß."},{"word":"Schule","translation":"Escuela","example":"Ich gehe zur Schule."},{"word":"Familie","translation":"Familia","example":"Meine Familie ist hier."}],"dialogue":[{"speaker":"Tutor","line":"Ich heiße...","translation":"Frase modelo"},{"speaker":"Student","line":"Ich komme aus...","translation":"Respuesta guiada"}],"reading":{"text":"Lena wohnt in Berlin. Sie lernt Deutsch am Morgen und spricht mit ihrem Freund Max.","questions":["Wo wohnt Lena?","Wann lernt sie?","Mit wem spricht sie?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hallo\"?","options":["Hola","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Stell dich in vier einfachen Sätzen vor.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ich heiße...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-a1-grammar',
  'german',
  'A1',
  'grammar',
  'Deutsch A1 · Grammar Focus',
  'Deutsch Start: Puedo saludar, decir mi nombre y usar frases básicas.',
  1490,
  true,
  true,
  10,
  20,
  array['german', 'a1', 'grammar'],
  array['Hallo', 'Danke', 'Freund', 'Haus'],
  '{"language":"Deutsch","language_key":"german","level_title":"Deutsch Start","intro":"Puedo saludar, decir mi nombre y usar frases básicas.","mission":"Stell dich in vier einfachen Sätzen vor.","grammar":"Sein, haben, artículos, presente, orden básico.","phrases":["Ich heiße...","Ich komme aus...","Freut mich.","Ich verstehe nicht."],"vocabulary":[{"word":"Hallo","translation":"Hola","example":"Hallo, ich heiße Anna."},{"word":"Danke","translation":"Gracias","example":"Danke schön."},{"word":"Freund","translation":"Amigo","example":"Er ist mein Freund."},{"word":"Haus","translation":"Casa","example":"Das Haus ist groß."},{"word":"Schule","translation":"Escuela","example":"Ich gehe zur Schule."},{"word":"Familie","translation":"Familia","example":"Meine Familie ist hier."}],"dialogue":[{"speaker":"Tutor","line":"Ich heiße...","translation":"Frase modelo"},{"speaker":"Student","line":"Ich komme aus...","translation":"Respuesta guiada"}],"reading":{"text":"Lena wohnt in Berlin. Sie lernt Deutsch am Morgen und spricht mit ihrem Freund Max.","questions":["Wo wohnt Lena?","Wann lernt sie?","Mit wem spricht sie?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hallo\"?","options":["Hola","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Stell dich in vier einfachen Sätzen vor.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ich heiße...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-a1-vocabulary',
  'german',
  'A1',
  'vocabulary',
  'Deutsch A1 · Vocabulary Boost',
  'Deutsch Start: Puedo saludar, decir mi nombre y usar frases básicas.',
  1500,
  true,
  true,
  10,
  10,
  array['german', 'a1', 'vocabulary'],
  array['Hallo', 'Danke', 'Freund', 'Haus'],
  '{"language":"Deutsch","language_key":"german","level_title":"Deutsch Start","intro":"Puedo saludar, decir mi nombre y usar frases básicas.","mission":"Stell dich in vier einfachen Sätzen vor.","grammar":"Sein, haben, artículos, presente, orden básico.","phrases":["Ich heiße...","Ich komme aus...","Freut mich.","Ich verstehe nicht."],"vocabulary":[{"word":"Hallo","translation":"Hola","example":"Hallo, ich heiße Anna."},{"word":"Danke","translation":"Gracias","example":"Danke schön."},{"word":"Freund","translation":"Amigo","example":"Er ist mein Freund."},{"word":"Haus","translation":"Casa","example":"Das Haus ist groß."},{"word":"Schule","translation":"Escuela","example":"Ich gehe zur Schule."},{"word":"Familie","translation":"Familia","example":"Meine Familie ist hier."}],"dialogue":[{"speaker":"Tutor","line":"Ich heiße...","translation":"Frase modelo"},{"speaker":"Student","line":"Ich komme aus...","translation":"Respuesta guiada"}],"reading":{"text":"Lena wohnt in Berlin. Sie lernt Deutsch am Morgen und spricht mit ihrem Freund Max.","questions":["Wo wohnt Lena?","Wann lernt sie?","Mit wem spricht sie?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Hallo\"?","options":["Hola","Gracias","Amigo","Casa"],"answer":0},{"type":"writing","prompt":"Stell dich in vier einfachen Sätzen vor.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ich heiße...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-a2-listening',
  'german',
  'A2',
  'listening',
  'Deutsch A2 · Listening Lab',
  'Alltag Deutsch: Puedo hablar de rutinas, compras, horarios y gustos.',
  1510,
  true,
  true,
  10,
  20,
  array['german', 'a2', 'listening'],
  array['Heute', 'Geschäft', 'Frühstück', 'Reise'],
  '{"language":"Deutsch","language_key":"german","level_title":"Alltag Deutsch","intro":"Puedo hablar de rutinas, compras, horarios y gustos.","mission":"Beschreibe deinen Tag mit fünf Aktionen.","grammar":"Perfekt, trennbare Verben, Modalverben, Dativ básico.","phrases":["Ich möchte...","Jeden Tag...","Gestern bin ich...","Ich muss..."],"vocabulary":[{"word":"Heute","translation":"Hoy","example":"Heute arbeite ich."},{"word":"Geschäft","translation":"Tienda","example":"Ich gehe ins Geschäft."},{"word":"Frühstück","translation":"Desayuno","example":"Ich esse Frühstück."},{"word":"Reise","translation":"Viaje","example":"Die Reise ist kurz."},{"word":"Wetter","translation":"Clima","example":"Das Wetter ist schön."},{"word":"Nach","translation":"Después","example":"Nach dem Unterricht lese ich."}],"dialogue":[{"speaker":"Tutor","line":"Ich möchte...","translation":"Frase modelo"},{"speaker":"Student","line":"Jeden Tag...","translation":"Respuesta guiada"}],"reading":{"text":"Tobias arbeitet am Morgen. Nach der Arbeit kauft er Brot und trinkt einen Kaffee.","questions":["Wann arbeitet Tobias?","Was kauft er?","Was trinkt er?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Heute\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Beschreibe deinen Tag mit fünf Aktionen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ich möchte...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-a2-speaking',
  'german',
  'A2',
  'speaking',
  'Deutsch A2 · Speaking Mission',
  'Alltag Deutsch: Puedo hablar de rutinas, compras, horarios y gustos.',
  1520,
  true,
  true,
  10,
  20,
  array['german', 'a2', 'speaking'],
  array['Heute', 'Geschäft', 'Frühstück', 'Reise'],
  '{"language":"Deutsch","language_key":"german","level_title":"Alltag Deutsch","intro":"Puedo hablar de rutinas, compras, horarios y gustos.","mission":"Beschreibe deinen Tag mit fünf Aktionen.","grammar":"Perfekt, trennbare Verben, Modalverben, Dativ básico.","phrases":["Ich möchte...","Jeden Tag...","Gestern bin ich...","Ich muss..."],"vocabulary":[{"word":"Heute","translation":"Hoy","example":"Heute arbeite ich."},{"word":"Geschäft","translation":"Tienda","example":"Ich gehe ins Geschäft."},{"word":"Frühstück","translation":"Desayuno","example":"Ich esse Frühstück."},{"word":"Reise","translation":"Viaje","example":"Die Reise ist kurz."},{"word":"Wetter","translation":"Clima","example":"Das Wetter ist schön."},{"word":"Nach","translation":"Después","example":"Nach dem Unterricht lese ich."}],"dialogue":[{"speaker":"Tutor","line":"Ich möchte...","translation":"Frase modelo"},{"speaker":"Student","line":"Jeden Tag...","translation":"Respuesta guiada"}],"reading":{"text":"Tobias arbeitet am Morgen. Nach der Arbeit kauft er Brot und trinkt einen Kaffee.","questions":["Wann arbeitet Tobias?","Was kauft er?","Was trinkt er?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Heute\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Beschreibe deinen Tag mit fünf Aktionen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ich möchte...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-a2-reading',
  'german',
  'A2',
  'reading',
  'Deutsch A2 · Reading Quest',
  'Alltag Deutsch: Puedo hablar de rutinas, compras, horarios y gustos.',
  1530,
  true,
  true,
  10,
  20,
  array['german', 'a2', 'reading'],
  array['Heute', 'Geschäft', 'Frühstück', 'Reise'],
  '{"language":"Deutsch","language_key":"german","level_title":"Alltag Deutsch","intro":"Puedo hablar de rutinas, compras, horarios y gustos.","mission":"Beschreibe deinen Tag mit fünf Aktionen.","grammar":"Perfekt, trennbare Verben, Modalverben, Dativ básico.","phrases":["Ich möchte...","Jeden Tag...","Gestern bin ich...","Ich muss..."],"vocabulary":[{"word":"Heute","translation":"Hoy","example":"Heute arbeite ich."},{"word":"Geschäft","translation":"Tienda","example":"Ich gehe ins Geschäft."},{"word":"Frühstück","translation":"Desayuno","example":"Ich esse Frühstück."},{"word":"Reise","translation":"Viaje","example":"Die Reise ist kurz."},{"word":"Wetter","translation":"Clima","example":"Das Wetter ist schön."},{"word":"Nach","translation":"Después","example":"Nach dem Unterricht lese ich."}],"dialogue":[{"speaker":"Tutor","line":"Ich möchte...","translation":"Frase modelo"},{"speaker":"Student","line":"Jeden Tag...","translation":"Respuesta guiada"}],"reading":{"text":"Tobias arbeitet am Morgen. Nach der Arbeit kauft er Brot und trinkt einen Kaffee.","questions":["Wann arbeitet Tobias?","Was kauft er?","Was trinkt er?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Heute\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Beschreibe deinen Tag mit fünf Aktionen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ich möchte...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-a2-writing',
  'german',
  'A2',
  'writing',
  'Deutsch A2 · Writing Challenge',
  'Alltag Deutsch: Puedo hablar de rutinas, compras, horarios y gustos.',
  1540,
  true,
  true,
  10,
  20,
  array['german', 'a2', 'writing'],
  array['Heute', 'Geschäft', 'Frühstück', 'Reise'],
  '{"language":"Deutsch","language_key":"german","level_title":"Alltag Deutsch","intro":"Puedo hablar de rutinas, compras, horarios y gustos.","mission":"Beschreibe deinen Tag mit fünf Aktionen.","grammar":"Perfekt, trennbare Verben, Modalverben, Dativ básico.","phrases":["Ich möchte...","Jeden Tag...","Gestern bin ich...","Ich muss..."],"vocabulary":[{"word":"Heute","translation":"Hoy","example":"Heute arbeite ich."},{"word":"Geschäft","translation":"Tienda","example":"Ich gehe ins Geschäft."},{"word":"Frühstück","translation":"Desayuno","example":"Ich esse Frühstück."},{"word":"Reise","translation":"Viaje","example":"Die Reise ist kurz."},{"word":"Wetter","translation":"Clima","example":"Das Wetter ist schön."},{"word":"Nach","translation":"Después","example":"Nach dem Unterricht lese ich."}],"dialogue":[{"speaker":"Tutor","line":"Ich möchte...","translation":"Frase modelo"},{"speaker":"Student","line":"Jeden Tag...","translation":"Respuesta guiada"}],"reading":{"text":"Tobias arbeitet am Morgen. Nach der Arbeit kauft er Brot und trinkt einen Kaffee.","questions":["Wann arbeitet Tobias?","Was kauft er?","Was trinkt er?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Heute\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Beschreibe deinen Tag mit fünf Aktionen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ich möchte...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-a2-grammar',
  'german',
  'A2',
  'grammar',
  'Deutsch A2 · Grammar Focus',
  'Alltag Deutsch: Puedo hablar de rutinas, compras, horarios y gustos.',
  1550,
  true,
  true,
  10,
  20,
  array['german', 'a2', 'grammar'],
  array['Heute', 'Geschäft', 'Frühstück', 'Reise'],
  '{"language":"Deutsch","language_key":"german","level_title":"Alltag Deutsch","intro":"Puedo hablar de rutinas, compras, horarios y gustos.","mission":"Beschreibe deinen Tag mit fünf Aktionen.","grammar":"Perfekt, trennbare Verben, Modalverben, Dativ básico.","phrases":["Ich möchte...","Jeden Tag...","Gestern bin ich...","Ich muss..."],"vocabulary":[{"word":"Heute","translation":"Hoy","example":"Heute arbeite ich."},{"word":"Geschäft","translation":"Tienda","example":"Ich gehe ins Geschäft."},{"word":"Frühstück","translation":"Desayuno","example":"Ich esse Frühstück."},{"word":"Reise","translation":"Viaje","example":"Die Reise ist kurz."},{"word":"Wetter","translation":"Clima","example":"Das Wetter ist schön."},{"word":"Nach","translation":"Después","example":"Nach dem Unterricht lese ich."}],"dialogue":[{"speaker":"Tutor","line":"Ich möchte...","translation":"Frase modelo"},{"speaker":"Student","line":"Jeden Tag...","translation":"Respuesta guiada"}],"reading":{"text":"Tobias arbeitet am Morgen. Nach der Arbeit kauft er Brot und trinkt einen Kaffee.","questions":["Wann arbeitet Tobias?","Was kauft er?","Was trinkt er?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Heute\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Beschreibe deinen Tag mit fünf Aktionen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ich möchte...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-a2-vocabulary',
  'german',
  'A2',
  'vocabulary',
  'Deutsch A2 · Vocabulary Boost',
  'Alltag Deutsch: Puedo hablar de rutinas, compras, horarios y gustos.',
  1560,
  true,
  true,
  10,
  10,
  array['german', 'a2', 'vocabulary'],
  array['Heute', 'Geschäft', 'Frühstück', 'Reise'],
  '{"language":"Deutsch","language_key":"german","level_title":"Alltag Deutsch","intro":"Puedo hablar de rutinas, compras, horarios y gustos.","mission":"Beschreibe deinen Tag mit fünf Aktionen.","grammar":"Perfekt, trennbare Verben, Modalverben, Dativ básico.","phrases":["Ich möchte...","Jeden Tag...","Gestern bin ich...","Ich muss..."],"vocabulary":[{"word":"Heute","translation":"Hoy","example":"Heute arbeite ich."},{"word":"Geschäft","translation":"Tienda","example":"Ich gehe ins Geschäft."},{"word":"Frühstück","translation":"Desayuno","example":"Ich esse Frühstück."},{"word":"Reise","translation":"Viaje","example":"Die Reise ist kurz."},{"word":"Wetter","translation":"Clima","example":"Das Wetter ist schön."},{"word":"Nach","translation":"Después","example":"Nach dem Unterricht lese ich."}],"dialogue":[{"speaker":"Tutor","line":"Ich möchte...","translation":"Frase modelo"},{"speaker":"Student","line":"Jeden Tag...","translation":"Respuesta guiada"}],"reading":{"text":"Tobias arbeitet am Morgen. Nach der Arbeit kauft er Brot und trinkt einen Kaffee.","questions":["Wann arbeitet Tobias?","Was kauft er?","Was trinkt er?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Heute\"?","options":["Hoy","Tienda","Desayuno","Viaje"],"answer":0},{"type":"writing","prompt":"Beschreibe deinen Tag mit fünf Aktionen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ich möchte...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-b1-listening',
  'german',
  'B1',
  'listening',
  'Deutsch B1 · Listening Lab',
  'Sicher sprechen: Puedo narrar experiencias, opinar y explicar razones.',
  1570,
  false,
  true,
  15,
  20,
  array['german', 'b1', 'listening'],
  array['Meinung', 'Grund', 'Erfahrung', 'Verbessern'],
  '{"language":"Deutsch","language_key":"german","level_title":"Sicher sprechen","intro":"Puedo narrar experiencias, opinar y explicar razones.","mission":"Gib deine Meinung zum Sprachenlernen.","grammar":"Präteritum, Nebensätze, weil/dass/wenn, Konjunktiv II.","phrases":["Meiner Meinung nach...","Ich denke, dass...","Weil...","Ich würde gern..."],"vocabulary":[{"word":"Meinung","translation":"Opinión","example":"Meiner Meinung nach ist es nützlich."},{"word":"Grund","translation":"Razón","example":"Der Grund ist klar."},{"word":"Erfahrung","translation":"Experiencia","example":"Das war eine gute Erfahrung."},{"word":"Verbessern","translation":"Mejorar","example":"Ich möchte mein Deutsch verbessern."},{"word":"Wählen","translation":"Elegir","example":"Ich muss wählen."},{"word":"Schaffen","translation":"Lograr","example":"Du kannst es schaffen."}],"dialogue":[{"speaker":"Tutor","line":"Meiner Meinung nach...","translation":"Frase modelo"},{"speaker":"Student","line":"Ich denke, dass...","translation":"Respuesta guiada"}],"reading":{"text":"Amira lernt seit sechs Monaten Deutsch. Sie versteht Gespräche besser und spricht mutiger im Unterricht.","questions":["Seit wann lernt Amira?","Was versteht sie besser?","Wo spricht sie mutiger?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Meinung\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Gib deine Meinung zum Sprachenlernen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Meiner Meinung nach...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-b1-speaking',
  'german',
  'B1',
  'speaking',
  'Deutsch B1 · Speaking Mission',
  'Sicher sprechen: Puedo narrar experiencias, opinar y explicar razones.',
  1580,
  false,
  true,
  15,
  20,
  array['german', 'b1', 'speaking'],
  array['Meinung', 'Grund', 'Erfahrung', 'Verbessern'],
  '{"language":"Deutsch","language_key":"german","level_title":"Sicher sprechen","intro":"Puedo narrar experiencias, opinar y explicar razones.","mission":"Gib deine Meinung zum Sprachenlernen.","grammar":"Präteritum, Nebensätze, weil/dass/wenn, Konjunktiv II.","phrases":["Meiner Meinung nach...","Ich denke, dass...","Weil...","Ich würde gern..."],"vocabulary":[{"word":"Meinung","translation":"Opinión","example":"Meiner Meinung nach ist es nützlich."},{"word":"Grund","translation":"Razón","example":"Der Grund ist klar."},{"word":"Erfahrung","translation":"Experiencia","example":"Das war eine gute Erfahrung."},{"word":"Verbessern","translation":"Mejorar","example":"Ich möchte mein Deutsch verbessern."},{"word":"Wählen","translation":"Elegir","example":"Ich muss wählen."},{"word":"Schaffen","translation":"Lograr","example":"Du kannst es schaffen."}],"dialogue":[{"speaker":"Tutor","line":"Meiner Meinung nach...","translation":"Frase modelo"},{"speaker":"Student","line":"Ich denke, dass...","translation":"Respuesta guiada"}],"reading":{"text":"Amira lernt seit sechs Monaten Deutsch. Sie versteht Gespräche besser und spricht mutiger im Unterricht.","questions":["Seit wann lernt Amira?","Was versteht sie besser?","Wo spricht sie mutiger?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Meinung\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Gib deine Meinung zum Sprachenlernen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Meiner Meinung nach...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-b1-reading',
  'german',
  'B1',
  'reading',
  'Deutsch B1 · Reading Quest',
  'Sicher sprechen: Puedo narrar experiencias, opinar y explicar razones.',
  1590,
  false,
  true,
  15,
  20,
  array['german', 'b1', 'reading'],
  array['Meinung', 'Grund', 'Erfahrung', 'Verbessern'],
  '{"language":"Deutsch","language_key":"german","level_title":"Sicher sprechen","intro":"Puedo narrar experiencias, opinar y explicar razones.","mission":"Gib deine Meinung zum Sprachenlernen.","grammar":"Präteritum, Nebensätze, weil/dass/wenn, Konjunktiv II.","phrases":["Meiner Meinung nach...","Ich denke, dass...","Weil...","Ich würde gern..."],"vocabulary":[{"word":"Meinung","translation":"Opinión","example":"Meiner Meinung nach ist es nützlich."},{"word":"Grund","translation":"Razón","example":"Der Grund ist klar."},{"word":"Erfahrung","translation":"Experiencia","example":"Das war eine gute Erfahrung."},{"word":"Verbessern","translation":"Mejorar","example":"Ich möchte mein Deutsch verbessern."},{"word":"Wählen","translation":"Elegir","example":"Ich muss wählen."},{"word":"Schaffen","translation":"Lograr","example":"Du kannst es schaffen."}],"dialogue":[{"speaker":"Tutor","line":"Meiner Meinung nach...","translation":"Frase modelo"},{"speaker":"Student","line":"Ich denke, dass...","translation":"Respuesta guiada"}],"reading":{"text":"Amira lernt seit sechs Monaten Deutsch. Sie versteht Gespräche besser und spricht mutiger im Unterricht.","questions":["Seit wann lernt Amira?","Was versteht sie besser?","Wo spricht sie mutiger?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Meinung\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Gib deine Meinung zum Sprachenlernen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Meiner Meinung nach...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-b1-writing',
  'german',
  'B1',
  'writing',
  'Deutsch B1 · Writing Challenge',
  'Sicher sprechen: Puedo narrar experiencias, opinar y explicar razones.',
  1600,
  false,
  true,
  15,
  20,
  array['german', 'b1', 'writing'],
  array['Meinung', 'Grund', 'Erfahrung', 'Verbessern'],
  '{"language":"Deutsch","language_key":"german","level_title":"Sicher sprechen","intro":"Puedo narrar experiencias, opinar y explicar razones.","mission":"Gib deine Meinung zum Sprachenlernen.","grammar":"Präteritum, Nebensätze, weil/dass/wenn, Konjunktiv II.","phrases":["Meiner Meinung nach...","Ich denke, dass...","Weil...","Ich würde gern..."],"vocabulary":[{"word":"Meinung","translation":"Opinión","example":"Meiner Meinung nach ist es nützlich."},{"word":"Grund","translation":"Razón","example":"Der Grund ist klar."},{"word":"Erfahrung","translation":"Experiencia","example":"Das war eine gute Erfahrung."},{"word":"Verbessern","translation":"Mejorar","example":"Ich möchte mein Deutsch verbessern."},{"word":"Wählen","translation":"Elegir","example":"Ich muss wählen."},{"word":"Schaffen","translation":"Lograr","example":"Du kannst es schaffen."}],"dialogue":[{"speaker":"Tutor","line":"Meiner Meinung nach...","translation":"Frase modelo"},{"speaker":"Student","line":"Ich denke, dass...","translation":"Respuesta guiada"}],"reading":{"text":"Amira lernt seit sechs Monaten Deutsch. Sie versteht Gespräche besser und spricht mutiger im Unterricht.","questions":["Seit wann lernt Amira?","Was versteht sie besser?","Wo spricht sie mutiger?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Meinung\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Gib deine Meinung zum Sprachenlernen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Meiner Meinung nach...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-b1-grammar',
  'german',
  'B1',
  'grammar',
  'Deutsch B1 · Grammar Focus',
  'Sicher sprechen: Puedo narrar experiencias, opinar y explicar razones.',
  1610,
  false,
  true,
  15,
  20,
  array['german', 'b1', 'grammar'],
  array['Meinung', 'Grund', 'Erfahrung', 'Verbessern'],
  '{"language":"Deutsch","language_key":"german","level_title":"Sicher sprechen","intro":"Puedo narrar experiencias, opinar y explicar razones.","mission":"Gib deine Meinung zum Sprachenlernen.","grammar":"Präteritum, Nebensätze, weil/dass/wenn, Konjunktiv II.","phrases":["Meiner Meinung nach...","Ich denke, dass...","Weil...","Ich würde gern..."],"vocabulary":[{"word":"Meinung","translation":"Opinión","example":"Meiner Meinung nach ist es nützlich."},{"word":"Grund","translation":"Razón","example":"Der Grund ist klar."},{"word":"Erfahrung","translation":"Experiencia","example":"Das war eine gute Erfahrung."},{"word":"Verbessern","translation":"Mejorar","example":"Ich möchte mein Deutsch verbessern."},{"word":"Wählen","translation":"Elegir","example":"Ich muss wählen."},{"word":"Schaffen","translation":"Lograr","example":"Du kannst es schaffen."}],"dialogue":[{"speaker":"Tutor","line":"Meiner Meinung nach...","translation":"Frase modelo"},{"speaker":"Student","line":"Ich denke, dass...","translation":"Respuesta guiada"}],"reading":{"text":"Amira lernt seit sechs Monaten Deutsch. Sie versteht Gespräche besser und spricht mutiger im Unterricht.","questions":["Seit wann lernt Amira?","Was versteht sie besser?","Wo spricht sie mutiger?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Meinung\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Gib deine Meinung zum Sprachenlernen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Meiner Meinung nach...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-b1-vocabulary',
  'german',
  'B1',
  'vocabulary',
  'Deutsch B1 · Vocabulary Boost',
  'Sicher sprechen: Puedo narrar experiencias, opinar y explicar razones.',
  1620,
  false,
  true,
  15,
  10,
  array['german', 'b1', 'vocabulary'],
  array['Meinung', 'Grund', 'Erfahrung', 'Verbessern'],
  '{"language":"Deutsch","language_key":"german","level_title":"Sicher sprechen","intro":"Puedo narrar experiencias, opinar y explicar razones.","mission":"Gib deine Meinung zum Sprachenlernen.","grammar":"Präteritum, Nebensätze, weil/dass/wenn, Konjunktiv II.","phrases":["Meiner Meinung nach...","Ich denke, dass...","Weil...","Ich würde gern..."],"vocabulary":[{"word":"Meinung","translation":"Opinión","example":"Meiner Meinung nach ist es nützlich."},{"word":"Grund","translation":"Razón","example":"Der Grund ist klar."},{"word":"Erfahrung","translation":"Experiencia","example":"Das war eine gute Erfahrung."},{"word":"Verbessern","translation":"Mejorar","example":"Ich möchte mein Deutsch verbessern."},{"word":"Wählen","translation":"Elegir","example":"Ich muss wählen."},{"word":"Schaffen","translation":"Lograr","example":"Du kannst es schaffen."}],"dialogue":[{"speaker":"Tutor","line":"Meiner Meinung nach...","translation":"Frase modelo"},{"speaker":"Student","line":"Ich denke, dass...","translation":"Respuesta guiada"}],"reading":{"text":"Amira lernt seit sechs Monaten Deutsch. Sie versteht Gespräche besser und spricht mutiger im Unterricht.","questions":["Seit wann lernt Amira?","Was versteht sie besser?","Wo spricht sie mutiger?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Meinung\"?","options":["Opinión","Razón","Experiencia","Mejorar"],"answer":0},{"type":"writing","prompt":"Gib deine Meinung zum Sprachenlernen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Meiner Meinung nach...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-b2-listening',
  'german',
  'B2',
  'listening',
  'Deutsch B2 · Listening Lab',
  'Argumentieren: Puedo defender opiniones y comprender textos detallados.',
  1630,
  false,
  true,
  15,
  20,
  array['german', 'b2', 'listening'],
  array['Jedoch', 'Beweis', 'Entwickeln', 'Auswirkung'],
  '{"language":"Deutsch","language_key":"german","level_title":"Argumentieren","intro":"Puedo defender opiniones y comprender textos detallados.","mission":"Schreibe ein kurzes Argument über Online-Lernen.","grammar":"Passiv, Relativsätze, Konjunktiv, indirekte Rede.","phrases":["Einerseits...","Andererseits...","Es ist notwendig, dass...","Das zeigt, dass..."],"vocabulary":[{"word":"Jedoch","translation":"Sin embargo","example":"Jedoch gibt es Grenzen."},{"word":"Beweis","translation":"Evidencia","example":"Der Beweis ist klar."},{"word":"Entwickeln","translation":"Desarrollar","example":"Man muss Fähigkeiten entwickeln."},{"word":"Auswirkung","translation":"Impacto","example":"Die Auswirkung ist stark."},{"word":"Zuverlässig","translation":"Confiable","example":"Die Quelle ist zuverlässig."},{"word":"Ansatz","translation":"Enfoque","example":"Der Ansatz ist hilfreich."}],"dialogue":[{"speaker":"Tutor","line":"Einerseits...","translation":"Frase modelo"},{"speaker":"Student","line":"Andererseits...","translation":"Respuesta guiada"}],"reading":{"text":"Digitale Bildung erleichtert den Zugang zu Wissen, verlangt aber Selbstständigkeit, Disziplin und digitale Kompetenzen.","questions":["Was erleichtert digitale Bildung?","Was verlangt sie?","Was ist das Thema?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Jedoch\"?","options":["Sin embargo","Evidencia","Desarrollar","Impacto"],"answer":0},{"type":"writing","prompt":"Schreibe ein kurzes Argument über Online-Lernen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Einerseits...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-b2-speaking',
  'german',
  'B2',
  'speaking',
  'Deutsch B2 · Speaking Mission',
  'Argumentieren: Puedo defender opiniones y comprender textos detallados.',
  1640,
  false,
  true,
  15,
  20,
  array['german', 'b2', 'speaking'],
  array['Jedoch', 'Beweis', 'Entwickeln', 'Auswirkung'],
  '{"language":"Deutsch","language_key":"german","level_title":"Argumentieren","intro":"Puedo defender opiniones y comprender textos detallados.","mission":"Schreibe ein kurzes Argument über Online-Lernen.","grammar":"Passiv, Relativsätze, Konjunktiv, indirekte Rede.","phrases":["Einerseits...","Andererseits...","Es ist notwendig, dass...","Das zeigt, dass..."],"vocabulary":[{"word":"Jedoch","translation":"Sin embargo","example":"Jedoch gibt es Grenzen."},{"word":"Beweis","translation":"Evidencia","example":"Der Beweis ist klar."},{"word":"Entwickeln","translation":"Desarrollar","example":"Man muss Fähigkeiten entwickeln."},{"word":"Auswirkung","translation":"Impacto","example":"Die Auswirkung ist stark."},{"word":"Zuverlässig","translation":"Confiable","example":"Die Quelle ist zuverlässig."},{"word":"Ansatz","translation":"Enfoque","example":"Der Ansatz ist hilfreich."}],"dialogue":[{"speaker":"Tutor","line":"Einerseits...","translation":"Frase modelo"},{"speaker":"Student","line":"Andererseits...","translation":"Respuesta guiada"}],"reading":{"text":"Digitale Bildung erleichtert den Zugang zu Wissen, verlangt aber Selbstständigkeit, Disziplin und digitale Kompetenzen.","questions":["Was erleichtert digitale Bildung?","Was verlangt sie?","Was ist das Thema?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Jedoch\"?","options":["Sin embargo","Evidencia","Desarrollar","Impacto"],"answer":0},{"type":"writing","prompt":"Schreibe ein kurzes Argument über Online-Lernen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Einerseits...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-b2-reading',
  'german',
  'B2',
  'reading',
  'Deutsch B2 · Reading Quest',
  'Argumentieren: Puedo defender opiniones y comprender textos detallados.',
  1650,
  false,
  true,
  15,
  20,
  array['german', 'b2', 'reading'],
  array['Jedoch', 'Beweis', 'Entwickeln', 'Auswirkung'],
  '{"language":"Deutsch","language_key":"german","level_title":"Argumentieren","intro":"Puedo defender opiniones y comprender textos detallados.","mission":"Schreibe ein kurzes Argument über Online-Lernen.","grammar":"Passiv, Relativsätze, Konjunktiv, indirekte Rede.","phrases":["Einerseits...","Andererseits...","Es ist notwendig, dass...","Das zeigt, dass..."],"vocabulary":[{"word":"Jedoch","translation":"Sin embargo","example":"Jedoch gibt es Grenzen."},{"word":"Beweis","translation":"Evidencia","example":"Der Beweis ist klar."},{"word":"Entwickeln","translation":"Desarrollar","example":"Man muss Fähigkeiten entwickeln."},{"word":"Auswirkung","translation":"Impacto","example":"Die Auswirkung ist stark."},{"word":"Zuverlässig","translation":"Confiable","example":"Die Quelle ist zuverlässig."},{"word":"Ansatz","translation":"Enfoque","example":"Der Ansatz ist hilfreich."}],"dialogue":[{"speaker":"Tutor","line":"Einerseits...","translation":"Frase modelo"},{"speaker":"Student","line":"Andererseits...","translation":"Respuesta guiada"}],"reading":{"text":"Digitale Bildung erleichtert den Zugang zu Wissen, verlangt aber Selbstständigkeit, Disziplin und digitale Kompetenzen.","questions":["Was erleichtert digitale Bildung?","Was verlangt sie?","Was ist das Thema?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Jedoch\"?","options":["Sin embargo","Evidencia","Desarrollar","Impacto"],"answer":0},{"type":"writing","prompt":"Schreibe ein kurzes Argument über Online-Lernen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Einerseits...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-b2-writing',
  'german',
  'B2',
  'writing',
  'Deutsch B2 · Writing Challenge',
  'Argumentieren: Puedo defender opiniones y comprender textos detallados.',
  1660,
  false,
  true,
  15,
  20,
  array['german', 'b2', 'writing'],
  array['Jedoch', 'Beweis', 'Entwickeln', 'Auswirkung'],
  '{"language":"Deutsch","language_key":"german","level_title":"Argumentieren","intro":"Puedo defender opiniones y comprender textos detallados.","mission":"Schreibe ein kurzes Argument über Online-Lernen.","grammar":"Passiv, Relativsätze, Konjunktiv, indirekte Rede.","phrases":["Einerseits...","Andererseits...","Es ist notwendig, dass...","Das zeigt, dass..."],"vocabulary":[{"word":"Jedoch","translation":"Sin embargo","example":"Jedoch gibt es Grenzen."},{"word":"Beweis","translation":"Evidencia","example":"Der Beweis ist klar."},{"word":"Entwickeln","translation":"Desarrollar","example":"Man muss Fähigkeiten entwickeln."},{"word":"Auswirkung","translation":"Impacto","example":"Die Auswirkung ist stark."},{"word":"Zuverlässig","translation":"Confiable","example":"Die Quelle ist zuverlässig."},{"word":"Ansatz","translation":"Enfoque","example":"Der Ansatz ist hilfreich."}],"dialogue":[{"speaker":"Tutor","line":"Einerseits...","translation":"Frase modelo"},{"speaker":"Student","line":"Andererseits...","translation":"Respuesta guiada"}],"reading":{"text":"Digitale Bildung erleichtert den Zugang zu Wissen, verlangt aber Selbstständigkeit, Disziplin und digitale Kompetenzen.","questions":["Was erleichtert digitale Bildung?","Was verlangt sie?","Was ist das Thema?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Jedoch\"?","options":["Sin embargo","Evidencia","Desarrollar","Impacto"],"answer":0},{"type":"writing","prompt":"Schreibe ein kurzes Argument über Online-Lernen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Einerseits...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-b2-grammar',
  'german',
  'B2',
  'grammar',
  'Deutsch B2 · Grammar Focus',
  'Argumentieren: Puedo defender opiniones y comprender textos detallados.',
  1670,
  false,
  true,
  15,
  20,
  array['german', 'b2', 'grammar'],
  array['Jedoch', 'Beweis', 'Entwickeln', 'Auswirkung'],
  '{"language":"Deutsch","language_key":"german","level_title":"Argumentieren","intro":"Puedo defender opiniones y comprender textos detallados.","mission":"Schreibe ein kurzes Argument über Online-Lernen.","grammar":"Passiv, Relativsätze, Konjunktiv, indirekte Rede.","phrases":["Einerseits...","Andererseits...","Es ist notwendig, dass...","Das zeigt, dass..."],"vocabulary":[{"word":"Jedoch","translation":"Sin embargo","example":"Jedoch gibt es Grenzen."},{"word":"Beweis","translation":"Evidencia","example":"Der Beweis ist klar."},{"word":"Entwickeln","translation":"Desarrollar","example":"Man muss Fähigkeiten entwickeln."},{"word":"Auswirkung","translation":"Impacto","example":"Die Auswirkung ist stark."},{"word":"Zuverlässig","translation":"Confiable","example":"Die Quelle ist zuverlässig."},{"word":"Ansatz","translation":"Enfoque","example":"Der Ansatz ist hilfreich."}],"dialogue":[{"speaker":"Tutor","line":"Einerseits...","translation":"Frase modelo"},{"speaker":"Student","line":"Andererseits...","translation":"Respuesta guiada"}],"reading":{"text":"Digitale Bildung erleichtert den Zugang zu Wissen, verlangt aber Selbstständigkeit, Disziplin und digitale Kompetenzen.","questions":["Was erleichtert digitale Bildung?","Was verlangt sie?","Was ist das Thema?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Jedoch\"?","options":["Sin embargo","Evidencia","Desarrollar","Impacto"],"answer":0},{"type":"writing","prompt":"Schreibe ein kurzes Argument über Online-Lernen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Einerseits...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-b2-vocabulary',
  'german',
  'B2',
  'vocabulary',
  'Deutsch B2 · Vocabulary Boost',
  'Argumentieren: Puedo defender opiniones y comprender textos detallados.',
  1680,
  false,
  true,
  15,
  10,
  array['german', 'b2', 'vocabulary'],
  array['Jedoch', 'Beweis', 'Entwickeln', 'Auswirkung'],
  '{"language":"Deutsch","language_key":"german","level_title":"Argumentieren","intro":"Puedo defender opiniones y comprender textos detallados.","mission":"Schreibe ein kurzes Argument über Online-Lernen.","grammar":"Passiv, Relativsätze, Konjunktiv, indirekte Rede.","phrases":["Einerseits...","Andererseits...","Es ist notwendig, dass...","Das zeigt, dass..."],"vocabulary":[{"word":"Jedoch","translation":"Sin embargo","example":"Jedoch gibt es Grenzen."},{"word":"Beweis","translation":"Evidencia","example":"Der Beweis ist klar."},{"word":"Entwickeln","translation":"Desarrollar","example":"Man muss Fähigkeiten entwickeln."},{"word":"Auswirkung","translation":"Impacto","example":"Die Auswirkung ist stark."},{"word":"Zuverlässig","translation":"Confiable","example":"Die Quelle ist zuverlässig."},{"word":"Ansatz","translation":"Enfoque","example":"Der Ansatz ist hilfreich."}],"dialogue":[{"speaker":"Tutor","line":"Einerseits...","translation":"Frase modelo"},{"speaker":"Student","line":"Andererseits...","translation":"Respuesta guiada"}],"reading":{"text":"Digitale Bildung erleichtert den Zugang zu Wissen, verlangt aber Selbstständigkeit, Disziplin und digitale Kompetenzen.","questions":["Was erleichtert digitale Bildung?","Was verlangt sie?","Was ist das Thema?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Jedoch\"?","options":["Sin embargo","Evidencia","Desarrollar","Impacto"],"answer":0},{"type":"writing","prompt":"Schreibe ein kurzes Argument über Online-Lernen.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Einerseits...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-c1-listening',
  'german',
  'C1',
  'listening',
  'Deutsch C1 · Listening Lab',
  'Fortgeschrittene Präzision: Puedo expresarme con precisión, registro y matices.',
  1690,
  false,
  true,
  15,
  20,
  array['german', 'c1', 'listening'],
  array['Dennoch', 'Tragweite', 'Vertreten', 'Vertiefen'],
  '{"language":"Deutsch","language_key":"german","level_title":"Fortgeschrittene Präzision","intro":"Puedo expresarme con precisión, registro y matices.","mission":"Formuliere eine Meinung in gehobenem Stil um.","grammar":"Nominalisierung, komplexe Satzstellung, Stil, Partizipialkonstruktionen.","phrases":["Es ist hervorzuheben, dass...","Aus dieser Perspektive...","Es geht nicht nur darum...","Die Analyse verdeutlicht..."],"vocabulary":[{"word":"Dennoch","translation":"No obstante","example":"Dennoch bleibt der Punkt gültig."},{"word":"Tragweite","translation":"Alcance","example":"Die Tragweite ist groß."},{"word":"Vertreten","translation":"Sostener","example":"Der Autor vertritt diese These."},{"word":"Vertiefen","translation":"Profundizar","example":"Wir müssen das Thema vertiefen."},{"word":"Zutreffend","translation":"Pertinente","example":"Das Beispiel ist zutreffend."},{"word":"Nuance","translation":"Matiz","example":"Die Nuance ist wichtig."}],"dialogue":[{"speaker":"Tutor","line":"Es ist hervorzuheben, dass...","translation":"Frase modelo"},{"speaker":"Student","line":"Aus dieser Perspektive...","translation":"Respuesta guiada"}],"reading":{"text":"Sprachbeherrschung verlangt die Fähigkeit, implizite Bedeutungen zu erkennen, Register anzupassen und differenziert zu denken.","questions":["Was verlangt Sprachbeherrschung?","Was muss man anpassen?","Wie soll man denken?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Dennoch\"?","options":["No obstante","Alcance","Sostener","Profundizar"],"answer":0},{"type":"writing","prompt":"Formuliere eine Meinung in gehobenem Stil um.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Es ist hervorzuheben, dass...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-c1-speaking',
  'german',
  'C1',
  'speaking',
  'Deutsch C1 · Speaking Mission',
  'Fortgeschrittene Präzision: Puedo expresarme con precisión, registro y matices.',
  1700,
  false,
  true,
  15,
  20,
  array['german', 'c1', 'speaking'],
  array['Dennoch', 'Tragweite', 'Vertreten', 'Vertiefen'],
  '{"language":"Deutsch","language_key":"german","level_title":"Fortgeschrittene Präzision","intro":"Puedo expresarme con precisión, registro y matices.","mission":"Formuliere eine Meinung in gehobenem Stil um.","grammar":"Nominalisierung, komplexe Satzstellung, Stil, Partizipialkonstruktionen.","phrases":["Es ist hervorzuheben, dass...","Aus dieser Perspektive...","Es geht nicht nur darum...","Die Analyse verdeutlicht..."],"vocabulary":[{"word":"Dennoch","translation":"No obstante","example":"Dennoch bleibt der Punkt gültig."},{"word":"Tragweite","translation":"Alcance","example":"Die Tragweite ist groß."},{"word":"Vertreten","translation":"Sostener","example":"Der Autor vertritt diese These."},{"word":"Vertiefen","translation":"Profundizar","example":"Wir müssen das Thema vertiefen."},{"word":"Zutreffend","translation":"Pertinente","example":"Das Beispiel ist zutreffend."},{"word":"Nuance","translation":"Matiz","example":"Die Nuance ist wichtig."}],"dialogue":[{"speaker":"Tutor","line":"Es ist hervorzuheben, dass...","translation":"Frase modelo"},{"speaker":"Student","line":"Aus dieser Perspektive...","translation":"Respuesta guiada"}],"reading":{"text":"Sprachbeherrschung verlangt die Fähigkeit, implizite Bedeutungen zu erkennen, Register anzupassen und differenziert zu denken.","questions":["Was verlangt Sprachbeherrschung?","Was muss man anpassen?","Wie soll man denken?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Dennoch\"?","options":["No obstante","Alcance","Sostener","Profundizar"],"answer":0},{"type":"writing","prompt":"Formuliere eine Meinung in gehobenem Stil um.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Es ist hervorzuheben, dass...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-c1-reading',
  'german',
  'C1',
  'reading',
  'Deutsch C1 · Reading Quest',
  'Fortgeschrittene Präzision: Puedo expresarme con precisión, registro y matices.',
  1710,
  false,
  true,
  15,
  20,
  array['german', 'c1', 'reading'],
  array['Dennoch', 'Tragweite', 'Vertreten', 'Vertiefen'],
  '{"language":"Deutsch","language_key":"german","level_title":"Fortgeschrittene Präzision","intro":"Puedo expresarme con precisión, registro y matices.","mission":"Formuliere eine Meinung in gehobenem Stil um.","grammar":"Nominalisierung, komplexe Satzstellung, Stil, Partizipialkonstruktionen.","phrases":["Es ist hervorzuheben, dass...","Aus dieser Perspektive...","Es geht nicht nur darum...","Die Analyse verdeutlicht..."],"vocabulary":[{"word":"Dennoch","translation":"No obstante","example":"Dennoch bleibt der Punkt gültig."},{"word":"Tragweite","translation":"Alcance","example":"Die Tragweite ist groß."},{"word":"Vertreten","translation":"Sostener","example":"Der Autor vertritt diese These."},{"word":"Vertiefen","translation":"Profundizar","example":"Wir müssen das Thema vertiefen."},{"word":"Zutreffend","translation":"Pertinente","example":"Das Beispiel ist zutreffend."},{"word":"Nuance","translation":"Matiz","example":"Die Nuance ist wichtig."}],"dialogue":[{"speaker":"Tutor","line":"Es ist hervorzuheben, dass...","translation":"Frase modelo"},{"speaker":"Student","line":"Aus dieser Perspektive...","translation":"Respuesta guiada"}],"reading":{"text":"Sprachbeherrschung verlangt die Fähigkeit, implizite Bedeutungen zu erkennen, Register anzupassen und differenziert zu denken.","questions":["Was verlangt Sprachbeherrschung?","Was muss man anpassen?","Wie soll man denken?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Dennoch\"?","options":["No obstante","Alcance","Sostener","Profundizar"],"answer":0},{"type":"writing","prompt":"Formuliere eine Meinung in gehobenem Stil um.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Es ist hervorzuheben, dass...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-c1-writing',
  'german',
  'C1',
  'writing',
  'Deutsch C1 · Writing Challenge',
  'Fortgeschrittene Präzision: Puedo expresarme con precisión, registro y matices.',
  1720,
  false,
  true,
  15,
  20,
  array['german', 'c1', 'writing'],
  array['Dennoch', 'Tragweite', 'Vertreten', 'Vertiefen'],
  '{"language":"Deutsch","language_key":"german","level_title":"Fortgeschrittene Präzision","intro":"Puedo expresarme con precisión, registro y matices.","mission":"Formuliere eine Meinung in gehobenem Stil um.","grammar":"Nominalisierung, komplexe Satzstellung, Stil, Partizipialkonstruktionen.","phrases":["Es ist hervorzuheben, dass...","Aus dieser Perspektive...","Es geht nicht nur darum...","Die Analyse verdeutlicht..."],"vocabulary":[{"word":"Dennoch","translation":"No obstante","example":"Dennoch bleibt der Punkt gültig."},{"word":"Tragweite","translation":"Alcance","example":"Die Tragweite ist groß."},{"word":"Vertreten","translation":"Sostener","example":"Der Autor vertritt diese These."},{"word":"Vertiefen","translation":"Profundizar","example":"Wir müssen das Thema vertiefen."},{"word":"Zutreffend","translation":"Pertinente","example":"Das Beispiel ist zutreffend."},{"word":"Nuance","translation":"Matiz","example":"Die Nuance ist wichtig."}],"dialogue":[{"speaker":"Tutor","line":"Es ist hervorzuheben, dass...","translation":"Frase modelo"},{"speaker":"Student","line":"Aus dieser Perspektive...","translation":"Respuesta guiada"}],"reading":{"text":"Sprachbeherrschung verlangt die Fähigkeit, implizite Bedeutungen zu erkennen, Register anzupassen und differenziert zu denken.","questions":["Was verlangt Sprachbeherrschung?","Was muss man anpassen?","Wie soll man denken?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Dennoch\"?","options":["No obstante","Alcance","Sostener","Profundizar"],"answer":0},{"type":"writing","prompt":"Formuliere eine Meinung in gehobenem Stil um.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Es ist hervorzuheben, dass...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-c1-grammar',
  'german',
  'C1',
  'grammar',
  'Deutsch C1 · Grammar Focus',
  'Fortgeschrittene Präzision: Puedo expresarme con precisión, registro y matices.',
  1730,
  false,
  true,
  15,
  20,
  array['german', 'c1', 'grammar'],
  array['Dennoch', 'Tragweite', 'Vertreten', 'Vertiefen'],
  '{"language":"Deutsch","language_key":"german","level_title":"Fortgeschrittene Präzision","intro":"Puedo expresarme con precisión, registro y matices.","mission":"Formuliere eine Meinung in gehobenem Stil um.","grammar":"Nominalisierung, komplexe Satzstellung, Stil, Partizipialkonstruktionen.","phrases":["Es ist hervorzuheben, dass...","Aus dieser Perspektive...","Es geht nicht nur darum...","Die Analyse verdeutlicht..."],"vocabulary":[{"word":"Dennoch","translation":"No obstante","example":"Dennoch bleibt der Punkt gültig."},{"word":"Tragweite","translation":"Alcance","example":"Die Tragweite ist groß."},{"word":"Vertreten","translation":"Sostener","example":"Der Autor vertritt diese These."},{"word":"Vertiefen","translation":"Profundizar","example":"Wir müssen das Thema vertiefen."},{"word":"Zutreffend","translation":"Pertinente","example":"Das Beispiel ist zutreffend."},{"word":"Nuance","translation":"Matiz","example":"Die Nuance ist wichtig."}],"dialogue":[{"speaker":"Tutor","line":"Es ist hervorzuheben, dass...","translation":"Frase modelo"},{"speaker":"Student","line":"Aus dieser Perspektive...","translation":"Respuesta guiada"}],"reading":{"text":"Sprachbeherrschung verlangt die Fähigkeit, implizite Bedeutungen zu erkennen, Register anzupassen und differenziert zu denken.","questions":["Was verlangt Sprachbeherrschung?","Was muss man anpassen?","Wie soll man denken?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Dennoch\"?","options":["No obstante","Alcance","Sostener","Profundizar"],"answer":0},{"type":"writing","prompt":"Formuliere eine Meinung in gehobenem Stil um.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Es ist hervorzuheben, dass...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-c1-vocabulary',
  'german',
  'C1',
  'vocabulary',
  'Deutsch C1 · Vocabulary Boost',
  'Fortgeschrittene Präzision: Puedo expresarme con precisión, registro y matices.',
  1740,
  false,
  true,
  15,
  10,
  array['german', 'c1', 'vocabulary'],
  array['Dennoch', 'Tragweite', 'Vertreten', 'Vertiefen'],
  '{"language":"Deutsch","language_key":"german","level_title":"Fortgeschrittene Präzision","intro":"Puedo expresarme con precisión, registro y matices.","mission":"Formuliere eine Meinung in gehobenem Stil um.","grammar":"Nominalisierung, komplexe Satzstellung, Stil, Partizipialkonstruktionen.","phrases":["Es ist hervorzuheben, dass...","Aus dieser Perspektive...","Es geht nicht nur darum...","Die Analyse verdeutlicht..."],"vocabulary":[{"word":"Dennoch","translation":"No obstante","example":"Dennoch bleibt der Punkt gültig."},{"word":"Tragweite","translation":"Alcance","example":"Die Tragweite ist groß."},{"word":"Vertreten","translation":"Sostener","example":"Der Autor vertritt diese These."},{"word":"Vertiefen","translation":"Profundizar","example":"Wir müssen das Thema vertiefen."},{"word":"Zutreffend","translation":"Pertinente","example":"Das Beispiel ist zutreffend."},{"word":"Nuance","translation":"Matiz","example":"Die Nuance ist wichtig."}],"dialogue":[{"speaker":"Tutor","line":"Es ist hervorzuheben, dass...","translation":"Frase modelo"},{"speaker":"Student","line":"Aus dieser Perspektive...","translation":"Respuesta guiada"}],"reading":{"text":"Sprachbeherrschung verlangt die Fähigkeit, implizite Bedeutungen zu erkennen, Register anzupassen und differenziert zu denken.","questions":["Was verlangt Sprachbeherrschung?","Was muss man anpassen?","Wie soll man denken?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Dennoch\"?","options":["No obstante","Alcance","Sostener","Profundizar"],"answer":0},{"type":"writing","prompt":"Formuliere eine Meinung in gehobenem Stil um.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Es ist hervorzuheben, dass...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-c2-listening',
  'german',
  'C2',
  'listening',
  'Deutsch C2 · Listening Lab',
  'Meisterschaft: Puedo comunicarme con naturalidad, exactitud y estilo experto.',
  1750,
  false,
  true,
  15,
  20,
  array['german', 'c2', 'listening'],
  array['Eloquent', 'Fein', 'Ausgereift', 'Klären'],
  '{"language":"Deutsch","language_key":"german","level_title":"Meisterschaft","intro":"Puedo comunicarme con naturalidad, exactitud y estilo experto.","mission":"Schreibe eine nuancierte und überzeugende Reflexion.","grammar":"Rhetorik, Ironie, Kohäsion, Registerwechsel.","phrases":["Die Frage verdient Aufmerksamkeit...","Bei genauer Betrachtung...","Auffällig ist...","Es bleibt zu präzisieren, dass..."],"vocabulary":[{"word":"Eloquent","translation":"Elocuente","example":"Seine Rede ist eloquent."},{"word":"Fein","translation":"Sutil","example":"Das ist ein feiner Unterschied."},{"word":"Ausgereift","translation":"Logrado","example":"Der Text ist ausgereift."},{"word":"Klären","translation":"Aclarar","example":"Das klärt den Punkt."},{"word":"Erfassen","translation":"Captar","example":"Man muss die Nuance erfassen."},{"word":"Raffiniert","translation":"Refinado","example":"Der Stil ist raffiniert."}],"dialogue":[{"speaker":"Tutor","line":"Die Frage verdient Aufmerksamkeit...","translation":"Frase modelo"},{"speaker":"Student","line":"Bei genauer Betrachtung...","translation":"Respuesta guiada"}],"reading":{"text":"Vollkommene Ausdrucksfähigkeit verbindet Genauigkeit, Eleganz, Wirksamkeit und Sensibilität für kommunikative Kontexte.","questions":["Was verbindet Ausdrucksfähigkeit?","Wofür braucht man Sensibilität?","Welches Wort bedeutet refinado?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Eloquent\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Schreibe eine nuancierte und überzeugende Reflexion.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Die Frage verdient Aufmerksamkeit...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-c2-speaking',
  'german',
  'C2',
  'speaking',
  'Deutsch C2 · Speaking Mission',
  'Meisterschaft: Puedo comunicarme con naturalidad, exactitud y estilo experto.',
  1760,
  false,
  true,
  15,
  20,
  array['german', 'c2', 'speaking'],
  array['Eloquent', 'Fein', 'Ausgereift', 'Klären'],
  '{"language":"Deutsch","language_key":"german","level_title":"Meisterschaft","intro":"Puedo comunicarme con naturalidad, exactitud y estilo experto.","mission":"Schreibe eine nuancierte und überzeugende Reflexion.","grammar":"Rhetorik, Ironie, Kohäsion, Registerwechsel.","phrases":["Die Frage verdient Aufmerksamkeit...","Bei genauer Betrachtung...","Auffällig ist...","Es bleibt zu präzisieren, dass..."],"vocabulary":[{"word":"Eloquent","translation":"Elocuente","example":"Seine Rede ist eloquent."},{"word":"Fein","translation":"Sutil","example":"Das ist ein feiner Unterschied."},{"word":"Ausgereift","translation":"Logrado","example":"Der Text ist ausgereift."},{"word":"Klären","translation":"Aclarar","example":"Das klärt den Punkt."},{"word":"Erfassen","translation":"Captar","example":"Man muss die Nuance erfassen."},{"word":"Raffiniert","translation":"Refinado","example":"Der Stil ist raffiniert."}],"dialogue":[{"speaker":"Tutor","line":"Die Frage verdient Aufmerksamkeit...","translation":"Frase modelo"},{"speaker":"Student","line":"Bei genauer Betrachtung...","translation":"Respuesta guiada"}],"reading":{"text":"Vollkommene Ausdrucksfähigkeit verbindet Genauigkeit, Eleganz, Wirksamkeit und Sensibilität für kommunikative Kontexte.","questions":["Was verbindet Ausdrucksfähigkeit?","Wofür braucht man Sensibilität?","Welches Wort bedeutet refinado?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Eloquent\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Schreibe eine nuancierte und überzeugende Reflexion.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Die Frage verdient Aufmerksamkeit...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-c2-reading',
  'german',
  'C2',
  'reading',
  'Deutsch C2 · Reading Quest',
  'Meisterschaft: Puedo comunicarme con naturalidad, exactitud y estilo experto.',
  1770,
  false,
  true,
  15,
  20,
  array['german', 'c2', 'reading'],
  array['Eloquent', 'Fein', 'Ausgereift', 'Klären'],
  '{"language":"Deutsch","language_key":"german","level_title":"Meisterschaft","intro":"Puedo comunicarme con naturalidad, exactitud y estilo experto.","mission":"Schreibe eine nuancierte und überzeugende Reflexion.","grammar":"Rhetorik, Ironie, Kohäsion, Registerwechsel.","phrases":["Die Frage verdient Aufmerksamkeit...","Bei genauer Betrachtung...","Auffällig ist...","Es bleibt zu präzisieren, dass..."],"vocabulary":[{"word":"Eloquent","translation":"Elocuente","example":"Seine Rede ist eloquent."},{"word":"Fein","translation":"Sutil","example":"Das ist ein feiner Unterschied."},{"word":"Ausgereift","translation":"Logrado","example":"Der Text ist ausgereift."},{"word":"Klären","translation":"Aclarar","example":"Das klärt den Punkt."},{"word":"Erfassen","translation":"Captar","example":"Man muss die Nuance erfassen."},{"word":"Raffiniert","translation":"Refinado","example":"Der Stil ist raffiniert."}],"dialogue":[{"speaker":"Tutor","line":"Die Frage verdient Aufmerksamkeit...","translation":"Frase modelo"},{"speaker":"Student","line":"Bei genauer Betrachtung...","translation":"Respuesta guiada"}],"reading":{"text":"Vollkommene Ausdrucksfähigkeit verbindet Genauigkeit, Eleganz, Wirksamkeit und Sensibilität für kommunikative Kontexte.","questions":["Was verbindet Ausdrucksfähigkeit?","Wofür braucht man Sensibilität?","Welches Wort bedeutet refinado?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Eloquent\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Schreibe eine nuancierte und überzeugende Reflexion.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Die Frage verdient Aufmerksamkeit...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-c2-writing',
  'german',
  'C2',
  'writing',
  'Deutsch C2 · Writing Challenge',
  'Meisterschaft: Puedo comunicarme con naturalidad, exactitud y estilo experto.',
  1780,
  false,
  true,
  15,
  20,
  array['german', 'c2', 'writing'],
  array['Eloquent', 'Fein', 'Ausgereift', 'Klären'],
  '{"language":"Deutsch","language_key":"german","level_title":"Meisterschaft","intro":"Puedo comunicarme con naturalidad, exactitud y estilo experto.","mission":"Schreibe eine nuancierte und überzeugende Reflexion.","grammar":"Rhetorik, Ironie, Kohäsion, Registerwechsel.","phrases":["Die Frage verdient Aufmerksamkeit...","Bei genauer Betrachtung...","Auffällig ist...","Es bleibt zu präzisieren, dass..."],"vocabulary":[{"word":"Eloquent","translation":"Elocuente","example":"Seine Rede ist eloquent."},{"word":"Fein","translation":"Sutil","example":"Das ist ein feiner Unterschied."},{"word":"Ausgereift","translation":"Logrado","example":"Der Text ist ausgereift."},{"word":"Klären","translation":"Aclarar","example":"Das klärt den Punkt."},{"word":"Erfassen","translation":"Captar","example":"Man muss die Nuance erfassen."},{"word":"Raffiniert","translation":"Refinado","example":"Der Stil ist raffiniert."}],"dialogue":[{"speaker":"Tutor","line":"Die Frage verdient Aufmerksamkeit...","translation":"Frase modelo"},{"speaker":"Student","line":"Bei genauer Betrachtung...","translation":"Respuesta guiada"}],"reading":{"text":"Vollkommene Ausdrucksfähigkeit verbindet Genauigkeit, Eleganz, Wirksamkeit und Sensibilität für kommunikative Kontexte.","questions":["Was verbindet Ausdrucksfähigkeit?","Wofür braucht man Sensibilität?","Welches Wort bedeutet refinado?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Eloquent\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Schreibe eine nuancierte und überzeugende Reflexion.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Die Frage verdient Aufmerksamkeit...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-c2-grammar',
  'german',
  'C2',
  'grammar',
  'Deutsch C2 · Grammar Focus',
  'Meisterschaft: Puedo comunicarme con naturalidad, exactitud y estilo experto.',
  1790,
  false,
  true,
  15,
  20,
  array['german', 'c2', 'grammar'],
  array['Eloquent', 'Fein', 'Ausgereift', 'Klären'],
  '{"language":"Deutsch","language_key":"german","level_title":"Meisterschaft","intro":"Puedo comunicarme con naturalidad, exactitud y estilo experto.","mission":"Schreibe eine nuancierte und überzeugende Reflexion.","grammar":"Rhetorik, Ironie, Kohäsion, Registerwechsel.","phrases":["Die Frage verdient Aufmerksamkeit...","Bei genauer Betrachtung...","Auffällig ist...","Es bleibt zu präzisieren, dass..."],"vocabulary":[{"word":"Eloquent","translation":"Elocuente","example":"Seine Rede ist eloquent."},{"word":"Fein","translation":"Sutil","example":"Das ist ein feiner Unterschied."},{"word":"Ausgereift","translation":"Logrado","example":"Der Text ist ausgereift."},{"word":"Klären","translation":"Aclarar","example":"Das klärt den Punkt."},{"word":"Erfassen","translation":"Captar","example":"Man muss die Nuance erfassen."},{"word":"Raffiniert","translation":"Refinado","example":"Der Stil ist raffiniert."}],"dialogue":[{"speaker":"Tutor","line":"Die Frage verdient Aufmerksamkeit...","translation":"Frase modelo"},{"speaker":"Student","line":"Bei genauer Betrachtung...","translation":"Respuesta guiada"}],"reading":{"text":"Vollkommene Ausdrucksfähigkeit verbindet Genauigkeit, Eleganz, Wirksamkeit und Sensibilität für kommunikative Kontexte.","questions":["Was verbindet Ausdrucksfähigkeit?","Wofür braucht man Sensibilität?","Welches Wort bedeutet refinado?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Eloquent\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Schreibe eine nuancierte und überzeugende Reflexion.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Die Frage verdient Aufmerksamkeit...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'german-c2-vocabulary',
  'german',
  'C2',
  'vocabulary',
  'Deutsch C2 · Vocabulary Boost',
  'Meisterschaft: Puedo comunicarme con naturalidad, exactitud y estilo experto.',
  1800,
  false,
  true,
  15,
  10,
  array['german', 'c2', 'vocabulary'],
  array['Eloquent', 'Fein', 'Ausgereift', 'Klären'],
  '{"language":"Deutsch","language_key":"german","level_title":"Meisterschaft","intro":"Puedo comunicarme con naturalidad, exactitud y estilo experto.","mission":"Schreibe eine nuancierte und überzeugende Reflexion.","grammar":"Rhetorik, Ironie, Kohäsion, Registerwechsel.","phrases":["Die Frage verdient Aufmerksamkeit...","Bei genauer Betrachtung...","Auffällig ist...","Es bleibt zu präzisieren, dass..."],"vocabulary":[{"word":"Eloquent","translation":"Elocuente","example":"Seine Rede ist eloquent."},{"word":"Fein","translation":"Sutil","example":"Das ist ein feiner Unterschied."},{"word":"Ausgereift","translation":"Logrado","example":"Der Text ist ausgereift."},{"word":"Klären","translation":"Aclarar","example":"Das klärt den Punkt."},{"word":"Erfassen","translation":"Captar","example":"Man muss die Nuance erfassen."},{"word":"Raffiniert","translation":"Refinado","example":"Der Stil ist raffiniert."}],"dialogue":[{"speaker":"Tutor","line":"Die Frage verdient Aufmerksamkeit...","translation":"Frase modelo"},{"speaker":"Student","line":"Bei genauer Betrachtung...","translation":"Respuesta guiada"}],"reading":{"text":"Vollkommene Ausdrucksfähigkeit verbindet Genauigkeit, Eleganz, Wirksamkeit und Sensibilität für kommunikative Kontexte.","questions":["Was verbindet Ausdrucksfähigkeit?","Wofür braucht man Sensibilität?","Welches Wort bedeutet refinado?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Eloquent\"?","options":["Elocuente","Sutil","Logrado","Aclarar"],"answer":0},{"type":"writing","prompt":"Schreibe eine nuancierte und überzeugende Reflexion.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Die Frage verdient Aufmerksamkeit...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-a1-listening',
  'ai',
  'A1',
  'listening',
  'A.I. Tutor A1 · Listening Lab',
  'Tutor básico: Puedo pedir explicaciones simples y practicar frases cortas.',
  1810,
  true,
  true,
  10,
  20,
  array['ai', 'a1', 'listening'],
  array['Prompt', 'Feedback', 'Repeat', 'Hint'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor básico","intro":"Puedo pedir explicaciones simples y practicar frases cortas.","mission":"Pide al tutor 5 frases para presentarte.","grammar":"Corrección simple, vocabulario esencial, repetición guiada.","phrases":["Correct my sentence.","Give me an example.","Ask me a question.","Explain it simply."],"vocabulary":[{"word":"Prompt","translation":"Solicitud","example":"Give me five useful phrases."},{"word":"Feedback","translation":"Corrección","example":"The feedback is clear."},{"word":"Repeat","translation":"Repetir","example":"Repeat after me."},{"word":"Hint","translation":"Pista","example":"Give me a hint."},{"word":"Coach","translation":"Entrenador","example":"The coach helps me."},{"word":"Practice","translation":"Práctica","example":"Practice every day."}],"dialogue":[{"speaker":"Tutor","line":"Correct my sentence.","translation":"Frase modelo"},{"speaker":"Student","line":"Give me an example.","translation":"Respuesta guiada"}],"reading":{"text":"The AI tutor helps students practice with short prompts, examples and friendly corrections.","questions":["What does the tutor help with?","What kind of corrections?","What can students practice?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Prompt\"?","options":["Solicitud","Corrección","Repetir","Pista"],"answer":0},{"type":"writing","prompt":"Pide al tutor 5 frases para presentarte.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Correct my sentence.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-a1-speaking',
  'ai',
  'A1',
  'speaking',
  'A.I. Tutor A1 · Speaking Mission',
  'Tutor básico: Puedo pedir explicaciones simples y practicar frases cortas.',
  1820,
  true,
  true,
  10,
  20,
  array['ai', 'a1', 'speaking'],
  array['Prompt', 'Feedback', 'Repeat', 'Hint'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor básico","intro":"Puedo pedir explicaciones simples y practicar frases cortas.","mission":"Pide al tutor 5 frases para presentarte.","grammar":"Corrección simple, vocabulario esencial, repetición guiada.","phrases":["Correct my sentence.","Give me an example.","Ask me a question.","Explain it simply."],"vocabulary":[{"word":"Prompt","translation":"Solicitud","example":"Give me five useful phrases."},{"word":"Feedback","translation":"Corrección","example":"The feedback is clear."},{"word":"Repeat","translation":"Repetir","example":"Repeat after me."},{"word":"Hint","translation":"Pista","example":"Give me a hint."},{"word":"Coach","translation":"Entrenador","example":"The coach helps me."},{"word":"Practice","translation":"Práctica","example":"Practice every day."}],"dialogue":[{"speaker":"Tutor","line":"Correct my sentence.","translation":"Frase modelo"},{"speaker":"Student","line":"Give me an example.","translation":"Respuesta guiada"}],"reading":{"text":"The AI tutor helps students practice with short prompts, examples and friendly corrections.","questions":["What does the tutor help with?","What kind of corrections?","What can students practice?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Prompt\"?","options":["Solicitud","Corrección","Repetir","Pista"],"answer":0},{"type":"writing","prompt":"Pide al tutor 5 frases para presentarte.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Correct my sentence.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-a1-reading',
  'ai',
  'A1',
  'reading',
  'A.I. Tutor A1 · Reading Quest',
  'Tutor básico: Puedo pedir explicaciones simples y practicar frases cortas.',
  1830,
  true,
  true,
  10,
  20,
  array['ai', 'a1', 'reading'],
  array['Prompt', 'Feedback', 'Repeat', 'Hint'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor básico","intro":"Puedo pedir explicaciones simples y practicar frases cortas.","mission":"Pide al tutor 5 frases para presentarte.","grammar":"Corrección simple, vocabulario esencial, repetición guiada.","phrases":["Correct my sentence.","Give me an example.","Ask me a question.","Explain it simply."],"vocabulary":[{"word":"Prompt","translation":"Solicitud","example":"Give me five useful phrases."},{"word":"Feedback","translation":"Corrección","example":"The feedback is clear."},{"word":"Repeat","translation":"Repetir","example":"Repeat after me."},{"word":"Hint","translation":"Pista","example":"Give me a hint."},{"word":"Coach","translation":"Entrenador","example":"The coach helps me."},{"word":"Practice","translation":"Práctica","example":"Practice every day."}],"dialogue":[{"speaker":"Tutor","line":"Correct my sentence.","translation":"Frase modelo"},{"speaker":"Student","line":"Give me an example.","translation":"Respuesta guiada"}],"reading":{"text":"The AI tutor helps students practice with short prompts, examples and friendly corrections.","questions":["What does the tutor help with?","What kind of corrections?","What can students practice?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Prompt\"?","options":["Solicitud","Corrección","Repetir","Pista"],"answer":0},{"type":"writing","prompt":"Pide al tutor 5 frases para presentarte.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Correct my sentence.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-a1-writing',
  'ai',
  'A1',
  'writing',
  'A.I. Tutor A1 · Writing Challenge',
  'Tutor básico: Puedo pedir explicaciones simples y practicar frases cortas.',
  1840,
  true,
  true,
  10,
  20,
  array['ai', 'a1', 'writing'],
  array['Prompt', 'Feedback', 'Repeat', 'Hint'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor básico","intro":"Puedo pedir explicaciones simples y practicar frases cortas.","mission":"Pide al tutor 5 frases para presentarte.","grammar":"Corrección simple, vocabulario esencial, repetición guiada.","phrases":["Correct my sentence.","Give me an example.","Ask me a question.","Explain it simply."],"vocabulary":[{"word":"Prompt","translation":"Solicitud","example":"Give me five useful phrases."},{"word":"Feedback","translation":"Corrección","example":"The feedback is clear."},{"word":"Repeat","translation":"Repetir","example":"Repeat after me."},{"word":"Hint","translation":"Pista","example":"Give me a hint."},{"word":"Coach","translation":"Entrenador","example":"The coach helps me."},{"word":"Practice","translation":"Práctica","example":"Practice every day."}],"dialogue":[{"speaker":"Tutor","line":"Correct my sentence.","translation":"Frase modelo"},{"speaker":"Student","line":"Give me an example.","translation":"Respuesta guiada"}],"reading":{"text":"The AI tutor helps students practice with short prompts, examples and friendly corrections.","questions":["What does the tutor help with?","What kind of corrections?","What can students practice?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Prompt\"?","options":["Solicitud","Corrección","Repetir","Pista"],"answer":0},{"type":"writing","prompt":"Pide al tutor 5 frases para presentarte.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Correct my sentence.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-a1-grammar',
  'ai',
  'A1',
  'grammar',
  'A.I. Tutor A1 · Grammar Focus',
  'Tutor básico: Puedo pedir explicaciones simples y practicar frases cortas.',
  1850,
  true,
  true,
  10,
  20,
  array['ai', 'a1', 'grammar'],
  array['Prompt', 'Feedback', 'Repeat', 'Hint'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor básico","intro":"Puedo pedir explicaciones simples y practicar frases cortas.","mission":"Pide al tutor 5 frases para presentarte.","grammar":"Corrección simple, vocabulario esencial, repetición guiada.","phrases":["Correct my sentence.","Give me an example.","Ask me a question.","Explain it simply."],"vocabulary":[{"word":"Prompt","translation":"Solicitud","example":"Give me five useful phrases."},{"word":"Feedback","translation":"Corrección","example":"The feedback is clear."},{"word":"Repeat","translation":"Repetir","example":"Repeat after me."},{"word":"Hint","translation":"Pista","example":"Give me a hint."},{"word":"Coach","translation":"Entrenador","example":"The coach helps me."},{"word":"Practice","translation":"Práctica","example":"Practice every day."}],"dialogue":[{"speaker":"Tutor","line":"Correct my sentence.","translation":"Frase modelo"},{"speaker":"Student","line":"Give me an example.","translation":"Respuesta guiada"}],"reading":{"text":"The AI tutor helps students practice with short prompts, examples and friendly corrections.","questions":["What does the tutor help with?","What kind of corrections?","What can students practice?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Prompt\"?","options":["Solicitud","Corrección","Repetir","Pista"],"answer":0},{"type":"writing","prompt":"Pide al tutor 5 frases para presentarte.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Correct my sentence.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-a1-vocabulary',
  'ai',
  'A1',
  'vocabulary',
  'A.I. Tutor A1 · Vocabulary Boost',
  'Tutor básico: Puedo pedir explicaciones simples y practicar frases cortas.',
  1860,
  true,
  true,
  10,
  10,
  array['ai', 'a1', 'vocabulary'],
  array['Prompt', 'Feedback', 'Repeat', 'Hint'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor básico","intro":"Puedo pedir explicaciones simples y practicar frases cortas.","mission":"Pide al tutor 5 frases para presentarte.","grammar":"Corrección simple, vocabulario esencial, repetición guiada.","phrases":["Correct my sentence.","Give me an example.","Ask me a question.","Explain it simply."],"vocabulary":[{"word":"Prompt","translation":"Solicitud","example":"Give me five useful phrases."},{"word":"Feedback","translation":"Corrección","example":"The feedback is clear."},{"word":"Repeat","translation":"Repetir","example":"Repeat after me."},{"word":"Hint","translation":"Pista","example":"Give me a hint."},{"word":"Coach","translation":"Entrenador","example":"The coach helps me."},{"word":"Practice","translation":"Práctica","example":"Practice every day."}],"dialogue":[{"speaker":"Tutor","line":"Correct my sentence.","translation":"Frase modelo"},{"speaker":"Student","line":"Give me an example.","translation":"Respuesta guiada"}],"reading":{"text":"The AI tutor helps students practice with short prompts, examples and friendly corrections.","questions":["What does the tutor help with?","What kind of corrections?","What can students practice?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Prompt\"?","options":["Solicitud","Corrección","Repetir","Pista"],"answer":0},{"type":"writing","prompt":"Pide al tutor 5 frases para presentarte.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Correct my sentence.","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-a2-listening',
  'ai',
  'A2',
  'listening',
  'A.I. Tutor A2 · Listening Lab',
  'Tutor cotidiano: Puedo simular compras, viajes, rutinas y preguntas comunes.',
  1870,
  true,
  true,
  10,
  20,
  array['ai', 'a2', 'listening'],
  array['Scenario', 'Role-play', 'Mistake', 'Example'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor cotidiano","intro":"Puedo simular compras, viajes, rutinas y preguntas comunes.","mission":"Simula una conversación en una tienda.","grammar":"Diálogos guiados, escenarios cotidianos y errores frecuentes.","phrases":["Let’s role-play...","Make it easier.","Translate this.","What is my mistake?"],"vocabulary":[{"word":"Scenario","translation":"Escenario","example":"Choose a travel scenario."},{"word":"Role-play","translation":"Simulación","example":"Let’s role-play."},{"word":"Mistake","translation":"Error","example":"Find my mistake."},{"word":"Example","translation":"Ejemplo","example":"Give me another example."},{"word":"Translate","translation":"Traducir","example":"Translate this phrase."},{"word":"Improve","translation":"Mejorar","example":"Improve my answer."}],"dialogue":[{"speaker":"Tutor","line":"Let’s role-play...","translation":"Frase modelo"},{"speaker":"Student","line":"Make it easier.","translation":"Respuesta guiada"}],"reading":{"text":"A good tutor adapts the activity to the learner’s level and gives examples before asking for production.","questions":["What does a good tutor adapt?","What does it give first?","What comes after examples?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Scenario\"?","options":["Escenario","Simulación","Error","Ejemplo"],"answer":0},{"type":"writing","prompt":"Simula una conversación en una tienda.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Let’s role-play...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-a2-speaking',
  'ai',
  'A2',
  'speaking',
  'A.I. Tutor A2 · Speaking Mission',
  'Tutor cotidiano: Puedo simular compras, viajes, rutinas y preguntas comunes.',
  1880,
  true,
  true,
  10,
  20,
  array['ai', 'a2', 'speaking'],
  array['Scenario', 'Role-play', 'Mistake', 'Example'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor cotidiano","intro":"Puedo simular compras, viajes, rutinas y preguntas comunes.","mission":"Simula una conversación en una tienda.","grammar":"Diálogos guiados, escenarios cotidianos y errores frecuentes.","phrases":["Let’s role-play...","Make it easier.","Translate this.","What is my mistake?"],"vocabulary":[{"word":"Scenario","translation":"Escenario","example":"Choose a travel scenario."},{"word":"Role-play","translation":"Simulación","example":"Let’s role-play."},{"word":"Mistake","translation":"Error","example":"Find my mistake."},{"word":"Example","translation":"Ejemplo","example":"Give me another example."},{"word":"Translate","translation":"Traducir","example":"Translate this phrase."},{"word":"Improve","translation":"Mejorar","example":"Improve my answer."}],"dialogue":[{"speaker":"Tutor","line":"Let’s role-play...","translation":"Frase modelo"},{"speaker":"Student","line":"Make it easier.","translation":"Respuesta guiada"}],"reading":{"text":"A good tutor adapts the activity to the learner’s level and gives examples before asking for production.","questions":["What does a good tutor adapt?","What does it give first?","What comes after examples?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Scenario\"?","options":["Escenario","Simulación","Error","Ejemplo"],"answer":0},{"type":"writing","prompt":"Simula una conversación en una tienda.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Let’s role-play...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-a2-reading',
  'ai',
  'A2',
  'reading',
  'A.I. Tutor A2 · Reading Quest',
  'Tutor cotidiano: Puedo simular compras, viajes, rutinas y preguntas comunes.',
  1890,
  true,
  true,
  10,
  20,
  array['ai', 'a2', 'reading'],
  array['Scenario', 'Role-play', 'Mistake', 'Example'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor cotidiano","intro":"Puedo simular compras, viajes, rutinas y preguntas comunes.","mission":"Simula una conversación en una tienda.","grammar":"Diálogos guiados, escenarios cotidianos y errores frecuentes.","phrases":["Let’s role-play...","Make it easier.","Translate this.","What is my mistake?"],"vocabulary":[{"word":"Scenario","translation":"Escenario","example":"Choose a travel scenario."},{"word":"Role-play","translation":"Simulación","example":"Let’s role-play."},{"word":"Mistake","translation":"Error","example":"Find my mistake."},{"word":"Example","translation":"Ejemplo","example":"Give me another example."},{"word":"Translate","translation":"Traducir","example":"Translate this phrase."},{"word":"Improve","translation":"Mejorar","example":"Improve my answer."}],"dialogue":[{"speaker":"Tutor","line":"Let’s role-play...","translation":"Frase modelo"},{"speaker":"Student","line":"Make it easier.","translation":"Respuesta guiada"}],"reading":{"text":"A good tutor adapts the activity to the learner’s level and gives examples before asking for production.","questions":["What does a good tutor adapt?","What does it give first?","What comes after examples?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Scenario\"?","options":["Escenario","Simulación","Error","Ejemplo"],"answer":0},{"type":"writing","prompt":"Simula una conversación en una tienda.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Let’s role-play...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-a2-writing',
  'ai',
  'A2',
  'writing',
  'A.I. Tutor A2 · Writing Challenge',
  'Tutor cotidiano: Puedo simular compras, viajes, rutinas y preguntas comunes.',
  1900,
  true,
  true,
  10,
  20,
  array['ai', 'a2', 'writing'],
  array['Scenario', 'Role-play', 'Mistake', 'Example'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor cotidiano","intro":"Puedo simular compras, viajes, rutinas y preguntas comunes.","mission":"Simula una conversación en una tienda.","grammar":"Diálogos guiados, escenarios cotidianos y errores frecuentes.","phrases":["Let’s role-play...","Make it easier.","Translate this.","What is my mistake?"],"vocabulary":[{"word":"Scenario","translation":"Escenario","example":"Choose a travel scenario."},{"word":"Role-play","translation":"Simulación","example":"Let’s role-play."},{"word":"Mistake","translation":"Error","example":"Find my mistake."},{"word":"Example","translation":"Ejemplo","example":"Give me another example."},{"word":"Translate","translation":"Traducir","example":"Translate this phrase."},{"word":"Improve","translation":"Mejorar","example":"Improve my answer."}],"dialogue":[{"speaker":"Tutor","line":"Let’s role-play...","translation":"Frase modelo"},{"speaker":"Student","line":"Make it easier.","translation":"Respuesta guiada"}],"reading":{"text":"A good tutor adapts the activity to the learner’s level and gives examples before asking for production.","questions":["What does a good tutor adapt?","What does it give first?","What comes after examples?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Scenario\"?","options":["Escenario","Simulación","Error","Ejemplo"],"answer":0},{"type":"writing","prompt":"Simula una conversación en una tienda.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Let’s role-play...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-a2-grammar',
  'ai',
  'A2',
  'grammar',
  'A.I. Tutor A2 · Grammar Focus',
  'Tutor cotidiano: Puedo simular compras, viajes, rutinas y preguntas comunes.',
  1910,
  true,
  true,
  10,
  20,
  array['ai', 'a2', 'grammar'],
  array['Scenario', 'Role-play', 'Mistake', 'Example'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor cotidiano","intro":"Puedo simular compras, viajes, rutinas y preguntas comunes.","mission":"Simula una conversación en una tienda.","grammar":"Diálogos guiados, escenarios cotidianos y errores frecuentes.","phrases":["Let’s role-play...","Make it easier.","Translate this.","What is my mistake?"],"vocabulary":[{"word":"Scenario","translation":"Escenario","example":"Choose a travel scenario."},{"word":"Role-play","translation":"Simulación","example":"Let’s role-play."},{"word":"Mistake","translation":"Error","example":"Find my mistake."},{"word":"Example","translation":"Ejemplo","example":"Give me another example."},{"word":"Translate","translation":"Traducir","example":"Translate this phrase."},{"word":"Improve","translation":"Mejorar","example":"Improve my answer."}],"dialogue":[{"speaker":"Tutor","line":"Let’s role-play...","translation":"Frase modelo"},{"speaker":"Student","line":"Make it easier.","translation":"Respuesta guiada"}],"reading":{"text":"A good tutor adapts the activity to the learner’s level and gives examples before asking for production.","questions":["What does a good tutor adapt?","What does it give first?","What comes after examples?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Scenario\"?","options":["Escenario","Simulación","Error","Ejemplo"],"answer":0},{"type":"writing","prompt":"Simula una conversación en una tienda.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Let’s role-play...","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-a2-vocabulary',
  'ai',
  'A2',
  'vocabulary',
  'A.I. Tutor A2 · Vocabulary Boost',
  'Tutor cotidiano: Puedo simular compras, viajes, rutinas y preguntas comunes.',
  1920,
  true,
  true,
  10,
  10,
  array['ai', 'a2', 'vocabulary'],
  array['Scenario', 'Role-play', 'Mistake', 'Example'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor cotidiano","intro":"Puedo simular compras, viajes, rutinas y preguntas comunes.","mission":"Simula una conversación en una tienda.","grammar":"Diálogos guiados, escenarios cotidianos y errores frecuentes.","phrases":["Let’s role-play...","Make it easier.","Translate this.","What is my mistake?"],"vocabulary":[{"word":"Scenario","translation":"Escenario","example":"Choose a travel scenario."},{"word":"Role-play","translation":"Simulación","example":"Let’s role-play."},{"word":"Mistake","translation":"Error","example":"Find my mistake."},{"word":"Example","translation":"Ejemplo","example":"Give me another example."},{"word":"Translate","translation":"Traducir","example":"Translate this phrase."},{"word":"Improve","translation":"Mejorar","example":"Improve my answer."}],"dialogue":[{"speaker":"Tutor","line":"Let’s role-play...","translation":"Frase modelo"},{"speaker":"Student","line":"Make it easier.","translation":"Respuesta guiada"}],"reading":{"text":"A good tutor adapts the activity to the learner’s level and gives examples before asking for production.","questions":["What does a good tutor adapt?","What does it give first?","What comes after examples?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Scenario\"?","options":["Escenario","Simulación","Error","Ejemplo"],"answer":0},{"type":"writing","prompt":"Simula una conversación en una tienda.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Let’s role-play...","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-b1-listening',
  'ai',
  'B1',
  'listening',
  'A.I. Tutor B1 · Listening Lab',
  'Tutor conversacional: Puedo conversar, recibir correcciones y ampliar mis respuestas.',
  1930,
  false,
  true,
  15,
  20,
  array['ai', 'b1', 'listening'],
  array['Fluency', 'Reason', 'Rewrite', 'Natural'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor conversacional","intro":"Puedo conversar, recibir correcciones y ampliar mis respuestas.","mission":"Mantén un diálogo de 6 turnos sobre tus metas.","grammar":"Corrección comunicativa, fluidez, conectores y reformulación.","phrases":["Ask me a follow-up question.","Make it more natural.","Give me feedback.","Help me continue."],"vocabulary":[{"word":"Fluency","translation":"Fluidez","example":"Fluency grows with practice."},{"word":"Reason","translation":"Razón","example":"Give one reason."},{"word":"Rewrite","translation":"Reescribir","example":"Rewrite this sentence."},{"word":"Natural","translation":"Natural","example":"Make it sound natural."},{"word":"Follow-up","translation":"Seguimiento","example":"Ask a follow-up question."},{"word":"Confidence","translation":"Confianza","example":"Confidence improves slowly."}],"dialogue":[{"speaker":"Tutor","line":"Ask me a follow-up question.","translation":"Frase modelo"},{"speaker":"Student","line":"Make it more natural.","translation":"Respuesta guiada"}],"reading":{"text":"At intermediate levels, the tutor should encourage longer answers and correct errors without interrupting communication.","questions":["What should the tutor encourage?","What should it correct?","What should not be interrupted?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Fluency\"?","options":["Fluidez","Razón","Reescribir","Natural"],"answer":0},{"type":"writing","prompt":"Mantén un diálogo de 6 turnos sobre tus metas.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ask me a follow-up question.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-b1-speaking',
  'ai',
  'B1',
  'speaking',
  'A.I. Tutor B1 · Speaking Mission',
  'Tutor conversacional: Puedo conversar, recibir correcciones y ampliar mis respuestas.',
  1940,
  false,
  true,
  15,
  20,
  array['ai', 'b1', 'speaking'],
  array['Fluency', 'Reason', 'Rewrite', 'Natural'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor conversacional","intro":"Puedo conversar, recibir correcciones y ampliar mis respuestas.","mission":"Mantén un diálogo de 6 turnos sobre tus metas.","grammar":"Corrección comunicativa, fluidez, conectores y reformulación.","phrases":["Ask me a follow-up question.","Make it more natural.","Give me feedback.","Help me continue."],"vocabulary":[{"word":"Fluency","translation":"Fluidez","example":"Fluency grows with practice."},{"word":"Reason","translation":"Razón","example":"Give one reason."},{"word":"Rewrite","translation":"Reescribir","example":"Rewrite this sentence."},{"word":"Natural","translation":"Natural","example":"Make it sound natural."},{"word":"Follow-up","translation":"Seguimiento","example":"Ask a follow-up question."},{"word":"Confidence","translation":"Confianza","example":"Confidence improves slowly."}],"dialogue":[{"speaker":"Tutor","line":"Ask me a follow-up question.","translation":"Frase modelo"},{"speaker":"Student","line":"Make it more natural.","translation":"Respuesta guiada"}],"reading":{"text":"At intermediate levels, the tutor should encourage longer answers and correct errors without interrupting communication.","questions":["What should the tutor encourage?","What should it correct?","What should not be interrupted?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Fluency\"?","options":["Fluidez","Razón","Reescribir","Natural"],"answer":0},{"type":"writing","prompt":"Mantén un diálogo de 6 turnos sobre tus metas.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ask me a follow-up question.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-b1-reading',
  'ai',
  'B1',
  'reading',
  'A.I. Tutor B1 · Reading Quest',
  'Tutor conversacional: Puedo conversar, recibir correcciones y ampliar mis respuestas.',
  1950,
  false,
  true,
  15,
  20,
  array['ai', 'b1', 'reading'],
  array['Fluency', 'Reason', 'Rewrite', 'Natural'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor conversacional","intro":"Puedo conversar, recibir correcciones y ampliar mis respuestas.","mission":"Mantén un diálogo de 6 turnos sobre tus metas.","grammar":"Corrección comunicativa, fluidez, conectores y reformulación.","phrases":["Ask me a follow-up question.","Make it more natural.","Give me feedback.","Help me continue."],"vocabulary":[{"word":"Fluency","translation":"Fluidez","example":"Fluency grows with practice."},{"word":"Reason","translation":"Razón","example":"Give one reason."},{"word":"Rewrite","translation":"Reescribir","example":"Rewrite this sentence."},{"word":"Natural","translation":"Natural","example":"Make it sound natural."},{"word":"Follow-up","translation":"Seguimiento","example":"Ask a follow-up question."},{"word":"Confidence","translation":"Confianza","example":"Confidence improves slowly."}],"dialogue":[{"speaker":"Tutor","line":"Ask me a follow-up question.","translation":"Frase modelo"},{"speaker":"Student","line":"Make it more natural.","translation":"Respuesta guiada"}],"reading":{"text":"At intermediate levels, the tutor should encourage longer answers and correct errors without interrupting communication.","questions":["What should the tutor encourage?","What should it correct?","What should not be interrupted?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Fluency\"?","options":["Fluidez","Razón","Reescribir","Natural"],"answer":0},{"type":"writing","prompt":"Mantén un diálogo de 6 turnos sobre tus metas.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ask me a follow-up question.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-b1-writing',
  'ai',
  'B1',
  'writing',
  'A.I. Tutor B1 · Writing Challenge',
  'Tutor conversacional: Puedo conversar, recibir correcciones y ampliar mis respuestas.',
  1960,
  false,
  true,
  15,
  20,
  array['ai', 'b1', 'writing'],
  array['Fluency', 'Reason', 'Rewrite', 'Natural'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor conversacional","intro":"Puedo conversar, recibir correcciones y ampliar mis respuestas.","mission":"Mantén un diálogo de 6 turnos sobre tus metas.","grammar":"Corrección comunicativa, fluidez, conectores y reformulación.","phrases":["Ask me a follow-up question.","Make it more natural.","Give me feedback.","Help me continue."],"vocabulary":[{"word":"Fluency","translation":"Fluidez","example":"Fluency grows with practice."},{"word":"Reason","translation":"Razón","example":"Give one reason."},{"word":"Rewrite","translation":"Reescribir","example":"Rewrite this sentence."},{"word":"Natural","translation":"Natural","example":"Make it sound natural."},{"word":"Follow-up","translation":"Seguimiento","example":"Ask a follow-up question."},{"word":"Confidence","translation":"Confianza","example":"Confidence improves slowly."}],"dialogue":[{"speaker":"Tutor","line":"Ask me a follow-up question.","translation":"Frase modelo"},{"speaker":"Student","line":"Make it more natural.","translation":"Respuesta guiada"}],"reading":{"text":"At intermediate levels, the tutor should encourage longer answers and correct errors without interrupting communication.","questions":["What should the tutor encourage?","What should it correct?","What should not be interrupted?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Fluency\"?","options":["Fluidez","Razón","Reescribir","Natural"],"answer":0},{"type":"writing","prompt":"Mantén un diálogo de 6 turnos sobre tus metas.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ask me a follow-up question.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-b1-grammar',
  'ai',
  'B1',
  'grammar',
  'A.I. Tutor B1 · Grammar Focus',
  'Tutor conversacional: Puedo conversar, recibir correcciones y ampliar mis respuestas.',
  1970,
  false,
  true,
  15,
  20,
  array['ai', 'b1', 'grammar'],
  array['Fluency', 'Reason', 'Rewrite', 'Natural'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor conversacional","intro":"Puedo conversar, recibir correcciones y ampliar mis respuestas.","mission":"Mantén un diálogo de 6 turnos sobre tus metas.","grammar":"Corrección comunicativa, fluidez, conectores y reformulación.","phrases":["Ask me a follow-up question.","Make it more natural.","Give me feedback.","Help me continue."],"vocabulary":[{"word":"Fluency","translation":"Fluidez","example":"Fluency grows with practice."},{"word":"Reason","translation":"Razón","example":"Give one reason."},{"word":"Rewrite","translation":"Reescribir","example":"Rewrite this sentence."},{"word":"Natural","translation":"Natural","example":"Make it sound natural."},{"word":"Follow-up","translation":"Seguimiento","example":"Ask a follow-up question."},{"word":"Confidence","translation":"Confianza","example":"Confidence improves slowly."}],"dialogue":[{"speaker":"Tutor","line":"Ask me a follow-up question.","translation":"Frase modelo"},{"speaker":"Student","line":"Make it more natural.","translation":"Respuesta guiada"}],"reading":{"text":"At intermediate levels, the tutor should encourage longer answers and correct errors without interrupting communication.","questions":["What should the tutor encourage?","What should it correct?","What should not be interrupted?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Fluency\"?","options":["Fluidez","Razón","Reescribir","Natural"],"answer":0},{"type":"writing","prompt":"Mantén un diálogo de 6 turnos sobre tus metas.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ask me a follow-up question.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-b1-vocabulary',
  'ai',
  'B1',
  'vocabulary',
  'A.I. Tutor B1 · Vocabulary Boost',
  'Tutor conversacional: Puedo conversar, recibir correcciones y ampliar mis respuestas.',
  1980,
  false,
  true,
  15,
  10,
  array['ai', 'b1', 'vocabulary'],
  array['Fluency', 'Reason', 'Rewrite', 'Natural'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor conversacional","intro":"Puedo conversar, recibir correcciones y ampliar mis respuestas.","mission":"Mantén un diálogo de 6 turnos sobre tus metas.","grammar":"Corrección comunicativa, fluidez, conectores y reformulación.","phrases":["Ask me a follow-up question.","Make it more natural.","Give me feedback.","Help me continue."],"vocabulary":[{"word":"Fluency","translation":"Fluidez","example":"Fluency grows with practice."},{"word":"Reason","translation":"Razón","example":"Give one reason."},{"word":"Rewrite","translation":"Reescribir","example":"Rewrite this sentence."},{"word":"Natural","translation":"Natural","example":"Make it sound natural."},{"word":"Follow-up","translation":"Seguimiento","example":"Ask a follow-up question."},{"word":"Confidence","translation":"Confianza","example":"Confidence improves slowly."}],"dialogue":[{"speaker":"Tutor","line":"Ask me a follow-up question.","translation":"Frase modelo"},{"speaker":"Student","line":"Make it more natural.","translation":"Respuesta guiada"}],"reading":{"text":"At intermediate levels, the tutor should encourage longer answers and correct errors without interrupting communication.","questions":["What should the tutor encourage?","What should it correct?","What should not be interrupted?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Fluency\"?","options":["Fluidez","Razón","Reescribir","Natural"],"answer":0},{"type":"writing","prompt":"Mantén un diálogo de 6 turnos sobre tus metas.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Ask me a follow-up question.","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-b2-listening',
  'ai',
  'B2',
  'listening',
  'A.I. Tutor B2 · Listening Lab',
  'Tutor argumentativo: Puedo debatir, justificar ideas y preparar entrevistas.',
  1990,
  false,
  true,
  15,
  20,
  array['ai', 'b2', 'listening'],
  array['Debate', 'Evidence', 'Counterpoint', 'Precise'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor argumentativo","intro":"Puedo debatir, justificar ideas y preparar entrevistas.","mission":"Debate con el tutor sobre educación digital.","grammar":"Argumentación, precisión, coherencia, estilo profesional.","phrases":["Challenge my opinion.","Give a counterargument.","Make it professional.","Improve coherence."],"vocabulary":[{"word":"Debate","translation":"Debate","example":"Start a debate."},{"word":"Evidence","translation":"Evidencia","example":"Use evidence."},{"word":"Counterpoint","translation":"Contraargumento","example":"Give a counterpoint."},{"word":"Precise","translation":"Preciso","example":"Be more precise."},{"word":"Professional","translation":"Profesional","example":"Use a professional tone."},{"word":"Coherent","translation":"Coherente","example":"Make it coherent."}],"dialogue":[{"speaker":"Tutor","line":"Challenge my opinion.","translation":"Frase modelo"},{"speaker":"Student","line":"Give a counterargument.","translation":"Respuesta guiada"}],"reading":{"text":"For upper-intermediate learners, the tutor can challenge ideas, request evidence and guide more coherent responses.","questions":["What can the tutor challenge?","What can it request?","What can it guide?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Debate\"?","options":["Debate","Evidencia","Contraargumento","Preciso"],"answer":0},{"type":"writing","prompt":"Debate con el tutor sobre educación digital.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Challenge my opinion.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-b2-speaking',
  'ai',
  'B2',
  'speaking',
  'A.I. Tutor B2 · Speaking Mission',
  'Tutor argumentativo: Puedo debatir, justificar ideas y preparar entrevistas.',
  2000,
  false,
  true,
  15,
  20,
  array['ai', 'b2', 'speaking'],
  array['Debate', 'Evidence', 'Counterpoint', 'Precise'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor argumentativo","intro":"Puedo debatir, justificar ideas y preparar entrevistas.","mission":"Debate con el tutor sobre educación digital.","grammar":"Argumentación, precisión, coherencia, estilo profesional.","phrases":["Challenge my opinion.","Give a counterargument.","Make it professional.","Improve coherence."],"vocabulary":[{"word":"Debate","translation":"Debate","example":"Start a debate."},{"word":"Evidence","translation":"Evidencia","example":"Use evidence."},{"word":"Counterpoint","translation":"Contraargumento","example":"Give a counterpoint."},{"word":"Precise","translation":"Preciso","example":"Be more precise."},{"word":"Professional","translation":"Profesional","example":"Use a professional tone."},{"word":"Coherent","translation":"Coherente","example":"Make it coherent."}],"dialogue":[{"speaker":"Tutor","line":"Challenge my opinion.","translation":"Frase modelo"},{"speaker":"Student","line":"Give a counterargument.","translation":"Respuesta guiada"}],"reading":{"text":"For upper-intermediate learners, the tutor can challenge ideas, request evidence and guide more coherent responses.","questions":["What can the tutor challenge?","What can it request?","What can it guide?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Debate\"?","options":["Debate","Evidencia","Contraargumento","Preciso"],"answer":0},{"type":"writing","prompt":"Debate con el tutor sobre educación digital.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Challenge my opinion.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-b2-reading',
  'ai',
  'B2',
  'reading',
  'A.I. Tutor B2 · Reading Quest',
  'Tutor argumentativo: Puedo debatir, justificar ideas y preparar entrevistas.',
  2010,
  false,
  true,
  15,
  20,
  array['ai', 'b2', 'reading'],
  array['Debate', 'Evidence', 'Counterpoint', 'Precise'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor argumentativo","intro":"Puedo debatir, justificar ideas y preparar entrevistas.","mission":"Debate con el tutor sobre educación digital.","grammar":"Argumentación, precisión, coherencia, estilo profesional.","phrases":["Challenge my opinion.","Give a counterargument.","Make it professional.","Improve coherence."],"vocabulary":[{"word":"Debate","translation":"Debate","example":"Start a debate."},{"word":"Evidence","translation":"Evidencia","example":"Use evidence."},{"word":"Counterpoint","translation":"Contraargumento","example":"Give a counterpoint."},{"word":"Precise","translation":"Preciso","example":"Be more precise."},{"word":"Professional","translation":"Profesional","example":"Use a professional tone."},{"word":"Coherent","translation":"Coherente","example":"Make it coherent."}],"dialogue":[{"speaker":"Tutor","line":"Challenge my opinion.","translation":"Frase modelo"},{"speaker":"Student","line":"Give a counterargument.","translation":"Respuesta guiada"}],"reading":{"text":"For upper-intermediate learners, the tutor can challenge ideas, request evidence and guide more coherent responses.","questions":["What can the tutor challenge?","What can it request?","What can it guide?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Debate\"?","options":["Debate","Evidencia","Contraargumento","Preciso"],"answer":0},{"type":"writing","prompt":"Debate con el tutor sobre educación digital.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Challenge my opinion.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-b2-writing',
  'ai',
  'B2',
  'writing',
  'A.I. Tutor B2 · Writing Challenge',
  'Tutor argumentativo: Puedo debatir, justificar ideas y preparar entrevistas.',
  2020,
  false,
  true,
  15,
  20,
  array['ai', 'b2', 'writing'],
  array['Debate', 'Evidence', 'Counterpoint', 'Precise'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor argumentativo","intro":"Puedo debatir, justificar ideas y preparar entrevistas.","mission":"Debate con el tutor sobre educación digital.","grammar":"Argumentación, precisión, coherencia, estilo profesional.","phrases":["Challenge my opinion.","Give a counterargument.","Make it professional.","Improve coherence."],"vocabulary":[{"word":"Debate","translation":"Debate","example":"Start a debate."},{"word":"Evidence","translation":"Evidencia","example":"Use evidence."},{"word":"Counterpoint","translation":"Contraargumento","example":"Give a counterpoint."},{"word":"Precise","translation":"Preciso","example":"Be more precise."},{"word":"Professional","translation":"Profesional","example":"Use a professional tone."},{"word":"Coherent","translation":"Coherente","example":"Make it coherent."}],"dialogue":[{"speaker":"Tutor","line":"Challenge my opinion.","translation":"Frase modelo"},{"speaker":"Student","line":"Give a counterargument.","translation":"Respuesta guiada"}],"reading":{"text":"For upper-intermediate learners, the tutor can challenge ideas, request evidence and guide more coherent responses.","questions":["What can the tutor challenge?","What can it request?","What can it guide?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Debate\"?","options":["Debate","Evidencia","Contraargumento","Preciso"],"answer":0},{"type":"writing","prompt":"Debate con el tutor sobre educación digital.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Challenge my opinion.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-b2-grammar',
  'ai',
  'B2',
  'grammar',
  'A.I. Tutor B2 · Grammar Focus',
  'Tutor argumentativo: Puedo debatir, justificar ideas y preparar entrevistas.',
  2030,
  false,
  true,
  15,
  20,
  array['ai', 'b2', 'grammar'],
  array['Debate', 'Evidence', 'Counterpoint', 'Precise'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor argumentativo","intro":"Puedo debatir, justificar ideas y preparar entrevistas.","mission":"Debate con el tutor sobre educación digital.","grammar":"Argumentación, precisión, coherencia, estilo profesional.","phrases":["Challenge my opinion.","Give a counterargument.","Make it professional.","Improve coherence."],"vocabulary":[{"word":"Debate","translation":"Debate","example":"Start a debate."},{"word":"Evidence","translation":"Evidencia","example":"Use evidence."},{"word":"Counterpoint","translation":"Contraargumento","example":"Give a counterpoint."},{"word":"Precise","translation":"Preciso","example":"Be more precise."},{"word":"Professional","translation":"Profesional","example":"Use a professional tone."},{"word":"Coherent","translation":"Coherente","example":"Make it coherent."}],"dialogue":[{"speaker":"Tutor","line":"Challenge my opinion.","translation":"Frase modelo"},{"speaker":"Student","line":"Give a counterargument.","translation":"Respuesta guiada"}],"reading":{"text":"For upper-intermediate learners, the tutor can challenge ideas, request evidence and guide more coherent responses.","questions":["What can the tutor challenge?","What can it request?","What can it guide?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Debate\"?","options":["Debate","Evidencia","Contraargumento","Preciso"],"answer":0},{"type":"writing","prompt":"Debate con el tutor sobre educación digital.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Challenge my opinion.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-b2-vocabulary',
  'ai',
  'B2',
  'vocabulary',
  'A.I. Tutor B2 · Vocabulary Boost',
  'Tutor argumentativo: Puedo debatir, justificar ideas y preparar entrevistas.',
  2040,
  false,
  true,
  15,
  10,
  array['ai', 'b2', 'vocabulary'],
  array['Debate', 'Evidence', 'Counterpoint', 'Precise'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor argumentativo","intro":"Puedo debatir, justificar ideas y preparar entrevistas.","mission":"Debate con el tutor sobre educación digital.","grammar":"Argumentación, precisión, coherencia, estilo profesional.","phrases":["Challenge my opinion.","Give a counterargument.","Make it professional.","Improve coherence."],"vocabulary":[{"word":"Debate","translation":"Debate","example":"Start a debate."},{"word":"Evidence","translation":"Evidencia","example":"Use evidence."},{"word":"Counterpoint","translation":"Contraargumento","example":"Give a counterpoint."},{"word":"Precise","translation":"Preciso","example":"Be more precise."},{"word":"Professional","translation":"Profesional","example":"Use a professional tone."},{"word":"Coherent","translation":"Coherente","example":"Make it coherent."}],"dialogue":[{"speaker":"Tutor","line":"Challenge my opinion.","translation":"Frase modelo"},{"speaker":"Student","line":"Give a counterargument.","translation":"Respuesta guiada"}],"reading":{"text":"For upper-intermediate learners, the tutor can challenge ideas, request evidence and guide more coherent responses.","questions":["What can the tutor challenge?","What can it request?","What can it guide?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Debate\"?","options":["Debate","Evidencia","Contraargumento","Preciso"],"answer":0},{"type":"writing","prompt":"Debate con el tutor sobre educación digital.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Challenge my opinion.","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-c1-listening',
  'ai',
  'C1',
  'listening',
  'A.I. Tutor C1 · Listening Lab',
  'Tutor avanzado: Puedo pulir estilo, matices y registro académico/profesional.',
  2050,
  false,
  true,
  15,
  20,
  array['ai', 'c1', 'listening'],
  array['Nuance', 'Register', 'Polish', 'Academic'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor avanzado","intro":"Puedo pulir estilo, matices y registro académico/profesional.","mission":"Pide al tutor que convierta un texto simple en académico.","grammar":"Registro, matices, precisión léxica y edición avanzada.","phrases":["Polish my paragraph.","Make it more academic.","Add nuance.","Change the register."],"vocabulary":[{"word":"Nuance","translation":"Matiz","example":"Add nuance to the answer."},{"word":"Register","translation":"Registro","example":"Change the register."},{"word":"Polish","translation":"Pulir","example":"Polish this paragraph."},{"word":"Academic","translation":"Académico","example":"Use an academic tone."},{"word":"Subtle","translation":"Sutil","example":"This is a subtle difference."},{"word":"Concise","translation":"Conciso","example":"Make it concise."}],"dialogue":[{"speaker":"Tutor","line":"Polish my paragraph.","translation":"Frase modelo"},{"speaker":"Student","line":"Make it more academic.","translation":"Respuesta guiada"}],"reading":{"text":"Advanced AI tutoring focuses on precision, register, rhetorical choices and the learner’s personal voice.","questions":["What does advanced tutoring focus on?","What choices are mentioned?","Whose voice matters?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nuance\"?","options":["Matiz","Registro","Pulir","Académico"],"answer":0},{"type":"writing","prompt":"Pide al tutor que convierta un texto simple en académico.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Polish my paragraph.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-c1-speaking',
  'ai',
  'C1',
  'speaking',
  'A.I. Tutor C1 · Speaking Mission',
  'Tutor avanzado: Puedo pulir estilo, matices y registro académico/profesional.',
  2060,
  false,
  true,
  15,
  20,
  array['ai', 'c1', 'speaking'],
  array['Nuance', 'Register', 'Polish', 'Academic'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor avanzado","intro":"Puedo pulir estilo, matices y registro académico/profesional.","mission":"Pide al tutor que convierta un texto simple en académico.","grammar":"Registro, matices, precisión léxica y edición avanzada.","phrases":["Polish my paragraph.","Make it more academic.","Add nuance.","Change the register."],"vocabulary":[{"word":"Nuance","translation":"Matiz","example":"Add nuance to the answer."},{"word":"Register","translation":"Registro","example":"Change the register."},{"word":"Polish","translation":"Pulir","example":"Polish this paragraph."},{"word":"Academic","translation":"Académico","example":"Use an academic tone."},{"word":"Subtle","translation":"Sutil","example":"This is a subtle difference."},{"word":"Concise","translation":"Conciso","example":"Make it concise."}],"dialogue":[{"speaker":"Tutor","line":"Polish my paragraph.","translation":"Frase modelo"},{"speaker":"Student","line":"Make it more academic.","translation":"Respuesta guiada"}],"reading":{"text":"Advanced AI tutoring focuses on precision, register, rhetorical choices and the learner’s personal voice.","questions":["What does advanced tutoring focus on?","What choices are mentioned?","Whose voice matters?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nuance\"?","options":["Matiz","Registro","Pulir","Académico"],"answer":0},{"type":"writing","prompt":"Pide al tutor que convierta un texto simple en académico.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Polish my paragraph.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-c1-reading',
  'ai',
  'C1',
  'reading',
  'A.I. Tutor C1 · Reading Quest',
  'Tutor avanzado: Puedo pulir estilo, matices y registro académico/profesional.',
  2070,
  false,
  true,
  15,
  20,
  array['ai', 'c1', 'reading'],
  array['Nuance', 'Register', 'Polish', 'Academic'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor avanzado","intro":"Puedo pulir estilo, matices y registro académico/profesional.","mission":"Pide al tutor que convierta un texto simple en académico.","grammar":"Registro, matices, precisión léxica y edición avanzada.","phrases":["Polish my paragraph.","Make it more academic.","Add nuance.","Change the register."],"vocabulary":[{"word":"Nuance","translation":"Matiz","example":"Add nuance to the answer."},{"word":"Register","translation":"Registro","example":"Change the register."},{"word":"Polish","translation":"Pulir","example":"Polish this paragraph."},{"word":"Academic","translation":"Académico","example":"Use an academic tone."},{"word":"Subtle","translation":"Sutil","example":"This is a subtle difference."},{"word":"Concise","translation":"Conciso","example":"Make it concise."}],"dialogue":[{"speaker":"Tutor","line":"Polish my paragraph.","translation":"Frase modelo"},{"speaker":"Student","line":"Make it more academic.","translation":"Respuesta guiada"}],"reading":{"text":"Advanced AI tutoring focuses on precision, register, rhetorical choices and the learner’s personal voice.","questions":["What does advanced tutoring focus on?","What choices are mentioned?","Whose voice matters?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nuance\"?","options":["Matiz","Registro","Pulir","Académico"],"answer":0},{"type":"writing","prompt":"Pide al tutor que convierta un texto simple en académico.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Polish my paragraph.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-c1-writing',
  'ai',
  'C1',
  'writing',
  'A.I. Tutor C1 · Writing Challenge',
  'Tutor avanzado: Puedo pulir estilo, matices y registro académico/profesional.',
  2080,
  false,
  true,
  15,
  20,
  array['ai', 'c1', 'writing'],
  array['Nuance', 'Register', 'Polish', 'Academic'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor avanzado","intro":"Puedo pulir estilo, matices y registro académico/profesional.","mission":"Pide al tutor que convierta un texto simple en académico.","grammar":"Registro, matices, precisión léxica y edición avanzada.","phrases":["Polish my paragraph.","Make it more academic.","Add nuance.","Change the register."],"vocabulary":[{"word":"Nuance","translation":"Matiz","example":"Add nuance to the answer."},{"word":"Register","translation":"Registro","example":"Change the register."},{"word":"Polish","translation":"Pulir","example":"Polish this paragraph."},{"word":"Academic","translation":"Académico","example":"Use an academic tone."},{"word":"Subtle","translation":"Sutil","example":"This is a subtle difference."},{"word":"Concise","translation":"Conciso","example":"Make it concise."}],"dialogue":[{"speaker":"Tutor","line":"Polish my paragraph.","translation":"Frase modelo"},{"speaker":"Student","line":"Make it more academic.","translation":"Respuesta guiada"}],"reading":{"text":"Advanced AI tutoring focuses on precision, register, rhetorical choices and the learner’s personal voice.","questions":["What does advanced tutoring focus on?","What choices are mentioned?","Whose voice matters?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nuance\"?","options":["Matiz","Registro","Pulir","Académico"],"answer":0},{"type":"writing","prompt":"Pide al tutor que convierta un texto simple en académico.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Polish my paragraph.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-c1-grammar',
  'ai',
  'C1',
  'grammar',
  'A.I. Tutor C1 · Grammar Focus',
  'Tutor avanzado: Puedo pulir estilo, matices y registro académico/profesional.',
  2090,
  false,
  true,
  15,
  20,
  array['ai', 'c1', 'grammar'],
  array['Nuance', 'Register', 'Polish', 'Academic'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor avanzado","intro":"Puedo pulir estilo, matices y registro académico/profesional.","mission":"Pide al tutor que convierta un texto simple en académico.","grammar":"Registro, matices, precisión léxica y edición avanzada.","phrases":["Polish my paragraph.","Make it more academic.","Add nuance.","Change the register."],"vocabulary":[{"word":"Nuance","translation":"Matiz","example":"Add nuance to the answer."},{"word":"Register","translation":"Registro","example":"Change the register."},{"word":"Polish","translation":"Pulir","example":"Polish this paragraph."},{"word":"Academic","translation":"Académico","example":"Use an academic tone."},{"word":"Subtle","translation":"Sutil","example":"This is a subtle difference."},{"word":"Concise","translation":"Conciso","example":"Make it concise."}],"dialogue":[{"speaker":"Tutor","line":"Polish my paragraph.","translation":"Frase modelo"},{"speaker":"Student","line":"Make it more academic.","translation":"Respuesta guiada"}],"reading":{"text":"Advanced AI tutoring focuses on precision, register, rhetorical choices and the learner’s personal voice.","questions":["What does advanced tutoring focus on?","What choices are mentioned?","Whose voice matters?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nuance\"?","options":["Matiz","Registro","Pulir","Académico"],"answer":0},{"type":"writing","prompt":"Pide al tutor que convierta un texto simple en académico.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Polish my paragraph.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-c1-vocabulary',
  'ai',
  'C1',
  'vocabulary',
  'A.I. Tutor C1 · Vocabulary Boost',
  'Tutor avanzado: Puedo pulir estilo, matices y registro académico/profesional.',
  2100,
  false,
  true,
  15,
  10,
  array['ai', 'c1', 'vocabulary'],
  array['Nuance', 'Register', 'Polish', 'Academic'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor avanzado","intro":"Puedo pulir estilo, matices y registro académico/profesional.","mission":"Pide al tutor que convierta un texto simple en académico.","grammar":"Registro, matices, precisión léxica y edición avanzada.","phrases":["Polish my paragraph.","Make it more academic.","Add nuance.","Change the register."],"vocabulary":[{"word":"Nuance","translation":"Matiz","example":"Add nuance to the answer."},{"word":"Register","translation":"Registro","example":"Change the register."},{"word":"Polish","translation":"Pulir","example":"Polish this paragraph."},{"word":"Academic","translation":"Académico","example":"Use an academic tone."},{"word":"Subtle","translation":"Sutil","example":"This is a subtle difference."},{"word":"Concise","translation":"Conciso","example":"Make it concise."}],"dialogue":[{"speaker":"Tutor","line":"Polish my paragraph.","translation":"Frase modelo"},{"speaker":"Student","line":"Make it more academic.","translation":"Respuesta guiada"}],"reading":{"text":"Advanced AI tutoring focuses on precision, register, rhetorical choices and the learner’s personal voice.","questions":["What does advanced tutoring focus on?","What choices are mentioned?","Whose voice matters?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Nuance\"?","options":["Matiz","Registro","Pulir","Académico"],"answer":0},{"type":"writing","prompt":"Pide al tutor que convierta un texto simple en académico.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Polish my paragraph.","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-c2-listening',
  'ai',
  'C2',
  'listening',
  'A.I. Tutor C2 · Listening Lab',
  'Tutor experto: Puedo perfeccionar discursos, textos complejos y comunicación de alto nivel.',
  2110,
  false,
  true,
  15,
  20,
  array['ai', 'c2', 'listening'],
  array['Persuasive', 'Elegant', 'Rhetoric', 'Mastery'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor experto","intro":"Puedo perfeccionar discursos, textos complejos y comunicación de alto nivel.","mission":"Pide una versión elegante y persuasiva de una idea.","grammar":"Retórica, estilo, persuasión, edición experta.","phrases":["Make it persuasive.","Refine the style.","Give me deeper insight.","Prepare me for a speech."],"vocabulary":[{"word":"Persuasive","translation":"Persuasivo","example":"Make it persuasive."},{"word":"Elegant","translation":"Elegante","example":"Use an elegant style."},{"word":"Rhetoric","translation":"Retórica","example":"Improve the rhetoric."},{"word":"Mastery","translation":"Dominio","example":"Aim for mastery."},{"word":"Refined","translation":"Refinado","example":"This sounds refined."},{"word":"Insight","translation":"Perspectiva","example":"Give me deeper insight."}],"dialogue":[{"speaker":"Tutor","line":"Make it persuasive.","translation":"Frase modelo"},{"speaker":"Student","line":"Refine the style.","translation":"Respuesta guiada"}],"reading":{"text":"Expert tutoring helps refine complex communication by balancing clarity, persuasion, elegance and audience awareness.","questions":["What does expert tutoring refine?","What four qualities are balanced?","Who must be considered?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Persuasive\"?","options":["Persuasivo","Elegante","Retórica","Dominio"],"answer":0},{"type":"writing","prompt":"Pide una versión elegante y persuasiva de una idea.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Make it persuasive.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-c2-speaking',
  'ai',
  'C2',
  'speaking',
  'A.I. Tutor C2 · Speaking Mission',
  'Tutor experto: Puedo perfeccionar discursos, textos complejos y comunicación de alto nivel.',
  2120,
  false,
  true,
  15,
  20,
  array['ai', 'c2', 'speaking'],
  array['Persuasive', 'Elegant', 'Rhetoric', 'Mastery'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor experto","intro":"Puedo perfeccionar discursos, textos complejos y comunicación de alto nivel.","mission":"Pide una versión elegante y persuasiva de una idea.","grammar":"Retórica, estilo, persuasión, edición experta.","phrases":["Make it persuasive.","Refine the style.","Give me deeper insight.","Prepare me for a speech."],"vocabulary":[{"word":"Persuasive","translation":"Persuasivo","example":"Make it persuasive."},{"word":"Elegant","translation":"Elegante","example":"Use an elegant style."},{"word":"Rhetoric","translation":"Retórica","example":"Improve the rhetoric."},{"word":"Mastery","translation":"Dominio","example":"Aim for mastery."},{"word":"Refined","translation":"Refinado","example":"This sounds refined."},{"word":"Insight","translation":"Perspectiva","example":"Give me deeper insight."}],"dialogue":[{"speaker":"Tutor","line":"Make it persuasive.","translation":"Frase modelo"},{"speaker":"Student","line":"Refine the style.","translation":"Respuesta guiada"}],"reading":{"text":"Expert tutoring helps refine complex communication by balancing clarity, persuasion, elegance and audience awareness.","questions":["What does expert tutoring refine?","What four qualities are balanced?","Who must be considered?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Persuasive\"?","options":["Persuasivo","Elegante","Retórica","Dominio"],"answer":0},{"type":"writing","prompt":"Pide una versión elegante y persuasiva de una idea.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Make it persuasive.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-c2-reading',
  'ai',
  'C2',
  'reading',
  'A.I. Tutor C2 · Reading Quest',
  'Tutor experto: Puedo perfeccionar discursos, textos complejos y comunicación de alto nivel.',
  2130,
  false,
  true,
  15,
  20,
  array['ai', 'c2', 'reading'],
  array['Persuasive', 'Elegant', 'Rhetoric', 'Mastery'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor experto","intro":"Puedo perfeccionar discursos, textos complejos y comunicación de alto nivel.","mission":"Pide una versión elegante y persuasiva de una idea.","grammar":"Retórica, estilo, persuasión, edición experta.","phrases":["Make it persuasive.","Refine the style.","Give me deeper insight.","Prepare me for a speech."],"vocabulary":[{"word":"Persuasive","translation":"Persuasivo","example":"Make it persuasive."},{"word":"Elegant","translation":"Elegante","example":"Use an elegant style."},{"word":"Rhetoric","translation":"Retórica","example":"Improve the rhetoric."},{"word":"Mastery","translation":"Dominio","example":"Aim for mastery."},{"word":"Refined","translation":"Refinado","example":"This sounds refined."},{"word":"Insight","translation":"Perspectiva","example":"Give me deeper insight."}],"dialogue":[{"speaker":"Tutor","line":"Make it persuasive.","translation":"Frase modelo"},{"speaker":"Student","line":"Refine the style.","translation":"Respuesta guiada"}],"reading":{"text":"Expert tutoring helps refine complex communication by balancing clarity, persuasion, elegance and audience awareness.","questions":["What does expert tutoring refine?","What four qualities are balanced?","Who must be considered?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Persuasive\"?","options":["Persuasivo","Elegante","Retórica","Dominio"],"answer":0},{"type":"writing","prompt":"Pide una versión elegante y persuasiva de una idea.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Make it persuasive.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-c2-writing',
  'ai',
  'C2',
  'writing',
  'A.I. Tutor C2 · Writing Challenge',
  'Tutor experto: Puedo perfeccionar discursos, textos complejos y comunicación de alto nivel.',
  2140,
  false,
  true,
  15,
  20,
  array['ai', 'c2', 'writing'],
  array['Persuasive', 'Elegant', 'Rhetoric', 'Mastery'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor experto","intro":"Puedo perfeccionar discursos, textos complejos y comunicación de alto nivel.","mission":"Pide una versión elegante y persuasiva de una idea.","grammar":"Retórica, estilo, persuasión, edición experta.","phrases":["Make it persuasive.","Refine the style.","Give me deeper insight.","Prepare me for a speech."],"vocabulary":[{"word":"Persuasive","translation":"Persuasivo","example":"Make it persuasive."},{"word":"Elegant","translation":"Elegante","example":"Use an elegant style."},{"word":"Rhetoric","translation":"Retórica","example":"Improve the rhetoric."},{"word":"Mastery","translation":"Dominio","example":"Aim for mastery."},{"word":"Refined","translation":"Refinado","example":"This sounds refined."},{"word":"Insight","translation":"Perspectiva","example":"Give me deeper insight."}],"dialogue":[{"speaker":"Tutor","line":"Make it persuasive.","translation":"Frase modelo"},{"speaker":"Student","line":"Refine the style.","translation":"Respuesta guiada"}],"reading":{"text":"Expert tutoring helps refine complex communication by balancing clarity, persuasion, elegance and audience awareness.","questions":["What does expert tutoring refine?","What four qualities are balanced?","Who must be considered?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Persuasive\"?","options":["Persuasivo","Elegante","Retórica","Dominio"],"answer":0},{"type":"writing","prompt":"Pide una versión elegante y persuasiva de una idea.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Make it persuasive.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-c2-grammar',
  'ai',
  'C2',
  'grammar',
  'A.I. Tutor C2 · Grammar Focus',
  'Tutor experto: Puedo perfeccionar discursos, textos complejos y comunicación de alto nivel.',
  2150,
  false,
  true,
  15,
  20,
  array['ai', 'c2', 'grammar'],
  array['Persuasive', 'Elegant', 'Rhetoric', 'Mastery'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor experto","intro":"Puedo perfeccionar discursos, textos complejos y comunicación de alto nivel.","mission":"Pide una versión elegante y persuasiva de una idea.","grammar":"Retórica, estilo, persuasión, edición experta.","phrases":["Make it persuasive.","Refine the style.","Give me deeper insight.","Prepare me for a speech."],"vocabulary":[{"word":"Persuasive","translation":"Persuasivo","example":"Make it persuasive."},{"word":"Elegant","translation":"Elegante","example":"Use an elegant style."},{"word":"Rhetoric","translation":"Retórica","example":"Improve the rhetoric."},{"word":"Mastery","translation":"Dominio","example":"Aim for mastery."},{"word":"Refined","translation":"Refinado","example":"This sounds refined."},{"word":"Insight","translation":"Perspectiva","example":"Give me deeper insight."}],"dialogue":[{"speaker":"Tutor","line":"Make it persuasive.","translation":"Frase modelo"},{"speaker":"Student","line":"Refine the style.","translation":"Respuesta guiada"}],"reading":{"text":"Expert tutoring helps refine complex communication by balancing clarity, persuasion, elegance and audience awareness.","questions":["What does expert tutoring refine?","What four qualities are balanced?","Who must be considered?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Persuasive\"?","options":["Persuasivo","Elegante","Retórica","Dominio"],"answer":0},{"type":"writing","prompt":"Pide una versión elegante y persuasiva de una idea.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Make it persuasive.","answer":"Oral practice"}],"xp_reward":20}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();

insert into public.lessons (
  slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, tags, keywords, content_json
) values (
  'ai-c2-vocabulary',
  'ai',
  'C2',
  'vocabulary',
  'A.I. Tutor C2 · Vocabulary Boost',
  'Tutor experto: Puedo perfeccionar discursos, textos complejos y comunicación de alto nivel.',
  2160,
  false,
  true,
  15,
  10,
  array['ai', 'c2', 'vocabulary'],
  array['Persuasive', 'Elegant', 'Rhetoric', 'Mastery'],
  '{"language":"A.I. Tutor","language_key":"ai","level_title":"Tutor experto","intro":"Puedo perfeccionar discursos, textos complejos y comunicación de alto nivel.","mission":"Pide una versión elegante y persuasiva de una idea.","grammar":"Retórica, estilo, persuasión, edición experta.","phrases":["Make it persuasive.","Refine the style.","Give me deeper insight.","Prepare me for a speech."],"vocabulary":[{"word":"Persuasive","translation":"Persuasivo","example":"Make it persuasive."},{"word":"Elegant","translation":"Elegante","example":"Use an elegant style."},{"word":"Rhetoric","translation":"Retórica","example":"Improve the rhetoric."},{"word":"Mastery","translation":"Dominio","example":"Aim for mastery."},{"word":"Refined","translation":"Refinado","example":"This sounds refined."},{"word":"Insight","translation":"Perspectiva","example":"Give me deeper insight."}],"dialogue":[{"speaker":"Tutor","line":"Make it persuasive.","translation":"Frase modelo"},{"speaker":"Student","line":"Refine the style.","translation":"Respuesta guiada"}],"reading":{"text":"Expert tutoring helps refine complex communication by balancing clarity, persuasion, elegance and audience awareness.","questions":["What does expert tutoring refine?","What four qualities are balanced?","Who must be considered?"]},"exercises":[{"type":"mcq","prompt":"¿Qué significa \"Persuasive\"?","options":["Persuasivo","Elegante","Retórica","Dominio"],"answer":0},{"type":"writing","prompt":"Pide una versión elegante y persuasiva de una idea.","answer":"Open answer"},{"type":"speaking","prompt":"Lee en voz alta: Make it persuasive.","answer":"Oral practice"}],"xp_reward":10}'::jsonb
) on conflict (slug) do update set
  target_language = excluded.target_language,
  level = excluded.level,
  skill = excluded.skill,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  is_free = excluded.is_free,
  is_published = excluded.is_published,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  tags = excluded.tags,
  keywords = excluded.keywords,
  content_json = excluded.content_json,
  updated_at = now();


-- =========================================================
-- 202607060005_access_pricing_rules.sql
-- =========================================================
-- ANDERGO Access and Pricing Rules
-- Migration: 202607060005_access_pricing_rules
-- Rule: one simple premium price only: USD 5.95.
-- Free access: 3 lessons per level from A1 to B2; 1 free lesson for C1 and C2.

alter table public.lessons
  add column if not exists access_tier text not null default 'free'
    check (access_tier in ('free','premium')),
  add column if not exists payment_price_usd numeric(6,2) not null default 5.95
    check (payment_price_usd >= 0);

create table if not exists public.billing_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  price_usd numeric(6,2) not null check (price_usd >= 0),
  billing_interval text not null default 'month' check (billing_interval in ('month','year','one_time')),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.billing_plans (
  slug,
  name,
  price_usd,
  billing_interval,
  description,
  is_active
) values (
  'andergo-premium-usd-595',
  'ANDERGO Premium',
  5.95,
  'month',
  'Un solo plan: USD 5.95 para desbloquear las lecciones premium de todos los idiomas y niveles.',
  true
)
on conflict (slug) do update set
  name = excluded.name,
  price_usd = excluded.price_usd,
  billing_interval = excluded.billing_interval,
  description = excluded.description,
  is_active = excluded.is_active,
  updated_at = now();

with ranked_lessons as (
  select
    id,
    level,
    row_number() over (
      partition by target_language, level
      order by order_index asc, slug asc
    ) as lesson_rank
  from public.lessons
)
update public.lessons l
set
  is_free = case
    when r.level in ('C1','C2') then r.lesson_rank <= 1
    else r.lesson_rank <= 3
  end,
  access_tier = case
    when r.level in ('C1','C2') and r.lesson_rank <= 1 then 'free'
    when r.level not in ('C1','C2') and r.lesson_rank <= 3 then 'free'
    else 'premium'
  end,
  payment_price_usd = 5.95,
  updated_at = now()
from ranked_lessons r
where l.id = r.id;

alter table public.billing_plans enable row level security;

drop policy if exists "Public can read active billing plans" on public.billing_plans;
create policy "Public can read active billing plans"
  on public.billing_plans
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Service role can manage billing plans" on public.billing_plans;
create policy "Service role can manage billing plans"
  on public.billing_plans
  for all
  to service_role
  using (true)
  with check (true);

grant select on public.billing_plans to anon, authenticated;
grant select, insert, update, delete on public.billing_plans to service_role;
grant select on public.lessons to anon, authenticated;
grant select, insert, update, delete on public.lessons to service_role;
