// api/lessons/[slug]/complete.js -> POST /api/lessons/:slug/complete
const authService = require('../../../lib/authService');
const lessonsService = require('../../../lib/lessonsService');
const { withHandler, getBearerToken } = require('../../../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  const token = getBearerToken(req);
  const user = await authService.verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
    return;
  }

  const slug = req.query.slug;
  const { score } = req.body || {};
  const result = await lessonsService.completeLesson({
    userId: user.id,
    slug,
    score: Number.isFinite(score) ? score : 100
  });
  res.status(200).json(result);
});
