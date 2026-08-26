#!/usr/bin/env node
// Localizes legacy Spanish "lectura" suffixes on European Reading lessons.
// The seed file is the canonical source; browser world files are synced after.
const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const lessons = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const labels = {
  italian: 'Lettura',
  portuguese: 'Leitura',
  german: 'Lesen'
};

let changed = 0;
for (const lesson of lessons) {
  const label = labels[lesson.target_language];
  if (!label || lesson.skill !== 'reading') continue;
  if (!/:\s*lectura\s*$/i.test(lesson.title || '')) continue;
  lesson.title = lesson.title.replace(/lectura\s*$/i, label);
  changed += 1;
}

fs.writeFileSync(seedPath, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
console.log(`Localized ${changed} European Reading titles.`);
