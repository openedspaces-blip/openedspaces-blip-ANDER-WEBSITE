#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');
const seedLessons = require('../lib/seed-lessons.json');

const BUCKET = 'lesson-audio';
const LEVELS = ['B1', 'B2', 'C1', 'C2'];
const EXPECTED_PER_LEVEL = 12;
const confirmed = process.argv.includes('--confirm');

function publicObjectUrl(objectName) {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const encodedPath = objectName.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${BUCKET}/${encodedPath}`;
}

function parseObject(object) {
  const match = object.name.match(/^english\/(B1|B2|C1|C2)\/unit-(\d+)\/.+\.mp3$/i);
  if (!match) return null;
  return {
    level: match[1].toUpperCase(),
    unitNumber: Number(match[2]),
    objectName: object.name,
    bytes: Number(object.bytes || 0)
  };
}

function canonicalListeningRows() {
  const byLevel = new Map();
  for (const level of LEVELS) {
    const rows = seedLessons
      .filter(
        (row) =>
          row.target_language === 'english' &&
          row.level === level &&
          row.skill === 'listening' &&
          row.unit_slug
      )
      .sort((a, b) => Number(a.order_index || 0) - Number(b.order_index || 0));
    if (rows.length !== EXPECTED_PER_LEVEL) {
      throw new Error(`${level}: seed has ${rows.length} Listenings; expected 12.`);
    }
    byLevel.set(level, rows);
  }
  return byLevel;
}

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL || !process.env.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_DATABASE_URL or SUPABASE_URL.');
  }
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const storageResult = await client.query(
      `select name, metadata ->> 'size' as bytes
         from storage.objects
        where bucket_id = $1
          and lower(name) like 'english/%'
        order by name`,
      [BUCKET]
    );
    const objects = storageResult.rows.map(parseObject).filter(Boolean);
    const canonical = canonicalListeningRows();
    const plans = [];

    for (const level of LEVELS) {
      const levelObjects = objects
        .filter((object) => object.level === level)
        .sort((a, b) => a.unitNumber - b.unitNumber);
      if (levelObjects.length !== EXPECTED_PER_LEVEL) {
        throw new Error(`${level}: Storage has ${levelObjects.length} valid MP3s; expected 12.`);
      }
      for (let index = 0; index < EXPECTED_PER_LEVEL; index += 1) {
        const object = levelObjects[index];
        if (object.unitNumber !== index + 1 || object.bytes <= 0) {
          throw new Error(`${level}: missing valid MP3 for unit-${String(index + 1).padStart(2, '0')}.`);
        }
        plans.push({
          level,
          lesson: canonical.get(level)[index],
          url: publicObjectUrl(object.objectName)
        });
      }
    }

    const lessonSlugs = plans.map((plan) => plan.lesson.slug);
    const lessonsResult = await client.query(
      `select id, slug from public.course_lessons where slug = any($1::text[])`,
      [lessonSlugs]
    );
    const lessonIdBySlug = new Map(lessonsResult.rows.map((row) => [row.slug, row.id]));
    const missing = lessonSlugs.filter((slug) => !lessonIdBySlug.has(slug));
    if (missing.length) throw new Error(`Missing ${missing.length} course_lessons: ${missing.join(', ')}`);

    console.log(`Validated plan: ${plans.length} English B1-C2 audio files.`);
    if (!confirmed) {
      console.log('Dry run complete. Use --confirm to publish the links.');
      return;
    }

    await client.query('begin');
    for (const plan of plans) {
      const courseLessonId = lessonIdBySlug.get(plan.lesson.slug);
      const transcript =
        plan.lesson.content_json?.extra?.mainTranscript ||
        plan.lesson.content_json?.transcript ||
        '';
      const title =
        plan.lesson.content_json?.extra?.storyTitle ||
        plan.lesson.title;
      const existing = await client.query(
        `select id from public.lesson_audio
          where course_lesson_id = $1
             or (language = 'english' and level = $2 and lesson_slug = $3)
          order by (course_lesson_id = $1) desc
          limit 1`,
        [courseLessonId, plan.level, plan.lesson.slug]
      );
      if (existing.rowCount) {
        await client.query(
          `update public.lesson_audio
              set language = 'english', level = $2, lesson_slug = $3, title = $4,
                  source_type = 'official', main_file_path = $5, transcript = $6,
                  status = 'published', course_lesson_id = $7,
                  published_at = coalesce(published_at, now()), updated_at = now()
            where id = $1`,
          [existing.rows[0].id, plan.level, plan.lesson.slug, title, plan.url, transcript, courseLessonId]
        );
      } else {
        await client.query(
          `insert into public.lesson_audio (
             language, level, lesson_slug, title, source_type, main_file_path,
             transcript, status, course_lesson_id, published_at
           ) values ('english', $1, $2, $3, 'official', $4, $5, 'published', $6, now())`,
          [plan.level, plan.lesson.slug, title, plan.url, transcript, courseLessonId]
        );
      }
    }
    await client.query('commit');

    const verification = await client.query(
      `select level, count(*)::int as published,
              count(*) filter (
                where course_lesson_id is not null
                  and main_file_path like $1
                  and coalesce(transcript, '') <> ''
              )::int as fully_linked
         from public.lesson_audio
        where language = 'english' and level = any($2::text[]) and status = 'published'
        group by level order by level`,
      [`${String(process.env.SUPABASE_URL).replace(/\/+$/, '')}/storage/v1/object/public/${BUCKET}/english/%`, LEVELS]
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
  console.error(`English audio registration aborted: ${error.message}`);
  process.exit(1);
});
