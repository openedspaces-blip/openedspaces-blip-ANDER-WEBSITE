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

// A2 needs concrete everyday situations, not one reusable dialogue with a
// different unit title. These are the canonical scripts for the revealed
// transcript, the future recorded audio and the comprehension questions.
const A2_LISTENING_SCRIPTS = {
  'compras-y-cantidades': {
    speakers: ['Lucía', 'Mateo'],
    dialogue: [
      ['Lucía', 'Buenos días. Quiero medio kilo de tomates y un kilo de arroz, por favor.'],
      ['Mateo', 'Claro. Los tomates están a tres euros el kilo y el arroz cuesta dos euros.'],
      ['Lucía', 'Entonces, ¿cuánto pago en total?'],
      ['Mateo', 'Son tres euros con cincuenta. Aquí tiene el cambio y el recibo.'],
      ['Lucía', 'Gracias. También voy a llevar esta bolsa de naranjas.']
    ],
    phrases: ['Medio kilo de...', '¿Cuánto pago en total?', 'Aquí tiene el cambio.'],
    exercises: [
      q('¿Qué compra Lucía?', ['Tomates, arroz y naranjas', 'Pan, leche y manzanas', 'Carne y queso', 'Solo arroz'], 0, 'Lucía pide tomates y arroz, y después añade una bolsa de naranjas.'),
      q('¿Cuánto cuestan los tomates?', ['Dos euros el kilo', 'Tres euros el kilo', 'Tres euros con cincuenta', 'Medio euro'], 1, 'Mateo dice que los tomates cuestan tres euros el kilo.'),
      q('¿Qué recibe Lucía al pagar?', ['Una receta', 'Un billete', 'El cambio y el recibo', 'Una tarjeta'], 2, 'Mateo le entrega el cambio y el recibo.')
    ]
  },
  'orientarse-en-la-ciudad': {
    speakers: ['Mateo', 'Lucía'],
    dialogue: [
      ['Mateo', 'Perdona, ¿sabes cómo llegar a la estación de tren?'],
      ['Lucía', 'Sí. Sigue todo recto por esta avenida hasta el semáforo.'],
      ['Mateo', '¿Giro a la derecha en el semáforo?'],
      ['Lucía', 'Exacto. Después camina dos cuadras y verás la estación a tu izquierda.'],
      ['Mateo', 'Perfecto, muchas gracias por la ayuda.']
    ],
    phrases: ['Sigue todo recto.', 'Gira a la derecha.', 'Está a tu izquierda.'],
    exercises: [
      q('¿Adónde quiere ir Mateo?', ['Al mercado', 'A la estación de tren', 'Al banco', 'Al hospital'], 1, 'Mateo pregunta cómo llegar a la estación de tren.'),
      q('¿Qué debe hacer en el semáforo?', ['Girar a la derecha', 'Girar a la izquierda', 'Tomar un autobús', 'Volver dos cuadras'], 0, 'Lucía confirma que debe girar a la derecha.'),
      q('¿Dónde está la estación?', ['A la derecha', 'Frente al semáforo', 'A dos cuadras, a la izquierda', 'Junto al mercado'], 2, 'Después de dos cuadras, la estación queda a la izquierda.')
    ]
  },
  'rutinas-y-horarios': {
    speakers: ['Lucía', 'Mateo'],
    dialogue: [
      ['Lucía', 'Normalmente entro a trabajar a las ocho, pero esta semana empiezo a las diez.'],
      ['Mateo', '¿Por qué cambia tu horario?'],
      ['Lucía', 'Estoy haciendo un curso por las mañanas. Termina a las nueve y media.'],
      ['Mateo', 'Qué bien. ¿Todavía tienes tiempo para descansar?'],
      ['Lucía', 'Sí, organizo mi agenda el domingo y dejo una tarde libre.']
    ],
    phrases: ['Normalmente...', 'Esta semana...', 'Dejo una tarde libre.'],
    exercises: [
      q('¿A qué hora entra Lucía a trabajar esta semana?', ['A las ocho', 'A las nueve y media', 'A las diez', 'A las doce'], 2, 'Esta semana Lucía empieza a trabajar a las diez.'),
      q('¿Qué hace Lucía por las mañanas?', ['Un curso', 'Ejercicio', 'Compras', 'Una reunión'], 0, 'Está haciendo un curso por las mañanas.'),
      q('¿Cuándo organiza su agenda?', ['Cada mañana', 'El domingo', 'Los viernes', 'Después del curso'], 1, 'Lucía dice que organiza su agenda el domingo.')
    ]
  },
  'salud-y-bienestar': {
    speakers: ['Paciente', 'Doctora'],
    dialogue: [
      ['Paciente', 'Doctora, me duele mucho la garganta desde ayer y tengo un poco de fiebre.'],
      ['Doctora', 'Voy a revisarte. ¿Has descansado bien estos días?'],
      ['Paciente', 'No mucho; he trabajado hasta tarde toda la semana.'],
      ['Doctora', 'Parece una infección leve. Debes beber agua, descansar y tomar esta medicina.'],
      ['Paciente', 'De acuerdo. ¿Cuándo debo volver si no mejoro?'],
      ['Doctora', 'Pide otra cita en tres días si continúas con fiebre.']
    ],
    phrases: ['Me duele...', 'Debes descansar.', 'Pide otra cita.'],
    exercises: [
      q('¿Qué le duele al paciente?', ['La espalda', 'La garganta', 'El estómago', 'La pierna'], 1, 'El paciente dice que le duele la garganta.'),
      q('¿Qué recomienda la doctora?', ['Hacer deporte', 'Trabajar más', 'Beber agua y descansar', 'No tomar medicina'], 2, 'La doctora recomienda agua, descanso y medicina.'),
      q('¿Cuándo debe volver el paciente?', ['Mañana', 'En una semana', 'Si sigue con fiebre en tres días', 'Nunca'], 2, 'Debe pedir otra cita si sigue con fiebre en tres días.')
    ]
  },
  'viajes-y-transporte': {
    speakers: ['Lucía', 'Empleado'],
    dialogue: [
      ['Lucía', 'Hola. Mi tren a Valencia sale a las seis, pero mi billete dice andén cuatro.'],
      ['Empleado', 'Hoy hay un cambio: el tren va a salir del andén seis.'],
      ['Lucía', 'Gracias. ¿Va a llegar a la misma hora?'],
      ['Empleado', 'Sí, la llegada está prevista para las ocho y veinte.'],
      ['Lucía', 'Perfecto. Voy a dejar mi equipaje en la consigna antes de subir.']
    ],
    phrases: ['Hay un cambio.', 'La llegada está prevista para...', 'Voy a dejar el equipaje.'],
    exercises: [
      q('¿A qué ciudad viaja Lucía?', ['Madrid', 'Valencia', 'Sevilla', 'Barcelona'], 1, 'Lucía pregunta por su tren a Valencia.'),
      q('¿De qué andén saldrá el tren?', ['Del andén cuatro', 'Del andén cinco', 'Del andén seis', 'Del andén ocho'], 2, 'El empleado informa que saldrá del andén seis.'),
      q('¿Qué hará Lucía antes de subir?', ['Comprará otro billete', 'Dejará su equipaje', 'Cambiará de tren', 'Llamará al hotel'], 1, 'Lucía va a dejar el equipaje en la consigna.')
    ]
  },
  'casa-y-barrio': {
    speakers: ['Mateo', 'Agente'],
    dialogue: [
      ['Mateo', 'Me interesa el apartamento de la calle Mayor. ¿Está amueblado?'],
      ['Agente', 'Sí, tiene muebles básicos y mucha luz por la mañana.'],
      ['Mateo', '¿Cómo es el vecindario? Trabajo desde casa y necesito tranquilidad.'],
      ['Agente', 'Es una zona segura y hay poco ruido, aunque el alquiler es un poco más alto.'],
      ['Mateo', 'Entiendo. Voy a visitarlo el sábado antes de decidir.']
    ],
    phrases: ['¿Está amueblado?', 'Hay poco ruido.', 'Voy a visitarlo.'],
    exercises: [
      q('¿Qué busca Mateo?', ['Un hotel', 'Un apartamento', 'Una oficina', 'Una habitación de hospital'], 1, 'Mateo pregunta por un apartamento.'),
      q('¿Qué necesita Mateo para trabajar?', ['Un balcón grande', 'Tranquilidad', 'Un garaje', 'Una piscina'], 1, 'Trabaja desde casa y necesita tranquilidad.'),
      q('¿Qué hará antes de decidir?', ['Firmar hoy', 'Hablar con su jefe', 'Visitar el apartamento', 'Buscar otro barrio'], 2, 'Mateo dice que va a visitarlo el sábado.')
    ]
  },
  'comidas-y-recetas': {
    speakers: ['Lucía', 'Mateo'],
    dialogue: [
      ['Lucía', 'Para la cena vamos a preparar una sopa de verduras. ¿Tenemos todos los ingredientes?'],
      ['Mateo', 'Tenemos papas, zanahorias y cebolla, pero falta un poco de caldo.'],
      ['Lucía', 'Yo compro el caldo. Después se cortan las verduras y se hierven veinte minutos.'],
      ['Mateo', '¿Añadimos sal al principio o al final?'],
      ['Lucía', 'Al final, para probar mejor el sabor.']
    ],
    phrases: ['Falta un poco de...', 'Se cortan...', 'Al final.'],
    exercises: [
      q('¿Qué van a preparar?', ['Una ensalada', 'Una sopa de verduras', 'Una pizza', 'Un pastel'], 1, 'Lucía propone preparar una sopa de verduras.'),
      q('¿Qué ingrediente falta?', ['Papas', 'Zanahorias', 'Cebolla', 'Caldo'], 3, 'Mateo dice que falta un poco de caldo.'),
      q('¿Cuándo añaden la sal?', ['Al principio', 'Al final', 'Antes de cortar las verduras', 'No añaden sal'], 1, 'Lucía prefiere añadirla al final.')
    ]
  },
  'recuerdos-y-experiencias': {
    speakers: ['Mateo', 'Lucía'],
    dialogue: [
      ['Mateo', 'El verano pasado viajé a Oaxaca con mi hermana y probamos muchos platos nuevos.'],
      ['Lucía', '¿Qué fue lo que más te gustó del viaje?'],
      ['Mateo', 'Una tarde visitamos un mercado pequeño y una señora nos enseñó a preparar chocolate.'],
      ['Lucía', 'Qué experiencia tan bonita. ¿Volviste a verla?'],
      ['Mateo', 'No, pero le envié una foto cuando llegué a casa.']
    ],
    phrases: ['El verano pasado...', 'Lo que más me gustó...', 'Cuando llegué a casa.'],
    exercises: [
      q('¿Adónde viajó Mateo?', ['A Oaxaca', 'A Lima', 'A Bogotá', 'A Madrid'], 0, 'Mateo cuenta que viajó a Oaxaca.'),
      q('¿Qué le enseñó una señora?', ['A bailar', 'A preparar chocolate', 'A hablar inglés', 'A hacer una reserva'], 1, 'En el mercado una señora les enseñó a preparar chocolate.'),
      q('¿Qué hizo Mateo al llegar a casa?', ['Volvió al mercado', 'Envió una foto', 'Compró chocolate', 'Llamó a Lucía'], 1, 'Mateo dice que le envió una foto.')
    ]
  },
  celebraciones: {
    speakers: ['Lucía', 'Mateo'],
    dialogue: [
      ['Lucía', 'El sábado es el cumpleaños de mi abuela. ¿Puedes venir a la reunión?'],
      ['Mateo', 'Me encantaría. ¿A qué hora quedan?'],
      ['Lucía', 'A las cinco en casa de mis tíos. No hace falta que traigas regalo.'],
      ['Mateo', 'Entonces llevo un postre para compartir.'],
      ['Lucía', 'Qué buena idea. Mi abuela va a estar muy contenta.']
    ],
    phrases: ['¿Puedes venir?', '¿A qué hora quedan?', 'No hace falta que...'],
    exercises: [
      q('¿Qué celebración organiza Lucía?', ['Una boda', 'El cumpleaños de su abuela', 'Una graduación', 'Una cena de trabajo'], 1, 'Lucía habla del cumpleaños de su abuela.'),
      q('¿A qué hora es la reunión?', ['A las tres', 'A las cuatro', 'A las cinco', 'A las siete'], 2, 'Quedan a las cinco.'),
      q('¿Qué llevará Mateo?', ['Un regalo caro', 'Un postre', 'Flores', 'Nada'], 1, 'Mateo propone llevar un postre para compartir.')
    ]
  },
  'estudio-y-aprendizaje': {
    speakers: ['Mateo', 'Lucía'],
    dialogue: [
      ['Mateo', 'Tengo un examen dentro de dos semanas y todavía no termino los apuntes.'],
      ['Lucía', 'Puedes hacer un plan: repasa un tema cada día y deja el domingo para practicar.'],
      ['Mateo', 'Buena idea. Desde enero llevo estudiando una hora después de cenar.'],
      ['Lucía', 'Entonces ya tienes una rutina. Solo necesitas dividir las tareas por plazo.'],
      ['Mateo', 'Hoy mismo voy a organizar el calendario.']
    ],
    phrases: ['Dentro de dos semanas.', 'Llevo estudiando...', 'Dividir las tareas.'],
    exercises: [
      q('¿Cuándo tiene Mateo el examen?', ['Mañana', 'Dentro de dos semanas', 'El domingo', 'En enero'], 1, 'Mateo tiene el examen dentro de dos semanas.'),
      q('¿Qué recomienda Lucía para el domingo?', ['Descansar todo el día', 'Practicar', 'Ir de compras', 'Escribir apuntes nuevos'], 1, 'Lucía propone dejar el domingo para practicar.'),
      q('¿Qué hará Mateo hoy?', ['Organizar el calendario', 'Cambiar de curso', 'Cancelar el examen', 'Comprar apuntes'], 0, 'Mateo dice que organizará el calendario.')
    ]
  },
  'tecnologia-cotidiana': {
    speakers: ['Lucía', 'Soporte'],
    dialogue: [
      ['Lucía', 'No puedo entrar en mi cuenta porque olvidé la contraseña.'],
      ['Soporte', 'No se preocupe. En la pantalla de inicio, pulse “Recuperar contraseña”.'],
      ['Lucía', '¿Después recibo un mensaje en mi correo?'],
      ['Soporte', 'Sí. Abra el enlace, cree una contraseña nueva y no la comparta con nadie.'],
      ['Lucía', 'Perfecto, ya veo el mensaje. Muchas gracias.']
    ],
    phrases: ['Olvidé la contraseña.', 'Pulse...', 'No la comparta con nadie.'],
    exercises: [
      q('¿Cuál es el problema de Lucía?', ['No tiene teléfono', 'Olvidó la contraseña', 'No encuentra un archivo', 'Su pantalla está rota'], 1, 'Lucía no puede entrar porque olvidó la contraseña.'),
      q('¿Qué debe pulsar Lucía?', ['Crear una cuenta', 'Recuperar contraseña', 'Cerrar sesión', 'Descargar archivo'], 1, 'Soporte le indica pulsar “Recuperar contraseña”.'),
      q('¿Qué recomendación recibe?', ['Compartir la clave', 'Cambiar de correo', 'No compartir la contraseña', 'Apagar la pantalla'], 2, 'Soporte indica que no comparta la contraseña.')
    ]
  },
  'planes-y-proyectos': {
    speakers: ['Mateo', 'Lucía'],
    dialogue: [
      ['Mateo', 'Tenemos que presentar el proyecto el viernes. ¿Cómo repartimos las tareas?'],
      ['Lucía', 'Yo puedo preparar las diapositivas y tú puedes revisar los datos.'],
      ['Mateo', 'De acuerdo. También necesitamos una propuesta clara para el equipo.'],
      ['Lucía', 'Quedamos el miércoles para ver el resultado y hacer cambios si hace falta.'],
      ['Mateo', 'Perfecto. Voy a enviar el acuerdo al grupo esta tarde.']
    ],
    phrases: ['Repartir las tareas.', 'Quedamos el miércoles.', 'Si hace falta.'],
    exercises: [
      q('¿Cuándo presentan el proyecto?', ['El miércoles', 'El viernes', 'Esta tarde', 'El lunes'], 1, 'Mateo dice que presentan el proyecto el viernes.'),
      q('¿Qué tarea hará Lucía?', ['Revisar los datos', 'Preparar las diapositivas', 'Enviar el acuerdo', 'Cancelar la reunión'], 1, 'Lucía se ofrece a preparar las diapositivas.'),
      q('¿Para qué quedan el miércoles?', ['Para celebrar', 'Para elegir otro proyecto', 'Para revisar el resultado', 'Para viajar'], 2, 'Quedan para ver el resultado y hacer cambios si hace falta.')
    ]
  }
};

