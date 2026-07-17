#!/usr/bin/env node
// scripts/generate-spanish-listening-audio.js
// Administrative, pregenerated audio for Español A1's Listening activities
// via ElevenLabs (narration + dialogue voices), per docs' course-audio
// storage convention. Distinct from lib/ttsService.js (AI Tutor speech,
// live/ephemeral) and scripts/generate-listening-audio.js (legacy OpenAI
// TTS writing to the old lessons.audio_url column) - neither of those is
// touched by this script.
//
// SAFETY: this script NEVER calls ElevenLabs or writes to Supabase Storage
// unless run with --confirm. Without that flag (the default), it only
// prints a dry-run report: every script line, character count, target
// voice, model, and an estimated cost - exactly what should be reviewed
// and approved before spending real money on generation. This mirrors the
// project's own rule: audio is generated once and cached, never on every
// playback, and never generated in bulk without an explicit go-ahead.
//
// Usage:
//   node scripts/generate-spanish-listening-audio.js            # dry run / report only
//   node scripts/generate-spanish-listening-audio.js --confirm  # actually generate + upload
//
// Requires (only when --confirm is passed): ELEVENLABS_API_KEY,
// ELEVENLABS_MODEL_NARRATION, ELEVENLABS_MODEL_DIALOGUE,
// ELEVENLABS_VOICE_ES_FEMALE, ELEVENLABS_VOICE_ES_MALE, plus Supabase
// service-role credentials (uploads to the "course-audio" bucket, path
// course-audio/spanish/a1/unit-NN/activity-slug/{normal,slow,very-slow}.mp3).
require('dotenv').config();
const { units, language, level } = require('./content/spanish-a1-units');

const CONFIRM = process.argv.includes('--confirm');

// eleven_v3 for dialogue (multi-speaker, more expressive), eleven_multilingual_v2
// for single-narrator listenings (voice-message/story/interview), per the
// approved model plan. Not configurable per-unit - same two models for all
// of Español A1's Listening activities.
function modelForListening(activity) {
  return activity.listeningType === 'dialogue' ? 'eleven_v3' : 'eleven_multilingual_v2';
}

function voiceLabelForSpeaker(speaker, speakers) {
  if (!speaker) return 'Narrador/a (ELEVENLABS_VOICE_ES_FEMALE)';
  const index = (speakers || []).indexOf(speaker);
  // Deterministic alternation: first speaker -> female voice, second -> male,
  // repeating for any additional speakers. Reviewed/adjusted per script
  // before real generation, not hardcoded by name.
  return index % 2 === 0
    ? `${speaker} (ELEVENLABS_VOICE_ES_FEMALE)`
    : `${speaker} (ELEVENLABS_VOICE_ES_MALE)`;
}

function buildScriptLines(activity) {
  if (activity.listeningType === 'dialogue' && activity.dialogue?.length) {
    return activity.dialogue.map((line) => ({
      speaker: line.speaker,
      voice: voiceLabelForSpeaker(line.speaker, activity.speakers),
      text: line.line
    }));
  }
  return [{ speaker: activity.speakers?.[0] || 'Narrador/a', voice: voiceLabelForSpeaker(null), text: activity.transcript || '' }];
}

// ElevenLabs bills by character. ~1000 characters ≈ 1 minute of speech at a
// natural pace; this is a rough estimate for budgeting, not an invoice.
const USD_PER_1000_CHARS_ESTIMATE = 0.18; // approx. Creator-tier blended rate; confirm against current ElevenLabs pricing before real spend.

function buildReport() {
  const rows = [];
  units.forEach((unit) => {
    const activity = unit.activities.listening;
    const lines = buildScriptLines(activity);
    const totalChars = lines.reduce((sum, l) => sum + (l.text || '').length, 0);
    // 3 speed variants (normal/slow/very-slow) of the same script are
    // planned, but only the normal pass is billed by character count in
    // this estimate - slow/very-slow are the same audio played back at a
    // reduced rate unless/until a per-speed re-synthesis is explicitly
    // requested (matching the existing English/French slow-audio pattern).
    rows.push({
      unit: unit.slug,
      order: unit.order,
      accessTier: unit.accessTier,
      activitySlug: `spanish-a1-${unit.slug}-listening`,
      listeningType: activity.listeningType,
      model: modelForListening(activity),
      durationSecondsEstimate: activity.durationSeconds,
      totalChars,
      lines,
      questions: (activity.exercises || []).map((e) => e.prompt)
    });
  });
  return rows;
}

function printReport(rows) {
  console.log(`Español A1 - Listening audio generation plan (${units.length} activities)\n`);
  let grandTotalChars = 0;
  rows.forEach((row) => {
    grandTotalChars += row.totalChars;
    console.log(`Unidad ${row.order} (${row.unit}) - ${row.activitySlug}`);
    console.log(`  Tier: ${row.accessTier} | Tipo: ${row.listeningType} | Modelo: ${row.model}`);
    console.log(`  Duración estimada: ${row.durationSecondsEstimate}s | Caracteres: ${row.totalChars}`);
    row.lines.forEach((line) => {
      console.log(`    [${line.voice}] ${line.text}`);
    });
    console.log(`  Preguntas de comprensión: ${row.questions.length}`);
    console.log('');
  });
  const estimatedCost = (grandTotalChars / 1000) * USD_PER_1000_CHARS_ESTIMATE;
  console.log('---------------------------------------------------------');
  console.log(`Total de caracteres (guiones "normal", 12 actividades): ${grandTotalChars}`);
  console.log(`Costo estimado (aprox., a confirmar contra tarifas vigentes de ElevenLabs): $${estimatedCost.toFixed(2)} USD`);
  console.log('Modelos: eleven_multilingual_v2 (narración), eleven_v3 (diálogo), eleven_flash_v2_5 (previsualización, no incluida en este estimado).');
  console.log('Este es un reporte de solo lectura. Ejecuta con --confirm para generar y subir audio real (requiere ELEVENLABS_API_KEY y credenciales de Supabase).');
}

async function generateAndUpload(rows) {
  // Real generation path - intentionally not wired to any ElevenLabs SDK
  // call yet. Left as an explicit stub so this script can be reviewed and
  // approved (voices, scripts, cost) before any implementation that spends
  // money or writes to Storage is added and run.
  throw new Error(
    'Generación real de audio no implementada todavía: pendiente de aprobación explícita (guiones/voces/costo) antes de conectar la API de ElevenLabs. Ver cabecera de este archivo.'
  );
}

async function main() {
  const rows = buildReport();
  if (!CONFIRM) {
    printReport(rows);
    return;
  }
  await generateAndUpload(rows);
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
