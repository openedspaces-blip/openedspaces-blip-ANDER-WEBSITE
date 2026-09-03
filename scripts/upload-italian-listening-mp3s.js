#!/usr/bin/env node
/* Uploads the locally generated Italian C1/C2 listening MP3s to the
 * canonical lesson-audio bucket and publishes their lesson_audio records. */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { getSupabaseAdmin } = require('../lib/supabaseClient');

const ROOT = path.join(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, 'assets', 'audio', 'listenings', 'italian');
const SLUGS = [
  'italian-c1-argomentazione-pubblica-listening', 'italian-c1-innovazione-e-societa-listening',
  'italian-c1-etica-e-decisioni-listening', 'italian-c1-arte-e-interpretazione-listening',
  'italian-c1-ricerca-e-metodo-listening', 'italian-c1-economia-quotidiana-listening',
  'italian-c1-territori-e-memoria-listening', 'italian-c1-comunicazione-e-registro-listening',
  'italian-c1-scienza-e-divulgazione-listening', 'italian-c1-conflitto-e-negoziazione-listening',
  'italian-c1-letteratura-e-voce-listening', 'italian-c1-progetto-personale-listening',
  'italian-c2-linguaggio-e-persuasione-listening', 'italian-c2-politiche-pubbliche-listening',
  'italian-c2-conoscenza-e-incertezza-listening', 'italian-c2-narrazione-e-identita-listening',
  'italian-c2-diritto-e-responsabilita-listening', 'italian-c2-economia-e-disuguaglianza-listening',
  'italian-c2-ambiente-e-futuro-listening', 'italian-c2-media-e-discorso-listening',
  'italian-c2-scienza-e-responsabilita-listening', 'italian-c2-filosofia-quotidiana-listening',
  'italian-c2-mediazione-interculturale-listening', 'italian-c2-sintesi-e-proposta-listening'
];

async function main() {
  const supabase = getSupabaseAdmin();
  const { data: lessons, error } = await supabase
    .from('course_lessons')
    .select('id, slug, title, order_index, extra')
    .in('slug', SLUGS)
    .eq('skill', 'listening');
  if (error) throw error;
  if (lessons.length !== SLUGS.length) throw new Error(`Expected ${SLUGS.length} course lessons, found ${lessons.length}.`);

  let uploaded = 0;
  for (const lesson of lessons) {
    const localPath = path.join(AUDIO_DIR, `${lesson.slug}.mp3`);
    if (!fs.existsSync(localPath)) throw new Error(`Missing local audio: ${localPath}`);
    const level = lesson.slug.includes('-c1-') ? 'C1' : 'C2';
    const unit = Math.floor(Number(lesson.order_index) / 10);
    if (!unit) throw new Error(`Invalid unit order for ${lesson.slug}: ${lesson.order_index}`);
    const unitLabel = String(unit).padStart(2, '0');
    const objectPath = `italian/${level}/unit-${unitLabel}/it ${level.toLowerCase()} ${unitLabel}.mp3`;
    const audio = fs.readFileSync(localPath);
    const { error: uploadError } = await supabase.storage.from('lesson-audio').upload(objectPath, audio, {
      contentType: 'audio/mpeg', upsert: true
    });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from('lesson-audio').getPublicUrl(objectPath);
    const payload = {
      language: 'italian', level, lesson_slug: lesson.slug, title: lesson.title,
      source_type: 'official', main_file_path: urlData.publicUrl,
      transcript: String(lesson.extra?.mainTranscript || ''), status: 'published',
      published_at: new Date().toISOString(), course_lesson_id: lesson.id
    };
    const { data: existing, error: existingError } = await supabase
      .from('lesson_audio').select('id').eq('course_lesson_id', lesson.id).maybeSingle();
    if (existingError) throw existingError;
    const result = existing
      ? await supabase.from('lesson_audio').update(payload).eq('id', existing.id)
      : await supabase.from('lesson_audio').insert(payload);
    if (result.error) throw result.error;
    uploaded += 1;
    console.log(`Published: ${lesson.slug} -> ${objectPath}`);
  }
  console.log(`Italian listening upload complete: ${uploaded}/${SLUGS.length}`);
}

main().catch((error) => { console.error(`Italian listening upload failed: ${error.message}`); process.exit(1); });
