// lib/authService.js
// Wraps registration, login and token verification. Uses real Supabase Auth
// when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are configured, and an
// in-memory dev store otherwise so the app still works locally and in CI.
const crypto = require('crypto');
const config = require('./config');
const { createAuthClient, getSupabaseAdmin } = require('./supabaseClient');
const devStore = require('./devStore');
const devToken = require('./devToken');
const profilesService = require('./profilesService');

// Short correlation id for the observability logs below - lets ops
// correlate "signup accepted" with a later "SMTP failed" report from
// Brevo/a user without ever needing to log the email itself. Never
// persisted, never returned to the client.
function newRequestId() {
  return crypto.randomUUID().slice(0, 8);
}

// Safe operational log for every Supabase-Auth call that triggers an email
// send (signUp, resend, resetPasswordForEmail) - operation/status/errorCode/
// durationMs/requestId/provider only. Deliberately never given the email,
// password, OTP, code or any token as a field, so no caller can accidentally
// widen what this line prints - see classifyEmailError below for errorCode.
function logEmailOperation({ operation, status, errorCode, durationMs, requestId }) {
  console.log(
    `[auth-email] operation=${operation} status=${status} errorCode=${errorCode || 'none'} durationMs=${durationMs} requestId=${requestId || 'none'} provider=supabase-brevo-smtp`
  );
}

// Exact GoTrue error codes that map directly to one of the internal
// classifications logEmailOperation's errorCode uses - everything else falls
// through to the pattern checks (redirect/token) and finally
// UNKNOWN_EMAIL_ERROR below. 'unexpected_failure' is GoTrue's generic code
// for a real SMTP/provider failure (there is no dedicated "email send
// failed" code as of the installed @supabase/auth-js) - see
// SIGNUP_ERROR_MESSAGES's comment for the same observation.
const EMAIL_ERROR_CLASSIFICATIONS = {
  over_email_send_rate_limit: 'EMAIL_RATE_LIMIT',
  email_not_confirmed: 'EMAIL_NOT_CONFIRMED',
  otp_expired: 'INVALID_TOKEN',
  signup_disabled: 'SMTP_CONFIGURATION_ERROR',
  email_provider_disabled: 'SMTP_CONFIGURATION_ERROR',
  unexpected_failure: 'SMTP_DELIVERY_ERROR'
};

function classifyEmailError(error) {
  const code = String(error?.code || '');
  if (EMAIL_ERROR_CLASSIFICATIONS[code]) return EMAIL_ERROR_CLASSIFICATIONS[code];
  if (error?.status === 429) return 'EMAIL_RATE_LIMIT';
  if (/redirect/i.test(code) || /redirect/i.test(error?.message || '')) return 'INVALID_REDIRECT';
  if (/token/i.test(code)) return 'INVALID_TOKEN';
  return 'UNKNOWN_EMAIL_ERROR';
}

