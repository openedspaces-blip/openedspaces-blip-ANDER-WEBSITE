-- REVIEW-ONLY: prepared from the 10 objects verified in Storage on 2026-07-24.
-- Do not run until the French A1 content migration has populated
-- course_lessons.extra.mainTranscript. Units 11-12 are
-- intentionally absent because their MP3 files do not exist yet.
--
-- This script does not create audio, upload files, or guess IDs. It links
-- each verified Storage object to its existing course_lessons.id and takes
-- the transcript from that lesson's migrated canonical content.

do $$
begin
  if exists (
    select 1
    from (values
      ('b2b62f5e-d010-4165-bd39-f00265df9296'::uuid),
      ('6a6e0b0a-9cd9-4368-afc8-82b505b864bd'::uuid),
      ('613c07cb-e84a-45d9-99cc-09ca5f01282d'::uuid),
      ('1456da63-caa3-4d80-80ce-321b3dd360da'::uuid),
      ('810125eb-e9a0-4fc7-b228-49c46ed83879'::uuid),
      ('87c030eb-1e90-4acb-9254-b4460ae58fd1'::uuid),
      ('10d3a054-e1d0-41a1-a502-6beb8c9db49a'::uuid),
      ('e2c20611-000b-47e1-9681-2cf841b6627f'::uuid),
      ('17c85bc3-92b9-40ec-b543-efe1a9445608'::uuid),
      ('235213e4-878d-478f-bb88-a3fefb6baa85'::uuid)
    ) expected(course_lesson_id)
    left join public.course_lessons cl on cl.id = expected.course_lesson_id
    where cl.id is null
       or coalesce(cl.extra ->> 'mainTranscript', '') = ''
  ) then
    raise exception 'French A1 Listening content/IDs are not ready; registration aborted';
  end if;
end $$;

with source(course_lesson_id, lesson_slug, title, storage_path) as (values
  ('b2b62f5e-d010-4165-bd39-f00265df9296'::uuid, 'french-a1-bonjour-et-bienvenue-listening', 'Bienvenue à Tours !', 'french/A1/unit-01/Fr A1 01.mp3'),
  ('6a6e0b0a-9cd9-4368-afc8-82b505b864bd'::uuid, 'french-a1-je-me-presente-listening', 'Ma présentation', 'french/A1/unit-02/Fr A1 02.mp3'),
  ('613c07cb-e84a-45d9-99cc-09ca5f01282d'::uuid, 'french-a1-ma-famille-et-mes-amis-listening', 'Ma famille et ma famille d’accueil', 'french/A1/unit-03/Fr A1 03.mp3'),
  ('1456da63-caa3-4d80-80ce-321b3dd360da'::uuid, 'french-a1-a-l-ecole-listening', 'Mon école à Tours', 'french/A1/unit-04/Fr A1 04.mp3'),
  ('810125eb-e9a0-4fc7-b228-49c46ed83879'::uuid, 'french-a1-ma-journee-listening', 'Ma journée à Tours', 'french/A1/unit-05/Fr A1 05.mp3'),
  ('87c030eb-1e90-4acb-9254-b4460ae58fd1'::uuid, 'french-a1-l-heure-et-les-dates-listening', 'L’anniversaire de Léa', 'french/A1/unit-06/Fr A1 06.mp3'),
  ('10d3a054-e1d0-41a1-a502-6beb8c9db49a'::uuid, 'french-a1-a-table-listening', 'Un dîner chez les Lambert', 'french/A1/unit-07/Fr A1 07.mp3'),
  ('e2c20611-000b-47e1-9681-2cf841b6627f'::uuid, 'french-a1-chez-moi-listening', 'Ma chambre à Tours', 'french/A1/unit-08/Fr A1 08.mp3'),
  ('17c85bc3-92b9-40ec-b543-efe1a9445608'::uuid, 'french-a1-dans-ma-ville-listening', 'Une promenade dans Tours', 'french/A1/unit-09/Fr A1 09.mp3'),
  ('235213e4-878d-478f-bb88-a3fefb6baa85'::uuid, 'french-a1-mes-loisirs-listening', 'Mes activités préférées', 'french/A1/unit-10/Fr A1 10.mp3')
) , canonical as (
  select
    source.*,
    cl.extra ->> 'mainTranscript' as transcript,
    'https://kdfzpqqyklqxprcweuqu.supabase.co/storage/v1/object/public/lesson-audio/' ||
      replace(source.storage_path, ' ', '%20') as main_file_path
  from source
  join public.course_lessons cl on cl.id = source.course_lesson_id
), updated as (
  update public.lesson_audio la set
  language = 'french',
  level = 'A1',
  lesson_slug = canonical.lesson_slug,
  title = canonical.title,
  source_type = 'official',
  speaker = null,
  main_file_path = canonical.main_file_path,
  slow_file_path = null,
  very_slow_file_path = null,
  transcript = canonical.transcript,
  status = 'published',
  course_lesson_id = canonical.course_lesson_id,
  updated_at = now()
  from canonical
  where la.course_lesson_id = canonical.course_lesson_id
     or la.lesson_slug = canonical.lesson_slug
  returning la.id
)
insert into public.lesson_audio (
  language, level, lesson_slug, title, source_type, speaker,
  main_file_path, slow_file_path, very_slow_file_path,
  transcript, status, course_lesson_id
)
select
  'french', 'A1', canonical.lesson_slug, canonical.title, 'official', null,
  canonical.main_file_path, null, null,
  canonical.transcript, 'published', canonical.course_lesson_id
from canonical
where not exists (
  select 1 from public.lesson_audio la
  where la.course_lesson_id = canonical.course_lesson_id
     or la.lesson_slug = canonical.lesson_slug
);
