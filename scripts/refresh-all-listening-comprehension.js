#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  applyContextualListeningBank
} = require('./content/contextual-listening-comprehension');

const SEED_PATH = path.join(__dirname, '..', 'lib', 'seed-lessons.json');

function refreshAllListeningComprehension() {
  const rows = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  const languageFilter = new Set(
    (process.argv.find((arg) => arg.startsWith('--languages=')) || '')
      .replace('--languages=', '')
      .split(',')
      .filter(Boolean)
  );
  const levelFilter = new Set(
    (process.argv.find((arg) => arg.startsWith('--levels=')) || '')
      .replace('--levels=', '')
      .split(',')
      .filter(Boolean)
  );
  let updated = 0;

  for (const row of rows) {
    // Unit-backed lessons are the listenings exposed by the learning
    // routes and stored in course_lessons. The 18 legacy language-lab
    // placeholders have no story or unit and are intentionally left alone.
    if (row.skill !== 'listening' || !row.unit_slug) continue;
    if (languageFilter.size && !languageFilter.has(row.target_language)) continue;
    if (levelFilter.size && !levelFilter.has(row.level)) continue;
    // French B1/B2 keep their original Camila/Léa/Karim dialogue instead of
    // this generator's monologue format - the recorded audio for these 22
    // lessons was produced against that dialogue script, and re-recording it
    // wasn't in scope when the rest of French's storyline was rewritten.
    // applyContextualListeningBank() replaces dialogue/transcript wholesale,
    // which would silently desync the audio from the on-screen text/
    // questions, so these are left untouched on every rebuild.
    // Dialogues retain their audio and transcript; only their questions change.
    // Every routed Listening follows the same four-question format. The
    // generator keeps A1 prompts concise while preserving a consistent
    // evaluation and progress experience across the learning path.
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
