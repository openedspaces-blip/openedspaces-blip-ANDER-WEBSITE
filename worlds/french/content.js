// worlds/french/content.js
// Mundo de francés: contenido completo A1–C2 para las 6 habilidades.
// Nota: se corrigieron acentos faltantes respecto a la versión anterior.
(function () {
  window.ANDERGO_LANGUAGE_WORLDS = window.ANDERGO_LANGUAGE_WORLDS || { levelContent: {}, languageContent: {}, lessons: {} };

  window.ANDERGO_LANGUAGE_WORLDS.levelContent.french = {
    A1: {
      skills: {
        listening: { title: 'Écoute', text: 'Dialogues très courts avec salutations, noms et phrases de classe.', suggestions: ["Bonjour, je m'appelle...", "J'habite à...", 'Je voudrais...'] },
        speaking: { title: 'Expression orale', text: 'Réponses simples pour se présenter et poser des questions de base.', suggestions: ['Je suis...', "J'aime...", "Comment tu t'appelles ?"] },
        writing: { title: 'Écriture', text: 'Petits messages guidés : présentation, famille et routine quotidienne.', suggestions: ['Bonjour, je...', 'Ma famille est...', 'Le matin, je...'] }
      },
      vocab: [['Bonjour', 'Hola'], ['Merci', 'Gracias'], ['Maison', 'Casa'], ['Famille', 'Familia'], ['École', 'Escuela'], ['Ami', 'Amigo']],
      grammar: [['A1', 'Articles définis/indéfinis, présent de être/avoir, genre et pluriel.'], ['Base', "Pronoms sujets, négation simple et questions avec est-ce que."]],
      reading: {
        title: 'Lecture A1',
        text: 'Léa habite à Lyon. Elle aime le café, la musique et les livres courts. Le matin, elle va à l\u2019école avec son ami Marc.',
        questions: [
          { q: '¿Dónde vive Léa?', options: ['París', 'Lyon', 'Marsella', 'Niza'], answer: 1 },
          { q: '¿Qué le gusta?', options: ['El deporte', 'El café, la música y los libros', 'La televisión', 'Los coches'], answer: 1 },
          { q: '¿Con quién va a la escuela?', options: ['Sola', 'Con Marc', 'Con su madre', 'Con su hermana'], answer: 1 }
        ]
      }
    },
    A2: {
      skills: {
        listening: { title: 'Écoute', text: 'Audios sur les achats, les directions, les horaires et les activités du week-end.', suggestions: ['Je cherche la...', 'Le train part à...', 'Ce week-end, nous...'] },
        speaking: { title: 'Expression orale', text: 'Dialogues pratiques pour commander, demander un chemin et parler de projets.', suggestions: ['Je voudrais acheter...', 'Pour aller à...', 'Samedi, je vais...'] },
        writing: { title: 'Écriture', text: 'Messages courts, invitations et descriptions simples avec connecteurs de base.', suggestions: ['Salut, tu veux...', "D'abord...", 'Après le travail...'] }
      },
      vocab: [['Quartier', 'Barrio'], ['Billet', 'Boleto'], ['Magasin', 'Tienda'], ['Fromage', 'Queso'], ["Aujourd'hui", 'Hoy'], ['Demain', 'Mañana']],
      grammar: [['A2', 'Passé composé, futur proche, adjectifs, prépositions de lieu.'], ['Usage', 'Impératif poli, pronoms compléments simples et comparatifs.']],
      reading: {
        title: 'Lecture A2',
        text: 'Camille prépare un dîner simple. Elle achète du pain, du fromage et des légumes. Après le repas, ses amis regardent un film court.',
        questions: [
          { q: '¿Qué prepara Camille?', options: ['Una fiesta', 'Una cena sencilla', 'Un viaje', 'Una boda'], answer: 1 },
          { q: '¿Qué compra?', options: ['Ropa', 'Pan, queso y verduras', 'Libros', 'Juguetes'], answer: 1 },
          { q: '¿Qué hacen sus amigos después de comer?', options: ['Bailan', 'Ven una película corta', 'Duermen', 'Cocinan'], answer: 1 }
        ]
      }
    },
    B1: {
      skills: {
        listening: { title: 'Écoute', text: 'Conversations claires avec opinions, récits au passé et situations de voyage.', suggestions: ['À mon avis...', "Quand j'étais...", 'Je pense que...'] },
        speaking: { title: 'Expression orale', text: 'Pratique pour raconter une expérience, expliquer un choix et donner son opinion.', suggestions: ['Je préfère...', 'La raison principale est...', "J'ai remarqué que..."] },
        writing: { title: 'Écriture', text: 'Paragraphes structurés avec introduction, exemples et conclusion courte.', suggestions: ["Tout d'abord...", 'Par exemple...', 'Pour conclure...'] }
      },
      vocab: [['Avis', 'Opinión'], ['Choix', 'Elección'], ['Souvenir', 'Recuerdo'], ['Travail', 'Trabajo'], ['Voyage', 'Viaje'], ['Objectif', 'Meta']],
      grammar: [['B1', 'Imparfait vs passé composé, pronoms y/en, futur simple.'], ['Discours', 'Connecteurs, conditionnel présent et discours indirect simple.']],
      reading: {
        title: 'Lecture B1',
        text: 'Nadia a changé de ville pour son travail. Au début, elle était nerveuse, mais elle a trouvé un club de lecture et de nouveaux amis.',
        questions: [
          { q: '¿Por qué cambió Nadia de ciudad?', options: ['Por vacaciones', 'Por su trabajo', 'Por estudios', 'Por su familia'], answer: 1 },
          { q: '¿Cómo se sentía al principio?', options: ['Feliz', 'Nerviosa', 'Aburrida', 'Enojada'], answer: 1 },
          { q: '¿Qué encontró?', options: ['Un trabajo nuevo', 'Un club de lectura y nuevos amigos', 'Un apartamento', 'Una mascota'], answer: 1 }
        ]
      }
    },
    B2: {
      skills: {
        listening: { title: 'Écoute', text: 'Entretiens et reportages avec arguments, nuances et détails importants.', suggestions: ["Selon l'intervenant...", 'Le problème principal...', 'Cela montre que...'] },
        speaking: { title: 'Expression orale', text: 'Débats, comparaisons et prises de position sur des sujets sociaux ou professionnels.', suggestions: ["D'une part...", 'En revanche...', 'Il faut tenir compte de...'] },
        writing: { title: 'Écriture', text: 'Essais courts, courriels formels et synthèses avec cohésion claire.', suggestions: ['Le sujet soulève...', 'Il convient de...', 'En conséquence...'] }
      },
      vocab: [['Enjeu', 'Desafío'], ['Preuve', 'Evidencia'], ['Nuance', 'Matiz'], ['Logement', 'Vivienda'], ['Transports', 'Transporte'], ['Développer', 'Desarrollar']],
      grammar: [['B2', 'Subjonctif, passif, conditionnels, participe présent.'], ['Style', 'Hypothèse, concession, cause/conséquence et registre formel.']],
      reading: {
        title: 'Lecture B2',
        text: "L'article compare deux modèles de transport urbain et explique comment les choix publics influencent la qualité de vie des habitants.",
        questions: [
          { q: '¿Qué compara el artículo?', options: ['Dos países', 'Dos modelos de transporte urbano', 'Dos décadas', 'Dos idiomas'], answer: 1 },
          { q: '¿Qué influye en la calidad de vida?', options: ['El clima', 'Las decisiones públicas', 'La música', 'El deporte'], answer: 1 },
          { q: '¿Cuál es el tema principal?', options: ['La cocina', 'El transporte urbano', 'La moda', 'El cine'], answer: 1 }
        ]
      }
    },
    C1: {
      skills: {
        listening: { title: 'Écoute', text: 'Conférences, podcasts rapides et discussions abstraites avec implicite culturel.', suggestions: ["L'idée sous-jacente...", 'Le locuteur nuance...', 'Cette remarque implique que...'] },
        speaking: { title: 'Expression orale', text: 'Argumentation avancée, reformulation et présentation professionnelle.', suggestions: ['Il serait pertinent de...', 'Autrement dit...', 'Un exemple parlant serait...'] },
        writing: { title: 'Écriture', text: 'Textes argumentatifs avancés avec ton, registre et progression logique.', suggestions: ['La thèse centrale...', 'Il ressort de cela que...', 'Cette perspective mérite...'] }
      },
      vocab: [['Implicite', 'Implícito'], ['Portée', 'Alcance'], ['Nuancer', 'Matizar'], ['Cohérence', 'Coherencia'], ['Registre', 'Registro'], ['Démarche', 'Enfoque']],
      grammar: [['C1', 'Subjonctif avancé, inversion, tournures impersonnelles.'], ['Maîtrise', 'Articulateurs complexes, nominalisation et style académique.']],
      reading: {
        title: 'Lecture C1',
        text: "Un essai analyse la manière dont la langue construit l'identité collective et transmet la mémoire culturelle entre générations.",
        questions: [
          { q: '¿Qué construye el lenguaje según el ensayo?', options: ['La economía', 'La identidad colectiva', 'La geografía', 'La tecnología'], answer: 1 },
          { q: '¿Qué transmite entre generaciones?', options: ['Recetas', 'La memoria cultural', 'Mapas', 'Leyes'], answer: 1 },
          { q: '¿Qué tipo de texto es?', options: ['Una receta', 'Un ensayo', 'Un anuncio', 'Un poema'], answer: 1 }
        ]
      }
    },
    C2: {
      skills: {
        listening: { title: 'Écoute', text: 'Audio authentique dense avec ironie, sous-entendus, références culturelles et rythme naturel.', suggestions: ['Le sous-entendu est...', 'La nuance décisive...', 'Cette formulation suggère...'] },
        speaking: { title: 'Expression orale', text: 'Expression quasi native pour débattre, négocier et présenter avec précision.', suggestions: ['Pour être plus précis...', 'Ce qui me paraît essentiel...', 'Dans une perspective plus large...'] },
        writing: { title: 'Écriture', text: 'Production experte : style, concision, argumentation fine et adaptation au public.', suggestions: ['Il convient toutefois de...', 'Une lecture plus subtile...', 'En définitive...'] }
      },
      vocab: [['Sous-entendu', 'Sobreentendido'], ['Raffiné', 'Refinado'], ['Exigence', 'Exigencia'], ['Équivoque', 'Ambigüedad'], ['Éloquence', 'Elocuencia'], ['Synthèse', 'Síntesis']],
      grammar: [['C2', 'Maîtrise fine des registres, temps littéraires et cohésion.'], ['Expertise', 'Reformulation, précision stylistique et argumentation nuancée.']],
      reading: {
        title: 'Lecture C2',
        text: 'Le passage examine les tensions entre mémoire, pouvoir et récit public, obligeant le lecteur à inférer plusieurs niveaux d\u2019intention.',
        questions: [
          { q: '¿Qué tensiones examina el pasaje?', options: ['Deporte y ocio', 'Memoria, poder y relato público', 'Clima y turismo', 'Moda y arte'], answer: 1 },
          { q: '¿Qué debe inferir el lector?', options: ['Fechas exactas', 'Varios niveles de intención', 'Una traducción literal', 'Un resumen breve'], answer: 1 },
          { q: '¿Qué nivel se espera del lector?', options: ['Principiante', 'Avanzado / casi nativo', 'Ninguno en particular', 'Solo oral'], answer: 1 }
        ]
      }
    }
  };

  window.ANDERGO_LANGUAGE_WORLDS.lessons.french = [
  {
    "slug": "salutations-a1",
    "level": "A1",
    "skill": "listening",
    "title": "Salutations et présentations",
    "isFree": true,
    "xpReward": 20,
    "description": "Apprends à saluer et à te présenter en français.",
    "intro": "Écoute de courts dialogues et associe-les à la bonne situation.",
    "vocabulary": [
      {
        "word": "Bonjour",
        "translation": "Hola",
        "example": "Bonjour, je m’appelle Anna."
      },
      {
        "word": "Enchanté(e)",
        "translation": "Mucho gusto",
        "example": "Enchanté, je m’appelle Léo."
      },
      {
        "word": "Bonne journée",
        "translation": "Buen día",
        "example": "Merci, bonne journée à toi aussi !"
      }
    ],
    "dialogue": [
      {
        "speaker": "Anna",
        "line": "Bonjour ! Je m’appelle Anna.",
        "translation": "Hola, me llamo Anna."
      },
      {
        "speaker": "Léo",
        "line": "Enchanté, Anna. Je suis Léo.",
        "translation": "Mucho gusto, Anna. Soy Léo."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "¿Qué significa \"Enchanté(e)\"?",
        "options": [
          "Adiós",
          "Mucho gusto",
          "Gracias"
        ],
        "answer": 1
      },
      {
        "type": "mcq",
        "prompt": "¿Qué significa \"Bonne journée\"?",
        "options": [
          "Buenas noches",
          "Buen día",
          "Buenas tardes"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "routine-quotidienne-a1",
    "level": "A1",
    "skill": "speaking",
    "title": "Ma routine quotidienne",
    "isFree": true,
    "xpReward": 20,
    "description": "Parle de ta journée avec le présent.",
    "intro": "Décris ta routine du matin, étape par étape.",
    "vocabulary": [
      {
        "word": "Se réveiller",
        "translation": "Despertar",
        "example": "Je me réveille à sept heures."
      },
      {
        "word": "Petit-déjeuner",
        "translation": "Desayuno",
        "example": "Je prends mon petit-déjeuner à la maison."
      },
      {
        "word": "Travail",
        "translation": "Trabajo",
        "example": "Je vais au travail en bus."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tuteur",
        "line": "À quelle heure te réveilles-tu ?",
        "translation": "¿A qué hora te despiertas?"
      },
      {
        "speaker": "Étudiant",
        "line": "Je me réveille à sept heures.",
        "translation": "Me despierto a las siete."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "¿Cómo se dice \"desayuno\"?",
        "options": [
          "Dîner",
          "Petit-déjeuner",
          "Déjeuner"
        ],
        "answer": 1
      },
      {
        "type": "speaking",
        "prompt": "Décris ta routine du matin à voix haute.",
        "answer": "Open answer"
      }
    ]
  },
  {
    "slug": "ma-famille-a1",
    "level": "A1",
    "skill": "writing",
    "title": "Ma famille",
    "isFree": true,
    "xpReward": 20,
    "description": "Écris de courtes phrases pour décrire ta famille.",
    "intro": "Utilise des phrases simples pour présenter ta famille.",
    "vocabulary": [
      {
        "word": "Mère",
        "translation": "Madre",
        "example": "Ma mère est professeure."
      },
      {
        "word": "Frère",
        "translation": "Hermano",
        "example": "J'ai un frère."
      },
      {
        "word": "Famille",
        "translation": "Familia",
        "example": "Ma famille est petite."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tuteur",
        "line": "Parle-moi de ta famille.",
        "translation": "Cuéntame de tu familia."
      },
      {
        "speaker": "Étudiant",
        "line": "J'ai une mère et un frère.",
        "translation": "Tengo una madre y un hermano."
      }
    ],
    "exercises": [
      {
        "type": "writing",
        "prompt": "Écris 3 phrases sur ta famille.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "¿Cómo se dice \"hermano\"?",
        "options": [
          "Sœur",
          "Frère",
          "Ami"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "projets-weekend-a2",
    "level": "A2",
    "skill": "speaking",
    "title": "Projets du week-end",
    "isFree": true,
    "xpReward": 25,
    "description": "Parle de projets futurs avec le futur proche.",
    "intro": "Décris ce que tu vas faire ce week-end.",
    "vocabulary": [
      {
        "word": "Projet",
        "translation": "Plan",
        "example": "J'ai un projet pour samedi."
      },
      {
        "word": "Voyage",
        "translation": "Viaje",
        "example": "Nous allons faire un voyage."
      },
      {
        "word": "Se reposer",
        "translation": "Descansar",
        "example": "Je veux me reposer ce week-end."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tuteur",
        "line": "Que vas-tu faire ce week-end ?",
        "translation": "¿Qué vas a hacer este fin de semana?"
      },
      {
        "speaker": "Étudiant",
        "line": "Je vais rendre visite à mes parents.",
        "translation": "Voy a visitar a mis padres."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "Complète : Je ___ voyager.",
        "options": [
          "vais",
          "va",
          "vas"
        ],
        "answer": 0
      },
      {
        "type": "speaking",
        "prompt": "Décris ton projet du week-end en 3 phrases.",
        "answer": "Open answer"
      }
    ]
  },
  {
    "slug": "entretien-embauche-b1",
    "level": "B1",
    "skill": "speaking",
    "title": "Entretien d'embauche",
    "isFree": false,
    "xpReward": 30,
    "description": "Réponds à des questions d'entretien courantes avec assurance.",
    "intro": "Entraîne-toi à parler de ton expérience et de tes qualités.",
    "vocabulary": [
      {
        "word": "Qualité",
        "translation": "Fortaleza",
        "example": "Ma qualité principale est le travail en équipe."
      },
      {
        "word": "Expérience",
        "translation": "Experiencia",
        "example": "J'ai trois ans d'expérience."
      },
      {
        "word": "Objectif",
        "translation": "Meta",
        "example": "Mon objectif est de progresser."
      }
    ],
    "dialogue": [
      {
        "speaker": "Recruteur",
        "line": "Parlez-moi de votre expérience.",
        "translation": "Cuéntame sobre tu experiencia."
      },
      {
        "speaker": "Candidat",
        "line": "J'ai travaillé dans le service client pendant deux ans.",
        "translation": "He trabajado en atención al cliente por dos años."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "¿Qué significa \"qualité\" en este contexto?",
        "options": [
          "Debilidad",
          "Fortaleza",
          "Salario"
        ],
        "answer": 1
      },
      {
        "type": "writing",
        "prompt": "Écris une courte réponse à \"Pourquoi devrions-nous vous embaucher ?\"",
        "answer": "Open answer"
      }
    ]
  },
  {
    "slug": "comparaison-villes-b2",
    "level": "B2",
    "skill": "writing",
    "title": "Comparer deux villes",
    "isFree": false,
    "xpReward": 35,
    "description": "Rédige un essai de comparaison structuré.",
    "intro": "Entraîne-toi à comparer deux lieux avec des connecteurs clairs.",
    "vocabulary": [
      {
        "word": "Alors que",
        "translation": "Mientras que",
        "example": "La ville A est calme, alors que la ville B est animée."
      },
      {
        "word": "En revanche",
        "translation": "En cambio",
        "example": "En revanche, le logement est moins cher ici."
      },
      {
        "word": "Dans l’ensemble",
        "translation": "En general",
        "example": "Dans l'ensemble, les deux villes ont de bons transports."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tuteur",
        "line": "Comment compareriez-vous ces deux villes ?",
        "translation": "¿Cómo compararías estas dos ciudades?"
      },
      {
        "speaker": "Étudiant",
        "line": "L'une est plus abordable, alors que l'autre a de meilleurs transports.",
        "translation": "Una es más accesible, mientras que la otra tiene mejor transporte."
      }
    ],
    "exercises": [
      {
        "type": "writing",
        "prompt": "Écris une comparaison de 5 phrases entre deux villes que tu connais.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "Quel connecteur sert à contraster ?",
        "options": [
          "Aussi",
          "Alors que",
          "Ensuite"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "debat-abstrait-c1",
    "level": "C1",
    "skill": "speaking",
    "title": "Débat structuré",
    "isFree": false,
    "xpReward": 40,
    "description": "Défends une position avec des preuves à l’appui.",
    "intro": "Entraîne-toi à construire un argument avec une structure claire.",
    "vocabulary": [
      {
        "word": "Convaincant",
        "translation": "Convincente",
        "example": "C’est un argument convaincant."
      },
      {
        "word": "Contre-argument",
        "translation": "Contraargumento",
        "example": "Un contre-argument serait..."
      },
      {
        "word": "Prémisse",
        "translation": "Premisa",
        "example": "La prémisse de cette idée est erronée."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tuteur",
        "line": "Quelle est votre position sur ce sujet ?",
        "translation": "¿Cuál es tu postura sobre este tema?"
      },
      {
        "speaker": "Étudiant",
        "line": "Je dirais que les preuves soutiennent une conclusion différente.",
        "translation": "Yo argumentaría que la evidencia respalda una conclusión diferente."
      }
    ],
    "exercises": [
      {
        "type": "speaking",
        "prompt": "Défendez une position pendant 45 secondes en utilisant au moins un contre-argument.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "Qu’est-ce qu’un \"contre-argument\" ?",
        "options": [
          "Un exemple",
          "Un contre-argument",
          "Une question"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "ecriture-nuancee-c2",
    "level": "C2",
    "skill": "writing",
    "title": "Argumentation nuancée",
    "isFree": false,
    "xpReward": 45,
    "description": "Écris avec précision, registre et contrôle rhétorique.",
    "intro": "Affine le ton et la cohésion dans un court texte formel.",
    "vocabulary": [
      {
        "word": "Néanmoins",
        "translation": "No obstante",
        "example": "Néanmoins les risques, le plan a continué."
      },
      {
        "word": "Corollaire",
        "translation": "Corolario",
        "example": "Un corollaire de cette politique est..."
      },
      {
        "word": "Perceptible",
        "translation": "Perceptible",
        "example": "L'effet était à peine perceptible."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tuteur",
        "line": "Comment formuleriez-vous cet argument plus formellement ?",
        "translation": "¿Cómo formularías este argumento de manera más formal?"
      },
      {
        "speaker": "Étudiant",
        "line": "Néanmoins les critiques, la politique a atteint son objectif.",
        "translation": "No obstante las críticas, la política logró su objetivo."
      }
    ],
    "exercises": [
      {
        "type": "writing",
        "prompt": "Réécris une phrase familière dans un registre formel.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "¿Qué significa \"néanmoins\"?",
        "options": [
          "Por lo tanto",
          "No obstante",
          "Además"
        ],
        "answer": 1
      }
    ]
  }
];
})();
