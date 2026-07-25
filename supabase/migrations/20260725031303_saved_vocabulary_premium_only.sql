-- Saved vocabulary is a Premium-only server feature.
--
-- The browser never reads or writes this table directly: every operation
-- goes through /api/vocabulary/saved, where the current profile is checked
-- with lib/entitlementsService.js. Keeping authenticated clients away from
-- the table prevents a free account from bypassing that entitlement check
-- with a direct Data API request.

-- The original table migration has a later historical timestamp. On an
-- existing project the table is already present and this block hardens it;
-- on a clean project this safely becomes a no-op and that later migration
-- creates the table with the same server-only grants from the outset.
do $$
begin
  if to_regclass('public.user_saved_vocabulary') is not null then
    execute 'drop policy if exists "Users can read their own saved vocabulary" on public.user_saved_vocabulary';
    execute 'drop policy if exists "Users can insert their own saved vocabulary" on public.user_saved_vocabulary';
    execute 'drop policy if exists "Users can update their own saved vocabulary" on public.user_saved_vocabulary';
    execute 'drop policy if exists "Users can delete their own saved vocabulary" on public.user_saved_vocabulary';

    execute 'revoke all privileges on table public.user_saved_vocabulary from anon';
    execute 'revoke all privileges on table public.user_saved_vocabulary from authenticated';
    execute 'alter table public.user_saved_vocabulary enable row level security';
    execute 'grant select, insert, update, delete on table public.user_saved_vocabulary to service_role';
    execute $comment$
      comment on table public.user_saved_vocabulary is
      'Premium-only personal vocabulary saved from Reading. Access is mediated by the ANDERGO server, which verifies current entitlements before using the service role.'
    $comment$;
  end if;
end
$$;
