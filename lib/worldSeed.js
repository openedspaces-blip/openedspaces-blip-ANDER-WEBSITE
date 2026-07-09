const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const SKILLS = ['listening', 'speaking', 'reading', 'writing', 'vocabulary', 'grammar'];

const TOPICS_BY_LEVEL = {
  A1: [
    ['greetings', 'Greetings'],
    ['numbers', 'Numbers'],
    ['colors', 'Colors'],
    ['family-basics', 'Family Basics'],
    ['food-basics', 'Food Basics'],
    ['daily-routine', 'Daily Routine']
  ],
  A2: [
    ['my-home', 'My Home'],
    ['shopping', 'Shopping'],
    ['weather', 'Weather'],
    ['hobbies', 'Hobbies'],
    ['transportation', 'Transportation'],
    ['health', 'Health']
  ],
  B1: [
    ['travel-planning', 'Travel Planning'],
    ['work-environment', 'Work Environment'],
    ['media-technology', 'Media & Technology'],
    ['cultural-events', 'Cultural Events'],
    ['environment', 'Environment'],
    ['sports', 'Sports']
  ],
  B2: [
    ['current-events', 'Current Events'],
    ['economics-basics', 'Economics Basics'],
    ['literature-review', 'Literature Review'],
    ['urban-life', 'Urban Life'],
    ['international-topics', 'International Topics'],
    ['science-tech', 'Science & Tech']
  ],
  C1: [
    ['political-discourse', 'Political Discourse'],
    ['philosophical-debate', 'Philosophical Debate'],
    ['advanced-literature', 'Advanced Literature'],
    ['academic-writing', 'Academic Writing'],
    ['global-issues', 'Global Issues'],
    ['complex-media', 'Complex Media']
  ],
  C2: [
    ['rhetorical-analysis', 'Rhetorical Analysis'],
    ['nuanced-argumentation', 'Nuanced Argumentation'],
    ['cultural-criticism', 'Cultural Criticism'],
    ['interdisciplinary-thinking', 'Interdisciplinary Thinking'],
    ['synthesis-writing', 'Synthesis Writing'],
    ['research-methodology', 'Research Methodology']
  ]
};

