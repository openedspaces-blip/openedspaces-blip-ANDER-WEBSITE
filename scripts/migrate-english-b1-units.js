#!/usr/bin/env node
// scripts/migrate-english-b1-units.js
// Pushes English B1 unit-based content into Supabase. Mirrors
// migrate-english-a2-units.js, with B1 course metadata.
require('dotenv').config();
const { Client } = require('pg');
const seedLessons = require('../lib/seed-lessons.json');
const seedUnits = require('../lib/seed-units.json');
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const config = require('../lib/config');

const LANGUAGE = 'english';
const LEVEL = 'B1';
const ACTIVITIES_PER_UNIT = 6;

function selectedContent() {
  const units = seedUnits
    .filter((row) => row.target_language === LANGUAGE && row.level === LEVEL)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  const lessons = seedLessons
    .filter((row) => row.target_language === LANGUAGE && row.level === LEVEL)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  if (!units.length) throw new Error('No hay unidades de English B1 en el seed.');
  if (lessons.length !== units.length * ACTIVITIES_PER_UNIT) {
    throw new Error(`Esperaba ${units.length * ACTIVITIES_PER_UNIT} actividades; encontre ${lessons.length}.`);
  }
  return { units, lessons };
}

async function mainViaPostgres() {
  const { units, lessons } = selectedContent();
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });
  await client.connect();
  try {
    await client.query('begin');
    console.log(`Migrando ${units.length} unidades y ${lessons.length} actividades por PostgreSQL...`);

    const language = (
      await client.query(
        `insert into public.languages (code, name) values ($1, $2)
         on conflict (code) do update set name = excluded.name returning id`,
        [LANGUAGE, 'English']
      )
    ).rows[0];
    const level = (
      await client.query(
        `insert into public.levels (code, name, sort_order) values ($1, $2, $3)
         on conflict (code) do update set name = excluded.name, sort_order = excluded.sort_order returning id`,
        [LEVEL, 'B1 - Intermediate', 3]
      )
    ).rows[0];
    const course = (
      await client.query(
        `insert into public.courses (language_id, level_id, title, description)
         values ($1, $2, $3, $4)
         on conflict (language_id, level_id) do update
         set title = excluded.title, description = excluded.description
         returning id`,
        [
          language.id,
          level.id,
          'English B1',
          'Intermediate English (B1): work, community, travel, health, money, digital life, culture, relationships and future goals through thematic units.'
        ]
      )
    ).rows[0];

    const unitIdBySlug = {};
    for (const unit of units) {
      const row = (
        await client.query(
          `insert into public.course_units (course_id, slug, title, description, order_index)
           values ($1, $2, $3, $4, $5)
           on conflict (slug) do update set
             course_id = excluded.course_id, title = excluded.title,
             description = excluded.description, order_index = excluded.order_index
           returning id`,
          [course.id, unit.slug, unit.title, unit.description || '', unit.order_index || 0]
        )
      ).rows[0];
      unitIdBySlug[unit.slug] = row.id;
    }

    const newSlugs = [];
    for (const row of lessons) {
      const content = row.content_json || {};
      const unitId = unitIdBySlug[row.unit_slug];
      newSlugs.push(row.slug);
      const lesson = (
        await client.query(
          `insert into public.course_lessons
           (course_id, unit_id, slug, skill, title, description, order_index,
            xp_reward, access_tier, estimated_minutes, audio_url, is_published,
            mission, grammar_note, phrases, extra)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,$12,$13,$14::jsonb,$15::jsonb)
           on conflict (slug) do update set
             course_id=excluded.course_id, unit_id=excluded.unit_id, skill=excluded.skill,
             title=excluded.title, description=excluded.description, order_index=excluded.order_index,
             xp_reward=excluded.xp_reward, access_tier=excluded.access_tier,
             estimated_minutes=excluded.estimated_minutes, audio_url=excluded.audio_url,
             is_published=true, mission=excluded.mission, grammar_note=excluded.grammar_note,
             phrases=excluded.phrases, extra=excluded.extra
           returning id`,
          [
            course.id, unitId, row.slug, row.skill, row.title,
            row.description || content.mission || '', row.order_index || 0,
            content.xp_reward || 20,
            row.access_tier || (row.is_free === false ? 'premium' : 'free'),
            row.estimated_minutes || 10, row.audio_url || null,
            content.mission || null, content.grammar || null,
            JSON.stringify(content.phrases?.length ? content.phrases : null),
            JSON.stringify(content.extra || null)
          ]
        )
      ).rows[0];

      await client.query('delete from public.lesson_sections where lesson_id=$1', [lesson.id]);
      const sections = [];
      if (content.intro) sections.push(['intro', 0, null, null, null, null, content.intro, null, null, null, null, null]);
      (content.vocabulary || []).forEach((item, index) =>
        sections.push(['vocabulary_item', index, item.word, item.translation, item.example, null, null, null, null, null, null, null])
      );
      (content.dialogue || []).forEach((item, index) =>
        sections.push(['dialogue_line', index, null, item.translation, null, item.speaker, item.line, null, null, null, null, null])
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
            lesson.id, section[0], section[1], section[2], section[3], section[4],
            section[5], section[6], section[7], section[8],
            JSON.stringify(section[9]), JSON.stringify(section[10]), JSON.stringify(section[11])
          ]
        );
      }

      await client.query('delete from public.exercises where lesson_id=$1', [lesson.id]);
      for (const [index, exercise] of (content.exercises || []).entries()) {
        const exerciseRow = (
          await client.query(
            `insert into public.exercises (lesson_id,type,prompt,order_index)
             values ($1,$2,$3,$4) returning id`,
            [lesson.id, exercise.type, exercise.prompt, index]
          )
        ).rows[0];
        if (exercise.type === 'mcq' && Array.isArray(exercise.options)) {
          for (const [optionIndex, optionText] of exercise.options.entries()) {
            await client.query(
              `insert into public.exercise_options
               (exercise_id,option_text,is_correct,order_index) values ($1,$2,$3,$4)`,
              [exerciseRow.id, optionText, optionIndex === Number(exercise.answer), optionIndex]
            );
          }
        }
      }
    }

    await client.query(
      `delete from public.course_lessons
       where course_id=$1 and not (slug = any($2::text[]))`,
      [course.id, newSlugs]
    );
    await client.query('commit');
    const verification = (
      await client.query(
        `select
           count(distinct cu.slug)::int as units,
           count(cl.*)::int as lessons,
           count(*) filter (where cl.skill='reading')::int as reading,
           count(*) filter (where cl.skill='grammar')::int as grammar,
           count(*) filter (where cl.skill='vocabulary')::int as vocabulary,
           count(*) filter (where cl.access_tier='free')::int as free,
           count(*) filter (where cl.access_tier='premium')::int as premium
         from public.course_lessons cl
         join public.course_units cu on cu.id=cl.unit_id
         where cl.course_id=$1`,
        [course.id]
      )
    ).rows[0];
    console.log('Migracion de English B1 completa por PostgreSQL:', verification);
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

