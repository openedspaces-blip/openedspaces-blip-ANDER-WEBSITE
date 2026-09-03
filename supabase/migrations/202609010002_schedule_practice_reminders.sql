-- Vercel Hobby only permits daily cron jobs. Supabase pg_cron invokes the
-- protected Vercel endpoint hourly instead, allowing learners to choose a
-- daily practice hour without requiring a Vercel plan upgrade.
--
-- Before running this migration, create this Vault secret once:
--   name: andergo_practice_reminders_cron_secret
--   value: the same value configured as Vercel's CRON_SECRET

create extension if not exists pg_cron;

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'andergo-practice-reminders-hourly';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'andergo-practice-reminders-hourly',
    '0 * * * *',
    $command$
      select net.http_get(
        url := 'https://andergo.online/api/cron/practice-reminders',
        headers := jsonb_build_object(
          'Authorization',
          'Bearer ' || (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'andergo_practice_reminders_cron_secret'
            limit 1
          )
        )
      );
    $command$
  );
end;
$$;
