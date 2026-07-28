#!/usr/bin/env node
// Updates only reviewed English A1 Listening question banks in the existing
// seed. It deliberately preserves row order and every other activity field,
// so an editorial Listening change cannot rewrite Grammar or other courses.
const fs = require('fs');
const path = require('path');
const { units } = require('./content/english-a1-units');

const ROOT = path.join(__dirname, '..');
const SEED_LESSONS_PATH = path.join(ROOT, 'lib', 'seed-lessons.json');

const rows = JSON.parse(fs.readFileSync(SEED_LESSONS_PATH, 'utf8'));
const reviewedBySlug = new Map(
  units
    .filter(
      (unit) =>
        unit.activities?.listening?.listeningComprehension?.editoriallyReviewed === true &&
        unit.activities.listening.listeningComprehension.questions?.length === 4
    )
    .map((unit) => [
      `english-a1-${unit.slug}-listening`,
      unit.activities.listening.listeningComprehension
    ])
);

let updated = 0;
for (const row of rows) {
  const reviewed = reviewedBySlug.get(row.slug);
  if (!reviewed) continue;
  row.content_json ||= {};
  row.content_json.extra ||= {};
  row.content_json.extra.listeningComprehension = reviewed;
  row.content_json.exercises = reviewed.questions.map((question) => ({
    type: 'mcq',
    prompt: question.prompt,
    options: question.options.map((option) => option.text),
    answer: question.options.findIndex(
      (option) => option.id === question.correctOptionId
    )
  }));
  updated += 1;
}

if (updated !== reviewedBySlug.size) {
  throw new Error(
    `Expected ${reviewedBySlug.size} reviewed Listening row(s), updated ${updated}.`
  );
}

fs.writeFileSync(SEED_LESSONS_PATH, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
console.log(`Updated ${updated} reviewed English A1 Listening question bank(s).`);
