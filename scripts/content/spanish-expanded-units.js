// Spanish A2-C2 route curriculum.
// Each level contains 12 thematic units and every unit contains the six
// core skills. The activities share one scenario so moving through the
// route feels like one lesson rather than six unrelated catalog cards.

const LEVEL_CURRICULUM = {
  A2: {
    title: 'Español A2 · Vida cotidiana',
    description:
      'Consolidación del español cotidiano mediante doce unidades sobre servicios, experiencias y planes.',
    units: [
      ['compras-y-cantidades', 'Compras y cantidades', 'Resolver una compra en un mercado', 'Pedir productos, comparar precios y expresar cantidades', 'querer, pedir y expresiones de cantidad', ['mercado', 'precio', 'oferta', 'kilo', 'cambio', 'recibo']],
      ['orientarse-en-la-ciudad', 'Orientarse en la ciudad', 'Ayudar a una visitante a llegar a la estación', 'Pedir y dar indicaciones claras', 'imperativo y preposiciones de lugar', ['esquina', 'cuadra', 'semáforo', 'recto', 'girar', 'estación']],
      ['rutinas-y-horarios', 'Rutinas y horarios', 'Organizar una semana con estudio y trabajo', 'Describir hábitos y cambios temporales', 'presente habitual y estar + gerundio', ['horario', 'turno', 'temprano', 'tarde', 'descanso', 'agenda']],
      ['salud-y-bienestar', 'Salud y bienestar', 'Explicar síntomas en una consulta', 'Hablar de molestias y recomendaciones', 'doler, tener que y deber', ['síntoma', 'dolor', 'cita', 'descansar', 'receta', 'mejorar']],
      ['viajes-y-transporte', 'Viajes y transporte', 'Preparar un viaje de fin de semana', 'Comprar billetes y resolver cambios', 'ir a + infinitivo y futuro próximo', ['billete', 'equipaje', 'andén', 'salida', 'llegada', 'reserva']],
      ['casa-y-barrio', 'Casa y barrio', 'Buscar una vivienda adecuada', 'Describir espacios y comparar opciones', 'comparativos y hay/está', ['alquiler', 'vecindario', 'amueblado', 'luminoso', 'ruido', 'mudanza']],
      ['comidas-y-recetas', 'Comidas y recetas', 'Preparar una comida para amistades', 'Explicar ingredientes y pasos', 'se impersonal e imperativo', ['ingrediente', 'mezclar', 'hervir', 'horno', 'sabor', 'porción']],
      ['recuerdos-y-experiencias', 'Recuerdos y experiencias', 'Contar una experiencia especial', 'Narrar hechos terminados y experiencias', 'pretérito perfecto e indefinido', ['recuerdo', 'viaje', 'anécdota', 'ocurrir', 'disfrutar', 'sorpresa']],
      ['celebraciones', 'Celebraciones', 'Organizar una celebración familiar', 'Invitar, aceptar y rechazar con cortesía', 'pronombres de objeto y quedar', ['invitación', 'regalo', 'reunión', 'celebrar', 'aceptar', 'rechazar']],
      ['estudio-y-aprendizaje', 'Estudio y aprendizaje', 'Preparar un plan de estudio', 'Expresar dificultades y estrategias', 'desde, desde hace y llevar + gerundio', ['apunte', 'repasar', 'tarea', 'plazo', 'practicar', 'progreso']],
      ['tecnologia-cotidiana', 'Tecnología cotidiana', 'Resolver un problema con una aplicación', 'Pedir ayuda y explicar pasos digitales', 'pronombres de complemento y secuenciadores', ['pantalla', 'contraseña', 'archivo', 'descargar', 'conectar', 'cuenta']],
      ['planes-y-proyectos', 'Planes y proyectos', 'Coordinar un proyecto de grupo', 'Proponer, negociar y acordar planes', 'futuro próximo y expresiones de acuerdo', ['propuesta', 'tarea', 'equipo', 'acuerdo', 'fecha', 'resultado']]
    ]
  },
  B1: {
    title: 'Español B1 · Comunicación independiente',
    description:
      'Doce unidades para narrar, justificar opiniones y desenvolverse con autonomía.',
    units: [
      ['historias-personales', 'Historias personales', 'Compartir una experiencia que cambió una decisión', 'Narrar con orden, contexto y detalle', 'contraste entre indefinido e imperfecto', ['etapa', 'decisión', 'cambio', 'mientras', 'de repente', 'aprendizaje']],
      ['trabajo-y-talento', 'Trabajo y talento', 'Preparar una entrevista laboral', 'Presentar experiencia y capacidades', 'pretérito perfecto y perífrasis de capacidad', ['vacante', 'experiencia', 'habilidad', 'entrevista', 'responsable', 'logro']],
      ['viajes-con-imprevistos', 'Viajes con imprevistos', 'Resolver la cancelación de un trayecto', 'Explicar un problema y negociar soluciones', 'condicional de cortesía', ['cancelación', 'retraso', 'reembolso', 'alternativa', 'reclamo', 'seguro']],
      ['medios-y-noticias', 'Medios y noticias', 'Comparar dos versiones de una noticia', 'Resumir información y distinguir opiniones', 'estilo indirecto en presente y pasado', ['titular', 'fuente', 'reportaje', 'rumor', 'comprobar', 'actualidad']],
      ['relaciones-y-convivencia', 'Relaciones y convivencia', 'Resolver un desacuerdo entre compañeros', 'Expresar emociones y buscar acuerdos', 'subjuntivo con emoción y valoración', ['confianza', 'límite', 'acuerdo', 'molestia', 'apoyar', 'convivir']],
      ['consumo-responsable', 'Consumo responsable', 'Elegir entre varias opciones de compra', 'Argumentar una elección responsable', 'oraciones de relativo', ['duradero', 'local', 'etiqueta', 'residuo', 'reutilizar', 'consumo']],
      ['cultura-y-tradiciones', 'Cultura y tradiciones', 'Explicar una tradición a una visitante', 'Describir prácticas sin generalizar', 'se impersonal y pasiva refleja', ['costumbre', 'origen', 'comunidad', 'transmitir', 'patrimonio', 'diversidad']],
      ['educacion-y-metas', 'Educación y metas', 'Elegir un curso de formación', 'Comparar opciones y justificar metas', 'futuro y condicional', ['matrícula', 'beca', 'requisito', 'modalidad', 'meta', 'formación']],
      ['medioambiente-local', 'Medioambiente local', 'Proponer una mejora para el barrio', 'Explicar causas, consecuencias y propuestas', 'condicional real y conectores causales', ['reciclaje', 'contaminación', 'medida', 'recurso', 'reducir', 'impacto']],
      ['salud-y-habitos', 'Salud y hábitos', 'Diseñar una rutina sostenible', 'Dar consejos razonados', 'subjuntivo con recomendación', ['bienestar', 'descanso', 'equilibrio', 'hábito', 'estrés', 'constancia']],
      ['servicios-y-reclamaciones', 'Servicios y reclamaciones', 'Presentar una reclamación respetuosa', 'Describir hechos y solicitar una respuesta', 'pronombres y fórmulas de cortesía', ['avería', 'factura', 'garantía', 'solicitud', 'incidencia', 'solución']],
      ['proyecto-comunitario', 'Proyecto comunitario', 'Presentar una iniciativa vecinal', 'Integrar información y persuadir a un grupo', 'conectores de finalidad y contraste', ['iniciativa', 'voluntariado', 'presupuesto', 'participación', 'beneficio', 'propuesta']]
    ]
  },
  B2: {
    title: 'Español B2 · Argumentación y matices',
    description:
      'Doce unidades para debatir asuntos actuales, evaluar fuentes y producir textos detallados.',
    units: [
      ['identidad-digital', 'Identidad digital', 'Debatir cómo construimos nuestra imagen en internet', 'Evaluar beneficios, riesgos y responsabilidad', 'concesivas aunque, pese a y a pesar de', ['huella digital', 'privacidad', 'perfil', 'exposición', 'reputación', 'consentimiento']],
      ['ciudades-sostenibles', 'Ciudades sostenibles', 'Valorar un nuevo plan de movilidad', 'Contrastar intereses y consecuencias', 'condicionales reales e hipotéticas', ['movilidad', 'peatonal', 'emisiones', 'infraestructura', 'accesibilidad', 'urbanismo']],
      ['trabajo-del-futuro', 'El trabajo del futuro', 'Analizar cambios producidos por la automatización', 'Formular predicciones con cautela', 'futuro compuesto y probabilidad', ['automatización', 'competencia', 'reconversión', 'productividad', 'teletrabajo', 'incertidumbre']],
      ['desinformacion', 'Desinformación', 'Verificar una afirmación viral', 'Evaluar evidencias y explicar dudas', 'estilo indirecto y verbos de transmisión', ['evidencia', 'sesgo', 'verificar', 'fuente primaria', 'engañoso', 'credibilidad']],
      ['turismo-y-comunidad', 'Turismo y comunidad', 'Mediar en un debate sobre turismo local', 'Defender una postura reconociendo límites', 'estructuras de contraste y concesión', ['temporada alta', 'alojamiento', 'residente', 'saturación', 'patrimonio', 'regulación']],
      ['educacion-digital', 'Educación digital', 'Evaluar una propuesta de aprendizaje híbrido', 'Comparar modelos y criterios de calidad', 'relativas explicativas y especificativas', ['alfabetización', 'plataforma', 'evaluación', 'brecha', 'autonomía', 'retroalimentación']],
      ['alimentacion-y-sociedad', 'Alimentación y sociedad', 'Examinar decisiones alimentarias y acceso', 'Relacionar elecciones personales y sistemas', 'pasiva refleja y construcciones impersonales', ['cadena de suministro', 'etiquetado', 'desperdicio', 'acceso', 'nutrición', 'producción']],
      ['arte-y-espacio-publico', 'Arte y espacio público', 'Decidir el uso cultural de una plaza', 'Interpretar propuestas y negociar criterios', 'subjuntivo en relativas y valoración', ['intervención', 'mural', 'financiación', 'audiencia', 'controversia', 'expresión']],
      ['ciencia-y-etica', 'Ciencia y ética', 'Debatir una innovación con impacto social', 'Distinguir hechos, valores y precauciones', 'modales de deducción y probabilidad', ['hallazgo', 'riesgo', 'ensayo', 'regulación', 'principio', 'incertidumbre']],
      ['vivienda-y-desigualdad', 'Vivienda y desigualdad', 'Analizar el aumento del alquiler', 'Explicar causas múltiples y soluciones', 'nominalización y conectores argumentativos', ['alquiler', 'desplazamiento', 'oferta', 'inquilino', 'asequible', 'desigualdad']],
      ['lenguaje-e-inclusion', 'Lenguaje e inclusión', 'Explorar cómo cambia el uso lingüístico', 'Debatir normas, identidad y contexto', 'subjuntivo en opiniones negadas', ['registro', 'inclusión', 'convención', 'identidad', 'uso', 'comunidad']],
      ['foro-de-propuestas', 'Foro de propuestas', 'Presentar una solución a un problema público', 'Sintetizar evidencias y responder objeciones', 'marcadores discursivos complejos', ['planteamiento', 'evidencia', 'objeción', 'viabilidad', 'alcance', 'consenso']]
    ]
  },
  C1: {
    title: 'Español C1 · Expresión precisa',
    description:
      'Doce unidades avanzadas para interpretar discursos, modular el registro y argumentar con precisión.',
    units: [
      ['memoria-y-relato', 'Memoria y relato', 'Interpretar versiones contrapuestas de un recuerdo colectivo', 'Analizar perspectiva, omisiones y encuadre', 'correlación de tiempos y estilo indirecto', ['memoria colectiva', 'testimonio', 'omisión', 'versión', 'evocar', 'reinterpretar']],
      ['retorica-publica', 'Retórica pública', 'Examinar un discurso institucional', 'Reconocer estrategias persuasivas y presuposiciones', 'énfasis, tematización y estructuras hendidas', ['premisa', 'auditorio', 'apelación', 'elocuencia', 'presuposición', 'refutación']],
      ['periodismo-de-investigacion', 'Periodismo de investigación', 'Reconstruir una investigación compleja', 'Jerarquizar pruebas y grados de certeza', 'evidencialidad y modales epistémicos', ['filtración', 'hallazgo', 'indicio', 'contrastar', 'anonimato', 'rendición de cuentas']],
      ['justicia-y-reparacion', 'Justicia y reparación', 'Debatir respuestas a un daño histórico', 'Diferenciar castigo, reparación y garantías', 'subjuntivo en construcciones valorativas', ['reparación', 'agravio', 'garantía', 'reconocimiento', 'responsabilidad', 'reconciliación']],
      ['innovacion-responsable', 'Innovación responsable', 'Evaluar una tecnología antes de adoptarla', 'Ponderar incertidumbre y efectos no previstos', 'condicionales mixtas y contrafactuales', ['precaución', 'impacto', 'despliegue', 'sesgo', 'supervisión', 'trazabilidad']],
      ['literatura-y-voz', 'Literatura y voz', 'Analizar la voz de un relato contemporáneo', 'Interpretar tono, distancia e ironía', 'discurso referido libre y valores verbales', ['narrador', 'ironía', 'ambigüedad', 'perspectiva', 'cadencia', 'desenlace']],
      ['economia-y-cuidados', 'Economía y cuidados', 'Visibilizar trabajos esenciales poco reconocidos', 'Relacionar datos, experiencia y política pública', 'nominalización y densidad informativa', ['cuidados', 'remuneración', 'carga', 'corresponsabilidad', 'sostener', 'invisibilizado']],
      ['diversidad-del-espanol', 'Diversidad del español', 'Comparar usos de distintas comunidades hispanohablantes', 'Explicar variación sin establecer jerarquías', 'variación, registro y adecuación pragmática', ['variedad', 'rasgo', 'hablante', 'prestigio', 'regionalismo', 'adecuación']],
      ['diplomacia-y-negociacion', 'Diplomacia y negociación', 'Mediar entre posiciones incompatibles', 'Reformular, ceder y preservar relaciones', 'atenuación y cortesía avanzada', ['concesión', 'mediación', 'desacuerdo', 'margen', 'compromiso', 'postura']],
      ['critica-cultural', 'Crítica cultural', 'Reseñar una obra para una revista', 'Sustentar una valoración estética matizada', 'adjetivación valorativa y conectores concesivos', ['puesta en escena', 'hallazgo', 'coherencia', 'sugerente', 'convencional', 'recepción']],
      ['politicas-publicas', 'Políticas públicas', 'Evaluar el resultado de una intervención', 'Interpretar indicadores y límites metodológicos', 'impersonales, pasivas y lenguaje técnico', ['indicador', 'cobertura', 'implementación', 'sesgo de selección', 'resultado', 'evaluación']],
      ['coloquio-academico', 'Coloquio académico', 'Defender una tesis ante preguntas críticas', 'Sintetizar fuentes y responder con rigor', 'conectores de reformulación y reserva', ['tesis', 'marco teórico', 'hallazgo', 'objeción', 'alcance', 'metodología']]
    ]
  },
  C2: {
    title: 'Español C2 · Dominio superior',
    description:
      'Doce unidades de dominio experto centradas en interpretación fina, mediación y producción de alta exigencia.',
    units: [
      ['ambiguedad-y-sentido', 'Ambigüedad y sentido', 'Desentrañar un texto deliberadamente ambiguo', 'Interpretar sentidos simultáneos y justificar lecturas', 'polisemia, elipsis y ambigüedad sintáctica', ['polisemia', 'elipsis', 'doble lectura', 'sobreentendido', 'indeterminación', 'matiz']],
      ['humor-e-ironia', 'Humor e ironía', 'Explicar por qué una sátira funciona en su contexto', 'Reconocer implicaturas y límites pragmáticos', 'ironía, eco y discurso polifónico', ['sátira', 'implicatura', 'parodia', 'doble voz', 'burla', 'complicidad']],
      ['traduccion-y-mediacion', 'Traducción y mediación', 'Mediar un concepto sin equivalente exacto', 'Reformular preservando intención y registro', 'equivalencia pragmática y transposición', ['equivalencia', 'calco', 'reformulación', 'pérdida', 'registro', 'mediación']],
      ['filosofia-del-lenguaje', 'Filosofía del lenguaje', 'Debatir cómo las palabras construyen categorías', 'Manejar abstracción y contraargumentos', 'sustantivación y arquitectura argumental', ['referente', 'categoría', 'enunciado', 'convención', 'inferir', 'conceptualizar']],
      ['analisis-juridico', 'Análisis jurídico', 'Interpretar dos lecturas de una norma', 'Distinguir literalidad, finalidad y precedente', 'modalidad deóntica y precisión restrictiva', ['jurisprudencia', 'supuesto', 'alcance', 'disposición', 'interpretación', 'precedente']],
      ['edicion-de-estilo', 'Edición de estilo', 'Editar un ensayo sin borrar la voz del autor', 'Mejorar precisión, cohesión y ritmo', 'cohesión avanzada y puntuación discursiva', ['inciso', 'redundancia', 'cadencia', 'cohesión', 'reescritura', 'voz autoral']],
      ['debate-epistemico', 'Debate epistémico', 'Evaluar qué puede afirmarse a partir de evidencia incompleta', 'Graduar certeza y responsabilidad discursiva', 'evidencialidad y grados de compromiso', ['corroborar', 'plausible', 'refutar', 'provisional', 'inferencia', 'certeza']],
      ['estetica-y-interpretacion', 'Estética e interpretación', 'Comparar marcos críticos sobre una obra', 'Integrar lecturas incompatibles sin simplificarlas', 'metáfora conceptual y lenguaje crítico', ['marco crítico', 'recepción', 'canon', 'ruptura', 'lectura', 'estética']],
      ['discurso-cientifico', 'Discurso científico', 'Convertir resultados especializados para públicos distintos', 'Adaptar densidad y precisión sin distorsionar', 'reformulación explicativa y cautela', ['divulgación', 'muestra', 'limitación', 'hallazgo', 'replicabilidad', 'consenso']],
      ['mediacion-de-conflictos', 'Mediación de conflictos', 'Reformular posiciones en una negociación sensible', 'Detectar necesidades y desbloquear el diálogo', 'atenuación extrema y metapragmática', ['agravio', 'reconocimiento', 'interés', 'escalada', 'reencuadre', 'acuerdo']],
      ['ensayo-de-alta-exigencia', 'Ensayo de alta exigencia', 'Construir una tesis compleja con fuentes divergentes', 'Controlar estructura, voz y contraargumentación', 'progresión temática y cohesión global', ['hipótesis', 'salvedad', 'contraargumento', 'síntesis', 'premisa', 'conclusión']],
      ['defensa-y-sintesis', 'Defensa y síntesis', 'Resolver una misión integradora ante un panel experto', 'Sintetizar, mediar y producir con dominio flexible', 'selección estratégica de todos los recursos C2', ['síntesis', 'criterio', 'matización', 'solvencia', 'perspectiva', 'precisión']]
    ]
  }
};

