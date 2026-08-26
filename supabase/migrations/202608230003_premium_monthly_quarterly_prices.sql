-- Keep the administrative plans record aligned with the public Premium offer.
-- Gateway plan IDs remain the authority for the actual charge amount.
alter table public.plans
  add column if not exists quarterly_price_usd numeric(6,2) check (quarterly_price_usd >= 0);

update public.plans
set
  price_usd = 7.00,
  monthly_price_usd = 7.00,
  quarterly_price_usd = 14.99,
  billing_interval = 'month',
  updated_at = now()
where slug = 'premium';

comment on column public.plans.quarterly_price_usd is
  'Informational/admin-visibility only. The configured PayPal plan is the source of the amount charged.';
