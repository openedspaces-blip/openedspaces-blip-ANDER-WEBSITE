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

module.exports = {
  getOfficialAudio
};
