// lib/gamification/badges.js
// Badge catalog and unlock evaluation, server-side source of truth.
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

module.exports = { BADGE_DEFINITIONS, evaluateBadges };