const SKILL_DEFAULTS = {
  reading: [18, 35],
  listening: [14, 30],
  speaking: [14, 30],
  writing: [18, 35],
  grammar: [14, 30],
  vocabulary: [12, 25]
};

function q(prompt, options, answer, explanation) {
  return { type: 'mcq', prompt, options, answer, explanation };
}

function activity(skill, fields) {
  const [duration, xp] = SKILL_DEFAULTS[skill];
  return { skill, duration, xp, ...fields };
}

const ADVANCED_LEXICON = [
  ['planteamiento', 'alcance', 'contrapunto', 'fundamento'],
  ['premisa', 'matiz', 'implicación', 'deliberación'],
  ['evidencia', 'sesgo', 'consenso', 'discrepancia'],
  ['criterio', 'incertidumbre', 'repercusión', 'salvaguarda'],
  ['perspectiva', 'coherencia', 'viabilidad', 'rendición de cuentas'],
  ['indicio', 'causalidad', 'objeción', 'síntesis']
];

function advancedReadingParagraphs(level, context) {
  if (!['C1', 'C2'].includes(level)) return [];
  const { person, title, scenario, objective, grammar, words } = context;
  const paragraphs = [
    `El caso adquiere mayor complejidad cuando las personas implicadas no comparten la misma definición del problema. Para unas, ${title.toLowerCase()} exige una decisión inmediata; para otras, actuar con rapidez puede ocultar consecuencias difíciles de revertir. ${person} reconstruye ambas posiciones sin reducirlas a una oposición superficial y comprueba qué premisas dependen de datos, cuáles expresan valores y cuáles nacen de experiencias particulares.`,
    `La información disponible tampoco tiene un peso uniforme. Un informe ofrece cifras comparables, mientras que varios testimonios revelan efectos que los promedios no muestran. En vez de enfrentar ambos tipos de evidencia, ${person} pregunta qué puede demostrar cada fuente, qué deja fuera y bajo qué condiciones sería razonable revisar sus conclusiones. Este contraste introduce vocablos como ${words.slice(0, 3).join(', ')}, cuyo sentido cambia ligeramente según el marco utilizado.`,
    `Durante la deliberación surge una objeción sólida: incluso una propuesta bien intencionada puede distribuir de manera desigual los beneficios, los costes y la capacidad de participar. Por eso, ${person} no se limita a defender el resultado esperado. También identifica quién asumiría los riesgos, qué mecanismos de seguimiento serían necesarios y cómo podrían intervenir quienes se vieran afectados por la medida.`,
    `La forma de comunicar la decisión resulta tan importante como su contenido. Aplicar ${grammar} permite graduar la certeza, distinguir una previsión de una afirmación comprobada y reconocer un límite sin debilitar todo el argumento. ${person} evita las fórmulas absolutas y prefiere explicar qué se sabe, qué se infiere y qué sigue siendo discutible. Así, la precisión gramatical funciona como una herramienta de responsabilidad intelectual.`,
    `Al volver al reto —${scenario.toLowerCase()}—, el grupo compara tres alternativas mediante criterios explícitos. Ninguna resuelve por sí sola todas las tensiones. Sin embargo, una combinación gradual permite actuar, observar resultados y corregir el rumbo. La propuesta incorpora plazos, responsables e indicadores comprensibles, de modo que la evaluación posterior no dependa únicamente de impresiones o promesas.`,
    `La conclusión responde al objetivo de ${objective.toLowerCase()}, pero permanece abierta a nueva evidencia. ${person} presenta la opción elegida, resume la mejor objeción y señala la condición que obligaría a modificarla. Esta apertura no equivale a indecisión: muestra que una postura puede ser firme y, al mismo tiempo, revisable cuando cambian los hechos o aparecen consecuencias imprevistas.`
  ];
  if (level === 'C2') {
    paragraphs.push(
      `Una lectura más profunda revela además que el desacuerdo no se refiere solo a los resultados, sino a quién tiene autoridad para definir los criterios legítimos. Las palabras aparentemente neutrales organizan responsabilidades, vuelven visibles unas experiencias y relegan otras. Reconocer esta dimensión discursiva permite evaluar no solo la coherencia interna de cada postura, sino también las condiciones institucionales que la hacen parecer natural.`,
      `Desde esa perspectiva, la solución final no pretende cerrar definitivamente el debate. Su valor reside en hacer explícita la cadena de inferencias, conservar la memoria de las alternativas descartadas y establecer garantías frente a posibles abusos. El dominio C2 se manifiesta aquí en la capacidad de integrar pruebas heterogéneas, voces contrapuestas y matices lingüísticos sin perder claridad ni control del conjunto.`
    );
  }
  return paragraphs;
}

