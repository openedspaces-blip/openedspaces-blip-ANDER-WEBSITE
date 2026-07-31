#!/usr/bin/env node
// Exports Spanish C1-C2 Listening scripts as a production-ready Markdown brief.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'docs', 'spanish-listening-transcripts-c1-c2.md');
const lessons = require('../lib/seed-lessons.json');

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function estimatedDuration(words) {
  const seconds = Math.max(60, Math.round((words / 145) * 60));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function renderLesson(row, number) {
  const content = row.content_json || {};
  const transcript = content.transcript || '';
  const questions = (content.exercises || []).filter((exercise) => exercise.type === 'mcq');
  const words = wordCount(transcript);
  return `## ${number}. ${row.title}\n\n- **Unidad:** ${row.unit_slug}\n- **Duración estimada:** ${estimatedDuration(words)}\n- **Extensión:** ${words} palabras\n\n### Transcripción\n\n${transcript}\n\n### Comprensión auditiva\n\n${questions.map((question, index) => `${index + 1}. ${question.prompt}\n   - A. ${question.options[0]}\n   - B. ${question.options[1]}\n   - C. ${question.options[2]}\n   - D. ${question.options[3]}\n   - **Respuesta:** ${'ABCD'[question.answer]}`).join('\n\n')}\n`;
}

const groups = ['C1', 'C2'].map((level) => {
  const rows = lessons
    .filter((row) => row.target_language === 'spanish' && row.level === level && row.skill === 'listening')
    .sort((a, b) => a.order_index - b.order_index);
  return `# Español ${level} · Transcripciones para producción de audio\n\nEstas transcripciones son adaptaciones auditivas de los Readings. Integran el tema, el vocabulario y la gramática de cada unidad.\n\n${rows.map((row, index) => renderLesson(row, index + 1)).join('\n')}`;
});

fs.writeFileSync(OUTPUT_PATH, `${groups.join('\n\n---\n\n')}\n`, 'utf8');
console.log(`Wrote ${OUTPUT_PATH}`);
