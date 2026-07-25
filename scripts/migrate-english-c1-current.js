#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');
const seed = require('../lib/seed-lessons.json');
const lessons = seed.filter((row) => row.target_language === 'english' && row.level === 'C1');

async function main() {
  if (lessons.length !== 6) throw new Error(`Expected the current 6 English C1 lessons; found ${lessons.length}.`);
  const client = new Client({ connectionString: process.env.SUPABASE_DATABASE_URL, ssl: { rejectUnauthorized: false } });
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
      `insert into courses(language_id,level_id,title,description) values($1,$2,'English C1','Advanced English with precise grammar, register and style.')
       on conflict(language_id,level_id) do update set title=excluded.title,description=excluded.description returning id`,
      [language.id, level.id]
    )).rows[0];
    const unit = (await client.query(
      `insert into course_units(course_id,slug,title,description,order_index)
       values($1,'english-c1-advanced-expression','Advanced Expression','Current English C1 course focus.',1)
       on conflict(slug) do update set course_id=excluded.course_id,title=excluded.title,
       description=excluded.description,order_index=excluded.order_index returning id`,
      [course.id]
    )).rows[0];

    for (const row of lessons) {
      const content = row.content_json || {};
      const id = (await client.query(
        `insert into course_lessons
         (course_id,unit_id,slug,skill,title,description,order_index,xp_reward,access_tier,
          estimated_minutes,is_published,grammar_note,phrases,extra)
         values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,$12::jsonb,$13::jsonb)
         on conflict(slug) do update set course_id=excluded.course_id,unit_id=excluded.unit_id,
         skill=excluded.skill,title=excluded.title,description=excluded.description,
         order_index=excluded.order_index,xp_reward=excluded.xp_reward,access_tier=excluded.access_tier,
         estimated_minutes=excluded.estimated_minutes,is_published=true,grammar_note=excluded.grammar_note,
         phrases=excluded.phrases,extra=excluded.extra returning id`,
        [course.id, unit.id, row.slug, row.skill, row.title, row.description || '', row.order_index,
          content.xp_reward || 20, row.access_tier || 'free', row.estimated_minutes || 15,
          content.grammar || null, JSON.stringify(content.phrases || null), JSON.stringify(content.extra || null)]
      )).rows[0].id;
      await client.query('delete from lesson_sections where lesson_id=$1', [id]);
      if (content.reading) {
        await client.query(
          `insert into lesson_sections(lesson_id,type,order_index,reading_title,reading_text,reading_questions)
           values($1,'reading',0,$2,$3,$4::jsonb)`,
          [id, content.reading.title || null, content.reading.text || '', JSON.stringify(content.reading.questions || [])]
        );
      }
      for (const [index, item] of (content.vocabulary || []).entries()) {
        await client.query(
          `insert into lesson_sections(lesson_id,type,order_index,word,translation,example)
           values($1,'vocabulary_item',$2,$3,$4,$5)`,
          [id, index, item.word, item.translation || '', item.example || '']
        );
      }
      await client.query('delete from exercises where lesson_id=$1', [id]);
      for (const [index, exercise] of (content.exercises || []).entries()) {
        const exerciseId = (await client.query(
          `insert into exercises(lesson_id,type,prompt,order_index) values($1,$2,$3,$4) returning id`,
          [id, exercise.type, exercise.prompt, index]
        )).rows[0].id;
        for (const [optionIndex, option] of (exercise.options || []).entries()) {
          await client.query(
            `insert into exercise_options(exercise_id,option_text,is_correct,order_index) values($1,$2,$3,$4)`,
            [exerciseId, option, optionIndex === Number(exercise.answer), optionIndex]
          );
        }
      }
    }
    await client.query('commit');
    console.log(`English C1 current course migrated: 1 unit, ${lessons.length} lessons.`);
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
