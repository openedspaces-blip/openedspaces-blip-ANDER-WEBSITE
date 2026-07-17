const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createServer } = require('./lib/server');
const { getLocalLessons } = require('./lib/lessonsData');
const { levelContent, languageContent } = require('./lib/uiContent');
const { isAnyProviderConfigured: isTutorConfigured } = require('./lib/aiTutorService');
const { isPremiumActive, LIMIT_MESSAGE } = require('./lib/voiceAccessService');

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

// Reads the /api/ai/tutor SSE body (`data: {"delta"|"done"|"error", ...}\n\n`
// frames - see lib/server.js) and accumulates it into the fully joined reply,
// mirroring what src/js/script.js's sendTutorMessage() does in the browser.
async function collectSseReply(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let sawDone = false;
  let sawError = null;
  let done = false;

  while (!done) {
    const chunk = await reader.read();
    done = chunk.done;
    if (chunk.value) buffer += decoder.decode(chunk.value, { stream: true });

    let frameEnd;
    while ((frameEnd = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, frameEnd);
      buffer = buffer.slice(frameEnd + 2);
      const line = frame.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      const payload = JSON.parse(line.slice(6));
      if (payload.delta) text += payload.delta;
      if (payload.done) sawDone = true;
      if (payload.error) sawError = payload.message;
    }
  }

  return { text, sawDone, sawError };
}

test(
  'ai tutor endpoint surfaces missing AI provider configuration clearly',
  { skip: isTutorConfigured() && 'An AI provider is configured in this environment' },
  async () => {
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
      // Cerebras is the primary provider - this is the actionable env var to
      // set, matching lib/aiTutorService.js#tutorConfigError().
      assert.match(body.error, /CEREBRAS_API_KEY/i);
    } finally {
      server.close();
    }
  }
);

// Deliberately does NOT assert this passes because "Cerebras was integrated"
// - it only runs (and only proves anything) when a real provider key
// (CEREBRAS_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY) is actually present
// and working. It targets whichever provider ends up configured, not Gemini
// specifically - see lib/aiTutorService.js's PROVIDERS cascade.
test(
  'ai tutor endpoint streams a real reply when a provider is configured',
  {
    skip:
      !isTutorConfigured() &&
      'No AI provider (CEREBRAS_API_KEY/GROQ_API_KEY/GEMINI_API_KEY) is configured in this environment'
  },
  async () => {
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
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type') || '', /text\/event-stream/);
      const { text, sawDone, sawError } = await collectSseReply(response);
      assert.equal(sawError, null, `expected no SSE error event, got: ${sawError}`);
      assert.ok(sawDone, 'expected a final {"done":true} SSE event');
      assert.ok(text.length > 0, 'expected at least one non-empty delta chunk');
    } finally {
      server.close();
    }
  }
);

test('health endpoint reports AI tutor configuration without leaking keys or other provider names', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.aiTutor, {
      configured: isTutorConfigured(),
      primaryProvider: 'cerebras',
      streaming: true
    });
  } finally {
    server.close();
  }
});

// English A1 is now organized into 12 thematic units with one activity per
// skill each (72 activities) instead of a single lesson per skill (6) -
// see scripts/content/english-a1-units.js. French A1 got the same
// unit-based treatment plus an extra 'dialogue' skill (12 units x 7 skills
// = 84 activities) - see scripts/content/french-a1-units.js and the
// dialogue_skill/dialogue_mission migration. Every other language/level
// keeps the original flat, single-lesson-per-skill shape.
const ENGLISH_A1_ACTIVITY_COUNT = 72;
const FRENCH_A1_ACTIVITY_COUNT = 84;
const UNIT_SKILLS_BY_LANGUAGE = { french: [...SKILLS, 'dialogue'] };

function unitSkillsFor(language) {
  return UNIT_SKILLS_BY_LANGUAGE[language] || SKILLS;
}

