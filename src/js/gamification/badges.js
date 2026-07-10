// src/js/gamification/badges.js
// Badge catalog and unlock evaluation for the client-side gamification engine.
(function () {
  const G = window.__andergoGamification;

  G.BADGE_DEFINITIONS = [
    { id: 'first-lesson', label: 'Primer paso', description: 'Completa tu primera lección.', icon: '🌱' },
    { id: 'five-lessons', label: 'En marcha', description: 'Completa 5 lecciones.', icon: '🚀' },
    { id: 'ten-lessons', label: 'Constante', description: 'Completa 10 lecciones.', icon: '🏅' },
    { id: 'twenty-five-lessons', label: 'Imparable', description: 'Completa 25 lecciones.', icon: '🏆' },
    { id: 'streak-3', label: 'Racha de 3', description: '3 días seguidos practicando.', icon: '🔥' },
    { id: 'streak-7', label: 'Racha de 7', description: 'Una semana completa de práctica.', icon: '🔥' },
    { id: 'streak-30', label: 'Racha de 30', description: 'Un mes entero sin fallar.', icon: '🔥' },
    { id: 'level-5', label: 'Nivel 5', description: 'Alcanza el nivel 5 de XP.', icon: '⭐' },
    { id: 'level-10', label: 'Nivel 10', description: 'Alcanza el nivel 10 de XP.', icon: '🌟' },
    { id: 'polyglot', label: 'Políglota', description: 'Practica en 2 o más idiomas.', icon: '🌍' },
    { id: 'perfectionist', label: 'Perfeccionista', description: 'Obtén 100% en una lección.', icon: '💯' }
  ];

  G.evaluateBadges = function evaluateBadges() {
    const stats = {
      completedCount: G.state.completedSlugs.length,
      streak: G.state.streak,
      level: G.state.level,
      languagesStarted: G.state.languagesTouched.length,
      hasPerfectScore: G.state.hasPerfectScore
    };
    const existing = new Set(G.state.badges);
    const newlyUnlocked = [];
    G.BADGE_DEFINITIONS.forEach((badge) => {
      if (existing.has(badge.id)) return;
      let unlocked = false;
      if (badge.id === 'first-lesson') unlocked = stats.completedCount >= 1;
      if (badge.id === 'five-lessons') unlocked = stats.completedCount >= 5;
      if (badge.id === 'ten-lessons') unlocked = stats.completedCount >= 10;
      if (badge.id === 'twenty-five-lessons') unlocked = stats.completedCount >= 25;
      if (badge.id === 'streak-3') unlocked = stats.streak >= 3;
      if (badge.id === 'streak-7') unlocked = stats.streak >= 7;
      if (badge.id === 'streak-30') unlocked = stats.streak >= 30;
      if (badge.id === 'level-5') unlocked = stats.level >= 5;
      if (badge.id === 'level-10') unlocked = stats.level >= 10;
      if (badge.id === 'polyglot') unlocked = stats.languagesStarted >= 2;
      if (badge.id === 'perfectionist') unlocked = Boolean(stats.hasPerfectScore);
      if (unlocked) {
        existing.add(badge.id);
        newlyUnlocked.push(badge);
      }
    });
    G.state.badges = Array.from(existing);
    return newlyUnlocked;
  };
})();
