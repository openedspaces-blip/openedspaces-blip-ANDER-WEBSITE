const INTENTION_PATTERNS = {
  english: /\b(want|need|plan|decid|propos|suggest|should|would like|because|in order to|hope|intend)\b/i,
  french: /\b(veux|veut|voulons|besoin|prévoi|décid|propos|sugg|devr|parce que|afin de|espèr|souhait)\b/i,
  spanish: /\b(quier|necesit|plane|decid|propon|sugier|deber|porque|para poder|esper|intenci)\b/i
};

function normalizeTranscriptEvidence(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[“”«»"'.,;:!?¡¿()[\]{}…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function transcriptSupportsOption(transcript, option) {
  const normalizedTranscript = normalizeTranscriptEvidence(transcript);
  const normalizedOption = normalizeTranscriptEvidence(option);
  return Boolean(normalizedOption) && normalizedTranscript.includes(normalizedOption);
}

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueTexts(values) {
  const seen = new Set();
  return values.filter((value) => {
    const text = cleanText(value);
    const key = text.toLocaleLowerCase();
    if (!text || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function splitTranscript(value) {
  const transcript = cleanText(value);
  if (!transcript) return [];
  return transcript
    .split(/(?<=[.!?…])(?:["”»])?\s+(?=(?:["“«]?[A-ZÁÉÍÓÚÜÑÀÂÇÉÈÊËÎÏÔÙÛÜŸ]))/u)
    .map(cleanText)
    .filter(Boolean);
}

function collectStoryLines(row) {
  const content = row.content_json || {};
  const extra = content.extra || {};
  const transcript = cleanText(extra.mainTranscript || content.transcript);
  const segmentLines = (extra.transcriptSegments || [])
    .map((segment) => segment?.text)
    .filter((line) => transcriptSupportsOption(transcript, line));
  const transcriptLines = splitTranscript(transcript);

  const strictCanonicalOrder =
    row.target_language === 'english' &&
    ['B1', 'B2', 'C1', 'C2'].includes(String(row.level || '').toUpperCase());
  // Advanced English uses the reviewed transcript segments as its sole order
  // source. Mixing a second sentence split into them could append partial
  // quotations after the real ending.
  const lines = strictCanonicalOrder
    ? segmentLines.length >= 4
      ? uniqueTexts(segmentLines)
      : uniqueTexts(transcriptLines)
    : uniqueTexts([...segmentLines, ...transcriptLines]);
  if (lines.length >= 4) return lines;

  // A few short A1/B1 stories are authored as only three long segments.
  // Split coordinated clauses so the comprehension bank can still test four
  // distinct moments without inventing facts outside the recording.
  const clauses = lines.flatMap((line) =>
    line
      .split(/(?:;\s+|,\s+(?:and|but|et|mais|y|pero)\s+|\s+(?:and|et|y)\s+)/iu)
      .map(cleanText)
      .filter((clause) => clause.split(/\s+/).length >= 4)
  );
  return clauses.length >= 4 ? uniqueTexts(clauses) : lines;
}

function collectA1StoryLines(row) {
  const content = row.content_json || {};
  const transcript = cleanText(content.extra?.mainTranscript || content.transcript);
  return uniqueTexts(
    (
      transcript.match(/[^.!?]+(?:[.!?]+(?:\s*[»”"])?|$)/gu) || []
    )
      .map((line) => cleanText(line).replace(/^[»”"]\s*/, ''))
      .filter((line) => line.split(/\s+/).length >= 4)
  );
}

function selectSpread(lines, count = 4) {
  if (lines.length <= count) return [...lines];
  const indexes = Array.from({ length: count }, (_, index) =>
    Math.round((index * (lines.length - 1)) / (count - 1))
  );
  return uniqueTexts(indexes.map((index) => lines[index]));
}

function shortAnchor(value, maxLength = 72) {
  const text = cleanText(value).replace(/^.{1,24}:\s*/, '');
  if (text.length <= maxLength) return text;
  const shortened = text.slice(0, maxLength - 1).replace(/\s+\S*$/, '');
  return `${shortened}…`;
}

function quoteTitle(title, language) {
  if (language === 'english') return `“${title}”`;
  if (language === 'french') return `« ${title} »`;
  return `«${title}»`;
}

function buildPrompts({ language, level, title, sequenceAnchor, intentionAnchor }) {
  const quotedTitle = quoteTitle(title, language);
  const quotedSequence = quoteTitle(shortAnchor(sequenceAnchor), language);
  const quotedIntention = quoteTitle(shortAnchor(intentionAnchor), language);

  if (language === 'french') {
    if (level === 'A1') {
      return [
        'Que se passe-t-il au début ?',
        'Que se passe-t-il ensuite ?',
        'Quelle est la décision ?',
        'Que se passe-t-il à la fin ?'
      ];
    }
    return [
      `Dans ${quotedTitle}, quel détail présente la situation ?`,
      `Après ${quotedSequence}, que se passe-t-il ensuite dans ${quotedTitle} ?`,
      `Quelle phrase révèle le mieux une intention ou une décision dans ${quotedTitle} ?`,
      `Quel résultat conclut ${quotedTitle} après ${quotedIntention} ?`
    ];
  }
  if (language === 'spanish') {
    return [
      `En ${quotedTitle}, ¿qué detalle presenta la situación?`,
      `Después de ${quotedSequence}, ¿qué sucede a continuación en ${quotedTitle}?`,
      `¿Qué frase revela mejor una intención o una decisión en ${quotedTitle}?`,
      `¿Qué resultado cierra ${quotedTitle} después de ${quotedIntention}?`
    ];
  }
  if (['B1', 'B2', 'C1', 'C2'].includes(level)) {
    return [
      `Which opening statement explicitly introduces ${quotedTitle}?`,
      `Which statement immediately follows ${quotedSequence} in ${quotedTitle}?`,
      `Which statement explicitly presents a reason, recommendation, qualification, or decision in ${quotedTitle}?`,
      `Which final statement explicitly closes ${quotedTitle}?`
    ];
  }
  return [
    `In ${quotedTitle}, which detail establishes the situation?`,
    `After ${quotedSequence}, what happens next in ${quotedTitle}?`,
    `Which line best reveals an intention or decision in ${quotedTitle}?`,
    `Which outcome closes ${quotedTitle} after ${quotedIntention}?`
  ];
}

function arrangeWithCorrectAt(options, answer, correctIndex) {
  const distractors = options.filter((option) => option !== answer);
  const arranged = [];
  let distractorIndex = 0;
  for (let index = 0; index < 4; index += 1) {
    arranged.push(index === correctIndex ? answer : distractors[distractorIndex++]);
  }
  return arranged;
}

function shortA1Option(value, maxWords = 14) {
  let text = cleanText(value).replace(/[«»“”"]/g, '').trim();
  const quoted = cleanText(value).match(/[«“"]\s*([^»”"]{2,100})\s*[»”"]/u)?.[1];
  if (quoted && quoted.split(/\s+/).length <= maxWords) {
    text = quoted;
  } else {
    text = text.split(/(?<=[.!?])\s+/u)[0];
  }

  text = text.replace(/^[^,]{1,28},\s+(?=[A-ZÀÂÇÉÈÊËÎÏÔÙÛÜŸ])/u, '');
  const clauses = text
    .split(/;\s+|,\s+(?:mais|puis|alors)\s+/iu)
    .map(cleanText)
    .filter(Boolean);
  if (clauses[0]) text = clauses[0];

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > maxWords) {
    const coordinated = text.split(/\s+et\s+/iu)[0];
    text =
      coordinated.split(/\s+/).length >= 4
        ? coordinated
        : `${words.slice(0, maxWords).join(' ')}…`;
  }
  return text.replace(/\s+([.!?])/g, '$1').trim();
}

function buildA1FrenchListeningBank(row, storyLines) {
  const shortFacts = uniqueTexts(storyLines.map((line) => shortA1Option(line, 18))).filter(
    (fact) => {
      const words = fact.split(/\s+/).filter(Boolean).length;
      return words >= 4 && words <= 18 && !fact.includes('…');
    }
  );
  // Keep the transcript order intact so questions 1-4 test beginning,
  // continuation, another fact and ending rather than four arbitrary facts.
  const factPool = shortFacts;
  if (factPool.length < 4) {
    throw new Error(
      `${row.slug}: el listening A1 necesita cuatro hechos breves y distintos.`
    );
  }

  const answers = selectSpread(factPool, 4);
  const prompts = [
    'Que se passe-t-il au début ?',
    'Que fait la personne ensuite ?',
    'Quel autre détail est correct ?',
    'Que se passe-t-il à la fin ?'
  ];
  const questions = answers.map((answer, questionIndex) => {
    const optionTexts = arrangeWithCorrectAt(answers, answer, questionIndex);
    return {
      id: `q${questionIndex + 1}`,
      type: 'mcq',
      prompt: prompts[questionIndex],
      options: optionTexts.map((text, optionIndex) => ({
        id: `o${optionIndex + 1}`,
        text
      })),
      correctOptionId: `o${questionIndex + 1}`,
      explanation: answer
    };
  });

  return {
    id: `${row.slug}-listening-comprehension`,
    passingScore: 70,
    questions
  };
}

function buildContextualListeningBank(row) {
  const language = row.target_language || 'english';
  const level = String(row.level || '').toUpperCase();
  const useA1FrenchCopy = language === 'french' && level === 'A1';
  const useCanonicalEnglishQuestions =
    language === 'english' && ['B1', 'B2', 'C1', 'C2'].includes(level);
  const title =
    (useCanonicalEnglishQuestions &&
      cleanText(row.content_json?.extra?.storyTitle)) ||
    cleanText(row.title) ||
    cleanText(row.slug);
  const storyLines = useA1FrenchCopy ? collectA1StoryLines(row) : collectStoryLines(row);
  if (useA1FrenchCopy) {
    return buildA1FrenchListeningBank(row, storyLines);
  }
  if (storyLines.length < 4) {
    throw new Error(
      `${row.slug}: la transcripción necesita al menos cuatro fragmentos distintos para generar preguntas contextualizadas.`
    );
  }

  const selected = selectSpread(storyLines, 4);

  const intentionPattern = INTENTION_PATTERNS[language] || INTENTION_PATTERNS.english;
  const intentionAnswer =
    storyLines.find(
      (line, index) =>
        index > (useCanonicalEnglishQuestions ? 1 : 0) &&
        index < storyLines.length - 1 &&
        intentionPattern.test(line)
    ) ||
    selected[2];
  const answers = useCanonicalEnglishQuestions
    ? [
        storyLines[0],
        storyLines[1],
        intentionAnswer,
        storyLines[storyLines.length - 1]
      ]
    : [selected[0], selected[1], intentionAnswer, selected[selected.length - 1]];
  const prompts = buildPrompts({
    language,
    level,
    title,
    sequenceAnchor: selected[0],
    intentionAnchor: intentionAnswer
  });

  const questions = answers.map((answer, questionIndex) => {
    const rawAlternatives = uniqueTexts([
      answer,
      ...selected,
      ...storyLines
    ]).slice(0, 12);
    const displayedAnswer = useA1FrenchCopy ? shortA1Option(answer) : answer;
    const alternatives = useA1FrenchCopy
      ? uniqueTexts(rawAlternatives.map(shortA1Option))
      : rawAlternatives;
    const optionSet = uniqueTexts([
      displayedAnswer,
      ...alternatives.filter((option) => option !== displayedAnswer)
    ]).slice(0, 4);
    if (optionSet.length !== 4) {
      throw new Error(`${row.slug}: no se pudieron crear cuatro opciones para la pregunta ${questionIndex + 1}.`);
    }
    const optionTexts = arrangeWithCorrectAt(optionSet, displayedAnswer, questionIndex);
    return {
      id: `q${questionIndex + 1}`,
      type: 'mcq',
      prompt: prompts[questionIndex],
      options: optionTexts.map((text, optionIndex) => ({
        id: `o${optionIndex + 1}`,
        text
      })),
      correctOptionId: `o${questionIndex + 1}`,
      explanation: displayedAnswer
    };
  });

  const transcript =
    row.content_json?.extra?.mainTranscript || row.content_json?.transcript || '';
  for (const question of questions) {
    for (const option of question.options) {
      if (!transcriptSupportsOption(transcript, option.text)) {
        throw new Error(
          `${row.slug}: la opción "${option.text}" no procede de la transcripción canónica.`
        );
      }
    }
  }

  return {
    id: `${row.slug}-listening-comprehension`,
    passingScore: 70,
    questions
  };
}

function applyContextualListeningBank(row) {
  const bank = buildContextualListeningBank(row);
  const transcript =
    row.content_json?.extra?.mainTranscript || row.content_json?.transcript || '';
  for (const question of bank.questions) {
    for (const option of question.options) {
      if (!transcriptSupportsOption(transcript, option.text)) {
        throw new Error(
          `${row.slug}: la opción "${option.text}" no procede de la transcripción canónica.`
        );
      }
    }
  }
  row.content_json ||= {};
  row.content_json.extra ||= {};
  row.content_json.extra.listeningComprehension = bank;
  row.content_json.exercises = bank.questions.map((question) => ({
    type: 'mcq',
    prompt: question.prompt,
    options: question.options.map((option) => option.text),
    answer: Number(question.correctOptionId.slice(1)) - 1
  }));
  return row;
}

module.exports = {
  applyContextualListeningBank,
  buildContextualListeningBank,
  buildA1FrenchListeningBank,
  collectStoryLines,
  collectA1StoryLines,
  shortA1Option,
  transcriptSupportsOption
};
