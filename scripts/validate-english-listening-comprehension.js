#!/usr/bin/env node
const seedLessons = require('../lib/seed-lessons.json');
const {
  collectStoryLines,
  transcriptSupportsOption
} = require('./content/contextual-listening-comprehension');

const LEVELS = ['B1', 'B2', 'C1', 'C2'];

function normalize(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function validateLesson(row) {
  const content = row.content_json || {};
  const extra = content.extra || {};
  const transcript = extra.mainTranscript || content.transcript || '';
  const storyLines = collectStoryLines(row);
  const questions = extra.listeningComprehension?.questions || [];
  const issues = [];
  const correctAnswers = [];

  if (!extra.storyTitle) issues.push('missing canonical storyTitle');
  if (!transcript) issues.push('missing canonical transcript');
  if (questions.length !== 4) {
    issues.push(`expected 4 questions, found ${questions.length}`);
  }

  questions.forEach((question, index) => {
    const label = `q${index + 1}`;
    const correct = (question.options || []).find(
      (option) => option.id === question.correctOptionId
    );

    if (!correct) {
      issues.push(`${label}: missing correct option`);
      return;
    }

    correctAnswers.push(normalize(correct.text));
    if (!question.prompt?.includes(extra.storyTitle)) {
      issues.push(`${label}: prompt does not use the canonical title`);
    }
    if (!transcriptSupportsOption(transcript, correct.text)) {
      issues.push(`${label}: correct answer is not explicit in the transcript`);
    }
    if (!normalize(question.explanation).includes(normalize(correct.text))) {
      issues.push(`${label}: explanation does not support the correct answer`);
    }
    if (question.evidence && !transcriptSupportsOption(transcript, question.evidence)) {
      issues.push(`${label}: evidence is not explicit in the transcript`);
    }
  });

  if (questions.length === 4 && storyLines.length >= 4) {
    const firstEvidence = questions[0]?.evidence || correctAnswers[0];
    const lastEvidence = questions[3]?.evidence || correctAnswers[3];
    if (normalize(firstEvidence) !== normalize(storyLines[0])) {
      issues.push('q1 does not use the opening statement');
    }
    if (normalize(lastEvidence) !== normalize(storyLines[storyLines.length - 1])) {
      issues.push('q4 does not use the final statement');
    }
  }

  if (new Set(correctAnswers).size !== correctAnswers.length) {
    issues.push('correct answers are duplicated');
  }

  return issues;
}

const lessons = seedLessons.filter(
  (row) =>
    row.target_language === 'english' &&
    LEVELS.includes(row.level) &&
    row.skill === 'listening' &&
    row.unit_slug
);

const affected = lessons
  .map((row) => ({ slug: row.slug, level: row.level, issues: validateLesson(row) }))
  .filter((row) => row.issues.length);

const questionCount = lessons.reduce(
  (total, row) =>
    total +
    (row.content_json?.extra?.listeningComprehension?.questions?.length || 0),
  0
);

if (affected.length) {
  console.error(
    JSON.stringify(
      {
        message: 'English B1-C2 Listening comprehension validation failed.',
        affected
      },
      null,
      2
    )
  );
  process.exit(1);
}

console.log(
  `English B1-C2 Listening comprehension validation: ${lessons.length}/48 lessons and ${questionCount}/192 questions passed.`
);
