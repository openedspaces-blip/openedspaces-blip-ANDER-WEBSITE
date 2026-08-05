// Public Paddle catalogue. Price IDs remain environment variables and are
// attached at runtime; this copy must match the live Paddle catalogue.
const TIER_CATALOG = Object.freeze([
  Object.freeze({
    key: 'premium',
    name: 'ANDERGO Premium',
    description: 'Acceso completo para avanzar a tu ritmo en todos los idiomas y niveles.',
    featured: true,
    features: Object.freeze([
      'Todos los idiomas, niveles y actividades',
      'Listening, Speaking, Reading y Writing',
      'Tutor IA y herramientas de pronunciación',
      'Progreso, juegos y práctica ilimitada'
    ])
  })
]);

function getPublicTiers(priceConfig = {}) {
  return TIER_CATALOG.map((tier) => ({
    ...tier,
    features: [...tier.features],
    priceId: {
      monthly: priceConfig.monthly || null,
      quarterly: priceConfig.quarterly || null
    }
  }));
}

module.exports = { TIER_CATALOG, getPublicTiers };
