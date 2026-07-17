// lib/lessonsService.js
// Reads lessons from Supabase when configured (falling back to local static
// data if a language/level has no rows yet), and handles marking a lesson as
// complete: persists it, then recomputes XP, level, streak and badges.
const config = require('./config');
const { getSupabaseAdmin } = require('./supabaseClient');
const { getLocalLessons } = require('./lessonsData');
const devStore = require('./devStore');
const gamification = require('./gamification');
const { isPremiumActive } = require('./voiceAccessService');
const { getUserEntitlements } = require('./entitlementsService');

const VALID_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

function shapeSupabaseRow(row) {
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
    intro: content.intro || row.description || '',
    vocabulary: content.vocabulary || [],
    dialogue: content.dialogue || [],
    reading: content.reading || null,
    exercises: content.exercises || [],
    audioUrl: row.audio_url || null
  };
}

// Strips the correct answer out of each exercise so it never reaches the
// browser (as an API response or, via getLessons, the generated
// src/worlds/*/content.js fallback). The real exercises - kept intact -
// only ever get read server-side, by gradeExercises below.
function sanitizeExerciseForClient({ answer, ...rest }) {
  return rest;
}

function sanitizeLessonForClient(lesson) {
  return { ...lesson, exercises: (lesson.exercises || []).map(sanitizeExerciseForClient) };
}

// Grades submitted answers against the real exercise list (only ever read
// server-side). MCQ answers are checked against `exercise.answer`; open
// exercises (writing/speaking prompts) have no objective answer, so they
// only need to be marked as attempted. Returns the actual score - never
// trusts anything the client claims about its own performance.
function gradeExercises(realExercises = [], submittedAnswers = []) {
  let mcqTotal = 0;
  let mcqCorrect = 0;
  let allAttempted = true;

  realExercises.forEach((exercise, index) => {
    const submission = submittedAnswers.find((item) => Number(item?.index) === index);

    if (exercise.type === 'mcq') {
      mcqTotal += 1;
      if (
        !submission ||
        submission.selectedOption === undefined ||
        submission.selectedOption === null
      ) {
        allAttempted = false;
        return;
      }
      if (Number(submission.selectedOption) === Number(exercise.answer)) {
        mcqCorrect += 1;
      }
      return;
    }

    if (!submission || !submission.practiced) {
      allAttempted = false;
    }
  });

  const score = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 100;
  return { score, allAttempted, mcqTotal, mcqCorrect };
}

async function fetchFromSupabase(level, language) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from('lessons')
    .select('*')
    .eq('level', level)
    .order('order_index', { ascending: true });

  // The lessons table uses `target_language` for the language being learned.
  if (language) query = query.eq('target_language', language);

  const { data, error } = await query;
  if (error || !data) return [];
  return data.filter((row) => row.is_published !== false).map(shapeSupabaseRow);
}

async function getLessons({ level = 'A1', language = 'english', userId } = {}) {
  const normalizedLevel = VALID_LEVELS.has(level) ? level : 'A1';
  let lessons = await fetchFromSupabase(normalizedLevel, language);

  if (!lessons.length) {
    lessons = getLocalLessons(language)
      .filter((lesson) => lesson.level === normalizedLevel)
      .map((lesson) => ({ ...lesson }));
  }

  const completedSlugs = userId ? await getCompletedSlugs(userId) : new Set();
  const { hasFullAccess: isPremiumUser } = await getUserEntitlements(userId);

  return lessons
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    .map((lesson) => ({
      ...sanitizeLessonForClient(lesson),
      isFree: lesson.accessTier !== 'premium',
      completed: completedSlugs.has(lesson.slug),
      locked: lesson.accessTier === 'premium' && !isPremiumUser && !completedSlugs.has(lesson.slug)
    }));
}

async function getCompletedSlugs(userId) {
  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('lesson_completions')
      .select('lesson_id, lessons!inner(slug)')
      .eq('user_id', userId);
    return new Set((data || []).map((row) => row.lessons?.slug).filter(Boolean));
  }
  return devStore.getCompletedSlugs(userId);
}

async function getCompletedCount(userId) {
  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { count } = await supabase
      .from('lesson_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    return count || 0;
  }
  return devStore.getCompletedSlugs(userId).size;
}

async function getProfileSnapshot(userId) {
  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (!data) return null;
    return {
      progress: data.progress || 0,
      streak: data.streak || 0,
      longestStreak: data.longest_streak || 0,
      lastActiveDate: data.last_active_date || null,
      nextLesson: data.next_lesson || 'Listening A1',
      xp: data.xp || 0,
      level: data.level || gamification.levelForXp(data.xp || 0),
      badges: data.badges || [],
      accessTier: data.access_tier || 'free'
    };
  }
  return devStore.getProfile(userId);
}

async function saveProfileSnapshot(userId, patch) {
  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    await supabase
      .from('profiles')
      .update({
        progress: patch.progress,
        streak: patch.streak,
        longest_streak: patch.longestStreak,
        last_active_date: patch.lastActiveDate,
        next_lesson: patch.nextLesson,
        xp: patch.xp,
        level: patch.level,
        badges: patch.badges,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    return patch;
  }
  return devStore.saveProfile(userId, patch);
}

async function findLessonBySlug(slug, language) {
  // Try every known language's local dataset and, when configured, Supabase.
  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('lessons').select('*').eq('slug', slug).maybeSingle();
    if (data) return shapeSupabaseRow(data);
  }
  const { lessonsByLanguage } = require('./lessonsData');
  const languages = language ? [language] : Object.keys(lessonsByLanguage);
  for (const lang of languages) {
    const found = (lessonsByLanguage[lang] || []).find((lesson) => lesson.slug === slug);
    if (found) return { ...found };
  }
  // Last resort: search every language.
  for (const lang of Object.keys(lessonsByLanguage)) {
    const found = lessonsByLanguage[lang].find((lesson) => lesson.slug === slug);
    if (found) return { ...found };
  }
  return null;
}

