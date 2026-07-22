// src/js/translator-languages.js
// Single source of truth for which languages the Traductor (#translator)
// offers and how each maps to DeepL - loaded as a plain <script> in the
// browser (window.AndergoTranslatorLanguages) and require()-able from Node,
// same dual-export pattern as src/js/language-pair.js and
// src/js/username-rules.js. Replaces the previously separate, hand-kept-
// in-sync copies in lib/translatorService.js (LANGUAGE_TO_DEEPL_CODE),
// lib/server.js (TRANSLATABLE_LANGUAGES) and index.html's two hardcoded
// <option> lists.
//
// DeepL is the sole translation provider (Fase 1 spec: "DeepL continúa
// siendo el proveedor exclusivo"). Every entry here is either a real,
// currently-supported DeepL language (deeplSupported: true, with the exact
// code DeepL documents - never invented) or a language ANDERGO wants to
// show later but that DeepL does not yet translate (deeplSupported: false,
// deeplBase: null) - Haitian Creole and Hawaiian are listed only so the UI
// has one place to source their "no disponible con el proveedor actual"
// state from; they must never reach translatorService/DeepL.
//
// locale/dictationCode mirror this app's existing pronunciation tables
// (src/js/script.js's LANGUAGE_LOCALES/DICTATION_LANGUAGE_CODES) so the
// Traductor's "Escuchar"/dictation always speaks or listens in the same
// voice the rest of ANDERGO already uses for that language - kept as plain
// null for the two deeplSupported:false rows since they're never selectable
// yet, so no voice will ever be requested for them.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.AndergoTranslatorLanguages = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const TRANSLATOR_LANGUAGES = [
    { key: 'english', label: 'English', flag: '🇺🇸', deeplSupported: true, deeplBase: 'EN', locale: 'en-US', dictationCode: 'en-US' },
    { key: 'spanish', label: 'Español', flag: '🇪🇸', deeplSupported: true, deeplBase: 'ES', locale: 'es-419', dictationCode: 'es-ES' },
    { key: 'french', label: 'Français', flag: '🇫🇷', deeplSupported: true, deeplBase: 'FR', locale: 'fr-FR', dictationCode: 'fr-FR' },
    { key: 'german', label: 'Deutsch', flag: '🇩🇪', deeplSupported: true, deeplBase: 'DE', locale: 'de-DE', dictationCode: 'de-DE' },
    { key: 'italian', label: 'Italiano', flag: '🇮🇹', deeplSupported: true, deeplBase: 'IT', locale: 'it-IT', dictationCode: 'it-IT' },
    { key: 'portuguese', label: 'Português', flag: '🇧🇷', deeplSupported: true, deeplBase: 'PT', locale: 'pt-BR', dictationCode: 'pt-BR' },
    { key: 'japanese', label: '日本語', flag: '🇯🇵', deeplSupported: true, deeplBase: 'JA', locale: 'ja-JP', dictationCode: 'ja-JP' },
    // DeepL's API exposes a single Chinese code (simplified) for both
    // source and target - it does not currently accept or return a
    // separate "traditional" variant, so there is deliberately only one
    // 'chinese' row here (spec item 9: distinguish variants "si la API
    // actual los distingue" - it doesn't, for Chinese).
    { key: 'chinese', label: '中文 (简体)', flag: '🇨🇳', deeplSupported: true, deeplBase: 'ZH', locale: 'zh-CN', dictationCode: 'zh-CN' },
    // Not yet DeepL languages - kept out of every selector until a
    // compatible provider exists (spec: "no añadas todavía... como idiomas
    // activos de DeepL").
    { key: 'haitianCreole', label: 'Kreyòl Ayisyen', flag: '🇭🇹', deeplSupported: false, deeplBase: null, locale: null, dictationCode: null },
    { key: 'hawaiian', label: 'ʻŌlelo Hawaiʻi', flag: '🌺', deeplSupported: false, deeplBase: null, locale: null, dictationCode: null }
  ];

  const BY_KEY = {};
  TRANSLATOR_LANGUAGES.forEach((lang) => {
    BY_KEY[lang.key] = lang;
  });

  function getTranslatorLanguage(key) {
    return BY_KEY[key] || null;
  }

  function isDeeplSupported(key) {
    return Boolean(BY_KEY[key]?.deeplSupported);
  }

  // Every currently-selectable language's DeepL source code is just its
  // base code - DeepL's source_lang never carries a regional variant, even
  // for English/Portuguese (only target_lang does).
  function getDeeplSourceCode(key) {
    const lang = BY_KEY[key];
    return lang && lang.deeplSupported ? lang.deeplBase : null;
  }

  // variant is optional and only changes anything for English ('GB' ->
  // EN-GB, anything else -> EN-US) and Portuguese ('PT' -> PT-PT, anything
  // else -> PT-BR) - DeepL's own two region-split target languages today.
  // Every other supported language passes its base code straight through.
  function getDeeplTargetCode(key, variant) {
    const lang = BY_KEY[key];
    if (!lang || !lang.deeplSupported) return null;
    if (lang.deeplBase === 'EN') return variant === 'GB' ? 'EN-GB' : 'EN-US';
    if (lang.deeplBase === 'PT') return variant === 'PT' ? 'PT-PT' : 'PT-BR';
    return lang.deeplBase;
  }

  // Reverse lookup for DeepL's detected_source_language (an uppercase base
  // code, e.g. "FR", regardless of any target-side regional variant) back
  // to ANDERGO's lowercase language keys.
  function getKeyForDeeplCode(code) {
    const match = TRANSLATOR_LANGUAGES.find((lang) => lang.deeplSupported && lang.deeplBase === code);
    return match ? match.key : null;
  }

  // Only the DeepL-supported languages, in display order - the exact list
  // the Traductor's source/target <select> elements and the backend
  // allow-list should both be built from (spec item 3: "lista central de
  // idiomas admitidos").
  function getSelectableLanguages() {
    return TRANSLATOR_LANGUAGES.filter((lang) => lang.deeplSupported);
  }

  return {
    TRANSLATOR_LANGUAGES,
    getTranslatorLanguage,
    isDeeplSupported,
    getDeeplSourceCode,
    getDeeplTargetCode,
    getKeyForDeeplCode,
    getSelectableLanguages
  };
});
