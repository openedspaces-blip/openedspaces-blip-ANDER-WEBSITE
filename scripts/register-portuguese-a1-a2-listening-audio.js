#!/usr/bin/env node
// Registers the official Portuguese A1/A2 MP3s already uploaded to the
// lesson-audio bucket. Each track is matched to its specific Listening unit;
// no guessed URL is ever published.
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const seedLessons = require('../lib/seed-lessons.json');

const BUCKET = 'lesson-audio';
const LANGUAGE = 'portuguese';
const LEVELS = ['A1', 'A2'];
const UNIT_COUNT = 12;

function publicObjectUrl(objectName) {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  return `${base}/storage/v1/object/public/${BUCKET}/${objectName
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}

async function findAudioObject(client, level, unitNumber) {
  const unit = `unit-${String(unitNumber).padStart(2, '0')}`;
  const prefix = `${LANGUAGE}/${level}/${unit}`;
  const { data, error } = await client.storage.from(BUCKET).list(prefix, { limit: 100 });
  if (error) throw error;
  const file = (data || []).find(
    (entry) => /\.mp3$/i.test(entry.name) && Number(entry.metadata?.size || 0) > 0
  );
  return file ? `${prefix}/${file.name}` : null;
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error('Missing Supabase URL or service-role key.');
  const client = createClient(url, key, { auth: { persistSession: false } });
  const listeningLessons = seedLessons
    .filter(
      (lesson) =>
        lesson.target_language === LANGUAGE &&
        LEVELS.includes(lesson.level) &&
        lesson.skill === 'listening' &&
        lesson.unit_slug
    )
    .sort((a, b) => Number(a.order_index) - Number(b.order_index));

  if (listeningLessons.length !== LEVELS.length * UNIT_COUNT) {
    throw new Error(`Expected ${LEVELS.length * UNIT_COUNT} Portuguese Listening lessons, found ${listeningLessons.length}.`);
  }

  const { data: dbLessons, error: lessonError } = await client
    .from('course_lessons')
    .select('id,slug')
    .in('slug', listeningLessons.map((lesson) => lesson.slug));
  if (lessonError) throw lessonError;
  const lessonIdBySlug = new Map((dbLessons || []).map((lesson) => [lesson.slug, lesson.id]));
  if (lessonIdBySlug.size !== listeningLessons.length) {
    throw new Error('Portuguese A1/A2 Listening lessons must be migrated first.');
  }

  const missing = [];
  let linked = 0;
  for (const level of LEVELS) {
    const lessons = listeningLessons.filter((lesson) => lesson.level === level);
    for (let index = 0; index < UNIT_COUNT; index += 1) {
      const lesson = lessons[index];
      const objectName = await findAudioObject(client, level, index + 1);
      if (!objectName) {
        missing.push(`${level} unit-${String(index + 1).padStart(2, '0')}`);
        continue;
      }
      const courseLessonId = lessonIdBySlug.get(lesson.slug);
      const { data: existing, error: existingError } = await client
        .from('lesson_audio')
        .select('id')
        .eq('course_lesson_id', courseLessonId)
        .maybeSingle();
      if (existingError) throw existingError;

      const values = {
        language: LANGUAGE,
        level,
        lesson_slug: lesson.slug,
        title: lesson.content_json?.extra?.storyTitle || lesson.title,
        source_type: 'official',
        main_file_path: publicObjectUrl(objectName),
        transcript: lesson.content_json?.extra?.mainTranscript || lesson.content_json?.transcript || '',
        status: 'published',
        course_lesson_id: courseLessonId,
        published_at: new Date().toISOString()
      };
      const query = existing
        ? client.from('lesson_audio').update(values).eq('id', existing.id)
        : client.from('lesson_audio').insert(values);
      const { error } = await query;
      if (error) throw error;
      linked += 1;
    }
  }

  if (missing.length) throw new Error(`Missing audio files: ${missing.join(', ')}`);
  console.log(JSON.stringify({ linked, missing }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
