const FREE_UNIT_LIMIT_BY_LEVEL = Object.freeze({
  A1: 4,
  A2: 3,
  B1: 3,
  B2: 3,
  C1: 3,
  C2: 3
});

const EUROPEAN_FREEMIUM_LANGUAGES = new Set(['italian', 'portuguese', 'german']);
const EUROPEAN_FREE_UNIT_LIMIT_BY_LEVEL = Object.freeze({ A1: 4, A2: 3, B1: 3 });

function normalizeLevel(level) {
  return String(level || '').trim().toUpperCase();
}

function freeUnitLimit(level, language) {
  if (EUROPEAN_FREEMIUM_LANGUAGES.has(String(language || '').toLowerCase())) {
    return EUROPEAN_FREE_UNIT_LIMIT_BY_LEVEL[normalizeLevel(level)] || 0;
  }
  return FREE_UNIT_LIMIT_BY_LEVEL[normalizeLevel(level)] || 0;
}

function isFreeUnit(level, unitOrder, language) {
  const order = Number(unitOrder);
  return Number.isInteger(order) && order > 0 && order <= freeUnitLimit(level, language);
}

function accessTierForUnit(level, unitOrder, language) {
  return isFreeUnit(level, unitOrder, language) ? 'free' : 'premium';
}

function canAccessLesson({ level, unitOrder, language, entitlements, completed = false }) {
  return Boolean(completed || entitlements?.hasFullAccess || isFreeUnit(level, unitOrder, language));
}

function premiumRequiredError() {
  const error = new Error('Disponible en ANDERGO Premium.');
  error.status = 403;
  error.code = 'PREMIUM_REQUIRED';
  return error;
}

module.exports = {
  FREE_UNIT_LIMIT_BY_LEVEL,
  EUROPEAN_FREE_UNIT_LIMIT_BY_LEVEL,
  freeUnitLimit,
  isFreeUnit,
  accessTierForUnit,
  canAccessLesson,
  premiumRequiredError
};
