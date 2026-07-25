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
const verbProgressService = require('./verbProgressService');
const { getUserEntitlements } = require('./entitlementsService');

async function getDashboard(userId) {
  const preferences = await preferencesService.getPreferences(userId);
  const languageCode = preferences?.language || 'english';
  const levelCode = preferences?.level || 'A1';
  const [progress, goal, legacyCompleted, normalizedCompleted, activity, entitlements, courseProgress, verbProgress] =
    await Promise.all([
      lessonsService.getProgress(userId),
      goalsService.getGoal(userId),
      lessonsService.getCompletedCount(userId),
      courseLessonsService.getCompletedCount(userId),
      activityService.getRecentActivity(userId, { limit: 8 }),
      getUserEntitlements(userId),
      courseLessonsService.getCourseProgressSummary({ userId, languageCode, levelCode }),
      verbProgressService.getUnitProgress({ userId, languageCode, levelCode })
    ]);

  let scopedProgress = null;
  if (courseProgress) {
    const verbByUnit = new Map(verbProgress.map((row) => [row.unitSlug, row]));
    const units = courseProgress.units.map((unit) => {
      const verb = verbByUnit.get(unit.unitSlug);
      const totalActivities = unit.totalActivities + 1;
      const completedActivities =
        unit.completedActivities + (verb?.status === 'completed' ? 1 : 0);
      const scoreTotal = unit.scoreTotal + Number(verb?.bestScore || 0);
      return {
        unitSlug: unit.unitSlug,
        title: unit.title,
        order: unit.order,
        completedActivities,
        totalActivities,
        progressPercent: totalActivities ? Math.round(scoreTotal / totalActivities) : 0
      };
    });
    const totalActivities = courseProgress.totalActivities + units.length;
    const completedActivities =
      courseProgress.completedActivities +
      verbProgress.filter((row) => row.status === 'completed').length;
    const scoreTotal =
      courseProgress.scoreTotal +
      verbProgress.reduce((sum, row) => sum + Number(row.bestScore || 0), 0);
    scopedProgress = {
      language: languageCode,
      level: levelCode,
      completedActivities,
      totalActivities,
      progressPercent: totalActivities ? Math.round(scoreTotal / totalActivities) : 0,
      nextLesson: courseProgress.nextLesson,
      units
    };
  }

  return {
    preferences,
    progress: scopedProgress?.progressPercent ?? progress.progress,
    streak: progress.streak,
    longestStreak: progress.longestStreak,
    nextLesson: scopedProgress?.nextLesson ?? progress.nextLesson,
    xp: progress.xp,
    level: progress.level,
    badges: progress.badges,
    // lesson_completions (legacy) and user_lesson_progress (normalized) key
    // off disjoint lesson-id spaces - a lesson is either one or the other,
    // never both - so summing their counts can't double-count.
    completedLessonsCount: legacyCompleted + normalizedCompleted,
    courseProgress: scopedProgress,
    goal,
    activity,
    // Server-computed, never inferred from username/email on the client -
    // see lib/entitlementsService.js. The frontend uses this to hide the
    // Premium paywall/lock UI and show a role badge, never the reverse.
    entitlements
  };
}

module.exports = { getDashboard };
