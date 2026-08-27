#!/usr/bin/env node
/*
 * Uploads narration MP3 files created outside ANDERGO (for example Airvoz)
 * into the private official Reading-audio layout in Supabase.
 *
 * Put the downloaded files here, using the lesson slug as the filename:
 *   assets/audio/readings/french/french-a1-bonjour-et-bienvenue-reading.mp3
 *
 * Then run:
 *   npm run upload:reading-mp3 -- --language french --dry-run
 *   npm run upload:reading-mp3 -- --language french
 *
 * The script derives the official bucket path from the curriculum, so authors
 * never have to manually name paths such as french/A1/unit-01/main.mp3.
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  getOfficialReadingAudio,
  uploadOfficialReadingAudio
} = require('../lib/readingAudioStorage');

const ROOT = path.join(__dirname, '..');
const WORLD_DIR = path.join(ROOT, 'src', 'worlds');
const AUDIO_DIR = path.join(ROOT, 'assets', 'audio', 'readings');

function parseArgs(args) {
  const options = { language: '', dryRun: false, force: false, reportOnly: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--language') options.language = String(args[++index] || '').trim().toLowerCase();
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--report') options.reportOnly = true;
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: npm run upload:reading-mp3 -- --language <language> [--dry-run] [--report] [--force]');
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  if (!options.language) throw new Error('Choose one language with --language.');
  return options;
}

function readWorldLessons(language) {
  const sourcePath = path.join(WORLD_DIR, language, 'content.js');
  if (!fs.existsSync(sourcePath)) throw new Error(`No language world found for "${language}".`);
  const context = { window: {} };
  context.window.window = context.window;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename: sourcePath });
  return context.window.ANDERGO_LANGUAGE_WORLDS?.lessons?.[language] || [];
}

function readingText(lesson) {
  return String(lesson?.reading?.text || lesson?.extra?.mainTranscript || lesson?.transcript || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function unitNumbersFor(lessons) {
  const byLevel = new Map();
  const numbers = new Map();
  for (const lesson of lessons) {
    const seen = byLevel.get(lesson.level) || [];
    if (!seen.includes(lesson.unitId)) seen.push(lesson.unitId);
    byLevel.set(lesson.level, seen);
    numbers.set(lesson.slug, seen.indexOf(lesson.unitId) + 1);
  }
  return numbers;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const lessons = readWorldLessons(options.language)
    // Preserve the curriculum order. Unit numbers in the private audio layout
    // are defined by this order, not by an alphabetical sort of lesson slugs.
    .filter((lesson) => lesson.skill === 'reading' && readingText(lesson));
  if (!lessons.length) throw new Error(`No Reading lessons found for "${options.language}".`);

  const unitNumbers = unitNumbersFor(lessons);
  const languageDir = path.join(AUDIO_DIR, options.language);
  const summary = { total: lessons.length, uploaded: 0, existing: 0, missingLocal: 0, ready: 0 };

  for (const lesson of lessons) {
    const unitNumber = unitNumbers.get(lesson.slug);
    const localPath = path.join(languageDir, `${lesson.slug}.mp3`);
    const localExists = fs.existsSync(localPath);
    const existing = await getOfficialReadingAudio({
      language: options.language,
      level: lesson.level,
      unitNumber
    });

    if (existing && !options.force) {
      summary.existing += 1;
      console.log(`Already uploaded: ${lesson.slug}`);
      continue;
    }
    if (!localExists) {
      summary.missingLocal += 1;
      console.log(`Missing MP3: ${path.relative(ROOT, localPath)}`);
      continue;
    }
    summary.ready += 1;
    if (options.reportOnly || options.dryRun) {
      console.log(`Ready to upload: ${lesson.slug} -> ${options.language}/${lesson.level}/unit-${String(unitNumber).padStart(2, '0')}/main.mp3`);
      continue;
    }

    const audio = fs.readFileSync(localPath);
    const stored = await uploadOfficialReadingAudio({
      audio,
      language: options.language,
      level: lesson.level,
      unitNumber,
      contentType: 'audio/mpeg',
      force: options.force
    });
    summary.uploaded += 1;
    console.log(`Uploaded: ${lesson.slug} -> ${stored.objectPath}`);
  }

  console.log(`\nSummary for ${options.language}: ${JSON.stringify(summary)}`);
}

main().catch((error) => {
  console.error(`Reading MP3 upload failed: ${error.message}`);
  process.exitCode = 1;
});
