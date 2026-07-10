// src/js/gamification/index.js
// Client-side gamification engine entry point: wires together state.js, xp.js,
// streaks.js, badges.js, missions.js and render.js (loaded before this file)
// into the public window.AndergoGamification API that script.js calls.
// Persists to localStorage per signed-in user (or "guest") so the experience
// feels alive immediately, then syncs with the backend's own XP/streak/badges
// (the source of truth once signed in) whenever /api/progress or
// /api/lessons/:slug/complete responses come back.
(function () {
  const G = window.__andergoGamification;

  function load(userKey) {
    G.currentUserKey = userKey || 'guest';
    try {
      const raw = localStorage.getItem(G.storageKey());
      G.state = raw ? { ...G.defaultState(), ...JSON.parse(raw) } : G.defaultState();
    } catch {
      G.state = G.defaultState();
    }
    G.ensureDailyMissions();
    G.render();
  }

  function recordCorrectAnswer() {
    G.ensureDailyMissions();
    G.state.correctAnswersToday = (G.state.correctAnswersToday || 0) + 1;
    G.addXp(5, 'Respuesta correcta');
    G.updateMissionProgress('correct-answers', 1);
  }

  function recordSkillTouched(skill, language) {
    G.ensureDailyMissions();
    if (skill && !G.state.skillsTouchedToday.includes(skill)) {
      G.state.skillsTouchedToday.push(skill);
      G.updateMissionProgress('practice-skills', 1);
    }
    if (language && !G.state.languagesTouchedToday.includes(language)) {
      G.state.languagesTouchedToday.push(language);
      if (G.state.languagesTouchedToday.length > 1) G.updateMissionProgress('explore-language', 1);
    }
    if (language && !G.state.languagesTouched.includes(language)) {
      G.state.languagesTouched.push(language);
      G.persist();
      const newBadges = G.evaluateBadges();
      newBadges.forEach((badge) => G.notify('badge-unlocked', badge));
    }
  }

  function recordLessonCompletion({ slug, language, score = 100, xpReward = 20 } = {}) {
    G.ensureDailyMissions();
    G.bumpStreak();
    const alreadyCompleted = G.state.completedSlugs.includes(slug);
    if (!alreadyCompleted) G.state.completedSlugs.push(slug);
    if (score >= 100) G.state.hasPerfectScore = true;
    if (language && !G.state.languagesTouched.includes(language)) G.state.languagesTouched.push(language);

    G.addXp(alreadyCompleted ? Math.round(xpReward * 0.2) : xpReward, 'Lección completada');
    if (!alreadyCompleted) G.updateMissionProgress('complete-lesson', 1);

    const newBadges = G.evaluateBadges();
    G.persist();
    G.render();
    newBadges.forEach((badge) => G.notify('badge-unlocked', badge));
    G.notify('streak', { streak: G.state.streak });
    return { newBadges, streak: G.state.streak, xp: G.state.xp, level: G.state.level };
  }

  // Merge server-confirmed values (source of truth once signed in) without
  // discarding local optimistic state that the server doesn't track yet.
  function syncFromServer(serverState = {}) {
    if (typeof serverState.xp === 'number') G.state.xp = Math.max(G.state.xp, serverState.xp);
    if (typeof serverState.level === 'number') G.state.level = Math.max(G.state.level, serverState.level);
    if (typeof serverState.streak === 'number') G.state.streak = Math.max(G.state.streak, serverState.streak);
    if (typeof serverState.longestStreak === 'number') G.state.longestStreak = Math.max(G.state.longestStreak, serverState.longestStreak);
    if (Array.isArray(serverState.badges)) {
      const merged = new Set([...G.state.badges, ...serverState.badges]);
      G.state.badges = Array.from(merged);
    }
    G.persist();
    G.render();
  }

  function getState() {
    return { ...G.state };
  }

  window.AndergoGamification = {
    load,
    addXp: G.addXp,
    recordCorrectAnswer,
    recordSkillTouched,
    recordLessonCompletion,
    syncFromServer,
    onEvent: G.onEvent,
    getState,
    render: G.render,
    BADGE_DEFINITIONS: G.BADGE_DEFINITIONS,
    levelForXp: G.levelForXp
  };
})();
