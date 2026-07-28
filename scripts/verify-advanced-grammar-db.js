#!/usr/bin/env node
require('dotenv').config();

const { Client } = require('pg');

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error('SUPABASE_DATABASE_URL is required.');
  }
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const result = await client.query(`
      select
        languages.code as language,
        levels.code as level,
        count(*)::int as lessons,
        min(jsonb_array_length(coalesce(course_lessons.extra->'grammarTest'->'questions', '[]'::jsonb)))::int
          as min_questions,
        max(jsonb_array_length(coalesce(course_lessons.extra->'grammarTest'->'questions', '[]'::jsonb)))::int
          as max_questions
      from course_lessons
      join courses on courses.id = course_lessons.course_id
      join languages on languages.id = courses.language_id
      join levels on levels.id = courses.level_id
      where languages.code in ('french', 'spanish')
        and course_lessons.skill = 'grammar'
        and levels.code in ('C1', 'C2')
      group by languages.code, levels.code
      order by languages.code, levels.code
    `);
    const invalid = result.rows.filter(
      (row) => row.lessons !== 12 || row.min_questions !== 20 || row.max_questions !== 20
    );
    console.log(JSON.stringify(result.rows, null, 2));
    if (result.rows.length !== 4 || invalid.length) {
      throw new Error('Advanced grammar verification failed.');
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
