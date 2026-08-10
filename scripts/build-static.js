#!/usr/bin/env node
// scripts/build-static.js
// ANDERGO is a static frontend (no bundler): this script validates the core
// files are present and in sync, then mirrors them into public/ so both the
// project root and public/ can be deployed identically. Run via `npm run build`.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const REQUIRED_FILES = [
  'index.html',
  'welcome.html',
  'terms.html',
  'privacy.html',
  'refund-policy.html',
  'src/css/styles.css',
  'src/css/legal.css',
  'src/js/script.js',
  'src/js/paddle-pricing.js',
  'src/js/username-rules.js',
  'src/js/language-pair.js',
  // translator-languages.js/translator-predictive.js were referenced by
  // index.html's <script> tags but missing from every mirrored-files list
  // below, so `npm run build` never copied them into public/ - the Traductor
  // worked from the checked-out project root but silently lost its L1/L2
  // <select> population (window.AndergoTranslatorLanguages undefined -> 404
  // on the deployed public/ build, same class of bug as the Verbos fix
  // below).
  'src/js/translator-languages.js',
  'src/js/translator-predictive.js',
  'src/js/app-install.js',
  'service-worker.js',
  'favicon.svg',
  'andergo-social.png',
  'robots.txt',
  'sitemap.xml',
  'site.webmanifest'
];
const WORLD_LANGUAGES = ['english', 'spanish', 'french', 'italian', 'portuguese', 'german'];
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
// Verbos section (src/js/verbs/*.js) - was missing from every list below
// (REQUIRED_FILES/filesToMirror), so `npm run build` never actually copied
// it into public/ even though index.html's <script> tags reference it at
// that exact path; it only worked in the checked-out project root. Fixed as
// part of the Verbos Fase 1 pass.
const VERBS_FILES = [
  'src/js/verbs/english-verbs-data.js',
  'src/js/verbs/verb-conjugation-engine.js',
  'src/js/verbs/romance-verbs-data.js',
  'src/js/verbs/verbs-view.js'
];

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

function copyDirectoryEnsuringDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  fs.readdirSync(srcDir, { withFileTypes: true }).forEach((entry) => {
    const source = path.join(srcDir, entry.name);
    const destination = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirectoryEnsuringDir(source, destination);
      return;
    }
    if (entry.isFile()) copyFileEnsuringDir(source, destination);
  });
}

