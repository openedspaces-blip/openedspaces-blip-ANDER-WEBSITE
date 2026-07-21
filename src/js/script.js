// L1/bridge/interface language and L2/target language helpers
// (getInterfaceLabel/getSupportText/getTargetContent/getLanguagePairLabel) -
// see src/js/language-pair.js for the full definitions. bridgeLanguage IS
// the interface language in this architecture (one field, not two) - it is
// the language the platform's navigation, instructions, explanations, help
// and system messages appear in, not merely "a language the student already
// knows". Persisted server-side as profiles.bridge_language, paired with
// preferred_language/learningPathState.language (the target language being
// learned).
//
// Both live on learningPathState (learningPathState.bridgeLanguage /
// .language) - there used to be separate currentBridgeLanguage/
// currentTargetLanguage globals that had to be kept in sync by hand on every
// write; that duplication caused a real bug (the home cards/#languages tabs
// once updated only the target mirror, never learningPathState.language, so
// the two disagreed - see normalizeLanguageKey's comment below) and has been
// removed. learningPathState is the single source of truth for both.
const LanguagePair = window.AndergoLanguagePair;

// Whether the student has manually changed the Traductor's OWN source/target
// selects this session - once true, syncTranslatorLanguagesFromState() stops
// overwriting them on every visit to #translator, since the Traductor is
// intentionally able to translate a different pair than the one being
// studied (see setupTranslator()). Reset to false whenever the platform's
// own bridge/target pair changes, so the next visit to Traductor re-syncs to
// the new pair instead of staying stuck on a stale manual choice.
let translatorUserAdjustedPair = false;
// { hash, label } set by openTranslator() when it's opened from a lesson
// shortcut - drives #translatorReturnLink ("‹ Volver a la lección").
let translatorReturnContext = null;

// Fallback values only, used for the very first paint before GET /api/plans
// resolves below - lib/plansConfig.js on the server is the single source of
// truth for these numbers; nothing in this file should hardcode a price
// anywhere else. Kept as strings (already formatted, e.g. '4.99') since
// every call site below just interpolates them into "USD ${...}" text.
let premiumMonthlyPriceUsd = '4.99';
let premiumYearlyPriceUsd = '39.99';
// Back-compat alias for the few call sites below that only ever showed the
// monthly figure - avoids touching every interpolation site individually.
let premiumPriceUsd = premiumMonthlyPriceUsd;

// Re-applies the fetched prices to any already-painted markup that shows
// them as static text (the #premium pricing section) - everything else
// below reads the `premium*PriceUsd` variables directly at render time, so
// only DOM already in the page before loadPlans() resolves needs patching.
function refreshPremiumPricingUI() {
  document.querySelectorAll('[data-premium-monthly-price]').forEach((el) => {
    el.textContent = `USD ${premiumMonthlyPriceUsd}`;
  });
  document.querySelectorAll('[data-premium-yearly-price]').forEach((el) => {
    el.textContent = `USD ${premiumYearlyPriceUsd}`;
  });
}

async function loadPlans() {
  try {
    const res = await fetch('/api/plans');
    if (!res.ok) return;
    const { plans } = await res.json();
    const premium = plans?.find((plan) => plan.slug === 'premium');
    if (!premium) return;
    premiumMonthlyPriceUsd = Number(premium.monthlyPriceUsd).toFixed(2);
    premiumYearlyPriceUsd = Number(premium.yearlyPriceUsd).toFixed(2);
    premiumPriceUsd = premiumMonthlyPriceUsd;
    refreshPremiumPricingUI();
  } catch {
    // Keep the fallback values above - pricing display must never block
    // or break the rest of the page on a network hiccup.
  }
}
loadPlans();

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
const footerYearEl = document.getElementById('footerYear');
if (footerYearEl) footerYearEl.textContent = String(new Date().getFullYear());
const backendBaseUrl =
  typeof window !== 'undefined' && window.location.protocol === 'file:'
    ? 'http://127.0.0.1:3000'
    : '';
const authStatus = {
  user: null,
  session: null,
  // Populated only from GET /api/dashboard's `entitlements` field (see
  // lib/entitlementsService.js) - never set from username/email/localStorage,
  // so the CEO/Premium badge below can only ever reflect what the server
  // just verified, not a client-side guess.
  entitlements: null
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

// Runs once at page load (the closest equivalent this app's own
// REST-backed session model has to supabase-js's INITIAL_SESSION event -
// see saveSession()/logout() above and below for the SIGNED_IN/SIGNED_OUT
// equivalents). A valid restored session must never show the Auth modal or
// leave one open - closeAllAuthUI() is a no-op here in every current flow
// (authModal starts closed on a fresh load) but stays defensive on purpose,
// so this keeps holding even if some future deep link opens it before this
// runs.
function restoreSession() {
  try {
    const stored = JSON.parse(localStorage.getItem('andergoSession') || 'null');
    if (stored?.session?.access_token) {
      authStatus.user = stored.user || null;
      authStatus.session = stored.session;
      closeAllAuthUI();
    }
  } catch {
    localStorage.removeItem('andergoSession');
  }
  renderAuthState();
  loadDashboard();
  window.AndergoGamification?.load(gamificationKeyFor(authStatus.user));
}

// Supabase access tokens expire (~1h) but the app never refreshed them, so
// any long-lived tab started silently 401ing on every requireAuth route
// ("Debes iniciar sesión para continuar.") while the UI still showed the
// user as signed in - saveSession()/restoreSession() only ever stored
// session.refresh_token, nothing ever spent it. Called from authFetch()
// below on a 401; a quiet background swap, not a full saveSession() (no
// loadDashboard()/gamification reload needed just to renew a token).
async function refreshAuthSession() {
  const refreshToken = authStatus.session?.refresh_token;
  if (!refreshToken) return false;
  try {
    const response = await fetch(`${backendBaseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.session?.access_token) return false;

    authStatus.user = data.user || authStatus.user;
    authStatus.session = data.session;
    localStorage.setItem(
      'andergoSession',
      JSON.stringify({ user: authStatus.user, session: authStatus.session })
    );
    return true;
  } catch {
    return false;
  }
}

// fetch() wrapper for requireAuth-gated routes: attaches the current
// access token, and on a 401 tries refreshAuthSession() once, retrying the
// original request with the renewed token before giving up. Everything
// else about the response (ok/not-ok, body shape) is left for the caller
// to handle exactly as if this were a plain fetch.
async function authFetch(url, options = {}) {
  const withAuth = (opts) => ({
    ...opts,
    headers: { ...(opts.headers || {}), ...authHeaders() }
  });

  let response = await fetch(url, withAuth(options));
  if (response.status === 401 && authStatus.session?.refresh_token) {
    const refreshed = await refreshAuthSession();
    if (refreshed) response = await fetch(url, withAuth(options));
  }
  return response;
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
    const greeting = name ? `Hola, ${name}` : 'Hola';
    // entitlements.role comes straight from GET /api/dashboard, computed
    // server-side by getUserEntitlements() - this only ever renders what the
    // backend already decided, it never decides authorization itself.
    const roleBadge =
      isSignedIn && authStatus.entitlements?.role === 'ceo' ? ' · CEO · Premium' : '';
    userChip.textContent = isSignedIn ? `${greeting}${roleBadge}` : '';
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

// Single source of truth for the bridge (already-known) language - keeps
// the learning-path #pathBridgeSelect in sync and persists the change.
// bridgeName === target is allowed (spec §3: direct/immersion learning mode,
// L1 === L2) - only an actually-unsupported pair (see
// LanguagePair.isLanguagePairSupported) is rejected. Rejects and reverts the
// visible select if the pair is invalid, instead of silently accepting an
// impossible combination.
function setBridgeLanguage(bridgeName, options = {}) {
  const target = learningPathState.language;
  if (LanguagePair && !LanguagePair.isLanguagePairSupported(bridgeName, target)) {
    showHomeToast('Esta combinación estará disponible próximamente.');
    const staleBridgeSelect = document.getElementById('pathBridgeSelect');
    if (staleBridgeSelect) staleBridgeSelect.value = learningPathState.bridgeLanguage;
    return false;
  }

  learningPathState.bridgeLanguage = bridgeName;
  syncLearningMode();
  translatorUserAdjustedPair = false;
  const bridgeSelect = document.getElementById('pathBridgeSelect');
  if (bridgeSelect) bridgeSelect.value = bridgeName;
  applyInterfaceLanguage(bridgeName);
  updatePathPairPreview();
  if (options.persist !== false) {
    savePreferences(learningPathState.language, learningPathState.level, bridgeName);
  }
  return true;
}

// Refreshes every static interface-chrome label tied to the bridge/target
// pair (selector labels, pill label prefixes, the AI tutor's "Idioma" pill)
// to the current bridgeLanguage - see src/js/language-pair.js's
// getInterfaceLabel and the data-field="...Label" spans added alongside
// each one in index.html. Safe to call as often as needed and from any
// screen; a querySelectorAll pass only ever touches elements that exist on
// the current page, so no caller needs to know which ones are present.
function refreshLanguagePairChrome() {
  if (!LanguagePair) return;
  [
    'bridgeSelectLabel',
    'targetSelectLabel',
    'levelSelectLabel',
    'bridgeLabel',
    'targetLabel',
    'levelLabel',
    'aiLanguageLabel'
  ].forEach((key) => {
    document.querySelectorAll(`[data-field="${key}"]`).forEach((el) => {
      el.textContent = LanguagePair.getInterfaceLabel(key, learningPathState.bridgeLanguage);
    });
  });
}

// L1/bridgeLanguage -> <html lang="..."> code, for accessibility/SEO only
// (screen readers, browser translate prompts). Falls back to Spanish, same
// rule as every other lookup in this file's language-pair layer.
const bridgeLanguageToHtmlLang = { spanish: 'es', english: 'en', french: 'fr', italian: 'it', german: 'de' };

// Applies the platform-wide interface language (spec §2: L1 controls
// navigation, buttons, instructions, system messages, dashboard, auth,
// Premium, tutor, translator, footer, About - everything except the L2
// learning content itself). Patches every element carrying a data-i18n*
// attribute in place via LanguagePair.t() (src/js/language-pair.js) rather
// than re-rendering, so it's safe to call on every bridgeLanguage change
// without disturbing focus, scroll position or in-progress input. Also
// refreshes the narrower language-pair-selector chrome (refreshLanguagePairChrome)
// and <html lang> so the two interface-language mechanisms never disagree.
function applyInterfaceLanguage(bridgeLanguage) {
  if (!LanguagePair) return;
  document.documentElement.lang = bridgeLanguageToHtmlLang[bridgeLanguage] || 'es';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = LanguagePair.t(el.dataset.i18n, bridgeLanguage);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', LanguagePair.t(el.dataset.i18nAriaLabel, bridgeLanguage));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', LanguagePair.t(el.dataset.i18nPlaceholder, bridgeLanguage));
  });
  refreshLanguagePairChrome();
}

// Keeps learningPathState.learningMode ('direct' | 'bilingual', spec §3) in
// sync with bridgeLanguage/targetLanguage. Derived, not independently set -
// call this after every place that changes either field, same rule as
// applyInterfaceLanguage for bridgeLanguage changes.
function syncLearningMode() {
  learningPathState.learningMode = LanguagePair
    ? LanguagePair.getLearningMode(learningPathState.bridgeLanguage, learningPathState.language)
    : learningPathState.bridgeLanguage === learningPathState.language
      ? 'direct'
      : 'bilingual';
}

function updatePathPairPreview() {
  refreshLanguagePairChrome();
  const preview = document.getElementById('pathPairPreview');
  if (preview) {
    preview.textContent = LanguagePair
      ? LanguagePair.getLanguagePairLabel(learningPathState.bridgeLanguage, learningPathState.language)
      : `Aprenderás ${languageDisplayNames[learningPathState.language] || learningPathState.language} con apoyo en ${languageDisplayNames[learningPathState.bridgeLanguage] || learningPathState.bridgeLanguage}.`;
  }

  // Discreet "Método directo"/"Modo bilingüe" badge (spec: L1=L2 integration
  // phase, §6) - always kept in sync with the same learningMode
  // syncLearningMode() maintains, in the current interface language.
  const modeBadge = document.getElementById('pathPairModeBadge');
  if (modeBadge && LanguagePair) {
    const isDirect = learningPathState.learningMode === 'direct';
    modeBadge.textContent = LanguagePair.t(
      isDirect ? 'directModeBadge' : 'bilingualModeBadge',
      learningPathState.bridgeLanguage
    );
    modeBadge.classList.toggle('is-direct-mode', isDirect);
    modeBadge.classList.toggle('is-bilingual-mode', !isDirect);
  }
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

  if (LanguagePair && !LanguagePair.isLanguagePairSupported(learningPathState.bridgeLanguage, resolved)) {
    showHomeToast('Esta combinación estará disponible próximamente.');
    return false;
  }

  // recognition.lang is fixed for the life of a SpeechRecognition instance -
  // a language switch mid-dictation would otherwise keep listening in the
  // old language.
  stopTutorDictation();

  learningPathState.language = resolved;
  syncLearningMode();
  translatorUserAdjustedPair = false;

  const pathLanguageSelect = document.getElementById('pathLanguageSelect');
  if (pathLanguageSelect) pathLanguageSelect.value = resolved;

  const level = options.level || learningPathState.level;
  loadLearningPath({ language: resolved, level });
  updatePathPairPreview();
  updateAiTutorContext();
  updateLevelTabLabels();
  if (options.persist !== false) savePreferences(resolved, level, learningPathState.bridgeLanguage);
  return true;
}

// Swaps bridge<->target (Español -> Inglés becomes Inglés -> Español) for the
// prominent pair selector's ⇄ button. Deliberately not just two calls to
// setBridgeLanguage()/setTargetLanguage() in sequence - each of those checks
// its new value against the OTHER field's CURRENT value, so calling them
// back-to-back mid-swap would see the not-yet-updated other side and reject
// a perfectly valid swapped pair (new bridge === still-old target). Updates
// both fields together, then runs the same side effects setTargetLanguage
// does (select sync, reload lessons, persist, refresh chrome).
function swapLearningPathLanguages() {
  if (!LanguagePair) return false;
  const swapped = LanguagePair.swapLanguagePair(
    learningPathState.bridgeLanguage,
    learningPathState.language
  );
  if (!swapped) {
    showHomeToast('Esta combinación estará disponible próximamente.');
    return false;
  }

  stopTutorDictation();
  learningPathState.bridgeLanguage = swapped.bridge;
  learningPathState.language = swapped.target;
  syncLearningMode();
  translatorUserAdjustedPair = false;

  const bridgeSelect = document.getElementById('pathBridgeSelect');
  if (bridgeSelect) bridgeSelect.value = swapped.bridge;
  const pathLanguageSelect = document.getElementById('pathLanguageSelect');
  if (pathLanguageSelect) pathLanguageSelect.value = swapped.target;
  applyInterfaceLanguage(swapped.bridge);

  loadLearningPath({ language: swapped.target, level: learningPathState.level });
  updatePathPairPreview();
  updateAiTutorContext();
  updateLevelTabLabels();
  savePreferences(swapped.target, learningPathState.level, swapped.bridge);
  return true;
}

// Only the Spanish translation is real, authored data (lib/seed-lessons.json
// vocabulary is translated into Spanish only, regardless of target
// language - confirmed, there is no per-bridge-language dictionary yet).
// For any other bridge language, label the Spanish text as a reference
// instead of presenting it as a translation into the student's actual
// bridge language - never fabricate a translation that isn't real data.
function resolveVocabTranslation(item, bridgeLanguage = learningPathState.bridgeLanguage) {
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

// Single shared close for every Auth-entry panel - login, signup (including
// its OTP verification step), forgotPassword and mfaChallenge all live as
// tabs/steps inside this one #authModal dialog, so hiding it once closes all
// of them at once. Called both for a manual close (X button/Escape/backdrop,
// via the closeAuth() alias below) and right after a successful
// login/MFA/confirmation-then-login or a valid restored session (see
// afterAuthSuccess and restoreSession) so the modal can never linger visible
// over an already-signed-in UI.
function closeAllAuthUI() {
  authModal.classList.remove('open');
  authModal.setAttribute('aria-hidden', 'true');
  authModal.setAttribute('inert', '');
  // Only ever removed here, never set unconditionally: logoutConfirmModal/
  // paywallModal/usernameOnboardingModal toggle this same body class for
  // their own open state, but none of them can be open at the same time as
  // authModal in this app's actual flows (see the modals' own open*() -
  // each is only ever triggered from a state where authModal is already
  // closed), so this never fights another modal's lock.
  document.body.classList.remove('modal-open');
  (authModalReturnFocus || document.querySelector('[data-action="open-auth"]'))?.focus();
  authModalReturnFocus = null;
  clearPendingMfa();
  clearAuthMessages();
  // Never leave a password/OTP value sitting in the DOM once the panel that
  // collected it is hidden - a later reopen (or a screen reader landing on
  // stale text) must never show a previous attempt's sensitive input.
  ['loginPassword', 'signupPassword', 'signupConfirmPassword', 'mfaChallengeCode'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.querySelectorAll('#otpInputRow .otp-digit').forEach((input) => {
    input.value = '';
  });
}

function closeAuth() {
  closeAllAuthUI();
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

// Shown when a Free-tier monthly cap (Tutor IA: 30/mes, voz: 10/mes) is
// reached - see openPaywallModal() below for what fills its content, and
// the /api/ai/tutor and /api/speech/synthesize callers further down for
// where USAGE_LIMIT_REACHED triggers it. Never fakes a purchase: the
// "Obtener Premium" button only scrolls to #premium (see the existing
// .upgrade-btn delegated handler) - no gateway exists yet (lib/billingService.js
// is a stub), so nothing here calls changePlan or flips the user to Premium.
const paywallModal = document.getElementById('paywallModal');
let paywallReturnFocus = null;

// Short, curated subset of lib/plansConfig.js's premium feature list (the
// full list lives in the #premium pricing section) - just enough for the
// "qué obtiene Premium" bullet the spec asks the modal to show.
const PAYWALL_PREMIUM_HIGHLIGHTS = [
  'Tutor IA y conversación por voz sin límites',
  'Todos los idiomas y todos los niveles',
  'Corrección de pronunciación',
  'Certificados y estadísticas completas'
];

// authStatus.entitlements is only ever populated from GET /api/dashboard
// (see saveSession() above) - never derived from localStorage/username, so
// this is safe to gate real features on (e.g. the Tutor's hands-free
// conversation mode below), not just cosmetic copy.
function isPremiumUser() {
  return Boolean(authStatus.entitlements?.isPremium);
}

// title/message let a caller override the two spots worded around a usage
// cap ("Has alcanzado el límite...") for cases that aren't a cap at all -
// e.g. a Premium-only lesson a Free account just tapped into (see the
// lesson workspace's 'open-lesson-paywall' handler below).
function openPaywallModal({ featureLabel, used, limit, title, message } = {}) {
  if (!paywallModal) return;
  paywallReturnFocus = document.activeElement;

  const titleEl = document.getElementById('paywallModalTitle');
  if (titleEl) titleEl.textContent = title || 'Has alcanzado el límite de tu plan gratuito.';

  const usageLine = document.getElementById('paywallUsageLine');
  if (usageLine) {
    usageLine.textContent =
      message ||
      (used != null && limit != null
        ? `Usaste ${used} de ${limit} ${featureLabel} este mes.`
        : `Alcanzaste el límite de ${featureLabel} de tu plan gratuito.`);
  }

  const featuresList = document.getElementById('paywallFeatures');
  if (featuresList) {
    featuresList.innerHTML = PAYWALL_PREMIUM_HIGHLIGHTS.map(
      (item) => `<li>${escapeHtml(item)}</li>`
    ).join('');
  }

  // Prices are never hardcoded here - refreshPremiumPricingUI() (see
  // loadPlans() near the top of this file) fills in the same
  // [data-premium-monthly-price]/[data-premium-yearly-price] spans this
  // modal's markup uses, from GET /api/plans.
  refreshPremiumPricingUI();

  paywallModal.classList.add('open');
  paywallModal.setAttribute('aria-hidden', 'false');
  paywallModal.removeAttribute('inert');
  document.body.classList.add('modal-open');
  paywallModal.querySelector('[data-action="dismiss-paywall"]')?.focus();
}

function closePaywallModal() {
  if (!paywallModal) return;
  paywallModal.classList.remove('open');
  paywallModal.setAttribute('aria-hidden', 'true');
  paywallModal.setAttribute('inert', '');
  document.body.classList.remove('modal-open');
  paywallReturnFocus?.focus();
  paywallReturnFocus = null;
}

paywallModal?.addEventListener('click', (event) => {
  if (event.target === paywallModal) {
    closePaywallModal();
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'dismiss-paywall') {
    closePaywallModal();
  } else if (action === 'paywall-upgrade') {
    // Navigation to #premium is handled by the global .upgrade-btn
    // delegated click handler (this button carries that class too) - this
    // listener only closes the modal so it doesn't stay open over the
    // pricing section.
    closePaywallModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (logoutConfirmModal?.classList.contains('open')) {
    closeLogoutConfirm();
  } else if (authModal?.classList.contains('open')) {
    closeAuth();
  } else if (paywallModal?.classList.contains('open')) {
    closePaywallModal();
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
    // Two response shapes exist across our own /api routes: plain auth
    // errors (POST /api/auth) put the human message in `error` and the
    // machine code in `code`; ok:false-wrapped endpoints (username-available,
    // verify-otp, profile/username, rate limiters, ...) put the code in
    // `error` and the human message in `message`. Handle both instead of
    // occasionally surfacing a raw code like "USERNAME_NOT_AVAILABLE" as
    // user-facing text.
    const message = data.message || data.error || 'Request failed';
    const code = data.code || (data.message ? data.error : undefined);
    const error = new Error(message);
    if (code) error.code = code;
    // Only ever present on the EMAIL_NOT_CONFIRMED login error (see
    // lib/authService.js) - undefined everywhere else, so this never adds a
    // field to any other endpoint's thrown error.
    if (data.email) error.email = data.email;
    throw error;
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
      if (isLoading)
        progressText.textContent = LanguagePair.t('dashboardLoadingProgress', learningPathState.bridgeLanguage);
      else if (isError)
        progressText.textContent = LanguagePair.t('progressLoadFailed', learningPathState.bridgeLanguage);
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
//
// username MUST be forwarded here - it used to be silently dropped (this
// function only returned language/level/bridgeLanguage), which meant
// maybeShowUsernameOnboarding() below always saw preferences.username as
// undefined and opened the modal for every single login, even for accounts
// that already had a real username (e.g. profiles.username = 'anderson2026').
// See shouldShowUsernameOnboarding()'s profileStatus state machine for how
// this is now evaluated safely.
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
      bridgeLanguage: data.bridgeLanguage || 'spanish',
      username: data.username ?? null
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

  preferences.bridgeLanguage = preferences.bridgeLanguage || 'spanish';

  // A stored/shared pair can be unsupported (saved before a validation fix,
  // or written directly through the API bypassing the client) - never apply
  // it as-is, same rule every interactive change already enforces
  // (setBridgeLanguage/setTargetLanguage/swapLearningPathLanguages below).
  // Corrects `preferences` in place (not just local variables) because both
  // call sites (afterAuthSuccess, bootstrapLearningPath) reuse this same
  // object for their own loadLearningPath() call right after this one.
  if (
    LanguagePair &&
    !LanguagePair.isLanguagePairSupported(preferences.bridgeLanguage, preferences.language)
  ) {
    const resolved = LanguagePair.normalizeLanguagePair(
      preferences.bridgeLanguage,
      preferences.language
    );
    preferences.bridgeLanguage = resolved.bridge;
    preferences.language = resolved.target;
    showHomeToast('Esta combinación estará disponible próximamente.');
  }

  if (languageSelect) languageSelect.value = preferences.language;
  if (levelSelect) levelSelect.value = preferences.level;
  if (bridgeSelect) bridgeSelect.value = preferences.bridgeLanguage;
  learningPathState.bridgeLanguage = preferences.bridgeLanguage;
  applyInterfaceLanguage(learningPathState.bridgeLanguage);
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
  const lang = learningPathState.bridgeLanguage;
  const grid = document.getElementById('dashboardStatsGrid');
  if (grid)
    grid.innerHTML = `<p class="skill-graph-empty">${escapeHtml(LanguagePair.t('dashboardLoadingPanel', lang))}</p>`;
  const goalBody = document.getElementById('goalsCrudBody');
  if (goalBody)
    goalBody.innerHTML = `<p class="skill-graph-empty">${escapeHtml(LanguagePair.t('dashboardLoadingGoal', lang))}</p>`;
  const activityList = document.getElementById('dashboardActivityList');
  if (activityList)
    activityList.innerHTML = `<li class="skill-graph-empty">${escapeHtml(LanguagePair.t('dashboardLoadingActivity', lang))}</li>`;
  // The home hero's goal one-liner is a separate DOM node (renderDashboardGoal
  // only touches it once real data arrives) - without this it would keep
  // showing the static "Sin objetivo activo" placeholder while this loads.
  const homeGoalSummary = document.querySelector('#homeGoalSummary strong');
  if (homeGoalSummary) homeGoalSummary.textContent = LanguagePair.t('genericLoading', lang);
}

function renderDashboardError() {
  const lang = learningPathState.bridgeLanguage;
  const grid = document.getElementById('dashboardStatsGrid');
  if (grid)
    grid.innerHTML = `<p class="skill-graph-empty">${escapeHtml(LanguagePair.t('panelLoadFailed', lang))}</p>`;
  const homeGoalSummary = document.querySelector('#homeGoalSummary strong');
  if (homeGoalSummary) homeGoalSummary.textContent = LanguagePair.t('genericLoadFailed', lang);
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
    authStatus.entitlements = null;
    renderDashboardSignedOut();
    return;
  }

  dashboardPreferences = data.preferences;
  // Defense-in-depth for shouldShowUsernameOnboarding()'s race-condition
  // rule: if the dashboard's own preferences (also carrying username)
  // resolve while the onboarding modal happens to still be open, close it
  // immediately rather than leaving a stale "create your username" prompt
  // up for an account that already has one.
  closeUsernameOnboardingIfNowSatisfied(data.preferences);
  if (data.entitlements) {
    authStatus.entitlements = data.entitlements;
    renderAuthState();
  }
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

// Relabels "Enviar enlace" to a counting-down "Reenviar enlace (Ns)" after a
// successful send, instead of re-enabling immediately - the visible
// countdown the spec asks for, using the same button rather than adding a
// second one. Any pending countdown is always cleared first, so reopening
// the panel or submitting again never stacks two intervals.
let forgotPasswordCooldownInterval = null;
function resetForgotPasswordForm() {
  window.clearInterval(forgotPasswordCooldownInterval);
  forgotPasswordCooldownInterval = null;
  const submitBtn = document.getElementById('forgotPasswordSubmit');
  const statusEl = document.getElementById('forgotPasswordStatus');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = LanguagePair.t('authSendLink', learningPathState.bridgeLanguage);
  }
  if (statusEl) {
    statusEl.textContent = '';
    statusEl.classList.remove('is-error');
    statusEl.setAttribute('role', 'status');
  }
}

function startForgotPasswordCooldown(button, seconds = 30) {
  if (!button) return;
  window.clearInterval(forgotPasswordCooldownInterval);
  let remaining = seconds;
  const resendLabel = LanguagePair.t('authResendLink', learningPathState.bridgeLanguage);
  button.disabled = true;
  button.textContent = `${resendLabel} (${remaining}s)`;
  forgotPasswordCooldownInterval = window.setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      window.clearInterval(forgotPasswordCooldownInterval);
      forgotPasswordCooldownInterval = null;
      button.disabled = false;
      button.textContent = resendLabel;
      return;
    }
    button.textContent = `${resendLabel} (${remaining}s)`;
  }, 1000);
}

function clearAuthMessages() {
  document.querySelectorAll('.auth-form .auth-note').forEach((note) => {
    note.textContent = note.dataset.defaultText || '';
    note.style.color = '';
  });
}

// Views that only ever show an "Inicia sesión para..." placeholder for a
// guest (see renderDashboardSignedOut/loadSecurityStatus) - unlike 'learn'
// and 'tutor', which stay genuinely usable signed out (free lessons, an
// uncapped Tutor IA chat) and so are deliberately left off this list.
const MEMBER_ONLY_VIEWS_AFTER_LOGOUT = ['progress', 'achievements', 'goals', 'security'];

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
    // A dismissal only ever applies to the account that dismissed it - the
    // next login (same tab or not) re-evaluates fresh instead of inheriting
    // a previous account's "Ahora no".
    sessionStorage.removeItem(USERNAME_ONBOARDING_DISMISSED_KEY);
    profileStatus = 'idle';
    renderAuthState();
    updateProgressDisplay();
    renderDashboard(null);
    window.AndergoGamification?.load('guest');
    // "Volver a la página pública" (spec §8) - never leave a signed-out
    // student stranded on a now-empty member-only view; never opens the
    // login modal automatically either (that stays the student's choice).
    if (MEMBER_ONLY_VIEWS_AFTER_LOGOUT.includes(getViewFromHash())) {
      if (window.location.hash !== '#home') history.pushState(null, '', '#home');
      showView('home');
    }
  }
}

// Tracks the GET /api/preferences fetch that maybeShowUsernameOnboarding()
// depends on - 'loading'/'error'/a preferences object still in flight or a
// transient failure must never be read as "no username", or the modal would
// wrongly open for an account that has a real username the moment a request
// is merely slow or a network blip returns null. See afterAuthSuccess() for
// the only place this transitions away from 'idle'.
let profileStatus = 'idle';

const USERNAME_ONBOARDING_DISMISSED_KEY = 'username_onboarding_dismissed';

// Single source of truth for "does this account already have a username" -
// profiles.username_normalized/profiles.username (loaded via
// GET /api/preferences into `profile`) is authoritative; user.username (from
// the login/register response's user_metadata.username, see
// lib/authService.js) is only ever a fallback for the brief window right
// after login before that preferences fetch resolves.
function hasValidUsername({ profile, user }) {
  const profileUsername = profile?.username;
  const metadataUsername = user?.username;
  return Boolean(String(profileUsername || metadataUsername || '').trim());
}

// Centralizes every condition that must hold before the "create your
// username" onboarding is allowed to open - see the equivalent checklist in
// the task this was written against: no session, no confirmed email, a
// profile fetch that hasn't finished (or failed) yet, or an account that
// already has a username must all block it, not just "preferences.username
// was falsy" (that one omission is what caused the modal to reopen for
// every account, including ones with a real username - see loadPreferences()
// above).
function shouldShowUsernameOnboarding({ session, user, profile, profileStatus: status }) {
  if (!session?.access_token) return false;
  if (!user?.emailConfirmedAt) return false;
  if (status !== 'loaded') return false;
  if (sessionStorage.getItem(USERNAME_ONBOARDING_DISMISSED_KEY) === 'true') return false;
  if (hasValidUsername({ profile, user })) return false;
  return true;
}

// Shows the "create your username" onboarding once, right after a
// successful login, but only for accounts that predate this feature (no
// username anywhere yet) - never blocks anything else. See
// shouldShowUsernameOnboarding() for the full gate.
//
// One extra step before that gate: if profiles has no username yet but the
// signup metadata does (user.username - see lib/authService.js), try to
// persist it server-side first instead of either trusting it forever or
// discarding it (§9) - claimUsername() only succeeds if that exact username
// is still available, so this can never silently steal/overwrite one. This
// is most commonly the rare handle_new_user() collision case (see the
// 202607150001 migration's comments) where the metadata username was
// already claimed by someone else in the same instant; then the sync fails
// and onboarding is the correct outcome, not a silently-skipped prompt.
async function maybeShowUsernameOnboarding(preferences) {
  let user = authStatus.user;

  // profileStatus !== 'loaded' already makes shouldShowUsernameOnboarding()
  // return false below regardless - skip the sync network call too in that
  // case (profile fetch still in flight or failed) rather than firing it
  // pointlessly.
  if (profileStatus === 'loaded' && !preferences?.username && user?.username) {
    try {
      await postJson('/api/profile/username', { username: user.username }, { auth: true });
      preferences = { ...preferences, username: user.username };
    } catch {
      // That exact username wasn't usable - it must stop counting as
      // "valid" below, or a failed sync would be treated the same as a
      // successful one and onboarding would never open for this account.
      user = { ...user, username: null };
    }
  }

  if (
    !shouldShowUsernameOnboarding({
      session: authStatus.session,
      user,
      profile: preferences,
      profileStatus
    })
  ) {
    return;
  }
  const modal = document.getElementById('usernameOnboardingModal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  modal.removeAttribute('inert');
  document.body.classList.add('modal-open');
  modal.querySelector('input')?.focus();
}

// Safety net for the (rare, non-racy-today, but worth guarding) case where a
// username becomes known - e.g. profile data resolves after the modal was
// already opened, or the account gets a username via another path this
// session - while the onboarding modal is still open: close it immediately
// rather than leaving a stale prompt up for a username that already exists.
function closeUsernameOnboardingIfNowSatisfied(preferences) {
  const modal = document.getElementById('usernameOnboardingModal');
  if (!modal || !modal.classList.contains('open')) return;
  if (hasValidUsername({ profile: preferences, user: authStatus.user })) {
    closeUsernameOnboarding();
  }
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

  const setResetStatus = (message, isError) => {
    statusEl.textContent = message;
    statusEl.classList.toggle('is-error', isError);
    statusEl.setAttribute('role', isError ? 'alert' : 'status');
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = document.getElementById('resetNewPassword')?.value || '';
    const confirmPassword = document.getElementById('resetConfirmPassword')?.value || '';

    if (!password || !confirmPassword) {
      setResetStatus('Completa ambos campos.', true);
      return;
    }
    if (password !== confirmPassword) {
      setResetStatus('Las contraseñas no coinciden.', true);
      return;
    }
    // Supabase's own default minimum (6 chars) - a friendly pre-check only;
    // the actual policy is still enforced server-side by updateUser() below,
    // whatever it's configured to be.
    if (password.length < 6) {
      setResetStatus('La contraseña debe tener al menos 6 caracteres.', true);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setResetStatus('Guardando…', false);

    try {
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;

      // End the recovery-only session (never leave the student signed in
      // via the one-time recovery token) and strip it from the URL before
      // showing success - the success panel itself stays up until the
      // student clicks "Ir a iniciar sesión", per spec (never auto-navigate
      // away before they can read the confirmation).
      await client.auth.signOut().catch(() => {});
      window.history.replaceState(null, '', '/');

      setResetStatus('', false);
      form.hidden = true;
      successEl.hidden = false;
      successEl.focus?.();
    } catch {
      setResetStatus('No se pudo actualizar la contraseña. Solicita un nuevo enlace.', true);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// Guards initEmailConfirmedPage() below against ever processing the same
// confirmation `code` twice: it runs exactly once today (called once at
// load - see the bottom of this file), but a `code` is single-use on
// Supabase's side, so a second run (e.g. a bfcache restore replaying this
// script) must short-circuit instead of sending an already-spent code back
// to exchangeCodeForSession().
let emailConfirmationCallbackHandled = false;

// Drives the confirmation-LINK variant landing (#emailConfirmedSection,
// ?auth=confirmed) - the 6-digit OTP in showSignupPending() is the primary
// confirmation path; this only covers a student tapping the email's link
// instead. Supabase's confirmation link can arrive either as a PKCE `code`
// query param (exchangeCodeForSession) or with the session already
// established via the URL fragment (supabase-js's detectSessionInUrl reads
// that automatically on client creation) - both are handled the same way
// below: confirm a session exists, then immediately sign it back out. That
// session is never adopted as this app's own signed-in state (which only
// ever comes from POST /api/auth - see login() in lib/authService.js) and
// never left lingering - per spec, confirming an email must never auto-log
// the student in or land them on a password form; it only ever shows the
// confirmation message and sends them to the normal login.
async function initEmailConfirmedPage() {
  if (emailConfirmationCallbackHandled) return;
  emailConfirmationCallbackHandled = true;

  const successEl = document.getElementById('emailConfirmedSuccess');
  const invalidEl = document.getElementById('emailConfirmedInvalid');
  const invalidMessageEl = document.getElementById('emailConfirmedInvalidMessage');
  if (!successEl || !invalidEl) return;

  // The URL's callback params (?auth=confirmed / code / error*) are only
  // ever meaningful for this one load - stripped once, after processing
  // finishes (success or not), never before, so a reload never re-attempts
  // an already-spent code and never leaves a stale error dangling in the
  // address bar either.
  function showInvalid(message) {
    window.history.replaceState(null, '', '/');
    successEl.hidden = true;
    invalidEl.hidden = false;
    if (invalidMessageEl && message) invalidMessageEl.textContent = message;
  }

  function showSuccess(email) {
    window.history.replaceState(null, '', '/');
    successEl.hidden = false;
    invalidEl.hidden = true;
    const loginIdentifierInput = document.getElementById('loginIdentifier');
    if (loginIdentifierInput && email) loginIdentifierInput.value = email;
  }

  // Supabase's own error redirect (expired/already-used/invalid link) lands
  // here with ?error&error_code&error_description instead of a `code` -
  // that request never reaches exchangeCodeForSession at all, so this must
  // be checked first, before even loading supabase-js.
  const callbackParams = new URLSearchParams(window.location.search);
  const errorCode = callbackParams.get('error_code');
  if (callbackParams.get('error') || errorCode) {
    showInvalid(
      errorCode === 'otp_expired'
        ? 'El enlace de confirmación expiró. Solicita uno nuevo.'
        : undefined
    );
    return;
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

  // Registered immediately, before any of the getSession()/
  // exchangeCodeForSession() calls below - a purely observational
  // safeguard: this app's REST-backed session model (see login() in
  // lib/authService.js) never adopts a supabase-js session as its own
  // signed-in state, so nothing here reacts to the event itself, but it
  // must exist from the start rather than risk missing a SIGNED_IN that
  // fires while the client is still finishing setup.
  client.auth.onAuthStateChange(() => {});

  try {
    const code = callbackParams.get('code');
    let { data } = await client.auth.getSession();
    // Only exchange if there's a code AND no session yet - never re-run
    // this for a code that already produced a session (see
    // emailConfirmationCallbackHandled above for the same guarantee across
    // repeated calls to this function).
    if (code && !data?.session) {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (error) throw error;
      ({ data } = await client.auth.getSession());
    }
    if (!data?.session) throw new Error('No confirmation session');
    if (!data.session.user?.email_confirmed_at) throw new Error('Email not confirmed');
    const email = data.session.user?.email || null;

    await client.auth.signOut().catch(() => {});
    showSuccess(email);
  } catch {
    showInvalid();
  }
}

document.getElementById('emailConfirmedSuccess')?.addEventListener('click', (event) => {
  if (!event.target.closest('[data-action="email-confirmed-login"]')) return;
  if (window.location.hash !== '#home') history.pushState(null, '', '#home');
  showView('home');
  openModal('login');
});

// Called right after saveSession() on every successful sign-in path (plain
// login, MFA-completed login, and register()'s immediate-session dev-store
// fallback) - see loginForm/mfaChallengeForm/signupForm's submit handlers
// below. The session is already saved by the time this runs, so the modal
// closes immediately, before any of the slower per-account loads below -
// previously closeAuth() only ran after all of them resolved, so a slow or
// failed loadProgress()/loadPreferences()/loadLearningPath() left the Auth
// modal sitting open over an already-signed-in page instead of closing on
// login as expected.
async function afterAuthSuccess() {
  closeAllAuthUI();

  try {
    await loadProgress();

    // profileStatus gates maybeShowUsernameOnboarding() below - it must reach
    // 'loaded' (a real preferences object, username included) before the
    // onboarding modal is even considered, never while the fetch is still
    // 'loading' or ended in 'error' (loadPreferences() only ever returns null
    // on a genuine fetch/parse failure here, since every profile row already
    // has language/level defaults - see preferencesService.js).
    profileStatus = 'loading';
    const preferences = await loadPreferences();
    profileStatus = preferences ? 'loaded' : 'error';

    applyPreferencesToSelects(preferences);
    await loadLearningPath(preferences || {});
    await maybeShowUsernameOnboarding(preferences);
  } catch (error) {
    // The signed-in UI itself (header/dashboard) is already showing - never
    // let a hiccup in one of these secondary loads throw back up into the
    // caller and look like the login itself failed.
    console.warn('Post-login setup failed', error);
  }
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
      // Existing account, correct password, just never confirmed - route to
      // the same OTP panel signup uses instead of a dead-end inline message,
      // per spec section 7. error.email is only ever set on this exact error
      // (see authService.login/postJson above) and is safe to use here: the
      // password already checked out, so this isn't an enumeration leak.
      if (error.code === 'EMAIL_NOT_CONFIRMED' && error.email) {
        openModal('signup');
        showSignupPending(error.email, { source: 'login-unconfirmed' });
        return;
      }
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
    // The only type="submit" control lives in step 2 (Crear cuenta), but
    // guard anyway against any stray native submit reaching here while step 1
    // is still showing - account creation must never fire before the
    // password step's own validation has run.
    if (signupStep !== 2) return;

    const usernameInput = document.getElementById('signupUsername');
    const usernameStatusEl = document.getElementById('signupUsernameStatus');
    const rawUsername = usernameInput?.value || '';
    const email = document.getElementById('signupEmail')?.value.trim() || '';
    const password = document.getElementById('signupPassword')?.value || '';
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value || '';

    if (password !== confirmPassword) {
      setAuthMessage('Las contraseñas no coinciden.', true);
      return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      // Username availability was already confirmed with the server when
      // advancing from step 1 (see handleSignupContinue) - the partial
      // unique index on username_normalized is still the real, final
      // authority, so no need to re-check it a second time here before
      // attempting to create the account.
      const data = await postJson('/api/auth', {
        action: 'register',
        username: rawUsername.trim(),
        email,
        password
      });

      // Pending email confirmation is not a signed-in state: no session,
      // no dashboard/progress load. Only now - after Supabase has actually
      // created the account and sent the code - does the modal switch from
      // the registration fields to the OTP verification step.
      if (data.requiresEmailConfirmation) {
        showSignupPending(email);
        return;
      }

      saveSession(data.user, data.session);
      await afterAuthSuccess();
    } catch (error) {
      // Someone else claimed this exact username in the moment between our
      // last check and this submit (rare race) - surface it through the
      // same status element as every other username message, and send the
      // student back to step 1 so that element (and the input) are visible.
      if (error.code === 'USERNAME_NOT_AVAILABLE') {
        setUsernameStatus(
          'signupUsername',
          usernameStatusEl,
          'unavailable',
          window.AndergoUsernameRules?.normalizeUsername(rawUsername) || '',
          'Este nombre de usuario ya no está disponible. Elige otro.'
        );
        goToSignupStep(1);
        return;
      }
      setAuthMessage(error.message, true);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  document.getElementById('forgotPasswordForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('forgotEmail')?.value.trim() || '';
    const submitBtn = document.getElementById('forgotPasswordSubmit');
    const statusEl = document.getElementById('forgotPasswordStatus');
    // Guards double-submit both while the request is in flight and during
    // the post-send cooldown started by startForgotPasswordCooldown() below.
    if (submitBtn?.disabled) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';
    }
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.classList.remove('is-error');
      statusEl.setAttribute('role', 'status');
    }

    try {
      const data = await postJson('/api/auth/request-password-reset', { email });
      if (statusEl) {
        statusEl.classList.remove('is-error');
        statusEl.setAttribute('role', 'status');
        statusEl.textContent =
          data.message ||
          'Si existe una cuenta asociada a este correo, recibirás un enlace para restablecer tu contraseña. Revisa también Spam o Correo no deseado.';
      }
      // Modal stays open on purpose (see spec) - only the button becomes a
      // cooldown-gated "Reenviar enlace" instead of re-enabling immediately.
      startForgotPasswordCooldown(submitBtn);
    } catch (error) {
      // requestPasswordReset itself is designed to never throw a
      // distinguishing error - this only ever catches passwordResetLimiter's
      // own 429 (error.code === 'RATE_LIMITED', see lib/server.js) or a
      // genuine network failure reaching our own backend, so those two get
      // their own distinct message instead of collapsing into one.
      if (statusEl) {
        statusEl.classList.add('is-error');
        statusEl.setAttribute('role', 'alert');
        statusEl.textContent =
          error.code === 'RATE_LIMITED'
            ? 'Espera un momento antes de solicitar otro correo.'
            : 'No pudimos procesar el envío en este momento. Inténtalo nuevamente.';
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = LanguagePair.t('authSendLink', learningPathState.bridgeLanguage);
      }
    }
  });

  document.getElementById('usernameOnboardingForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.getElementById('onboardingUsername');
    const statusEl = document.getElementById('onboardingUsernameStatus');
    const rawUsername = input?.value || '';
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    try {
      const usernameOk = await ensureUsernameAvailableForSubmit(
        'onboardingUsername',
        'onboardingUsernameStatus'
      );
      if (!usernameOk) return;

      await postJson('/api/profile/username', { username: rawUsername.trim() }, { auth: true });
      closeUsernameOnboarding();
      showHomeToast('Nombre de usuario guardado.');
    } catch (error) {
      if (error.code === 'USERNAME_NOT_AVAILABLE') {
        setUsernameStatus(
          'onboardingUsername',
          statusEl,
          'unavailable',
          window.AndergoUsernameRules?.normalizeUsername(rawUsername) || '',
          'Este nombre de usuario ya no está disponible. Elige otro.'
        );
        input?.focus();
        return;
      }
      if (statusEl) {
        renderUsernameStatus(statusEl, 'error', error.message || 'No se pudo guardar el nombre de usuario.');
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

// Single source of truth for each username field's real-time state - keyed
// by inputId so the signup and onboarding fields (which share this same
// logic) don't interfere with each other. Every reader (the status <p>, the
// submit handler) reads from here instead of re-deriving anything from the
// DOM, so the UI can never show "available" and "not available" at once.
// Possible statuses: idle | checking | available | unavailable | invalid | error.
const usernameCheckState = new Map();

const USERNAME_STATUS_MESSAGES = {
  checking: 'Comprobando disponibilidad…',
  available: (username) => `"${username}" está disponible.`,
  unavailable: 'Este nombre de usuario no está disponible.',
  error: 'No se pudo comprobar la disponibilidad. Intenta de nuevo.'
};

// Exactly one message, exactly one color class - never both is-available
// and is-error, and never a leftover message from a previous state.
function renderUsernameStatus(statusEl, status, message) {
  if (!statusEl) return;
  statusEl.classList.remove('is-available', 'is-error');
  statusEl.textContent = message || '';
  if (status === 'available') {
    statusEl.classList.add('is-available');
  } else if (status === 'unavailable' || status === 'invalid' || status === 'error') {
    statusEl.classList.add('is-error');
  }
}

function setUsernameStatus(inputId, statusEl, status, normalizedUsername, message) {
  const entry = usernameCheckState.get(inputId) || {};
  entry.status = status;
  entry.normalizedUsername = normalizedUsername;
  usernameCheckState.set(inputId, entry);
  renderUsernameStatus(statusEl, status, message);
}

// The actual GET /api/auth/username-available call, factored out of the
// debounced input handler so submit-time re-validation (see
// ensureUsernameAvailableForSubmit) can trigger the exact same check
// on demand instead of trusting a possibly-stale visual state.
async function queryUsernameAvailability(inputId, statusEl, rawValue) {
  const entry = usernameCheckState.get(inputId) || {};
  if (entry.abortController) entry.abortController.abort();

  const abortController = new AbortController();
  const thisToken = (entry.requestToken || 0) + 1;
  entry.abortController = abortController;
  entry.requestToken = thisToken;
  usernameCheckState.set(inputId, entry);

  try {
    const response = await fetch(
      `${backendBaseUrl}/api/auth/username-available?u=${encodeURIComponent(rawValue)}`,
      { signal: abortController.signal }
    );
    const data = await response.json().catch(() => ({}));

    // A newer keystroke (or a submit-time re-check) already superseded this
    // one - ignore it even if it happens to resolve after the newer one did.
    const current = usernameCheckState.get(inputId);
    if (!current || current.requestToken !== thisToken) return;

    if (!response.ok || !data.ok) {
      setUsernameStatus(inputId, statusEl, 'invalid', '', data.message || 'Nombre de usuario no válido.');
      return;
    }
    const status = data.available ? 'available' : 'unavailable';
    setUsernameStatus(
      inputId,
      statusEl,
      status,
      data.normalizedUsername,
      status === 'available'
        ? USERNAME_STATUS_MESSAGES.available(data.normalizedUsername)
        : USERNAME_STATUS_MESSAGES.unavailable
    );
  } catch (error) {
    if (error?.name === 'AbortError') return;
    const current = usernameCheckState.get(inputId);
    if (!current || current.requestToken !== thisToken) return;
    setUsernameStatus(inputId, statusEl, 'error', '', USERNAME_STATUS_MESSAGES.error);
  }
}

// Debounced (450ms) availability check - purely advisory (the note under
// the field already says so): the partial unique index on
// username_normalized is the real, final authority, this only avoids
// making the student wait until they submit the whole form to find out
// their pick is invalid or already taken. Format is checked locally first
// (via the rules shared with the server) so an obviously-malformed value
// never even reaches the network.
function setupUsernameAvailabilityCheck(inputId, statusId) {
  const input = document.getElementById(inputId);
  const statusEl = document.getElementById(statusId);
  const rules = window.AndergoUsernameRules;
  if (!input || !statusEl || !rules) return;

  usernameCheckState.set(inputId, { status: 'idle', normalizedUsername: '' });
  let debounceId = null;

  input.addEventListener('input', () => {
    if (debounceId) window.clearTimeout(debounceId);
    const rawValue = input.value;

    if (!rawValue.trim()) {
      setUsernameStatus(inputId, statusEl, 'idle', '', '');
      return;
    }

    const formatCheck = rules.validateUsernameFormat(rawValue);
    if (!formatCheck.valid) {
      setUsernameStatus(inputId, statusEl, 'invalid', '', formatCheck.message);
      return;
    }

    setUsernameStatus(
      inputId,
      statusEl,
      'checking',
      rules.normalizeUsername(rawValue),
      USERNAME_STATUS_MESSAGES.checking
    );
    debounceId = window.setTimeout(() => {
      queryUsernameAvailability(inputId, statusEl, rawValue);
    }, 450);
  });
}

// Re-validates format, then confirms with the server one last time before
// letting the form submit - never trusts the visual "available" state alone
// (it could be stale if the student clicked submit mid-debounce, or never
// triggered an input event at all, e.g. browser autofill).
async function ensureUsernameAvailableForSubmit(inputId, statusId) {
  const input = document.getElementById(inputId);
  const statusEl = document.getElementById(statusId);
  const rules = window.AndergoUsernameRules;
  if (!input || !statusEl || !rules) return false;

  const rawValue = input.value;
  const formatCheck = rules.validateUsernameFormat(rawValue);
  if (!formatCheck.valid) {
    setUsernameStatus(inputId, statusEl, 'invalid', '', formatCheck.message);
    input.focus();
    return false;
  }

  const normalizedUsername = rules.normalizeUsername(rawValue);
  const state = usernameCheckState.get(inputId);
  if (state?.status !== 'available' || state.normalizedUsername !== normalizedUsername) {
    await queryUsernameAvailability(inputId, statusEl, rawValue);
  }

  const freshState = usernameCheckState.get(inputId);
  if (freshState?.status === 'available' && freshState.normalizedUsername === normalizedUsername) {
    return true;
  }
  input.focus();
  return false;
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

// source distinguishes the two ways this same panel gets shown:
//  - 'register' (default): right after signUp(), account has no password to
//    lose track of, heading reassures "Verifica tu cuenta".
//  - 'login-unconfirmed': an *existing* account with a correct password hit
//    EMAIL_NOT_CONFIRMED at login (see the loginForm handler below) - the
//    heading instead reads "Tu cuenta está pendiente de verificación." per
//    spec, since this isn't a brand-new signup.
let signupPendingSource = 'register';

function showSignupPending(email, { source = 'register' } = {}) {
  lastSignupEmail = email;
  signupPendingSource = source;
  const fields = document.querySelector('#signupForm .signup-fields');
  const pending = document.getElementById('signupPending');
  const verifyStep = document.getElementById('verifyAccountStep');
  const verifySuccess = document.getElementById('verifyAccountSuccess');
  const statusEl = document.getElementById('otpStatus');
  const headingEl = document.getElementById('verifyAccountHeading');
  if (fields) fields.hidden = true;
  if (headingEl) {
    headingEl.textContent =
      source === 'login-unconfirmed'
        ? 'Tu cuenta está pendiente de verificación.'
        : 'Verifica tu cuenta';
  }
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
  setResendOtpCooldown(60);
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
  // Whenever the editable fields come back into view (fresh modal open,
  // "Volver al inicio", or "Cambiar correo"), always start from step 1 -
  // never leave the student stranded on the password step with no visible
  // way back to it.
  goToSignupStep(1, { focus: false });
}

// Which half of #signupForm is currently visible - the account-info fields
// (step 1) or the password fields (step 2). Reset to 1 by resetSignupPending
// above, advanced/rewound only via goToSignupStep below.
let signupStep = 1;

function goToSignupStep(step, { focus = true } = {}) {
  signupStep = step;
  const step1El = document.getElementById('signupStep1');
  const step2El = document.getElementById('signupStep2');
  if (step1El) step1El.hidden = step !== 1;
  if (step2El) step2El.hidden = step !== 2;
  document.querySelectorAll('#signupStepIndicator .step-dot').forEach((dot) => {
    dot.classList.toggle('active', Number(dot.dataset.stepDot) === step);
  });
  const labelEl = document.getElementById('signupStepLabel');
  if (labelEl) labelEl.textContent = `Paso ${step} de 2`;
  if (!focus) return;
  if (step === 1) {
    document.getElementById('signupUsername')?.focus();
  } else {
    document.getElementById('signupPassword')?.focus();
  }
}

// Step 1 -> step 2: confirms the account-info fields are valid (and the
// username still available) but never calls Supabase here - account
// creation only ever happens from the step-2 submit handler below.
async function handleSignupContinue() {
  if (signupStep !== 1) return;
  const usernameInput = document.getElementById('signupUsername');
  const emailInput = document.getElementById('signupEmail');
  const continueBtn = document.getElementById('signupContinueBtn');
  if (!usernameInput || !emailInput || continueBtn?.disabled) return;

  if (!emailInput.checkValidity()) {
    emailInput.reportValidity();
    emailInput.focus();
    return;
  }
  if (!usernameInput.checkValidity()) {
    usernameInput.reportValidity();
    usernameInput.focus();
    return;
  }

  if (continueBtn) continueBtn.disabled = true;
  try {
    const usernameOk = await ensureUsernameAvailableForSubmit(
      'signupUsername',
      'signupUsernameStatus'
    );
    if (!usernameOk) return;
    goToSignupStep(2);
  } finally {
    if (continueBtn) continueBtn.disabled = false;
  }
}

document.getElementById('signupContinueBtn')?.addEventListener('click', handleSignupContinue);

document.getElementById('signupBackBtn')?.addEventListener('click', () => {
  goToSignupStep(1);
});

// Enter should always drive whichever step is currently visible instead of
// the browser's own implicit-submission pick (unreliable once one step's
// button is hidden) - scoped to .signup-fields so it never fires for Enter
// inside the separate OTP-verification step further down this same form.
document.querySelector('#signupForm .signup-fields')?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || event.target.tagName === 'BUTTON') return;
  event.preventDefault();
  if (signupStep === 1) {
    handleSignupContinue();
  } else {
    document.getElementById('signupForm')?.requestSubmit();
  }
});

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
  if (!input) return;

  if (event.key === 'Enter') {
    event.preventDefault();
    document
      .querySelector('#verifyAccountStep [data-action="confirm-otp"]')
      ?.click();
    return;
  }

  if (event.key !== 'Backspace' || input.value) return;
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

  if (button.dataset.action === 'change-email') {
    if (signupPendingSource === 'login-unconfirmed') {
      // This account already exists - "changing" the email here means going
      // back to the login form to try a different identifier, not editing a
      // signup form that was never filled in for this flow.
      resetSignupPending();
      openModal('login');
      const loginIdentifierInput = document.getElementById('loginIdentifier');
      loginIdentifierInput?.focus();
      loginIdentifierInput?.select();
    } else {
      // Fresh signup: keep the username/password already typed, just let
      // them correct the email address before re-submitting.
      resetSignupPending();
      const emailInput = document.getElementById('signupEmail');
      emailInput?.focus();
      emailInput?.select();
    }
    return;
  }

  if (button.dataset.action === 'confirm-otp') {
    const statusEl = document.getElementById('otpStatus');
    const code = getOtpCode();
    if (!/^\d{6}$/.test(code)) {
      if (statusEl) {
        statusEl.textContent = LanguagePair.t('authEnterCode', learningPathState.bridgeLanguage);
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
        throw new Error(data.message || 'El código no es válido.');
      }

      const verifyStep = document.getElementById('verifyAccountStep');
      const verifySuccess = document.getElementById('verifyAccountSuccess');
      if (verifyStep) verifyStep.hidden = true;
      if (verifySuccess) verifySuccess.hidden = false;
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = error.message || 'El código no es válido.';
        statusEl.classList.add('is-error');
      }
      clearOtpDigits();
    } finally {
      button.disabled = false;
    }
    return;
  }

  if (button.dataset.action === 'resend-otp') {
    // idle -> sending -> sent | rate-limited | error (spec §4) - button text
    // itself carries the "sending" state; the other three only ever differ
    // in otpStatus's text, never a second indicator.
    button.disabled = true;
    const originalLabel = button.textContent;
    button.textContent = 'Enviando…';
    const statusEl = document.getElementById('otpStatus');
    if (statusEl) statusEl.classList.remove('is-error');
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
        if (statusEl) statusEl.textContent = 'Espera un momento antes de solicitar otro correo.';
      } else {
        if (statusEl)
          statusEl.textContent = LanguagePair.t('authCodeResent', learningPathState.bridgeLanguage);
      }
    } catch (error) {
      console.warn('Could not resend OTP', error);
      if (statusEl) {
        statusEl.textContent = 'No pudimos procesar el envío en este momento. Inténtalo nuevamente.';
        statusEl.classList.add('is-error');
      }
    } finally {
      button.textContent = originalLabel;
      clearOtpDigits();
      setResendOtpCooldown(60);
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
      status.innerHTML = `<p class="skill-graph-empty">${escapeHtml(LanguagePair.t('securityLoadFailed', learningPathState.bridgeLanguage))}</p>`;
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
      enrollStatus.textContent = LanguagePair.t('authEnterCode', learningPathState.bridgeLanguage);
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
  // id of the unit currently selected in the unit accordion / skill library
  // (english-a1-unit-02, etc.) - null for languages/levels without units
  // (see hasUnits()). This is the single source of truth for "which unit is
  // open"; selectUnit() below is the only place that should write it.
  unitId: null,
  language: 'english',
  // The learner's bridge/interface language (see the comment near
  // LanguagePair above) - was a separate learningPathState.bridgeLanguage global,
  // folded in here so bridge/target/level all live on one object.
  bridgeLanguage: 'spanish',
  level: 'A1',
  // 'bilingual' | 'direct' (spec §3) - derived from bridgeLanguage/language,
  // never written to directly. See syncLearningMode(), called after every
  // assignment to either field. Initialized consistently with the two
  // defaults above (spanish !== english -> bilingual).
  learningMode: 'bilingual',
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

// Single place that writes activeSlug - keeps it in sync with unitId so a
// lesson picked from anywhere (unit accordion, skill library) always moves
// learningPathState.unitId to that lesson's unit too. Before this, only
// activeSlug was tracked; nothing recorded which unit was selected, so
// selecting a unit with no lesson click left every unit-scoped fallback
// (getActiveLearningLesson, getNextRecommendedLesson, the accordion's
// open/closed state) still resolving against whatever unit came first.
function setActiveLesson(slug) {
  learningPathState.activeSlug = slug || '';
  if (slug) {
    const lesson = learningPathState.lessons.find((item) => item.slug === slug);
    if (lesson?.unitId) learningPathState.unitId = lesson.unitId;
  }
}

// Wired to unit accordion header clicks. See the comment on
// renderLessonWorkspace/renderUnitOverviewCard for why switching units
// clears activeSlug (rather than auto-picking a lesson) instead of leaving
// the content panel pointed at the previous unit's lesson.
function selectUnit(unitId, options = {}) {
  if (!unitId) return;
  const changingUnit = unitId !== learningPathState.unitId;
  learningPathState.unitId = unitId;
  // Switching units lands on that unit's overview panel (see
  // renderUnitOverviewCard) rather than auto-opening one of its lessons -
  // the previously active lesson (if any) belonged to the old unit, so it
  // can't stay open here. Picking a specific activity to practice is a
  // separate, deliberate action (clicking it directly, or the overview's
  // own "Comenzar/Continuar/Repasar unidad" button).
  if (changingUnit) {
    learningPathState.activeSlug = '';
  }
  if (options.render !== false) renderLearningPath();
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

// es-419 (Latin American Spanish) rather than es-ES, matching this app's
// actual Spanish content/audience. pt-BR isn't a selectable target
// language yet, but is mapped defensively so a future one doesn't default
// to the wrong voice. Must match lib/server.js's SUPPORTED_SPEECH_LOCALES.
const LANGUAGE_LOCALES = {
  english: 'en-US',
  french: 'fr-FR',
  spanish: 'es-419',
  italian: 'it-IT',
  german: 'de-DE',
  portuguese: 'pt-BR'
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

// English A1 speaks slightly slower (0.86x) and French A1 slightly slower
// still (0.82x) per spec; every other language/level defaults to normal
// rate unless a card sets its own pronunciationRate.
function getDefaultPronunciationRate(language = learningPathState.language, level = learningPathState.level) {
  if (language === 'english' && level === 'A1') return 0.86;
  if (language === 'french' && level === 'A1') return 0.82;
  return 1;
}

// ---------------------------------------------------------------------
// Reading Text-to-Speech player - reads a whole reading (title + every
// paragraph, concatenated) aloud continuously, independent of speakText()
// above (which flashcards/AI Tutor keep using unchanged, fire-and-forget,
// one utterance at a time). This section owns its own
// SpeechSynthesisUtterance lifecycle because it needs pause/resume,
// segment-level rewind, and a persistent playing/paused state that
// speakText() was never designed for.
//
// Text is split into short sentence-ish "segments" (see
// splitReadingSentences()) rather than spoken as one giant utterance,
// because the Web Speech API has no seek: "rewind 5 seconds" is
// approximated by cancelling the current utterance and restarting
// playback from whichever earlier segment's estimated start time is
// closest to (elapsed - 5s). Durations are estimated from word count at
// the current rate, not measured - there is no reliable cross-browser
// timing signal from speechSynthesis itself.
// ---------------------------------------------------------------------

const READING_RATE_PRESETS = { slow: 0.75, normal: 0.95 };

// Best-effort classification of common OS/browser TTS voices as
// masculine/feminine, curated by us - never inferred automatically from
// a voice's name (a name alone isn't a reliable gender signal). Any
// voice not in this list falls back to a neutral "Voz 1"/"Voz 2" label.
const KNOWN_VOICE_GENDERS = {
  Samantha: 'female',
  Victoria: 'female',
  Karen: 'female',
  Moira: 'female',
  Tessa: 'female',
  Alex: 'male',
  Daniel: 'male',
  Fred: 'male',
  'Google US English': 'female',
  'Google UK English Female': 'female',
  'Google UK English Male': 'male',
  'Google français': 'female',
  'Google español': 'female',
  'Microsoft David - English (United States)': 'male',
  'Microsoft Zira - English (United States)': 'female',
  'Microsoft Mark - English (United States)': 'male',
  'Microsoft Hortense - French (France)': 'female',
  'Microsoft Paul - French (France)': 'male',
  'Microsoft Helena - Spanish (Spain)': 'female',
  'Microsoft Pablo - Spanish (Spain)': 'male',
  Amelie: 'female',
  Thomas: 'male',
  Monica: 'female',
  Jorge: 'male',
  Paulina: 'female',
  Juan: 'male'
};

function getStoredReadingVoiceName(language) {
  try {
    return localStorage.getItem(`andergo_voice_${language}`) || '';
  } catch {
    return '';
  }
}

function setStoredReadingVoiceName(language, name) {
  try {
    localStorage.setItem(`andergo_voice_${language}`, name || '');
  } catch {
    /* private-mode/unavailable localStorage - voice choice just won't persist */
  }
}

function getStoredReadingRate(language) {
  try {
    const raw = localStorage.getItem(`andergo_rate_${language}`);
    return raw === 'slow' || raw === 'normal' ? raw : null;
  } catch {
    return null;
  }
}

function setStoredReadingRate(language, rateKey) {
  try {
    localStorage.setItem(`andergo_rate_${language}`, rateKey);
  } catch {
    /* ignore */
  }
}

// Whether the Tutor's spoken replies should start playing as soon as they're
// ready, with no extra click - defaults to on (missing key = never set, or
// private-mode/localStorage unavailable) since that's the natural fit for a
// voice conversation (see requestTutorSpeech's { auto } path and
// sendTutorMessage's post-stream trigger).
function getTutorAutoplayPref() {
  try {
    const raw = localStorage.getItem('andergo_tutor_autoplay');
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

function setTutorAutoplayPref(enabled) {
  try {
    localStorage.setItem('andergo_tutor_autoplay', enabled ? 'true' : 'false');
  } catch {
    /* private-mode/unavailable localStorage - preference just won't persist */
  }
}

// Exact-locale match first (e.g. es-ES), falling back to any voice that
// shares the bare language prefix (e.g. any "es-*") - mirrors
// getPronunciationLocale()'s per-language defaults above.
function getReadingVoicesForLocale(locale) {
  if (!supportsSpeech()) return [];
  const all = window.speechSynthesis.getVoices() || [];
  const prefix = (locale || '').split('-')[0];
  const exact = all.filter((voice) => voice.lang === locale);
  const pool = exact.length ? exact : all.filter((voice) => voice.lang?.startsWith(prefix));
  const seen = new Set();
  return pool.filter((voice) => {
    if (seen.has(voice.name)) return false;
    seen.add(voice.name);
    return true;
  });
}

function splitReadingSentences(text) {
  if (!text) return [];
  const matches = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  return (matches || [text]).map((sentence) => sentence.trim()).filter(Boolean);
}

function estimateReadingSegmentSeconds(text, rate) {
  const words = text.trim().split(/\s+/).filter(Boolean).length || 1;
  const wordsPerSecond = 2.6 * (rate || 1);
  return Math.max(0.6, words / wordsPerSecond);
}

// Single source of truth for "what paragraphs does this reading show" -
// used both to render the full text on screen (renderReadingView) and to
// build the spoken script below (buildReadingSegments), so the sentence
// spans a student sees and the segments the TTS player walks through are
// always in exact lockstep (same source, same split logic). Readings that
// already carry lesson.reading.parts (an array of paragraph-length
// strings) use those directly; everything else falls back to splitting
// the single-block lesson.reading.text/lesson.description on blank lines.
function getReadingParagraphs(lesson) {
  const parts = lesson.reading?.parts;
  if (Array.isArray(parts) && parts.length) return parts;
  return (lesson.reading?.text || lesson.description || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// Builds the full spoken script for a reading: title, then every
// paragraph's sentences in order (never comprehension questions, ordering
// events, vocabulary, or Spanish translations - those aren't part of
// lesson.reading.parts/text). The reading is always spoken and shown as one
// continuous text - there is no paginated "part" concept anymore, so a
// segment's only positional info is its own index within the flat list.
function buildReadingSegments(lesson, rate) {
  const paragraphs = getReadingParagraphs(lesson);
  const segments = [];
  let cursor = 0;
  const addSegment = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const duration = estimateReadingSegmentSeconds(trimmed, rate);
    segments.push({
      text: trimmed,
      segmentIndex: segments.length,
      estimatedStartSeconds: cursor,
      estimatedDurationSeconds: duration
    });
    cursor += duration;
  };
  if (lesson.title) addSegment(lesson.title);
  paragraphs.forEach((paragraph) => {
    splitReadingSentences(paragraph).forEach((sentence) => addSegment(sentence));
  });
  return { segments, totalDurationSeconds: cursor };
}

function findReadingSegmentIndexAtTime(segments, timeSeconds) {
  for (let i = segments.length - 1; i >= 0; i--) {
    if (segments[i].estimatedStartSeconds <= timeSeconds) return i;
  }
  return 0;
}

function formatReadingTime(totalSeconds) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = Math.floor(safe % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------
// Engine abstraction (kept deliberately thin) so the player above never
// has to change shape when a Premium neural engine is wired in later -
// only this factory's `engine: 'azure'` branch would gain a real
// implementation (an HTMLAudioElement over a server-generated clip from
// lib/ttsService.js, with real seek/duration). No Azure credentials are
// configured yet, so that branch intentionally falls back to `browser`
// rather than doing nothing.
// ---------------------------------------------------------------------
function createReadingAudioPlayer({ engine = 'browser', language, voice, rate } = {}) {
  const resolvedEngine = engine === 'azure' ? 'browser' : engine;
  return {
    engine: resolvedEngine,
    speakSegment(segment, { onStart, onEnd, onError } = {}) {
      if (!supportsSpeech() || !segment) {
        onEnd?.();
        return null;
      }
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.lang = getPronunciationLocale(language);
      utterance.rate = rate || 1;
      if (voice) utterance.voice = voice;
      utterance.onstart = () => onStart?.();
      utterance.onend = () => onEnd?.();
      utterance.onerror = () => onError?.();
      window.speechSynthesis.speak(utterance);
      return utterance;
    }
  };
}

// Singleton controller - only one reading can ever be "the" audio
// playing at a time (see attach()/teardown()). Exposes exactly the
// function names the product spec calls for: playReading, pauseReading,
// resumeReading, rewindReading(seconds), stopReading, changeReadingVoice,
// changeReadingRate - plus attach/teardown/setHandlers/getSnapshot for
// renderReadingView to wire itself up to.
const readingSpeechPlayer = (() => {
  const PAUSE_WATCHDOG_MS = 350;

  let state = 'idle'; // idle | playing | paused | stopped | completed | error
  let lesson = null;
  let language = null;
  let segments = [];
  let totalDurationSeconds = 0;
  let currentSegmentIndex = 0;
  let elapsedBeforeCurrentSegment = 0;
  let segmentStartedAt = 0;
  let rateKey = 'normal';
  let voices = [];
  let voiceIndex = 0;
  let progressTimer = null;
  let playbackToken = 0; // bumped on every intentional interrupt, so stale utterance callbacks (cancel(), then a new one starts) never act twice
  let onUpdate = null;

  function currentVoice() {
    return voices[voiceIndex] || null;
  }

  function rateValue() {
    return READING_RATE_PRESETS[rateKey] || READING_RATE_PRESETS.normal;
  }

  function voiceDisplayLabel() {
    const voice = currentVoice();
    if (!voice) return '';
    const gender = KNOWN_VOICE_GENDERS[voice.name];
    if (gender === 'female') return 'Voz femenina';
    if (gender === 'male') return 'Voz masculina';
    return `Voz ${voiceIndex + 1}`;
  }

  function loadVoices() {
    const locale = getPronunciationLocale(language);
    voices = getReadingVoicesForLocale(locale);
    const storedName = getStoredReadingVoiceName(language);
    const storedIndex = storedName ? voices.findIndex((voice) => voice.name === storedName) : -1;
    voiceIndex = storedIndex >= 0 ? storedIndex : 0;
  }

  function clearTimer() {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
  }

  function startTimer() {
    clearTimer();
    progressTimer = setInterval(emitUpdate, 250);
  }

  function snapshot() {
    const seg = segments[currentSegmentIndex];
    const withinSegment =
      state === 'playing' && seg
        ? Math.min((performance.now() - segmentStartedAt) / 1000, seg.estimatedDurationSeconds)
        : 0;
    const elapsedSeconds = Math.min(totalDurationSeconds, elapsedBeforeCurrentSegment + withinSegment);
    const progressPct =
      totalDurationSeconds > 0 ? Math.min(100, Math.round((elapsedSeconds / totalDurationSeconds) * 100)) : 0;
    return {
      state,
      currentSegmentIndex,
      elapsedSeconds,
      totalDurationSeconds,
      progressPct,
      rateKey,
      voiceLabel: voiceDisplayLabel(),
      voiceName: currentVoice()?.name || '',
      canChangeVoice: voices.length > 1
    };
  }

  function emitUpdate() {
    onUpdate?.(snapshot());
  }

  function finish() {
    state = 'completed';
    clearTimer();
    currentSegmentIndex = segments.length;
    elapsedBeforeCurrentSegment = totalDurationSeconds;
    emitUpdate();
  }

  function speakCurrentSegment() {
    const seg = segments[currentSegmentIndex];
    if (!seg) {
      finish();
      return;
    }
    if (!supportsSpeech()) {
      state = 'error';
      clearTimer();
      emitUpdate();
      return;
    }
    window.speechSynthesis.cancel();
    playbackToken += 1;
    const myToken = playbackToken;
    const player = createReadingAudioPlayer({
      engine: 'browser',
      language,
      voice: currentVoice(),
      rate: rateValue()
    });
    segmentStartedAt = performance.now();
    player.speakSegment(seg, {
      onEnd: () => {
        if (myToken !== playbackToken || state !== 'playing') return;
        elapsedBeforeCurrentSegment += seg.estimatedDurationSeconds;
        currentSegmentIndex += 1;
        speakCurrentSegment();
      },
      onError: () => {
        if (myToken !== playbackToken || state !== 'playing') return;
        state = 'error';
        clearTimer();
        emitUpdate();
      }
    });
    startTimer();
    emitUpdate();
  }

  function attach(lessonToAttach, languageKey) {
    const isSameLesson = lesson && lesson.slug === lessonToAttach.slug && language === languageKey;
    if (isSameLesson) return;
    teardown();
    lesson = lessonToAttach;
    language = languageKey;
    rateKey = getStoredReadingRate(language) || 'normal';
    loadVoices();
    const built = buildReadingSegments(lesson, rateValue());
    segments = built.segments;
    totalDurationSeconds = built.totalDurationSeconds;
    currentSegmentIndex = 0;
    elapsedBeforeCurrentSegment = 0;
    state = segments.length ? 'idle' : 'error';
  }

  function setHandlers(handlers) {
    onUpdate = handlers?.onUpdate || null;
  }

  function playReading() {
    if (!supportsSpeech() || !segments.length) return;
    if (state === 'paused') {
      resumeReading();
      return;
    }
    if (state === 'completed' || state === 'stopped' || state === 'error') {
      currentSegmentIndex = 0;
      elapsedBeforeCurrentSegment = 0;
    }
    window.speechSynthesis.cancel(); // only one reading (or flashcard/tutor) utterance is ever active at a time
    state = 'playing';
    speakCurrentSegment();
  }

  function pauseReading() {
    if (state !== 'playing' || !supportsSpeech()) return;
    const seg = segments[currentSegmentIndex];
    elapsedBeforeCurrentSegment += Math.min(
      (performance.now() - segmentStartedAt) / 1000,
      seg?.estimatedDurationSeconds || 0
    );
    state = 'paused';
    clearTimer();
    window.speechSynthesis.pause();
    emitUpdate();
    setTimeout(() => {
      // Some mobile browsers silently ignore pause() and keep talking -
      // if so, force a hard stop; resumeReading() re-speaks the frozen
      // segment from its start either way, so nothing is lost.
      if (state === 'paused' && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        playbackToken += 1;
        window.speechSynthesis.cancel();
      }
    }, PAUSE_WATCHDOG_MS);
  }

  function resumeReading() {
    if (state !== 'paused' || !supportsSpeech()) return;
    if (window.speechSynthesis.paused) {
      state = 'playing';
      segmentStartedAt = performance.now();
      window.speechSynthesis.resume();
      startTimer();
      emitUpdate();
      setTimeout(() => {
        // resume() sometimes silently no-ops (notably iOS Safari) - detect
        // that and fall back to re-speaking the current segment.
        if (state === 'playing' && !window.speechSynthesis.speaking) {
          speakCurrentSegment();
        }
      }, PAUSE_WATCHDOG_MS);
    } else {
      // pause() never actually took effect earlier (the watchdog above
      // already cancelled it) - nothing to resume, so re-speak the
      // current segment from its start.
      state = 'playing';
      speakCurrentSegment();
    }
  }

  function stopReading() {
    playbackToken += 1;
    state = 'stopped';
    clearTimer();
    if (supportsSpeech()) window.speechSynthesis.cancel();
    currentSegmentIndex = 0;
    elapsedBeforeCurrentSegment = 0;
    emitUpdate();
  }

  // Rewinding is approximated by jumping to whichever earlier segment's
  // estimated start time is closest to (elapsed - seconds) - the Web
  // Speech API has no real seek, so this can land a sentence or two off
  // from an exact 5s offset, especially right after a rate change (see
  // rebuildDurationsFromCurrentSegment). This only ever moves the audio
  // cursor; it never touches which text is visible on screen.
  function rewindReading(seconds = 5) {
    if (!segments.length) return;
    const wasPlaying = state === 'playing';
    const seg = segments[currentSegmentIndex];
    const currentElapsed =
      elapsedBeforeCurrentSegment +
      (wasPlaying ? Math.min((performance.now() - segmentStartedAt) / 1000, seg?.estimatedDurationSeconds || 0) : 0);
    const targetTime = Math.max(0, currentElapsed - seconds);
    const targetIndex = findReadingSegmentIndexAtTime(segments, targetTime);
    playbackToken += 1;
    if (supportsSpeech()) window.speechSynthesis.cancel();
    currentSegmentIndex = targetIndex;
    elapsedBeforeCurrentSegment = segments[targetIndex].estimatedStartSeconds;
    if (wasPlaying) {
      state = 'playing';
      speakCurrentSegment();
    } else {
      clearTimer();
      emitUpdate();
    }
  }

  function changeReadingVoice() {
    if (voices.length < 2) return;
    voiceIndex = (voiceIndex + 1) % voices.length;
    setStoredReadingVoiceName(language, currentVoice()?.name || '');
    if (state === 'playing') {
      playbackToken += 1;
      if (supportsSpeech()) window.speechSynthesis.cancel();
      speakCurrentSegment();
    } else {
      emitUpdate();
    }
  }

  function rebuildDurationsFromCurrentSegment() {
    let cursor = elapsedBeforeCurrentSegment;
    for (let i = currentSegmentIndex; i < segments.length; i++) {
      segments[i].estimatedStartSeconds = cursor;
      segments[i].estimatedDurationSeconds = estimateReadingSegmentSeconds(segments[i].text, rateValue());
      cursor += segments[i].estimatedDurationSeconds;
    }
    totalDurationSeconds = cursor;
  }

  function changeReadingRate(nextRateKey) {
    if (!READING_RATE_PRESETS[nextRateKey] || nextRateKey === rateKey) return;
    rateKey = nextRateKey;
    setStoredReadingRate(language, rateKey);
    rebuildDurationsFromCurrentSegment();
    if (state === 'playing') {
      playbackToken += 1;
      if (supportsSpeech()) window.speechSynthesis.cancel();
      speakCurrentSegment();
    } else {
      emitUpdate();
    }
  }

  function teardown() {
    playbackToken += 1;
    clearTimer();
    if (supportsSpeech()) window.speechSynthesis.cancel();
    state = 'idle';
    lesson = null;
    language = null;
    segments = [];
    totalDurationSeconds = 0;
    currentSegmentIndex = 0;
    elapsedBeforeCurrentSegment = 0;
    voices = [];
    voiceIndex = 0;
    onUpdate = null;
  }

  if (supportsSpeech()) {
    // Chrome (desktop especially) returns an empty voice list until this
    // fires once, asynchronously, after page load.
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      if (lesson) {
        loadVoices();
        emitUpdate();
      }
    });
  }

  return {
    isSupported: supportsSpeech,
    attach,
    teardown,
    setHandlers,
    getSnapshot: snapshot,
    playReading,
    pauseReading,
    resumeReading,
    rewindReading,
    stopReading,
    changeReadingVoice,
    changeReadingRate
  };
})();

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// ---------------------------------------------------------------------
// Tutor reply Markdown cleanup - aiTutorService.js's TUTOR_INSTRUCTIONS ask
// the model not to use Markdown, but never trust that: both functions below
// always escape HTML first and only ever re-introduce <strong>/<ul>/<ol>/
// <li>/<br> themselves - never raw innerHTML from an un-escaped source, and
// never any attribute a reply could hide a script or handler in.
// ---------------------------------------------------------------------
const TUTOR_BULLET_LINE = /^[-*]\s+(.*)$/;
const TUTOR_NUMBERED_LINE = /^\d+[.)]\s+(.*)$/;
const TUTOR_HEADING_LINE = /^#{1,6}\s+(.*)$/;

// **bold** becomes <strong> on already-escaped text; any leftover single/
// double asterisk (unterminated bold, or plain emphasis) is dropped rather
// than turned into <em> - the spec's ask is "no visible asterisks", not
// "support italics". Safe on a partial/still-streaming line: an
// unterminated `**` just has no closing match yet, so it stays plain text
// (then gets stripped) until the closing `**` arrives.
function formatTutorInlineHtml(escapedLine) {
  return escapedLine.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*/g, '');
}

function matchTutorListLine(trimmedLine) {
  const bulletMatch = trimmedLine.match(TUTOR_BULLET_LINE);
  if (bulletMatch) return { type: 'ul', content: bulletMatch[1] };
  const numberedMatch = trimmedLine.match(TUTOR_NUMBERED_LINE);
  if (numberedMatch) return { type: 'ol', content: numberedMatch[1] };
  return null;
}

// Renders a raw Tutor reply into safe HTML for the response card: escapes
// HTML, then converts **bold**, "- "/"* " bullet lists and "1. " numbered
// lists into real <strong>/<ul>/<ol>/<li>, strips leading #/##/... heading
// markers (kept as a plain line - the spec asks for no long headings, not a
// differently-styled one), and preserves blank-line paragraph breaks as
// <br>. Used for both the live-streaming message body and the final text.
function renderTutorMarkdownHtml(rawText) {
  const lines = String(rawText || '').split('\n');
  const htmlParts = [];
  let listBuffer = [];
  let listType = null;

  const flushList = () => {
    if (!listBuffer.length) return;
    htmlParts.push(`<${listType}>${listBuffer.join('')}</${listType}>`);
    listBuffer = [];
    listType = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    const listLine = matchTutorListLine(trimmed);
    if (listLine) {
      if (listType && listType !== listLine.type) flushList();
      listType = listLine.type;
      listBuffer.push(`<li>${formatTutorInlineHtml(escapeHtml(listLine.content))}</li>`);
      return;
    }

    flushList();
    const headingMatch = trimmed.match(TUTOR_HEADING_LINE);
    const content = headingMatch ? headingMatch[1] : trimmed;
    htmlParts.push(formatTutorInlineHtml(escapeHtml(content)));
  });
  flushList();

  return htmlParts.join('<br>');
}

// Plain-text counterpart of renderTutorMarkdownHtml(), for the text actually
// sent to TTS (messageEl.dataset.ttsText / /api/speech/synthesize) -
// speechSynthesis must never read "asterisk asterisk Pattern asterisk
// asterisk" aloud. Strips the same markers but returns readable text, not
// HTML - list bullets/numbers are dropped (nothing reads "dash" aloud
// either) and lines are joined with a space, relying on each line's own
// sentence punctuation for natural pauses.
function cleanTutorTextForSpeech(rawText) {
  return String(rawText || '')
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      const listLine = matchTutorListLine(trimmed);
      const headingMatch = trimmed.match(TUTOR_HEADING_LINE);
      const content = listLine?.content ?? headingMatch?.[1] ?? trimmed;
      return content.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*/g, '');
    })
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
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
  label.textContent = role === 'user' ? 'Tú' : '🤖 Tutor IA ANDERGO';

  const body = document.createElement('p');
  // Only real Tutor replies go through the Markdown cleanup - error strings
  // are our own plain text, never the model's, so they stay a simple escape.
  body.innerHTML =
    role === 'tutor' && !isError
      ? renderTutorMarkdownHtml(text)
      : escapeHtml(text).replace(/\n/g, '<br>');

  message.append(label, body);
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
  return message;
}

// Discreet inline status/paywall notice for the Tutor's monthly free-query
// cap (lib/usageLimitService.js, feature='tutor_query') - visually
// distinct from a normal tutor/user bubble (no "Tú"/"Tutor AI" label).
// `locked` reuses the same .premium-lock-box + .upgrade-btn pattern
// already used for locked lessons, so a full lockout looks consistent
// with the rest of the app's paywall UI instead of inventing a new one.
function appendTutorUsageNotice(container, message, { locked = false } = {}) {
  if (!container) return null;
  const notice = document.createElement('div');
  notice.className = `tutor-usage-notice${locked ? ' premium-lock-box' : ''}`;
  const text = document.createElement('p');
  text.textContent = message;
  notice.appendChild(text);
  if (locked) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'primary-btn upgrade-btn';
    btn.textContent = LanguagePair.t('premiumGetBtn', learningPathState.bridgeLanguage);
    notice.appendChild(btn);
  }
  container.appendChild(notice);
  container.scrollTop = container.scrollHeight;
  return notice;
}

// Updates an in-progress tutor message bubble's text (see appendTutorMessage's
// returned wrapper) as streamed chunks accumulate.
function updateTutorMessageBody(messageEl, container, text) {
  if (!messageEl) return;
  const body = messageEl.querySelector('p');
  if (body) body.innerHTML = renderTutorMarkdownHtml(text);
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

// One <audio> element reused for every neural tutor reply in the session,
// instead of a fresh `new Audio()` per message - avoids piling up media
// elements as the conversation grows and keeps the "only one thing plays at
// a time" rule (stopAllTutorAudio) working against a single, known element.
let sharedTutorAudioEl = null;
function getSharedTutorAudioElement() {
  if (!sharedTutorAudioEl) sharedTutorAudioEl = new Audio();
  return sharedTutorAudioEl;
}

// Browsers only allow <audio>.play() with sound once *some* play() call has
// happened synchronously inside a real user gesture on that element - once
// that's happened, later programmatic play() calls on the same element (e.g.
// requestTutorSpeech's auto-trigger, which runs well after the click, at the
// end of an async fetch chain) keep working for the rest of the session.
// Calling this at the very top of the Enviar click handler - before any
// `await` - is what makes the autoplay-after-reply flow actually audible
// instead of silently blocked; the attempt itself is wrapped so an empty/
// unsupported source here never surfaces as an error.
function primeTutorAudioForAutoplay() {
  const audio = getSharedTutorAudioElement();
  try {
    const playAttempt = audio.play();
    if (playAttempt?.catch) playAttempt.catch(() => {});
  } catch {
    /* ignore - this call only exists to register gesture-driven playback */
  }
  audio.pause();
}

function resetTutorVoiceButtons(messageEl) {
  const controls = messageEl?.querySelector('.tutor-voice-controls');
  if (!controls) return;
  const listenBtn = controls.querySelector('.tutor-voice-listen');
  const stopBtn = controls.querySelector('.tutor-voice-stop');
  const pauseBtn = controls.querySelector('.tutor-voice-pause');
  const rewindBtn = controls.querySelector('.tutor-voice-rewind');
  if (listenBtn) {
    listenBtn.disabled = false;
    if (listenBtn.dataset.played) listenBtn.textContent = '🔁 Repetir';
  }
  if (stopBtn) stopBtn.disabled = true;
  if (pauseBtn) {
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pausar';
  }
  // Rewind only ever makes sense for the neural <audio> path - speechSynthesis
  // has no seek API, so it stays hidden in browser-fallback mode (see
  // requestTutorSpeech, which sets messageEl.dataset.ttsMode on success).
  if (rewindBtn) {
    rewindBtn.disabled = true;
    rewindBtn.hidden = messageEl.dataset.ttsMode !== 'neural';
  }
}

// Pauses/resumes in place - never regenerates the audio (same clip/
// utterance, whether neural <audio> or the speechSynthesis fallback).
function toggleTutorVoicePause(messageEl) {
  if (!messageEl || currentTutorAudio.messageEl !== messageEl) return;
  const pauseBtn = messageEl.querySelector('.tutor-voice-pause');
  if (currentTutorAudio.element) {
    if (currentTutorAudio.element.paused) {
      currentTutorAudio.element.play();
      if (pauseBtn) pauseBtn.textContent = '⏸ Pausar';
    } else {
      currentTutorAudio.element.pause();
      if (pauseBtn) pauseBtn.textContent = '▶ Continuar';
    }
  } else if (supportsSpeech()) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      if (pauseBtn) pauseBtn.textContent = '⏸ Pausar';
    } else {
      window.speechSynthesis.pause();
      if (pauseBtn) pauseBtn.textContent = '▶ Continuar';
    }
  }
}

// Neural <audio> only - speechSynthesis has no seek API (button stays
// hidden in that mode, see requestTutorSpeech/resetTutorVoiceButtons).
function rewindTutorVoice(seconds) {
  if (!currentTutorAudio.element) return;
  currentTutorAudio.element.currentTime = Math.max(0, currentTutorAudio.element.currentTime - seconds);
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
    <button type="button" class="tutor-voice-btn tutor-voice-listen" aria-label="Reproducir respuesta del tutor">🔊 Escuchar</button>
    <button type="button" class="tutor-voice-btn tutor-voice-pause" disabled aria-label="Pausar reproducción">⏸ Pausar</button>
    <button type="button" class="tutor-voice-btn tutor-voice-rewind" disabled hidden aria-label="Retroceder 5 segundos">⏪ 5s</button>
    <button type="button" class="tutor-voice-btn tutor-voice-stop" disabled aria-label="Detener reproducción">⏹ Detener</button>
    <div class="tutor-voice-speed-group" role="group" aria-label="Velocidad de voz">
      <button type="button" class="tutor-voice-speed-btn is-active" data-speed="normal" aria-label="Velocidad normal" aria-pressed="true">▶ Normal</button>
      <button type="button" class="tutor-voice-speed-btn" data-speed="slow" aria-label="Velocidad lenta" aria-pressed="false">🐢 Lenta</button>
    </div>
    <span class="tutor-voice-limit-message" role="status" aria-live="polite" hidden></span>
  `;
  messageEl.appendChild(controls);
}

// Called from the Escuchar/Repetir click handler, and also automatically
// right after a tutor reply finishes streaming when the "reproducir
// automáticamente" preference is on, or when the Premium hands-free
// conversation mode is active (see sendTutorMessage and getTutorAutoplayPref).
// `auto: true` only changes how a blocked/failed playback is reported - it
// never skips the fetch or plays without going through the same synthesize
// call a manual click would. `onPlaybackEnd`, when given, always fires
// exactly once - on a normal end, a blocked/failed playback, or even a
// missing ttsText - so a caller chaining off it (resumeTutorConversationListening)
// never waits forever on a turn that never actually produced audio.
async function requestTutorSpeech(messageEl, { auto = false, onPlaybackEnd } = {}) {
  const controls = messageEl.querySelector('.tutor-voice-controls');
  const listenBtn = controls?.querySelector('.tutor-voice-listen');
  const stopBtn = controls?.querySelector('.tutor-voice-stop');
  const pauseBtn = controls?.querySelector('.tutor-voice-pause');
  const rewindBtn = controls?.querySelector('.tutor-voice-rewind');
  const limitMsg = controls?.querySelector('.tutor-voice-limit-message');
  const speed = controls?.querySelector('.tutor-voice-speed-btn.is-active')?.dataset.speed || 'normal';
  const text = messageEl.dataset.ttsText || '';
  const locale = messageEl.dataset.ttsLocale || getPronunciationLocale();
  if (!text) {
    if (auto) console.warn('[Tutor] auto-play skipped: no ttsText on message element yet.');
    onPlaybackEnd?.();
    return;
  }

  stopAllTutorAudio();
  if (listenBtn) listenBtn.disabled = true;
  if (limitMsg) limitMsg.hidden = true;

  const onEnd = () => {
    messageEl.classList.remove('is-playing');
    if (currentTutorAudio.messageEl === messageEl) currentTutorAudio = { element: null, messageEl: null };
    onPlaybackEnd?.();
    resetTutorVoiceButtons(messageEl);
  };

  // Only ever shown for the two cases the spec calls out explicitly: the
  // browser blocked autoplay, or synthesis/playback failed outright - never
  // the raw error/rejection, which could be a technical, untranslated string.
  const showDiscreetNotice = (message) => {
    onEnd();
    if (limitMsg) {
      limitMsg.textContent = message;
      limitMsg.hidden = false;
    }
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
        openPaywallModal({
          featureLabel: 'conversaciones de voz',
          used: data.used,
          limit: data.limit
        });
        onPlaybackEnd?.();
        return;
      }
      throw new Error('synthesize-failed');
    }

    messageEl.dataset.ttsMode = data.mode;

    // Controls only flip to "playing" once playback has actually started -
    // if audio.play() below rejects (e.g. autoplay blocked), the message
    // bubble/buttons must stay in their normal, not-playing state instead of
    // looking stuck on "reproduciendo" with nothing audible.
    const markPlaying = () => {
      messageEl.classList.add('is-playing');
      if (stopBtn) stopBtn.disabled = false;
      if (pauseBtn) {
        pauseBtn.disabled = false;
        pauseBtn.textContent = '⏸ Pausar';
      }
      if (rewindBtn) {
        // Rewind needs a seekable <audio> element - speechSynthesis has no
        // seek API, so it stays hidden in browser-fallback mode.
        rewindBtn.hidden = data.mode !== 'neural';
        rewindBtn.disabled = data.mode !== 'neural';
      }
      if (listenBtn) listenBtn.dataset.played = 'true';
    };

    if (data.mode === 'neural' && data.audioBase64) {
      const audio = getSharedTutorAudioElement();
      audio.pause();
      audio.currentTime = 0;
      audio.src = `data:${data.mimeType || 'audio/mpeg'};base64,${data.audioBase64}`;
      audio.playbackRate = 1;
      audio.onended = onEnd;
      audio.onerror = onEnd;
      currentTutorAudio = { element: audio, messageEl };
      try {
        await audio.play();
      } catch (playError) {
        currentTutorAudio = { element: null, messageEl: null };
        if (auto) {
          console.warn('[Tutor] autoplay blocked:', playError?.name, playError?.message);
        }
        if (playError?.name === 'NotAllowedError') {
          showDiscreetNotice('Pulsa reproducir para escuchar la respuesta.');
          if (listenBtn) listenBtn.disabled = false;
          return;
        }
        throw playError;
      }
    } else {
      currentTutorAudio = { element: null, messageEl };
      speakText(text, { locale, rate: speed === 'slow' ? 0.75 : 1, onEnd });
    }

    markPlaying();
    if (listenBtn) listenBtn.disabled = false;
  } catch (error) {
    if (auto) console.warn('[Tutor] auto-play request failed:', error?.message || error);
    // Only ever surfaced after a real playback attempt (manual click or
    // autoplay) failed - never shown up front, and never blocks the reply
    // text itself, which stays visible either way.
    showDiscreetNotice('No pudimos reproducir el audio. Puedes continuar leyendo la respuesta.');
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
  setActiveLesson(slug);
  updateLearnHash();
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
  const direct = learningPathState.lessons.find(
    (item) => item.slug === learningPathState.activeSlug
  );
  if (direct) return direct;
  // No direct match (activeSlug empty/stale). Previously this fell straight
  // to learningPathState.lessons[0], which - since lessons are ordered by
  // unit - is always Unidad 1's first activity: the Tutor IA context and
  // "next activity" would silently stick to Unidad 1 even right after the
  // user selected a different unit. Prefer a lesson from the selected unit
  // first, and only fall back to the course-wide recommendation otherwise.
  if (learningPathState.unitId) {
    const unitActivities = getUnitActivities(learningPathState.unitId);
    const unitFallback =
      unitActivities.find((item) => !item.completed && !item.locked) || unitActivities[0];
    if (unitFallback) return unitFallback;
  }
  return getNextRecommendedLesson() || null;
}

function updateAiTutorContext() {
  const contextRoot = document.querySelector('#tutor .tutor-context');
  if (!contextRoot) return;
  refreshLanguagePairChrome();

  const lesson = getActiveLearningLesson();
  const values = {
    language: LanguagePair
      ? LanguagePair.languageNameIn(learningPathState.bridgeLanguage, learningPathState.language)
      : languageDisplayNames[learningPathState.language] || learningPathState.language || 'English',
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

// Discreet "Te quedan N de 30 consultas" line - replaces the old permanent
// "Conversación por voz / Corrección de pronunciación" Premium badge row
// that used to sit here regardless of how much of the free quota was left.
// Says nothing about Premium at all until the student actually hits the
// limit (see openPaywallModal, called separately from the /api/ai/tutor
// rejection). remaining: null (guest, or Premium/ceo - see
// usageLimitService.checkUsage) means "no cap to show", so the line stays empty.
function renderTutorUsageCounter({ remaining, limit }) {
  const el = document.getElementById('tutorUsageCounter');
  if (!el) return;
  el.textContent =
    remaining != null && limit != null ? `Te quedan ${remaining} de ${limit} consultas.` : '';
}

async function refreshTutorUsageCounter() {
  const el = document.getElementById('tutorUsageCounter');
  if (!el) return;
  try {
    const response = await fetch(`${backendBaseUrl}/api/ai/tutor/usage`, { headers: authHeaders() });
    if (!response.ok) return;
    const data = await response.json();
    renderTutorUsageCounter(data);
  } catch (error) {
    // Silent - a stale/missing counter is never worth surfacing an error for.
  }
}

// ---------------------------------------------------------------------
// Speech transcript punctuation normalization. The Web Speech API used by
// startTutorDictation below returns raw text with no punctuation and no
// capitalization at all - there's no "provider punctuation" tier to lean on
// here, so this rule-based pass is the whole fix (deliberately not an AI
// call: a network round-trip per dictation would add latency and burn the
// Tutor's free-query quota for what's just spacing/capitalization cleanup,
// see §8/§9 of the spec this implements). It only ever touches whitespace,
// capitalization and terminal punctuation - never vocabulary, word order or
// meaning - and is applied once, when dictation ends, never on the live
// interim text (which would otherwise flicker).
// ---------------------------------------------------------------------
const TRANSCRIPT_LANGUAGE_CODES = { english: 'en', spanish: 'es', french: 'fr' };

// Sentence-initial cues used only to pick "?" vs "." for the one terminal
// mark this function may add - never used to add/remove/reorder words.
const TRANSCRIPT_QUESTION_STARTERS = {
  en: /^(what|why|when|where|who|whom|whose|which|how|is|are|am|was|were|do|does|did|can|could|will|would|shall|should|may|might|have|has|had)\b/i,
  es: /^(qué|que|cómo|como|cuándo|cuando|dónde|donde|quién|quien|cuál|cual|cuánto|cuanto|puedes|puede|podrías|podría|eres|es|estás|estas|tienes|tiene|vas|va)\b/i,
  fr: /^(que|qu'|quoi|comment|quand|où|qui|quel|quelle|quels|quelles|pourquoi|combien|es-tu|est-il|est-elle|peux-tu|pouvez-vous|as-tu|avez-vous|vas-tu|allez-vous)\b/i
};

// Collapses duplicate whitespace and fixes spacing around , . ; : ! ? -
// never removes accents/apostrophes, never touches word content.
function normalizeTranscriptSpacing(text) {
  return String(text)
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,.;:!?])(?=[^\s.!?…])/g, '$1 ')
    .replace(/\.{4,}/g, '...')
    .trim();
}

// Reusable, single-purpose formatter for a finished speech transcript -
// capitalization, spacing and terminal punctuation only, per language
// (en/es/fr supported; anything else still gets safe spacing/capitalization,
// just no question-mark heuristic since we have no starter word list for it).
function normalizeSpeechTranscript(text, language) {
  if (!text) return text;
  const lang = TRANSCRIPT_LANGUAGE_CODES[language] || null;

  let normalized = String(text)
    .split('\n')
    .map(normalizeTranscriptSpacing)
    .join('\n')
    .trim();
  if (!normalized) return normalized;

  // Capitalize the very first letter and the start of any sentence that
  // follows a ./!/?/… plus whitespace - interior words are never touched.
  normalized = normalized.replace(/(^|[.!?…]\s+)([a-zà-öø-ÿ])/g, (match, lead, letter) =>
    lead + letter.toUpperCase()
  );

  const endsWithTerminal = /[.!?…]["')\]]?$/.test(normalized);
  if (!endsWithTerminal) {
    const isQuestion = lang && TRANSCRIPT_QUESTION_STARTERS[lang]?.test(normalized);
    normalized += isQuestion ? '?' : '.';
  }

  if (lang === 'es') {
    if (/\?$/.test(normalized) && !normalized.startsWith('¿')) normalized = `¿${normalized}`;
  } else if (lang === 'fr') {
    // French convention: a space before ! ? ; : - already stripped by
    // normalizeTranscriptSpacing above, added back only for these four.
    normalized = normalized.replace(/\s*([!?;:])/g, ' $1');
  }

  return normalized;
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

// continuous/silenceMs/autoSend back the Premium "Conversar" hands-free mode
// (see resumeTutorConversationListening/setTutorConversationMode above):
// continuous keeps the recognizer open instead of stopping after one
// phrase, silenceMs auto-stops it after that many ms without a new result
// (i.e. "wait N seconds after the student stops talking"), and autoSend
// clicks the send button once a real transcript comes back instead of
// leaving it for the student to review. All three default to the original
// single-shot manual-dictation behavior when omitted.
function startTutorDictation(textareaId, { continuous = false, silenceMs = null, autoSend = false } = {}) {
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
  // listening (on either textarea) is a no-op. Also releases the
  // translator's mic, since only one recognizer can use it at a time.
  if (tutorDictation.status === 'listening') return;
  stopTranslatorDictation();
  stopDictationRecognizer();

  const recognition = new Ctor();
  recognition.lang = DICTATION_LANGUAGE_CODES[learningPathState.language] || 'en-US';
  recognition.interimResults = true;
  recognition.continuous = continuous;

  tutorDictation = { recognition, status: 'listening', textareaId, timeoutId: null };

  const baseText = textarea.value.trim();
  let finalTranscript = '';
  let hadError = false;
  // Only armed once continuous+silenceMs are both set, and only starts
  // counting once the student has actually said something (first 'result')
  // - never from the moment the mic opens, so thinking time before speaking
  // is never mistaken for "finished talking".
  let silenceTimerId = null;

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
  setDictationStatusText(textareaId, continuous ? 'Escuchando… habla cuando quieras.' : 'Escuchando…');

  recognition.addEventListener('result', (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const chunk = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalTranscript += chunk;
      else interim += chunk;
    }
    textarea.value = [baseText, (finalTranscript + interim).trim()].filter(Boolean).join(' ');

    if (continuous && silenceMs) {
      if (silenceTimerId) window.clearTimeout(silenceTimerId);
      silenceTimerId = window.setTimeout(() => stopTutorDictation(), silenceMs);
    }
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
    if (silenceTimerId) window.clearTimeout(silenceTimerId);
    const hadFinalText = Boolean(finalTranscript.trim());
    if (hadFinalText) {
      const polished = normalizeSpeechTranscript(finalTranscript.trim(), learningPathState.language);
      textarea.value = [baseText, polished].filter(Boolean).join(' ');
    }
    tutorDictation = { recognition: null, status: 'idle', textareaId: null, timeoutId: null };
    resetDictationUI(textareaId);
    if (hadFinalText && autoSend) {
      setDictationStatusText(textareaId, 'Enviando…');
      getDictationSendButton(textareaId)?.click();
      return;
    }
    if (hadFinalText) {
      setDictationStatusText(textareaId, 'Texto listo. Puedes editarlo antes de enviar.');
    } else if (!hadError && !textarea.value.trim()) {
      setDictationStatusText(
        textareaId,
        continuous && tutorConversationMode
          ? 'No se detectó voz. Pulsa "Hablar" cuando quieras continuar.'
          : 'No se entendió el audio. Intenta de nuevo.'
      );
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

// Separate from tutorDictation - the translator has its own recognizer
// language (the selected "Idioma de origen", not the learning path
// language) and its own single textarea, so it doesn't need the
// multi-textarea bookkeeping tutorDictation carries.
let translatorDictation = {
  recognition: null,
  status: 'idle', // idle | listening | unsupported
  timeoutId: null
};

function setTranslatorDictateStatusText(text) {
  const statusEl = document.getElementById('translatorInputDictateStatus');
  if (statusEl) statusEl.textContent = text;
}

function resetTranslatorDictateUI() {
  const micBtn = document.getElementById('translatorDictateBtn');
  const stopBtn = document.getElementById('translatorDictateStopBtn');
  if (micBtn && translatorDictation.status !== 'unsupported') {
    micBtn.disabled = false;
    micBtn.classList.remove('is-listening');
    micBtn.setAttribute('aria-pressed', 'false');
  }
  if (stopBtn) stopBtn.hidden = true;
}

function stopTranslatorDictationRecognizer() {
  if (translatorDictation.timeoutId) {
    window.clearTimeout(translatorDictation.timeoutId);
    translatorDictation.timeoutId = null;
  }
  if (translatorDictation.recognition) {
    try {
      translatorDictation.recognition.stop();
    } catch {
      /* already stopped/inactive */
    }
  }
}

// Called on: manually pressing "Detener", the 45s limit, changing the
// source language mid-dictation (recognition.lang is fixed for the life of
// a SpeechRecognition instance), and any top-level view navigation away
// from the homepage.
function stopTranslatorDictation() {
  if (translatorDictation.status !== 'listening') return;
  setTranslatorDictateStatusText('Transcribiendo…');
  stopTranslatorDictationRecognizer();
}

function startTranslatorDictation() {
  const textarea = document.getElementById('translatorInput');
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor || !textarea) {
    translatorDictation.status = 'unsupported';
    setTranslatorDictateStatusText(
      'El dictado por voz no está disponible en este navegador. Puedes escribir tu texto.'
    );
    const micBtn = document.getElementById('translatorDictateBtn');
    if (micBtn) micBtn.disabled = true;
    return;
  }

  // No simultaneous sessions - also releases the tutor's mic, since only
  // one recognizer can use it at a time.
  if (translatorDictation.status === 'listening') return;
  stopTutorDictation();
  stopTranslatorDictationRecognizer();

  const sourceSelect = document.getElementById('translatorSourceLang');
  const recognition = new Ctor();
  // 'auto' (Detectar idioma) has no fixed language to give the recognizer,
  // so it falls back to Spanish - most likely tongue for this app's users.
  recognition.lang = DICTATION_LANGUAGE_CODES[sourceSelect?.value] || 'es-ES';
  recognition.interimResults = true;
  recognition.continuous = false;

  translatorDictation = { recognition, status: 'listening', timeoutId: null };

  const baseText = textarea.value.trim();
  let finalTranscript = '';
  let hadError = false;

  const micBtn = document.getElementById('translatorDictateBtn');
  const stopBtn = document.getElementById('translatorDictateStopBtn');
  if (micBtn) {
    micBtn.disabled = true;
    micBtn.classList.add('is-listening');
    micBtn.setAttribute('aria-pressed', 'true');
  }
  if (stopBtn) stopBtn.hidden = false;
  setTranslatorDictateStatusText('Escuchando…');

  recognition.addEventListener('result', (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const chunk = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalTranscript += chunk;
      else interim += chunk;
    }
    textarea.value = [baseText, (finalTranscript + interim).trim()].filter(Boolean).join(' ');
    // Keeps the char counter (bound to 'input') live while dictating.
    textarea.dispatchEvent(new Event('input'));
  });

  recognition.addEventListener('error', (event) => {
    hadError = true;
    if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      setTranslatorDictateStatusText(
        'No se pudo acceder al micrófono. Revisa los permisos del navegador.'
      );
    } else if (event.error === 'no-speech') {
      setTranslatorDictateStatusText('No se entendió el audio. Intenta de nuevo.');
    } else {
      setTranslatorDictateStatusText('No se pudo completar el dictado. Intenta de nuevo.');
    }
  });

  // 'error' always fires before 'end', but 'end' still fires afterwards -
  // hadError guards against this handler overwriting a more specific
  // message (e.g. permission denied) with a generic one.
  recognition.addEventListener('end', () => {
    const hadFinalText = Boolean(finalTranscript.trim());
    translatorDictation = { recognition: null, status: 'idle', timeoutId: null };
    resetTranslatorDictateUI();
    if (hadFinalText) {
      setTranslatorDictateStatusText('Texto listo. Puedes editarlo antes de traducir.');
    } else if (!hadError && !textarea.value.trim()) {
      setTranslatorDictateStatusText('No se entendió el audio. Intenta de nuevo.');
    }
    textarea.focus();
  });

  try {
    recognition.start();
  } catch {
    translatorDictation = { recognition: null, status: 'idle', timeoutId: null };
    setTranslatorDictateStatusText('No se pudo iniciar el dictado. Intenta de nuevo.');
    resetTranslatorDictateUI();
    return;
  }

  translatorDictation.timeoutId = window.setTimeout(() => {
    stopTranslatorDictation();
  }, DICTATION_MAX_SECONDS * 1000);
}

const SKILL_ICONS = {
  listening: '🎧',
  speaking: '🗣️',
  reading: '📖',
  writing: '✍️',
  grammar: '📚',
  vocabulary: '🧠',
  dialogue: '💬'
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
  const skillLabel = getSkillLabel(lesson.skill);
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
  // If nothing has explicitly selected a unit yet (fresh load / language or
  // level switch, which resets unitId), default to the unit that holds the
  // active lesson, or failing that the recommended "next" lesson - so the
  // accordion opens somewhere sensible instead of every unit collapsed.
  if (!learningPathState.unitId) {
    const fallbackLesson = learningPathState.lessons.find(
      (item) => item.slug === learningPathState.activeSlug || item.slug === nextSlug
    );
    if (fallbackLesson?.unitId) learningPathState.unitId = fallbackLesson.unitId;
  }

  return learningPathState.units
    .map((unit) => {
      const activities = getUnitActivities(unit.id);
      const completedCount = activities.filter((item) => item.completed).length;
      const unitPct = activities.length ? Math.round((completedCount / activities.length) * 100) : 0;
      const isSelected = unit.id === learningPathState.unitId;

      return `
      <button type="button" class="path-unit path-unit-header${isSelected ? ' path-unit--selected' : ''}" data-unit-id="${escapeHtml(unit.id)}" ${isSelected ? 'aria-current="true"' : ''}>
        <span class="path-unit-order">${escapeHtml(String(unit.order))}</span>
        <span class="path-unit-titles">
          <span class="path-unit-title">${escapeHtml(unit.title)}</span>
          ${unit.titleEs ? `<span class="path-unit-title-es">${escapeHtml(unit.titleEs)}</span>` : ''}
        </span>
        <span class="path-unit-progress-label">${completedCount}/${activities.length} · ${unitPct}%</span>
      </button>
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
  const nextSkillLabel = nextLesson ? getSkillLabel(nextLesson.skill) : '—';

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

  // Clicking a unit selects it (see selectUnit()): it becomes the source of
  // truth in learningPathState.unitId, its first available lesson is
  // auto-picked when the previously active lesson belonged to a different
  // unit, and the whole graph re-renders - which is also what moves the
  // aria-current highlight to this unit. The route only ever lists unit
  // names; per-skill navigation happens in the right-hand unit overview
  // panel's CTA (renderUnitOverviewCard) and each skill's own level-tabs.
  container.querySelectorAll('.path-unit-header').forEach((headerEl) => {
    headerEl.addEventListener('click', (event) => {
      event.preventDefault();
      const unitId = headerEl.closest('.path-unit')?.dataset.unitId;
      if (!unitId) return;
      selectUnit(unitId);
      updateLearnHash('learn');
    });
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
  const skillLabel = getSkillLabel(lesson.skill);
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

// unit.unitOverview is optional hand-authored content (see
// scripts/content/*-a1-units.js's unitOverview field) - most units don't
// have it filled in yet, so every field here falls back to something safe
// instead of rendering "undefined" or an empty list.
function getUnitOverviewData(unit) {
  const overview = unit.unitOverview || {};
  return {
    objective: overview.objective || unit.description || '',
    outcomes: Array.isArray(overview.outcomes) ? overview.outcomes : [],
    grammar: Array.isArray(overview.grammar) ? overview.grammar : [],
    vocabulary: Array.isArray(overview.vocabulary) ? overview.vocabulary : [],
    scenario: overview.scenario || ''
  };
}

// Contextual CTA for the unit overview panel: label and target activity
// both follow the unit's own completion state, never a specific lesson name
// (that's what the left column's per-activity labels are for - see
// renderLessonItemHtml/getLessonStateInfo).
function getUnitActionState(unit) {
  const activities = getUnitActivities(unit.id);
  const total = activities.length;
  const completedCount = activities.filter((item) => item.completed).length;
  const started = activities.some(
    (item) => item.completed || item.progressStatus === 'in_progress'
  );
  const allCompleted = total > 0 && completedCount === total;

  let label = 'Comenzar unidad';
  if (allCompleted) label = 'Repasar unidad';
  else if (started) label = 'Continuar unidad';

  const target = allCompleted
    ? activities[0]
    : activities.find((item) => !item.completed && !item.locked) || activities[0];

  return { total, completedCount, label, targetSlug: target?.slug || '' };
}

function renderUnitOverviewList(items) {
  if (!items.length) return '';
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

// The 2-column grid from .unit-overview-body (see styles.css): outcomes and
// grammar side by side, vocabulary spanning the full width below. Any
// section with no data (unit has no unitOverview yet) is simply omitted.
function renderUnitOverviewBody(data) {
  const outcomesHtml = data.outcomes.length
    ? `<div class="unit-overview-column"><h4>Aprenderás a</h4>${renderUnitOverviewList(data.outcomes)}</div>`
    : '';
  const grammarHtml = data.grammar.length
    ? `<div class="unit-overview-column"><h4>Gramática</h4>${renderUnitOverviewList(data.grammar)}</div>`
    : '';
  const vocabularyHtml = data.vocabulary.length
    ? `<div class="unit-overview-column unit-overview-column--full"><h4>Vocabulario</h4>${renderUnitOverviewList(data.vocabulary)}</div>`
    : '';
  return `${outcomesHtml}${grammarHtml}${vocabularyHtml}`;
}

// Right-panel default state for unit-aware languages/levels (English,
// Français, Español A1 today - see hasUnits()): describes the *selected
// unit* (title, communicative objective, outcomes, grammar, vocabulary,
// scenario, this unit's own progress) instead of naming one specific
// lesson. The left column (renderUnitAccordionHtml) only lists unit names
// and overall progress - this panel's own "Comenzar/Continuar/Repasar
// unidad" CTA (action.targetSlug below) is how a student actually enters a
// specific activity; each skill's own level-tabs nav is the other way in.
// See renderContinueCard (still used for languages/levels without units)
// for the shape this replaces.
//
// Stable across every activity click within the same unit: nothing here
// depends on which activity is highlighted, only on unitId and this unit's
// completion state, so opening a different lesson to practice (which
// replaces this panel with renderLessonDetail) is the only thing that
// changes it - not merely looking at a different activity in the list.
function renderUnitOverviewCard(unit) {
  const data = getUnitOverviewData(unit);
  const action = getUnitActionState(unit);
  const pct = action.total ? Math.round((action.completedCount / action.total) * 100) : 0;
  const bodyHtml = renderUnitOverviewBody(data);

  return `
    <div class="unit-overview-panel">
      <div class="unit-overview-header">
        <h3 class="unit-title">${escapeHtml(unit.title)}</h3>
        ${data.objective ? `<p class="unit-objective">${escapeHtml(data.objective)}</p>` : ''}
        ${data.scenario ? `<p class="unit-scenario">“${escapeHtml(data.scenario)}”</p>` : ''}
      </div>
      <div class="unit-overview-progress">
        <div class="unit-overview-progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div style="width:${pct}%"></div>
        </div>
        <span class="unit-overview-progress-label">${action.completedCount}/${action.total} actividades completadas en esta unidad</span>
      </div>
      ${
        bodyHtml
          ? `
      <div class="unit-overview-desktop">
        <div class="unit-overview-body">${bodyHtml}</div>
      </div>
      <details class="unit-overview-collapsible">
        <summary>Ver detalles de la unidad</summary>
        <div class="unit-overview-body">${bodyHtml}</div>
      </details>`
          : ''
      }
      <div class="unit-overview-actions">
        <button type="button" class="primary-btn unit-action-btn" data-lesson-slug="${escapeHtml(action.targetSlug)}">${escapeHtml(action.label)}</button>
      </div>
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
      <button type="button" class="primary-btn" data-action="open-lesson-paywall">Desbloquear</button>
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
// shows the selected unit's overview (renderUnitOverviewCard) for
// unit-aware languages/levels, or a "continue" card for the next
// recommended lesson otherwise (languages/levels without units - see
// hasUnits()); once the student opens a specific activity to practice it
// shows that lesson's full detail. All three branches fully own
// workspace.innerHTML (see the delegated .lesson-complete-btn/
// .learn-back-to-route/.lesson-continue-btn/.unit-action-btn handlers below
// - they can't be one-time listeners bound to a single element, since that
// element gets replaced on every render).
function renderLessonWorkspace() {
  const workspace = document.getElementById('lessonWorkspace');
  if (!workspace) return;
  if (!learningPathState.lessons.length) return;

  const activeLesson = learningPathState.activeSlug
    ? learningPathState.lessons.find((item) => item.slug === learningPathState.activeSlug)
    : null;

  if (activeLesson) {
    workspace.innerHTML = renderLessonDetail(activeLesson);
    workspace.classList.remove('lesson-workspace--continue', 'lesson-workspace--unit-overview');
    return;
  }

  if (hasUnits()) {
    const unit =
      learningPathState.units.find((item) => item.id === learningPathState.unitId) ||
      learningPathState.units[0];
    if (unit) {
      workspace.innerHTML = renderUnitOverviewCard(unit);
      workspace.classList.add('lesson-workspace--unit-overview');
      workspace.classList.remove('lesson-workspace--continue');
      return;
    }
  }

  const nextLesson = getNextRecommendedLesson();
  if (!nextLesson) return;
  workspace.innerHTML = renderContinueCard(nextLesson);
  workspace.classList.add('lesson-workspace--continue');
  workspace.classList.remove('lesson-workspace--unit-overview');
}

function renderLearningPath() {
  renderSkillGraph();
  renderLessonWorkspace();
  renderSkillCards();
  updateAiTutorContext();
}

const SKILL_LABELS = {
  learn: 'Ruta',
  listening: 'Listening',
  speaking: 'Speaking',
  reading: 'Reading',
  writing: 'Writing',
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  dialogue: 'Dialogues'
};

// French A1's pedagogical content is authored entirely in French (see
// scripts/content/french-a1-units.js), so its skill-tab labels are French
// too - internal skill keys (reading/listening/etc., plus the new
// 'dialogue' type) stay the same for code compatibility. Every other
// language keeps the SKILL_LABELS map above unchanged.
const SKILL_LABELS_FRENCH = {
  learn: 'Parcours',
  listening: 'Compréhension orale',
  speaking: 'Expression orale',
  reading: 'Lecture',
  writing: 'Expression écrite',
  grammar: 'Grammaire',
  vocabulary: 'Vocabulaire',
  dialogue: 'Dialogues'
};

function getSkillLabel(skill, language = learningPathState.language) {
  if (language === 'french') return SKILL_LABELS_FRENCH[skill] || SKILL_LABELS[skill] || skill;
  return SKILL_LABELS[skill] || skill;
}

// Updates every repeated .level-tabs strip (one per skill section, see
// index.html) and every .skill-competency-card <h3> to match the active
// target language - these are plain static markup otherwise, so without
// this they'd keep showing English/Spanish labels no matter which
// language's course is open. Cheap full-DOM sweep, called on every
// navigation (showView) and language switch (setTargetLanguage).
function updateLevelTabLabels() {
  document.querySelectorAll('.level-tab[data-tab]').forEach((link) => {
    link.textContent = getSkillLabel(link.dataset.tab);
  });
  document.querySelectorAll('.skill-competency-card[data-skill]').forEach((card) => {
    const heading = card.querySelector('h3');
    if (heading) heading.textContent = getSkillLabel(card.dataset.skill);
  });
}

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
          ? LanguagePair.t('skillNotAvailableLevel', learningPathState.bridgeLanguage)
          : LanguagePair.t('genericLoading', learningPathState.bridgeLanguage);
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
        `${getSkillLabel(skill)}: biblioteca, ${completedCount}/${activities.length} completadas`
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
      `${getSkillLabel(skill)}: disponible, ${pct}% completado, ${lesson.xpReward || 20} XP`
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
  refreshLanguagePairChrome();
  const bridgeLabel = LanguagePair
    ? LanguagePair.languageNameIn(learningPathState.bridgeLanguage, learningPathState.bridgeLanguage)
    : languageDisplayNames[learningPathState.bridgeLanguage] || learningPathState.bridgeLanguage;
  const targetLabel = LanguagePair
    ? LanguagePair.languageNameIn(learningPathState.bridgeLanguage, learningPathState.language)
    : languageDisplayNames[learningPathState.language] || learningPathState.language;
  const level = learningPathState.level;
  const bridgeEl = section.querySelector('[data-field="bridge"]');
  const targetEl = section.querySelector('[data-field="target"]');
  const levelEl = section.querySelector('[data-field="level"]');
  const sentenceEl = section.querySelector('[data-field="sentence"]');
  if (bridgeEl) bridgeEl.textContent = bridgeLabel;
  if (targetEl) targetEl.textContent = targetLabel;
  if (levelEl) levelEl.textContent = level;
  if (sentenceEl) {
    sentenceEl.textContent = LanguagePair
      ? LanguagePair.getLanguagePairLabel(learningPathState.bridgeLanguage, learningPathState.language)
      : `Aprenderás ${targetLabel} con apoyo en ${bridgeLabel}.`;
  }
}

function openChangeCombinationPopover() {
  const popover = document.getElementById('changeComboPopover');
  if (!popover) return;
  const bridgeSelect = document.getElementById('comboBridgeSelect');
  const languageSelect = document.getElementById('comboLanguageSelect');
  const levelSelect = document.getElementById('comboLevelSelect');
  if (bridgeSelect) bridgeSelect.value = learningPathState.bridgeLanguage;
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
      if (skill === 'reading') readingSpeechPlayer.teardown();
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
    return `<p class="skill-graph-empty">No hay actividades de ${getSkillLabel(skill)} disponibles en este nivel todavía.</p>`;
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
    <p class="skill-library-intro">${activities.length} actividades de ${getSkillLabel(skill)} en ${escapeHtml(languageDisplayNames[learningPathState.language] || learningPathState.language)} ${escapeHtml(learningPathState.level)}, una por unidad.</p>
    <div class="skill-library-grid">${cardsHtml}</div>
  `;
}

function wireSkillLibrary(section, skill) {
  section.querySelectorAll('.skill-library-card').forEach((card) => {
    card.addEventListener('click', () => {
      setActiveLesson(card.dataset.lessonSlug);
      renderSkillView(skill);
      updateLearnHash(skill);
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
      content.innerHTML = `<p class="skill-graph-empty">Preparando ${getSkillLabel(skill)}…</p>`;
    updateSkillViewBackLink(section, skill, false);
    // Consult the hash here too (not just bootstrapLearningPath) - a cold
    // reload/shared link straight into a skill view (e.g.
    // #reading/french/A1/unit-02/lesson-slug) reaches this branch before
    // bootstrapLearningPath's own restore runs, since lessons are still
    // empty at that point. Loading with the hash's language/level here
    // avoids a flash of the wrong language before the correct one loads.
    const hashState = parseLearnHashState();
    loadLearningPath({
      language: hashState.language || learningPathState.language,
      level: hashState.level || learningPathState.level,
      restoreUnitId: hashState.unitId,
      restoreSlug: hashState.lessonSlug
    }).then(() => renderSkillView(skill));
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
      content.innerHTML = `<p class="skill-graph-empty">No hay lección de ${getSkillLabel(skill)} disponible en este nivel todavía.</p>`;
    return;
  }

  SKILL_VIEW_RENDERERS[skill]?.(section, lesson);
}

// Renders every paragraph of the reading as visible text - this is the
// single source of truth for what's on screen and in the printed PDF alike
// (nothing else duplicates this markup). Each sentence is wrapped in its
// own span carrying the same segmentIndex buildReadingSegments() assigns it
// (both walk the exact same paragraphs via getReadingParagraphs() and the
// same splitReadingSentences()), so the audio player can highlight
// whichever sentence is currently being spoken via a plain class toggle -
// see updateReadingHighlight() - without touching which text is visible,
// scrolling, or re-rendering anything.
function renderReadingParagraphsHtml(paragraphs) {
  let segmentIndex = 1; // 0 is the lesson title - see buildReadingSegments()
  return paragraphs
    .map((paragraph) => {
      const sentences = splitReadingSentences(paragraph);
      if (!sentences.length) return '';
      const spansHtml = sentences
        .map((sentence) => {
          const span = `<span class="reading-sentence" data-segment-index="${segmentIndex}">${escapeHtml(sentence)}</span>`;
          segmentIndex += 1;
          return span;
        })
        .join(' ');
      return `<p>${spansHtml}</p>`;
    })
    .join('');
}

// A plain 2-option True/False (or Vrai/Faux, or Verdadero/Falso) mcq is
// grouped under its own heading in the reading view so it reads as a
// distinct activity type, without needing a separate schema field - see
// scripts/content/english-a1-units.js (['True', 'False']),
// scripts/content/french-a1-units.js (['Vrai', 'Faux']) and Spanish content
// (['Verdadero', 'Falso']). Without 'verdadero'/'falso' here, Spanish
// true/false questions fell through into the 4-option "Preguntas de
// comprensión" section instead of their own block.
function isTrueFalseExercise(item) {
  return (
    Array.isArray(item.options) &&
    item.options.length === 2 &&
    item.options.some((opt) =>
      ['true', 'vrai', 'verdadero', 'false', 'faux', 'falso'].includes(
        optionLabel(opt).trim().toLowerCase()
      )
    )
  );
}

// Markup for the full-reading audio player (spec section A) - the only
// control surface that can move forward/back through the reading; the
// visible text below never paginates or otherwise reacts to these
// buttons. Hidden entirely (with a short explanatory message, no console
// errors) when the browser has no speechSynthesis at all - same
// graceful-degradation rule as flashcard pronunciation.
function renderReadingAudioPlayerHtml(snapshot) {
  if (!readingSpeechPlayer.isSupported()) {
    return `<p class="reading-audio-unavailable no-print">La reproducción de voz no está disponible en este dispositivo.</p>`;
  }
  const isPlaying = snapshot.state === 'playing';
  const isPaused = snapshot.state === 'paused';
  const playPauseLabel = isPlaying ? '⏸ Pausar' : isPaused ? '▶ Continuar' : '▶ Reproducir';
  const playPauseAria = isPlaying
    ? 'Pausar lectura'
    : isPaused
      ? 'Continuar lectura'
      : 'Reproducir lectura completa';
  const statusLabel = readingAudioStatusLabel(snapshot.state);
  const seekDisabled = snapshot.state === 'idle' || snapshot.state === 'error' ? 'disabled' : '';
  return `
    <div class="reading-audio-player no-print" role="group" aria-label="Reproductor de audio: escucha el texto completo de esta lectura">
      <div class="reading-audio-controls">
        <button type="button" class="reading-audio-btn reading-audio-playpause-btn${isPlaying ? ' is-active' : ''}" aria-label="${playPauseAria}">${playPauseLabel}</button>
        <button type="button" class="reading-audio-btn reading-audio-rewind-btn" aria-label="Retroceder cinco segundos" ${seekDisabled}>↶ 5 s</button>
        <button type="button" class="reading-audio-btn reading-audio-stop-btn" aria-label="Detener lectura" ${snapshot.state === 'idle' || snapshot.state === 'stopped' ? 'disabled' : ''}>⏹ Detener</button>
        <button type="button" class="reading-audio-btn reading-audio-voice-btn" aria-label="Cambiar voz" title="${snapshot.voiceName ? `Voz: ${escapeHtml(snapshot.voiceName)}` : ''}" ${snapshot.canChangeVoice ? '' : 'hidden'}>🔄 <span class="reading-audio-voice-label">${escapeHtml(snapshot.voiceLabel || '')}</span></button>
        <div class="reading-audio-rate-group" role="group" aria-label="Velocidad de lectura">
          <button type="button" class="reading-audio-rate-btn${snapshot.rateKey === 'slow' ? ' is-active' : ''}" data-rate="slow" aria-pressed="${snapshot.rateKey === 'slow'}">Lenta</button>
          <button type="button" class="reading-audio-rate-btn${snapshot.rateKey === 'normal' ? ' is-active' : ''}" data-rate="normal" aria-pressed="${snapshot.rateKey === 'normal'}">Normal</button>
        </div>
        <div class="reading-audio-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${snapshot.progressPct}" aria-label="Progreso de la lectura">
          <div class="reading-audio-progress-fill" style="width:${snapshot.progressPct}%"></div>
        </div>
        <div class="reading-audio-meta">
          <span class="reading-audio-time">${formatReadingTime(snapshot.elapsedSeconds)} / ${formatReadingTime(snapshot.totalDurationSeconds)}</span>
          <span class="reading-audio-percent">${snapshot.progressPct}%</span>
          <span class="reading-audio-status" aria-live="polite">${statusLabel}</span>
        </div>
      </div>
    </div>
  `;
}

function readingAudioStatusLabel(state) {
  if (state === 'playing') return 'Leyendo…';
  if (state === 'paused') return 'En pausa';
  if (state === 'completed') return 'Lectura completa';
  return '';
}

// Patches the audio player's own DOM in place (progress bar, clock,
// button labels/states) rather than re-rendering the whole reading - this
// runs up to 4x/second while playing, and a full re-render would wipe
// focus, scroll position and any in-progress exercise selections. There is
// no other trigger for a full re-render while a reading is open: playing,
// pausing, rewinding and switching voice/rate all only ever patch this
// player's DOM and the current sentence highlight (see
// updateReadingHighlight) - the visible text never moves or reflows.
function updateReadingPlayerUI(section, snapshot) {
  const player = section.querySelector('.reading-audio-player');
  if (!player) return;

  const fill = player.querySelector('.reading-audio-progress-fill');
  if (fill) fill.style.width = `${snapshot.progressPct}%`;
  const progressWrap = player.querySelector('.reading-audio-progress');
  if (progressWrap) progressWrap.setAttribute('aria-valuenow', String(snapshot.progressPct));

  const timeEl = player.querySelector('.reading-audio-time');
  if (timeEl) {
    timeEl.textContent = `${formatReadingTime(snapshot.elapsedSeconds)} / ${formatReadingTime(snapshot.totalDurationSeconds)}`;
  }
  const pctEl = player.querySelector('.reading-audio-percent');
  if (pctEl) pctEl.textContent = `${snapshot.progressPct}%`;

  const playPauseBtn = player.querySelector('.reading-audio-playpause-btn');
  if (playPauseBtn) {
    const isPlaying = snapshot.state === 'playing';
    const isPaused = snapshot.state === 'paused';
    playPauseBtn.textContent = isPlaying ? '⏸ Pausar' : isPaused ? '▶ Continuar' : '▶ Reproducir';
    playPauseBtn.setAttribute(
      'aria-label',
      isPlaying ? 'Pausar lectura' : isPaused ? 'Continuar lectura' : 'Reproducir lectura completa'
    );
    playPauseBtn.classList.toggle('is-active', isPlaying);
  }

  const rewindBtn = player.querySelector('.reading-audio-rewind-btn');
  if (rewindBtn) rewindBtn.disabled = snapshot.state === 'idle' || snapshot.state === 'error';

  const stopBtn = player.querySelector('.reading-audio-stop-btn');
  if (stopBtn) stopBtn.disabled = snapshot.state === 'idle' || snapshot.state === 'stopped';

  const voiceBtn = player.querySelector('.reading-audio-voice-btn');
  if (voiceBtn) {
    voiceBtn.hidden = !snapshot.canChangeVoice;
    voiceBtn.title = snapshot.voiceName ? `Voz: ${snapshot.voiceName}` : '';
    const label = voiceBtn.querySelector('.reading-audio-voice-label');
    if (label) label.textContent = snapshot.voiceLabel || '';
  }

  player.querySelectorAll('.reading-audio-rate-btn').forEach((btn) => {
    const isActive = btn.dataset.rate === snapshot.rateKey;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  const statusEl = player.querySelector('.reading-audio-status');
  if (statusEl) statusEl.textContent = readingAudioStatusLabel(snapshot.state);

  player.classList.toggle('is-completed', snapshot.state === 'completed');
}

// Toggles which sentence/paragraph reads as "currently being spoken" -
// pure class patch driven by the player's own segmentIndex, matching the
// data-segment-index values renderReadingParagraphsHtml() assigned. Never
// scrolls, never re-renders, never changes what text is visible.
function updateReadingHighlight(section, snapshot) {
  const prev = section.querySelector('.reading-sentence.is-speaking');
  if (prev) prev.classList.remove('is-speaking');
  if (snapshot.state !== 'playing') return;
  const current = section.querySelector(`.reading-sentence[data-segment-index="${snapshot.currentSegmentIndex}"]`);
  if (current) current.classList.add('is-speaking');
}

// Deterministic inline SVG illustration, used whenever a reading has no
// artwork of its own configured yet - keeps the illustration figure always
// present (per spec) without depending on any external image asset - a
// small, flat, pastel icon card (an open-book glyph on a soft rounded
// square), not a hero-sized gradient block. No animation: at this size a
// static icon reads as an intentional design element, while motion on
// something this small mostly reads as a distracting flicker. Same look
// for every load of the same lesson (seeded by unitId/slug), a different
// (but always muted, low-saturation) hue across units.
function buildGenericIllustrationDataUri(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  const bg = `hsl(${hue}, 45%, 96%)`;
  const border = `hsl(${hue}, 35%, 87%)`;
  const page = `hsl(${hue}, 30%, 91%)`;
  const ink = `hsl(${hue}, 45%, 42%)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect x="1.5" y="1.5" width="157" height="157" rx="24" fill="${bg}" stroke="${border}" stroke-width="2"/><path d="M80 54 C62 43 38 45 28 54 L28 104 C38 95 62 93 80 104 Z" fill="${page}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M80 54 C98 43 122 45 132 54 L132 104 C122 95 98 93 80 104 Z" fill="${page}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><line x1="80" y1="54" x2="80" y2="104" stroke="${ink}" stroke-width="3"/><line x1="42" y1="63" x2="66" y2="59" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/><line x1="42" y1="73" x2="66" y2="69" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/><line x1="42" y1="83" x2="66" y2="79" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/><line x1="94" y1="59" x2="118" y2="63" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/><line x1="94" y1="69" x2="118" y2="73" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/><line x1="94" y1="79" x2="118" y2="83" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Each reading can define its own illustration (lesson.reading.illustration
// = { src, alt }, see scripts/content/*-a1-units.js), falling back to a
// unit-level one (lesson.unitIllustration) and finally to the generated
// placeholder above, so the figure is never a broken image while real
// artwork hasn't been authored for a given lesson yet.
function resolveReadingIllustration(lesson) {
  const chosen = lesson.reading?.illustration?.src
    ? lesson.reading.illustration
    : lesson.unitIllustration?.src
      ? lesson.unitIllustration
      : null;
  const seed = lesson.unitId || lesson.slug || lesson.title || 'andergo';
  return {
    src: chosen?.src || null,
    fallbackSrc: buildGenericIllustrationDataUri(String(seed)),
    alt: chosen?.alt || lesson.title || ''
  };
}

// When a real illustration path is configured but the asset hasn't been
// uploaded yet, onerror swaps it for the generated placeholder instead of
// showing a broken-image icon.
function renderReadingIllustrationHtml(lesson) {
  const { src, fallbackSrc, alt } = resolveReadingIllustration(lesson);
  const onerror = src ? ` onerror="this.onerror=null;this.src='${fallbackSrc}';"` : '';
  return `
    <figure class="reading-illustration no-print">
      <img src="${escapeHtml(src || fallbackSrc)}" alt="${escapeHtml(alt)}" loading="lazy"${onerror}>
    </figure>
  `;
}

// ---------------------------------------------------------------------
// Reading comprehension quiz ("Preguntas de comprensión"): batch-graded,
// four-option (A/B/C/D) multiple choice. Picking an option only stores it
// locally (single-select, picking another swaps it) - nothing is checked
// until "Calificar" is pressed, which grades every question against the
// real answer key (kept server-side only, never shipped to the browser -
// see lib/lessonsService.js#sanitizeExerciseForClient/checkAnswer) via the
// same /check-answer endpoint the rest of the app already uses, then shows
// a 0-100 score plus per-question correct/incorrect feedback. Kept
// deliberately separate from renderLessonExercise/.mcq-option (shared by
// Listening/Grammar/dialogue exercises, which keep their existing
// immediate-grading behavior) - only Reading's comprehension section
// changes shape here.
const readingComprehensionState = new Map();

function getReadingComprehensionRuntime(slug) {
  let runtime = readingComprehensionState.get(slug);
  if (!runtime) {
    runtime = { selections: {}, results: {}, graded: false, grading: false, error: '' };
    readingComprehensionState.set(slug, runtime);
  }
  return runtime;
}

function resetReadingComprehensionRuntime(slug) {
  readingComprehensionState.set(slug, {
    selections: {},
    results: {},
    graded: false,
    grading: false,
    error: ''
  });
}

// 90-100/80-89/70-79/60-69/<60 score bands - wording per spec, never
// "reprobado", for a platform used by kids as young as ~9.
function readingComprehensionScoreMessage(score) {
  if (score >= 90) return '¡Excelente comprensión del texto!';
  if (score >= 80) return '¡Muy buen trabajo!';
  if (score >= 70) return 'Buen trabajo. Sigue practicando.';
  if (score >= 60) return 'Vas avanzando. Revisa el texto nuevamente.';
  return 'Repasa la lectura e inténtalo otra vez.';
}

function renderReadingComprehensionResultHtml(runtime, total) {
  const correctCount = Object.values(runtime.results).filter((r) => r.correct).length;
  const incorrectCount = total - correctCount;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  return `
    <div class="reading-comp-result">
      <p class="reading-comp-result-score">Puntuación: ${score}/100</p>
      <p class="reading-comp-result-detail">${correctCount} de ${total} respuestas correctas</p>
      <p class="reading-comp-result-detail">${incorrectCount} incorrecta${incorrectCount === 1 ? '' : 's'} · ${score}%</p>
      <p class="reading-comp-result-message">${escapeHtml(readingComprehensionScoreMessage(score))}</p>
    </div>
  `;
}

function renderReadingComprehensionQuiz(lesson, entries) {
  if (!entries.length) {
    return '<p class="skill-graph-empty">No hay preguntas de comprensión para esta lección.</p>';
  }

  const runtime = getReadingComprehensionRuntime(lesson.slug);
  const total = entries.length;

  const questionsHtml = entries
    .map(({ item, exerciseIndex }, displayIndex) => {
      const selectedKey = runtime.selections[exerciseIndex];
      const result = runtime.graded ? runtime.results[exerciseIndex] : null;

      const optionsHtml = (item.options || [])
        .map((option, optionIndex) => {
          const key = optionKey(option, optionIndex);
          const letter = String.fromCharCode(65 + optionIndex);
          const isSelected = selectedKey != null && String(selectedKey) === String(key);
          const classes = ['reading-comp-option'];
          if (isSelected) classes.push('is-selected');
          if (result) {
            const isCorrectOption =
              result.correctOption != null && String(result.correctOption) === String(key);
            if (isSelected) classes.push(result.correct ? 'is-correct' : 'is-incorrect');
            else if (isCorrectOption) classes.push('is-correct-answer');
          }
          const disabled = runtime.graded || runtime.grading ? 'disabled' : '';
          return `
            <button type="button" class="${classes.join(' ')}" data-option-key="${escapeHtml(String(key))}" ${disabled}>
              <span class="reading-comp-option-letter">${letter}</span>
              <span class="reading-comp-option-text">${escapeHtml(optionLabel(option))}</span>
            </button>
          `;
        })
        .join('');

      let feedbackHtml = '';
      if (result) {
        feedbackHtml = result.correct
          ? '<span class="reading-comp-feedback is-correct">✅ Correcto</span>'
          : `<span class="reading-comp-feedback is-incorrect">❌ Incorrecto${result.correctLabel ? ` · Respuesta correcta: ${escapeHtml(result.correctLabel)}` : ''}</span>`;
      }

      return `
        <div class="reading-comp-question" data-exercise-index="${exerciseIndex}" data-lesson-slug="${escapeHtml(lesson.slug || '')}">
          <strong class="reading-comp-prompt">${displayIndex + 1}. ${escapeHtml(item.prompt)}</strong>
          <div class="reading-comp-options">${optionsHtml}</div>
          ${feedbackHtml}
        </div>
      `;
    })
    .join('');

  const answeredCount = entries.filter(
    ({ exerciseIndex }) => runtime.selections[exerciseIndex] != null
  ).length;
  const allAnswered = answeredCount === total;

  const actionsHtml = runtime.graded
    ? `<button type="button" class="primary-btn reading-comp-retry-btn" data-lesson-slug="${escapeHtml(lesson.slug)}">Intentar de nuevo</button>`
    : `
      <button type="button" class="primary-btn reading-comp-submit-btn" data-lesson-slug="${escapeHtml(lesson.slug)}" ${allAnswered && !runtime.grading ? '' : 'disabled'}>${runtime.grading ? 'Calificando…' : 'Calificar'}</button>
      ${!allAnswered ? '<p class="reading-comp-hint">Responde todas las preguntas antes de calificar.</p>' : ''}
    `;

  const errorHtml = runtime.error ? `<p class="reading-comp-error">${escapeHtml(runtime.error)}</p>` : '';
  const resultHtml = runtime.graded ? renderReadingComprehensionResultHtml(runtime, total) : '';

  return `
    <div class="reading-comp-quiz">
      ${questionsHtml}
      <div class="reading-comp-actions">${actionsHtml}</div>
      ${errorHtml}
      ${resultHtml}
    </div>
  `;
}

function renderReadingView(section, lesson) {
  const content = section.querySelector('.skill-view-content');
  if (!content) return;
  const { total, attempted } = getExerciseProgress(lesson);
  const pct = total ? Math.round((attempted / total) * 100) : 0;
  const paragraphs = getReadingParagraphs(lesson);
  // Only show a separate description line when it's distinct from the
  // reading body itself - if neither reading.parts nor reading.text is set,
  // getReadingParagraphs() above falls back to lesson.description as the
  // body, and repeating it here would duplicate the same text on screen.
  const hasDedicatedReadingBody =
    (Array.isArray(lesson.reading?.parts) && lesson.reading.parts.length > 0) || Boolean(lesson.reading?.text);
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
  // Keep each exercise's real position in lesson.exercises (not its position
  // within this filtered subset) - check-answer grades by that real index
  // server-side (lib/lessonsService.js#checkAnswer), and non-mcq exercises
  // interleaved in the source data would otherwise desync the index sent
  // from the one actually graded.
  const mcqEntries = (lesson.exercises || [])
    .map((item, exerciseIndex) => ({ item, exerciseIndex }))
    .filter(({ item }) => item.type === 'mcq');
  // True/false questions are not shown in Reading (product decision - only
  // the 4-option comprehension quiz is graded here) - excluded so they never
  // leak into it either.
  const comprehensionEntries = mcqEntries.filter(({ item }) => !isTrueFalseExercise(item));
  const exercisesHtml = renderReadingComprehensionQuiz(lesson, comprehensionEntries);

  // Attaching is a no-op when this is the same lesson already loaded -
  // continuous playback survives the DOM rebuild below either way, since
  // nothing during playback (play/pause/rewind/advance/restart/voice/rate)
  // ever triggers another full re-render - see updateReadingPlayerUI/
  // updateReadingHighlight below, which patch this render's DOM in place.
  readingSpeechPlayer.attach(lesson, learningPathState.language);
  const audioSnapshot = readingSpeechPlayer.getSnapshot();
  const audioPlayerHtml = renderReadingAudioPlayerHtml(audioSnapshot);
  const illustrationHtml = renderReadingIllustrationHtml(lesson);
  const durationLabel = lesson.estimatedMinutes ? `${lesson.estimatedMinutes} min · ` : '';
  // Full reading text + vocabulary word list, reused as context for both the
  // Tutor shortcuts (data-tutor-transcript/-vocabulary) and the "Traducir
  // este texto" shortcut below - so both actually know what's on screen
  // instead of just a generic prompt string.
  const readingTranscript = paragraphs.join(' ');
  const readingVocabWords = (lesson.vocabulary || []).map((item) => item.word).join(', ');

  content.innerHTML = `
    <div class="reading-print-area skill-print-area">
      ${renderSkillPrintHeaderHtml(lesson)}
      <div class="reading-hero">
        <div class="reading-heading">
          <p class="reading-level-tag">${durationLabel}${escapeHtml(lesson.level)} · ${escapeHtml(getSkillLabel('reading'))}</p>
          <h3><span class="reading-sentence" data-segment-index="0">${escapeHtml(lesson.title)}</span></h3>
          ${hasDedicatedReadingBody && lesson.description ? `<p class="reading-description">${escapeHtml(lesson.description)}</p>` : ''}
        </div>
        ${illustrationHtml}
      </div>
      <div class="reading-progress-bar no-print" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div style="width:${pct}%"></div></div>
      ${audioPlayerHtml}
      <article class="reading-text">${renderReadingParagraphsHtml(paragraphs)}</article>
      <div class="reading-vocab-section no-print">
        <button type="button" class="secondary-btn reading-toggle-vocab">Ver vocabulario</button>
        <div class="reading-vocab-list" hidden>${vocabHtml}</div>
      </div>
      <div class="reading-support-toggle no-print">
        <button type="button" class="secondary-btn reading-show-support">${escapeHtml(learningPathState.language === 'french' ? "Afficher l'aide en espagnol" : 'Mostrar apoyo en español')}</button>
        <button type="button" class="secondary-btn reading-hide-support" hidden>${escapeHtml(learningPathState.language === 'french' ? "Masquer l'aide en espagnol" : 'Ocultar apoyo')}</button>
      </div>
      <div class="reading-questions">
        <h4>Preguntas de comprensión</h4>
        ${exercisesHtml}
      </div>
      <div class="reading-print-answer-space skill-print-answer-space print-only">
        <h4>Tus respuestas</h4>
        <div class="reading-print-answer-lines"><div></div><div></div><div></div><div></div></div>
      </div>
    </div>
    <div class="skill-view-tutor-cta no-print">
      <button type="button" class="secondary-btn open-tutor-btn" data-tutor-prompt="Explícame este párrafo: ${escapeHtml(paragraphs[0] || lesson.title)}" data-support-mode="explain" data-tutor-transcript="${escapeHtml(readingTranscript)}" data-tutor-vocabulary="${escapeHtml(readingVocabWords)}">Explicar este párrafo</button>
      <button type="button" class="secondary-btn open-tutor-btn" data-tutor-prompt="Resume esta lectura en un par de frases." data-support-mode="explain" data-tutor-transcript="${escapeHtml(readingTranscript)}" data-tutor-vocabulary="${escapeHtml(readingVocabWords)}">Resumir con Tutor IA</button>
      <button type="button" class="secondary-btn open-tutor-btn" data-tutor-prompt="Dame una pista para responder las preguntas de comprensión, sin darme la respuesta." data-support-mode="hint" data-tutor-transcript="${escapeHtml(readingTranscript)}">Pedir pista</button>
      <button type="button" class="secondary-btn open-tutor-btn" data-tutor-prompt="Crea otra pregunta de comprensión sobre este texto." data-support-mode="practice" data-tutor-transcript="${escapeHtml(readingTranscript)}">Crear otra pregunta</button>
      <button type="button" class="secondary-btn open-translator-btn" data-translate-text="${escapeHtml(readingTranscript)}" data-return-label="Volver a Reading">Traducir este texto</button>
      <button type="button" class="primary-btn reading-print-btn">Descargar PDF</button>
    </div>
  `;

  // Re-registered on every render (cheap, idempotent) so the player's
  // callbacks always point at the DOM this exact render produced, even
  // though attach() above only actually resets playback state when the
  // lesson changes. Both callbacks only ever patch existing DOM in place -
  // see updateReadingPlayerUI/updateReadingHighlight - so none of them
  // re-render or reflow the visible reading text.
  readingSpeechPlayer.setHandlers({
    onUpdate: (snap) => {
      updateReadingPlayerUI(section, snap);
      updateReadingHighlight(section, snap);
    }
  });
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
// that releases the mic, stops the MediaRecorder, stops any live
// transcription, and revokes the object URL; resetSpeakingRecorder() calls
// it and returns the UI to idle. Both are safe to call at any time,
// including when nothing is active (no-op).
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
  status: 'idle', // idle | requesting | recording | stopped | denied | unsupported
  config: { minimumSeconds: 5, targetSeconds: 30, maximumSeconds: 60, allowShortSubmission: false },
  container: null,
  // Transcription (Web Speech API) runs alongside MediaRecorder purely to
  // produce editable text for the corrector (§5) - it never replaces the
  // audio capture above, and nothing about it is ever sent anywhere itself,
  // only the resulting plain text. `recognition` is the live instance (null
  // when not listening); `transcriptEdited` stops live results from
  // clobbering text the student has started correcting by hand.
  recognition: null,
  recognitionSupported: null,
  transcript: '',
  transcriptEdited: false,
  // Tutor IA correction result for the current transcript - cleared
  // together with everything else on delete/redo/teardown.
  correction: { status: 'idle', text: '', error: '' } // idle | loading | done | error
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
  if (r.recognition) {
    try {
      r.recognition.stop();
    } catch {
      /* already stopped */
    }
    r.recognition = null;
  }
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
  r.transcript = '';
  r.transcriptEdited = false;
  r.correction = { status: 'idle', text: '', error: '' };
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

function updateSpeakingCorrectButtonState(container) {
  const r = speakingRecorder;
  const btn = container.querySelector('.speaking-correct-btn');
  if (!btn) return;
  const hasText = Boolean(r.transcript && r.transcript.trim());
  btn.disabled = !hasText || r.correction.status === 'loading';
  btn.textContent = r.correction.status === 'loading' ? 'Revisando…' : 'Revisar con Tutor IA';
}

function updateSpeakingUI(container) {
  if (!container) return;
  const r = speakingRecorder;
  const byAction = (action) => container.querySelector(`[data-recording-action="${action}"]`);
  const meetsMinimum = r.elapsedSeconds >= r.config.minimumSeconds || r.config.allowShortSubmission;

  const disabledByStatus = {
    idle: { record: false, stop: true, play: true, delete: true, redo: true },
    requesting: { record: true, stop: true, play: true, delete: true, redo: true },
    recording: { record: true, stop: false, play: true, delete: false, redo: true },
    stopped: { record: true, stop: true, play: false, delete: false, redo: false },
    denied: { record: false, stop: true, play: true, delete: true, redo: true },
    unsupported: { record: true, stop: true, play: true, delete: true, redo: true }
  };
  const d = disabledByStatus[r.status] || disabledByStatus.idle;
  ['record', 'stop', 'play', 'delete', 'redo'].forEach((action) => {
    const btn = byAction(action);
    if (btn) btn.disabled = d[action];
  });

  const statusLabels = {
    idle: 'Disponible',
    requesting: 'Preparando micrófono…',
    recording: 'Grabando…',
    stopped: 'Listo para escuchar',
    denied: 'No se pudo acceder al micrófono. Puedes escribir tu respuesta en el cuadro de texto.',
    unsupported: 'Tu navegador no admite grabación de audio. Escribe tu respuesta en el cuadro de texto.'
  };
  const statusEl = container.querySelector('.speaking-record-status');
  if (statusEl) statusEl.textContent = statusLabels[r.status] || '';

  const timerEl = container.querySelector('.speaking-record-timer');
  if (timerEl) {
    timerEl.hidden = r.status === 'idle' || r.status === 'unsupported' || r.status === 'denied';
    timerEl.textContent = `${formatSpeakingTime(r.elapsedSeconds)} / ${formatSpeakingTime(r.config.targetSeconds)} (máx. ${formatSpeakingTime(r.config.maximumSeconds)})`;
  }

  const warningEl = container.querySelector('.speaking-record-warning');
  if (warningEl) {
    const showWarning = r.status === 'stopped' && !meetsMinimum;
    warningEl.hidden = !showWarning;
    if (showWarning) {
      warningEl.textContent = `Tu respuesta es muy corta. Intenta hablar al menos ${r.config.minimumSeconds} segundos.`;
    }
  }

  // Only overwrite the textarea from live recognition results while the
  // student isn't actively focused on/editing it - never fight their cursor.
  const transcriptEl = container.querySelector('.speaking-transcript');
  if (transcriptEl && document.activeElement !== transcriptEl && transcriptEl.value !== r.transcript) {
    transcriptEl.value = r.transcript;
  }

  updateSpeakingCorrectButtonState(container);
}

// Runs alongside MediaRecorder (never instead of it) purely to get an
// editable text transcript for the corrector - see §5 of the Speaking
// redesign spec. Only the resulting text ever leaves the browser; this is
// the same browser API (and the same trust boundary) as the Tutor prompt's
// startTutorDictation() elsewhere in this file, just feeding a different
// textarea. If unsupported, the recording/playback flow is entirely
// unaffected - the student just types (or corrects) the transcript by hand.
function startSpeakingTranscription(container) {
  const r = speakingRecorder;
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    r.recognitionSupported = false;
    return;
  }
  r.recognitionSupported = true;
  r.transcript = '';
  r.transcriptEdited = false;

  const recognition = new Ctor();
  recognition.lang = getPronunciationLocale(learningPathState.language);
  recognition.continuous = true;
  recognition.interimResults = true;

  let finalText = '';
  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) finalText += `${result[0].transcript} `;
      else interim += result[0].transcript;
    }
    if (!r.transcriptEdited) {
      r.transcript = `${finalText}${interim}`.trim();
      updateSpeakingUI(container);
    }
  };
  recognition.onerror = () => {
    /* Silent degrade to manual entry - the audio recording is unaffected. */
  };
  recognition.onend = () => {
    if (r.recognition === recognition) r.recognition = null;
  };

  try {
    recognition.start();
    r.recognition = recognition;
  } catch {
    r.recognitionSupported = false;
  }
}

function stopSpeakingTranscription() {
  const r = speakingRecorder;
  if (r.recognition) {
    try {
      r.recognition.stop();
    } catch {
      /* already stopped */
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
  r.correction = { status: 'idle', text: '', error: '' };

  recorder.addEventListener('dataavailable', (event) => {
    if (event.data && event.data.size > 0) r.recordedChunks.push(event.data);
  });
  recorder.addEventListener('stop', () => {
    r.audioBlob = new Blob(r.recordedChunks, { type: r.mimeType });
    r.audioUrl = URL.createObjectURL(r.audioBlob);
    r.stream?.getTracks().forEach((track) => track.stop());
    r.stream = null;
    r.status = 'stopped';
    stopSpeakingTranscription();
    updateSpeakingUI(container);
  });

  recorder.start();
  r.status = 'recording';
  startSpeakingTranscription(container);
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
  stopSpeakingTranscription();
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

// Best-effort pull of just the corrected phrase out of the corrector's
// reply, so "Escuchar modelo" doesn't read labels like "Casi correcta"
// aloud - falls back to the full (already short, ≤50-word for A1-A2) text
// when neither pattern matches.
function extractCorrectedPhrase(text) {
  const patterns = [/Repite:\s*[""]?([^"\n"]+)[""]?/i, /Corrección:\s*[""]?([^"\n"]+)[""]?/i];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return text;
}

// Model-phrase audio for the correction card (§14): tries the same real
// neural-voice backend the AI Tutor's own voice controls already use
// (/api/speech/synthesize - OpenAI/ElevenLabs, gated by sign-in plus the
// existing free-tier voice quota - see voiceAccessService.js), then falls
// back to the browser's speechSynthesis. Always uses
// getPronunciationLocale(targetLanguage), never the interface/bridge
// language's voice. Azure Speech is intentionally NOT wired up here (no
// credentials/authorization) - this is the one slot it would occupy later,
// ahead of the speechSynthesis fallback.
async function playModelPhrase(text, locale) {
  if (!text) return;
  try {
    const response = await fetch(`${backendBaseUrl}/api/speech/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        text,
        language: learningPathState.language,
        locale,
        speed: 'normal',
        turnIndex: 1
      })
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.mode === 'neural' && data.audioBase64) {
      const audio = new Audio(`data:${data.mimeType || 'audio/mpeg'};base64,${data.audioBase64}`);
      await audio.play();
      return;
    }
  } catch {
    /* fall through to speechSynthesis */
  }
  speakText(text, {
    locale,
    rate: getDefaultPronunciationRate(learningPathState.language, learningPathState.level)
  });
}

// Marks a Speaking activity done the first time it earns a correction - "at
// least one valid attempt", never a perfect answer (§15). Reuses the same
// /api/lessons/:slug/complete endpoint and success-handling every other
// skill already goes through (updateProgressDisplay/gamification/XP toast);
// guests simply don't persist progress, same as the rest of the app. Only
// completed/attempts-implicit/XP/date are ever sent - no audio, no
// transcript.
async function completeSpeakingActivity(lesson) {
  if (!lesson || lesson.completed || !authStatus.session?.access_token) return;
  try {
    const response = await fetch(`${backendBaseUrl}/api/lessons/${lesson.slug}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ answers: [] })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'No se pudo guardar tu progreso.');
    lesson.completed = true;
    updateProgressDisplay(data, true);
    window.AndergoGamification?.recordLessonCompletion({
      slug: lesson.slug,
      language: learningPathState.language,
      score: data.score ?? 100,
      xpReward: lesson.xpReward || 20
    });
    window.AndergoGamification?.syncFromServer(data);
    showHomeToast(`Actividad completada. +${data.earnedXp || lesson.xpReward || 20} XP`);
    celebrateActivityCompletion();
  } catch (error) {
    console.warn('No se pudo guardar el progreso de Speaking', error);
  }
}

function renderSpeakingCorrectionResult(container, lesson, text) {
  const resultEl = container.querySelector('.speaking-correction-result');
  if (!resultEl) return;
  const locale = getPronunciationLocale(learningPathState.language);
  const modelPhrase = extractCorrectedPhrase(text);
  resultEl.hidden = false;
  resultEl.innerHTML = `
    <div class="speaking-correction-card">
      <p class="speaking-correction-text">${escapeHtml(text).replace(/\n/g, '<br>')}</p>
      <div class="speaking-correction-actions">
        <button type="button" class="secondary-btn speaking-listen-model-btn">🔊 Escuchar modelo</button>
        <button type="button" class="secondary-btn speaking-retry-btn">↻ Volver a intentarlo</button>
      </div>
    </div>
  `;
  resultEl.querySelector('.speaking-listen-model-btn')?.addEventListener('click', () => {
    playModelPhrase(modelPhrase, locale);
  });
  resultEl.querySelector('.speaking-retry-btn')?.addEventListener('click', () => {
    redoSpeakingRecording(container);
  });
}

// Sends only the transcribed TEXT (never audio - §5/§12) to the Tutor IA's
// speaking-correction task. Payload is deliberately narrow (§10): no full
// unit/lesson content, no whole Tutor history - just this activity's own
// situation/turn/response plus the last couple of conversation turns.
async function requestSpeakingCorrection(container, lesson, context = {}) {
  const r = speakingRecorder;
  const transcript = (r.transcript || '').trim();
  if (!transcript) return;

  r.correction = { status: 'loading', text: '', error: '' };
  updateSpeakingUI(container);

  const resultEl = container.querySelector('.speaking-correction-result');
  if (resultEl) {
    resultEl.hidden = false;
    resultEl.innerHTML = '<p class="speaking-correction-loading">Revisando tu respuesta…</p>';
  }

  const payload = {
    task: 'speaking_correction',
    language: learningPathState.language,
    bridgeLanguage: learningPathState.bridgeLanguage,
    level: learningPathState.level,
    skill: 'speaking',
    unitId: lesson?.unitId || '',
    lessonId: lesson?.slug || '',
    activityType: context.activityType || 'free_response',
    situation: (context.situation || '').slice(0, 400),
    prompt: (context.prompt || '').slice(0, 400),
    studentResponse: transcript.slice(0, 800),
    conversationHistory: (context.conversationHistory || []).slice(-3).map((turn) => ({
      role: turn.role === 'tutor' ? 'tutor' : 'student',
      content: String(turn.content || '').slice(0, 300)
    }))
  };

  let fullText = '';
  try {
    const response = await fetch(`${backendBaseUrl}/api/ai/tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    });
    if (!response.ok || !response.body) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'No se pudo conectar con el Tutor IA.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let sawError = null;
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
        const parsed = JSON.parse(line.slice(6));
        if (parsed.delta) fullText += parsed.delta;
        if (parsed.error) sawError = parsed.message;
      }
    }
    if (sawError) throw new Error(sawError);
    if (!fullText.trim()) throw new Error('El Tutor IA no devolvió una corrección.');

    r.correction = { status: 'done', text: fullText.trim(), error: '' };
    renderSpeakingCorrectionResult(container, lesson, fullText.trim());
    completeSpeakingActivity(lesson);
  } catch (error) {
    r.correction = {
      status: 'error',
      text: '',
      error: error.message || 'No se pudo revisar tu respuesta.'
    };
    if (resultEl) {
      resultEl.innerHTML = `<p class="speaking-correction-error" role="alert">${escapeHtml(error.message || 'No se pudo revisar tu respuesta. Intenta de nuevo.')}</p>`;
    }
  }
  updateSpeakingUI(container);
}

// Shared building block reused by every Speaking mode (Práctica guiada,
// Diálogos, Respuesta libre): record/stop/play/delete/redo, an always-
// editable transcript textarea (auto-filled by Web Speech API results when
// available, plain manual entry otherwise - §5/§6), and the "Revisar con
// Tutor IA" correction action + result card. One instance is ever wired at
// a time (speakingRecorder.container), matching the single-recorder-at-once
// assumption the rest of this feature already relies on.
function renderSpeakingRecorderHtml() {
  return `
    <div class="speaking-recorder-block">
      <div class="speaking-record-row" role="group" aria-label="Grabación de voz">
        <button type="button" class="speaking-record-btn" data-recording-action="record" aria-label="Grabar respuesta">🎙 Grabar</button>
        <button type="button" class="speaking-record-btn" data-recording-action="stop" aria-label="Detener grabación">■ Detener</button>
        <button type="button" class="speaking-record-btn" data-recording-action="play" aria-label="Escuchar mi voz">▶ Escuchar</button>
        <button type="button" class="speaking-record-btn" data-recording-action="delete" aria-label="Eliminar grabación">🗑 Eliminar</button>
        <button type="button" class="speaking-record-btn" data-recording-action="redo" aria-label="Volver a grabar">↻ Volver a grabar</button>
      </div>
      <p class="speaking-record-status" aria-live="polite"></p>
      <p class="speaking-record-timer" hidden></p>
      <p class="speaking-record-warning" role="alert" hidden></p>
      <div class="speaking-transcript-block">
        <label class="speaking-transcript-label" for="speakingTranscript">Esto fue lo que entendimos:</label>
        <textarea id="speakingTranscript" class="speaking-transcript" rows="3" placeholder="Escribe o corrige aquí lo que dijiste…" aria-label="Transcripción de tu respuesta, editable"></textarea>
        <p class="speaking-transcript-hint">Corrige una palabra, completa lo que no se reconoció, o vuelve a grabar antes de enviarlo.</p>
      </div>
      <div class="speaking-actions">
        <button type="button" class="primary-btn speaking-correct-btn" disabled>Revisar con Tutor IA</button>
      </div>
      <div class="speaking-correction-result" aria-live="polite" hidden></div>
      <p class="speaking-privacy-note">Tu grabación se procesa temporalmente y no se conserva. Puedes revisar el texto antes de enviarlo al Tutor IA.</p>
    </div>
  `;
}

function wireSpeakingRecorderControls(container, lesson, context) {
  speakingRecorder.container = container;
  updateSpeakingUI(container);

  container.querySelector('[data-recording-action="record"]')?.addEventListener('click', () => {
    startSpeakingRecording(container);
  });
  container.querySelector('[data-recording-action="stop"]')?.addEventListener('click', () => {
    stopSpeakingRecording();
  });
  container.querySelector('[data-recording-action="play"]')?.addEventListener('click', () => {
    playSpeakingRecording();
  });
  container.querySelector('[data-recording-action="delete"]')?.addEventListener('click', () => {
    deleteSpeakingRecording(container);
  });
  container.querySelector('[data-recording-action="redo"]')?.addEventListener('click', () => {
    redoSpeakingRecording(container);
  });

  const transcriptEl = container.querySelector('.speaking-transcript');
  transcriptEl?.addEventListener('input', () => {
    speakingRecorder.transcript = transcriptEl.value;
    speakingRecorder.transcriptEdited = true;
    updateSpeakingCorrectButtonState(container);
  });

  container.querySelector('.speaking-correct-btn')?.addEventListener('click', () => {
    requestSpeakingCorrection(container, lesson, context);
  });
}

window.addEventListener('beforeunload', () => {
  teardownSpeakingResources();
});

// ---------------------------------------------------------------------
// Speaking: reorganized so Dialogues live inside it instead of as their own
// top-level skill/nav destination (see the removed #dialogue section/
// SKILL_VIEWS entry). Three modes share the recorder block above:
//   - guided: turn-by-turn walkthrough of the unit's dialogue lines.
//   - dialogue: Écouter/Escuchar + Jouer un rôle/Interpretar un papel,
//     migrated from the old standalone Dialogue view.
//   - free: the original open speaking prompt.
// Dialogue content comes from the sibling `dialogue`-skill lesson in the
// same unit when one exists (French A1's 12 standalone dialogue
// activities), or falls back to this Speaking lesson's own lesson.dialogue
// array (English/Español A1) - never hardcoded in this component.
// ---------------------------------------------------------------------

function playDialogueLinesSequentially(lines, locale, rate, index = 0) {
  if (index >= lines.length) return;
  speakText(lines[index], {
    locale,
    rate,
    onEnd: () => playDialogueLinesSequentially(lines, locale, rate, index + 1)
  });
}

// Per-lesson UI-only state for which Speaking mode/turn is showing - reset
// whenever a different lesson is opened (see renderSpeakingView).
let speakingViewState = { lessonSlug: '', mode: 'guided', guidedTurnIndex: 0 };

function getSpeakingDialogueSource(lesson) {
  const sibling = learningPathState.lessons.find(
    (item) => item.unitId && item.unitId === lesson.unitId && item.skill === 'dialogue'
  );
  const source = sibling || lesson;
  return {
    // sourceLesson (not necessarily `lesson` itself) is what comprehension
    // exercises actually belong to - renderLessonExercise tags each mcq
    // with this lesson's own slug so answers grade against the right row
    // (POST /api/lessons/:slug/check-answer), not the Speaking activity's.
    sourceLesson: source,
    lines: source.dialogue || [],
    situacion: source.intro || source.description || lesson.mission || lesson.intro || '',
    phrases: source.phrases?.length ? source.phrases : lesson.phrases || [],
    exercises: source.exercises || []
  };
}

function renderSpeakingModeTabsHtml(activeMode) {
  const modes = [
    { id: 'guided', label: '🧭 Práctica guiada' },
    { id: 'dialogue', label: '💬 Diálogos' },
    { id: 'free', label: '🗣 Respuesta libre' }
  ];
  return `
    <div class="speaking-mode-tabs" role="group" aria-label="Modos de Speaking">
      ${modes
        .map(
          (mode) =>
            `<button type="button" class="secondary-btn speaking-mode-btn${mode.id === activeMode ? ' is-active' : ''}" data-speaking-mode="${mode.id}" aria-pressed="${mode.id === activeMode}">${mode.label}</button>`
        )
        .join('')}
    </div>
  `;
}

// Turn-by-turn walkthrough (§3.A): the first distinct speaker plays as the
// tutor/character turn (auto-playable, "Continuar" advances); the second
// distinct speaker is treated as the student's turn and gets the shared
// recorder block. Kept short by construction - it just replays however many
// turns the unit's own dialogue already has (3-7 for A1 content), never
// invented here.
function renderGuidedPracticeHtml(lesson, dialogueSource) {
  const lines = dialogueSource.lines;
  if (!lines.length) {
    return `<p class="skill-graph-empty">Todavía no hay un diálogo guiado para esta unidad.</p>`;
  }
  const participants = [...new Set(lines.map((line) => line.speaker).filter(Boolean))];
  const studentRole = participants[1] || participants[0];
  const turnIndex = Math.min(speakingViewState.guidedTurnIndex, lines.length - 1);
  const turn = lines[turnIndex];
  const isStudentTurn = turn.speaker === studentRole && participants.length > 1;
  const progressLabel = `Turno ${turnIndex + 1} de ${lines.length}`;

  const historyHtml = lines
    .slice(0, turnIndex)
    .map(
      (line) =>
        `<li class="dialogue-line dialogue-line--done"><span class="dialogue-speaker">${escapeHtml(line.speaker || '')}</span><span class="dialogue-text">${escapeHtml(line.line || '')}</span></li>`
    )
    .join('');

  return `
    <p class="speaking-situation"><strong>Situación:</strong> ${escapeHtml(dialogueSource.situacion)}</p>
    <p class="speaking-guided-progress">${escapeHtml(progressLabel)}</p>
    ${historyHtml ? `<ul class="dialogue-lines-list dialogue-lines-list--history">${historyHtml}</ul>` : ''}
    <div class="speaking-guided-turn">
      <span class="dialogue-speaker">${escapeHtml(turn.speaker || '')}${isStudentTurn ? ' (tú)' : ''}</span>
      <p class="speaking-guided-turn-text">${escapeHtml(turn.line || '')}</p>
      ${supportsSpeech() ? `<button type="button" class="secondary-btn speaking-guided-listen-btn">🔊 Escuchar</button>` : ''}
    </div>
    ${
      isStudentTurn
        ? renderSpeakingRecorderHtml() +
          `<div class="speaking-guided-actions"><button type="button" class="secondary-btn speaking-guided-next-btn" ${turnIndex >= lines.length - 1 ? 'hidden' : ''}>Continuar diálogo →</button></div>`
        : `<div class="speaking-guided-actions"><button type="button" class="primary-btn speaking-guided-next-btn" ${turnIndex >= lines.length - 1 ? 'hidden' : ''}>Continuar →</button></div>`
    }
  `;
}

function wireGuidedPracticeMode(content, lesson, dialogueSource) {
  const lines = dialogueSource.lines;
  if (!lines.length) return;
  const participants = [...new Set(lines.map((line) => line.speaker).filter(Boolean))];
  const studentRole = participants[1] || participants[0];
  const turnIndex = Math.min(speakingViewState.guidedTurnIndex, lines.length - 1);
  const turn = lines[turnIndex];
  const isStudentTurn = turn.speaker === studentRole && participants.length > 1;
  const locale = getPronunciationLocale(learningPathState.language);
  const rate = getDefaultPronunciationRate();

  content.querySelector('.speaking-guided-listen-btn')?.addEventListener('click', () => {
    speakText(turn.line, { locale, rate });
  });

  if (isStudentTurn) {
    const priorTurns = lines.slice(Math.max(0, turnIndex - 3), turnIndex).map((line) => ({
      role: line.speaker === studentRole ? 'student' : 'tutor',
      content: line.line
    }));
    resetSpeakingRecorder();
    wireSpeakingRecorderControls(content, lesson, {
      activityType: 'guided_dialogue',
      situation: dialogueSource.situacion,
      prompt: turn.line,
      conversationHistory: priorTurns
    });
  }

  content.querySelector('.speaking-guided-next-btn')?.addEventListener('click', () => {
    speakingViewState.guidedTurnIndex = Math.min(turnIndex + 1, lines.length - 1);
    renderSpeakingModeContent(content.closest('.skill-view-content'), lesson);
  });
}

// Diálogos cotidianos (§2/§3.B): Écouter (sequential + per-line playback,
// translation toggle) and Jouer un rôle (pick a character; the other role's
// lines play back as scripted audio/text - not a live AI improvisation, see
// the redesign report's noted limitation; the student's own lines now get
// the full record/transcribe/correct block instead of a plain textarea).
function renderDialogueModeHtml(dialogueSource) {
  const lines = dialogueSource.lines;
  const participants = [...new Set(lines.map((line) => line.speaker).filter(Boolean))];
  const canSpeak = supportsSpeech();

  if (!lines.length) {
    return `<p class="speaking-situation"><strong>Situación:</strong> ${escapeHtml(dialogueSource.situacion)}</p><p class="skill-graph-empty">Todavía no hay un diálogo de ejemplo para esta unidad.</p>`;
  }

  const linesHtml = lines
    .map(
      (line, index) => `
      <li class="dialogue-line" data-index="${index}">
        <span class="dialogue-speaker">${escapeHtml(line.speaker || '')}</span>
        <span class="dialogue-text">${escapeHtml(line.line || '')}</span>
        ${canSpeak ? `<button type="button" class="dialogue-line-speak-btn" data-speak-text="${escapeHtml(line.line || '')}" aria-label="Escuchar esta línea" title="Escuchar">🔊</button>` : ''}
        ${line.translation ? `<span class="dialogue-translation reading-vocab-support" hidden>${escapeHtml(line.translation)}</span>` : ''}
      </li>`
    )
    .join('');

  const roleOptionsHtml = participants
    .map(
      (name) =>
        `<button type="button" class="secondary-btn dialogue-role-btn" data-role="${escapeHtml(name)}">${escapeHtml(name)}</button>`
    )
    .join('');

  const exercisesHtml = (dialogueSource.exercises || [])
    .filter((item) => item.type === 'mcq')
    .map((item, index) => renderLessonExercise(item, index, dialogueSource.sourceLesson))
    .join('');

  return `
    <p class="dialogue-situation"><strong>Situación:</strong> ${escapeHtml(dialogueSource.situacion)}</p>
    <div class="dialogue-modes" role="group" aria-label="Modos del diálogo">
      <button type="button" class="secondary-btn dialogue-mode-btn is-active" data-mode="listen">🎧 Escuchar</button>
      <button type="button" class="secondary-btn dialogue-mode-btn" data-mode="roleplay">🎭 Interpretar un papel</button>
    </div>
    <div class="dialogue-panel dialogue-listen-panel">
      ${canSpeak ? `<button type="button" class="primary-btn dialogue-play-all-btn">▶ Escuchar todo el diálogo</button>` : ''}
      <ul class="dialogue-lines-list">${linesHtml}</ul>
      ${lines.some((line) => line.translation) ? `<button type="button" class="secondary-btn dialogue-toggle-translation-btn">Mostrar apoyo en español</button>` : ''}
    </div>
    <div class="dialogue-panel dialogue-roleplay-panel" hidden>
      <p>Elige tu personaje:</p>
      <div class="dialogue-role-options">${roleOptionsHtml}</div>
      <ul class="dialogue-roleplay-lines"></ul>
    </div>
    ${
      dialogueSource.phrases?.length
        ? `<div class="dialogue-phrases"><strong>Vocabulario útil</strong><ul>${dialogueSource.phrases.map((phrase) => `<li>${escapeHtml(phrase)}</li>`).join('')}</ul></div>`
        : ''
    }
    ${
      exercisesHtml
        ? `<div class="reading-questions"><h4>Preguntas de comprensión</h4>${exercisesHtml}</div>`
        : ''
    }
  `;
}

function wireDialogueMode(content, lesson, dialogueSource) {
  const lines = dialogueSource.lines;
  if (!lines.length) return;
  const locale = getPronunciationLocale(learningPathState.language);
  const rate = getDefaultPronunciationRate();
  const canSpeak = supportsSpeech();

  content.querySelectorAll('.dialogue-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      content.querySelectorAll('.dialogue-mode-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
      const showListen = btn.dataset.mode === 'listen';
      content.querySelector('.dialogue-listen-panel')?.toggleAttribute('hidden', !showListen);
      content.querySelector('.dialogue-roleplay-panel')?.toggleAttribute('hidden', showListen);
    });
  });

  content.querySelector('.dialogue-play-all-btn')?.addEventListener('click', () => {
    playDialogueLinesSequentially(lines.map((line) => line.line), locale, rate);
  });

  content.querySelectorAll('.dialogue-line-speak-btn').forEach((btn) => {
    btn.addEventListener('click', () => speakText(btn.dataset.speakText, { locale, rate }));
  });

  content.querySelector('.dialogue-toggle-translation-btn')?.addEventListener('click', (event) => {
    const btn = event.currentTarget;
    const nowHidden = content.querySelector('.dialogue-translation')?.hidden;
    content.querySelectorAll('.dialogue-translation').forEach((el) => {
      el.hidden = !nowHidden;
    });
    btn.textContent = nowHidden ? 'Ocultar apoyo en español' : 'Mostrar apoyo en español';
  });

  content.querySelectorAll('.dialogue-role-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      content.querySelectorAll('.dialogue-role-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
      const myRole = btn.dataset.role;
      const list = content.querySelector('.dialogue-roleplay-lines');
      if (!list) return;

      // Rebuilding the list below would otherwise orphan a live
      // "Responder oralmente" recorder if one was mounted for the
      // previously chosen character - release it first.
      resetSpeakingRecorder();

      list.innerHTML = lines
        .map((line, index) => {
          const isMine = line.speaker === myRole;
          if (!isMine) {
            return `
              <li class="dialogue-line">
                <span class="dialogue-speaker">${escapeHtml(line.speaker || '')}</span>
                <span class="dialogue-text">${escapeHtml(line.line || '')}</span>
                ${canSpeak ? `<button type="button" class="dialogue-line-speak-btn" data-speak-text="${escapeHtml(line.line || '')}" aria-label="Escuchar esta línea">🔊</button>` : ''}
              </li>`;
          }
          return `
            <li class="dialogue-line dialogue-line--mine" data-index="${index}">
              <span class="dialogue-speaker">${escapeHtml(line.speaker || '')} (tú)</span>
              <p class="dialogue-model-line" hidden>${escapeHtml(line.line || '')}</p>
              <button type="button" class="secondary-btn dialogue-show-model-btn">Ver el modelo</button>
              <button type="button" class="secondary-btn dialogue-respond-btn" data-index="${index}">🎙 Responder oralmente</button>
              <div class="dialogue-respond-block" hidden></div>
            </li>`;
        })
        .join('');

      list.querySelectorAll('.dialogue-line-speak-btn').forEach((speakBtn) => {
        speakBtn.addEventListener('click', () => speakText(speakBtn.dataset.speakText, { locale, rate }));
      });
      list.querySelectorAll('.dialogue-show-model-btn').forEach((modelBtn) => {
        modelBtn.addEventListener('click', () => {
          const modelLine = modelBtn.previousElementSibling;
          if (modelLine) modelLine.hidden = !modelLine.hidden;
        });
      });
      // "Responder oralmente" lazily mounts the shared recorder block into
      // this specific line's own slot, the first time it's clicked, so
      // switching characters never leaves multiple live recorders wired at
      // once (only the most recently mounted one is ever active - matches
      // speakingRecorder's single-instance assumption).
      list.querySelectorAll('.dialogue-respond-btn').forEach((respondBtn) => {
        respondBtn.addEventListener('click', () => {
          const li = respondBtn.closest('.dialogue-line--mine');
          const block = li?.querySelector('.dialogue-respond-block');
          if (!block) return;

          // Only one "Responder oralmente" recorder is ever mounted at a
          // time - collapsing any other already-open one first avoids two
          // live copies of the shared recorder block (duplicate ids,
          // stale button handlers still pointing at a container that's no
          // longer speakingRecorder.container) if the student answers more
          // than one line in the same roleplay pass.
          resetSpeakingRecorder();
          list.querySelectorAll('.dialogue-respond-block:not([hidden])').forEach((openBlock) => {
            openBlock.hidden = true;
            openBlock.innerHTML = '';
          });
          list.querySelectorAll('.dialogue-respond-btn[hidden]').forEach((hiddenBtn) => {
            hiddenBtn.hidden = false;
          });

          const lineIndex = Number(respondBtn.dataset.index);
          const priorTurns = lines.slice(Math.max(0, lineIndex - 3), lineIndex).map((l) => ({
            role: l.speaker === myRole ? 'student' : 'tutor',
            content: l.line
          }));
          block.hidden = false;
          block.innerHTML = renderSpeakingRecorderHtml();
          wireSpeakingRecorderControls(block, lesson, {
            activityType: 'roleplay',
            situation: dialogueSource.situacion,
            prompt: lines[lineIndex]?.line || '',
            conversationHistory: priorTurns
          });
          respondBtn.hidden = true;
        });
      });
    });
  });
}

// Respuesta libre (§13's original flow): the open speaking prompt this
// section always had, now feeding the shared recorder/transcript/correction
// block instead of the old plain textarea + audio-upload button.
function renderFreeResponseHtml(lesson) {
  const situacion = lesson.mission || lesson.intro || lesson.description || '';
  const fraseModelo = lesson.dialogue?.[0]?.line || lesson.phrases?.[0] || '';
  return `
    <p class="speaking-situation"><strong>Situación:</strong> ${escapeHtml(situacion)}</p>
    ${fraseModelo ? `<p class="speaking-model"><strong>Frase o turno del Tutor:</strong> ${escapeHtml(fraseModelo)}</p>` : ''}
    ${
      lesson.phrases?.length
        ? `<div class="dialogue-phrases"><strong>Vocabulario útil</strong><ul>${lesson.phrases.map((phrase) => `<li>${escapeHtml(phrase)}</li>`).join('')}</ul></div>`
        : ''
    }
    ${renderSpeakingRecorderHtml()}
  `;
}

function wireFreeResponseMode(content, lesson) {
  const situacion = lesson.mission || lesson.intro || lesson.description || '';
  const fraseModelo = lesson.dialogue?.[0]?.line || lesson.phrases?.[0] || '';
  resetSpeakingRecorder();
  wireSpeakingRecorderControls(content, lesson, {
    activityType: 'free_response',
    situation: situacion,
    prompt: fraseModelo,
    conversationHistory: []
  });
}

// Renders whichever mode is active into #speakingStage without touching the
// mode tabs or the lesson header - called on first render and again every
// time the student switches modes or advances a guided-practice turn.
function renderSpeakingModeContent(content, lesson) {
  const stage = content.querySelector('#speakingStage');
  if (!stage) return;
  // Rebuilding the stage's innerHTML below would otherwise orphan a live
  // MediaRecorder/mic stream or Web Speech recognition instance if the
  // student switches modes (or advances a guided-practice turn) mid-
  // recording - always release it first, exactly like navigating away from
  // Speaking entirely already does.
  resetSpeakingRecorder();
  const dialogueSource = getSpeakingDialogueSource(lesson);

  content.querySelectorAll('.speaking-mode-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.speakingMode === speakingViewState.mode);
    btn.setAttribute('aria-pressed', String(btn.dataset.speakingMode === speakingViewState.mode));
  });

  if (speakingViewState.mode === 'dialogue') {
    stage.innerHTML = renderDialogueModeHtml(dialogueSource);
    wireDialogueMode(stage, lesson, dialogueSource);
  } else if (speakingViewState.mode === 'free') {
    stage.innerHTML = renderFreeResponseHtml(lesson);
    wireFreeResponseMode(stage, lesson);
  } else {
    stage.innerHTML = renderGuidedPracticeHtml(lesson, dialogueSource);
    wireGuidedPracticeMode(stage, lesson, dialogueSource);
  }
}

function renderSpeakingView(section, lesson) {
  const content = section.querySelector('.skill-view-content');
  if (!content) return;
  resetSpeakingRecorder();

  if (speakingViewState.lessonSlug !== lesson.slug) {
    speakingViewState = { lessonSlug: lesson.slug, mode: 'guided', guidedTurnIndex: 0 };
  }

  const taskConfig = {
    minimumSeconds: 5,
    targetSeconds: 30,
    maximumSeconds: 60,
    allowShortSubmission: false,
    ...(lesson.speakingTask || {})
  };
  speakingRecorder.config = taskConfig;

  content.innerHTML = `
    <h3>${escapeHtml(lesson.title)}</h3>
    ${renderSpeakingModeTabsHtml(speakingViewState.mode)}
    <div id="speakingStage" class="speaking-stage"></div>
    <div class="skill-view-tutor-cta">
      <button type="button" class="secondary-btn open-tutor-btn" data-tutor-prompt="Quiero practicar esta conversación de Speaking." data-support-mode="practice">Abrir Tutor IA (chat libre)</button>
      <button type="button" class="secondary-btn open-translator-btn" data-translate-text="" data-return-label="Volver a Speaking">Traducir</button>
    </div>
  `;

  content.querySelectorAll('.speaking-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      speakingViewState.mode = btn.dataset.speakingMode;
      speakingViewState.guidedTurnIndex = 0;
      renderSpeakingModeContent(content, lesson);
    });
  });

  renderSpeakingModeContent(content, lesson);
}

// Print-only Q&A worksheet shared by Grammar and Vocabulary PDFs -
// deliberately independent from the interactive .mcq-option exercises
// rendered on-screen (renderLessonExercise), so the printable answer key
// (showAnswers: true) never touches or risks the interactive component.
// Letters (A/B/C/D) are a print-worksheet convention only - the on-screen
// exercises never show them (see renderLessonExercise).
function renderPrintableExerciseList(exercises, { showAnswers = false } = {}) {
  const letters = ['A', 'B', 'C', 'D'];
  return (exercises || [])
    .filter((item) => item.type === 'mcq' && Array.isArray(item.options))
    .map((item, index) => {
      const optionsHtml = item.options
        .map((option, optIndex) => {
          const isCorrect = showAnswers && optIndex === Number(item.answer);
          return `<li class="skill-print-option${isCorrect ? ' is-correct-answer' : ''}">${letters[optIndex] || optIndex + 1}) ${escapeHtml(option)}</li>`;
        })
        .join('');
      return `
        <div class="skill-print-question">
          <p><strong>${index + 1}.</strong> ${escapeHtml(item.prompt)}</p>
          <ul class="skill-print-options">${optionsHtml}</ul>
        </div>
      `;
    })
    .join('');
}

// Shared print header/answer-space markup for Reading/Grammar/Vocabulary
// PDFs - one function instead of Reading keeping its own drifted inline
// copy, so title/language/level/unit/date/branding can never go out of
// sync between skills. `answerKey` renders the teacher/admin variant
// (correct options marked) instead of the student worksheet (blank answer
// lines) - gated by entitlements.role==='ceo' (this app's only staff/admin
// role today - see lib/entitlementsService.js) at the call site, never
// decided here. `lesson` is optional (only used to resolve the unit title).
function renderSkillPrintHeaderHtml(lesson) {
  const bridgeLabel = LanguagePair
    ? LanguagePair.languageNameIn(learningPathState.bridgeLanguage, learningPathState.bridgeLanguage)
    : languageDisplayNames[learningPathState.bridgeLanguage] || learningPathState.bridgeLanguage;
  const targetLabel = LanguagePair
    ? LanguagePair.languageNameIn(learningPathState.bridgeLanguage, learningPathState.language)
    : languageDisplayNames[learningPathState.language] || learningPathState.language;
  const unit = lesson?.unitId
    ? learningPathState.units.find((item) => item.id === lesson.unitId)
    : null;
  return `
    <div class="print-only reading-print-header skill-print-header">
      <div class="reading-print-logo skill-print-logo">ANDERGO</div>
      <p>${escapeHtml(bridgeLabel)} → ${escapeHtml(targetLabel)} · ${escapeHtml(learningPathState.level)}</p>
      ${unit?.title ? `<p class="skill-print-unit">${escapeHtml(unit.title)}</p>` : ''}
      <p class="reading-print-date">${escapeHtml(new Date().toLocaleDateString('es'))}</p>
    </div>
  `;
}

function isStaffEntitled() {
  return authStatus.entitlements?.role === 'ceo';
}

function renderGrammarView(section, lesson) {
  const content = section.querySelector('.skill-view-content');
  if (!content) return;
  // Scored Grammar test pilot (course_lessons.extra.grammarTest, see
  // lib/grammarTestSanitizer.js) - only a couple of lessons have this so
  // far; every other Grammar lesson falls through to the flat
  // inline-feedback view below, unchanged.
  if (lesson.extra?.grammarTest?.questions?.length) {
    renderGrammarTestView(content, lesson);
    return;
  }
  const example = lesson.dialogue?.[0] || lesson.vocabulary?.[0] || null;
  const exercisesHtml = (lesson.exercises || [])
    .filter((item) => item.type === 'mcq')
    .map((item, index) => renderLessonExercise(item, index, lesson))
    .join('');
  const staff = isStaffEntitled();
  const printExercisesHtml = renderPrintableExerciseList(lesson.exercises, { showAnswers: staff });

  content.innerHTML = `
    <div class="skill-print-area">
      ${renderSkillPrintHeaderHtml(lesson)}
      <h3>${escapeHtml(lesson.title)}</h3>
      <div class="grammar-explanation">
        <strong>Estructura</strong>
        <p>${escapeHtml(lesson.grammar || lesson.description || '')}</p>
      </div>
      ${
        example
          ? `
        <div class="grammar-example no-print">
          <div class="grammar-example-target"><span>Target</span><strong>${escapeHtml(example.line || example.word || '')}</strong></div>
          <div class="grammar-example-bridge"><span>Bridge</span><strong>${escapeHtml(resolveVocabTranslation(example))}</strong></div>
        </div>
      `
          : ''
      }
      <div class="grammar-exercise no-print">
        <h4>Mini ejercicio</h4>
        ${exercisesHtml || '<p class="skill-graph-empty">No hay ejercicios de gramática para esta lección.</p>'}
      </div>
      <div class="print-only">
        <h4>${staff ? 'Clave de respuestas' : 'Actividad para completar'}</h4>
        ${printExercisesHtml || '<p>No hay ejercicios para esta lección.</p>'}
        ${
          staff
            ? ''
            : `<div class="reading-print-answer-space skill-print-answer-space print-only">
                <h4>Tus respuestas</h4>
                <div class="reading-print-answer-lines"><div></div><div></div><div></div><div></div></div>
              </div>`
        }
      </div>
    </div>
    <div class="skill-view-tutor-cta no-print">
      <button type="button" class="primary-btn open-tutor-btn" data-tutor-prompt="Explícame por qué se usa esta estructura: ${escapeHtml(lesson.grammar || '')}" data-support-mode="explain" data-tutor-transcript="${escapeHtml(lesson.grammar || '')}">Explícame esta estructura</button>
      <button type="button" class="secondary-btn open-translator-btn" data-translate-text="${escapeHtml(lesson.grammar || '')}" data-return-label="Volver a Grammar">Traducir explicación</button>
      <button type="button" class="secondary-btn skill-print-btn">${staff ? 'Descargar clave de respuestas' : 'Descargar actividad en PDF'}</button>
    </div>
  `;
}

// ---------------------------------------------------------------------
// Scored Grammar test (course_lessons.extra.grammarTest - see
// lib/grammarTestSanitizer.js). State is purely local (which question
// we're on, what's been typed/picked so far) until the student submits -
// the server re-grades everything from the real answer key
// (lib/courseLessonsService.js#gradeGrammarTest), this never trusts its
// own scoring or shows a result the server didn't compute.
const grammarTestState = new Map();

function getGrammarTestRuntime(lesson) {
  let runtime = grammarTestState.get(lesson.slug);
  if (!runtime) {
    runtime = { phase: 'instructions', currentIndex: 0, answers: {}, lastResult: null };
    grammarTestState.set(lesson.slug, runtime);
  }
  return runtime;
}

// 90-100/80-89/70-79/60-69/<60 per the spec - "Necesitas practicar", never
// "reprobado", for a platform used by kids as young as ~9.
function gradeBandForScore(score) {
  if (score >= 90) return { label: 'Excelente', emoji: '🌟' };
  if (score >= 80) return { label: 'Muy bien', emoji: '👍' };
  if (score >= 70) return { label: 'Bien', emoji: '🙂' };
  if (score >= 60) return { label: 'En progreso', emoji: '💪' };
  return { label: 'Necesitas practicar', emoji: '📚' };
}

function isGrammarTestQuestionAnswered(runtime, question) {
  const value = runtime.answers[question.id];
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0 && value.length === (question.items || []).length;
  return String(value).trim().length > 0;
}

function renderGrammarTestView(content, lesson) {
  const test = lesson.extra.grammarTest;
  const runtime = getGrammarTestRuntime(lesson);
  if (runtime.phase === 'question') {
    content.innerHTML = renderGrammarTestQuestionHtml(lesson, test, runtime);
  } else if (runtime.phase === 'review') {
    content.innerHTML = renderGrammarTestReviewHtml(lesson, test, runtime);
  } else if (runtime.phase === 'results') {
    content.innerHTML = renderGrammarTestResultsHtml(lesson, test, runtime);
  } else {
    content.innerHTML = renderGrammarTestInstructionsHtml(lesson, test, runtime);
  }
}

function renderGrammarTestInstructionsHtml(lesson, test) {
  const total = test.questions.length;
  return `
    <div class="grammar-test-card card-enter">
      <h3>${escapeHtml(lesson.title)}</h3>
      <p class="grammar-test-instructions-text">${escapeHtml(lesson.description || 'Responde el test para poner a prueba lo que aprendiste en esta lección.')}</p>
      <ul class="grammar-test-meta-list">
        <li>📝 ${total} preguntas</li>
        <li>🎯 Aprobación recomendada: ${test.passingScore || 70}/100</li>
        ${lesson.bestScore != null ? `<li>🏆 Mejor puntuación: ${lesson.bestScore}/100</li>` : ''}
      </ul>
      <button type="button" class="primary-btn hover-lift btn-press grammar-test-start-btn">Comenzar prueba</button>
    </div>
  `;
}

function renderGrammarTestQuestionHtml(lesson, test, runtime) {
  const total = test.questions.length;
  const index = Math.min(runtime.currentIndex, total - 1);
  const question = test.questions[index];
  const pct = Math.round(((index + 1) / total) * 100);
  const isLast = index === total - 1;

  return `
    <div class="grammar-test-card card-enter">
      <div class="grammar-test-progress-row">
        <span class="grammar-test-counter">Pregunta ${index + 1} de ${total}</span>
        <div class="grammar-test-progress-bar"><div class="progress-fill-animated" style="width:${pct}%"></div></div>
      </div>
      <p class="grammar-test-question-prompt">${escapeHtml(question.prompt)}</p>
      ${renderGrammarTestQuestionBodyHtml(question, runtime)}
      <div class="grammar-test-nav-row">
        <button type="button" class="secondary-btn hover-lift btn-press grammar-test-prev-btn" ${index === 0 ? 'disabled' : ''}>Anterior</button>
        <button type="button" class="primary-btn hover-lift btn-press grammar-test-next-btn">${isLast ? 'Revisar' : 'Siguiente'}</button>
      </div>
    </div>
  `;
}

function renderGrammarTestQuestionBodyHtml(question, runtime) {
  const saved = runtime.answers[question.id];

  if (question.type === 'mcq') {
    const optionsHtml = (question.options || [])
      .map((opt) => {
        const isSelected = saved != null && String(saved) === String(opt.id);
        return `<button type="button" class="grammar-test-option${isSelected ? ' is-selected' : ''}" data-option-id="${escapeHtml(opt.id)}">${escapeHtml(opt.text)}</button>`;
      })
      .join('');
    return `<div class="grammar-test-options">${optionsHtml}</div>`;
  }

  if (question.type === 'fill_blank') {
    return `
      <div class="grammar-test-fill-wrap">
        <input type="text" class="grammar-test-fill-input" value="${escapeHtml(saved || '')}" autocomplete="off" placeholder="Escribe tu respuesta" />
      </div>
    `;
  }

  if (question.type === 'ordering') {
    const savedOrder = Array.isArray(saved) ? saved : [];
    const itemCount = (question.items || []).length;
    const itemsHtml = (question.items || [])
      .map((item) => {
        const savedPosition = savedOrder.indexOf(item.id) + 1; // 0 if not picked yet
        const positionOptionsHtml = Array.from({ length: itemCount }, (_, i) => i + 1)
          .map(
            (position) =>
              `<option value="${position}" ${position === savedPosition ? 'selected' : ''}>${position}</option>`
          )
          .join('');
        return `
          <li class="grammar-test-order-item">
            <select class="grammar-test-order-select" data-item-id="${escapeHtml(item.id)}" aria-label="Posición de ${escapeHtml(item.text)}">
              <option value="" ${savedPosition === 0 ? 'selected' : ''}>#</option>
              ${positionOptionsHtml}
            </select>
            <span>${escapeHtml(item.text)}</span>
          </li>
        `;
      })
      .join('');
    return `<ol class="grammar-test-order-list">${itemsHtml}</ol>`;
  }

  return '';
}

// Reads whatever is currently on screen for the active question straight
// out of the DOM and stores it into runtime.answers - called right before
// every navigation (prev/next/review), so nothing is lost moving between
// questions without needing a live input/change listener on every field.
function collectGrammarTestAnswer(content, test, runtime) {
  const question = test.questions[runtime.currentIndex];
  if (!question) return;

  if (question.type === 'mcq') {
    const selected = content.querySelector('.grammar-test-option.is-selected');
    if (selected) {
      runtime.answers[question.id] = selected.dataset.optionId;
    } else {
      delete runtime.answers[question.id];
    }
    return;
  }

  if (question.type === 'fill_blank') {
    const value = content.querySelector('.grammar-test-fill-input')?.value.trim() || '';
    if (value) runtime.answers[question.id] = value;
    else delete runtime.answers[question.id];
    return;
  }

  if (question.type === 'ordering') {
    const picks = [...content.querySelectorAll('.grammar-test-order-select')].map((select) => ({
      itemId: select.dataset.itemId,
      position: Number(select.value)
    }));
    const complete = picks.length > 0 && picks.every((p) => p.position);
    const positions = picks.map((p) => p.position);
    const noDuplicates = new Set(positions).size === positions.length;
    if (complete && noDuplicates) {
      runtime.answers[question.id] = picks
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((p) => p.itemId);
    } else {
      delete runtime.answers[question.id];
    }
  }
}

function renderGrammarTestReviewHtml(lesson, test, runtime) {
  const itemsHtml = test.questions
    .map((question, index) => {
      const answered = isGrammarTestQuestionAnswered(runtime, question);
      return `
        <li class="grammar-test-review-item${answered ? ' is-answered' : ' is-unanswered'}">
          <span class="grammar-test-review-status" aria-hidden="true">${answered ? '✅' : '⚠️'}</span>
          <span class="grammar-test-review-prompt">${index + 1}. ${escapeHtml(question.prompt)}</span>
          <button type="button" class="secondary-btn grammar-test-review-edit-btn" data-question-index="${index}">${answered ? 'Editar' : 'Responder'}</button>
        </li>
      `;
    })
    .join('');
  const allAnswered = test.questions.every((question) => isGrammarTestQuestionAnswered(runtime, question));

  return `
    <div class="grammar-test-card card-enter">
      <h3>Revisa tus respuestas</h3>
      <p class="grammar-test-instructions-text">Puedes editar cualquier pregunta antes de enviar la prueba.</p>
      <ul class="grammar-test-review-list">${itemsHtml}</ul>
      ${!allAnswered ? '<p class="grammar-test-review-warning">Responde todas las preguntas para poder enviar la prueba.</p>' : ''}
      <div class="grammar-test-nav-row">
        <button type="button" class="secondary-btn hover-lift btn-press grammar-test-review-edit-btn" data-question-index="${test.questions.length - 1}">Volver a la última pregunta</button>
        <button type="button" class="primary-btn hover-lift btn-press grammar-test-submit-btn" ${!allAnswered ? 'disabled' : ''}>Enviar prueba</button>
      </div>
    </div>
  `;
}

function renderGrammarTestResultsHtml(lesson, test, runtime) {
  const result = runtime.lastResult;
  if (!result) {
    runtime.phase = 'instructions';
    return renderGrammarTestInstructionsHtml(lesson, test);
  }

  const band = gradeBandForScore(result.score);
  const resultsByQuestionId = new Map((result.results || []).map((r) => [String(r.questionId), r]));
  const correctCount = (result.results || []).filter((r) => r.correct).length;

  const breakdownHtml = test.questions
    .map((question, index) => {
      const r = resultsByQuestionId.get(String(question.id));
      const correct = Boolean(r?.correct);
      return `
        <li class="grammar-test-breakdown-item${correct ? ' is-correct' : ' is-incorrect'}">
          <span class="grammar-test-breakdown-icon" aria-hidden="true">${correct ? '✅' : '❌'}</span>
          <div>
            <p class="grammar-test-breakdown-prompt">${index + 1}. ${escapeHtml(question.prompt)}</p>
            ${r?.explanation ? `<p class="grammar-test-breakdown-explanation">${escapeHtml(r.explanation)}</p>` : ''}
          </div>
        </li>
      `;
    })
    .join('');

  return `
    <div class="grammar-test-card card-enter">
      <div class="grammar-test-score-band">
        <span class="grammar-test-score-emoji" aria-hidden="true">${band.emoji}</span>
        <strong class="grammar-test-score-number">${result.score}/100</strong>
        <span class="grammar-test-score-label">${band.label}</span>
      </div>
      <p class="grammar-test-score-detail">Respuestas correctas: ${correctCount} de ${test.questions.length}</p>
      <p class="grammar-test-score-detail">
        ${result.bestScore != null ? `Mejor puntuación: ${result.bestScore}/100 · ` : ''}Intento n.º ${result.attemptNumber ?? ''} · ${new Date().toLocaleDateString('es-DO')}
      </p>
      <ul class="grammar-test-breakdown-list">${breakdownHtml}</ul>
      <button type="button" class="primary-btn hover-lift btn-press grammar-test-retry-btn">Intentar de nuevo</button>
    </div>
  `;
}

// ---------------------------------------------------------------------
// Scored Listening Comprehension test (course_lessons.extra.
// listeningComprehension - same shape/sanitizer/grading as Grammar's
// extra.grammarTest, see lib/grammarTestSanitizer.js and
// lib/courseLessonsService.js#gradeExercises). Renders inside Listening's
// existing tab panel (.listening-mode-panel), not the whole skill view, so
// it needs its own container/nav wrappers - but reuses Grammar's
// per-question body renderer, answer-collector and score-band helper
// as-is (renderGrammarTestQuestionBodyHtml/collectGrammarTestAnswer/
// gradeBandForScore/isGrammarTestQuestionAnswered are already fully
// generic: they only ever read `question`/`test`/`runtime`, never
// anything grammar-specific), so the question-level markup/interaction
// (.grammar-test-option/-fill-input/-order-select and their click/read
// logic) is identical and shared, not duplicated.
const listeningComprehensionState = new Map();

function getListeningComprehensionRuntime(lesson) {
  let runtime = listeningComprehensionState.get(lesson.slug);
  if (!runtime) {
    runtime = { phase: 'instructions', currentIndex: 0, answers: {}, lastResult: null };
    listeningComprehensionState.set(lesson.slug, runtime);
  }
  return runtime;
}

// Legacy fallback for every Listening lesson that doesn't have a
// listeningComprehension question bank yet - today's flat, ungated
// exercises list, unchanged (see the old inline block this replaced in
// renderListeningOfficial).
function renderListeningComprehensionLegacyHtml(lesson) {
  const { total, attempted } = getExerciseProgress(lesson);
  const pct = total ? Math.round((attempted / total) * 100) : 0;
  const exercisesHtml = (lesson.exercises || [])
    .filter((item) => item.type === 'mcq')
    .map((item, index) => renderLessonExercise(item, index, lesson))
    .join('');
  return `
    <div class="listening-questions-section">
      <div class="listening-progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div style="width:${pct}%"></div></div>
      <div class="listening-questions">${exercisesHtml || '<p class="skill-graph-empty">No hay preguntas de comprensión para esta lección.</p>'}</div>
    </div>
  `;
}

function renderListeningComprehensionInstructionsHtml(lesson, bank) {
  const total = bank.questions.length;
  return `
    <div class="grammar-test-card card-enter">
      <p class="grammar-test-instructions-text">Responde estas preguntas para comprobar cuánto entendiste del audio.</p>
      <ul class="grammar-test-meta-list">
        <li>📝 ${total} preguntas</li>
        <li>🎯 Aprobación recomendada: ${bank.passingScore || 70}/100</li>
        ${lesson.listeningComprehensionBestScore != null ? `<li>🏆 Mejor puntuación: ${lesson.listeningComprehensionBestScore}/100</li>` : ''}
      </ul>
      <button type="button" class="primary-btn hover-lift btn-press listening-comp-start-btn">Comenzar</button>
    </div>
  `;
}

function renderListeningComprehensionQuestionHtml(lesson, bank, runtime) {
  const total = bank.questions.length;
  const index = Math.min(runtime.currentIndex, total - 1);
  const question = bank.questions[index];
  const pct = Math.round(((index + 1) / total) * 100);
  const isLast = index === total - 1;
  return `
    <div class="grammar-test-card card-enter">
      <div class="grammar-test-progress-row">
        <span class="grammar-test-counter">Pregunta ${index + 1} de ${total}</span>
        <div class="grammar-test-progress-bar"><div class="progress-fill-animated" style="width:${pct}%"></div></div>
      </div>
      <p class="grammar-test-question-prompt">${escapeHtml(question.prompt)}</p>
      ${renderGrammarTestQuestionBodyHtml(question, runtime)}
      <div class="grammar-test-nav-row">
        <button type="button" class="secondary-btn hover-lift btn-press listening-comp-prev-btn" ${index === 0 ? 'disabled' : ''}>Anterior</button>
        <button type="button" class="primary-btn hover-lift btn-press listening-comp-next-btn">${isLast ? 'Revisar' : 'Siguiente'}</button>
      </div>
    </div>
  `;
}

function renderListeningComprehensionReviewHtml(lesson, bank, runtime) {
  const itemsHtml = bank.questions
    .map((question, index) => {
      const answered = isGrammarTestQuestionAnswered(runtime, question);
      return `
        <li class="grammar-test-review-item${answered ? ' is-answered' : ' is-unanswered'}">
          <span class="grammar-test-review-status" aria-hidden="true">${answered ? '✅' : '⚠️'}</span>
          <span class="grammar-test-review-prompt">${index + 1}. ${escapeHtml(question.prompt)}</span>
          <button type="button" class="secondary-btn listening-comp-review-edit-btn" data-question-index="${index}">${answered ? 'Editar' : 'Responder'}</button>
        </li>
      `;
    })
    .join('');
  const allAnswered = bank.questions.every((question) => isGrammarTestQuestionAnswered(runtime, question));
  return `
    <div class="grammar-test-card card-enter">
      <h4>Revisa tus respuestas</h4>
      <ul class="grammar-test-review-list">${itemsHtml}</ul>
      ${!allAnswered ? '<p class="grammar-test-review-warning">Responde todas las preguntas para poder enviar.</p>' : ''}
      <div class="grammar-test-nav-row">
        <button type="button" class="secondary-btn hover-lift btn-press listening-comp-review-edit-btn" data-question-index="${bank.questions.length - 1}">Volver a la última pregunta</button>
        <button type="button" class="primary-btn hover-lift btn-press listening-comp-submit-btn" ${!allAnswered ? 'disabled' : ''}>Enviar</button>
      </div>
    </div>
  `;
}

function renderListeningComprehensionResultsHtml(lesson, bank, runtime) {
  const result = runtime.lastResult;
  if (!result) {
    runtime.phase = 'instructions';
    return renderListeningComprehensionInstructionsHtml(lesson, bank);
  }
  const band = gradeBandForScore(result.score);
  const resultsByQuestionId = new Map((result.results || []).map((r) => [String(r.questionId), r]));
  const correctCount = (result.results || []).filter((r) => r.correct).length;
  const breakdownHtml = bank.questions
    .map((question, index) => {
      const r = resultsByQuestionId.get(String(question.id));
      const correct = Boolean(r?.correct);
      return `
        <li class="grammar-test-breakdown-item${correct ? ' is-correct' : ' is-incorrect'}">
          <span class="grammar-test-breakdown-icon" aria-hidden="true">${correct ? '✅' : '❌'}</span>
          <div>
            <p class="grammar-test-breakdown-prompt">${index + 1}. ${escapeHtml(question.prompt)}</p>
            ${r?.explanation ? `<p class="grammar-test-breakdown-explanation">${escapeHtml(r.explanation)}</p>` : ''}
          </div>
        </li>
      `;
    })
    .join('');
  return `
    <div class="grammar-test-card card-enter">
      <div class="grammar-test-score-band">
        <span class="grammar-test-score-emoji" aria-hidden="true">${band.emoji}</span>
        <strong class="grammar-test-score-number">${result.score}/100</strong>
        <span class="grammar-test-score-label">${band.label}</span>
      </div>
      <p class="grammar-test-score-detail">Respuestas correctas: ${correctCount} de ${bank.questions.length}</p>
      <p class="grammar-test-score-detail">
        ${result.bestScore != null ? `Mejor puntuación: ${result.bestScore}/100 · ` : ''}Intento n.º ${result.attemptNumber ?? ''} · ${new Date().toLocaleDateString('es-DO')}
      </p>
      <ul class="grammar-test-breakdown-list">${breakdownHtml}</ul>
      <button type="button" class="primary-btn hover-lift btn-press listening-comp-retry-btn">Intentar de nuevo</button>
    </div>
  `;
}

function renderListeningComprehensionPanel(lesson) {
  const bank = lesson.extra?.listeningComprehension;
  if (!bank?.questions?.length) return renderListeningComprehensionLegacyHtml(lesson);

  const runtime = getListeningComprehensionRuntime(lesson);
  if (runtime.phase === 'question') return renderListeningComprehensionQuestionHtml(lesson, bank, runtime);
  if (runtime.phase === 'review') return renderListeningComprehensionReviewHtml(lesson, bank, runtime);
  if (runtime.phase === 'results') return renderListeningComprehensionResultsHtml(lesson, bank, runtime);
  return renderListeningComprehensionInstructionsHtml(lesson, bank);
}

// ---------------------------------------------------------------------
// Shared vocabulary flashcard component. One normalizer + one render
// function produce every vocab card in the app (English/French/Spanish,
// every level/unit, the shuffled "review" order, and any future reuse) -
// see renderVocabularyView() below. Never fork this per language.
//
// normalizeVocabularyItem() maps whatever shape a lesson's raw vocabulary
// entry happens to have (word vs targetWord, category only on some Spanish
// items, partOfSpeech/definition only on some English items, the Spanish
// course's translation direction being reversed vs. every other course)
// onto one consistent card schema, so the renderer never has to branch on
// language or content vintage. Existing raw fields are read, never removed,
// so nothing upstream breaks.
function normalizeVocabularyItem(item, { language, level, bridgeLanguage, index = 0, lessonSlug = '' } = {}) {
  if (!item) return null;
  const targetLanguage = language || learningPathState.language;
  const resolvedBridge = bridgeLanguage || learningPathState.bridgeLanguage;
  const targetWord = item.targetWord || item.word || '';
  const id = item.id || `${lessonSlug}-${slugifyVocabWord(targetWord)}-${index}`;
  // Direct/immersion mode (spec §3/§5/§9): L1 === L2, no translation shown -
  // definition/examples/synonyms/opposites/image in L2 instead, via the
  // shared getLearningSupport() normalizer (src/js/language-pair.js). Falls
  // back to the plain bilingual shape when LanguagePair isn't loaded or the
  // item has no directSupport authored yet (existing bilingual content keeps
  // working unchanged either way).
  const learningMode = LanguagePair
    ? LanguagePair.getLearningMode(resolvedBridge, targetLanguage)
    : resolvedBridge === targetLanguage
      ? 'direct'
      : 'bilingual';
  const support =
    learningMode === 'direct' && LanguagePair
      ? LanguagePair.getLearningSupport({ item, bridgeLanguage: resolvedBridge, targetLanguage, learningMode })
      : null;
  return {
    id,
    targetWord,
    // Never show a translation in direct mode, even if the raw item still
    // carries legacy `translation` data (spec §5: "No mostrar traducción").
    translation: support ? '' : resolveVocabTranslation(item, resolvedBridge),
    example: item.example || '',
    // Direct mode prefers directSupport's own (up to 3) context examples
    // over the single legacy `example` string, when authored (spec §6: max
    // 2-3 examples at A1).
    contexts:
      support?.examples?.length
        ? support.examples.slice(0, 3).map((text) => ({ targetText: text, supportText: '' }))
        : normalizeVocabContexts(item),
    phonetic: item.phonetic || item.pronunciationIpa || '',
    audioText: item.pronunciationText || targetWord,
    category: item.category || item.partOfSpeech || '',
    masteryStatus: getStoredVocabMastery(id) || item.masteryStatus || 'new',
    difficulty: item.difficulty || level || learningPathState.level || '',
    language: targetLanguage,
    bridgeLanguage: resolvedBridge,
    targetLanguage,
    pronunciationLocale: item.pronunciationLocale || getPronunciationLocale(targetLanguage),
    pronunciationRate: item.pronunciationRate ?? getDefaultPronunciationRate(targetLanguage, level),
    learningMode,
    definition: support?.definition || '',
    simpleDefinition: support?.simpleDefinition || '',
    synonyms: support?.synonyms || [],
    opposites: support?.opposites || [],
    usageNote: support?.usageNote || '',
    // Only set when a real, pedagogically-useful image is authored (spec
    // §10) - never a placeholder. renderVocabCardHtml skips the image block
    // entirely when this is empty, no broken box/alt text ever shown.
    image: support?.image || '',
    imageAlt: support?.imageAlt || ''
  };
}

// Card backs show 1-3 "contexts" (an L2 example sentence + optional L1
// gloss). Real content today only has a single flat `example` string per
// word, so that's wrapped into a one-item array here - a future `contexts`
// array on the raw item (richer authored data) is used as-is when present,
// never both at once.
function normalizeVocabContexts(item) {
  const raw = Array.isArray(item.contexts) && item.contexts.length
    ? item.contexts
    : item.example
      ? [{ targetText: item.example, supportText: item.exampleTranslation || '' }]
      : [];
  return raw
    .filter((ctx) => ctx && (ctx.targetText || ctx.text))
    .slice(0, 3)
    .map((ctx) => ({
      targetText: ctx.targetText || ctx.text || '',
      supportText: ctx.supportText || ctx.translation || ''
    }));
}

function slugifyVocabWord(word = '') {
  return (
    String(word)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'word'
  );
}

// Per-word mastery is purely a client-side study aid (no server-side vocab
// progress model exists yet - see getExerciseProgress() for the real,
// persisted lesson-completion progress). Stored the same way as the app's
// other localStorage preferences (andergo_voice_*, andergo_rate_*).
const VOCAB_MASTERY_STORAGE_KEY = 'andergo_vocab_mastery_v1';
const VOCAB_MASTERY_META = {
  new: { label: 'Nueva', glyph: '●' },
  learning: { label: 'Aprendiendo', glyph: '◐' },
  practicing: { label: 'En práctica', glyph: '◑' },
  mastered: { label: 'Dominada', glyph: '✓' }
};

function readVocabMasteryStore() {
  try {
    return JSON.parse(localStorage.getItem(VOCAB_MASTERY_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function getStoredVocabMastery(id) {
  return readVocabMasteryStore()[id] || null;
}

function setStoredVocabMastery(id, status) {
  const store = readVocabMasteryStore();
  store[id] = status;
  try {
    localStorage.setItem(VOCAB_MASTERY_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage unavailable (private browsing / quota) - mastery just won't
    // survive a reload; never block the UI on it.
  }
}

// Dynamic aria-label for the card's flip state - "Ver significado de X" on
// the front, "Volver al frente de X" once flipped. See flipVocabCard().
function vocabCardAriaLabel(word, flipped, isFrench) {
  if (flipped) return isFrench ? `Revenir au recto de ${word}` : `Volver al frente de ${word}`;
  return isFrench ? `Voir le sens de ${word}` : `Ver significado de ${word}`;
}

function renderVocabCardHtml(item, { canSpeak, isFrench }) {
  const meta = VOCAB_MASTERY_META[item.masteryStatus] || VOCAB_MASTERY_META.new;
  const speakAriaLabel = isFrench
    ? `Écouter la prononciation de ${item.targetWord}`
    : `Escuchar pronunciación de ${item.targetWord}`;
  const statusChipHtml = `
    <span class="vocab-card-status" aria-live="polite">
      <span class="vocab-status-dot" aria-hidden="true">${meta.glyph}</span>
      <span class="vocab-status-label">${meta.label}</span>
    </span>`;
  const contextsHtml = item.contexts.length
    ? `<div class="vocab-card-contexts">${item.contexts
        .map(
          (ctx) => `
        <div class="vocab-card-context">
          <p class="vocab-card-context-target">
            <span>${escapeHtml(ctx.targetText)}</span>
            ${
              canSpeak
                ? `<button type="button" class="vocab-example-audio-btn" tabindex="-1" data-speak-text="${escapeHtml(ctx.targetText)}" data-speak-locale="${escapeHtml(item.pronunciationLocale)}" data-speak-rate="${item.pronunciationRate}" aria-label="${isFrench ? 'Écouter la phrase' : 'Escuchar frase'}" title="${isFrench ? 'Écouter la phrase' : 'Escuchar frase'}">🔊</button>`
                : ''
            }
          </p>
          ${ctx.supportText ? `<p class="vocab-card-context-support">${escapeHtml(ctx.supportText)}</p>` : ''}
        </div>`
        )
        .join('')}</div>`
    : '';

  // Direct/immersion mode (spec §5/§9): definition + synonyms/opposites +
  // image instead of a translation - translation is already '' for these
  // items (see normalizeVocabularyItem), so the vocab-card-translation
  // block above naturally stays empty. Image only renders when a real one
  // is authored (spec §10) - no placeholder box, no broken alt text.
  const lang = learningPathState.bridgeLanguage;
  const synonymsOppositesParts = [];
  if (item.synonyms?.length) {
    synonymsOppositesParts.push(
      `<span class="vocab-card-synonyms">${escapeHtml(LanguagePair.t('vocabSynonyms', lang))}: ${escapeHtml(item.synonyms.join(', '))}</span>`
    );
  }
  if (item.opposites?.length) {
    synonymsOppositesParts.push(
      `<span class="vocab-card-opposites">${escapeHtml(LanguagePair.t('vocabOpposites', lang))}: ${escapeHtml(item.opposites.join(', '))}</span>`
    );
  }
  const directSupportHtml =
    item.learningMode === 'direct'
      ? `
    ${item.image ? `<img class="vocab-card-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt || item.targetWord)}" loading="lazy" />` : ''}
    ${item.definition ? `<p class="vocab-card-definition">${escapeHtml(item.definition)}</p>` : ''}
    ${synonymsOppositesParts.length ? `<p class="vocab-card-synonyms-opposites">${synonymsOppositesParts.join(' · ')}</p>` : ''}
    ${item.usageNote ? `<p class="vocab-card-usage-note">${escapeHtml(item.usageNote)}</p>` : ''}`
      : '';

  return `
    <div class="vocab-card" data-index="${item._displayIndex}" data-card-id="${escapeHtml(item.id)}" data-mastery="${escapeHtml(item.masteryStatus)}" data-flipped="false" data-is-french="${isFrench}" data-speak-text="${escapeHtml(item.audioText)}" data-speak-locale="${escapeHtml(item.pronunciationLocale)}" data-speak-rate="${item.pronunciationRate}" role="button" tabindex="0" aria-expanded="false" aria-label="${escapeHtml(vocabCardAriaLabel(item.targetWord, false, isFrench))}">
      <div class="vocab-card-inner">
        <div class="vocab-card-face vocab-card-front">
          <div class="vocab-card-header">
            ${statusChipHtml}
            ${
              canSpeak
                ? `<button type="button" class="vocab-card-audio-btn" aria-label="${escapeHtml(speakAriaLabel)}" title="${escapeHtml(speakTitle(isFrench))}"><span aria-hidden="true">🔊</span></button>`
                : ''
            }
          </div>
          <div class="vocab-card-word-block">
            <p class="vocab-card-target">${escapeHtml(item.targetWord)}</p>
            ${item.phonetic ? `<p class="vocab-card-phonetic">${escapeHtml(item.phonetic)}</p>` : ''}
            ${item.category ? `<span class="vocab-card-tag">${escapeHtml(item.category)}</span>` : ''}
          </div>
          <p class="vocab-card-hint">${isFrench ? 'Touchez pour voir le sens' : 'Toca para ver significado'}</p>
        </div>
        <div class="vocab-card-face vocab-card-back" aria-hidden="true">
          <div class="vocab-card-header">${statusChipHtml}</div>
          ${item.translation ? `<p class="vocab-card-translation">${escapeHtml(item.translation)}</p>` : ''}
          ${directSupportHtml}
          ${contextsHtml}
          <div class="vocab-card-actions" role="group" aria-label="${isFrench ? 'Actions d’apprentissage' : 'Acciones de aprendizaje'}">
            <button type="button" class="vocab-know-btn" tabindex="-1" aria-label="${isFrench ? 'Je la connais déjà' : 'Ya sé esta palabra'}" title="${isFrench ? 'Je la connais déjà' : 'Ya sé esta palabra'}">✓ Ya la sé</button>
            <button type="button" class="vocab-retry-btn" tabindex="-1" aria-label="${isFrench ? 'À continuer à pratiquer' : 'Marcar para seguir practicando'}" title="${isFrench ? 'À continuer à pratiquer' : 'Marcar para seguir practicando'}">↻ Practicar</button>
            <button type="button" class="vocab-back-btn" tabindex="-1" aria-label="${vocabCardAriaLabel(item.targetWord, true, isFrench)}" title="${isFrench ? 'Revenir au recto' : 'Volver al frente'}">↩ ${isFrench ? 'Retour' : 'Volver'}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// vocabCardOrder holds the current (possibly shuffled) display order for
// the active lesson's flashcard deck - reset every time a new vocabulary
// lesson is rendered, never persisted, purely a display convenience so
// "Mezclar tarjetas" can re-render without touching lesson.vocabulary itself.
let vocabCardOrder = [];

function renderVocabularyView(section, lesson) {
  const content = section.querySelector('.skill-view-content');
  if (!content) return;
  const rawCards = lesson.vocabulary || [];
  if (vocabCardOrder.length !== rawCards.length || vocabCardOrder.lessonSlug !== lesson.slug) {
    vocabCardOrder = rawCards.map((_, index) => index);
    vocabCardOrder.lessonSlug = lesson.slug;
  }
  const cards = rawCards.map((raw, index) =>
    normalizeVocabularyItem(raw, {
      language: learningPathState.language,
      level: lesson.level,
      lessonSlug: lesson.slug,
      index
    })
  );
  const canSpeak = supportsSpeech();
  const isFrench = learningPathState.language === 'french';
  const staff = isStaffEntitled();
  const testExercisesHtml = (lesson.exercises || [])
    .filter((item) => item.type === 'mcq')
    .map((item, index) => renderLessonExercise(item, index, lesson))
    .join('');
  const printExercisesHtml = renderPrintableExerciseList(lesson.exercises, { showAnswers: staff });

  content.innerHTML = `
    <h3>${escapeHtml(lesson.title)}</h3>
    <div class="vocab-card-deck-controls no-print">
      <button type="button" class="secondary-btn vocab-shuffle-btn">🔀 Mezclar tarjetas</button>
    </div>
    <div class="vocab-card-deck">
      ${vocabCardOrder
        .map((cardIndex) => renderVocabCardHtml({ ...cards[cardIndex], _displayIndex: cardIndex }, { canSpeak, isFrench }))
        .join('')}
    </div>
    <div class="skill-view-tutor-cta no-print">
      <button type="button" class="primary-btn open-tutor-btn" data-tutor-prompt="Ayúdame a practicar este vocabulario: ${escapeHtml(cards.map((c) => c.targetWord).join(', '))}" data-support-mode="practice" data-tutor-vocabulary="${escapeHtml(cards.map((c) => c.targetWord).join(', '))}">Practicar estas palabras</button>
      <button type="button" class="secondary-btn open-translator-btn" data-translate-text="${escapeHtml(cards.map((c) => c.targetWord).join(', '))}" data-return-label="Volver a Vocabulary">Traducir estas palabras</button>
    </div>
    <div class="vocab-test no-print">
      <h4>Prueba de vocabulario</h4>
      ${testExercisesHtml || '<p class="skill-graph-empty">No hay prueba de vocabulario para esta lección.</p>'}
    </div>
    <div class="skill-print-area print-only">
      ${renderSkillPrintHeaderHtml(lesson)}
      <h3 class="print-only">${escapeHtml(lesson.title)}</h3>
      <div class="print-only">
        <h4>${staff ? 'Clave de respuestas' : 'Vocabulario y actividad para completar'}</h4>
        <ul class="skill-print-options">
          ${cards.map((item) => `<li class="skill-print-option">${escapeHtml(item.targetWord)} — ${escapeHtml(item.translation)}${item.example ? ` (${escapeHtml(item.example)})` : ''}</li>`).join('')}
        </ul>
        ${printExercisesHtml}
        ${
          staff
            ? ''
            : `<div class="reading-print-answer-space skill-print-answer-space print-only">
                <h4>Tus respuestas</h4>
                <div class="reading-print-answer-lines"><div></div><div></div><div></div><div></div></div>
              </div>`
        }
      </div>
    </div>
    <div class="skill-view-tutor-cta no-print">
      <button type="button" class="secondary-btn skill-print-btn">${staff ? 'Descargar clave de respuestas' : 'Descargar vocabulario en PDF'}</button>
    </div>
  `;
}

// Flips a card between its front (word only) and back (translation +
// contexts + mastery actions), keeping the two faces' focusable buttons,
// aria-hidden and the card's own aria-expanded/aria-label in sync. `toBack`
// forces a direction (used by the "Volver" button and Escape); omitting it
// toggles. `speak` is true only for the tap-the-card-body path going
// front -> back, so the word is read exactly once per flip and never on the
// way back. Marks a never-touched card "learning" the first time it's
// flipped; "Ya la sé"/"Practicar" always set an explicit status afterwards.
function flipVocabCard(card, { toBack, speak = false } = {}) {
  if (!card) return;
  const isFlipped = card.dataset.flipped === 'true';
  const nextFlipped = typeof toBack === 'boolean' ? toBack : !isFlipped;
  if (nextFlipped === isFlipped) return;
  card.dataset.flipped = String(nextFlipped);
  card.classList.toggle('is-flipped', nextFlipped);
  card.setAttribute('aria-expanded', String(nextFlipped));
  const word = card.querySelector('.vocab-card-target')?.textContent || '';
  const isFrench = card.dataset.isFrench === 'true';
  card.setAttribute('aria-label', vocabCardAriaLabel(word, nextFlipped, isFrench));
  const front = card.querySelector('.vocab-card-front');
  if (front) {
    front.setAttribute('aria-hidden', String(nextFlipped));
    front.querySelectorAll('button').forEach((btn) => {
      btn.tabIndex = nextFlipped ? -1 : 0;
    });
  }
  const back = card.querySelector('.vocab-card-back');
  if (back) {
    back.setAttribute('aria-hidden', String(!nextFlipped));
    back.querySelectorAll('button').forEach((btn) => {
      btn.tabIndex = nextFlipped ? 0 : -1;
    });
  }
  if (nextFlipped && card.dataset.mastery === 'new') setVocabCardMastery(card, 'learning');
  if (nextFlipped && speak) {
    const audioBtn = card.querySelector('.vocab-card-audio-btn');
    audioBtn?.classList.add('is-playing');
    speakText(card.dataset.speakText, {
      locale: card.dataset.speakLocale,
      rate: Number(card.dataset.speakRate) || 1,
      onEnd: () => audioBtn?.classList.remove('is-playing')
    });
  }
}

// Status chip is duplicated on both faces (section 8 requirement: visible
// whichever side is showing), so both copies are updated together.
function setVocabCardMastery(card, status) {
  if (!card) return;
  const meta = VOCAB_MASTERY_META[status] || VOCAB_MASTERY_META.new;
  card.dataset.mastery = status;
  setStoredVocabMastery(card.dataset.cardId, status);
  card.querySelectorAll('.vocab-status-label').forEach((el) => {
    el.textContent = meta.label;
  });
  card.querySelectorAll('.vocab-status-dot').forEach((el) => {
    el.textContent = meta.glyph;
  });
}

function speakTitle(isFrench) {
  return isFrench ? 'Écouter la prononciation' : 'Escuchar pronunciación';
}

// Vocab flashcards: Enter/Space flips the focused card (mirroring a tap on
// the card body, including the single audio playback on the front -> back
// flip); Escape always returns to the front. Delegated on document (like
// the click handler below) because renderVocabularyView() replaces the
// whole deck's markup on shuffle/re-render, which would orphan per-card
// listeners. Skipped when focus is already on one of the card's own
// buttons so their native Enter/Space activation isn't double-handled.
document.addEventListener('keydown', (event) => {
  const card = event.target.closest?.('.vocab-card');
  if (!card) return;
  if (event.target.closest('button')) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    const isFlipped = card.dataset.flipped === 'true';
    flipVocabCard(card, { toBack: !isFlipped, speak: !isFlipped });
  } else if (event.key === 'Escape') {
    flipVocabCard(card, { toBack: false });
  }
});

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
      bridgeLanguage: learningPathState.bridgeLanguage,
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
  const bodyEl = content.querySelector('.listening-transcript-body');
  if (!controlsEl || !bodyEl) return;
  const allAttempted = getListeningAllAttempted(lesson, runtime);
  const gate = getTranscriptGateState(lesson.level, runtime, allAttempted);

  if (gate === 'locked-until-review') {
    controlsEl.innerHTML = `
      <button type="button" class="secondary-btn listening-transcript-toggle" disabled>Ver transcripción y pronunciación</button>
      <p class="listening-transcript-note">Disponible como repaso después de responder todas las preguntas.</p>
    `;
    bodyEl.hidden = true;
    return;
  }

  if (gate === 'soft-gate') {
    controlsEl.innerHTML = `
      <button type="button" class="secondary-btn listening-transcript-toggle" disabled>Ver transcripción y pronunciación</button>
      <p class="listening-transcript-note">Te recomendamos escuchar el audio primero.
        <button type="button" class="secondary-btn listening-transcript-override-btn">Ver de todas formas</button>
      </p>
    `;
    bodyEl.hidden = true;
    controlsEl
      .querySelector('.listening-transcript-override-btn')
      ?.addEventListener('click', () => {
        runtime.transcriptSoftGateOverride = true;
        runtime.transcriptRevealed = true;
        bodyEl.hidden = false;
        renderListeningTranscriptControls(content, lesson, runtime);
      });
    return;
  }

  controlsEl.innerHTML = `<button type="button" class="secondary-btn listening-transcript-toggle">${runtime.transcriptRevealed ? 'Ocultar transcripción y pronunciación' : 'Ver transcripción y pronunciación'}</button>`;
  bodyEl.hidden = !runtime.transcriptRevealed;
  controlsEl.querySelector('.listening-transcript-toggle')?.addEventListener('click', () => {
    runtime.transcriptRevealed = !runtime.transcriptRevealed;
    bodyEl.hidden = !runtime.transcriptRevealed;
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
        <button type="button" class="listening-ctrl-btn listening-back5-btn" aria-label="Retroceder 5 segundos" disabled>⏪ 5s</button>
        <button type="button" class="listening-ctrl-btn listening-fwd5-btn" aria-label="Avanzar 5 segundos" disabled>⏩ 5s</button>
        <button type="button" class="listening-ctrl-btn listening-repeat-btn" aria-label="Repetir audio" aria-pressed="false" disabled>🔁 Repetir</button>
        <button type="button" class="listening-ctrl-btn listening-speed-btn" aria-label="Cambiar velocidad" disabled>🐢 Normal</button>
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
  `;
}

// Transcript is its own tab (see listeningModeList/wireListeningModePanel)
// rather than embedded in the player markup, so it can be shown next to
// Diálogo/Dictado/Comprensión instead of always taking up space under the
// audio controls. renderListeningTranscriptControls re-queries these two
// elements from `content` (not scoped to this panel), so it works the same
// whether they're inline or in a separate tab panel - only requirement is
// they exist in the DOM when that function runs, which wireListeningModePanel
// guarantees by rendering this panel first.
//
// "Transcripción" and "Transcripción fonética" used to be two separate tabs;
// they're now one ("Transcripción y pronunciación" - see
// listeningExtraModeList) so pronunciation support sits right under the line
// it belongs to instead of in a disconnected tab. .listening-transcript-body
// is filled by renderListeningTranscriptBodyHtml below, not plain text.
function renderListeningTranscriptPanel() {
  return `
    <div class="listening-transcript">
      <div class="listening-transcript-controls"></div>
      <div class="listening-transcript-body" hidden></div>
    </div>
  `;
}

// One entry per dialogue turn when the lesson has a `dialogue` array
// (today: lessons with extra.listeningType === 'dialogue', e.g. the
// English A1 "Hello!" pilot unit); otherwise falls back to sentence-split
// plain text (reusing Reading's splitReadingSentences) with no per-line
// speaker/translation, since a flat transcript blob carries neither.
function listeningTranscriptLines(lesson, runtime) {
  if (lesson.dialogue?.length) {
    return lesson.dialogue.map((item) => ({
      speaker: item.speaker || '',
      text: item.line || '',
      translation: item.translation || ''
    }));
  }
  const text = runtime.transcript || lesson.transcript || '';
  return splitReadingSentences(text).map((sentence) => ({
    speaker: '',
    text: sentence,
    translation: ''
  }));
}

// Matches pre-authored phoneticSupport.segments to the line they belong to
// by substring, so pronunciation shows up right under its line - never
// generates/guesses IPA that isn't already in the lesson's own data.
function findPhoneticSegmentsForLine(phoneticSupport, lineText) {
  if (!phoneticSupport?.segments?.length || !lineText) return [];
  const lower = lineText.toLowerCase();
  return phoneticSupport.segments.filter(
    (seg) => seg.text && lower.includes(String(seg.text).toLowerCase())
  );
}

// Direct mode (L1 === L2, spec §3/§9) never shows a translation - instead,
// when the lesson's own `vocabulary` carries directSupport.simpleDefinition
// (English-only glosses, same shape normalizeVocabularyItem's directSupport
// already uses), a compact glossary substitutes for the hidden L1 line.
function renderListeningDirectGlossaryHtml(lesson) {
  const items = (lesson.vocabulary || []).filter((item) => item.directSupport?.simpleDefinition);
  if (!items.length) return '';
  return `
    <div class="listening-direct-glossary">
      <strong>Key words</strong>
      <ul>
        ${items
          .map(
            (item) =>
              `<li><strong>${escapeHtml(item.word)}</strong>: ${escapeHtml(item.directSupport.simpleDefinition)}</li>`
          )
          .join('')}
      </ul>
    </div>
  `;
}

function renderListeningTranscriptBodyHtml(lesson, runtime) {
  const lines = listeningTranscriptLines(lesson, runtime);
  if (!lines.length) {
    return '<p class="skill-graph-empty">Todavía no hay transcripción disponible para esta lección.</p>';
  }
  const isDirectMode = learningPathState.learningMode === 'direct';
  const phoneticSupport = lesson.extra?.phoneticSupport;
  // phoneticSupport.reviewStatus is set by content authors, never inferred -
  // anything other than an explicit 'verified' is labeled as an approximate
  // aid, never presented as certified IPA (spec: "no inventes IPA").
  const isApproxPronunciation = Boolean(phoneticSupport) && phoneticSupport.reviewStatus !== 'verified';

  const linesHtml = lines
    .map((line, index) => {
      const segments = findPhoneticSegmentsForLine(phoneticSupport, line.text);
      const pronunciationHtml = segments.length
        ? `<p class="listening-transcript-pron" data-line-index="${index}" hidden>${segments
            .map((s) => `<span class="phonetic-ipa">${escapeHtml(s.ipa || '')}</span>`)
            .join(' · ')}${isApproxPronunciation ? ' <span class="listening-pron-approx-tag">Pronunciación aproximada</span>' : ''}</p>`
        : '';
      const l1Html =
        !isDirectMode && line.translation
          ? `<p class="listening-transcript-l1" data-line-index="${index}" hidden>${escapeHtml(line.translation)}</p>`
          : '';
      return `
        <div class="listening-transcript-line">
          <p class="listening-transcript-en">${line.speaker ? `<span class="listening-transcript-speaker">${escapeHtml(line.speaker)}</span> ` : ''}${escapeHtml(line.text)}</p>
          ${l1Html}
          ${pronunciationHtml}
        </div>
      `;
    })
    .join('');

  const hasAnyL1 = !isDirectMode && lines.some((line) => line.translation);
  const hasAnyPron =
    lines.some((line) => findPhoneticSegmentsForLine(phoneticSupport, line.text).length) ||
    Boolean(phoneticSupport);
  const directGlossaryHtml = isDirectMode ? renderListeningDirectGlossaryHtml(lesson) : '';
  // Lesson-wide pronunciation guidance (focus note, stressed words,
  // syllabification, difficult sounds) - previously its own "Transcripción
  // fonética" tab, now folded into the bottom of this merged tab, shown
  // together with the per-line IPA behind the same pronunciation toggle.
  const guideHtml = phoneticSupport ? renderListeningPhoneticGuideHtml(phoneticSupport) : '';

  return `
    <div class="listening-transcript-lines">${linesHtml}</div>
    <div class="listening-transcript-toggle-row">
      ${hasAnyL1 ? '<button type="button" class="secondary-btn listening-l1-toggle" aria-pressed="false">Mostrar apoyo en español</button>' : ''}
      ${hasAnyPron ? '<button type="button" class="secondary-btn listening-pron-toggle" aria-pressed="false">Mostrar pronunciación</button>' : ''}
    </div>
    ${directGlossaryHtml}
    ${guideHtml}
  `;
}

// The lesson-wide portion of extra.phoneticSupport (as opposed to the
// per-line segments matched in renderListeningTranscriptBodyHtml above) -
// hidden/shown by the same "Mostrar/Ocultar pronunciación" toggle.
function renderListeningPhoneticGuideHtml(ps) {
  const isApprox = ps.reviewStatus !== 'verified';
  const syllabHtml = (ps.syllabification || [])
    .map((s) => `<li>${escapeHtml(s.word)}: <em>${escapeHtml(s.syllables)}</em></li>`)
    .join('');
  return `
    <div class="listening-phonetic-guide" hidden>
      ${isApprox ? '<p class="listening-pron-approx-tag">Pronunciación aproximada, sujeta a revisión.</p>' : ''}
      ${ps.focus ? `<p class="listening-phonetic-focus">${escapeHtml(ps.focus)}</p>` : ''}
      ${(ps.stressedWords || []).length ? `<p><strong>Palabras con acento clave:</strong> ${(ps.stressedWords || []).map(escapeHtml).join(', ')}</p>` : ''}
      ${syllabHtml ? `<ul class="listening-phonetic-syllables">${syllabHtml}</ul>` : ''}
      ${(ps.difficultSounds || []).length ? `<p><strong>Sonidos a practicar:</strong> ${(ps.difficultSounds || []).map(escapeHtml).join(', ')}</p>` : ''}
    </div>
  `;
}

// Global show/hide for every line's L1/pronunciation line at once (rather
// than per-line buttons, which listening-dialogue-translate-btn already
// covers in the separate Diálogo tab) - both toggles are independent and
// "ocultable" per spec.
function wireListeningTranscriptToggles(panel) {
  const l1Toggle = panel.querySelector('.listening-l1-toggle');
  l1Toggle?.addEventListener('click', () => {
    const next = l1Toggle.getAttribute('aria-pressed') !== 'true';
    l1Toggle.setAttribute('aria-pressed', String(next));
    l1Toggle.textContent = next ? 'Ocultar apoyo en español' : 'Mostrar apoyo en español';
    panel.querySelectorAll('.listening-transcript-l1').forEach((el) => {
      el.hidden = !next;
    });
  });
  const pronToggle = panel.querySelector('.listening-pron-toggle');
  pronToggle?.addEventListener('click', () => {
    const next = pronToggle.getAttribute('aria-pressed') !== 'true';
    pronToggle.setAttribute('aria-pressed', String(next));
    pronToggle.textContent = next ? 'Ocultar pronunciación' : 'Mostrar pronunciación';
    panel.querySelectorAll('.listening-transcript-pron').forEach((el) => {
      el.hidden = !next;
    });
    const guideEl = panel.querySelector('.listening-phonetic-guide');
    if (guideEl) guideEl.hidden = !next;
  });
}

function wireListeningPlayerControls(content, lesson, runtime, meta) {
  const playerEl = content.querySelector('.listening-player');
  const audioEl = content.querySelector('.listening-audio-el');
  const statusEl = content.querySelector('.listening-player-status');
  const playBtn = content.querySelector('.listening-play-btn');
  const restartBtn = content.querySelector('.listening-restart-btn');
  const back5Btn = content.querySelector('.listening-back5-btn');
  const fwd5Btn = content.querySelector('.listening-fwd5-btn');
  const repeatBtn = content.querySelector('.listening-repeat-btn');
  const speedBtn = content.querySelector('.listening-speed-btn');
  const elapsedEl = content.querySelector('.listening-time-elapsed');
  const durationEl = content.querySelector('.listening-time-duration');
  const rangeEl = content.querySelector('.listening-progress-range');
  const volumeEl = content.querySelector('.listening-volume-range');
  if (!audioEl || !playerEl) return;

  // Stashed on runtime, not written straight into the DOM here, because the
  // transcript is now its own tab (merged with pronunciation - see
  // renderListeningTranscriptBodyHtml) - its container may not exist in the
  // DOM yet if that tab isn't the active one, so wireListeningModePanel
  // re-reads runtime.transcript when the student switches to it.
  runtime.transcript = meta.transcript || '';
  renderListeningTranscriptControls(content, lesson, runtime);

  const setState = (state, statusText) => {
    playerEl.dataset.state = state;
    if (statusText && statusEl) statusEl.textContent = statusText;
  };

  const enableControls = () => {
    [playBtn, restartBtn, back5Btn, fwd5Btn, repeatBtn, speedBtn, rangeEl].forEach((el) => {
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
    [playBtn, restartBtn, back5Btn, fwd5Btn, repeatBtn, speedBtn, rangeEl].forEach((el) => {
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
  back5Btn?.addEventListener('click', () => {
    audioEl.currentTime = Math.max(0, audioEl.currentTime - 5);
  });
  fwd5Btn?.addEventListener('click', () => {
    const max = Number.isFinite(audioEl.duration) ? audioEl.duration : audioEl.currentTime + 5;
    audioEl.currentTime = Math.min(max, audioEl.currentTime + 5);
  });
  repeatBtn?.addEventListener('click', () => {
    audioEl.loop = !audioEl.loop;
    repeatBtn.setAttribute('aria-pressed', String(audioEl.loop));
    repeatBtn.classList.toggle('is-active', audioEl.loop);
  });
  // Three-tier speed cycle: normal -> lento -> muy lento -> normal. Any
  // speed missing a recorded file (slowUrl/verySlowUrl) falls back to a
  // client-side playbackRate reduction on the normal audio instead of
  // switching src, same behavior the two-tier version already had.
  const SPEED_TIERS = ['normal', 'slow', 'verySlow'];
  const SPEED_LABEL = { normal: '🐢 Normal', slow: '🐇 Lento', verySlow: '🐌 Muy lento' };
  const SPEED_RATE = { normal: 1, slow: 0.75, verySlow: 0.5 };
  runtime.speedTier = runtime.speedTier || 'normal';
  speedBtn?.addEventListener('click', () => {
    const wasPlaying = !audioEl.paused;
    const currentIndex = SPEED_TIERS.indexOf(runtime.speedTier);
    runtime.speedTier = SPEED_TIERS[(currentIndex + 1) % SPEED_TIERS.length];
    const recordedUrl =
      runtime.speedTier === 'slow' ? meta.slowUrl : runtime.speedTier === 'verySlow' ? meta.verySlowUrl : meta.mainUrl;
    if (recordedUrl && recordedUrl !== audioEl.src) {
      audioEl.src = recordedUrl;
      audioEl.playbackRate = 1;
      setState('loading', 'Cargando audio…');
      audioEl.load();
      if (wasPlaying)
        audioEl.addEventListener('loadedmetadata', () => audioEl.play().catch(() => {}), {
          once: true
        });
    } else {
      audioEl.playbackRate = SPEED_RATE[runtime.speedTier];
    }
    speedBtn.textContent = SPEED_LABEL[runtime.speedTier];
    speedBtn.setAttribute('aria-label', `Velocidad actual: ${SPEED_LABEL[runtime.speedTier].replace(/^\S+\s/, '')}. Cambiar velocidad.`);
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
    celebrateActivityCompletion();
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

// ---------------------------------------------------------------------
// Rich Listening extra modes (Dictado / Transcripción fonética /
// Diálogo-Role-play) - additive, only rendered when the lesson carries
// `extra`/`dictation` data (currently Español A1 only; see
// scripts/content/spanish-a1-units.js and
// supabase/migrations/202607220001_rich_listening_content.sql). English
// A1/French A1 lessons have no `extra`, so renderListeningExtraModesHtml
// returns '' for them and nothing else in this section runs - zero
// behavior change for existing languages.
// ---------------------------------------------------------------------

// Despite the name (kept to avoid a wider rename across every call site),
// this is no longer just "extra" content - Transcripción and Comprensión
// are always present, so every Listening lesson gets at least a 2-tab bar
// below the always-visible player; Diálogo/Dictado/Transcripción fonética
// join it only for lessons that actually have that content (today: the
// Spanish A1 catalog).
// "Transcripción" and "Transcripción fonética" are a single tab
// ("Transcripción y pronunciación") - see renderListeningTranscriptBodyHtml,
// which shows pronunciation support inline under each line instead of in a
// disconnected tab. Dictado and Comprensión stay separate on purpose: one is
// a write-what-you-hear exercise, the other is a scored comprehension check.
function listeningExtraModeList(lesson) {
  const modes = [];
  if (lesson.extra?.listeningType === 'dialogue' && lesson.dialogue?.length)
    modes.push({ id: 'dialogue', label: 'Diálogos' });
  if (lesson.dictation?.segments?.length) modes.push({ id: 'dictation', label: 'Dictado' });
  modes.push({ id: 'transcript', label: 'Transcripción y pronunciación' });
  modes.push({ id: 'comprehension', label: 'Comprensión' });
  return modes;
}

// True when a lesson has at least one of the rich Diálogo/Dictado/
// Transcripción-y-pronunciación/Comprensión tabs worth showing, independent
// of whether official/AI audio exists yet. Lets renderListeningAiOffer/
// renderListeningUnavailable below show those tabs under the honest
// "no audio yet" status card instead of hiding the whole unit behind an
// audio file that hasn't been published - never fabricates a player, never
// auto-calls a TTS provider, just stops blocking read/write content that
// doesn't itself need audio to work (dictation grading, comprehension
// questions, the dialogue script, the transcript).
function listeningHasRichExtras(lesson) {
  return Boolean(
    (lesson.extra?.listeningType === 'dialogue' && lesson.dialogue?.length) ||
      lesson.dictation?.segments?.length ||
      lesson.extra?.phoneticSupport ||
      lesson.extra?.listeningComprehension?.questions?.length
  );
}

function renderListeningExtraModesHtml(lesson, runtime) {
  const modes = listeningExtraModeList(lesson);
  if (!modes.length) return '';
  if (!runtime.extraMode || !modes.some((m) => m.id === runtime.extraMode)) {
    runtime.extraMode = modes[0].id;
  }
  const tabsHtml = modes
    .map(
      (m) =>
        `<button type="button" class="listening-mode-tab${m.id === runtime.extraMode ? ' is-active' : ''}" data-mode="${m.id}" aria-pressed="${m.id === runtime.extraMode}">${escapeHtml(m.label)}</button>`
    )
    .join('');
  return `
    <div class="listening-extra-modes">
      <div class="listening-mode-tabs" role="tablist">${tabsHtml}</div>
      <div class="listening-mode-panel"></div>
    </div>
  `;
}

function renderListeningDictationPanel(lesson, runtime) {
  const segments = lesson.dictation?.segments || [];
  runtime.dictationAnswers = runtime.dictationAnswers || {};
  const rowsHtml = segments
    .map((segment, index) => {
      const value = escapeHtml(runtime.dictationAnswers[segment.id] || '');
      const result = runtime.dictationResults?.segments?.find((r) => String(r.segmentId) === String(segment.id));
      const feedback = result
        ? `<span class="dictation-segment-feedback">${result.correctWords}/${result.totalWords} palabras correctas</span>`
        : '';
      return `
        <div class="dictation-segment" data-segment-id="${escapeHtml(String(segment.id))}">
          <span class="dictation-segment-label">Frase ${index + 1}</span>
          <textarea class="dictation-segment-input" rows="2" placeholder="Escribe lo que escuchas...">${value}</textarea>
          ${feedback}
        </div>
      `;
    })
    .join('');
  const overall = runtime.dictationResults
    ? `<p class="dictation-overall-result">Resultado: ${runtime.dictationResults.correctWords}/${runtime.dictationResults.totalWords} palabras correctas (${runtime.dictationResults.percentage}%). Intento ${runtime.dictationResults.attemptNumber}.</p>`
    : '';
  return `
    <div class="listening-dictation">
      <p class="listening-dictation-intro">Escucha cada frase (usa los controles de velocidad si lo necesitas) y escribe exactamente lo que escuchas.</p>
      ${rowsHtml}
      ${overall}
      <button type="button" class="secondary-btn listening-dictation-check-btn">Revisar dictado</button>
    </div>
  `;
}

function renderListeningDialoguePanel(lesson, runtime) {
  const linesHtml = (lesson.dialogue || [])
    .map(
      (line, index) => `
        <div class="listening-dialogue-line">
          <span class="listening-dialogue-speaker">${escapeHtml(line.speaker)}</span>
          <span class="listening-dialogue-text">${escapeHtml(line.line)}</span>
          <button type="button" class="listening-dialogue-translate-btn" data-line-index="${index}">${runtime.dialogueTranslationsShown?.[index] ? 'Ocultar' : 'Traducir'}</button>
          <span class="listening-dialogue-translation" ${runtime.dialogueTranslationsShown?.[index] ? '' : 'hidden'}>${escapeHtml(line.translation || '')}</span>
        </div>
      `
    )
    .join('');
  return `
    <div class="listening-dialogue-panel">
      <p class="listening-roleplay-note">Modo diálogo: lee el guion en pareja. Modo role-play: cada persona toma un rol y lo dice en voz alta, sin leer.</p>
      ${linesHtml}
    </div>
  `;
}

async function submitDictationCheck(lesson, runtime, content) {
  const segments = lesson.dictation?.segments || [];
  const attempts = segments.map((segment) => ({
    segmentId: segment.id,
    text: runtime.dictationAnswers?.[segment.id] || ''
  }));
  runtime.dictationAttemptNumber = (runtime.dictationAttemptNumber || 0) + 1;
  try {
    const response = await fetch(`${backendBaseUrl}/api/lessons/${lesson.slug}/dictation/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ attempts, attemptNumber: runtime.dictationAttemptNumber })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'No se pudo revisar el dictado.');
    runtime.dictationResults = data;
    wireListeningModePanel(content, lesson, runtime);
  } catch (error) {
    showHomeToast(error.message || 'No se pudo revisar el dictado.');
  }
}

function wireListeningModePanel(content, lesson, runtime) {
  const panel = content.querySelector('.listening-mode-panel');
  if (!panel) return;
  if (runtime.extraMode === 'dictation') panel.innerHTML = renderListeningDictationPanel(lesson, runtime);
  else if (runtime.extraMode === 'dialogue') panel.innerHTML = renderListeningDialoguePanel(lesson, runtime);
  else if (runtime.extraMode === 'transcript') panel.innerHTML = renderListeningTranscriptPanel();
  else if (runtime.extraMode === 'comprehension') panel.innerHTML = renderListeningComprehensionPanel(lesson);

  if (runtime.extraMode === 'transcript') {
    const bodyEl = panel.querySelector('.listening-transcript-body');
    if (bodyEl) bodyEl.innerHTML = renderListeningTranscriptBodyHtml(lesson, runtime);
    renderListeningTranscriptControls(content, lesson, runtime);
    wireListeningTranscriptToggles(panel);
  }

  panel.querySelectorAll('.dictation-segment-input').forEach((el) => {
    el.addEventListener('input', () => {
      const segmentId = el.closest('.dictation-segment')?.dataset.segmentId;
      if (segmentId) {
        runtime.dictationAnswers = runtime.dictationAnswers || {};
        runtime.dictationAnswers[segmentId] = el.value;
      }
    });
  });
  panel.querySelector('.listening-dictation-check-btn')?.addEventListener('click', () => {
    submitDictationCheck(lesson, runtime, content);
  });
  panel.querySelectorAll('.listening-dialogue-translate-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.lineIndex);
      runtime.dialogueTranslationsShown = runtime.dialogueTranslationsShown || {};
      runtime.dialogueTranslationsShown[index] = !runtime.dialogueTranslationsShown[index];
      wireListeningModePanel(content, lesson, runtime);
    });
  });
}

function wireListeningExtraModes(content, lesson, runtime) {
  const tabsWrap = content.querySelector('.listening-mode-tabs');
  if (!tabsWrap) return;
  tabsWrap.querySelectorAll('.listening-mode-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      runtime.extraMode = btn.dataset.mode;
      tabsWrap.querySelectorAll('.listening-mode-tab').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      wireListeningModePanel(content, lesson, runtime);
    });
  });
  wireListeningModePanel(content, lesson, runtime);
}

function renderListeningOfficial(content, lesson, runtime, audio) {
  // Scored Comprehension (extra.listeningComprehension) replaces the old
  // "Completar" button the same way Grammar's scored test replaced its
  // old completion flow - submitting the test inside the Comprensión tab
  // already calls the shared /complete endpoint, so the nav-row button
  // would just be a confusing second path to the same action. Lessons
  // without that question bank keep today's button/gating unchanged.
  const hasScoredComprehension = Boolean(lesson.extra?.listeningComprehension?.questions?.length);
  const { allAttempted } = getExerciseProgress(lesson);
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
    ${renderListeningExtraModesHtml(lesson, runtime)}
    <div class="skill-view-tutor-cta">
      ${listeningTutorButtonsHtml(lesson, { transcript: audio.transcript, vocabulary: (lesson.vocabulary || []).map((v) => v.word).join(', '), ...tutorCtx })}
    </div>
    ${
      hasScoredComprehension
        ? ''
        : `<div class="listening-nav-row">
            <button type="button" class="primary-btn listening-complete-btn" ${!allAttempted || lesson.completed ? 'disabled' : ''}>${lesson.completed ? 'Completada' : 'Completar'}</button>
          </div>`
    }
  `;

  wireListeningPlayerControls(content, lesson, runtime, {
    mainUrl: audio.audioUrl,
    slowUrl: audio.slowAudioUrl,
    verySlowUrl: audio.verySlowAudioUrl,
    transcript: audio.transcript,
    sourceIsAi: false
  });
  wireListeningExtraModes(content, lesson, runtime);
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
  const hasExtras = listeningHasRichExtras(lesson);
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
    ${
      hasExtras
        ? '<p class="listening-status-detail listening-extras-note">Mientras tanto, ya puedes usar Diálogo, Dictado, Transcripción y pronunciación, y Comprensión con el guion de esta lección.</p>'
        : ''
    }
    ${hasExtras ? renderListeningExtraModesHtml(lesson, runtime) : ''}
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
  if (hasExtras) wireListeningExtraModes(content, lesson, runtime);
}

function renderListeningUnavailable(content, lesson, section, runtime) {
  const hasExtras = listeningHasRichExtras(lesson);
  content.innerHTML = `
    <div class="listening-status-card">
      <div class="listening-status-icon" aria-hidden="true">🎧</div>
      <p class="listening-status-title">Listening no está disponible todavía para esta lección.</p>
      <p class="listening-status-detail">Aún no hay un audio oficial publicado y la práctica generada por IA no está configurada en este entorno. Intenta más tarde.</p>
      <button type="button" class="secondary-btn listening-retry-btn">Intenta más tarde: reintentar</button>
    </div>
    ${
      hasExtras
        ? '<p class="listening-status-detail listening-extras-note">Mientras tanto, ya puedes usar Diálogo, Dictado, Transcripción y pronunciación, y Comprensión con el guion de esta lección.</p>'
        : ''
    }
    ${hasExtras ? renderListeningExtraModesHtml(lesson, runtime) : ''}
  `;
  content.querySelector('.listening-retry-btn')?.addEventListener('click', () => {
    listeningAudioStatusCache.delete(listeningStatusCacheKey(lesson));
    content.dataset.listeningReady = 'false';
    renderListeningView(section, lesson);
  });
  if (hasExtras) wireListeningExtraModes(content, lesson, runtime);
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
  renderListeningUnavailable(content, lesson, section, runtime);
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

// Minimal Tab-cycling focus trap for the drawer's open state - keeps
// keyboard navigation inside .tutor-drawer-panel while it's open, without
// needing a focus-trap library. Attached in openTutorDrawer, removed in
// closeTutorDrawer so it never runs against a closed/inert drawer.
function tutorDrawerFocusTrapHandler(event) {
  if (event.key !== 'Tab') return;
  const panel = document.querySelector('#tutorDrawer .tutor-drawer-panel');
  if (!panel) return;
  const focusable = panel.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

// ---------------------------------------------------------------------
// Tutor hands-free voice conversation mode (Premium-only): arms the
// drawer's mic button to listen continuously, auto-send 2s after the
// student stops talking (see startTutorDictation's continuous/silenceMs
// options below), and automatically resume listening once the tutor's
// spoken reply finishes (see resumeTutorConversationListening, wired from
// sendTutorMessage/requestTutorSpeech). Off by default every time the
// drawer opens - never persisted, so a shared/public device never keeps a
// mic "armed" across sessions.
// ---------------------------------------------------------------------
let tutorConversationMode = false;

function updateTutorConversationToggleUI() {
  const toggle = document.getElementById('tutorConversationToggle');
  if (!toggle) return;
  const premium = isPremiumUser();
  toggle.classList.toggle('is-active', premium && tutorConversationMode);
  toggle.setAttribute('aria-pressed', String(premium && tutorConversationMode));
  toggle.title = premium
    ? 'Conversar por voz: hablas y el Tutor responde automáticamente.'
    : 'Conversar por voz es una función Premium.';
  const badge = toggle.querySelector('.tutor-conversation-toggle-badge');
  if (badge) badge.hidden = premium;
}

function setTutorConversationMode(enabled) {
  tutorConversationMode = enabled;
  if (!enabled) stopTutorDictation();
  updateTutorConversationToggleUI();
  const note = document.getElementById('tutorDrawerDictateNote');
  if (note) {
    note.textContent = enabled
      ? 'Modo conversación activo: habla y el Tutor te responderá en voz automáticamente. Pulsa "Hablar" para empezar.'
      : 'Tu voz se convierte en texto y no se conserva.';
  }
}

function handleTutorConversationToggleClick() {
  if (!isPremiumUser()) {
    openPaywallModal({
      title: 'Conversar por voz es Premium',
      message:
        'Habla con el Tutor IA y escucha sus respuestas automáticamente, sin escribir. Desbloquea ANDERGO Premium para conversar sin límites.',
      featureLabel: 'modo conversación'
    });
    return;
  }
  setTutorConversationMode(!tutorConversationMode);
}

// Restarts listening once the tutor's spoken reply has finished playing (or
// immediately if there was nothing to play) - only while conversation mode
// is still armed and the drawer is still open, so closing the drawer or
// turning the mode off mid-reply never leaves a stray recognizer running.
function resumeTutorConversationListening() {
  if (!tutorConversationMode) return;
  const drawer = document.getElementById('tutorDrawer');
  if (!drawer || !drawer.classList.contains('open')) return;
  startTutorDictation('tutorDrawerPrompt', { continuous: true, silenceMs: 2000, autoSend: true });
}

function openTutorDrawer(overrides = {}) {
  const drawer = document.getElementById('tutorDrawer');
  if (!drawer) return;
  stopTutorDictation();
  setTutorConversationMode(false);
  tutorDrawerContext = { ...tutorDrawerContext, ...overrides };
  tutorDrawerReturnFocus = document.activeElement;

  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  drawer.removeAttribute('inert');
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', tutorDrawerFocusTrapHandler);
  refreshLanguagePairChrome();

  const skillEl = drawer.querySelector('[data-drawer-context="skill"]');
  const levelEl = drawer.querySelector('[data-drawer-context="level"]');
  if (skillEl)
    skillEl.textContent = getSkillLabel(tutorDrawerContext.skill);
  if (levelEl) levelEl.textContent = learningPathState.level;

  const autoplayToggle = document.getElementById('tutorAutoplayToggle');
  if (autoplayToggle) autoplayToggle.checked = getTutorAutoplayPref();
  updateTutorConversationToggleUI();

  const prompt = document.getElementById('tutorDrawerPrompt');
  if (prompt) prompt.value = overrides.prefill || '';
  checkTutorConnection('tutorDrawerConnectionStatus');
  (prompt || drawer.querySelector('.close-modal'))?.focus();
}

function closeTutorDrawer() {
  const drawer = document.getElementById('tutorDrawer');
  if (!drawer || !drawer.classList.contains('open')) return;
  setTutorConversationMode(false);
  stopTutorDictation();
  stopAllTutorAudio();
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('inert', '');
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', tutorDrawerFocusTrapHandler);
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

  // Set when the Tutor's monthly free-query cap has been hit (see
  // lib/usageLimitService.js) - keeps the send button disabled past this
  // call's `finally`, since retrying won't help until next month/Premium.
  let lockedOut = false;

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
      if (data.limited) {
        lockedOut = true;
        if (conversationEl) appendTutorUsageNotice(conversationEl, data.error, { locked: true });
        if (connectionStatusEl) connectionStatusEl.textContent = 'Límite mensual alcanzado';
        openPaywallModal({
          featureLabel: 'consultas al Tutor IA',
          used: data.limit != null ? data.limit - (data.remaining || 0) : null,
          limit: data.limit
        });
        return null;
      }
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
    let tutorQueryUsage = null;

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
          } else if (payload.done) {
            if (payload.usage) tutorQueryUsage = payload.usage;
          } else if (payload.delta) {
            fullText += payload.delta;
            if (thinkingEl) thinkingEl.hidden = true;
            if (conversationEl) {
              if (!messageEl) {
                messageEl = appendTutorMessage(conversationEl, 'tutor', fullText);
                if (messageEl) {
                  messageEl.dataset.ttsLocale = getPronunciationLocale(language);
                  // Position among this conversation's tutor replies so far -
                  // sent to /api/speech/synthesize for logging/context only;
                  // the free-tier voice cap itself is a monthly total now
                  // (lib/usageLimitService.js), not turn-scoped.
                  messageEl.dataset.turnIndex = String(
                    conversationEl.querySelectorAll('.tutor-message--tutor').length
                  );
                }
              } else {
                updateTutorMessageBody(messageEl, conversationEl, fullText);
              }
              if (messageEl) {
                // Cleaned, not raw - speechSynthesis/the neural TTS provider
                // must never read Markdown syntax (**/#/- ) aloud.
                messageEl.dataset.ttsText = cleanTutorTextForSpeech(fullText);
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

    // Keeps the persistent "Te quedan N de 30 consultas" counter in sync
    // with the count this reply just consumed, instead of waiting for the
    // next view-open refetch. The full "has utilizado tus 30 consultas" +
    // Premium lock is shown separately, on the *next* request that actually
    // gets rejected (see the `data.limited` branch above), not here.
    if (tutorQueryUsage) renderTutorUsageCounter(tutorQueryUsage);

    if (streamError && !fullText) throw new Error(streamError);

    if (connectionStatusEl) connectionStatusEl.textContent = 'Conectado';

    // Fire-and-forget: starts the reply's audio as soon as it's ready
    // (§3 of the Tutor voice spec) without delaying sendTutorMessage's own
    // return or re-enabling of sendBtn below. requestTutorSpeech's own
    // NotAllowedError handling covers a browser blocking this autoplay.
    // The Premium hands-free conversation mode (drawer only) always speaks
    // the reply regardless of the general autoplay preference - "conversar"
    // wouldn't be hands-free otherwise - and resumes listening once that
    // reply finishes playing (resumeTutorConversationListening).
    const isDrawerConversation = conversationEl?.id === 'tutorDrawerConversation';
    const shouldForceSpeech = isDrawerConversation && tutorConversationMode;
    if (messageEl && (getTutorAutoplayPref() || shouldForceSpeech) && messageEl.querySelector('.tutor-voice-controls')) {
      requestTutorSpeech(messageEl, {
        auto: true,
        onPlaybackEnd: shouldForceSpeech ? resumeTutorConversationListening : undefined
      });
    } else if (shouldForceSpeech) {
      // No voice controls on this browser (speechSynthesis unsupported) or
      // no messageEl at all - nothing will ever call onPlaybackEnd, so
      // resume listening directly instead of leaving the loop stuck
      // waiting on audio that will never play.
      resumeTutorConversationListening();
    }

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
    // Stays disabled once the monthly free-query cap is hit - re-enabling
    // it would just let the student hit the same 403 again next click.
    if (sendBtn && !lockedOut) sendBtn.disabled = false;
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
  // Changing language or level always invalidates whatever reading is
  // currently attached to the audio player, even if the user isn't on
  // the Reading view right now - no reading audio should keep playing
  // in the background across a language/level switch.
  readingSpeechPlayer.teardown();
  learningPathState.language = options.language || learningPathState.language;
  learningPathState.level = options.level || learningPathState.level;
  syncLearningMode();
  learningPathState.units = getUnitsForLanguageLevel(
    learningPathState.language,
    learningPathState.level
  );

  const graphContainer = document.getElementById('skillGraph');
  if (graphContainer) {
    graphContainer.innerHTML = '<p class="skill-graph-empty">Preparando tu ruta…</p>';
  }

  // Applies options.restoreSlug/options.restoreUnitId (from a hash restored
  // on load, or Back/Forward through history) now that lessons/units for
  // this language+level have actually loaded. Falls back to the original
  // "no auto-selection" behavior - an empty activeSlug is what makes
  // renderLessonWorkspace() show the "continue" card (next recommended
  // lesson) instead of always jumping straight to lessons[0]'s full detail.
  const applyLoadedSelection = () => {
    if (
      options.restoreSlug &&
      learningPathState.lessons.some((item) => item.slug === options.restoreSlug)
    ) {
      setActiveLesson(options.restoreSlug);
      return;
    }
    learningPathState.activeSlug = '';
    learningPathState.unitId =
      options.restoreUnitId &&
      learningPathState.units.some((unit) => unit.id === options.restoreUnitId)
        ? options.restoreUnitId
        : null;
  };

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
    applyLoadedSelection();
    renderLearningPath();
  } catch (error) {
    console.warn('Could not load learning path from backend, using local content', error);
    learningPathState.lessons = getLocalFallbackLessons(
      learningPathState.language,
      learningPathState.level
    );
    applyLoadedSelection();
    renderLearningPath();
  }

  // Single choke point for every caller (language/level selects,
  // setTargetLanguage, the hash-restore paths in showView/renderSkillView/
  // bootstrapLearningPath) - updates the hash to the language+level+unit+
  // lesson that actually finished loading, rather than each caller having to
  // remember to do it (and risk using the pre-fetch, stale unitId/activeSlug -
  // see applyLoadedSelection above). No-ops when the current view isn't
  // 'learn' or a skill view (see updateLearnHash's own guard).
  updateLearnHash(getViewFromHash());
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
    celebrateActivityCompletion();
  } catch (error) {
    console.error('Could not complete lesson', error);
    showHomeToast(error.message || 'No se pudo completar la lección.');
    renderLessonWorkspace();
  }
}

refreshLanguagePairChrome();
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

  const unitActionBtn = event.target.closest('.unit-action-btn');
  if (unitActionBtn) {
    openLesson(unitActionBtn.dataset.lessonSlug);
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
    history.pushState(null, '', '/');
    showView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (window.innerWidth > 1100) {
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
  // #premium (the Free/Premium plans section) lives at the end of the home
  // view now, not as its own nav destination - see handleHomeAction's
  // 'upgrade' case, which stays on/goes to 'home' and scrolls to it instead
  // of routing to a dedicated 'premium' view.
  home: ['.hero', '#language-picker', '#premium'],
  learn: ['#learning-path'],
  progress: ['#progress'],
  achievements: ['#achievements'],
  security: ['#security'],
  goals: ['#goals'],
  tutor: ['#tutor'],
  translator: ['#translator'],
  about: ['#about'],
  listening: ['#listening'],
  speaking: ['#speaking'],
  reading: ['#reading'],
  writing: ['#writing'],
  grammar: ['#grammar'],
  vocabulary: ['#vocabulary'],
  'reset-password': ['#resetPasswordSection'],
  'email-confirmed': ['#emailConfirmedSection']
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
  translator: '#translator h2',
  about: '#about h2',
  listening: '#listening h2',
  speaking: '#speaking h2',
  reading: '#reading h2',
  writing: '#writing h2',
  grammar: '#grammar h2',
  vocabulary: '#vocabulary h2'
};

function getViewFromHash() {
  // Only the first /-separated segment is the view id - 'learn' and skill
  // views can carry /<language>/<level>/<unitId>/<lessonSlug> after it (see
  // updateLearnHash/parseLearnHashState below), which used to make this
  // whole lookup miss (VIEW_SECTIONS['reading/french/A1/...'] is undefined)
  // and silently fall back to 'home'.
  const raw = window.location.hash.replace('#', '').split('/')[0];
  if (!raw) return 'home';
  if (raw.startsWith('language-') || targetLanguageMap[raw]) return 'learn';
  return VIEW_SECTIONS[raw] ? raw : 'home';
}

// Parses the optional /<language>/<level>/<unitId>/<lessonSlug> segments a
// 'learn' or skill-view hash can carry after the view id - e.g.
// #reading/french/A1/french-a1-unit-02/french-a1-unit-02-reading-01, written
// by updateLearnHash() below. Any/all of these can be absent (plain
// #reading, or the legacy #language-french marketing links keep working
// unchanged since they never match VIEW_SECTIONS as a view id here).
function parseLearnHashState() {
  const [, language, level, unitId, lessonSlug] = window.location.hash
    .replace('#', '')
    .split('/');
  return {
    language: language && languageDisplayNames[language] ? language : null,
    level: level || null,
    unitId: unitId || null,
    lessonSlug: lessonSlug || null
  };
}

// Keeps the hash in sync with language/level/unit/lesson for 'learn' and
// skill views, so reload, Back/Forward (via the popstate listener below),
// and sharing the link restore the exact same content instead of always
// landing on whichever unit/lesson happens to load first. Every other view
// keeps its plain #viewId hash untouched.
function updateLearnHash(viewOverride) {
  const view = viewOverride || getViewFromHash();
  if (view !== 'learn' && !SKILL_VIEWS.includes(view)) return;
  const parts = [view, learningPathState.language, learningPathState.level];
  if (learningPathState.unitId) {
    parts.push(learningPathState.unitId);
    if (learningPathState.activeSlug) parts.push(learningPathState.activeSlug);
  }
  const next = `#${parts.join('/')}`;
  if (window.location.hash !== next) history.pushState(null, '', next);
}

function showView(viewId) {
  const resolved = VIEW_SECTIONS[viewId] ? viewId : 'home';

  // Any navigation away from the current view must release the mic and
  // drop any in-progress Speaking recording - a no-op when nothing is active.
  resetSpeakingRecorder();
  stopTutorDictation();
  stopTranslatorDictation();
  // Same rule for reading audio - no view change should leave a reading
  // playing in the background (also a no-op when nothing is attached).
  readingSpeechPlayer.teardown();

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
  updateLevelTabLabels();

  // Restores language/level/unit/lesson from the hash for 'learn' and skill
  // views (see updateLearnHash/parseLearnHashState) - only once lessons are
  // already loaded (cold-boot restore is handled separately by
  // renderSkillView's own loading guard and bootstrapLearningPath, since
  // learningPathState.lessons is still empty at that point).
  if ((resolved === 'learn' || SKILL_VIEWS.includes(resolved)) && learningPathState.lessons.length) {
    const hashState = parseLearnHashState();
    const languageChanged = hashState.language && hashState.language !== learningPathState.language;
    const levelChanged = hashState.level && hashState.level !== learningPathState.level;
    if (languageChanged || levelChanged) {
      const nextLanguage = hashState.language || learningPathState.language;
      const pathLanguageSelect = document.getElementById('pathLanguageSelect');
      if (pathLanguageSelect) pathLanguageSelect.value = nextLanguage;
      loadLearningPath({
        language: nextLanguage,
        level: hashState.level || learningPathState.level,
        restoreUnitId: hashState.unitId,
        restoreSlug: hashState.lessonSlug
      }).then(() => {
        if (SKILL_VIEWS.includes(resolved)) renderSkillView(resolved);
        updateLearnHash(resolved);
      });
    } else {
      let changed = false;
      if (
        hashState.lessonSlug &&
        hashState.lessonSlug !== learningPathState.activeSlug &&
        learningPathState.lessons.some((item) => item.slug === hashState.lessonSlug)
      ) {
        setActiveLesson(hashState.lessonSlug);
        changed = true;
      } else if (
        hashState.unitId &&
        hashState.unitId !== learningPathState.unitId &&
        learningPathState.units.some((unit) => unit.id === hashState.unitId)
      ) {
        selectUnit(hashState.unitId, { render: false });
        changed = true;
      }
      if (changed && resolved === 'learn') renderLearningPath();
    }
  }

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
    refreshTutorUsageCounter();
  }
  if (resolved === 'translator') syncTranslatorLanguagesFromState();
  if (resolved === 'progress' || resolved === 'goals') loadDashboard();
  if (resolved === 'security') loadSecurityStatus();
  if (SKILL_VIEWS.includes(resolved)) renderSkillView(resolved);

  // Normalizes the hash to reflect the state that actually just rendered -
  // covers plain nav-tab clicks (<a href="#reading">, no unit/lesson
  // suffix), which would otherwise "forget" the previously selected
  // unit/lesson in the address bar even though the content itself is still
  // correct. A no-op when nothing changed (updateLearnHash only pushes when
  // the computed hash differs from the current one).
  // Guarded on lessons.length: on a cold load this fires before
  // bootstrapLearningPath has fetched anything, with learningPathState still
  // at its english/A1 defaults - without this guard it would overwrite a
  // deep-linked hash (e.g. #reading/french/A1/...) with those defaults
  // before bootstrapLearningPath's own parseLearnHashState() ever reads it.
  if ((resolved === 'learn' || SKILL_VIEWS.includes(resolved)) && learningPathState.lessons.length) {
    updateLearnHash(resolved);
  }

  // The floating Tutor IA button is redundant on the dedicated Tutor view,
  // and the drawer shouldn't stay open across a navigation - it loses
  // whatever context it had anyway.
  document.getElementById('tutorFab')?.toggleAttribute('hidden', resolved === 'tutor');
  closeTutorDrawer();

  window.scrollTo({ top: 0, behavior: 'auto' });
  document.querySelector(VIEW_TITLE_SELECTORS[resolved])?.focus({ preventScroll: true });
}

window.addEventListener('hashchange', () => {
  showView(getViewFromHash());
  // A plain <a href="#premium"> (nav/footer) fires a real hashchange, unlike
  // handleHomeAction's 'upgrade' case above - #premium resolves to the home
  // view (it's no longer its own VIEW_SECTIONS entry), so land on it too.
  if (window.location.hash === '#premium') {
    window.setTimeout(() => {
      document.getElementById('premium')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
});

// goTo() (handleHomeAction) navigates via history.pushState, which never
// fires 'hashchange' - only a real link click or address-bar edit does.
// Without this, the browser's Back/Forward buttons moved the URL bar but
// left the previous view rendered on screen.
window.addEventListener('popstate', () => showView(getViewFromHash()));

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

// Purely visual reaction to an activity being completed - called right
// after showHomeToast()'s "+X XP" toast at each completion call site
// (Speaking/Listening/lesson workspace). Never reads or writes
// scoring/progress data, only reacts to it once the server has already
// confirmed completion. Confetti node creation is skipped under
// prefers-reduced-motion since CSS alone can animate a burst away
// instantly but can't prevent the DOM churn of creating it.
function celebrateActivityCompletion() {
  const toast = document.querySelector('.home-toast');
  toast?.classList.add('xp-celebrate');
  window.setTimeout(() => toast?.classList.remove('xp-celebrate'), 700);

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const burst = document.createElement('div');
  burst.className = 'confetti-burst';
  const pieceCount = 18;
  for (let i = 0; i < pieceCount; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = `var(--confetti-${(i % 4) + 1})`;
    piece.style.animationDelay = `${Math.random() * 200}ms`;
    burst.appendChild(piece);
  }
  document.body.appendChild(burst);
  window.setTimeout(() => burst.remove(), 1500);
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
      // #premium now lives at the end of the home view (see VIEW_SECTIONS)
      // instead of being its own destination - go home, then scroll to it,
      // same pattern as 'explore-languages' below.
      goTo('home');
      window.setTimeout(() => {
        document.getElementById('premium')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      showHomeToast(`Plan premium único: USD ${premiumPriceUsd}.`);
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
    case 'explore-espanol':
      setTargetLanguage('espanol');
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
      const target = dictateBtn.dataset.dictateTarget;
      // Only the drawer's own textarea (tutorDrawerPrompt) can be in
      // Premium conversation mode - the in-page #tutor variant always uses
      // plain single-shot dictation, same as before.
      if (target === 'tutorDrawerPrompt' && tutorConversationMode) {
        startTutorDictation(target, { continuous: true, silenceMs: 2000, autoSend: true });
      } else {
        startTutorDictation(target);
      }
      return;
    }
    const dictateStopBtn = event.target.closest('.tutor-dictate-stop-btn');
    if (dictateStopBtn) {
      stopTutorDictation();
      return;
    }

    if (event.target.closest('.translator-dictate-btn')) {
      startTranslatorDictation();
      return;
    }
    if (event.target.closest('.translator-dictate-stop-btn')) {
      stopTranslatorDictation();
      return;
    }

    if (event.target.closest('[data-action="open-forgot-password"]')) {
      setAuthMessage('');
      resetForgotPasswordForm();
      openModal('forgotPassword');
      return;
    }
    if (event.target.closest('[data-action="back-to-login"]')) {
      setAuthMessage('');
      resetForgotPasswordForm();
      clearPendingMfa();
      openModal('login');
      return;
    }
    if (event.target.closest('[data-action="dismiss-username-onboarding"]')) {
      closeUsernameOnboarding();
      // Session-only, not a source of truth for "has a username" (that's
      // always profiles.username_normalized/username) - just stops this
      // same tab from reopening the modal on every nav change for the rest
      // of the session. A brand new session (new login) re-evaluates fresh.
      sessionStorage.setItem(USERNAME_ONBOARDING_DISMISSED_KEY, 'true');
      return;
    }

    // A locked lesson's "Desbloquear" button (see renderLessonWorkspace's
    // premium-lock-box) opens the same paywall modal used for usage-limit
    // lockouts instead of navigating away to the plans section - the
    // student is already looking at exactly what they'd unlock.
    if (event.target.closest('[data-action="open-lesson-paywall"]')) {
      openPaywallModal({
        title: 'Esta lección es Premium.',
        message: `Desbloquea esta lección y toda la ruta por USD ${premiumPriceUsd}.`
      });
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
        learningPathState.language
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
            questionItem.dataset.language || learningPathState.language
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

    // Reading comprehension quiz (see renderReadingComprehensionQuiz above):
    // selecting an option only stores the pick locally (radio-like - picking
    // another option in the same question swaps it, nothing is graded yet).
    const readingCompOption = event.target.closest('.reading-comp-option');
    if (readingCompOption) {
      if (readingCompOption.disabled) return;
      const questionItem = readingCompOption.closest('.reading-comp-question');
      const slug = questionItem?.dataset.lessonSlug;
      if (!questionItem || !slug) return;

      const runtime = getReadingComprehensionRuntime(slug);
      if (runtime.graded || runtime.grading) return;

      const exerciseIndex = Number(questionItem.dataset.exerciseIndex);
      runtime.selections[exerciseIndex] = readingCompOption.dataset.optionKey;
      runtime.error = '';

      const currentView = getViewFromHash();
      if (SKILL_VIEWS.includes(currentView)) {
        renderSkillView(currentView);
      } else {
        renderLessonWorkspace();
      }
      return;
    }

    // "Calificar": grades every comprehension question at once against the
    // real (server-side-only) answer key, then shows the 0-100 score.
    const readingCompSubmitBtn = event.target.closest('.reading-comp-submit-btn');
    if (readingCompSubmitBtn) {
      if (readingCompSubmitBtn.disabled) return;
      const slug = readingCompSubmitBtn.dataset.lessonSlug;
      const lesson = learningPathState.lessons.find((item) => item.slug === slug);
      if (!lesson) return;

      const runtime = getReadingComprehensionRuntime(slug);
      const comprehensionEntries = (lesson.exercises || [])
        .map((item, exerciseIndex) => ({ item, exerciseIndex }))
        .filter(({ item }) => item.type === 'mcq' && !isTrueFalseExercise(item));
      const unanswered = comprehensionEntries.some(
        ({ exerciseIndex }) => runtime.selections[exerciseIndex] == null
      );
      if (unanswered || runtime.grading) return;

      runtime.grading = true;
      runtime.error = '';
      readingCompSubmitBtn.disabled = true;
      readingCompSubmitBtn.textContent = 'Calificando…';

      try {
        const gradedResults = await Promise.all(
          comprehensionEntries.map(async ({ item, exerciseIndex }) => {
            const selected = runtime.selections[exerciseIndex];
            const payload = item.id
              ? { exerciseId: item.id, selectedOptionId: selected }
              : { index: exerciseIndex, selectedOption: Number(selected) };
            const response = await fetch(`${backendBaseUrl}/api/lessons/${slug}/check-answer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'No se pudo calificar. Intenta de nuevo.');

            // Only the key of the correct option comes back from the server
            // (never the answer itself ahead of time) - the option's own
            // text is already public in the client bundle, so this just
            // looks up the matching option locally to build a human label.
            const correctKey = data.correctOption ?? data.correctOptionId ?? null;
            const correctOptionIndex = (item.options || []).findIndex(
              (option, optionIndex) => String(optionKey(option, optionIndex)) === String(correctKey)
            );
            const correctLabel =
              correctOptionIndex >= 0
                ? `${String.fromCharCode(65 + correctOptionIndex)}. ${optionLabel(item.options[correctOptionIndex])}`
                : '';

            return {
              exerciseIndex,
              correct: Boolean(data.correct),
              correctOption: correctKey,
              correctLabel,
              selectedOption: selected
            };
          })
        );

        gradedResults.forEach((result) => {
          runtime.results[result.exerciseIndex] = result;
          learningPathState.exerciseResults[slug] = learningPathState.exerciseResults[slug] || {};
          learningPathState.exerciseResults[slug][result.exerciseIndex] = {
            selectedOption: result.selectedOption,
            correct: result.correct
          };
        });
        runtime.graded = true;
        runtime.grading = false;

        const correctCount = gradedResults.filter((r) => r.correct).length;
        if (correctCount > 0) {
          window.AndergoGamification?.recordSkillTouched('reading', learningPathState.language);
        }
        for (let i = 0; i < correctCount; i += 1) window.AndergoGamification?.recordCorrectAnswer();
      } catch (error) {
        runtime.grading = false;
        runtime.error = error.message || 'No se pudo calificar. Intenta de nuevo.';
      }

      const currentView = getViewFromHash();
      if (SKILL_VIEWS.includes(currentView)) {
        renderSkillView(currentView);
      } else {
        renderLessonWorkspace();
      }
      return;
    }

    // "Intentar de nuevo": clears selections/results and returns the score
    // to zero without touching the questions themselves or re-fetching the
    // reading (see resetReadingComprehensionRuntime above).
    const readingCompRetryBtn = event.target.closest('.reading-comp-retry-btn');
    if (readingCompRetryBtn) {
      const slug = readingCompRetryBtn.dataset.lessonSlug;
      if (!slug) return;
      const lesson = learningPathState.lessons.find((item) => item.slug === slug);

      resetReadingComprehensionRuntime(slug);
      if (lesson && learningPathState.exerciseResults[slug]) {
        (lesson.exercises || []).forEach((item, exerciseIndex) => {
          if (item.type === 'mcq' && !isTrueFalseExercise(item)) {
            delete learningPathState.exerciseResults[slug][exerciseIndex];
          }
        });
      }

      const currentView = getViewFromHash();
      if (SKILL_VIEWS.includes(currentView)) {
        renderSkillView(currentView);
      } else {
        renderLessonWorkspace();
      }
      return;
    }

    // Scored Grammar test (see renderGrammarTestView and friends above).
    // Every handler below resolves the active lesson the same way the
    // Listening "regenerate" handler above does: via the enclosing
    // .skill-view-section's data-active-lesson-slug, not a slug stashed on
    // the clicked element itself.
    function getGrammarTestContext(target) {
      const skillSection = target.closest('.skill-view-section');
      const lesson = learningPathState.lessons.find(
        (item) => item.slug === skillSection?.dataset.activeLessonSlug
      );
      const content = skillSection?.querySelector('.skill-view-content');
      if (!lesson?.extra?.grammarTest?.questions?.length || !content) return null;
      return { lesson, content, test: lesson.extra.grammarTest, runtime: getGrammarTestRuntime(lesson) };
    }

    const grammarTestStartBtn = event.target.closest('.grammar-test-start-btn');
    if (grammarTestStartBtn) {
      const ctx = getGrammarTestContext(grammarTestStartBtn);
      if (!ctx) return;
      ctx.runtime.phase = 'question';
      ctx.runtime.currentIndex = 0;
      renderGrammarTestView(ctx.content, ctx.lesson);
      return;
    }

    const grammarTestOption = event.target.closest('.grammar-test-option');
    if (grammarTestOption) {
      const optionsWrap = grammarTestOption.closest('.grammar-test-options');
      optionsWrap
        ?.querySelectorAll('.grammar-test-option')
        .forEach((btn) => btn.classList.remove('is-selected'));
      grammarTestOption.classList.add('is-selected');
      return;
    }

    const grammarTestPrevBtn = event.target.closest('.grammar-test-prev-btn');
    if (grammarTestPrevBtn) {
      const ctx = getGrammarTestContext(grammarTestPrevBtn);
      if (!ctx) return;
      collectGrammarTestAnswer(ctx.content, ctx.test, ctx.runtime);
      ctx.runtime.currentIndex = Math.max(0, ctx.runtime.currentIndex - 1);
      renderGrammarTestView(ctx.content, ctx.lesson);
      return;
    }

    const grammarTestNextBtn = event.target.closest('.grammar-test-next-btn');
    if (grammarTestNextBtn) {
      const ctx = getGrammarTestContext(grammarTestNextBtn);
      if (!ctx) return;
      collectGrammarTestAnswer(ctx.content, ctx.test, ctx.runtime);
      if (ctx.runtime.currentIndex >= ctx.test.questions.length - 1) {
        ctx.runtime.phase = 'review';
      } else {
        ctx.runtime.currentIndex += 1;
      }
      renderGrammarTestView(ctx.content, ctx.lesson);
      return;
    }

    const grammarTestReviewEditBtn = event.target.closest('.grammar-test-review-edit-btn');
    if (grammarTestReviewEditBtn) {
      const ctx = getGrammarTestContext(grammarTestReviewEditBtn);
      if (!ctx) return;
      ctx.runtime.currentIndex = Number(grammarTestReviewEditBtn.dataset.questionIndex) || 0;
      ctx.runtime.phase = 'question';
      renderGrammarTestView(ctx.content, ctx.lesson);
      return;
    }

    const grammarTestRetryBtn = event.target.closest('.grammar-test-retry-btn');
    if (grammarTestRetryBtn) {
      const ctx = getGrammarTestContext(grammarTestRetryBtn);
      if (!ctx) return;
      grammarTestState.set(ctx.lesson.slug, {
        phase: 'question',
        currentIndex: 0,
        answers: {},
        lastResult: null
      });
      renderGrammarTestView(ctx.content, ctx.lesson);
      return;
    }

    const grammarTestSubmitBtn = event.target.closest('.grammar-test-submit-btn');
    if (grammarTestSubmitBtn) {
      const ctx = getGrammarTestContext(grammarTestSubmitBtn);
      if (!ctx || grammarTestSubmitBtn.disabled) return;

      if (!authStatus.session?.access_token) {
        setAuthMessage('Crea tu cuenta gratis para guardar el resultado de tu prueba.');
        openModal('signup');
        return;
      }

      const { lesson, content, test, runtime } = ctx;
      grammarTestSubmitBtn.disabled = true;
      grammarTestSubmitBtn.textContent = 'Enviando...';

      try {
        const answers = test.questions.map((q) => ({ questionId: q.id, answer: runtime.answers[q.id] }));
        const response = await fetch(`${backendBaseUrl}/api/lessons/${lesson.slug}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ answers })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'No se pudo enviar la prueba.');

        lesson.completed = true;
        if (data.bestScore != null) lesson.bestScore = data.bestScore;
        updateProgressDisplay(data, true);
        renderSkillCards();
        window.AndergoGamification?.recordLessonCompletion({
          slug: lesson.slug,
          language: learningPathState.language,
          score: data.score ?? 100,
          xpReward: lesson.xpReward || 20
        });
        window.AndergoGamification?.syncFromServer(data);
        if (data.newBadges?.length) {
          data.newBadges.forEach((badge) =>
            showCelebration(`🏅 ¡Insignia desbloqueada! ${badge.label}`)
          );
        }
        if (data.leveledUp) showCelebration(`🎉 ¡Subiste a nivel ${data.level}!`);
        showHomeToast(`Prueba completada. +${data.earnedXp || lesson.xpReward || 20} XP`);
        celebrateActivityCompletion();

        runtime.lastResult = data;
        runtime.phase = 'results';
        renderGrammarTestView(content, lesson);
      } catch (error) {
        grammarTestSubmitBtn.disabled = false;
        grammarTestSubmitBtn.textContent = 'Enviar prueba';
        showHomeToast(error.message || 'No se pudo enviar la prueba.');
      }
      return;
    }

    // Scored Listening Comprehension (see renderListeningComprehensionPanel
    // and friends above) - same shape/endpoint as the Grammar test handlers
    // just above, but resolves into .listening-mode-panel (one tab among
    // Escuchar/Diálogos/Dictado/Transcripción/Transcripción fonética)
    // instead of the whole .skill-view-content, and reads
    // lesson.extra.listeningComprehension instead of lesson.extra.grammarTest.
    function getListeningComprehensionContext(target) {
      const skillSection = target.closest('.skill-view-section');
      const lesson = learningPathState.lessons.find(
        (item) => item.slug === skillSection?.dataset.activeLessonSlug
      );
      const panel = skillSection?.querySelector('.listening-mode-panel');
      if (!lesson?.extra?.listeningComprehension?.questions?.length || !panel) return null;
      return {
        lesson,
        content: skillSection.querySelector('.skill-view-content'),
        panel,
        bank: lesson.extra.listeningComprehension,
        runtime: getListeningComprehensionRuntime(lesson)
      };
    }

    const listeningCompStartBtn = event.target.closest('.listening-comp-start-btn');
    if (listeningCompStartBtn) {
      const ctx = getListeningComprehensionContext(listeningCompStartBtn);
      if (!ctx) return;
      ctx.runtime.phase = 'question';
      ctx.runtime.currentIndex = 0;
      ctx.panel.innerHTML = renderListeningComprehensionPanel(ctx.lesson);
      return;
    }

    const listeningCompPrevBtn = event.target.closest('.listening-comp-prev-btn');
    if (listeningCompPrevBtn) {
      const ctx = getListeningComprehensionContext(listeningCompPrevBtn);
      if (!ctx) return;
      collectGrammarTestAnswer(ctx.panel, ctx.bank, ctx.runtime);
      ctx.runtime.currentIndex = Math.max(0, ctx.runtime.currentIndex - 1);
      ctx.panel.innerHTML = renderListeningComprehensionPanel(ctx.lesson);
      return;
    }

    const listeningCompNextBtn = event.target.closest('.listening-comp-next-btn');
    if (listeningCompNextBtn) {
      const ctx = getListeningComprehensionContext(listeningCompNextBtn);
      if (!ctx) return;
      collectGrammarTestAnswer(ctx.panel, ctx.bank, ctx.runtime);
      if (ctx.runtime.currentIndex >= ctx.bank.questions.length - 1) {
        ctx.runtime.phase = 'review';
      } else {
        ctx.runtime.currentIndex += 1;
      }
      ctx.panel.innerHTML = renderListeningComprehensionPanel(ctx.lesson);
      return;
    }

    const listeningCompReviewEditBtn = event.target.closest('.listening-comp-review-edit-btn');
    if (listeningCompReviewEditBtn) {
      const ctx = getListeningComprehensionContext(listeningCompReviewEditBtn);
      if (!ctx) return;
      ctx.runtime.currentIndex = Number(listeningCompReviewEditBtn.dataset.questionIndex) || 0;
      ctx.runtime.phase = 'question';
      ctx.panel.innerHTML = renderListeningComprehensionPanel(ctx.lesson);
      return;
    }

    const listeningCompRetryBtn = event.target.closest('.listening-comp-retry-btn');
    if (listeningCompRetryBtn) {
      const ctx = getListeningComprehensionContext(listeningCompRetryBtn);
      if (!ctx) return;
      listeningComprehensionState.set(ctx.lesson.slug, {
        phase: 'question',
        currentIndex: 0,
        answers: {},
        lastResult: null
      });
      ctx.panel.innerHTML = renderListeningComprehensionPanel(ctx.lesson);
      return;
    }

    const listeningCompSubmitBtn = event.target.closest('.listening-comp-submit-btn');
    if (listeningCompSubmitBtn) {
      const ctx = getListeningComprehensionContext(listeningCompSubmitBtn);
      if (!ctx || listeningCompSubmitBtn.disabled) return;

      if (!authStatus.session?.access_token) {
        setAuthMessage('Crea tu cuenta gratis para guardar el resultado de esta prueba.');
        openModal('signup');
        return;
      }

      const { lesson, panel, bank, runtime } = ctx;
      listeningCompSubmitBtn.disabled = true;
      listeningCompSubmitBtn.textContent = 'Enviando...';

      try {
        const answers = bank.questions.map((q) => ({ questionId: q.id, answer: runtime.answers[q.id] }));
        const response = await fetch(`${backendBaseUrl}/api/lessons/${lesson.slug}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ answers })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'No se pudo enviar la prueba.');

        lesson.completed = true;
        if (data.bestScore != null) lesson.listeningComprehensionBestScore = data.bestScore;
        updateProgressDisplay(data, true);
        renderSkillCards();
        window.AndergoGamification?.recordLessonCompletion({
          slug: lesson.slug,
          language: learningPathState.language,
          score: data.score ?? 100,
          xpReward: lesson.xpReward || 20
        });
        window.AndergoGamification?.syncFromServer(data);
        if (data.newBadges?.length) {
          data.newBadges.forEach((badge) =>
            showCelebration(`🏅 ¡Insignia desbloqueada! ${badge.label}`)
          );
        }
        if (data.leveledUp) showCelebration(`🎉 ¡Subiste a nivel ${data.level}!`);
        showHomeToast(`Comprensión completada. +${data.earnedXp || lesson.xpReward || 20} XP`);
        celebrateActivityCompletion();

        runtime.lastResult = data;
        runtime.phase = 'results';
        panel.innerHTML = renderListeningComprehensionPanel(lesson);
      } catch (error) {
        listeningCompSubmitBtn.disabled = false;
        listeningCompSubmitBtn.textContent = 'Enviar';
        showHomeToast(error.message || 'No se pudo enviar la prueba.');
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
        exerciseBlock.dataset.language || learningPathState.language
      );

      renderLessonWorkspace();
      return;
    }

    const tutorClearButton = event.target.closest('.tutor-clear-btn');
    if (tutorClearButton) {
      const conversation = document.getElementById('tutorConversation');
      if (conversation) {
        conversation.innerHTML =
          '<p class="tutor-welcome">👋 Soy el Tutor IA ANDERGO Academy. Pregúntame lo que quieras sobre esta habilidad, nivel o lección, y te ayudo con correcciones, ejemplos y práctica.</p>';
      }
      return;
    }

    const tutorButton = event.target.closest('.tutor-chat-btn');
    if (tutorButton) {
      primeTutorAudioForAutoplay();
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
        bridgeLanguage: learningPathState.bridgeLanguage,
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
        currentActivity: `Practicando ${getSkillLabel(skill)}`,
        prefill: openTutorBtn.dataset.tutorPrompt || '',
        transcript: openTutorBtn.dataset.tutorTranscript || '',
        vocabulary: openTutorBtn.dataset.tutorVocabulary || '',
        currentQuestion: openTutorBtn.dataset.tutorCurrentQuestion || '',
        selectedAnswer: openTutorBtn.dataset.tutorSelectedAnswer || ''
      });
      return;
    }

    // "Traducir" shortcuts from Reading/Grammar/Vocabulary/Speaking - see
    // openTranslator(). Always translates target-language content back into
    // the student's bridge language; data-return-label lets each view name
    // itself in "‹ Volver a ...".
    const openTranslatorBtn = event.target.closest('.open-translator-btn');
    if (openTranslatorBtn) {
      openTranslator({
        text: openTranslatorBtn.dataset.translateText || '',
        sourceLanguage: learningPathState.language,
        targetLanguage: learningPathState.bridgeLanguage,
        returnHash: window.location.hash || '#learn',
        returnLabel: openTranslatorBtn.dataset.returnLabel || 'Volver a la lección'
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
    const tutorVoicePauseBtn = event.target.closest('.tutor-voice-pause');
    if (tutorVoicePauseBtn) {
      toggleTutorVoicePause(tutorVoicePauseBtn.closest('.tutor-message'));
      return;
    }
    const tutorVoiceRewindBtn = event.target.closest('.tutor-voice-rewind');
    if (tutorVoiceRewindBtn) {
      rewindTutorVoice(5);
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
        .forEach((btn) => {
          const isActive = btn === tutorVoiceSpeedBtn;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-pressed', String(isActive));
        });
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
    if (event.target.closest('.reading-print-btn') || event.target.closest('.skill-print-btn')) {
      // window.print() itself rarely throws, but embedding contexts that
      // block it (some sandboxed iframes/webviews) do - never leave the
      // student with silent nothing-happened.
      try {
        window.print();
      } catch {
        showHomeToast('No pudimos generar el PDF. Inténtalo nuevamente.');
      }
      return;
    }

    if (event.target.closest('.vocab-shuffle-btn')) {
      // Fisher-Yates on the display-order array only - lesson.vocabulary
      // itself (and therefore the underlying test exercises' indices) never
      // changes, so "Mezclar tarjetas" only reorders what the student sees.
      for (let i = vocabCardOrder.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [vocabCardOrder[i], vocabCardOrder[j]] = [vocabCardOrder[j], vocabCardOrder[i]];
      }
      const activeSection = event.target.closest('.skill-view-section');
      const activeLesson = activeSection ? getActiveLearningLesson() : null;
      if (activeSection && activeLesson) renderVocabularyView(activeSection, activeLesson);
      return;
    }

    // Full-reading audio player (spec section A/C) - the only controls that
    // move forward/back through a reading; they act on the audio only and
    // never touch which text is visible (no pagination, no part viewer). A
    // single toggle button cycles Reproducir -> Pausar -> Continuar ->
    // Pausar..., the rest are one-shot actions on the shared
    // readingSpeechPlayer singleton.
    const readingAudioPlayPauseBtn = event.target.closest('.reading-audio-playpause-btn');
    if (readingAudioPlayPauseBtn) {
      const snap = readingSpeechPlayer.getSnapshot();
      if (snap.state === 'playing') readingSpeechPlayer.pauseReading();
      else if (snap.state === 'paused') readingSpeechPlayer.resumeReading();
      else readingSpeechPlayer.playReading();
      return;
    }
    const readingAudioRewindBtn = event.target.closest('.reading-audio-rewind-btn');
    if (readingAudioRewindBtn) {
      readingSpeechPlayer.rewindReading(5);
      return;
    }
    const readingAudioStopBtn = event.target.closest('.reading-audio-stop-btn');
    if (readingAudioStopBtn) {
      readingSpeechPlayer.stopReading();
      return;
    }
    const readingAudioVoiceBtn = event.target.closest('.reading-audio-voice-btn');
    if (readingAudioVoiceBtn) {
      readingSpeechPlayer.changeReadingVoice();
      return;
    }
    const readingAudioRateBtn = event.target.closest('.reading-audio-rate-btn');
    if (readingAudioRateBtn) {
      readingSpeechPlayer.changeReadingRate(readingAudioRateBtn.dataset.rate);
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
        bridgeLanguage: learningPathState.bridgeLanguage,
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

    // Header speaker button - plays the target word without flipping the
    // card. stopPropagation keeps it from also falling through to the
    // "tap anywhere flips" handler below. Marks itself "is-playing" while
    // speaking (speakText's onEnd clears it) so the playing state is
    // visible, not just audible.
    const vocabAudioBtn = event.target.closest('.vocab-card-audio-btn');
    if (vocabAudioBtn) {
      event.stopPropagation();
      const card = vocabAudioBtn.closest('.vocab-card');
      if (card) {
        vocabAudioBtn.classList.add('is-playing');
        speakText(card.dataset.speakText, {
          locale: card.dataset.speakLocale,
          rate: Number(card.dataset.speakRate) || 1,
          onEnd: () => vocabAudioBtn.classList.remove('is-playing')
        });
      }
      return;
    }
    // Each context's own speaker button on the back of the card (only
    // rendered when there's a context sentence to speak).
    const vocabExampleAudioBtn = event.target.closest('.vocab-example-audio-btn');
    if (vocabExampleAudioBtn) {
      event.stopPropagation();
      vocabExampleAudioBtn.classList.add('is-playing');
      speakText(vocabExampleAudioBtn.dataset.speakText, {
        locale: vocabExampleAudioBtn.dataset.speakLocale,
        rate: Number(vocabExampleAudioBtn.dataset.speakRate) || 1,
        onEnd: () => vocabExampleAudioBtn.classList.remove('is-playing')
      });
      return;
    }
    const vocabKnowBtn = event.target.closest('.vocab-know-btn');
    if (vocabKnowBtn) {
      event.stopPropagation();
      setVocabCardMastery(vocabKnowBtn.closest('.vocab-card'), 'mastered');
      return;
    }
    const vocabRetryBtn = event.target.closest('.vocab-retry-btn');
    if (vocabRetryBtn) {
      event.stopPropagation();
      setVocabCardMastery(vocabRetryBtn.closest('.vocab-card'), 'practicing');
      return;
    }
    const vocabBackBtn = event.target.closest('.vocab-back-btn');
    if (vocabBackBtn) {
      event.stopPropagation();
      flipVocabCard(vocabBackBtn.closest('.vocab-card'), { toBack: false });
      return;
    }
    // Tapping any free area of the card flips it: front -> back speaks the
    // target word once (via flipVocabCard's speak option), back -> front
    // stays silent. Only fires when the click wasn't already handled by a
    // more specific control above.
    const vocabCardBody = event.target.closest('.vocab-card');
    if (vocabCardBody) {
      const isFlipped = vocabCardBody.dataset.flipped === 'true';
      flipVocabCard(vocabCardBody, { toBack: !isFlipped, speak: !isFlipped });
      return;
    }
  });

  document.getElementById('tutorFab')?.addEventListener('click', () => openTutorDrawer());

  document.getElementById('tutorDrawerSend')?.addEventListener('click', async () => {
    primeTutorAudioForAutoplay();
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
      bridgeLanguage: learningPathState.bridgeLanguage,
      lessonTitle: tutorDrawerContext.lessonTitle,
      lessonIntro: tutorDrawerContext.lessonIntro,
      lessonSlug: tutorDrawerContext.lessonSlug,
      currentActivity:
        tutorDrawerContext.currentActivity ||
        `Practicando ${getSkillLabel(tutorDrawerContext.skill)}`,
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
        '<p class="tutor-welcome">👋 Soy el Tutor IA ANDERGO Academy. Cuéntame qué quieres practicar.</p>';
  });

  document.getElementById('tutorDrawerPrompt')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    document.getElementById('tutorDrawerSend')?.click();
  });

  const autoplayToggle = document.getElementById('tutorAutoplayToggle');
  if (autoplayToggle) {
    autoplayToggle.checked = getTutorAutoplayPref();
    autoplayToggle.addEventListener('change', () => {
      setTutorAutoplayPref(autoplayToggle.checked);
    });
  }

  document.getElementById('tutorConversationToggle')?.addEventListener('click', () => {
    handleTutorConversationToggleClick();
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
  document
    .getElementById('pathSwapLanguagesBtn')
    ?.addEventListener('click', () => swapLearningPathLanguages());
}

function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.section-heading, .features-grid article, .plan, .missions-panel, .badges-panel, .goal-card, .download-box, .course-card, .how-it-works-step'
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

// ---------------------------------------------------------------------
// Translator (#translator) - English/French/Spanish only, matching the rest
// of the public frontend. Always calls POST /api/translator (never Azure
// directly - see lib/translatorService.js); when that route reports
// configured:false this shows the pending-configuration message instead of
// ever fabricating a translation.
// Local-only translation history (never sent anywhere) - last
// TRANSLATOR_HISTORY_LIMIT entries, most recent first. Kept as a plain
// localStorage array rather than anything server-side, matching "historial
// local opcional" - it's a convenience for the student's own browser, not
// account data.
const TRANSLATOR_HISTORY_KEY = 'andergo_translator_history';
const TRANSLATOR_HISTORY_LIMIT = 20;

function loadTranslatorHistory() {
  try {
    const raw = localStorage.getItem(TRANSLATOR_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTranslatorHistoryEntry(entry) {
  try {
    const history = [entry, ...loadTranslatorHistory()].slice(0, TRANSLATOR_HISTORY_LIMIT);
    localStorage.setItem(TRANSLATOR_HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch {
    return loadTranslatorHistory();
  }
}

function clearTranslatorHistory() {
  try {
    localStorage.removeItem(TRANSLATOR_HISTORY_KEY);
  } catch {
    /* ignore - private browsing / storage disabled */
  }
}

// Prefills the Traductor's own source/target selects from the platform's
// current bridge/target pair the first time the student lands on #translator
// in a given session - see translatorUserAdjustedPair's comment for why this
// stops once the student has picked a pair inside the Traductor itself.
// bridge->target (not the other way) matches the rest of the app's "Puente
// -> Objetivo" framing: translate what I want to say FROM my own language
// INTO the one I'm learning.
function syncTranslatorLanguagesFromState() {
  if (translatorUserAdjustedPair) return;
  const sourceSelect = document.getElementById('translatorSourceLang');
  const targetSelect = document.getElementById('translatorTargetLang');
  if (!sourceSelect || !targetSelect) return;
  const bridge = learningPathState.bridgeLanguage;
  const target = learningPathState.language;
  if ([...sourceSelect.options].some((opt) => opt.value === bridge)) sourceSelect.value = bridge;
  if ([...targetSelect.options].some((opt) => opt.value === target)) targetSelect.value = target;
}

// Opens the Traductor pre-filled with context from another view (Reading/
// Grammar/Vocabulary/Speaking's "Traducir" shortcuts) - the sibling of
// openTutorDrawer() for the Traductor. Defaults to translating FROM the
// target language INTO the bridge language (the "explain this to me"
// direction those shortcuts need), overridable via overrides.sourceLanguage/
// targetLanguage. overrides.returnHash/returnLabel wire up
// #translatorReturnLink so the student can get back to exactly where they
// were instead of hunting through the nav.
function openTranslator(overrides = {}) {
  const sourceSelect = document.getElementById('translatorSourceLang');
  const targetSelect = document.getElementById('translatorTargetLang');
  const input = document.getElementById('translatorInput');
  const returnLink = document.getElementById('translatorReturnLink');

  const sourceLang = overrides.sourceLanguage || learningPathState.language;
  const targetLang = overrides.targetLanguage || learningPathState.bridgeLanguage;
  if (sourceSelect && [...sourceSelect.options].some((opt) => opt.value === sourceLang)) {
    sourceSelect.value = sourceLang;
  }
  if (targetSelect && [...targetSelect.options].some((opt) => opt.value === targetLang)) {
    targetSelect.value = targetLang;
  }
  // An explicit shortcut always wins over the generic sync for the rest of
  // this session - the student (or the lesson view on their behalf) just
  // chose this pair on purpose.
  translatorUserAdjustedPair = true;

  if (input && overrides.text) {
    const maxLength = Number(input.getAttribute('maxlength')) || 1000;
    input.value = String(overrides.text).slice(0, maxLength);
    input.dispatchEvent(new Event('input'));
  }

  if (returnLink) {
    if (overrides.returnHash) {
      translatorReturnContext = {
        hash: overrides.returnHash,
        label: overrides.returnLabel || 'Volver a la lección'
      };
      returnLink.textContent = `‹ ${translatorReturnContext.label}`;
      returnLink.hidden = false;
    } else {
      translatorReturnContext = null;
      returnLink.hidden = true;
    }
  }

  if (window.location.hash !== '#translator') history.pushState(null, '', '#translator');
  showView('translator');
}

function setupTranslator() {
  const sourceSelect = document.getElementById('translatorSourceLang');
  const targetSelect = document.getElementById('translatorTargetLang');
  const swapBtn = document.getElementById('translatorSwapBtn');
  const input = document.getElementById('translatorInput');
  const output = document.getElementById('translatorOutput');
  const charCount = document.getElementById('translatorCharCount');
  const clearBtn = document.getElementById('translatorClearBtn');
  const copyBtn = document.getElementById('translatorCopyBtn');
  const listenSourceBtn = document.getElementById('translatorListenSourceBtn');
  const listenOutputBtn = document.getElementById('translatorListenOutputBtn');
  const submitBtn = document.getElementById('translatorSubmitBtn');
  const status = document.getElementById('translatorStatus');
  const detectedEl = document.getElementById('translatorDetected');
  const historyList = document.getElementById('translatorHistoryList');
  const historyClearBtn = document.getElementById('translatorHistoryClearBtn');
  if (!input || !output || !submitBtn || !status) return;

  const MAX_LENGTH = Number(input.getAttribute('maxlength')) || 1000;

  const setStatus = (text, mode) => {
    status.textContent = text;
    status.classList.remove('is-loading', 'is-success', 'is-unavailable');
    if (mode) status.classList.add(mode);
  };

  const updateCharCount = () => {
    if (charCount) charCount.textContent = `${input.value.length} / ${MAX_LENGTH}`;
  };

  const renderHistory = () => {
    if (!historyList) return;
    const history = loadTranslatorHistory();
    historyList.innerHTML = history.length
      ? history
          .map(
            (entry) => `
        <li class="translator-history-item">
          <span class="translator-history-pair">${escapeHtml(languageDisplayNames[entry.sourceLanguage] || entry.sourceLanguage || 'Auto')} → ${escapeHtml(languageDisplayNames[entry.targetLanguage] || entry.targetLanguage || '')}</span>
          <span class="translator-history-source">${escapeHtml(entry.source)}</span>
          <span class="translator-history-target">${escapeHtml(entry.target)}</span>
        </li>`
          )
          .join('')
      : '<li class="translator-history-empty">Sin traducciones recientes.</li>';
  };

  input.addEventListener('input', updateCharCount);
  updateCharCount();
  renderHistory();

  // recognition.lang is fixed for the life of a SpeechRecognition instance -
  // a source-language switch mid-dictation would otherwise keep listening
  // in the old language. Any manual change here also opts this session out
  // of syncTranslatorLanguagesFromState()'s auto-sync (see its comment) -
  // the student picked this pair on purpose.
  sourceSelect?.addEventListener('change', () => {
    stopTranslatorDictation();
    translatorUserAdjustedPair = true;
  });
  targetSelect?.addEventListener('change', () => {
    translatorUserAdjustedPair = true;
  });

  const returnLink = document.getElementById('translatorReturnLink');
  returnLink?.addEventListener('click', (event) => {
    event.preventDefault();
    if (!translatorReturnContext) return;
    const hash = translatorReturnContext.hash;
    translatorReturnContext = null;
    returnLink.hidden = true;
    if (window.location.hash !== hash) history.pushState(null, '', hash);
    showView(getViewFromHash());
  });

  swapBtn?.addEventListener('click', () => {
    stopTranslatorDictation();
    // Swapping the selects only makes sense when the source is a real
    // language - with 'auto' there is nothing known to place in the target
    // slot, so leave both selects as-is and just swap the text either way.
    if (sourceSelect.value !== 'auto' && targetSelect) {
      const sourceValue = sourceSelect.value;
      sourceSelect.value = targetSelect.value;
      targetSelect.value = sourceValue;
    }
    const inputValue = input.value;
    input.value = output.value;
    output.value = inputValue;
    updateCharCount();
  });

  clearBtn?.addEventListener('click', () => {
    // Otherwise the next dictation 'result' event would overwrite the
    // clear with the baseText captured when dictation started.
    stopTranslatorDictation();
    input.value = '';
    output.value = '';
    if (detectedEl) detectedEl.hidden = true;
    updateCharCount();
    setStatus('Listo');
  });

  copyBtn?.addEventListener('click', async () => {
    if (!output.value) return;
    try {
      await navigator.clipboard.writeText(output.value);
      showHomeToast('Traducción copiada.');
    } catch {
      showHomeToast('No se pudo copiar la traducción.');
    }
  });

  listenSourceBtn?.addEventListener('click', () => {
    const lang = sourceSelect?.value;
    speakText(input.value, { locale: lang && lang !== 'auto' ? LANGUAGE_LOCALES[lang] : undefined });
  });

  listenOutputBtn?.addEventListener('click', () => {
    speakText(output.value, { locale: LANGUAGE_LOCALES[targetSelect?.value] });
  });

  historyClearBtn?.addEventListener('click', () => {
    clearTranslatorHistory();
    renderHistory();
  });

  submitBtn.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) {
      setStatus('Escribe un texto para traducir.', 'is-unavailable');
      return;
    }

    const sourceLanguage = sourceSelect?.value || 'auto';
    const targetLanguage = targetSelect?.value || 'spanish';
    // Mirrors the backend's own check (POST /api/translate rejects this the
    // same way) - checked here too so guessing/typing doesn't need a round
    // trip to find out. 'auto' is never blocked - the real detected
    // language isn't known until DeepL responds.
    if (sourceLanguage !== 'auto' && sourceLanguage === targetLanguage) {
      setStatus(LanguagePair.t('translatorSelectDifferent', learningPathState.bridgeLanguage), 'is-unavailable');
      return;
    }

    if (detectedEl) detectedEl.hidden = true;
    setStatus(LanguagePair.t('translatorTranslating', learningPathState.bridgeLanguage), 'is-loading');
    submitBtn.disabled = true;
    try {
      // auth: true - sends the session token when signed in, so the backend
      // can apply the Premium character limit instead of always treating
      // the request as a guest (see POST /api/translate's attachUserIfPresent).
      const data = await postJson(
        '/api/translate',
        { text, sourceLanguage, targetLanguage },
        { auth: true }
      );

      if (data.ok) {
        output.value = data.translatedText || '';
        setStatus('Completada', 'is-success');
        if (sourceLanguage === 'auto' && data.detectedLanguage && detectedEl) {
          detectedEl.textContent = `Idioma detectado: ${languageDisplayNames[data.detectedLanguage] || data.detectedLanguage}`;
          detectedEl.hidden = false;
        }
        saveTranslatorHistoryEntry({
          source: text,
          target: output.value,
          sourceLanguage: sourceLanguage === 'auto' ? data.detectedLanguage || 'auto' : sourceLanguage,
          targetLanguage,
          timestamp: Date.now()
        });
        renderHistory();
      } else if (data.configured === false) {
        output.value = '';
        setStatus('El traductor está temporalmente en configuración.', 'is-unavailable');
      } else {
        output.value = '';
        setStatus(data.message || 'No disponible. Inténtalo de nuevo.', 'is-unavailable');
      }
    } catch (error) {
      output.value = '';
      setStatus(error.message || 'No disponible. Inténtalo de nuevo.', 'is-unavailable');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

enableHomepageActions();
loadProgress();
setupLearningPathControls();
setupTranslator();
initScrollReveal();

// Reached only via the link Supabase emails (authService's
// PASSWORD_RESET_REDIRECT_URL = '/?auth=recovery') - it overrides the normal
// hash-based view for this one load, regardless of whatever hash Supabase
// also appended to it. The legacy /reset-password path is also recognized
// for any links sent before that redirect URL changed.
const isPasswordRecoveryLink =
  window.location.pathname === '/reset-password' ||
  new URLSearchParams(window.location.search).get('auth') === 'recovery';

// Reached via the confirmation-LINK variant of Supabase's "Confirm signup"
// email (authService's EMAIL_CONFIRM_REDIRECT_URL = '/?auth=confirmed') -
// the 6-digit OTP in showSignupPending() is still the primary confirmation
// path; this only covers an account confirming via the email's link instead.
// Supabase's own error redirect (expired/already-used link) still lands here
// with `auth=confirmed` intact plus `error`/`error_code`/`error_description`
// appended - it redirects to the full redirect_to it was given, not a
// stripped-down version of it - so this one check already covers both the
// success and error cases; initEmailConfirmedPage() branches on the error
// params once it's here.
const isEmailConfirmedLink = new URLSearchParams(window.location.search).get('auth') === 'confirmed';

if (isPasswordRecoveryLink) {
  showView('reset-password');
  initResetPasswordPage();
} else if (isEmailConfirmedLink) {
  showView('email-confirmed');
  initEmailConfirmedPage();
} else {
  showView(getViewFromHash());
  // Direct/bookmarked load of #premium: resolves to the home view (see
  // getViewFromHash), so land on the plans section instead of the hero.
  if (window.location.hash === '#premium') {
    window.setTimeout(() => {
      document.getElementById('premium')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 50);
  }
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
  document.querySelectorAll('.translator-dictate-btn').forEach((btn) => {
    btn.disabled = true;
  });
  setTranslatorDictateStatusText(
    'El dictado por voz no está disponible en este navegador. Puedes escribir tu texto.'
  );
  document.querySelectorAll('.translator-dictate-stop-btn').forEach((btn) => {
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
  // A hash carrying /<language>/<level>/... (see parseLearnHashState) wins
  // over the account's saved preferences on load - a reloaded or shared
  // #reading/french/A1/... link should open exactly that, not silently
  // revert to whatever language/level the account had saved.
  const hashState = parseLearnHashState();
  const preferences = await loadPreferences();
  const effectivePreferences =
    hashState.language || hashState.level
      ? {
          language: hashState.language || preferences?.language || learningPathState.language,
          level: hashState.level || preferences?.level || learningPathState.level,
          bridgeLanguage: preferences?.bridgeLanguage
        }
      : preferences;
  applyPreferencesToSelects(effectivePreferences);
  // Guests (no saved preferences) skip applyPreferencesToSelects' own
  // applyInterfaceLanguage call - run it unconditionally so the interface
  // language is always in sync with learningPathState.bridgeLanguage
  // (default 'spanish') on first paint, not just for signed-in students.
  applyInterfaceLanguage(learningPathState.bridgeLanguage);
  await loadLearningPath({
    ...(effectivePreferences || {}),
    restoreUnitId: hashState.unitId,
    restoreSlug: hashState.lessonSlug
  });
  updatePathPairPreview();
  // renderSkillView's own loading-guard branch (see above) already fires an
  // equivalent load if the user landed cold on a skill view (lessons were
  // still empty then) - this re-render is what applies the final restored
  // unit/lesson to that view once this load has actually finished, in case
  // that earlier branch resolved first with an incomplete/default state.
  const resolvedView = getViewFromHash();
  if (SKILL_VIEWS.includes(resolvedView)) renderSkillView(resolvedView);
})();

document.getElementById('aiTutorPrompt')?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || event.shiftKey) return;
  event.preventDefault();
  event.target.closest('.tutor-action')?.querySelector('.tutor-chat-btn')?.click();
});
