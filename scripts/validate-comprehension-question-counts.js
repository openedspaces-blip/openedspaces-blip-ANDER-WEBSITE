#!/usr/bin/env node

// A comprehension check should be substantial without becoming a long exam.
// Keep the product rule in one build-time validator so new lesson imports
// cannot silently add a sixth Reading or Listening question.
const fs = require('fs');
const path = require('path');

const MAX_QUESTIONS = 5;
const seedPath = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const rows = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const failures = [];
let readingTests = 0;
let listeningTests = 0;

function assertMaximum(row, label, questions) {
  if (!Array.isArray(questions)) return;
  if (!questions.length) return;
  if (questions.length > MAX_QUESTIONS) {
    failures.push(`${row.slug || row.id || 'lección sin slug'}: ${label} tiene ${questions.length} preguntas (máximo ${MAX_QUESTIONS}).`);
  }
}

rows.forEach((row) => {
  const content = row.content_json || {};
  const readingQuestions = content.reading?.questions;
  if (Array.isArray(readingQuestions) && readingQuestions.length) {
    readingTests += 1;
    assertMaximum(row, 'Reading', readingQuestions);
  }

  // Reading activities grade from content_json.exercises. The normalizer keeps
  // only comprehension MCQs there, so it is the rendered test count.
  if (row.skill === 'reading' && Array.isArray(content.exercises) && content.exercises.length) {
    readingTests += 1;
    assertMaximum(row, 'test de comprensión lectora', content.exercises);
  }

  const listeningQuestions = content.extra?.listeningComprehension?.questions;
  if (Array.isArray(listeningQuestions) && listeningQuestions.length) {
    listeningTests += 1;
    assertMaximum(row, 'Listening', listeningQuestions);
  }
});

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Validación de comprensión aprobada: ${readingTests} tests de Reading y ${listeningTests} de Listening; máximo ${MAX_QUESTIONS} preguntas.`);
