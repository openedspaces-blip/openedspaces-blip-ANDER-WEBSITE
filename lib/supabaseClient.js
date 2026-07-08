// lib/supabaseClient.js
// Lazily creates a single Supabase admin client (service role key) shared by
// the whole process. Returns null when Supabase isn't configured so callers
// can fall back to local/dev behavior instead of crashing.
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

module.exports = { getSupabaseAdmin };
