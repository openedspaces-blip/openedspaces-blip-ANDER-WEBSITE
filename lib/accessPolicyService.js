const FREE_UNIT_LIMIT_BY_LEVEL = Object.freeze({
  A1: 2,
  A2: 2,
  B1: 2,
  B2: 2,
  C1: 1,
  C2: 1
});

function normalizeLevel(level) {
  return String(level || '').trim().toUpperCase();
}

function freeUnitLimit(level) {
  return FREE_UNIT_LIMIT_BY_LEVEL[normalizeLevel(level)] || 0;
}

function isFreeUnit(level, unitOrder) {
  const order = Number(unitOrder);
  return Number.isInteger(order) && order > 0 && order <= freeUnitLimit(level);
}

function accessTierForUnit(level, unitOrder) {
  return isFreeUnit(level, unitOrder) ? 'free' : 'premium';
}

function canAccessLesson({ level, unitOrder, entitlements, completed = false }) {
  return Boolean(completed || entitlements?.hasFullAccess || isFreeUnit(level, unitOrder));
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
