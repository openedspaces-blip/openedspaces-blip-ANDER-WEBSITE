const { createApp } = require('../lib/server');

const app = createApp();

module.exports = function handler(req, res) {
  return app(req, res);
};
