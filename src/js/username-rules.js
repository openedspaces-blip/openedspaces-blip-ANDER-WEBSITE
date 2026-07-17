// src/js/username-rules.js
// Single source of truth for username formatting rules - loaded as a plain
// <script> in the browser (window.AndergoUsernameRules) and required() from
// Node (lib/profilesService.js), so the client-side availability check and
// the server-side authoritative check can never disagree on what counts as
// a validly-formatted username.
(function (root, factory) {
  const rules = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = rules;
  } else {
    root.AndergoUsernameRules = rules;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const USERNAME_MIN_LENGTH = 4;
  const USERNAME_MAX_LENGTH = 24;
  // Letters, numbers, dot, underscore and hyphen - a leading/trailing dot is
  // rejected separately below so the message can call that out specifically.
  const USERNAME_PATTERN = /^[a-z0-9._-]+$/i;

  // "Como mínimo" list from the spec - extend here, never relax it.
  const RESERVED_USERNAMES = new Set([
    'admin',
    'administrator',
    'root',
    'support',
    'andergo',
    'tutor',
    'system',
    'moderator',
    'api',
    'null',
    'undefined'
  ]);

  // Canonical comparison/storage form: trim, drop any stray whitespace, and
  // lowercase. Does not validate - call validateUsernameFormat first (a
  // value that fails it should never reach here).
  function normalizeUsername(value) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, '')
      .toLowerCase();
  }

  // Validates the trimmed, as-typed username (before lowercasing) - format
  // rules apply the same regardless of case, but the value stored/displayed
  // keeps the student's original casing.
  function validateUsernameFormat(rawUsername) {
    const trimmed = String(rawUsername || '').trim();

    if (!trimmed) {
      return { valid: false, message: 'El nombre de usuario es obligatorio.' };
    }
    if (trimmed.length < USERNAME_MIN_LENGTH || trimmed.length > USERNAME_MAX_LENGTH) {
      return {
        valid: false,
        message: `El nombre de usuario debe tener entre ${USERNAME_MIN_LENGTH} y ${USERNAME_MAX_LENGTH} caracteres.`
      };
    }
    if (trimmed.startsWith('.')) {
      return {
        valid: false,
        message: 'El nombre de usuario no puede empezar con un punto.'
      };
    }
    if (trimmed.endsWith('.')) {
      return {
        valid: false,
        message: 'El nombre de usuario no puede terminar con un punto.'
      };
    }
    if (!USERNAME_PATTERN.test(trimmed)) {
      return {
        valid: false,
        message:
          'El nombre de usuario solo puede incluir letras, números, punto, guion o guion bajo, sin espacios.'
      };
    }
    if (RESERVED_USERNAMES.has(trimmed.toLowerCase())) {
      return { valid: false, message: 'Ese nombre de usuario no está disponible.' };
    }

    return { valid: true, message: '' };
  }

  return {
    USERNAME_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    normalizeUsername,
    validateUsernameFormat
  };
});
