// src/js/language-pair.js
// Single source of truth for the L1/L2 language-pair vocabulary and the
// shared rendering helpers built on top of it - loaded as a plain <script>
// in the browser (window.AndergoLanguagePair) and require()-able from Node
// for tests, same dual-export pattern as src/js/username-rules.js.
//
// Definitions (do not drift from these):
//   L1 / bridgeLanguage / interfaceLanguage: the language the student wants
//     the PLATFORM in - navigation, instructions, grammar explanations,
//     help text, translations and system messages. NOT just "a language the
//     student happens to already know" - it is the active support/interface
//     language and must be usable as such.
//   L2 / targetLanguage: the language being learned - lessons, audio,
//     vocabulary, dialogues, reading/listening/speaking content and
//     exercises stay in L2, never auto-translated wholesale into L1.
//
// interfaceLanguage and bridgeLanguage are the SAME field in this
// architecture, not two independently-tracked values - `bridgeLanguage` is
// the one source of truth (persisted as profiles.bridge_language server-side,
// see lib/preferencesService.js); `interfaceLanguage` is accepted as an
// optional override in getLanguagePairLabel purely for testability/future
// use, and every real call site in this codebase passes bridgeLanguage for
// both. Do not introduce a second, separately-tracked "interface language"
// state without updating this comment and the persistence layer together.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.AndergoLanguagePair = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const SUPPORTED_LANGUAGES = ['english', 'spanish', 'french', 'italian', 'german'];

  // Fully authored (not machine-translated) for english/spanish/french - the
  // three languages that currently have real A1 course content (English A1,
  // Français A1, Español A1) and are the only ones selectable as a bridge or
  // target language in the UI today (see #pathBridgeSelect/#pathLanguageSelect
  // in index.html). italian/german rows exist so languageNameIn() never
  // returns a raw key for them, but have no dedicated INTERFACE_LABELS/
  // PAIR_SENTENCE entry yet - callers fall back to Spanish for those, same as
  // any other not-yet-supported bridge language.
  //
  // LANGUAGE_NAME_IN[interfaceLanguage][languageKey] = how `languageKey`'s
  // name is written for a reader whose interface language is
  // `interfaceLanguage` - e.g. LANGUAGE_NAME_IN.spanish.english === 'inglés'
  // (what a Spanish-reading student reads), not 'English'.
  const LANGUAGE_NAME_IN = {
    spanish: {
      spanish: 'español',
      english: 'inglés',
      french: 'francés',
      italian: 'italiano',
      german: 'alemán'
    },
    english: {
      spanish: 'Spanish',
      english: 'English',
      french: 'French',
      italian: 'Italian',
      german: 'German'
    },
    french: {
      spanish: 'espagnol',
      english: 'anglais',
      french: 'français',
      italian: 'italien',
      german: 'allemand'
    },
    italian: {
      spanish: 'spagnolo',
      english: 'inglese',
      french: 'francese',
      italian: 'italiano',
      german: 'tedesco'
    },
    german: {
      spanish: 'Spanisch',
      english: 'Englisch',
      french: 'Französisch',
      italian: 'Italienisch',
      german: 'Deutsch'
    }
  };

  // Only the interface chrome literally named in spec section 1 (the
  // bridge/target/level selector labels and the pill labels next to them) -
  // this is NOT a general-purpose translation table for the rest of the
  // app. The bulk of ANDERGO's interface copy (menus, buttons, dashboard,
  // modals, tutor prose) remains Spanish-only prose today; extending that is
  // a separate, much larger effort and is out of scope here (see the commit
  // this file was introduced in for the explicit scope boundary).
  const INTERFACE_LABELS = {
    spanish: {
      bridgeSelectLabel: 'Idioma de apoyo (L1)',
      targetSelectLabel: 'Idioma objetivo (L2)',
      levelSelectLabel: 'Nivel',
      bridgeLabel: 'Idioma puente',
      targetLabel: 'Idioma meta',
      levelLabel: 'Nivel',
      aiLanguageLabel: 'Idioma'
    },
    english: {
      bridgeSelectLabel: 'Support language (L1)',
      targetSelectLabel: 'Target language (L2)',
      levelSelectLabel: 'Level',
      bridgeLabel: 'Bridge language',
      targetLabel: 'Target language',
      levelLabel: 'Level',
      aiLanguageLabel: 'Language'
    },
    french: {
      bridgeSelectLabel: "Langue d'appui (L1)",
      targetSelectLabel: 'Langue cible (L2)',
      levelSelectLabel: 'Niveau',
      bridgeLabel: "Langue d'appui",
      targetLabel: 'Langue cible',
      levelLabel: 'Niveau',
      aiLanguageLabel: 'Langue'
    }
  };

  // Dynamic pair sentence template, spec §1/§4: "Aprenderás {L2} con apoyo
  // en {L1}." rendered in the interface language, with target/bridge names
  // already localized via languageNameIn() before being interpolated here.
  const PAIR_SENTENCE = {
    spanish: (target, bridge) => `Aprenderás ${target} con apoyo en ${bridge}.`,
    english: (target, bridge) => `You will learn ${target} with support in ${bridge}.`,
    french: (target, bridge) => `Vous apprendrez ${target} avec un accompagnement en ${bridge}.`
  };

  // How `languageKey`'s name is written for a reader whose interface
  // language is `interfaceLanguage`. Falls back to Spanish (this app's
  // original language) for an interfaceLanguage without its own row yet,
  // and to the raw key if even that is missing - never throws.
  function languageNameIn(interfaceLanguage, languageKey) {
    const table = LANGUAGE_NAME_IN[interfaceLanguage] || LANGUAGE_NAME_IN.spanish;
    return table[languageKey] || languageKey;
  }

  // getInterfaceLabel(key, bridgeLanguage) - one of the named UI chrome
  // strings above (see INTERFACE_LABELS), in the student's bridge/interface
  // language. Falls back to Spanish, then to the raw key - never fabricates
  // a translation and never throws on an unknown bridgeLanguage/key.
  function getInterfaceLabel(key, bridgeLanguage) {
    const table = INTERFACE_LABELS[bridgeLanguage] || INTERFACE_LABELS.spanish;
    return table[key] || INTERFACE_LABELS.spanish[key] || key;
  }

  // getSupportText(content, bridgeLanguage) - explanatory/support strings
  // authored per bridge language, e.g. { spanish: '...', english: '...' }.
  // A bare string is returned as-is (single-language content, nothing to
  // pick). Falls back to the Spanish entry - the only bridge language with
  // fully authored support copy across this app's legacy preview content
  // today (see lib/uiContent.js) - rather than fabricating a translation
  // that isn't real authored data.
  function getSupportText(content, bridgeLanguage) {
    if (!content) return '';
    if (typeof content === 'string') return content;
    return content[bridgeLanguage] || content.spanish || '';
  }

  // getTargetContent(content, targetLanguage) - the learning content itself
  // (vocabulary/reading/dialogue/exercises/...) always stays in the target
  // language. This exists so callers have one place to reach for it instead
  // of reading content[targetLanguage] ad hoc, and so a future per-target-
  // language content shape only needs to change here.
  function getTargetContent(content, targetLanguage) {
    if (!content) return '';
    if (typeof content === 'string') return content;
    return content[targetLanguage] != null ? content[targetLanguage] : '';
  }

  // getLanguagePairLabel(bridgeLanguage, targetLanguage[, interfaceLanguage])
  // -> "Aprenderás {L2} con apoyo en {L1}." (or the equivalent in the
  // interface language). interfaceLanguage defaults to bridgeLanguage, per
  // the "one source of truth" note at the top of this file.
  //
  // getLanguagePairLabel('spanish', 'english') ->
  //   "Aprenderás inglés con apoyo en español."
  function getLanguagePairLabel(bridgeLanguage, targetLanguage, interfaceLanguage) {
    const uiLanguage = interfaceLanguage || bridgeLanguage;
    const sentence = PAIR_SENTENCE[uiLanguage] || PAIR_SENTENCE.spanish;
    const targetName = languageNameIn(uiLanguage, targetLanguage);
    const bridgeName = languageNameIn(uiLanguage, bridgeLanguage);
    return sentence(targetName, bridgeName);
  }

  // Central list of bridge->target combinations with real course content and
  // a fully-authored interface (see the INTERFACE_LABELS/PAIR_SENTENCE scope
  // note above) - the single place that decides which pairs are selectable.
  // Deliberately narrower than SUPPORTED_LANGUAGES: italian/german have
  // language-name entries (so languageNameIn never returns a raw key) but no
  // course content or interface copy yet, so they're left out of this list
  // rather than offered as a pair that silently falls back to Spanish
  // content/interface. Add a row here (plus the matching INTERFACE_LABELS/
  // PAIR_SENTENCE entries) when a new pair gets real content - nowhere else
  // in the codebase should hardcode this combination list.
  const LANGUAGE_PAIRS = [
    { bridge: 'spanish', target: 'english' },
    { bridge: 'english', target: 'spanish' },
    { bridge: 'spanish', target: 'french' },
    { bridge: 'french', target: 'spanish' },
    { bridge: 'french', target: 'english' },
    { bridge: 'english', target: 'french' }
  ];

  // True only for a bridge/target pair that's both (a) two different,
  // known languages and (b) actually listed in LANGUAGE_PAIRS above - never
  // throws on an unrecognized language key, just returns false.
  function isLanguagePairSupported(bridgeLanguage, targetLanguage) {
    if (!bridgeLanguage || !targetLanguage || bridgeLanguage === targetLanguage) return false;
    return LANGUAGE_PAIRS.some(
      (pair) => pair.bridge === bridgeLanguage && pair.target === targetLanguage
    );
  }

  // Every target language with a supported pair for this bridge, in
  // LANGUAGE_PAIRS' own order - e.g. getAvailableTargetLanguages('spanish')
  // -> ['english', 'french']. Empty array (never throws) for a bridge with
  // no supported pair at all.
  function getAvailableTargetLanguages(bridgeLanguage) {
    return LANGUAGE_PAIRS.filter((pair) => pair.bridge === bridgeLanguage).map(
      (pair) => pair.target
    );
  }

  // The mirror of getAvailableTargetLanguages: every bridge language that can
  // reach this target - e.g. getAvailableBridgeLanguages('english') ->
  // ['spanish', 'french'].
  function getAvailableBridgeLanguages(targetLanguage) {
    return LANGUAGE_PAIRS.filter((pair) => pair.target === targetLanguage).map(
      (pair) => pair.bridge
    );
  }

  // Swaps bridge<->target (Español -> Inglés becomes Inglés -> Español) only
  // if the swapped pair is itself supported - returns null instead of an
  // unsupported/invalid pair so callers can't accidentally land somewhere
  // with no content. Never returns bridge === target.
  function swapLanguagePair(bridgeLanguage, targetLanguage) {
    if (!isLanguagePairSupported(targetLanguage, bridgeLanguage)) return null;
    return { bridge: targetLanguage, target: bridgeLanguage };
  }

  // Resolves a requested bridge/target pair to the closest supported one,
  // without ever silently defaulting to Spanish->English behind the caller's
  // back. Returns { bridge, target, changed, reason }, where `changed` is
  // true only when the requested pair itself was invalid and something had
  // to give, and `reason` explains what happened:
  //   'same-language'     - bridge and target were equal.
  //   'unsupported-pair'  - a real, distinct pair with no content yet.
  //   null                - the requested pair was already valid, unchanged.
  // On a fixable case (bridge valid, target needs to change or vice versa)
  // it prefers keeping the field the caller didn't just change and picks the
  // first available option for the other one; if nothing at all is
  // resolvable it falls back to the platform default (spanish -> english).
  function normalizeLanguagePair(bridgeLanguage, targetLanguage) {
    if (isLanguagePairSupported(bridgeLanguage, targetLanguage)) {
      return { bridge: bridgeLanguage, target: targetLanguage, changed: false, reason: null };
    }

    const reason = bridgeLanguage === targetLanguage ? 'same-language' : 'unsupported-pair';

    const targetsForBridge = getAvailableTargetLanguages(bridgeLanguage);
    if (targetsForBridge.length) {
      return { bridge: bridgeLanguage, target: targetsForBridge[0], changed: true, reason };
    }
    const bridgesForTarget = getAvailableBridgeLanguages(targetLanguage);
    if (bridgesForTarget.length) {
      return { bridge: bridgesForTarget[0], target: targetLanguage, changed: true, reason };
    }
    return { bridge: 'spanish', target: 'english', changed: true, reason };
  }

  return {
    SUPPORTED_LANGUAGES,
    LANGUAGE_NAME_IN,
    LANGUAGE_PAIRS,
    languageNameIn,
    getInterfaceLabel,
    getSupportText,
    getTargetContent,
    getLanguagePairLabel,
    isLanguagePairSupported,
    getAvailableTargetLanguages,
    getAvailableBridgeLanguages,
    swapLanguagePair,
    normalizeLanguagePair
  };
});
