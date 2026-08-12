#!/usr/bin/env node
// Fast production sync for the visible European Reading sections. The full
// curriculum migrator also replaces exercises and can take several minutes.
require('dotenv').config();
const { Client } = require('pg');
const lessons = require('../lib/seed-lessons.json');

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL) throw new Error('SUPABASE_DATABASE_URL is not configured.');
  const client = new Client({ connectionString: process.env.SUPABASE_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const readings = lessons.filter((lesson) =>
      ['italian', 'portuguese', 'german'].includes(lesson.target_language) &&
      ['A1', 'A2', 'B1'].includes(lesson.level) &&
      lesson.skill === 'reading' && lesson.content_json?.reading?.text
    );
    await client.query('begin');
    for (const lesson of readings) {
      const section = await client.query(
        `select ls.id from lesson_sections ls join course_lessons cl on cl.id=ls.lesson_id
         where cl.slug=$1 and ls.type='reading' limit 1`,
        [lesson.slug]
      );
      if (!section.rowCount) throw new Error(`Missing Reading section: ${lesson.slug}`);
      await client.query(
        `update lesson_sections set reading_title=$2, reading_text=$3, reading_questions=$4::jsonb
         where id=$1`,
        [section.rows[0].id, lesson.content_json.reading.title || lesson.title, lesson.content_json.reading.text, JSON.stringify(lesson.content_json.reading.questions || [])]
      );
    }
    await client.query('commit');
    console.log(`Updated ${readings.length} European Reading sections.`);
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}
main().catch((error) => { console.error(error); process.exit(1); });
