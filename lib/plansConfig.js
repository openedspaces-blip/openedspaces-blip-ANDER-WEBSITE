const config = require('./config');

const PLANS = Object.freeze({
  free: Object.freeze({
    slug: 'free',
    name: 'Free',
    monthlyPriceUsd: 0,
    quarterlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    limits: Object.freeze({
      tutor_query: config.aiTutorMonthlyLimitFree,
      tutor_voice: config.aiTutorMonthlyLimitFree,
      translator_query: config.translatorMonthlyLimitFree
    }),
    features: Object.freeze([
      'Acceso completo a todos los niveles y actividades: A1–C2',
      'Reading, Grammar, Vocabulary, Listening, Speaking, Verbos, Adjetivos y Adverbios',
      'Pruebas, juegos, infografías y práctica guiada incluidos',
      'Anuncios discretos entre habilidades cuando estén disponibles',
      `Tutor I.A. y Traductor: ${config.aiTutorMonthlyLimitFree} consultas/mes cada uno`,
      'Pronunciación integrada',
      'Tutor I.A. con cupo mensual incluido',
      'Ruta completa sin bloqueos'
    ])
  }),
  premium: Object.freeze({
    slug: 'premium',
    name: 'ANDERGO Premium',
    monthlyPriceUsd: config.premiumMonthlyPriceUsd,
    quarterlyPriceUsd: config.premiumQuarterlyPriceUsd,
    yearlyPriceUsd: config.premiumYearlyPriceUsd,
    limits: Object.freeze({
      tutor_query: config.aiTutorMonthlyLimitPremium,
      tutor_voice: config.aiTutorMonthlyLimitPremium,
      translator_query: config.translatorMonthlyLimitPremium
    }),
    features: Object.freeze([
      'Toda la experiencia académica A1–C2 sin anuncios de terceros',
      'Reading, Grammar, Vocabulary, Listening, Speaking, Verbos, Adjetivos y Adverbios',
      'Lecciones, evaluaciones, juegos y práctica guiada',
      `Tutor I.A. y Traductor: ${config.aiTutorMonthlyLimitPremium} consultas/mes cada uno`,
      'Pronunciación y diálogos',
      'Estadísticas completas de progreso',
      'Certificado digital de finalización por nivel'
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
