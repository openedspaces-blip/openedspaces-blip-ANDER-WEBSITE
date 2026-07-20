-- =========================================================
-- 202607260001_subscription_plans.sql
-- =========================================================
-- Evolves the single-price model from 202607060005_access_pricing_rules.sql
-- (public.billing_plans, one row at USD 5.95/month) into a proper
-- multi-plan structure: Free + Premium today, room for Premium Plus/
-- Family/Enterprise/Schools/Teachers later without another rewrite.
--
-- public.plans.monthly_price_usd/yearly_price_usd are informational/admin
-- visibility only (and future Stripe price-id sync) - the app's canonical
-- source for price/limits/features is lib/plansConfig.js (read via
-- lib/planService.js). Never read these columns to gate a feature; that
-- decision still goes through profiles.access_tier/subscription_status/
-- subscription_expires_at via lib/voiceAccessService.js's isPremiumActive(),
-- unchanged by this migration.
--
-- public.subscriptions is new: an event/history table (one row per
-- subscription "episode": started, changed cycle, canceled, expired),
-- the future target for Stripe/PayPal webhooks. public.profiles keeps
-- being the fast-path cache every existing server-side check already
-- reads - this migration does not touch its meaning or its readers.

-- ---------------------------------------------------------------------
-- plans (rename billing_plans if present, else create fresh)
-- ---------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'billing_plans'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'plans'
  ) then
    alter table public.billing_plans rename to plans;
  end if;
end $$;

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  price_usd numeric(6,2) not null default 0 check (price_usd >= 0),
  billing_interval text not null default 'month' check (billing_interval in ('month','year','one_time')),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.plans
  add column if not exists monthly_price_usd numeric(6,2) check (monthly_price_usd >= 0),
  add column if not exists yearly_price_usd numeric(6,2) check (yearly_price_usd >= 0),
  add column if not exists features jsonb not null default '[]'::jsonb,
  -- Nullable, unused until a gateway is wired in (see lib/billingService.js).
  add column if not exists stripe_product_id text,
  add column if not exists stripe_price_id_monthly text,
  add column if not exists stripe_price_id_yearly text;

comment on column public.plans.monthly_price_usd is 'Informational/admin-visibility only - never read by an entitlement or usage-limit check. Canonical price/limits/features source is lib/plansConfig.js.';
comment on column public.plans.yearly_price_usd is 'See monthly_price_usd comment - same informational-only rule.';
comment on column public.plans.features is 'Marketing feature list for the pricing card/paywall modal, mirrors lib/plansConfig.js features - display only, never checked in access logic.';

insert into public.plans (
  slug, name, price_usd, billing_interval, description, is_active,
  monthly_price_usd, yearly_price_usd, features
) values
  (
    'free',
    'Free',
    0,
    'month',
    'Acceso gratuito: parte de los cursos, lecturas y gramática básica, Tutor IA (30 consultas/mes) y conversación por voz (10/mes).',
    true,
    0,
    0,
    '["Parte de los cursos","Lecturas básicas","Gramática básica","Listening básico","Speaking básico","Text-to-Speech","Traductor","Flashcards","Vocabulario","Tutor IA: 30 consultas/mes","Conversación por voz: 10/mes"]'::jsonb
  ),
  (
    'premium',
    'ANDERGO Premium',
    4.99,
    'month',
    'Acceso completo: todos los idiomas y niveles, Tutor IA y voz sin límites, corrección de pronunciación y certificados.',
    true,
    4.99,
    39.99,
    '["Todos los idiomas","Todos los niveles","Todo Reading","Todo Grammar","Todo Vocabulary","Todo Listening","Todo Speaking","Diálogos completos","Tutor IA ilimitado","Conversación por voz ilimitada","Corrección de pronunciación","Text-to-Speech","Traducción","Flashcards","Estadísticas completas","Certificados","Futuras funciones Premium"]'::jsonb
  )
on conflict (slug) do update set
  name = excluded.name,
  price_usd = excluded.price_usd,
  billing_interval = excluded.billing_interval,
  description = excluded.description,
  is_active = excluded.is_active,
  monthly_price_usd = excluded.monthly_price_usd,
  yearly_price_usd = excluded.yearly_price_usd,
  features = excluded.features,
  updated_at = now();

