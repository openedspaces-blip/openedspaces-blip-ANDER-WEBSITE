const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../src/js/script.js'), 'utf8');
function functionSource(name, nextMarker) {
  const start = script.indexOf(`async function ${name}(`);
  return script.slice(start, script.indexOf(nextMarker, start));
}
const postSource = functionSource('postJson', '// Drives the home hero');
const authSource = functionSource('authFetch', '// Narrow bridge');

test('Premium receives 5000 characters after entitlements load and Free receives 2000', () => {
  const input = { value: 'Hello', maxLength: 2000 };
  const counter = { textContent: '' };
  const state = { session: { access_token: 'token' }, entitlements: null };
  const ctx = vm.createContext({
    authStatus: state,
    document: { getElementById: id => id === 'translatorInput' ? input : counter }
  });
  const start = script.indexOf('function syncTranslatorCharacterLimit()');
  vm.runInContext(script.slice(start, script.indexOf('function renderAuthState()', start)), ctx);
  ctx.syncTranslatorCharacterLimit();
  assert.equal(input.maxLength, 2000);
  state.entitlements = { isPremium: true };
  ctx.syncTranslatorCharacterLimit();
  assert.equal(input.maxLength, 5000);
  assert.equal(counter.textContent, '5 / 5000');
  input.value = 'x'.repeat(2500);
  state.session = null;
  ctx.syncTranslatorCharacterLimit();
  assert.equal(input.maxLength, 2000);
  assert.equal(input.value.length, 2500, 'Changing plans must not erase entered text');
});

test('translator request renews an expired session before retrying once', async () => {
  const tokens = [];
  const session = { session: { access_token: 'expired', refresh_token: 'refresh' } };
  const ctx = vm.createContext({
    backendBaseUrl: '', authStatus: session,
    authHeaders: () => ({ Authorization: `Bearer ${session.session.access_token}` }),
    localStorage: { getItem: () => null },
    refreshAuthSession: async () => { session.session.access_token = 'renewed'; return true; },
    fetch: async (url, options) => {
      assert.equal(url, '/api/translate');
      assert.equal(JSON.parse(options.body).text, 'Hello');
      tokens.push(options.headers.Authorization);
      return tokens.length === 1
        ? { status: 401, ok: false }
        : { status: 200, ok: true, json: async () => ({ translatedText: 'Hola' }) };
    }
  });
  vm.runInContext(authSource + postSource, ctx);
  const result = await ctx.postJson('/api/translate', { text: 'Hello' }, { auth: true });
  assert.equal(result.translatedText, 'Hola');
  assert.deepEqual(tokens, ['Bearer expired', 'Bearer renewed']);
});

test('network failure is explained without automatically repeating a paid translation', async () => {
  let calls = 0;
  const ctx = vm.createContext({
    backendBaseUrl: '', authHeaders: () => ({}),
    authFetch: async () => { calls++; throw new TypeError('Failed to fetch'); }
  });
  vm.runInContext(postSource, ctx);
  await assert.rejects(ctx.postJson('/api/translate', {}, { auth: true }), error => {
    assert.equal(error.code, 'NETWORK_ERROR');
    assert.match(error.message, /No se pudo conectar con ANDERGO/);
    return true;
  });
  assert.equal(calls, 1);
});

for (const failure of ['entitlements', 'usage']) {
  test(`translator returns JSON when ${failure} fails instead of rejecting the route`, async () => {
    const server = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    const start = server.indexOf("  app.post('/api/translate'");
    const end = server.indexOf("  app.get('/api/vocabulary/saved'", start);
    let handler;
    let providerCalls = 0;
    const ctx = vm.createContext({
      app: { post: (...args) => { handler = args.at(-1); } },
      translatorLimiter: null, requireAuth: null,
      TRANSLATABLE_LANGUAGES: new Set(['english', 'spanish']),
      PREMIUM_MAX_TRANSLATE_TEXT_LENGTH: 5000, FREE_MAX_TRANSLATE_TEXT_LENGTH: 500,
      getUserEntitlements: async () => {
        if (failure === 'entitlements') throw new Error('internal profile detail');
        return { isPremium: false };
      },
      getTranslatorQueryUsage: async () => { throw new Error('internal usage detail'); },
      translatorService: {
        isTranslatorConfigured: () => true,
        translateText: async () => { providerCalls++; }
      },
      console: { warn: () => {} }
    });
    vm.runInContext(server.slice(start, end), ctx);
    const response = {
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; }
    };
    await handler({ user: { id: 'test' }, body: {
      text: 'Hello', sourceLanguage: 'english', targetLanguage: 'spanish'
    } }, response);
    assert.equal(response.statusCode, 502);
    assert.equal(response.body.ok, false);
    assert.doesNotMatch(response.body.message, /internal/);
    assert.equal(providerCalls, 0);
  });
}
