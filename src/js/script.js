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
const bridgeCodeToName = {
  es: 'spanish',
  en: 'english',
  fr: 'french',
  it: 'italian',
  de: 'german'
};
const bridgeNameToCode = {
  spanish: 'es',
  english: 'en',
  french: 'fr',
  italian: 'it',
  german: 'de'
};

const premiumPriceUsd = '5.95';

const targetLanguageMap = {
  english: 'english',
  espanol: 'spanish',
  frances: 'french',
  italiano: 'italian',
  deutsch: 'german',
  'ai-tutor': 'ai'
};

const authModal = document.getElementById('authModal');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
document.querySelectorAll('.auth-form .auth-note').forEach((note) => {
  note.dataset.defaultText = note.textContent;
});
const authTriggers = document.querySelectorAll('[data-action="open-auth"]');
const closeModal = document.querySelector('.close-modal');
const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.getElementById('siteMenu');
const userChip = document.querySelector('.user-chip');
const logoutButton = document.querySelector('.logout-btn');
const backendBaseUrl =
  typeof window !== 'undefined' && window.location.protocol === 'file:'
    ? 'http://127.0.0.1:3000'
    : '';
const authStatus = {
  user: null,
  session: null
};

// Holds the aal1 session while a second factor is pending, in memory only -
// never written to localStorage/authStatus, since it isn't a valid signed-in
// session yet (see the login handler and the mfaChallengeForm submit below).
let pendingMfa = null;

function clearPendingMfa() {
  pendingMfa = null;
}

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

let currentProgress = 0;

function gamificationKeyFor(user) {
  return user?.id || user?.email || 'guest';
}

function saveSession(user, session) {
  authStatus.user = user || null;
  authStatus.session = session || null;
  renderAuthState();
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
  loadDashboard();
  window.AndergoGamification?.load(gamificationKeyFor(authStatus.user));
}

// The backend's user.name is upstream data we don't control here - if it's
// malformed (e.g. truncated to something like "aos") this guard keeps it off
// screen instead of rendering "Hola, aos": falls back to the email's local
// part, and to an empty string (bare "Hola", no dangling comma) if that's
// missing too.
function getDisplayName() {
  const rawName = authStatus.user?.name;
  const looksLikeName =
    typeof rawName === 'string' && /^[\p{L}][\p{L}\s'-]{1,49}$/u.test(rawName.trim());
  if (looksLikeName) return rawName.trim();
  return authStatus.user?.email?.split('@')[0] || '';
}

function renderAuthState() {
  const isSignedIn = Boolean(authStatus.session?.access_token);
  const name = getDisplayName();

  if (userChip) {
    userChip.hidden = !isSignedIn;
    userChip.textContent = isSignedIn ? (name ? `Hola, ${name}` : 'Hola') : '';
  }

  if (logoutButton) logoutButton.hidden = !isSignedIn;

  authTriggers.forEach((trigger) => {
    trigger.hidden = isSignedIn;
  });

  document.querySelectorAll('.nav-group-visitor').forEach((group) => {
    group.hidden = isSignedIn;
  });
  document.querySelectorAll('.nav-group-member').forEach((group) => {
    group.hidden = !isSignedIn;
  });

  const greeting = document.querySelector('.student-greeting');
  if (greeting) {
    greeting.textContent = isSignedIn
      ? name
        ? `${name}, esta es tu ruta personalizada.`
        : 'Esta es tu ruta personalizada.'
      : 'Inicia sesión para ver tu progreso, racha y objetivo.';
  }
}

nativeLanguageSelect?.addEventListener('change', (event) => {
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
    if (nativeLanguageSelect)
      nativeLanguageSelect.value = bridgeNameToCode[currentBridgeLanguage] || 'es';
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
  const targetLabel =
    languageDisplayNames[learningPathState.language] || learningPathState.language;
  const bridgeLabel = languageDisplayNames[currentBridgeLanguage] || currentBridgeLanguage;
  preview.textContent = `Aprenderás ${targetLabel} con apoyo en ${bridgeLabel}.`;
}

// Accepts either a real language key (english/spanish/french/italian/german,
// as used by #pathLanguageSelect) or the older tab-id spelling used by the
// home language cards (frances/espanol/italiano/deutsch) and normalizes both
// to the same key, so every caller feeds the same canonical value into
// learningPathState.language - the single field updatePathPairPreview reads.
// This is the fix for the "Aprenderás English..." bug: previously the home
// cards and #languages tabs only ever updated the separate
// currentTargetLanguage variable, never learningPathState.language.
function normalizeLanguageKey(lang) {
  if (lang && languageDisplayNames[lang] && lang !== 'ai') return lang;
  return targetLanguageMap[lang] || lang;
}

function setTargetLanguage(lang, options = {}) {
  const resolved = normalizeLanguageKey(lang);
  if (!resolved || !languageDisplayNames[resolved] || resolved === 'ai') return false;

  if (resolved === currentBridgeLanguage) {
    showHomeToast('El idioma puente debe ser diferente del idioma que deseas aprender.');
    return false;
  }

  // recognition.lang is fixed for the life of a SpeechRecognition instance -
  // a language switch mid-dictation would otherwise keep listening in the
  // old language.
  stopTutorDictation();

  currentTargetLanguage = resolved;
  learningPathState.language = resolved;

  const pathLanguageSelect = document.getElementById('pathLanguageSelect');
  if (pathLanguageSelect) pathLanguageSelect.value = resolved;

  const level = options.level || learningPathState.level;
  loadLearningPath({ language: resolved, level });
  updatePathPairPreview();
  updateAiTutorContext();
  if (options.persist !== false) savePreferences(resolved, level, currentBridgeLanguage);
  return true;
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
  const optionsHtml = options
    .map(
      (option, optionIndex) => `
    <button type="button" class="mcq-option" data-option-index="${optionIndex}">${escapeHtml(option)}</button>
  `
    )
    .join('');

  return `
    <li class="mcq-question" data-language="${escapeHtml(languageKey || '')}">
      <strong>${index + 1}.</strong> ${escapeHtml(question.q || '')}
      <div class="mcq-options">${optionsHtml}</div>
      <span class="mcq-feedback" aria-live="polite"></span>
    </li>
  `;
}

function getLanguageTabFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return null;

  const normalized = hash.startsWith('language-') ? hash.replace('language-', '') : hash;
  return targetLanguageMap[normalized] ? normalized : null;
}

let authModalReturnFocus = null;

function openModal(panel) {
  authModalReturnFocus = document.activeElement;
  authModal.classList.add('open');
  authModal.setAttribute('aria-hidden', 'false');
  authModal.removeAttribute('inert');
  document.body.classList.add('modal-open');
  authTabs.forEach((tab) => {
    const active = tab.dataset.form === panel;
    tab.classList.toggle('active', active);
  });
  authForms.forEach((form) => {
    form.classList.toggle('active', form.id === `${panel}Form`);
  });
  // "forgotPassword" and "mfaChallenge" aren't real tabs (reached via a link
  // or automatically after login, not .auth-tabs) - hide the tab row
  // entirely while either is open instead of showing both tabs as unselected.
  document
    .querySelector('.auth-tabs')
    ?.classList.toggle('is-hidden', panel === 'forgotPassword' || panel === 'mfaChallenge');
  clearAuthMessages();
  resetSignupPending();
  authModal.querySelector('.auth-form.active input')?.focus();
}

function closeAuth() {
  authModal.classList.remove('open');
  authModal.setAttribute('aria-hidden', 'true');
  authModal.setAttribute('inert', '');
  document.body.classList.remove('modal-open');
  (authModalReturnFocus || document.querySelector('[data-action="open-auth"]'))?.focus();
  authModalReturnFocus = null;
  clearPendingMfa();
}

const logoutConfirmModal = document.getElementById('logoutConfirmModal');
let logoutConfirmReturnFocus = null;

function openLogoutConfirm() {
  if (!logoutConfirmModal) return;
  logoutConfirmReturnFocus = document.activeElement;
  logoutConfirmModal.classList.add('open');
  logoutConfirmModal.setAttribute('aria-hidden', 'false');
  logoutConfirmModal.removeAttribute('inert');
  document.body.classList.add('modal-open');
  logoutConfirmModal.querySelector('[data-action="cancel-logout"]')?.focus();
}

function closeLogoutConfirm() {
  if (!logoutConfirmModal) return;
  logoutConfirmModal.classList.remove('open');
  logoutConfirmModal.setAttribute('aria-hidden', 'true');
  logoutConfirmModal.setAttribute('inert', '');
  document.body.classList.remove('modal-open');
  (logoutConfirmReturnFocus || logoutButton)?.focus();
  logoutConfirmReturnFocus = null;
}

logoutConfirmModal?.addEventListener('click', (event) => {
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

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (logoutConfirmModal?.classList.contains('open')) {
    closeLogoutConfirm();
  } else if (authModal?.classList.contains('open')) {
    closeAuth();
  } else if (document.getElementById('tutorDrawer')?.classList.contains('open')) {
    closeTutorDrawer();
  } else if (document.getElementById('changeComboPopover')?.hidden === false) {
    closeChangeCombinationPopover();
  }
});

async function postJson(path, payload, { auth = false } = {}) {
  const response = await fetch(`${backendBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {})
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Drives the home hero card's states (spec: never show fake stats to a
// guest, show a loading state while the real numbers are in flight, an
// explicit error state if the fetch fails - never a fabricated 0% that's
// indistinguishable from a real, freshly-signed-up 0% - then the real numbers.
function updateProgressDisplay(
  { progress = 0, streak = 0 } = {},
  isSignedIn = false,
  isLoading = false,
  isError = false
) {
  const normalizedProgress = Math.max(0, Math.min(100, Number(progress) || 0));
  currentProgress = normalizedProgress;
  const progressCircle = document.querySelector('.progress-circle');
  const streakCount = document.querySelector('.streak-flame-count');
  const progressText = document.getElementById('homeProgressText');
  const summaryRow = document.getElementById('homeSummaryRow');
  const goalSummary = document.getElementById('homeGoalSummary');
  const guestActions = document.getElementById('homeGuestActions');
  const continueBtn = document.querySelector('.continue-lesson-btn');
  const name = getDisplayName();

  if (summaryRow) summaryRow.hidden = !isSignedIn;
  if (goalSummary) goalSummary.hidden = !isSignedIn;
  if (guestActions) guestActions.hidden = isSignedIn;
  if (continueBtn) continueBtn.hidden = !isSignedIn;

  if (progressCircle)
    progressCircle.textContent = isLoading || isError ? '…' : `${normalizedProgress}%`;
  if (streakCount) streakCount.textContent = isLoading || isError ? '…' : String(streak);
  if (progressText) {
    progressText.hidden = !isSignedIn;
    if (isSignedIn) {
      if (isLoading) progressText.textContent = 'Cargando tu progreso…';
      else if (isError) progressText.textContent = 'No se pudo cargar tu progreso.';
      else
        progressText.textContent = `${name ? `${name}: ` : ''}${normalizedProgress}% completado · ${streak} días de racha`;
    }
  }
}

async function loadProgress() {
  try {
    if (!authStatus.session?.access_token) {
      updateProgressDisplay();
      return;
    }

    updateProgressDisplay({}, true, true);
    const response = await fetch(`${backendBaseUrl}/api/progress`, {
      headers: {
        Authorization: `Bearer ${authStatus.session.access_token}`
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      updateProgressDisplay({}, true, false, true);
      return;
    }

    updateProgressDisplay(data, true, false);
    // Supabase is the source of truth once signed in: merge it into the
    // local gamification engine so XP/streak/badges survive a logout+login
    // or a fresh browser, instead of only reflecting this device's localStorage.
    window.AndergoGamification?.syncFromServer(data);
  } catch (error) {
    console.warn('Could not load backend progress', error);
    updateProgressDisplay({}, true, false, true);
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
    return {
      language: data.language,
      level: data.level,
      bridgeLanguage: data.bridgeLanguage || 'spanish'
    };
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
  if (nativeLanguageSelect)
    nativeLanguageSelect.value = bridgeNameToCode[currentBridgeLanguage] || 'es';
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
  }).catch((error) => console.warn('Could not save preferences', error));
}

// XP/level/streak have exactly one source of truth: the client-side
// gamification engine (src/js/gamification/*, already reconciled with the
// server via syncFromServer). This line is the only place Progreso shows
// them, so it never disagrees with what Logros shows for the same numbers.
function renderProgressGamificationSummary() {
  const line = document.getElementById('progressGamificationLine');
  if (!line) return;
  const state = window.AndergoGamification?.getState();
  if (!state) {
    line.textContent = '';
    return;
  }
  line.textContent = `Nivel ${state.level} · ${state.xp} XP · 🔥 ${state.streak} días de racha`;
}

function renderDashboardStats(data) {
  const grid = document.getElementById('dashboardStatsGrid');
  if (grid) {
    const langLabel =
      languageDisplayNames[data.preferences?.language] || data.preferences?.language || '—';
    const stats = [
      ['Idioma', escapeHtml(langLabel)],
      ['Nivel', escapeHtml(data.preferences?.level || '—')],
      ['Progreso', `${data.progress}%`],
      ['Próxima lección', escapeHtml(data.nextLesson || '—')],
      ['Lecciones completadas', `${data.completedLessonsCount}`]
    ];
    grid.innerHTML = stats
      .map(
        ([label, value]) => `
      <div class="dashboard-stat"><span>${label}</span><strong>${value}</strong></div>
    `
      )
      .join('');
  }
  renderProgressGamificationSummary();
}

function renderDashboardGoal(goal, preferences) {
  const body = document.getElementById('goalsCrudBody');
  const homeGoalSummary = document.querySelector('#homeGoalSummary strong');

  const goalOptionsHtml = (selectedKey) =>
    Object.entries(goalOptions)
      .map(
        ([key, opt]) =>
          `<option value="${key}" ${key === selectedKey ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`
      )
      .join('');

  if (!goal) {
    if (body) {
      body.innerHTML = `
        <p class="skill-graph-empty">Todavía no tienes un objetivo activo.</p>
        <div class="dashboard-goal-form">
          <select id="dashboardGoalSelect">${goalOptionsHtml('daily')}</select>
          <button type="button" data-goal-action="create">Crear objetivo</button>
        </div>
      `;
    }
    if (homeGoalSummary) homeGoalSummary.textContent = 'Sin objetivo activo';
    return;
  }

  const label = goalOptions[goal.goalKey]?.label || goal.goalKey;
  if (homeGoalSummary) homeGoalSummary.textContent = label;
  if (!body) return;

  const dateFormat = { day: 'numeric', month: 'short', year: 'numeric' };
  const createdText = new Date(goal.selectedAt).toLocaleDateString('es', dateFormat);
  const completedText = goal.completedAt
    ? new Date(goal.completedAt).toLocaleDateString('es', dateFormat)
    : null;
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
    list.innerHTML =
      '<li class="skill-graph-empty">Aún no tienes actividad reciente. Completa tu primera lección para comenzar.</li>';
    return;
  }

  list.innerHTML = activity
    .map((entry) => {
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
    })
    .join('');
}

function renderDashboardLoading() {
  const grid = document.getElementById('dashboardStatsGrid');
  if (grid) grid.innerHTML = '<p class="skill-graph-empty">Cargando tu panel…</p>';
  const goalBody = document.getElementById('goalsCrudBody');
  if (goalBody) goalBody.innerHTML = '<p class="skill-graph-empty">Cargando tu objetivo…</p>';
  const activityList = document.getElementById('dashboardActivityList');
  if (activityList)
    activityList.innerHTML = '<li class="skill-graph-empty">Cargando actividad…</li>';
  // The home hero's goal one-liner is a separate DOM node (renderDashboardGoal
  // only touches it once real data arrives) - without this it would keep
  // showing the static "Sin objetivo activo" placeholder while this loads.
  const homeGoalSummary = document.querySelector('#homeGoalSummary strong');
  if (homeGoalSummary) homeGoalSummary.textContent = 'Cargando…';
}

function renderDashboardError() {
  const grid = document.getElementById('dashboardStatsGrid');
  if (grid)
    grid.innerHTML =
      '<p class="skill-graph-empty">No se pudo cargar tu panel. Intenta recargar la página.</p>';
  const homeGoalSummary = document.querySelector('#homeGoalSummary strong');
  if (homeGoalSummary) homeGoalSummary.textContent = 'No se pudo cargar';
}

function renderDashboardSignedOut() {
  const grid = document.getElementById('dashboardStatsGrid');
  if (grid) grid.innerHTML = '<p class="skill-graph-empty">Inicia sesión para ver tu progreso.</p>';
  const goalBody = document.getElementById('goalsCrudBody');
  if (goalBody)
    goalBody.innerHTML =
      '<p class="skill-graph-empty">Inicia sesión para crear y guardar tu objetivo.</p>';
  const activityList = document.getElementById('dashboardActivityList');
  if (activityList)
    activityList.innerHTML =
      '<li class="skill-graph-empty">Inicia sesión para ver tu actividad.</li>';
  const line = document.getElementById('progressGamificationLine');
  if (line) line.textContent = '';
}

let dashboardPreferences = null;

function renderDashboard(data) {
  if (!data) {
    dashboardPreferences = null;
    renderDashboardSignedOut();
    return;
  }

  dashboardPreferences = data.preferences;
  renderDashboardStats(data);
  renderDashboardGoal(data.goal, data.preferences);
  renderDashboardActivity(data.activity);
}

// Never throws - a failed load just leaves the panel showing its error state,
// it doesn't block anything else on the page (same convention as loadProgress).
// Feeds both #progress (stats/activity) and #goals (goal CRUD), since both
// views need the same /api/dashboard payload - see renderDashboardGoal.
async function loadDashboard() {
  if (!authStatus.session?.access_token) {
    renderDashboard(null);
    return;
  }

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

document.getElementById('goalsCrudBody')?.addEventListener('click', async (event) => {
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
      await fetch(`${backendBaseUrl}/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      showHomeToast('Objetivo eliminado.');
    }
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
  document.querySelectorAll('.auth-form .auth-note').forEach((note) => {
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
    renderAuthState();
    updateProgressDisplay();
    renderDashboard(null);
    window.AndergoGamification?.load('guest');
  }
}

// Shows the "create your username" onboarding once, right after a
// successful login, but only for accounts that predate this feature
// (preferences.username still null) - never blocks anything else.
function maybeShowUsernameOnboarding(preferences) {
  if (preferences?.username) return;
  const modal = document.getElementById('usernameOnboardingModal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  modal.removeAttribute('inert');
  document.body.classList.add('modal-open');
  modal.querySelector('input')?.focus();
}

function closeUsernameOnboarding() {
  const modal = document.getElementById('usernameOnboardingModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('inert', '');
  document.body.classList.remove('modal-open');
}

// Loads the official supabase-js UMD bundle from a CDN - the one exception
// to "the frontend never talks to Supabase directly" (see server.js's
// /api/auth/client-config comment for why this specific screen needs it:
// the password-recovery token Supabase appends to the redirect URL only
// ever reaches the browser, never our backend).
function loadSupabaseJs() {
  if (window.supabase?.createClient) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-supabase-js]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('load failed')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
    script.dataset.supabaseJs = 'true';
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('load failed')));
    document.head.appendChild(script);
  });
}

