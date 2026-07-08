// api/auth.js -> POST /api/auth
const authService = require('../lib/authService');
const { withHandler } = require('../lib/httpHelpers');

module.exports = withHandler(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const { action, email, password, name } = req.body || {};

  if (action === 'register') {
    const result = await authService.register({ email, password, name });
    res.status(201).json(result);
    return;
  }
  if (action === 'logout') {
    const result = await authService.logout();
    res.status(200).json(result);
    return;
  }
  const result = await authService.login({ email, password });
  res.status(200).json(result);
});
