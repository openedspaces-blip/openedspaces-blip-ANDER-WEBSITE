const { levelContent, languageContent } = require('../../lib/uiContent');
const { withHandler } = require('../../lib/httpHelpers');

module.exports = withHandler(async (_req, res) => {
  res.status(200).json({ levelContent, languageContent });
});
