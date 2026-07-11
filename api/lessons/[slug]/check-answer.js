// api/lessons/[slug]/check-answer.js -> POST /api/lessons/:slug/check-answer
// Grades a single exercise attempt against the real answer, which lives only
// server-side - never sent to the browser as part of the lesson payload.
const authService = require('../../../lib/authService');
const lessonsService = require('../../../lib/lessonsService');
const courseLessonsService = require('../../../lib/courseLessonsService');
const { withHandler, getBearerToken } = require('../../../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const slug = req.query.slug;

  if (await courseLessonsService.hasLesson(slug)) {
    const token = getBearerToken(req);
    const user = token ? await authService.verifyToken(token) : null;
    const { exerciseId, selectedOptionId } = req.body || {};
    const result = await courseLessonsService.checkAnswer({ userId: user?.id, slug, exerciseId, selectedOptionId });
    res.status(200).json(result);
    return;
  }

  const { index, selectedOption } = req.body || {};
  const result = await lessonsService.checkAnswer({ slug, index, selectedOption });
  res.status(200).json(result);
});
