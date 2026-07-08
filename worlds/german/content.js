// worlds/german/content.js
// Mundo de alemán: contenido completo A1–C2 para las 6 habilidades.
(function () {
  window.ANDERGO_LANGUAGE_WORLDS = window.ANDERGO_LANGUAGE_WORLDS || { levelContent: {}, languageContent: {}, lessons: {} };

  window.ANDERGO_LANGUAGE_WORLDS.levelContent.german = {
    A1: {
      skills: {
        listening: { title: 'Hören', text: 'Sehr kurze Dialoge mit Begrüßungen, Namen und einfachen Sätzen.', suggestions: ['Hallo, ich heiße...', 'Ich wohne in...', 'Ich möchte...'] },
        speaking: { title: 'Sprechen', text: 'Einfache Antworten, um sich vorzustellen und Grundfragen zu stellen.', suggestions: ['Ich bin...', 'Ich mag...', 'Wie heißt du?'] },
        writing: { title: 'Schreiben', text: 'Kurze geführte Nachrichten: Vorstellung, Familie und Tagesablauf.', suggestions: ['Hallo, ich...', 'Meine Familie ist...', 'Am Morgen...'] }
      },
      vocab: [['Hallo', 'Hola'], ['Danke', 'Gracias'], ['Haus', 'Casa'], ['Familie', 'Familia'], ['Schule', 'Escuela'], ['Freund', 'Amigo']],
      grammar: [['A1', 'Bestimmte/unbestimmte Artikel, Präsens von sein/haben, Genus und Plural.'], ['Basis', 'Personalpronomen, einfache Verneinung und W-Fragen.']],
      reading: {
        title: 'Lesen A1',
        text: 'Lea wohnt in München. Sie mag Kaffee, Musik und kurze Bücher. Am Morgen geht sie mit ihrem Freund Marco zur Schule.',
        questions: [
          { q: '¿Dónde vive Lea?', options: ['Berlín', 'Múnich', 'Hamburgo', 'Colonia'], answer: 1 },
          { q: '¿Qué le gusta?', options: ['El deporte', 'El café, la música y los libros', 'La televisión', 'Los coches'], answer: 1 },
          { q: '¿Con quién va a la escuela?', options: ['Sola', 'Con Marco', 'Con su madre', 'Con su hermana'], answer: 1 }
        ]
      }
    },
    A2: {
      skills: {
        listening: { title: 'Hören', text: 'Audios über Einkäufe, Wegbeschreibungen, Uhrzeiten und Wochenendaktivitäten.', suggestions: ['Ich suche den/die/das...', 'Der Zug fährt um...', 'Dieses Wochenende...'] },
        speaking: { title: 'Sprechen', text: 'Praktische Dialoge zum Bestellen, nach dem Weg fragen und über Pläne sprechen.', suggestions: ['Ich möchte kaufen...', 'Um zu... zu gelangen...', 'Am Samstag gehe ich...'] },
        writing: { title: 'Schreiben', text: 'Kurze Nachrichten, Einladungen und einfache Beschreibungen mit Grundverbindungen.', suggestions: ['Hallo, willst du...', 'Zuerst...', 'Nach der Arbeit...'] }
      },
      vocab: [['Viertel', 'Barrio'], ['Fahrkarte', 'Boleto'], ['Geschäft', 'Tienda'], ['Käse', 'Queso'], ['Heute', 'Hoy'], ['Morgen', 'Mañana']],
      grammar: [['A2', 'Perfekt, Futur mit werden, Adjektive, Ortspräpositionen.'], ['Gebrauch', 'Höfliche Aufforderung, einfache Objektpronomen und Vergleiche.']],
      reading: {
        title: 'Lesen A2',
        text: 'Marta und Lukas machen ein einfaches Abendessen. Sie kaufen Brot und frisches Gemüse. Nach dem Essen lesen ihre Freunde ein Buch auf dem Sofa.',
        questions: [
          { q: '¿Qué preparan Marta y Lukas?', options: ['Una fiesta', 'Una cena sencilla', 'Un viaje', 'Una boda'], answer: 1 },
          { q: '¿Qué compran?', options: ['Ropa', 'Pan y verduras frescas', 'Libros', 'Juguetes'], answer: 1 },
          { q: '¿Qué hacen después de cenar?', options: ['Bailan', 'Leen un libro', 'Duermen', 'Cocinan'], answer: 1 }
        ]
      }
    },
    B1: {
      skills: {
        listening: { title: 'Hören', text: 'Klare Gespräche mit Meinungen, Erzählungen in der Vergangenheit und Reisesituationen.', suggestions: ['Meiner Meinung nach...', 'Als ich war...', 'Ich denke, dass...'] },
        speaking: { title: 'Sprechen', text: 'Übung, um eine Erfahrung zu erzählen, eine Entscheidung zu erklären und eine Meinung zu äußern.', suggestions: ['Ich bevorzuge...', 'Der Hauptgrund ist...', 'Mir ist aufgefallen, dass...'] },
        writing: { title: 'Schreiben', text: 'Strukturierte Absätze mit Einleitung, Beispielen und kurzem Schluss.', suggestions: ['Zunächst...', 'Zum Beispiel...', 'Zusammenfassend...'] }
      },
      vocab: [['Meinung', 'Opinión'], ['Wahl', 'Elección'], ['Erinnerung', 'Recuerdo'], ['Arbeit', 'Trabajo'], ['Reise', 'Viaje'], ['Ziel', 'Meta']],
      grammar: [['B1', 'Präteritum vs. Perfekt, Pronomen da-/wo-Komposita, Futur I.'], ['Diskurs', 'Konnektoren, Konjunktiv II und einfache indirekte Rede.']],
      reading: {
        title: 'Lesen B1',
        text: 'Nadia ist wegen ihrer Arbeit in eine andere Stadt gezogen. Am Anfang war sie nervös, aber sie fand einen Lesekreis und neue Freunde.',
        questions: [
          { q: '¿Por qué cambió Nadia de ciudad?', options: ['Por vacaciones', 'Por su trabajo', 'Por estudios', 'Por su familia'], answer: 1 },
          { q: '¿Cómo se sentía al principio?', options: ['Feliz', 'Nerviosa', 'Aburrida', 'Enojada'], answer: 1 },
          { q: '¿Qué encontró?', options: ['Un trabajo nuevo', 'Un club de lectura y nuevos amigos', 'Un apartamento', 'Una mascota'], answer: 1 }
        ]
      }
    },
    B2: {
      skills: {
        listening: { title: 'Hören', text: 'Interviews und Reportagen mit Argumenten, Nuancen und wichtigen Details.', suggestions: ['Laut dem Interviewten...', 'Das Hauptproblem...', 'Das zeigt, dass...'] },
        speaking: { title: 'Sprechen', text: 'Debatten, Vergleiche und Standpunkte zu sozialen oder beruflichen Themen.', suggestions: ['Einerseits...', 'Andererseits...', 'Man muss berücksichtigen...'] },
        writing: { title: 'Schreiben', text: 'Kurze Aufsätze, formelle E-Mails und Zusammenfassungen mit klarer Kohäsion.', suggestions: ['Das Thema wirft... auf', 'Es ist angebracht...', 'Folglich...'] }
      },
      vocab: [['Herausforderung', 'Desafío'], ['Beweis', 'Evidencia'], ['Nuance', 'Matiz'], ['Wohnraum', 'Vivienda'], ['Verkehr', 'Transporte'], ['Entwickeln', 'Desarrollar']],
      grammar: [['B2', 'Konjunktiv, Passiv, Konditionalsätze, Partizip I.'], ['Stil', 'Hypothese, Konzession, Ursache/Wirkung und formelles Register.']],
      reading: {
        title: 'Lesen B2',
        text: 'Der Artikel vergleicht zwei Modelle des städtischen Nahverkehrs und erklärt, wie öffentliche Entscheidungen die Lebensqualität der Bewohner beeinflussen.',
        questions: [
          { q: '¿Qué compara el artículo?', options: ['Dos países', 'Dos modelos de transporte urbano', 'Dos décadas', 'Dos idiomas'], answer: 1 },
          { q: '¿Qué influye en la calidad de vida?', options: ['El clima', 'Las decisiones públicas', 'La música', 'El deporte'], answer: 1 },
          { q: '¿Cuál es el tema principal?', options: ['La cocina', 'El transporte urbano', 'La moda', 'El cine'], answer: 1 }
        ]
      }
    },
    C1: {
      skills: {
        listening: { title: 'Hören', text: 'Vorträge, schnelle Podcasts und abstrakte Diskussionen mit kulturellen Anspielungen.', suggestions: ['Die zugrunde liegende Idee...', 'Der Sprecher nuanciert...', 'Diese Bemerkung impliziert, dass...'] },
        speaking: { title: 'Sprechen', text: 'Fortgeschrittene Argumentation, Umformulierung und professionelle Präsentation.', suggestions: ['Es wäre sinnvoll...', 'Mit anderen Worten...', 'Ein treffendes Beispiel wäre...'] },
        writing: { title: 'Schreiben', text: 'Fortgeschrittene argumentative Texte mit Ton, Register und logischem Aufbau.', suggestions: ['Die zentrale These...', 'Daraus ergibt sich, dass...', 'Diese Perspektive verdient...'] }
      },
      vocab: [['Implizit', 'Implícito'], ['Tragweite', 'Alcance'], ['Nuancieren', 'Matizar'], ['Kohärenz', 'Coherencia'], ['Register', 'Registro'], ['Ansatz', 'Enfoque']],
      grammar: [['C1', 'Fortgeschrittener Konjunktiv, Inversion, unpersönliche Wendungen.'], ['Beherrschung', 'Komplexe Konnektoren, Nominalisierung und akademischer Stil.']],
      reading: {
        title: 'Lesen C1',
        text: 'Ein Essay analysiert, wie Sprache die kollektive Identität konstruiert und kulturelles Gedächtnis zwischen Generationen weitergibt.',
        questions: [
          { q: '¿Qué construye el lenguaje según el ensayo?', options: ['La economía', 'La identidad colectiva', 'La geografía', 'La tecnología'], answer: 1 },
          { q: '¿Qué transmite entre generaciones?', options: ['Recetas', 'La memoria cultural', 'Mapas', 'Leyes'], answer: 1 },
          { q: '¿Qué tipo de texto es?', options: ['Una receta', 'Un ensayo', 'Un anuncio', 'Un poema'], answer: 1 }
        ]
      }
    },
    C2: {
      skills: {
        listening: { title: 'Hören', text: 'Dichtes, authentisches Audio mit Ironie, Andeutungen, kulturellen Bezügen und natürlichem Tempo.', suggestions: ['Die Andeutung ist...', 'Die entscheidende Nuance...', 'Diese Formulierung legt nahe...'] },
        speaking: { title: 'Sprechen', text: 'Nahezu muttersprachlicher Ausdruck zum Debattieren, Verhandeln und präzisen Präsentieren.', suggestions: ['Um es genauer zu sagen...', 'Was mir wesentlich erscheint...', 'In einer breiteren Perspektive...'] },
        writing: { title: 'Schreiben', text: 'Expertenhafte Produktion: Stil, Prägnanz, feine Argumentation und Publikumsanpassung.', suggestions: ['Es ist jedoch angebracht...', 'Eine subtilere Lesart...', 'Letztlich...'] }
      },
      vocab: [['Andeutung', 'Sobreentendido'], ['Raffiniert', 'Refinado'], ['Anspruch', 'Exigencia'], ['Zweideutigkeit', 'Ambigüedad'], ['Eloquenz', 'Elocuencia'], ['Synthese', 'Síntesis']],
      grammar: [['C2', 'Feine Beherrschung der Register, literarische Zeitformen und Kohäsion.'], ['Expertise', 'Umformulierung, stilistische Präzision und nuancierte Argumentation.']],
      reading: {
        title: 'Lesen C2',
        text: 'Der Abschnitt untersucht die Spannungen zwischen Erinnerung, Macht und öffentlicher Erzählung und verlangt vom Leser, mehrere Ebenen der Absicht zu erschließen.',
        questions: [
          { q: '¿Qué tensiones examina el pasaje?', options: ['Deporte y ocio', 'Memoria, poder y relato público', 'Clima y turismo', 'Moda y arte'], answer: 1 },
          { q: '¿Qué debe inferir el lector?', options: ['Fechas exactas', 'Varios niveles de intención', 'Una traducción literal', 'Un resumen breve'], answer: 1 },
          { q: '¿Qué nivel se espera del lector?', options: ['Principiante', 'Avanzado / casi nativo', 'Ninguno en particular', 'Solo oral'], answer: 1 }
        ]
      }
    }
  };

  window.ANDERGO_LANGUAGE_WORLDS.lessons.german = [
  {
    "slug": "begruessungen-a1",
    "level": "A1",
    "skill": "listening",
    "title": "Begrüßungen und Vorstellungen",
    "isFree": true,
    "xpReward": 20,
    "description": "Lerne, wie man sich auf Deutsch begrüßt und vorstellt.",
    "intro": "Höre kurze Begrüßungen und ordne sie der richtigen Situation zu.",
    "vocabulary": [
      {
        "word": "Hallo",
        "translation": "Hola",
        "example": "Hallo, ich heiße Anna."
      },
      {
        "word": "Freut mich",
        "translation": "Mucho gusto",
        "example": "Freut mich, ich bin Leo."
      },
      {
        "word": "Guten Morgen",
        "translation": "Buenos días",
        "example": "Guten Morgen! Wie geht es dir?"
      }
    ],
    "dialogue": [
      {
        "speaker": "Anna",
        "line": "Hallo! Ich heiße Anna.",
        "translation": "Hola, me llamo Anna."
      },
      {
        "speaker": "Leo",
        "line": "Freut mich, Anna. Ich bin Leo.",
        "translation": "Mucho gusto, Anna. Soy Leo."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "¿Qué significa \"Freut mich\"?",
        "options": [
          "Adiós",
          "Mucho gusto",
          "Gracias"
        ],
        "answer": 1
      },
      {
        "type": "mcq",
        "prompt": "¿Qué significa \"Guten Morgen\"?",
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
    "slug": "tagesablauf-a1",
    "level": "A1",
    "skill": "speaking",
    "title": "Mein Tagesablauf",
    "isFree": true,
    "xpReward": 20,
    "description": "Sprich über deinen Tag im Präsens.",
    "intro": "Beschreibe deine Morgenroutine Schritt für Schritt.",
    "vocabulary": [
      {
        "word": "Aufwachen",
        "translation": "Despertar",
        "example": "Ich wache um sieben Uhr auf."
      },
      {
        "word": "Frühstück",
        "translation": "Desayuno",
        "example": "Ich esse Frühstück zu Hause."
      },
      {
        "word": "Arbeit",
        "translation": "Trabajo",
        "example": "Ich fahre mit dem Bus zur Arbeit."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "Wann wachst du auf?",
        "translation": "¿A qué hora te despiertas?"
      },
      {
        "speaker": "Schüler",
        "line": "Ich wache um sieben Uhr auf.",
        "translation": "Me despierto a las siete."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "¿Cómo se dice \"desayuno\"?",
        "options": [
          "Abendessen",
          "Frühstück",
          "Mittagessen"
        ],
        "answer": 1
      },
      {
        "type": "speaking",
        "prompt": "Beschreibe deine Morgenroutine laut.",
        "answer": "Open answer"
      }
    ]
  },
  {
    "slug": "meine-familie-a1",
    "level": "A1",
    "skill": "writing",
    "title": "Meine Familie",
    "isFree": true,
    "xpReward": 20,
    "description": "Schreibe kurze Sätze, um deine Familie zu beschreiben.",
    "intro": "Benutze einfache Sätze, um deine Familie vorzustellen.",
    "vocabulary": [
      {
        "word": "Mutter",
        "translation": "Madre",
        "example": "Meine Mutter ist Lehrerin."
      },
      {
        "word": "Bruder",
        "translation": "Hermano",
        "example": "Ich habe einen Bruder."
      },
      {
        "word": "Familie",
        "translation": "Familia",
        "example": "Meine Familie ist klein."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "Erzähl mir von deiner Familie.",
        "translation": "Cuéntame de tu familia."
      },
      {
        "speaker": "Schüler",
        "line": "Ich habe eine Mutter und einen Bruder.",
        "translation": "Tengo una madre y un hermano."
      }
    ],
    "exercises": [
      {
        "type": "writing",
        "prompt": "Schreibe 3 Sätze über deine Familie.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "¿Cómo se dice \"hermano\"?",
        "options": [
          "Schwester",
          "Bruder",
          "Freund"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "wochenendplaene-a2",
    "level": "A2",
    "skill": "speaking",
    "title": "Wochenendpläne",
    "isFree": true,
    "xpReward": 25,
    "description": "Sprich über zukünftige Pläne mit dem Futur.",
    "intro": "Beschreibe, was du dieses Wochenende vorhast.",
    "vocabulary": [
      {
        "word": "Plan",
        "translation": "Plan",
        "example": "Ich habe einen Plan für Samstag."
      },
      {
        "word": "Reise",
        "translation": "Viaje",
        "example": "Wir machen eine Reise."
      },
      {
        "word": "Sich ausruhen",
        "translation": "Descansar",
        "example": "Ich möchte mich dieses Wochenende ausruhen."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "Was machst du dieses Wochenende?",
        "translation": "¿Qué vas a hacer este fin de semana?"
      },
      {
        "speaker": "Schüler",
        "line": "Ich besuche meine Eltern.",
        "translation": "Voy a visitar a mis padres."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "Ergänze: Ich ___ reisen.",
        "options": [
          "werde",
          "wird",
          "wirst"
        ],
        "answer": 0
      },
      {
        "type": "speaking",
        "prompt": "Beschreibe deinen Wochenendplan in 3 Sätzen.",
        "answer": "Open answer"
      }
    ]
  },
  {
    "slug": "vorstellungsgespraech-b1",
    "level": "B1",
    "skill": "speaking",
    "title": "Vorstellungsgespräch",
    "isFree": false,
    "xpReward": 30,
    "description": "Beantworte häufige Interviewfragen selbstbewusst.",
    "intro": "Übe, über deine Erfahrung und deine Stärken zu sprechen.",
    "vocabulary": [
      {
        "word": "Stärke",
        "translation": "Fortaleza",
        "example": "Meine Stärke ist Teamarbeit."
      },
      {
        "word": "Erfahrung",
        "translation": "Experiencia",
        "example": "Ich habe drei Jahre Erfahrung."
      },
      {
        "word": "Ziel",
        "translation": "Meta",
        "example": "Mein Ziel ist es, mich beruflich weiterzuentwickeln."
      }
    ],
    "dialogue": [
      {
        "speaker": "Interviewer",
        "line": "Erzählen Sie mir von Ihrer Erfahrung.",
        "translation": "Cuéntame sobre tu experiencia."
      },
      {
        "speaker": "Kandidat",
        "line": "Ich habe zwei Jahre im Kundenservice gearbeitet.",
        "translation": "He trabajado en atención al cliente por dos años."
      }
    ],
    "exercises": [
      {
        "type": "mcq",
        "prompt": "¿Qué significa \"Stärke\" en este contexto?",
        "options": [
          "Debilidad",
          "Fortaleza",
          "Salario"
        ],
        "answer": 1
      },
      {
        "type": "writing",
        "prompt": "Schreibe eine kurze Antwort auf \"Warum sollten wir Sie einstellen?\"",
        "answer": "Open answer"
      }
    ]
  },
  {
    "slug": "staedtevergleich-b2",
    "level": "B2",
    "skill": "writing",
    "title": "Zwei Städte vergleichen",
    "isFree": false,
    "xpReward": 35,
    "description": "Schreibe einen strukturierten Vergleichsaufsatz.",
    "intro": "Übe, zwei Orte mit klaren Konnektoren zu vergleichen.",
    "vocabulary": [
      {
        "word": "Während",
        "translation": "Mientras que",
        "example": "Stadt A ist ruhig, während Stadt B belebt ist."
      },
      {
        "word": "Im Gegensatz dazu",
        "translation": "En cambio",
        "example": "Im Gegensatz dazu ist Wohnraum hier günstiger."
      },
      {
        "word": "Insgesamt",
        "translation": "En general",
        "example": "Insgesamt haben beide Städte gute Verkehrsmittel."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "Wie würden Sie diese zwei Städte vergleichen?",
        "translation": "¿Cómo compararías estas dos ciudades?"
      },
      {
        "speaker": "Schüler",
        "line": "Die eine ist günstiger, während die andere bessere Verkehrsmittel hat.",
        "translation": "Una es más accesible, mientras que la otra tiene mejor transporte."
      }
    ],
    "exercises": [
      {
        "type": "writing",
        "prompt": "Schreibe einen 5-Satz-Vergleich zwischen zwei Städten, die du kennst.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "Welcher Konnektor wird zum Kontrastieren verwendet?",
        "options": [
          "Auch",
          "Während",
          "Dann"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "abstrakte-debatte-c1",
    "level": "C1",
    "skill": "speaking",
    "title": "Strukturierte Debatte",
    "isFree": false,
    "xpReward": 40,
    "description": "Verteidige eine Position mit unterstützenden Beweisen.",
    "intro": "Übe, ein Argument mit klarer Struktur aufzubauen.",
    "vocabulary": [
      {
        "word": "Überzeugend",
        "translation": "Convincente",
        "example": "Das ist ein überzeugendes Argument."
      },
      {
        "word": "Gegenargument",
        "translation": "Contraargumento",
        "example": "Ein Gegenargument wäre..."
      },
      {
        "word": "Prämisse",
        "translation": "Premisa",
        "example": "Die Prämisse dieser Idee ist fehlerhaft."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "Wie stehen Sie zu diesem Thema?",
        "translation": "¿Cuál es tu postura sobre este tema?"
      },
      {
        "speaker": "Schüler",
        "line": "Ich würde argumentieren, dass die Beweise eine andere Schlussfolgerung stützen.",
        "translation": "Yo argumentaría que la evidencia respalda una conclusión diferente."
      }
    ],
    "exercises": [
      {
        "type": "speaking",
        "prompt": "Verteidigen Sie eine Position 45 Sekunden lang mit mindestens einem Gegenargument.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "Was ist ein \"Gegenargument\"?",
        "options": [
          "Ein Beispiel",
          "Ein Gegenargument",
          "Eine Frage"
        ],
        "answer": 1
      }
    ]
  },
  {
    "slug": "nuancierte-schreiben-c2",
    "level": "C2",
    "skill": "writing",
    "title": "Nuancierte Argumentation",
    "isFree": false,
    "xpReward": 45,
    "description": "Schreibe mit Präzision, Register und rhetorischer Kontrolle.",
    "intro": "Verfeinere Ton und Kohäsion in einem kurzen formellen Text.",
    "vocabulary": [
      {
        "word": "Dennoch",
        "translation": "No obstante",
        "example": "Dennoch der Risiken wurde der Plan fortgesetzt."
      },
      {
        "word": "Korollar",
        "translation": "Corolario",
        "example": "Ein Korollar dieser Politik ist..."
      },
      {
        "word": "Wahrnehmbar",
        "translation": "Perceptible",
        "example": "Der Effekt war kaum wahrnehmbar."
      }
    ],
    "dialogue": [
      {
        "speaker": "Tutor",
        "line": "Wie würden Sie dieses Argument formeller formulieren?",
        "translation": "¿Cómo formularías este argumento de manera más formal?"
      },
      {
        "speaker": "Schüler",
        "line": "Dennoch der Kritik erreichte die Politik ihr Ziel.",
        "translation": "No obstante las críticas, la política logró su objetivo."
      }
    ],
    "exercises": [
      {
        "type": "writing",
        "prompt": "Schreibe einen lockeren Satz in einem formellen Register um.",
        "answer": "Open answer"
      },
      {
        "type": "mcq",
        "prompt": "¿Qué significa \"dennoch\"?",
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
