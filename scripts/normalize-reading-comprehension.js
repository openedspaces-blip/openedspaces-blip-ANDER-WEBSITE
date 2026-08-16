#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const lessons = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const PROMPTS = {
  english: [
    'Complete this detail from the text.',
    'Which word completes this sentence from the reading?',
    'Choose the missing word from the text.',
    'What is the exact missing word in this detail?',
    'According to the text, which word belongs in the blank?'
  ],
  spanish: [
    'Completa este detalle de la lectura.',
    '¿Qué palabra completa esta oración del texto?',
    'Elige la palabra que falta en la lectura.',
    '¿Cuál es la palabra exacta que falta en este detalle?',
    'Según el texto, ¿qué palabra corresponde en el espacio?'
  ],
  french: [
    'Complète ce détail de la lecture.',
    'Quel mot complète cette phrase du texte ?',
    'Choisis le mot manquant dans la lecture.',
    'Quel est le mot exact qui manque dans ce détail ?',
    'Selon le texte, quel mot convient dans l’espace ?'
  ],
  italian: [
    'Completa questo dettaglio della lettura.',
    'Quale parola completa questa frase del testo?',
    'Scegli la parola mancante nella lettura.',
    'Qual è la parola esatta che manca in questo dettaglio?',
    'Secondo il testo, quale parola va nello spazio?'
  ],
  portuguese: [
    'Complete este detalhe da leitura.',
    'Qual palavra completa esta frase do texto?',
    'Escolha a palavra que falta na leitura.',
    'Qual é a palavra exata que falta neste detalhe?',
    'Segundo o texto, qual palavra pertence ao espaço?'
  ],
  german: [
    'Vervollständige dieses Detail aus dem Text.',
    'Welches Wort ergänzt diesen Satz aus dem Text?',
    'Wähle das fehlende Wort aus der Lektüre.',
    'Welches genaue Wort fehlt in diesem Detail?',
    'Welches Wort gehört laut Text in die Lücke?'
  ]
};

