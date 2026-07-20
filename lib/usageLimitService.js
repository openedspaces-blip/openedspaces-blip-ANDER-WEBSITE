// lib/usageLimitService.js
// Generic monthly per-user/per-feature usage cap, backed by
// public.user_usage_counters (202607250001_user_usage_counters.sql).
// Currently backs two AI Tutor free-tier limits that happen to share the
// same calendar-month period: 'tutor_query' (30/month) and 'tutor_voice'
// (10/month, replacing voiceAccessService's old daily/per-turn limit).
//
// Unlike voiceAccessService.checkAndConsumeVoiceQuota (which increments
// at check time, before knowing whether the request will actually
// succeed), this service splits the check from the record: callers call
// checkUsage() before doing the real work, then recordUsage() only after
// the provider has actually returned a valid result - a validation
// error, server error, timeout, provider failure or empty response must
// never consume a unit.
const { getSupabaseAdmin } = require('./supabaseClient');
const { isPremiumActive } = require('./voiceAccessService');

function currentPeriod() {
  return new Date().toISOString().slice(0, 7); // 'YYYY-MM', UTC
}

function limitError(message) {
  const err = new Error(message);
  err.status = 403;
  err.code = 'USAGE_LIMIT_REACHED';
  return err;
}

// { allowed, remaining, limit, used }. Premium/ceo (isPremiumActive) is
// always allowed and never touches the table - same "no free-tier limit,
// reasonable abuse protections only" policy already used for Premium
// voice access.
async function checkUsage({ userId, feature, monthlyLimit }) {
  if (!userId) return { allowed: true, remaining: null, limit: monthlyLimit, used: 0 };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { allowed: true, remaining: null, limit: monthlyLimit, used: 0 };

  const [{ data: profile }, { data: usage }] = await Promise.all([
    supabase
      .from('profiles')
      .select('role, access_tier, subscription_status, subscription_expires_at')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('user_usage_counters')
      .select('count')
      .eq('user_id', userId)
      .eq('feature', feature)
      .eq('period', currentPeriod())
      .maybeSingle()
  ]);

  if (isPremiumActive(profile)) {
    return { allowed: true, remaining: null, limit: monthlyLimit, used: usage?.count || 0 };
  }

  const used = usage?.count || 0;
  return {
    allowed: used < monthlyLimit,
    remaining: Math.max(0, monthlyLimit - used),
    limit: monthlyLimit,
    used
  };
}

// Only call after the real operation succeeded. Read-then-write (not a
// single atomic increment) - same accepted pattern already used by
// user_voice_usage/user_lesson_progress in this codebase, not a
// high-concurrency-per-user path.
async function recordUsage({ userId, feature }) {
  if (!userId) return;
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const period = currentPeriod();
  const { data: existing } = await supabase
    .from('user_usage_counters')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', feature)
    .eq('period', period)
    .maybeSingle();

  const { error } = await supabase.from('user_usage_counters').upsert(
    {
      user_id: userId,
      feature,
      period,
      count: (existing?.count || 0) + 1,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id,feature,period' }
  );
  if (error) throw new Error(`Could not record usage: ${error.message}`);
}

module.exports = { checkUsage, recordUsage, limitError, currentPeriod };
