#!/usr/bin/env node
// Read-only guard for the non-audio European curriculum. Listening is not
// asserted here because its audio-production pass is intentionally pending.
const units = require('../lib/seed-units.json');
const lessons = require('../lib/seed-lessons.json');

const languages = ['italian', 'portuguese', 'german'];
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const skills = ['reading', 'speaking', 'writing', 'grammar', 'vocabulary'];
const failures = [];

for (const language of languages) {
  for (const level of levels) {
    const courseUnits = units.filter((unit) => unit.target_language === language && unit.level === level);
    if (courseUnits.length !== 12) failures.push(`${language}/${level}: expected 12 units, found ${courseUnits.length}`);
    for (const skill of skills) {
      const linked = lessons.filter((lesson) => lesson.target_language === language && lesson.level === level && lesson.skill === skill && lesson.unit_slug);
      if (linked.length !== 12) failures.push(`${language}/${level}/${skill}: expected 12 linked lessons, found ${linked.length}`);
      if (linked.some((lesson) => !lesson.content_json?.xp_reward || !Array.isArray(lesson.content_json?.exercises))) failures.push(`${language}/${level}/${skill}: incomplete learner payload`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('European non-listening routes verified: 3 languages × 6 levels × 12 units × 5 skills.');
