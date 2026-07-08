// worlds/english/content.js
// Mundo de inglés: contenido completo A1–C2 para las 6 habilidades.
// Se fusiona en tiempo de carga con levelContent/languageContent vía window.ANDERGO_LANGUAGE_WORLDS.
(function () {
  window.ANDERGO_LANGUAGE_WORLDS = window.ANDERGO_LANGUAGE_WORLDS || { levelContent: {}, languageContent: {} };

  window.ANDERGO_LANGUAGE_WORLDS.levelContent.english = {
    A1: {
      skills: {
        listening: { title: 'Listening', text: 'Short real-life dialogues with clear pauses and simple word chunks.', suggestions: ['She is going to...', 'At the station, the train...', 'We will meet at...'] },
        speaking: { title: 'Speaking', text: 'Simple speaking drills with useful prompts for everyday conversations.', suggestions: ['I would like to...', 'Could you tell me...', 'Let me introduce...'] },
        writing: { title: 'Writing', text: 'Very short writing prompts with guided sentence starters.', suggestions: ['A good email starts with...', 'In the next paragraph, describe...', "Don't forget to add details about..."] }
      },
      vocab: [['Hello', 'Hola'], ['Family', 'Familia'], ['Morning', 'Mañana'], ['Travel', 'Viajar'], ['Help', 'Ayuda'], ['Friend', 'Amigo']],
      grammar: [['A1', 'Present simple, articles and basic pronouns.'], ['A2', 'Past simple and common frequency adverbs.']],
      reading: {
        title: 'Example reading A1',
        text: 'Sara visits a small museum in her city every Saturday. She reads the labels and listens to the guide. She likes to write a short note about her favorite object.',
        questions: [
          { q: '¿Qué hace Sara en el museo?', options: ['Cocina', 'Lee las etiquetas', 'Compra libros', 'Toca música'], answer: 1 },
          { q: '¿Cada cuánto visita el museo?', options: ['Cada día', 'Cada sábado', 'Una vez al año', 'Nunca'], answer: 1 },
          { q: '¿Qué escribe Sara?', options: ['Una lista de compras', 'Una nota sobre su objeto favorito', 'Una carta', 'Una receta'], answer: 1 }
        ]
      }
    },
    A2: {
      skills: {
        listening: { title: 'Listening', text: 'Basic listening practice with common vocabulary and short sentence patterns.', suggestions: ['I usually wake up at...', 'The weather is...', 'We need to buy...'] },
        speaking: { title: 'Speaking', text: 'Everyday conversations with helpful phrases for routines and plans.', suggestions: ['I usually...', 'Next week I want to...', 'It is important to...'] },
        writing: { title: 'Writing', text: 'Short personal messages and simple descriptions.', suggestions: ['Last weekend I...', 'My favorite place is...', 'I enjoy...'] }
      },
      vocab: [['City', 'Ciudad'], ['Museum', 'Museo'], ['Guide', 'Guía'], ['Note', 'Nota'], ['Favorite', 'Favorito'], ['Visit', 'Visita']],
      grammar: [['A2', 'Present continuous and simple comparisons.'], ['B1', 'Basic connectors for short paragraphs.']],
      reading: {
        title: 'Example reading A2',
        text: 'Tom goes to the park every morning. He sees the trees, hears the birds and drinks coffee before class.',
        questions: [
          { q: '¿A dónde va Tom cada mañana?', options: ['A la playa', 'Al parque', 'Al museo', 'Al gimnasio'], answer: 1 },
          { q: '¿Qué escucha Tom?', options: ['Música', 'A los pájaros', 'El tráfico', 'La lluvia'], answer: 1 },
          { q: '¿Qué bebe antes de clase?', options: ['Té', 'Jugo', 'Café', 'Agua'], answer: 2 }
        ]
      }
    },
    B1: {
      skills: {
        listening: { title: 'Listening', text: 'Clear conversations with opinions, preferences and realistic situations.', suggestions: ['I believe that...', 'It seems like...', 'What do you think about...'] },
        speaking: { title: 'Speaking', text: 'Speaking practice for giving opinions and explaining choices.', suggestions: ['In my opinion...', 'One reason is...', 'I would rather...'] },
        writing: { title: 'Writing', text: 'Paragraph writing with clear organization and supporting details.', suggestions: ['First of all...', 'Another point is...', 'For example...'] }
      },
      vocab: [['Opinion', 'Opinión'], ['Preference', 'Preferencia'], ['Reason', 'Razón'], ['Experience', 'Experiencia'], ['Discuss', 'Discutir'], ['Improve', 'Mejorar']],
      grammar: [['B1', 'Present perfect, modals and future forms.'], ['B2', 'Conditionals and reported speech.']],
      reading: {
        title: 'Example reading B1',
        text: 'Maya recently started a new job and is learning how to organize her week. She writes down priorities and checks her calendar every evening.',
        questions: [
          { q: '¿Qué empezó Maya recientemente?', options: ['Un viaje', 'Un trabajo nuevo', 'Una clase', 'Un negocio'], answer: 1 },
          { q: '¿Qué escribe cada semana?', options: ['Cartas', 'Sus prioridades', 'Poemas', 'Recetas'], answer: 1 },
          { q: '¿Cuándo revisa su calendario?', options: ['En la mañana', 'Al mediodía', 'Cada noche', 'Los domingos'], answer: 2 }
        ]
      }
    },
    B2: {
      skills: {
        listening: { title: 'Listening', text: 'Longer audio with nuance, opinions and detailed explanations.', suggestions: ['It is likely that...', 'The main point is...', 'According to the speaker...'] },
        speaking: { title: 'Speaking', text: 'Extended speaking tasks with argumentation and comparisons.', suggestions: ['On the one hand...', 'On the other hand...', 'That said...'] },
        writing: { title: 'Writing', text: 'Essays and structured responses with stronger cohesion.', suggestions: ['To begin with...', 'In contrast...', 'As a result...'] }
      },
      vocab: [['Argument', 'Argumento'], ['Evidence', 'Evidencia'], ['Context', 'Contexto'], ['Complex', 'Complejo'], ['Precise', 'Preciso'], ['Debate', 'Debate']],
      grammar: [['B2', 'Conditional sentences and passive voice.'], ['C1', 'Advanced connectors and style.']],
      reading: {
        title: 'Example reading B2',
        text: 'The article compares two cities and explains how public transport, housing and social life affect residents in very different ways.',
        questions: [
          { q: '¿Qué compara el artículo?', options: ['Dos países', 'Dos ciudades', 'Dos décadas', 'Dos idiomas'], answer: 1 },
          { q: '¿Qué tres áreas se mencionan?', options: ['Comida, clima y deporte', 'Transporte, vivienda y vida social', 'Música, arte e historia', 'Política, economía y ciencia'], answer: 1 },
          { q: '¿Cómo se describen las ciudades?', options: ['Idénticas', 'Muy diferentes', 'Sin residentes', 'Abandonadas'], answer: 1 }
        ]
      }
    },
    C1: {
      skills: {
        listening: { title: 'Listening', text: 'Fast and natural speech with multiple speakers and abstract topics.', suggestions: ['The speaker implies that...', 'A key idea is...', 'This suggests that...'] },
        speaking: { title: 'Speaking', text: 'High-level speaking practice for discussion and debate.', suggestions: ['From my perspective...', 'It could be argued that...', 'A compelling example is...'] },
        writing: { title: 'Writing', text: 'Advanced composition with careful structure and rhetorical control.', suggestions: ['The central claim is...', 'In light of this...', 'To support this point...'] }
      },
      vocab: [['Nuance', 'Matiz'], ['Abstract', 'Abstracto'], ['Rhetoric', 'Retórica'], ['Precision', 'Precisión'], ['Cohesion', 'Coherencia'], ['Argumentation', 'Argumentación']],
      grammar: [['C1', 'Advanced passive voice and subjunctive structures.'], ['C2', 'Register, style and fine-grained cohesion.']],
      reading: {
        title: 'Example reading C1',
        text: 'A cultural essay explores how language shapes identity and explains why communities preserve traditions through storytelling and shared rituals.',
        questions: [
          { q: '¿Qué explora el ensayo?', options: ['La economía global', 'Cómo el idioma da forma a la identidad', 'La historia militar', 'La tecnología moderna'], answer: 1 },
          { q: '¿Cómo preservan las tradiciones las comunidades?', options: ['Con leyes', 'Con relatos y rituales compartidos', 'Con impuestos', 'Con fronteras'], answer: 1 },
          { q: '¿Cuál es el tema principal?', options: ['El deporte', 'La identidad cultural', 'La agricultura', 'El clima'], answer: 1 }
        ]
      }
    },
    C2: {
      skills: {
        listening: { title: 'Listening', text: 'Dense, authentic audio with subtle meaning, idiomatic language and rapid delivery.', suggestions: ['The underlying message is...', 'The speaker contrasts...', 'This point is especially relevant because...'] },
        speaking: { title: 'Speaking', text: 'Near-native speech practice for nuanced and professional communication.', suggestions: ['To put it more precisely...', 'What stands out most is...', 'In a broader context...'] },
        writing: { title: 'Writing', text: 'Sophisticated writing with style, framing and precision.', suggestions: ['With this in mind...', 'A more nuanced approach would be...', 'In conclusion...'] }
      },
      vocab: [['Nuanced', 'Matizado'], ['Register', 'Registro'], ['Inference', 'Inferencia'], ['Convey', 'Transmitir'], ['Subtle', 'Sutil'], ['Precision', 'Precisión']],
      grammar: [['C2', 'Fine-grained grammar, cohesion and formal style.'], ['Mastery', 'Near-native fluency and control.']],
      reading: {
        title: 'Example reading C2',
        text: 'The final passage examines the intersection of policy, identity and history, requiring the reader to infer meaning across several layers of argument.',
        questions: [
          { q: '¿Qué examina el pasaje?', options: ['Recetas de cocina', 'La intersección de política, identidad e historia', 'Un manual técnico', 'Un itinerario de viaje'], answer: 1 },
          { q: '¿Qué se le pide al lector?', options: ['Memorizar fechas', 'Inferir significado en varias capas', 'Traducir palabra por palabra', 'Resumir en una frase'], answer: 1 },
          { q: '¿Cuál es el enfoque del argumento?', options: ['Superficial', 'Profundo y con matices', 'Cómico', 'Publicitario'], answer: 1 }
        ]
      }
    }
  };

  // Lecciones completas para la ruta de aprendizaje (Learning Path), usadas como
  // respaldo local cuando el backend no está disponible o para exploración offline.
  window.ANDERGO_LANGUAGE_WORLDS.lessons = window.ANDERGO_LANGUAGE_WORLDS.lessons || {};
  window.ANDERGO_LANGUAGE_WORLDS.lessons.english = [
    {
      slug: 'greetings-a1', level: 'A1', skill: 'listening', title: 'Greetings & Introductions', isFree: true, xpReward: 20,
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
      slug: 'daily-routines-a1', level: 'A1', skill: 'speaking', title: 'Daily Routines', isFree: true, xpReward: 20,
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
      slug: 'my-family-a1', level: 'A1', skill: 'writing', title: 'My Family', isFree: true, xpReward: 20,
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
      slug: 'weekend-plans-a2', level: 'A2', skill: 'speaking', title: 'Weekend Plans', isFree: true, xpReward: 25,
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
      slug: 'job-interview-b1', level: 'B1', skill: 'speaking', title: 'Job Interview Basics', isFree: false, xpReward: 30,
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
      slug: 'city-comparison-b2', level: 'B2', skill: 'writing', title: 'Comparing Cities', isFree: false, xpReward: 35,
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
      slug: 'abstract-debate-c1', level: 'C1', skill: 'speaking', title: 'Structured Debate', isFree: false, xpReward: 40,
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
      slug: 'nuanced-writing-c2', level: 'C2', skill: 'writing', title: 'Nuanced Argumentation', isFree: false, xpReward: 45,
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
})();
