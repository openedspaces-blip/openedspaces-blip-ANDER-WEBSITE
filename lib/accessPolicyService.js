const FREE_UNIT_LIMIT_BY_LEVEL = Object.freeze({
  A1: 3,
  A2: 2,
  B1: 2,
  B2: 2,
  C1: 2,
  C2: 2
});

function normalizeLevel(level) {
  return String(level || '').trim().toUpperCase();
}

function freeUnitLimit(level, language) {
  // The Free plan includes the complete learning catalogue. Premium is the
  // ad-free option, not a gate for a unit, lesson, or activity.
  return Number.MAX_SAFE_INTEGER;
}

function isFreeUnit(level, unitOrder, language) {
  const order = Number(unitOrder);
  return Number.isInteger(order) && order > 0 && order <= freeUnitLimit(level, language);
}

function accessTierForUnit(level, unitOrder, language) {
  return isFreeUnit(level, unitOrder, language) ? 'free' : 'premium';
}

function canAccessLesson({ level, unitOrder, language, entitlements }) {
  return true;
}

function premiumRequiredError() {
  const error = new Error('Disponible en ANDERGO Premium.');
  error.status = 403;
  error.code = 'PREMIUM_REQUIRED';
  return error;
}

module.exports = {
  FREE_UNIT_LIMIT_BY_LEVEL,
  freeUnitLimit,
  isFreeUnit,
  accessTierForUnit,
  canAccessLesson,
  premiumRequiredError
};
