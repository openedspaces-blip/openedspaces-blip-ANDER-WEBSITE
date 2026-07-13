// api/goals/[id]/complete.js -> POST /api/goals/:id/complete
const authService = require('../../../lib/authService');
const goalsService = require('../../../lib/goalsService');
const { withHandler, getBearerToken } = require('../../../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  const token = getBearerToken(req);
  const user = await authService.verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const goal = await goalsService.completeGoal(user.id, req.query.id);
  res.status(200).json({ goal });
});
