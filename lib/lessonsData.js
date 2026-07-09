const {
  LEVELS,
  SKILLS,
  TOPICS_BY_LEVEL,
  TOPIC_LOCALIZATION,
  LANGUAGE_META,
  normalizeLanguage
} = require('./worldSeed');

function titleCaseSkill(skill) {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function isPremium(level, lessonIndex) {
  if (['A1', 'A2', 'B1', 'B2'].includes(level)) {
    return lessonIndex >= 3;
  }
  return lessonIndex >= 1;
}

function buildDescription(languageName, level, topicTitle, skill) {
  return `${languageName} ${level} practice on ${topicTitle.toLowerCase()} with a focus on ${skill}.`;
}

function buildContent(languageName, level, topicTitle, skill) {
  return {
    text: `${topicTitle} in ${languageName} at ${level} level. Strengthen ${skill} through clear examples, short prompts and guided review.`,
    exercises: [
      `Review the core ${skill} patterns used in ${topicTitle.toLowerCase()}.`,
      `Complete a short ${level} task connected to ${topicTitle.toLowerCase()}.`,
      `Reflect on one new phrase you can reuse in ${languageName}.`
    ]
  };
}

function getSlug(language, level, topicSlug) {
  if (language === 'english') {
    return `${topicSlug}-${level.toLowerCase()}`;
  }

  return `${topicSlug}-${LANGUAGE_META[language].code}-${level.toLowerCase()}`;
}

function getLocalLessons(language = 'english') {
  const normalizedLanguage = normalizeLanguage(language);
  const localizedTopics = TOPIC_LOCALIZATION[normalizedLanguage] || TOPIC_LOCALIZATION.english;
  const languageName = LANGUAGE_META[normalizedLanguage].name;
  const lessons = [];

  for (const level of LEVELS) {
    const baseTopics = TOPICS_BY_LEVEL[level];
    const localTopics = localizedTopics[level] || baseTopics;

    for (let index = 0; index < baseTopics.length; index += 1) {
      const [defaultSlug, defaultTitle] = baseTopics[index];
      const [localizedSlug = defaultSlug, localizedTitle = defaultTitle] = localTopics[index] || [];
      const skill = SKILLS[index];

      lessons.push({
        slug: getSlug(normalizedLanguage, level, localizedSlug),
        title: `${localizedTitle} · ${titleCaseSkill(skill)}`,
        language: normalizedLanguage,
        level,
        skill,
        description: buildDescription(languageName, level, localizedTitle, skill),
        premium: isPremium(level, index),
        content: buildContent(languageName, level, localizedTitle, skill)
      });
    }
  }

  return lessons;
}

module.exports = { getLocalLessons };
