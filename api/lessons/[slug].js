// api/lessons/[slug].js -> GET /api/lessons/:slug
// Detail for a single lesson. Only lessons migrated into the normalized
// courses schema (English A1 for now) are available here; everything else
// still relies on the list endpoint's legacy fallback.
const authService = require('../../lib/authService');
const courseLessonsService = require('../../lib/courseLessonsService');
const { withHandler, getBearerToken } = require('../../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const token = getBearerToken(req);
  const user = token ? await authService.verifyToken(token) : null;

  const lesson = await courseLessonsService.getLessonDetail({ slug: req.query.slug, userId: user?.id });
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found.' });
    return;
  }

  res.status(200).json({ lesson });
});