// Each extension reinforces the matching unit's reading, vocabulary and grammar.
const A2_LISTENING_EXTENSIONS = {
  'compras-y-cantidades': [['Mateo', 'La bolsa cuesta un euro más. ¿Quiere pagar con tarjeta o en efectivo?'], ['Lucía', 'Con tarjeta, por favor. Gracias por explicarme el total.']],
  'orientarse-en-la-ciudad': [['Lucía', 'No cruce la plaza; la estación está detrás del museo, junto a la farmacia.'], ['Mateo', 'Entendido: sigo recto, giro a la derecha y camino dos cuadras.']],
  'rutinas-y-horarios': [['Mateo', 'Mientras haces el curso, ¿quién responde los mensajes del trabajo?'], ['Lucía', 'Mi compañera los revisa y yo contesto cuando termino la clase.']],
  'salud-y-bienestar': [['Doctora', 'No tienes que ir al trabajo mañana si te sientes peor.'], ['Paciente', 'Seguiré las indicaciones y llamaré para pedir la cita si continúa la fiebre.']],
  'viajes-y-transporte': [['Empleado', 'Recuerde estar en el andén diez minutos antes de la salida.'], ['Lucía', 'Sí, voy a mirar el panel otra vez después de dejar la maleta.']],
  'casa-y-barrio': [['Agente', 'La sala es más luminosa que la del otro apartamento y el metro está cerca.'], ['Mateo', 'Eso me conviene; necesito un lugar tranquilo, pero también bien comunicado.']],
  'comidas-y-recetas': [['Mateo', 'Después de hervir la sopa, ¿la mezclamos o dejamos los trozos enteros?'], ['Lucía', 'Déjalos enteros y añade el caldo poco a poco para que no quede muy líquida.']],
  'recuerdos-y-experiencias': [['Lucía', '¿Has vuelto a probar ese chocolate desde aquel viaje?'], ['Mateo', 'Sí, lo he preparado varias veces, pero nunca sabe igual que el del mercado.']],
  celebraciones: [['Mateo', 'Te lo llevo antes de las cinco para que no tengas que preparar todo sola.'], ['Lucía', 'Gracias, así podemos recibir a la familia con calma cuando llegue.']],
  'estudio-y-aprendizaje': [['Lucía', 'Si completas cada tema, podrás comprobar tu progreso con un ejercicio corto.'], ['Mateo', 'Haré eso; llevo dos meses estudiando y quiero llegar al examen con confianza.']],
  'tecnologia-cotidiana': [['Soporte', 'Primero compruebe que el correo llegó a la bandeja de entrada, no al spam.'], ['Lucía', 'Ya lo encontré; después crearé una clave segura y guardaré el acceso.']],
  'planes-y-proyectos': [['Lucía', 'Si terminamos el borrador el miércoles, tendremos tiempo para ensayar la presentación.'], ['Mateo', 'Perfecto: yo revisaré los datos hoy y enviaré la versión final al equipo mañana.']]
};

