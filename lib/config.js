const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseDatabaseUrl = process.env.SUPABASE_DATABASE_URL || '';
const port = Number.parseInt(process.env.PORT || '3000', 10);
const premiumPriceUsd = process.env.PREMIUM_PRICE_USD || '5.95';
const devTokenSecret = process.env.DEV_TOKEN_SECRET || 'change-me-in-your-local-env';
const isConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

module.exports = {
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  supabaseDatabaseUrl,
  port,
  premiumPriceUsd,
  devTokenSecret,
  isConfigured
};
