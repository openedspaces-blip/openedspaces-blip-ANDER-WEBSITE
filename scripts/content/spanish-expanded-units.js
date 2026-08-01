// Spanish A2-C2 route curriculum.
// Each level contains 12 thematic units and every unit contains the six
// core skills. The activities share one scenario so moving through the
// route feels like one lesson rather than six unrelated catalog cards.
const {
  transcripts: B1_B2_LISTENING_TRANSCRIPTS,
  formats: B1_B2_LISTENING_FORMATS,
  progressiveExtensions: B1_B2_LISTENING_PROGRESSIVE_EXTENSIONS
} = require('./spanish-b1-b2-listening-transcripts');

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
      ['memoria-y-relato', '¿La inteligencia artificial está cambiando nuestra manera de pensar?', 'Explorar cómo la IA transforma la memoria, el criterio y la toma de decisiones', 'Usar herramientas de IA sin renunciar al pensamiento crítico', 'matización, subordinación concesiva y evidencialidad', ['autonomía', 'sesgo', 'verificar', 'evidencia', 'trazabilidad', 'criterio']],
      ['retorica-publica', 'De empleado a emprendedor digital: una historia de reinvención', 'Escuchar el recorrido de una persona que rediseñó su vida profesional', 'Interpretar decisiones, riesgos y cambios de identidad laboral', 'variación, registro y adecuación pragmática', ['reinventarse', 'incertidumbre', 'proyecto', 'riesgo', 'aprendizaje', 'trayectoria']],
      ['periodismo-de-investigacion', 'El día que Internet desapareció durante 24 horas', 'Seguir las consecuencias cotidianas de una caída total de conexión', 'Relacionar dependencia digital, servicios esenciales y respuestas colectivas', 'conectores causales, consecutivos y concesivos', ['conexión', 'colapso', 'infraestructura', 'emergencia', 'alternativa', 'dependencia']],
      ['justicia-y-reparacion', 'Vivir un año en otro país cambió mi forma de ver el mundo', 'Conocer un testimonio de adaptación cultural y distancia emocional', 'Reconocer cómo la experiencia intercultural modifica certezas y pertenencias', 'subjuntivo en construcciones valorativas', ['desarraigo', 'costumbre', 'pertenencia', 'perspectiva', 'adaptación', 'contraste']],
      ['innovacion-responsable', '¿Por qué sufrimos el síndrome del impostor?', 'Examinar las dudas que aparecen incluso ante logros comprobables', 'Distinguir autoexigencia, inseguridad y evaluación realista', 'condicionales mixtas y contrafactuales', ['autoexigencia', 'mérito', 'inseguridad', 'validación', 'logro', 'percepción']],
      ['literatura-y-voz', 'Cómo una pequeña startup terminó revolucionando una industria', 'Reconstruir el crecimiento inesperado de una empresa emergente', 'Analizar innovación, oportunidad y transformación de un mercado', 'discurso referido libre y valores verbales', ['startup', 'prototipo', 'inversión', 'escala', 'disrupción', 'mercado']],
      ['economia-y-cuidados', '¿Trabajar cuatro días a la semana realmente funciona?', 'Contrastar productividad, descanso y organización laboral', 'Argumentar sobre condiciones y límites de una semana laboral más corta', 'nominalización y densidad informativa', ['jornada', 'productividad', 'descanso', 'flexibilidad', 'rendimiento', 'conciliación']],
      ['diversidad-del-espanol', 'Dormimos menos que nunca: el costo invisible del cansancio', 'Explorar cómo el descanso insuficiente afecta decisiones y relaciones', 'Explicar hábitos, consecuencias y límites del autocuidado', 'variación, registro y adecuación pragmática', ['sueño', 'agotamiento', 'rutina', 'recuperación', 'atención', 'bienestar']],
      ['diplomacia-y-negociacion', 'La presión mental detrás del deporte de alto rendimiento', 'Escuchar la experiencia de un atleta frente a la exigencia constante', 'Reconocer el vínculo entre rendimiento, expectativas y salud mental', 'atenuación y cortesía avanzada', ['presión', 'rendimiento', 'expectativa', 'lesión', 'equilibrio', 'acompañamiento']],
      ['critica-cultural', 'La decisión que tomé en cinco segundos cambió mi vida', 'Seguir una narración sobre una elección breve y sus consecuencias', 'Interpretar azar, responsabilidad y decisiones bajo presión', 'adjetivación valorativa y conectores concesivos', ['instante', 'decisión', 'consecuencia', 'duda', 'oportunidad', 'rumbo']],
      ['politicas-publicas', '¿Las redes sociales nos acercan o nos aíslan?', 'Contrastar vínculos digitales, atención y soledad contemporánea', 'Evaluar beneficios y riesgos de la conexión permanente', 'impersonales, pasivas y lenguaje técnico', ['vínculo', 'aislamiento', 'interacción', 'presencia', 'algoritmo', 'comunidad']],
      ['coloquio-academico', 'Aprender un idioma después de los cincuenta años', 'Conocer una historia de aprendizaje adulto y persistencia', 'Cuestionar prejuicios sobre edad, memoria y aprendizaje', 'conectores de reformulación y reserva', ['constancia', 'memoria', 'fluidez', 'práctica', 'confianza', 'progreso']]
    ]
  },
  C2: {
    title: 'Español C2 · Dominio superior',
    description:
      'Doce unidades de dominio experto centradas en interpretación fina, mediación y producción de alta exigencia.',
    units: [
      ['ambiguedad-y-sentido', 'Cómo los algoritmos deciden lo que ves cada día', 'Investigar cómo las plataformas ordenan noticias, videos y recomendaciones', 'Reconstruir las decisiones invisibles que moldean la atención cotidiana', 'polisemia, elipsis y ambigüedad sintáctica', ['algoritmo', 'recomendación', 'perfil', 'atención', 'sesgo', 'opacidad']],
      ['humor-e-ironia', 'Dentro de una empresa de inteligencia artificial', 'Entrar en las tensiones éticas y operativas de una compañía de IA', 'Interpretar innovación, competencia y responsabilidad desde dentro', 'ironía, eco y discurso polifónico', ['modelo', 'entrenamiento', 'datos', 'despliegue', 'supervisión', 'riesgo']],
      ['traduccion-y-mediacion', 'Un corresponsal de guerra cuenta lo que nunca salió en televisión', 'Escuchar el relato de quien informa desde un conflicto armado', 'Distinguir testimonio, censura, seguridad y responsabilidad periodística', 'equivalencia pragmática y transposición', ['corresponsal', 'conflicto', 'testimonio', 'censura', 'fuente', 'riesgo']],
      ['filosofia-del-lenguaje', 'La nueva carrera espacial: ¿quién conquistará Marte primero?', 'Examinar las ambiciones científicas, comerciales y geopolíticas de Marte', 'Cuestionar la idea de conquista y sus implicaciones éticas', 'sustantivación y arquitectura argumental', ['misión', 'órbita', 'exploración', 'soberanía', 'cooperación', 'colonización']],
      ['analisis-juridico', 'Viví un año sin redes sociales: esto fue lo que aprendí', 'Escuchar un testimonio sobre desconexión, atención y relaciones', 'Evaluar qué cambia cuando desaparece la exposición permanente', 'modalidad deóntica y precisión restrictiva', ['desconexión', 'notificación', 'atención', 'hábito', 'privacidad', 'presencia']],
      ['edicion-de-estilo', '¿La inteligencia artificial reemplazará las profesiones creativas?', 'Confrontar posiciones sobre autoría, trabajo y creación asistida', 'Defender una postura compleja sobre creatividad humana y automatización', 'cohesión avanzada y puntuación discursiva', ['autoría', 'creatividad', 'automatización', 'encargo', 'originalidad', 'criterio']],
      ['debate-epistemico', 'El descubrimiento que nadie creyó... hasta que cambió el mundo', 'Narrar una hipótesis científica recibida con escepticismo', 'Evaluar evidencia, resistencia institucional y cambio de paradigma', 'evidencialidad y grados de compromiso', ['hipótesis', 'evidencia', 'experimento', 'réplica', 'paradigma', 'hallazgo']],
      ['estetica-y-interpretacion', 'La economía de los creadores: cómo YouTube, TikTok y Spotify generan millones', 'Investigar quién gana y quién depende de las plataformas de contenido', 'Analizar visibilidad, monetización y precariedad en la economía digital', 'metáfora conceptual y lenguaje crítico', ['audiencia', 'monetización', 'plataforma', 'patrocinio', 'alcance', 'precariedad']],
      ['discurso-cientifico', 'Sobrevivir a un desastre natural: decisiones que salvan vidas', 'Reconstruir decisiones críticas durante una emergencia real', 'Explicar preparación, comunicación y cooperación bajo presión', 'reformulación explicativa y cautela', ['evacuación', 'alerta', 'refugio', 'riesgo', 'coordinación', 'resiliencia']],
      ['mediacion-de-conflictos', 'La vida secreta de un piloto comercial: decisiones a 12 000 metros de altura', 'Conocer la cadena de decisiones detrás de un vuelo seguro', 'Interpretar procedimientos, incertidumbre y responsabilidad técnica', 'atenuación extrema y metapragmática', ['cabina', 'turbulencia', 'protocolo', 'tripulación', 'maniobra', 'seguridad']],
      ['ensayo-de-alta-exigencia', '¿Por qué algunos recuerdos permanecen para siempre?', 'Explorar la relación entre emoción, memoria y narrativa personal', 'Distinguir recuerdo fiable, reconstrucción y significado emocional', 'progresión temática y cohesión global', ['memoria', 'emoción', 'recuerdo', 'consolidación', 'evocación', 'sesgo']],
      ['defensa-y-sintesis', 'Cómo una idea nacida en un garaje terminó convirtiéndose en una empresa global', 'Seguir la historia de una idea que se vuelve organización mundial', 'Sintetizar innovación, estrategia, escala y consecuencias sociales', 'selección estratégica de todos los recursos C2', ['idea', 'prototipo', 'escala', 'estrategia', 'inversión', 'impacto']]
    ]
  }
};

