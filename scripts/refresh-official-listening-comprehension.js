#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const seedPath = path.join(ROOT, 'lib', 'seed-lessons.json');
const catalogs = [
  require('./content/english-a1-units'),
  require('./content/english-a2-units'),
  require('./content/french-a1-units')
];

const rows = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const rowsBySlug = new Map(rows.map((row) => [row.slug, row]));
let updated = 0;

for (const catalog of catalogs) {
  for (const unit of catalog.units) {
    const listening = unit.activities.listening;
    const slug = `${catalog.language}-${catalog.level.toLowerCase()}-${unit.slug}-listening`;
    const row = rowsBySlug.get(slug);
    if (!row) throw new Error(`Missing seed row: ${slug}`);
    row.content_json.exercises = listening.exercises;
    row.content_json.extra.listeningComprehension = listening.listeningComprehension;
    updated += 1;
  }
}

fs.writeFileSync(seedPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
console.log(`Refreshed comprehension in ${updated} official listening lessons.`);
