const { getSupabaseAdmin } = require('./supabaseClient');

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

module.exports = { getUnitProgress, saveUnitAttempt };
