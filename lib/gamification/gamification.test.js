const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { computeStreak } = require('./streaks');

function getConjugationEngine() {
  const browser = { window: {} };
  const enginePath = path.join(__dirname, '../../src/js/verbs/verb-conjugation-engine.js');
  vm.runInNewContext(fs.readFileSync(enginePath, 'utf8'), browser);
  return browser.window.AndergoVerbConjugation;
}

test('English present-simple negatives use contractions for every person', () => {
  const engine = getConjugationEngine();
  const verb = {
    infinitive: 'feel',
    forms: {
      thirdPersonSingular: 'feels',
      pastSimple: 'felt',
      pastParticiple: 'felt',
      presentParticiple: 'feeling'
    }
  };
  const rows = engine.conjugateTense(verb, 'presentSimple').rows;
  assert.deepEqual(
    Array.from(rows, (row) => row.negative),
    ["I don't feel", "You don't feel", "He doesn't feel", "We don't feel", "They don't feel"]
  );
  assert.equal(rows[2].affirmative, 'He feels');
  assert.equal(rows[2].interrogative, 'Does he feel?');
});

test('streak increments after practice on consecutive days', () => {
  const result = computeStreak({
    lastActiveDate: '2026-11-18',
    streak: 4,
    longestStreak: 6,
    today: '2026-11-19'
  });
  assert.equal(result.streak, 5);
  assert.equal(result.graceUsed, false);
  assert.equal(result.lastActiveDate, '2026-11-19');
});

test('streak forgives one missed day and does not increase during the pause', () => {
  const result = computeStreak({
    lastActiveDate: '2026-11-17',
    streak: 5,
    longestStreak: 8,
    today: '2026-11-19'
  });
  assert.equal(result.streak, 5);
  assert.equal(result.graceUsed, true);
  assert.equal(result.lastStreakGraceDate, '2026-11-19');
});

test('a second missed day within seven days starts a new streak', () => {
  const result = computeStreak({
    lastActiveDate: '2026-11-20',
    lastStreakGraceDate: '2026-11-19',
    streak: 5,
    longestStreak: 8,
    today: '2026-11-22'
  });
  assert.equal(result.streak, 1);
  assert.equal(result.graceUsed, false);
});

test('a missed day is forgiven again after seven days have passed', () => {
  const result = computeStreak({
    lastActiveDate: '2026-11-17',
    lastStreakGraceDate: '2026-11-10',
    streak: 5,
    longestStreak: 8,
    today: '2026-11-19'
  });
  assert.equal(result.streak, 5);
  assert.equal(result.graceUsed, true);
});

test('a longer gap resets the streak but never lowers the personal best', () => {
  const result = computeStreak({
    lastActiveDate: '2026-11-16',
    streak: 5,
    longestStreak: 8,
    today: '2026-11-19'
  });
  assert.equal(result.streak, 1);
  assert.equal(result.longestStreak, 8);
});

test('repeated activity on the same day leaves the streak unchanged', () => {
  const result = computeStreak({
    lastActiveDate: '2026-11-19',
    lastStreakGraceDate: '2026-11-18',
    streak: 5,
    longestStreak: 8,
    today: '2026-11-19'
  });
  assert.equal(result.streak, 5);
  assert.equal(result.isNewDay, false);
  assert.equal(result.lastStreakGraceDate, '2026-11-18');
});
