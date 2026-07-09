const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const seedPath = path.join(ROOT, "lib", "seed-lessons.json");
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SKILLS = ["listening", "speaking", "reading", "writing", "grammar", "vocabulary"];
const SKILL_SUFFIX = {
  listening: "Listening Lab",
  speaking: "Speaking Mission",
  reading: "Reading Quest",
  writing: "Writing Challenge",
  grammar: "Grammar Focus",
  vocabulary: "Vocabulary Boost"
};
const MINUTES_BY_SKILL = {
  listening: 10,
  speaking: 12,
  reading: 12,
  writing: 14,
  grammar: 11,
  vocabulary: 10
};
const XP_BY_LEVEL = { A1: 20, A2: 20, B1: 25, B2: 25, C1: 30, C2: 30 };
const FREE_SKILL_COUNTS = { A1: 3, A2: 3, B1: 3, B2: 3, C1: 1, C2: 1 };
const ACCESS_POLICY = {
  free_lessons_per_level: 3,
  is_free_preview: true,
  premium_price_usd: 5.95,
  premium_label: "USD 5.95 desbloquea la ruta completa"
};

const commonPlans = {
  A1: {
    listening: {
      summary: "Reconoce saludos, nombres y países en diálogos muy breves.",
      intro: "Escucha mini conversaciones de bienvenida y detecta quién habla, cómo se llama y de dónde es.",
      mission: "Identifica nombre, país y gusto personal en una presentación breve.",
      grammar: "Saludos básicos, ser, llamarse y artículos indefinidos.",
      questions: ["¿Quién llega a una clase nueva?", "¿De qué lugar habla el texto?", "¿Qué gusto personal menciona la persona?"]
    },
    speaking: {
      summary: "Preséntate y responde preguntas simples sobre ti.",
      intro: "Practica una presentación oral corta para tu primera clase.",
      mission: "Habla de tu nombre, tu ciudad y una actividad que te gusta.",
      grammar: "Pronombres personales, ser y preguntas con ¿cómo? y ¿de dónde?.",
      questions: ["¿Quién se presenta ante el grupo?", "¿Con quién vive esa persona?", "¿A qué hora estudia?"]
    },
    reading: {
      summary: "Lee perfiles breves y localiza información personal.",
      intro: "Lee un texto corto sobre una familia y responde preguntas concretas.",
      mission: "Encuentra datos sobre edades, relaciones y actividades diarias.",
      grammar: "Hay, tener, números y expresiones de edad.",
      questions: ["¿Cuántas personas viven en la casa?", "¿Quién cocina por la noche?", "¿Qué hace la protagonista antes de dormir?"]
    },
    writing: {
      summary: "Escribe una tarjeta personal con datos básicos.",
      intro: "Redacta frases cortas para describir tu rutina inicial y a una persona cercana.",
      mission: "Escribe 4 frases sobre tu familia, tu rutina y tu lugar favorito.",
      grammar: "Posesivos básicos, presente simple y conectores y/pero.",
      questions: ["¿A quién escribe la tarjeta?", "¿Qué hace la autora por la mañana?", "¿Qué lugar visita después de clases?"]
    },
    grammar: {
      summary: "Domina ser, tener y los artículos más frecuentes.",
      intro: "Observa ejemplos simples y decide cuándo usar ser, tener, un, una, el o la.",
      mission: "Completa frases con ser, tener y artículos correctos.",
      grammar: "Ser vs. tener, género, número y concordancia básica.",
      questions: ["¿Qué objetos hay en el aula?", "¿Cómo es la profesora?", "¿Quién llega hoy?"]
    },
    vocabulary: {
      summary: "Amplía vocabulario de aula, ciudad y tiempo.",
      intro: "Agrupa palabras frecuentes para moverte por la escuela y la ciudad.",
      mission: "Relaciona objetos, lugares y momentos del día con su uso.",
      grammar: "Campo léxico básico, género de sustantivos y plurales regulares.",
      questions: ["¿Qué lleva Pablo en la mano?", "¿Adónde va en autobús?", "¿Cómo está la calle?"]
    }
  },
  A2: {
    listening: {
      summary: "Comprende pedidos sencillos, precios y cantidades.",
      intro: "Escucha un diálogo en una cafetería y otro en una tienda.",
      mission: "Distingue lo que una persona pide, cuánto cuesta y qué necesita llevar.",
      grammar: "Querer, pedir, números, cantidades y presente continuo.",
      questions: ["¿Qué pide Sonia en la cafetería?", "¿Qué compra después?", "¿Para qué momento del día compra la fruta?"]
    },
    speaking: {
      summary: "Pregunta y da indicaciones en el barrio.",
      intro: "Practica cómo llegar a lugares comunes usando referencias claras.",
      mission: "Explica cómo ir al banco, a la estación y a una farmacia cercana.",
      grammar: "Imperativo informal, preposiciones de lugar y verbos de movimiento.",
      questions: ["¿A quién ayuda Tomás?", "¿Qué debe cruzar la turista?", "¿Qué lugar encuentra al final del camino?"]
    },
    reading: {
      summary: "Lee planes, invitaciones y mensajes de fin de semana.",
      intro: "Comprende mensajes sobre horarios, actividades y encuentros.",
      mission: "Localiza cuándo, dónde y con quién ocurre cada plan.",
      grammar: "Futuro próximo, expresiones de tiempo y verbos reflexivos.",
      questions: ["¿Qué día es la invitación?", "¿Qué hacen después del cine?", "¿Cómo es el restaurante que visitan?"]
    },
    writing: {
      summary: "Escribe un correo sencillo sobre un viaje y un plan futuro.",
      intro: "Organiza un mensaje con pasado reciente y próximos pasos.",
      mission: "Cuenta dónde estuviste, qué viste y qué harás la próxima semana.",
      grammar: "Pretérito perfecto, ir a + infinitivo y conectores básicos.",
      questions: ["¿A quién escribe Diego?", "¿Qué lugar visitó?", "¿Cuándo piensa volver?"]
    },
    grammar: {
      summary: "Consolida pasado reciente, futuro y pronombres básicos.",
      intro: "Compara acciones terminadas, planes y objetos directos.",
      mission: "Transforma frases del presente al pasado y al futuro próximo.",
      grammar: "Pretérito perfecto, ir a + infinitivo, lo/la/los/las y comparativos.",
      questions: ["¿Qué tarea ya terminó Eva?", "¿Qué hará mañana?", "¿Cómo compara el café de hoy con el de ayer?"]
    },
    vocabulary: {
      summary: "Aprende vocabulario de comida, transporte y compras.",
      intro: "Clasifica palabras útiles para moverte y resolver tareas diarias.",
      mission: "Usa palabras de mercado, autobús y casa en frases propias.",
      grammar: "Sustantivos contables, expresiones de cantidad y familias léxicas.",
      questions: ["¿Qué compra Irene en el mercado?", "¿Qué necesita antes de pagar?", "¿Qué prepara al volver a casa?"]
    }
  },
  B1: {
    listening: {
      summary: "Sigue una conversación sobre horarios, cansancio y prioridades.",
      intro: "Escucha a dos personas que buscan equilibrio entre estudio, trabajo y descanso.",
      mission: "Identifica problemas, soluciones y decisiones en una charla cotidiana.",
      grammar: "Pretérito imperfecto vs. indefinido, obligación y conectores de causa.",
      questions: ["¿Por qué llegaba cansado Raúl a clase?", "¿Qué cambió en su rutina?", "¿Cómo se siente ahora?"]
    },
    speaking: {
      summary: "Expresa opiniones sobre hábitos saludables y aprendizaje.",
      intro: "Defiende una idea, da razones y responde a una objeción.",
      mission: "Explica qué hábito te ayuda más y justifica tu elección con dos razones.",
      grammar: "Creo que, pienso que, deber, porque y para + infinitivo.",
      questions: ["¿Qué hábito valora Marta?", "¿Qué prefieren sus compañeros?", "¿Qué beneficio menciona el texto?"]
    },
    reading: {
      summary: "Comprende un artículo breve sobre proyectos comunitarios.",
      intro: "Lee una nota sobre voluntariado y reconoce objetivos y resultados.",
      mission: "Encuentra quién participa, qué hace y por qué el proyecto funciona.",
      grammar: "Relativos básicos, conectores de secuencia y voz media frecuente.",
      questions: ["¿Para quién son los talleres?", "¿Qué lugar visitan más los vecinos ahora?", "¿Qué efecto tiene el proyecto?"]
    },
    writing: {
      summary: "Redacta una experiencia personal con inicio, nudo y cierre.",
      intro: "Cuenta un reto reciente y cómo lo resolviste con detalles claros.",
      mission: "Escribe un relato sobre una dificultad y la estrategia que usaste para superarla.",
      grammar: "Marcadores narrativos, pretérito, imperfecto y expresiones de resultado.",
      questions: ["¿Qué cambio vivió Julia?", "¿Qué hizo para mejorar?", "¿Cómo terminó sintiéndose?"]
    },
    grammar: {
      summary: "Afianza tiempos del pasado, obligación y conectores.",
      intro: "Une ideas con aunque, así que, mientras y sin embargo.",
      mission: "Reescribe oraciones para mostrar contraste, causa y simultaneidad.",
      grammar: "Imperfecto vs. indefinido, tener que, aunque, mientras y así que.",
      questions: ["¿Qué hacía Pedro cuando recibió la llamada?", "¿Qué tiempo hacía?", "¿Por qué cambió su plan?"]
    },
    vocabulary: {
      summary: "Amplía vocabulario de viajes, medios y trabajo en equipo.",
      intro: "Practica palabras frecuentes para hablar de experiencias y proyectos.",
      mission: "Usa el nuevo léxico para describir una salida y una tarea compartida.",
      grammar: "Colocaciones frecuentes, verbos con preposición y formación de sustantivos.",
      questions: ["¿Sobre qué preparó un reportaje el equipo?", "¿Qué reservó con tiempo?", "¿Qué meta cumplió el grupo?"]
    }
  },
  B2: {
    listening: {
      summary: "Comprende argumentos y matices en un debate radial.",
      intro: "Escucha posturas a favor y en contra del trabajo remoto.",
      mission: "Distingue tesis, ejemplos y concesiones en una discusión formal.",
      grammar: "Condicional simple, expresiones de probabilidad y conectores adversativos.",
      questions: ["¿Qué tema debaten los expertos?", "¿En qué discrepan?", "¿Qué ventaja reconocen ambos?"]
    },
    speaking: {
      summary: "Compara políticas urbanas y defiende una propuesta.",
      intro: "Presenta ventajas y riesgos de dos medidas para una ciudad.",
      mission: "Argumenta qué política apoyas y responde a una objeción posible.",
      grammar: "Comparativos avanzados, condicionales y estructuras concesivas.",
      questions: ["¿Qué dos políticas estudia el ayuntamiento?", "¿Qué comparan los vecinos?", "¿Qué impacto les preocupa?"]
    },
    reading: {
      summary: "Lee un reportaje con datos, citas y consecuencias.",
      intro: "Analiza un texto sobre turismo sostenible y equilibrio local.",
      mission: "Relaciona cifras, testimonios y recomendaciones finales.",
      grammar: "Pasiva refleja, estilo indirecto y conectores de consecuencia.",
      questions: ["¿Qué limitan varias ciudades?", "¿Qué dicen los residentes?", "¿Qué tipo de reglas mejora la convivencia?"]
    },
    writing: {
      summary: "Redacta una propuesta formal para mejorar un espacio común.",
      intro: "Organiza un texto con objetivo, argumentos y acciones concretas.",
      mission: "Escribe una propuesta para mejorar tu centro de estudio o trabajo.",
      grammar: "Registro formal, pasiva, perífrasis de obligación y conectores lógicos.",
      questions: ["¿Qué lugar necesita mejoras?", "¿Qué soluciones sugiere el grupo?", "¿Qué aspecto técnico mencionan?"]
    },
    grammar: {
      summary: "Practica condicionales, pasiva y discurso referido.",
      intro: "Transforma argumentos directos en estructuras más formales y precisas.",
      mission: "Reformula opiniones usando pasiva, condicional y estilo indirecto.",
      grammar: "Si + imperfecto de subjuntivo, condicional, pasiva perifrástica y estilo indirecto.",
      questions: ["¿Qué dijo el director sobre el proceso?", "¿Qué faltaría para decidir mejor?", "¿Qué recomienda revisar el texto?"]
    },
    vocabulary: {
      summary: "Fortalece vocabulario de sociedad, ambiente y negociación.",
      intro: "Aprende palabras para debatir con precisión sobre cambios colectivos.",
      mission: "Usa términos de evidencia, impacto y acuerdo en un mini argumento.",
      grammar: "Colocaciones abstractas, sufijos frecuentes y familias semánticas.",
      questions: ["¿Qué mostró la evidencia?", "¿Cómo fue el impacto?", "¿Qué resultado logró el debate?"]
    }
  },
  C1: {
    listening: {
      summary: "Sigue un pódcast rápido sobre identidad, migración y memoria.",
      intro: "Escucha ideas complejas y reconoce matices implícitos.",
      mission: "Resume la postura central y dos argumentos secundarios del episodio.",
      grammar: "Subjuntivo en valoración, nominalización y conectores discursivos avanzados.",
      questions: ["¿Qué transforma la migración según la autora?", "¿Qué no desaparece?", "¿Qué relación hay entre lengua e identidad?"]
    },
    speaking: {
      summary: "Debate con precisión y reformula ideas ajenas.",
      intro: "Practica una intervención de seminario con acuerdo parcial y contraargumento.",
      mission: "Presenta tu postura, matízala y responde con cortesía a otra opinión.",
      grammar: "Marcadores de concesión, reformulación y modalidad epistémica.",
      questions: ["¿Qué comparte Elena con su colega?", "¿Qué distingue con cuidado?", "¿Qué efecto busca al matizar su respuesta?"]
    },
    reading: {
      summary: "Interpreta un ensayo sobre memoria colectiva y lenguaje público.",
      intro: "Lee un texto denso y separa tesis, ejemplos y conclusión.",
      mission: "Explica cómo el autor conecta relato, poder y comunidad.",
      grammar: "Oraciones largas, relativos complejos y puntuación argumentativa.",
      questions: ["¿Qué organiza el lenguaje público?", "¿Qué recurso usa el autor?", "¿Qué relación establece entre poder y comunidad?"]
    },
    writing: {
      summary: "Escribe una reseña analítica de un documental o libro.",
      intro: "Combina resumen, valoración crítica y observaciones de estilo.",
      mission: "Redacta una reseña que evalúe contenido, enfoque y efectos en el lector.",
      grammar: "Registro crítico, verbos de valoración y conectores de precisión.",
      questions: ["¿Qué destaca la reseña?", "¿Qué omisión señala?", "¿Cómo valora el enfoque general?"]
    },
    grammar: {
      summary: "Refina el uso del subjuntivo, la nominalización y el registro.",
      intro: "Observa cómo cambia el tono cuando conviertes verbos en nombres o suavizas afirmaciones.",
      mission: "Edita un párrafo para volverlo más preciso, cohesivo y formal.",
      grammar: "Subjuntivo avanzado, nominalización, estructuras impersonales y cohesión.",
      questions: ["¿Qué considera deseable el informe?", "¿Qué problema debe reconocerse?", "¿Qué efecto produce un registro más preciso?"]
    },
    vocabulary: {
      summary: "Amplía vocabulario abstracto para análisis y debate.",
      intro: "Trabaja con palabras de interpretación, evidencia y perspectiva.",
      mission: "Integra léxico abstracto en una explicación académica breve.",
      grammar: "Familias léxicas, prefijos cultos y combinaciones nominales.",
      questions: ["¿Qué cambia según la perspectiva elegida?", "¿Qué puede modificar un pequeño matiz?", "¿Qué elemento sostiene la conclusión?"]
    }
  },
  C2: {
    listening: {
      summary: "Detecta ironía, dobles sentidos y cambios sutiles de registro.",
      intro: "Escucha una entrevista exigente y separa lo explícito de lo implícito.",
      mission: "Explica qué se dice, qué se insinúa y por qué cambia el tono.",
      grammar: "Énfasis, focalización, ironía y cohesión fina.",
      questions: ["¿Cómo responde la experta en apariencia?", "¿Qué crítica se percibe entre líneas?", "¿Qué papel tiene el tono en la interpretación?"]
    },
    speaking: {
      summary: "Negocia con concesiones sutiles y precisión casi nativa.",
      intro: "Ensaya una intervención diplomática con matices estratégicos.",
      mission: "Defiende una posición compleja, concede un punto menor y reformula una solución.",
      grammar: "Atenuadores, estructuras enfáticas y reformulación sofisticada.",
      questions: ["¿Qué punto menor admite la portavoz?", "¿Qué intenta proteger?", "¿Qué propone al final?"]
    },
    reading: {
      summary: "Interpreta una crítica historiográfica con varias capas de sentido.",
      intro: "Lee un texto complejo y evalúa su argumentación implícita.",
      mission: "Relaciona voz, contexto y presupuestos ideológicos del autor.",
      grammar: "Estructuras de énfasis, perífrasis aspectuales y referencias intertextuales.",
      questions: ["¿Qué tipo de lector presupone la crítica?", "¿Qué recurso resignifica el cierre?", "¿Cómo cambia la interpretación final?"]
    },
    writing: {
      summary: "Redacta un editorial con tesis matizada y estilo propio.",
      intro: "Construye una argumentación elegante, rigurosa y persuasiva.",
      mission: "Escribe un editorial que combine análisis, tono y una conclusión memorable.",
      grammar: "Periodos extensos, puntuación retórica y variación estilística.",
      questions: ["¿De qué desconfía el editorial?", "¿Qué pide la discusión pública?", "¿Cómo termina el texto?"]
    },
    grammar: {
      summary: "Perfecciona cohesión, énfasis y control estilístico.",
      intro: "Ajusta pequeños matices para ganar exactitud y elegancia.",
      mission: "Reescribe un texto para mejorar ritmo, referencia y precisión semántica.",
      grammar: "Conectores de alta precisión, correferencia, énfasis y variación sintáctica.",
      questions: ["¿Qué cambia la editora en el ensayo?", "¿Qué mejora eso en el texto?", "¿Qué aspecto sostiene la autoridad textual?"]
    },
    vocabulary: {
      summary: "Maneja léxico fino de retórica, registro y argumentación.",
      intro: "Explora palabras difíciles de sustituir con exactitud.",
      mission: "Emplea vocabulario de matiz, sesgo y elocuencia en un comentario crítico.",
      grammar: "Sinonimia graduada, matices semánticos y registro culto.",
      questions: ["¿Qué altera la interpretación?", "¿Qué valora la crítica en el autor?", "¿Qué delimita el registro?"]
    }
  }
};