// Drives /reset-password: the link Supabase emails (via
// authService.requestPasswordReset's resetPasswordForEmail call) lands here
// with a recovery token in the URL that only supabase-js can read and turn
// into a session - our backend never sees it. Everything else in ANDERGO
// goes through our own /api/*; this one screen is the deliberate exception.
async function initResetPasswordPage() {
  const form = document.getElementById('resetPasswordForm');
  const successEl = document.getElementById('resetPasswordSuccess');
  const invalidEl = document.getElementById('resetPasswordInvalid');
  const statusEl = document.getElementById('resetPasswordStatus');
  if (!form || !successEl || !invalidEl) return;

  function showInvalid() {
    form.hidden = true;
    successEl.hidden = true;
    invalidEl.hidden = false;
  }

  let clientConfig;
  try {
    const res = await fetch(`${backendBaseUrl}/api/auth/client-config`);
    clientConfig = await res.json();
  } catch {
    showInvalid();
    return;
  }
  if (!clientConfig?.supabaseUrl || !clientConfig?.supabaseAnonKey) {
    showInvalid();
    return;
  }

  try {
    await loadSupabaseJs();
  } catch {
    showInvalid();
    return;
  }
  if (!window.supabase?.createClient) {
    showInvalid();
    return;
  }

  const client = window.supabase.createClient(
    clientConfig.supabaseUrl,
    clientConfig.supabaseAnonKey
  );
  let recoveryReady = false;

  const revealForm = () => {
    if (recoveryReady) return;
    recoveryReady = true;
    form.hidden = false;
    form.querySelector('input')?.focus();
  };

  client.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') revealForm();
  });

  // Some Supabase configurations establish the recovery session before the
  // listener above attaches - check directly instead of only reacting to
  // the event, and only give up if neither ever shows a session.
  window.setTimeout(async () => {
    if (recoveryReady) return;
    const { data } = await client.auth.getSession();
    if (data?.session) {
      revealForm();
    } else {
      showInvalid();
    }
  }, 2500);

  setupPasswordStrengthMeter('resetNewPassword', 'resetPasswordStrength');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = document.getElementById('resetNewPassword')?.value || '';
    const confirmPassword = document.getElementById('resetConfirmPassword')?.value || '';
    statusEl.classList.remove('is-error');

    if (password !== confirmPassword) {
      statusEl.textContent = 'Las contraseñas no coinciden.';
      statusEl.classList.add('is-error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    statusEl.textContent = '';

    try {
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
      form.hidden = true;
      successEl.hidden = false;
    } catch {
      statusEl.textContent = 'No se pudo actualizar la contraseña. Solicita un nuevo enlace.';
      statusEl.classList.add('is-error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

async function afterAuthSuccess() {
  const welcomeName = getDisplayName();
  setAuthMessage(`Bienvenido${welcomeName ? `, ${welcomeName}` : ''}!`, false);
  await loadProgress();
  const preferences = await loadPreferences();
  applyPreferencesToSelects(preferences);
  await loadLearningPath(preferences || {});
  closeAuth();
  maybeShowUsernameOnboarding(preferences);
}

function attachAuthHandlers() {
  document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const identifier = document.getElementById('loginIdentifier')?.value.trim() || '';
    const password = document.getElementById('loginPassword')?.value || '';

    try {
      const data = await postJson('/api/auth', { action: 'login', identifier, password });
      if (data.requiresMfa) {
        // aal1 only - held in memory until the TOTP code below elevates it
        // to aal2 (mfaService.verifyFactor's session), never saved/shown as
        // a signed-in state.
        pendingMfa = { user: data.user, session: data.session };
        openModal('mfaChallenge');
        return;
      }
      saveSession(data.user, data.session);
      await afterAuthSuccess();
    } catch (error) {
      setAuthMessage(error.message, true);
    }
  });

  document.getElementById('mfaChallengeForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const statusEl = document.getElementById('mfaChallengeStatus');
    const codeInput = document.getElementById('mfaChallengeCode');
    const code = codeInput?.value.trim() || '';
    const submitBtn = event.target.querySelector('button[type="submit"]');

    if (!pendingMfa?.session?.access_token) {
      openModal('login');
      return;
    }

    if (statusEl) {
      statusEl.textContent = '';
      statusEl.classList.remove('is-error');
    }
    if (submitBtn) submitBtn.disabled = true;

    try {
      const authHeader = { Authorization: `Bearer ${pendingMfa.session.access_token}` };
      const factorsResponse = await fetch(`${backendBaseUrl}/api/mfa/factors`, {
        headers: authHeader
      });
      const factorsData = await factorsResponse.json().catch(() => ({}));
      const activeFactor = factorsData.totp?.find((factor) => factor.status === 'verified');
      if (!factorsResponse.ok || !activeFactor) {
        throw new Error('No se pudo iniciar la verificación en dos pasos.');
      }

      const challengeResponse = await fetch(`${backendBaseUrl}/api/mfa/totp/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ factorId: activeFactor.id })
      });
      const challengeData = await challengeResponse.json().catch(() => ({}));
      if (!challengeResponse.ok || !challengeData.challengeId) {
        throw new Error(challengeData.message || 'No se pudo generar el desafío de verificación.');
      }

      const verifyResponse = await fetch(`${backendBaseUrl}/api/mfa/totp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          factorId: activeFactor.id,
          challengeId: challengeData.challengeId,
          code
        })
      });
      const verifyData = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok || !verifyData.ok) {
        throw new Error(verifyData.message || 'Código incorrecto. Intenta de nuevo.');
      }

      const verifiedUser = pendingMfa.user;
      clearPendingMfa();
      if (codeInput) codeInput.value = '';
      saveSession(verifiedUser, verifyData.session);
      await afterAuthSuccess();
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = error.message || 'Código incorrecto. Intenta de nuevo.';
        statusEl.classList.add('is-error');
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  document.getElementById('signupForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('signupUsername')?.value.trim() || '';
    const email = document.getElementById('signupEmail')?.value.trim() || '';
    const password = document.getElementById('signupPassword')?.value || '';
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value || '';

    if (password !== confirmPassword) {
      setAuthMessage('Las contraseñas no coinciden.', true);
      return;
    }

    try {
      const data = await postJson('/api/auth', {
        action: 'register',
        username,
        email,
        password
      });

      // Pending email confirmation is not a signed-in state: no session,
      // no dashboard/progress load, modal stays open showing the pending
      // screen instead of closing.
      if (data.requiresEmailConfirmation) {
        showSignupPending(email);
        return;
      }

      saveSession(data.user, data.session);
      await afterAuthSuccess();
    } catch (error) {
      setAuthMessage(error.message, true);
    }
  });

  document.getElementById('forgotPasswordForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('forgotEmail')?.value.trim() || '';
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    try {
      const data = await postJson('/api/auth/request-password-reset', { email });
      setAuthMessage(
        data.message ||
          'Si el correo está asociado a una cuenta, recibirás un enlace para restablecer tu contraseña.',
        false
      );
    } catch (error) {
      // requestPasswordReset is designed to never throw a distinguishing
      // error, but keep a safe generic fallback just in case of a network
      // failure reaching our own backend.
      setAuthMessage('No se pudo procesar la solicitud. Intenta de nuevo.', true);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  document.getElementById('usernameOnboardingForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.getElementById('onboardingUsername');
    const statusEl = document.getElementById('onboardingUsernameStatus');
    const username = input?.value.trim() || '';
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    try {
      await postJson('/api/profile/username', { username }, { auth: true });
      closeUsernameOnboarding();
      showHomeToast('Nombre de usuario guardado.');
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = error.message || 'No se pudo guardar el nombre de usuario.';
        statusEl.classList.add('is-error');
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  document.querySelectorAll('[data-password-toggle]').forEach((toggleBtn) => {
    toggleBtn.addEventListener('click', () => {
      const target = document.getElementById(toggleBtn.dataset.passwordToggle);
      if (!target) return;
      const showing = target.type === 'text';
      target.type = showing ? 'password' : 'text';
      toggleBtn.setAttribute('aria-label', showing ? 'Mostrar contraseña' : 'Ocultar contraseña');
      toggleBtn.textContent = showing ? '👁' : '🙈';
    });
  });

  setupUsernameAvailabilityCheck('signupUsername', 'signupUsernameStatus');
  setupUsernameAvailabilityCheck('onboardingUsername', 'onboardingUsernameStatus');
  setupPasswordStrengthMeter('signupPassword', 'signupPasswordStrength');
}

// Debounced GET /api/auth/username-available - purely advisory (the note
// under the field already says so): the partial unique index on
// username_normalized is the real, final authority, this only avoids
// making the student wait until they submit the whole form to find out
// their pick is taken.
function setupUsernameAvailabilityCheck(inputId, statusId) {
  const input = document.getElementById(inputId);
  const statusEl = document.getElementById(statusId);
  if (!input || !statusEl) return;

  let debounceId = null;
  let requestToken = 0;

  input.addEventListener('input', () => {
    const value = input.value.trim();
    statusEl.classList.remove('is-error', 'is-available');
    if (debounceId) window.clearTimeout(debounceId);

    if (!value) {
      statusEl.textContent = '';
      return;
    }

    statusEl.textContent = 'Comprobando disponibilidad…';
    const thisToken = ++requestToken;

    debounceId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${backendBaseUrl}/api/auth/username-available?u=${encodeURIComponent(value)}`
        );
        const data = await response.json().catch(() => ({}));
        if (thisToken !== requestToken) return; // a newer keystroke already superseded this check

        if (!response.ok || !data.ok) {
          statusEl.textContent = data.message || 'Nombre de usuario no válido.';
          statusEl.classList.add('is-error');
          return;
        }
        if (data.available) {
          statusEl.textContent = `"${data.normalizedUsername}" está disponible.`;
          statusEl.classList.add('is-available');
        } else {
          statusEl.textContent = 'Ese nombre de usuario no está disponible.';
          statusEl.classList.add('is-error');
        }
      } catch {
        if (thisToken === requestToken) statusEl.textContent = '';
      }
    }, 400);
  });
}

// Client-side-only signal (never the source of truth for whether a
// password is "good enough" - Supabase Auth's own password policy is what
// actually enforces that) - just gives the student quick visual feedback.
function setupPasswordStrengthMeter(inputId, statusId) {
  const input = document.getElementById(inputId);
  const statusEl = document.getElementById(statusId);
  if (!input || !statusEl) return;

  input.addEventListener('input', () => {
    const value = input.value;
    if (!value) {
      statusEl.textContent = '';
      statusEl.className = 'password-strength';
      return;
    }
    let score = 0;
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^a-zA-Z0-9]/.test(value)) score += 1;

    const levels = [
      { label: 'Muy débil', className: 'is-weak' },
      { label: 'Débil', className: 'is-weak' },
      { label: 'Aceptable', className: 'is-fair' },
      { label: 'Buena', className: 'is-good' },
      { label: 'Fuerte', className: 'is-strong' },
      { label: 'Muy fuerte', className: 'is-strong' }
    ];
    const level = levels[Math.min(score, levels.length - 1)];
    statusEl.textContent = level.label;
    statusEl.className = `password-strength ${level.className}`;
  });
}

let lastSignupEmail = '';
let resendOtpCooldownId = null;

// "a******@correo.com" - first character of the local part kept, everything
// else (local part and domain) masked, per the requested UI copy. Falls back
// to the raw string if it doesn't look like an email at all.
function maskEmail(email) {
  const match = /^(.)([^@]*)@(.+)$/.exec(email || '');
  if (!match) return email || '';
  const [, first, rest, domain] = match;
  return `${first}${'*'.repeat(Math.max(rest.length, 1))}@${domain}`;
}

function getOtpDigitInputs() {
  return Array.from(document.querySelectorAll('#otpInputRow .otp-digit'));
}

function getOtpCode() {
  return getOtpDigitInputs()
    .map((input) => input.value.trim())
    .join('');
}

function clearOtpDigits() {
  const inputs = getOtpDigitInputs();
  inputs.forEach((input) => (input.value = ''));
  inputs[0]?.focus();
}

function setResendOtpCooldown(seconds) {
  const button = document.getElementById('resendOtpBtn');
  if (!button) return;
  if (resendOtpCooldownId) window.clearInterval(resendOtpCooldownId);

  let remaining = seconds;
  button.disabled = true;
  button.textContent = `Reenviar código (${remaining}s)`;
  resendOtpCooldownId = window.setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      window.clearInterval(resendOtpCooldownId);
      resendOtpCooldownId = null;
      button.disabled = false;
      button.textContent = 'Reenviar código';
      return;
    }
    button.textContent = `Reenviar código (${remaining}s)`;
  }, 1000);
}

function showSignupPending(email) {
  lastSignupEmail = email;
  const fields = document.querySelector('#signupForm .signup-fields');
  const pending = document.getElementById('signupPending');
  const verifyStep = document.getElementById('verifyAccountStep');
  const verifySuccess = document.getElementById('verifyAccountSuccess');
  const statusEl = document.getElementById('otpStatus');
  if (fields) fields.hidden = true;
  if (pending) {
    pending.hidden = false;
    const messageEl = pending.querySelector('.signup-pending-message');
    if (messageEl) {
      messageEl.textContent = `Te enviamos un código de 6 dígitos a ${maskEmail(email)}. Revisa también la carpeta de spam.`;
    }
  }
  if (verifyStep) verifyStep.hidden = false;
  if (verifySuccess) verifySuccess.hidden = true;
  if (statusEl) {
    statusEl.textContent = '';
    statusEl.classList.remove('is-error');
  }
  clearOtpDigits();
  setResendOtpCooldown(30);
}

function resetSignupPending() {
  const fields = document.querySelector('#signupForm .signup-fields');
  const pending = document.getElementById('signupPending');
  if (fields) fields.hidden = false;
  if (pending) pending.hidden = true;
  if (resendOtpCooldownId) {
    window.clearInterval(resendOtpCooldownId);
    resendOtpCooldownId = null;
  }
}

// Auto-advance/backspace/paste across the 6 individual digit boxes - kept
// scoped to #otpInputRow so it never interferes with any other input on the
// page.
document.getElementById('otpInputRow')?.addEventListener('input', (event) => {
  const input = event.target.closest('.otp-digit');
  if (!input) return;
  input.value = input.value.replace(/\D/g, '').slice(0, 1);
  if (input.value) {
    const inputs = getOtpDigitInputs();
    const next = inputs[inputs.indexOf(input) + 1];
    next?.focus();
  }
});

document.getElementById('otpInputRow')?.addEventListener('keydown', (event) => {
  const input = event.target.closest('.otp-digit');
  if (!input || event.key !== 'Backspace' || input.value) return;
  const inputs = getOtpDigitInputs();
  const prev = inputs[inputs.indexOf(input) - 1];
  prev?.focus();
});

document.getElementById('otpInputRow')?.addEventListener('paste', (event) => {
  const input = event.target.closest('.otp-digit');
  if (!input) return;
  event.preventDefault();
  const digits = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
  const inputs = getOtpDigitInputs();
  digits.split('').forEach((digit, index) => {
    if (inputs[index]) inputs[index].value = digit;
  });
  (inputs[digits.length] || inputs[inputs.length - 1])?.focus();
});

document.getElementById('signupPending')?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  if (button.dataset.action === 'go-to-login') {
    resetSignupPending();
    openModal('login');
    // Carry the email over (never the password) so the student doesn't
    // have to retype it - it's the same address they just registered with.
    const loginIdentifierInput = document.getElementById('loginIdentifier');
    if (loginIdentifierInput) loginIdentifierInput.value = lastSignupEmail;
    return;
  }

  if (button.dataset.action === 'confirm-otp') {
    const statusEl = document.getElementById('otpStatus');
    const code = getOtpCode();
    if (!/^\d{6}$/.test(code)) {
      if (statusEl) {
        statusEl.textContent = 'Ingresa los 6 dígitos del código.';
        statusEl.classList.add('is-error');
      }
      return;
    }

    button.disabled = true;
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.classList.remove('is-error');
    }
    try {
      const response = await fetch(`${backendBaseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lastSignupEmail, token: code, purpose: 'signup' })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Código incorrecto. Intenta de nuevo.');
      }

      const verifyStep = document.getElementById('verifyAccountStep');
      const verifySuccess = document.getElementById('verifyAccountSuccess');
      if (verifyStep) verifyStep.hidden = true;
      if (verifySuccess) verifySuccess.hidden = false;
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = error.message || 'Código incorrecto. Intenta de nuevo.';
        statusEl.classList.add('is-error');
      }
      clearOtpDigits();
    } finally {
      button.disabled = false;
    }
    return;
  }

  if (button.dataset.action === 'resend-otp') {
    button.disabled = true;
    const statusEl = document.getElementById('otpStatus');
    try {
      const response = await fetch(`${backendBaseUrl}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lastSignupEmail })
      });
      // Same neutral-response design as /api/auth/resend-confirmation - the
      // backend never distinguishes "sent" from "no such pending account" in
      // its own message, so only the rate-limit (429) case gets a different,
      // safe-to-show status here.
      if (response.status === 429) {
        if (statusEl) statusEl.textContent = 'Has solicitado varios códigos. Espera unos minutos.';
      } else {
        if (statusEl) statusEl.textContent = 'Código reenviado. Revisa tu correo.';
      }
    } catch (error) {
      console.warn('Could not resend OTP', error);
      if (statusEl) statusEl.textContent = 'No se pudo reenviar el código. Intenta de nuevo.';
    } finally {
      clearOtpDigits();
      setResendOtpCooldown(30);
    }
  }
});

// "Seguridad de la cuenta" - TOTP enrollment (#security). factorId is only
// ever held here in memory for the duration of one enroll attempt; nothing
// about the factor (secret, QR, codes) is ever sent anywhere but Supabase.
let pendingEnrollFactorId = null;

function renderSecurityActivateButton() {
  const status = document.getElementById('securityMfaStatus');
  if (!status) return;
  status.innerHTML = `
    <p>No tienes activada la verificación en dos pasos.</p>
    <button type="button" class="primary-btn" data-security-action="start-enroll">
      Activar verificación en dos pasos
    </button>
  `;
}

function renderSecurityActiveState(factor) {
  const status = document.getElementById('securityMfaStatus');
  if (!status) return;
  status.innerHTML = `
    <p>✅ Verificación en dos pasos activada${factor.friendlyName ? ` (${escapeHtml(factor.friendlyName)})` : ''}.</p>
    <button type="button" class="secondary-btn" data-security-action="unenroll" data-factor-id="${escapeHtml(factor.id)}">
      Desactivar
    </button>
  `;
}

async function loadSecurityStatus() {
  const status = document.getElementById('securityMfaStatus');
  const enrollFlow = document.getElementById('mfaEnrollFlow');
  if (enrollFlow) enrollFlow.hidden = true;
  if (!authStatus.session?.access_token) {
    if (status)
      status.innerHTML = '<p class="skill-graph-empty">Inicia sesión para ver tu seguridad.</p>';
    return;
  }
  if (status) status.innerHTML = '<p class="skill-graph-empty">Cargando estado de seguridad…</p>';

  try {
    const response = await fetch(`${backendBaseUrl}/api/mfa/factors`, { headers: authHeaders() });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('Request failed');
    const activeFactor = (data.totp || []).find((factor) => factor.status === 'verified');
    if (activeFactor) renderSecurityActiveState(activeFactor);
    else renderSecurityActivateButton();
  } catch (error) {
    console.warn('Could not load security status', error);
    if (status)
      status.innerHTML =
        '<p class="skill-graph-empty">No se pudo cargar tu estado de seguridad. Intenta recargar.</p>';
  }
}

function resetMfaEnrollFlow() {
  pendingEnrollFactorId = null;
  const enrollFlow = document.getElementById('mfaEnrollFlow');
  if (enrollFlow) enrollFlow.hidden = true;
  const codeInput = document.getElementById('mfaEnrollCode');
  if (codeInput) codeInput.value = '';
  const enrollStatus = document.getElementById('mfaEnrollStatus');
  if (enrollStatus) {
    enrollStatus.textContent = '';
    enrollStatus.classList.remove('is-error');
  }
}

document.getElementById('securityMfaStatus')?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-security-action]');
  if (!button) return;

  if (button.dataset.securityAction === 'start-enroll') {
    button.disabled = true;
    try {
      const response = await fetch(`${backendBaseUrl}/api/mfa/totp/enroll`, {
        method: 'POST',
        headers: authHeaders()
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'No se pudo iniciar la activación.');
      }
      pendingEnrollFactorId = data.factorId;
      const qrWrap = document.getElementById('mfaQrWrap');
      if (qrWrap) {
        qrWrap.innerHTML = `<img src="${escapeHtml(data.qrCode)}" alt="Código QR para configurar tu aplicación autenticadora" width="200" height="200" />`;
      }
      const manualKey = document.getElementById('mfaManualKey');
      if (manualKey) manualKey.textContent = data.secret || '';
      const enrollFlow = document.getElementById('mfaEnrollFlow');
      if (enrollFlow) enrollFlow.hidden = false;
      document.getElementById('mfaEnrollCode')?.focus();
    } catch (error) {
      showHomeToast(error.message || 'No se pudo iniciar la activación.');
    } finally {
      button.disabled = false;
    }
    return;
  }

  if (button.dataset.securityAction === 'unenroll') {
    if (!window.confirm('¿Desactivar la verificación en dos pasos?')) return;
    button.disabled = true;
    try {
      const response = await fetch(`${backendBaseUrl}/api/mfa/totp/unenroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ factorId: button.dataset.factorId })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error('No se pudo desactivar.');
      showHomeToast('Verificación en dos pasos desactivada.');
      await loadSecurityStatus();
    } catch (error) {
      showHomeToast(error.message || 'No se pudo desactivar. Intenta de nuevo.');
      button.disabled = false;
    }
  }
});

document.getElementById('mfaCancelEnrollBtn')?.addEventListener('click', async () => {
  if (pendingEnrollFactorId) {
    try {
      await fetch(`${backendBaseUrl}/api/mfa/totp/unenroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ factorId: pendingEnrollFactorId })
      });
    } catch (error) {
      console.warn('Could not clean up cancelled enrollment', error);
    }
  }
  resetMfaEnrollFlow();
});

document.getElementById('mfaVerifyEnrollBtn')?.addEventListener('click', async () => {
  const codeInput = document.getElementById('mfaEnrollCode');
  const enrollStatus = document.getElementById('mfaEnrollStatus');
  const code = codeInput?.value.trim() || '';
  const button = document.getElementById('mfaVerifyEnrollBtn');

  if (!pendingEnrollFactorId) {
    resetMfaEnrollFlow();
    return;
  }
  if (!/^\d{6}$/.test(code)) {
    if (enrollStatus) {
      enrollStatus.textContent = 'Ingresa los 6 dígitos del código.';
      enrollStatus.classList.add('is-error');
    }
    return;
  }

  if (button) button.disabled = true;
  if (enrollStatus) {
    enrollStatus.textContent = '';
    enrollStatus.classList.remove('is-error');
  }

  try {
    const challengeResponse = await fetch(`${backendBaseUrl}/api/mfa/totp/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ factorId: pendingEnrollFactorId })
    });
    const challengeData = await challengeResponse.json().catch(() => ({}));
    if (!challengeResponse.ok || !challengeData.challengeId) {
      throw new Error(challengeData.message || 'No se pudo generar el desafío de verificación.');
    }

    const verifyResponse = await fetch(`${backendBaseUrl}/api/mfa/totp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        factorId: pendingEnrollFactorId,
        challengeId: challengeData.challengeId,
        code
      })
    });
    const verifyData = await verifyResponse.json().catch(() => ({}));
    if (!verifyResponse.ok || !verifyData.ok) {
      throw new Error(verifyData.message || 'Código incorrecto. Intenta de nuevo.');
    }

    // Verifying a brand new factor invalidates the account's other sessions
    // (Supabase's own enroll() docs) - swap in the new tokens this call
    // returns instead of keeping the ones from before enrollment.
    if (verifyData.session) saveSession(authStatus.user, verifyData.session);

    resetMfaEnrollFlow();
    showHomeToast('Verificación en dos pasos activada.');
    await loadSecurityStatus();
  } catch (error) {
    if (enrollStatus) {
      enrollStatus.textContent = error.message || 'Código incorrecto. Intenta de nuevo.';
      enrollStatus.classList.add('is-error');
    }
  } finally {
    if (button) button.disabled = false;
  }
});

const learningPathState = {
  lessons: [],
  // Thematic units for the current language+level (e.g. English A1's 12
  // units). Empty for every language/level that doesn't have units yet -
  // see hasUnits() below, which every unit-aware render path is gated on.
  units: [],
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

// True only for language/level combos that have thematic units (English A1
// today). Every unit-aware render path (unit accordion, skill libraries)
// branches on this so every other language/level keeps today's exact
// single-lesson-per-skill behavior untouched.
function hasUnits() {
  return learningPathState.units.length > 0;
}

function getSkillActivities(skill) {
  return learningPathState.lessons
    .filter((item) => item.skill === skill)
    .sort((a, b) => {
      const unitA = learningPathState.units.find((u) => u.id === a.unitId);
      const unitB = learningPathState.units.find((u) => u.id === b.unitId);
      return (unitA?.order ?? 0) - (unitB?.order ?? 0);
    });
}

function getUnitActivities(unitId) {
  return learningPathState.lessons.filter((item) => item.unitId === unitId);
}

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

// ---------------------------------------------------------------------
// Pronunciation (Web Speech API) - shared by every flashcard/pronounceable
// element across every target language, never hardcoded to English. Locale
// is resolved from the current learningPathState.language (or an explicit
// override) at call time, not baked into this function.
// ---------------------------------------------------------------------

const LANGUAGE_LOCALES = {
  english: 'en-US',
  french: 'fr-FR',
  spanish: 'es-ES',
  italian: 'it-IT',
  german: 'de-DE'
};

function supportsSpeech() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function getPronunciationLocale(language = learningPathState.language) {
  return LANGUAGE_LOCALES[language] || 'en-US';
}

// Always cancels any in-flight utterance first, so two quick taps (or
// tapping a second card while the first is still speaking) never overlap.
// No-ops silently - no thrown errors, no console noise - when the browser
// doesn't support speechSynthesis at all. `onEnd` (optional) fires once,
// whether playback finished normally or errored out - used by the AI
// Tutor's voice controls to know when to reset their Stop/Repetir state
// (flashcards don't need it and don't pass it).
function speakText(text, { locale, rate = 1, onEnd } = {}) {
  if (!supportsSpeech() || !text) {
    onEnd?.();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale || getPronunciationLocale();
    utterance.rate = rate;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  } catch {
    /* speechSynthesis unavailable/misbehaving - the card stays usable without audio */
    onEnd?.();
  }
}

// English A1 speaks slightly slower (0.86x) per spec; every other
// language/level defaults to normal rate unless a card sets its own
// pronunciationRate.
function getDefaultPronunciationRate(language = learningPathState.language, level = learningPathState.level) {
  return language === 'english' && level === 'A1' ? 0.86 : 1;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Returns the message wrapper <div> (not just its body <p>) so streaming
// callers (see sendTutorMessage()) can keep updating its text as chunks
// arrive, and so tutor voice controls (renderTutorVoiceControls()) have
// somewhere to attach once the first complete sentence has streamed in.
function appendTutorMessage(container, role, text, { isError = false } = {}) {
  if (!container) return null;
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
  return message;
}

// Updates an in-progress tutor message bubble's text (see appendTutorMessage's
// returned wrapper) as streamed chunks accumulate.
function updateTutorMessageBody(messageEl, container, text) {
  if (!messageEl) return;
  const body = messageEl.querySelector('p');
  if (body) body.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
  if (container) container.scrollTop = container.scrollHeight;
}

// ---------------------------------------------------------------------
// AI Tutor voice (Text-to-Speech on top of Cerebras/Groq/Gemini's text
// reply - see POST /api/speech/synthesize in lib/server.js). Two
// modalities: free browser speechSynthesis (via speakText() above) or
// Premium neural voice (an <audio> element playing a server-generated
// clip) - the server alone decides which one a given request gets back,
// based on the signed-in user's actual subscription state.
// ---------------------------------------------------------------------

// Whatever is currently audible for a tutor reply - at most one at a time,
// whether it's a speechSynthesis utterance or a neural <audio> clip -
// stopAllTutorAudio() always tears this down first, so starting any new
// playback (a different message, or the same one again) never overlaps
// with what was already playing.
let currentTutorAudio = { element: null, messageEl: null };

function resetTutorVoiceButtons(messageEl) {
  const controls = messageEl?.querySelector('.tutor-voice-controls');
  if (!controls) return;
  const listenBtn = controls.querySelector('.tutor-voice-listen');
  const stopBtn = controls.querySelector('.tutor-voice-stop');
  if (listenBtn) {
    listenBtn.disabled = false;
    if (listenBtn.dataset.played) listenBtn.textContent = '🔁 Repetir';
  }
  if (stopBtn) stopBtn.disabled = true;
}

function stopAllTutorAudio() {
  if (supportsSpeech()) window.speechSynthesis.cancel();
  currentTutorAudio.element?.pause?.();
  if (currentTutorAudio.messageEl) {
    currentTutorAudio.messageEl.classList.remove('is-playing');
    resetTutorVoiceButtons(currentTutorAudio.messageEl);
  }
  currentTutorAudio = { element: null, messageEl: null };
}

// The controls row is injected once the streamed reply reaches its first
// complete sentence (see sendTutorMessage()'s SSE loop), not only once the
// whole reply is done - lets the student start listening earlier. Hidden
// entirely (never rendered) when the browser has no speechSynthesis at all -
// mirrors the flashcard pronunciation feature's graceful-degradation rule.
// A user without speechSynthesis could in principle still be a Premium
// account eligible for neural-only playback, but that's rare enough that
// gating the whole row on the same signal as flashcards keeps this simple.
function renderTutorVoiceControls(messageEl) {
  if (!supportsSpeech() || messageEl.querySelector('.tutor-voice-controls')) return;
  const controls = document.createElement('div');
  controls.className = 'tutor-voice-controls';
  controls.innerHTML = `
    <button type="button" class="tutor-voice-btn tutor-voice-listen">🔊 Escuchar</button>
    <button type="button" class="tutor-voice-btn tutor-voice-stop" disabled>⏹ Detener</button>
    <div class="tutor-voice-speed-group">
      <button type="button" class="tutor-voice-speed-btn is-active" data-speed="normal">▶ Normal</button>
      <button type="button" class="tutor-voice-speed-btn" data-speed="slow">🐢 Lenta</button>
    </div>
    <span class="tutor-voice-limit-message" hidden></span>
  `;
  messageEl.appendChild(controls);
}

// Only ever called from a click handler (Escuchar/Repetir) - never
// automatically - satisfying "no autoplay, especially on mobile" for free.
async function requestTutorSpeech(messageEl) {
  const controls = messageEl.querySelector('.tutor-voice-controls');
  const listenBtn = controls?.querySelector('.tutor-voice-listen');
  const stopBtn = controls?.querySelector('.tutor-voice-stop');
  const limitMsg = controls?.querySelector('.tutor-voice-limit-message');
  const speed = controls?.querySelector('.tutor-voice-speed-btn.is-active')?.dataset.speed || 'normal';
  const text = messageEl.dataset.ttsText || '';
  const locale = messageEl.dataset.ttsLocale || getPronunciationLocale();
  if (!text) return;

  stopAllTutorAudio();
  if (listenBtn) listenBtn.disabled = true;

  const onEnd = () => {
    messageEl.classList.remove('is-playing');
    if (currentTutorAudio.messageEl === messageEl) currentTutorAudio = { element: null, messageEl: null };
    resetTutorVoiceButtons(messageEl);
  };

  try {
    const response = await fetch(`${backendBaseUrl}/api/speech/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        text,
        language: learningPathState.language,
        locale,
        speed,
        turnIndex: Number(messageEl.dataset.turnIndex) || 1
      })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (data.limited && limitMsg) {
        limitMsg.textContent = data.message;
        limitMsg.hidden = false;
        if (listenBtn) listenBtn.disabled = true; // stays disabled for the rest of the session
        return;
      }
      throw new Error(data.error || 'No se pudo generar la voz del tutor.');
    }

    messageEl.classList.add('is-playing');
    if (stopBtn) stopBtn.disabled = false;
    if (listenBtn) listenBtn.dataset.played = 'true';

    if (data.mode === 'neural' && data.audioBase64) {
      const audio = new Audio(`data:${data.mimeType || 'audio/mpeg'};base64,${data.audioBase64}`);
      currentTutorAudio = { element: audio, messageEl };
      audio.addEventListener('ended', onEnd);
      audio.addEventListener('error', onEnd);
      await audio.play();
    } else {
      currentTutorAudio = { element: null, messageEl };
      speakText(text, { locale, rate: speed === 'slow' ? 0.75 : 1, onEnd });
    }
    if (listenBtn) listenBtn.disabled = false;
  } catch (error) {
    if (limitMsg) {
      limitMsg.textContent = error.message || 'No se pudo generar la voz del tutor.';
      limitMsg.hidden = false;
    }
    if (listenBtn) listenBtn.disabled = false;
  }
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

