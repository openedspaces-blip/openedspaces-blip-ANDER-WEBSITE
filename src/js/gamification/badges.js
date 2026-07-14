// src/js/gamification/badges.js
// Badge catalog and unlock evaluation for the client-side gamification engine.
(function () {
  const G = window.__andergoGamification;

  G.BADGE_DEFINITIONS = [
    { id: 'first-lesson', label: 'Primer paso', description: 'Completa tu primera lección.', icon: '🌱', statKey: 'completedCount', target: 1 },
    { id: 'five-lessons', label: 'En marcha', description: 'Completa 5 lecciones.', icon: '🚀', statKey: 'completedCount', target: 5 },
    { id: 'ten-lessons', label: 'Constante', description: 'Completa 10 lecciones.', icon: '🏅', statKey: 'completedCount', target: 10 },
    { id: 'twenty-five-lessons', label: 'Imparable', description: 'Completa 25 lecciones.', icon: '🏆', statKey: 'completedCount', target: 25 },
    { id: 'streak-3', label: 'Racha de 3', description: '3 días seguidos practicando.', icon: '🔥', statKey: 'streak', target: 3 },
    { id: 'streak-7', label: 'Racha de 7', description: 'Una semana completa de práctica.', icon: '🔥', statKey: 'streak', target: 7 },
    { id: 'streak-30', label: 'Racha de 30', description: 'Un mes entero sin fallar.', icon: '🔥', statKey: 'streak', target: 30 },
    { id: 'level-5', label: 'Nivel 5', description: 'Alcanza el nivel 5 de XP.', icon: '⭐', statKey: 'level', target: 5 },
    { id: 'level-10', label: 'Nivel 10', description: 'Alcanza el nivel 10 de XP.', icon: '🌟', statKey: 'level', target: 10 },
    { id: 'polyglot', label: 'Políglota', description: 'Practica en 2 o más idiomas.', icon: '🌍', statKey: 'languagesStarted', target: 2 },
    { id: 'perfectionist', label: 'Perfeccionista', description: 'Obtén 100% en una lección.', icon: '💯', statKey: 'hasPerfectScore', target: 1 }
  ];

  G.computeBadgeStats = function computeBadgeStats() {
    return {
      completedCount: G.state.completedSlugs.length,
      streak: G.state.streak,
      level: G.state.level,
      languagesStarted: G.state.languagesTouched.length,
      hasPerfectScore: G.state.hasPerfectScore ? 1 : 0
    };
  };

  G.evaluateBadges = function evaluateBadges() {
    const stats = G.computeBadgeStats();
    const existing = new Set(G.state.badges);
    const newlyUnlocked = [];
    G.BADGE_DEFINITIONS.forEach((badge) => {
      if (existing.has(badge.id)) return;
      if (stats[badge.statKey] >= badge.target) {
        existing.add(badge.id);
        newlyUnlocked.push(badge);
      }
    });
    G.state.badges = Array.from(existing);
    return newlyUnlocked;
  };
})();
