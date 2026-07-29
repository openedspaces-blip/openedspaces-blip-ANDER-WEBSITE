#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  FRENCH_LISTENING_STORIES
} = require('./content/french-listening-story-scripts');

const OUTPUT = path.join(
  __dirname,
  '..',
  'docs',
  'transcriptions-audio-francais-a1-11-12-a2.md'
);
const TEXT_OUTPUT = path.join(
  __dirname,
  '..',
  'docs',
  'transcriptions-audio-francais-a1-11-12-a2.txt'
);
const A1_ORDER = ['les-vetements-et-les-achats', 'la-meteo-et-les-voyages'];
const A2_ORDER = [
  'les-achats',
  'au-restaurant',
  'se-deplacer',
  'la-sante',
  'la-vie-quotidienne',
  'les-experiences-passees',
  'les-voyages-et-les-vacances',
  'le-logement',
  'les-loisirs-et-les-medias',
  'relations-et-communication',
  'services-et-demarches',
  'projets-solidaires'
];

function section(level, lessonNumber, story) {
  return `### Leçon ${lessonNumber} — ${story.title}\n\n${story.transcript}`;
}

const markdown = [
  '# Transcriptions audio — Français A1 (leçons 11–12) et A2',
  '',
  'Microhistoires officielles ANDERGO. Chaque texte prolonge la situation du Reading et intègre naturellement le vocabulaire et la grammaire de son unité.',
  '',
  '## Français A1',
  '',
  ...A1_ORDER.map((slug, index) =>
    section('A1', index + 11, FRENCH_LISTENING_STORIES.A1[slug])
  ),
  '',
  '## Français A2',
  '',
  ...A2_ORDER.map((slug, index) =>
    section('A2', index + 1, FRENCH_LISTENING_STORIES.A2[slug])
  ),
  ''
].join('\n\n');

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, markdown, 'utf8');
const plainText = [
  'TRANSCRIPTIONS AUDIO — FRANÇAIS A1 (LEÇONS 11–12) ET A2',
  '',
  'FRANÇAIS A1',
  '',
  ...A1_ORDER.flatMap((slug, index) => {
    const story = FRENCH_LISTENING_STORIES.A1[slug];
    return [`LEÇON ${index + 11} — ${story.title}`, '', story.transcript, ''];
  }),
  'FRANÇAIS A2',
  '',
  ...A2_ORDER.flatMap((slug, index) => {
    const story = FRENCH_LISTENING_STORIES.A2[slug];
    return [`LEÇON ${index + 1} — ${story.title}`, '', story.transcript, ''];
  })
].join('\n');
fs.writeFileSync(TEXT_OUTPUT, plainText, 'utf8');
console.log(`Exporté ${path.relative(path.join(__dirname, '..'), OUTPUT)}`);
console.log(`Exporté ${path.relative(path.join(__dirname, '..'), TEXT_OUTPUT)}`);
