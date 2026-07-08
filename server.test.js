const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createServer } = require('./lib/server');
const { getLocalLessons } = require('./lib/lessonsData');

function startTestServer() {
  const app = createServer();
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve({ server, port: server.address().port });
    });
  });
}

test('health endpoint responds with configuration status', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(typeof body.configured, 'boolean');
  } finally {
    server.close();
  }
});

test('english and french fallback worlds include six lessons per level', () => {
  for (const language of ['english', 'french']) {
    const lessons = getLocalLessons(language);
    assert.equal(lessons.length, 36);

    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
      assert.equal(lessons.filter((lesson) => lesson.level === level).length, 6);
    }
  }
});

test('browser world files expose expanded english and french lessons', () => {
  const window = {};
  const context = vm.createContext({ window });

  for (const file of ['worlds/english/content.js', 'worlds/french/content.js']) {
    const code = fs.readFileSync(path.join(__dirname, file), 'utf8');
    vm.runInContext(code, context, { filename: file });
  }

  assert.equal(window.ANDERGO_LANGUAGE_WORLDS.lessons.english.length, 36);
  assert.equal(window.ANDERGO_LANGUAGE_WORLDS.lessons.french.length, 36);
  assert.ok(window.ANDERGO_LANGUAGE_WORLDS.levelContent.english.C2);
  assert.ok(window.ANDERGO_LANGUAGE_WORLDS.levelContent.french.C2);
});

test('language tab buttons point to existing panels', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const targets = [...html.matchAll(/class="tab-button[^"]*".*?data-target="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(targets, ['english', 'espanol', 'frances', 'italiano', 'deutsch', 'ai-tutor']);
  for (const target of targets) {
    assert.match(html, new RegExp(`id="tab-${target}"`));
  }
});

test('legacy auth endpoint validates missing credentials', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login' })
    });
    assert.ok([400, 500].includes(response.status));
    const body = await response.json();
    assert.equal(typeof body.error, 'string');
  } finally {
    server.close();
  }
});

test('lessons endpoint returns the A1 learning path', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/lessons?level=A1`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.ok(Array.isArray(body.lessons));
    assert.ok(body.lessons.length >= 1);
    assert.equal(typeof body.lessons[0].slug, 'string');
  } finally {
    server.close();
  }
});

test('lessons endpoint returns expanded english and french A1 worlds', async () => {
  const { server, port } = await startTestServer();
  try {
    for (const language of ['english', 'french']) {
      const response = await fetch(`http://127.0.0.1:${port}/api/lessons?level=A1&language=${language}`);
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.lessons.length, 6);
    }
  } finally {
    server.close();
  }
});

test('complete lesson requires authentication', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/lessons/greetings-a1/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: 100 })
    });
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(typeof body.error, 'string');
  } finally {
    server.close();
  }
});
