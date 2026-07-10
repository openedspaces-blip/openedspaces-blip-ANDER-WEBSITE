const { createResponse, isConfigured } = require('./openaiService');

function tutorConfigError() {
  if (!isConfigured()) {
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

async function getTutorReply(input) {
  const configError = tutorConfigError();
  if (configError) throw configError;

  const { text, model } = await createResponse({ input: buildTutorPrompt(input) });
  return { reply: text, model };
}

module.exports = { getTutorReply, tutorConfigError };
