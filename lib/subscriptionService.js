// lib/subscriptionService.js
// Owns the lifecycle of a user's subscription: which plan/cycle they're on,
// changing plan, canceling, and building the summary the "My plan" screen
// and the paywall modal read. public.subscriptions is the history (one row
// per episode); public.profiles.access_tier/subscription_status/
// subscription_expires_at stays the fast-path cache every existing check
// (lib/voiceAccessService.js isPremiumActive, lib/entitlementsService.js,
// lib/usageLimitService.js, lib/courseLessonsService.js) already reads -
// changePlan() below writes both in the same call so neither ever drifts.
//
// Paddle webhooks now write public.subscriptions first, then mirror the
// result to profiles so older gated routes remain compatible.
const { getSupabaseAdmin } = require('./supabaseClient');
const plansConfig = require('./plansConfig');
const planService = require('./planService');
const usageLimitService = require('./usageLimitService');
const { getUserEntitlements } = require('./entitlementsService');

const PADDLE_PREMIUM_STATUSES = new Set(['active', 'trialing']);
const PADDLE_KNOWN_STATUSES = new Set([
  'active',
  'trialing',
  'past_due',
  'paused',
  'canceled',
  'expired',
  'inactive'
]);

function isPaddlePremiumStatus(status) {
  // past_due is deliberately false: access is restored only after Paddle
  // sends an active/trialing/resumed state. Unknown states fail closed.
  return PADDLE_PREMIUM_STATUSES.has(String(status || '').toLowerCase());
}

function virtualSubscription(userId, planSlug) {
  return {
    id: null,
    userId,
    planSlug,
    status: 'active',
    billingCycle: planSlug === plansConfig.DEFAULT_PLAN_SLUG ? 'none' : 'monthly',
    startedAt: null,
    expiresAt: null,
    cancelledAt: null
  };
}

// The subscription row currently in effect, or a synthesized shell when
// none exists - a brand-new user, or one who never upgraded, has no row at
// all, which is an expected state (see "usuario nuevo"/"usuario sin plan"
// in the test matrix), not an error. planSlugHint lets callers that already
// know the plan (via entitlements) avoid a second, possibly-inconsistent
// plan determination here.
async function getActiveSubscription(userId, { planSlugHint } = {}) {
  const fallbackSlug = planSlugHint || plansConfig.DEFAULT_PLAN_SLUG;
  if (!userId) return virtualSubscription(userId, fallbackSlug);

  const admin = getSupabaseAdmin();
  if (!admin) return virtualSubscription(userId, fallbackSlug);

  const { data: row } = await admin
    .from('subscriptions')
    .select(
      'id, status, plan, billing_cycle, current_period_start, current_period_end, cancel_at_period_end, is_premium, created_at'
    )
    .eq('user_id', userId)
    .eq('is_premium', true)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row) return virtualSubscription(userId, fallbackSlug);

  return {
    id: row.id,
    userId,
    planSlug: row.plan ? 'premium' : fallbackSlug,
    status: row.status,
    billingCycle: row.plan || row.billing_cycle,
    startedAt: row.current_period_start || row.created_at,
    expiresAt: row.current_period_end,
    cancelledAt: row.cancel_at_period_end ? row.current_period_end : null
  };
}

