#!/usr/bin/env node
// scripts/verify-all.js
// Runs the same checks a reviewer would run by hand before shipping an
// update: syntax checks on every JS entry point, then the test suite.
// Usage: npm run verify:all
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const FILES_TO_CHECK = [
  'src/js/script.js',
  'src/js/gamification/state.js',
  'src/js/gamification/xp.js',
  'src/js/gamification/streaks.js',
  'src/js/gamification/badges.js',
  'src/js/gamification/missions.js',
  'src/js/gamification/render.js',
  'src/js/gamification/index.js',
  'lib/server.js',
  'lib/config.js',
  'lib/supabaseClient.js',
  'lib/devStore.js',
  'lib/devToken.js',
  'lib/authService.js',
  'lib/aiTutorService.js',
  'lib/openaiService.js',
  'lib/gamification/index.js',
  'lib/gamification/xp.js',
  'lib/gamification/badges.js',
  'lib/gamification/streaks.js',
  'lib/uiContent.js',
  'lib/lessonsData.js',
  'lib/lessonsService.js',
  'lib/httpHelpers.js',
  'api/health.js',
  'api/ai/tutor.js',
  'api/auth.js',
  'api/auth/logout.js',
  'api/content/languages.js',
  'api/lessons.js',
  'api/lessons/[slug]/complete.js',
  'api/progress.js',
  'scripts/build-static.js',
  'scripts/refresh-expanded-worlds.js',
  'scripts/setup-database.js',
  'scripts/sync-worlds-from-seed.js',
  'src/worlds/english/content.js',
  'src/worlds/spanish/content.js',
  'src/worlds/french/content.js',
  'src/worlds/italian/content.js',
  'src/worlds/german/content.js'
];

function run(label, command) {
  process.stdout.write(`${label} ... `);
  try {
    execSync(command, { cwd: ROOT, stdio: 'pipe' });
    console.log('OK');
    return true;
  } catch (error) {
    console.log('FAILED');
    console.error(error.stdout?.toString() || error.message);
    return false;
  }
}

function main() {
  let allOk = true;

  FILES_TO_CHECK.forEach((relativePath) => {
    const fullPath = path.join(ROOT, relativePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`node --check ${relativePath} ... SKIPPED (file not found)`);
      return;
    }
    const ok = run(`node --check ${relativePath}`, `node --check "${fullPath}"`);
    allOk = allOk && ok;
  });

  const testsOk = run('node --test server.test.js', 'node --test server.test.js');
  allOk = allOk && testsOk;

  console.log('\n' + (allOk ? 'All checks passed.' : 'Some checks FAILED - see output above.'));
  process.exit(allOk ? 0 : 1);
}

main();
