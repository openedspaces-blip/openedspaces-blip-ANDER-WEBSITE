#!/usr/bin/env node
// Replaces the six legacy generic French C2 activities with twelve
// unit-scoped Reading/Vocabulary/Grammar sequences (36 lessons total).
const fs = require('fs');
const path = require('path');
const {
  units,
  language,
  level,
  courseTitle,
  courseDescription
} = require('./content/french-c2-units');

const root = path.join(__dirname, '..');
const lessonsPath = path.join(root, 'lib', 'seed-lessons.json');
const unitsPath = path.join(root, 'lib', 'seed-units.json');
const skills = ['reading', 'vocabulary', 'grammar'];

function lessonRow(unit, skill, index) {
  const lesson = unit.activities[skill];
  const extra = {};
  if (lesson.grammarTest) extra.grammarTest = lesson.grammarTest;
  if (lesson.grammarProfile) extra.grammarProfile = lesson.grammarProfile;
  const readingReferences = lesson.readingReferences || lesson.reading?.references;
  if (Array.isArray(readingReferences) && readingReferences.length) {
    extra.readingReferences = readingReferences;
  }
  const reading = lesson.reading
    ? {
        ...lesson.reading,
        text:
          lesson.reading.text ||
          (Array.isArray(lesson.reading.parts) ? lesson.reading.parts.join('\n\n') : '')
      }
    : null;
  return {
    slug: `french-c2-${unit.slug}-${skill}`,
    target_language: language,
    level,
    skill,
    unit_slug: unit.slug,
    title: lesson.title,
    description: lesson.description || '',
    order_index: unit.order * 10 + index,
    estimated_minutes: lesson.duration,
    is_free: unit.accessTier !== 'premium',
    access_tier: unit.accessTier,
    content_json: {
      language: 'Français',
      language_key: language,
      level_title: courseTitle,
      grammar: lesson.grammarNote || '',
      phrases: lesson.phrases || [],
      vocabulary: lesson.vocabulary || [],
      reading,
      exercises: lesson.exercises || [],
      extra: Object.keys(extra).length ? extra : null,
      xp_reward: lesson.xp
    }
  };
}

const previousLessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
const retainedLessons = previousLessons.filter(
  (row) => !(row.target_language === language && row.level === level)
);
const nextLessons = units.flatMap((unit) =>
  skills.map((skill, index) => lessonRow(unit, skill, index))
);
fs.writeFileSync(
  lessonsPath,
  `${JSON.stringify([...retainedLessons, ...nextLessons], null, 2)}\n`,
  'utf8'
);

const previousUnits = JSON.parse(fs.readFileSync(unitsPath, 'utf8'));
const retainedUnits = previousUnits.filter(
  (row) => !(row.target_language === language && row.level === level)
);
const nextUnits = units.map((unit) => ({
  slug: unit.slug,
  target_language: language,
  level,
  title: unit.title,
  title_es: unit.titleEs || unit.title,
  description: unit.description,
  order_index: unit.order,
  unit_overview: unit.unitOverview
}));
fs.writeFileSync(
  unitsPath,
  `${JSON.stringify([...retainedUnits, ...nextUnits], null, 2)}\n`,
  'utf8'
);

console.log(
  `Remplacé ${previousLessons.length - retainedLessons.length} activités historiques par ${nextLessons.length} activités Français C2.`
);
console.log(`Créé ${nextUnits.length} unités : Reading, Vocabulary et Grammar.`);
console.log(`Cours : ${courseTitle} — ${courseDescription}`);
