// lib/openaiService.js
// Centralizes all direct calls to the OpenAI API. process.env.OPENAI_API_KEY
// is read only here, server-side - never sent to or read from the frontend.
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

function isConfigured() {
  return Boolean(process.env.OPENAI_API_KEY && String(process.env.OPENAI_API_KEY).trim());
}

function extractOutputText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const parts = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && content?.text) {
        parts.push(content.text);
      }
    }
  }

  return parts.join('\n').trim();
}

async function createResponse({ input, model = DEFAULT_MODEL }) {
  if (!isConfigured()) {
    const err = new Error('OPENAI_API_KEY no está configurado.');
    err.status = 503;
    throw err;
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({ model, input })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data?.error?.message || 'No se pudo obtener respuesta de OpenAI.');
    err.status = response.status || 502;
    throw err;
  }

  const text = extractOutputText(data);
  if (!text) {
    const err = new Error('OpenAI no devolvió contenido utilizable.');
    err.status = 502;
    throw err;
  }

  return { text, model: data?.model || model };
}

module.exports = { createResponse, isConfigured, DEFAULT_MODEL };
