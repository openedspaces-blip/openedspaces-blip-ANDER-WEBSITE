const OPTION_IDS = ['a', 'b', 'c', 'd', 'e', 'f'];

function completedPrompt(prompt, answer) {
  const source = String(prompt || '').trim();
  if (!source.includes('___')) return '';
  return source.replace('___', String(answer || '').trim());
}

function mcqQuestion(level, unitSlug, exercise, index) {
  return {
    id: `french-${level.toLowerCase()}-${unitSlug}-grammar-q${index + 1}`,
    type: 'mcq',
    prompt: exercise.prompt,
    options: (exercise.options || []).map((text, optionIndex) => ({
      id: OPTION_IDS[optionIndex] || `o${optionIndex + 1}`,
      text
    })),
    correctOptionId: OPTION_IDS[exercise.answer] || `o${exercise.answer + 1}`,
    explanation:
      `${exercise.explanation ||
      `La bonne réponse est « ${(exercise.options || [])[exercise.answer]} » : elle respecte la structure étudiée dans cette leçon.`}`,
    difficulty: index < 2 ? 'application' : index < 6 ? 'analysis' : 'precision'
  };
}

function correctionQuestion(level, unitSlug, exercise, index) {
  const options = exercise.options || [];
  const correct = String(options[exercise.answer] || '').trim();
  const incorrect = String(options.find((_, optionIndex) => optionIndex !== exercise.answer) || '').trim();
  const correctedSentence = completedPrompt(exercise.prompt, correct);
  const incorrectSentence = completedPrompt(exercise.prompt, incorrect);
  const hasSentence = Boolean(correctedSentence && incorrectSentence);

  return {
    id: `french-${level.toLowerCase()}-${unitSlug}-grammar-q${index + 5}`,
    type: 'fill_blank',
    prompt: hasSentence
      ? `🚨 Chasse à l'erreur ! Corrige la phrase suivante : « ${incorrectSentence} »`
      : `🚨 Chasse à l'erreur ! Remplace la réponse incorrecte « ${incorrect} » par la bonne réponse à cette question : « ${exercise.prompt} »`,
    acceptedAnswers: hasSentence ? [correct, correctedSentence] : [correct],
    explanation: hasSentence
      ? `La phrase correcte est : « ${correctedSentence} »`
      : `La bonne réponse est « ${correct} ».`,
    difficulty: 'precision'
  };
}

function buildFrenchGrammarTest(level, unitSlug, exercises) {
  const source = (exercises || []).filter(
    (exercise) =>
      exercise?.type === 'mcq' &&
      Array.isArray(exercise.options) &&
      Number.isInteger(exercise.answer) &&
      exercise.options[exercise.answer] !== undefined
  );
  if (source.length < 4) return null;

  if (source.length >= 8) {
    return {
      id: `french-${level.toLowerCase()}-${unitSlug}-grammar-test`,
      passingScore: 70,
      questions: source.slice(0, 8).map((exercise, index) =>
        mcqQuestion(level, unitSlug, exercise, index)
      )
    };
  }

  const core = source.slice(0, 4);
  return {
    id: `french-${level.toLowerCase()}-${unitSlug}-grammar-test`,
    passingScore: 70,
    questions: [
      ...core.map((exercise, index) => mcqQuestion(level, unitSlug, exercise, index)),
      ...core.map((exercise, index) => correctionQuestion(level, unitSlug, exercise, index))
    ]
  };
}

function ensureFrenchGrammarTests(units, level) {
  for (const unit of units || []) {
    const grammar = unit.activities?.grammar;
    if (!grammar) continue;
    if (grammar.grammarTest?.questions?.length === 8) continue;

    const test = buildFrenchGrammarTest(level, unit.slug, grammar.exercises);
    if (test) grammar.grammarTest = test;
  }
  return units;
}

module.exports = {
  buildFrenchGrammarTest,
  ensureFrenchGrammarTests
};
