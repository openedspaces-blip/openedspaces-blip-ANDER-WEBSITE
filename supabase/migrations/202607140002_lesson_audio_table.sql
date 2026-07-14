-- =========================================================
-- 202607140002_lesson_audio_table.sql
-- =========================================================
-- Richer official-audio metadata table for Listening, per
-- docs/audio-architecture.md. Distinct from the simpler
-- `lessons.audio_url` column added in 202607110001_lesson_audio.sql
-- (that column/its generator script, scripts/generate-listening-audio.js,
-- are left untouched) - this table is what the new
-- GET /api/listening/audio endpoint reads from. Only rows with
-- status = 'published' are ever served to students.
--
-- Not applied by this session - run via your normal Supabase migration
-- flow when ready. No rows are seeded here.

create table if not exists public.lesson_audio (
  id uuid primary key default gen_random_uuid(),
  language text not null,
  level text not null check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  lesson_slug text not null,
  title text,
  source_type text not null default 'official' check (source_type in ('official', 'ai-generated')),
  speaker text,
  duration numeric,
  main_file_path text not null,
  slow_file_path text,
  transcript text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (language, level, lesson_slug)
);

create index if not exists lesson_audio_lookup_idx
  on public.lesson_audio (language, level, lesson_slug)
  where status = 'published';

comment on table public.lesson_audio is
  'Official Listening audio metadata. Files live in the lesson-audio Supabase Storage bucket, never in git. Only status=published rows are served to students.';
