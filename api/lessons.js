// api/lessons.js -> GET /api/lessons?level=A1&language=english
const authService = require('../lib/authService');
const lessonsService = require('../lib/lessonsService');
const courseLessonsService = require('../lib/courseLessonsService');
const { withHandler, getBearerToken } = require('../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  const token = getBearerToken(req);
  const user = token ? await authService.verifyToken(token) : null;

  const level = String(req.query.level || 'A1').toUpperCase();
  const language = String(req.query.language || 'english').toLowerCase();

  // English A1 has been migrated to the normalized courses schema; every
  // other language/level still reads from the legacy content_json lessons
  // table until it's migrated too.
  const normalizedLessons = await courseLessonsService.getLessons({ languageCode: language, levelCode: level, userId: user?.id });
  if (normalizedLessons) {
    res.status(200).json({ lessons: normalizedLessons, source: 'courses' });
    return;
  }

  const lessons = await lessonsService.getLessons({ level, language, userId: user?.id });
  res.status(200).json({ lessons, source: 'legacy' });
});
