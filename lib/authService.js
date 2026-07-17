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
// unknown email, wrong password, or a data-integrity gap like a missing
// profile) - answering differently for each would let a caller enumerate
// which accounts exist. The specific reason is only ever logged server-side
// (see logLoginFailure below), never returned to the client.
const GENERIC_LOGIN_ERROR = 'No pudimos iniciar sesión con esos datos.';

// Internal-only diagnostic codes for login failures - console only, never
// part of any HTTP response, and never paired with the password.
function logLoginFailure(code) {
  console.warn(`[auth] login failed: ${code}`);
}

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
      email: normalizedEmail,
      message: 'Te enviamos un código de 6 dígitos a tu correo. Revisa también la carpeta de spam.'
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
  // (resolveLoginEmail/resolveEmailByUsername already logged the specific
  // USERNAME_NOT_FOUND/PROFILE_MISSING reason internally.)
  if (!resolvedEmail) {
    throw httpError(GENERIC_LOGIN_ERROR, 401);
  }

  if (config.isSupabaseConfigured) {
    // Fresh client per the documented rule in supabaseClient.js: signInWithPassword
    // sets session state on whatever client calls it, so it must never run
    // on the cached getSupabaseAdmin() singleton (resolveLoginEmail above
    // only ever used that singleton for a plain .from() read, never .auth.*).
    // Kept in a variable (not re-called) so the AAL check below reuses the
    // exact same session it just established, rather than a blank one.
    const authClient = createAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email: resolvedEmail,
      password
    });
    if (error) {
      if (error.code === 'email_not_confirmed') {
        logLoginFailure('EMAIL_NOT_CONFIRMED');
        const err = httpError('Confirma tu correo antes de iniciar sesión.', 403);
        err.code = 'EMAIL_NOT_CONFIRMED';
        // Safe to return here, unlike GENERIC_LOGIN_ERROR above: Supabase only
        // reaches this branch after the password itself already checked out
        // for this real account, so telling the client its own resolved email
        // isn't an enumeration risk - it's what lets the frontend drive the
        // OTP screen (resend-otp/verify-otp both require an email) even when
        // the student typed their username, not their email, to log in.
        err.email = resolvedEmail;
        throw err;
      }
      logLoginFailure('INVALID_CREDENTIALS');
      throw httpError(GENERIC_LOGIN_ERROR, 401);
    }

    // signInWithPassword succeeds (at aal1) even for an MFA-enrolled
    // account - Supabase expects the caller to check the assurance level
    // itself and gate further access, rather than failing the password
    // step outright.
    let requiresMfa = false;
    try {
      const { data: aal } = await authClient.auth.mfa.getAuthenticatorAssuranceLevel();
      requiresMfa = Boolean(aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2');
    } catch {
      // If the AAL check itself fails, fail open to "no MFA required"
      // rather than locking every login out over an unrelated hiccup -
      // the account's own data/RLS is unaffected either way since no
      // sensitive action reads this flag directly.
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
      },
      requiresMfa
    };
  }

  const user = devStore.findUserByEmail(resolvedEmail);
  if (!user || !devStore.verifyPassword(user, password)) {
    logLoginFailure('INVALID_CREDENTIALS');
    throw httpError(GENERIC_LOGIN_ERROR, 401);
  }
  const session = devToken.issue(user);
  return { user: { id: user.id, email: user.email, name: user.name }, session };
}

