// lib/server.js
// Express app used both for local development (`npm run dev` / `npm start`),
// the test suite (server.test.js imports `createServer`), and production -
// api/index.js is the only Vercel serverless function and delegates
// every request straight into this same app (routed there via the /api/:match*
// rewrite in vercel.json - see that file for why a plain filename is used
// instead of a [...catchall].js dynamic route).
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const multer = require('multer');

const config = require('./config');
const authService = require('./authService');
const profilesService = require('./profilesService');
const mfaService = require('./mfaService');
const lessonsService = require('./lessonsService');
const courseLessonsService = require('./courseLessonsService');
const preferencesService = require('./preferencesService');
const goalsService = require('./goalsService');
const dashboardService = require('./dashboardService');
const {
  getTutorReplyStream,
  getSpeakingCorrection,
  getTextCorrection,
  tutorConfigError,
  isAnyProviderConfigured
} = require('./aiTutorService');
const listeningService = require('./listeningService');
const speakingService = require('./speakingService');
const ttsService = require('./ttsService');
const usageLimitService = require('./usageLimitService');
const { getUserEntitlements } = require('./entitlementsService');
const translatorService = require('./translatorService');
const translatorLanguages = require('../src/js/translator-languages.js');
const { levelContent, languageContent } = require('./uiContent');
const plansConfig = require('./plansConfig');
const planService = require('./planService');
const subscriptionService = require('./subscriptionService');

// Matches src/js/script.js's LANGUAGE_LOCALES - the AI Tutor voice locale
// must match the language being studied, never the interface language.
// es-419 (Latin American Spanish), not es-ES, matches this app's actual
// Spanish content/audience - see LANGUAGE_LOCALES's comment for the same.
const SUPPORTED_SPEECH_LOCALES = new Set(['en-US', 'fr-FR', 'es-419', 'it-IT', 'de-DE', 'pt-BR']);
// Generous margin over the tutor's own word-count ceiling (120 words for
// C1/C2, see aiTutorService.js's LEVEL_RESPONSE_GUIDANCE) - this just
// guards against abuse, not normal replies.
const MAX_SPEECH_TEXT_LENGTH = 2000;
// Free-tier monthly caps, read from lib/plansConfig.js (the single source
// of plan limits/prices) rather than duplicated here - same calendar-month
// period for both. Premium/ceo bypass both entirely (isPremiumActive).
const FREE_TUTOR_QUERY_MONTHLY_LIMIT = plansConfig.getFeatureLimit('free', 'tutor_query');
const FREE_TUTOR_VOICE_MONTHLY_LIMIT = plansConfig.getFeatureLimit('free', 'tutor_voice');

// memoryStorage keeps the uploaded audio in a Buffer on req.file - it is
// never written to disk, and speakingService discards its reference to that
// buffer as soon as the request is handled (see /api/speaking/analyze).
const speakingUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // ~15MB - generous headroom over a 60s compressed clip
});

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' ? token : null;
}

async function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  const user = await authService.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
  }
  req.user = user;
  next();
}

// Attaches req.user when a valid token is present, but never blocks the
// request - used for endpoints that behave differently for guests vs. users
// without requiring authentication (e.g. lesson listing).
async function attachUserIfPresent(req, _res, next) {
  const token = getBearerToken(req);
  req.user = token ? await authService.verifyToken(token) : null;
  next();
}

