const { withHandler } = require('../../lib/httpHelpers');
const { getTutorReply } = require('../../lib/aiTutorService');

module.exports = withHandler(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const { language, skill, level, nativeLanguage, prompt } = req.body || {};
  const result = await getTutorReply({ language, skill, level, nativeLanguage, prompt });
  res.status(200).json(result);
});
