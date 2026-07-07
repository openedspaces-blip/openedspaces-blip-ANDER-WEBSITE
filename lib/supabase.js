const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// pg module is optional - only required if SUPABASE_DATABASE_URL is configured
let pgClient = null;
try {
  pgClient = require('pg').Client;
} catch (err) {
  // pg is optional, not required for basic Supabase operations
  console.debug('pg module not available - direct database operations disabled');
}

/**
 * Get environment variables with lazy loading to ensure dotenv is loaded first
 */
function getEnvVars() {
  return {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseDatabaseUrl: process.env.SUPABASE_DATABASE_URL
  };
}

/**
 * Validates that a value is not a placeholder or empty
 */
function isPlaceholderValue(value) {
  return typeof value !== 'string' || !value.trim() || /tu_|your_|example|placeholder/i.test(value);
}

/**
 * Checks Supabase configuration and returns error message if invalid
 */
function getSupabaseConfigError() {
  const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getEnvVars();

  if (!supabaseUrl || isPlaceholderValue(supabaseUrl)) {
    return 'Missing or invalid SUPABASE_URL in environment variables. Expected format: https://your-project-id.supabase.co';
  }
  if (!supabaseAnonKey || isPlaceholderValue(supabaseAnonKey)) {
    return 'Missing or invalid SUPABASE_ANON_KEY in environment variables. Expected format: eyJ... (Publishable Key)';
  }
  if (!supabaseServiceRoleKey || isPlaceholderValue(supabaseServiceRoleKey)) {
    return 'Missing or invalid SUPABASE_SERVICE_ROLE_KEY in environment variables. Expected format: eyJ... (Secret Key)';
  }
  if (supabaseServiceRoleKey === supabaseAnonKey) {
    return 'SUPABASE_SERVICE_ROLE_KEY must be the secret service role key, not the public anon key.';
  }
  return null;
}

/**
 * Initialize Supabase client with error checking
 * This uses the ANON_KEY for public operations (with RLS)
 */
function getSupabaseClient() {
  const configError = getSupabaseConfigError();
  if (configError) {
    return null;
  }

  const { supabaseUrl, supabaseAnonKey } = getEnvVars();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

/**
 * Initialize Supabase admin client with error checking
 * This uses the SERVICE_ROLE_KEY for privileged operations (bypasses RLS)
 * IMPORTANT: This key must ONLY be used server-side, never exposed to frontend
 */
function getSupabaseAdmin() {
  const configError = getSupabaseConfigError();
  if (configError) {
    return null;
  }

  const { supabaseUrl, supabaseServiceRoleKey } = getEnvVars();
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

// Cache for clients
let cachedClient = null;
let cachedAdmin = null;

function supabaseClient() {
  if (!cachedClient) {
    cachedClient = getSupabaseClient();
  }
  return cachedClient;
}

function supabaseAdmin() {
  if (!cachedAdmin) {
    cachedAdmin = getSupabaseAdmin();
  }
  return cachedAdmin;
}

/**
 * Ensures the profiles table exists with proper schema and RLS policies
 * This is called during health checks and should be idempotent
 * Note: This requires SUPABASE_DATABASE_URL and pg module to be installed
 */
async function ensureProfilesTable() {
  const { supabaseDatabaseUrl } = getEnvVars();

  if (!supabaseDatabaseUrl || isPlaceholderValue(supabaseDatabaseUrl)) {
    return;
  }

  if (!pgClient) {
    console.debug('Cannot ensure profiles table: pg module not available');
    return;
  }

  const schemaPath = path.resolve(__dirname, 'supabase-schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const client = new pgClient({ connectionString: supabaseDatabaseUrl });
  try {
    await client.connect();
    await client.query(sql);
  } catch (error) {
    console.error('Failed to ensure profiles table:', error.message);
  } finally {
    await client.end();
  }
}

module.exports = {
  supabaseClient,
  supabaseAdmin,
  getSupabaseConfigError,
  ensureProfilesTable
};
