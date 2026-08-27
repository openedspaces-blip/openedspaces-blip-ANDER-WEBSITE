// Private, reusable narration cache for Premium Reading audio.  The browser
// never receives a Storage credential: it only gets a short-lived URL after
// the route has verified the learner's Premium entitlement.
const crypto = require('crypto');
const { getSupabaseAdmin } = require('./supabaseClient');

const BUCKET = 'reading-audio';
const SIGNED_URL_SECONDS = 5 * 60;
const LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

function extensionFor(contentType) {
  return String(contentType || '').toLowerCase().includes('wav') ? 'wav' : 'mp3';
}

function objectPathFor(text, language, contentType) {
  const digest = crypto
    .createHash('sha256')
    .update(`reading-v1|${language || 'english'}|${text}`)
    .digest('hex');
  return `${String(language || 'english').toLowerCase()}/${digest}.${extensionFor(contentType)}`;
}

function officialObjectPathFor({ language, level, unitNumber, contentType = 'audio/wav' }) {
  const safeLanguage = String(language || '').toLowerCase();
  const safeLevel = String(level || '').toUpperCase();
  const safeUnitNumber = Number(unitNumber);
  if (!/^[a-z]+$/.test(safeLanguage) || !LEVELS.has(safeLevel) ||
      !Number.isInteger(safeUnitNumber) || safeUnitNumber < 1 || safeUnitNumber > 99) {
    return null;
  }
  return `${safeLanguage}/${safeLevel}/unit-${String(safeUnitNumber).padStart(2, '0')}/main.${extensionFor(contentType)}`;
}

async function ensurePrivateBucket(client) {
  const { error } = await client.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: '25MB',
    allowedMimeTypes: ['audio/wav', 'audio/mpeg']
  });
  if (error && !/already exists|duplicate/i.test(error.message || '')) throw error;
}

async function createSignedPlaybackUrl(client, objectPath) {
  const { data, error } = await client.storage
    .from(BUCKET)
    .createSignedUrl(objectPath, SIGNED_URL_SECONDS);
  if (error) return null;
  return data?.signedUrl || null;
}

// Official curriculum narrations have predictable, human-auditable paths:
// reading-audio/english/A1/unit-01/main.wav.  The bucket stays private; only
// the authenticated backend can turn this path into a short-lived playback URL.
async function getOfficialReadingAudio({ language, level, unitNumber }) {
  const client = getSupabaseAdmin();
  const wavPath = officialObjectPathFor({ language, level, unitNumber, contentType: 'audio/wav' });
  if (!client || !wavPath) return null;
  for (const contentType of ['audio/wav', 'audio/mpeg']) {
    const objectPath = officialObjectPathFor({ language, level, unitNumber, contentType });
    const signedUrl = await createSignedPlaybackUrl(client, objectPath);
    if (signedUrl) return { signedUrl, objectPath };
  }
  return null;
}

async function uploadOfficialReadingAudio({ audio, language, level, unitNumber, contentType = 'audio/wav', force = false }) {
  const client = getSupabaseAdmin();
  const objectPath = officialObjectPathFor({ language, level, unitNumber, contentType });
  if (!client) throw new Error('Supabase no está configurado para subir el audio.');
  if (!objectPath) throw new Error('La ruta oficial de audio no es válida.');
  await ensurePrivateBucket(client);
  const { error } = await client.storage
    .from(BUCKET)
    .upload(objectPath, audio, { contentType, upsert: force, cacheControl: '31536000' });
  if (error && !/already exists|duplicate/i.test(error.message || '')) throw error;
  return { objectPath, alreadyExists: Boolean(error) };
}

// `makeAudio` is invoked only when the cached rendition is absent. It must
// return a Buffer with its non-enumerable `contentType` metadata from
// ttsService; no provider key or audio upload ever reaches the frontend.
async function getOrCreateReadingAudio({ text, language, makeAudio }) {
  const client = getSupabaseAdmin();
  if (!client) return null;

  // Gemini currently returns WAV, so try that deterministic path before
  // requesting a new paid synthesis. The MP3 path keeps future provider
  // fallbacks cacheable too.
  for (const contentType of ['audio/wav', 'audio/mpeg']) {
    const existingPath = objectPathFor(text, language, contentType);
    const signedUrl = await createSignedPlaybackUrl(client, existingPath);
    if (signedUrl) return { signedUrl, cached: true };
  }

  await ensurePrivateBucket(client);
  const audio = await makeAudio();
  const contentType = audio.contentType || 'audio/mpeg';
  const objectPath = objectPathFor(text, language, contentType);
  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(objectPath, audio, { contentType, upsert: false, cacheControl: '31536000' });

  // A simultaneous request may have written the same content first. In that
  // case the signed URL below is still the correct, safely reusable result.
  if (uploadError && !/already exists|duplicate/i.test(uploadError.message || '')) throw uploadError;
  const signedUrl = await createSignedPlaybackUrl(client, objectPath);
  if (!signedUrl) throw new Error('No se pudo preparar el acceso seguro al audio.');
  return { signedUrl, cached: false };
}

module.exports = {
  getOrCreateReadingAudio,
  getOfficialReadingAudio,
  uploadOfficialReadingAudio,
  officialObjectPathFor,
  BUCKET,
  SIGNED_URL_SECONDS
};
