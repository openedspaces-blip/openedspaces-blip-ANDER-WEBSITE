// lib/courseLessonsService.js
// Reads/writes the normalized courses/course_lessons/lesson_sections/
// exercises/exercise_options schema (supabase/migrations/202607120001_*).
// Only takes over for a language+level once a `courses` row exists for it
// (currently: English A1 only) - api/lessons.js and friends fall back to
// the legacy lib/lessonsService.js (content_json) for everything else.
//
// The one rule that matters everywhere in this file: exercise_options.is_correct
// is read here and NEVER returned to callers outside gradeExercises/checkAnswer.
// Every lesson shape sent to the API only ever exposes option id + text.
const { getSupabaseAdmin } = require('./supabaseClient');
const gamification = require('./gamification');

async function findCourse(languageCode, levelCode) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: language } = await supabase
    .from('languages')
    .select('id')
    .eq('code', languageCode)
    .maybeSingle();
  if (!language) return null;
  const { data: level } = await supabase
    .from('levels')
    .select('id')
    .eq('code', levelCode)
    .maybeSingle();
  if (!level) return null;

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('language_id', language.id)
    .eq('level_id', level.id)
    .maybeSingle();

  return course || null;
}

async function hasCourse(languageCode, levelCode) {
  return Boolean(await findCourse(languageCode, levelCode));
}

// Lets the API layer decide, per slug, whether a lesson-scoped request
// (start/check-answer/complete) belongs to the normalized schema or should
// fall back to the legacy content_json-based lessonsService.
async function hasLesson(slug) {
  return Boolean(await findLessonRowBySlug(slug));
}

async function findLessonRowBySlug(slug) {
  const supabase = getSupabaseAdmin();
  // Without this guard, hasLesson()/checkAnswer()/completeLesson()/startLesson()
  // throw a null-reference error for every slug whenever Supabase isn't
  // configured (dev/test/no-credentials environments) - server.js's outer
  // try/catch turns that into a generic 500 ("No se pudo verificar la
  // respuesta."/"No se pudo completar la lección."), masking the real cause
  // and preventing the intended fallback to the legacy lessonsService path.
  // findCourse() above already has this same guard; this one was missing it.
  if (!supabase) return null;
  const { data } = await supabase.from('course_lessons').select('*').eq('slug', slug).maybeSingle();
  return data || null;
}

// Loads one lesson's full content (sections + exercises + options, options
// include is_correct) - internal use only (grading, shaping for the client).
async function loadLessonFull(lessonRow) {
  const supabase = getSupabaseAdmin();

  const [{ data: sections }, { data: exerciseRows }] = await Promise.all([
    supabase.from('lesson_sections').select('*').eq('lesson_id', lessonRow.id).order('order_index'),
    supabase.from('exercises').select('*').eq('lesson_id', lessonRow.id).order('order_index')
  ]);

  const exerciseIds = (exerciseRows || []).map((row) => row.id);
  let optionsByExercise = {};
  if (exerciseIds.length) {
    const { data: optionRows } = await supabase
      .from('exercise_options')
      .select('*')
      .in('exercise_id', exerciseIds)
      .order('order_index');
    optionsByExercise = (optionRows || []).reduce((acc, opt) => {
      (acc[opt.exercise_id] = acc[opt.exercise_id] || []).push(opt);
      return acc;
    }, {});
  }

  const intro = (sections || []).find((s) => s.type === 'intro')?.line || '';
  const vocabulary = (sections || [])
    .filter((s) => s.type === 'vocabulary_item')
    .map((s) => ({ word: s.word, translation: s.translation, example: s.example }));
  const dialogue = (sections || [])
    .filter((s) => s.type === 'dialogue_line')
    .map((s) => ({ speaker: s.speaker, line: s.line, translation: s.translation }));
  const readingSection = (sections || []).find((s) => s.type === 'reading');
  const reading = readingSection
    ? {
        title: readingSection.reading_title,
        text: readingSection.reading_text,
        questions: readingSection.reading_questions || []
      }
    : null;

  const exercises = (exerciseRows || []).map((row) => ({
    id: row.id,
    type: row.type,
    prompt: row.prompt,
    options: (optionsByExercise[row.id] || []).map((opt) => ({
      id: opt.id,
      text: opt.option_text,
      isCorrect: opt.is_correct
    }))
  }));

  return { ...lessonRow, intro, vocabulary, dialogue, reading, exercises };
}

