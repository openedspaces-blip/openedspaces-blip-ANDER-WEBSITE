require('dotenv').config();
const { Client } = require('pg');
const seed = require('../lib/seed-lessons.json');

async function main() {
  const expected = seed
    .filter(
      (row) =>
        row.skill === 'listening' &&
        ((row.target_language === 'english' && ['A1', 'A2'].includes(row.level)) ||
          (row.target_language === 'french' && row.level === 'A1')) &&
        row.unit_slug
    )
    .map((row) => ({
      slug: row.slug,
      language: row.target_language,
      level: row.level,
      transcript: row.content_json.extra.mainTranscript
    }));

  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const { rows } = await client.query(
    `select lesson_slug, language, level, transcript, main_file_path, slow_file_path,
            very_slow_file_path, status, course_lesson_id
       from public.lesson_audio
      where (language = 'english' and level in ('A1', 'A2'))
         or (language = 'french' and level = 'A1')`
  );
  const { rows: dictationRows } = await client.query(
    `select cl.slug, count(ds.id)::int as segment_count
       from public.course_lessons cl
       join public.courses co on co.id = cl.course_id
       join public.languages l on l.id = co.language_id
       join public.levels lv on lv.id = co.level_id
       left join public.lesson_dictation_segments ds on ds.lesson_id = cl.id
      where cl.skill = 'listening'
        and ((l.code = 'english' and lv.code in ('A1', 'A2'))
          or (l.code = 'french' and lv.code = 'A1'))
      group by cl.slug`
  );
  await client.end();

  const actualBySlug = new Map(rows.map((row) => [row.lesson_slug, row]));
  const dictationBySlug = new Map(dictationRows.map((row) => [row.slug, row.segment_count]));
  const report = expected.map((item) => {
    const actual = actualBySlug.get(item.slug);
    return {
      language: item.language,
      level: item.level,
      slug: item.slug,
      registered: Boolean(actual),
      published: actual?.status === 'published',
      hasMainAudio: Boolean(actual?.main_file_path),
      hasRealSlowAudio: Boolean(actual?.slow_file_path || actual?.very_slow_file_path),
      linkedByLessonId: Boolean(actual?.course_lesson_id),
      transcriptExact: actual ? actual.transcript === item.transcript : false,
      dictationSegments: dictationBySlug.get(item.slug) || 0
    };
  });
  const summary = report.reduce((acc, item) => {
    const key = `${item.language}:${item.level}`;
    acc[key] ||= { total: 0, registered: 0, exact: 0, linked: 0, slow: 0, dictationReady: 0 };
    acc[key].total += 1;
    if (item.registered && item.hasMainAudio && item.published) acc[key].registered += 1;
    if (item.transcriptExact) acc[key].exact += 1;
    if (item.linkedByLessonId) acc[key].linked += 1;
    if (item.hasRealSlowAudio) acc[key].slow += 1;
    if (item.dictationSegments > 0) acc[key].dictationReady += 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ summary, mismatches: report.filter((item) => !item.transcriptExact) }, null, 2));
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exitCode = 1;
});
