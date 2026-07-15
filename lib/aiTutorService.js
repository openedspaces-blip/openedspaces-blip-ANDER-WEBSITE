const { createResponse, isConfigured } = require('./geminiService');

const MAX_HISTORY_MESSAGES = 6;

function tutorConfigError() {
  if (!isConfigured()) {
    const err = new Error(
      'El tutor IA no está configurado todavía. Agrega GEMINI_API_KEY en Vercel o en tu .env local.'
    );
    err.status = 503;
    return err;
  }
  return null;
}

// Static persona and safety rules, independent of any single request -
// passed as `instructions` (system-level guidance) rather than mixed into
// the per-request `input`.
const TUTOR_INSTRUCTIONS = [
  'Eres Tutor AI, el tutor virtual de ANDERGO Academy.',
  'Tu función es ayudar a estudiantes a aprender idiomas de manera clara, amable, motivadora y pedagógica.',
  'Adapta tus explicaciones al idioma meta, la habilidad y el nivel del estudiante que se te indiquen.',
  'Corrige errores de gramática, vocabulario, pronunciación y escritura con respeto.',
  'Explica brevemente por qué una respuesta está correcta o incorrecta.',
  'Incluye ejemplos prácticos.',
  'Explica principalmente en la lengua nativa del estudiante, pero incluye ejemplos útiles en el idioma meta.',
  'No te limites a dar la respuesta: explica el proceso de aprendizaje.',
  'Evita respuestas excesivamente largas. Usa un lenguaje apropiado para estudiantes.',
  'Si el estudiante comparte un texto, corrígelo sin perder su intención original.',
  'Da exactamente estas 3 partes con este formato:',
  '1) Corrección/guía breve',
  '2) Ejemplo útil',
  '3) Mini práctica de seguimiento',
  'Cuando sea útil, termina con una pregunta o pequeño ejercicio para comprobar el aprendizaje.',
  'No generes contenido peligroso, sexual, violento ni inadecuado para menores.',
  'No solicites datos personales sensibles del estudiante.'
].join('\n');

// Accepts either a full language name (english/spanish/french/italian/german
// - what the frontend's bridgeLanguage/profiles.bridge_language actually
// store) or a legacy 2-letter code, for callers that might still send one.
const NATIVE_LANGUAGE_LABELS = {
  spanish: 'español',
  es: 'español',
  english: 'english',
  en: 'english',
  french: 'français',
  fr: 'français',
  italian: 'italiano',
  it: 'italiano',
  german: 'deutsch',
  de: 'deutsch'
};

// How much of the reply should lean on the bridge language vs. the target
// language, by CEFR level - beginners need more scaffolding in a language
// they already understand; advanced students should be immersed in the
// target language, with the bridge language available only when asked.
const LEVEL_BRIDGE_GUIDANCE = {
  A1: 'El estudiante es nivel A1: da la mayor parte de la explicación en su lengua nativa, con ejemplos simples en el idioma meta.',
  A2: 'El estudiante es nivel A2: apoyo moderado en su lengua nativa, con más presencia del idioma meta que en A1.',
  B1: 'El estudiante es nivel B1: responde predominantemente en el idioma meta; usa la lengua nativa solo para aclaraciones puntuales.',
  B2: 'El estudiante es nivel B2: responde predominantemente en el idioma meta; usa la lengua nativa solo para aclaraciones puntuales.',
  C1: 'El estudiante es nivel C1: responde casi enteramente en el idioma meta; usa la lengua nativa solo si el estudiante la pide explícitamente.',
  C2: 'El estudiante es nivel C2: responde casi enteramente en el idioma meta; usa la lengua nativa solo si el estudiante la pide explícitamente.'
};

