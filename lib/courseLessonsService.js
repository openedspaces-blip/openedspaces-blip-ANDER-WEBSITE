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
const { getUserEntitlements } = require('./entitlementsService');
const { sanitizeGrammarTestForClient } = require('./grammarTestSanitizer');
const accessPolicy = require('./accessPolicyService');

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
        questions: readingSection.reading_questions || [],
        references: Array.isArray(lessonRow.extra?.readingReferences)
          ? lessonRow.extra.readingReferences
          : [],
        // Optional: only English A1 readings have these today (see
        // scripts/content/english-a1-units.js). parts paginates the reading
        // into "Parte X de 3" (renderReadingView falls back to the single
        // `text` block above when absent, so every other reading is
        // unaffected). ordering is a low-stakes "put these events in order"
        // activity, self-checked client-side (its events aren't a secured
        // answer key the way mcq options are - unlike exercise_options,
        // nothing here needs service-role-only access).
        parts: readingSection.reading_parts || null,
        ordering: readingSection.reading_ordering || null
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

  // Dictation segments (see 202607220001_rich_listening_content.sql):
  // id/order/audio paths only - `text` stays service-role-only and is
  // never selected here, so it can never leak into a lesson response.
  const { data: dictationRows } = await supabase
    .from('lesson_dictation_segments')
    .select('id, order_index, start_time, end_time, normal_file_path, slow_file_path, very_slow_file_path')
    .eq('lesson_id', lessonRow.id)
    .order('order_index');
  const dictation = (dictationRows || []).length
    ? {
        segments: dictationRows.map((row) => ({
          id: row.id,
          order: row.order_index,
          startTime: row.start_time,
          endTime: row.end_time,
          normalAudioUrl: row.normal_file_path,
          slowAudioUrl: row.slow_file_path,
          verySlowAudioUrl: row.very_slow_file_path
        }))
      }
    : null;

  return {
    ...lessonRow,
    intro,
    vocabulary,
    dialogue,
    reading,
    exercises,
    // mission/grammar/phrases (course_lessons.mission/grammar_note/phrases,
    // see supabase/migrations/202607200001_dialogue_skill_and_mission_fields.sql)
    // - null on any row seeded before that migration, so this is a pure
    // addition, not a behavior change, for rows that predate it.
    mission: lessonRow.mission || '',
    grammar: lessonRow.grammar_note || '',
    phrases: lessonRow.phrases || [],
    // extra (course_lessons.extra jsonb) + dictation segments - both from
    // 202607220001_rich_listening_content.sql, null/absent on any row
    // predating that migration (English/French A1 unaffected).
    extra: lessonRow.extra || null,
    dictation
  };
}

// Normalizes a dictation answer the same way on both segments before
// comparing: case, duplicate whitespace and trailing basic punctuation are
// ignored (per spec), everything else (word choice, order, accents) counts.
function normalizeDictationText(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?¡¿]+$/g, '')
    .replace(/\s+/g, ' ');
}

// Word-level diff via LCS so we can tell correct/omitted/added/reordered
// words apart, not just "right or wrong". Grading always reads the real
// segment text server-side (service role) - the client only ever submits
// its own attempt and receives the scored result back, never the answer
// key itself (see the table comment in 202607220001_rich_listening_content.sql).
function diffDictationWords(expectedWords, submittedWords) {
  const n = expectedWords.length;
  const m = submittedWords.length;
  const lcs = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      lcs[i][j] =
        expectedWords[i - 1] === submittedWords[j - 1]
          ? lcs[i - 1][j - 1] + 1
          : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
    }
  }

  const mistakes = [];
  let correctWords = 0;
  let i = n;
  let j = m;
  const matchedExpected = new Set();
  while (i > 0 && j > 0) {
    if (expectedWords[i - 1] === submittedWords[j - 1]) {
      correctWords += 1;
      matchedExpected.add(i - 1);
      i -= 1;
      j -= 1;
    } else if (lcs[i - 1][j] >= lcs[i][j - 1]) {
      mistakes.push({ type: 'omitted', word: expectedWords[i - 1], position: i - 1 });
      i -= 1;
    } else {
      mistakes.push({ type: 'added', word: submittedWords[j - 1], position: j - 1 });
      j -= 1;
    }
  }
  while (i > 0) {
    mistakes.push({ type: 'omitted', word: expectedWords[i - 1], position: i - 1 });
    i -= 1;
  }
  while (j > 0) {
    mistakes.push({ type: 'added', word: submittedWords[j - 1], position: j - 1 });
    j -= 1;
  }

  return { correctWords, totalWords: n, mistakes: mistakes.reverse() };
}

