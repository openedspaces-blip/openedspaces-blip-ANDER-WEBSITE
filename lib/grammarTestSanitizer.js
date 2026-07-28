// lib/grammarTestSanitizer.js
// Single source of truth for "what is safe to ship before a Grammar test
// is submitted". Used by both lib/courseLessonsService.js (the live API,
// GET /api/lessons/:slug) and scripts/sync-worlds-from-seed.js (the
// offline static bundle, window.ANDERGO_LANGUAGE_WORLDS) so the two paths
// can never drift and leak the answer key from only one of them - mirrors
// how course_lessons.extra already excludes dictation.segments[].text for
// the same reason.
function inferGrammarLevel(grammarTest) {
  const searchable = [
    grammarTest?.id,
    ...(grammarTest?.questions || []).map((question) => question?.id)
  ]
    .filter(Boolean)
    .join(' ');
  return searchable.match(/(?:^|[-_\s])(A1|A2|B1|B2|C1|C2)(?:$|[-_\s])/i)?.[1]?.toUpperCase() || '';
}

// Sentence-reconstruction answers are rendered verbatim as chips.  Keep
// French elisions intact before chunking so an authored fallback such as
// "je améliorerai" cannot turn into an invalid sentence for the learner.
// Applying this here keeps the client payload and the server-side grader on
// the same canonical set of item ids.
function normalizeReconstructionSentence(value) {
  return String(value || '')
    .trim()
    .replace(/\bje\s+([aàâäéèêëîïôöùûüœæh])/giu, "j’$1");
}

function buildReconstructionQuestion(question, level) {
  const answer = (question.acceptedAnswers || [])
    .map(normalizeReconstructionSentence)
    .sort((a, b) => b.split(/\s+/).length - a.split(/\s+/).length)[0] || '';
  const words = answer.split(/\s+/).filter(Boolean);
  if (words.length < 3 || words.length > 18) return question;

  const chunkSize = ['A1', 'A2'].includes(level)
    ? 1
    : ['C1', 'C2'].includes(level)
      ? 3
      : 2;
  const chunks = [];
  for (let index = 0; index < words.length; index += chunkSize) {
    chunks.push(words.slice(index, index + chunkSize).join(' '));
  }
  if (chunks.length < 2) return question;

  const items = chunks.map((text, index) => ({
    id: `${question.id}-part-${index + 1}`,
    text
  }));
  return {
    ...question,
    type: 'ordering',
    interaction: 'reconstruction',
    items,
    correctOrder: items.map((item) => item.id)
  };
}

// Written correction remains useful, but not for every item. Most short
// fill-in corrections become a touch/drag sentence reconstruction. At C1/C2
// every second written item stays open-ended so advanced learners still
// produce language rather than only recognizing it.
function prepareGrammarTestForPractice(grammarTest) {
  if (!grammarTest || !Array.isArray(grammarTest.questions)) return grammarTest;
  const level = inferGrammarLevel(grammarTest);
  if (!level) return grammarTest;
  let fillBlankIndex = 0;
  return {
    ...grammarTest,
    questions: grammarTest.questions.map((question) => {
      if (question?.type !== 'fill_blank') return question;
      const currentIndex = fillBlankIndex;
      fillBlankIndex += 1;
      if (['C1', 'C2'].includes(level) && currentIndex % 2 === 1) return question;
      return buildReconstructionQuestion(question, level);
    })
  };
}

function sanitizeGrammarTestQuestion(question) {
  if (!question) return null;
  const { id, type, prompt, difficulty } = question;
  const base = { id, type, prompt };
  if (difficulty) base.difficulty = difficulty;
  if (type === 'mcq') {
    base.options = (question.options || []).map(({ id: optId, text }) => ({ id: optId, text }));
  } else if (type === 'ordering') {
    base.items = (question.items || []).map(({ id: itemId, text }) => ({ id: itemId, text }));
    if (question.interaction) base.interaction = question.interaction;
  }
  // fill_blank has no other client-safe field beyond id/type/prompt -
  // acceptedAnswers is answer-bearing and intentionally omitted.
  return base;
}

function sanitizeGrammarTestForClient(grammarTest) {
  const prepared = prepareGrammarTestForPractice(grammarTest);
  if (!prepared || !Array.isArray(prepared.questions)) return null;
  return {
    id: prepared.id,
    passingScore: prepared.passingScore,
    questions: prepared.questions.map(sanitizeGrammarTestQuestion).filter(Boolean)
  };
}

module.exports = { prepareGrammarTestForPractice, sanitizeGrammarTestForClient };
