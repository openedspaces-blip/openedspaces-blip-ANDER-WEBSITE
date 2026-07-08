// lib/httpHelpers.js
// Small helpers shared by the api/*.js Vercel serverless functions, which run
// independently of lib/server.js's Express app (Vercel maps one function per
// file, per vercel.json's `functions: { "api/**/*.js" }` config).

function applyCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' ? token : null;
}

// Wraps a Vercel handler so CORS is applied and thrown errors become clean
// JSON responses instead of opaque 500s.
function withHandler(fn) {
  return async (req, res) => {
    if (applyCors(req, res)) return;
    try {
      await fn(req, res);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'Request failed.' });
    }
  };
}

module.exports = { applyCors, getBearerToken, withHandler };