// Desktop/tablet always show the path and the lesson panel side by side
// (see .learning-path-layout's grid) - this only matters on mobile, where
// the path collapses into a drawer opened by "Ver ruta" ('route') and
// closed once a lesson is picked or "Volver a la ruta" reopens it ('route'
// again). The class has no effect above the mobile breakpoint.
function showLearnState(state) {
  const graph = document.getElementById('skillGraph');
  const toggle = document.querySelector('.learn-route-toggle');
  const isOpen = state === 'route';
  graph?.classList.toggle('is-drawer-open', isOpen);
  toggle?.setAttribute('aria-expanded', String(isOpen));
}

// Selects a lesson in the learning path and, for signed-in users, tells the
// backend it was opened (POST /api/lessons/:slug/start marks it in_progress
// in user_lesson_progress). Fire-and-forget: 404s for lessons not yet on the
// normalized courses schema, and guests just get the local UI update.
function openLesson(slug) {
  if (!slug) return;
  stopTutorDictation();
  learningPathState.activeSlug = slug;
  renderLearningPath();
  showLearnState('lesson');
  if (authStatus.session?.access_token) {
    fetch(`${backendBaseUrl}/api/lessons/${slug}/start`, {
      method: 'POST',
      headers: authHeaders()
    }).catch(() => {});
  }
}

function getActiveLearningLesson() {
  return (
    learningPathState.lessons.find((item) => item.slug === learningPathState.activeSlug) ||
    learningPathState.lessons[0] ||
    null
  );
}

function updateAiTutorContext() {
  const contextRoot = document.querySelector('#tutor .tutor-context');
  if (!contextRoot) return;

  const lesson = getActiveLearningLesson();
  const values = {
    language:
      languageDisplayNames[learningPathState.language] || learningPathState.language || 'English',
    level: learningPathState.level || 'A1',
    lesson: lesson?.title || 'Ruta inicial'
  };

  Object.entries(values).forEach(([key, value]) => {
    const node = contextRoot.querySelector(`[data-ai-context="${key}"]`);
    if (node) node.textContent = value;
  });
}

// Real connectivity probe run each time the Tutor view is opened - never
// hardcode "Conectado", it has to reflect an actual backend response.
// A chat exchange (see .tutor-chat-btn handler) is a stronger signal and
// overwrites this once the student actually sends a message.
async function checkTutorConnection(statusElId = 'tutorConnectionStatus') {
  const status = document.getElementById(statusElId);
  if (!status) return;
  status.textContent = 'Comprobando conexión…';
  try {
    const response = await fetch(`${backendBaseUrl}/api/health`);
    status.textContent = response.ok ? 'Conectado' : 'No disponible';
  } catch (error) {
    status.textContent = 'No disponible';
  }
}

// Voice dictation for the Tutor prompt textareas - converts speech to text
// via the browser's Web Speech API only. This is deliberately unrelated to
// the Speaking skill's MediaRecorder-based audio capture (renderSpeakingView):
// no audio is ever recorded, kept, or sent anywhere here, only the
// transcribed text ends up in the textarea, same as if the student had
// typed it. Only one dictation session may run at a time app-wide.
const DICTATION_LANGUAGE_CODES = {
  english: 'en-US',
  spanish: 'es-ES',
  french: 'fr-FR',
  italian: 'it-IT',
  german: 'de-DE'
};
const DICTATION_MAX_SECONDS = 45;

let tutorDictation = {
  recognition: null,
  status: 'idle', // idle | listening | unsupported
  textareaId: null,
  timeoutId: null
};

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function setDictationStatusText(textareaId, text) {
  const statusEl = document.getElementById(`${textareaId}DictateStatus`);
  if (statusEl) statusEl.textContent = text;
}

function getDictationSendButton(textareaId) {
  return textareaId === 'aiTutorPrompt'
    ? document.querySelector('#tutor .tutor-chat-btn')
    : document.getElementById('tutorDrawerSend');
}

function resetDictationUI(textareaId) {
  const micBtn = document.querySelector(`.tutor-dictate-btn[data-dictate-target="${textareaId}"]`);
  const stopBtn = document.querySelector(
    `.tutor-dictate-stop-btn[data-dictate-target="${textareaId}"]`
  );
  if (micBtn && tutorDictation.status !== 'unsupported') {
    micBtn.disabled = false;
    micBtn.classList.remove('is-listening');
    micBtn.setAttribute('aria-pressed', 'false');
  }
  if (stopBtn) stopBtn.hidden = true;
  const sendBtn = getDictationSendButton(textareaId);
  if (sendBtn) sendBtn.disabled = false;
}

// Stops the recognizer (if any) - safe to call any time, including when
// nothing is active. Fires the 'end' handler registered in startDictation,
// which does the actual UI/state cleanup, so callers don't duplicate that.
function stopDictationRecognizer() {
  if (tutorDictation.timeoutId) {
    window.clearTimeout(tutorDictation.timeoutId);
    tutorDictation.timeoutId = null;
  }
  if (tutorDictation.recognition) {
    try {
      tutorDictation.recognition.stop();
    } catch {
      /* already stopped/inactive */
    }
  }
}

// Called on: manually pressing "Detener", the 45s limit, changing target
// language, closing the Tutor drawer, and any top-level view navigation
// (showView) - covers "cerrar el Tutor"/"cambiar de idioma"/"cambiar de
// lección" without needing a cleanup call at every single call site.
function stopTutorDictation() {
  if (tutorDictation.status !== 'listening') return;
  setDictationStatusText(tutorDictation.textareaId, 'Transcribiendo…');
  stopDictationRecognizer();
}

function startTutorDictation(textareaId) {
  const textarea = document.getElementById(textareaId);
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor || !textarea) {
    tutorDictation.status = 'unsupported';
    setDictationStatusText(
      textareaId,
      'El dictado por voz no está disponible en este navegador. Puedes escribir tu mensaje.'
    );
    const micBtn = document.querySelector(
      `.tutor-dictate-btn[data-dictate-target="${textareaId}"]`
    );
    if (micBtn) micBtn.disabled = true;
    return;
  }

  // No simultaneous sessions - a second "Hablar" press while already
  // listening (on either textarea) is a no-op.
  if (tutorDictation.status === 'listening') return;
  stopDictationRecognizer();

  const recognition = new Ctor();
  recognition.lang = DICTATION_LANGUAGE_CODES[learningPathState.language] || 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;

  tutorDictation = { recognition, status: 'listening', textareaId, timeoutId: null };

  const baseText = textarea.value.trim();
  let finalTranscript = '';
  let hadError = false;

  const micBtn = document.querySelector(`.tutor-dictate-btn[data-dictate-target="${textareaId}"]`);
  const stopBtn = document.querySelector(
    `.tutor-dictate-stop-btn[data-dictate-target="${textareaId}"]`
  );
  if (micBtn) {
    micBtn.disabled = true;
    micBtn.classList.add('is-listening');
    micBtn.setAttribute('aria-pressed', 'true');
  }
  if (stopBtn) stopBtn.hidden = false;
  const sendBtn = getDictationSendButton(textareaId);
  if (sendBtn) sendBtn.disabled = true;
  setDictationStatusText(textareaId, 'Escuchando…');

  recognition.addEventListener('result', (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const chunk = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalTranscript += chunk;
      else interim += chunk;
    }
    textarea.value = [baseText, (finalTranscript + interim).trim()].filter(Boolean).join(' ');
  });

  recognition.addEventListener('error', (event) => {
    hadError = true;
    if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      setDictationStatusText(
        textareaId,
        'No se pudo acceder al micrófono. Revisa los permisos del navegador.'
      );
    } else if (event.error === 'no-speech') {
      setDictationStatusText(textareaId, 'No se entendió el audio. Intenta de nuevo.');
    } else {
      setDictationStatusText(textareaId, 'No se pudo completar el dictado. Intenta de nuevo.');
    }
  });

  // 'error' always fires before 'end', but 'end' still fires afterwards -
  // hadError guards against this handler overwriting a more specific
  // message (e.g. permission denied) with a generic one.
  recognition.addEventListener('end', () => {
    const hadFinalText = Boolean(finalTranscript.trim());
    tutorDictation = { recognition: null, status: 'idle', textareaId: null, timeoutId: null };
    resetDictationUI(textareaId);
    if (hadFinalText) {
      setDictationStatusText(textareaId, 'Texto listo. Puedes editarlo antes de enviar.');
    } else if (!hadError && !textarea.value.trim()) {
      setDictationStatusText(textareaId, 'No se entendió el audio. Intenta de nuevo.');
    }
    textarea.focus();
  });

  try {
    recognition.start();
  } catch {
    tutorDictation = { recognition: null, status: 'idle', textareaId: null, timeoutId: null };
    setDictationStatusText(textareaId, 'No se pudo iniciar el dictado. Intenta de nuevo.');
    resetDictationUI(textareaId);
    return;
  }

  tutorDictation.timeoutId = window.setTimeout(() => {
    stopTutorDictation();
  }, DICTATION_MAX_SECONDS * 1000);
}

const SKILL_ICONS = {
  listening: '🎧',
  speaking: '🗣️',
  reading: '📖',
  writing: '✍️',
  grammar: '📚',
  vocabulary: '🧠'
};

// One lesson per skill per level is the real data shape today (no
// sub-level "module" grouping exists in course_lessons/lessonsService), so
// "Módulo <nivel>" is the module unit - honest to what's actually loaded,
// rather than inventing themed module names the data can't back up.
function getLessonStateInfo(lesson, isActive, nextSlug) {
  if (lesson.locked) return { key: 'locked', label: 'Bloqueado' };
  if (isActive) return { key: 'now', label: 'Ahora' };
  if (lesson.completed) return { key: 'completed', label: 'Completado' };
  if (lesson.progressStatus === 'in_progress') return { key: 'in-progress', label: 'En progreso' };
  if (lesson.slug === nextSlug) return { key: 'recommended', label: 'Recomendado' };
  return { key: 'available', label: 'Disponible' };
}

function renderLessonItemHtml(lesson, nextSlug) {
  const isActive = lesson.slug === learningPathState.activeSlug;
  const icon = SKILL_ICONS[lesson.skill?.toLowerCase()] || '📚';
  const skillLabel = SKILL_LABELS[lesson.skill] || lesson.skill;
  const duration = getLessonDurationMinutes(lesson);
  const xp = lesson.xpReward ?? lesson.xp_reward ?? 20;
  const state = getLessonStateInfo(lesson, isActive, nextSlug);
  const progressPct = lesson.completed
    ? 100
    : lesson.progressStatus === 'in_progress'
      ? (lesson.bestScore ?? 50)
      : 0;

  return `
      <button
        type="button"
        class="path-lesson-item path-lesson-item--${state.key}"
        data-lesson-slug="${escapeHtml(lesson.slug)}"
        ${isActive ? 'aria-current="true"' : ''}
      >
        <span class="path-lesson-icon" aria-hidden="true">${lesson.locked ? '🔒' : icon}</span>
        <span class="path-lesson-info">
          <span class="path-lesson-skill">${escapeHtml(skillLabel)}</span>
          <span class="path-lesson-title">${escapeHtml(lesson.title)}</span>
          <span class="path-lesson-meta">
            ${duration ? `<span>⏱ ${escapeHtml(String(duration))} min</span>` : ''}
            <span>⭐ ${escapeHtml(String(xp))} XP</span>
          </span>
          ${progressPct > 0 ? `<span class="path-lesson-progress"><span style="width:${progressPct}%"></span></span>` : ''}
        </span>
        <span class="path-lesson-state path-lesson-state--${state.key}">${state.label}</span>
      </button>
    `;
}

// The Ruta tab for a unit-aware language+level (English A1 today): 12
// thematic units in order, each with its own ≤6 activities, instead of one
// flat module. Reuses renderLessonItemHtml() so a unit's activities look
// and behave exactly like the legacy flat list's items.
function renderUnitAccordionHtml(nextSlug) {
  return learningPathState.units
    .map((unit) => {
      const activities = getUnitActivities(unit.id);
      const completedCount = activities.filter((item) => item.completed).length;
      const unitPct = activities.length ? Math.round((completedCount / activities.length) * 100) : 0;
      const containsActive = activities.some((item) => item.slug === learningPathState.activeSlug);

      return `
      <details class="path-unit" ${containsActive ? 'open' : ''}>
        <summary class="path-unit-header">
          <span class="path-unit-order">${escapeHtml(String(unit.order))}</span>
          <span class="path-unit-titles">
            <span class="path-unit-title">${escapeHtml(unit.title)}</span>
            ${unit.titleEs ? `<span class="path-unit-title-es">${escapeHtml(unit.titleEs)}</span>` : ''}
          </span>
          <span class="path-unit-progress-label">${completedCount}/${activities.length} · ${unitPct}%</span>
        </summary>
        <div class="path-module-body">${activities.map((item) => renderLessonItemHtml(item, nextSlug)).join('')}</div>
      </details>
    `;
    })
    .join('');
}

