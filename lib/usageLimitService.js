// lib/usageLimitService.js
// Generic monthly per-user/per-feature usage cap, backed by
// public.user_usage_counters (202607250001_user_usage_counters.sql).
// The Tutor uses 'tutor_query' for every successful monthly consultation,
// whether it is written or initiated with the microphone.
//
// Unlike voiceAccessService.checkAndConsumeVoiceQuota (which increments
// at check time, before knowing whether the request will actually
// succeed), this service splits the check from the record: callers call
// checkUsage() before doing the real work, then recordUsage() only after
// the provider has actually returned a valid result - a validation
// error, server error, timeout, provider failure or empty response must
// never consume a unit.
const { getSupabaseAdmin } = require('./supabaseClient');

function currentPeriod() {
  return new Date().toISOString().slice(0, 7); // 'YYYY-MM', UTC
}

function limitError(message) {
  const err = new Error(message);
  err.status = 403;
  err.code = 'USAGE_LIMIT_REACHED';
  return err;
}

// Both Free and Premium have a finite server-selected monthly limit.
async function checkUsage({ userId, feature, monthlyLimit }) {
  if (!userId) return { allowed: false, remaining: 0, limit: monthlyLimit, used: 0 };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { allowed: true, remaining: null, limit: monthlyLimit, used: 0 };

  const { data: usage } = await supabase
    .from('user_usage_counters')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', feature)
    .eq('period', currentPeriod())
    .maybeSingle();

  const used = usage?.count || 0;
  return {
    allowed: used < monthlyLimit,
    remaining: Math.max(0, monthlyLimit - used),
    limit: monthlyLimit,
    used
  };
}

// Only call after the real operation succeeded. The database function
// performs a single atomic insert-or-increment, so concurrent replies do
// not overwrite one another.
async function recordUsage({ userId, feature }) {
  if (!userId) return;
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { error } = await supabase.rpc('increment_user_usage_counter', {
    p_user_id: userId,
    p_feature: feature,
    p_period: currentPeriod()
  });
  if (error) throw new Error(`Could not record usage: ${error.message}`);
}

module.exports = { checkUsage, recordUsage, limitError, currentPeriod };
