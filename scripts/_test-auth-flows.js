#!/usr/bin/env node
// Temporary end-to-end diagnostic (Part H): creates a throwaway user,
// proves username login works (fix A), then exercises the FULL password
// recovery flow without needing a real inbox - admin.generateLink() +
// verifyOtp(token_hash) establishes the exact same recovery session the
// browser would get after clicking the emailed link, then calls
// updateUser({password}) exactly like initResetPasswordPage() does.
// Never logs tokens/passwords. Deleted after use.
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { createServer } = require('../lib/server');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function startTestServer() {
  const app = createServer();
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve({ server, port: server.address().port }));
  });
}

async function postLogin(port, body) {
  const res = await fetch(`http://127.0.0.1:${port}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', ...body })
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function main() {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const email = `andergo-e2e-test-${Date.now()}@example.com`;
  const oldPassword = `OldPass-${Math.random().toString(36).slice(2)}Aa1!`;
  const newPassword = `NewPass-${Math.random().toString(36).slice(2)}Bb2!`;
  const username = `e2etest${Date.now()}`.slice(0, 24);

  console.log('1. Creating confirmed test user...');
  const { data: createData, error: createError } = await admin.auth.admin.createUser({
    email,
    password: oldPassword,
    email_confirm: true
  });
  if (createError) throw new Error(`createUser failed: ${createError.message}`);
  const userId = createData.user.id;

  const { server, port } = await startTestServer();

  try {
    console.log('2. Setting a username on the test profile...');
    const { error: usernameError } = await admin
      .from('profiles')
      .update({ username, username_normalized: username.toLowerCase() })
      .eq('id', userId);
    if (usernameError) throw new Error(`could not set username: ${usernameError.message}`);

    console.log('3. Login by email (old password)...');
    const emailLogin = await postLogin(port, { identifier: email, password: oldPassword });
    console.log(`   status=${emailLogin.status}`);
    if (emailLogin.status !== 200) throw new Error('email login failed');

    console.log('4. Login by username (old password)...');
    const usernameLogin = await postLogin(port, { identifier: username, password: oldPassword });
    console.log(`   status=${usernameLogin.status}`);
    if (usernameLogin.status !== 200) throw new Error('username login failed - fix A did not work');

    console.log('5. Requesting a real recovery session via admin.generateLink (no inbox needed)...');
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email
    });
    if (linkError) throw new Error(`generateLink failed: ${linkError.message}`);
    const tokenHash = linkData.properties?.hashed_token;
    if (!tokenHash) throw new Error('generateLink did not return a hashed_token');
    console.log('   link generated (token not printed).');

    const anon = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log('6. Verifying the recovery token (== what supabase-js does after the emailed link loads)...');
    const { data: verifyData, error: verifyError } = await anon.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery'
    });
    if (verifyError) throw new Error(`verifyOtp failed: ${verifyError.message}`);
    if (!verifyData.session) throw new Error('verifyOtp did not establish a session');
    console.log('   recovery session established.');

    console.log('7. Opening the "new password" form flow: updateUser({password: newPassword})...');
    const { error: updateError } = await anon.auth.updateUser({ password: newPassword });
    if (updateError) throw new Error(`updateUser failed: ${updateError.message}`);
    console.log('   password updated.');

    await anon.auth.signOut().catch(() => {});

    console.log('8. Login with the NEW password...');
    const newLogin = await postLogin(port, { identifier: email, password: newPassword });
    console.log(`   status=${newLogin.status}`);
    if (newLogin.status !== 200) throw new Error('login with new password failed');

    console.log('9. Confirming the OLD password no longer works...');
    const oldLoginAttempt = await postLogin(port, { identifier: email, password: oldPassword });
    console.log(`   status=${oldLoginAttempt.status} (expected 401)`);
    if (oldLoginAttempt.status === 200) throw new Error('OLD password still works - bug!');

    console.log('\nALL PART H SCENARIOS PASSED.');
  } finally {
    console.log('\nCleaning up test user...');
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    server.close();
  }
}

main().catch((error) => {
  console.error('E2E TEST FAILED:', error.message);
  process.exit(1);
});
