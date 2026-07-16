-- =========================================================
-- 202607180001_reading_parts.sql
-- =========================================================
-- Additive-only: lets a reading's lesson_sections row hold a paginated
-- 3-part text (reading_parts) and a client-side "order these events"
-- activity (reading_ordering), and widens exercises.type to add 'ordering'
-- as a real, server-graded exercise type (see lib/courseLessonsService.js
-- checkAnswer/gradeExercises). Nothing here changes the meaning of any
-- existing column/row - every reading without these new fields (every
-- other language, and any lesson authored before this migration) keeps
-- working exactly as before.

alter table public.lesson_sections add column if not exists reading_parts jsonb;
alter table public.lesson_sections add column if not exists reading_ordering jsonb;

alter table public.exercises drop constraint if exists exercises_type_check;
alter table public.exercises add constraint exercises_type_check
  check (type in ('mcq', 'writing', 'speaking', 'practice', 'ordering'));
