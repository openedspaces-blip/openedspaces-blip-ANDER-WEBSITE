#!/usr/bin/env node
// scripts/generate-english-a1-audio.js
// Administrative, pregenerated audio for English A1's Listening activities
// via ElevenLabs, targeting the CURRENT architecture only:
//   - reads course_lessons/lesson_dictation_segments (normalized schema,
//     scripts/content/english-a1-units.js -> scripts/migrate-english-a1-units.js)
//   - writes to the `lesson_audio` table (status: 'published'), which is
//     what lib/listeningService.js#getOfficialAudio actually queries
//   - writes per-segment audio paths onto `lesson_dictation_segments`
//     (normal_file_path/slow_file_path/very_slow_file_path)
//   - uploads to the "lesson-audio" Storage bucket - the bucket
//     docs/audio-architecture.md documents and the one that already exists
//     in this project (confirmed via read-only inspection: public, already
//     has an `english/A1/listening/` folder scaffolded by hand, plus an
//     unrelated one-off manual upload under `.../greetings/` this script
//     never touches or references)
//
// Two distinct audio "shapes" for a dialogue-type lesson, matching
// supabase/migrations/202607270001_lesson_audio_dialogue_path.sql's own
// design (that migration - not applied to this project's live database yet,
// confirmed by a read-only column probe - is the reason lesson_audio has a
// dialogue_file_path column at all):
//   1. Narrator tiers (main/slow/very-slow): ONE voice reading the lesson's
//      full transcript, at three speeds - lib/listeningService.js's
//      existing player already expects exactly this shape
//      (audioUrl/slowAudioUrl/verySlowAudioUrl), unchanged.
//   2. Dialogue performance (dialogue_file_path): a SEPARATE, single file,
//      normal speed only, one ElevenLabs voice per speaker, generated via
//      lib/ttsService.js#generateDialogueMp3 (ElevenLabs' text-to-dialogue
//      endpoint - stitches server-side, no local mp3 concatenation needed).
//      Optional/additive: null is fine, the player falls back to the
//      narrator tiers exactly like it does today.
//
// This intentionally supersedes an earlier, narrower draft of this same
// script (scripts/generate-english-listening-audio.js, removed) that
// synthesized the "main" audio as a per-line two-voice reading stitched
// with a plain Buffer.concat, before lib/ttsService.js grew
// generateDialogueMp3/resolveElevenLabsVoiceId (added by a concurrent
// session working the same problem - see that file's own exports comment).
// The native text-to-dialogue endpoint is strictly better for multi-voice
// audio (no manual stitching, no seam/gap risk), so this version adopts it
// instead of keeping the naive-concat approach.
//
// Distinct from three other things this script does NOT touch:
//   - lib/ttsService.js#generateTutorSpeech (AI Tutor's live/ephemeral
//     speech) - untouched
//   - scripts/generate-listening-audio.js (legacy: OpenAI-only, writes to
//     the old flat `lessons.audio_url` column) - untouched, never called
//   - scripts/generate-spanish-listening-audio.js (Español A1's sibling
//     script - different bucket ("course-audio"), never executed, out of
//     scope for this English-only pass)
//
// ElevenLabs only, never OpenAI (spec requirement): every synthesis call
// below goes through lib/ttsService.js#generateSpeechMp3ViaElevenLabs or
// #generateDialogueMp3 directly - NOT the provider-agnostic
// generateSpeechMp3(), which would silently fall back to OpenAI if
// TTS_PROVIDER/ELEVENLABS_API_KEY were ever misconfigured. isElevenLabsConfigured()
// (also ElevenLabs-specific) is the only readiness gate --confirm respects.
//
// ElevenLabs speed range (OPEN QUESTION): OpenAI's TTS speed param accepts
// 0.25-4.0; ElevenLabs' voice_settings.speed is documented with a
// narrower range (commonly cited as ~0.7-1.2). This script asks for 0.75
// (slow) and 0.7 (very slow) on the narrator tiers - UNVERIFIED against a
// real call. The dialogue file has no speed control at all (confirmed
// against the installed SDK's request types by the session that added
// generateDialogueMp3) - normal speed only, by design, not a gap here.
//
// Dictation segment voices: each segment's text is matched (case-sensitive
// substring) against the lesson's dialogue lines to reuse that speaker's
// voice; segments with no match (e.g. a standalone single word) fall back
// to the default narrator voice (first speaker's voice / index 0).
//
// SAFETY (mirrors scripts/generate-spanish-listening-audio.js's own rule):
// this script NEVER calls ElevenLabs or writes to Supabase (table or
// Storage) unless run with --confirm. Without --confirm (the default), it
// only prints a dry-run plan: every file that would be generated, its
// character count, target voice/model, whether it already exists
// (skip-by-default unless --force), and an estimated cost.
//
// Usage:
//   node scripts/generate-english-a1-audio.js                    # dry run / report only
//   node scripts/generate-english-a1-audio.js --unit=1           # scope to unit 1 (default and, today, only allowed unit)
//   node scripts/generate-english-a1-audio.js --unit=1 --confirm # actually generate + upload
//   node scripts/generate-english-a1-audio.js --unit=1 --confirm --force  # regenerate/overwrite even if already published
//
// Requires (only read when --confirm is passed): ELEVENLABS_API_KEY,
// ELEVENLABS_VOICE_ID (default/fallback voice), ELEVENLABS_VOICE_ID_EN /
// ELEVENLABS_VOICE_ID_EN_FEMALE / ELEVENLABS_VOICE_ID_EN_MALE (per-gender
// English voices), ELEVENLABS_MODEL_NARRATION / ELEVENLABS_MODEL_DIALOGUE
// (falls back to ELEVENLABS_MODEL_ID, then each function's own default),
// plus the existing Supabase service-role credentials (SUPABASE_URL /
// SUPABASE_SERVICE_ROLE_KEY, read only via lib/supabaseClient.js -
// never read or printed directly by this file). No new env vars.
//
// Also requires, before --confirm can succeed end-to-end (neither applied
// by this script - run via your normal Supabase migration flow):
//   - supabase/migrations/202607270001_lesson_audio_dialogue_path.sql
//     (adds lesson_audio.dialogue_file_path - confirmed NOT yet applied to
//     this project's live database via a read-only column probe)
require('dotenv').config();
const path = require('path');
const { units, language, level } = require('./content/english-a1-units');
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const {
  isElevenLabsConfigured,
  resolveElevenLabsVoiceId,
  generateSpeechMp3ViaElevenLabs,
  generateDialogueMp3
} = require('../lib/ttsService');

