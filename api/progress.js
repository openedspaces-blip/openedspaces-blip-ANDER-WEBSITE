// api/progress.js -> GET /api/progress
const authService = require('../lib/authService');
const lessonsService = require('../lib/lessonsService');
const { withHandler, getBearerToken } = require('../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  const token = getBearerToken(req);
  const user = await authService.verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
    return;
  }

  const progress = await lessonsService.getProgress(user.id);
  res.status(200).json(progress);
});
