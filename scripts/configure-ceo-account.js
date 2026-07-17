#!/usr/bin/env node
// scripts/configure-ceo-account.js
// One-off, local-only, server-side admin operation that promotes ONE
// existing Supabase Auth account to the CEO role. Never part of the
// frontend, never wired into any HTTP route, never runs automatically.
//
// Usage:
//   node scripts/configure-ceo-account.js <email>              (dry run - report only, no writes)
//   node scripts/configure-ceo-account.js <email> --apply       (performs the writes)
//
// The target email is a CLI argument (or CEO_TARGET_EMAIL env var) - never
// hardcoded in this file. Reads SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY the
// same way the rest of the app does (lib/config.js / .env), and never
// prints the service-role key or the full email/password anywhere.
//
// What it does, in order:
//   1. Looks up the account by email via public.profiles (service role
//      only - same lookup path profilesService.js already uses elsewhere).
//   2. Reads the current auth.users row (email_confirmed_at, app_metadata)
//      and the current profiles row (username, access_tier) - printed as
//      the "before" report, masked, on every run (dry run or --apply).
//   3. Only with --apply: merges (never overwrites) app_metadata with
//      { user_role: 'ceo', plan: 'premium' }, sets email_confirm: true via
//      supabaseAdmin.auth.admin.updateUserById, and updates
//      public.profiles (role, access_tier, subscription_status,
//      subscription_expires_at) by id.
require('dotenv').config();
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const config = require('../lib/config');

function maskEmail(email) {
  const [local, domain] = String(email || '').split('@');
  if (!domain) return '***';
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - visible.length, 1))}@${domain}`;
}

function maskUserId(id) {
  return id ? `${String(id).slice(0, 8)}...` : '(none)';
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const targetEmail = (args.find((a) => !a.startsWith('--')) || process.env.CEO_TARGET_EMAIL || '')
    .trim()
    .toLowerCase();

  if (!config.isSupabaseConfigured) {
    console.error('Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing).');
    process.exit(1);
  }
  if (!targetEmail) {
    console.error(
      'Usage: node scripts/configure-ceo-account.js <email> [--apply]\n' +
        '(or set CEO_TARGET_EMAIL in the environment instead of passing it as an argument)'
    );
    process.exit(1);
  }

  const admin = getSupabaseAdmin();

  // profiles.role (202607210001_profile_role.sql) may not have been applied
  // to this database yet - fall back to a query without it so the read-only
  // report below still works pre-migration, instead of crashing.
  let { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, username, access_tier, subscription_status, role')
    .eq('email', targetEmail)
    .maybeSingle();

  if (profileError && /column .*role.* does not exist/i.test(profileError.message || '')) {
    console.warn('(profiles.role column not found yet - run the 202607210001 migration first.)');
    ({ data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id, username, access_tier, subscription_status')
      .eq('email', targetEmail)
      .maybeSingle());
  }

  if (profileError) {
    console.error('Could not query profiles:', profileError.message);
    process.exit(1);
  }
  if (!profile) {
    console.error('No profile found for that email. Nothing was changed.');
    process.exit(1);
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(profile.id);
  if (userError || !userData?.user) {
    console.error('Could not load the auth.users record:', userError?.message || 'not found');
    process.exit(1);
  }
  const user = userData.user;

  console.log('--- Current state ---');
  console.log('userId:', maskUserId(user.id));
  console.log('email:', maskEmail(targetEmail));
  console.log('email_confirmed_at:', user.email_confirmed_at || '(not confirmed)');
  console.log('username:', profile.username || '(none)');
  console.log('role:', profile.role || 'student');
  console.log('access_tier:', profile.access_tier || 'free');
  console.log('subscription_status:', profile.subscription_status || '(unset)');
  console.log('app_metadata:', JSON.stringify(user.app_metadata || {}));

  if (!apply) {
    console.log('\nDry run only - no changes made. Re-run with --apply to promote this account.');
    return;
  }

  const mergedAppMetadata = {
    ...(user.app_metadata || {}),
    user_role: 'ceo',
    plan: 'premium'
  };

  const { error: updateAuthError } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
    app_metadata: mergedAppMetadata
  });
  if (updateAuthError) {
    console.error('Failed to update auth.users:', updateAuthError.message);
    process.exit(1);
  }

  const { error: updateProfileError } = await admin
    .from('profiles')
    .update({
      role: 'ceo',
      access_tier: 'premium',
      subscription_status: 'active',
      subscription_expires_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);
  if (updateProfileError) {
    console.error('Failed to update profiles:', updateProfileError.message);
    process.exit(1);
  }

  console.log('\n--- Done ---');
  console.log('userId:', maskUserId(user.id));
  console.log('email:', maskEmail(targetEmail));
  console.log('role: ceo');
  console.log('plan: premium');
  console.log('Confirmation: success');
}

main().catch((error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});
