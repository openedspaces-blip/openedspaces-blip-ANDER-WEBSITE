#!/usr/bin/env node
require('dotenv').config();

const crypto = require('crypto');
const { Client } = require('pg');
const seedLessons = require('../lib/seed-lessons.json');

const isOfficialListening = (row) =>
  row.skill === 'listening' &&
  ((row.target_language === 'english' && ['A1', 'A2'].includes(row.level)) ||
    (row.target_language === 'french' && row.level === 'A1'));

function fingerprint(value) {
  const canonicalize = (item) => {
    if (Array.isArray(item)) return item.map(canonicalize);
    if (item && typeof item === 'object') {
      return Object.keys(item)
        .sort()
        .reduce((result, key) => {
          result[key] = canonicalize(item[key]);
          return result;
        }, {});
    }
    return item;
  };
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(value || null)))
    .digest('hex')
    .slice(0, 12);
}

function hasGenericPrompt(bank) {
  return (bank?.questions || []).some((question) =>
    /official audio|which information is stated|audio officiel|audio oficial/i.test(
      String(question?.prompt || '')
    )
  );
}

async function main() {
  const seeds = seedLessons.filter(isOfficialListening);
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });
  await client.connect();
  try {
    const { rows } = await client.query(
      `select slug, extra->'listeningComprehension' as bank
       from public.course_lessons
       where slug = any($1::text[])`,
      [seeds.map((row) => row.slug)]
    );
    const databaseBySlug = new Map(rows.map((row) => [row.slug, row.bank]));
    const report = seeds.map((seed) => {
      const expected = seed.content_json?.extra?.listeningComprehension;
      const actual = databaseBySlug.get(seed.slug);
      return {
        slug: seed.slug,
        language: seed.target_language,
        level: seed.level,
        questionCount: actual?.questions?.length || 0,
        generic: hasGenericPrompt(actual),
        matchesSeed: fingerprint(actual) === fingerprint(expected)
      };
    });
    const summary = report.reduce((acc, item) => {
      const key = `${item.language}:${item.level}`;
      acc[key] ||= { total: 0, generic: 0, mismatches: 0, invalidQuestionCount: 0 };
      acc[key].total += 1;
      if (item.generic) acc[key].generic += 1;
      if (!item.matchesSeed) acc[key].mismatches += 1;
      if (item.questionCount !== 4) acc[key].invalidQuestionCount += 1;
      return acc;
    }, {});
    console.log(JSON.stringify({ summary, affected: report.filter((item) => item.generic || !item.matchesSeed) }, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
