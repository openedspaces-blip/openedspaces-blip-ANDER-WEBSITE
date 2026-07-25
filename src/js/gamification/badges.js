// src/js/gamification/badges.js
// Badge catalog and unlock evaluation for the client-side gamification engine.
(function () {
  const G = window.__andergoGamification;

  G.BADGE_DEFINITIONS = [
    {
      id: 'first-lesson',
      label: 'Primer paso',
      description: 'Completa tu primera lección.',
      icon: '🌱',
      statKey: 'completedCount',
      target: 1
    },
    {
      id: 'reader-5',
      label: 'Lector crítico',
      description: 'Completa 5 actividades de Reading.',
      icon: '📖',
      statKey: 'readingCompleted',
      target: 5
    },
    {
      id: 'listener-5',
      label: 'Oído atento',
      description: 'Completa 5 actividades de Listening.',
      icon: '🎧',
      statKey: 'listeningCompleted',
      target: 5
    },
    {
      id: 'vocabulary-5',
      label: 'Explorador de palabras',
      description: 'Completa 5 actividades de Vocabulary.',
      icon: '🧠',
      statKey: 'vocabularyCompleted',
      target: 5
    },
    {
      id: 'grammar-5',
      label: 'Constructor de frases',
      description: 'Completa 5 actividades de Grammar.',
      icon: '🧩',
      statKey: 'grammarCompleted',
      target: 5
    },
    {
      id: 'speaker-5',
      label: 'Voz en acción',
      description: 'Completa 5 actividades de Speaking.',
      icon: '🎙️',
      statKey: 'speakingCompleted',
      target: 5
    },
    {
      id: 'writer-5',
      label: 'Escritor constante',
      description: 'Completa 5 actividades de Writing.',
      icon: '✍️',
      statKey: 'writingCompleted',
      target: 5
    },
    {
      id: 'unit-1',
      label: 'Primera misión completa',
      description: 'Completa todas las actividades de una unidad.',
      icon: '🏁',
      statKey: 'unitsCompleted',
      target: 1
    },
    {
      id: 'unit-5',
      label: 'Avance con propósito',
      description: 'Completa 5 unidades.',
      icon: '🗺️',
      statKey: 'unitsCompleted',
      target: 5
    },
    {
      id: 'streak-7',
      label: 'Semana constante',
      description: 'Cumple tu práctica durante 7 días.',
      icon: '🔥',
      statKey: 'streak',
      target: 7
    },
    {
      id: 'perfectionist',
      label: 'Perfeccionista',
      description: 'Obtén 100% en una lección.',
      icon: '💯',
      statKey: 'hasPerfectScore',
      target: 1
    }
  ];

  G.computeBadgeStats = function computeBadgeStats() {
    return {
      completedCount: G.state.completedSlugs.length,
      streak: G.state.streak,
      unitsCompleted: G.state.completedUnitIds?.length || 0,
      readingCompleted: G.state.skillCompletions?.reading || 0,
      listeningCompleted: G.state.skillCompletions?.listening || 0,
      vocabularyCompleted: G.state.skillCompletions?.vocabulary || 0,
      grammarCompleted: G.state.skillCompletions?.grammar || 0,
      speakingCompleted: G.state.skillCompletions?.speaking || 0,
      writingCompleted: G.state.skillCompletions?.writing || 0,
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