test('fallback worlds include six lessons per level for every supported language (English A1: 12 units x 6 skills, French A1: 12 units x 7 skills)', () => {
  for (const language of WORLD_LANGUAGES) {
    const lessons = getLocalLessons(language);
    const a1Count =
      language === 'english'
        ? ENGLISH_A1_ACTIVITY_COUNT
        : language === 'french'
          ? FRENCH_A1_ACTIVITY_COUNT
          : 6;
    const expectedTotal = 36 - 6 + a1Count;
    assert.equal(lessons.length, expectedTotal);

    for (const level of LEVELS) {
      const levelLessons = lessons.filter((lesson) => lesson.level === level);
      const expectedLevelCount = level === 'A1' ? a1Count : 6;
      assert.equal(levelLessons.length, expectedLevelCount);
      const expectedSkills = level === 'A1' ? unitSkillsFor(language) : SKILLS;
      assert.deepEqual(
        [...new Set(levelLessons.map((lesson) => lesson.skill))].sort(),
        [...expectedSkills].sort()
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

test('single-view router sections exist for every nav destination', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  // The old per-language .tab-button/#tab-<lang> system was removed in favor
  // of one dynamic lesson workspace (#learning-path) shared by every
  // language - assert it's gone, not just that the new sections exist.
  assert.doesNotMatch(html, /class="tab-button/);
  assert.doesNotMatch(html, /id="tab-english"/);

  for (const id of [
    'progress',
    'language-picker',
    'learning-path',
    'achievements',
    'goals',
    'tutor',
    'premium'
  ]) {
    assert.match(html, new RegExp(`id="${id}"`), `expected a section with id="${id}"`);
  }
  assert.match(html, /class="nav-group nav-group-visitor"/);
  assert.match(html, /class="nav-group nav-group-member"/);
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

test('lessons endpoint returns expanded A1 worlds for every supported language (English: 12 units x 6 skills, French: 12 units x 7 skills)', async () => {
  const { server, port } = await startTestServer();
  try {
    for (const language of WORLD_LANGUAGES) {
      const response = await fetch(
        `http://127.0.0.1:${port}/api/lessons?level=A1&language=${language}`
      );
      assert.equal(response.status, 200);
      const body = await response.json();
      const expectedCount =
        language === 'english'
          ? ENGLISH_A1_ACTIVITY_COUNT
          : language === 'french'
            ? FRENCH_A1_ACTIVITY_COUNT
            : 6;
      assert.equal(body.lessons.length, expectedCount);
      assert.deepEqual(
        [...new Set(body.lessons.map((lesson) => lesson.skill))].sort(),
        [...unitSkillsFor(language)].sort()
      );
      if (language === 'english' || language === 'french') {
        assert.ok(
          body.lessons.every((lesson) => typeof lesson.unitId === 'string' && lesson.unitId.length > 0),
          `expected every ${language} A1 activity to have a unitId`
        );
      }
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

test('speech synthesize endpoint requires authentication', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/speech/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello!', language: 'english', locale: 'en-US' })
    });
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(typeof body.error, 'string');
  } finally {
    server.close();
  }
});

test('speech quota limit message matches the exact copy shown to free-tier students', () => {
  assert.equal(
    LIMIT_MESSAGE,
    'Has utilizado tus respuestas de voz gratuitas de hoy. Continúa por texto o desbloquea ANDERGO Premium.'
  );
});

// The backend must never trust a client-supplied "premium" flag alone - see
// lib/voiceAccessService.js#isPremiumActive. These are pure unit checks
// (no Supabase round-trip needed) that a canceled or expired subscription
// never grants neural voice, even if access_tier still says 'premium'.
test('isPremiumActive rejects a canceled subscription despite access_tier=premium', () => {
  assert.equal(
    isPremiumActive({ access_tier: 'premium', subscription_status: 'canceled', subscription_expires_at: null }),
    false
  );
});

test('isPremiumActive rejects an expired subscription despite access_tier=premium and status=active', () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  assert.equal(
    isPremiumActive({
      access_tier: 'premium',
      subscription_status: 'active',
      subscription_expires_at: yesterday
    }),
    false
  );
});

test('isPremiumActive accepts an active subscription with no expiry or a future expiry', () => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  assert.equal(
    isPremiumActive({ access_tier: 'premium', subscription_status: 'active', subscription_expires_at: null }),
    true
  );
  assert.equal(
    isPremiumActive({
      access_tier: 'premium',
      subscription_status: 'active',
      subscription_expires_at: tomorrow
    }),
    true
  );
});

test('isPremiumActive rejects a free-tier profile', () => {
  assert.equal(
    isPremiumActive({ access_tier: 'free', subscription_status: 'active', subscription_expires_at: null }),
    false
  );
  assert.equal(isPremiumActive(null), false);
});

// French A1 content shape (scripts/content/french-a1-units.js, flattened by
// scripts/build-french-a1-seed.js into lib/seed-lessons.json/seed-units.json).
// These read the seed files directly - no server/Supabase needed - mirroring
// how migrate-french-a1-units.js itself guards against a malformed seed
// before ever touching the database.
const seedUnits = require('./lib/seed-units.json');
const seedLessons = require('./lib/seed-lessons.json');

test('French A1 has exactly 12 units, in order, units 1-2 free and 3-12 premium', () => {
  const units = seedUnits
    .filter((row) => row.target_language === 'french' && row.level === 'A1')
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  assert.equal(units.length, 12);
  units.forEach((unit, index) => {
    assert.equal(unit.order_index, index + 1, `unit "${unit.slug}" should be order ${index + 1}`);
  });

  const lessonsByUnit = {};
  seedLessons
    .filter((row) => row.target_language === 'french' && row.level === 'A1')
    .forEach((row) => {
      (lessonsByUnit[row.unit_slug] = lessonsByUnit[row.unit_slug] || []).push(row);
    });

  units.forEach((unit, index) => {
    const rows = lessonsByUnit[unit.slug] || [];
    assert.ok(rows.length > 0, `expected activities for unit "${unit.slug}"`);
    const expectedTier = index < 2 ? 'free' : 'premium';
    rows.forEach((row) => {
      assert.equal(
        row.access_tier,
        expectedTier,
        `expected ${row.slug} (unit ${index + 1}) to be access_tier="${expectedTier}", got "${row.access_tier}"`
      );
    });
  });
});

test('French A1 has exactly 84 activities: 72 core skills + 12 standalone dialogues', () => {
  const rows = seedLessons.filter((row) => row.target_language === 'french' && row.level === 'A1');
  assert.equal(rows.length, 84);

  const dialogueRows = rows.filter((row) => row.skill === 'dialogue');
  assert.equal(dialogueRows.length, 12);

  const CORE_SKILLS = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];
  const unitSlugs = [...new Set(rows.map((row) => row.unit_slug))];
  assert.equal(unitSlugs.length, 12);
  unitSlugs.forEach((unitSlug) => {
    const skillsForUnit = rows.filter((row) => row.unit_slug === unitSlug).map((row) => row.skill);
    assert.deepEqual([...skillsForUnit].sort(), [...CORE_SKILLS, 'dialogue'].sort());
  });
});

test('every French A1 reading has 3 parts and exactly 8 exercises (4 mcq + 3 vrai/faux + 1 vocabulary-in-context)', () => {
  const readingRows = seedLessons.filter(
    (row) => row.target_language === 'french' && row.level === 'A1' && row.skill === 'reading'
  );
  assert.equal(readingRows.length, 12);

  readingRows.forEach((row) => {
    const reading = row.content_json.reading;
    assert.equal(reading.parts.length, 3, `${row.slug} should have 3 reading parts`);

    const exercises = row.content_json.exercises;
    assert.equal(exercises.length, 8, `${row.slug} should have 8 exercises`);

    const vraiFaux = exercises.filter(
      (ex) => Array.isArray(ex.options) && ex.options.length === 2 && ex.options.includes('Vrai')
    );
    assert.equal(vraiFaux.length, 3, `${row.slug} should have 3 vrai/faux exercises`);

    const mcqComprehension = exercises.filter((ex) => !vraiFaux.includes(ex));
    assert.equal(mcqComprehension.length, 5, `${row.slug} should have 5 remaining mcq (4 comprehension + 1 vocabulary-in-context)`);
  });
});

test('every French A1 unit has a dialogue activity with dialogue lines and comprehension questions', () => {
  const dialogueRows = seedLessons.filter(
    (row) => row.target_language === 'french' && row.level === 'A1' && row.skill === 'dialogue'
  );
  assert.equal(dialogueRows.length, 12);
  dialogueRows.forEach((row) => {
    assert.ok(row.content_json.dialogue.length > 0, `${row.slug} should have dialogue lines`);
    assert.ok(row.content_json.exercises.length > 0, `${row.slug} should have comprehension exercises`);
  });
});

// The dedicated 'dialogue' skill type is generic (see SKILL_VIEW_RENDERERS
// in src/js/script.js) - assert English A1 wasn't given any dialogue rows,
// i.e. this is additive-only for English.
test('English A1 has no dialogue-skill activities (dialogue is French-A1-only for now)', () => {
  const englishDialogueRows = seedLessons.filter(
    (row) => row.target_language === 'english' && row.skill === 'dialogue'
  );
  assert.equal(englishDialogueRows.length, 0);
});
