#!/usr/bin/env node
// Production-readiness audit for the learner route. It never writes data:
// it verifies that every published course matches the authored curriculum
// and exposes the six core skills in each unit.
require('dotenv').config();
const { Client } = require('pg');
const seedUnits = require('../lib/seed-units.json');

const LANGUAGES = ['english', 'french', 'spanish'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const CORE_SKILLS = ['reading', 'listening', 'speaking', 'grammar', 'vocabulary', 'writing'];
const EXPECTED_UNITS = new Map();
for (const unit of seedUnits) {
  if (!LANGUAGES.includes(unit.target_language) || !LEVELS.includes(unit.level)) continue;
  const key = `${unit.target_language}:${unit.level}`;
  EXPECTED_UNITS.set(key, (EXPECTED_UNITS.get(key) || 0) + 1);
}

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error('SUPABASE_DATABASE_URL is not configured.');
  }
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });
  await client.connect();
  try {
    const { rows } = await client.query(`
      select
        language.code as language,
        level.code as level,
        count(distinct unit.id)::int as units,
        coalesce(array_agg(distinct lesson.skill order by lesson.skill), '{}') as skills,
        count(*)::int as lessons
      from languages language
      cross join levels level
      left join courses course on course.language_id = language.id and course.level_id = level.id
      left join course_units unit on unit.course_id = course.id
      left join course_lessons lesson on lesson.unit_id = unit.id and lesson.is_published = true
      where language.code = any($1::text[]) and level.code = any($2::text[])
      group by language.code, level.code, level.sort_order
      order by language.code, level.sort_order
    `, [LANGUAGES, LEVELS]);

    const { rows: unitRows } = await client.query(`
      select
        language.code as language,
        level.code as level,
        unit.slug as unit_slug,
        coalesce(array_agg(distinct lesson.skill order by lesson.skill), '{}') as skills
      from languages language
      join courses course on course.language_id = language.id
      join levels level on level.id = course.level_id
      join course_units unit on unit.course_id = course.id
      left join course_lessons lesson on lesson.unit_id = unit.id and lesson.is_published = true
      where language.code = any($1::text[]) and level.code = any($2::text[])
      group by language.code, level.code, level.sort_order, unit.slug
      order by language.code, level.sort_order, unit.slug
    `, [LANGUAGES, LEVELS]);
    const incompleteUnitsByCourse = new Map();
    for (const unit of unitRows) {
      const missingSkills = CORE_SKILLS.filter((skill) => !(unit.skills || []).includes(skill));
      if (!missingSkills.length) continue;
      const key = `${unit.language}:${unit.level}`;
      const list = incompleteUnitsByCourse.get(key) || [];
      list.push({ slug: unit.unit_slug, missingSkills });
      incompleteUnitsByCourse.set(key, list);
    }

    const gaps = rows.map((row) => {
      const skills = row.skills || [];
      const missingSkills = CORE_SKILLS.filter((skill) => !skills.includes(skill));
      const expectedUnits = EXPECTED_UNITS.get(`${row.language}:${row.level}`) || 0;
      return {
        ...row,
        expectedUnits,
        expectedLessons: expectedUnits * CORE_SKILLS.length,
        missingUnits: Math.max(0, expectedUnits - row.units),
        missingSkills,
        incompleteUnits: incompleteUnitsByCourse.get(`${row.language}:${row.level}`) || []
      };
    });
    console.log(JSON.stringify(gaps, null, 2));
    if (gaps.some((row) => row.missingUnits || row.missingSkills.length || row.incompleteUnits.length)) {
      process.exitCode = 1;
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
