#!/usr/bin/env node
// Gives every current English Grammar lesson (A1-C1) the same teaching
// contract. Existing authored tests are preserved; legacy B2/C1 exercises
// become server-graded four-option tests.
const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const levels = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
// Beginner tests keep ten short items. From B1 onwards, eight distinct,
// authored applications are more useful than padding a bank by cloning and
// rotating questions the learner has already answered.
const questionCountByLevel = { A1: 10, A2: 10, B1: 8, B2: 8, C1: 8, C2: 8 };

function labelledSection(note, label) {
  const paragraph = String(note || '')
    .split(/\n\n+/)
    .find((item) => item.trim().toLowerCase().startsWith(`${label}:`));
  return paragraph ? paragraph.slice(paragraph.indexOf(':') + 1).trim() : '';
}

function grammarProfile(row) {
  const content = row.content_json || {};
  const note = String(content.grammar || '').trim();
  const phrases = (content.phrases || []).filter(Boolean);
  const firstSentence = note.split(/(?<=[.!?])\s+/)[0] || row.description || '';
  return {
    name: row.title,
    context: row.description || `Grammar connected to the ${row.unit_slug || row.level} story.`,
    definition: labelledSection(note, 'rule') || firstSentence,
    explanation: labelledSection(note, 'rule') || labelledSection(note, 'pattern') || firstSentence,
    structure:
      labelledSection(note, 'pattern') ||
      (phrases[0] ? `Core pattern: ${phrases[0]}` : `Study the form and sentence position of ${row.title}.`),
    purpose: labelledSection(note, 'goal') || row.description || `Use ${row.title} accurately in context.`,
    function: labelledSection(note, 'goal') || row.description || `Use ${row.title} accurately in context.`,
    examples: phrases.slice(0, 4)
  };
}

function optionId(index) {
  return ['a', 'b', 'c', 'd'][index];
}

function testFromExercises(row) {
  const exercises = (row.content_json?.exercises || []).filter(
    (exercise) => exercise.type === 'mcq' && Array.isArray(exercise.options) && exercise.options.length === 4
  );
  if (!exercises.length) return null;
  return {
    id: `${row.slug}-test`,
    passingScore: 70,
    questions: exercises.map((exercise, questionIndex) => ({
      id: `${row.slug}-q${questionIndex + 1}`,
      type: 'mcq',
      prompt: exercise.prompt,
      options: exercise.options.map((text, optionIndex) => ({
        id: optionId(optionIndex),
        text
      })),
      correctOptionId: optionId(exercise.answer),
      explanation:
        exercise.explanation ||
        `Review “${row.title}” and compare the form and meaning of all four options.`
    }))
  };
}

function c1QuestionBank(row) {
  if (row.level !== 'C1') return null;
  const items = [
    ['Choose the correct inversion.', ['Rarely I have seen such evidence.', 'Rarely have I seen such evidence.', 'Rarely did I have seen such evidence.', 'Rarely I saw such evidence.'], 1],
    ['Choose the cleft sentence that emphasizes the evidence.', ['The evidence changed the debate.', 'It was the evidence that changed the debate.', 'The evidence, it changed the debate.', 'What changed was evidence the debate.'], 1],
    ['Which sentence uses appropriate academic hedging?', ['This policy definitely solves everything.', 'This policy may contribute to a reduction in emissions.', 'This policy maybe solves all.', 'This policy must perhaps certainly work.'], 1],
    ['Choose the most effective nominalization.', ['The committee decided quickly.', 'The committee made a quick decision.', 'The committee was decide quickly.', 'The quick decided committee acted.'], 1],
    ['Which connector signals concession?', ['Consequently', 'Nevertheless', 'Similarly', 'For instance'], 1],
    ['Choose the correct mixed conditional.', ['If they had invested earlier, the system would be safer now.', 'If they invested earlier, the system would have been safer now.', 'If they had invest, it is safer now.', 'If they would invest, it had been safer.'], 0],
    ['Which sentence maintains a formal register?', ['The findings are kind of weird.', 'The findings warrant further investigation.', 'The findings are super bad.', 'The findings don’t mean a thing.'], 1],
    ['Choose the correct mandative subjunctive.', ['They recommended that she submits the report.', 'They recommended that she submit the report.', 'They recommended her submits the report.', 'They recommended that she submitted the report tomorrow.'], 1],
    ['Which sentence uses ellipsis naturally?', ['Some supported the proposal; others did not.', 'Some supported the proposal; others did not supported.', 'Some support proposal; others not did.', 'Some supported; others did the proposal not.'], 0],
    ['Choose the correct fronted structure.', ['More significant was the change in public opinion.', 'More significant the change was in public opinion.', 'Was more significant the public opinion change.', 'The change more significant was public opinion.'], 0],
    ['Which sentence uses a natural academic collocation?', ['The study does a conclusion.', 'The study draws a conclusion.', 'The study makes a conclusion draw.', 'The study takes a conclusion.'], 1],
    ['Choose the sentence with controlled clause structure.', ['Although the sample was small, the results, which were independently reviewed, remain relevant.', 'Although the sample small the results which reviewed remain.', 'The sample was although small, results remain which relevant.', 'Although was small, independently the results reviewed.'], 0]
  ];
  return {
    id: `${row.slug}-test`,
    passingScore: 70,
    questions: items.map(([prompt, options, answer], index) => ({
      id: `${row.slug}-q${index + 1}`,
      type: 'mcq',
      prompt,
      options: options.map((text, optionIndex) => ({ id: optionId(optionIndex), text })),
      correctOptionId: optionId(answer),
      explanation: `This item applies the C1 focus “${row.title}” with attention to form, meaning and register.`
    }))
  };
}

function resizeQuestionBank(test, targetCount, slug) {
  if (!test?.questions?.length) return test;
  const source = test.questions;
  const questions = [];
  for (let index = 0; index < Math.min(targetCount, source.length); index += 1) {
    const original = source[index % source.length];
    const clone = JSON.parse(JSON.stringify(original));
    clone.id = `${slug}-q${index + 1}`;
    questions.push(clone);
  }
  return { ...test, questions };
}

const rows = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
let changed = 0;
let createdTests = 0;

for (const row of rows) {
  if (row.target_language !== 'english' || row.skill !== 'grammar' || !levels.has(row.level)) continue;
  const content = (row.content_json = row.content_json || {});
  const extra = (content.extra = content.extra || {});
  extra.grammarProfile = grammarProfile(row);
  if (!extra.grammarTest) {
    const test = c1QuestionBank(row) || testFromExercises(row);
    if (test) {
      extra.grammarTest = test;
      createdTests += 1;
    }
  }
  extra.grammarTest = resizeQuestionBank(
    extra.grammarTest,
    questionCountByLevel[row.level],
    row.slug
  );
  changed += 1;
}

fs.writeFileSync(seedPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
console.log(`Normalized ${changed} English Grammar lessons from A1 through C2.`);
console.log(`Created ${createdTests} missing A-D tests; existing authored tests were preserved.`);
