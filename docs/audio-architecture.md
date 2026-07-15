# Listening audio — architecture and current state

This documents what's actually implemented as of the Listening enablement
pass (Fase 1), plus what's still manual/pending. Audio files themselves must
never be committed to GitHub; they belong in Supabase Storage only.

## Two audio sources, checked in priority order

`GET /api/listening/audio?language&level&lessonSlug` (`lib/server.js`,
`lib/listeningService.js`) resolves, in order:

1. **Official audio** — a `published` row in the `lesson_audio` table (see
   below). Returned as `{ status: 'official', audio: {...} }`.
2. **AI-generated practice** — offered (not auto-generated) when no official
   row exists and both `GEMINI_API_KEY` and `OPENAI_API_KEY` are configured.
   Returned as `{ status: 'ai-available' }`; the frontend then shows an
   explicit "Generar práctica de Listening con IA" button (signed-in users
   only) that calls `POST /api/listening/generate`.
3. **Unavailable** — neither exists. Returned as `{ status: 'unavailable' }`,
   rendered as an honest "Intenta más tarde" state. Never a fake/empty player.

## Two mechanisms currently coexist — this is a known inconsistency

- **Legacy** (pre-existing, untouched this phase): migration
  `202607110001_lesson_audio.sql` added a bare `lessons.audio_url` text
  column; `scripts/generate-listening-audio.js` is an offline CLI that
  generates audio for `lessons` rows with `skill='listening'`, uploads to a
  Storage bucket named `lesson-audio` at the flat path
  `<language>/<level>/<slug>.mp3`, and creates that bucket with
  **`public: true`**. This column/script are not read by the new endpoint
  and were intentionally left alone.
- **New / canonical for this phase**: migration
  `202607140002_lesson_audio_table.sql` (added, **not applied** — run it via
  your normal Supabase migration flow) creates a `lesson_audio` table that
  `listeningService.getOfficialAudio()` actually queries, filtered to
  `status = 'published'`.

**Flagged, not fixed**: the existing bucket's `public: true` ACL contradicts
a private-bucket/signed-URL design. This phase does not change the bucket's
ACL (a live Supabase-project action outside this pass's scope) and does not
generate signed URLs — `getOfficialAudio()` returns whatever is stored in
`main_file_path`/`slow_file_path` as-is. If the bucket stays public, plain
HTTPS URLs work today. If it's ever switched to private, a signed-URL step
must be added to `listeningService.getOfficialAudio()` before official audio
will play.

## `lesson_audio` table (new, canonical)

Keyed by `(language, level, lesson_slug)`:

| field                                      | notes                                                              |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `language`                                 | matches the world content.js language key                          |
| `level`                                    | CEFR level (A1–C2)                                                 |
| `lesson_slug`                              | matches `lesson.slug` in `src/worlds/*/content.js`                 |
| `title`                                    | optional, for admin reference                                      |
| `source_type`                              | `official` \| `ai-generated`                                       |
| `speaker`                                  | narrator name/voice id                                             |
| `duration`                                 | seconds, shown in the player                                       |
| `main_file_path`                           | URL/path to the normal-speed file                                  |
| `slow_file_path`                           | URL/path to the slow version (optional)                            |
| `transcript`                               | full text shown behind the transcript gate                         |
| `status`                                   | `draft` \| `published` — **only `published` rows are ever served** |
| `published_at`, `created_at`, `updated_at` | timestamps                                                         |

### Suggested bucket layout for new uploads

```
lesson-audio/
  <language>/<level>/listening/<lesson-slug>/
    main.mp3
    slow.mp3
```

This is a convention for `main_file_path`/`slow_file_path`, not enforced by
code — any reachable URL works.

## Manual steps to publish official audio (not built as an admin panel yet)

1. Upload `main.mp3` (and optionally `slow.mp3`) to the `lesson-audio`
   bucket, ideally following the layout above.
2. Apply `202607140002_lesson_audio_table.sql` if not already applied.
3. Insert a row into `lesson_audio` with `status = 'published'` and the
   real file URLs/paths, matching an existing lesson's
   `language`/`level`/`lesson_slug`.
4. Reload the Listening view — `GET /api/listening/audio` will now report
   `status: 'official'` for that lesson.

A full admin upload panel was explicitly out of scope for this phase.

## AI-generated practice (ephemeral, not persisted)

`POST /api/listening/generate` (auth required, rate-limited to 10 requests
per 15 minutes per client, hard 60s duration cap, `bridgeLanguage`/
`targetLanguage`/`level` validated against known enums) does, per request:

1. Generates a level-appropriate script + vocabulary + 2 comprehension
   questions via `geminiService.createResponse` (Gemini, text-only).
2. Synthesizes normal-speed audio via `ttsService.generateSpeechMp3`
   (OpenAI TTS), plus a best-effort slow variant at `speed: 0.75`.
3. Returns both as `data:audio/mp3;base64,...` URIs directly in the JSON
   response — **never uploaded to Storage or written to `lesson_audio`**.

This keeps AI-generated audio clearly ephemeral and sidesteps the bucket
ACL inconsistency above entirely for now. A short-lived in-memory cache
(10 minutes, keyed by the request parameters) avoids paying twice for an
identical request in quick succession. Persisting/caching AI-generated
audio in Storage for reuse is a natural next phase, not built here.

Every AI-generated response is labeled **"Práctica de Listening generada
por IA"** in the UI and explicitly disclosed as non-human.

## Frontend integration (implemented)

`renderListeningView(section, lesson)` in `src/js/script.js` calls the
status endpoint above and renders one of: the real player (official or
AI-generated), the AI-generation offer card, the unavailable card, or an
error-with-retry card — never a fake/simulated audio state. See that
function and its neighbors (`renderListeningOfficial`,
`renderListeningAiPlayer`, `wireListeningPlayerControls`, etc.) for the
player/transcript/question/completion implementation.
