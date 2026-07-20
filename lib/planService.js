// lib/planService.js
// Read-only view of "what plans exist and what do they cost/include",
// for GET /api/plans (home Premium card, pricing section, paywall modal)
// and for lib/subscriptionService.js to resolve a plans.id (FK) for a
// given slug. Price/limits/features always come from lib/plansConfig.js;
// public.plans only contributes id/is_active - see plansConfig.js's
// header comment for why the DB columns aren't read for that.
const { getSupabaseAdmin } = require('./supabaseClient');
const plansConfig = require('./plansConfig');

function toPublicPlan(configPlan, dbRow) {
  return {
    slug: configPlan.slug,
    name: configPlan.name,
    monthlyPriceUsd: configPlan.monthlyPriceUsd,
    yearlyPriceUsd: configPlan.yearlyPriceUsd,
    limits: configPlan.limits,
    features: configPlan.features,
    isActive: dbRow ? dbRow.is_active !== false : true
  };
}

// Public, unauthenticated list of active plans - drives the pricing UI.
// Falls back to plansConfig alone (both active) when Supabase isn't
// configured, same "keep working locally without real credentials" rule
// every other service in this codebase follows.
async function getActivePlans() {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return plansConfig.getAllPlans().map((plan) => toPublicPlan(plan));
  }

  const { data: rows } = await admin
    .from('plans')
    .select('slug, is_active')
    .in(
      'slug',
      plansConfig.getAllPlans().map((plan) => plan.slug)
    );

  const rowsBySlug = new Map((rows || []).map((row) => [row.slug, row]));
  return plansConfig
    .getAllPlans()
    .map((plan) => toPublicPlan(plan, rowsBySlug.get(plan.slug)))
    .filter((plan) => plan.isActive);
}

// Resolves the public.plans.id for a slug - subscriptionService needs this
// FK before it can write a subscriptions row. Returns null (never throws)
// when Supabase isn't configured or the row doesn't exist yet, so callers
// decide how to degrade instead of every caller adding its own try/catch.
async function getPlanIdBySlug(slug) {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data } = await admin.from('plans').select('id').eq('slug', slug).maybeSingle();
  return data?.id || null;
}

module.exports = { getActivePlans, getPlanIdBySlug };
