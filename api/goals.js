// api/goals.js -> GET/POST /api/goals
const authService = require('../lib/authService');
const goalsService = require('../lib/goalsService');
const { withHandler, getBearerToken } = require('../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  const token = getBearerToken(req);
  const user = await authService.verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
    return;
  }

  if (req.method === 'GET') {
    const goal = await goalsService.getGoal(user.id);
    res.status(200).json({ goal });
    return;
  }

  if (req.method === 'POST') {
    const { goalKey } = req.body || {};
    const goal = await goalsService.upsertGoal(user.id, goalKey);
    res.status(201).json({ goal });
    return;
  }

  res.status(405).json({ error: 'Method not allowed.' });
});
