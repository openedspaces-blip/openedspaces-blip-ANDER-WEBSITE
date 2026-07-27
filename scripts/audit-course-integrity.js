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
    const { rows } = await client.query(`
      select
        l.code as language,
        lv.code as level,
        count(*)::int as lessons,
        count(*) filter (where cl.unit_id is null)::int as missing_unit_ids
      from course_lessons cl
      join courses c on c.id = cl.course_id
      join languages l on l.id = c.language_id
      join levels lv on lv.id = c.level_id
      group by l.code, lv.code, lv.sort_order
      order by l.code, lv.sort_order
    `);
    console.log(JSON.stringify(rows, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
