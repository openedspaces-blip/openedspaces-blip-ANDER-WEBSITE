// lib/gamification/streaks.js
// Daily streak computation, server-side source of truth.
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(start, end) {
  if (!start || !end) return Infinity;
  const startTime = Date.parse(`${start}T00:00:00Z`);
  const endTime = Date.parse(`${end}T00:00:00Z`);
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return Infinity;
  return Math.round((endTime - startTime) / 86400000);
}

// One missed day is forgiven once per rolling week; an additional or longer
// gap starts a fresh streak. XP and completed work are never removed.
function computeStreak({
  lastActiveDate,
  lastStreakGraceDate = null,
  streak = 0,
  longestStreak = 0,
  today = todayIso()
}) {
  if (lastActiveDate === today) {
    return {
      streak,
      longestStreak,
      lastActiveDate: today,
      lastStreakGraceDate,
      isNewDay: false,
      graceUsed: false
    };
  }

  const daysSincePractice = daysBetween(lastActiveDate, today);
  const graceAvailable = daysBetween(lastStreakGraceDate, today) >= 7;
  const graceUsed = daysSincePractice === 2 && graceAvailable && streak > 0;
  const nextStreak = daysSincePractice === 1 ? streak + 1 : graceUsed ? streak : 1;
  return {
    streak: nextStreak,
    longestStreak: Math.max(longestStreak || 0, nextStreak),
    lastActiveDate: today,
    lastStreakGraceDate: graceUsed ? today : lastStreakGraceDate,
    isNewDay: true,
    graceUsed
  };
}

module.exports = { todayIso, computeStreak };
