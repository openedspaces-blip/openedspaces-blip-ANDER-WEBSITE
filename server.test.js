const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createServer } = require('./lib/server');
const { getLocalLessons } = require('./lib/lessonsData');
const { levelContent, languageContent } = require('./lib/uiContent');

const WORLD_LANGUAGES = ['english', 'spanish', 'french', 'italian', 'german'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const SKILLS = ['listening', 'speaking', 'reading', 'writing', 'grammar', 'vocabulary'];

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

test('language content endpoint exposes backend-managed UI payload', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/content/languages`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.levelContent.english.A1, levelContent.english.A1);
    assert.deepEqual(body.languageContent.spanish, languageContent.spanish);
  } finally {
    server.close();
  }
});

test('ai tutor endpoint surfaces missing OpenAI configuration clearly', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/ai/tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'french',
        skill: 'speaking',
        level: 'A1',
        nativeLanguage: 'es',
        prompt: 'Quiero practicar saludos'
      })
    });
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.match(body.error, /OPENAI_API_KEY/i);
  } finally {
    server.close();
  }
});

test('fallback worlds include six lessons per level for every supported language', () => {
  for (const language of WORLD_LANGUAGES) {
    const lessons = getLocalLessons(language);
    assert.equal(lessons.length, 36);

    for (const level of LEVELS) {
      const levelLessons = lessons.filter((lesson) => lesson.level === level);
      assert.equal(levelLessons.length, 6);
      assert.deepEqual(
        [...new Set(levelLessons.map((lesson) => lesson.skill))].sort(),
        [...SKILLS].sort()
      );
    }
  }
});

test('browser world files expose level content and lesson previews for every supported language', () => {
  const window = {};
  const context = vm.createContext({ window });

  for (const file of WORLD_LANGUAGES.map((language) => `src/worlds/${language}/content.js`)) {
    const code = fs.readFileSync(path.join(__dirname, file), 'utf8');
    vm.runInContext(code, context, { filename: file });
  }

  for (const language of WORLD_LANGUAGES) {
    const lessons = window.ANDERGO_LANGUAGE_WORLDS.lessons[language];
    assert.ok(Array.isArray(lessons));
    assert.ok(lessons.length >= 6);
    assert.ok(lessons.some((lesson) => lesson.level === 'A1'));
    assert.ok(window.ANDERGO_LANGUAGE_WORLDS.levelContent[language].C2);
  }
});

test('language tab buttons point to existing panels', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const targets = [...html.matchAll(/class="tab-button[^"]*".*?data-target="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(targets, ['english', 'espanol', 'frances', 'italiano', 'deutsch', 'ai-tutor']);
  for (const target of targets) {
    assert.match(html, new RegExp(`id="tab-${target}"`));
  }
});

test('ai tutor panel includes freeform prompt input and context badges', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.match(html, /id="aiTutorPrompt"/);
  assert.match(html, /data-ai-context="language"/);
  assert.match(html, /data-ai-context="level"/);
  assert.match(html, /data-ai-context="lesson"/);
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

test('lessons endpoint returns expanded A1 worlds for every supported language', async () => {
  const { server, port } = await startTestServer();
  try {
    for (const language of WORLD_LANGUAGES) {
      const response = await fetch(`http://127.0.0.1:${port}/api/lessons?level=A1&language=${language}`);
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.lessons.length, 6);
      assert.deepEqual(
        [...new Set(body.lessons.map((lesson) => lesson.skill))].sort(),
        [...SKILLS].sort()
      );
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