for (const [slug, lines] of Object.entries(A2_LISTENING_EXTENSIONS)) {
  A2_LISTENING_SCRIPTS[slug].dialogue.push(...lines);
}

const A2_LISTENING_MONOLOGUES = {
  'compras-y-cantidades': 'Esta mañana fui al mercado para comprar medio kilo de tomates, un kilo de arroz y una bolsa de naranjas. Los tomates costaban tres euros el kilo y el arroz costaba dos euros. El vendedor calculó el total y me explicó que la bolsa costaba un euro más. Decidí pagar con tarjeta. Antes de irme, comprobé el recibo y guardé bien mi compra.',
  'orientarse-en-la-ciudad': 'Hoy necesito llegar a la estación de tren, pero no conozco bien esta parte de la ciudad. Debo seguir recto por la avenida hasta el semáforo, girar a la derecha y caminar dos cuadras. La estación queda a mi izquierda, detrás del museo y junto a la farmacia. No debo cruzar la plaza. Repito las indicaciones antes de continuar para no perderme.',
  'rutinas-y-horarios': 'Normalmente entro a trabajar a las ocho, pero esta semana empiezo a las diez porque estoy haciendo un curso por las mañanas. El curso termina a las nueve y media. Para organizarme mejor, preparo mi agenda el domingo y dejo una tarde libre. Mientras estoy en clase, una compañera revisa los mensajes del trabajo. Después respondo lo más urgente y continúo con mi jornada.',
  'salud-y-bienestar': 'Desde ayer me duele la garganta y tengo un poco de fiebre. Esta semana he trabajado hasta tarde y no he descansado bien. Por eso fui a la doctora. Ella cree que tengo una infección leve y me recomienda beber agua, descansar y tomar la medicina. Si continúo con fiebre, debo pedir otra cita en tres días. Mañana no iré al trabajo si me siento peor.',
  'viajes-y-transporte': 'Hoy viajo a Valencia en un tren que sale a las seis. Mi billete indicaba el andén cuatro, pero han cambiado la salida al andén seis. La llegada sigue prevista para las ocho y veinte. Antes de subir, voy a dejar mi equipaje en la consigna y miraré el panel otra vez. Debo estar en el andén diez minutos antes para viajar con tranquilidad.',
  'casa-y-barrio': 'Estoy buscando un apartamento en la calle Mayor. Me interesa porque tiene muebles básicos y mucha luz por la mañana. Como trabajo desde casa, necesito tranquilidad. El barrio es seguro y hay poco ruido, aunque el alquiler es un poco más alto. La sala es más luminosa que la del otro apartamento y el metro está cerca. Voy a visitarlo el sábado antes de decidir.',
  'comidas-y-recetas': 'Esta noche voy a preparar una sopa de verduras. Tengo papas, zanahorias y cebolla, pero me falta un poco de caldo. Primero corto las verduras y después las hiervo durante veinte minutos. Añado la sal al final para comprobar mejor el sabor. Prefiero dejar los trozos enteros y agregar el caldo poco a poco para que la sopa no quede demasiado líquida.',
  'recuerdos-y-experiencias': 'El verano pasado viajé a Oaxaca con mi hermana y probamos muchos platos nuevos. Una tarde visitamos un mercado pequeño. Allí una señora nos enseñó a preparar chocolate. No volví a verla, pero le envié una foto cuando llegué a casa. Desde aquel viaje he preparado ese chocolate varias veces. Sin embargo, nunca sabe igual que el que probé en aquel mercado.',
  celebraciones: 'El sábado celebramos el cumpleaños de mi abuela. La familia se reúne a las cinco en casa de mis tíos. He invitado a un amigo y le he explicado que no hace falta llevar un regalo. Él prefiere traer un postre para compartir y va a entregarlo antes de las cinco. Así no tengo que preparar todo sola. Creo que mi abuela estará muy contenta.',
  'estudio-y-aprendizaje': 'Tengo un examen dentro de dos semanas y todavía no termino mis apuntes. Voy a repasar un tema cada día y dejaré el domingo para practicar. Llevo dos meses estudiando una hora después de cenar, así que ya tengo una rutina. Hoy organizaré el calendario y dividiré las tareas. Cuando complete cada tema, haré un ejercicio corto para comprobar mi progreso y llegar al examen con confianza.',
  'tecnologia-cotidiana': 'No puedo entrar en mi cuenta porque olvidé la contraseña. Primero debo pulsar “Recuperar contraseña” en la pantalla de inicio. Después tengo que revisar mi correo y abrir el enlace recibido. Voy a comprobar que el mensaje llegó a la bandeja de entrada y no al spam. Finalmente crearé una clave segura, guardaré el acceso y no compartiré mi contraseña con nadie.',
  'planes-y-proyectos': 'Tengo que presentar un proyecto con mi compañera el viernes. Yo voy a revisar los datos y ella preparará las diapositivas. El miércoles nos reuniremos para revisar el resultado y cambiar lo necesario. Si terminamos el borrador ese día, tendremos tiempo para ensayar la presentación. Hoy revisaré la información y mañana enviaré la versión final al equipo para que todos conozcan el acuerdo.'
};