// Everything the "My plan" screen and the paywall modal need in one call:
// which plan is actually active right now (via the same entitlements check
// every gated route already trusts, never the subscriptions row's status
// alone - a webhook miss must not grant access a stale row implies), when
// it renews/expires, and this month's Tutor/voice usage against that plan's
// limits.
async function getSubscriptionSummary(userId) {
  const entitlements = await getUserEntitlements(userId);
  const planSlug = entitlements.isPremium ? 'premium' : plansConfig.DEFAULT_PLAN_SLUG;
  const plan = plansConfig.getPlan(planSlug);

  const [subscription, tutorQuery, paddleReference] = await Promise.all([
    getActiveSubscription(userId, { planSlugHint: planSlug }),
    usageLimitService.checkUsage({
      userId,
      feature: 'tutor_query',
      monthlyLimit: plansConfig.getFeatureLimit(planSlug, 'tutor_query')
    }),
    getPaddleSubscriptionReference(userId)
  ]);

  return {
    role: entitlements.role,
    plan: {
      slug: plan.slug,
      name: plan.name,
      monthlyPriceUsd: plan.monthlyPriceUsd,
      yearlyPriceUsd: plan.yearlyPriceUsd,
      features: plan.features
    },
    isPremium: entitlements.isPremium,
    status: subscription.status,
    billingCycle: subscription.billingCycle,
    expiresAt: subscription.expiresAt,
    cancelsAtPeriodEnd: Boolean(subscription.cancelledAt),
    canManageBilling: Boolean(
      paddleReference?.customerId && paddleReference?.subscriptionId
    ),
    usage: {
      tutorQuery
    }
  };
}

// Server-only Paddle identifiers for self-service billing actions. Never
// expose these identifiers directly to the browser; callers use the
// authenticated user ID supplied by requireAuth, preventing account-to-
// account subscription management (IDOR).
async function getPaddleSubscriptionReference(userId) {
  if (!userId) return null;
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase no está configurado.');

  const native = await admin
    .from('subscriptions')
    .select(
      'status, paddle_customer_id, paddle_subscription_id, current_period_end, cancel_at_period_end, created_at'
    )
    .eq('user_id', userId)
    .eq('provider', 'paddle')
    .not('paddle_subscription_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!native.error && native.data) {
    return {
      status: native.data.status,
      customerId: native.data.paddle_customer_id,
      subscriptionId: native.data.paddle_subscription_id,
      currentPeriodEnd: native.data.current_period_end,
      cancelAtPeriodEnd: Boolean(native.data.cancel_at_period_end)
    };
  }

  // Compatibility with installations that have not yet applied the
  // Paddle-native additive columns but already store provider references.
  const legacy = await admin
    .from('subscriptions')
    .select(
      'status, provider_customer_id, provider_subscription_id, expires_at, cancelled_at, created_at'
    )
    .eq('user_id', userId)
    .eq('provider', 'paddle')
    .not('provider_subscription_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (legacy.error) {
    throw new Error(`No se pudo consultar la suscripción Paddle: ${legacy.error.message}`);
  }
  if (!legacy.data) return null;
  return {
    status: legacy.data.status,
    customerId: legacy.data.provider_customer_id,
    subscriptionId: legacy.data.provider_subscription_id,
    currentPeriodEnd: legacy.data.expires_at,
    cancelAtPeriodEnd: Boolean(legacy.data.cancelled_at)
  };
}

// Moves a user onto a (possibly new) plan: closes any currently-open
// subscription row, inserts the new one, and mirrors the result onto
// profiles so every existing entitlement/usage check sees it on its very
// next read - no cache to invalidate. Not wired into any public route yet;
// this is what lib/billingService.js's future webhook handler calls once a
// gateway is connected, and what an admin script can call for a manual/comp
// upgrade in the meantime (same idea as scripts/configure-ceo-account.js).
async function changePlan({
  userId,
  planSlug,
  billingCycle = 'monthly',
  status = 'active',
  expiresAt = null,
  provider = null,
  providerCustomerId = null,
  providerSubscriptionId = null
}) {
  if (!userId) throw new Error('changePlan requires userId');
  if (!plansConfig.getPlan(planSlug)) throw new Error(`Unknown plan slug: ${planSlug}`);

  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase no está configurado.');

  const planId = await planService.getPlanIdBySlug(planSlug);
  if (!planId) throw new Error(`Plan '${planSlug}' no existe en public.plans.`);

  // Close out any currently-open row first - the partial unique index (one
  // open row per user) would otherwise reject the insert below.
  await admin
    .from('subscriptions')
    .update({ status: 'canceled', cancelled_at: new Date().toISOString() })
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'past_due']);

  const { data: subscription, error } = await admin
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      status,
      billing_cycle: planSlug === plansConfig.DEFAULT_PLAN_SLUG ? 'none' : billingCycle,
      expires_at: expiresAt,
      provider,
      provider_customer_id: providerCustomerId,
      provider_subscription_id: providerSubscriptionId
    })
    .select()
    .single();
  if (error) throw new Error(`No se pudo crear la suscripción: ${error.message}`);

  const { error: profileError } = await admin
    .from('profiles')
    .update({
      access_tier: planSlug === plansConfig.DEFAULT_PLAN_SLUG ? 'free' : 'premium',
      subscription_status: status === 'active' || status === 'trialing' ? 'active' : status,
      subscription_expires_at: expiresAt
    })
    .eq('id', userId);
  if (profileError) throw new Error(`No se pudo actualizar el perfil: ${profileError.message}`);

  return subscription;
}