function renderSkillGraph() {
  const container = document.getElementById('skillGraph');
  if (!container) return;

  const lessons = learningPathState.lessons;
  if (!lessons.length) {
    container.innerHTML = '<p class="skill-graph-empty">No hay lecciones disponibles.</p>';
    return;
  }

  const targetLabel =
    languageDisplayNames[learningPathState.language] || learningPathState.language;
  const level = learningPathState.level;
  const completedCount = lessons.filter((item) => item.completed).length;
  const pct = Math.round((completedCount / lessons.length) * 100);
  const nextLesson = getNextRecommendedLesson();
  const nextSkillLabel = nextLesson ? SKILL_LABELS[nextLesson.skill] || nextLesson.skill : '—';

  const bodyHtml = hasUnits()
    ? `<div class="unit-accordion">${renderUnitAccordionHtml(nextLesson?.slug)}</div>`
    : `
    <div class="path-module">
      <div class="path-module-header">Módulo ${escapeHtml(level)} · ${escapeHtml(targetLabel)}</div>
      <div class="path-module-body">${lessons.map((item) => renderLessonItemHtml(item, nextLesson?.slug)).join('')}</div>
    </div>
  `;

  container.innerHTML = `
    <div class="path-summary">
      <span class="path-summary-lang">${escapeHtml(targetLabel)} · ${escapeHtml(level)}</span>
      <div class="path-summary-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
        <div style="width:${pct}%"></div>
      </div>
      <span class="path-summary-detail">${completedCount}/${lessons.length} completadas · Próximo: ${escapeHtml(nextSkillLabel)}</span>
    </div>
    ${bodyHtml}
  `;

  container.querySelectorAll('.path-lesson-item').forEach((nodeEl) => {
    nodeEl.addEventListener('click', () => openLesson(nodeEl.dataset.lessonSlug));
  });

  // Keep the active lesson in view when the list re-renders (e.g. after
  // switching level/language) rather than always resetting scroll to top.
  container
    .querySelector('.path-lesson-item[aria-current="true"]')
    ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderLessonExercise(item, index, lesson) {
  const recorded = learningPathState.exerciseResults[lesson.slug]?.[index];

  if (item.type === 'mcq' && Array.isArray(item.options)) {
    const optionsHtml = item.options
      .map((option, optionIndex) => {
        const key = optionKey(option, optionIndex);
        const isChosen = recorded && String(recorded.selectedOption) === String(key);
        const cls = isChosen ? (recorded.correct ? 'correct' : 'incorrect') : '';
        const disabled = recorded ? 'disabled' : '';
        return `<button type="button" class="mcq-option ${cls}" data-option-key="${escapeHtml(String(key))}" data-option-index="${optionIndex}" ${disabled}>${escapeHtml(optionLabel(option))}</button>`;
      })
      .join('');
    const answeredClass = recorded
      ? `answered ${recorded.correct ? 'is-correct' : 'is-incorrect'}`
      : '';
    const feedbackText = recorded
      ? recorded.correct
        ? '¡Correcto! +5 XP'
        : 'No es correcto, pero sigue intentando.'
      : '';
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

// First lesson that's neither completed nor locked - used both for the
// right panel's default "continue" card and for the module summary header.
function getNextRecommendedLesson() {
  return (
    learningPathState.lessons.find((item) => !item.completed && !item.locked) ||
    learningPathState.lessons[0] ||
    null
  );
}

function getLessonDurationMinutes(lesson) {
  return lesson.estimated_minutes || lesson.estimatedMinutes || lesson.duration || null;
}

function renderContinueCard(lesson) {
  const skillLabel = SKILL_LABELS[lesson.skill] || lesson.skill;
  const duration = getLessonDurationMinutes(lesson);
  const xp = lesson.xpReward ?? lesson.xp_reward ?? 20;
  const completedCount = learningPathState.lessons.filter((item) => item.completed).length;
  const total = learningPathState.lessons.length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;
  const targetLabel =
    languageDisplayNames[learningPathState.language] || learningPathState.language;

  return `
    <div class="lesson-continue-card">
      <span class="lesson-continue-kicker">Módulo ${escapeHtml(lesson.level)} · ${escapeHtml(targetLabel)}</span>
      <h3>Tu próxima lección</h3>
      <p class="lesson-continue-title">${escapeHtml(skillLabel)} · ${escapeHtml(lesson.title)}</p>
      <p class="lesson-continue-desc">${escapeHtml(lesson.intro || lesson.description || '')}</p>
      <div class="lesson-continue-meta">
        ${duration ? `<span>⏱ ${escapeHtml(String(duration))} min</span>` : ''}
        <span>⭐ ${escapeHtml(String(xp))} XP</span>
      </div>
      <div class="lesson-continue-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
        <div style="width:${pct}%"></div>
      </div>
      <p class="lesson-continue-count">${completedCount}/${total} lecciones completadas en ${escapeHtml(lesson.level)}</p>
      <button type="button" class="primary-btn lesson-continue-btn" data-lesson-slug="${escapeHtml(lesson.slug)}">Continuar →</button>
    </div>
  `;
}

function renderLessonDetail(lesson) {
  const vocabulary =
    lesson.vocabulary
      ?.map(
        (item) => `
    <div>
      <strong>${escapeHtml(item.word)}</strong>
      <span>${escapeHtml(resolveVocabTranslation(item))} · ${escapeHtml(item.example)}</span>
    </div>
  `
      )
      .join('') || '';

  const dialogue =
    lesson.dialogue
      ?.map(
        (item) => `
    <div>
      <strong>${escapeHtml(item.speaker)}: ${escapeHtml(item.line)}</strong>
      <span>${escapeHtml(resolveVocabTranslation(item))}</span>
    </div>
  `
      )
      .join('') || '';

  const audioPlayer =
    lesson.skill === 'listening' && lesson.audioUrl
      ? `<audio class="lesson-audio-player" controls preload="none" src="${escapeHtml(lesson.audioUrl)}">
        Tu navegador no soporta audio HTML5.
      </audio>`
      : '';

  const exercises = lesson.locked
    ? `
    <div class="premium-lock-box">
      <strong>🔒 Lección premium</strong>
      <span>Desbloquea esta lección y la ruta completa con el único plan: USD ${premiumPriceUsd}.</span>
      <button type="button" class="primary-btn upgrade-btn">Desbloquear por USD ${premiumPriceUsd}</button>
    </div>
  `
    : lesson.exercises?.map((item, index) => renderLessonExercise(item, index, lesson)).join('') ||
      '';

  let mode = 'practice';
  let disabled = false;
  let buttonText = 'Iniciar práctica';
  if (lesson.locked) {
    mode = 'locked';
    disabled = true;
    buttonText = `Premium USD ${premiumPriceUsd}`;
  } else if (lesson.completed) {
    mode = 'completed';
    disabled = true;
    buttonText = 'Completada';
  } else {
    const { total, attempted, allAttempted } = getExerciseProgress(lesson);
    if (allAttempted) {
      mode = 'complete';
      buttonText = 'Completar';
    } else {
      buttonText = attempted > 0 ? `Iniciar práctica (${attempted}/${total})` : 'Iniciar práctica';
    }
  }

  return `
    <div class="lesson-workspace-head">
      <div>
        <button class="learn-back-to-route" type="button">← Volver a la ruta</button>
        <span class="lesson-kicker">${escapeHtml(lesson.level)} · ${escapeHtml(lesson.skill)}</span>
        <h3>${escapeHtml(lesson.title)}</h3>
      </div>
      <button type="button" class="lesson-complete-btn" data-lesson-slug="${escapeHtml(lesson.slug)}" data-mode="${mode}" ${disabled ? 'disabled' : ''}>${escapeHtml(buttonText)}</button>
    </div>
    <p class="lesson-intro">${escapeHtml(lesson.intro || lesson.description || '')}</p>
    <div class="lesson-audio">${audioPlayer}</div>
    <div class="lesson-columns">
      <div>
        <h4>Vocabulario</h4>
        <div class="lesson-vocabulary">${vocabulary}</div>
      </div>
      <div>
        <h4>Diálogo</h4>
        <div class="lesson-dialogue">${dialogue}</div>
      </div>
    </div>
    <div class="lesson-exercises">${exercises}</div>
  `;
}

// The right panel is never empty: with no lesson explicitly opened yet it
// shows a "continue" card for the next recommended lesson; once the student
// picks a node in the path it shows that lesson's full detail. Both branches
// fully own workspace.innerHTML (see the delegated .lesson-complete-btn/
// .learn-back-to-route/.lesson-continue-btn handlers below - they can't be
// one-time listeners bound to a single element, since that element gets
// replaced on every render).
function renderLessonWorkspace() {
  const workspace = document.getElementById('lessonWorkspace');
  if (!workspace) return;
  if (!learningPathState.lessons.length) return;

  const activeLesson = learningPathState.activeSlug
    ? learningPathState.lessons.find((item) => item.slug === learningPathState.activeSlug)
    : null;

  if (activeLesson) {
    workspace.innerHTML = renderLessonDetail(activeLesson);
    workspace.classList.remove('lesson-workspace--continue');
    return;
  }

  const nextLesson = getNextRecommendedLesson();
  if (!nextLesson) return;
  workspace.innerHTML = renderContinueCard(nextLesson);
  workspace.classList.add('lesson-workspace--continue');
}

function renderLearningPath() {
  renderSkillGraph();
  renderLessonWorkspace();
  renderSkillCards();
  updateAiTutorContext();
}

const SKILL_LABELS = {
  listening: 'Listening',
  speaking: 'Speaking',
  reading: 'Reading',
  writing: 'Writing',
  grammar: 'Grammar',
  vocabulary: 'Vocabulary'
};

// Populates each of the 6 skill-competency-cards with real status/progress/XP
// for the current language+level, instead of the bare icon+name they show
// before the first lesson list loads.
function renderSkillCards() {
  document.querySelectorAll('.skill-competency-card').forEach((card) => {
    const skill = card.dataset.skill;
    const statusEl = card.querySelector('.skill-card-status');
    const progressBar = card.querySelector('.skill-card-progress div');
    const progressWrap = card.querySelector('.skill-card-progress');
    const xpEl = card.querySelector('.skill-card-xp');

    const lesson = learningPathState.lessons.find((item) => item.skill === skill);
    if (!lesson) {
      if (statusEl) {
        statusEl.textContent = learningPathState.lessons.length
          ? 'No disponible en este nivel'
          : 'Cargando…';
        statusEl.className = 'skill-card-status skill-card-status-loading';
      }
      if (progressWrap) progressWrap.hidden = true;
      if (xpEl) xpEl.textContent = '';
      return;
    }

    // Unit-aware languages (English A1 today) have up to 12 activities per
    // skill instead of one - the card becomes a library entry point, so its
    // status/progress summarize all of that skill's activities rather than
    // a single lesson's.
    if (hasUnits()) {
      const activities = getSkillActivities(skill);
      const completedCount = activities.filter((item) => item.completed).length;
      const pct = activities.length ? Math.round((completedCount / activities.length) * 100) : 0;
      if (statusEl) {
        statusEl.textContent = `${completedCount}/${activities.length} completadas`;
        statusEl.className = 'skill-card-status skill-card-status-available';
      }
      if (progressWrap) {
        progressWrap.hidden = false;
        progressWrap.setAttribute('aria-label', `Progreso: ${pct}%`);
      }
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (xpEl) xpEl.textContent = `${activities.length} actividades`;
      card.setAttribute(
        'aria-label',
        `${SKILL_LABELS[skill] || skill}: biblioteca, ${completedCount}/${activities.length} completadas`
      );
      return;
    }

    // Listening's status depends on which audio source is actually
    // available (GET /api/listening/audio) rather than being permanently
    // "Próximamente" - see spec §12's 3 real states.
    if (skill === 'listening') {
      if (statusEl) {
        statusEl.textContent = 'Comprobando disponibilidad…';
        statusEl.className = 'skill-card-status skill-card-status-loading';
      }
      if (progressWrap) progressWrap.hidden = true;
      if (xpEl) xpEl.textContent = '';
      card.setAttribute('aria-label', 'Listening: comprobando disponibilidad');
      fetchListeningAudioStatus(lesson).then((data) => {
        if (!statusEl) return;
        const { total, attempted } = getExerciseProgress(lesson);
        const pct = total ? Math.round((attempted / total) * 100) : 0;
        if (data.status === 'official') {
          statusEl.textContent = 'Disponible';
          statusEl.className = 'skill-card-status skill-card-status-available';
          if (progressWrap) {
            progressWrap.hidden = false;
            progressWrap.setAttribute('aria-label', `Progreso: ${pct}%`);
          }
          if (progressBar) progressBar.style.width = `${pct}%`;
          if (xpEl) xpEl.textContent = `+${lesson.xpReward || 20} XP`;
          card.setAttribute(
            'aria-label',
            `Listening: disponible, ${pct}% completado, ${lesson.xpReward || 20} XP`
          );
        } else if (data.status === 'ai-available') {
          statusEl.textContent = 'Práctica IA disponible';
          statusEl.className = 'skill-card-status skill-card-status-available';
          card.setAttribute('aria-label', 'Listening: práctica generada por IA disponible');
        } else {
          statusEl.textContent = 'Intenta más tarde';
          statusEl.className = 'skill-card-status skill-card-status-soon';
          card.setAttribute('aria-label', 'Listening: intenta más tarde');
        }
      });
      return;
    }

    const { total, attempted } = getExerciseProgress(lesson);
    const pct = total ? Math.round((attempted / total) * 100) : 0;
    if (statusEl) {
      statusEl.textContent = 'Disponible';
      statusEl.className = 'skill-card-status skill-card-status-available';
    }
    if (progressWrap) {
      progressWrap.hidden = false;
      progressWrap.setAttribute('aria-label', `Progreso: ${pct}%`);
    }
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (xpEl) xpEl.textContent = `+${lesson.xpReward || 20} XP`;
    card.setAttribute(
      'aria-label',
      `${SKILL_LABELS[skill] || skill}: disponible, ${pct}% completado, ${lesson.xpReward || 20} XP`
    );
  });
}

// ---------------------------------------------------------------------
// Dedicated skill views (Reading/Writing/Speaking/Grammar/Vocabulary each
// get their own routed view instead of swapping content inside the small
// #learning-path lesson-workspace card). Listening is now a real view too -
// see the dedicated Listening block further below for its audio-source/
// player/transcript/question logic and docs/audio-architecture.md for the
// two-source (official vs AI-generated) design.
// ---------------------------------------------------------------------

// Writes the bridge/target/level pills + "Aprenderás X con apoyo en Y"
// sentence shared by every skill view header, from the same state
// updatePathPairPreview() already uses - so it can never disagree with #learn.
function renderSkillViewHeader(section) {
  if (!section) return;
  const bridgeLabel = languageDisplayNames[currentBridgeLanguage] || currentBridgeLanguage;
  const targetLabel =
    languageDisplayNames[learningPathState.language] || learningPathState.language;
  const level = learningPathState.level;
  const bridgeEl = section.querySelector('[data-field="bridge"]');
  const targetEl = section.querySelector('[data-field="target"]');
  const levelEl = section.querySelector('[data-field="level"]');
  const sentenceEl = section.querySelector('[data-field="sentence"]');
  if (bridgeEl) bridgeEl.textContent = bridgeLabel;
  if (targetEl) targetEl.textContent = targetLabel;
  if (levelEl) levelEl.textContent = level;
  if (sentenceEl) sentenceEl.textContent = `Aprenderás ${targetLabel} con apoyo en ${bridgeLabel}.`;
}

function openChangeCombinationPopover() {
  const popover = document.getElementById('changeComboPopover');
  if (!popover) return;
  const bridgeSelect = document.getElementById('comboBridgeSelect');
  const languageSelect = document.getElementById('comboLanguageSelect');
  const levelSelect = document.getElementById('comboLevelSelect');
  if (bridgeSelect) bridgeSelect.value = currentBridgeLanguage;
  if (languageSelect) languageSelect.value = learningPathState.language;
  if (levelSelect) levelSelect.value = learningPathState.level;
  popover.hidden = false;
  popover.removeAttribute('inert');
  bridgeSelect?.focus();
}

function closeChangeCombinationPopover() {
  const popover = document.getElementById('changeComboPopover');
  if (!popover) return;
  popover.hidden = true;
  popover.setAttribute('inert', '');
}

function applyChangeCombination() {
  const bridgeSelect = document.getElementById('comboBridgeSelect');
  const languageSelect = document.getElementById('comboLanguageSelect');
  const levelSelect = document.getElementById('comboLevelSelect');
  if (!bridgeSelect || !languageSelect || !levelSelect) return;

  if (!setBridgeLanguage(bridgeSelect.value)) return;
  if (!setTargetLanguage(languageSelect.value, { level: levelSelect.value })) return;
  closeChangeCombinationPopover();
  showView(getViewFromHash());
}

const SKILL_VIEW_RENDERERS = {
  listening: (section, lesson) => renderListeningView(section, lesson),
  reading: (section, lesson) => renderReadingView(section, lesson),
  writing: (section, lesson) => renderWritingView(section, lesson),
  speaking: (section, lesson) => renderSpeakingView(section, lesson),
  grammar: (section, lesson) => renderGrammarView(section, lesson),
  vocabulary: (section, lesson) => renderVocabularyView(section, lesson)
};

// The section's "← Volver a la ruta" link is static markup (untouched by
// renderSkillView's .skill-view-content re-renders), so its label/behavior
// is toggled in place: back-to-the-Ruta-tab by default, or back-to-this-
// skill's-library when a unit-aware language (English A1) has an activity
// open from that library. onclick assignment (not addEventListener) is
// intentionally idempotent - each call just replaces the previous handler.
function updateSkillViewBackLink(section, skill, showLibraryBack) {
  const link = section.querySelector('.back-to-route-btn');
  if (!link) return;
  if (showLibraryBack) {
    link.textContent = '← Volver a la biblioteca';
    link.href = `#${skill}`;
    link.onclick = (event) => {
      event.preventDefault();
      learningPathState.activeSlug = '';
      renderSkillView(skill);
    };
  } else {
    link.textContent = '← Volver a la ruta';
    link.href = '#learn';
    link.onclick = null;
  }
}

// A grid of every activity for this skill across all units (e.g. every
// Reading activity in English A1), ordered by unit - this is what "Cuando
// el usuario seleccione Reading, debe abrir una biblioteca con todos los
// readings" asks for, instead of a single generic lesson per skill.
function renderSkillLibraryHtml(skill, activities) {
  if (!activities.length) {
    return `<p class="skill-graph-empty">No hay actividades de ${SKILL_LABELS[skill] || skill} disponibles en este nivel todavía.</p>`;
  }
  const nextSlug = getNextRecommendedLesson()?.slug;
  const cardsHtml = activities
    .map((item) => {
      const unit = learningPathState.units.find((u) => u.id === item.unitId);
      const duration = getLessonDurationMinutes(item);
      const xp = item.xpReward ?? item.xp_reward ?? 20;
      const state = getLessonStateInfo(item, false, nextSlug);
      return `
      <button type="button" class="skill-library-card skill-library-card--${state.key}" data-lesson-slug="${escapeHtml(item.slug)}">
        ${unit ? `<span class="skill-library-card-unit">Unidad ${escapeHtml(String(unit.order))} · ${escapeHtml(unit.title)}</span>` : ''}
        <span class="skill-library-card-title">${escapeHtml(item.title)}</span>
        <span class="skill-library-card-desc">${escapeHtml(item.description || '')}</span>
        <span class="skill-library-card-meta">
          ${duration ? `<span>⏱ ${escapeHtml(String(duration))} min</span>` : ''}
          <span>⭐ ${escapeHtml(String(xp))} XP</span>
          <span class="path-lesson-state path-lesson-state--${state.key}">${state.label}</span>
        </span>
      </button>
    `;
    })
    .join('');

  return `
    <p class="skill-library-intro">${activities.length} actividades de ${SKILL_LABELS[skill] || skill} en English A1, una por unidad.</p>
    <div class="skill-library-grid">${cardsHtml}</div>
  `;
}

function wireSkillLibrary(section, skill) {
  section.querySelectorAll('.skill-library-card').forEach((card) => {
    card.addEventListener('click', () => {
      learningPathState.activeSlug = card.dataset.lessonSlug;
      renderSkillView(skill);
    });
  });
}

// Dispatches to the right renderer for the currently-active skill view,
// loading lessons first if they haven't been fetched yet for this
// language/level (mirrors the loading guard the old inline card handler had).
// Unit-aware languages (English A1 today) get a library-then-detail flow
// (see renderSkillLibraryHtml/wireSkillLibrary above); every other
// language/level keeps the original single-lesson-per-skill behavior.
function renderSkillView(skill) {
  const section = document.getElementById(skill);
  if (!section) return;
  renderSkillViewHeader(section);

  const content = section.querySelector('.skill-view-content');
  if (!learningPathState.lessons.length) {
    if (content)
      content.innerHTML = `<p class="skill-graph-empty">Preparando ${SKILL_LABELS[skill] || skill}…</p>`;
    updateSkillViewBackLink(section, skill, false);
    loadLearningPath({ language: learningPathState.language, level: learningPathState.level }).then(
      () => renderSkillView(skill)
    );
    return;
  }

  if (hasUnits()) {
    const activities = getSkillActivities(skill);
    const selected = activities.find((item) => item.slug === learningPathState.activeSlug);
    section.dataset.activeLessonSlug = selected?.slug || '';

    if (!selected) {
      if (content) content.innerHTML = renderSkillLibraryHtml(skill, activities);
      updateSkillViewBackLink(section, skill, false);
      wireSkillLibrary(section, skill);
      return;
    }

    updateSkillViewBackLink(section, skill, true);
    SKILL_VIEW_RENDERERS[skill]?.(section, selected);
    return;
  }

  const lesson = learningPathState.lessons.find((item) => item.skill === skill);
  section.dataset.activeLessonSlug = lesson?.slug || '';
  updateSkillViewBackLink(section, skill, false);
  if (!lesson) {
    if (content)
      content.innerHTML = `<p class="skill-graph-empty">No hay lección de ${SKILL_LABELS[skill] || skill} disponible en este nivel todavía.</p>`;
    return;
  }

  SKILL_VIEW_RENDERERS[skill]?.(section, lesson);
}

// Per-lesson UI-only state for the 3-part reading pagination (English A1
// today - see lesson.reading.parts) - which part is showing, whether the
// full text has been revealed, and a stable (shuffled once per lesson load)
// display order for the "put these events in order" activity, if any.
const readingPartRuntime = new Map();
function getReadingPartRuntime(lesson) {
  let runtime = readingPartRuntime.get(lesson.slug);
  if (!runtime) {
    const events = lesson.reading?.ordering?.events || [];
    const shuffledEvents = events
      .map((text, index) => ({ text, correctPosition: index + 1 }))
      .sort(() => Math.random() - 0.5);
    runtime = { currentPart: 0, showFullText: false, shuffledEvents };
    readingPartRuntime.set(lesson.slug, runtime);
  }
  return runtime;
}

// A plain 2-option True/False mcq is grouped under its own heading in the
// reading view so it reads as a distinct activity type, without needing a
// separate schema field - see scripts/content/english-a1-units.js, where
// these are authored as ordinary mcq exercises with ['True', 'False'] options.
function isTrueFalseExercise(item) {
  return (
    Array.isArray(item.options) &&
    item.options.length === 2 &&
    item.options.some((opt) => optionLabel(opt).trim().toLowerCase() === 'true')
  );
}

function renderReadingOrderingHtml(lesson, runtime) {
  const ordering = lesson.reading?.ordering;
  if (!ordering?.events?.length) return '';
  const optionsHtml = ordering.events
    .map((_, position) => `<option value="${position + 1}">${position + 1}</option>`)
    .join('');

  const itemsHtml = runtime.shuffledEvents
    .map(
      (event, index) => `
      <li class="reading-ordering-item">
        <select class="reading-ordering-select" data-index="${index}" aria-label="Posición del evento ${index + 1}">
          <option value="">#</option>
          ${optionsHtml}
        </select>
        <span>${escapeHtml(event.text)}</span>
      </li>
    `
    )
    .join('');

  return `
    <div class="reading-ordering no-print">
      <h4>Ordena los acontecimientos</h4>
      <p class="reading-ordering-prompt">${escapeHtml(ordering.prompt)}</p>
      <ol class="reading-ordering-list">${itemsHtml}</ol>
      <button type="button" class="secondary-btn reading-ordering-check-btn">Comprobar orden</button>
      <span class="reading-ordering-feedback" aria-live="polite"></span>
    </div>
  `;
}

function renderReadingView(section, lesson) {
  const content = section.querySelector('.skill-view-content');
  if (!content) return;
  const { total, attempted } = getExerciseProgress(lesson);
  const pct = total ? Math.round((attempted / total) * 100) : 0;
  const parts = lesson.reading?.parts;
  const hasParts = Array.isArray(parts) && parts.length > 0;
  const paragraphs = hasParts
    ? parts
    : (lesson.reading?.text || lesson.description || '').split(/\n+/).filter(Boolean);
  const vocabHtml = (lesson.vocabulary || [])
    .map(
      (item) => `
    <div class="reading-vocab-item">
      <strong>${escapeHtml(item.word)}</strong>
      <span class="reading-vocab-support" hidden>${escapeHtml(resolveVocabTranslation(item))}</span>
    </div>
  `
    )
    .join('');
  const reflectHtml = (lesson.reading?.questions || [])
    .map((q) => `<li>${escapeHtml(q)}</li>`)
    .join('');
  const mcqExercises = (lesson.exercises || []).filter((item) => item.type === 'mcq');
  const trueFalseExercises = mcqExercises.filter(isTrueFalseExercise);
  const comprehensionExercises = mcqExercises.filter((item) => !isTrueFalseExercise(item));
  const exercisesHtml = comprehensionExercises
    .map((item, index) => renderLessonExercise(item, index, lesson))
    .join('');
  const trueFalseHtml = trueFalseExercises
    .map((item, index) => renderLessonExercise(item, comprehensionExercises.length + index, lesson))
    .join('');
  const bridgeLabel = languageDisplayNames[currentBridgeLanguage] || currentBridgeLanguage;
  const targetLabel =
    languageDisplayNames[learningPathState.language] || learningPathState.language;
  const canSpeak = supportsSpeech();
  const speakLocale = getPronunciationLocale(learningPathState.language);
  const speakRate = getDefaultPronunciationRate();

  // Paginated part viewer (English A1's 3-part readings) vs. the original
  // single-block layout (every reading without lesson.reading.parts - every
  // other language, unaffected) - both end up inside the same print area, so
  // downloading a PDF always shows the complete text either way.
  let readingBodyHtml;
  if (hasParts) {
    const runtime = getReadingPartRuntime(lesson);
    const currentPart = Math.min(runtime.currentPart, parts.length - 1);
    const isLastPart = currentPart === parts.length - 1;
    readingBodyHtml = `
      <div class="reading-part-viewer no-print">
        <p class="reading-part-progress">Parte ${currentPart + 1} de ${parts.length}</p>
        <div class="reading-part-text"><p>${escapeHtml(parts[currentPart])}</p></div>
        <div class="reading-part-actions">
          ${
            canSpeak
              ? `<button type="button" class="secondary-btn reading-part-listen-btn" data-speak-text="${escapeHtml(parts[currentPart])}" data-speak-locale="${escapeHtml(speakLocale)}" data-speak-rate="${speakRate}">🔊 Escuchar esta parte</button>`
              : ''
          }
          <button type="button" class="secondary-btn reading-part-prev-btn" ${currentPart === 0 ? 'disabled' : ''}>← Anterior</button>
          ${
            isLastPart
              ? `<button type="button" class="secondary-btn reading-part-showfull-btn">${runtime.showFullText ? 'Ocultar texto completo' : 'Ver texto completo'}</button>`
              : `<button type="button" class="primary-btn reading-part-next-btn">Continuar →</button>`
          }
        </div>
      </div>
      ${
        runtime.showFullText
          ? `<div class="reading-full-text no-print"><h4>Texto completo</h4>${parts.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>`
          : ''
      }
      <div class="reading-paragraphs print-only">${parts.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>
    `;
  } else {
    readingBodyHtml = `<div class="reading-paragraphs">${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>`;
  }

  content.innerHTML = `
    <div class="reading-print-area" id="readingPrintArea">
      <div class="print-only reading-print-header">
        <div class="reading-print-logo">ANDERGO</div>
        <p>${escapeHtml(bridgeLabel)} → ${escapeHtml(targetLabel)} · ${escapeHtml(lesson.level)}</p>
        <p class="reading-print-date">${escapeHtml(new Date().toLocaleDateString('es'))}</p>
      </div>
      <h3>${escapeHtml(lesson.title)}</h3>
      <p class="reading-level-tag">${escapeHtml(lesson.level)} · Reading</p>
      <div class="reading-progress-bar no-print" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div style="width:${pct}%"></div></div>
      ${readingBodyHtml}
      <div class="reading-vocab-section no-print">
        <button type="button" class="secondary-btn reading-toggle-vocab">Ver vocabulario</button>
        <div class="reading-vocab-list" hidden>${vocabHtml}</div>
      </div>
      <div class="reading-support-toggle no-print">
        <button type="button" class="secondary-btn reading-show-support">Mostrar apoyo en español</button>
        <button type="button" class="secondary-btn reading-hide-support" hidden>Ocultar apoyo</button>
      </div>
      ${reflectHtml ? `<div class="reading-reflect"><h4>Reflexiona</h4><ul>${reflectHtml}</ul></div>` : ''}
      <div class="reading-questions">
        <h4>Preguntas de comprensión</h4>
        ${exercisesHtml || '<p class="skill-graph-empty">No hay preguntas de comprensión para esta lección.</p>'}
      </div>
      ${
        trueFalseHtml
          ? `<div class="reading-questions"><h4>Verdadero o falso</h4>${trueFalseHtml}</div>`
          : ''
      }
      ${renderReadingOrderingHtml(lesson, hasParts ? getReadingPartRuntime(lesson) : { shuffledEvents: [] })}
      <div class="reading-print-answer-space print-only">
        <h4>Tus respuestas</h4>
        <div class="reading-print-answer-lines"><div></div><div></div><div></div><div></div></div>
      </div>
    </div>
    <div class="skill-view-tutor-cta no-print">
      <button type="button" class="secondary-btn open-tutor-btn" data-tutor-prompt="Explícame este párrafo: ${escapeHtml(paragraphs[0] || lesson.title)}" data-support-mode="explain">Explicar este párrafo</button>
      <button type="button" class="secondary-btn open-tutor-btn" data-tutor-prompt="Resume esta lectura en un par de frases." data-support-mode="explain">Resumir con Tutor IA</button>
      <button type="button" class="secondary-btn open-tutor-btn" data-tutor-prompt="Dame una pista para responder las preguntas de comprensión, sin darme la respuesta." data-support-mode="hint">Pedir pista</button>
      <button type="button" class="secondary-btn open-tutor-btn" data-tutor-prompt="Crea otra pregunta de comprensión sobre este texto." data-support-mode="practice">Crear otra pregunta</button>
      <button type="button" class="primary-btn reading-print-btn">Descargar PDF</button>
    </div>
  `;
}

function renderWritingView(section, lesson) {
  const content = section.querySelector('.skill-view-content');
  if (!content) return;
  const writingExercise = (lesson.exercises || []).find((item) => item.type === 'writing');
  const draftKey = `andergoWritingDraft:${lesson.slug}`;
  const savedDraft = localStorage.getItem(draftKey) || '';
  const wordLimit = 80;

  content.innerHTML = `
    <h3>${escapeHtml(lesson.title)}</h3>
    <p class="writing-consigna">${escapeHtml(writingExercise?.prompt || lesson.mission || lesson.intro || '')}</p>
    <div class="writing-model">
      <strong>Modelo</strong>
      <p>${escapeHtml(lesson.dialogue?.[0]?.line || lesson.phrases?.[0] || '')}</p>
    </div>
    <div class="writing-connectors">
      <strong>Vocabulario y conectores</strong>
      <div class="writing-connectors-list">${(lesson.phrases || []).map((p) => `<span>${escapeHtml(p)}</span>`).join('')}</div>
    </div>
    <label class="writing-editor-label" for="writingEditor">Tu texto <span class="writing-word-limit">(límite sugerido: ${wordLimit} palabras)</span></label>
    <textarea id="writingEditor" class="writing-editor" rows="10">${escapeHtml(savedDraft)}</textarea>
    <p class="writing-word-count" id="writingWordCount">0 palabras</p>
    <div class="skill-view-tutor-cta">
      <button type="button" class="secondary-btn writing-review-btn" data-support-mode="review-grammar">Revisar gramática</button>
      <button type="button" class="secondary-btn writing-review-btn" data-support-mode="review-vocabulary">Mejorar vocabulario</button>
      <button type="button" class="secondary-btn writing-review-btn" data-support-mode="review-coherence">Revisar coherencia</button>
      <button type="button" class="secondary-btn writing-review-btn" data-support-mode="explain-errors">Explicar errores en español</button>
      <button type="button" class="secondary-btn writing-review-btn" data-support-mode="hint">Darme una pista</button>
    </div>
    <div class="writing-tutor-panel" id="writingTutorPanel" hidden>
      <div class="writing-tutor-original"><strong>Original</strong><p></p></div>
      <div class="writing-tutor-suggestion"><strong>Sugerencia del Tutor IA</strong><p></p></div>
      <div class="writing-tutor-current" hidden><strong>Tu texto actual</strong><p></p></div>
      <div class="writing-tutor-actions">
        <button type="button" class="secondary-btn writing-compare-btn">Comparar versiones</button>
        <button type="button" class="secondary-btn writing-reject-btn">Rechazar</button>
        <button type="button" class="primary-btn writing-accept-btn">Aceptar</button>
      </div>
    </div>
  `;

  const editor = content.querySelector('#writingEditor');
  const wordCountEl = content.querySelector('#writingWordCount');
  const updateWordCount = () => {
    const words = editor.value.trim().split(/\s+/).filter(Boolean).length;
    wordCountEl.textContent = `${words} palabra${words === 1 ? '' : 's'}`;
    localStorage.setItem(draftKey, editor.value);
  };
  editor?.addEventListener('input', updateWordCount);
  updateWordCount();
}

// Speaking recorder state - kept in memory only, never in localStorage/
// sessionStorage/IndexedDB. teardownSpeakingResources() is the single place
// that releases the mic, stops the MediaRecorder, and revokes the object
// URL; resetSpeakingRecorder() calls it and returns the UI to idle. Both are
// safe to call at any time, including when nothing is active (no-op).
let speakingRecorder = {
  mediaRecorder: null,
  stream: null,
  recordedChunks: [],
  audioBlob: null,
  audioUrl: null,
  audioEl: null,
  mimeType: '',
  timerId: null,
  elapsedSeconds: 0,
  status: 'idle', // idle | requesting | recording | stopped | sending | denied | unsupported
  config: { minimumSeconds: 30, maximumSeconds: 60, allowShortSubmission: false },
  container: null
};

function pickSpeakingMimeType() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4'
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

function teardownSpeakingResources() {
  const r = speakingRecorder;
  if (r.timerId) {
    window.clearInterval(r.timerId);
    r.timerId = null;
  }
  if (r.mediaRecorder && r.mediaRecorder.state !== 'inactive') {
    try {
      r.mediaRecorder.stop();
    } catch {
      /* already stopped/inactive */
    }
  }
  r.stream?.getTracks().forEach((track) => track.stop());
  if (r.audioEl) {
    try {
      r.audioEl.pause();
    } catch {
      /* ignore */
    }
    r.audioEl.src = '';
  }
  if (r.audioUrl) URL.revokeObjectURL(r.audioUrl);
  r.mediaRecorder = null;
  r.stream = null;
  r.recordedChunks = [];
  r.audioBlob = null;
  r.audioUrl = null;
  r.audioEl = null;
  r.elapsedSeconds = 0;
}

// Called on: Eliminar, before Volver a grabar, on lesson/language/skill
// navigation (showView), and on window unload - covers every cleanup
// trigger the feature requires without needing a cleanup call at each site.
function resetSpeakingRecorder() {
  teardownSpeakingResources();
  speakingRecorder.status = 'idle';
  if (speakingRecorder.container && document.body.contains(speakingRecorder.container)) {
    updateSpeakingUI(speakingRecorder.container);
  }
}

function formatSpeakingTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function updateSpeakingUI(container) {
  if (!container) return;
  const r = speakingRecorder;
  const byAction = (action) => container.querySelector(`[data-recording-action="${action}"]`);
  const meetsMinimum = r.elapsedSeconds >= r.config.minimumSeconds || r.config.allowShortSubmission;

  const disabledByStatus = {
    idle: { record: false, stop: true, play: true, delete: true, redo: true, send: true },
    requesting: { record: true, stop: true, play: true, delete: true, redo: true, send: true },
    recording: { record: true, stop: false, play: true, delete: false, redo: true, send: true },
    stopped: {
      record: true,
      stop: true,
      play: false,
      delete: false,
      redo: false,
      send: !meetsMinimum
    },
    sending: { record: true, stop: true, play: true, delete: true, redo: true, send: true },
    denied: { record: false, stop: true, play: true, delete: true, redo: true, send: true },
    unsupported: { record: true, stop: true, play: true, delete: true, redo: true, send: true }
  };
  const d = disabledByStatus[r.status] || disabledByStatus.idle;
  ['record', 'stop', 'play', 'delete', 'redo', 'send'].forEach((action) => {
    const btn = byAction(action);
    if (btn) btn.disabled = d[action];
  });

  const statusLabels = {
    idle: 'Disponible',
    requesting: 'Preparando micrófono…',
    recording: 'Grabando…',
    stopped: 'Listo para escuchar',
    sending: 'Enviando…',
    denied: 'No se pudo acceder al micrófono. Revisa los permisos de tu navegador.',
    unsupported: 'Tu navegador no admite grabación de audio. Usa la respuesta escrita.'
  };
  const statusEl = container.querySelector('.speaking-record-status');
  if (statusEl) statusEl.textContent = statusLabels[r.status] || '';

  const timerEl = container.querySelector('.speaking-record-timer');
  if (timerEl) {
    timerEl.hidden = r.status === 'idle' || r.status === 'unsupported' || r.status === 'denied';
    timerEl.textContent = `${formatSpeakingTime(r.elapsedSeconds)} / ${formatSpeakingTime(r.config.maximumSeconds)}`;
  }

  const warningEl = container.querySelector('.speaking-record-warning');
  if (warningEl) {
    const showWarning = r.status === 'stopped' && !meetsMinimum;
    warningEl.hidden = !showWarning;
    if (showWarning) {
      warningEl.textContent = `Tu respuesta es muy corta. Intenta hablar al menos ${r.config.minimumSeconds} segundos.`;
    }
  }
}

async function startSpeakingRecording(container) {
  const r = speakingRecorder;
  if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    r.status = 'unsupported';
    updateSpeakingUI(container);
    return;
  }

  r.status = 'requesting';
  updateSpeakingUI(container);

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    r.status = 'denied';
    updateSpeakingUI(container);
    return;
  }

  const mimeType = pickSpeakingMimeType();
  const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  r.stream = stream;
  r.mediaRecorder = recorder;
  r.mimeType = mimeType || recorder.mimeType || 'audio/webm';
  r.recordedChunks = [];
  r.elapsedSeconds = 0;

  recorder.addEventListener('dataavailable', (event) => {
    if (event.data && event.data.size > 0) r.recordedChunks.push(event.data);
  });
  recorder.addEventListener('stop', () => {
    r.audioBlob = new Blob(r.recordedChunks, { type: r.mimeType });
    r.audioUrl = URL.createObjectURL(r.audioBlob);
    r.stream?.getTracks().forEach((track) => track.stop());
    r.stream = null;
    r.status = 'stopped';
    updateSpeakingUI(container);
  });

  recorder.start();
  r.status = 'recording';
  updateSpeakingUI(container);

  r.timerId = window.setInterval(() => {
    r.elapsedSeconds += 1;
    updateSpeakingUI(container);
    if (r.elapsedSeconds >= r.config.maximumSeconds) stopSpeakingRecording();
  }, 1000);
}

function stopSpeakingRecording() {
  const r = speakingRecorder;
  if (r.timerId) {
    window.clearInterval(r.timerId);
    r.timerId = null;
  }
  if (r.mediaRecorder && r.mediaRecorder.state !== 'inactive') r.mediaRecorder.stop();
}

function playSpeakingRecording() {
  const r = speakingRecorder;
  if (!r.audioUrl) return;
  if (!r.audioEl) r.audioEl = new Audio();
  r.audioEl.src = r.audioUrl;
  r.audioEl.play().catch(() => {});
}

function deleteSpeakingRecording(container) {
  teardownSpeakingResources();
  speakingRecorder.status = 'idle';
  updateSpeakingUI(container);
}

function redoSpeakingRecording(container) {
  teardownSpeakingResources();
  speakingRecorder.status = 'idle';
  startSpeakingRecording(container);
}

async function sendSpeakingRecording(container, lesson) {
  const r = speakingRecorder;
  if (!r.audioBlob) return;
  r.status = 'sending';
  updateSpeakingUI(container);

  const ext = r.mimeType.includes('ogg') ? 'ogg' : r.mimeType.includes('mp4') ? 'mp4' : 'webm';
  const formData = new FormData();
  formData.append('audio', r.audioBlob, `speaking-response.${ext}`);
  formData.append('language', learningPathState.language || '');
  formData.append('level', learningPathState.level || '');
  formData.append('lessonId', lesson?.slug || '');
  formData.append('expectedPrompt', lesson?.dialogue?.[0]?.line || lesson?.phrases?.[0] || '');
  formData.append('durationSeconds', String(r.elapsedSeconds));

  const resultEl = container.querySelector('.speaking-record-result');

  try {
    const response = await fetch(`${backendBaseUrl}/api/speaking/analyze`, {
      method: 'POST',
      headers: { ...authHeaders() },
      body: formData
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || 'No se pudo procesar el audio.');

    teardownSpeakingResources();
    r.status = 'idle';
    updateSpeakingUI(container);
    if (resultEl) {
      resultEl.hidden = false;
      resultEl.textContent = data.analyzed
        ? data.feedback || 'Audio procesado y eliminado de forma segura.'
        : `${data.message} Audio procesado y eliminado de forma segura.`;
    }
  } catch (error) {
    r.status = 'stopped';
    updateSpeakingUI(container);
    if (resultEl) {
      resultEl.hidden = false;
      resultEl.textContent = error.message || 'No se pudo enviar el audio. Intenta de nuevo.';
    }
  }
}

function renderSpeakingView(section, lesson) {
  const content = section.querySelector('.skill-view-content');
  if (!content) return;
  resetSpeakingRecorder();

  const situacion = lesson.mission || lesson.intro || lesson.description || '';
  const fraseModelo = lesson.dialogue?.[0]?.line || lesson.phrases?.[0] || '';
  const taskConfig = {
    minimumSeconds: 30,
    maximumSeconds: 60,
    allowShortSubmission: false,
    ...(lesson.speakingTask || {})
  };
  speakingRecorder.config = taskConfig;

  content.innerHTML = `
    <h3>${escapeHtml(lesson.title)}</h3>
    <p class="speaking-situation"><strong>Situación:</strong> ${escapeHtml(situacion)}</p>
    <p class="speaking-model"><strong>Frase modelo:</strong> ${escapeHtml(fraseModelo)}</p>
    <label class="speaking-response-label" for="speakingResponse">Tu respuesta (escrita)</label>
    <textarea id="speakingResponse" class="speaking-response" rows="4" placeholder="Escribe lo que dirías…"></textarea>

    <div class="speaking-record-row" role="group" aria-label="Grabación de voz">
      <button type="button" class="speaking-record-btn" data-recording-action="record" aria-label="Grabar respuesta">🔴 Grabar</button>
      <button type="button" class="speaking-record-btn" data-recording-action="stop" aria-label="Detener grabación">⏹ Detener</button>
      <button type="button" class="speaking-record-btn" data-recording-action="play" aria-label="Reproducir grabación">▶ Reproducir</button>
      <button type="button" class="speaking-record-btn" data-recording-action="delete" aria-label="Eliminar grabación">🗑 Eliminar</button>
      <button type="button" class="speaking-record-btn" data-recording-action="redo" aria-label="Volver a grabar">↺ Volver a grabar</button>
      <button type="button" class="speaking-record-btn" data-recording-action="send" aria-label="Enviar grabación">📤 Enviar</button>
    </div>
    <p class="speaking-record-status" aria-live="polite"></p>
    <p class="speaking-record-timer" hidden></p>
    <p class="speaking-record-warning" role="alert" hidden></p>
    <p class="speaking-record-result" aria-live="polite" hidden></p>
    <p class="speaking-record-note">La grabación se procesa temporalmente y no se conserva.</p>

    <div class="skill-view-tutor-cta">
      <button type="button" class="primary-btn open-tutor-btn" data-tutor-prompt="Quiero practicar esta conversación: ${escapeHtml(situacion)}" data-support-mode="practice">Practicar con Tutor IA</button>
    </div>
  `;

  // `content`, not just the button row, is used as the shared reference so
  // updateSpeakingUI can also reach the status/timer/warning/result <p>
  // elements, which are siblings of .speaking-record-row rather than
  // children of it.
  speakingRecorder.container = content;
  updateSpeakingUI(content);

  content.querySelector('[data-recording-action="record"]')?.addEventListener('click', () => {
    startSpeakingRecording(content);
  });
  content.querySelector('[data-recording-action="stop"]')?.addEventListener('click', () => {
    stopSpeakingRecording();
  });
  content.querySelector('[data-recording-action="play"]')?.addEventListener('click', () => {
    playSpeakingRecording();
  });
  content.querySelector('[data-recording-action="delete"]')?.addEventListener('click', () => {
    deleteSpeakingRecording(content);
  });
  content.querySelector('[data-recording-action="redo"]')?.addEventListener('click', () => {
    redoSpeakingRecording(content);
  });
  content.querySelector('[data-recording-action="send"]')?.addEventListener('click', () => {
    sendSpeakingRecording(content, lesson);
  });
}

window.addEventListener('beforeunload', () => {
  teardownSpeakingResources();
});

function renderGrammarView(section, lesson) {
  const content = section.querySelector('.skill-view-content');
  if (!content) return;
  const example = lesson.dialogue?.[0] || lesson.vocabulary?.[0] || null;
  const exercisesHtml = (lesson.exercises || [])
    .filter((item) => item.type === 'mcq')
    .map((item, index) => renderLessonExercise(item, index, lesson))
    .join('');

  content.innerHTML = `
    <h3>${escapeHtml(lesson.title)}</h3>
    <div class="grammar-explanation">
      <strong>Estructura</strong>
      <p>${escapeHtml(lesson.grammar || lesson.description || '')}</p>
    </div>
    ${
      example
        ? `
      <div class="grammar-example">
        <div class="grammar-example-target"><span>Target</span><strong>${escapeHtml(example.line || example.word || '')}</strong></div>
        <div class="grammar-example-bridge"><span>Bridge</span><strong>${escapeHtml(resolveVocabTranslation(example))}</strong></div>
      </div>
    `
        : ''
    }
    <div class="grammar-exercise">
      <h4>Mini ejercicio</h4>
      ${exercisesHtml || '<p class="skill-graph-empty">No hay ejercicios de gramática para esta lección.</p>'}
    </div>
    <div class="skill-view-tutor-cta">
      <button type="button" class="primary-btn open-tutor-btn" data-tutor-prompt="Explícame por qué se usa esta estructura: ${escapeHtml(lesson.grammar || '')}" data-support-mode="explain">Explícame esta estructura</button>
    </div>
  `;
}

// Flashcards accept term/translation/example plus optional per-card
// pronunciationText/pronunciationLocale/pronunciationRate overrides (falling
// back to the word itself / the current target language's locale / the
// level-based default rate) - see speakText()/getPronunciationLocale()/
// getDefaultPronunciationRate() above.
function renderVocabularyView(section, lesson) {
  const content = section.querySelector('.skill-view-content');
  if (!content) return;
  const cards = lesson.vocabulary || [];
  const canSpeak = supportsSpeech();
  const cardLocale = getPronunciationLocale(learningPathState.language);
  const cardRate = getDefaultPronunciationRate();

  content.innerHTML = `
    <h3>${escapeHtml(lesson.title)}</h3>
    <div class="vocab-card-deck">
      ${cards
        .map((item, index) => {
          const pronunciationText = item.pronunciationText || item.word;
          const locale = item.pronunciationLocale || cardLocale;
          const rate = item.pronunciationRate ?? cardRate;
          return `
        <div class="vocab-flip-card" data-index="${index}" data-speak-text="${escapeHtml(pronunciationText)}" data-speak-locale="${escapeHtml(locale)}" data-speak-rate="${rate}">
          <div class="vocab-flip-card-inner">
            <div class="vocab-flip-front">
              <strong>${escapeHtml(item.word)}</strong>
              ${
                canSpeak
                  ? `<button type="button" class="vocab-speak-btn" aria-label="Escuchar pronunciación de ${escapeHtml(item.word)}" title="Escuchar pronunciación">🔊</button>`
                  : ''
              }
            </div>
            <div class="vocab-flip-back">
              <strong>${escapeHtml(item.translation)}</strong>
              <p class="${canSpeak && item.example ? 'vocab-example-speak' : ''}" ${canSpeak && item.example ? `data-speak-text="${escapeHtml(item.example)}" data-speak-locale="${escapeHtml(locale)}" data-speak-rate="${rate}" role="button" tabindex="0" aria-label="Escuchar oración de ejemplo" title="Escuchar oración de ejemplo"` : ''}>${escapeHtml(item.example || '')}${canSpeak && item.example ? ' 🔊' : ''}</p>
            </div>
          </div>
          <div class="vocab-card-actions">
            <button type="button" class="vocab-flip-btn">Ver traducción</button>
            <button type="button" class="vocab-know-btn">Ya la sé</button>
            <button type="button" class="vocab-retry-btn">Practicar otra vez</button>
            <button type="button" class="vocab-example-btn open-tutor-btn" data-tutor-prompt="Dame otro ejemplo de una frase con la palabra '${escapeHtml(item.word)}'." data-support-mode="example">Pedir ejemplo</button>
          </div>
        </div>
      `;
        })
        .join('')}
    </div>
    <div class="skill-view-tutor-cta">
      <button type="button" class="primary-btn open-tutor-btn" data-tutor-prompt="Ayúdame a practicar este vocabulario: ${escapeHtml(cards.map((c) => c.word).join(', '))}" data-support-mode="practice">Practicar estas palabras</button>
    </div>
  `;
}

// ---------------------------------------------------------------------
// Listening: real player + dual audio source (official Supabase-hosted
// audio if published, otherwise an ephemeral AI-generated practice) +
// transcript + comprehension questions + Tutor IA context. See
// docs/audio-architecture.md for the two-source design and why
// AI-generated audio is never persisted in this phase.
// ---------------------------------------------------------------------

// Caches the /api/listening/audio status lookup per language+level+lesson so
// re-rendering after answering a comprehension question (see the
// .mcq-option handler) never refetches or rebuilds the <audio> element,
// which would otherwise reset playback to 0.
const listeningAudioStatusCache = new Map();
// Per-lesson UI-only state (never sent to the backend as truth): whether the
// transcript has been revealed, whether the student has pressed play at
// least once (drives the A1/A2 transcript gate), and the currently active
// AI-generated practice (if any) with its locally-graded answers.
const listeningViewRuntime = new Map();

function listeningStatusCacheKey(lesson) {
  return `${learningPathState.language}|${learningPathState.level}|${lesson.slug}`;
}

function getListeningRuntime(lesson) {
  let runtime = listeningViewRuntime.get(lesson.slug);
  if (!runtime) {
    runtime = {
      transcriptRevealed: false,
      hasPlayedOnce: false,
      transcriptSoftGateOverride: false,
      aiPractice: null,
      aiAnswers: {},
      usingSlow: false
    };
    listeningViewRuntime.set(lesson.slug, runtime);
  }
  return runtime;
}

async function fetchListeningAudioStatus(lesson) {
  const key = listeningStatusCacheKey(lesson);
  if (listeningAudioStatusCache.has(key)) return listeningAudioStatusCache.get(key);
  const promise = (async () => {
    try {
      const params = new URLSearchParams({
        language: learningPathState.language,
        level: learningPathState.level,
        lessonSlug: lesson.slug
      });
      const response = await fetch(`${backendBaseUrl}/api/listening/audio?${params.toString()}`, {
        headers: authHeaders()
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.error || 'No se pudo consultar el audio de Listening.');
      return data;
    } catch (error) {
      return {
        status: 'error',
        error: error.message || 'No se pudo consultar el audio de Listening.'
      };
    }
  })();
  listeningAudioStatusCache.set(key, promise);
  return promise;
}

function formatListeningTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getListeningAllAttempted(lesson, runtime) {
  if (runtime.aiPractice) {
    const total = runtime.aiPractice.questions?.length || 0;
    const attempted = Object.keys(runtime.aiAnswers || {}).length;
    return total > 0 && attempted >= total;
  }
  return getExerciseProgress(lesson).allAttempted;
}

// A1/A2: gently discourage reading before listening, but never hard-block
// (accessibility escape hatch). B1/B2: on demand. C1/C2: only as review,
// after every question has been attempted.
function getTranscriptGateState(level, runtime, allAttempted) {
  if (level === 'C1' || level === 'C2') return allAttempted ? 'open' : 'locked-until-review';
  if (level === 'A1' || level === 'A2')
    return runtime.hasPlayedOnce || runtime.transcriptSoftGateOverride ? 'open' : 'soft-gate';
  return 'open';
}

async function generateAiListeningPractice(lesson, topic) {
  const response = await fetch(`${backendBaseUrl}/api/listening/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      bridgeLanguage: currentBridgeLanguage,
      targetLanguage: learningPathState.language,
      level: learningPathState.level,
      topic: topic || lesson.title || 'greetings',
      durationSeconds: 30
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success)
    throw new Error(data.error || 'No se pudo generar la práctica de Listening.');
  return data;
}

function renderAiListeningQuestions(lesson, runtime) {
  const questions = runtime.aiPractice?.questions || [];
  if (!questions.length)
    return '<p class="skill-graph-empty">Esta práctica no incluyó preguntas de comprensión.</p>';
  return questions
    .map((q, index) => {
      const recorded = runtime.aiAnswers[index];
      const optionsHtml = (q.options || [])
        .map((opt, optIndex) => {
          const isChosen = recorded && recorded.selectedIndex === optIndex;
          const cls = isChosen ? (recorded.correct ? 'correct' : 'incorrect') : '';
          const disabled = recorded ? 'disabled' : '';
          return `<button type="button" class="mcq-option ai-listening-option ${cls}" data-question-index="${index}" data-option-index="${optIndex}" ${disabled}>${escapeHtml(opt)}</button>`;
        })
        .join('');
      const answeredClass = recorded
        ? `answered ${recorded.correct ? 'is-correct' : 'is-incorrect'}`
        : '';
      const feedbackText = recorded
        ? recorded.correct
          ? '¡Correcto!'
          : 'No es correcto. Puedes pedirle al Tutor IA que te explique por qué.'
        : '';
      return `
      <div class="mcq-question lesson-exercise ${answeredClass}" data-question-index="${index}">
        <strong>${index + 1}. ${escapeHtml(q.prompt)}</strong>
        <div class="mcq-options">${optionsHtml}</div>
        <span class="mcq-feedback" aria-live="polite">${feedbackText}</span>
      </div>
    `;
    })
    .join('');
}

function renderListeningTranscriptControls(content, lesson, runtime) {
  const controlsEl = content.querySelector('.listening-transcript-controls');
  const textEl = content.querySelector('.listening-transcript-text');
  if (!controlsEl || !textEl) return;
  const allAttempted = getListeningAllAttempted(lesson, runtime);
  const gate = getTranscriptGateState(lesson.level, runtime, allAttempted);

  if (gate === 'locked-until-review') {
    controlsEl.innerHTML = `
      <button type="button" class="secondary-btn listening-transcript-toggle" disabled>Ver transcripción</button>
      <p class="listening-transcript-note">Disponible como repaso después de responder todas las preguntas.</p>
    `;
    textEl.hidden = true;
    return;
  }

  if (gate === 'soft-gate') {
    controlsEl.innerHTML = `
      <button type="button" class="secondary-btn listening-transcript-toggle" disabled>Ver transcripción</button>
      <p class="listening-transcript-note">Te recomendamos escuchar el audio primero.
        <button type="button" class="secondary-btn listening-transcript-override-btn">Ver de todas formas</button>
      </p>
    `;
    textEl.hidden = true;
    controlsEl
      .querySelector('.listening-transcript-override-btn')
      ?.addEventListener('click', () => {
        runtime.transcriptSoftGateOverride = true;
        runtime.transcriptRevealed = true;
        textEl.hidden = false;
        renderListeningTranscriptControls(content, lesson, runtime);
      });
    return;
  }

  controlsEl.innerHTML = `<button type="button" class="secondary-btn listening-transcript-toggle">${runtime.transcriptRevealed ? 'Ocultar transcripción' : 'Ver transcripción'}</button>`;
  textEl.hidden = !runtime.transcriptRevealed;
  controlsEl.querySelector('.listening-transcript-toggle')?.addEventListener('click', () => {
    runtime.transcriptRevealed = !runtime.transcriptRevealed;
    textEl.hidden = !runtime.transcriptRevealed;
    renderListeningTranscriptControls(content, lesson, runtime);
  });
}

function buildListeningPlayerMarkup({ sourceLabel, sourceIsAi, title }) {
  return `
    <div class="listening-source-banner ${sourceIsAi ? 'is-ai' : 'is-official'}">
      <span class="listening-source-label">${escapeHtml(sourceLabel)}</span>
      ${sourceIsAi ? '<p class="listening-ai-disclosure">Práctica generada por IA. No es una grabación humana.</p>' : ''}
    </div>
    <h3 class="listening-title">${escapeHtml(title)}</h3>
    <div class="listening-player" data-state="preparing">
      <audio class="listening-audio-el" preload="metadata"></audio>
      <p class="listening-player-status" role="status" aria-live="polite">Preparando audio…</p>
      <div class="listening-player-controls">
        <button type="button" class="listening-ctrl-btn listening-play-btn" aria-label="Reproducir" disabled>▶ Reproducir</button>
        <button type="button" class="listening-ctrl-btn listening-restart-btn" aria-label="Reiniciar" disabled>⏮ Reiniciar</button>
        <button type="button" class="listening-ctrl-btn listening-repeat-btn" aria-label="Repetir audio" aria-pressed="false" disabled>🔁 Repetir</button>
        <button type="button" class="listening-ctrl-btn listening-speed-btn" aria-label="Cambiar a velocidad lenta" disabled>🐢 Velocidad lenta</button>
      </div>
      <div class="listening-player-progress-row">
        <span class="listening-time-elapsed" aria-hidden="true">0:00</span>
        <input type="range" class="listening-progress-range" min="0" max="100" value="0" step="1" aria-label="Progreso del audio" disabled>
        <span class="listening-time-duration" aria-hidden="true">0:00</span>
      </div>
      <label class="listening-volume-row">
        Volumen
        <input type="range" class="listening-volume-range" min="0" max="1" step="0.05" value="1" aria-label="Volumen">
      </label>
    </div>
    <div class="listening-transcript">
      <div class="listening-transcript-controls"></div>
      <div class="listening-transcript-text" hidden></div>
    </div>
  `;
}

function wireListeningPlayerControls(content, lesson, runtime, meta) {
  const playerEl = content.querySelector('.listening-player');
  const audioEl = content.querySelector('.listening-audio-el');
  const statusEl = content.querySelector('.listening-player-status');
  const playBtn = content.querySelector('.listening-play-btn');
  const restartBtn = content.querySelector('.listening-restart-btn');
  const repeatBtn = content.querySelector('.listening-repeat-btn');
  const speedBtn = content.querySelector('.listening-speed-btn');
  const elapsedEl = content.querySelector('.listening-time-elapsed');
  const durationEl = content.querySelector('.listening-time-duration');
  const rangeEl = content.querySelector('.listening-progress-range');
  const volumeEl = content.querySelector('.listening-volume-range');
  const textEl = content.querySelector('.listening-transcript-text');
  if (!audioEl || !playerEl) return;

  if (textEl) textEl.textContent = meta.transcript || '';
  renderListeningTranscriptControls(content, lesson, runtime);

  const setState = (state, statusText) => {
    playerEl.dataset.state = state;
    if (statusText && statusEl) statusEl.textContent = statusText;
  };

  const enableControls = () => {
    [playBtn, restartBtn, repeatBtn, speedBtn, rangeEl].forEach((el) => {
      if (el) el.disabled = false;
    });
    if (speedBtn && !meta.slowUrl)
      speedBtn.title =
        'No hay versión lenta grabada: se reduce la velocidad de reproducción del mismo audio.';
  };

  audioEl.addEventListener('loadstart', () => setState('loading', 'Cargando audio…'));
  audioEl.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(audioEl.duration) && durationEl)
      durationEl.textContent = formatListeningTime(audioEl.duration);
    if (playerEl.dataset.state === 'preparing' || playerEl.dataset.state === 'loading')
      setState('ready', 'Listo para reproducir.');
    enableControls();
  });
  audioEl.addEventListener('timeupdate', () => {
    if (elapsedEl) elapsedEl.textContent = formatListeningTime(audioEl.currentTime);
    if (rangeEl && Number.isFinite(audioEl.duration) && audioEl.duration > 0) {
      rangeEl.value = String(Math.round((audioEl.currentTime / audioEl.duration) * 100));
    }
  });
  audioEl.addEventListener('play', () => {
    setState('playing', 'Reproduciendo…');
    if (playBtn) {
      playBtn.textContent = '⏸ Pausa';
      playBtn.setAttribute('aria-label', 'Pausar');
    }
    if (!runtime.hasPlayedOnce) {
      runtime.hasPlayedOnce = true;
      renderListeningTranscriptControls(content, lesson, runtime);
    }
  });
  audioEl.addEventListener('pause', () => {
    if (playerEl.dataset.state !== 'completed') setState('paused', 'En pausa.');
    if (playBtn) {
      playBtn.textContent = '▶ Reproducir';
      playBtn.setAttribute('aria-label', 'Reproducir');
    }
  });
  audioEl.addEventListener('ended', () => {
    setState('completed', 'Audio completado.');
    if (playBtn) {
      playBtn.textContent = '▶ Reproducir';
      playBtn.setAttribute('aria-label', 'Reproducir de nuevo');
    }
  });
  audioEl.addEventListener('error', () => {
    setState('error', 'No pudimos cargar este audio. Reintentar.');
    [playBtn, restartBtn, repeatBtn, speedBtn, rangeEl].forEach((el) => {
      if (el) el.disabled = true;
    });
  });

  playBtn?.addEventListener('click', () => {
    if (audioEl.paused || audioEl.ended)
      audioEl
        .play()
        .catch(() => setState('error', 'No pudimos reproducir este audio. Reintentar.'));
    else audioEl.pause();
  });
  restartBtn?.addEventListener('click', () => {
    audioEl.currentTime = 0;
    if (elapsedEl) elapsedEl.textContent = '0:00';
    if (rangeEl) rangeEl.value = '0';
  });
  repeatBtn?.addEventListener('click', () => {
    audioEl.loop = !audioEl.loop;
    repeatBtn.setAttribute('aria-pressed', String(audioEl.loop));
    repeatBtn.classList.toggle('is-active', audioEl.loop);
  });
  speedBtn?.addEventListener('click', () => {
    const wasPlaying = !audioEl.paused;
    runtime.usingSlow = !runtime.usingSlow;
    if (meta.slowUrl) {
      audioEl.src = runtime.usingSlow ? meta.slowUrl : meta.mainUrl;
      audioEl.playbackRate = 1;
      setState('loading', 'Cargando audio…');
      audioEl.load();
      if (wasPlaying)
        audioEl.addEventListener('loadedmetadata', () => audioEl.play().catch(() => {}), {
          once: true
        });
    } else {
      audioEl.playbackRate = runtime.usingSlow ? 0.75 : 1;
    }
    speedBtn.textContent = runtime.usingSlow ? '🐇 Velocidad normal' : '🐢 Velocidad lenta';
    speedBtn.setAttribute(
      'aria-label',
      runtime.usingSlow ? 'Cambiar a velocidad normal' : 'Cambiar a velocidad lenta'
    );
  });
  rangeEl?.addEventListener('input', () => {
    if (Number.isFinite(audioEl.duration) && audioEl.duration > 0) {
      audioEl.currentTime = (Number(rangeEl.value) / 100) * audioEl.duration;
    }
  });
  volumeEl?.addEventListener('input', () => {
    audioEl.volume = Number(volumeEl.value);
  });

  audioEl.src = meta.mainUrl;
  audioEl.load();
}

function listeningTutorButtonsHtml(lesson, ctx) {
  const {
    transcript = '',
    vocabulary = '',
    currentQuestion = '',
    selectedAnswer = '',
    canRegenerate = false
  } = ctx;
  const esc = (value) => escapeHtml(value || '');
  const firstWord = (lesson.vocabulary || [])[0]?.word || '';
  return `
    <button type="button" class="secondary-btn open-tutor-btn" data-support-mode="hint" data-tutor-prompt="Dame una pista para responder la pregunta actual, sin darme la respuesta." data-tutor-transcript="${esc(transcript)}" data-tutor-current-question="${esc(currentQuestion)}">Dame una pista</button>
    <button type="button" class="secondary-btn open-tutor-btn" data-support-mode="explain" data-tutor-prompt="Explícame esta palabra: ${esc(firstWord)}" data-tutor-transcript="${esc(transcript)}" data-tutor-vocabulary="${esc(vocabulary)}">Explícame esta palabra</button>
    <button type="button" class="secondary-btn open-tutor-btn" data-support-mode="explain" data-tutor-prompt="Repite la idea principal del audio en frases más simples." data-tutor-transcript="${esc(transcript)}">Repite la idea principal</button>
    <button type="button" class="secondary-btn open-tutor-btn" data-support-mode="practice" data-tutor-prompt="Crea otra pregunta de comprensión sobre este audio." data-tutor-transcript="${esc(transcript)}">Crea otra pregunta</button>
    <button type="button" class="secondary-btn open-tutor-btn" data-support-mode="practice" data-tutor-prompt="Ayúdame a practicar este vocabulario." data-tutor-vocabulary="${esc(vocabulary)}">Practicar vocabulario</button>
    <button type="button" class="secondary-btn open-tutor-btn" data-support-mode="explain" data-tutor-prompt="Explícame por qué mi respuesta está mal." data-tutor-transcript="${esc(transcript)}" data-tutor-current-question="${esc(currentQuestion)}" data-tutor-selected-answer="${esc(selectedAnswer)}">Explícame por qué mi respuesta está mal</button>
    ${canRegenerate ? '<button type="button" class="secondary-btn listening-regenerate-btn">Generar una práctica parecida</button>' : ''}
  `;
}

async function completeListeningLesson(lesson, content) {
  if (lesson.locked) {
    handleHomeAction('upgrade');
    return;
  }
  const btn = content.querySelector('.listening-complete-btn');
  const { allAttempted } = getExerciseProgress(lesson);
  if (!allAttempted) {
    content
      .querySelector('.listening-questions')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showHomeToast('Responde las preguntas de comprensión para poder completar esta actividad.');
    return;
  }
  if (!authStatus.session?.access_token) {
    setAuthMessage('Crea tu cuenta gratis para guardar el progreso de Listening.');
    openModal('signup');
    return;
  }
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Guardando...';
  }

  const recordedResults = learningPathState.exerciseResults[lesson.slug] || {};
  const answers = Object.entries(recordedResults).map(([index, result]) => {
    const exerciseId = lesson.exercises?.[Number(index)]?.id;
    return exerciseId
      ? { exerciseId, selectedOptionId: result.selectedOption, practiced: result.practiced }
      : {
          index: Number(index),
          selectedOption: result.selectedOption,
          practiced: result.practiced
        };
  });

  try {
    const response = await fetch(`${backendBaseUrl}/api/lessons/${lesson.slug}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ answers })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(data.error || 'No se pudo completar la actividad de Listening.');

    lesson.completed = true;
    updateProgressDisplay(data, true);
    renderSkillCards();

    const gamResult = window.AndergoGamification?.recordLessonCompletion({
      slug: lesson.slug,
      language: learningPathState.language,
      score: data.score ?? 100,
      xpReward: lesson.xpReward || 20
    });
    window.AndergoGamification?.syncFromServer(data);
    if (data.newBadges?.length)
      data.newBadges.forEach((badge) =>
        showCelebration(`🏅 ¡Insignia desbloqueada! ${badge.label}`)
      );
    else if (gamResult?.newBadges?.length)
      gamResult.newBadges.forEach((badge) =>
        showCelebration(`🏅 ¡Insignia desbloqueada! ${badge.label}`)
      );
    if (data.leveledUp) showCelebration(`🎉 ¡Subiste a nivel ${data.level}!`);

    showHomeToast(
      `Actividad de Listening completada. +${data.earnedXp || lesson.xpReward || 20} XP`
    );
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Completada';
    }
  } catch (error) {
    console.error('Could not complete listening lesson', error);
    showHomeToast(error.message || 'No se pudo completar la actividad de Listening.');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Completar';
    }
  }
}

