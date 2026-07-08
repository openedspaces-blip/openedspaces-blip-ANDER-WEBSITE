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

    [skillTabs, tutorAction, vocabSection].forEach(section => {
      if (section) section.classList.add('is-open');
    });

    const firstSkillButton = skillTabs?.querySelector('.skill-tab-button');
    if (firstSkillButton) firstSkillButton.click();

    if (detailToggle) {
      detailToggle.dataset.open = 'true';
      detailToggle.textContent = 'Ocultar detalles';
      detailToggle.setAttribute('aria-expanded', 'true');
    }
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

const levelContent = {
  english: {
    A1: {
      skills: {
        listening: { title: 'Listening', text: 'Short real-life dialogues with clear pauses and simple word chunks.', suggestions: ['She is going to...', 'At the station, the train...', 'We will meet at...'] },
        speaking: { title: 'Speaking', text: 'Simple speaking drills with useful prompts for everyday conversations.', suggestions: ['I would like to...', 'Could you tell me...', 'Let me introduce...'] },
        writing: { title: 'Writing', text: 'Very short writing prompts with guided sentence starters.', suggestions: ['A good email starts with...', 'In the next paragraph, describe...', 'Don\'t forget to add details about...'] }
      },
      vocab: [['Hello','Hola'], ['Family','Familia'], ['Morning','Mañana'], ['Travel','Viajar'], ['Help','Ayuda'], ['Friend','Amigo']],
      grammar: [['A1','Present simple, articles and basic pronouns.'], ['A2','Past simple and common frequency adverbs.']],
      reading: {
        title: 'Example reading A1',
        text: 'Sara visits a small museum in her city every Saturday. She reads the labels and listens to the guide. She likes to write a short note about her favorite object.',
        questions: ['What does Sara do at the museum?', 'How often does she visit the museum?', 'What does she write?']
      }
    },
    A2: {
      skills: {
        listening: { title: 'Listening', text: 'Basic listening practice with common vocabulary and short sentence patterns.', suggestions: ['I usually wake up at...', 'The weather is...', 'We need to buy...'] },
        speaking: { title: 'Speaking', text: 'Everyday conversations with helpful phrases for routines and plans.', suggestions: ['I usually...', 'Next week I want to...', 'It is important to...'] },
        writing: { title: 'Writing', text: 'Short personal messages and simple descriptions.', suggestions: ['Last weekend I...', 'My favorite place is...', 'I enjoy...'] }
      },
      vocab: [['City','Ciudad'], ['Museum','Museo'], ['Guide','Guía'], ['Note','Nota'], ['Favorite','Favorito'], ['Visit','Visita']],
      grammar: [['A2','Present continuous and simple comparisons.'], ['B1','Basic connectors for short paragraphs.']],
      reading: {
        title: 'Example reading A2',
        text: 'Tom goes to the park every morning. He sees the trees, hears the birds and drinks coffee before class.',
        questions: ['Where does Tom go every morning?', 'What does he hear?', 'What does he drink?']
      }
    },
    B1: {
      skills: {
        listening: { title: 'Listening', text: 'Clear conversations with opinions, preferences and realistic situations.', suggestions: ['I believe that...', 'It seems like...', 'What do you think about...'] },
        speaking: { title: 'Speaking', text: 'Speaking practice for giving opinions and explaining choices.', suggestions: ['In my opinion...', 'One reason is...', 'I would rather...'] },
        writing: { title: 'Writing', text: 'Paragraph writing with clear organization and supporting details.', suggestions: ['First of all...', 'Another point is...', 'For example...'] }
      },
      vocab: [['Opinion','Opinión'], ['Preference','Preferencia'], ['Reason','Razón'], ['Experience','Experiencia'], ['Discuss','Discutir'], ['Improve','Mejorar']],
      grammar: [['B1','Present perfect, modals and future forms.'], ['B2','Conditionals and reported speech.']],
      reading: {
        title: 'Example reading B1',
        text: 'Maya recently started a new job and is learning how to organize her week. She writes down priorities and checks her calendar every evening.',
        questions: ['What did Maya start recently?', 'What does she write down?', 'When does she check her calendar?']
      }
    },
    B2: {
      skills: {
        listening: { title: 'Listening', text: 'Longer audio with nuance, opinions and detailed explanations.', suggestions: ['It is likely that...', 'The main point is...', 'According to the speaker...'] },
        speaking: { title: 'Speaking', text: 'Extended speaking tasks with argumentation and comparisons.', suggestions: ['On the one hand...', 'On the other hand...', 'That said...'] },
        writing: { title: 'Writing', text: 'Essays and structured responses with stronger cohesion.', suggestions: ['To begin with...', 'In contrast...', 'As a result...'] }
      },
      vocab: [['Argument','Argumento'], ['Evidence','Evidencia'], ['Context','Contexto'], ['Complex','Complejo'], ['Precise','Preciso'], ['Debate','Debate']],
      grammar: [['B2','Conditional sentences and passive voice.'], ['C1','Advanced connectors and style.']],
      reading: {
        title: 'Example reading B2',
        text: 'The article compares two cities and explains how public transport, housing and social life affect residents in very different ways.',
        questions: ['What does the article compare?', 'What three areas are mentioned?', 'How do the cities differ?']
      }
    },
    C1: {
      skills: {
        listening: { title: 'Listening', text: 'Fast and natural speech with multiple speakers and abstract topics.', suggestions: ['The speaker implies that...', 'A key idea is...', 'This suggests that...'] },
        speaking: { title: 'Speaking', text: 'High-level speaking practice for discussion and debate.', suggestions: ['From my perspective...', 'It could be argued that...', 'A compelling example is...'] },
        writing: { title: 'Writing', text: 'Advanced composition with careful structure and rhetorical control.', suggestions: ['The central claim is...', 'In light of this...', 'To support this point...'] }
      },
      vocab: [['Nuance','Matiz'], ['Abstract','Abstracto'], ['Rhetoric','Retórica'], ['Precision','Precisión'], ['Cohesion','Coherencia'], ['Argumentation','Argumentación']],
      grammar: [['C1','Advanced passive voice and subjunctive structures.'], ['C2','Register, style and fine-grained cohesion.']],
      reading: {
        title: 'Example reading C1',
        text: 'A cultural essay explores how language shapes identity and explains why communities preserve traditions through storytelling and shared rituals.',
        questions: ['What does the essay explore?', 'How do communities preserve traditions?', 'What is the main theme?']
      }
    },
    C2: {
      skills: {
        listening: { title: 'Listening', text: 'Dense, authentic audio with subtle meaning, idiomatic language and rapid delivery.', suggestions: ['The underlying message is...', 'The speaker contrasts...', 'This point is especially relevant because...'] },
        speaking: { title: 'Speaking', text: 'Near-native speech practice for nuanced and professional communication.', suggestions: ['To put it more precisely...', 'What stands out most is...', 'In a broader context...'] },
        writing: { title: 'Writing', text: 'Sophisticated writing with style, framing and precision.', suggestions: ['With this in mind...', 'A more nuanced approach would be...', 'In conclusion...'] }
      },
      vocab: [['Nuanced','Matizado'], ['Register','Registro'], ['Inference','Inferencia'], ['Convey','Transmitir'], ['Subtle','Sutil'], ['Precision','Precisión']],
      grammar: [['C2','Fine-grained grammar, cohesion and formal style.'], ['Mastery','Near-native fluency and control.']],
      reading: {
        title: 'Example reading C2',
        text: 'The final passage examines the intersection of policy, identity and history, requiring the reader to infer meaning across several layers of argument.',
        questions: ['What does the passage examine?', 'What is required from the reader?', 'What is the focus of the argument?']
      }
    }
  },
  spanish: {
    A1: {
      skills: {
        listening: { title: 'Listening', text: 'Diálogos breves de la vida cotidiana con pausas claras y frases simples.', suggestions: ['Voy a la...', 'Ella tiene que...', 'Nos vemos en...'] },
        speaking: { title: 'Speaking', text: 'Práctica oral sencilla con frases útiles para conversaciones diarias.', suggestions: ['Me gustaría...', '¿Puedes ayudarme con...', 'Estoy buscando un...'] },
        writing: { title: 'Writing', text: 'Pequeñas redacciones guiadas con frases de inicio.', suggestions: ['Estimado/a...', 'En mi opinión...', 'El fin de semana pasado...'] }
      },
      vocab: [['Hola','Hello'], ['Familia','Family'], ['Mañana','Morning'], ['Viajar','Travel'], ['Ayuda','Help'], ['Amigo','Friend']],
      grammar: [['A1','Presente, artículos y pronombres básicos.'], ['A2','Pasado simple y adverbios de frecuencia.']],
      reading: {
        title: 'Ejemplo de lectura A1',
        text: 'Sara visita un museo pequeño en su ciudad cada sábado. Lee las etiquetas y escucha al guía. Le gusta escribir una nota corta sobre su objeto favorito.',
        questions: ['¿Qué hace Sara en el museo?', '¿Con qué frecuencia visita el museo?', '¿Qué escribe?']
      }
    },
    A2: {
      skills: {
        listening: { title: 'Listening', text: 'Práctica de escucha con vocabulario común y estructuras breves.', suggestions: ['Suelo despertarme a las...', 'El tiempo está...', 'Necesitamos comprar...'] },
        speaking: { title: 'Speaking', text: 'Conversaciones básicas para hablar de rutinas y planes.', suggestions: ['Normalmente...', 'La semana que viene quiero...', 'Es importante...'] },
        writing: { title: 'Writing', text: 'Mensajes cortos y descripciones personales.', suggestions: ['El fin de semana pasado...', 'Mi lugar favorito es...', 'Me gusta...'] }
      },
      vocab: [['Ciudad','City'], ['Museo','Museum'], ['Guía','Guide'], ['Nota','Note'], ['Favorito','Favorite'], ['Visita','Visit']],
      grammar: [['A2','Presente continuo y comparaciones simples.'], ['B1','Conectores básicos para párrafos cortos.']],
      reading: {
        title: 'Ejemplo de lectura A2',
        text: 'Tom va al parque todas las mañanas. Ve los árboles, oye a los pájaros y toma café antes de clase.',
        questions: ['¿Adónde va Tom cada mañana?', '¿Qué oye?', '¿Qué toma?']
      }
    },
    B1: {
      skills: {
        listening: { title: 'Listening', text: 'Conversaciones claras con opiniones, preferencias y situaciones realistas.', suggestions: ['Creo que...', 'Parece que...', '¿Qué piensas sobre...?'] },
        speaking: { title: 'Speaking', text: 'Práctica oral para dar opiniones y explicar decisiones.', suggestions: ['En mi opinión...', 'Una razón es...', 'Prefiero...'] },
        writing: { title: 'Writing', text: 'Escritura de párrafos con organización y detalles de apoyo.', suggestions: ['En primer lugar...', 'Otro punto es...', 'Por ejemplo...'] }
      },
      vocab: [['Opinión','Opinion'], ['Preferencia','Preference'], ['Razón','Reason'], ['Experiencia','Experience'], ['Discutir','Discuss'], ['Mejorar','Improve']],
      grammar: [['B1','Pretérito perfecto, modales y formas de futuro.'], ['B2','Condicionales y estilo indirecto.']],
      reading: {
        title: 'Ejemplo de lectura B1',
        text: 'Maya empezó un trabajo nuevo y está aprendiendo a organizar su semana. Escribe prioridades y revisa su calendario cada tarde.',
        questions: ['¿Qué empezó Maya recientemente?', '¿Qué escribe?', '¿Cuándo revisa su calendario?']
      }
    },
    B2: {
      skills: {
        listening: { title: 'Listening', text: 'Audios más largos con matices, opiniones y explicaciones detalladas.', suggestions: ['Es probable que...', 'El punto principal es...', 'Según el hablante...'] },
        speaking: { title: 'Speaking', text: 'Tareas orales extensas con argumentación y comparaciones.', suggestions: ['Por un lado...', 'Por otro lado...', 'Dicho esto...'] },
        writing: { title: 'Writing', text: 'Ensayos y respuestas estructuradas con mejor cohesión.', suggestions: ['Para empezar...', 'En contraste...', 'Como resultado...'] }
      },
      vocab: [['Argumento','Argument'], ['Evidencia','Evidence'], ['Contexto','Context'], ['Complejo','Complex'], ['Preciso','Precise'], ['Debate','Debate']],
      grammar: [['B2','Oraciones condicionales y voz pasiva.'], ['C1','Conectores avanzados y estilo.']],
      reading: {
        title: 'Ejemplo de lectura B2',
        text: 'El artículo compara dos ciudades y explica cómo el transporte público, la vivienda y la vida social afectan a los residentes de maneras muy distintas.',
        questions: ['¿Qué compara el artículo?', '¿Qué tres áreas se mencionan?', '¿Cómo difieren las ciudades?']
      }
    },
    C1: {
      skills: {
        listening: { title: 'Listening', text: 'Habla rápida y natural con varios interlocutores y temas abstractos.', suggestions: ['El hablante sugiere que...', 'Una idea clave es...', 'Esto apunta a que...'] },
        speaking: { title: 'Speaking', text: 'Práctica oral de alto nivel para discusión y debate.', suggestions: ['Desde mi punto de vista...', 'Se podría argumentar que...', 'Un ejemplo contundente es...'] },
        writing: { title: 'Writing', text: 'Composición avanzada con estructura cuidada y control retórico.', suggestions: ['La afirmación central es...', 'A la luz de esto...', 'Para apoyar este punto...'] }
      },
      vocab: [['Matiz','Nuance'], ['Abstracto','Abstract'], ['Retórica','Rhetoric'], ['Precisión','Precision'], ['Coherencia','Cohesion'], ['Argumentación','Argumentation']],
      grammar: [['C1','Voz pasiva avanzada y subjuntivo.'], ['C2','Registro, estilo y cohesión fina.']],
      reading: {
        title: 'Ejemplo de lectura C1',
        text: 'Un ensayo cultural explora cómo el lenguaje moldea la identidad y explica por qué las comunidades preservan tradiciones a través de relatos y rituales compartidos.',
        questions: ['¿Qué explora el ensayo?', '¿Cómo preservan tradiciones las comunidades?', '¿Cuál es el tema principal?']
      }
    },
    C2: {
      skills: {
        listening: { title: 'Listening', text: 'Audio denso y auténtico con significado sutil, lenguaje idiomático y ritmo rápido.', suggestions: ['El mensaje implícito es...', 'El hablante contrasta...', 'Este punto es especialmente relevante porque...'] },
        speaking: { title: 'Speaking', text: 'Práctica de habla casi nativa para una comunicación matizada y profesional.', suggestions: ['Para expresarlo con más precisión...', 'Lo que más destaca es...', 'En un contexto más amplio...'] },
        writing: { title: 'Writing', text: 'Escritura sofisticada con estilo, encuadre y precisión.', suggestions: ['Teniendo esto en cuenta...', 'Un enfoque más matizado sería...', 'En conclusión...'] }
      },
      vocab: [['Matizado','Nuanced'], ['Registro','Register'], ['Inferencia','Inference'], ['Transmitir','Convey'], ['Sutil','Subtle'], ['Precisión','Precision']],
      grammar: [['C2','Gramática fina, cohesión y estilo formal.'], ['Maestría','Near-native fluency and control.']],
      reading: {
        title: 'Ejemplo de lectura C2',
        text: 'El texto final examina la intersección entre política, identidad e historia, exigiendo al lector inferir significados en varias capas de argumento.',
        questions: ['¿Qué examina el texto final?', '¿Qué se exige al lector?', '¿Cuál es el foco del argumento?']
      }
    }
  },
  french: {
    A1: {
      skills: {
        listening: { title: 'Ecoute', text: 'Dialogues tres courts avec salutations, nombres et phrases de classe.', suggestions: ['Bonjour, je m appelle...', 'J habite a...', 'Je voudrais...'] },
        speaking: { title: 'Expression orale', text: 'Reponses simples pour se presenter et poser des questions de base.', suggestions: ['Je suis...', 'J aime...', 'Comment tu t appelles ?'] },
        writing: { title: 'Ecriture', text: 'Petits messages guides: presentation, famille et routine quotidienne.', suggestions: ['Bonjour, je...', 'Ma famille est...', 'Le matin, je...'] }
      },
      vocab: [['Bonjour','Hola'], ['Merci','Gracias'], ['Maison','Casa'], ['Famille','Familia'], ['Ecole','Escuela'], ['Ami','Amigo']],
      grammar: [['A1','Articles definis/indefinis, present de etre/avoir, genre et pluriel.'], ['Base','Pronoms sujets, negation simple et questions avec est-ce que.']],
      reading: {
        title: 'Lecture A1',
        text: 'Lea habite a Lyon. Elle aime le cafe, la musique et les livres courts. Le matin, elle va a l ecole avec son ami Marc.',
        questions: ['Ou habite Lea ?', 'Qu est-ce qu elle aime ?', 'Avec qui va-t-elle a l ecole ?']
      }
    },
    A2: {
      skills: {
        listening: { title: 'Ecoute', text: 'Audios sur les achats, les directions, les horaires et les activites du week-end.', suggestions: ['Je cherche la...', 'Le train part a...', 'Ce week-end, nous...'] },
        speaking: { title: 'Expression orale', text: 'Dialogues pratiques pour commander, demander un chemin et parler de projets.', suggestions: ['Je voudrais acheter...', 'Pour aller a...', 'Samedi, je vais...'] },
        writing: { title: 'Ecriture', text: 'Messages courts, invitations et descriptions simples avec connecteurs de base.', suggestions: ['Salut, tu veux...', 'D abord...', 'Apres le travail...'] }
      },
      vocab: [['Quartier','Barrio'], ['Billet','Boleto'], ['Magasin','Tienda'], ['Fromage','Queso'], ['Aujourd hui','Hoy'], ['Demain','Manana']],
      grammar: [['A2','Passe compose, futur proche, adjectifs, prepositions de lieu.'], ['Usage','Imperatif poli, pronoms complements simples et comparatifs.']],
      reading: {
        title: 'Lecture A2',
        text: 'Camille prepare un diner simple. Elle achete du pain, du fromage et des legumes. Apres le repas, ses amis regardent un film court.',
        questions: ['Que prepare Camille ?', 'Qu achete-t-elle ?', 'Que font ses amis apres le repas ?']
      }
    },
    B1: {
      skills: {
        listening: { title: 'Ecoute', text: 'Conversations claires avec opinions, recits au passe et situations de voyage.', suggestions: ['A mon avis...', 'Quand j etais...', 'Je pense que...'] },
        speaking: { title: 'Expression orale', text: 'Pratique pour raconter une experience, expliquer un choix et donner son opinion.', suggestions: ['Je prefere...', 'La raison principale est...', 'J ai remarque que...'] },
        writing: { title: 'Ecriture', text: 'Paragraphes structures avec introduction, exemples et conclusion courte.', suggestions: ['Tout d abord...', 'Par exemple...', 'Pour conclure...'] }
      },
      vocab: [['Avis','Opinion'], ['Choix','Eleccion'], ['Souvenir','Recuerdo'], ['Travail','Trabajo'], ['Voyage','Viaje'], ['Objectif','Meta']],
      grammar: [['B1','Imparfait vs passe compose, pronoms y/en, futur simple.'], ['Discours','Connecteurs, conditionnel present et discours indirect simple.']],
      reading: {
        title: 'Lecture B1',
        text: 'Nadia a change de ville pour son travail. Au debut, elle etait nerveuse, mais elle a trouve un club de lecture et de nouveaux amis.',
        questions: ['Pourquoi Nadia a-t-elle change de ville ?', 'Comment se sentait-elle au debut ?', 'Qu a-t-elle trouve ?']
      }
    },
    B2: {
      skills: {
        listening: { title: 'Ecoute', text: 'Entretiens et reportages avec arguments, nuances et details importants.', suggestions: ['Selon l intervenant...', 'Le probleme principal...', 'Cela montre que...'] },
        speaking: { title: 'Expression orale', text: 'Debats, comparaisons et prises de position sur des sujets sociaux ou professionnels.', suggestions: ['D une part...', 'En revanche...', 'Il faut tenir compte de...'] },
        writing: { title: 'Ecriture', text: 'Essais courts, courriels formels et syntheses avec cohesion claire.', suggestions: ['Le sujet souleve...', 'Il convient de...', 'En consequence...'] }
      },
      vocab: [['Enjeu','Desafio'], ['Preuve','Evidencia'], ['Nuance','Matiz'], ['Logement','Vivienda'], ['Transports','Transporte'], ['Developper','Desarrollar']],
      grammar: [['B2','Subjonctif, passif, conditionnels, participe present.'], ['Style','Hypothese, concession, cause/consequence et registre formel.']],
      reading: {
        title: 'Lecture B2',
        text: 'L article compare deux modeles de transport urbain et explique comment les choix publics influencent la qualite de vie des habitants.',
        questions: ['Que compare l article ?', 'Quels choix influencent la qualite de vie ?', 'Quel est le theme principal ?']
      }
    },
    C1: {
      skills: {
        listening: { title: 'Ecoute', text: 'Conferences, podcasts rapides et discussions abstraites avec implicite culturel.', suggestions: ['L idee sous-jacente...', 'Le locuteur nuance...', 'Cette remarque implique que...'] },
        speaking: { title: 'Expression orale', text: 'Argumentation avancee, reformulation et presentation professionnelle.', suggestions: ['Il serait pertinent de...', 'Autrement dit...', 'Un exemple parlant serait...'] },
        writing: { title: 'Ecriture', text: 'Textes argumentatifs avances avec ton, registre et progression logique.', suggestions: ['La these centrale...', 'Il ressort de cela que...', 'Cette perspective merite...'] }
      },
      vocab: [['Implicite','Implicito'], ['Portee','Alcance'], ['Nuancer','Matizar'], ['Coherence','Coherencia'], ['Registre','Registro'], ['Demarche','Enfoque']],
      grammar: [['C1','Subjonctif avance, inversion, tournures impersonnelles.'], ['Maitrise','Articulateurs complexes, nominalisation et style academique.']],
      reading: {
        title: 'Lecture C1',
        text: 'Un essai analyse la maniere dont la langue construit l identite collective et transmet la memoire culturelle entre generations.',
        questions: ['Que construit la langue selon l essai ?', 'Que transmet-elle entre generations ?', 'Quel type de texte est-ce ?']
      }
    },
    C2: {
      skills: {
        listening: { title: 'Ecoute', text: 'Audio authentique dense avec ironie, sous-entendus, references culturelles et rythme naturel.', suggestions: ['Le sous-entendu est...', 'La nuance decisive...', 'Cette formulation suggere...'] },
        speaking: { title: 'Expression orale', text: 'Expression quasi native pour debattre, negocier et presenter avec precision.', suggestions: ['Pour etre plus precis...', 'Ce qui me parait essentiel...', 'Dans une perspective plus large...'] },
        writing: { title: 'Ecriture', text: 'Production experte: style, concision, argumentation fine et adaptation au public.', suggestions: ['Il convient toutefois de...', 'Une lecture plus subtile...', 'En definitive...'] }
      },
      vocab: [['Sous-entendu','Sobreentendido'], ['Raffine','Refinado'], ['Exigence','Exigencia'], ['Equivoque','Ambiguedad'], ['Eloquence','Elocuencia'], ['Synthese','Sintesis']],
      grammar: [['C2','Maitrise fine des registres, temps litteraires et cohesion.'], ['Expertise','Reformulation, precision stylistique et argumentation nuancee.']],
      reading: {
        title: 'Lecture C2',
        text: 'Le passage examine les tensions entre memoire, pouvoir et recit public, obligeant le lecteur a inferer plusieurs niveaux d intention.',
        questions: ['Quelles tensions le passage examine-t-il ?', 'Que doit inferer le lecteur ?', 'Quel est le niveau attendu ?']
      }
    }
  }
};