// Simple structural check, not RFC 5322 validation - just enough to decide
// "does this look like an email" vs "treat it as a username" for login.
const EMAIL_LIKE_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Same generic message regardless of *why* login failed (unknown username,
// unknown email, wrong password, or a data-integrity gap like a missing
// profile) - answering differently for each would let a caller enumerate
// which accounts exist. The specific reason is only ever logged server-side
// (see logLoginFailure below), never returned to the client.
const GENERIC_LOGIN_ERROR = 'Nombre de usuario, correo o contraseña incorrectos.';

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
// The ?auth=confirmed query lets script.js's initEmailConfirmedPage()
// recognize a landing from the confirmation email's link (compat path -
// the 6-digit OTP in showSignupPending() is still the primary flow).
const EMAIL_CONFIRM_REDIRECT_URL = 'https://andergo.online/?auth=confirmed';

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

// Exact Supabase error codes (from @supabase/auth-js's ErrorCode type) that
// need a distinct, friendlier Spanish message on signUp() - everything else
// (including 'unexpected_failure', which is what GoTrue returns for a real
// SMTP/provider failure - there is no dedicated "email send failed" code as
// of the installed SDK) falls back to a generic send-failure message.
// error.message must never reach the client directly: it's Supabase's own
// English text and occasionally echoes provider-specific detail.
const SIGNUP_ERROR_MESSAGES = {
  weak_password: 'La contraseña es demasiado débil. Usa al menos 8 caracteres con letras y números.',
  email_address_invalid: 'Ese correo no es válido.',
  over_email_send_rate_limit: 'Espera un momento antes de solicitar otro correo.',
  signup_disabled: 'El registro no está disponible en este momento.'
};
const SIGNUP_SEND_FAILURE_MESSAGE = 'No pudimos procesar el envío en este momento. Inténtalo nuevamente.';

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
    const requestId = newRequestId();
    const startedAt = Date.now();
    // signUp() (not admin.createUser) so Supabase enforces "Confirm email"
    // and actually sends the confirmation email (OTP + compat link) -
    // admin.createUser bypasses both. No signInWithPassword call here: a
    // session must never start until the address is confirmed.
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
    const durationMs = Date.now() - startedAt;

    if (error) {
      if (isDuplicateEmailError(error)) {
        logEmailOperation({
          operation: 'REGISTER_EMAIL_REQUEST',
          status: 'blocked',
          errorCode: 'DUPLICATE_EMAIL',
          durationMs,
          requestId
        });
        throw httpError('Este correo ya está registrado. Inicia sesión.', 409);
      }
      // Covers real SMTP/provider failures (e.g. Brevo rejecting or timing
      // out) as well as any other signUp() error - error.code/status only,
      // never the email or password.
      logEmailOperation({
        operation: 'REGISTER_EMAIL_REQUEST',
        status: 'error',
        errorCode: classifyEmailError(error),
        durationMs,
        requestId
      });
      const message = SIGNUP_ERROR_MESSAGES[error.code] || SIGNUP_SEND_FAILURE_MESSAGE;
      throw httpError(message, error.status || 400);
    }

    // Supabase's anti-enumeration behavior: signUp() for an email that
    // already belongs to an account returns no error at all - just a user
    // object with an empty identities array - instead of a distinct error,
    // specifically so a caller can't probe which emails are registered.
    // Detected explicitly here since `error` alone won't catch this case.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      logEmailOperation({
        operation: 'REGISTER_EMAIL_REQUEST',
        status: 'blocked',
        errorCode: 'DUPLICATE_EMAIL',
        durationMs,
        requestId
      });
      throw httpError('Este correo ya está registrado. Inicia sesión.', 409);
    }

    logEmailOperation({
      operation: 'REGISTER_EMAIL_REQUEST',
      status: 'ok',
      errorCode: null,
      durationMs,
      requestId
    });

    // Supabase Auth's "Confirm Email" setting decides this, not anything in
    // this app: with it OFF, signUp() returns an active session immediately
    // and there is nothing to confirm - the OTP screen must never open. With
    // it ON, signUp() returns a user but session is null until the code is
    // verified, and requiresEmailConfirmation:true below is what drives the
    // frontend's showSignupPending() OTP step (see signupForm's submit
    // handler in script.js). Branching on data.session (not on any local
    // config flag) keeps this correct automatically if the dashboard setting
    // is ever flipped back on.
    if (data.session) {
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: normalizedName,
          username: trimmedUsername || null,
          emailConfirmedAt: data.user.email_confirmed_at || null
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        }
      };
    }

    return {
      success: true,
      requiresEmailConfirmation: true,
      email: normalizedEmail,
      message:
        'Te enviamos un código de 6 dígitos a tu correo para confirmar tu cuenta. Revisa también Spam, Promociones o Correo no deseado.'
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
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username || null,
      // devStore accounts are created already-confirmed (no real email to
      // confirm - see register() above), so this is always "now", not a
      // fabricated value standing in for a real confirmation.
      emailConfirmedAt: new Date().toISOString()
    },
    session
  };
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
    const startedAt = Date.now();
    const { data, error } = await authClient.auth.signInWithPassword({
      email: resolvedEmail,
      password
    });
    if (error) {
      if (error.code === 'email_not_confirmed') {
        logLoginFailure('EMAIL_NOT_CONFIRMED');
        // Same safe operational log shape as every other email-related
        // operation (see logEmailOperation above) - server-side diagnostic
        // signal for "credentials were correct but the account is still
        // pending", distinct from LOGIN_EMAIL_NOT_CONFIRMED never logging
        // the email/password themselves.
        logEmailOperation({
          operation: 'LOGIN_EMAIL_NOT_CONFIRMED',
          status: 'blocked',
          errorCode: 'EMAIL_NOT_CONFIRMED',
          durationMs: Date.now() - startedAt,
          requestId: newRequestId()
        });
        const err = httpError('Debes confirmar tu correo antes de iniciar sesión.', 403);
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
        name: data.user.user_metadata?.name || null,
        // Both read by the frontend's shouldShowUsernameOnboarding()/
        // hasValidUsername() (see src/js/script.js) - username here is only
        // ever a fallback (profiles.username/username_normalized is the
        // real source of truth, loaded separately via GET /api/preferences)
        // for the moment right after login, before that fetch resolves.
        username: data.user.user_metadata?.username || null,
        emailConfirmedAt: data.user.email_confirmed_at || null
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
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username || null,
      // devStore accounts are created already-confirmed (no real email to
      // confirm - see register() above), so this is always "now", not a
      // fabricated value standing in for a real confirmation.
      emailConfirmedAt: new Date().toISOString()
    },
    session
  };
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

  const requestId = newRequestId();
  const startedAt = Date.now();
  try {
    const { error } = await createAuthClient().auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: { emailRedirectTo: EMAIL_CONFIRM_REDIRECT_URL }
    });
    if (error) throw error;
    logEmailOperation({
      operation: 'RESEND_CONFIRMATION_REQUEST',
      status: 'ok',
      errorCode: null,
      durationMs: Date.now() - startedAt,
      requestId
    });
  } catch (error) {
    // classifyEmailError distinguishes "Supabase's own rate limit fired"
    // (matching the dashboard's configured minimum interval) from a real
    // SMTP/provider failure - never the email itself, and the response to
    // the caller stays neutral either way.
    logEmailOperation({
      operation: 'RESEND_CONFIRMATION_REQUEST',
      status: 'error',
      errorCode: classifyEmailError(error),
      durationMs: Date.now() - startedAt,
      requestId
    });
  }

  return neutral;
}

