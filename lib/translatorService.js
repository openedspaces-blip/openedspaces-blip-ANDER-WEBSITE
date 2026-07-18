// lib/translatorService.js
// Text translation for the public Traductor feature. Backed exclusively by
// DeepL - never Cerebras/Groq/Gemini (AI Tutor providers), Vercel AI
// Gateway, or ElevenLabs (TTS). Never called directly from the browser: the
// frontend only ever hits POST /api/translate (see lib/server.js), matching
// the same "no keys leave the server" rule as lib/ttsService.js. Reads
// DEEPL_API_KEY / DEEPL_API_BASE_URL; when the key is missing this reports
// isTranslatorConfigured() === false so the route can return a clear
// "temporarily unavailable" response instead of throwing or fabricating a
// translation.
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
// DeepL API Free accounts must use api-free.deepl.com; paid API plans use
// api.deepl.com - DEEPL_API_BASE_URL lets a paid deployment point at the
// right host without any code change. Defaults to the Free endpoint.
const DEEPL_API_BASE_URL = (process.env.DEEPL_API_BASE_URL || 'https://api-free.deepl.com').replace(
  /\/+$/,
  ''
);

const REQUEST_TIMEOUT_MS = 10_000;

// DeepL source_lang never carries a regional variant (just "EN", not
// "EN-US") - only target_lang does, and only for the handful of languages
// DeepL splits by region (English, Portuguese). ANDERGO only exposes
// English/French/Spanish as bridge/target languages in the UI today; German
// and Italian are mapped here too since their content worlds already exist
// (src/worlds/german, src/worlds/italian) without requiring another change
// in this file if they're re-enabled later.
const LANGUAGE_TO_DEEPL_CODE = {
  english: 'EN',
  spanish: 'ES',
  french: 'FR',
  german: 'DE',
  italian: 'IT'
};

function isTranslatorConfigured() {
  return Boolean(DEEPL_API_KEY);
}

function resolveDeeplSourceCode(language) {
  return LANGUAGE_TO_DEEPL_CODE[language] || null;
}

// targetVariant is optional and only meaningful when targetLanguage is
// 'english' - 'GB' selects EN-GB, anything else (including omitted) defaults
// to EN-US, matching DeepL's own current default recommendation for English
// targets. Every other language is unaffected by targetVariant.
function resolveDeeplTargetCode(language, targetVariant) {
  const base = LANGUAGE_TO_DEEPL_CODE[language];
  if (!base) return null;
  if (base === 'EN') return targetVariant === 'GB' ? 'EN-GB' : 'EN-US';
  return base;
}

// { text, sourceLanguage (or 'auto'), targetLanguage, targetVariant? } ->
// { translatedText, detectedLanguage }
async function translateText({ text, sourceLanguage, targetLanguage, targetVariant }) {
  if (!isTranslatorConfigured()) {
    const error = new Error('El traductor está temporalmente en configuración.');
    error.code = 'TRANSLATOR_NOT_CONFIGURED';
    throw error;
  }

  const targetCode = resolveDeeplTargetCode(targetLanguage, targetVariant);
  if (!targetCode) {
    const error = new Error('Idioma de destino no soportado.');
    error.code = 'UNSUPPORTED_LANGUAGE';
    throw error;
  }

  const sourceCode =
    sourceLanguage && sourceLanguage !== 'auto' ? resolveDeeplSourceCode(sourceLanguage) : null;
  if (sourceLanguage && sourceLanguage !== 'auto' && !sourceCode) {
    const error = new Error('Idioma de origen no soportado.');
    error.code = 'UNSUPPORTED_LANGUAGE';
    throw error;
  }

  const body = {
    // DeepL's /v2/translate takes an array of strings - a single-element
    // array preserves paragraph breaks inside that one string as-is (DeepL
    // treats \n as a paragraph boundary and keeps it), so no manual
    // paragraph splitting/rejoining is needed here.
    text: [text],
    target_lang: targetCode
  };
  if (sourceCode) body.source_lang = sourceCode;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${DEEPL_API_BASE_URL}/v2/translate`, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } catch (err) {
    const error = new Error(
      err.name === 'AbortError'
        ? 'El traductor tardó demasiado en responder.'
        : 'No se pudo traducir el texto en este momento.'
    );
    error.code = err.name === 'AbortError' ? 'TRANSLATOR_TIMEOUT' : 'TRANSLATOR_REQUEST_FAILED';
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // DeepL's documented error codes worth distinguishing; everything else
    // collapses to a generic failure. Never include the response body here
    // (see server.js's log line) - it could echo back request text.
    const error = new Error(
      response.status === 456
        ? 'Se alcanzó el límite de traducción del plan actual.'
        : 'No se pudo traducir el texto en este momento.'
    );
    error.code = 'TRANSLATOR_REQUEST_FAILED';
    error.status = response.status;
    throw error;
  }

  const data = await response.json().catch(() => null);
  const translation = data?.translations?.[0];
  if (!translation) {
    const error = new Error('No se pudo traducir el texto en este momento.');
    error.code = 'TRANSLATOR_EMPTY_RESPONSE';
    throw error;
  }

  return {
    translatedText: translation.text,
    // DeepL returns detected_source_language as an uppercase base code
    // (e.g. "FR") regardless of source_lang - map it back to ANDERGO's
    // lowercase language keys for the frontend when possible, otherwise
    // pass the raw code through rather than dropping the information.
    detectedLanguage:
      Object.keys(LANGUAGE_TO_DEEPL_CODE).find(
        (key) => LANGUAGE_TO_DEEPL_CODE[key] === translation.detected_source_language
      ) ||
      translation.detected_source_language ||
      null
  };
}

module.exports = { isTranslatorConfigured, translateText };
