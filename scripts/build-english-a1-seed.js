#!/usr/bin/env node
// scripts/build-english-a1-seed.js
// Folds scripts/content/english-a1-units.js (hand-authored 12-unit content)
// into lib/seed-lessons.json (replacing the old 6 flat English A1 rows with
// 72 unit-scoped activity rows) and writes lib/seed-units.json (12 unit
// metadata rows). Run this, then `npm run sync:worlds` to regenerate the
// browser fallback bundles, and scripts/migrate-english-a1-units.js to push
// into Supabase. Idempotent: safe to re-run.
const fs = require('fs');
const path = require('path');
const { units, language, level, courseTitle, courseDescription } = require('./content/english-a1-units');

const ROOT = path.join(__dirname, '..');
const SEED_LESSONS_PATH = path.join(ROOT, 'lib', 'seed-lessons.json');
const SEED_UNITS_PATH = path.join(ROOT, 'lib', 'seed-units.json');

const SKILL_ORDER = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];

// reading_text (both the normalized schema's lesson_sections.reading_text
// column and the legacy content_json.reading.text field) keeps holding the
// full concatenated text for backward compatibility (print/PDF view, "show
// full text" after the last part, Tutor IA "explain this paragraph"
// prompts) - computed from parts rather than hand-authored twice.
function shapeReading(reading) {
  if (!reading) return null;
  if (!reading.parts) return reading;
  return { ...reading, text: reading.parts.join('\n\n') };
}

// Extra pedagogical fields beyond what English A1 has always carried -
// stored under content_json.extra (see
// 202607220001_rich_listening_content.sql, course_lessons.extra jsonb).
// Mirrors scripts/build-spanish-a1-seed.js#shapeExtra exactly, now that the
// Listening pilot unit (scripts/content/english-a1-units.js's "hello" unit)
// carries the same rich fields Spanish A1 already does. grammarTest and
// listeningComprehension are answer-bearing question banks (see
// lib/grammarTestSanitizer.js) - never sent to the client as-is, only
// through that sanitizer (see scripts/sync-worlds-from-seed.js).
function shapeExtra(a) {
  const extra = {};
  if (a.grammarTest) extra.grammarTest = a.grammarTest;
  if (a.listeningType) extra.listeningType = a.listeningType;
  if (a.difficulty) extra.difficulty = a.difficulty;
  if (a.durationSeconds) extra.durationSeconds = a.durationSeconds;
  if (a.speakers) extra.speakers = a.speakers;
  if (a.phoneticSupport) extra.phoneticSupport = a.phoneticSupport;
  if (a.dictation) extra.dictationSegmentCount = (a.dictation.segments || []).length;
  if (a.listeningComprehension) extra.listeningComprehension = a.listeningComprehension;
  return Object.keys(extra).length ? extra : null;
}

function buildActivityRow(unit, skill) {
  const a = unit.activities[skill];
  if (!a) throw new Error(`Unit "${unit.slug}" is missing a "${skill}" activity`);

  const skillIndex = SKILL_ORDER.indexOf(skill);
  return {
    slug: `english-a1-${unit.slug}-${skill}`,
    target_language: language,
    level,
    skill,
    unit_slug: unit.slug, // resolved to a real unit_id at Supabase-insert time
    title: a.title,
    description: a.description || '',
    order_index: unit.order * 10 + skillIndex,
    estimated_minutes: a.duration,
    is_free: true,
    access_tier: 'free',
    content_json: {
      language: 'English',
      language_key: language,
      level_title: courseTitle,
      intro: a.intro || '',
      mission: a.mission || '',
      grammar: a.grammarNote || '',
      phrases: a.phrases || [],
      vocabulary: a.vocabulary || [],
      dialogue: a.dialogue || [],
      reading: shapeReading(a.reading),
      transcript: a.transcript || '',
      // dictation.segments here carries `text` - authoring-time answer key
      // only (mirrors scripts/build-spanish-a1-seed.js). Never reaches the
      // browser: scripts/sync-worlds-from-seed.js#shapeBrowserLesson
      // intentionally omits `dictation` from the public bundle.
      dictation: a.dictation || null,
      exercises: a.exercises || [],
      extra: shapeExtra(a),
      xp_reward: a.xp
    }
  };
}

function buildUnitRow(unit) {
  return {
    slug: unit.slug,
    target_language: language,
    level,
    title: unit.title,
    title_es: unit.titleEs || '',
    description: unit.description || '',
    order_index: unit.order,
    // Optional: objective/outcomes/grammar/vocabulary/scenario for the
    // Ruta de aprendizaje's unit overview panel (see
    // src/js/script.js#renderUnitOverviewCard). Not every unit has it yet.
    unit_overview: unit.unitOverview || null
  };
}

function main() {
  const existingLessons = JSON.parse(fs.readFileSync(SEED_LESSONS_PATH, 'utf8'));
  const keep = existingLessons.filter(
    (row) => !(row.target_language === language && row.level === level)
  );
  const removedCount = existingLessons.length - keep.length;

  const newRows = [];
  units.forEach((unit) => {
    SKILL_ORDER.forEach((skill) => {
      newRows.push(buildActivityRow(unit, skill));
    });
  });

  const nextLessons = [...keep, ...newRows];
  fs.writeFileSync(SEED_LESSONS_PATH, JSON.stringify(nextLessons, null, 2) + '\n', 'utf8');

  // Merge rather than overwrite: lib/seed-units.json is shared across
  // languages (French A1 also writes into it via
  // scripts/build-french-a1-seed.js) - replacing only this course's own
  // rows keeps re-running this script safe regardless of what else has
  // been seeded into the file.
  const unitRows = units.map(buildUnitRow);
  const existingUnits = JSON.parse(fs.readFileSync(SEED_UNITS_PATH, 'utf8'));
  const keepUnits = existingUnits.filter(
    (row) => !(row.target_language === language && row.level === level)
  );
  fs.writeFileSync(
    SEED_UNITS_PATH,
    JSON.stringify([...keepUnits, ...unitRows], null, 2) + '\n',
    'utf8'
  );

  console.log(
    `Replaced ${removedCount} legacy English A1 row(s) with ${newRows.length} unit-scoped activities (${units.length} units).`
  );
  console.log(`Wrote ${unitRows.length} unit rows to ${path.relative(ROOT, SEED_UNITS_PATH)}.`);
  console.log(`Course: "${courseTitle}" - ${courseDescription}`);
}

main();