const languageSpecs = {
  spanish: {
    label: "Español",
    baseOrder: 370,
    example: (word) => `Hoy practico la palabra "${word}".`,
    levelTitles: {
      A1: "Español esencial",
      A2: "Vida cotidiana",
      B1: "Conversación independiente",
      B2: "Español aplicado",
      C1: "Expresión matizada",
      C2: "Dominio superior"
    },
    lessons: {
      A1: {
        listening: { phrases: ["Hola, me llamo...", "Soy de...", "Mucho gusto.", "Me gusta estudiar."], vocabulary: [["Hola", "Hello"], ["nombre", "name"], ["país", "country"], ["amigo", "friend"], ["clase", "class"]], readingText: "Ana llega a una clase nueva. Dice su nombre, cuenta que es de Baní y comenta que le gusta la música." },
        speaking: { phrases: ["Me llamo Laura.", "Vivo en Santiago.", "Trabajo por la mañana.", "¿Y tú?"], vocabulary: [["vivir", "to live"], ["ciudad", "city"], ["estudiante", "student"], ["trabajo", "work"], ["mañana", "morning"]], readingText: "Carlos se presenta ante su grupo. Explica que vive con su hermana y que estudia por la tarde." },
        reading: { phrases: ["Tengo veinte años.", "Mi padre cocina.", "Hay tres personas en casa.", "Leemos juntos."], vocabulary: [["padre", "father"], ["casa", "house"], ["años", "years"], ["leer", "to read"], ["cocinar", "to cook"]], readingText: "En casa de Julia viven tres personas. Su padre cocina por la noche y ella lee antes de dormir." },
        writing: { phrases: ["Mi familia es pequeña.", "Desayuno a las siete.", "Mi lugar favorito es el parque.", "Después estudio."], vocabulary: [["familia", "family"], ["desayuno", "breakfast"], ["parque", "park"], ["hermana", "sister"], ["tarde", "afternoon"]], readingText: "Marta escribe una tarjeta para su amiga. Cuenta que desayuna temprano y visita el parque después de clases." },
        grammar: { phrases: ["Es una profesora.", "Tengo dos libros.", "La mesa es grande.", "Un amigo llega hoy."], vocabulary: [["profesora", "teacher"], ["libro", "book"], ["mesa", "table"], ["amigo", "friend"], ["hoy", "today"]], readingText: "El aula tiene una mesa grande y dos libros. La profesora es amable y un amigo nuevo llega hoy." },
        vocabulary: { phrases: ["La biblioteca está cerca.", "Necesito un cuaderno.", "Hoy hace sol.", "La calle es tranquila."], vocabulary: [["biblioteca", "library"], ["cuaderno", "notebook"], ["calle", "street"], ["sol", "sun"], ["autobús", "bus"]], readingText: "Pablo sale con su cuaderno y toma el autobús a la biblioteca. La calle está tranquila y hace sol." }
      },
      A2: {
        listening: { phrases: ["Quiero un café con leche.", "¿Cuánto cuesta?", "Necesito medio kilo.", "Ahora estoy comprando fruta."], vocabulary: [["café", "coffee"], ["leche", "milk"], ["precio", "price"], ["fruta", "fruit"], ["kilo", "kilo"]], readingText: "En la cafetería, Sonia pide un café con leche y una tostada. Luego compra fruta para la cena." },
        speaking: { phrases: ["Sigue recto.", "Gira a la izquierda.", "La farmacia está al lado del banco.", "Cruza la plaza."], vocabulary: [["estación", "station"], ["banco", "bank"], ["esquina", "corner"], ["plaza", "square"], ["farmacia", "pharmacy"]], readingText: "Tomás ayuda a una turista. Le dice que cruce la plaza y gire a la izquierda para encontrar la estación." },
        reading: { phrases: ["El sábado voy al cine.", "Nos vemos a las ocho.", "Primero voy a cocinar.", "Después descansamos."], vocabulary: [["sábado", "Saturday"], ["cine", "cinema"], ["entrada", "ticket"], ["cena", "dinner"], ["encuentro", "meeting"]], readingText: "Lucía invita a sus amigos al cine el sábado. Después de la película, todos cenan en un restaurante pequeño." },
        writing: { phrases: ["La semana pasada visité...", "Me gustó mucho...", "Voy a volver en agosto.", "También quiero probar..."], vocabulary: [["viaje", "trip"], ["hotel", "hotel"], ["playa", "beach"], ["agosto", "August"], ["recuerdo", "memory"]], readingText: "Diego escribe a su prima desde la playa. Le cuenta que visitó un mercado y que va a volver en agosto." },
        grammar: { phrases: ["He terminado la tarea.", "Voy a llamar mañana.", "La veo después.", "Este café es más dulce."], vocabulary: [["tarea", "homework"], ["llamada", "call"], ["dulce", "sweet"], ["comparación", "comparison"], ["mañana", "tomorrow"]], readingText: "Eva ha terminado la tarea y va a llamar mañana. Dice que el café de hoy es más dulce que el de ayer." },
        vocabulary: { phrases: ["Compro pan integral.", "El autobús llega tarde.", "Necesito cambio.", "La sopa está caliente."], vocabulary: [["mercado", "market"], ["boleto", "ticket"], ["cambio", "change"], ["sopa", "soup"], ["equipaje", "luggage"]], readingText: "Antes de tomar el autobús, Irene pasa por el mercado. Compra pan, pide cambio y prepara sopa al llegar a casa." }
      },
      B1: {
        listening: { phrases: ["Últimamente trabajo demasiado.", "Antes estudiaba por la noche.", "Por eso necesito organizarme.", "Debería descansar más."], vocabulary: [["horario", "schedule"], ["descanso", "rest"], ["prioridad", "priority"], ["cansancio", "tiredness"], ["organizar", "to organize"]], readingText: "Raúl trabajaba hasta tarde y llegaba cansado a clase. Ahora usa un horario fijo y descansa mejor." },
        speaking: { phrases: ["En mi opinión, caminar ayuda.", "Creo que dormir bien es clave.", "Una razón es el estrés.", "También sirve para concentrarse."], vocabulary: [["salud", "health"], ["costumbre", "habit"], ["energía", "energy"], ["estrés", "stress"], ["concentración", "concentration"]], readingText: "En el club de idiomas, Marta opina que dormir bien mejora la concentración. Sus compañeros prefieren hacer ejercicio." },
        reading: { phrases: ["El grupo organiza talleres.", "La actividad empezó en mayo.", "Muchos vecinos participan.", "Gracias al proyecto, hay más apoyo."], vocabulary: [["barrio", "neighborhood"], ["taller", "workshop"], ["vecino", "neighbor"], ["apoyo", "support"], ["proyecto", "project"]], readingText: "Un grupo del barrio organiza talleres de lectura para niños. Gracias al proyecto, más vecinos visitan la biblioteca." },
        writing: { phrases: ["Al principio fue difícil.", "Después pedí ayuda.", "Poco a poco mejoré.", "Al final me sentí orgulloso."], vocabulary: [["reto", "challenge"], ["ayuda", "help"], ["progreso", "progress"], ["error", "mistake"], ["orgullo", "pride"]], readingText: "Cuando Julia cambió de trabajo, cometió varios errores. Poco a poco pidió ayuda y terminó sintiéndose orgullosa de su progreso." },
        grammar: { phrases: ["Mientras cocinaba, sonó el teléfono.", "Aunque llovía, salimos.", "Tenía que estudiar.", "Así que cambié el plan."], vocabulary: [["lluvia", "rain"], ["plan", "plan"], ["llamada", "call"], ["obligación", "obligation"], ["contraste", "contrast"]], readingText: "Mientras Pedro cocinaba, recibió una llamada. Aunque llovía, salió porque tenía que cambiar su plan." },
        vocabulary: { phrases: ["Reservé el alojamiento en línea.", "El reportaje fue interesante.", "Nuestro equipo cumplió la meta.", "La reunión empezó puntual."], vocabulary: [["alojamiento", "lodging"], ["reportaje", "report"], ["equipo", "team"], ["reunión", "meeting"], ["meta", "goal"]], readingText: "El equipo preparó un reportaje sobre un viaje escolar. Reservó el alojamiento con tiempo y cumplió la meta del proyecto." }
      },
      B2: {
        listening: { phrases: ["Por un lado, ahorra tiempo.", "Sin embargo, reduce el contacto.", "Podría mejorar la productividad.", "Depende del tipo de trabajo."], vocabulary: [["productividad", "productivity"], ["contacto", "contact"], ["debate", "debate"], ["empresa", "company"], ["postura", "stance"]], readingText: "En la radio, dos expertos debaten si el trabajo remoto mejora la productividad. Ambos reconocen ventajas, pero discrepan sobre el contacto humano." },
        speaking: { phrases: ["La primera medida es más viable.", "Aun así, la otra opción es atractiva.", "Si hubiera más buses, bajarían los costos.", "Conviene evaluar el presupuesto."], vocabulary: [["medida", "measure"], ["presupuesto", "budget"], ["transporte", "transport"], ["costo", "cost"], ["propuesta", "proposal"]], readingText: "El ayuntamiento estudia dos políticas: ampliar los buses o crear ciclovías. Los vecinos comparan costos, rapidez e impacto ambiental." },
        reading: { phrases: ["El informe señala que...", "Según los residentes...", "Se recomienda limitar el tráfico.", "Como resultado, mejora la convivencia."], vocabulary: [["turismo", "tourism"], ["residente", "resident"], ["tráfico", "traffic"], ["informe", "report"], ["convivencia", "coexistence"]], readingText: "Un reportaje explica cómo varias ciudades limitan el tráfico turístico. Los residentes dicen que la convivencia mejora cuando hay reglas claras." },
        writing: { phrases: ["Propongo que se amplíe...", "Sería conveniente revisar...", "Además, esta medida permitiría...", "Por último, conviene evaluar resultados."], vocabulary: [["mejora", "improvement"], ["recurso", "resource"], ["mantenimiento", "maintenance"], ["seguridad", "safety"], ["evaluación", "evaluation"]], readingText: "La coordinadora pide propuestas para mejorar la biblioteca. Un grupo sugiere más recursos digitales, mejor iluminación y mantenimiento regular." },
        grammar: { phrases: ["Si tuviéramos más datos, decidiríamos mejor.", "La medida fue aprobada ayer.", "El director afirmó que faltaba tiempo.", "Sería útil revisar el proceso."], vocabulary: [["dato", "data"], ["proceso", "process"], ["decisión", "decision"], ["director", "director"], ["revisión", "review"]], readingText: "El director afirmó que el proceso debía revisarse. Si hubiera más datos, el equipo tomaría una decisión más sólida." },
        vocabulary: { phrases: ["La evidencia respalda la medida.", "El impacto fue desigual.", "Llegaron a un acuerdo parcial.", "La campaña generó debate."], vocabulary: [["evidencia", "evidence"], ["impacto", "impact"], ["acuerdo", "agreement"], ["campaña", "campaign"], ["discusión", "discussion"]], readingText: "Tras la campaña, el debate público creció. La evidencia mostró un impacto desigual, pero permitió alcanzar un acuerdo parcial." }
      },
      C1: {
        listening: { phrases: ["Es probable que la lengua cambie.", "Lo relevante es la memoria compartida.", "No obstante, cada generación reinterpreta el pasado.", "En ese sentido, migrar transforma la identidad."], vocabulary: [["identidad", "identity"], ["memoria", "memory"], ["migración", "migration"], ["pertenencia", "belonging"], ["matiz", "nuance"]], readingText: "En un pódcast cultural, la autora explica que la migración transforma la identidad sin borrar la memoria compartida." },
        speaking: { phrases: ["Comparto parte de esa idea.", "Dicho de otro modo...", "No la descartaría del todo.", "Conviene distinguir contexto y efecto."], vocabulary: [["postura", "position"], ["matiz", "nuance"], ["argumento", "argument"], ["contexto", "context"], ["efecto", "effect"]], readingText: "Durante un seminario, Elena comparte parte de la propuesta de su colega, pero distingue entre contexto histórico y efecto social." },
        reading: { phrases: ["El autor sostiene que...", "A partir de ese ejemplo...", "Conviene observar la metáfora central.", "La conclusión amplía la tesis inicial."], vocabulary: [["relato", "narrative"], ["poder", "power"], ["comunidad", "community"], ["metáfora", "metaphor"], ["tesis", "thesis"]], readingText: "El ensayo sostiene que el lenguaje público organiza la memoria colectiva. A partir de varias metáforas, conecta relato, poder y comunidad." },
        writing: { phrases: ["La obra plantea una pregunta decisiva.", "Su enfoque resulta convincente.", "No obstante, omite una dimensión relevante.", "En conjunto, ofrece una lectura sólida."], vocabulary: [["reseña", "review"], ["enfoque", "approach"], ["omisión", "omission"], ["lector", "reader"], ["valoración", "evaluation"]], readingText: "La reseña destaca que el documental formula una pregunta decisiva. También señala una omisión importante en su enfoque." },
        grammar: { phrases: ["Es fundamental que se reconozca el problema.", "La implementación de la medida requiere tiempo.", "Se considera deseable una revisión periódica.", "Conviene evitar afirmaciones tajantes."], vocabulary: [["implementación", "implementation"], ["revisión", "review"], ["cohesión", "cohesion"], ["registro", "register"], ["precisión", "precision"]], readingText: "El informe considera deseable una revisión periódica. Insiste en que se reconozca el problema con un registro preciso y cohesivo." },
        vocabulary: { phrases: ["La evidencia sugiere otra lectura.", "Esa perspectiva amplía el análisis.", "La interpretación depende del contexto.", "El matiz cambia la conclusión."], vocabulary: [["perspectiva", "perspective"], ["interpretación", "interpretation"], ["evidencia", "evidence"], ["conclusión", "conclusion"], ["alcance", "scope"]], readingText: "La interpretación del artículo cambia según la perspectiva elegida. Un pequeño matiz modifica el alcance de la conclusión." }
      },
      C2: {
        listening: { phrases: ["Dicho así, parece inocente.", "Lo verdaderamente revelador es el tono.", "No deja de ser llamativo.", "Entre líneas se percibe otra intención."], vocabulary: [["ironía", "irony"], ["insinuación", "insinuation"], ["tono", "tone"], ["subtexto", "subtext"], ["énfasis", "emphasis"]], readingText: "En la entrevista, la experta responde con aparente calma, pero su tono deja entrever una crítica severa al proyecto." },
        speaking: { phrases: ["Admito ese punto, aunque...", "Si afinamos los términos...", "Lo decisivo no es solo el costo.", "Propongo una salida intermedia."], vocabulary: [["concesión", "concession"], ["término", "term"], ["salida", "way out"], ["equilibrio", "balance"], ["prioridad", "priority"]], readingText: "Durante una negociación, la portavoz admite un punto menor para proteger su prioridad central y proponer una salida intermedia." },
        reading: { phrases: ["El texto presupone un lector experto.", "La voz ensayística se vuelve más incisiva.", "Esa alusión reordena la interpretación.", "El cierre resignifica el inicio."], vocabulary: [["alusión", "allusion"], ["presupuesto", "assumption"], ["cierre", "closing"], ["interpretación", "interpretation"], ["voz", "voice"]], readingText: "La crítica presupone un lector experto y usa una alusión histórica para resignificar el cierre del ensayo." },
        writing: { phrases: ["Conviene desconfiar de las respuestas simples.", "La discusión exige una mirada más amplia.", "Ese gesto retórico no es casual.", "En última instancia, la cuestión permanece abierta."], vocabulary: [["editorial", "editorial"], ["mirada", "outlook"], ["retórico", "rhetorical"], ["tesis", "thesis"], ["cierre", "closing"]], readingText: "El editorial desconfía de las respuestas simples. Propone una mirada más amplia y deja abierta la cuestión central." },
        grammar: { phrases: ["No solo importa el contenido, sino la cadencia.", "La referencia debe quedar inequívoca.", "Esa elección verbal afina el sentido.", "La cohesión sostiene la autoridad del texto."], vocabulary: [["cadencia", "cadence"], ["referencia", "reference"], ["sentido", "meaning"], ["cohesión", "cohesion"], ["autoridad", "authority"]], readingText: "Al corregir un ensayo, la editora cambia una referencia ambigua y una elección verbal. Así mejora la cadencia y la cohesión del texto." },
        vocabulary: { phrases: ["El matiz altera la interpretación.", "Ese sesgo no es inocente.", "La elocuencia puede persuadir sin exagerar.", "El registro delimita al público."], vocabulary: [["sesgo", "bias"], ["elocuencia", "eloquence"], ["matiz", "nuance"], ["registro", "register"], ["persuasión", "persuasion"]], readingText: "La crítica examina cómo el sesgo y el registro alteran la interpretación. También valora la elocuencia del autor sin confundirla con exageración." }
      }
    }
  },
  italian: {
    label: "Italiano",
    baseOrder: 1090,
    example: (word) => `Oggi pratico la parola "${word}".`,
    levelTitles: {
      A1: "Italiano base",
      A2: "Vita quotidiana",
      B1: "Conversazione sicura",
      B2: "Italiano in contesto",
      C1: "Espressione sfumata",
      C2: "Padronanza completa"
    },
    lessons: {
      A1: {
        listening: { phrases: ["Ciao, mi chiamo...", "Sono di...", "Piacere.", "Mi piace studiare."], vocabulary: [["ciao", "hola"], ["nome", "nombre"], ["paese", "país"], ["amico", "amigo"], ["classe", "clase"]], readingText: "Anna arriva in una classe nuova. Dice il suo nome, racconta che viene da Bari e che le piace la musica." },
        speaking: { phrases: ["Mi chiamo Laura.", "Abito a Torino.", "Lavoro la mattina.", "E tu?"], vocabulary: [["abitare", "vivir"], ["città", "ciudad"], ["studente", "estudiante"], ["lavoro", "trabajo"], ["mattina", "mañana"]], readingText: "Carlo si presenta al gruppo. Spiega che vive con sua sorella e che studia nel pomeriggio." },
        reading: { phrases: ["Ho vent'anni.", "Mio padre cucina.", "Ci sono tre persone a casa.", "Leggiamo insieme."], vocabulary: [["padre", "padre"], ["casa", "casa"], ["anni", "años"], ["leggere", "leer"], ["cucinare", "cocinar"]], readingText: "A casa di Giulia vivono tre persone. Suo padre cucina la sera e lei legge prima di dormire." },
        writing: { phrases: ["La mia famiglia è piccola.", "Faccio colazione alle sette.", "Il mio posto preferito è il parco.", "Dopo studio."], vocabulary: [["famiglia", "familia"], ["colazione", "desayuno"], ["parco", "parque"], ["sorella", "hermana"], ["pomeriggio", "tarde"]], readingText: "Marta scrive una cartolina a un'amica. Racconta che fa colazione presto e va al parco dopo le lezioni." },
        grammar: { phrases: ["È un'insegnante.", "Ho due libri.", "Il tavolo è grande.", "Un amico arriva oggi."], vocabulary: [["insegnante", "profesora"], ["libro", "libro"], ["tavolo", "mesa"], ["amico", "amigo"], ["oggi", "hoy"]], readingText: "L'aula ha un tavolo grande e due libri. L'insegnante è gentile e oggi arriva un amico nuovo." },
        vocabulary: { phrases: ["La biblioteca è vicina.", "Ho bisogno di un quaderno.", "Oggi c'è il sole.", "La strada è tranquilla."], vocabulary: [["biblioteca", "biblioteca"], ["quaderno", "cuaderno"], ["strada", "calle"], ["sole", "sol"], ["autobus", "autobús"]], readingText: "Paolo esce con il suo quaderno e prende l'autobus per la biblioteca. La strada è tranquilla e c'è il sole." }
      },
      A2: {
        listening: { phrases: ["Vorrei un caffè con latte.", "Quanto costa?", "Mi serve mezzo chilo.", "Sto comprando della frutta."], vocabulary: [["caffè", "café"], ["latte", "leche"], ["prezzo", "precio"], ["frutta", "fruta"], ["chilo", "kilo"]], readingText: "Al bar, Sonia ordina un caffè con latte e una fetta di pane tostato. Poi compra della frutta per la cena." },
        speaking: { phrases: ["Vai sempre dritto.", "Gira a sinistra.", "La farmacia è accanto alla banca.", "Attraversa la piazza."], vocabulary: [["stazione", "estación"], ["banca", "banco"], ["angolo", "esquina"], ["piazza", "plaza"], ["farmacia", "farmacia"]], readingText: "Tommaso aiuta una turista. Le dice di attraversare la piazza e girare a sinistra per trovare la stazione." },
        reading: { phrases: ["Sabato vado al cinema.", "Ci vediamo alle otto.", "Prima cucino.", "Dopo ci riposiamo."], vocabulary: [["sabato", "sábado"], ["cinema", "cine"], ["biglietto", "entrada"], ["cena", "cena"], ["incontro", "encuentro"]], readingText: "Lucia invita i suoi amici al cinema sabato. Dopo il film, tutti cenano in un piccolo ristorante." },
        writing: { phrases: ["La settimana scorsa ho visitato...", "Mi è piaciuto molto...", "Tornerò ad agosto.", "Voglio anche provare..."], vocabulary: [["viaggio", "viaje"], ["albergo", "hotel"], ["spiaggia", "playa"], ["agosto", "agosto"], ["ricordo", "recuerdo"]], readingText: "Diego scrive a sua cugina dalla spiaggia. Le racconta che ha visitato un mercato e che tornerà ad agosto." },
        grammar: { phrases: ["Ho finito i compiti.", "Domani la chiamo.", "La vedo dopo.", "Questo caffè è più dolce."], vocabulary: [["compito", "tarea"], ["telefonata", "llamada"], ["dolce", "dulce"], ["confronto", "comparación"], ["domani", "mañana"]], readingText: "Eva ha finito i compiti e domani farà una telefonata. Dice che il caffè di oggi è più dolce di quello di ieri." },
        vocabulary: { phrases: ["Compro pane integrale.", "L'autobus arriva tardi.", "Ho bisogno del resto.", "La zuppa è calda."], vocabulary: [["mercato", "mercado"], ["biglietto", "boleto"], ["resto", "cambio"], ["zuppa", "sopa"], ["bagaglio", "equipaje"]], readingText: "Prima di prendere l'autobus, Irene passa dal mercato. Compra il pane, chiede il resto e prepara una zuppa quando torna a casa." }
      },
      B1: {
        listening: { phrases: ["Ultimamente lavoro troppo.", "Prima studiavo la sera.", "Per questo devo organizzarmi meglio.", "Dovrei riposarmi di più."], vocabulary: [["orario", "horario"], ["riposo", "descanso"], ["priorità", "prioridad"], ["stanchezza", "cansancio"], ["organizzare", "organizar"]], readingText: "Raul lavorava fino a tardi e arrivava stanco a lezione. Adesso usa un orario fisso e riposa meglio." },
        speaking: { phrases: ["Secondo me, camminare aiuta.", "Penso che dormire bene sia importante.", "Una ragione è lo stress.", "Aiuta anche la concentrazione."], vocabulary: [["salute", "salud"], ["abitudine", "costumbre"], ["energia", "energía"], ["stress", "estrés"], ["concentrazione", "concentración"]], readingText: "Nel club di lingue, Marta dice che dormire bene migliora la concentrazione. I suoi compagni preferiscono fare esercizio." },
        reading: { phrases: ["Il gruppo organizza laboratori.", "L'attività è iniziata a maggio.", "Molti vicini partecipano.", "Grazie al progetto, c'è più sostegno."], vocabulary: [["quartiere", "barrio"], ["laboratorio", "taller"], ["vicino", "vecino"], ["sostegno", "apoyo"], ["progetto", "proyecto"]], readingText: "Un gruppo del quartiere organizza laboratori di lettura per bambini. Grazie al progetto, più vicini visitano la biblioteca." },
        writing: { phrases: ["All'inizio è stato difficile.", "Poi ho chiesto aiuto.", "Piano piano sono migliorato.", "Alla fine mi sono sentito orgoglioso."], vocabulary: [["sfida", "reto"], ["aiuto", "ayuda"], ["progresso", "progreso"], ["errore", "error"], ["orgoglio", "orgullo"]], readingText: "Quando Giulia ha cambiato lavoro, ha fatto vari errori. Poco a poco ha chiesto aiuto e alla fine si è sentita orgogliosa dei suoi progressi." },
        grammar: { phrases: ["Mentre cucinavo, è squillato il telefono.", "Anche se pioveva, siamo usciti.", "Dovevo studiare.", "Perciò ho cambiato il piano."], vocabulary: [["pioggia", "lluvia"], ["piano", "plan"], ["chiamata", "llamada"], ["obbligo", "obligación"], ["contrasto", "contraste"]], readingText: "Mentre Pietro cucinava, ha ricevuto una chiamata. Anche se pioveva, è uscito perché doveva cambiare il suo piano." },
        vocabulary: { phrases: ["Ho prenotato l'alloggio online.", "Il reportage è stato interessante.", "La nostra squadra ha raggiunto l'obiettivo.", "La riunione è iniziata puntuale."], vocabulary: [["alloggio", "alojamiento"], ["reportage", "reportaje"], ["squadra", "equipo"], ["riunione", "reunión"], ["obiettivo", "meta"]], readingText: "La squadra ha preparato un reportage su un viaggio scolastico. Ha prenotato l'alloggio in anticipo e ha raggiunto l'obiettivo del progetto." }
      },
      B2: {
        listening: { phrases: ["Da un lato fa risparmiare tempo.", "Dall'altro riduce il contatto.", "Potrebbe migliorare la produttività.", "Dipende dal tipo di lavoro."], vocabulary: [["produttività", "productividad"], ["contatto", "contacto"], ["dibattito", "debate"], ["azienda", "empresa"], ["posizione", "postura"]], readingText: "Alla radio, due esperti discutono se il lavoro a distanza migliori la produttività. Entrambi riconoscono vantaggi, ma non sono d'accordo sul contatto umano." },
        speaking: { phrases: ["La prima misura è più realistica.", "Nonostante ciò, l'altra opzione è attraente.", "Se ci fossero più autobus, i costi scenderebbero.", "Conviene valutare il bilancio."], vocabulary: [["misura", "medida"], ["bilancio", "presupuesto"], ["trasporto", "transporte"], ["costo", "costo"], ["proposta", "propuesta"]], readingText: "Il comune studia due politiche: aumentare gli autobus o creare piste ciclabili. I residenti confrontano costi, velocità e impatto ambientale." },
        reading: { phrases: ["Il rapporto segnala che...", "Secondo i residenti...", "Si raccomanda di limitare il traffico.", "Di conseguenza migliora la convivenza."], vocabulary: [["turismo", "turismo"], ["residente", "residente"], ["traffico", "tráfico"], ["rapporto", "informe"], ["convivenza", "convivencia"]], readingText: "Un reportage spiega come varie città limitino il traffico turistico. I residenti dicono che la convivenza migliora quando esistono regole chiare." },
        writing: { phrases: ["Propongo che si ampli...", "Sarebbe opportuno rivedere...", "Inoltre, questa misura permetterebbe...", "Infine, conviene valutare i risultati."], vocabulary: [["miglioramento", "mejora"], ["risorsa", "recurso"], ["manutenzione", "mantenimiento"], ["sicurezza", "seguridad"], ["valutazione", "evaluación"]], readingText: "La coordinatrice chiede proposte per migliorare la biblioteca. Un gruppo suggerisce più risorse digitali, migliore illuminazione e manutenzione regolare." },
        grammar: { phrases: ["Se avessimo più dati, decideremmo meglio.", "La misura è stata approvata ieri.", "Il direttore ha detto che mancava tempo.", "Sarebbe utile rivedere il processo."], vocabulary: [["dato", "dato"], ["processo", "proceso"], ["decisione", "decisión"], ["direttore", "director"], ["revisione", "revisión"]], readingText: "Il direttore ha affermato che il processo doveva essere rivisto. Se ci fossero più dati, il gruppo prenderebbe una decisione più solida." },
        vocabulary: { phrases: ["La prova sostiene la misura.", "L'impatto è stato disuguale.", "Hanno raggiunto un accordo parziale.", "La campagna ha generato dibattito."], vocabulary: [["prova", "evidencia"], ["impatto", "impacto"], ["accordo", "acuerdo"], ["campagna", "campaña"], ["discussione", "discusión"]], readingText: "Dopo la campagna, il dibattito pubblico è cresciuto. La prova ha mostrato un impatto disuguale, ma ha permesso di raggiungere un accordo parziale." }
      },
      C1: {
        listening: { phrases: ["È probabile che la lingua cambi.", "Ciò che conta è la memoria condivisa.", "Tuttavia ogni generazione reinterpreta il passato.", "In questo senso, migrare trasforma l'identità."], vocabulary: [["identità", "identidad"], ["memoria", "memoria"], ["migrazione", "migración"], ["appartenenza", "pertenencia"], ["sfumatura", "matiz"]], readingText: "In un podcast culturale, l'autrice spiega che la migrazione trasforma l'identità senza cancellare la memoria condivisa." },
        speaking: { phrases: ["Condivido in parte questa idea.", "Detto in altro modo...", "Non la escluderei del tutto.", "Conviene distinguere tra contesto ed effetto."], vocabulary: [["posizione", "postura"], ["sfumatura", "matiz"], ["argomento", "argumento"], ["contesto", "contexto"], ["effetto", "efecto"]], readingText: "Durante un seminario, Elena condivide in parte la proposta della collega, ma distingue tra contesto storico ed effetto sociale." },
        reading: { phrases: ["L'autore sostiene che...", "A partire da questo esempio...", "Conviene osservare la metafora centrale.", "La conclusione amplia la tesi iniziale."], vocabulary: [["racconto", "relato"], ["potere", "poder"], ["comunità", "comunidad"], ["metafora", "metáfora"], ["tesi", "tesis"]], readingText: "Il saggio sostiene che il linguaggio pubblico organizzi la memoria collettiva. Attraverso varie metafore collega racconto, potere e comunità." },
        writing: { phrases: ["L'opera pone una domanda decisiva.", "Il suo approccio risulta convincente.", "Tuttavia omette una dimensione rilevante.", "Nel complesso offre una lettura solida."], vocabulary: [["recensione", "reseña"], ["approccio", "enfoque"], ["omissione", "omisión"], ["lettore", "lector"], ["valutazione", "valoración"]], readingText: "La recensione sottolinea che il documentario formula una domanda decisiva. Segnala anche un'omissione importante nel suo approccio." },
        grammar: { phrases: ["È fondamentale che il problema sia riconosciuto.", "L'implementazione della misura richiede tempo.", "Si considera desiderabile una revisione periodica.", "Conviene evitare affermazioni troppo rigide."], vocabulary: [["implementazione", "implementación"], ["revisione", "revisión"], ["coesione", "cohesión"], ["registro", "registro"], ["precisione", "precisión"]], readingText: "Il rapporto considera desiderabile una revisione periodica. Insiste sul fatto che il problema venga riconosciuto con un registro preciso e coeso." },
        vocabulary: { phrases: ["La prova suggerisce un'altra lettura.", "Questa prospettiva amplia l'analisi.", "L'interpretazione dipende dal contesto.", "La sfumatura cambia la conclusione."], vocabulary: [["prospettiva", "perspectiva"], ["interpretazione", "interpretación"], ["prova", "evidencia"], ["conclusione", "conclusión"], ["portata", "alcance"]], readingText: "L'interpretazione dell'articolo cambia secondo la prospettiva scelta. Una piccola sfumatura modifica la portata della conclusione." }
      },
      C2: {
        listening: { phrases: ["Detto così, sembra innocuo.", "Ciò che rivela davvero è il tono.", "Resta comunque sorprendente.", "Tra le righe si percepisce un'altra intenzione."], vocabulary: [["ironia", "ironía"], ["insinuazione", "insinuación"], ["tono", "tono"], ["sottotesto", "subtexto"], ["enfasi", "énfasis"]], readingText: "Nell'intervista, l'esperta risponde con apparente calma, ma il suo tono lascia intravedere una critica severa al progetto." },
        speaking: { phrases: ["Ammetto questo punto, anche se...", "Se precisiamo meglio i termini...", "Ciò che conta non è solo il costo.", "Propongo una via d'uscita intermedia."], vocabulary: [["concessione", "concesión"], ["termine", "término"], ["via d'uscita", "salida"], ["equilibrio", "equilibrio"], ["priorità", "prioridad"]], readingText: "Durante una negoziazione, la portavoce ammette un punto minore per proteggere la priorità centrale e proporre una via intermedia." },
        reading: { phrases: ["Il testo presuppone un lettore esperto.", "La voce saggistica diventa più incisiva.", "Questa allusione riordina l'interpretazione.", "La chiusura risignifica l'inizio."], vocabulary: [["allusione", "alusión"], ["presupposto", "supuesto"], ["chiusura", "cierre"], ["interpretazione", "interpretación"], ["voce", "voz"]], readingText: "La critica presuppone un lettore esperto e usa un'allusione storica per risignificare la chiusura del saggio." },
        writing: { phrases: ["Conviene diffidare delle risposte semplici.", "La discussione richiede uno sguardo più ampio.", "Quel gesto retorico non è casuale.", "In ultima analisi, la questione resta aperta."], vocabulary: [["editoriale", "editorial"], ["sguardo", "mirada"], ["retorica", "retórica"], ["tesi", "tesis"], ["chiusura", "cierre"]], readingText: "L'editoriale diffida delle risposte semplici. Propone uno sguardo più ampio e lascia aperta la questione centrale." },
        grammar: { phrases: ["Non conta solo il contenuto, ma anche la cadenza.", "Il riferimento deve restare inequivocabile.", "Quella scelta verbale affina il senso.", "La coesione sostiene l'autorevolezza del testo."], vocabulary: [["cadenza", "cadencia"], ["riferimento", "referencia"], ["senso", "sentido"], ["coesione", "cohesión"], ["autorevolezza", "autoridad"]], readingText: "Correggendo un saggio, l'editrice cambia un riferimento ambiguo e una scelta verbale. Così migliora la cadenza e la coesione del testo." },
        vocabulary: { phrases: ["La sfumatura altera l'interpretazione.", "Questo pregiudizio non è innocente.", "L'eloquenza può persuadere senza esagerare.", "Il registro delimita il pubblico."], vocabulary: [["pregiudizio", "sesgo"], ["eloquenza", "elocuencia"], ["sfumatura", "matiz"], ["registro", "registro"], ["persuasione", "persuasión"]], readingText: "La critica esamina come il pregiudizio e il registro alterino l'interpretazione. Valuta anche l'eloquenza dell'autore senza confonderla con l'esagerazione." }
      }
    }
  },
  german: {
    label: "Deutsch",
    baseOrder: 1450,
    example: (word) => `Heute übe ich das Wort "${word}".`,
    levelTitles: {
      A1: "Deutsch Start",
      A2: "Alltag Deutsch",
      B1: "Sicher sprechen",
      B2: "Deutsch im Kontext",
      C1: "Nuancierter Ausdruck",
      C2: "Meisterschaft"
    },
    lessons: {
      A1: {
        listening: { phrases: ["Hallo, ich heiße...", "Ich komme aus...", "Freut mich.", "Ich lerne gern."], vocabulary: [["Hallo", "hola"], ["Name", "nombre"], ["Land", "país"], ["Freund", "amigo"], ["Klasse", "clase"]], readingText: "Ana kommt in eine neue Klasse. Sie sagt ihren Namen, erzählt, dass sie aus Baní kommt, und dass sie Musik mag." },
        speaking: { phrases: ["Ich heiße Laura.", "Ich wohne in Leipzig.", "Ich arbeite am Morgen.", "Und du?"], vocabulary: [["wohnen", "vivir"], ["Stadt", "ciudad"], ["Student", "estudiante"], ["Arbeit", "trabajo"], ["Morgen", "mañana"]], readingText: "Carlos stellt sich seiner Gruppe vor. Er erklärt, dass er mit seiner Schwester wohnt und am Nachmittag lernt." },
        reading: { phrases: ["Ich bin zwanzig Jahre alt.", "Mein Vater kocht.", "Zu Hause sind drei Personen.", "Wir lesen zusammen."], vocabulary: [["Vater", "padre"], ["Haus", "casa"], ["Jahre", "años"], ["lesen", "leer"], ["kochen", "cocinar"]], readingText: "In Julias Haus leben drei Personen. Ihr Vater kocht am Abend und sie liest vor dem Schlafen." },
        writing: { phrases: ["Meine Familie ist klein.", "Ich frühstücke um sieben.", "Mein Lieblingsort ist der Park.", "Danach lerne ich."], vocabulary: [["Familie", "familia"], ["Frühstück", "desayuno"], ["Park", "parque"], ["Schwester", "hermana"], ["Nachmittag", "tarde"]], readingText: "Marta schreibt eine Karte an ihre Freundin. Sie erzählt, dass sie frühstückt und nach dem Unterricht in den Park geht." },
        grammar: { phrases: ["Sie ist Lehrerin.", "Ich habe zwei Bücher.", "Der Tisch ist groß.", "Heute kommt ein Freund."], vocabulary: [["Lehrerin", "profesora"], ["Buch", "libro"], ["Tisch", "mesa"], ["Freund", "amigo"], ["heute", "hoy"]], readingText: "Im Klassenraum gibt es einen großen Tisch und zwei Bücher. Die Lehrerin ist freundlich und heute kommt ein neuer Freund." },
        vocabulary: { phrases: ["Die Bibliothek ist in der Nähe.", "Ich brauche ein Heft.", "Heute ist es sonnig.", "Die Straße ist ruhig."], vocabulary: [["Bibliothek", "biblioteca"], ["Heft", "cuaderno"], ["Straße", "calle"], ["Sonne", "sol"], ["Bus", "autobús"]], readingText: "Paul geht mit seinem Heft aus dem Haus und nimmt den Bus zur Bibliothek. Die Straße ist ruhig und die Sonne scheint." }
      },
      A2: {
        listening: { phrases: ["Ich möchte einen Kaffee mit Milch.", "Wie viel kostet das?", "Ich brauche ein halbes Kilo.", "Gerade kaufe ich Obst."], vocabulary: [["Kaffee", "café"], ["Milch", "leche"], ["Preis", "precio"], ["Obst", "fruta"], ["Kilo", "kilo"]], readingText: "Im Café bestellt Sonia einen Kaffee mit Milch und einen Toast. Danach kauft sie Obst für das Abendessen." },
        speaking: { phrases: ["Geh geradeaus.", "Bieg links ab.", "Die Apotheke ist neben der Bank.", "Überquere den Platz."], vocabulary: [["Bahnhof", "estación"], ["Bank", "banco"], ["Ecke", "esquina"], ["Platz", "plaza"], ["Apotheke", "farmacia"]], readingText: "Tomás hilft einer Touristin. Er sagt ihr, dass sie über den Platz gehen und links abbiegen soll, um den Bahnhof zu finden." },
        reading: { phrases: ["Am Samstag gehe ich ins Kino.", "Wir sehen uns um acht.", "Zuerst koche ich.", "Danach ruhen wir uns aus."], vocabulary: [["Samstag", "sábado"], ["Kino", "cine"], ["Eintrittskarte", "entrada"], ["Abendessen", "cena"], ["Treffen", "encuentro"]], readingText: "Lucía lädt ihre Freunde am Samstag ins Kino ein. Nach dem Film essen alle in einem kleinen Restaurant zu Abend." },
        writing: { phrases: ["Letzte Woche habe ich ... besucht.", "Es hat mir sehr gefallen.", "Im August fahre ich wieder hin.", "Ich möchte auch ... probieren."], vocabulary: [["Reise", "viaje"], ["Hotel", "hotel"], ["Strand", "playa"], ["August", "agosto"], ["Erinnerung", "recuerdo"]], readingText: "Diego schreibt seiner Cousine vom Strand. Er erzählt, dass er einen Markt besucht hat und im August wieder hinfahren will." },
        grammar: { phrases: ["Ich habe die Hausaufgabe beendet.", "Morgen rufe ich sie an.", "Ich sehe sie später.", "Dieser Kaffee ist süßer."], vocabulary: [["Hausaufgabe", "tarea"], ["Anruf", "llamada"], ["süß", "dulce"], ["Vergleich", "comparación"], ["morgen", "mañana"]], readingText: "Eva hat die Hausaufgabe beendet und wird morgen anrufen. Sie sagt, dass der Kaffee von heute süßer ist als der von gestern." },
        vocabulary: { phrases: ["Ich kaufe Vollkornbrot.", "Der Bus kommt spät.", "Ich brauche Wechselgeld.", "Die Suppe ist warm."], vocabulary: [["Markt", "mercado"], ["Fahrkarte", "boleto"], ["Wechselgeld", "cambio"], ["Suppe", "sopa"], ["Gepäck", "equipaje"]], readingText: "Bevor Irene den Bus nimmt, geht sie über den Markt. Sie kauft Brot, bittet um Wechselgeld und kocht zu Hause eine Suppe." }
      },
      B1: {
        listening: { phrases: ["In letzter Zeit arbeite ich zu viel.", "Früher habe ich abends gelernt.", "Deshalb muss ich mich besser organisieren.", "Ich sollte mehr ausruhen."], vocabulary: [["Zeitplan", "horario"], ["Erholung", "descanso"], ["Priorität", "prioridad"], ["Müdigkeit", "cansancio"], ["organisieren", "organizar"]], readingText: "Raúl arbeitete bis spät und kam müde zum Unterricht. Jetzt benutzt er einen festen Zeitplan und ruht sich besser aus." },
        speaking: { phrases: ["Meiner Meinung nach hilft Spazierengehen.", "Ich denke, guter Schlaf ist wichtig.", "Ein Grund ist der Stress.", "Das hilft auch bei der Konzentration."], vocabulary: [["Gesundheit", "salud"], ["Gewohnheit", "costumbre"], ["Energie", "energía"], ["Stress", "estrés"], ["Konzentration", "concentración"]], readingText: "Im Sprachklub sagt Marta, dass guter Schlaf die Konzentration verbessert. Ihre Freunde machen lieber Sport." },
        reading: { phrases: ["Die Gruppe organisiert Workshops.", "Die Aktivität begann im Mai.", "Viele Nachbarn machen mit.", "Dank des Projekts gibt es mehr Unterstützung."], vocabulary: [["Stadtviertel", "barrio"], ["Workshop", "taller"], ["Nachbar", "vecino"], ["Unterstützung", "apoyo"], ["Projekt", "proyecto"]], readingText: "Eine Gruppe aus dem Stadtviertel organisiert Lese-Workshops für Kinder. Dank des Projekts besuchen mehr Nachbarn die Bibliothek." },
        writing: { phrases: ["Am Anfang war es schwierig.", "Dann habe ich um Hilfe gebeten.", "Nach und nach wurde ich besser.", "Am Ende war ich stolz."], vocabulary: [["Herausforderung", "reto"], ["Hilfe", "ayuda"], ["Fortschritt", "progreso"], ["Fehler", "error"], ["Stolz", "orgullo"]], readingText: "Als Julia den Job wechselte, machte sie einige Fehler. Nach und nach bat sie um Hilfe und war am Ende stolz auf ihren Fortschritt." },
        grammar: { phrases: ["Während ich kochte, klingelte das Telefon.", "Obwohl es regnete, gingen wir raus.", "Ich musste lernen.", "Deshalb änderte ich den Plan."], vocabulary: [["Regen", "lluvia"], ["Plan", "plan"], ["Anruf", "llamada"], ["Pflicht", "obligación"], ["Kontrast", "contraste"]], readingText: "Während Pedro kochte, bekam er einen Anruf. Obwohl es regnete, ging er hinaus, weil er seinen Plan ändern musste." },
        vocabulary: { phrases: ["Ich habe die Unterkunft online reserviert.", "Die Reportage war interessant.", "Unser Team erreichte das Ziel.", "Die Besprechung begann pünktlich."], vocabulary: [["Unterkunft", "alojamiento"], ["Reportage", "reportaje"], ["Team", "equipo"], ["Besprechung", "reunión"], ["Ziel", "meta"]], readingText: "Das Team bereitete eine Reportage über eine Schulreise vor. Es reservierte die Unterkunft früh und erreichte das Ziel des Projekts." }
      },
      B2: {
        listening: { phrases: ["Einerseits spart es Zeit.", "Andererseits verringert es den Kontakt.", "Es könnte die Produktivität steigern.", "Das hängt von der Arbeit ab."], vocabulary: [["Produktivität", "productividad"], ["Kontakt", "contacto"], ["Debatte", "debate"], ["Firma", "empresa"], ["Standpunkt", "postura"]], readingText: "Im Radio diskutieren zwei Experten, ob Heimarbeit die Produktivität verbessert. Beide sehen Vorteile, aber sie streiten über den menschlichen Kontakt." },
        speaking: { phrases: ["Die erste Maßnahme ist besser umsetzbar.", "Trotzdem ist die andere Option attraktiv.", "Wenn es mehr Busse gäbe, würden die Kosten sinken.", "Man sollte das Budget prüfen."], vocabulary: [["Maßnahme", "medida"], ["Budget", "presupuesto"], ["Verkehr", "transporte"], ["Kosten", "costo"], ["Vorschlag", "propuesta"]], readingText: "Die Stadtverwaltung prüft zwei Maßnahmen: mehr Busse oder neue Radwege. Die Bewohner vergleichen Kosten, Tempo und Umwelteffekt." },
        reading: { phrases: ["Der Bericht sagt, dass...", "Laut den Bewohnern...", "Es wird empfohlen, den Verkehr zu begrenzen.", "Dadurch verbessert sich das Zusammenleben."], vocabulary: [["Tourismus", "turismo"], ["Bewohner", "residente"], ["Verkehr", "tráfico"], ["Bericht", "informe"], ["Zusammenleben", "convivencia"]], readingText: "Ein Bericht erklärt, wie mehrere Städte den touristischen Verkehr einschränken. Die Bewohner sagen, dass klare Regeln das Zusammenleben verbessern." },
        writing: { phrases: ["Ich schlage vor, dass ... erweitert wird.", "Es wäre sinnvoll, ... zu überprüfen.", "Außerdem würde diese Maßnahme ... ermöglichen.", "Schließlich sollte man die Ergebnisse bewerten."], vocabulary: [["Verbesserung", "mejora"], ["Ressource", "recurso"], ["Wartung", "mantenimiento"], ["Sicherheit", "seguridad"], ["Bewertung", "evaluación"]], readingText: "Die Koordinatorin bittet um Vorschläge zur Verbesserung der Bibliothek. Eine Gruppe schlägt mehr digitale Ressourcen, besseres Licht und regelmäßige Wartung vor." },
        grammar: { phrases: ["Wenn wir mehr Daten hätten, würden wir besser entscheiden.", "Die Maßnahme wurde gestern beschlossen.", "Der Direktor sagte, dass Zeit fehle.", "Es wäre nützlich, den Prozess zu überprüfen."], vocabulary: [["Daten", "dato"], ["Prozess", "proceso"], ["Entscheidung", "decisión"], ["Direktor", "director"], ["Überprüfung", "revisión"]], readingText: "Der Direktor sagte, dass der Prozess überprüft werden müsse. Wenn es mehr Daten gäbe, würde das Team eine stärkere Entscheidung treffen." },
        vocabulary: { phrases: ["Die Evidenz stützt die Maßnahme.", "Die Auswirkungen waren ungleich.", "Sie erreichten eine teilweise Einigung.", "Die Kampagne löste eine Debatte aus."], vocabulary: [["Evidenz", "evidencia"], ["Auswirkung", "impacto"], ["Einigung", "acuerdo"], ["Kampagne", "campaña"], ["Diskussion", "discusión"]], readingText: "Nach der Kampagne wuchs die öffentliche Debatte. Die Evidenz zeigte ungleiche Auswirkungen, half aber dabei, eine teilweise Einigung zu erzielen." }
      },
      C1: {
        listening: { phrases: ["Wahrscheinlich verändert sich Sprache.", "Wichtig ist das gemeinsame Gedächtnis.", "Dennoch deutet jede Generation die Vergangenheit neu.", "In diesem Sinne verändert Migration die Identität."], vocabulary: [["Identität", "identidad"], ["Gedächtnis", "memoria"], ["Migration", "migración"], ["Zugehörigkeit", "pertenencia"], ["Nuance", "matiz"]], readingText: "In einem Kulturpodcast erklärt die Autorin, dass Migration die Identität verändert, ohne das gemeinsame Gedächtnis zu löschen." },
        speaking: { phrases: ["Diesen Punkt teile ich teilweise.", "Anders gesagt...", "Ich würde es nicht ganz ausschließen.", "Man sollte Kontext und Wirkung unterscheiden."], vocabulary: [["Standpunkt", "postura"], ["Nuance", "matiz"], ["Argument", "argumento"], ["Kontext", "contexto"], ["Wirkung", "efecto"]], readingText: "Während eines Seminars stimmt Elena einem Teil des Vorschlags zu, unterscheidet aber sorgfältig zwischen historischem Kontext und sozialer Wirkung." },
        reading: { phrases: ["Der Autor behauptet, dass...", "Aus diesem Beispiel ergibt sich...", "Man sollte die zentrale Metapher beachten.", "Der Schluss erweitert die Anfangsthese."], vocabulary: [["Erzählung", "relato"], ["Macht", "poder"], ["Gemeinschaft", "comunidad"], ["Metapher", "metáfora"], ["These", "tesis"]], readingText: "Der Essay behauptet, dass öffentliche Sprache das kollektive Gedächtnis organisiert. Mit mehreren Metaphern verbindet er Erzählung, Macht und Gemeinschaft." },
        writing: { phrases: ["Das Werk stellt eine entscheidende Frage.", "Sein Ansatz wirkt überzeugend.", "Dennoch fehlt eine wichtige Dimension.", "Insgesamt bietet es eine starke Lektüre."], vocabulary: [["Rezension", "reseña"], ["Ansatz", "enfoque"], ["Auslassung", "omisión"], ["Leser", "lector"], ["Bewertung", "valoración"]], readingText: "Die Rezension betont, dass der Dokumentarfilm eine entscheidende Frage stellt. Sie weist auch auf eine wichtige Auslassung im Ansatz hin." },
        grammar: { phrases: ["Es ist wichtig, dass das Problem anerkannt wird.", "Die Umsetzung der Maßnahme braucht Zeit.", "Eine regelmäßige Überprüfung gilt als wünschenswert.", "Allzu harte Aussagen sollte man vermeiden."], vocabulary: [["Umsetzung", "implementación"], ["Überprüfung", "revisión"], ["Kohäsion", "cohesión"], ["Register", "registro"], ["Präzision", "precisión"]], readingText: "Der Bericht hält eine regelmäßige Überprüfung für wünschenswert. Er betont, dass das Problem in einem präzisen und kohäsiven Register anerkannt werden muss." },
        vocabulary: { phrases: ["Die Evidenz legt eine andere Lesart nahe.", "Diese Perspektive erweitert die Analyse.", "Die Interpretation hängt vom Kontext ab.", "Die Nuance verändert den Schluss."], vocabulary: [["Perspektive", "perspectiva"], ["Interpretation", "interpretación"], ["Evidenz", "evidencia"], ["Schlussfolgerung", "conclusión"], ["Reichweite", "alcance"]], readingText: "Die Interpretation des Artikels ändert sich je nach gewählter Perspektive. Eine kleine Nuance verändert die Reichweite der Schlussfolgerung." }
      },
      C2: {
        listening: { phrases: ["So formuliert wirkt es harmlos.", "Aufschlussreich ist vor allem der Ton.", "Auffällig bleibt das trotzdem.", "Zwischen den Zeilen merkt man eine andere Absicht."], vocabulary: [["Ironie", "ironía"], ["Andeutung", "insinuación"], ["Ton", "tono"], ["Subtext", "subtexto"], ["Betonung", "énfasis"]], readingText: "Im Interview antwortet die Expertin mit scheinbarer Ruhe, doch ihr Ton lässt eine harte Kritik am Projekt erkennen." },
        speaking: { phrases: ["Diesen Punkt räume ich ein, aber...", "Wenn wir die Begriffe schärfen...", "Entscheidend ist nicht nur der Preis.", "Ich schlage einen Mittelweg vor."], vocabulary: [["Zugeständnis", "concesión"], ["Begriff", "término"], ["Mittelweg", "salida"], ["Gleichgewicht", "equilibrio"], ["Priorität", "prioridad"]], readingText: "Während einer Verhandlung gibt die Sprecherin einen Nebenpunkt zu, um ihre Hauptpriorität zu schützen und einen Mittelweg vorzuschlagen." },
        reading: { phrases: ["Der Text setzt einen kundigen Leser voraus.", "Die essayistische Stimme wird schärfer.", "Diese Anspielung ordnet die Deutung neu.", "Der Schluss deutet den Anfang um."], vocabulary: [["Anspielung", "alusión"], ["Voraussetzung", "supuesto"], ["Schluss", "cierre"], ["Deutung", "interpretación"], ["Stimme", "voz"]], readingText: "Die Kritik setzt einen kundigen Leser voraus und nutzt eine historische Anspielung, um den Schluss des Essays neu zu deuten." },
        writing: { phrases: ["Einfachen Antworten sollte man misstrauen.", "Die Debatte verlangt einen weiteren Blick.", "Diese rhetorische Geste ist nicht zufällig.", "Letztlich bleibt die Frage offen."], vocabulary: [["Leitartikel", "editorial"], ["Blick", "mirada"], ["Rhetorik", "retórica"], ["These", "tesis"], ["Schluss", "cierre"]], readingText: "Der Leitartikel misstraut einfachen Antworten. Er fordert einen weiteren Blick und lässt die zentrale Frage offen." },
        grammar: { phrases: ["Nicht nur der Inhalt, auch der Rhythmus ist wichtig.", "Der Bezug muss eindeutig bleiben.", "Diese Wortwahl schärft den Sinn.", "Kohäsion trägt die Autorität des Textes."], vocabulary: [["Rhythmus", "cadencia"], ["Bezug", "referencia"], ["Sinn", "sentido"], ["Kohäsion", "cohesión"], ["Autorität", "autoridad"]], readingText: "Beim Überarbeiten eines Essays ändert die Redakteurin einen unklaren Bezug und eine Wortwahl. So verbessert sie Rhythmus und Kohäsion des Textes." },
        vocabulary: { phrases: ["Die Nuance verändert die Deutung.", "Diese Voreingenommenheit ist nicht harmlos.", "Beredsamkeit kann überzeugen, ohne zu übertreiben.", "Das Register grenzt das Publikum ein."], vocabulary: [["Voreingenommenheit", "sesgo"], ["Beredsamkeit", "elocuencia"], ["Nuance", "matiz"], ["Register", "registro"], ["Überzeugungskraft", "persuasión"]], readingText: "Die Kritik untersucht, wie Voreingenommenheit und Register die Deutung verändern. Sie würdigt auch die Beredsamkeit des Autors, ohne sie mit Übertreibung zu verwechseln." }
      }
    }
  }
};

