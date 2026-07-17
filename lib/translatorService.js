// lib/translatorService.js
// Text translation for the public Traductor feature (English/French/Spanish
// only). Backed by Azure Translator, called only from here - the frontend
// only ever talks to POST /api/translator (see lib/server.js), never to
// Azure directly, matching the same "no keys leave the server" rule as
// lib/ttsService.js. Reads AZURE_TRANSLATOR_KEY/_REGION; when either is
// missing this reports isTranslatorConfigured() === false so the route can
// return a clear "temporarily unavailable" response instead of throwing or
// fabricating a translation.
const AZURE_TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY;
const AZURE_TRANSLATOR_REGION = process.env.AZURE_TRANSLATOR_REGION;
const AZURE_TRANSLATOR_ENDPOINT =
  process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';

// Only the three languages ANDERGO currently teaches - matches the
// English/French/Spanish-only constraint already applied to the rest of the
// public frontend (home language cards, learning-path selects).
const LANGUAGE_TO_AZURE_CODE = {
  english: 'en',
  french: 'fr',
  spanish: 'es'
};

function isTranslatorConfigured() {
  return Boolean(AZURE_TRANSLATOR_KEY && AZURE_TRANSLATOR_REGION);
}

function resolveAzureCode(language) {
  return LANGUAGE_TO_AZURE_CODE[language] || null;
}

// { text, sourceLanguage (or 'auto'), targetLanguage } -> { translatedText, detectedLanguage }
async function translateText({ text, sourceLanguage, targetLanguage }) {
  if (!isTranslatorConfigured()) {
    const error = new Error('El traductor está temporalmente en configuración.');
    error.code = 'TRANSLATOR_NOT_CONFIGURED';
    throw error;
  }

  const toCode = resolveAzureCode(targetLanguage);
  if (!toCode) {
    const error = new Error('Idioma de destino no soportado.');
    error.code = 'UNSUPPORTED_LANGUAGE';
    throw error;
  }

  const params = new URLSearchParams({ 'api-version': '3.0', to: toCode });
  const fromCode = sourceLanguage && sourceLanguage !== 'auto' ? resolveAzureCode(sourceLanguage) : null;
  if (fromCode) params.set('from', fromCode);

  const response = await fetch(`${AZURE_TRANSLATOR_ENDPOINT}/translate?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_TRANSLATOR_KEY,
      'Ocp-Apim-Subscription-Region': AZURE_TRANSLATOR_REGION,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{ Text: text }])
  });

  if (!response.ok) {
    const error = new Error('No se pudo traducir el texto en este momento.');
    error.code = 'TRANSLATOR_REQUEST_FAILED';
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const translation = data?.[0]?.translations?.[0];
  if (!translation) {
    const error = new Error('No se pudo traducir el texto en este momento.');
    error.code = 'TRANSLATOR_EMPTY_RESPONSE';
    throw error;
  }

  return {
    translatedText: translation.text,
    detectedLanguage: data[0]?.detectedLanguage?.language || fromCode || null
  };
}

module.exports = { isTranslatorConfigured, translateText };
