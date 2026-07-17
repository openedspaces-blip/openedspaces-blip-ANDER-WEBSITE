// lib/dashboardService.js
// Composes existing services into one payload for the student panel, so the
// frontend has exactly one loading->loaded transition instead of several
// independently-resolving fetches (and never has to show a fake number while
// waiting). Owns no data itself - every value comes from a service that
// already reads real Supabase rows (or the devStore fallback) elsewhere.
const preferencesService = require('./preferencesService');
const lessonsService = require('./lessonsService');
const courseLessonsService = require('./courseLessonsService');
const goalsService = require('./goalsService');
const activityService = require('./activityService');
const { getUserEntitlements } = require('./entitlementsService');

async function getDashboard(userId) {
  const [preferences, progress, goal, legacyCompleted, normalizedCompleted, activity, entitlements] =
    await Promise.all([
      preferencesService.getPreferences(userId),
      lessonsService.getProgress(userId),
      goalsService.getGoal(userId),
      lessonsService.getCompletedCount(userId),
      courseLessonsService.getCompletedCount(userId),
      activityService.getRecentActivity(userId, { limit: 8 }),
      getUserEntitlements(userId)
    ]);

  return {
    preferences,
    progress: progress.progress,
    streak: progress.streak,
    longestStreak: progress.longestStreak,
    nextLesson: progress.nextLesson,
    xp: progress.xp,
    level: progress.level,
    badges: progress.badges,
    // lesson_completions (legacy) and user_lesson_progress (normalized) key
    // off disjoint lesson-id spaces - a lesson is either one or the other,
    // never both - so summing their counts can't double-count.
    completedLessonsCount: legacyCompleted + normalizedCompleted,
    goal,
    activity,
    // Server-computed, never inferred from username/email on the client -
    // see lib/entitlementsService.js. The frontend uses this to hide the
    // Premium paywall/lock UI and show a role badge, never the reverse.
    entitlements
  };
}

module.exports = { getDashboard };
