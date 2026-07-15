#!/usr/bin/env node
// scripts/migrate-english-a1.js
// One-time migration of the 6 English A1 lessons from lib/seed-lessons.json
// (legacy content_json format) into the normalized schema added by
// supabase/migrations/202607120001_normalized_courses_schema.sql.
// Idempotent: safe to re-run, upserts by natural keys (code/slug).
// Usage: node scripts/migrate-english-a1.js
require('dotenv').config();
const seedLessons = require('../lib/seed-lessons.json');
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const config = require('../lib/config');

async function main() {
  if (!config.isSupabaseConfigured) {
    console.error('Supabase no está configurado. Nada que migrar.');
    process.exit(1);
  }

  const supabase = getSupabaseAdmin();

  const lessons = seedLessons
    .filter((row) => row.target_language === 'english' && row.level === 'A1')
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  if (lessons.length !== 6) {
    console.error(
      `Esperaba 6 lecciones de English A1 en el seed, encontré ${lessons.length}. Abortando.`
    );
    process.exit(1);
  }

  console.log(`Migrando ${lessons.length} lecciones de English A1...`);

  const { data: language, error: langError } = await supabase
    .from('languages')
    .upsert({ code: 'english', name: 'English' }, { onConflict: 'code' })
    .select('id')
    .single();
  if (langError) throw new Error(`languages: ${langError.message}`);

  const { data: level, error: levelError } = await supabase
    .from('levels')
    .upsert({ code: 'A1', name: 'A1 - Beginner', sort_order: 1 }, { onConflict: 'code' })
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
        description: 'Survival English: greetings, introductions and basic requests.'
      },
      { onConflict: 'language_id,level_id' }
    )
    .select('id')
    .single();
  if (courseError) throw new Error(`courses: ${courseError.message}`);

  for (const row of lessons) {
    const content = row.content_json || {};
    console.log(`  -> ${row.slug} ...`);

    const { data: lesson, error: lessonError } = await supabase
      .from('course_lessons')
      .upsert(
        {
          course_id: course.id,
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
      sectionRows.push({
        lesson_id: lesson.id,
        type: 'intro',
        order_index: 0,
        line: content.intro
      });
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
        reading_questions: JSON.stringify(content.reading.questions || [])
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
        .insert({
          lesson_id: lesson.id,
          type: exercise.type,
          prompt: exercise.prompt,
          order_index: index
        })
        .select('id')
        .single();
      if (exerciseError)
        throw new Error(`exercises (${row.slug} #${index}): ${exerciseError.message}`);

      if (exercise.type === 'mcq' && Array.isArray(exercise.options)) {
        const optionRows = exercise.options.map((optionText, optionIndex) => ({
          exercise_id: exerciseRow.id,
          option_text: optionText,
          is_correct: optionIndex === Number(exercise.answer),
          order_index: optionIndex
        }));
        const { error: optionsError } = await supabase.from('exercise_options').insert(optionRows);
        if (optionsError)
          throw new Error(`exercise_options (${row.slug} #${index}): ${optionsError.message}`);
      }
    }

    console.log('     done');
  }

  console.log('Migración de English A1 completa.');
}

main().catch((error) => {
  console.error('Error migrando English A1:', error.message);
  process.exit(1);
});
