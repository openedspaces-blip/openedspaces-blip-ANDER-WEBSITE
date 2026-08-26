-- Remove the retired Paddle integration from databases that previously ran
-- its additive migrations. Existing Paddle subscription records and webhook
-- receipts are intentionally discarded with the provider integration.

delete from public.subscriptions where provider = 'paddle';

drop table if exists public.paddle_webhook_events;
drop table if exists public.billing_webhook_events;

drop index if exists public.idx_subscriptions_paddle_subscription_id;

alter table public.subscriptions
  drop column if exists paddle_customer_id,
  drop column if exists paddle_subscription_id,
  drop column if exists paddle_transaction_id,
  drop column if exists paddle_price_id,
  drop column if exists last_paddle_event_at;

alter table public.subscriptions
  drop constraint if exists subscriptions_provider_check;

alter table public.subscriptions
  add constraint subscriptions_provider_check
  check (provider is null or provider in ('stripe', 'paypal', 'azul'));