// Grades one dictation attempt against the real (service-role-only)
// segment text. Never returns the expected text itself.
async function checkDictation({ userId, slug, attempts = [], attemptNumber = 1 }) {
  const lessonRow = await findLessonRowBySlug(slug);
  if (!lessonRow) {
    const err = new Error('Lesson not found.');
    err.status = 404;
    throw err;
  }
  await assertLessonUnlocked({ userId, lessonRow });

  const supabase = getSupabaseAdmin();
  const { data: segments } = await supabase
    .from('lesson_dictation_segments')
    .select('id, order_index, text')
    .eq('lesson_id', lessonRow.id)
    .order('order_index');

  const segmentById = new Map((segments || []).map((row) => [String(row.id), row]));
  const results = [];
  let totalCorrect = 0;
  let totalWords = 0;

  for (const attempt of attempts) {
    const segment = segmentById.get(String(attempt?.segmentId));
    if (!segment) continue;
    const expectedWords = normalizeDictationText(segment.text).split(' ').filter(Boolean);
    const submittedWords = normalizeDictationText(attempt.text).split(' ').filter(Boolean);
    const { correctWords, totalWords: segmentTotal, mistakes } = diffDictationWords(
      expectedWords,
      submittedWords
    );
    totalCorrect += correctWords;
    totalWords += segmentTotal;
    results.push({
      segmentId: segment.id,
      order: segment.order_index,
      correctWords,
      totalWords: segmentTotal,
      mistakes
    });
  }

  const percentage = totalWords > 0 ? Math.round((totalCorrect / totalWords) * 100) : 0;
  return { segments: results, correctWords: totalCorrect, totalWords, percentage, attemptNumber };
}

