// src/js/translator-predictive.js
// Predictive text for the Traductor's input textarea (Fase 4) - English/
// Spanish/French only, for now. Deliberately 100% local: a small curated
// word list plus a handful of common two-word sequences per language, never
// an API call. Nothing here ever reaches DeepL or the AI Tutor - "sugerencias
// locales o controladas", "no llamar a DeepL en cada pulsación", "no llamar
// a IA en cada letra", "no enviar lo escrito antes de que el usuario
// traduzca". Loaded as a plain <script> in the browser
// (window.AndergoTranslatorPredictive), same dual-export pattern as
// src/js/language-pair.js and src/js/translator-languages.js (Node export
// kept only for consistency/testability, this module has no server use today).
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.AndergoTranslatorPredictive = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const MAX_SUGGESTIONS = 5;

  // Common-word lists, roughly frequency-ordered (most frequent first) -
  // used for autocompletado (prefix match on the word being typed) and, as
  // a fallback, corrección ortográfica (one-edit-distance match). Modest,
  // curated sets by design (this is a first pass per spec: "implementar
  // primero para English/Spanish/French") - not an exhaustive dictionary.
  const WORDLISTS = {
    english: [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with',
      'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
      'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just',
      'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
      'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
      'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want',
      'because', 'any', 'these', 'give', 'day', 'most', 'us', 'thank', 'thanks', 'please', 'sorry',
      'hello', 'help', 'want', 'need', 'love', 'like', 'today', 'tomorrow', 'yesterday', 'morning',
      'afternoon', 'evening', 'night', 'week', 'month', 'family', 'friend', 'school', 'work', 'home',
      'house', 'city', 'country', 'water', 'food', 'money', 'question', 'answer', 'important', 'because'
    ],
    spanish: [
      'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'se', 'del', 'las', 'un', 'por', 'con', 'no', 'una',
      'su', 'para', 'es', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque',
      'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien',
      'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso',
      'ante', 'ellos', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra',
      'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella',
      'estar', 'estas', 'algunas', 'algo', 'nosotros', 'gracias', 'favor', 'hola', 'adiós', 'buenos',
      'buenas', 'días', 'tardes', 'noches', 'ayuda', 'necesito', 'quiero', 'puedo', 'tengo', 'tiene',
      'perdón', 'disculpe', 'familia', 'amigo', 'amiga', 'trabajo', 'casa', 'ciudad', 'país', 'agua',
      'comida', 'dinero', 'pregunta', 'respuesta', 'importante', 'hoy', 'mañana', 'ayer', 'semana', 'mes'
    ],
    french: [
      'de', 'la', 'le', 'et', 'à', 'les', 'des', 'un', 'du', 'une', 'que', 'est', 'en', 'qui', 'dans',
      'pour', 'pas', 'ce', 'il', 'sur', 'plus', 'ne', 'se', 'au', 'par', 'ou', 'mais', 'nous', 'comme',
      'on', 'avec', 'tout', 'sont', 'elle', 'ils', 'vous', 'sa', 'leur', 'être', 'aussi', 'son', 'même',
      'faire', 'bien', 'autre', 'cette', 'ces', 'entre', 'sans', 'depuis', 'quand', 'très', 'peu', 'moi',
      'toi', 'nos', 'vos', 'donc', 'car', 'alors', 'merci', 'bonjour', 'bonsoir', 'salut', 'pardon',
      'excusez', 'aide', 'besoin', 'veux', 'peux', 'avoir', 'ai', 'as', 'avons', 'avez', 'ont', 'famille',
      'ami', 'amie', 'travail', 'maison', 'ville', 'pays', 'eau', 'nourriture', 'argent', 'question',
      'réponse', 'important', "aujourd'hui", 'demain', 'hier', 'matin', 'soir', 'nuit', 'semaine', 'mois'
    ]
  };

  // A handful of common two-word sequences per language - used only for
  // predicción contextual (suggesting the NEXT word right after a
  // completed word + a space), distinct from autocompletado (which
  // completes the word currently being typed).
  const BIGRAMS = {
    english: {
      thank: ['you'],
      how: ['are', 'much', 'many'],
      i: ['am', 'have', 'want', 'think', 'need', 'like'],
      good: ['morning', 'afternoon', 'evening', 'night'],
      nice: ['to'],
      see: ['you'],
      of: ['course'],
      as: ['well', 'soon'],
      by: ['the'],
      a: ['lot']
    },
    spanish: {
      muchas: ['gracias'],
      por: ['favor', 'qué', 'ejemplo'],
      buenos: ['días'],
      buenas: ['tardes', 'noches'],
      de: ['nada'],
      hasta: ['luego', 'pronto'],
      mucho: ['gusto'],
      lo: ['siento']
    },
    french: {
      merci: ['beaucoup'],
      je: ['suis', 'veux', 'pense', "n'ai"],
      bonne: ['journée', 'nuit'],
      de: ['rien'],
      a: ['bientôt']
    }
  };

  // Standard "one edit distance" check (insert/delete/substitute a single
  // character), O(n) - only used for the spelling-correction fallback, and
  // only against words at least 3 characters long, to avoid noisy 1-2
  // character "corrections".
  function isEditDistanceOne(a, b) {
    if (a === b) return false;
    const lenA = a.length;
    const lenB = b.length;
    if (Math.abs(lenA - lenB) > 1) return false;

    let i = 0;
    let j = 0;
    let edits = 0;
    while (i < lenA && j < lenB) {
      if (a[i] === b[j]) {
        i += 1;
        j += 1;
        continue;
      }
      edits += 1;
      if (edits > 1) return false;
      if (lenA === lenB) {
        i += 1;
        j += 1;
      } else if (lenA > lenB) {
        i += 1;
      } else {
        j += 1;
      }
    }
    if (i < lenA || j < lenB) edits += 1;
    return edits <= 1;
  }

  // textBeforeCaret is everything in the textarea up to the caret (or the
  // selection start), so this works correctly even when editing mid-text,
  // not just when typing at the end.
  function getSuggestions(language, textBeforeCaret) {
    const list = WORDLISTS[language];
    if (!list || typeof textBeforeCaret !== 'string') return [];

    const currentWordMatch = /(\S*)$/.exec(textBeforeCaret);
    const currentWord = currentWordMatch ? currentWordMatch[1] : '';

    // Nothing typed for the current word yet: only offer a contextual
    // next-word suggestion, and only right after a finished word + space
    // (never on an empty textarea, never mid-word).
    if (!currentWord) {
      if (!/\s$/.test(textBeforeCaret) || !textBeforeCaret.trim()) return [];
      const prevWordMatch = /(\S+)\s+$/.exec(textBeforeCaret);
      const prevWord = prevWordMatch ? prevWordMatch[1].toLowerCase() : '';
      const nextWords = (BIGRAMS[language] && BIGRAMS[language][prevWord]) || [];
      return nextWords.slice(0, MAX_SUGGESTIONS).map((text) => ({ text, type: 'contextual' }));
    }

    const lower = currentWord.toLowerCase();
    const prefixMatches = list.filter(
      (word) => word.toLowerCase().startsWith(lower) && word.toLowerCase() !== lower
    );
    if (prefixMatches.length) {
      return prefixMatches.slice(0, MAX_SUGGESTIONS).map((text) => ({ text, type: 'autocomplete' }));
    }

    if (lower.length >= 3) {
      const spellingMatches = list.filter((word) => isEditDistanceOne(word.toLowerCase(), lower));
      if (spellingMatches.length) {
        return spellingMatches.slice(0, MAX_SUGGESTIONS).map((text) => ({ text, type: 'spelling' }));
      }
    }

    return [];
  }

  return { getSuggestions, MAX_SUGGESTIONS };
});
