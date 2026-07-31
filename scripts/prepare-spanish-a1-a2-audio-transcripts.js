#!/usr/bin/env node
// Produces the canonical review / audio-production copy for the first two
// Spanish levels. The source stays in the curriculum modules; this document
// is intentionally derived so titles and transcripts cannot drift apart.
const fs = require('fs');
const path = require('path');
const a1 = require('./content/spanish-a1-units');
const { buildLevel } = require('./content/spanish-expanded-units');

const ROOT = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'docs', 'spanish-listening-transcripts-a1-a2.md');

function transcriptFor(activity) {
  // Prefer the authored single-narrator script; dialogue remains only as a
  // compatibility fallback for future units that have not been adapted yet.
  if (String(activity.transcript || '').trim()) {
    return String(activity.transcript).trim();
  }
  if (Array.isArray(activity.dialogue) && activity.dialogue.length) {
    return activity.dialogue
      .map(({ line }) => line)
      .join('\n');
  }
  return '';
}

function spokenTextFor(activity) {
  return transcriptFor(activity);
}

function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function wordRangeFor(level, order) {
  // CEFR levels contain a progression of their own: A1− → A1+, then
  // A2− → A2+.  The ranges protect that editorial rhythm in future edits.
  if (level === 'A1') {
    if (order === 1) return [45, 55];
    if (order === 2) return [50, 60];
    if (order <= 4) return [60, 75];
    if (order <= 8) return [65, 80];
    return [70, 85];
  }
  if (order <= 4) return [90, 105];
  if (order <= 8) return [95, 110];
  return [95, 115];
}

function rowsFor(levelConfig) {
  return levelConfig.units.map((unit) => ({
    level: levelConfig.level || a1.level,
    order: unit.order,
    title: unit.activities.listening.title,
    transcript: transcriptFor(unit.activities.listening),
    wordCount: countWords(spokenTextFor(unit.activities.listening))
  }));
}

function main() {
  const a2 = buildLevel('A2');
  const rows = [...rowsFor({ ...a1, level: 'A1' }), ...rowsFor(a2)];
  const sections = ['# Transcripciones de escucha — Español A1 y A2', ''];

  for (const row of rows) {
    if (!row.transcript) throw new Error(`${row.level} unidad ${row.order}: falta transcripción`);
    const [minimum, maximum] = wordRangeFor(row.level, row.order);
    if (row.wordCount < minimum || row.wordCount > maximum) {
      throw new Error(`${row.level} unit ${row.order}: ${row.wordCount} words; expected ${minimum}-${maximum}`);
    }
    // Mirrors the English review-copy format: level + editorial title + text.
    // Word counts are validated above but stay out of the learner-facing copy.
    sections.push(`## ${row.level} · ${row.title}`, '', row.transcript, '');
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${sections.join('\n').trim()}\n`, 'utf8');
  console.log(`Prepared ${rows.length} Spanish Listening transcripts with level-appropriate word counts.`);
  console.log(`Audio-production document: ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main();
