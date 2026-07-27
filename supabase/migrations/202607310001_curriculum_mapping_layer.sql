-- Curriculum Mapping Layer
-- Academic metadata is intentionally separated from learner-facing course
-- content. Student APIs must keep reading course_units/course_lessons only;
-- teacher/reporting services may join these tables server-side.

create extension if not exists "pgcrypto";

create table if not exists public.curriculum_frameworks (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  jurisdiction text,
  version text,
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.curriculum_outcomes (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.curriculum_frameworks(id) on delete cascade,
  external_code text not null,
  outcome_type text not null check (
    outcome_type in (
      'cefr_descriptor',
      'fundamental_competency',
      'specific_competency',
      'achievement_indicator',
      'communicative_function',
      'learning_objective',
      'conceptual_content',
      'procedural_content',
      'attitudinal_content'
    )
  ),
  title text not null,
  description text,
  language_code text,
  cefr_level text check (cefr_level is null or cefr_level in ('A1','A2','B1','B2','C1','C2')),
  grade_band text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (framework_id, external_code)
);

create table if not exists public.curriculum_activity_mappings (
  id uuid primary key default gen_random_uuid(),
  outcome_id uuid not null references public.curriculum_outcomes(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  unit_id uuid references public.course_units(id) on delete cascade,
  lesson_id uuid references public.course_lessons(id) on delete cascade,
  alignment_strength text not null default 'supporting'
    check (alignment_strength in ('primary','supporting','assessed')),
  evidence_type text check (
    evidence_type is null or evidence_type in ('participation','knowledge','performance','product')
  ),
  evidence_note text,
  created_at timestamptz not null default now(),
  check (num_nonnulls(course_id, unit_id, lesson_id) = 1),
  unique (outcome_id, course_id, unit_id, lesson_id)
);

create index if not exists idx_curriculum_outcomes_framework
  on public.curriculum_outcomes(framework_id, outcome_type);
create index if not exists idx_curriculum_mappings_course
  on public.curriculum_activity_mappings(course_id);
create index if not exists idx_curriculum_mappings_unit
  on public.curriculum_activity_mappings(unit_id);
create index if not exists idx_curriculum_mappings_lesson
  on public.curriculum_activity_mappings(lesson_id);

alter table public.curriculum_frameworks enable row level security;
alter table public.curriculum_outcomes enable row level security;
alter table public.curriculum_activity_mappings enable row level security;

revoke all on table public.curriculum_frameworks from anon, authenticated;
revoke all on table public.curriculum_outcomes from anon, authenticated;
revoke all on table public.curriculum_activity_mappings from anon, authenticated;
grant all on table public.curriculum_frameworks to service_role;
grant all on table public.curriculum_outcomes to service_role;
grant all on table public.curriculum_activity_mappings to service_role;

-- No anonymous/student policies: curricular metadata never travels through
-- the normal learner experience. The backend service role manages it and
-- exposes only purpose-built teacher/reporting projections.
drop policy if exists "Service role manages curriculum frameworks" on public.curriculum_frameworks;
create policy "Service role manages curriculum frameworks"
  on public.curriculum_frameworks for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service role manages curriculum outcomes" on public.curriculum_outcomes;
create policy "Service role manages curriculum outcomes"
  on public.curriculum_outcomes for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service role manages curriculum mappings" on public.curriculum_activity_mappings;
create policy "Service role manages curriculum mappings"
  on public.curriculum_activity_mappings for all
  to service_role
  using (true)
  with check (true);

insert into public.curriculum_frameworks (code, name, jurisdiction, version, source_url)
values
  ('CEFR', 'Common European Framework of Reference for Languages', 'Europe', 'Companion Volume', 'https://www.coe.int/en/web/common-european-framework-reference-languages'),
  ('MINERD-SEC-2023', 'Adecuación Curricular del Nivel Secundario', 'República Dominicana', '2023', 'https://www.minerd.gob.do/docs/direccion-general-de-curriculo/Ht7X-adecuacion-secundaria-2023pdf.pdf')
on conflict (code) do update set
  name = excluded.name,
  jurisdiction = excluded.jurisdiction,
  version = excluded.version,
  source_url = excluded.source_url,
  is_active = true,
  updated_at = now();

comment on table public.curriculum_activity_mappings is
  'Private Curriculum Mapping Layer linking courses, units or lessons to MINERD/CEFR outcomes without exposing academic metadata in the student UI.';
