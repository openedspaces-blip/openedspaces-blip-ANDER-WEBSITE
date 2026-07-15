(function () {
  const required = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  window.ANDERGO_FRENCH_LEVELS = window.ANDERGO_FRENCH_LEVELS || {};
  window.ANDERGO_LANGUAGE_WORLDS = window.ANDERGO_LANGUAGE_WORLDS || {
    levelContent: {},
    languageContent: {}
  };

  const missing = required.filter((level) => !window.ANDERGO_FRENCH_LEVELS[level]);
  if (missing.length) {
    console.error('[ANDERGO French] Niveaux manquants :', missing.join(', '));
    return;
  }

  window.ANDERGO_LANGUAGE_WORLDS.levelContent.french = window.ANDERGO_FRENCH_LEVELS;
  window.dispatchEvent(
    new CustomEvent('andergo:french-ready', {
      detail: { levels: required }
    })
  );
  console.info('[ANDERGO French] Parcours connecté :', required.join(', '));
})();
