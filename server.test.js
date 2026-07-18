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
const { getSupabaseAdmin } = require('./lib/supabaseClient');
const LanguagePair = require('./src/js/language-pair');

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
// see scripts/content/english-a1-units.js. Español A1 got the identical
// unit-based treatment (12 units x 6 skills = 72 activities, no separate
// 'dialogue' skill - dialogues live inside listening via listeningType:
// 'dialogue', see scripts/content/spanish-a1-units.js). French A1 got the
// same unit-based treatment plus an extra 'dialogue' skill (12 units x 7
// skills = 84 activities) - see scripts/content/french-a1-units.js and the
// dialogue_skill/dialogue_mission migration. Every other language/level
// keeps the original flat, single-lesson-per-skill shape. Per-language
// expectations are deliberately kept separate (not one global constant)
// because these structures genuinely differ.
const ENGLISH_A1_ACTIVITY_COUNT = 72;
const SPANISH_A1_ACTIVITY_COUNT = 72;
const FRENCH_A1_ACTIVITY_COUNT = 84;
const UNIT_SKILLS_BY_LANGUAGE = { french: [...SKILLS, 'dialogue'] };
const A1_ACTIVITY_COUNT_BY_LANGUAGE = {
  english: ENGLISH_A1_ACTIVITY_COUNT,
  spanish: SPANISH_A1_ACTIVITY_COUNT,
  french: FRENCH_A1_ACTIVITY_COUNT
};

function unitSkillsFor(language) {
  return UNIT_SKILLS_BY_LANGUAGE[language] || SKILLS;
}

test('fallback worlds include six lessons per level for every supported language (English A1 and Español A1: 12 units x 6 skills, French A1: 12 units x 7 skills)', () => {
  for (const language of WORLD_LANGUAGES) {
    const lessons = getLocalLessons(language);
    const a1Count = A1_ACTIVITY_COUNT_BY_LANGUAGE[language] || 6;
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
      const expectedCount = A1_ACTIVITY_COUNT_BY_LANGUAGE[language] || 6;
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
const SUPABASE_AUTH_TESTS_SKIP_REASON = 'Supabase is not configured in this environment';

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

test(
  'username + email login flows',
  { skip: !config.isSupabaseConfigured && SUPABASE_AUTH_TESTS_SKIP_REASON },
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
          assert.match(r.body.error, /confirma tu correo/i);
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
  assert.equal(LanguagePair.getInterfaceLabel('bridgeSelectLabel', 'spanish'), 'Idioma de apoyo (L1)');
  assert.equal(LanguagePair.getInterfaceLabel('bridgeSelectLabel', 'english'), 'Support language (L1)');
  assert.equal(LanguagePair.getInterfaceLabel('bridgeSelectLabel', 'french'), "Langue d'appui (L1)");
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
