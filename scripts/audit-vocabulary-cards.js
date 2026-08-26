'use strict';

const lessons = require('../lib/seed-lessons.json');
const TARGET_WORDS_PER_LESSON = 30;
const TARGET_WORDS_PER_LEVEL = 360;
const TARGET_EXPRESSIONS_PER_LEVEL = 140;

const vocabularyLessons = lessons.filter(
  (lesson) => lesson.skill === 'vocabulary' && Array.isArray(lesson.content_json?.vocabulary)
);
const report = {
  lessons: vocabularyLessons.length,
  cards: 0,
  words: 0,
  expressions: 0,
  missingWord: [],
  missingTranslation: [],
  missingExample: [],
  duplicateInLesson: []
};

function normalized(value) {
  return String(value || '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase();
}

for (const lesson of vocabularyLessons) {
  const seen = new Set();
  lesson.content_json.vocabulary.forEach((card, index) => {
    const word = String(card.word || card.targetWord || '').trim();
    const translation = String(
      card.translation || card.meaning || card.l1Translation || card.definition || ''
    ).trim();
    const hasExample = Boolean(
      String(card.example || '').trim() ||
        (Array.isArray(card.contexts) &&
          card.contexts.some((context) =>
            String(context?.targetText || context?.text || context || '').trim()
          ))
    );
    const location = `${lesson.slug}#${index + 1}`;
    const key = normalized(word);

    report.cards += 1;
    if (/\s/.test(word)) report.expressions += 1;
    else report.words += 1;
    if (!word) report.missingWord.push(location);
    if (!translation) report.missingTranslation.push(`${location} (${word || 'sin término'})`);
    if (!hasExample) report.missingExample.push(`${location} (${word || 'sin término'})`);
    if (key && seen.has(key)) report.duplicateInLesson.push(`${location} (${word})`);
    if (key) seen.add(key);
  });
}

console.log('Vocabulary card audit');
console.log(`- Lessons: ${report.lessons}`);
console.log(`- Cards: ${report.cards}`);
console.log(`- Individual words: ${report.words}`);
console.log(`- Multiword expressions: ${report.expressions}`);
console.log(`- Missing terms: ${report.missingWord.length}`);
console.log(`- Missing translations/definitions: ${report.missingTranslation.length}`);
console.log(`- Missing examples: ${report.missingExample.length}`);
console.log(`- Duplicates within a lesson: ${report.duplicateInLesson.length}`);

const failures = [
  ['Missing terms', report.missingWord],
  ['Missing translations/definitions', report.missingTranslation],
  ['Missing examples', report.missingExample],
  ['Duplicates within a lesson', report.duplicateInLesson]
].filter(([, items]) => items.length);

if (failures.length) {
  for (const [label, items] of failures) {
    console.error(`\n${label}:`);
    items.slice(0, 25).forEach((item) => console.error(`  - ${item}`));
    if (items.length > 25) console.error(`  ... and ${items.length - 25} more`);
  }
  process.exitCode = 1;
}

// Curriculum coverage is measured independently from card quality. A level
// is only complete when its twelve Vocabulary lessons supply the promised
// word bank and its reusable-expression bank reaches the stated target.
const coverage = new Map();
for (const lesson of vocabularyLessons) {
  const key = `${lesson.target_language}|${lesson.level}`;
  const item = coverage.get(key) || { lessons: 0, words: new Set(), expressions: new Set(), shortLessons: [] };
  const cards = lesson.content_json.vocabulary || [];
  item.lessons += 1;
  if (cards.length < TARGET_WORDS_PER_LESSON) item.shortLessons.push(lesson.slug);
  for (const card of cards) {
    const term = normalized(card.word || card.targetWord);
    if (!term) continue;
    (/\s/.test(term) ? item.expressions : item.words).add(term);
  }
  for (const phrase of lesson.content_json.phrases || []) {
    const term = normalized(typeof phrase === 'string' ? phrase : phrase.text || phrase.expression);
    if (term) item.expressions.add(term);
  }
  coverage.set(key, item);
}
console.log('\nCurriculum coverage targets');
for (const [key, item] of [...coverage.entries()].sort()) {
  const valid = item.lessons === 12 && item.words.size >= TARGET_WORDS_PER_LEVEL && item.expressions.size >= TARGET_EXPRESSIONS_PER_LEVEL && !item.shortLessons.length;
  console.log(`- ${key}: ${item.lessons}/12 lessons · ${item.words.size}/${TARGET_WORDS_PER_LEVEL} words · ${item.expressions.size}/${TARGET_EXPRESSIONS_PER_LEVEL} expressions · ${valid ? 'READY' : 'INCOMPLETE'}`);
}
