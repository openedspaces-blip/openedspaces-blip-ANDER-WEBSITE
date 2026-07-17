-- =========================================================
-- 202607220001_rich_listening_content.sql
-- =========================================================
-- Additive, backward-compatible schema needed for Español A1's richer
-- Listening skill (listeningType, phoneticSupport, dictation-by-segment,
-- a third "very slow" audio speed) - see scripts/content/spanish-a1-units.js
-- and lib/courseLessonsService.js#checkDictation. Mirrors the pattern
-- already used in 202607200001_dialogue_skill_and_mission_fields.sql
-- (nullable additions; existing rows/courses are unaffected).
--
-- Not applied by this session - run via your normal Supabase migration
-- flow when ready.

-- 1. Generic catch-all for structured pedagogical fields that don't need
--    their own column (listeningType, difficulty, durationSeconds,
--    speakers, phoneticSupport, wordTarget, rubric, wordBank,
--    structureHint, commonMistakes, dictationSegmentCount...). Deliberately
--    a single jsonb column instead of one column per field: these fields
--    are read-only display/UI data (never used in a WHERE clause), and a
--    single additive column keeps this migration reusable by any future
--    course instead of Spanish-specific.
alter table public.course_lessons add column if not exists extra jsonb;

-- 2. Third audio speed tier for Listening (spec: normal / lento / muy
--    lento). Existing rows keep very_slow_file_path null and the player
--    falls back to a client-side playbackRate reduction, same as it
--    already does today for slow_file_path.
alter table public.lesson_audio add column if not exists very_slow_file_path text;

-- 3. Per-segment dictation content. `text` is intentionally NOT exposed to
--    anon/authenticated roles (same protection model as
--    exercise_options.is_correct, see 202607120001_normalized_courses_schema.sql)
--    so a learner can't read the correct transcript before attempting the
--    dictation - grading happens server-side via
--    lib/courseLessonsService.js#checkDictation, which uses the service
--    role to read this table directly.
create table if not exists public.lesson_dictation_segments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  order_index integer not null default 0,
  text text not null,
  start_time numeric,
  end_time numeric,
  normal_file_path text,
  slow_file_path text,
  very_slow_file_path text,
  created_at timestamptz not null default now()
);

create index if not exists lesson_dictation_segments_lesson_idx
  on public.lesson_dictation_segments (lesson_id, order_index);

alter table public.lesson_dictation_segments enable row level security;
-- Deliberately no select policy for anon/authenticated: only the
-- service-role client (getSupabaseAdmin()) can read this table, same as
-- exercise_options. The API only ever returns segment id/order/audio
-- paths (see courseLessonsService.js#loadLessonFull) plus, after grading,
-- the per-segment correctness computed server-side.

comment on table public.lesson_dictation_segments is
  'Dictation segment text + per-speed audio paths for a Listening lesson. text is service-role-only; never sent to the client before grading (see checkDictation).';
comment on column public.course_lessons.extra is
  'Catch-all jsonb for rich, read-only pedagogical fields (listeningType, phoneticSupport, difficulty, durationSeconds, speakers, wordTarget, rubric, wordBank, structureHint, commonMistakes). Additive; null on any pre-existing row.';
