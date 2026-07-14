const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');
const nativeLanguageSelect = document.getElementById('nativeLanguage');
let currentTargetLanguage = 'english';
let currentNativeLanguage = 'es';

// Bridge language: the language the student already speaks, used for
// explanations/hints (persisted server-side as profiles.bridge_language,
// paired with preferred_language/learningPathState.language - the target
// language being learned). Full language names (english/spanish/...), same
// vocabulary as learningPathState.language, unlike the older 2-letter-code
// #nativeLanguage select which this stays in sync with for backward
// compatibility.
let currentBridgeLanguage = 'spanish';
const bridgeCodeToName = { es: 'spanish', en: 'english', fr: 'french', it: 'italian', de: 'german' };
const bridgeNameToCode = { spanish: 'es', english: 'en', french: 'fr', italian: 'it', german: 'de' };


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

  applyLanguageContent(currentTargetLanguage);
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
document.querySelectorAll('.auth-form .auth-note').forEach(note => {
  note.dataset.defaultText = note.textContent;
});
const authTriggers = document.querySelectorAll('[data-action="open-auth"]');
const closeModal = document.querySelector('.close-modal');
const skillTabButtons = document.querySelectorAll('.skill-tab-button');
const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.getElementById('siteMenu');
const userChip = document.querySelector('.user-chip');
const logoutButton = document.querySelector('.logout-btn');
const backendBaseUrl = (typeof window !== 'undefined' && window.location.protocol === 'file:') ? 'http://127.0.0.1:3000' : '';
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
  syncGoalFromServer();
  loadDashboard();
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
  syncGoalFromServer();
  loadDashboard();
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
  // Local cache: renders instantly and still works offline/signed-out.
  localStorage.setItem(getGoalStorageKey(), activeGoal);
  renderGoalState();

  // Backend is the source of truth once signed in; a failed save keeps the
  // local cache so the choice isn't lost, but doesn't block navigation.
  if (!authStatus.session?.access_token) return;
  fetch(`${backendBaseUrl}/api/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ goalKey: activeGoal })
  }).catch(error => console.warn('Could not save goal', error));
}

function loadSavedGoal() {
  activeGoal = localStorage.getItem(getGoalStorageKey()) || 'daily';
  if (!goalOptions[activeGoal]) activeGoal = 'daily';
  renderGoalState();
}

// Called after login/session-restore: overwrites the local cache with
// whatever Supabase has, so the same goal shows up on another device or
// browser. Errors are swallowed - the local cache from loadSavedGoal()
// keeps working as a fallback.
async function syncGoalFromServer() {
  if (!authStatus.session?.access_token) return;
  try {
    const response = await fetch(`${backendBaseUrl}/api/goals`, { headers: authHeaders() });
    if (!response.ok) return;
    const data = await response.json().catch(() => null);
    const goalKey = data?.goal?.goalKey;
    if (!goalKey || !goalOptions[goalKey]) return;
    activeGoal = goalKey;
    localStorage.setItem(getGoalStorageKey(), activeGoal);
    renderGoalState();
  } catch (error) {
    console.warn('Could not sync goal from server', error);
  }
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

function applyLanguageContent(languageKey) {
  const content = languageContent[languageKey] || languageContent.spanish || Object.values(languageContent)[0];
  if (!content) return;

  // Syncing the #nativeLanguage select's displayed value is handled by
  // setBridgeLanguage() now, which also validates/persists it - this
  // function only ever touches the target-language-themed copy below.
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
  setBridgeLanguage(bridgeCodeToName[event.target.value] || 'spanish');
});

// Single source of truth for the bridge (already-known) language - keeps
// both selects (the learning-path #pathBridgeSelect and the older
// #nativeLanguage one) in sync, blocks bridge === target (the learning
// path's target, learningPathState.language - the one that's actually
// persisted alongside bridge_language server-side), and persists the
// change. Rejects and reverts the visible selects if the pair is invalid,
// instead of silently accepting an impossible combination.
function setBridgeLanguage(bridgeName, options = {}) {
  const target = learningPathState.language;
  if (bridgeName === target) {
    showHomeToast('El idioma puente debe ser diferente del idioma que deseas aprender.');
    if (nativeLanguageSelect) nativeLanguageSelect.value = bridgeNameToCode[currentBridgeLanguage] || 'es';
    const staleBridgeSelect = document.getElementById('pathBridgeSelect');
    if (staleBridgeSelect) staleBridgeSelect.value = currentBridgeLanguage;
    return false;
  }

  currentBridgeLanguage = bridgeName;
  if (nativeLanguageSelect) nativeLanguageSelect.value = bridgeNameToCode[bridgeName] || 'es';
  const bridgeSelect = document.getElementById('pathBridgeSelect');
  if (bridgeSelect) bridgeSelect.value = bridgeName;
  updatePathPairPreview();
  if (options.persist !== false) {
    savePreferences(learningPathState.language, learningPathState.level, bridgeName);
  }
  return true;
}

function updatePathPairPreview() {
  const preview = document.getElementById('pathPairPreview');
  if (!preview) return;
  const targetLabel = languageDisplayNames[learningPathState.language] || learningPathState.language;
  const bridgeLabel = languageDisplayNames[currentBridgeLanguage] || currentBridgeLanguage;
  preview.textContent = `Aprenderás ${targetLabel} con apoyo en ${bridgeLabel}.`;
}

// Only the Spanish translation is real, authored data (lib/seed-lessons.json
// vocabulary is translated into Spanish only, regardless of target
// language - confirmed, there is no per-bridge-language dictionary yet).
// For any other bridge language, label the Spanish text as a reference
// instead of presenting it as a translation into the student's actual
// bridge language - never fabricate a translation that isn't real data.
function resolveVocabTranslation(item, bridgeLanguage = currentBridgeLanguage) {
  if (!item?.translation) return item?.translation || '';
  if (bridgeLanguage === 'spanish') return item.translation;
  return `${item.translation} (referencia en español)`;
}

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
    <li class="mcq-question" data-language="${escapeHtml(languageKey || '')}">
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
      ${lessons.map(lesson => {
        const isPremium = lesson.isFree === false || lesson.accessTier === 'premium';
        return `
        <article class="world-lesson-row">
          <div class="world-lesson-row-tags">
            <span class="lesson-tag lesson-tag-level">${escapeHtml(level)}</span>
            <span class="lesson-tag lesson-tag-skill">${escapeHtml(skillLabel(lesson.skill))}</span>
            <span class="lesson-tag ${isPremium ? 'lesson-tag-premium' : 'lesson-tag-free'}">${isPremium ? 'Premium' : 'Gratis'}</span>
          </div>
          <h5>${escapeHtml(lesson.title || '')}</h5>
          <p>${escapeHtml(lesson.description || lesson.mission || lesson.intro || '')}</p>
          <button class="world-lesson-start" type="button" data-language="${escapeHtml(languageKey)}" data-level="${escapeHtml(level)}" data-lesson-slug="${escapeHtml(lesson.slug || '')}">Iniciar</button>
        </article>
      `;
      }).join('')}
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
              ${vocabulary.slice(0, 6).map(item => `<span><strong>${escapeHtml(item.word)}</strong>${escapeHtml(resolveVocabTranslation(item))}</span>`).join('')}
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
  clearAuthMessages();
  resetSignupPending();
}

function closeAuth() {
  authModal.classList.remove('open');
  authModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

const logoutConfirmModal = document.getElementById('logoutConfirmModal');
let logoutConfirmReturnFocus = null;

function openLogoutConfirm() {
  if (!logoutConfirmModal) return;
  logoutConfirmReturnFocus = document.activeElement;
  logoutConfirmModal.classList.add('open');
  logoutConfirmModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  logoutConfirmModal.querySelector('[data-action="cancel-logout"]')?.focus();
}

function closeLogoutConfirm() {
  if (!logoutConfirmModal) return;
  logoutConfirmModal.classList.remove('open');
  logoutConfirmModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  (logoutConfirmReturnFocus || logoutButton)?.focus();
  logoutConfirmReturnFocus = null;
}

logoutConfirmModal?.addEventListener('click', event => {
  if (event.target === logoutConfirmModal) {
    closeLogoutConfirm();
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'cancel-logout') {
    closeLogoutConfirm();
  } else if (action === 'confirm-logout') {
    closeLogoutConfirm();
    logout();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && logoutConfirmModal?.classList.contains('open')) {
    closeLogoutConfirm();
  }
});

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
  const nextLessonLabel = document.querySelector('.next-lesson-label strong');
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
  if (nextLessonLabel) nextLessonLabel.textContent = nextLesson || 'Listening A1';
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
    // Supabase is the source of truth once signed in: merge it into the
    // local gamification engine so XP/streak/badges survive a logout+login
    // or a fresh browser, instead of only reflecting this device's localStorage.
    window.AndergoGamification?.syncFromServer(data);
  } catch (error) {
    console.warn('Could not load backend progress', error);
  }
}

// Returns the signed-in user's saved language/level, or null for guests or
// on any failure - callers keep using learningPathState's current defaults
// in that case, so a failed fetch never blocks navigation.
async function loadPreferences() {
  if (!authStatus.session?.access_token) return null;
  try {
    const response = await fetch(`${backendBaseUrl}/api/preferences`, { headers: authHeaders() });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    if (!data?.language || !data?.level) return null;
    return { language: data.language, level: data.level, bridgeLanguage: data.bridgeLanguage || 'spanish' };
  } catch (error) {
    console.warn('Could not load saved preferences', error);
    return null;
  }
}

function applyPreferencesToSelects(preferences) {
  if (!preferences) return;
  const languageSelect = document.getElementById('pathLanguageSelect');
  const levelSelect = document.getElementById('pathLevelSelect');
  const bridgeSelect = document.getElementById('pathBridgeSelect');
  if (languageSelect) languageSelect.value = preferences.language;
  if (levelSelect) levelSelect.value = preferences.level;
  if (bridgeSelect) bridgeSelect.value = preferences.bridgeLanguage || 'spanish';
  currentBridgeLanguage = preferences.bridgeLanguage || 'spanish';
  if (nativeLanguageSelect) nativeLanguageSelect.value = bridgeNameToCode[currentBridgeLanguage] || 'es';
  updatePathPairPreview();
}

// Fire-and-forget: the dropdowns already reflect the choice locally, so a
// failed save shouldn't interrupt the student's navigation. bridgeLanguage
// is optional - omitting it (undefined) drops the key from the JSON body,
// so the backend leaves that field unchanged.
function savePreferences(language, level, bridgeLanguage) {
  if (!authStatus.session?.access_token) return;
  fetch(`${backendBaseUrl}/api/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ language, level, bridgeLanguage })
  }).catch(error => console.warn('Could not save preferences', error));
}

