#!/usr/bin/env node
// Publishes only the authored Speaking dialogue lines for Spanish A1-C2.
// This deliberately leaves all other lesson sections, exercises, learner
// progress and course metadata untouched.
require('dotenv').config();

const seedLessons = require('../lib/seed-lessons.json');
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const config = require('../lib/config');

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const requestedLevels = process.argv
  .slice(2)
  .filter((argument) => !argument.startsWith('--'))
  .map((level) => level.toUpperCase());
const levels = requestedLevels.length ? requestedLevels : LEVELS;

if (levels.some((level) => !LEVELS.includes(level))) {
  throw new Error(`Nivel no válido. Usa: ${LEVELS.join(', ')}.`);
}
if (!process.argv.includes('--confirm')) {
  throw new Error('Añade --confirm para publicar los diálogos de Speaking.');
}

async function main() {
  if (!config.isSupabaseConfigured) throw new Error('Supabase no está configurado.');
  const lessons = seedLessons.filter(
    (lesson) =>
      lesson.target_language === 'spanish' &&
      lesson.skill === 'speaking' &&
      levels.includes(lesson.level)
  );
  const expected = levels.length * 12;
  if (lessons.length !== expected) {
    throw new Error(`Se esperaban ${expected} lecciones de Speaking y se encontraron ${lessons.length}.`);
  }

  const supabase = getSupabaseAdmin();
  const { data: publishedLessons, error: lessonsError } = await supabase
    .from('course_lessons')
    .select('id,slug')
    .in('slug', lessons.map((lesson) => lesson.slug));
  if (lessonsError) throw new Error(`course_lessons: ${lessonsError.message}`);

  const idsBySlug = new Map((publishedLessons || []).map((lesson) => [lesson.slug, lesson.id]));
  const missing = lessons.filter((lesson) => !idsBySlug.has(lesson.slug)).map((lesson) => lesson.slug);
  if (missing.length) throw new Error(`Lecciones publicadas no encontradas: ${missing.join(', ')}.`);

  for (const lesson of lessons) {
    const lessonId = idsBySlug.get(lesson.slug);
    const dialogue = lesson.content_json?.dialogue || [];
    const { error: deleteError } = await supabase
      .from('lesson_sections')
      .delete()
      .eq('lesson_id', lessonId)
      .eq('type', 'dialogue_line');
    if (deleteError) throw new Error(`${lesson.slug}: ${deleteError.message}`);

    const { error: insertError } = await supabase.from('lesson_sections').insert(
      dialogue.map((line, index) => ({
        lesson_id: lessonId,
        type: 'dialogue_line',
        order_index: index,
        speaker: line.speaker,
        line: line.line,
        translation: line.translation || null
      }))
    );
    if (insertError) throw new Error(`${lesson.slug}: ${insertError.message}`);
  }

  console.log(`Publicados ${lessons.length} diálogos de Speaking para Español ${levels.join(', ')}.`);
}

main().catch((error) => {
  console.error(`No se pudieron publicar los diálogos: ${error.message}`);
  process.exit(1);
});
