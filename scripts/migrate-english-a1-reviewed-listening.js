#!/usr/bin/env node
// Applies only editorially reviewed English A1 Listening question banks to
// normalized course_lessons.extra. It does not delete lessons, exercises,
// progress or audio and is safe to re-run.
require('dotenv').config();
const { units } = require('./content/english-a1-units');
const { getSupabaseAdmin } = require('../lib/supabaseClient');
const config = require('../lib/config');

async function main() {
  if (!config.isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }
  const supabase = getSupabaseAdmin();
  const reviewed = units.filter(
    (unit) =>
      unit.activities?.listening?.listeningComprehension?.editoriallyReviewed === true
  );

  for (const unit of reviewed) {
    const slug = `english-a1-${unit.slug}-listening`;
    const { data: lesson, error: readError } = await supabase
      .from('course_lessons')
      .select('id, extra')
      .eq('slug', slug)
      .single();
    if (readError) throw new Error(`${slug}: ${readError.message}`);

    const { error: updateError } = await supabase
      .from('course_lessons')
      .update({
        extra: {
          ...(lesson.extra || {}),
          listeningComprehension: unit.activities.listening.listeningComprehension
        }
      })
      .eq('id', lesson.id);
    if (updateError) throw new Error(`${slug}: ${updateError.message}`);
    console.log(`Updated ${slug}.`);
  }

  console.log(`Applied ${reviewed.length} reviewed Listening question bank(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
