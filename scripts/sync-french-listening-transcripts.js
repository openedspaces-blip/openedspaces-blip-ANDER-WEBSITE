#!/usr/bin/env node
// Keeps the visible French Listening transcript and the registered audio
// transcript aligned with the canonical, reviewed text in seed-lessons.json.
// Dry-run by default. Pass --apply to persist the updates in one transaction.
require('dotenv').config();
const { Client } = require('pg');
const seedLessons = require('../lib/seed-lessons.json');

const APPLY = process.argv.includes('--apply');
const EXPECTED_LEVEL_COUNTS = { A1: 12, A2: 12, B1: 10, B2: 12, C1: 12, C2: 12 };

function canonicalRows() {
  return seedLessons
    .filter(
      (row) =>
        row.target_language === 'french' &&
        row.skill === 'listening' &&
        row.unit_slug
    )
    .map((row) => {
      const extra = row.content_json?.extra || {};
      const transcript = extra.mainTranscript || row.content_json?.transcript || '';
      const segments = extra.transcriptSegments || [];
      const rebuilt = segments.map((segment) => segment.text || segment).join(' ');
      if (!transcript || rebuilt !== transcript) {
        throw new Error(`${row.slug}: la transcripción canónica y sus segmentos no coinciden.`);
      }
      return { slug: row.slug, level: row.level, transcript, segments };
    });
}

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error('SUPABASE_DATABASE_URL no está configurada.');
  }
  const canonical = canonicalRows();
  for (const [level, expected] of Object.entries(EXPECTED_LEVEL_COUNTS)) {
    const found = canonical.filter((row) => row.level === level).length;
    if (found !== expected) {
      throw new Error(`Francés ${level}: se esperaban ${expected} Listenings y se encontraron ${found}.`);
    }
  }

  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });
  await client.connect();
  try {
    await client.query('begin');
    const slugs = canonical.map((row) => row.slug);
    const { rows: lessons } = await client.query(
      `select cl.id, cl.slug, lv.code as level,
              cl.extra->>'mainTranscript' as main_transcript,
              la.id as audio_id, la.transcript as audio_transcript
         from public.course_lessons cl
         join public.courses co on co.id = cl.course_id
         join public.languages l on l.id = co.language_id
         join public.levels lv on lv.id = co.level_id
         left join public.lesson_audio la on la.course_lesson_id = cl.id
        where l.code = 'french'
          and cl.skill = 'listening'
          and cl.slug = any($1::text[])`,
      [slugs]
    );
    if (lessons.length !== canonical.length) {
      const found = new Set(lessons.map((row) => row.slug));
      const missing = slugs.filter((slug) => !found.has(slug));
      throw new Error(`Faltan ${missing.length} Listenings en Supabase: ${missing.join(', ')}`);
    }

    const databaseBySlug = new Map(lessons.map((row) => [row.slug, row]));
    const report = [];
    for (const item of canonical) {
      const database = databaseBySlug.get(item.slug);
      const courseExact = database.main_transcript === item.transcript;
      const audioExact = database.audio_transcript === item.transcript;
      report.push({ level: item.level, slug: item.slug, courseExact, audioExact });
      if (!APPLY) continue;

      await client.query(
        `update public.course_lessons
            set extra = jsonb_set(
                  jsonb_set(coalesce(extra, '{}'::jsonb), '{mainTranscript}', to_jsonb($2::text), true),
                  '{transcriptSegments}', $3::jsonb, true
                ),
                updated_at = now()
          where id = $1`,
        [database.id, item.transcript, JSON.stringify(item.segments)]
      );
      if (database.audio_id) {
        await client.query(
          `update public.lesson_audio
              set transcript = $2, updated_at = now()
            where id = $1`,
          [database.audio_id, item.transcript]
        );
      }
    }

    let finalReport = report;
    if (APPLY) {
      const { rows: verifiedRows } = await client.query(
        `select cl.slug, lv.code as level,
                cl.extra->>'mainTranscript' as main_transcript,
                cl.extra->'transcriptSegments' as transcript_segments,
                la.transcript as audio_transcript
           from public.course_lessons cl
           join public.courses co on co.id = cl.course_id
           join public.languages l on l.id = co.language_id
           join public.levels lv on lv.id = co.level_id
           left join public.lesson_audio la on la.course_lesson_id = cl.id
          where l.code = 'french'
            and cl.skill = 'listening'
            and cl.slug = any($1::text[])`,
        [slugs]
      );
      const canonicalBySlug = new Map(canonical.map((row) => [row.slug, row]));
      finalReport = verifiedRows.map((row) => {
        const item = canonicalBySlug.get(row.slug);
        const rebuilt = (row.transcript_segments || [])
          .map((segment) => segment.text || segment)
          .join(' ');
        return {
          level: row.level,
          slug: row.slug,
          courseExact: row.main_transcript === item.transcript && rebuilt === item.transcript,
          audioExact: row.audio_transcript === item.transcript
        };
      });
      const mismatch = finalReport.filter((row) => !row.courseExact || !row.audioExact);
      if (finalReport.length !== canonical.length || mismatch.length) {
        throw new Error(
          `Verificación fallida: ${finalReport.length}/${canonical.length} registros; ` +
            `${mismatch.length} desajustes.`
        );
      }
      await client.query('commit');
    } else {
      await client.query('rollback');
    }

    const summary = Object.fromEntries(
      Object.keys(EXPECTED_LEVEL_COUNTS).map((level) => {
        const rows = finalReport.filter((row) => row.level === level);
        return [
          level,
          {
            total: rows.length,
            courseExact: rows.filter((row) => row.courseExact).length,
            audioExact: rows.filter((row) => row.audioExact).length
          }
        ];
      })
    );
    console.log(JSON.stringify({ mode: APPLY ? 'applied' : 'dry-run', summary }, null, 2));
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
