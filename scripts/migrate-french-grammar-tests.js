#!/usr/bin/env node
require('dotenv').config();

const { Client } = require('pg');
const seedLessons = require('../lib/seed-lessons.json');

const APPLY = process.argv.includes('--apply');
const DIAGNOSE = process.argv.includes('--diagnose');
const EXPECTED_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function grammarRows() {
  const rows = seedLessons.filter(
    (row) => row.target_language === 'french' && row.skill === 'grammar'
  );

  for (const row of rows) {
    const questions = row.content_json?.extra?.grammarTest?.questions;
    if (!Array.isArray(questions) || questions.length !== 8) {
      throw new Error(`${row.slug} must contain exactly 8 grammar-test questions.`);
    }
    if (new Set(questions.map((question) => question.id)).size !== 8) {
      throw new Error(`${row.slug} contains duplicate grammar-test question IDs.`);
    }
  }

  for (const level of EXPECTED_LEVELS) {
    if (!rows.some((row) => row.level === level)) {
      throw new Error(`No French ${level} grammar lessons were found in the seed.`);
    }
  }
  return rows;
}

async function main() {
  if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error('SUPABASE_DATABASE_URL is required.');
  }

  const rows = grammarRows();
  const slugs = rows.map((row) => row.slug);
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    const current = await client.query(
      `select
         count(*)::int as lessons,
         count(*) filter (
           where jsonb_array_length(coalesce(extra->'grammarTest'->'questions', '[]'::jsonb)) = 8
         )::int as already_ready
       from course_lessons
       where slug = any($1::text[])`,
      [slugs]
    );
    const found = current.rows[0]?.lessons || 0;
    const alreadyReady = current.rows[0]?.already_ready || 0;
    const legacyCurrent = await client.query(
      `select
         count(*)::int as lessons,
         count(*) filter (
           where jsonb_array_length(
             coalesce(content_json->'extra'->'grammarTest'->'questions', '[]'::jsonb)
           ) = 8
         )::int as already_ready
       from lessons
       where slug = any($1::text[])`,
      [slugs]
    );
    const legacyFound = legacyCurrent.rows[0]?.lessons || 0;
    const legacyAlreadyReady = legacyCurrent.rows[0]?.already_ready || 0;

    console.log(
      `Validated ${rows.length} French grammar banks locally; normalized course_lessons contains ${found}/${rows.length} matching lessons (${alreadyReady} already ready), and legacy lessons contains ${legacyFound}/${rows.length} (${legacyAlreadyReady} already ready).`
    );
    if (found !== rows.length) {
      throw new Error(
        `Supabase is missing ${rows.length - found} expected French grammar lesson(s); no updates were made.`
      );
    }
    if (!APPLY) {
      if (DIAGNOSE) {
        const triggers = await client.query(
          `select tgname, pg_get_triggerdef(oid) as definition
           from pg_trigger
           where tgrelid = 'course_lessons'::regclass
             and not tgisinternal
           order by tgname`
        );
        const extraColumn = await client.query(
          `select data_type, is_generated, generation_expression
           from information_schema.columns
           where table_schema = 'public'
             and table_name = 'course_lessons'
             and column_name = 'extra'`
        );
        console.log(JSON.stringify({ extraColumn: extraColumn.rows, triggers: triggers.rows }, null, 2));
      }
      console.log('Dry run complete. Re-run with --apply to update Supabase.');
      return;
    }

    await client.query('begin');
    try {
      let updated = 0;
      let updatedLegacy = 0;
      for (const row of rows) {
        const grammarTest = row.content_json.extra.grammarTest;
        const result = await client.query(
          `update course_lessons
           set extra = coalesce(nullif(extra, 'null'::jsonb), '{}'::jsonb)
                       || jsonb_build_object('grammarTest', $2::jsonb)
           where slug = $1
           returning id,
                     jsonb_typeof(extra->'grammarTest'->'questions') as questions_type,
                     case
                       when jsonb_typeof(extra->'grammarTest'->'questions') = 'array'
                         then jsonb_array_length(extra->'grammarTest'->'questions')
                       else 0
                     end as question_count`,
          [row.slug, JSON.stringify(grammarTest)]
        );
        if (Number(result.rows[0]?.question_count) !== 8) {
          throw new Error(
            `${row.slug} was not stored correctly by its UPDATE (${result.rows[0]?.questions_type || 'missing'}:${result.rows[0]?.question_count || 0}).`
          );
        }
        updated += result.rowCount;

        const legacyResult = await client.query(
          `update lessons
           set content_json =
             coalesce(nullif(content_json, 'null'::jsonb), '{}'::jsonb)
             || jsonb_build_object(
                  'extra',
                  coalesce(nullif(content_json->'extra', 'null'::jsonb), '{}'::jsonb)
                  || jsonb_build_object('grammarTest', $2::jsonb)
                )
           where slug = $1
           returning id,
                     case
                       when jsonb_typeof(content_json->'extra'->'grammarTest'->'questions') = 'array'
                         then jsonb_array_length(content_json->'extra'->'grammarTest'->'questions')
                       else 0
                     end as question_count`,
          [row.slug, JSON.stringify(grammarTest)]
        );
        if (
          legacyResult.rowCount === 1 &&
          Number(legacyResult.rows[0]?.question_count) !== 8
        ) {
          throw new Error(`${row.slug} was not stored correctly in legacy lessons.`);
        }
        updatedLegacy += legacyResult.rowCount;
      }
      if (updated !== rows.length) {
        throw new Error(`Expected ${rows.length} updates but received ${updated}.`);
      }

      const verified = await client.query(
        `select slug,
                jsonb_typeof(extra->'grammarTest'->'questions') as questions_type,
                case
                  when jsonb_typeof(extra->'grammarTest'->'questions') = 'array'
                    then jsonb_array_length(extra->'grammarTest'->'questions')
                  else 0
                end as question_count
         from course_lessons
         where slug = any($1::text[])`,
        [slugs]
      );
      const notReady = verified.rows.filter((row) => Number(row.question_count) !== 8);
      if (notReady.length) {
        throw new Error(
          `Post-update verification found ${rows.length - notReady.length}/${rows.length} ready lessons. Invalid: ${notReady
            .map((row) => `${row.slug} (${row.questions_type || 'missing'}:${row.question_count})`)
            .join(', ')}.`
        );
      }

      const legacyVerified = await client.query(
        `select slug
         from lessons
         where slug = any($1::text[])
           and jsonb_array_length(
             coalesce(content_json->'extra'->'grammarTest'->'questions', '[]'::jsonb)
           ) <> 8`,
        [slugs]
      );
      if (legacyVerified.rowCount) {
        throw new Error(
          `Legacy verification failed for: ${legacyVerified.rows.map((row) => row.slug).join(', ')}.`
        );
      }

      await client.query('commit');
      console.log(
        `Updated and verified ${updated} normalized plus ${updatedLegacy} existing legacy French grammar lesson(s) in one transaction.`
      );
    } catch (error) {
      await client.query('rollback');
      throw error;
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
