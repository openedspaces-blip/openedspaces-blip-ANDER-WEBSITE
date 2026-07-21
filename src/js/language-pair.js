// src/js/language-pair.js
// Single source of truth for the L1/L2 language-pair vocabulary and the
// shared rendering helpers built on top of it - loaded as a plain <script>
// in the browser (window.AndergoLanguagePair) and require()-able from Node
// for tests, same dual-export pattern as src/js/username-rules.js.
//
// Definitions (do not drift from these):
//   L1 / bridgeLanguage / interfaceLanguage: the language the student wants
//     the PLATFORM in - navigation, instructions, grammar explanations,
//     help text, translations and system messages. NOT just "a language the
//     student happens to already know" - it is the active support/interface
//     language and must be usable as such.
//   L2 / targetLanguage: the language being learned - lessons, audio,
//     vocabulary, dialogues, reading/listening/speaking content and
//     exercises stay in L2, never auto-translated wholesale into L1.
//
// interfaceLanguage and bridgeLanguage are the SAME field in this
// architecture, not two independently-tracked values - `bridgeLanguage` is
// the one source of truth (persisted as profiles.bridge_language server-side,
// see lib/preferencesService.js); `interfaceLanguage` is accepted as an
// optional override in getLanguagePairLabel purely for testability/future
// use, and every real call site in this codebase passes bridgeLanguage for
// both. Do not introduce a second, separately-tracked "interface language"
// state without updating this comment and the persistence layer together.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.AndergoLanguagePair = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const SUPPORTED_LANGUAGES = ['english', 'spanish', 'french', 'italian', 'german'];

  // Fully authored (not machine-translated) for english/spanish/french - the
  // three languages that currently have real A1 course content (English A1,
  // Français A1, Español A1) and are the only ones selectable as a bridge or
  // target language in the UI today (see #pathBridgeSelect/#pathLanguageSelect
  // in index.html). italian/german rows exist so languageNameIn() never
  // returns a raw key for them, but have no dedicated INTERFACE_LABELS/
  // PAIR_SENTENCE entry yet - callers fall back to Spanish for those, same as
  // any other not-yet-supported bridge language.
  //
  // LANGUAGE_NAME_IN[interfaceLanguage][languageKey] = how `languageKey`'s
  // name is written for a reader whose interface language is
  // `interfaceLanguage` - e.g. LANGUAGE_NAME_IN.spanish.english === 'inglés'
  // (what a Spanish-reading student reads), not 'English'.
  const LANGUAGE_NAME_IN = {
    spanish: {
      spanish: 'español',
      english: 'inglés',
      french: 'francés',
      italian: 'italiano',
      german: 'alemán'
    },
    english: {
      spanish: 'Spanish',
      english: 'English',
      french: 'French',
      italian: 'Italian',
      german: 'German'
    },
    french: {
      spanish: 'espagnol',
      english: 'anglais',
      french: 'français',
      italian: 'italien',
      german: 'allemand'
    },
    italian: {
      spanish: 'spagnolo',
      english: 'inglese',
      french: 'francese',
      italian: 'italiano',
      german: 'tedesco'
    },
    german: {
      spanish: 'Spanisch',
      english: 'Englisch',
      french: 'Französisch',
      italian: 'Italienisch',
      german: 'Deutsch'
    }
  };

  // Only the interface chrome literally named in spec section 1 (the
  // bridge/target/level selector labels and the pill labels next to them) -
  // this is NOT a general-purpose translation table for the rest of the
  // app. The bulk of ANDERGO's interface copy (menus, buttons, dashboard,
  // modals, tutor prose) remains Spanish-only prose today; extending that is
  // a separate, much larger effort and is out of scope here (see the commit
  // this file was introduced in for the explicit scope boundary).
  const INTERFACE_LABELS = {
    spanish: {
      bridgeSelectLabel: 'Idioma de la plataforma y apoyo (L1)',
      targetSelectLabel: 'Idioma que deseas aprender (L2)',
      levelSelectLabel: 'Nivel',
      bridgeLabel: 'Idioma puente',
      targetLabel: 'Idioma meta',
      levelLabel: 'Nivel',
      aiLanguageLabel: 'Idioma'
    },
    english: {
      bridgeSelectLabel: 'Platform & support language (L1)',
      targetSelectLabel: 'Language you want to learn (L2)',
      levelSelectLabel: 'Level',
      bridgeLabel: 'Bridge language',
      targetLabel: 'Target language',
      levelLabel: 'Level',
      aiLanguageLabel: 'Language'
    },
    french: {
      bridgeSelectLabel: "Langue de la plateforme et d'appui (L1)",
      targetSelectLabel: 'Langue que vous voulez apprendre (L2)',
      levelSelectLabel: 'Niveau',
      bridgeLabel: "Langue d'appui",
      targetLabel: 'Langue cible',
      levelLabel: 'Niveau',
      aiLanguageLabel: 'Langue'
    }
  };

  // Dynamic pair sentence template, spec §1/§4: "Aprenderás {L2} con apoyo
  // en {L1}." rendered in the interface language, with target/bridge names
  // already localized via languageNameIn() before being interpolated here.
  // When bridge === target (direct/same-language learning mode, spec §3/§8)
  // callers use PAIR_SENTENCE_DIRECT instead - see getLanguagePairLabel().
  const PAIR_SENTENCE = {
    spanish: (target, bridge) => `Aprenderás ${target} con apoyo en ${bridge}.`,
    english: (target, bridge) => `You will learn ${target} with support in ${bridge}.`,
    french: (target, bridge) => `Vous apprendrez ${target} avec un accompagnement en ${bridge}.`
  };

  // "Aprenderás {L2} mediante inmersión y definiciones en {L2}." (spec §8) -
  // shown instead of PAIR_SENTENCE when bridge === target, since "support in
  // X" makes no sense when the support language and the target are the same.
  // Only ever called with target === the interface language itself (direct
  // mode is same-language by definition), so french's target is always
  // "français" - needs its definite article ("le français"), unlike the
  // other two languages' bare noun forms.
  const PAIR_SENTENCE_DIRECT = {
    spanish: (target) => `Aprenderás ${target} mediante inmersión y definiciones en ${target}.`,
    english: (target) => `You will learn ${target} through immersion and ${target} definitions.`,
    french: (target) =>
      `Vous apprendrez ${target === 'français' ? 'le français' : target} par immersion et avec des définitions en ${target}.`
  };

  // General-purpose UI-chrome dictionary (spec §2: L1 controls navigation,
  // buttons, instructions, system messages, dashboard, auth, Premium, tutor,
  // translator, footer, About...). Unlike INTERFACE_LABELS above (7 keys,
  // scoped to the language-pair selector only), this is the app-wide string
  // table. It is not yet exhaustive - every string used in index.html via
  // data-i18n/data-i18n-aria-label/data-i18n-placeholder and every string
  // read through t() in script.js is covered; strings not yet migrated stay
  // hardcoded Spanish prose until a follow-up pass moves them here too (see
  // the commit that introduced this table for the exact migrated surface:
  // nav, footer, About, dashboard loading/error states, auth key messages,
  // Premium CTA, translator status). Falls back to Spanish, same rule as
  // every other table in this file.
  const UI_STRINGS = {
    spanish: {
      skipLink: 'Saltar al contenido',
      menuToggleAria: 'Abrir menú',
      navHome: 'Inicio',
      navLearnVisitor: 'Idiomas',
      navPremium: 'Premium',
      navTranslator: 'Traductor',
      navAbout: 'Acerca de',
      navLearnMember: 'Aprender',
      navProgress: 'Progreso',
      navAchievements: 'Logros',
      navGoals: 'Objetivos',
      navTutor: 'Tutor IA ANDERGO',
      navSecurity: 'Seguridad',
      loginBtn: 'Iniciar sesión',
      signupBtn: 'Comenzar gratis',
      logoutBtn: 'Salir',
      footerNavHeading: 'Navegación',
      footerSupport: 'Soporte',
      footerContactHeading: 'Contacto',
      footerContactNote:
        'Los mensajes automáticos de ANDERGO pueden enviarse desde non-reply@andergo.online. No respondas a ese correo.',
      footerRights: 'ANDERGO. Todos los derechos reservados.',
      aboutBadge: 'Acerca de',
      aboutTitle: 'Sobre ANDERGO',
      aboutWhatTitle: 'Qué es ANDERGO',
      aboutWhatP1:
        'ANDERGO es una plataforma para aprender inglés, francés y español con una ruta clara de A1 a C2. Cada nivel combina vocabulario, diálogos, lectura, escritura, gramática y práctica oral guiada, apoyada por un Tutor IA que responde en tiempo real y una voz neuronal para practicar pronunciación.',
      aboutWhatP2:
        'Tu progreso, racha y objetivos se guardan de forma segura y solo tú puedes verlos. La interfaz está pensada para ser clara, rápida y accesible desde cualquier dispositivo.',
      aboutHowTitle: 'Cómo funciona',
      aboutHowSubtitle: 'Sin planes confusos ni pasos innecesarios: elige, practica y mide tu progreso.',
      aboutStep1Title: '1. Elige tu idioma y nivel',
      aboutStep1Text: 'Selecciona inglés, francés o español, y el nivel A1–C2 que mejor se ajuste a ti.',
      aboutStep2Title: '2. Practica lecciones guiadas',
      aboutStep2Text: 'Vocabulario, diálogos, lectura, escritura, gramática y ejercicios reales en cada unidad.',
      aboutStep3Title: '3. Habla con el Tutor IA',
      aboutStep3Text: 'Resuelve dudas, practica conversación y recibe corrección al instante.',
      aboutStep4Title: '4. Mide tu progreso real',
      aboutStep4Text: 'Sigue tu racha, tus objetivos y tu avance cada semana desde tu panel.',
      aboutStartFreeBtn: 'Comenzar gratis',
      aboutIncludesTitle: 'Qué incluye la plataforma',
      aboutIncludesItem1: 'Rutas completas de A1 a C2 en inglés, francés y español.',
      aboutIncludesItem2: 'Listening, Speaking, Reading, Writing, Grammar y Vocabulary en cada unidad.',
      aboutIncludesItem3: 'Tutor IA disponible en cualquier momento para practicar y resolver dudas.',
      aboutIncludesItem4: 'Voz neuronal para practicar pronunciación y comprensión auditiva.',
      aboutIncludesItem5: 'Seguimiento de progreso, racha y objetivos personales.',
      aboutIncludesItem6: 'Traductor rápido integrado entre los tres idiomas.',
      aboutIncludesItem7: 'Acceso Premium para desbloquear contenido adicional.',
      aboutCreatorTitle: 'Sobre el creador',
      aboutCreatorP1:
        'ANDERGO fue creado por Anderson Almánzar de la Cruz, docente de inglés y especialista en Lingüística Aplicada al Idioma Inglés. La plataforma nace con el propósito de ofrecer una experiencia de aprendizaje de idiomas más práctica, accesible, interactiva y centrada en el progreso real de cada estudiante.',
      aboutCreatorP2:
        'Con años de experiencia como docente de inglés, Anderson ha dedicado su carrera a la enseñanza de idiomas con un enfoque cercano y práctico, siempre atento a los retos reales que enfrenta un estudiante al aprender un idioma nuevo. Ese interés por la enseñanza dio forma a la visión educativa de ANDERGO: una plataforma donde cada persona practica de verdad, recibe retroalimentación clara y avanza a su propio ritmo. Su compromiso es ofrecer una educación de idiomas accesible y de calidad para cualquier persona, sin importar dónde se encuentre.',
      aboutContactTitle: 'Contacto y soporte',
      aboutContactIntro: 'Para consultas, asistencia técnica o reportar un problema, escríbenos a',
      aboutContactBtn: 'Contactar soporte',
      aboutContactNote:
        'non-reply@andergo.online se utiliza únicamente para notificaciones automáticas, confirmaciones y recuperación de cuenta.',
      genericLoading: 'Cargando…',
      genericLoadFailed: 'No se pudo cargar',
      dashboardLoadingProgress: 'Cargando tu progreso…',
      dashboardLoadingPanel: 'Cargando tu panel…',
      dashboardLoadingGoal: 'Cargando tu objetivo…',
      dashboardLoadingActivity: 'Cargando actividad…',
      progressLoadFailed: 'No se pudo cargar tu progreso.',
      panelLoadFailed: 'No se pudo cargar tu panel. Intenta recargar la página.',
      securityLoadFailed: 'No se pudo cargar tu estado de seguridad. Intenta recargar.',
      authSendLink: 'Enviar enlace',
      authResendLink: 'Reenviar enlace',
      authEnterCode: 'Ingresa los 6 dígitos del código.',
      authCodeResent: 'Código reenviado. Revisa tu correo.',
      premiumGetBtn: 'Obtener Premium',
      translatorSelectDifferent: 'Selecciona dos idiomas diferentes.',
      translatorTranslating: 'Traduciendo…',
      skillNotAvailableLevel: 'No disponible en este nivel',
      vocabSynonyms: 'Sinónimos',
      vocabOpposites: 'Antónimos',
      directModeBadge: 'Método directo',
      bilingualModeBadge: 'Modo bilingüe'
    },
    english: {
      skipLink: 'Skip to content',
      menuToggleAria: 'Open menu',
      navHome: 'Home',
      navLearnVisitor: 'Languages',
      navPremium: 'Premium',
      navTranslator: 'Translator',
      navAbout: 'About',
      navLearnMember: 'Learn',
      navProgress: 'Progress',
      navAchievements: 'Achievements',
      navGoals: 'Goals',
      navTutor: 'ANDERGO AI Tutor',
      navSecurity: 'Security',
      loginBtn: 'Log in',
      signupBtn: 'Start for free',
      logoutBtn: 'Log out',
      footerNavHeading: 'Navigation',
      footerSupport: 'Support',
      footerContactHeading: 'Contact',
      footerContactNote:
        "ANDERGO's automated messages may be sent from non-reply@andergo.online. Please don't reply to that address.",
      footerRights: 'ANDERGO. All rights reserved.',
      aboutBadge: 'About',
      aboutTitle: 'About ANDERGO',
      aboutWhatTitle: 'What ANDERGO is',
      aboutWhatP1:
        'ANDERGO is a platform for learning English, French and Spanish with a clear path from A1 to C2. Each level combines vocabulary, dialogues, reading, writing, grammar and guided speaking practice, backed by an AI Tutor that replies in real time and a neural voice for pronunciation practice.',
      aboutWhatP2:
        'Your progress, streak and goals are saved securely and only you can see them. The interface is designed to be clear, fast and accessible from any device.',
      aboutHowTitle: 'How it works',
      aboutHowSubtitle: 'No confusing plans or unnecessary steps: choose, practice and track your progress.',
      aboutStep1Title: '1. Choose your language and level',
      aboutStep1Text: 'Pick English, French or Spanish, and the A1–C2 level that fits you best.',
      aboutStep2Title: '2. Practice guided lessons',
      aboutStep2Text: 'Vocabulary, dialogues, reading, writing, grammar and real exercises in every unit.',
      aboutStep3Title: '3. Talk with the AI Tutor',
      aboutStep3Text: 'Clear up doubts, practice conversation and get instant correction.',
      aboutStep4Title: '4. Track your real progress',
      aboutStep4Text: 'Follow your streak, your goals and your weekly progress from your dashboard.',
      aboutStartFreeBtn: 'Start for free',
      aboutIncludesTitle: 'What the platform includes',
      aboutIncludesItem1: 'Complete A1-to-C2 paths in English, French and Spanish.',
      aboutIncludesItem2: 'Listening, Speaking, Reading, Writing, Grammar and Vocabulary in every unit.',
      aboutIncludesItem3: 'An AI Tutor available any time to practice and clear up doubts.',
      aboutIncludesItem4: 'A neural voice for pronunciation and listening-comprehension practice.',
      aboutIncludesItem5: 'Progress, streak and personal-goal tracking.',
      aboutIncludesItem6: 'A quick translator built in across all three languages.',
      aboutIncludesItem7: 'Premium access to unlock additional content.',
      aboutCreatorTitle: 'About the creator',
      aboutCreatorP1:
        'ANDERGO was created by Anderson Almánzar de la Cruz, an English teacher and specialist in Applied Linguistics for the English Language. The platform was born to offer a more practical, accessible, interactive language-learning experience centered on every student’s real progress.',
      aboutCreatorP2:
        "With years of experience teaching English, Anderson has devoted his career to language teaching with a close, practical approach, always attentive to the real challenges a student faces when learning a new language. That interest in teaching shaped ANDERGO's educational vision: a platform where every person practices for real, gets clear feedback and moves forward at their own pace. His commitment is to offer accessible, quality language education to anyone, wherever they are.",
      aboutContactTitle: 'Contact and support',
      aboutContactIntro: 'For questions, technical help or to report an issue, write to us at',
      aboutContactBtn: 'Contact support',
      aboutContactNote:
        'non-reply@andergo.online is used only for automated notifications, confirmations and account recovery.',
      genericLoading: 'Loading…',
      genericLoadFailed: 'Could not load',
      dashboardLoadingProgress: 'Loading your progress…',
      dashboardLoadingPanel: 'Loading your dashboard…',
      dashboardLoadingGoal: 'Loading your goal…',
      dashboardLoadingActivity: 'Loading activity…',
      progressLoadFailed: 'Could not load your progress.',
      panelLoadFailed: 'Could not load your dashboard. Try reloading the page.',
      securityLoadFailed: 'Could not load your security status. Try reloading.',
      authSendLink: 'Send link',
      authResendLink: 'Resend link',
      authEnterCode: 'Enter the 6-digit code.',
      authCodeResent: 'Code resent. Check your email.',
      premiumGetBtn: 'Get Premium',
      translatorSelectDifferent: 'Select two different languages.',
      translatorTranslating: 'Translating…',
      skillNotAvailableLevel: 'Not available at this level',
      vocabSynonyms: 'Synonyms',
      vocabOpposites: 'Opposites',
      directModeBadge: 'Direct method',
      bilingualModeBadge: 'Bilingual mode'
    },
    french: {
      skipLink: 'Aller au contenu',
      menuToggleAria: 'Ouvrir le menu',
      navHome: 'Accueil',
      navLearnVisitor: 'Langues',
      navPremium: 'Premium',
      navTranslator: 'Traducteur',
      navAbout: 'À propos',
      navLearnMember: 'Apprendre',
      navProgress: 'Progrès',
      navAchievements: 'Succès',
      navGoals: 'Objectifs',
      navTutor: 'Tuteur IA ANDERGO',
      navSecurity: 'Sécurité',
      loginBtn: 'Se connecter',
      signupBtn: 'Commencer gratuitement',
      logoutBtn: 'Se déconnecter',
      footerNavHeading: 'Navigation',
      footerSupport: 'Assistance',
      footerContactHeading: 'Contact',
      footerContactNote:
        "Les messages automatiques d'ANDERGO peuvent être envoyés depuis non-reply@andergo.online. Merci de ne pas répondre à cette adresse.",
      footerRights: 'ANDERGO. Tous droits réservés.',
      aboutBadge: 'À propos',
      aboutTitle: "À propos d'ANDERGO",
      aboutWhatTitle: "Qu'est-ce qu'ANDERGO",
      aboutWhatP1:
        "ANDERGO est une plateforme pour apprendre l'anglais, le français et l'espagnol avec un parcours clair de A1 à C2. Chaque niveau combine vocabulaire, dialogues, lecture, écriture, grammaire et pratique orale guidée, avec un Tuteur IA qui répond en temps réel et une voix neuronale pour s'entraîner à la prononciation.",
      aboutWhatP2:
        "Votre progression, votre série et vos objectifs sont enregistrés en toute sécurité et vous seul pouvez les voir. L'interface est conçue pour être claire, rapide et accessible depuis n'importe quel appareil.",
      aboutHowTitle: 'Comment ça marche',
      aboutHowSubtitle:
        'Pas de formules confuses ni d’étapes inutiles : choisissez, pratiquez et suivez vos progrès.',
      aboutStep1Title: '1. Choisissez votre langue et votre niveau',
      aboutStep1Text: "Sélectionnez l'anglais, le français ou l'espagnol, et le niveau A1–C2 qui vous convient.",
      aboutStep2Title: '2. Pratiquez des leçons guidées',
      aboutStep2Text: 'Vocabulaire, dialogues, lecture, écriture, grammaire et exercices réels dans chaque unité.',
      aboutStep3Title: '3. Parlez avec le Tuteur IA',
      aboutStep3Text: 'Répondez à vos questions, pratiquez la conversation et recevez une correction instantanée.',
      aboutStep4Title: '4. Suivez vos progrès réels',
      aboutStep4Text: 'Suivez votre série, vos objectifs et votre progression chaque semaine depuis votre tableau de bord.',
      aboutStartFreeBtn: 'Commencer gratuitement',
      aboutIncludesTitle: 'Ce que la plateforme inclut',
      aboutIncludesItem1: 'Des parcours complets de A1 à C2 en anglais, français et espagnol.',
      aboutIncludesItem2: 'Listening, Speaking, Reading, Writing, Grammar et Vocabulary dans chaque unité.',
      aboutIncludesItem3: 'Un Tuteur IA disponible à tout moment pour pratiquer et répondre aux questions.',
      aboutIncludesItem4: "Une voix neuronale pour s'entraîner à la prononciation et à la compréhension orale.",
      aboutIncludesItem5: 'Un suivi de la progression, de la série et des objectifs personnels.',
      aboutIncludesItem6: 'Un traducteur rapide intégré entre les trois langues.',
      aboutIncludesItem7: 'Un accès Premium pour débloquer du contenu supplémentaire.',
      aboutCreatorTitle: 'À propos du créateur',
      aboutCreatorP1:
        "ANDERGO a été créé par Anderson Almánzar de la Cruz, professeur d'anglais et spécialiste en linguistique appliquée à l'anglais. La plateforme est née dans le but d'offrir une expérience d'apprentissage des langues plus pratique, accessible, interactive et centrée sur les progrès réels de chaque étudiant.",
      aboutCreatorP2:
        "Fort de plusieurs années d'expérience en tant que professeur d'anglais, Anderson a consacré sa carrière à l'enseignement des langues avec une approche proche et pratique, toujours attentif aux défis réels que rencontre un étudiant en apprenant une nouvelle langue. Cet intérêt pour l'enseignement a façonné la vision éducative d'ANDERGO : une plateforme où chaque personne pratique réellement, reçoit des retours clairs et progresse à son propre rythme. Son engagement est d'offrir une éducation linguistique accessible et de qualité à tous, où qu'ils se trouvent.",
      aboutContactTitle: 'Contact et assistance',
      aboutContactIntro: "Pour toute question, assistance technique ou signalement d'un problème, écrivez-nous à",
      aboutContactBtn: "Contacter l'assistance",
      aboutContactNote:
        "non-reply@andergo.online est utilisé uniquement pour les notifications automatiques, les confirmations et la récupération de compte.",
      genericLoading: 'Chargement…',
      genericLoadFailed: 'Échec du chargement',
      dashboardLoadingProgress: 'Chargement de vos progrès…',
      dashboardLoadingPanel: 'Chargement de votre tableau de bord…',
      dashboardLoadingGoal: 'Chargement de votre objectif…',
      dashboardLoadingActivity: 'Chargement de l’activité…',
      progressLoadFailed: 'Impossible de charger vos progrès.',
      panelLoadFailed: 'Impossible de charger votre tableau de bord. Essayez de recharger la page.',
      securityLoadFailed: 'Impossible de charger votre statut de sécurité. Essayez de recharger.',
      authSendLink: 'Envoyer le lien',
      authResendLink: 'Renvoyer le lien',
      authEnterCode: 'Saisissez le code à 6 chiffres.',
      authCodeResent: 'Code renvoyé. Vérifiez votre e-mail.',
      premiumGetBtn: 'Obtenir Premium',
      translatorSelectDifferent: 'Sélectionnez deux langues différentes.',
      translatorTranslating: 'Traduction en cours…',
      skillNotAvailableLevel: 'Non disponible à ce niveau',
      vocabSynonyms: 'Synonymes',
      vocabOpposites: 'Contraires',
      directModeBadge: 'Méthode directe',
      bilingualModeBadge: 'Mode bilingue'
    }
  };

  // t(key, bridgeLanguage) - the app-wide interface-chrome string, in the
  // student's L1/bridge/interface language (see the file-top note: these are
  // the same field). Falls back to Spanish, then to the raw key - never
  // throws on an unknown bridgeLanguage/key, matching getInterfaceLabel()'s
  // contract above.
  function t(key, bridgeLanguage) {
    const table = UI_STRINGS[bridgeLanguage] || UI_STRINGS.spanish;
    return table[key] || UI_STRINGS.spanish[key] || key;
  }

  // How `languageKey`'s name is written for a reader whose interface
  // language is `interfaceLanguage`. Falls back to Spanish (this app's
  // original language) for an interfaceLanguage without its own row yet,
  // and to the raw key if even that is missing - never throws.
  function languageNameIn(interfaceLanguage, languageKey) {
    const table = LANGUAGE_NAME_IN[interfaceLanguage] || LANGUAGE_NAME_IN.spanish;
    return table[languageKey] || languageKey;
  }

  // getInterfaceLabel(key, bridgeLanguage) - one of the named UI chrome
  // strings above (see INTERFACE_LABELS), in the student's bridge/interface
  // language. Falls back to Spanish, then to the raw key - never fabricates
  // a translation and never throws on an unknown bridgeLanguage/key.
  function getInterfaceLabel(key, bridgeLanguage) {
    const table = INTERFACE_LABELS[bridgeLanguage] || INTERFACE_LABELS.spanish;
    return table[key] || INTERFACE_LABELS.spanish[key] || key;
  }

  // getSupportText(content, bridgeLanguage) - explanatory/support strings
  // authored per bridge language, e.g. { spanish: '...', english: '...' }.
  // A bare string is returned as-is (single-language content, nothing to
  // pick). Falls back to the Spanish entry - the only bridge language with
  // fully authored support copy across this app's legacy preview content
  // today (see lib/uiContent.js) - rather than fabricating a translation
  // that isn't real authored data.
  function getSupportText(content, bridgeLanguage) {
    if (!content) return '';
    if (typeof content === 'string') return content;
    return content[bridgeLanguage] || content.spanish || '';
  }

  // getTargetContent(content, targetLanguage) - the learning content itself
  // (vocabulary/reading/dialogue/exercises/...) always stays in the target
  // language. This exists so callers have one place to reach for it instead
  // of reading content[targetLanguage] ad hoc, and so a future per-target-
  // language content shape only needs to change here.
  function getTargetContent(content, targetLanguage) {
    if (!content) return '';
    if (typeof content === 'string') return content;
    return content[targetLanguage] != null ? content[targetLanguage] : '';
  }

  // getLearningSupport({ item, bridgeLanguage, targetLanguage, learningMode })
  // (spec §9) - the one place content items (vocabulary/reading glossary
  // entries/etc.) get normalized into what a learner actually sees, so
  // renderers never have to branch on learningMode themselves. `item` may
  // carry both `translationSupport` (per-bridge-language strings, same
  // shape as getSupportText's `content` param - used in bilingual mode) and
  // `directSupport` ({ definition, simpleDefinition, synonyms, opposites,
  // usageNote, image, imageAlt } - used in direct mode, spec §9/§10); items
  // authored before direct mode existed may only have the older
  // `translation`/`image`/`imageAlt` fields, which this still reads as a
  // fallback so existing bilingual content keeps working unchanged.
  //
  // bilingual -> { mode, word, translation, examples, image, imageAlt }
  // direct    -> { mode, word, definition, simpleDefinition, synonyms,
  //                opposites, usageNote, examples, image, imageAlt }
  // Never throws on a missing item/fields - returns null for no item, and
  // empty strings/arrays for support fields that aren't authored yet (spec
  // §10: no broken placeholders - callers should skip rendering an empty
  // image/imageAlt rather than showing a broken box).
  function getLearningSupport({ item, bridgeLanguage, targetLanguage, learningMode }) {
    if (!item) return null;
    const mode = learningMode || getLearningMode(bridgeLanguage, targetLanguage);
    const word = getTargetContent(item.word || item.term, targetLanguage) || item.word || item.term || '';

    if (mode === 'direct') {
      const direct = item.directSupport || {};
      return {
        mode: 'direct',
        word,
        definition: direct.definition || '',
        simpleDefinition: direct.simpleDefinition || direct.definition || '',
        synonyms: direct.synonyms || [],
        opposites: direct.opposites || [],
        usageNote: direct.usageNote || '',
        examples: direct.contextExamples || item.examples || [],
        image: direct.image || item.image || null,
        imageAlt: direct.imageAlt || item.imageAlt || ''
      };
    }

    return {
      mode: 'bilingual',
      word,
      translation: item.translationSupport
        ? getSupportText(item.translationSupport, bridgeLanguage)
        : getSupportText(item.translation, bridgeLanguage),
      examples: item.examples || [],
      image: item.image || null,
      imageAlt: item.imageAlt || ''
    };
  }

  // getLanguagePairLabel(bridgeLanguage, targetLanguage[, interfaceLanguage])
  // -> "Aprenderás {L2} con apoyo en {L1}." (or the equivalent in the
  // interface language). interfaceLanguage defaults to bridgeLanguage, per
  // the "one source of truth" note at the top of this file.
  //
  // getLanguagePairLabel('spanish', 'english') ->
  //   "Aprenderás inglés con apoyo en español."
  function getLanguagePairLabel(bridgeLanguage, targetLanguage, interfaceLanguage) {
    const uiLanguage = interfaceLanguage || bridgeLanguage;
    const targetName = languageNameIn(uiLanguage, targetLanguage);
    // Same-language pair (direct/immersion mode, spec §3/§8) - "support in
    // X" makes no sense when bridge and target are the same language, so
    // this uses the immersion-flavored sentence instead of PAIR_SENTENCE.
    // Reuses getLearningMode() rather than re-comparing bridge/target here,
    // so this stays the one place that decision is made (integration-audit
    // requirement: don't duplicate the bridge===target comparison).
    if (getLearningMode(bridgeLanguage, targetLanguage) === 'direct') {
      const directSentence = PAIR_SENTENCE_DIRECT[uiLanguage] || PAIR_SENTENCE_DIRECT.spanish;
      return directSentence(targetName);
    }
    const sentence = PAIR_SENTENCE[uiLanguage] || PAIR_SENTENCE.spanish;
    const bridgeName = languageNameIn(uiLanguage, bridgeLanguage);
    return sentence(targetName, bridgeName);
  }

  // getLearningMode(bridgeLanguage, targetLanguage) -> 'direct' | 'bilingual'
  // (spec §3). Deliberately derived, not a separately-persisted field: it is
  // fully determined by bridgeLanguage/targetLanguage, the two fields that
  // ARE persisted (profiles.bridge_language/preferred_language) - storing a
  // third, redundant field would risk drifting out of sync with them. Same
  // "single source of truth, documented" principle as interfaceLanguage ===
  // bridgeLanguage at the top of this file.
  function getLearningMode(bridgeLanguage, targetLanguage) {
    return bridgeLanguage && bridgeLanguage === targetLanguage ? 'direct' : 'bilingual';
  }

  // Central list of bridge->target combinations with real course content and
  // a fully-authored interface (see the INTERFACE_LABELS/PAIR_SENTENCE scope
  // note above) - the single place that decides which pairs are selectable.
  // Deliberately narrower than SUPPORTED_LANGUAGES: italian/german have
  // language-name entries (so languageNameIn never returns a raw key) but no
  // course content or interface copy yet, so they're left out of this list
  // rather than offered as a pair that silently falls back to Spanish
  // content/interface. Add a row here (plus the matching INTERFACE_LABELS/
  // PAIR_SENTENCE entries) when a new pair gets real content - nowhere else
  // in the codebase should hardcode this combination list.
  //
  // Same-language rows (english-english/spanish-spanish/french-french) are
  // the direct/immersion learning mode (spec §3): L1 === L2, definitions and
  // examples stay in that one language instead of being bridged. Only listed
  // for the three languages with real course content, same rule as every
  // other row here.
  const LANGUAGE_PAIRS = [
    { bridge: 'spanish', target: 'english' },
    { bridge: 'english', target: 'spanish' },
    { bridge: 'spanish', target: 'french' },
    { bridge: 'french', target: 'spanish' },
    { bridge: 'french', target: 'english' },
    { bridge: 'english', target: 'french' },
    { bridge: 'spanish', target: 'spanish' },
    { bridge: 'english', target: 'english' },
    { bridge: 'french', target: 'french' }
  ];

  // True only for a bridge/target pair that's both (a) two known languages
  // and (b) actually listed in LANGUAGE_PAIRS above - never throws on an
  // unrecognized language key, just returns false. bridgeLanguage ===
  // targetLanguage is allowed (spec §3, direct/immersion mode) whenever
  // that same-language row is itself in LANGUAGE_PAIRS.
  function isLanguagePairSupported(bridgeLanguage, targetLanguage) {
    if (!bridgeLanguage || !targetLanguage) return false;
    return LANGUAGE_PAIRS.some(
      (pair) => pair.bridge === bridgeLanguage && pair.target === targetLanguage
    );
  }

  // Every target language with a supported pair for this bridge, in
  // LANGUAGE_PAIRS' own order - e.g. getAvailableTargetLanguages('spanish')
  // -> ['english', 'french']. Empty array (never throws) for a bridge with
  // no supported pair at all.
  function getAvailableTargetLanguages(bridgeLanguage) {
    return LANGUAGE_PAIRS.filter((pair) => pair.bridge === bridgeLanguage).map(
      (pair) => pair.target
    );
  }

  // The mirror of getAvailableTargetLanguages: every bridge language that can
  // reach this target - e.g. getAvailableBridgeLanguages('english') ->
  // ['spanish', 'french'].
  function getAvailableBridgeLanguages(targetLanguage) {
    return LANGUAGE_PAIRS.filter((pair) => pair.target === targetLanguage).map(
      (pair) => pair.bridge
    );
  }

  // Swaps bridge<->target (Español -> Inglés becomes Inglés -> Español) only
  // if the swapped pair is itself supported - returns null instead of an
  // unsupported/invalid pair so callers can't accidentally land somewhere
  // with no content. For a direct/immersion pair (bridge === target, spec
  // §3) this is a harmless no-op swap - the result is the same pair.
  function swapLanguagePair(bridgeLanguage, targetLanguage) {
    if (!isLanguagePairSupported(targetLanguage, bridgeLanguage)) return null;
    return { bridge: targetLanguage, target: bridgeLanguage };
  }

  // Resolves a requested bridge/target pair to the closest supported one,
  // without ever silently defaulting to Spanish->English behind the caller's
  // back. Returns { bridge, target, changed, reason }, where `changed` is
  // true only when the requested pair itself was invalid and something had
  // to give, and `reason` explains what happened:
  //   'same-language'     - bridge and target were equal.
  //   'unsupported-pair'  - a real, distinct pair with no content yet.
  //   null                - the requested pair was already valid, unchanged.
  // On a fixable case (bridge valid, target needs to change or vice versa)
  // it prefers keeping the field the caller didn't just change and picks the
  // first available option for the other one; if nothing at all is
  // resolvable it falls back to the platform default (spanish -> english).
  function normalizeLanguagePair(bridgeLanguage, targetLanguage) {
    if (isLanguagePairSupported(bridgeLanguage, targetLanguage)) {
      return { bridge: bridgeLanguage, target: targetLanguage, changed: false, reason: null };
    }

    const reason = bridgeLanguage === targetLanguage ? 'same-language' : 'unsupported-pair';

    const targetsForBridge = getAvailableTargetLanguages(bridgeLanguage);
    if (targetsForBridge.length) {
      return { bridge: bridgeLanguage, target: targetsForBridge[0], changed: true, reason };
    }
    const bridgesForTarget = getAvailableBridgeLanguages(targetLanguage);
    if (bridgesForTarget.length) {
      return { bridge: bridgesForTarget[0], target: targetLanguage, changed: true, reason };
    }
    return { bridge: 'spanish', target: 'english', changed: true, reason };
  }

  return {
    SUPPORTED_LANGUAGES,
    LANGUAGE_NAME_IN,
    LANGUAGE_PAIRS,
    languageNameIn,
    getInterfaceLabel,
    t,
    getSupportText,
    getTargetContent,
    getLearningMode,
    getLearningSupport,
    getLanguagePairLabel,
    isLanguagePairSupported,
    getAvailableTargetLanguages,
    getAvailableBridgeLanguages,
    swapLanguagePair,
    normalizeLanguagePair
  };
});
