#!/usr/bin/env node
// scripts/build-english-a2-seed.js
// Folds scripts/content/english-a2-units.js (hand-authored English A2
// content) into lib/seed-lessons.json + lib/seed-units.json. Mirrors
// scripts/build-english-a1-seed.js / build-french-a1-seed.js; kept as a
// separate sibling script (not a shared module) so English A1's working
// pipeline is never touched by A2-specific changes. Run this, then
// `npm run sync:worlds` to regenerate the browser fallback bundle, and
// scripts/migrate-english-a2-units.js to push into Supabase. Idempotent:
// safe to re-run.
//
// Phase 1: scripts/content/english-a2-units.js only has Unit 1 authored so
// far - this script does not hardcode an expected unit/lesson count (unlike
// the A1 scripts, which do, since all 12 A1 units already exist); it just
// derives everything from however many units the content module currently
// has, so later phases (units 2-10) need no change here.
const fs = require('fs');
const path = require('path');
const { units, language, level, courseTitle, courseDescription } = require('./content/english-a2-units');

const ROOT = path.join(__dirname, '..');
const SEED_LESSONS_PATH = path.join(ROOT, 'lib', 'seed-lessons.json');
const SEED_UNITS_PATH = path.join(ROOT, 'lib', 'seed-units.json');

const CORE_SKILLS = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];

// Mirrors build-english-a1-seed.js#shapeReading: A2 readings never use
// `parts` (single full-text view, no "Part 1 of 3") - this only exists so a
// future unit that did use parts would still be handled, same as A1/French.
function shapeReading(reading) {
  if (!reading) return null;
  if (!reading.parts) return reading;
  return { ...reading, text: reading.parts.join('\n\n') };
}

// Mirrors build-english-a1-seed.js#shapeExtra / build-spanish-a1-seed.js#shapeExtra.
function shapeExtra(a) {
  const extra = {};
  if (a.grammarTest) extra.grammarTest = a.grammarTest;
  return Object.keys(extra).length ? extra : null;
}

function buildActivityRow(unit, skill, orderInUnit) {
  const a = unit.activities[skill];
  if (!a) throw new Error(`Unit "${unit.slug}" is missing a "${skill}" activity`);

  const accessTier = unit.accessTier || 'free';
  return {
    slug: `english-a2-${unit.slug}-${skill}`,
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
    // Not yet persisted by migrate-english-a2-units.js (course_units has no
    // matching column today - same known gap as A1/French's unit_overview,
    // not introduced here) - kept for the browser fallback bundle and any
    // future unit-overview column.
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
    `Replaced ${removedCount} previous English A2 row(s) with ${newRows.length} unit-scoped activities (${units.length} unit(s) - Phase 1).`
  );
  console.log(`Wrote ${unitRows.length} unit row(s) to ${path.relative(ROOT, SEED_UNITS_PATH)}.`);
  console.log(`Course: "${courseTitle}" - ${courseDescription}`);
}

main();
