const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config();

const migrationPath = path.join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '202607310001_curriculum_mapping_layer.sql'
);

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error('SUPABASE_DATABASE_URL is not configured.');
  }

  const checkOnly = process.argv.includes('--check');
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    const preflight = await client.query(`
      select
        to_regclass('public.course_units') is not null as units,
        to_regclass('public.course_lessons') is not null as lessons,
        to_regclass('public.curriculum_frameworks') is not null as curriculum
    `);
    if (!preflight.rows[0].units || !preflight.rows[0].lessons) {
      throw new Error('The normalized course schema is missing.');
    }

    await client.query('begin');
    await client.query(fs.readFileSync(migrationPath, 'utf8'));

    const verification = await client.query(`
      select
        c.relname as table_name,
        c.relrowsecurity as rls_enabled,
        has_table_privilege('anon', c.oid, 'select') as anon_can_select,
        has_table_privilege('authenticated', c.oid, 'select') as authenticated_can_select
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in (
          'curriculum_frameworks',
          'curriculum_outcomes',
          'curriculum_activity_mappings'
        )
      order by c.relname
    `);

    if (
      verification.rowCount !== 3 ||
      verification.rows.some(
        (row) => !row.rls_enabled || row.anon_can_select || row.authenticated_can_select
      )
    ) {
      throw new Error('Curriculum table security verification failed.');
    }

    if (checkOnly) await client.query('rollback');
    else await client.query('commit');

    console.log(
      JSON.stringify({
        status: checkOnly ? 'validated_rollback' : 'applied',
        tables: verification.rows
      })
    );
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
