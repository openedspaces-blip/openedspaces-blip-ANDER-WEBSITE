#!/usr/bin/env node
// Gives every French Grammar lesson a consistent concept profile after the
// level-specific seed builders have written their canonical lesson rows.
const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'lib', 'seed-lessons.json');

function firstParagraph(text) {
  return String(text || '').split(/\n\n+/).map((item) => item.trim()).find(Boolean) || '';
}

function completedExample(exercise) {
  if (!exercise || !Array.isArray(exercise.options)) return '';
  const answer = exercise.options[exercise.answer];
  if (answer === undefined) return '';
  return String(exercise.prompt || '').includes('___')
    ? String(exercise.prompt).replace('___', String(answer))
    : String(answer);
}

const rows = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
let changed = 0;

for (const row of rows) {
  if (row.target_language !== 'french' || row.skill !== 'grammar') continue;
  const content = row.content_json || (row.content_json = {});
  const extra = content.extra || (content.extra = {});
  const existing = extra.grammarProfile || {};
  const examples = (content.exercises || []).map(completedExample).filter(Boolean).slice(0, 4);
  const definition = existing.definition || firstParagraph(content.grammar) || row.description;
  extra.grammarProfile = {
    ...existing,
    name: existing.name || row.title,
    definition,
    structure:
      existing.structure ||
      `Forme à observer : ${row.title}. Comparez le sujet, le temps, les marqueurs et l’ordre des mots dans les exemples.`,
    function:
      existing.function ||
      row.description ||
      `Employer ${row.title.toLowerCase()} avec précision dans le contexte de l’unité.`,
    examples: existing.examples?.length ? existing.examples : examples
  };
  const testQuestions = extra.grammarTest?.questions || [];
  testQuestions.forEach((question, questionIndex) => {
    if (question.type !== 'mcq' || !Array.isArray(question.options) || question.options.length !== 4) return;
    const currentIndex = question.options.findIndex((option) => option.id === question.correctOptionId);
    if (currentIndex < 0) return;
    const targetIndex = questionIndex % 4;
    const [correctOption] = question.options.splice(currentIndex, 1);
    question.options.splice(targetIndex, 0, correctOption);
  });
  changed += 1;
}

fs.writeFileSync(seedPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
console.log(`Normalized ${changed} French Grammar profiles from A1 through C2.`);
