// src/js/gamification/xp.js
// XP and level curve for the client-side gamification engine.
(function () {
  const G = window.__andergoGamification;
  const LEVEL_XP_STEP = 100;
  const LEVEL_NAMES = [
    'Recién llegado',
    'Primeras palabras',
    'Explorador',
    'Oyente atento',
    'Conversador inicial',
    'Lector curioso',
    'Escritor en marcha',
    'Comunicador A1',
    'Aventurero independiente',
    'Listo para el reto A1'
  ];

  G.LEVEL_XP_STEP = LEVEL_XP_STEP;
  G.levelName = function levelName(level) {
    const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
    return LEVEL_NAMES[safeLevel - 1] || 'Explorador constante';
  };

  G.levelForXp = function levelForXp(xp) {
    return Math.floor(Math.max(0, xp) / LEVEL_XP_STEP) + 1;
  };

  G.xpProgressPercent = function xpProgressPercent() {
    const floor = (G.state.level - 1) * LEVEL_XP_STEP;
    return Math.max(0, Math.min(100, Math.round(((G.state.xp - floor) / LEVEL_XP_STEP) * 100)));
  };

  G.addXp = function addXp(amount, reason = '') {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const previousLevel = G.state.level;
    G.state.xp = Math.max(0, G.state.xp + amount);
    G.state.level = G.levelForXp(G.state.xp);
    G.persist();
    G.render();
    G.notify('xp', { amount, reason, total: G.state.xp });
    if (G.state.level > previousLevel) {
      G.notify('level-up', { level: G.state.level });
    }
  };
})();
