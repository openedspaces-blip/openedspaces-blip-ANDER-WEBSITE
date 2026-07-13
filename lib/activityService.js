// lib/activityService.js
// Builds a "recent activity" feed strictly from real, already-timestamped
// rows - never fabricated. Merges three real sources per user:
//   - lesson_completions (legacy lessons path, completed_at)
//   - user_lesson_progress + user_xp_events (normalized courses path,
//     completed_at / created_at - folded into ONE entry per lesson, since a
//     single completion writes both tables in the same request)
//   - user_goals (goal created / completed, selected_at / completed_at)
// There is no historical log anywhere in the schema for "level changed" or
// "streak updated" (only current-state columns on profiles/user_streaks), so
// those are intentionally not emitted as separate entries here - showing them
// would mean inventing timestamps.
const config = require('./config');
const { getSupabaseAdmin } = require('./supabaseClient');

async function getRecentActivity(userId, { limit = 8 } = {}) {
  if (!config.isSupabaseConfigured) return [];

  const supabase = getSupabaseAdmin();
  const entries = [];

  const { data: completions } = await supabase
    .from('lesson_completions')
    .select('completed_at, score, lessons!inner(title, skill)')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);
  (completions || []).forEach((row) => {
    entries.push({
      type: 'lesson_completed',
      at: row.completed_at,
      title: row.lessons?.title || 'Lección',
      skill: row.lessons?.skill || null,
      score: row.score ?? null,
      xp: null
    });
  });

  const { data: courseProgress } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id, completed_at, best_score, course_lessons!inner(title, skill)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit);

  const xpByLesson = new Map();
  const lessonIds = (courseProgress || []).map((row) => row.lesson_id).filter(Boolean);
  if (lessonIds.length) {
    const { data: xpEvents } = await supabase
      .from('user_xp_events')
      .select('lesson_id, amount, created_at')
      .eq('user_id', userId)
      .in('lesson_id', lessonIds)
      .order('created_at', { ascending: false });
    (xpEvents || []).forEach((row) => {
      // Keep only the most recent xp event per lesson (first one seen, since
      // the query is already ordered newest-first).
      if (!xpByLesson.has(row.lesson_id)) xpByLesson.set(row.lesson_id, row.amount);
    });
  }

  (courseProgress || []).forEach((row) => {
    entries.push({
      type: 'lesson_completed',
      at: row.completed_at,
      title: row.course_lessons?.title || 'Lección',
      skill: row.course_lessons?.skill || null,
      score: row.best_score ?? null,
      xp: xpByLesson.get(row.lesson_id) ?? null
    });
  });

  const { data: goal } = await supabase
    .from('user_goals')
    .select('goal_key, selected_at, completed_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (goal) {
    entries.push({ type: 'goal_created', at: goal.selected_at, goalKey: goal.goal_key });
    if (goal.completed_at) {
      entries.push({ type: 'goal_completed', at: goal.completed_at, goalKey: goal.goal_key });
    }
  }

  return entries
    .filter((entry) => entry.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, limit);
}

module.exports = { getRecentActivity };
