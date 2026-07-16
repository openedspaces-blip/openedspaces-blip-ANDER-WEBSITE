-- =========================================================
-- 202607170001_course_units.sql
-- =========================================================
-- Adds a thematic-unit layer on top of the normalized course schema
-- (supabase/migrations/202607120001_normalized_courses_schema.sql), so a
-- course_lessons row ("activity") can optionally belong to a course_units
-- row ("unit"). unit_id is nullable - every existing course/lesson (still
-- one row per skill, no units) is completely unaffected. Only English A1
-- populates units for now (see scripts/migrate-english-a1-units.js).

create table if not exists public.course_units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text unique not null,
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_course_units_course on public.course_units(course_id, order_index);

alter table public.course_lessons
  add column if not exists unit_id uuid references public.course_units(id) on delete set null;

create index if not exists idx_course_lessons_unit on public.course_lessons(unit_id, order_index);

alter table public.course_units enable row level security;

drop policy if exists "Public can read course units" on public.course_units;
create policy "Public can read course units" on public.course_units for select using (true);
drop policy if exists "Service role manages course units" on public.course_units;
create policy "Service role manages course units" on public.course_units for all using (auth.role() = 'service_role');

drop trigger if exists trg_course_units_updated_at on public.course_units;
create trigger trg_course_units_updated_at before update on public.course_units
  for each row execute function public.set_updated_at();
