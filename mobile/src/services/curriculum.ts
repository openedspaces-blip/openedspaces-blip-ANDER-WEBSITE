import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://kdfzpqqyklqxprcweuqu.supabase.co';
const ANDERGO_API_URL = 'https://andergo.online';
// Publishable client key. Authorization is enforced by RLS; no secret/service key is bundled.
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_V6eyM6swE72C5UmPs9KKOg_hKtpRbwZ';
const CACHE_PREFIX = 'andergo.curriculum.v1';
const REQUEST_TIMEOUT_MS = 15_000;

/** Network requests must not leave a mobile route spinning forever. */
async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export type CurriculumLesson = {
  id: string;
  slug: string;
  skill: 'listening' | 'speaking' | 'reading' | 'writing' | 'grammar' | 'vocabulary';
  title: string;
  description?: string;
  unitId?: string;
  unitOrder?: number;
  xpReward?: number;
  estimated_minutes?: number;
  accessTier?: 'free' | 'premium';
  completed?: boolean;
  bestScore?: number;
  locked?: boolean;
  vocabulary?: { word: string; translation: string; example?: string }[];
  dialogue?: { speaker?: string; line: string; translation?: string }[];
  phrases?: string[];
  audioUrl?: string | null;
};

type LessonSection = {
  type?: string;
  word?: string | null;
  translation?: string | null;
  line?: string | null;
  example?: string | null;
  reading_title?: string | null;
  reading_text?: string | null;
  reading_questions?: string[] | null;
  order_index?: number;
};

export type LessonActivity = {
  title: string;
  description?: string;
  mission?: string | null;
  grammarNote?: string | null;
  audioUrl?: string | null;
  officialAudioUrl?: string | null;
  slowAudioUrl?: string | null;
  transcript?: string | null;
  pairs: { source: string; target: string; example?: string }[];
  reading?: { title: string; text: string; questions: string[]; quiz: ReadingQuizQuestion[] } | null;
  assessment: ReadingQuizQuestion[];
};

export type ReadingQuizQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string; isCorrect: boolean }[];
};

export type MobileCompletion = {
  score: number;
  earnedXp: number;
  xp: number;
  streak: number;
  progress: number;
  bestScore: number;
};

export type CourseLanguage = 'english' | 'french' | 'spanish' | 'italian' | 'portuguese' | 'german';

export async function loadCurriculum(language: CourseLanguage, level = 'A1', accessToken?: string): Promise<CurriculumLesson[]> {
  const cacheKey = `${CACHE_PREFIX}.${language}.${level}`;
  try {
    const routeResponse = await fetchWithTimeout(`${ANDERGO_API_URL}/api/lessons?language=${language}&level=${level}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    const routePayload = await routeResponse.json().catch(() => null) as { lessons?: Record<string, unknown>[] } | null;
    if (routeResponse.ok && Array.isArray(routePayload?.lessons)) {
      const lessons: CurriculumLesson[] = routePayload.lessons.map((lesson) => ({
        id: String(lesson.id ?? ''), slug: String(lesson.slug ?? ''), skill: lesson.skill as CurriculumLesson['skill'], title: String(lesson.title ?? ''),
        description: typeof lesson.description === 'string' ? lesson.description : undefined, unitId: typeof lesson.unitId === 'string' ? lesson.unitId : undefined,
        unitOrder: typeof lesson.unitOrder === 'number' ? lesson.unitOrder : undefined, xpReward: typeof lesson.xpReward === 'number' ? lesson.xpReward : undefined,
        estimated_minutes: typeof lesson.estimated_minutes === 'number' ? lesson.estimated_minutes : undefined,
        // Academic content is open to every account. Premium is reserved for
        // expanded Tutor/Translator usage and enhanced reading audio.
        accessTier: 'free', completed: Boolean(lesson.completed), bestScore: typeof lesson.bestScore === 'number' ? lesson.bestScore : 0, locked: false, audioUrl: typeof lesson.audioUrl === 'string' ? lesson.audioUrl : null,
      }));
      if (lessons.length) await AsyncStorage.setItem(cacheKey, JSON.stringify(lessons));
      return lessons;
    }
    const select = 'id,slug,skill,title,description,order_index,xp_reward,access_tier,estimated_minutes,audio_url,unit_id,course_units(slug,order_index),courses!inner(languages!inner(code),levels!inner(code))';
    const query = new URLSearchParams({
      select,
      'courses.languages.code': `eq.${language}`,
      'courses.levels.code': `eq.${level}`,
      is_published: 'eq.true',
      order: 'order_index.asc',
    });
    const response = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/course_lessons?${query}`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    });
    if (!response.ok) throw new Error(`Curriculum request failed: ${response.status}`);
    const payload = (await response.json()) as (CurriculumLesson & {
      order_index?: number;
      xp_reward?: number;
      access_tier?: 'free' | 'premium';
      audio_url?: string | null;
      course_units?: { slug?: string; order_index?: number } | null;
    })[];
    const lessons: CurriculumLesson[] = Array.isArray(payload)
      ? payload.map((lesson) => ({
          id: lesson.id,
          slug: lesson.slug,
          skill: lesson.skill,
          title: lesson.title,
          description: lesson.description,
          unitId: lesson.course_units?.slug,
          unitOrder: lesson.course_units?.order_index,
          xpReward: lesson.xp_reward,
          estimated_minutes: lesson.estimated_minutes,
          accessTier: 'free',
          completed: false,
          locked: false,
          audioUrl: lesson.audio_url,
        }))
      : [];
    if (lessons.length) await AsyncStorage.setItem(cacheKey, JSON.stringify(lessons));
    return lessons;
  } catch {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached ? (JSON.parse(cached) as CurriculumLesson[]) : [];
    } catch {
      return [];
    }
  }
}

