// lib/ttsService.js
// Text-to-speech, used to generate real listening audio once per lesson
// (see scripts/generate-listening-audio.js) and AI-generated Listening
// practice (lib/listeningService.js). Two providers are supported behind
// the same generateSpeechMp3(text, opts) -> Buffer contract so neither
// caller needs to know which one is active:
//   - OpenAI (process.env.OPENAI_API_KEY)
//   - ElevenLabs (process.env.ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID)
// Both API keys are read only here, server-side, never sent to the frontend.
const OpenAI = require('openai');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const { buffer: streamToBuffer } = require('node:stream/consumers');

const OPENAI_MODEL = process.env.OPENAI_TTS_MODEL || 'tts-1';
const ELEVENLABS_MODEL = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
// eleven_multilingual_v2 handles every ANDERGO target language with one
// voice, unlike OpenAI's TTS where a distinct voice per language was only
// ever picked for variety - a single configurable voice id is the right
// default here, not a per-language map. mp3_44100_128 needs no paid tier
// (192kbps mp3 and PCM/WAV at 44.1kHz do), matching the free/starter tier.
const ELEVENLABS_OUTPUT_FORMAT = 'mp3_44100_128';

function resolveElevenLabsVoiceId({ language, gender, activityType }) {
  if (language === 'english') {
    if (activityType === 'dialogue') {
      if (gender === 'female') return process.env.ELEVENLABS_VOICE_ID_EN_FEMALE;
      if (gender === 'male') return process.env.ELEVENLABS_VOICE_ID_EN_MALE;
    }
    return (
      process.env.ELEVENLABS_VOICE_ID_EN ||
      process.env.ELEVENLABS_VOICE_ID_EN_FEMALE ||
      process.env.ELEVENLABS_VOICE_ID
    );
  }
  if (language === 'french') {
    if (activityType === 'dialogue') {
      if (gender === 'female') return process.env.ELEVENLABS_VOICE_ID_FR_FEMALE;
      if (gender === 'male') return process.env.ELEVENLABS_VOICE_ID_FR_MALE;
    }
    return (
      process.env.ELEVENLABS_VOICE_ID_FR ||
      process.env.ELEVENLABS_VOICE_ID_FR_FEMALE ||
      process.env.ELEVENLABS_VOICE_ID
    );
  }
  return process.env.ELEVENLABS_VOICE_ID;
}

// A different OpenAI voice per target language, purely for variety - OpenAI's
// TTS voices aren't language-locked, they read whatever text/language they're given.
const OPENAI_VOICE_BY_LANGUAGE = {
  english: 'alloy',
  spanish: 'nova',
  french: 'shimmer',
  italian: 'echo',
  german: 'onyx'
};

// TTS_PROVIDER lets an operator force a provider explicitly; with neither
// set (or set to something else), the presence of an ElevenLabs key is
// treated as intent to use it - it's the newer/preferred provider being
// added on top of the pre-existing OpenAI integration, not a silent swap
// of what's already working today if nobody configured it.
function ttsProvider() {
  const explicit = String(process.env.TTS_PROVIDER || '').toLowerCase();
  if (explicit === 'openai' || explicit === 'elevenlabs') return explicit;
  return isElevenLabsConfigured() ? 'elevenlabs' : 'openai';
}

let openaiClient = null;
function getOpenAiClient() {
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

let elevenLabsClient = null;
function getElevenLabsClient() {
  if (!elevenLabsClient) {
    elevenLabsClient = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
  }
  return elevenLabsClient;
}

function isOpenAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY && String(process.env.OPENAI_API_KEY).trim());
}

function isElevenLabsConfigured() {
  return Boolean(
    process.env.ELEVENLABS_API_KEY &&
      String(process.env.ELEVENLABS_API_KEY).trim() &&
      process.env.ELEVENLABS_VOICE_ID
  );
}

function isConfigured() {
  return ttsProvider() === 'elevenlabs' ? isElevenLabsConfigured() : isOpenAiConfigured();
}

function voiceForLanguage(language) {
  return OPENAI_VOICE_BY_LANGUAGE[language] || 'alloy';
}

