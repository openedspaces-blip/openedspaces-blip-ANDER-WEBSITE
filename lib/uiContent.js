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
    nav: ['Languages', 'Achievements', 'Skills', 'Goals', 'Pricing', 'Downloads', 'App'],
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
    nav: ['Idiomas', 'Logros', 'Habilidades', 'Metas', 'Precio', 'Descargas', 'App'],
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
    nav: ['Langues', 'Réussites', 'Compétences', 'Objectifs', 'Tarifs', 'Téléchargements', 'App'],
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
    nav: ['Lingue', 'Traguardi', 'Competenze', 'Obiettivi', 'Prezzi', 'Download', 'App'],
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
    nav: ['Sprachen', 'Erfolge', 'Fähigkeiten', 'Ziele', 'Preise', 'Downloads', 'App'],
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
    nav: ['Idiomas', 'Logros', 'Habilidades', 'Metas', 'Precio', 'Descargas', 'App'],
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

module.exports = { levelContent, languageContent };
