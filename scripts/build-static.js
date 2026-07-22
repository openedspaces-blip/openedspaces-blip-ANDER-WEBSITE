#!/usr/bin/env node
// scripts/build-static.js
// ANDERGO is a static frontend (no bundler): this script validates the core
// files are present and in sync, then mirrors them into public/ so both the
// project root and public/ can be deployed identically. Run via `npm run build`.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const REQUIRED_FILES = [
  'index.html',
  'src/css/styles.css',
  'src/js/script.js',
  'src/js/username-rules.js',
  'src/js/language-pair.js'
];
const WORLD_LANGUAGES = ['english', 'spanish', 'french', 'italian', 'german'];
const GAMIFICATION_FILES = [
  'src/js/gamification/state.js',
  'src/js/gamification/xp.js',
  'src/js/gamification/streaks.js',
  'src/js/gamification/badges.js',
  'src/js/gamification/missions.js',
  'src/js/gamification/toasts.js',
  'src/js/gamification/render.js',
  'src/js/gamification/index.js'
];
// Verbos pilot (English only for now) - index.html loads these as plain
// <script> tags after script.js. Was missing from every list below
// (REQUIRED_FILES/mirror/syntax-check) since they were added, so `npm run
// build` never actually refreshed public/src/js/verbs/*.js after a source
// edit - public/ silently kept serving whatever was there from the first
// manual copy. Fixed here, not a Verbos feature change.
const VERBS_FILES = ['src/js/verbs/english-verbs-pilot.js', 'src/js/verbs/verbs-view.js'];

function assertExists(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Missing required file: ${relativePath}`);
    process.exit(1);
  }
  return fullPath;
}

function copyFileEnsuringDir(srcPath, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcPath, destPath);
}

function main() {
  console.log('Syncing generated language worlds...');
  execSync(`node "${path.join(ROOT, 'scripts', 'sync-worlds-from-seed.js')}"`, {
    stdio: 'inherit'
  });

  console.log('Validating core files...');
  REQUIRED_FILES.forEach(assertExists);

  console.log('Validating language worlds...');
  WORLD_LANGUAGES.forEach((lang) => {
    assertExists(path.join('src', 'worlds', lang, 'content.js'));
  });

  console.log('Checking JavaScript syntax...');
  [
    ...GAMIFICATION_FILES,
    ...VERBS_FILES,
    'src/js/script.js',
    'src/js/username-rules.js',
    'src/js/language-pair.js',
    'lib/server.js'
  ].forEach((relativePath) => {
    const fullPath = path.join(ROOT, relativePath);
    if (fs.existsSync(fullPath)) {
      execSync(`node --check "${fullPath}"`, { stdio: 'inherit' });
    }
  });
  WORLD_LANGUAGES.forEach((lang) => {
    execSync(`node --check "${path.join(ROOT, 'src', 'worlds', lang, 'content.js')}"`, {
      stdio: 'inherit'
    });
  });

  console.log('Mirroring static assets into public/ ...');
  const filesToMirror = [...REQUIRED_FILES, ...GAMIFICATION_FILES, ...VERBS_FILES];
  if (fs.existsSync(path.join(ROOT, 'andergo-logo.png'))) filesToMirror.push('andergo-logo.png');
  // Sobre el creador photo (index.html's #about section) - optional like the
  // logo above: mirrored once it exists, build stays green either way.
  if (fs.existsSync(path.join(ROOT, 'andergo-creator.jpg'))) filesToMirror.push('andergo-creator.jpg');

  filesToMirror.forEach((relativePath) => {
    copyFileEnsuringDir(path.join(ROOT, relativePath), path.join(PUBLIC_DIR, relativePath));
  });

  WORLD_LANGUAGES.forEach((lang) => {
    const rel = path.join('src', 'worlds', lang, 'content.js');
    copyFileEnsuringDir(path.join(ROOT, rel), path.join(PUBLIC_DIR, rel));
  });

  console.log('Build complete: root and public/ are in sync.');
}

main();
