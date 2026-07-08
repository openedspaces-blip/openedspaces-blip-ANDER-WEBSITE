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

const REQUIRED_FILES = ['index.html', 'styles.css', 'script.js'];
const WORLD_LANGUAGES = ['english', 'spanish', 'french', 'italian', 'german'];

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
  console.log('Validating core files...');
  REQUIRED_FILES.forEach(assertExists);

  console.log('Validating language worlds...');
  WORLD_LANGUAGES.forEach((lang) => {
    assertExists(path.join('worlds', lang, 'content.js'));
  });

  console.log('Checking JavaScript syntax...');
  ['script.js', 'lib/server.js'].forEach((relativePath) => {
    const fullPath = path.join(ROOT, relativePath);
    if (fs.existsSync(fullPath)) {
      execSync(`node --check "${fullPath}"`, { stdio: 'inherit' });
    }
  });
  WORLD_LANGUAGES.forEach((lang) => {
    execSync(`node --check "${path.join(ROOT, 'worlds', lang, 'content.js')}"`, { stdio: 'inherit' });
  });

  console.log('Mirroring static assets into public/ ...');
  const filesToMirror = [...REQUIRED_FILES];
  if (fs.existsSync(path.join(ROOT, 'andergo-logo.png'))) filesToMirror.push('andergo-logo.png');
  if (fs.existsSync(path.join(ROOT, 'gamification.js'))) filesToMirror.push('gamification.js');

  filesToMirror.forEach((relativePath) => {
    copyFileEnsuringDir(path.join(ROOT, relativePath), path.join(PUBLIC_DIR, relativePath));
  });

  WORLD_LANGUAGES.forEach((lang) => {
    const rel = path.join('worlds', lang, 'content.js');
    copyFileEnsuringDir(path.join(ROOT, rel), path.join(PUBLIC_DIR, rel));
  });

  console.log('Build complete: root and public/ are in sync.');
}

main();
