create table if not exists public.user_saved_vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_language text not null,
  target_language text not null,
  term text not null check (char_length(term) between 1 and 120),
  term_key text generated always as (lower(term)) stored,
  translation text not null check (char_length(translation) between 1 and 1000),
  context text check (context is null or char_length(context) <= 1000),
  lesson_slug text,
  unit_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_user_saved_vocabulary_unique_term
  on public.user_saved_vocabulary (
    user_id,
    source_language,
    target_language,
    term_key
  );

create index if not exists idx_user_saved_vocabulary_user_created
  on public.user_saved_vocabulary (user_id, created_at desc);

alter table public.user_saved_vocabulary enable row level security;

-- Premium is verified with fresh profile data in the server endpoint. The
-- browser therefore has no direct Data API privileges on this table, so a
-- Free account cannot bypass that entitlement check.
revoke all privileges on table public.user_saved_vocabulary from anon;
revoke all privileges on table public.user_saved_vocabulary from authenticated;
grant select, insert, update, delete on public.user_saved_vocabulary to service_role;

comment on table public.user_saved_vocabulary is
  'Premium-only personal vocabulary saved from Reading. Access is mediated by the ANDERGO server, which verifies current entitlements before using the service role.';
