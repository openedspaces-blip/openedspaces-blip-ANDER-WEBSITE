#!/usr/bin/env node
'use strict';

require('dotenv').config();
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const gemini = require('../lib/geminiService');
const translator = require('../lib/translatorService');

const ROOT = path.join(__dirname, '..');
const VIEW_PATH = path.join(ROOT, 'src', 'js', 'lexicon-view.js');
const OUTPUT_PATH = path.join(ROOT, 'src', 'js', 'lexicon-catalogues.generated.js');
const CHECKPOINT_PATH = path.join(os.tmpdir(), 'andergo-lexicon-expansion-checkpoint.json');
const TARGETS = { english: 500, spanish: 500, french: 500, italian: 500, portuguese: 500, german: 200 };
const LANGUAGE_LABELS = { english: 'English', spanish: 'español', french: 'français', italian: 'italiano', portuguese: 'português brasileño', german: 'Deutsch' };
const BATCH_SIZE = 80;
const ADVERB_SUFFIXES = { english: /ly$/i, spanish: /mente$/i, french: /ment$/i, italian: /mente$/i, portuguese: /mente$/i, german: null };
const ADVERB_STOP_WORDS = {
  english: 'the to in that on this by but what new good after first over any way most before off why say through last best something same since under next each with a an and or for of from as at is are was were be been being have has had do does did who whom which'.split(' '),
  spanish: 'no como más ya cuando hasta nada ni solo algo mejor mucho tan mismo cada menos tanto poco cómo contra cual medio bajo noche claro igual derecho que de la el los las un una unos unas y o por para con sin sobre entre desde'.split(' '),
  french: 'pas plus avec si tout même quand non où voir quoi premier vrai droit genre ci que de du des le la les un une et ou pour par sans sous sur chez entre'.split(' '),
  italian: 'non come più ci su tutto perché ne fa quanto dove no vi grande contro quale sotto punto tipo che di del della il lo la i gli le un una e o per con senza tra fra'.split(' '),
  portuguese: 'que não como mais mas porque nada todo maior primeiro segundo meio quanto algo através tanto de do da dos das o a os as um uma e ou por para com sem sob sobre entre'.split(' '),
  german: 'nicht mit ein auf an wie aus nach was man um über da mal durch denn damit ohne etwas wo am im zu zum zur der die das den dem des einer eines eine einen einem und oder für von bei seit gegen'.split(' ')
};
const CURATED_ROW_OVERRIDES = {
  adjectives: {
    portuguese: {
      devido: ['devido', 'debido', 'não habitual', 'não habitual', 'indevido', 'Muitos voos foram cancelados devido ao tufão.', 'O atraso ocorreu devido à forte chuva.']
    }
  }
};

const normalise = (value) => String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

function loadBaseCatalogues() {
  let source = fs.readFileSync(VIEW_PATH, 'utf8');
  source = source.replace('window.AndergoLexicon = { render };', 'window.__catalogues = { adjectiveRows, adverbSeeds };');
  const context = { window: { addEventListener() {} }, document: {}, queueMicrotask() {} };
  vm.runInNewContext(source, context, { filename: VIEW_PATH });
  return context.window.__catalogues;
}

function parseJson(raw) {
  const parsed = JSON.parse(String(raw).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim());
  if (!Array.isArray(parsed)) throw new Error('La respuesta no es un arreglo JSON.');
  return parsed;
}