function renderDashboardStats(data) {
  const grid = document.getElementById('dashboardStatsGrid');
  if (!grid) return;
  const langLabel = languageDisplayNames[data.preferences?.language] || data.preferences?.language || '—';
  const stats = [
    ['Idioma', escapeHtml(langLabel)],
    ['Nivel', escapeHtml(data.preferences?.level || '—')],
    ['Progreso', `${data.progress}%`],
    ['XP', `${data.xp}`],
    ['Racha actual', `🔥 ${data.streak} días`],
    ['Mejor racha', `🏆 ${data.longestStreak} días`],
    ['Próxima lección', escapeHtml(data.nextLesson || '—')],
    ['Lecciones completadas', `${data.completedLessonsCount}`]
  ];
  grid.innerHTML = stats.map(([label, value]) => `
    <div class="dashboard-stat"><span>${label}</span><strong>${value}</strong></div>
  `).join('');
}

function renderDashboardGoal(goal, preferences) {
  const body = document.getElementById('dashboardGoalBody');
  if (!body) return;

  const goalOptionsHtml = (selectedKey) => Object.entries(goalOptions).map(([key, opt]) =>
    `<option value="${key}" ${key === selectedKey ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`
  ).join('');

  if (!goal) {
    body.innerHTML = `
      <p class="skill-graph-empty">Todavía no tienes un objetivo activo.</p>
      <div class="dashboard-goal-form">
        <select id="dashboardGoalSelect">${goalOptionsHtml('daily')}</select>
        <button type="button" data-goal-action="create">Crear objetivo</button>
      </div>
    `;
    return;
  }

  const label = goalOptions[goal.goalKey]?.label || goal.goalKey;
  const dateFormat = { day: 'numeric', month: 'short', year: 'numeric' };
  const createdText = new Date(goal.selectedAt).toLocaleDateString('es', dateFormat);
  const completedText = goal.completedAt ? new Date(goal.completedAt).toLocaleDateString('es', dateFormat) : null;
  const langLabel = languageDisplayNames[preferences?.language] || preferences?.language || '—';

  body.innerHTML = `
    <div data-goal-id="${escapeHtml(goal.id)}">
      <p class="dashboard-goal-label">${goal.completedAt ? '✅' : '🎯'} <strong>${escapeHtml(label)}</strong></p>
      <p class="dashboard-goal-meta">Creado el ${createdText}${completedText ? ` · Completado el ${completedText}` : ''}</p>
      <p class="dashboard-goal-meta">Idioma y nivel: ${escapeHtml(langLabel)} · ${escapeHtml(preferences?.level || '—')}</p>
      <div class="dashboard-goal-form" data-goal-edit-form hidden>
        <select id="dashboardGoalSelect">${goalOptionsHtml(goal.goalKey)}</select>
        <button type="button" data-goal-action="save-edit">Guardar</button>
      </div>
      <div class="dashboard-goal-actions">
        <button type="button" data-goal-action="edit">Editar</button>
        ${goal.completedAt ? '' : '<button type="button" data-goal-action="complete">Marcar como completado</button>'}
        <button type="button" data-goal-action="delete">Eliminar</button>
      </div>
    </div>
  `;
}