const languageContent = {
  english: {
    nav: ['Languages', 'Achievements', 'Skills', 'Goals', 'Downloads', 'App'],
    brandSubtitle: 'Learn with clear lessons and practical exercises.',
    heroBadge: 'Clear lessons and practical practice',
    heroTitle: 'Learn English and other languages with simple, step-by-step practice.',
    heroText: 'ANDERGO helps you improve listening, speaking, reading and writing with guided activities and content adapted to your level.',
    heroPrimary: 'Start free',
    heroSecondary: 'Set my goals',
    authLogin: 'Log in',
    authSignup: 'Start free',
    sectionLabel: 'Languages',
    sectionTitle: 'Choose the language you want to learn and start today.',
    sectionDescription: 'Practice with audio, texts and exercises designed for your level and native language.',
    nativeSelectorLabel: 'Select your native language',
    overviewTitle: 'Guided English path: A1 to C2',
    overviewText: 'Learn step by step with clear activities, useful examples and practice in every skill.',
    note: 'A1 and A2 are starting levels; B1 to C2 unlock according to your goals and progress.',
    skillPanels: {
      listening: { title: 'Listening', text: 'Short audio with gaps to complete and improve your comprehension.' },
      speaking: { title: 'Speaking', text: 'Simple speaking practice with useful phrases for real conversations.' },
      writing: { title: 'Writing', text: 'Guided writing with helpful sentence starters for every level.' }
    }
  },
  spanish: {
    nav: ['Idiomas', 'Logros', 'Habilidades', 'Metas', 'Descargas', 'App'],
    brandSubtitle: 'Aprende con lecciones claras y ejercicios prácticos.',
    heroBadge: 'Lecciones guiadas y ejercicios prácticos',
    heroTitle: 'Aprende inglés y otros idiomas con ejercicios sencillos, claros y progresivos.',
    heroText: 'ANDERGO te ayuda a practicar comprensión, expresión oral, lectura y escritura con actividades guiadas y contenido adaptado a tu nivel.',
    heroPrimary: 'Empieza gratis',
    heroSecondary: 'Definir mis metas',
    authLogin: 'Iniciar sesión',
    authSignup: 'Comenzar gratis',
    sectionLabel: 'Idiomas',
    sectionTitle: 'Elige el idioma que quieres aprender y empieza hoy.',
    sectionDescription: 'Practica con audios, textos y ejercicios pensados para tu nivel y tu lengua materna.',
    nativeSelectorLabel: 'Selecciona tu lengua nativa',
    overviewTitle: 'Ruta guiada de español: A1 a C2',
    overviewText: 'Aprende paso a paso con actividades claras, ejemplos útiles y práctica en cada habilidad.',
    note: 'A1 y A2 son niveles de inicio; B1 a C2 se activan según tus metas y progreso.',
    skillPanels: {
      listening: { title: 'Listening', text: 'Audios breves con frases para completar y mejorar la comprensión.' },
      speaking: { title: 'Speaking', text: 'Práctica oral sencilla con frases útiles para conversaciones reales.' },
      writing: { title: 'Writing', text: 'Escritura guiada con apoyos para empezar cada texto.' }
    }
  },
  french: {
    nav: ['Langues', 'Réussites', 'Compétences', 'Objectifs', 'Téléchargements', 'App'],
    brandSubtitle: 'Apprenez n’importe quelle langue. Ouvrez votre monde.',
    heroBadge: 'Apprentissage des langues par IA',
    heroTitle: 'Maîtrisez n’importe quelle langue grâce à une intelligence artificielle pensée pour vous.',
    heroText: 'ANDERGO est une plateforme SaaS d’apprentissage des langues propulsée par l’IA, conçue pour vous aider à maîtriser l’anglais, le français, l’espagnol, l’italien et l’allemand du niveau A1 au C2.',
    heroPrimary: 'Commencer gratuitement',
    heroSecondary: 'Definir mes objectifs',
    authLogin: 'Se connecter',
    authSignup: 'Commencer',
    sectionLabel: 'Langues',
    sectionTitle: 'Choisissez votre langue maternelle et la langue que vous souhaitez apprendre.',
    sectionDescription: 'La plateforme adapte les explications, exemples et exercices à votre langue maternelle.',
    nativeSelectorLabel: 'Sélectionnez votre langue maternelle',
    overviewTitle: 'Parcours complet de français : A1 à C2',
    overviewText: 'Apprenez le français pas à pas avec un contenu adapté aux hispanophones et des exercices de compréhension, expression orale, lecture et écriture à chaque niveau.',
    note: 'A1 et A2 sont les niveaux de depart ; B1 a C2 suivent vos objectifs et progres.',
    skillPanels: {
      listening: { title: 'Écoute', text: 'Des audios en français avec des espaces à compléter pour renforcer votre compréhension.' },
      speaking: { title: 'Parler', text: 'Des phrases de départ prédictives pour améliorer votre expression orale.' },
      writing: { title: 'Écriture', text: 'Des débuts de texte prédictifs pour rédiger en français avec confiance.' }
    }
  },
  italian: {
    nav: ['Lingue', 'Traguardi', 'Competenze', 'Obiettivi', 'Download', 'App'],
    brandSubtitle: 'Impara qualsiasi lingua. Apri il tuo mondo.',
    heroBadge: 'Apprendimento linguistico con IA',
    heroTitle: 'Padroneggia qualsiasi lingua con un’intelligenza artificiale pensata per te.',
    heroText: 'ANDERGO è una piattaforma SaaS per l’apprendimento delle lingue alimentata dall’IA, pensata per aiutarti a padroneggiare inglese, francese, spagnolo, italiano e tedesco da A1 a C2.',
    heroPrimary: 'Inizia gratis',
    heroSecondary: 'Definisci obiettivi',
    authLogin: 'Accedi',
    authSignup: 'Inizia gratis',
    sectionLabel: 'Lingue',
    sectionTitle: 'Scegli la tua lingua madre e la lingua che vuoi imparare.',
    sectionDescription: 'La piattaforma adatta spiegazioni, esempi ed esercizi in base alla tua lingua madre.',
    nativeSelectorLabel: 'Seleziona la tua lingua madre',
    overviewTitle: 'Percorso completo di italiano: da A1 a C2',
    overviewText: 'Impara l’italiano passo dopo passo con contenuti adattati per gli ispanofoni e pratica in ascolto, parlato, lettura e scrittura a ogni livello.',
    note: 'A1 e A2 sono livelli iniziali; da B1 a C2 seguono obiettivi e progresso.',
    skillPanels: {
      listening: { title: 'Ascolto', text: 'Audio italiani con frasi da completare per migliorare la comprensione orale.' },
      speaking: { title: 'Parlato', text: 'Frasi di partenza predittive per migliorare le tue risposte in italiano.' },
      writing: { title: 'Scrittura', text: 'Esempi di scrittura con suggerimenti iniziali per redigere in italiano.' }
    }
  },
  german: {
    nav: ['Sprachen', 'Erfolge', 'Fähigkeiten', 'Ziele', 'Downloads', 'App'],
    brandSubtitle: 'Lerne jede Sprache. Öffne deine Welt.',
    heroBadge: 'Sprachlernen mit KI',
    heroTitle: 'Meistere jede Sprache mit KI, die auf dich zugeschnitten ist.',
    heroText: 'ANDERGO ist eine KI-gestützte SaaS-Plattform für Sprachlernen, die dir hilft, Englisch, Französisch, Spanisch, Italienisch und Deutsch von A1 bis C2 zu beherrschen.',
    heroPrimary: 'Kostenlos starten',
    heroSecondary: 'Ziele festlegen',
    authLogin: 'Anmelden',
    authSignup: 'Kostenlos starten',
    sectionLabel: 'Sprachen',
    sectionTitle: 'Wähle deine Muttersprache und die Sprache, die du lernen möchtest.',
    sectionDescription: 'Die Plattform passt Erklärungen, Beispiele und Übungen an deine Muttersprache an.',
    nativeSelectorLabel: 'Wähle deine Muttersprache',
    overviewTitle: 'Kompletter deutscher Lernweg: A1 bis C2',
    overviewText: 'Lerne Deutsch Schritt für Schritt mit Inhalten, die für Spanischsprachige angepasst sind, und Übung in Hören, Sprechen, Lesen und Schreiben auf jedem Niveau.',
    note: 'A1 und A2 sind Einstiegsstufen; B1 bis C2 folgen deinen Zielen und Fortschritten.',
    skillPanels: {
      listening: { title: 'Hören', text: 'Deutsche Audios mit Lücken, die du ergänzen kannst, um dein Hörverständnis zu verbessern.' },
      speaking: { title: 'Sprechen', text: 'Startphrasen für deine Antworten auf Deutsch.' },
      writing: { title: 'Schreiben', text: 'Schreibanleitungen mit Vorschlägen für den Einstieg ins Schreiben.' }
    }
  },
  ai: {
    nav: ['Idiomas', 'Logros', 'Habilidades', 'Metas', 'Descargas', 'App'],
    brandSubtitle: 'Aprende cualquier idioma. Abre tu mundo.',
    heroBadge: 'Tutor de idiomas con IA',
    heroTitle: 'Aprende con un tutor impulsado por IA, adaptado a ti.',
    heroText: 'ANDERGO combina IA conversacional con rutas de aprendizaje guiadas para ayudarte a practicar inglés, francés, español, italiano y alemán desde A1 hasta C2.',
    heroPrimary: 'Hablar con el tutor',
    heroSecondary: 'Definir mis metas',
    authLogin: 'Iniciar sesión',
    authSignup: 'Comenzar gratis',
    sectionLabel: 'Tutor IA',
    sectionTitle: 'Explora una experiencia de aprendizaje guiada por IA.',
    sectionDescription: 'El tutor adapta explicaciones, ejemplos y ejercicios a tu nivel y estilo de aprendizaje.',
    nativeSelectorLabel: 'Selecciona tu lengua nativa',
    overviewTitle: 'Tutor especializado en aprendizaje de idiomas',
    overviewText: 'Interactúa con un tutor conversacional experto que usa la plataforma OpenAI para personalizar tus explicaciones, correcciones y práctica en tiempo real.',
    note: 'Este modo de tutoría está disponible para acompañar tus sesiones y practicar en contexto.',
    skillPanels: {
      listening: { title: 'Listening', text: 'Comprensión auditiva con audios generados por IA y transcripciones interactivas.' },
      speaking: { title: 'Speaking', text: 'Práctica de conversación con feedback inmediato y frases sugeridas para continuar.' },
      writing: { title: 'Writing', text: 'Redacción con arranques de frase y correcciones de estilo directo desde la plataforma OpenAI.' }
    }
  }
};