function toVocabulary(languageKey, items) {
  const makeExample = languageSpecs[languageKey].example;
  return items.map(([word, translation]) => ({ word, translation, example: makeExample(word) }));
}

function buildDialogue(languageKey, phrases) {
  const translations = languageKey === "spanish" ? ["Model line", "Guided reply"] : ["Frase modelo", "Respuesta guiada"];
  return [
    { speaker: "Tutor", line: phrases[0], translation: translations[0] },
    { speaker: "Student", line: phrases[1] || phrases[0], translation: translations[1] }
  ];
}

function buildExercises(lesson) {
  const options = lesson.vocabulary.slice(0, 4).map((item) => item.translation);
  const firstWord = lesson.vocabulary[0]?.word || "";
  const exercises = [
    {
      type: "mcq",
      prompt: `¿Qué significa "${firstWord}"?`,
      options,
      answer: 0
    }
  ];

  const practicePrompts = {
    listening: `Escucha y anota dos detalles clave: ${lesson.mission}`,
    speaking: `Habla durante 45 segundos: ${lesson.mission}`,
    reading: "Lee el texto y resume la idea principal en una frase clara.",
    writing: `Escribe de 4 a 6 frases: ${lesson.mission}`,
    grammar: `Transforma dos oraciones aplicando esta estructura: ${lesson.grammar}`,
    vocabulary: "Usa al menos cuatro palabras nuevas en un mini ejemplo temático."
  };

  exercises.push({
    type: lesson.skill,
    prompt: practicePrompts[lesson.skill],
    answer: "Open answer"
  });

  exercises.push({
    type: "practice",
    prompt: `Usa al menos dos frases modelo: ${lesson.phrases.slice(0, 2).join(" / ")}`,
    answer: "Open answer"
  });

  return exercises;
}

