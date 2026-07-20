#!/usr/bin/env node
// Generates selected browser world files from lib/seed-lessons.json.
// Usage: node scripts/sync-worlds-from-seed.js
const fs = require('fs');
const path = require('path');
const seedLessons = require('../lib/seed-lessons.json');
const { sanitizeGrammarTestForClient } = require('../lib/grammarTestSanitizer');
const SEED_UNITS_PATH = path.join(__dirname, '..', 'lib', 'seed-units.json');
const seedUnits = fs.existsSync(SEED_UNITS_PATH) ? require(SEED_UNITS_PATH) : [];

const ROOT = path.join(__dirname, '..');
const LANGUAGES = {
  english: {
    label: 'English',
    comment: 'English world: generated from lib/seed-lessons.json.'
  },
  spanish: {
    label: 'Español',
    comment: 'Spanish world: generated from lib/seed-lessons.json.'
  },
  french: {
    label: 'Français',
    comment: 'French world: generated from lib/seed-lessons.json.'
  },
  italian: {
    label: 'Italiano',
    comment: 'Italian world: generated from lib/seed-lessons.json.'
  },
  german: {
    label: 'Deutsch',
    comment: 'German world: generated from lib/seed-lessons.json.'
  }
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const SKILL_LABELS = {
  listening: 'Listening',
  speaking: 'Speaking',
  writing: 'Writing'
};

function byOrder(a, b) {
  return (a.order_index || 0) - (b.order_index || 0);
}

function getRows(language, level) {
  return seedLessons
    .filter((row) => row.target_language === language && row.level === level)
    .sort(byOrder);
}

function getSkillText(row, fallbackSkill) {
  const content = row?.content_json || {};
  const phrases = content.phrases || [];
  const mission = content.mission || row?.description || '';
  return {
    title: SKILL_LABELS[fallbackSkill] || fallbackSkill,
    text: `${content.level_title || row?.level || ''}: ${mission}`.trim(),
    suggestions: phrases.slice(0, 4)
  };
}

function buildLevelContent(language) {
  const levels = {};

  LEVELS.forEach((level) => {
    const rows = getRows(language, level);
    const bySkill = Object.fromEntries(rows.map((row) => [row.skill, row]));
    const primary = rows[0] || {};
    const primaryContent = primary.content_json || {};
    const readingRow = bySkill.reading || primary;
    const readingContent = readingRow.content_json || primaryContent;

    levels[level] = {
      skills: {
        listening: getSkillText(bySkill.listening, 'listening'),
        speaking: getSkillText(bySkill.speaking, 'speaking'),
        writing: getSkillText(bySkill.writing, 'writing')
      },
      vocab: (primaryContent.vocabulary || [])
        .slice(0, 8)
        .map((item) => [item.word, item.translation]),
      grammar: [
        [level, primaryContent.grammar || 'Guided grammar practice.'],
        [
          'Mission',
          primaryContent.mission || primary.description || 'Complete the guided activity.'
        ]
      ],
      reading: {
        title: `${LANGUAGES[language].label} ${level} Reading`,
        text:
          readingContent.reading?.text || primaryContent.reading?.text || primary.description || '',
        questions: readingContent.reading?.questions || primaryContent.reading?.questions || []
      }
    };
  });

  return levels;
}

// This file is a public static asset shipped to every visitor's browser
// (window.ANDERGO_LANGUAGE_WORLDS, used as offline/no-backend fallback
// content), so the correct answer for each exercise must never end up in
// it - only lib/seed-lessons.json (server-side only) keeps the real answer,
// read by lib/lessonsService.js to grade submissions.
function sanitizeExerciseForClient({ answer, ...rest }) {
  return rest;
}

function shapeBrowserLesson(row) {
  const content = row.content_json || {};
  return {
    slug: row.slug,
    level: row.level,
    skill: row.skill,
    unitId: row.unit_slug || null,
    title: row.title,
    accessTier: row.access_tier || (row.is_free === false ? 'premium' : 'free'),
    isFree: row.is_free !== false,
    xpReward: content.xp_reward || 20,
    orderIndex: row.order_index || 0,
    estimatedMinutes: row.estimated_minutes || 10,
    description: row.description || content.mission || '',
    intro: content.intro || row.description || '',
    mission: content.mission || '',
    grammar: content.grammar || '',
    phrases: content.phrases || [],
    vocabulary: content.vocabulary || [],
    dialogue: content.dialogue || [],
    reading: content.reading || null,
    transcript: content.transcript || '',
    // extra (listeningType/phoneticSupport/speakers/durationSeconds/
    // difficulty) is display-only, safe to ship as-is - except
    // grammarTest/listeningComprehension, which carry correct answers
    // (correctOptionId/acceptedAnswers/correctOrder/explanation) and must
    // go through the same sanitizer as the live API
    // (lib/courseLessonsService.js) so this static bundle can't leak them.
    // `dictation` is deliberately NOT included here: this file is a public
    // static asset (window.ANDERGO_LANGUAGE_WORLDS), and
    // dictation.segments[].text is the answer key for that exercise - only
    // the backend (lib/courseLessonsService.js#checkDictation, reading
    // from lesson_dictation_segments) may ever see it. Offline/no-backend
    // mode simply doesn't support graded dictation, same limitation
    // `answer` already has for mcq exercises in this bundle.
    extra: content.extra
      ? {
          ...content.extra,
          grammarTest: sanitizeGrammarTestForClient(content.extra.grammarTest),
          listeningComprehension: sanitizeGrammarTestForClient(content.extra.listeningComprehension)
        }
      : content.extra || null,
    exercises: (content.exercises || []).map(sanitizeExerciseForClient)
  };
}

// Unit metadata (id/slug/title/order) is invariant per course, so it ships
// in the same static bundle as the lessons - keeps the local-fallback path
// (getLocalFallbackLessons() in script.js) fully unit-aware with zero
// backend dependency. `id` is the slug (not a DB uuid) so it matches
// unitId on the shaped lessons above regardless of data source (see
// lib/courseLessonsService.js#getLessons, which resolves the real
// course_units uuid back to this same slug before it reaches the client).
function buildUnits(language) {
  return seedUnits
    .filter((unit) => unit.target_language === language)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    .map((unit) => ({
      id: unit.slug,
      slug: unit.slug,
      level: unit.level,
      title: unit.title,
      titleEs: unit.title_es || '',
      description: unit.description || '',
      order: unit.order_index || 0,
      // Optional unit-level content (objective/outcomes/grammar/vocabulary/
      // scenario) for the Ruta de aprendizaje's unit overview panel - see
      // src/js/script.js#renderUnitOverviewCard. null for units that don't
      // have it yet.
      unitOverview: unit.unit_overview || null
    }));
}

function buildFile(language) {
  const lessons = seedLessons
    .filter((row) => row.target_language === language)
    .sort(byOrder)
    .map(shapeBrowserLesson);

  return `// src/worlds/${language}/content.js
// ${LANGUAGES[language].comment}
(function () {
  window.ANDERGO_LANGUAGE_WORLDS = window.ANDERGO_LANGUAGE_WORLDS || { levelContent: {}, languageContent: {}, lessons: {} };

  window.ANDERGO_LANGUAGE_WORLDS.levelContent.${language} = ${JSON.stringify(buildLevelContent(language), null, 2)};

  window.ANDERGO_LANGUAGE_WORLDS.lessons = window.ANDERGO_LANGUAGE_WORLDS.lessons || {};
  window.ANDERGO_LANGUAGE_WORLDS.lessons.${language} = ${JSON.stringify(lessons, null, 2)};

  window.ANDERGO_LANGUAGE_WORLDS.units = window.ANDERGO_LANGUAGE_WORLDS.units || {};
  window.ANDERGO_LANGUAGE_WORLDS.units.${language} = ${JSON.stringify(buildUnits(language), null, 2)};
})();
`;
}

function main() {
  Object.keys(LANGUAGES).forEach((language) => {
    const file = path.join(ROOT, 'src', 'worlds', language, 'content.js');
    fs.writeFileSync(file, buildFile(language), 'utf8');
    console.log(`Synced ${path.relative(ROOT, file)}`);
  });
}

main();