// Carga modular: cada idioma vive en /worlds/<idioma>/content.js.
// Esto evita mantener todos los textos dentro de script.js y facilita ampliar cada mundo por nivel.
if (window.ANDERGO_LANGUAGE_WORLDS) {
  Object.assign(levelContent, window.ANDERGO_LANGUAGE_WORLDS.levelContent || {});
  Object.assign(languageContent, window.ANDERGO_LANGUAGE_WORLDS.languageContent || {});
}

function applyLanguageContent(languageKey, nativeLanguage = currentNativeLanguage) {
  const content = languageContent[languageKey] || languageContent.spanish;
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

  card.querySelectorAll('.skill-tabs, .vocab-section, .grammar-section, .reading-comprehension, .tutor-action').forEach(section => {
    section.classList.remove('is-open');
  });

  toggle.dataset.open = 'false';
  toggle.textContent = 'Ver más detalles';
  toggle.setAttribute('aria-expanded', 'false');
}

function setupDetailToggles() {
  document.querySelectorAll('.language-card').forEach(card => {
    const accessSummary = card.querySelector('.access-summary');
    if (!accessSummary || card.querySelector('.detail-toggle')) return;

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'detail-toggle';
    toggleButton.textContent = 'Ver más detalles';
    toggleButton.setAttribute('aria-expanded', 'false');
    accessSummary.insertAdjacentElement('afterend', toggleButton);
  });

  document.querySelectorAll('.detail-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const card = toggle.closest('.language-card');
      const isOpen = toggle.dataset.open === 'true';
      const detailSections = card.querySelectorAll('.skill-tabs, .vocab-section, .grammar-section, .reading-comprehension, .tutor-action');

      detailSections.forEach(section => {
        section.classList.toggle('is-open', !isOpen);
      });

      toggle.dataset.open = String(!isOpen);
      toggle.textContent = isOpen ? 'Ver más detalles' : 'Ocultar detalles';
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

function renderLessonList() {
  const list = document.getElementById('lessonList');
  if (!list) return;

  list.innerHTML = learningPathState.lessons.map((lesson) => `
    <article class="lesson-item ${lesson.slug === learningPathState.activeSlug ? 'active' : ''} ${lesson.completed ? 'completed' : ''}" data-lesson-slug="${escapeHtml(lesson.slug)}">
      <span>${escapeHtml(lesson.level)} · ${escapeHtml(lesson.skill)} · ${lesson.isFree ? 'Gratis' : `Premium USD ${premiumPriceUsd}`}</span>
      <h3>${lesson.locked ? '🔒 ' : ''}${escapeHtml(lesson.title)}</h3>
      <p>${escapeHtml(lesson.description || '')}</p>
    </article>
  `).join('');

  list.querySelectorAll('.lesson-item').forEach(item => {
    item.addEventListener('click', () => {
      learningPathState.activeSlug = item.dataset.lessonSlug;
      renderLearningPath();
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
  renderLessonList();
  renderLessonWorkspace();
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

  const list = document.getElementById('lessonList');
  if (list) {
    list.innerHTML = '<article class="lesson-item active"><span>Cargando</span><h3>Preparando tu ruta...</h3><p>Un momento por favor.</p></article>';
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
activateInitialLanguageTab();

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

skillTabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const skill = button.dataset.skill;
    const parent = button.closest('.skill-tabs');
    const buttons = parent.querySelectorAll('.skill-tab-button');
    const panels = parent.querySelectorAll('.skill-panel');
    const card = parent.closest('.language-card');
    const detailToggle = card?.querySelector('.detail-toggle');

    buttons.forEach(btn => btn.classList.toggle('active', btn === button));
    panels.forEach(panel => {
      panel.classList.toggle('active', panel.dataset.skill === skill);
    });

    if (parent) {
      parent.classList.add('is-open');
    }

    if (card) {
      card.querySelectorAll('.vocab-section, .grammar-section, .reading-comprehension, .tutor-action').forEach(section => {
        section.classList.remove('is-open');
      });
    }

    if (detailToggle) {
      detailToggle.dataset.open = 'true';
      detailToggle.textContent = 'Ocultar detalles';
      detailToggle.setAttribute('aria-expanded', 'true');
    }

    parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
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
  if (targetFromHash) activateLanguageTab(targetFromHash);
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

  document.addEventListener('click', event => {
    const upgradeButton = event.target.closest('.upgrade-btn');
    if (upgradeButton) {
      handleHomeAction('upgrade');
      if (!authStatus.session?.access_token) {
        setAuthMessage(`Crea tu cuenta para desbloquear la ruta premium por USD ${premiumPriceUsd}.`);
        openModal('signup');
      }
      return;
    }

    const suggestion = event.target.closest('.predictive-suggestion');
    if (suggestion) {
      const group = suggestion.closest('.predictive-suggestions');
      group?.querySelectorAll('.predictive-suggestion').forEach(item => item.classList.remove('selected'));
      suggestion.classList.add('selected');
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
      if (result) {
        result.innerHTML = '<strong>Respuesta del tutor:</strong> Empecemos con una practica corta. Dime tu nivel, el idioma y una frase que quieras mejorar.';
        result.classList.add('is-visible');
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
