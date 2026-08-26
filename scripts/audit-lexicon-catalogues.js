'use strict';

// The adjectives/adverbs reference shelves live inside a browser IIFE. Load
// their published data in an isolated VM so the audit checks the same source
// used by learners, without exposing the catalogue itself as a window API.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const cataloguePath = path.join(__dirname, '..', 'src', 'js', 'lexicon-view.js');
const generatedPath = path.join(__dirname, '..', 'src', 'js', 'lexicon-catalogues.generated.js');
let source = `${fs.readFileSync(generatedPath, 'utf8')}\n${fs.readFileSync(cataloguePath, 'utf8')}`;
const hook = 'window.AndergoLexicon = { render };';
if (!source.includes(hook)) {
  throw new Error('No se pudo cargar el catálogo de referencia para la auditoría.');
}
source = source.replace(hook, 'window.__andergoLexiconAudit = { adjectiveRows, adverbSeeds, practicalExamples };');

const context = {
  window: { addEventListener() {} },
  document: {},
  queueMicrotask() {}
};
vm.runInNewContext(source, context, { filename: cataloguePath });

const catalogue = context.window.__andergoLexiconAudit;
const normalise = (value) =>
  String(value || '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase();

let hasFailures = false;
const targets = { english: 500, spanish: 500, french: 500, italian: 500, portuguese: 500, german: 200 };
console.log('Auditoría de catálogos de adjetivos y adverbios');

for (const [kind, languageCatalogues] of [
  ['adjectiveRows', catalogue.adjectiveRows],
  ['adverbSeeds', catalogue.adverbSeeds]
]) {
  console.log(`\n${kind === 'adjectiveRows' ? 'Adjetivos' : 'Adverbios'}`);
  for (const [language, rows] of Object.entries(languageCatalogues)) {
    const indexesByTerm = new Map();
    rows.forEach((row, index) => {
      const term = normalise(row[0]);
      if (!indexesByTerm.has(term)) indexesByTerm.set(term, []);
      indexesByTerm.get(term).push(index + 1);
    });
    const duplicates = [...indexesByTerm.entries()].filter(
      ([term, indexes]) => term && indexes.length > 1
    );
    const missingTerms = [...indexesByTerm.keys()].filter((term) => !term).length;
    const kindKey = kind === 'adjectiveRows' ? 'adjectives' : 'adverbs';
    const examplesSeen = new Map();
    const invalidRows = [];
    rows.forEach((row, index) => {
      const expectedWidth = kindKey === 'adjectives' ? 5 : 3;
      if (row.slice(0, expectedWidth).some((value) => !String(value || '').trim())) invalidRows.push(index + 1);
      const examples = catalogue.practicalExamples(row, kindKey, language);
      if (!Array.isArray(examples) || examples.length !== 2 || examples.some((value) => String(value || '').trim().length < 10)) {
        invalidRows.push(index + 1);
        return;
      }
      examples.forEach((example) => {
        const key = normalise(example).replace(/[.!?…]+$/u, '');
        if (!examplesSeen.has(key)) examplesSeen.set(key, []);
        examplesSeen.get(key).push(index + 1);
      });
    });
    const repeatedExamples = [...examplesSeen.entries()].filter(([, indexes]) => indexes.length > 1);
    const wrongCount = rows.length !== targets[language];
    const status = duplicates.length || missingTerms || invalidRows.length || repeatedExamples.length || wrongCount ? 'ERROR' : 'OK';
    console.log(`- ${language}: ${rows.length} tarjetas · ${status}`);
    if (duplicates.length) {
      hasFailures = true;
      duplicates.forEach(([term, indexes]) =>
        console.error(`  Repetido: "${term}" (tarjetas ${indexes.join(', ')})`)
      );
    }
    if (missingTerms) {
      hasFailures = true;
      console.error(`  Faltan ${missingTerms} términos.`);
    }
    if (wrongCount) {
      hasFailures = true;
      console.error(`  Cantidad incorrecta: se esperaban ${targets[language]}.`);
    }
    if (invalidRows.length) {
      hasFailures = true;
      console.error(`  Filas incompletas: ${[...new Set(invalidRows)].slice(0, 20).join(', ')}.`);
    }
    if (repeatedExamples.length) {
      hasFailures = true;
      repeatedExamples.slice(0, 20).forEach(([example, indexes]) =>
        console.error(`  Ejemplo repetido: "${example}" (tarjetas ${indexes.join(', ')})`)
      );
    }
  }
}

if (hasFailures) process.exitCode = 1;
