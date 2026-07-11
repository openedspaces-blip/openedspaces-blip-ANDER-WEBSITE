-- =========================================================
-- 202607110001_lesson_audio.sql
-- =========================================================
-- Adds a place to store a generated listening audio file per lesson.
-- Populated by scripts/generate-listening-audio.js (OpenAI TTS +
-- Supabase Storage); stays null until that script runs for a given
-- lesson, so the frontend must treat it as optional.

alter table public.lessons add column if not exists audio_url text;
