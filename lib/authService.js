// lib/authService.js
// Wraps registration, login and token verification. Uses real Supabase Auth
// when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are configured, and an
// in-memory dev store otherwise so the app still works locally and in CI.
const config = require('./config');
const { createAuthClient, getSupabaseAdmin } = require('./supabaseClient');
const devStore = require('./devStore');
const devToken = require('./devToken');
const profilesService = require('./profilesService');

// Simple structural check, not RFC 5322 validation - just enough to decide
// "does this look like an email" vs "treat it as a username" for login.
const EMAIL_LIKE_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Same generic message regardless of *why* login failed (unknown username,
// unknown email, or wrong password) - answering differently for each would
// let a caller enumerate which accounts exist.
const GENERIC_LOGIN_ERROR = 'Nombre de usuario, correo o contraseña incorrectos.';

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Must match a URL listed under Authentication -> URL Configuration ->
// Redirect URLs in the Supabase dashboard, or Supabase rejects/ignores it.
const EMAIL_CONFIRM_REDIRECT_URL = 'https://andergo.online/';

// Two different-looking emails that only differ by case or surrounding
// whitespace must resolve to the same account - otherwise "already
// registered" checks silently miss and login can fail for a real user.
function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

// admin.createUser's duplicate-email error carries code: 'email_exists'
// (still used by the devStore/no-Supabase fallback path's error shape check
// below via message matching, kept for that one caller).
function isDuplicateEmailError(error) {
  return error?.code === 'email_exists' || /already.*registered/i.test(error?.message || '');
}

function usernameNotAvailableError() {
  const err = httpError('Ese nombre de usuario no está disponible.', 409);
  err.code = 'USERNAME_NOT_AVAILABLE';
  return err;
}

async function register({ email, password, name, username }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = (name || '').trim();
  if (!normalizedEmail || !password) {
    throw httpError('Email and password are required.', 400);
  }

  const trimmedUsername = String(username || '').trim();
  const formatCheck = profilesService.validateUsernameFormat(trimmedUsername);
  if (!formatCheck.valid) {
    throw httpError(formatCheck.message, 400);
  }
  const normalizedUsername = profilesService.normalizeUsername(trimmedUsername);

  // Authoritative check is the DB's partial unique index (see the
  // 202607150001 migration) - this is only a fast, friendlier pre-check.
  // The rare race where two signups for the same username land at nearly
  // the same instant is handled inside handle_new_user() itself, which
  // never lets a collision block account creation (see that migration's
  // comments) - the loser just ends up without a username, same as any
  // pre-migration account, and is prompted to pick one after logging in.
  const available = await profilesService.isUsernameAvailable(normalizedUsername);
  if (!available) {
    throw usernameNotAvailableError();
  }

  const displayName = normalizedName || trimmedUsername;

  if (config.isSupabaseConfigured) {
    // signUp() (not admin.createUser) so Supabase enforces "Confirm email"
    // and actually sends the confirmation link - admin.createUser bypasses
    // both. No signInWithPassword call here: a session must never start
    // until the address is confirmed.
    const { data, error } = await createAuthClient().auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: normalizedName,
          full_name: normalizedName,
          username: trimmedUsername,
          display_name: displayName
        },
        emailRedirectTo: EMAIL_CONFIRM_REDIRECT_URL
      }
    });

    if (error) {
      if (isDuplicateEmailError(error)) {
        throw httpError('Este correo ya está registrado. Inicia sesión.', 409);
      }
      throw httpError(error.message || 'Could not create account.', error.status || 400);
    }

    // Supabase's anti-enumeration behavior: signUp() for an email that
    // already belongs to an account returns no error at all - just a user
    // object with an empty identities array - instead of a distinct error,
    // specifically so a caller can't probe which emails are registered.
    // Detected explicitly here since `error` alone won't catch this case.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw httpError('Este correo ya está registrado. Inicia sesión.', 409);
    }

    return {
      success: true,
      requiresEmailConfirmation: true,
      message: 'Te enviamos un correo de confirmación. Revisa tu bandeja de entrada y spam.'
    };
  }

  // devStore (no Supabase configured): there is no real email to confirm,
  // so registration stays immediate exactly as before - this only affects
  // local demo/CI runs, never a real account.
  if (devStore.findUserByEmail(normalizedEmail)) {
    throw httpError('Este correo ya está registrado. Inicia sesión.', 409);
  }
  if (devStore.findUserByUsername(normalizedUsername)) {
    throw usernameNotAvailableError();
  }
  const user = devStore.createUser({
    email: normalizedEmail,
    password,
    name: normalizedName,
    username: trimmedUsername
  });
  const session = devToken.issue(user);
  return { user: { id: user.id, email: user.email, name: user.name }, session };
}

