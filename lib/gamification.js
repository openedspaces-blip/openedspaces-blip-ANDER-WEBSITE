const { completions, progress } = require('./devStore');

const BADGES = [
  { id: 'first-lesson', name: 'First Step', description: 'Complete your first lesson.' },
  { id: 'xp-500', name: 'Momentum', description: 'Reach 500 XP.' },
  { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak.' }
];

function computeLevel(xp) {
  return Math.floor((Number(xp) || 0) / 100) + 1;
}

function checkBadges(profile) {
  const owned = new Set(profile.badges || []);
  const unlocked = [];

  const conditions = [
    ['first-lesson', (profile.completedLessons || 0) >= 1],
    ['xp-500', (profile.xp || 0) >= 500],
    ['streak-7', (profile.streak || 0) >= 7]
  ];

  for (const [badgeId, condition] of conditions) {
    if (condition && !owned.has(badgeId)) {
      unlocked.push(badgeId);
      owned.add(badgeId);
    }
  }

  return unlocked;
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getPreviousIsoDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function createDefaultProfile(userId) {
  return {
    userId,
    xp: 0,
    level: 1,
    badges: [],
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    completedLessons: 0
  };
}

function normalizeProfile(userId, source) {
  const profile = source ? { ...source } : createDefaultProfile(userId);
  profile.userId = userId;
  profile.xp = Number(profile.xp || 0);
  profile.level = Number(profile.level || computeLevel(profile.xp));
  profile.badges = Array.isArray(profile.badges) ? [...profile.badges] : [];
  profile.streak = Number(profile.streak || 0);
  profile.longestStreak = Number(profile.longestStreak || 0);
  profile.lastActiveDate = profile.lastActiveDate || null;
  profile.completedLessons = Number(profile.completedLessons || 0);
  return profile;
}

async function updateProgress(userId, lessonSlug, score, supabase) {
  const today = getTodayIsoDate();
  const xpGain = Math.max(10, Math.min(100, Number(score) || 0));

  if (supabase) {
    try {
      const { data: existingRows } = await supabase.from('profiles').select('id, xp, level, badges, longest_streak, last_active_date').eq('id', userId).limit(1);
      const existing = normalizeProfile(userId, existingRows && existingRows[0] ? {
        userId,
        xp: existingRows[0].xp,
        level: existingRows[0].level,
        badges: existingRows[0].badges,
        longestStreak: existingRows[0].longest_streak,
        lastActiveDate: existingRows[0].last_active_date
      } : null);

      if (existing.lastActiveDate === today) {
        existing.streak = Math.max(existing.streak, 1);
      } else if (existing.lastActiveDate === getPreviousIsoDate(today)) {
        existing.streak += 1;
      } else {
        existing.streak = 1;
      }

      existing.xp += xpGain;
      existing.level = computeLevel(existing.xp);
      existing.lastActiveDate = today;
      existing.longestStreak = Math.max(existing.longestStreak, existing.streak);
      existing.completedLessons += 1;
      existing.badges = [...new Set([...(existing.badges || []), ...checkBadges(existing)])];

      await supabase.from('profiles').upsert({
        id: userId,
        xp: existing.xp,
        level: existing.level,
        badges: existing.badges,
        longest_streak: existing.longestStreak,
        last_active_date: existing.lastActiveDate
      }, { onConflict: 'id' });

      if (lessonSlug) {
        await supabase.from('lesson_completions').upsert({ user_id: userId, lesson_slug: lessonSlug, score: Number(score) || 0 });
      }

      return existing;
    } catch (error) {
      // Use in-memory fallback when development tables are unavailable.
    }
  }

  const completedSet = completions.get(userId) || new Set();
  const alreadyCompleted = completedSet.has(lessonSlug);
  if (!alreadyCompleted && lessonSlug) {
    completedSet.add(lessonSlug);
    completions.set(userId, completedSet);
  }

  const profile = normalizeProfile(userId, progress.get(userId));
  if (profile.lastActiveDate === today) {
    profile.streak = Math.max(profile.streak, 1);
  } else if (profile.lastActiveDate === getPreviousIsoDate(today)) {
    profile.streak += 1;
  } else {
    profile.streak = 1;
  }

  if (!alreadyCompleted) {
    profile.completedLessons += 1;
    profile.xp += xpGain;
  }

  profile.level = computeLevel(profile.xp);
  profile.lastActiveDate = today;
  profile.longestStreak = Math.max(profile.longestStreak, profile.streak);
  profile.badges = [...new Set([...(profile.badges || []), ...checkBadges(profile)])];
  progress.set(userId, profile);
  return profile;
}

async function getProgressProfile(userId, supabase) {
  if (supabase) {
    try {
      const { data } = await supabase.from('profiles').select('id, xp, level, badges, longest_streak, last_active_date').eq('id', userId).limit(1);
      if (data && data[0]) {
        const profile = normalizeProfile(userId, {
          userId,
          xp: data[0].xp,
          level: data[0].level,
          badges: data[0].badges,
          longestStreak: data[0].longest_streak,
          lastActiveDate: data[0].last_active_date,
          streak: data[0].longest_streak
        });
        return profile;
      }
    } catch (error) {
      // Fall back to dev storage.
    }
  }

  return normalizeProfile(userId, progress.get(userId));
}

module.exports = {
  BADGES,
  computeLevel,
  checkBadges,
  updateProgress,
  getProgressProfile
};
