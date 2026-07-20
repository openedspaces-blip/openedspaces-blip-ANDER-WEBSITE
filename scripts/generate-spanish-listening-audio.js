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
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const { generateSpeechMp3, isConfigured: isTtsConfigured } = require('../lib/ttsService');

const CONFIRM = process.argv.includes('--confirm');
const BUCKET = 'course-audio';
// Approved pilot scope (see this file's header): --confirm only ever
// generates this one unit, single-narrator, not the full 12-unit catalog
// and not per-speaker multi-voice dialogue (needs audio-clip stitching
// this project doesn't have a tool for yet).
const PILOT_UNIT_SLUG = 'hola-mucho-gusto';

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

async function ensureBucket(supabase) {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (buckets?.some((bucket) => bucket.name === BUCKET)) return;

  const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (createError && !/already exists/i.test(createError.message || '')) throw createError;
}

// Pilot generation: single-narrator reading of activity.transcript for
// PILOT_UNIT_SLUG only (see header). Reuses lib/ttsService.js#generateSpeechMp3
// (provider-agnostic; ElevenLabs when ELEVENLABS_API_KEY is set, per that
// file's own ttsProvider() logic) instead of calling the ElevenLabs SDK
// directly here, so this script never has to duplicate provider/voice
// resolution logic.
async function generateAndUpload() {
  if (!isTtsConfigured()) {
    throw new Error(
      'Ningún proveedor de TTS está configurado (falta ELEVENLABS_API_KEY o OPENAI_API_KEY). Agrégalo a .env y vuelve a intentar.'
    );
  }

  const unit = units.find((u) => u.slug === PILOT_UNIT_SLUG);
  if (!unit) throw new Error(`No se encontró la unidad piloto "${PILOT_UNIT_SLUG}".`);
  const activity = unit.activities.listening;
  const text = activity.transcript || activity.dialogue?.map((l) => l.line).join(' ') || '';
  if (!text.trim()) throw new Error(`La unidad piloto "${PILOT_UNIT_SLUG}" no tiene transcript.`);

  const activitySlug = `spanish-a1-${unit.slug}-listening`;
  const storagePath = `${language}/${level.toLowerCase()}/unit-${String(unit.order).padStart(2, '0')}/${activitySlug}/normal.mp3`;

  console.log(`Generando audio para ${activitySlug} (${text.length} caracteres) ...`);
  const supabase = getSupabaseAdmin();
  await ensureBucket(supabase);

  const mp3Buffer = await generateSpeechMp3(text, { language });

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, mp3Buffer, { contentType: 'audio/mpeg', upsert: true });
  if (uploadError) throw new Error(`Error subiendo a Storage: ${uploadError.message}`);

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  const audioUrl = publicUrlData?.publicUrl;
  if (!audioUrl) throw new Error('No se pudo obtener la URL pública del audio subido.');

  const { error: upsertError } = await supabase.from('lesson_audio').upsert(
    {
      language,
      level: level.toUpperCase(),
      lesson_slug: activitySlug,
      title: activity.title,
      source_type: 'official',
      main_file_path: audioUrl,
      transcript: activity.transcript || '',
      status: 'published',
      published_at: new Date().toISOString()
    },
    { onConflict: 'language,level,lesson_slug' }
  );
  if (upsertError) throw new Error(`Error guardando lesson_audio: ${upsertError.message}`);

  console.log(`Listo: ${audioUrl}`);
  console.log(
    'Nota: slow_file_path queda sin definir - el reproductor ya usa una reducción de playbackRate en el cliente cuando falta, mismo comportamiento que el resto del catálogo.'
  );
}

async function main() {
  const rows = buildReport();
  if (!CONFIRM) {
    printReport(rows);
    console.log(
      `\nAlcance real de --confirm: solo la unidad piloto aprobada ("${PILOT_UNIT_SLUG}"), narrador único (no las 12 unidades ni voces por personaje).`
    );
    return;
  }
  await generateAndUpload();
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
