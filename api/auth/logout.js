// api/auth/logout.js -> POST /api/auth/logout
const authService = require('../../lib/authService');
const { withHandler } = require('../../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  const result = await authService.logout();
  res.status(200).json(result);
});
