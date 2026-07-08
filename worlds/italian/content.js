// worlds/italian/content.js
// Mundo de italiano: contenido completo A1–C2 para las 6 habilidades.
(function () {
  window.ANDERGO_LANGUAGE_WORLDS = window.ANDERGO_LANGUAGE_WORLDS || { levelContent: {}, languageContent: {}, lessons: {} };

  window.ANDERGO_LANGUAGE_WORLDS.levelContent.italian = {
    A1: {
      skills: {
        listening: { title: 'Ascolto', text: 'Dialoghi molto brevi con saluti, nomi e frasi di base.', suggestions: ['Ciao, mi chiamo...', 'Abito a...', 'Vorrei...'] },
        speaking: { title: 'Parlato', text: 'Risposte semplici per presentarsi e fare domande di base.', suggestions: ['Io sono...', 'Mi piace...', 'Come ti chiami?'] },
        writing: { title: 'Scrittura', text: 'Brevi messaggi guidati: presentazione, famiglia e routine quotidiana.', suggestions: ['Ciao, io...', 'La mia famiglia è...', 'La mattina, io...'] }
      },
      vocab: [['Ciao', 'Hola'], ['Grazie', 'Gracias'], ['Casa', 'Casa'], ['Famiglia', 'Familia'], ['Scuola', 'Escuela'], ['Amico', 'Amigo']],
      grammar: [['A1', 'Articoli determinativi/indeterminativi, presente di essere/avere, genere e plurale.'], ['Base', 'Pronomi soggetto, negazione semplice e domande di base.']],
      reading: {
        title: 'Lettura A1',
        text: 'Lea abita a Torino. Le piace il caffè, la musica e i libri brevi. La mattina va a scuola con il suo amico Marco.',
        questions: [
          { q: '¿Dónde vive Lea?', options: ['Roma', 'Turín', 'Milán', 'Nápoles'], answer: 1 },
          { q: '¿Qué le gusta?', options: ['El deporte', 'El café, la música y los libros', 'La televisión', 'Los coches'], answer: 1 },
          { q: '¿Con quién va a la escuela?', options: ['Sola', 'Con Marco', 'Con su madre', 'Con su hermana'], answer: 1 }
        ]
      }
    },
    A2: {
      skills: {
        listening: { title: 'Ascolto', text: 'Audio su acquisti, indicazioni stradali, orari e attività del fine settimana.', suggestions: ['Sto cercando il...', 'Il treno parte alle...', 'Questo weekend, noi...'] },
        speaking: { title: 'Parlato', text: 'Dialoghi pratici per ordinare, chiedere indicazioni e parlare di progetti.', suggestions: ['Vorrei comprare...', 'Per andare a...', 'Sabato vado a...'] },
        writing: { title: 'Scrittura', text: 'Messaggi brevi, inviti e descrizioni semplici con connettori di base.', suggestions: ['Ciao, vuoi...', 'Prima di tutto...', 'Dopo il lavoro...'] }
      },
      vocab: [['Quartiere', 'Barrio'], ['Biglietto', 'Boleto'], ['Negozio', 'Tienda'], ['Formaggio', 'Queso'], ['Oggi', 'Hoy'], ['Domani', 'Mañana']],
      grammar: [['A2', 'Passato prossimo, futuro semplice, aggettivi, preposizioni di luogo.'], ['Uso', 'Imperativo cortese, pronomi complemento semplici e comparativi.']],
      reading: {
        title: 'Lettura A2',
        text: 'Marta e Luca preparano una cena semplice. Comprano pane e verdure fresche. Dopo la cena, leggono un libro sul divano.',
        questions: [
          { q: '¿Qué preparan Marta y Luca?', options: ['Una fiesta', 'Una cena sencilla', 'Un viaje', 'Una boda'], answer: 1 },
          { q: '¿Qué compran?', options: ['Ropa', 'Pan y verduras frescas', 'Libros', 'Juguetes'], answer: 1 },
          { q: '¿Qué hacen después de cenar?', options: ['Bailan', 'Leen un libro', 'Duermen', 'Cocinan'], answer: 1 }
        ]
      }
    },
    B1: {
      skills: {
        listening: { title: 'Ascolto', text: 'Conversazioni chiare con opinioni, racconti al passato e situazioni di viaggio.', suggestions: ['Secondo me...', 'Quando ero...', 'Penso che...'] },
        speaking: { title: 'Parlato', text: 'Pratica per raccontare un\u2019esperienza, spiegare una scelta e dare un\u2019opinione.', suggestions: ['Preferisco...', 'La ragione principale è...', 'Ho notato che...'] },
        writing: { title: 'Scrittura', text: 'Paragrafi strutturati con introduzione, esempi e conclusione breve.', suggestions: ['Prima di tutto...', 'Per esempio...', 'Per concludere...'] }
      },
      vocab: [['Opinione', 'Opinión'], ['Scelta', 'Elección'], ['Ricordo', 'Recuerdo'], ['Lavoro', 'Trabajo'], ['Viaggio', 'Viaje'], ['Obiettivo', 'Meta']],
      grammar: [['B1', 'Imperfetto vs passato prossimo, pronomi ci/ne, futuro semplice.'], ['Discorso', 'Connettori, condizionale presente e discorso indiretto semplice.']],
      reading: {
        title: 'Lettura B1',
        text: 'Nadia ha cambiato città per lavoro. All\u2019inizio era nervosa, ma ha trovato un club di lettura e nuovi amici.',
        questions: [
          { q: '¿Por qué cambió Nadia de ciudad?', options: ['Por vacaciones', 'Por su trabajo', 'Por estudios', 'Por su familia'], answer: 1 },
          { q: '¿Cómo se sentía al principio?', options: ['Feliz', 'Nerviosa', 'Aburrida', 'Enojada'], answer: 1 },
          { q: '¿Qué encontró?', options: ['Un trabajo nuevo', 'Un club de lectura y nuevos amigos', 'Un apartamento', 'Una mascota'], answer: 1 }
        ]
      }
    },
    B2: {
      skills: {
        listening: { title: 'Ascolto', text: 'Interviste e servizi con argomentazioni, sfumature e dettagli importanti.', suggestions: ['Secondo l\u2019intervistato...', 'Il problema principale...', 'Questo dimostra che...'] },
        speaking: { title: 'Parlato', text: 'Dibattiti, confronti e opinioni su temi sociali o professionali.', suggestions: ['Da un lato...', 'D\u2019altra parte...', 'Bisogna considerare...'] },
        writing: { title: 'Scrittura', text: 'Saggi brevi, email formali e sintesi con coesione chiara.', suggestions: ['Il tema solleva...', 'È opportuno...', 'Di conseguenza...'] }
      },
      vocab: [['Sfida', 'Desafío'], ['Prova', 'Evidencia'], ['Sfumatura', 'Matiz'], ['Alloggio', 'Vivienda'], ['Trasporti', 'Transporte'], ['Sviluppare', 'Desarrollar']],
      grammar: [['B2', 'Congiuntivo, passivo, condizionali, gerundio.'], ['Stile', 'Ipotesi, concessione, causa/effetto e registro formale.']],
      reading: {
        title: 'Lettura B2',
        text: 'L\u2019articolo confronta due modelli di trasporto urbano e spiega come le scelte pubbliche influenzano la qualità della vita degli abitanti.',
        questions: [
          { q: '¿Qué compara el artículo?', options: ['Dos países', 'Dos modelos de transporte urbano', 'Dos décadas', 'Dos idiomas'], answer: 1 },
          { q: '¿Qué influye en la calidad de vida?', options: ['El clima', 'Las decisiones públicas', 'La música', 'El deporte'], answer: 1 },
          { q: '¿Cuál es el tema principal?', options: ['La cocina', 'El transporte urbano', 'La moda', 'El cine'], answer: 1 }
        ]
      }
    },
    C1: {
      skills: {
        listening: { title: 'Ascolto', text: 'Conferenze, podcast rapidi e discussioni astratte con riferimenti culturali impliciti.', suggestions: ['L\u2019idea di fondo...', 'Il relatore sfuma...', 'Questa osservazione implica che...'] },
        speaking: { title: 'Parlato', text: 'Argomentazione avanzata, riformulazione e presentazione professionale.', suggestions: ['Sarebbe opportuno...', 'In altre parole...', 'Un esempio efficace sarebbe...'] },
        writing: { title: 'Scrittura', text: 'Testi argomentativi avanzati con tono, registro e progressione logica.', suggestions: ['La tesi centrale...', 'Ne consegue che...', 'Questa prospettiva merita...'] }
      },
      vocab: [['Implicito', 'Implícito'], ['Portata', 'Alcance'], ['Sfumare', 'Matizar'], ['Coerenza', 'Coherencia'], ['Registro', 'Registro'], ['Approccio', 'Enfoque']],
      grammar: [['C1', 'Congiuntivo avanzato, inversione, forme impersonali.'], ['Padronanza', 'Connettori complessi, nominalizzazione e stile accademico.']],
      reading: {
        title: 'Lettura C1',
        text: 'Un saggio analizza come la lingua costruisca l\u2019identità collettiva e trasmetta la memoria culturale tra le generazioni.',
        questions: [
          { q: '¿Qué construye el lenguaje según el ensayo?', options: ['La economía', 'La identidad colectiva', 'La geografía', 'La tecnología'], answer: 1 },
          { q: '¿Qué transmite entre generaciones?', options: ['Recetas', 'La memoria cultural', 'Mapas', 'Leyes'], answer: 1 },
          { q: '¿Qué tipo de texto es?', options: ['Una receta', 'Un ensayo', 'Un anuncio', 'Un poema'], answer: 1 }
        ]
      }
    },
    C2: {
      skills: {
        listening: { title: 'Ascolto', text: 'Audio autentico e denso con ironia, sottintesi, riferimenti culturali e ritmo naturale.', suggestions: ['Il sottinteso è...', 'La sfumatura decisiva...', 'Questa formulazione suggerisce...'] },
        speaking: { title: 'Parlato', text: 'Espressione quasi nativa per dibattere, negoziare e presentare con precisione.', suggestions: ['Per essere più preciso...', 'Ciò che mi sembra essenziale...', 'In una prospettiva più ampia...'] },
        writing: { title: 'Scrittura', text: 'Produzione esperta: stile, concisione, argomentazione fine e adattamento al pubblico.', suggestions: ['È opportuno tuttavia...', 'Una lettura più sottile...', 'In definitiva...'] }
      },
      vocab: [['Sottinteso', 'Sobreentendido'], ['Raffinato', 'Refinado'], ['Esigenza', 'Exigencia'], ['Equivoco', 'Ambigüedad'], ['Eloquenza', 'Elocuencia'], ['Sintesi', 'Síntesis']],
      grammar: [['C2', 'Padronanza fine dei registri, tempi letterari e coesione.'], ['Expertise', 'Riformulazione, precisione stilistica e argomentazione sfumata.']],
      reading: {
        title: 'Lettura C2',
        text: 'Il brano esamina le tensioni tra memoria, potere e racconto pubblico, richiedendo al lettore di inferire diversi livelli di intenzione.',
        questions: [
          { q: '¿Qué tensiones examina el texto?', options: ['Deporte y ocio', 'Memoria, poder y relato público', 'Clima y turismo', 'Moda y arte'], answer: 1 },
          { q: '¿Qué debe inferir el lector?', options: ['Fechas exactas', 'Varios niveles de intención', 'Una traducción literal', 'Un resumen breve'], answer: 1 },
          { q: '¿Qué nivel se espera del lector?', options: ['Principiante', 'Avanzado / casi nativo', 'Ninguno en particular', 'Solo oral'], answer: 1 }
        ]
      }
    }
  };

  window.ANDERGO_LANGUAGE_WORLDS.lessons.italian = [
  {
    "slug": "saluti-a1",
    "level": "A1",
    "skill": "listening",
    "title": "Saluti e presentazioni",
    "isFree": true,
    "xpReward": 20,
    "description": "Impara a salutare e presentarti in italiano.",
    "intro": "Ascolta brevi saluti e abbinali alla situazione giusta.",
    "vocabulary": [
      {
        "word": "Ciao",
        "translation": "Hola",
        "example": "Ciao, mi chiamo Anna."
      },
      {
        "word": "Piacere",
        "translation": "Mucho gusto",
        "example": "Piacere, sono Leo."
      },
      {
        "word": "Buongiorno",
        "translation": "Buenos días",
        "example": "Buongiorno! Come stai?"
      }
    ],
    "dialogue": [
      {
        "speaker": "Anna",
        "line": "Ciao! Mi chiamo Anna.",
        "translation": "Hola, me llamo Anna."
      },
      {
        "speaker": "Leo",
        "line": "Piacere, Anna. Sono Leo.",
        "translation": "Mucho gusto, Anna. Soy Leo."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "¿Qué significa \"Piacere\"?",
        "options": [
          "Adiós",
          "Mucho gusto",
          "Gracias"
        ],
        "answer": 1
      },
      {
        "type": "mcq",
        "prompt": "¿Qué significa \"Buongiorno\"?",
        "options": [
          "Buenas noches",
          "Buenos días",
          "Buenas tardes"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "routine-quotidiana-a1",
    "level": "A1",
    "skill": "speaking",
    "title": "La mia routine quotidiana",
    "isFree": true,
    "xpReward": 20,
    "description": "Parla della tua giornata con il presente.",
    "intro": "Descrivi la tua routine mattutina, passo dopo passo.",
    "vocabulary": [
      {
        "word": "Svegliarsi",
        "translation": "Despertar",
        "example": "Mi sveglio alle sette."
      },
      {
        "word": "Colazione",
        "translation": "Desayuno",
        "example": "Faccio colazione a casa."
      },
      {
        "word": "Lavoro",
        "translation": "Trabajo",
        "example": "Vado al lavoro in autobus."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "A che ora ti svegli?",
        "translation": "¿A qué hora te despiertas?"
      },
      {
        "speaker": "Studente",
        "line": "Mi sveglio alle sette.",
        "translation": "Me despierto a las siete."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "¿Cómo se dice \"desayuno\"?",
        "options": [
          "Cena",
          "Colazione",
          "Pranzo"
        ],
        "answer": 1
      },
      {
        "type": "speaking",
        "prompt": "Descrivi ad alta voce la tua routine mattutina.",
        "answer": "Open answer"
      }
    ]
  },
  {
    "slug": "la-mia-famiglia-a1",
    "level": "A1",
    "skill": "writing",
    "title": "La mia famiglia",
    "isFree": true,
    "xpReward": 20,
    "description": "Scrivi brevi frasi per descrivere la tua famiglia.",
    "intro": "Usa frasi semplici per presentare la tua famiglia.",
    "vocabulary": [
      {
        "word": "Madre",
        "translation": "Madre",
        "example": "Mia madre è insegnante."
      },
      {
        "word": "Fratello",
        "translation": "Hermano",
        "example": "Ho un fratello."
      },
      {
        "word": "Famiglia",
        "translation": "Familia",
        "example": "La mia famiglia è piccola."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "Parlami della tua famiglia.",
        "translation": "Cuéntame de tu familia."
      },
      {
        "speaker": "Studente",
        "line": "Ho una madre e un fratello.",
        "translation": "Tengo una madre y un hermano."
      }
    ],
    "exercises": [
      {
        "type": "writing",
        "prompt": "Scrivi 3 frasi sulla tua famiglia.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "¿Cómo se dice \"hermano\"?",
        "options": [
          "Sorella",
          "Fratello",
          "Amico"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "piani-weekend-a2",
    "level": "A2",
    "skill": "speaking",
    "title": "Piani per il weekend",
    "isFree": true,
    "xpReward": 25,
    "description": "Parla di progetti futuri con il futuro semplice.",
    "intro": "Descrivi cosa farai questo weekend.",
    "vocabulary": [
      {
        "word": "Piano",
        "translation": "Plan",
        "example": "Ho un piano per sabato."
      },
      {
        "word": "Viaggio",
        "translation": "Viaje",
        "example": "Faremo un viaggio."
      },
      {
        "word": "Riposarsi",
        "translation": "Descansar",
        "example": "Voglio riposarmi questo weekend."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "Cosa farai questo weekend?",
        "translation": "¿Qué vas a hacer este fin de semana?"
      },
      {
        "speaker": "Studente",
        "line": "Andrò a trovare i miei genitori.",
        "translation": "Voy a visitar a mis padres."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "Completa: Io ___ a viaggiare.",
        "options": [
          "vado",
          "va",
          "vai"
        ],
        "answer": 0
      },
      {
        "type": "speaking",
        "prompt": "Descrivi il tuo piano per il weekend in 3 frasi.",
        "answer": "Open answer"
      }
    ]
  },
  {
    "slug": "colloquio-lavoro-b1",
    "level": "B1",
    "skill": "speaking",
    "title": "Colloquio di lavoro",
    "isFree": false,
    "xpReward": 30,
    "description": "Rispondi con sicurezza alle domande comuni del colloquio.",
    "intro": "Esercitati a parlare della tua esperienza e dei tuoi punti di forza.",
    "vocabulary": [
      {
        "word": "Punto di forza",
        "translation": "Fortaleza",
        "example": "Il mio punto di forza è il lavoro di squadra."
      },
      {
        "word": "Esperienza",
        "translation": "Experiencia",
        "example": "Ho tre anni di esperienza."
      },
      {
        "word": "Obiettivo",
        "translation": "Meta",
        "example": "Il mio obiettivo è crescere professionalmente."
      }
    ],
    "dialogue": [
      {
        "speaker": "Intervistatore",
        "line": "Parlami della tua esperienza.",
        "translation": "Cuéntame sobre tu experiencia."
      },
      {
        "speaker": "Candidato",
        "line": "Ho lavorato nel servizio clienti per due anni.",
        "translation": "He trabajado en atención al cliente por dos años."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "¿Qué significa \"punto di forza\" en este contexto?",
        "options": [
          "Debilidad",
          "Fortaleza",
          "Salario"
        ],
        "answer": 1
      },
      {
        "type": "writing",
        "prompt": "Scrivi una breve risposta a \"Perché dovremmo assumerti?\"",
        "answer": "Open answer"
      }
    ]
  },
  {
    "slug": "confronto-citta-b2",
    "level": "B2",
    "skill": "writing",
    "title": "Confrontare due città",
    "isFree": false,
    "xpReward": 35,
    "description": "Scrivi un saggio di confronto strutturato.",
    "intro": "Esercitati a confrontare due luoghi con connettori chiari.",
    "vocabulary": [
      {
        "word": "Mentre",
        "translation": "Mientras que",
        "example": "La città A è tranquilla, mentre la B è vivace."
      },
      {
        "word": "Al contrario",
        "translation": "En cambio",
        "example": "Al contrario, gli affitti sono più economici qui."
      },
      {
        "word": "Nel complesso",
        "translation": "En general",
        "example": "Nel complesso, entrambe le città hanno buoni trasporti."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "Come confronteresti queste due città?",
        "translation": "¿Cómo compararías estas dos ciudades?"
      },
      {
        "speaker": "Studente",
        "line": "Una è più economica, mentre l’altra ha trasporti migliori.",
        "translation": "Una es más accesible, mientras que la otra tiene mejor transporte."
      }
    ],
    "exercises": [
      {
        "type": "writing",
        "prompt": "Scrivi un confronto di 5 frasi tra due città che conosci.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "Quale connettore si usa per contrastare?",
        "options": [
          "Anche",
          "Mentre",
          "Poi"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "dibattito-astratto-c1",
    "level": "C1",
    "skill": "speaking",
    "title": "Dibattito strutturato",
    "isFree": false,
    "xpReward": 40,
    "description": "Difendi una posizione con prove a sostegno.",
    "intro": "Esercitati a costruire un argomento con una struttura chiara.",
    "vocabulary": [
      {
        "word": "Convincente",
        "translation": "Convincente",
        "example": "Questo è un argomento convincente."
      },
      {
        "word": "Controargomento",
        "translation": "Contraargumento",
        "example": "Un controargomento sarebbe..."
      },
      {
        "word": "Premessa",
        "translation": "Premisa",
        "example": "La premessa di questa idea è errata."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "Qual è la tua posizione su questo tema?",
        "translation": "¿Cuál es tu postura sobre este tema?"
      },
      {
        "speaker": "Studente",
        "line": "Direi che le prove sostengono una conclusione diversa.",
        "translation": "Yo argumentaría que la evidencia respalda una conclusión diferente."
      }
    ],
    "exercises": [
      {
        "type": "speaking",
        "prompt": "Difendi una posizione per 45 secondi usando almeno un controargomento.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "Cos’è un \"controargomento\"?",
        "options": [
          "Un esempio",
          "Un controargomento",
          "Una domanda"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "scrittura-sfumata-c2",
    "level": "C2",
    "skill": "writing",
    "title": "Argomentazione sfumata",
    "isFree": false,
    "xpReward": 45,
    "description": "Scrivi con precisione, registro e controllo retorico.",
    "intro": "Perfeziona il tono e la coesione in un breve testo formale.",
    "vocabulary": [
      {
        "word": "Nondimeno",
        "translation": "No obstante",
        "example": "Nondimeno i rischi, il piano è proseguito."
      },
      {
        "word": "Corollario",
        "translation": "Corolario",
        "example": "Un corollario di questa politica è..."
      },
      {
        "word": "Percettibile",
        "translation": "Perceptible",
        "example": "L’effetto era appena percettibile."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "Come formuleresti questo argomento in modo più formale?",
        "translation": "¿Cómo formularías este argumento de manera más formal?"
      },
      {
        "speaker": "Studente",
        "line": "Nondimeno le critiche, la politica ha raggiunto il suo scopo.",
        "translation": "No obstante las críticas, la política logró su objetivo."
      }
    ],
    "exercises": [
      {
        "type": "writing",
        "prompt": "Riscrivi una frase informale in un registro formale.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "¿Qué significa \"nondimeno\"?",
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
