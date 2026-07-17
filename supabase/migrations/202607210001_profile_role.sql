-- =========================================================
-- 202607210001_profile_role.sql
-- =========================================================
-- Adds an authorization role to public.profiles, separate from
-- access_tier (plan/billing) and separate from username (a display
-- identity that is user-changeable and must never gate permissions).
-- Additive-only and safe to run more than once:
--   - role defaults to 'student', so every existing row is unaffected.
--   - handle_new_user() already omits role from its INSERT list, so new
--     signups get the column default without needing that trigger touched.

alter table public.profiles
  add column if not exists role text not null default 'student'
    check (role in ('student', 'ceo'));

comment on column public.profiles.role is 'Authorization role, set only by server-side admin operations (see scripts/configure-ceo-account.js) - never derived from username/email/client input. ''ceo'' grants full access regardless of access_tier; see lib/entitlementsService.js.';

create index if not exists idx_profiles_role on public.profiles(role);
