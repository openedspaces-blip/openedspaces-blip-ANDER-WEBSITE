-- =========================================================
-- 202607240001_listening_comprehension_attempts.sql
-- =========================================================
-- Per-attempt history for scored Listening Comprehension tests
-- (course_lessons.extra.listeningComprehension), mirroring
-- 202607230001_grammar_test_attempts.sql exactly - same shape/sanitizer/
-- grading path (lib/grammarTestSanitizer.js,
-- lib/courseLessonsService.js#gradeQuestionBank/completeLesson), just a
-- separate table so a lesson's Grammar and Listening attempt history never
-- mix. Purely additive: only ever inserted into for lessons that have a
-- listeningComprehension bank, every other lesson is unaffected.

create table if not exists public.listening_comprehension_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  attempt_number integer not null,
  score integer not null,
  correct_answers integer not null,
  total_questions integer not null,
  answers jsonb not null default '[]'::jsonb,
  results jsonb not null default '[]'::jsonb,
  is_best boolean not null default false,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists listening_comprehension_attempts_user_lesson_idx
  on public.listening_comprehension_attempts (user_id, lesson_id, completed_at desc);

alter table public.listening_comprehension_attempts enable row level security;

drop policy if exists "Users read own listening comprehension attempts" on public.listening_comprehension_attempts;
create policy "Users read own listening comprehension attempts" on public.listening_comprehension_attempts
  for select using (auth.uid() = user_id);
drop policy if exists "Service role manages listening comprehension attempts" on public.listening_comprehension_attempts;
create policy "Service role manages listening comprehension attempts" on public.listening_comprehension_attempts
  for all using (auth.role() = 'service_role');

comment on table public.listening_comprehension_attempts is
  'One row per scored Listening Comprehension submission (date, submitted answers, per-question results, score). Mirrors grammar_test_attempts for course_lessons.extra.listeningComprehension.';
