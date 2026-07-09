const crypto = require('node:crypto');
const { users } = require('./devStore');
const { sign, verify } = require('./devToken');
const { getSupabaseClient } = require('./supabaseClient');

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function buildDevSession(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    iat: Math.floor(Date.now() / 1000)
  };
  const accessToken = sign(payload);
  return {
    access_token: accessToken,
    token_type: 'bearer',
    expires_in: 60 * 60 * 24 * 7,
    user: { id: user.id, email: user.email }
  };
}

async function register(email, password) {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) {
      throw createError(error.message, 400);
    }
    return { user: data.user, session: null };
  }

  const normalizedEmail = normalizeEmail(email);
  if (users.has(normalizedEmail)) {
    throw createError('User already exists', 409);
  }

  const user = { id: crypto.randomUUID(), email: normalizedEmail, password };
  users.set(normalizedEmail, user);
  return { user: { id: user.id, email: user.email }, session: buildDevSession(user) };
}

async function login(email, password) {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw createError(error.message, 401);
    }
    return { user: data.user, session: data.session };
  }

  const normalizedEmail = normalizeEmail(email);
  const user = users.get(normalizedEmail);
  if (!user || user.password != password) {
    throw createError('Invalid email or password', 401);
  }

  return { user: { id: user.id, email: user.email }, session: buildDevSession(user) };
}

async function logout(accessToken) {
  const supabase = getSupabaseClient();
  if (supabase && accessToken && supabase.auth.admin && typeof supabase.auth.admin.signOut === 'function') {
    await supabase.auth.admin.signOut(accessToken);
  }
}

async function getUserFromToken(token) {
  if (!token) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }
    return data.user;
  }

  const payload = verify(token);
  if (!payload || !payload.sub || !payload.email) {
    return null;
  }

  const user = users.get(normalizeEmail(payload.email));
  if (!user || user.id !== payload.sub) {
    return null;
  }

  return { id: user.id, email: user.email };
}

module.exports = {
  register,
  login,
  logout,
  getUserFromToken
};