// identifier may be an email or a username - see resolveLoginEmail below.
// email is still accepted as a back-compat alias for identifier so nothing
// that already calls login({ email, password }) breaks.
async function resolveLoginEmail(identifier) {
  const trimmed = String(identifier || '').trim();
  if (EMAIL_LIKE_PATTERN.test(trimmed)) {
    return normalizeEmail(trimmed);
  }

  // Looks like a username, not an email - resolve it server-side only via
  // the service-role client (profilesService.resolveEmailByUsername).
  // Never returned to the caller: on failure this function returns null and
  // the caller reacts with the exact same generic error it would show for
  // "email not found", so a probing client can't tell username-not-found
  // apart from wrong-password.
  const normalizedUsername = profilesService.normalizeUsername(trimmed);
  if (!normalizedUsername) return null;

  if (config.isSupabaseConfigured) {
    return profilesService.resolveEmailByUsername(normalizedUsername);
  }
  const devUser = devStore.findUserByUsername(normalizedUsername);
  return devUser?.email || null;
}

async function login({ identifier, email, password }) {
  const rawIdentifier = identifier ?? email;
  if (!String(rawIdentifier || '').trim() || !password) {
    throw httpError('Completa tu nombre de usuario o correo y tu contraseña.', 400);
  }

  const resolvedEmail = await resolveLoginEmail(rawIdentifier);
  // Identifier looked like a username but didn't resolve to any account -
  // fail with the exact same generic message/status used for a wrong
  // password below, instead of returning early with a distinct error.
  if (!resolvedEmail) {
    throw httpError(GENERIC_LOGIN_ERROR, 401);
  }

  if (config.isSupabaseConfigured) {
    // Fresh client per the documented rule in supabaseClient.js: signInWithPassword
    // sets session state on whatever client calls it, so it must never run
    // on the cached getSupabaseAdmin() singleton (resolveLoginEmail above
    // only ever used that singleton for a plain .from() read, never .auth.*).
    const { data, error } = await createAuthClient().auth.signInWithPassword({
      email: resolvedEmail,
      password
    });
    if (error) {
      if (error.code === 'email_not_confirmed') {
        throw httpError('Confirma tu correo electrónico antes de iniciar sesión.', 403);
      }
      throw httpError(GENERIC_LOGIN_ERROR, 401);
    }
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || null
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      }
    };
  }

  const user = devStore.findUserByEmail(resolvedEmail);
  if (!user || !devStore.verifyPassword(user, password)) {
    throw httpError(GENERIC_LOGIN_ERROR, 401);
  }
  const session = devToken.issue(user);
  return { user: { id: user.id, email: user.email, name: user.name }, session };
}

// Always returns the same neutral message regardless of whether the email
// exists, is already confirmed, or the resend call itself failed - never
// lets a caller use this endpoint to discover which accounts exist.
async function resendConfirmation(email) {
  const normalizedEmail = normalizeEmail(email);
  const neutral = {
    message: 'Si existe una cuenta pendiente para ese correo, enviaremos un nuevo enlace.'
  };

  if (!config.isSupabaseConfigured || !normalizedEmail) {
    return neutral;
  }

  try {
    await createAuthClient().auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: { emailRedirectTo: EMAIL_CONFIRM_REDIRECT_URL }
    });
  } catch {
    // Swallow - the response is neutral either way.
  }

  return neutral;
}

// Must match a URL listed under Authentication -> URL Configuration ->
// Redirect URLs in the Supabase dashboard (same requirement as
// EMAIL_CONFIRM_REDIRECT_URL above), or Supabase rejects/ignores it.
const PASSWORD_RESET_REDIRECT_URL = 'https://andergo.online/reset-password';

// Same neutral-response shape as resendConfirmation and for the same
// reason: whether the email exists, isn't confirmed, or the send itself
// failed, the caller always sees the same message - never a signal an
// attacker could use to check which emails have accounts.
async function requestPasswordReset(email) {
  const normalizedEmail = normalizeEmail(email);
  const neutral = {
    ok: true,
    message:
      'Si el correo está asociado a una cuenta, recibirás un enlace para restablecer tu contraseña.'
  };

  if (!config.isSupabaseConfigured || !normalizedEmail) {
    return neutral;
  }

  try {
    await createAuthClient().auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: PASSWORD_RESET_REDIRECT_URL
    });
  } catch {
    // Swallow - the response is neutral either way.
  }

  return neutral;
}

async function verifyToken(token) {
  if (!token) return null;

  if (config.isSupabaseConfigured) {
    const { data, error } = await createAuthClient().auth.getUser(token);
    if (error || !data?.user) return null;
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || null
    };
  }

  const payload = devToken.verify(token);
  if (!payload) return null;
  return { id: payload.sub, email: payload.email, name: payload.name };
}

async function logout() {
  // Sessions are stateless (Supabase JWT or signed dev token), so there is
  // nothing to invalidate server-side; the client clears its local session.
  return { ok: true };
}

module.exports = {
  register,
  login,
  verifyToken,
  logout,
  resendConfirmation,
  requestPasswordReset,
  httpError
};
