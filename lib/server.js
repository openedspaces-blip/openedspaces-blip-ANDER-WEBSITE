const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const {
  handleHealth,
  handleRegister,
  handleLogin,
  handleLogout,
  handleProgress,
  handleUser,
  handleRefreshToken,
  handleLessons,
  handleLesson,
  handleCompleteLesson
} = require('./apiHandlers');

const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '..', '.env')
];
const envFile = candidates.find(p => fs.existsSync(p));
if (envFile) {
  dotenv.config({ path: envFile });
} else {
  console.warn('No .env file found in any of the candidate paths');
}

function createApp() {
  const port = process.env.PORT || 3000;
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  const frontendDomain = process.env.FRONTEND_DOMAIN || 'andergo.online';
  const allowedOrigins = isDevelopment
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000']
    : [`https://${frontendDomain}`, `https://www.${frontendDomain}`];

  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(morgan(isDevelopment ? 'dev' : 'combined'));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api/auth', authLimiter);

  const corsOptions = {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // same-origin / curl / server-to-server
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('CORS: origin not allowed'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  };
  app.use(cors(corsOptions));

  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ limit: '50kb', extended: true }));
  const rootDir = path.resolve(__dirname, '..');
  const publicDir = path.join(rootDir, 'public');
  app.use(express.static(publicDir, { index: false, dotfiles: 'deny' }));

  // Local development fallback: serve the main static assets from the project root
  // when public/ has not been generated yet.
  for (const asset of ['styles.css', 'script.js', 'andergo-logo.png']) {
    app.get(`/${asset}`, (_req, res) => {
      res.sendFile(asset, { root: rootDir });
    });
  }

  app.get('/api/health', handleHealth);
  app.post('/api/auth/register', handleRegister);
  app.post('/api/auth/login', handleLogin);
  app.post('/api/auth/logout', handleLogout);
  app.post('/api/auth/refresh', handleRefreshToken);
  app.get('/api/auth/user', handleUser);
  app.get('/api/progress', handleProgress);
  app.get('/api/lessons', handleLessons);
  app.get('/api/lessons/:slug', handleLesson);
  app.post('/api/lessons/:slug/complete', handleCompleteLesson);

  app.post('/api/auth', async (req, res) => {
    const action = req.body?.action;
    if (action === 'register') return handleRegister(req, res);
    if (action === 'login') return handleLogin(req, res);
    if (action === 'logout') return handleLogout(req, res);
    if (action === 'refresh') return handleRefreshToken(req, res);
    return res.status(400).json({ success: false, error: 'Action must be register, login, logout, or refresh.' });
  });

  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile('index.html', { root: path.resolve(__dirname, '..') });
  });

  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not found' });
  });

  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  });

  return app;
}

function createServer() {
  return createApp();
}

function startServer() {
  const app = createApp();
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log('ANDERGO Authentication Server running');
    console.log(`  Port: ${port}`);
    console.log(`  Frontend Domain: ${process.env.FRONTEND_DOMAIN || 'andergo.online'}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    const allowedOrigins = isDevelopment
      ? ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000']
      : [`https://${process.env.FRONTEND_DOMAIN || 'andergo.online'}`, `https://www.${process.env.FRONTEND_DOMAIN || 'andergo.online'}`];
    console.log(`  Allowed Origins: ${allowedOrigins.join(', ')}`);
    console.log(`  Health check: http://localhost:${port}/api/health`);
    console.log('  Auth endpoints: /api/auth/register, /api/auth/login, /api/auth/logout');
  });

  server.on('error', (err) => {
    console.error('Listen error:', err);
    process.exit(1);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
    // Force exit if shutdown takes too long
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = {
  createApp,
  createServer,
  startServer
};
