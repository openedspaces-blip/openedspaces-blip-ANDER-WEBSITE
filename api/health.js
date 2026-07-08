// api/health.js -> GET /api/health
const config = require('../lib/config');
const { withHandler } = require('../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  res.status(200).json({
    ok: true,
    configured: config.isSupabaseConfigured,
    supabase: {
      configured: config.isSupabaseConfigured,
      mode: config.isSupabaseConfigured ? 'supabase' : 'demo'
    }
  });
});
