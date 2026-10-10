const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../src/js/script.js'), 'utf8');
const start = source.indexOf('const naturalReadingAudioState =');
const end = source.indexOf('\nfunction escapeHtml', start);
function setup() {
  const requests = [];
  const messages = [];
  const button = { disabled: false, textContent: 'Play 1' };
  const audio = { plays: 0, pauses: 0, hidden: true, pause() { this.pauses++; },
    async play() { this.plays++; this.onplay?.(); }, removeAttribute() {}, load() {} };
  const section = { isConnected: true, querySelector(selector) {
    return selector === '.reading-audio-natural-btn' ? button : selector === '.reading-natural-audio' ? audio : null;
  } };
  const ctx = vm.createContext({ URLSearchParams, URL, backendBaseUrl: '',
    authStatus: { session: { access_token: 'test' } },
    learningPathState: { language: 'english', lessons: [{ skill: 'reading', level: 'A1', unitId: 'one' }] },
    readingSpeechPlayer: { stopReading() {} }, showHomeToast: message => messages.push(message),
    authFetch: () => new Promise((resolve, reject) => requests.push({ resolve, reject }))
  });
  vm.runInContext(source.slice(start, end), ctx);
  const play = () => ctx.playNaturalReadingAudio(section, { level: 'A1', unitId: 'one' });
  const resolve = (i = 0) => requests[i].resolve({ ok: true, json: async () => ({ audioUrl: 'https://example.test/audio.mp3' }) });
  return { ctx, requests, messages, button, audio, section, play, resolve };
}
test('Play 2 cancels a pending Play 1 and restores its button', async () => {
  const h = setup(); const pending = h.play();
  assert.equal(h.button.disabled, true);
  h.ctx.stopNaturalReadingAudio();
  assert.equal(h.button.disabled, false);
  h.resolve(); await pending;
  assert.equal(h.audio.plays, 0); assert.deepEqual(h.messages, []);
});
test('a cancelled audio request cannot clear the loading state of its replacement', async () => {
  const h = setup(); const old = h.play(); h.ctx.stopNaturalReadingAudio();
  const current = h.play(); h.requests[0].reject(new Error('stale network failure')); await old;
  assert.equal(h.button.disabled, true); assert.deepEqual(h.messages, []);
  h.resolve(1); await current;
  assert.equal(h.audio.plays, 1); assert.equal(h.button.disabled, false);
});
test('removed reading views never start delayed official audio', async () => {
  const h = setup(); const pending = h.play(); h.section.isConnected = false;
  h.resolve(); await pending; assert.equal(h.audio.plays, 0);
});
test('switching playback while the signed URL body loads also cancels Play 1', async () => {
  const h = setup(); let finishBody, bodyStarted;
  const started = new Promise(resolve => { bodyStarted = resolve; });
  const pending = h.play();
  h.requests[0].resolve({ ok: true, json: () => new Promise(resolve => { finishBody = resolve; bodyStarted(); }) });
  await started; h.ctx.stopNaturalReadingAudio();
  finishBody({ audioUrl: 'https://example.test/audio.mp3' }); await pending;
  assert.equal(h.audio.plays, 0);
});
test('ordinary official audio playback still starts and can be stopped', async () => {
  const h = setup(); const pending = h.play(); h.resolve(); await pending;
  assert.equal(h.audio.plays, 1); assert.equal(h.audio.hidden, false);
  h.ctx.stopNaturalReadingAudio({ clearSource: true });
  assert.equal(h.audio.pauses, 1); assert.equal(h.audio.hidden, true); assert.equal(h.audio.onplay, null);
});
test('advanced English Listening answers stay unique and consistent with grading indexes', () => {
  const rows = require('./seed-lessons.json');
  for (const row of rows.filter(r => r.target_language === 'english' && r.skill === 'listening' && ['B2','C1','C2'].includes(r.level))) {
    const questions = row.content_json.extra?.listeningComprehension?.questions || [];
    const answers = questions.map(q => q.options.find(o => o.id === q.correctOptionId)?.text);
    assert.equal(new Set(answers).size, questions.length, row.slug);
    for (const q of questions) if (q.answer !== undefined) {
      assert.equal(q.options[q.answer]?.id, q.correctOptionId, `${row.slug}: inconsistent answer index`);
    }
  }
});
