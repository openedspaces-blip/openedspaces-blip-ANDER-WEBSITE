#!/usr/bin/env node
// scripts/build-french-b2-seed.js
// Folds scripts/content/french-b2-units.js (hand-authored units) into
// lib/seed-lessons.json/lib/seed-units.json, additively - only rows with
// target_language 'french' and level 'B2' are replaced, so this never
// touches the existing French A1/A2/B1 rows. Mirrors
// scripts/build-french-a1-seed.js exactly (see that file's header for the
// full pipeline explanation). Run this, then `npm run sync:worlds` to
// regenerate the browser fallback bundles, and a French B2 equivalent of
// scripts/migrate-french-a1-units.js to push into Supabase (not created
// yet - do not run against Supabase without explicit sign-off). Idempotent:
// safe to re-run.
const fs = require('fs');
const path = require('path');
const { units, language, level, courseTitle, courseDescription } = require('./content/french-b2-units');

const ROOT = path.join(__dirname, '..');
const SEED_LESSONS_PATH = path.join(ROOT, 'lib', 'seed-lessons.json');
const SEED_UNITS_PATH = path.join(ROOT, 'lib', 'seed-units.json');

const CORE_SKILLS = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];

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
    slug: `french-b2-${unit.slug}-${skill}`,
    target_language: language,
    level,
    skill,
    unit_slug: unit.slug,
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
    order_index: unit.order,
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
    `Replaced ${removedCount} legacy French B2 row(s) with ${newRows.length} unit-scoped activities (${units.length} units).`
  );
  console.log(`Wrote ${unitRows.length} unit rows to ${path.relative(ROOT, SEED_UNITS_PATH)}.`);
  console.log(`Course: "${courseTitle}" - ${courseDescription}`);
}

main();
