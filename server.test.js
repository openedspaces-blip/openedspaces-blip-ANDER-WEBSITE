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
const config = require('./lib/config');
const accessPolicy = require('./lib/accessPolicyService');
const plansConfig = require('./lib/plansConfig');
const { getSupabaseAdmin } = require('./lib/supabaseClient');
const LanguagePair = require('./src/js/language-pair');
const { sanitizeGrammarTestForClient } = require('./lib/grammarTestSanitizer');
const { gradeQuestionBank } = require('./lib/courseLessonsService');
const { isPaddlePremiumStatus } = require('./lib/subscriptionService');
const {
  isConfiguredPremiumPrice,
  isValidUuid,
  normalizeEventData,
  priceIdForBillingCycle
} = require('./lib/billingService');

const WORLD_LANGUAGES = ['english', 'spanish', 'french', 'italian', 'german'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const SKILLS = ['listening', 'speaking', 'reading', 'writing', 'grammar', 'vocabulary'];
const RUN_LIVE_AI_TESTS = process.env.RUN_LIVE_AI_TESTS === '1';
const RUN_LIVE_SUPABASE_TESTS = process.env.RUN_LIVE_SUPABASE_TESTS === '1';

test('Free access is unit-based across every CEFR level', () => {
  for (const level of ['A1', 'A2', 'B1', 'B2']) {
    assert.equal(accessPolicy.isFreeUnit(level, 1), true);
    assert.equal(accessPolicy.isFreeUnit(level, 2), true);
    assert.equal(accessPolicy.isFreeUnit(level, 3), false);
  }
  for (const level of ['C1', 'C2']) {
    assert.equal(accessPolicy.isFreeUnit(level, 1), true);
    assert.equal(accessPolicy.isFreeUnit(level, 2), false);
  }
  assert.equal(
    accessPolicy.canAccessLesson({
      level: 'C2',
      unitOrder: 12,
      entitlements: { hasFullAccess: true }
    }),
    true
  );
});

test('Tutor quotas are finite and plan-selected at 30 Free and 500 Premium', () => {
  assert.equal(plansConfig.getFeatureLimit('free', 'tutor_query'), 30);
  assert.equal(plansConfig.getFeatureLimit('premium', 'tutor_query'), 500);
});

test('Premium lock and exhausted Tutor quota use the required friendly copy', () => {
  assert.equal(accessPolicy.premiumRequiredError().message, 'Disponible en ANDERGO Premium.');
  const source = fs.readFileSync(path.join(__dirname, 'lib/server.js'), 'utf8');
  assert.match(
    source,
    /Has utilizado todas las consultas incluidas en tu plan\. Tu cuota se renovará automáticamente el próximo ciclo\./
  );
});

// The default suite validates the application contract against its bundled
// curriculum and must not change merely because a developer has production
// Supabase credentials in .env. Dedicated live tests opt in explicitly.
if (!RUN_LIVE_SUPABASE_TESTS) config.isSupabaseConfigured = false;

function startTestServer() {
  const app = createServer();
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      // Test fetch clients may keep HTTP connections alive. Destroying those
      // connections when a test closes its server keeps the default suite
      // deterministic and prevents Node's test runner from hanging.
      const close = server.close.bind(server);
      server.close = (...args) => {
        server.closeAllConnections?.();
        return close(...args);
      };
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
      (!RUN_LIVE_AI_TESTS &&
        'Set RUN_LIVE_AI_TESTS=1 to call a real AI provider') ||
      (!isTutorConfigured() &&
        'No AI provider (CEREBRAS_API_KEY/GROQ_API_KEY/GEMINI_API_KEY) is configured in this environment')
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
// see scripts/content/english-a1-units.js. Español A1 got the identical
// unit-based treatment (12 units x 6 skills = 72 activities, no separate
// 'dialogue' skill - dialogues live inside listening via listeningType:
// 'dialogue', see scripts/content/spanish-a1-units.js). French A1 got the
// same unit-based treatment plus an extra 'dialogue' skill (12 units x 7
// skills = 84 activities) - see scripts/content/french-a1-units.js and the
// dialogue_skill/dialogue_mission migration. Advanced English/French
// B2-C2 courses also use six connected skills per unit. Per-language
// expectations are deliberately kept separate (not one global constant)
// because these structures genuinely differ.
const ENGLISH_A1_ACTIVITY_COUNT = 72;
const SPANISH_A1_ACTIVITY_COUNT = 72;
const SPANISH_EXPANDED_LEVEL_ACTIVITY_COUNT = 72;
const FRENCH_A1_ACTIVITY_COUNT = 84;
const FRENCH_A2_ACTIVITY_COUNT = 70;
const FRENCH_B1_ACTIVITY_COUNT = 70;
const FRENCH_B2_ACTIVITY_COUNT = 84;
const FRENCH_C1_ACTIVITY_COUNT = 72;
const FRENCH_C2_ACTIVITY_COUNT = 72;
// English A2 (scripts/content/english-a2-units.js) is unit-based too, same
// mechanism as A1 above, just for a different level - all 10 units are now
// authored (units 1-2 free, 3-10 premium), 6 core skills each, no extra
// 'dialogue' skill (unlike French A1).
const ENGLISH_A2_ACTIVITY_COUNT = 60;
// English B1 follows a 12-unit x 6-skill course shape. Reading,
// Grammar and Vocabulary contain the richer assessed banks authored in
// scripts/content/english-b1-practice.js.
const ENGLISH_B1_ACTIVITY_COUNT = 72;
const ENGLISH_B2_ACTIVITY_COUNT = 72;
const ENGLISH_C1_ACTIVITY_COUNT = 72;
const ENGLISH_C2_ACTIVITY_COUNT = 72;
const UNIT_SKILLS_BY_LANGUAGE = { french: [...SKILLS, 'dialogue'] };
const LEVEL_SKILLS_BY_LANGUAGE = {
  english: {
    B2: SKILLS,
    C1: SKILLS,
    C2: SKILLS
  },
  french: {
    C1: SKILLS,
    C2: SKILLS
  }
};
// Per-language, per-level override for languages/levels with real unit-based
// content instead of the flat 6-lessons-per-level fallback shape. Any
// language/level combo not listed here is assumed to be the flat shape.
const LEVEL_ACTIVITY_COUNT_BY_LANGUAGE = {
  english: {
    A1: ENGLISH_A1_ACTIVITY_COUNT,
    A2: ENGLISH_A2_ACTIVITY_COUNT,
    B1: ENGLISH_B1_ACTIVITY_COUNT,
    B2: ENGLISH_B2_ACTIVITY_COUNT,
    C1: ENGLISH_C1_ACTIVITY_COUNT,
    C2: ENGLISH_C2_ACTIVITY_COUNT
  },
  spanish: {
    A1: SPANISH_A1_ACTIVITY_COUNT,
    A2: SPANISH_EXPANDED_LEVEL_ACTIVITY_COUNT,
    B1: SPANISH_EXPANDED_LEVEL_ACTIVITY_COUNT,
    B2: SPANISH_EXPANDED_LEVEL_ACTIVITY_COUNT,
    C1: SPANISH_EXPANDED_LEVEL_ACTIVITY_COUNT,
    C2: SPANISH_EXPANDED_LEVEL_ACTIVITY_COUNT
  },
  french: {
    A1: FRENCH_A1_ACTIVITY_COUNT,
    A2: FRENCH_A2_ACTIVITY_COUNT,
    B1: FRENCH_B1_ACTIVITY_COUNT,
    B2: FRENCH_B2_ACTIVITY_COUNT,
    C1: FRENCH_C1_ACTIVITY_COUNT,
    C2: FRENCH_C2_ACTIVITY_COUNT
  }
};

function unitSkillsFor(language, level = 'A1') {
  const levelSkills = (LEVEL_SKILLS_BY_LANGUAGE[language] || {})[level];
  if (levelSkills) return levelSkills;
  return UNIT_SKILLS_BY_LANGUAGE[language] || SKILLS;
}

function expectedActivityCountFor(language, level) {
  return (LEVEL_ACTIVITY_COUNT_BY_LANGUAGE[language] || {})[level] ?? 6;
}

test('fallback worlds preserve each language-level course structure and lesson count', () => {
  for (const language of WORLD_LANGUAGES) {
    const lessons = getLocalLessons(language);
    const expectedTotal = LEVELS.reduce(
      (sum, level) => sum + expectedActivityCountFor(language, level),
      0
    );
    assert.equal(lessons.length, expectedTotal);

    for (const level of LEVELS) {
      const levelLessons = lessons.filter((lesson) => lesson.level === level);
      const expectedLevelCount = expectedActivityCountFor(language, level);
      assert.equal(levelLessons.length, expectedLevelCount);
      const expectedSkills = unitSkillsFor(language, level);
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

test('lessons endpoint returns expanded A1 worlds for every supported language (English/Español: 12 units x 6 skills, French: 12 units x 7 skills)', async () => {
  const { server, port } = await startTestServer();
  try {
    for (const language of WORLD_LANGUAGES) {
      const response = await fetch(
        `http://127.0.0.1:${port}/api/lessons?level=A1&language=${language}`
      );
      assert.equal(response.status, 200);
      const body = await response.json();
      // Español A1's 72-activity content (scripts/content/spanish-a1-units.js,
      // migrated via scripts/migrate-spanish-a1-units.js) is now live, so the
      // endpoint serves the same expanded structure as English/French A1.
      const expectedCount = expectedActivityCountFor(language, 'A1');
      assert.equal(body.lessons.length, expectedCount);
      assert.deepEqual(
        [...new Set(body.lessons.map((lesson) => lesson.skill))].sort(),
        [...unitSkillsFor(language)].sort()
      );
      // Every unit-based A1 course migrated into the normalized Supabase
      // schema carries a unitId on each activity - English, French, and
      // now Español (scripts/migrate-spanish-a1-units.js has been run
      // against this environment's Supabase project).
      if (language === 'english' || language === 'french' || language === 'spanish') {
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

test('normalized lesson completion returns the persisted seven-activity course snapshot', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'lib', 'server.js'), 'utf8');
  const clientSource = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');

  assert.match(
    serverSource,
    /res\.json\(await withFreshCourseProgress\(req\.user\.id, result\)\)/
  );
  assert.match(
    serverSource,
    /courseProgress:\s*dashboard\.courseProgress/
  );
  assert.match(
    clientSource,
    /activeLesson\.completed = true;[\s\S]{0,700}loadDashboard\(\);/
  );
  const persistedCompletionRefreshes =
    clientSource.match(
      /lesson\.completed = true;[\s\S]{0,300}renderLearningPath\(\);[\s\S]{0,80}loadDashboard\(\);/g
    ) || [];
  assert.ok(
    persistedCompletionRefreshes.length >= 3,
    'Reading, Grammar and Listening must refresh route and dashboard progress after saving'
  );
});

test('the seven-activity route remains touch-friendly and readable on phones', () => {
  const css = fs.readFileSync(path.join(__dirname, 'src', 'css', 'styles.css'), 'utf8');
  assert.match(
    css,
    /@media \(max-width: 560px\)[\s\S]*?\.unit-route-markers\s*\{[\s\S]*?grid-template-columns:\s*repeat\(7,\s*76px\)/
  );
  assert.match(css, /\.unit-route-marker\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(
    css,
    /\.unit-activity-footer-actions button\s*\{[\s\S]*?min-height:\s*44px/
  );
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('paid speech synthesize endpoint is disabled', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/speech/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello!', language: 'english', locale: 'en-US' })
    });
    assert.equal(response.status, 404);
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

// English A2 Phase 1 content shape (scripts/content/english-a2-units.js,
// flattened by scripts/build-english-a2-seed.js). Only Unit 1 (Everyday
// Life) exists so far - these checks are written to keep passing as units
// 2-10 are added in later phases (no hardcoded "10 units" expectation yet),
// while guarding the hard rules from the spec this content was written
// against: no true/false, no ordering, no drag-drop, single-view readings
// (no `parts`), every mcq has exactly 4 options and a valid answer index.
test('English A2 units are in order, and Phase 1 units 1-2 are free', () => {
  const units = seedUnits
    .filter((row) => row.target_language === 'english' && row.level === 'A2')
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  assert.ok(units.length >= 1, 'expected at least Unit 1 (Everyday Life)');
  units.forEach((unit, index) => {
    assert.equal(unit.order_index, index + 1, `unit "${unit.slug}" should be order ${index + 1}`);
  });

  const lessonsByUnit = {};
  seedLessons
    .filter((row) => row.target_language === 'english' && row.level === 'A2')
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

// Every check below runs across all currently-authored A2 units (not just
// Unit 1) - scripts/content/english-a2-units.js is written in batches (see
// its header comment), so this keeps passing as later batches add units
// 5-10 without needing another update here.
const englishA2UnitSlugs = [
  ...new Set(
    seedLessons
      .filter((row) => row.target_language === 'english' && row.level === 'A2')
      .map((row) => row.unit_slug)
  )
];

test('English A2 units each have all 6 core skills, each a real (non-generic) activity', () => {
  const CORE_SKILLS = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];
  englishA2UnitSlugs.forEach((unitSlug) => {
    const rows = seedLessons.filter(
      (row) => row.target_language === 'english' && row.level === 'A2' && row.unit_slug === unitSlug
    );
    assert.deepEqual([...rows.map((r) => r.skill)].sort(), [...CORE_SKILLS].sort(), unitSlug);
    rows.forEach((row) => {
      assert.notEqual(row.title.trim(), '', `${row.slug} must have a real title`);
      assert.ok(
        !/^A2 (Reading|Listening|Speaking|Writing|Grammar|Vocabulary):/.test(row.title),
        `${row.slug} must not be a generic placeholder title`
      );
    });
  });
});

test('English A2 readings are each a single 350-550 word view, no parts/ordering, 8 mcq comprehension questions', () => {
  englishA2UnitSlugs.forEach((unitSlug) => {
    const row = seedLessons.find(
      (r) =>
        r.target_language === 'english' &&
        r.level === 'A2' &&
        r.unit_slug === unitSlug &&
        r.skill === 'reading'
    );
    assert.ok(row, `expected a reading activity for unit "${unitSlug}"`);
    const reading = row.content_json.reading;
    assert.ok(!reading.parts, `${unitSlug}: A2 readings must not be split into parts`);
    assert.equal(row.content_json.exercises.length, 8, unitSlug);

    const wordCount = reading.text.split(/\s+/).filter(Boolean).length;
    assert.ok(
      wordCount >= 350 && wordCount <= 550,
      `${unitSlug}: expected 350-550 words, got ${wordCount}`
    );
  });
});

test('English A2 grammar/vocabulary have the required question-bank sizes, and no true/false or ordering anywhere', () => {
  englishA2UnitSlugs.forEach((unitSlug) => {
    const rows = seedLessons.filter(
      (r) => r.target_language === 'english' && r.level === 'A2' && r.unit_slug === unitSlug
    );
    const grammarRow = rows.find((r) => r.skill === 'grammar');
    const vocabRow = rows.find((r) => r.skill === 'vocabulary');

    assert.ok(
      grammarRow.content_json.exercises.length >= 10 && grammarRow.content_json.exercises.length <= 15,
      unitSlug
    );
    assert.ok(
      vocabRow.content_json.vocabulary.length >= 18 && vocabRow.content_json.vocabulary.length <= 25,
      unitSlug
    );
    assert.ok(
      vocabRow.content_json.exercises.length >= 10 && vocabRow.content_json.exercises.length <= 15,
      unitSlug
    );

    rows.forEach((row) => {
      assert.equal('ordering' in (row.content_json.reading || {}), false, `${row.slug} must not use ordering`);
      (row.content_json.exercises || [])
        .filter((ex) => ex.type === 'mcq')
        .forEach((ex, index) => {
          assert.equal(ex.options.length, 4, `${row.slug} exercise #${index} must have exactly 4 options`);
          assert.ok(
            Number.isInteger(ex.answer) && ex.answer >= 0 && ex.answer <= 3,
            `${row.slug} exercise #${index} must have a valid 0-3 answer index`
          );
          const looksTrueFalse =
            ex.options.length === 2 || ex.options.map((o) => o.toLowerCase()).includes('true');
          assert.equal(looksTrueFalse, false, `${row.slug} exercise #${index} must not be true/false`);
        });
    });
  });
});

test('pricing UI always renders Free and recommended Premium plans with Paddle checkout choices', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.match(html, /class="plan free-plan"/);
  assert.match(html, /class="plan premium-plan"/);
  assert.match(html, /data-premium-plan-badge>Recomendado/);
  assert.match(html, /data-billing-cycle="monthly"/);
  assert.match(html, /data-billing-cycle="quarterly"/);
  assert.doesNotMatch(html, /class="current-plan-summary"/);
  assert.doesNotMatch(html, /class="secondary-btn current-plan-toggle"/);
});

test('public Paddle config exposes checkout identifiers but never server secrets', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/billing/config`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.provider, 'paddle');
    assert.equal(typeof body.checkoutConfigured, 'boolean');
    assert.equal(Object.hasOwn(body, 'apiKey'), false);
    assert.equal(Object.hasOwn(body, 'webhookSecret'), false);
  } finally {
    server.close();
  }
});

test('Paddle checkout is authenticated and the browser opens only a server-created transaction', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/billing/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billingCycle: 'monthly' })
    });
    assert.equal(response.status, 401);

    const source = fs.readFileSync(path.join(__dirname, 'src/js/script.js'), 'utf8');
    assert.match(source, /\/api\/billing\/checkout/);
    assert.match(source, /transactionId:\s*transaction\.transactionId/);
    assert.doesNotMatch(source, /customData:\s*\{\s*user_id:\s*authStatus\.user\.id/);
  } finally {
    server.close();
  }
});

test('Paddle billing cycles map only to server-configured prices', () => {
  const previousMonthlyPriceId = config.paddle.monthlyPriceId;
  const previousQuarterlyPriceId = config.paddle.quarterlyPriceId;
  config.paddle.monthlyPriceId = 'pri_monthly';
  config.paddle.quarterlyPriceId = 'pri_quarterly';
  try {
    assert.equal(priceIdForBillingCycle('monthly'), 'pri_monthly');
    assert.equal(priceIdForBillingCycle('quarterly'), 'pri_quarterly');
    assert.equal(priceIdForBillingCycle('annual'), null);
  } finally {
    config.paddle.monthlyPriceId = previousMonthlyPriceId;
    config.paddle.quarterlyPriceId = previousQuarterlyPriceId;
  }
});

test('Paddle Premium states fail closed for past due, paused, canceled and unknown values', () => {
  assert.equal(isPaddlePremiumStatus('active'), true);
  assert.equal(isPaddlePremiumStatus('trialing'), true);
  assert.equal(isPaddlePremiumStatus('past_due'), false);
  assert.equal(isPaddlePremiumStatus('paused'), false);
  assert.equal(isPaddlePremiumStatus('canceled'), false);
  assert.equal(isPaddlePremiumStatus('something_new'), false);
});

test('Paddle event normalization preserves authenticated user and subscription references', () => {
  const previousMonthlyPriceId = config.paddle.monthlyPriceId;
  const previousQuarterlyPriceId = config.paddle.quarterlyPriceId;
  config.paddle.monthlyPriceId = 'pri_monthly';
  config.paddle.quarterlyPriceId = 'pri_quarterly';
  const userId = '1b2c3d4e-5f60-4789-8abc-def012345678';
  try {
    const normalized = normalizeEventData({
      eventType: 'subscription.updated',
      occurredAt: '2026-07-26T12:00:00.000Z',
      data: {
        id: 'sub_01',
        customerId: 'ctm_01',
        status: 'active',
        customData: { user_id: userId, plan: 'monthly' },
        currentBillingPeriod: {
          startsAt: '2026-07-01T00:00:00.000Z',
          endsAt: '2026-10-01T00:00:00.000Z'
        },
        items: [{ price: { id: 'pri_quarterly' } }]
      }
    });
    assert.equal(isValidUuid(userId), true);
    assert.equal(isValidUuid('not-a-user'), false);
    assert.equal(isConfiguredPremiumPrice('pri_quarterly'), true);
    assert.equal(isConfiguredPremiumPrice('pri_other'), false);
    assert.equal(normalized.userId, userId);
    assert.equal(normalized.paddleSubscriptionId, 'sub_01');
    assert.equal(normalized.paddleCustomerId, 'ctm_01');
    assert.equal(normalized.plan, 'quarterly');
    assert.equal(normalized.status, 'active');
  } finally {
    config.paddle.monthlyPriceId = previousMonthlyPriceId;
    config.paddle.quarterlyPriceId = previousQuarterlyPriceId;
  }
});

test('Paddle webhook is POST-only and rejects an unsigned raw body', async () => {
  const { server, port } = await startTestServer();
  try {
    const getResponse = await fetch(`http://127.0.0.1:${port}/api/paddle/webhook`);
    assert.equal(getResponse.status, 405);

    const unsignedResponse = await fetch(`http://127.0.0.1:${port}/api/paddle/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'subscription.updated' })
    });
    assert.equal(unsignedResponse.status, 400);
  } finally {
    server.close();
  }
});

test('French C1 has 12 units organized across all six core skills', () => {
  const units = seedUnits
    .filter((row) => row.target_language === 'french' && row.level === 'C1')
    .sort((a, b) => a.order_index - b.order_index);
  const lessons = seedLessons.filter(
    (row) => row.target_language === 'french' && row.level === 'C1'
  );
  assert.equal(units.length, 12);
  assert.equal(lessons.length, 72);

  units.forEach((unit, index) => {
    assert.equal(unit.order_index, index + 1);
    const rows = lessons.filter((row) => row.unit_slug === unit.slug);
    assert.deepEqual(
      [...rows.map((row) => row.skill)].sort(),
      [...SKILLS].sort()
    );
    const reading = rows.find((row) => row.skill === 'reading');
    const wordCount = reading.content_json.reading.text.split(/\s+/).filter(Boolean).length;
    assert.ok(wordCount >= 400 && wordCount <= 650, `${unit.slug}: ${wordCount} words`);
    rows.forEach((row) => {
      (row.content_json.exercises || [])
        .filter((exercise) => exercise.type === 'mcq')
        .forEach((exercise) => {
          assert.equal(exercise.options.length, 4);
          assert.ok(Number.isInteger(exercise.answer) && exercise.answer >= 0 && exercise.answer <= 3);
        });
    });
  });
});

test('French A1 dialogues are integrated into Expression orale with one clear listening action, optional L1 support and comprehension', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'src', 'css', 'styles.css'), 'utf8');
  const dialogueMarkup =
    source.match(/function renderDialogueModeHtml\(dialogueSource\) \{([\s\S]*?)\n\}/)?.[1] || '';
  assert.match(source, /item\.skill === 'dialogue'/);
  assert.match(source, /Dialogue de l’unité/);
  assert.match(source, /Écouter tout le dialogue/);
  assert.doesNotMatch(dialogueMarkup, /dialogue-modes|Jouer un rôle|dialogue-roleplay-panel/);
  assert.match(source, /Afficher l’aide en espagnol/);
  assert.match(source, /Questions de compréhension/);
  assert.match(css, /\.dialogue-section-header/);
  assert.match(dialogueMarkup, /dialogue-practical-guide/);
  assert.match(dialogueMarkup, /dialogue-practice-line-btn/);
  assert.doesNotMatch(dialogueMarkup, /dialogue-final-challenge/);
  assert.match(dialogueMarkup, /<details class="dialogue-phrases">/);
  assert.match(source, /pronunciationOverride/);
  assert.match(css, /\.dialogue-practical-guide/);
});

test('Reading route navigation is placed beside evaluation before tutor tools', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'src', 'css', 'styles.css'), 'utf8');
  assert.match(source, /content\.querySelector\('\.reading-comp-actions'\)/);
  assert.match(source, /readingQuizActions\.append\(footer\)/);
  assert.match(source, /unit-activity-footer--reading-inline/);
  assert.match(css, /\.unit-activity-footer--reading-inline/);
});

test('Learning activities keep a visible language level and lesson context bar', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'src', 'css', 'styles.css'), 'utf8');
  assert.match(source, /function buildLearningRouteContextHtml/);
  assert.match(source, /activity-route-context no-print/);
  assert.match(source, /english: 'English'/);
  assert.match(source, /routeContext\.innerHTML = buildLearningRouteContextHtml\(lesson\)/);
  assert.match(css, /\.activity-route-context/);
});

test('Skill header and unit mission route use a compact visual density', () => {
  const css = fs.readFileSync(path.join(__dirname, 'src', 'css', 'styles.css'), 'utf8');
  assert.match(css, /Compact learning context/);
  assert.match(css, /\.skill-view-section > \.level-tabs\s*\{[\s\S]*?display: none/);
  assert.match(css, /\.skill-view-header\s*\{[\s\S]*?padding: 0\.55rem 0\.8rem/);
  assert.match(css, /\.skill-view-actions \.secondary-btn,[\s\S]*?background: transparent/);
  assert.match(css, /\.unit-mission-strip\s*\{[\s\S]*?padding: 0\.6rem 0\.8rem/);
  assert.match(css, /\.unit-mission-route-btn/);
  assert.match(css, /width: 1\.35rem;\s*\r?\n\s*height: 1\.35rem/);
});

test('server-side paid TTS is disabled and cannot generate billable audio', () => {
  const source = fs.readFileSync(path.join(__dirname, 'lib', 'ttsService.js'), 'utf8');
  const packageJson = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
  const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
  assert.match(source, /function ttsProvider\(\) \{\s*return 'browser'/);
  assert.match(source, /error\.code = 'SYSTEM_TTS_ONLY'/);
  assert.match(source, /function isElevenLabsConfigured\(\) \{\s*return false/);
  assert.doesNotMatch(packageJson, /@elevenlabs\/elevenlabs-js/);
  assert.doesNotMatch(envExample, /ELEVENLABS_API_KEY/);
});

test('Reading and Tutor use system TTS without paid speech endpoints', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const server = fs.readFileSync(path.join(__dirname, 'lib', 'server.js'), 'utf8');
  assert.doesNotMatch(server, /app\.post\('\/api\/speech\/reading'/);
  assert.doesNotMatch(server, /app\.post\('\/api\/speech\/synthesize'/);
  assert.doesNotMatch(source, /\/api\/speech\/reading/);
  assert.doesNotMatch(source, /\/api\/speech\/synthesize/);
  assert.doesNotMatch(source, /neuralAudio/);
  assert.match(source, /const preferredVoices = getReadingVoicesForLocale\(utterance\.lang\)/);
  assert.match(source, /Google français/);
  assert.match(source, /if \(!supportsSpeech\(\)\) return;/);
});

test('homepage visibly restores the Free and Premium plan comparison', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(html, /<section id="premium" class="section pricing-section">/);
  assert.match(html, /<div class="pricing-details">/);
  assert.match(html, /<h3>ANDERGO Premium<\/h3>/);
  assert.match(html, /data-premium-monthly-price/);
  assert.match(html, /plan trimestral disponible/);
  assert.match(source, /home:\s*\['\.hero', '#language-picker', '#premium'\]/);
  assert.match(source, /setPricingExpanded\(resolved === 'home'\)/);
});

test('French C2 has 12 CEFR mastery units entirely in French across all six core skills', () => {
  const units = seedUnits
    .filter((row) => row.target_language === 'french' && row.level === 'C2')
    .sort((a, b) => a.order_index - b.order_index);
  const lessons = seedLessons.filter(
    (row) => row.target_language === 'french' && row.level === 'C2'
  );
  assert.equal(units.length, 12);
  assert.equal(lessons.length, 72);

  units.forEach((unit, index) => {
    assert.equal(unit.order_index, index + 1);
    const rows = lessons.filter((row) => row.unit_slug === unit.slug);
    assert.deepEqual([...rows.map((row) => row.skill)].sort(), [
      ...[...SKILLS].sort()
    ]);
    const reading = rows.find((row) => row.skill === 'reading');
    const vocabulary = rows.find((row) => row.skill === 'vocabulary');
    const grammar = rows.find((row) => row.skill === 'grammar');
    const wordCount = reading.content_json.reading.text.split(/\s+/).filter(Boolean).length;
    assert.ok(wordCount >= 650 && wordCount <= 950, `${unit.slug}: ${wordCount} words`);
    assert.equal(reading.content_json.exercises.length, 10);
    assert.equal(vocabulary.content_json.vocabulary.length, 12);
    assert.equal(vocabulary.content_json.exercises.length, 12);
    assert.equal(reading.content_json.reading.parts.length, 6);
    assert.match(vocabulary.title, /^Le lexique de l’unité/);
    assert.equal(grammar.content_json.exercises.length, 8);
    assert.equal(grammar.content_json.extra.grammarTest.questions.length, 8);
    assert.ok(grammar.content_json.extra.grammarProfile);

    vocabulary.content_json.vocabulary.forEach((item) => {
      assert.ok(item.definition);
      assert.equal(item.translation, item.definition);
    });
    [reading, vocabulary, grammar].forEach((row) => {
      assert.equal(row.content_json.language, 'Français');
      (row.content_json.exercises || []).forEach((exercise) => {
        assert.equal(exercise.type, 'mcq');
        assert.equal(exercise.options.length, 4);
        assert.ok(Number.isInteger(exercise.answer) && exercise.answer >= 0 && exercise.answer <= 3);
      });
    });
  });
});

test('English B1 has 12 complete units with assessed Reading, Grammar and Vocabulary', () => {
  const units = seedUnits
    .filter((row) => row.target_language === 'english' && row.level === 'B1')
    .sort((a, b) => a.order_index - b.order_index);
  const lessons = seedLessons.filter(
    (row) => row.target_language === 'english' && row.level === 'B1'
  );

  assert.equal(units.length, 12);
  assert.equal(lessons.length, 72);
  units.forEach((unit, index) => {
    assert.equal(unit.order_index, index + 1);
    const rows = lessons.filter((row) => row.unit_slug === unit.slug);
    assert.deepEqual([...rows.map((row) => row.skill)].sort(), [...SKILLS].sort());

    const reading = rows.find((row) => row.skill === 'reading');
    const grammar = rows.find((row) => row.skill === 'grammar');
    const vocabulary = rows.find((row) => row.skill === 'vocabulary');
    assert.equal(reading.content_json.exercises.length, 6, `${unit.slug} reading`);
    assert.equal(grammar.content_json.exercises.length, 8, `${unit.slug} grammar`);
    assert.equal(vocabulary.content_json.vocabulary.length, 12, `${unit.slug} vocabulary`);
    assert.equal(vocabulary.content_json.exercises.length, 12, `${unit.slug} vocabulary exercises`);
    assert.equal(grammar.content_json.extra.grammarTest.questions.length, 15, `${unit.slug} test`);
    vocabulary.content_json.vocabulary.forEach((item) => {
      assert.equal(item.contexts.length, 3, `${unit.slug} ${item.word} subflashcards`);
    });
    assert.match(grammar.content_json.grammar, /Goal:/);
    assert.match(grammar.content_json.grammar, /Pattern:/);
    assert.match(grammar.content_json.grammar, /Common mistakes:/);

    [reading, grammar, vocabulary].forEach((row) => {
      row.content_json.exercises.forEach((exercise, exerciseIndex) => {
        assert.equal(exercise.type, 'mcq');
        assert.equal(exercise.options.length, 4, `${row.slug} #${exerciseIndex}`);
        assert.ok(Number.isInteger(exercise.answer) && exercise.answer >= 0 && exercise.answer <= 3);
      });
    });
  });
});

test('English C1 has 12 scientific-social units across all six core skills', () => {
  const units = seedUnits
    .filter((row) => row.target_language === 'english' && row.level === 'C1')
    .sort((a, b) => a.order_index - b.order_index);
  const lessons = seedLessons.filter(
    (row) => row.target_language === 'english' && row.level === 'C1'
  );

  assert.equal(units.length, 12);
  assert.equal(lessons.length, 72);
  units.forEach((unit, index) => {
    assert.equal(unit.order_index, index + 1);
    const rows = lessons.filter((row) => row.unit_slug === unit.slug);
    assert.deepEqual(
      [...rows.map((row) => row.skill)].sort(),
      [...SKILLS].sort()
    );
    const reading = rows.find((row) => row.skill === 'reading');
    const vocabulary = rows.find((row) => row.skill === 'vocabulary');
    const grammar = rows.find((row) => row.skill === 'grammar');
    const wordCount = reading.content_json.reading.text.split(/\s+/).filter(Boolean).length;
    assert.ok(wordCount >= 300, `${unit.slug}: expected an extended C1 reading`);
    assert.equal(reading.content_json.exercises.length, 10);
    assert.equal(vocabulary.content_json.vocabulary.length, 8);
    assert.equal(vocabulary.content_json.exercises.length, 8);
    assert.equal(grammar.content_json.exercises.length, 8);
    assert.equal(grammar.content_json.extra.grammarTest.questions.length, 20);
    assert.ok(grammar.content_json.extra.grammarProfile);
    [reading, vocabulary, grammar].forEach((row) => {
      row.content_json.exercises.forEach((exercise) => {
        assert.equal(exercise.type, 'mcq');
        assert.equal(exercise.options.length, 4);
        assert.ok(Number.isInteger(exercise.answer) && exercise.answer >= 0 && exercise.answer <= 3);
      });
    });
  });
});

test('English C1 scientific readings include structured HTTPS references', () => {
  const { units } = require('./scripts/content/english-c1-units');
  for (const unit of units) {
    const references = unit.activities.reading.reading.references;
    assert.ok(Array.isArray(references) && references.length > 0, `${unit.slug} must include references`);
    for (const reference of references) {
      assert.ok(reference.author, `${unit.slug} reference needs an author`);
      assert.ok(reference.title, `${unit.slug} reference needs a title`);
      assert.ok(Number.isInteger(reference.year), `${unit.slug} reference needs a numeric year`);
      assert.match(reference.url, /^https:\/\//, `${unit.slug} reference must use HTTPS`);
    }
  }
});

test('English C2 has 12 mastery units with all six core skills', () => {
  const units = seedUnits.filter((row) => row.target_language === 'english' && row.level === 'C2');
  const lessons = seedLessons.filter((row) => row.target_language === 'english' && row.level === 'C2');
  assert.equal(units.length, 12);
  assert.equal(lessons.length, 72);
  for (const unit of units) {
    const rows = lessons.filter((row) => row.unit_slug === unit.slug);
    assert.deepEqual([...rows.map((row) => row.skill)].sort(), [...SKILLS].sort());
    const reading = rows.find((row) => row.skill === 'reading');
    const vocabulary = rows.find((row) => row.skill === 'vocabulary');
    const grammar = rows.find((row) => row.skill === 'grammar');
    assert.ok(reading.content_json.reading.text.split(/\s+/).length >= 680);
    assert.ok(
      Array.isArray(reading.content_json.reading.references) &&
        reading.content_json.reading.references.length > 0,
      `${unit.slug} must include academic references`
    );
    reading.content_json.reading.references.forEach((reference) => {
      assert.ok(reference.author, `${unit.slug} reference needs an author`);
      assert.ok(reference.title, `${unit.slug} reference needs a title`);
      assert.match(reference.url, /^https:\/\//, `${unit.slug} reference must use HTTPS`);
    });
    assert.deepEqual(
      reading.content_json.extra.readingReferences,
      reading.content_json.reading.references,
      `${unit.slug} references must be persisted for the database-backed lesson`
    );
    assert.equal(reading.content_json.exercises.length, 12);
    assert.equal(vocabulary.content_json.vocabulary.length, 12);
    assert.equal(vocabulary.content_json.exercises.length, 12);
    assert.equal(grammar.content_json.extra.grammarTest.questions.length, 20);
    assert.ok(grammar.content_json.extra.grammarProfile);
    grammar.content_json.extra.grammarTest.questions.forEach((question) => {
      assert.equal(question.type, 'mcq');
      assert.equal(question.options.length, 4);
    });
  }
});

test('English C2 academic readings include persisted structured HTTPS references', () => {
  const units = seedUnits.filter((row) => row.target_language === 'english' && row.level === 'C2');
  const lessons = seedLessons.filter(
    (row) => row.target_language === 'english' && row.level === 'C2' && row.skill === 'reading'
  );
  assert.equal(units.length, 12);
  assert.equal(lessons.length, 12);
  lessons.forEach((lesson) => {
    const references = lesson.content_json.reading.references;
    assert.ok(Array.isArray(references) && references.length > 0, `${lesson.slug} needs references`);
    references.forEach((reference) => {
      assert.ok(reference.author);
      assert.ok(reference.title);
      assert.match(reference.url, /^https:\/\//);
    });
    assert.deepEqual(lesson.content_json.extra.readingReferences, references);
  });
});

test('Reading selection guidance appears at the foot of the article after References', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const renderBody = source.match(/function renderReadingView\(section, lesson\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(renderBody, 'expected renderReadingView()');
  assert.ok(
    renderBody.indexOf('${referencesHtml}') < renderBody.indexOf('reading-selection-hint--footer'),
    'the selection guidance must be rendered after References'
  );
});

test('Reading declares pagination state before rendering the lesson body', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const body = source.match(/function renderReadingView\(section, lesson\) \{([\s\S]*?)\n\}/)?.[1] || '';
  const declarations = body.indexOf('const allParagraphs = getReadingParagraphs(lesson)');
  const transcript = body.indexOf("const readingTranscript = allParagraphs.join(' ')");
  assert.ok(declarations >= 0, 'Reading must declare allParagraphs');
  assert.match(body, /const readingSection = getReadingSectionState\(lesson\)/);
  assert.match(body, /const isFinalReadingSection =/);
  assert.ok(transcript > declarations, 'pagination declarations must precede transcript rendering');
});

test('B2, C1 and C2 force the effective interface language and learning mode to L2', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(source, /function isAdvancedImmersionLevel[\s\S]*?level === 'B2' \|\| level === 'C1' \|\| level === 'C2'/);
  assert.match(source, /function getEffectiveInterfaceLanguage[\s\S]*?learningPathState\.language[\s\S]*?learningPathState\.bridgeLanguage/);
  const syncBody = source.match(/function syncLearningMode\(\) \{([\s\S]*?)\n\}/)?.[1];
  assert.match(syncBody, /isAdvancedImmersionLevel\(\)[\s\S]*?'direct'/);
  const applyBody = source.match(/function applyInterfaceLanguage\(bridgeLanguage\) \{([\s\S]*?)\n\}/)?.[1];
  assert.match(applyBody, /getEffectiveInterfaceLanguage\(\)/);
});

test('English Grammar A1-C2 follows the unified profile and exact exam sizes', () => {
  const expected = { A1: 10, A2: 10, B1: 15, B2: 15, C1: 20, C2: 20 };
  for (const [level, questionCount] of Object.entries(expected)) {
    const rows = seedLessons.filter(
      (row) => row.target_language === 'english' && row.level === level && row.skill === 'grammar'
    );
    assert.ok(rows.length > 0, `${level}: missing Grammar lessons`);
    for (const row of rows) {
      const profile = row.content_json.extra.grammarProfile;
      assert.equal(row.title, profile.name, `${row.slug}: title must be the grammar name`);
      for (const key of ['definition', 'structure', 'function', 'examples']) {
        assert.ok(profile[key]?.length, `${row.slug}: missing ${key}`);
      }
      assert.equal(row.content_json.extra.grammarTest.questions.length, questionCount);
    }
  }
});

test('Grammar UI shows definition, structure, function and practical examples before assessment', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const body = source.match(/function renderGrammarConceptCards\(lesson\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(body);
  assert.match(body, /label: french \? 'Définition' : 'Definition'/);
  assert.match(body, /label: 'Structure'/);
  assert.match(body, /label: french \? 'Emploi en français' : 'Function in English'/);
  assert.match(body, /label: french \? 'Exemples' : 'Practical examples'/);
  assert.match(source, /french \? 'Bonnes réponses' : 'Correct answers'/);
  assert.match(source, /grammar-test-breakdown-list/);
  assert.match(source, /result\.score\}\/100/);
  assert.match(source, /function renderGrammarQuickIntroHtml/);
  assert.match(source, /\$\{renderGrammarQuickIntroHtml\(lesson, test\)\}/);
  assert.match(source, /preferredKeys = \['rule', 'use', 'goal', 'pattern', 'examples', 'common-mistakes'\]/);
  assert.doesNotMatch(
    source.match(/function renderGrammarTestInstructionsHtml[\s\S]*?\n\}/)?.[0] || '',
    /renderGrammarLessonContentHtml/
  );
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

// ---------------------------------------------------------------------
// English A1/A2 Grammar assessments (scripts/content/english-a1-units.js
// and english-a2-units.js, flattened into lib/seed-lessons.json's
// `content_json.extra.grammarTest`). Every Grammar lesson now carries a
// scored, level-sized multiple-choice-only test bank - see
// lib/grammarTestSanitizer.js (never ships correctOptionId/explanation-of-
// the-answer before submission) and lib/courseLessonsService.js's
// gradeQuestionBank (the score-out-of-100 formula). These checks read the
// seed file / pure grading function directly, exactly like the English A2
// question-bank tests above, so they pass regardless of whether Supabase
// has been re-seeded with this content yet.
function grammarTestBankFor(languageCode, levelCode, unitSlug) {
  const row = seedLessons.find(
    (r) =>
      r.target_language === languageCode &&
      r.level === levelCode &&
      r.unit_slug === unitSlug &&
      r.skill === 'grammar'
  );
  return row && row.content_json.extra && row.content_json.extra.grammarTest;
}

function assertWellFormedGrammarTest(bank, label, expectedCount = 10) {
  assert.ok(bank, `${label}: expected a grammarTest question bank`);
  assert.equal(bank.questions.length, expectedCount, `${label}: unexpected question count`);

  const questionIds = new Set();
  const correctPositions = [];
  bank.questions.forEach((question) => {
    assert.equal(question.type, 'mcq', `${label}/${question.id}: every question must be multiple choice`);
    assert.equal(questionIds.has(question.id), false, `${label}: duplicate question id "${question.id}"`);
    questionIds.add(question.id);

    assert.equal(question.options.length, 4, `${label}/${question.id}: expected exactly 4 options`);
    const optionIds = new Set(question.options.map((o) => o.id));
    assert.equal(optionIds.size, 4, `${label}/${question.id}: duplicate option ids`);
    assert.ok(
      optionIds.has(question.correctOptionId),
      `${label}/${question.id}: correctOptionId must reference one of the 4 options`
    );
    assert.ok(question.explanation && question.explanation.trim().length > 0, `${label}/${question.id}: missing explanation`);
    correctPositions.push(question.options.findIndex((o) => o.id === question.correctOptionId));
  });

  const distinctPositions = new Set(correctPositions);
  assert.ok(
    distinctPositions.size >= 2,
    `${label}: correct answers must not always sit in the same option position`
  );
}

test('English A1 has exactly 12 units, each with a Grammar lesson carrying a well-formed 10-question multiple-choice test', () => {
  const englishA1UnitSlugs = [
    ...new Set(seedLessons.filter((r) => r.target_language === 'english' && r.level === 'A1').map((r) => r.unit_slug))
  ];
  assert.equal(englishA1UnitSlugs.length, 12);
  englishA1UnitSlugs.forEach((unitSlug) => {
    const bank = grammarTestBankFor('english', 'A1', unitSlug);
    assertWellFormedGrammarTest(bank, `english-a1-${unitSlug}`);
  });
});

test('English A1 grammarTest question banks never leak the answer key through the client sanitizer', () => {
  const englishA1UnitSlugs = [
    ...new Set(seedLessons.filter((r) => r.target_language === 'english' && r.level === 'A1').map((r) => r.unit_slug))
  ];
  englishA1UnitSlugs.forEach((unitSlug) => {
    const bank = grammarTestBankFor('english', 'A1', unitSlug);
    const sanitized = sanitizeGrammarTestForClient(bank);
    assert.equal(sanitized.questions.length, 10);
    sanitized.questions.forEach((question) => {
      assert.equal('correctOptionId' in question, false, `${unitSlug}/${question.id}: leaks correctOptionId`);
      assert.equal('explanation' in question, false, `${unitSlug}/${question.id}: leaks the per-question explanation before submission`);
      assert.equal(question.options.length, 4);
      question.options.forEach((opt) => {
        assert.deepEqual(Object.keys(opt).sort(), ['id', 'text']);
      });
    });
  });
});

test('English A1 public browser bundle (src/worlds/english/content.js) does not expose grammarTest answer keys', () => {
  const code = fs.readFileSync(path.join(__dirname, 'src/worlds/english/content.js'), 'utf8');
  const window = {};
  vm.runInContext(code, vm.createContext({ window }), { filename: 'src/worlds/english/content.js' });
  const englishA1Lessons = window.ANDERGO_LANGUAGE_WORLDS.lessons.english.filter(
    (l) => l.level === 'A1' && l.skill === 'grammar'
  );
  assert.equal(englishA1Lessons.length, 12);
  englishA1Lessons.forEach((lesson) => {
    const bank = lesson.extra && lesson.extra.grammarTest;
    assert.ok(bank, `${lesson.slug}: expected a grammarTest in the public bundle`);
    assert.equal(bank.questions.length, 10);
    bank.questions.forEach((question) => {
      assert.equal('correctOptionId' in question, false, `${lesson.slug}/${question.id}: leaks correctOptionId`);
      assert.equal('acceptedAnswers' in question, false, `${lesson.slug}/${question.id}: leaks acceptedAnswers`);
      assert.equal('correctOrder' in question, false, `${lesson.slug}/${question.id}: leaks correctOrder`);
    });
  });
});

test('gradeQuestionBank scores a 10-question A1 grammarTest out of 100', () => {
  const bank = grammarTestBankFor('english', 'A1', 'hello');
  assert.ok(bank, 'expected the english-a1-hello grammarTest bank to exist');

  function scoreFor(correctCount) {
    const answers = bank.questions.map((q, index) => ({
      questionId: q.id,
      // Answer correctly for the first `correctCount` questions, wrongly for the rest.
      answer: index < correctCount ? q.correctOptionId : `${q.correctOptionId}-wrong`
    }));
    return gradeQuestionBank(bank, answers).score;
  }

  assert.equal(scoreFor(10), 100);
  assert.equal(scoreFor(9), 90);
  assert.equal(scoreFor(8), 80);
  assert.equal(scoreFor(7), 70);
  assert.equal(scoreFor(6), 60);
  assert.equal(scoreFor(5), 50);
});

test('gradeQuestionBank feedback (results[]) corresponds to the right question and its own explanation', () => {
  const bank = grammarTestBankFor('english', 'A1', 'about-me');
  assert.ok(bank);
  const answers = bank.questions.map((q, index) => ({
    questionId: q.id,
    // Alternate right/wrong so both correct=true and correct=false paths are exercised.
    answer: index % 2 === 0 ? q.correctOptionId : `${q.correctOptionId}-wrong`
  }));
  const { results } = gradeQuestionBank(bank, answers);
  assert.equal(results.length, 10);
  results.forEach((result, index) => {
    const question = bank.questions[index];
    assert.equal(result.questionId, question.id);
    assert.equal(result.correct, index % 2 === 0);
    assert.equal(result.explanation, question.explanation);
  });
});

// English A2 (scripts/content/english-a2-units.js) - same 10-question
// multiple-choice grammarTest requirement as English A1 above,
// across all 10 units (mirrors englishA2UnitSlugs used by the earlier A2
// content-shape tests).
test('English A2 has exactly 10 units, each with a Grammar lesson carrying a well-formed 10-question multiple-choice test', () => {
  assert.equal(englishA2UnitSlugs.length, 10);
  englishA2UnitSlugs.forEach((unitSlug) => {
    const bank = grammarTestBankFor('english', 'A2', unitSlug);
    assertWellFormedGrammarTest(bank, `english-a2-${unitSlug}`);
  });
});

test('English A2 grammarTest question banks never leak the answer key through the client sanitizer', () => {
  englishA2UnitSlugs.forEach((unitSlug) => {
    const bank = grammarTestBankFor('english', 'A2', unitSlug);
    const sanitized = sanitizeGrammarTestForClient(bank);
    assert.equal(sanitized.questions.length, 10);
    sanitized.questions.forEach((question) => {
      assert.equal('correctOptionId' in question, false, `${unitSlug}/${question.id}: leaks correctOptionId`);
      assert.equal('explanation' in question, false, `${unitSlug}/${question.id}: leaks the per-question explanation before submission`);
      assert.equal(question.options.length, 4);
      question.options.forEach((opt) => {
        assert.deepEqual(Object.keys(opt).sort(), ['id', 'text']);
      });
    });
  });
});

test('English A2 public browser bundle (src/worlds/english/content.js) does not expose grammarTest answer keys', () => {
  const code = fs.readFileSync(path.join(__dirname, 'src/worlds/english/content.js'), 'utf8');
  const window = {};
  vm.runInContext(code, vm.createContext({ window }), { filename: 'src/worlds/english/content.js' });
  const englishA2Lessons = window.ANDERGO_LANGUAGE_WORLDS.lessons.english.filter(
    (l) => l.level === 'A2' && l.skill === 'grammar'
  );
  assert.equal(englishA2Lessons.length, 10);
  englishA2Lessons.forEach((lesson) => {
    const bank = lesson.extra && lesson.extra.grammarTest;
    assert.ok(bank, `${lesson.slug}: expected a grammarTest in the public bundle`);
    assert.equal(bank.questions.length, 10);
    bank.questions.forEach((question) => {
      assert.equal('correctOptionId' in question, false, `${lesson.slug}/${question.id}: leaks correctOptionId`);
      assert.equal('acceptedAnswers' in question, false, `${lesson.slug}/${question.id}: leaks acceptedAnswers`);
      assert.equal('correctOrder' in question, false, `${lesson.slug}/${question.id}: leaks correctOrder`);
    });
  });
});

test('gradeQuestionBank scores every English A2 grammarTest out of 100, matching the spec table exactly', () => {
  englishA2UnitSlugs.forEach((unitSlug) => {
    const bank = grammarTestBankFor('english', 'A2', unitSlug);
    function scoreFor(correctCount) {
      const answers = bank.questions.map((q, index) => ({
        questionId: q.id,
        answer: index < correctCount ? q.correctOptionId : `${q.correctOptionId}-wrong`
      }));
      return gradeQuestionBank(bank, answers).score;
    }
    assert.equal(scoreFor(10), 100, unitSlug);
    assert.equal(scoreFor(9), 90, unitSlug);
    assert.equal(scoreFor(8), 80, unitSlug);
    assert.equal(scoreFor(7), 70, unitSlug);
    assert.equal(scoreFor(6), 60, unitSlug);
    assert.equal(scoreFor(5), 50, unitSlug);
  });
});

test('English A2 grammarTest correct answers are spread across all four option positions, not clustered in one', () => {
  englishA2UnitSlugs.forEach((unitSlug) => {
    const bank = grammarTestBankFor('english', 'A2', unitSlug);
    const positions = bank.questions.map((q) => q.options.findIndex((o) => o.id === q.correctOptionId));
    assert.equal(new Set(positions).size, 4, `${unitSlug}: expected all 4 option positions to be used`);
  });
});

// ---------------------------------------------------------------------
// Español A1 (scripts/content/spanish-a1-units.js, flattened by
// scripts/build-spanish-a1-seed.js into lib/seed-lessons.json/seed-units.json).
// English A1 is the technical template here: 12 units x 6 core skills, no
// separate 'dialogue' skill row - dialogues live inside listening via
// listeningType: 'dialogue' + the `dialogue` field. Free/Premium follows
// the split explicitly requested for Español A1 (units 1-2 free, 3-12
// premium), which differs from English A1's own 100%-free policy - see
// the seed/build scripts' comments for why these aren't unified.
// ---------------------------------------------------------------------

const SPANISH_CORE_SKILLS = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];
const ALLOWED_LISTENING_TYPES = [
  'dialogue',
  'interview',
  'announcement',
  'voice-message',
  'story',
  'dictation',
  'phonetic-transcription'
];

function spanishA1Rows() {
  return seedLessons.filter((row) => row.target_language === 'spanish' && row.level === 'A1');
}

test('Español A1 has exactly 12 units, in order, units 1-2 free and 3-12 premium', () => {
  const units = seedUnits
    .filter((row) => row.target_language === 'spanish' && row.level === 'A1')
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  assert.equal(units.length, 12);
  units.forEach((unit, index) => {
    assert.equal(unit.order_index, index + 1, `unit "${unit.slug}" should be order ${index + 1}`);
  });

  const lessonsByUnit = {};
  spanishA1Rows().forEach((row) => {
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

test('Español A1 places “No me siento bien” explicitly in unit 11 with a level-safe stable slug', () => {
  const unit = seedUnits.find(
    (row) => row.target_language === 'spanish' && row.level === 'A1' && row.order_index === 11
  );
  assert.ok(unit, 'expected Español A1 unit 11');
  assert.equal(unit.slug, 'salud-y-bienestar-a1');
  assert.equal(unit.title, 'No me siento bien');

  const activities = spanishA1Rows()
    .filter((row) => row.unit_slug === unit.slug)
    .sort((a, b) => a.order_index - b.order_index);
  assert.deepEqual(
    activities.map((row) => row.order_index),
    [110, 111, 112, 113, 114, 115]
  );
  assert.deepEqual(
    activities.map((row) => row.skill),
    SPANISH_CORE_SKILLS
  );
});

test('Español A1 has exactly 72 activities: 12 units x 6 core skills, no standalone dialogue skill', () => {
  const rows = spanishA1Rows();
  assert.equal(rows.length, 72);

  const dialogueSkillRows = rows.filter((row) => row.skill === 'dialogue');
  assert.equal(
    dialogueSkillRows.length,
    0,
    'Español A1 must not have a standalone "dialogue" skill - dialogues live inside listening'
  );

  const unitSlugs = [...new Set(rows.map((row) => row.unit_slug))];
  assert.equal(unitSlugs.length, 12);
  unitSlugs.forEach((unitSlug) => {
    const skillsForUnit = rows.filter((row) => row.unit_slug === unitSlug).map((row) => row.skill);
    assert.deepEqual([...skillsForUnit].sort(), [...SPANISH_CORE_SKILLS].sort());
  });
});

test('English and French B2-C2 expose Listening, Speaking and Writing in every unit', () => {
  const advancedCourses = [
    ['english', 'B2'],
    ['english', 'C1'],
    ['english', 'C2'],
    ['french', 'B2'],
    ['french', 'C1'],
    ['french', 'C2']
  ];
  const requiredSkills = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];

  advancedCourses.forEach(([language, level]) => {
    const units = seedUnits.filter(
      (row) => row.target_language === language && row.level === level
    );
    const rows = seedLessons.filter(
      (row) => row.target_language === language && row.level === level
    );
    assert.equal(units.length, 12, `${language} ${level} should have 12 units`);

    units.forEach((unit) => {
      const unitRows = rows.filter((row) => row.unit_slug === unit.slug);
      const skills = unitRows.map((row) => row.skill);
      requiredSkills.forEach((skill) => {
        assert.ok(skills.includes(skill), `${language} ${level} ${unit.slug} is missing ${skill}`);
      });

      const listening = unitRows.find((row) => row.skill === 'listening');
      const speaking = unitRows.find((row) => row.skill === 'speaking');
      const writing = unitRows.find((row) => row.skill === 'writing');
      assert.ok(listening.content_json.transcript, `${listening.slug} needs a transcript`);
      assert.ok(listening.content_json.exercises.length >= 3, `${listening.slug} needs comprehension`);
      assert.ok(speaking.content_json.mission, `${speaking.slug} needs a speaking mission`);
      assert.ok(
        speaking.content_json.extra?.communicationGuide,
        `${speaking.slug} needs record/STT/pronunciation guidance`
      );
      assert.ok(writing.content_json.mission, `${writing.slug} needs a writing mission`);
      assert.ok(
        writing.content_json.extra?.writingGuide,
        `${writing.slug} needs a guided writing plan`
      );
    });
  });
});

test('every Español A1 activity has language "spanish" and level "A1"', () => {
  spanishA1Rows().forEach((row) => {
    assert.equal(row.target_language, 'spanish');
    assert.equal(row.level, 'A1');
    assert.equal(row.content_json.language_key, 'spanish');
  });
});

test('every Español A1 slug and unit_slug is unique and every unit_slug resolves to a real unit', () => {
  const rows = spanishA1Rows();
  const slugs = rows.map((row) => row.slug);
  assert.equal(slugs.length, new Set(slugs).size, 'expected every Español A1 activity slug to be unique');

  const unitSlugs = seedUnits
    .filter((row) => row.target_language === 'spanish' && row.level === 'A1')
    .map((row) => row.slug);
  const uniqueUnitSlugs = new Set(unitSlugs);
  assert.equal(unitSlugs.length, uniqueUnitSlugs.size, 'expected every Español A1 unit slug to be unique');
  rows.forEach((row) => {
    assert.ok(
      uniqueUnitSlugs.has(row.unit_slug),
      `${row.slug} references unit_slug "${row.unit_slug}", which has no matching unit row`
    );
  });
});

test('every Español A1 reading has 3 parts and exactly 8 exercises (4 mcq + 3 verdadero/falso + 1 vocabulario en contexto)', () => {
  const readingRows = spanishA1Rows().filter((row) => row.skill === 'reading');
  assert.equal(readingRows.length, 12);

  readingRows.forEach((row) => {
    const reading = row.content_json.reading;
    assert.equal(reading.parts.length, 3, `${row.slug} should have 3 reading parts`);

    const exercises = row.content_json.exercises;
    assert.equal(exercises.length, 8, `${row.slug} should have 8 exercises`);

    const trueFalse = exercises.filter(
      (ex) => Array.isArray(ex.options) && ex.options.length === 2 && ex.options.includes('Verdadero')
    );
    assert.equal(trueFalse.length, 3, `${row.slug} should have 3 verdadero/falso exercises`);

    const remaining = exercises.filter((ex) => !trueFalse.includes(ex));
    assert.equal(remaining.length, 5, `${row.slug} should have 5 remaining mcq (4 comprehension + 1 vocabulary-in-context)`);
  });
});

test('every Español A1 listening has a valid listeningType, transcript and comprehension questions; dialogues carry dialogue lines', () => {
  const listeningRows = spanishA1Rows().filter((row) => row.skill === 'listening');
  assert.equal(listeningRows.length, 12);

  listeningRows.forEach((row) => {
    const content = row.content_json;
    const listeningType = content.extra?.listeningType;
    assert.ok(
      ALLOWED_LISTENING_TYPES.includes(listeningType),
      `${row.slug} has listeningType "${listeningType}", expected one of ${ALLOWED_LISTENING_TYPES.join(', ')}`
    );
    assert.notEqual(listeningType, 'instructions', `${row.slug} must not use the disallowed "instructions" listeningType`);
    assert.ok(content.transcript && content.transcript.length > 0, `${row.slug} should have a transcript`);
    assert.ok(content.exercises.length > 0, `${row.slug} should have comprehension exercises`);
    if (listeningType === 'dialogue') {
      assert.ok(content.dialogue.length > 0, `${row.slug} (dialogue) should have dialogue lines`);
    }
  });
});

test('every Español A1 listening has phonetic support and dictation segments flagged as reviewable', () => {
  const listeningRows = spanishA1Rows().filter((row) => row.skill === 'listening');
  listeningRows.forEach((row) => {
    const phonetic = row.content_json.extra?.phoneticSupport;
    assert.ok(phonetic, `${row.slug} should have phoneticSupport`);
    assert.equal(phonetic.locale, 'es-419');
    assert.equal(phonetic.reviewStatus, 'pending-review');
    assert.ok(row.content_json.dictation?.segments?.length > 0, `${row.slug} should have dictation segments`);
  });
});

test('every Español A1 writing activity has an assignment and criteria (exercises)', () => {
  const writingRows = spanishA1Rows().filter((row) => row.skill === 'writing');
  assert.equal(writingRows.length, 12);
  writingRows.forEach((row) => {
    assert.ok(row.content_json.mission?.length > 0, `${row.slug} should have a mission/prompt`);
    assert.ok(row.content_json.exercises.length > 0, `${row.slug} should have at least one writing exercise`);
  });
});

test('every Español A1 grammar activity has an explanation and exercises', () => {
  const grammarRows = spanishA1Rows().filter((row) => row.skill === 'grammar');
  assert.equal(grammarRows.length, 12);
  grammarRows.forEach((row) => {
    assert.ok(row.content_json.grammar?.length > 0, `${row.slug} should have a grammar explanation`);
    assert.ok(row.content_json.exercises.length > 0, `${row.slug} should have grammar exercises`);
  });
});

test('every Español A1 vocabulary activity has 15-25 flashcards', () => {
  const vocabRows = spanishA1Rows().filter((row) => row.skill === 'vocabulary');
  assert.equal(vocabRows.length, 12);
  vocabRows.forEach((row) => {
    const count = row.content_json.vocabulary.length;
    assert.ok(count >= 15 && count <= 25, `${row.slug} should have 15-25 vocabulary items, got ${count}`);
  });
});

test('Español A1 does not expose answer keys or dictation text in the public browser bundle', () => {
  const code = fs.readFileSync(path.join(__dirname, 'src/worlds/spanish/content.js'), 'utf8');
  const window = {};
  vm.runInContext(code, vm.createContext({ window }), { filename: 'src/worlds/spanish/content.js' });
  const spanishLessons = window.ANDERGO_LANGUAGE_WORLDS.lessons.spanish.filter((l) => l.level === 'A1');
  assert.equal(spanishLessons.length, 72);
  spanishLessons.forEach((lesson) => {
    (lesson.exercises || []).forEach((exercise) => {
      assert.equal('answer' in exercise, false, `${lesson.slug} exercise leaks an "answer" field to the public bundle`);
    });
    assert.equal('dictation' in lesson, false, `${lesson.slug} must not ship dictation segment text to the public bundle`);
  });
});

// ---------------------------------------------------------------------
// Username login + password recovery (see lib/authService.js,
// lib/profilesService.js). Uses real throwaway Supabase Auth users
// (created via the admin API and always deleted in `finally`), matching
// the pattern already used for the voice-quota tests above. Skipped
// entirely when Supabase isn't configured, since there's no real
// auth.users/profiles round-trip to exercise without it.
// ---------------------------------------------------------------------
const SUPABASE_AUTH_TESTS_SKIP_REASON = !RUN_LIVE_SUPABASE_TESTS
  ? 'Set RUN_LIVE_SUPABASE_TESTS=1 to create real throwaway Auth users'
  : 'Supabase is not configured in this environment';

async function createLoginTestUser({ emailConfirm = true } = {}) {
  const admin = getSupabaseAdmin();
  const email = `andergo-login-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const password = `Test-${Math.random().toString(36).slice(2)}Aa1!`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: emailConfirm
  });
  if (error) throw new Error(`createUser failed: ${error.message}`);
  return { id: data.user.id, email, password };
}

async function deleteLoginTestUser(userId) {
  const admin = getSupabaseAdmin();
  await admin.auth.admin.deleteUser(userId).catch(() => {});
}

async function postLogin(port, body) {
  const response = await fetch(`http://127.0.0.1:${port}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', ...body })
  });
  const json = await response.json().catch(() => ({}));
  return { status: response.status, body: json };
}

test('registration enforces the advertised password policy before creating an account', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        email: 'password-policy-test@example.com',
        username: 'policytest',
        password: 'abcdefgh'
      })
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.match(body.error, /8 caracteres con letras y números/i);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Español A2-C2 each have 12 ordered units with all 6 connected skills', () => {
  ['A2', 'B1', 'B2', 'C1', 'C2'].forEach((level) => {
    const units = seedUnits
      .filter((row) => row.target_language === 'spanish' && row.level === level)
      .sort((a, b) => a.order_index - b.order_index);
    const rows = seedLessons.filter(
      (row) => row.target_language === 'spanish' && row.level === level
    );
    assert.equal(units.length, 12, `${level}: expected 12 units`);
    assert.equal(rows.length, 72, `${level}: expected 72 activities`);
    units.forEach((unit, index) => {
      assert.equal(unit.order_index, index + 1, `${level}/${unit.slug}: wrong unit order`);
      const unitRows = rows.filter((row) => row.unit_slug === unit.slug);
      assert.deepEqual(
        unitRows.map((row) => row.skill).sort(),
        [...SPANISH_CORE_SKILLS].sort(),
        `${level}/${unit.slug}: expected all core skills`
      );
      const expectedTier = index < 2 ? 'free' : 'premium';
      unitRows.forEach((row) => assert.equal(row.access_tier, expectedTier));
    });
  });
});

test('Español A2-C2 activities contain skill-specific learning content', () => {
  seedLessons
    .filter((row) => row.target_language === 'spanish' && row.level !== 'A1')
    .forEach((row) => {
      const content = row.content_json;
      assert.ok(content.intro, `${row.slug}: missing intro`);
      assert.ok(content.mission, `${row.slug}: missing mission`);
      assert.ok(content.exercises.length, `${row.slug}: missing exercises`);
      if (row.skill === 'reading') assert.ok(content.reading?.text, `${row.slug}: missing text`);
      if (row.skill === 'listening') assert.ok(content.transcript, `${row.slug}: missing transcript`);
      if (row.skill === 'speaking') assert.ok(content.dialogue.length, `${row.slug}: missing dialogue`);
      if (row.skill === 'writing') assert.match(content.mission, /palabras/);
      if (row.skill === 'grammar') assert.ok(content.extra?.grammarTest?.questions.length);
      if (row.skill === 'vocabulary') assert.ok(content.vocabulary.length >= 6);
    });
});

test('Speaking presents three practical choices: dialogue, recorded pronunciation and Premium Tutor', () => {
  const script = fs.readFileSync(path.join(__dirname, 'src/js/script.js'), 'utf8');
  const tabs = script.match(/function renderSpeakingModeTabsHtml\(activeMode\) \{([\s\S]*?)\n\}/)?.[1] || '';
  assert.match(tabs, /label: 'Dialogues'/);
  assert.match(tabs, /label: 'Grabar y practicar'/);
  assert.match(script, /label: 'Conversar con Tutor IA'/);
  assert.match(script, /activityType: 'pronunciation'/);
  assert.match(script, /La conversación libre con Tutor IA es Premium/);
  assert.doesNotMatch(tabs, /label: 'Grabar mi voz'|label: 'Hablar a texto'/);
});

test('advanced routes paint bundled content immediately while progress synchronizes in parallel', () => {
  const client = fs.readFileSync(path.join(__dirname, 'src/js/script.js'), 'utf8');
  const service = fs.readFileSync(path.join(__dirname, 'lib/lessonsService.js'), 'utf8');
  assert.match(client, /function isAdvancedImmersionLevel\(level = learningPathState\.level\)/);
  assert.match(client, /const optimisticLessons = getLocalFallbackLessons/);
  assert.match(client, /learningPathState\.lessons = optimisticLessons/);
  assert.match(service, /const \[remoteLessons, completedSlugs, entitlements\] = await Promise\.all/);
  assert.match(client, /return isAdvancedImmersionLevel\(\)/);
  assert.match(client, /function getReadingSectionState\(lesson\)/);
  assert.match(client, /allParagraphs\.slice/);
});

test('Writing uses guided micro-practice, a concise editor and simplified review actions', () => {
  const script = fs.readFileSync(path.join(__dirname, 'src/js/script.js'), 'utf8');
  assert.match(script, /class="writing-practice-shell"/);
  assert.match(script, /Cuatro actividades cortas antes de una microproducción opcional/);
  assert.match(script, /class="writing-editor writing-editor--compact"/);
  assert.match(script, /data-support-mode="review-complete"/);
  assert.match(script, /data-support-mode="hint"/);
  assert.doesNotMatch(script, /data-support-mode="review-grammar">Revisar gramática/);
});

test('Grammar submission re-reads every visible answer before grading', () => {
  const script = fs.readFileSync(path.join(__dirname, 'src/js/script.js'), 'utf8');
  assert.match(script, /function collectAllGrammarTestAnswers\(content, test, runtime\)/);
  assert.match(
    script,
    /collectAllGrammarTestAnswers\(ctx\.content, ctx\.test, ctx\.runtime\)/
  );
  assert.match(script, /Il reste une question sans réponse\./);
  assert.doesNotMatch(
    script,
    /if \(!ctx \|\| grammarTestSubmitBtn\.disabled\) return/
  );
});

test('French written grammar accepts equivalent punctuation and Mme abbreviation', () => {
  const bank = {
    questions: [
      {
        id: 'q7',
        type: 'fill_blank',
        acceptedAnswers: ['est', 'Madame Dubois est la professeure.'],
        explanation: 'Use est with a singular subject.'
      },
      {
        id: 'q8',
        type: 'fill_blank',
        acceptedAnswers: ['sont', 'Léa et Karim sont mes amis.'],
        explanation: 'Use sont with a plural subject.'
      }
    ]
  };
  const result = gradeQuestionBank(bank, [
    { questionId: 'q7', answer: 'Mme. Dubois est la professeure' },
    { questionId: 'q8', answer: 'Léa et Karim sont mes amis' }
  ]);
  assert.equal(result.allAttempted, true);
  assert.equal(result.score, 100);
  assert.ok(result.results.every((item) => item.correct));
});

test('auth UI preserves contextual messages and guards duplicate login submissions', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const script = fs.readFileSync(path.join(__dirname, 'src/js/script.js'), 'utf8');

  assert.match(html, /id="loginSubmitBtn"/);
  assert.match(html, /data-default-text="¿No tienes cuenta\?/);
  assert.match(html, /pattern="\(\?=\.\*\[A-Za-z\]\)\(\?=\.\*\[0-9\]\)\.\{8,\}"/);
  assert.match(script, /function openModal\(panel, \{ message = '', isError = false \} = \{\}\)/);
  assert.match(script, /if \(message\) setAuthMessage\(message, isError\)/);
  assert.match(script, /if \(submitBtn\?\.disabled\) return/);
  assert.match(script, /submitBtn\.textContent = 'Entrando…'/);
});

test(
  'username + email login flows',
  {
    skip:
      (!RUN_LIVE_SUPABASE_TESTS && SUPABASE_AUTH_TESTS_SKIP_REASON) ||
      (!config.isSupabaseConfigured && SUPABASE_AUTH_TESTS_SKIP_REASON)
  },
  async (t) => {
    const admin = getSupabaseAdmin();
    const { server, port } = await startTestServer();
    const testUser = await createLoginTestUser();
    const username = `logintest${Date.now()}`.slice(0, 24);

    try {
      const { error: usernameError } = await admin
        .from('profiles')
        .update({ username, username_normalized: username.toLowerCase() })
        .eq('id', testUser.id);
      if (usernameError) throw new Error(`could not set test username: ${usernameError.message}`);

      await t.test('1. login by correct email', async () => {
        const r = await postLogin(port, { identifier: testUser.email, password: testUser.password });
        assert.equal(r.status, 200);
        assert.equal(r.body.user.email, testUser.email);
      });

      // Regression test for the "username onboarding modal reopens for
      // every login" bug: the frontend's loadPreferences() used to silently
      // drop `username` from GET /api/preferences, so preferences.username
      // was always undefined regardless of the real DB value (profiles.username
      // is the authoritative source - see hasValidUsername() in
      // src/js/script.js). Also confirms the login response's own
      // emailConfirmedAt (a temporary fallback only, read from
      // user_metadata/auth.users - never the profiles table) is populated
      // for a confirmed account.
      await t.test(
        '11. GET /api/preferences carries the real username; login response carries emailConfirmedAt (username onboarding regression)',
        async () => {
          const r = await postLogin(port, { identifier: testUser.email, password: testUser.password });
          assert.equal(r.status, 200);
          assert.ok(r.body.user.emailConfirmedAt, 'expected a non-null emailConfirmedAt for a confirmed account');

          const prefsRes = await fetch(`http://127.0.0.1:${port}/api/preferences`, {
            headers: { Authorization: `Bearer ${r.body.session.access_token}` }
          });
          const prefsBody = await prefsRes.json().catch(() => ({}));
          assert.equal(prefsRes.status, 200);
          assert.equal(prefsBody.username, username);
        }
      );

      await t.test('2. login by correct username', async () => {
        const r = await postLogin(port, { identifier: username, password: testUser.password });
        assert.equal(r.status, 200);
        assert.equal(r.body.user.email, testUser.email);
      });

      await t.test('3. username in uppercase/mixed case', async () => {
        const r = await postLogin(port, {
          identifier: username.toUpperCase(),
          password: testUser.password
        });
        assert.equal(r.status, 200);
        assert.equal(r.body.user.email, testUser.email);
      });

      await t.test('4. username with leading/trailing whitespace', async () => {
        const r = await postLogin(port, { identifier: `  ${username}  `, password: testUser.password });
        assert.equal(r.status, 200);
        assert.equal(r.body.user.email, testUser.email);
      });

      let wrongPasswordMessage;
      await t.test('5. wrong password', async () => {
        const r = await postLogin(port, { identifier: testUser.email, password: 'not-the-password' });
        assert.equal(r.status, 401);
        wrongPasswordMessage = r.body.error;
        assert.equal(typeof wrongPasswordMessage, 'string');
      });

      let unknownUsernameMessage;
      await t.test('6. nonexistent username', async () => {
        const r = await postLogin(port, { identifier: 'no-such-username-at-all', password: 'whatever123' });
        assert.equal(r.status, 401);
        unknownUsernameMessage = r.body.error;
      });

      await t.test('10. wrong-password and unknown-username give the byte-identical message', () => {
        assert.equal(wrongPasswordMessage, unknownUsernameMessage);
        assert.equal(wrongPasswordMessage, 'Nombre de usuario, correo o contraseña incorrectos.');
      });

      await t.test('7. profile with a username but no usable email is treated as not-found, not a 500', async () => {
        const brokenUsername = `broken${Date.now()}`.slice(0, 24);
        const brokenUser = await createLoginTestUser();
        try {
          await admin
            .from('profiles')
            .update({
              username: brokenUsername,
              username_normalized: brokenUsername.toLowerCase(),
              email: null
            })
            .eq('id', brokenUser.id);
          const r = await postLogin(port, { identifier: brokenUsername, password: 'whatever123' });
          assert.equal(r.status, 401);
          assert.equal(r.body.error, 'Nombre de usuario, correo o contraseña incorrectos.');
        } finally {
          await deleteLoginTestUser(brokenUser.id);
        }
      });

      await t.test('8. unconfirmed account gets a distinct (non-generic) message, not silent failure', async () => {
        const unconfirmedUser = await createLoginTestUser({ emailConfirm: false });
        try {
          const r = await postLogin(port, {
            identifier: unconfirmedUser.email,
            password: unconfirmedUser.password
          });
          assert.equal(r.status, 403);
          assert.match(r.body.error, /confirmar tu correo/i);
        } finally {
          await deleteLoginTestUser(unconfirmedUser.id);
        }
      });

      await t.test('9. no response body ever includes the resolved email/username-to-email mapping', async () => {
        const r = await postLogin(port, { identifier: username, password: testUser.password });
        const raw = JSON.stringify(r.body);
        // The user's OWN email is expected back (client already knows it,
        // same as any session payload) - what must never appear is a
        // separate resolvedEmail/lookupEmail-shaped field exposing the
        // username -> email mapping itself.
        assert.equal(Object.prototype.hasOwnProperty.call(r.body, 'resolvedEmail'), false);
        assert.equal(Object.prototype.hasOwnProperty.call(r.body, 'lookupEmail'), false);
        assert.ok(raw); // keep raw referenced for future stricter checks
      });
    } finally {
      await deleteLoginTestUser(testUser.id);
      server.close();
    }
  }
);

// L1 (bridge/interface language) vs L2 (target language) - see
// src/js/language-pair.js's header comment for the definitions. Pure
// functions, no server/Supabase needed.
test('language pair: getLanguagePairLabel renders the correct pair per spec §8 items 1-3', () => {
  assert.equal(
    LanguagePair.getLanguagePairLabel('spanish', 'english'),
    'Aprenderás inglés con apoyo en español.'
  );
  assert.equal(
    LanguagePair.getLanguagePairLabel('english', 'french'),
    'You will learn French with support in English.'
  );
  assert.equal(
    LanguagePair.getLanguagePairLabel('french', 'spanish'),
    'Vous apprendrez espagnol avec un accompagnement en français.'
  );
});

test('language pair: getInterfaceLabel uses L1, not L2, for interface chrome (§8 item 4)', () => {
  // Same label key, different bridgeLanguage in each call - the interface
  // label must follow L1 regardless of what's being learned.
  assert.equal(
    LanguagePair.getInterfaceLabel('bridgeSelectLabel', 'spanish'),
    'Idioma de la plataforma y apoyo (L1)'
  );
  assert.equal(
    LanguagePair.getInterfaceLabel('bridgeSelectLabel', 'english'),
    'Platform & support language (L1)'
  );
  assert.equal(
    LanguagePair.getInterfaceLabel('bridgeSelectLabel', 'french'),
    "Langue de la plateforme et d'appui (L1)"
  );
  assert.equal(LanguagePair.getInterfaceLabel('levelSelectLabel', 'french'), 'Niveau');
});

test('language pair: getTargetContent returns the L2 entry, untranslated (§8 item 5)', () => {
  const content = { english: 'Hello!', french: 'Bonjour !', spanish: '¡Hola!' };
  assert.equal(LanguagePair.getTargetContent(content, 'french'), 'Bonjour !');
  assert.equal(LanguagePair.getTargetContent(content, 'english'), 'Hello!');
});

test('language pair: getSupportText returns the L1 entry, falling back to Spanish (§8 item 6)', () => {
  const content = {
    spanish: 'Escucha y selecciona la respuesta correcta.',
    english: 'Listen and choose the correct answer.'
  };
  assert.equal(LanguagePair.getSupportText(content, 'english'), 'Listen and choose the correct answer.');
  // No French entry authored yet - must fall back to Spanish, never throw
  // or fabricate a French sentence that isn't real data.
  assert.equal(LanguagePair.getSupportText(content, 'french'), 'Escucha y selecciona la respuesta correcta.');
});

test('language pair: getLanguagePairLabel matches the dynamic-text example verbatim (§8 item 7)', () => {
  assert.equal(
    LanguagePair.getLanguagePairLabel('spanish', 'english'),
    'Aprenderás inglés con apoyo en español.'
  );
});

test('language pair: no Spanish hardcoded as the only option in the shared module (§8 item 8)', () => {
  // getLanguagePairLabel/getInterfaceLabel must actually branch on the
  // bridgeLanguage argument, not silently always return the Spanish string
  // regardless of what's passed in.
  const spanishLabel = LanguagePair.getLanguagePairLabel('spanish', 'english');
  const englishLabel = LanguagePair.getLanguagePairLabel('english', 'french');
  const frenchLabel = LanguagePair.getLanguagePairLabel('french', 'spanish');
  assert.notEqual(spanishLabel, englishLabel);
  assert.notEqual(spanishLabel, frenchLabel);
  assert.notEqual(englishLabel, frenchLabel);
});

// ---------------------------------------------------------------------
// Auth/email flow (lib/authService.js, src/js/script.js). Never calls the
// real signUp()/resend()/resetPasswordForEmail() here, even though this
// environment does have a real Supabase project configured (see the
// "username + email login flows" suite above): those three would each send
// a real email through the live Brevo SMTP relay on every test run, which
// is exactly the "don't build a second email system / don't spam a real
// inbox from CI" constraint the whole flow was fixed under. Coverage here
// splits into:
//  - direct unit tests of the pure/constant pieces (redirect URLs,
//    classifyEmailError) exported from authService.js for this purpose;
//  - a live but side-effect-free run of resendConfirmation()/
//    requestPasswordReset() with config.isSupabaseConfigured temporarily
//    forced off, exercising the exact neutral-response code path without
//    ever reaching Supabase;
//  - source-level regression guards for the frontend behavior (closing the
//    Auth modal on sign-in, not duplicating listeners, restoring body
//    scroll, etc.) that this project's test setup (Node's test runner
//    against a live Express server, no browser/DOM harness) has no way to
//    execute directly.
// ---------------------------------------------------------------------
const authService = require('./lib/authService');

test('authService: signup/resend confirmation link points at ?auth=confirmed', () => {
  assert.equal(authService.EMAIL_CONFIRM_REDIRECT_URL, 'https://andergo.online/?auth=confirmed');
});

test('authService: password reset link points at ?auth=recovery', () => {
  assert.equal(authService.PASSWORD_RESET_REDIRECT_URL, 'https://andergo.online/?auth=recovery');
});

test('authService: signUp/resend actually pass EMAIL_CONFIRM_REDIRECT_URL as emailRedirectTo', () => {
  const source = fs.readFileSync(path.join(__dirname, 'lib', 'authService.js'), 'utf8');
  const occurrences = source.match(/emailRedirectTo:\s*EMAIL_CONFIRM_REDIRECT_URL/g) || [];
  // One inside auth.signUp()'s options, one inside auth.resend()'s options -
  // defining the constant is not enough, both call sites must use it.
  assert.equal(occurrences.length, 2, 'expected signUp() and resend() to both set emailRedirectTo');
  assert.match(source, /auth\.resend\(\{\s*type:\s*'signup'/);
  assert.match(source, /auth\.resetPasswordForEmail\([^)]*redirectTo:\s*PASSWORD_RESET_REDIRECT_URL/s);
});

test('authService.classifyEmailError: maps known GoTrue codes to the internal taxonomy, never the raw code', () => {
  assert.equal(authService.classifyEmailError({ code: 'over_email_send_rate_limit' }), 'EMAIL_RATE_LIMIT');
  assert.equal(authService.classifyEmailError({ status: 429 }), 'EMAIL_RATE_LIMIT');
  assert.equal(authService.classifyEmailError({ code: 'unexpected_failure' }), 'SMTP_DELIVERY_ERROR');
  assert.equal(authService.classifyEmailError({ code: 'signup_disabled' }), 'SMTP_CONFIGURATION_ERROR');
  assert.equal(authService.classifyEmailError({ code: 'otp_expired' }), 'INVALID_TOKEN');
  assert.equal(
    authService.classifyEmailError({ code: 'unauthorized_redirect_url' }),
    'INVALID_REDIRECT'
  );
  assert.equal(authService.classifyEmailError({ code: 'totally_unknown_thing' }), 'UNKNOWN_EMAIL_ERROR');
  assert.equal(authService.classifyEmailError(undefined), 'UNKNOWN_EMAIL_ERROR');
});

test('authService.classifyConfirmationCallbackError: maps to the CONFIRMATION_CALLBACK taxonomy (spec §8)', () => {
  assert.equal(
    authService.classifyConfirmationCallbackError({ code: 'otp_expired' }),
    'EXPIRED_CONFIRMATION_LINK'
  );
  assert.equal(
    authService.classifyConfirmationCallbackError({ code: 'over_email_send_rate_limit' }),
    'EMAIL_RATE_LIMIT'
  );
  assert.equal(authService.classifyConfirmationCallbackError({ status: 429 }), 'EMAIL_RATE_LIMIT');
  assert.equal(
    authService.classifyConfirmationCallbackError({ code: 'invalid_token' }),
    'INVALID_CONFIRMATION_LINK'
  );
  assert.equal(authService.classifyConfirmationCallbackError(undefined), 'AUTH_CALLBACK_FAILED');
});

test(
  'authService.resendConfirmation/requestPasswordReset: neutral response, never a raw Supabase error',
  async () => {
    // Forces the devStore/no-Supabase branch for just these two calls, the
    // same neutral-response code path a misconfigured deployment would take
    // - never reaches auth.resend()/resetPasswordForEmail(), so this is safe
    // to run even against this environment's real Supabase project.
    const original = config.isSupabaseConfigured;
    config.isSupabaseConfigured = false;
    try {
      const resendResult = await authService.resendConfirmation('someone@example.com');
      assert.equal(resendResult.ok, true);
      assert.match(resendResult.message, /nuevo código/);

      const resetResult = await authService.requestPasswordReset('someone@example.com');
      assert.equal(resetResult.ok, true);
      assert.match(resetResult.message, /recibirás un enlace/);
      assert.match(resetResult.message, /Spam/);
    } finally {
      config.isSupabaseConfigured = original;
    }
  }
);

test('health endpoint exposes emailAuth status and never leaks SMTP/API credentials', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.emailAuth, {
      provider: 'supabase-brevo-smtp',
      sender: config.noReplyEmail,
      configured: 'dashboard-managed'
    });
    // Excludes the response's own expected 'supabase-brevo-smtp' provider
    // string before checking - that's the one legitimate "smtp" substring
    // this endpoint should ever contain.
    const raw = JSON.stringify(body).toLowerCase().replace(/supabase-brevo-smtp/g, '');
    ['smtp_pass', 'smtp_user', 'smtp_host', 'password', 'service_role', 'apikey', 'api_key', 'secret'].forEach(
      (needle) => {
        assert.equal(raw.includes(needle), false, `/api/health leaked a "${needle}"-shaped field`);
      }
    );
  } finally {
    server.close();
  }
});

test('logout endpoint responds ok even with no session (idempotent, never requires auth)', async () => {
  const { server, port } = await startTestServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/logout`, { method: 'POST' });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
  } finally {
    server.close();
  }
});

// Source-level regression guards for script.js's Auth-UI behavior - this
// project's test runner (node:test + a live Express server) has no
// browser/DOM harness to actually click through the modal, so these assert
// the specific call sites the spec requires are present and wired the way
// the spec describes, rather than executing them.
test('script.js: closeAllAuthUI() exists once and is used by every required call site', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');

  assert.match(source, /function closeAllAuthUI\(\)\s*\{/);
  // Defined exactly once - a second definition would silently shadow the
  // first instead of erroring, which is worse than never catching it here.
  assert.equal((source.match(/function closeAllAuthUI\(\)/g) || []).length, 1);

  // 1) login success / MFA-completed login / confirmation-then-login all
  // funnel through afterAuthSuccess(), which must close the modal as its
  // very first action (see the "Called right after saveSession()" comment
  // right above it) - before, not only after, the slower per-account loads.
  const afterAuthSuccessBody = source.match(
    /async function afterAuthSuccess\(\) \{([\s\S]*?)\n\}/
  )?.[1];
  assert.ok(afterAuthSuccessBody, 'expected to find afterAuthSuccess() body');
  assert.match(afterAuthSuccessBody.trim(), /^closeAllAuthUI\(\);/);

  // 2) a valid restored session (this app's INITIAL_SESSION equivalent -
  // see restoreSession()'s own comment) must never leave the modal open.
  const restoreSessionBody = source.match(/function restoreSession\(\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(restoreSessionBody, 'expected to find restoreSession() body');
  assert.match(restoreSessionBody, /closeAllAuthUI\(\);/);

  // 3) manual close (X/backdrop/Escape) still goes through the same shared
  // function, via the closeAuth() alias - never a second parallel
  // implementation that could drift from closeAllAuthUI().
  assert.match(source, /function closeAuth\(\) \{\s*closeAllAuthUI\(\);\s*\}/);

  // closeAllAuthUI() itself must restore body scroll and clear stale
  // sensitive fields (spec §6) - not just hide the modal.
  const closeAllAuthUIBody = source.match(/function closeAllAuthUI\(\) \{([\s\S]*?)\n\}/)?.[1];
  assert.match(closeAllAuthUIBody, /document\.body\.classList\.remove\('modal-open'\)/);
  assert.match(closeAllAuthUIBody, /clearAuthMessages\(\)/);
  assert.match(closeAllAuthUIBody, /loginPassword/);
});

test('script.js: logout() never re-opens the login modal and updates the header', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const logoutBody = source.match(/async function logout\(\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(logoutBody, 'expected to find logout() body');
  assert.doesNotMatch(logoutBody, /openModal\(/);
  assert.match(logoutBody, /renderAuthState\(\)/);
});

test('script.js: exactly one global hashchange listener is registered (no duplicate routers)', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const occurrences = source.match(/addEventListener\('hashchange'/g) || [];
  assert.equal(occurrences.length, 1);
});

test('authenticated Grammar submission shares one token refresh and retries protected requests', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(source, /let authRefreshPromise = null/);
  assert.match(source, /if \(authRefreshPromise\) return authRefreshPromise/);
  assert.match(source, /authRefreshPromise = performAuthSessionRefresh\(\)/);
  assert.match(source, /stored\.session\.access_token !== authStatus\.session\.access_token/);
  assert.match(
    source,
    /authFetch\(\s*`\$\{backendBaseUrl\}\/api\/lessons\/\$\{lesson\.slug\}\/grammar-test-history`/
  );
  assert.match(source, /const restored = await refreshAuthSession\(\)/);
  assert.match(
    source,
    /authFetch\(`\$\{backendBaseUrl\}\/api\/lessons\/\$\{lesson\.slug\}\/complete`/
  );
});

test('script.js: the reset-password page opens the recovery form only on PASSWORD_RECOVERY, and email confirmation never does', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const resetPageBody = source.match(
    /async function initResetPasswordPage\(\) \{([\s\S]*?)\n\}/
  )?.[1];
  assert.ok(resetPageBody, 'expected to find initResetPasswordPage() body');
  assert.match(resetPageBody, /onAuthStateChange\(\(event\) => \{\s*if \(event === 'PASSWORD_RECOVERY'\)/);

  const confirmedPageBody = source.match(
    /async function initEmailConfirmedPage\(\) \{([\s\S]*?)\n\}/
  )?.[1];
  assert.ok(confirmedPageBody, 'expected to find initEmailConfirmedPage() body');
  // Must never open the reset-password form - no PASSWORD_RECOVERY handling
  // and no reference to the reset form's own elements anywhere in this path.
  assert.doesNotMatch(confirmedPageBody, /PASSWORD_RECOVERY/);
  assert.doesNotMatch(confirmedPageBody, /resetPasswordForm/);
});

test('script.js: the confirmation callback handles error params, never double-processes a code, checks email_confirmed_at, and cleans the URL', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');

  // Never runs twice for the same page load - a `code` is single-use on
  // Supabase's side (spec §3 item 4).
  assert.match(source, /let emailConfirmationCallbackHandled = false;/);
  assert.match(source, /if \(emailConfirmationCallbackHandled\) return;\s*\n\s*emailConfirmationCallbackHandled = true;/);

  const confirmedPageBody = source.match(
    /async function initEmailConfirmedPage\(\) \{([\s\S]*?)\n\}/
  )?.[1];
  assert.ok(confirmedPageBody, 'expected to find initEmailConfirmedPage() body');

  // Detects Supabase's own error redirect (spec §3 item: error/error_code/
  // error_description), distinct from a successful `code` exchange.
  assert.match(confirmedPageBody, /error_code/);
  assert.match(confirmedPageBody, /callbackParams\.get\('error'\)/);

  // getSession() is read before exchangeCodeForSession() is ever attempted,
  // and the exchange is gated on both a code being present AND no session
  // existing yet (spec §3 items 2-3).
  assert.match(confirmedPageBody, /getSession\(\)/);
  assert.match(
    confirmedPageBody,
    /if \(code && !data\?\.session\) \{\s*\n\s*const \{ error \} = await client\.auth\.exchangeCodeForSession\(code\);/
  );

  // Confirms the account actually has a confirmed email before declaring
  // success (spec §3 item 5).
  assert.match(confirmedPageBody, /email_confirmed_at/);

  // The URL is only ever cleaned inside showInvalid()/showSuccess() - both
  // are only ever called once the callback has actually been processed
  // (after the error-param check, or after getSession()/exchangeCode
  // resolve), never eagerly before that (spec §3 item 7).
  assert.match(confirmedPageBody, /function showInvalid\(message\) \{\s*\n\s*window\.history\.replaceState/);
  assert.match(confirmedPageBody, /function showSuccess\(email\) \{\s*\n\s*window\.history\.replaceState/);
});

test('reading audio player: play/pause/continue button cycles through the right labels', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');

  const rendered = source.match(/function renderReadingAudioPlayerHtml\(snapshot\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(rendered, 'expected to find renderReadingAudioPlayerHtml() body');
  // Idle/stopped/completed -> "Reproducir"; playing -> "Pausar"; paused -> "Continuar".
  assert.match(
    rendered,
    /const playPauseLabel = isPlaying \? '⏸ Pausar' : isPaused \? '▶ Continuar' : '▶ Reproducir';/
  );

  const patched = source.match(/function updateReadingPlayerUI\(section, snapshot\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(patched, 'expected to find updateReadingPlayerUI() body');
  assert.match(
    patched,
    /playPauseBtn\.textContent = isPlaying \? '⏸ Pausar' : isPaused \? '▶ Continuar' : '▶ Reproducir';/
  );
});

test('reading audio player: markup keeps every required control (play/pause, rewind 5s, stop, voice, rate, time, progress)', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const rendered = source.match(/function renderReadingAudioPlayerHtml\(snapshot\) \{([\s\S]*?)^\}/m)?.[1];
  assert.ok(rendered, 'expected to find renderReadingAudioPlayerHtml() body');

  for (const needle of [
    'reading-audio-playpause-btn',
    'reading-audio-rewind-btn',
    'reading-audio-stop-btn',
    'reading-audio-voice-btn',
    'reading-audio-rate-btn',
    'reading-audio-progress',
    'reading-audio-time',
    'reading-audio-percent'
  ]) {
    assert.ok(rendered.includes(needle), `expected reading audio player markup to keep .${needle}`);
  }
});

test('reading audio player: is compact (~54-66px tall on desktop, 4-5px progress bar, 36-40px buttons)', () => {
  const css = fs.readFileSync(path.join(__dirname, 'src', 'css', 'styles.css'), 'utf8');

  const playerRule = css.match(/\.reading-audio-player \{([\s\S]*?)\}/)?.[1];
  assert.ok(playerRule, 'expected .reading-audio-player rule');
  const paddingMatch = playerRule.match(/padding:\s*([\d.]+)rem\s+[\d.]+rem;/);
  assert.ok(paddingMatch, 'expected .reading-audio-player padding');
  const verticalPaddingPx = parseFloat(paddingMatch[1]) * 16;
  assert.ok(
    verticalPaddingPx >= 6 && verticalPaddingPx <= 12,
    `expected ~8-10px vertical padding, got ${verticalPaddingPx}px`
  );

  const btnRule = css.match(/\.reading-audio-btn \{([\s\S]*?)\}/)?.[1];
  assert.ok(btnRule, 'expected .reading-audio-btn rule');
  const btnHeightMatch = btnRule.match(/min-height:\s*(\d+)px;/);
  assert.ok(btnHeightMatch, 'expected .reading-audio-btn min-height');
  const btnHeight = parseInt(btnHeightMatch[1], 10);
  assert.ok(btnHeight >= 36 && btnHeight <= 40, `expected buttons 36-40px tall, got ${btnHeight}px`);

  // .reading-audio-progress also appears inside a @media override (just a
  // flex-basis tweak) - pick the base rule, the one that actually sets height.
  const progressRule = [...css.matchAll(/\.reading-audio-progress \{([\s\S]*?)\}/g)]
    .map((m) => m[1])
    .find((body) => /height:/.test(body));
  assert.ok(progressRule, 'expected .reading-audio-progress base rule with a height');
  const progressHeightMatch = progressRule.match(/height:\s*(\d+)px;/);
  assert.ok(progressHeightMatch, 'expected .reading-audio-progress height');
  const progressHeight = parseInt(progressHeightMatch[1], 10);
  assert.ok(
    progressHeight >= 4 && progressHeight <= 5,
    `expected a 4-5px progress bar, got ${progressHeight}px`
  );

  const totalHeight = verticalPaddingPx * 2 + btnHeight;
  assert.ok(
    totalHeight >= 54 && totalHeight <= 66,
    `expected total player height ~54-66px on desktop, computed ${totalHeight}px`
  );

  // Single row on desktop: controls, rate group, progress bar and time/status
  // metadata all live inside the one flex-wrap .reading-audio-controls row
  // (no more separate stacked label/progress/meta blocks).
  const controlsRule = css.match(/\.reading-audio-controls \{([\s\S]*?)\}/)?.[1];
  assert.match(controlsRule, /display:\s*flex;/);
  assert.match(controlsRule, /flex-wrap:\s*wrap;/);
});

test('LanguagePair.t(): translates app-wide UI chrome strings into spanish/english/french and falls back to Spanish', () => {
  assert.equal(LanguagePair.t('loginBtn', 'spanish'), 'Iniciar sesión');
  assert.equal(LanguagePair.t('loginBtn', 'english'), 'Log in');
  assert.equal(LanguagePair.t('loginBtn', 'french'), 'Se connecter');
  // Unsupported bridge language (e.g. italian/german, no course content yet)
  // falls back to Spanish, same rule as every other table in this file.
  assert.equal(LanguagePair.t('loginBtn', 'italian'), LanguagePair.t('loginBtn', 'spanish'));
  // Unknown key never throws, returns the raw key back.
  assert.equal(LanguagePair.t('thisKeyDoesNotExist', 'english'), 'thisKeyDoesNotExist');

  // A representative sample across nav/footer/about/dashboard/auth/premium -
  // every key must actually be translated (not silently falling back to the
  // Spanish string) for all three fully-supported bridge languages.
  const sampleKeys = [
    'navHome',
    'navTranslator',
    'navAbout',
    'footerNavHeading',
    'footerRights',
    'aboutTitle',
    'aboutWhatTitle',
    'aboutStartFreeBtn',
    'dashboardLoadingPanel',
    'authSendLink',
    'authEnterCode',
    'premiumGetBtn',
    'translatorSelectDifferent'
  ];
  for (const key of sampleKeys) {
    const es = LanguagePair.t(key, 'spanish');
    const en = LanguagePair.t(key, 'english');
    const fr = LanguagePair.t(key, 'french');
    assert.notEqual(en, es, `expected an actual English translation for "${key}", not the Spanish fallback`);
    assert.notEqual(fr, es, `expected an actual French translation for "${key}", not the Spanish fallback`);
    assert.notEqual(en, key, `expected "${key}" to be translated, not returned as the raw key`);
  }
});

test('language-pair.js: UI_STRINGS has the exact same key set for spanish/english/french (no missing translations)', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'language-pair.js'), 'utf8');
  const block = source.match(
    /const UI_STRINGS = \{\n {4}spanish: \{([\s\S]*?)\n {4}\},\n {4}english: \{([\s\S]*?)\n {4}\},\n {4}french: \{([\s\S]*?)\n {4}\}\n {2}\};/
  );
  assert.ok(block, 'expected to find the UI_STRINGS table with spanish/english/french blocks');

  const keysOf = (body) =>
    [...body.matchAll(/^\s*(\w+):/gm)].map((m) => m[1]).sort();

  const spanishKeys = keysOf(block[1]);
  const englishKeys = keysOf(block[2]);
  const frenchKeys = keysOf(block[3]);
  assert.ok(spanishKeys.length > 30, 'expected a substantial UI_STRINGS table, not a stub');
  assert.deepEqual(englishKeys, spanishKeys, 'english UI_STRINGS is missing/has extra keys vs spanish');
  assert.deepEqual(frenchKeys, spanishKeys, 'french UI_STRINGS is missing/has extra keys vs spanish');
});

test('index.html: nav, footer and About section text is driven by data-i18n, not hardcoded Spanish', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const key of [
    'skipLink',
    'menuToggleAria',
    'navHome',
    'navLearnVisitor',
    'navPremium',
    'navTranslator',
    'navAbout',
    'navLearnMember',
    'navTutor',
    'loginBtn',
    'signupBtn',
    'logoutBtn',
    'footerNavHeading',
    'footerContactHeading',
    'footerRights',
    'aboutBadge',
    'aboutTitle',
    'aboutWhatTitle',
    'aboutHowTitle',
    'aboutIncludesTitle',
    'aboutCreatorTitle',
    'aboutContactTitle',
    'premiumGetBtn',
    'authSendLink'
  ]) {
    assert.match(
      html,
      new RegExp(`data-i18n(-aria-label)?="${key}"`),
      `expected index.html to have a data-i18n (or data-i18n-aria-label) for "${key}"`
    );
  }
});

test('script.js: applyInterfaceLanguage() exists, patches data-i18n/-aria-label/-placeholder elements, and is wired to every bridgeLanguage change', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');

  const body = source.match(/function applyInterfaceLanguage\(bridgeLanguage\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(body, 'expected to find applyInterfaceLanguage() body');
  assert.match(body, /data-i18n/);
  assert.match(body, /data-i18n-aria-label/);
  assert.match(body, /data-i18n-placeholder/);
  assert.match(body, /LanguagePair\.t\(/);
  assert.match(body, /refreshLanguagePairChrome\(\);/);

  // Every place bridgeLanguage is actually reassigned must re-apply the
  // interface language - otherwise switching L1 would leave stale-language
  // chrome on screen until the next unrelated re-render (spec §2).
  const setBridgeBody = source.match(/function setBridgeLanguage\(bridgeName, options = \{\}\) \{([\s\S]*?)\n\}/)?.[1];
  assert.match(setBridgeBody, /applyInterfaceLanguage\(bridgeName\);/);

  const swapBody = source.match(/function swapLearningPathLanguages\(\) \{([\s\S]*?)\n\}/)?.[1];
  assert.match(swapBody, /applyInterfaceLanguage\(swapped\.bridge\);/);

  const applyPrefsBody = source.match(/function applyPreferencesToSelects\(preferences\) \{([\s\S]*?)\n\}/)?.[1];
  assert.match(applyPrefsBody, /applyInterfaceLanguage\(learningPathState\.bridgeLanguage\);/);
});

test('script.js: L2 (target language) still drives the learning content, independent of L1', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  // loadLearningPath (the function that fetches/renders lesson content) is
  // keyed off learningPathState.language (L2), never off bridgeLanguage (L1)
  // - the two stay independent axes, per spec §2's example (bridge=spanish,
  // target=english -> Spanish interface, English content).
  assert.match(source, /function setTargetLanguage\(lang, options = \{\}\) \{/);
  const setTargetBody = source.match(/function setTargetLanguage\(lang, options = \{\}\) \{([\s\S]*?)\n\}/)?.[1];
  assert.match(setTargetBody, /learningPathState\.language = resolved;/);
  assert.doesNotMatch(setTargetBody, /learningPathState\.bridgeLanguage = resolved;/);
});

test('LanguagePair: same-language pairs are rejected because L1 and L2 must differ', () => {
  for (const lang of ['spanish', 'english', 'french']) {
    assert.equal(
      LanguagePair.isLanguagePairSupported(lang, lang),
      false,
      `expected ${lang}->${lang} to be rejected`
    );
  }
  assert.equal(LanguagePair.isLanguagePairSupported('italian', 'italian'), false);
  assert.equal(LanguagePair.isLanguagePairSupported('german', 'german'), false);
});

test('LanguagePair.getLearningMode(): "bilingual" for distinct languages, "direct" for L1 = L2', () => {
  assert.equal(LanguagePair.getLearningMode('spanish', 'english'), 'bilingual');
  assert.equal(LanguagePair.getLearningMode('english', 'french'), 'bilingual');
  assert.equal(LanguagePair.getLearningMode('spanish', 'spanish'), 'direct');
  assert.equal(LanguagePair.getLearningMode('english', 'english'), 'direct');
  assert.equal(LanguagePair.getLearningMode('french', 'french'), 'direct');
});

test('LanguagePair.getLanguagePairLabel(): supported pairs always identify distinct L1 support and L2 target', () => {
  assert.equal(
    LanguagePair.getLanguagePairLabel('spanish', 'english'),
    'Aprenderás inglés con apoyo en español.'
  );
});

test('LanguagePair.getLearningSupport(): direct mode returns definitions/examples/image in L2, never a translation', () => {
  const item = {
    word: { english: 'teacher' },
    translationSupport: { spanish: 'profesor' },
    examples: ['Old bilingual example - should not be used in direct mode.'],
    directSupport: {
      definition: 'A person who helps students learn.',
      simpleDefinition: 'Someone who teaches.',
      synonyms: ['instructor'],
      contextExamples: ['My teacher is very kind.', 'The teacher writes on the board.'],
      image: '/img/teacher.webp',
      imageAlt: 'A teacher helping a student at a desk'
    }
  };
  const support = LanguagePair.getLearningSupport({
    item,
    bridgeLanguage: 'english',
    targetLanguage: 'english',
    learningMode: 'direct'
  });
  assert.equal(support.mode, 'direct');
  assert.equal(support.word, 'teacher');
  assert.equal(support.definition, 'A person who helps students learn.');
  assert.equal(support.simpleDefinition, 'Someone who teaches.');
  assert.deepEqual(support.synonyms, ['instructor']);
  assert.deepEqual(support.examples, ['My teacher is very kind.', 'The teacher writes on the board.']);
  assert.equal(support.image, '/img/teacher.webp');
  assert.equal(support.imageAlt, 'A teacher helping a student at a desk');
  assert.equal(support.translation, undefined, 'direct mode must never surface a translation field');
});

test('LanguagePair.getLearningSupport(): bilingual mode returns the L1 translation, no direct-mode fields', () => {
  const item = {
    word: { english: 'teacher' },
    translationSupport: { spanish: 'profesor' },
    examples: ['My teacher is very kind.'],
    directSupport: { definition: 'Should not be used in bilingual mode.' }
  };
  const support = LanguagePair.getLearningSupport({
    item,
    bridgeLanguage: 'spanish',
    targetLanguage: 'english',
    learningMode: 'bilingual'
  });
  assert.equal(support.mode, 'bilingual');
  assert.equal(support.word, 'teacher');
  assert.equal(support.translation, 'profesor');
  assert.deepEqual(support.examples, ['My teacher is very kind.']);
  assert.equal(support.definition, undefined, 'bilingual mode must never surface direct-mode definition fields');
});

test('LanguagePair.getLearningSupport(): learningMode defaults to the derived mode when not passed explicitly', () => {
  const item = { word: { english: 'house' }, translationSupport: { spanish: 'casa' } };
  const bilingual = LanguagePair.getLearningSupport({ item, bridgeLanguage: 'spanish', targetLanguage: 'english' });
  assert.equal(bilingual.mode, 'bilingual');
  const direct = LanguagePair.getLearningSupport({ item, bridgeLanguage: 'english', targetLanguage: 'english' });
  assert.equal(direct.mode, 'direct');
});

test('script.js: setBridgeLanguage()/setTargetLanguage() reject unsupported and same-language pairs', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.doesNotMatch(
    source,
    /El idioma de apoyo y el idioma que aprendes deben ser diferentes/,
    'the old "choose two different languages" rejection message must be gone from the learning-path selector'
  );

  const setBridgeBody = source.match(/function setBridgeLanguage\(bridgeName, options = \{\}\) \{([\s\S]*?)\n\}/)?.[1];
  assert.doesNotMatch(setBridgeBody, /bridgeName === target/);
  assert.match(setBridgeBody, /LanguagePair\.isLanguagePairSupported\(bridgeName, target\)/);

  const setTargetBody = source.match(/function setTargetLanguage\(lang, options = \{\}\) \{([\s\S]*?)\n\}/)?.[1];
  assert.doesNotMatch(setTargetBody, /resolved === learningPathState\.bridgeLanguage/);
  assert.match(setTargetBody, /LanguagePair\.isLanguagePairSupported\(learningPathState\.bridgeLanguage, resolved\)/);
});

test('script.js: learningPathState.learningMode is kept in sync with bridge/target on every change', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(source, /function syncLearningMode\(\) \{([\s\S]*?)\n\}/);

  const setBridgeBody = source.match(/function setBridgeLanguage\(bridgeName, options = \{\}\) \{([\s\S]*?)\n\}/)?.[1];
  assert.match(setBridgeBody, /syncLearningMode\(\);/);

  const setTargetBody = source.match(/function setTargetLanguage\(lang, options = \{\}\) \{([\s\S]*?)\n\}/)?.[1];
  assert.match(setTargetBody, /syncLearningMode\(\);/);

  const swapBody = source.match(/function swapLearningPathLanguages\(\) \{([\s\S]*?)\n\}/)?.[1];
  assert.match(swapBody, /syncLearningMode\(\);/);

  const loadPathBody = source.match(
    /async function performLearningPathLoad\(options = \{\}\) \{([\s\S]*?)\n  const graphContainer/
  )?.[1];
  assert.match(loadPathBody, /syncLearningMode\(\);/);
});

test('lib/preferencesService.js: rejects bridgeLanguage === language through shared pair validation', () => {
  const source = fs.readFileSync(path.join(__dirname, 'lib', 'preferencesService.js'), 'utf8');
  assert.match(source, /isLanguagePairSupported\(nextBridge, nextLanguage\)/);
});

test('progress stays separated by targetLanguage/level/skill regardless of learningMode (spec §11) - lesson slugs never depend on bridgeLanguage', () => {
  // Practice results are keyed by lesson slug (getSkillActivities/exerciseResults),
  // and every lesson slug is generated from language+level+skill/unit -
  // switching bridgeLanguage (and therefore learningMode) never changes
  // which slug a given target-language/level/skill activity has, so
  // switching between bilingual and direct for the same target/level can
  // never merge or reset progress recorded under the other mode.
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(source, /exerciseResults: \{\}/);
  assert.doesNotMatch(
    source,
    /exerciseResults\[.*bridgeLanguage/,
    'exerciseResults must stay keyed by lesson slug, never by bridgeLanguage/learningMode'
  );
});

function unit1VocabularyOf(contentFile) {
  const content = require(path.join(__dirname, 'scripts', 'content', contentFile));
  const unit1 = content.units.find((u) => u.order === 1);
  assert.ok(unit1, `expected an order:1 unit in ${contentFile}`);
  const vocab = unit1.activities?.vocabulary?.vocabulary;
  assert.ok(Array.isArray(vocab) && vocab.length, `expected a non-empty vocabulary list in ${contentFile} unit 1`);
  return vocab;
}

test('direct-mode pilot content: English/French/Spanish A1 Unit 1 vocabulary all have real directSupport (definition, simpleDefinition, up to 3 examples, no image placeholders)', () => {
  const pilots = [
    ['english-a1-units.js', 'english'],
    ['french-a1-units.js', 'french'],
    ['spanish-a1-units.js', 'spanish']
  ];

  for (const [file, lang] of pilots) {
    const vocab = unit1VocabularyOf(file);
    for (const item of vocab) {
      const support = item.directSupport;
      assert.ok(support, `${lang} unit 1 word "${item.word}" is missing directSupport`);
      assert.ok(
        typeof support.definition === 'string' && support.definition.trim().length > 0,
        `${lang} "${item.word}": definition must be a non-empty string`
      );
      assert.ok(
        typeof support.simpleDefinition === 'string' && support.simpleDefinition.trim().length > 0,
        `${lang} "${item.word}": simpleDefinition must be a non-empty string`
      );
      // Spec §6: A1 definitions stay short (5-12 words) and simple.
      const wordCount = support.simpleDefinition.trim().split(/\s+/).length;
      assert.ok(
        wordCount <= 14,
        `${lang} "${item.word}": simpleDefinition should be a short A1 phrase, got ${wordCount} words`
      );
      assert.ok(Array.isArray(support.contextExamples), `${lang} "${item.word}": contextExamples must be an array`);
      assert.ok(
        support.contextExamples.length >= 1 && support.contextExamples.length <= 3,
        `${lang} "${item.word}": spec §6 caps A1 examples at 2-3, got ${support.contextExamples.length}`
      );
      // Spec §10: never add an image/imageAlt without a real, useful asset -
      // this pilot has none, so neither field should be present at all
      // (an empty string would still be a "no image" signal downstream, but
      // asserting absence here catches an accidental placeholder being added).
      assert.equal(support.image, undefined, `${lang} "${item.word}": must not have a placeholder image yet`);
    }
  }
});

test('script.js: normalizeVocabularyItem() preserves bilingual translation for every supported distinct L1/L2 pair', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(source, /function normalizeVocabularyItem\(/);
  assert.match(source, /LanguagePair\.getLearningMode\(resolvedBridge, targetLanguage\)/);
  assert.match(source, /translation: support \? '' : resolveVocabTranslation\(item, resolvedBridge\)/);
  for (const pair of LanguagePair.LANGUAGE_PAIRS) {
    assert.notEqual(pair.bridge, pair.target);
    assert.equal(LanguagePair.getLearningMode(pair.bridge, pair.target), 'bilingual');
  }
});

test('script.js: renderVocabCardHtml() safely gates optional definition, synonyms, opposites and image fields', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(source, /function renderVocabCardHtml\(/);
  assert.match(source, /item\.image\s*\?\s*`<img class="vocab-card-image"/);
  assert.match(source, /item\.simpleDefinition \|\| item\.definition/);
  assert.match(source, /if \(item\.synonyms\?\.length\)/);
  assert.match(source, /if \(item\.opposites\?\.length\)/);
});

test('C1/C2 direct-mode vocabulary shows translation and contextual examples by default', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(source, /class="secondary-btn vocab-l1-translation-btn/);
  assert.match(source, /learningMode === 'direct' && \['C1', 'C2'\]\.includes/);
  assert.match(source, /item\.simpleDefinition \|\| item\.definition/);
  assert.match(source, /let vocabL1TranslationVisible = true/);
  assert.match(source, /\$\{contextsHtml\}/);
  assert.match(source, /loadMissingAdvancedVocabTranslations/);
  assert.match(source, /targetLanguage: 'spanish'/);
});

test('Vocabulary exposes L2 useful expressions separately and comprehension questions use vocabulary terms only', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(source, /Useful expressions/);
  assert.match(source, /Des expressions utiles/);
  assert.match(source, /Expresiones útiles/);
  assert.match(source, /Espressioni utili/);
  assert.match(source, /Nützliche Ausdrücke/);
  assert.match(source, /class="secondary-btn vocab-useful-expressions-toggle"/);
  assert.match(source, /function isVocabularyTermExercise/);
  assert.match(source, /const vocabularyExercises = \(lesson\.exercises \|\| \[\]\)\.filter/);
  assert.match(source, /renderPrintableExerciseList\(vocabularyExercises/);
  assert.match(source, /function tutorReplyEndsWithQuestion/);
  assert.match(source, /class="vocab-card-context-info"/);
});

test('language-pair.js: vocabSynonyms/vocabOpposites are translated in spanish/english/french', () => {
  assert.equal(LanguagePair.t('vocabSynonyms', 'spanish'), 'Sinónimos');
  assert.equal(LanguagePair.t('vocabSynonyms', 'english'), 'Synonyms');
  assert.equal(LanguagePair.t('vocabSynonyms', 'french'), 'Synonymes');
  assert.equal(LanguagePair.t('vocabOpposites', 'spanish'), 'Antónimos');
  assert.equal(LanguagePair.t('vocabOpposites', 'english'), 'Opposites');
  assert.equal(LanguagePair.t('vocabOpposites', 'french'), 'Contraires');
});

test('direct-mode pilot content end-to-end: getLearningSupport() on a real authored English A1 Unit 1 word returns L2 definition/examples, no translation', () => {
  const vocab = unit1VocabularyOf('english-a1-units.js');
  const teacher = vocab.find((v) => v.word === 'Teacher');
  assert.ok(teacher, 'expected "Teacher" in English A1 Unit 1 vocabulary');

  const support = LanguagePair.getLearningSupport({
    item: teacher,
    bridgeLanguage: 'english',
    targetLanguage: 'english',
    learningMode: 'direct'
  });
  assert.equal(support.mode, 'direct');
  assert.equal(support.word, 'Teacher');
  assert.equal(support.definition, 'A person who helps students learn.');
  assert.deepEqual(support.examples, ['My teacher is Mr. Green.', 'The teacher writes on the board.']);
  assert.equal(support.translation, undefined);
});

// ---------------------------------------------------------------------
// L1 = L2 integration/verification pass (post-migration 202607200001):
// full save -> read-back -> learningMode flow for every combination in
// scope, run against lib/preferencesService.js directly (devStore-backed
// in this test environment, same code path production hits when Supabase
// is configured) - not just unit-level LanguagePair assertions.
// ---------------------------------------------------------------------

test('preferencesService + LanguagePair: full round trip (save, read back, learningMode) for every in-scope combination', async () => {
  const preferencesService = require('./lib/preferencesService');
  const crypto = require('crypto');

  // Forces the devStore branch (same pattern as the resendConfirmation/
  // requestPasswordReset test above) - this environment has a real Supabase
  // project configured, and these userIds are throwaway UUIDs with no
  // matching row in public.profiles, so hitting the real Supabase branch
  // would silently update 0 rows and read back nothing but defaults. Never
  // touches real Supabase data either way.
  const originalIsSupabaseConfigured = config.isSupabaseConfigured;
  config.isSupabaseConfigured = false;
  try {
    const combos = [
      { label: 'A. Spanish -> English', bridgeLanguage: 'spanish', language: 'english', expectedMode: 'bilingual' },
      { label: 'B. English -> French', bridgeLanguage: 'english', language: 'french', expectedMode: 'bilingual' },
      { label: 'C. French -> Spanish', bridgeLanguage: 'french', language: 'spanish', expectedMode: 'bilingual' }
    ];

    for (const combo of combos) {
      const userId = crypto.randomUUID();

      // Selección + guardado (equivalent to the client calling PUT /api/preferences).
      const saved = await preferencesService.updatePreferences(userId, {
        language: combo.language,
        level: 'A1',
        bridgeLanguage: combo.bridgeLanguage
      });
      assert.equal(saved.language, combo.language, `${combo.label}: save should return the saved target language`);
      assert.equal(
        saved.bridgeLanguage,
        combo.bridgeLanguage,
        `${combo.label}: save should return the saved bridge language`
      );

      // Persistencia tras recargar / restauración al iniciar sesión: a
      // SEPARATE read (equivalent to GET /api/preferences on next load),
      // not just the object updatePreferences happened to return, so a bug
      // that "worked" only in-memory but didn't actually persist would fail
      // this. The equal pair must come back exactly as saved - no silent
      // fallback to spanish/english defaults.
      const restored = await preferencesService.getPreferences(userId);
      assert.equal(restored.language, combo.language, `${combo.label}: restored target language must match`);
      assert.equal(
        restored.bridgeLanguage,
        combo.bridgeLanguage,
        `${combo.label}: restored bridge language must match (equal pairs must not be replaced by defaults)`
      );

      // learningMode recalculado desde los dos campos restaurados - nunca
      // desde un valor separado que pudiera desincronizarse.
      assert.equal(
        LanguagePair.getLearningMode(restored.bridgeLanguage, restored.language),
        combo.expectedMode,
        `${combo.label}: expected learningMode "${combo.expectedMode}"`
      );
      assert.equal(
        LanguagePair.isLanguagePairSupported(restored.bridgeLanguage, restored.language),
        true,
        `${combo.label}: pair must be accepted as supported`
      );
    }
  } finally {
    config.isSupabaseConfigured = originalIsSupabaseConfigured;
  }
});

test('preferencesService: an unsupported language is still rejected (admitted-language validation preserved)', async () => {
  const preferencesService = require('./lib/preferencesService');
  const crypto = require('crypto');
  const userId = crypto.randomUUID();

  await assert.rejects(
    () => preferencesService.updatePreferences(userId, { language: 'klingon', level: 'A1', bridgeLanguage: 'spanish' }),
    /Idioma no válido/,
    'an unrecognized target language must still be rejected'
  );
  await assert.rejects(
    () =>
      preferencesService.updatePreferences(userId, { language: 'english', level: 'A1', bridgeLanguage: 'klingon' }),
    /Idioma puente no válido/,
    'an unrecognized bridge language must still be rejected'
  );
});

test('index.html + script.js: no direct-method badge is exposed and equal choices are disabled', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /id="pathPairModeBadge"/);

  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.doesNotMatch(source, /pathPairModeBadge/);
  assert.match(source, /function syncLanguagePairSelectOptions\(\)/);
  assert.match(source, /option\.disabled = option\.value === learningPathState\.bridgeLanguage/);
  assert.match(source, /option\.disabled = option\.value === learningPathState\.language/);
});

test('index.html: the L1 and L2 selects both offer the same three languages - neither hides the other\'s current value', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const bridgeOptions = html.match(/<select id="pathBridgeSelect">([\s\S]*?)<\/select>/)?.[1];
  const targetOptions = html.match(/<select id="pathLanguageSelect">([\s\S]*?)<\/select>/)?.[1];
  assert.ok(bridgeOptions && targetOptions, 'expected both language-pair selects in index.html');

  const valuesOf = (block) => [...block.matchAll(/<option value="(\w+)"/g)].map((m) => m[1]).sort();
  assert.deepEqual(valuesOf(bridgeOptions), ['english', 'french', 'spanish']);
  assert.deepEqual(valuesOf(targetOptions), ['english', 'french', 'spanish']);
  // No disabled/hidden attribute on any option - nothing filters out the
  // language already chosen in the other select.
  assert.doesNotMatch(bridgeOptions, /disabled|hidden/);
  assert.doesNotMatch(targetOptions, /disabled|hidden/);
});

test('LanguagePair.getLearningSupport(): direct mode never breaks or shows undefined/null for a word with no directSupport authored yet (spec §8 fallback)', () => {
  const bareItem = { word: 'Umbrella', translation: 'Paraguas', example: 'Take an umbrella, it might rain.' };
  const support = LanguagePair.getLearningSupport({
    item: bareItem,
    bridgeLanguage: 'english',
    targetLanguage: 'english',
    learningMode: 'direct'
  });
  assert.equal(support.mode, 'direct');
  assert.equal(support.translation, undefined, 'direct mode must never surface a translation, even as a fallback');
  // Every field is a safe, renderable value (empty string/array/null) -
  // never literally undefined/null in a way a template would print as text.
  assert.equal(typeof support.definition, 'string');
  assert.equal(typeof support.simpleDefinition, 'string');
  assert.ok(Array.isArray(support.synonyms));
  assert.ok(Array.isArray(support.opposites));
  assert.equal(typeof support.usageNote, 'string');
  assert.ok(Array.isArray(support.examples));
  assert.equal(support.image, null);
  assert.equal(typeof support.imageAlt, 'string');
});

test('script.js: renderVocabCardHtml never prints "undefined"/"null" and skips the image block when item.image is empty', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(source, /function renderVocabCardHtml\(/);
  assert.match(source, /\$\{\s*item\.image\s*\?/);
  assert.match(source, /item\.simpleDefinition \|\| item\.definition/);
  assert.match(source, /synonymsOppositesParts\.length\s*\?/);
  assert.match(source, /item\.usageNote\s*\?/);
});

test('Writing offers local predictive suggestions that learners can accept with Tab or a click', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(source, /writing-predictive-accept/);
  assert.match(source, /event\.key === 'Tab' && currentPrediction/);
  assert.match(source, /acceptPrediction\(\)/);
  assert.match(source, /usefulPhrases\.find/);
});

test('Predictive text capabilities are enabled for static, dynamic and speech-filled text fields', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const setup =
    source.match(/function enablePredictiveTextFields\(root = document\) \{([\s\S]*?)\n\}/)?.[1] ||
    '';
  assert.match(setup, /textarea, input\[type="text"\], input\[type="search"\], \[contenteditable="true"\]/);
  assert.match(setup, /field\.spellcheck = true/);
  assert.match(setup, /setAttribute\('autocorrect', 'on'\)/);
  assert.match(setup, /setAttribute\('autocapitalize', 'sentences'\)/);
  assert.match(source, /new MutationObserver/);
  assert.match(source, /observer\.observe\(document\.body, \{ childList: true, subtree: true \}\)/);
  assert.match(source, /transcriptEl\.dispatchEvent\(new Event\('input', \{ bubbles: true \}\)\)/);
});

