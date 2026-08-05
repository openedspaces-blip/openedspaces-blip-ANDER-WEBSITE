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
            'Mi profesor se llama Diego. Él dice: "¡Buenos días, clase!" y nosotros respondemos: "¡Buenos días, profesor!"',
            'Al lado de mi silla hay un chico. Él dice: "Hola, soy Marco. Mucho gusto." Yo respondo: "Igualmente. ¿Cómo se escribe tu nombre?" y él deletrea su nombre: M-A-R-C-O.'
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
        ],
        // Scored Comprensión test pilot for Listening's 6-tab reorganization
        // (see lib/grammarTestSanitizer.js - same shape/sanitizer/grading as
        // Grammar's extra.grammarTest, just under extra.listeningComprehension).
        // Built from the same dialogue as `exercises`/`dialogue` above,
        // which stay unchanged for the old ungated inline-feedback view.
        listeningComprehension: {
          id: 'spanish-a1-hola-mucho-gusto-listening-comprehension',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: '¿Qué dice Marco cuando conoce a Valentina?',
              options: [
                { id: 'o1', text: 'Adiós' },
                { id: 'o2', text: 'Mucho gusto' },
                { id: 'o3', text: '¿Qué hora es?' },
                { id: 'o4', text: 'Tengo hambre' }
              ],
              correctOptionId: 'o2',
              explanation: 'Marco responde al saludo de Valentina con "Mucho gusto".'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: '¿Cómo se despide Marco al final?',
              options: [
                { id: 'o1', text: 'Buenos días' },
                { id: 'o2', text: 'Hola' },
                { id: 'o3', text: 'Nos vemos en clase' },
                { id: 'o4', text: 'Gracias' }
              ],
              correctOptionId: 'o3',
              explanation: 'Marco se despide diciendo "¡Nos vemos en clase!".'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: '¿Qué responde Marco a "¿Cómo estás?"?',
              options: [
                { id: 'o1', text: 'Soy Marco' },
                { id: 'o2', text: 'Estoy bien, gracias' },
                { id: 'o3', text: 'Mucho gusto' },
                { id: 'o4', text: '¿Cómo te llamas?' }
              ],
              correctOptionId: 'o2',
              explanation: 'Marco contesta "Estoy bien, gracias. ¿Y tú?".'
            },
            {
              id: 'q4',
              type: 'fill_blank',
              prompt: 'Valentina dice: "¡Hola! Me llamo Valentina. ¿Cómo te ___ tú?"',
              acceptedAnswers: ['llamas'],
              explanation: 'La pregunta completa es "¿Cómo te llamas tú?".'
            },
            {
              id: 'q5',
              type: 'fill_blank',
              prompt: 'Marco dice: "Soy ___ aquí."',
              acceptedAnswers: ['de'],
              explanation: 'Marco dice "Soy de aquí" para explicar de dónde es.'
            },
            {
              id: 'q6',
              type: 'ordering',
              prompt: 'Ordena las líneas del diálogo.',
              items: [
                { id: 'w1', text: '¡Hola! Me llamo Valentina. ¿Cómo te llamas tú?' },
                { id: 'w2', text: 'Hola, Valentina. Soy Marco. Mucho gusto.' },
                { id: 'w3', text: 'Mucho gusto, Marco. ¿Cómo estás?' },
                { id: 'w4', text: 'Estoy bien, gracias. ¿Y tú?' }
              ],
              correctOrder: ['w1', 'w2', 'w3', 'w4'],
              explanation: 'Valentina saluda y pregunta el nombre; Marco se presenta; Valentina pregunta cómo está; Marco responde.'
            }
          ]
        }
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
        // directSupport: direct/immersion-mode pilot (Spanish->Spanish, spec
        // §3/§4/§9) - definitions, synonyms/opposites and extra examples,
        // all in Spanish. No image/imageAlt yet (spec §10). Pilot scope:
        // Unit 1 only.
        vocabulary: [
          {
            word: 'Hola',
            category: 'saludo',
            translation: 'Hello',
            example: 'Hola, ¿cómo estás?',
            directSupport: {
              definition: 'Palabra que se usa para saludar a alguien.',
              simpleDefinition: 'Una palabra para saludar.',
              opposites: ['Adiós'],
              contextExamples: ['Hola, ¿cómo estás?', 'Hola, buenos días.']
            }
          },
          {
            word: 'Buenos días',
            category: 'saludo',
            translation: 'Good morning',
            example: 'Buenos días, profesor.',
            directSupport: {
              definition: 'Saludo que se usa por la mañana, antes del mediodía.',
              simpleDefinition: 'Hola, pero solo en la mañana.',
              opposites: ['Buenas noches'],
              contextExamples: ['Buenos días, profesor.', 'Buenos días a todos.']
            }
          },
          {
            word: 'Buenas tardes',
            category: 'saludo',
            translation: 'Good afternoon',
            example: 'Buenas tardes a todos.',
            directSupport: {
              definition: 'Saludo que se usa por la tarde.',
              simpleDefinition: 'Hola, pero solo en la tarde.',
              contextExamples: ['Buenas tardes a todos.', 'Buenas tardes, señora.']
            }
          },
          {
            word: 'Buenas noches',
            category: 'saludo',
            translation: 'Good evening/night',
            example: 'Buenas noches, hasta mañana.',
            directSupport: {
              definition: 'Saludo o despedida que se usa por la noche.',
              simpleDefinition: 'Hola o adiós, pero solo de noche.',
              opposites: ['Buenos días'],
              contextExamples: ['Buenas noches, hasta mañana.', 'Buenas noches a todos.']
            }
          },
          {
            word: 'Adiós',
            category: 'despedida',
            translation: 'Goodbye',
            example: 'Adiós, nos vemos mañana.',
            directSupport: {
              definition: 'Palabra que se dice al despedirse de alguien.',
              simpleDefinition: 'Una palabra para despedirse.',
              synonyms: ['Hasta luego'],
              opposites: ['Hola'],
              contextExamples: ['Adiós, nos vemos mañana.', 'Adiós, que tengas buen día.']
            }
          },
          {
            word: 'Hasta luego',
            category: 'despedida',
            translation: 'See you later',
            example: '¡Hasta luego, Marco!',
            directSupport: {
              definition: 'Expresión que se usa al despedirse, cuando vas a ver a la persona pronto.',
              simpleDefinition: 'Adiós, hasta otro momento.',
              synonyms: ['Adiós'],
              contextExamples: ['¡Hasta luego, Marco!', 'Hasta luego, nos vemos mañana.']
            }
          },
          {
            word: 'Nombre',
            category: 'presentación',
            translation: 'Name',
            example: 'Mi nombre es Valentina.',
            directSupport: {
              definition: 'Palabra que usan las personas para llamarte.',
              simpleDefinition: 'Cómo te llamas.',
              contextExamples: ['Mi nombre es Valentina.', '¿Cuál es tu nombre?']
            }
          },
          {
            word: 'Mucho gusto',
            category: 'presentación',
            translation: 'Nice to meet you',
            example: 'Mucho gusto, me llamo Diego.',
            directSupport: {
              definition: 'Expresión cortés que se dice al conocer a alguien por primera vez.',
              simpleDefinition: 'Lo que dices al conocer a alguien nuevo.',
              contextExamples: ['Mucho gusto, me llamo Diego.', 'Mucho gusto en conocerte.']
            }
          },
          {
            word: 'Por favor',
            category: 'cortesía',
            translation: 'Please',
            example: 'Repite, por favor.',
            directSupport: {
              definition: 'Palabra cortés que se usa al pedir algo.',
              simpleDefinition: 'Una palabra amable para pedir algo.',
              contextExamples: ['Repite, por favor.', 'Ayúdame, por favor.']
            }
          },
          {
            word: 'Gracias',
            category: 'cortesía',
            translation: 'Thank you',
            example: 'Gracias por tu ayuda.',
            directSupport: {
              definition: 'Palabra que se usa para agradecer a alguien.',
              simpleDefinition: 'Una palabra de agradecimiento.',
              opposites: ['De nada'],
              contextExamples: ['Gracias por tu ayuda.', 'Muchas gracias.']
            }
          },
          {
            word: 'De nada',
            category: 'cortesía',
            translation: "You're welcome",
            example: '—Gracias. —De nada.',
            directSupport: {
              definition: 'Respuesta cortés cuando alguien te da las gracias.',
              simpleDefinition: 'Lo que dices cuando alguien te agradece.',
              opposites: ['Gracias'],
              contextExamples: ['—Gracias. —De nada.', 'De nada, fue un placer.']
            }
          },
          {
            word: 'Amigo/a',
            category: 'personas',
            translation: 'Friend',
            example: 'Marco es mi amigo.',
            directSupport: {
              definition: 'Persona que te cae bien y en quien confías.',
              simpleDefinition: 'Alguien que te cae bien.',
              opposites: ['Desconocido/a'],
              contextExamples: ['Marco es mi amigo.', 'Ella es mi mejor amiga.']
            }
          },
          {
            word: 'Profesor/a',
            category: 'personas',
            translation: 'Teacher',
            example: 'Mi profesor se llama Diego.',
            directSupport: {
              definition: 'Persona que ayuda a los estudiantes a aprender.',
              simpleDefinition: 'Alguien que enseña en la escuela.',
              synonyms: ['Maestro/a'],
              opposites: ['Estudiante'],
              contextExamples: ['Mi profesor se llama Diego.', 'La profesora explica la lección.']
            }
          },
          {
            word: 'Uno, dos, tres',
            category: 'números',
            translation: 'One, two, three',
            example: 'Uno, dos, tres, cuatro, cinco.',
            directSupport: {
              definition: 'Los primeros tres números al contar.',
              simpleDefinition: 'Los números 1, 2 y 3.',
              contextExamples: ['Uno, dos, tres, cuatro, cinco.', 'Cuento uno, dos, tres.']
            }
          },
          {
            word: 'Diez',
            category: 'números',
            translation: 'Ten',
            example: 'Tengo diez lápices.',
            directSupport: {
              definition: 'El número que sigue después del nueve.',
              simpleDefinition: 'El número 10.',
              contextExamples: ['Tengo diez lápices.', 'Somos diez estudiantes.']
            }
          },
          {
            word: 'Veinte',
            category: 'números',
            translation: 'Twenty',
            example: 'Hay veinte estudiantes.',
            directSupport: {
              definition: 'El número que equivale a dos veces diez.',
              simpleDefinition: 'El número 20.',
              contextExamples: ['Hay veinte estudiantes.', 'Tengo veinte años.']
            }
          }
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
            'Me llamo Andrés y vivo con mis padres. Mi casa tiene tres habitaciones: mi dormitorio, el dormitorio de mis padres y la sala. También hay una cocina y un baño.',
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
            'Me llamo Camila y vivo en un barrio tranquilo. Mi barrio tiene un parque, una farmacia y un supermercado. El parque está cerca de mi casa; voy allí todos los fines de semana.',
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
            'Hoy, el mesero le pregunta: "¿Qué desea tomar?" Mariana responde: "Quiero un café con leche, por favor." También pide un poco de fruta.',
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
  // UNIDAD 11 - No me siento bien (PREMIUM)
  // ===============================================================
  {
    slug: 'salud-y-bienestar-a1',
    title: 'No me siento bien',
    description: 'Partes del cuerpo, malestares frecuentes y cómo pedir ayuda en una farmacia.',
    order: 11,
    accessTier: 'premium',
    unitOverview: {
      objective: 'Expresar cómo te sientes, decir qué te duele y pedir ayuda de forma sencilla.',
      outcomes: [
        'nombrar partes básicas del cuerpo',
        'expresar un dolor o un malestar',
        'preguntar a otra persona qué le duele',
        'comprender recomendaciones sencillas'
      ],
      grammar: ['me duele + singular', 'me duelen + plural', 'tener + síntoma', 'estar + estado'],
      vocabulary: ['partes del cuerpo', 'síntomas frecuentes', 'la farmacia', 'recomendaciones básicas'],
      scenario: 'No te sientes bien y explicas tus síntomas en una farmacia.'
    },
    activities: {
      reading: activity('reading', {
        title: 'No me siento bien',
        description: 'Isabel se siente mal y pide ayuda en una farmacia.',
        reading: {
          title: 'No me siento bien',
          parts: [
            'Esta mañana, Isabel se despierta con dolor de cabeza y un poco de dolor de garganta. Está cansada y no se siente bien.',
            'Como la farmacia está cerca de su casa, decide ir y pedir ayuda. El farmacéutico la saluda y pregunta: «Buenos días, ¿qué le duele?». Isabel responde: «Me duele la cabeza y también la garganta».',
            'El farmacéutico le recomienda descansar, beber mucha agua y consultar a un médico si no mejora. Isabel le da las gracias y vuelve a casa para descansar.'
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
          { type: 'mcq', prompt: '¿Qué le recomienda el farmacéutico?', options: ['Descansar y beber agua', 'Hacer ejercicio', 'Comer mucho', 'Volver al trabajo'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: a Isabel también le duele la garganta.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Verdadero o falso: Isabel va al hospital.', options: ['Verdadero', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Verdadero o falso: Isabel vuelve a casa a descansar.', options: ['Verdadero', 'Falso'], answer: 0 },
          { type: 'mcq', prompt: 'Elige la mejor palabra: Isabel no se siente ___ esta mañana.', options: ['bien', 'feliz', 'ocupada', 'lista'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'En la farmacia',
        description: 'Escucha cómo Isabel explica sus síntomas y recibe una recomendación.',
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
          { speaker: 'Farmacéutico', line: 'Le recomiendo descansar, beber agua y consultar a un médico si no mejora.', translation: 'I recommend resting, drinking water, and seeing a doctor if you do not improve.' },
          { speaker: 'Isabel', line: 'Muchas gracias, lo voy a hacer.', translation: "Thank you very much, I'll do that." }
        ],
        transcript:
          'Buenas tardes, ¿qué le duele? Me duele la cabeza y la garganta. ¿Tiene fiebre también? No, no tengo fiebre. Solo estoy cansada. Le recomiendo descansar, beber agua y consultar a un médico si no mejora. Muchas gracias, lo voy a hacer.',
        phrases: ['¿Qué le duele?', 'Me duele / me duelen...', 'No tengo fiebre.', 'Le recomiendo descansar.'],
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
            { order: 2, text: 'Le recomiendo descansar y beber agua.' }
          ]
        },
        exercises: [
          { type: 'mcq', prompt: '¿Qué le duele a Isabel?', options: ['El estómago', 'La cabeza y la garganta', 'La pierna', 'El brazo'], answer: 1 },
          { type: 'mcq', prompt: '¿Tiene fiebre Isabel?', options: ['Sí', 'No', 'No dice', 'Un poco'], answer: 1 },
          { type: 'mcq', prompt: '¿Qué le recomienda el farmacéutico?', options: ['Hacer ejercicio', 'Descansar, beber agua y consultar a un médico si no mejora', 'Volver al trabajo', 'Comer más'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Expresa un malestar',
        description: 'Practica cómo explicar un malestar en una situación cotidiana.',
        mission: 'Imagina que no te sientes bien. Graba una respuesta breve: explica cómo te sientes, qué te duele y si tienes fiebre.',
        phrases: ['Me duele / me duelen...', 'No me siento bien.', 'Estoy cansado/a.', '¿Qué te duele?'],
        dialogue: [
          { speaker: 'Tú', line: 'No me siento bien. Me duele la cabeza.', translation: "I don't feel well. My head hurts." },
          { speaker: 'Compañero/a', line: '¿Tienes fiebre?', translation: 'Do you have a fever?' },
          { speaker: 'Tú', line: 'No, solo estoy cansado/a.', translation: 'No, I am just tired.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Imagina que estás en una farmacia. Di cómo te sientes y usa «me duele» o «me duelen» para describir un malestar.', answer: 'Práctica oral' },
          { type: 'practice', prompt: 'Pregunta «¿Qué te duele?» y practica una respuesta completa. Si no tienes micrófono, escribe la respuesta.', answer: 'Práctica oral o escrita' }
        ]
      }),
      writing: activity('writing', {
        title: 'Escribe sobre un malestar',
        description: 'Escribe un texto breve y guiado para explicar un malestar.',
        mission: 'Imagina que no te sientes bien. Escribe entre 6 y 7 oraciones: cómo te sientes, qué te duele, si tienes otro síntoma y qué vas a hacer para cuidarte.',
        phrases: ['Me duele / me duelen...', 'No me siento bien.', 'Debo...', 'Voy a...'],
        dialogue: [{ speaker: 'Modelo', line: 'Hoy no me siento bien. Me duele la cabeza y la garganta. No tengo fiebre. Voy a descansar y tomar agua.', translation: "Today I don't feel well. My head and throat hurt. I don't have a fever. I am going to rest and drink water." }],
        exercises: [
          { type: 'writing', prompt: 'Escribe entre 6 y 7 oraciones. Sigue este orden: 1) cómo te sientes; 2) qué te duele; 3) otro síntoma; 4) qué vas a hacer para cuidarte.', answer: 'Respuesta abierta' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Me duele / me duelen',
        description: 'Distingue «me duele», «me duelen», «tengo» y «estoy».',
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
        description: 'Aprende palabras básicas para hablar del cuerpo, los síntomas y el cuidado personal.',
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
          { word: 'Medicamento', category: 'salud', translation: 'Medicine', example: 'Tomo el medicamento según la indicación médica.' },
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

// A1 audio remains short and highly supported, but every script includes
// enough repeated, unit-specific language for a meaningful first listen.
const A1_LISTENING_EXTENSIONS = {
  'hola-mucho-gusto': [['Valentina', 'Mi nombre se escribe V-A-L-E-N-T-I-N-A. ¿Cómo se escribe Marco?'], ['Marco', 'M-A-R-C-O. Ahora vamos juntos al salón.']],
  'informacion-personal': [['Camila', 'Tengo diecinueve años y estudio español por las tardes.'], ['Camila', 'Vivo con mi familia en Santiago y mi nacionalidad es mexicana.']],
  'mi-familia-y-mis-amigos': [['Narrador/a', 'Mi hermana es menor que yo, pero mis primos son mayores.'], ['Narrador/a', 'Los domingos mis amigos conocen a mis padres y todos almorzamos juntos.']],
  'mi-rutina-diaria': [['Diego', 'Después de desayunar, me visto y salgo de casa a las siete.'], ['Tomás', 'Yo preparo mi mochila por la noche para no llegar tarde a clase.']],
  'mi-casa': [['Narrador/a', 'En la cocina hay una mesa pequeña y las sillas están junto a la ventana.'], ['Narrador/a', 'Mi habitación está arriba, entre el baño y el cuarto de mi hermano.']],
  'mi-barrio-y-mi-ciudad': [['Vecino', 'Para llegar al parque, gira a la izquierda después del banco.'], ['Turista', 'Perfecto, voy en autobús y bajo frente a la biblioteca.']],
  'comida-y-bebida': [['Cliente', 'Me gustaría un vaso de agua y una ensalada, por favor.'], ['Mesero', 'Claro; ¿quiere también pan o prefiere solo la ensalada?']],
  'de-compras': [['Clienta', 'La camisa azul me queda bien, pero necesito una talla más grande.'], ['Vendedora', 'Tenemos la misma camisa en verde y cuesta veinte euros.']],
  'estudios-y-trabajo': [['Natalia', 'Tengo que terminar un informe antes de las cuatro.'], ['Entrevistador', 'Puedes usar la computadora de la tienda después de atender a los clientes.']],
  'tiempo-libre': [['Ana', 'Los sábados prefiero leer en el parque porque me encanta estar al aire libre.'], ['Kevin', 'A mí también, aunque a veces juego al fútbol con mis amigos.']],
  'salud-y-bienestar-a1': [['Farmacéutico', 'Tienes que descansar esta tarde y beber mucha agua.'], ['Isabel', 'De acuerdo; si mañana me siento mejor, vuelvo a clase.']],
  'planes-y-repaso': [['Narrador/a', 'El sábado voy a visitar a mi abuela si hace buen tiempo.'], ['Narrador/a', 'En agosto voy a preparar una comida para mi familia.']]
};

for (const unit of units) {
  const extraLines = A1_LISTENING_EXTENSIONS[unit.slug];
  if (!extraLines) continue;
  const listening = unit.activities.listening;
  if (Array.isArray(listening.dialogue) && listening.dialogue.length) {
    listening.dialogue.push(...extraLines.map(([speaker, line]) => ({ speaker, line })));
    listening.transcript = listening.dialogue.map(({ line }) => line).join(' ');
  } else {
    listening.transcript = `${listening.transcript} ${extraLines.map(([, line]) => line).join(' ')}`;
  }
}

// All Spanish Listening activities use one clear narrator, in the same
// editorial format as the monologues used in the other language courses.
const A1_LISTENING_MONOLOGUES = {
  'hola-mucho-gusto': '¡Hola! Me llamo Valentina y hoy es mi primer día de clase. Estoy un poco nerviosa, pero también contenta. Al entrar al salón, conozco a un compañero llamado Marco. Nos saludamos y hablamos de dónde somos. Después, deletreo mi nombre: V-A-L-E-N-T-I-N-A. Marco también deletrea el suyo: M-A-R-C-O. Al final decimos “Mucho gusto” y entramos juntos a clase.',
  'informacion-personal': 'Hola, me llamo Camila. Tengo diecinueve años y soy de México. Ahora vivo en Santiago con mi familia y estudio español por las tardes. Mi número de teléfono es el 809-555-0199 y mi correo electrónico es camila@correo.com. Me gusta conocer personas de otros países y practicar con mis compañeros. Espero conocerte pronto. ¡Hasta luego!',
  'mi-familia-y-mis-amigos': 'Me llamo Sofía y esta es mi familia. Mi madre se llama Carmen y mi padre se llama Rafael. Tengo una hermana llamada Lucía y un hermano llamado Tomás. Lucía tiene dieciséis años y es alta; Tomás tiene nueve. Mi abuela Rosa vive con nosotros y es muy amable. Algunos primos son mayores que yo. Los domingos almorzamos juntos y hablamos de nuestra semana.',
  'mi-rutina-diaria': 'Me llamo Tomás y me levanto a las seis y media cada mañana. Desayuno, me visto y preparo mi mochila antes de salir de casa. Camino a la escuela con mi hermana. Las clases empiezan a las ocho. Después de la escuela hago la tarea y descanso un poco. Por la noche dejo preparada mi mochila. Así casi nunca llego tarde a clase.',
  'mi-casa': 'Me llamo Carla y vivo en una casa con tres habitaciones, una sala grande, una cocina y dos baños. En la sala hay un sofá y una mesa. En la cocina tenemos una nevera, una estufa y unas sillas junto a la ventana. Mi dormitorio tiene una cama y un armario. Detrás de la casa hay un patio pequeño. Mi habitación está arriba, entre el baño y el cuarto de mi hermano.',
  'mi-barrio-y-mi-ciudad': 'Hoy quiero conocer mejor mi barrio. Primero necesito ir al banco. Está a cinco minutos a pie: camino derecho y doblo a la derecha. La farmacia está al lado del banco. Después quiero visitar el parque, así que giro a la izquierda. También puedo tomar el autobús y bajar frente a la biblioteca. Con estas indicaciones encuentro fácilmente los lugares que necesito.',
  'comida-y-bebida': 'Esta mañana desayuno en una cafetería. Pido un café con leche y pan. También quiero un poco de fruta, pero no deseo una bebida fría. Para el almuerzo prefiero un vaso de agua y una ensalada. Me gusta comer ligero, así que no pido más pan. Al final agradezco al mesero y espero mi pedido. Todo parece fresco y delicioso.',
  'de-compras': 'Hoy busco una camisa azul en una tienda. Necesito talla mediana y pregunto cuánto cuesta. La camisa vale ochocientos pesos. Me la pruebo y me gusta el color, pero necesito una talla más grande. También veo la misma camisa en verde. Finalmente elijo la azul porque combina con mi ropa. Pago la compra y agradezco la ayuda de la vendedora.',
  'estudios-y-trabajo': 'Me llamo Natalia. Estudio administración en la universidad y trabajo en una tienda los fines de semana. En mi trabajo tengo que atender a los clientes y organizar los productos. Esta tarde necesito terminar un informe antes de las cuatro. Después puedo usar la computadora para revisar mis tareas. Estudiar y trabajar requiere organización, pero estoy contenta porque aprendo algo nuevo cada semana.',
  'tiempo-libre': 'Me llamo Ana y el sábado voy a salir con mi amigo Kevin. Me encanta ir al cine y prefiero una comedia a una película de acción. Después podemos comer algo. Los sábados también me gusta leer en el parque porque disfruto estar al aire libre. A veces juego al fútbol con mis amigos. Estas actividades me ayudan a descansar después de una semana ocupada.',
  'salud-y-bienestar-a1': 'Hoy no me siento bien. Me duele la cabeza y también la garganta. No tengo fiebre, pero estoy muy cansada. Por eso voy a la farmacia. Debo descansar, beber mucha agua y consultar a un médico si no mejoro. Esta tarde voy a quedarme en casa. Si mañana me siento mejor, volveré a clase. Si el dolor continúa, pediré una cita médica.',
  'planes-y-repaso': 'Este fin de semana voy a ir a la playa con mi familia. El sábado vamos a nadar y comer junto al mar. El domingo quiero descansar en casa. Si hace buen tiempo, también voy a visitar a mi abuela. En agosto voy a preparar una comida para toda mi familia. Me gustan estos planes porque puedo descansar y pasar tiempo con las personas importantes para mí.'
};

// Production revision: varied, single-voice micro-stories.  The facts and
// target language of each unit remain aligned with its Reading, vocabulary,
// grammar and listening-comprehension activities.
Object.assign(A1_LISTENING_MONOLOGUES, {
  'hola-mucho-gusto': 'Suena el timbre de la primera clase. Valentina entra al salón un poco nerviosa, pero contenta. Allí conoce a Marco. Los dos se saludan, dicen de dónde son y repiten: «Mucho gusto». Para conocerse mejor, Valentina deletrea su nombre: V-A-L-E-N-T-I-N-A. Marco hace lo mismo: M-A-R-C-O. Después entran juntos a clase.',
  'informacion-personal': 'En un formulario de la escuela aparece la información de Camila. Tiene diecinueve años, es de México y ahora vive en Santiago con su familia. Estudia español por las tardes. Su teléfono es 809-555-0199 y su correo es camila@correo.com. Le gusta conocer personas de otros países y practicar con sus compañeros. Al final del mensaje dice: «Espero conocerte pronto».',
  'mi-familia-y-mis-amigos': 'El domingo la familia de Sofía prepara un almuerzo especial. Su madre se llama Carmen y su padre, Rafael. Sofía tiene una hermana, Lucía, y un hermano, Tomás. Lucía tiene dieciséis años y Tomás tiene nueve. También vive con ellos la abuela Rosa, que es muy amable. Algunos primos son mayores que Sofía. Todos comen juntos y hablan de su semana.',
  'mi-rutina-diaria': 'Cada mañana, el reloj de Tomás suena a las seis y media. Primero desayuna, se viste y prepara su mochila. Luego camina a la escuela con su hermana. Las clases empiezan a las ocho. Después de la escuela hace la tarea y descansa un poco. Por la noche deja preparada su mochila para el día siguiente. Así casi nunca llega tarde a clase.',
  'mi-casa': 'Desde la ventana se ve el patio pequeño de la casa de Carla. La casa tiene tres habitaciones, una sala grande, una cocina y dos baños. En la sala hay un sofá y una mesa. En la cocina hay una nevera, una estufa y sillas junto a la ventana. El dormitorio de Carla tiene cama y armario. Su habitación está arriba, entre el baño y el cuarto de su hermano.',
  'mi-barrio-y-mi-ciudad': 'Un visitante quiere recorrer el barrio y pide indicaciones. Para llegar al banco debe caminar derecho y doblar a la derecha. La farmacia está al lado del banco. Más tarde quiere ir al parque: gira a la izquierda después del banco. También puede tomar el autobús y bajar frente a la biblioteca. Con estas indicaciones encuentra fácilmente los lugares importantes del barrio.',
  'comida-y-bebida': 'En la cafetería ya huele a pan recién hecho. Para el desayuno, una persona pide café con leche y pan. También quiere un poco de fruta, pero no desea una bebida fría. Para el almuerzo prefiere un vaso de agua y una ensalada. Como le gusta comer ligero, no pide más pan. Al final agradece al mesero y espera una comida fresca y deliciosa.',
  'de-compras': 'En una tienda hay camisas de muchos colores. Una clienta busca una camisa azul de talla mediana y pregunta cuánto cuesta. La camisa vale ochocientos pesos. Se la prueba y le gusta el color, pero necesita una talla más grande. También ve la misma camisa en verde. Finalmente elige la azul porque combina con su ropa, paga y agradece a la vendedora.',
  'estudios-y-trabajo': 'La tarde está ocupada para Natalia. Estudia administración en la universidad y trabaja en una tienda los fines de semana. Allí atiende a los clientes y organiza los productos. Hoy debe terminar un informe antes de las cuatro. Después puede usar la computadora para revisar sus tareas. Estudiar y trabajar requiere organización, pero Natalia aprende algo nuevo cada semana y está contenta.',
  'tiempo-libre': 'El sábado hay muchas opciones para descansar. Ana va a salir con su amigo Kevin. A ella le encanta ir al cine y prefiere una comedia a una película de acción. Después pueden comer algo. También le gusta leer en el parque porque disfruta estar al aire libre. A veces juega al fútbol con sus amigos. Estas actividades la ayudan después de una semana ocupada.',
  'salud-y-bienestar-a1': 'Esta mañana Isabel no se siente bien. Le duele la cabeza y la garganta, aunque no tiene fiebre. Está muy cansada, por eso va a la farmacia. Debe descansar, beber mucha agua y consultar a un médico si no mejora. Esta tarde se queda en casa. Si mañana se siente mejor, vuelve a clase; si el dolor continúa, pedirá una cita médica.',
  'planes-y-repaso': 'El calendario marca un fin de semana especial. Una familia va a la playa el sábado para nadar y comer junto al mar. El domingo quiere descansar en casa. Si hace buen tiempo, también visita a la abuela. En agosto prepara una comida para toda la familia. Son planes sencillos que permiten descansar y pasar tiempo con las personas importantes.'
});

// Within A1, the twelve recordings deliberately move from A1− to A1+:
// short supported statements, then linked scenes, then brief narration.
Object.assign(A1_LISTENING_MONOLOGUES, {
  'hola-mucho-gusto': 'Es el primer día de clase. Valentina entra al salón y conoce a Marco. Ella dice: «Hola, mucho gusto». Marco responde: «Mucho gusto». Valentina deletrea su nombre: V-A-L-E-N-T-I-N-A. Marco dice: M-A-R-C-O.',
  'informacion-personal': 'En la escuela hay un formulario nuevo. Camila tiene diecinueve años y es de México. Ahora vive en Santiago con su familia. Su teléfono es 809-555-0199. Por las tardes estudia español y practica con sus compañeros.',
  'mi-familia-y-mis-amigos': 'El domingo la familia de Sofía come junta. Su madre se llama Carmen y su padre, Rafael. Sofía tiene una hermana, Lucía, y un hermano, Tomás. Lucía tiene dieciséis años; Tomás tiene nueve. La abuela Rosa vive con ellos y es muy amable.',
  'mi-rutina-diaria': 'A las seis y media suena el reloj de Tomás. Desayuna, se viste y prepara su mochila antes de salir. Camina a la escuela con su hermana. Las clases empiezan a las ocho. Después hace la tarea y descansa. Por la noche prepara otra vez la mochila para no llegar tarde.',
  'mi-casa': 'La casa de Carla tiene tres habitaciones, una sala grande, una cocina y dos baños. En la sala hay un sofá y una mesa. En la cocina hay una nevera, una estufa y sillas junto a la ventana. Su dormitorio está arriba, entre el baño y el cuarto de su hermano.',
  'mi-barrio-y-mi-ciudad': 'Un visitante necesita ir al banco. Primero camina derecho y dobla a la derecha. La farmacia está al lado del banco. Después quiere visitar el parque, por eso gira a la izquierda. También puede tomar el autobús y bajar frente a la biblioteca. Con estas indicaciones puede recorrer el barrio sin perderse.',
  'comida-y-bebida': 'En una cafetería, una persona pide café con leche y pan para el desayuno. También quiere fruta, pero no desea una bebida fría. Para el almuerzo prefiere un vaso de agua y una ensalada. Como le gusta comer ligero, no pide más pan. Al final agradece al mesero y espera una comida fresca.',
  'de-compras': 'Una clienta busca una camisa azul de talla mediana. Pregunta cuánto cuesta y la vendedora responde que vale ochocientos pesos. Se la prueba, le gusta el color, pero necesita una talla más grande. También ve una camisa verde. Finalmente elige la azul porque combina con su ropa, paga la compra y agradece la ayuda.',
  'estudios-y-trabajo': 'Natalia estudia administración en la universidad y trabaja en una tienda los fines de semana. Allí atiende a los clientes y organiza los productos. Esta tarde debe terminar un informe antes de las cuatro. Después puede usar la computadora para revisar sus tareas. Estudiar y trabajar requiere organización, pero Natalia aprende algo nuevo cada semana.',
  'tiempo-libre': 'Después de una semana ocupada, Ana planea su sábado. Va a salir con su amigo Kevin y prefiere ver una comedia en el cine, no una película de acción. Después pueden comer algo. A Ana también le gusta leer en el parque porque disfruta estar al aire libre. A veces juega al fútbol con sus amigos para descansar.',
  'salud-y-bienestar-a1': 'Isabel no se siente bien esta mañana: le duele la cabeza y la garganta, aunque no tiene fiebre. Está cansada y va a la farmacia. Debe descansar, beber mucha agua y consultar a un médico si no mejora. Esta tarde se queda en casa. Si mañana se siente mejor, volverá a clase; si el dolor continúa, pedirá una cita médica.',
  'planes-y-repaso': 'El calendario anuncia un fin de semana especial. El sábado una familia va a la playa para nadar y comer junto al mar. El domingo quiere descansar en casa, pero si hace buen tiempo también visitará a la abuela. En agosto preparará una comida para todos. Son planes sencillos que combinan descanso, familia y tiempo al aire libre.'
});

for (const unit of units) {
  const transcript = A1_LISTENING_MONOLOGUES[unit.slug];
  const listening = unit.activities.listening;
  listening.transcript = transcript;
  listening.dialogue = [];
  listening.speakers = ['Narrador/a'];
  listening.listeningType = 'story';
}

// Add meaningful context for recording: the scripts remain accessible, but
// now give the learner enough information to follow a complete mini-scene.
const A1_LISTENING_CONTEXT = {
  'hola-mucho-gusto': 'Después buscan sus asientos. La profesora sonríe y escribe los nombres de los estudiantes nuevos en la pizarra.',
  'informacion-personal': 'En su clase hay personas de varios países. Camila quiere aprender expresiones útiles para hablar con todos.',
  'mi-familia-y-mis-amigos': 'Después de comer, los niños ayudan a recoger la mesa y los adultos preparan café para conversar un poco más.',
  'mi-rutina-diaria': 'Antes de dormir, Tomás revisa que tenga sus libros, un lápiz y una botella de agua para la mañana.',
  'mi-casa': 'Cuando hace buen tiempo, Carla se sienta en el patio a leer o a hablar con su familia después de cenar.',
  'mi-barrio-y-mi-ciudad': 'El visitante también pregunta dónde puede comprar agua. Le dicen que hay una tienda pequeña frente al parque.',
  'comida-y-bebida': 'Mientras espera, mira el menú y piensa que la próxima vez probará una sopa o un jugo natural.',
  'de-compras': 'Antes de salir, guarda el recibo en su cartera porque quizá necesite cambiar la camisa durante la semana.',
  'estudios-y-trabajo': 'Para no olvidar nada, Natalia apunta sus tareas en una libreta y las ordena por horario y por importancia.',
  'tiempo-libre': 'Si llueve, Ana y Kevin pueden quedarse en casa, escuchar música o elegir otra película para ver juntos.',
  'salud-y-bienestar-a1': 'Su hermana le prepara una bebida caliente y le recuerda que debe dormir temprano para recuperar fuerzas.',
  'planes-y-repaso': 'Antes de la salida, todos preparan toallas, protector solar y comida sencilla para compartir durante el día.'
};

for (const unit of units) {
  const context = A1_LISTENING_CONTEXT[unit.slug];
  if (context) unit.activities.listening.transcript += ` ${context}`;
}

const A1_LISTENING_CLOSINGS = {
  'hola-mucho-gusto': 'Al final, Valentina y Marco repiten sus nombres una vez más. Los dos están listos para empezar la clase.',
  'informacion-personal': 'Camila guarda el formulario en su mochila. Mañana quiere saludar a una compañera nueva.',
  'mi-familia-y-mis-amigos': 'La familia se despide con abrazos y risas. Sofía ayuda a su abuela a llevar unas tazas a la cocina.',
  'mi-rutina-diaria': 'Tomás pone la alarma antes de apagar la luz. Así puede comenzar el día con tranquilidad.',
  'mi-casa': 'Carla muestra su habitación a una amiga. Las dos miran unas fotos que están sobre el armario.',
  'mi-barrio-y-mi-ciudad': 'El visitante agradece mucho la ayuda. Ahora puede llegar al parque sin problema.',
  'comida-y-bebida': 'El mesero lleva el pedido a la mesa. La persona sonríe y empieza a desayunar.',
  'de-compras': 'La clienta sale contenta de la tienda. Quiere usar la camisa azul el próximo sábado.',
  'estudios-y-trabajo': 'Natalia termina el informe a tiempo. Después descansa un momento antes de continuar con sus tareas.',
  'tiempo-libre': 'Ana escribe a Kevin para confirmar el plan. Los dos esperan tener una tarde divertida.',
  'salud-y-bienestar-a1': 'Isabel apaga el teléfono y descansa. Quiere sentirse mejor para volver a ver a sus amigos.',
  'planes-y-repaso': 'La familia sonríe al pensar en el paseo. Todos colaboran para dejar las cosas preparadas.'
};

for (const unit of units) {
  const closing = A1_LISTENING_CLOSINGS[unit.slug];
  if (closing) unit.activities.listening.transcript += ` ${closing}`;
}

// A1 audio follows the situations learners need first in real conversation.
// The voices alternate between first and third person to expose conjugations
// naturally while keeping every script easy to record and understand.
const A1_LISTENING_EVERYDAY_SCRIPTS = {
  'hola-mucho-gusto': 'Hola, me llamo Valentina. Tengo diecinueve años y soy de Santo Domingo. Vivo con mi familia y estudio español por las tardes. Me gusta escuchar música y hablar con personas de otros países. Hoy es mi primer día de clase y estoy un poco nerviosa, pero muy contenta. Quiero aprender palabras nuevas y hacer amigos. Mucho gusto, espero conocerte pronto.',
  'informacion-personal': 'Este es mi compañero Marco. Tiene veinte años, es de Italia y ahora vive en Santiago. Estudia español porque quiere viajar por América Latina. Marco habla italiano e inglés, y también entiende un poco de francés. En clase se sienta cerca de mí y siempre trae una libreta azul. Es muy amable y le gusta ayudar cuando alguien tiene una pregunta.',
  'mi-familia-y-mis-amigos': 'Quiero hablar de mi mejor amigo, Kevin. Lo conozco desde la escuela y vivimos en el mismo barrio. Tiene dieciocho años, es divertido y muy tranquilo. A Kevin le gusta jugar al fútbol, ver películas y cocinar pasta los domingos. Cuando tengo un problema, él escucha con atención y me da buenos consejos. Los sábados solemos ir al parque o tomar un jugo después de clase.',
  'mi-rutina-diaria': 'Sofía vive con sus padres y sus dos hermanos. Su madre trabaja en una tienda y su padre es conductor. Su hermana Lucía tiene dieciséis años y su hermano Tomás tiene nueve. Los domingos la familia come junta en casa de la abuela Rosa. Después de comer, todos conversan y los niños juegan en el patio. Sofía dice que su familia es grande, pero muy cariñosa.',
  'mi-casa': 'Vivo en una casa pequeña, pero cómoda. Tiene dos habitaciones, una sala, una cocina y un baño. En mi habitación hay una cama, un armario y una mesa para estudiar. La sala tiene un sofá grande y unas fotos de mi familia. Detrás de la casa hay un patio con plantas. Me gusta sentarme allí por la tarde porque es tranquilo y puedo leer o escuchar música.',
  'mi-barrio-y-mi-ciudad': 'Cada día me levanto a las seis y media. Primero me ducho, desayuno y preparo mi mochila. Después camino a la escuela; las clases empiezan a las ocho. Por la tarde hago la tarea y ayudo un poco en casa. A veces veo una serie antes de cenar. Por la noche preparo mi ropa para el día siguiente y pongo la alarma. Así no tengo que correr por la mañana.',
  'comida-y-bebida': 'Un estudiante nuevo quiere llegar a la biblioteca. Primero camina derecho por esta calle y dobla a la izquierda en el banco. La biblioteca está frente al parque, al lado de una farmacia. Si necesita comprar agua, hay una tienda pequeña cerca de la entrada. El estudiante repite las indicaciones antes de salir. Después agradece la ayuda y camina con más seguridad por el barrio.',
  'de-compras': 'Hoy desayuno en una cafetería cerca de la escuela. Pido un café con leche, pan y una fruta. Para el almuerzo quiero una ensalada y un vaso de agua, porque no tengo mucha hambre. El mesero pregunta si deseo un jugo, pero prefiero agua. Mientras espero mi pedido, miro el menú y pienso que mañana voy a probar una sopa. La comida llega caliente y todo está delicioso.',
  'estudios-y-trabajo': 'Carla necesita comprar una camisa para una entrevista. En la tienda encuentra una camisa azul de talla mediana y pregunta cuánto cuesta. La vendedora dice que vale ochocientos pesos. Carla se la prueba, pero necesita una talla más grande. También ve una camisa verde, aunque prefiere la azul porque combina con sus pantalones. Al final paga con tarjeta y guarda el recibo en su cartera.',
  'tiempo-libre': 'Los sábados me gusta descansar después de una semana ocupada. A veces voy al cine con mi mejor amiga y preferimos una comedia. Si hace buen tiempo, vamos al parque y comemos algo. También me gusta leer, escuchar música y jugar al fútbol con mis amigos. Este sábado quiero ver una película nueva y después tomar un helado. Me gustan los planes sencillos porque puedo conversar y descansar.',
  'salud-y-bienestar-a1': 'Esta mañana Isabel no se siente bien. Le duele la cabeza y también la garganta, aunque no tiene fiebre. Está cansada, por eso va a la farmacia. El farmacéutico le recomienda descansar, beber mucha agua y consultar a un médico si no mejora. Isabel decide quedarse en casa esta tarde. Si mañana se siente mejor, volverá a clase; si el dolor continúa, pedirá una cita médica.',
  'planes-y-repaso': 'Este fin de semana voy a visitar la playa con mi familia. El sábado vamos a nadar, caminar junto al mar y comer algo sencillo. Mi hermano quiere jugar con una pelota y mi madre prepara unos sándwiches. El domingo pienso descansar en casa y llamar a mi abuela. Si hace buen tiempo, también voy a salir con mis amigos por la tarde. Ya estoy preparando una mochila con agua, toallas y protector solar.'
};

for (const unit of units) {
  const transcript = A1_LISTENING_EVERYDAY_SCRIPTS[unit.slug];
  if (transcript) unit.activities.listening.transcript = transcript;
}

function a1ListeningQuestion(prompt, options, answer, explanation) {
  return { type: 'mcq', prompt, options, answer, explanation };
}

// These questions are written directly from the final recording scripts
// above. The same three items feed the legacy exercise view and the scored
// Listening comprehension tab, so neither path can drift from the audio.
const A1_LISTENING_QUESTIONS = {
  'hola-mucho-gusto': [
    a1ListeningQuestion('¿Cómo se llama la persona?', ['Valentina', 'Marco', 'Sofía', 'Carla'], 0, 'La narradora dice: «Me llamo Valentina». '),
    a1ListeningQuestion('¿De dónde es Valentina?', ['De Santo Domingo', 'De Italia', 'De México', 'De Santiago'], 0, 'Valentina dice que es de Santo Domingo.'),
    a1ListeningQuestion('¿Qué quiere hacer en clase?', ['Aprender palabras y hacer amigos', 'Comprar una camisa', 'Ir a la playa', 'Trabajar en una tienda'], 0, 'Quiere aprender palabras nuevas y hacer amigos.')
  ],
  'informacion-personal': [
    a1ListeningQuestion('¿Cómo se llama el compañero?', ['Marco', 'Kevin', 'Tomás', 'Rafael'], 0, 'El texto presenta al compañero Marco.'),
    a1ListeningQuestion('¿De qué país es Marco?', ['Italia', 'México', 'España', 'República Dominicana'], 0, 'Marco es de Italia.'),
    a1ListeningQuestion('¿Por qué estudia español?', ['Porque quiere viajar por América Latina', 'Porque trabaja en una farmacia', 'Porque vive en la playa', 'Porque vende camisas'], 0, 'Estudia español para viajar por América Latina.')
  ],
  'mi-familia-y-mis-amigos': [
    a1ListeningQuestion('¿Cómo se llama el mejor amigo?', ['Kevin', 'Marco', 'Tomás', 'Rafael'], 0, 'La persona habla de su mejor amigo Kevin.'),
    a1ListeningQuestion('¿Desde cuándo conoce a Kevin?', ['Desde la escuela', 'Desde ayer', 'Desde el trabajo', 'Desde un viaje'], 0, 'Lo conoce desde la escuela.'),
    a1ListeningQuestion('¿Qué le gusta hacer a Kevin?', ['Jugar al fútbol y ver películas', 'Cocinar en una farmacia', 'Trabajar en un banco', 'Nadar cada mañana'], 0, 'A Kevin le gusta jugar al fútbol y ver películas.')
  ],
  'mi-rutina-diaria': [
    a1ListeningQuestion('¿Con quién vive Sofía?', ['Con sus padres y hermanos', 'Con Marco y Kevin', 'Con sus profesores', 'Con una amiga italiana'], 0, 'Sofía vive con sus padres y sus dos hermanos.'),
    a1ListeningQuestion('¿Qué hace la familia los domingos?', ['Come junta', 'Viaja a Valencia', 'Va al cine', 'Compra ropa'], 0, 'Los domingos la familia come junta.'),
    a1ListeningQuestion('¿Dónde juega los niños?', ['En el patio', 'En la estación', 'En la farmacia', 'En la biblioteca'], 0, 'Después de comer, los niños juegan en el patio.')
  ],
  'mi-casa': [
    a1ListeningQuestion('¿Cuántas habitaciones tiene la casa?', ['Dos', 'Una', 'Tres', 'Cuatro'], 0, 'La casa tiene dos habitaciones.'),
    a1ListeningQuestion('¿Qué hay en la habitación?', ['Una cama, un armario y una mesa', 'Un banco y una farmacia', 'Una estufa y un tren', 'Un cine y un parque'], 0, 'La habitación tiene una cama, un armario y una mesa.'),
    a1ListeningQuestion('¿Dónde se sienta la persona por la tarde?', ['En el patio', 'En el metro', 'En la tienda', 'En la escuela'], 0, 'Le gusta sentarse en el patio.')
  ],
  'mi-barrio-y-mi-ciudad': [
    a1ListeningQuestion('¿A qué hora se levanta la persona?', ['A las seis y media', 'A las ocho', 'A las diez', 'A las doce'], 0, 'La persona se levanta a las seis y media.'),
    a1ListeningQuestion('¿Cómo llega a la escuela?', ['Caminando', 'En tren', 'En avión', 'En taxi'], 0, 'Camina a la escuela.'),
    a1ListeningQuestion('¿Qué prepara por la noche?', ['La ropa y la alarma', 'Una sopa', 'Un billete', 'Una camisa'], 0, 'Por la noche prepara la ropa y pone la alarma.')
  ],
  'comida-y-bebida': [
    a1ListeningQuestion('¿Dónde está la biblioteca?', ['Frente al parque', 'Dentro de la estación', 'Detrás de la playa', 'En la escuela'], 0, 'La biblioteca está frente al parque.'),
    a1ListeningQuestion('¿Qué hay al lado de la biblioteca?', ['Una farmacia', 'Un cine', 'Una casa', 'Un mercado'], 0, 'Está al lado de una farmacia.'),
    a1ListeningQuestion('¿Qué hace el estudiante antes de salir?', ['Repite las indicaciones', 'Compra una camisa', 'Pide una sopa', 'Llama a su abuela'], 0, 'Repite las indicaciones para no perderse.')
  ],
  'de-compras': [
    a1ListeningQuestion('¿Qué pide para desayunar?', ['Café con leche, pan y fruta', 'Sopa y arroz', 'Una camisa azul', 'Un helado'], 0, 'Pide café con leche, pan y una fruta.'),
    a1ListeningQuestion('¿Qué prefiere beber en el almuerzo?', ['Agua', 'Jugo', 'Café', 'Leche'], 0, 'Prefiere un vaso de agua.'),
    a1ListeningQuestion('¿Qué quiere probar mañana?', ['Una sopa', 'Una camisa', 'Un tren', 'Una película'], 0, 'Piensa que mañana probará una sopa.')
  ],
  'estudios-y-trabajo': [
    a1ListeningQuestion('¿Qué necesita comprar Carla?', ['Una camisa', 'Un billete', 'Una mesa', 'Un libro'], 0, 'Carla necesita comprar una camisa.'),
    a1ListeningQuestion('¿Qué color elige?', ['Azul', 'Verde', 'Rojo', 'Amarillo'], 0, 'Prefiere la camisa azul.'),
    a1ListeningQuestion('¿Cómo paga la compra?', ['Con tarjeta', 'Con un cheque', 'Con un regalo', 'No paga'], 0, 'Al final paga con tarjeta.')
  ],
  'tiempo-libre': [
    a1ListeningQuestion('¿Qué tipo de película prefiere?', ['Una comedia', 'Una película de terror', 'Un documental', 'Una película de acción'], 0, 'Prefiere una comedia.'),
    a1ListeningQuestion('¿Qué hace si hace buen tiempo?', ['Va al parque', 'Se queda en la farmacia', 'Trabaja en la tienda', 'Toma el tren'], 0, 'Si hace buen tiempo, va al parque.'),
    a1ListeningQuestion('¿Qué quiere hacer este sábado?', ['Ver una película y tomar un helado', 'Comprar un apartamento', 'Preparar un examen', 'Visitar un banco'], 0, 'Quiere ver una película nueva y tomar un helado.')
  ],
  'salud-y-bienestar-a1': [
    a1ListeningQuestion('¿Qué le duele a Isabel?', ['La cabeza y la garganta', 'La mano y el pie', 'Los ojos y la espalda', 'El estómago y la pierna'], 0, 'Le duele la cabeza y la garganta.'),
    a1ListeningQuestion('¿Qué le recomienda el farmacéutico?', ['Descansar y beber agua', 'Ir al cine', 'Comprar ropa', 'Viajar a la playa'], 0, 'Le recomienda descansar y beber mucha agua.'),
    a1ListeningQuestion('¿Qué hará si el dolor continúa?', ['Pedir una cita médica', 'Ir a clase', 'Jugar al fútbol', 'Preparar una sopa'], 0, 'Si el dolor continúa, pedirá una cita médica.')
  ],
  'planes-y-repaso': [
    a1ListeningQuestion('¿Adónde va la familia el sábado?', ['A la playa', 'A la estación', 'A la farmacia', 'A la biblioteca'], 0, 'El sábado van a la playa.'),
    a1ListeningQuestion('¿Qué prepara la madre?', ['Sándwiches', 'Una camisa azul', 'Un mapa', 'Una película'], 0, 'La madre prepara unos sándwiches.'),
    a1ListeningQuestion('¿Qué lleva la persona en la mochila?', ['Agua, toallas y protector solar', 'Libros y una computadora', 'Arroz y tomates', 'Un tren y un billete'], 0, 'Prepara una mochila con agua, toallas y protector solar.')
  ]
};

for (const unit of units) {
  const questions = A1_LISTENING_QUESTIONS[unit.slug];
  if (!questions) continue;
  const listening = unit.activities.listening;
  listening.exercises = questions;
  listening.listeningComprehension = {
    id: `spanish-a1-${unit.slug}-listening-comprehension`,
    passingScore: 70,
    questions: questions.map((question, index) => ({
      id: `q${index + 1}`,
      type: 'mcq',
      prompt: question.prompt,
      options: question.options.map((text, optionIndex) => ({ id: `o${optionIndex + 1}`, text })),
      correctOptionId: `o${question.answer + 1}`,
      explanation: question.explanation
    }))
  };
}

// The routed A1 experience evaluates four focused questions per skill.
// The first legacy unit carried an older six-question pilot and an expanded
// Reading bank, so normalize it with the rest of the course.
const A1_FIRST_UNIT = units[0];
A1_FIRST_UNIT.activities.reading.exercises = A1_FIRST_UNIT.activities.reading.exercises.slice(0, 4);

for (const unit of units) {
  unit.activities.reading.exercises = unit.activities.reading.exercises.slice(0, 4);
  unit.activities.reading.exercises.forEach((question, questionIndex) => {
    const targetIndex = questionIndex % 4;
    if (question.answer === targetIndex) return;
    const options = [...question.options];
    const [correctOption] = options.splice(question.answer, 1);
    options.splice(targetIndex, 0, correctOption);
    question.options = options;
    question.answer = targetIndex;
  });
  unit.activities.reading.reading.questions = unit.activities.reading.exercises.map(
    (question) => question.prompt
  );
}

module.exports = { units, language, level, courseTitle, courseDescription };
