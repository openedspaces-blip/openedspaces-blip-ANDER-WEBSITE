#!/usr/bin/env node
'use strict';

// Builds a durable, independent 5,000-word dictionary for each supported
// language. Frequency lists provide the candidate terms; DeepL supplies the
// Spanish meaning; Supabase stores the final, searchable catalogue.
require('dotenv').config();
const { supabaseAdmin } = require('../lib/supabase');
const translator = require('../lib/translatorService');

const TARGET = 5000;
const SOURCE = 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018';
const files = { english: 'en/en_50k.txt', spanish: 'es/es_50k.txt', french: 'fr/fr_50k.txt', italian: 'it/it_50k.txt', portuguese: 'pt/pt_50k.txt', german: 'de/de_50k.txt' };
const requested = process.argv.find((arg) => arg.startsWith('--language='))?.split('=')[1];
const languages = requested ? [requested] : Object.keys(files);
const wordPattern = /^\p{L}+(?:[’'-]\p{L}+)?$/u;

// Frequency corpora include dialogue subtitles, so some entries are people or
// place names rather than reusable vocabulary. Keep those out of the general
// learner dictionary. Ambiguous everyday words (for example "rose" or
// "mark") are deliberately not included in this list.
const PROPER_NAMES = new Set([
  'aaron', 'abby', 'adam', 'adrian', 'alan', 'albert', 'alex', 'alice', 'amanda', 'amy', 'andrew', 'anna', 'anthony',
  'arthur', 'ashley', 'barbara', 'ben', 'beth', 'billy', 'bob', 'bobby', 'brian', 'carl', 'carlos', 'charles', 'charlie',
  'chris', 'christine', 'claire', 'dan', 'daniel', 'dave', 'david', 'dean', 'dennis', 'derek', 'donna', 'eddie', 'edward',
  'elena', 'elizabeth', 'emma', 'eric', 'frank', 'fred', 'george', 'grace', 'harry', 'helen', 'henry', 'jack', 'jake',
  'james', 'jane', 'jason', 'jeff', 'jennifer', 'jenny', 'jerry', 'jim', 'joan', 'john', 'johnny', 'joseph', 'julia',
  'julie', 'karen', 'kate', 'kathy', 'kevin', 'laura', 'leo', 'linda', 'lisa', 'lucy', 'maria', 'matt', 'matthew', 'max',
  'michael', 'mike', 'nancy', 'nick', 'oliver', 'paul', 'peter', 'rachel', 'richard', 'robert', 'sam', 'samantha', 'sara',
  'sarah', 'scott', 'sean', 'steve', 'susan', 'thomas', 'tom', 'tony', 'victor', 'walter', 'william',
  'alain', 'antoine', 'bernard', 'camille', 'céline', 'françois', 'gabriel', 'henri', 'jean', 'julien', 'marc', 'marie',
  'nicolas', 'pierre', 'sophie', 'vincent', 'alessandro', 'andrea', 'antonio', 'chiara', 'francesco', 'giovanni', 'giulia',
  'lorenzo', 'marco', 'matteo', 'roberto', 'salvatore', 'bruno', 'catarina', 'eduardo', 'felipe', 'fernando', 'joão',
  'josé', 'luís', 'manuel', 'mariana', 'miguel', 'paulo', 'ricardo', 'tiago', 'ana', 'carmen', 'diego', 'francisco',
  'isabel', 'javier', 'juan', 'luis', 'manuel', 'miguel', 'pablo', 'pedro', 'raúl'
]);

function isExcludedTerm(term) {
  return PROPER_NAMES.has(normalise(term));
}

function normalise(value) { return String(value || '').normalize('NFKC').trim().toLocaleLowerCase(); }

async function termsFor(language) {
  const response = await fetch(`${SOURCE}/${files[language]}`);
  if (!response.ok) throw new Error(`No se pudo descargar la lista de frecuencia para ${language}.`);
  const seen = new Set();
  const rows = (await response.text()).split(/\r?\n/);
  for (const row of rows) {
    const term = row.trim().split(/\s+/)[0];
    const key = normalise(term);
    if (!wordPattern.test(term) || isExcludedTerm(term) || seen.has(key)) continue;
    seen.add(key);
    if (seen.size === TARGET) break;
  }
  if (seen.size !== TARGET) throw new Error(`${language} no alcanzó ${TARGET} términos utilizables.`);
  return [...seen];
}

async function translateBatch(terms, language) {
  if (language === 'spanish') return terms;
  const { translatedText } = await translator.translateText({
    text: terms.join('\n'), sourceLanguage: language, targetLanguage: 'spanish',
    context: 'Lista de palabras independientes para un diccionario educativo. Traduce una palabra por línea, de forma breve, y conserva exactamente el mismo número de líneas.',
    learningDomain: 'general'
  });
  const translations = String(translatedText).split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  if (translations.length === terms.length) return translations;
  // DeepL occasionally joins two very short terms. Keep the dictionary
  // trustworthy: recover this one batch with one-term requests instead of
  // guessing which translation belongs to which entry.
  console.warn(`${language}: DeepL devolvió ${translations.length}/${terms.length}; recuperando lote individualmente.`);
  const recovered = [];
  for (const term of terms) {
    const single = await translator.translateText({ text: term, sourceLanguage: language, targetLanguage: 'spanish', learningDomain: 'general' });
    const meaning = String(single.translatedText || '').trim();
    if (!meaning) throw new Error(`No se recibió traducción para “${term}”.`);
    recovered.push(meaning);
  }
  return recovered;
}

async function importLanguage(language) {
  if (!files[language]) throw new Error(`Idioma no soportado: ${language}`);
  const client = supabaseAdmin();
  if (!client) throw new Error('Supabase no está configurado.');
  const terms = await termsFor(language);
  console.log(`${language}: ${terms.length} términos de frecuencia preparados.`);
  const rows = [];
  for (let start = 0; start < terms.length; start += 50) {
    const batch = terms.slice(start, start + 50);
    const translations = await translateBatch(batch, language);
    rows.push(...batch.map((term, index) => ({ language, term, spanish_meaning: translations[index], frequency_rank: start + index + 1, source: 'FrequencyWords + DeepL' })));
    console.log(`${language}: ${Math.min(start + batch.length, terms.length)}/${terms.length} traducidas`);
  }
  for (let start = 0; start < rows.length; start += 500) {
    const { error } = await client.from('vocabulary_dictionary_entries').upsert(rows.slice(start, start + 500), { onConflict: 'language,term' });
    if (error) throw error;
  }
  const { count, error } = await client.from('vocabulary_dictionary_entries').select('*', { count: 'exact', head: true }).eq('language', language);
  if (error) throw error;
  if (count < TARGET) throw new Error(`${language}: solo se guardaron ${count}/${TARGET} entradas.`);
  console.log(`${language}: ${count} entradas disponibles.`);
}

async function cleanLanguage(language) {
  if (!files[language]) throw new Error(`Idioma no soportado: ${language}`);
  const client = supabaseAdmin();
  if (!client) throw new Error('Supabase no está configurado.');
  const approvedTerms = await termsFor(language);
  const approved = new Set(approvedTerms);
  // Supabase caps an unpaged response at 1,000 rows. Read every entry so a
  // cleanup never mistakes the remaining dictionary for missing vocabulary.
  const current = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error: readError } = await client
      .from('vocabulary_dictionary_entries')
      .select('term')
      .eq('language', language)
      .order('term')
      .range(offset, offset + 999);
    if (readError) throw readError;
    current.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  const currentTerms = new Set((current || []).map((row) => normalise(row.term)));
  const rejected = [...currentTerms].filter((term) => !approved.has(term));
  console.log(`${language}: revisando ${currentTerms.size} entradas; ${rejected.length} deben sustituirse.`);
  // Apply the term predicate first. PostgREST's bulk `in` encoding can be
  // lossy for accented/apostrophised entries, whereas an explicit term match
  // keeps the curation operation exact and the list is intentionally small.
  for (const term of rejected) {
    const { error } = await client.from('vocabulary_dictionary_entries').delete().eq('language', language).eq('term', term);
    if (error) throw error;
  }
  const missing = approvedTerms.filter((term) => !currentTerms.has(term));
  console.log(`${language}: ${missing.length} palabras aprobadas por incorporar.`);
  const additions = [];
  for (let start = 0; start < missing.length; start += 50) {
    const batch = missing.slice(start, start + 50);
    const translations = await translateBatch(batch, language);
    additions.push(...batch.map((term, index) => ({ language, term, spanish_meaning: translations[index], frequency_rank: approvedTerms.indexOf(term) + 1, source: 'FrequencyWords + DeepL (filtered)' })));
  }
  for (let start = 0; start < additions.length; start += 500) {
    const { error } = await client.from('vocabulary_dictionary_entries').upsert(additions.slice(start, start + 500), { onConflict: 'language,term' });
    if (error) throw error;
  }
  const { count, error } = await client.from('vocabulary_dictionary_entries').select('*', { count: 'exact', head: true }).eq('language', language);
  if (error) throw error;
  if (count !== TARGET) throw new Error(`${language}: limpieza incompleta (${count}/${TARGET}).`);
  console.log(`${language}: ${rejected.length} nombres/entradas no pedagógicas reemplazados; ${count} términos disponibles.`);
}

(async () => {
  if (!translator.isTranslatorConfigured()) throw new Error('DEEPL_API_KEY no está configurada.');
  const cleanOnly = process.argv.includes('--clean');
  for (const language of languages) await (cleanOnly ? cleanLanguage(language) : importLanguage(language));
})().catch((error) => { console.error(error.stack || error.message); process.exit(1); });