for (const [slug, transcript] of Object.entries(A2_LISTENING_MONOLOGUES)) {
  Object.assign(A2_LISTENING_SCRIPTS[slug], { speakers: ['Narrador/a'], transcript });
}

function grammarTest(level, slug, grammar, exercises) {
  return {
    id: `spanish-${level.toLowerCase()}-${slug}-grammar-test`,
    passingScore: 70,
    questions: exercises.map((exercise, index) => ({
      id: `g${index + 1}`,
      type: 'mcq',
      prompt: exercise.prompt,
      options: exercise.options.map((text, optionIndex) => ({
        id: `o${optionIndex + 1}`,
        text
      })),
      correctOptionId: `o${exercise.answer + 1}`,
      explanation: exercise.explanation
    }))
  };
}

function buildUnit(level, spec, index) {
  const [slug, title, scenario, objective, grammar, words] = spec;
  const person = index % 2 ? 'Lucía' : 'Mateo';
  const authoredListening = level === 'A2' ? A2_LISTENING_SCRIPTS[slug] : null;
  const text = [
    `${person} participa en una situación relacionada con ${title.toLowerCase()}. Su reto es ${scenario.toLowerCase()}. Antes de actuar, reúne información, escucha a las personas implicadas y anota las palabras que necesita comprender con precisión.`,
    `La primera opción parece sencilla, pero no responde a todas las necesidades. ${person} compara alternativas, pregunta por sus consecuencias y distingue los hechos comprobables de las opiniones. Así descubre que una respuesta clara también debe reconocer sus límites.`,
    `Finalmente, presenta una propuesta razonada. Explica qué haría, por qué lo haría y qué podría cambiar si aparecieran nuevos datos. La experiencia muestra que comunicarse bien no consiste solo en hablar correctamente, sino en adaptar el mensaje al propósito y a quienes lo reciben.`
  ].join('\n\n');
  const fallbackDialogue = [
    [person, `Necesitamos hablar sobre ${title.toLowerCase()}. ¿Qué información tenemos?`],
    ['Alex', 'Tenemos varias opciones, pero debemos compararlas con cuidado.'],
    [person, 'De acuerdo. Primero aclaremos el objetivo y después decidimos.'],
    ['Alex', 'Me parece bien; así podremos explicar la propuesta con razones claras.']
  ];
  const listeningLines = authoredListening?.dialogue || fallbackDialogue;
  const listeningDialogue = authoredListening?.transcript ? [] : listeningLines.map(([speaker, line]) => ({ speaker, line }));
  const listeningTranscript = authoredListening?.transcript || listeningDialogue.map(({ speaker, line }) => `${speaker}: ${line}`).join(' ');
  const readingExercises = [
    q(`¿Cuál es el reto principal de ${person}?`, [scenario, 'Memorizar una lista sin contexto', 'Evitar toda conversación', 'Cambiar de tema'], 0, 'El primer párrafo presenta directamente el reto.'),
    q('¿Qué hace antes de elegir una opción?', ['Decide al azar', 'Compara alternativas y consecuencias', 'Copia una respuesta', 'Ignora a las demás personas'], 1, 'El texto destaca la comparación razonada.'),
    q('¿Qué distingue durante el proceso?', ['Hechos y opiniones', 'Singular y plural solamente', 'Nombres y fechas', 'Vocales y consonantes'], 0, 'La lectura diferencia datos comprobables y opiniones.'),
    q('¿Cómo es la propuesta final?', ['Improvisada y absoluta', 'Razonada y abierta a nueva información', 'Ajena al problema', 'Idéntica a la primera opción'], 1, 'La conclusión conserva razones y reconoce posibles cambios.')
  ];
  const genericListeningExercises = [
    q('¿Qué propone hacer primero la conversación?', ['Decidir inmediatamente', 'Aclarar el objetivo', 'Cancelar la actividad', 'Buscar otro tema'], 1, 'Los hablantes acuerdan aclarar primero el objetivo.'),
    q('¿Cómo quieren presentar la propuesta?', ['Sin razones', 'Con razones claras', 'Solo por escrito', 'Como una orden'], 1, 'Alex menciona explícitamente razones claras.'),
    q('¿Qué actitud muestran los hablantes?', ['Colaboración', 'Indiferencia', 'Hostilidad', 'Confusión total'], 0, 'Ambos construyen un plan conjunto.')
  ];
  const listeningExercises = authoredListening?.exercises || genericListeningExercises;
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
        listeningType: authoredListening?.transcript ? 'story' : 'dialogue',
        difficulty: level,
        speakers: authoredListening?.speakers || [person, 'Alex'],
        transcript: listeningTranscript,
        dialogue: listeningDialogue,
        phrases: authoredListening?.phrases || ['¿Qué información tenemos?', 'Debemos compararlas.', 'Primero aclaremos el objetivo.', 'Me parece bien.'],
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
        description: `Domina seis expresiones clave antes de completar la misión.`,
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
