#!/usr/bin/env node
// Builds browser-safe catalogues of 1,000+ infinitives for Italian,
// Portuguese and German from the public frequency/conjugation sources kept
// temporarily in tmp/. The generated file contains only the learner-facing
// data and is the source shipped by the static site.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, 'tmp', file), 'utf8').replace(/^\uFEFF/, '');
const unique = (rows, getKey) => rows.filter((row, index) => rows.findIndex((other) => getKey(other) === getKey(row)) === index);
const levelForRank = (rank) => rank <= 180 ? 'A1' : rank <= 400 ? 'A2' : rank <= 650 ? 'B1' : rank <= 850 ? 'B2' : rank <= 1050 ? 'C1' : 'C2';

const italianRaw = JSON.parse(read('italian_5k.json'));
const italian = unique(
  italianRaw
    .filter((item) => item.pos === 'verb' && /(?:are|ere|ire|rre)$/i.test(item.word) && item.word.length > 3)
    .map((item) => ({ infinitive: item.word.toLowerCase(), translation: item.english_translation || 'verb italiano', example: item.example_sentence_native || '' })),
  (item) => item.infinitive
).slice(0, 1100);

const portugueseRows = read('pt_1000verbs.csv').split(/\r?\n/).slice(2).map((line) => line.split(';'));
const portuguese = unique(
  portugueseRows
    .filter((row) => /^[a-záàâãçéêíóôõúü-]+$/i.test(row[0] || ''))
    .map((row) => ({ infinitive: row[0].toLowerCase(), translation: 'verbo portugués frecuente', example: row[2] || '', present: row[6] || '', past: row[12] || '', participle: row[75] || '' })),
  (item) => item.infinitive
).slice(0, 1000);

const germanRaw = JSON.parse(read('german_5k.json'));
const german = unique(
  germanRaw
    .filter((item) => item.pos === 'verb' && /(?:en|n)$/i.test(item.word) && item.word.length > 3)
    .map((item) => ({ infinitive: item.word.toLowerCase(), translation: item.english_translation || 'German verb', example: item.example_sentence_native || '' })),
  (item) => item.infinitive
).slice(0, 1200);

function regularForms(language, infinitive) {
  if (language === 'german') {
    const stem = infinitive.replace(/en$/, '');
    return { thirdPersonSingular: `${stem}t`, pastSimple: `hat ${stem}t`, pastParticiple: `ge${stem}t`, presentParticiple: '—' };
  }
  const stem = infinitive.slice(0, -2);
  if (language === 'italian') return { thirdPersonSingular: `${stem}${infinitive.endsWith('are') ? 'a' : infinitive.endsWith('ire') ? 'e' : 'e'}`, pastSimple: `${stem}${infinitive.endsWith('are') ? 'ato' : 'uto'}`, pastParticiple: `${stem}${infinitive.endsWith('are') ? 'ato' : 'uto'}`, presentParticiple: '—' };
  return { thirdPersonSingular: `${stem}${infinitive.endsWith('ar') ? 'a' : 'e'}`, pastSimple: `${stem}${infinitive.endsWith('ar') ? 'ou' : 'eu'}`, pastParticiple: `${stem}${infinitive.endsWith('ar') ? 'ado' : 'ido'}`, presentParticiple: '—' };
}

function shape(language, rows) {
  return rows.map((row, index) => {
    const rank = index + 1;
    const level = levelForRank(rank);
    const fallback = regularForms(language, row.infinitive);
    return {
      id: `verb-${language}-${row.infinitive.replace(/\s+/g, '-')}`,
      language, rank, infinitive: row.infinitive, regular: true,
      group: language === 'italian' ? `verbi in -${row.infinitive.slice(-3)}` : language === 'portuguese' ? `verbos em -${row.infinitive.slice(-2)}` : 'Verb',
      level,
      forms: { thirdPersonSingular: row.present || fallback.thirdPersonSingular, pastSimple: row.past || fallback.pastSimple, pastParticiple: row.participle || fallback.pastParticiple, presentParticiple: fallback.presentParticiple },
      translation: { spanish: row.translation },
      directDefinition: { [language]: row.translation },
      pronunciation: '', audioText: row.infinitive,
      examples: { affirmative: row.example || '', negative: '', interrogative: '' },
      commonCollocations: [], synonyms: [], antonyms: [],
      notes: `Catálogo de frecuencia · ${level}.`
    };
  });
}

const catalogues = { italian: shape('italian', italian), portuguese: shape('portuguese', portuguese), german: shape('german', german) };
const output = `// Generated frequency catalogues for Italian, Brazilian Portuguese and German.\n// Sources: public language-learning frequency datasets; see scripts/build-european-verb-catalogues.js.\n(function () {\n  const data = window.ANDERGO_VERBS_DATA = window.ANDERGO_VERBS_DATA || {};\n  const catalogues = ${JSON.stringify(catalogues)};\n  // Preserve the curated L1-Spanish core instead of replacing it with source\n  // rows that may only provide an English support gloss.\n  const targetSizes = { italian: 1100, portuguese: 1000, german: 1200 };\n  Object.entries(catalogues).forEach(([language, rows]) => {\n    const curated = Array.isArray(data[language]) ? data[language] : [];\n    const knownInfinitives = new Set(curated.map((verb) => String(verb.infinitive || '').toLocaleLowerCase()));\n    const available = Math.max(0, (targetSizes[language] || rows.length) - curated.length);\n    const additions = rows\n      .filter((verb) => !knownInfinitives.has(String(verb.infinitive || '').toLocaleLowerCase()))\n      .slice(0, available)\n      .map((verb, index) => ({ ...verb, rank: curated.length + index + 1 }));\n    data[language] = [...curated, ...additions];\n  });\n})();\n`;
fs.writeFileSync(path.join(ROOT, 'src', 'js', 'verbs', 'european-verb-catalogues.js'), output, 'utf8');
console.log(`Italian: ${italian.length}; Portuguese: ${portuguese.length}; German: ${german.length}.`);