// Strips is_correct before anything reaches the client.
function sanitizeLessonForClient(lesson) {
  return {
    ...lesson,
    exercises: lesson.exercises.map(({ options, ...rest }) => ({
      ...rest,
      options: options.map(({ id, text }) => ({ id, text }))
    }))
  };
}

async function getUserProgressMap(userId, lessonIds) {
  if (!userId || !lessonIds.length) return {};
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id, status, progress_percent, best_score')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);
  return (data || []).reduce((acc, row) => {
    acc[row.lesson_id] = row;
    return acc;
  }, {});
}

// Units are optional (only English A1 has any today) - resolves each
// course_lessons.unit_id (a uuid) back to its course_units.slug, so the
// client-facing `unitId` is a stable string that matches the one shipped in
// the static fallback bundle (src/worlds/<language>/content.js), regardless
// of whether the lesson came from Supabase or the local fallback.
async function getUnitSlugMap(courseId) {
  const supabase = getSupabaseAdmin();
  const { data: unitRows } = await supabase
    .from('course_units')
    .select('id, slug')
    .eq('course_id', courseId);
  return (unitRows || []).reduce((acc, unit) => {
    acc[unit.id] = unit.slug;
    return acc;
  }, {});
}

async function getLessons({ languageCode, levelCode, userId }) {
  const course = await findCourse(languageCode, levelCode);
  if (!course) return null; // signals "no normalized course for this combo"

  const supabase = getSupabaseAdmin();
  const [{ data: lessonRows, error }, unitSlugById] = await Promise.all([
    supabase
      .from('course_lessons')
      .select('*')
      .eq('course_id', course.id)
      .eq('is_published', true)
      .order('order_index'),
    getUnitSlugMap(course.id)
  ]);
  if (error) throw new Error(`Could not read course_lessons: ${error.message}`);

  const fullLessons = await Promise.all((lessonRows || []).map(loadLessonFull));
  const progressMap = await getUserProgressMap(
    userId,
    fullLessons.map((l) => l.id)
  );

  return fullLessons.map((lesson) => {
    const progress = progressMap[lesson.id];
    return sanitizeLessonForClient({
      ...lesson,
      slug: lesson.slug,
      level: levelCode,
      skill: lesson.skill,
      unitId: unitSlugById[lesson.unit_id] || null,
      title: lesson.title,
      description: lesson.description,
      accessTier: lesson.access_tier,
      xpReward: lesson.xp_reward,
      orderIndex: lesson.order_index,
      audioUrl: lesson.audio_url,
      isFree: lesson.access_tier !== 'premium',
      completed: progress?.status === 'completed',
      locked: lesson.access_tier === 'premium' && progress?.status !== 'completed',
      progressStatus: progress?.status || 'not_started',
      bestScore: progress?.best_score ?? null
    });
  });
}

async function getLessonDetail({ slug, userId }) {
  const lessonRow = await findLessonRowBySlug(slug);
  if (!lessonRow) return null;
  const full = await loadLessonFull(lessonRow);
  const progressMap = await getUserProgressMap(userId, [full.id]);
  const progress = progressMap[full.id];

  let unitId = null;
  if (full.unit_id) {
    const supabase = getSupabaseAdmin();
    const { data: unit } = await supabase
      .from('course_units')
      .select('slug')
      .eq('id', full.unit_id)
      .maybeSingle();
    unitId = unit?.slug || null;
  }

  return sanitizeLessonForClient({
    ...full,
    unitId,
    accessTier: full.access_tier,
    xpReward: full.xp_reward,
    orderIndex: full.order_index,
    audioUrl: full.audio_url,
    isFree: full.access_tier !== 'premium',
    completed: progress?.status === 'completed',
    locked: full.access_tier === 'premium' && progress?.status !== 'completed',
    progressStatus: progress?.status || 'not_started',
    bestScore: progress?.best_score ?? null
  });
}

