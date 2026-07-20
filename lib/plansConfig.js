// lib/plansConfig.js
// Single source of truth for what each plan costs, includes, and limits.
// Every price/limit/feature shown anywhere in the app (server responses,
// GET /api/plans, the home Premium card, the paywall modal, lesson-lock
// copy) must come from here - never re-hardcoded in a route, a frontend
// file, or another service. To change a price or a monthly cap, edit only
// this file (and PREMIUM_MONTHLY_PRICE_USD/PREMIUM_YEARLY_PRICE_USD in
// .env if you want an env-level override).
//
// public.plans (Supabase) mirrors the slug/name/is_active/price of this
// config for referential integrity (subscriptions.plan_id FK) and Supabase
// admin visibility - it is NOT read for access decisions. Every entitlement
// check still goes through lib/voiceAccessService.js's isPremiumActive()
// against public.profiles, unchanged by this file.
//
// Adding a future plan (Premium Plus, Family, Enterprise, Schools,
// Teachers): add one entry to PLANS below, add its slug to
// public.plans (migration), and every reader here (planService,
// GET /api/plans, the pricing UI) picks it up with no other code change.
const config = require('./config');

// feature keys must match lib/usageLimitService.js's public.user_usage_counters
// check constraint ('tutor_query', 'tutor_voice') - a new capped feature
// needs a matching value added to that column's check() in a migration.
const PLANS = Object.freeze({
  free: Object.freeze({
    slug: 'free',
    name: 'Free',
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    // null = unlimited. Numbers here are the only place these caps are
    // defined - lib/usageLimitService.js callers (server.js) read them
    // from here, not as inline literals.
    limits: Object.freeze({
      tutor_query: 30,
      tutor_voice: 10
    }),
    features: Object.freeze([
      'Parte de los cursos',
      'Lecturas básicas',
      'Gramática básica',
      'Listening básico',
      'Speaking básico',
      'Text-to-Speech',
      'Traductor',
      'Flashcards',
      'Vocabulario',
      'Tutor IA: 30 consultas/mes',
      'Conversación por voz: 10/mes'
    ])
  }),
  premium: Object.freeze({
    slug: 'premium',
    name: 'ANDERGO Premium',
    monthlyPriceUsd: config.premiumMonthlyPriceUsd,
    yearlyPriceUsd: config.premiumYearlyPriceUsd,
    limits: Object.freeze({
      tutor_query: null,
      tutor_voice: null
    }),
    features: Object.freeze([
      'Todos los idiomas',
      'Todos los niveles',
      'Todo Reading',
      'Todo Grammar',
      'Todo Vocabulary',
      'Todo Listening',
      'Todo Speaking',
      'Diálogos completos',
      'Tutor IA ilimitado',
      'Conversación por voz ilimitada',
      'Corrección de pronunciación',
      'Text-to-Speech',
      'Traducción',
      'Flashcards',
      'Estadísticas completas',
      'Certificados',
      'Futuras funciones Premium'
    ])
  })
});

const DEFAULT_PLAN_SLUG = 'free';

function getPlan(slug) {
  return PLANS[slug] || null;
}

function getAllPlans() {
  return Object.values(PLANS);
}

// The monthly cap for a given usage feature under a given plan slug, or
// null for unlimited. Falls back to the free plan's limit for an unknown
// slug so a data inconsistency fails closed (more restrictive), not open.
function getFeatureLimit(planSlug, feature) {
  const plan = getPlan(planSlug) || PLANS[DEFAULT_PLAN_SLUG];
  return plan.limits[feature] ?? PLANS[DEFAULT_PLAN_SLUG].limits[feature] ?? null;
}

module.exports = { PLANS, DEFAULT_PLAN_SLUG, getPlan, getAllPlans, getFeatureLimit };
