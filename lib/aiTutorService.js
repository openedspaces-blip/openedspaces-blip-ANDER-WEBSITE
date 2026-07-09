const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

function tutorConfigError() {
  if (!process.env.OPENAI_API_KEY || !String(process.env.OPENAI_API_KEY).trim()) {
    const err = new Error('El tutor IA no está configurado todavía. Agrega OPENAI_API_KEY en Vercel o en tu .env local.');
    err.status = 503;
    return err;
  }
  return null;
}

function buildTutorPrompt({
  language = 'english',
  skill = 'speaking',
  level = 'A1',
  nativeLanguage = 'es',
  prompt = '',
  lessonTitle = '',
  lessonIntro = '',
  selectedSuggestion = ''
}) {
  const nativeLanguageLabel = {
    es: 'español',
    en: 'english',
    fr: 'français',
    it: 'italiano',
    de: 'deutsch'
  }[nativeLanguage] || 'español';

  return [
    'Eres un tutor de idiomas de ANDERGO.',
    `Idioma meta: ${language}.`,
    `Habilidad: ${skill}.`,
    `Nivel del estudiante: ${level}.`,
    lessonTitle ? `Lección activa: ${lessonTitle}.` : '',
    lessonIntro ? `Contexto de la lección: ${lessonIntro}.` : '',
    selectedSuggestion ? `Sugerencia elegida por el estudiante: ${selectedSuggestion}.` : '',
    `Explica principalmente en ${nativeLanguageLabel}, pero incluye ejemplos útiles en el idioma meta.`,
    'Responde de forma práctica y breve.',
    'Si el estudiante comparte un texto, corrígelo sin perder su intención original.',
    'Da exactamente estas 3 partes con este formato:',
    '1) Corrección/guía breve',
    '2) Ejemplo útil',
    '3) Mini práctica de seguimiento',
    `Solicitud del estudiante: ${prompt || 'Quiero practicar y mejorar en esta habilidad.'}`
  ].filter(Boolean).join('\n');
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

async function getTutorReply(input) {
  const configError = tutorConfigError();
  if (configError) throw configError;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: DEFAULT_OPENAI_MODEL,
      input: buildTutorPrompt(input)
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data?.error?.message || 'No se pudo obtener respuesta del tutor IA.');
    err.status = response.status || 502;
    throw err;
  }

  const reply = extractOutputText(data);
  if (!reply) {
    const err = new Error('OpenAI no devolvió contenido utilizable para el tutor.');
    err.status = 502;
    throw err;
  }

  return {
    reply,
    model: data?.model || DEFAULT_OPENAI_MODEL
  };
}

module.exports = { getTutorReply, tutorConfigError };
