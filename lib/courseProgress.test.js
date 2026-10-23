const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildSkillProgressSummary } = require('./courseLessonsService');

test('skill progress separates completion from scores and excludes unattempted activities', () => {
  const lessons = [
    { id: 'writing-1', skill: 'writing' },
    { id: 'writing-2', skill: 'writing' },
    { id: 'listening-1', skill: 'listening' },
    { id: 'listening-2', skill: 'listening' },
    { id: 'speaking-1', skill: 'speaking' }
  ];
  const progress = {
    'writing-1': { status: 'completed', best_score: 80 },
    'writing-2': { status: 'in_progress', best_score: null },
    'listening-1': { status: 'completed', best_score: 0 },
    'listening-2': { status: 'completed', best_score: 100 }
  };

  assert.deepEqual(buildSkillProgressSummary(lessons, progress), [
    {
      skill: 'writing',
      completedActivities: 1,
      totalActivities: 2,
      scoredActivities: 1,
      scorePercent: 80
    },
    {
      skill: 'listening',
      completedActivities: 2,
      totalActivities: 2,
      scoredActivities: 2,
      scorePercent: 50
    },
    {
      skill: 'speaking',
      completedActivities: 0,
      totalActivities: 1,
      scoredActivities: 0,
      scorePercent: null
    }
  ]);
});

test('website language selectors expose the published level range for each course', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'script.js'), 'utf8');
  const block = source.match(/const COURSE_LEVELS_BY_LANGUAGE = Object\.freeze\(\{([\s\S]*?)\n\}\);/)?.[1];
  assert.ok(block, 'expected the shared website course-level catalog');
  for (const language of ['english', 'french', 'spanish', 'italian', 'portuguese', 'german']) {
    const entry = block.match(new RegExp(`${language}:\\s*\\[([^\\]]+)\\]`))?.[1];
    assert.ok(entry, `expected a level list for ${language}`);
    const expectedLevels = ['english', 'french', 'spanish'].includes(language)
      ? ['PRE-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
      : ['PRE-A1', 'A1', 'A2', 'B1'];
    assert.deepEqual(
      [...entry.matchAll(/'([^']+)'/g)].map((match) => match[1]),
      expectedLevels,
      `${language} should expose the published web curriculum`
    );
  }
});

test('the route category directory links to every existing learning resource section', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const categoryPanel = html.match(
    /<section class="learning-category-explorer"[\s\S]*?<\/section>/
  )?.[0];
  assert.ok(categoryPanel, 'expected a category directory inside the selected course route');
  for (const category of [
    'Reading',
    'Listening',
    'Speaking',
    'Writing',
    'Gramática',
    'Vocabulario',
    'Readings',
    'Audios y listenings',
    'Verbos',
    'Adverbios',
    'Expresiones útiles',
    'Pruebas',
    'Juegos',
    'Infografías'
  ]) {
    assert.ok(categoryPanel.includes(category), `expected category link for ${category}`);
  }
  for (const target of [
    '#readings',
    '#listenings',
    '#verbs',
    '#vocabulary',
    '#grammar',
    '#adverbs',
    '#usefulExpressions',
    '#games',
    '#infographics'
  ]) {
    assert.ok(categoryPanel.includes(`href="${target}"`), `expected a link to ${target}`);
  }
});