function buildTutorInput({
  language = 'english',
  skill = 'speaking',
  level = 'A1',
  nativeLanguage = 'es',
  prompt = '',
  lessonTitle = '',
  lessonIntro = '',
  selectedSuggestion = '',
  transcript = '',
  vocabulary = '',
  currentQuestion = '',
  selectedAnswer = '',
  supportMode = ''
}) {
  const nativeLanguageLabel = NATIVE_LANGUAGE_LABELS[nativeLanguage] || 'español';
  const bridgeGuidance = LEVEL_BRIDGE_GUIDANCE[level] || LEVEL_BRIDGE_GUIDANCE.A1;
  const isListening = skill === 'listening';

  return [
    `Idioma meta: ${language}.`,
    `Habilidad: ${skill}.`,
    `Nivel del estudiante: ${level}.`,
    lessonTitle ? `Lección activa: ${lessonTitle}.` : '',
    lessonIntro ? `Contexto de la lección: ${lessonIntro}.` : '',
    selectedSuggestion ? `Sugerencia elegida por el estudiante: ${selectedSuggestion}.` : '',
    transcript
      ? `Transcripción del audio de esta actividad (no confirma que hayas "escuchado" el audio, solo tienes el texto): ${transcript}`
      : '',
    vocabulary ? `Vocabulario relacionado: ${vocabulary}.` : '',
    currentQuestion ? `Pregunta actual de la actividad: ${currentQuestion}.` : '',
    selectedAnswer ? `Respuesta que dio el estudiante: ${selectedAnswer}.` : '',
    isListening
      ? 'Esta es una actividad de Listening: solo dispones de la transcripción de texto, nunca digas que "escuchaste" el audio como si tuvieras oídos; refiérete a la transcripción o al guion cuando sea relevante.'
      : '',
    isListening
      ? 'No reveles la respuesta correcta de inmediato: da pistas progresivas y deja que el estudiante lo intente antes de confirmar o corregir.'
      : '',
    supportMode ? `Modo de apoyo solicitado: ${supportMode}.` : '',
    `Lengua nativa (puente) del estudiante: ${nativeLanguageLabel}.`,
    bridgeGuidance,
    'No introduzcas ningún idioma que no sea el meta o el puente indicados arriba.',
    `Solicitud del estudiante: ${prompt || 'Quiero practicar y mejorar en esta habilidad.'}`
  ]
    .filter(Boolean)
    .join('\n');
}

// Turns a validated history array (see api/ai/tutor.js) plus the current
// request into the `input` shape the Responses API expects: either a plain
// string (no history) or an array of role-tagged messages ending in the
// current turn, so the model sees prior context without us re-sending
// system instructions on every message.
function buildInputWithHistory(params, history) {
  const currentInput = buildTutorInput(params);
  if (!Array.isArray(history) || history.length === 0) return currentInput;

  const trimmed = history.slice(-MAX_HISTORY_MESSAGES);
  const messages = trimmed.map((turn) => ({
    role: turn.role === 'tutor' ? 'assistant' : 'user',
    content: String(turn.content || '').slice(0, 3000)
  }));
  messages.push({ role: 'user', content: currentInput });
  return messages;
}

// Friendly, student-facing messages for the errors students are most likely
// to trigger indirectly (a misconfigured or rate-limited Gemini account) -
// the raw Gemini error message is often too technical or leaks account details.
const FRIENDLY_STATUS_MESSAGES = {
  400: 'La clave de Gemini no es válida.',
  403: 'La clave de Gemini no es válida o no tiene permisos.',
  429: 'Se alcanzó temporalmente el límite de uso del tutor IA. Intenta de nuevo en unos minutos.'
};

async function getTutorReply({ history, ...params }) {
  const configError = tutorConfigError();
  if (configError) throw configError;

  try {
    const { text, model } = await createResponse({
      instructions: TUTOR_INSTRUCTIONS,
      input: buildInputWithHistory(params, history)
    });
    return { reply: text, model };
  } catch (error) {
    const friendly = FRIENDLY_STATUS_MESSAGES[error.status];
    if (friendly) error.message = friendly;
    throw error;
  }
}

module.exports = { getTutorReply, tutorConfigError };
