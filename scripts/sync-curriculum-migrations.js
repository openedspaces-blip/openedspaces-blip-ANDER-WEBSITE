const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config();

const migrations = [
  {
    version: '202607310001',
    name: 'curriculum_mapping_layer',
    file: '202607310001_curriculum_mapping_layer.sql'
  },
  {
    version: '202607310002',
    name: 'teacher_role',
    file: '202607310002_teacher_role.sql'
  }
].map((migration) => ({
  ...migration,
  sql: fs.readFileSync(
    path.join(__dirname, '..', 'supabase', 'migrations', migration.file),
    'utf8'
  )
}));

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
    await client.query('begin');
    for (const migration of migrations) {
      await client.query(migration.sql);
      await client.query(
        `insert into supabase_migrations.schema_migrations (version, statements, name)
         values ($1, $2::text[], $3)
         on conflict (version) do update set
           statements = excluded.statements,
           name = excluded.name`,
        [migration.version, [migration.sql], migration.name]
      );
    }

    const verification = await client.query(`
      select
        (select count(*)::int
           from supabase_migrations.schema_migrations
          where version in ('202607310001', '202607310002')) as migration_count,
        exists (
          select 1
            from pg_constraint
           where conname = 'profiles_role_check'
             and pg_get_constraintdef(oid) like '%teacher%'
        ) as teacher_role_allowed,
        (
          select count(*)::int
            from pg_class c
            join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public'
             and c.relname in (
               'curriculum_frameworks',
               'curriculum_outcomes',
               'curriculum_activity_mappings'
             )
             and c.relrowsecurity
             and not has_table_privilege('anon', c.oid, 'select')
             and not has_table_privilege('authenticated', c.oid, 'select')
        ) as secured_curriculum_tables
    `);
    const row = verification.rows[0];
    if (
      row.migration_count !== 2 ||
      !row.teacher_role_allowed ||
      row.secured_curriculum_tables !== 3
    ) {
      throw new Error('Migration history or security verification failed.');
    }

    if (checkOnly) await client.query('rollback');
    else await client.query('commit');

    console.log(
      JSON.stringify({
        status: checkOnly ? 'validated_rollback' : 'applied_and_synchronized',
        ...row
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
