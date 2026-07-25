#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');
const seedLessons = require('../lib/seed-lessons.json');

const readings = seedLessons.filter(
  (lesson) =>
    lesson.target_language === 'english' &&
    lesson.level === 'C2' &&
    lesson.skill === 'reading'
);

async function main() {
  if (readings.length !== 12) {
    throw new Error(`Expected 12 English C2 readings; found ${readings.length}.`);
  }
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    await client.query('begin');
    for (const lesson of readings) {
      const references = lesson.content_json?.extra?.readingReferences || [];
      if (!references.length) throw new Error(`${lesson.slug} has no references.`);
      const result = await client.query(
        `update course_lessons
         set extra = jsonb_set(coalesce(extra, '{}'::jsonb), '{readingReferences}', $2::jsonb, true)
         where slug = $1`,
        [lesson.slug, JSON.stringify(references)]
      );
      if (result.rowCount !== 1) throw new Error(`Reading not found in Supabase: ${lesson.slug}`);
    }
    await client.query('commit');
    const verification = await client.query(
      `select count(*)::int as readings_with_references
       from course_lessons cl
       join courses c on c.id = cl.course_id
       join languages l on l.id = c.language_id
       join levels lv on lv.id = c.level_id
       where l.code = 'english'
         and lv.code = 'C2'
         and cl.skill = 'reading'
         and jsonb_array_length(coalesce(cl.extra->'readingReferences', '[]'::jsonb)) > 0`
    );
    console.log(JSON.stringify(verification.rows[0], null, 2));
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
