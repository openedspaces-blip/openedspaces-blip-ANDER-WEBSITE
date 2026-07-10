// src/js/gamification/render.js
// DOM rendering for XP bar, level chip, streak flame, badges and missions.
(function () {
  const G = window.__andergoGamification;

  G.render = function render() {
    const xpBarFill = document.querySelector('.xp-bar-fill');
    const xpLabel = document.querySelector('.xp-bar-label');
    const levelChip = document.querySelector('.level-chip');
    const streakFlame = document.querySelector('.streak-flame-count');

    if (xpBarFill) xpBarFill.style.width = `${Math.max(4, G.xpProgressPercent())}%`;
    if (xpLabel) xpLabel.textContent = `Nivel ${G.state.level} · ${G.state.xp} XP`;
    if (levelChip) levelChip.textContent = `Nv. ${G.state.level}`;
    if (streakFlame) streakFlame.textContent = String(G.state.streak);

    G.renderBadges();
    G.renderMissions();
  };

  G.renderBadges = function renderBadges() {
    const grid = document.querySelector('.badges-grid');
    if (!grid) return;
    grid.innerHTML = G.BADGE_DEFINITIONS.map((badge) => {
      const unlocked = G.state.badges.includes(badge.id);
      return `
        <div class="badge-card ${unlocked ? 'unlocked' : 'locked'}" title="${badge.description}">
          <span class="badge-card-icon">${unlocked ? badge.icon : '🔒'}</span>
          <strong>${badge.label}</strong>
          <span>${badge.description}</span>
        </div>
      `;
    }).join('');
  };

  G.renderMissions = function renderMissions() {
    const list = document.querySelector('.mission-list');
    if (!list) return;
    G.ensureDailyMissions();
    list.innerHTML = G.state.missions.items.map((mission) => `
      <li class="mission-item ${mission.done ? 'done' : ''}">
        <span class="mission-check">${mission.done ? '✅' : '⬜'}</span>
        <div class="mission-copy">
          <strong>${mission.label}</strong>
          <div class="mission-progress-bar"><div style="width:${Math.round((mission.progress / mission.target) * 100)}%"></div></div>
        </div>
        <span class="mission-xp">+${mission.xpReward} XP</span>
      </li>
    `).join('');
  };
})();
