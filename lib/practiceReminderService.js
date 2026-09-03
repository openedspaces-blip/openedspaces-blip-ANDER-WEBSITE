const config = require('./config');
const { getSupabaseAdmin } = require('./supabaseClient');

const INACTIVITY_MS = 3 * 24 * 60 * 60 * 1000;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function displayName(profile) {
  return String(profile.full_name || profile.email || 'estudiante').trim();
}

function buildPracticeReminderEmail(profile, kind) {
  const name = escapeHtml(displayName(profile));
  const isInactive = kind === 'inactivity';
  const subject = isInactive
    ? 'Tu práctica de idiomas te espera en ANDERGO'
    : 'Es hora de practicar en ANDERGO';
  const lead = isInactive
    ? 'Hace unos días que no te vemos. Una práctica breve puede ayudarte a retomar el ritmo.'
    : 'Este es tu momento elegido para practicar idiomas.';
  const text = `Hola, ${displayName(profile)}.\n\n${lead}\n\nContinúa donde lo dejaste en ${config.practiceReminders.websiteUrl}.\n\nPuedes cambiar o desactivar estos recordatorios dentro de tu cuenta en ANDERGO Language Academy.`;
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f4f8ff;font-family:Arial,sans-serif;color:#15213b"><table width="100%" role="presentation" cellspacing="0" cellpadding="0"><tr><td style="padding:28px 14px"><table role="presentation" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;background:#fff;border-radius:16px;overflow:hidden"><tr><td style="padding:20px 28px;background:linear-gradient(115deg,#155eef,#6d28d9);color:#fff"><strong style="font-size:22px">ANDERGO</strong><br><span>Language Academy</span></td></tr><tr><td style="padding:30px 28px;font-size:16px;line-height:1.6"><h1 style="margin:0 0 16px;font-size:24px">Hola, ${name}</h1><p style="margin:0 0 20px">${lead}</p><p style="margin:0 0 24px"><a href="${config.practiceReminders.websiteUrl}" style="display:inline-block;background:#1769ea;color:#fff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:9px">Practicar ahora</a></p><p style="margin:0;color:#60708b;font-size:13px">Puedes cambiar o desactivar estos recordatorios dentro de tu cuenta en ANDERGO Language Academy.</p></td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}

function localDateAndHour(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(now);
  const value = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return { date: `${value.year}-${value.month}-${value.day}`, hour: value.hour };
}

function isReminderConfigured(reminderConfig = config.practiceReminders) {
  return Boolean(
    reminderConfig.enabled &&
      reminderConfig.apiKey &&
      reminderConfig.from &&
      reminderConfig.replyTo
  );
}

async function markUserSeen(userId) {
  if (!config.isSupabaseConfigured || !userId) return;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('profiles')
    .select('last_seen_at')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return;
  const lastSeen = data.last_seen_at ? Date.parse(data.last_seen_at) : 0;
  if (Date.now() - lastSeen < 6 * 60 * 60 * 1000) return;
  await admin.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', userId);
}

async function sendEmail(profile, kind, { fetchImpl = global.fetch, reminderConfig = config.practiceReminders } = {}) {
  const message = buildPracticeReminderEmail(profile, kind);
  const response = await fetchImpl(`${reminderConfig.apiBaseUrl}/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${reminderConfig.apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `andergo-practice-${kind}-${profile.id}-${kind === 'scheduled' ? localDateAndHour().date : profile.last_seen_at || 'unknown'}`
    },
    body: JSON.stringify({
      from: reminderConfig.from,
      reply_to: reminderConfig.replyTo,
      to: [profile.email],
      ...message
    })
  });
  if (!response.ok) throw new Error(`Email provider rejected practice reminder (${response.status})`);
  return response.json().catch(() => ({}));
}

async function runPracticeReminders({ now = new Date(), fetchImpl = global.fetch, reminderConfig = config.practiceReminders } = {}) {
  if (!isReminderConfigured(reminderConfig) || !config.isSupabaseConfigured) {
    return { status: 'skipped_not_configured', sent: 0, failed: 0 };
  }
  const admin = getSupabaseAdmin();
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, email, full_name, last_seen_at, practice_inactivity_reminders_enabled, practice_scheduled_reminders_enabled, practice_reminder_time, last_inactivity_reminder_for_seen_at, last_scheduled_reminder_date')
    .or('practice_inactivity_reminders_enabled.eq.true,practice_scheduled_reminders_enabled.eq.true')
    .not('email', 'is', null)
    .limit(reminderConfig.batchSize);
  if (error) throw error;

  const current = localDateAndHour(now);
  let sent = 0;
  let failed = 0;
  for (const profile of profiles || []) {
    const lastSeenMs = Date.parse(profile.last_seen_at || '');
    const inactive =
      profile.practice_inactivity_reminders_enabled &&
      Number.isFinite(lastSeenMs) &&
      now.getTime() - lastSeenMs >= INACTIVITY_MS &&
      profile.last_inactivity_reminder_for_seen_at !== profile.last_seen_at;
    const scheduled =
      profile.practice_scheduled_reminders_enabled &&
      String(profile.practice_reminder_time || '').slice(0, 2) === current.hour &&
      profile.last_scheduled_reminder_date !== current.date;
    const kind = scheduled ? 'scheduled' : inactive ? 'inactivity' : null;
    if (!kind) continue;
    try {
      await sendEmail(profile, kind, { fetchImpl, reminderConfig });
      const patch = kind === 'scheduled'
        ? { last_scheduled_reminder_date: current.date }
        : { last_inactivity_reminder_for_seen_at: profile.last_seen_at };
      const { error: updateError } = await admin.from('profiles').update(patch).eq('id', profile.id);
      if (updateError) throw updateError;
      sent += 1;
    } catch (error) {
      failed += 1;
      console.warn('[practice-reminders] delivery failed', { kind, error: error.message });
    }
  }
  return { status: 'completed', sent, failed };
}

module.exports = {
  buildPracticeReminderEmail,
  isReminderConfigured,
  localDateAndHour,
  markUserSeen,
  runPracticeReminders
};