test('Vocabulary practice uses 6 words at A1/A2, 8 at B1/B2 and 10 at C1/C2 with A-D scoring', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const countFunction =
    source.match(/function getVocabularyPracticeCount\([\s\S]*?\n\}/)?.[0] || '';
  assert.match(countFunction, /level === 'A1' \|\| level === 'A2'\) return 6/);
  assert.match(countFunction, /level === 'B1' \|\| level === 'B2'\) return 8/);
  assert.match(countFunction, /return 10/);
  assert.match(source, /function createVocabularyPractice/);
  assert.match(source, /String\.fromCharCode\(65 \+ optionIndex\)/);
  assert.match(source, /class="primary-btn vocab-practice-submit-btn"/);
  assert.match(source, /Math\.round\(\(correctCount \/ runtime\.questions\.length\) \* 100\)/);
  assert.match(source, /Correct answer/);
  assert.match(source, /Practicar con Tutor IA/);
});

test('Vocabulary opens with a gamified mission and updates mastery progress live', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'src', 'css', 'styles.css'), 'utf8');
  assert.match(source, /function renderVocabularyMissionHtml/);
  assert.match(source, /class="vocab-mission"/);
  assert.match(source, /Gira/);
  assert.match(source, /Escucha/);
  assert.match(source, /Domina/);
  assert.match(source, /querySelector\('\.vocab-mission-progress'\)/);
  assert.match(source, /querySelector\('\.vocab-mission-mastered'\)/);
  assert.match(css, /\.vocab-mission-progress/);
});

