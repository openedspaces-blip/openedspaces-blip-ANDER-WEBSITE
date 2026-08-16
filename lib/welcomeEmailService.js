const config = require('./config');
const { getSupabaseAdmin } = require('./supabaseClient');

const SUBJECT = '¡Gracias por registrarte en ANDERGO Language Academy!';
const WEBSITE_URL = 'https://andergo.online';
const MAX_PROVIDER_ATTEMPTS = 3;

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function greetingFor(name) {
  const displayName = String(name || '')
    .replace(/\s+/g, ' ')
    .trim();
  return displayName ? `¡Hola, ${displayName}!` : '¡Hola!';
}

function buildWelcomeEmail(name) {
  const greeting = greetingFor(name);
  const text = `${greeting}

Queremos agradecerte sinceramente por registrarte en ANDERGO Language Academy.

Te invitamos a explorar y aprovechar todas las herramientas disponibles en nuestra plataforma, creada para ayudarte a aprender y practicar idiomas de una manera dinámica, organizada y accesible. En ANDERGO trabajamos cada día para renovar y reinventar la experiencia de aprendizaje.

Además, muy pronto podrás encontrar en nuestra sección de descargas la versión APP de ANDERGO, para que disfrutes de una experiencia aún más cómoda desde tu dispositivo móvil.

Gracias por confiar en nosotros y por apoyar el talento y el desarrollo tecnológico dominicano. Tu respaldo nos motiva a seguir creciendo y mejorando.

Comienza a aprender:
${WEBSITE_URL}

Atentamente,

Equipo de ANDERGO Language Academy
support@andergo.online`;

  const paragraphs = [
    'Queremos agradecerte sinceramente por registrarte en ANDERGO Language Academy.',
    'Te invitamos a explorar y aprovechar todas las herramientas disponibles en nuestra plataforma, creada para ayudarte a aprender y practicar idiomas de una manera dinámica, organizada y accesible. En ANDERGO trabajamos cada día para renovar y reinventar la experiencia de aprendizaje.',
    'Además, muy pronto podrás encontrar en nuestra sección de descargas la versión APP de ANDERGO, para que disfrutes de una experiencia aún más cómoda desde tu dispositivo móvil.',
    'Gracias por confiar en nosotros y por apoyar el talento y el desarrollo tecnológico dominicano. Tu respaldo nos motiva a seguir creciendo y mejorando.'
  ];
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${SUBJECT}</title></head>
<body style="margin:0;padding:0;background:#f4f7ff;font-family:Arial,Helvetica,sans-serif;color:#15213b">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7ff"><tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr><td style="padding:28px 28px 20px;background:linear-gradient(135deg,#1b6df0,#19b6e8);color:#ffffff"><div style="font-size:24px;font-weight:700">ANDERGO</div><div style="font-size:14px;margin-top:4px">Language Academy</div></td></tr>
      <tr><td style="padding:30px 28px;font-size:16px;line-height:1.6"><h1 style="font-size:24px;line-height:1.25;margin:0 0 20px;color:#15213b">${escapeHtml(greeting)}</h1>${paragraphs.map((paragraph) => `<p style="margin:0 0 18px">${paragraph}</p>`).join('')}<p style="margin:24px 0"><a href="${WEBSITE_URL}" style="display:inline-block;background:#1769ea;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:8px">Comienza a aprender</a></p><p style="margin:0">Atentamente,<br><strong>Equipo de ANDERGO Language Academy</strong><br><a href="mailto:support@andergo.online" style="color:#1769ea">support@andergo.online</a></p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  return { subject: SUBJECT, text, html };
}

function safeErrorCode(error) {
  const status = Number(error?.status || error?.statusCode || 0);
  if (status === 401 || status === 403) return 'PROVIDER_AUTH_OR_SENDER_ERROR';
  if (status === 429) return 'PROVIDER_RATE_LIMIT';
  if (status >= 500) return 'PROVIDER_UNAVAILABLE';
  return 'PROVIDER_SEND_FAILED';
}

function logWelcomeEmail({ status, attemptCount, errorCode, durationMs }) {
  console.log(
    `[welcome-email] status=${status} attempts=${attemptCount || 0} errorCode=${errorCode || 'none'} durationMs=${durationMs || 0} provider=resend`
  );
}

function createSupabaseRepository() {
  return {
    async claim(userId, maxAttempts) {
      const client = getSupabaseAdmin();
      if (!client) return { claimed: false, attemptCount: 0 };
      const { data, error } = await client.rpc('claim_welcome_email_delivery', {
        p_user_id: userId,
        p_max_attempts: maxAttempts
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return { claimed: Boolean(row?.claimed), attemptCount: Number(row?.attempt_count || 0) };
    },
    async complete(userId, messageId, attemptCount) {
      const client = getSupabaseAdmin();
      if (!client) return;
      const { error } = await client
        .from('welcome_email_deliveries')
        .update({
          status: 'sent',
          provider_message_id: messageId || null,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          attempt_count: attemptCount
        })
        .eq('user_id', userId);
      if (error) throw error;
    },
    async fail(userId, errorCode, attemptCount) {
      const client = getSupabaseAdmin();
      if (!client) return;
      const { error } = await client
        .from('welcome_email_deliveries')
        .update({
          status: 'failed',
          last_error_code: errorCode,
          updated_at: new Date().toISOString(),
          attempt_count: attemptCount
        })
        .eq('user_id', userId);
      if (error) throw error;
    }
  };
}

function createWelcomeEmailService({
  emailConfig = config.welcomeEmail,
  repository = createSupabaseRepository(),
  fetchImpl = global.fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  logger = logWelcomeEmail
} = {}) {
  async function domainIsVerified() {
    const response = await fetchImpl(`${emailConfig.apiBaseUrl}/domains`, {
      headers: { Authorization: `Bearer ${emailConfig.apiKey}` }
    });
    if (!response.ok) {
      const error = new Error('Could not check sender domain');
      error.status = response.status;
      throw error;
    }
    const body = await response.json();
    const domains = Array.isArray(body?.data) ? body.data : [];
    return domains.some(
      (domain) =>
        String(domain.name || '').toLowerCase() === 'andergo.online' &&
        String(domain.status || '').toLowerCase() === 'verified'
    );
  }

  async function sendWithRetry({ userId, email, name, attemptCount }) {
    const message = buildWelcomeEmail(name);
    let lastError;
    for (let providerAttempt = 1; providerAttempt <= MAX_PROVIDER_ATTEMPTS; providerAttempt += 1) {
      try {
        const response = await fetchImpl(`${emailConfig.apiBaseUrl}/emails`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${emailConfig.apiKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': `andergo-welcome-${userId}`
          },
          body: JSON.stringify({
            from: emailConfig.from,
            reply_to: emailConfig.replyTo,
            to: [email],
            ...message
          })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error('Welcome email provider rejected the request');
          error.status = response.status;
          throw error;
        }
        return { ok: true, messageId: payload?.id || null, providerAttempts: providerAttempt };
      } catch (error) {
        lastError = error;
        if (providerAttempt < MAX_PROVIDER_ATTEMPTS) await sleep(250 * providerAttempt);
      }
    }
    return {
      ok: false,
      errorCode: safeErrorCode(lastError),
      providerAttempts: MAX_PROVIDER_ATTEMPTS
    };
  }

  async function sendAfterRegistration({ userId, email, name }) {
    const startedAt = Date.now();
    try {
      if (
        !emailConfig.enabled ||
        !emailConfig.apiKey ||
        !emailConfig.from ||
        !emailConfig.replyTo
      ) {
        logger({
          status: 'skipped_not_configured',
          attemptCount: 0,
          durationMs: Date.now() - startedAt
        });
        return { status: 'skipped_not_configured' };
      }
      if (!(await domainIsVerified())) {
        logger({
          status: 'skipped_sender_unverified',
          attemptCount: 0,
          errorCode: 'SENDER_DOMAIN_UNVERIFIED',
          durationMs: Date.now() - startedAt
        });
        return { status: 'skipped_sender_unverified' };
      }
      const claim = await repository.claim(userId, emailConfig.maxAttempts);
      if (!claim.claimed) {
        logger({
          status: 'duplicate_or_exhausted',
          attemptCount: claim.attemptCount,
          durationMs: Date.now() - startedAt
        });
        return { status: 'duplicate_or_exhausted' };
      }
      const outcome = await sendWithRetry({
        userId,
        email,
        name,
        attemptCount: claim.attemptCount
      });
      const finalAttempts = Math.min(
        emailConfig.maxAttempts,
        claim.attemptCount + outcome.providerAttempts - 1
      );
      if (outcome.ok) {
        await repository.complete(userId, outcome.messageId, finalAttempts);
        logger({ status: 'sent', attemptCount: finalAttempts, durationMs: Date.now() - startedAt });
        return { status: 'sent' };
      }
      await repository.fail(userId, outcome.errorCode, finalAttempts);
      logger({
        status: 'failed',
        attemptCount: finalAttempts,
        errorCode: outcome.errorCode,
        durationMs: Date.now() - startedAt
      });
      return { status: 'failed' };
    } catch (error) {
      // A welcome email is intentionally non-critical: the confirmed account
      // stays usable even if the database or provider is temporarily down.
      logger({
        status: 'internal_error',
        attemptCount: 0,
        errorCode: safeErrorCode(error),
        durationMs: Date.now() - startedAt
      });
      return { status: 'internal_error' };
    }
  }

  return { sendAfterRegistration };
}

const welcomeEmailService = createWelcomeEmailService();

module.exports = {
  SUBJECT,
  buildWelcomeEmail,
  greetingFor,
  createWelcomeEmailService,
  welcomeEmailService
};
