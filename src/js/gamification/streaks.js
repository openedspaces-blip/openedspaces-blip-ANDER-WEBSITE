// src/js/gamification/streaks.js
// Daily streak tracking for the client-side gamification engine.
(function () {
  const G = window.__andergoGamification;

  function daysBetween(start, end) {
    if (!start || !end) return Infinity;
    const startTime = Date.parse(`${start}T00:00:00Z`);
    const endTime = Date.parse(`${end}T00:00:00Z`);
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return Infinity;
    return Math.round((endTime - startTime) / 86400000);
  }

  G.bumpStreak = function bumpStreak() {
    const today = G.todayIso();
    if (G.state.lastActiveDate === today) return 'already-counted';

    const daysSincePractice = daysBetween(G.state.lastActiveDate, today);
    const usedGraceRecently = daysBetween(G.state.lastStreakGraceDate, today) < 7;
    const graceUsed = daysSincePractice === 2 && !usedGraceRecently && G.state.streak > 0;
    if (daysSincePractice === 1) {
      G.state.streak += 1;
    } else if (graceUsed) {
      // One missed calendar day is forgiven at most once in any rolling week.
      G.state.lastStreakGraceDate = today;
    } else {
      G.state.streak = 1;
    }

    G.state.longestStreak = Math.max(G.state.longestStreak || 0, G.state.streak);
    G.state.lastActiveDate = today;
    G.persist();
    return graceUsed ? 'grace-used' : 'counted';
  };
})();