async function markCompletion(userId, slug, score) {
  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (lesson) {
      await supabase
        .from('lesson_completions')
        .upsert(
          { user_id: userId, lesson_id: lesson.id, score },
          { onConflict: 'user_id,lesson_id' }
        );
    }
  } else {
    devStore.markCompleted(userId, slug);
  }
}

// Checks a single answer against the real exercise, server-side only. Used
// for the immediate feedback the student sees while practicing; the
// completion endpoint below re-grades everything independently, so this
// call is purely for UX and isn't itself trusted for progress.
async function checkAnswer({ slug, index, selectedOption }) {
  const lesson = await findLessonBySlug(slug);
  if (!lesson) {
    const err = new Error('Lesson not found.');
    err.status = 404;
    throw err;
  }

  const exercise = (lesson.exercises || [])[Number(index)];
  if (!exercise) {
    const err = new Error('Exercise not found.');
    err.status = 404;
    throw err;
  }

  if (exercise.type !== 'mcq') {
    return { practiced: true };
  }

  const correct = Number(selectedOption) === Number(exercise.answer);
  return { correct, correctOption: Number(exercise.answer) };
}

async function completeLesson({ userId, slug, answers = [] }) {
  const lesson = await findLessonBySlug(slug);
  if (!lesson) {
    const err = new Error('Lesson not found.');
    err.status = 404;
    throw err;
  }

  const alreadyCompletedSlugs = await getCompletedSlugs(userId);
  const wasAlreadyCompleted = alreadyCompletedSlugs.has(slug);

  // Real server-side enforcement of the premium lock (mirrors the `locked`
  // flag already computed for getLessons(): premium && !isPremiumActive &&
  // not already completed) - previously this endpoint scored and paid XP
  // for any authenticated user regardless of accessTier, relying only on
  // the UI hiding/disabling the button.
  if (lesson.accessTier === 'premium' && !wasAlreadyCompleted) {
    let profileRow = null;
    if (config.isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('profiles')
        .select('role, access_tier, subscription_status, subscription_expires_at')
        .eq('id', userId)
        .maybeSingle();
      profileRow = data;
    }
    if (!isPremiumActive(profileRow)) {
      const err = new Error('Esta lección es exclusiva de ANDERGO Premium.');
      err.status = 403;
      throw err;
    }
  }

  const { score, allAttempted } = gradeExercises(
    lesson.exercises,
    Array.isArray(answers) ? answers : []
  );
  if (!allAttempted) {
    const err = new Error(
      'Debes completar todos los ejercicios de la lección antes de terminarla.'
    );
    err.status = 400;
    throw err;
  }

  await markCompletion(userId, slug, score);

  const profile = await getProfileSnapshot(userId);
  const streakResult = gamification.computeStreak({
    lastActiveDate: profile.lastActiveDate,
    streak: profile.streak,
    longestStreak: profile.longestStreak
  });

  const earnedXp = wasAlreadyCompleted
    ? Math.round((lesson.xpReward || 20) * 0.2)
    : lesson.xpReward || 20;
  const nextXp = (profile.xp || 0) + earnedXp;
  const { level } = gamification.xpProgress(nextXp);
  const leveledUp = level > (profile.level || 1);

  const completedSlugs = new Set(alreadyCompletedSlugs);
  completedSlugs.add(slug);
  const languagesStarted = new Set(
    Object.entries(require('./lessonsData').lessonsByLanguage)
      .filter(([, lessons]) => lessons.some((l) => completedSlugs.has(l.slug)))
      .map(([lang]) => lang)
  ).size;

  const { allBadgeIds, newlyUnlocked } = gamification.evaluateBadges(profile.badges, {
    completedCount: completedSlugs.size,
    streak: streakResult.streak,
    level,
    languagesStarted,
    hasPerfectScore: score >= 100
  });

  const progressPercent = Math.min(100, completedSlugs.size * 12);

  const updatedProfile = await saveProfileSnapshot(userId, {
    progress: progressPercent,
    streak: streakResult.streak,
    longestStreak: streakResult.longestStreak,
    lastActiveDate: streakResult.lastActiveDate,
    nextLesson: `${lesson.skill} ${lesson.level}`,
    xp: nextXp,
    level,
    badges: allBadgeIds,
    accessTier: profile.accessTier
  });

  return {
    ok: true,
    progress: updatedProfile.progress,
    streak: updatedProfile.streak,
    longestStreak: updatedProfile.longestStreak,
    nextLesson: updatedProfile.nextLesson,
    xp: updatedProfile.xp,
    level: updatedProfile.level,
    badges: updatedProfile.badges,
    newBadges: newlyUnlocked,
    leveledUp,
    earnedXp,
    score
  };
}

async function getProgress(userId) {
  const profile = await getProfileSnapshot(userId);
  return {
    progress: profile.progress,
    streak: profile.streak,
    longestStreak: profile.longestStreak,
    nextLesson: profile.nextLesson,
    xp: profile.xp,
    level: profile.level,
    badges: profile.badges
  };
}

module.exports = { getLessons, completeLesson, checkAnswer, getProgress, getCompletedCount };
