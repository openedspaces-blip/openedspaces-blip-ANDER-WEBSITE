// api/lessons.js -> GET /api/lessons?level=A1&language=english
const authService = require('../lib/authService');
const lessonsService = require('../lib/lessonsService');
const { withHandler, getBearerToken } = require('../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  const token = getBearerToken(req);
  const user = token ? await authService.verifyToken(token) : null;

  const level = String(req.query.level || 'A1').toUpperCase();
  const language = String(req.query.language || 'english').toLowerCase();

  const lessons = await lessonsService.getLessons({ level, language, userId: user?.id });
  res.status(200).json({ lessons });
});
