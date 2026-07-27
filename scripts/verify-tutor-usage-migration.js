#!/usr/bin/env node
require('dotenv').config();

const { Client } = require('pg');

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error('SUPABASE_DATABASE_URL is not configured.');
  }
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const { rows } = await client.query(`
      select
        (select relrowsecurity
           from pg_class
          where oid = 'public.user_usage_counters'::regclass) as rls,
        to_regprocedure(
          'public.increment_user_usage_counter(uuid,text,text)'
        ) is not null as atomic_function,
        (select count(*)::int
           from pg_policies
          where schemaname = 'public'
            and tablename = 'user_usage_counters'
            and 'authenticated' = any(roles)) as owner_policies
    `);
    const result = rows[0];
    if (!result.rls || !result.atomic_function || result.owner_policies !== 1) {
      throw new Error(`Unexpected migration state: ${JSON.stringify(result)}`);
    }
    console.log(JSON.stringify(result));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
