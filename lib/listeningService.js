// lib/listeningService.js
// Two Listening audio sources, checked in priority order by the API layer
// (lib/server.js): (1) official audio - a published row in the
// `lesson_audio` table (supabase/migrations/202607140002_lesson_audio_table.sql),
// files themselves in the "lesson-audio" Storage bucket; (2) AI-generated
// practice - a level-appropriate script from Gemini, synthesized with the
// existing OpenAI TTS wrapper (ttsService.js), returned as a data URI and
// never persisted (see docs/audio-architecture.md for why this is a
// deliberate Phase 1 simplification, not an oversight).
const { getSupabaseAdmin } = require('./supabaseClient');
const { generateSpeechMp3, isConfigured: isTtsConfigured } = require('./ttsService');
const { createResponse, isConfigured: isGeminiConfigured } = require('./geminiService');

const VALID_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const VALID_LANGUAGES = new Set(['english', 'spanish', 'french', 'italian', 'german']);
const MAX_DURATION_SECONDS = 60;
const CACHE_TTL_MS = 10 * 60 * 1000;

// In-memory only (per warm server instance) - avoids re-generating/re-paying
// for an identical request within a short window. Not a substitute for
// persisting official audio; that's the `lesson_audio` table's job.
const generationCache = new Map();

function cacheKey({ bridgeLanguage, targetLanguage, level, topic, speed }) {
  return [bridgeLanguage, targetLanguage, level, topic, speed || 'normal'].join('::');
}

function isListeningGenerationConfigured() {
  return isGeminiConfigured() && isTtsConfigured();
}

async function getOfficialAudio(language, level, lessonSlug) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !language || !level || !lessonSlug) return null;
  const { data } = await supabase
    .from('lesson_audio')
    .select('*')
    .eq('language', language)
    .eq('level', level)
    .eq('lesson_slug', lessonSlug)
    .eq('status', 'published')
    .maybeSingle();
  return data || null;
}

function buildScriptPrompt({ bridgeLanguage, targetLanguage, level, topic }) {
  return [
    `Escribe un guion breve de listening en ${targetLanguage}, nivel ${level}, sobre el tema "${topic}".`,
    `Debe durar aproximadamente 30 segundos leído en voz alta (2-4 frases cortas para A1-A2, algo mas elaborado desde B1).`,
    'Responde EXCLUSIVAMENTE con JSON valido (sin markdown ni texto adicional), con esta forma exacta:',
    '{"title": string, "script": string, "vocabulary": [{"word": string, "translation": string}], "questions": [{"prompt": string, "options": [string,string,string,string], "correctIndex": number}]}',
    `El campo "translation" debe estar en ${bridgeLanguage}. Incluye 3 a 5 palabras de vocabulario y exactamente 2 preguntas de comprension.`,
    'Varia el contenido respecto a guiones anteriores sobre el mismo tema; no lo copies textualmente.'
  ].join('\n');
}

function safeParseScriptJson(text) {
  const match = String(text || '').match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    if (!parsed.script || typeof parsed.script !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

async function generateListeningPractice({
  bridgeLanguage,
  targetLanguage,
  level,
  topic,
  durationSeconds
}) {
  if (!VALID_LANGUAGES.has(targetLanguage)) {
    const err = new Error('Idioma meta no soportado.');
    err.status = 400;
    throw err;
  }
  if (!VALID_LEVELS.has(level)) {
    const err = new Error('Nivel no valido.');
    err.status = 400;
    throw err;
  }
  if (!isListeningGenerationConfigured()) {
    const err = new Error(
      'La practica de Listening con IA no esta configurada todavia (falta GEMINI_API_KEY u OPENAI_API_KEY).'
    );
    err.status = 503;
    throw err;
  }

  const boundedDuration = Math.max(
    10,
    Math.min(Number(durationSeconds) || 30, MAX_DURATION_SECONDS)
  );
  const safeTopic = String(topic || 'greetings').slice(0, 80);
  const key = cacheKey({ bridgeLanguage, targetLanguage, level, topic: safeTopic });
  const cached = generationCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const { text } = await createResponse({
    instructions:
      'Eres un generador de guiones cortos de listening para estudiantes de idiomas. Respondes unicamente con JSON valido, sin explicaciones adicionales.',
    input: buildScriptPrompt({ bridgeLanguage, targetLanguage, level, topic: safeTopic })
  });

  const parsed = safeParseScriptJson(text) || {
    title: `Practica de ${safeTopic}`,
    script: String(text || '').slice(0, 600),
    vocabulary: [],
    questions: []
  };

  const mainBuffer = await generateSpeechMp3(parsed.script, { language: targetLanguage });
  const audioUrl = `data:audio/mp3;base64,${mainBuffer.toString('base64')}`;

  // Best-effort: a slow variant is a nice-to-have, never faked if it fails.
  let slowAudioUrl = null;
  try {
    const slowBuffer = await generateSpeechMp3(parsed.script, {
      language: targetLanguage,
      speed: 0.75
    });
    slowAudioUrl = `data:audio/mp3;base64,${slowBuffer.toString('base64')}`;
  } catch {
    slowAudioUrl = null;
  }

  const result = {
    success: true,
    source: 'ai-generated',
    title: parsed.title || `Practica de ${safeTopic}`,
    audioUrl,
    slowAudioUrl,
    transcript: parsed.script,
    vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [],
    questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    durationSeconds: boundedDuration,
    expiresAt: new Date(Date.now() + CACHE_TTL_MS).toISOString()
  };

  generationCache.set(key, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}

module.exports = {
  getOfficialAudio,
  generateListeningPractice,
  isListeningGenerationConfigured,
  isTtsConfigured,
  isGeminiConfigured,
  MAX_DURATION_SECONDS
};