// Exact Supabase error codes (from @supabase/auth-js's ErrorCode type) that
// need a distinct, friendlier Spanish message - everything else falls back
// to a generic "wrong code" message rather than leaking the raw error.
const OTP_ERROR_MESSAGES = {
  otp_expired: 'El código expiró. Solicita uno nuevo.',
  over_email_send_rate_limit: 'Espera un momento antes de solicitar otro correo.'
};

// classifyEmailError's taxonomy is shared across every email-send operation
// (signup, resend, password reset); the confirmation callback needs its own
// narrower taxonomy instead, since here "expired"/"invalid" describes the
// token the student typed, not a send failure - matches the CONFIRMATION_CALLBACK
// classification spec exactly (EMAIL_RATE_LIMIT / EXPIRED_CONFIRMATION_LINK /
// INVALID_CONFIRMATION_LINK / AUTH_CALLBACK_FAILED).
function classifyConfirmationCallbackError(error) {
  const code = String(error?.code || '');
  if (code === 'otp_expired') return 'EXPIRED_CONFIRMATION_LINK';
  if (code === 'over_email_send_rate_limit' || error?.status === 429) return 'EMAIL_RATE_LIMIT';
  if (code) return 'INVALID_CONFIRMATION_LINK';
  return 'AUTH_CALLBACK_FAILED';
}

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

  const requestId = newRequestId();
  const startedAt = Date.now();

  // Fresh client - verifyOtp sets session state on whatever instance calls
  // it, same rule as signInWithPassword/getUser (see supabaseClient.js) -
  // and this session is intentionally discarded below anyway.
  const { error } = await createAuthClient().auth.verifyOtp({
    email: normalizedEmail,
    token: trimmedToken,
    type: purpose
  });
  const durationMs = Date.now() - startedAt;

  if (error) {
    // errorCode distinguishes "wrong code" from "expired code" (otp_expired)
    // in the logs without ever logging the code itself - see
    // OTP_ERROR_MESSAGES above for the user-facing text these map to.
    logEmailOperation({
      operation: 'CONFIRMATION_CALLBACK',
      status: 'error',
      errorCode: classifyConfirmationCallbackError(error),
      durationMs,
      requestId
    });
    const message = OTP_ERROR_MESSAGES[error.code] || 'El código no es válido.';
    const err = httpError(message, error.code === 'otp_expired' ? 400 : 401);
    err.code = error.code;
    throw err;
  }

  logEmailOperation({
    operation: 'CONFIRMATION_CALLBACK',
    status: 'ok',
    errorCode: null,
    durationMs,
    requestId
  });
  return { ok: true, message: 'Tu correo fue confirmado correctamente.' };
}

