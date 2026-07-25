#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');
const seedLessons = require('../lib/seed-lessons.json');
const seedUnits = require('../lib/seed-units.json');

const lessons = seedLessons.filter((row) => row.target_language === 'english' && row.level === 'C1');
const units = seedUnits.filter((row) => row.target_language === 'english' && row.level === 'C1');

async function main() {
  if (units.length !== 12 || lessons.length !== 36) {
    throw new Error(`Build English C1 first; found ${units.length} units and ${lessons.length} lessons.`);
  }
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });
  await client.connect();
  try {
    await client.query('begin');
    const language = (await client.query(
      `insert into languages(code,name) values('english','English')
       on conflict(code) do update set name=excluded.name returning id`
    )).rows[0];
    const level = (await client.query(
      `insert into levels(code,name,sort_order) values('C1','C1 - Advanced',5)
       on conflict(code) do update set name=excluded.name,sort_order=excluded.sort_order returning id`
    )).rows[0];
    const course = (await client.query(
      `insert into courses(language_id,level_id,title,description) values($1,$2,$3,$4)
       on conflict(language_id,level_id) do update set
       title=excluded.title,description=excluded.description returning id`,
      [language.id, level.id, 'English C1',
        'Advanced English through scientific-social inquiry, evidence, institutions, data, ethics and public reasoning.']
    )).rows[0];

    const unitIds = {};
    for (const unit of units) {
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
          estimated_minutes,is_published,grammar_note,phrases,extra)
         values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,$12::jsonb,$13::jsonb)
         on conflict(slug) do update set course_id=excluded.course_id,unit_id=excluded.unit_id,
         skill=excluded.skill,title=excluded.title,description=excluded.description,
         order_index=excluded.order_index,xp_reward=excluded.xp_reward,
         access_tier=excluded.access_tier,estimated_minutes=excluded.estimated_minutes,
         is_published=true,grammar_note=excluded.grammar_note,phrases=excluded.phrases,
         extra=excluded.extra returning id`,
        [course.id, unitIds[row.unit_slug], row.slug, row.skill, row.title, row.description || '',
          row.order_index, content.xp_reward || 40, row.access_tier, row.estimated_minutes || 18,
          content.grammar || null, JSON.stringify(content.phrases || null),
          JSON.stringify(content.extra || null)]
      )).rows[0].id;

      await client.query('delete from lesson_sections where lesson_id=$1', [lessonId]);
      if (content.reading) {
        await client.query(
          `insert into lesson_sections
           (lesson_id,type,order_index,reading_title,reading_text,reading_questions)
           values($1,'reading',0,$2,$3,$4::jsonb)`,
          [lessonId, content.reading.title || null, content.reading.text || '',
            JSON.stringify(content.reading.questions || [])]
        );
      }
      for (const [index, item] of (content.vocabulary || []).entries()) {
        await client.query(
          `insert into lesson_sections
           (lesson_id,type,order_index,word,translation,example,line)
           values($1,'vocabulary_item',$2,$3,$4,$5,$6)`,
          [lessonId, index, item.word, item.translation || '', item.example || '',
            item.definition || null]
        );
      }

      await client.query('delete from exercises where lesson_id=$1', [lessonId]);
      for (const [index, exercise] of (content.exercises || []).entries()) {
        const exerciseId = (await client.query(
          `insert into exercises(lesson_id,type,prompt,order_index)
           values($1,$2,$3,$4) returning id`,
          [lessonId, exercise.type, exercise.prompt, index]
        )).rows[0].id;
        for (const [optionIndex, option] of (exercise.options || []).entries()) {
          await client.query(
            `insert into exercise_options(exercise_id,option_text,is_correct,order_index)
             values($1,$2,$3,$4)`,
            [exerciseId, option, optionIndex === Number(exercise.answer), optionIndex]
          );
        }
      }
    }

    await client.query(
      `delete from course_lessons where course_id=$1 and not(slug=any($2::text[]))`,
      [course.id, lessons.map((row) => row.slug)]
    );
    await client.query(
      `delete from course_units where course_id=$1 and not(slug=any($2::text[]))`,
      [course.id, units.map((row) => row.slug)]
    );
    await client.query('commit');

    const result = (await client.query(
      `select count(distinct unit_id)::int units,count(*)::int lessons,
       count(*) filter(where skill='reading')::int reading,
       count(*) filter(where skill='vocabulary')::int vocabulary,
       count(*) filter(where skill='grammar')::int grammar,
       count(*) filter(where access_tier='free')::int free,
       count(*) filter(where access_tier='premium')::int premium
       from course_lessons where course_id=$1`,
      [course.id]
    )).rows[0];
    console.log('English C1 migration complete:', result);
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
