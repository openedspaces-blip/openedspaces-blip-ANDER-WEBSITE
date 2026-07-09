const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');
const nativeLanguageSelect = document.getElementById('nativeLanguage');
let currentTargetLanguage = 'english';
let currentNativeLanguage = 'es';


const premiumPriceUsd = '5.95';
const freeLessonPolicy = {
  defaultFreeLessons: 3,
  advancedFreeLessons: 1,
  advancedLevels: new Set(['C1', 'C2'])
};

function getFreeLessonCountForLevel(level = 'A1') {
  return freeLessonPolicy.advancedLevels.has(level) ? freeLessonPolicy.advancedFreeLessons : freeLessonPolicy.defaultFreeLessons;
}

function getLevelAccessText(level = 'A1') {
  const freeCount = getFreeLessonCountForLevel(level);
  return freeCount === 1 ? '1 lección gratis' : `${freeCount} lecciones gratis`;
}

function applyAccessBadges() {
  document.querySelectorAll('.language-card .level-card').forEach(card => {
    const level = card.dataset.level || card.querySelector('strong')?.textContent.trim() || 'A1';
    const badge = card.querySelector('.badge') || document.createElement('span');
    badge.className = `badge ${freeLessonPolicy.advancedLevels.has(level) ? 'limited' : 'free'}`;
    badge.textContent = getLevelAccessText(level);
    if (!badge.parentElement) card.appendChild(badge);

    let priceNote = card.querySelector('.level-price-note');
    if (!priceNote) {
      priceNote = document.createElement('small');
      priceNote.className = 'level-price-note';
      card.appendChild(priceNote);
    }
    priceNote.textContent = `Premium: USD ${premiumPriceUsd}`;
  });

  document.querySelectorAll('.access-summary').forEach(summary => {
    summary.innerHTML = `
      <span class="badge free">3 gratis por nivel</span>
      <span class="badge limited">C1/C2: 1 gratis</span>
      <span class="badge premium">Premium USD ${premiumPriceUsd}</span>
      <p class="advanced-note">Prueba lecciones gratis en cada nivel. Para desbloquear toda la ruta, usa el único plan premium de USD ${premiumPriceUsd}.</p>
    `;
  });
}

const targetLanguageMap = {
  english: 'english',
  espanol: 'spanish',
  frances: 'french',
  italiano: 'italian',
  deutsch: 'german',
  'ai-tutor': 'ai'
};

function activateLanguageTab(targetId, options = {}) {
  const button = Array.from(tabButtons).find(btn => btn.dataset.target === targetId);
  if (!button) return;

  tabButtons.forEach(btn => btn.classList.toggle('active', btn === button));
  tabPanels.forEach(panel => {
    const isTarget = panel.id === `tab-${targetId}`;
    panel.hidden = !isTarget;
    panel.classList.toggle('active', isTarget);
  });

  currentTargetLanguage = targetLanguageMap[targetId] || 'english';

  applyLanguageContent(currentTargetLanguage, currentNativeLanguage);
  document.querySelectorAll('.language-card').forEach(card => resetCardDetails(card));

  const activePanel = document.querySelector('.tab-panel.active');
  const initialLevel = activePanel?.querySelector('.level-card')?.dataset.level || 'A1';
  if (activePanel) updateLevelContent(activePanel, currentTargetLanguage, initialLevel);

  if (targetId === 'ai-tutor') {
    const card = activePanel?.querySelector('.language-card');
    const skillTabs = card?.querySelector('.skill-tabs');
    const tutorAction = card?.querySelector('.tutor-action');
    const vocabSection = card?.querySelector('.vocab-section');
    const detailToggle = card?.querySelector('.detail-toggle');

    // skill-tabs is always visible; open the secondary detail sections for AI Tutor
    [tutorAction, vocabSection].forEach(section => {
      if (section) section.classList.add('is-open');
    });

    if (detailToggle) {
      detailToggle.dataset.open = 'true';
      detailToggle.textContent = 'Ocultar detalles';
      detailToggle.setAttribute('aria-expanded', 'true');
    }

    const firstSkillButton = skillTabs?.querySelector('.skill-tab-button');
    if (firstSkillButton) firstSkillButton.click();
  }

  if (options.updateHash) {
    history.pushState(null, '', `#language-${targetId}`);
  }

  if (options.scroll) {
    document.getElementById('languages')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

tabButtons.forEach(button => {
  button.addEventListener('click', () => activateLanguageTab(button.dataset.target, {
    updateHash: true,
    scroll: true
  }));
});

const authModal = document.getElementById('authModal');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const authTriggers = document.querySelectorAll('[data-action="open-auth"]');
const closeModal = document.querySelector('.close-modal');
const skillTabButtons = document.querySelectorAll('.skill-tab-button');
const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.getElementById('siteMenu');
const userChip = document.querySelector('.user-chip');
const logoutButton = document.querySelector('.logout-btn');
const backendBaseUrl = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')) ? 'http://127.0.0.1:3000' : '';
const authStatus = {
  user: null,
  session: null
};

const goalOptions = {
  daily: {
    label: 'Practicar 15 min al día',
    helper: 'Meta de constancia para estudiar todos los días.',
    progressBoost: 0
  },
  conversation: {
    label: 'Completar 3 conversaciones',
    helper: 'Meta de fluidez para practicar speaking y listening.',
    progressBoost: 8
  },
  exam: {
    label: 'Preparar una evaluación',
    helper: 'Meta intensiva para reforzar lectura, gramática y escritura.',
    progressBoost: 14
  }
};

let activeGoal = 'daily';
let currentProgress = 0;

function gamificationKeyFor(user) {
  return user?.id || user?.email || 'guest';
}

function saveSession(user, session) {
  authStatus.user = user || null;
  authStatus.session = session || null;
  renderAuthState();
  loadSavedGoal();
  window.AndergoGamification?.load(gamificationKeyFor(authStatus.user));
  if (!session?.access_token) return;
  localStorage.setItem('andergoSession', JSON.stringify({ user, session }));
}

function restoreSession() {
  try {
    const stored = JSON.parse(localStorage.getItem('andergoSession') || 'null');
    if (stored?.session?.access_token) {
      authStatus.user = stored.user || null;
      authStatus.session = stored.session;
    }
  } catch {
    localStorage.removeItem('andergoSession');
  }
  renderAuthState();
  loadSavedGoal();
  window.AndergoGamification?.load(gamificationKeyFor(authStatus.user));
}

function getDisplayName() {
  return authStatus.user?.name || authStatus.user?.email?.split('@')[0] || 'estudiante';
}

function getGoalStorageKey() {
  return `andergoGoal:${authStatus.user?.id || authStatus.user?.email || 'guest'}`;
}

function renderAuthState() {
  const isSignedIn = Boolean(authStatus.session?.access_token);
  const name = getDisplayName();

  if (userChip) {
    userChip.hidden = !isSignedIn;
    userChip.textContent = isSignedIn ? `Hola, ${name}` : '';
  }

  if (logoutButton) logoutButton.hidden = !isSignedIn;

  authTriggers.forEach(trigger => {
    trigger.hidden = isSignedIn;
  });

  const greeting = document.querySelector('.student-greeting');
  if (greeting) {
    greeting.textContent = isSignedIn
      ? `${name}, esta es tu ruta personalizada.`
      : 'Inicia sesión para personalizar tu ruta.';
  }
}

function saveActiveGoal(goalKey) {
  activeGoal = goalOptions[goalKey] ? goalKey : 'daily';
  localStorage.setItem(getGoalStorageKey(), activeGoal);
  renderGoalState();
}

function loadSavedGoal() {
  activeGoal = localStorage.getItem(getGoalStorageKey()) || 'daily';
  if (!goalOptions[activeGoal]) activeGoal = 'daily';
  renderGoalState();
}

function renderGoalState(progress = currentProgress) {
  currentProgress = Math.max(0, Math.min(100, Number(progress) || 0));
  const goal = goalOptions[activeGoal] || goalOptions.daily;
  const adjustedProgress = Math.max(0, Math.min(100, currentProgress + goal.progressBoost || 0));
  const isSignedIn = Boolean(authStatus.session?.access_token);
  const name = getDisplayName();

  document.querySelectorAll('.goal-card').forEach(card => {
    card.classList.toggle('active', card.dataset.goal === activeGoal);
  });

  const activeGoalText = document.getElementById('activeGoalText');
  if (activeGoalText) activeGoalText.textContent = goal.label;

  const goalOwnerText = document.getElementById('goalOwnerText');
  if (goalOwnerText) {
    goalOwnerText.textContent = isSignedIn
      ? `${name}, ${goal.helper}`
      : 'Inicia sesión para guardar esta meta en tu perfil.';
  }

  const goalSummary = document.querySelector('.goal-summary strong');
  if (goalSummary) goalSummary.textContent = goal.label;

  document.querySelector('.goal-progress-meter')?.style.setProperty('width', `${adjustedProgress}%`);
}

const levelContent = {};
const languageContent = {};

if (window.ANDERGO_LANGUAGE_WORLDS) {
  Object.assign(levelContent, window.ANDERGO_LANGUAGE_WORLDS.levelContent || {});
  Object.assign(languageContent, window.ANDERGO_LANGUAGE_WORLDS.languageContent || {});
}

let languageUiContentPromise = null;

function mergeMissingContent(target, source) {
  if (!source || typeof source !== 'object') return target;

  Object.entries(source).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (!Array.isArray(target[key])) target[key] = value;
      return;
    }

    if (value && typeof value === 'object') {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
        target[key] = {};
      }
      mergeMissingContent(target[key], value);
      return;
    }

    if (target[key] === undefined) {
      target[key] = value;
    }
  });

  return target;
}

