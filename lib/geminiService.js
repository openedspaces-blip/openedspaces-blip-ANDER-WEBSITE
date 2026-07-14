// lib/geminiService.js
// Centralizes all direct calls to the Google Gemini API via its REST
// endpoint (no extra SDK dependency - Node's built-in fetch is enough).
// process.env.GEMINI_API_KEY is read only here, server-side - never sent to
// or read from the frontend. Free tier: https://aistudio.google.com/apikey
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Overall budget for the whole operation (including retries) - kept under
// the 60s Vercel function maxDuration (see vercel.json) so the backend can
// always answer with a JSON error instead of Vercel hard-killing the function.
const OVERALL_TIMEOUT_MS = 50000;
const MAX_RETRIES = 2;
const RETRYABLE_STATUS = new Set([429, 503]);
const BASE_BACKOFF_MS = 300;

function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY && String(process.env.GEMINI_API_KEY).trim());
}

// Mirrors openaiService's `input` shape: either a plain string (no history)
// or an array of { role: 'user' | 'assistant', content } turns. Gemini uses
// 'model' instead of 'assistant' for the assistant role.
function toContents(input) {
  if (typeof input === 'string') {
    return [{ role: 'user', parts: [{ text: input }] }];
  }
  return input.map((turn) => ({
    role: turn.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: turn.content }]
  }));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Thrown once retries/time budget are exhausted on a transient failure
// (429/503/network/timeout) - never for invalid-key or bad-request errors,
// those bubble up as-is so the caller keeps returning the specific 400/403
// messages. server.js matches on `.code` to shape the JSON response.
function unavailableError() {
  const err = new Error('El Tutor IA está temporalmente ocupado. Inténtalo nuevamente en unos segundos.');
  err.code = 'AI_PROVIDER_TEMPORARILY_UNAVAILABLE';
  err.status = 503;
  return err;
}

async function callGeminiOnce({ input, instructions, model, timeoutMs }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Math.max(timeoutMs, 1));
  const url = `${API_BASE}/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: instructions }] },
        contents: toContents(input)
      })
    });
  } catch (error) {
    const aborted = error.name === 'AbortError';
    const err = new Error(aborted ? 'Tiempo de espera agotado al contactar Gemini.' : 'No se pudo conectar con Gemini.');
    err.status = aborted ? 504 : 502;
    err.retryable = true;
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.error?.message || 'No se pudo obtener respuesta de Gemini.');
    err.status = res.status;
    err.retryable = RETRYABLE_STATUS.has(res.status);
    throw err;
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
  if (!text) {
    const err = new Error('Gemini no devolvió contenido utilizable.');
    err.status = 502;
    throw err;
  }

  return text;
}

async function createResponse({ input, instructions, model = DEFAULT_MODEL }) {
  if (!isConfigured()) {
    const err = new Error('GEMINI_API_KEY no está configurado.');
    err.status = 503;
    throw err;
  }

  const deadline = Date.now() + OVERALL_TIMEOUT_MS;
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      lastError = lastError || unavailableError();
      break;
    }

    try {
      const text = await callGeminiOnce({ input, instructions, model, timeoutMs: remaining });
      return { text, model };
    } catch (error) {
      lastError = error;
      if (!error.retryable || attempt === MAX_RETRIES) break;

      const backoff = Math.min(BASE_BACKOFF_MS * 2 ** attempt, deadline - Date.now());
      console.warn(`[geminiService] transient error (status ${error.status}), retrying attempt ${attempt + 1}/${MAX_RETRIES}`);
      if (backoff > 0) await sleep(backoff);
    }
  }

  if (lastError && lastError.retryable) {
    throw unavailableError();
  }
  throw lastError;
}

module.exports = { createResponse, isConfigured, DEFAULT_MODEL };
