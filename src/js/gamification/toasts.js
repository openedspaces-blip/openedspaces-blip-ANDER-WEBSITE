// src/js/gamification/toasts.js
// Pop-up feedback for badge unlocks, level-ups and mission completions.
// G.notify() already fires these events (state.js) but nothing consumed
// them before, so progress happened silently. This gives it a visible payoff.
(function () {
  const G = window.__andergoGamification;

  function ensureContainer() {
    let container = document.querySelector('.gamification-toasts');
    if (!container) {
      container = document.createElement('div');
      container.className = 'gamification-toasts';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast({ icon, title, detail, variant = 'default' }) {
    const container = ensureContainer();
    const toast = document.createElement('div');
    toast.className = `gamification-toast ${variant}`;
    toast.innerHTML = `
      <span class="gamification-toast-icon">${icon}</span>
      <div class="gamification-toast-copy">
        <strong>${title}</strong>
        ${detail ? `<span>${detail}</span>` : ''}
      </div>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 400);
    }, 4200);
  }

  G.onEvent((type, payload) => {
    if (type === 'badge-unlocked') {
      showToast({
        icon: payload.icon,
        title: `Insignia desbloqueada: ${payload.label}`,
        detail: payload.description,
        variant: 'badge'
      });
    } else if (type === 'level-up') {
      showToast({
        icon: '⭐',
        title: `¡Subiste a nivel ${payload.level}!`,
        detail: 'Sigue practicando para ganar más XP.',
        variant: 'level'
      });
    } else if (type === 'mission-complete') {
      showToast({
        icon: '✅',
        title: 'Misión completada',
        detail: `${payload.label} · +${payload.xpReward} XP`,
        variant: 'mission'
      });
    }
  });
})();
