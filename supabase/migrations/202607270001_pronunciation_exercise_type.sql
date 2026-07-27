-- Advanced speaking lessons include a focused pronunciation checkpoint.
-- Keep the existing exercise types intact and extend the database contract
-- so those authored activities can be migrated and graded normally.

alter table public.exercises drop constraint if exists exercises_type_check;
alter table public.exercises add constraint exercises_type_check
  check (type in ('mcq', 'writing', 'speaking', 'practice', 'ordering', 'pronunciation'));
