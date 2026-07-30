#!/usr/bin/env node
// Replaces the legacy six flat cards in Spanish A2-C2 with 12 units per
// level and six connected skill activities per unit. Idempotent.
const fs = require('fs');
const path = require('path');
const { LEVELS, buildLevel } = require('./content/spanish-expanded-units');

const ROOT = path.join(__dirname, '..');
const LESSONS_PATH = path.join(ROOT, 'lib', 'seed-lessons.json');
const UNITS_PATH = path.join(ROOT, 'lib', 'seed-units.json');
const SKILLS = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];

function shapeExtra(activity) {
  const extra = {};
  if (activity.listeningType) extra.listeningType = activity.listeningType;
  if (activity.difficulty) extra.difficulty = activity.difficulty;
  if (activity.speakers) extra.speakers = activity.speakers;
  if (activity.transcript) extra.transcript = activity.transcript;
  if (activity.listeningComprehension) {
    extra.listeningComprehension = activity.listeningComprehension;
  }
  if (activity.grammarTest) extra.grammarTest = activity.grammarTest;
  return Object.keys(extra).length ? extra : null;
}

function buildLesson(levelConfig, unit, skill, skillIndex) {
  const activity = unit.activities[skill];
  return {
    slug: `spanish-${levelConfig.level.toLowerCase()}-${unit.slug}-${skill}`,
    target_language: 'spanish',
    level: levelConfig.level,
    skill,
    unit_slug: unit.slug,
    title: activity.title,
    description: activity.description || '',
    order_index: unit.order * 10 + skillIndex,
    estimated_minutes: activity.duration,
    is_free: unit.accessTier !== 'premium',
    content_json: {
      language: 'Español',
      language_key: 'spanish',
      level_title: levelConfig.courseTitle,
      intro: activity.intro || '',
      mission: activity.mission || '',
      grammar: activity.grammarNote || '',
      phrases: activity.phrases || [],
      vocabulary: activity.vocabulary || [],
      dialogue: activity.dialogue || [],
      reading: activity.reading || null,
      transcript: activity.transcript || '',
      exercises: activity.exercises || [],
      extra: shapeExtra(activity),
      xp_reward: activity.xp
    },
    access_tier: unit.accessTier,
    payment_price_usd: 5.95
  };
}

function main() {
  const existingLessons = JSON.parse(fs.readFileSync(LESSONS_PATH, 'utf8'));
  const existingUnits = JSON.parse(fs.readFileSync(UNITS_PATH, 'utf8'));
  const expandedLevels = new Set(LEVELS);
  const keepLessons = existingLessons.filter(
    (row) => !(row.target_language === 'spanish' && expandedLevels.has(row.level))
  );
  const keepUnits = existingUnits.filter(
    (row) => !(row.target_language === 'spanish' && expandedLevels.has(row.level))
  );
  const lessons = [];
  const units = [];

  LEVELS.forEach((level) => {
    const levelConfig = buildLevel(level);
    levelConfig.units.forEach((unit) => {
      units.push({
        slug: unit.slug,
        target_language: 'spanish',
        level,
        title: unit.title,
        title_es: unit.titleEs,
        description: unit.description,
        order_index: unit.order,
        unit_overview: unit.unitOverview
      });
      SKILLS.forEach((skill, skillIndex) => {
        lessons.push(buildLesson(levelConfig, unit, skill, skillIndex));
      });
    });
  });

  fs.writeFileSync(LESSONS_PATH, `${JSON.stringify([...keepLessons, ...lessons], null, 2)}\n`);
  fs.writeFileSync(UNITS_PATH, `${JSON.stringify([...keepUnits, ...units], null, 2)}\n`);
  console.log(
    `Spanish A2-C2: ${units.length} units and ${lessons.length} skill activities generated.`
  );
}

main();
