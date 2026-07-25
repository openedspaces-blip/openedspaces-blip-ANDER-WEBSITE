#!/usr/bin/env node
require('dotenv').config();
const path = require('path');
const { Client } = require('pg');

const rows = require(path.join(__dirname, '..', 'lib', 'seed-lessons.json')).filter(
  (row) =>
    row.target_language === 'english' &&
    row.skill === 'grammar' &&
    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(row.level)
);

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL) throw new Error('SUPABASE_DATABASE_URL is required.');
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    await client.query('begin');
    let updated = 0;
    for (const row of rows) {
      const extra = row.content_json?.extra || {};
      const result = await client.query(
        `update course_lessons
           set extra = $2::jsonb, updated_at = now()
         where slug = $1`,
        [row.slug, JSON.stringify(extra)]
      );
      updated += result.rowCount;
    }
    await client.query('commit');
    console.log(`Updated ${updated}/${rows.length} English Grammar lessons in Supabase.`);
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