const STOP_WORDS = new Set([
  'this', 'that', 'with', 'from', 'have', 'been', 'were', 'will', 'would', 'there',
  'their', 'they', 'them', 'about', 'after', 'before', 'because', 'which', 'where',
  'when', 'what', 'your', 'and', 'one', 'two', 'three', 'old', 'the', 'are', 'is',
  'was', 'for', 'you', 'our', 'his', 'her', 'its', 'pour', 'avec', 'dans', 'mais', 'nous',
  'vous', 'elle', 'elles', 'sont', 'être', 'avoir', 'comme', 'para', 'desde', 'sobre',
  'pero', 'porque', 'cuando', 'donde', 'ellos', 'ellas', 'usted', 'nosotros', 'también',
  'quiere', 'della', 'delle', 'questa', 'questo', 'sono', 'come', 'anche', 'eine', 'einen',
  'einer', 'eines', 'nicht', 'auch', 'diese', 'dieser', 'diesem', 'com', 'uma', 'que',
  'está', 'estão'
]);

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function uniqueTexts(values) {
  const seen = new Set();
  return values.filter((value) => {
    const text = cleanText(value);
    const key = text.toLocaleLowerCase();
    if (!text || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isComprehensionQuestion(exercise) {
  if (exercise?.type !== 'mcq') return false;
  const prompt = String(exercise.prompt || '');
  return !(
    (exercise.options || []).length === 2 ||
    /^(true or false|vrai ou faux|verdadero o falso)\b/i.test(prompt)
  );
}

function isGenericExercise(exercise) {
  const answer = String(exercise?.options?.[exercise?.answer] || '');
  const text = `${exercise?.prompt || ''} ${answer}`;
  return /central ideas and details|idées et les détails essentiels|ideas y los detalles esenciales|ideias e os detalhes essenciais|idee e i dettagli essenziali|wichtigsten Ideen und Details|unrelated topic|sujet sans rapport|tema sin relación|argomento non correlato|nicht verwandtes Thema/i.test(text);
}

function hasForeignCopy(exercise, language) {
  if (!['portuguese', 'italian'].includes(language)) return false;
  const text = [exercise?.prompt, ...(exercise?.options || [])].join(' ');
  return /\b(what|which|to explain|to discuss|to provide|tell a story)\b|[¿]|\b(qu[eé]|una regla aislada|un examen t[eé]cnico|tema sin contexto|memoriza sin usar|evita hablar|solo traduce)\b/i.test(text);
}

function readingText(row) {
  const reading = row.content_json?.reading || {};
  return cleanText(reading.text || (reading.parts || []).join(' ') || row.content_json?.transcript);
}

function sentencesFromReading(row) {
  return uniqueTexts(
    readingText(row)
      .split(/(?<=[.!?…])(?:[”»])?\s+/u)
      .map(cleanText)
      .filter((sentence) => sentence.split(/\s+/).length >= 3)
  );
}

function lexicalTokens(value) {
  return cleanText(value).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || [];
}

function chooseFocusToken(sentence, index) {
  const candidates = lexicalTokens(sentence).filter((token) => {
    const normalized = token.toLocaleLowerCase();
    return token.length >= 3 && !STOP_WORDS.has(normalized) && !/^\d{1,4}$/u.test(token);
  });
  const preferred = candidates.filter(
    (token) => /^[A-ZÁÉÍÓÚÜÑÀÂÇÈÊËÎÏÔÙÛÜŸ]/u.test(token) || token.length >= 6
  );
  const pool = preferred.length ? preferred : candidates;
  return pool[(index * 2 + pool.length - 1) % pool.length];
}

function selectSpread(lines, count) {
  if (lines.length <= count) return lines;
  return uniqueTexts(
    Array.from({ length: count }, (_, index) =>
      lines[Math.round((index * (lines.length - 1)) / (count - 1))]
    )
  );
}

function arrangeWithCorrectAt(distractors, answer, correctIndex) {
  const options = [];
  let distractorIndex = 0;
  for (let index = 0; index < 4; index += 1) {
    options.push(index === correctIndex ? answer : distractors[distractorIndex++]);
  }
  return options;
}

function contextualQuestion(row, index, sourceLines) {
  const sentence = sourceLines[index % sourceLines.length];
  const answer = chooseFocusToken(sentence, index);
  const allTokens = uniqueTexts(sourceLines.flatMap(lexicalTokens));
  const distractors = allTokens
    .filter((token) => token.toLocaleLowerCase() !== answer?.toLocaleLowerCase())
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token.toLocaleLowerCase()))
    .sort((a, b) => Math.abs(a.length - answer.length) - Math.abs(b.length - answer.length))
    .slice(0, 3);
  if (!answer || distractors.length < 3) {
    throw new Error(`${row.slug}: no se pudieron crear cuatro opciones verificables para Reading.`);
  }
  const language = PROMPTS[row.target_language] ? row.target_language : 'english';
  return {
    id: `${row.slug}-comprehension-${index + 1}`,
    type: 'mcq',
    prompt: `${PROMPTS[language][index % PROMPTS[language].length]}\n\n“${sentence.replace(String(answer), '_____')}”`,
    options: arrangeWithCorrectAt(distractors, answer, index % 4),
    answer: index % 4
  };
}

let changed = 0;
let replacedGeneric = 0;
for (const row of lessons) {
  if (String(row.skill).toLowerCase() !== 'reading') continue;
  // Legacy language-lab placeholders are not exposed through a learning
  // route and do not contain a reading text from which a valid question can
  // be derived.
  if (!row.unit_slug) continue;
  const targetCount = row.level === 'A1' ? 4 : 5;
  const current = row.content_json?.exercises || [];
  const candidates = current.filter(
    (exercise) => isComprehensionQuestion(exercise) && !isGenericExercise(exercise) && !hasForeignCopy(exercise, row.target_language)
  );
  replacedGeneric += current.filter(isGenericExercise).length;
  const selected = candidates.slice(0, targetCount);
  const sourceLines = selectSpread(sentencesFromReading(row), targetCount);
  if (sourceLines.length < targetCount - selected.length) {
    throw new Error(`${row.slug}: el texto no contiene suficientes detalles para completar la comprensión.`);
  }
  while (selected.length < targetCount) {
    selected.push(contextualQuestion(row, selected.length, sourceLines));
  }
  row.content_json.exercises = selected;
  changed += 1;
}

fs.writeFileSync(seedPath, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
console.log(`Normalized ${changed} reading lessons and replaced ${replacedGeneric} generic questions with text-grounded items.`);
