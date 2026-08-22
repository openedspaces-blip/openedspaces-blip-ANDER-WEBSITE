// Local-first search for the Andergo curriculum. It loads only the static
// course bundles shipped with the site; no query, word or student data leaves
// the browser.
(function () {
  const trigger = document.getElementById('globalSearchTrigger');
  const panel = document.getElementById('globalSearchPanel');
  const input = document.getElementById('globalSearchInput');
  const results = document.getElementById('globalSearchResults');
  const hint = document.getElementById('globalSearchHint');
  if (!trigger || !panel || !input || !results || !hint) return;

  const SOURCES = {
    english: '/src/worlds/english/content.js',
    spanish: '/src/worlds/spanish/content.js',
    french: '/src/worlds/french/content.js',
    italian: '/src/worlds/italian/content.js',
    portuguese: '/src/worlds/portuguese/content.js',
    german: '/src/worlds/german/content.js'
  };
  const languageLabels = {
    english: 'Inglés', spanish: 'Español', french: 'Francés', italian: 'Italiano', portuguese: 'Portugués', german: 'Alemán'
  };
  const guideEntries = [
    { terms: ['verb to be', 'to be', 'be verb', 'verbo to be'], title: 'Verb to be', detail: 'El verbo “to be” expresa identidad, estado y descripción: I am, you are, he/she is.', route: '#grammar', kind: 'Gramática' },
    { terms: ['passato prossimo', 'italian past'], title: 'Passato prossimo', detail: 'Tiempo italiano para acciones terminadas: avere/essere + participio passato.', route: '#grammar', kind: 'Gramática' },
    { terms: ['present simple', 'simple present'], title: 'Present simple', detail: 'Forma inglesa para hábitos, rutinas y hechos generales.', route: '#grammar', kind: 'Gramática' },
    { terms: ['subjunctive', 'congiuntivo', 'subjonctif'], title: 'Subjuntivo', detail: 'Modo verbal para deseos, dudas, valoraciones y situaciones no presentadas como hechos.', route: '#grammar', kind: 'Gramática' }
  ];
  let libraryPromise = null;
  const localLessons = {};
  let lastFocused = null;

  const normalize = (value) => String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const escape = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const excerpt = (value, length = 150) => {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
  };

  function loadBundle(language) {
    const alreadyLoaded = window.ANDERGO_LANGUAGE_WORLDS?.lessons?.[language];
    if (alreadyLoaded) {
      localLessons[language] = alreadyLoaded;
      return Promise.resolve();
    }
    // Course bundles are JavaScript assignments rather than JSON endpoints.
    // Read their JSON lesson payload without executing a second copy of the
    // bundle. That makes search dependable even while a course world is being
    // loaded elsewhere in the page.
    return fetch(SOURCES[language])
      .then((response) => {
        if (!response.ok) throw new Error(language);
        return response.text();
      })
      .then((source) => {
        const startToken = `window.ANDERGO_LANGUAGE_WORLDS.lessons.${language} = `;
        const start = source.indexOf(startToken);
        const arrayEnd = source.indexOf('\n];\n\n  window.ANDERGO_LANGUAGE_WORLDS.units =', start);
        if (start < 0 || arrayEnd < start) throw new Error(language);
        localLessons[language] = JSON.parse(
          source.slice(start + startToken.length, arrayEnd + 2).trim()
        );
      });
  }

  function ensureLibrary() {
    if (!libraryPromise) libraryPromise = Promise.all(Object.keys(SOURCES).map(loadBundle));
    return libraryPromise;
  }

  function curriculumEntries() {
    const worlds = { ...(window.ANDERGO_LANGUAGE_WORLDS?.lessons || {}), ...localLessons };
    return Object.entries(worlds).flatMap(([language, lessons]) => (lessons || []).flatMap((lesson) => {
      const meta = { language, level: lesson.level || '', lesson, route: `#${lesson.skill || 'learn'}` };
      const vocabulary = (lesson.vocabulary || []).map((item) => ({
        ...meta,
        kind: 'Vocabulario',
        title: item.word || '',
        detail: item.translation || item.definition || item.example || '',
        search: [item.word, item.translation, item.definition, item.example, ...(item.contexts || [])].join(' ')
      }));
      const topic = [{
        ...meta,
        kind: lesson.skill === 'grammar' ? 'Gramática' : 'Lección',
        title: lesson.title || '',
        detail: lesson.description || lesson.grammar || lesson.mission || '',
        search: [lesson.title, lesson.description, lesson.grammar, lesson.mission, ...(lesson.phrases || [])].join(' ')
      }];
      const reading = lesson.reading?.text
        ? [{ ...meta, kind: 'Lectura', title: lesson.reading.title || lesson.title || '', detail: excerpt(lesson.reading.text), search: `${lesson.reading.title || ''} ${lesson.reading.text}` }]
        : [];
      return [...vocabulary, ...topic, ...reading];
    }));
  }

  function findEntries(query) {
    const needle = normalize(query);
    if (needle.length < 2) return [];
    const words = needle.split(/\s+/).filter(Boolean);
    const guides = guideEntries
      .filter((entry) => entry.terms.some((term) => normalize(term) === needle))
      .map((entry) => ({ ...entry, score: 220 }));
    const found = curriculumEntries()
      .map((entry) => {
        const title = normalize(entry.title);
        const searchable = normalize(`${entry.search} ${entry.title} ${entry.detail}`);
        const matches = words.filter((word) => searchable.includes(word)).length;
        // A multi-word search must match every word. It prevents broad
        // results such as "Past Simple" when the learner searched for
        // "past participle".
        if (matches !== words.length) return null;
        const score =
          (title === needle ? 200 : title.includes(needle) ? 140 : searchable.includes(needle) ? 100 : 0) +
          matches * 15 +
          (entry.kind === 'Vocabulario' ? 8 : 0);
        return { ...entry, score };
      })
      .filter(Boolean)
      .filter((entry, index, entries) =>
        entries.findIndex(
          (candidate) =>
            candidate.kind === entry.kind &&
            candidate.language === entry.language &&
            candidate.level === entry.level &&
            normalize(candidate.title) === normalize(entry.title)
        ) === index
      );
    return [...guides, ...found]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  function render(query) {
    const entries = findEntries(query);
    if (!query.trim()) {
      results.innerHTML = `<div class="global-search-empty"><strong>Prueba con una palabra o estructura.</strong><span>Ejemplos: <button type="button" data-search-example="table">table</button>, <button type="button" data-search-example="verb to be">verb to be</button>, <button type="button" data-search-example="passato prossimo">passato prossimo</button></span></div>`;
      return;
    }
    if (!entries.length) {
      results.innerHTML = `<div class="global-search-empty"><strong>No encontramos “${escape(query)}” todavía.</strong><span>Prueba una palabra más corta, su traducción o el nombre de la estructura gramatical.</span></div>`;
      return;
    }
    results.innerHTML = entries.map((entry) => `
      <button type="button" class="global-search-result" data-search-route="${escape(entry.route)}">
        <span class="global-search-result-meta">${escape(entry.kind)}${entry.language ? ` · ${escape(languageLabels[entry.language] || entry.language)}${entry.level ? ` ${escape(entry.level)}` : ''}` : ''}</span>
        <strong>${escape(entry.title)}</strong>
        <small>${escape(entry.detail || 'Abrir este contenido en Andergo.')}</small>
      </button>`).join('');
  }

  async function openSearch() {
    lastFocused = document.activeElement;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    hint.textContent = 'Preparando la biblioteca local de Andergo…';
    render('');
    input.focus();
    try {
      await ensureLibrary();
      hint.textContent = 'Busca vocabulario, significado, gramática, lecturas y prácticas. Funciona con el contenido de Andergo, sin servicios externos.';
      render(input.value);
    } catch {
      hint.textContent = 'Algunos cursos no pudieron cargarse; puedes buscar en el contenido disponible.';
      render(input.value);
    }
  }

  function closeSearch() {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    lastFocused?.focus?.();
  }

  trigger.addEventListener('click', openSearch);
  panel.addEventListener('click', (event) => {
    const close = event.target.closest('[data-global-search-close]');
    if (close) return closeSearch();
    const example = event.target.closest('[data-search-example]');
    if (example) {
      input.value = example.dataset.searchExample || '';
      render(input.value);
      input.focus();
      return;
    }
    const result = event.target.closest('[data-search-route]');
    if (result) {
      window.location.hash = result.dataset.searchRoute;
      closeSearch();
    }
  });
  input.addEventListener('input', () => render(input.value));
  document.addEventListener('pointerdown', (event) => {
    if (!panel.hidden && !panel.contains(event.target) && !trigger.contains(event.target)) closeSearch();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) closeSearch();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (panel.hidden) openSearch(); else input.focus();
    }
  });
})();
