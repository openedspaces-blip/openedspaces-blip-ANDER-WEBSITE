// api/goals/[id].js -> PUT/DELETE /api/goals/:id
const authService = require('../../lib/authService');
const goalsService = require('../../lib/goalsService');
const { withHandler, getBearerToken } = require('../../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  const token = getBearerToken(req);
  const user = await authService.verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
    return;
  }

  if (req.method === 'PUT') {
    const { goalKey } = req.body || {};
    const goal = await goalsService.updateGoal(user.id, req.query.id, goalKey);
    res.status(200).json({ goal });
    return;
  }

  if (req.method === 'DELETE') {
    const result = await goalsService.deleteGoal(user.id, req.query.id);
    res.status(200).json(result);
    return;
  }

  res.status(405).json({ error: 'Method not allowed.' });
});
