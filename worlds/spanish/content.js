// worlds/spanish/content.js
// Mundo de español: contenido completo A1–C2 para las 6 habilidades.
(function () {
  window.ANDERGO_LANGUAGE_WORLDS = window.ANDERGO_LANGUAGE_WORLDS || { levelContent: {}, languageContent: {}, lessons: {} };

  window.ANDERGO_LANGUAGE_WORLDS.levelContent.spanish = {
    A1: {
      skills: {
        listening: { title: 'Listening', text: 'Diálogos breves de la vida cotidiana con pausas claras y frases simples.', suggestions: ['Voy a la...', 'Ella tiene que...', 'Nos vemos en...'] },
        speaking: { title: 'Speaking', text: 'Práctica oral sencilla con frases útiles para conversaciones diarias.', suggestions: ['Me gustaría...', '¿Puedes ayudarme con...', 'Estoy buscando un...'] },
        writing: { title: 'Writing', text: 'Pequeñas redacciones guiadas con frases de inicio.', suggestions: ['Estimado/a...', 'En mi opinión...', 'El fin de semana pasado...'] }
      },
      vocab: [['Hola', 'Hello'], ['Familia', 'Family'], ['Mañana', 'Morning'], ['Viajar', 'Travel'], ['Ayuda', 'Help'], ['Amigo', 'Friend']],
      grammar: [['A1', 'Presente, artículos y pronombres básicos.'], ['A2', 'Pasado simple y adverbios de frecuencia.']],
      reading: {
        title: 'Ejemplo de lectura A1',
        text: 'Sara visita un museo pequeño en su ciudad cada sábado. Lee las etiquetas y escucha al guía. Le gusta escribir una nota corta sobre su objeto favorito.',
        questions: [
          { q: 'What does Sara do at the museum?', options: ['She cooks', 'She reads the labels', 'She buys books', 'She plays music'], answer: 1 },
          { q: 'How often does she visit?', options: ['Every day', 'Every Saturday', 'Once a year', 'Never'], answer: 1 },
          { q: 'What does she write?', options: ['A shopping list', 'A note about her favorite object', 'A letter', 'A recipe'], answer: 1 }
        ]
      }
    },
    A2: {
      skills: {
        listening: { title: 'Listening', text: 'Práctica de escucha con vocabulario común y estructuras breves.', suggestions: ['Suelo despertarme a las...', 'El tiempo está...', 'Necesitamos comprar...'] },
        speaking: { title: 'Speaking', text: 'Conversaciones básicas para hablar de rutinas y planes.', suggestions: ['Normalmente...', 'La semana que viene quiero...', 'Es importante...'] },
        writing: { title: 'Writing', text: 'Mensajes cortos y descripciones personales.', suggestions: ['El fin de semana pasado...', 'Mi lugar favorito es...', 'Me gusta...'] }
      },
      vocab: [['Ciudad', 'City'], ['Museo', 'Museum'], ['Guía', 'Guide'], ['Nota', 'Note'], ['Favorito', 'Favorite'], ['Visita', 'Visit']],
      grammar: [['A2', 'Presente continuo y comparaciones simples.'], ['B1', 'Conectores básicos para párrafos cortos.']],
      reading: {
        title: 'Ejemplo de lectura A2',
        text: 'Tom va al parque todas las mañanas. Ve los árboles, oye a los pájaros y toma café antes de clase.',
        questions: [
          { q: 'Where does Tom go every morning?', options: ['To the beach', 'To the park', 'To the museum', 'To the gym'], answer: 1 },
          { q: 'What does he hear?', options: ['Music', 'The birds', 'Traffic', 'Rain'], answer: 1 },
          { q: 'What does he drink?', options: ['Tea', 'Juice', 'Coffee', 'Water'], answer: 2 }
        ]
      }
    },
    B1: {
      skills: {
        listening: { title: 'Listening', text: 'Conversaciones claras con opiniones, preferencias y situaciones realistas.', suggestions: ['Creo que...', 'Parece que...', '¿Qué piensas sobre...?'] },
        speaking: { title: 'Speaking', text: 'Práctica oral para dar opiniones y explicar decisiones.', suggestions: ['En mi opinión...', 'Una razón es...', 'Prefiero...'] },
        writing: { title: 'Writing', text: 'Escritura de párrafos con organización y detalles de apoyo.', suggestions: ['En primer lugar...', 'Otro punto es...', 'Por ejemplo...'] }
      },
      vocab: [['Opinión', 'Opinion'], ['Preferencia', 'Preference'], ['Razón', 'Reason'], ['Experiencia', 'Experience'], ['Discutir', 'Discuss'], ['Mejorar', 'Improve']],
      grammar: [['B1', 'Pretérito perfecto, modales y formas de futuro.'], ['B2', 'Condicionales y estilo indirecto.']],
      reading: {
        title: 'Ejemplo de lectura B1',
        text: 'Maya empezó un trabajo nuevo y está aprendiendo a organizar su semana. Escribe prioridades y revisa su calendario cada tarde.',
        questions: [
          { q: 'What did Maya start recently?', options: ['A trip', 'A new job', 'A class', 'A business'], answer: 1 },
          { q: 'What does she write down?', options: ['Letters', 'Her priorities', 'Poems', 'Recipes'], answer: 1 },
          { q: 'When does she check her calendar?', options: ['In the morning', 'At noon', 'Every evening', 'On Sundays'], answer: 2 }
        ]
      }
    },
    B2: {
      skills: {
        listening: { title: 'Listening', text: 'Audios más largos con matices, opiniones y explicaciones detalladas.', suggestions: ['Es probable que...', 'El punto principal es...', 'Según el hablante...'] },
        speaking: { title: 'Speaking', text: 'Tareas orales extensas con argumentación y comparaciones.', suggestions: ['Por un lado...', 'Por otro lado...', 'Dicho esto...'] },
        writing: { title: 'Writing', text: 'Ensayos y respuestas estructuradas con mejor cohesión.', suggestions: ['Para empezar...', 'En contraste...', 'Como resultado...'] }
      },
      vocab: [['Argumento', 'Argument'], ['Evidencia', 'Evidence'], ['Contexto', 'Context'], ['Complejo', 'Complex'], ['Preciso', 'Precise'], ['Debate', 'Debate']],
      grammar: [['B2', 'Oraciones condicionales y voz pasiva.'], ['C1', 'Conectores avanzados y estilo.']],
      reading: {
        title: 'Ejemplo de lectura B2',
        text: 'El artículo compara dos ciudades y explica cómo el transporte público, la vivienda y la vida social afectan a los residentes de maneras muy distintas.',
        questions: [
          { q: 'What does the article compare?', options: ['Two countries', 'Two cities', 'Two decades', 'Two languages'], answer: 1 },
          { q: 'Which three areas are mentioned?', options: ['Food, climate, sport', 'Transport, housing, social life', 'Music, art, history', 'Politics, economy, science'], answer: 1 },
          { q: 'How are the cities described?', options: ['Identical', 'Very different', 'Without residents', 'Abandoned'], answer: 1 }
        ]
      }
    },
    C1: {
      skills: {
        listening: { title: 'Listening', text: 'Habla rápida y natural con varios interlocutores y temas abstractos.', suggestions: ['El hablante sugiere que...', 'Una idea clave es...', 'Esto apunta a que...'] },
        speaking: { title: 'Speaking', text: 'Práctica oral de alto nivel para discusión y debate.', suggestions: ['Desde mi punto de vista...', 'Se podría argumentar que...', 'Un ejemplo contundente es...'] },
        writing: { title: 'Writing', text: 'Composición avanzada con estructura cuidada y control retórico.', suggestions: ['La afirmación central es...', 'A la luz de esto...', 'Para apoyar este punto...'] }
      },
      vocab: [['Matiz', 'Nuance'], ['Abstracto', 'Abstract'], ['Retórica', 'Rhetoric'], ['Precisión', 'Precision'], ['Coherencia', 'Cohesion'], ['Argumentación', 'Argumentation']],
      grammar: [['C1', 'Voz pasiva avanzada y subjuntivo.'], ['C2', 'Registro, estilo y cohesión fina.']],
      reading: {
        title: 'Ejemplo de lectura C1',
        text: 'Un ensayo cultural explora cómo el lenguaje moldea la identidad y explica por qué las comunidades preservan tradiciones a través de relatos y rituales compartidos.',
        questions: [
          { q: 'What does the essay explore?', options: ['Global economy', 'How language shapes identity', 'Military history', 'Modern technology'], answer: 1 },
          { q: 'How do communities preserve traditions?', options: ['With laws', 'With shared stories and rituals', 'With taxes', 'With borders'], answer: 1 },
          { q: 'What is the main theme?', options: ['Sport', 'Cultural identity', 'Agriculture', 'Weather'], answer: 1 }
        ]
      }
    },
    C2: {
      skills: {
        listening: { title: 'Listening', text: 'Audio denso y auténtico con significado sutil, lenguaje idiomático y ritmo rápido.', suggestions: ['El mensaje implícito es...', 'El hablante contrasta...', 'Este punto es especialmente relevante porque...'] },
        speaking: { title: 'Speaking', text: 'Práctica de habla casi nativa para una comunicación matizada y profesional.', suggestions: ['Para expresarlo con más precisión...', 'Lo que más destaca es...', 'En un contexto más amplio...'] },
        writing: { title: 'Writing', text: 'Escritura sofisticada con estilo, encuadre y precisión.', suggestions: ['Teniendo esto en cuenta...', 'Un enfoque más matizado sería...', 'En conclusión...'] }
      },
      vocab: [['Matizado', 'Nuanced'], ['Registro', 'Register'], ['Inferencia', 'Inference'], ['Transmitir', 'Convey'], ['Sutil', 'Subtle'], ['Precisión', 'Precision']],
      grammar: [['C2', 'Gramática fina, cohesión y estilo formal.'], ['Maestría', 'Near-native fluency and control.']],
      reading: {
        title: 'Ejemplo de lectura C2',
        text: 'El texto final examina la intersección entre política, identidad e historia, exigiendo al lector inferir significados en varias capas de argumento.',
        questions: [
          { q: 'What does the final text examine?', options: ['Recipes', 'The intersection of policy, identity and history', 'A technical manual', 'A travel itinerary'], answer: 1 },
          { q: 'What is asked of the reader?', options: ['Memorize dates', 'Infer meaning across several layers', 'Translate word for word', 'Summarize in one line'], answer: 1 },
          { q: 'What is the focus of the argument?', options: ['Superficial', 'Deep and nuanced', 'Comedic', 'Promotional'], answer: 1 }
        ]
      }
    }
  };

  window.ANDERGO_LANGUAGE_WORLDS.lessons.spanish = [
  {
    "slug": "saludos-a1",
    "level": "A1",
    "skill": "listening",
    "title": "Saludos y presentaciones",
    "isFree": true,
    "xpReward": 20,
    "description": "Aprende a saludar y presentarte en español.",
    "intro": "Escucha saludos cortos y relaciónalos con la situación correcta.",
    "vocabulary": [
      {
        "word": "Hola",
        "translation": "Hello",
        "example": "Hola, me llamo Ana."
      },
      {
        "word": "Mucho gusto",
        "translation": "Nice to meet you",
        "example": "Mucho gusto, David."
      },
      {
        "word": "Buenos días",
        "translation": "Good morning",
        "example": "¡Buenos días! ¿Cómo estás?"
      }
    ],
    "dialogue": [
      {
        "speaker": "Ana",
        "line": "¡Hola! Me llamo Ana.",
        "translation": "Hello! My name is Ana."
      },
      {
        "speaker": "Leo",
        "line": "Mucho gusto, Ana. Soy Leo.",
        "translation": "Nice to meet you, Ana. I am Leo."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "What does \"Mucho gusto\" mean?",
        "options": [
          "Goodbye",
          "Nice to meet you",
          "Thank you"
        ],
        "answer": 1
      },
      {
        "type": "mcq",
        "prompt": "What does \"Buenos días\" mean?",
        "options": [
          "Good night",
          "Good morning",
          "Good afternoon"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "rutina-diaria-a1",
    "level": "A1",
    "skill": "speaking",
    "title": "Mi rutina diaria",
    "isFree": true,
    "xpReward": 20,
    "description": "Habla de tu día usando el presente.",
    "intro": "Practica contar lo que haces cada día, paso a paso.",
    "vocabulary": [
      {
        "word": "Despertar",
        "translation": "Wake up",
        "example": "Me despierto a las siete."
      },
      {
        "word": "Desayuno",
        "translation": "Breakfast",
        "example": "Como el desayuno en casa."
      },
      {
        "word": "Trabajo",
        "translation": "Work",
        "example": "Voy al trabajo en autobús."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "¿A qué hora te despiertas?",
        "translation": "What time do you wake up?"
      },
      {
        "speaker": "Estudiante",
        "line": "Me despierto a las siete.",
        "translation": "I wake up at seven."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "How do you say \"breakfast\"?",
        "options": [
          "Cena",
          "Desayuno",
          "Almuerzo"
        ],
        "answer": 1
      },
      {
        "type": "speaking",
        "prompt": "Di en voz alta toda tu rutina matutina.",
        "answer": "Open answer"
      }
    ]
  },
  {
    "slug": "mi-familia-a1",
    "level": "A1",
    "skill": "writing",
    "title": "Mi familia",
    "isFree": true,
    "xpReward": 20,
    "description": "Escribe frases cortas describiendo a tu familia.",
    "intro": "Usa frases simples para presentar a tu familia.",
    "vocabulary": [
      {
        "word": "Madre",
        "translation": "Mother",
        "example": "Mi madre es profesora."
      },
      {
        "word": "Hermano",
        "translation": "Brother",
        "example": "Tengo un hermano."
      },
      {
        "word": "Familia",
        "translation": "Family",
        "example": "Mi familia es pequeña."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "Cuéntame de tu familia.",
        "translation": "Tell me about your family."
      },
      {
        "speaker": "Estudiante",
        "line": "Tengo una madre y un hermano.",
        "translation": "I have a mother and a brother."
      }
    ],
    "exercises": [
      {
        "type": "writing",
        "prompt": "Escribe 3 frases sobre tu familia.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "How do you say \"brother\"?",
        "options": [
          "Sister",
          "Brother",
          "Friend"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "planes-fin-semana-a2",
    "level": "A2",
    "skill": "speaking",
    "title": "Planes de fin de semana",
    "isFree": true,
    "xpReward": 25,
    "description": "Habla de planes futuros usando \"ir a\".",
    "intro": "Practica describir lo que vas a hacer este fin de semana.",
    "vocabulary": [
      {
        "word": "Plan",
        "translation": "Plan",
        "example": "Tengo un plan para el sábado."
      },
      {
        "word": "Viaje",
        "translation": "Trip",
        "example": "Vamos a hacer un viaje."
      },
      {
        "word": "Descansar",
        "translation": "Rest",
        "example": "Quiero descansar este fin de semana."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "¿Qué vas a hacer este fin de semana?",
        "translation": "What are you going to do this weekend?"
      },
      {
        "speaker": "Estudiante",
        "line": "Voy a visitar a mis padres.",
        "translation": "I'm going to visit my parents."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "Completa: Yo ___ a viajar.",
        "options": [
          "voy",
          "va",
          "vas"
        ],
        "answer": 0
      },
      {
        "type": "speaking",
        "prompt": "Describe tu plan de fin de semana en 3 frases.",
        "answer": "Open answer"
      }
    ]
  },
  {
    "slug": "entrevista-trabajo-b1",
    "level": "B1",
    "skill": "speaking",
    "title": "Entrevista de trabajo",
    "isFree": false,
    "xpReward": 30,
    "description": "Responde preguntas comunes de entrevista con confianza.",
    "intro": "Practica hablar sobre tu experiencia y tus fortalezas.",
    "vocabulary": [
      {
        "word": "Fortaleza",
        "translation": "Strength",
        "example": "Mi fortaleza es el trabajo en equipo."
      },
      {
        "word": "Experiencia",
        "translation": "Experience",
        "example": "Tengo tres años de experiencia."
      },
      {
        "word": "Meta",
        "translation": "Goal",
        "example": "Mi meta es crecer profesionalmente."
      }
    ],
    "dialogue": [
      {
        "speaker": "Entrevistador",
        "line": "Cuéntame sobre tu experiencia.",
        "translation": "Tell me about your experience."
      },
      {
        "speaker": "Candidato",
        "line": "He trabajado en atención al cliente por dos años.",
        "translation": "I have worked in customer service for two years."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "What does \"fortaleza\" mean here?",
        "options": [
          "Weakness",
          "Strength",
          "Salary"
        ],
        "answer": 1
      },
      {
        "type": "writing",
        "prompt": "Escribe una respuesta corta a \"¿Por qué deberíamos contratarte?\"",
        "answer": "Open answer"
      }
    ]
  },
  {
    "slug": "comparacion-ciudades-b2",
    "level": "B2",
    "skill": "writing",
    "title": "Comparando ciudades",
    "isFree": false,
    "xpReward": 35,
    "description": "Escribe un ensayo de comparación estructurado.",
    "intro": "Practica comparar dos lugares con conectores claros.",
    "vocabulary": [
      {
        "word": "Mientras que",
        "translation": "Whereas",
        "example": "La ciudad A es tranquila, mientras que la B es agitada."
      },
      {
        "word": "En cambio",
        "translation": "In contrast",
        "example": "En cambio, la vivienda es más barata aquí."
      },
      {
        "word": "En general",
        "translation": "Overall",
        "example": "En general, ambas ciudades tienen buen transporte."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "¿Cómo compararías estas dos ciudades?",
        "translation": "How would you compare these two cities?"
      },
      {
        "speaker": "Estudiante",
        "line": "Una es más accesible, mientras que la otra tiene mejor transporte.",
        "translation": "One is more affordable, whereas the other has better transport."
      }
    ],
    "exercises": [
      {
        "type": "writing",
        "prompt": "Escribe una comparación de 5 frases entre dos ciudades que conozcas.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "Which connector is used to contrast?",
        "options": [
          "También",
          "Mientras que",
          "Luego"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "debate-abstracto-c1",
    "level": "C1",
    "skill": "speaking",
    "title": "Debate estructurado",
    "isFree": false,
    "xpReward": 40,
    "description": "Argumenta una postura con evidencia de apoyo.",
    "intro": "Practica construir un argumento con estructura clara.",
    "vocabulary": [
      {
        "word": "Convincente",
        "translation": "Compelling",
        "example": "Ese es un argumento convincente."
      },
      {
        "word": "Contraargumento",
        "translation": "Counterpoint",
        "example": "Un contraargumento sería..."
      },
      {
        "word": "Premisa",
        "translation": "Premise",
        "example": "La premisa de esta idea es errónea."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "¿Cuál es tu postura sobre este tema?",
        "translation": "What is your position on this issue?"
      },
      {
        "speaker": "Estudiante",
        "line": "Yo argumentaría que la evidencia respalda una conclusión diferente.",
        "translation": "I would argue that the evidence supports a different conclusion."
      }
    ],
    "exercises": [
      {
        "type": "speaking",
        "prompt": "Defiende una postura en 45 segundos usando al menos un contraargumento.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "What is a \"contraargumento\"?",
        "options": [
          "An example",
          "A counterpoint",
          "A question"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "escritura-matizada-c2",
    "level": "C2",
    "skill": "writing",
    "title": "Argumentación matizada",
    "isFree": false,
    "xpReward": 45,
    "description": "Escribe con precisión, registro y control retórico.",
    "intro": "Perfecciona el tono y la cohesión en un texto formal breve.",
    "vocabulary": [
      {
        "word": "No obstante",
        "translation": "Notwithstanding",
        "example": "No obstante los riesgos, el plan siguió adelante."
      },
      {
        "word": "Corolario",
        "translation": "Corollary",
        "example": "Un corolario de esta política es..."
      },
      {
        "word": "Perceptible",
        "translation": "Discernible",
        "example": "El efecto apenas era perceptible."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "¿Cómo formularías este argumento de manera más formal?",
        "translation": "How would you frame this argument more formally?"
      },
      {
        "speaker": "Estudiante",
        "line": "No obstante las críticas, la política logró su objetivo.",
        "translation": "Notwithstanding the criticism, the policy achieved its aim."
      }
    ],
    "exercises": [
      {
        "type": "writing",
        "prompt": "Reescribe una frase casual en un registro formal.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "What does \"no obstante\" mean?",
        "options": [
          "Therefore",
          "Notwithstanding",
          "Furthermore"
        ],
        "answer": 1
      }
    ]
  }
];
})();
