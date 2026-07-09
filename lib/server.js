const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { getSupabaseClient } = require('./supabaseClient');
const { register, login, logout, getUserFromToken } = require('./authService');
const { getLessons } = require('./lessonsService');
const { sendJson, extractBearerToken } = require('./httpHelpers');
const { getProgressProfile, updateProgress } = require('./gamification');
const { normalizeLanguage } = require('./worldSeed');

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function requireUser(req) {
  const token = extractBearerToken(req);
  if (!token) {
    throw createError('Authentication required', 401);
  }

  const user = await getUserFromToken(token);
  if (!user) {
    throw createError('Authentication required', 401);
  }

  return { token, user };
}

async function handleHealth(_req, res) {
  sendJson(res, 200, { ok: true, configured: config.isConfigured, version: '1.0.0' });
}

async function handleAuth(req, res) {
  const { action, email, password } = req.body || {};

  if (!email || !password) {
    return sendJson(res, 400, { error: 'Email and password are required' });
  }

  try {
    if (action === 'register') {
      const result = await register(email, password);
      return sendJson(res, 200, result);
    }

    if (action === 'login') {
      const result = await login(email, password);
      return sendJson(res, 200, result);
    }

    return sendJson(res, 400, { error: 'Unsupported auth action' });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message || 'Authentication failed' });
  }
}

async function handleLogout(req, res) {
  try {
    const token = extractBearerToken(req);
    await logout(token);
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message || 'Logout failed' });
  }
}

async function handleLessons(req, res) {
  try {
    const supabase = getSupabaseClient();
    const language = normalizeLanguage(req.query.language || 'english');
    const level = req.query.level ? String(req.query.level).toUpperCase() : undefined;
    const lessons = await getLessons(language, level, supabase);
    return sendJson(res, 200, { lessons });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Unable to load lessons' });
  }
}

async function handleLessonComplete(req, res) {
  try {
    const { user } = await requireUser(req);
    const supabase = getSupabaseClient();
    const score = Number(req.body && req.body.score) || 0;
    const profile = await updateProgress(user.id, req.params.slug, score, supabase);
    return sendJson(res, 200, { ok: true, xp: profile.xp });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message || 'Unable to complete lesson' });
  }
}

async function handleProgress(req, res) {
  try {
    const { user } = await requireUser(req);
    const supabase = getSupabaseClient();
    const profile = await getProgressProfile(user.id, supabase);
    return sendJson(res, 200, {
      xp: profile.xp,
      level: profile.level,
      badges: profile.badges,
      streak: profile.streak
    });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message || 'Unable to load progress' });
  }
}

function createServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev', { skip: () => process.env.NODE_ENV === 'test' || process.env.CI === 'true' }));
  app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  }));

  app.get('/api/health', handleHealth);
  app.post('/api/auth', handleAuth);
  app.post('/api/auth/logout', handleLogout);
  app.get('/api/lessons', handleLessons);
  app.post('/api/lessons/:slug/complete', handleLessonComplete);
  app.get('/api/progress', handleProgress);

  app.use((req, res) => {
    sendJson(res, 404, { error: 'Not found' });
  });

  return app;
}

if (require.main === module) {
  createServer().listen(config.port, () => {
    console.log(`ANDERGO backend listening on port ${config.port}`);
  });
}

module.exports = {
  createServer,
  handleHealth,
  handleAuth,
  handleLogout,
  handleLessons,
  handleLessonComplete,
  handleProgress
};
