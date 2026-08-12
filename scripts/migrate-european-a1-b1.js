#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');
const seedLessons = require('../lib/seed-lessons.json');
const seedUnits = require('../lib/seed-units.json');

const LANGUAGES = { italian: 'Italiano', portuguese: 'Português', german: 'Deutsch' };
const LEVELS = ['A1', 'A2', 'B1'];
const SKILLS = ['reading', 'grammar', 'vocabulary'];

function optionText(option) {
  return typeof option === 'string' ? option : String(option?.text || option?.label || option?.value || '');
}

async function migrateCourse(client, languageCode, levelCode) {
  const units = seedUnits.filter((row) => row.target_language === languageCode && row.level === levelCode);
  const lessons = seedLessons.filter(
    (row) => row.target_language === languageCode && row.level === levelCode && SKILLS.includes(row.skill)
  );
  if (units.length !== 12 || lessons.length !== 36) {
    throw new Error(`${languageCode}/${levelCode}: expected 12 units and 36 lessons, got ${units.length}/${lessons.length}`);
  }

  const language = (await client.query(
    `insert into languages(code,name) values($1,$2)
     on conflict(code) do update set name=excluded.name returning id`,
    [languageCode, LANGUAGES[languageCode]]
  )).rows[0];
  const level = (await client.query(
    `insert into levels(code,name,sort_order) values($1,$2,$3)
     on conflict(code) do update set name=excluded.name,sort_order=excluded.sort_order returning id`,
    [levelCode, `${levelCode} - ${levelCode === 'A1' ? 'Beginner' : levelCode === 'A2' ? 'Elementary' : 'Intermediate'}`, LEVELS.indexOf(levelCode) + 1]
  )).rows[0];
  const course = (await client.query(
    `insert into courses(language_id,level_id,title,description) values($1,$2,$3,$4)
     on conflict(language_id,level_id) do update set title=excluded.title,description=excluded.description returning id`,
    [language.id, level.id, `${LANGUAGES[languageCode]} ${levelCode}`, `Ruta ${levelCode} de ${LANGUAGES[languageCode]}.`]
  )).rows[0];

  const unitIds = {};
  for (const unit of units.sort((a, b) => a.order_index - b.order_index)) {
    unitIds[unit.slug] = (await client.query(
      `insert into course_units(course_id,slug,title,description,order_index)
       values($1,$2,$3,$4,$5) on conflict(slug) do update set
       course_id=excluded.course_id,title=excluded.title,description=excluded.description,
       order_index=excluded.order_index returning id`,
      [course.id, unit.slug, unit.title, unit.description || '', unit.order_index]
    )).rows[0].id;
  }

  for (const row of lessons) {
    const content = row.content_json || {};
    const lessonId = (await client.query(
      `insert into course_lessons
       (course_id,unit_id,slug,skill,title,description,order_index,xp_reward,access_tier,
        estimated_minutes,is_published,mission,grammar_note,phrases,extra)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,$12,$13::jsonb,$14::jsonb)
       on conflict(slug) do update set course_id=excluded.course_id,unit_id=excluded.unit_id,
       skill=excluded.skill,title=excluded.title,description=excluded.description,
       order_index=excluded.order_index,xp_reward=excluded.xp_reward,access_tier=excluded.access_tier,
       estimated_minutes=excluded.estimated_minutes,is_published=true,mission=excluded.mission,
       grammar_note=excluded.grammar_note,phrases=excluded.phrases,extra=excluded.extra returning id`,
      [course.id, unitIds[row.unit_slug], row.slug, row.skill, row.title, row.description || '',
        row.order_index, content.xp_reward || 20, row.access_tier, row.estimated_minutes || 10,
        content.mission || null, content.grammar || null, JSON.stringify(content.phrases || null),
        JSON.stringify(content.extra || null)]
    )).rows[0].id;

    await client.query('delete from lesson_sections where lesson_id=$1', [lessonId]);
    if (content.reading) {
      await client.query(
        `insert into lesson_sections(lesson_id,type,order_index,reading_title,reading_text,reading_questions)
         values($1,'reading',0,$2,$3,$4::jsonb)`,
        [lessonId, content.reading.title || null, content.reading.text || '', JSON.stringify(content.reading.questions || [])]
      );
    }
    for (const [index, item] of (content.vocabulary || []).entries()) {
      await client.query(
        `insert into lesson_sections(lesson_id,type,order_index,word,translation,example,line)
         values($1,'vocabulary_item',$2,$3,$4,$5,$6)`,
        [lessonId, index, item.word, item.translation || '', item.example || '', item.definition || null]
      );
    }

    await client.query('delete from exercises where lesson_id=$1', [lessonId]);
    for (const [index, exercise] of (content.exercises || []).entries()) {
      const exerciseId = (await client.query(
        `insert into exercises(lesson_id,type,prompt,order_index) values($1,$2,$3,$4) returning id`,
        [lessonId, exercise.type || 'mcq', exercise.prompt || '', index]
      )).rows[0].id;
      for (const [optionIndex, option] of (exercise.options || []).entries()) {
        await client.query(
          `insert into exercise_options(exercise_id,option_text,is_correct,order_index) values($1,$2,$3,$4)`,
          [exerciseId, optionText(option), optionIndex === Number(exercise.answer), optionIndex]
        );
      }
    }
  }

  await client.query(
    `delete from course_lessons where course_id=$1 and skill=any($2::text[]) and not(slug=any($3::text[]))`,
    [course.id, SKILLS, lessons.map((row) => row.slug)]
  );
  return { languageCode, levelCode, courseId: course.id };
}

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL) throw new Error('SUPABASE_DATABASE_URL is not configured.');
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    application_name: 'andergo-european-migration'
  });
  await client.connect();
  try {
    // A locally killed CLI can leave its server transaction alive briefly.
    // Remove only stale transactions from this same migration, never app traffic.
    await client.query(
      `select pg_terminate_backend(pid)
       from pg_stat_activity
       where pid <> pg_backend_pid()
         and usename = current_user
         and datname = current_database()
         and now() - xact_start > interval '1 minute'
         and (application_name = 'andergo-european-migration'
           or query ilike '%insert into languages(code,name)%')`
    );
    await client.query(`set statement_timeout = 0`);
    await client.query('begin');
    const migrated = [];
    for (const language of Object.keys(LANGUAGES)) {
      for (const level of LEVELS) migrated.push(await migrateCourse(client, language, level));
    }
    await client.query('commit');
    for (const item of migrated) {
      const result = (await client.query(
        `select count(distinct unit_id)::int units,count(*)::int lessons,
         count(*) filter(where skill='reading')::int readings,
         count(distinct unit_id) filter(where skill='reading' and access_tier='free')::int free_units
         from course_lessons where course_id=$1 and skill=any($2::text[])`,
        [item.courseId, SKILLS]
      )).rows[0];
      console.log(`${item.languageCode}/${item.levelCode}`, result);
    }
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
