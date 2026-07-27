const COMMON_WORDS = new Set([
  'about', 'after', 'again', 'also', 'and', 'are', 'because', 'before', 'but',
  'can', 'dans', 'des', 'elle', 'elles', 'est', 'for', 'from', 'have', 'her',
  'his', 'il', 'ils', 'les', 'mais', 'nous', 'pour', 'que', 'qui', 'she',
  'that', 'the', 'their', 'them', 'they', 'this', 'tout', 'une', 'vous',
  'was', 'were', 'when', 'with'
]);

function transcriptWords(text) {
  return String(text || '')
    .match(/[\p{L}’'-]+/gu)
    ?.map((word) => word.replace(/^['’]|['’]$/g, ''))
    .filter((word) => word.length >= 5 && !COMMON_WORDS.has(word.toLowerCase())) || [];
}

function buildVocabulary(transcript, limit = 6) {
  const seen = new Set();
  return transcriptWords(transcript)
    .filter((word) => {
      const key = word.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map((word) => ({ word, translation: '', example: '' }));
}

function buildDictation(segments, count) {
  const candidates = segments.filter((segment) => segment.text.split(/\s+/).length >= 5);
  if (!candidates.length) return { segments: [] };
  const indexes = Array.from({ length: Math.min(count, candidates.length) }, (_, index) =>
    Math.round((index * (candidates.length - 1)) / Math.max(1, count - 1))
  );
  return {
    segments: [...new Set(indexes)].map((candidateIndex, index) => ({
      order: index,
      text: candidates[candidateIndex].text
    }))
  };
}

function buildComprehension(slug, segments, level, language) {
  // All answer choices come from the transcript. The previous generic prompt
  // ("Which information is stated?") therefore made every choice true. These
  // questions test when an event happens in the story instead.
  const substantialSegments = segments
    .map((segment, index) => ({ ...segment, sourceIndex: index }))
    .filter((segment) => segment.text.trim().split(/\s+/).length >= 4);
  const candidates = substantialSegments.length >= 3
    ? substantialSegments
    : segments.map((segment, index) => ({ ...segment, sourceIndex: index }));
  const selectedCandidates = [
    candidates[0],
    candidates[Math.floor((candidates.length - 1) / 3)],
    candidates[Math.floor(((candidates.length - 1) * 2) / 3)],
    candidates[candidates.length - 1]
  ].filter((segment, index, list) =>
    segment && list.findIndex((item) => item.sourceIndex === segment.sourceIndex) === index
  );
  const positionPrompts = language === 'french'
    ? [
        'Quel détail ouvre l’histoire ?',
        'Que se passe-t-il ensuite dans l’histoire ?',
        'Quel événement arrive plus tard dans l’histoire ?',
        'Comment se termine l’histoire ?'
      ]
    : [
        'Which detail opens the story?',
        'What happens next in the story?',
        'Which event happens later in the story?',
        'How does the story end?'
      ];
  return {
    id: `${slug}-comprehension`,
    passingScore: 70,
    questions: selectedCandidates.map((selectedSegment, questionIndex) => {
      const answer = selectedSegment.text;
      const distractors = candidates
        .filter((segment) => segment.sourceIndex !== selectedSegment.sourceIndex)
        .sort((a, b) =>
          Math.abs(b.sourceIndex - selectedSegment.sourceIndex) -
          Math.abs(a.sourceIndex - selectedSegment.sourceIndex)
        )
        .slice(0, 3)
        .map((segment) => segment.text);
      const options = [answer, ...distractors].slice(0, 4);
      const shift = questionIndex % options.length;
      const rotated = [...options.slice(shift), ...options.slice(0, shift)];
      return {
        id: `q${questionIndex + 1}`,
        type: 'mcq',
        prompt: positionPrompts[questionIndex],
        options: rotated.map((text, optionIndex) => ({ id: `o${optionIndex + 1}`, text })),
        correctOptionId: `o${rotated.indexOf(answer) + 1}`,
        explanation: answer
      };
    })
  };
}

function enrichOfficialListening(units, { language, level }) {
  units.forEach((unit) => {
    const activity = unit.activities?.listening;
    if (!activity?.mainTranscript || !activity?.transcriptSegments?.length) {
      throw new Error(`${language} ${level} ${unit.slug}: missing official Listening transcript`);
    }
    const rebuilt = activity.transcriptSegments.map((segment) => segment.text).join(' ');
    if (rebuilt !== activity.mainTranscript) {
      throw new Error(`${language} ${level} ${unit.slug}: transcriptSegments do not reconstruct mainTranscript`);
    }
    activity.listeningType = 'story';
    activity.title = activity.storyTitle;
    activity.description = `Official ${language === 'french' ? 'French' : 'English'} ${level} listening story.`;
    activity.transcript = activity.mainTranscript;
    activity.dialogue = [];
    activity.vocabulary = buildVocabulary(activity.mainTranscript);
    activity.phoneticSupport = {
      enabled: true,
      locale: language === 'french' ? 'fr-FR' : 'en-US',
      focusWords: activity.vocabulary.map((item) => item.word),
      segments: [],
      fullIpa: null,
      reviewStatus: 'focus-only'
    };
    activity.dictation = buildDictation(activity.transcriptSegments, level === 'A2' ? 4 : 3);
    activity.listeningComprehension = buildComprehension(
      `${language}-${level.toLowerCase()}-${unit.slug}-listening`,
      activity.transcriptSegments,
      level,
      language
    );
    activity.exercises = activity.listeningComprehension.questions.map((question) => ({
      type: 'mcq',
      prompt: question.prompt,
      options: question.options.map((option) => option.text),
      answer: question.options.findIndex((option) => option.id === question.correctOptionId)
    }));
  });
  return units;
}

module.exports = { enrichOfficialListening };
