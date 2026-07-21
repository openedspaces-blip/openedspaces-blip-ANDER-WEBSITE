// lib/grammarTestSanitizer.js
// Single source of truth for "what is safe to ship before a Grammar test
// is submitted". Used by both lib/courseLessonsService.js (the live API,
// GET /api/lessons/:slug) and scripts/sync-worlds-from-seed.js (the
// offline static bundle, window.ANDERGO_LANGUAGE_WORLDS) so the two paths
// can never drift and leak the answer key from only one of them - mirrors
// how course_lessons.extra already excludes dictation.segments[].text for
// the same reason.
function sanitizeGrammarTestQuestion(question) {
  if (!question) return null;
  const { id, type, prompt, difficulty } = question;
  const base = { id, type, prompt };
  if (difficulty) base.difficulty = difficulty;
  if (type === 'mcq') {
    base.options = (question.options || []).map(({ id: optId, text }) => ({ id: optId, text }));
  } else if (type === 'ordering') {
    base.items = (question.items || []).map(({ id: itemId, text }) => ({ id: itemId, text }));
  }
  // fill_blank has no other client-safe field beyond id/type/prompt -
  // acceptedAnswers is answer-bearing and intentionally omitted.
  return base;
}

function sanitizeGrammarTestForClient(grammarTest) {
  if (!grammarTest || !Array.isArray(grammarTest.questions)) return null;
  return {
    id: grammarTest.id,
    passingScore: grammarTest.passingScore,
    questions: grammarTest.questions.map(sanitizeGrammarTestQuestion).filter(Boolean)
  };
}

module.exports = { sanitizeGrammarTestForClient };
