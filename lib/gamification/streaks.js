// lib/gamification/streaks.js
// Daily streak computation, server-side source of truth.
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Given the last active date and current streak, returns the streak state
// for "today" - incrementing if the last activity was yesterday, resetting
// to 1 if there was a gap, and leaving it unchanged if already logged today.
function computeStreak({ lastActiveDate, streak = 0, longestStreak = 0 }) {
  const today = todayIso();
  if (lastActiveDate === today) {
    return { streak, longestStreak, lastActiveDate: today, isNewDay: false };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const nextStreak = lastActiveDate === yesterday ? streak + 1 : 1;
  return {
    streak: nextStreak,
    longestStreak: Math.max(longestStreak || 0, nextStreak),
    lastActiveDate: today,
    isNewDay: true
  };
}

module.exports = { todayIso, computeStreak };