function renderDashboardActivity(activity) {
  const list = document.getElementById('dashboardActivityList');
  if (!list) return;

  if (!activity || activity.length === 0) {
    list.innerHTML = '<li class="skill-graph-empty">Aún no tienes actividad reciente. Completa tu primera lección para comenzar.</li>';
    return;
  }

  list.innerHTML = activity.map(entry => {
    const date = new Date(entry.at).toLocaleDateString('es', { day: 'numeric', month: 'short' });
    let icon = '📌';
    let text = '';
    if (entry.type === 'lesson_completed') {
      icon = '🎉';
      const xpText = entry.xp ? ` · +${entry.xp} XP` : '';
      text = `Completaste "${escapeHtml(entry.title)}"${xpText}`;
    } else if (entry.type === 'goal_created') {
      icon = '🎯';
      text = `Nuevo objetivo: ${escapeHtml(goalOptions[entry.goalKey]?.label || entry.goalKey)}`;
    } else if (entry.type === 'goal_completed') {
      icon = '✅';
      text = `Objetivo completado: ${escapeHtml(goalOptions[entry.goalKey]?.label || entry.goalKey)}`;
    }
    return `<li class="dashboard-activity-item"><span class="dashboard-activity-icon">${icon}</span><span class="dashboard-activity-text">${text}</span><span class="dashboard-activity-date">${date}</span></li>`;
  }).join('');
}