function computeListeningTutorQuestionContext(lesson) {
  const results = learningPathState.exerciseResults[lesson.slug] || {};
  const exercises = (lesson.exercises || []).filter((item) => item.type === 'mcq');
  const nextUnanswered = exercises.find((_, idx) => !results[idx]);
  const answeredIndexes = Object.keys(results)
    .map(Number)
    .sort((a, b) => b - a);
  const lastIndex = answeredIndexes[0];
  const lastAnswered = lastIndex !== undefined ? exercises[lastIndex] : null;
  const lastResult = lastIndex !== undefined ? results[lastIndex] : null;
  return {
    currentQuestion: nextUnanswered?.prompt || lastAnswered?.prompt || '',
    selectedAnswer: lastResult ? String(lastResult.selectedOption) : ''
  };
}

function renderListeningOfficial(content, lesson, runtime, audio) {
  const { total, attempted, allAttempted } = getExerciseProgress(lesson);
  const pct = total ? Math.round((attempted / total) * 100) : 0;
  const exercisesHtml = (lesson.exercises || [])
    .filter((item) => item.type === 'mcq')
    .map((item, index) => renderLessonExercise(item, index, lesson))
    .join('');
  const objective = lesson.mission || lesson.intro || lesson.description || '';
  const durationLabel = audio.duration ? `${Math.round(audio.duration)}s` : 'No especificada';
  const tutorCtx = computeListeningTutorQuestionContext(lesson);

  content.innerHTML = `
    <div class="listening-meta-row">
      <span class="listening-meta-item">Objetivo: ${escapeHtml(objective)}</span>
      <span class="listening-meta-item">Duración: ${escapeHtml(durationLabel)}</span>
    </div>
    ${buildListeningPlayerMarkup({ sourceLabel: 'Audio oficial', sourceIsAi: false, title: lesson.title })}
    <div class="listening-vocab">
      <strong>Vocabulario</strong>
      <div class="listening-vocab-list">${(lesson.vocabulary || []).map((item) => `<span class="listening-vocab-item">${escapeHtml(item.word)}<small>${escapeHtml(resolveVocabTranslation(item))}</small></span>`).join('')}</div>
    </div>
    <div class="listening-questions-section">
      <h4>Preguntas de comprensión</h4>
      <div class="listening-progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div style="width:${pct}%"></div></div>
      <div class="listening-questions">${exercisesHtml || '<p class="skill-graph-empty">No hay preguntas de comprensión para esta lección.</p>'}</div>
    </div>
    <div class="skill-view-tutor-cta">
      ${listeningTutorButtonsHtml(lesson, { transcript: audio.transcript, vocabulary: (lesson.vocabulary || []).map((v) => v.word).join(', '), ...tutorCtx })}
    </div>
    <div class="listening-nav-row">
      <button type="button" class="primary-btn listening-complete-btn" ${!allAttempted || lesson.completed ? 'disabled' : ''}>${lesson.completed ? 'Completada' : 'Completar'}</button>
    </div>
  `;

  wireListeningPlayerControls(content, lesson, runtime, {
    mainUrl: audio.audioUrl,
    slowUrl: audio.slowAudioUrl,
    transcript: audio.transcript,
    sourceIsAi: false
  });
  content
    .querySelector('.listening-complete-btn')
    ?.addEventListener('click', () => completeListeningLesson(lesson, content));
}