-- Retires the old single-price row (USD 5.95/month) from
-- 202607060005_access_pricing_rules.sql, now superseded by the 'premium'
-- row above - kept in the table (not deleted) so any historical reference
-- by id still resolves, just no longer offered.
update public.plans set is_active = false, updated_at = now()
where slug = 'andergo-premium-usd-595';

alter table public.plans enable row level security;

drop policy if exists "Public can read active billing plans" on public.plans;
drop policy if exists "Public can read active plans" on public.plans;
create policy "Public can read active plans"
  on public.plans for select to anon, authenticated using (is_active = true);

drop policy if exists "Service role can manage billing plans" on public.plans;
drop policy if exists "Service role can manage plans" on public.plans;
create policy "Service role can manage plans"
  on public.plans for all to service_role using (true) with check (true);

grant select on public.plans to anon, authenticated;
grant select, insert, update, delete on public.plans to service_role;

-- ---------------------------------------------------------------------
-- subscriptions (new)
-- ---------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'active'
    check (status in ('active', 'trialing', 'canceled', 'past_due', 'expired')),
  billing_cycle text not null default 'none'
    check (billing_cycle in ('none', 'monthly', 'yearly')),
  -- Nullable, unused until a gateway is wired in (see lib/billingService.js).
  provider text check (provider in ('stripe', 'paypal')),
  provider_customer_id text,
  provider_subscription_id text,
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);

-- At most one non-terminal subscription per user - prevents a double
-- upgrade/webhook race from ever leaving two "active" rows to reconcile.
create unique index if not exists idx_subscriptions_one_open_per_user
  on public.subscriptions(user_id)
  where status in ('active', 'trialing', 'past_due');

alter table public.subscriptions enable row level security;

drop policy if exists "Users read own subscriptions" on public.subscriptions;
create policy "Users read own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);
drop policy if exists "Service role manages subscriptions" on public.subscriptions;
create policy "Service role manages subscriptions" on public.subscriptions
  for all using (auth.role() = 'service_role');

-- Explicit, minimal grants (RLS above still gates which rows/operations
-- each role can actually reach) - authenticated only needs to read its own
-- row; every write goes through lib/subscriptionService.js's service-role
-- admin client.
grant select on public.subscriptions to authenticated;
grant select, insert, update, delete on public.subscriptions to service_role;

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

comment on table public.subscriptions is
  'Subscription history (one row per episode: started, plan/cycle change, canceled, expired) - the future target for Stripe/PayPal webhooks via lib/billingService.js. public.profiles.access_tier/subscription_status/subscription_expires_at stays the fast-path read cache every existing check (lib/voiceAccessService.js isPremiumActive, lib/entitlementsService.js, lib/usageLimitService.js, lib/courseLessonsService.js) already uses - this table is written alongside it by lib/subscriptionService.js, never instead of it.';

-- ---------------------------------------------------------------------
-- Closes a pre-existing gap: "Users can update own profile" from
-- 202607020001_andergo_profiles.sql is `for update using (auth.uid() = id)`
-- with no column restriction, and GRANT UPDATE ON public.profiles TO
-- authenticated is table-wide - so a client calling the Supabase REST API
-- directly with their own JWT (bypassing this app's Express backend
-- entirely) could currently do
-- `update profiles set access_tier='premium', role='ceo' where id=auth.uid()`
-- and self-grant Premium/CEO. Never exploitable through this app's own
-- frontend (it only ever talks to Supabase through lib/server.js's
-- service-role admin client - see lib/supabaseClient.js), but RLS is the
-- only enforcement Postgres itself provides, so it must not depend on the
-- frontend never doing that. This trigger makes the four billing/role
-- columns unwritable by anything other than the service role, regardless
-- of caller.
create or replace function public.prevent_self_serve_billing_changes()
returns trigger as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if new.access_tier is distinct from old.access_tier
     or new.subscription_status is distinct from old.subscription_status
     or new.subscription_expires_at is distinct from old.subscription_expires_at
     or new.role is distinct from old.role then
    raise exception 'access_tier/subscription_status/subscription_expires_at/role can only be changed by the server.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_profiles_prevent_self_serve_billing on public.profiles;
create trigger trg_profiles_prevent_self_serve_billing
  before update on public.profiles
  for each row execute function public.prevent_self_serve_billing_changes();
