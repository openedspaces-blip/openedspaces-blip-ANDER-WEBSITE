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
  const SUPPORTED_LANGUAGES = ['english', 'spanish', 'french', 'italian', 'portuguese', 'german'];

  // The platform interface is fully authored for english/spanish/french.
  // Italian and Brazilian Portuguese are also available as target languages
  // through the Spanish interface for their authored A1-A2 routes. They are
  // not bridge/interface languages yet, so they intentionally have no
  // dedicated INTERFACE_LABELS/PAIR_SENTENCE entry.
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
      portuguese: 'portugués brasileño',
      german: 'alemán'
    },
    english: {
      spanish: 'Spanish',
      english: 'English',
      french: 'French',
      italian: 'Italian',
      portuguese: 'Brazilian Portuguese',
      german: 'German'
    },
    french: {
      spanish: 'espagnol',
      english: 'anglais',
      french: 'français',
      italian: 'italien',
      portuguese: 'portugais brésilien',
      german: 'allemand'
    },
    italian: {
      spanish: 'spagnolo',
      english: 'inglese',
      french: 'francese',
      italian: 'italiano',
      portuguese: 'portoghese brasiliano',
      german: 'tedesco'
    },
    german: {
      spanish: 'Spanisch',
      english: 'Englisch',
      french: 'Französisch',
      italian: 'Italienisch',
      portuguese: 'Brasilianisches Portugiesisch',
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
      lessonSelectLabel: 'Unidad inicial',
      configuratorTitle: 'Configura tu ruta',
      targetCourseLabel: 'Tu ruta',
      targetLevelLabel: 'Nivel',
      supportInterfaceLabel: 'Idioma de apoyo',
      supportLevelHint: 'La ruta mantiene este nivel.',
      bridgeLabel: 'Idioma puente',
      targetLabel: 'Idioma meta',
      levelLabel: 'Nivel',
      aiLanguageLabel: 'Idioma'
    },
    english: {
      bridgeSelectLabel: 'Platform & support language (L1)',
      targetSelectLabel: 'Language you want to learn (L2)',
      levelSelectLabel: 'Level',
      lessonSelectLabel: 'Starting unit',
      configuratorTitle: 'Build your learning path',
      targetCourseLabel: 'Your path',
      targetLevelLabel: 'Level',
      supportInterfaceLabel: 'Support language',
      supportLevelHint: 'The path keeps this level.',
      bridgeLabel: 'Bridge language',
      targetLabel: 'Target language',
      levelLabel: 'Level',
      aiLanguageLabel: 'Language'
    },
    french: {
      bridgeSelectLabel: "Langue de la plateforme et d'appui (L1)",
      targetSelectLabel: 'Langue que vous voulez apprendre (L2)',
      levelSelectLabel: 'Niveau',
      lessonSelectLabel: 'Unité initiale',
      configuratorTitle: 'Configurez votre parcours',
      targetCourseLabel: 'Votre parcours',
      targetLevelLabel: 'Niveau',
      supportInterfaceLabel: "Langue d'appui",
      supportLevelHint: 'Le parcours conserve ce niveau.',
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
      navVerbs: 'Verbos',
      navVocabulary: 'Vocabulario',
      navProgress: 'Progreso',
      navAchievements: 'Logros',
      navGoals: 'Objetivos',
      navTutor: 'Tutor I.A.',
      tutorHeroBrand: 'ANDERGO A.I. Tutor',
      tutorHeroSlogan: 'Tu profe que nunca duerme.',
      navSecurity: 'Seguridad',
      navMore: 'Más',
      navDownloads: 'Descargas',
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
        'ANDERGO es una plataforma para aprender inglés, francés, español, italiano, portugués y alemán mediante rutas claras de A1 a C2. Cada unidad inicia con Vocabulary y continúa con Reading, Listening, Speaking, Writing, Grammar y Verbos para que la práctica tenga una secuencia y un propósito.',
      aboutWhatP2:
        'Empiezas por la actividad recomendada, practicas una habilidad a la vez y avanzas con apoyo del Tutor IA, el traductor contextual, audio y herramientas de repaso. Tu progreso, racha y objetivos se guardan en tu perfil para ayudarte a retomar desde donde quedaste.',
      aboutHowTitle: 'Cómo funciona',
      aboutHowSubtitle: 'Sin planes confusos ni pasos innecesarios: elige, practica y mide tu progreso.',
      aboutStep1Title: '1. Elige tu idioma y nivel',
      aboutStep1Text: 'Selecciona inglés, francés o español, y el nivel A1–C2 que mejor se ajuste a ti.',
      aboutStep2Title: '2. Practica lecciones guiadas',
      aboutStep2Text: 'Avanza por una secuencia conectada: lectura, escucha, vocabulario, gramática, expresión y verbos.',
      aboutStep3Title: '3. Habla con el Tutor IA',
      aboutStep3Text: 'Pide explicaciones paso a paso, ejemplos y pistas sin perder el hilo de tu lección.',
      aboutStep4Title: '4. Mide tu progreso real',
      aboutStep4Text: 'Consulta tu avance, racha, objetivos y las actividades que te toca retomar.',
      aboutStartFreeBtn: 'Comenzar gratis',
      aboutIncludesTitle: 'Qué incluye la plataforma',
      aboutIncludesItem1: 'Rutas de A1 a C2 en inglés, francés, español, italiano, portugués y alemán.',
      aboutIncludesItem2: 'Una secuencia por unidad: Vocabulary, Reading, Listening, Speaking, Writing, Grammar y Verbos.',
      aboutIncludesItem3: 'Tutor IA para explicaciones docentes, ejemplos, pistas y práctica guiada.',
      aboutIncludesItem4: 'Reproductor de escucha con repetir, saltar, velocidad y texto de apoyo cuando lo necesites.',
      aboutIncludesItem5: 'Traductor contextual, tarjetas de vocabulario y ejemplos para repasar en ambos sentidos.',
      aboutIncludesItem6: 'Seguimiento de progreso, racha, objetivos y actividades pendientes.',
      aboutIncludesItem7: 'Acceso Premium para desbloquear contenido adicional.',
      aboutCreatorTitle: 'Sobre el creador',
      aboutCreatorP1:
        'ANDERGO fue creado por Anderson Almánzar de la Cruz, docente dominicano de lenguas extranjeras y especialista en la enseñanza del inglés. Desde 2011 hasta la actualidad trabaja como docente del nivel secundario. Entre 2017 y 2021 cursó la Maestría en Lingüística Aplicada al Idioma Inglés en la Universidad Autónoma de Santo Domingo (UASD), recinto Nagua.',
      aboutCreatorP2:
        'Originario de San Francisco de Macorís y radicado en Nagua, Anderson combina su experiencia de aula con una visión práctica de la tecnología educativa. Actualmente también se desempeña como asesor de tesis y monográficos. ANDERGO nace de esa trayectoria: una plataforma donde cada estudiante puede practicar de forma guiada, recibir retroalimentación clara y convertir el estudio constante en progreso visible. Espera que este proyecto sea de mucha bendición para muchas personas.',
      aboutCreatorProfileLink: 'Conoce más sobre el autor',
      aboutCreatorCredential1: 'Docente de lenguas extranjeras',
      aboutCreatorCredential2: 'Lingüística aplicada al inglés',
      aboutCreatorCredential3: 'Educación dominicana',
      aboutCreatorJourneyTitle: 'Trayectoria',
      aboutCreatorJourney1: 'Docente de lenguas extranjeras en el nivel secundario',
      aboutCreatorJourney2: 'Maestría en Lingüística Aplicada al Idioma Inglés · UASD, Nagua',
      aboutCreatorVision: 'Una plataforma nacida del aula, con la esperanza de ser de mucha bendición para muchas personas.',
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
      verbsBadge: 'Verbos',
      verbsTitle: 'Los verbos más frecuentes en inglés',
      verbsDescription: 'Aprende, conjuga y practica los verbos más frecuentes en inglés.',
      verbsLoading: 'Cargando verbos…',
      verbsEmpty: 'Ningún verbo coincide con tu búsqueda.',
      verbsErrorRetry: 'En este momento no pudimos cargar los verbos. Inténtalo nuevamente.',
      verbsRetryBtn: 'Reintentar',
      verbsLoadMoreBtn: 'Cargar más'
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
      navVerbs: 'Verbs',
      navVocabulary: 'Vocabulary',
      navProgress: 'Progress',
      navAchievements: 'Achievements',
      navGoals: 'Goals',
      navTutor: 'Tutor I.A.',
      tutorHeroBrand: 'ANDERGO A.I. Tutor',
      tutorHeroSlogan: 'Your teacher who never sleeps.',
      navSecurity: 'Security',
      navMore: 'More',
      navDownloads: 'Downloads',
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
        'ANDERGO is a platform for learning English, French, Spanish, Italian, Portuguese and German through clear A1-to-C2 learning paths. Every unit starts with Vocabulary, then continues with Reading, Listening, Speaking, Writing, Grammar and Verbs so practice follows a purposeful sequence.',
      aboutWhatP2:
        'Start with the recommended activity, practise one skill at a time, and move forward with support from the AI Tutor, contextual translator, audio and review tools. Your progress, streak and goals are saved in your profile so you can pick up where you left off.',
      aboutHowTitle: 'How it works',
      aboutHowSubtitle: 'No confusing plans or unnecessary steps: choose, practice and track your progress.',
      aboutStep1Title: '1. Choose your language and level',
      aboutStep1Text: 'Pick English, French or Spanish, and the A1–C2 level that fits you best.',
      aboutStep2Title: '2. Practice guided lessons',
      aboutStep2Text: 'Follow a connected sequence: vocabulary, reading, listening, expression, grammar and verbs.',
      aboutStep3Title: '3. Talk with the AI Tutor',
      aboutStep3Text: 'Ask for step-by-step explanations, examples and hints without losing the thread of your lesson.',
      aboutStep4Title: '4. Track your real progress',
      aboutStep4Text: 'See your progress, streak, goals and the activities that are ready to continue.',
      aboutStartFreeBtn: 'Start for free',
      aboutIncludesTitle: 'What the platform includes',
      aboutIncludesItem1: 'A1-to-C2 paths in English, French and Spanish, plus A1-to-B1 paths in Italian, Portuguese and German.',
      aboutIncludesItem2: 'A sequence in every unit: Vocabulary, Reading, Listening, Speaking, Writing, Grammar and Verbs.',
      aboutIncludesItem3: 'An AI Tutor for teacher-like explanations, examples, hints and guided practice.',
      aboutIncludesItem4: 'A listening player with replay, skipping, speed controls and support text when you need it.',
      aboutIncludesItem5: 'A contextual translator, vocabulary cards and examples for two-way review.',
      aboutIncludesItem6: 'Tracking for progress, streak, goals and pending activities.',
      aboutIncludesItem7: 'Premium access to unlock additional content.',
      aboutCreatorTitle: 'About the creator',
      aboutCreatorP1:
        'ANDERGO was created by Anderson Almánzar de la Cruz, a Dominican foreign-language teacher and specialist in English-language education. He has worked as a secondary-level teacher since 2011. From 2017 to 2021, he completed a Master’s degree in Applied Linguistics for the English Language at the Universidad Autónoma de Santo Domingo (UASD), Nagua campus.',
      aboutCreatorP2:
        'Originally from San Francisco de Macorís and based in Nagua, Anderson combines classroom experience with a practical vision of educational technology. He also works as an adviser for theses and monographs. ANDERGO grew from that journey: a platform where learners can practise through guided activities, receive clear feedback and turn consistent study into visible progress. He hopes this project will be a great blessing to many people.',
      aboutCreatorProfileLink: 'Learn more about the creator',
      aboutCreatorCredential1: 'Foreign-language teacher',
      aboutCreatorCredential2: 'Applied English linguistics',
      aboutCreatorCredential3: 'Dominican education',
      aboutCreatorJourneyTitle: 'Professional journey',
      aboutCreatorJourney1: 'Secondary-level foreign-language teacher',
      aboutCreatorJourney2: 'Master’s in Applied Linguistics for the English Language · UASD, Nagua',
      aboutCreatorVision: 'A platform born in the classroom, with the hope of being a blessing to many people.',
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
      verbsBadge: 'Verbs',
      verbsTitle: 'The most common verbs in English',
      verbsDescription: 'Learn, conjugate, and practice the most common verbs in English.',
      verbsLoading: 'Loading verbs…',
      verbsEmpty: 'No verb matches your search.',
      verbsErrorRetry: "We couldn't load the verbs right now. Please try again.",
      verbsRetryBtn: 'Retry',
      verbsLoadMoreBtn: 'Load more'
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
      navVerbs: 'Verbes',
      navVocabulary: 'Vocabulaire',
      navProgress: 'Progrès',
      navAchievements: 'Succès',
      navGoals: 'Objectifs',
      navTutor: 'Tutor I.A.',
      tutorHeroBrand: 'ANDERGO A.I. Tutor',
      tutorHeroSlogan: 'Ton prof qui ne dort jamais.',
      navSecurity: 'Sécurité',
      navMore: 'Plus',
      navDownloads: 'Téléchargements',
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
        "ANDERGO est une plateforme pour apprendre l'anglais, le français et l'espagnol grâce à des parcours clairs de A1 à C2. Chaque unité commence par Vocabulary, puis continue avec Reading, Listening, Speaking, Writing, Grammar et Verbes afin que la pratique suive une progression cohérente.",
      aboutWhatP2:
        "Commencez par l'activité recommandée, travaillez une compétence à la fois et avancez avec le Tuteur IA, le traducteur contextuel, l'audio et les outils de révision. Votre progression, votre série et vos objectifs sont enregistrés dans votre profil pour reprendre là où vous vous êtes arrêté.",
      aboutHowTitle: 'Comment ça marche',
      aboutHowSubtitle:
        'Pas de formules confuses ni d’étapes inutiles : choisissez, pratiquez et suivez vos progrès.',
      aboutStep1Title: '1. Choisissez votre langue et votre niveau',
      aboutStep1Text: "Sélectionnez l'anglais, le français ou l'espagnol, et le niveau A1–C2 qui vous convient.",
      aboutStep2Title: '2. Pratiquez des leçons guidées',
      aboutStep2Text: 'Suivez une séquence connectée : lecture, écoute, vocabulaire, grammaire, expression et verbes.',
      aboutStep3Title: '3. Parlez avec le Tuteur IA',
      aboutStep3Text: 'Demandez des explications pas à pas, des exemples et des indices sans quitter le fil de votre leçon.',
      aboutStep4Title: '4. Suivez vos progrès réels',
      aboutStep4Text: 'Consultez votre progression, votre série, vos objectifs et les activités à reprendre.',
      aboutStartFreeBtn: 'Commencer gratuitement',
      aboutIncludesTitle: 'Ce que la plateforme inclut',
      aboutIncludesItem1: 'Des parcours complets de A1 à C2 en anglais, français et espagnol.',
      aboutIncludesItem2: 'Une séquence dans chaque unité : Vocabulary, Reading, Listening, Speaking, Writing, Grammar et Verbes.',
      aboutIncludesItem3: 'Un Tuteur IA pour des explications pédagogiques, des exemples, des indices et une pratique guidée.',
      aboutIncludesItem4: "Un lecteur d'écoute avec répétition, saut, vitesse et texte d'appui selon vos besoins.",
      aboutIncludesItem5: 'Un traducteur contextuel, des cartes de vocabulaire et des exemples pour réviser dans les deux sens.',
      aboutIncludesItem6: 'Un suivi de la progression, de la série, des objectifs et des activités en attente.',
      aboutIncludesItem7: 'Un accès Premium pour débloquer du contenu supplémentaire.',
      aboutCreatorTitle: 'À propos du créateur',
      aboutCreatorP1:
        "ANDERGO a été créée par Anderson Almánzar de la Cruz, enseignant dominicain de langues étrangères et spécialiste de l'enseignement de l'anglais. Il travaille comme enseignant au niveau secondaire depuis 2011. De 2017 à 2021, il a suivi un master en linguistique appliquée à la langue anglaise à l'Universidad Autónoma de Santo Domingo (UASD), site de Nagua.",
      aboutCreatorP2:
        "Originaire de San Francisco de Macorís et établi à Nagua, Anderson associe son expérience en classe à une vision pratique de la technologie éducative. Il accompagne également des mémoires et monographies. ANDERGO est née de ce parcours : une plateforme où les apprenants peuvent pratiquer de manière guidée, recevoir des retours clairs et transformer la régularité en progrès visible. Il espère que ce projet sera une grande bénédiction pour de nombreuses personnes.",
      aboutCreatorProfileLink: "En savoir plus sur le créateur",
      aboutCreatorCredential1: 'Enseignant de langues étrangères',
      aboutCreatorCredential2: 'Linguistique appliquée à l’anglais',
      aboutCreatorCredential3: 'Éducation dominicaine',
      aboutCreatorJourneyTitle: 'Parcours professionnel',
      aboutCreatorJourney1: 'Enseignant de langues étrangères au secondaire',
      aboutCreatorJourney2: 'Master en linguistique appliquée à la langue anglaise · UASD, Nagua',
      aboutCreatorVision: 'Une plateforme née de la classe, avec l’espoir d’être une bénédiction pour de nombreuses personnes.',
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
      verbsBadge: 'Verbes',
      verbsTitle: 'Les verbes les plus fréquents en anglais',
      verbsDescription: 'Apprends, conjugue et pratique les verbes anglais les plus courants.',
      verbsLoading: 'Chargement des verbes…',
      verbsEmpty: 'Aucun verbe ne correspond à ta recherche.',
      verbsErrorRetry: "Nous n'avons pas pu charger les verbes pour le moment. Réessaie.",
      verbsRetryBtn: 'Réessayer',
      verbsLoadMoreBtn: 'Charger plus'
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
  // Deliberately narrower than SUPPORTED_LANGUAGES: Italian, Portuguese and
  // German currently enter through the authored Spanish interface. New target
  // routes are enabled here only after their content is ready.
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
    { bridge: 'spanish', target: 'italian' },
    { bridge: 'spanish', target: 'portuguese' },
    { bridge: 'spanish', target: 'german' },
    { bridge: 'french', target: 'spanish' },
    { bridge: 'french', target: 'english' },
    { bridge: 'english', target: 'french' }
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
