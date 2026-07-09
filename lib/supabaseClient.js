const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

let supabaseClient = null;

function getSupabaseClient() {
  if (!config.isConfigured) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return supabaseClient;
}

module.exports = { getSupabaseClient };
