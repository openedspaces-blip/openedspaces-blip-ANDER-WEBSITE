-- Tutor usage is written only by the backend service role. Authenticated
-- users may read their own counter for transparency; they cannot insert,
-- update or delete it through the Data API.

alter table public.user_usage_counters enable row level security;

drop policy if exists "Users read own usage counters" on public.user_usage_counters;
create policy "Users read own usage counters"
  on public.user_usage_counters
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Service role manages usage counters" on public.user_usage_counters;

alter table public.user_usage_counters
  drop constraint if exists user_usage_counters_count_nonnegative;
alter table public.user_usage_counters
  add constraint user_usage_counters_count_nonnegative check (count >= 0);

alter table public.user_usage_counters
  drop constraint if exists user_usage_counters_period_format;
alter table public.user_usage_counters
  add constraint user_usage_counters_period_format
  check (period ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');

create or replace function public.increment_user_usage_counter(
  p_user_id uuid,
  p_feature text,
  p_period text
)
returns integer
language sql
security definer
set search_path = ''
as $$
  insert into public.user_usage_counters (user_id, feature, period, count)
  values (p_user_id, p_feature, p_period, 1)
  on conflict (user_id, feature, period)
  do update set
    count = public.user_usage_counters.count + 1,
    updated_at = now()
  returning count;
$$;

revoke all on function public.increment_user_usage_counter(uuid, text, text) from public;
revoke all on function public.increment_user_usage_counter(uuid, text, text) from anon;
revoke all on function public.increment_user_usage_counter(uuid, text, text) from authenticated;
grant execute on function public.increment_user_usage_counter(uuid, text, text) to service_role;
