#!/usr/bin/env node
// scripts/build-spanish-a1-seed.js
// Folds scripts/content/spanish-a1-units.js (hand-authored 12-unit content)
// into lib/seed-lessons.json (replacing the 6 legacy flat Spanish A1 rows
// - spanish-a1-listening, spanish-a1-speaking, etc., level A1 only; A2-C2
// legacy rows are untouched - with 72 unit-scoped activity rows) and writes
// matching rows into lib/seed-units.json (12 unit metadata rows). Mirrors
// scripts/build-english-a1-seed.js / scripts/build-french-a1-seed.js; kept
// as a separate sibling script (not a shared module) so English's and
// French's working pipelines are never touched by Spanish-specific changes.
// Run this, then `npm run sync:worlds` to regenerate the browser fallback
// bundles, and scripts/migrate-spanish-a1-units.js to push into Supabase
// (not run automatically - requires explicit approval, see the migration
// file's own header). Idempotent: safe to re-run.
const fs = require('fs');
const path = require('path');
const { units, language, level, courseTitle, courseDescription } = require('./content/spanish-a1-units');

const ROOT = path.join(__dirname, '..');
const SEED_LESSONS_PATH = path.join(ROOT, 'lib', 'seed-lessons.json');
const SEED_UNITS_PATH = path.join(ROOT, 'lib', 'seed-units.json');

const CORE_SKILLS = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];

// Mirrors scripts/build-english-a1-seed.js#shapeReading: keeps reading.text
// as the full concatenated text for backward compatibility - computed from
// parts rather than hand-authored twice.
function shapeReading(reading) {
  if (!reading) return null;
  if (!reading.parts) return reading;
  return { ...reading, text: reading.parts.join('\n\n') };
}

// Extra pedagogical fields beyond what English/French A1 carry - stored
// under content_json.extra (see 202607220001_rich_listening_content.sql,
// course_lessons.extra jsonb). Never includes dictation segment *text*
// here in the shape the client will eventually receive - see
// scripts/migrate-spanish-a1-units.js, which routes dictation segment text
// into the service-role-only lesson_dictation_segments table instead of
// this jsonb blob.
function shapeExtra(a) {
  const extra = {};
  if (a.listeningType) extra.listeningType = a.listeningType;
  if (a.difficulty) extra.difficulty = a.difficulty;
  if (a.durationSeconds) extra.durationSeconds = a.durationSeconds;
  if (a.speakers) extra.speakers = a.speakers;
  if (a.phoneticSupport) extra.phoneticSupport = a.phoneticSupport;
  if (a.dictation) extra.dictationSegmentCount = (a.dictation.segments || []).length;
  return Object.keys(extra).length ? extra : null;
}

function buildActivityRow(unit, skill, orderInUnit) {
  const a = unit.activities[skill];
  if (!a) throw new Error(`Unit "${unit.slug}" is missing a "${skill}" activity`);

  const accessTier = unit.accessTier || 'free';
  return {
    slug: `spanish-a1-${unit.slug}-${skill}`,
    target_language: language,
    level,
    skill,
    unit_slug: unit.slug, // resolved to a real unit_id at Supabase-insert time
    title: a.title,
    description: a.description || '',
    order_index: unit.order * 10 + orderInUnit,
    estimated_minutes: a.duration,
    is_free: accessTier !== 'premium',
    access_tier: accessTier,
    content_json: {
      language: 'Español',
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
      // dictation.segments here carries `text` - this is the AUTHORING
      // source of truth (scripts/migrate-spanish-a1-units.js reads it to
      // populate lesson_dictation_segments). It never reaches the browser:
      // scripts/sync-worlds-from-seed.js#shapeBrowserLesson intentionally
      // omits `dictation` when building the public fallback bundle.
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
  // Spanish A2-C2 legacy rows (and any other language/level) must survive -
  // only remove target_language==='spanish' && level==='A1' rows (the 6
  // legacy flat spanish-a1-* rows from lib/seed-lessons.json).
  const keep = existingLessons.filter(
    (row) => !(row.target_language === language && row.level === level)
  );
  const removedCount = existingLessons.length - keep.length;

  const newRows = [];
  units.forEach((unit) => {
    CORE_SKILLS.forEach((skill, index) => {
      newRows.push(buildActivityRow(unit, skill, index));
    });
  });

  const nextLessons = [...keep, ...newRows];
  fs.writeFileSync(SEED_LESSONS_PATH, JSON.stringify(nextLessons, null, 2) + '\n', 'utf8');

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
    `Replaced ${removedCount} legacy Spanish A1 row(s) with ${newRows.length} unit-scoped activities (${units.length} units).`
  );
  console.log(`Wrote ${unitRows.length} unit rows to ${path.relative(ROOT, SEED_UNITS_PATH)}.`);
  console.log(`Course: "${courseTitle}" - ${courseDescription}`);
}

main();
