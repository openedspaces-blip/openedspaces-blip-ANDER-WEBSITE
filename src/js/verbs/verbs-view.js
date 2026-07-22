// src/js/verbs/verbs-view.js
// Renders the "Verbos" main tab (#verbs). Fase 2/3 pilot: "Verbos" (search/
// filter/sort + flashcard list) and "Conjugador" (verb selector + structured
// conjugation table/examples) are functional, for the 10 English pilot verbs
// in src/js/verbs/english-verbs-pilot.js. Practicar/Mi progreso stay as
// placeholders until later phases build on top of this same data/module.
//
// Conjugador never generates conjugations at runtime (no AI call) - every
// form/example it shows comes straight from that hand-authored data file.
//
// Deliberately reuses script.js's existing flashcard component and mastery
// storage instead of a parallel implementation:
//   - renderVocabCardHtml() renders each verb card exactly like a Vocabulary
//     card (same flip/audio/"Ya la sé"/"Practicar" buttons), which already
//     work here for free via script.js's own delegated document click
//     listeners (they match on CSS classes, not on being inside #vocabulary).
//   - getStoredVocabMastery()/setStoredVocabMastery() (VOCAB_MASTERY_STORAGE_KEY)
//     is the same per-word mastery store Vocabulary uses - verb ids
//     ('verb-<language>-<infinitive>') never collide with lesson vocab ids,
//     so sharing the store is safe and avoids a parallel progress system.
//   - The "Verbos/Conjugador/Practicar/Mi progreso" sub-tabs reuse the exact
//     .skill-tabs/.skill-tab-button/.skill-panel markup and switching logic
//     already wired for the Tutor view - no new tab-switching JS needed.
//
// Favorites are new (Vocabulary has no such concept), so they get their own
// small localStorage store below - not a duplicate of anything existing.
(function () {
  const VERB_FAVORITES_KEY = 'andergo_verb_favorites_v1';

  function readFavoritesStore() {
    try {
      return JSON.parse(localStorage.getItem(VERB_FAVORITES_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function isVerbFavorite(id) {
    return Boolean(readFavoritesStore()[id]);
  }

  function toggleVerbFavorite(id) {
    const store = readFavoritesStore();
    store[id] = !store[id];
    try {
      localStorage.setItem(VERB_FAVORITES_KEY, JSON.stringify(store));
    } catch {
      // Storage unavailable (private browsing / quota) - favorite just
      // won't survive a reload; never block the UI on it.
    }
    return store[id];
  }

  function getVerbsForLanguage(language) {
    const data = window.ANDERGO_VERBS_PILOT || {};
    return data[language] || [];
  }

  function getVerbById(id, language = 'english') {
    return getVerbsForLanguage(language).find((raw) => raw.id === id) || null;
  }

  // Mirrors script.js's normalizeVocabularyItem for this standalone verb
  // dataset (no lesson/unit involved) - produces the exact shape
  // renderVocabCardHtml() expects, so that function never needs forking.
  function normalizeVerbItem(raw, { bridgeLanguage, targetLanguage }) {
    const LanguagePair = window.AndergoLanguagePair;
    const learningMode = LanguagePair
      ? LanguagePair.getLearningMode(bridgeLanguage, targetLanguage)
      : bridgeLanguage === targetLanguage
        ? 'direct'
        : 'bilingual';
    const isDirect = learningMode === 'direct';
    const translation = isDirect
      ? ''
      : LanguagePair
        ? LanguagePair.getSupportText(raw.translation, bridgeLanguage)
        : raw.translation?.spanish || '';

    return {
      id: raw.id,
      targetWord: raw.infinitive,
      translation,
      example: raw.example || '',
      contexts: raw.example ? [{ targetText: raw.example, supportText: '' }] : [],
      phonetic: raw.phonetic || '',
      audioText: raw.infinitive,
      category: raw.isIrregular ? 'irregular verb' : 'regular verb',
      masteryStatus: (typeof getStoredVocabMastery === 'function' ? getStoredVocabMastery(raw.id) : null) || 'new',
      difficulty: raw.cefr || '',
      language: targetLanguage,
      bridgeLanguage,
      targetLanguage,
      pronunciationLocale:
        typeof getPronunciationLocale === 'function' ? getPronunciationLocale(targetLanguage) : 'en-US',
      pronunciationRate:
        typeof getDefaultPronunciationRate === 'function'
          ? getDefaultPronunciationRate(targetLanguage, raw.cefr)
          : 1,
      learningMode,
      definition: isDirect ? raw.simpleDefinition || '' : '',
      simpleDefinition: raw.simpleDefinition || '',
      synonyms: [],
      opposites: [],
      usageNote: '',
      image: '',
      imageAlt: '',
      frequencyRank: raw.frequencyRank || 0,
      isFavorite: isVerbFavorite(raw.id)
    };
  }

  function verbCardWrapHtml(item, renderOpts) {
    const cardHtml =
      typeof renderVocabCardHtml === 'function' ? renderVocabCardHtml(item, renderOpts) : '';
    const favLabel = item.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito';
    return `
      <div class="verb-card-wrap">
        ${cardHtml}
        <div class="verb-card-extra-actions no-print">
          <button type="button" class="secondary-btn verb-favorite-btn${item.isFavorite ? ' is-active' : ''}" data-verb-id="${escapeHtml(item.id)}" aria-pressed="${item.isFavorite}" aria-label="${favLabel}" title="${favLabel}">
            ${item.isFavorite ? '★ Favorito' : '☆ Favorito'}
          </button>
          <button type="button" class="secondary-btn verb-conjugate-btn" data-verb-id="${escapeHtml(item.id)}" data-verb-word="${escapeHtml(item.targetWord)}">
            📖 Ver conjugación
          </button>
        </div>
      </div>`;
  }

  function applyVerbsFilters(items, { search, filter }) {
    const term = (search || '').trim().toLowerCase();
    return items.filter((item) => {
      if (term) {
        const haystack = `${item.targetWord} ${item.translation}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filter === 'favorite') return item.isFavorite;
      if (filter && filter !== 'all') return item.masteryStatus === filter;
      return true;
    });
  }

  function sortVerbs(items, sortMode) {
    const sorted = items.slice();
    if (sortMode === 'alphabetical') {
      sorted.sort((a, b) => a.targetWord.localeCompare(b.targetWord));
    } else {
      sorted.sort((a, b) => (a.frequencyRank || 0) - (b.frequencyRank || 0));
    }
    return sorted;
  }

  // Re-renders just the card deck (search/filter/sort controls themselves
  // are static markup in index.html and never re-rendered) - keeps typing
  // in the search box cheap instead of rebuilding the whole #verbs section.
  function renderVerbsDeck() {
    const deck = document.getElementById('verbsCardDeck');
    if (!deck) return;

    const bridgeLanguage =
      (typeof learningPathState !== 'undefined' && learningPathState.bridgeLanguage) || 'spanish';
    const targetLanguage = 'english'; // pilot: English only (see index.html note)
    const rawVerbs = getVerbsForLanguage(targetLanguage);
    const items = rawVerbs.map((raw) => normalizeVerbItem(raw, { bridgeLanguage, targetLanguage }));

    const searchInput = document.getElementById('verbsSearchInput');
    const filterSelect = document.getElementById('verbsFilterSelect');
    const sortBtn = document.getElementById('verbsSortToggleBtn');
    const filtered = applyVerbsFilters(items, {
      search: searchInput?.value || '',
      filter: filterSelect?.value || 'all'
    });
    const sorted = sortVerbs(filtered, sortBtn?.dataset.sort || 'frequency');

    const canSpeak = typeof supportsSpeech === 'function' ? supportsSpeech() : false;
    if (!sorted.length) {
      deck.innerHTML = '<p class="skill-graph-empty">Ningún verbo coincide con tu búsqueda.</p>';
      return;
    }
    deck.innerHTML = sorted
      .map((item, index) =>
        verbCardWrapHtml({ ...item, _displayIndex: index }, { canSpeak, isFrench: false })
      )
      .join('');
  }

  const CONJUGATION_FIELDS = [
    ['base', 'Infinitivo'],
    ['presentSimple', 'Presente simple'],
    ['thirdPersonSingular', 'Tercera persona (he/she/it)'],
    ['pastSimple', 'Pasado simple'],
    ['pastParticiple', 'Participio pasado'],
    ['presentParticiple', 'Gerundio (-ing)']
  ];

  function conjugatorAudioBtnHtml(text, { locale, rate }) {
    if (typeof supportsSpeech !== 'function' || !supportsSpeech()) return '';
    return `<button type="button" class="vocab-example-audio-btn" data-speak-text="${escapeHtml(text)}" data-speak-locale="${escapeHtml(locale)}" data-speak-rate="${rate}" aria-label="Escuchar pronunciación" title="Escuchar pronunciación">🔊</button>`;
  }

  // Renders the full conjugation card for one verb - table of principal
  // forms + affirmative/negative/interrogative examples, straight from the
  // hand-authored data (raw.forms/raw.conjugationExamples), never generated
  // on the fly.
  function renderVerbConjugatorHtml(raw, { bridgeLanguage, targetLanguage }) {
    const item = normalizeVerbItem(raw, { bridgeLanguage, targetLanguage });
    const audioOpts = { locale: item.pronunciationLocale, rate: item.pronunciationRate };
    const supportLine = item.learningMode === 'direct' ? item.simpleDefinition : item.translation;

    const fieldsHtml = CONJUGATION_FIELDS.map(
      ([key, label]) => `
        <div class="verb-conjugation-cell">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(raw.forms?.[key] || '—')}</strong>
        </div>`
    ).join('');

    const examples = raw.conjugationExamples || {};
    const exampleRow = (label, text) =>
      text
        ? `
        <div class="verb-conjugation-example">
          <span class="verb-conjugation-example-label">${escapeHtml(label)}</span>
          <p>${escapeHtml(text)} ${conjugatorAudioBtnHtml(text, audioOpts)}</p>
        </div>`
        : '';

    return `
      <div class="verb-conjugation-card">
        <div class="verb-conjugation-head">
          <div>
            <h3>${escapeHtml(item.targetWord)} ${item.phonetic ? `<span class="vocab-card-phonetic">${escapeHtml(item.phonetic)}</span>` : ''}</h3>
            <span class="vocab-card-tag">${escapeHtml(item.category)}</span>
          </div>
          ${conjugatorAudioBtnHtml(item.audioText, audioOpts)}
        </div>
        ${supportLine ? `<p class="verb-conjugation-support">${escapeHtml(supportLine)}</p>` : ''}
        <div class="verb-conjugation-grid">${fieldsHtml}</div>
        <div class="verb-conjugation-examples">
          ${exampleRow('Afirmativa', examples.affirmative)}
          ${exampleRow('Negativa', examples.negative)}
          ${exampleRow('Interrogativa', examples.interrogative)}
        </div>
      </div>`;
  }

  // Builds the <option> list once per #verbs visit (idempotent - only
  // (re)populates when empty, so the user's current selection survives a
  // sub-tab switch) and keeps the select in sync with whichever verb is
  // currently shown.
  function ensureConjugatorSelectOptions(verbs) {
    const select = document.getElementById('verbsConjugatorSelect');
    if (!select || select.options.length) return select;
    select.innerHTML = verbs
      .slice()
      .sort((a, b) => (a.frequencyRank || 0) - (b.frequencyRank || 0))
      .map((raw) => `<option value="${escapeHtml(raw.id)}">${escapeHtml(raw.infinitive)}</option>`)
      .join('');
    return select;
  }

  function renderVerbsConjugator(verbId) {
    const content = document.getElementById('verbsConjugatorContent');
    if (!content) return;

    const targetLanguage = 'english'; // pilot: English only (see index.html note)
    const verbs = getVerbsForLanguage(targetLanguage);
    if (!verbs.length) {
      content.innerHTML = '<p class="skill-graph-empty">No hay verbos disponibles todavía.</p>';
      return;
    }

    const select = ensureConjugatorSelectOptions(verbs);
    const resolvedId = verbId || select?.value || verbs[0].id;
    const raw = getVerbById(resolvedId, targetLanguage) || verbs[0];
    if (select && select.value !== raw.id) select.value = raw.id;

    const bridgeLanguage =
      (typeof learningPathState !== 'undefined' && learningPathState.bridgeLanguage) || 'spanish';
    content.innerHTML = renderVerbConjugatorHtml(raw, { bridgeLanguage, targetLanguage });
  }

  // ---------------------------------------------------------------------
  // Practicar (Fase 4 pilot). Reuses script.js's Grammar-test question
  // engine as pure helper functions (renderGrammarTestQuestionBodyHtml/
  // collectGrammarTestAnswer/isGrammarTestQuestionAnswered/gradeBandForScore
  // - none of them ever touch the network themselves, see script.js's own
  // comment on this above the Listening Comprehension section that already
  // reuses them the same way) and the exact .grammar-test-* markup/CSS for
  // visual consistency, including its already-generic, lesson-agnostic
  // .grammar-test-option click handler (documemt-delegated in script.js -
  // just toggles .is-selected, no lesson lookup - works here unmodified).
  //
  // What's different from Grammar's own test: Grammar's test is graded by
  // the server against a real course_lessons answer key (see
  // lib/courseLessonsService.js#gradeGrammarTest) because it's tied to a
  // real lesson row. Verbos has no lesson/course row to grade against (and
  // per the Fase 1 plan, this pilot must not touch Supabase/tables), so
  // every question here carries its own correct answer and is graded
  // entirely client-side - reasonable for a low-stakes vocabulary/grammar
  // drill, unlike a scored course test.
  const VERB_PRACTICE_STATS_KEY = 'andergo_verb_practice_stats_v1';

  function readPracticeStatsStore() {
    try {
      return JSON.parse(localStorage.getItem(VERB_PRACTICE_STATS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function recordVerbAttempt(verbId, isCorrect) {
    const store = readPracticeStatsStore();
    const stats = store[verbId] || {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      lastPracticedAt: null,
      // Consecutive-correct streak for this verb (spec: "racha") - resets to
      // 0 on any incorrect answer, tracked alongside bestStreak (Mi
      // progreso's headline number) the same way attempts/correct/incorrect
      // already are, in the same store - not a parallel system.
      streak: 0,
      bestStreak: 0
    };
    stats.attempts += 1;
    if (isCorrect) {
      stats.correct += 1;
      stats.streak = (stats.streak || 0) + 1;
      stats.bestStreak = Math.max(stats.bestStreak || 0, stats.streak);
    } else {
      stats.incorrect += 1;
      stats.streak = 0;
    }
    stats.lastPracticedAt = new Date().toISOString();
    store[verbId] = stats;
    try {
      localStorage.setItem(VERB_PRACTICE_STATS_KEY, JSON.stringify(store));
    } catch {
      // Storage unavailable - this attempt just won't count toward Mi
      // progreso later; never blocks the practice session itself.
    }
  }

  function shuffleArray(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getVerbsPool(poolMode, targetLanguage) {
    const raw = getVerbsForLanguage(targetLanguage);
    const byFrequency = raw.slice().sort((a, b) => (a.frequencyRank || 0) - (b.frequencyRank || 0));
    if (poolMode === 'new') return byFrequency.filter((v) => (getStoredVocabMastery(v.id) || 'new') === 'new');
    if (poolMode === 'practicing') return byFrequency.filter((v) => getStoredVocabMastery(v.id) === 'practicing');
    if (poolMode === 'favorite') return byFrequency.filter((v) => isVerbFavorite(v.id));
    if (poolMode === 'random') return shuffleArray(raw);
    return byFrequency; // 'all'
  }

  function buildMcqQuestion(id, kind, verb, prompt, correctText, distractorTexts) {
    const uniqueDistractors = Array.from(new Set(distractorTexts.filter((t) => t && t !== correctText)));
    const options = shuffleArray([correctText, ...uniqueDistractors.slice(0, 3)]).map((text, index) => ({
      id: `${id}-opt${index}`,
      text
    }));
    const correctOptionId = options.find((opt) => opt.text === correctText)?.id;
    return { id, type: 'mcq', prompt, options, correctOptionId, verbId: verb.id, kind };
  }

  function generateMeaningQuestion(verb, allVerbs, ctx) {
    const item = normalizeVerbItem(verb, ctx);
    const correctText = item.learningMode === 'direct' ? item.simpleDefinition : item.translation;
    const distractorTexts = shuffleArray(allVerbs.filter((v) => v.id !== verb.id)).map((v) => {
      const other = normalizeVerbItem(v, ctx);
      return other.learningMode === 'direct' ? other.simpleDefinition : other.translation;
    });
    const prompt =
      item.learningMode === 'direct'
        ? `¿Qué definición corresponde a "${verb.infinitive}"?`
        : `¿Qué significa "${verb.infinitive}"?`;
    return buildMcqQuestion(`meaning-${verb.id}`, 'meaning', verb, prompt, correctText, distractorTexts);
  }

  function generatePastFormQuestion(verb, allVerbs) {
    const correctText = verb.forms.pastSimple;
    const distractorTexts = shuffleArray(allVerbs.filter((v) => v.id !== verb.id)).map((v) => v.forms.pastSimple);
    const prompt = `¿Cuál es el pasado simple de "${verb.infinitive}"?`;
    return buildMcqQuestion(`past-${verb.id}`, 'past', verb, prompt, correctText, distractorTexts);
  }

  function generateParticipleQuestion(verb, allVerbs) {
    const correctText = `${verb.forms.pastSimple} / ${verb.forms.pastParticiple}`;
    const distractorTexts = shuffleArray(allVerbs.filter((v) => v.id !== verb.id)).map(
      (v) => `${v.forms.pastSimple} / ${v.forms.pastParticiple}`
    );
    const prompt = `¿Cuáles son el pasado simple y el participio pasado de "${verb.infinitive}"?`;
    return buildMcqQuestion(`participle-${verb.id}`, 'participle', verb, prompt, correctText, distractorTexts);
  }

  function generateWordOrderQuestion(verb) {
    const sentence = verb.conjugationExamples?.affirmative || verb.example || verb.infinitive;
    const words = sentence.replace(/[.?!]+$/, '').split(' ');
    const items = words.map((word, index) => ({ id: `w${index}`, text: word }));
    return {
      id: `order-${verb.id}`,
      type: 'ordering',
      prompt: `Ordena las palabras para formar la oración de "${verb.infinitive}".`,
      items: shuffleArray(items),
      correctOrder: items.map((item) => item.id),
      originalSentence: sentence,
      verbId: verb.id,
      kind: 'order'
    };
  }

  function generateDictationQuestion(verb) {
    return {
      id: `dictation-${verb.id}`,
      type: 'fill_blank',
      prompt: 'Escucha y escribe el verbo (infinitivo) que oyes.',
      correctAnswer: verb.infinitive,
      audioText: verb.infinitive,
      verbId: verb.id,
      kind: 'dictation'
    };
  }

  const PRACTICE_QUESTION_KINDS = ['meaning', 'past', 'participle', 'order', 'dictation'];

  function buildPracticeQuestions(pool, allVerbs, ctx) {
    return pool.map((verb) => {
      const kind = PRACTICE_QUESTION_KINDS[Math.floor(Math.random() * PRACTICE_QUESTION_KINDS.length)];
      if (kind === 'meaning') return generateMeaningQuestion(verb, allVerbs, ctx);
      if (kind === 'past') return generatePastFormQuestion(verb, allVerbs);
      if (kind === 'participle') return generateParticipleQuestion(verb, allVerbs);
      if (kind === 'order') return generateWordOrderQuestion(verb);
      return generateDictationQuestion(verb);
    });
  }

  let practiceRuntime = null;

  function showVerbsPracticeSetup() {
    practiceRuntime = null;
    const setup = document.getElementById('verbsPracticeSetup');
    const content = document.getElementById('verbsPracticeContent');
    if (setup) setup.hidden = false;
    if (content) content.innerHTML = '';
  }

  function startVerbsPractice(poolMode) {
    const targetLanguage = 'english'; // pilot: English only (see index.html note)
    const allVerbs = getVerbsForLanguage(targetLanguage);
    const pool = getVerbsPool(poolMode, targetLanguage);
    const message = document.getElementById('verbsPracticeSetupMessage');
    if (!pool.length) {
      if (message) {
        message.hidden = false;
        message.textContent = 'No tienes verbos en esta categoría todavía. Elige otra opción.';
      }
      return;
    }
    if (message) message.hidden = true;

    const bridgeLanguage =
      (typeof learningPathState !== 'undefined' && learningPathState.bridgeLanguage) || 'spanish';
    const questions = buildPracticeQuestions(pool, allVerbs, { bridgeLanguage, targetLanguage });
    practiceRuntime = { questions, currentIndex: 0, answers: {}, checked: {}, results: [], dictationPlayed: {} };

    const setup = document.getElementById('verbsPracticeSetup');
    if (setup) setup.hidden = true;
    renderVerbsPracticeQuestion();
  }

  function renderVerbsPracticeQuestion() {
    const content = document.getElementById('verbsPracticeContent');
    if (!content || !practiceRuntime) return;
    const { questions, currentIndex } = practiceRuntime;
    const total = questions.length;
    const question = questions[currentIndex];
    const pct = Math.round(((currentIndex + 1) / total) * 100);
    const checkedResult = practiceRuntime.checked[question.id];

    const audioBtnHtml =
      question.kind === 'dictation'
        ? `<button type="button" class="secondary-btn verb-practice-audio-btn" data-speak-text="${escapeHtml(question.audioText)}" data-speak-locale="en-US" data-speak-rate="0.86">🔊 Escuchar de nuevo</button>`
        : '';

    let feedbackHtml = '';
    if (checkedResult) {
      feedbackHtml = checkedResult.isCorrect
        ? '<p class="verb-practice-feedback is-correct">✅ ¡Correcto!</p>'
        : `<p class="verb-practice-feedback is-incorrect">❌ La respuesta correcta era: "${escapeHtml(
            question.type === 'mcq'
              ? question.options.find((opt) => opt.id === question.correctOptionId)?.text || ''
              : question.type === 'fill_blank'
                ? question.correctAnswer
                : question.originalSentence
          )}"</p>`;
    }

    content.innerHTML = `
      <div class="grammar-test-card card-enter">
        <div class="grammar-test-progress-row">
          <span class="grammar-test-counter">Pregunta ${currentIndex + 1} de ${total}</span>
          <div class="grammar-test-progress-bar"><div class="progress-fill-animated" style="width:${pct}%"></div></div>
        </div>
        <p class="grammar-test-question-prompt">${escapeHtml(question.prompt)}</p>
        ${audioBtnHtml}
        ${renderGrammarTestQuestionBodyHtml(question, practiceRuntime)}
        ${feedbackHtml}
        <div class="grammar-test-nav-row">
          <button type="button" class="secondary-btn" id="verbsPracticeQuitBtn">Salir de la práctica</button>
          ${
            checkedResult
              ? `<button type="button" class="primary-btn" id="verbsPracticeNextBtn">${currentIndex === total - 1 ? 'Ver resultados' : 'Siguiente'}</button>`
              : `<button type="button" class="primary-btn" id="verbsPracticeCheckBtn">Verificar</button>`
          }
        </div>
      </div>
    `;

    if (checkedResult) {
      if (question.type === 'mcq') {
        content.querySelectorAll('.grammar-test-option').forEach((btn) => {
          btn.disabled = true;
          if (btn.dataset.optionId === question.correctOptionId) btn.classList.add('is-correct');
          else if (btn.classList.contains('is-selected')) btn.classList.add('is-incorrect');
        });
      } else if (question.type === 'fill_blank') {
        const input = content.querySelector('.grammar-test-fill-input');
        if (input) input.disabled = true;
      } else if (question.type === 'ordering') {
        content.querySelectorAll('.grammar-test-order-select').forEach((select) => {
          select.disabled = true;
        });
      }
    } else if (
      question.kind === 'dictation' &&
      typeof speakText === 'function' &&
      !practiceRuntime.dictationPlayed[question.id]
    ) {
      // Auto-play once when a dictation question first appears (never after
      // checking, so re-rendering the checked state doesn't give the answer
      // away by replaying it).
      practiceRuntime.dictationPlayed[question.id] = true;
      speakText(question.audioText, { locale: 'en-US', rate: 0.86 });
    }
  }

  function checkVerbsPracticeAnswer() {
    const content = document.getElementById('verbsPracticeContent');
    if (!content || !practiceRuntime) return;
    const question = practiceRuntime.questions[practiceRuntime.currentIndex];

    collectGrammarTestAnswer(content, practiceRuntime, practiceRuntime);
    const answer = practiceRuntime.answers[question.id];
    if (answer === undefined) {
      showHomeToast?.('Responde antes de verificar.');
      return;
    }

    let isCorrect = false;
    if (question.type === 'mcq') isCorrect = answer === question.correctOptionId;
    else if (question.type === 'fill_blank')
      isCorrect = String(answer).trim().toLowerCase() === question.correctAnswer.toLowerCase();
    else if (question.type === 'ordering')
      isCorrect =
        Array.isArray(answer) &&
        answer.length === question.correctOrder.length &&
        answer.every((id, index) => id === question.correctOrder[index]);

    practiceRuntime.checked[question.id] = { isCorrect };
    practiceRuntime.results.push({ questionId: question.id, verbId: question.verbId, correct: isCorrect });
    recordVerbAttempt(question.verbId, isCorrect);
    renderVerbsPracticeQuestion();
  }

  function renderVerbsPracticeResults() {
    const content = document.getElementById('verbsPracticeContent');
    if (!content || !practiceRuntime) return;
    const { results, questions } = practiceRuntime;
    const total = results.length;
    const correctCount = results.filter((r) => r.correct).length;
    const score = total ? Math.round((correctCount / total) * 100) : 0;
    const band = typeof gradeBandForScore === 'function' ? gradeBandForScore(score) : { emoji: '🙂', label: '' };

    const breakdownHtml = questions
      .map((question, index) => {
        const result = results.find((r) => r.questionId === question.id);
        const correct = Boolean(result?.correct);
        return `
        <li class="grammar-test-breakdown-item${correct ? ' is-correct' : ' is-incorrect'}">
          <span class="grammar-test-breakdown-icon" aria-hidden="true">${correct ? '✅' : '❌'}</span>
          <p class="grammar-test-breakdown-prompt">${index + 1}. ${escapeHtml(question.prompt)}</p>
        </li>`;
      })
      .join('');

    content.innerHTML = `
      <div class="grammar-test-card card-enter">
        <div class="grammar-test-score-band">
          <span class="grammar-test-score-emoji" aria-hidden="true">${band.emoji}</span>
          <strong class="grammar-test-score-number">${score}/100</strong>
          <span class="grammar-test-score-label">${band.label}</span>
        </div>
        <p class="grammar-test-score-detail">Respuestas correctas: ${correctCount} de ${total}</p>
        <ul class="grammar-test-breakdown-list">${breakdownHtml}</ul>
        <button type="button" class="primary-btn" id="verbsPracticeRetryBtn">Practicar de nuevo</button>
      </div>
    `;
  }

  // ---------------------------------------------------------------------
  // Mi progreso. Reuses the exact two stores everything else on this page
  // already reads/writes - getStoredVocabMastery (shared with Vocabulary,
  // spec: "no crear un sistema paralelo si el progreso actual puede
  // reutilizarse") for the Nuevo/Aprendiendo/Necesito practicar/Dominado
  // status, and this file's own VERB_PRACTICE_STATS_KEY (already recording
  // attempts/correct/incorrect/lastPracticedAt/streak via recordVerbAttempt)
  // for the rest. No new storage, no network, nothing Supabase-facing.
  // ---------------------------------------------------------------------

  const MASTERY_LABELS = {
    new: 'Nuevo',
    learning: 'Aprendiendo',
    practicing: 'Necesito practicar',
    mastered: 'Dominado'
  };

  function formatLastPracticed(iso) {
    if (!iso) return 'Todavía no practicado';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Todavía no practicado';
    return date.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function computeVerbsProgressSummary(targetLanguage) {
    const verbs = getVerbsForLanguage(targetLanguage);
    const statsStore = readPracticeStatsStore();
    const rows = verbs
      .map((verb) => {
        const stats = statsStore[verb.id] || {
          attempts: 0,
          correct: 0,
          incorrect: 0,
          lastPracticedAt: null,
          streak: 0,
          bestStreak: 0
        };
        const mastery = getStoredVocabMastery(verb.id) || 'new';
        return { verb, mastery, ...stats };
      })
      .sort((a, b) => (b.attempts || 0) - (a.attempts || 0) || (a.verb.frequencyRank || 0) - (b.verb.frequencyRank || 0));

    const counts = { new: 0, learning: 0, practicing: 0, mastered: 0 };
    rows.forEach((row) => {
      counts[row.mastery] = (counts[row.mastery] || 0) + 1;
    });
    const totalVerbs = rows.length;
    const masteredPct = totalVerbs ? Math.round((counts.mastered / totalVerbs) * 100) : 0;
    const totalAttempts = rows.reduce((sum, row) => sum + (row.attempts || 0), 0);
    const totalCorrect = rows.reduce((sum, row) => sum + (row.correct || 0), 0);
    const totalIncorrect = rows.reduce((sum, row) => sum + (row.incorrect || 0), 0);
    // "Racha" headline number: the longest streak currently active among all
    // 10 verbs (an active streak, not a lifetime best - one wrong answer on
    // that verb resets it, same as recordVerbAttempt does per-verb).
    const currentStreak = rows.reduce((max, row) => Math.max(max, row.streak || 0), 0);

    return { rows, counts, totalVerbs, masteredPct, totalAttempts, totalCorrect, totalIncorrect, currentStreak };
  }

  function renderVerbsProgress() {
    const content = document.getElementById('verbsProgressContent');
    if (!content) return;

    const targetLanguage = 'english'; // pilot: English only (see index.html note)
    const summary = computeVerbsProgressSummary(targetLanguage);

    if (!summary.totalVerbs) {
      content.innerHTML = '<p class="skill-graph-empty">No hay verbos disponibles todavía.</p>';
      return;
    }

    const statTileHtml = (label, value) => `
      <div class="verb-progress-tile">
        <strong>${escapeHtml(String(value))}</strong>
        <span>${escapeHtml(label)}</span>
      </div>`;

    const summaryHtml = `
      <div class="verb-progress-summary">
        ${statTileHtml('Nuevo', summary.counts.new || 0)}
        ${statTileHtml('Aprendiendo', summary.counts.learning || 0)}
        ${statTileHtml('Necesito practicar', summary.counts.practicing || 0)}
        ${statTileHtml('Dominado', summary.counts.mastered || 0)}
        ${statTileHtml('% de dominio', `${summary.masteredPct}%`)}
        ${statTileHtml('Racha actual', summary.currentStreak)}
      </div>
      <p class="verb-progress-totals">
        Intentos totales: ${summary.totalAttempts} · Aciertos: ${summary.totalCorrect} · Errores: ${summary.totalIncorrect}
      </p>`;

    const rowsHtml = summary.rows
      .map(
        (row) => `
        <li class="verb-progress-row">
          <span class="verb-progress-word">${escapeHtml(row.verb.infinitive)}</span>
          <span class="vocab-card-tag verb-progress-mastery-badge verb-progress-mastery-badge--${escapeHtml(row.mastery)}">${escapeHtml(MASTERY_LABELS[row.mastery] || row.mastery)}</span>
          <span class="verb-progress-stat">Intentos: ${row.attempts || 0}</span>
          <span class="verb-progress-stat">Aciertos: ${row.correct || 0}</span>
          <span class="verb-progress-stat">Errores: ${row.incorrect || 0}</span>
          <span class="verb-progress-stat">Racha: ${row.streak || 0}</span>
          <span class="verb-progress-stat verb-progress-last">${escapeHtml(formatLastPracticed(row.lastPracticedAt))}</span>
        </li>`
      )
      .join('');

    content.innerHTML = `
      ${summaryHtml}
      <ul class="verb-progress-list">${rowsHtml}</ul>
    `;
  }

  // Entry point - called from script.js's showView() when the resolved view
  // is 'verbs'. Normalizes the hash to carry the language segment
  // (#verbs/english), same spirit as updateLearnHash() but scoped locally
  // since the pilot has only one target language and no unit/lesson state.
  window.renderVerbsView = function renderVerbsView() {
    if (window.location.hash === '#verbs') {
      history.replaceState(null, '', '#verbs/english');
    }
    renderVerbsDeck();
    renderVerbsConjugator();
    renderVerbsProgress();
  };

  document.addEventListener('input', (event) => {
    if (event.target.id === 'verbsSearchInput') renderVerbsDeck();
  });

  document.addEventListener('change', (event) => {
    if (event.target.id === 'verbsFilterSelect') renderVerbsDeck();
    if (event.target.id === 'verbsConjugatorSelect') renderVerbsConjugator(event.target.value);
  });

  document.addEventListener('click', (event) => {
    const sortBtn = event.target.closest('#verbsSortToggleBtn');
    if (sortBtn) {
      const next = sortBtn.dataset.sort === 'frequency' ? 'alphabetical' : 'frequency';
      sortBtn.dataset.sort = next;
      sortBtn.textContent = next === 'frequency' ? '🔢 Ordenar por frecuencia' : '🔤 Ordenar A-Z';
      renderVerbsDeck();
      return;
    }

    const favBtn = event.target.closest('.verb-favorite-btn');
    if (favBtn) {
      event.stopPropagation();
      const nextState = toggleVerbFavorite(favBtn.dataset.verbId);
      favBtn.classList.toggle('is-active', nextState);
      favBtn.setAttribute('aria-pressed', String(nextState));
      favBtn.textContent = nextState ? '★ Favorito' : '☆ Favorito';
      return;
    }

    const conjugateBtn = event.target.closest('.verb-conjugate-btn');
    if (conjugateBtn) {
      event.stopPropagation();
      const tabsRoot = document.getElementById('verbsTabs');
      const conjugatorTabBtn = tabsRoot?.querySelector('.skill-tab-button[data-skill="conjugator"]');
      const conjugatorPanel = tabsRoot?.querySelector('.skill-panel[data-skill="conjugator"]');
      tabsRoot?.querySelectorAll('.skill-tab-button').forEach((btn) => {
        btn.classList.toggle('active', btn === conjugatorTabBtn);
      });
      tabsRoot?.querySelectorAll('.skill-panel').forEach((panel) => {
        panel.classList.toggle('active', panel === conjugatorPanel);
      });
      renderVerbsConjugator(conjugateBtn.dataset.verbId);
      // block: 'center' (not 'start') - matches the Tutor tab-switch handler
      // this reuses the markup pattern from; 'start' scrolls the target
      // flush under the sticky .navbar, which then overlaps it.
      conjugatorPanel?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Refreshes Mi progreso every time its tab is opened (not only on the
    // #verbs entry point) - the student may have just finished a Practicar
    // session and switched tabs without leaving/re-entering #verbs. The
    // generic .skill-tab-button visibility toggle (script.js) still handles
    // showing/hiding the panel itself; this only re-renders its content.
    if (event.target.closest('#verbsTabs .skill-tab-button[data-skill="progress"]')) {
      renderVerbsProgress();
      return;
    }

    if (event.target.closest('#verbsPracticeStartBtn')) {
      const poolSelect = document.getElementById('verbsPracticePoolSelect');
      startVerbsPractice(poolSelect?.value || 'all');
      return;
    }

    if (event.target.closest('#verbsPracticeCheckBtn')) {
      checkVerbsPracticeAnswer();
      return;
    }

    if (event.target.closest('#verbsPracticeNextBtn')) {
      practiceRuntime.currentIndex += 1;
      if (practiceRuntime.currentIndex >= practiceRuntime.questions.length) {
        renderVerbsPracticeResults();
      } else {
        renderVerbsPracticeQuestion();
      }
      return;
    }

    if (event.target.closest('#verbsPracticeRetryBtn') || event.target.closest('#verbsPracticeQuitBtn')) {
      showVerbsPracticeSetup();
      return;
    }

    const practiceAudioBtn = event.target.closest('.verb-practice-audio-btn');
    if (practiceAudioBtn) {
      event.stopPropagation();
      speakText(practiceAudioBtn.dataset.speakText, {
        locale: practiceAudioBtn.dataset.speakLocale,
        rate: Number(practiceAudioBtn.dataset.speakRate) || 1
      });
      return;
    }
  });
})();
