-- Transactional welcome email deliveries. This stores delivery state only;
-- it intentionally never stores the recipient address or email body.

create table if not exists public.welcome_email_deliveries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'failed', 'skipped')),
  attempt_count integer not null default 0
    check (attempt_count >= 0 and attempt_count <= 3),
  provider_message_id text,
  last_error_code text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.welcome_email_deliveries enable row level security;
revoke all on public.welcome_email_deliveries from anon, authenticated;
grant select, insert, update on public.welcome_email_deliveries to service_role;

-- Atomically obtains the one allowed delivery attempt. A stale worker can be
-- recovered after ten minutes, while a completed delivery can never be sent again.
create or replace function public.claim_welcome_email_delivery(
  p_user_id uuid,
  p_max_attempts integer default 3
)
returns table (claimed boolean, attempt_count integer)
language plpgsql
security invoker
set search_path = public
as $$
declare
  delivery public.welcome_email_deliveries%rowtype;
begin
  if p_max_attempts < 1 or p_max_attempts > 3 then
    raise exception 'p_max_attempts must be between 1 and 3';
  end if;

  insert into public.welcome_email_deliveries (user_id, status, attempt_count)
  values (p_user_id, 'sending', 1)
  on conflict (user_id) do nothing;

  if found then
    return query select true, 1;
    return;
  end if;

  select * into delivery
  from public.welcome_email_deliveries
  where user_id = p_user_id
  for update;

  if delivery.status = 'sent'
    or delivery.attempt_count >= p_max_attempts
    or (delivery.status = 'sending' and delivery.updated_at > now() - interval '10 minutes') then
    return query select false, delivery.attempt_count;
    return;
  end if;

  update public.welcome_email_deliveries
  set status = 'sending',
      attempt_count = delivery.attempt_count + 1,
      last_error_code = null,
      updated_at = now()
  where user_id = p_user_id;

  return query select true, delivery.attempt_count + 1;
end;
$$;

revoke all on function public.claim_welcome_email_delivery(uuid, integer)
  from public, anon, authenticated;
grant execute on function public.claim_welcome_email_delivery(uuid, integer)
  to service_role;

comment on table public.welcome_email_deliveries is
  'Idempotent status for transactional ANDERGO welcome emails; no recipient or body is persisted.';
