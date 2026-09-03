-- Learner-controlled email practice reminders.
-- Existing learners are deliberately opted out until they make a choice in
-- the platform. This keeps reminder emails consent-based.

alter table public.profiles
  add column if not exists last_seen_at timestamptz,
  add column if not exists practice_inactivity_reminders_enabled boolean not null default false,
  add column if not exists practice_scheduled_reminders_enabled boolean not null default false,
  add column if not exists practice_reminder_time time,
  add column if not exists practice_reminder_timezone text not null default 'America/Santo_Domingo',
  add column if not exists last_inactivity_reminder_for_seen_at timestamptz,
  add column if not exists last_scheduled_reminder_date date;

-- A pre-existing account should be treated as recently seen at the most
-- reliable activity timestamp available; it must never receive a surprise
-- reminder immediately after this migration.
update public.profiles
set last_seen_at = coalesce(last_seen_at, last_active_date::timestamptz, updated_at, created_at);

alter table public.profiles
  drop constraint if exists profiles_practice_reminder_timezone_check;
alter table public.profiles
  add constraint profiles_practice_reminder_timezone_check
  check (practice_reminder_timezone = 'America/Santo_Domingo');

alter table public.profiles
  drop constraint if exists profiles_practice_reminder_time_check;
alter table public.profiles
  add constraint profiles_practice_reminder_time_check
  check (
    (practice_scheduled_reminders_enabled = false)
    or practice_reminder_time is not null
  );

create index if not exists idx_profiles_practice_inactivity_reminders
  on public.profiles (last_seen_at)
  where practice_inactivity_reminders_enabled = true;

create index if not exists idx_profiles_practice_scheduled_reminders
  on public.profiles (practice_reminder_time)
  where practice_scheduled_reminders_enabled = true;

comment on column public.profiles.last_seen_at is 'Last authenticated platform visit, used only to schedule opt-in practice reminders.';
comment on column public.profiles.practice_inactivity_reminders_enabled is 'Whether this learner opted in to an email after three days away.';
comment on column public.profiles.practice_scheduled_reminders_enabled is 'Whether this learner opted in to a daily email at practice_reminder_time.';
