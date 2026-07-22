// src/js/verbs/verbs-view.js
// Renders the "Verbos" section (#verbs): "Verbos" (search/filter/sort +
// paginated flashcard list), "Conjugador" (verb selector + structured
// conjugation table/examples), "Practicar" (auto-generated drills) and "Mi
// progreso" (mastery/attempt stats), for the 100 English verbs in
// src/js/verbs/english-verbs-data.js (Fase 2). Responds to L2 the same way
// Vocabulary/Reading do: window.ANDERGO_VERBS_DATA[targetLanguage] - only
// 'english' is populated today (Fase 1/2 scope: English only). Français and
// Español are added the same way in later phases by adding
// window.ANDERGO_VERBS_DATA.french/spanish and nothing else in this file.
//
// Conjugador never generates conjugations at runtime (no AI call) - every
// form/example it shows comes straight from that hand-authored data file.
//
// Deliberately reuses script.js's existing flashcard component and mastery
// storage instead of a parallel implementation:
//   - renderVocabCardHtml() renders each verb card exactly like a Vocabulary
//     card (same flip/audio/"Ya la sé"/"Practicar" buttons, browser
//     speechSynthesis only - never ElevenLabs, never Premium-gated).
//   - getStoredVocabMastery()/setStoredVocabMastery() (VOCAB_MASTERY_STORAGE_KEY)
//     is the same per-word mastery store Vocabulary uses - verb ids
//     ('verb-english-<infinitive>') never collide with lesson vocab ids, so
//     sharing the store is safe and avoids a parallel progress system, per
//     the Fase 1 plan ("no crear persistencia falsa" / reuse what exists).
//   - The "Verbos/Conjugador/Practicar/Mi progreso" sub-tabs reuse the exact
//     .skill-tabs/.skill-tab-button/.skill-panel markup already wired for
//     the Tutor view (activateSkillTab/initSkillTabsAccessibility in
//     script.js now also give this ARIA roles + arrow-key navigation).
//
// Favorites and per-verb practice stats are new (Vocabulary has neither),
// so they get their own small localStorage stores below - documented as
// what they are: a placeholder until a real per-user Supabase table exists
// (spec: "no toques Supabase sin aprobación explícita" - none of this phase
// does; no migration, no new table, nothing server-side).
(function () {
  const VERB_FAVORITES_KEY = 'andergo_verb_favorites_v1';
  const VERB_PRACTICE_STATS_KEY = 'andergo_verb_practice_stats_v1';
  const PAGE_SIZE = 20;

  // ---------------------------------------------------------------------
  // Scoped auth guard. Only "practice" and "progress" (plus the persistent
  // per-card actions below - favorite/mastery) ever require a session.
  // "list" and "conjugator" must never call any of this - visitors read/
  // search/filter/sort/listen/conjugate freely (spec: "no uses un guard
  // general para toda la vista Verbos").
  // ---------------------------------------------------------------------
  const VERB_AUTH_RETURN_KEY = 'andergo_verb_auth_return_v1';
  let pendingVerbAuthReturn = null;

  function isVerbsUserSignedIn() {
    return typeof authStatus !== 'undefined' && Boolean(authStatus.session?.access_token);
  }

  function verbsAccessRequiredHtml(message) {
    return `
      <div class="skill-graph-empty verbs-auth-required">
        <p aria-hidden="true" style="font-size:1.5rem;">🔒</p>
        <p>${escapeHtml(message)}</p>
        <div class="verb-practice-results-actions">
          <button type="button" class="primary-btn verbs-auth-login-btn">Iniciar sesión</button>
          <button type="button" class="secondary-btn verbs-auth-signup-btn">Crear cuenta</button>
          <button type="button" class="secondary-btn verbs-auth-back-btn">← Volver a Verbos</button>
        </div>
      </div>`;
  }

  function renderPracticeAccessRequired() {
    const setup = document.getElementById('verbsPracticeSetup');
    const content = document.getElementById('verbsPracticeContent');
    if (setup) setup.hidden = true;
    if (content) {
      content.innerHTML = verbsAccessRequiredHtml('Inicia sesión para practicar y guardar tu progreso.');
    }
  }

  function renderProgressAccessRequired() {
    const content = document.getElementById('verbsProgressContent');
    const resetRow = document.querySelector('.verb-progress-reset-row');
    if (resetRow) resetRow.hidden = true;
    if (content) {
      content.innerHTML = verbsAccessRequiredHtml('Inicia sesión para practicar y guardar tu progreso.');
    }
  }

  // Central gate for "practice"/"progress" - never duplicated per button.
  // Returns true (proceed) when signed in; otherwise remembers which
  // subtab was requested (module var + sessionStorage, so a same-tab
  // reload during the auth flow still restores it), moves the hash to
  // #verbs/english/<feature> without leaving the Verbos section, and
  // renders that subtab's access-required panel. Never touches Supabase.
  function requireAuthForVerbFeature(feature, { verbId } = {}) {
    if (isVerbsUserSignedIn()) return true;

    pendingVerbAuthReturn = { feature, verbId: verbId || null };
    try {
      sessionStorage.setItem(VERB_AUTH_RETURN_KEY, feature);
    } catch {
      // Storage unavailable - restoring after login just won't happen;
      // never blocks showing the access-required panel itself.
    }
    const newHash = `#verbs/english/${feature}`;
    if (window.location.hash !== newHash) history.replaceState(null, '', newHash);

    if (feature === 'practice') renderPracticeAccessRequired();
    else if (feature === 'progress') renderProgressAccessRequired();
    return false;
  }

  // Same idea as requireAuthForVerbFeature but for a persistent per-card
  // action (favorito/dominio) - never opens the whole subtab, just a
  // discreet inline prompt, and leaves the current verb/card untouched
  // (spec: "no bloquear el simple acceso a la tarjeta").
  function requireAuthForCardAction(message) {
    if (isVerbsUserSignedIn()) return true;
    if (typeof showHomeToast === 'function') showHomeToast(message);
    return false;
  }

  // Called from script.js's logout() - if the visitor happens to be sitting
  // on Practicar or Mi progreso when they sign out, swap that panel to the
  // access-required state immediately instead of leaving stale authenticated
  // content on screen until the next click.
  window.regateVerbsFeatureTabs = function regateVerbsFeatureTabs() {
    if (isVerbsUserSignedIn()) return;
    const activeTab = document.querySelector('#verbsTabs .skill-tab-button.active');
    const activeSkill = activeTab?.dataset.skill;
    if (activeSkill === 'practice') renderPracticeAccessRequired();
    else if (activeSkill === 'progress') renderProgressAccessRequired();
  };

  // Called from script.js's afterAuthSuccess() right after a successful
  // login/register/MFA - a no-op unless the student got here via one of the
  // guards above. Re-activates the subtab they actually asked for without
  // re-rendering the whole Verbos view (keeps search/filter/selected verb).
  window.restoreVerbsPendingRoute = function restoreVerbsPendingRoute() {
    let feature = pendingVerbAuthReturn?.feature || null;
    if (!feature) {
      try {
        feature = sessionStorage.getItem(VERB_AUTH_RETURN_KEY);
      } catch {
        feature = null;
      }
    }
    if (!feature || (feature !== 'practice' && feature !== 'progress')) return;

    pendingVerbAuthReturn = null;
    try {
      sessionStorage.removeItem(VERB_AUTH_RETURN_KEY);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }

    if (!window.location.hash.startsWith('#verbs')) return;
    history.replaceState(null, '', `#verbs/english/${feature}`);
    const tabBtn = document.querySelector(`#verbsTabs .skill-tab-button[data-skill="${feature}"]`);
    if (tabBtn && typeof activateSkillTab === 'function') activateSkillTab(tabBtn, { scroll: false });

    if (feature === 'practice') {
      const setup = document.getElementById('verbsPracticeSetup');
      if (setup) setup.hidden = false;
      showVerbsPracticeSetup();
    } else {
      const resetRow = document.querySelector('.verb-progress-reset-row');
      if (resetRow) resetRow.hidden = false;
      renderVerbsProgress();
    }
  };

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
    const data = window.ANDERGO_VERBS_DATA || {};
    return data[language] || [];
  }

  function getVerbById(id, language = 'english') {
    return getVerbsForLanguage(language).find((raw) => raw.id === id) || null;
  }

  // Accent/case/whitespace-insensitive comparison (spec: "la búsqueda no
  // debe depender de mayúsculas, tildes o espacios extra"). NFD + strip
  // combining marks is the standard accent-fold; collapsing runs of
  // whitespace to one space (then trimming) absorbs extra/leading/trailing
  // spaces without needing a second pass.
  function normalizeSearchText(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
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
      example: raw.examples?.affirmative || '',
      contexts: raw.examples?.affirmative ? [{ targetText: raw.examples.affirmative, supportText: '' }] : [],
      phonetic: raw.pronunciation || '',
      audioText: raw.audioText || raw.infinitive,
      category: raw.regular ? 'regular verb' : 'irregular verb',
      masteryStatus: (typeof getStoredVocabMastery === 'function' ? getStoredVocabMastery(raw.id) : null) || 'new',
      difficulty: raw.level || '',
      language: targetLanguage,
      bridgeLanguage,
      targetLanguage,
      pronunciationLocale:
        typeof getPronunciationLocale === 'function' ? getPronunciationLocale(targetLanguage) : 'en-US',
      pronunciationRate:
        typeof getDefaultPronunciationRate === 'function'
          ? getDefaultPronunciationRate(targetLanguage, raw.level)
          : 1,
      learningMode,
      definition: isDirect ? raw.directDefinition?.english || '' : '',
      simpleDefinition: raw.directDefinition?.english || '',
      synonyms: raw.synonyms || [],
      opposites: raw.antonyms || [],
      usageNote: raw.notes || '',
      image: '',
      imageAlt: '',
      frequencyRank: raw.rank || 0,
      isFavorite: isVerbFavorite(raw.id)
    };
  }

  // The always-visible summary line under the shared flashcard (spec: "no
  // sobrecargar la tarjeta" - one compact line, not a table). Full forms +
  // all three example sentences stay in the Conjugador, reached via "Ver
  // conjugación" right below this line - that IS the "expandir detalles"
  // the spec asks for, no separate expand/collapse widget needed here.
  function verbMetaLineHtml(raw) {
    const regularity = raw.regular ? 'Regular' : 'Irregular';
    const forms = raw.forms || {};
    const formsText = [forms.pastSimple, forms.pastParticiple].filter(Boolean).join(' · ');
    return `#${raw.rank} · ${escapeHtml(raw.level || '')} · ${regularity}${formsText ? ` · ${escapeHtml(formsText)}` : ''}`;
  }

  function verbCardWrapHtml(item, raw, renderOpts) {
    const cardHtml =
      typeof renderVocabCardHtml === 'function' ? renderVocabCardHtml(item, renderOpts) : '';
    const favLabel = item.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito';
    return `
      <div class="verb-card-wrap">
        ${cardHtml}
        <p class="verb-card-meta-line">${verbMetaLineHtml(raw)}</p>
        <div class="verb-card-extra-actions no-print">
          <button type="button" class="secondary-btn verb-favorite-btn${item.isFavorite ? ' is-active' : ''}" data-verb-id="${escapeHtml(item.id)}" aria-pressed="${item.isFavorite}" aria-label="${favLabel}" title="${favLabel}">
            ${item.isFavorite ? '★ Favorito' : '☆ Favorito'}
          </button>
          <button type="button" class="secondary-btn verb-conjugate-btn" data-verb-id="${escapeHtml(item.id)}" data-verb-word="${escapeHtml(item.targetWord)}">
            📖 Ver conjugación
          </button>
          <button type="button" class="secondary-btn verb-practice-one-btn" data-verb-id="${escapeHtml(item.id)}">
            🎯 Practicar
          </button>
        </div>
      </div>`;
  }

  // Every field the spec's search list names: infinitive, L1 translation,
  // every principal form, every example sentence, and the frequency rank
  // (typed as a plain number, e.g. "7"). One normalized haystack per verb -
  // built fresh per search rather than cached, since the L1 translation
  // (and therefore the haystack) changes whenever bridgeLanguage changes.
  function verbSearchHaystack(raw, item) {
    const forms = raw.forms || {};
    const examples = raw.examples || {};
    return normalizeSearchText(
      [
        raw.infinitive,
        item.translation,
        forms.thirdPersonSingular,
        forms.pastSimple,
        forms.pastParticiple,
        forms.presentParticiple,
        examples.affirmative,
        examples.negative,
        examples.interrogative,
        String(raw.rank || '')
      ]
        .filter(Boolean)
        .join(' ')
    );
  }

  const LEVEL_FILTERS = new Set(['A1', 'A2', 'B1']);

  function applyVerbsFilters(rows, { search, filter }) {
    const term = normalizeSearchText(search);
    return rows.filter(({ raw, item }) => {
      if (term && !verbSearchHaystack(raw, item).includes(term)) return false;
      if (!filter || filter === 'all') return true;
      if (filter === 'favorite') return item.isFavorite;
      if (filter === 'regular') return raw.regular === true;
      if (filter === 'irregular') return raw.regular === false;
      if (LEVEL_FILTERS.has(filter)) return raw.level === filter;
      // practicing / mastered (and any other mastery status) fall through
      // to a plain equality check against the shared mastery store.
      return item.masteryStatus === filter;
    });
  }

  function masteryRank(status) {
    // Higher = more mastered, used by the "Dominio"/"Menos dominados" sort
    // modes below - order matches MASTERY_LABELS' own progression.
    return { new: 0, learning: 1, practicing: 2, mastered: 3 }[status] ?? 0;
  }

  function sortVerbs(rows, sortMode) {
    const statsStore = readPracticeStatsStore();
    const sorted = rows.slice();
    const byWord = (a, b) => a.raw.infinitive.localeCompare(b.raw.infinitive);
    if (sortMode === 'alphaAsc') sorted.sort(byWord);
    else if (sortMode === 'alphaDesc') sorted.sort((a, b) => byWord(b, a));
    else if (sortMode === 'level') sorted.sort((a, b) => (a.raw.level || '').localeCompare(b.raw.level || '') || byWord(a, b));
    else if (sortMode === 'mastery') sorted.sort((a, b) => masteryRank(b.item.masteryStatus) - masteryRank(a.item.masteryStatus) || byWord(a, b));
    else if (sortMode === 'leastMastered') sorted.sort((a, b) => masteryRank(a.item.masteryStatus) - masteryRank(b.item.masteryStatus) || byWord(a, b));
    else if (sortMode === 'mostPracticed') {
      sorted.sort((a, b) => (statsStore[b.raw.id]?.attempts || 0) - (statsStore[a.raw.id]?.attempts || 0) || byWord(a, b));
    } else {
      sorted.sort((a, b) => (a.raw.rank || 0) - (b.raw.rank || 0)); // 'frequency' (default)
    }
    return sorted;
  }

  // Pagination state (spec §"Rendimiento": show 20-25 initially, "Cargar
  // más" for the rest, never re-render all 100 cards on every keystroke).
  // Reset to PAGE_SIZE whenever the query itself changes (search/filter/
  // sort) - a fresh query is a fresh list, showing 100 cards left over from
  // a previous "Cargar más" would defeat the point. Module-level (not per-
  // render-call) so clicking "Cargar más" survives the next render.
  let verbsVisibleCount = PAGE_SIZE;

  function resetVerbsPagination() {
    verbsVisibleCount = PAGE_SIZE;
  }

  // Renders one of 4 explicit states (spec §4: cargando/disponible/sin
  // resultados/error) - never leaves indefinite placeholder text like
  // "Preparando Verbos…" on screen. The data source here is a local script
  // global (no network), so "cargando" only appears for the instant before
  // this function's synchronous body runs; the real payoff of this wrapper
  // is turning an unexpected exception into the recoverable error card
  // (with Reintentar) instead of a silent stuck screen or an uncaught throw.
  function renderVerbsDeck() {
    const deck = document.getElementById('verbsCardDeck');
    const loadMoreRow = document.getElementById('verbsLoadMoreRow');
    if (!deck) return;

    try {
      const bridgeLanguage =
        (typeof learningPathState !== 'undefined' && learningPathState.bridgeLanguage) || 'spanish';
      const targetLanguage = 'english'; // Fase 1/2 scope: English only (see file header)
      const rawVerbs = getVerbsForLanguage(targetLanguage);

      if (!rawVerbs.length) {
        deck.innerHTML = `<p class="skill-graph-empty">${escapeHtml(LanguagePair.t('verbsEmpty', bridgeLanguage))}</p>`;
        if (loadMoreRow) loadMoreRow.hidden = true;
        return;
      }

      const rows = rawVerbs.map((raw) => ({ raw, item: normalizeVerbItem(raw, { bridgeLanguage, targetLanguage }) }));

      const searchInput = document.getElementById('verbsSearchInput');
      const filterSelect = document.getElementById('verbsFilterSelect');
      const sortSelect = document.getElementById('verbsSortSelect');
      const filtered = applyVerbsFilters(rows, {
        search: searchInput?.value || '',
        filter: filterSelect?.value || 'all'
      });
      const sorted = sortVerbs(filtered, sortSelect?.value || 'frequency');

      if (!sorted.length) {
        deck.innerHTML = `<p class="skill-graph-empty">${escapeHtml(LanguagePair.t('verbsEmpty', bridgeLanguage))}</p>`;
        if (loadMoreRow) loadMoreRow.hidden = true;
        return;
      }

      const canSpeak = typeof supportsSpeech === 'function' ? supportsSpeech() : false;
      const visible = sorted.slice(0, verbsVisibleCount);
      deck.innerHTML = visible
        .map(({ raw, item }, index) =>
          verbCardWrapHtml({ ...item, _displayIndex: index }, raw, { canSpeak, isFrench: false })
        )
        .join('');

      if (loadMoreRow) loadMoreRow.hidden = sorted.length <= visible.length;
    } catch (error) {
      console.warn('[verbs] renderVerbsDeck failed', error);
      deck.innerHTML = `
        <div class="skill-graph-empty verbs-error-card">
          <p>${escapeHtml(
            LanguagePair
              ? LanguagePair.t('verbsErrorRetry', (typeof learningPathState !== 'undefined' && learningPathState.bridgeLanguage) || 'spanish')
              : 'En este momento no pudimos cargar los verbos. Inténtalo nuevamente.'
          )}</p>
          <button type="button" class="secondary-btn" id="verbsRetryBtn">Reintentar</button>
        </div>`;
      if (loadMoreRow) loadMoreRow.hidden = true;
    }
  }

  const CONJUGATION_FIELDS = [
    ['thirdPersonSingular', 'Tercera persona (he/she/it)'],
    ['pastSimple', 'Pasado simple'],
    ['pastParticiple', 'Participio pasado'],
    ['presentParticiple', 'Gerundio (-ing)']
  ];

  function conjugatorAudioBtnHtml(text, { locale, rate }) {
    if (typeof supportsSpeech !== 'function' || !supportsSpeech()) return '';
    return `<button type="button" class="vocab-example-audio-btn" data-speak-text="${escapeHtml(text)}" data-speak-locale="${escapeHtml(locale)}" data-speak-rate="${rate}" aria-label="Escuchar pronunciación" title="Escuchar pronunciación">🔊</button>`;
  }

  // Fase 3: full tense conjugation, computed by src/js/verbs/
  // verb-conjugation-engine.js (deterministic grammar rules, no AI call) -
  // persists across verb changes (module-level, not reset by
  // renderVerbsConjugator) so switching verbs keeps you on the tense you
  // were reading, per the "no perder el contexto" rule this whole section
  // already follows for search/filter/sort.
  let selectedConjugationTense = 'presentSimple';

  function verbTenseTabsHtml() {
    const Conj = window.AndergoVerbConjugation;
    if (!Conj) return '';
    return `
      <div class="verb-tense-tabs" role="tablist" aria-label="Tiempos verbales">
        ${Conj.TENSES.map(
          (t) => `
          <button type="button" class="verb-tense-tab${t.id === selectedConjugationTense ? ' active' : ''}" role="tab" aria-selected="${t.id === selectedConjugationTense}" data-tense="${t.id}">${escapeHtml(t.label)}</button>`
        ).join('')}
      </div>`;
  }

  function verbTenseTableHtml(raw, audioOpts) {
    const Conj = window.AndergoVerbConjugation;
    if (!Conj) return '';
    const data = Conj.conjugateTense(raw, selectedConjugationTense);
    if (!data) return '';
    const isImperative = selectedConjugationTense === 'imperative';
    const rowsHtml = data.rows
      .map(
        (row) => `
        <div class="verb-tense-row">
          <span class="verb-tense-pronoun">${escapeHtml(row.label)}</span>
          <span class="verb-tense-cell" data-label="Afirmativa: ">${escapeHtml(row.affirmative)} ${conjugatorAudioBtnHtml(row.affirmative, audioOpts)}</span>
          <span class="verb-tense-cell" data-label="Negativa: ">${escapeHtml(row.negative)}</span>
          <span class="verb-tense-cell" data-label="Interrogativa: ">${row.interrogative ? escapeHtml(row.interrogative) : '—'}</span>
        </div>`
      )
      .join('');
    return `
      <div class="verb-tense-table${isImperative ? ' verb-tense-table--imperative' : ''}">
        <div class="verb-tense-row verb-tense-header-row">
          <span></span><span>Afirmativa</span><span>Negativa</span><span>Interrogativa</span>
        </div>
        ${rowsHtml}
      </div>
      ${data.note ? `<p class="verb-tense-note">${escapeHtml(data.note)}</p>` : ''}`;
  }

  // Renders the full conjugation card for one verb: quick-reference forms +
  // hand-authored present-simple examples (unchanged from Fase 1/2) plus
  // the new full tense table (Fase 3) - straight from raw.forms/raw.examples
  // and the deterministic conjugation engine, never generated on the fly.
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

    const examples = raw.examples || {};
    const exampleRow = (label, text) =>
      text
        ? `
        <div class="verb-conjugation-example">
          <span class="verb-conjugation-example-label">${escapeHtml(label)}</span>
          <p>${escapeHtml(text)} ${conjugatorAudioBtnHtml(text, audioOpts)}</p>
        </div>`
        : '';

    const collocationsHtml = raw.commonCollocations?.length
      ? `<p class="verb-conjugation-collocations"><strong>Colocaciones frecuentes:</strong> ${escapeHtml(raw.commonCollocations.join(', '))}</p>`
      : '';
    const notesHtml = raw.notes
      ? `<p class="verb-conjugation-notes">${escapeHtml(raw.notes)}</p>`
      : '';

    return `
      <div class="verb-conjugation-card">
        <div class="verb-conjugation-head">
          <div>
            <h3>${escapeHtml(item.targetWord)} ${item.phonetic ? `<span class="vocab-card-phonetic">${escapeHtml(item.phonetic)}</span>` : ''}</h3>
            <span class="vocab-card-tag">${escapeHtml(item.category)} · ${escapeHtml(raw.level || '')}</span>
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
        ${collocationsHtml}
        ${notesHtml}
        <h4 class="verb-tense-heading">Conjugación completa</h4>
        ${verbTenseTabsHtml()}
        <div id="verbTenseTableContainer">${verbTenseTableHtml(raw, audioOpts)}</div>
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
      .sort((a, b) => (a.rank || 0) - (b.rank || 0))
      .map((raw) => `<option value="${escapeHtml(raw.id)}">${escapeHtml(raw.infinitive)}</option>`)
      .join('');
    return select;
  }

  function renderVerbsConjugator(verbId) {
    const content = document.getElementById('verbsConjugatorContent');
    if (!content) return;

    try {
      const targetLanguage = 'english'; // Fase 1/2 scope: English only
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
    } catch (error) {
      console.warn('[verbs] renderVerbsConjugator failed', error);
      content.innerHTML = `
        <div class="skill-graph-empty verbs-error-card">
          <p>En este momento no pudimos cargar el Conjugador. Inténtalo nuevamente.</p>
          <button type="button" class="secondary-btn" id="verbsConjugatorRetryBtn">Reintentar</button>
        </div>`;
    }
  }

  // Opens Conjugador on a specific verb without losing the Verbos tab's
  // current search/filter/sort/scroll state (spec: "no recargar la página",
  // "conservar el contexto") - just flips which .skill-panel is .active,
  // same mechanism activateSkillTab() (script.js) already uses for a plain
  // tab click, then re-renders Conjugador's own content for this verb id.
  function openConjugatorForVerb(verbId) {
    const tabsRoot = document.getElementById('verbsTabs');
    const conjugatorTabBtn = tabsRoot?.querySelector('.skill-tab-button[data-skill="conjugator"]');
    if (conjugatorTabBtn && typeof activateSkillTab === 'function') {
      activateSkillTab(conjugatorTabBtn, { scroll: false });
    }
    renderVerbsConjugator(verbId);
    tabsRoot?.querySelector('.skill-panel[data-skill="conjugator"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ---------------------------------------------------------------------
  // Practicar. Reuses script.js's Grammar-test question engine as pure
  // helper functions (renderGrammarTestQuestionBodyHtml/collectGrammarTestAnswer/
  // isGrammarTestQuestionAnswered/gradeBandForScore - none of them ever touch
  // the network) and the exact .grammar-test-* markup/CSS for visual
  // consistency, including its already-generic, lesson-agnostic
  // .grammar-test-option click handler (document-delegated in script.js -
  // just toggles .is-selected, no lesson lookup - works here unmodified).
  //
  // What's different from Grammar's own test: Grammar's test is graded by
  // the server against a real course_lessons answer key. Verbos has no
  // lesson/course row to grade against (and per the Fase 1 plan, this must
  // not touch Supabase/tables), so every question here carries its own
  // correct answer and is graded entirely client-side - reasonable for a
  // low-stakes vocabulary/grammar drill, unlike a scored course test.
  // ---------------------------------------------------------------------

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
    const byFrequency = raw.slice().sort((a, b) => (a.rank || 0) - (b.rank || 0));
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
    const sentence = verb.examples?.affirmative || verb.infinitive;
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

  // Fase 4: uses the Fase 3 conjugation engine (src/js/verbs/
  // verb-conjugation-engine.js) to quiz tense/person forms directly -
  // distractors are the SAME person's form in different tenses (tests "does
  // this tense fit here", not just "can you spell the past tense"), which
  // the existing 'past'/'participle' kinds above don't cover. Excludes
  // 'imperative' (no person distinction, would make a confusing distractor).
  const PRACTICE_TENSE_IDS = ['presentSimple', 'pastSimple', 'presentContinuous', 'presentPerfect', 'futureSimple'];

  function generateTenseFormQuestion(verb, allVerbs) {
    const Conj = window.AndergoVerbConjugation;
    if (!Conj) return generatePastFormQuestion(verb, allVerbs);
    const tenseId = PRACTICE_TENSE_IDS[Math.floor(Math.random() * PRACTICE_TENSE_IDS.length)];
    const data = Conj.conjugateTense(verb, tenseId);
    if (!data?.rows?.length) return generatePastFormQuestion(verb, allVerbs);

    const rowIndex = Math.floor(Math.random() * data.rows.length);
    const row = data.rows[rowIndex];
    const tenseLabel = Conj.TENSES.find((t) => t.id === tenseId)?.label || tenseId;
    const otherTenseIds = Conj.TENSES.filter((t) => t.id !== tenseId && t.id !== 'imperative').map((t) => t.id);
    const distractorTexts = shuffleArray(otherTenseIds)
      .map((id) => Conj.conjugateTense(verb, id)?.rows?.[rowIndex]?.affirmative)
      .filter(Boolean);

    const prompt = `¿Cuál es la forma correcta de "${verb.infinitive}" (${tenseLabel}) para "${row.label}"?`;
    return buildMcqQuestion(`tense-${tenseId}-${rowIndex}-${verb.id}`, 'tense', verb, prompt, row.affirmative, distractorTexts);
  }

  const PRACTICE_QUESTION_KINDS = ['meaning', 'past', 'participle', 'order', 'dictation', 'tense'];

  function buildPracticeQuestions(pool, allVerbs, ctx) {
    return pool.map((verb) => {
      const kind = PRACTICE_QUESTION_KINDS[Math.floor(Math.random() * PRACTICE_QUESTION_KINDS.length)];
      if (kind === 'meaning') return generateMeaningQuestion(verb, allVerbs, ctx);
      if (kind === 'past') return generatePastFormQuestion(verb, allVerbs);
      if (kind === 'participle') return generateParticipleQuestion(verb, allVerbs);
      if (kind === 'order') return generateWordOrderQuestion(verb);
      if (kind === 'tense') return generateTenseFormQuestion(verb, allVerbs);
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

  function beginPracticeSession(pool) {
    const targetLanguage = 'english';
    const allVerbs = getVerbsForLanguage(targetLanguage);
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

  // Session length (spec Fase 4: no forzar siempre la sesión completa) -
  // shuffles before truncating so a shorter session doesn't always land on
  // the same (lowest-rank / most-frequent) verbs every time.
  function applySessionLength(pool, lengthValue) {
    if (lengthValue === 'all') return pool;
    const n = Number(lengthValue) || 10;
    return pool.length > n ? shuffleArray(pool).slice(0, n) : pool;
  }

  function startVerbsPractice(poolMode) {
    const lengthSelect = document.getElementById('verbsPracticeLengthSelect');
    const pool = applySessionLength(getVerbsPool(poolMode, 'english'), lengthSelect?.value || '10');
    beginPracticeSession(pool);
  }

  // "Practicar solo los fallados" (results screen) - reads the session that
  // just ended (practiceRuntime.results) before showVerbsPracticeSetup()
  // would otherwise null it out, so this must run before that, not after.
  function retryFailedVerbs() {
    if (!practiceRuntime) return;
    const failedIds = Array.from(new Set(practiceRuntime.results.filter((r) => !r.correct).map((r) => r.verbId)));
    if (!failedIds.length) return;
    const pool = getVerbsForLanguage('english').filter((v) => failedIds.includes(v.id));
    beginPracticeSession(pool);
  }

  // Card-level "🎯 Practicar" button (spec: tarjeta con botón Practicar,
  // distinct from the shared card's own "Ya la sé/Practicar" mastery
  // buttons) - opens the Practicar tab with a 1-question drill for just
  // this verb, same rendering/grading path as a full session.
  function startVerbsPracticeForVerb(verbId) {
    const verb = getVerbById(verbId, 'english');
    if (!verb) return;
    const tabsRoot = document.getElementById('verbsTabs');
    const practiceTabBtn = tabsRoot?.querySelector('.skill-tab-button[data-skill="practice"]');
    if (practiceTabBtn && typeof activateSkillTab === 'function') {
      activateSkillTab(practiceTabBtn, { scroll: false });
    }
    beginPracticeSession([verb]);
    tabsRoot?.querySelector('.skill-panel[data-skill="practice"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    const failedCount = new Set(results.filter((r) => !r.correct).map((r) => r.verbId)).size;
    const retryFailedBtnHtml = failedCount
      ? `<button type="button" class="secondary-btn" id="verbsPracticeRetryFailedBtn">Practicar solo los fallados (${failedCount})</button>`
      : '';

    content.innerHTML = `
      <div class="grammar-test-card card-enter">
        <div class="grammar-test-score-band">
          <span class="grammar-test-score-emoji" aria-hidden="true">${band.emoji}</span>
          <strong class="grammar-test-score-number">${score}/100</strong>
          <span class="grammar-test-score-label">${band.label}</span>
        </div>
        <p class="grammar-test-score-detail">Respuestas correctas: ${correctCount} de ${total}</p>
        <ul class="grammar-test-breakdown-list">${breakdownHtml}</ul>
        <div class="verb-practice-results-actions">
          ${retryFailedBtnHtml}
          <button type="button" class="primary-btn" id="verbsPracticeRetryBtn">Practicar de nuevo</button>
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------
  // Mi progreso. Reuses the exact two stores everything else on this page
  // already reads/writes - getStoredVocabMastery (shared with Vocabulary)
  // for the Nuevo/Aprendiendo/Necesito practicar/Dominado status, and this
  // file's own VERB_PRACTICE_STATS_KEY for the rest. No new storage, no
  // network, nothing Supabase-facing.
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
      .sort((a, b) => (b.attempts || 0) - (a.attempts || 0) || (a.verb.rank || 0) - (b.verb.rank || 0));

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
    // verbs (an active streak, not a lifetime best - one wrong answer on
    // that verb resets it, same as recordVerbAttempt does per-verb).
    const currentStreak = rows.reduce((max, row) => Math.max(max, row.streak || 0), 0);

    return { rows, counts, totalVerbs, masteredPct, totalAttempts, totalCorrect, totalIncorrect, currentStreak };
  }

  function renderVerbsProgress() {
    const content = document.getElementById('verbsProgressContent');
    if (!content) return;

    try {
      const targetLanguage = 'english'; // Fase 1/2 scope: English only
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

      // Overall stacked bar (Fase 4) - one visual read of all 100 verbs'
      // mastery distribution, above the per-status tiles below it (which
      // already had the exact same counts, just as separate numbers with
      // no sense of proportion relative to the whole set).
      const pct = (count) => (summary.totalVerbs ? (count / summary.totalVerbs) * 100 : 0);
      const overallBarHtml = `
        <div class="verb-progress-bar" role="img" aria-label="Nuevo ${summary.counts.new || 0}, aprendiendo ${summary.counts.learning || 0}, necesito practicar ${summary.counts.practicing || 0}, dominado ${summary.counts.mastered || 0} de ${summary.totalVerbs} verbos">
          <span class="verb-progress-bar-seg verb-progress-bar-seg--new" style="width:${pct(summary.counts.new)}%"></span>
          <span class="verb-progress-bar-seg verb-progress-bar-seg--learning" style="width:${pct(summary.counts.learning)}%"></span>
          <span class="verb-progress-bar-seg verb-progress-bar-seg--practicing" style="width:${pct(summary.counts.practicing)}%"></span>
          <span class="verb-progress-bar-seg verb-progress-bar-seg--mastered" style="width:${pct(summary.counts.mastered)}%"></span>
        </div>`;

      const summaryHtml = `
        ${overallBarHtml}
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
    } catch (error) {
      console.warn('[verbs] renderVerbsProgress failed', error);
      content.innerHTML = `
        <div class="skill-graph-empty verbs-error-card">
          <p>En este momento no pudimos cargar Mi progreso. Inténtalo nuevamente.</p>
          <button type="button" class="secondary-btn" id="verbsProgressRetryBtn">Reintentar</button>
        </div>`;
    }
  }

  // Fase 4: clears only THIS section's data - every verb id's entry in the
  // shared mastery store (VOCAB_MASTERY_STORAGE_KEY, bare global from
  // script.js - loads before this file runs) plus this file's own practice
  // stats. Deliberately does NOT touch other ids in that shared store
  // (Vocabulary's own words) or VERB_FAVORITES_KEY (favorites aren't
  // "progress" - Mi progreso never displays them). Local-only, reversible
  // only by practicing again - never touches Supabase.
  function resetVerbsProgress() {
    const verbs = getVerbsForLanguage('english');
    try {
      const masteryStore = JSON.parse(localStorage.getItem(VOCAB_MASTERY_STORAGE_KEY) || '{}');
      verbs.forEach((v) => delete masteryStore[v.id]);
      localStorage.setItem(VOCAB_MASTERY_STORAGE_KEY, JSON.stringify(masteryStore));
    } catch {
      // Storage unavailable - nothing to reset either way.
    }
    try {
      localStorage.removeItem(VERB_PRACTICE_STATS_KEY);
    } catch {
      // Storage unavailable - same as above.
    }
    renderVerbsProgress();
    renderVerbsDeck();
  }

  // Header meta line (spec §2: "idioma meta actual" + "progreso general,
  // cuando el usuario esté autenticado"). Dynamic/computed, unlike the
  // badge/title/description above it (those are static per-L1 strings via
  // data-i18n) - kept separate on purpose so a translator editing UI_STRINGS
  // never has to reason about progress-percentage math.
  function renderVerbsHeaderMeta() {
    const meta = document.getElementById('verbsHeadingMeta');
    if (!meta) return;
    const LanguagePair = window.AndergoLanguagePair;
    const bridgeLanguage =
      (typeof learningPathState !== 'undefined' && learningPathState.bridgeLanguage) || 'spanish';
    const targetLanguage = 'english';
    const targetLabel = LanguagePair ? LanguagePair.languageNameIn(bridgeLanguage, targetLanguage) : 'English';
    const isSignedIn = typeof authStatus !== 'undefined' && Boolean(authStatus.session?.access_token);

    let progressText = '';
    if (isSignedIn) {
      const verbs = getVerbsForLanguage(targetLanguage);
      const masteredCount = verbs.filter((v) => getStoredVocabMastery(v.id) === 'mastered').length;
      const pct = verbs.length ? Math.round((masteredCount / verbs.length) * 100) : 0;
      progressText = ` · ${masteredCount}/${verbs.length} dominados (${pct}%)`;
    }
    meta.textContent = `${targetLabel}${progressText}`;
  }

  // Entry point - called from script.js's showView() when the resolved view
  // is 'verbs'. Normalizes the hash to carry the language segment
  // (#verbs/english), same spirit as updateLearnHash() but scoped locally
  // since this phase has only one target language and no unit/lesson state.
  window.renderVerbsView = function renderVerbsView() {
    if (window.location.hash === '#verbs') {
      history.replaceState(null, '', '#verbs/english');
    }
    // The badge/title/description above the deck use plain data-i18n
    // attributes, so applyInterfaceLanguage() (script.js) already keeps them
    // in sync with L1 on every bridgeLanguage change, the same as every
    // other section's static chrome - nothing extra to do for them here.
    renderVerbsHeaderMeta();
    resetVerbsPagination();
    renderVerbsDeck();
    renderVerbsConjugator();
    const resetRow = document.querySelector('.verb-progress-reset-row');
    if (resetRow) resetRow.hidden = false;
    const setup = document.getElementById('verbsPracticeSetup');
    if (setup) setup.hidden = false;
    renderVerbsProgress();

    // Deep link support (#verbs/english/practice, #verbs/english/progress):
    // land on the requested subtab and, if the visitor isn't signed in,
    // show that subtab's access-required panel immediately instead of the
    // normal setup/stats content flashing first.
    const requestedSubtab = window.location.hash.replace('#', '').split('/')[2];
    if (requestedSubtab === 'practice' || requestedSubtab === 'progress') {
      const tabBtn = document.querySelector(`#verbsTabs .skill-tab-button[data-skill="${requestedSubtab}"]`);
      if (tabBtn && typeof activateSkillTab === 'function') activateSkillTab(tabBtn, { scroll: false });
      requireAuthForVerbFeature(requestedSubtab);
    }
  };

  // Debounced (spec: ~200-300ms) so fast typing doesn't re-render the deck
  // on every keystroke - a fresh search always restarts pagination at
  // PAGE_SIZE (see resetVerbsPagination), same as a filter/sort change.
  let verbsSearchDebounceId = null;
  document.addEventListener('input', (event) => {
    if (event.target.id !== 'verbsSearchInput') return;
    window.clearTimeout(verbsSearchDebounceId);
    verbsSearchDebounceId = window.setTimeout(() => {
      resetVerbsPagination();
      renderVerbsDeck();
    }, 250);
  });

  document.addEventListener('change', (event) => {
    if (event.target.id === 'verbsFilterSelect' || event.target.id === 'verbsSortSelect') {
      resetVerbsPagination();
      renderVerbsDeck();
    }
    if (event.target.id === 'verbsConjugatorSelect') renderVerbsConjugator(event.target.value);
  });

  document.addEventListener('click', (event) => {
    // Intercept the shared Vocabulary mastery buttons (renderVocabCardHtml/
    // script.js's own document click listener, registered after this one)
    // only when the card is a verb card (id prefix 'verb-english-') - never
    // touches Vocabulary's own cards. Blocks the mastery write entirely for
    // a visitor via stopImmediatePropagation, per spec: "Ya lo sé"/
    // "Necesito practicar" are persistence actions and require a session.
    const vocabMasteryBtn = event.target.closest('.vocab-know-btn, .vocab-retry-btn');
    if (vocabMasteryBtn) {
      const cardId = vocabMasteryBtn.closest('.vocab-card')?.dataset.cardId || '';
      if (cardId.startsWith('verb-english-') && !requireAuthForCardAction('Inicia sesión para guardar este verbo en tu progreso.')) {
        event.stopImmediatePropagation();
        return;
      }
    }

    const authReqLoginBtn = event.target.closest('.verbs-auth-login-btn');
    if (authReqLoginBtn) {
      openModal('login');
      return;
    }
    const authReqSignupBtn = event.target.closest('.verbs-auth-signup-btn');
    if (authReqSignupBtn) {
      openModal('signup');
      return;
    }
    const authReqBackBtn = event.target.closest('.verbs-auth-back-btn');
    if (authReqBackBtn) {
      pendingVerbAuthReturn = null;
      try {
        sessionStorage.removeItem(VERB_AUTH_RETURN_KEY);
      } catch {
        // Nothing to clean up if storage is unavailable.
      }
      history.replaceState(null, '', '#verbs/english');
      const listTabBtn = document.querySelector('#verbsTabs .skill-tab-button[data-skill="list"]');
      if (listTabBtn && typeof activateSkillTab === 'function') activateSkillTab(listTabBtn, { scroll: false });
      return;
    }

    // Practicar/Mi progreso tab buttons - the only two subtabs that gate.
    // No-op (leaves whatever content is already there) when signed in;
    // renders the access-required panel otherwise. Registered here (before
    // script.js's generic activateSkillTab listener) so the gate's markup
    // is in place before/at the same time as the tab becomes visible.
    if (event.target.closest('#verbsTabs .skill-tab-button[data-skill="practice"]')) {
      requireAuthForVerbFeature('practice');
      return;
    }

    if (event.target.closest('#verbsLoadMoreBtn')) {
      verbsVisibleCount += PAGE_SIZE;
      renderVerbsDeck();
      return;
    }

    if (event.target.closest('#verbsRetryBtn')) {
      renderVerbsDeck();
      return;
    }
    if (event.target.closest('#verbsConjugatorRetryBtn')) {
      renderVerbsConjugator();
      return;
    }

    const tenseTab = event.target.closest('.verb-tense-tab');
    if (tenseTab) {
      event.stopPropagation();
      selectedConjugationTense = tenseTab.dataset.tense;
      renderVerbsConjugator(document.getElementById('verbsConjugatorSelect')?.value);
      return;
    }
    if (event.target.closest('#verbsProgressRetryBtn')) {
      renderVerbsProgress();
      return;
    }

    if (event.target.closest('#verbsProgressResetBtn')) {
      if (
        window.confirm(
          '¿Reiniciar tu progreso de Verbos? Esto borra el dominio y las estadísticas de práctica guardadas en este dispositivo. No afecta tu progreso de Vocabulario ni tus favoritos.'
        )
      ) {
        resetVerbsProgress();
      }
      return;
    }

    const favBtn = event.target.closest('.verb-favorite-btn');
    if (favBtn) {
      event.stopPropagation();
      if (!requireAuthForCardAction('Inicia sesión para guardar este verbo en tu progreso.')) return;
      const nextState = toggleVerbFavorite(favBtn.dataset.verbId);
      favBtn.classList.toggle('is-active', nextState);
      favBtn.setAttribute('aria-pressed', String(nextState));
      favBtn.textContent = nextState ? '★ Favorito' : '☆ Favorito';
      return;
    }

    const conjugateBtn = event.target.closest('.verb-conjugate-btn');
    if (conjugateBtn) {
      event.stopPropagation();
      openConjugatorForVerb(conjugateBtn.dataset.verbId);
      return;
    }

    const practiceOneBtn = event.target.closest('.verb-practice-one-btn');
    if (practiceOneBtn) {
      event.stopPropagation();
      if (!requireAuthForVerbFeature('practice', { verbId: practiceOneBtn.dataset.verbId })) return;
      startVerbsPracticeForVerb(practiceOneBtn.dataset.verbId);
      return;
    }

    // Refreshes Mi progreso every time its tab is opened (not only on the
    // #verbs entry point) - the student may have just finished a Practicar
    // session and switched tabs without leaving/re-entering #verbs. The
    // generic .skill-tab-button visibility toggle (script.js) still handles
    // showing/hiding the panel itself; this only re-renders its content.
    if (event.target.closest('#verbsTabs .skill-tab-button[data-skill="progress"]')) {
      if (requireAuthForVerbFeature('progress')) renderVerbsProgress();
      return;
    }

    if (event.target.closest('#verbsPracticeStartBtn')) {
      if (!requireAuthForVerbFeature('practice')) return;
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

    if (event.target.closest('#verbsPracticeRetryFailedBtn')) {
      retryFailedVerbs();
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
