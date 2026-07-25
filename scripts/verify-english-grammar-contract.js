#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const result = await client.query(`
      select lv.code as level,
             count(distinct cu.id)::int as units,
             count(*) filter (where cl.skill='grammar')::int as grammar,
             count(*) filter (where cl.skill='grammar' and cl.extra ? 'grammarTest')::int as tests,
             count(*) filter (where cl.skill='grammar' and cl.extra ? 'grammarProfile')::int as profiles,
             min(jsonb_array_length(cl.extra->'grammarTest'->'questions'))
               filter (where cl.skill='grammar')::int as min_questions,
             max(jsonb_array_length(cl.extra->'grammarTest'->'questions'))
               filter (where cl.skill='grammar')::int as max_questions
        from course_lessons cl
        join courses co on co.id=cl.course_id
        join languages la on la.id=co.language_id
        join levels lv on lv.id=co.level_id
        left join course_units cu on cu.id=cl.unit_id
       where la.code='english'
         and lv.code=any(array['A1','A2','B1','B2','C1','C2'])
       group by lv.code
       order by lv.code
    `);
    console.log(JSON.stringify(result.rows, null, 2));
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
