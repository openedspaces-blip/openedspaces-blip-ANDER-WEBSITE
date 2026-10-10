#!/usr/bin/env node
// Repair only missing assessments/profiles and undersized A1 readings.
// No database writes, audio changes, or replacement of other course content.
const fs = require('fs');
const path = require('path');
const { flatten } = require('./build-italian-portuguese-a1-a2');
const { normalizeReading } = require('./normalize-reading-comprehension');
const { applyContextualListeningBank } = require('./content/contextual-listening-comprehension');

function repair(rows) {
  const authoredReadings = new Map(['italian', 'portuguese'].flatMap((language) =>
    flatten(language, 'A1').filter((row) => row.skill === 'reading').map((row) => [row.slug, row])
  ));
  const frenchGrammar = new Map(require('./content/french-c1-units').units.map((unit) =>
    [`french-c1-${unit.slug}-grammar`, unit.activities.grammar.grammarProfile]
  ));
  let changed = 0;
  for (const row of rows) {
    const before = JSON.stringify(row);
    const content = row.content_json;
    if (authoredReadings.has(row.slug) && content.reading.text.split(/\s+/).length < 162) {
      content.reading = authoredReadings.get(row.slug).content_json.reading;
    }
    if (row.skill === 'reading' && ['italian', 'portuguese', 'german'].includes(row.target_language)
        && ['A1', 'A2', 'B1'].includes(row.level)) {
      const count = row.level === 'A1' ? 4 : 5;
      if (content.exercises.length < count) normalizeReading(row, count);
    }
    if (frenchGrammar.has(row.slug) && !content.extra?.grammarProfile) {
      content.extra ||= {};
      content.extra.grammarProfile = frenchGrammar.get(row.slug);
    }
    const legacyFrenchDialogue = row.target_language === 'french' && ['B1', 'B2'].includes(row.level);
    if (row.unit_slug && row.skill === 'listening' && !legacyFrenchDialogue
        && !content.extra?.listeningComprehension) {
      applyContextualListeningBank(row);
    }
    if (JSON.stringify(row) !== before) changed += 1;
  }
  return changed;
}

if (require.main === module) {
  const file = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
  const changed = repair(rows);
  if (changed) fs.writeFileSync(file, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`Repaired ${changed} curriculum rows.`);
}
module.exports = { repair };