async function startLesson({ userId, slug }) {
  const lessonRow = await findLessonRowBySlug(slug);
  if (!lessonRow) {
    const err = new Error('Lesson not found.');
    err.status = 404;
    throw err;
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonRow.id)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'not_started') {
      await supabase
        .from('user_lesson_progress')
        .update({
          status: 'in_progress',
          started_at: existing.started_at || new Date().toISOString()
        })
        .eq('id', existing.id);
    }
    return { status: existing.status === 'not_started' ? 'in_progress' : existing.status };
  }

  const { error } = await supabase.from('user_lesson_progress').insert({
    user_id: userId,
    lesson_id: lessonRow.id,
    status: 'in_progress',
    started_at: new Date().toISOString(),
    attempts_count: 0
  });
  if (error) throw new Error(`Could not start lesson: ${error.message}`);

  return { status: 'in_progress' };
}

async function checkAnswer({ userId, slug, exerciseId, selectedOptionId }) {
  const lessonRow = await findLessonRowBySlug(slug);
  if (!lessonRow) {
    const err = new Error('Lesson not found.');
    err.status = 404;
    throw err;
  }

  const supabase = getSupabaseAdmin();
  const { data: exercise } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .eq('lesson_id', lessonRow.id)
    .maybeSingle();
  if (!exercise) {
    const err = new Error('Exercise not found.');
    err.status = 404;
    throw err;
  }

  if (exercise.type !== 'mcq') {
    return { practiced: true };
  }

  const { data: options } = await supabase
    .from('exercise_options')
    .select('*')
    .eq('exercise_id', exerciseId);
  const correctOption = (options || []).find((opt) => opt.is_correct);
  const correct =
    Boolean(selectedOptionId) && String(selectedOptionId) === String(correctOption?.id);

  if (userId) {
    await supabase.from('user_exercise_attempts').insert({
      user_id: userId,
      exercise_id: exerciseId,
      selected_option_id: selectedOptionId || null,
      is_correct: correct
    });
  }

  return { correct, correctOptionId: correctOption?.id || null };
}

// Re-grades every exercise in the lesson from the real exercise_options
// (never trusts the client's own claim of correctness).
async function gradeExercises(lessonId, submittedAnswers = []) {
  const supabase = getSupabaseAdmin();
  const { data: exerciseRows } = await supabase
    .from('exercises')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index');
  const exerciseIds = (exerciseRows || []).map((row) => row.id);

  let optionsByExercise = {};
  if (exerciseIds.length) {
    const { data: optionRows } = await supabase
      .from('exercise_options')
      .select('*')
      .in('exercise_id', exerciseIds);
    optionsByExercise = (optionRows || []).reduce((acc, opt) => {
      (acc[opt.exercise_id] = acc[opt.exercise_id] || []).push(opt);
      return acc;
    }, {});
  }

  let mcqTotal = 0;
  let mcqCorrect = 0;
  let allAttempted = true;

  for (const exercise of exerciseRows || []) {
    const submission = submittedAnswers.find(
      (item) => String(item?.exerciseId) === String(exercise.id)
    );

    if (exercise.type === 'mcq') {
      mcqTotal += 1;
      if (!submission || !submission.selectedOptionId) {
        allAttempted = false;
        continue;
      }
      const correctOption = (optionsByExercise[exercise.id] || []).find((opt) => opt.is_correct);
      if (correctOption && String(correctOption.id) === String(submission.selectedOptionId)) {
        mcqCorrect += 1;
      }
      continue;
    }

    if (!submission || !submission.practiced) {
      allAttempted = false;
    }
  }

  const score = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 100;
  return { score, allAttempted, totalExercises: (exerciseRows || []).length };
}

