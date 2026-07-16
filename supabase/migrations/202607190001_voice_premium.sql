-- =========================================================
-- 202607190001_voice_premium.sql
-- =========================================================
-- Additive-only: adds subscription status/expiry to public.profiles
-- (access_tier already exists, from 202607080001_gamification.sql, and
-- becomes "subscription.plan") and a per-user daily voice-usage counter
-- table for the AI Tutor's spoken replies. Nothing here changes the
-- meaning of any existing column/row.

alter table public.profiles
  add column if not exists subscription_status text not null default 'active'
    check (subscription_status in ('active', 'canceled', 'past_due')),
  add column if not exists subscription_expires_at timestamptz;

comment on column public.profiles.subscription_status is 'Together with access_tier (plan) and subscription_expires_at, this is what the backend checks before granting Premium voice - never trust a client-supplied "premium" flag alone.';
comment on column public.profiles.subscription_expires_at is 'Null means no expiry (e.g. a one-time unlock). Otherwise Premium access requires this to be in the future.';

-- Mirrors public.user_streaks (202607120001_normalized_courses_schema.sql):
-- one row per user, daily counters reset by the server on read. Only the
-- service role can write to it - the browser can never modify its own quota.
create table if not exists public.user_voice_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  voice_requests_today integer not null default 0,
  last_voice_usage_date date,
  updated_at timestamptz not null default now()
);

alter table public.user_voice_usage enable row level security;

drop policy if exists "Users read own voice usage" on public.user_voice_usage;
create policy "Users read own voice usage" on public.user_voice_usage for select using (auth.uid() = user_id);
drop policy if exists "Service role manages voice usage" on public.user_voice_usage;
create policy "Service role manages voice usage" on public.user_voice_usage for all using (auth.role() = 'service_role');

drop trigger if exists trg_user_voice_usage_updated_at on public.user_voice_usage;
create trigger trg_user_voice_usage_updated_at before update on public.user_voice_usage
  for each row execute function public.set_updated_at();
