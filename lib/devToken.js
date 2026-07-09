const crypto = require('node:crypto');
const config = require('./config');

function makeSignature(encodedPayload) {
  return crypto.createHmac('sha256', config.devTokenSecret).update(encodedPayload).digest('base64url');
}

function sign(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedPayload}.${makeSignature(encodedPayload)}`;
}

function verify(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = makeSignature(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch (error) {
    return null;
  }
}

module.exports = { sign, verify };
