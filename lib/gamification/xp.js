// lib/gamification/xp.js
// XP → level curve, server-side source of truth once a user is signed in.
const LEVEL_XP_STEP = 100;

function levelForXp(xp) {
  return Math.floor(Math.max(0, xp) / LEVEL_XP_STEP) + 1;
}

function xpProgress(xp) {
  const level = levelForXp(xp);
  const currentLevelFloor = (level - 1) * LEVEL_XP_STEP;
  const nextLevelXp = level * LEVEL_XP_STEP;
  return {
    level,
    xp,
    currentLevelXp: xp - currentLevelFloor,
    xpToNextLevel: LEVEL_XP_STEP,
    nextLevelXp
  };
}

module.exports = { LEVEL_XP_STEP, levelForXp, xpProgress };