function validateRow(row, kind, usedTerms, usedExamples) {
  const width = kind === 'adjectives' ? 7 : 5;
  if (!Array.isArray(row) || row.length !== width || row.some((value) => typeof value !== 'string' || !value.trim())) return null;
  const clean = row.map((value) => value.normalize('NFKC').trim().replace(/\s+/g, ' '));
  const term = normalise(clean[0]);
  if (term.length > 46 || /[\d@#$%^*_=[\]{}<>/\\|]/u.test(term) || usedTerms.has(term)) return null;
  const examples = kind === 'adjectives' ? clean.slice(5, 7) : clean.slice(3, 5);
  if (examples.some((example) => example.length < 10 || example.length > 150 || usedExamples.has(normalise(example)))) return null;
  if (kind === 'adverbs') {
    const allowed = new Set(['modo', 'lugar', 'tiempo', 'frecuencia', 'cantidad', 'afirmación', 'duda', 'conector']);
    clean[2] = normalise(clean[2]);
    if (!allowed.has(clean[2])) return null;
  }
  usedTerms.add(term);
  examples.forEach((example) => usedExamples.add(normalise(example)));
  return clean;
}

function promptFor({ kind, language, count, exclusions }) {
  const schema = kind === 'adjectives'
    ? '["lema", "traducción breve al español (al inglés si el idioma es español)", "comparativo correcto o forma equivalente", "superlativo correcto o forma equivalente", "antónimo natural", "ejemplo natural 1", "ejemplo natural 2"]'
    : '["lema", "traducción breve al español (al inglés si el idioma es español)", "categoría", "ejemplo natural 1", "ejemplo natural 2"]';
  return [
    `Genera exactamente ${count} ${kind === 'adjectives' ? 'adjetivos' : 'adverbios y conectores adverbiales'} útiles y vigentes en ${LANGUAGE_LABELS[language]}.`,
    'Destinatarios: estudiantes A1-C2. Prioriza vocabulario común y contemporáneo; después incorpora vocabulario académico o profesional habitual.',
    'No incluyas nombres propios, formas arcaicas, errores, variantes meramente flexionadas del mismo lema ni duplicados artificiales.',
    `No uses estos lemas ya presentes: ${exclusions.join(', ')}.`,
    kind === 'adjectives'
      ? 'Para adjetivos no graduables usa “no habitual” en comparativo y superlativo. El antónimo debe ser real; si no existe uno directo, usa una oposición contextual clara.'
      : 'La categoría debe ser exactamente una de: modo, lugar, tiempo, frecuencia, cantidad, afirmación, duda, conector.',
    'Los dos ejemplos deben ser originales, completos, naturales, distintos y estar enteramente en el idioma del lema. Deben mostrar exactamente ese significado en una situación cotidiana, académica o profesional.',
    'Evita ejemplos metalingüísticos, frases ilógicas, traducciones literales extrañas y la repetición de plantillas.',
    `Devuelve solamente un arreglo JSON válido con este esquema exacto por fila: ${schema}. Sin Markdown ni comentarios.`
  ].join('\n');
}

async function requestBatch(params) {
  const result = await gemini.createResponse({
    instructions: 'Eres un lexicógrafo y docente multilingüe extremadamente preciso. Respondes solo JSON válido.',
    input: promptFor(params), maxOutputTokens: 32768
  });
  return parseJson(result.text);
}

async function translateTerms(terms, sourceLanguage) {
  const targetLanguage = sourceLanguage === 'spanish' ? 'english' : 'spanish';
  const translations = [];
  for (let index = 0; index < terms.length; index += 40) {
    const batch = terms.slice(index, index + 40);
    const result = await translator.translateText({
      text: batch.join('\n'), sourceLanguage, targetLanguage,
      context: 'Lista de lemas de vocabulario para un diccionario educativo. Traduce cada línea de forma breve y conserva exactamente una línea por lema.'
    });
    let lines = result.translatedText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length !== batch.length) {
      lines = [];
      for (const term of batch) {
        const single = await translator.translateText({ text: term, sourceLanguage, targetLanguage });
        lines.push(single.translatedText.trim());
      }
    }
    translations.push(...lines);
    console.log(`translations/${sourceLanguage}: ${Math.min(index + batch.length, terms.length)}/${terms.length}`);
  }
  return translations;
}

async function buildFromSources(base) {
  if (!translator.isTranslatorConfigured()) throw new Error('DEEPL_API_KEY no está configurada.');
  const candidatePath = path.join(os.tmpdir(), 'andergo-lexicon-build', 'lexicon-candidates.json');
  const candidates = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
  const expansion = { adjectives: {}, adverbs: {} };
  const exampleKey = (value) => normalise(value).replace(/[.!?…]+$/u, '');
  for (const kind of ['adjectives', 'adverbs']) {
    const baseGroup = kind === 'adjectives' ? base.adjectiveRows : base.adverbSeeds;
    for (const language of Object.keys(TARGETS)) {
      const required = TARGETS[language] - baseGroup[language].length;
      const baseTerms = new Set(baseGroup[language].map((row) => normalise(row[0])));
      const usedExamples = new Set();
      const selected = [];
      const stopWords = new Set((ADVERB_STOP_WORDS[language] || []).map(normalise));
      const rankedCandidates = [...candidates[kind][language]].sort((left, right) => {
        if (kind !== 'adverbs') return right.score - left.score;
        const suffix = ADVERB_SUFFIXES[language];
        const leftBonus = suffix?.test(left.word) ? 3 : 0;
        const rightBonus = suffix?.test(right.word) ? 3 : 0;
        return (right.score + rightBonus) - (left.score + leftBonus);
      });
      for (const candidate of rankedCandidates) {
        if (baseTerms.has(normalise(candidate.word))) continue;
        if (kind === 'adverbs' && stopWords.has(normalise(candidate.word))) continue;
        const examples = candidate.examples.slice(0, 2);
        const keys = examples.map(exampleKey);
        if (examples.length < 2 || keys[0] === keys[1] || keys.some((key) => usedExamples.has(key))) continue;
        selected.push(candidate);
        keys.forEach((key) => usedExamples.add(key));
        if (selected.length === required) break;
      }
      if (selected.length !== required) throw new Error(`Cobertura insuficiente para ${kind}/${language}: ${selected.length}/${required}.`);
      const translations = await translateTerms(selected.map((row) => row.word), language);
      expansion[kind][language] = selected.map((row, index) => kind === 'adjectives'
        ? [row.word, translations[index], row.comparative, row.superlative, row.antonym, ...row.examples.slice(0, 2)]
        : [row.word, translations[index], row.category, ...row.examples.slice(0, 2)]);
      expansion[kind][language] = expansion[kind][language].map((row) =>
        CURATED_ROW_OVERRIDES[kind]?.[language]?.[normalise(row[0])] || row
      );
    }
  }
  const banner = '/* Generated from Kaikki/Wiktionary and Tatoeba by scripts/generate-lexicon-expansion.js.\n   Frequency-ranked with wordfreq; exact counts, lemmas and examples are audited. */\n';
  const body = `(function () {\n  window.ANDERGO_LEXICON_EXPANSION = ${JSON.stringify(expansion, null, 2)};\n})();\n`;
  fs.writeFileSync(OUTPUT_PATH, banner + body, 'utf8');
  console.log(`Catálogo generado: ${OUTPUT_PATH}`);
}

async function main() {
  const base = loadBaseCatalogues();
  if (process.argv.includes('--exclusions')) {
    const exclusions = { adjectives: {}, adverbs: {} };
    for (const language of Object.keys(TARGETS)) {
      exclusions.adjectives[language] = base.adjectiveRows[language].map((row) => normalise(row[0]));
      exclusions.adverbs[language] = base.adverbSeeds[language].map((row) => normalise(row[0]));
    }
    const exclusionsPath = path.join(os.tmpdir(), 'andergo-lexicon-build', 'lexicon-exclusions.json');
    fs.writeFileSync(exclusionsPath, JSON.stringify(exclusions), 'utf8');
    console.log(exclusionsPath);
    return;
  }
  if (process.argv.includes('--from-sources')) {
    await buildFromSources(base);
    return;
  }
  if (!gemini.isConfigured()) throw new Error('GEMINI_API_KEY no está configurada.');
  const checkpoint = fs.existsSync(CHECKPOINT_PATH) ? JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8')) : { adjectives: {}, adverbs: {} };
  for (const kind of ['adjectives', 'adverbs']) {
    const baseGroup = kind === 'adjectives' ? base.adjectiveRows : base.adverbSeeds;
    for (const language of Object.keys(TARGETS)) {
      checkpoint[kind][language] ||= [];
      const usedTerms = new Set(baseGroup[language].map((row) => normalise(row[0])));
      const usedExamples = new Set();
      checkpoint[kind][language].forEach((row) => {
        usedTerms.add(normalise(row[0]));
        (kind === 'adjectives' ? row.slice(5, 7) : row.slice(3, 5)).forEach((example) => usedExamples.add(normalise(example)));
      });
      const required = TARGETS[language] - baseGroup[language].length;
      while (checkpoint[kind][language].length < required) {
        const remaining = required - checkpoint[kind][language].length;
        const count = Math.min(BATCH_SIZE, remaining);
        let accepted = [];
        for (let attempt = 0; attempt < 4 && !accepted.length; attempt += 1) {
          const rows = await requestBatch({ kind, language, count, exclusions: [...usedTerms].slice(-650) });
          accepted = rows.map((row) => validateRow(row, kind, usedTerms, usedExamples)).filter(Boolean).slice(0, remaining);
        }
        if (!accepted.length) throw new Error(`No se obtuvieron filas válidas para ${kind}/${language}.`);
        checkpoint[kind][language].push(...accepted);
        fs.writeFileSync(CHECKPOINT_PATH, `${JSON.stringify(checkpoint, null, 2)}\n`, 'utf8');
        console.log(`${kind}/${language}: ${baseGroup[language].length + checkpoint[kind][language].length}/${TARGETS[language]}`);
      }
    }
  }
  const banner = '/* Generated by scripts/generate-lexicon-expansion.js.\n   AI-assisted additions validated for exact counts and uniqueness. */\n';
  const body = `(function () {\n  window.ANDERGO_LEXICON_EXPANSION = ${JSON.stringify(checkpoint, null, 2)};\n})();\n`;
  fs.writeFileSync(OUTPUT_PATH, banner + body, 'utf8');
  console.log(`Catálogo generado: ${OUTPUT_PATH}`);
}

main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
