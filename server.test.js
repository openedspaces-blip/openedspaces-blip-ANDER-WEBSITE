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
const { sanitizeGrammarTestForClient } = require('./lib/grammarTestSanitizer');
const { gradeQuestionBank } = require('./lib/courseLessonsService');

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
// English A2 (scripts/content/english-a2-units.js) is unit-based too, same
// mechanism as A1 above, just for a different level - all 10 units are now
// authored (units 1-2 free, 3-10 premium), 6 core skills each, no extra
// 'dialogue' skill (unlike French A1).
const ENGLISH_A2_ACTIVITY_COUNT = 60;
const UNIT_SKILLS_BY_LANGUAGE = { french: [...SKILLS, 'dialogue'] };
// Per-language, per-level override for languages/levels with real unit-based
// content instead of the flat 6-lessons-per-level fallback shape. Any
// language/level combo not listed here is assumed to be the flat shape.
const LEVEL_ACTIVITY_COUNT_BY_LANGUAGE = {
  english: { A1: ENGLISH_A1_ACTIVITY_COUNT, A2: ENGLISH_A2_ACTIVITY_COUNT },
  spanish: { A1: SPANISH_A1_ACTIVITY_COUNT },
  french: { A1: FRENCH_A1_ACTIVITY_COUNT }
};

function unitSkillsFor(language) {
  return UNIT_SKILLS_BY_LANGUAGE[language] || SKILLS;
}

function expectedActivityCountFor(language, level) {
  return (LEVEL_ACTIVITY_COUNT_BY_LANGUAGE[language] || {})[level] ?? 6;
}

test('fallback worlds include six lessons per level for every supported language (English A1/A2 and Español A1: 12/4 units x 6 skills, French A1: 12 units x 7 skills)', () => {
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
// scored, 12-question, multiple-choice-only test bank - see
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

function assertWellFormedGrammarTest(bank, label) {
  assert.ok(bank, `${label}: expected a grammarTest question bank`);
  assert.equal(bank.questions.length, 12, `${label}: expected exactly 12 questions`);

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

test('English A1 has exactly 12 units, each with a Grammar lesson carrying a well-formed 12-question multiple-choice test', () => {
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
    assert.equal(sanitized.questions.length, 12);
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
    assert.equal(bank.questions.length, 12);
    bank.questions.forEach((question) => {
      assert.equal('correctOptionId' in question, false, `${lesson.slug}/${question.id}: leaks correctOptionId`);
      assert.equal('acceptedAnswers' in question, false, `${lesson.slug}/${question.id}: leaks acceptedAnswers`);
      assert.equal('correctOrder' in question, false, `${lesson.slug}/${question.id}: leaks correctOrder`);
    });
  });
});

test('gradeQuestionBank scores a 12-question grammarTest out of 100, matching the spec table exactly', () => {
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

  assert.equal(scoreFor(12), 100);
  assert.equal(scoreFor(11), 92);
  assert.equal(scoreFor(10), 83);
  assert.equal(scoreFor(9), 75);
  assert.equal(scoreFor(8), 67);
  assert.equal(scoreFor(7), 58);
  assert.equal(scoreFor(6), 50);
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
  assert.equal(results.length, 12);
  results.forEach((result, index) => {
    const question = bank.questions[index];
    assert.equal(result.questionId, question.id);
    assert.equal(result.correct, index % 2 === 0);
    assert.equal(result.explanation, question.explanation);
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

test('LanguagePair: same-language pairs (L1 = L2) are supported for spanish/english/french, direct/immersion mode', () => {
  for (const lang of ['spanish', 'english', 'french']) {
    assert.equal(
      LanguagePair.isLanguagePairSupported(lang, lang),
      true,
      `expected ${lang}->${lang} to be a supported (direct-mode) pair`
    );
    assert.equal(LanguagePair.getLearningMode(lang, lang), 'direct');
  }
  // Not authored languages (no course content) - same-language still
  // correctly unsupported, distinct from "blocked because equal".
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

test('LanguagePair.getLanguagePairLabel(): direct mode shows the immersion sentence, in the interface language, no "support in" phrasing', () => {
  assert.equal(
    LanguagePair.getLanguagePairLabel('spanish', 'spanish'),
    'Aprenderás español mediante inmersión y definiciones en español.'
  );
  assert.equal(
    LanguagePair.getLanguagePairLabel('english', 'english'),
    'You will learn English through immersion and English definitions.'
  );
  assert.equal(
    LanguagePair.getLanguagePairLabel('french', 'french'),
    'Vous apprendrez le français par immersion et avec des définitions en français.'
  );
  // Bilingual pairs are unaffected - still the original "support in" sentence.
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

test('script.js: setBridgeLanguage()/setTargetLanguage() no longer reject L1 = L2', () => {
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

  const loadPathBody = source.match(/async function loadLearningPath\(options = \{\}\) \{([\s\S]*?)\n  const graphContainer/)?.[1];
  assert.match(loadPathBody, /syncLearningMode\(\);/);
});

test('lib/preferencesService.js: no longer rejects bridgeLanguage === language, and the DB CHECK constraint is dropped', () => {
  const source = fs.readFileSync(path.join(__dirname, 'lib', 'preferencesService.js'), 'utf8');
  assert.doesNotMatch(
    source,
    /nextLanguage === nextBridge/,
    'preferencesService must no longer reject a same-language bridge/target pair'
  );
  assert.doesNotMatch(source, /El idioma puente debe ser diferente del idioma que deseas aprender/);

  const migration = fs.readFileSync(
    path.join(__dirname, 'supabase', 'migrations', '202607200001_allow_same_language_direct_mode.sql'),
    'utf8'
  );
  assert.match(migration, /drop constraint if exists profiles_bridge_not_target_check/);
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
