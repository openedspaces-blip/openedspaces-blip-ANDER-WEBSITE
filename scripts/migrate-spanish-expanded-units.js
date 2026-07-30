#!/usr/bin/env node
// Publishes the unit-based Spanish A2-C2 curriculum to Supabase.
// Idempotent. Legacy flat lessons are unpublished, not deleted, so existing
// learner progress remains recoverable.
require('dotenv').config();
const seedLessons = require('../lib/seed-lessons.json');
const seedUnits = require('../lib/seed-units.json');
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const config = require('../lib/config');

const LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];
const requestedLevels = process.argv.slice(2).map((level) => level.toUpperCase());
const levelsToMigrate = requestedLevels.length ? requestedLevels : LEVELS;
const invalidLevels = levelsToMigrate.filter((level) => !LEVELS.includes(level));
if (invalidLevels.length) {
  throw new Error(`Nivel(es) no válido(s): ${invalidLevels.join(', ')}. Usa: ${LEVELS.join(', ')}.`);
}
const LEVEL_NAMES = {
  A2: 'A2 - Elemental',
  B1: 'B1 - Intermedio',
  B2: 'B2 - Intermedio alto',
  C1: 'C1 - Avanzado',
  C2: 'C2 - Dominio'
};
const LEVEL_TITLES = {
  A2: 'Español A2 · Vida cotidiana',
  B1: 'Español B1 · Comunicación independiente',
  B2: 'Español B2 · Argumentación y matices',
  C1: 'Español C1 · Expresión precisa',
  C2: 'Español C2 · Dominio superior'
};

async function replaceLessonChildren(supabase, lesson, content, slug) {
  const { error: sectionDeleteError } = await supabase
    .from('lesson_sections')
    .delete()
    .eq('lesson_id', lesson.id);
  if (sectionDeleteError) throw new Error(`lesson_sections delete (${slug}): ${sectionDeleteError.message}`);

  const sections = [];
  if (content.intro) {
    sections.push({ lesson_id: lesson.id, type: 'intro', order_index: 0, line: content.intro });
  }
  (content.vocabulary || []).forEach((item, index) => {
    sections.push({
      lesson_id: lesson.id,
      type: 'vocabulary_item',
      order_index: index,
      word: item.word,
      translation: item.translation,
      example: item.example
    });
  });
  (content.dialogue || []).forEach((item, index) => {
    sections.push({
      lesson_id: lesson.id,
      type: 'dialogue_line',
      order_index: index,
      speaker: item.speaker,
      line: item.line,
      translation: item.translation
    });
  });
  if (content.reading) {
    sections.push({
      lesson_id: lesson.id,
      type: 'reading',
      order_index: 0,
      reading_title: content.reading.title || null,
      reading_text: content.reading.text || '',
      reading_questions: content.reading.questions || []
    });
  }
  if (sections.length) {
    const { error } = await supabase.from('lesson_sections').insert(sections);
    if (error) throw new Error(`lesson_sections insert (${slug}): ${error.message}`);
  }

  const { error: exerciseDeleteError } = await supabase
    .from('exercises')
    .delete()
    .eq('lesson_id', lesson.id);
  if (exerciseDeleteError) throw new Error(`exercises delete (${slug}): ${exerciseDeleteError.message}`);

  for (const [index, exercise] of (content.exercises || []).entries()) {
    const { data: exerciseRow, error } = await supabase
      .from('exercises')
      .insert({
        lesson_id: lesson.id,
        type: exercise.type,
        prompt: exercise.prompt,
        order_index: index
      })
      .select('id')
      .single();
    if (error) throw new Error(`exercise (${slug} #${index}): ${error.message}`);
    if (exercise.type === 'mcq' && Array.isArray(exercise.options)) {
      const { error: optionError } = await supabase.from('exercise_options').insert(
        exercise.options.map((optionText, optionIndex) => ({
          exercise_id: exerciseRow.id,
          option_text: optionText,
          is_correct: optionIndex === Number(exercise.answer),
          order_index: optionIndex
        }))
      );
      if (optionError) throw new Error(`exercise_options (${slug} #${index}): ${optionError.message}`);
    }
  }
}