// Marks the current subscription as canceled without downgrading access
// immediately - access naturally lapses at subscription_expires_at, via the
// same expiry check isPremiumActive() already does on every read. Matches
// the "no eliminar historial, no borrar conversaciones" rule: cancellation
// is recorded, access just quietly stops renewing.
async function cancelSubscription(userId) {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase no está configurado.');

  const { error } = await admin
    .from('subscriptions')
    .update({ cancelled_at: new Date().toISOString() })
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'past_due']);
  if (error) throw new Error(`No se pudo cancelar la suscripción: ${error.message}`);
}

// Idempotently mirrors the latest provider-owned subscription state into
// ANDERGO. Webhooks are the only caller: checkout completion in the browser
// never grants Premium access on its own.
async function syncProviderSubscription({
  userId,
  provider,
  providerCustomerId,
  providerSubscriptionId,
  billingCycle,
  status,
  expiresAt
}) {
  if (!userId || !providerSubscriptionId) {
    throw new Error('Provider subscription sync requires user and subscription IDs.');
  }

  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase no estÃ¡ configurado.');

  const normalizedStatus = ['active', 'trialing', 'past_due', 'paused', 'canceled', 'expired'].includes(status)
    ? status
    : 'past_due';
  const isOpen = ['active', 'trialing', 'past_due'].includes(normalizedStatus);
  const planId = await planService.getPlanIdBySlug('premium');
  if (!planId) throw new Error("Plan 'premium' no existe en public.plans.");

  const { data: existing } = await admin
    .from('subscriptions')
    .select('id')
    .eq('provider', provider)
    .eq('provider_subscription_id', providerSubscriptionId)
    .maybeSingle();

  if (!existing && isOpen) {
    await admin
      .from('subscriptions')
      .update({ status: 'canceled', cancelled_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'past_due']);
  }

  const payload = {
    user_id: userId,
    plan_id: planId,
    status: normalizedStatus,
    billing_cycle: billingCycle,
    provider,
    provider_customer_id: providerCustomerId || null,
    provider_subscription_id: providerSubscriptionId,
    expires_at: expiresAt || null,
    cancelled_at: isOpen ? null : new Date().toISOString()
  };

  const write = existing
    ? admin.from('subscriptions').update(payload).eq('id', existing.id).select().single()
    : admin.from('subscriptions').insert(payload).select().single();
  const { data: subscription, error } = await write;
  if (error) throw new Error(`No se pudo sincronizar la suscripción del proveedor: ${error.message}`);

  const { error: profileError } = await admin
    .from('profiles')
    .update({
      access_tier: isOpen ? 'premium' : 'free',
      subscription_status: isOpen
        ? normalizedStatus === 'past_due'
          ? 'past_due'
          : 'active'
        : normalizedStatus,
      subscription_expires_at: expiresAt || null
    })
    .eq('id', userId);
  if (profileError) throw new Error(`No se pudo actualizar el acceso Premium: ${profileError.message}`);

  return subscription;
}

