// lib/cerebrasService.js
// Primary AI Tutor provider: Cerebras (fast inference, OpenAI-compatible
// chat.completions API with real token streaming). process.env.CEREBRAS_API_KEY
// is read only here, server-side - never sent to or read from the frontend,
// and never logged.
const Cerebras = require('@cerebras/cerebras_cloud_sdk');

const DEFAULT_MODEL = process.env.CEREBRAS_MODEL || 'gpt-oss-120b';

let client = null;
function getClient() {
  if (!client) client = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY });
  return client;
}

function isConfigured() {
  return Boolean(process.env.CEREBRAS_API_KEY && String(process.env.CEREBRAS_API_KEY).trim());
}

// messages: OpenAI-style [{role: 'system'|'user'|'assistant', content}, ...]
// (see aiTutorService.buildChatMessages). onDelta is called once per token
// chunk as it arrives - the caller (aiTutorService) forwards it straight to
// the HTTP response so the student sees words as they're generated.
async function streamResponse({ messages, maxOutputTokens, signal, onDelta }) {
  if (!isConfigured()) {
    const err = new Error('CEREBRAS_API_KEY no está configurado.');
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
        ...(maxOutputTokens ? { max_completion_tokens: maxOutputTokens } : {})
      },
      { signal }
    );
  } catch (error) {
    const err = new Error(error?.message || 'No se pudo conectar con Cerebras.');
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
      const err = new Error('Tiempo de espera agotado al contactar Cerebras.');
      err.status = 504;
      throw err;
    }
    const err = new Error(error?.message || 'Cerebras interrumpió la respuesta.');
    err.status = error?.status || 502;
    throw err;
  }

  if (!text.trim()) {
    const err = new Error('Cerebras no devolvió contenido utilizable.');
    err.status = 502;
    throw err;
  }

  return { model: DEFAULT_MODEL };
}

module.exports = { streamResponse, isConfigured, DEFAULT_MODEL };
