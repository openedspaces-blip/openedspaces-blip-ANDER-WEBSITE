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

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const requestedDefaultPlan = String(process.env.DEFAULT_SUBSCRIPTION_PLAN || 'free').toLowerCase();
const requestedPayPalEnvironment = String(process.env.PAYPAL_ENV || 'sandbox')
  .trim()
  .toLowerCase();

// The frontend and API are always served from the same origin (Vercel routes
// both through this one app - see vercel.json), so this allowlist only exists
// for local dev tooling and any future separately-hosted client. Configure
// extra origins via ALLOWED_ORIGINS (comma-separated) instead of widening
// this list in code.
const defaultAllowedOrigins = [
  'https://andergo.online',
  'https://www.andergo.online',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .concat(defaultAllowedOrigins);

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
  // Read by lib/plansConfig.js only - nowhere else should read these env
  // vars or hardcode a premium price; see plansConfig.js for why.
  premiumMonthlyPriceUsd:
    Number(process.env.PREMIUM_MONTHLY_PRICE_USD || process.env.PREMIUM_PRICE_USD) || 7,
  premiumQuarterlyPriceUsd: Number(process.env.PREMIUM_QUARTERLY_PRICE_USD) || 14.99,
  premiumYearlyPriceUsd: Number(process.env.PREMIUM_YEARLY_PRICE_USD) || 39.99,
  aiTutorMonthlyLimitFree: positiveInteger(process.env.AI_TUTOR_MONTHLY_LIMIT_FREE, 30),
  aiTutorMonthlyLimitPremium: positiveInteger(process.env.AI_TUTOR_MONTHLY_LIMIT_PREMIUM, 500),
  // DeepL charges per translated character. Keep a useful, predictable
  // monthly allowance for registered Free learners and a larger allowance
  // for Premium instead of exposing the provider to anonymous traffic.
  translatorMonthlyLimitFree: positiveInteger(process.env.TRANSLATOR_MONTHLY_LIMIT_FREE, 100),
  translatorMonthlyLimitPremium: positiveInteger(process.env.TRANSLATOR_MONTHLY_LIMIT_PREMIUM, 1000),
  defaultSubscriptionPlan: ['free', 'premium'].includes(requestedDefaultPlan)
    ? requestedDefaultPlan
    : 'free',
  // PayPal is an optional payment provider. Client ID and plan IDs are public checkout
  // identifiers; the client secret and webhook ID stay server-side.
  paypal: {
    environment: ['sandbox', 'production'].includes(requestedPayPalEnvironment)
      ? requestedPayPalEnvironment
      : 'sandbox',
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
    monthlyPlanId: process.env.PAYPAL_MONTHLY_PLAN_ID || '',
    quarterlyPlanId: process.env.PAYPAL_QUARTERLY_PLAN_ID || ''
  },
  azul: {
    environment: String(process.env.AZUL_ENV || 'test').toLowerCase() === 'production'
      ? 'production'
      : 'test',
    merchantId: process.env.AZUL_MERCHANT_ID || '',
    authKey: process.env.AZUL_AUTH_KEY || '',
    merchantName: process.env.AZUL_MERCHANT_NAME || 'ANDERGO',
    merchantType: process.env.AZUL_MERCHANT_TYPE || 'ECommerce',
    currencyCode: process.env.AZUL_CURRENCY_CODE || 'DOP',
    // Azul receives minor units; these defaults are RD$300.00 and RD$800.00.
    monthlyAmount: process.env.AZUL_MONTHLY_AMOUNT || '30000',
    quarterlyAmount: process.env.AZUL_QUARTERLY_AMOUNT || '80000',
    itbis: process.env.AZUL_ITBIS || '000',
    publicBaseUrl: String(process.env.PUBLIC_BASE_URL || 'https://andergo.online').replace(/\/$/, '')
  },
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
  noReplyEmail: process.env.NO_REPLY_EMAIL || 'no-reply@andergo.online',
  // Transactional welcome email. Keep this disabled until Resend has verified
  // the andergo.online DNS records; this key is never exposed to the browser.
  welcomeEmail: {
    enabled: process.env.WELCOME_EMAIL_ENABLED === 'true',
    apiKey: process.env.RESEND_API_KEY || '',
    from:
      process.env.WELCOME_EMAIL_FROM ||
      'ANDERGO Language Academy <no-reply@andergo.online>',
    replyTo: process.env.WELCOME_EMAIL_REPLY_TO || 'support@andergo.online',
    apiBaseUrl: String(process.env.RESEND_API_BASE_URL || 'https://api.resend.com').replace(/\/$/, ''),
    maxAttempts: Math.min(3, positiveInteger(process.env.WELCOME_EMAIL_MAX_ATTEMPTS, 3))
  },
  allowedOrigins
};
