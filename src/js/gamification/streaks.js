// src/js/gamification/streaks.js
// Daily streak tracking for the client-side gamification engine.
(function () {
  const G = window.__andergoGamification;

  G.bumpStreak = function bumpStreak() {
    const today = G.todayIso();
    if (G.state.lastActiveDate === today) return;
    const wasYesterday = G.state.lastActiveDate === G.yesterdayIso();
    G.state.streak = wasYesterday ? G.state.streak + 1 : 1;
    G.state.longestStreak = Math.max(G.state.longestStreak || 0, G.state.streak);
    G.state.lastActiveDate = today;
    G.persist();
  };
})();
