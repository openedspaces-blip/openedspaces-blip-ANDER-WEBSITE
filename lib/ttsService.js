// lib/ttsService.js
// Text-to-speech via the official `openai` SDK, used to generate real
// listening audio once per lesson (see scripts/generate-listening-audio.js).
// process.env.OPENAI_API_KEY is read only here, server-side.
const OpenAI = require('openai');

const DEFAULT_MODEL = process.env.OPENAI_TTS_MODEL || 'tts-1';

// A different voice per target language, purely for variety - OpenAI's TTS
// voices aren't language-locked, they read whatever text/language they're given.
const VOICE_BY_LANGUAGE = {
  english: 'alloy',
  spanish: 'nova',
  french: 'shimmer',
  italian: 'echo',
  german: 'onyx'
};

let client = null;
function getClient() {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function isConfigured() {
  return Boolean(process.env.OPENAI_API_KEY && String(process.env.OPENAI_API_KEY).trim());
}

function voiceForLanguage(language) {
  return VOICE_BY_LANGUAGE[language] || 'alloy';
}

async function generateSpeechMp3(text, { language, model = DEFAULT_MODEL, speed } = {}) {
  if (!isConfigured()) {
    const err = new Error('OPENAI_API_KEY no está configurado.');
    err.status = 503;
    throw err;
  }

  let response;
  try {
    response = await getClient().audio.speech.create({
      model,
      voice: voiceForLanguage(language),
      input: text,
      response_format: 'mp3',
      // Only sent when explicitly requested (the Listening "slow" variant) -
      // the API's valid range is 0.25-4.0; omitted entirely otherwise so the
      // normal-speed request keeps using the provider's own default.
      ...(speed ? { speed } : {})
    });
  } catch (error) {
    const err = new Error(error?.message || 'No se pudo generar el audio con OpenAI.');
    err.status = error?.status || 502;
    throw err;
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

module.exports = { generateSpeechMp3, isConfigured, voiceForLanguage };
