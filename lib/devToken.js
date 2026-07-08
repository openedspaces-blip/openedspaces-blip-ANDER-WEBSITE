// lib/devToken.js
// Minimal signed token for dev/demo mode only (no Supabase configured).
// This is NOT a replacement for real auth in production - it exists so the
// app, tests and local previews work without any external service.
const crypto = require('crypto');
const config = require('./config');

const WEEK_MS = 1000 * 60 * 60 * 24 * 7;

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload) {
  const body = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', config.devTokenSecret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verify(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', config.devTokenSecret).update(body).digest('base64url');
  if (signature !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function issue(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Date.now() + WEEK_MS
  };
  return { access_token: sign(payload), token_type: 'dev', expires_in: WEEK_MS / 1000 };
}

module.exports = { issue, verify };
