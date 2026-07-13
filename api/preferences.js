// api/preferences.js -> GET/PUT /api/preferences
const authService = require('../lib/authService');
const preferencesService = require('../lib/preferencesService');
const { withHandler, getBearerToken } = require('../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  const token = getBearerToken(req);
  const user = await authService.verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
    return;
  }

  if (req.method === 'GET') {
    const preferences = await preferencesService.getPreferences(user.id);
    res.status(200).json(preferences);
    return;
  }

  if (req.method === 'PUT') {
    const { language, level } = req.body || {};
    const preferences = await preferencesService.updatePreferences(user.id, { language, level });
    res.status(200).json(preferences);
    return;
  }

  res.status(405).json({ error: 'Method not allowed.' });
});
