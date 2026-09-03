-- Persistent, server-managed dictionary catalogue. The public client never
-- writes entries; the API reads through the service role after validation.
create table if not exists public.vocabulary_dictionary_entries (
  id bigint generated always as identity primary key,
  language text not null check (language in ('english', 'spanish', 'french', 'italian', 'portuguese', 'german')),
  term text not null,
  spanish_meaning text not null,
  cefr_level text,
  part_of_speech text,
  example text,
  frequency_rank integer,
  source text not null default 'curated',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (language, term)
);

create index if not exists vocabulary_dictionary_entries_language_term_idx
  on public.vocabulary_dictionary_entries (language, term);
create index if not exists vocabulary_dictionary_entries_language_rank_idx
  on public.vocabulary_dictionary_entries (language, frequency_rank);

alter table public.vocabulary_dictionary_entries enable row level security;
revoke all on table public.vocabulary_dictionary_entries from anon, authenticated;
grant select on table public.vocabulary_dictionary_entries to service_role;