const TOPIC_LOCALIZATION = {
  english: TOPICS_BY_LEVEL,
  french: {
    A1: [
      ['salutations', 'Salutations'],
      ['nombres', 'Nombres'],
      ['couleurs', 'Couleurs'],
      ['famille-base', 'Famille de base'],
      ['alimentation-base', 'Alimentation de base'],
      ['routine-quotidienne', 'Routine quotidienne']
    ],
    A2: [
      ['ma-maison', 'Ma maison'],
      ['achats', 'Achats'],
      ['meteo', 'Meteo'],
      ['loisirs', 'Loisirs'],
      ['transports', 'Transports'],
      ['sante', 'Sante']
    ],
    B1: [
      ['planification-voyage', 'Planification de voyage'],
      ['environnement-professionnel', 'Environnement professionnel'],
      ['medias-technologie', 'Medias et technologie'],
      ['evenements-culturels', 'Evenements culturels'],
      ['environnement', 'Environnement'],
      ['sports', 'Sports']
    ],
    B2: [
      ['actualites', 'Actualites'],
      ['bases-economie', 'Bases de l economie'],
      ['critique-litteraire', 'Critique litteraire'],
      ['vie-urbaine', 'Vie urbaine'],
      ['sujets-internationaux', 'Sujets internationaux'],
      ['sciences-technologies', 'Sciences et technologies']
    ],
    C1: [
      ['discours-politique', 'Discours politique'],
      ['debat-philosophique', 'Debat philosophique'],
      ['litterature-avancee', 'Litterature avancee'],
      ['redaction-academique', 'Redaction academique'],
      ['enjeux-mondiaux', 'Enjeux mondiaux'],
      ['medias-complexes', 'Medias complexes']
    ],
    C2: [
      ['analyse-rhetorique', 'Analyse rhetorique'],
      ['argumentation-nuancee', 'Argumentation nuancee'],
      ['critique-culturelle', 'Critique culturelle'],
      ['pensee-interdisciplinaire', 'Pensee interdisciplinaire'],
      ['redaction-synthese', 'Redaction de synthese'],
      ['methodologie-recherche', 'Methodologie de recherche']
    ]
  },
  spanish: {
    A1: [
      ['saludos', 'Saludos'],
      ['numeros', 'Numeros'],
      ['colores', 'Colores'],
      ['familia-basica', 'Familia basica'],
      ['comida-basica', 'Comida basica'],
      ['rutina-diaria', 'Rutina diaria']
    ],
    A2: [
      ['mi-casa', 'Mi casa'],
      ['compras', 'Compras'],
      ['clima', 'Clima'],
      ['aficiones', 'Aficiones'],
      ['transporte', 'Transporte'],
      ['salud', 'Salud']
    ],
    B1: [
      ['planificacion-viaje', 'Planificacion de viaje'],
      ['entorno-laboral', 'Entorno laboral'],
      ['medios-tecnologia', 'Medios y tecnologia'],
      ['eventos-culturales', 'Eventos culturales'],
      ['medio-ambiente', 'Medio ambiente'],
      ['deportes', 'Deportes']
    ],
    B2: [
      ['actualidad', 'Actualidad'],
      ['economia-basica', 'Economia basica'],
      ['resena-literaria', 'Resena literaria'],
      ['vida-urbana', 'Vida urbana'],
      ['temas-internacionales', 'Temas internacionales'],
      ['ciencia-tecnologia', 'Ciencia y tecnologia']
    ],
    C1: [
      ['discurso-politico', 'Discurso politico'],
      ['debate-filosofico', 'Debate filosofico'],
      ['literatura-avanzada', 'Literatura avanzada'],
      ['redaccion-academica', 'Redaccion academica'],
      ['asuntos-globales', 'Asuntos globales'],
      ['medios-complejos', 'Medios complejos']
    ],
    C2: [
      ['analisis-retorico', 'Analisis retorico'],
      ['argumentacion-matizada', 'Argumentacion matizada'],
      ['critica-cultural', 'Critica cultural'],
      ['pensamiento-interdisciplinario', 'Pensamiento interdisciplinario'],
      ['escritura-sintesis', 'Escritura de sintesis'],
      ['metodologia-investigacion', 'Metodologia de investigacion']
    ]
  },
  italian: {
    A1: [
      ['saluti', 'Saluti'],
      ['numeri', 'Numeri'],
      ['colori', 'Colori'],
      ['famiglia-base', 'Famiglia di base'],
      ['cibo-base', 'Cibo di base'],
      ['routine-quotidiana', 'Routine quotidiana']
    ],
    A2: [
      ['casa-mia', 'Casa mia'],
      ['shopping', 'Shopping'],
      ['meteo', 'Meteo'],
      ['passatempi', 'Passatempi'],
      ['trasporti', 'Trasporti'],
      ['salute', 'Salute']
    ],
    B1: [
      ['pianificazione-viaggio', 'Pianificazione del viaggio'],
      ['ambiente-lavorativo', 'Ambiente lavorativo'],
      ['media-tecnologia', 'Media e tecnologia'],
      ['eventi-culturali', 'Eventi culturali'],
      ['ambiente', 'Ambiente'],
      ['sport', 'Sport']
    ],
    B2: [
      ['attualita', 'Attualita'],
      ['basi-economia', 'Basi di economia'],
      ['recensione-letteraria', 'Recensione letteraria'],
      ['vita-urbana', 'Vita urbana'],
      ['temi-internazionali', 'Temi internazionali'],
      ['scienza-tecnologia', 'Scienza e tecnologia']
    ],
    C1: [
      ['discorso-politico', 'Discorso politico'],
      ['dibattito-filosofico', 'Dibattito filosofico'],
      ['letteratura-avanzata', 'Letteratura avanzata'],
      ['scrittura-accademica', 'Scrittura accademica'],
      ['questioni-globali', 'Questioni globali'],
      ['media-complessi', 'Media complessi']
    ],
    C2: [
      ['analisi-retorica', 'Analisi retorica'],
      ['argomentazione-sfumata', 'Argomentazione sfumata'],
      ['critica-culturale', 'Critica culturale'],
      ['pensiero-interdisciplinare', 'Pensiero interdisciplinare'],
      ['scrittura-sintesi', 'Scrittura di sintesi'],
      ['metodologia-ricerca', 'Metodologia della ricerca']
    ]
  },
  german: {
    A1: [
      ['begruessungen', 'Begruessungen'],
      ['zahlen', 'Zahlen'],
      ['farben', 'Farben'],
      ['familie-grundlagen', 'Familiengrundlagen'],
      ['essen-grundlagen', 'Essensgrundlagen'],
      ['tagesablauf', 'Tagesablauf']
    ],
    A2: [
      ['mein-zuhause', 'Mein Zuhause'],
      ['einkaufen', 'Einkaufen'],
      ['wetter', 'Wetter'],
      ['hobbys', 'Hobbys'],
      ['verkehr', 'Verkehr'],
      ['gesundheit', 'Gesundheit']
    ],
    B1: [
      ['reiseplanung', 'Reiseplanung'],
      ['arbeitsumfeld', 'Arbeitsumfeld'],
      ['medien-technologie', 'Medien und Technologie'],
      ['kulturveranstaltungen', 'Kulturveranstaltungen'],
      ['umwelt', 'Umwelt'],
      ['sport', 'Sport']
    ],
    B2: [
      ['aktuelle-themen', 'Aktuelle Themen'],
      ['wirtschaft-grundlagen', 'Wirtschaftsgrundlagen'],
      ['literaturbesprechung', 'Literaturbesprechung'],
      ['stadtleben', 'Stadtleben'],
      ['internationale-themen', 'Internationale Themen'],
      ['wissenschaft-technik', 'Wissenschaft und Technik']
    ],
    C1: [
      ['politischer-diskurs', 'Politischer Diskurs'],
      ['philosophische-debatte', 'Philosophische Debatte'],
      ['fortgeschrittene-literatur', 'Fortgeschrittene Literatur'],
      ['akademisches-schreiben', 'Akademisches Schreiben'],
      ['globale-fragen', 'Globale Fragen'],
      ['komplexe-medien', 'Komplexe Medien']
    ],
    C2: [
      ['rhetorische-analyse', 'Rhetorische Analyse'],
      ['nuancierte-argumentation', 'Nuancierte Argumentation'],
      ['kulturkritik', 'Kulturkritik'],
      ['interdisziplinaeres-denken', 'Interdisziplinaeres Denken'],
      ['synthese-schreiben', 'Synthese-Schreiben'],
      ['forschungsmethodik', 'Forschungsmethodik']
    ]
  }
};

