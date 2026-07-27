#!/usr/bin/env node
require('dotenv').config();
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const config = require('../lib/config');

function maskEmail(email) {
  const [local, domain] = String(email || '').split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const email = (args.find((arg) => !arg.startsWith('--')) || '').trim().toLowerCase();
  if (!config.isSupabaseConfigured) throw new Error('Supabase is not configured.');
  if (!email) {
    throw new Error('Usage: node scripts/configure-teacher-account.js <email> [--apply]');
  }

  const admin = getSupabaseAdmin();
  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, email, role')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  if (!profile) throw new Error('No profile found for that email.');

  console.log(JSON.stringify({ email: maskEmail(email), currentRole: profile.role || 'student' }));
  if (!apply) {
    console.log('Dry run only. Re-run with --apply to assign the teacher role.');
    return;
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(profile.id);
  if (userError) throw userError;
  const appMetadata = {
    ...(userData.user?.app_metadata || {}),
    user_role: 'teacher'
  };
  const { error: authError } = await admin.auth.admin.updateUserById(profile.id, {
    app_metadata: appMetadata
  });
  if (authError) throw authError;

  const { error: profileError } = await admin
    .from('profiles')
    .update({ role: 'teacher', updated_at: new Date().toISOString() })
    .eq('id', profile.id);
  if (profileError) throw profileError;
  console.log(JSON.stringify({ email: maskEmail(email), role: 'teacher', status: 'updated' }));
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
