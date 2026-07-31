#!/usr/bin/env node
// Creates the canonical review and audio-production copy for Spanish B1-B2.
// It is derived from the curriculum source, so the learner-facing title and
// the recording script cannot drift apart.
const fs = require('fs');
const path = require('path');
const { buildLevel } = require('./content/spanish-expanded-units');

const ROOT = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'docs', 'spanish-listening-transcripts-b1-b2.md');

function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function main() {
  const rows = ['B1', 'B2'].flatMap((level) =>
    buildLevel(level).units.map((unit) => ({
      level,
      order: unit.order,
      title: unit.activities.listening.title,
      transcript: String(unit.activities.listening.transcript || '').trim()
    }))
  );
  const output = ['# Transcripciones de escucha — Español B1 y B2', ''];
  for (const row of rows) {
    const words = countWords(row.transcript);
    const progressionBands = row.level === 'B1'
      ? [[120, 150], [140, 165], [160, 180], [165, 190]]
      : [[145, 175], [150, 180], [165, 195], [180, 210]];
    const [minimum, maximum] = progressionBands[Math.floor((row.order - 1) / 3)];
    if (!row.transcript || words < minimum || words > maximum) {
      throw new Error(`${row.level} unidad ${row.order}: ${words} palabras; se esperaban ${minimum}-${maximum}.`);
    }
    output.push(`## ${row.level} · ${row.title}`, '', row.transcript, '');
  }
  for (const level of ['B1', 'B2']) {
    const counts = rows.filter((row) => row.level === level).map((row) => countWords(row.transcript));
    if (counts.some((count, index) => index > 0 && count < counts[index - 1])) {
      throw new Error(`${level}: la extensión debe aumentar de forma gradual entre unidades.`);
    }
  }
  fs.writeFileSync(OUTPUT_PATH, `${output.join('\n').trim()}\n`, 'utf8');
  console.log(`Prepared ${rows.length} Spanish B1-B2 Listening transcripts with progressive word counts.`);
  console.log(`Audio-production document: ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main();
