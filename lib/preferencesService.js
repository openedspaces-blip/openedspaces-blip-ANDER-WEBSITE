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
// explanations/hints. bridge_language must be different from
// preferred_language; the shared LANGUAGE_PAIRS validation below enforces
// that rule for both Supabase and the local development store.
const config = require('./config');
const { getSupabaseAdmin } = require('./supabaseClient');
const devStore = require('./devStore');
// Same LANGUAGE_PAIRS list the client validates against (src/js/script.js's
// setBridgeLanguage/setTargetLanguage) - required here, not duplicated, so
// the two can never drift. See that file's isomorphic module.exports/window
// dual-export pattern.
const { isLanguagePairSupported } = require('../src/js/language-pair');

const VALID_LANGUAGES = new Set(['english', 'spanish', 'french', 'italian', 'portuguese', 'german']);
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

function validatePracticeReminders({
  inactivityRemindersEnabled,
  scheduledRemindersEnabled,
  reminderTime,
  reminderTimezone
}) {
  for (const value of [inactivityRemindersEnabled, scheduledRemindersEnabled]) {
    if (value !== undefined && typeof value !== 'boolean') {
      throw httpError('La preferencia de recordatorios no es válida.', 400);
    }
  }
  if (reminderTime !== undefined && reminderTime !== null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTime)) {
    throw httpError('Elige una hora válida para practicar.', 400);
  }
  if (reminderTimezone !== undefined && reminderTimezone !== 'America/Santo_Domingo') {
    throw httpError('La zona horaria del recordatorio no es válida.', 400);
  }
  if (scheduledRemindersEnabled === true && !reminderTime) {
    throw httpError('Elige una hora antes de activar el recordatorio diario.', 400);
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
      .select('preferred_language, preferred_level, bridge_language, username, practice_inactivity_reminders_enabled, practice_scheduled_reminders_enabled, practice_reminder_time, practice_reminder_timezone')
      .eq('id', userId)
      .maybeSingle();
    return {
      language: data?.preferred_language || 'english',
      level: data?.preferred_level || 'A1',
      bridgeLanguage: data?.bridge_language || 'spanish',
      username: data?.username || null,
      inactivityRemindersEnabled: Boolean(data?.practice_inactivity_reminders_enabled),
      scheduledRemindersEnabled: Boolean(data?.practice_scheduled_reminders_enabled),
      reminderTime: data?.practice_reminder_time ? String(data.practice_reminder_time).slice(0, 5) : null,
      reminderTimezone: data?.practice_reminder_timezone || 'America/Santo_Domingo'
    };
  }

  const profile = devStore.getProfile(userId);
  return {
    language: profile.preferredLanguage || 'english',
    level: profile.preferredLevel || 'A1',
    bridgeLanguage: profile.bridgeLanguage || 'spanish',
    username: profile.username || null,
    inactivityRemindersEnabled: Boolean(profile.inactivityRemindersEnabled),
    scheduledRemindersEnabled: Boolean(profile.scheduledRemindersEnabled),
    reminderTime: profile.reminderTime || null,
    reminderTimezone: profile.reminderTimezone || 'America/Santo_Domingo'
  };
}

async function updatePreferences(userId, { language, level, bridgeLanguage, inactivityRemindersEnabled, scheduledRemindersEnabled, reminderTime, reminderTimezone }) {
  validate({ language, level, bridgeLanguage });
  validatePracticeReminders({ inactivityRemindersEnabled, scheduledRemindersEnabled, reminderTime, reminderTimezone });
  if (language === undefined && level === undefined && bridgeLanguage === undefined && inactivityRemindersEnabled === undefined && scheduledRemindersEnabled === undefined && reminderTime === undefined && reminderTimezone === undefined) {
    throw httpError('Debes enviar al menos una preferencia.', 400);
  }

  // Resolve against whichever value isn't being changed because the client
  // may send only one field; the fully-resolved pair is then validated.
  const current = await getPreferences(userId);
  const nextLanguage = language !== undefined ? language : current.language;
  const nextBridge = bridgeLanguage !== undefined ? bridgeLanguage : current.bridgeLanguage;
  const nextReminderTime = reminderTime !== undefined ? reminderTime : current.reminderTime;
  const nextScheduled = scheduledRemindersEnabled !== undefined
    ? scheduledRemindersEnabled
    : current.scheduledRemindersEnabled;
  if (nextScheduled && !nextReminderTime) {
    throw httpError('Elige una hora antes de activar el recordatorio diario.', 400);
  }

  // Each field is individually a valid language (checked above), but not
  // every combination is a supported pair - italian/german, for instance,
  // have no LANGUAGE_PAIRS row with any bridge at all. Reject the whole
  // update rather than silently persisting a pair the UI could never have
  // produced itself (same rule the client enforces before ever calling this
  // endpoint - see setBridgeLanguage/setTargetLanguage in src/js/script.js).
  if (!isLanguagePairSupported(nextBridge, nextLanguage)) {
    throw httpError('Esta combinación de idiomas no está disponible.', 400);
  }

  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const patch = { updated_at: new Date().toISOString() };
    if (language !== undefined) patch.preferred_language = language;
    if (level !== undefined) patch.preferred_level = level;
    if (bridgeLanguage !== undefined) patch.bridge_language = bridgeLanguage;
    if (inactivityRemindersEnabled !== undefined)
      patch.practice_inactivity_reminders_enabled = inactivityRemindersEnabled;
    if (scheduledRemindersEnabled !== undefined)
      patch.practice_scheduled_reminders_enabled = scheduledRemindersEnabled;
    if (reminderTime !== undefined) patch.practice_reminder_time = reminderTime;
    if (reminderTimezone !== undefined) patch.practice_reminder_timezone = reminderTimezone;

    const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
    if (error) throw httpError('No se pudieron guardar las preferencias.', 500);
    return getPreferences(userId);
  }

  devStore.saveProfile(userId, {
    preferredLanguage: nextLanguage,
    preferredLevel: level !== undefined ? level : current.level,
    bridgeLanguage: nextBridge,
    inactivityRemindersEnabled:
      inactivityRemindersEnabled !== undefined
        ? inactivityRemindersEnabled
        : current.inactivityRemindersEnabled,
    scheduledRemindersEnabled:
      scheduledRemindersEnabled !== undefined
        ? scheduledRemindersEnabled
        : current.scheduledRemindersEnabled,
    reminderTime: nextReminderTime,
    reminderTimezone: reminderTimezone || current.reminderTimezone
  });
  return getPreferences(userId);
}

module.exports = { getPreferences, updatePreferences, VALID_LANGUAGES, VALID_LEVELS };
