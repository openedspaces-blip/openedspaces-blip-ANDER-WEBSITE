-- =========================================================
-- 202607230001_grammar_test_attempts.sql
-- =========================================================
-- Per-attempt history for scored Grammar tests (course_lessons.extra.
-- grammarTest, see lib/grammarTestSanitizer.js and
-- lib/courseLessonsService.js#gradeExercises/completeLesson).
-- public.user_lesson_progress (202607120001_normalized_courses_schema.sql)
-- only tracks a running best_score + attempts_count per user+lesson - it
-- has no room for "what did attempt #2 actually answer, and when". This
-- table is purely additive: it's only ever inserted into for lessons that
-- have a grammarTest, every other skill/lesson is unaffected.

create table if not exists public.grammar_test_attempts (
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

create index if not exists grammar_test_attempts_user_lesson_idx
  on public.grammar_test_attempts (user_id, lesson_id, completed_at desc);

alter table public.grammar_test_attempts enable row level security;

-- Same per-user read model as user_lesson_progress/user_exercise_attempts:
-- a learner can see their own attempt history, only the service role
-- (lib/courseLessonsService.js#completeLesson) can write.
drop policy if exists "Users read own grammar test attempts" on public.grammar_test_attempts;
create policy "Users read own grammar test attempts" on public.grammar_test_attempts
  for select using (auth.uid() = user_id);
drop policy if exists "Service role manages grammar test attempts" on public.grammar_test_attempts;
create policy "Service role manages grammar test attempts" on public.grammar_test_attempts
  for all using (auth.role() = 'service_role');

comment on table public.grammar_test_attempts is
  'One row per Grammar test submission (date, submitted answers, per-question results, score). user_lesson_progress keeps only the running best_score/attempts_count; this table is the attempt-level history.';
