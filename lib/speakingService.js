// lib/speakingService.js
// Validates and "processes" a Speaking recording submitted as multipart/form-data.
// The audio buffer only ever lives in memory (multer.memoryStorage() in
// server.js - never written to disk, never uploaded to Supabase Storage) and
// is discarded the moment this function returns, by design: nothing here
// keeps a reference to req.file.buffer beyond this call.
const ALLOWED_MIME_TYPES = new Set(['audio/webm', 'audio/ogg', 'audio/mp4']);
const MAX_DURATION_SECONDS = 90; // hard ceiling with margin over the 60s UI max, guards against a spoofed durationSeconds field

function normalizeMimeType(mimetype = '') {
  return String(mimetype).split(';')[0].trim().toLowerCase();
}

function validationError(message) {
  const err = new Error(message);
  err.status = 400;
  err.code = 'INVALID_AUDIO';
  return err;
}

// No real speech-recognition/pronunciation-scoring provider is wired up yet
// (Gemini/Groq here are text-only in this codebase). Rather than fabricate
// pronunciation/fluency/grammar scores, this returns a clearly-labeled
// "not analyzed yet" result - swap this function's body for a real provider
// call once one exists, keeping the same return shape (add the score fields
// and set analyzed: true).
async function analyzeSpeakingSubmission({
  file,
  language,
  level,
  lessonId,
  expectedPrompt,
  durationSeconds
}) {
  if (!file) {
    throw validationError('No se recibió ningún archivo de audio.');
  }

  const mimeType = normalizeMimeType(file.mimetype);
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw validationError('Formato de audio no compatible. Usa audio/webm, audio/ogg o audio/mp4.');
  }

  const duration = Number(durationSeconds);
  if (!Number.isFinite(duration) || duration <= 0 || duration > MAX_DURATION_SECONDS) {
    throw validationError('La duración del audio no es válida.');
  }

  return {
    ok: true,
    analyzed: false,
    durationSeconds: Math.round(duration),
    language: language || null,
    level: level || null,
    lessonId: lessonId || null,
    message: 'La evaluación automática de pronunciación estará disponible próximamente.'
  };
}

module.exports = { analyzeSpeakingSubmission, ALLOWED_MIME_TYPES, MAX_DURATION_SECONDS };
