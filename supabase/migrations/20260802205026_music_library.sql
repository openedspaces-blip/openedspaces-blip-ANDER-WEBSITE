create table if not exists public.music_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  artist text not null check (char_length(artist) between 1 and 160),
  language text not null default 'english',
  level text check (level is null or level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  audio_path text not null unique,
  cover_url text,
  lyrics jsonb not null default '[]'::jsonb check (jsonb_typeof(lyrics) = 'array'),
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists music_tracks_published_idx
  on public.music_tracks (sort_order, published_at desc)
  where status = 'published';

alter table public.music_tracks enable row level security;
revoke all privileges on table public.music_tracks from anon, authenticated;
grant select, insert, update, delete on table public.music_tracks to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('music-audio', 'music-audio', false, 26214400, array['audio/mpeg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on table public.music_tracks is
  'Published ANDERGO Music tracks. MP3 files stay in the private music-audio bucket and are served through short-lived signed URLs.';
