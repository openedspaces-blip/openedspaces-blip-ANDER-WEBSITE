#!/usr/bin/env node
// scripts/generate-listening-audio.js
// One-time, idempotent generation of real listening audio per lesson:
// builds a spoken script from each listening lesson's dialogue/phrases,
// synthesizes it with OpenAI TTS, uploads the mp3 to the "lesson-audio"
// Supabase Storage bucket, and saves the public URL on lessons.audio_url.
// Usage: npm run audio:generate
require('dotenv').config();
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const { generateSpeechMp3, isConfigured: isTtsConfigured } = require('../lib/ttsService');
const config = require('../lib/config');

const BUCKET = 'lesson-audio';

function buildSpeechScript(lesson) {
  const content = lesson.content_json || {};
  const dialogueLines = (content.dialogue || []).map((line) => line.line).filter(Boolean);
  if (dialogueLines.length) return dialogueLines.join('. ');

  const phrases = content.phrases || [];
  if (phrases.length) return phrases.join('. ');

  return content.intro || lesson.title || '';
}

async function ensureBucket(supabase) {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (buckets?.some((bucket) => bucket.name === BUCKET)) return;

  const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (createError && !/already exists/i.test(createError.message || '')) throw createError;
}

async function main() {
  if (!config.isSupabaseConfigured) {
    console.error('Supabase no está configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). Nada que hacer.');
    process.exit(1);
  }
  if (!isTtsConfigured()) {
    console.error('OPENAI_API_KEY no está configurado. Agrégalo a tu .env (o a Vercel) y vuelve a intentar.');
    process.exit(1);
  }

  const supabase = getSupabaseAdmin();
  await ensureBucket(supabase);

  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('id, slug, target_language, level, content_json, audio_url')
    .eq('skill', 'listening')
    .order('target_language', { ascending: true })
    .order('level', { ascending: true });

  if (error) {
    console.error('No se pudieron leer las lecciones:', error.message);
    process.exit(1);
  }

  console.log(`Encontradas ${lessons.length} lecciones de listening.`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const lesson of lessons) {
    if (lesson.audio_url) {
      skipped += 1;
      continue;
    }

    const text = buildSpeechScript(lesson);
    if (!text.trim()) {
      console.warn(`  -> ${lesson.slug}: sin texto para sintetizar, se omite.`);
      continue;
    }

    process.stdout.write(`  -> ${lesson.slug} (${lesson.target_language} ${lesson.level}) ... `);
    try {
      const mp3Buffer = await generateSpeechMp3(text, { language: lesson.target_language });
      const storagePath = `${lesson.target_language}/${lesson.level}/${lesson.slug}.mp3`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, mp3Buffer, { contentType: 'audio/mpeg', upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      const audioUrl = publicUrlData?.publicUrl;

      const { error: updateError } = await supabase
        .from('lessons')
        .update({ audio_url: audioUrl })
        .eq('id', lesson.id);
      if (updateError) throw updateError;

      generated += 1;
      console.log('done');
    } catch (err) {
      failed += 1;
      console.log('FAILED:', err.message);
    }
  }

  console.log(`Listo. Generados: ${generated}, ya existentes (omitidos): ${skipped}, fallidos: ${failed}, total: ${lessons.length}.`);
}

main().catch((error) => {
  console.error('Error inesperado generando audio:', error);
  process.exit(1);
});
