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
    const [buckets, objects, registrations] = await Promise.all([
      client.query('select id, name, public from storage.buckets order by name'),
      client.query(
        `select bucket_id, name, coalesce((metadata ->> 'size')::bigint, 0) as bytes
           from storage.objects
          where lower(name) like 'spanish/%'
          order by bucket_id, name`
      ),
      client.query(
        `select language, level, lesson_slug, main_file_path, status, course_lesson_id
           from public.lesson_audio
          where language = 'spanish'
          order by level, lesson_slug`
      )
    ]);
    console.log(JSON.stringify({
      buckets: buckets.rows,
      spanishObjects: objects.rows,
      registrations: registrations.rows
    }, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
