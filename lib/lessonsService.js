const { getLocalLessons } = require('./lessonsData');
const { normalizeLanguage } = require('./worldSeed');

async function getLessons(language = 'english', level, supabase) {
  const normalizedLanguage = normalizeLanguage(language);

  if (supabase) {
    try {
      let query = supabase.from('lessons').select('*').eq('target_language', normalizedLanguage);
      if (level) {
        query = query.eq('level', level);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (error) {
      // Fall back to local data below.
    }
  }

  const localLessons = getLocalLessons(normalizedLanguage);
  return level ? localLessons.filter((lesson) => lesson.level === level) : localLessons;
}

module.exports = { getLessons };
