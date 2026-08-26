-- PayPal: idempotent webhook processing.

create table if not exists public.paypal_webhook_events (
  id uuid primary key default gen_random_uuid(),
  paypal_event_id text not null unique,
  event_type text not null,
  occurred_at timestamptz,
  processed_at timestamptz not null default now()
);

alter table public.paypal_webhook_events enable row level security;

drop policy if exists "Service role manages PayPal webhook events"
  on public.paypal_webhook_events;
create policy "Service role manages PayPal webhook events"
  on public.paypal_webhook_events
  for all
  to service_role
  using (true)
  with check (true);

revoke all on public.paypal_webhook_events from anon, authenticated;
grant select, insert, update, delete
  on public.paypal_webhook_events
  to service_role;

comment on table public.paypal_webhook_events is
  'Verified PayPal event IDs. The unique event ID makes webhook retries idempotent.';
