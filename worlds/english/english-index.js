(function () {
  const required = ["A1","A2","B1","B2","C1","C2"];
  window.ANDERGO_ENGLISH_LEVELS = window.ANDERGO_ENGLISH_LEVELS || {};
  window.ANDERGO_LANGUAGE_WORLDS = window.ANDERGO_LANGUAGE_WORLDS || { levelContent: {}, languageContent: {} };

  const missing = required.filter(level => !window.ANDERGO_ENGLISH_LEVELS[level]);
  if (missing.length) {
    console.error("[ANDERGO English] Missing levels:", missing.join(", "));
    return;
  }

  window.ANDERGO_LANGUAGE_WORLDS.levelContent.english = window.ANDERGO_ENGLISH_LEVELS;
  window.dispatchEvent(new CustomEvent("andergo:english-ready", {
    detail: { levels: required }
  }));
  console.info("[ANDERGO English] Path connected:", required.join(", "));
})();
