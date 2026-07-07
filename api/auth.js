const {
  handleRegister,
  handleLogin,
  handleLogout,
  handleRefreshToken
} = require('../lib/apiHandlers');
const { parseJsonBody } = require('./_utils');

module.exports = async function handler(req, res) {
  if (!req.body || typeof req.body !== 'object') {
    req.body = await parseJsonBody(req);
  }

  const action = req.body?.action;
  if (action === 'register') return handleRegister(req, res);
  if (action === 'login') return handleLogin(req, res);
  if (action === 'logout') return handleLogout(req, res);
  if (action === 'refresh') return handleRefreshToken(req, res);
  return res.status(400).json({ success: false, error: 'Action must be register, login, logout, or refresh.' });
};
