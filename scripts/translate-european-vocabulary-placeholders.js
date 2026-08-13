#!/usr/bin/env node
// Replaces the old "Palabra clave n" placeholders in the European A1-B1
// routes with real Spanish L1 glosses. It only changes placeholder values,
// so authored translations always win.
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ROOT = path.join(__dirname, '..');
const seedPath = path.join(ROOT, 'lib', 'seed-lessons.json');
const lessons = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const languages = { german: 'DE', italian: 'IT', portuguese: 'PT' };
const placeholder = /^Palabra clave \d+$/;
const endpoint = `${String(process.env.DEEPL_API_BASE_URL || '').replace(/\/+$/, '')}/v2/translate`;

if (!process.env.DEEPL_API_KEY || !endpoint.startsWith('http')) {
  throw new Error('DEEPL_API_KEY and DEEPL_API_BASE_URL are required to translate vocabulary placeholders.');
}

const uniqueWords = {};
for (const language of Object.keys(languages)) uniqueWords[language] = [];
for (const lesson of lessons) {
  const language = lesson.target_language;
  if (!languages[language]) continue;
  for (const item of lesson.content_json?.vocabulary || []) {
    if (item?.word && placeholder.test(String(item.translation || ''))) uniqueWords[language].push(String(item.word).trim());
  }
}

async function translateBatch(language, text) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      source_lang: languages[language],
      target_lang: 'ES',
      context: 'Short dictionary glosses for a language-learning vocabulary card. Return concise Spanish meanings only.'
    })
  });
  if (!response.ok) throw new Error(`DeepL returned ${response.status} for ${language}.`);
  const data = await response.json();
  if (!Array.isArray(data.translations) || data.translations.length !== text.length) throw new Error(`Incomplete ${language} translation batch.`);
  return data.translations.map((item) => item.text.trim());
}

(async () => {
  const glossary = {};
  for (const language of Object.keys(languages)) {
    const words = [...new Set(uniqueWords[language].filter(Boolean))];
    glossary[language] = {};
    for (let index = 0; index < words.length; index += 40) {
      const batch = words.slice(index, index + 40);
      const translations = await translateBatch(language, batch);
      batch.forEach((word, itemIndex) => { glossary[language][word.toLocaleLowerCase()] = translations[itemIndex]; });
      console.log(`${language}: ${Math.min(index + batch.length, words.length)}/${words.length}`);
    }
  }

  let changed = 0;
  for (const lesson of lessons) {
    const language = lesson.target_language;
    if (!glossary[language]) continue;
    for (const item of lesson.content_json?.vocabulary || []) {
      if (!item?.word || !placeholder.test(String(item.translation || ''))) continue;
      const translation = glossary[language][String(item.word).trim().toLocaleLowerCase()];
      if (!translation) throw new Error(`Missing gloss for ${language}: ${item.word}`);
      const previous = item.translation;
      item.translation = translation;
      if (item.definition === previous) item.definition = translation;
      changed += 1;
    }
  }
  fs.writeFileSync(seedPath, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
  console.log(`Updated ${changed} vocabulary placeholders with Spanish L1 glosses.`);
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
