const ENGLISH_TOOLKIT = [
  ['framework', 'marco conceptual'], ['stakeholder', 'parte interesada'], ['trade-off', 'compensación'], ['constraint', 'limitación'], ['implication', 'implicación'], ['criterion', 'criterio'], ['scope', 'alcance'], ['threshold', 'umbral'], ['mechanism', 'mecanismo'], ['incentive', 'incentivo'], ['disparity', 'desigualdad'], ['accountability', 'rendición de cuentas'], ['feasibility', 'viabilidad'], ['robustness', 'solidez'], ['contingency', 'contingencia'], ['caveat', 'salvedad'], ['corroborate', 'corroborar'], ['scrutinise', 'examinar críticamente'], ['mitigate', 'mitigar'], ['substantiate', 'fundamentar'], ['reconcile', 'conciliar'], ['underscore', 'subrayar'], ['salient', 'sobresaliente o relevante'], ['equivocal', 'ambiguo o no concluyente']
];
const FRENCH_TOOLKIT = [
  ['un cadre d’analyse', 'marco de análisis'], ['une partie prenante', 'parte interesada'], ['un arbitrage', 'compensación'], ['une contrainte', 'limitación'], ['une incidence', 'implicación'], ['un critère', 'criterio'], ['la portée', 'alcance'], ['un seuil', 'umbral'], ['un mécanisme', 'mecanismo'], ['une incitation', 'incentivo'], ['un écart', 'desigualdad'], ['la redevabilité', 'rendición de cuentas'], ['la faisabilité', 'viabilidad'], ['la robustesse', 'solidez'], ['une éventualité', 'contingencia'], ['une réserve', 'salvedad'], ['étayer', 'fundamentar'], ['examiner de près', 'examinar críticamente'], ['atténuer', 'mitigar'], ['corroborer', 'corroborar'], ['concilier', 'conciliar'], ['souligner', 'subrayar'], ['saillant', 'sobresaliente o relevante'], ['équivoque', 'ambiguo o no concluyente']
];

function normalise(item) {
  return { ...item, word: String(item.word || '').trim() };
}

function enrichAdvancedVocabulary(items, { language, topic }) {
  const source = items.map(normalise).filter((item) => item.word);
  const toolkit = language === 'french' ? FRENCH_TOOLKIT : ENGLISH_TOOLKIT;
  const seen = new Set(source.map((item) => item.word.toLocaleLowerCase()));
  for (const [word, translation] of toolkit) {
    if (seen.has(word.toLocaleLowerCase()) || source.length >= 30) continue;
    source.push({
      word,
      translation,
      definition: language === 'french' ? `Terme utile pour analyser ${topic} avec précision.` : `A high-precision term for analysing ${topic} with care.`,
      example: language === 'french' ? `Dans cette unité, « ${word} » permet de nuancer l’analyse de ${topic}.` : `In this unit, “${word}” helps refine the analysis of ${topic}.`,
      partOfSpeech: word.includes(' ') ? 'expression' : 'academic term'
    });
    seen.add(word.toLocaleLowerCase());
  }
  return source.slice(0, 30);
}

function usefulExpressions(language, topic) {
  return language === 'french'
    ? [`À première vue, …`, `Il convient de distinguer … de …`, `Cette conclusion doit toutefois être nuancée.`, `Les données disponibles permettent de …`, `La question centrale demeure celle de ${topic}.`, `Sous réserve que les conditions soient réunies, …`]
    : [`At first glance, …`, `It is important to distinguish … from …`, `This conclusion should nevertheless be qualified.`, `The available evidence suggests that …`, `The central issue remains ${topic}.`, `Provided that the conditions are met, …`];
}

module.exports = { enrichAdvancedVocabulary, usefulExpressions };
