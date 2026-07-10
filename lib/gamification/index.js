// lib/gamification/index.js
// Single source of truth for XP → level curve, streak logic and badge
// definitions on the server side. The frontend gamification engine
// (src/js/gamification/ in the browser bundle) mirrors this for instant
// feedback, but the server is the source of truth once a user is signed in.
const { LEVEL_XP_STEP, levelForXp, xpProgress } = require('./xp');
const { BADGE_DEFINITIONS, evaluateBadges } = require('./badges');
const { todayIso, computeStreak } = require('./streaks');

module.exports = {
  LEVEL_XP_STEP,
  levelForXp,
  xpProgress,
  BADGE_DEFINITIONS,
  evaluateBadges,
  computeStreak,
  todayIso
};
