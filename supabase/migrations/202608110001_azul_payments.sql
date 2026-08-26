alter table public.subscriptions drop constraint if exists subscriptions_provider_check;
alter table public.subscriptions add constraint subscriptions_provider_check
  check (provider in ('stripe', 'paypal', 'azul'));

create table if not exists public.azul_payment_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  billing_cycle text not null check (billing_cycle in ('monthly', 'quarterly')),
  amount text not null,
  currency_code text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  azul_order_id text,
  authorization_code text,
  response_code text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.azul_payment_orders enable row level security;
revoke all on public.azul_payment_orders from anon, authenticated;
grant select, insert, update, delete on public.azul_payment_orders to service_role;