test('Tutor IA teaches requested structures as a CEFR-adapted teacher-guide', () => {
  const source = fs.readFileSync(path.join(__dirname, 'lib', 'aiTutorService.js'), 'utf8');
  assert.match(source, /actúa como un docente-guía dispuesto a enseñar a un alumno curioso/);
  assert.match(source, /para qué sirve y qué significado comunica/);
  assert.match(source, /error frecuente/);
  assert.match(source, /microcomprobación/);
  assert.match(source, /isStructureExplanation/);
});

test('Speaking Tutor accepts valid paraphrases and separates errors from optional style improvements', () => {
  const service = fs.readFileSync(path.join(__dirname, 'lib', 'aiTutorService.js'), 'utf8');
  assert.match(service, /Evaluate communicative validity, not similarity to one expected or model answer/);
  assert.match(service, /correct and understandable but optionally improvable/);
  assert.match(service, /never describe a stylistic preference as an error/);
  assert.match(service, /Accept legitimate synonyms, paraphrases, word orders, levels of politeness and regional variants/);
  assert.match(service, /Je voudrais savoir combien coûtent les tomates/);
  assert.match(service, /The model must preserve the student’s original intention/);
  assert.match(service, /do not mark it wrong/);
  assert.match(service, /Do not compare against a hidden canonical sentence/);
});

