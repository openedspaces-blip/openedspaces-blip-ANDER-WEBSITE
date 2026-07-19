// lib/config.js
// Central place to read environment variables. Keeping this isolated makes it
// easy to see at a glance what the server needs and lets other modules stay
// environment-agnostic.
require('dotenv').config();

function looksLikePlaceholder(value) {
  if (!value) return true;
  return value.includes('your-project-ref') || value.includes('your_') || value.includes('YOUR_');
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceRoleKey &&
  !looksLikePlaceholder(supabaseUrl) &&
  !looksLikePlaceholder(supabaseServiceRoleKey)
);

module.exports = {
  port: Number(process.env.PORT) || 3000,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  supabaseDatabaseUrl: process.env.SUPABASE_DATABASE_URL,
  isSupabaseConfigured,
  // Only used when Supabase isn't configured, so the app still runs locally
  // and in CI without real credentials. Never used to protect real user data.
  devTokenSecret: process.env.DEV_TOKEN_SECRET || 'andergo-dev-secret-change-me',
  premiumPriceUsd: Number(process.env.PREMIUM_PRICE_USD) || 5.95,
  // Default OFF and no phone/SMS/WhatsApp/passkey endpoint exists yet in
  // this codebase to gate - these flags exist now so Phase 2/3 work has
  // something to check (and reject on, server-side, not just hide a
  // button for) without needing to touch every call site again later.
  phoneAuthEnabled: process.env.PHONE_AUTH_ENABLED === 'true',
  whatsappAuthEnabled: process.env.WHATSAPP_AUTH_ENABLED === 'true',
  passkeyAuthEnabled: process.env.PASSKEY_AUTH_ENABLED === 'true',
  // Contact addresses - see .env.example. Not read by any endpoint yet;
  // exposed here so future server-sent email has one place to read them
  // from instead of a hardcoded string.
  supportEmail: process.env.SUPPORT_EMAIL || 'support@andergo.online',
  noReplyEmail: process.env.NO_REPLY_EMAIL || 'non-reply@andergo.online'
};
