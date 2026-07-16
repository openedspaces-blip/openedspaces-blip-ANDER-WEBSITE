// lib/supabaseClient.js
// Lazily creates a single Supabase admin client (service role key) shared by
// the whole process. Returns null when Supabase isn't configured so callers
// can fall back to local/dev behavior instead of crashing.
//
// createAuthClient() is intentionally NOT cached/shared: `auth.getUser(jwt)`
// and `auth.signInWithPassword()` set session state on whatever client
// instance they're called on, and supabase-js's `.from()` query builder
// prefers that session's Authorization header over the service role apikey
// once one is set. Calling those two methods on the shared admin singleton
// silently downgraded every later `.from()` call on that same request (and,
// worse, any other in-flight request sharing the warm process) from
// service_role to whichever user last logged in/verified a token - RLS then
// enforced as that user instead of the backend's real privileges. A table
// with a self-service INSERT policy hid this (the row still matched
// auth.uid()); user_lesson_progress, which has no such policy, exposed it
// immediately as an RLS violation. Verified by reproducing the failure only
// through the running server (shared singleton) and never in a one-off
// script (fresh client), then confirming it disappears once auth.getUser /
// signInWithPassword move to their own throwaway client.
const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

let adminClient = null;

function getSupabaseAdmin() {
  if (!config.isSupabaseConfigured) return null;
  if (!adminClient) {
    adminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return adminClient;
}

function createAuthClient() {
  if (!config.isSupabaseConfigured) return null;
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// For MFA enroll/challenge/verify/listFactors/unenroll specifically: those
// GoTrue endpoints act on "whoever the caller is" and have no jwt-override
// parameter (unlike auth.mfa.getAuthenticatorAssuranceLevel(jwt), which
// does - see mfaService.js). The standard, Supabase-documented way to make
// a server-side call "as this user" is to send their access token as the
// Authorization header instead of the project key - a throwaway client
// per call, same non-cached rule as createAuthClient() above, so this
// never touches the shared admin singleton's session state either.
function createUserScopedClient(accessToken) {
  if (!config.isSupabaseConfigured) return null;
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}

module.exports = { getSupabaseAdmin, createAuthClient, createUserScopedClient };
