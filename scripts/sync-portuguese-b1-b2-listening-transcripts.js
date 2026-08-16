#!/usr/bin/env node
// Publishes the approved Portuguese B1-B2 production transcripts from the
// seed to the normalized course records. It intentionally touches no audio
// file paths: audio production/upload remains a separate step.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const APPLY = process.argv.includes('--apply');
const ROOT = path.join(__dirname, '..');

function segments(text) {
  return (String(text || '').match(/[^.!?]+[.!?]+(?:[”"')\]]+)?|[^.!?]+$/g) || [])
    .map((value) => ({ text: value.trim() }))
    .filter((value) => value.text);
}

async function main() {
  const seedPath = path.join(ROOT, 'lib', 'seed-lessons.json');
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const updates = seed
    .filter((row) => row.target_language === 'portuguese' && ['B1', 'B2'].includes(row.level) && row.skill === 'listening' && row.unit_slug)
    .sort((a, b) => a.level.localeCompare(b.level) || a.order_index - b.order_index)
    .map((row) => ({ slug: row.slug, text: row.content_json?.transcript || row.content_json?.extra?.mainTranscript || '' }));
  if (updates.length !== 24 || updates.some(({ text }) => !text.trim())) throw new Error(`Expected 24 non-empty Portuguese B1-B2 transcripts; found ${updates.length}.`);
  if (!APPLY) return console.log(JSON.stringify({ mode: 'dry-run', updates: updates.length }, null, 2));

  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY, { auth: { persistSession: false } });
  for (const { slug, text } of updates) {
    const { data: lesson, error: findError } = await client.from('course_lessons').select('id,extra').eq('slug', slug).single();
    if (findError) throw findError;
    const extra = { ...(lesson.extra || {}), transcript: text, mainTranscript: text, transcriptSegments: segments(text) };
    const { error: updateError } = await client.from('course_lessons').update({ extra }).eq('id', lesson.id);
    if (updateError) throw updateError;
  }
  const { data: verified, error: verifyError } = await client
    .from('course_lessons')
    .select('slug,extra')
    .in('slug', updates.map(({ slug }) => slug));
  if (verifyError) throw verifyError;
  const expected = new Map(updates.map(({ slug, text }) => [slug, text]));
  const mismatches = (verified || []).filter((row) => row.extra?.mainTranscript !== expected.get(row.slug));
  if ((verified || []).length !== updates.length || mismatches.length) {
    throw new Error(`Verification failed: expected ${updates.length} matching rows; got ${(verified || []).length} rows and ${mismatches.length} mismatches.`);
  }
  console.log(JSON.stringify({ mode: 'applied', updates: updates.length, verified: verified.length }, null, 2));
}

main().catch((error) => { console.error(error.message); process.exit(1); });
