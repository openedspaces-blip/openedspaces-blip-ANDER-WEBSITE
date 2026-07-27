const { createServer } = require('../lib/server');

const app = createServer();

module.exports = function handler(req, res) {
  return app(req, res);
};

// Paddle signature verification requires the original request bytes.
module.exports.config = {
  api: { bodyParser: false }
};