async function syncPaddleSubscription({
  userId,
  paddleCustomerId,
  paddleSubscriptionId,
  paddleTransactionId,
  paddlePriceId,
  plan,
  status,
  currentPeriodStart,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  paddleUpdatedAt,
  eventOccurredAt
}) {
  if (!userId || !paddleSubscriptionId) {
    throw new Error('Paddle subscription sync requires user and subscription IDs.');
  }
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase no está configurado.');

  const rawStatus = String(status || '').toLowerCase();
  const normalizedStatus = PADDLE_KNOWN_STATUSES.has(rawStatus) ? rawStatus : 'inactive';
  const isPremium = isPaddlePremiumStatus(normalizedStatus);
  const normalizedPlan = ['quarterly', 'yearly'].includes(plan) ? plan : 'monthly';
  const planId = await planService.getPlanIdBySlug('premium');
  if (!planId) throw new Error("Plan 'premium' no existe en public.plans.");

  const { data: existing, error: existingError } = await admin
    .from('subscriptions')
    .select('id, user_id, paddle_transaction_id, last_paddle_event_at')
    .eq('paddle_subscription_id', paddleSubscriptionId)
    .maybeSingle();
  if (existingError) {
    throw new Error(`No se pudo leer la suscripción Paddle: ${existingError.message}`);
  }

  if (existing?.user_id && existing.user_id !== userId) {
    throw new Error('Paddle subscription ownership does not match the existing user.');
  }

  const incomingEventAt = eventOccurredAt || paddleUpdatedAt || new Date().toISOString();
  if (
    existing?.last_paddle_event_at &&
    new Date(existing.last_paddle_event_at).getTime() > new Date(incomingEventAt).getTime()
  ) {
    return { subscription: existing, stale: true };
  }

  if (!existing && isPremium) {
    await admin
      .from('subscriptions')
      .update({
        status: 'canceled',
        is_premium: false,
        cancelled_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'past_due']);
  }

  const payload = {
    user_id: userId,
    plan_id: planId,
    status: normalizedStatus,
    billing_cycle: normalizedPlan,
    provider: 'paddle',
    provider_customer_id: paddleCustomerId || null,
    provider_subscription_id: paddleSubscriptionId,
    expires_at: currentPeriodEnd || null,
    cancelled_at: isPremium ? null : new Date().toISOString(),
    paddle_customer_id: paddleCustomerId || null,
    paddle_subscription_id: paddleSubscriptionId,
    paddle_transaction_id: paddleTransactionId || existing?.paddle_transaction_id || null,
    paddle_price_id: paddlePriceId || null,
    plan: normalizedPlan,
    is_premium: isPremium,
    current_period_start: currentPeriodStart || null,
    current_period_end: currentPeriodEnd || null,
    cancel_at_period_end: Boolean(cancelAtPeriodEnd),
    last_paddle_event_at: incomingEventAt
  };

  const write = existing
    ? admin.from('subscriptions').update(payload).eq('id', existing.id).select().single()
    : admin.from('subscriptions').insert(payload).select().single();
  const { data: subscription, error } = await write;
  if (error) throw new Error(`No se pudo sincronizar la suscripción Paddle: ${error.message}`);

  // Existing entitlement readers use profiles as a fast cache. The
  // subscriptions row above remains the source of truth and is always
  // written first; this mirror preserves all current gated routes.
  const { error: profileError } = await admin
    .from('profiles')
    .update({
      access_tier: isPremium ? 'premium' : 'free',
      // profiles.subscription_status is a legacy compatibility cache with
      // the narrower active/canceled/past_due vocabulary. The full Paddle
      // status is preserved above in subscriptions.status.
      subscription_status: isPremium
        ? 'active'
        : normalizedStatus === 'past_due'
          ? 'past_due'
          : 'canceled',
      subscription_expires_at: currentPeriodEnd || null
    })
    .eq('id', userId);
  if (profileError) {
    throw new Error(`No se pudo actualizar el acceso Premium: ${profileError.message}`);
  }

  return { subscription, stale: false };
}

module.exports = {
  getActiveSubscription,
  getSubscriptionSummary,
  changePlan,
  cancelSubscription,
  syncProviderSubscription,
  syncPaddleSubscription,
  isPaddlePremiumStatus,
  getPaddleSubscriptionReference
};
