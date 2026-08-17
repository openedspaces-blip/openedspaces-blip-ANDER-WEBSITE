function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeTranscriptEvidence(value) {
  return cleanText(value)
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[“”«»'.,;:!?¡¿()[\]{}…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function transcriptSupportsOption(transcript, option) {
  const normalizedTranscript = normalizeTranscriptEvidence(transcript);
  const normalizedOption = normalizeTranscriptEvidence(option);
  return Boolean(normalizedOption) && normalizedTranscript.includes(normalizedOption);
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
    .split(/(?<=[.!?…])(?:[”»])?\s+(?=(?:[“«]?[A-ZÁÉÍÓÚÜÑÀÂÇÈÊËÎÏÔÙÛÜŸ]))/u)
    .map(cleanText)
    .filter((line) => line.split(/\s+/).length >= 2);
}

function collectStoryLines(row) {
  const content = row.content_json || {};
  const extra = content.extra || {};
  const transcript = cleanText(extra.mainTranscript || content.transcript);
  const segmentLines = (extra.transcriptSegments || [])
    .map((segment) => segment?.text)
    .filter((line) => transcriptSupportsOption(transcript, line));
  const transcriptLines = splitTranscript(transcript);
  const lines = uniqueTexts([...segmentLines, ...transcriptLines]);
  if (lines.length >= 4) return lines;

  const clauses = lines.flatMap((line) =>
    line
      .split(/(?:;\s+|,\s+(?:and|but|et|mais|y|pero|aber|und|ma|e)\s+)/iu)
      .map(cleanText)
      .filter((clause) => clause.split(/\s+/).length >= 2)
  );
  return uniqueTexts([...lines, ...clauses]);
}

function collectA1StoryLines(row) {
  return collectStoryLines(row);
}

function selectSpread(lines, count = 4) {
  if (lines.length <= count) return [...lines];
  const indexes = Array.from({ length: count }, (_, index) =>
    Math.round((index * (lines.length - 1)) / (count - 1))
  );
  return uniqueTexts(indexes.map((index) => lines[index]));
}

const STOP_WORDS = new Set([
  'this', 'that', 'with', 'from', 'have', 'been', 'were', 'will', 'would', 'there',
  'their', 'they', 'them', 'about', 'after', 'before', 'because', 'which', 'where',
  'when', 'what', 'your', 'and', 'one', 'two', 'three', 'old', 'the', 'are', 'is',
  'was', 'for', 'you', 'our', 'his', 'her', 'its', 'pour', 'avec', 'dans', 'mais', 'nous', 'vous', 'elle',
  'elles', 'sont', 'être', 'avoir', 'comme', 'para', 'desde', 'sobre', 'pero', 'porque',
  'cuando', 'donde', 'ellos', 'ellas', 'usted', 'nosotros', 'también', 'quiere',
  'della', 'delle', 'questa', 'questo', 'sono', 'come', 'anche', 'para', 'quando',
  'donde', 'eine', 'einen', 'einer', 'eines', 'nicht', 'auch', 'diese', 'dieser',
  'diesem', 'para', 'com', 'mais', 'uma', 'que', 'está', 'estão'
]);

function lexicalTokens(value) {
  return cleanText(value)
    .match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || [];
}

function chooseFocusToken(line, questionIndex) {
  const tokens = lexicalTokens(line);
  const candidates = tokens.filter((token) => {
    const normalized = token.toLocaleLowerCase();
    return token.length >= 3 && !STOP_WORDS.has(normalized) && !/^\d{1,4}$/u.test(token);
  });
  // A named participant or place gives a clearer comprehension anchor than
  // an arbitrary long word such as "weekday" or "eleven".
  const named = candidates.filter((token) => /^[A-ZÁÉÍÓÚÜÑÀÂÇÈÊËÎÏÔÙÛÜŸ]/u.test(token));
  const descriptive = candidates.filter((token) => token.length >= 6);
  const pool = named.length ? named : descriptive.length ? descriptive : candidates;
  return pool[(questionIndex * 2 + pool.length - 1) % pool.length] || tokens[tokens.length - 1];
}

function blankSentence(sentence, focusToken) {
  return cleanText(sentence).replace(String(focusToken), '_____');
}

function detailCue(line) {
  const words = lexicalTokens(line);
  const count = Math.min(7, Math.max(3, Math.ceil(words.length / 3)));
  return `${words.slice(0, count).join(' ')}…`;
}

function detailPrompt(language, cue, title) {
  const quotedCue = `“${cue}”`;
  const prompts = {
    english: `Which statement completes this moment from “${title}”? ${quotedCue}`,
    spanish: `¿Qué afirmación completa este momento del audio “${title}”? ${quotedCue}`,
    french: `Quelle affirmation complète ce moment de l’audio « ${title} » ? ${quotedCue}`,
    italian: `Quale affermazione completa questo momento dell’audio «${title}»? ${quotedCue}`,
    portuguese: `Qual afirmação completa este momento do áudio “${title}”? ${quotedCue}`,
    german: `Welche Aussage vervollständigt diesen Moment aus dem Audio „${title}“? ${quotedCue}`
  };
  return prompts[language] || prompts.english;
}

function optionPool(lines, answer, focusToken) {
  const candidates = uniqueTexts(
    lines.flatMap((line) => lexicalTokens(line)).filter((token) => token.length >= 3)
  ).filter((token) => token.toLocaleLowerCase() !== String(answer).toLocaleLowerCase());
  const ranked = candidates
    .filter((token) => {
      const normalized = token.toLocaleLowerCase();
      return !STOP_WORDS.has(normalized) && token.length >= Math.max(3, String(focusToken).length - 3);
    })
    .sort((a, b) => Math.abs(b.length - focusToken.length) - Math.abs(a.length - focusToken.length));
  const pool = uniqueTexts([
    ...ranked,
    ...candidates.filter((token) => !STOP_WORDS.has(token.toLocaleLowerCase()))
  ]);
  return pool.slice(0, 3);
}

function arrangeWithCorrectAt(distractors, answer, correctIndex) {
  const arranged = [];
  let distractorIndex = 0;
  for (let index = 0; index < 4; index += 1) {
    arranged.push(index === correctIndex ? answer : distractors[distractorIndex++]);
  }
  return arranged;
}

function selectEnglishComprehensionLines(lines) {
  const first = lines[0];
  const last = lines[lines.length - 1];
  const middle = lines[Math.round((lines.length - 1) / 3)];
  const contrast =
    lines.find((line) => /\b(but|however|although|whereas|therefore|instead|yet|rather than)\b/i.test(line)) ||
    lines[Math.round(((lines.length - 1) * 2) / 3)];
  const middleChoices = uniqueTexts([
    middle,
    contrast,
    ...selectSpread(lines, 4),
    ...lines
  ]).filter((line) => line !== first && line !== last);
  return [first, ...middleChoices.slice(0, 2), last];
}

function buildStatementOptions(line, lines, questionIndex) {
  const alternatives = uniqueTexts(lines.filter((candidate) => candidate !== line)).slice(0, 3);
  if (alternatives.length < 3) {
    throw new Error('No se pudieron crear opciones de comprensión auditiva.');
  }
  return arrangeWithCorrectAt(alternatives, cleanText(line), questionIndex);
}

function buildDetailComprehensionBank(row, lines) {
  const content = row.content_json || {};
  const language = row.target_language || 'english';
  const title = content.extra?.storyTitle || row.title || 'this audio';
  const selected = selectSpread(lines, 4);
  if (selected.length < 4) {
    throw new Error(`${row.slug}: la transcripción necesita cuatro detalles verificables.`);
  }
  return {
    id: `${row.slug}-listening-comprehension`,
    passingScore: 70,
    questions: selected.map((line, questionIndex) => {
      const optionTexts = buildStatementOptions(line, lines, questionIndex);
      return {
        id: `q${questionIndex + 1}`,
        type: 'mcq',
        prompt: detailPrompt(language, detailCue(line), title),
        options: optionTexts.map((text, optionIndex) => ({ id: `o${optionIndex + 1}`, text })),
        correctOptionId: `o${questionIndex + 1}`,
        evidence: line,
        explanation: language === 'spanish' ? `El audio dice: “${line}”` : `The audio states: “${line}”`
      };
    })
  };
}

function buildEnglishMeaningBank(row, lines) {
  const content = row.content_json || {};
  const title = content.extra?.storyTitle || row.title || 'this audio';
  const selected = selectEnglishComprehensionLines(lines);
  if (selected.length < 4) {
    throw new Error(`${row.slug}: la transcripción necesita cuatro ideas verificables.`);
  }
  return {
    id: `${row.slug}-listening-comprehension`,
    passingScore: 70,
    questions: selected.map((line, questionIndex) => {
      const optionTexts = buildStatementOptions(line, lines, questionIndex);
      return {
        id: `q${questionIndex + 1}`,
        type: 'mcq',
        prompt: detailPrompt('english', detailCue(line), title),
        options: optionTexts.map((text, optionIndex) => ({ id: `o${optionIndex + 1}`, text })),
        correctOptionId: `o${questionIndex + 1}`,
        evidence: line,
        explanation: `The audio states: “${line}”`
      };
    })
  };
}

function buildContextualListeningBank(row) {
  const language = row.target_language || 'english';
  const storyLines = collectStoryLines(row);
  if (storyLines.length < 4) {
    throw new Error(`${row.slug}: la transcripción necesita al menos cuatro detalles verificables.`);
  }

  // Every route Listening question must assess an audible, lesson-specific
  // idea. The focus named in the prompt comes from the selected sentence;
  // this avoids vague prompts about "the beginning" or a generic "idea" and
  // replaces one-word cloze drills with comprehension across all languages.
  if (row.target_language === 'english' && ['A2', 'B1', 'B2', 'C1', 'C2'].includes(row.level)) {
    return buildEnglishMeaningBank(row, storyLines);
  }
  return buildDetailComprehensionBank(row, storyLines);
}

function buildA1FrenchListeningBank(row) {
  return buildContextualListeningBank(row);
}

function shortA1Option(value) {
  return cleanText(value);
}

function applyContextualListeningBank(row) {
  const bank = buildContextualListeningBank(row);
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
