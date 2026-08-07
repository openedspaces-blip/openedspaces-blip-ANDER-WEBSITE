#!/usr/bin/env node
// scripts/migrate-via-rest.js
// Same effect as the per-course migrate-<language>-<level>-units.js scripts,
// but talks to Supabase over its HTTPS REST API (PostgREST) instead of a raw
// Postgres connection. Use this when the environment cannot open a direct
// TCP connection to the database host (e.g. IPv6-only host, no raw DNS/TCP
// egress) but HTTPS is reachable.
//
// Usage: node scripts/migrate-via-rest.js <language> <level>
// Example: node scripts/migrate-via-rest.js english B1

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const config = require('../lib/config');
const seedLessons = require('../lib/seed-lessons.json');
const seedUnits = require('../lib/seed-units.json');

const LEVEL_META = {
  A1: { name: 'A1 - Beginner', sort: 1 },
  A2: { name: 'A2 - Elementary', sort: 2 },
  B1: { name: 'B1 - Intermediate', sort: 3 },
  B2: { name: 'B2 - Upper intermediate', sort: 4 },
  C1: { name: 'C1 - Advanced', sort: 5 },
  C2: { name: 'C2 - Mastery', sort: 6 }
};

const LANGUAGE_META = {
  english: 'English',
  french: 'Français',
  spanish: 'Español'
};

// Matches the branded course titles already used by the hand-written
// migrate-*-units.js scripts (e.g. migrate-french-b1-units.js,
// migrate-spanish-expanded-units.js) so this REST fallback doesn't
// silently rename an existing course when it upserts on conflict.
const COURSE_TITLE_OVERRIDES = {
  'spanish:A2': 'Español A2 · Vida cotidiana',
  'spanish:B1': 'Español B1 · Comunicación independiente',
  'spanish:B2': 'Español B2 · Argumentación y matices',
  'spanish:C1': 'Español C1 · Expresión precisa',
  'spanish:C2': 'Español C2 · Dominio superior'
};

