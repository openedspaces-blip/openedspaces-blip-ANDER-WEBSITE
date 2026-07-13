// api/dashboard.js -> GET /api/dashboard
const authService = require('../lib/authService');
const dashboardService = require('../lib/dashboardService');
const { withHandler, getBearerToken } = require('../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  const token = getBearerToken(req);
  const user = await authService.verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
    return;
  }

  const dashboard = await dashboardService.getDashboard(user.id);
  res.status(200).json(dashboard);
});