/** Loads the public learning material for one web lesson, by its stable slug. */
export async function loadLessonActivity(
  slug: string,
  context: { lessonId?: string; language?: string; level?: string } = {},
  accessToken?: string,
): Promise<LessonActivity | null> {
  try {
    // Read the same lesson as the signed-in learner. The options are public,
    // but their correction stays server-side through checkMobileAnswer().
    const detailResponse = await fetchWithTimeout(`${ANDERGO_API_URL}/api/lessons/${encodeURIComponent(slug)}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    const detailPayload = await detailResponse.json().catch(() => null) as { lesson?: Record<string, unknown> } | null;
    const detail = detailPayload?.lesson;
    if (detailResponse.ok && detail && typeof detail.title === 'string') {
      const readingData = detail.reading as { title?: string; text?: string; questions?: string[] } | null | undefined;
      const exercises = Array.isArray(detail.exercises) ? detail.exercises as Record<string, unknown>[] : [];
      const quiz = exercises
        .filter((exercise) => exercise.type === 'mcq' && typeof exercise.prompt === 'string' && Array.isArray(exercise.options))
        .map((exercise) => ({
          id: String(exercise.id ?? exercise.prompt), prompt: String(exercise.prompt),
          options: (exercise.options as Record<string, unknown>[]).map((option, index) => ({ id: String(option.id ?? index), text: String(option.text ?? ''), isCorrect: Boolean(option.isCorrect) })).filter((option) => option.text),
        }))
        .filter((exercise) => {
          const prompt = String(exercise.prompt || '');
          return exercise.options.length >= 3 && !/^(true or false|vrai ou faux|verdadero o falso)\b/i.test(prompt);
        })
        .slice(0, 4) as ReadingQuizQuestion[];
      const vocabulary = Array.isArray(detail.vocabulary) ? detail.vocabulary as { word?: string; translation?: string; example?: string }[] : [];
      const dialogue = Array.isArray(detail.dialogue) ? detail.dialogue as { line?: string; translation?: string }[] : [];
      const pairs = [...vocabulary.map((item) => ({ source: item.word?.trim() || '', target: item.translation?.trim() || '', example: item.example?.trim() || undefined })), ...dialogue.map((item) => ({ source: item.line?.trim() || '', target: item.translation?.trim() || '' }))].filter((item) => item.source && item.target);
      const officialAudio = await loadOfficialAudio(slug, context);
      // Some legacy listenings do not yet have an exported MP3. Keep the
      // lesson usable with the original dialogue/reading and native TTS.
      const fallbackTranscript = dialogue.map((item) => item.line?.trim() || '').filter(Boolean).join('\n') || readingData?.text?.trim() || null;
      return {
        title: detail.title, description: typeof detail.description === 'string' ? detail.description : undefined,
        mission: typeof detail.mission === 'string' ? detail.mission : null, grammarNote: typeof detail.grammar === 'string' ? detail.grammar : null,
        audioUrl: typeof detail.audio_url === 'string' ? detail.audio_url : null, officialAudioUrl: officialAudio?.audioUrl ?? null,
        slowAudioUrl: officialAudio?.slowAudioUrl ?? null, transcript: officialAudio?.transcript ?? fallbackTranscript, pairs,
        reading: readingData?.text ? { title: readingData.title?.trim() || detail.title, text: readingData.text.trim(), questions: Array.isArray(readingData.questions) ? readingData.questions.filter(Boolean) : [], quiz } : null,
        assessment: quiz,
      };
    }
    const select = 'title,description,mission,grammar_note,audio_url,phrases,lesson_sections(type,word,translation,line,example,reading_title,reading_text,reading_questions,order_index)';
    const response = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/course_lessons?slug=eq.${encodeURIComponent(slug)}&select=${encodeURIComponent(select)}&limit=1`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    });
    if (!response.ok) throw new Error(`Lesson request failed: ${response.status}`);
    const row = ((await response.json()) as {
      title: string; description?: string; mission?: string | null; grammar_note?: string | null;
      audio_url?: string | null; phrases?: string[] | null; lesson_sections?: LessonSection[] | null;
    }[])[0];
    if (!row) return null;

    const sections = [...(row.lesson_sections ?? [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    const pairs = sections.flatMap((section) => {
      const source = section.word?.trim() || section.line?.trim();
      const target = section.translation?.trim();
      return source && target ? [{ source, target, example: section.example?.trim() || undefined }] : [];
    });
    const readingSection = sections.find((section) => section.reading_text?.trim());
    const officialAudio = await loadOfficialAudio(slug, context);
    const fallbackTranscript = sections.map((section) => section.line?.trim() || '').filter(Boolean).join('\n') || readingSection?.reading_text?.trim() || null;

    return {
      title: row.title,
      description: row.description,
      mission: row.mission,
      grammarNote: row.grammar_note,
      audioUrl: row.audio_url,
      officialAudioUrl: officialAudio?.audioUrl ?? null,
      slowAudioUrl: officialAudio?.slowAudioUrl ?? null,
      transcript: officialAudio?.transcript ?? fallbackTranscript,
      pairs,
      reading: readingSection?.reading_text ? {
        title: readingSection.reading_title?.trim() || row.title,
        text: readingSection.reading_text.trim(),
        questions: Array.isArray(readingSection.reading_questions) ? readingSection.reading_questions.filter(Boolean) : [],
        quiz: [],
      } : null,
      assessment: [],
    };
  } catch {
    return null;
  }
}

export function missionForSkill(skill: CurriculumLesson['skill']) {
  return ({
    reading: { icon: '📖', label: 'Reading' },
    listening: { icon: '🎧', label: 'Listening' },
    speaking: { icon: '🗣️', label: 'Expresión oral' },
    writing: { icon: '✍️', label: 'Expresión escrita' },
    grammar: { icon: '⚡', label: 'Gramática y verbos' },
    vocabulary: { icon: '🧩', label: 'Vocabulario' },
  } as const)[skill] ?? { icon: '📚', label: 'Lección' };
}

/** Saves the score with the same protected evaluator and progress tables used by the website. */
export async function completeMobileLesson(slug: string, answers: { exerciseId: string; selectedOptionId: string }[], accessToken: string): Promise<MobileCompletion> {
  const response = await fetchWithTimeout(`${ANDERGO_API_URL}/api/lessons/${encodeURIComponent(slug)}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    // The native reading challenge presents exactly four questions. Scope the
    // server evaluation to those IDs so it never expects unseen exercises.
    body: JSON.stringify({
      answers,
      assessmentScope: 'reading_comprehension',
      assessmentExerciseIds: answers.map((answer) => answer.exerciseId),
    }),
  });
  const data = await response.json().catch(() => ({})) as Partial<MobileCompletion> & { error?: string };
  if (!response.ok) throw new Error(data.error || 'No se pudo guardar esta evaluación.');
  return { score: Number(data.score || 0), earnedXp: Number(data.earnedXp || 0), xp: Number(data.xp || 0), streak: Number(data.streak || 0), progress: Number(data.progress || 0), bestScore: Number(data.bestScore || data.score || 0) };
}

/** Checks one native reading answer against the platform answer key. */
export async function checkMobileAnswer(
  slug: string,
  exerciseId: string,
  selectedOptionId: string,
  accessToken: string,
): Promise<{ correct: boolean; correctOption?: number }> {
  const response = await fetchWithTimeout(`${ANDERGO_API_URL}/api/lessons/${encodeURIComponent(slug)}/check-answer`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ exerciseId, selectedOptionId }),
  });
  const data = await response.json().catch(() => ({})) as { correct?: boolean; correctOption?: number | null; error?: string };
  if (!response.ok || typeof data.correct !== 'boolean') throw new Error(data.error || 'No se pudo comprobar la respuesta.');
  return { correct: data.correct, correctOption: typeof data.correctOption === 'number' ? data.correctOption : undefined };
}

async function loadOfficialAudio(slug: string, context: { lessonId?: string; language?: string; level?: string }) {
  if (!context.language || !context.level) return null;
  try {
    const audioQuery = new URLSearchParams({ language: context.language, level: context.level, lessonSlug: slug, lessonId: context.lessonId ?? '' });
    const response = await fetchWithTimeout(`${ANDERGO_API_URL}/api/listening/audio?${audioQuery}`);
    const payload = await response.json().catch(() => null) as { status?: string; audio?: { audioUrl?: string; slowAudioUrl?: string | null; transcript?: string } } | null;
    return response.ok && (payload?.status === 'official' || payload?.status === 'partial') ? payload.audio ?? null : null;
  } catch { return null; }
}
