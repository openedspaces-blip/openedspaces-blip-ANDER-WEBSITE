// api/lessons/[slug]/check-answer.js -> POST /api/lessons/:slug/check-answer
// Grades a single exercise attempt against the real answer, which lives only
// server-side - never sent to the browser as part of the lesson payload.
const lessonsService = require('../../../lib/lessonsService');
const { withHandler } = require('../../../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const slug = req.query.slug;
  const { index, selectedOption } = req.body || {};
  const result = await lessonsService.checkAnswer({ slug, index, selectedOption });
  res.status(200).json(result);
});