async function mainViaApi() {
  if (!config.isSupabaseConfigured) {
    console.error('Supabase no esta configurado. Nada que migrar.');
    process.exit(1);
  }

  const supabase = getSupabaseAdmin();

  const units = seedUnits
    .filter((row) => row.target_language === LANGUAGE && row.level === LEVEL)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  const lessons = seedLessons
    .filter((row) => row.target_language === LANGUAGE && row.level === LEVEL)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  if (!units.length) {
    console.error('No hay unidades de English B1 en el seed. Corre build-english-b1-seed.js primero.');
    process.exit(1);
  }
  if (lessons.length !== units.length * ACTIVITIES_PER_UNIT) {
    console.error(
      `Esperaba ${units.length * ACTIVITIES_PER_UNIT} actividades de English B1 en el seed (${units.length} unidades x ${ACTIVITIES_PER_UNIT} skills), encontre ${lessons.length}. Abortando.`
    );
    process.exit(1);
  }

  console.log(`Migrando ${units.length} unidades y ${lessons.length} actividades de English B1...`);

  const { data: language, error: langError } = await supabase
    .from('languages')
    .upsert({ code: LANGUAGE, name: 'English' }, { onConflict: 'code' })
    .select('id')
    .single();
  if (langError) throw new Error(`languages: ${langError.message}`);

  const { data: level, error: levelError } = await supabase
    .from('levels')
    .upsert({ code: LEVEL, name: 'B1 - Intermediate', sort_order: 3 }, { onConflict: 'code' })
    .select('id')
    .single();
  if (levelError) throw new Error(`levels: ${levelError.message}`);

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .upsert(
      {
        language_id: language.id,
        level_id: level.id,
        title: 'English B1',
        description:
          'Intermediate English (B1): work, community, travel, health, money, digital life, culture, relationships and future goals through thematic units.'
      },
      { onConflict: 'language_id,level_id' }
    )
    .select('id')
    .single();
  if (courseError) throw new Error(`courses: ${courseError.message}`);

  console.log('  -> units...');
  const unitIdBySlug = {};
  for (const unit of units) {
    const { data: unitRow, error: unitError } = await supabase
      .from('course_units')
      .upsert(
        {
          course_id: course.id,
          slug: unit.slug,
          title: unit.title,
          description: unit.description || '',
          order_index: unit.order_index || 0
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();
    if (unitError) throw new Error(`course_units (${unit.slug}): ${unitError.message}`);
    unitIdBySlug[unit.slug] = unitRow.id;
  }

  const newSlugs = [];
  for (const row of lessons) {
    const content = row.content_json || {};
    const unitId = unitIdBySlug[row.unit_slug];
    if (!unitId) throw new Error(`No unit found for slug "${row.unit_slug}" (lesson ${row.slug})`);
    newSlugs.push(row.slug);
    console.log(`  -> ${row.slug} ...`);

    const { data: lesson, error: lessonError } = await supabase
      .from('course_lessons')
      .upsert(
        {
          course_id: course.id,
          unit_id: unitId,
          slug: row.slug,
          skill: row.skill,
          title: row.title,
          description: row.description || content.mission || '',
          order_index: row.order_index || 0,
          xp_reward: content.xp_reward || 20,
          access_tier: row.access_tier || (row.is_free === false ? 'premium' : 'free'),
          estimated_minutes: row.estimated_minutes || 10,
          audio_url: row.audio_url || null,
          is_published: true,
          mission: content.mission || null,
          grammar_note: content.grammar || null,
          phrases: content.phrases && content.phrases.length ? content.phrases : null,
          extra: content.extra || null
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();
    if (lessonError) throw new Error(`course_lessons (${row.slug}): ${lessonError.message}`);

    await supabase.from('lesson_sections').delete().eq('lesson_id', lesson.id);

    const sectionRows = [];
    if (content.intro) {
      sectionRows.push({ lesson_id: lesson.id, type: 'intro', order_index: 0, line: content.intro });
    }
    (content.vocabulary || []).forEach((item, index) => {
      sectionRows.push({
        lesson_id: lesson.id,
        type: 'vocabulary_item',
        order_index: index,
        word: item.word,
        translation: item.translation,
        example: item.example
      });
    });
    (content.dialogue || []).forEach((item, index) => {
      sectionRows.push({
        lesson_id: lesson.id,
        type: 'dialogue_line',
        order_index: index,
        speaker: item.speaker,
        line: item.line,
        translation: item.translation
      });
    });
    if (content.reading) {
      sectionRows.push({
        lesson_id: lesson.id,
        type: 'reading',
        order_index: 0,
        reading_title: content.reading.title || null,
        reading_text: content.reading.text || '',
        reading_questions: content.reading.questions || [],
        reading_parts: content.reading.parts || null,
        reading_ordering: content.reading.ordering || null
      });
    }
    if (sectionRows.length) {
      const { error: sectionsError } = await supabase.from('lesson_sections').insert(sectionRows);
      if (sectionsError) throw new Error(`lesson_sections (${row.slug}): ${sectionsError.message}`);
    }

    await supabase.from('exercises').delete().eq('lesson_id', lesson.id);

    for (const [index, exercise] of (content.exercises || []).entries()) {
      const { data: exerciseRow, error: exerciseError } = await supabase
        .from('exercises')
        .insert({ lesson_id: lesson.id, type: exercise.type, prompt: exercise.prompt, order_index: index })
        .select('id')
        .single();
      if (exerciseError) throw new Error(`exercises (${row.slug} #${index}): ${exerciseError.message}`);

      if (exercise.type === 'mcq' && Array.isArray(exercise.options)) {
        const optionRows = exercise.options.map((optionText, optionIndex) => ({
          exercise_id: exerciseRow.id,
          option_text: optionText,
          is_correct: optionIndex === Number(exercise.answer),
          order_index: optionIndex
        }));
        const { error: optionsError } = await supabase.from('exercise_options').insert(optionRows);
        if (optionsError) throw new Error(`exercise_options (${row.slug} #${index}): ${optionsError.message}`);
      }
    }
  }

  const { data: existingLessons } = await supabase
    .from('course_lessons')
    .select('id, slug')
    .eq('course_id', course.id);
  const staleLessons = (existingLessons || []).filter((row) => !newSlugs.includes(row.slug));
  if (staleLessons.length) {
    console.log(`  -> removing ${staleLessons.length} stale activity row(s)...`);
    const { error: deleteError } = await supabase
      .from('course_lessons')
      .delete()
      .in(
        'id',
        staleLessons.map((row) => row.id)
      );
    if (deleteError) throw new Error(`cleanup course_lessons: ${deleteError.message}`);
  }

  console.log('Migracion de English B1 (unidades) completa.');
}

const main = process.env.SUPABASE_DATABASE_URL ? mainViaPostgres : mainViaApi;
main().catch((error) => {
  console.error('Error migrando English B1 (unidades):', error.message);
  process.exit(1);
});
