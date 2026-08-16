const test = require('node:test');
const assert = require('node:assert/strict');
const { buildWelcomeEmail, createWelcomeEmailService } = require('./welcomeEmailService');

const emailConfig = {
  enabled: true,
  apiKey: 'test-key',
  from: 'ANDERGO Language Academy <no-reply@andergo.online>',
  replyTo: 'support@andergo.online',
  apiBaseUrl: 'https://api.resend.com',
  maxAttempts: 3
};

function response(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

test('welcome email is sent once after a successful confirmed registration', async () => {
  const calls = [];
  const completed = [];
  const service = createWelcomeEmailService({
    emailConfig,
    repository: {
      claim: async () => ({ claimed: true, attemptCount: 1 }),
      complete: async (...args) => completed.push(args),
      fail: async () => {}
    },
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return url.endsWith('/domains')
        ? response({ data: [{ name: 'andergo.online', status: 'verified' }] })
        : response({ id: 'email_123' });
    },
    logger: () => {}
  });
  const result = await service.sendAfterRegistration({
    userId: 'user-1',
    email: 'student@example.com',
    name: 'María'
  });
  assert.equal(result.status, 'sent');
  assert.equal(calls.filter((call) => call.url.endsWith('/emails')).length, 1);
  assert.equal(JSON.parse(calls[1].options.body).to[0], 'student@example.com');
  assert.equal(completed.length, 1);
});

test('welcome email uses a neutral greeting when the name is unavailable', () => {
  const message = buildWelcomeEmail('');
  assert.match(message.text, /^¡Hola!/);
  assert.doesNotMatch(message.text, /Hola, undefined/);
});

test('provider failure is retried a limited number of times and never throws', async () => {
  let sends = 0;
  const failures = [];
  const service = createWelcomeEmailService({
    emailConfig,
    repository: {
      claim: async () => ({ claimed: true, attemptCount: 1 }),
      complete: async () => {},
      fail: async (...args) => failures.push(args)
    },
    fetchImpl: async (url) => {
      if (url.endsWith('/domains'))
        return response({ data: [{ name: 'andergo.online', status: 'verified' }] });
      sends += 1;
      return response({}, false, 503);
    },
    sleep: async () => {},
    logger: () => {}
  });
  const result = await service.sendAfterRegistration({
    userId: 'user-2',
    email: 'student@example.com'
  });
  assert.equal(result.status, 'failed');
  assert.equal(sends, 3);
  assert.equal(failures.length, 1);
  assert.equal(failures[0][1], 'PROVIDER_UNAVAILABLE');
});

test('a delivery already claimed or completed is not sent again', async () => {
  let fetchCalls = 0;
  const service = createWelcomeEmailService({
    emailConfig,
    repository: {
      claim: async () => ({ claimed: false, attemptCount: 1 }),
      complete: async () => {},
      fail: async () => {}
    },
    fetchImpl: async () => {
      fetchCalls += 1;
      return response({ data: [{ name: 'andergo.online', status: 'verified' }] });
    },
    logger: () => {}
  });
  const result = await service.sendAfterRegistration({
    userId: 'user-3',
    email: 'student@example.com'
  });
  assert.equal(result.status, 'duplicate_or_exhausted');
  assert.equal(fetchCalls, 1);
});
