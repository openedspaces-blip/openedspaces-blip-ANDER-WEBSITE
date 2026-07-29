#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  FRENCH_UPPER_LEVEL_LISTENING
} = require('./content/french-b1-b2-listening-scripts');

const ROOT = path.join(__dirname, '..');
const OUTPUT_BASE = path.join(ROOT, 'docs', 'transcriptions-audio-francais-b1-b2');
const ORDER = {
  B1: [
    'projets-et-avenir',
    'identite-et-parcours-personnel',
    'etudes-et-apprentissage',
    'monde-du-travail',
    'voyages-et-interculturalite',
    'technologie-et-societe',
    'sante-et-mode-de-vie',
    'environnement-et-consommation',
    'medias-et-information',
    'relations-et-conflits'
  ],
  B2: [
    'retour-a-saint-domingue',
    'candidature-universitaire',
    'debats-de-societe',
    'le-teletravail-et-lavenir-professionnel',
    'litterature-francophone',
    'cinema-et-critique',
    'dilemmes-ethiques',
    'sciences-et-innovations',
    'histoire-et-memoire',
    'ecologie-et-engagement-citoyen',
    'art-et-creativite',
    'bilan-et-projets-davenir'
  ]
};

const formatNames = {
  podcast: 'Podcast',
  testimony: 'Témoignage',
  tutorial: 'Guide pratique',
  chronicle: 'Chronique',
  editorial: 'Éditorial',
  'public-service': 'Information publique',
  news: 'Actualité',
  review: 'Critique',
  documentary: 'Documentaire',
  portrait: 'Portrait',
  reflection: 'Réflexion'
};

const markdownParts = [
  '# Transcriptions audio — Français B1 et B2',
  '',
  'Guiones monológicos oficiales ANDERGO. Cada audio utiliza una sola voz y está conectado con el Reading, el vocabulario y la gramática de su unidad.'
];
const textParts = ['TRANSCRIPTIONS AUDIO — FRANÇAIS B1 ET B2'];

for (const level of ['B1', 'B2']) {
  markdownParts.push('', `## Français ${level}`);
  textParts.push('', `FRANÇAIS ${level}`, '');
  ORDER[level].forEach((slug, index) => {
    const item = FRENCH_UPPER_LEVEL_LISTENING[level][slug];
    const format = formatNames[item.format] || item.format;
    markdownParts.push(
      '',
      `### Leçon ${index + 1} — ${item.title}`,
      '',
      `**Format :** ${format} · **Voix :** une personne`,
      '',
      item.transcript
    );
    textParts.push(
      `LEÇON ${index + 1} — ${item.title}`,
      `FORMAT : ${format} — UNE SEULE VOIX`,
      '',
      item.transcript,
      ''
    );
  });
}

fs.mkdirSync(path.dirname(OUTPUT_BASE), { recursive: true });
fs.writeFileSync(`${OUTPUT_BASE}.md`, `${markdownParts.join('\n')}\n`, 'utf8');
fs.writeFileSync(`${OUTPUT_BASE}.txt`, `${textParts.join('\n')}\n`, 'utf8');
console.log(`Exporté ${path.relative(ROOT, `${OUTPUT_BASE}.md`)}`);
console.log(`Exporté ${path.relative(ROOT, `${OUTPUT_BASE}.txt`)}`);
