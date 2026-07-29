#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  applyContextualListeningBank
} = require('./content/contextual-listening-comprehension');

const SEED_PATH = path.join(__dirname, '..', 'lib', 'seed-lessons.json');

function refreshAllListeningComprehension() {
  const rows = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  let updated = 0;

  for (const row of rows) {
    // Unit-backed lessons are the listenings exposed by the learning
    // routes and stored in course_lessons. The 18 legacy language-lab
    // placeholders have no story or unit and are intentionally left alone.
    if (row.skill !== 'listening' || !row.unit_slug) continue;
    applyContextualListeningBank(row);
    updated += 1;
  }

  fs.writeFileSync(SEED_PATH, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  return updated;
}

if (require.main === module) {
  const updated = refreshAllListeningComprehension();
  console.log(`Actualizados ${updated} bancos de comprensión auditiva en seed-lessons.json.`);
}

module.exports = { refreshAllListeningComprehension };
