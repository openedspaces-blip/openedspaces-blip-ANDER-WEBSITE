-- Paddle Billing webhook state and subscription source of truth.
--
-- This migration is intentionally additive. ANDERGO's legacy provider_*
-- columns remain available while Paddle-native fields become authoritative
-- for Premium access. Existing subscription history is preserved.

alter table public.subscriptions
  add column if not exists paddle_customer_id text,
  add column if not exists paddle_subscription_id text,
  add column if not exists paddle_transaction_id text,
  add column if not exists paddle_price_id text,
  add column if not exists plan text,
  add column if not exists is_premium boolean not null default false,
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists last_paddle_event_at timestamptz;

alter table public.subscriptions
  drop constraint if exists subscriptions_status_check,
  drop constraint if exists subscriptions_billing_cycle_check,
  drop constraint if exists subscriptions_plan_check;

alter table public.subscriptions
  add constraint subscriptions_status_check
    check (
      status in (
        'active',
        'trialing',
        'past_due',
        'paused',
        'canceled',
        'expired',
        'inactive'
      )
    ),
  add constraint subscriptions_billing_cycle_check
    check (billing_cycle in ('none', 'monthly', 'quarterly', 'yearly')),
  add constraint subscriptions_plan_check
    check (plan is null or plan in ('monthly', 'quarterly'));

-- Preserve Premium access already represented by a valid legacy Premium
-- subscription. This avoids downgrading existing users when subscriptions
-- becomes the entitlement source of truth.
update public.subscriptions as subscription
set
  is_premium = subscription.status in ('active', 'trialing'),
  current_period_start = coalesce(
    subscription.current_period_start,
    subscription.started_at
  ),
  current_period_end = coalesce(
    subscription.current_period_end,
    subscription.expires_at
  ),
  cancel_at_period_end = coalesce(
    subscription.cancel_at_period_end,
    subscription.cancelled_at is not null
  )
from public.plans as plan
where subscription.plan_id = plan.id
  and plan.slug = 'premium';

-- Backfill Paddle-native references for rows written by the earlier
-- provider-agnostic integration.
update public.subscriptions
set
  paddle_customer_id = coalesce(
    paddle_customer_id,
    provider_customer_id
  ),
  paddle_subscription_id = coalesce(
    paddle_subscription_id,
    provider_subscription_id
  ),
  plan = coalesce(
    plan,
    case
      when billing_cycle = 'quarterly' then 'quarterly'
      else 'monthly'
    end
  )
where provider = 'paddle';

create unique index if not exists idx_subscriptions_paddle_subscription_id
  on public.subscriptions(paddle_subscription_id)
  where paddle_subscription_id is not null;

create index if not exists idx_subscriptions_user_premium
  on public.subscriptions(user_id, created_at desc)
  where is_premium = true;

create table if not exists public.paddle_webhook_events (
  id uuid primary key default gen_random_uuid(),
  paddle_event_id text not null unique,
  event_type text not null,
  occurred_at timestamptz,
  processed_at timestamptz not null default now()
);

alter table public.paddle_webhook_events
  add column if not exists paddle_event_id text,
  add column if not exists event_type text,
  add column if not exists occurred_at timestamptz,
  add column if not exists processed_at timestamptz not null default now();

-- The table-level UNIQUE constraint above owns the canonical event-id
-- index. Remove an earlier redundant index if this migration was retried.
drop index if exists public.idx_paddle_webhook_events_event_id;

alter table public.subscriptions enable row level security;

drop policy if exists "Users read own subscriptions" on public.subscriptions;
drop policy if exists "Users can view own subscription" on public.subscriptions;
create policy "Users read own subscriptions"
  on public.subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Service role manages subscriptions" on public.subscriptions;
create policy "Service role manages subscriptions"
  on public.subscriptions
  for all
  to service_role
  using (true)
  with check (true);

grant select on public.subscriptions to authenticated;
grant select, insert, update, delete on public.subscriptions to service_role;

alter table public.paddle_webhook_events enable row level security;

drop policy if exists "Service role manages Paddle webhook events"
  on public.paddle_webhook_events;
create policy "Service role manages Paddle webhook events"
  on public.paddle_webhook_events
  for all
  to service_role
  using (true)
  with check (true);

revoke all on public.paddle_webhook_events from anon, authenticated;
grant select, insert, update, delete
  on public.paddle_webhook_events
  to service_role;

comment on table public.paddle_webhook_events is
  'Verified Paddle event IDs. The unique event ID makes webhook retries idempotent.';

comment on column public.subscriptions.is_premium is
  'Authoritative Premium entitlement. Only active or trialing Paddle states are true; past_due, paused, canceled and unknown states are false.';

comment on column public.subscriptions.last_paddle_event_at is
  'Timestamp of the newest Paddle event applied to this row; older out-of-order events are ignored.';
