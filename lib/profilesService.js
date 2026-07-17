// lib/profilesService.js
// Username validation, normalization, and the ONLY two places allowed to
// read a username <-> profile row: availability checks and login-by-username
// resolution. Both use getSupabaseAdmin() (service role, bypasses RLS) -
// there is deliberately no public/anon Supabase policy that lets a client
// query profiles by username, so a correct email is never reachable except
// through these two narrow, server-side functions.
const { getSupabaseAdmin } = require('./supabaseClient');
const devStore = require('./devStore');
// Format rules (min/max length, allowed characters, leading/trailing dot,
// reserved words) live in one place shared with the browser - see that
// file's header comment for why.
const { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, normalizeUsername, validateUsernameFormat } =
  require('../src/js/username-rules');

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
// returned to any HTTP response. Logs the specific internal-only reason
// (console only, never part of the generic client-facing error) so ops can
// tell "no such username" apart from "found the profile but it has no
// usable email on file" without either ever reaching the browser.
async function resolveEmailByUsername(normalizedUsername) {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data, error } = await admin
    .from('profiles')
    .select('email')
    .eq('username_normalized', normalizedUsername)
    .maybeSingle();

  if (error || !data) {
    console.warn('[auth] login failed: USERNAME_NOT_FOUND');
    return null;
  }
  if (!data.email) {
    console.warn('[auth] login failed: PROFILE_MISSING (username matched but no email on file)');
    return null;
  }
  return data.email;
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
