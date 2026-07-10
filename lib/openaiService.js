// lib/openaiService.js
// Centralizes all direct calls to the OpenAI API via the official `openai`
// SDK. process.env.OPENAI_API_KEY is read only here, server-side - never
// sent to or read from the frontend.
const OpenAI = require('openai');

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

let client = null;
function getClient() {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function isConfigured() {
  return Boolean(process.env.OPENAI_API_KEY && String(process.env.OPENAI_API_KEY).trim());
}

async function createResponse({ input, instructions, model = DEFAULT_MODEL }) {
  if (!isConfigured()) {
    const err = new Error('OPENAI_API_KEY no está configurado.');
    err.status = 503;
    throw err;
  }

  let response;
  try {
    response = await getClient().responses.create({ model, instructions, input });
  } catch (error) {
    const err = new Error(error?.message || 'No se pudo obtener respuesta de OpenAI.');
    err.status = error?.status || 502;
    throw err;
  }

  const text = response.output_text?.trim();
  if (!text) {
    const err = new Error('OpenAI no devolvió contenido utilizable.');
    err.status = 502;
    throw err;
  }

  return { text, model: response.model || model };
}

module.exports = { createResponse, isConfigured, DEFAULT_MODEL };
