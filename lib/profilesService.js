// lib/profilesService.js
// Username validation, normalization, and the ONLY two places allowed to
// read a username <-> profile row: availability checks and login-by-username
// resolution. Both use getSupabaseAdmin() (service role, bypasses RLS) -
// there is deliberately no public/anon Supabase policy that lets a client
// query profiles by username, so a correct email is never reachable except
// through these two narrow, server-side functions.
const { getSupabaseAdmin } = require('./supabaseClient');
const devStore = require('./devStore');

const USERNAME_MIN_LENGTH = 4;
const USERNAME_MAX_LENGTH = 24;
const USERNAME_PATTERN = /^[a-z0-9._]+$/i;

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

function normalizeUsername(username) {
  return String(username || '')
    .trim()
    .toLowerCase();
}

// Validates the trimmed, as-typed username (before lowercasing) - format
// rules apply the same regardless of case, but the value stored/displayed
// keeps the student's original casing (see authService.register).
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
  if (!USERNAME_PATTERN.test(trimmed)) {
    return {
      valid: false,
      message:
        'El nombre de usuario solo puede incluir letras, números, punto o guion bajo, sin espacios.'
    };
  }
  if (RESERVED_USERNAMES.has(trimmed.toLowerCase())) {
    return { valid: false, message: 'Ese nombre de usuario no está disponible.' };
  }

  return { valid: true, message: '' };
}

// Read-only, single exact-match lookup - never a partial/ILIKE search, so
// this can't be used to list or enumerate usernames, only to answer
// "is this exact one taken".
async function isUsernameAvailable(normalizedUsername) {
  const admin = getSupabaseAdmin();
  if (!admin) return !devStore.findUserByUsername(normalizedUsername);

  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .eq('username_normalized', normalizedUsername)
    .maybeSingle();

  if (error) {
    const err = new Error('No se pudo comprobar la disponibilidad del nombre de usuario.');
    err.status = 500;
    throw err;
  }
  return !data;
}

// Used only by authService.login()'s username branch - resolves to an email
// (needed because Supabase Auth only signs in with email+password), never
// returned to any HTTP response.
async function resolveEmailByUsername(normalizedUsername) {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data, error } = await admin
    .from('profiles')
    .select('email')
    .eq('username_normalized', normalizedUsername)
    .maybeSingle();

  if (error || !data) return null;
  return data.email || null;
}

function usernameNotAvailableError() {
  const err = new Error('Ese nombre de usuario no está disponible.');
  err.status = 409;
  err.code = 'USERNAME_NOT_AVAILABLE';
  return err;
}

// Used by the "create your username" onboarding (pre-migration accounts
// logging in with profiles.username still null). Same pre-check + graceful
// race handling as registration: the partial unique index on
// username_normalized is the real authority, this just gives a friendlier
// error than a raw Postgres 23505 when it fires.
async function claimUsername(userId, rawUsername) {
  const formatCheck = validateUsernameFormat(rawUsername);
  if (!formatCheck.valid) {
    const err = new Error(formatCheck.message);
    err.status = 400;
    throw err;
  }

  const trimmedUsername = String(rawUsername).trim();
  const normalizedUsername = normalizeUsername(trimmedUsername);

  const available = await isUsernameAvailable(normalizedUsername);
  if (!available) {
    throw usernameNotAvailableError();
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    devStore.setUsername(userId, trimmedUsername, normalizedUsername);
    return { username: trimmedUsername, usernameNormalized: normalizedUsername };
  }

  const { error } = await admin
    .from('profiles')
    .update({ username: trimmedUsername, username_normalized: normalizedUsername })
    .eq('id', userId);

  if (error) {
    // 23505 = unique_violation - someone else claimed it in the instant
    // between the check above and this update (rare race).
    if (error.code === '23505') {
      throw usernameNotAvailableError();
    }
    const err = new Error('No se pudo guardar el nombre de usuario.');
    err.status = 500;
    throw err;
  }

  return { username: trimmedUsername, usernameNormalized: normalizedUsername };
}

module.exports = {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  normalizeUsername,
  validateUsernameFormat,
  isUsernameAvailable,
  resolveEmailByUsername,
  claimUsername
};