const BUCKET = 'lesson-audio';

// Today's approved pilot scope: unit order 1 ("hello") only - the one unit
// scripts/content/english-a1-units.js has authored rich Listening content
// for. --unit=<N> is real (see parseArgs), but any value other than an
// allow-listed one below is refused with a clear message rather than
// silently generating audio for an unauthored unit.
const ALLOWED_UNIT_ORDERS = new Set([1]);

// Real (not provider-verified - see header) speed values for the
// single-narrator tiers. `undefined` means "no speed override". The
// dialogue file has no speed tiers at all (see header).
const SPEED_TIERS = [
  { key: 'normal', suffix: 'main', speed: undefined },
  { key: 'slow', suffix: 'main-slow', speed: 0.75 },
  { key: 'verySlow', suffix: 'main-very-slow', speed: 0.7 }
];

// ElevenLabs bills by character; ~1000 characters ≈ 1 minute of speech at a
// natural pace. Rough budgeting estimate only, not an invoice - confirm
// against current ElevenLabs pricing before any real spend. Mirrors
// scripts/generate-spanish-listening-audio.js's same constant/caveat.
const USD_PER_1000_CHARS_ESTIMATE = 0.18;

function parseArgs(argv) {
  const confirm = argv.includes('--confirm');
  const force = argv.includes('--force');
  const unitArg = argv.find((a) => a.startsWith('--unit='));
  const unitOrder = unitArg ? Number(unitArg.slice('--unit='.length)) : 1;
  return { confirm, force, unitOrder };
}

function findUnit(unitOrder) {
  return units.find((u) => u.order === unitOrder) || null;
}

// -------------------------------------------------------------------
// Predictable Storage paths (spec requirement: "define rutas
// predecibles"). All under lesson-audio/<language>/<LEVEL>/listening/
// <unit-slug>/ - matches the folder Supabase already has scaffolded for
// English A1 and docs/audio-architecture.md's suggested layout. Exported
// for testing (see bottom of file).
// -------------------------------------------------------------------
function unitAudioBasePath(unit) {
  return `${language}/${level.toUpperCase()}/listening/${unit.slug}`;
}