// Editorial identity for every independent/advanced Reading. The curriculum
// data supplies the grammar and vocabulary; these profiles supply a real
// subject, genre and point of tension instead of the former shared template.
const READING_PROFILES = {
  B1: {
    'historias-personales': ['testimonio', 'El día en que cambié de opinión', 'Una estudiante cuenta cómo llegar a una escuela nueva transformó su idea de pertenencia y le enseñó a escuchar experiencias distintas de la suya.'],
    'trabajo-y-talento': ['reportaje', '¿Qué cuenta como experiencia en el primer empleo?', 'Un grupo de jóvenes compara prácticas, voluntariado, trabajos informales y proyectos personales mientras se prepara para entrar en un mercado laboral incierto.'],
    'viajes-con-imprevistos': ['crónica', 'Veinticuatro horas lejos de casa', 'La cancelación de un viaje obliga a varios estudiantes a organizarse, reclamar información y ayudar a otras personas sin convertir el problema en una aventura idealizada.'],
    'medios-y-noticias': ['editorial', 'Antes de compartir ese titular', 'Una noticia viral sobre un instituto cambia de significado cuando el alumnado localiza la fuente original, la fecha y el contexto ausente en la publicación.'],
    'relaciones-y-convivencia': ['testimonio', 'Cuando el grupo de chat nunca se calla', 'Una adolescente aprende a establecer límites digitales sin abandonar a sus amistades ni interpretar cada silencio como rechazo.'],
    'consumo-responsable': ['reportaje', 'La camiseta barata tiene una historia', 'Un club escolar sigue el recorrido de una prenda y descubre que precio, duración, condiciones de producción y residuos forman parte de una misma decisión.'],
    'cultura-y-tradiciones': ['crónica histórica', 'Una tradición que cambia para seguir viva', 'Tres generaciones describen la transformación de una celebración local y debaten qué representa memoria compartida y qué puede renovarse.'],
    'educacion-y-metas': ['editorial', 'Elegir una carrera sin tener toda la vida resuelta', 'El texto cuestiona que una decisión tomada a los diecisiete años deba fijar para siempre el futuro académico y profesional.'],
    'medioambiente-local': ['reportaje comunitario', 'El patio escolar que dejó de ser una isla de calor', 'Estudiantes miden sombra, temperatura y uso del espacio antes de proponer árboles, agua y zonas de descanso para su comunidad.'],
    'salud-y-habitos': ['artículo divulgativo', 'Dormir no es perder el tiempo', 'La presión académica, las notificaciones y los horarios irregulares se examinan como problema colectivo, además de hábito personal.'],
    'servicios-y-reclamaciones': ['crónica de consumo', 'La suscripción que era fácil activar y difícil cancelar', 'Una joven documenta cargos, capturas y respuestas automáticas para convertir su frustración en una reclamación verificable.'],
    'proyecto-comunitario': ['reportaje', 'Una biblioteca vacía vuelve a tener voz', 'Un grupo juvenil transforma un espacio infrautilizado en lugar de estudio, creación y encuentro mediante una propuesta con presupuesto.']
  },
  B2: {
    'identidad-digital': ['ensayo argumentativo', '¿Somos nuestro perfil?', 'La identidad digital amplía la expresión personal, pero también convierte gustos, errores y relaciones en datos persistentes que otros interpretan fuera de contexto.'],
    'ciudades-sostenibles': ['editorial urbano', 'Moverse por la ciudad sin quedar fuera', 'Una propuesta de movilidad juvenil confronta emisiones, seguridad, accesibilidad, tiempo de viaje y desigualdad entre barrios.'],
    'trabajo-del-futuro': ['artículo de análisis', 'Prepararse para empleos que todavía están cambiando', 'La automatización y la inteligencia artificial no sustituyen todas las tareas de la misma manera; evaluar herramientas importa tanto como utilizarlas.'],
    'desinformacion': ['investigación breve', 'La anatomía de un video viral', 'Un video recortado parece demostrar una acusación hasta que se comparan la grabación completa, la fuente primaria, la fecha y los incentivos de difusión.'],
    'turismo-y-comunidad': ['editorial', 'La ciudad que todos visitan y pocos pueden habitar', 'El éxito turístico aumenta ingresos y empleo, pero también presiona alquileres, servicios y espacios cotidianos de la población residente.'],
    'educacion-digital': ['debate educativo', 'Aprender con IA sin entregar el pensamiento', 'La inteligencia artificial ofrece apoyo personalizado junto a riesgos de dependencia, privacidad, sesgo y desigualdad de acceso.'],
    'alimentacion-y-sociedad': ['reportaje social', 'Comer bien no depende solo de elegir bien', 'Precio, tiempo, transporte, publicidad y oferta local condicionan decisiones alimentarias presentadas a menudo como exclusivamente individuales.'],
    'arte-y-espacio-publico': ['crítica cultural', '¿De quién es la pared?', 'La creación de un mural abre una discusión sobre memoria barrial, libertad artística, financiación y participación en el paisaje común.'],
    'ciencia-y-etica': ['artículo de divulgación', 'Innovar antes de conocer todas las consecuencias', 'Una tecnología prometedora obliga a distinguir capacidad técnica, beneficio probable, riesgo, consentimiento y distribución justa.'],
    'vivienda-y-desigualdad': ['editorial económico', 'Empezar la vida adulta sin poder salir de casa', 'El alquiler, los salarios iniciales y la concentración de oportunidades urbanas retrasan la independencia de muchos jóvenes.'],
    'lenguaje-e-inclusion': ['ensayo', 'Las palabras también negocian pertenencia', 'Los cambios lingüísticos expresan identidad y reconocimiento, pero su aceptación depende del contexto, la comunidad y las relaciones de poder.'],
    'foro-de-propuestas': ['discurso cívico', 'Una propuesta juvenil que resiste preguntas difíciles', 'Un foro escolar exige pasar de consignas atractivas a objetivos medibles, evidencias pertinentes, costes transparentes y objeciones legítimas.']
  },
  C1: {
    'memoria-y-relato': ['podcast de tecnología', '¿La inteligencia artificial está cambiando nuestra manera de pensar?', 'Una herramienta puede ampliar nuestras capacidades, pero no debe sustituir el criterio con que verificamos, dudamos y decidimos.'],
    'retorica-publica': ['entrevista', 'De empleado a emprendedor digital: una historia de reinvención', 'Un cambio profesional empieza con una salida incierta y termina por transformar la forma de entender el trabajo.'],
    'periodismo-de-investigacion': ['storytelling', 'El día que Internet desapareció durante 24 horas', 'Una ciudad descubre qué servicios, hábitos y vínculos dependen de una conexión que suele dar por hecha.'],
    'justicia-y-reparacion': ['testimonio', 'Vivir un año en otro país cambió mi forma de ver el mundo', 'La distancia convierte los gestos cotidianos en preguntas sobre idioma, pertenencia y perspectiva.'],
    'innovacion-responsable': ['podcast de psicología', '¿Por qué sufrimos el síndrome del impostor?', 'La sensación de no merecer un logro puede persistir incluso cuando la evidencia dice lo contrario.'],
    'literatura-y-voz': ['documental corto', 'Cómo una pequeña startup terminó revolucionando una industria', 'Una idea mínima encuentra un problema real y altera las reglas de un mercado entero.'],
    'economia-y-cuidados': ['mesa redonda', '¿Trabajar cuatro días a la semana realmente funciona?', 'La jornada más corta promete tiempo y productividad, pero exige rediseñar la organización del trabajo.'],
    'diversidad-del-espanol': ['podcast de salud', 'Dormimos menos que nunca: el costo invisible del cansancio', 'Dormir poco parece una costumbre privada hasta que afecta la atención, el humor y las decisiones colectivas.'],
    'diplomacia-y-negociacion': ['entrevista', 'La presión mental detrás del deporte de alto rendimiento', 'El aplauso público rara vez muestra la disciplina, el miedo y la soledad que sostienen una carrera deportiva.'],
    'critica-cultural': ['narrativa', 'La decisión que tomé en cinco segundos cambió mi vida', 'Un instante de duda basta para que una persona descubra cuánto puede cambiar el rumbo de una vida.'],
    'politicas-publicas': ['podcast de sociedad', '¿Las redes sociales nos acercan o nos aíslan?', 'La conexión constante puede multiplicar los contactos y, al mismo tiempo, debilitar la presencia compartida.'],
    'coloquio-academico': ['historia inspiradora', 'Aprender un idioma después de los cincuenta años', 'Una estudiante adulta cuestiona la idea de que la edad decide quién puede aprender con fluidez.']
  },
  C2: {
    'ambiguedad-y-sentido': ['investigación periodística', 'Cómo los algoritmos deciden lo que ves cada día', 'Una recomendación aparentemente personal es el resultado de reglas, datos y objetivos que rara vez vemos.'],
    'humor-e-ironia': ['podcast tecnológico', 'Dentro de una empresa de inteligencia artificial', 'El entusiasmo por lanzar productos convive con decisiones difíciles sobre datos, riesgos y competencia.'],
    'traduccion-y-mediacion': ['entrevista exclusiva', 'Un corresponsal de guerra cuenta lo que nunca salió en televisión', 'Informar desde una guerra obliga a decidir qué se puede contar, qué se debe proteger y qué queda fuera de cámara.'],
    'filosofia-del-lenguaje': ['documental', 'La nueva carrera espacial: ¿quién conquistará Marte primero?', 'La ambición de llegar a Marte combina ciencia, negocio y una pregunta incómoda sobre quién puede reclamar el futuro.'],
    'analisis-juridico': ['testimonio', 'Viví un año sin redes sociales: esto fue lo que aprendí', 'Alejarse de las plataformas cambia el ritmo de la atención y revela hábitos que parecían inevitables.'],
    'edicion-de-estilo': ['debate', '¿La inteligencia artificial reemplazará las profesiones creativas?', 'La discusión no termina en lo que una máquina puede producir, sino en quién decide qué tiene valor.'],
    'debate-epistemico': ['storytelling científico', 'El descubrimiento que nadie creyó... hasta que cambió el mundo', 'Una idea rechazada obliga a preguntar por qué la evidencia tarda en cambiar una convicción.'],
    'estetica-y-interpretacion': ['podcast económico', 'La economía de los creadores: cómo YouTube, TikTok y Spotify generan millones', 'Detrás de cada cifra de seguidores hay reglas de monetización, trabajo invisible y plataformas que fijan las condiciones.'],
    'discurso-cientifico': ['historia real', 'Sobrevivir a un desastre natural: decisiones que salvan vidas', 'En una emergencia, una decisión informada y una red de apoyo pueden cambiar el desenlace.'],
    'mediacion-de-conflictos': ['entrevista', 'La vida secreta de un piloto comercial: decisiones a 12 000 metros de altura', 'La calma de una cabina es el resultado de protocolos, entrenamiento y decisiones tomadas con información incompleta.'],
    'ensayo-de-alta-exigencia': ['podcast de neurociencia', '¿Por qué algunos recuerdos permanecen para siempre?', 'La memoria conserva menos una grabación exacta que aquello que la emoción y el significado vuelven importante.'],
    'defensa-y-sintesis': ['narrativa empresarial', 'Cómo una idea nacida en un garaje terminó convirtiéndose en una empresa global', 'La escala convierte una intuición inicial en una empresa con nuevas responsabilidades, tensiones y efectos públicos.']
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

// Speaking must continue the situation introduced by the unit instead of
// falling back to a generic Tutor/Student prompt. A2 keeps an accessible,
// strictly two-person exchange; B1-C2 progressively add the questioning,
// evidence and mediation moves expected at each level.
function buildSpeakingDialogue(level, spec, index) {
  const [slug, title, scenario, objective, grammar, words] = spec;

  if (level === 'A2') {
    return (A2_LISTENING_SCRIPTS[slug]?.dialogue || []).map(([speaker, line]) => ({
      speaker,
      line
    }));
  }

  const person = index % 2 ? 'Lucía' : 'Mateo';
  if (level === 'B1') {
    return [
      { speaker: 'Interlocutora', line: `En la unidad «${title}», necesitamos ${scenario.toLowerCase()}. ¿Qué situación concreta presentarías primero?` },
      { speaker: person, line: `Explicaría el contexto y empezaría por ${words[0]} y ${words[1]}, porque ayudan a entender el problema sin simplificarlo.` },
      { speaker: 'Interlocutora', line: `¿Qué alternativa valorarías y qué dificultad podría aparecer?` },
      { speaker: person, line: `Propondría una solución realista, pero reconocería que ${words[2]} puede cambiar el resultado. Así puedo justificar mi decisión con un ejemplo.` }
    ];
  }

  if (level === 'B2') {
    return [
      { speaker: 'Moderadora', line: `Abrimos el debate sobre «${title}». El reto es ${scenario.toLowerCase()}. ¿Qué postura defiendes?` },
      { speaker: person, line: `Defiendo una propuesta que tenga en cuenta ${words[0]} y ${words[1]}; si ignoramos uno de los dos, la solución pierde equilibrio.` },
      { speaker: 'Especialista', line: `Sin embargo, hay personas que priorizan ${words[2]}. ¿Cómo responderías a esa objeción?` },
      { speaker: person, line: `La objeción es válida, aunque no basta por sí sola. Compararía sus consecuencias y pediría evidencia antes de decidir.` },
      { speaker: 'Moderadora', line: `Resume tu conclusión y señala qué condición haría falta para aplicarla.` }
    ];
  }

  if (level === 'C1') {
    return [
      { speaker: 'Conductora', line: `Hoy analizamos «${title}». La cuestión de fondo es ${scenario.toLowerCase()}. ¿Por dónde conviene empezar?` },
      { speaker: 'Analista', line: `Conviene distinguir entre ${words[0]} y ${words[1]}; parecen próximos, pero llevan a decisiones y responsabilidades diferentes.` },
      { speaker: person, line: `Estoy de acuerdo en parte. Añadiría que ${words[2]} obliga a mirar quién queda afectado y qué evidencia respalda cada interpretación.` },
      { speaker: 'Conductora', line: `¿Qué límite pondrías a esa interpretación para no convertirla en una conclusión absoluta?` },
      { speaker: person, line: `La formularía como una hipótesis razonada: aplicaría ${grammar} y dejaría claro qué datos podrían confirmarla, matizarla o refutarla.` }
    ];
  }

  return [
    { speaker: 'Moderadora', line: `Examinemos «${title}». Debemos ${scenario.toLowerCase()}, pero antes conviene revisar qué presupuestos organiza el debate.` },
    { speaker: 'Investigadora', line: `El primer presupuesto aparece en ${words[0]}; no es una palabra neutral, porque selecciona qué problema se vuelve visible.` },
    { speaker: person, line: `También habría que contrastarla con ${words[1]} y ${words[2]}. Si usamos esas categorías sin definirlas, podemos confundir una explicación con una justificación.` },
    { speaker: 'Moderadora', line: `¿Qué evidencia aceptarías y qué voz podría quedar fuera de la discusión?` },
    { speaker: person, line: `Combinaría datos, testimonios y contexto institucional. No presentaría una sola fuente como definitiva ni ocultaría sus límites.` },
    { speaker: 'Investigadora', line: `Entonces, formula una conclusión provisional que mantenga el matiz y permita seguir investigando.` }
  ];
}

function buildSpeakingPhrases(level, slug, words) {
  if (level === 'A2') return A2_LISTENING_SCRIPTS[slug]?.phrases || [];
  if (level === 'B1') return ['En esta situación...', 'Una alternativa sería...', 'La dificultad principal es...', 'Por eso considero que...'];
  if (level === 'B2') return ['Mi postura parte de...', 'Sin embargo, hay que considerar...', 'La evidencia más relevante sería...', 'En consecuencia...'];
  if (level === 'C1') return ['Conviene distinguir entre...', 'La interpretación depende de...', 'No afirmaría que..., sino que...', 'La evidencia podría matizar...'];
  return ['El debate presupone que...', 'Esta categoría vuelve visible...', 'La conclusión es provisional porque...', 'Habría que contrastar esta lectura con...'];
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

// A2 uses a consistent first-person voice so learners can follow one speaker
// and hear the full range of everyday first-person forms in context.
const A2_LISTENING_FIRST_PERSON_BASES = { ...A2_LISTENING_MONOLOGUES };

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

const SPANISH_REFERENCE_LIBRARY = {
  undpAiDominicanRepublic: { author: 'PNUD República Dominicana', title: 'Estudio sobre las oportunidades de la inteligencia artificial para potenciar el desarrollo humano en República Dominicana', year: 2025, url: 'https://www.undp.org/es/dominican-republic/publicaciones/estudio-sobre-las-oportunidades-de-la-inteligencia-artificial-para-potenciar-el-desarrollo-humano-en-republica' },
  unescoAiStudentsSpanish: { author: 'UNESCO', title: 'Marco de competencias para estudiantes en materia de IA', year: 2024, url: 'https://www.unesco.org/es/articles/marco-de-competencias-para-estudiantes-en-materia-de-ia?hub=779' },
  undpEducationDominicanRepublic: { author: 'PNUD República Dominicana', title: 'Acceso educativo impulsa avances de desarrollo, aunque persiste el reto de calidad', year: 2025, url: 'https://www.undp.org/es/dominican-republic/blog/acceso-educativo-impulsa-avances-de-desarrollo-aunque-persiste-el-reto-de-calidad' },
  academyDominicanSpanish: { author: 'Academia Dominicana de la Lengua', title: 'La dominicanidad transnacional: actitudes lingüísticas de los dominicanos en RD, EE. UU. y España', year: 2021, url: 'https://academia.org.do/2021/04/09/la-dominicanidad-transnacional-actitudes-linguisticas-de-los-dominicanos-en-rd-ee-uu-y-espana/' },
  undpClimateDominicanRepublic: { author: 'PNUD República Dominicana', title: 'Estrategia del Sistema de las Naciones Unidas en la República Dominicana para la acción climática', year: 2025, url: 'https://www.undp.org/es/dominican-republic/publicaciones/estrategia-del-sistema-de-naciones-unidas-en-la-republica-dominicana-para-la-accion-climatica' },
  undpClimateHealthDominicanRepublic: { author: 'PNUD República Dominicana', title: 'Informe de salud y adaptación al cambio climático en República Dominicana', year: 2025, url: 'https://www.undp.org/es/dominican-republic/publicaciones/informe-de-salud-y-adaptacion-al-cambio-climatico-en-republica-dominicana-2025' },
  adolescentMentalHealth: { author: 'Organización Mundial de la Salud', title: 'Salud mental del adolescente', year: 2025, url: 'https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health' },
  teensScreens: { author: 'OMS Europa', title: 'Teens, screens and mental health', year: 2024, url: 'https://www.who.int/europe/news-room/25-09-2024-teens--screens-and-mental-health' },
  socialConnection: { author: 'Organización Mundial de la Salud', title: 'WHO Commission on Social Connection', year: 2025, url: 'https://www.who.int/groups/commission-on-social-connection' },
  aiStudents: { author: 'UNESCO', title: 'AI competency framework for students', year: 2024, url: 'https://www.unesco.org/en/articles/ai-competency-framework-students' },
  mediaLiteracy: { author: 'UNESCO', title: 'Media and Information Literacy', year: 2026, url: 'https://www.unesco.org/en/media-information-literacy' },
  educationTrends: { author: 'OCDE', title: 'Trends Shaping Education 2025', year: 2025, url: 'https://www.oecd.org/en/publications/2025/01/trends-shaping-education-2025_3069cbd2/full-report/work-and-progress_423e3500.html' }
};

// Audio-production revision: one narrator, varied everyday situations and
// slightly longer A2 texts while retaining each unit's target language.
Object.assign(A2_LISTENING_MONOLOGUES, {
  'compras-y-cantidades': 'El mercado abre temprano y hoy hay mucha gente. Una clienta compra medio kilo de tomates, un kilo de arroz y una bolsa de naranjas. Los tomates cuestan tres euros el kilo y el arroz cuesta dos. El vendedor calcula el total y explica que la bolsa vale un euro más. La clienta paga con tarjeta, comprueba el recibo y guarda la compra antes de volver a casa.',
  'orientarse-en-la-ciudad': 'Un mapa pequeño no siempre es suficiente en una ciudad nueva. Para llegar a la estación de tren, un visitante debe seguir recto por la avenida hasta el semáforo, girar a la derecha y caminar dos cuadras. La estación queda a la izquierda, detrás del museo y junto a la farmacia. No debe cruzar la plaza. Antes de continuar, repite las indicaciones para no perderse.',
  'rutinas-y-horarios': 'Esta semana el horario de trabajo cambia. Una empleada empieza a las diez, no a las ocho, porque hace un curso por las mañanas. El curso termina a las nueve y media. El domingo prepara su agenda y deja una tarde libre. Mientras está en clase, una compañera revisa los mensajes urgentes. Después responde lo importante y continúa con su jornada de trabajo.',
  'salud-y-bienestar': 'Después de varios días de poco descanso, alguien visita a la doctora. Le duele la garganta y tiene un poco de fiebre. La doctora cree que es una infección leve y recomienda beber agua, descansar y tomar la medicina indicada. Si continúa con fiebre, debe pedir otra cita en tres días. Mañana no irá al trabajo si se siente peor; primero necesita recuperarse bien.',
  'viajes-y-transporte': 'El panel de la estación anuncia un cambio importante. Un tren a Valencia sale a las seis, pero el andén cambia del número cuatro al seis. La llegada sigue prevista para las ocho y veinte. Antes de subir, el viajero deja su equipaje en la consigna y revisa el panel una vez más. Debe estar en el andén diez minutos antes para viajar con tranquilidad.',
  'casa-y-barrio': 'Encontrar un apartamento también significa elegir un barrio. Una persona visita un piso en la calle Mayor porque tiene muebles básicos y mucha luz por la mañana. Como trabaja desde casa, necesita tranquilidad. El barrio es seguro y hay poco ruido, aunque el alquiler es un poco más alto. La sala es más luminosa que la del otro apartamento y el metro está cerca. La visita será el sábado.',
  'comidas-y-recetas': 'La cocina se llena de olor a verduras. Para preparar una sopa, una persona tiene papas, zanahorias y cebolla, pero necesita un poco de caldo. Primero corta las verduras y luego las hierve durante veinte minutos. Añade la sal al final para comprobar el sabor. Prefiere dejar los trozos enteros y agregar el caldo poco a poco para que la sopa no quede demasiado líquida.',
  'recuerdos-y-experiencias': 'Un viaje puede quedarse en la memoria por un sabor. El verano pasado, dos hermanas viajaron a Oaxaca y visitaron un mercado pequeño. Allí una señora les enseñó a preparar chocolate. Después del viaje, una de ellas ha preparado esa receta varias veces en casa. Sin embargo, nunca sabe igual que el chocolate del mercado. Aun así, cada vez que lo prepara recuerda aquella tarde y sonríe.',
  celebraciones: 'La casa de los tíos se prepara para una celebración familiar. El sábado se reúne la familia para el cumpleaños de la abuela. Una amiga ha sido invitada, pero no necesita llevar regalo. Prefiere traer un postre para compartir y lo entrega antes de las cinco. Así todos ayudan con los preparativos y nadie trabaja solo. La abuela estará muy contenta al ver a la familia reunida.',
  'estudio-y-aprendizaje': 'Faltan dos semanas para un examen y todavía hay apuntes por organizar. Un estudiante decide repasar un tema cada día y dejar el domingo para practicar. Lleva dos meses estudiando una hora después de cenar, por eso ya tiene una rutina. Hoy organiza el calendario y divide las tareas. Cuando termina cada tema, hace un ejercicio corto para comprobar su progreso y llegar con más confianza al examen.',
  'tecnologia-cotidiana': 'A veces una contraseña olvidada puede detener toda la mañana. Para recuperar el acceso a una cuenta, hay que pulsar «Recuperar contraseña» en la pantalla de inicio. Después se revisa el correo y se abre el enlace recibido. Es importante comprobar la bandeja de entrada y también el spam. Finalmente se crea una clave segura, se guarda el acceso y nunca se comparte la contraseña con otra persona.',
  'planes-y-proyectos': 'Un equipo tiene que presentar un proyecto el viernes. Una persona revisa los datos y otra prepara las diapositivas. El miércoles se reúnen para ver el resultado y cambiar lo necesario. Si terminan el borrador ese día, tendrán tiempo para ensayar la presentación. Hoy revisan la información y mañana envían una versión al equipo. Así todos conocen el acuerdo antes de la fecha final.'
});

// A second pass establishes the A2− to A2+ progression and re-applies the
// completed scripts to the listening activities used by the builder.
Object.assign(A2_LISTENING_MONOLOGUES, {
  'compras-y-cantidades': 'El mercado abre temprano y hoy hay mucha gente. Una clienta lleva una lista: medio kilo de tomates, un kilo de arroz y una bolsa de naranjas. Los tomates cuestan tres euros el kilo y el arroz cuesta dos. El vendedor calcula el total y explica que la bolsa vale un euro más. La clienta paga con tarjeta, comprueba el recibo y guarda la compra antes de volver a casa.',
  'orientarse-en-la-ciudad': 'Un visitante llega a una ciudad nueva y necesita encontrar la estación de tren. Una vecina le explica el camino: debe seguir recto por la avenida hasta el semáforo, girar a la derecha y caminar dos cuadras. La estación queda a su izquierda, detrás del museo y junto a la farmacia. No debe cruzar la plaza. Antes de continuar, repite las indicaciones para estar seguro de no perderse.',
  'rutinas-y-horarios': 'Esta semana el horario de trabajo cambia porque una empleada hace un curso por las mañanas. Normalmente entra a las ocho, pero ahora empieza a las diez. El curso termina a las nueve y media. Para organizarse, prepara la agenda el domingo y deja una tarde libre. Mientras está en clase, una compañera revisa los mensajes urgentes. Después responde lo importante y continúa su jornada con más calma.',
  'salud-y-bienestar': 'Después de varios días de poco descanso, alguien visita a la doctora. Le duele la garganta y tiene un poco de fiebre. La doctora cree que es una infección leve y recomienda beber agua, descansar y tomar la medicina indicada. También aconseja no ir al trabajo al día siguiente si la fiebre aumenta. Si continúa igual, debe pedir otra cita en tres días. Recuperarse bien ahora evitará problemas después.',
  'viajes-y-transporte': 'El panel de la estación anuncia un cambio importante para un tren que viaja a Valencia. Sale a las seis, pero el andén cambia del número cuatro al seis. La llegada sigue prevista para las ocho y veinte. Antes de subir, el viajero deja su equipaje en la consigna y revisa el panel una vez más. Debe estar en el andén diez minutos antes. Así tendrá tiempo si vuelven a cambiar la información.',
  'casa-y-barrio': 'Elegir apartamento también significa elegir un modo de vida. Una persona visita un piso en la calle Mayor porque tiene muebles básicos y mucha luz por la mañana. Como trabaja desde casa, necesita tranquilidad. El barrio es seguro y tiene poco ruido, aunque el alquiler es más alto que el del otro apartamento. La sala es más luminosa y el metro está cerca. El sábado comparará ambos pisos antes de decidir.',
  'comidas-y-recetas': 'En casa, una receta sencilla puede convertirse en una pequeña experiencia. Para preparar sopa de verduras hay papas, zanahorias y cebolla, pero falta un poco de caldo. Primero se cortan las verduras y luego se hierven durante veinte minutos. La sal se añade al final para comprobar el sabor. Conviene agregar el caldo poco a poco; así la sopa no queda demasiado líquida y los trozos conservan su forma.',
  'recuerdos-y-experiencias': 'Un viaje puede quedarse en la memoria por un sabor. El verano pasado, dos hermanas viajaron a Oaxaca y visitaron un mercado pequeño. Una señora les enseñó a preparar chocolate y explicó por qué mezclaba los ingredientes lentamente. Desde aquel viaje, una de las hermanas ha preparado la receta varias veces en casa. Sin embargo, nunca sabe igual que en el mercado. Quizá el lugar, las personas y el recuerdo también cambian el sabor.',
  celebraciones: 'La casa de los tíos se prepara para una celebración familiar. El sábado todos se reúnen para el cumpleaños de la abuela. Una amiga ha sido invitada, pero le explican que no hace falta llevar regalo. Prefiere traer un postre para compartir y lo entrega antes de las cinco. De ese modo, varias personas ayudan con los preparativos. La abuela estará contenta, no solo por la comida, sino porque puede conversar con toda la familia.',
  'estudio-y-aprendizaje': 'Faltan dos semanas para un examen y todavía hay apuntes por organizar. Un estudiante decide repasar un tema cada día y dejar el domingo para practicar. Lleva dos meses estudiando una hora después de cenar, por eso ya conoce su mejor horario. Hoy divide las tareas en un calendario. Cuando completa cada tema, hace un ejercicio corto y anota los errores. Si mantiene esta rutina, llegará al examen con más confianza y menos estrés.',
  'tecnologia-cotidiana': 'Una contraseña olvidada puede detener toda la mañana, pero hay una solución segura. Primero se pulsa «Recuperar contraseña» en la pantalla de inicio. Después se revisa el correo y se abre el enlace recibido. Es importante comprobar la bandeja de entrada y también el spam. Al crear una nueva clave, conviene combinar letras, números y símbolos. Finalmente se guarda el acceso en un lugar seguro y no se comparte la contraseña con otra persona.',
  'planes-y-proyectos': 'Un equipo tiene que presentar un proyecto el viernes y necesita repartir bien el trabajo. Una persona revisa los datos y otra prepara las diapositivas. El miércoles se reúnen para revisar el borrador y cambiar lo necesario. Si terminan ese día, tendrán tiempo para ensayar. Hoy revisan la información y mañana envían una versión al equipo. Así todos conocen el acuerdo, pueden hacer sugerencias y llegan a la presentación con una idea común.'
});

for (const [slug, transcript] of Object.entries(A2_LISTENING_MONOLOGUES)) {
  Object.assign(A2_LISTENING_SCRIPTS[slug], { speakers: ['Narrador/a'], transcript });
}

// A2 recordings add a second layer of context: reasons, comparisons and
// consequences that make the listening task more substantial than A1.
const A2_LISTENING_CONTEXT = {
  'compras-y-cantidades': 'En casa, coloca las naranjas en un plato y revisa la lista. La próxima semana comparará los precios con otro mercado para organizar mejor sus gastos.',
  'orientarse-en-la-ciudad': 'Cuando llega a la estación, consulta el panel de salidas y compra un mapa. Así tendrá una referencia si necesita volver a esa zona otro día.',
  'rutinas-y-horarios': 'El cambio le exige levantarse antes, pero también le permite aprender una habilidad nueva. Al final de la semana revisará si este horario funciona para ella.',
  'salud-y-bienestar': 'La persona entiende que descansar no es perder tiempo. Si sigue las indicaciones, podrá volver a sus actividades con más energía y sin empeorar los síntomas.',
  'viajes-y-transporte': 'El viajero guarda el billete junto al documento de identidad y busca un lugar tranquilo para esperar. También envía un mensaje para avisar que llegará más tarde.',
  'casa-y-barrio': 'Antes de firmar, revisará el contrato y preguntará por los gastos de agua y electricidad. No quiere decidir solo por la luz de la sala o la cercanía del metro.',
  'comidas-y-recetas': 'Cuando la sopa está lista, la sirve con pan y la comparte con su familia. Todos prueban el sabor y comentan qué ingrediente podrían añadir la próxima vez.',
  'recuerdos-y-experiencias': 'Al revisar las fotos del viaje, las hermanas recuerdan la música del mercado y la paciencia de la señora. Ahora quieren aprender más recetas de esa región.',
  celebraciones: 'Al final de la tarde, la abuela cuenta historias de su juventud. Los más pequeños escuchan, hacen preguntas y guardan algunas fotos para recordarlo después.',
  'estudio-y-aprendizaje': 'Además, comparte una tarde de repaso con dos compañeros. Explicar una idea a otra persona le ayuda a descubrir qué partes todavía necesita estudiar.',
  'tecnologia-cotidiana': 'Después activa una verificación adicional para proteger la cuenta. De ese modo, un código enviado al teléfono ayuda a impedir que otra persona entre sin permiso.',
  'planes-y-proyectos': 'Durante el ensayo, cada integrante explica una parte y recibe comentarios breves. Si algo no se entiende, todavía tendrán tiempo para corregirlo antes del viernes.'
};

for (const [slug, context] of Object.entries(A2_LISTENING_CONTEXT)) {
  const transcript = `${A2_LISTENING_MONOLOGUES[slug]} ${context}`;
  A2_LISTENING_MONOLOGUES[slug] = transcript;
  Object.assign(A2_LISTENING_SCRIPTS[slug], { speakers: ['Narrador/a'], transcript });
}

const A2_LISTENING_CLOSINGS = {
  'compras-y-cantidades': 'Al llegar a casa, guarda el recibo y revisa lo que compró. Así sabe qué necesita para la próxima visita.',
  'orientarse-en-la-ciudad': 'Antes de irse, anota el nombre de la estación. Le será útil cuando vuelva con sus amigos.',
  'rutinas-y-horarios': 'Esa noche prepara todo con tiempo. Quiere empezar el día siguiente sin prisas.',
  'salud-y-bienestar': 'También anota la hora de la próxima cita. Tener un plan claro le da más tranquilidad.',
  'viajes-y-transporte': 'Cuando llega al destino, llama a su familia. Les cuenta que el viaje fue más largo de lo esperado.',
  'casa-y-barrio': 'Luego visita una cafetería cercana para conocer el ambiente. Quiere imaginar cómo sería vivir allí cada día.',
  'comidas-y-recetas': 'La familia guarda una porción para el día siguiente. Todos coinciden en que la receta fue una buena idea.',
  'recuerdos-y-experiencias': 'Antes de dormir, escriben unas notas sobre el viaje. No quieren olvidar los pequeños detalles.',
  celebraciones: 'Al despedirse, cada persona ayuda a recoger las sillas. La casa queda tranquila después de una tarde especial.',
  'estudio-y-aprendizaje': 'Al terminar, prepara las preguntas que llevará a clase. Así podrá aprovechar mejor la próxima explicación.',
  'tecnologia-cotidiana': 'Finalmente, guarda la contraseña en un lugar seguro. Prefiere no compartirla con nadie.',
  'planes-y-proyectos': 'Al salir de la reunión, el equipo confirma la hora del siguiente ensayo. Todos saben qué deben preparar.'
};

for (const [slug, closing] of Object.entries(A2_LISTENING_CLOSINGS)) {
  const transcript = `${A2_LISTENING_MONOLOGUES[slug]} ${closing}`;
  A2_LISTENING_MONOLOGUES[slug] = transcript;
  Object.assign(A2_LISTENING_SCRIPTS[slug], { speakers: ['Narrador/a'], transcript });
}

for (const [slug, base] of Object.entries(A2_LISTENING_FIRST_PERSON_BASES)) {
  const transcript = `${base} Al final, repaso la información y preparo el siguiente paso con calma. Así puedo continuar con más seguridad. También pienso en lo que aprendí de esta situación y en lo que haré después. Me gusta tener un plan claro antes de seguir.`;
  A2_LISTENING_MONOLOGUES[slug] = transcript;
  Object.assign(A2_LISTENING_SCRIPTS[slug], { speakers: ['Narrador/a'], transcript });
}

// C1 begins with three authored, evidence-based readings. They are deliberately
// not character stories: each one gives learners a current issue, a defensible
// position and sources they can consult after reading.
const AUTHORED_C1_READINGS = {
  'memoria-y-relato': {
    genre: 'artículo de análisis',
    title: 'Aprender con IA sin entregar el pensamiento',
    angle: 'La inteligencia artificial puede apoyar el aprendizaje, pero no debe reemplazar la lectura, la duda ni la verificación.',
    text: `La escena ya forma parte de la vida académica: una consigna difícil, una pantalla abierta y la posibilidad de obtener en segundos un resumen, un esquema o un borrador completo. La inteligencia artificial generativa puede ayudar a ordenar ideas, explicar conceptos o revisar la claridad de un texto. Pero esa rapidez también obliga a plantear una pregunta más exigente: ¿qué ocurre cuando una herramienta produce una respuesta antes de que el estudiante haya tenido tiempo de formular su propia pregunta?

El debate no consiste en decidir si la IA debe entrar o no en la educación. Ya está presente en la manera de estudiar, buscar información y preparar tareas. La cuestión es qué tipo de relación se construye con ella. Usar una herramienta para comparar una explicación, identificar una laguna en un argumento o recibir sugerencias de redacción no equivale a delegar por completo el trabajo intelectual. La diferencia aparece cuando la respuesta automática sustituye la lectura, la duda, la verificación y la capacidad de defender una idea con palabras propias.

En República Dominicana, el PNUD ha estudiado las percepciones sobre la IA desde una perspectiva de desarrollo humano, con atención a experiencias de uso, capacidades, oportunidades, temores y expectativas de futuro.[1] Este enfoque importa porque una tecnología no tiene el mismo efecto para todas las personas. Quien cuenta con buena conectividad, tiempo, orientación docente y formación digital puede utilizarla para ampliar sus posibilidades. Quien solo recibe una respuesta lista para copiar puede depender de un sistema que no siempre explica sus límites ni permite reconocer sus errores.

La UNESCO propone que el aprendizaje sobre IA incluya una visión centrada en las personas, ética, comprensión de técnicas y aplicaciones, y reflexión sobre su uso pedagógico.[2] No se trata de convertir a todo estudiante en programador. Se trata de desarrollar criterios: saber qué información conviene comprobar, qué datos no deben compartirse, qué prejuicios puede reproducir un sistema y por qué una respuesta escrita con seguridad no es necesariamente correcta.

Esa última diferencia es decisiva. Una IA puede redactar un texto convincente sobre historia, ciencia o literatura y, al mismo tiempo, confundir fechas, atribuir frases inexistentes o presentar una interpretación discutible como si fuera un hecho. Por eso, la habilidad más importante no es pedir una respuesta más larga, sino preguntar mejor: ¿de dónde procede esta afirmación?, ¿qué evidencia falta?, ¿qué otra interpretación sería posible?, ¿cómo cambia la conclusión si una fuente no es fiable?

La educación tampoco puede reducir la IA a una amenaza de fraude. Prohibirla sin enseñar a usarla deja al alumnado ante una herramienta poderosa, pero sin vocabulario para comprenderla. El reto consiste en diseñar tareas en las que el proceso importe tanto como el resultado: comparar versiones, justificar decisiones, citar fuentes, explicar los cambios realizados y reconocer qué apoyo tecnológico se utilizó.

El PNUD ha señalado que el país necesita fortalecer una educación inclusiva, equitativa y de calidad, junto con pensamiento crítico y formación en valores.[3] En ese marco, la IA puede ser un apoyo, no un sustituto de la autonomía. Aprender con ella exige conservar algo que ninguna respuesta automática puede entregar terminada: la responsabilidad de pensar, revisar y decidir.`,
    referenceKeys: ['undpAiDominicanRepublic', 'unescoAiStudentsSpanish', 'undpEducationDominicanRepublic'],
    exercises: [
      q('¿Cuál es la pregunta principal que plantea el texto?', ['Qué aplicación es más rápida.', 'Cómo usar la IA sin sustituir el trabajo intelectual.', 'Por qué toda tarea debe hacerse a mano.', 'Cuándo desaparecerán las herramientas digitales.'], 1, 'El texto examina una relación crítica y autónoma con la IA.'),
      q('¿Qué diferencia establece el texto entre apoyo y dependencia?', ['El apoyo permite revisar y comprender; la dependencia reemplaza el proceso de aprender.', 'El apoyo solo sirve para programar.', 'La dependencia mejora las fuentes.', 'No existe diferencia entre ambos.'], 0, 'La clave está en si la herramienta acompaña el razonamiento o lo sustituye.'),
      q('¿Por qué la IA puede ampliar desigualdades?', ['Porque no puede escribir textos.', 'Porque todas las personas tienen el mismo acceso y orientación.', 'Porque sus beneficios dependen de acceso, tiempo y formación crítica.', 'Porque elimina por completo la enseñanza.'], 2, 'El texto vincula el beneficio de la herramienta con las condiciones de uso.'),
      q('Según el texto, ¿qué debe hacer un estudiante ante una respuesta de IA?', ['Copiarla sin modificarla.', 'Verificar fuentes, evidencia y posibles interpretaciones.', 'Descartarla siempre.', 'Compartir datos personales para mejorarla.'], 1, 'Una respuesta convincente no sustituye la comprobación.'),
      q('¿Cuál es la tesis final de la lectura?', ['La IA debe sustituir la educación tradicional.', 'La IA solo debe utilizarse fuera de la escuela.', 'La IA puede apoyar el aprendizaje si se preserva la autonomía y el juicio crítico.', 'La tecnología impide toda forma de pensamiento.'], 2, 'La conclusión defiende un uso responsable, no una prohibición total.')
    ]
  },
  'retorica-publica': {
    genre: 'artículo sociolingüístico',
    title: 'Un acento no es una falta',
    angle: 'La variedad del español dominicano exige distinguir entre identidad lingüística, registro y adecuación.',
    text: `Pocas cosas revelan tanto sobre una sociedad como la forma en que juzga una voz. En una entrevista, una exposición o un video publicado en redes, muchas personas no solo escuchan lo que alguien dice: también evalúan cómo pronuncia, qué palabras elige y si su manera de hablar se parece a la que consideran “correcta”. En República Dominicana, esa evaluación suele recaer sobre rasgos cotidianos del español dominicano.

La aspiración o la elisión de la s al final de sílaba, por ejemplo, forma parte de la variedad hablada en muchas zonas del Caribe. La Academia Dominicana de la Lengua explica que esos rasgos son estructurales en el español dominicano y que su realización cambia según región y contexto.[1] Esto no significa que toda forma de hablar sea adecuada para toda situación. Significa algo más preciso: una variedad lingüística no debe confundirse automáticamente con ignorancia o incapacidad.

La confusión aparece cuando se trata la norma escrita como si fuera la única forma legítima de hablar. Es razonable que una persona aprenda a redactar un informe formal, preparar una exposición académica o adaptar su registro a una entrevista laboral. Esas habilidades amplían oportunidades. El problema surge cuando la adaptación se presenta como una renuncia obligatoria a la identidad: hablar de manera distinta no equivale a hablar peor.

La competencia lingüística avanzada consiste precisamente en reconocer registros. Una persona puede conversar con familiares usando expresiones locales, escribir un correo profesional con un tono formal y participar en un debate académico con vocabulario especializado. No hay contradicción entre esas capacidades. Al contrario, quien sabe cambiar de registro demuestra flexibilidad comunicativa.

Los prejuicios, sin embargo, tienen consecuencias reales. Si una voz se asocia de inmediato con falta de educación, pobreza o poca seriedad, la conversación deja de centrarse en las ideas. El acento se convierte en un filtro social. Por eso resulta importante distinguir entre enseñar recursos de pronunciación, ortografía y escritura formal —algo útil— y ridiculizar una variedad que forma parte de la historia lingüística del país.

Defender la diversidad del español dominicano no exige negar la importancia de la corrección en contextos formales. Exige reconocer que la corrección depende también del propósito, el canal y la situación. Una exposición universitaria no se evalúa igual que una conversación entre amistades; un texto legal no funciona como un mensaje de voz. Pero en todos los casos, la dignidad de quien habla no debería depender de sonar como otra persona.`,
    referenceKeys: ['academyDominicanSpanish'],
    exercises: [
      q('¿Qué critica principalmente el texto?', ['Aprender registros formales.', 'Juzgar la capacidad de una persona solo por su acento.', 'Usar expresiones locales en familia.', 'Escribir textos académicos.'], 1, 'El texto cuestiona que la variedad lingüística se convierta en una medida de capacidad.'),
      q('¿Qué diferencia hay entre variedad y adecuación?', ['Una variedad es ilegítima; la adecuación no.', 'La variedad describe formas de hablar; la adecuación depende del propósito y la situación.', 'La adecuación solo importa en redes sociales.', 'No hay ninguna diferencia.'], 1, 'El texto propone distinguir identidad lingüística y elección de registro.'),
      q('¿Qué significa que el acento pueda convertirse en un “filtro social”?', ['Que ayuda a mejorar la ortografía.', 'Que desplaza la atención de las ideas hacia prejuicios sobre quien habla.', 'Que todos los registros se valoran igual.', 'Que la pronunciación no comunica nada.'], 1, 'El prejuicio puede condicionar cómo se interpreta a la persona antes de escuchar su argumento.'),
      q('¿Qué demuestra una persona que sabe cambiar de registro?', ['Que ha renunciado a su identidad.', 'Que no tiene una forma propia de hablar.', 'Flexibilidad comunicativa según el contexto.', 'Que solo puede usar lenguaje formal.'], 2, 'La capacidad de adaptar el registro amplía las posibilidades de comunicación.'),
      q('¿Cuál es la postura final del texto?', ['La corrección formal debe desaparecer.', 'Toda forma de hablar sirve para cualquier contexto.', 'La corrección es útil, pero no justifica despreciar variedades lingüísticas.', 'Solo la norma escrita es legítima.'], 2, 'El texto defiende tanto la formación formal como la dignidad de las variedades locales.')
    ]
  },
  'periodismo-de-investigacion': {
    genre: 'artículo de divulgación',
    title: 'Cuando el calor también entra al aula',
    angle: 'El cambio climático afecta la educación y la salud mediante condiciones cotidianas, desigualdades y capacidad de respuesta.',
    text: `El cambio climático suele aparecer en conversaciones públicas a través de imágenes extremas: un huracán, una inundación o una playa cubierta de sargazo. Sin embargo, también se manifiesta de formas menos espectaculares y más cotidianas. Un aula con temperaturas difíciles de soportar, una familia que debe reorganizar su rutina por lluvias intensas o una comunidad que interrumpe sus actividades por falta de agua son experiencias que afectan directamente la educación, la salud y el bienestar.

República Dominicana, como pequeño Estado insular, enfrenta riesgos climáticos que no pueden analizarse solo como problemas ambientales. El PNUD ha señalado que los efectos del cambio climático afectan el desarrollo social, económico y ambiental del país, y que la adaptación requiere respuestas coordinadas.[1] Su informe de salud y adaptación climática de 2025 examina riesgos vinculados a enfermedades sensibles al clima, problemas respiratorios, enfermedades transmitidas por vectores y salud mental.[2]

Esta relación entre clima y vida cotidiana importa especialmente para jóvenes y estudiantes. Cuando una escuela carece de condiciones adecuadas frente al calor, concentrarse deja de ser únicamente una cuestión de disciplina. Cuando el transporte se altera por lluvias o una familia pierde ingresos después de un evento climático, estudiar puede quedar relegado por necesidades urgentes. Hablar de resiliencia no significa pedir a las personas que “se adapten” solas; significa preguntarse qué infraestructuras, servicios y planes reducen realmente su vulnerabilidad.

Las soluciones tampoco se limitan a grandes obras. El diseño de sombra en patios escolares, la gestión de residuos, el acceso a agua segura, la información de prevención y la participación comunitaria pueden producir efectos concretos. El punto decisivo es evitar una mirada que separe el ambiente de la justicia social. Las comunidades con menos recursos suelen tener menor capacidad para protegerse, recuperarse o trasladarse cuando ocurre una emergencia.

Para una generación que crecerá con estos cambios, la educación climática no debería limitarse a memorizar definiciones. Debe ayudar a interpretar datos, reconocer desigualdades y participar en decisiones locales. La pregunta no es solo cuánto aumentará la temperatura, sino quién podrá proteger su salud, continuar sus estudios y conservar sus medios de vida cuando el clima cambie.`,
    referenceKeys: ['undpClimateDominicanRepublic', 'undpClimateHealthDominicanRepublic'],
    exercises: [
      q('¿Qué ejemplos usa el texto para mostrar efectos cotidianos del cambio climático?', ['Solo huracanes internacionales.', 'Aulas calurosas, lluvias que alteran rutinas y falta de agua.', 'Únicamente cambios en la playa.', 'Tecnologías de inteligencia artificial.'], 1, 'El texto amplía la mirada hacia situaciones ordinarias que afectan la vida diaria.'),
      q('¿Cómo relaciona el texto clima, salud y educación?', ['Como temas completamente separados.', 'Como dimensiones que pueden afectarse mutuamente en la vida cotidiana.', 'Como problemas que solo ocurren en zonas rurales.', 'Como asuntos resueltos por una única institución.'], 1, 'Las condiciones climáticas pueden afectar bienestar, transporte, ingresos y continuidad educativa.'),
      q('¿Qué rechaza el texto al hablar de resiliencia?', ['La prevención comunitaria.', 'Que las personas deban adaptarse solas a los riesgos.', 'El acceso al agua segura.', 'La educación climática.'], 1, 'La resiliencia requiere infraestructura, servicios y planes, no solo esfuerzo individual.'),
      q('¿Cuál de estas medidas coincide con las propuestas del texto?', ['Eliminar toda actividad al aire libre.', 'Diseñar sombra, mejorar el acceso al agua y compartir información preventiva.', 'Esperar a que ocurra una emergencia.', 'Tratar el ambiente sin considerar desigualdad.'], 1, 'El texto propone medidas concretas y conectadas con la justicia social.'),
      q('¿Cuál es la idea central de la conclusión?', ['La educación climática debe limitarse a definiciones.', 'El cambio climático no afecta los estudios.', 'Comprender el clima implica reconocer desigualdades y participar en decisiones locales.', 'Solo importa medir la temperatura.'], 2, 'La lectura invita a relacionar datos climáticos, derechos y acción comunitaria.')
    ]
  }
};

// Remaining C1/C2 readings use distinct public-interest cases rather than a
// recurring fictional cast. The shared editorial frame keeps evidence and
// limitations visible while each entry supplies its own factual tension.
const ADVANCED_READING_BLUEPRINTS = {
  C1: {
    'justicia-y-reparacion': ['Después de una vulneración de derechos, una disculpa pública puede ser necesaria, pero rara vez basta por sí sola.', 'La reparación exige discutir qué se reconoce, quién asume responsabilidades, cómo se repara un daño material y qué cambios impiden que vuelva a ocurrir.', 'reparación, reconocimiento y garantías de no repetición', ['educationTrends']],
    'innovacion-responsable': ['Una institución anuncia un sistema automatizado para priorizar ayudas, admisiones o alertas tempranas.', 'La promesa de rapidez no responde por sí sola a preguntas sobre sesgo, explicaciones comprensibles, supervisión humana y posibilidad de corregir decisiones.', 'utilidad, transparencia y supervisión humana', ['aiStudents', 'undpAiDominicanRepublic']],
    'literatura-y-voz': ['Las redes han hecho más visible la conversación sobre ansiedad, agotamiento y bienestar emocional.', 'Esa visibilidad puede reducir el estigma, pero también convierte experiencias complejas en etiquetas rápidas, consejos sin contexto o contenido diseñado para retener atención.', 'apoyo, cuidado y límites de la exposición digital', ['adolescentMentalHealth', 'teensScreens']],
    'economia-y-cuidados': ['Muchas decisiones sobre estudio, empleo o descanso dependen de horas que no aparecen en una nómina: acompañar a un familiar, cuidar hermanos o sostener un hogar.', 'Cuando ese trabajo se presenta como una obligación privada, se ocultan sus efectos sobre tiempo disponible, ingresos, continuidad educativa y salud.', 'corresponsabilidad y reconocimiento del trabajo de cuidados', ['educationTrends']],
    'diversidad-del-espanol': ['Las plataformas conectan voces de distintos países, pero también amplifican la idea de que existe un único español neutral.', 'La comprensión mutua no requiere borrar acentos ni regionalismos; requiere reconocer el contexto, negociar significado y evitar convertir una variedad en medida de inteligencia.', 'diversidad, adecuación y respeto lingüístico', ['academyDominicanSpanish']],
    'diplomacia-y-negociacion': ['En debates públicos polarizados, el desacuerdo suele presentarse como una prueba de lealtad a un bando.', 'Una negociación seria no pide fingir que no hay conflicto: obliga a separar posiciones, intereses, datos verificables y condiciones mínimas para cualquier acuerdo.', 'mediación, criterios compartidos y rendición de cuentas', ['mediaLiteracy']],
    'critica-cultural': ['Una canción, una serie o un video puede alcanzar millones de reproducciones porque un algoritmo lo recomienda, no porque el público haya tenido acceso a un catálogo amplio.', 'Las recomendaciones facilitan descubrir obras, pero también concentran visibilidad y vuelven opacos los criterios con que se decide qué aparece primero.', 'diversidad cultural y transparencia de las recomendaciones', ['unescoAiStudentsSpanish']],
    'politicas-publicas': ['Un programa juvenil puede anunciar miles de participantes y aun así no demostrar que transformó sus oportunidades.', 'Contar asistencia es distinto de medir continuidad, aprendizaje, acceso equitativo y efectos sostenidos; por eso una evaluación debe explicar qué indicador usa y qué no puede concluir.', 'resultados, límites metodológicos y decisiones informadas', ['undpEducationDominicanRepublic']],
    'coloquio-academico': ['La participación juvenil aparece con frecuencia en foros, consultas y campañas institucionales.', 'El desafío es distinguir entre escuchar una opinión y permitir que esa opinión modifique una decisión, un presupuesto o una norma.', 'incidencia real, representación y seguimiento público', ['undpEducationDominicanRepublic']]
  },
  C2: {
    'ambiguedad-y-sentido': ['Durante una emergencia, un mensaje breve puede ser útil y, al mismo tiempo, peligroso si deja sin explicar qué se sabe, qué se infiere y qué sigue siendo incierto.', 'La comunicación responsable no elimina la incertidumbre: la nombra, sitúa sus fuentes y evita que una advertencia razonable se convierta en rumor.', 'precisión, incertidumbre y confianza pública', ['mediaLiteracy']],
    'humor-e-ironia': ['Una broma viaja por redes más rápido que el contexto que la hacía inteligible.', 'La ironía depende de quién habla, quién recibe el mensaje, qué desigualdades están en juego y si quienes son objeto de la burla pueden responder.', 'humor, poder y responsabilidad comunicativa', ['mediaLiteracy']],
    'traduccion-y-mediacion': ['Migrar implica traducir formularios, normas, recuerdos y maneras de nombrar lo cotidiano.', 'La mediación de calidad no convierte las diferencias culturales en errores: explica lo necesario, conserva matices y reconoce qué pierde una equivalencia apresurada.', 'traducción, dignidad y comprensión intercultural', ['educationTrends']],
    'filosofia-del-lenguaje': ['Palabras como seguridad, mérito, desarrollo o comunidad parecen transparentes hasta que se usan para decidir quién recibe recursos o protección.', 'Nombrar un problema no es un gesto neutral: cada categoría destaca relaciones, deja otras fuera y orienta las soluciones que parecen razonables.', 'lenguaje, poder e inferencias públicas', ['mediaLiteracy']],
    'analisis-juridico': ['Aceptar una política de privacidad con un clic suele sentirse como un acto menor, aunque autoriza usos de datos que pueden durar mucho más que la pantalla inicial.', 'El consentimiento solo es significativo cuando la finalidad, el alcance y las alternativas se explican de forma comprensible y proporcional.', 'privacidad, consentimiento y proporcionalidad', ['unescoAiStudentsSpanish']],
    'edicion-de-estilo': ['Una herramienta puede corregir una frase, resumir un párrafo o proponer una estructura en segundos.', 'La edición responsable no consiste en aceptar cada sugerencia, sino en decidir qué mejora la claridad y qué borra matices, autoría o posición argumentativa.', 'autoría, revisión y criterio editorial', ['unescoAiStudentsSpanish']],
    'debate-epistemico': ['Una publicación viral puede presentar un resultado científico como definitivo aunque proceda de una muestra pequeña, una correlación o un estudio aún no replicado.', 'La cautela no significa negar la ciencia: significa graduar lo que puede afirmarse, distinguir hallazgo de aplicación y dejar visibles los límites del método.', 'evidencia, replicabilidad y responsabilidad discursiva', ['aiStudents']],
    'estetica-y-interpretacion': ['El turismo puede sostener empleos y también transformar barrios, precios y prácticas culturales hasta volver difícil la vida cotidiana de quienes los habitan.', 'Una mirada crítica debe comparar beneficios, costos y quién tiene capacidad de decidir cómo se conserva y se muestra el patrimonio.', 'patrimonio, sostenibilidad y derecho a habitar', ['undpClimateDominicanRepublic']],
    'discurso-cientifico': ['La neuroplasticidad adulta se usa a menudo como una promesa absoluta: aprender siempre sería fácil si se aplica la técnica correcta.', 'La evidencia es más interesante y más exigente: el cerebro conserva capacidad de cambio, pero los resultados dependen de experiencia, práctica, condiciones de vida y tarea.', 'divulgación rigurosa y límites de la evidencia', ['aiStudents']],
    'mediacion-de-conflictos': ['La gestión del agua reúne necesidades que no desaparecen al repetir consignas: consumo doméstico, agricultura, turismo, salud pública y protección de ecosistemas.', 'Una negociación útil debe transformar la disputa por posiciones en preguntas sobre acceso, información, prioridades y responsabilidades compartidas.', 'agua, desigualdad y acuerdos verificables', ['undpClimateDominicanRepublic', 'undpClimateHealthDominicanRepublic']],
    'ensayo-de-alta-exigencia': ['La atención humana se ha convertido en un recurso que plataformas, medios, escuelas y anunciantes intentan organizar.', 'No basta con atribuir la distracción a una debilidad individual: el diseño de notificaciones, métricas y recomendaciones puede condicionar qué se ve, cuánto tiempo se permanece y qué conversaciones se vuelven posibles.', 'atención, autonomía y diseño de plataformas', ['teensScreens', 'socialConnection']],
    'defensa-y-sintesis': ['Los desafíos climáticos, tecnológicos y sociales se presentan a menudo como si una solución única pudiera resolverlos.', 'Una conclusión rigurosa debe integrar evidencia diversa, reconocer intereses en conflicto y explicar qué datos la modificarían sin renunciar por ello a una posición razonada.', 'síntesis, incertidumbre y responsabilidad pública', ['undpClimateDominicanRepublic', 'undpAiDominicanRepublic']]
  }
};

function buildBlueprintReading(level, slug, spec) {
  const blueprint = ADVANCED_READING_BLUEPRINTS[level]?.[slug];
  if (!blueprint) return null;
  const [, unitTitle, scenario, objective, grammar, words] = spec;
  const [opening, tension, focus, referenceKeys] = blueprint;
  const title = READING_PROFILES[level][slug][1];
  const genre = READING_PROFILES[level][slug][0];
  const expertLens = level === 'C2'
    ? `\n\nHay además una dificultad de segundo orden: los marcos con que se mide el problema pueden inclinar la conclusión. Un indicador hace visible una parte de la realidad y puede dejar otra fuera; una fuente autorizada merece atención, pero no elimina la necesidad de examinar su método, su alcance y sus intereses. El lector experto no busca una neutralidad imposible, sino criterios explícitos para comparar argumentos.`
    : '';
  const evidenceLens = `\n\nUna dificultad frecuente es confundir la abundancia de información con calidad de evidencia. Una cifra puede ser relevante y, aun así, necesitar contexto: quién la produjo, con qué método, durante cuánto tiempo y para qué población. Del mismo modo, un testimonio no prueba por sí solo una tendencia general, pero puede mostrar un efecto que las mediciones todavía no registran. El análisis avanzado compara ambas clases de evidencia en vez de obligarlas a competir.`;
  const actionLens = `\n\nEsto tiene consecuencias prácticas. Las decisiones sobre ${scenario.toLowerCase()} deberían explicitar criterios, abrir espacios para quienes recibirán sus efectos y prever mecanismos de revisión. No se trata de exigir unanimidad ni de aplazar toda acción hasta contar con datos perfectos. Se trata de actuar con razones públicas, reconocer incertidumbres y corregir cuando la experiencia contradiga una expectativa inicial.`;
  const text = `${opening}\n\n${tension}\n\nLa discusión exige una lectura que vaya más allá de una reacción inmediata. Conviene identificar qué afirmaciones están respaldadas por fuentes verificables, qué experiencias individuales iluminan una tendencia sin representarla por completo y qué preguntas siguen abiertas. En ese análisis, términos como «${words[0]}», «${words[1]}» y «${words[2]}» no son adornos: permiten describir el problema con mayor precisión.${evidenceLens}\n\nTambién importa evitar dos simplificaciones opuestas. La primera convierte cualquier innovación o cambio social en una amenaza inevitable; la segunda lo presenta como una mejora automática. Una posición responsable compara beneficios posibles, costos distribuidos de forma desigual y condiciones concretas de aplicación. Por eso, ${grammar} ayuda a formular reservas, hipótesis y consecuencias sin abandonar una tesis.${expertLens}${actionLens}\n\nEl objetivo no es cerrar el debate, sino sostener una conclusión revisable: ${objective.toLowerCase()}. Hablar de ${focus} supone reconocer que las decisiones no son puramente técnicas. Definen quién participa, qué riesgos se consideran aceptables y qué evidencia será necesaria para corregir el rumbo.`;
  const exercises = [
    q('¿Cuál es el problema central que analiza la lectura?', [focus, 'Un asunto sin relación con la unidad', 'Una anécdota privada sin consecuencias', 'Una definición aislada'], 0, 'La lectura organiza el análisis alrededor de ese problema público.'),
    q('¿Qué exige el texto antes de aceptar una conclusión?', ['Distinguir fuentes, experiencias y preguntas abiertas', 'Elegir la primera opinión disponible', 'Evitar cualquier dato', 'Reducir el tema a una sola causa'], 0, 'El texto propone una lectura crítica y verificable.'),
    q('¿Qué simplificación rechaza explícitamente?', ['Considerar beneficios, costos y condiciones', 'Tratar todo cambio como amenaza o como mejora automática', 'Usar vocabulario preciso', 'Reconocer incertidumbre'], 1, 'El texto rechaza tanto el alarmismo automático como el entusiasmo sin condiciones.'),
    q('¿Qué función cumple la gramática de la unidad?', ['Formular reservas, hipótesis y consecuencias con precisión', 'Eliminar toda postura del texto', 'Sustituir el análisis de fuentes', 'Memorizar palabras sin contexto'], 0, 'La estructura gramatical permite matizar una tesis compleja.'),
    q('¿Cómo se presenta la conclusión?', ['Como una certeza que no admite revisión', 'Como una posición revisable basada en evidencia y responsabilidades', 'Como una opinión sin razones', 'Como una decisión exclusivamente técnica'], 1, 'La lectura defiende una conclusión razonada, abierta a nueva evidencia.')
  ];
  return { title, genre, angle: opening, text, references: referenceKeys.map((key) => SPANISH_REFERENCE_LIBRARY[key]), exercises };
}

const READING_REFERENCE_KEYS = {
  'medios-y-noticias': ['mediaLiteracy'],
  'salud-y-habitos': ['teensScreens', 'adolescentMentalHealth'],
  'trabajo-del-futuro': ['educationTrends'],
  desinformacion: ['mediaLiteracy'],
  'educacion-digital': ['aiStudents'],
  'vivienda-y-desigualdad': ['educationTrends'],
  'periodismo-de-investigacion': ['mediaLiteracy'],
  'innovacion-responsable': ['aiStudents'],
  'economia-y-cuidados': ['educationTrends'],
  'politicas-publicas': ['educationTrends'],
  'coloquio-academico': ['teensScreens', 'adolescentMentalHealth'],
  'humor-e-ironia': ['mediaLiteracy'],
  'discurso-cientifico': ['aiStudents'],
  'ensayo-de-alta-exigencia': ['teensScreens', 'socialConnection'],
  'defensa-y-sintesis': ['educationTrends']
};

function readingReferences(slug) {
  return (READING_REFERENCE_KEYS[slug] || []).map((key) => SPANISH_REFERENCE_LIBRARY[key]);
}

function buildProgressiveReading(level, spec, index) {
  const [slug, unitTitle, scenario, objective, grammar, words] = spec;
  const authoredReading = level === 'C1' ? AUTHORED_C1_READINGS[slug] : null;
  if (authoredReading) {
    return {
      title: authoredReading.title,
      genre: authoredReading.genre,
      angle: authoredReading.angle,
      text: authoredReading.text,
      references: authoredReading.referenceKeys.map((key) => SPANISH_REFERENCE_LIBRARY[key])
    };
  }
  const blueprintReading = buildBlueprintReading(level, slug, spec);
  if (blueprintReading) return blueprintReading;
  if (level === 'A2') {
    const narrator = index % 2 ? 'Lucía' : 'Mateo';
    return {
      title: `${unitTitle}: una situación cotidiana`,
      genre: 'relato personal',
      references: [],
      text: [
        `Me llamo ${narrator} y esta semana necesito ${scenario.toLowerCase()}. No quiero resolverlo con prisa, porque también deseo ${objective.toLowerCase()}. Primero observo la situación, anoto lo que ya sé y preparo las preguntas que debo hacer.`,
        `Durante la actividad uso palabras importantes como «${words[0]}», «${words[1]}» y «${words[2]}». También aparecen «${words[3]}», «${words[4]}» y «${words[5]}» cuando explico los detalles. La primera opción no funciona como esperaba, así que comparo otra posibilidad y pido una aclaración antes de decidir.`,
        `Al final encuentro una solución práctica y explico los pasos en orden. Para hacerlo aplico ${grammar}. La experiencia me ayuda a hablar con más seguridad y a comprobar que pedir información clara puede evitar errores. La próxima vez podré actuar con mayor autonomía.`
      ].join('\n\n')
    };
  }

  const [genre, title, angle] = READING_PROFILES[level][slug];
  const names = ['Nadia', 'Leo', 'Camila', 'Samuel', 'Irene', 'David'];
  const places = ['la salida de clase', 'el autobús de regreso', 'la biblioteca del barrio', 'la mesa de la cocina', 'el pasillo del instituto', 'una reunión vecinal'];
  const person = names[index % names.length];
  const place = places[index % places.length];
  const levelLens = level === 'B1'
    ? 'La historia se cuenta desde lo que esa persona vio, dijo y tuvo que resolver ese día.'
    : level === 'B2'
      ? 'El caso conecta una decisión cotidiana con obstáculos que también afectan a otras personas de su edad.'
      : 'El caso sirve para examinar una experiencia concreta sin perder de vista las tensiones sociales, éticas o metodológicas que la rodean.';
  const paragraphs = [
    `Un martes, al final de ${place}, ${person} tuvo que ${scenario.toLowerCase()}. No era un ejercicio inventado: había poco tiempo, mensajes sin responder y una consecuencia concreta si elegía mal. ${angle} ${levelLens}`,
    `${person} empezó por anotar lo que podía comprobar y por preguntar a quienes estaban implicados. En la conversación aparecieron «${words[0]}», «${words[1]}» y «${words[2]}». Cada palabra nombraba algo reconocible: una necesidad, una duda o una decisión que no podía resolverse con una frase rápida.`,
    `La primera solución parecía cómoda, pero dejaba fuera un dato importante. Por eso ${person} volvió a leer los mensajes, comparó horarios, costes o responsabilidades y escuchó una versión que al principio no había considerado. El problema no desapareció, aunque cambió la pregunta: ya no era solo qué hacer, sino quién podía asumir el coste de hacerlo.`,
    `En ese momento cobraron sentido «${words[3]}», «${words[4]}» y «${words[5]}». El texto no presenta a ${person} como héroe ni como culpable: muestra una decisión pequeña dentro de reglas, recursos y expectativas que otras personas también reconocen en su vida diaria.`,
    `La salida fue ${objective.toLowerCase()}. ${person} no obtuvo una respuesta perfecta, pero pudo explicar sus razones, señalar una limitación y proponer un paso siguiente. Para narrar y matizar ese proceso se emplean ${grammar}.`
  ];
  if (['B2', 'C1', 'C2'].includes(level)) {
    paragraphs.push('También es necesario evaluar la evidencia. Un testimonio puede revelar una experiencia ignorada, pero no representa automáticamente a toda una generación; una cifra puede describir una tendencia, pero depende de la muestra y de la forma de medir. La lectura combina voces y datos sin tratarlos como pruebas intercambiables.');
  }
  if (['C1', 'C2'].includes(level)) {
    paragraphs.push('Desde una perspectiva metodológica, la tesis conserva un carácter revisable. El análisis explicita sus límites, considera una objeción plausible y señala qué información adicional podría modificar la conclusión. Esa cautela no equivale a indecisión: es responsabilidad académica frente a problemas complejos.');
  }
  if (level === 'C2') {
    paragraphs.push('Queda una dificultad epistemológica. Las categorías que organizan el debate también producen efectos: vuelven visibles ciertos daños y dejan otros en segundo plano. El lector experto examina no solo si la inferencia es válida, sino qué presupone su vocabulario, a quién concede autoridad y bajo qué condiciones podría trasladarse a otro contexto.');
  }
  return { title, genre, angle, text: paragraphs.join('\n\n'), references: readingReferences(slug) };
}

function grammarModel(grammar, words, scenario) {
  const lower = grammar.toLowerCase();
  if (/(subjuntivo|recomendación|valoración)/.test(lower)) {
    return `Es importante que la comunidad considere «${words[0]}» antes de ${scenario.toLowerCase()}.`;
  }
  if (/(condicional|hipótesis|posibilidad)/.test(lower)) {
    return `Si existieran más apoyos, muchas personas podrían afrontar «${words[0]}» de otra manera.`;
  }
  if (/(pretérito|pasado|imperfecto|indefinido|perfecto)/.test(lower)) {
    return `Cuando surgió «${words[0]}», el grupo revisó lo ocurrido y explicó sus decisiones.`;
  }
  if (/(futuro|prospectiva)/.test(lower)) {
    return `La propuesta permitirá revisar «${words[0]}» y anticipar sus consecuencias.`;
  }
  if (/(pasiva|impersonal)/.test(lower)) {
    return `En el artículo se analizan «${words[0]}» y «${words[1]}» desde perspectivas distintas.`;
  }
  if (/(estilo indirecto|cita|atribución)/.test(lower)) {
    return `Una estudiante explicó que «${words[0]}» no podía entenderse sin revisar el contexto.`;
  }
  if (/(pronombre|referencia)/.test(lower)) {
    return `La propuesta incluye «${words[0]}»; este elemento cambia la decisión final.`;
  }
  return `Aunque «${words[0]}» parece una decisión individual, conviene considerar «${words[1]}» y «${words[2]}».`;
}

const ADVANCED_LISTENING_FORMATS = {
  C1: ['podcast de tecnología', 'entrevista', 'storytelling', 'testimonio', 'podcast de psicología', 'documental corto', 'mesa redonda', 'podcast de salud', 'entrevista', 'narrativa', 'podcast de sociedad', 'historia inspiradora'],
  C2: ['investigación periodística', 'podcast tecnológico', 'entrevista exclusiva', 'documental', 'testimonio', 'debate', 'storytelling científico', 'podcast económico', 'historia real', 'entrevista', 'podcast de neurociencia', 'narrativa empresarial']
};

// The opening episode establishes the editorial voice for the C1 series: a
// natural podcast monologue, not an instructional template.
const AUTHORED_ADVANCED_LISTENING = {
  C1: {
    'memoria-y-relato': `¿Alguna vez has sentido que ya no necesitas recordar tantas cosas como antes? Hace unos años era normal memorizar números de teléfono, direcciones o incluso el camino para llegar a un lugar. Hoy basta con sacar el móvil del bolsillo y dejar que una aplicación haga el trabajo por nosotros. Algo parecido está ocurriendo con la inteligencia artificial.

Cada día millones de personas le piden ayuda para escribir correos electrónicos, resumir documentos, traducir textos, resolver ejercicios o generar ideas para un proyecto. En cuestión de segundos reciben una respuesta que, en muchos casos, parece perfectamente elaborada. La pregunta es inevitable: ¿estamos utilizando una herramienta que amplía nuestras capacidades o estamos dejando que piense por nosotros?

La historia demuestra que cada gran avance tecnológico despertó preocupaciones similares. Cuando apareció la imprenta, algunos pensaban que la memoria humana se volvería menos importante. Más tarde ocurrió lo mismo con las calculadoras y, después, con Internet. Sin embargo, ninguna de esas tecnologías eliminó la necesidad de pensar. Lo que hicieron fue cambiar la forma en que utilizábamos nuestro conocimiento.

La inteligencia artificial plantea un desafío distinto porque no solo almacena información; también puede organizarla, redactarla y presentarla como si fuera una persona. Eso explica por qué muchos estudiantes, profesionales y empresas la utilizan todos los días. El problema aparece cuando olvidamos que una respuesta bien escrita no siempre es una respuesta correcta.

Imagina que dos médicos reciben exactamente los mismos síntomas de un paciente. Ambos consultan una herramienta de inteligencia artificial. El primero acepta el diagnóstico sin hacer preguntas adicionales. El segundo utiliza esa sugerencia como punto de partida, revisa el historial clínico, solicita pruebas complementarias y conversa con el paciente antes de tomar una decisión. Los dos utilizaron la misma tecnología, pero solo uno aplicó el criterio que su profesión exige.

Lo mismo ocurre en nuestra vida cotidiana. La inteligencia artificial puede ayudarnos a ahorrar tiempo, descubrir nuevas ideas e incluso aprender más rápido. Pero sigue siendo nuestra responsabilidad verificar la información, identificar posibles errores y comprender el contexto. Ningún algoritmo conoce completamente nuestra realidad, nuestros valores o nuestras prioridades.

Existe otro aspecto menos evidente. Cuanto más dependemos de respuestas instantáneas, menos acostumbrados estamos a convivir con la duda. Y, sin embargo, las mejores decisiones rara vez nacen de respuestas inmediatas. Nacen de preguntas bien formuladas, de la curiosidad y de la capacidad para analizar diferentes perspectivas antes de llegar a una conclusión.

Quizá el verdadero cambio que estamos viviendo no sea tecnológico, sino educativo. Durante décadas aprendimos a memorizar datos. Ahora necesitamos aprender a interpretar información, evaluar fuentes y construir argumentos sólidos. En un mundo donde cualquiera puede generar miles de palabras en pocos segundos, el verdadero valor estará en quien sea capaz de pensar con profundidad.

La inteligencia artificial no decidirá el futuro por nosotros. Lo decidirá la manera en que decidamos utilizarla. Si la convertimos en un sustituto de nuestro pensamiento, perderemos una habilidad esencial. Pero si la usamos como una herramienta para ampliar nuestra creatividad y nuestro razonamiento, puede convertirse en una de las mayores aliadas del aprendizaje.

La próxima vez que una inteligencia artificial responda una de tus preguntas, no te conformes con leer la respuesta. Pregúntate de dónde proviene esa información, qué evidencia la respalda y qué otras interpretaciones podrían existir. Tal vez esa pequeña pausa sea la diferencia entre simplemente consumir información y desarrollar un pensamiento verdaderamente crítico.`
  }
};

const ADVANCED_LISTENING_OPENINGS = {
  C1: {
    'retorica-publica': 'Cuando Lucía dejó un empleo estable para crear su propia tienda digital, no estaba buscando una historia de éxito rápido. Estaba aprendiendo a convertir una habilidad en un proyecto, a convivir con la incertidumbre y a tomar decisiones sin un manual.',
    'periodismo-de-investigacion': 'A las ocho de la mañana, una ciudad entera descubrió que Internet había desaparecido. No funcionaban los pagos, las clases virtuales ni los mensajes; en pocas horas, una comodidad invisible se convirtió en una infraestructura esencial.',
    'justicia-y-reparacion': 'Vivir fuera durante un año no le enseñó a Sofía una versión mejor del mundo, sino una versión más compleja. Las costumbres que antes le parecían naturales empezaron a revelar cuánto depende nuestra mirada del lugar desde el que hablamos.',
    'innovacion-responsable': 'Hay personas que reciben un ascenso, terminan un proyecto difícil o son felicitadas por su trabajo y, aun así, creen que en cualquier momento alguien descubrirá que no merecían estar allí. Ese contraste tiene un nombre: síndrome del impostor.',
    'literatura-y-voz': 'La empresa empezó en una mesa pequeña y con un prototipo que apenas funcionaba. Lo que la distinguió no fue una idea espectacular, sino haber entendido un problema cotidiano que una industria entera llevaba años ignorando.',
    'economia-y-cuidados': 'Trabajar cuatro días por semana parece una promesa sencilla: más tiempo libre sin perder resultados. Pero cuando se prueba de verdad, aparecen preguntas sobre coordinación, horarios, salarios y el tipo de productividad que queremos medir.',
    'diversidad-del-espanol': 'Dormir poco se ha convertido en una especie de medalla social. Sin embargo, el cansancio no solo se nota al despertar: cambia nuestra concentración, nuestra paciencia y la manera en que tomamos decisiones durante el día.',
    'diplomacia-y-negociacion': 'Cuando vemos a un atleta ganar, solemos mirar el resultado final. Detrás hay una presión menos visible: lesiones, expectativas ajenas, miedo a fallar y la dificultad de descansar cuando el rendimiento define la identidad.',
    'critica-cultural': 'La decisión duró cinco segundos. No parecía heroica ni especialmente importante, pero abrió una puerta que hasta entonces había permanecido cerrada. A veces una vida cambia antes de que tengamos tiempo de entender lo que hemos elegido.',
    'politicas-publicas': 'Nunca había sido tan fácil hablar con personas que están lejos. Aun así, muchas personas describen una soledad que no desaparece con más mensajes, reacciones o seguidores. La conexión y la cercanía no siempre son lo mismo.',
    'coloquio-academico': 'A los cincuenta y seis años, Elena decidió aprender un idioma que siempre había querido hablar. No buscaba demostrar que la edad no importa; quería descubrir qué ocurre cuando la práctica y la curiosidad ocupan el lugar del miedo a equivocarse.'
  },
  C2: {
    'ambiguedad-y-sentido': 'Cada vez que una plataforma te recomienda un video, una noticia o una canción, toma una decisión basada en señales que rara vez ves. La investigación empieza cuando preguntamos qué datos se usan, qué se prioriza y quién define el objetivo.',
    'humor-e-ironia': 'Dentro de una empresa de inteligencia artificial, la promesa de lanzar antes que la competencia convive con conversaciones mucho menos visibles: qué datos se aceptan, qué errores son tolerables y quién responde cuando el sistema falla.',
    'traduccion-y-mediacion': 'Un corresponsal de guerra aprende pronto que la cámara no registra todo. Hay escenas que no se filman por seguridad, fuentes que no pueden ser nombradas y silencios que también forman parte de la historia.',
    'filosofia-del-lenguaje': 'La nueva carrera hacia Marte se presenta como un triunfo de la ciencia, pero también reúne intereses empresariales, rivalidades nacionales y una palabra incómoda: conquista. Nombrar así el proyecto cambia la forma de imaginar su futuro.',
    'analisis-juridico': 'Durante un año, Martín no abrió una sola red social. Al principio no sintió libertad, sino el vacío de un hábito: la mano buscaba el teléfono antes de que apareciera una pregunta real que responder.',
    'edicion-de-estilo': 'La pregunta no es solo si una inteligencia artificial puede escribir una canción, diseñar una imagen o proponer una campaña. La pregunta difícil es quién conserva la autoría, el criterio y las condiciones de trabajo cuando una herramienta produce tanto tan rápido.',
    'debate-epistemico': 'Cuando la científica presentó su hallazgo, casi nadie le creyó. La idea contradecía una explicación aceptada desde hacía décadas y las primeras pruebas parecían demasiado extrañas para cambiar un consenso.',
    'estetica-y-interpretacion': 'La economía de los creadores suele contarse con cifras de seguidores y reproducciones. Sin embargo, detrás de esas cifras hay contratos, algoritmos, trabajo invisible y plataformas que pueden cambiar una regla sin negociar con quienes dependen de ella.',
    'discurso-cientifico': 'En un desastre natural, una decisión tomada a tiempo puede salvar una vida. Pero esas decisiones no nacen del heroísmo individual: dependen de alertas claras, preparación previa, información confiable y personas dispuestas a coordinarse.',
    'mediacion-de-conflictos': 'A doce mil metros de altura, un piloto comercial no improvisa la calma. Cada cambio de ruta, cada aviso meteorológico y cada conversación con la tripulación forma parte de un sistema diseñado para decidir con precisión bajo presión.',
    'ensayo-de-alta-exigencia': 'Algunos recuerdos permanecen durante décadas con una intensidad sorprendente, aunque los detalles cambien con el tiempo. La neurociencia muestra que recordar no es reproducir una grabación: es reconstruir una experiencia que la emoción ha vuelto significativa.',
    'defensa-y-sintesis': 'Muchas empresas globales empiezan con una idea pequeña, a veces en un garaje. Lo difícil no es solo crecer: es descubrir qué ocurre cuando una solución local se convierte en una organización que afecta a millones de personas.'
  }
};

function countListeningWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function limitListeningWords(text, maximum) {
  if (countListeningWords(text) <= maximum) return text;
  const sentences = String(text).match(/[^.!?]+[.!?]+(?:\s|$)/g) || [];
  const selected = [];
  for (const sentence of sentences) {
    if (countListeningWords([...selected, sentence].join(' ')) > maximum) break;
    selected.push(sentence.trim());
  }
  return selected.join(' ') || String(text).split(/\s+/).slice(0, maximum).join(' ');
}

function buildAdvancedListening(level, spec, readingContent, index = 0) {
  const [slug, unitTitle, scenario, objective, grammar, words] = spec;
  const model = grammarModel(grammar, words, scenario);
  const firstParagraph = ADVANCED_LISTENING_OPENINGS[level]?.[slug]
    || String(readingContent.text || '').split(/\n\s*\n/)[0]
    || readingContent.angle;
  const expertLens = level === 'C2'
    ? 'También conviene observar cómo se construye el propio marco del debate: qué indicador se elige, qué definición se adopta y qué experiencia puede quedar fuera de la medición. Una conclusión rigurosa no oculta esa selección; la explica y señala bajo qué condiciones cambiaría.'
    : 'Una postura informada no necesita fingir que dispone de todos los datos. Puede sostener una conclusión provisional, identificar una objeción razonable y explicar qué nueva información obligaría a revisarla.';
  const c2ListeningLens = level === 'C2'
    ? 'Por eso, una escucha avanzada no se limita a localizar una respuesta literal. Debe reconocer qué presuposición sostiene el argumento, qué alternativa queda descartada y qué grado de certeza expresa cada formulación. La precisión no debilita el mensaje: permite que una decisión pública sea discutida, evaluada y, si es necesario, rectificada.'
    : '';
  const format = ADVANCED_LISTENING_FORMATS[level][index] || 'análisis sonoro';
  const progressiveTarget = level === 'C2' ? 235 : 210;
  const transcriptParts = [
    // English and French C1-C2 start with the subject itself, not with a
    // repeated instruction announcing what the audio will analyse. Keep the
    // production format in the metadata and let every Spanish monologue open
    // with its own scene, claim or question from the paired Reading.
    firstParagraph,
    `El asunto no se comprende si se reduce a una decisión individual. Para interpretarlo, debemos distinguir entre «${words[0]}», «${words[1]}» y «${words[2]}». Estos conceptos ayudan a separar lo que puede comprobarse de lo que todavía requiere contexto, contraste o una fuente adicional.`,
    `La lectura propone evitar dos respuestas fáciles: aceptar una afirmación porque parece convincente o rechazarla sin examinar sus razones. En su lugar, conviene preguntar quién produce la información, a quién afecta la decisión y cómo se distribuyen sus posibles beneficios y costos. ${model}`,
    `Desde esta perspectiva, ${objective.toLowerCase()} no consiste en repetir una conclusión. Exige argumentar con precisión, reconocer límites y escuchar perspectivas que quizá no aparezcan en la primera versión de los hechos. ${expertLens} ${c2ListeningLens}`,
    `La idea final es clara: hablar de ${unitTitle.toLowerCase()} implica tomar decisiones con responsabilidad pública. El vocabulario de la unidad —«${words[3]}», «${words[4]}» y «${words[5]}»— permite explicar esas decisiones sin simplificar el problema. Antes de cerrar, recuerda esta pregunta: ¿qué evidencia necesitarías para defender tu postura y qué evidencia te haría cambiarla?`
  ];
  const progressionLayers = [
    `En una pieza de tipo «${format}», importa distinguir entre el caso concreto y la afirmación general. Por eso, una experiencia puede abrir una pregunta sin pretender resolverla por sí sola. En ${scenario.toLowerCase()}, lo decisivo no es buscar una respuesta cómoda, sino observar qué decisiones se vuelven posibles y cuáles quedan fuera de la conversación.`,
    `También conviene identificar qué voces no aparecen todavía, qué dato sería necesario para contrastar la interpretación y qué efecto tendría la decisión sobre personas con recursos distintos. Cuando se habla de «${words[0]}», por ejemplo, conviene preguntarse quién define el término, desde qué experiencia y con qué interés se lo presenta como inevitable.`,
    `Una objeción razonable no destruye un argumento: obliga a hacerlo mejor. Puede mostrar que una solución funciona en un contexto y falla en otro, o que una ventaja visible desplaza un costo hacia personas que no participaron en la decisión. Esa tensión es parte del tema, no un detalle que deba esconderse para cerrar la historia rápidamente.`,
    `A la vez, el análisis no debe convertir toda incertidumbre en parálisis. Las personas toman decisiones con información incompleta todos los días; la diferencia está en declarar los límites, contrastar las fuentes y dejar abierta la posibilidad de corregir el rumbo. Esa actitud permite pasar de una opinión rápida a una postura realmente defendible.`,
    `Explicar estas reservas no equivale a evitar una postura. Significa ofrecer criterios para que otras personas puedan revisar el razonamiento, discutirlo con respeto y proponer una alternativa mejor fundamentada. Al escuchar, presta atención a cómo se conectan los ejemplos con la tesis: ahí suele aparecer el matiz que separa una conclusión convincente de una frase fácil de repetir.`,
    `La pregunta que queda no busca una respuesta automática. Invita a revisar qué parte del relato está respaldada por evidencia, qué parte depende de una interpretación y qué decisión tomarías tú si tuvieras que asumir sus consecuencias. Escuchar con esa atención transforma un tema popular en una conversación más útil.`
  ];
  for (const layer of progressionLayers) {
    if (countListeningWords(transcriptParts.join(' ')) >= progressiveTarget) break;
    transcriptParts.push(layer);
  }
  const rawTranscript = AUTHORED_ADVANCED_LISTENING[level]?.[slug] || transcriptParts.join(' ');
  const transcript = limitListeningWords(rawTranscript, level === 'C2' ? 240 : 215);
  const exercises = [
    q('¿Cuál es el propósito principal del audio?', ['Analizar el tema con evidencia, contexto y matices', 'Memorizar una lista sin relación con la unidad', 'Contar una historia sin conexión con el Reading', 'Dar una única respuesta definitiva'], 0, 'El audio adapta el Reading para analizarlo de forma crítica.'),
    q('¿Qué recomienda hacer ante una afirmación convincente?', ['Aceptarla de inmediato', 'Preguntar por fuentes, personas afectadas y consecuencias', 'Evitar toda comparación', 'Copiarla sin revisar'], 1, 'El audio insiste en comprobar el origen, el impacto y el contexto de la información.'),
    q('¿Para qué se usa la gramática de la unidad?', ['Para formular una idea con precisión y reservas', 'Para eliminar toda postura', 'Para repetir palabras aisladas', 'Para evitar reconocer límites'], 0, 'La estructura gramatical sirve para matizar hipótesis y conclusiones.'),
    q('¿Qué pregunta final propone el audio?', ['Qué aplicación es más rápida', 'Qué evidencia sostendría o modificaría una postura', 'Cómo evitar cualquier debate', 'Qué palabra es más difícil de pronunciar'], 1, 'La pregunta final invita a justificar y revisar una conclusión.')
  ];
  return {
    title: `Escucha · ${unitTitle}`,
    description: `${format.charAt(0).toUpperCase()}${format.slice(1)} sobre «${unitTitle}».`,
    intro: 'Escucha una adaptación integral del tema antes de consultar la transcripción.',
    mission: `Reconoce cómo el vocabulario y ${grammar} organizan una explicación oral compleja.`,
    transcript,
    phrases: [words[0], words[1], words[2], model],
    exercises
  };
}

function buildAlignedListening(level, spec, readingContent, index = 0) {
  const [slug, title, scenario, objective, grammar, words] = spec;
  const authoredTranscript = B1_B2_LISTENING_TRANSCRIPTS[level]?.[slug];
  if (authoredTranscript) {
    const format = B1_B2_LISTENING_FORMATS[level]?.[slug] || {
      label: 'Monólogo guiado',
      opening: ''
    };
    const model = grammarModel(grammar, words, scenario);
    const exercises = [
      q('¿Cuál es el tema principal del monólogo?', [scenario, 'Una historia sin relación con la unidad', 'Un anuncio de productos', 'Una conversación imaginaria'], 0, 'La persona narra una situación concreta que corresponde al tema de la unidad.'),
      q('¿Qué hace la persona antes de llegar a una conclusión?', ['Relaciona hechos, contexto y una decisión concreta', 'Memoriza una lista de palabras aisladas', 'Evita considerar otras opciones', 'Repite una opinión ajena'], 0, 'El monólogo muestra una reflexión construida a partir de una experiencia realista.'),
      q('¿Qué recurso de la unidad ayuda a expresar la experiencia?', [grammar, 'El alfabeto aislado', 'Los números cardinales', 'La ortografía de nombres propios'], 0, `El texto incluye ${grammar} en un contexto comunicativo.`),
      q('¿Qué intención tiene la conclusión?', [objective, 'Cerrar la conversación sin razones', 'Cambiar de tema sin explicar nada', 'Memorizar una regla sin usarla'], 0, 'La conclusión recupera el propósito comunicativo de la unidad.')
    ];
    return {
      title: `Escucha · ${readingContent.title}`,
      description: `${format.label}: audio de una sola voz conectado con el Reading «${readingContent.title}».`,
      intro: `Escucha este ${format.label.toLowerCase()} completo; después despliega el texto para comprobar los detalles.`,
      mission: `Reconoce cómo ${grammar} y el vocabulario de ${title.toLowerCase()} organizan una experiencia oral.`,
      transcript: [
        format.opening,
        authoredTranscript,
        B1_B2_LISTENING_PROGRESSIVE_EXTENSIONS[level]?.[slug]
      ].filter(Boolean).join(' '),
      phrases: [words[0], words[1], words[2], model],
      exercises
    };
  }
  if (level === 'C1' || level === 'C2') return buildAdvancedListening(level, spec, readingContent, index);
  const model = grammarModel(grammar, words, scenario);
  const transcript = [
    `Hoy quiero reflexionar sobre «${readingContent.title}». ${readingContent.angle || scenario} No se trata solo de una experiencia individual: también intervienen las condiciones en que estudiamos, trabajamos o convivimos.`,
    `Al observar esta situación, distingo «${words[0]}», «${words[1]}» y «${words[2]}». Después comparo «${words[3]}», «${words[4]}» y «${words[5]}», porque cada término cambia la manera de interpretar el problema y de proponer una respuesta responsable.`,
    `Mi objetivo es ${objective.toLowerCase()}. ${model} Por eso escucho testimonios, reviso la evidencia disponible y acepto que una buena conclusión puede cambiar cuando aparece información nueva.`
  ].join(' ');
  const exercises = [
    q('¿Sobre qué texto reflexiona la persona?', [readingContent.title, 'Una lección sin relación con la unidad', 'Un anuncio comercial', 'Una conversación privada'], 0, 'La primera oración menciona explícitamente el título del Reading.'),
    q('¿Qué afirma sobre el problema?', ['Que también depende de condiciones sociales', 'Que solo depende de una persona', 'Que no necesita contexto', 'Que debe ignorarse'], 0, 'La persona relaciona la experiencia con condiciones de estudio, trabajo y convivencia.'),
    q('¿Qué hace antes de proponer una respuesta?', ['Compara conceptos y revisa su significado', 'Memoriza una lista sin contexto', 'Evita toda evidencia', 'Repite una opinión ajena'], 0, 'El audio presenta los seis términos de la unidad como herramientas de análisis.'),
    q('¿Qué actitud adopta ante una conclusión?', ['Acepta revisarla con nueva información', 'La considera definitiva desde el inicio', 'Evita escuchar testimonios', 'Descarta cualquier evidencia'], 0, 'La última oración señala que la conclusión puede cambiar ante nueva información.')
  ];
  return {
    title: `Escucha · ${readingContent.title}`,
    description: `Monólogo conectado con el Reading «${readingContent.title}».`,
    intro: `Escucha la misma problemática desde la voz de una persona y reconoce el vocabulario de la unidad.`,
    mission: `Comprende una reflexión oral sobre ${title.toLowerCase()} y reconoce cómo ${grammar} aporta precisión.`,
    transcript,
    phrases: [words[0], words[1], words[2], model],
    exercises
  };
}

function buildAlignedGrammarExercises(spec) {
  const [, , scenario, , grammar, words] = spec;
  const model = grammarModel(grammar, words, scenario);
  return [
    q('¿Cuál es el foco gramatical de esta unidad?', [grammar, 'El alfabeto aislado', 'Los números cardinales', 'La ortografía de nombres propios'], 0, `La unidad trabaja ${grammar}.`),
    q('¿Qué oración usa la estructura de la unidad para hablar del Reading?', [model, `${words[0]} ${words[1]} ${words[2]}.`, `Porque ${words[0]} y ${words[1]}.`, `${words[2]} sin contexto decidir.`], 0, 'La primera opción relaciona la estructura gramatical con el tema y el vocabulario de la lección.'),
    q('¿Qué opción mantiene mejor el sentido del texto?', [`La evidencia ayuda a interpretar «${words[0]}» antes de concluir.`, `La evidencia «${words[0]}» concluir antes.`, `Interpretar evidencia porque «${words[0]}».`, `«${words[0]}» evidencia sin.`], 0, 'La primera opción presenta una relación lógica y una idea completa.'),
    q('¿Para qué sirve la estructura estudiada en esta unidad?', ['Para expresar una postura con precisión y matiz', 'Para repetir palabras sin contexto', 'Para eliminar todas las razones', 'Para evitar describir el tema'], 0, `El uso de ${grammar} permite formular mejor la perspectiva del texto.`)
  ];
}

function buildReadingExercises(level, spec, readingContent) {
  const [slug, unitTitle, scenario, objective, grammar, words] = spec;
  const authoredReading = level === 'C1' ? AUTHORED_C1_READINGS[slug] : null;
  if (authoredReading) return authoredReading.exercises;
  const blueprintReading = buildBlueprintReading(level, slug, spec);
  if (blueprintReading) return blueprintReading.exercises;
  if (level === 'A2') {
    return [
      q('¿Qué situación necesita resolver la persona que narra?', [scenario, 'Preparar un examen sin instrucciones', 'Organizar una competición deportiva', 'Cambiar de escuela'], 0, 'El primer párrafo presenta la situación cotidiana de la unidad.'),
      q('¿Qué hace antes de decidir?', ['Elige la primera opción', 'Observa, anota y prepara preguntas', 'Pide a otra persona que decida', 'Abandona la actividad'], 1, 'La persona organiza la información antes de actuar.'),
      q('¿Por qué compara otra posibilidad?', ['La primera opción no funciona como esperaba', 'Quiere gastar más dinero', 'Olvida el objetivo', 'No comprende ninguna palabra'], 0, 'El segundo párrafo explica por qué cambia de estrategia.'),
      q('¿Qué consigue al final?', ['Una solución práctica y más autonomía', 'Una respuesta memorizada', 'Evitar toda conversación', 'Resolver un problema diferente'], 0, 'La conclusión relaciona la solución con mayor seguridad y autonomía.'),
      q('¿Qué recurso gramatical aplica para explicar los pasos?', [grammar, 'Solo nombres propios', 'El alfabeto aislado', 'Únicamente números'], 0, `La lectura integra explícitamente ${grammar}.`)
    ];
  }

  const exercises = [
    q('¿Qué tipo de texto estás leyendo?', [readingContent.genre, 'manual de instrucciones', 'anuncio comercial', 'diálogo teatral'], 0, `La lectura se presenta como ${readingContent.genre}.`),
    q('¿Qué enfoque adopta el texto?', ['Relaciona decisiones personales, condiciones sociales y contexto', 'Culpa únicamente a una persona', 'Presenta una solución sin examinarla', 'Enumera palabras sin conectarlas'], 0, 'La lectura estudia el problema desde más de una escala.'),
    q('¿Para qué incorpora un contexto histórico o social?', ['Para evitar explicaciones aisladas y distinguir causas', 'Para sustituir el tema principal', 'Para añadir fechas sin función', 'Para demostrar que nada puede cambiar'], 0, 'El contexto permite comprender cómo se formaron las condiciones actuales.'),
    q('¿Cómo relaciona responsabilidad personal y factores estructurales?', ['Considera ambos sin tratarlos como opuestos', 'Elimina toda responsabilidad personal', 'Niega la influencia institucional', 'Afirma que son exactamente lo mismo'], 0, 'El texto combina acciones concretas con cambios en las condiciones.'),
    q('¿Qué propósito tiene la conclusión?', [objective, `Definir de memoria el tema «${unitTitle}»`, 'Cerrar el debate sin razones', 'Repetir literalmente el primer párrafo'], 0, 'La conclusión recupera el objetivo comunicativo de la unidad.')
  ];

  if (['B2', 'C1', 'C2'].includes(level)) {
    exercises.push(q('¿Qué precaución propone al interpretar la evidencia?', ['Distinguir entre una experiencia y una tendencia general', 'Aceptar cualquier cifra sin revisar su origen', 'Descartar todos los testimonios', 'Usar una sola fuente para decidir'], 0, 'Un testimonio y un dato aportan evidencias distintas y deben contextualizarse.'));
  }
  if (['C1', 'C2'].includes(level)) {
    exercises.push(q('¿Por qué la tesis se presenta como revisable?', ['Porque reconoce límites y nueva evidencia posible', 'Porque carece de una postura', 'Porque evita formular conclusiones', 'Porque todas las interpretaciones son idénticas'], 0, 'La revisión razonada es una práctica de responsabilidad académica.'));
  }
  if (level === 'C2') {
    exercises.push(q('¿Qué dificultad epistemológica añade el texto?', ['Las categorías del debate también determinan qué se vuelve visible', 'El vocabulario no influye en ninguna interpretación', 'Toda inferencia válida sirve en cualquier contexto', 'La autoridad de las fuentes es siempre equivalente'], 0, 'El nivel C2 examina los supuestos y efectos del propio marco conceptual.'));
  }
  return exercises;
}

function buildUnit(level, spec, index) {
  const [slug, title, scenario, objective, grammar, words] = spec;
  const person = index % 2 ? 'Lucía' : 'Mateo';
  const authoredListening = level === 'A2' ? A2_LISTENING_SCRIPTS[slug] : null;
  const readingContent = buildProgressiveReading(level, spec, index);
  const alignedListening = authoredListening ? null : buildAlignedListening(level, spec, readingContent, index);
  const text = readingContent.text;
  const readingExercises = buildReadingExercises(level, spec, readingContent);
  const listeningExercises = authoredListening?.exercises || alignedListening.exercises;
  const grammarExercises = buildAlignedGrammarExercises(spec);
  const vocabulary = words.map((word, wordIndex) => ({
    word,
    translation: `English support: ${word}`,
    definition: `Término clave para comprender «${readingContent.title}» y analizar ${scenario.toLowerCase()}.`,
    example: `${grammarModel(grammar, words, scenario)} Esta frase sitúa «${word}» dentro del tema de la unidad.`,
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
        title: readingContent.title,
        description: `${readingContent.genre}: ${title.toLowerCase()}.`,
        intro: `Lee para identificar el tema, las perspectivas, la evidencia y la conclusión.`,
        mission: objective,
        reading: {
          title: readingContent.title,
          text,
          questions: readingExercises.slice(0, 3).map((item) => item.prompt),
          references: readingContent.references
        },
        exercises: readingExercises
      }),
      listening: activity('listening', {
        title: authoredListening ? `Escucha · ${title}` : alignedListening.title,
        description: authoredListening ? `Escucha un relato conectado con ${title.toLowerCase()}.` : alignedListening.description,
        intro: authoredListening ? `Identifica el objetivo, los detalles y la conclusión del relato.` : alignedListening.intro,
        mission: authoredListening ? `Comprende un monólogo auténtico sobre ${title.toLowerCase()}.` : alignedListening.mission,
        listeningType: 'story',
        difficulty: level,
        speakers: authoredListening?.speakers || ['Narrador'],
        transcript: authoredListening?.transcript || alignedListening.transcript,
        dialogue: [],
        phrases: authoredListening?.phrases || alignedListening.phrases,
        exercises: listeningExercises,
        listeningComprehension: {
          id: `spanish-${level.toLowerCase()}-${slug}-listening-comprehension`,
          passingScore: 70,
          editoriallyReviewed: level === 'C1' || level === 'C2',
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
        mission: level === 'A2'
          ? `Representa este diálogo con otra persona y adapta un detalle de la situación: ${scenario.toLowerCase()}.`
          : `Participa en un intercambio sobre ${scenario.toLowerCase()}; usa el vocabulario de la unidad, justifica tu postura y responde a una objeción.`,
        phrases: buildSpeakingPhrases(level, slug, words),
        dialogue: buildSpeakingDialogue(level, spec, index),
        exercises: [
          { type: 'practice', prompt: level === 'A2' ? `Cambia un dato del diálogo y representa los dos papeles: ${scenario}.` : `Explica tu postura sobre este reto: ${scenario}.`, answer: 'Respuesta oral abierta' },
          { type: 'practice', prompt: `Usa al menos dos palabras de la unidad: ${words.slice(0, 3).join(', ')}.`, answer: 'Respuesta oral abierta' }
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
        grammarNote: `Foco: ${grammar}.\n\nUso: permite explicar el tema «${readingContent.title}» con precisión y matiz.\n\nModelo: ${grammarModel(grammar, words, scenario)}`,
        phrases: [grammarModel(grammar, words, scenario), `El texto relaciona «${words[0]}» con «${words[1]}».`, `Antes de concluir, conviene revisar «${words[2]}».`],
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
