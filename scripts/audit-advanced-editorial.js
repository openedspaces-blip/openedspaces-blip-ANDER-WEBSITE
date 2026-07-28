const rows = require('../lib/seed-lessons.json');

const LANGUAGES = ['english', 'french', 'spanish'];
const LEVELS = ['C1', 'C2'];
const wordCount = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;
let structuralFailures = 0;

for (const language of LANGUAGES) {
  for (const level of LEVELS) {
    const lessons = rows.filter(
      (row) => row.target_language === language && row.level === level
    );
    const units = new Set(lessons.map((row) => row.unit_slug));
    const skills = new Set(lessons.map((row) => row.skill));
    const readings = lessons.filter((row) => row.skill === 'reading');
    const grammar = lessons.filter((row) => row.skill === 'grammar');
    const vocabulary = lessons.filter((row) => row.skill === 'vocabulary');
    const readingWords = readings.map((row) => wordCount(row.content_json?.reading?.text));
    const grammarQuestions = grammar.map(
      (row) =>
        row.content_json?.extra?.grammarTest?.questions?.length ||
        row.content_json?.exercises?.length ||
        0
    );
    const vocabularyTerms = vocabulary.map((row) => row.content_json?.vocabulary?.length || 0);

    const structuralOk =
      units.size === 12 &&
      lessons.length === 72 &&
      ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'].every((skill) =>
        skills.has(skill)
      );
    if (!structuralOk) structuralFailures += 1;

    console.log(
      JSON.stringify({
        language,
        level,
        structuralOk,
        units: units.size,
        lessons: lessons.length,
        readingWords: [Math.min(...readingWords), Math.max(...readingWords)],
        grammarQuestions: [Math.min(...grammarQuestions), Math.max(...grammarQuestions)],
        vocabularyTerms: [Math.min(...vocabularyTerms), Math.max(...vocabularyTerms)],
        expectedGrammarQuestions: 20
      })
    );
  }
}

if (structuralFailures) {
  console.error(`${structuralFailures} rutas avanzadas tienen fallos estructurales.`);
  process.exitCode = 1;
}
