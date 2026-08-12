#!/usr/bin/env node
// Creates the private build cache used by build-european-verb-catalogues.js.
// It translates the English frequency glosses for the extended German verb
// catalogue into Spanish (the L1 used by the German routes).  This script is
// a build-time utility only: the browser never receives a DeepL credential.
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ROOT = path.join(__dirname, '..');
const TMP = path.join(ROOT, 'tmp');
const input = JSON.parse(fs.readFileSync(path.join(TMP, 'german_5k.json'), 'utf8').replace(/^\uFEFF/, ''));
const outputPath = path.join(TMP, 'german-verb-spanish-glosses.json');
const endpoint = `${String(process.env.DEEPL_API_BASE_URL || '').replace(/\/+$/, '')}/v2/translate`;

if (!process.env.DEEPL_API_KEY || !process.env.DEEPL_API_BASE_URL) {
  throw new Error('DEEPL_API_KEY and DEEPL_API_BASE_URL are required to build Spanish German glosses.');
}

const unique = (values) => [...new Set(values.filter(Boolean).map((value) => String(value).trim()))];
const germanRows = input
  .filter((item) => item.pos === 'verb' && /(?:en|n)$/i.test(item.word) && item.word.length > 3)
  .filter((item, index, rows) => rows.findIndex((other) => other.word.toLowerCase() === item.word.toLowerCase()) === index)
  .slice(0, 1200);
const glosses = unique(germanRows.map((item) => item.english_translation || 'German verb'));

const existing = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, 'utf8')) : {};
const pending = glosses.filter((gloss) => !existing[gloss]);

async function translateBatch(text) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, source_lang: 'EN', target_lang: 'ES', context: 'Glosses for an educational German verb catalogue. Return concise dictionary-style Spanish meanings.' })
  });
  if (!response.ok) throw new Error(`DeepL failed with status ${response.status}.`);
  const data = await response.json();
  if (!Array.isArray(data.translations) || data.translations.length !== text.length) {
    throw new Error('DeepL returned an incomplete German verb gloss batch.');
  }
  return data.translations.map((item) => item.text.trim());
}

(async () => {
  const batchSize = 25;
  for (let index = 0; index < pending.length; index += batchSize) {
    const batch = pending.slice(index, index + batchSize);
    const translations = await translateBatch(batch);
    batch.forEach((source, itemIndex) => { existing[source] = translations[itemIndex]; });
    fs.writeFileSync(outputPath, `${JSON.stringify(existing, null, 2)}\n`, 'utf8');
    console.log(`Translated ${Math.min(index + batch.length, pending.length)}/${pending.length} German verb glosses.`);
  }
  console.log(`Spanish gloss cache ready: ${Object.keys(existing).length} entries.`);
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