const LANGUAGE_META = {
  english: { code: 'en', name: 'English', aliases: ['english', 'en'] },
  french: { code: 'fr', name: 'French', aliases: ['french', 'fr', 'frances', 'francais', 'français'] },
  spanish: { code: 'es', name: 'Spanish', aliases: ['spanish', 'es', 'espanol', 'español'] },
  italian: { code: 'it', name: 'Italian', aliases: ['italian', 'it', 'italiano'] },
  german: { code: 'de', name: 'German', aliases: ['german', 'de', 'deutsch'] }
};

function normalizeLanguage(language) {
  const candidate = String(language || 'english').trim().toLowerCase();
  for (const [key, meta] of Object.entries(LANGUAGE_META)) {
    if (meta.aliases.includes(candidate)) {
      return key;
    }
  }
  return 'english';
}

function createGeneratedLevelContent(languageLabel, translationMap) {
  return {
    A1: {
      skills: {
        listening: { title: translationMap.listeningTitle, text: `${languageLabel} A1 listening practice with short classroom exchanges and clear pronunciation.`, suggestions: translationMap.a1Listening },
        speaking: { title: translationMap.speakingTitle, text: `${languageLabel} A1 speaking prompts for introductions, requests and routine interactions.`, suggestions: translationMap.a1Speaking },
        writing: { title: translationMap.writingTitle, text: `${languageLabel} A1 writing starters for personal details, family and daily activities.`, suggestions: translationMap.a1Writing }
      },
      vocab: translationMap.a1Vocab,
      grammar: translationMap.a1Grammar,
      reading: translationMap.a1Reading
    },
    A2: {
      skills: {
        listening: { title: translationMap.listeningTitle, text: `${languageLabel} A2 audio practice about directions, shopping and weekend plans.`, suggestions: translationMap.a2Listening },
        speaking: { title: translationMap.speakingTitle, text: `${languageLabel} A2 speaking practice for routines, preferences and short plans.`, suggestions: translationMap.a2Speaking },
        writing: { title: translationMap.writingTitle, text: `${languageLabel} A2 guided writing for invitations, messages and personal descriptions.`, suggestions: translationMap.a2Writing }
      },
      vocab: translationMap.a2Vocab,
      grammar: translationMap.a2Grammar,
      reading: translationMap.a2Reading
    },
    B1: {
      skills: {
        listening: { title: translationMap.listeningTitle, text: `${languageLabel} B1 listening with opinions, narratives and travel scenarios.`, suggestions: translationMap.b1Listening },
        speaking: { title: translationMap.speakingTitle, text: `${languageLabel} B1 speaking practice for describing experiences and explaining choices.`, suggestions: translationMap.b1Speaking },
        writing: { title: translationMap.writingTitle, text: `${languageLabel} B1 structured writing with connectors, examples and short conclusions.`, suggestions: translationMap.b1Writing }
      },
      vocab: translationMap.b1Vocab,
      grammar: translationMap.b1Grammar,
      reading: translationMap.b1Reading
    },
    B2: {
      skills: {
        listening: { title: translationMap.listeningTitle, text: `${languageLabel} B2 listening focused on interviews, arguments and detailed reporting.`, suggestions: translationMap.b2Listening },
        speaking: { title: translationMap.speakingTitle, text: `${languageLabel} B2 debate and comparison tasks with nuance and justification.`, suggestions: translationMap.b2Speaking },
        writing: { title: translationMap.writingTitle, text: `${languageLabel} B2 writing for essays, summaries and professional messages.`, suggestions: translationMap.b2Writing }
      },
      vocab: translationMap.b2Vocab,
      grammar: translationMap.b2Grammar,
      reading: translationMap.b2Reading
    },
    C1: {
      skills: {
        listening: { title: translationMap.listeningTitle, text: `${languageLabel} C1 listening on lectures, debates and abstract topics.`, suggestions: translationMap.c1Listening },
        speaking: { title: translationMap.speakingTitle, text: `${languageLabel} C1 speaking for argumentation, reformulation and presentations.`, suggestions: translationMap.c1Speaking },
        writing: { title: translationMap.writingTitle, text: `${languageLabel} C1 advanced writing with register control and logical progression.`, suggestions: translationMap.c1Writing }
      },
      vocab: translationMap.c1Vocab,
      grammar: translationMap.c1Grammar,
      reading: translationMap.c1Reading
    },
    C2: {
      skills: {
        listening: { title: translationMap.listeningTitle, text: `${languageLabel} C2 authentic listening with subtle meaning, implied stance and cultural references.`, suggestions: translationMap.c2Listening },
        speaking: { title: translationMap.speakingTitle, text: `${languageLabel} C2 near-native speaking practice for precision and nuance.`, suggestions: translationMap.c2Speaking },
        writing: { title: translationMap.writingTitle, text: `${languageLabel} C2 expert writing with synthesis, style and rhetorical control.`, suggestions: translationMap.c2Writing }
      },
      vocab: translationMap.c2Vocab,
      grammar: translationMap.c2Grammar,
      reading: translationMap.c2Reading
    }
  };
}