test('Tutor word limits are maxima only and voice turns continue without a two-second send delay', () => {
  const service = fs.readFileSync(path.join(__dirname, 'lib', 'aiTutorService.js'), 'utf8');
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const guidance =
    service.match(/const LEVEL_RESPONSE_GUIDANCE = \{([\s\S]*?)\n\};/)?.[1] || '';
  const autoSend =
    source.match(/function scheduleTutorAutoSend\(textareaId\) \{([\s\S]*?)\n\}/)?.[1] || '';

  assert.match(guidance, /MÁXIMO orientativo de 90 palabras, nunca un mínimo/);
  assert.match(guidance, /MÁXIMO orientativo de 220 palabras, nunca un mínimo/);
  assert.doesNotMatch(guidance, /responde normalmente entre|aproximadamente 120 a/);
  assert.match(autoSend, /\}, 0\)/);
  assert.doesNotMatch(autoSend, /2000|2 segundos/);
  assert.match(source, /const TUTOR_CONVERSATION_SILENCE_MS = 700/);
  assert.match(source, /function tutorReplyEndsWithQuestion/);
  assert.match(source, /activateTutorMicAfterQuestion\(messageEl\)/);
});

test('Listening keeps the story text hidden until the learner explicitly reveals it', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(source, /storyRevealed:\s*false/);
  assert.match(source, /class="secondary-btn listening-story-toggle"/);
  assert.match(source, /runtime\.storyRevealed \? listeningUiText\('Hide Text'/);
  assert.match(source, /runtime\.storyRevealed \? '' : 'hidden'/);
});

