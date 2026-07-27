-- Adds the read-only curriculum staff role. Authorization continues to be
-- resolved server-side from public.profiles; students never gain direct
-- access to the private curriculum mapping tables.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'teacher', 'ceo'));

comment on column public.profiles.role is
  'Server-managed authorization role. student uses the learner UI; teacher may access protected read-only curriculum reports; ceo retains administrative and Premium overrides.';
