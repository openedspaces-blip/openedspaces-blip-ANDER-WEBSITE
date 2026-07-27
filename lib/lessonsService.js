// lib/lessonsService.js
// Reads lessons from Supabase when configured (falling back to local static
// data if a language/level has no rows yet), and handles marking a lesson as
// complete: persists it, then recomputes XP, level, streak and badges.
const config = require('./config');
const { getSupabaseAdmin } = require('./supabaseClient');
const { getLocalLessons } = require('./lessonsData');
const devStore = require('./devStore');
const gamification = require('./gamification');
const { getUserEntitlements } = require('./entitlementsService');
const { sanitizeGrammarTestForClient } = require('./grammarTestSanitizer');
const { gradeQuestionBank } = require('./courseLessonsService');
const accessPolicy = require('./accessPolicyService');
const seedUnits = require('./seed-units.json');

const VALID_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const unitOrderByKey = new Map(
  seedUnits.map((unit) => [
    `${unit.target_language}:${unit.level}:${unit.slug}`,
    Number(unit.order_index)
  ])
);

function getUnitOrder(lesson, language) {
  const targetLanguage = lesson.targetLanguage || lesson.language || language;
  const fromSeed = unitOrderByKey.get(`${targetLanguage}:${lesson.level}:${lesson.unitId}`);
  if (fromSeed) return fromSeed;
  const inferred = Math.floor(Number(lesson.orderIndex || 0) / 10);
  return inferred > 0 ? inferred : 1;
}

