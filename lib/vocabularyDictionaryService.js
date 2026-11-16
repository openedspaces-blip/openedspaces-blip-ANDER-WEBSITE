'use strict';

const { supabaseAdmin } = require('./supabase');

const LANGUAGES = new Set(['english', 'spanish', 'french', 'italian', 'portuguese', 'german']);
let seedLessons;
const curatedVocabularyByLanguage = new Map();

function normalizeTerm(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[’‘`]/g, "'")
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase();
}

function mergeCuratedMetadata(current, candidate, levelOrder) {
  if (!current) return candidate;
  const completeness = (item) => (item.partOfSpeech ? 1 : 0) + (item.example ? 1 : 0);
  const candidateLevel = levelOrder[candidate.level] ?? 99;
  const currentLevel = levelOrder[current.level] ?? 99;
  const candidateIsPreferred =
    completeness(candidate) > completeness(current) ||
    (completeness(candidate) === completeness(current) && candidateLevel < currentLevel);
  const primary = candidateIsPreferred ? candidate : current;
  const secondary = candidateIsPreferred ? current : candidate;
  return {
    partOfSpeech: primary.partOfSpeech || secondary.partOfSpeech,
    example: primary.example || secondary.example,
    level: primary.level
  };
}

function buildCuratedVocabularyIndex(lessons, language) {
  const levelOrder = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
  const curated = new Map();
  for (const lesson of lessons || []) {
    if (lesson.skill !== 'vocabulary' || lesson.target_language !== language) continue;
    for (const item of lesson.content_json?.vocabulary || []) {
      const term = normalizeTerm(item.word);
      if (!term) continue;
      const candidate = {
        partOfSpeech: cleanText(item.partOfSpeech || item.part_of_speech, 80),
        example: cleanText(item.example, 400),
        level: lesson.level
      };
      if (!candidate.partOfSpeech && !candidate.example) continue;
      const current = curated.get(term);
      curated.set(term, mergeCuratedMetadata(current, candidate, levelOrder));
    }
  }
  return curated;
}

function getCuratedVocabulary(language) {
  if (curatedVocabularyByLanguage.has(language)) return curatedVocabularyByLanguage.get(language);
  if (!seedLessons) seedLessons = require('./seed-lessons.json');
  const curated = buildCuratedVocabularyIndex(seedLessons, language);
  curatedVocabularyByLanguage.set(language, curated);
  return curated;
}

function enrichEntriesWithCurriculumMetadata(entries, language) {
  const curated = getCuratedVocabulary(language);
  return (entries || []).map((entry) => {
    const fallback = curated.get(normalizeTerm(entry.term));
    return {
      ...entry,
      part_of_speech: cleanText(entry.part_of_speech, 80) || fallback?.partOfSpeech || null,
      example: cleanText(entry.example, 400) || fallback?.example || null
    };
  });
}

function cleanText(value, max = 80) {
  return String(value || '').normalize('NFKC').trim().slice(0, max);
}

async function listEntries({ language, query = '', letter = '', offset = 0, limit = 60 } = {}) {
  if (!LANGUAGES.has(language)) {
    const error = new Error('Idioma de diccionario no válido.');
    error.status = 400;
    throw error;
  }
  const client = supabaseAdmin();
  if (!client) {
    const error = new Error('El diccionario todavía no está configurado.');
    error.status = 503;
    throw error;
  }
  const safeQuery = cleanText(query);
  const safeLetter = cleanText(letter, 4);
  const safeOffset = Math.max(0, Number.parseInt(offset, 10) || 0);
  const safeLimit = Math.min(100, Math.max(12, Number.parseInt(limit, 10) || 60));
  let request = client
    .from('vocabulary_dictionary_entries')
    .select('id, term, spanish_meaning, part_of_speech, cefr_level, example, frequency_rank', { count: 'exact' })
    .eq('language', language)
    .order('term', { ascending: true })
    .range(safeOffset, safeOffset + safeLimit - 1);
  if (safeQuery) request = request.or(`term.ilike.%${safeQuery}%,spanish_meaning.ilike.%${safeQuery}%`);
  if (safeLetter && /^[\p{L}]$/u.test(safeLetter)) request = request.ilike('term', `${safeLetter}%`);
  const { data, count, error } = await request;
  if (error) {
    const wrapped = new Error(error.message || 'No se pudo consultar el diccionario.');
    wrapped.status = error.code === '42P01' ? 503 : 500;
    throw wrapped;
  }
  return {
    entries: enrichEntriesWithCurriculumMetadata(data || [], language),
    total: count || 0,
    offset: safeOffset,
    limit: safeLimit
  };
}

module.exports = {
  LANGUAGES,
  listEntries,
  enrichEntriesWithCurriculumMetadata,
  buildCuratedVocabularyIndex
};
