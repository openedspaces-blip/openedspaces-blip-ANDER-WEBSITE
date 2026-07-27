#!/usr/bin/env node
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const migrationsRoot = path.resolve(__dirname, '..', 'supabase', 'migrations');
const requestedPath = process.argv[2];

if (!requestedPath) {
  throw new Error('Usage: node scripts/apply-sql-migration.js <migration.sql>');
}

const migrationPath = path.resolve(migrationsRoot, requestedPath);
if (
  path.dirname(migrationPath) !== migrationsRoot ||
  path.extname(migrationPath).toLowerCase() !== '.sql'
) {
  throw new Error('Only .sql files directly inside supabase/migrations are allowed.');
}
if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error('SUPABASE_DATABASE_URL is not configured.');
}

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    await client.query('begin');
    await client.query(fs.readFileSync(migrationPath, 'utf8'));
    await client.query('commit');
    console.log(`Applied ${path.basename(migrationPath)}.`);
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
