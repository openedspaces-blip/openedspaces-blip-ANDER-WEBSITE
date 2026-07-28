const { getSupabaseAdmin } = require('./supabaseClient');
const VERB_LANGUAGES = new Set(['english', 'french', 'spanish']);
const MASTERY_STATES = new Set(['new', 'learning', 'practicing', 'mastered']);

function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function validateLanguage(languageCode) {
  if (!VERB_LANGUAGES.has(languageCode)) throw validationError('Idioma de Verbos no válido.');
}

function validateVerbId(verbId) {
  if (!verbId || verbId.length > 160 || !/^verb-(english|french|spanish)-[\w-]+$/i.test(verbId)) {
    throw validationError('Identificador de verbo no válido.');
  }
}

function serializeVerbProgress(row) {
  return {
    verbId: row.verb_id,
    language: row.language_code,
    mastery: row.mastery,
    favorite: row.favorite,
    attempts: row.attempts_count,
    correct: row.correct_count,
    incorrect: row.incorrect_count,
    streak: row.current_streak,
    bestStreak: row.best_streak,
    lastPracticedAt: row.last_practiced_at
  };
}

async function findCourse(languageCode, levelCode) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const [{ data: language }, { data: level }] = await Promise.all([
    supabase.from('languages').select('id').eq('code', languageCode).maybeSingle(),
    supabase.from('levels').select('id').eq('code', levelCode).maybeSingle()
  ]);
  if (!language || !level) return null;
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('language_id', language.id)
    .eq('level_id', level.id)
    .maybeSingle();
  return course || null;
}

async function getCourseUnits(languageCode, levelCode) {
  const course = await findCourse(languageCode, levelCode);
  if (!course) return [];
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('course_units')
    .select('id, slug, title, order_index')
    .eq('course_id', course.id)
    .order('order_index');
  return data || [];
}

async function getUnitProgress({ userId, languageCode, levelCode }) {
  if (!userId) return [];
  const supabase = getSupabaseAdmin();
  const units = await getCourseUnits(languageCode, levelCode);
  if (!units.length) return [];
  const unitById = new Map(units.map((unit) => [unit.id, unit]));
  const { data } = await supabase
    .from('user_unit_verb_progress')
    .select('unit_id, status, best_score, last_score, attempts_count, completed_at')
    .eq('user_id', userId)
    .in('unit_id', units.map((unit) => unit.id));
  return (data || []).map((row) => ({
    unitSlug: unitById.get(row.unit_id)?.slug || '',
    status: row.status,
    bestScore: row.best_score,
    lastScore: row.last_score,
    attemptsCount: row.attempts_count,
    completedAt: row.completed_at
  }));
}

async function saveUnitAttempt({ userId, languageCode, levelCode, unitSlug, score }) {
  const numericScore = Number(score);
  if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 100) {
    const error = new Error('La puntuación debe ser un número entero entre 0 y 100.');
    error.status = 400;
    throw error;
  }
  const supabase = getSupabaseAdmin();
  const units = await getCourseUnits(languageCode, levelCode);
  const unit = units.find((item) => item.slug === unitSlug);
  if (!unit) {
    const error = new Error('Unidad no encontrada.');
    error.status = 404;
    throw error;
  }
  const { data: existing } = await supabase
    .from('user_unit_verb_progress')
    .select('best_score, attempts_count, started_at')
    .eq('user_id', userId)
    .eq('unit_id', unit.id)
    .maybeSingle();
  const bestScore = Math.max(numericScore, existing?.best_score || 0);
  const attemptsCount = (existing?.attempts_count || 0) + 1;
  const now = new Date().toISOString();
  const { error } = await supabase.from('user_unit_verb_progress').upsert(
    {
      user_id: userId,
      unit_id: unit.id,
      status: 'completed',
      best_score: bestScore,
      last_score: numericScore,
      attempts_count: attemptsCount,
      started_at: existing?.started_at || now,
      completed_at: now,
      updated_at: now
    },
    { onConflict: 'user_id,unit_id' }
  );
  if (error) throw new Error(`No se pudo guardar el progreso de Verbos: ${error.message}`);
  return { ok: true, unitSlug, score: numericScore, bestScore, attemptsCount };
}

