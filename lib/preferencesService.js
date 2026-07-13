// lib/preferencesService.js
// Reads/writes the learner's active target language and CEFR level
// (public.profiles.preferred_language/preferred_level), so the frontend's
// learningPathState survives a reload or a new session. Same Supabase-or-
// devStore pattern as lessonsService.js/courseLessonsService.js.
const config = require('./config');
const { getSupabaseAdmin } = require('./supabaseClient');
const devStore = require('./devStore');

const VALID_LANGUAGES = new Set(['english', 'spanish', 'french', 'italian', 'german']);
const VALID_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function validate({ language, level }) {
  if (language !== undefined && !VALID_LANGUAGES.has(language)) {
    throw httpError('Idioma no válido.', 400);
  }
  if (level !== undefined && !VALID_LEVELS.has(level)) {
    throw httpError('Nivel no válido.', 400);
  }
}

async function getPreferences(userId) {
  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('profiles')
      .select('preferred_language, preferred_level')
      .eq('id', userId)
      .maybeSingle();
    return {
      language: data?.preferred_language || 'english',
      level: data?.preferred_level || 'A1'
    };
  }

  const profile = devStore.getProfile(userId);
  return {
    language: profile.preferredLanguage || 'english',
    level: profile.preferredLevel || 'A1'
  };
}

async function updatePreferences(userId, { language, level }) {
  validate({ language, level });
  if (language === undefined && level === undefined) {
    throw httpError('Debes enviar al menos un idioma o nivel.', 400);
  }

  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const patch = { updated_at: new Date().toISOString() };
    if (language !== undefined) patch.preferred_language = language;
    if (level !== undefined) patch.preferred_level = level;

    const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
    if (error) throw httpError('No se pudieron guardar las preferencias.', 500);
    return getPreferences(userId);
  }

  const current = devStore.getProfile(userId);
  devStore.saveProfile(userId, {
    preferredLanguage: language !== undefined ? language : current.preferredLanguage,
    preferredLevel: level !== undefined ? level : current.preferredLevel
  });
  return getPreferences(userId);
}

module.exports = { getPreferences, updatePreferences, VALID_LANGUAGES, VALID_LEVELS };
