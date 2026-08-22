#!/usr/bin/env node
require('dotenv').config();

const { Client } = require('pg');
const seedLessons = require('../lib/seed-lessons.json');

const languageFilter = new Set(
  (process.argv.find((arg) => arg.startsWith('--languages=')) || '')
    .replace('--languages=', '')
    .split(',')
    .filter(Boolean)
);
const levelFilter = new Set(
  (process.argv.find((arg) => arg.startsWith('--levels=')) || '')
    .replace('--levels=', '')
    .split(',')
    .filter(Boolean)
);

const selected = seedLessons
  .filter(
    (row) =>
      row.skill === 'listening' &&
      row.unit_slug &&
      (!languageFilter.size || languageFilter.has(row.target_language)) &&
      (!levelFilter.size || levelFilter.has(row.level))
  )
  .map((row) => ({
    slug: row.slug,
    bank: row.content_json?.extra?.listeningComprehension,
    exercises: row.content_json?.exercises || []
  }));

function validate() {
  const expectedCount = languageFilter.size || levelFilter.size ? null : 212;
  if (expectedCount && selected.length !== expectedCount) {
    throw new Error(`Se esperaban 212 listenings de ruta; se encontraron ${selected.length}.`);
  }
  if (!selected.length) throw new Error('No hay listenings que coincidan con el filtro solicitado.');
  for (const row of selected) {
    if (row.bank?.questions?.length !== 4) {
      throw new Error(`${row.slug}: debe contener exactamente cuatro preguntas.`);
    }
    if (
      row.bank.questions.some((question) =>
        /official audio|which information is stated|audio officiel|audio oficial|which detail opens the story|what happens next in the story/i.test(
          String(question.prompt || '')
        )
      )
    ) {
      throw new Error(`${row.slug}: todavía contiene una pregunta genérica.`);
    }
  }
}

async function main() {
  validate();
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });
  await client.connect();
  try {
    await client.query('begin');

    const { rows: existingRows } = await client.query(
      `select slug from public.course_lessons where slug = any($1::text[])`,
      [selected.map((row) => row.slug)]
    );
    if (existingRows.length !== selected.length) {
      throw new Error(
        `Supabase contiene ${existingRows.length} de los ${selected.length} listenings de ruta esperados.`
      );
    }

    await client.query(
      `update public.course_lessons cl
       set extra = coalesce(cl.extra, '{}'::jsonb) ||
         jsonb_build_object('listeningComprehension', payload.bank)
       from jsonb_to_recordset($1::jsonb) as payload(slug text, bank jsonb)
       where cl.slug = payload.slug`,
      [
        JSON.stringify(
          selected.map((row) => ({
            slug: row.slug,
            bank: row.bank
          }))
        )
      ]
    );

    await client.query(
      `delete from public.exercises
       where lesson_id in (
         select id from public.course_lessons where slug = any($1::text[])
       )`,
      [selected.map((row) => row.slug)]
    );

    const exercises = selected.flatMap((row) =>
      row.exercises.map((exercise, orderIndex) => ({
        slug: row.slug,
        type: exercise.type,
        prompt: exercise.prompt,
        orderIndex,
        options: (exercise.options || []).map((text, optionIndex) => ({
          text,
          optionIndex,
          isCorrect: optionIndex === Number(exercise.answer)
        }))
      }))
    );
    await client.query(
      `insert into public.exercises (lesson_id, type, prompt, order_index)
       select cl.id, payload.type, payload.prompt, payload.order_index
       from jsonb_to_recordset($1::jsonb)
         as payload(slug text, type text, prompt text, order_index int)
       join public.course_lessons cl on cl.slug = payload.slug`,
      [
        JSON.stringify(
          exercises.map((exercise) => ({
            slug: exercise.slug,
            type: exercise.type,
            prompt: exercise.prompt,
            order_index: exercise.orderIndex
          }))
        )
      ]
    );

    const options = exercises.flatMap((exercise) =>
      exercise.options.map((option) => ({
        slug: exercise.slug,
        exercise_order: exercise.orderIndex,
        option_text: option.text,
        is_correct: option.isCorrect,
        option_index: option.optionIndex
      }))
    );
    await client.query(
      `insert into public.exercise_options
         (exercise_id, option_text, is_correct, order_index)
       select e.id, payload.option_text, payload.is_correct, payload.option_index
       from jsonb_to_recordset($1::jsonb) as payload(
         slug text,
         exercise_order int,
         option_text text,
         is_correct boolean,
         option_index int
       )
       join public.course_lessons cl on cl.slug = payload.slug
       join public.exercises e
         on e.lesson_id = cl.id and e.order_index = payload.exercise_order`,
      [JSON.stringify(options)]
    );

    await client.query('commit');
    console.log(
      `Sincronizados ${selected.length} listenings, ${exercises.length} preguntas y ${options.length} opciones.`
    );
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
