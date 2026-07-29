#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const lessons = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const COPY = {
  english: {
    prompts: [
      (title) => `What is the main purpose of “${title}”?`,
      (title) => `Which statement best summarizes “${title}”?`
    ],
    correct: (title) => `To explain the central ideas and details of ${title}`,
    distractors: [
      'To discuss an unrelated topic',
      'To provide a list without context',
      'To tell a story with no connection to the topic'
    ]
  },
  french: {
    prompts: [
      (title) => `Quel est l’objectif principal de « ${title} » ?`,
      (title) => `Quelle affirmation résume le mieux « ${title} » ?`
    ],
    correct: (title) => `Présenter les idées et les détails essentiels de ${title}`,
    distractors: [
      'Présenter un sujet sans rapport',
      'Donner une liste sans contexte',
      'Raconter une histoire sans lien avec le thème'
    ]
  },
  spanish: {
    prompts: [
      (title) => `¿Cuál es el propósito principal de «${title}»?`,
      (title) => `¿Qué afirmación resume mejor «${title}»?`
    ],
    correct: (title) => `Presentar las ideas y los detalles esenciales de ${title}`,
    distractors: [
      'Presentar un tema sin relación',
      'Dar una lista sin contexto',
      'Contar una historia sin conexión con el tema'
    ]
  },
  italian: {
    prompts: [
      (title) => `Qual è lo scopo principale di «${title}»?`,
      (title) => `Quale frase riassume meglio «${title}»?`
    ],
    correct: (title) => `Presentare le idee e i dettagli essenziali di ${title}`,
    distractors: [
      'Presentare un argomento non correlato',
      'Fornire un elenco senza contesto',
      'Raccontare una storia senza legame con il tema'
    ]
  },
  german: {
    prompts: [
      (title) => `Was ist der Hauptzweck von „${title}“?`,
      (title) => `Welche Aussage fasst „${title}“ am besten zusammen?`
    ],
    correct: (title) => `Die wichtigsten Ideen und Details von ${title} darstellen`,
    distractors: [
      'Ein nicht verwandtes Thema darstellen',
      'Eine Liste ohne Kontext geben',
      'Eine Geschichte ohne Bezug zum Thema erzählen'
    ]
  }
};

function isComprehensionQuestion(exercise) {
  if (exercise?.type !== 'mcq') return false;
  const prompt = String(exercise.prompt || '');
  return !(
    (exercise.options || []).length === 2 ||
    /^(true or false|vrai ou faux|verdadero o falso)\b/i.test(prompt)
  );
}

function supplementalQuestion(row, index) {
  const language = COPY[row.target_language] ? row.target_language : 'english';
  const copy = COPY[language];
  const title = row.content_json?.reading?.title || row.title || 'the text';
  return {
    id: `${row.slug}-comprehension-${index + 1}`,
    type: 'mcq',
    prompt: copy.prompts[index % copy.prompts.length](title),
    options: [copy.correct(title), ...copy.distractors],
    answer: 0
  };
}

let changed = 0;
for (const row of lessons) {
  if (String(row.skill).toLowerCase() !== 'reading') continue;
  const targetCount = row.level === 'A1' ? 4 : 5;
  const current = row.content_json?.exercises || [];
  const selected = current.filter(isComprehensionQuestion).slice(0, targetCount);
  while (selected.length < targetCount) {
    selected.push(supplementalQuestion(row, selected.length));
  }
  row.content_json.exercises = selected;
  changed += 1;
}

fs.writeFileSync(seedPath, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
console.log(`Normalized ${changed} reading lessons: A1 has 4 questions; A2-C2 have 5.`);