test('Listening links directly to unit Vocabulary and omits the old auxiliary-mode tabs', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const official = source.match(/function renderListeningOfficial\([\s\S]*?\n\}/)?.[0] || '';
  assert.match(official, /renderListeningConnectedToolsHtml/);
  assert.doesNotMatch(official, /renderListeningExtraModesHtml|listening-vocab-list/);
  assert.match(source, /data-listening-open-vocabulary/);
  assert.match(source, /openUnitSequenceStep\('vocabulary'/);
});

test('unit learning route follows Reading, Listening, Speaking, Grammar, Vocabulary, Writing and Verbs', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(
    source,
    /UNIT_LEARNING_SEQUENCE\s*=\s*\['reading', 'listening', 'speaking', 'grammar', 'vocabulary', 'writing'\]/
  );
  assert.match(source, /renderUnitSequenceStepsHtml/);
  assert.match(source, /data-sequence-skill="verbs"/);
  assert.match(source, /renderUnitVerbContext/);
});

test('lesson route keeps seven connected markers with current and completed states', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src/js/script.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'src/css/styles.css'), 'utf8');
  const routeRenderer =
    source.match(/function renderSkillUnitSequence\(section, lesson\) \{([\s\S]*?)\n\}/)?.[1] || '';
  assert.match(source, /class="unit-route-marker unit-route-marker--\$\{state\}"/);
  assert.match(source, /data-sequence-skill="verbs"/);
  assert.match(source, /aria-current="step"/);
  assert.match(source, /--route-progress-width:/);
  assert.match(source, /wireUnitSequence\(nav\)/);
  assert.match(
    source,
    /querySelectorAll\('\.unit-sequence-step, \.unit-route-marker'\)/
  );
  assert.match(
    source,
    /openUnitSequenceStep\(button\.dataset\.sequenceSkill, button\.dataset\.lessonSlug \|\| ''\)/
  );
  assert.match(routeRenderer, /const routeProgress =/);
  assert.doesNotMatch(routeRenderer, /unit-route-marker--locked|activity\.locked\s*\?/);
  assert.match(source, /if \(targetLesson\?\.locked\) \{\s*handleHomeAction\('upgrade'\)/);
  assert.doesNotMatch(
    source.match(/function getUnitProgressMetrics\(unitId\) \{([\s\S]*?)\n\}/)?.[1] || '',
    /currentIndex/
  );
  assert.match(css, /\.unit-route-markers::before/);
  assert.match(css, /\.unit-route-markers::after/);
  assert.match(css, /\.unit-route-marker--current/);
  assert.match(css, /\.unit-route-marker--completed/);
});