function buildRow(languageKey, level, skill, lessonIndex) {
  const spec = languageSpecs[languageKey];
  const common = commonPlans[level][skill];
  const content = spec.lessons[level][skill];
  const orderIndex = spec.baseOrder + lessonIndex * 10;
  const skillPosition = SKILLS.indexOf(skill);
  const isFree = skillPosition < FREE_SKILL_COUNTS[level];
  const vocabulary = toVocabulary(languageKey, content.vocabulary);
  const row = {
    slug: `${languageKey}-${level.toLowerCase()}-${skill}`,
    target_language: languageKey,
    level,
    skill,
    title: `${spec.label} ${level} · ${SKILL_SUFFIX[skill]}`,
    description: `${spec.levelTitles[level]}: ${common.summary}`,
    order_index: orderIndex,
    estimated_minutes: MINUTES_BY_SKILL[skill],
    is_free: isFree,
    content_json: {
      language: spec.label,
      language_key: languageKey,
      level_title: spec.levelTitles[level],
      intro: common.intro,
      mission: common.mission,
      grammar: common.grammar,
      phrases: content.phrases,
      vocabulary,
      dialogue: buildDialogue(languageKey, content.phrases),
      reading: {
        text: content.readingText,
        questions: common.questions
      },
      exercises: [],
      xp_reward: XP_BY_LEVEL[level],
      access_policy: ACCESS_POLICY
    },
    access_tier: isFree ? "free" : "premium",
    payment_price_usd: 5.95
  };

  row.content_json.exercises = buildExercises({
    skill,
    mission: row.content_json.mission,
    grammar: row.content_json.grammar,
    phrases: row.content_json.phrases,
    vocabulary: row.content_json.vocabulary
  });

  return row;
}

const retained = seed.filter((row) => !["spanish", "italian", "german"].includes(row.target_language));
for (const languageKey of ["spanish", "italian", "german"]) {
  let lessonIndex = 0;
  for (const level of LEVELS) {
    for (const skill of SKILLS) {
      retained.push(buildRow(languageKey, level, skill, lessonIndex));
      lessonIndex += 1;
    }
  }
}

retained.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
fs.writeFileSync(seedPath, JSON.stringify(retained, null, 2) + "\n", "utf8");
console.log("Updated lib/seed-lessons.json");
require(path.join(ROOT, "scripts", "sync-worlds-from-seed.js"));
