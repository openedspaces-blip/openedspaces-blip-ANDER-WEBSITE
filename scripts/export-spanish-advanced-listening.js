#!/usr/bin/env node
// Exports Spanish C1-C2 Listening scripts as a production-ready Markdown brief.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'docs', 'spanish-listening-transcripts-c1-c2.md');
const lessons = require('../lib/seed-lessons.json');

function renderLesson(row, number) {
  const content = row.content_json || {};
  const transcript = content.transcript || '';
  return `## ${number}. ${row.title}\n\n${transcript}\n`;
}

const groups = ['C1', 'C2'].map((level) => {
  const rows = lessons
    .filter((row) => row.target_language === 'spanish' && row.level === level && row.skill === 'listening')
    .sort((a, b) => a.order_index - b.order_index);
  return `# Español ${level} · Transcripciones para producción de audio\n\n${rows.map((row, index) => renderLesson(row, index + 1)).join('\n')}`;
});

fs.writeFileSync(OUTPUT_PATH, `${groups.join('\n\n---\n\n')}\n`, 'utf8');
console.log(`Wrote ${OUTPUT_PATH}`);