const levelContentByLanguage = {
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
  },
  italian: createGeneratedLevelContent('Italian', {
    listeningTitle: 'Ascolto',
    speakingTitle: 'Parlato',
    writingTitle: 'Scrittura',
    a1Listening: ['Buongiorno, io sono...', 'Alle otto vado a...', 'Vicino a casa c e...'],
    a1Speaking: ['Mi chiamo...', 'Vorrei ordinare...', 'Ogni mattina io...'],
    a1Writing: ['Ciao, mi presento...', 'La mia famiglia...', 'Oggi devo...'],
    a1Vocab: [['Ciao', 'Hello'], ['Casa', 'House'], ['Famiglia', 'Family'], ['Colazione', 'Breakfast'], ['Amico', 'Friend'], ['Scuola', 'School']],
    a1Grammar: [['A1', 'Articoli, presente di essere/avere e frasi affermative.'], ['Base', 'Plurali regolari, aggettivi comuni e domande semplici.']],
    a1Reading: { title: 'Lettura A1', text: 'Luca vive a Torino. La mattina prende l autobus, saluta i vicini e beve un caffe prima del lavoro.', questions: ['Dove vive Luca?', 'Cosa beve la mattina?', 'Chi saluta?'] },
    a2Listening: ['Cerco il supermercato...', 'Domani il tempo sara...', 'Questo fine settimana noi...'],
    a2Speaking: ['Di solito faccio...', 'La settimana prossima...', 'Preferisco andare...'],
    a2Writing: ['Ti invito a...', 'Il mio quartiere...', 'Ieri pomeriggio...'],
    a2Vocab: [['Quartiere', 'Neighborhood'], ['Biglietto', 'Ticket'], ['Mercato', 'Market'], ['Passeggiata', 'Walk'], ['Meteo', 'Weather'], ['Salute', 'Health']],
    a2Grammar: [['A2', 'Passato prossimo, futuro vicino e comparativi.'], ['Uso', 'Pronomi diretti semplici e preposizioni di luogo.']],
    a2Reading: { title: 'Lettura A2', text: 'Giulia prepara una cena semplice per i suoi amici. Compra pane, verdure e frutta al mercato e poi scrive un messaggio con l indirizzo.', questions: ['Per chi prepara la cena Giulia?', 'Cosa compra al mercato?', 'Che cosa scrive dopo?'] },
    b1Listening: ['Secondo me...', 'Quando ho viaggiato...', 'Penso che sia utile...'],
    b1Speaking: ['La ragione principale...', 'Preferirei scegliere...', 'Ho imparato che...'],
    b1Writing: ['Prima di tutto...', 'Un altro aspetto...', 'Per concludere...'],
    b1Vocab: [['Esperienza', 'Experience'], ['Scelta', 'Choice'], ['Viaggio', 'Trip'], ['Lavoro', 'Work'], ['Obiettivo', 'Goal'], ['Migliorare', 'Improve']],
    b1Grammar: [['B1', 'Imperfetto, condizionale semplice e connettori frequenti.'], ['Sviluppo', 'Discorso indiretto base e futuro semplice.']],
    b1Reading: { title: 'Lettura B1', text: 'Marta ha cambiato ufficio e sta imparando a organizzare progetti con un nuovo team. Ogni sera controlla le priorita del giorno seguente.', questions: ['Che cosa ha cambiato Marta?', 'Con chi organizza i progetti?', 'Quando controlla le priorita?'] },
    b2Listening: ['L intervistato sostiene che...', 'Il problema centrale...', 'Questo dato suggerisce...'],
    b2Speaking: ['Da una parte...', 'In confronto...', 'Bisogna considerare anche...'],
    b2Writing: ['Il tema principale...', 'Inoltre va notato che...', 'Di conseguenza...'],
    b2Vocab: [['Argomento', 'Argument'], ['Prova', 'Evidence'], ['Contesto', 'Context'], ['Mobilita', 'Mobility'], ['Cittadinanza', 'Citizenship'], ['Ricerca', 'Research']],
    b2Grammar: [['B2', 'Periodo ipotetico, passivo e subordinazione avanzata.'], ['Stile', 'Concessione, causa ed effetti in testi strutturati.']],
    b2Reading: { title: 'Lettura B2', text: 'L articolo mette a confronto due politiche urbane e mostra come i trasporti e gli spazi pubblici influenzino la qualita della vita quotidiana.', questions: ['Che cosa confronta l articolo?', 'Quali elementi influenzano la vita quotidiana?', 'Qual e il messaggio centrale?'] },
    c1Listening: ['L autore lascia intendere che...', 'Questa osservazione implica...', 'Il relatore precisa che...'],
    c1Speaking: ['Sarebbe opportuno osservare...', 'Riformulando il punto...', 'Un esempio significativo...'],
    c1Writing: ['La tesi centrale...', 'Alla luce di cio...', 'Questa prospettiva evidenzia...'],
    c1Vocab: [['Sfumatura', 'Nuance'], ['Coerenza', 'Cohesion'], ['Prospettiva', 'Perspective'], ['Argomentazione', 'Argumentation'], ['Registro', 'Register'], ['Sintesi', 'Synthesis']],
    c1Grammar: [['C1', 'Congiuntivo avanzato, nominalizzazioni e registro formale.'], ['Padronanza', 'Periodo complesso e coesione testuale raffinata.']],
    c1Reading: { title: 'Lettura C1', text: 'Un saggio culturale esplora come la lingua costruisca identita collettive e trasmetta memoria condivisa attraverso racconti e rituali.', questions: ['Che cosa esplora il saggio?', 'Che cosa trasmette la lingua?', 'Qual e il tema principale?'] },
    c2Listening: ['Il sottinteso principale...', 'La differenza cruciale...', 'In prospettiva piu ampia...'],
    c2Speaking: ['Per essere piu precisi...', 'L elemento decisivo...', 'Occorre distinguere fra...'],
    c2Writing: ['Conviene tuttavia notare...', 'Una lettura piu sottile...', 'In definitiva...'],
    c2Vocab: [['Sottinteso', 'Subtext'], ['Precisione', 'Precision'], ['Ambivalenza', 'Ambivalence'], ['Eloquenza', 'Eloquence'], ['Rigore', 'Rigor'], ['Interdisciplinare', 'Interdisciplinary']],
    c2Grammar: [['C2', 'Padronanza dei registri, periodi lunghi e ritmo argomentativo.'], ['Eccellenza', 'Riformulazione fine, ironia e controllo stilistico.']],
    c2Reading: { title: 'Lettura C2', text: 'Il brano finale intreccia memoria, politica e rappresentazione pubblica, chiedendo al lettore di interpretare piu livelli di intenzione.', questions: ['Quali temi intreccia il brano?', 'Che cosa deve fare il lettore?', 'Qual e il livello richiesto?'] }
  }),
  german: createGeneratedLevelContent('German', {
    listeningTitle: 'Hören',
    speakingTitle: 'Sprechen',
    writingTitle: 'Schreiben',
    a1Listening: ['Guten Morgen, ich heiße...', 'Um acht Uhr fahre ich...', 'Neben dem Haus ist...'],
    a1Speaking: ['Ich komme aus...', 'Ich möchte gern...', 'Jeden Morgen mache ich...'],
    a1Writing: ['Hallo, ich bin...', 'Meine Familie...', 'Heute brauche ich...'],
    a1Vocab: [['Hallo', 'Hello'], ['Haus', 'House'], ['Familie', 'Family'], ['Freund', 'Friend'], ['Schule', 'School'], ['Frühstück', 'Breakfast']],
    a1Grammar: [['A1', 'Artikel, Präsens und einfache Satzstellung.'], ['Basis', 'Fragen, Negation und häufige Adjektive.']],
    a1Reading: { title: 'Lesetext A1', text: 'Anna wohnt in Berlin. Jeden Morgen fährt sie mit dem Bus zur Schule und kauft danach Brot für ihre Familie.', questions: ['Wo wohnt Anna?', 'Womit fährt sie zur Schule?', 'Was kauft sie danach?'] },
    a2Listening: ['Ich suche den Bahnhof...', 'Morgen wird das Wetter...', 'Am Wochenende wollen wir...'],
    a2Speaking: ['Normalerweise...', 'Nächste Woche möchte ich...', 'Ich gehe lieber...'],
    a2Writing: ['Ich lade dich ein...', 'In meinem Viertel...', 'Gestern Nachmittag...'],
    a2Vocab: [['Fahrkarte', 'Ticket'], ['Markt', 'Market'], ['Nachbarschaft', 'Neighborhood'], ['Freizeit', 'Free time'], ['Gesundheit', 'Health'], ['Wetter', 'Weather']],
    a2Grammar: [['A2', 'Perfekt, Modalverben und Vergleiche.'], ['Gebrauch', 'Wechselpräpositionen und einfache Nebensätze.']],
    a2Reading: { title: 'Lesetext A2', text: 'Jonas plant ein kleines Abendessen. Er kauft Gemüse, Käse und Saft ein und schreibt seinen Freunden später die Adresse.', questions: ['Was plant Jonas?', 'Was kauft er ein?', 'Was schreibt er später?'] },
    b1Listening: ['Meiner Meinung nach...', 'Als ich gereist bin...', 'Ich glaube, dass...'],
    b1Speaking: ['Der wichtigste Grund...', 'Ich würde eher...', 'Ich habe gelernt, dass...'],
    b1Writing: ['Zuerst...', 'Ein weiterer Punkt...', 'Zum Schluss...'],
    b1Vocab: [['Erfahrung', 'Experience'], ['Wahl', 'Choice'], ['Reise', 'Trip'], ['Arbeitsplatz', 'Workplace'], ['Ziel', 'Goal'], ['Verbessern', 'Improve']],
    b1Grammar: [['B1', 'Präteritum im Kontext, Konnektoren und indirekte Rede.'], ['Ausbau', 'Futur, Konjunktiv II und strukturierte Begründungen.']],
    b1Reading: { title: 'Lesetext B1', text: 'Sofia hat eine neue Stelle begonnen und lernt, Projekte mit ihrem Team besser zu koordinieren. Jeden Abend notiert sie ihre Prioritäten.', questions: ['Was hat Sofia begonnen?', 'Mit wem koordiniert sie Projekte?', 'Was notiert sie abends?'] },
    b2Listening: ['Der Bericht zeigt, dass...', 'Der zentrale Konflikt...', 'Diese Zahlen deuten darauf hin...'],
    b2Speaking: ['Einerseits...', 'Andererseits...', 'Man sollte auch bedenken...'],
    b2Writing: ['Das Hauptthema...', 'Darüber hinaus...', 'Daraus ergibt sich...'],
    b2Vocab: [['Beleg', 'Evidence'], ['Zusammenhang', 'Context'], ['Stadtentwicklung', 'Urban development'], ['Forschung', 'Research'], ['Öffentlichkeit', 'Public sphere'], ['Abwägung', 'Trade-off']],
    b2Grammar: [['B2', 'Passiv, Konjunktiv I/II und komplexe Nebensätze.'], ['Stil', 'Konzession, Ursache und Wirkung in formellen Texten.']],
    b2Reading: { title: 'Lesetext B2', text: 'Der Artikel vergleicht zwei Modelle des Stadtverkehrs und erklärt, wie politische Entscheidungen den Alltag der Bewohnerinnen und Bewohner prägen.', questions: ['Was vergleicht der Artikel?', 'Welche Entscheidungen prägen den Alltag?', 'Was ist die Kernaussage?'] },
    c1Listening: ['Die Referentin deutet an, dass...', 'Diese Bemerkung lässt erkennen...', 'Der entscheidende Unterschied...'],
    c1Speaking: ['Es wäre sinnvoll zu betonen...', 'Anders formuliert...', 'Ein aufschlussreiches Beispiel...'],
    c1Writing: ['Die zentrale These...', 'Vor diesem Hintergrund...', 'Diese Perspektive macht deutlich...'],
    c1Vocab: [['Nuance', 'Nuance'], ['Kohärenz', 'Cohesion'], ['Standpunkt', 'Point of view'], ['Argumentation', 'Argumentation'], ['Register', 'Register'], ['Vermittlung', 'Mediation']],
    c1Grammar: [['C1', 'Nominalstil, gehobene Konnektoren und präzise Modalisierung.'], ['Beherrschung', 'Registerwechsel und komplexe Satzarchitektur.']],
    c1Reading: { title: 'Lesetext C1', text: 'Ein Essay untersucht, wie Sprache kollektive Identitäten formt und kulturelles Gedächtnis über Generationen hinweg weiterträgt.', questions: ['Was untersucht der Essay?', 'Was trägt Sprache weiter?', 'Worum geht es insgesamt?'] },
    c2Listening: ['Die implizite Haltung...', 'Die feinste Unterscheidung...', 'Im größeren Zusammenhang...'],
    c2Speaking: ['Um es genauer zu sagen...', 'Entscheidend erscheint mir...', 'Man muss differenzieren zwischen...'],
    c2Writing: ['Gleichwohl ist zu beachten...', 'Eine subtilere Lesart...', 'Abschließend lässt sich sagen...'],
    c2Vocab: [['Implikation', 'Implication'], ['Feinabstimmung', 'Fine tuning'], ['Mehrdeutigkeit', 'Ambiguity'], ['Eloquenz', 'Eloquence'], ['Schärfe', 'Sharpness'], ['Synthese', 'Synthesis']],
    c2Grammar: [['C2', 'Feinsteuerung von Stil, Ton und argumentativer Dichte.'], ['Exzellenz', 'Ironie, Umformung und präzise rhetorische Kontrolle.']],
    c2Reading: { title: 'Lesetext C2', text: 'Der Schlussabschnitt verbindet Erinnerung, Macht und öffentliche Darstellung und fordert vom Leser, mehrere Bedeutungsebenen zugleich mitzudenken.', questions: ['Welche Bereiche verbindet der Abschnitt?', 'Was wird vom Leser gefordert?', 'Welches Niveau ist nötig?'] }
  })
};

module.exports = {
  LEVELS,
  SKILLS,
  TOPICS_BY_LEVEL,
  TOPIC_LOCALIZATION,
  LANGUAGE_META,
  levelContentByLanguage,
  normalizeLanguage
};
