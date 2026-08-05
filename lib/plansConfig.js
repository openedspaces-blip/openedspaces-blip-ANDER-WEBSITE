const config = require('./config');

const PLANS = Object.freeze({
  free: Object.freeze({
    slug: 'free',
    name: 'Free',
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    limits: Object.freeze({
      tutor_query: config.aiTutorMonthlyLimitFree,
      tutor_voice: config.aiTutorMonthlyLimitFree
    }),
    features: Object.freeze([
      'Explora la plataforma',
      'Primeras lecciones de cada nivel',
      'Pronunciación integrada',
      'Chat escrito con Tutor IA sin límite',
      `Tutor por voz: ${config.aiTutorMonthlyLimitFree} consultas/mes`,
      'Ruta completa siempre visible'
    ])
  }),
  premium: Object.freeze({
    slug: 'premium',
    name: 'ANDERGO Premium',
    monthlyPriceUsd: config.premiumMonthlyPriceUsd,
    yearlyPriceUsd: config.premiumYearlyPriceUsd,
    limits: Object.freeze({
      tutor_query: config.aiTutorMonthlyLimitPremium,
      tutor_voice: config.aiTutorMonthlyLimitPremium
    }),
    features: Object.freeze([
      'Acceso completo',
      'Todas las actividades',
      'Chat escrito con Tutor IA sin límite',
      `Tutor por voz: ${config.aiTutorMonthlyLimitPremium} consultas/mes`,
      'Pronunciación y diálogos',
      'Certificados',
      'Seguimiento completo'
    ])
  })
});

const DEFAULT_PLAN_SLUG = config.defaultSubscriptionPlan;

function getPlan(slug) {
  return PLANS[slug] || null;
}

function getAllPlans() {
  return Object.values(PLANS);
}

function getFeatureLimit(planSlug, feature) {
  const plan = getPlan(planSlug) || PLANS[DEFAULT_PLAN_SLUG] || PLANS.free;
  return plan.limits[feature] ?? PLANS.free.limits[feature] ?? null;
}

module.exports = { PLANS, DEFAULT_PLAN_SLUG, getPlan, getAllPlans, getFeatureLimit };
