import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://kdfzpqqyklqxprcweuqu.supabase.co';
const ANDERGO_API_URL = 'https://andergo.online';
// Publishable client key. Authorization is enforced by RLS; no secret/service key is bundled.
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_V6eyM6swE72C5UmPs9KKOg_hKtpRbwZ';
const CACHE_PREFIX = 'andergo.curriculum.v1';

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
  locked?: boolean;
  vocabulary?: Array<{ word: string; translation: string; example?: string }>;
  dialogue?: Array<{ speaker?: string; line: string; translation?: string }>;
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
  pairs: Array<{ source: string; target: string; example?: string }>;
  reading?: { title: string; text: string; questions: string[] } | null;
};

export async function loadCurriculum(language: 'english' | 'french' | 'spanish', level = 'A1', accessToken?: string) {
  const cacheKey = `${CACHE_PREFIX}.${language}.${level}`;
  try {
    const routeResponse = await fetch(`${ANDERGO_API_URL}/api/lessons?language=${language}&level=${level}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    const routePayload = await routeResponse.json().catch(() => null) as { lessons?: Array<Record<string, unknown>> } | null;
    if (routeResponse.ok && Array.isArray(routePayload?.lessons)) {
      const lessons: CurriculumLesson[] = routePayload.lessons.map((lesson) => ({
        id: String(lesson.id ?? ''), slug: String(lesson.slug ?? ''), skill: lesson.skill as CurriculumLesson['skill'], title: String(lesson.title ?? ''),
        description: typeof lesson.description === 'string' ? lesson.description : undefined, unitId: typeof lesson.unitId === 'string' ? lesson.unitId : undefined,
        unitOrder: typeof lesson.unitOrder === 'number' ? lesson.unitOrder : undefined, xpReward: typeof lesson.xpReward === 'number' ? lesson.xpReward : undefined,
        accessTier: lesson.accessTier === 'premium' ? 'premium' : 'free', completed: Boolean(lesson.completed), locked: Boolean(lesson.locked), audioUrl: typeof lesson.audioUrl === 'string' ? lesson.audioUrl : null,
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
    const response = await fetch(`${SUPABASE_URL}/rest/v1/course_lessons?${query}`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    });
    if (!response.ok) throw new Error(`Curriculum request failed: ${response.status}`);
    const payload = (await response.json()) as Array<CurriculumLesson & {
      order_index?: number;
      xp_reward?: number;
      access_tier?: 'free' | 'premium';
      audio_url?: string | null;
      course_units?: { slug?: string; order_index?: number } | null;
    }>;
    const lessons = Array.isArray(payload)
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
          accessTier: lesson.access_tier,
          completed: false,
          locked: lesson.access_tier === 'premium',
          audioUrl: lesson.audio_url,
        }))
      : [];
    if (lessons.length) await AsyncStorage.setItem(cacheKey, JSON.stringify(lessons));
    return lessons;
  } catch {
    const cached = await AsyncStorage.getItem(cacheKey);
    return cached ? (JSON.parse(cached) as CurriculumLesson[]) : [];
  }
}

/** Loads the public learning material for one web lesson, by its stable slug. */
export async function loadLessonActivity(
  slug: string,
  context: { lessonId?: string; language?: string; level?: string } = {},
): Promise<LessonActivity | null> {
  try {
    const select = 'title,description,mission,grammar_note,audio_url,phrases,lesson_sections(type,word,translation,line,example,reading_title,reading_text,reading_questions,order_index)';
    const response = await fetch(`${SUPABASE_URL}/rest/v1/course_lessons?slug=eq.${encodeURIComponent(slug)}&select=${encodeURIComponent(select)}&limit=1`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    });
    if (!response.ok) throw new Error(`Lesson request failed: ${response.status}`);
    const row = ((await response.json()) as Array<{
      title: string; description?: string; mission?: string | null; grammar_note?: string | null;
      audio_url?: string | null; phrases?: string[] | null; lesson_sections?: LessonSection[] | null;
    }>)[0];
    if (!row) return null;

    const sections = [...(row.lesson_sections ?? [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    const pairs = sections.flatMap((section) => {
      const source = section.word?.trim() || section.line?.trim();
      const target = section.translation?.trim();
      return source && target ? [{ source, target, example: section.example?.trim() || undefined }] : [];
    });
    const readingSection = sections.find((section) => section.reading_text?.trim());
    let officialAudio: { audioUrl?: string; slowAudioUrl?: string | null; transcript?: string } | null = null;
    if (context.language && context.level) {
      try {
        const audioQuery = new URLSearchParams({
          language: context.language,
          level: context.level,
          lessonSlug: slug,
          lessonId: context.lessonId ?? '',
        });
        const audioResponse = await fetch(`${ANDERGO_API_URL}/api/listening/audio?${audioQuery}`);
        const audioPayload = await audioResponse.json().catch(() => null) as {
          status?: string;
          audio?: { audioUrl?: string; slowAudioUrl?: string | null; transcript?: string };
        } | null;
        if (audioResponse.ok && (audioPayload?.status === 'official' || audioPayload?.status === 'partial')) {
          officialAudio = audioPayload.audio ?? null;
        }
      } catch {
        // The lesson still works offline or when the official-audio service is unavailable.
      }
    }

    return {
      title: row.title,
      description: row.description,
      mission: row.mission,
      grammarNote: row.grammar_note,
      audioUrl: row.audio_url,
      officialAudioUrl: officialAudio?.audioUrl ?? null,
      slowAudioUrl: officialAudio?.slowAudioUrl ?? null,
      transcript: officialAudio?.transcript ?? null,
      pairs,
      reading: readingSection?.reading_text ? {
        title: readingSection.reading_title?.trim() || row.title,
        text: readingSection.reading_text.trim(),
        questions: Array.isArray(readingSection.reading_questions) ? readingSection.reading_questions.filter(Boolean) : [],
      } : null,
    };
  } catch {
    return null;
  }
}

export function missionForSkill(skill: CurriculumLesson['skill']) {
  return ({
    reading: { mode: 'story', icon: '📜', label: 'Crónica escondida', detail: 'Descubre la historia del territorio' },
    listening: { mode: 'listen', icon: '🔮', label: 'Eco misterioso', detail: 'Descifra la voz que llega del camino' },
    speaking: { mode: 'speak', icon: '🗣️', label: 'Puerta de la voz', detail: 'Usa tu voz para abrir el paso' },
    writing: { mode: 'order', icon: '🗺️', label: 'Mapa fragmentado', detail: 'Reconstruye el mensaje secreto' },
    grammar: { mode: 'review', icon: '🛡️', label: 'Guardián de las reglas', detail: 'Demuestra tu dominio para avanzar' },
    vocabulary: { mode: 'match', icon: '🧩', label: 'Puente de palabras', detail: 'Encuentra las conexiones ocultas' },
  } as const)[skill] ?? { mode: 'review', icon: '🧭', label: 'Misión del explorador', detail: 'Supera el reto para continuar' };
}
