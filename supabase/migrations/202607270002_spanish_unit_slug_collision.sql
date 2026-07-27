-- A1 and A2 previously shared the globally unique slug
-- "salud-y-bienestar". A1 now uses "salud-y-bienestar-a1"; restore the
-- original unit row to the A2 course without changing its lesson ids.

update public.course_units
set course_id = (
  select c.id
  from public.courses c
  join public.languages l on l.id = c.language_id
  join public.levels lv on lv.id = c.level_id
  where l.code = 'spanish' and lv.code = 'A2'
  limit 1
)
where slug = 'salud-y-bienestar'
  and course_id is distinct from (
    select c.id
    from public.courses c
    join public.languages l on l.id = c.language_id
    join public.levels lv on lv.id = c.level_id
    where l.code = 'spanish' and lv.code = 'A2'
    limit 1
  );

do $$
declare
  lesson_count integer;
begin
  select count(*) into lesson_count
  from public.course_lessons cl
  join public.course_units cu on cu.id = cl.unit_id
  join public.courses c on c.id = cu.course_id
  join public.languages l on l.id = c.language_id
  join public.levels lv on lv.id = c.level_id
  where l.code = 'spanish'
    and lv.code = 'A2'
    and cu.slug = 'salud-y-bienestar';

  if lesson_count <> 6 then
    raise exception 'Spanish A2 salud-y-bienestar expected 6 lessons, found %', lesson_count;
  end if;
end $$;