function mainAudioStoragePath(unit, tierSuffix) {
  return `${unitAudioBasePath(unit)}/${tierSuffix}.mp3`;
}

function dialogueAudioStoragePath(unit) {
  return `${unitAudioBasePath(unit)}/dialogue.mp3`;
}

function dictationSegmentStoragePath(unit, segmentOrder) {
  return `${unitAudioBasePath(unit)}/dictation/segment-${segmentOrder}.mp3`;
}

// -------------------------------------------------------------------
// Voice/model resolution (pure - no network, except where noted).
// Alternates female/male by speaker index, same deterministic convention
// scripts/generate-spanish-listening-audio.js already established.
// -------------------------------------------------------------------
function genderForSpeakerIndex(index) {
  return index % 2 === 0 ? 'female' : 'male';
}

function voiceLabelForGender(gender) {
  return gender === 'male' ? 'ELEVENLABS_VOICE_ID_EN_MALE' : 'ELEVENLABS_VOICE_ID_EN_FEMALE';
}

function genderForSpeaker(speaker, speakers) {
  const index = (speakers || []).indexOf(speaker);
  return genderForSpeakerIndex(index === -1 ? 0 : index);
}

function narratorGender() {
  return genderForSpeakerIndex(0);
}

function modelForActivityType(activityType) {
  if (activityType === 'dialogue') {
    return process.env.ELEVENLABS_MODEL_DIALOGUE || process.env.ELEVENLABS_MODEL_ID || undefined;
  }
  return process.env.ELEVENLABS_MODEL_NARRATION || process.env.ELEVENLABS_MODEL_ID || undefined;
}

// Matches a dictation segment's text against the lesson's dialogue lines
// (case-sensitive substring) to reuse that line's speaker/voice; falls
// back to the default narrator (first speaker) when nothing matches - e.g.
// a standalone single-word segment that isn't a verbatim excerpt.
function speakerForDictationSegment(segmentText, activity) {
  const dialogue = activity.dialogue || [];
  const match = dialogue.find((line) => line.line && line.line.includes(segmentText));
  if (match) return match.speaker;
  return activity.speakers?.[0] || null;
}

function buildDialogueLines(activity) {
  if (!(activity.listeningType === 'dialogue' && activity.dialogue?.length)) return [];
  return activity.dialogue.map((line) => ({
    speaker: line.speaker,
    gender: genderForSpeaker(line.speaker, activity.speakers),
    text: line.line
  }));
}

// -------------------------------------------------------------------
// Plan building (pure - no network). 3 narrator-tier rows (single voice,
// full transcript) + at most 1 dialogue row (two voices, dialogue-type
// lessons only) + 1 row per dictation segment.
// -------------------------------------------------------------------
function buildPlanForUnit(unit) {
  const activity = unit.activities.listening;
  const narratorText = activity.transcript || activity.dialogue?.map((l) => l.line).join(' ') || '';
  const narratorModel = modelForActivityType('narration');
  const dialogueModel = modelForActivityType('dialogue');
  const dialogueLines = buildDialogueLines(activity);

  const mainItems = SPEED_TIERS.map((tier) => ({
    kind: 'main',
    tier: tier.key,
    speed: tier.speed,
    storagePath: mainAudioStoragePath(unit, tier.suffix),
    model: narratorModel,
    gender: narratorGender(),
    text: narratorText,
    chars: narratorText.length
  }));

  const dialogueItem = dialogueLines.length
    ? {
        kind: 'dialogue',
        storagePath: dialogueAudioStoragePath(unit),
        model: dialogueModel,
        lines: dialogueLines,
        chars: dialogueLines.reduce((sum, l) => sum + (l.text || '').length, 0)
      }
    : null;

  const dictationSegments = activity.dictation?.segments || [];
  const dictationItems = dictationSegments.map((segment, index) => {
    const speaker = speakerForDictationSegment(segment.text, activity);
    return {
      kind: 'dictation',
      order: segment.order ?? index,
      storagePath: dictationSegmentStoragePath(unit, segment.order ?? index),
      model: narratorModel,
      speaker,
      gender: genderForSpeaker(speaker, activity.speakers),
      text: segment.text,
      chars: (segment.text || '').length
    };
  });

  const totalChars =
    mainItems.reduce((sum, i) => sum + i.chars, 0) +
    (dialogueItem?.chars || 0) +
    dictationItems.reduce((sum, i) => sum + i.chars, 0);

  return {
    unit,
    activitySlug: `${language}-${level.toLowerCase()}-${unit.slug}-listening`,
    listeningType: activity.listeningType || 'narration',
    mainItems,
    dialogueItem,
    dictationItems,
    totalChars
  };
}

