#!/usr/bin/env node
// Canonical Italian listening transcripts are the text recorded in docs/.
// This sync keeps the seed, course lesson metadata, and registered audio in
// exact agreement, so the learner's transcript tab never displays filler text.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const ROOT = path.join(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const SOURCES = [
  ['A1', 'docs/italian-a1-listening-audio-scripts.md'],
  ['A2', 'docs/italian-a2-listening-audio-scripts.md'],
  ['B1', 'docs/italian-b1-b2-listening-audio-scripts.md'],
  ['B2', 'docs/italian-b1-b2-listening-audio-scripts.md']
];

function segments(text) {
  return (text.match(/[^.!?]+[.!?]+(?:[”"')\]]+)?|[^.!?]+$/g) || [])
    .map((value) => ({ text: value.trim() }))
    .filter((value) => value.text);
}

function transcriptsForLevel(level, relativePath) {
  const source = fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
  const blocks = [...source.matchAll(/^## (?:B[12] · )?Unidad (\d+) ·[^\n]+\n\n(?:\*\*[^\n]+\*\*\n\n)?([\s\S]*?)(?=^## |$(?![\s\S]))/gm)]
    .filter((match) => (relativePath.includes('b1-b2') ? source.slice(match.index, match.index + 12).includes(level) : true))
    .map((match) => ({
      unit: Number(match[1]),
      // Editorial voice/type metadata is not spoken in the MP3.
      text: match[2].replace(/^\*\*Tipo:\*\*[^\n]*\n\n/, '').trim()
    }));
  if (blocks.length !== 12 || blocks.some((block) => !block.text)) {
    throw new Error(`${level}: expected 12 non-empty transcript blocks, found ${blocks.length}.`);
  }
  return blocks.sort((a, b) => a.unit - b.unit).map((block) => block.text);
}

async function main() {
  const seedPath = path.join(ROOT, 'lib/seed-lessons.json');
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const canonical = Object.fromEntries(SOURCES.map(([level, file]) => [level, transcriptsForLevel(level, file)]));
  const updates = [];
  for (const level of ['A1', 'A2', 'B1', 'B2']) {
    const rows = seed.filter((row) => row.target_language === 'italian' && row.level === level && row.skill === 'listening' && row.unit_slug).sort((a, b) => a.order_index - b.order_index);
    if (rows.length !== 12) throw new Error(`${level}: expected 12 canonical listening lessons, found ${rows.length}.`);
    rows.forEach((row, index) => {
      const text = canonical[level][index];
      row.content_json ||= {};
      row.content_json.extra = { ...(row.content_json.extra || {}), mainTranscript: text, transcriptSegments: segments(text) };
      row.content_json.transcript = text;
      updates.push({ slug: row.slug, text });
    });
  }
  if (!APPLY) return console.log(JSON.stringify({ mode: 'dry-run', updates: updates.length }, null, 2));
  fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n');
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY, { auth: { persistSession: false } });
  for (const update of updates) {
    const { data: lesson, error: lessonError } = await client.from('course_lessons').select('id,extra').eq('slug', update.slug).single();
    if (lessonError) throw lessonError;
    const extra = { ...(lesson.extra || {}), mainTranscript: update.text, transcriptSegments: segments(update.text) };
    const { error: courseError } = await client.from('course_lessons').update({ extra }).eq('id', lesson.id);
    if (courseError) throw courseError;
    const { error: audioError } = await client.from('lesson_audio').update({ transcript: update.text }).eq('course_lesson_id', lesson.id);
    if (audioError) throw audioError;
  }
  console.log(JSON.stringify({ mode: 'applied', updates: updates.length }, null, 2));
}

main().catch((error) => { console.error(error.message); process.exit(1); });
