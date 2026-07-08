// lib/lessonsData.js
// Local fallback lesson content, keyed by language. Used when Supabase is not
// configured, or when the `lessons` table has no rows yet for a given
// language/level, so the learning path never renders empty in a fresh setup.
// English is the flagship (deepest) world for now; the rest will be expanded
// to the same depth in a follow-up pass.

const english = [
  {
    slug: 'greetings-a1', level: 'A1', skill: 'listening', title: 'Greetings & Introductions',
    accessTier: 'free', xpReward: 20, orderIndex: 1,
    description: 'Learn to greet people and introduce yourself.',
    intro: 'Listen to short greetings and match them with the right situation.',
    vocabulary: [
      { word: 'Hello', translation: 'Hola', example: 'Hello, my name is Ana.' },
      { word: 'Nice to meet you', translation: 'Mucho gusto', example: 'Nice to meet you, David.' },
      { word: 'Good morning', translation: 'Buenos días', example: 'Good morning! How are you?' }
    ],
    dialogue: [
      { speaker: 'Anna', line: 'Hello! My name is Anna.', translation: 'Hola, me llamo Anna.' },
      { speaker: 'Leo', line: 'Nice to meet you, Anna. I am Leo.', translation: 'Mucho gusto, Anna. Soy Leo.' }
    ],
    exercises: [
      { type: 'mcq', prompt: '¿Cómo respondes a "Nice to meet you"?', options: ['Nice to meet you too', 'Goodbye', 'I am 20'], answer: 0 },
      { type: 'mcq', prompt: '¿Qué significa "Good morning"?', options: ['Buenas noches', 'Buenos días', 'Buenas tardes'], answer: 1 }
    ]
  },
  {
    slug: 'daily-routines-a1', level: 'A1', skill: 'speaking', title: 'Daily Routines',
    accessTier: 'free', xpReward: 20, orderIndex: 2,
    description: 'Talk about your day using present simple.',
    intro: 'Practice saying what you do every day, step by step.',
    vocabulary: [
      { word: 'Wake up', translation: 'Despertar', example: 'I wake up at 7 am.' },
      { word: 'Breakfast', translation: 'Desayuno', example: 'I eat breakfast at home.' },
      { word: 'Work', translation: 'Trabajo', example: 'I go to work by bus.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'What time do you wake up?', translation: '¿A qué hora te despiertas?' },
      { speaker: 'Student', line: 'I wake up at seven.', translation: 'Me despierto a las siete.' }
    ],
    exercises: [
      { type: 'mcq', prompt: '¿Cómo se dice "desayuno"?', options: ['Dinner', 'Breakfast', 'Lunch'], answer: 1 },
      { type: 'speaking', prompt: 'Say your full morning routine out loud.', answer: 'Open answer' }
    ]
  },
  {
    slug: 'my-family-a1', level: 'A1', skill: 'writing', title: 'My Family',
    accessTier: 'free', xpReward: 20, orderIndex: 3,
    description: 'Write short sentences describing your family.',
    intro: 'Use simple sentences to introduce your family members.',
    vocabulary: [
      { word: 'Mother', translation: 'Madre', example: 'My mother is a teacher.' },
      { word: 'Brother', translation: 'Hermano', example: 'I have one brother.' },
      { word: 'Family', translation: 'Familia', example: 'My family is small.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Tell me about your family.', translation: 'Cuéntame de tu familia.' },
      { speaker: 'Student', line: 'I have a mother and a brother.', translation: 'Tengo una madre y un hermano.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Write 3 sentences about your family.', answer: 'Open answer' },
      { type: 'mcq', prompt: '¿Cómo se dice "hermano"?', options: ['Sister', 'Brother', 'Friend'], answer: 1 }
    ]
  },
  {
    slug: 'weekend-plans-a2', level: 'A2', skill: 'speaking', title: 'Weekend Plans',
    accessTier: 'free', xpReward: 25, orderIndex: 4,
    description: 'Talk about future plans using "going to".',
    intro: 'Practice describing what you are going to do this weekend.',
    vocabulary: [
      { word: 'Plan', translation: 'Plan', example: 'I have a plan for Saturday.' },
      { word: 'Trip', translation: 'Viaje', example: 'We are going on a trip.' },
      { word: 'Rest', translation: 'Descansar', example: 'I want to rest this weekend.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'What are you going to do this weekend?', translation: '¿Qué vas a hacer este fin de semana?' },
      { speaker: 'Student', line: "I'm going to visit my parents.", translation: 'Voy a visitar a mis padres.' }
    ],
    exercises: [
      { type: 'mcq', prompt: 'Completa: I ___ going to travel.', options: ['am', 'is', 'be'], answer: 0 },
      { type: 'speaking', prompt: 'Describe your weekend plan in 3 sentences.', answer: 'Open answer' }
    ]
  },
  {
    slug: 'job-interview-b1', level: 'B1', skill: 'speaking', title: 'Job Interview Basics',
    accessTier: 'premium', xpReward: 30, orderIndex: 5,
    description: 'Answer common interview questions with confidence.',
    intro: 'Practice speaking about your experience and strengths.',
    vocabulary: [
      { word: 'Strength', translation: 'Fortaleza', example: 'My strength is teamwork.' },
      { word: 'Experience', translation: 'Experiencia', example: 'I have three years of experience.' },
      { word: 'Goal', translation: 'Meta', example: 'My goal is to grow professionally.' }
    ],
    dialogue: [
      { speaker: 'Interviewer', line: 'Tell me about your experience.', translation: 'Cuéntame sobre tu experiencia.' },
      { speaker: 'Candidate', line: 'I have worked in customer service for two years.', translation: 'He trabajado en atención al cliente por dos años.' }
    ],
    exercises: [
      { type: 'mcq', prompt: '¿Qué significa "strength" en este contexto?', options: ['Debilidad', 'Fortaleza', 'Salario'], answer: 1 },
      { type: 'writing', prompt: 'Write a short answer to "Why should we hire you?"', answer: 'Open answer' }
    ]
  },
  {
    slug: 'city-comparison-b2', level: 'B2', skill: 'writing', title: 'Comparing Cities',
    accessTier: 'premium', xpReward: 35, orderIndex: 6,
    description: 'Write a structured comparison essay.',
    intro: 'Practice comparing two places with clear connectors.',
    vocabulary: [
      { word: 'Whereas', translation: 'Mientras que', example: 'City A is quiet, whereas City B is busy.' },
      { word: 'In contrast', translation: 'En contraste', example: 'In contrast, housing is cheaper here.' },
      { word: 'Overall', translation: 'En general', example: 'Overall, both cities offer good transport.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'How would you compare these two cities?', translation: '¿Cómo compararías estas dos ciudades?' },
      { speaker: 'Student', line: 'One is more affordable, whereas the other has better transport.', translation: 'Una es más accesible, mientras que la otra tiene mejor transporte.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Write a 5-sentence comparison of two cities you know.', answer: 'Open answer' },
      { type: 'mcq', prompt: '¿Cuál conector se usa para contrastar?', options: ['Also', 'Whereas', 'Then'], answer: 1 }
    ]
  },
  {
    slug: 'abstract-debate-c1', level: 'C1', skill: 'speaking', title: 'Structured Debate',
    accessTier: 'premium', xpReward: 40, orderIndex: 7,
    description: 'Argue a position with supporting evidence.',
    intro: 'Practice building an argument with clear structure.',
    vocabulary: [
      { word: 'Compelling', translation: 'Convincente', example: 'That is a compelling argument.' },
      { word: 'Counterpoint', translation: 'Contraargumento', example: 'A counterpoint would be...' },
      { word: 'Premise', translation: 'Premisa', example: 'The premise of this idea is flawed.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'What is your position on this issue?', translation: '¿Cuál es tu postura sobre este tema?' },
      { speaker: 'Student', line: 'I would argue that the evidence supports a different conclusion.', translation: 'Yo argumentaría que la evidencia respalda una conclusión diferente.' }
    ],
    exercises: [
      { type: 'speaking', prompt: 'Defend a position in 45 seconds using at least one counterpoint.', answer: 'Open answer' },
      { type: 'mcq', prompt: '¿Qué es un "counterpoint"?', options: ['Un ejemplo', 'Un contraargumento', 'Una pregunta'], answer: 1 }
    ]
  },
  {
    slug: 'nuanced-writing-c2', level: 'C2', skill: 'writing', title: 'Nuanced Argumentation',
    accessTier: 'premium', xpReward: 45, orderIndex: 8,
    description: 'Write with precision, register and rhetorical control.',
    intro: 'Refine tone and cohesion in a short formal piece.',
    vocabulary: [
      { word: 'Notwithstanding', translation: 'No obstante', example: 'Notwithstanding the risks, the plan proceeded.' },
      { word: 'Corollary', translation: 'Corolario', example: 'A corollary of this policy is...' },
      { word: 'Discernible', translation: 'Perceptible', example: 'The effect was barely discernible.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'How would you frame this argument more formally?', translation: '¿Cómo formularías este argumento de manera más formal?' },
      { speaker: 'Student', line: 'Notwithstanding the criticism, the policy achieved its aim.', translation: 'No obstante las críticas, la política logró su objetivo.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Rewrite a casual sentence in a formal register.', answer: 'Open answer' },
      { type: 'mcq', prompt: '¿Qué significa "notwithstanding"?', options: ['Por lo tanto', 'No obstante', 'Además'], answer: 1 }
    ]
  }
];

// Lighter starter sets for the other four worlds. These will be expanded to
// English's depth in the next content pass, but are real, usable lessons.
const spanish = [
  {
    slug: 'saludos-a1', level: 'A1', skill: 'listening', title: 'Saludos y presentaciones',
    accessTier: 'free', xpReward: 20, orderIndex: 1,
    description: 'Aprende a saludar y presentarte en español.',
    intro: 'Escucha saludos cortos y relaciónalos con la situación correcta.',
    vocabulary: [
      { word: 'Hola', translation: 'Hello', example: 'Hola, me llamo Ana.' },
      { word: 'Mucho gusto', translation: 'Nice to meet you', example: 'Mucho gusto, David.' },
      { word: 'Buenos días', translation: 'Good morning', example: '¡Buenos días! ¿Cómo estás?' }
    ],
    dialogue: [
      { speaker: 'Ana', line: '¡Hola! Me llamo Ana.', translation: 'Hello! My name is Ana.' },
      { speaker: 'Leo', line: 'Mucho gusto, Ana. Soy Leo.', translation: 'Nice to meet you, Ana. I am Leo.' }
    ],
    exercises: [
      { type: 'mcq', prompt: 'What does "Mucho gusto" mean?', options: ['Goodbye', 'Nice to meet you', 'Thank you'], answer: 1 },
      { type: 'mcq', prompt: 'What does "Buenos días" mean?', options: ['Good night', 'Good morning', 'Good afternoon'], answer: 1 }
    ]
  },
  {
    slug: 'rutina-diaria-a1', level: 'A1', skill: 'speaking', title: 'Mi rutina diaria',
    accessTier: 'free', xpReward: 20, orderIndex: 2,
    description: 'Habla de tu día usando el presente.',
    intro: 'Practica contar lo que haces cada día, paso a paso.',
    vocabulary: [
      { word: 'Despertar', translation: 'Wake up', example: 'Me despierto a las siete.' },
      { word: 'Desayuno', translation: 'Breakfast', example: 'Como el desayuno en casa.' },
      { word: 'Trabajo', translation: 'Work', example: 'Voy al trabajo en autobús.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: '¿A qué hora te despiertas?', translation: 'What time do you wake up?' },
      { speaker: 'Estudiante', line: 'Me despierto a las siete.', translation: 'I wake up at seven.' }
    ],
    exercises: [
      { type: 'mcq', prompt: 'How do you say "breakfast"?', options: ['Cena', 'Desayuno', 'Almuerzo'], answer: 1 },
      { type: 'speaking', prompt: 'Di en voz alta toda tu rutina matutina.', answer: 'Open answer' }
    ]
  },
  {
    slug: 'mi-familia-a1', level: 'A1', skill: 'writing', title: 'Mi familia',
    accessTier: 'free', xpReward: 20, orderIndex: 3,
    description: 'Escribe frases cortas describiendo a tu familia.',
    intro: 'Usa frases simples para presentar a tu familia.',
    vocabulary: [
      { word: 'Madre', translation: 'Mother', example: 'Mi madre es profesora.' },
      { word: 'Hermano', translation: 'Brother', example: 'Tengo un hermano.' },
      { word: 'Familia', translation: 'Family', example: 'Mi familia es pequeña.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Cuéntame de tu familia.', translation: 'Tell me about your family.' },
      { speaker: 'Estudiante', line: 'Tengo una madre y un hermano.', translation: 'I have a mother and a brother.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Escribe 3 frases sobre tu familia.', answer: 'Open answer' },
      { type: 'mcq', prompt: 'How do you say "brother"?', options: ['Sister', 'Brother', 'Friend'], answer: 1 }
    ]
  },
  {
    slug: 'planes-fin-semana-a2', level: 'A2', skill: 'speaking', title: 'Planes de fin de semana',
    accessTier: 'free', xpReward: 25, orderIndex: 4,
    description: 'Habla de planes futuros usando "ir a".',
    intro: 'Practica describir lo que vas a hacer este fin de semana.',
    vocabulary: [
      { word: 'Plan', translation: 'Plan', example: 'Tengo un plan para el sábado.' },
      { word: 'Viaje', translation: 'Trip', example: 'Vamos a hacer un viaje.' },
      { word: 'Descansar', translation: 'Rest', example: 'Quiero descansar este fin de semana.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: '¿Qué vas a hacer este fin de semana?', translation: 'What are you going to do this weekend?' },
      { speaker: 'Estudiante', line: 'Voy a visitar a mis padres.', translation: "I'm going to visit my parents." }
    ],
    exercises: [
      { type: 'mcq', prompt: 'Completa: Yo ___ a viajar.', options: ['voy', 'va', 'vas'], answer: 0 },
      { type: 'speaking', prompt: 'Describe tu plan de fin de semana en 3 frases.', answer: 'Open answer' }
    ]
  },
  {
    slug: 'entrevista-trabajo-b1', level: 'B1', skill: 'speaking', title: 'Entrevista de trabajo',
    accessTier: 'premium', xpReward: 30, orderIndex: 5,
    description: 'Responde preguntas comunes de entrevista con confianza.',
    intro: 'Practica hablar sobre tu experiencia y tus fortalezas.',
    vocabulary: [
      { word: 'Fortaleza', translation: 'Strength', example: 'Mi fortaleza es el trabajo en equipo.' },
      { word: 'Experiencia', translation: 'Experience', example: 'Tengo tres años de experiencia.' },
      { word: 'Meta', translation: 'Goal', example: 'Mi meta es crecer profesionalmente.' }
    ],
    dialogue: [
      { speaker: 'Entrevistador', line: 'Cuéntame sobre tu experiencia.', translation: 'Tell me about your experience.' },
      { speaker: 'Candidato', line: 'He trabajado en atención al cliente por dos años.', translation: 'I have worked in customer service for two years.' }
    ],
    exercises: [
      { type: 'mcq', prompt: 'What does "fortaleza" mean here?', options: ['Weakness', 'Strength', 'Salary'], answer: 1 },
      { type: 'writing', prompt: 'Escribe una respuesta corta a "¿Por qué deberíamos contratarte?"', answer: 'Open answer' }
    ]
  },
  {
    slug: 'comparacion-ciudades-b2', level: 'B2', skill: 'writing', title: 'Comparando ciudades',
    accessTier: 'premium', xpReward: 35, orderIndex: 6,
    description: 'Escribe un ensayo de comparación estructurado.',
    intro: 'Practica comparar dos lugares con conectores claros.',
    vocabulary: [
      { word: 'Mientras que', translation: 'Whereas', example: 'La ciudad A es tranquila, mientras que la B es agitada.' },
      { word: 'En cambio', translation: 'In contrast', example: 'En cambio, la vivienda es más barata aquí.' },
      { word: 'En general', translation: 'Overall', example: 'En general, ambas ciudades tienen buen transporte.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: '¿Cómo compararías estas dos ciudades?', translation: 'How would you compare these two cities?' },
      { speaker: 'Estudiante', line: 'Una es más accesible, mientras que la otra tiene mejor transporte.', translation: 'One is more affordable, whereas the other has better transport.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Escribe una comparación de 5 frases entre dos ciudades que conozcas.', answer: 'Open answer' },
      { type: 'mcq', prompt: 'Which connector is used to contrast?', options: ['También', 'Mientras que', 'Luego'], answer: 1 }
    ]
  },
  {
    slug: 'debate-abstracto-c1', level: 'C1', skill: 'speaking', title: 'Debate estructurado',
    accessTier: 'premium', xpReward: 40, orderIndex: 7,
    description: 'Argumenta una postura con evidencia de apoyo.',
    intro: 'Practica construir un argumento con estructura clara.',
    vocabulary: [
      { word: 'Convincente', translation: 'Compelling', example: 'Ese es un argumento convincente.' },
      { word: 'Contraargumento', translation: 'Counterpoint', example: 'Un contraargumento sería...' },
      { word: 'Premisa', translation: 'Premise', example: 'La premisa de esta idea es errónea.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: '¿Cuál es tu postura sobre este tema?', translation: 'What is your position on this issue?' },
      { speaker: 'Estudiante', line: 'Yo argumentaría que la evidencia respalda una conclusión diferente.', translation: 'I would argue that the evidence supports a different conclusion.' }
    ],
    exercises: [
      { type: 'speaking', prompt: 'Defiende una postura en 45 segundos usando al menos un contraargumento.', answer: 'Open answer' },
      { type: 'mcq', prompt: 'What is a "contraargumento"?', options: ['An example', 'A counterpoint', 'A question'], answer: 1 }
    ]
  },
  {
    slug: 'escritura-matizada-c2', level: 'C2', skill: 'writing', title: 'Argumentación matizada',
    accessTier: 'premium', xpReward: 45, orderIndex: 8,
    description: 'Escribe con precisión, registro y control retórico.',
    intro: 'Perfecciona el tono y la cohesión en un texto formal breve.',
    vocabulary: [
      { word: 'No obstante', translation: 'Notwithstanding', example: 'No obstante los riesgos, el plan siguió adelante.' },
      { word: 'Corolario', translation: 'Corollary', example: 'Un corolario de esta política es...' },
      { word: 'Perceptible', translation: 'Discernible', example: 'El efecto apenas era perceptible.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: '¿Cómo formularías este argumento de manera más formal?', translation: 'How would you frame this argument more formally?' },
      { speaker: 'Estudiante', line: 'No obstante las críticas, la política logró su objetivo.', translation: 'Notwithstanding the criticism, the policy achieved its aim.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Reescribe una frase casual en un registro formal.', answer: 'Open answer' },
      { type: 'mcq', prompt: 'What does "no obstante" mean?', options: ['Therefore', 'Notwithstanding', 'Furthermore'], answer: 1 }
    ]
  }
];

const french = [
  {
    slug: 'salutations-a1', level: 'A1', skill: 'listening', title: 'Salutations et présentations',
    accessTier: 'free', xpReward: 20, orderIndex: 1,
    description: 'Apprends à saluer et à te présenter en français.',
    intro: 'Écoute de courts dialogues et associe-les à la bonne situation.',
    vocabulary: [
      { word: 'Bonjour', translation: 'Hola', example: 'Bonjour, je m\u2019appelle Anna.' },
      { word: 'Enchanté(e)', translation: 'Mucho gusto', example: 'Enchanté, je m\u2019appelle Léo.' },
      { word: 'Bonne journée', translation: 'Buen día', example: 'Merci, bonne journée à toi aussi !' }
    ],
    dialogue: [
      { speaker: 'Anna', line: 'Bonjour ! Je m\u2019appelle Anna.', translation: 'Hola, me llamo Anna.' },
      { speaker: 'Léo', line: 'Enchanté, Anna. Je suis Léo.', translation: 'Mucho gusto, Anna. Soy Léo.' }
    ],
    exercises: [
      { type: 'mcq', prompt: '¿Qué significa "Enchanté(e)"?', options: ['Adiós', 'Mucho gusto', 'Gracias'], answer: 1 },
      { type: 'mcq', prompt: '¿Qué significa "Bonne journée"?', options: ['Buenas noches', 'Buen día', 'Buenas tardes'], answer: 1 }
    ]
  },
  {
    slug: 'routine-quotidienne-a1', level: 'A1', skill: 'speaking', title: 'Ma routine quotidienne',
    accessTier: 'free', xpReward: 20, orderIndex: 2,
    description: 'Parle de ta journée avec le présent.',
    intro: 'Décris ta routine du matin, étape par étape.',
    vocabulary: [
      { word: 'Se réveiller', translation: 'Despertar', example: 'Je me réveille à sept heures.' },
      { word: 'Petit-déjeuner', translation: 'Desayuno', example: 'Je prends mon petit-déjeuner à la maison.' },
      { word: 'Travail', translation: 'Trabajo', example: 'Je vais au travail en bus.' }
    ],
    dialogue: [
      { speaker: 'Tuteur', line: 'À quelle heure te réveilles-tu ?', translation: '¿A qué hora te despiertas?' },
      { speaker: 'Étudiant', line: 'Je me réveille à sept heures.', translation: 'Me despierto a las siete.' }
    ],
    exercises: [
      { type: 'mcq', prompt: '¿Cómo se dice "desayuno"?', options: ['Dîner', 'Petit-déjeuner', 'Déjeuner'], answer: 1 },
      { type: 'speaking', prompt: 'Décris ta routine du matin à voix haute.', answer: 'Open answer' }
    ]
  },
  {
    slug: 'ma-famille-a1', level: 'A1', skill: 'writing', title: 'Ma famille',
    accessTier: 'free', xpReward: 20, orderIndex: 3,
    description: 'Écris de courtes phrases pour décrire ta famille.',
    intro: 'Utilise des phrases simples pour présenter ta famille.',
    vocabulary: [
      { word: 'Mère', translation: 'Madre', example: 'Ma mère est professeure.' },
      { word: 'Frère', translation: 'Hermano', example: "J'ai un frère." },
      { word: 'Famille', translation: 'Familia', example: 'Ma famille est petite.' }
    ],
    dialogue: [
      { speaker: 'Tuteur', line: 'Parle-moi de ta famille.', translation: 'Cuéntame de tu familia.' },
      { speaker: 'Étudiant', line: "J'ai une mère et un frère.", translation: 'Tengo una madre y un hermano.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Écris 3 phrases sur ta famille.', answer: 'Open answer' },
      { type: 'mcq', prompt: '¿Cómo se dice "hermano"?', options: ['Sœur', 'Frère', 'Ami'], answer: 1 }
    ]
  },
  {
    slug: 'projets-weekend-a2', level: 'A2', skill: 'speaking', title: 'Projets du week-end',
    accessTier: 'free', xpReward: 25, orderIndex: 4,
    description: 'Parle de projets futurs avec le futur proche.',
    intro: 'Décris ce que tu vas faire ce week-end.',
    vocabulary: [
      { word: 'Projet', translation: 'Plan', example: "J'ai un projet pour samedi." },
      { word: 'Voyage', translation: 'Viaje', example: 'Nous allons faire un voyage.' },
      { word: 'Se reposer', translation: 'Descansar', example: 'Je veux me reposer ce week-end.' }
    ],
    dialogue: [
      { speaker: 'Tuteur', line: 'Que vas-tu faire ce week-end ?', translation: '¿Qué vas a hacer este fin de semana?' },
      { speaker: 'Étudiant', line: 'Je vais rendre visite à mes parents.', translation: 'Voy a visitar a mis padres.' }
    ],
    exercises: [
      { type: 'mcq', prompt: 'Complète : Je ___ voyager.', options: ['vais', 'va', 'vas'], answer: 0 },
      { type: 'speaking', prompt: 'Décris ton projet du week-end en 3 phrases.', answer: 'Open answer' }
    ]
  },
  {
    slug: 'entretien-embauche-b1', level: 'B1', skill: 'speaking', title: "Entretien d'embauche",
    accessTier: 'premium', xpReward: 30, orderIndex: 5,
    description: "Réponds à des questions d'entretien courantes avec assurance.",
    intro: 'Entraîne-toi à parler de ton expérience et de tes qualités.',
    vocabulary: [
      { word: 'Qualité', translation: 'Fortaleza', example: 'Ma qualité principale est le travail en équipe.' },
      { word: 'Expérience', translation: 'Experiencia', example: "J'ai trois ans d'expérience." },
      { word: 'Objectif', translation: 'Meta', example: 'Mon objectif est de progresser.' }
    ],
    dialogue: [
      { speaker: 'Recruteur', line: 'Parlez-moi de votre expérience.', translation: 'Cuéntame sobre tu experiencia.' },
      { speaker: 'Candidat', line: "J'ai travaillé dans le service client pendant deux ans.", translation: 'He trabajado en atención al cliente por dos años.' }
    ],
    exercises: [
      { type: 'mcq', prompt: '¿Qué significa "qualité" en este contexto?', options: ['Debilidad', 'Fortaleza', 'Salario'], answer: 1 },
      { type: 'writing', prompt: 'Écris une courte réponse à "Pourquoi devrions-nous vous embaucher ?"', answer: 'Open answer' }
    ]
  },
  {
    slug: 'comparaison-villes-b2', level: 'B2', skill: 'writing', title: 'Comparer deux villes',
    accessTier: 'premium', xpReward: 35, orderIndex: 6,
    description: 'Rédige un essai de comparaison structuré.',
    intro: 'Entraîne-toi à comparer deux lieux avec des connecteurs clairs.',
    vocabulary: [
      { word: 'Alors que', translation: 'Mientras que', example: 'La ville A est calme, alors que la ville B est animée.' },
      { word: 'En revanche', translation: 'En cambio', example: 'En revanche, le logement est moins cher ici.' },
      { word: 'Dans l\u2019ensemble', translation: 'En general', example: "Dans l'ensemble, les deux villes ont de bons transports." }
    ],
    dialogue: [
      { speaker: 'Tuteur', line: 'Comment compareriez-vous ces deux villes ?', translation: '¿Cómo compararías estas dos ciudades?' },
      { speaker: 'Étudiant', line: "L'une est plus abordable, alors que l'autre a de meilleurs transports.", translation: 'Una es más accesible, mientras que la otra tiene mejor transporte.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Écris une comparaison de 5 phrases entre deux villes que tu connais.', answer: 'Open answer' },
      { type: 'mcq', prompt: 'Quel connecteur sert à contraster ?', options: ['Aussi', 'Alors que', 'Ensuite'], answer: 1 }
    ]
  },
  {
    slug: 'debat-abstrait-c1', level: 'C1', skill: 'speaking', title: 'Débat structuré',
    accessTier: 'premium', xpReward: 40, orderIndex: 7,
    description: 'Défends une position avec des preuves à l\u2019appui.',
    intro: 'Entraîne-toi à construire un argument avec une structure claire.',
    vocabulary: [
      { word: 'Convaincant', translation: 'Convincente', example: 'C\u2019est un argument convaincant.' },
      { word: 'Contre-argument', translation: 'Contraargumento', example: 'Un contre-argument serait...' },
      { word: 'Prémisse', translation: 'Premisa', example: 'La prémisse de cette idée est erronée.' }
    ],
    dialogue: [
      { speaker: 'Tuteur', line: 'Quelle est votre position sur ce sujet ?', translation: '¿Cuál es tu postura sobre este tema?' },
      { speaker: 'Étudiant', line: "Je dirais que les preuves soutiennent une conclusion différente.", translation: 'Yo argumentaría que la evidencia respalda una conclusión diferente.' }
    ],
    exercises: [
      { type: 'speaking', prompt: 'Défendez une position pendant 45 secondes en utilisant au moins un contre-argument.', answer: 'Open answer' },
      { type: 'mcq', prompt: 'Qu\u2019est-ce qu\u2019un "contre-argument" ?', options: ['Un exemple', 'Un contre-argument', 'Une question'], answer: 1 }
    ]
  },
  {
    slug: 'ecriture-nuancee-c2', level: 'C2', skill: 'writing', title: 'Argumentation nuancée',
    accessTier: 'premium', xpReward: 45, orderIndex: 8,
    description: 'Écris avec précision, registre et contrôle rhétorique.',
    intro: 'Affine le ton et la cohésion dans un court texte formel.',
    vocabulary: [
      { word: 'Néanmoins', translation: 'No obstante', example: 'Néanmoins les risques, le plan a continué.' },
      { word: 'Corollaire', translation: 'Corolario', example: 'Un corollaire de cette politique est...' },
      { word: 'Perceptible', translation: 'Perceptible', example: "L'effet était à peine perceptible." }
    ],
    dialogue: [
      { speaker: 'Tuteur', line: 'Comment formuleriez-vous cet argument plus formellement ?', translation: '¿Cómo formularías este argumento de manera más formal?' },
      { speaker: 'Étudiant', line: 'Néanmoins les critiques, la politique a atteint son objectif.', translation: 'No obstante las críticas, la política logró su objetivo.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Réécris une phrase familière dans un registre formel.', answer: 'Open answer' },
      { type: 'mcq', prompt: '¿Qué significa "néanmoins"?', options: ['Por lo tanto', 'No obstante', 'Además'], answer: 1 }
    ]
  }
];

const italian = [
  {
    slug: 'saluti-a1', level: 'A1', skill: 'listening', title: 'Saluti e presentazioni',
    accessTier: 'free', xpReward: 20, orderIndex: 1,
    description: 'Impara a salutare e presentarti in italiano.',
    intro: 'Ascolta brevi saluti e abbinali alla situazione giusta.',
    vocabulary: [
      { word: 'Ciao', translation: 'Hola', example: 'Ciao, mi chiamo Anna.' },
      { word: 'Piacere', translation: 'Mucho gusto', example: 'Piacere, sono Leo.' },
      { word: 'Buongiorno', translation: 'Buenos días', example: 'Buongiorno! Come stai?' }
    ],
    dialogue: [
      { speaker: 'Anna', line: 'Ciao! Mi chiamo Anna.', translation: 'Hola, me llamo Anna.' },
      { speaker: 'Leo', line: 'Piacere, Anna. Sono Leo.', translation: 'Mucho gusto, Anna. Soy Leo.' }
    ],
    exercises: [
      { type: 'mcq', prompt: '¿Qué significa "Piacere"?', options: ['Adiós', 'Mucho gusto', 'Gracias'], answer: 1 },
      { type: 'mcq', prompt: '¿Qué significa "Buongiorno"?', options: ['Buenas noches', 'Buenos días', 'Buenas tardes'], answer: 1 }
    ]
  },
  {
    slug: 'routine-quotidiana-a1', level: 'A1', skill: 'speaking', title: 'La mia routine quotidiana',
    accessTier: 'free', xpReward: 20, orderIndex: 2,
    description: 'Parla della tua giornata con il presente.',
    intro: 'Descrivi la tua routine mattutina, passo dopo passo.',
    vocabulary: [
      { word: 'Svegliarsi', translation: 'Despertar', example: 'Mi sveglio alle sette.' },
      { word: 'Colazione', translation: 'Desayuno', example: 'Faccio colazione a casa.' },
      { word: 'Lavoro', translation: 'Trabajo', example: 'Vado al lavoro in autobus.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'A che ora ti svegli?', translation: '¿A qué hora te despiertas?' },
      { speaker: 'Studente', line: 'Mi sveglio alle sette.', translation: 'Me despierto a las siete.' }
    ],
    exercises: [
      { type: 'mcq', prompt: '¿Cómo se dice "desayuno"?', options: ['Cena', 'Colazione', 'Pranzo'], answer: 1 },
      { type: 'speaking', prompt: 'Descrivi ad alta voce la tua routine mattutina.', answer: 'Open answer' }
    ]
  },
  {
    slug: 'la-mia-famiglia-a1', level: 'A1', skill: 'writing', title: 'La mia famiglia',
    accessTier: 'free', xpReward: 20, orderIndex: 3,
    description: 'Scrivi brevi frasi per descrivere la tua famiglia.',
    intro: 'Usa frasi semplici per presentare la tua famiglia.',
    vocabulary: [
      { word: 'Madre', translation: 'Madre', example: 'Mia madre è insegnante.' },
      { word: 'Fratello', translation: 'Hermano', example: 'Ho un fratello.' },
      { word: 'Famiglia', translation: 'Familia', example: 'La mia famiglia è piccola.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Parlami della tua famiglia.', translation: 'Cuéntame de tu familia.' },
      { speaker: 'Studente', line: 'Ho una madre e un fratello.', translation: 'Tengo una madre y un hermano.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Scrivi 3 frasi sulla tua famiglia.', answer: 'Open answer' },
      { type: 'mcq', prompt: '¿Cómo se dice "hermano"?', options: ['Sorella', 'Fratello', 'Amico'], answer: 1 }
    ]
  },
  {
    slug: 'piani-weekend-a2', level: 'A2', skill: 'speaking', title: 'Piani per il weekend',
    accessTier: 'free', xpReward: 25, orderIndex: 4,
    description: 'Parla di progetti futuri con il futuro semplice.',
    intro: 'Descrivi cosa farai questo weekend.',
    vocabulary: [
      { word: 'Piano', translation: 'Plan', example: 'Ho un piano per sabato.' },
      { word: 'Viaggio', translation: 'Viaje', example: 'Faremo un viaggio.' },
      { word: 'Riposarsi', translation: 'Descansar', example: 'Voglio riposarmi questo weekend.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Cosa farai questo weekend?', translation: '¿Qué vas a hacer este fin de semana?' },
      { speaker: 'Studente', line: 'Andrò a trovare i miei genitori.', translation: 'Voy a visitar a mis padres.' }
    ],
    exercises: [
      { type: 'mcq', prompt: 'Completa: Io ___ a viaggiare.', options: ['vado', 'va', 'vai'], answer: 0 },
      { type: 'speaking', prompt: 'Descrivi il tuo piano per il weekend in 3 frasi.', answer: 'Open answer' }
    ]
  },
  {
    slug: 'colloquio-lavoro-b1', level: 'B1', skill: 'speaking', title: 'Colloquio di lavoro',
    accessTier: 'premium', xpReward: 30, orderIndex: 5,
    description: 'Rispondi con sicurezza alle domande comuni del colloquio.',
    intro: 'Esercitati a parlare della tua esperienza e dei tuoi punti di forza.',
    vocabulary: [
      { word: 'Punto di forza', translation: 'Fortaleza', example: 'Il mio punto di forza è il lavoro di squadra.' },
      { word: 'Esperienza', translation: 'Experiencia', example: 'Ho tre anni di esperienza.' },
      { word: 'Obiettivo', translation: 'Meta', example: 'Il mio obiettivo è crescere professionalmente.' }
    ],
    dialogue: [
      { speaker: 'Intervistatore', line: 'Parlami della tua esperienza.', translation: 'Cuéntame sobre tu experiencia.' },
      { speaker: 'Candidato', line: 'Ho lavorato nel servizio clienti per due anni.', translation: 'He trabajado en atención al cliente por dos años.' }
    ],
    exercises: [
      { type: 'mcq', prompt: '¿Qué significa "punto di forza" en este contexto?', options: ['Debilidad', 'Fortaleza', 'Salario'], answer: 1 },
      { type: 'writing', prompt: 'Scrivi una breve risposta a "Perché dovremmo assumerti?"', answer: 'Open answer' }
    ]
  },
  {
    slug: 'confronto-citta-b2', level: 'B2', skill: 'writing', title: 'Confrontare due città',
    accessTier: 'premium', xpReward: 35, orderIndex: 6,
    description: 'Scrivi un saggio di confronto strutturato.',
    intro: 'Esercitati a confrontare due luoghi con connettori chiari.',
    vocabulary: [
      { word: 'Mentre', translation: 'Mientras que', example: 'La città A è tranquilla, mentre la B è vivace.' },
      { word: 'Al contrario', translation: 'En cambio', example: 'Al contrario, gli affitti sono più economici qui.' },
      { word: 'Nel complesso', translation: 'En general', example: 'Nel complesso, entrambe le città hanno buoni trasporti.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Come confronteresti queste due città?', translation: '¿Cómo compararías estas dos ciudades?' },
      { speaker: 'Studente', line: 'Una è più economica, mentre l\u2019altra ha trasporti migliori.', translation: 'Una es más accesible, mientras que la otra tiene mejor transporte.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Scrivi un confronto di 5 frasi tra due città che conosci.', answer: 'Open answer' },
      { type: 'mcq', prompt: 'Quale connettore si usa per contrastare?', options: ['Anche', 'Mentre', 'Poi'], answer: 1 }
    ]
  },
  {
    slug: 'dibattito-astratto-c1', level: 'C1', skill: 'speaking', title: 'Dibattito strutturato',
    accessTier: 'premium', xpReward: 40, orderIndex: 7,
    description: 'Difendi una posizione con prove a sostegno.',
    intro: 'Esercitati a costruire un argomento con una struttura chiara.',
    vocabulary: [
      { word: 'Convincente', translation: 'Convincente', example: 'Questo è un argomento convincente.' },
      { word: 'Controargomento', translation: 'Contraargumento', example: 'Un controargomento sarebbe...' },
      { word: 'Premessa', translation: 'Premisa', example: 'La premessa di questa idea è errata.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Qual è la tua posizione su questo tema?', translation: '¿Cuál es tu postura sobre este tema?' },
      { speaker: 'Studente', line: 'Direi che le prove sostengono una conclusione diversa.', translation: 'Yo argumentaría que la evidencia respalda una conclusión diferente.' }
    ],
    exercises: [
      { type: 'speaking', prompt: 'Difendi una posizione per 45 secondi usando almeno un controargomento.', answer: 'Open answer' },
      { type: 'mcq', prompt: 'Cos\u2019è un "controargomento"?', options: ['Un esempio', 'Un controargomento', 'Una domanda'], answer: 1 }
    ]
  },
  {
    slug: 'scrittura-sfumata-c2', level: 'C2', skill: 'writing', title: 'Argomentazione sfumata',
    accessTier: 'premium', xpReward: 45, orderIndex: 8,
    description: 'Scrivi con precisione, registro e controllo retorico.',
    intro: 'Perfeziona il tono e la coesione in un breve testo formale.',
    vocabulary: [
      { word: 'Nondimeno', translation: 'No obstante', example: 'Nondimeno i rischi, il piano è proseguito.' },
      { word: 'Corollario', translation: 'Corolario', example: 'Un corollario di questa politica è...' },
      { word: 'Percettibile', translation: 'Perceptible', example: 'L\u2019effetto era appena percettibile.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Come formuleresti questo argomento in modo più formale?', translation: '¿Cómo formularías este argumento de manera más formal?' },
      { speaker: 'Studente', line: 'Nondimeno le critiche, la politica ha raggiunto il suo scopo.', translation: 'No obstante las críticas, la política logró su objetivo.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Riscrivi una frase informale in un registro formale.', answer: 'Open answer' },
      { type: 'mcq', prompt: '¿Qué significa "nondimeno"?', options: ['Por lo tanto', 'No obstante', 'Además'], answer: 1 }
    ]
  }
];

const german = [
  {
    slug: 'begruessungen-a1', level: 'A1', skill: 'listening', title: 'Begrüßungen und Vorstellungen',
    accessTier: 'free', xpReward: 20, orderIndex: 1,
    description: 'Lerne, wie man sich auf Deutsch begrüßt und vorstellt.',
    intro: 'Höre kurze Begrüßungen und ordne sie der richtigen Situation zu.',
    vocabulary: [
      { word: 'Hallo', translation: 'Hola', example: 'Hallo, ich heiße Anna.' },
      { word: 'Freut mich', translation: 'Mucho gusto', example: 'Freut mich, ich bin Leo.' },
      { word: 'Guten Morgen', translation: 'Buenos días', example: 'Guten Morgen! Wie geht es dir?' }
    ],
    dialogue: [
      { speaker: 'Anna', line: 'Hallo! Ich heiße Anna.', translation: 'Hola, me llamo Anna.' },
      { speaker: 'Leo', line: 'Freut mich, Anna. Ich bin Leo.', translation: 'Mucho gusto, Anna. Soy Leo.' }
    ],
    exercises: [
      { type: 'mcq', prompt: '¿Qué significa "Freut mich"?', options: ['Adiós', 'Mucho gusto', 'Gracias'], answer: 1 },
      { type: 'mcq', prompt: '¿Qué significa "Guten Morgen"?', options: ['Buenas noches', 'Buenos días', 'Buenas tardes'], answer: 1 }
    ]
  },
  {
    slug: 'tagesablauf-a1', level: 'A1', skill: 'speaking', title: 'Mein Tagesablauf',
    accessTier: 'free', xpReward: 20, orderIndex: 2,
    description: 'Sprich über deinen Tag im Präsens.',
    intro: 'Beschreibe deine Morgenroutine Schritt für Schritt.',
    vocabulary: [
      { word: 'Aufwachen', translation: 'Despertar', example: 'Ich wache um sieben Uhr auf.' },
      { word: 'Frühstück', translation: 'Desayuno', example: 'Ich esse Frühstück zu Hause.' },
      { word: 'Arbeit', translation: 'Trabajo', example: 'Ich fahre mit dem Bus zur Arbeit.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Wann wachst du auf?', translation: '¿A qué hora te despiertas?' },
      { speaker: 'Schüler', line: 'Ich wache um sieben Uhr auf.', translation: 'Me despierto a las siete.' }
    ],
    exercises: [
      { type: 'mcq', prompt: '¿Cómo se dice "desayuno"?', options: ['Abendessen', 'Frühstück', 'Mittagessen'], answer: 1 },
      { type: 'speaking', prompt: 'Beschreibe deine Morgenroutine laut.', answer: 'Open answer' }
    ]
  },
  {
    slug: 'meine-familie-a1', level: 'A1', skill: 'writing', title: 'Meine Familie',
    accessTier: 'free', xpReward: 20, orderIndex: 3,
    description: 'Schreibe kurze Sätze, um deine Familie zu beschreiben.',
    intro: 'Benutze einfache Sätze, um deine Familie vorzustellen.',
    vocabulary: [
      { word: 'Mutter', translation: 'Madre', example: 'Meine Mutter ist Lehrerin.' },
      { word: 'Bruder', translation: 'Hermano', example: 'Ich habe einen Bruder.' },
      { word: 'Familie', translation: 'Familia', example: 'Meine Familie ist klein.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Erzähl mir von deiner Familie.', translation: 'Cuéntame de tu familia.' },
      { speaker: 'Schüler', line: 'Ich habe eine Mutter und einen Bruder.', translation: 'Tengo una madre y un hermano.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Schreibe 3 Sätze über deine Familie.', answer: 'Open answer' },
      { type: 'mcq', prompt: '¿Cómo se dice "hermano"?', options: ['Schwester', 'Bruder', 'Freund'], answer: 1 }
    ]
  },
  {
    slug: 'wochenendplaene-a2', level: 'A2', skill: 'speaking', title: 'Wochenendpläne',
    accessTier: 'free', xpReward: 25, orderIndex: 4,
    description: 'Sprich über zukünftige Pläne mit dem Futur.',
    intro: 'Beschreibe, was du dieses Wochenende vorhast.',
    vocabulary: [
      { word: 'Plan', translation: 'Plan', example: 'Ich habe einen Plan für Samstag.' },
      { word: 'Reise', translation: 'Viaje', example: 'Wir machen eine Reise.' },
      { word: 'Sich ausruhen', translation: 'Descansar', example: 'Ich möchte mich dieses Wochenende ausruhen.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Was machst du dieses Wochenende?', translation: '¿Qué vas a hacer este fin de semana?' },
      { speaker: 'Schüler', line: 'Ich besuche meine Eltern.', translation: 'Voy a visitar a mis padres.' }
    ],
    exercises: [
      { type: 'mcq', prompt: 'Ergänze: Ich ___ reisen.', options: ['werde', 'wird', 'wirst'], answer: 0 },
      { type: 'speaking', prompt: 'Beschreibe deinen Wochenendplan in 3 Sätzen.', answer: 'Open answer' }
    ]
  },
  {
    slug: 'vorstellungsgespraech-b1', level: 'B1', skill: 'speaking', title: 'Vorstellungsgespräch',
    accessTier: 'premium', xpReward: 30, orderIndex: 5,
    description: 'Beantworte häufige Interviewfragen selbstbewusst.',
    intro: 'Übe, über deine Erfahrung und deine Stärken zu sprechen.',
    vocabulary: [
      { word: 'Stärke', translation: 'Fortaleza', example: 'Meine Stärke ist Teamarbeit.' },
      { word: 'Erfahrung', translation: 'Experiencia', example: 'Ich habe drei Jahre Erfahrung.' },
      { word: 'Ziel', translation: 'Meta', example: 'Mein Ziel ist es, mich beruflich weiterzuentwickeln.' }
    ],
    dialogue: [
      { speaker: 'Interviewer', line: 'Erzählen Sie mir von Ihrer Erfahrung.', translation: 'Cuéntame sobre tu experiencia.' },
      { speaker: 'Kandidat', line: 'Ich habe zwei Jahre im Kundenservice gearbeitet.', translation: 'He trabajado en atención al cliente por dos años.' }
    ],
    exercises: [
      { type: 'mcq', prompt: '¿Qué significa "Stärke" en este contexto?', options: ['Debilidad', 'Fortaleza', 'Salario'], answer: 1 },
      { type: 'writing', prompt: 'Schreibe eine kurze Antwort auf "Warum sollten wir Sie einstellen?"', answer: 'Open answer' }
    ]
  },
  {
    slug: 'staedtevergleich-b2', level: 'B2', skill: 'writing', title: 'Zwei Städte vergleichen',
    accessTier: 'premium', xpReward: 35, orderIndex: 6,
    description: 'Schreibe einen strukturierten Vergleichsaufsatz.',
    intro: 'Übe, zwei Orte mit klaren Konnektoren zu vergleichen.',
    vocabulary: [
      { word: 'Während', translation: 'Mientras que', example: 'Stadt A ist ruhig, während Stadt B belebt ist.' },
      { word: 'Im Gegensatz dazu', translation: 'En cambio', example: 'Im Gegensatz dazu ist Wohnraum hier günstiger.' },
      { word: 'Insgesamt', translation: 'En general', example: 'Insgesamt haben beide Städte gute Verkehrsmittel.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Wie würden Sie diese zwei Städte vergleichen?', translation: '¿Cómo compararías estas dos ciudades?' },
      { speaker: 'Schüler', line: 'Die eine ist günstiger, während die andere bessere Verkehrsmittel hat.', translation: 'Una es más accesible, mientras que la otra tiene mejor transporte.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Schreibe einen 5-Satz-Vergleich zwischen zwei Städten, die du kennst.', answer: 'Open answer' },
      { type: 'mcq', prompt: 'Welcher Konnektor wird zum Kontrastieren verwendet?', options: ['Auch', 'Während', 'Dann'], answer: 1 }
    ]
  },
  {
    slug: 'abstrakte-debatte-c1', level: 'C1', skill: 'speaking', title: 'Strukturierte Debatte',
    accessTier: 'premium', xpReward: 40, orderIndex: 7,
    description: 'Verteidige eine Position mit unterstützenden Beweisen.',
    intro: 'Übe, ein Argument mit klarer Struktur aufzubauen.',
    vocabulary: [
      { word: 'Überzeugend', translation: 'Convincente', example: 'Das ist ein überzeugendes Argument.' },
      { word: 'Gegenargument', translation: 'Contraargumento', example: 'Ein Gegenargument wäre...' },
      { word: 'Prämisse', translation: 'Premisa', example: 'Die Prämisse dieser Idee ist fehlerhaft.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Wie stehen Sie zu diesem Thema?', translation: '¿Cuál es tu postura sobre este tema?' },
      { speaker: 'Schüler', line: 'Ich würde argumentieren, dass die Beweise eine andere Schlussfolgerung stützen.', translation: 'Yo argumentaría que la evidencia respalda una conclusión diferente.' }
    ],
    exercises: [
      { type: 'speaking', prompt: 'Verteidigen Sie eine Position 45 Sekunden lang mit mindestens einem Gegenargument.', answer: 'Open answer' },
      { type: 'mcq', prompt: 'Was ist ein "Gegenargument"?', options: ['Ein Beispiel', 'Ein Gegenargument', 'Eine Frage'], answer: 1 }
    ]
  },
  {
    slug: 'nuancierte-schreiben-c2', level: 'C2', skill: 'writing', title: 'Nuancierte Argumentation',
    accessTier: 'premium', xpReward: 45, orderIndex: 8,
    description: 'Schreibe mit Präzision, Register und rhetorischer Kontrolle.',
    intro: 'Verfeinere Ton und Kohäsion in einem kurzen formellen Text.',
    vocabulary: [
      { word: 'Dennoch', translation: 'No obstante', example: 'Dennoch der Risiken wurde der Plan fortgesetzt.' },
      { word: 'Korollar', translation: 'Corolario', example: 'Ein Korollar dieser Politik ist...' },
      { word: 'Wahrnehmbar', translation: 'Perceptible', example: 'Der Effekt war kaum wahrnehmbar.' }
    ],
    dialogue: [
      { speaker: 'Tutor', line: 'Wie würden Sie dieses Argument formeller formulieren?', translation: '¿Cómo formularías este argumento de manera más formal?' },
      { speaker: 'Schüler', line: 'Dennoch der Kritik erreichte die Politik ihr Ziel.', translation: 'No obstante las críticas, la política logró su objetivo.' }
    ],
    exercises: [
      { type: 'writing', prompt: 'Schreibe einen lockeren Satz in einem formellen Register um.', answer: 'Open answer' },
      { type: 'mcq', prompt: '¿Qué significa "dennoch"?', options: ['Por lo tanto', 'No obstante', 'Además'], answer: 1 }
    ]
  }
];

const lessonsByLanguage = { english, spanish, french, italian, german };

function getLocalLessons(language) {
  return lessonsByLanguage[language] || [];
}

module.exports = { lessonsByLanguage, getLocalLessons };