async function migrateLevel(supabase, languageId, levelCode) {
  const units = seedUnits
    .filter((row) => row.target_language === 'spanish' && row.level === levelCode)
    .sort((a, b) => a.order_index - b.order_index);
  const lessons = seedLessons
    .filter((row) => row.target_language === 'spanish' && row.level === levelCode)
    .sort((a, b) => a.order_index - b.order_index);
  if (units.length !== 12 || lessons.length !== 72) {
    throw new Error(`${levelCode}: se esperaban 12 unidades y 72 actividades; hay ${units.length}/${lessons.length}.`);
  }

  const { data: level, error: levelError } = await supabase
    .from('levels')
    .upsert(
      { code: levelCode, name: LEVEL_NAMES[levelCode], sort_order: LEVELS.indexOf(levelCode) + 2 },
      { onConflict: 'code' }
    )
    .select('id')
    .single();
  if (levelError) throw new Error(`levels (${levelCode}): ${levelError.message}`);

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .upsert(
      {
        language_id: languageId,
        level_id: level.id,
        title: LEVEL_TITLES[levelCode],
        description: `Ruta de español ${levelCode} organizada en 12 unidades temáticas y seis habilidades conectadas.`
      },
      { onConflict: 'language_id,level_id' }
    )
    .select('id')
    .single();
  if (courseError) throw new Error(`courses (${levelCode}): ${courseError.message}`);

  const unitIdBySlug = {};
  for (const unit of units) {
    const { data, error } = await supabase
      .from('course_units')
      .upsert(
        {
          course_id: course.id,
          slug: unit.slug,
          title: unit.title,
          description: unit.description || '',
          order_index: unit.order_index
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();
    if (error) throw new Error(`course_units (${unit.slug}): ${error.message}`);
    unitIdBySlug[unit.slug] = data.id;
  }

  const publishedSlugs = [];
  for (const row of lessons) {
    const content = row.content_json || {};
    const { data: lesson, error } = await supabase
      .from('course_lessons')
      .upsert(
        {
          course_id: course.id,
          unit_id: unitIdBySlug[row.unit_slug],
          slug: row.slug,
          skill: row.skill,
          title: row.title,
          description: row.description || '',
          order_index: row.order_index,
          xp_reward: content.xp_reward || 20,
          access_tier: row.access_tier,
          estimated_minutes: row.estimated_minutes,
          is_published: true,
          mission: content.mission || null,
          grammar_note: content.grammar || null,
          phrases: content.phrases?.length ? content.phrases : null,
          extra: {
            ...(content.extra || {}),
            ...(content.reading?.references?.length
              ? { readingReferences: content.reading.references }
              : {})
          }
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();
    if (error) throw new Error(`course_lessons (${row.slug}): ${error.message}`);
    publishedSlugs.push(row.slug);
    await replaceLessonChildren(supabase, lesson, content, row.slug);
  }

  const { data: current, error: currentError } = await supabase
    .from('course_lessons')
    .select('id,slug')
    .eq('course_id', course.id);
  if (currentError) throw new Error(`course_lessons list (${levelCode}): ${currentError.message}`);
  const staleIds = (current || [])
    .filter((row) => !publishedSlugs.includes(row.slug))
    .map((row) => row.id);
  if (staleIds.length) {
    const { error } = await supabase
      .from('course_lessons')
      .update({ is_published: false })
      .in('id', staleIds);
    if (error) throw new Error(`course_lessons unpublish (${levelCode}): ${error.message}`);
  }
  console.log(`${levelCode}: 12 unidades y 72 actividades publicadas; ${staleIds.length} antiguas ocultadas.`);
}

async function main() {
  if (!config.isSupabaseConfigured) throw new Error('Supabase no está configurado.');
  const supabase = getSupabaseAdmin();
  const { data: language, error } = await supabase
    .from('languages')
    .upsert({ code: 'spanish', name: 'Español' }, { onConflict: 'code' })
    .select('id')
    .single();
  if (error) throw new Error(`languages: ${error.message}`);
  for (const level of levelsToMigrate) await migrateLevel(supabase, language.id, level);
}

main().catch((error) => {
  console.error('No se pudo publicar la ruta ampliada de español:', error.message);
  process.exit(1);
});