function renderDashboardLoading() {
  const grid = document.getElementById('dashboardStatsGrid');
  if (grid) grid.innerHTML = '<p class="skill-graph-empty">Cargando tu panel…</p>';
  const goalBody = document.getElementById('dashboardGoalBody');
  if (goalBody) goalBody.innerHTML = '<p class="skill-graph-empty">Cargando tu objetivo…</p>';
  const activityList = document.getElementById('dashboardActivityList');
  if (activityList) activityList.innerHTML = '<li class="skill-graph-empty">Cargando actividad…</li>';
}

function renderDashboardError() {
  const grid = document.getElementById('dashboardStatsGrid');
  if (grid) grid.innerHTML = '<p class="skill-graph-empty">No se pudo cargar tu panel. Intenta recargar la página.</p>';
}

let dashboardPreferences = null;

function renderDashboard(data) {
  const section = document.getElementById('student-dashboard');
  if (!section) return;

  if (!data) {
    section.hidden = true;
    dashboardPreferences = null;
    return;
  }

  section.hidden = false;
  dashboardPreferences = data.preferences;
  renderDashboardStats(data);
  renderDashboardGoal(data.goal, data.preferences);
  renderDashboardActivity(data.activity);
}

// Never throws - a failed load just leaves the panel showing its error state,
// it doesn't block anything else on the page (same convention as loadProgress).
async function loadDashboard() {
  if (!authStatus.session?.access_token) {
    renderDashboard(null);
    return;
  }

  const section = document.getElementById('student-dashboard');
  if (section) section.hidden = false;
  renderDashboardLoading();

  try {
    const response = await fetch(`${backendBaseUrl}/api/dashboard`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    renderDashboard(data);
  } catch (error) {
    console.warn('Could not load dashboard', error);
    renderDashboardError();
  }
}

document.getElementById('dashboardGoalBody')?.addEventListener('click', async event => {
  const button = event.target.closest('[data-goal-action]');
  if (!button) return;
  const action = button.dataset.goalAction;
  const container = button.closest('[data-goal-id]');
  const goalId = container?.dataset.goalId;
  const select = document.getElementById('dashboardGoalSelect');

  try {
    if (action === 'create') {
      await fetch(`${backendBaseUrl}/api/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ goalKey: select?.value || 'daily' })
      });
      showHomeToast('Objetivo creado.');
    } else if (action === 'edit') {
      container?.querySelector('[data-goal-edit-form]')?.removeAttribute('hidden');
      return;
    } else if (action === 'save-edit') {
      await fetch(`${backendBaseUrl}/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ goalKey: select?.value })
      });
      showHomeToast('Objetivo actualizado.');
    } else if (action === 'complete') {
      await fetch(`${backendBaseUrl}/api/goals/${goalId}/complete`, {
        method: 'POST',
        headers: authHeaders()
      });
      showHomeToast('¡Objetivo marcado como completado!');
    } else if (action === 'delete') {
      if (!window.confirm('¿Eliminar tu objetivo actual?')) return;
      await fetch(`${backendBaseUrl}/api/goals/${goalId}`, { method: 'DELETE', headers: authHeaders() });
      activeGoal = 'daily';
      localStorage.removeItem(getGoalStorageKey());
      renderGoalState();
      showHomeToast('Objetivo eliminado.');
    }
    await syncGoalFromServer();
    await loadDashboard();
  } catch (error) {
    console.warn('Could not update goal', error);
    showHomeToast('No se pudo actualizar el objetivo. Intenta de nuevo.');
  }
});

// Scoped to the currently active form - #loginForm and #signupForm each have
// their own .auth-note, and only one is visible (.auth-form.active) at a
// time. An unscoped querySelector('.auth-note') always grabs the login
// form's note (first in the DOM) even while the signup tab is showing,
// silently writing register errors into a hidden element.
function setAuthMessage(message, isError = false) {
  const note = document.querySelector('.auth-form.active .auth-note');
  if (!note) return;
  note.textContent = message;
  note.style.color = isError ? '#dc2626' : '#0f766e';
}

