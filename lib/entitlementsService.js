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
    return STUDENT_ENTITLEMENTS;
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('role, access_tier, subscription_status, subscription_expires_at')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) return STUDENT_ENTITLEMENTS;
  if (profile.role === 'ceo') return ceoEntitlements(profile.access_tier);

  const premium = isPremiumActive(profile);
  return {
    role: profile.role || 'student',
    accessTier: profile.access_tier || 'free',
    isPremium: premium,
    hasFullAccess: premium
  };
}

module.exports = { getUserEntitlements };
