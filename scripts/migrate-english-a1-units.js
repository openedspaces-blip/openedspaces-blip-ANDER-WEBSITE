#!/usr/bin/env node
// scripts/migrate-english-a1-units.js
// Replaces English A1's normalized-schema content (previously 6 flat
// lessons, one per skill - see the now-superseded scripts/migrate-english-a1.js)
// with the 12-unit / 72-activity structure built by
// scripts/build-english-a1-seed.js into lib/seed-lessons.json +
// lib/seed-units.json. Requires supabase/migrations/202607170001_course_units.sql
// to have been applied first (adds course_units + course_lessons.unit_id).
// Idempotent: safe to re-run, upserts by natural keys (code/slug), and
// removes any old course_lessons rows for this course that are no longer
// part of the new 72-activity set (the legacy 6 "Quest/Lab/Mission" rows).
// Usage: node scripts/migrate-english-a1-units.js
require('dotenv').config();
const seedLessons = require('../lib/seed-lessons.json');
const seedUnits = require('../lib/seed-units.json');
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const config = require('../lib/config');

const LANGUAGE = 'english';
const LEVEL = 'A1';

async function main() {
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

  if (units.length !== 12) {
    console.error(`Esperaba 12 unidades de English A1 en el seed, encontré ${units.length}. Abortando.`);
    process.exit(1);
  }
  if (lessons.length !== units.length * 6) {
    console.error(
      `Esperaba ${units.length * 6} actividades de English A1 en el seed, encontré ${lessons.length}. Abortando.`
    );
    process.exit(1);
  }

  console.log(`Migrando ${units.length} unidades y ${lessons.length} actividades de English A1...`);

  const { data: language, error: langError } = await supabase
    .from('languages')
    .upsert({ code: LANGUAGE, name: 'English' }, { onConflict: 'code' })
    .select('id')
    .single();
  if (langError) throw new Error(`languages: ${langError.message}`);

  const { data: level, error: levelError } = await supabase
    .from('levels')
    .upsert({ code: LEVEL, name: 'A1 - Beginner', sort_order: 1 }, { onConflict: 'code' })
    .select('id')
    .single();
  if (levelError) throw new Error(`levels: ${levelError.message}`);

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .upsert(
      {
        language_id: language.id,
        level_id: level.id,
        title: 'English A1',
        description:
          'Survival English: greetings, introductions and basic requests, organized in 12 thematic units.'
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
          is_published: true
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();
    if (lessonError) throw new Error(`course_lessons (${row.slug}): ${lessonError.message}`);

    // Sections: wipe and re-insert, simplest way to keep this idempotent
    // without needing a natural key per section row.
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
        // reading_questions/reading_parts/reading_ordering are all jsonb
        // columns - pass arrays/objects as-is and let the Supabase client
        // serialize them. JSON.stringify()-ing them here double-encodes the
        // value (the column ends up storing a JSON *string* instead of a
        // JSON array/object), which breaks the client's `.map(...)` once it
        // comes back through the API.
        reading_questions: content.reading.questions || [],
        reading_parts: content.reading.parts || null,
        reading_ordering: content.reading.ordering || null
      });
    }
    if (sectionRows.length) {
      const { error: sectionsError } = await supabase.from('lesson_sections').insert(sectionRows);
      if (sectionsError) throw new Error(`lesson_sections (${row.slug}): ${sectionsError.message}`);
    }

    // Exercises: wipe and re-insert (options cascade-delete with their exercise).
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

  // Remove old course_lessons for this course that are no longer part of the
  // new 72-activity set (the legacy 6 "Quest/Lab/Mission" rows migrated by
  // the now-superseded scripts/migrate-english-a1.js). Cascade-deletes their
  // sections/exercises/options and any user progress against them.
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

  console.log('Migración de English A1 (unidades) completa.');
}

main().catch((error) => {
  console.error('Error migrando English A1 (unidades):', error.message);
  process.exit(1);
});