function clearAuthMessages() {
  document.querySelectorAll('.auth-form .auth-note').forEach(note => {
    note.textContent = note.dataset.defaultText || '';
    note.style.color = '';
  });
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
    renderDashboard(null);
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

        // Pending email confirmation is not a signed-in state: no session,
        // no dashboard/progress load, modal stays open showing the pending
        // screen instead of closing.
        if (isSignup && data.requiresEmailConfirmation) {
          showSignupPending(payload.email);
          return;
        }

        saveSession(data.user, data.session);
        setAuthMessage(`Bienvenido${authStatus.user?.name ? `, ${authStatus.user.name}` : ''}!`, false);
        await loadProgress();
        const preferences = await loadPreferences();
        applyPreferencesToSelects(preferences);
        await loadLearningPath(preferences || {});
        closeAuth();
      } catch (error) {
        setAuthMessage(error.message, true);
      }
    });
  });
}

let lastSignupEmail = '';

function showSignupPending(email) {
  lastSignupEmail = email;
  const fields = document.querySelector('#signupForm .signup-fields');
  const pending = document.getElementById('signupPending');
  if (fields) fields.hidden = true;
  if (pending) {
    pending.hidden = false;
    const messageEl = pending.querySelector('.signup-pending-message');
    if (messageEl) {
      messageEl.textContent = `Te enviamos un enlace de confirmación a ${email}. Revisa también la carpeta de spam.`;
    }
  }
}

function resetSignupPending() {
  const fields = document.querySelector('#signupForm .signup-fields');
  const pending = document.getElementById('signupPending');
  if (fields) fields.hidden = false;
  if (pending) pending.hidden = true;
}

