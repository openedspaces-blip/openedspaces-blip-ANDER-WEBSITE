#!/usr/bin/env node
// Idempotently publishes the 12-unit French C1 course to the normalized
// Supabase schema through one PostgreSQL transaction.
require('dotenv').config();
const { Client } = require('pg');
const seedLessons = require('../lib/seed-lessons.json');
const seedUnits = require('../lib/seed-units.json');
const { validateLevel } = require('./validate-french-content');
const frenchC1 = require('./content/french-c1-units');

const LANGUAGE = 'french';
const LEVEL = 'C1';
const UNIT_COUNT = 12;
const ACTIVITIES_PER_UNIT = 3;

async function insertSections(client, lessonId, content) {
  await client.query('delete from public.lesson_sections where lesson_id=$1', [lessonId]);
  const sections = [];
  if (content.intro) sections.push(['intro', 0, null, null, null, null, content.intro, null, null, null, null, null]);
  (content.vocabulary || []).forEach((item, index) =>
    sections.push(['vocabulary_item', index, item.word, item.translation, item.example, null, null, null, null, null, null, null])
  );
  if (content.reading) {
    sections.push([
      'reading', 0, null, null, null, null, null,
      content.reading.title || null, content.reading.text || '',
      content.reading.questions || [], content.reading.parts || null,
      content.reading.ordering || null
    ]);
  }
  for (const section of sections) {
    await client.query(
      `insert into public.lesson_sections
       (lesson_id,type,order_index,word,translation,example,speaker,line,
        reading_title,reading_text,reading_questions,reading_parts,reading_ordering)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb)`,
      [
        lessonId, section[0], section[1], section[2], section[3], section[4],
        section[5], section[6], section[7], section[8],
        JSON.stringify(section[9]), JSON.stringify(section[10]), JSON.stringify(section[11])
      ]
    );
  }
}

async function insertExercises(client, lessonId, exercises) {
  await client.query('delete from public.exercises where lesson_id=$1', [lessonId]);
  for (const [index, exercise] of exercises.entries()) {
    const row = (
      await client.query(
        `insert into public.exercises (lesson_id,type,prompt,order_index)
         values ($1,$2,$3,$4) returning id`,
        [lessonId, exercise.type, exercise.prompt, index]
      )
    ).rows[0];
    if (exercise.type === 'mcq' && Array.isArray(exercise.options)) {
      for (const [optionIndex, optionText] of exercise.options.entries()) {
        await client.query(
          `insert into public.exercise_options
           (exercise_id,option_text,is_correct,order_index) values ($1,$2,$3,$4)`,
          [row.id, optionText, optionIndex === Number(exercise.answer), optionIndex]
        );
      }
    }
  }
}

async function main() {
  const errors = validateLevel(frenchC1, {
    minUnits: UNIT_COUNT,
    maxUnits: UNIT_COUNT,
    readingRange: [400, 650],
    label: 'C1',
    skills: ['reading', 'vocabulary', 'grammar']
  });
  if (errors.length) throw new Error(`French C1 invalide:\n${errors.join('\n')}`);
  if (!process.env.SUPABASE_DATABASE_URL) throw new Error('SUPABASE_DATABASE_URL no está configurada.');

  const units = seedUnits
    .filter((row) => row.target_language === LANGUAGE && row.level === LEVEL)
    .sort((a, b) => a.order_index - b.order_index);
  const lessons = seedLessons
    .filter((row) => row.target_language === LANGUAGE && row.level === LEVEL)
    .sort((a, b) => a.order_index - b.order_index);
  if (units.length !== UNIT_COUNT || lessons.length !== UNIT_COUNT * ACTIVITIES_PER_UNIT) {
    throw new Error(`Seed C1 incompleto: ${units.length} unidades, ${lessons.length} actividades.`);
  }

  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });
  await client.connect();
  try {
    await client.query('begin');
    console.log(`Migrando French C1: ${units.length} unidades, ${lessons.length} actividades...`);
    const language = (
      await client.query(
        `insert into public.languages(code,name) values($1,$2)
         on conflict(code) do update set name=excluded.name returning id`,
        [LANGUAGE, 'Français']
      )
    ).rows[0];
    const level = (
      await client.query(
        `insert into public.levels(code,name,sort_order) values($1,$2,$3)
         on conflict(code) do update set name=excluded.name,sort_order=excluded.sort_order returning id`,
        [LEVEL, 'C1 - Avancé', 5]
      )
    ).rows[0];
    const course = (
      await client.query(
        `insert into public.courses(language_id,level_id,title,description)
         values($1,$2,$3,$4)
         on conflict(language_id,level_id) do update
         set title=excluded.title,description=excluded.description returning id`,
        [language.id, level.id, frenchC1.courseTitle, frenchC1.courseDescription]
      )
    ).rows[0];

    const unitIds = {};
    for (const unit of units) {
      unitIds[unit.slug] = (
        await client.query(
          `insert into public.course_units(course_id,slug,title,description,order_index)
           values($1,$2,$3,$4,$5)
           on conflict(slug) do update set course_id=excluded.course_id,title=excluded.title,
             description=excluded.description,order_index=excluded.order_index returning id`,
          [course.id, unit.slug, unit.title, unit.description || '', unit.order_index]
        )
      ).rows[0].id;
    }

    const slugs = [];
    for (const lesson of lessons) {
      const content = lesson.content_json || {};
      slugs.push(lesson.slug);
      const row = (
        await client.query(
          `insert into public.course_lessons
           (course_id,unit_id,slug,skill,title,description,order_index,xp_reward,
            access_tier,estimated_minutes,audio_url,is_published,mission,grammar_note,phrases,extra)
           values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,$12,$13,$14::jsonb,$15::jsonb)
           on conflict(slug) do update set course_id=excluded.course_id,unit_id=excluded.unit_id,
             skill=excluded.skill,title=excluded.title,description=excluded.description,
             order_index=excluded.order_index,xp_reward=excluded.xp_reward,
             access_tier=excluded.access_tier,estimated_minutes=excluded.estimated_minutes,
             is_published=true,mission=excluded.mission,grammar_note=excluded.grammar_note,
             phrases=excluded.phrases,extra=excluded.extra returning id`,
          [
            course.id, unitIds[lesson.unit_slug], lesson.slug, lesson.skill, lesson.title,
            lesson.description || '', lesson.order_index, content.xp_reward || 20,
            lesson.access_tier || 'free', lesson.estimated_minutes || 10, lesson.audio_url || null,
            content.mission || null, content.grammar || null,
            JSON.stringify(content.phrases?.length ? content.phrases : null),
            JSON.stringify(content.extra || null)
          ]
        )
      ).rows[0];
      await insertSections(client, row.id, content);
      await insertExercises(client, row.id, content.exercises || []);
    }

    await client.query(
      `delete from public.course_lessons where course_id=$1 and not(slug=any($2::text[]))`,
      [course.id, slugs]
    );
    await client.query('commit');
    const result = (
      await client.query(
        `select count(distinct cu.id)::int units,count(cl.id)::int lessons,
          count(cl.id) filter(where cl.skill='reading')::int reading,
          count(cl.id) filter(where cl.skill='vocabulary')::int vocabulary,
          count(cl.id) filter(where cl.skill='grammar')::int grammar
         from public.course_units cu join public.course_lessons cl on cl.unit_id=cu.id
         where cu.course_id=$1`,
        [course.id]
      )
    ).rows[0];
    console.log('French C1 verificado:', result);
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
