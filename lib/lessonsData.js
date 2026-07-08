// lib/lessonsData.js
// Local fallback lesson content, keyed by language. The fallback intentionally
// reads the same seed file used to populate Supabase so offline/demo mode and
// the real backend stay aligned.
const seedLessons = require('./seed-lessons.json');

function shapeSeedLesson(row) {
  const content = row.content_json || {};
  return {
    slug: row.slug,
    level: row.level,
    skill: row.skill,
    title: row.title,
    description: row.description || content.mission || '',
    accessTier: row.access_tier || (row.is_free === false ? 'premium' : 'free'),
    xpReward: row.xp_reward ?? content.xp_reward ?? 20,
    orderIndex: row.order_index ?? 0,
    estimatedMinutes: row.estimated_minutes ?? 10,
    intro: content.intro || row.description || '',
    mission: content.mission || '',
    grammar: content.grammar || '',
    phrases: content.phrases || [],
    vocabulary: content.vocabulary || [],
    dialogue: content.dialogue || [],
    reading: content.reading || null,
    exercises: content.exercises || []
  };
}

const lessonsByLanguage = seedLessons.reduce((groups, row) => {
  const language = row.target_language || 'english';
  groups[language] = groups[language] || [];
  groups[language].push(shapeSeedLesson(row));
  return groups;
}, {});

Object.values(lessonsByLanguage).forEach((lessons) => {
  lessons.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
});

function getLocalLessons(language) {
  return lessonsByLanguage[language] || [];
}

module.exports = { lessonsByLanguage, getLocalLessons, shapeSeedLesson };