test('a selected unit opens Reading immediately and every skill tab stays inside that unit', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const selectUnitBody = source.match(/function selectUnit\(unitId, options = \{\}\) \{([\s\S]*?)\n\}/)?.[1] || '';
  const renderSkillBody = source.match(/function renderSkillView\(skill\) \{([\s\S]*?)\n\}/)?.[1] || '';
  assert.match(selectUnitBody, /item\.skill === 'reading'/);
  assert.match(selectUnitBody, /learningPathState\.activeSlug = firstActivity\?\.slug/);
  assert.match(renderSkillBody, /if \(!selected && learningPathState\.unitId\)/);
  assert.match(renderSkillBody, /item\.unitId === learningPathState\.unitId/);
  assert.doesNotMatch(
    renderSkillBody,
    /learningPathState\.skillEntryContext === 'route'\s*&&\s*learningPathState\.unitId/
  );
});

test('French A1 primary route mirrors English A1 while keeping standalone dialogues supplementary', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const coreSkills = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];
  for (const language of ['english', 'french']) {
    const rows = seedLessons.filter(
      (row) => row.target_language === language && row.level === 'A1'
    );
    const units = seedUnits.filter(
      (row) => row.target_language === language && row.level === 'A1'
    );
    assert.equal(units.length, 12);
    units.forEach((unit) => {
      const routeSkills = rows
        .filter((row) => row.unit_slug === unit.slug && coreSkills.includes(row.skill))
        .map((row) => row.skill)
        .sort();
      assert.deepEqual(routeSkills, [...coreSkills].sort(), `${language} ${unit.slug}`);
    });
  }
  assert.match(source, /UNIT_ROUTE_SKILLS = new Set\(UNIT_LEARNING_SEQUENCE\)/);
  assert.match(source, /UNIT_ROUTE_SKILLS\.has\(item\.skill\)/);
});

