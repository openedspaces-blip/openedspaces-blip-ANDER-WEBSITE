// lib/preferencesService.js
// Reads/writes the learner's active target language, bridge language, and
// CEFR level (public.profiles.preferred_language/bridge_language/
// preferred_level), so the frontend's learningPathState survives a reload
// or a new session. Same Supabase-or-devStore pattern as
// lessonsService.js/courseLessonsService.js.
//
// preferred_language is the target/learning language (unchanged meaning -
// see supabase/migrations/202607120002_profile_preferences.sql). bridge_language
// (supabase/migrations/202607140001_bridge_language.sql) is the language the
// learner already speaks/wants the platform in, used for interface text and
// explanations/hints. bridge_language MAY equal preferred_language (spec §3:
// direct/immersion learning mode, e.g. English->English) - see
// supabase/migrations/202607200001_allow_same_language_direct_mode.sql,
// which dropped the old "must differ" DB CHECK constraint; the learningMode
// ('bilingual' | 'direct') this implies is derived client-side from these
// same two fields (src/js/language-pair.js's getLearningMode), not stored
// separately here.
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

function validate({ language, level, bridgeLanguage }) {
  if (language !== undefined && !VALID_LANGUAGES.has(language)) {
    throw httpError('Idioma no válido.', 400);
  }
  if (level !== undefined && !VALID_LEVELS.has(level)) {
    throw httpError('Nivel no válido.', 400);
  }
  if (bridgeLanguage !== undefined && !VALID_LANGUAGES.has(bridgeLanguage)) {
    throw httpError('Idioma puente no válido.', 400);
  }
}

// username is included here (not just language/level/bridge) because the
// frontend already fetches this right after login (attachAuthHandlers) -
// reusing it is how the "create your username" onboarding decides whether
// to show itself (profiles.username still null = pre-migration account).
async function getPreferences(userId) {
  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('profiles')
      .select('preferred_language, preferred_level, bridge_language, username')
      .eq('id', userId)
      .maybeSingle();
    return {
      language: data?.preferred_language || 'english',
      level: data?.preferred_level || 'A1',
      bridgeLanguage: data?.bridge_language || 'spanish',
      username: data?.username || null
    };
  }

  const profile = devStore.getProfile(userId);
  return {
    language: profile.preferredLanguage || 'english',
    level: profile.preferredLevel || 'A1',
    bridgeLanguage: profile.bridgeLanguage || 'spanish',
    username: profile.username || null
  };
}

async function updatePreferences(userId, { language, level, bridgeLanguage }) {
  validate({ language, level, bridgeLanguage });
  if (language === undefined && level === undefined && bridgeLanguage === undefined) {
    throw httpError('Debes enviar al menos un idioma, idioma puente o nivel.', 400);
  }

  // Bridge and target may match (spec §3: direct/immersion mode) - resolve
  // against whichever value isn't being changed in this call anyway, since
  // the client may only send one of the two fields, and both branches below
  // need the fully-resolved pair.
  const current = await getPreferences(userId);
  const nextLanguage = language !== undefined ? language : current.language;
  const nextBridge = bridgeLanguage !== undefined ? bridgeLanguage : current.bridgeLanguage;

  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const patch = { updated_at: new Date().toISOString() };
    if (language !== undefined) patch.preferred_language = language;
    if (level !== undefined) patch.preferred_level = level;
    if (bridgeLanguage !== undefined) patch.bridge_language = bridgeLanguage;

    const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
    if (error) throw httpError('No se pudieron guardar las preferencias.', 500);
    return getPreferences(userId);
  }

  devStore.saveProfile(userId, {
    preferredLanguage: nextLanguage,
    preferredLevel: level !== undefined ? level : current.level,
    bridgeLanguage: nextBridge
  });
  return getPreferences(userId);
}

module.exports = { getPreferences, updatePreferences, VALID_LANGUAGES, VALID_LEVELS };
