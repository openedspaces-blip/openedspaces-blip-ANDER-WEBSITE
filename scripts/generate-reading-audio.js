#!/usr/bin/env node
/*
 * Creates static WAV narration for Reading lessons with Gemini TTS.
 *
 * Examples:
 *   npm run generate:reading-audio -- --language english --limit 3
 *   npm run generate:reading-audio -- --language french --slug french-a1-hello-reading
 *
 * With --upload, official files are stored privately in Supabase as
 * reading-audio/<language>/<level>/unit-XX/main.wav. Playback receives only
 * a short-lived signed URL from the authenticated backend.
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { uploadOfficialReadingAudio, getOfficialReadingAudio } = require('../lib/readingAudioStorage');
const { generateReadingSpeech } = require('../lib/ttsService');

const ROOT = path.join(__dirname, '..');
const WORLD_DIR = path.join(ROOT, 'src', 'worlds');
const OUTPUT_DIR = path.join(ROOT, 'assets', 'audio', 'readings');
const MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
const VOICE = process.env.GEMINI_TTS_VOICE || 'Sulafat';
const MAX_INPUT_CHARS = 8000;

function parseArgs(args) {
  const options = { force: false, dryRun: false, limit: Infinity, language: '', slug: '', upload: false, provider: 'gemini' };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--force') options.force = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--upload') options.upload = true;
    else if (arg === '--provider') options.provider = String(args[++index] || '').trim().toLowerCase();
    else if (arg === '--language') options.language = String(args[++index] || '').trim().toLowerCase();
    else if (arg === '--slug') options.slug = String(args[++index] || '').trim();
    else if (arg === '--limit') options.limit = Math.max(1, Number.parseInt(args[++index], 10) || 1);
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: npm run generate:reading-audio -- --language <language> [--provider gemini|elevenlabs] [--upload] [--limit <n>] [--slug <lesson-slug>] [--force] [--dry-run]');
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  if (!options.language) throw new Error('Choose one language with --language. This prevents accidental full-catalogue generation.');
  if (!['gemini', 'elevenlabs'].includes(options.provider)) throw new Error('Provider must be gemini or elevenlabs.');
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
  return String(
    lesson?.reading?.text ||
    lesson?.extra?.mainTranscript ||
    lesson?.transcript ||
    ''
  ).replace(/\s+/g, ' ').trim();
}

function makeWav(pcm) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(24000, 24);
  header.writeUInt32LE(48000, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function synthesize(text, language, provider) {
  if (provider === 'elevenlabs') {
    return generateReadingSpeech(text, { language, provider });
  }
  // Keep this offline generator on the same Gemini TTS contract used by
  // lib/ttsService.js. The former /interactions payload can return HTTP 200
  // with a different response shape after a Gemini API update.
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
    method: 'POST',
    headers: {
      'x-goog-api-key': process.env.GEMINI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Read the following ${language} learning text naturally and warmly. Keep a measured pace for a language learner. Preserve every word and do not add anything.\n\n${text}`
        }]
      }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } }
      }
    })
  });
  const payload = await response.json().catch(() => ({}));
  const audioPart = payload?.candidates?.[0]?.content?.parts?.find((part) => part?.inlineData?.data);
  if (!response.ok || !audioPart?.inlineData?.data) {
    throw new Error(payload?.error?.message || `Gemini TTS returned ${response.status}.`);
  }
  const audio = Buffer.from(audioPart.inlineData.data, 'base64');
  // Gemini normally returns raw 24 kHz PCM. Keep a future WAV response intact
  // rather than writing a second header around it.
  return audioPart.inlineData.mimeType?.includes('wav') ? audio : makeWav(audio);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.dryRun && !String(process.env.GEMINI_API_KEY || '').trim()) {
    throw new Error('GEMINI_API_KEY is required. Add it only to .env or Vercel; never commit it.');
  }
  const allReadingLessons = readWorldLessons(options.language)
    .filter((lesson) => lesson.skill === 'reading')
    .map((lesson) => ({ lesson, text: readingText(lesson) }))
    .filter(({ text }) => text.length > 0 && text.length <= MAX_INPUT_CHARS);
  const unitNumbers = new Map();
  const unitsSeenByLevel = new Map();
  for (const { lesson } of allReadingLessons) {
    const seen = unitsSeenByLevel.get(lesson.level) || [];
    if (!seen.includes(lesson.unitId)) seen.push(lesson.unitId);
    unitsSeenByLevel.set(lesson.level, seen);
    unitNumbers.set(lesson.slug, seen.indexOf(lesson.unitId) + 1);
  }
  const lessons = allReadingLessons
    .filter(({ lesson }) => !options.slug || lesson.slug === options.slug)
    .slice(0, options.limit);
  if (!lessons.length) throw new Error('No eligible Reading lessons were found.');

  const languageDirectory = path.join(OUTPUT_DIR, options.language);
  for (const { lesson, text } of lessons) {
    const unitNumber = unitNumbers.get(lesson.slug);
    const outputPath = path.join(languageDirectory, `${lesson.slug}.wav`);
    if (options.upload && !options.force) {
      const existing = await getOfficialReadingAudio({
        language: options.language,
        level: lesson.level,
        unitNumber
      });
      if (existing?.signedUrl) {
        console.log(`Keeping existing official audio: ${lesson.level} unit ${unitNumber} (${lesson.slug})`);
        continue;
      }
    }
    if (!options.upload && fs.existsSync(outputPath) && !options.force) {
      console.log(`Keeping existing audio: ${path.relative(ROOT, outputPath)}`);
      continue;
    }
    console.log(`${options.dryRun ? 'Would generate' : 'Generating'}: ${lesson.slug} (${text.length} characters)`);
    if (options.dryRun) continue;
    const audio = await synthesize(text, options.language, options.provider);
    if (options.upload) {
      const stored = await uploadOfficialReadingAudio({
        audio,
        language: options.language,
        level: lesson.level,
        unitNumber,
        contentType: audio.contentType || 'audio/wav',
        force: options.force
      });
      console.log(`Uploaded to Supabase: ${stored.objectPath}${stored.alreadyExists ? ' (already exists)' : ''}`);
      continue;
    }
    fs.mkdirSync(languageDirectory, { recursive: true });
    fs.writeFileSync(outputPath, audio);
    console.log(`Saved: ${path.relative(ROOT, outputPath)}`);
  }
}

main().catch((error) => {
  console.error(`Reading audio generation failed: ${error.message}`);
  process.exitCode = 1;
});
