const { withHandler } = require('../../lib/httpHelpers');
const { getTutorReply } = require('../../lib/aiTutorService');

const MAX_PROMPT_LENGTH = 3000;
const MAX_HISTORY_MESSAGES = 6;

module.exports = withHandler(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const {
    language, skill, level, nativeLanguage, prompt,
    lessonTitle, lessonIntro, selectedSuggestion, history
  } = req.body || {};

  if (prompt !== undefined && typeof prompt !== 'string') {
    res.status(400).json({ error: 'El prompt debe ser texto.' });
    return;
  }
  if (typeof prompt === 'string' && prompt.length > MAX_PROMPT_LENGTH) {
    res.status(400).json({ error: 'La pregunta es demasiado extensa.' });
    return;
  }
  if (history !== undefined && !Array.isArray(history)) {
    res.status(400).json({ error: 'El historial debe ser un arreglo.' });
    return;
  }

  const result = await getTutorReply({
    language, skill, level, nativeLanguage, prompt,
    lessonTitle, lessonIntro, selectedSuggestion,
    // Only the most recent turns are kept - just enough context, without
    // letting an ever-growing history inflate token usage.
    history: Array.isArray(history) ? history.slice(-MAX_HISTORY_MESSAGES) : undefined
  });
  res.status(200).json(result);
});
