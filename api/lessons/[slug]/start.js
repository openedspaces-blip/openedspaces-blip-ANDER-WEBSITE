// api/lessons/[slug]/start.js -> POST /api/lessons/:slug/start
// Marks a lesson as in_progress for the signed-in user (user_lesson_progress).
// Only meaningful for lessons migrated into the normalized courses schema.
const authService = require('../../../lib/authService');
const courseLessonsService = require('../../../lib/courseLessonsService');
const { withHandler, getBearerToken } = require('../../../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const token = getBearerToken(req);
  const user = await authService.verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
    return;
  }

  const slug = req.query.slug;
  if (!(await courseLessonsService.hasLesson(slug))) {
    res.status(404).json({ error: 'Lesson not found.' });
    return;
  }

  const result = await courseLessonsService.startLesson({ userId: user.id, slug });
  res.status(200).json(result);
});