function updateListeningOfficialQuestions(content, lesson, runtime) {
  const questionsWrap = content.querySelector('.listening-questions');
  const progressBar = content.querySelector('.listening-progress-bar div');
  const progressWrap = content.querySelector('.listening-progress-bar');
  if (!questionsWrap) return;
  const { total, attempted, allAttempted } = getExerciseProgress(lesson);
  const exercises = (lesson.exercises || []).filter((item) => item.type === 'mcq');
  questionsWrap.innerHTML =
    exercises.map((item, index) => renderLessonExercise(item, index, lesson)).join('') ||
    '<p class="skill-graph-empty">No hay preguntas de comprensión para esta lección.</p>';
  const pct = total ? Math.round((attempted / total) * 100) : 0;
  if (progressBar) progressBar.style.width = `${pct}%`;
  if (progressWrap) progressWrap.setAttribute('aria-valuenow', String(pct));
  const completeBtn = content.querySelector('.listening-complete-btn');
  if (completeBtn && !lesson.completed) completeBtn.disabled = !allAttempted;
  renderListeningTranscriptControls(content, lesson, runtime);
}

function updateAiCompleteNote(content, lesson, runtime) {
  const note = content.querySelector('.listening-ai-complete-note');
  if (!note) return;
  const total = runtime.aiPractice?.questions?.length || 0;
  const attempted = Object.keys(runtime.aiAnswers || {}).length;
  note.hidden = !(total > 0 && attempted >= total);
}

function renderListeningAiQuestionsInPlace(content, lesson, runtime) {
  const wrap = content.querySelector('.listening-questions');
  if (wrap) wrap.innerHTML = renderAiListeningQuestions(lesson, runtime);
  updateAiCompleteNote(content, lesson, runtime);
  renderListeningTranscriptControls(content, lesson, runtime);
}

function renderListeningAiPlayer(content, lesson, runtime, practice) {
  const objective = lesson.mission || lesson.intro || lesson.description || '';
  const durationLabel = practice.durationSeconds
    ? `${practice.durationSeconds}s (aprox.)`
    : 'No especificada';

  content.innerHTML = `
    <div class="listening-meta-row">
      <span class="listening-meta-item">Objetivo: ${escapeHtml(objective)}</span>
      <span class="listening-meta-item">Duración: ${escapeHtml(durationLabel)}</span>
    </div>
    ${buildListeningPlayerMarkup({ sourceLabel: 'Práctica de Listening generada por IA', sourceIsAi: true, title: practice.title || lesson.title })}
    <div class="listening-vocab">
      <strong>Vocabulario</strong>
      <div class="listening-vocab-list">${(practice.vocabulary || []).map((item) => `<span class="listening-vocab-item">${escapeHtml(item.word)}<small>${escapeHtml(item.translation || '')}</small></span>`).join('')}</div>
    </div>
    <div class="listening-questions-section">
      <h4>Preguntas de comprensión</h4>
      <div class="listening-questions">${renderAiListeningQuestions(lesson, runtime)}</div>
      <p class="listening-ai-complete-note" hidden>Práctica completada. Esta actividad generada por IA no otorga XP - genera otra práctica o continúa con una lección oficial para ganar XP.</p>
    </div>
    <div class="skill-view-tutor-cta">
      ${listeningTutorButtonsHtml(lesson, { transcript: practice.transcript, vocabulary: (practice.vocabulary || []).map((v) => v.word).join(', '), canRegenerate: true })}
    </div>
  `;
  wireListeningPlayerControls(content, lesson, runtime, {
    mainUrl: practice.audioUrl,
    slowUrl: practice.slowAudioUrl,
    transcript: practice.transcript,
    sourceIsAi: true
  });
  updateAiCompleteNote(content, lesson, runtime);
}

function renderListeningAiOffer(content, lesson, runtime) {
  const loggedIn = Boolean(authStatus.session?.access_token);
  content.innerHTML = `
    <div class="listening-status-card listening-ai-offer">
      <div class="listening-status-icon" aria-hidden="true">🤖🎧</div>
      <p class="listening-status-title">Todavía no hay un audio oficial para esta lección.</p>
      <p class="listening-status-detail">Tutor IA puede preparar una práctica de Listening generada por IA: un guion adaptado a tu nivel, con vocabulario y preguntas de comprensión. Nunca se presenta como una grabación humana.</p>
      ${
        loggedIn
          ? '<button type="button" class="primary-btn listening-generate-btn">Generar práctica de Listening con IA</button>'
          : '<p class="listening-status-detail">Inicia sesión para generar esta práctica.</p>'
      }
      <p class="listening-status-error" hidden></p>
    </div>
  `;
  content.querySelector('.listening-generate-btn')?.addEventListener('click', async (event) => {
    const btn = event.currentTarget;
    const errorEl = content.querySelector('.listening-status-error');
    btn.disabled = true;
    btn.textContent = 'Generando…';
    try {
      const practice = await generateAiListeningPractice(lesson);
      runtime.aiPractice = practice;
      runtime.aiAnswers = {};
      runtime.transcriptRevealed = false;
      runtime.hasPlayedOnce = false;
      renderListeningAiPlayer(content, lesson, runtime, practice);
    } catch (error) {
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = error.message || 'No se pudo generar la práctica.';
      }
      btn.disabled = false;
      btn.textContent = 'Generar práctica de Listening con IA';
    }
  });
}

function renderListeningUnavailable(content, lesson, section) {
  content.innerHTML = `
    <div class="listening-status-card">
      <div class="listening-status-icon" aria-hidden="true">🎧</div>
      <p class="listening-status-title">Listening no está disponible todavía para esta lección.</p>
      <p class="listening-status-detail">Aún no hay un audio oficial publicado y la práctica generada por IA no está configurada en este entorno. Intenta más tarde.</p>
      <button type="button" class="secondary-btn listening-retry-btn">Intenta más tarde: reintentar</button>
    </div>
  `;
  content.querySelector('.listening-retry-btn')?.addEventListener('click', () => {
    listeningAudioStatusCache.delete(listeningStatusCacheKey(lesson));
    content.dataset.listeningReady = 'false';
    renderListeningView(section, lesson);
  });
}

