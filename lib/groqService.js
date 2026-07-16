// lib/groqService.js
// Fallback #2 AI Tutor provider: Groq. Groq's API is OpenAI-compatible, so
// this reuses the already-installed `openai` SDK pointed at Groq's base URL
// instead of adding a dedicated dependency. process.env.GROQ_API_KEY is read
// only here, server-side - never sent to or read from the frontend, and
// never logged.
const OpenAI = require('openai');

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const BASE_URL = 'https://api.groq.com/openai/v1';

let client = null;
function getClient() {
  if (!client) client = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: BASE_URL });
  return client;
}

function isConfigured() {
  return Boolean(process.env.GROQ_API_KEY && String(process.env.GROQ_API_KEY).trim());
}

// Same contract as cerebrasService.streamResponse - see that file's docs.
async function streamResponse({ messages, maxOutputTokens, signal, onDelta }) {
  if (!isConfigured()) {
    const err = new Error('GROQ_API_KEY no está configurado.');
    err.status = 503;
    throw err;
  }

  let stream;
  try {
    stream = await getClient().chat.completions.create(
      {
        model: DEFAULT_MODEL,
        messages,
        stream: true,
        ...(maxOutputTokens ? { max_tokens: maxOutputTokens } : {})
      },
      { signal }
    );
  } catch (error) {
    const err = new Error(error?.message || 'No se pudo conectar con Groq.');
    err.status = error?.status || 502;
    throw err;
  }

  let text = '';
  try {
    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta?.content || '';
      if (delta) {
        text += delta;
        onDelta(delta);
      }
    }
  } catch (error) {
    if (error?.name === 'AbortError' || signal?.aborted) {
      const err = new Error('Tiempo de espera agotado al contactar Groq.');
      err.status = 504;
      throw err;
    }
    const err = new Error(error?.message || 'Groq interrumpió la respuesta.');
    err.status = error?.status || 502;
    throw err;
  }

  if (!text.trim()) {
    const err = new Error('Groq no devolvió contenido utilizable.');
    err.status = 502;
    throw err;
  }

  return { model: DEFAULT_MODEL };
}

module.exports = { streamResponse, isConfigured, DEFAULT_MODEL };
