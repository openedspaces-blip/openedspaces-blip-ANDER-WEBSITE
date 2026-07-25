-- Reconciliation marker for the English C1 scientific-social course.
--
-- Content is authored in scripts/content/english-c1-units.js, flattened by
-- scripts/build-english-c1-seed.js and applied transactionally by
-- scripts/migrate-english-c1-units.js.

do $$
declare
  course_id uuid;
  unit_count integer;
  lesson_count integer;
  reading_count integer;
  vocabulary_count integer;
  grammar_count integer;
begin
  select course.id
    into course_id
  from public.courses course
  join public.languages language on language.id = course.language_id
  join public.levels level on level.id = course.level_id
  where language.code = 'english'
    and level.code = 'C1';

  if course_id is null then
    raise exception 'English C1 is missing; run scripts/migrate-english-c1-units.js first';
  end if;

  select
    count(distinct lesson.unit_id),
    count(*),
    count(*) filter (where lesson.skill = 'reading'),
    count(*) filter (where lesson.skill = 'vocabulary'),
    count(*) filter (where lesson.skill = 'grammar')
  into
    unit_count,
    lesson_count,
    reading_count,
    vocabulary_count,
    grammar_count
  from public.course_lessons lesson
  where lesson.course_id = course_id;

  if unit_count <> 12
    or lesson_count <> 36
    or reading_count <> 12
    or vocabulary_count <> 12
    or grammar_count <> 12
  then
    raise exception
      'Incomplete English C1: units=%, lessons=%, reading=%, vocabulary=%, grammar=%',
      unit_count, lesson_count, reading_count, vocabulary_count, grammar_count;
  end if;
end
$$;
