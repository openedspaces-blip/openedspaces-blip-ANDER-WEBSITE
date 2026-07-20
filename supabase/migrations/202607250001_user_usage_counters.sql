-- =========================================================
-- 202607250001_user_usage_counters.sql
-- =========================================================
-- Generic monthly usage counter, one row per user+feature+month. Backs
-- lib/usageLimitService.js, used by two features that both reset on the
-- same calendar-month period: the AI Tutor's free-tier query cap
-- (feature='tutor_query', 30/month) and its voice-reply cap
-- (feature='tutor_voice', 10/month, replacing the old daily/per-turn
-- limit in public.user_voice_usage - see lib/voiceAccessService.js).
-- A single generic table instead of two near-identical ones, since both
-- share the same shape (user, feature, calendar-month period, count) -
-- mirrors the "generic catch-all over one-off tables" reasoning already
-- used for course_lessons.extra (202607220001_rich_listening_content.sql).

create table if not exists public.user_usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null check (feature in ('tutor_query', 'tutor_voice')),
  -- Calendar month, 'YYYY-MM' (UTC) - matches lib/usageLimitService.js's
  -- own period key computation, not a Postgres date/timestamp, so the
  -- app is the single source of truth for "what period is this".
  period text not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, feature, period)
);

create index if not exists user_usage_counters_lookup_idx
  on public.user_usage_counters (user_id, feature, period);

alter table public.user_usage_counters enable row level security;

drop policy if exists "Users read own usage counters" on public.user_usage_counters;
create policy "Users read own usage counters" on public.user_usage_counters
  for select using (auth.uid() = user_id);
drop policy if exists "Service role manages usage counters" on public.user_usage_counters;
create policy "Service role manages usage counters" on public.user_usage_counters
  for all using (auth.role() = 'service_role');

drop trigger if exists trg_user_usage_counters_updated_at on public.user_usage_counters;
create trigger trg_user_usage_counters_updated_at before update on public.user_usage_counters
  for each row execute function public.set_updated_at();

comment on table public.user_usage_counters is
  'Generic monthly per-user/per-feature usage counter (lib/usageLimitService.js). Only incremented after a real successful use (server accepted + provider returned a valid result), never on validation/server/timeout/provider failure.';
