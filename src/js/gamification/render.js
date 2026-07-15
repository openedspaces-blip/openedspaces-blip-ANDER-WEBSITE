// src/js/gamification/render.js
// DOM rendering for XP bar, level chip, streak flame, the achievements stats
// header, badges (with per-badge progress + filtering) and daily missions
// (with a live countdown to the next reset).
(function () {
  const G = window.__andergoGamification;
  G.badgeFilter = G.badgeFilter || 'all';

  function msUntilNextReset() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    return next.getTime() - now.getTime();
  }

  function formatCountdown(ms) {
    const totalMinutes = Math.max(0, Math.round(ms / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }

  function refreshMissionsCountdown() {
    const countdown = document.querySelector('.missions-countdown');
    if (countdown)
      countdown.textContent = `Nuevas misiones en ${formatCountdown(msUntilNextReset())}`;
  }

  G.render = function render() {
    const xpBarFill = document.querySelector('.xp-bar-fill');
    const xpLabel = document.querySelector('.xp-bar-label');
    const levelChip = document.querySelector('.level-chip');
    const streakFlame = document.querySelector('.streak-flame-count');

    if (xpBarFill) xpBarFill.style.width = `${Math.max(4, G.xpProgressPercent())}%`;
    if (xpLabel) xpLabel.textContent = `Nivel ${G.state.level} · ${G.state.xp} XP`;
    if (levelChip) levelChip.textContent = `Nv. ${G.state.level}`;
    if (streakFlame) streakFlame.textContent = String(G.state.streak);

    G.renderStats();
    G.renderBadges();
    G.renderMissions();
  };

  G.renderStats = function renderStats() {
    const ring = document.querySelector('.stat-level-ring');
    if (!ring) return;
    const ringValue = document.querySelector('.stat-level-value');
    const xpCaption = document.querySelector('.stat-xp-caption');
    const streakValue = document.querySelector('.stat-streak-value');
    const bestStreakValue = document.querySelector('.stat-best-streak-value');
    const badgesValue = document.querySelector('.stat-badges-value');

    const pct = Math.max(0, Math.min(100, G.xpProgressPercent()));
    ring.style.setProperty('--ring-percent', pct);
    if (ringValue) ringValue.textContent = G.state.level;
    if (xpCaption) {
      const floor = (G.state.level - 1) * G.LEVEL_XP_STEP;
      xpCaption.textContent = `${G.state.xp - floor} / ${G.LEVEL_XP_STEP} XP`;
    }
    if (streakValue) streakValue.textContent = String(G.state.streak);
    if (bestStreakValue)
      bestStreakValue.textContent = String(Math.max(G.state.longestStreak || 0, G.state.streak));
    if (badgesValue)
      badgesValue.textContent = `${G.state.badges.length}/${G.BADGE_DEFINITIONS.length}`;
  };

  G.renderBadges = function renderBadges() {
    const grid = document.querySelector('.badges-grid');
    if (!grid) return;

    const stats = G.computeBadgeStats();
    const filter = G.badgeFilter;
    const filtered = G.BADGE_DEFINITIONS.filter((badge) => {
      const unlocked = G.state.badges.includes(badge.id);
      if (filter === 'unlocked') return unlocked;
      if (filter === 'locked') return !unlocked;
      return true;
    });

    if (!filtered.length) {
      grid.innerHTML = `<p class="badges-empty">${filter === 'unlocked' ? 'Todavía no desbloqueas insignias. ¡Completa una lección para ganar la primera!' : '¡Ya desbloqueaste todas las insignias disponibles!'}</p>`;
      return;
    }

    grid.innerHTML = filtered
      .map((badge) => {
        const unlocked = G.state.badges.includes(badge.id);
        const current = Math.min(badge.target, stats[badge.statKey] || 0);
        const progressPct = Math.round((current / badge.target) * 100);
        return `
        <div class="badge-card ${unlocked ? 'unlocked' : 'locked'}" title="${badge.description}">
          <span class="badge-card-icon">${unlocked ? badge.icon : '🔒'}</span>
          <strong>${badge.label}</strong>
          <span>${badge.description}</span>
          ${
            unlocked
              ? ''
              : `
            <div class="badge-progress-bar"><div style="width:${progressPct}%"></div></div>
            <span class="badge-progress-label">${current}/${badge.target}</span>
          `
          }
        </div>
      `;
      })
      .join('');
  };

  G.renderMissions = function renderMissions() {
    G.ensureDailyMissions();
    refreshMissionsCountdown();
    const list = document.querySelector('.mission-list');
    if (!list) return;
    list.innerHTML = G.state.missions.items
      .map(
        (mission) => `
      <li class="mission-item ${mission.done ? 'done' : ''}">
        <span class="mission-check">${mission.done ? '✅' : '⬜'}</span>
        <div class="mission-copy">
          <strong>${mission.label}</strong>
          <div class="mission-progress-bar"><div style="width:${Math.round((mission.progress / mission.target) * 100)}%"></div></div>
        </div>
        <span class="mission-xp">+${mission.xpReward} XP</span>
      </li>
    `
      )
      .join('');
  };

  // Delegated once: the badges grid is re-rendered often, but the filter
  // tabs above it are static markup, so a single document-level listener
  // covers every click without needing to rebind on each render.
  document.addEventListener('click', (event) => {
    const filterBtn = event.target.closest('.badge-filter-btn');
    if (!filterBtn) return;
    document.querySelectorAll('.badge-filter-btn').forEach((btn) => btn.classList.remove('active'));
    filterBtn.classList.add('active');
    G.badgeFilter = filterBtn.dataset.filter;
    G.renderBadges();
  });

  setInterval(refreshMissionsCountdown, 60000);
})();