async function getProfileSnapshot(userId) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return {
    progress: data?.progress || 0,
    streak: data?.streak || 0,
    longestStreak: data?.longest_streak || 0,
    lastActiveDate: data?.last_active_date || null,
    xp: data?.xp || 0,
    level: data?.level || gamification.levelForXp(data?.xp || 0),
    badges: data?.badges || [],
    accessTier: data?.access_tier || 'free'
  };
}

async function completeLesson({ userId, slug, answers = [] }) {
  const lessonRow = await findLessonRowBySlug(slug);
  if (!lessonRow) {
    const err = new Error('Lesson not found.');
    err.status = 404;
    throw err;
  }

  const { score, allAttempted } = await gradeExercises(
    lessonRow.id,
    Array.isArray(answers) ? answers : []
  );
  if (!allAttempted) {
    const err = new Error(
      'Debes completar todos los ejercicios de la lección antes de terminarla.'
    );
    err.status = 400;
    throw err;
  }

  const supabase = getSupabaseAdmin();

  const { data: existingProgress } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonRow.id)
    .maybeSingle();

  const wasAlreadyCompleted = existingProgress?.status === 'completed';
  const attemptsCount = (existingProgress?.attempts_count || 0) + 1;
  const bestScore = Math.max(score, existingProgress?.best_score || 0);

  await supabase.from('user_lesson_progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonRow.id,
      status: 'completed',
      progress_percent: 100,
      best_score: bestScore,
      attempts_count: attemptsCount,
      started_at: existingProgress?.started_at || new Date().toISOString(),
      completed_at: new Date().toISOString()
    },
    { onConflict: 'user_id,lesson_id' }
  );

  const profile = await getProfileSnapshot(userId);
  const streakResult = gamification.computeStreak({
    lastActiveDate: profile.lastActiveDate,
    streak: profile.streak,
    longestStreak: profile.longestStreak
  });

  await supabase.from('user_streaks').upsert(
    {
      user_id: userId,
      current_streak: streakResult.streak,
      longest_streak: streakResult.longestStreak,
      last_active_date: streakResult.lastActiveDate,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id' }
  );

  const earnedXp = wasAlreadyCompleted
    ? Math.round((lessonRow.xp_reward || 20) * 0.2)
    : lessonRow.xp_reward || 20;
  const nextXp = (profile.xp || 0) + earnedXp;
  const { level } = gamification.xpProgress(nextXp);
  const leveledUp = level > (profile.level || 1);

  await supabase.from('user_xp_events').insert({
    user_id: userId,
    amount: earnedXp,
    reason: wasAlreadyCompleted ? 'lesson_retry' : 'lesson_complete',
    lesson_id: lessonRow.id
  });

  const { data: completedLessons } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('status', 'completed');
  const completedCount = completedLessons?.length || 0;

  const { allBadgeIds, newlyUnlocked } = gamification.evaluateBadges(profile.badges, {
    completedCount,
    streak: streakResult.streak,
    level,
    languagesStarted: 1, // English A1 is the only migrated course for now
    hasPerfectScore: score >= 100
  });

  const progressPercent = Math.min(100, completedCount * 12);

  await supabase
    .from('profiles')
    .update({
      progress: progressPercent,
      streak: streakResult.streak,
      longest_streak: streakResult.longestStreak,
      last_active_date: streakResult.lastActiveDate,
      next_lesson: `${lessonRow.skill} A1`,
      xp: nextXp,
      level,
      badges: allBadgeIds,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  return {
    ok: true,
    progress: progressPercent,
    streak: streakResult.streak,
    longestStreak: streakResult.longestStreak,
    nextLesson: `${lessonRow.skill} A1`,
    xp: nextXp,
    level,
    badges: allBadgeIds,
    newBadges: newlyUnlocked,
    leveledUp,
    earnedXp,
    score
  };
}

async function getCompletedCount(userId) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !userId) return 0;

  const { count } = await supabase
    .from('user_lesson_progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');
  return count || 0;
}

module.exports = {
  hasCourse,
  hasLesson,
  getLessons,
  getLessonDetail,
  startLesson,
  checkAnswer,
  completeLesson,
  getCompletedCount
};