// -------------------------------------------------------------------
// Duplicate prevention (spec requirement 7). Two independent checks: the
// `lesson_audio` row / `lesson_dictation_segments` columns (source of
// truth the app reads), AND a direct Storage `list()` on the target folder
// (catches a file that was uploaded but never registered in the DB, or
// vice versa - belt and suspenders, cheap for one unit's worth of files).
// -------------------------------------------------------------------
async function loadExistingState(supabase, plan) {
  const { data: audioRow } = await supabase
    .from('lesson_audio')
    .select('id, main_file_path, slow_file_path, very_slow_file_path, dialogue_file_path, status')
    .eq('language', language)
    .eq('level', level.toUpperCase())
    .eq('lesson_slug', plan.activitySlug)
    .maybeSingle();

  const { data: lessonRow } = await supabase
    .from('course_lessons')
    .select('id')
    .eq('slug', plan.activitySlug)
    .maybeSingle();

  let dictationRows = [];
  if (lessonRow) {
    const { data } = await supabase
      .from('lesson_dictation_segments')
      .select('id, order_index, normal_file_path, slow_file_path, very_slow_file_path')
      .eq('lesson_id', lessonRow.id)
      .order('order_index');
    dictationRows = data || [];
  }

  const { data: storageFiles } = await supabase.storage.from(BUCKET).list(unitAudioBasePath(plan.unit));
  const { data: dictationStorageFiles } = await supabase.storage
    .from(BUCKET)
    .list(`${unitAudioBasePath(plan.unit)}/dictation`);

  return {
    audioRow: audioRow || null,
    lessonId: lessonRow?.id || null,
    dictationRows,
    storageFileNames: new Set((storageFiles || []).map((f) => f.name)),
    dictationStorageFileNames: new Set((dictationStorageFiles || []).map((f) => f.name))
  };
}

function mainItemAlreadyDone(item, existing) {
  const dbField =
    item.tier === 'normal'
      ? 'main_file_path'
      : item.tier === 'slow'
        ? 'slow_file_path'
        : 'very_slow_file_path';
  const dbDone = Boolean(existing.audioRow?.[dbField]);
  const storageDone = existing.storageFileNames.has(path.basename(item.storagePath));
  return dbDone || storageDone;
}

function dialogueItemAlreadyDone(item, existing) {
  if (!item) return true;
  const dbDone = Boolean(existing.audioRow?.dialogue_file_path);
  const storageDone = existing.storageFileNames.has(path.basename(item.storagePath));
  return dbDone || storageDone;
}

function dictationItemAlreadyDone(item, existing) {
  const row = existing.dictationRows.find((r) => r.order_index === item.order);
  const dbDone = Boolean(row?.normal_file_path);
  const storageDone = existing.dictationStorageFileNames.has(path.basename(item.storagePath));
  return dbDone || storageDone;
}

