const { createServer } = require('../lib/server');

const app = createServer();

module.exports = function handler(req, res) {
  return app(req, res);
};
