// Private, reusable narration cache for Premium Reading audio.  The browser
// never receives a Storage credential: it only gets a short-lived URL after
// the route has verified the learner's Premium entitlement.
const crypto = require('crypto');
const { getSupabaseAdmin } = require('./supabaseClient');

const BUCKET = 'reading-audio';
const SIGNED_URL_SECONDS = 5 * 60;

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

module.exports = { getOrCreateReadingAudio, BUCKET, SIGNED_URL_SECONDS };