document.getElementById('signupPending')?.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  if (button.dataset.action === 'go-to-login') {
    resetSignupPending();
    openModal('login');
    // Carry the email over (never the password) so the student doesn't
    // have to retype it - it's the same address they just registered with.
    const loginEmailInput = document.querySelector('#loginForm input[type="email"]');
    if (loginEmailInput) loginEmailInput.value = lastSignupEmail;
    return;
  }

  if (button.dataset.action === 'resend-confirmation') {
    button.disabled = true;
    try {
      const response = await fetch(`${backendBaseUrl}/api/auth/resend-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lastSignupEmail })
      });
      // The backend's message is always the same neutral "if this account
      // exists" text (by design, to avoid revealing whether an email is
      // registered) - it can't tell success and self-throttling apart, so
      // that distinction is made here from the HTTP status instead. Hitting
      // this endpoint's own rate limit doesn't leak anything about the
      // account, unlike the "does it exist" question, so it's safe to be
      // specific about it.
      if (response.status === 429) {
        showHomeToast('Has solicitado varios correos. Espera unos minutos antes de intentarlo nuevamente.');
      } else if (response.ok) {
        showHomeToast('Correo reenviado. Revisa tu bandeja de entrada y la carpeta de spam.');
      } else {
        showHomeToast('No se pudo reenviar el correo. Intenta de nuevo más tarde.');
      }
    } catch (error) {
      console.warn('Could not resend confirmation email', error);
      showHomeToast('No se pudo reenviar el correo. Intenta de nuevo más tarde.');
    } finally {
      button.disabled = false;
    }
  }
});

const learningPathState = {
  lessons: [],
  activeSlug: null,
  language: 'english',
  level: 'A1',
  // Practice results recorded locally as the student answers, keyed by
  // lesson slug -> exercise index -> { selectedOption } | { practiced: true }.
  // Only used to drive the UI (which exercises are left, when "Completar"
  // unlocks); the backend re-grades everything from scratch on submit and
  // never trusts this client-side copy.
  exerciseResults: {}
};

function getExerciseProgress(lesson) {
  const total = lesson.exercises?.length || 0;
  const results = learningPathState.exerciseResults[lesson.slug] || {};
  const attempted = Object.keys(results).length;
  return { total, attempted, allAttempted: total === 0 || attempted >= total };
}

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

function appendTutorMessage(container, role, text, { isError = false } = {}) {
  if (!container) return;
  const message = document.createElement('div');
  message.className = `tutor-message tutor-message--${role}${isError ? ' tutor-message--error' : ''}`;

  const label = document.createElement('span');
  label.className = 'tutor-message-label';
  label.textContent = role === 'user' ? 'Tú' : 'Tutor AI';

  const body = document.createElement('p');
  body.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');

  message.append(label, body);
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

// Course-backed lessons (normalized schema, e.g. English A1) send options as
// { id, text } and exercises with a real id. Legacy content_json lessons send
// options as plain strings and have no exercise id at all. These helpers let
// the rendering/answer code handle both shapes without caring which one it got.
function optionLabel(option) {
  return option && typeof option === 'object' ? option.text : option;
}

function optionKey(option, optionIndex) {
  return option && typeof option === 'object' ? option.id : optionIndex;
}

function authHeaders() {
  return authStatus.session?.access_token
    ? { Authorization: `Bearer ${authStatus.session.access_token}` }
    : {};
}

// Selects a lesson in the learning path and, for signed-in users, tells the
// backend it was opened (POST /api/lessons/:slug/start marks it in_progress
// in user_lesson_progress). Fire-and-forget: 404s for lessons not yet on the
// normalized courses schema, and guests just get the local UI update.
function openLesson(slug) {
  if (!slug) return;
  learningPathState.activeSlug = slug;
  renderLearningPath();
  if (authStatus.session?.access_token) {
    fetch(`${backendBaseUrl}/api/lessons/${slug}/start`, {
      method: 'POST',
      headers: authHeaders()
    }).catch(() => {});
  }
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
      openLesson(nodeEl.dataset.lessonSlug);
      nodeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}

function renderLessonExercise(item, index, lesson) {
  const recorded = learningPathState.exerciseResults[lesson.slug]?.[index];

  if (item.type === 'mcq' && Array.isArray(item.options)) {
    const optionsHtml = item.options.map((option, optionIndex) => {
      const key = optionKey(option, optionIndex);
      const isChosen = recorded && String(recorded.selectedOption) === String(key);
      const cls = isChosen ? (recorded.correct ? 'correct' : 'incorrect') : '';
      const disabled = recorded ? 'disabled' : '';
      return `<button type="button" class="mcq-option ${cls}" data-option-key="${escapeHtml(String(key))}" data-option-index="${optionIndex}" ${disabled}>${escapeHtml(optionLabel(option))}</button>`;
    }).join('');
    const answeredClass = recorded ? `answered ${recorded.correct ? 'is-correct' : 'is-incorrect'}` : '';
    const feedbackText = recorded ? (recorded.correct ? '¡Correcto! +5 XP' : 'No es correcto, pero sigue intentando.') : '';
    return `
      <div class="mcq-question lesson-exercise ${answeredClass}" data-exercise-index="${index}" data-exercise-id="${escapeHtml(item.id || '')}" data-lesson-slug="${escapeHtml(lesson.slug || '')}" data-skill="${escapeHtml(lesson.skill || '')}" data-language="${escapeHtml(learningPathState.language)}">
        <strong>${index + 1}. ${escapeHtml(item.prompt)}</strong>
        <div class="mcq-options">${optionsHtml}</div>
        <span class="mcq-feedback" aria-live="polite">${feedbackText}</span>
      </div>
    `;
  }

  return `
    <div class="lesson-exercise open-exercise" data-exercise-index="${index}" data-exercise-id="${escapeHtml(item.id || '')}" data-lesson-slug="${escapeHtml(lesson.slug || '')}" data-skill="${escapeHtml(lesson.skill || item.type || '')}" data-language="${escapeHtml(learningPathState.language)}">
      <strong>${index + 1}. ${escapeHtml(item.prompt)}</strong>
      <button type="button" class="practice-mark-btn" ${recorded ? 'disabled' : ''}>${recorded ? '✅ Practicado' : 'Marcar como practicado'}</button>
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
      <span>${escapeHtml(resolveVocabTranslation(item))} · ${escapeHtml(item.example)}</span>
    </div>
  `).join('') || '';

  const dialogue = lesson.dialogue?.map(item => `
    <div>
      <strong>${escapeHtml(item.speaker)}: ${escapeHtml(item.line)}</strong>
      <span>${escapeHtml(resolveVocabTranslation(item))}</span>
    </div>
  `).join('') || '';

  const audioPlayer = (lesson.skill === 'listening' && lesson.audioUrl)
    ? `<audio class="lesson-audio-player" controls preload="none" src="${escapeHtml(lesson.audioUrl)}">
        Tu navegador no soporta audio HTML5.
      </audio>`
    : '';

  const exercises = lesson.locked ? `
    <div class="premium-lock-box">
      <strong>🔒 Lección premium</strong>
      <span>Desbloquea esta lección y la ruta completa con el único plan: USD ${premiumPriceUsd}.</span>
      <button type="button" class="primary-btn upgrade-btn">Desbloquear por USD ${premiumPriceUsd}</button>
    </div>
  ` : (lesson.exercises?.map((item, index) => renderLessonExercise(item, index, lesson)).join('') || '');

  workspace.querySelector('.lesson-kicker').textContent = `${lesson.level} · ${lesson.skill}`;
  workspace.querySelector('h3').textContent = lesson.title;
  workspace.querySelector('.lesson-intro').textContent = lesson.intro || lesson.description || '';
  const audioContainer = workspace.querySelector('.lesson-audio');
  if (audioContainer) audioContainer.innerHTML = audioPlayer;
  workspace.querySelector('.lesson-vocabulary').innerHTML = vocabulary;
  workspace.querySelector('.lesson-dialogue').innerHTML = dialogue;
  workspace.querySelector('.lesson-exercises').innerHTML = exercises;

  const completeButton = workspace.querySelector('.lesson-complete-btn');
  if (completeButton) {
    completeButton.dataset.lessonSlug = lesson.slug;

    if (lesson.locked) {
      completeButton.disabled = true;
      completeButton.dataset.mode = 'locked';
      completeButton.textContent = `Premium USD ${premiumPriceUsd}`;
    } else if (lesson.completed) {
      completeButton.disabled = true;
      completeButton.dataset.mode = 'completed';
      completeButton.textContent = 'Completada';
    } else {
      const { total, attempted, allAttempted } = getExerciseProgress(lesson);
      completeButton.disabled = false;
      if (allAttempted) {
        completeButton.dataset.mode = 'complete';
        completeButton.textContent = 'Completar';
      } else {
        completeButton.dataset.mode = 'practice';
        completeButton.textContent = attempted > 0 ? `Iniciar práctica (${attempted}/${total})` : 'Iniciar práctica';
      }
    }
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

  const completeButton = document.querySelector('.lesson-complete-btn');

  // "Iniciar práctica" mode: nothing to submit yet - just point the student
  // at the exercises. The button only switches to "Completar" once every
  // exercise has been attempted (see getExerciseProgress / renderLessonWorkspace).
  if (completeButton?.dataset.mode === 'practice') {
    document.querySelector('.lesson-exercises')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showHomeToast('Responde los ejercicios de la lección para poder completarla.');
    return;
  }

  if (!authStatus.session?.access_token) {
    setAuthMessage('Crea tu cuenta gratis para guardar el progreso de la lección.');
    openModal('signup');
    return;
  }

  if (completeButton) {
    completeButton.disabled = true;
    completeButton.textContent = 'Guardando...';
  }

  const recordedResults = learningPathState.exerciseResults[activeLesson.slug] || {};
  const answers = Object.entries(recordedResults).map(([index, result]) => {
    const exerciseId = activeLesson.exercises?.[Number(index)]?.id;
    return exerciseId
      ? { exerciseId, selectedOptionId: result.selectedOption, practiced: result.practiced }
      : { index: Number(index), selectedOption: result.selectedOption, practiced: result.practiced };
  });

  try {
    const response = await fetch(`${backendBaseUrl}/api/lessons/${activeLesson.slug}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ answers })
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
      score: data.score ?? 100,
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
    renderLessonWorkspace();
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

logoutButton?.addEventListener('click', openLogoutConfirm);

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

const brandLink = document.querySelector('.brand');
brandLink?.addEventListener('click', event => {
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.pushState(null, '', '/');
  }
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
    case 'view-progress':
      document.getElementById('achievements')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showHomeToast('Aquí puedes ver tu progreso, insignias y misiones.');
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
    case 'explore-languages':
      revealSection('#language-picker', { scroll: true });
      showHomeToast('Elige un idioma para ver su ruta completa.');
      break;
    case 'explore-english':
      revealSection('#languages', { scroll: false });
      activateLanguageTab('english', { scroll: true, updateHash: true });
      break;
    case 'explore-frances':
      revealSection('#languages', { scroll: false });
      activateLanguageTab('frances', { scroll: true, updateHash: true });
      break;
    case 'explore-italiano':
      revealSection('#languages', { scroll: false });
      activateLanguageTab('italiano', { scroll: true, updateHash: true });
      break;
    case 'explore-espanol':
      revealSection('#languages', { scroll: false });
      activateLanguageTab('espanol', { scroll: true, updateHash: true });
      break;
    case 'explore-deutsch':
      revealSection('#languages', { scroll: false });
      activateLanguageTab('deutsch', { scroll: true, updateHash: true });
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

  document.querySelectorAll('.skill-competency-card').forEach(card => {
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
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

    const startLessonButton = event.target.closest('.world-lesson-start');
    if (startLessonButton) {
      const language = startLessonButton.dataset.language || currentTargetLanguage;
      const level = startLessonButton.dataset.level || learningPathState.level;
      const lessonSlug = startLessonButton.dataset.lessonSlug;
      const languageSelect = document.getElementById('pathLanguageSelect');
      const levelSelect = document.getElementById('pathLevelSelect');
      if (languageSelect) languageSelect.value = language;
      if (levelSelect) levelSelect.value = level;
      revealSection('#learning-path');
      await loadLearningPath({ language, level });
      if (lessonSlug && learningPathState.lessons.some(item => item.slug === lessonSlug)) {
        openLesson(lessonSlug);
      }
      document.getElementById('lessonWorkspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const skillCompetencyCard = event.target.closest('.skill-competency-card');
    if (skillCompetencyCard) {
      const skill = skillCompetencyCard.dataset.skill;
      revealSection('#learning-path');
      if (!learningPathState.lessons.length) {
        await loadLearningPath({ language: learningPathState.language, level: learningPathState.level });
      }
      const matchingLesson = learningPathState.lessons.find(item => item.skill?.toLowerCase() === skill);
      if (matchingLesson) {
        openLesson(matchingLesson.slug);
      }
      document.getElementById('lessonWorkspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      const slug = questionItem?.dataset.lessonSlug;
      if (!questionItem || questionItem.classList.contains('answered') || mcqOption.disabled || !slug) return;

      const exerciseIndex = Number(questionItem.dataset.exerciseIndex);
      const exerciseId = questionItem.dataset.exerciseId || '';
      const chosenKey = mcqOption.dataset.optionKey;
      const feedback = questionItem.querySelector('.mcq-feedback');

      questionItem.querySelectorAll('.mcq-option').forEach(option => { option.disabled = true; });
      if (feedback) feedback.textContent = 'Comprobando...';

      try {
        const payload = exerciseId
          ? { exerciseId, selectedOptionId: chosenKey }
          : { index: exerciseIndex, selectedOption: Number(chosenKey) };
        const response = await fetch(`${backendBaseUrl}/api/lessons/${slug}/check-answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'No se pudo verificar la respuesta.');

        learningPathState.exerciseResults[slug] = learningPathState.exerciseResults[slug] || {};
        learningPathState.exerciseResults[slug][exerciseIndex] = { selectedOption: chosenKey, correct: Boolean(data.correct) };

        if (data.correct) {
          window.AndergoGamification?.recordCorrectAnswer();
          window.AndergoGamification?.recordSkillTouched(questionItem.dataset.skill, questionItem.dataset.language || currentTargetLanguage);
        }
      } catch (error) {
        if (feedback) feedback.textContent = error.message || 'No se pudo verificar la respuesta.';
        questionItem.querySelectorAll('.mcq-option').forEach(option => { option.disabled = false; });
        return;
      }

      renderLessonWorkspace();
      return;
    }

    const practiceButton = event.target.closest('.practice-mark-btn');
    if (practiceButton) {
      const exerciseBlock = practiceButton.closest('.open-exercise');
      const slug = exerciseBlock?.dataset.lessonSlug;
      if (practiceButton.disabled || !slug) return;

      const exerciseIndex = Number(exerciseBlock.dataset.exerciseIndex);
      learningPathState.exerciseResults[slug] = learningPathState.exerciseResults[slug] || {};
      learningPathState.exerciseResults[slug][exerciseIndex] = { practiced: true };

      window.AndergoGamification?.recordCorrectAnswer();
      window.AndergoGamification?.recordSkillTouched(exerciseBlock.dataset.skill, exerciseBlock.dataset.language || currentTargetLanguage);

      renderLessonWorkspace();
      return;
    }

    const tutorClearButton = event.target.closest('.tutor-clear-btn');
    if (tutorClearButton) {
      const conversation = document.getElementById('tutorConversation');
      if (conversation) {
        conversation.innerHTML = '<p class="tutor-welcome">👋 Soy Tutor AI. Pregúntame lo que quieras sobre esta habilidad, nivel o lección, y te ayudo con correcciones, ejemplos y práctica.</p>';
      }
      return;
    }

    const tutorButton = event.target.closest('.tutor-chat-btn');
    if (tutorButton) {
      const card = tutorButton.closest('.language-card');
      const conversation = document.getElementById('tutorConversation');
      const thinking = document.getElementById('tutorThinking');
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
      if (!finalPrompt) return;

      appendTutorMessage(conversation, 'user', finalPrompt);
      if (tutorPrompt) tutorPrompt.value = '';
      if (thinking) thinking.hidden = false;
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
        appendTutorMessage(conversation, 'tutor', data.reply || '');
      } catch (error) {
        appendTutorMessage(conversation, 'tutor', error.message || 'No se pudo conectar con el tutor IA.', { isError: true });
      } finally {
        if (thinking) thinking.hidden = true;
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
  const bridgeSelect = document.getElementById('pathBridgeSelect');

  languageSelect?.addEventListener('change', () => {
    const language = languageSelect.value;
    if (language === currentBridgeLanguage) {
      showHomeToast('El idioma puente debe ser diferente del idioma que deseas aprender.');
      languageSelect.value = learningPathState.language;
      return;
    }
    const level = levelSelect?.value || learningPathState.level;
    loadLearningPath({ language, level });
    savePreferences(language, level);
    updatePathPairPreview();
  });
  levelSelect?.addEventListener('change', () => {
    const language = languageSelect?.value || learningPathState.language;
    const level = levelSelect.value;
    loadLearningPath({ language, level });
    savePreferences(language, level);
  });
  bridgeSelect?.addEventListener('change', () => {
    setBridgeLanguage(bridgeSelect.value);
  });
}

function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.section-heading, .features-grid article, .plan, .missions-panel, .badges-panel, .goal-card, .download-box, .course-card'
  );
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  elements.forEach((el, index) => {
    el.classList.add('reveal-on-scroll');
    el.style.transitionDelay = `${(index % 4) * 60}ms`;
    observer.observe(el);
  });
}

enableHomepageActions();
loadProgress();
setupLearningPathControls();
initScrollReveal();
document.querySelector('.lesson-complete-btn')?.addEventListener('click', completeActiveLesson);

// Waits for the signed-in user's saved language/level (if any) before the
// first render, so the learning path never flashes English A1 and then
// jumps to the real preference a moment later.
(async function bootstrapLearningPath() {
  const preferences = await loadPreferences();
  applyPreferencesToSelects(preferences);
  await loadLearningPath(preferences || {});
})();

document.getElementById('aiTutorPrompt')?.addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.shiftKey) return;
  event.preventDefault();
  event.target.closest('.tutor-action')?.querySelector('.tutor-chat-btn')?.click();
});
