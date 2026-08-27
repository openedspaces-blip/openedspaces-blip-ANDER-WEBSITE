/*
 * Moves the legacy hash-named Reading audio cache into the official private
 * Storage layout: <language>/<level>/unit-XX/main.wav.
 *
 * This never calls a TTS provider. It only copies objects that already exist.
 */
require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const { BUCKET, officialObjectPathFor } = require('../lib/readingAudioStorage');

const ROOT = path.join(__dirname, '..');
const WORLD_DIR = path.join(ROOT, 'src', 'worlds');

function readingText(lesson) {
  return String(lesson?.reading?.text || lesson?.extra?.mainTranscript || lesson?.transcript || '')
    .replace(/\s+/g, ' ').trim();
}

function legacyPath(text, language) {
  const digest = crypto.createHash('sha256').update(`reading-v1|${language}|${text}`).digest('hex');
  return `${language}/${digest}.wav`;
}

function readLessons(language) {
  const sourcePath = path.join(WORLD_DIR, language, 'content.js');
  const context = { window: {} };
  context.window.window = context.window;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename: sourcePath });
  return (context.window.ANDERGO_LANGUAGE_WORLDS?.lessons?.[language] || [])
    .filter((lesson) => lesson.skill === 'reading')
    .map((lesson) => ({ lesson, text: readingText(lesson) }))
    .filter(({ text }) => text);
}

async function main() {
  const language = String(process.argv[2] || 'english').toLowerCase();
  const client = getSupabaseAdmin();
  if (!client) throw new Error('Supabase no está configurado.');
  const seenByLevel = new Map();
  let copied = 0;
  let existing = 0;
  let missing = 0;
  for (const { lesson, text } of readLessons(language)) {
    const unitIds = seenByLevel.get(lesson.level) || [];
    if (!unitIds.includes(lesson.unitId)) unitIds.push(lesson.unitId);
    seenByLevel.set(lesson.level, unitIds);
    const destination = officialObjectPathFor({
      language,
      level: lesson.level,
      unitNumber: unitIds.indexOf(lesson.unitId) + 1
    });
    const source = legacyPath(text, language);
    const { error } = await client.storage.from(BUCKET).copy(source, destination);
    if (!error) { copied += 1; console.log(`Copied ${destination}`); continue; }
    if (/already exists|duplicate/i.test(error.message || '')) { existing += 1; continue; }
    if (/not found|does not exist/i.test(error.message || '')) { missing += 1; continue; }
    throw error;
  }
  console.log(`Migration complete: ${copied} copied, ${existing} already present, ${missing} legacy files missing.`);
}

main().catch((error) => { console.error(`Reading audio migration failed: ${error.message}`); process.exitCode = 1; });
