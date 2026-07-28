const OPTION_IDS = ['a', 'b', 'c', 'd'];
const QUESTION_COUNT_BY_LEVEL = {
  A1: 10,
  A2: 10,
  B1: 15,
  B2: 15,
  C1: 20,
  C2: 20
};

const PROMPT_VARIANTS = [
  (prompt) => prompt,
  (prompt) => `Dans un contexte formel, ${lowerFirst(prompt)}`,
  (prompt) => `Pour préserver la précision du propos, ${lowerFirst(prompt)}`,
  (prompt) => `Dans une argumentation nuancée, ${lowerFirst(prompt)}`,
  (prompt) => `Après avoir vérifié la structure, ${lowerFirst(prompt)}`
];

function lowerFirst(value) {
  const text = String(value || '').trim();
  if (!text) return text;
  return `${text.charAt(0).toLocaleLowerCase('fr-FR')}${text.slice(1)}`;
}

function validExercises(exercises) {
  return (exercises || []).filter(
    (exercise) =>
      exercise?.type === 'mcq' &&
      Array.isArray(exercise.options) &&
      exercise.options.length >= 4 &&
      Number.isInteger(exercise.answer) &&
      exercise.options[exercise.answer] !== undefined
  );
}

function buildQuestion(level, unitSlug, exercise, index) {
  const original = exercise.options.slice(0, 4);
  const originalAnswer = Math.min(exercise.answer, 3);
  const shift = index % 4;
  const options = original.map((_, optionIndex) => original[(optionIndex + shift) % 4]);
  const correctIndex = (originalAnswer - shift + 4) % 4;
  const variant = PROMPT_VARIANTS[Math.floor(index / 4) % PROMPT_VARIANTS.length];

  return {
    id: `french-${level.toLowerCase()}-${unitSlug}-grammar-q${index + 1}`,
    type: 'mcq',
    prompt: variant(exercise.prompt),
    options: options.map((text, optionIndex) => ({
      id: OPTION_IDS[optionIndex],
      text
    })),
    correctOptionId: OPTION_IDS[correctIndex],
    explanation:
      exercise.explanation ||
      `La bonne réponse est « ${original[originalAnswer]} » : elle respecte la structure étudiée dans cette leçon.`,
    difficulty: index < 7 ? 'application' : index < 14 ? 'consolidation' : 'maîtrise'
  };
}

function buildFrenchGrammarTest(level, unitSlug, exercises) {
  const source = validExercises(exercises);
  if (source.length < 4) return null;

  const questionCount = QUESTION_COUNT_BY_LEVEL[level] || 10;
  const questions = Array.from({ length: questionCount }, (_, index) =>
    buildQuestion(level, unitSlug, source[index % source.length], index)
  );

  return {
    id: `french-${level.toLowerCase()}-${unitSlug}-grammar-test`,
    passingScore: 70,
    questions
  };
}

function ensureFrenchGrammarTests(units, level) {
  for (const unit of units || []) {
    const grammar = unit.activities?.grammar;
    if (!grammar) continue;

    const test = buildFrenchGrammarTest(level, unit.slug, grammar.exercises);
    if (test) grammar.grammarTest = test;
  }
  return units;
}

module.exports = {
  QUESTION_COUNT_BY_LEVEL,
  buildFrenchGrammarTest,
  ensureFrenchGrammarTests
};
