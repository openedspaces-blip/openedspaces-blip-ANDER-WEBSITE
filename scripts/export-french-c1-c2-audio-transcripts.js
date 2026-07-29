#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const seedLessons = require('../lib/seed-lessons.json');

const ROOT = path.join(__dirname, '..');
const OUTPUT_BASE = path.join(ROOT, 'docs', 'transcriptions-audio-francais-c1-c2');
const formatNames = {
  documentary: 'Documentaire',
  podcast: 'Podcast',
  editorial: 'Éditorial',
  lecture: 'Conférence',
  news: 'Dossier d’actualité',
  analysis: 'Analyse',
  chronicle: 'Chronique',
  reflection: 'Réflexion',
  report: 'Reportage',
  essay: 'Essai sonore',
  portrait: 'Portrait',
  synthesis: 'Synthèse'
};
const markdown = [
  '# Transcriptions audio — Français C1 et C2',
  '',
  'Adaptations audio monologiques officielles ANDERGO. Une seule voix par enregistrement.'
];
const text = ['TRANSCRIPTIONS AUDIO — FRANÇAIS C1 ET C2'];

for (const level of ['C1', 'C2']) {
  const rows = seedLessons
    .filter(
      (row) =>
        row.target_language === 'french' &&
        row.level === level &&
        row.skill === 'listening' &&
        row.unit_slug
    )
    .sort((a, b) => a.order_index - b.order_index);
  markdown.push('', `## Français ${level}`);
  text.push('', `FRANÇAIS ${level}`, '');
  rows.forEach((row, index) => {
    const format = formatNames[row.content_json.extra?.listeningFormat] || 'Monologue';
    const transcript =
      row.content_json.extra?.mainTranscript || row.content_json.transcript || '';
    markdown.push(
      '',
      `### Leçon ${index + 1} — ${row.title}`,
      '',
      `**Format :** ${format} · **Voix :** une personne`,
      '',
      transcript
    );
    text.push(
      `LEÇON ${index + 1} — ${row.title}`,
      `FORMAT : ${format} — UNE SEULE VOIX`,
      '',
      transcript,
      ''
    );
  });
}

fs.mkdirSync(path.dirname(OUTPUT_BASE), { recursive: true });
fs.writeFileSync(`${OUTPUT_BASE}.md`, `${markdown.join('\n')}\n`, 'utf8');
fs.writeFileSync(`${OUTPUT_BASE}.txt`, `${text.join('\n')}\n`, 'utf8');
console.log(`Exporté ${path.relative(ROOT, `${OUTPUT_BASE}.md`)}`);
console.log(`Exporté ${path.relative(ROOT, `${OUTPUT_BASE}.txt`)}`);
