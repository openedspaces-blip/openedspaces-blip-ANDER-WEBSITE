// Server-side paid TTS is intentionally disabled.
//
// ANDERGO uses the browser's Web Speech API for Reading, Tutor,
// pronunciation, flashcards and speaking models. Existing prerecorded
// Listening files remain ordinary stored audio and do not call a TTS API.
// These compatibility exports keep old maintenance scripts safe: they
// report the provider as unavailable and cannot generate billable audio.

function disabledError() {
  const error = new Error(
    'La generación de voz de pago está desactivada. ANDERGO usa las voces TTS del sistema.'
  );
  error.code = 'SYSTEM_TTS_ONLY';
  error.status = 410;
  return error;
}

function isConfigured() {
  return false;
}

function isElevenLabsConfigured() {
  return false;
}

function ttsProvider() {
  return 'browser';
}

function voiceForLanguage() {
  return '';
}

function resolveElevenLabsVoiceId() {
  return '';
}

async function generateSpeechMp3() {
  throw disabledError();
}

async function generateSpeechMp3ViaElevenLabs() {
  throw disabledError();
}

async function generateDialogueMp3() {
  throw disabledError();
}

async function generateTutorSpeech() {
  return null;
}

async function generateReadingSpeech() {
  return null;
}

module.exports = {
  generateSpeechMp3,
  generateTutorSpeech,
  generateReadingSpeech,
  isConfigured,
  voiceForLanguage,
  ttsProvider,
  isElevenLabsConfigured,
  resolveElevenLabsVoiceId,
  generateSpeechMp3ViaElevenLabs,
  generateDialogueMp3
};
