-- ANDERGO Access and Pricing Rules
-- Migration: 202607060005_access_pricing_rules
-- Rule: one simple premium price only: USD 5.95.
-- Free access: 3 lessons per level from A1 to B2; 1 free lesson for C1 and C2.

alter table public.lessons
  add column if not exists access_tier text not null default 'free'
    check (access_tier in ('free','premium')),
  add column if not exists payment_price_usd numeric(6,2) not null default 5.95
    check (payment_price_usd >= 0);

create table if not exists public.billing_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  price_usd numeric(6,2) not null check (price_usd >= 0),
  billing_interval text not null default 'month' check (billing_interval in ('month','year','one_time')),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.billing_plans (
  slug,
  name,
  price_usd,
  billing_interval,
  description,
  is_active
) values (
  'andergo-premium-usd-595',
  'ANDERGO Premium',
  5.95,
  'month',
  'Un solo plan: USD 5.95 para desbloquear las lecciones premium de todos los idiomas y niveles.',
  true
)
on conflict (slug) do update set
  name = excluded.name,
  price_usd = excluded.price_usd,
  billing_interval = excluded.billing_interval,
  description = excluded.description,
  is_active = excluded.is_active,
  updated_at = now();

with ranked_lessons as (
  select
    id,
    level,
    row_number() over (
      partition by target_language, level
      order by order_index asc, slug asc
    ) as lesson_rank
  from public.lessons
)
update public.lessons l
set
  is_free = case
    when r.level in ('C1','C2') then r.lesson_rank <= 1
    else r.lesson_rank <= 3
  end,
  access_tier = case
    when r.level in ('C1','C2') and r.lesson_rank <= 1 then 'free'
    when r.level not in ('C1','C2') and r.lesson_rank <= 3 then 'free'
    else 'premium'
  end,
  payment_price_usd = 5.95,
  updated_at = now()
from ranked_lessons r
where l.id = r.id;

alter table public.billing_plans enable row level security;

drop policy if exists "Public can read active billing plans" on public.billing_plans;
create policy "Public can read active billing plans"
  on public.billing_plans
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Service role can manage billing plans" on public.billing_plans;
create policy "Service role can manage billing plans"
  on public.billing_plans
  for all
  to service_role
  using (true)
  with check (true);

grant select on public.billing_plans to anon, authenticated;
grant select, insert, update, delete on public.billing_plans to service_role;
grant select on public.lessons to anon, authenticated;
grant select, insert, update, delete on public.lessons to service_role;
