#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { units, language, level, courseTitle } = require('./content/english-b2-units');

const root = path.join(__dirname, '..');
const lessonsPath = path.join(root, 'lib', 'seed-lessons.json');
const unitsPath = path.join(root, 'lib', 'seed-units.json');
const skills = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];

function activityRow(unit, skill, index) {
  const activity = unit.activities[skill];
  const accessTier = unit.accessTier || 'free';
  const extra = {};
  if (activity.grammarTest) extra.grammarTest = activity.grammarTest;
  if (activity.listeningComprehension) extra.listeningComprehension = activity.listeningComprehension;
  if (activity.grammarProfile) extra.grammarProfile = activity.grammarProfile;
  if (activity.listeningType) extra.listeningType = activity.listeningType;
  if (activity.difficulty) extra.difficulty = activity.difficulty;
  if (activity.durationSeconds) extra.durationSeconds = activity.durationSeconds;
  if (activity.speakers) extra.speakers = activity.speakers;
  if (activity.phoneticSupport) extra.phoneticSupport = activity.phoneticSupport;
  if (activity.communicationGuide) extra.communicationGuide = activity.communicationGuide;
  if (activity.writingGuide) extra.writingGuide = activity.writingGuide;
  return {
    slug: `english-b2-${unit.slug}-${skill}`,
    target_language: language,
    level,
    skill,
    unit_slug: unit.slug,
    title: activity.title,
    description: activity.description || '',
    order_index: unit.order * 10 + index,
    estimated_minutes: activity.duration,
    is_free: accessTier !== 'premium',
    access_tier: accessTier,
    content_json: {
      language: 'English',
      language_key: language,
      level_title: courseTitle,
      intro: activity.intro || '',
      mission: activity.mission || '',
      grammar: activity.grammarNote || '',
      phrases: activity.phrases || [],
      vocabulary: activity.vocabulary || [],
      dialogue: activity.dialogue || [],
      reading: activity.reading || null,
      transcript: activity.transcript || '',
      dictation: activity.dictation || null,
      exercises: activity.exercises || [],
      extra: Object.keys(extra).length ? extra : null,
      xp_reward: activity.xp
    }
  };
}

const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8')).filter(
  (row) => !(row.target_language === language && row.level === level)
);
const nextLessons = units.flatMap((unit) => skills.map((skill, index) => activityRow(unit, skill, index)));
fs.writeFileSync(lessonsPath, `${JSON.stringify([...lessons, ...nextLessons], null, 2)}\n`, 'utf8');

const existingUnits = JSON.parse(fs.readFileSync(unitsPath, 'utf8')).filter(
  (row) => !(row.target_language === language && row.level === level)
);
const nextUnits = units.map((unit) => ({
  slug: unit.slug,
  target_language: language,
  level,
  title: unit.title,
  title_es: unit.titleEs || '',
  description: unit.description || '',
  order_index: unit.order,
  unit_overview: unit.unitOverview || null
}));
fs.writeFileSync(unitsPath, `${JSON.stringify([...existingUnits, ...nextUnits], null, 2)}\n`, 'utf8');
console.log(`Built ${nextUnits.length} English B2 units and ${nextLessons.length} activities.`);
