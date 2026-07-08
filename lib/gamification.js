// lib/gamification.js
// Single source of truth for XP → level curve, streak logic and badge
// definitions on the server side. The frontend gamification engine
// (gamification.js in the browser bundle) mirrors this for instant feedback,
// but the server is the source of truth once a user is signed in.
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

const BADGE_DEFINITIONS = [
  { id: 'first-lesson', label: 'Primer paso', description: 'Completa tu primera lección.', icon: '🌱', check: (s) => s.completedCount >= 1 },
  { id: 'five-lessons', label: 'En marcha', description: 'Completa 5 lecciones.', icon: '🚀', check: (s) => s.completedCount >= 5 },
  { id: 'ten-lessons', label: 'Constante', description: 'Completa 10 lecciones.', icon: '🏅', check: (s) => s.completedCount >= 10 },
  { id: 'twenty-five-lessons', label: 'Imparable', description: 'Completa 25 lecciones.', icon: '🏆', check: (s) => s.completedCount >= 25 },
  { id: 'streak-3', label: 'Racha de 3', description: '3 días seguidos practicando.', icon: '🔥', check: (s) => s.streak >= 3 },
  { id: 'streak-7', label: 'Racha de 7', description: 'Una semana completa de práctica.', icon: '🔥', check: (s) => s.streak >= 7 },
  { id: 'streak-30', label: 'Racha de 30', description: 'Un mes entero sin fallar.', icon: '🔥', check: (s) => s.streak >= 30 },
  { id: 'level-5', label: 'Nivel 5', description: 'Alcanza el nivel 5 de XP.', icon: '⭐', check: (s) => s.level >= 5 },
  { id: 'level-10', label: 'Nivel 10', description: 'Alcanza el nivel 10 de XP.', icon: '🌟', check: (s) => s.level >= 10 },
  { id: 'polyglot', label: 'Políglota', description: 'Practica en 2 o más idiomas.', icon: '🌍', check: (s) => s.languagesStarted >= 2 },
  { id: 'perfectionist', label: 'Perfeccionista', description: 'Obtén 100% en una lección.', icon: '💯', check: (s) => s.hasPerfectScore }
];

function evaluateBadges(existingBadgeIds, stats) {
  const existing = new Set(existingBadgeIds || []);
  const newlyUnlocked = [];
  BADGE_DEFINITIONS.forEach((badge) => {
    if (!existing.has(badge.id) && badge.check(stats)) {
      existing.add(badge.id);
      newlyUnlocked.push(badge);
    }
  });
  return { allBadgeIds: Array.from(existing), newlyUnlocked };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Given the last active date and current streak, returns the streak state
// for "today" - incrementing if the last activity was yesterday, resetting
// to 1 if there was a gap, and leaving it unchanged if already logged today.
function computeStreak({ lastActiveDate, streak = 0, longestStreak = 0 }) {
  const today = todayIso();
  if (lastActiveDate === today) {
    return { streak, longestStreak, lastActiveDate: today, isNewDay: false };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const nextStreak = lastActiveDate === yesterday ? streak + 1 : 1;
  return {
    streak: nextStreak,
    longestStreak: Math.max(longestStreak || 0, nextStreak),
    lastActiveDate: today,
    isNewDay: true
  };
}

module.exports = {
  LEVEL_XP_STEP,
  levelForXp,
  xpProgress,
  BADGE_DEFINITIONS,
  evaluateBadges,
  computeStreak,
  todayIso
};
