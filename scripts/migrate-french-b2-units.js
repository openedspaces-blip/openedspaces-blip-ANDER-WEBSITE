#!/usr/bin/env node
// scripts/migrate-french-b2-units.js
// Pushes French B2's unit-based content (built by
// scripts/build-french-b2-seed.js into lib/seed-lessons.json +
// lib/seed-units.json) into Supabase's normalized courses/course_units/
// course_lessons/lesson_sections/exercises/exercise_options schema. Mirrors
// scripts/migrate-french-a1-units.js exactly, with LEVEL='B2' and a unit
// count assertion that tracks however many B2 units currently exist in
// scripts/content/french-b2-units.js (grows as more units are authored;
// target for B2 specifically is exactly 12, per spec).
// Idempotent: safe to re-run, upserts by natural keys (code/slug), and
// removes any old course_lessons rows for this course that are no longer
// part of the current activity set.
// Usage: node scripts/migrate-french-b2-units.js
require('dotenv').config();
const seedLessons = require('../lib/seed-lessons.json');
const seedUnits = require('../lib/seed-units.json');
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const config = require('../lib/config');
const { validateLevel } = require('./validate-french-content');
const french_b2_units = require('./content/french-b2-units');

const LANGUAGE = 'french';
const LEVEL = 'B2';
const MIN_UNITS = 12;
const MAX_UNITS = 12;

async function main() {
  // Hard content gate (Fase "no migrar contenido incompleto"): refuse to
  // touch Supabase at all if French B2 doesn't yet meet the minimum
  // enriched-course bar (exactly 12 units, 7 activities each, valid mcq
  // answers, no empty fields, reading word counts/question counts in range).
  const contentErrors = validateLevel(french_b2_units, {
    minUnits: MIN_UNITS,
    maxUnits: MAX_UNITS,
    readingRange: [350, 550],
    label: 'B2'
  });
  if (contentErrors.length) {
    console.error(`B2 incompleto o inválido (${contentErrors.length} problema(s)). Abortando sin tocar Supabase:`);
    contentErrors.forEach((e) => console.error(' - ' + e));
    process.exit(1);
  }

  if (!config.isSupabaseConfigured) {
    console.error('Supabase no está configurado. Nada que migrar.');
    process.exit(1);
  }

  const supabase = getSupabaseAdmin();

  const units = seedUnits
    .filter((row) => row.target_language === LANGUAGE && row.level === LEVEL)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  const lessons = seedLessons
    .filter((row) => row.target_language === LANGUAGE && row.level === LEVEL)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  if (units.length < MIN_UNITS || units.length > MAX_UNITS) {
    console.error(
      `B2 inválido: se encontraron ${units.length} unidades en el seed; se requieren exactamente ${MIN_UNITS}. ¿Corriste build-french-b2-seed.js después de editar el contenido?`
    );
    process.exit(1);
  }
  if (lessons.length !== units.length * 7) {
    console.error(
      `Esperaba ${units.length * 7} actividades de French B2 en el seed, encontré ${lessons.length}. Abortando.`
    );
    process.exit(1);
  }

  console.log(`Migrando ${units.length} unidades y ${lessons.length} actividades de French B2...`);

  const { data: language, error: langError } = await supabase
    .from('languages')
    .upsert({ code: LANGUAGE, name: 'Français' }, { onConflict: 'code' })
    .select('id')
    .single();
  if (langError) throw new Error(`languages: ${langError.message}`);

  const { data: level, error: levelError } = await supabase
    .from('levels')
    .upsert({ code: LEVEL, name: 'B2 - Avancé', sort_order: 4 }, { onConflict: 'code' })
    .select('id')
    .single();
  if (levelError) throw new Error(`levels: ${levelError.message}`);

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .upsert(
      {
        language_id: language.id,
        level_id: level.id,
        title: 'Français B2',
        description:
          'Français avancé : argumentation, société, culture et projets académiques, organisés en unités thématiques.'
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
          phrases: content.phrases && content.phrases.length ? content.phrases : null
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
    console.log(`  -> removing ${staleLessons.length} stale legacy activity row(s)...`);
    const { error: deleteError } = await supabase
      .from('course_lessons')
      .delete()
      .in(
        'id',
        staleLessons.map((row) => row.id)
      );
    if (deleteError) throw new Error(`cleanup course_lessons: ${deleteError.message}`);
  }

  console.log('Migración de French B2 (unidades) completa.');
}

main().catch((error) => {
  console.error('Error migrando French B2 (unidades):', error.message);
  process.exit(1);
});