async function generateSpeechMp3ViaOpenAi(text, { language, model = OPENAI_MODEL, speed } = {}) {
  if (!isOpenAiConfigured()) {
    const err = new Error('OPENAI_API_KEY no está configurado.');
    err.status = 503;
    throw err;
  }

  let response;
  try {
    response = await getOpenAiClient().audio.speech.create({
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

async function generateSpeechMp3ViaElevenLabs(
  text,
  { model = ELEVENLABS_MODEL, speed, language, gender, activityType } = {}
) {
  if (!isElevenLabsConfigured()) {
    const err = new Error('ELEVENLABS_API_KEY o ELEVENLABS_VOICE_ID no están configurados.');
    err.status = 503;
    throw err;
  }

  // Was a bare, never-declared `ELEVENLABS_VOICE_ID` reference here - threw
  // ReferenceError the moment this path actually ran. resolveElevenLabsVoiceId()
  // already existed with the right per-language/gender fallback chain, just
  // never wired in; every existing caller (AI Tutor speech) already only
  // ever passed `language`, so this is additive, not a signature break.
  const voiceId = resolveElevenLabsVoiceId({ language, gender, activityType });

  let stream;
  try {
    stream = await getElevenLabsClient().textToSpeech.convert(voiceId, {
      text,
      modelId: model,
      outputFormat: ELEVENLABS_OUTPUT_FORMAT,
      // ElevenLabs' equivalent of OpenAI's `speed` - same <1.0 slows down
      // convention, so the Listening "slow variant" caller needs no
      // provider-specific branching.
      ...(speed ? { voiceSettings: { speed } } : {})
    });
  } catch (error) {
    const err = new Error(error?.message || 'No se pudo generar el audio con ElevenLabs.');
    err.status = error?.statusCode || error?.status || 502;
    throw err;
  }

  return streamToBuffer(stream);
}

// eleven_v3 supports multi-speaker dialogue generation; eleven_multilingual_v2
// (the narration default above) does not - see ELEVENLABS_MODEL_DIALOGUE in
// .env.example. Only read here and by scripts/generate-english-a1-audio.js,
// which is the one caller of generateDialogueMp3 below today.
const ELEVENLABS_DIALOGUE_MODEL = process.env.ELEVENLABS_MODEL_DIALOGUE || 'eleven_v3';

// One ElevenLabs voice per dialogue line via the text-to-dialogue endpoint
// (client.textToDialogue.convert) - a single request stitches every line
// into one audio file server-side, so callers never need their own mp3
// concatenation/stitching step. `lines` is [{ text, voiceId }, ...], already
// resolved by the caller (see resolveElevenLabsVoiceId, exported below) -
// this function only talks to ElevenLabs, it doesn't know about
// speakers/genders/lesson content. Unlike generateSpeechMp3ViaElevenLabs,
// there is no `speed` option: the dialogue endpoint has no pace/speed
// control at all (confirmed against the installed SDK's request types), so
// only a normal-speed dialogue file is possible today.
async function generateDialogueMp3(lines, { model = ELEVENLABS_DIALOGUE_MODEL } = {}) {
  if (!isElevenLabsConfigured()) {
    const err = new Error('ELEVENLABS_API_KEY o ELEVENLABS_VOICE_ID no están configurados.');
    err.status = 503;
    throw err;
  }
  if (!Array.isArray(lines) || !lines.length) {
    throw new Error('generateDialogueMp3 requiere al menos una línea de diálogo.');
  }
  const missingVoice = lines.find((line) => !line.voiceId);
  if (missingVoice) {
    throw new Error(
      `Falta voiceId para la línea de diálogo: "${String(missingVoice.text || '').slice(0, 40)}...".`
    );
  }

  let stream;
  try {
    stream = await getElevenLabsClient().textToDialogue.convert({
      inputs: lines.map((line) => ({ text: line.text, voiceId: line.voiceId })),
      modelId: model,
      outputFormat: ELEVENLABS_OUTPUT_FORMAT
    });
  } catch (error) {
    const err = new Error(error?.message || 'No se pudo generar el diálogo con ElevenLabs.');
    err.status = error?.statusCode || error?.status || 502;
    throw err;
  }

  return streamToBuffer(stream);
}

async function generateSpeechMp3(text, options = {}) {
  return ttsProvider() === 'elevenlabs'
    ? generateSpeechMp3ViaElevenLabs(text, options)
    : generateSpeechMp3ViaOpenAi(text, options);
}

// AI Tutor's neural-voice mode (see lib/voiceAccessService.js) - a thin
// wrapper so the tutor route doesn't need to know which underlying TTS
// provider is active. Returns null (instead of throwing) when unconfigured,
// so the caller can fall back to browser speechSynthesis instead of failing
// the whole request - Cerebras's text reply must never be blocked by a
// missing/broken TTS provider.
async function generateTutorSpeech({ text, language, speed }) {
  if (!isConfigured()) return null;
  try {
    const buffer = await generateSpeechMp3(text, {
      language,
      // "slow" maps to the same <1.0 speed both providers already support
      // (see generateSpeechMp3ViaOpenAi/ViaElevenLabs above); "normal" keeps
      // the provider's own default by omitting the option entirely.
      speed: speed === 'slow' ? 0.75 : undefined
    });
    return { buffer, mimeType: 'audio/mpeg' };
  } catch (error) {
    console.warn('[ttsService] generateTutorSpeech failed, caller will fall back to browser voice:', error.message);
    return null;
  }
}

module.exports = {
  generateSpeechMp3,
  generateTutorSpeech,
  isConfigured,
  voiceForLanguage,
  ttsProvider,
  // Below: exported for scripts/generate-english-a1-audio.js, which must
  // guarantee ElevenLabs is used regardless of TTS_PROVIDER/OpenAI
  // availability (generateSpeechMp3 above would silently pick whichever
  // provider ttsProvider() resolves to) and needs per-speaker voice
  // resolution + multi-voice dialogue generation that no other caller does.
  isElevenLabsConfigured,
  resolveElevenLabsVoiceId,
  generateSpeechMp3ViaElevenLabs,
  generateDialogueMp3
};