function renderListeningError(content, lesson, section, message) {
  content.innerHTML = `
    <div class="listening-status-card">
      <div class="listening-status-icon" aria-hidden="true">⚠️</div>
      <p class="listening-status-title">No pudimos cargar este audio. Reintentar.</p>
      <p class="listening-status-detail">${escapeHtml(message || '')}</p>
      <button type="button" class="secondary-btn listening-retry-btn">Reintentar</button>
    </div>
  `;
  content.querySelector('.listening-retry-btn')?.addEventListener('click', () => {
    listeningAudioStatusCache.delete(listeningStatusCacheKey(lesson));
    content.dataset.listeningReady = 'false';
    renderListeningView(section, lesson);
  });
}

function renderListeningResolved(content, lesson, runtime, statusData, section) {
  if (statusData.status === 'official' && statusData.audio) {
    renderListeningOfficial(content, lesson, runtime, statusData.audio);
    return;
  }
  if (statusData.status === 'ai-available') {
    renderListeningAiOffer(content, lesson, runtime);
    return;
  }
  if (statusData.status === 'error') {
    renderListeningError(content, lesson, section, statusData.error);
    return;
  }
  renderListeningUnavailable(content, lesson, section);
}

function renderListeningView(section, lesson) {
  const content = section.querySelector('.skill-view-content');
  if (!content) return;
  const runtime = getListeningRuntime(lesson);
  const key = listeningStatusCacheKey(lesson);

  // Only tear down/rebuild the whole subtree (which recreates the <audio>
  // element) the first time this lesson+language+level combination is
  // shown - later re-renders triggered by answering an official
  // comprehension question just refresh the questions/progress area in
  // place (updateListeningOfficialQuestions), so playback position survives.
  if (content.dataset.listeningKey === key && content.dataset.listeningReady === 'true') {
    updateListeningOfficialQuestions(content, lesson, runtime);
    return;
  }

  content.dataset.listeningKey = key;
  content.dataset.listeningReady = 'false';
  content.innerHTML = '<p class="skill-graph-empty">Buscando audio de Listening…</p>';

  fetchListeningAudioStatus(lesson).then((statusData) => {
    if (content.dataset.listeningKey !== key) return; // navigated away meanwhile
    content.dataset.listeningReady = 'true';
    renderListeningResolved(content, lesson, runtime, statusData, section);
  });
}

// ---------------------------------------------------------------------
// Global Tutor IA: floating button + slide-in drawer, reachable from every
// view without losing whatever skill/lesson was active. Shares the same
// /api/ai/tutor call and connection-status rules as the full #tutor view
// via sendTutorMessage() below (extracted from the .tutor-chat-btn handler).
// ---------------------------------------------------------------------

let tutorDrawerReturnFocus = null;
let tutorDrawerContext = {
  skill: 'speaking',
  lessonTitle: '',
  lessonIntro: '',
  lessonSlug: '',
  supportMode: 'practice',
  currentActivity: '',
  transcript: '',
  vocabulary: '',
  currentQuestion: '',
  selectedAnswer: ''
};

function openTutorDrawer(overrides = {}) {
  const drawer = document.getElementById('tutorDrawer');
  if (!drawer) return;
  stopTutorDictation();
  tutorDrawerContext = { ...tutorDrawerContext, ...overrides };
  tutorDrawerReturnFocus = document.activeElement;

  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  drawer.removeAttribute('inert');
  document.body.classList.add('modal-open');

  const skillEl = drawer.querySelector('[data-drawer-context="skill"]');
  const levelEl = drawer.querySelector('[data-drawer-context="level"]');
  if (skillEl)
    skillEl.textContent = SKILL_LABELS[tutorDrawerContext.skill] || tutorDrawerContext.skill;
  if (levelEl) levelEl.textContent = learningPathState.level;

  const prompt = document.getElementById('tutorDrawerPrompt');
  if (prompt) prompt.value = overrides.prefill || '';
  checkTutorConnection('tutorDrawerConnectionStatus');
  (prompt || drawer.querySelector('.close-modal'))?.focus();
}

function closeTutorDrawer() {
  const drawer = document.getElementById('tutorDrawer');
  if (!drawer || !drawer.classList.contains('open')) return;
  stopTutorDictation();
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('inert', '');
  document.body.classList.remove('modal-open');
  (tutorDrawerReturnFocus || document.getElementById('tutorFab'))?.focus();
  tutorDrawerReturnFocus = null;
}

// Shared core behind both the full #tutor view's chat and the drawer's chat -
// same request contract (§5: bridgeLanguage/targetLanguage/level/skill/
// lessonSlug/lessonTitle/currentActivity/userMessage/supportMode), same
// "never claim Conectado without a real response" rule. conversationEl/
// thinkingEl/connectionStatusEl/promptEl/sendBtn may be null (appendTutorMessage
// and friends are already null-safe) for inline callers that don't have a
// chat log of their own (e.g. the Writing view's review buttons).
async function sendTutorMessage({
  conversationEl,
  thinkingEl,
  connectionStatusEl,
  promptEl,
  sendBtn,
  skill,
  level,
  language,
  bridgeLanguage,
  lessonTitle,
  lessonIntro,
  lessonSlug,
  currentActivity,
  supportMode,
  selectedSuggestion,
  fallbackPrompt,
  transcript,
  vocabulary,
  currentQuestion,
  selectedAnswer
}) {
  // Guards against a second click/Enter firing before the first request's
  // `sendBtn.disabled = true` (set a few lines below) has taken effect, and
  // against any caller triggering this twice in a row for the same button.
  if (sendBtn?.disabled) return null;

  const customPrompt = promptEl?.value.trim() || '';
  const finalPrompt =
    customPrompt || selectedSuggestion || fallbackPrompt || 'Quiero practicar esta habilidad.';
  if (!finalPrompt) return null;

  if (conversationEl) appendTutorMessage(conversationEl, 'user', finalPrompt);
  if (promptEl) promptEl.value = '';
  if (thinkingEl) thinkingEl.hidden = false;
  if (connectionStatusEl) connectionStatusEl.textContent = 'Comprobando conexión…';
  if (sendBtn) sendBtn.disabled = true;

  try {
    const response = await fetch(`${backendBaseUrl}/api/ai/tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        language,
        targetLanguage: language,
        skill,
        level,
        nativeLanguage: bridgeLanguage,
        bridgeLanguage,
        prompt: finalPrompt,
        userMessage: finalPrompt,
        lessonTitle: lessonTitle || '',
        lessonIntro: lessonIntro || '',
        lessonSlug: lessonSlug || '',
        currentActivity: currentActivity || '',
        supportMode: supportMode || 'practice',
        selectedSuggestion: selectedSuggestion || '',
        transcript: transcript || '',
        vocabulary: vocabulary || '',
        currentQuestion: currentQuestion || '',
        selectedAnswer: selectedAnswer || ''
      })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'No se pudo conectar con el tutor IA.');
    }

    // Streams the SSE body (`data: {"delta"|"done"|"error", ...}\n\n` frames
    // - see server.js's /api/ai/tutor) and appends each delta into the tutor
    // message bubble as it arrives, so the student sees words as soon as
    // they're generated instead of waiting for the full reply.
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let messageEl = null;
    let voiceControlsShown = false;
    let streamError = null;

    if (reader) {
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) buffer += decoder.decode(chunk.value, { stream: true });

        let frameEnd;
        while ((frameEnd = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, frameEnd);
          buffer = buffer.slice(frameEnd + 2);
          const line = frame.split('\n').find((l) => l.startsWith('data: '));
          if (!line) continue;

          let payload;
          try {
            payload = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (payload.error) {
            streamError = payload.message || 'No se pudo conectar con el tutor IA.';
          } else if (payload.delta) {
            fullText += payload.delta;
            if (thinkingEl) thinkingEl.hidden = true;
            if (conversationEl) {
              if (!messageEl) {
                messageEl = appendTutorMessage(conversationEl, 'tutor', fullText);
                if (messageEl) {
                  messageEl.dataset.ttsLocale = getPronunciationLocale(language);
                  // Position among this conversation's tutor replies so far -
                  // the free tier's "3 turns per conversation" voice limit
                  // (see lib/voiceAccessService.js) is checked against this.
                  messageEl.dataset.turnIndex = String(
                    conversationEl.querySelectorAll('.tutor-message--tutor').length
                  );
                }
              } else {
                updateTutorMessageBody(messageEl, conversationEl, fullText);
              }
              if (messageEl) {
                messageEl.dataset.ttsText = fullText;
                // Enable voice as soon as the first complete sentence has
                // streamed in, not only once the whole reply finishes.
                if (!voiceControlsShown && /[.!?](\s|$)/.test(fullText)) {
                  voiceControlsShown = true;
                  renderTutorVoiceControls(messageEl);
                }
              }
            }
          }
        }
      }
    }

    if (conversationEl && messageEl && !voiceControlsShown) renderTutorVoiceControls(messageEl);

    if (streamError && !fullText) throw new Error(streamError);

    if (connectionStatusEl) connectionStatusEl.textContent = 'Conectado';
    return { reply: fullText };
  } catch (error) {
    if (conversationEl)
      appendTutorMessage(
        conversationEl,
        'tutor',
        error.message || 'No se pudo conectar con el tutor IA.',
        { isError: true }
      );
    if (connectionStatusEl) connectionStatusEl.textContent = 'No disponible';
    return null;
  } finally {
    if (thinkingEl) thinkingEl.hidden = true;
    if (sendBtn) sendBtn.disabled = false;
  }
}

function getLocalFallbackLessons(language, level) {
  const lessons = window.ANDERGO_LANGUAGE_WORLDS?.lessons?.[language] || [];
  return lessons
    .filter((lesson) => lesson.level === level)
    .map((lesson) => ({
      ...lesson,
      isFree: lesson.accessTier ? lesson.accessTier !== 'premium' : lesson.isFree !== false,
      locked: (lesson.accessTier === 'premium' || lesson.isFree === false) && !lesson.completed,
      completed: Boolean(lesson.completed)
    }));
}

// Unit metadata (id/slug/title/order) is invariant per language+level, so
// it always ships in the static bundle (window.ANDERGO_LANGUAGE_WORLDS.units,
// generated by scripts/sync-worlds-from-seed.js) regardless of whether the
// lessons themselves came from the backend or the local fallback below -
// this is what makes hasUnits() true for English A1 either way.
function getUnitsForLanguageLevel(language, level) {
  const units = window.ANDERGO_LANGUAGE_WORLDS?.units?.[language] || [];
  return units.filter((unit) => unit.level === level).sort((a, b) => a.order - b.order);
}

async function loadLearningPath(options = {}) {
  learningPathState.language = options.language || learningPathState.language;
  learningPathState.level = options.level || learningPathState.level;
  learningPathState.units = getUnitsForLanguageLevel(
    learningPathState.language,
    learningPathState.level
  );

  const graphContainer = document.getElementById('skillGraph');
  if (graphContainer) {
    graphContainer.innerHTML = '<p class="skill-graph-empty">Preparando tu ruta…</p>';
  }

  try {
    const params = new URLSearchParams({
      level: learningPathState.level,
      language: learningPathState.language
    });
    const response = await fetch(`${backendBaseUrl}/api/lessons?${params.toString()}`, {
      headers: authHeaders()
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Could not load lessons');

    learningPathState.lessons = data.lessons?.length
      ? data.lessons
      : getLocalFallbackLessons(learningPathState.language, learningPathState.level);
    // No auto-selection - an empty activeSlug is what makes
    // renderLessonWorkspace() show the "continue" card (next recommended
    // lesson) instead of always jumping straight to lessons[0]'s full detail.
    learningPathState.activeSlug = '';
    renderLearningPath();
  } catch (error) {
    console.warn('Could not load learning path from backend, using local content', error);
    learningPathState.lessons = getLocalFallbackLessons(
      learningPathState.language,
      learningPathState.level
    );
    // No auto-selection - an empty activeSlug is what makes
    // renderLessonWorkspace() show the "continue" card (next recommended
    // lesson) instead of always jumping straight to lessons[0]'s full detail.
    learningPathState.activeSlug = '';
    renderLearningPath();
  }
}

async function completeActiveLesson() {
  const activeLesson = learningPathState.lessons.find(
    (item) => item.slug === learningPathState.activeSlug
  );
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
    document
      .querySelector('.lesson-exercises')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      : {
          index: Number(index),
          selectedOption: result.selectedOption,
          practiced: result.practiced
        };
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
      data.newBadges.forEach((badge) =>
        showCelebration(`🏅 ¡Insignia desbloqueada! ${badge.label}`)
      );
    } else if (gamResult?.newBadges?.length) {
      gamResult.newBadges.forEach((badge) =>
        showCelebration(`🏅 ¡Insignia desbloqueada! ${badge.label}`)
      );
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

attachAuthHandlers();
restoreSession();

authTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    setAuthMessage('');
    openModal(trigger.dataset.panel);
  });
});

authTabs.forEach((tab) => {
  tab.addEventListener('click', () => openModal(tab.dataset.form));
});

logoutButton?.addEventListener('click', openLogoutConfirm);

// The 3 preset cards are quick-start shortcuts into the same real /api/goals
// CRUD system goalsCrudBody uses below - not a separate goal-tracking system.
document.querySelectorAll('#goalsQuickStart .goal-card').forEach((card) => {
  card.querySelector('.goal-select')?.addEventListener('click', async () => {
    if (!authStatus.session?.access_token) {
      setAuthMessage('Crea tu cuenta gratis para guardar tu objetivo.');
      openModal('signup');
      return;
    }
    try {
      await fetch(`${backendBaseUrl}/api/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ goalKey: card.dataset.goal || 'daily' })
      });
      showHomeToast('Objetivo creado.');
      await loadDashboard();
    } catch (error) {
      console.warn('Could not create goal', error);
      showHomeToast('No se pudo crear el objetivo. Intenta de nuevo.');
    }
  });
});

document.querySelector('.learn-route-toggle')?.addEventListener('click', () => {
  const graph = document.getElementById('skillGraph');
  showLearnState(graph?.classList.contains('is-drawer-open') ? 'lesson' : 'route');
});

document.addEventListener('click', async (event) => {
  if (event.target.closest('.learn-back-to-route')) {
    learningPathState.activeSlug = '';
    renderLearningPath();
    showLearnState('route');
    return;
  }

  const continueBtn = event.target.closest('.lesson-continue-btn');
  if (continueBtn) {
    openLesson(continueBtn.dataset.lessonSlug);
    return;
  }

  const button = event.target.closest('.skill-tab-button');
  if (!button) return;

  const skill = button.dataset.skill;
  const parent = button.closest('.skill-tabs');
  const buttons = parent?.querySelectorAll('.skill-tab-button') || [];
  const panels = parent?.querySelectorAll('.skill-panel') || [];

  buttons.forEach((btn) => btn.classList.toggle('active', btn === button));
  panels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.skill === skill);
  });

  parent?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

