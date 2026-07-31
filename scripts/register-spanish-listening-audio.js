#!/usr/bin/env node
// Registers the already-uploaded Spanish Listening MP3 files in production.
// Default mode is read-only; pass --confirm only after reviewing the plan.
require('dotenv').config();
const { Client } = require('pg');
const seedLessons = require('../lib/seed-lessons.json');

const BUCKET = 'lesson-audio';
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const EXPECTED_PER_LEVEL = 12;
const confirmed = process.argv.includes('--confirm');

function publicObjectUrl(objectName) {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const encodedPath = objectName.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${BUCKET}/${encodedPath}`;
}

function parseObject(object) {
  const match = object.name.match(/^spanish\/(A1|A2|B1|B2|C1|C2)\/unit-(\d+)\/[^/]+\.mp3$/i);
  if (!match || Number(object.bytes || 0) <= 0) return null;
  return { level: match[1].toUpperCase(), unitNumber: Number(match[2]), objectName: object.name };
}

function canonicalListeningRows() {
  const byLevel = new Map();
  for (const level of LEVELS) {
    const rows = seedLessons
      .filter((row) => row.target_language === 'spanish' && row.level === level && row.skill === 'listening' && row.unit_slug)
      .sort((a, b) => Number(a.order_index || 0) - Number(b.order_index || 0));
    if (rows.length !== EXPECTED_PER_LEVEL) throw new Error(`${level}: seed has ${rows.length} Listenings; expected ${EXPECTED_PER_LEVEL}.`);
    byLevel.set(level, rows);
  }
  return byLevel;
}

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL || !process.env.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_DATABASE_URL or SUPABASE_URL.');
  }
  const client = new Client({ connectionString: process.env.SUPABASE_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const canonical = canonicalListeningRows();
    const storageResult = await client.query(
      `select name, coalesce((metadata ->> 'size')::bigint, 0) as bytes
         from storage.objects
        where bucket_id = $1 and lower(name) like 'spanish/%'
        order by name`,
      [BUCKET]
    );
    const objects = storageResult.rows.map(parseObject).filter(Boolean);
    const plans = [];
    for (const level of LEVELS) {
      const matches = objects.filter((item) => item.level === level).sort((a, b) => a.unitNumber - b.unitNumber);
      if (matches.length !== EXPECTED_PER_LEVEL) throw new Error(`${level}: Storage has ${matches.length} valid MP3s; expected ${EXPECTED_PER_LEVEL}.`);
      matches.forEach((object, index) => {
        if (object.unitNumber !== index + 1) throw new Error(`${level}: missing unit-${String(index + 1).padStart(2, '0')}.`);
        plans.push({ level, lesson: canonical.get(level)[index], url: publicObjectUrl(object.objectName) });
      });
    }

    const lessonSlugs = plans.map((plan) => plan.lesson.slug);
    const lessonRows = await client.query('select id, slug from public.course_lessons where slug = any($1::text[])', [lessonSlugs]);
    const idBySlug = new Map(lessonRows.rows.map((row) => [row.slug, row.id]));
    const missing = lessonSlugs.filter((slug) => !idBySlug.has(slug));
    if (missing.length) throw new Error(`Missing ${missing.length} course_lessons: ${missing.join(', ')}`);

    console.log(`Validated ${plans.length} Spanish Listening MP3 files and matching course lessons.`);
    if (!confirmed) {
      console.log('Dry run complete. Use --confirm to publish these audio links.');
      return;
    }

    await client.query('begin');
    for (const plan of plans) {
      const courseLessonId = idBySlug.get(plan.lesson.slug);
      const transcript = plan.lesson.content_json?.transcript || '';
      if (!transcript.trim()) throw new Error(`${plan.lesson.slug}: missing transcript.`);
      const existing = await client.query(
        `select id from public.lesson_audio
          where course_lesson_id = $1 or (language = 'spanish' and level = $2 and lesson_slug = $3)
          order by (course_lesson_id = $1) desc limit 1`,
        [courseLessonId, plan.level, plan.lesson.slug]
      );
      const values = [plan.level, plan.lesson.slug, plan.lesson.title, plan.url, transcript, courseLessonId];
      if (existing.rowCount) {
        await client.query(
          `update public.lesson_audio
              set language = 'spanish', level = $1, lesson_slug = $2, title = $3,
                  source_type = 'official', main_file_path = $4, transcript = $5,
                  status = 'published', course_lesson_id = $6,
                  published_at = coalesce(published_at, now()), updated_at = now()
            where id = $7`,
          [...values, existing.rows[0].id]
        );
      } else {
        await client.query(
          `insert into public.lesson_audio (
            language, level, lesson_slug, title, source_type, main_file_path,
            transcript, status, course_lesson_id, published_at
          ) values ('spanish', $1, $2, $3, 'official', $4, $5, 'published', $6, now())`,
          values
        );
      }
    }
    await client.query('commit');

    const verification = await client.query(
      `select level, count(*)::int as published,
              count(*) filter (where course_lesson_id is not null and main_file_path like $1 and coalesce(transcript, '') <> '')::int as ready
         from public.lesson_audio
        where language = 'spanish' and level = any($2::text[]) and status = 'published'
        group by level order by level`,
      [`${String(process.env.SUPABASE_URL).replace(/\/+$/, '')}/storage/v1/object/public/${BUCKET}/spanish/%`, LEVELS]
    );
    console.log(JSON.stringify(verification.rows, null, 2));
  } catch (error) {
    if (confirmed) {
      try { await client.query('rollback'); } catch {}
    }
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`Spanish audio registration aborted: ${error.message}`);
  process.exit(1);
});
