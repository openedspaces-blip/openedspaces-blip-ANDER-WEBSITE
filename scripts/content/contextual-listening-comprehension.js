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
  const preferred = candidates.filter(
    (token) => /^[A-ZÁÉÍÓÚÜÑÀÂÇÈÊËÎÏÔÙÛÜŸ]/u.test(token) || token.length >= 6
  );
  const pool = preferred.length ? preferred : candidates;
  return pool[(questionIndex * 2 + pool.length - 1) % pool.length] || tokens[tokens.length - 1];
}

function blankSentence(sentence, focusToken) {
  return cleanText(sentence).replace(String(focusToken), '_____');
}

function promptFor(language, index) {
  const prompts = {
    english: [
      'Complete this detail from the audio.',
      'Which word completes the sentence you hear?',
      'Choose the missing word from the recording.',
      'What is the exact missing word in this audio detail?'
    ],
    spanish: [
      'Completa este detalle del audio.',
      '¿Qué palabra completa la oración que escuchas?',
      'Elige la palabra que falta en la grabación.',
      '¿Cuál es la palabra exacta que falta en este detalle del audio?'
    ],
    french: [
      'Complète ce détail de l’audio.',
      'Quel mot complète la phrase entendue ?',
      'Choisis le mot manquant dans l’enregistrement.',
      'Quel est le mot exact qui manque dans ce détail audio ?'
    ],
    italian: [
      'Completa questo dettaglio dell’audio.',
      'Quale parola completa la frase che ascolti?',
      'Scegli la parola mancante nella registrazione.',
      'Qual è la parola esatta che manca in questo dettaglio audio?'
    ],
    portuguese: [
      'Complete este detalhe do áudio.',
      'Qual palavra completa a frase que você ouve?',
      'Escolha a palavra que falta na gravação.',
      'Qual é a palavra exata que falta neste detalhe do áudio?'
    ],
    german: [
      'Vervollständige dieses Detail aus dem Audio.',
      'Welches Wort ergänzt den gehörten Satz?',
      'Wähle das fehlende Wort aus der Aufnahme.',
      'Welches genaue Wort fehlt in diesem Audio-Detail?'
    ]
  };
  const languagePrompts = prompts[language] || prompts.english;
  return languagePrompts[index % languagePrompts.length];
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
  const answer = chooseFocusToken(line, questionIndex);
  const replacements = optionPool(lines, answer, answer).slice(0, 3);
  if (!answer || replacements.length < 3) {
    throw new Error('No se pudieron crear variantes de comprensión auditiva.');
  }
  const variants = replacements.map((replacement) =>
    cleanText(line).replace(String(answer), replacement)
  );
  return arrangeWithCorrectAt(variants, cleanText(line), questionIndex);
}

function englishMeaningPrompt(level, title, questionIndex) {
  const prompts = {
    A2: [
      `According to “${title}”, which detail is mentioned at the beginning?`,
      `According to “${title}”, which detail does the audio develop?`,
      `According to “${title}”, which situation does the speaker describe?`,
      `According to “${title}”, which idea appears at the end?`
    ],
    B1: [
      `According to “${title}”, which point introduces the topic?`,
      `According to “${title}”, which supporting detail is stated?`,
      `According to “${title}”, which contrast or consequence is made?`,
      `According to “${title}”, which conclusion closes the audio?`
    ],
    B2: [
      `According to “${title}”, which claim frames the discussion?`,
      `According to “${title}”, which evidence or example supports the discussion?`,
      `According to “${title}”, which qualification or consequence is presented?`,
      `According to “${title}”, which conclusion closes the discussion?`
    ],
    C1: [
      `According to “${title}”, which claim introduces the argument?`,
      `According to “${title}”, which evidence develops the argument?`,
      `According to “${title}”, which limitation, contrast or trade-off is identified?`,
      `According to “${title}”, which conclusion does the speaker defend?`
    ],
    C2: [
      `According to “${title}”, which claim establishes the central argument?`,
      `According to “${title}”, which evidence or mechanism develops that argument?`,
      `According to “${title}”, which qualification prevents an oversimplified conclusion?`,
      `According to “${title}”, which final position does the speaker support?`
    ]
  };
  return prompts[level][questionIndex];
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
        prompt: englishMeaningPrompt(row.level, title, questionIndex),
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

  // At A2 and above, assess the meaning of a complete claim instead of a
  // single recoverable word. The correct option is an exact, audible idea;
  // the alternatives are plausible variants of that same statement, which
  // keeps every question grounded without turning advanced Listening into a
  // vocabulary fill-in exercise.
  if (row.target_language === 'english' && ['A2', 'B1', 'B2', 'C1', 'C2'].includes(row.level)) {
    return buildEnglishMeaningBank(row, storyLines);
  }

  const selected = selectSpread(storyLines, 4);
  const questions = selected.map((line, questionIndex) => {
    const answer = chooseFocusToken(line, questionIndex);
    const distractors = optionPool(storyLines, answer, answer);
    if (!answer || distractors.length < 3) {
      throw new Error(`${row.slug}: no se pudieron crear opciones objetivas para la pregunta ${questionIndex + 1}.`);
    }
    const optionTexts = arrangeWithCorrectAt(distractors, answer, questionIndex);
    return {
      id: `q${questionIndex + 1}`,
      type: 'mcq',
      prompt: `${promptFor(language, questionIndex)}\n\n“${blankSentence(line, answer)}”`,
      options: optionTexts.map((text, optionIndex) => ({ id: `o${optionIndex + 1}`, text })),
      correctOptionId: `o${questionIndex + 1}`,
      explanation: `“${line}”`
    };
  });

  return {
    id: `${row.slug}-listening-comprehension`,
    passingScore: 70,
    questions
  };
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
