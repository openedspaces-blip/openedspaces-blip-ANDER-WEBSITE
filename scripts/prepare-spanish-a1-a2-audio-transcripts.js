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
  if (Array.isArray(activity.dialogue) && activity.dialogue.length) {
    return activity.dialogue
      .map(({ speaker, line }) => `${speaker}: ${line}`)
      .join('\n');
  }
  return String(activity.transcript || '').trim();
}

function spokenTextFor(activity) {
  if (Array.isArray(activity.dialogue) && activity.dialogue.length) {
    return activity.dialogue.map(({ line }) => line).join(' ');
  }
  return String(activity.transcript || '').trim();
}

function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
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
    const [minimum, maximum] = row.level === 'A1' ? [45, 90] : [45, 130];
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
