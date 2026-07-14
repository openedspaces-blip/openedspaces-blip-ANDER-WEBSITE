# Listening audio — planned Supabase Storage architecture

Documentation only. No bucket has been created, no migration added, no
upload code written — this describes the intended shape so Listening can
flip from `audioStatus: 'unavailable'` to `'preparing'`/`'available'` later
without a redesign. Audio files themselves must never be committed to
GitHub; they belong in Supabase Storage only.

## Bucket

Name: `lesson-audio`. Private by default — no public upload/read policy.
Only the backend (service-role key, server-side only) or an admin tool
should write to it; the frontend only ever requests a signed URL for a
specific lesson once `status` is `available`.

## Folder structure

```
lesson-audio/
  <language>/            english | french | italian | spanish | german
    <level>/              A1 | A2 | B1 | B2 | C1 | C2
      listening/
        <lesson-slug>/
          main.mp3         normal-speed narration
          slow.mp3         slowed-down version for lower levels
```

Example: `lesson-audio/english/A1/listening/english-a1-listening/main.mp3`.

## Metadata

A `lesson_audio` table (or a JSON column on the existing lessons table —
whichever fits the current schema better) keyed by `(language, level,
lessonSlug)`, with:

| field | notes |
|---|---|
| `language` | matches the world content.js language key |
| `level` | CEFR level |
| `lessonSlug` | matches `lesson.slug` in `src/worlds/*/content.js` |
| `title` | for admin listing, not shown to students directly |
| `speaker` | narrator name/voice id, for consistency across a language |
| `duration` | seconds, shown in the player once available |
| `filePath` | path to `main.mp3` within the bucket |
| `slowVersionPath` | path to `slow.mp3` |
| `transcript` | full text, used for the existing `lesson.dialogue`/`reading.text` fields so listening and reading stay consistent |
| `status` | `unavailable` \| `preparing` \| `available` |
| `createdAt` / `updatedAt` | standard timestamps |

## Frontend integration (future, not built yet)

`renderListeningView()` already reads a single `LISTENING_AUDIO_STATUS`
constant (`src/js/script.js`). Once audio exists, that becomes a per-lesson
lookup (`status` from the table above) instead of a hardcoded constant, and
the view swaps its "Próximamente" content for a player using a short-lived
signed URL from the backend — never a public bucket URL.