async function getDetailedProgress({ userId, languageCode }) {
  validateLanguage(languageCode);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('user_verb_progress')
    .select(
      'verb_id, language_code, mastery, favorite, attempts_count, correct_count, incorrect_count, current_streak, best_streak, last_practiced_at'
    )
    .eq('user_id', userId)
    .eq('language_code', languageCode);
  if (error) throw new Error(`No se pudo cargar el progreso detallado de Verbos: ${error.message}`);
  return (data || []).map(serializeVerbProgress);
}

async function getVerbProgressRow({ userId, languageCode, verbId }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('user_verb_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('language_code', languageCode)
    .eq('verb_id', verbId)
    .maybeSingle();
  if (error) throw new Error(`No se pudo consultar el verbo: ${error.message}`);
  return data || null;
}

async function saveVerbState({ userId, languageCode, verbId, favorite, mastery }) {
  validateLanguage(languageCode);
  validateVerbId(verbId);
  if (favorite === undefined && mastery === undefined) {
    throw validationError('Debes indicar favorito o dominio.');
  }
  if (favorite !== undefined && typeof favorite !== 'boolean') {
    throw validationError('El valor de favorito debe ser booleano.');
  }
  if (mastery !== undefined && !MASTERY_STATES.has(mastery)) {
    throw validationError('Estado de dominio no válido.');
  }
  const existing = await getVerbProgressRow({ userId, languageCode, verbId });
  const now = new Date().toISOString();
  const row = {
    user_id: userId,
    language_code: languageCode,
    verb_id: verbId,
    mastery: mastery ?? existing?.mastery ?? 'new',
    favorite: favorite ?? existing?.favorite ?? false,
    attempts_count: existing?.attempts_count || 0,
    correct_count: existing?.correct_count || 0,
    incorrect_count: existing?.incorrect_count || 0,
    current_streak: existing?.current_streak || 0,
    best_streak: existing?.best_streak || 0,
    last_practiced_at: existing?.last_practiced_at || null,
    created_at: existing?.created_at || now,
    updated_at: now
  };
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('user_verb_progress')
    .upsert(row, { onConflict: 'user_id,language_code,verb_id' })
    .select()
    .single();
  if (error) throw new Error(`No se pudo guardar el verbo: ${error.message}`);
  return serializeVerbProgress(data);
}

async function recordVerbAttempt({ userId, languageCode, verbId, isCorrect }) {
  validateLanguage(languageCode);
  validateVerbId(verbId);
  if (typeof isCorrect !== 'boolean') throw validationError('El resultado del intento no es válido.');
  const existing = await getVerbProgressRow({ userId, languageCode, verbId });
  const now = new Date().toISOString();
  const streak = isCorrect ? (existing?.current_streak || 0) + 1 : 0;
  const row = {
    user_id: userId,
    language_code: languageCode,
    verb_id: verbId,
    mastery: existing?.mastery || 'learning',
    favorite: existing?.favorite || false,
    attempts_count: (existing?.attempts_count || 0) + 1,
    correct_count: (existing?.correct_count || 0) + (isCorrect ? 1 : 0),
    incorrect_count: (existing?.incorrect_count || 0) + (isCorrect ? 0 : 1),
    current_streak: streak,
    best_streak: Math.max(existing?.best_streak || 0, streak),
    last_practiced_at: now,
    created_at: existing?.created_at || now,
    updated_at: now
  };
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('user_verb_progress')
    .upsert(row, { onConflict: 'user_id,language_code,verb_id' })
    .select()
    .single();
  if (error) throw new Error(`No se pudo guardar el intento: ${error.message}`);
  return serializeVerbProgress(data);
}

async function resetDetailedProgress({ userId, languageCode }) {
  validateLanguage(languageCode);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('user_verb_progress')
    .delete()
    .eq('user_id', userId)
    .eq('language_code', languageCode);
  if (error) throw new Error(`No se pudo reiniciar el progreso de Verbos: ${error.message}`);
  return { ok: true };
}

module.exports = {
  getUnitProgress,
  saveUnitAttempt,
  getDetailedProgress,
  saveVerbState,
  recordVerbAttempt,
  resetDetailedProgress
};
