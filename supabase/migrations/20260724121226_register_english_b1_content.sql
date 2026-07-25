-- Reconciliation marker for the English B1 content deployment.
--
-- The content itself is authored in scripts/content/english-b1-units.js
-- and scripts/content/english-b1-practice.js, flattened into the seed JSON,
-- and applied idempotently by scripts/migrate-english-b1-units.js.
--
-- This migration records the already-applied production state in Supabase's
-- migration history. On a new environment, run the B1 migration script first;
-- this assertion then prevents an incomplete course from being registered.

do $$
declare
  english_b1_course_id uuid;
  unit_count integer;
  lesson_count integer;
  reading_count integer;
  grammar_count integer;
  vocabulary_count integer;
begin
  select co.id
    into english_b1_course_id
  from public.courses co
  join public.languages language on language.id = co.language_id
  join public.levels level on level.id = co.level_id
  where language.code = 'english'
    and level.code = 'B1';

  if english_b1_course_id is null then
    raise exception 'English B1 course is not present; run scripts/migrate-english-b1-units.js first';
  end if;

  select
    count(distinct unit.id),
    count(lesson.id),
    count(lesson.id) filter (where lesson.skill = 'reading'),
    count(lesson.id) filter (where lesson.skill = 'grammar'),
    count(lesson.id) filter (where lesson.skill = 'vocabulary')
  into
    unit_count,
    lesson_count,
    reading_count,
    grammar_count,
    vocabulary_count
  from public.course_units unit
  join public.course_lessons lesson on lesson.unit_id = unit.id
  where unit.course_id = english_b1_course_id;

  if unit_count <> 12
    or lesson_count <> 72
    or reading_count <> 12
    or grammar_count <> 12
    or vocabulary_count <> 12
  then
    raise exception
      'Incomplete English B1 content: units=%, lessons=%, reading=%, grammar=%, vocabulary=%',
      unit_count, lesson_count, reading_count, grammar_count, vocabulary_count;
  end if;
end
$$;
