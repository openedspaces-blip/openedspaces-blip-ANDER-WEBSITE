#!/usr/bin/env node
// scripts/build-french-a1-seed.js
// Folds scripts/content/french-a1-units.js (hand-authored 12-unit content)
// into lib/seed-lessons.json (replacing the old 6 flat French A1 rows with
// 84 unit-scoped activity rows: 72 core skills + 12 dialogues) and writes
// matching rows into lib/seed-units.json (12 unit metadata rows). Mirrors
// scripts/build-english-a1-seed.js; kept as a separate sibling script (not
// a shared module) so English's working pipeline is never touched by
// French-specific changes. Run this, then `npm run sync:worlds` to
// regenerate the browser fallback bundles, and
// scripts/migrate-french-a1-units.js to push into Supabase. Idempotent:
// safe to re-run.
const fs = require('fs');
const path = require('path');
const { units, language, level, courseTitle, courseDescription } = require('./content/french-a1-units');

const ROOT = path.join(__dirname, '..');
const SEED_LESSONS_PATH = path.join(ROOT, 'lib', 'seed-lessons.json');
const SEED_UNITS_PATH = path.join(ROOT, 'lib', 'seed-units.json');

// The 6 core skills are mandatory for every unit; 'dialogue' is appended
// as an optional 7th activity whenever a unit defines one (all 12 French
// A1 units do), without requiring English's units to carry it too.
const CORE_SKILLS = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];

// Mirrors scripts/build-english-a1-seed.js#shapeReading: keeps reading_text
// (both the normalized schema's lesson_sections.reading_text column and the
// legacy content_json.reading.text field) as the full concatenated text for
// backward compatibility - computed from parts rather than hand-authored twice.
function shapeReading(reading) {
  if (!reading) return null;
  if (!reading.parts) return reading;
  return { ...reading, text: reading.parts.join('\n\n') };
}

function buildActivityRow(unit, skill, orderInUnit) {
  const a = unit.activities[skill];
  if (!a) throw new Error(`Unit "${unit.slug}" is missing a "${skill}" activity`);

  const accessTier = unit.accessTier || 'free';
  return {
    slug: `french-a1-${unit.slug}-${skill}`,
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
      language: 'Français',
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
    order_index: unit.order
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
    const skillsForUnit = unit.activities.dialogue ? [...CORE_SKILLS, 'dialogue'] : CORE_SKILLS;
    skillsForUnit.forEach((skill, index) => {
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
    `Replaced ${removedCount} legacy French A1 row(s) with ${newRows.length} unit-scoped activities (${units.length} units).`
  );
  console.log(`Wrote ${unitRows.length} unit rows to ${path.relative(ROOT, SEED_UNITS_PATH)}.`);
  console.log(`Course: "${courseTitle}" - ${courseDescription}`);
}

main();
