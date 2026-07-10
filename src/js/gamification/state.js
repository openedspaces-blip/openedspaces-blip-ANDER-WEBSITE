// src/js/gamification/state.js
// Shared mutable state + persistence for the client-side gamification engine.
// Loaded first: the other gamification/*.js files read/write
// window.__andergoGamification, since plain <script> tags (no bundler) can't
// share module-local variables the way `require`/`import` would.
(function () {
  window.__andergoGamification = window.__andergoGamification || {};
  const G = window.__andergoGamification;

  const STORAGE_PREFIX = 'andergoGamification:';

  G.state = null;
  G.currentUserKey = 'guest';
  G.listeners = [];

  G.todayIso = function todayIso() {
    return new Date().toISOString().slice(0, 10);
  };

  G.yesterdayIso = function yesterdayIso() {
    return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  };

  G.defaultState = function defaultState() {
    return {
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      badges: [],
      completedSlugs: [],
      languagesTouched: [],
      skillsTouchedToday: [],
      correctAnswersToday: 0,
      languagesTouchedToday: [],
      missions: { date: null, items: [] }
    };
  };

  G.storageKey = function storageKey() {
    return `${STORAGE_PREFIX}${G.currentUserKey}`;
  };

  G.persist = function persist() {
    try {
      localStorage.setItem(G.storageKey(), JSON.stringify(G.state));
    } catch (error) {
      console.warn('Could not persist gamification state', error);
    }
  };

  G.notify = function notify(type, payload) {
    G.listeners.forEach((fn) => {
      try { fn(type, payload); } catch (error) { console.warn('Gamification listener error', error); }
    });
  };

  G.onEvent = function onEvent(fn) {
    G.listeners.push(fn);
  };
})();
