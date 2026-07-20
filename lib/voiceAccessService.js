// lib/voiceAccessService.js
// isPremiumActive() here is still the canonical Premium check, reused by
// courseLessonsService/entitlementsService/lessonsService/usageLimitService.
//
// checkAndConsumeVoiceQuota() (the daily 3/day + first-3-turns quota) is
// SUPERSEDED - POST /api/speech/synthesize in lib/server.js now uses
// lib/usageLimitService.js's monthly cap (10/calendar month) instead, the
// same period as the Tutor's own query cap. Left in place (unused by
// server.js) rather than deleted, in case anything still imports it
// directly; do not wire it into any new route.
//
// Original doc, for the superseded quota below: two independent checks,
// both enforced server-side only - the browser never decides its own plan
// or quota:
//   1. Is this user's subscription actually Premium right now? (never
//      trust a client-supplied "premium" flag alone - see isPremiumActive)
//   2. Free users: have they used up today's 3 spoken replies, or gone
//      past 3 turns in the current conversation?
const { getSupabaseAdmin } = require('./supabaseClient');
const ttsService = require('./ttsService');

const FREE_DAILY_VOICE_LIMIT = 3;
const FREE_TURN_LIMIT = 3;

// Exact copy shown to the student when the free daily limit is hit -
// text stays available regardless, only the voice controls are affected.
const LIMIT_MESSAGE =
  'Has utilizado tus respuestas de voz gratuitas de hoy. Continúa por texto o desbloquea ANDERGO Premium.';

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

// profiles.access_tier is "plan"; subscription_status/subscription_expires_at
// (202607190001_voice_premium.sql) are the other two conditions the spec
// asks for. All three must hold - a stale/canceled/expired row must not
// grant neural voice just because access_tier still says 'premium'.
//
// role='ceo' (202607210001_profile_role.sql) is an independent override:
// full access always, regardless of the subscription columns above - see
// lib/entitlementsService.js, the single place this "ceo bypasses the
// billing check" rule is documented in full.
function isPremiumActive(profile) {
  if (!profile) return false;
  if (profile.role === 'ceo') return true;
  if (profile.access_tier !== 'premium') return false;
  if (profile.subscription_status !== 'active') return false;
  if (profile.subscription_expires_at && new Date(profile.subscription_expires_at) <= new Date()) {
    return false;
  }
  return true;
}

function quotaError(message) {
  const err = new Error(message);
  err.status = 403;
  err.code = 'VOICE_LIMIT_REACHED';
  return err;
}

// Loads plan + today's usage, resets the counter if last_voice_usage_date
// isn't today (UTC), enforces the free-tier limits, and - for allowed
// requests - persists the incremented counter before returning, so the
// quota is committed server-side regardless of what the client does next.
async function checkAndConsumeVoiceQuota({ userId, turnIndex }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const err = new Error('La voz del tutor no está disponible en este momento.');
    err.status = 503;
    throw err;
  }

  const [{ data: profile }, { data: usage }] = await Promise.all([
    supabase
      .from('profiles')
      .select('role, access_tier, subscription_status, subscription_expires_at')
      .eq('id', userId)
      .maybeSingle(),
    supabase.from('user_voice_usage').select('*').eq('user_id', userId).maybeSingle()
  ]);

  const premium = isPremiumActive(profile);
  const today = todayUtc();
  const isNewDay = !usage || usage.last_voice_usage_date !== today;
  const requestsToday = isNewDay ? 0 : usage.voice_requests_today || 0;

  if (!premium) {
    if (requestsToday >= FREE_DAILY_VOICE_LIMIT) throw quotaError(LIMIT_MESSAGE);
    if (Number.isFinite(turnIndex) && turnIndex > FREE_TURN_LIMIT) throw quotaError(LIMIT_MESSAGE);
  }

  const nextCount = requestsToday + 1;
  const { error } = await supabase.from('user_voice_usage').upsert(
    {
      user_id: userId,
      voice_requests_today: nextCount,
      last_voice_usage_date: today,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id' }
  );
  if (error) throw new Error(`Could not record voice usage: ${error.message}`);

  return {
    premium,
    mode: premium && ttsService.isConfigured() ? 'neural' : 'browser',
    remaining: { requestsToday: premium ? null : Math.max(0, FREE_DAILY_VOICE_LIMIT - nextCount) }
  };
}

module.exports = {
  checkAndConsumeVoiceQuota,
  isPremiumActive,
  LIMIT_MESSAGE,
  FREE_DAILY_VOICE_LIMIT,
  FREE_TURN_LIMIT
};
