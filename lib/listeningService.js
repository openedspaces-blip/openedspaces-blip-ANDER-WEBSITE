// lib/listeningService.js
// Listening's ONLY audio source: a published row in the `lesson_audio` table
// (supabase/migrations/202607140002_lesson_audio_table.sql), files
// themselves in the "lesson-audio" Storage bucket. No AI-generated/TTS
// fallback here on purpose - Listening must only ever play official,
// human-recorded course audio (see docs/audio-architecture.md's "Fase 2"
// note). Text-to-Speech remains available elsewhere in the app (Tutor,
// Verbos, Vocabulary) via ttsService.js directly - this file no longer
// touches that module at all.
const { getSupabaseAdmin } = require('./supabaseClient');

const LESSON_AUDIO_BUCKET = 'lesson-audio';

function storagePathFromAudioUrl(audioUrl) {
  if (!audioUrl) return null;
  const publicMarker = `/storage/v1/object/public/${LESSON_AUDIO_BUCKET}/`;
  try {
    const pathname = new URL(audioUrl).pathname;
    const markerIndex = pathname.indexOf(publicMarker);
    if (markerIndex >= 0) return decodeURIComponent(pathname.slice(markerIndex + publicMarker.length));
  } catch {
    // A relative object path is also supported for a future private bucket.
  }
  return String(audioUrl).replace(/^\/+/, '') || null;
}

function downloadFilename(official) {
  const title = String(official?.title || 'listening')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `andergo-${title || 'listening'}.mp3`;
}

// courseLessonId (course_lessons.id, see
// 202607280001_lesson_audio_course_lesson_id.sql) is the real-id resolution
// path the spec requires ("resolver sus audios usando el lesson_id real") -
// preferred whenever the caller has one. language/level/lessonSlug stay as
// the fallback for any lesson_audio row that predates that migration's
// backfill, or whose language/level has no normalized course_lessons row yet
// (e.g. English B1-C2's legacy-only placeholder lessons).
async function getOfficialAudio(courseLessonId, language, level, lessonSlug) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  if (courseLessonId) {
    const { data } = await supabase
      .from('lesson_audio')
      .select('*')
      .eq('course_lesson_id', courseLessonId)
      .eq('status', 'published')
      .maybeSingle();
    if (data) return data;
  }

  if (!language || !level || !lessonSlug) return null;
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

// The caller performs the entitlement check. A short-lived signed URL with
// `download` forces a file download now and keeps working if the bucket is
// made private later; the service-role key never reaches the browser.
async function createOfficialAudioDownloadUrl(official) {
  return createOfficialAudioSignedUrl(official?.main_file_path, 60, downloadFilename(official));
}

async function createOfficialAudioPlaybackUrl(audioUrl) {
  return createOfficialAudioSignedUrl(audioUrl, 10 * 60);
}

async function createOfficialAudioSignedUrl(audioUrl, expiresIn, download) {
  const supabase = getSupabaseAdmin();
  const objectPath = storagePathFromAudioUrl(audioUrl);
  if (!supabase || !objectPath) return null;
  const { data, error } = await supabase.storage
    .from(LESSON_AUDIO_BUCKET)
    .createSignedUrl(objectPath, expiresIn, download ? { download } : undefined);
  if (error) throw error;
  return data?.signedUrl || null;
}

module.exports = {
  getOfficialAudio,
  createOfficialAudioDownloadUrl,
  createOfficialAudioPlaybackUrl,
  storagePathFromAudioUrl
};