async function loadLanguageUiContent() {
  if (!languageUiContentPromise) {
    languageUiContentPromise = (async () => {
      try {
        const response = await fetch(`${backendBaseUrl}/api/content/languages`);
        if (!response.ok) {
          throw new Error(`Language content request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (data && typeof data === 'object') {
          if (data.levelContent && typeof data.levelContent === 'object') {
            mergeMissingContent(levelContent, data.levelContent);
          }
          if (data.languageContent && typeof data.languageContent === 'object') {
            mergeMissingContent(languageContent, data.languageContent);
          }
        }
      } catch (error) {
        console.warn('Could not load language UI content from backend', error);
      }

      return { levelContent, languageContent };
    })();
  }

  return languageUiContentPromise;
}

function applyLanguageContent(languageKey, nativeLanguage = currentNativeLanguage) {
  const content = languageContent[languageKey] || languageContent.spanish || Object.values(languageContent)[0];
  if (!content) return;
  const nativeLabel = {
    es: 'Español',
    en: 'English',
    fr: 'Français',
    it: 'Italiano',
    de: 'Deutsch'
  }[nativeLanguage] || 'Español';

  const nativeHint = {
    es: 'Tu lengua nativa: Español',
    en: 'Your native language: English',
    fr: 'Votre langue maternelle : Français',
    it: 'La tua lingua madre: Italiano',
    de: 'Deine Muttersprache: Deutsch'
  }[nativeLanguage] || 'Tu lengua nativa: Español';

  document.querySelector('.navbar .brand p').textContent = content.brandSubtitle;
  document.querySelectorAll('.menu a').forEach((link, index) => {
    if (content.nav[index]) link.textContent = content.nav[index];
  });
  document.querySelector('.nav-actions .login').textContent = content.authLogin;
  document.querySelector('.nav-actions .signup').textContent = content.authSignup;

  const heroBadge = document.querySelector('.hero .pill');
  if (heroBadge) heroBadge.textContent = content.heroBadge;

  const heroTitle = document.querySelector('.hero h2');
  if (heroTitle) heroTitle.textContent = content.heroTitle;

  const heroText = document.querySelector('.hero > .hero-content > p');
  if (heroText) heroText.textContent = content.heroText;

  const heroPrimary = document.querySelector('.hero-buttons .primary-btn');
  if (heroPrimary) heroPrimary.textContent = content.heroPrimary;

  const heroSecondary = document.querySelector('.hero-buttons .secondary-btn');
  if (heroSecondary) heroSecondary.textContent = content.heroSecondary;

  const sectionLabel = document.querySelector('#languages .section-heading span');
  if (sectionLabel) sectionLabel.textContent = content.sectionLabel;

  const sectionTitle = document.querySelector('#languages .section-heading h2');
  if (sectionTitle) sectionTitle.textContent = content.sectionTitle;

  const sectionDescription = document.querySelector('#languages .section-heading p');
  if (sectionDescription) sectionDescription.textContent = `${content.sectionDescription} ${nativeHint}`;

  const selectorLabel = document.querySelector('.language-selector label');
  if (selectorLabel) selectorLabel.textContent = content.nativeSelectorLabel || 'Selecciona tu lengua nativa';

  if (nativeLanguageSelect) {
    nativeLanguageSelect.value = nativeLanguage;
  }

  const activePanel = document.querySelector('.tab-panel.active');
  if (activePanel) {
    const overviewTitle = activePanel.querySelector('.language-overview h3');
    if (overviewTitle) overviewTitle.textContent = content.overviewTitle;

    const overviewText = activePanel.querySelector('.language-overview p');
    if (overviewText) overviewText.textContent = content.overviewText;

    const note = activePanel.querySelector('.advanced-note');
    if (note) note.textContent = content.note;

    activePanel.querySelectorAll('.skill-panel').forEach(panel => {
      const skill = panel.dataset.skill;
      const translations = content.skillPanels?.[skill];
      if (translations) {
        const heading = panel.querySelector('h4');
        const paragraph = panel.querySelector('p');
        if (heading) heading.textContent = translations.title;
        if (paragraph) paragraph.textContent = translations.text;
      }
    });
  }
}

nativeLanguageSelect?.addEventListener('change', event => {
  currentNativeLanguage = event.target.value;
  applyLanguageContent(currentTargetLanguage, currentNativeLanguage);
});

function renderMcqItem(question, index, languageKey) {
  // Backward compatible: older content used plain strings with no options.
  if (typeof question === 'string') {
    return `<li><strong>${index + 1}.</strong> ${escapeHtml(question)}</li>`;
  }

  const options = question.options || [];
  const optionsHtml = options.map((option, optionIndex) => `
    <button type="button" class="mcq-option" data-option-index="${optionIndex}">${escapeHtml(option)}</button>
  `).join('');

  return `
    <li class="mcq-question" data-answer-index="${question.answer}" data-language="${escapeHtml(languageKey || '')}">
      <strong>${index + 1}.</strong> ${escapeHtml(question.q || '')}
      <div class="mcq-options">${optionsHtml}</div>
      <span class="mcq-feedback" aria-live="polite"></span>
    </li>
  `;
}

function getWorldLessonsForLevel(languageKey, level) {
  const lessons = window.ANDERGO_LANGUAGE_WORLDS?.lessons?.[languageKey] || [];
  return lessons
    .filter(lesson => lesson.level === level)
    .sort((a, b) => (a.orderIndex || a.order_index || 0) - (b.orderIndex || b.order_index || 0));
}

function renderWorldLessonPreview(panel, languageKey, level) {
  const card = panel?.querySelector('.language-card');
  if (!card) return;

  let preview = card.querySelector('.world-lesson-preview');
  if (!preview) {
    preview = document.createElement('section');
    preview.className = 'world-lesson-preview';
    const anchor = card.querySelector('.access-summary') || card.querySelector('.level-grid');
    anchor?.insertAdjacentElement('afterend', preview);
  }

  const lessons = getWorldLessonsForLevel(languageKey, level);
  if (!lessons.length) {
    preview.innerHTML = '';
    return;
  }

  preview.innerHTML = `
    <div class="world-lesson-preview-head">
      <div>
        <span>${escapeHtml(level)} world</span>
        <h4>${lessons.length} lecciones disponibles</h4>
      </div>
      <button class="world-lesson-open" type="button" data-language="${escapeHtml(languageKey)}" data-level="${escapeHtml(level)}">Ver ruta</button>
    </div>
    <div class="world-lesson-grid">
      ${lessons.map(lesson => `
        <article class="world-lesson-row">
          <span>${escapeHtml(lesson.skill || '')} · ${lesson.isFree === false || lesson.accessTier === 'premium' ? `Premium USD ${premiumPriceUsd}` : 'Gratis'}</span>
          <h5>${escapeHtml(lesson.title || '')}</h5>
          <p>${escapeHtml(lesson.description || lesson.mission || lesson.intro || '')}</p>
        </article>
      `).join('')}
    </div>
  `;
}

function skillLabel(skill) {
  const labels = {
    listening: 'Listening',
    speaking: 'Speaking',
    reading: 'Reading',
    writing: 'Writing',
    grammar: 'Grammar',
    vocabulary: 'Vocabulary'
  };
  return labels[skill] || skill;
}

function renderSkillExplorer(panel, languageKey, level) {
  const skillTabs = panel?.querySelector('.skill-tabs');
  if (!skillTabs) return;

  const lessons = getWorldLessonsForLevel(languageKey, level);
  if (!lessons.length) return;

  const activeSkill = skillTabs.querySelector('.skill-tab-button.active')?.dataset.skill || lessons[0].skill;
  const normalizedActiveSkill = lessons.some(lesson => lesson.skill === activeSkill) ? activeSkill : lessons[0].skill;

  skillTabs.innerHTML = `
    <div class="skill-tab-list">
      ${lessons.map(lesson => `
        <button class="skill-tab-button ${lesson.skill === normalizedActiveSkill ? 'active' : ''}" type="button" data-skill="${escapeHtml(lesson.skill)}">
          ${escapeHtml(skillLabel(lesson.skill))}
        </button>
      `).join('')}
    </div>
    ${lessons.map(lesson => {
      const phrases = lesson.phrases || [];
      const vocabulary = lesson.vocabulary || [];
      const reading = lesson.reading || {};
      return `
        <div class="skill-panel ${lesson.skill === normalizedActiveSkill ? 'active' : ''}" data-skill="${escapeHtml(lesson.skill)}">
          <span class="skill-kicker">${escapeHtml(level)} · ${escapeHtml(skillLabel(lesson.skill))}</span>
          <h4>${escapeHtml(lesson.title || skillLabel(lesson.skill))}</h4>
          <p>${escapeHtml(lesson.description || lesson.mission || lesson.intro || '')}</p>
          <div class="skill-panel-grid">
            <div class="skill-focus-block">
              <strong>Misión</strong>
              <span>${escapeHtml(lesson.mission || lesson.intro || 'Completa la práctica guiada de esta habilidad.')}</span>
            </div>
            <div class="skill-focus-block">
              <strong>Gramática</strong>
              <span>${escapeHtml(lesson.grammar || 'Práctica guiada con ejemplos del nivel.')}</span>
            </div>
          </div>
          <div class="predictive-box">
            <strong>Frases útiles</strong>
            <div class="predictive-suggestions">
              ${(phrases.length ? phrases : vocabulary.slice(0, 4).map(item => item.word)).map(item => `<span class="predictive-suggestion">${escapeHtml(item)}</span>`).join('')}
            </div>
          </div>
          ${vocabulary.length ? `
            <div class="skill-mini-vocab">
              ${vocabulary.slice(0, 6).map(item => `<span><strong>${escapeHtml(item.word)}</strong>${escapeHtml(item.translation || '')}</span>`).join('')}
            </div>
          ` : ''}
          ${reading.text ? `<p class="skill-reading-text">${escapeHtml(reading.text)}</p>` : ''}
        </div>
      `;
    }).join('')}
  `;
}

function updateLevelContent(panel, languageKey, level) {
  const content = levelContent[languageKey]?.[level];
  if (!content || !panel) return;

  const levelCards = panel.querySelectorAll('.level-grid .level-card');
  levelCards.forEach(card => {
    card.classList.toggle('active', card.dataset.level === level);
  });

  const skillPanels = panel.querySelectorAll('.skill-panel');
  skillPanels.forEach(skillPanel => {
    const skill = skillPanel.dataset.skill;
    const skillContent = content.skills?.[skill];
    if (!skillContent) return;

    const heading = skillPanel.querySelector('h4');
    const paragraph = skillPanel.querySelector('p');
    const suggestionsContainer = skillPanel.querySelector('.predictive-suggestions');
    if (heading) heading.textContent = skillContent.title;
    if (paragraph) paragraph.textContent = skillContent.text;
    if (suggestionsContainer) {
      suggestionsContainer.innerHTML = skillContent.suggestions.map(item => `<span class="predictive-suggestion">${escapeHtml(item)}</span>`).join('');
    }
  });

  const vocabGrid = panel.querySelector('.vocab-grid');
  if (vocabGrid) {
    vocabGrid.innerHTML = content.vocab.map(([term, translation]) => `<div><strong>${term}</strong><span>${translation}</span></div>`).join('');
  }

  const grammarGrid = panel.querySelector('.grammar-grid');
  if (grammarGrid) {
    grammarGrid.innerHTML = content.grammar.map(([label, description]) => `<div><strong>${label}</strong><span>${description}</span></div>`).join('');
  }

  const readingText = panel.querySelector('.reading-text');
  const mcqList = panel.querySelector('.mcq-list');
  const levelList = panel.querySelector('.level-list');
  if (readingText) readingText.textContent = content.reading.text;
  if (mcqList) {
    mcqList.innerHTML = content.reading.questions.map((question, index) => renderMcqItem(question, index, languageKey)).join('');
  }
  if (levelList) {
    const levelItems = levelList.querySelectorAll('div');
    levelItems.forEach(item => item.classList.remove('active'));
    const activeItem = Array.from(levelItems).find(item => item.querySelector('strong')?.textContent.trim() === level);
    if (activeItem) activeItem.classList.add('active');
  }

  renderWorldLessonPreview(panel, languageKey, level);
  renderSkillExplorer(panel, languageKey, level);
}

function activateLevel(levelCard) {
  const panel = levelCard.closest('.tab-panel');
  const level = levelCard.dataset.level;
  const languageKey = targetLanguageMap[panel?.id?.replace('tab-', '')] || currentTargetLanguage;

  updateLevelContent(panel, languageKey, level);
}

function getLanguageTabFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return null;

  const normalized = hash.startsWith('language-') ? hash.replace('language-', '') : hash;
  return targetLanguageMap[normalized] ? normalized : null;
}

function activateInitialLanguageTab() {
  const targetFromHash = getLanguageTabFromHash();
  const activeButtonTarget = document.querySelector('.tab-button.active')?.dataset.target || 'english';
  if (targetFromHash) revealSection('#languages', { scroll: false });
  activateLanguageTab(targetFromHash || activeButtonTarget);
}

function setupLevelCards() {
  document.querySelectorAll('.language-card .level-grid > div').forEach(card => {
    const level = card.querySelector('strong')?.textContent.trim();
    if (!level) return;
    card.classList.add('level-card');
    card.dataset.level = level;
    card.addEventListener('click', () => activateLevel(card));
  });
  applyAccessBadges();
}

function resetCardDetails(card) {
  const toggle = card.querySelector('.detail-toggle');
  if (!toggle) return;

  // Only collapse the dense secondary sections; skill tabs stay visible
  card.querySelectorAll('.vocab-section, .grammar-section, .reading-comprehension, .tutor-action').forEach(section => {
    section.classList.remove('is-open');
  });

  toggle.dataset.open = 'false';
  toggle.textContent = 'Ver vocabulario y gramática';
  toggle.setAttribute('aria-expanded', 'false');
}

function setupDetailToggles() {
  document.querySelectorAll('.language-card').forEach(card => {
    const accessSummary = card.querySelector('.access-summary');
    if (!accessSummary || card.querySelector('.detail-toggle')) return;

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'detail-toggle';
    toggleButton.textContent = 'Ver vocabulario y gramática';
    toggleButton.setAttribute('aria-expanded', 'false');
    // Insert after skill-tabs (or after access-summary if no skill-tabs)
    const skillTabs = card.querySelector('.skill-tabs');
    const insertAnchor = skillTabs || accessSummary;
    insertAnchor.insertAdjacentElement('afterend', toggleButton);
  });

  document.querySelectorAll('.detail-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const card = toggle.closest('.language-card');
      const isOpen = toggle.dataset.open === 'true';
      // Only toggle the dense secondary sections — skill tabs are always visible
      const detailSections = card.querySelectorAll('.vocab-section, .grammar-section, .reading-comprehension, .tutor-action');

      detailSections.forEach(section => {
        section.classList.toggle('is-open', !isOpen);
      });

      toggle.dataset.open = String(!isOpen);
      toggle.textContent = isOpen ? 'Ver vocabulario y gramática' : 'Ocultar detalles';
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

function openModal(panel) {
  authModal.classList.add('open');
  authModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  authTabs.forEach(tab => {
    const active = tab.dataset.form === panel;
    tab.classList.toggle('active', active);
  });
  authForms.forEach(form => {
    form.classList.toggle('active', form.id === `${panel}Form`);
  });
}

function closeAuth() {
  authModal.classList.remove('open');
  authModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

async function postJson(path, payload) {
  const response = await fetch(`${backendBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

function updateProgressDisplay({ progress = 0, streak = 0, nextLesson = 'Listening A1' } = {}, isSignedIn = false) {
  const normalizedProgress = Math.max(0, Math.min(100, Number(progress) || 0));
  currentProgress = normalizedProgress;
  const progressCircle = document.querySelector('.progress-circle');
  const progressMeter = document.querySelector('.progress-meter');
  const progressText = document.querySelector('.progress-text');
  const progressSummary = document.querySelector('.progress-summary p');
  const courseLabel = document.querySelector('.course-label');
  const name = getDisplayName();

  if (progressCircle) progressCircle.textContent = `${normalizedProgress}%`;
  if (progressMeter) progressMeter.style.width = `${normalizedProgress}%`;
  if (progressText) {
    progressText.textContent = isSignedIn
      ? `${name}: ${normalizedProgress}% completado · ${streak} días de racha`
      : 'Inicia sesión para ver tu progreso';
  }
  if (progressSummary) {
    progressSummary.textContent = isSignedIn ? `Progreso del curso · ${nextLesson}` : 'Progreso del curso';
  }
  if (courseLabel) courseLabel.textContent = nextLesson || 'English · A1';
  renderGoalState(currentProgress);
}

async function loadProgress() {
  try {
    if (!authStatus.session?.access_token) {
      updateProgressDisplay();
      return;
    }

    const response = await fetch(`${backendBaseUrl}/api/progress`, {
      headers: {
        Authorization: `Bearer ${authStatus.session.access_token}`
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return;

    updateProgressDisplay(data, true);
  } catch (error) {
    console.warn('Could not load backend progress', error);
  }
}

function setAuthMessage(message, isError = false) {
  const note = document.querySelector('.auth-note');
  if (!note) return;
  note.textContent = message;
  note.style.color = isError ? '#dc2626' : '#0f766e';
}

async function logout() {
  try {
    if (authStatus.session?.access_token) {
      await fetch(`${backendBaseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: authHeaders()
      }).catch(() => {});
    }
  } finally {
    authStatus.user = null;
    authStatus.session = null;
    localStorage.removeItem('andergoSession');
    activeGoal = 'daily';
    renderAuthState();
    updateProgressDisplay();
    renderGoalState();
    window.AndergoGamification?.load('guest');
  }
}

function attachAuthHandlers() {
  const forms = document.querySelectorAll('.auth-form');

  forms.forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const isSignup = form.id === 'signupForm';
      const payload = {
        name: form.querySelector('input[type="text"]')?.value || '',
        email: form.querySelector('input[type="email"]')?.value || '',
        password: form.querySelector('input[type="password"]')?.value || ''
      };

      try {
        const data = await postJson('/api/auth', {
          action: isSignup ? 'register' : 'login',
          name: payload.name,
          email: payload.email,
          password: payload.password
        });
        saveSession(data.user, data.session);
        setAuthMessage(`Bienvenido${authStatus.user?.name ? `, ${authStatus.user.name}` : ''}!`, false);
        await loadProgress();
        await loadLearningPath();
        closeAuth();
      } catch (error) {
        setAuthMessage(error.message, true);
      }
    });
  });
}

const learningPathState = {
  lessons: [],
  activeSlug: null,
  language: 'english',
  level: 'A1'
};

const languageDisplayNames = {
  english: 'English',
  spanish: 'Español',
  french: 'Français',
  italian: 'Italiano',
  german: 'Deutsch',
  ai: 'AI Tutor'
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function authHeaders() {
  return authStatus.session?.access_token
    ? { Authorization: `Bearer ${authStatus.session.access_token}` }
    : {};
}

function getActiveLearningLesson() {
  return learningPathState.lessons.find(item => item.slug === learningPathState.activeSlug) || learningPathState.lessons[0] || null;
}

function updateAiTutorContext() {
  const contextRoot = document.querySelector('#tab-ai-tutor .tutor-context');
  if (!contextRoot) return;

  const lesson = getActiveLearningLesson();
  const values = {
    language: languageDisplayNames[learningPathState.language] || learningPathState.language || 'English',
    level: learningPathState.level || 'A1',
    lesson: lesson?.title || 'Ruta inicial'
  };

  Object.entries(values).forEach(([key, value]) => {
    const node = contextRoot.querySelector(`[data-ai-context="${key}"]`);
    if (node) node.textContent = value;
  });
}

function renderSkillGraph() {
  const container = document.getElementById('skillGraph');
  if (!container) return;

  const lessons = learningPathState.lessons;
  if (!lessons.length) {
    container.innerHTML = '<p class="skill-graph-empty">No hay lecciones disponibles.</p>';
    return;
  }

  const skillIcons = { listening: '🎧', speaking: '🗣️', reading: '📖', writing: '✍️' };
  const GRAPH_W = 280;
  const NODE_R = 36;
  const Y_STEP = 118;
  const TOP_PAD = NODE_R + 12;
  // Zigzag: center → left → center → right → repeat
  const X_FRACS = [0.5, 0.18, 0.5, 0.82];

  const nodeData = lessons.map((lesson, i) => ({
    lesson,
    cx: Math.round(GRAPH_W * X_FRACS[i % X_FRACS.length]),
    cy: TOP_PAD + i * Y_STEP,
    isActive: lesson.slug === learningPathState.activeSlug
  }));

  const totalH = TOP_PAD + (lessons.length - 1) * Y_STEP + NODE_R + 50;

  const svgPaths = nodeData.slice(0, -1).map(({ cx: x1, cy: y1 }, i) => {
    const { cx: x2, cy: y2, lesson: nextLesson } = nodeData[i + 1];
    const cpX = Math.round((x1 + x2) / 2);
    const cpY = Math.round((y1 + y2) / 2);
    const color = nextLesson.completed ? '#22c55e' : (nextLesson.locked ? '#dbeafe' : '#2563eb');
    const dashArray = nextLesson.locked ? '6 4' : 'none';
    const opacity = nextLesson.locked ? '0.35' : '0.6';
    return `<path d="M${x1},${y1 + NODE_R} C${cpX},${y1 + NODE_R + 32} ${cpX},${y2 - NODE_R - 32} ${x2},${y2 - NODE_R}" stroke="${color}" stroke-width="3" fill="none" stroke-dasharray="${dashArray}" opacity="${opacity}" stroke-linecap="round"/>`;
  }).join('');

  const nodesHtml = nodeData.map(({ lesson, cx, cy, isActive }) => {
    const icon = skillIcons[lesson.skill?.toLowerCase()] || '📚';
    let stateClass = 'available';
    if (lesson.locked) stateClass = 'locked';
    else if (lesson.completed) stateClass = 'completed';
    else if (isActive) stateClass = 'active';
    const shortTitle = lesson.title.length > 16 ? lesson.title.slice(0, 14).trimEnd() + '…' : lesson.title;
    return `<div class="skill-node skill-node--${stateClass}" style="left:${cx}px;top:${cy - NODE_R}px" data-lesson-slug="${escapeHtml(lesson.slug)}">
      <button class="skill-node-btn" type="button" aria-label="${escapeHtml(lesson.title)} ${escapeHtml(lesson.level)}">
        <span class="skill-node-icon">${lesson.locked ? '🔒' : icon}</span>
        <span class="skill-node-lvl">${escapeHtml(lesson.level)}</span>
        ${lesson.completed ? '<span class="skill-node-check" aria-hidden="true">✓</span>' : ''}
      </button>
      <span class="skill-node-label">${escapeHtml(shortTitle)}</span>
    </div>`;
  }).join('');

  container.innerHTML = `<div class="skill-graph-inner" style="height:${totalH}px;width:${GRAPH_W}px">
    <svg class="skill-graph-svg" width="${GRAPH_W}" height="${totalH}" aria-hidden="true">${svgPaths}</svg>
    ${nodesHtml}
  </div>`;

  container.querySelectorAll('.skill-node').forEach(nodeEl => {
    nodeEl.querySelector('.skill-node-btn')?.addEventListener('click', () => {
      learningPathState.activeSlug = nodeEl.dataset.lessonSlug;
      renderLearningPath();
      nodeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}

function renderLessonExercise(item, index, lesson) {
  if (item.type === 'mcq' && Array.isArray(item.options)) {
    const optionsHtml = item.options.map((option, optionIndex) => `
      <button type="button" class="mcq-option" data-option-index="${optionIndex}">${escapeHtml(option)}</button>
    `).join('');
    return `
      <div class="mcq-question lesson-exercise" data-answer-index="${item.answer}" data-skill="${escapeHtml(lesson.skill || '')}" data-language="${escapeHtml(learningPathState.language)}">
        <strong>${index + 1}. ${escapeHtml(item.prompt)}</strong>
        <div class="mcq-options">${optionsHtml}</div>
        <span class="mcq-feedback" aria-live="polite"></span>
      </div>
    `;
  }

  return `
    <div class="lesson-exercise open-exercise" data-skill="${escapeHtml(lesson.skill || item.type || '')}" data-language="${escapeHtml(learningPathState.language)}">
      <strong>${index + 1}. ${escapeHtml(item.prompt)}</strong>
      <button type="button" class="practice-mark-btn">Marcar como practicado</button>
    </div>
  `;
}

function renderLessonWorkspace() {
  const workspace = document.getElementById('lessonWorkspace');
  if (!workspace) return;

  const lesson = learningPathState.lessons.find(item => item.slug === learningPathState.activeSlug) || learningPathState.lessons[0];
  if (!lesson) return;

  const vocabulary = lesson.vocabulary?.map(item => `
    <div>
      <strong>${escapeHtml(item.word)}</strong>
      <span>${escapeHtml(item.translation)} · ${escapeHtml(item.example)}</span>
    </div>
  `).join('') || '';

  const dialogue = lesson.dialogue?.map(item => `
    <div>
      <strong>${escapeHtml(item.speaker)}: ${escapeHtml(item.line)}</strong>
      <span>${escapeHtml(item.translation)}</span>
    </div>
  `).join('') || '';

  const exercises = lesson.locked ? `
    <div class="premium-lock-box">
      <strong>🔒 Lección premium</strong>
      <span>Desbloquea esta lección y la ruta completa con el único plan: USD ${premiumPriceUsd}.</span>
      <button type="button" class="primary-btn upgrade-btn">Desbloquear por USD ${premiumPriceUsd}</button>
    </div>
  ` : (lesson.exercises?.slice(0, 4).map((item, index) => renderLessonExercise(item, index, lesson)).join('') || '');

  workspace.querySelector('.lesson-kicker').textContent = `${lesson.level} · ${lesson.skill}`;
  workspace.querySelector('h3').textContent = lesson.title;
  workspace.querySelector('.lesson-intro').textContent = lesson.intro || lesson.description || '';
  workspace.querySelector('.lesson-vocabulary').innerHTML = vocabulary;
  workspace.querySelector('.lesson-dialogue').innerHTML = dialogue;
  workspace.querySelector('.lesson-exercises').innerHTML = exercises;

  const completeButton = workspace.querySelector('.lesson-complete-btn');
  if (completeButton) {
    completeButton.disabled = Boolean(lesson.completed) || Boolean(lesson.locked);
    completeButton.textContent = lesson.locked ? `Premium USD ${premiumPriceUsd}` : (lesson.completed ? 'Completada' : 'Completar');
    completeButton.dataset.lessonSlug = lesson.slug;
  }
}

function renderLearningPath() {
  renderSkillGraph();
  renderLessonWorkspace();
  updateAiTutorContext();
}

function getLocalFallbackLessons(language, level) {
  const lessons = window.ANDERGO_LANGUAGE_WORLDS?.lessons?.[language] || [];
  return lessons
    .filter(lesson => lesson.level === level)
    .map(lesson => ({
      ...lesson,
      isFree: lesson.accessTier ? lesson.accessTier !== 'premium' : lesson.isFree !== false,
      locked: (lesson.accessTier === 'premium' || lesson.isFree === false) && !lesson.completed,
      completed: Boolean(lesson.completed)
    }));
}

async function loadLearningPath(options = {}) {
  learningPathState.language = options.language || learningPathState.language;
  learningPathState.level = options.level || learningPathState.level;

  const graphContainer = document.getElementById('skillGraph');
  if (graphContainer) {
    graphContainer.innerHTML = '<p class="skill-graph-empty">Preparando tu ruta…</p>';
  }

  try {
    const params = new URLSearchParams({ level: learningPathState.level, language: learningPathState.language });
    const response = await fetch(`${backendBaseUrl}/api/lessons?${params.toString()}`, {
      headers: authHeaders()
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Could not load lessons');

    learningPathState.lessons = data.lessons?.length ? data.lessons : getLocalFallbackLessons(learningPathState.language, learningPathState.level);
    learningPathState.activeSlug = learningPathState.lessons[0]?.slug || null;
    renderLearningPath();
  } catch (error) {
    console.warn('Could not load learning path from backend, using local content', error);
    learningPathState.lessons = getLocalFallbackLessons(learningPathState.language, learningPathState.level);
    learningPathState.activeSlug = learningPathState.lessons[0]?.slug || null;
    renderLearningPath();
  }
}

async function completeActiveLesson() {
  const activeLesson = learningPathState.lessons.find(item => item.slug === learningPathState.activeSlug);
  if (!activeLesson) return;

  if (activeLesson.locked) {
    handleHomeAction('upgrade');
    return;
  }

  if (!authStatus.session?.access_token) {
    setAuthMessage('Crea tu cuenta gratis para guardar el progreso de la lección.');
    openModal('signup');
    return;
  }

  const completeButton = document.querySelector('.lesson-complete-btn');
  if (completeButton) {
    completeButton.disabled = true;
    completeButton.textContent = 'Guardando...';
  }

  try {
    const response = await fetch(`${backendBaseUrl}/api/lessons/${activeLesson.slug}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ score: 100 })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'No se pudo completar la lección.');
    }

    activeLesson.completed = true;
    updateProgressDisplay(data, true);
    renderLearningPath();

    const gamResult = window.AndergoGamification?.recordLessonCompletion({
      slug: activeLesson.slug,
      language: learningPathState.language,
      score: 100,
      xpReward: activeLesson.xpReward || 20
    });
    window.AndergoGamification?.syncFromServer(data);

    if (data.newBadges?.length) {
      data.newBadges.forEach(badge => showCelebration(`🏅 ¡Insignia desbloqueada! ${badge.label}`));
    } else if (gamResult?.newBadges?.length) {
      gamResult.newBadges.forEach(badge => showCelebration(`🏅 ¡Insignia desbloqueada! ${badge.label}`));
    }
    if (data.leveledUp) {
      showCelebration(`🎉 ¡Subiste a nivel ${data.level}!`);
    }

    showHomeToast(`Lección completada. +${data.earnedXp || activeLesson.xpReward || 20} XP`);
  } catch (error) {
    console.error('Could not complete lesson', error);
    showHomeToast(error.message || 'No se pudo completar la lección.');
    if (completeButton) {
      completeButton.disabled = false;
      completeButton.textContent = 'Completar';
    }
  }
}

setupDetailToggles();
setupLevelCards();
attachAuthHandlers();
restoreSession();
loadLanguageUiContent().finally(() => {
  activateInitialLanguageTab();
});

authTriggers.forEach(trigger => {
  trigger.addEventListener('click', event => {
    event.preventDefault();
    setAuthMessage('');
    openModal(trigger.dataset.panel);
  });
});

authTabs.forEach(tab => {
  tab.addEventListener('click', () => openModal(tab.dataset.form));
});

logoutButton?.addEventListener('click', logout);

document.querySelectorAll('.goal-card').forEach(card => {
  card.querySelector('.goal-select')?.addEventListener('click', () => {
    saveActiveGoal(card.dataset.goal);
    document.getElementById('goals')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

document.addEventListener('click', async event => {
  const button = event.target.closest('.skill-tab-button');
  if (!button) return;

  const skill = button.dataset.skill;
  const parent = button.closest('.skill-tabs');
  const buttons = parent?.querySelectorAll('.skill-tab-button') || [];
  const panels = parent?.querySelectorAll('.skill-panel') || [];

  buttons.forEach(btn => btn.classList.toggle('active', btn === button));
  panels.forEach(panel => {
    panel.classList.toggle('active', panel.dataset.skill === skill);
  });

  parent?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

if (menuToggle && siteMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteMenu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', event => {
      const targetSelector = link.getAttribute('href');
      const target = targetSelector?.startsWith('#') ? document.querySelector(targetSelector) : null;
      if (target?.classList.contains('compact-hidden-section')) {
        event.preventDefault();
        revealSection(target);
      }
      siteMenu.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) {
      siteMenu.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

window.addEventListener('hashchange', () => {
  const targetFromHash = getLanguageTabFromHash();
  if (targetFromHash) {
    revealSection('#languages', { scroll: false });
    activateLanguageTab(targetFromHash);
  }
});

closeModal?.addEventListener('click', closeAuth);
authModal?.addEventListener('click', event => {
  if (event.target === authModal) closeAuth();
});


function showHomeToast(message = '') {
  let toast = document.querySelector('.home-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'home-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showHomeToast.timeoutId);
  showHomeToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2600);
}

function showCelebration(message = '') {
  const celebration = document.createElement('div');
  celebration.className = 'celebration-toast';
  celebration.setAttribute('role', 'status');
  celebration.setAttribute('aria-live', 'assertive');
  celebration.textContent = message;
  document.body.appendChild(celebration);

  window.requestAnimationFrame(() => celebration.classList.add('is-visible'));
  window.setTimeout(() => {
    celebration.classList.remove('is-visible');
    window.setTimeout(() => celebration.remove(), 400);
  }, 3200);
}

function revealSection(sectionOrSelector, options = {}) {
  const section = typeof sectionOrSelector === 'string'
    ? document.querySelector(sectionOrSelector)
    : sectionOrSelector;
  if (!section) return;
  section.classList.remove('compact-hidden-section');
  section.setAttribute('data-revealed', 'true');
  if (options.scroll !== false) {
    section.scrollIntoView({ behavior: 'smooth', block: options.block || 'start' });
  }
}

function handleHomeAction(action) {
  switch (action) {
    case 'continue-lesson':
      revealSection('#learning-path');
      showHomeToast('Ruta de lecciones abierta. Elige una lección y completa el reto.');
      break;
    case 'start-free':
      revealSection('#languages', { scroll: false });
      activateLanguageTab('english', { scroll: true, updateHash: false });
      showHomeToast('Elige un nivel. A1-B2 tienen 3 lecciones gratis; C1-C2 tienen 1.');
      break;
    case 'goals':
      document.getElementById('goals')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showHomeToast('Selecciona una meta para personalizar tu ruta.');
      break;
    case 'skills':
      revealSection('#skills');
      showHomeToast('Habilidades abiertas: listening, speaking, reading, writing, grammar y vocabulary.');
      break;
    case 'downloads':
      revealSection('#downloads');
      showHomeToast('Recursos abiertos. Los descargables se activarán para usuarios registrados.');
      break;
    case 'app':
      revealSection('#app');
      showHomeToast('Vista de la app abierta. Esta parte queda como próxima fase.');
      break;
    case 'upgrade':
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showHomeToast(`Plan premium único: USD ${premiumPriceUsd}.`);
      break;
    case 'ai-tutor':
      revealSection('#languages', { scroll: false });
      activateLanguageTab('ai-tutor', { scroll: true, updateHash: true });
      showHomeToast('Tutor IA abierto. Practica listening, speaking o writing.');
      break;
    default:
      break;
  }
}

function enableHomepageActions() {
  document.querySelectorAll('[data-home-action]').forEach(element => {
    element.addEventListener('click', event => {
      const action = element.dataset.homeAction;
      if (action) {
        event.preventDefault();
        handleHomeAction(action);
      }
    });
  });

  document.addEventListener('click', async event => {
    const upgradeButton = event.target.closest('.upgrade-btn');
    if (upgradeButton) {
      handleHomeAction('upgrade');
      if (!authStatus.session?.access_token) {
        setAuthMessage(`Crea tu cuenta para desbloquear la ruta premium por USD ${premiumPriceUsd}.`);
        openModal('signup');
      }
      return;
    }

    const worldLessonButton = event.target.closest('.world-lesson-open');
    if (worldLessonButton) {
      const language = worldLessonButton.dataset.language || currentTargetLanguage;
      const level = worldLessonButton.dataset.level || learningPathState.level;
      const languageSelect = document.getElementById('pathLanguageSelect');
      const levelSelect = document.getElementById('pathLevelSelect');
      if (languageSelect) languageSelect.value = language;
      if (levelSelect) levelSelect.value = level;
      revealSection('#learning-path');
      loadLearningPath({ language, level });
      showHomeToast(`Ruta ${language.toUpperCase()} ${level} abierta.`);
      return;
    }

    const suggestion = event.target.closest('.predictive-suggestion');
    if (suggestion) {
      const group = suggestion.closest('.predictive-suggestions');
      group?.querySelectorAll('.predictive-suggestion').forEach(item => item.classList.remove('selected'));
      suggestion.classList.add('selected');
      const tutorPrompt = document.getElementById('aiTutorPrompt');
      if (tutorPrompt && suggestion.closest('#tab-ai-tutor')) {
        tutorPrompt.value = suggestion.textContent.trim();
        tutorPrompt.focus();
      }
      showHomeToast(`Seleccionado: ${suggestion.textContent.trim()}`);
      const skillPanel = suggestion.closest('.skill-panel');
      window.AndergoGamification?.recordSkillTouched(skillPanel?.dataset.skill, currentTargetLanguage);
      return;
    }

    const mcqOption = event.target.closest('.mcq-option');
    if (mcqOption) {
      const questionItem = mcqOption.closest('.mcq-question');
      if (!questionItem || questionItem.classList.contains('answered')) return;

      const answerIndex = Number(questionItem.dataset.answerIndex);
      const chosenIndex = Number(mcqOption.dataset.optionIndex);
      const isCorrect = chosenIndex === answerIndex;
      const feedback = questionItem.querySelector('.mcq-feedback');

      questionItem.querySelectorAll('.mcq-option').forEach((option, index) => {
        option.disabled = true;
        if (index === answerIndex) option.classList.add('correct');
        if (index === chosenIndex && !isCorrect) option.classList.add('incorrect');
      });
      questionItem.classList.add('answered', isCorrect ? 'is-correct' : 'is-incorrect');

      if (feedback) {
        feedback.textContent = isCorrect ? '¡Correcto! +5 XP' : 'No es correcto, pero sigue intentando.';
      }

      if (isCorrect) {
        window.AndergoGamification?.recordCorrectAnswer();
        window.AndergoGamification?.recordSkillTouched('reading', questionItem.dataset.language || currentTargetLanguage);
      }
      return;
    }

    const practiceButton = event.target.closest('.practice-mark-btn');
    if (practiceButton) {
      const exerciseBlock = practiceButton.closest('.open-exercise');
      if (practiceButton.disabled) return;
      practiceButton.disabled = true;
      practiceButton.textContent = '✅ Practicado';
      window.AndergoGamification?.recordCorrectAnswer();
      window.AndergoGamification?.recordSkillTouched(exerciseBlock?.dataset.skill, exerciseBlock?.dataset.language || currentTargetLanguage);
      return;
    }

    const tutorButton = event.target.closest('.tutor-chat-btn');
    if (tutorButton) {
      const card = tutorButton.closest('.language-card');
      const result = card?.querySelector('.tutor-result');
      const activeSkill = card?.querySelector('.skill-tab-button.active')?.dataset.skill || 'speaking';
      const activeLesson = getActiveLearningLesson();
      const tutorPrompt = document.getElementById('aiTutorPrompt');
      const customPrompt = tutorPrompt?.value.trim() || '';
      const activeLevel = currentTargetLanguage === 'ai'
        ? learningPathState.level
        : (card?.querySelector('.level-card.active')?.dataset.level || learningPathState.level || 'A1');
      const tutorLanguage = currentTargetLanguage === 'ai'
        ? learningPathState.language
        : currentTargetLanguage;
      const selectedSuggestion = card?.querySelector('.skill-panel.active .predictive-suggestion.selected')?.textContent?.trim();
      const fallbackPrompt = {
        listening: 'Quiero practicar comprensión auditiva con un ejemplo corto y una pregunta.',
        speaking: 'Quiero practicar conversación con una respuesta modelo y una repregunta.',
        writing: 'Quiero practicar escritura con una corrección breve y un ejemplo mejorado.'
      }[activeSkill] || 'Quiero practicar esta habilidad.';
      const finalPrompt = customPrompt || selectedSuggestion || fallbackPrompt;

      if (result) {
        result.innerHTML = '<strong>Respuesta del tutor:</strong> Conectando con OpenAI...';
        result.classList.add('is-visible');
      }

      tutorButton.disabled = true;
      try {
        const response = await fetch(`${backendBaseUrl}/api/ai/tutor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
          },
          body: JSON.stringify({
            language: tutorLanguage,
            skill: activeSkill,
            level: activeLevel,
            nativeLanguage: currentNativeLanguage,
            prompt: finalPrompt,
            lessonTitle: activeLesson?.title || '',
            lessonIntro: activeLesson?.intro || activeLesson?.description || '',
            selectedSuggestion: selectedSuggestion || ''
          })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || 'No se pudo conectar con el tutor IA.');
        }
        if (result) {
          result.innerHTML = `<strong>Respuesta del tutor:</strong> ${escapeHtml(data.reply || '')}`.replace(/\n/g, '<br>');
          result.classList.add('is-visible');
        }
      } catch (error) {
        if (result) {
          result.innerHTML = `<strong>Respuesta del tutor:</strong> ${escapeHtml(error.message || 'No se pudo conectar con el tutor IA.')}`;
          result.classList.add('is-visible');
        }
      } finally {
        tutorButton.disabled = false;
      }
    }
  });

  const hashTarget = window.location.hash ? document.querySelector(window.location.hash) : null;
  if (hashTarget?.classList.contains('compact-hidden-section')) {
    revealSection(hashTarget, { scroll: false });
  }
}

function setupLearningPathControls() {
  const languageSelect = document.getElementById('pathLanguageSelect');
  const levelSelect = document.getElementById('pathLevelSelect');

  languageSelect?.addEventListener('change', () => {
    loadLearningPath({ language: languageSelect.value, level: levelSelect?.value || learningPathState.level });
  });
  levelSelect?.addEventListener('change', () => {
    loadLearningPath({ language: languageSelect?.value || learningPathState.language, level: levelSelect.value });
  });
}

enableHomepageActions();
loadProgress();
setupLearningPathControls();
loadLearningPath();
document.querySelector('.lesson-complete-btn')?.addEventListener('click', completeActiveLesson);
