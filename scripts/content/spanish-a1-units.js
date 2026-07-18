// scripts/content/spanish-a1-units.js
// Hand-authored Español A1 content: 12 thematic units, 6 activities each
// (reading/listening/speaking/writing/grammar/vocabulary). Built following
// English A1's technical structure (scripts/content/english-a1-units.js) as
// the canonical template, NOT translated from it - every text here is
// original Spanish, written for the course's own themes and progression.
// Dialogues are not a separate skill: they live inside listening activities
// via listeningType: 'dialogue' + the `dialogue` field, same mechanism
// English A1 already uses for its listening dialogues.
//
// Español latinoamericano internacional: seseo, yeísmo, vocabulario de
// amplia comprensión, sin regionalismos marcados. englishSupport/
// translation fields are optional help, hidden by default by the frontend
// (see resolveVocabTranslation()), same convention as English A1's
// Spanish `translation` fields on dialogue/vocabulary.
//
// Rich Listening fields (listeningType, phoneticSupport, dictation,
// durationSeconds, speakers) are additive beyond what English/French A1
// carry today - see supabase/migrations/202607220001_rich_listening_content.sql
// and lib/courseLessonsService.js#loadLessonFull/#checkDictation.
//
// Consumed by scripts/build-spanish-a1-seed.js, which flattens this into
// lib/seed-lessons.json (72 rows) + lib/seed-units.json (12 rows).

const language = 'spanish';
const level = 'A1';
const courseTitle = 'Español A1';
const courseDescription =
  'Español para principiantes: saludos, información personal, familia, rutinas y situaciones cotidianas, organizado en 12 unidades temáticas.';

const DEFAULTS = {
  reading: { duration: 10, xp: 25 },
  listening: { duration: 10, xp: 25 },
  speaking: { duration: 8, xp: 20 },
  writing: { duration: 12, xp: 25 },
  grammar: { duration: 8, xp: 20 },
  vocabulary: { duration: 6, xp: 20 }
};

function activity(skill, fields) {
  return { skill, duration: DEFAULTS[skill].duration, xp: DEFAULTS[skill].xp, ...fields };
}

