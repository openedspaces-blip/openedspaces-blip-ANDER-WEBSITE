-- Track the last forgiven practice gap so a flexible streak remains limited
-- to one missed day in any rolling seven-day period.
alter table public.profiles
  add column if not exists last_streak_grace_date date;

alter table public.user_streaks
  add column if not exists last_streak_grace_date date;

comment on column public.profiles.last_streak_grace_date is
  'UTC date when the user last used the one-day flexible streak grace.';

comment on column public.user_streaks.last_streak_grace_date is
  'UTC date when the user last used the one-day flexible streak grace.';