test('student journey presents practical curriculum guidance and preserves lesson context inside the mission', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'src', 'css', 'styles.css'), 'utf8');
  assert.doesNotMatch(source, /unitLessons\.map\(\(lesson\) => renderLessonItemHtml\(lesson, nextSlug\)\)/);
  assert.match(source, /class="path-unit-journey">Viaje/);
  assert.match(source, /class="path-unit-reward">/);
  assert.match(source, /function renderUnitSequenceStepsHtml/);
  assert.match(source, /lesson\.slug === learningPathState\.activeSlug/);
  assert.match(source, /aria-current="true"/);
  assert.match(source, /function renderLearningRouteContext\(\)/);
  assert.match(source, /french: 'Leçon'/);
  assert.match(html, /id="learningRouteContext"/);
  assert.match(css, /\.path-unit-journey/);
  assert.match(source, /class="lesson-continue-card"/);
  assert.doesNotMatch(source, /class="lesson-route-guide"/);
  assert.doesNotMatch(source, /<strong>Tu objetivo<\/strong>/);
  assert.doesNotMatch(source, /<strong>Al terminar podrás<\/strong>/);
  assert.match(source, /actividades completadas en/);
  assert.match(css, /\.lesson-continue-card/);
  assert.match(source, /renderContinueCard\(activeLesson, \{ selected: true \}\)/);
});

