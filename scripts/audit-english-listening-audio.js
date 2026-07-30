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
    const result = await client.query(
      `select name, metadata ->> 'size' as bytes, created_at
         from storage.objects
        where bucket_id = 'lesson-audio'
          and lower(name) like 'english/%'
        order by created_at desc`
    );
    console.log(JSON.stringify(result.rows, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
