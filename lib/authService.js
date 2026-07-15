// lib/authService.js
// Wraps registration, login and token verification. Uses real Supabase Auth
// when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are configured, and an
// in-memory dev store otherwise so the app still works locally and in CI.
const config = require('./config');
const { createAuthClient } = require('./supabaseClient');
const devStore = require('./devStore');
const devToken = require('./devToken');

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

async function register({ email, password, name }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = (name || '').trim();
  if (!normalizedEmail || !password) {
    throw httpError('Email and password are required.', 400);
  }

  if (config.isSupabaseConfigured) {
    // signUp() (not admin.createUser) so Supabase enforces "Confirm email"
    // and actually sends the confirmation link - admin.createUser bypasses
    // both. No signInWithPassword call here: a session must never start
    // until the address is confirmed.
    const { data, error } = await createAuthClient().auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name: normalizedName, full_name: normalizedName },
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
  const user = devStore.createUser({ email: normalizedEmail, password, name: normalizedName });
  const session = devToken.issue(user);
  return { user: { id: user.id, email: user.email, name: user.name }, session };
}

async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    throw httpError('Email and password are required.', 400);
  }

  if (config.isSupabaseConfigured) {
    const { data, error } = await createAuthClient().auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    if (error) {
      if (error.code === 'email_not_confirmed') {
        throw httpError('Debes confirmar tu correo electrónico antes de iniciar sesión.', 403);
      }
      throw httpError('Invalid email or password.', 401);
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

  const user = devStore.findUserByEmail(normalizedEmail);
  if (!user || !devStore.verifyPassword(user, password)) {
    throw httpError('Invalid email or password.', 401);
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

module.exports = { register, login, verifyToken, logout, resendConfirmation, httpError };
