// gamification.js
// Client-side gamification engine: XP, levels, streaks, badges and daily
// missions. Persists to localStorage per signed-in user (or "guest") so the
// experience feels alive immediately, then syncs with the backend's own
// XP/streak/badges (the source of truth once signed in) whenever /api/progress
// or /api/lessons/:slug/complete responses come back.
(function () {
  const LEVEL_XP_STEP = 100;
  const STORAGE_PREFIX = 'andergoGamification:';

  const BADGE_DEFINITIONS = [
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

  const MISSION_POOL = [
    { id: 'complete-lesson', label: 'Completa 1 lección hoy', target: 1, xpReward: 15 },
    { id: 'correct-answers', label: 'Responde 3 ejercicios correctamente', target: 3, xpReward: 15 },
    { id: 'practice-skills', label: 'Practica 2 habilidades distintas', target: 2, xpReward: 15 },
    { id: 'explore-language', label: 'Explora otro idioma', target: 1, xpReward: 10 }
  ];

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function yesterdayIso() {
    return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  }

  function levelForXp(xp) {
    return Math.floor(Math.max(0, xp) / LEVEL_XP_STEP) + 1;
  }

  function defaultState() {
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
  }

  let state = defaultState();
  let currentUserKey = 'guest';
  let listeners = [];

  function storageKey() {
    return `${STORAGE_PREFIX}${currentUserKey}`;
  }

  function persist() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(state));
    } catch (error) {
      console.warn('Could not persist gamification state', error);
    }
  }

  function load(userKey) {
    currentUserKey = userKey || 'guest';
    try {
      const raw = localStorage.getItem(storageKey());
      state = raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
    } catch {
      state = defaultState();
    }
    ensureDailyMissions();
    render();
  }

  function ensureDailyMissions() {
    const today = todayIso();
    if (state.missions?.date === today) return;

    // Reset "today" counters and pick 3 fresh missions.
    state.skillsTouchedToday = [];
    state.correctAnswersToday = 0;
    state.languagesTouchedToday = [];
    const shuffled = [...MISSION_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    state.missions = {
      date: today,
      items: shuffled.map((mission) => ({ ...mission, progress: 0, done: false }))
    };
    persist();
  }

  function updateMissionProgress(missionId, incrementBy = 1) {
    const mission = state.missions.items.find((item) => item.id === missionId);
    if (!mission || mission.done) return;
    mission.progress = Math.min(mission.target, mission.progress + incrementBy);
    if (mission.progress >= mission.target) {
      mission.done = true;
      addXp(mission.xpReward, `Misión completada: ${mission.label}`);
      notify('mission-complete', mission);
    }
    persist();
    render();
  }

  function evaluateBadges() {
    const stats = {
      completedCount: state.completedSlugs.length,
      streak: state.streak,
      level: state.level,
      languagesStarted: state.languagesTouched.length,
      hasPerfectScore: state.hasPerfectScore
    };
    const existing = new Set(state.badges);
    const newlyUnlocked = [];
    BADGE_DEFINITIONS.forEach((badge) => {
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
    state.badges = Array.from(existing);
    return newlyUnlocked;
  }

  function addXp(amount, reason = '') {
    if (!amount) return;
    const previousLevel = state.level;
    state.xp = Math.max(0, state.xp + amount);
    state.level = levelForXp(state.xp);
    persist();
    render();
    notify('xp', { amount, reason, total: state.xp });
    if (state.level > previousLevel) {
      notify('level-up', { level: state.level });
    }
  }

  function bumpStreak() {
    const today = todayIso();
    if (state.lastActiveDate === today) return;
    const wasYesterday = state.lastActiveDate === yesterdayIso();
    state.streak = wasYesterday ? state.streak + 1 : 1;
    state.longestStreak = Math.max(state.longestStreak || 0, state.streak);
    state.lastActiveDate = today;
    persist();
  }

  function recordCorrectAnswer() {
    ensureDailyMissions();
    state.correctAnswersToday = (state.correctAnswersToday || 0) + 1;
    addXp(5, 'Respuesta correcta');
    updateMissionProgress('correct-answers', 1);
  }

  function recordSkillTouched(skill, language) {
    ensureDailyMissions();
    if (skill && !state.skillsTouchedToday.includes(skill)) {
      state.skillsTouchedToday.push(skill);
      updateMissionProgress('practice-skills', 1);
    }
    if (language && !state.languagesTouchedToday.includes(language)) {
      state.languagesTouchedToday.push(language);
      if (state.languagesTouchedToday.length > 1) updateMissionProgress('explore-language', 1);
    }
    if (language && !state.languagesTouched.includes(language)) {
      state.languagesTouched.push(language);
      persist();
      const newBadges = evaluateBadges();
      newBadges.forEach((badge) => notify('badge-unlocked', badge));
    }
  }

  function recordLessonCompletion({ slug, language, score = 100, xpReward = 20 } = {}) {
    ensureDailyMissions();
    bumpStreak();
    const alreadyCompleted = state.completedSlugs.includes(slug);
    if (!alreadyCompleted) state.completedSlugs.push(slug);
    if (score >= 100) state.hasPerfectScore = true;
    if (language && !state.languagesTouched.includes(language)) state.languagesTouched.push(language);

    addXp(alreadyCompleted ? Math.round(xpReward * 0.2) : xpReward, 'Lección completada');
    if (!alreadyCompleted) updateMissionProgress('complete-lesson', 1);

    const newBadges = evaluateBadges();
    persist();
    render();
    newBadges.forEach((badge) => notify('badge-unlocked', badge));
    notify('streak', { streak: state.streak });
    return { newBadges, streak: state.streak, xp: state.xp, level: state.level };
  }

  // Merge server-confirmed values (source of truth once signed in) without
  // discarding local optimistic state that the server doesn't track yet.
  function syncFromServer(serverState = {}) {
    if (typeof serverState.xp === 'number') state.xp = Math.max(state.xp, serverState.xp);
    if (typeof serverState.level === 'number') state.level = Math.max(state.level, serverState.level);
    if (typeof serverState.streak === 'number') state.streak = Math.max(state.streak, serverState.streak);
    if (typeof serverState.longestStreak === 'number') state.longestStreak = Math.max(state.longestStreak, serverState.longestStreak);
    if (Array.isArray(serverState.badges)) {
      const merged = new Set([...state.badges, ...serverState.badges]);
      state.badges = Array.from(merged);
    }
    persist();
    render();
  }

  function notify(type, payload) {
    listeners.forEach((fn) => {
      try { fn(type, payload); } catch (error) { console.warn('Gamification listener error', error); }
    });
  }

  function onEvent(fn) {
    listeners.push(fn);
  }

  function xpProgressPercent() {
    const floor = (state.level - 1) * LEVEL_XP_STEP;
    return Math.round(((state.xp - floor) / LEVEL_XP_STEP) * 100);
  }

  function render() {
    const xpBarFill = document.querySelector('.xp-bar-fill');
    const xpLabel = document.querySelector('.xp-bar-label');
    const levelChip = document.querySelector('.level-chip');
    const streakFlame = document.querySelector('.streak-flame-count');

    if (xpBarFill) xpBarFill.style.width = `${Math.max(4, xpProgressPercent())}%`;
    if (xpLabel) xpLabel.textContent = `Nivel ${state.level} · ${state.xp} XP`;
    if (levelChip) levelChip.textContent = `Nv. ${state.level}`;
    if (streakFlame) streakFlame.textContent = String(state.streak);

    renderBadges();
    renderMissions();
  }

  function renderBadges() {
    const grid = document.querySelector('.badges-grid');
    if (!grid) return;
    grid.innerHTML = BADGE_DEFINITIONS.map((badge) => {
      const unlocked = state.badges.includes(badge.id);
      return `
        <div class="badge-card ${unlocked ? 'unlocked' : 'locked'}" title="${badge.description}">
          <span class="badge-card-icon">${unlocked ? badge.icon : '🔒'}</span>
          <strong>${badge.label}</strong>
          <span>${badge.description}</span>
        </div>
      `;
    }).join('');
  }

  function renderMissions() {
    const list = document.querySelector('.mission-list');
    if (!list) return;
    ensureDailyMissions();
    list.innerHTML = state.missions.items.map((mission) => `
      <li class="mission-item ${mission.done ? 'done' : ''}">
        <span class="mission-check">${mission.done ? '✅' : '⬜'}</span>
        <div class="mission-copy">
          <strong>${mission.label}</strong>
          <div class="mission-progress-bar"><div style="width:${Math.round((mission.progress / mission.target) * 100)}%"></div></div>
        </div>
        <span class="mission-xp">+${mission.xpReward} XP</span>
      </li>
    `).join('');
  }

  function getState() {
    return { ...state };
  }

  window.AndergoGamification = {
    load,
    addXp,
    recordCorrectAnswer,
    recordSkillTouched,
    recordLessonCompletion,
    syncFromServer,
    onEvent,
    getState,
    render,
    BADGE_DEFINITIONS,
    levelForXp
  };
})();
