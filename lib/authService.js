// lib/authService.js
// Wraps registration, login and token verification. Uses real Supabase Auth
// when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are configured, and an
// in-memory dev store otherwise so the app still works locally and in CI.
const config = require('./config');
const { getSupabaseAdmin, createAuthClient } = require('./supabaseClient');
const devStore = require('./devStore');
const devToken = require('./devToken');

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function register({ email, password, name }) {
  if (!email || !password) {
    throw httpError('Email and password are required.', 400);
  }

  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: name ? { name } : undefined
    });
    if (error) {
      throw httpError(error.message || 'Could not create account.', error.status || 400);
    }

    const { data: signInData, error: signInError } = await createAuthClient().auth.signInWithPassword({ email, password });
    if (signInError) {
      // Account exists but we couldn't start a session automatically.
      throw httpError('Account created. Please log in.', 200);
    }

    return {
      user: { id: data.user.id, email: data.user.email, name: name || data.user.user_metadata?.name || null },
      session: {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token
      }
    };
  }

  if (devStore.findUserByEmail(email)) {
    throw httpError('An account with this email already exists.', 409);
  }
  const user = devStore.createUser({ email, password, name });
  const session = devToken.issue(user);
  return { user: { id: user.id, email: user.email, name: user.name }, session };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw httpError('Email and password are required.', 400);
  }

  if (config.isSupabaseConfigured) {
    const { data, error } = await createAuthClient().auth.signInWithPassword({ email, password });
    if (error) {
      throw httpError('Invalid email or password.', 401);
    }
    return {
      user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || null },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      }
    };
  }

  const user = devStore.findUserByEmail(email);
  if (!user || !devStore.verifyPassword(user, password)) {
    throw httpError('Invalid email or password.', 401);
  }
  const session = devToken.issue(user);
  return { user: { id: user.id, email: user.email, name: user.name }, session };
}

async function verifyToken(token) {
  if (!token) return null;

  if (config.isSupabaseConfigured) {
    const { data, error } = await createAuthClient().auth.getUser(token);
    if (error || !data?.user) return null;
    return { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || null };
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

module.exports = { register, login, verifyToken, logout, httpError };
