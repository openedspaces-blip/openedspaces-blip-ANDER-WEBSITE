#!/usr/bin/env node
require('dotenv').config();

const { Client } = require('pg');
const {
  transcriptSupportsOption
} = require('./content/contextual-listening-comprehension');
const seedLessons = require('../lib/seed-lessons.json');
const canonicalTranscriptBySlug = new Map(
  seedLessons
    .filter((row) => row.skill === 'listening' && row.unit_slug)
    .map((row) => [
      row.slug,
      row.content_json?.extra?.mainTranscript || row.content_json?.transcript || ''
    ])
);

const GENERIC_PROMPT =
  /official audio|which information is stated|audio officiel|audio oficial|qué información (?:se |está )?(?:dice|indica)|quel(?:le)? information .*audio/i;

function normalizedPrompt(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });
  await client.connect();
  try {
    const { rows } = await client.query(`
      select l.code as language, lv.code as level, cl.slug, cl.title,
             cl.extra->'listeningComprehension' as bank,
             coalesce(
               jsonb_agg(
                 jsonb_build_object('prompt', e.prompt, 'orderIndex', e.order_index)
                 order by e.order_index
               ) filter (where e.id is not null),
               '[]'::jsonb
             ) as exercises
      from public.course_lessons cl
      join public.courses c on c.id = cl.course_id
      join public.languages l on l.id = c.language_id
      join public.levels lv on lv.id = c.level_id
      left join public.exercises e on e.lesson_id = cl.id
      where cl.skill = 'listening' and cl.is_published = true
      group by l.code, lv.code, cl.id, cl.slug, cl.title, cl.extra
      order by l.code, lv.code, cl.order_index
    `);

    const lessons = rows.map((row) => {
      const bankQuestions = Array.isArray(row.bank?.questions) ? row.bank.questions : [];
      const effectiveQuestions = bankQuestions.length ? bankQuestions : row.exercises;
      const transcript = canonicalTranscriptBySlug.get(row.slug) || '';
      return {
        language: row.language,
        level: row.level,
        slug: row.slug,
        title: row.title,
        transcript,
        source: bankQuestions.length ? 'bank' : 'exercises',
        prompts: effectiveQuestions.map((question) => String(question.prompt || '')),
        unsupportedOptions: bankQuestions.flatMap((question) =>
          (question.options || []).filter(
            (option) => !transcriptSupportsOption(transcript, option.text)
          )
        )
      };
    });

    const promptLessons = new Map();
    for (const lesson of lessons) {
      for (const prompt of lesson.prompts) {
        const key = normalizedPrompt(prompt);
        if (!key) continue;
        if (!promptLessons.has(key)) promptLessons.set(key, { prompt, slugs: new Set() });
        promptLessons.get(key).slugs.add(lesson.slug);
      }
    }

    const repeatedKeys = new Set(
      [...promptLessons.entries()]
        .filter(([, data]) => data.slugs.size >= 3)
        .map(([key]) => key)
    );
    const summary = lessons.reduce((acc, lesson) => {
      const key = `${lesson.language}:${lesson.level}`;
      acc[key] ||= {
        lessons: 0,
        banks: 0,
        exerciseFallbacks: 0,
        questions: 0,
        notFour: 0,
        genericQuestions: 0,
        repeatedQuestions: 0,
        unsupportedOptions: 0
      };
      const group = acc[key];
      group.lessons += 1;
      group[lesson.source === 'bank' ? 'banks' : 'exerciseFallbacks'] += 1;
      group.questions += lesson.prompts.length;
      if (lesson.prompts.length !== 4) group.notFour += 1;
      group.genericQuestions += lesson.prompts.filter((prompt) => GENERIC_PROMPT.test(prompt)).length;
      group.repeatedQuestions += lesson.prompts.filter((prompt) =>
        repeatedKeys.has(normalizedPrompt(prompt))
      ).length;
      group.unsupportedOptions += lesson.unsupportedOptions.length;
      return acc;
    }, {});

    const topRepeated = [...promptLessons.values()]
      .filter((data) => data.slugs.size >= 3)
      .sort((a, b) => b.slugs.size - a.slugs.size)
      .slice(0, 20)
      .map((data) => ({
        lessons: data.slugs.size,
        prompt: data.prompt,
        sampleSlugs: [...data.slugs].slice(0, 3)
      }));

    console.log(
      JSON.stringify(
        {
          totalListeningLessons: lessons.length,
          summary,
          topRepeated,
          genericLessons: lessons
            .filter((lesson) => lesson.prompts.some((prompt) => GENERIC_PROMPT.test(prompt)))
            .map((lesson) => lesson.slug),
          notFourLessons: lessons
            .filter((lesson) => lesson.prompts.length !== 4)
            .map((lesson) => ({
              slug: lesson.slug,
              count: lesson.prompts.length,
              source: lesson.source
            })),
          unsupportedOptionLessons: lessons
            .filter((lesson) => lesson.unsupportedOptions.length)
            .map((lesson) => ({
              slug: lesson.slug,
              options: lesson.unsupportedOptions.map((option) => option.text)
            }))
        },
        null,
        2
      )
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
