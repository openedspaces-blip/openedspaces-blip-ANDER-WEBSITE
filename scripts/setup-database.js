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
    console.log('Database setup complete.');
  } catch (error) {
    console.error('\nSQL execution failed:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Unexpected error while setting up the database:', error);
  process.exit(1);
});
