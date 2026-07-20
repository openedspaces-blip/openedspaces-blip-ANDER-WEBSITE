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
// No payment gateway is wired in yet - see lib/billingService.js. changePlan
// is the primitive a future Stripe/PayPal webhook handler will call; nothing
// here makes a network call to a provider.
const { getSupabaseAdmin } = require('./supabaseClient');
const plansConfig = require('./plansConfig');
const planService = require('./planService');
const usageLimitService = require('./usageLimitService');
const { getUserEntitlements } = require('./entitlementsService');

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
    .select('id, status, billing_cycle, started_at, expires_at, cancelled_at, plans(slug)')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row) return virtualSubscription(userId, fallbackSlug);

  return {
    id: row.id,
    userId,
    planSlug: row.plans?.slug || fallbackSlug,
    status: row.status,
    billingCycle: row.billing_cycle,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    cancelledAt: row.cancelled_at
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

  const [subscription, tutorQuery, tutorVoice] = await Promise.all([
    getActiveSubscription(userId, { planSlugHint: planSlug }),
    usageLimitService.checkUsage({
      userId,
      feature: 'tutor_query',
      monthlyLimit: plansConfig.getFeatureLimit(planSlug, 'tutor_query')
    }),
    usageLimitService.checkUsage({
      userId,
      feature: 'tutor_voice',
      monthlyLimit: plansConfig.getFeatureLimit(planSlug, 'tutor_voice')
    })
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
    usage: { tutorQuery, tutorVoice }
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

module.exports = {
  getActiveSubscription,
  getSubscriptionSummary,
  changePlan,
  cancelSubscription
};