function createServer() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors());
  // Vercel's Node runtime can pre-parse a JSON body into req.body before this
  // app ever sees the request, having already drained the stream - letting
  // express.json() try to read it again would leave req.body empty on every
  // route. Skip re-parsing whenever a body object is already present.
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      return next();
    }
    express.json()(req, res, next);
  });
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('tiny'));
  }

  app.use(express.static(PUBLIC_DIR));

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api', apiLimiter);

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      configured: config.isSupabaseConfigured,
      supabase: {
        configured: config.isSupabaseConfigured,
        mode: config.isSupabaseConfigured ? 'supabase' : 'demo'
      },
      // No keys, no other provider names - just enough for a status page to
      // show whether the tutor can respond at all right now.
      aiTutor: {
        configured: isAnyProviderConfigured(),
        primaryProvider: 'cerebras',
        streaming: true
      },
      translator: {
        provider: 'deepl',
        configured: Boolean(process.env.DEEPL_API_KEY),
        baseUrlConfigured: Boolean(process.env.DEEPL_API_BASE_URL)
      },
      // Confirms only that Supabase Auth is the configured sender path -
      // the actual SMTP account/credentials live in the Supabase dashboard
      // (Brevo), never in this app's env or code. "configured" intentionally
      // says "dashboard-managed" rather than true/false: this endpoint has
      // no way to check the dashboard's SMTP settings, and must never claim
      // delivery succeeded - that's only ever verifiable in Brevo's own
      // Transactional Logs.
      emailAuth: {
        provider: 'supabase-brevo-smtp',
        sender: config.noReplyEmail,
        configured: 'dashboard-managed'
      }
    });
  });

  app.get('/api/content/languages', (_req, res) => {
    res.json({ levelContent, languageContent });
  });

  // Read-only peek at the Tutor's monthly free-query cap, so the #tutor
  // view can show "Te quedan N de 30 consultas" as soon as it opens instead
  // of only after the first message streams back. usageLimitService.checkUsage
  // never records/increments (only recordUsage does, after a real reply) -
  // safe to call as often as the UI wants. Guests and Premium/ceo both get
  // remaining: null (see checkUsage), so the frontend just hides the counter.
  app.get('/api/ai/tutor/usage', attachUserIfPresent, async (req, res) => {
    const usage = await usageLimitService.checkUsage({
      userId: req.user?.id,
      feature: 'tutor_query',
      monthlyLimit: FREE_TUTOR_QUERY_MONTHLY_LIMIT
    });
    res.json({ used: usage.used, remaining: usage.remaining, limit: usage.limit });
  });

  // Streams the tutor's reply to the browser as it's generated (SSE:
  // `data: {"delta": "..."}\n\n` per chunk, ending with `{"done": true}` or
  // `{"error": true, "message": "..."}`). If no provider is configured at
  // all, that's knowable before any streaming starts, so it stays a plain
  // JSON 503 - only failures discovered mid-stream (after headers are sent)
  // go through the SSE error event, since the HTTP status can't change by then.
  app.post('/api/ai/tutor', attachUserIfPresent, async (req, res) => {
    const configError = tutorConfigError();
    if (configError) {
      res.status(configError.status).json({ error: configError.message });
      return;
    }

    const {
      task,
      language,
      skill,
      level,
      nativeLanguage,
      // 'bilingual' | 'direct' (learningPathState.learningMode) - see
      // lib/aiTutorService.js#buildTutorInput for how this changes the
      // language rule (L2-only main response, optional L1 support block).
      learningMode,
      prompt,
      lessonTitle,
      lessonIntro,
      selectedSuggestion,
      history,
      transcript,
      vocabulary,
      currentQuestion,
      selectedAnswer,
      supportMode,
      // speaking_correction-only fields (§10 of the Speaking redesign spec) -
      // ignored by the general tutor branch below.
      bridgeLanguage,
      unitId,
      lessonId,
      activityType,
      situation,
      studentResponse,
      conversationHistory
    } = req.body || {};

    // Free-tier monthly cap on the general tutor chat only - speaking_correction
    // is a distinct feature (Speaking's integrated corrector) and is never
    // counted against it. Checked (not consumed) before any streaming starts,
    // same "knowable before headers" reasoning as configError above.
    const isGeneralTutorTask = task !== 'speaking_correction';
    let tutorUsage = null;
    if (isGeneralTutorTask) {
      tutorUsage = await usageLimitService.checkUsage({
        userId: req.user?.id,
        feature: 'tutor_query',
        monthlyLimit: FREE_TUTOR_QUERY_MONTHLY_LIMIT
      });
      if (!tutorUsage.allowed) {
        res.status(403).json({
          error: `Has utilizado tus ${FREE_TUTOR_QUERY_MONTHLY_LIMIT} consultas gratuitas al Tutor IA. Para continuar aprendiendo sin este límite, actualiza a ANDERGO Premium.`,
          code: 'USAGE_LIMIT_REACHED',
          limited: true,
          remaining: 0,
          limit: FREE_TUTOR_QUERY_MONTHLY_LIMIT
        });
        return;
      }
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Disables buffering on Vercel/nginx-style proxies so chunks reach the
      // browser as they're written instead of arriving all at once at the end.
      'X-Accel-Buffering': 'no'
    });
    res.flushHeaders?.();

    const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);
    // A query only "counts" once the provider has actually returned
    // content - never on a validation/server/timeout/provider error, and
    // never on a technically-successful-but-empty reply.
    let respondedWithContent = false;
    const onDelta = (text) => {
      if (text) respondedWithContent = true;
      send({ delta: text });
    };

    try {
      if (task === 'speaking_correction') {
        // Speaking's integrated corrector (§7/§11/§12) - a distinct task
        // from the general tutor chat above, only ever given this one
        // activity's transcribed text, never audio (see script.js's
        // requestSpeakingCorrection, which builds this exact narrow payload).
        await getSpeakingCorrection({
          language,
          bridgeLanguage,
          level,
          unitId,
          lessonId,
          activityType,
          situation,
          prompt,
          studentResponse,
          conversationHistory: Array.isArray(conversationHistory)
            ? conversationHistory.slice(-3)
            : undefined,
          onDelta
        });
      } else {
        await getTutorReplyStream({
          language,
          skill,
          level,
          nativeLanguage,
          learningMode,
          prompt,
          lessonTitle,
          lessonIntro,
          selectedSuggestion,
          transcript,
          vocabulary,
          currentQuestion,
          selectedAnswer,
          supportMode,
          history: Array.isArray(history) ? history.slice(-6) : undefined,
          onDelta
        });
      }

      let usagePayload;
      if (isGeneralTutorTask && respondedWithContent && req.user?.id) {
        // Never let a usage-recording failure break an otherwise-successful
        // reply that's already been streamed to the browser.
        await usageLimitService
          .recordUsage({ userId: req.user.id, feature: 'tutor_query' })
          .catch(() => {});
        usagePayload =
          tutorUsage?.remaining != null
            ? { remaining: Math.max(0, tutorUsage.remaining - 1), limit: FREE_TUTOR_QUERY_MONTHLY_LIMIT }
            : undefined;
      }
      send({ done: true, ...(usagePayload ? { usage: usagePayload } : {}) });
    } catch (error) {
      send({ error: true, message: error.message || 'No se pudo conectar con el tutor IA.' });
    } finally {
      res.end();
    }
  });

  // Converts an AI Tutor reply to speech - Cerebras/Groq/Gemini only ever
  // generate the text (see /api/ai/tutor above); this is a separate step,
  // never called directly from the browser against a TTS provider. Requires
  // a signed-in session because the monthly voice quota (free tier:
  // 10/calendar month, see lib/usageLimitService.js) can only be enforced
  // against a real account - guests keep full text access, just no voice
  // button. Available to free and Premium alike (plan never gates the
  // button itself, only how many neural replies a free account gets per
  // month) - matches lib/voiceAccessService.js's superseded daily/per-turn
  // limit in spirit, just on a monthly period shared with the Tutor's own
  // query cap.
  app.post('/api/speech/synthesize', requireAuth, async (req, res) => {
    try {
      const { text, language, locale, speed } = req.body || {};

      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Falta el texto a convertir en voz.' });
      }
      if (text.length > MAX_SPEECH_TEXT_LENGTH) {
        return res.status(400).json({ error: 'El texto es demasiado largo para convertir en voz.' });
      }
      if (!SUPPORTED_SPEECH_LOCALES.has(locale)) {
        return res.status(400).json({ error: 'Locale de voz no soportado.' });
      }

      // Never log the full reply text - matches how aiTutorService.js
      // already avoids logging student content, just length + a short preview.
      console.log(
        `[speech] user=${req.user.id} locale=${locale} chars=${text.length} preview="${text.slice(0, 40)}${text.length > 40 ? '…' : ''}"`
      );

      const voiceUsage = await usageLimitService.checkUsage({
        userId: req.user.id,
        feature: 'tutor_voice',
        monthlyLimit: FREE_TUTOR_VOICE_MONTHLY_LIMIT
      });
      if (!voiceUsage.allowed) {
        return res.status(403).json({
          ok: false,
          limited: true,
          code: 'USAGE_LIMIT_REACHED',
          used: voiceUsage.used,
          limit: FREE_TUTOR_VOICE_MONTHLY_LIMIT,
          message: `Has utilizado tus ${FREE_TUTOR_VOICE_MONTHLY_LIMIT} respuestas de voz gratuitas de este mes. Continúa por texto o desbloquea ANDERGO Premium.`
        });
      }
      const remaining = voiceUsage.remaining != null ? Math.max(0, voiceUsage.remaining - 1) : null;

      const speech = await ttsService.generateTutorSpeech({ text, language, speed });
      if (!speech) {
        // Neural provider unconfigured or failed - fall back to browser
        // speech synthesis, and don't spend a unit of the quota for it
        // (nothing neural/billable actually happened).
        return res.json({ ok: true, mode: 'browser', remaining: voiceUsage.remaining });
      }

      // Only consumed now that ElevenLabs/OpenAI has actually returned
      // real audio - never on a config/provider failure (handled above)
      // or a request-validation error (handled earlier in this route).
      await usageLimitService.recordUsage({ userId: req.user.id, feature: 'tutor_voice' }).catch(() => {});

      res.json({
        ok: true,
        mode: 'neural',
        audioBase64: speech.buffer.toString('base64'),
        mimeType: speech.mimeType,
        remaining
      });
    } catch (error) {
      if (error.code === 'VOICE_LIMIT_REACHED' || error.code === 'USAGE_LIMIT_REACHED') {
        return res.status(403).json({ ok: false, limited: true, message: error.message });
      }
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo generar la voz del tutor.' });
    }
  });

  // Free/guest cap matches the frontend textarea's own maxlength (see
  // index.html #translatorInput) - Premium gets a higher ceiling, still well
  // under DeepL's own per-request limits. Neither is the DeepL *plan* quota
  // (character budget per billing period), which DeepL enforces on its side
  // and this route surfaces via the 456 status handled in translatorService.
  const FREE_MAX_TRANSLATE_TEXT_LENGTH = 1000;
  const PREMIUM_MAX_TRANSLATE_TEXT_LENGTH = 5000;
  // Central language list (src/js/translator-languages.js) - only the
  // DeepL-supported ones are ever accepted here; languages not yet backed
  // by DeepL (Haitian Creole, Hawaiian) are excluded automatically.
  const TRANSLATABLE_LANGUAGES = new Set(
    translatorLanguages.getSelectableLanguages().map((lang) => lang.key)
  );

  const translatorLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      message: 'Demasiadas traducciones seguidas. Espera un momento e inténtalo de nuevo.'
    }
  });

  // Public (no requireAuth) - the Traductor tab works for guests and signed-in
  // students alike. attachUserIfPresent only reads req.user when a valid
  // session token is sent; it never blocks a guest request. Never calls
  // DeepL from the browser: the frontend only ever hits this route (see
  // translator-* handlers in src/js/script.js). Renamed from the earlier
  // /api/translator (Azure-backed) - DeepL is now the sole provider.
  app.post('/api/translate', translatorLimiter, attachUserIfPresent, async (req, res) => {
    const { text, sourceLanguage, targetLanguage, targetVariant } = req.body || {};

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ ok: false, message: 'Escribe un texto para traducir.' });
    }
    if (!TRANSLATABLE_LANGUAGES.has(targetLanguage)) {
      return res.status(400).json({ ok: false, message: 'Idioma de destino no soportado.' });
    }
    if (sourceLanguage && sourceLanguage !== 'auto' && !TRANSLATABLE_LANGUAGES.has(sourceLanguage)) {
      return res.status(400).json({ ok: false, message: 'Idioma de origen no soportado.' });
    }
    // Only a real, resolved source language can equal the target - 'auto'
    // is never rejected here, since the actual detected language isn't
    // known until DeepL responds (and may legitimately equal the target,
    // e.g. proofreading text that's already in that language).
    if (sourceLanguage && sourceLanguage !== 'auto' && sourceLanguage === targetLanguage) {
      return res.status(400).json({ ok: false, message: 'Selecciona dos idiomas diferentes.' });
    }

    const entitlements = await getUserEntitlements(req.user?.id);
    const maxLength = entitlements.isPremium
      ? PREMIUM_MAX_TRANSLATE_TEXT_LENGTH
      : FREE_MAX_TRANSLATE_TEXT_LENGTH;
    if (text.length > maxLength) {
      return res.status(400).json({
        ok: false,
        message: entitlements.isPremium
          ? 'El texto es demasiado largo para traducir.'
          : `El texto supera el límite gratuito de ${FREE_MAX_TRANSLATE_TEXT_LENGTH} caracteres. Desbloquea ANDERGO Premium para traducir textos más largos.`
      });
    }

    if (!translatorService.isTranslatorConfigured()) {
      return res.json({
        ok: false,
        configured: false,
        message: 'El traductor está temporalmente en configuración.'
      });
    }

    try {
      const result = await translatorService.translateText({
        text,
        sourceLanguage,
        targetLanguage,
        targetVariant
      });
      res.json({ ok: true, configured: true, ...result });
    } catch (error) {
      // Never log `text` - only the error code/message, matching the
      // "no registrar el texto completo" requirement.
      console.warn('[translate] request failed', error.code || error.message);
      const status = error.code === 'TRANSLATOR_TIMEOUT' ? 504 : 502;
      res.status(status).json({
        ok: false,
        configured: true,
        message: error.message || 'No se pudo traducir el texto en este momento. Inténtalo de nuevo.'
      });
    }
  });

  // Corrector (Fase 3) - a distinct mode from /api/translate above, never
  // combined into the same call ("no mezclar traducción y corrección en una
  // sola llamada sin control"): this never touches DeepL, and /api/translate
  // never touches the AI Tutor cascade. English/Spanish/French only for now
  // (spec item: "detectar o seleccionar English, Spanish o French").
  const CORRECTABLE_LANGUAGES = new Set(['english', 'spanish', 'french']);
  const MAX_CORRECTION_TEXT_LENGTH = 1000;

  const correctorLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      message: 'Demasiadas correcciones seguidas. Espera un momento e inténtalo de nuevo.'
    }
  });

  // Public (no requireAuth), same posture as /api/translate - the Corrector
  // is part of the Traductor's public UI for guests and signed-in students
  // alike. Unmetered by usageLimitService, same as getSpeakingCorrection's
  // existing precedent (task === 'speaking_correction' on /api/ai/tutor).
  app.post('/api/correct-text', correctorLimiter, attachUserIfPresent, async (req, res) => {
    const { text, language } = req.body || {};

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ ok: false, message: 'Escribe un texto para corregir.' });
    }
    if (!CORRECTABLE_LANGUAGES.has(language)) {
      return res.status(400).json({ ok: false, message: 'Idioma no soportado para corrección.' });
    }
    if (text.length > MAX_CORRECTION_TEXT_LENGTH) {
      return res.status(400).json({
        ok: false,
        message: `El texto supera el límite de ${MAX_CORRECTION_TEXT_LENGTH} caracteres.`
      });
    }

    const configError = tutorConfigError();
    if (configError) {
      return res.json({
        ok: false,
        configured: false,
        message: 'El corrector está temporalmente en configuración.'
      });
    }

    try {
      const result = await getTextCorrection({ text, language });
      res.json({ ok: true, configured: true, ...result });
    } catch (error) {
      // Never log `text` - only the error code/message, matching
      // /api/translate's own "no registrar el texto completo" rule.
      console.warn('[correct-text] request failed', error.code || error.message);
      const status = error.status && error.status >= 400 ? error.status : 502;
      res.status(status).json({
        ok: false,
        configured: true,
        message: error.message || 'No se pudo corregir el texto en este momento. Inténtalo de nuevo.'
      });
    }
  });

  // Separate from the general /api limiter and only counts login attempts
  // (register/logout on this same route are unaffected) - brute-forcing a
  // password is exactly what this needs to slow down, whether the attempt
  // used an email or a username identifier.
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => (req.body || {}).action !== 'login',
    message: {
      error: 'TOO_MANY_ATTEMPTS',
      message: 'Has realizado varios intentos. Espera un momento y vuelve a intentarlo.'
    }
  });

  // register also triggers a real Supabase signUp() (and its confirmation
  // email send) - same rationale as resendOtpLimiter/resendConfirmationLimiter
  // below, just scoped to action==='register' the same way loginLimiter is
  // scoped to action==='login', so repeated signup attempts can't be used to
  // spam a target inbox with OTP codes.
  const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => (req.body || {}).action !== 'register',
    message: {
      error: 'TOO_MANY_ATTEMPTS',
      message: 'Has realizado varios intentos. Espera un momento y vuelve a intentarlo.'
    }
  });

  app.post('/api/auth', loginLimiter, registerLimiter, async (req, res) => {
    const { action, email, password, name, username, identifier } = req.body || {};
    try {
      if (action === 'register') {
        const result = await authService.register({ email, password, name, username });
        return res.status(201).json(result);
      }
      if (action === 'logout') {
        const result = await authService.logout();
        return res.json(result);
      }
      // Default / 'login' - identifier is the new field (username or email);
      // email is kept working as a back-compat alias (see authService.login).
      const result = await authService.login({ identifier, email, password });
      return res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      // `email` is only ever set on the EMAIL_NOT_CONFIRMED error (see
      // authService.login) - undefined for every other error and dropped by
      // JSON.stringify, so no other failure path gains a new field here.
      return res
        .status(status)
        .json({ error: error.message || 'Request failed.', code: error.code, email: error.email });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    const result = await authService.logout();
    res.json(result);
  });

  // Exchanges a stored refresh_token for a new access/refresh pair - the
  // frontend calls this once when any authenticated request comes back 401
  // with a still-present local session (see authFetch()/refreshAuthSession()
  // in script.js), instead of forcing a full re-login every time a Supabase
  // access token's ~1h lifetime runs out mid-session.
  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body || {};
      const result = await authService.refreshSession(refreshToken);
      res.json({ ok: true, ...result });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ ok: false, error: error.message || 'No se pudo renovar la sesión.' });
    }
  });

  // Stricter than the general /api limiter: this endpoint triggers a real
  // Supabase email send (itself rate-limited) and could otherwise be used to
  // spam a target inbox or probe which emails have pending accounts.
  const resendConfirmationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Si existe una cuenta pendiente para ese correo, enviaremos un nuevo enlace.'
    }
  });

  app.post('/api/auth/resend-confirmation', resendConfirmationLimiter, async (req, res) => {
    const { email } = req.body || {};
    const result = await authService.resendConfirmation(email);
    res.json(result);
  });

  // Same limits/rationale as resendConfirmationLimiter - kept as a
  // separate instance so resending an OTP and the legacy resend-confirmation
  // route don't share one counter.
  const resendOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: true,
      message: 'Si el correo corresponde a una cuenta pendiente, recibirás un nuevo código.'
    }
  });

  app.post('/api/auth/resend-otp', resendOtpLimiter, async (req, res) => {
    const { email } = req.body || {};
    const result = await authService.resendConfirmation(email);
    res.json(result);
  });

  // Only counts failed/successful verification attempts, not resends
  // (those have their own limiter above) - this is the endpoint an
  // attacker would hammer to brute-force a 6-digit code (1M combinations,
  // so a generous-looking limit like 10/15min is still a meaningful
  // slow-down layered on top of Supabase's own otp_expired enforcement).
  const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      error: 'TOO_MANY_ATTEMPTS',
      message: 'Has realizado varios intentos. Espera un momento.'
    }
  });

  app.post('/api/auth/verify-otp', verifyOtpLimiter, async (req, res) => {
    try {
      const { email, token, purpose } = req.body || {};
      const result = await authService.verifyOtp({ email, token, purpose });
      res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({
        ok: false,
        error: error.code || 'OTP_VERIFY_FAILED',
        message: error.message || 'No se pudo verificar el código.'
      });
    }
  });

  // Reuses resendConfirmationLimiter's rationale/limits: also triggers a
  // real Supabase email send, so the same abuse concerns apply. `error`
  // (not `ok`) carries the machine code - same shape as loginLimiter/
  // registerLimiter above - so the frontend's postJson can tell "rate
  // limited" apart from a genuine send/network failure (see
  // forgotPasswordForm's submit handler in script.js) instead of both
  // collapsing into the same generic error state.
  const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'RATE_LIMITED',
      message: 'Espera un momento antes de solicitar otro correo.'
    }
  });

  app.post('/api/auth/request-password-reset', passwordResetLimiter, async (req, res) => {
    const { email } = req.body || {};
    const result = await authService.requestPasswordReset(email);
    res.json(result);
  });

  // Single exact-match lookup, never a partial/listing search - see
  // profilesService.isUsernameAvailable. Rate-limited the same as login:
  // this is also the endpoint an attacker would hammer to enumerate
  // registered usernames one guess at a time.
  const usernameAvailableLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      error: 'TOO_MANY_ATTEMPTS',
      message: 'Has realizado varios intentos. Espera un momento y vuelve a intentarlo.'
    }
  });

  app.get('/api/auth/username-available', usernameAvailableLimiter, async (req, res) => {
    const raw = String(req.query.u || '');
    const formatCheck = profilesService.validateUsernameFormat(raw);
    if (!formatCheck.valid) {
      return res
        .status(400)
        .json({ ok: false, error: 'INVALID_USERNAME', message: formatCheck.message });
    }

    const normalizedUsername = profilesService.normalizeUsername(raw);
    try {
      const available = await profilesService.isUsernameAvailable(normalizedUsername);
      return res.json({ ok: true, available, normalizedUsername });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: 'USERNAME_CHECK_FAILED',
        message: 'No se pudo comprobar la disponibilidad del nombre de usuario.'
      });
    }
  });

  // Public, safe-to-expose values (Supabase's anon key is designed for
  // browser use, distinct from and far less privileged than the service
  // role key, which never leaves this server). Requesting the reset email
  // (POST /api/auth/request-password-reset below) stays backend-mediated
  // like everything else in this app; only the /reset-password page itself
  // uses these to load supabase-js directly, because the recovery token
  // Supabase appends to the redirect URL arrives as a fragment/query the
  // browser reads client-side - our backend never sees it.
  app.get('/api/auth/client-config', (_req, res) => {
    res.json({
      ok: true,
      supabaseUrl: config.supabaseUrl || null,
      supabaseAnonKey: config.supabaseAnonKey || null
    });
  });

  // TOTP MFA ("Seguridad de la cuenta" -> "Verificación en dos pasos").
  // Every route here forwards the caller's own access token to
  // mfaService (never the service-role client) so Supabase enforces these
  // as "acting as this specific user" calls, same as the rest of Supabase's
  // MFA API expects. No phone/SMS/WhatsApp factor routes exist yet - see
  // PHONE_AUTH_ENABLED in lib/config.js.
  function mfaErrorResponse(res, error) {
    const status = error.status && error.status >= 400 ? error.status : 500;
    res.status(status).json({
      ok: false,
      error: error.code || 'MFA_ERROR',
      message: error.message || 'No se pudo completar la operación de seguridad.'
    });
  }

  app.post('/api/mfa/totp/enroll', requireAuth, async (req, res) => {
    try {
      const result = await mfaService.enrollTotp(getBearerToken(req));
      res.json({ ok: true, ...result });
    } catch (error) {
      mfaErrorResponse(res, error);
    }
  });

  app.post('/api/mfa/totp/challenge', requireAuth, async (req, res) => {
    try {
      const { factorId } = req.body || {};
      const result = await mfaService.challengeFactor(getBearerToken(req), factorId);
      res.json({ ok: true, ...result });
    } catch (error) {
      mfaErrorResponse(res, error);
    }
  });

  app.post('/api/mfa/totp/verify', requireAuth, async (req, res) => {
    try {
      const { factorId, challengeId, code } = req.body || {};
      const result = await mfaService.verifyFactor(getBearerToken(req), {
        factorId,
        challengeId,
        code
      });
      res.json(result);
    } catch (error) {
      mfaErrorResponse(res, error);
    }
  });

  app.get('/api/mfa/factors', requireAuth, async (req, res) => {
    try {
      const result = await mfaService.listFactors(getBearerToken(req));
      res.json({ ok: true, ...result });
    } catch (error) {
      mfaErrorResponse(res, error);
    }
  });

  app.post('/api/mfa/totp/unenroll', requireAuth, async (req, res) => {
    try {
      const { factorId } = req.body || {};
      const result = await mfaService.unenrollFactor(getBearerToken(req), factorId);
      res.json(result);
    } catch (error) {
      mfaErrorResponse(res, error);
    }
  });

  // Used by the frontend right after password login and again on reload -
  // "no mostrar la aplicación hasta completar aal2" for accounts with a
  // verified factor.
  app.get('/api/mfa/assurance-level', requireAuth, async (req, res) => {
    try {
      const result = await mfaService.getAssuranceLevel(getBearerToken(req));
      res.json({ ok: true, ...result });
    } catch (error) {
      mfaErrorResponse(res, error);
    }
  });

  app.get('/api/lessons', attachUserIfPresent, async (req, res) => {
    try {
      const level = String(req.query.level || 'A1').toUpperCase();
      const language = String(req.query.language || 'english').toLowerCase();

      // English A1 lives in the normalized courses schema; every other
      // language/level still reads from the legacy content_json table.
      const normalizedLessons = await courseLessonsService.getLessons({
        languageCode: language,
        levelCode: level,
        userId: req.user?.id
      });
      if (normalizedLessons) {
        res.json({ lessons: normalizedLessons, source: 'courses' });
        return;
      }

      const lessons = await lessonsService.getLessons({ level, language, userId: req.user?.id });
      res.json({ lessons, source: 'legacy' });
    } catch (error) {
      res.status(500).json({ error: 'No se pudieron cargar las lecciones.' });
    }
  });

  app.get('/api/lessons/:slug', attachUserIfPresent, async (req, res) => {
    try {
      const lesson = await courseLessonsService.getLessonDetail({
        slug: req.params.slug,
        userId: req.user?.id
      });
      if (!lesson) {
        res.status(404).json({ error: 'Lesson not found.' });
        return;
      }
      res.json({ lesson });
    } catch (error) {
      res.status(500).json({ error: 'No se pudo cargar la lección.' });
    }
  });

  app.post('/api/lessons/:slug/start', requireAuth, async (req, res) => {
    try {
      const slug = req.params.slug;
      if (!(await courseLessonsService.hasLesson(slug))) {
        res.status(404).json({ error: 'Lesson not found.' });
        return;
      }
      const result = await courseLessonsService.startLesson({ userId: req.user.id, slug });
      res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo iniciar la lección.' });
    }
  });

  app.post('/api/lessons/:slug/complete', requireAuth, async (req, res) => {
    try {
      const { answers } = req.body || {};
      const safeAnswers = Array.isArray(answers) ? answers : [];
      const slug = req.params.slug;

      if (await courseLessonsService.hasLesson(slug)) {
        const result = await courseLessonsService.completeLesson({
          userId: req.user.id,
          slug,
          answers: safeAnswers
        });
        res.json(result);
        return;
      }

      const result = await lessonsService.completeLesson({
        userId: req.user.id,
        slug,
        answers: safeAnswers
      });
      res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo completar la lección.' });
    }
  });

  // "Historial de intentos" for a scored Grammar test (spec §4) - read-only,
  // scoped to the signed-in user's own attempts on this one lesson. Never
  // exposes another user's data (courseLessonsService.getGrammarTestHistory
  // always filters by req.user.id).
  app.get('/api/lessons/:slug/grammar-test-history', requireAuth, async (req, res) => {
    try {
      const history = await courseLessonsService.getGrammarTestHistory({
        userId: req.user.id,
        slug: req.params.slug
      });
      res.json({ history });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo cargar el historial de intentos.' });
    }
  });

  app.post('/api/lessons/:slug/check-answer', attachUserIfPresent, async (req, res) => {
    try {
      const slug = req.params.slug;

      if (await courseLessonsService.hasLesson(slug)) {
        const { exerciseId, selectedOptionId } = req.body || {};
        const result = await courseLessonsService.checkAnswer({
          userId: req.user?.id,
          slug,
          exerciseId,
          selectedOptionId
        });
        res.json({
          success: true,
          feedback: result.correct ? '¡Correcto!' : 'Respuesta incorrecta, intenta de nuevo.',
          ...result
        });
        return;
      }

      const { index, selectedOption } = req.body || {};
      const result = await lessonsService.checkAnswer({ slug, index, selectedOption });
      res.json({
        success: true,
        feedback: result.correct ? '¡Correcto!' : 'Respuesta incorrecta, intenta de nuevo.',
        ...result
      });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res
        .status(status)
        .json({ success: false, error: error.message || 'No se pudo verificar la respuesta.' });
    }
  });

  // Dictation is only implemented for the normalized-schema courses (see
  // lesson_dictation_segments, 202607220001_rich_listening_content.sql) -
  // there is no legacy-content_json equivalent, so this always goes through
  // courseLessonsService. The expected transcript is read server-side only;
  // the client submits its attempt and gets back a scored diff, never the
  // answer key itself.
  app.post('/api/lessons/:slug/dictation/check', attachUserIfPresent, async (req, res) => {
    try {
      const slug = req.params.slug;
      const { attempts, attemptNumber } = req.body || {};
      const result = await courseLessonsService.checkDictation({
        slug,
        attempts: Array.isArray(attempts) ? attempts : [],
        attemptNumber: Number(attemptNumber) || 1
      });
      res.json({ success: true, ...result });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res
        .status(status)
        .json({ success: false, error: error.message || 'No se pudo verificar el dictado.' });
    }
  });

  // Listening's only audio source is public.lesson_audio (see
  // lib/listeningService.js) - no AI-generated/TTS fallback status is ever
  // returned here anymore. Only two states reach the frontend: 'official'
  // (a published row exists) or 'unavailable' (it doesn't yet).
  app.get('/api/listening/audio', attachUserIfPresent, async (req, res) => {
    try {
      const language = String(req.query.language || '').toLowerCase();
      const level = String(req.query.level || '').toUpperCase();
      const lessonSlug = String(req.query.lessonSlug || '');

      const official = await listeningService.getOfficialAudio(language, level, lessonSlug);
      if (official) {
        res.json({
          status: 'official',
          audio: {
            audioUrl: official.main_file_path,
            slowAudioUrl: official.slow_file_path || null,
            // very_slow_file_path: supabase/migrations/202607220001_rich_listening_content.sql.
            // Null on any lesson_audio row that predates that migration -
            // the player falls back to a client-side playbackRate
            // reduction, same as it already does today when slowAudioUrl
            // itself is absent.
            verySlowAudioUrl: official.very_slow_file_path || null,
            transcript: official.transcript || '',
            duration: official.duration || null,
            title: official.title || ''
          }
        });
        return;
      }

      res.json({ status: 'unavailable' });
    } catch (error) {
      res
        .status(500)
        .json({ status: 'unavailable', error: 'No se pudo consultar el audio de Listening.' });
    }
  });

  // Speaking submissions are processed and discarded in the same request -
  // nothing here writes to disk or to Supabase Storage (see speakingService.js).
  const speakingAnalyzeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      error: 'RATE_LIMITED',
      message: 'Se alcanzó el límite de envíos de Speaking. Intenta de nuevo en unos minutos.'
    }
  });

  function runSpeakingUpload(req, res) {
    return new Promise((resolve, reject) => {
      speakingUpload.single('audio')(req, res, (error) => (error ? reject(error) : resolve()));
    });
  }

  app.post('/api/speaking/analyze', speakingAnalyzeLimiter, async (req, res) => {
    try {
      await runSpeakingUpload(req, res);
      const { language, level, lessonId, expectedPrompt, durationSeconds } = req.body || {};
      const result = await speakingService.analyzeSpeakingSubmission({
        file: req.file,
        language,
        level,
        lessonId,
        expectedPrompt,
        durationSeconds
      });
      res.json(result);
    } catch (error) {
      if (error instanceof multer.MulterError) {
        const tooLarge = error.code === 'LIMIT_FILE_SIZE';
        res.status(tooLarge ? 413 : 400).json({
          ok: false,
          error: error.code,
          message: tooLarge
            ? 'El archivo de audio es demasiado grande.'
            : 'No se pudo procesar el archivo de audio.'
        });
        return;
      }
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({
        ok: false,
        error: error.code || 'SPEAKING_ANALYZE_FAILED',
        message: error.message || 'No se pudo procesar el audio.'
      });
    }
  });

  app.get('/api/progress', requireAuth, async (req, res) => {
    try {
      const progress = await lessonsService.getProgress(req.user.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: 'No se pudo cargar el progreso.' });
    }
  });

  app.get('/api/preferences', requireAuth, async (req, res) => {
    try {
      const preferences = await preferencesService.getPreferences(req.user.id);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ error: 'No se pudieron cargar las preferencias.' });
    }
  });

  app.put('/api/preferences', requireAuth, async (req, res) => {
    try {
      const { language, level, bridgeLanguage } = req.body || {};
      const preferences = await preferencesService.updatePreferences(req.user.id, {
        language,
        level,
        bridgeLanguage
      });
      res.json(preferences);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res
        .status(status)
        .json({ error: error.message || 'No se pudieron guardar las preferencias.' });
    }
  });

  // "Create your username" onboarding for accounts that predate this
  // migration (profiles.username still null) - same validation/availability
  // path as registration, just applied to an already-signed-in account.
  app.post('/api/profile/username', requireAuth, async (req, res) => {
    try {
      const { username } = req.body || {};
      const result = await profilesService.claimUsername(req.user.id, username);
      res.json({ ok: true, username: result.username });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({
        ok: false,
        error: error.code || 'USERNAME_CLAIM_FAILED',
        message: error.message || 'No se pudo guardar el nombre de usuario.'
      });
    }
  });

  app.get('/api/goals', requireAuth, async (req, res) => {
    try {
      const goal = await goalsService.getGoal(req.user.id);
      res.json({ goal });
    } catch (error) {
      res.status(500).json({ error: 'No se pudo cargar el objetivo.' });
    }
  });

  app.post('/api/goals', requireAuth, async (req, res) => {
    try {
      const { goalKey } = req.body || {};
      const goal = await goalsService.upsertGoal(req.user.id, goalKey);
      res.status(201).json({ goal });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo guardar el objetivo.' });
    }
  });

  app.put('/api/goals/:id', requireAuth, async (req, res) => {
    try {
      const { goalKey } = req.body || {};
      const goal = await goalsService.updateGoal(req.user.id, req.params.id, goalKey);
      res.json({ goal });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo actualizar el objetivo.' });
    }
  });

  app.delete('/api/goals/:id', requireAuth, async (req, res) => {
    try {
      const result = await goalsService.deleteGoal(req.user.id, req.params.id);
      res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo eliminar el objetivo.' });
    }
  });

  app.post('/api/goals/:id/complete', requireAuth, async (req, res) => {
    try {
      const goal = await goalsService.completeGoal(req.user.id, req.params.id);
      res.json({ goal });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo completar el objetivo.' });
    }
  });

  app.get('/api/dashboard', requireAuth, async (req, res) => {
    try {
      const dashboard = await dashboardService.getDashboard(req.user.id);
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ error: 'No se pudo cargar tu panel.' });
    }
  });

  // Public plan catalog (Free/Premium today, more later) - drives the home
  // Premium card, the pricing section, and the paywall modal. No auth
  // required; prices/limits/features all come from lib/plansConfig.js via
  // lib/planService.js, never hardcoded in the response or in a caller.
  app.get('/api/plans', async (_req, res) => {
    try {
      const plans = await planService.getActivePlans();
      res.json({ plans });
    } catch (error) {
      res.status(500).json({ error: 'No se pudieron cargar los planes.' });
    }
  });

  // The signed-in user's current plan, status, renewal/expiry, and this
  // month's Tutor/voice usage - for a "Mi plan" screen and for the paywall
  // modal to show real remaining counts without waiting for a 403.
  app.get('/api/subscription', requireAuth, async (req, res) => {
    try {
      const subscription = await subscriptionService.getSubscriptionSummary(req.user.id);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: 'No se pudo cargar tu suscripción.' });
    }
  });

  // Fallback for unknown API routes.
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found.' });
  });

  return app;
}

if (require.main === module) {
  const app = createServer();
  app.listen(config.port, () => {
    console.log(
      `ANDERGO backend listening on port ${config.port} (Supabase ${config.isSupabaseConfigured ? 'configured' : 'NOT configured - using dev fallback'})`
    );
  });
}

module.exports = { createServer, createApp: createServer };
