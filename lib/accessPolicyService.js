const FREE_UNIT_LIMIT_BY_LEVEL = Object.freeze({
  A1: 3,
  A2: 3,
  B1: 3,
  B2: 3,
  C1: 2,
  C2: 2
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
