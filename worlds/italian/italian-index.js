(function () {
  const required = ["A1","A2","B1","B2","C1","C2"];
  window.ANDERGO_ITALIAN_LEVELS = window.ANDERGO_ITALIAN_LEVELS || {};
  window.ANDERGO_LANGUAGE_WORLDS = window.ANDERGO_LANGUAGE_WORLDS || { levelContent: {}, languageContent: {} };

  const missing = required.filter(level => !window.ANDERGO_ITALIAN_LEVELS[level]);
  if (missing.length) {
    console.error("[ANDERGO Italian] Missing levels:", missing.join(", "));
    return;
  }

  window.ANDERGO_LANGUAGE_WORLDS.levelContent.italian = window.ANDERGO_ITALIAN_LEVELS;
  window.dispatchEvent(new CustomEvent("andergo:italian-ready", {
    detail: { levels: required }
  }));
  console.info("[ANDERGO Italian] Path connected:", required.join(", "));
})();
