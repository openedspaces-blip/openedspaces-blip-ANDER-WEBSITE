const { getSupabaseAdmin } = require('./supabaseClient');

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

async function listSavedVocabulary({ userId, unitSlug, lessonSlug }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  let query = supabase
    .from('user_saved_vocabulary')
    .select('id,source_language,target_language,term,translation,context,lesson_slug,unit_slug,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (unitSlug) query = query.eq('unit_slug', clean(unitSlug, 160));
  if (lessonSlug) query = query.eq('lesson_slug', clean(lessonSlug, 220));
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function saveVocabulary({ userId, sourceLanguage, targetLanguage, term, translation, context, lessonSlug, unitSlug }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const error = new Error('El almacenamiento de Vocabulary no está configurado.');
    error.status = 503;
    throw error;
  }
  const row = {
    user_id: userId,
    source_language: clean(sourceLanguage, 40),
    target_language: clean(targetLanguage, 40),
    term: clean(term, 120),
    translation: clean(translation, 1000),
    context: clean(context, 1000) || null,
    lesson_slug: clean(lessonSlug, 220) || null,
    unit_slug: clean(unitSlug, 160) || null,
    updated_at: new Date().toISOString()
  };
  if (!row.source_language || !row.target_language || !row.term || !row.translation) {
    const error = new Error('Faltan datos para guardar esta palabra.');
    error.status = 400;
    throw error;
  }
  const { data, error } = await supabase
    .from('user_saved_vocabulary')
    .upsert(row, {
      onConflict: 'user_id,source_language,target_language,term_key',
      ignoreDuplicates: false
    })
    .select('id,source_language,target_language,term,translation,context,lesson_slug,unit_slug,created_at')
    .single();
  if (error) throw error;
  return data;
}

async function deleteSavedVocabulary({ userId, id }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const { error } = await supabase
    .from('user_saved_vocabulary')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

module.exports = { listSavedVocabulary, saveVocabulary, deleteSavedVocabulary };