test('teacher curriculum panel is role-gated on both client and server', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const server = fs.readFileSync(path.join(__dirname, 'lib', 'server.js'), 'utf8');
  const entitlements = fs.readFileSync(
    path.join(__dirname, 'lib', 'entitlementsService.js'),
    'utf8'
  );
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.match(html, /class="teacher-only-nav" hidden/);
  assert.match(html, /id="teacherCurriculumPanel"/);
  assert.match(source, /\['teacher', 'ceo'\]\.includes\(authStatus\.entitlements\?\.role\)/);
  assert.match(server, /function requireCurriculumStaff/);
  assert.match(
    server,
    /\/api\/teacher\/curriculum-summary', requireAuth, requireCurriculumStaff/
  );
  assert.match(entitlements, /canViewCurriculum:\s*true/);
});

test('curriculum migrations remain private and register the teacher role', () => {
  const curriculumMigration = fs.readFileSync(
    path.join(
      __dirname,
      'supabase',
      'migrations',
      '202607310001_curriculum_mapping_layer.sql'
    ),
    'utf8'
  );
  const teacherMigration = fs.readFileSync(
    path.join(__dirname, 'supabase', 'migrations', '202607310002_teacher_role.sql'),
    'utf8'
  );
  assert.match(curriculumMigration, /revoke all[\s\S]*from anon, authenticated/i);
  assert.match(curriculumMigration, /to service_role[\s\S]*using \(true\)/i);
  assert.match(teacherMigration, /role in \('student', 'teacher', 'ceo'\)/);
});

test('unit and dashboard progress combine six lesson scores with persisted Verbos as a seventh activity', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const server = fs.readFileSync(path.join(__dirname, 'lib', 'server.js'), 'utf8');
  const dashboard = fs.readFileSync(path.join(__dirname, 'lib', 'dashboardService.js'), 'utf8');
  const migration = fs.readFileSync(
    path.join(__dirname, 'supabase', 'migrations', '202607240001_user_unit_verb_progress.sql'),
    'utf8'
  );
  assert.match(source, /function getUnitProgressMetrics/);
  assert.match(source, /activities\.length \+ 1/);
  assert.match(source, /Number\(item\.bestScore \|\| 0\)/);
  assert.match(source, /recordUnitVerbScore/);
  assert.match(server, /\/api\/verbs\/unit-progress/);
  assert.match(dashboard, /courseProgress/);
  assert.match(dashboard, /progressPercent:\s*totalActivities \? Math\.round\(scoreTotal \/ totalActivities\)/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /\(select auth\.uid\(\)\) = user_id/);
});

test('homepage and printable documents use the official ANDERGO logo and language controls below the language cards', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(html, /class="brand-logo-symbol" role="img"/);
  assert.match(
    fs.readFileSync(path.join(__dirname, 'src', 'css', 'styles.css'), 'utf8'),
    /\.brand-logo-symbol[\s\S]*?background-image:\s*url\('\/andergo-logo\.png'\)/
  );
  assert.match(html, /ANDERGO Language Academy/);
  assert.ok(
    html.indexOf('class="global-language-controls"') > html.indexOf('id="language-picker"') &&
      html.indexOf('class="global-language-controls"') < html.indexOf('id="premium"'),
    'language controls should sit below the available-language cards and before the plans'
  );
  assert.match(source, /class="skill-print-brand-image" src="\/andergo-logo\.png"/);
  const printHeader = source.match(/function renderSkillPrintHeaderHtml\(lesson\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(printHeader, 'expected shared printable-document header');
  assert.match(printHeader, /Idioma puente:/);
  assert.match(printHeader, /Idioma meta:/);
  assert.match(printHeader, /reading-print-date/);
  assert.doesNotMatch(printHeader, /ANDERGO Language Academy/);
});

test('reading card aligns with the full progress-bar width while keeping readable text lines', () => {
  const css = fs.readFileSync(path.join(__dirname, 'src', 'css', 'styles.css'), 'utf8');
  const card = css.match(/\.reading-reader-card \{([\s\S]*?)\n\}/)?.[1];
  const text = [...css.matchAll(/\.reading-text \{([\s\S]*?)\n\}/g)]
    .map((match) => match[1])
    .find((block) => /max-width:\s*1120px/.test(block));
  assert.ok(card && text);
  assert.match(card, /width:\s*100%/);
  assert.doesNotMatch(card, /820px/);
  assert.match(text, /max-width:\s*1120px/);
  assert.match(text, /margin-inline:\s*auto/);
});

test('printable Grammar/Vocabulary worksheets render normalized option objects as text', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const body = source.match(
    /function renderPrintableExerciseList\(exercises, \{ showAnswers = false \} = \{\}\) \{([\s\S]*?)\n\}/
  )?.[1];
  assert.ok(body, 'expected to find renderPrintableExerciseList() body');
  assert.match(
    body,
    /optionLabel\(option\)/,
    'print output must unwrap { id, text } options instead of rendering [object Object]'
  );
  assert.doesNotMatch(body, /escapeHtml\(option\)/);
});

test('Reading PDF starts at the normal page margin and Word includes comprehension questions', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'src', 'css', 'styles.css'), 'utf8');
  const wordExport = source.match(/function downloadReadingWord\(lesson\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(wordExport, 'expected Reading Word exporter');
  assert.match(wordExport, /renderPrintableExerciseList\(lesson\.exercises\)/);
  assert.match(wordExport, /Comprehension Questions/);
  assert.match(wordExport, /skill-print-question/);
  assert.match(
    css,
    /@media print[\s\S]*?\.skill-view-section,[\s\S]*?position:\s*static !important/
  );
});

test('script.js: language-pair label always describes L1 support for the distinct L2', () => {
  const langPairSource = fs.readFileSync(path.join(__dirname, 'src', 'js', 'language-pair.js'), 'utf8');
  const labelBody = langPairSource.match(/function getLanguagePairLabel\(bridgeLanguage, targetLanguage, interfaceLanguage\) \{([\s\S]*?)\n  \}/)?.[1];
  assert.ok(labelBody, 'expected to find getLanguagePairLabel() body');
  assert.match(labelBody, /PAIR_SENTENCE/);
  assert.doesNotMatch(labelBody, /PAIR_SENTENCE_DIRECT/);
});

test('Reading selections use the contextual ANDERGO translator and coordinated learning actions', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  assert.match(source, /closest\?\.\('\.reading-text'\)/);
  assert.match(source, /function readingWordContextAtPoint\(clientX, clientY\)/);
  assert.match(source, /if \(data\) openReadingTranslation\(data\)/);
  assert.match(source, /document\.addEventListener\('dblclick'/);
  assert.match(source, /isDoubleTap[\s\S]*?handleSelection\(event\)/);
  assert.doesNotMatch(source, /reading-translation-quick-btn/);
  assert.doesNotMatch(source, /class="reading-translation-context"/);
  assert.match(source, /context:\s*state\.context/);
  assert.match(source, /fetch\(`\$\{backendBaseUrl\}\/api\/translate`/);
  assert.match(source, /readingTranslationCache/);
  assert.match(source, /reading-translation-listen/);
  assert.match(source, /reading-translation-save/);
  assert.match(source, /reading-translation-tutor/);
  assert.match(source, /reading-translation-open/);
  assert.match(source, /Doble clic o dos toques: traduce, escucha, consulta o guarda palabras/);
  assert.match(
    source,
    /Cada lección ha sido nivelada según el MCERL \(Marco Común Europeo de Referencia de las Lenguas\)/
  );
});

test('Translator uses the available width, grows long text panels and prefers Latin American Spanish TTS', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const styles = fs.readFileSync(path.join(__dirname, 'src', 'css', 'styles.css'), 'utf8');
  const translatorLanguages = require('./src/js/translator-languages');

  assert.match(styles, /\.translator-workspace\s*\{[\s\S]*?max-width:\s*1400px/);
  assert.match(styles, /\.translator-grid \.tutor-input\s*\{[\s\S]*?max-height:\s*480px/);
  assert.match(source, /syncTranslatorTextareaHeights/);
  assert.match(source, /Google español de Estados Unidos[\s\S]*?Google español/);
  assert.equal(translatorLanguages.getTranslatorLanguage('spanish').locale, 'es-419');
  assert.equal(translatorLanguages.getTranslatorLanguage('haitianCreole').deeplSupported, true);
  assert.equal(translatorLanguages.getTranslatorLanguage('haitianCreole').deeplBase, 'HT');
  assert.equal(
    translatorLanguages.getSelectableLanguages().some((item) => item.key === 'haitianCreole'),
    true
  );
});

test('saved Reading vocabulary is Premium-only, secured in Supabase and rendered inside Vocabulary', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const serverSource = fs.readFileSync(path.join(__dirname, 'lib', 'server.js'), 'utf8');
  const tableMigration = fs.readFileSync(
    path.join(__dirname, 'supabase', 'migrations', '202607290001_reading_saved_vocabulary.sql'),
    'utf8'
  );
  const premiumMigration = fs.readFileSync(
    path.join(
      __dirname,
      'supabase',
      'migrations',
      '20260725031303_saved_vocabulary_premium_only.sql'
    ),
    'utf8'
  );
  assert.match(source, /\/api\/vocabulary\/saved/);
  assert.match(source, /saved-reading-vocabulary/);
  assert.match(source, /Guardar palabras en Vocabulary es una función Premium/);
  assert.doesNotMatch(source, /GUEST_SAVED_VOCABULARY_KEY|saveGuestVocabulary/);
  assert.match(serverSource, /async function requirePremiumSavedVocabulary/);
  assert.match(serverSource, /code:\s*'PREMIUM_REQUIRED'/);
  assert.match(
    serverSource,
    /app\.get\('\/api\/vocabulary\/saved', requireAuth, requirePremiumSavedVocabulary/
  );
  assert.match(
    serverSource,
    /app\.post\('\/api\/vocabulary\/saved', requireAuth, requirePremiumSavedVocabulary/
  );
  assert.match(tableMigration, /enable row level security/i);
  assert.match(premiumMigration, /revoke all privileges[\s\S]*?from authenticated/i);
  assert.match(premiumMigration, /grant select, insert, update, delete[\s\S]*?to service_role/i);
});

test('DeepL receives Reading context without translating or exposing it to the client', () => {
  const translator = fs.readFileSync(path.join(__dirname, 'lib', 'translatorService.js'), 'utf8');
  const serverSource = fs.readFileSync(path.join(__dirname, 'lib', 'server.js'), 'utf8');
  assert.match(translator, /body\.context = String\(context\)\.trim\(\)\.slice\(0, 1000\)/);
  assert.match(serverSource, /typeof context !== 'string' \|\| context\.length > 1000/);
  assert.doesNotMatch(serverSource, /console\.(?:log|warn)\([^)]*context/);
});

test('Listening comprehension opens directly with at most four visible story questions', () => {
  const source = fs.readFileSync(path.join(__dirname, 'src', 'js', 'script.js'), 'utf8');
  const runtime = source.match(
    /function getListeningComprehensionRuntime\(lesson\) \{([\s\S]*?)\n\}/
  )?.[1];
  const renderer = source.match(
    /function renderListeningComprehensionQuestionHtml\(lesson, bank, runtime\) \{([\s\S]*?)\n\}/
  )?.[1];
  assert.ok(runtime && renderer);
  assert.match(runtime, /phase:\s*'question'/);
  assert.match(source, /questions:\s*bank\.questions\.slice\(0,\s*4\)/);
  assert.match(renderer, /listening-comp-question-list/);
  assert.match(renderer, /bank\.questions[\s\S]*?\.map\(/);
  assert.doesNotMatch(renderer, /listening-comp-start-btn/);
});

test('official Listening content builds exactly four questions from the narrated story', () => {
  const { enrichOfficialListening } = require('./scripts/content/official-listening-utils');
  const transcriptSegments = [
    'Maya arrives at the station early.',
    'She checks the platform number.',
    'A clerk explains the delay.',
    'Maya buys a bottle of water.',
    'The train arrives after ten minutes.',
    'She finds her seat by the window.',
    'A family sits across from her.',
    'Everyone leaves for the coast.'
  ].map((text, index) => ({ id: `segment-${index + 1}`, order: index + 1, text }));
  const units = [{
    slug: 'train-story',
    activities: {
      listening: {
        storyTitle: 'The train journey',
        mainTranscript: transcriptSegments.map((segment) => segment.text).join(' '),
        transcriptSegments
      }
    }
  }];
  enrichOfficialListening(units, { language: 'english', level: 'A1' });
  const questions = units[0].activities.listening.listeningComprehension.questions;
  assert.equal(questions.length, 4);
  for (const question of questions) {
    const correct = question.options.find((option) => option.id === question.correctOptionId);
    assert.ok(correct);
    assert.match(units[0].activities.listening.mainTranscript, new RegExp(correct.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(question.prompt, /story/i);
  }
});

test('English A1 Hello Listening keeps its specific editorial questions', () => {
  const { units } = require('./scripts/content/english-a1-units');
  const hello = units.find((unit) => unit.slug === 'hello');
  const questions = hello.activities.listening.listeningComprehension.questions;

  assert.deepEqual(
    questions.map((question) => question.prompt),
    [
      "What is the speaker's name?",
      'How old is Ana?',
      'Where is Leo from?',
      'What do Ana and Leo say before they leave?'
    ]
  );
  assert.ok(
    questions.every(
      (question) =>
        !/official audio|which information is stated/i.test(question.prompt)
    )
  );
});
