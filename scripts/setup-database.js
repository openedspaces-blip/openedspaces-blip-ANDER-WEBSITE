#!/usr/bin/env node
// scripts/setup-database.js
// Runs the SQL schema/migrations against the database at SUPABASE_DATABASE_URL.
// Usage: npm run db:setup
//
// Order of execution:
//   1. SUPABASE_RUN_THIS.sql (repo root)   - base schema (lessons, profiles, billing, etc.)
//   2. supabase/migrations/*.sql, sorted   - incremental migrations (e.g. gamification columns)
//
// This is intentionally simple: each file is sent to Postgres as one batch via
// the simple query protocol, which correctly handles multi-statement SQL and
// dollar-quoted function bodies (unlike naively splitting on semicolons).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const ROOT = path.join(__dirname, '..');
const SEED_LESSONS_PATH = path.join(ROOT, 'lib', 'seed-lessons.json');

function collectSqlFiles() {
  const files = [];

  const rootSchema = path.join(ROOT, 'SUPABASE_RUN_THIS.sql');
  if (fs.existsSync(rootSchema)) files.push(rootSchema);

  const migrationsDir = path.join(ROOT, 'supabase', 'migrations');
  if (fs.existsSync(migrationsDir)) {
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((name) => name.endsWith('.sql'))
      .sort()
      .map((name) => path.join(migrationsDir, name));
    files.push(...migrationFiles);
  }

  return files;
}

async function main() {
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  if (!connectionString) {
    console.error('SUPABASE_DATABASE_URL is not set. Add it to your .env file (see .env.example) and try again.');
    process.exit(1);
  }

  const files = collectSqlFiles();
  if (!files.length) {
    console.error('No SQL files found (expected SUPABASE_RUN_THIS.sql and/or supabase/migrations/*.sql).');
    process.exit(1);
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log(`Connected. Running ${files.length} SQL file(s)...`);

  try {
    for (const file of files) {
      const label = path.relative(ROOT, file);
      process.stdout.write(`  -> ${label} ... `);
      const sql = fs.readFileSync(file, 'utf8');
      await client.query(sql);
      console.log('done');
    }
    await seedLessons(client);
    console.log('Database setup complete.');
  } catch (error) {
    console.error('\nSQL execution failed:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

async function seedLessons(client) {
  if (!fs.existsSync(SEED_LESSONS_PATH)) return;

  const lessons = JSON.parse(fs.readFileSync(SEED_LESSONS_PATH, 'utf8'));
  if (!Array.isArray(lessons) || lessons.length === 0) return;

  process.stdout.write(`  -> ${path.relative(ROOT, SEED_LESSONS_PATH)} (${lessons.length} lessons) ... `);
  const sql = `
    insert into public.lessons (
      slug,
      target_language,
      level,
      skill,
      title,
      description,
      order_index,
      is_free,
      is_published,
      estimated_minutes,
      xp_reward,
      content_json,
      access_tier
    )
    values (
      $1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10, $11::jsonb, $12
    )
    on conflict (slug) do update set
      target_language = excluded.target_language,
      level = excluded.level,
      skill = excluded.skill,
      title = excluded.title,
      description = excluded.description,
      order_index = excluded.order_index,
      is_free = excluded.is_free,
      is_published = excluded.is_published,
      estimated_minutes = excluded.estimated_minutes,
      xp_reward = excluded.xp_reward,
      content_json = excluded.content_json,
      access_tier = excluded.access_tier,
      updated_at = now()
  `;

  for (const lesson of lessons) {
    await client.query(sql, [
      lesson.slug,
      lesson.target_language || 'english',
      lesson.level,
      lesson.skill,
      lesson.title,
      lesson.description || null,
      lesson.order_index || 0,
      lesson.is_free !== false,
      lesson.estimated_minutes || 10,
      lesson.content_json?.xp_reward || 20,
      JSON.stringify(lesson.content_json || {}),
      lesson.access_tier || (lesson.is_free === false ? 'premium' : 'free')
    ]);
  }
  console.log('done');
}

main().catch((error) => {
  console.error('Unexpected error while setting up the database:', error);
  process.exit(1);
});
