-- =========================================================
-- 202607130001_goal_completed_at.sql
-- =========================================================
-- Lets a learner mark their current goal (public.user_goals, one row per
-- user) as completed without deleting it, so the "Mi objetivo actual" card
-- can show a completion state. Safe to run more than once.

alter table public.user_goals
  add column if not exists completed_at timestamptz;

comment on column public.user_goals.completed_at is
  'When the learner marked their current goal as completed (null = still active). Reset to null every time a goal is (re)selected via upsert.';

-- No RLS/policy changes needed: plain column on public.user_goals, already
-- covered by the existing owner-only select/insert/update policies from
-- 202607120001_normalized_courses_schema.sql (auth.uid() = user_id); writes
-- only ever happen server-side via the service-role client anyway.
