const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const VERSION = '202607290001';
const NAME = 'reading_saved_vocabulary';
const MIGRATION_PATH = path.join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  `${VERSION}_${NAME}.sql`
);

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error('SUPABASE_DATABASE_URL is not configured.');
  }
  const sql = fs.readFileSync(MIGRATION_PATH, 'utf8');
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    await client.query('begin');
    const existing = await client.query(
      'select 1 from supabase_migrations.schema_migrations where version = $1',
      [VERSION]
    );
    if (existing.rowCount === 0) {
      await client.query(sql);
      await client.query(
        'insert into supabase_migrations.schema_migrations (version, name, statements) values ($1, $2, $3)',
        [VERSION, NAME, [sql]]
      );
    }
    await client.query('commit');
    const verification = await client.query(
      `select
         to_regclass('public.user_saved_vocabulary') is not null as table_exists,
         c.relrowsecurity as rls_enabled,
         count(p.policyname)::int as policy_count
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       left join pg_policies p
         on p.schemaname = n.nspname and p.tablename = c.relname
       where n.nspname = 'public' and c.relname = 'user_saved_vocabulary'
       group by c.relrowsecurity`
    );
    console.log(JSON.stringify(verification.rows[0] || {}, null, 2));
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