// -------------------------------------------------------------------
// Report / dry-run output (spec requirement 8: resumen de generados,
// omitidos y fallidos - the dry-run version previews what those buckets
// WOULD be; the --confirm run fills the same three counters for real).
// -------------------------------------------------------------------
function printPlan(plan, existing) {
  console.log(`English A1 Unit ${plan.unit.order} (${plan.unit.slug}) - ${plan.activitySlug}`);
  console.log(`  Tipo: ${plan.listeningType}`);
  console.log('  Narrador principal (3 velocidades, una sola voz, transcript completo):');
  plan.mainItems.forEach((item) => {
    const done = existing ? mainItemAlreadyDone(item, existing) : false;
    console.log(
      `    [${done ? 'YA EXISTE - se omite salvo --force' : 'pendiente'}] ${item.tier} -> ${BUCKET}/${item.storagePath} (${voiceLabelForGender(item.gender)}, modelo: ${item.model || 'default'}, speed: ${item.speed ?? 'default'}, ${item.chars} caracteres)`
    );
  });
  if (plan.dialogueItem) {
    const done = existing ? dialogueItemAlreadyDone(plan.dialogueItem, existing) : false;
    console.log('  Diálogo con dos voces (archivo separado, solo velocidad normal):');
    console.log(
      `    [${done ? 'YA EXISTE - se omite salvo --force' : 'pendiente'}] -> ${BUCKET}/${plan.dialogueItem.storagePath} (modelo: ${plan.dialogueItem.model || 'default'}, ${plan.dialogueItem.chars} caracteres) -> lesson_audio.dialogue_file_path`
    );
    plan.dialogueItem.lines.forEach((line) => {
      console.log(`        [${line.speaker || 'Narrador'} · ${voiceLabelForGender(line.gender)}] ${line.text}`);
    });
  } else {
    console.log('  Diálogo con dos voces: no aplica (esta lección no es de tipo diálogo).');
  }
  console.log(`  Fragmentos de dictado (${plan.dictationItems.length}):`);
  plan.dictationItems.forEach((item) => {
    const done = existing ? dictationItemAlreadyDone(item, existing) : false;
    console.log(
      `    [${done ? 'YA EXISTE - se omite salvo --force' : 'pendiente'}] segmento ${item.order} -> ${BUCKET}/${item.storagePath} (voz: ${item.speaker || 'Narrador'}, ${voiceLabelForGender(item.gender)}, ${item.chars} caracteres) "${item.text}"`
    );
  });
  console.log('');
}