function grammarTest(level, slug, grammar, exercises) {
  const expectedCount = ['C1', 'C2'].includes(level) ? 20 : ['B1', 'B2'].includes(level) ? 15 : 10;
  const promptVariants = [
    (prompt) => prompt,
    (prompt) => `En un registro cuidado, ${prompt.charAt(0).toLowerCase()}${prompt.slice(1)}`,
    (prompt) => `Para mantener la precisión, ${prompt.charAt(0).toLowerCase()}${prompt.slice(1)}`,
    (prompt) => `Dentro de una argumentación coherente, ${prompt.charAt(0).toLowerCase()}${prompt.slice(1)}`,
    (prompt) => `Después de revisar la estructura, ${prompt.charAt(0).toLowerCase()}${prompt.slice(1)}`
  ];
  return {
    id: `spanish-${level.toLowerCase()}-${slug}-grammar-test`,
    passingScore: 70,
    questions: Array.from({ length: expectedCount }, (_, index) => {
      const exercise = exercises[index % exercises.length];
      const shift = index % 4;
      const options = exercise.options.map(
        (_, optionIndex) => exercise.options[(optionIndex + shift) % exercise.options.length]
      );
      const correctIndex = (exercise.answer - shift + exercise.options.length) % exercise.options.length;
      return {
        id: `g${index + 1}`,
        type: 'mcq',
        prompt: promptVariants[Math.floor(index / 4) % promptVariants.length](exercise.prompt),
        options: options.map((text, optionIndex) => ({
          id: `o${optionIndex + 1}`,
          text
        })),
        correctOptionId: `o${correctIndex + 1}`,
        explanation: exercise.explanation,
        difficulty: index < 7 ? 'aplicación' : index < 14 ? 'consolidación' : 'dominio'
      };
    })
  };
}

