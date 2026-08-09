#!/usr/bin/env node
/**
 * Makes Listening text-support metadata match the transcript registered with
 * the published audio. Audio rows and Storage files are never modified.
 *
 * Dry run: node scripts/sync-listening-text-to-official-audio.js
 * Apply:   node scripts/sync-listening-text-to-official-audio.js --apply
 */
require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');
const LANGUAGES = ['english', 'french', 'spanish'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function normalize(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function transcriptSegments(transcript) {
  const sentences = normalize(transcript).match(/[^.!?]+[.!?]+(?:[”"')\]]+)?|[^.!?]+$/g) || [];
  return sentences
    .map((sentence) => ({ text: sentence.trim() }))
    .filter((segment) => segment.text);
}

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error('SUPABASE_DATABASE_URL no está configurada.');
  }
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });
  await client.connect();

  try {
    await client.query('begin');
    const { rows } = await client.query(
      `select cl.id, cl.slug, l.code as language, lv.code as level,
              cl.extra->>'mainTranscript' as course_transcript,
              la.transcript as audio_transcript
          from public.course_lessons cl
         join public.courses co on co.id = cl.course_id
         join public.languages l on l.id = co.language_id
         join public.levels lv on lv.id = co.level_id
         join public.lesson_audio la on la.course_lesson_id = cl.id
        where cl.skill = 'listening'
          and cl.is_published = true
          and l.code = any($1::text[])
          and lv.code = any($2::text[])
          and nullif(btrim(la.transcript), '') is not null
        order by l.code, lv.code, cl.order_index`,
      [LANGUAGES, LEVELS]
    );
    const mismatches = rows.filter(
      (row) => normalize(row.course_transcript) !== normalize(row.audio_transcript)
    );

    for (const row of mismatches) {
      if (!APPLY) continue;
      const transcript = String(row.audio_transcript).trim();
      await client.query(
        `update public.course_lessons
            set extra = jsonb_set(
                  jsonb_set(coalesce(extra, '{}'::jsonb), '{mainTranscript}', to_jsonb($2::text), true),
                  '{transcriptSegments}', $3::jsonb, true
                ),
                updated_at = now()
          where id = $1`,
        [row.id, transcript, JSON.stringify(transcriptSegments(transcript))]
      );
    }

    if (APPLY) {
      const { rows: verification } = await client.query(
        `select count(*)::int as count
           from public.course_lessons cl
           join public.courses co on co.id = cl.course_id
           join public.languages l on l.id = co.language_id
           join public.levels lv on lv.id = co.level_id
           join public.lesson_audio la on la.course_lesson_id = cl.id
          where cl.skill = 'listening'
            and cl.is_published = true
            and l.code = any($1::text[]) and lv.code = any($2::text[])
            and nullif(btrim(la.transcript), '') is not null
            and regexp_replace(coalesce(cl.extra->>'mainTranscript', ''), '\\s+', ' ', 'g')
                <> regexp_replace(la.transcript, '\\s+', ' ', 'g')`,
        [LANGUAGES, LEVELS]
      );
      if (verification[0].count !== 0) {
        throw new Error(`La verificación final encontró ${verification[0].count} desajustes.`);
      }
      await client.query('commit');
    } else {
      await client.query('rollback');
    }

    const summary = Object.fromEntries(
      LANGUAGES.map((language) => [
        language,
        Object.fromEntries(
          LEVELS.map((level) => {
            const levelRows = rows.filter((row) => row.language === language && row.level === level);
            return [level, {
              officialAudio: levelRows.length,
              updated: mismatches.filter((row) => row.language === language && row.level === level).length
            }];
          })
        )
      ])
    );
    console.log(JSON.stringify({ mode: APPLY ? 'applied' : 'dry-run', total: rows.length, mismatches: mismatches.length, summary }, null, 2));
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
