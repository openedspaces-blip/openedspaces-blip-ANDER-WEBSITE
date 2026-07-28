#!/usr/bin/env node
// scripts/build-english-b1-seed.js
// Folds scripts/content/english-b1-units.js into lib/seed-lessons.json +
// lib/seed-units.json. Mirrors build-english-a2-seed.js, with LEVEL='B1'.
const fs = require('fs');
const path = require('path');
const { units, language, level, courseTitle, courseDescription } = require('./content/english-b1-units');

const ROOT = path.join(__dirname, '..');
const SEED_LESSONS_PATH = path.join(ROOT, 'lib', 'seed-lessons.json');
const SEED_UNITS_PATH = path.join(ROOT, 'lib', 'seed-units.json');

const CORE_SKILLS = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];

function shapeReading(reading) {
  if (!reading) return null;
  if (!reading.parts) return reading;
  return { ...reading, text: reading.parts.join('\n\n') };
}

function shapeExtra(a) {
  const extra = {};
  if (a.grammarTest) extra.grammarTest = a.grammarTest;
  if (a.grammarNote && a.title) {
    extra.grammarProfile = {
      name: a.title,
      definition: a.description || `Use ${a.title} accurately in context.`,
      structure: a.grammarNote,
      function: `Use ${a.title} to communicate clearly in practical B1 situations.`,
      examples: (a.phrases || []).slice(0, 4)
    };
  }
  if (a.listeningType) extra.listeningType = a.listeningType;
  if (a.storyTitle) extra.storyTitle = a.storyTitle;
  if (a.mainTranscript) extra.mainTranscript = a.mainTranscript;
  if (a.transcriptSegments) extra.transcriptSegments = a.transcriptSegments;
  return Object.keys(extra).length ? extra : null;
}

function buildActivityRow(unit, skill, orderInUnit) {
  const a = unit.activities[skill];
  if (!a) throw new Error(`Unit "${unit.slug}" is missing a "${skill}" activity`);

  const accessTier = unit.accessTier || 'free';
  return {
    slug: `english-b1-${unit.slug}-${skill}`,
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

  fs.writeFileSync(SEED_LESSONS_PATH, JSON.stringify([...keep, ...newRows], null, 2) + '\n', 'utf8');

  const unitRows = units.map(buildUnitRow);
  const existingUnits = JSON.parse(fs.readFileSync(SEED_UNITS_PATH, 'utf8'));
  const keepUnits = existingUnits.filter(
    (row) => !(row.target_language === language && row.level === level)
  );
  fs.writeFileSync(SEED_UNITS_PATH, JSON.stringify([...keepUnits, ...unitRows], null, 2) + '\n', 'utf8');

  console.log(
    `Replaced ${removedCount} previous English B1 row(s) with ${newRows.length} unit-scoped activities (${units.length} units x ${CORE_SKILLS.length} skills).`
  );
  console.log(`Wrote ${unitRows.length} unit row(s) to ${path.relative(ROOT, SEED_UNITS_PATH)}.`);
  console.log(`Course: "${courseTitle}" - ${courseDescription}`);
}

main();
