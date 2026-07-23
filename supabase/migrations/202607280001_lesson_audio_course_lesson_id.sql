-- =========================================================
-- 202607280001_lesson_audio_course_lesson_id.sql
-- =========================================================
-- Listening audit finding: lesson_audio was only ever resolved by
-- (language, level, lesson_slug) - lib/listeningService.js#getOfficialAudio.
-- Slugs happen to be unique today, but that's a coincidence, not a
-- guarantee - the same lesson also exists as a second, different-id row in
-- the legacy public.lessons table under the exact same slug (confirmed live:
-- e.g. "english-a1-hello-listening" is public.lessons.id 32188b75... AND
-- public.course_lessons.id 0c25b402...). This column lets Listening resolve
-- audio by the real course_lessons.id instead, per spec: "cada lección debe
-- resolver sus audios usando el lesson_id real."
--
-- Purely additive: lesson_slug/language/level stay as they are (still the
-- only resolution path for languages/levels with no public.courses row yet,
-- e.g. English B1-C2's placeholder Listening Lab rows) - course_lesson_id is
-- just a stronger, optional join for anything already in the normalized
-- schema. Nullable, no default, no existing row's behavior changes until
-- lib/listeningService.js is updated to prefer it.
--
-- Not applied by this session - run via your normal Supabase migration flow
-- once approved.

alter table public.lesson_audio
  add column if not exists course_lesson_id uuid references public.course_lessons(id) on delete cascade;

create unique index if not exists lesson_audio_course_lesson_unique_idx
  on public.lesson_audio (course_lesson_id)
  where course_lesson_id is not null;

create index if not exists lesson_audio_course_lesson_published_idx
  on public.lesson_audio (course_lesson_id)
  where status = 'published';

comment on column public.lesson_audio.course_lesson_id is
  'Real FK to course_lessons.id - the preferred resolution path (spec: never join Listening audio by slug alone). Null for lesson_audio rows that predate a normalized course_lessons row for their language/level (e.g. legacy-only levels).';

-- Backfill: for every existing lesson_audio row, if a course_lessons row
-- happens to share its lesson_slug, link them. One-time, idempotent (only
-- fills rows that are still null), and does not touch rows where no match
-- exists (those keep resolving by slug as before).
update public.lesson_audio la
set course_lesson_id = cl.id
from public.course_lessons cl
where la.course_lesson_id is null
  and cl.slug = la.lesson_slug;
