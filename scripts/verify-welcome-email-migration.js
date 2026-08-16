#!/usr/bin/env node
require('dotenv').config();

const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const result = await client.query(`
      select
        to_regclass('public.welcome_email_deliveries') as table_name,
        has_function_privilege(
          'service_role',
          'public.claim_welcome_email_delivery(uuid, integer)',
          'execute'
        ) as service_role_can_claim
    `);
    console.log(JSON.stringify(result.rows[0]));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