function shapeSupabaseRow(row) {
  const content = row.content_json || {};
  return {
    slug: row.slug,
    targetLanguage: row.target_language,
    level: row.level,
    skill: row.skill,
    unitId: row.unit_slug || null,
    title: row.title,
    description: row.description || content.mission || '',
    accessTier: row.access_tier || (row.is_free === false ? 'premium' : 'free'),
    xpReward: row.xp_reward ?? content.xp_reward ?? 20,
    orderIndex: row.order_index ?? 0,
    intro: content.intro || row.description || '',
    vocabulary: content.vocabulary || [],
    dialogue: content.dialogue || [],
    reading: content.reading || null,
    extra: content.extra || null,
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
  return {
    ...lesson,
    exercises: (lesson.exercises || []).map(sanitizeExerciseForClient),
    extra: lesson.extra
      ? {
          ...lesson.extra,
          grammarTest: sanitizeGrammarTestForClient(lesson.extra.grammarTest),
          listeningComprehension: sanitizeGrammarTestForClient(
            lesson.extra.listeningComprehension
          )
        }
      : lesson.extra
  };
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
  const [remoteLessons, completedSlugs, entitlements] = await Promise.all([
    fetchFromSupabase(normalizedLevel, language),
    userId ? getCompletedSlugs(userId) : Promise.resolve(new Set()),
    getUserEntitlements(userId)
  ]);
  let lessons = remoteLessons;

  if (!lessons.length) {
    lessons = getLocalLessons(language)
      .filter((lesson) => lesson.level === normalizedLevel)
      .map((lesson) => ({ ...lesson }));
  }

  return lessons
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    .map((lesson) => {
      const unitOrder = getUnitOrder(lesson, language);
      const completed = completedSlugs.has(lesson.slug);
      const accessTier = accessPolicy.accessTierForUnit(normalizedLevel, unitOrder);
      return {
        ...sanitizeLessonForClient(lesson),
        unitOrder,
        accessTier,
        isFree: accessTier === 'free',
        completed,
        locked: !accessPolicy.canAccessLesson({
          level: normalizedLevel,
          unitOrder,
          entitlements,
          completed
        })
      };
    });
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
async function checkAnswer({ userId, slug, index, selectedOption }) {
  const lesson = await findLessonBySlug(slug);
  if (!lesson) {
    const err = new Error('Lesson not found.');
    err.status = 404;
    throw err;
  }
  const entitlements = await getUserEntitlements(userId);
  const language = lesson.targetLanguage || lesson.language || 'english';
  const unitOrder = getUnitOrder(lesson, language);
  if (!accessPolicy.canAccessLesson({ level: lesson.level, unitOrder, entitlements })) {
    throw accessPolicy.premiumRequiredError();
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

async function checkQuestionBankAnswer({ userId, slug, questionId, answer }) {
  const lesson = await findLessonBySlug(slug);
  if (!lesson) {
    const err = new Error('Lesson not found.');
    err.status = 404;
    throw err;
  }
  const entitlements = await getUserEntitlements(userId);
  const language = lesson.targetLanguage || lesson.language || 'english';
  const unitOrder = getUnitOrder(lesson, language);
  if (!accessPolicy.canAccessLesson({ level: lesson.level, unitOrder, entitlements })) {
    throw accessPolicy.premiumRequiredError();
  }
  const bank =
    lesson.extra?.grammarTest?.questions?.length
      ? lesson.extra.grammarTest
      : lesson.extra?.listeningComprehension;
  const question = bank?.questions?.find(
    (item) => String(item.id) === String(questionId)
  );
  if (!question) {
    const err = new Error('Question not found.');
    err.status = 404;
    throw err;
  }
  const result = gradeQuestionBank(bank, [{ questionId, answer }]).results.find(
    (item) => String(item.questionId) === String(questionId)
  );
  return { correct: Boolean(result?.correct) };
}

async function completeLesson({ userId, slug, answers = [], assessmentScope = '' }) {
  const lesson = await findLessonBySlug(slug);
  if (!lesson) {
    const err = new Error('Lesson not found.');
    err.status = 404;
    throw err;
  }

  const alreadyCompletedSlugs = await getCompletedSlugs(userId);
  const wasAlreadyCompleted = alreadyCompletedSlugs.has(slug);

  const entitlements = await getUserEntitlements(userId);
  const language = lesson.targetLanguage || lesson.language || 'english';
  const unitOrder = getUnitOrder(lesson, language);
  if (
    !accessPolicy.canAccessLesson({
      level: lesson.level,
      unitOrder,
      entitlements,
      completed: wasAlreadyCompleted
    })
  ) {
    throw accessPolicy.premiumRequiredError();
  }

  const grammarTest = lesson.extra?.grammarTest;
  const exercisesForAssessment =
    assessmentScope === 'reading_comprehension'
      ? (lesson.exercises || []).filter(
          (exercise) =>
            exercise.type === 'mcq' &&
            !(
              (exercise.options || []).length === 2 ||
              /^(true or false|vrai ou faux|verdadero o falso)\b/i.test(
                String(exercise.prompt || '')
              )
            )
        )
      : lesson.exercises;
  const scopedAnswers =
    assessmentScope === 'reading_comprehension'
      ? (Array.isArray(answers) ? answers : []).map((answer, index) => ({
          ...answer,
          index:
            answer.index ??
            (lesson.exercises || []).findIndex(
              (exercise) => String(exercise.id || '') === String(answer.exerciseId || '')
            ) ??
            index
        }))
      : answers;
  const grading = grammarTest?.questions?.length
    ? gradeQuestionBank(grammarTest, Array.isArray(answers) ? answers : [])
    : assessmentScope === 'reading_comprehension'
      ? gradeExercises(
          exercisesForAssessment,
          exercisesForAssessment.map((exercise) => {
            const originalIndex = (lesson.exercises || []).indexOf(exercise);
            const submitted = (scopedAnswers || []).find(
              (answer) => Number(answer.index) === originalIndex
            );
            return { ...submitted, index: exercisesForAssessment.indexOf(exercise) };
          })
        )
      : gradeExercises(lesson.exercises, Array.isArray(answers) ? answers : []);
  const { score, allAttempted, results = [] } = grading;
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
    score,
    results,
    bestScore: score,
    attemptNumber: 1
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

module.exports = {
  getLessons,
  completeLesson,
  checkAnswer,
  checkQuestionBankAnswer,
  getProgress,
  getCompletedCount
};