// Must match a URL listed under Authentication -> URL Configuration ->
// Redirect URLs in the Supabase dashboard (same requirement as
// EMAIL_CONFIRM_REDIRECT_URL above), or Supabase rejects/ignores it.
const PASSWORD_RESET_REDIRECT_URL = 'https://andergo.online/?auth=recovery';

// Same neutral-response shape as resendConfirmation and for the same
// reason: whether the email exists, isn't confirmed, or the send itself
// failed, the caller always sees the same message - never a signal an
// attacker could use to check which emails have accounts.
async function requestPasswordReset(email) {
  const normalizedEmail = normalizeEmail(email);
  const neutral = {
    ok: true,
    message:
      'Si existe una cuenta asociada a este correo, recibirás un enlace para restablecer tu contraseña. Revisa también Spam o Correo no deseado.'
  };

  if (!config.isSupabaseConfigured || !normalizedEmail) {
    return neutral;
  }

  // Visibility into Supabase's send rate limits without ever logging the
  // email itself (not even partially) - just enough to notice "we're being
  // throttled" from the logs alone.
  const requestId = newRequestId();
  const startedAt = Date.now();
  try {
    const { error } = await createAuthClient().auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: PASSWORD_RESET_REDIRECT_URL
    });

    if (error) {
      throw error;
    }

    logEmailOperation({
      operation: 'PASSWORD_RESET_REQUEST',
      status: 'ok',
      errorCode: null,
      durationMs: Date.now() - startedAt,
      requestId
    });
  } catch (error) {
    logEmailOperation({
      operation: 'PASSWORD_RESET_REQUEST',
      status: 'error',
      errorCode: classifyEmailError(error),
      durationMs: Date.now() - startedAt,
      requestId
    });
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

// Supabase access tokens expire (1h by default) - the client already
// stores session.refresh_token (see login() above) but nothing ever used
// it, so every requireAuth-gated route silently started 401ing
// ("Debes iniciar sesión para continuar.") after an hour even though the
// browser still showed the user as signed in. This exchanges the refresh
// token for a new access/refresh pair; the frontend calls it once on a
// 401 and retries the original request (see refreshAuthSession() in
// script.js). Dev-token mode has no refresh_token (tokens already last a
// week, see lib/devToken.js) - refresh simply isn't needed there.
async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw httpError('Falta el token de actualización.', 400);
  }
  if (!config.isSupabaseConfigured) {
    throw httpError('La actualización de sesión no está disponible en este modo.', 400);
  }

  const { data, error } = await createAuthClient().auth.refreshSession({
    refresh_token: refreshToken
  });
  if (error || !data?.session || !data?.user) {
    throw httpError('Tu sesión expiró. Inicia sesión de nuevo.', 401);
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || null,
      username: data.user.user_metadata?.username || null,
      emailConfirmedAt: data.user.email_confirmed_at || null
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    }
  };
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
  refreshSession,
  httpError,
  // Exported for server.test.js only - lets the email-flow tests assert the
  // redirect URLs/error classification directly instead of triggering a
  // real Supabase signUp()/resend()/resetPasswordForEmail() call, which
  // would send a real email through the live Brevo SMTP relay on every
  // test run.
  EMAIL_CONFIRM_REDIRECT_URL,
  PASSWORD_RESET_REDIRECT_URL,
  classifyEmailError,
  classifyConfirmationCallbackError
};
