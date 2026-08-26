// lib/entitlementsService.js
// Single source of truth for "what is this authenticated user allowed to
// do", read fresh from public.profiles on every call - never cached on the
// client, never derived from username/email/localStorage. Every route that
// gates Premium content or admin surfaces should go through
// getUserEntitlements(userId) instead of re-reading profiles.access_tier
// itself, so the "role ceo always has full access" rule lives in one place.
const { getSupabaseAdmin } = require('./supabaseClient');
const devStore = require('./devStore');
const { isPremiumActive } = require('./voiceAccessService');

const STUDENT_ENTITLEMENTS = Object.freeze({
  role: 'student',
  accessTier: 'free',
  isPremium: false,
  hasFullAccess: false
});

function ceoEntitlements(accessTier) {
  return {
    role: 'ceo',
    accessTier: accessTier || 'premium',
    isPremium: true,
    hasFullAccess: true
  };
}

function teacherEntitlements(accessTier, premium) {
  return {
    role: 'teacher',
    accessTier: accessTier || 'free',
    isPremium: premium,
    hasFullAccess: premium,
    canViewCurriculum: true
  };
}

// role='ceo' always grants hasFullAccess/isPremium regardless of the
// access_tier/subscription_status columns - those still get updated for
// consistency (see scripts/configure-ceo-account.js) but role is the
// authority, not a substitute for it, so a stale subscription row can never
// downgrade a CEO account.
async function getUserEntitlements(userId) {
  if (!userId) return STUDENT_ENTITLEMENTS;

  const admin = getSupabaseAdmin();
  if (!admin) {
    const profile = devStore.getProfile(userId);
    if (profile?.role === 'ceo') return ceoEntitlements(profile.accessTier);
    if (profile?.role === 'teacher') {
      return teacherEntitlements(profile.accessTier, profile.accessTier === 'premium');
    }
    return STUDENT_ENTITLEMENTS;
  }

  const [
    { data: profile, error: profileError },
    { data: premiumSubscription, error: subscriptionError }
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('role, access_tier, subscription_status, subscription_expires_at')
      .eq('id', userId)
      .maybeSingle(),
    admin
      .from('subscriptions')
      .select('is_premium, status, current_period_end')
      .eq('user_id', userId)
      .eq('is_premium', true)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  // A failed profile read (network blip, transient Supabase error) is not the
  // same thing as "this user has no profile" - treating it that way silently
  // downgrades a real Premium/CEO account to Free for the duration of the
  // glitch. Surface the failure instead of guessing.
  if (profileError) {
    throw new Error(`Could not read profile for entitlements: ${profileError.message}`);
  }
  if (!profile) return STUDENT_ENTITLEMENTS;
  if (profile.role === 'ceo') return ceoEntitlements(profile.access_tier);

  const subscriptionPremium =
    !subscriptionError &&
    Boolean(premiumSubscription?.is_premium) &&
    ['active', 'trialing'].includes(premiumSubscription?.status) &&
    (!premiumSubscription?.current_period_end ||
      new Date(premiumSubscription.current_period_end) > new Date());
  // During migration/development, fall back to the existing profile cache
  // only when the subscription record cannot be queried. Once present, the
  // subscriptions row is authoritative.
  const premium = subscriptionError ? isPremiumActive(profile) : subscriptionPremium;
  if (profile.role === 'teacher') return teacherEntitlements(profile.access_tier, premium);
  return {
    role: profile.role || 'student',
    accessTier: profile.access_tier || 'free',
    isPremium: premium,
    hasFullAccess: premium,
    canViewCurriculum: false
  };
}

module.exports = { getUserEntitlements };
