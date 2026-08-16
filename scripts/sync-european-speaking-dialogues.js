#!/usr/bin/env node
// Ensures every Italian, Portuguese and German Speaking lesson has a short,
// natural dialogue stored both in the static seed and normalized DB sections.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const APPLY = process.argv.includes('--apply');
const ROOT = path.join(__dirname, '..');
const LANGUAGES = ['italian', 'portuguese', 'german'];

function dialogue(language, phrase) {
  const topic = String(phrase || '').replace(/[.!?]+$/, '');
  const copy = {
    italian: [`Vorrei esercitarmi con questa espressione: «${topic}». Puoi aiutarmi?`, 'Certo. Prova a usarla in una frase completa e poi ti rispondo.'],
    portuguese: [`Quero praticar esta expressão: “${topic}”. Você pode me ajudar?`, 'Claro. Use-a em uma frase completa e depois eu respondo.'],
    german: [`Ich möchte diesen Ausdruck üben: „${topic}“. Kannst du mir helfen?`, 'Gern. Verwende ihn in einem vollständigen Satz, dann antworte ich dir.']
  }[language];
  return [{ speaker: 'A', line: copy[0] }, { speaker: 'B', line: copy[1] }];
}

async function main() {
  const seedPath = path.join(ROOT, 'lib/seed-lessons.json');
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const rows = seed.filter((row) => LANGUAGES.includes(row.target_language) && ['A1','A2','B1','B2'].includes(row.level) && row.skill === 'speaking' && row.unit_slug);
  if (rows.length !== 144) throw new Error(`Expected 144 speaking lessons, found ${rows.length}.`);
  rows.forEach((row) => { row.content_json ||= {}; row.content_json.dialogue = dialogue(row.target_language, row.content_json.phrases?.[0] || row.content_json.mission); });
  if (!APPLY) return console.log(JSON.stringify({ mode: 'dry-run', lessons: rows.length }, null, 2));
  fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n');
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY, { auth: { persistSession: false } });
  for (const row of rows) {
    const { data: lesson, error } = await client.from('course_lessons').select('id').eq('slug', row.slug).single();
    if (error) throw error;
    const { error: removeError } = await client.from('lesson_sections').delete().eq('lesson_id', lesson.id).eq('type', 'dialogue_line');
    if (removeError) throw removeError;
    const { error: insertError } = await client.from('lesson_sections').insert(row.content_json.dialogue.map((line, index) => ({ lesson_id: lesson.id, type: 'dialogue_line', order_index: index, speaker: line.speaker, line: line.line })));
    if (insertError) throw insertError;
  }
  console.log(JSON.stringify({ mode: 'applied', lessons: rows.length }, null, 2));
}
main().catch((error) => { console.error(error.message); process.exit(1); });
