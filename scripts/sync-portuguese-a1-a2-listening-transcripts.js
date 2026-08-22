#!/usr/bin/env node
// Makes Portuguese A1/A2 Listening match the approved recording scripts.
// It updates the local fallback, the visible transcript, official-audio
// metadata, transcript sections, and the comprehension bank in one run.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { applyContextualListeningBank } = require('./content/contextual-listening-comprehension');

const ROOT = path.join(__dirname, '..');
const SEED_PATH = path.join(ROOT, 'lib', 'seed-lessons.json');
const SCRIPT_PATH = path.join(ROOT, 'docs', 'portuguese-a1-a2-listening-audio-scripts.md');
const LEVELS = ['A1', 'A2'];
const UNIT_COUNT = 12;
const APPLY = process.argv.includes('--apply');

function clean(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function transcriptSegments(text) {
  return (String(text).match(/[^.!?]+[.!?]+(?:[”"')\]]+)?|[^.!?]+$/g) || [])
    .map((sentence) => clean(sentence))
    .filter(Boolean)
    .map((text) => ({ text }));
}

function scriptsByLevel() {
  const source = fs.readFileSync(SCRIPT_PATH, 'utf8');
  const matches = [...source.matchAll(/^## (A[12]) · Unidade (\d+) ·[^\n]+\n\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
  const result = { A1: [], A2: [] };
  matches.forEach((match) => {
    const level = match[1];
    const unit = Number(match[2]);
    const text = clean(match[3]);
    if (LEVELS.includes(level) && unit >= 1 && unit <= UNIT_COUNT && text) {
      result[level].push({ unit, text });
    }
  });
  for (const level of LEVELS) {
    result[level].sort((a, b) => a.unit - b.unit);
    if (result[level].length !== UNIT_COUNT || result[level].some((item, index) => item.unit !== index + 1)) {
      throw new Error(`${level}: expected ${UNIT_COUNT} ordered, non-empty recording scripts.`);
    }
  }
  return result;
}

function canonicalLessons() {
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  const source = scriptsByLevel();
  const lessons = [];
  for (const level of LEVELS) {
    const rows = seed
      .filter(
        (row) =>
          row.target_language === 'portuguese' &&
          row.level === level &&
          row.skill === 'listening' &&
          row.unit_slug
      )
      .sort((a, b) => Number(a.order_index) - Number(b.order_index));
    if (rows.length !== UNIT_COUNT) throw new Error(`${level}: expected ${UNIT_COUNT} Listening lessons.`);

    rows.forEach((row, index) => {
      const text = source[level][index].text;
      const segments = transcriptSegments(text);
      row.content_json ||= {};
      row.content_json.extra ||= {};
      row.content_json.transcript = text;
      row.content_json.dialogue = [];
      row.content_json.extra.mainTranscript = text;
      row.content_json.extra.transcriptSegments = segments;
      applyContextualListeningBank(row);
      lessons.push({
        id: row.slug,
        slug: row.slug,
        level,
        text,
        segments,
        comprehension: row.content_json.extra.listeningComprehension
      });
    });
  }
  return { seed, lessons };
}

async function syncDatabase(lessons) {
  if (!process.env.SUPABASE_DATABASE_URL) throw new Error('SUPABASE_DATABASE_URL is not configured.');
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });
  await client.connect();
  try {
    await client.query('begin');
    const { rows } = await client.query(
      `select cl.id, cl.slug, cl.extra, la.id as audio_id
         from public.course_lessons cl
         join public.courses co on co.id = cl.course_id
         join public.languages l on l.id = co.language_id
         join public.levels lv on lv.id = co.level_id
         left join public.lesson_audio la on la.course_lesson_id = cl.id
        where l.code = 'portuguese'
          and lv.code = any($1::text[])
          and cl.skill = 'listening'
          and cl.slug = any($2::text[])`,
      [LEVELS, lessons.map((lesson) => lesson.slug)]
    );
    if (rows.length !== lessons.length) {
      const found = new Set(rows.map((row) => row.slug));
      throw new Error(`Missing course lessons: ${lessons.filter((lesson) => !found.has(lesson.slug)).map((lesson) => lesson.slug).join(', ')}`);
    }
    if (rows.some((row) => !row.audio_id)) throw new Error('Every Portuguese A1/A2 Listening lesson must have official audio registered.');

    const bySlug = new Map(rows.map((row) => [row.slug, row]));
    for (const lesson of lessons) {
      const database = bySlug.get(lesson.slug);
      const extra = {
        ...(database.extra || {}),
        mainTranscript: lesson.text,
        transcriptSegments: lesson.segments,
        listeningComprehension: lesson.comprehension
      };
      await client.query(
        `update public.course_lessons
            set extra = $2::jsonb, updated_at = now()
          where id = $1`,
        [database.id, JSON.stringify(extra)]
      );
      await client.query(
        `update public.lesson_audio set transcript = $2, updated_at = now() where id = $1`,
        [database.audio_id, lesson.text]
      );
      await client.query(`delete from public.lesson_sections where lesson_id = $1 and type = 'dialogue_line'`, [database.id]);
      for (const [index, segment] of lesson.segments.entries()) {
        await client.query(
          `insert into public.lesson_sections (lesson_id, type, order_index, speaker, line, translation)
           values ($1, 'dialogue_line', $2, '', $3, '')`,
          [database.id, index + 1, segment.text]
        );
      }
    }

    const { rows: verification } = await client.query(
      `select cl.slug, cl.extra->>'mainTranscript' as transcript, cl.extra->'transcriptSegments' as segments,
              la.transcript as audio_transcript, count(ls.id)::int as dialogue_lines
         from public.course_lessons cl
         join public.lesson_audio la on la.course_lesson_id = cl.id
         left join public.lesson_sections ls on ls.lesson_id = cl.id and ls.type = 'dialogue_line'
        where cl.slug = any($1::text[])
        group by cl.slug, cl.extra, la.transcript`,
      [lessons.map((lesson) => lesson.slug)]
    );
    const expected = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
    const mismatches = verification.filter((row) => {
      const item = expected.get(row.slug);
      const rebuilt = (row.segments || []).map((segment) => segment.text || '').join(' ');
      return row.transcript !== item.text || row.audio_transcript !== item.text || rebuilt !== item.text || row.dialogue_lines !== item.segments.length;
    });
    if (verification.length !== lessons.length || mismatches.length) {
      throw new Error(`Verification failed: ${verification.length}/${lessons.length} records, ${mismatches.length} mismatches.`);
    }
    await client.query('commit');
    return verification;
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  const { seed, lessons } = canonicalLessons();
  if (!APPLY) {
    console.log(JSON.stringify({ mode: 'dry-run', updates: lessons.length }, null, 2));
    return;
  }
  fs.writeFileSync(SEED_PATH, `${JSON.stringify(seed, null, 2)}\n`, 'utf8');
  const verified = await syncDatabase(lessons);
  console.log(JSON.stringify({ mode: 'applied', updates: lessons.length, verified: verified.length }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
