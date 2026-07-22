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

module.exports = {
  getOfficialAudio
};
