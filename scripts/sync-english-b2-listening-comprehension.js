require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const databaseUrl = process.env.SUPABASE_DATABASE_URL;
if (!databaseUrl) throw new Error('SUPABASE_DATABASE_URL is required.');

const seedPath = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const seedRows = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const listeningRows = seedRows.filter(
  (row) =>
    row.target_language === 'english' &&
    row.level === 'B2' &&
    row.skill === 'listening' &&
    row.content_json?.extra?.listeningComprehension?.questions?.length === 4
);

if (listeningRows.length !== 12) {
  throw new Error(`Expected 12 English B2 Listening banks; found ${listeningRows.length}.`);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  await client.query('begin');
  try {
    for (const row of listeningRows) {
      const bank = row.content_json.extra.listeningComprehension;
      const result = await client.query(
        `update course_lessons
         set extra = jsonb_set(coalesce(extra, '{}'::jsonb), '{listeningComprehension}', $1::jsonb, true),
             updated_at = now()
         where slug = $2
         returning slug`,
        [JSON.stringify(bank), row.slug]
      );
      if (result.rowCount !== 1) throw new Error(`Lesson not found: ${row.slug}`);
    }
    await client.query('commit');
    console.log(`Synchronized ${listeningRows.length} English B2 Listening question banks.`);
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