const brandLink = document.querySelector('.brand');
brandLink?.addEventListener('click', (event) => {
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

  siteMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
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

// Single-view router: exactly one of these is visible at a time (everything
// else keeps its .compact-hidden-section class). Header, footer and the auth
// modals sit outside this map and are always visible/available.
// The 6 skills each get their own dedicated view (instead of swapping
// content inside #learning-path's small lesson-workspace card) - listed
// once here since several places (router, card click handler, header
// renderer) all need to agree on the same set.
const SKILL_VIEWS = ['listening', 'speaking', 'reading', 'writing', 'grammar', 'vocabulary'];

const VIEW_SECTIONS = {
  home: ['.hero', '#language-picker'],
  learn: ['#learning-path'],
  progress: ['#progress'],
  achievements: ['#achievements'],
  security: ['#security'],
  goals: ['#goals'],
  tutor: ['#tutor'],
  premium: ['#premium'],
  listening: ['#listening'],
  speaking: ['#speaking'],
  reading: ['#reading'],
  writing: ['#writing'],
  grammar: ['#grammar'],
  vocabulary: ['#vocabulary'],
  'reset-password': ['#resetPasswordSection']
};

// Focus target per view: the one heading a screen reader / keyboard user
// should land on after a hash change, per view. tabindex="-1" on these in
// index.html makes them programmatically focusable without joining the
// normal Tab order.
const VIEW_TITLE_SELECTORS = {
  home: '.hero-content h2',
  learn: '#learning-path h2',
  progress: '#progress h2',
  achievements: '#achievements h2',
  security: '#security h2',
  goals: '#goals h2',
  tutor: '#tutor h2',
  premium: '#premium h2',
  listening: '#listening h2',
  speaking: '#speaking h2',
  reading: '#reading h2',
  writing: '#writing h2',
  grammar: '#grammar h2',
  vocabulary: '#vocabulary h2'
};

function getViewFromHash() {
  const raw = window.location.hash.replace('#', '');
  if (!raw) return 'home';
  if (raw.startsWith('language-') || targetLanguageMap[raw]) return 'learn';
  return VIEW_SECTIONS[raw] ? raw : 'home';
}

function showView(viewId) {
  const resolved = VIEW_SECTIONS[viewId] ? viewId : 'home';

  // Any navigation away from the current view must release the mic and
  // drop any in-progress Speaking recording - a no-op when nothing is active.
  resetSpeakingRecorder();
  stopTutorDictation();

  Object.entries(VIEW_SECTIONS).forEach(([id, selectors]) => {
    const active = id === resolved;
    selectors.forEach((selector) =>
      document.querySelectorAll(selector).forEach((el) => {
        el.classList.toggle('compact-hidden-section', !active);
        el.hidden = !active;
        el.setAttribute('aria-hidden', String(!active));
      })
    );
  });

  document.querySelectorAll('.nav-group a[href^="#"]').forEach((link) => {
    const isActive = link.getAttribute('href') === `#${resolved}`;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  // Ruta/Reading/Listening/.../Vocabulary tab strip repeated at the top of
  // #learning-path and each of the 6 skill sections (index.html's
  // .level-tabs) - same active/aria-current toggling as the main nav above.
  document.querySelectorAll('.level-tab[href^="#"]').forEach((link) => {
    const linkView = link.dataset.tab === 'learn' ? 'learn' : link.dataset.tab;
    const isActive = linkView === resolved;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  if (resolved === 'learn') {
    // Mobile's route drawer is user-driven ("Ver ruta"/"Volver a la ruta") -
    // entering #learn should land on the lesson panel (continue card or the
    // last-opened lesson), not force the drawer open every time.
    showLearnState('lesson');
    const langToken = getLanguageTabFromHash();
    if (langToken) setTargetLanguage(langToken);
  }
  if (resolved === 'tutor') {
    updateAiTutorContext();
    checkTutorConnection();
  }
  if (resolved === 'progress' || resolved === 'goals') loadDashboard();
  if (resolved === 'security') loadSecurityStatus();
  if (SKILL_VIEWS.includes(resolved)) renderSkillView(resolved);

  // The floating Tutor IA button is redundant on the dedicated Tutor view,
  // and the drawer shouldn't stay open across a navigation - it loses
  // whatever context it had anyway.
  document.getElementById('tutorFab')?.toggleAttribute('hidden', resolved === 'tutor');
  closeTutorDrawer();

  window.scrollTo({ top: 0, behavior: 'auto' });
  document.querySelector(VIEW_TITLE_SELECTORS[resolved])?.focus({ preventScroll: true });
}

window.addEventListener('hashchange', () => showView(getViewFromHash()));

closeModal?.addEventListener('click', closeAuth);
authModal?.addEventListener('click', (event) => {
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

function handleHomeAction(action) {
  const goTo = (view, toast) => {
    if (window.location.hash !== `#${view}`) history.pushState(null, '', `#${view}`);
    showView(view);
    if (toast) showHomeToast(toast);
  };

  switch (action) {
    case 'continue-lesson':
      goTo('learn', 'Ruta de lecciones abierta. Elige una lección y completa el reto.');
      break;
    case 'start-free':
      setTargetLanguage('english');
      goTo('learn', 'Elige un nivel. A1-B2 tienen 3 lecciones gratis; C1-C2 tienen 1.');
      break;
    case 'goals':
      goTo('goals', 'Elige o gestiona tu objetivo.');
      break;
    case 'view-progress':
      goTo('progress', 'Aquí puedes ver tu progreso y actividad reciente.');
      break;
    case 'upgrade':
      goTo('premium', `Plan premium único: USD ${premiumPriceUsd}.`);
      break;
    case 'ai-tutor':
      goTo('tutor', 'Tutor IA abierto. Practica listening, speaking o writing.');
      break;
    case 'explore-languages':
      goTo('home');
      window.setTimeout(() => {
        document
          .getElementById('language-picker')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      showHomeToast('Elige un idioma para ver su ruta completa.');
      break;
    case 'explore-english':
      setTargetLanguage('english');
      goTo('learn');
      break;
    case 'explore-frances':
      setTargetLanguage('frances');
      goTo('learn');
      break;
    case 'explore-italiano':
      setTargetLanguage('italiano');
      goTo('learn');
      break;
    case 'explore-espanol':
      setTargetLanguage('espanol');
      goTo('learn');
      break;
    case 'explore-deutsch':
      setTargetLanguage('deutsch');
      goTo('learn');
      break;
    default:
      break;
  }
}

function enableHomepageActions() {
  document.querySelectorAll('[data-home-action]').forEach((element) => {
    element.addEventListener('click', (event) => {
      const action = element.dataset.homeAction;
      if (action) {
        event.preventDefault();
        handleHomeAction(action);
      }
    });
  });

  document.querySelectorAll('.skill-competency-card').forEach((card) => {
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
      }
    });
  });

  document.addEventListener('click', async (event) => {
    // Delegated (rather than a one-time listener on a single element) because
    // renderLessonWorkspace() now fully replaces #lessonWorkspace's innerHTML
    // when it switches between the "continue" card and full lesson detail,
    // which would otherwise orphan a listener bound to the old button node.
    if (event.target.closest('.lesson-complete-btn')) {
      completeActiveLesson();
      return;
    }

    const dictateBtn = event.target.closest('.tutor-dictate-btn');
    if (dictateBtn) {
      startTutorDictation(dictateBtn.dataset.dictateTarget);
      return;
    }
    const dictateStopBtn = event.target.closest('.tutor-dictate-stop-btn');
    if (dictateStopBtn) {
      stopTutorDictation();
      return;
    }

    if (event.target.closest('[data-action="open-forgot-password"]')) {
      setAuthMessage('');
      openModal('forgotPassword');
      return;
    }
    if (event.target.closest('[data-action="back-to-login"]')) {
      setAuthMessage('');
      clearPendingMfa();
      openModal('login');
      return;
    }
    if (event.target.closest('[data-action="dismiss-username-onboarding"]')) {
      closeUsernameOnboarding();
      return;
    }

    const upgradeButton = event.target.closest('.upgrade-btn');
    if (upgradeButton) {
      handleHomeAction('upgrade');
      if (!authStatus.session?.access_token) {
        setAuthMessage(
          `Crea tu cuenta para desbloquear la ruta premium por USD ${premiumPriceUsd}.`
        );
        openModal('signup');
      }
      return;
    }

    const skillCompetencyCard = event.target.closest('.skill-competency-card');
    if (skillCompetencyCard) {
      const skill = skillCompetencyCard.dataset.skill;
      if (!SKILL_VIEWS.includes(skill)) return;
      if (window.location.hash !== `#${skill}`) history.pushState(null, '', `#${skill}`);
      showView(skill);
      return;
    }

    const suggestion = event.target.closest('.predictive-suggestion');
    if (suggestion) {
      const group = suggestion.closest('.predictive-suggestions');
      group
        ?.querySelectorAll('.predictive-suggestion')
        .forEach((item) => item.classList.remove('selected'));
      suggestion.classList.add('selected');
      const tutorPrompt = document.getElementById('aiTutorPrompt');
      if (tutorPrompt && suggestion.closest('#tutor')) {
        tutorPrompt.value = suggestion.textContent.trim();
        tutorPrompt.focus();
      }
      showHomeToast(`Seleccionado: ${suggestion.textContent.trim()}`);
      const skillPanel = suggestion.closest('.skill-panel');
      window.AndergoGamification?.recordSkillTouched(
        skillPanel?.dataset.skill,
        currentTargetLanguage
      );
      return;
    }

    // AI-generated Listening questions are graded locally (no real lesson
    // row/slug exists for ephemeral practice, so there's nothing for
    // /api/lessons/:slug/check-answer to check against) - checked before the
    // generic .mcq-option branch below since these buttons carry both classes.
    const aiListeningOption = event.target.closest('.ai-listening-option');
    if (aiListeningOption) {
      const questionItem = aiListeningOption.closest('.mcq-question');
      const skillSection = aiListeningOption.closest('.skill-view-section');
      const lesson = learningPathState.lessons.find(
        (item) => item.slug === skillSection?.dataset.activeLessonSlug
      );
      const runtime = lesson ? getListeningRuntime(lesson) : null;
      if (!questionItem || questionItem.classList.contains('answered') || !runtime?.aiPractice)
        return;

      const qIndex = Number(questionItem.dataset.questionIndex);
      const optIndex = Number(aiListeningOption.dataset.optionIndex);
      const question = runtime.aiPractice.questions[qIndex];
      const correct = Number(question?.correctIndex) === optIndex;
      runtime.aiAnswers[qIndex] = { selectedIndex: optIndex, correct };
      if (correct)
        window.AndergoGamification?.recordSkillTouched('listening', learningPathState.language);

      const content = skillSection?.querySelector('.skill-view-content');
      if (content) renderListeningAiQuestionsInPlace(content, lesson, runtime);
      return;
    }

    // "Generar una práctica parecida" (Listening's Tutor IA function): a new
    // AI-generated script/audio on the same topic, never an exact copy.
    const listeningRegenerateBtn = event.target.closest('.listening-regenerate-btn');
    if (listeningRegenerateBtn) {
      const skillSection = listeningRegenerateBtn.closest('.skill-view-section');
      const lesson = learningPathState.lessons.find(
        (item) => item.slug === skillSection?.dataset.activeLessonSlug
      );
      const content = skillSection?.querySelector('.skill-view-content');
      if (!lesson || !content) return;
      const runtime = getListeningRuntime(lesson);

      listeningRegenerateBtn.disabled = true;
      listeningRegenerateBtn.textContent = 'Generando…';
      try {
        const practice = await generateAiListeningPractice(lesson, lesson.title);
        runtime.aiPractice = practice;
        runtime.aiAnswers = {};
        runtime.transcriptRevealed = false;
        runtime.hasPlayedOnce = false;
        renderListeningAiPlayer(content, lesson, runtime, practice);
        showHomeToast('Nueva práctica de Listening generada.');
      } catch (error) {
        showHomeToast(error.message || 'No se pudo generar una nueva práctica.');
        listeningRegenerateBtn.disabled = false;
        listeningRegenerateBtn.textContent = 'Generar una práctica parecida';
      }
      return;
    }

    const mcqOption = event.target.closest('.mcq-option');
    if (mcqOption) {
      const questionItem = mcqOption.closest('.mcq-question');
      const slug = questionItem?.dataset.lessonSlug;
      if (
        !questionItem ||
        questionItem.classList.contains('answered') ||
        mcqOption.disabled ||
        !slug
      )
        return;

      const exerciseIndex = Number(questionItem.dataset.exerciseIndex);
      const exerciseId = questionItem.dataset.exerciseId || '';
      const chosenKey = mcqOption.dataset.optionKey;
      const feedback = questionItem.querySelector('.mcq-feedback');

      questionItem.querySelectorAll('.mcq-option').forEach((option) => {
        option.disabled = true;
      });
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
        learningPathState.exerciseResults[slug][exerciseIndex] = {
          selectedOption: chosenKey,
          correct: Boolean(data.correct)
        };

        if (data.correct) {
          window.AndergoGamification?.recordCorrectAnswer();
          window.AndergoGamification?.recordSkillTouched(
            questionItem.dataset.skill,
            questionItem.dataset.language || currentTargetLanguage
          );
        }
      } catch (error) {
        if (feedback) feedback.textContent = error.message || 'No se pudo verificar la respuesta.';
        questionItem.querySelectorAll('.mcq-option').forEach((option) => {
          option.disabled = false;
        });
        return;
      }

      // Re-render whichever dedicated skill view is actually on screen
      // (Reading/Grammar/Listening each keep their own progress bar) rather
      // than always refreshing the legacy #lessonWorkspace, which otherwise
      // goes stale until the student navigates away and back.
      const currentView = getViewFromHash();
      if (SKILL_VIEWS.includes(currentView)) {
        renderSkillView(currentView);
      } else {
        renderLessonWorkspace();
      }
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
      window.AndergoGamification?.recordSkillTouched(
        exerciseBlock.dataset.skill,
        exerciseBlock.dataset.language || currentTargetLanguage
      );

      renderLessonWorkspace();
      return;
    }

    const tutorClearButton = event.target.closest('.tutor-clear-btn');
    if (tutorClearButton) {
      const conversation = document.getElementById('tutorConversation');
      if (conversation) {
        conversation.innerHTML =
          '<p class="tutor-welcome">👋 Soy Tutor AI. Pregúntame lo que quieras sobre esta habilidad, nivel o lección, y te ayudo con correcciones, ejemplos y práctica.</p>';
      }
      return;
    }

    const tutorButton = event.target.closest('.tutor-chat-btn');
    if (tutorButton) {
      const card = tutorButton.closest('#tutor');
      const activeSkill =
        card?.querySelector('.skill-tab-button.active')?.dataset.skill || 'speaking';
      const activeLesson = getActiveLearningLesson();
      const selectedSuggestion = card
        ?.querySelector('.skill-panel.active .predictive-suggestion.selected')
        ?.textContent?.trim();
      const fallbackPrompt =
        {
          listening: 'Quiero practicar comprensión auditiva con un ejemplo corto y una pregunta.',
          speaking: 'Quiero practicar conversación con una respuesta modelo y una repregunta.',
          writing: 'Quiero practicar escritura con una corrección breve y un ejemplo mejorado.'
        }[activeSkill] || 'Quiero practicar esta habilidad.';

      await sendTutorMessage({
        conversationEl: document.getElementById('tutorConversation'),
        thinkingEl: document.getElementById('tutorThinking'),
        connectionStatusEl: document.getElementById('tutorConnectionStatus'),
        promptEl: document.getElementById('aiTutorPrompt'),
        sendBtn: tutorButton,
        skill: activeSkill,
        level: learningPathState.level || 'A1',
        language: learningPathState.language,
        bridgeLanguage: currentBridgeLanguage,
        lessonTitle: activeLesson?.title || '',
        lessonIntro: activeLesson?.intro || activeLesson?.description || '',
        lessonSlug: activeLesson?.slug || '',
        currentActivity: 'Viendo la vista Tutor IA',
        supportMode: 'practice',
        selectedSuggestion,
        fallbackPrompt
      });
      return;
    }

    const openTutorBtn = event.target.closest('.open-tutor-btn');
    if (openTutorBtn) {
      const skillSection = openTutorBtn.closest('.skill-view-section');
      const skill = skillSection?.dataset.skill || 'speaking';
      const lesson =
        learningPathState.lessons.find(
          (item) => item.slug === skillSection?.dataset.activeLessonSlug
        ) || getActiveLearningLesson();
      openTutorDrawer({
        skill,
        lessonTitle: lesson?.title || '',
        lessonIntro: lesson?.intro || lesson?.description || '',
        lessonSlug: lesson?.slug || '',
        supportMode: openTutorBtn.dataset.supportMode || 'practice',
        currentActivity: `Practicando ${SKILL_LABELS[skill] || skill}`,
        prefill: openTutorBtn.dataset.tutorPrompt || '',
        transcript: openTutorBtn.dataset.tutorTranscript || '',
        vocabulary: openTutorBtn.dataset.tutorVocabulary || '',
        currentQuestion: openTutorBtn.dataset.tutorCurrentQuestion || '',
        selectedAnswer: openTutorBtn.dataset.tutorSelectedAnswer || ''
      });
      return;
    }

    // AI Tutor voice controls (Escuchar/Repetir share one button - see
    // renderTutorVoiceControls(); its label switches once played once).
    const tutorVoiceListenBtn = event.target.closest('.tutor-voice-listen');
    if (tutorVoiceListenBtn) {
      const messageEl = tutorVoiceListenBtn.closest('.tutor-message');
      if (messageEl) requestTutorSpeech(messageEl);
      return;
    }
    const tutorVoiceStopBtn = event.target.closest('.tutor-voice-stop');
    if (tutorVoiceStopBtn) {
      stopAllTutorAudio();
      return;
    }
    const tutorVoiceSpeedBtn = event.target.closest('.tutor-voice-speed-btn');
    if (tutorVoiceSpeedBtn) {
      tutorVoiceSpeedBtn
        .closest('.tutor-voice-speed-group')
        ?.querySelectorAll('.tutor-voice-speed-btn')
        .forEach((btn) => btn.classList.toggle('is-active', btn === tutorVoiceSpeedBtn));
      return;
    }

    const changeComboBtn = event.target.closest('.change-combination-btn');
    if (changeComboBtn) {
      openChangeCombinationPopover();
      return;
    }
    if (event.target.closest('.change-combo-apply')) {
      applyChangeCombination();
      return;
    }
    if (event.target.closest('.change-combo-close') || event.target.id === 'changeComboPopover') {
      closeChangeCombinationPopover();
      return;
    }

    if (event.target.closest('[data-action="close-tutor-drawer"]')) {
      closeTutorDrawer();
      return;
    }

    const readingToggleVocab = event.target.closest('.reading-toggle-vocab');
    if (readingToggleVocab) {
      const list = readingToggleVocab
        .closest('.reading-vocab-section')
        ?.querySelector('.reading-vocab-list');
      if (list) {
        list.hidden = !list.hidden;
        readingToggleVocab.textContent = list.hidden ? 'Ver vocabulario' : 'Ocultar vocabulario';
      }
      return;
    }
    const readingShowSupport = event.target.closest('.reading-show-support');
    if (readingShowSupport) {
      const area = readingShowSupport.closest('.reading-print-area');
      area?.querySelectorAll('.reading-vocab-support').forEach((el) => {
        el.hidden = false;
      });
      readingShowSupport.hidden = true;
      area?.querySelector('.reading-hide-support')?.removeAttribute('hidden');
      return;
    }
    const readingHideSupport = event.target.closest('.reading-hide-support');
    if (readingHideSupport) {
      const area = readingHideSupport.closest('.reading-print-area');
      area?.querySelectorAll('.reading-vocab-support').forEach((el) => {
        el.hidden = true;
      });
      readingHideSupport.hidden = true;
      area?.querySelector('.reading-show-support')?.removeAttribute('hidden');
      return;
    }
    if (event.target.closest('.reading-print-btn')) {
      window.print();
      return;
    }

    // Reading part pagination (English A1's 3-part readings) - re-renders
    // the whole view after mutating getReadingPartRuntime()'s state, same
    // pattern as the listening view's runtime map.
    const readingPartPrevBtn = event.target.closest('.reading-part-prev-btn');
    if (readingPartPrevBtn) {
      const sec = readingPartPrevBtn.closest('.skill-view-section');
      const lsn = learningPathState.lessons.find((item) => item.slug === sec?.dataset.activeLessonSlug);
      if (lsn) {
        getReadingPartRuntime(lsn).currentPart = Math.max(0, getReadingPartRuntime(lsn).currentPart - 1);
        renderReadingView(sec, lsn);
      }
      return;
    }
    const readingPartNextBtn = event.target.closest('.reading-part-next-btn');
    if (readingPartNextBtn) {
      const sec = readingPartNextBtn.closest('.skill-view-section');
      const lsn = learningPathState.lessons.find((item) => item.slug === sec?.dataset.activeLessonSlug);
      if (lsn) {
        const totalParts = lsn.reading?.parts?.length || 1;
        const runtime = getReadingPartRuntime(lsn);
        runtime.currentPart = Math.min(totalParts - 1, runtime.currentPart + 1);
        renderReadingView(sec, lsn);
      }
      return;
    }
    const readingPartShowFullBtn = event.target.closest('.reading-part-showfull-btn');
    if (readingPartShowFullBtn) {
      const sec = readingPartShowFullBtn.closest('.skill-view-section');
      const lsn = learningPathState.lessons.find((item) => item.slug === sec?.dataset.activeLessonSlug);
      if (lsn) {
        const runtime = getReadingPartRuntime(lsn);
        runtime.showFullText = !runtime.showFullText;
        renderReadingView(sec, lsn);
      }
      return;
    }
    const readingPartListenBtn = event.target.closest('.reading-part-listen-btn');
    if (readingPartListenBtn) {
      speakText(readingPartListenBtn.dataset.speakText, {
        locale: readingPartListenBtn.dataset.speakLocale,
        rate: Number(readingPartListenBtn.dataset.speakRate) || 1
      });
      return;
    }

    // "Order the events" activity - self-checked client-side (the correct
    // order isn't a secured answer key the way mcq options are, see
    // getReadingPartRuntime()'s docs above), comparing each shuffled event's
    // assigned position against its real position in lesson.reading.ordering.events.
    const readingOrderingCheckBtn = event.target.closest('.reading-ordering-check-btn');
    if (readingOrderingCheckBtn) {
      const container = readingOrderingCheckBtn.closest('.reading-ordering');
      const selects = container?.querySelectorAll('.reading-ordering-select') || [];
      const sec = readingOrderingCheckBtn.closest('.skill-view-section');
      const lsn = learningPathState.lessons.find((item) => item.slug === sec?.dataset.activeLessonSlug);
      const runtime = lsn ? getReadingPartRuntime(lsn) : null;
      let allCorrect = true;
      let allFilled = true;
      selects.forEach((select) => {
        const index = Number(select.dataset.index);
        const item = select.closest('.reading-ordering-item');
        if (!select.value) {
          allFilled = false;
          item?.classList.remove('is-correct', 'is-incorrect');
          return;
        }
        const correct = runtime && Number(select.value) === runtime.shuffledEvents[index]?.correctPosition;
        item?.classList.toggle('is-correct', Boolean(correct));
        item?.classList.toggle('is-incorrect', !correct);
        if (!correct) allCorrect = false;
      });
      const feedback = container?.querySelector('.reading-ordering-feedback');
      if (feedback) {
        if (!allFilled) feedback.textContent = 'Asigna una posición a cada evento.';
        else if (allCorrect) feedback.textContent = '¡Correcto! El orden es correcto.';
        else feedback.textContent = 'Algunos eventos no están en el orden correcto. Inténtalo de nuevo.';
      }
      return;
    }

    const writingReviewBtn = event.target.closest('.writing-review-btn');
    if (writingReviewBtn) {
      const editor = document.getElementById('writingEditor');
      const editorText = editor?.value.trim() || '';
      if (!editorText) {
        showHomeToast('Escribe tu texto antes de pedir revisión.');
        return;
      }
      const mode = writingReviewBtn.dataset.supportMode;
      const prompts = {
        'review-grammar': `Revisa la gramática de este texto y explica los errores: ${editorText}`,
        'review-vocabulary': `Sugiere mejoras de vocabulario para este texto: ${editorText}`,
        'review-coherence': `Revisa la coherencia y organización de este texto: ${editorText}`,
        'explain-errors': `Explícame en español los errores de este texto: ${editorText}`,
        hint: `Dame una pista para mejorar este texto sin reescribirlo tú: ${editorText}`
      };
      const section = writingReviewBtn.closest('.skill-view-section');
      const lesson = learningPathState.lessons.find(
        (item) => item.slug === section?.dataset.activeLessonSlug
      );
      const panel = document.getElementById('writingTutorPanel');
      if (panel) {
        panel.hidden = false;
        panel.querySelector('.writing-tutor-original p').textContent = editorText;
        panel.querySelector('.writing-tutor-suggestion p').textContent = 'Consultando al Tutor IA…';
      }
      writingReviewBtn.disabled = true;
      const data = await sendTutorMessage({
        conversationEl: null,
        thinkingEl: null,
        connectionStatusEl: null,
        promptEl: null,
        sendBtn: null,
        skill: 'writing',
        level: learningPathState.level || 'A1',
        language: learningPathState.language,
        bridgeLanguage: currentBridgeLanguage,
        lessonTitle: lesson?.title || '',
        lessonIntro: lesson?.intro || lesson?.description || '',
        lessonSlug: lesson?.slug || '',
        currentActivity: 'Escribiendo un texto',
        supportMode: mode,
        fallbackPrompt: prompts[mode] || editorText
      });
      writingReviewBtn.disabled = false;
      if (panel)
        panel.querySelector('.writing-tutor-suggestion p').textContent =
          data?.reply || 'No se pudo obtener una respuesta del Tutor IA.';
      return;
    }
    if (event.target.closest('.writing-accept-btn')) {
      // Never auto-replaces the student's text - just acknowledges the
      // suggestion was reviewed and dismisses the panel.
      document.getElementById('writingTutorPanel')?.setAttribute('hidden', '');
      showHomeToast('Sugerencia aceptada. Tu texto no se modificó automáticamente.');
      return;
    }
    if (event.target.closest('.writing-reject-btn')) {
      document.getElementById('writingTutorPanel')?.setAttribute('hidden', '');
      showHomeToast('Sugerencia descartada.');
      return;
    }
    if (event.target.closest('.writing-compare-btn')) {
      const panel = document.getElementById('writingTutorPanel');
      const currentBlock = panel?.querySelector('.writing-tutor-current');
      if (currentBlock) {
        currentBlock.hidden = !currentBlock.hidden;
        if (!currentBlock.hidden)
          currentBlock.querySelector('p').textContent =
            document.getElementById('writingEditor')?.value.trim() || '';
      }
      return;
    }

    // Repeats the term's pronunciation without re-flipping - the "keep a
    // speaker button available to repeat" requirement. Checked before the
    // broader .vocab-flip-card handler below so it doesn't also toggle flip.
    const vocabSpeakBtn = event.target.closest('.vocab-speak-btn');
    if (vocabSpeakBtn) {
      const card = vocabSpeakBtn.closest('.vocab-flip-card');
      if (card)
        speakText(card.dataset.speakText, {
          locale: card.dataset.speakLocale,
          rate: Number(card.dataset.speakRate) || 1
        });
      return;
    }
    // Tapping the example sentence (back of the card) reads the full
    // sentence aloud, separately from the term itself.
    const vocabExampleSpeak = event.target.closest('.vocab-example-speak');
    if (vocabExampleSpeak) {
      speakText(vocabExampleSpeak.dataset.speakText, {
        locale: vocabExampleSpeak.dataset.speakLocale,
        rate: Number(vocabExampleSpeak.dataset.speakRate) || 1
      });
      return;
    }
    const vocabFlipBtn = event.target.closest('.vocab-flip-btn');
    if (vocabFlipBtn) {
      vocabFlipBtn.closest('.vocab-flip-card')?.classList.toggle('is-flipped');
      return;
    }
    const vocabKnowBtn = event.target.closest('.vocab-know-btn');
    if (vocabKnowBtn) {
      vocabKnowBtn.closest('.vocab-flip-card')?.classList.add('is-known');
      return;
    }
    const vocabRetryBtn = event.target.closest('.vocab-retry-btn');
    if (vocabRetryBtn) {
      vocabRetryBtn.closest('.vocab-flip-card')?.classList.remove('is-known', 'is-flipped');
      return;
    }
    // Tapping/clicking anywhere else on the card itself: cancel any
    // in-flight pronunciation, speak the term, and flip the card - the core
    // flashcard interaction. Placed last among the vocab checks so the more
    // specific buttons above (speak/example/flip/know/retry) - and
    // .vocab-example-btn's .open-tutor-btn handling, earlier in this same
    // delegated handler - all short-circuit first.
    const vocabFlipCard = event.target.closest('.vocab-flip-card');
    if (vocabFlipCard) {
      speakText(vocabFlipCard.dataset.speakText, {
        locale: vocabFlipCard.dataset.speakLocale,
        rate: Number(vocabFlipCard.dataset.speakRate) || 1
      });
      vocabFlipCard.classList.add('is-flipped');
      return;
    }
  });

  document.getElementById('tutorFab')?.addEventListener('click', () => openTutorDrawer());

  document.getElementById('tutorDrawerSend')?.addEventListener('click', async () => {
    const sendBtn = document.getElementById('tutorDrawerSend');
    await sendTutorMessage({
      conversationEl: document.getElementById('tutorDrawerConversation'),
      thinkingEl: document.getElementById('tutorDrawerThinking'),
      connectionStatusEl: document.getElementById('tutorDrawerConnectionStatus'),
      promptEl: document.getElementById('tutorDrawerPrompt'),
      sendBtn,
      skill: tutorDrawerContext.skill,
      level: learningPathState.level || 'A1',
      language: learningPathState.language,
      bridgeLanguage: currentBridgeLanguage,
      lessonTitle: tutorDrawerContext.lessonTitle,
      lessonIntro: tutorDrawerContext.lessonIntro,
      lessonSlug: tutorDrawerContext.lessonSlug,
      currentActivity:
        tutorDrawerContext.currentActivity ||
        `Practicando ${SKILL_LABELS[tutorDrawerContext.skill] || tutorDrawerContext.skill}`,
      supportMode: tutorDrawerContext.supportMode,
      transcript: tutorDrawerContext.transcript,
      vocabulary: tutorDrawerContext.vocabulary,
      currentQuestion: tutorDrawerContext.currentQuestion,
      selectedAnswer: tutorDrawerContext.selectedAnswer,
      fallbackPrompt: 'Quiero practicar esta habilidad.'
    });
  });

  document.getElementById('tutorDrawerClear')?.addEventListener('click', () => {
    const conversation = document.getElementById('tutorDrawerConversation');
    if (conversation)
      conversation.innerHTML =
        '<p class="tutor-welcome">👋 Soy Tutor AI. Cuéntame qué quieres practicar.</p>';
  });

  document.getElementById('tutorDrawerPrompt')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    document.getElementById('tutorDrawerSend')?.click();
  });
}

function setupLearningPathControls() {
  const languageSelect = document.getElementById('pathLanguageSelect');
  const levelSelect = document.getElementById('pathLevelSelect');
  const bridgeSelect = document.getElementById('pathBridgeSelect');

  languageSelect?.addEventListener('change', () => {
    const level = levelSelect?.value || learningPathState.level;
    if (!setTargetLanguage(languageSelect.value, { level })) {
      languageSelect.value = learningPathState.language;
    }
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
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

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

// /reset-password is a plain path (not a #hash), reached only via the link
// Supabase emails - it overrides the normal hash-based view for this one
// load, regardless of whatever hash/query Supabase also appended to it.
if (window.location.pathname === '/reset-password') {
  showView('reset-password');
  initResetPasswordPage();
} else {
  showView(getViewFromHash());
}

// Checked once at load, not only on click - "oculta o desactiva el botón"
// applies from the start on browsers without the Web Speech API, not just
// after a failed attempt.
if (!getSpeechRecognitionCtor()) {
  document.querySelectorAll('.tutor-dictate-btn').forEach((btn) => {
    btn.disabled = true;
    setDictationStatusText(
      btn.dataset.dictateTarget,
      'El dictado por voz no está disponible en este navegador. Puedes escribir tu mensaje.'
    );
  });
  document.querySelectorAll('.tutor-dictate-stop-btn').forEach((btn) => {
    btn.hidden = true;
  });
}

document.querySelectorAll('.nav-group a[data-scroll-target]').forEach((link) => {
  link.addEventListener('click', () => {
    const targetId = link.dataset.scrollTarget;
    window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  });
});

// Waits for the signed-in user's saved language/level (if any) before the
// first render, so the learning path never flashes English A1 and then
// jumps to the real preference a moment later.
(async function bootstrapLearningPath() {
  const preferences = await loadPreferences();
  applyPreferencesToSelects(preferences);
  await loadLearningPath(preferences || {});
  updatePathPairPreview();
})();

document.getElementById('aiTutorPrompt')?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || event.shiftKey) return;
  event.preventDefault();
  event.target.closest('.tutor-action')?.querySelector('.tutor-chat-btn')?.click();
});