// Strips is_correct before anything reaches the client.
function sanitizeLessonForClient(lesson) {
  return {
    ...lesson,
    exercises: lesson.exercises.map(({ options, ...rest }) => ({
      ...rest,
      options: options.map(({ id, text }) => ({ id, text }))
    })),
    // extra is otherwise passed through as-is (see loadLessonFull) -
    // grammarTest/listeningComprehension are the two parts of it that
    // carry correct answers, so they're the only parts that need
    // stripping here. sanitizeGrammarTestForClient is reused for both -
    // both are the same {id,type,prompt,options|items,correctOptionId|
    // acceptedAnswers|correctOrder,explanation} shape (see
    // lib/grammarTestSanitizer.js). Same sanitizer used by
    // scripts/sync-worlds-from-seed.js for the offline static bundle, so
    // the two paths can't drift.
    extra: lesson.extra
      ? {
          ...lesson.extra,
          grammarTest: sanitizeGrammarTestForClient(lesson.extra.grammarTest),
          listeningComprehension: sanitizeGrammarTestForClient(lesson.extra.listeningComprehension)
        }
      : lesson.extra
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
async function getUnitMetadataMap(courseId) {
  const supabase = getSupabaseAdmin();
  let lastError = null;

  // This lookup is required to preserve the lesson -> unit relationship in
  // the learning route. A transient Supabase request previously became an
  // empty map because its error was ignored, producing valid-looking lessons
  // with unitId=null. Retry once, then fail the request explicitly.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data: unitRows, error } = await supabase
      .from('course_units')
      .select('id, slug, order_index')
      .eq('course_id', courseId);

    if (!error) {
      return (unitRows || []).reduce((acc, unit) => {
        acc[unit.id] = { slug: unit.slug, orderIndex: unit.order_index };
        return acc;
      }, {});
    }
    lastError = error;
  }

  throw new Error(`Could not read course_units: ${lastError?.message || 'unknown error'}`);
}

async function getLessonAccessContext(lessonRow) {
  const supabase = getSupabaseAdmin();
  const [{ data: unit }, { data: course }] = await Promise.all([
    supabase
      .from('course_units')
      .select('slug, order_index')
      .eq('id', lessonRow.unit_id)
      .maybeSingle(),
    supabase.from('courses').select('level_id').eq('id', lessonRow.course_id).maybeSingle()
  ]);
  if (!unit || !course) throw new Error('Lesson access context is incomplete.');
  const { data: level } = await supabase
    .from('levels')
    .select('code')
    .eq('id', course.level_id)
    .maybeSingle();
  if (!level) throw new Error('Lesson level is missing.');
  return { level: level.code, unitOrder: unit.order_index, unitId: unit.slug };
}

async function getLessons({ languageCode, levelCode, userId }) {
  const course = await findCourse(languageCode, levelCode);
  if (!course) return null; // signals "no normalized course for this combo"

  const supabase = getSupabaseAdmin();
  const [{ data: lessonRows, error }, unitById, entitlements] = await Promise.all([
    supabase
      .from('course_lessons')
      .select('*')
      .eq('course_id', course.id)
      .eq('is_published', true)
      .order('order_index'),
    getUnitMetadataMap(course.id),
    getUserEntitlements(userId)
  ]);
  if (error) throw new Error(`Could not read course_lessons: ${error.message}`);

  const fullLessons = await Promise.all((lessonRows || []).map(loadLessonFull));
  const progressMap = await getUserProgressMap(
    userId,
    fullLessons.map((l) => l.id)
  );

  return fullLessons.map((lesson) => {
    const progress = progressMap[lesson.id];
    const unit = unitById[lesson.unit_id] || {};
    const accessTier = accessPolicy.accessTierForUnit(levelCode, unit.orderIndex);
    const completed = progress?.status === 'completed';
    const locked = !accessPolicy.canAccessLesson({
      level: levelCode,
      unitOrder: unit.orderIndex,
      entitlements,
      completed
    });
    return sanitizeLessonForClient({
      ...lesson,
      slug: lesson.slug,
      level: levelCode,
      skill: lesson.skill,
      unitId: unit.slug || null,
      unitOrder: unit.orderIndex || null,
      title: lesson.title,
      description: lesson.description,
      accessTier,
      xpReward: lesson.xp_reward,
      orderIndex: lesson.order_index,
      audioUrl: lesson.audio_url,
      isFree: accessTier === 'free',
      completed,
      locked,
      progressStatus: progress?.status || 'not_started',
      bestScore: progress?.best_score ?? null
    });
  });
}

async function getLessonDetail({ slug, userId }) {
  const lessonRow = await findLessonRowBySlug(slug);
  if (!lessonRow) return null;
  const context = await getLessonAccessContext(lessonRow);
  const [progressMap, entitlements] = await Promise.all([
    getUserProgressMap(userId, [lessonRow.id]),
    getUserEntitlements(userId)
  ]);
  const progress = progressMap[lessonRow.id];
  const completed = progress?.status === 'completed';
  const locked = !accessPolicy.canAccessLesson({ ...context, entitlements, completed });
  const accessTier = accessPolicy.accessTierForUnit(context.level, context.unitOrder);
  if (locked) {
    return {
      slug: lessonRow.slug,
      level: context.level,
      skill: lessonRow.skill,
      unitId: context.unitId,
      unitOrder: context.unitOrder,
      title: lessonRow.title,
      description: lessonRow.description,
      xpReward: lessonRow.xp_reward,
      accessTier,
      isFree: false,
      completed: false,
      locked: true,
      premiumMessage: 'Disponible en ANDERGO Premium.',
      progressStatus: progress?.status || 'not_started',
      bestScore: progress?.best_score ?? null
    };
  }
  const full = await loadLessonFull(lessonRow);

  return sanitizeLessonForClient({
    ...full,
    unitId: context.unitId,
    unitOrder: context.unitOrder,
    accessTier,
    xpReward: full.xp_reward,
    orderIndex: full.order_index,
    audioUrl: full.audio_url,
    isFree: accessTier === 'free',
    completed,
    locked: false,
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
  await assertLessonUnlocked({ userId, lessonRow });

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
  await assertLessonUnlocked({ userId, lessonRow });

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

// Compares a submitted fill_blank answer against the question's accepted
// answers with the same normalization on both sides (trim + lowercase) -
// forgiving of stray whitespace/casing without being a fuzzy match.
function normalizeWrittenGrammarAnswer(value) {
  return String(value || '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’`´]/g, "'")
    // "Mme Dubois" and "Madame Dubois" are equally valid in a complete
    // corrected French sentence.
    .replace(/\bmme\.?(?=\s)/g, 'madame')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/[.!?]+$/g, '')
    .trim();
}

function isFillBlankCorrect(question, submittedAnswer) {
  const normalized = normalizeWrittenGrammarAnswer(submittedAnswer);
  if (!normalized) return false;
  return (question.acceptedAnswers || []).some(
    (accepted) => normalizeWrittenGrammarAnswer(accepted) === normalized
  );
}

function isOrderingCorrect(question, submittedOrder) {
  const correctOrder = (question.correctOrder || []).map(String);
  const submitted = (Array.isArray(submittedOrder) ? submittedOrder : []).map(String);
  return (
    correctOrder.length > 0 &&
    correctOrder.length === submitted.length &&
    correctOrder.every((id, index) => id === submitted[index])
  );
}

// Re-grades a course_lessons.extra question bank - extra.grammarTest and
// extra.listeningComprehension are the same shape (see
// lib/grammarTestSanitizer.js) and share this one grading function, from
// the real, unsanitized questions - never trusts the client's own claim of
// correctness. Submissions are matched by questionId, distinct from the
// exerciseId key used by the legacy exercises/exercise_options path below.
// The correct answer for each question is only ever attached to a result
// row here, AFTER real grading against the unsanitized bank - never before
// (see lib/grammarTestSanitizer.js, which strips correctOptionId/
// acceptedAnswers/correctOrder from anything sent to the client pre-submit).
// Revealing it post-submission is the normal "show me what I got wrong"
// behavior the spec asks for ("señalar de manera clara la opción correcta"),
// not a security gap - it can never be read before the student's own answer
// has already been scored.
function correctAnswerForQuestion(question) {
  if (question.type === 'mcq') return { correctOptionId: question.correctOptionId };
  if (question.type === 'fill_blank') return { correctAnswer: (question.acceptedAnswers || [])[0] || '' };
  if (question.type === 'ordering') return { correctOrder: question.correctOrder || [] };
  return {};
}

function gradeQuestionBank(bank, submittedAnswers = []) {
  const questions = bank.questions || [];
  let correctCount = 0;
  let allAttempted = true;
  const results = [];

  for (const question of questions) {
    const submission = submittedAnswers.find(
      (item) => String(item?.questionId) === String(question.id)
    );
    if (!submission || submission.answer === undefined || submission.answer === null) {
      allAttempted = false;
      results.push({
        questionId: question.id,
        correct: false,
        explanation: question.explanation || '',
        ...correctAnswerForQuestion(question)
      });
      continue;
    }

    let correct = false;
    if (question.type === 'mcq') {
      correct = String(question.correctOptionId) === String(submission.answer);
    } else if (question.type === 'fill_blank') {
      correct = isFillBlankCorrect(question, submission.answer);
    } else if (question.type === 'ordering') {
      correct = isOrderingCorrect(question, submission.answer);
    }

    if (correct) correctCount += 1;
    results.push({
      questionId: question.id,
      correct,
      explanation: question.explanation || '',
      ...correctAnswerForQuestion(question)
    });
  }

  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;
  return { score, allAttempted, totalExercises: questions.length, results };
}

// Re-grades every exercise in the lesson from the real exercise_options
// (never trusts the client's own claim of correctness). When the lesson
// has a grammarTest or listeningComprehension question bank (see
// lib/grammarTestSanitizer.js), grading happens against that bank instead
// - the lesson's legacy exercises/exercise_options rows, if any, are left
// untouched/unused so nothing else that still reads them (e.g. the
// printable answer sheet) is affected. A lesson is never expected to carry
// both banks at once, but grammarTest wins if it somehow did.
async function gradeExercises(lessonRow, submittedAnswers = []) {
  if (lessonRow.extra?.grammarTest?.questions?.length) {
    return gradeQuestionBank(lessonRow.extra.grammarTest, submittedAnswers);
  }
  if (lessonRow.extra?.listeningComprehension?.questions?.length) {
    return gradeQuestionBank(lessonRow.extra.listeningComprehension, submittedAnswers);
  }

  const supabase = getSupabaseAdmin();
  const { data: exerciseRows } = await supabase
    .from('exercises')
    .select('*')
    .eq('lesson_id', lessonRow.id)
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
  return { score, allAttempted, totalExercises: (exerciseRows || []).length, results: [] };
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

// Real server-side enforcement of the premium lock (mirrors the `locked`
// flag already computed for GET responses in getLessons/getLessonDetail:
// premium && !isPremiumActive && not already completed) - previously this
// endpoint scored and paid XP for any authenticated user regardless of
// access_tier, relying only on the UI hiding/disabling the button.
async function assertLessonUnlocked({ userId, lessonRow }) {
  const supabase = getSupabaseAdmin();
  const [{ data: existingProgress }, entitlements, context] = await Promise.all([
    supabase
      .from('user_lesson_progress')
      .select('status')
      .eq('user_id', userId)
      .eq('lesson_id', lessonRow.id)
      .maybeSingle(),
    getUserEntitlements(userId),
    getLessonAccessContext(lessonRow)
  ]);
  if (
    !accessPolicy.canAccessLesson({
      ...context,
      entitlements,
      completed: existingProgress?.status === 'completed'
    })
  ) {
    throw accessPolicy.premiumRequiredError();
  }
}

// Counts distinct languages the user has progress in, across every course
// migrated into this normalized schema (English A1 and, as of French A1,
// a second one) - feeds gamification's "Polyglota" badge
// (languagesStarted >= 2), previously hardcoded to 1 back when English A1
// was the only migrated course.
async function getLanguagesStartedCount(userId) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('user_lesson_progress')
    .select('course_lessons(courses(language_id))')
    .eq('user_id', userId);
  const languageIds = new Set(
    (data || [])
      .map((row) => row.course_lessons?.courses?.language_id)
      .filter(Boolean)
  );
  return languageIds.size;
}

async function completeLesson({ userId, slug, answers = [] }) {
  const lessonRow = await findLessonRowBySlug(slug);
  if (!lessonRow) {
    const err = new Error('Lesson not found.');
    err.status = 404;
    throw err;
  }

  await assertLessonUnlocked({ userId, lessonRow });

  const { score, allAttempted, results } = await gradeExercises(
    lessonRow,
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

  // One row per attempt - user_lesson_progress only tracks the running
  // best_score/attempts_count, so this is the only place a scored test's
  // per-attempt history (date, answers, per-question results) survives.
  // Only inserted for lessons that actually have the matching question
  // bank; every other skill/lesson is unaffected. A lesson never carries
  // both banks at once (see gradeExercises).
  if (lessonRow.extra?.grammarTest?.questions?.length) {
    await supabase.from('grammar_test_attempts').insert({
      user_id: userId,
      lesson_id: lessonRow.id,
      attempt_number: attemptsCount,
      score,
      correct_answers: results.filter((r) => r.correct).length,
      total_questions: results.length,
      answers,
      results,
      is_best: score >= bestScore,
      completed_at: new Date().toISOString()
    });
  } else if (lessonRow.extra?.listeningComprehension?.questions?.length) {
    await supabase.from('listening_comprehension_attempts').insert({
      user_id: userId,
      lesson_id: lessonRow.id,
      attempt_number: attemptsCount,
      score,
      correct_answers: results.filter((r) => r.correct).length,
      total_questions: results.length,
      answers,
      results,
      is_best: score >= bestScore,
      completed_at: new Date().toISOString()
    });
  }

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

  const languagesStarted = await getLanguagesStartedCount(userId);
  const { allBadgeIds, newlyUnlocked } = gamification.evaluateBadges(profile.badges, {
    completedCount,
    streak: streakResult.streak,
    level,
    languagesStarted,
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
    score,
    results: results || [],
    bestScore,
    attemptNumber: attemptsCount
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

async function getCourseProgressSummary({ userId, languageCode, levelCode }) {
  const course = await findCourse(languageCode, levelCode);
  if (!course || !userId) return null;
  const supabase = getSupabaseAdmin();
  const [{ data: lessons }, { data: units }] = await Promise.all([
    supabase
      .from('course_lessons')
      .select('id, unit_id, skill, title, order_index')
      .eq('course_id', course.id)
      .eq('is_published', true)
      .order('order_index'),
    supabase
      .from('course_units')
      .select('id, slug, title, order_index')
      .eq('course_id', course.id)
      .order('order_index')
  ]);
  const lessonRows = lessons || [];
  const progressMap = await getUserProgressMap(
    userId,
    lessonRows.map((lesson) => lesson.id)
  );
  const unitById = new Map((units || []).map((unit) => [unit.id, unit]));
  const byUnit = new Map();
  (units || []).forEach((unit) =>
    byUnit.set(unit.id, {
      unitSlug: unit.slug,
      title: unit.title,
      order: unit.order_index,
      completedActivities: 0,
      totalActivities: 0,
      scoreTotal: 0
    })
  );
  lessonRows.forEach((lesson) => {
    const unit = byUnit.get(lesson.unit_id);
    if (!unit) return;
    const progress = progressMap[lesson.id];
    unit.totalActivities += 1;
    unit.scoreTotal += Number(progress?.best_score || 0);
    if (progress?.status === 'completed') unit.completedActivities += 1;
  });
  const next = lessonRows.find((lesson) => progressMap[lesson.id]?.status !== 'completed');
  return {
    completedActivities: lessonRows.filter(
      (lesson) => progressMap[lesson.id]?.status === 'completed'
    ).length,
    totalActivities: lessonRows.length,
    scoreTotal: lessonRows.reduce(
      (sum, lesson) => sum + Number(progressMap[lesson.id]?.best_score || 0),
      0
    ),
    nextLesson: next ? `${next.skill} · ${next.title}` : 'Curso completado',
    units: [...byUnit.values()]
  };
}

// "Historial de intentos" (spec §4): every grammarTest submission already
// gets its own row in grammar_test_attempts (see completeLesson above) -
// this just reads the last few back for the current user, most recent
// first. Only score/date/correctCount are returned - never `answers` or
// `results` (which would include this user's own submitted answers,
// harmless, but not needed for a history list, so left out to keep the
// response small and boring to read).
async function getGrammarTestHistory({ userId, slug, limit = 10 }) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !userId) return [];

  const lessonRow = await findLessonRowBySlug(slug);
  if (!lessonRow) return [];

  const { data } = await supabase
    .from('grammar_test_attempts')
    .select('attempt_number, score, correct_answers, total_questions, is_best, completed_at')
    .eq('user_id', userId)
    .eq('lesson_id', lessonRow.id)
    .order('completed_at', { ascending: false })
    .limit(limit);

  return (data || []).map((row) => ({
    attemptNumber: row.attempt_number,
    score: row.score,
    correctAnswers: row.correct_answers,
    totalQuestions: row.total_questions,
    isBest: row.is_best,
    completedAt: row.completed_at
  }));
}

module.exports = {
  hasCourse,
  hasLesson,
  getLessons,
  getLessonDetail,
  startLesson,
  checkAnswer,
  checkDictation,
  completeLesson,
  getCompletedCount,
  getCourseProgressSummary,
  getGrammarTestHistory,
  gradeQuestionBank
};
