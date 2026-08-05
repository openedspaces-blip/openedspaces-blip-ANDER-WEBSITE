#!/usr/bin/env node
// Completes the Spanish Grammar teaching contract after the level-specific
// seed builders run: concept profile, eight-question test and balanced keys.
const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const optionIds = ['a', 'b', 'c', 'd'];

function firstParagraph(text) {
  return String(text || '').split(/\n\n+/).map((item) => item.trim()).find(Boolean) || '';
}

function completedSentence(exercise, option) {
  return String(exercise.prompt || '').includes('___')
    ? String(exercise.prompt).replace('___', String(option))
    : String(option);
}

function makeQuestion(row, exercise, index, correction = false) {
  const rawOptions = exercise.options.map((option) => completedSentence(exercise, option));
  const correctText = rawOptions[exercise.answer];
  const firstIncorrect = rawOptions.find((_, optionIndex) => optionIndex !== exercise.answer);
  return {
    id: `${row.slug}-grammar-q${index + 1}`,
    type: 'mcq',
    prompt: correction
      ? `¿Qué opción corrige completamente el ejemplo «${firstIncorrect}»?`
      : exercise.prompt,
    options: rawOptions.map((text, optionIndex) => ({ id: optionIds[optionIndex], text })),
    correctOptionId: optionIds[exercise.answer],
    explanation:
      exercise.explanation ||
      `La forma correcta es «${correctText}» porque respeta la estructura estudiada en esta unidad.`
  };
}

function testFromExercises(row, exercises) {
  const source = exercises.filter(
    (exercise) =>
      exercise?.type === 'mcq' &&
      Array.isArray(exercise.options) &&
      exercise.options.length === 4 &&
      Number.isInteger(exercise.answer)
  );
  if (source.length >= 8) {
    return {
      id: `${row.slug}-grammar-test`,
      passingScore: 70,
      questions: source.slice(0, 8).map((exercise, index) => makeQuestion(row, exercise, index))
    };
  }
  if (source.length >= 4) {
    const core = source.slice(0, 4);
    return {
      id: `${row.slug}-grammar-test`,
      passingScore: 70,
      questions: [
        ...core.map((exercise, index) => makeQuestion(row, exercise, index)),
        ...core.map((exercise, index) => makeQuestion(row, exercise, index + 4, true))
      ]
    };
  }
  return null;
}

const rows = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
let changed = 0;
let createdTests = 0;

for (const row of rows) {
  if (row.target_language !== 'spanish' || row.skill !== 'grammar') continue;
  const content = row.content_json || (row.content_json = {});
  const extra = content.extra || (content.extra = {});
  const exercises = content.exercises || [];
  const generatedTest = testFromExercises(row, exercises);
  if (generatedTest) {
    extra.grammarTest = generatedTest;
    createdTests += 1;
  }

  const examples = exercises
    .filter((exercise) => Array.isArray(exercise.options) && exercise.options[exercise.answer] !== undefined)
    .map((exercise) => completedSentence(exercise, exercise.options[exercise.answer]))
    .slice(0, 4);
  const existing = extra.grammarProfile || {};
  extra.grammarProfile = {
    ...existing,
    name: existing.name || row.title,
    definition: existing.definition || firstParagraph(content.grammar) || row.description,
    structure:
      existing.structure ||
      `Forma que se debe observar: ${row.title}. Compara el tiempo, los conectores, los pronombres y el orden de palabras de los ejemplos.`,
    function:
      existing.function ||
      row.description ||
      `Emplear ${row.title.toLowerCase()} con precisión dentro del tema de la unidad.`,
    examples: existing.examples?.length ? existing.examples : examples
  };

  (extra.grammarTest?.questions || []).forEach((question, questionIndex) => {
    if (!Array.isArray(question.options) || question.options.length !== 4) return;
    const currentIndex = question.options.findIndex((option) => option.id === question.correctOptionId);
    if (currentIndex < 0) return;
    const targetIndex = questionIndex % 4;
    const [correctOption] = question.options.splice(currentIndex, 1);
    question.options.splice(targetIndex, 0, correctOption);
  });
  changed += 1;
}

fs.writeFileSync(seedPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
console.log(`Normalized ${changed} Spanish Grammar lessons from A1 through C2.`);
console.log(`Created or refreshed ${createdTests} eight-question Grammar tests.`);
