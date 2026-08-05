#!/usr/bin/env node
// Keeps B1-C2 Grammar lessons aligned with the unit syllabus and guarantees
// enough contextual practice before the independent final test.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const lessonsPath = path.join(ROOT, 'lib', 'seed-lessons.json');
const levels = new Set(['B1', 'B2', 'C1', 'C2']);
const languages = new Set(['english', 'french', 'spanish']);

const levelPurpose = {
  B1: 'usar la estructura con autonomía en situaciones habituales y narraciones claras',
  B2: 'combinar forma, significado y matiz al argumentar sobre el tema de la unidad',
  C1: 'controlar la estructura en discurso complejo, con registro y cohesión adecuados',
  C2: 'elegir el recurso con precisión estilística, pragmática y discursiva'
};

const localizedPurpose = {
  english: {
    B1: 'use the structure independently in familiar situations and clear narratives',
    B2: 'combine form, meaning and nuance when discussing the unit topic',
    C1: 'control the structure in complex discourse with appropriate register and cohesion',
    C2: 'select the resource with stylistic, pragmatic and discourse-level precision'
  },
  french: {
    B1: 'employer la structure avec autonomie dans des situations courantes et des récits clairs',
    B2: 'combiner forme, sens et nuance pour argumenter sur le thème de l’unité',
    C1: 'maîtriser la structure dans un discours complexe, cohérent et adapté au registre',
    C2: 'choisir la ressource avec une précision stylistique, pragmatique et discursive'
  },
  spanish: levelPurpose
};

function cleanFrench(text) {
  return String(text || '')
    .replace(/\bque il\b/gi, 'qu’il')
    .replace(/\bque elle\b/gi, 'qu’elle')
    .replace(/\bje ([aeiouyhàâéèêëîïôùûü])/gi, 'j’$1')
    .replace(/\bne ([aeiouyhàâéèêëîïôùûü])/gi, 'n’$1');
}

function toExercise(question, language) {
  const options = (question.options || []).map((option) =>
    language === 'french' ? cleanFrench(option.text) : option.text
  );
  const answer = (question.options || []).findIndex(
    (option) => option.id === question.correctOptionId
  );
  if (options.length !== 4 || answer < 0) return null;
  return {
    type: 'mcq',
    prompt: language === 'french' ? cleanFrench(question.prompt) : question.prompt,
    options,
    answer,
    explanation: language === 'french' ? cleanFrench(question.explanation) : question.explanation
  };
}

function firstText(value, fallback) {
  return String(value || '').trim() || fallback;
}

const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
const upperGrammar = lessons.filter(
  (row) => languages.has(row.target_language) && levels.has(row.level) && row.skill === 'grammar'
);
let expandedPractice = 0;
let completedProfiles = 0;

for (const row of upperGrammar) {
  const content = row.content_json || (row.content_json = {});
  const extra = content.extra || (content.extra = {});
  const test = extra.grammarTest;
  const originalExercises = Array.isArray(content.exercises) ? content.exercises : [];

  // Earlier French courses exposed only four questions and then repeated them
  // in the test. Use the complete, authored application/analysis bank as the
  // guided practice, while preserving the independent eight-question test.
  if (row.target_language === 'french' && originalExercises.length < 8 && test?.questions?.length >= 8) {
    const expanded = test.questions.slice(0, 8).map((question) => toExercise(question, 'french'));
    if (expanded.every(Boolean)) {
      content.exercises = expanded;
      expandedPractice += 1;
    }
  }

  const profile = extra.grammarProfile || {};
  const focus = firstText(profile.name, row.title.replace(/^Gramática\s*·\s*/i, ''));
  const examples = Array.isArray(profile.examples) ? profile.examples.filter(Boolean) : [];
  const exerciseExamples = (content.exercises || [])
    .filter((exercise) => Array.isArray(exercise.options) && Number.isInteger(exercise.answer))
    .map((exercise) => {
      const option = exercise.options[exercise.answer];
      return String(exercise.prompt || '').includes('___')
        ? String(exercise.prompt).replace('___', option)
        : option;
    })
    .filter(Boolean);

  extra.grammarProfile = {
    ...profile,
    name: focus,
    definition: firstText(profile.definition, firstText(content.grammar, row.description)),
    explanation: firstText(profile.explanation, firstText(profile.definition, content.grammar)),
    structure: firstText(profile.structure, `Estructura central: ${focus}.`),
    purpose: firstText(profile.purpose, localizedPurpose[row.target_language][row.level]),
    function: firstText(profile.function, localizedPurpose[row.target_language][row.level]),
    cefrLevel: row.level,
    unitContext: row.description,
    examples: [...examples, ...exerciseExamples].slice(0, 4)
  };
  completedProfiles += 1;
}

const errors = [];
const groups = new Map();
for (const row of upperGrammar) {
  const key = `${row.target_language}:${row.level}`;
  const group = groups.get(key) || [];
  group.push(row);
  groups.set(key, group);
  const content = row.content_json || {};
  const profile = content.extra?.grammarProfile || {};
  const testQuestions = content.extra?.grammarTest?.questions || [];
  if ((content.exercises || []).length < 8) errors.push(`${row.slug}: fewer than 8 practice items`);
  if (testQuestions.length !== 8) errors.push(`${row.slug}: final test must contain 8 questions`);
  for (const field of ['name', 'definition', 'structure', 'function']) {
    if (!String(profile[field] || '').trim()) errors.push(`${row.slug}: missing grammarProfile.${field}`);
  }
  if ((profile.examples || []).length < 2) errors.push(`${row.slug}: fewer than 2 model examples`);
}

for (const [key, rows] of groups) {
  const names = rows.map((row) => row.content_json.extra.grammarProfile.name.toLowerCase());
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicates.length) errors.push(`${key}: repeated focus (${[...new Set(duplicates)].join(', ')})`);
}

if (errors.length) {
  console.error('Upper-level Grammar alignment failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

fs.writeFileSync(lessonsPath, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
console.log(`Aligned ${completedProfiles} B1-C2 Grammar lessons.`);
console.log(`Expanded ${expandedPractice} French lessons to eight contextual practice items.`);