function main() {
  console.log('Preparing canonical English B1-B2 Listening transcripts...');
  execSync(
    `node "${path.join(ROOT, 'scripts', 'prepare-english-b1-b2-audio-transcripts.js')}"`,
    { stdio: 'inherit' }
  );

  console.log('Preparing canonical English C1-C2 Listening transcripts...');
  execSync(
    `node "${path.join(ROOT, 'scripts', 'prepare-english-c1-c2-audio-transcripts.js')}"`,
    { stdio: 'inherit' }
  );

  console.log('Preparing canonical Spanish A1-A2 Listening transcripts...');
  execSync(
    `node "${path.join(ROOT, 'scripts', 'prepare-spanish-a1-a2-audio-transcripts.js')}"`,
    { stdio: 'inherit' }
  );

  console.log('Preparing canonical Spanish B1-B2 Listening transcripts...');
  execSync(
    `node "${path.join(ROOT, 'scripts', 'prepare-spanish-b1-b2-audio-transcripts.js')}"`,
    { stdio: 'inherit' }
  );

  console.log('Refreshing contextual Listening questions...');
  execSync(`node "${path.join(ROOT, 'scripts', 'refresh-all-listening-comprehension.js')}"`, {
    stdio: 'inherit'
  });

  console.log('Normalizing Reading comprehension questions...');
  execSync(`node "${path.join(ROOT, 'scripts', 'normalize-reading-comprehension.js')}"`, {
    stdio: 'inherit'
  });

  console.log('Aligning B1-C2 Grammar with each level and unit...');
  execSync(`node "${path.join(ROOT, 'scripts', 'align-upper-level-grammar.js')}"`, {
    stdio: 'inherit'
  });

  // Fills any French/Spanish Grammar lesson missing extra.grammarProfile
  // (definition/structure/function/examples) - without it, the pre-exercise
  // explanation card that renderGrammarQuickIntroHtml shows in the frontend
  // falls back to parsing lesson.grammar's free-text notes, which only
  // recognizes English/French section labels (Rule:/Goal:/Pattern:...) and
  // silently renders empty for Spanish notes (Foco:/Uso:/Modelo:...).
  // grammarProfile fields only fill gaps (`existing.field || fallback`);
  // Spanish's extra.grammarTest is regenerated from content.exercises on
  // every run, but that source doesn't change between builds, so the
  // result is deterministic and stable, not a content downgrade.
  console.log('Normalizing French and Spanish Grammar profiles...');
  execSync(`node "${path.join(ROOT, 'scripts', 'normalize-french-grammar.js')}"`, {
    stdio: 'inherit'
  });
  execSync(`node "${path.join(ROOT, 'scripts', 'normalize-spanish-grammar.js')}"`, {
    stdio: 'inherit'
  });

  console.log('Validating comprehension question limits...');
  execSync(`node "${path.join(ROOT, 'scripts', 'validate-comprehension-question-counts.js')}"`, {
    stdio: 'inherit'
  });

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
  // Sobre el creador portrait (index.html's #about section).
  if (fs.existsSync(path.join(ROOT, 'andergo-creator-portrait.png'))) {
    filesToMirror.push('andergo-creator-portrait.png');
  }

  filesToMirror.forEach((relativePath) => {
    copyFileEnsuringDir(path.join(ROOT, relativePath), path.join(PUBLIC_DIR, relativePath));
  });

  WORLD_LANGUAGES.forEach((lang) => {
    const rel = path.join('src', 'worlds', lang, 'content.js');
    copyFileEnsuringDir(path.join(ROOT, rel), path.join(PUBLIC_DIR, rel));
  });

  // Route artwork is source-controlled under /images. Mirror it explicitly so
  // image-led lessons work whether Vercel serves the root or the static public
  // directory. Without this, Pre-A1 cards render their empty fallback color.
  copyDirectoryEnsuringDir(path.join(ROOT, 'images'), path.join(PUBLIC_DIR, 'images'));

  // Homepage and editorial artwork lives under /assets. Mirror the whole
  // directory so newly added cover images cannot silently resolve to the
  // SPA HTML fallback in production.
  copyDirectoryEnsuringDir(path.join(ROOT, 'assets'), path.join(PUBLIC_DIR, 'assets'));

  // Signed mobile packages published by the Downloads section.
  copyDirectoryEnsuringDir(path.join(ROOT, 'downloads'), path.join(PUBLIC_DIR, 'downloads'));

  // @paddle/paddle-js is the official loader/type-safe wrapper. The app has
  // no bundler, so publish its ESM build as a first-party static dependency.
  copyFileEnsuringDir(
    path.join(ROOT, 'node_modules', '@paddle', 'paddle-js', 'dist', 'index.esm.js'),
    path.join(PUBLIC_DIR, 'vendor', 'paddle', 'index.esm.js')
  );

  // Both index.html's <link>/<script> tags hardcoded a manually-maintained
  // "?v=20260805-games-upgrade" cache-busting string shared by script.js and
  // styles.css. Every commit since that date changed one or both files
  // without anyone bumping it, so a browser (or CDN) that had already cached
  // that exact URL kept serving stale JS/CSS after every deploy - e.g. a
  // Tutor fix landing in script.js never reached a returning visitor. Content
  // hashes replace the manual string so a real content change always
  // produces a new URL, with nothing left to remember to bump by hand.
  console.log('Content-hashing script.js/styles.css cache-busting query strings...');
  const hashFileContents = (relativePath) =>
    crypto
      .createHash('sha1')
      .update(fs.readFileSync(path.join(PUBLIC_DIR, relativePath)))
      .digest('hex')
      .slice(0, 10);
  const scriptHash = hashFileContents('src/js/script.js');
  const stylesHash = hashFileContents('src/css/styles.css');
  const publicIndexPath = path.join(PUBLIC_DIR, 'index.html');
  const indexHtml = fs
    .readFileSync(publicIndexPath, 'utf8')
    .replace(/(src="\/src\/js\/script\.js)\?v=[^"]*(")/, `$1?v=${scriptHash}$2`)
    .replace(/(href="\/src\/css\/styles\.css)\?v=[^"]*(")/, `$1?v=${stylesHash}$2`);
  fs.writeFileSync(publicIndexPath, indexHtml);

  console.log('Build complete: root and public/ are in sync.');
}

main();