const units = [
  // ===============================================================
  // UNIDAD 1 - ¡Hola! Mucho gusto (FREE)
  // ===============================================================
  {
    slug: 'hola-mucho-gusto',
    title: '¡Hola! Mucho gusto',
    description: 'Saludos, despedidas, presentarse y el alfabeto.',
    order: 1,
    accessTier: 'free',
    unitOverview: {
      objective: 'Presentarte, saludar y conocer a otras personas.',
      outcomes: [
        'decir tu nombre',
        'preguntar el nombre de otra persona',
        'usar saludos formales e informales',
        'deletrear información básica'
      ],
      grammar: ['verbo to be', 'subject pronouns', 'basic questions'],
      vocabulary: ['greetings', 'names', 'classroom expressions', 'numbers 0–20'],
      scenario: 'Tu primer día en una clase de inglés.'
    },
    activities: {
      reading: activity('reading', {
        title: 'El primer día de clase',
        description: 'Un texto breve sobre el primer día de clase de Valentina.',
        reading: {
          title: 'El primer día de clase',
          illustration: {
            src: '/assets/readings/spanish/a1/el-primer-dia-de-clase.webp',
            alt: 'Valentina conoce a su profesor y a un compañero en su primer día de clase'
          },
          parts: [
            'Hola, me llamo Valentina. Hoy es mi primer día de clase de español. Estoy un poco nerviosa, pero también contenta.',
            'Mi profesor se llama Diego. Él dice: "¡Buenos días, clase!" y nosotros respondemos: "¡Buenos días, profesor!".',
            'Al lado de mi silla hay un chico. Él dice: "Hola, soy Marco. Mucho gusto." Yo respondo: "Igualmente. ¿Cómo te llamas otra vez?" y él deletrea su nombre: M-A-R-C-O.'
          ],
          questions: [
            '¿Cómo se llama la estudiante?',
            '¿Cómo se llama el profesor?',
            '¿Qué hace Marco para ayudar a Valentina a recordar su nombre?'
          ],
          ordering: {
            prompt: 'Ordena los eventos de la historia.',
            events: [
              'Valentina llega a su primera clase de español.',
              'El profesor Diego saluda a la clase.',
              'Valentina conoce a Marco.',
              'Marco deletrea su nombre.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: '¿Cómo se llama el profesor?', options: ['Marco', 'Diego', 'Valentina', 'Andergo'], answer: 1 },
          { type: 'mcq', prompt: '¿Quién está al lado de Valentina?', options: ['El profesor', 'Marco', 'Nadie', 'Otra profesora'], answer: 1 },
          { type: 'mcq', prompt: '¿Cómo está Valentina al principio?', options: ['Muy triste', 'Un poco nerviosa', 'Enojada', 'Cansada'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué hace Marco para ayudar con su nombre?', options: ['Lo escribe en la pizarra', 'Lo deletrea', 'Lo canta', 'No dice nada'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Valentina y Marco se conocen antes de la clase.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: la clase responde "Buenos días" al profesor.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: Valentina está enojada en su primer día.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: Valentina está un poco nerviosa, pero también ___.', options: ['contenta', 'triste', 'cansada', 'enojada'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Mucho gusto, ¿cómo te llamas?',
        description: 'Dos personas se conocen por primera vez en la escuela.',
        listeningType: 'dialogue',
        difficulty: 'A1',
        durationSeconds: 40,
        speakers: ['Valentina', 'Marco'],
        intro: 'Escucha a Valentina y Marco conociéndose el primer día de clase. Presta atención a cómo saludan y se presentan.',
        dialogue: [
          { speaker: 'Valentina', line: '¡Hola! Me llamo Valentina. ¿Cómo te llamas tú?', translation: 'Hi! My name is Valentina. What is your name?' },
          { speaker: 'Marco', line: 'Hola, Valentina. Soy Marco. Mucho gusto.', translation: 'Hi, Valentina. I am Marco. Nice to meet you.' },
          { speaker: 'Valentina', line: 'Mucho gusto, Marco. ¿Cómo estás?', translation: 'Nice to meet you, Marco. How are you?' },
          { speaker: 'Marco', line: 'Estoy bien, gracias. ¿Y tú?', translation: 'I am fine, thanks. And you?' },
          { speaker: 'Valentina', line: 'Yo también estoy bien. ¿De dónde eres?', translation: 'I am fine too. Where are you from?' },
          { speaker: 'Marco', line: 'Soy de aquí. ¡Nos vemos en clase!', translation: 'I am from here. See you in class!' }
        ],
        transcript:
          '¡Hola! Me llamo Valentina. ¿Cómo te llamas tú? Hola, Valentina. Soy Marco. Mucho gusto. Mucho gusto, Marco. ¿Cómo estás? Estoy bien, gracias. ¿Y tú? Yo también estoy bien. ¿De dónde eres? Soy de aquí. ¡Nos vemos en clase!',
        phrases: ['¿Cómo te llamas?', 'Mucho gusto.', '¿Cómo estás?', 'Nos vemos.'],
        phoneticSupport: {
          enabled: true,
          locale: 'es-419',
          focus: 'Las cinco vocales /a e i o u/ tienen un solo sonido cada una; la "h" de "hola" no se pronuncia.',
          fullIpa: null,
          segments: [
            { text: 'Hola', ipa: '/ˈo.la/' },
            { text: 'Mucho gusto', ipa: '/ˈmu.tʃo ˈɣus.to/' }
          ],
          stressedWords: ['está', 'después'],
          syllabification: [{ word: 'nombre', syllables: 'nom-bre' }],
          difficultSounds: ['h muda'],
          reviewStatus: 'pending-review'
        },
        dictation: {
          segments: [
            { order: 0, text: 'Me llamo Valentina.' },
            { order: 1, text: 'Mucho gusto, Marco.' },
            { order: 2, text: '¿Cómo estás?' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué dice Marco cuando conoce a Valentina?', options: ['Adiós', 'Mucho gusto', '¿Qué hora es?', 'Tengo hambre'], answer: 1 },
          { type: 'mcq', prompt: '¿Cómo se despide Marco al final?', options: ['Buenos días', 'Hola', 'Nos vemos en clase', 'Gracias'], answer: 2 },
          { type: 'mcq', prompt: '¿Qué responde Marco a "¿Cómo estás?"?', options: ['Soy Marco', 'Estoy bien, gracias', 'Mucho gusto', '¿Cómo te llamas?'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Saluda y preséntate',
        description: 'Practica saludar a alguien y presentarte en voz alta.',
        mission: 'Saluda a un compañero, di tu nombre y pregúntale cómo está.',
        phrases: ['¡Hola! / Buenos días.', 'Me llamo...', 'Mucho gusto.', '¿Cómo estás?', 'Estoy bien, gracias.'],
        dialogue: [
          { speaker: 'Tú', line: '¡Hola! Me llamo...', translation: 'Hi! My name is...' },
          { speaker: 'Compañero/a', line: 'Hola, soy... Mucho gusto.', translation: 'Hi, I am... Nice to meet you.' },
          { speaker: 'Tú', line: 'Mucho gusto. ¿Cómo estás?', translation: 'Nice to meet you. How are you?' },
          { speaker: 'Compañero/a', line: 'Estoy bien, gracias. ¿Y tú?', translation: 'I am fine, thanks. And you?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Di en voz alta: "Hola, me llamo..." y termina la frase con tu propio nombre.', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Practica el diálogo de saludo con un compañero y luego cambien de rol. Si no tienes micrófono, escribe tus respuestas.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe tu presentación',
        description: 'Escribe tres oraciones simples para presentarte.',
        mission: 'Escribe 3 oraciones: tu nombre, cómo estás hoy y un saludo a un compañero.',
        phrases: ['Me llamo...', 'Estoy bien.', '¡Hola,...!'],
        dialogue: [{ speaker: 'Modelo', line: 'Me llamo Valentina. Estoy bien hoy. ¡Hola, Marco!', translation: 'My name is Valentina. I am fine today. Hello, Marco!' }],
        exercises: [
          { type: 'writing', prompt: 'Escribe 3 oraciones cortas para presentarte, usando "Me llamo...", "Estoy..." y "¡Hola, ...!".', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'El verbo ser y llamarse',
        description: 'Aprende a usar soy/eres/es y me llamo/te llamas/se llama.',
        grammarNote:
          'El verbo "ser" cambia según la persona: yo soy, tú eres, él/ella es. Usamos "llamarse" para decir el nombre: yo me llamo, tú te llamas, él/ella se llama. Ejemplo: "Yo soy Valentina. Tú eres mi amigo. Él se llama Marco." Errores frecuentes: no confundir "soy" (ser) con "estoy" (estar); "estoy" es para sentimientos y estados (Estoy bien), "soy" es para identidad (Soy Valentina).',
        phrases: ['Yo soy...', 'Tú eres...', 'Él/Ella es...', 'Me llamo...', '¿Cómo te llamas?'],
        exercises: [
          { type: 'mcq', prompt: 'Yo ___ Valentina.', options: ['soy', 'eres', 'es', 'somos'], answer: 0 },
          { type: 'mcq', prompt: 'Tú ___ mi amigo.', options: ['soy', 'eres', 'es', 'son'], answer: 1 },
          { type: 'mcq', prompt: 'Él ___ Marco.', options: ['soy', 'eres', 'se llama', 'te llamas'], answer: 2 },
          { type: 'mcq', prompt: '¿Cómo ___ (tú)?', options: ['me llamo', 'te llamas', 'se llama', 'soy'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Saludos y presentaciones',
        description: 'Palabras clave para saludar y presentarte.',
        vocabulary: [
          { word: 'Hola', category: 'saludo', translation: 'Hello', example: 'Hola, ¿cómo estás?' },
          { word: 'Buenos días', category: 'saludo', translation: 'Good morning', example: 'Buenos días, profesor.' },
          { word: 'Buenas tardes', category: 'saludo', translation: 'Good afternoon', example: 'Buenas tardes a todos.' },
          { word: 'Buenas noches', category: 'saludo', translation: 'Good evening/night', example: 'Buenas noches, hasta mañana.' },
          { word: 'Adiós', category: 'despedida', translation: 'Goodbye', example: 'Adiós, nos vemos mañana.' },
          { word: 'Hasta luego', category: 'despedida', translation: 'See you later', example: '¡Hasta luego, Marco!' },
          { word: 'Nombre', category: 'presentación', translation: 'Name', example: 'Mi nombre es Valentina.' },
          { word: 'Mucho gusto', category: 'presentación', translation: 'Nice to meet you', example: 'Mucho gusto, me llamo Diego.' },
          { word: 'Por favor', category: 'cortesía', translation: 'Please', example: 'Repite, por favor.' },
          { word: 'Gracias', category: 'cortesía', translation: 'Thank you', example: 'Gracias por tu ayuda.' },
          { word: 'De nada', category: 'cortesía', translation: "You're welcome", example: '—Gracias. —De nada.' },
          { word: 'Amigo/a', category: 'personas', translation: 'Friend', example: 'Marco es mi amigo.' },
          { word: 'Profesor/a', category: 'personas', translation: 'Teacher', example: 'Mi profesor se llama Diego.' },
          { word: 'Uno, dos, tres', category: 'números', translation: 'One, two, three', example: 'Uno, dos, tres, cuatro, cinco.' },
          { word: 'Diez', category: 'números', translation: 'Ten', example: 'Tengo diez lápices.' },
          { word: 'Veinte', category: 'números', translation: 'Twenty', example: 'Hay veinte estudiantes.' }
        ],
        exercises: [
          { type: 'mcq', prompt: '¿Qué significa "Mucho gusto"?', options: ['Nice to meet you', 'Good morning', 'Thank you', 'See you later'], answer: 0 },
          { type: 'mcq', prompt: '¿Qué significa "Gracias"?', options: ['Please', "You're welcome", 'Thank you', 'Goodbye'], answer: 2 },
          { type: 'mcq', prompt: '¿Qué significa "Profesor/a"?', options: ['Friend', 'Teacher', 'Name', 'Student'], answer: 1 }
        ]
      })
    }
  },

  // ===============================================================
  // UNIDAD 2 - Información personal (FREE)
  // ===============================================================
  {
    slug: 'informacion-personal',
    title: 'Información personal',
    description: 'Edad, nacionalidad, procedencia y datos de contacto.',
    order: 2,
    accessTier: 'free',
    activities: {
      reading: activity('reading', {
        title: 'Mi perfil',
        description: 'Un perfil breve de un estudiante de intercambio.',
        reading: {
          title: 'Mi perfil',
          parts: [
            'Me llamo Julián. Tengo veinte años y soy de Colombia, pero ahora vivo en Santo Domingo. Soy estudiante de inglés.',
            'Mi número de teléfono es el 809-555-0123 y mi correo electrónico es julian@correo.com. Vivo cerca de la escuela.',
            'Julián no es tímido; le gusta hablar con estudiantes de otros países. Su nacionalidad es colombiana y su idioma favorito para practicar es el inglés.'
          ],
          questions: [
            '¿De dónde es Julián?',
            '¿Cuántos años tiene?',
            '¿Dónde vive ahora?'
          ],
          ordering: {
            prompt: 'Ordena los eventos de la historia.',
            events: [
              'Julián se presenta con su nombre.',
              'Julián dice su edad y su país de origen.',
              'Julián comparte su teléfono y su correo.',
              'Julián explica que le gusta hablar con otros estudiantes.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: '¿Cuántos años tiene Julián?', options: ['Dieciocho', 'Diecinueve', 'Veinte', 'Veintiuno'], answer: 2 },
          { type: 'mcq', prompt: '¿De dónde es Julián?', options: ['República Dominicana', 'Colombia', 'España', 'México'], answer: 1 },
          { type: 'mcq', prompt: '¿Dónde vive ahora?', options: ['Bogotá', 'Madrid', 'Santo Domingo', 'Nueva York'], answer: 2 },
          { type: 'mcq', prompt: '¿Qué estudia Julián?', options: ['Español', 'Inglés', 'Francés', 'Matemáticas'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Julián es tímido.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Julián vive cerca de la escuela.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: la nacionalidad de Julián es dominicana.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: A Julián le gusta ___ con estudiantes de otros países.', options: ['hablar', 'dormir', 'correr', 'cocinar'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Un mensaje de voz',
        description: 'Un estudiante deja un mensaje de voz con su información personal.',
        listeningType: 'voice-message',
        difficulty: 'A1',
        durationSeconds: 35,
        speakers: ['Camila'],
        intro: 'Escucha el mensaje de voz de Camila para un nuevo compañero de clase.',
        dialogue: [],
        transcript:
          'Hola, soy Camila. Tengo diecinueve años y soy de México. Vivo en Santiago ahora. Mi número de teléfono es el 809-555-0199. Mi correo es camila@correo.com. ¡Hasta pronto!',
        phrases: ['Tengo ... años.', 'Soy de...', 'Mi número de teléfono es...', 'Mi correo es...'],
        phoneticSupport: {
          enabled: true,
          locale: 'es-419',
          focus: 'La "g" antes de e/i (Argentina no aplica aquí) y la "j" suenan como una "h" fuerte en inglés: jota, general.',
          fullIpa: null,
          segments: [
            { text: 'diecinueve', ipa: '/dje.si.ˈnwe.βe/' },
            { text: 'correo', ipa: '/ko.ˈre.o/' }
          ],
          stressedWords: ['México', 'teléfono'],
          syllabification: [{ word: 'número', syllables: 'nú-me-ro' }],
          difficultSounds: ['j / g suave'],
          reviewStatus: 'pending-review'
        },
        dictation: {
          segments: [
            { order: 0, text: 'Tengo diecinueve años.' },
            { order: 1, text: 'Soy de México.' },
            { order: 2, text: 'Mi correo es camila arroba correo punto com.' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿Cuántos años tiene Camila?', options: ['Dieciocho', 'Diecinueve', 'Veinte', 'Veintiuno'], answer: 1 },
          { type: 'mcq', prompt: '¿De dónde es Camila?', options: ['Colombia', 'México', 'España', 'Perú'], answer: 1 },
          { type: 'mcq', prompt: '¿Dónde vive ahora?', options: ['Santo Domingo', 'Santiago', 'Bogotá', 'Madrid'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Comparte tu información',
        description: 'Practica dar tu edad, tu país y tu procedencia en voz alta.',
        mission: 'Dile a un compañero tu nombre, tu edad, de dónde eres y dónde vives.',
        phrases: ['Tengo ... años.', 'Soy de...', 'Vivo en...', '¿Cuántos años tienes?'],
        dialogue: [
          { speaker: 'Tú', line: 'Tengo ... años y soy de...', translation: 'I am ... years old and I am from...' },
          { speaker: 'Compañero/a', line: '¿Dónde vives ahora?', translation: 'Where do you live now?' },
          { speaker: 'Tú', line: 'Vivo en...', translation: 'I live in...' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Di en voz alta tu edad, tu país de origen y dónde vives ahora.', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Pregúntale a un compañero "¿Cuántos años tienes?" y "¿De dónde eres?". Si no tienes micrófono, responde por escrito.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe tu perfil',
        description: 'Escribe un mini perfil con tus datos personales.',
        mission: 'Escribe 4-5 oraciones: nombre, edad, nacionalidad, dónde vives y tu correo electrónico.',
        phrases: ['Me llamo...', 'Tengo ... años.', 'Soy de...', 'Vivo en...', 'Mi correo es...'],
        dialogue: [{ speaker: 'Modelo', line: 'Me llamo Julián. Tengo veinte años. Soy de Colombia. Vivo en Santo Domingo. Mi correo es julian@correo.com.', translation: 'My name is Julián. I am twenty years old. I am from Colombia. I live in Santo Domingo. My email is julian@correo.com.' }],
        exercises: [
          { type: 'writing', prompt: 'Escribe un mini perfil de 4-5 oraciones sobre ti (nombre, edad, nacionalidad, ciudad, correo).', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Tener, ser, vivir y las preguntas básicas',
        description: 'Aprende a usar tener/ser/vivir y a formar preguntas con qué, cómo, dónde y cuántos.',
        grammarNote:
          'Usamos "tener" para la edad: yo tengo, tú tienes, él/ella tiene. Usamos "vivir" para el lugar donde vives: yo vivo, tú vives. Preguntas: ¿Qué...?, ¿Cómo...?, ¿Dónde...?, ¿Cuántos años...? La negación se forma con "no" antes del verbo: No soy de España. Error frecuente: decir "tengo veinte" sin "años" suena incompleto; siempre se dice "tengo veinte años".',
        phrases: ['Yo tengo ... años.', 'Yo vivo en...', '¿Dónde vives?', 'No soy de...'],
        exercises: [
          { type: 'mcq', prompt: 'Yo ___ veinte años.', options: ['soy', 'tengo', 'vivo', 'es'], answer: 1 },
          { type: 'mcq', prompt: '¿___ eres, de Colombia o de México?', options: ['Qué', 'Dónde', 'De dónde', 'Cuántos'], answer: 2 },
          { type: 'mcq', prompt: 'Yo no ___ de España.', options: ['soy', 'tengo', 'vive', 'eres'], answer: 0 },
          { type: 'mcq', prompt: '¿___ vives ahora?', options: ['Qué', 'Dónde', 'Cuántos', 'Cómo'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Países y datos personales',
        description: 'Palabras para hablar de nacionalidad, profesión y contacto.',
        vocabulary: [
          { word: 'País', category: 'lugar', translation: 'Country', example: '¿De qué país eres?' },
          { word: 'Colombia', category: 'país', translation: 'Colombia', example: 'Julián es de Colombia.' },
          { word: 'México', category: 'país', translation: 'Mexico', example: 'Camila es de México.' },
          { word: 'República Dominicana', category: 'país', translation: 'Dominican Republic', example: 'Vivo en República Dominicana.' },
          { word: 'Nacionalidad', category: 'identidad', translation: 'Nationality', example: 'Mi nacionalidad es colombiana.' },
          { word: 'Estudiante', category: 'profesión', translation: 'Student', example: 'Soy estudiante de inglés.' },
          { word: 'Doctor/a', category: 'profesión', translation: 'Doctor', example: 'Mi madre es doctora.' },
          { word: 'Dirección', category: 'contacto', translation: 'Address', example: 'Mi dirección es la calle 5.' },
          { word: 'Teléfono', category: 'contacto', translation: 'Phone', example: 'Mi teléfono es 809-555-0123.' },
          { word: 'Correo electrónico', category: 'contacto', translation: 'Email', example: 'Mi correo es julian@correo.com.' },
          { word: 'Treinta', category: 'número', translation: 'Thirty', example: 'Tengo treinta pesos.' },
          { word: 'Cincuenta', category: 'número', translation: 'Fifty', example: 'Hay cincuenta estudiantes.' },
          { word: 'Cien', category: 'número', translation: 'One hundred', example: 'Cuesta cien pesos.' },
          { word: 'Casado/a', category: 'estado', translation: 'Married', example: 'Mi hermano está casado.' },
          { word: 'Soltero/a', category: 'estado', translation: 'Single', example: 'Soy soltera.' }
        ],
        exercises: [
          { type: 'mcq', prompt: '¿Qué significa "Nacionalidad"?', options: ['Nationality', 'Address', 'Phone', 'Country'], answer: 0 },
          { type: 'mcq', prompt: '¿Qué significa "Correo electrónico"?', options: ['Address', 'Email', 'Phone', 'Country'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "Soltero/a"?', options: ['Married', 'Single', 'Student', 'Doctor'], answer: 1 }
        ]
      })
    }
  },

  // ===============================================================
  // UNIDAD 3 - Mi familia y mis amigos (PREMIUM)
  // ===============================================================
  {
    slug: 'mi-familia-y-mis-amigos',
    title: 'Mi familia y mis amigos',
    description: 'Miembros de la familia, posesivos y describir personas.',
    order: 3,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'Mi familia',
        description: 'Un texto sobre la familia de Sofía.',
        reading: {
          title: 'Mi familia',
          parts: [
            'Esta es mi familia. Mi madre se llama Carmen y mi padre se llama Rafael. Ellos trabajan cerca de la casa.',
            'Tengo un hermano y una hermana. Mi hermana se llama Lucía; tiene dieciséis años y es alta y simpática. Mi hermano se llama Tomás; tiene nueve años.',
            'Mi abuela Rosa vive con nosotros. Es una persona muy amable y cocina muy bien. Los domingos, toda la familia almuerza junta.'
          ],
          questions: [
            '¿Cómo se llama la madre?',
            '¿Cuántos hermanos tiene la escritora?',
            '¿Quién vive con la familia además de los padres?'
          ],
          ordering: {
            prompt: 'Ordena los eventos de la historia.',
            events: [
              'Sofía presenta a sus padres.',
              'Sofía describe a su hermana Lucía.',
              'Sofía describe a su hermano Tomás.',
              'La familia almuerza junta el domingo.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: '¿Cómo se llama el padre?', options: ['Tomás', 'Rafael', 'Rosa', 'Lucía'], answer: 1 },
          { type: 'mcq', prompt: '¿Cuántos años tiene Lucía?', options: ['Nueve', 'Doce', 'Dieciséis', 'Veinte'], answer: 2 },
          { type: 'mcq', prompt: '¿Quién es Rosa?', options: ['La madre', 'La hermana', 'La abuela', 'Una amiga'], answer: 2 },
          { type: 'mcq', prompt: '¿Cómo es Lucía?', options: ['Baja y tímida', 'Alta y simpática', 'Alta y triste', 'Baja y seria'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Tomás tiene nueve años.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: la familia almuerza junta los lunes.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: la abuela cocina muy bien.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: Rosa es una persona muy ___ y cocina muy bien.', options: ['amable', 'enojada', 'perezosa', 'triste'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Esta es mi hermana',
        description: 'Una persona describe a su familia a partir de una foto.',
        listeningType: 'story',
        difficulty: 'A1',
        durationSeconds: 45,
        speakers: ['Narrador/a'],
        intro: 'Escucha una descripción de la familia de Sofía mientras muestra una foto.',
        dialogue: [],
        transcript:
          'Esta es mi familia. Mi madre se llama Carmen y mi padre se llama Rafael. Tengo una hermana y un hermano. Mi hermana se llama Lucía, tiene dieciséis años y es alta. Mi hermano se llama Tomás y tiene nueve años. Mi abuela Rosa también vive con nosotros; ella es muy amable.',
        phrases: ['Esta es mi...', 'Se llama...', 'Tiene ... años.', 'Es alto/a, simpático/a...'],
        phoneticSupport: {
          enabled: true,
          locale: 'es-419',
          focus: 'La "r" simple (una vibración: pero, cara) frente a la "r" múltiple (rr, o "r" al inicio de palabra: perro, Rafael); la "ñ" es un sonido distinto de "n".',
          fullIpa: null,
          segments: [
            { text: 'hermana', ipa: '/er.ˈma.na/' },
            { text: 'Rafael', ipa: '/r̄a.fa.ˈel/' }
          ],
          stressedWords: ['también', 'está'],
          syllabification: [{ word: 'abuela', syllables: 'a-bue-la' }],
          difficultSounds: ['r simple /ɾ/', 'r múltiple /r/', 'ñ /ɲ/'],
          reviewStatus: 'pending-review'
        },
        dictation: {
          segments: [
            { order: 0, text: 'Esta es mi familia.' },
            { order: 1, text: 'Mi hermana se llama Lucía.' },
            { order: 2, text: 'Tiene dieciséis años.' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿Cómo se llama la hermana?', options: ['Rosa', 'Carmen', 'Lucía', 'Tomás'], answer: 2 },
          { type: 'mcq', prompt: '¿Cuántos años tiene el hermano?', options: ['Seis', 'Nueve', 'Once', 'Dieciséis'], answer: 1 },
          { type: 'mcq', prompt: '¿Quién más vive con la familia?', options: ['Un perro', 'La abuela', 'Un primo', 'Nadie más'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Describe a tu familia',
        description: 'Practica hablar sobre las personas de tu familia.',
        mission: 'Cuéntale a un compañero sobre dos personas de tu familia: quiénes son y un dato de cada una.',
        phrases: ['Esta es mi madre/mi padre.', 'Tengo una hermana/un hermano.', 'Se llama...', 'Tiene ... años.'],
        dialogue: [
          { speaker: 'Tú', line: 'Tengo una hermana. Se llama...', translation: 'I have a sister. Her name is...' },
          { speaker: 'Compañero/a', line: '¿Cuántos años tiene?', translation: 'How old is she?' },
          { speaker: 'Tú', line: 'Tiene ... años.', translation: 'She is ... years old.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Di en voz alta dos oraciones sobre un familiar (nombre y edad o una característica).', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Pregúntale a un compañero "¿Tienes hermanos?" y escucha su respuesta. Si no tienes micrófono, responde por escrito.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe sobre tu familia',
        description: 'Escribe un párrafo corto describiendo a tu familia.',
        mission: 'Escribe 4-5 oraciones sobre tu familia: quiénes son y un detalle de cada persona.',
        phrases: ['Esta es mi familia.', 'Tengo un/una...', '...se llama...', 'Tiene ... años.'],
        dialogue: [{ speaker: 'Modelo', line: 'Esta es mi familia. Tengo una hermana. Mi hermana se llama Lucía. Tiene dieciséis años.', translation: 'This is my family. I have a sister. My sister is called Lucía. She is sixteen years old.' }],
        exercises: [
          { type: 'writing', prompt: 'Escribe 4-5 oraciones describiendo a los miembros de tu familia y un detalle de cada uno.', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Posesivos, género y número',
        description: 'Aprende a usar mi/mis, tu/tus, su/sus y la concordancia de artículos y adjetivos.',
        grammarNote:
          'Los posesivos concuerdan en número con lo que poseemos: mi hermano / mis hermanos. Los artículos y adjetivos concuerdan en género y número con el sustantivo: el hermano alto, la hermana alta, los hermanos altos. Error frecuente: usar "mi" con sustantivos plurales (decir "mi hermanos" en vez de "mis hermanos").',
        phrases: ['mi hermano / mis hermanos', 'tu familia', 'su abuela', 'la hermana alta'],
        exercises: [
          { type: 'mcq', prompt: '___ hermana se llama Lucía. (yo)', options: ['Mi', 'Mis', 'Tu', 'Su'], answer: 0 },
          { type: 'mcq', prompt: 'Tengo dos hermanos: ___ hermanos son simpáticos.', options: ['mi', 'mis', 'su', 'tu'], answer: 1 },
          { type: 'mcq', prompt: 'Lucía es ___ (alto, femenino).', options: ['alto', 'alta', 'altos', 'altas'], answer: 1 },
          { type: 'mcq', prompt: 'Elige la oración correcta.', options: ['Mi hermanos son altos.', 'Mis hermanos son altos.', 'Mi hermanos es alto.', 'Mis hermano son alto.'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Miembros de la familia',
        description: 'Palabras para las personas de tu familia y su apariencia.',
        vocabulary: [
          { word: 'Madre', category: 'familia', translation: 'Mother', example: 'Mi madre se llama Carmen.' },
          { word: 'Padre', category: 'familia', translation: 'Father', example: 'Mi padre trabaja cerca de casa.' },
          { word: 'Hermana', category: 'familia', translation: 'Sister', example: 'Mi hermana tiene dieciséis años.' },
          { word: 'Hermano', category: 'familia', translation: 'Brother', example: 'Mi hermano tiene nueve años.' },
          { word: 'Abuela', category: 'familia', translation: 'Grandmother', example: 'Mi abuela es muy amable.' },
          { word: 'Abuelo', category: 'familia', translation: 'Grandfather', example: 'Mi abuelo cuenta buenas historias.' },
          { word: 'Primo/a', category: 'familia', translation: 'Cousin', example: 'Mi primo vive en Santiago.' },
          { word: 'Alto/a', category: 'apariencia', translation: 'Tall', example: 'Lucía es alta.' },
          { word: 'Bajo/a', category: 'apariencia', translation: 'Short', example: 'Tomás es bajo.' },
          { word: 'Simpático/a', category: 'personalidad', translation: 'Friendly/nice', example: 'Mi hermana es simpática.' },
          { word: 'Amable', category: 'personalidad', translation: 'Kind', example: 'Mi abuela es amable.' },
          { word: 'Casado/a', category: 'estado civil', translation: 'Married', example: 'Mis padres están casados.' },
          { word: 'Soltero/a', category: 'estado civil', translation: 'Single', example: 'Mi tío es soltero.' },
          { word: 'Tío/a', category: 'familia', translation: 'Uncle/aunt', example: 'Mi tío vive en Santiago.' },
          { word: 'Familia', category: 'familia', translation: 'Family', example: 'Somos una familia feliz.' }
        ],
        exercises: [
          { type: 'mcq', prompt: '¿Qué significa "Hermano"?', options: ['Sister', 'Brother', 'Father', 'Cousin'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "Abuela"?', options: ['Grandfather', 'Mother', 'Grandmother', 'Cousin'], answer: 2 },
          { type: 'mcq', prompt: '¿Qué significa "Simpático/a"?', options: ['Tall', 'Short', 'Friendly/nice', 'Married'], answer: 2 }
        ]
      })
    }
  },

  // ===============================================================
  // UNIDAD 4 - Mi rutina diaria (PREMIUM)
  // ===============================================================
  {
    slug: 'mi-rutina-diaria',
    title: 'Mi rutina diaria',
    description: 'Actividades cotidianas, la hora y el presente de indicativo.',
    order: 4,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'Un día normal',
        description: 'Un texto sobre la rutina diaria de Valentina.',
        reading: {
          title: 'Un día normal',
          parts: [
            'Todos los días me despierto a las seis y media. Primero me lavo la cara y luego desayuno con mi familia.',
            'Camino a la escuela con mi amiga Camila. Las clases empiezan a las ocho de la mañana y terminan a las dos de la tarde.',
            'Por la noche, ceno con mi familia a las siete. Después leo un poco y me acuesto a las nueve y media.'
          ],
          questions: [
            '¿A qué hora se despierta la escritora?',
            '¿Con quién camina a la escuela?',
            '¿A qué hora se acuesta?'
          ],
          ordering: {
            prompt: 'Ordena los eventos de la historia.',
            events: [
              'Valentina se despierta y desayuna.',
              'Valentina camina a la escuela con Camila.',
              'Las clases terminan a las dos.',
              'Valentina cena y se acuesta a las nueve y media.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: '¿A qué hora se despierta?', options: ['Seis', 'Seis y media', 'Siete', 'Ocho'], answer: 1 },
          { type: 'mcq', prompt: '¿Con quién camina a la escuela?', options: ['Con su hermana', 'Con Camila', 'Sola', 'Con su madre'], answer: 1 },
          { type: 'mcq', prompt: '¿A qué hora empiezan las clases?', options: ['Siete', 'Ocho', 'Nueve', 'Diez'], answer: 1 },
          { type: 'mcq', prompt: '¿A qué hora se acuesta?', options: ['Ocho y media', 'Nueve', 'Nueve y media', 'Diez'], answer: 2 },
          { type: 'mcq', prompt: 'Verdadero o falso: cena con su familia.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: las clases terminan a las tres.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: lee un poco antes de dormir.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: primero me lavo la cara y ___ desayuno.', options: ['luego', 'nunca', 'ayer', 'tarde'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: '¿A qué hora te levantas?',
        description: 'Dos amigos comparan sus rutinas diarias.',
        listeningType: 'dialogue',
        difficulty: 'A1',
        durationSeconds: 45,
        speakers: ['Diego', 'Tomás'],
        intro: 'Escucha a Diego y Tomás hablando sobre lo que hacen todos los días.',
        dialogue: [
          { speaker: 'Diego', line: '¿A qué hora te levantas, Tomás?', translation: 'What time do you get up, Tomás?' },
          { speaker: 'Tomás', line: 'Me levanto a las seis y media. ¿Y tú?', translation: 'I get up at six thirty. And you?' },
          { speaker: 'Diego', line: 'Yo me levanto a las siete. Luego desayuno rápido.', translation: 'I get up at seven. Then I have breakfast quickly.' },
          { speaker: 'Tomás', line: '¿Caminas a la escuela?', translation: 'Do you walk to school?' },
          { speaker: 'Diego', line: 'Sí, camino con mi hermana todos los días.', translation: 'Yes, I walk with my sister every day.' },
          { speaker: 'Tomás', line: 'Yo tomo el autobús. Las clases empiezan a las ocho.', translation: 'I take the bus. Classes start at eight.' }
        ],
        transcript:
          '¿A qué hora te levantas, Tomás? Me levanto a las seis y media. ¿Y tú? Yo me levanto a las siete. Luego desayuno rápido. ¿Caminas a la escuela? Sí, camino con mi hermana todos los días. Yo tomo el autobús. Las clases empiezan a las ocho.',
        phrases: ['¿A qué hora te levantas?', 'Me levanto a las...', 'Camino a la escuela.', 'Las clases empiezan a las...'],
        phoneticSupport: {
          enabled: true,
          locale: 'es-419',
          focus: 'Enlace natural entre palabras (me_levanto suena como una sola unidad); las terminaciones -o/-as/-a marcan la persona del verbo.',
          fullIpa: null,
          segments: [
            { text: 'me levanto', ipa: '/me le.ˈβan.to/' },
            { text: 'desayuno', ipa: '/de.sa.ˈʝu.no/' }
          ],
          stressedWords: ['después', 'también'],
          syllabification: [{ word: 'escuela', syllables: 'es-cue-la' }],
          difficultSounds: ['enlaces entre palabras'],
          reviewStatus: 'pending-review'
        },
        dictation: {
          segments: [
            { order: 0, text: 'Me levanto a las seis y media.' },
            { order: 1, text: 'Camino con mi hermana todos los días.' },
            { order: 2, text: 'Las clases empiezan a las ocho.' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿A qué hora se levanta Tomás?', options: ['Seis y media', 'Siete', 'Ocho', 'Nueve'], answer: 0 },
          { type: 'mcq', prompt: '¿Cómo va Diego a la escuela?', options: ['En autobús', 'En carro', 'Camina', 'En bicicleta'], answer: 2 },
          { type: 'mcq', prompt: '¿A qué hora empiezan las clases?', options: ['Seis y media', 'Siete', 'Ocho', 'Nueve'], answer: 2 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Habla de tu día',
        description: 'Practica describir tu rutina diaria.',
        mission: 'Cuéntale a un compañero tres cosas que haces todos los días y a qué hora las haces.',
        phrases: ['Me levanto a las...', 'Voy a la escuela a las...', 'Hago mi tarea...', 'Me acuesto a las...'],
        dialogue: [
          { speaker: 'Tú', line: 'Me levanto a las... y desayuno a las...', translation: 'I get up at... and I have breakfast at...' },
          { speaker: 'Compañero/a', line: '¿A qué hora te acuestas?', translation: 'What time do you go to bed?' },
          { speaker: 'Tú', line: 'Me acuesto a las...', translation: 'I go to bed at...' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Di en voz alta tres cosas que haces cada día, con la hora de cada una.', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Pregúntale a un compañero "¿A qué hora te levantas?" y compara tu respuesta. Si no tienes micrófono, responde por escrito.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe tu rutina diaria',
        description: 'Escribe un párrafo corto sobre tu día típico.',
        mission: 'Escribe 4-5 oraciones sobre tu rutina diaria, desde que te levantas hasta que te acuestas.',
        phrases: ['Me levanto a las...', 'Después...', 'Por la noche...', 'Me acuesto a las...'],
        dialogue: [{ speaker: 'Modelo', line: 'Me levanto a las seis y media. Desayuno y camino a la escuela. Después de la escuela, hago mi tarea. Me acuesto a las nueve y media.', translation: 'I get up at six thirty. I have breakfast and walk to school. After school, I do my homework. I go to bed at nine thirty.' }],
        exercises: [
          { type: 'writing', prompt: 'Escribe 4-5 oraciones describiendo tu rutina diaria, de la mañana a la noche.', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Presente regular y verbos reflexivos',
        description: 'Aprende el presente de indicativo y los verbos reflexivos frecuentes.',
        grammarNote:
          'El presente regular cambia la terminación según la persona: yo camino, tú caminas, él camina. Los verbos reflexivos usan un pronombre antes del verbo: yo me levanto, tú te levantas, él se levanta. Usamos "primero, después, luego, finalmente" para ordenar acciones. Error frecuente: olvidar el pronombre reflexivo (decir "yo levanto" en vez de "yo me levanto").',
        phrases: ['Yo me levanto...', 'Tú te levantas...', 'Primero..., después..., luego..., finalmente...'],
        exercises: [
          { type: 'mcq', prompt: 'Yo ___ a las siete. (levantarse)', options: ['levanto', 'me levanto', 'te levantas', 'se levanta'], answer: 1 },
          { type: 'mcq', prompt: 'Ella ___ a la escuela. (caminar)', options: ['camino', 'caminas', 'camina', 'caminan'], answer: 2 },
          { type: 'mcq', prompt: '___ me despierto, ___ desayuno.', options: ['Primero / después', 'Nunca / siempre', 'Ayer / hoy', 'Mañana / hoy'], answer: 0 },
          { type: 'mcq', prompt: 'Nosotros ___ a las nueve. (acostarse)', options: ['acostamos', 'nos acostamos', 'te acuestas', 'se acuesta'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Acciones diarias',
        description: 'Verbos y palabras para la rutina diaria.',
        vocabulary: [
          { word: 'Despertarse', category: 'rutina', translation: 'To wake up', example: 'Me despierto a las seis y media.' },
          { word: 'Levantarse', category: 'rutina', translation: 'To get up', example: 'Me levanto a las siete.' },
          { word: 'Desayuno', category: 'comida', translation: 'Breakfast', example: 'Desayuno todos los días.' },
          { word: 'Almuerzo', category: 'comida', translation: 'Lunch', example: 'El almuerzo es a la una.' },
          { word: 'Cena', category: 'comida', translation: 'Dinner', example: 'Cenamos a las siete.' },
          { word: 'Caminar', category: 'rutina', translation: 'To walk', example: 'Camino a la escuela.' },
          { word: 'Tarea', category: 'escuela', translation: 'Homework', example: 'Hago mi tarea después de la escuela.' },
          { word: 'Acostarse', category: 'rutina', translation: 'To go to bed', example: 'Me acuesto a las nueve y media.' },
          { word: 'Todos los días', category: 'frecuencia', translation: 'Every day', example: 'Me cepillo los dientes todos los días.' },
          { word: 'Mañana', category: 'tiempo', translation: 'Morning', example: 'Por la mañana, desayuno.' },
          { word: 'Tarde', category: 'tiempo', translation: 'Afternoon', example: 'Por la tarde, hago mi tarea.' },
          { word: 'Noche', category: 'tiempo', translation: 'Night', example: 'Por la noche, ceno con mi familia.' },
          { word: 'Ducharse', category: 'rutina', translation: 'To shower', example: 'Me ducho antes de desayunar.' },
          { word: 'Vestirse', category: 'rutina', translation: 'To get dressed', example: 'Me visto después de ducharme.' },
          { word: 'Cepillarse los dientes', category: 'rutina', translation: 'To brush your teeth', example: 'Me cepillo los dientes todos los días.' }
        ],
        exercises: [
          { type: 'mcq', prompt: '¿Qué significa "Despertarse"?', options: ['To wake up', 'To go to bed', 'Breakfast', 'Homework'], answer: 0 },
          { type: 'mcq', prompt: '¿Qué significa "Cena"?', options: ['Breakfast', 'Dinner', 'Homework', 'School'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "Acostarse"?', options: ['To get up', 'To wake up', 'To go to bed', 'To walk'], answer: 2 }
        ]
      })
    }
  },

  // ===============================================================
  // UNIDAD 5 - Mi casa (PREMIUM)
  // ===============================================================
  {
    slug: 'mi-casa',
    title: 'Mi casa',
    description: 'Habitaciones, muebles y describir una vivienda.',
    order: 5,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'Mi casa es pequeña pero cómoda',
        description: 'Una descripción de la casa de Andrés.',
        reading: {
          title: 'Mi casa es pequeña pero cómoda',
          parts: [
            'Mi casa tiene tres habitaciones: mi dormitorio, el dormitorio de mis padres y la sala. También hay una cocina y un baño.',
            'En la sala hay un sofá, una mesa y un televisor. En mi dormitorio hay una cama, un armario y un escritorio para estudiar.',
            'Detrás de la casa hay un patio pequeño con plantas. No hay piscina, pero a mi familia le gusta sentarse afuera por la tarde.'
          ],
          questions: [
            '¿Cuántas habitaciones tiene la casa?',
            '¿Qué hay en la sala?',
            '¿Qué hay detrás de la casa?'
          ],
          ordering: {
            prompt: 'Ordena los eventos de la historia.',
            events: [
              'Andrés describe las habitaciones de la casa.',
              'Andrés describe los muebles de la sala.',
              'Andrés describe los muebles de su dormitorio.',
              'Andrés describe el patio detrás de la casa.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: '¿Cuántas habitaciones tiene la casa (sin contar cocina y baño)?', options: ['Dos', 'Tres', 'Cuatro', 'Cinco'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué hay en la sala?', options: ['Una cama', 'Un sofá, una mesa y un televisor', 'Un escritorio', 'Plantas'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué hay en el dormitorio de Andrés?', options: ['Un sofá', 'Una cama, un armario y un escritorio', 'Una piscina', 'Un televisor'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué hay detrás de la casa?', options: ['Un garaje', 'Una piscina', 'Un patio con plantas', 'Nada'], answer: 2 },
          { type: 'mcq', prompt: 'Verdadero o falso: la casa tiene piscina.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: hay un escritorio en el dormitorio de Andrés.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: a la familia le gusta sentarse en el patio.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: mi casa es pequeña pero muy ___.', options: ['cómoda', 'fría', 'ruidosa', 'vacía'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Así es mi casa',
        description: 'Una persona describe su casa habitación por habitación.',
        listeningType: 'story',
        difficulty: 'A1',
        durationSeconds: 50,
        speakers: ['Narrador/a'],
        intro: 'Escucha una descripción de una casa: sus habitaciones y sus muebles.',
        dialogue: [],
        transcript:
          'Mi casa tiene tres habitaciones y una sala grande. En la sala hay un sofá y una mesa. En la cocina hay una nevera y una estufa. Mi dormitorio tiene una cama y un armario. Hay dos baños en la casa. Detrás de la casa hay un patio pequeño.',
        phrases: ['Hay un/una...', 'En la sala hay...', 'Mi dormitorio tiene...', 'Detrás de la casa hay...'],
        phoneticSupport: {
          enabled: true,
          locale: 'es-419',
          focus: 'La "y" y la "ll" suenan igual en yeísmo (silla, yo); las sílabas pueden ser abiertas (ca-sa) o cerradas (ar-mario, cierran en consonante).',
          fullIpa: null,
          segments: [
            { text: 'silla', ipa: '/ˈsi.ʝa/' },
            { text: 'armario', ipa: '/ar.ˈma.rjo/' }
          ],
          stressedWords: ['está', 'también'],
          syllabification: [{ word: 'cocina', syllables: 'co-ci-na' }],
          difficultSounds: ['y/ll yeísmo'],
          reviewStatus: 'pending-review'
        },
        dictation: {
          segments: [
            { order: 0, text: 'Mi casa tiene tres habitaciones.' },
            { order: 1, text: 'En la sala hay un sofá y una mesa.' },
            { order: 2, text: 'Mi dormitorio tiene una cama y un armario.' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué hay en la sala?', options: ['Una cama', 'Un sofá y una mesa', 'Una nevera', 'Un patio'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué hay en la cocina?', options: ['Un sofá', 'Una nevera y una estufa', 'Un armario', 'Un baño'], answer: 1 },
          { type: 'mcq', prompt: '¿Cuántos baños tiene la casa?', options: ['Uno', 'Dos', 'Tres', 'Ninguno'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Describe tu casa',
        description: 'Practica describir las habitaciones de tu casa.',
        mission: 'Descríbele a un compañero dos habitaciones de tu casa y qué hay en ellas.',
        phrases: ['En mi casa hay...', 'En la sala hay...', 'Mi dormitorio tiene...', '¿Qué hay en tu cocina?'],
        dialogue: [
          { speaker: 'Tú', line: 'En mi sala hay un sofá y una mesa.', translation: 'In my living room there is a sofa and a table.' },
          { speaker: 'Compañero/a', line: '¿Qué hay en tu dormitorio?', translation: "What's in your bedroom?" },
          { speaker: 'Tú', line: 'Hay una cama y un armario.', translation: 'There is a bed and a closet.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Describe en voz alta dos habitaciones de tu casa y los muebles que hay en cada una.', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Pregúntale a un compañero "¿Qué hay en tu casa?" y escucha su respuesta. Si no tienes micrófono, responde por escrito.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe sobre tu casa',
        description: 'Escribe una descripción corta de tu casa.',
        mission: 'Escribe 5-6 oraciones describiendo tu casa: cuántas habitaciones tiene y qué hay en ellas.',
        phrases: ['Mi casa tiene...', 'En la sala hay...', 'Mi dormitorio tiene...', 'Detrás/delante de la casa hay...'],
        dialogue: [{ speaker: 'Modelo', line: 'Mi casa tiene tres habitaciones. En la sala hay un sofá y un televisor. Mi dormitorio tiene una cama y un escritorio.', translation: 'My house has three rooms. In the living room there is a sofa and a TV. My bedroom has a bed and a desk.' }],
        exercises: [
          { type: 'writing', prompt: 'Escribe 5-6 oraciones describiendo tu casa y los muebles que hay en ella.', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Hay, estar y las preposiciones de lugar',
        description: 'Aprende a usar hay/estar y a decir dónde están las cosas.',
        grammarNote:
          '"Hay" se usa para decir que algo existe: Hay un sofá en la sala. No cambia de forma. "Estar" se usa para decir dónde está algo específico: El sofá está en la sala. Preposiciones de lugar: en, cerca de, lejos de, detrás de, delante de. Error frecuente: confundir "hay" con "está/están" (decir "el sofá hay en la sala" en vez de "el sofá está en la sala").',
        phrases: ['Hay un/una...', 'El sofá está en...', 'detrás de la casa', 'cerca de la cocina'],
        exercises: [
          { type: 'mcq', prompt: '___ un sofá en la sala.', options: ['Hay', 'Está', 'Son', 'Es'], answer: 0 },
          { type: 'mcq', prompt: 'El armario ___ en mi dormitorio.', options: ['hay', 'está', 'son', 'es'], answer: 1 },
          { type: 'mcq', prompt: 'El patio está ___ de la casa.', options: ['detrás', 'es', 'hay', 'son'], answer: 0 },
          { type: 'mcq', prompt: '___ dos baños en mi casa.', options: ['Está', 'Son', 'Hay', 'Es'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'La casa y los muebles',
        description: 'Palabras para las habitaciones y los muebles de una casa.',
        vocabulary: [
          { word: 'Sala', category: 'habitación', translation: 'Living room', example: 'En la sala hay un sofá.' },
          { word: 'Cocina', category: 'habitación', translation: 'Kitchen', example: 'La cocina tiene una nevera.' },
          { word: 'Dormitorio', category: 'habitación', translation: 'Bedroom', example: 'Mi dormitorio es pequeño.' },
          { word: 'Baño', category: 'habitación', translation: 'Bathroom', example: 'El baño está al lado de la cocina.' },
          { word: 'Patio', category: 'habitación', translation: 'Yard/patio', example: 'El patio tiene plantas.' },
          { word: 'Sofá', category: 'mueble', translation: 'Sofa', example: 'El sofá es cómodo.' },
          { word: 'Cama', category: 'mueble', translation: 'Bed', example: 'Mi cama es grande.' },
          { word: 'Armario', category: 'mueble', translation: 'Closet/wardrobe', example: 'La ropa está en el armario.' },
          { word: 'Mesa', category: 'mueble', translation: 'Table', example: 'La mesa está en la cocina.' },
          { word: 'Escritorio', category: 'mueble', translation: 'Desk', example: 'Estudio en mi escritorio.' },
          { word: 'Nevera', category: 'electrodoméstico', translation: 'Refrigerator', example: 'La nevera está en la cocina.' },
          { word: 'Televisor', category: 'electrodoméstico', translation: 'Television', example: 'El televisor está en la sala.' },
          { word: 'Cerca de', category: 'ubicación', translation: 'Near', example: 'La escuela está cerca de mi casa.' },
          { word: 'Lejos de', category: 'ubicación', translation: 'Far from', example: 'El parque está lejos de aquí.' },
          { word: 'Ventana', category: 'mueble', translation: 'Window', example: 'La ventana de mi dormitorio es grande.' }
        ],
        exercises: [
          { type: 'mcq', prompt: '¿Qué significa "Dormitorio"?', options: ['Kitchen', 'Bedroom', 'Bathroom', 'Living room'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "Armario"?', options: ['Bed', 'Table', 'Closet/wardrobe', 'Desk'], answer: 2 },
          { type: 'mcq', prompt: '¿Qué significa "Cerca de"?', options: ['Far from', 'Near', 'Behind', 'In front of'], answer: 1 }
        ]
      })
    }
  },

  // ===============================================================
  // UNIDAD 6 - Mi barrio y mi ciudad (PREMIUM)
  // ===============================================================
  {
    slug: 'mi-barrio-y-mi-ciudad',
    title: 'Mi barrio y mi ciudad',
    description: 'Lugares de la ciudad, direcciones y transporte.',
    order: 6,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'Mi barrio',
        description: 'Una descripción del barrio donde vive Camila.',
        reading: {
          title: 'Mi barrio',
          parts: [
            'Mi barrio tiene un parque, una farmacia y un supermercado. El parque está cerca de mi casa; voy allí todos los fines de semana.',
            'La farmacia está en la calle principal, al lado del banco. El supermercado está lejos de mi casa, por eso vamos en carro.',
            'Para ir a la escuela, tomo el autobús. La parada de autobús está a la derecha del parque. Me gusta mucho mi barrio porque es tranquilo.'
          ],
          questions: [
            '¿Qué hay en el barrio de Camila?',
            '¿Dónde está la farmacia?',
            '¿Cómo va Camila a la escuela?'
          ],
          ordering: {
            prompt: 'Ordena los eventos de la historia.',
            events: [
              'Camila describe los lugares de su barrio.',
              'Camila explica dónde está la farmacia.',
              'Camila explica cómo llegan al supermercado.',
              'Camila explica cómo va a la escuela.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué hay cerca de la casa de Camila?', options: ['Un parque', 'Un hospital', 'Una playa', 'Un aeropuerto'], answer: 0 },
          { type: 'mcq', prompt: '¿Dónde está la farmacia?', options: ['Lejos de la casa', 'En la calle principal', 'Cerca del parque', 'En el supermercado'], answer: 1 },
          { type: 'mcq', prompt: '¿Cómo va Camila a la escuela?', options: ['Caminando', 'En bicicleta', 'En autobús', 'En carro'], answer: 2 },
          { type: 'mcq', prompt: '¿Dónde está la parada de autobús?', options: ['A la izquierda del parque', 'A la derecha del parque', 'Lejos del barrio', 'Al lado del supermercado'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: el supermercado está cerca de la casa.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: la farmacia está al lado del banco.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: a Camila no le gusta su barrio.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: me gusta mi barrio porque es muy ___.', options: ['tranquilo', 'ruidoso', 'peligroso', 'aburrido'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Perdón, ¿dónde está el banco?',
        description: 'Alguien pregunta cómo llegar a un lugar en la calle.',
        listeningType: 'dialogue',
        difficulty: 'A1',
        durationSeconds: 45,
        speakers: ['Turista', 'Vecino'],
        intro: 'Escucha a una persona preguntando una dirección en la calle.',
        dialogue: [
          { speaker: 'Turista', line: 'Perdón, ¿dónde está el banco?', translation: 'Excuse me, where is the bank?' },
          { speaker: 'Vecino', line: 'Está cerca. Camina derecho y dobla a la derecha.', translation: "It's close. Walk straight and turn right." },
          { speaker: 'Turista', line: '¿Está lejos de aquí?', translation: 'Is it far from here?' },
          { speaker: 'Vecino', line: 'No, está a cinco minutos a pie.', translation: "No, it's five minutes on foot." },
          { speaker: 'Turista', line: '¿Hay una farmacia cerca también?', translation: 'Is there a pharmacy nearby too?' },
          { speaker: 'Vecino', line: 'Sí, la farmacia está al lado del banco.', translation: 'Yes, the pharmacy is next to the bank.' }
        ],
        transcript:
          'Perdón, ¿dónde está el banco? Está cerca. Camina derecho y dobla a la derecha. ¿Está lejos de aquí? No, está a cinco minutos a pie. ¿Hay una farmacia cerca también? Sí, la farmacia está al lado del banco.',
        phrases: ['¿Dónde está...?', 'Camina derecho.', 'Dobla a la derecha/izquierda.', 'Está cerca / lejos.'],
        phoneticSupport: {
          enabled: true,
          locale: 'es-419',
          focus: 'Grupos consonánticos (tr, pl, cerca) se pronuncian juntos sin pausa; la entonación interrogativa sube al final de la pregunta.',
          fullIpa: null,
          segments: [
            { text: '¿Dónde está?', ipa: '/ˈdon.de es.ˈta/' },
            { text: 'derecho', ipa: '/de.ˈɾe.tʃo/' }
          ],
          stressedWords: ['está', 'aquí'],
          syllabification: [{ word: 'farmacia', syllables: 'far-ma-cia' }],
          difficultSounds: ['grupos consonánticos'],
          reviewStatus: 'pending-review'
        },
        dictation: {
          segments: [
            { order: 0, text: '¿Dónde está el banco?' },
            { order: 1, text: 'Camina derecho y dobla a la derecha.' },
            { order: 2, text: 'Está a cinco minutos a pie.' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué busca el turista primero?', options: ['La farmacia', 'El banco', 'El parque', 'El supermercado'], answer: 1 },
          { type: 'mcq', prompt: '¿Hacia dónde debe doblar?', options: ['A la izquierda', 'A la derecha', 'Todo recto', 'Hacia atrás'], answer: 1 },
          { type: 'mcq', prompt: '¿Dónde está la farmacia?', options: ['Lejos del banco', 'Al lado del banco', 'Detrás del parque', 'No hay farmacia'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Da una dirección',
        description: 'Practica preguntar y dar direcciones sencillas.',
        mission: 'Pregúntale a un compañero cómo llegar a un lugar y dale una dirección sencilla.',
        phrases: ['¿Dónde está...?', 'Camina derecho.', 'Dobla a la derecha/izquierda.', 'Está cerca/lejos.'],
        dialogue: [
          { speaker: 'Tú', line: 'Perdón, ¿dónde está el parque?', translation: 'Excuse me, where is the park?' },
          { speaker: 'Compañero/a', line: 'Camina derecho y dobla a la izquierda.', translation: 'Walk straight and turn left.' },
          { speaker: 'Tú', line: '¿Está lejos?', translation: 'Is it far?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Da en voz alta una dirección sencilla desde tu casa hasta un lugar cercano.', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Pregúntale a un compañero "¿Dónde está la escuela?" y escucha su respuesta. Si no tienes micrófono, responde por escrito.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe sobre tu barrio',
        description: 'Escribe una descripción corta de tu barrio.',
        mission: 'Escribe 5-6 oraciones sobre los lugares de tu barrio y cómo llegas a la escuela.',
        phrases: ['En mi barrio hay...', 'Está cerca de...', 'Para ir a la escuela, tomo...', 'Me gusta mi barrio porque...'],
        dialogue: [{ speaker: 'Modelo', line: 'En mi barrio hay un parque y una farmacia. El parque está cerca de mi casa. Para ir a la escuela, camino.', translation: 'In my neighborhood there is a park and a pharmacy. The park is near my house. To go to school, I walk.' }],
        exercises: [
          { type: 'writing', prompt: 'Escribe 5-6 oraciones sobre tu barrio: los lugares que hay y cómo llegas a la escuela.', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'El verbo ir y las direcciones',
        description: 'Aprende a usar ir/ir a y expresiones para dar direcciones.',
        grammarNote:
          'El verbo "ir" es irregular: yo voy, tú vas, él/ella va. Usamos "ir a + lugar" para decir a dónde vamos: Voy a la escuela. Para dar direcciones usamos expresiones fijas como "camina derecho", "dobla a la derecha/izquierda", "sigue recto". Error frecuente: decir "voy la escuela" sin la preposición "a" (debe ser "voy a la escuela").',
        phrases: ['Yo voy a...', 'Tú vas a...', 'Camina derecho.', 'Dobla a la derecha.'],
        exercises: [
          { type: 'mcq', prompt: 'Yo ___ a la escuela todos los días.', options: ['voy', 'vas', 'va', 'van'], answer: 0 },
          { type: 'mcq', prompt: '¿___ tú al parque los sábados?', options: ['Voy', 'Vas', 'Va', 'Vamos'], answer: 1 },
          { type: 'mcq', prompt: 'Para llegar al banco, ___ a la derecha.', options: ['camina', 'dobla', 'va', 'voy'], answer: 1 },
          { type: 'mcq', prompt: 'Elige la oración correcta.', options: ['Voy la escuela.', 'Voy a la escuela.', 'Voy en la escuela.', 'Voy de la escuela.'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Lugares y transporte',
        description: 'Palabras para lugares de la ciudad y medios de transporte.',
        vocabulary: [
          { word: 'Parque', category: 'lugar', translation: 'Park', example: 'El parque está cerca de mi casa.' },
          { word: 'Banco', category: 'lugar', translation: 'Bank', example: 'El banco abre a las nueve.' },
          { word: 'Farmacia', category: 'lugar', translation: 'Pharmacy', example: 'La farmacia está al lado del banco.' },
          { word: 'Supermercado', category: 'lugar', translation: 'Supermarket', example: 'Compramos comida en el supermercado.' },
          { word: 'Calle', category: 'lugar', translation: 'Street', example: 'Vivo en esta calle.' },
          { word: 'Autobús', category: 'transporte', translation: 'Bus', example: 'Tomo el autobús a la escuela.' },
          { word: 'Carro', category: 'transporte', translation: 'Car', example: 'Vamos en carro al supermercado.' },
          { word: 'Bicicleta', category: 'transporte', translation: 'Bicycle', example: 'Voy al parque en bicicleta.' },
          { word: 'A pie', category: 'transporte', translation: 'On foot', example: 'Voy a la escuela a pie.' },
          { word: 'Derecha', category: 'dirección', translation: 'Right', example: 'Dobla a la derecha.' },
          { word: 'Izquierda', category: 'dirección', translation: 'Left', example: 'Dobla a la izquierda.' },
          { word: 'Cerca', category: 'dirección', translation: 'Near/close', example: 'La escuela está cerca.' },
          { word: 'Lejos', category: 'dirección', translation: 'Far', example: 'El supermercado está lejos.' },
          { word: 'Hospital', category: 'lugar', translation: 'Hospital', example: 'El hospital está cerca del parque.' },
          { word: 'Esquina', category: 'lugar', translation: 'Corner', example: 'El banco está en la esquina.' }
        ],
        exercises: [
          { type: 'mcq', prompt: '¿Qué significa "Farmacia"?', options: ['Bank', 'Pharmacy', 'Park', 'Supermarket'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "Derecha"?', options: ['Left', 'Right', 'Near', 'Far'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "A pie"?', options: ['By car', 'By bus', 'On foot', 'By bicycle'], answer: 2 }
        ]
      })
    }
  },

  // ===============================================================
  // UNIDAD 7 - Comida y bebida (PREMIUM)
  // ===============================================================
  {
    slug: 'comida-y-bebida',
    title: 'Comida y bebida',
    description: 'Alimentos, pedir comida y expresar gustos.',
    order: 7,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'El desayuno de Mariana',
        description: 'Un texto sobre lo que come Mariana en un café.',
        reading: {
          title: 'El desayuno de Mariana',
          parts: [
            'A Mariana le gusta desayunar en un café cerca de su casa. Ella siempre pide pan con queso y un jugo de naranja.',
            'Hoy, el mesero le pregunta: "¿Qué desea tomar?". Mariana responde: "Quiero un café con leche, por favor." También pide un poco de fruta.',
            'A Mariana no le gusta el café solo; prefiere el café con leche. Después de desayunar, paga la cuenta y va a la escuela.'
          ],
          questions: [
            '¿Qué pide Mariana normalmente?',
            '¿Qué le pregunta el mesero?',
            '¿Qué prefiere Mariana, el café solo o con leche?'
          ],
          ordering: {
            prompt: 'Ordena los eventos de la historia.',
            events: [
              'Mariana llega al café.',
              'El mesero le pregunta qué desea tomar.',
              'Mariana pide café con leche y fruta.',
              'Mariana paga la cuenta y va a la escuela.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué pide Mariana para comer?', options: ['Pan con queso', 'Solo fruta', 'Arroz', 'Nada'], answer: 0 },
          { type: 'mcq', prompt: '¿Qué pide Mariana para tomar?', options: ['Agua', 'Café con leche', 'Té', 'Jugo de manzana'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué prefiere Mariana?', options: ['Café solo', 'Café con leche', 'No toma café', 'Jugo'], answer: 1 },
          { type: 'mcq', prompt: '¿A dónde va Mariana después de desayunar?', options: ['A casa', 'A la escuela', 'Al parque', 'Al supermercado'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Mariana desayuna en un café.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: a Mariana le gusta el café solo.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Mariana pide un poco de fruta.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: el mesero pregunta qué ___ tomar.', options: ['desea', 'corre', 'duerme', 'estudia'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: '¿Qué desea pedir?',
        description: 'Una conversación en una cafetería entre un mesero y un cliente.',
        listeningType: 'dialogue',
        difficulty: 'A1',
        durationSeconds: 45,
        speakers: ['Mesero', 'Cliente'],
        intro: 'Escucha una conversación en un café entre un mesero y un cliente.',
        dialogue: [
          { speaker: 'Mesero', line: 'Buenos días. ¿Qué desea pedir?', translation: 'Good morning. What would you like to order?' },
          { speaker: 'Cliente', line: 'Quiero un café con leche y pan, por favor.', translation: 'I want a coffee with milk and bread, please.' },
          { speaker: 'Mesero', line: '¿Algo más? ¿Un poco de fruta?', translation: 'Anything else? Some fruit?' },
          { speaker: 'Cliente', line: 'Sí, un poco de fruta también, gracias.', translation: 'Yes, a little fruit too, thanks.' },
          { speaker: 'Mesero', line: '¿Y para tomar, algo frío?', translation: 'And to drink, something cold?' },
          { speaker: 'Cliente', line: 'No, gracias. Solo el café está bien.', translation: 'No, thanks. Just the coffee is fine.' }
        ],
        transcript:
          'Buenos días. ¿Qué desea pedir? Quiero un café con leche y pan, por favor. ¿Algo más? ¿Un poco de fruta? Sí, un poco de fruta también, gracias. ¿Y para tomar, algo frío? No, gracias. Solo el café está bien.',
        phrases: ['¿Qué desea pedir?', 'Quiero...', 'Un poco de...', '¿Algo más?'],
        phoneticSupport: {
          enabled: true,
          locale: 'es-419',
          focus: 'Ritmo natural al pedir (Quiero un café, por favor) y la "d" entre vocales suena suave, casi como una "th" ligera: pedir, comida.',
          fullIpa: null,
          segments: [
            { text: 'pedir', ipa: '/pe.ˈðiɾ/' },
            { text: 'comida', ipa: '/ko.ˈmi.ða/' }
          ],
          stressedWords: ['café', 'algo'],
          syllabification: [{ word: 'desayuno', syllables: 'de-sa-yu-no' }],
          difficultSounds: ['d intervocálica'],
          reviewStatus: 'pending-review'
        },
        dictation: {
          segments: [
            { order: 0, text: '¿Qué desea pedir?' },
            { order: 1, text: 'Quiero un café con leche y pan.' },
            { order: 2, text: 'Un poco de fruta también, gracias.' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué pide el cliente para tomar?', options: ['Jugo', 'Café con leche', 'Té', 'Agua'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué más pide el cliente?', options: ['Pan y fruta', 'Solo pan', 'Nada más', 'Huevos'], answer: 0 },
          { type: 'mcq', prompt: '¿Quiere algo frío el cliente?', options: ['Sí', 'No', 'No dice', 'Pide dos'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Pide comida',
        description: 'Practica pedir comida y bebida en un restaurante.',
        mission: 'Pide en voz alta una comida y una bebida como si estuvieras en un café.',
        phrases: ['Quiero...', 'Para tomar, quiero...', '¿Qué desea pedir?', 'La cuenta, por favor.'],
        dialogue: [
          { speaker: 'Mesero', line: '¿Qué desea pedir?', translation: 'What would you like to order?' },
          { speaker: 'Tú', line: 'Quiero un..., por favor.', translation: 'I want a..., please.' },
          { speaker: 'Mesero', line: '¿Algo más?', translation: 'Anything else?' },
          { speaker: 'Tú', line: 'No, gracias. La cuenta, por favor.', translation: 'No, thank you. The check, please.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Pide en voz alta una comida y una bebida usando "Quiero...".', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Practica el diálogo de pedir comida con un compañero, cambiando de rol. Si no tienes micrófono, escribe tus respuestas.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe un pedido',
        description: 'Escribe un pequeño diálogo pidiendo comida en un restaurante.',
        mission: 'Escribe 5-6 oraciones: qué comida y bebida pides, y qué te pregunta el mesero.',
        phrases: ['Quiero...', 'Para tomar...', '¿Algo más?', 'La cuenta, por favor.'],
        dialogue: [{ speaker: 'Modelo', line: 'Buenos días. Quiero un café con leche y pan. Un poco de fruta también, por favor. La cuenta, por favor.', translation: 'Good morning. I want a coffee with milk and bread. Some fruit too, please. The check, please.' }],
        exercises: [
          { type: 'writing', prompt: 'Escribe un pequeño pedido de comida y bebida en un restaurante, de 5-6 oraciones.', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Gustar, querer y las cantidades',
        description: 'Aprende a usar gustar/querer y expresiones de cantidad.',
        grammarNote:
          '"Gustar" funciona diferente: me gusta el café (a mí), te gusta el té (a ti), le gusta la fruta (a él/ella). "Querer" es más directo para pedir: quiero un café. Cantidades: "un poco de" (pequeña cantidad), "mucho/a" (grande cantidad), "poco/a" (pequeña cantidad). Error frecuente: decir "yo gusto el café" en vez de "me gusta el café".',
        phrases: ['Me gusta / me gustan...', 'Quiero...', 'Un poco de...', 'Mucho / poco'],
        exercises: [
          { type: 'mcq', prompt: 'A mí ___ el café con leche.', options: ['gusto', 'me gusta', 'gustas', 'te gusta'], answer: 1 },
          { type: 'mcq', prompt: 'Yo ___ un café, por favor.', options: ['quiero', 'quieres', 'quiere', 'queremos'], answer: 0 },
          { type: 'mcq', prompt: 'Quiero ___ de azúcar, no mucha.', options: ['un poco', 'mucho', 'nada', 'todo'], answer: 0 },
          { type: 'mcq', prompt: 'A Mariana ___ la fruta.', options: ['gusto', 'me gusta', 'le gusta', 'te gusta'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Comida y bebida',
        description: 'Palabras para alimentos, bebidas y el restaurante.',
        vocabulary: [
          { word: 'Pan', category: 'comida', translation: 'Bread', example: 'Quiero pan con queso.' },
          { word: 'Queso', category: 'comida', translation: 'Cheese', example: 'Me gusta el queso.' },
          { word: 'Fruta', category: 'comida', translation: 'Fruit', example: 'La fruta es saludable.' },
          { word: 'Arroz', category: 'comida', translation: 'Rice', example: 'Comemos arroz con pollo.' },
          { word: 'Pollo', category: 'comida', translation: 'Chicken', example: 'El pollo está delicioso.' },
          { word: 'Agua', category: 'bebida', translation: 'Water', example: 'Quiero un vaso de agua.' },
          { word: 'Jugo', category: 'bebida', translation: 'Juice', example: 'El jugo de naranja es rico.' },
          { word: 'Café', category: 'bebida', translation: 'Coffee', example: 'Tomo café todos los días.' },
          { word: 'Desayuno', category: 'comida del día', translation: 'Breakfast', example: 'El desayuno es a las siete.' },
          { word: 'Almuerzo', category: 'comida del día', translation: 'Lunch', example: 'El almuerzo es a la una.' },
          { word: 'Menú', category: 'restaurante', translation: 'Menu', example: '¿Puedo ver el menú?' },
          { word: 'Mesero/a', category: 'restaurante', translation: 'Waiter/waitress', example: 'El mesero es muy amable.' },
          { word: 'La cuenta', category: 'restaurante', translation: 'The check/bill', example: 'La cuenta, por favor.' },
          { word: 'Leche', category: 'comida', translation: 'Milk', example: 'Quiero café con leche.' },
          { word: 'Huevo', category: 'comida', translation: 'Egg', example: 'Como huevo en el desayuno.' }
        ],
        exercises: [
          { type: 'mcq', prompt: '¿Qué significa "Jugo"?', options: ['Water', 'Juice', 'Coffee', 'Milk'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "Mesero/a"?', options: ['Menu', 'Waiter/waitress', 'The check', 'Kitchen'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "La cuenta"?', options: ['The menu', 'The check/bill', 'Breakfast', 'Lunch'], answer: 1 }
        ]
      })
    }
  },

  // ===============================================================
  // UNIDAD 8 - De compras (PREMIUM)
  // ===============================================================
  {
    slug: 'de-compras',
    title: 'De compras',
    description: 'Ropa, colores, tallas y precios.',
    order: 8,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'Una camisa nueva',
        description: 'Un texto sobre una compra en una tienda de ropa.',
        reading: {
          title: 'Una camisa nueva',
          parts: [
            'Andrea va a una tienda porque necesita una camisa nueva para una fiesta. Ella prefiere los colores claros, como el blanco o el azul.',
            'La vendedora le muestra una camisa azul. Andrea pregunta: "¿Cuánto cuesta?" La vendedora responde: "Cuesta ochocientos pesos."',
            'Andrea pregunta si hay una talla mediana. La vendedora dice que sí. Andrea compra la camisa azul; está muy contenta con su compra.'
          ],
          questions: [
            '¿Por qué necesita Andrea una camisa nueva?',
            '¿De qué color es la camisa que compra?',
            '¿Cuánto cuesta la camisa?'
          ],
          ordering: {
            prompt: 'Ordena los eventos de la historia.',
            events: [
              'Andrea entra a la tienda.',
              'La vendedora le muestra una camisa azul.',
              'Andrea pregunta el precio y la talla.',
              'Andrea compra la camisa.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: '¿Por qué va Andrea a la tienda?', options: ['Necesita zapatos', 'Necesita una camisa', 'Necesita un pantalón', 'No dice por qué'], answer: 1 },
          { type: 'mcq', prompt: '¿De qué color es la camisa?', options: ['Blanca', 'Roja', 'Azul', 'Negra'], answer: 2 },
          { type: 'mcq', prompt: '¿Cuánto cuesta la camisa?', options: ['Quinientos pesos', 'Ochocientos pesos', 'Mil pesos', 'Doscientos pesos'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué talla pregunta Andrea?', options: ['Pequeña', 'Mediana', 'Grande', 'No pregunta'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Andrea prefiere los colores claros.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: no hay talla mediana.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Andrea compra la camisa.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: Andrea está muy ___ con su compra.', options: ['contenta', 'enojada', 'triste', 'cansada'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: '¿Cuánto cuesta?',
        description: 'Una conversación entre una clienta y una vendedora en una tienda.',
        listeningType: 'dialogue',
        difficulty: 'A1',
        durationSeconds: 45,
        speakers: ['Vendedora', 'Clienta'],
        intro: 'Escucha a una clienta comprando ropa en una tienda.',
        dialogue: [
          { speaker: 'Clienta', line: 'Buenas tardes, busco una camisa azul.', translation: 'Good afternoon, I am looking for a blue shirt.' },
          { speaker: 'Vendedora', line: 'Tenemos esta. ¿Qué talla necesita?', translation: 'We have this one. What size do you need?' },
          { speaker: 'Clienta', line: 'Talla mediana, por favor. ¿Cuánto cuesta?', translation: 'Medium size, please. How much does it cost?' },
          { speaker: 'Vendedora', line: 'Cuesta ochocientos pesos.', translation: 'It costs eight hundred pesos.' },
          { speaker: 'Clienta', line: 'Perfecto, la compro.', translation: "Perfect, I'll buy it." },
          { speaker: 'Vendedora', line: 'Muy bien, gracias por su compra.', translation: 'Very good, thank you for your purchase.' }
        ],
        transcript:
          'Buenas tardes, busco una camisa azul. Tenemos esta. ¿Qué talla necesita? Talla mediana, por favor. ¿Cuánto cuesta? Cuesta ochocientos pesos. Perfecto, la compro. Muy bien, gracias por su compra.',
        phrases: ['Busco un/una...', '¿Cuánto cuesta?', 'Cuesta...', '¿Qué talla necesita?'],
        phoneticSupport: {
          enabled: true,
          locale: 'es-419',
          focus: 'Los colores y las prendas suelen llevar el acento en la penúltima sílaba (a-ZUL es excepción, va en la última); los números de precios se dicen en bloques (ochocientos, no ocho-cero-cero).',
          fullIpa: null,
          segments: [
            { text: 'azul', ipa: '/a.ˈsul/' },
            { text: 'ochocientos', ipa: '/o.tʃo.ˈsjen.tos/' }
          ],
          stressedWords: ['azul', 'compró'],
          syllabification: [{ word: 'camisa', syllables: 'ca-mi-sa' }],
          difficultSounds: ['acentuación de números'],
          reviewStatus: 'pending-review'
        },
        dictation: {
          segments: [
            { order: 0, text: 'Busco una camisa azul.' },
            { order: 1, text: '¿Cuánto cuesta?' },
            { order: 2, text: 'Cuesta ochocientos pesos.' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué busca la clienta?', options: ['Un pantalón', 'Una camisa azul', 'Zapatos', 'Un sombrero'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué talla pide?', options: ['Pequeña', 'Mediana', 'Grande', 'Extra grande'], answer: 1 },
          { type: 'mcq', prompt: '¿Cuánto cuesta la camisa?', options: ['Quinientos pesos', 'Setecientos pesos', 'Ochocientos pesos', 'Mil pesos'], answer: 2 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Compra una prenda',
        description: 'Practica comprar ropa: preguntar precio, color y talla.',
        mission: 'Pide una prenda de ropa en voz alta, pregunta el precio y la talla.',
        phrases: ['Busco un/una...', '¿Cuánto cuesta?', '¿Qué talla necesita?', 'Talla...'],
        dialogue: [
          { speaker: 'Tú', line: 'Busco un pantalón negro.', translation: 'I am looking for black pants.' },
          { speaker: 'Vendedor/a', line: '¿Qué talla necesita?', translation: 'What size do you need?' },
          { speaker: 'Tú', line: 'Talla mediana. ¿Cuánto cuesta?', translation: 'Medium size. How much does it cost?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Pide en voz alta una prenda de ropa, su color y su talla.', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Practica el diálogo de compra con un compañero, cambiando de rol. Si no tienes micrófono, escribe tus respuestas.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe una compra',
        description: 'Escribe un pequeño diálogo de compra de ropa.',
        mission: 'Escribe 5-6 oraciones: qué prenda compras, de qué color, qué talla y cuánto cuesta.',
        phrases: ['Busco un/una...', '¿Cuánto cuesta?', 'Cuesta...', 'La compro.'],
        dialogue: [{ speaker: 'Modelo', line: 'Busco una camisa azul. La vendedora me muestra una. Cuesta ochocientos pesos. La compro.', translation: 'I am looking for a blue shirt. The saleswoman shows me one. It costs eight hundred pesos. I buy it.' }],
        exercises: [
          { type: 'writing', prompt: 'Escribe un pequeño diálogo de compra de ropa, de 5-6 oraciones.', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Cuánto cuesta y la concordancia de colores',
        description: 'Aprende a preguntar precios y a hacer concordar los colores.',
        grammarNote:
          'Para un objeto usamos "¿Cuánto cuesta?"; para varios objetos usamos "¿Cuánto cuestan?". Los colores concuerdan en género y número: la camisa azul, el pantalón azul, las camisas azules. Algunos colores no cambian de forma: azul, verde. Error frecuente: decir "la camisa azula" (los colores como "azul" y "verde" no tienen forma femenina).',
        phrases: ['¿Cuánto cuesta?', '¿Cuánto cuestan?', 'la camisa azul', 'los pantalones negros'],
        exercises: [
          { type: 'mcq', prompt: '¿Cuánto ___ esta camisa?', options: ['cuesta', 'cuestan', 'cuestas', 'cuesto'], answer: 0 },
          { type: 'mcq', prompt: '¿Cuánto ___ estos zapatos?', options: ['cuesta', 'cuestan', 'cuestas', 'cuesto'], answer: 1 },
          { type: 'mcq', prompt: 'Quiero la camisa ___ (rojo).', options: ['rojo', 'roja', 'rojos', 'rojas'], answer: 1 },
          { type: 'mcq', prompt: 'Elige la oración correcta.', options: ['La camisa es azula.', 'La camisa es azul.', 'La camisa es azules.', 'La camisa son azul.'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Ropa, colores y precios',
        description: 'Palabras para prendas de vestir, colores y dinero.',
        vocabulary: [
          { word: 'Camisa', category: 'ropa', translation: 'Shirt', example: 'La camisa es azul.' },
          { word: 'Pantalón', category: 'ropa', translation: 'Pants', example: 'El pantalón es negro.' },
          { word: 'Zapatos', category: 'ropa', translation: 'Shoes', example: 'Los zapatos son cómodos.' },
          { word: 'Vestido', category: 'ropa', translation: 'Dress', example: 'El vestido es rojo.' },
          { word: 'Rojo/a', category: 'color', translation: 'Red', example: 'Me gusta el color rojo.' },
          { word: 'Azul', category: 'color', translation: 'Blue', example: 'La camisa azul es bonita.' },
          { word: 'Negro/a', category: 'color', translation: 'Black', example: 'El pantalón negro es elegante.' },
          { word: 'Blanco/a', category: 'color', translation: 'White', example: 'El vestido blanco es para la fiesta.' },
          { word: 'Talla', category: 'compras', translation: 'Size', example: '¿Qué talla necesita?' },
          { word: 'Pequeño/a', category: 'talla', translation: 'Small', example: 'Necesito una talla pequeña.' },
          { word: 'Grande', category: 'talla', translation: 'Large', example: 'Uso talla grande.' },
          { word: 'Precio', category: 'compras', translation: 'Price', example: '¿Cuál es el precio?' },
          { word: 'Tienda', category: 'compras', translation: 'Store', example: 'La tienda está en el centro.' },
          { word: 'Verde', category: 'color', translation: 'Green', example: 'Me gusta el pantalón verde.' },
          { word: 'Amarillo/a', category: 'color', translation: 'Yellow', example: 'El vestido amarillo es bonito.' }
        ],
        exercises: [
          { type: 'mcq', prompt: '¿Qué significa "Talla"?', options: ['Price', 'Size', 'Store', 'Color'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "Negro/a"?', options: ['White', 'Red', 'Black', 'Blue'], answer: 2 },
          { type: 'mcq', prompt: '¿Qué significa "Precio"?', options: ['Store', 'Size', 'Price', 'Color'], answer: 2 }
        ]
      })
    }
  },

  // ===============================================================
  // UNIDAD 9 - Estudios y trabajo (PREMIUM)
  // ===============================================================
  {
    slug: 'estudios-y-trabajo',
    title: 'Estudios y trabajo',
    description: 'Estudios, profesiones y responsabilidades sencillas.',
    order: 9,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'Un día de trabajo',
        description: 'Un texto sobre el trabajo de Roberto en un hospital.',
        reading: {
          title: 'Un día de trabajo',
          parts: [
            'Roberto trabaja en un hospital. Él es enfermero y trabaja de lunes a viernes, de siete de la mañana a tres de la tarde.',
            'Antes de trabajar en el hospital, Roberto estudió tres años en la universidad. Ahora tiene que cuidar a los pacientes y ayudar a los doctores.',
            'A Roberto le gusta su trabajo porque puede ayudar a otras personas. Los fines de semana, no trabaja; puede descansar con su familia.'
          ],
          questions: [
            '¿Dónde trabaja Roberto?',
            '¿Qué tiene que hacer en su trabajo?',
            '¿Cuándo no trabaja Roberto?'
          ],
          ordering: {
            prompt: 'Ordena los eventos de la historia.',
            events: [
              'Roberto estudia tres años en la universidad.',
              'Roberto empieza a trabajar en el hospital.',
              'Roberto cuida a los pacientes durante la semana.',
              'Roberto descansa con su familia el fin de semana.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: '¿Dónde trabaja Roberto?', options: ['En una escuela', 'En un hospital', 'En una tienda', 'En un restaurante'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué profesión tiene Roberto?', options: ['Doctor', 'Enfermero', 'Profesor', 'Vendedor'], answer: 1 },
          { type: 'mcq', prompt: '¿Cuánto tiempo estudió en la universidad?', options: ['Un año', 'Dos años', 'Tres años', 'Cinco años'], answer: 2 },
          { type: 'mcq', prompt: '¿Cuándo no trabaja Roberto?', options: ['Nunca descansa', 'Los fines de semana', 'Los lunes', 'Todos los días'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: a Roberto le gusta ayudar a otras personas.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: Roberto trabaja de noche.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Roberto trabaja de lunes a viernes.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: Roberto tiene que ___ a los pacientes.', options: ['cuidar', 'vender', 'cocinar', 'limpiar'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Una entrevista breve',
        description: 'Una entrevista corta sobre estudios y trabajo.',
        listeningType: 'interview',
        difficulty: 'A1',
        durationSeconds: 50,
        speakers: ['Entrevistador', 'Natalia'],
        intro: 'Escucha una entrevista breve a Natalia sobre sus estudios y su trabajo.',
        dialogue: [
          { speaker: 'Entrevistador', line: '¿Qué estudias, Natalia?', translation: 'What do you study, Natalia?' },
          { speaker: 'Natalia', line: 'Estudio administración en la universidad.', translation: 'I study business administration at the university.' },
          { speaker: 'Entrevistador', line: '¿Trabajas también?', translation: 'Do you also work?' },
          { speaker: 'Natalia', line: 'Sí, trabajo en una tienda los fines de semana.', translation: 'Yes, I work at a store on weekends.' },
          { speaker: 'Entrevistador', line: '¿Qué tienes que hacer en tu trabajo?', translation: 'What do you have to do at your job?' },
          { speaker: 'Natalia', line: 'Tengo que atender a los clientes y organizar la tienda.', translation: 'I have to help customers and organize the store.' }
        ],
        transcript:
          '¿Qué estudias, Natalia? Estudio administración en la universidad. ¿Trabajas también? Sí, trabajo en una tienda los fines de semana. ¿Qué tienes que hacer en tu trabajo? Tengo que atender a los clientes y organizar la tienda.',
        phrases: ['¿Qué estudias?', 'Estudio...', 'Trabajo en...', 'Tengo que...'],
        phoneticSupport: {
          enabled: true,
          locale: 'es-419',
          focus: 'Contraste entre p/b (pan/van), t/d (tú/dos) y k/g (casa/gasa); pronunciar con claridad las profesiones evita confusiones.',
          fullIpa: null,
          segments: [
            { text: 'trabajo', ipa: '/tra.ˈβa.xo/' },
            { text: 'administración', ipa: '/ad.mi.nis.tra.ˈsjon/' }
          ],
          stressedWords: ['también', 'atención'],
          syllabification: [{ word: 'universidad', syllables: 'u-ni-ver-si-dad' }],
          difficultSounds: ['p/b', 't/d', 'k/g'],
          reviewStatus: 'pending-review'
        },
        dictation: {
          segments: [
            { order: 0, text: 'Estudio administración en la universidad.' },
            { order: 1, text: 'Trabajo en una tienda los fines de semana.' },
            { order: 2, text: 'Tengo que atender a los clientes.' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué estudia Natalia?', options: ['Medicina', 'Administración', 'Ingeniería', 'Arte'], answer: 1 },
          { type: 'mcq', prompt: '¿Dónde trabaja Natalia?', options: ['En un hospital', 'En una tienda', 'En una escuela', 'En un banco'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué tiene que hacer en su trabajo?', options: ['Cocinar', 'Atender clientes y organizar', 'Enseñar', 'Manejar'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Habla de tus estudios o tu trabajo',
        description: 'Practica hablar de qué estudias o dónde trabajas.',
        mission: 'Cuéntale a un compañero qué estudias o dónde trabajas y una responsabilidad que tienes.',
        phrases: ['Estudio...', 'Trabajo en...', 'Tengo que...', '¿Qué estudias/dónde trabajas?'],
        dialogue: [
          { speaker: 'Tú', line: 'Estudio... y trabajo en...', translation: 'I study... and I work at...' },
          { speaker: 'Compañero/a', line: '¿Qué tienes que hacer?', translation: 'What do you have to do?' },
          { speaker: 'Tú', line: 'Tengo que...', translation: 'I have to...' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Di en voz alta qué estudias o dónde trabajas, y una responsabilidad que tienes.', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Pregúntale a un compañero "¿Qué estudias?" y escucha su respuesta. Si no tienes micrófono, responde por escrito.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe sobre tus estudios o tu trabajo',
        description: 'Escribe un párrafo corto sobre tus estudios o tu trabajo.',
        mission: 'Escribe 6-7 oraciones sobre qué estudias o dónde trabajas y qué tienes que hacer.',
        phrases: ['Estudio...', 'Trabajo en...', 'Tengo que...', 'Puedo...'],
        dialogue: [{ speaker: 'Modelo', line: 'Estudio administración en la universidad. También trabajo en una tienda los fines de semana. Tengo que atender a los clientes.', translation: 'I study business administration at the university. I also work at a store on weekends. I have to help customers.' }],
        exercises: [
          { type: 'writing', prompt: 'Escribe 6-7 oraciones sobre tus estudios o tu trabajo y tus responsabilidades.', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Tener que y poder + infinitivo',
        description: 'Aprende a expresar obligación y posibilidad.',
        grammarNote:
          '"Tener que + infinitivo" expresa obligación: tengo que estudiar. "Poder + infinitivo" expresa posibilidad o capacidad: puedo trabajar los sábados. Ambos verbos son irregulares: yo tengo/puedo, tú tienes/puedes, él tiene/puede. Error frecuente: usar el infinitivo sin "que" después de "tener" (decir "tengo estudiar" en vez de "tengo que estudiar").',
        phrases: ['Tengo que...', 'Puedo...', 'Tienes que...', 'No puedo...'],
        exercises: [
          { type: 'mcq', prompt: 'Yo ___ que trabajar hoy.', options: ['tengo', 'tiene', 'tienes', 'tener'], answer: 0 },
          { type: 'mcq', prompt: 'Ella ___ estudiar todos los días.', options: ['tiene que', 'tiene', 'tengo que', 'puede que'], answer: 0 },
          { type: 'mcq', prompt: 'Yo no ___ trabajar los domingos.', options: ['puedo', 'puede', 'puedes', 'poder'], answer: 0 },
          { type: 'mcq', prompt: 'Elige la oración correcta.', options: ['Tengo estudiar hoy.', 'Tengo que estudiar hoy.', 'Tengo a estudiar hoy.', 'Tengo de estudiar hoy.'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Estudios y profesiones',
        description: 'Palabras para hablar de la escuela, la universidad y el trabajo.',
        vocabulary: [
          { word: 'Universidad', category: 'lugar', translation: 'University', example: 'Estudio en la universidad.' },
          { word: 'Escuela', category: 'lugar', translation: 'School', example: 'Voy a la escuela todos los días.' },
          { word: 'Enfermero/a', category: 'profesión', translation: 'Nurse', example: 'Roberto es enfermero.' },
          { word: 'Doctor/a', category: 'profesión', translation: 'Doctor', example: 'El doctor trabaja en el hospital.' },
          { word: 'Vendedor/a', category: 'profesión', translation: 'Salesperson', example: 'La vendedora trabaja en la tienda.' },
          { word: 'Ingeniero/a', category: 'profesión', translation: 'Engineer', example: 'Mi tío es ingeniero.' },
          { word: 'Cuaderno', category: 'materiales', translation: 'Notebook', example: 'Escribo en mi cuaderno.' },
          { word: 'Trabajo', category: 'trabajo', translation: 'Job/work', example: 'Mi trabajo es interesante.' },
          { word: 'Horario', category: 'trabajo', translation: 'Schedule', example: 'Mi horario es de siete a tres.' },
          { word: 'Cliente', category: 'trabajo', translation: 'Customer', example: 'Atiendo a los clientes.' },
          { word: 'Hospital', category: 'lugar de trabajo', translation: 'Hospital', example: 'Roberto trabaja en el hospital.' },
          { word: 'Profesor/a', category: 'profesión', translation: 'Teacher/professor', example: 'Mi profesora enseña matemáticas.' },
          { word: 'Examen', category: 'escuela', translation: 'Exam', example: 'Tengo un examen mañana.' },
          { word: 'Oficina', category: 'lugar de trabajo', translation: 'Office', example: 'Trabajo en una oficina.' },
          { word: 'Reunión', category: 'trabajo', translation: 'Meeting', example: 'Tengo una reunión a las diez.' }
        ],
        exercises: [
          { type: 'mcq', prompt: '¿Qué significa "Enfermero/a"?', options: ['Doctor', 'Nurse', 'Engineer', 'Teacher'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "Horario"?', options: ['Job', 'Customer', 'Schedule', 'School'], answer: 2 },
          { type: 'mcq', prompt: '¿Qué significa "Cliente"?', options: ['Customer', 'Doctor', 'Notebook', 'Job'], answer: 0 }
        ]
      })
    }
  },

  // ===============================================================
  // UNIDAD 10 - Tiempo libre (PREMIUM)
  // ===============================================================
  {
    slug: 'tiempo-libre',
    title: 'Tiempo libre',
    description: 'Pasatiempos, preferencias e invitaciones.',
    order: 10,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'Mi fin de semana favorito',
        description: 'Un texto sobre las actividades de tiempo libre de Kevin.',
        reading: {
          title: 'Mi fin de semana favorito',
          parts: [
            'A Kevin le gusta mucho el fútbol. Los sábados, juega con sus amigos en el parque cerca de su casa.',
            'También le encanta la música; toca la guitarra un poco. Los domingos, prefiere ver una película con su familia.',
            'A su hermana no le gusta el fútbol, pero a ella también le gusta la música. Los dos van juntos a conciertos a veces.'
          ],
          questions: [
            '¿Qué le gusta hacer a Kevin los sábados?',
            '¿Qué instrumento toca Kevin?',
            '¿Qué le gusta hacer los domingos?'
          ],
          ordering: {
            prompt: 'Ordena los eventos de la historia.',
            events: [
              'Kevin juega fútbol con sus amigos los sábados.',
              'Kevin toca la guitarra en su tiempo libre.',
              'Kevin ve una película con su familia los domingos.',
              'Kevin y su hermana van juntos a un concierto.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué deporte le gusta a Kevin?', options: ['Béisbol', 'Fútbol', 'Baloncesto', 'Tenis'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué instrumento toca?', options: ['Piano', 'Guitarra', 'Batería', 'Violín'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué hace los domingos?', options: ['Juega fútbol', 'Ve una película', 'Va a la escuela', 'Trabaja'], answer: 1 },
          { type: 'mcq', prompt: '¿A quién no le gusta el fútbol?', options: ['A Kevin', 'A su hermana', 'A sus amigos', 'A nadie'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: a Kevin le gusta la música.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: Kevin juega fútbol los domingos.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Kevin y su hermana van juntos a conciertos.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: a Kevin le ___ mucho el fútbol.', options: ['gusta', 'estudia', 'trabaja', 'compra'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: '¿Quieres ir al cine?',
        description: 'Una invitación para una actividad de tiempo libre.',
        listeningType: 'dialogue',
        difficulty: 'A1',
        durationSeconds: 40,
        speakers: ['Kevin', 'Ana'],
        intro: 'Escucha a Kevin invitando a Ana a una actividad de tiempo libre.',
        dialogue: [
          { speaker: 'Kevin', line: '¿Quieres ir al cine el sábado?', translation: 'Do you want to go to the movies on Saturday?' },
          { speaker: 'Ana', line: 'Me encanta el cine. ¿A qué hora?', translation: 'I love the movies. What time?' },
          { speaker: 'Kevin', line: 'A las cuatro de la tarde. También podemos comer algo después.', translation: 'At four in the afternoon. We can also eat something after.' },
          { speaker: 'Ana', line: 'Perfecto, me gusta la idea.', translation: 'Perfect, I like the idea.' },
          { speaker: 'Kevin', line: '¿Prefieres una película de acción?', translation: 'Do you prefer an action movie?' },
          { speaker: 'Ana', line: 'No, prefiero una comedia. ¡Nos vemos el sábado!', translation: "No, I prefer a comedy. See you Saturday!" }
        ],
        transcript:
          '¿Quieres ir al cine el sábado? Me encanta el cine. ¿A qué hora? A las cuatro de la tarde. También podemos comer algo después. Perfecto, me gusta la idea. ¿Prefieres una película de acción? No, prefiero una comedia. ¡Nos vemos el sábado!',
        phrases: ['¿Quieres ir a...?', 'Me encanta...', 'Prefiero...', '¡Nos vemos!'],
        phoneticSupport: {
          enabled: true,
          locale: 'es-419',
          focus: 'La entonación de una invitación sube ligeramente al final (¿Quieres ir al cine?); "también" y "tampoco" llevan el acento en la última sílaba.',
          fullIpa: null,
          segments: [
            { text: 'también', ipa: '/tam.ˈbjen/' },
            { text: 'tampoco', ipa: '/tam.ˈpo.ko/' }
          ],
          stressedWords: ['también', 'tampoco'],
          syllabification: [{ word: 'película', syllables: 'pe-lí-cu-la' }],
          difficultSounds: ['entonación de invitación'],
          reviewStatus: 'pending-review'
        },
        dictation: {
          segments: [
            { order: 0, text: '¿Quieres ir al cine el sábado?' },
            { order: 1, text: 'Me encanta el cine.' },
            { order: 2, text: 'Prefiero una comedia.' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué invita Kevin a hacer?', options: ['Ir al parque', 'Ir al cine', 'Jugar fútbol', 'Estudiar'], answer: 1 },
          { type: 'mcq', prompt: '¿A qué hora es el plan?', options: ['Dos de la tarde', 'Cuatro de la tarde', 'Seis de la tarde', 'Ocho de la noche'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué tipo de película prefiere Ana?', options: ['Acción', 'Comedia', 'Terror', 'No dice'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Invita a un amigo',
        description: 'Practica invitar a alguien a una actividad y responder a una invitación.',
        mission: 'Invita a un compañero a hacer algo en su tiempo libre y responde a su invitación.',
        phrases: ['¿Quieres ir a...?', 'Me encanta...', 'Prefiero...', 'Sí, me gusta la idea. / No, gracias.'],
        dialogue: [
          { speaker: 'Tú', line: '¿Quieres ir al parque el sábado?', translation: 'Do you want to go to the park on Saturday?' },
          { speaker: 'Compañero/a', line: 'Me gusta la idea. ¿A qué hora?', translation: 'I like the idea. What time?' },
          { speaker: 'Tú', line: 'A las tres de la tarde.', translation: 'At three in the afternoon.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Invita en voz alta a un amigo a una actividad de tiempo libre.', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Practica el diálogo de invitación con un compañero, cambiando de rol. Si no tienes micrófono, escribe tus respuestas.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe una invitación',
        description: 'Escribe una invitación corta para una actividad de tiempo libre.',
        mission: 'Escribe 6-7 oraciones invitando a un amigo a una actividad, con día, hora y qué prefieres hacer.',
        phrases: ['¿Quieres ir a...?', 'Me encanta...', 'Prefiero...', 'Nos vemos...'],
        dialogue: [{ speaker: 'Modelo', line: '¿Quieres ir al cine el sábado? Me encanta el cine. Podemos ver una comedia a las cuatro. ¡Nos vemos!', translation: 'Do you want to go to the movies on Saturday? I love the movies. We can watch a comedy at four. See you!' }],
        exercises: [
          { type: 'writing', prompt: 'Escribe una invitación de 6-7 oraciones para una actividad de tiempo libre.', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Encantar, preferir y también/tampoco',
        description: 'Aprende a expresar preferencias fuertes y a usar también/tampoco.',
        grammarNote:
          '"Encantar" es más fuerte que "gustar": me encanta el cine (me gusta mucho). "Preferir" compara dos opciones: prefiero una comedia (no una película de acción). Usamos "también" para afirmaciones (A mí también) y "tampoco" para negaciones (A mí tampoco). Error frecuente: usar "también" después de una negación (decir "A mí también no me gusta" en vez de "A mí tampoco me gusta").',
        phrases: ['Me encanta...', 'Prefiero... (a)...', 'A mí también.', 'A mí tampoco.'],
        exercises: [
          { type: 'mcq', prompt: 'A mí ___ el cine. (me gusta mucho)', options: ['me encanta', 'prefiero', 'tampoco', 'también'], answer: 0 },
          { type: 'mcq', prompt: 'Yo ___ una comedia, no una película de terror.', options: ['encanto', 'prefiero', 'tampoco', 'también'], answer: 1 },
          { type: 'mcq', prompt: '—No me gusta el fútbol. —A mí ___.', options: ['también', 'tampoco', 'prefiero', 'encanta'], answer: 1 },
          { type: 'mcq', prompt: '—Me gusta la música. —A mí ___.', options: ['tampoco', 'también', 'prefiero', 'encanta'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Pasatiempos y tiempo libre',
        description: 'Palabras para deportes, música y actividades sociales.',
        vocabulary: [
          { word: 'Fútbol', category: 'deporte', translation: 'Soccer', example: 'Juego fútbol los sábados.' },
          { word: 'Baloncesto', category: 'deporte', translation: 'Basketball', example: 'Me gusta el baloncesto.' },
          { word: 'Música', category: 'pasatiempo', translation: 'Music', example: 'Me encanta la música.' },
          { word: 'Guitarra', category: 'pasatiempo', translation: 'Guitar', example: 'Toco la guitarra.' },
          { word: 'Cine', category: 'lugar', translation: 'Movies/cinema', example: 'Vamos al cine el sábado.' },
          { word: 'Película', category: 'entretenimiento', translation: 'Movie', example: 'Prefiero una comedia.' },
          { word: 'Leer', category: 'pasatiempo', translation: 'To read', example: 'Me gusta leer los domingos.' },
          { word: 'Concierto', category: 'actividad social', translation: 'Concert', example: 'Vamos a un concierto.' },
          { word: 'Fin de semana', category: 'tiempo', translation: 'Weekend', example: 'El fin de semana descanso.' },
          { word: 'Amigos', category: 'personas', translation: 'Friends', example: 'Juego con mis amigos.' },
          { word: 'Preferir', category: 'verbo', translation: 'To prefer', example: 'Prefiero el cine al parque.' },
          { word: 'Nadar', category: 'deporte', translation: 'To swim', example: 'Me gusta nadar en el verano.' },
          { word: 'Bailar', category: 'pasatiempo', translation: 'To dance', example: 'Me encanta bailar los fines de semana.' },
          { word: 'Videojuego', category: 'pasatiempo', translation: 'Video game', example: 'Juego videojuegos con mi hermano.' },
          { word: 'Dibujar', category: 'pasatiempo', translation: 'To draw', example: 'Me gusta dibujar en mi tiempo libre.' }
        ],
        exercises: [
          { type: 'mcq', prompt: '¿Qué significa "Fin de semana"?', options: ['Weekday', 'Weekend', 'Morning', 'Concert'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "Preferir"?', options: ['To prefer', 'To read', 'To play', 'To watch'], answer: 0 },
          { type: 'mcq', prompt: '¿Qué significa "Concierto"?', options: ['Movie', 'Concert', 'Book', 'Sport'], answer: 1 }
        ]
      })
    }
  },

  // ===============================================================
  // UNIDAD 11 - Salud y bienestar (PREMIUM)
  // ===============================================================
  {
    slug: 'salud-y-bienestar',
    title: 'Salud y bienestar',
    description: 'Partes del cuerpo, síntomas sencillos y pedir ayuda.',
    order: 11,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'No me siento bien',
        description: 'Un texto sobre una visita a la farmacia.',
        reading: {
          title: 'No me siento bien',
          parts: [
            'Esta mañana, Isabel se despierta y no se siente bien. Le duele la cabeza y también le duele un poco la garganta.',
            'Isabel decide ir a la farmacia cerca de su casa. El farmacéutico le pregunta: "¿Qué le duele?" Isabel responde: "Me duele la cabeza."',
            'El farmacéutico le da una medicina sencilla y le dice que descanse y tome mucha agua. Isabel le da las gracias y vuelve a casa a descansar.'
          ],
          questions: [
            '¿Qué le duele a Isabel?',
            '¿A dónde va Isabel?',
            '¿Qué le recomienda el farmacéutico?'
          ],
          ordering: {
            prompt: 'Ordena los eventos de la historia.',
            events: [
              'Isabel se despierta y no se siente bien.',
              'Isabel va a la farmacia.',
              'El farmacéutico le pregunta qué le duele.',
              'Isabel vuelve a casa a descansar.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué le duele a Isabel?', options: ['El estómago', 'La cabeza', 'La pierna', 'El brazo'], answer: 1 },
          { type: 'mcq', prompt: '¿A dónde va Isabel?', options: ['Al hospital', 'A la farmacia', 'A la escuela', 'Al parque'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué le pregunta el farmacéutico?', options: ['¿Cómo se llama?', '¿Qué le duele?', '¿Dónde vive?', '¿Cuántos años tiene?'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué le recomienda el farmacéutico?', options: ['Ir al hospital', 'Descansar y tomar agua', 'Hacer ejercicio', 'Comer mucho'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: a Isabel también le duele la garganta.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: Isabel va al hospital.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Isabel vuelve a casa a descansar.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: Isabel no se siente ___ esta mañana.', options: ['bien', 'feliz', 'ocupada', 'lista'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'En la farmacia',
        description: 'Una conversación básica en una farmacia.',
        listeningType: 'dialogue',
        difficulty: 'A1',
        durationSeconds: 40,
        speakers: ['Farmacéutico', 'Isabel'],
        intro: 'Escucha una conversación básica entre Isabel y el farmacéutico.',
        dialogue: [
          { speaker: 'Farmacéutico', line: 'Buenas tardes, ¿qué le duele?', translation: 'Good afternoon, what hurts?' },
          { speaker: 'Isabel', line: 'Me duele la cabeza y la garganta.', translation: 'My head and throat hurt.' },
          { speaker: 'Farmacéutico', line: '¿Tiene fiebre también?', translation: 'Do you have a fever too?' },
          { speaker: 'Isabel', line: 'No, no tengo fiebre. Solo estoy cansada.', translation: "No, I don't have a fever. I am just tired." },
          { speaker: 'Farmacéutico', line: 'Debe descansar y tomar mucha agua.', translation: 'You should rest and drink a lot of water.' },
          { speaker: 'Isabel', line: 'Muchas gracias, lo voy a hacer.', translation: "Thank you very much, I'll do that." }
        ],
        transcript:
          'Buenas tardes, ¿qué le duele? Me duele la cabeza y la garganta. ¿Tiene fiebre también? No, no tengo fiebre. Solo estoy cansada. Debe descansar y tomar mucha agua. Muchas gracias, lo voy a hacer.',
        phrases: ['¿Qué le duele?', 'Me duele / me duelen...', 'No tengo fiebre.', 'Debe descansar.'],
        phoneticSupport: {
          enabled: true,
          locale: 'es-419',
          focus: 'Las partes del cuerpo suelen llevar el acento en la penúltima sílaba (CA-be-za, gar-GAN-ta); "me duele" (singular) frente a "me duelen" (plural: me duelen los pies).',
          fullIpa: null,
          segments: [
            { text: 'cabeza', ipa: '/ka.ˈβe.sa/' },
            { text: 'garganta', ipa: '/ɡar.ˈɣan.ta/' }
          ],
          stressedWords: ['duele', 'también'],
          syllabification: [{ word: 'farmacéutico', syllables: 'far-ma-céu-ti-co' }],
          difficultSounds: ['me duele / me duelen'],
          reviewStatus: 'pending-review'
        },
        dictation: {
          segments: [
            { order: 0, text: '¿Qué le duele?' },
            { order: 1, text: 'Me duele la cabeza y la garganta.' },
            { order: 2, text: 'Debe descansar y tomar mucha agua.' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué le duele a Isabel?', options: ['El estómago', 'La cabeza y la garganta', 'La pierna', 'El brazo'], answer: 1 },
          { type: 'mcq', prompt: '¿Tiene fiebre Isabel?', options: ['Sí', 'No', 'No dice', 'Un poco'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué le recomienda el farmacéutico?', options: ['Tomar medicina fuerte', 'Descansar y tomar agua', 'Ir al hospital', 'Hacer ejercicio'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Expresa un malestar',
        description: 'Practica decir qué te duele y cómo te sientes.',
        mission: 'Dile a un compañero qué te duele hoy y cómo te sientes.',
        phrases: ['Me duele / me duelen...', 'No me siento bien.', 'Estoy cansado/a.', '¿Qué te duele?'],
        dialogue: [
          { speaker: 'Tú', line: 'No me siento bien. Me duele la cabeza.', translation: "I don't feel well. My head hurts." },
          { speaker: 'Compañero/a', line: '¿Tienes fiebre?', translation: 'Do you have a fever?' },
          { speaker: 'Tú', line: 'No, solo estoy cansado/a.', translation: 'No, I am just tired.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Di en voz alta qué te duele hoy y cómo te sientes, usando "me duele/me duelen".', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Pregúntale a un compañero "¿Qué te duele?" y escucha su respuesta. Si no tienes micrófono, responde por escrito.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe sobre un malestar',
        description: 'Escribe un pequeño texto sobre un malestar sencillo y qué hacer.',
        mission: 'Escribe 6-7 oraciones: qué te duele, cómo te sientes y qué vas a hacer para sentirte mejor.',
        phrases: ['Me duele / me duelen...', 'No me siento bien.', 'Debo...', 'Voy a...'],
        dialogue: [{ speaker: 'Modelo', line: 'Hoy no me siento bien. Me duele la cabeza y la garganta. No tengo fiebre. Voy a descansar y tomar agua.', translation: "Today I don't feel well. My head and throat hurt. I don't have a fever. I am going to rest and drink water." }],
        exercises: [
          { type: 'writing', prompt: 'Escribe 6-7 oraciones sobre un malestar sencillo: qué te duele y qué vas a hacer.', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Me duele / me duelen',
        description: 'Aprende a expresar síntomas con doler y estar.',
        grammarNote:
          '"Doler" funciona como "gustar": me duele la cabeza (singular), me duelen los pies (plural). Usamos "tener" con algunos síntomas: tengo fiebre, tengo tos. Usamos "estar" para estados: estoy cansado/a. Error frecuente: decir "me duele los pies" en vez de "me duelen los pies" (debe concordar en número con lo que duele).',
        phrases: ['Me duele la cabeza.', 'Me duelen los pies.', 'Tengo fiebre.', 'Estoy cansado/a.'],
        exercises: [
          { type: 'mcq', prompt: 'Me ___ la cabeza.', options: ['duele', 'duelen', 'dueles', 'duelo'], answer: 0 },
          { type: 'mcq', prompt: 'Me ___ los pies.', options: ['duele', 'duelen', 'dueles', 'duelo'], answer: 1 },
          { type: 'mcq', prompt: 'Yo ___ fiebre hoy.', options: ['tengo', 'soy', 'estoy', 'duelo'], answer: 0 },
          { type: 'mcq', prompt: 'Yo ___ muy cansado/a.', options: ['tengo', 'soy', 'estoy', 'duelo'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'El cuerpo y la salud',
        description: 'Palabras para partes del cuerpo y síntomas sencillos.',
        vocabulary: [
          { word: 'Cabeza', category: 'cuerpo', translation: 'Head', example: 'Me duele la cabeza.' },
          { word: 'Garganta', category: 'cuerpo', translation: 'Throat', example: 'Me duele la garganta.' },
          { word: 'Estómago', category: 'cuerpo', translation: 'Stomach', example: 'Me duele el estómago.' },
          { word: 'Pies', category: 'cuerpo', translation: 'Feet', example: 'Me duelen los pies.' },
          { word: 'Brazo', category: 'cuerpo', translation: 'Arm', example: 'Me duele el brazo.' },
          { word: 'Fiebre', category: 'síntoma', translation: 'Fever', example: 'No tengo fiebre.' },
          { word: 'Tos', category: 'síntoma', translation: 'Cough', example: 'Tengo un poco de tos.' },
          { word: 'Cansado/a', category: 'estado', translation: 'Tired', example: 'Estoy cansado hoy.' },
          { word: 'Farmacia', category: 'lugar', translation: 'Pharmacy', example: 'Voy a la farmacia.' },
          { word: 'Médico/a', category: 'persona', translation: 'Doctor', example: 'El médico me revisa.' },
          { word: 'Descansar', category: 'verbo', translation: 'To rest', example: 'Debo descansar hoy.' },
          { word: 'Medicina', category: 'salud', translation: 'Medicine', example: 'Tomo la medicina.' },
          { word: 'Diente', category: 'cuerpo', translation: 'Tooth', example: 'Me duele un diente.' },
          { word: 'Ojo', category: 'cuerpo', translation: 'Eye', example: 'Me duele el ojo derecho.' },
          { word: 'Mano', category: 'cuerpo', translation: 'Hand', example: 'Me lavo las manos antes de comer.' }
        ],
        exercises: [
          { type: 'mcq', prompt: '¿Qué significa "Garganta"?', options: ['Head', 'Throat', 'Stomach', 'Arm'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "Descansar"?', options: ['To rest', 'To work', 'To study', 'To walk'], answer: 0 },
          { type: 'mcq', prompt: '¿Qué significa "Fiebre"?', options: ['Cough', 'Fever', 'Medicine', 'Pharmacy'], answer: 1 }
        ]
      })
    }
  },

  // ===============================================================
  // UNIDAD 12 - Planes y repaso (PREMIUM)
  // ===============================================================
  {
    slug: 'planes-y-repaso',
    title: 'Planes y repaso',
    description: 'Planes inmediatos, fechas, el clima y repaso general de A1.',
    order: 12,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'Planes para el verano',
        description: 'Un texto sobre los planes de vacaciones de Sara.',
        reading: {
          title: 'Planes para el verano',
          parts: [
            'En julio, Sara va a tener vacaciones. Ella va a viajar a la playa con su familia y quiere nadar todos los días.',
            'El clima en julio es caluroso y soleado, perfecto para la playa. Sara también va a visitar a sus abuelos en agosto.',
            'Para su cumpleaños, el quince de agosto, Sara va a celebrar con toda su familia. Está muy contenta con sus planes de verano.'
          ],
          questions: [
            '¿A dónde va a viajar Sara?',
            '¿Cómo es el clima en julio?',
            '¿Cuándo es el cumpleaños de Sara?'
          ],
          ordering: {
            prompt: 'Ordena los eventos de la historia.',
            events: [
              'Sara empieza sus vacaciones en julio.',
              'Sara viaja a la playa con su familia.',
              'Sara visita a sus abuelos en agosto.',
              'Sara celebra su cumpleaños el quince de agosto.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: '¿A dónde va a viajar Sara?', options: ['A la montaña', 'A la playa', 'A la ciudad', 'No viaja'], answer: 1 },
          { type: 'mcq', prompt: '¿Cómo es el clima en julio?', options: ['Frío', 'Caluroso y soleado', 'Lluvioso', 'Nublado'], answer: 1 },
          { type: 'mcq', prompt: '¿Cuándo es el cumpleaños de Sara?', options: ['El cinco de julio', 'El quince de agosto', 'El primero de julio', 'El veinte de agosto'], answer: 1 },
          { type: 'mcq', prompt: '¿A quién visita Sara en agosto?', options: ['A sus amigos', 'A sus abuelos', 'A su profesor', 'A nadie'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Sara quiere nadar todos los días.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: el cumpleaños de Sara es en julio.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Sara está contenta con sus planes.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: el clima en julio es caluroso y ___.', options: ['soleado', 'nevado', 'frío', 'nublado'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Un mensaje sobre el fin de semana',
        description: 'Un mensaje de voz sobre planes para el fin de semana.',
        listeningType: 'voice-message',
        difficulty: 'A1',
        durationSeconds: 40,
        speakers: ['Sara'],
        intro: 'Escucha el mensaje de voz de Sara sobre sus planes para el fin de semana.',
        dialogue: [],
        transcript:
          'Hola, este fin de semana voy a ir a la playa con mi familia. El sábado, vamos a nadar y comer en la playa. El domingo, quiero descansar en casa. ¿Y tú? ¿Qué vas a hacer este fin de semana?',
        phrases: ['Voy a...', 'Vamos a...', 'Quiero...', '¿Qué vas a hacer?'],
        phoneticSupport: {
          enabled: true,
          locale: 'es-419',
          focus: 'Repaso integrado: entonación declarativa (baja al final: Voy a la playa.) frente a entonación interrogativa (sube al final: ¿Qué vas a hacer?).',
          fullIpa: null,
          segments: [
            { text: 'voy a ir', ipa: '/ˈboj a iɾ/' },
            { text: '¿qué vas a hacer?', ipa: '/ke βas a a.ˈseɾ/' }
          ],
          stressedWords: ['playa', 'después'],
          syllabification: [{ word: 'domingo', syllables: 'do-min-go' }],
          difficultSounds: ['entonación declarativa vs. interrogativa'],
          reviewStatus: 'pending-review'
        },
        dictation: {
          segments: [
            { order: 0, text: 'Voy a ir a la playa con mi familia.' },
            { order: 1, text: 'El sábado vamos a nadar.' },
            { order: 2, text: '¿Qué vas a hacer este fin de semana?' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿A dónde va Sara este fin de semana?', options: ['Al parque', 'A la playa', 'A la escuela', 'A casa de un amigo'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué van a hacer el sábado?', options: ['Estudiar', 'Nadar y comer', 'Trabajar', 'Dormir'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué quiere hacer Sara el domingo?', options: ['Viajar', 'Descansar en casa', 'Ir a la escuela', 'Nadar'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Habla de tus planes',
        description: 'Practica hablar de tus planes para el futuro cercano.',
        mission: 'Cuéntale a un compañero tus planes para este fin de semana o tus próximas vacaciones.',
        phrases: ['Voy a...', 'Quiero...', '¿Qué vas a hacer?', 'Mis planes son...'],
        dialogue: [
          { speaker: 'Tú', line: 'Este fin de semana voy a...', translation: 'This weekend I am going to...' },
          { speaker: 'Compañero/a', line: '¿Qué más vas a hacer?', translation: 'What else are you going to do?' },
          { speaker: 'Tú', line: 'También quiero...', translation: 'I also want to...' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Di en voz alta tres planes para el fin de semana usando "voy a...".', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Pregúntale a un compañero "¿Qué vas a hacer este fin de semana?" y escucha su respuesta. Si no tienes micrófono, responde por escrito.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe tus planes',
        description: 'Escribe un párrafo corto sobre tus planes y repasa lo aprendido en A1.',
        mission: 'Escribe 6-8 oraciones sobre tus planes para el fin de semana o las próximas vacaciones, incluyendo el clima y una fecha.',
        phrases: ['Voy a...', 'El clima va a ser...', 'Mi cumpleaños es en...', 'Quiero...'],
        dialogue: [{ speaker: 'Modelo', line: 'Este verano voy a viajar a la playa. Va a hacer calor y sol. Mi cumpleaños es el quince de agosto. Quiero celebrar con mi familia.', translation: "This summer I am going to travel to the beach. It's going to be hot and sunny. My birthday is on August fifteenth. I want to celebrate with my family." }],
        exercises: [
          { type: 'writing', prompt: 'Escribe 6-8 oraciones sobre tus planes para el fin de semana o las vacaciones, incluyendo una fecha y el clima.', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Ir a + infinitivo y repaso de A1',
        description: 'Aprende a hablar del futuro cercano y repasa el presente.',
        grammarNote:
          'Usamos "ir a + infinitivo" para hablar de planes cercanos: voy a viajar, vamos a nadar. Para fechas usamos "el + número + de + mes": el quince de agosto. Este es un repaso final de A1: ser/estar, tener, presente regular, gustar/encantar, hay/estar, y ahora ir a + infinitivo para el futuro. Error frecuente: usar el presente simple para hablar de planes futuros específicos (decir "viajo mañana a la playa" en vez de "voy a viajar mañana a la playa" cuando se quiere enfatizar el plan).',
        phrases: ['Voy a...', 'Vamos a...', 'el quince de agosto', '¿Qué vas a hacer?'],
        exercises: [
          { type: 'mcq', prompt: 'Yo ___ a viajar este verano.', options: ['voy', 'vas', 'va', 'van'], answer: 0 },
          { type: 'mcq', prompt: 'Nosotros ___ a nadar el sábado.', options: ['voy', 'va', 'vamos', 'van'], answer: 2 },
          { type: 'mcq', prompt: 'Mi cumpleaños es ___ quince de agosto.', options: ['el', 'la', 'en', 'a'], answer: 0 },
          { type: 'mcq', prompt: '¿Qué ___ a hacer este fin de semana?', options: ['vas', 'va', 'voy', 'van'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Meses, clima y planes',
        description: 'Palabras para meses, estaciones, clima y vacaciones.',
        vocabulary: [
          { word: 'Enero', category: 'mes', translation: 'January', example: 'Mi cumpleaños es en enero.' },
          { word: 'Julio', category: 'mes', translation: 'July', example: 'Las vacaciones son en julio.' },
          { word: 'Agosto', category: 'mes', translation: 'August', example: 'Voy a la playa en agosto.' },
          { word: 'Diciembre', category: 'mes', translation: 'December', example: 'Celebramos en diciembre.' },
          { word: 'Verano', category: 'estación', translation: 'Summer', example: 'Me gusta el verano.' },
          { word: 'Invierno', category: 'estación', translation: 'Winter', example: 'El invierno es frío.' },
          { word: 'Calor', category: 'clima', translation: 'Heat', example: 'Hace mucho calor hoy.' },
          { word: 'Frío', category: 'clima', translation: 'Cold', example: 'Hace frío en invierno.' },
          { word: 'Sol', category: 'clima', translation: 'Sun', example: 'Hoy hace sol.' },
          { word: 'Lluvia', category: 'clima', translation: 'Rain', example: 'Hay mucha lluvia.' },
          { word: 'Vacaciones', category: 'planes', translation: 'Vacation', example: 'Las vacaciones empiezan en julio.' },
          { word: 'Cumpleaños', category: 'celebración', translation: 'Birthday', example: 'Mi cumpleaños es el quince de agosto.' },
          { word: 'Playa', category: 'lugar', translation: 'Beach', example: 'Voy a la playa con mi familia.' },
          { word: 'Primavera', category: 'estación', translation: 'Spring', example: 'Las flores salen en primavera.' },
          { word: 'Otoño', category: 'estación', translation: 'Fall/autumn', example: 'En otoño hace un poco de frío.' }
        ],
        exercises: [
          { type: 'mcq', prompt: '¿Qué significa "Vacaciones"?', options: ['Vacation', 'Birthday', 'Rain', 'Winter'], answer: 0 },
          { type: 'mcq', prompt: '¿Qué significa "Calor"?', options: ['Cold', 'Heat', 'Rain', 'Sun'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué significa "Cumpleaños"?', options: ['Vacation', 'Summer', 'Birthday', 'Beach'], answer: 2 }
        ]
      })
    }
  }
];

module.exports = { units, language, level, courseTitle, courseDescription };
