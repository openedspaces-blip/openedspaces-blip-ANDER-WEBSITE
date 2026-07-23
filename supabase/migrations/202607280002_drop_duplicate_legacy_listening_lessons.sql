-- =========================================================
-- 202607280002_drop_duplicate_legacy_listening_lessons.sql
-- =========================================================
-- Listening audit finding: every English A1 Listening lesson (and French
-- A1's pilot unit) exists TWICE - once as a legacy public.lessons row
-- (content_json) and once as the real public.course_lessons row that
-- actually serves the app today (courseLessonsService.hasLesson() always
-- wins whenever a public.courses row exists for that language/level - see
-- lib/courseLessonsService.js#findLessonRowBySlug). The legacy rows below
-- are dead: never read, never written, just sitting there as a duplicate
-- source of truth with a DIFFERENT id than the row Listening actually uses.
--
-- Verified before writing this migration (read-only queries, no writes):
--   - Every id below is a public.lessons row whose slug also exists in
--     public.course_lessons with skill = 'listening'.
--   - Zero rows in public.lesson_completions or public.lesson_progress
--     reference any of these ids - no user history is lost.
--
-- Not applied by this session - run via your normal Supabase migration flow
-- once approved. Scoped deliberately narrow (skill='listening', exact id
-- list) rather than a broad "delete anything with a matching slug" so this
-- can never touch a row this audit didn't specifically verify.

delete from public.lessons
where skill = 'listening'
  and id in (
    '643276f7-b95b-4c2b-a684-06ee5e105131', -- english-a1-daily-routine-listening
    '278a1978-4bc2-41c6-93cd-6e4f3ce2bca1', -- french-a1-bonjour-et-bienvenue-listening
    '32188b75-a0fb-4eef-b4ce-2e27bea76544', -- english-a1-hello-listening
    'e305a699-49e3-4b3c-ac1d-28923c190065', -- english-a1-about-me-listening
    '07e170c7-793a-4728-9867-abcc268066b5', -- english-a1-family-and-friends-listening
    'f084baa7-a145-468e-a741-75c4252c48a6', -- english-a1-my-school-listening
    'b05349ba-9a71-4d8b-bd3d-38d67a000ac2', -- english-a1-time-and-dates-listening
    '05ea8233-829e-4826-a2c8-b11f780e35d3', -- english-a1-food-and-drinks-listening
    'efe9c134-766f-4f21-b993-d76de33bf373', -- english-a1-my-home-listening
    'c82f818d-8ac8-4112-8d3d-17b1eeef9044', -- english-a1-my-town-listening
    'd96efda4-5a69-4498-a7fe-c1575cac737d', -- english-a1-free-time-listening
    '63a1f55b-127f-49ae-b794-04897bd3c95d', -- english-a1-clothes-and-shopping-listening
    '1458e95b-f00b-469e-bd87-1fd4d00b3264'  -- english-a1-weather-and-travel-listening
  );

-- Left untouched on purpose (NOT duplicates - no matching course_lessons
-- row, so they're the only content for their language/level today):
-- english-a1-listening, english-a2-listening ("Listening Lab" placeholders)
-- and every english/french/spanish/german/italian-b1/b2/c1/c2-listening +
-- ai-*-listening placeholder row.
