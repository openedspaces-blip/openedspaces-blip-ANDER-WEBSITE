#!/usr/bin/env node
/*
 * Synchronise the published Reading multiple-choice options with the
 * canonical seed. This deliberately changes only four-option MCQs, leaving
 * True/False exercises and every other lesson field untouched.
 */
require('dotenv').config();

const seedLessons = require('../lib/seed-lessons.json');
const { getSupabaseAdmin } = require('../lib/supabaseClient');

const BATCH_SIZE = 80;
const WRITE_CONCURRENCY = 24;

function sameOptions(databaseOptions, sourceExercise) {
  const expected = sourceExercise.options.map((optionText, orderIndex) => ({
    option_text: optionText,
    is_correct: orderIndex === Number(sourceExercise.answer),
    order_index: orderIndex
  }));
  const actual = [...(databaseOptions || [])].sort((a, b) => a.order_index - b.order_index);
  return (
    actual.length === expected.length &&
    actual.every(
      (option, index) =>
        option.option_text === expected[index].option_text &&
        Boolean(option.is_correct) === expected[index].is_correct &&
        option.order_index === expected[index].order_index
    )
  );
}

async function main() {
  const sourceBySlug = new Map();
  for (const lesson of seedLessons) {
    if (lesson.skill !== 'reading') continue;
    const exercises = lesson.content_json?.exercises || [];
    const fourOptionExercises = exercises
      .map((exercise, index) => ({ exercise, index }))
      .filter(({ exercise }) => exercise.type === 'mcq' && Array.isArray(exercise.options) && exercise.options.length === 4);
    if (fourOptionExercises.length) sourceBySlug.set(lesson.slug, fourOptionExercises);
  }

  const client = getSupabaseAdmin();
  const sourceSlugs = [...sourceBySlug.keys()];
  let updated = 0;
  let checked = 0;
  const pendingWrites = [];
  const legacyWrites = [];

  for (let start = 0; start < sourceSlugs.length; start += BATCH_SIZE) {
    const slugs = sourceSlugs.slice(start, start + BATCH_SIZE);
    // Most courses are still read from the legacy `lessons.content_json`
    // table. Update that live source first; the normalized course table is
    // handled below for the courses that have already been migrated.
    const { data: legacyRows, error: legacyError } = await client
      .from('lessons')
      .select('id, slug, content_json')
      .in('slug', slugs);
    if (legacyError) throw legacyError;
    for (const row of legacyRows || []) {
      const sourceExercises = sourceBySlug.get(row.slug) || [];
      const content = { ...(row.content_json || {}) };
      const exercises = [...(content.exercises || [])];
      let changed = false;
      for (const { exercise: sourceExercise, index } of sourceExercises) {
        const current = exercises[index];
        // A few retired showcase rows share a slug with newer seed data but
        // have a shorter exercise set. They are not safe to rewrite by
        // position, so leave them untouched rather than corrupting content.
        if (!current) continue;
        checked += 1;
        if (sameOptions(current.options?.map((option_text, order_index) => ({ option_text, is_correct: order_index === Number(current.answer), order_index })), sourceExercise)) continue;
        exercises[index] = { ...current, options: [...sourceExercise.options], answer: sourceExercise.answer };
        changed = true;
      }
      if (changed) legacyWrites.push({ id: row.id, content_json: { ...content, exercises } });
    }

    const { data: lessons, error } = await client
      .from('course_lessons')
      .select('id, slug, exercises(id, order_index, exercise_options(option_text, is_correct, order_index))')
      .in('slug', slugs);
    if (error) throw error;

    for (const lesson of lessons || []) {
      const sourceExercises = sourceBySlug.get(lesson.slug) || [];
      const databaseExercises = new Map(
        (lesson.exercises || []).map((exercise) => [Number(exercise.order_index), exercise])
      );

      for (const { exercise: sourceExercise, index: sourceIndex } of sourceExercises) {
        const databaseExercise = databaseExercises.get(sourceIndex);
        if (!databaseExercise) {
          throw new Error(`Missing exercise ${sourceIndex} for ${lesson.slug}`);
        }
        checked += 1;
        if (sameOptions(databaseExercise.exercise_options, sourceExercise)) continue;

        pendingWrites.push({ databaseExercise, sourceExercise });
      }
    }
  }

  for (let start = 0; start < legacyWrites.length; start += WRITE_CONCURRENCY) {
    await Promise.all(
      legacyWrites.slice(start, start + WRITE_CONCURRENCY).map(async (row) => {
        const { error } = await client.from('lessons').update({ content_json: row.content_json }).eq('id', row.id);
        if (error) throw error;
      })
    );
    updated += Math.min(WRITE_CONCURRENCY, legacyWrites.length - start);
  }

  for (let start = 0; start < pendingWrites.length; start += WRITE_CONCURRENCY) {
    await Promise.all(
      pendingWrites.slice(start, start + WRITE_CONCURRENCY).map(async ({ databaseExercise, sourceExercise }) => {
        const { error: deleteError } = await client
          .from('exercise_options')
          .delete()
          .eq('exercise_id', databaseExercise.id);
        if (deleteError) throw deleteError;
        const optionRows = sourceExercise.options.map((optionText, orderIndex) => ({
          exercise_id: databaseExercise.id,
          option_text: optionText,
          is_correct: orderIndex === Number(sourceExercise.answer),
          order_index: orderIndex
        }));
        const { error: insertError } = await client.from('exercise_options').insert(optionRows);
        if (insertError) throw insertError;
      })
    );
    updated += Math.min(WRITE_CONCURRENCY, pendingWrites.length - start);
  }

  console.log(`Reading MCQ options checked: ${checked}; updated: ${updated} (${legacyWrites.length} legacy lessons, ${pendingWrites.length} normalized exercises).`);
}

main().catch((error) => {
  console.error(`Could not synchronise Reading MCQ options: ${error.message}`);
  process.exit(1);
});
