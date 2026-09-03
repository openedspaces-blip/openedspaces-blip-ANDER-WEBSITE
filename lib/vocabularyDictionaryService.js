'use strict';

const { supabaseAdmin } = require('./supabase');

const LANGUAGES = new Set(['english', 'spanish', 'french', 'italian', 'portuguese', 'german']);

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
  return { entries: data || [], total: count || 0, offset: safeOffset, limit: safeLimit };
}

module.exports = { LANGUAGES, listEntries };
