#!/usr/bin/env node
// Publishes the complete 12-unit French C2 course to the normalized
// Supabase schema in one transaction. Run only after build-french-c2-seed.
require('dotenv').config();
const { Client } = require('pg');
const seedLessons = require('../lib/seed-lessons.json');
const seedUnits = require('../lib/seed-units.json');
const { validateLevel } = require('./validate-french-content');
const frenchC2 = require('./content/french-c2-units');

const LANGUAGE = 'french';
const LEVEL = 'C2';
const UNIT_COUNT = 12;
const SKILLS = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];
const DRY_RUN = process.argv.includes('--dry-run');

function assertQueryContract(sql, values = []) {
  const placeholderNumbers = [...sql.matchAll(/\$(\d+)/g)].map((match) => Number(match[1]));
  const expectedCount = placeholderNumbers.length ? Math.max(...placeholderNumbers) : 0;
  if (values.length !== expectedCount) {
    throw new Error(
      `Contrato SQL inválido: la consulta requiere ${expectedCount} parámetros, pero recibió ${values.length}.`
    );
  }
}

function createDryRunClient() {
  return {
    async connect() {},
    async end() {},
    async query(sql, values = []) {
      assertQueryContract(sql, values);
      if (/select count\(distinct cu\.id\)/i.test(sql)) {
        return {
          rows: [{
            units: UNIT_COUNT,
            lessons: UNIT_COUNT * SKILLS.length,
            reading: UNIT_COUNT,
            vocabulary: UNIT_COUNT,
            grammar: UNIT_COUNT
          }]
        };
      }
      if (/\breturning id\b/i.test(sql)) return { rows: [{ id: 'dry-run-id' }] };
      return { rows: [] };
    }
  };
}

async function replaceSections(client, lessonId, content) {
  await client.query('delete from public.lesson_sections where lesson_id=$1', [lessonId]);
  const sections = [];
  (content.vocabulary || []).forEach((item, index) => {
    sections.push([
      'vocabulary_item',
      index,
      item.word,
      item.translation,
      item.example,
      item.definition || null,
      null,
      null,
      null
    ]);
  });
  if (content.reading) {
    sections.push([
      'reading',
      0,
      null,
      null,
      null,
      null,
      content.reading.title || null,
      content.reading.text || '',
      content.reading.questions || []
    ]);
  }
  for (const section of sections) {
    await client.query(
      `insert into public.lesson_sections
       (lesson_id,type,order_index,word,translation,example,line,
        reading_title,reading_text,reading_questions)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)`,
      [
        lessonId,
        section[0],
        section[1],
        section[2],
        section[3],
        section[4],
        section[5],
        section[6],
        section[7],
        JSON.stringify(section[8])
      ]
    );
  }
}

async function replaceExercises(client, lessonId, exercises) {
  await client.query('delete from public.exercises where lesson_id=$1', [lessonId]);
  for (const [index, exercise] of exercises.entries()) {
    const row = (
      await client.query(
        `insert into public.exercises (lesson_id,type,prompt,order_index)
         values($1,$2,$3,$4) returning id`,
        [lessonId, exercise.type, exercise.prompt, index]
      )
    ).rows[0];
    for (const [optionIndex, optionText] of (exercise.options || []).entries()) {
      await client.query(
        `insert into public.exercise_options
         (exercise_id,option_text,is_correct,order_index) values($1,$2,$3,$4)`,
        [row.id, optionText, optionIndex === Number(exercise.answer), optionIndex]
      );
    }
  }
}

async function main() {
  const errors = validateLevel(frenchC2, {
    minUnits: UNIT_COUNT,
    maxUnits: UNIT_COUNT,
    readingRange: [650, 950],
    label: LEVEL,
    skills: SKILLS
  });
  if (errors.length) throw new Error(`Français C2 invalide :\n${errors.join('\n')}`);
  if (!DRY_RUN && !process.env.SUPABASE_DATABASE_URL) {
    throw new Error('SUPABASE_DATABASE_URL no está configurada.');
  }

  const units = seedUnits
    .filter((row) => row.target_language === LANGUAGE && row.level === LEVEL)
    .sort((a, b) => a.order_index - b.order_index);
  const lessons = seedLessons
    .filter((row) => row.target_language === LANGUAGE && row.level === LEVEL)
    .sort((a, b) => a.order_index - b.order_index);
  if (units.length !== UNIT_COUNT || lessons.length !== UNIT_COUNT * SKILLS.length) {
    throw new Error(`Seed C2 incompleto: ${units.length} unidades, ${lessons.length} actividades.`);
  }

  const client = DRY_RUN
    ? createDryRunClient()
    : new Client({
        connectionString: process.env.SUPABASE_DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 30000
      });
  await client.connect();
  try {
    await client.query('begin');
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
        [LEVEL, 'C2 - Maîtrise', 6]
      )
    ).rows[0];
    const course = (
      await client.query(
        `insert into public.courses(language_id,level_id,title,description)
         values($1,$2,$3,$4)
         on conflict(language_id,level_id) do update
         set title=excluded.title,description=excluded.description returning id`,
        [language.id, level.id, frenchC2.courseTitle, frenchC2.courseDescription]
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

    const activeSlugs = [];
    for (const lesson of lessons) {
      const content = lesson.content_json || {};
      activeSlugs.push(lesson.slug);
      const row = (
        await client.query(
          `insert into public.course_lessons
           (course_id,unit_id,slug,skill,title,description,order_index,xp_reward,
            access_tier,estimated_minutes,is_published,mission,grammar_note,phrases,extra)
           values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,$12,$13::jsonb,$14::jsonb)
           on conflict(slug) do update set course_id=excluded.course_id,unit_id=excluded.unit_id,
             skill=excluded.skill,title=excluded.title,description=excluded.description,
             order_index=excluded.order_index,xp_reward=excluded.xp_reward,
             access_tier=excluded.access_tier,estimated_minutes=excluded.estimated_minutes,
             is_published=true,mission=excluded.mission,grammar_note=excluded.grammar_note,
             phrases=excluded.phrases,extra=excluded.extra returning id`,
          [
            course.id,
            unitIds[lesson.unit_slug],
            lesson.slug,
            lesson.skill,
            lesson.title,
            lesson.description || '',
            lesson.order_index,
            content.xp_reward || 20,
            lesson.access_tier || 'free',
            lesson.estimated_minutes || 10,
            content.mission || null,
            content.grammar || null,
            JSON.stringify(content.phrases?.length ? content.phrases : null),
            JSON.stringify(content.extra || null)
          ]
        )
      ).rows[0];
      await replaceSections(client, row.id, content);
      await replaceExercises(client, row.id, content.exercises || []);
    }

    await client.query(
      `delete from public.course_lessons where course_id=$1 and not(slug=any($2::text[]))`,
      [course.id, activeSlugs]
    );
    await client.query(
      `delete from public.course_units where course_id=$1 and not(slug=any($2::text[]))`,
      [course.id, units.map((unit) => unit.slug)]
    );
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
    const expected = {
      units: UNIT_COUNT,
      lessons: UNIT_COUNT * SKILLS.length,
      reading: UNIT_COUNT,
      vocabulary: UNIT_COUNT,
      grammar: UNIT_COUNT
    };
    for (const [field, expectedValue] of Object.entries(expected)) {
      if (Number(result[field]) !== expectedValue) {
        throw new Error(
          `Verificación C2 fallida: ${field}=${result[field]}, esperado=${expectedValue}.`
        );
      }
    }
    await client.query('commit');
    console.log(DRY_RUN ? 'Dry run Français C2 vérifié :' : 'Français C2 vérifié :', result);
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