// Always returns the same neutral message regardless of whether the email
// exists, is already confirmed, or the resend call itself failed - never
// lets a caller use this endpoint to discover which accounts exist. Backs
// both /api/auth/resend-confirmation (kept for compatibility) and the new
// /api/auth/resend-otp - it's the same underlying Supabase call
// (auth.resend({type:'signup'})) regardless of whether the "Confirm signup"
// template currently renders a link or a {{ .Token }} code.
async function resendConfirmation(email) {
  const normalizedEmail = normalizeEmail(email);
  const neutral = {
    ok: true,
    message: 'Si el correo corresponde a una cuenta pendiente, recibirás un nuevo código.'
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

// Exact Supabase error codes (from @supabase/auth-js's ErrorCode type) that
// need a distinct, friendlier Spanish message - everything else falls back
// to a generic "wrong code" message rather than leaking the raw error.
const OTP_ERROR_MESSAGES = {
  otp_expired: 'El código expiró. Solicita uno nuevo.',
  over_email_send_rate_limit: 'Has solicitado demasiados códigos. Espera un momento y vuelve a intentarlo.'
};

// Phase 1 only ever verifies the signup-confirmation OTP through this
// function - password recovery has its own dedicated flow
// (requestPasswordReset + the /reset-password page) and must never share
// this code path, so `purpose` is deliberately restricted to 'signup'
// rather than accepting an arbitrary EmailOtpType from the client.
//
// type: 'signup' (not 'email') is intentional and verified against the
// installed @supabase/auth-js: EmailOtpType includes both 'signup' and
// 'email', but ResendParams (used by resendConfirmation/resendOtp below)
// only accepts 'signup' or 'email_change' for an email resend - 'email' is
// not a legal resend type at all. 'signup' is also the only type GoTrue
// actually validates the "Confirm signup" template's {{ .Token }} against
// (the 'email' type is for the separate signInWithOtp()/magic-code flow,
// a different email template) - confirmed empirically, not just from the
// type definitions: this exact code path already confirmed a real account
// end-to-end. Do not change this to 'email' without re-verifying both of
// the above against whatever SDK version is installed at the time.
const SUPPORTED_OTP_PURPOSES = new Set(['signup']);

// Confirms the account via the 6-digit code (not a link) - deliberately
// does NOT return the Supabase session to the caller even though
// verifyOtp() itself produces one: the confirmed-account screen sends the
// student to a normal login instead of auto-signing them in (see the
// "Iniciar sesión" button in the spec) - fewer session-state paths to
// reason about, and it's what the requested UI text says to build.
async function verifyOtp({ email, token, purpose = 'signup' }) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedToken = String(token || '').trim();

  if (!SUPPORTED_OTP_PURPOSES.has(purpose)) {
    throw httpError('Solicitud no válida.', 400);
  }
  if (!normalizedEmail || !trimmedToken) {
    throw httpError('Ingresa el código de 6 dígitos.', 400);
  }
  if (!/^\d{6}$/.test(trimmedToken)) {
    throw httpError('El código debe tener 6 dígitos.', 400);
  }

  if (!config.isSupabaseConfigured) {
    // devStore accounts are created already-confirmed (see register()) -
    // this path only exists so the frontend doesn't need special-casing
    // for local/CI runs without real Supabase.
    throw httpError('No hay una verificación pendiente para confirmar.', 400);
  }

  // Fresh client - verifyOtp sets session state on whatever instance calls
  // it, same rule as signInWithPassword/getUser (see supabaseClient.js) -
  // and this session is intentionally discarded below anyway.
  const { error } = await createAuthClient().auth.verifyOtp({
    email: normalizedEmail,
    token: trimmedToken,
    type: purpose
  });

  if (error) {
    const message = OTP_ERROR_MESSAGES[error.code] || 'El código no es válido.';
    const err = httpError(message, error.code === 'otp_expired' ? 400 : 401);
    err.code = error.code;
    throw err;
  }

  return { ok: true, message: 'Tu cuenta fue confirmada correctamente.' };
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
      'Si existe una cuenta asociada a este correo, te hemos enviado un enlace para restablecer tu contraseña. Revisa también Spam o Correo no deseado.'
  };

  if (!config.isSupabaseConfigured || !normalizedEmail) {
    return neutral;
  }

  // Visibility into Supabase's send rate limits without ever logging the
  // email itself (not even partially) - just enough to notice "we're being
  // throttled" from the logs alone.
  const startedAt = Date.now();
  try {
    const { error } = await createAuthClient().auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: PASSWORD_RESET_REDIRECT_URL
    });
    console.log(
      `[auth] password reset request: status=${error ? 'error' : 'ok'} errorCode=${error?.code || '-'} durationMs=${Date.now() - startedAt}`
    );
  } catch (error) {
    console.log(
      `[auth] password reset request: status=error errorCode=${error?.code || 'unknown'} durationMs=${Date.now() - startedAt}`
    );
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
  verifyOtp,
  logout,
  resendConfirmation,
  requestPasswordReset,
  httpError
};
