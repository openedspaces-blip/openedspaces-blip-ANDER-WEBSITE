-- =========================================================
-- 202607270001_lesson_audio_dialogue_path.sql
-- =========================================================
-- Additive column for the two-voice dialogue performance of a Listening
-- lesson's script, generated via ElevenLabs' text-to-dialogue endpoint (one
-- ElevenLabs voice per speaker, e.g. Ana/Leo in english-a1-hello-listening),
-- as opposed to main_file_path/slow_file_path/very_slow_file_path, which are
-- a single narrator voice at three speeds - see
-- scripts/generate-english-a1-audio.js. Distinct asset, not a replacement:
-- the narrator tiers stay the primary audio the Listening player uses today
-- (lib/listeningService.js#getOfficialAudio), unaffected by this column
-- being null.
--
-- Nullable, no default: existing lesson_audio rows (Español A1 pilot) are
-- unaffected. ElevenLabs' multi-voice dialogue endpoint has no speed/pace
-- control (unlike the single-voice endpoint's voiceSettings.speed), so this
-- is a single file, normal speed only - no dialogue_slow_file_path/
-- dialogue_very_slow_file_path pair the way the narrator tiers have.
--
-- Not applied by this session - run via your normal Supabase migration flow
-- when ready, same as 202607140002_lesson_audio_table.sql and
-- 202607220001_rich_listening_content.sql before it.

alter table public.lesson_audio add column if not exists dialogue_file_path text;

comment on column public.lesson_audio.dialogue_file_path is
  'Two-voice dialogue performance of this lesson''s script (ElevenLabs text-to-dialogue, one voice per speaker). Normal speed only - the endpoint has no speed control. Optional; null until scripts/generate-english-a1-audio.js populates it, and null forever for non-dialogue Listening lessons.';
