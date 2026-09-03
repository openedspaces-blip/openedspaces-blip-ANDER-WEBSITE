const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildPracticeReminderEmail,
  isReminderConfigured,
  localDateAndHour
} = require('./practiceReminderService');

test('practice reminder email is clear and includes the learner-controlled preference notice', () => {
  const message = buildPracticeReminderEmail(
    { full_name: 'María <Test>', email: 'maria@example.com' },
    'inactivity'
  );
  assert.match(message.subject, /práctica/i);
  assert.match(message.text, /desactivar estos recordatorios/i);
  assert.match(message.html, /María &lt;Test&gt;/);
});

test('practice reminders require the master switch and email credentials', () => {
  assert.equal(isReminderConfigured({ enabled: false, apiKey: 'x', from: 'a', replyTo: 'b' }), false);
  assert.equal(isReminderConfigured({ enabled: true, apiKey: '', from: 'a', replyTo: 'b' }), false);
  assert.equal(isReminderConfigured({ enabled: true, apiKey: 'x', from: 'a', replyTo: 'b' }), true);
});

test('scheduled reminder time is evaluated in the Dominican Republic timezone', () => {
  const result = localDateAndHour(new Date('2026-09-01T16:00:00.000Z'));
  assert.deepEqual(result, { date: '2026-09-01', hour: '12' });
});
