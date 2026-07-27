-- Paddle Billing: provider support plus idempotent webhook processing.

alter table public.subscriptions
  drop constraint if exists subscriptions_provider_check;

alter table public.subscriptions
  add constraint subscriptions_provider_check
  check (provider in ('stripe', 'paypal', 'paddle'));

drop policy if exists "Service role manages subscriptions" on public.subscriptions;
create policy "Service role manages subscriptions"
  on public.subscriptions
  for all
  to service_role
  using (true)
  with check (true);

create unique index if not exists idx_subscriptions_provider_reference
  on public.subscriptions(provider, provider_subscription_id)
  where provider is not null and provider_subscription_id is not null;

create table if not exists public.billing_webhook_events (
  id text primary key,
  provider text not null check (provider in ('paddle')),
  event_type text not null,
  occurred_at timestamptz,
  processed_at timestamptz not null default now()
);

alter table public.billing_webhook_events enable row level security;

drop policy if exists "Service role manages billing webhook events"
  on public.billing_webhook_events;
create policy "Service role manages billing webhook events"
  on public.billing_webhook_events
  for all
  to service_role
  using (true)
  with check (true);

revoke all on public.billing_webhook_events from anon, authenticated;
grant select, insert, update, delete on public.billing_webhook_events to service_role;

comment on table public.billing_webhook_events is
  'Processed payment-provider webhook IDs. The primary key prevents a retried Paddle notification from applying the same subscription transition twice.';