function buildUnit(level, spec, index) {
  const [slug, title, scenario, objective, grammar, coreWords] = spec;
  const words = ['C1', 'C2'].includes(level)
    ? [...coreWords, ...ADVANCED_LEXICON[index % ADVANCED_LEXICON.length]]
    : coreWords;
  const person = index % 2 ? 'Lucía' : 'Mateo';
  const textParts = [
    `${person} participa en una situación relacionada con ${title.toLowerCase()}. Su reto es ${scenario.toLowerCase()}. Antes de actuar, reúne información, escucha a las personas implicadas y anota las palabras que necesita comprender con precisión.`,
    `La primera opción parece sencilla, pero no responde a todas las necesidades. ${person} compara alternativas, pregunta por sus consecuencias y distingue los hechos comprobables de las opiniones. Así descubre que una respuesta clara también debe reconocer sus límites.`,
    ...advancedReadingParagraphs(level, {
      person,
      title,
      scenario,
      objective,
      grammar,
      words
    }),
    `Finalmente, presenta una propuesta razonada. Explica qué haría, por qué lo haría y qué podría cambiar si aparecieran nuevos datos. La experiencia muestra que comunicarse bien no consiste solo en hablar correctamente, sino en adaptar el mensaje al propósito y a quienes lo reciben.`
  ];
  const text = textParts.join('\n\n');
  const listeningTranscript = `${person}: Necesitamos hablar sobre ${title.toLowerCase()}. ¿Qué información tenemos? Alex: Tenemos varias opciones, pero debemos compararlas con cuidado. ${person}: De acuerdo. Primero aclaremos el objetivo y después decidimos. Alex: Me parece bien; así podremos explicar la propuesta con razones claras.`;
  const readingExercises = [
    q(`¿Cuál es el reto principal de ${person}?`, [scenario, 'Memorizar una lista sin contexto', 'Evitar toda conversación', 'Cambiar de tema'], 0, 'El primer párrafo presenta directamente el reto.'),
    q('¿Qué hace antes de elegir una opción?', ['Decide al azar', 'Compara alternativas y consecuencias', 'Copia una respuesta', 'Ignora a las demás personas'], 1, 'El texto destaca la comparación razonada.'),
    q('¿Qué distingue durante el proceso?', ['Hechos y opiniones', 'Singular y plural solamente', 'Nombres y fechas', 'Vocales y consonantes'], 0, 'La lectura diferencia datos comprobables y opiniones.'),
    q('¿Cómo es la propuesta final?', ['Improvisada y absoluta', 'Razonada y abierta a nueva información', 'Ajena al problema', 'Idéntica a la primera opción'], 1, 'La conclusión conserva razones y reconoce posibles cambios.')
  ];
  const listeningExercises = [
    q('¿Qué propone hacer primero la conversación?', ['Decidir inmediatamente', 'Aclarar el objetivo', 'Cancelar la actividad', 'Buscar otro tema'], 1, 'Los hablantes acuerdan aclarar primero el objetivo.'),
    q('¿Cómo quieren presentar la propuesta?', ['Sin razones', 'Con razones claras', 'Solo por escrito', 'Como una orden'], 1, 'Alex menciona explícitamente razones claras.'),
    q('¿Qué actitud muestran los hablantes?', ['Colaboración', 'Indiferencia', 'Hostilidad', 'Confusión total'], 0, 'Ambos construyen un plan conjunto.')
  ];
  const grammarExercises = [
    q('¿Cuál es el foco gramatical de esta unidad?', [grammar, 'El alfabeto aislado', 'Los números cardinales', 'La ortografía de nombres propios'], 0, `La unidad trabaja ${grammar}.`),
    q('¿Qué opción expresa una idea completa y adecuada al escenario?', [`Aunque faltan datos, podemos formular una propuesta prudente.`, 'Aunque faltan datos podemos propuesta.', 'Datos aunque una formular.', 'Faltan aunque datos propuesta.'], 0, 'La primera opción mantiene cohesión y sentido completo.'),
    q('¿Qué versión muestra mejor una relación lógica?', ['Comparamos las opciones para justificar la decisión.', 'Comparamos las opciones decisión.', 'Para opciones comparamos la.', 'La decisión opciones para.'], 0, 'La finalidad está expresada con claridad.'),
    q('¿Qué oración mantiene un registro claro?', ['Conviene revisar la evidencia antes de concluir.', 'La evidencia concluir antes conviene.', 'Revisar evidencia cosa.', 'Conclusión porque sí.'], 0, 'La primera formulación es precisa y adecuada.')
  ];
  const vocabulary = words.map((word, wordIndex) => ({
    word,
    translation: `English support: ${word}`,
    definition: `Término clave de la unidad «${title}».`,
    example: `${person} usa «${word}» al explicar su propuesta.`,
    partOfSpeech: word.includes(' ') ? 'locución' : 'sustantivo',
    unitOrder: wordIndex + 1
  }));

  return {
    slug,
    title,
    titleEs: title,
    description: scenario,
    order: index + 1,
    accessTier: index < 2 ? 'free' : 'premium',
    unitOverview: {
      objective,
      outcomes: [
        'comprender información oral y escrita dentro del mismo tema',
        'usar vocabulario específico en contexto',
        `aplicar ${grammar}`,
        'producir una respuesta oral y una escrita'
      ],
      grammar: [grammar],
      vocabulary: words,
      scenario
    },
    activities: {
      reading: activity('reading', {
        title: `Lectura · ${title}`,
        description: `Comprende una situación sobre ${title.toLowerCase()}.`,
        intro: `Lee para identificar el reto, las alternativas y la conclusión.`,
        mission: objective,
        reading: {
          title: scenario,
          text,
          questions: readingExercises.slice(0, 3).map((item) => item.prompt)
        },
        exercises: readingExercises
      }),
      listening: activity('listening', {
        title: `Escucha · ${title}`,
        description: `Escucha cómo dos personas organizan una respuesta.`,
        intro: `Identifica el objetivo, el orden de las acciones y el acuerdo final.`,
        mission: `Comprende una conversación auténtica sobre ${title.toLowerCase()}.`,
        listeningType: 'dialogue',
        difficulty: level,
        speakers: [person, 'Alex'],
        transcript: listeningTranscript,
        dialogue: [
          { speaker: person, line: `Necesitamos hablar sobre ${title.toLowerCase()}. ¿Qué información tenemos?`, translation: `We need to talk about ${title.toLowerCase()}. What information do we have?` },
          { speaker: 'Alex', line: 'Tenemos varias opciones, pero debemos compararlas con cuidado.', translation: 'We have several options, but we must compare them carefully.' },
          { speaker: person, line: 'De acuerdo. Primero aclaremos el objetivo y después decidimos.', translation: 'Agreed. First, let us clarify the goal and then decide.' },
          { speaker: 'Alex', line: 'Me parece bien; así podremos explicar la propuesta con razones claras.', translation: 'Sounds good; that way we can explain the proposal with clear reasons.' }
        ],
        phrases: ['¿Qué información tenemos?', 'Debemos compararlas.', 'Primero aclaremos el objetivo.', 'Me parece bien.'],
        exercises: listeningExercises,
        listeningComprehension: {
          id: `spanish-${level.toLowerCase()}-${slug}-listening-comprehension`,
          passingScore: 70,
          questions: listeningExercises.map((exercise, exerciseIndex) => ({
            id: `l${exerciseIndex + 1}`,
            type: 'mcq',
            prompt: exercise.prompt,
            options: exercise.options.map((option, optionIndex) => ({ id: `o${optionIndex + 1}`, text: option })),
            correctOptionId: `o${exercise.answer + 1}`,
            explanation: exercise.explanation
          }))
        }
      }),
      speaking: activity('speaking', {
        title: `Habla · ${title}`,
        description: `Responde oralmente dentro del escenario de la unidad.`,
        intro: scenario,
        mission: `Graba una respuesta de 45–90 segundos: presenta tu propuesta, justifica dos razones y reconoce una posible dificultad.`,
        phrases: ['Desde mi punto de vista…', 'La razón principal es…', 'Sin embargo, conviene considerar…', 'Por eso propongo…'],
        dialogue: [
          { speaker: 'Tutor', line: `¿Qué propones ante esta situación: ${scenario.toLowerCase()}?`, translation: 'What do you propose in this situation?' },
          { speaker: 'Estudiante', line: 'Presento una opción, dos razones y una dificultad posible.', translation: 'I present one option, two reasons, and one possible difficulty.' }
        ],
        exercises: [
          { type: 'practice', prompt: `Explica cómo resolverías este reto: ${scenario}.`, answer: 'Respuesta oral abierta' },
          { type: 'practice', prompt: `Usa al menos dos palabras: ${words.slice(0, 3).join(', ')}.`, answer: 'Respuesta oral abierta' }
        ]
      }),
      writing: activity('writing', {
        title: `Escribe · ${title}`,
        description: `Produce un texto conectado con la misión de la unidad.`,
        intro: `Planifica, redacta y revisa antes de enviar tu texto.`,
        mission: `Escribe ${level === 'A2' ? '90–120' : level === 'B1' ? '130–170' : level === 'B2' ? '180–220' : '230–300'} palabras sobre «${scenario}». Incluye una idea principal, razones y una conclusión.`,
        grammarNote: grammar,
        phrases: ['En primer lugar…', 'Por otra parte…', 'Un ejemplo claro es…', 'En conclusión…'],
        exercises: [
          { type: 'practice', prompt: `Redacta una respuesta organizada para: ${scenario}.`, answer: 'Respuesta escrita abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: `Gramática · ${grammar}`,
        description: `Aplica la forma gramatical dentro del tema «${title}».`,
        intro: `Observa cómo la gramática cambia la precisión y el matiz.`,
        mission: `Usa ${grammar} para explicar y justificar una propuesta.`,
        grammarNote: `Foco: ${grammar}.\n\nUso: conecta las ideas de la unidad y permite expresar relaciones con mayor precisión.\n\nModelo: Aunque faltan datos, podemos comparar las opciones antes de tomar una decisión.`,
        phrases: ['Aunque faltan datos, podemos avanzar.', 'Conviene comparar antes de decidir.', 'La propuesta se revisará si cambia la información.'],
        exercises: grammarExercises,
        grammarTest: grammarTest(level, slug, grammar, grammarExercises)
      }),
      vocabulary: activity('vocabulary', {
        title: `Vocabulario · ${title}`,
        description: `Domina ${words.length} expresiones clave antes de completar la misión.`,
        intro: `Escucha, relaciona y usa cada término dentro de una frase.`,
        mission: `Incorpora al menos cuatro palabras de la unidad en una respuesta propia.`,
        vocabulary,
        exercises: vocabulary.map((item, itemIndex) =>
          q(
            `¿Qué palabra pertenece a la unidad «${title}»?`,
            ['desayuno', item.word, 'zapato', 'ventana'],
            1,
            `«${item.word}» forma parte del vocabulario de esta unidad.`
          )
        )
      })
    }
  };
}

function buildLevel(level) {
  const config = LEVEL_CURRICULUM[level];
  return {
    language: 'spanish',
    level,
    courseTitle: config.title,
    courseDescription: config.description,
    units: config.units.map((unit, index) => buildUnit(level, unit, index))
  };
}

module.exports = {
  LEVELS: Object.keys(LEVEL_CURRICULUM),
  LEVEL_CURRICULUM,
  buildLevel
};
