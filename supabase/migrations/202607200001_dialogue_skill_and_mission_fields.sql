-- =========================================================
-- 202607200001_dialogue_skill_and_mission_fields.sql
-- =========================================================
-- Two additive, backward-compatible changes to public.course_lessons
-- needed for French A1 (see scripts/content/french-a1-units.js and
-- scripts/migrate-french-a1-units.js):
--
-- 1. mission/grammar_note/phrases columns. Today, once a course is
--    migrated into this normalized schema, courseLessonsService.loadLessonFull
--    only reconstructs {intro, vocabulary, dialogue, reading, exercises} from
--    lesson_sections - content_json.mission/grammar/phrases (the actual
--    task/grammar-note text authored per activity) are silently dropped,
--    leaving Speaking/Writing/Grammar's core instructions blank once served
--    from Supabase. These columns are nullable and unused by any existing
--    row, so this changes nothing for English A1 unless it is re-migrated.
--
-- 2. Widens the course_lessons.skill CHECK constraint to allow 'dialogue',
--    the new standalone Dialogues activity type (see the new
--    renderDialogueView in src/js/script.js). Existing rows are unaffected.

alter table public.course_lessons
  add column if not exists mission text,
  add column if not exists grammar_note text,
  add column if not exists phrases jsonb;

alter table public.course_lessons drop constraint if exists course_lessons_skill_check;
alter table public.course_lessons add constraint course_lessons_skill_check
  check (skill in ('listening', 'speaking', 'reading', 'writing', 'grammar', 'vocabulary', 'dialogue'));