async function main() {
  const { confirm, force, unitOrder } = parseArgs(process.argv.slice(2));

  if (!ALLOWED_UNIT_ORDERS.has(unitOrder)) {
    console.error(
      `Unidad ${unitOrder} no está autorizada todavía para generación de audio (solo Unidad 1 en este piloto). ` +
        'Amplía ALLOWED_UNIT_ORDERS explícitamente cuando se apruebe una unidad adicional.'
    );
    process.exit(1);
  }

  const unit = findUnit(unitOrder);
  if (!unit) {
    console.error(`No se encontró la Unidad ${unitOrder} en scripts/content/english-a1-units.js.`);
    process.exit(1);
  }

  const plan = buildPlanForUnit(unit);
  const estimatedCost = (plan.totalChars / 1000) * USD_PER_1000_CHARS_ESTIMATE;

  if (!confirm) {
    console.log('=== MODO SOLO LECTURA (sin --confirm): ningún proveedor ni Supabase será llamado ===\n');
    printPlan(plan, null);
    console.log('---------------------------------------------------------');
    console.log(`Total de caracteres (narrador x3 + diálogo + fragmentos): ${plan.totalChars}`);
    console.log(`Costo estimado (aprox., confirmar contra tarifas vigentes de ElevenLabs): $${estimatedCost.toFixed(2)} USD`);
    console.log(
      'Requiere antes de --confirm: ELEVENLABS_API_KEY configurado, y la migración ' +
        '202607270001_lesson_audio_dialogue_path.sql aplicada (confirmado por lectura: NO aplicada todavía).'
    );
    console.log('Ejecuta con --confirm para generar y subir audio real. Añade --force para regenerar lo ya existente.');
    return;
  }

  if (!isElevenLabsConfigured()) {
    throw new Error(
      'ElevenLabs no está configurado (falta ELEVENLABS_API_KEY o ELEVENLABS_VOICE_ID). Este script exige ElevenLabs; no usa OpenAI como respaldo.'
    );
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Supabase no está configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  }

  const existing = await loadExistingState(supabase, plan);
  console.log(`=== Generando audio real para ${plan.activitySlug} (force: ${force}) ===\n`);
  printPlan(plan, existing);

  const results = { generated: [], skipped: [], failed: [] };

  // 1) Narrator tiers - one voice, full transcript, 3 speeds.
  for (const item of plan.mainItems) {
    if (!force && mainItemAlreadyDone(item, existing)) {
      results.skipped.push(item.storagePath);
      continue;
    }
    try {
      const voiceId = resolveElevenLabsVoiceId({ language, gender: item.gender, activityType: 'narration' });
      const buffer = await generateSpeechMp3ViaElevenLabs(item.text, {
        model: item.model,
        speed: item.speed,
        language,
        gender: item.gender,
        activityType: 'narration'
      });
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(item.storagePath, buffer, { contentType: 'audio/mpeg', upsert: true });
      if (uploadError) throw new Error(uploadError.message);
      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(item.storagePath);

      const patch = { language, level: level.toUpperCase(), lesson_slug: plan.activitySlug };
      if (item.tier === 'normal') {
        patch.main_file_path = publicUrlData?.publicUrl;
        patch.title = unit.title;
        patch.source_type = 'official';
        patch.speaker = voiceId ? 'ElevenLabs' : null;
        patch.transcript = item.text;
        patch.status = 'published';
        patch.published_at = new Date().toISOString();
      } else if (item.tier === 'slow') {
        patch.slow_file_path = publicUrlData?.publicUrl;
      } else {
        patch.very_slow_file_path = publicUrlData?.publicUrl;
      }
      const { error: upsertError } = await supabase
        .from('lesson_audio')
        .upsert(patch, { onConflict: 'language,level,lesson_slug' });
      if (upsertError) throw new Error(upsertError.message);

      results.generated.push(item.storagePath);
    } catch (err) {
      results.failed.push(`${item.storagePath}: ${err.message}`);
    }
  }

  // 2) Dialogue performance - two voices, one file, ElevenLabs text-to-dialogue.
  if (plan.dialogueItem) {
    const item = plan.dialogueItem;
    if (!force && dialogueItemAlreadyDone(item, existing)) {
      results.skipped.push(item.storagePath);
    } else {
      try {
        const lines = item.lines.map((line) => ({
          text: line.text,
          voiceId: resolveElevenLabsVoiceId({ language, gender: line.gender, activityType: 'dialogue' })
        }));
        const buffer = await generateDialogueMp3(lines, { model: item.model });
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(item.storagePath, buffer, { contentType: 'audio/mpeg', upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(item.storagePath);

        const { error: upsertError } = await supabase.from('lesson_audio').upsert(
          {
            language,
            level: level.toUpperCase(),
            lesson_slug: plan.activitySlug,
            dialogue_file_path: publicUrlData?.publicUrl
          },
          { onConflict: 'language,level,lesson_slug' }
        );
        if (upsertError) throw new Error(upsertError.message);

        results.generated.push(item.storagePath);
      } catch (err) {
        results.failed.push(`${item.storagePath}: ${err.message}`);
      }
    }
  }

  // 3) Dictation segments - one voice each, individual clips.
  if (existing.lessonId) {
    for (const item of plan.dictationItems) {
      if (!force && dictationItemAlreadyDone(item, existing)) {
        results.skipped.push(item.storagePath);
        continue;
      }
      try {
        const buffer = await generateSpeechMp3ViaElevenLabs(item.text, {
          model: item.model,
          language,
          gender: item.gender,
          activityType: 'narration'
        });
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(item.storagePath, buffer, { contentType: 'audio/mpeg', upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(item.storagePath);

        const { error: updateError } = await supabase
          .from('lesson_dictation_segments')
          .update({ normal_file_path: publicUrlData?.publicUrl })
          .eq('lesson_id', existing.lessonId)
          .eq('order_index', item.order);
        if (updateError) throw new Error(updateError.message);

        results.generated.push(item.storagePath);
      } catch (err) {
        results.failed.push(`${item.storagePath}: ${err.message}`);
      }
    }
  } else {
    console.warn(
      `  -> ${plan.activitySlug} no existe todavía en course_lessons (¿falta correr migrate-english-a1-units.js?) - fragmentos de dictado omitidos.`
    );
  }

  console.log('\n=== Resumen ===');
  console.log(`Generados (${results.generated.length}):`, results.generated);
  console.log(`Omitidos, ya existían (${results.skipped.length}):`, results.skipped);
  console.log(`Fallidos (${results.failed.length}):`, results.failed);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

// Exported for local, network-free testing only - not consumed by any
// other file in this project.
module.exports = {
  parseArgs,
  findUnit,
  unitAudioBasePath,
  mainAudioStoragePath,
  dialogueAudioStoragePath,
  dictationSegmentStoragePath,
  genderForSpeakerIndex,
  genderForSpeaker,
  narratorGender,
  modelForActivityType,
  speakerForDictationSegment,
  buildDialogueLines,
  buildPlanForUnit,
  ALLOWED_UNIT_ORDERS,
  SPEED_TIERS,
  BUCKET
};
