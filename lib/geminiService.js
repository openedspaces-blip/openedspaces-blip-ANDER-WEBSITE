// lib/geminiService.js
// Centralizes all direct calls to the Google Gemini API via its REST
// endpoint (no extra SDK dependency - Node's built-in fetch is enough).
// process.env.GEMINI_API_KEY is read only here, server-side - never sent to
// or read from the frontend. Free tier: https://aistudio.google.com/apikey
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

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

async function createResponse({ input, instructions, model = DEFAULT_MODEL }) {
  if (!isConfigured()) {
    const err = new Error('GEMINI_API_KEY no está configurado.');
    err.status = 503;
    throw err;
  }

  const url = `${API_BASE}/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: instructions }] },
        contents: toContents(input)
      })
    });
  } catch (error) {
    const err = new Error('No se pudo conectar con Gemini.');
    err.status = 502;
    throw err;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.error?.message || 'No se pudo obtener respuesta de Gemini.');
    err.status = res.status;
    throw err;
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
  if (!text) {
    const err = new Error('Gemini no devolvió contenido utilizable.');
    err.status = 502;
    throw err;
  }

  return { text, model };
}

module.exports = { createResponse, isConfigured, DEFAULT_MODEL };
