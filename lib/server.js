// lib/server.js
// Express app used both for local development (`npm run dev` / `npm start`)
// and for the test suite (server.test.js imports `createServer`). Vercel's
// serverless functions under api/ reuse the same lib/*Service modules
// directly rather than this Express app.
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const authService = require('./authService');
const lessonsService = require('./lessonsService');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' ? token : null;
}

async function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  const user = await authService.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
  }
  req.user = user;
  next();
}

// Attaches req.user when a valid token is present, but never blocks the
// request - used for endpoints that behave differently for guests vs. users
// without requiring authentication (e.g. lesson listing).
async function attachUserIfPresent(req, _res, next) {
  const token = getBearerToken(req);
  req.user = token ? await authService.verifyToken(token) : null;
  next();
}

function createServer() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('tiny'));
  }

  app.use(express.static(PUBLIC_DIR));

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api', apiLimiter);

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      configured: config.isSupabaseConfigured,
      supabase: {
        configured: config.isSupabaseConfigured,
        mode: config.isSupabaseConfigured ? 'supabase' : 'demo'
      }
    });
  });

  app.post('/api/auth', async (req, res) => {
    const { action, email, password, name } = req.body || {};
    try {
      if (action === 'register') {
        const result = await authService.register({ email, password, name });
        return res.status(201).json(result);
      }
      if (action === 'logout') {
        const result = await authService.logout();
        return res.json(result);
      }
      // Default / 'login'
      const result = await authService.login({ email, password });
      return res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      return res.status(status).json({ error: error.message || 'Request failed.' });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    const result = await authService.logout();
    res.json(result);
  });

  app.get('/api/lessons', attachUserIfPresent, async (req, res) => {
    try {
      const level = String(req.query.level || 'A1').toUpperCase();
      const language = String(req.query.language || 'english').toLowerCase();
      const lessons = await lessonsService.getLessons({ level, language, userId: req.user?.id });
      res.json({ lessons });
    } catch (error) {
      res.status(500).json({ error: 'No se pudieron cargar las lecciones.' });
    }
  });

  app.post('/api/lessons/:slug/complete', requireAuth, async (req, res) => {
    try {
      const { score } = req.body || {};
      const result = await lessonsService.completeLesson({
        userId: req.user.id,
        slug: req.params.slug,
        score: Number.isFinite(score) ? score : 100
      });
      res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo completar la lección.' });
    }
  });

  app.get('/api/progress', requireAuth, async (req, res) => {
    try {
      const progress = await lessonsService.getProgress(req.user.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: 'No se pudo cargar el progreso.' });
    }
  });

  // Fallback for unknown API routes.
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found.' });
  });

  return app;
}

if (require.main === module) {
  const app = createServer();
  app.listen(config.port, () => {
    console.log(`ANDERGO backend listening on port ${config.port} (Supabase ${config.isSupabaseConfigured ? 'configured' : 'NOT configured - using dev fallback'})`);
  });
}

module.exports = { createServer };