async function main() {
  const [, , languageArg, levelArg] = process.argv;
  if (!languageArg || !levelArg) {
    throw new Error('Usage: node scripts/migrate-via-rest.js <language> <level>');
  }
  const language = languageArg.toLowerCase();
  const level = levelArg.toUpperCase();
  if (!config.isSupabaseConfigured) throw new Error('Supabase is not configured in .env');
  if (!LEVEL_META[level]) throw new Error(`Unknown level "${level}"`);
  if (!LANGUAGE_META[language]) throw new Error(`Unknown language "${language}"`);

  const units = seedUnits.filter((row) => row.target_language === language && row.level === level);
  const lessons = seedLessons.filter((row) => row.target_language === language && row.level === level);
  if (!units.length || !lessons.length) {
    throw new Error(`No seed rows found for ${language} ${level}. Build the seed first.`);
  }

  const client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false }
  });

  const languageRow = await upsertOne(client, 'languages', { code: language, name: LANGUAGE_META[language] }, 'code');
  const levelRow = await upsertOne(
    client,
    'levels',
    { code: level, name: LEVEL_META[level].name, sort_order: LEVEL_META[level].sort },
    'code'
  );
  const courseTitle = COURSE_TITLE_OVERRIDES[`${language}:${level}`] || `${LANGUAGE_META[language]} ${level}`;
  const courseDescription = units[0]?.courseDescription || `${courseTitle} course.`;
  const courseRow = await upsertOne(
    client,
    'courses',
    { language_id: languageRow.id, level_id: levelRow.id, title: courseTitle, description: courseDescription },
    'language_id,level_id'
  );

  const unitIds = {};
  for (const unit of units) {
    const row = await upsertOne(
      client,
      'course_units',
      {
        course_id: courseRow.id,
        slug: unit.slug,
        title: unit.title,
        description: unit.description || '',
        order_index: unit.order_index
      },
      'slug'
    );
    unitIds[unit.slug] = row.id;
  }

  const keptLessonSlugs = [];
  for (const row of lessons) {
    const content = row.content_json || {};
    keptLessonSlugs.push(row.slug);
    const lessonRow = await upsertOne(
      client,
      'course_lessons',
      {
        course_id: courseRow.id,
        unit_id: unitIds[row.unit_slug],
        slug: row.slug,
        skill: row.skill,
        title: row.title,
        description: row.description || '',
        order_index: row.order_index,
        xp_reward: content.xp_reward || 20,
        access_tier: row.access_tier,
        estimated_minutes: row.estimated_minutes || 15,
        is_published: true,
        grammar_note: content.grammar || null,
        phrases: content.phrases || null,
        extra: content.extra || null
      },
      'slug'
    );
    const lessonId = lessonRow.id;

    await client.from('lesson_sections').delete().eq('lesson_id', lessonId);
    const sectionRows = [];
    if (content.reading) {
      sectionRows.push({
        lesson_id: lessonId,
        type: 'reading',
        order_index: 0,
        reading_title: content.reading.title || null,
        reading_text: content.reading.text || '',
        reading_questions: content.reading.questions || []
      });
    }
    (content.vocabulary || []).forEach((item, index) => {
      sectionRows.push({
        lesson_id: lessonId,
        type: 'vocabulary_item',
        order_index: index,
        word: item.word,
        translation: item.translation || '',
        example: item.example || '',
        line: item.definition || null
      });
    });
    if (sectionRows.length) {
      const { error } = await client.from('lesson_sections').insert(sectionRows);
      if (error) throw error;
    }

    await client.from('exercises').delete().eq('lesson_id', lessonId);
    const exerciseList = content.exercises || [];
    for (const [index, exercise] of exerciseList.entries()) {
      const { data: exerciseRow, error: exerciseError } = await client
        .from('exercises')
        .insert({ lesson_id: lessonId, type: exercise.type, prompt: exercise.prompt, order_index: index })
        .select('id')
        .single();
      if (exerciseError) throw exerciseError;
      const options = (exercise.options || []).map((optionText, optionIndex) => ({
        exercise_id: exerciseRow.id,
        option_text: optionText,
        is_correct: optionIndex === Number(exercise.answer),
        order_index: optionIndex
      }));
      if (options.length) {
        const { error: optionsError } = await client.from('exercise_options').insert(options);
        if (optionsError) throw optionsError;
      }
    }
  }

  const { error: pruneError } = await client
    .from('course_lessons')
    .delete()
    .eq('course_id', courseRow.id)
    .not('slug', 'in', `(${keptLessonSlugs.map((slug) => `"${slug}"`).join(',')})`);
  if (pruneError) throw pruneError;

  // Units renamed (e.g. a topic swap that also changes the slug, like French
  // C2's SLA-science -> popular-topics rewrite) leave the OLD unit row
  // behind forever otherwise - upsertOne's onConflict:'slug' only ever
  // inserts/updates, never removes a slug that's no longer in this build.
  // Must run after the course_lessons prune above: lessons still pointed at
  // these old unit ids until that delete ran.
  const keptUnitSlugs = units.map((unit) => unit.slug);
  const { error: pruneUnitsError } = await client
    .from('course_units')
    .delete()
    .eq('course_id', courseRow.id)
    .not('slug', 'in', `(${keptUnitSlugs.map((slug) => `"${slug}"`).join(',')})`);
  if (pruneUnitsError) throw pruneUnitsError;

  const { count: lessonCount, error: countError } = await client
    .from('course_lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', courseRow.id);
  if (countError) throw countError;

  console.log(`${courseTitle} migration complete via REST:`, {
    units: units.length,
    lessons: lessonCount
  });
}

async function upsertOne(client, table, values, conflictTarget) {
  const { data, error } = await client
    .from(table)
    .upsert(values, { onConflict: conflictTarget })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
