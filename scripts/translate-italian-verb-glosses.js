#!/usr/bin/env node
// Private build cache for the Italian frequency catalogue. It turns the
// source's English glosses into concise Spanish L1 meanings before the
// browser-safe catalogue is generated.
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ROOT = path.join(__dirname, '..');
const TMP = path.join(ROOT, 'tmp');
const input = JSON.parse(fs.readFileSync(path.join(TMP, 'italian_5k.json'), 'utf8').replace(/^\uFEFF/, ''));
const outputPath = path.join(TMP, 'italian-verb-spanish-glosses.json');
const endpoint = `${String(process.env.DEEPL_API_BASE_URL || '').replace(/\/+$/, '')}/v2/translate`;

if (!process.env.DEEPL_API_KEY || !process.env.DEEPL_API_BASE_URL) {
  throw new Error('DEEPL_API_KEY and DEEPL_API_BASE_URL are required to build Spanish Italian glosses.');
}

const rows = input
  .filter((item) => item.pos === 'verb' && /(?:are|ere|ire|rre)$/i.test(item.word) && item.word.length > 3)
  .filter((item, index, values) => values.findIndex((other) => other.word.toLowerCase() === item.word.toLowerCase()) === index)
  .slice(0, 1100);
const glosses = [...new Set(rows.map((item) => String(item.english_translation || 'Italian verb').trim()))];
const existing = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, 'utf8')) : {};
const pending = glosses.filter((gloss) => !existing[gloss]);

async function translateBatch(text) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source_lang: 'EN', target_lang: 'ES', context: 'Concise dictionary-style Spanish meanings for an Italian verb catalogue.' })
  });
  if (!response.ok) throw new Error(`DeepL failed with status ${response.status}.`);
  const data = await response.json();
  if (!Array.isArray(data.translations) || data.translations.length !== text.length) throw new Error('DeepL returned an incomplete Italian verb gloss batch.');
  return data.translations.map((item) => item.text.trim());
}

(async () => {
  for (let index = 0; index < pending.length; index += 25) {
    const batch = pending.slice(index, index + 25);
    const translations = await translateBatch(batch);
    batch.forEach((source, itemIndex) => { existing[source] = translations[itemIndex]; });
    fs.writeFileSync(outputPath, `${JSON.stringify(existing, null, 2)}\n`, 'utf8');
    console.log(`Translated ${Math.min(index + batch.length, pending.length)}/${pending.length} Italian verb glosses.`);
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
