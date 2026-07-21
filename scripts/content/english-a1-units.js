// scripts/content/english-a1-units.js
// Hand-authored English A1 content: 12 thematic units, 6 real activities
// each (reading/listening/speaking/writing/grammar/vocabulary) - one per
// skill per unit, not a single generic "Quest/Lab/Mission" card per skill.
// Everything the learner sees (titles, texts, dialogue, exercises) is in
// English; Spanish only appears in vocabulary/dialogue `translation` fields
// and each unit's `titleEs`, both optional-support fields the frontend
// already renders hidden-by-default (see resolveVocabTranslation()).
//
// Consumed by scripts/build-english-a1-seed.js, which flattens this into
// lib/seed-lessons.json (72 rows) + lib/seed-units.json (12 rows).

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
  // ---------------------------------------------------------------
  {
    slug: 'hello',
    title: 'Hello!',
    titleEs: '¡Hola!',
    description: 'Greetings, introductions and the alphabet.',
    order: 1,
    unitOverview: {
      objective: 'Presentarte, saludar y conocer a otras personas.',
      outcomes: [
        'decir tu nombre',
        'preguntar el nombre de otra persona',
        'usar saludos formales e informales',
        'deletrear información básica'
      ],
      grammar: ['verb to be', 'subject pronouns', 'basic questions'],
      vocabulary: ['greetings', 'names', 'classroom expressions', 'numbers 0–20'],
      scenario: 'Tu primer día en una clase de inglés.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Hello, Class!',
        description: 'A short text about a student\'s first day of English class, in three parts.',
        reading: {
          title: 'Hello, Class!',
          illustration: {
            src: '/assets/readings/english/a1/hello-class.webp',
            alt: 'Ana meets her new classmates on the first day of English class'
          },
          parts: [
            'Hello! My name is Ana. Today is my first English class. I am a little nervous, but also excited. My teacher is Mr. Green. He says, "Good morning, class!" and we answer, "Good morning, Mr. Green!" He has a big smile and a friendly voice.',
            'I sit next to a boy named Leo. "Hi, I\'m Leo," he says. "Nice to meet you," I answer. We shake hands and smile. Leo is from Italy, and this is his first day too. We both feel happy to have a new friend.',
            'Mr. Green asks us to say our names and spell them with the alphabet. I spell my name: A-N-A. Leo spells his name too: L-E-O. It is a good first day. I already have one new friend, and I want to learn more English words tomorrow.'
          ],
          questions: [
            'What is the girl\'s name?',
            'Who is the teacher?',
            'What does the class say to Mr. Green?'
          ],
          ordering: {
            prompt: 'Put the events of the story in order.',
            events: [
              'Ana arrives at her first English class.',
              'Mr. Green says good morning to the class.',
              'Ana meets Leo and they introduce themselves.',
              'Ana and Leo spell their names with the alphabet.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Who is the teacher?', options: ['Mr. Green', 'Mr. Leo', 'Mr. Ana', 'Mr. Class'], answer: 0 },
          { type: 'mcq', prompt: 'Who does Ana sit next to?', options: ['Mr. Green', 'Leo', 'Sofia', 'Marco'], answer: 1 },
          { type: 'mcq', prompt: 'Where is Leo from?', options: ['Spain', 'Italy', 'France', 'Dominican Republic'], answer: 1 },
          { type: 'mcq', prompt: 'What do they practice at the end?', options: ['Numbers', 'Spelling their names with the alphabet', 'Colors', 'Drawing'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: Ana is a little nervous on her first day.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'True or false: Leo is Ana\'s teacher.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: Ana and Leo shake hands.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'Choose the best word: Mr. Green has a big smile and a very ___ voice.', options: ['angry', 'friendly', 'sad', 'tired'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Nice to Meet You',
        description: 'Listen to two students meeting for the first time.',
        intro: 'Listen to Ana and Leo meeting on the first day of class. Focus on how they say hello and introduce themselves.',
        dialogue: [
          { speaker: 'Ana', line: 'Hello! My name is Ana. What\'s your name?', translation: 'Hola, me llamo Ana. ¿Cómo te llamas?' },
          { speaker: 'Leo', line: 'Hi, Ana! I\'m Leo. Nice to meet you.', translation: 'Hola, Ana. Soy Leo. Mucho gusto.' },
          { speaker: 'Ana', line: 'Nice to meet you too. How are you?', translation: 'Igualmente. ¿Cómo estás?' },
          { speaker: 'Leo', line: 'I\'m fine, thanks. And you?', translation: 'Estoy bien, gracias. ¿Y tú?' },
          { speaker: 'Ana', line: 'Good morning! I mean... I\'m fine too!', translation: '¡Buenos días! Digo... ¡yo también estoy bien!' },
          { speaker: 'Leo', line: 'See you later, Ana!', translation: '¡Hasta luego, Ana!' }
        ],
        phrases: ['What\'s your name?', 'Nice to meet you.', 'How are you?', 'See you later!'],
        exercises: [
          { type: 'mcq', prompt: 'What does Leo say when he meets Ana?', options: ['Goodbye', 'Nice to meet you', 'What time is it?', 'I am hungry'], answer: 1 },
          { type: 'mcq', prompt: 'How does Ana say goodbye at the end?', options: ['Good morning', 'Hello', 'See you later', 'Thank you'], answer: 2 },
          { type: 'mcq', prompt: 'What does Leo answer to "How are you?"', options: ['I\'m Leo', 'I\'m fine, thanks', 'Nice to meet you', 'What\'s your name?'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Say Hello',
        description: 'Practice greeting someone and introducing yourself out loud.',
        mission: 'Say hello to a partner, introduce yourself with your name, and ask how they are.',
        phrases: ['Hello! / Hi!', 'My name is...', 'Nice to meet you.', 'How are you?', 'I\'m fine, thank you.'],
        dialogue: [
          { speaker: 'You', line: 'Hello! My name is...', translation: 'Hola, me llamo...' },
          { speaker: 'Partner', line: 'Hi! I\'m... Nice to meet you.', translation: 'Hola, soy... Mucho gusto.' },
          { speaker: 'You', line: 'Nice to meet you too. How are you?', translation: 'Igualmente. ¿Cómo estás?' },
          { speaker: 'Partner', line: 'I\'m fine, thank you. And you?', translation: 'Estoy bien, gracias. ¿Y tú?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say out loud: "Hello, my name is..." and finish the sentence with your own name.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the greeting dialogue with a partner, then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Write Your Introduction',
        description: 'Write three simple sentences introducing yourself.',
        mission: 'Write 3 sentences: your name, how you are today, and one thing you say hello with (e.g. a friend\'s name).',
        phrases: ['My name is...', 'I am fine.', 'Hello,...!'],
        dialogue: [{ speaker: 'Model', line: 'My name is Ana. I am fine today. Hello, Leo!', translation: 'Me llamo Ana. Estoy bien hoy. ¡Hola, Leo!' }],
        exercises: [
          { type: 'writing', prompt: 'Write 3 short sentences to introduce yourself, using "My name is...", "I am...", and "Hello, ...!"', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'The Verb "To Be": am / is / are',
        description: 'Learn how to use am, is and are with I, you, he/she/it, we, they.',
        grammarNote:
          'Goal: use the correct form of the verb "to be" (am / is / are) with every subject pronoun.\n\n' +
          'Rule: "to be" is the most important verb in English. It changes depending on the subject: I am, you are, he/she/it is, we are, they are. We use it to say names, feelings, ages, jobs and where people are from.\n\n' +
          'Pattern: Subject + am/is/are + (a/an) + noun or adjective.\nI / am\nYou, We, They / are\nHe, She, It / is\n\n' +
          'Examples:\n1. I am Ana.\n2. You are my friend.\n3. He is the teacher.\n4. She is happy.\n5. It is a big school.\n6. We are students.\n7. They are from the Dominican Republic.\n8. My name is Leo.\n\n' +
          'Affirmative: Subject + am/is/are + rest of the sentence. Example: "She is my teacher."\n\n' +
          'Negative: add "not" right after am/is/are. Example: "I am not tired." "They are not late." "He is not my brother."\n\n' +
          'Questions: put am/is/are before the subject. Example: "Are you a student?" "Is she your teacher?" "Am I right?"\n\n' +
          'Contractions: I\'m = I am. You\'re = you are. He\'s = he is. She\'s = she is. It\'s = it is. We\'re = we are. They\'re = they are. Negative contractions: isn\'t = is not, aren\'t = are not.\n\n' +
          'Common mistakes: ✗ "I is a student" → ✓ "I am a student". ✗ "She are my friend" → ✓ "She is my friend". ✗ "They is happy" → ✓ "They are happy". Remember: never use "be" alone in a sentence (✗ "I be tired").\n\n' +
          'Compare: use "is" only with he/she/it (one person or thing); use "are" with you/we/they (more than one, or when talking directly to someone); use "am" only with "I".\n\n' +
          'Mini practice: say these out loud and check the verb. "My mother ___ a nurse." (is) "My parents ___ from Santiago." (are) "I ___ ready." (am)\n\n' +
          'Summary: am goes with I; is goes with he/she/it; are goes with you/we/they. Add "not" for negatives, and move the verb before the subject for questions.',
        phrases: ['I am...', 'You are...', 'He/She is...', 'We are...', 'They are...'],
        exercises: [
          { type: 'mcq', prompt: 'I ___ a student.', options: ['am', 'is', 'are', 'be'], answer: 0 },
          { type: 'mcq', prompt: 'She ___ my teacher.', options: ['am', 'is', 'are', 'be'], answer: 1 },
          { type: 'mcq', prompt: 'They ___ my classmates.', options: ['am', 'is', 'are', 'be'], answer: 2 },
          { type: 'mcq', prompt: 'You ___ very kind.', options: ['am', 'is', 'are', 'be'], answer: 2 }
        ],
        // Scored Grammar test (see lib/grammarTestSanitizer.js) - a richer,
        // multiple-choice-only companion to the inline `exercises` above,
        // which stay as-is for the old immediate-feedback view. Never
        // include this data unsanitized anywhere client-facing.
        grammarTest: {
          id: 'english-a1-hello-grammar-test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: 'I ___ a student.',
              options: [
                { id: 'o1', text: 'am' },
                { id: 'o2', text: 'is' },
                { id: 'o3', text: 'are' },
                { id: 'o4', text: 'be' }
              ],
              correctOptionId: 'o1',
              explanation: 'With "I", the verb "to be" is always "am".',
              difficulty: 'easy'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: 'She ___ my teacher.',
              options: [
                { id: 'o1', text: 'are' },
                { id: 'o2', text: 'is' },
                { id: 'o3', text: 'am' },
                { id: 'o4', text: 'be' }
              ],
              correctOptionId: 'o2',
              explanation: 'With "he/she/it", the verb "to be" is "is".',
              difficulty: 'easy'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: 'They ___ my classmates.',
              options: [
                { id: 'o1', text: 'am' },
                { id: 'o2', text: 'is' },
                { id: 'o3', text: 'are' },
                { id: 'o4', text: 'be' }
              ],
              correctOptionId: 'o3',
              explanation: 'With "they", the verb "to be" is "are".',
              difficulty: 'easy'
            },
            {
              id: 'q4',
              type: 'mcq',
              prompt: 'Choose the correct sentence.',
              options: [
                { id: 'o1', text: 'You is very kind.' },
                { id: 'o2', text: 'You am very kind.' },
                { id: 'o3', text: 'You are very kind.' },
                { id: 'o4', text: 'You be very kind.' }
              ],
              correctOptionId: 'o3',
              explanation: 'With "you", the verb "to be" is "are": "You are very kind."',
              difficulty: 'easy'
            },
            {
              id: 'q5',
              type: 'mcq',
              prompt: 'My name ___ Ana.',
              options: [
                { id: 'o1', text: 'are' },
                { id: 'o2', text: 'am' },
                { id: 'o3', text: 'be' },
                { id: 'o4', text: 'is' }
              ],
              correctOptionId: 'o4',
              explanation: '"My name" is he/she/it, so the verb is "is".',
              difficulty: 'medium'
            },
            {
              id: 'q6',
              type: 'mcq',
              prompt: 'We ___ from Santo Domingo.',
              options: [
                { id: 'o1', text: 'is' },
                { id: 'o2', text: 'am' },
                { id: 'o3', text: 'are' },
                { id: 'o4', text: 'be' }
              ],
              correctOptionId: 'o3',
              explanation: 'With "we", the verb "to be" is "are".',
              difficulty: 'medium'
            },
            {
              id: 'q7',
              type: 'mcq',
              prompt: 'Find the mistake: "He are my friend."',
              options: [
                { id: 'o1', text: 'The subject is wrong' },
                { id: 'o2', text: '"are" should be "is"' },
                { id: 'o3', text: '"friend" should be "friends"' },
                { id: 'o4', text: 'There is no mistake' }
              ],
              correctOptionId: 'o2',
              explanation: '"He" is he/she/it, so the sentence should be "He is my friend."',
              difficulty: 'medium'
            },
            {
              id: 'q8',
              type: 'mcq',
              prompt: 'I ___ happy today. (negative)',
              options: [
                { id: 'o1', text: "isn't" },
                { id: 'o2', text: 'am not' },
                { id: 'o3', text: "aren't" },
                { id: 'o4', text: 'not am' }
              ],
              correctOptionId: 'o2',
              explanation: 'The negative of "I am" is "I am not" - there is no contraction "amn\'t" used here.',
              difficulty: 'medium'
            },
            {
              id: 'q9',
              type: 'mcq',
              prompt: 'Which question is correct?',
              options: [
                { id: 'o1', text: 'You are a student?' },
                { id: 'o2', text: 'Are you a student?' },
                { id: 'o3', text: 'Is you a student?' },
                { id: 'o4', text: 'Am you a student?' }
              ],
              correctOptionId: 'o2',
              explanation: 'Questions with "to be" put the verb before the subject: "Are you...?"',
              difficulty: 'medium'
            },
            {
              id: 'q10',
              type: 'mcq',
              prompt: 'Choose the correct order.',
              options: [
                { id: 'o1', text: 'Is my teacher she.' },
                { id: 'o2', text: 'My teacher is she.' },
                { id: 'o3', text: 'She is my teacher.' },
                { id: 'o4', text: 'She my teacher is.' }
              ],
              correctOptionId: 'o3',
              explanation: 'Subject + verb "to be" + rest of the sentence: "She is my teacher."',
              difficulty: 'medium'
            },
            {
              id: 'q11',
              type: 'mcq',
              prompt: 'What is the short form (contraction) of "they are"?',
              options: [
                { id: 'o1', text: "they's" },
                { id: 'o2', text: "they'r" },
                { id: 'o3', text: "they're" },
                { id: 'o4', text: "their" }
              ],
              correctOptionId: 'o3',
              explanation: '"They are" contracts to "they\'re".',
              difficulty: 'hard'
            },
            {
              id: 'q12',
              type: 'mcq',
              prompt: 'A: "___ he your brother?" B: "Yes, he is."',
              options: [
                { id: 'o1', text: 'Are' },
                { id: 'o2', text: 'Am' },
                { id: 'o3', text: 'Do' },
                { id: 'o4', text: 'Is' }
              ],
              correctOptionId: 'o4',
              explanation: 'The answer uses "he is", so the question must use "Is he...?"',
              difficulty: 'hard'
            }
          ]
        }
      }),
      vocabulary: activity('vocabulary', {
        title: 'Greeting Words',
        description: 'Key words for saying hello and introducing yourself.',
        vocabulary: [
          { word: 'Hello', translation: 'Hola', example: 'Hello, my name is Ana.' },
          { word: 'Good morning', translation: 'Buenos días', example: 'Good morning, class!' },
          { word: 'Name', translation: 'Nombre', example: 'My name is Leo.' },
          { word: 'Teacher', translation: 'Profesor/a', example: 'My teacher is Mr. Green.' },
          { word: 'Friend', translation: 'Amigo/a', example: 'Leo is my friend.' },
          { word: 'Nice to meet you', translation: 'Mucho gusto', example: 'Nice to meet you, Ana.' },
          { word: 'Goodbye', translation: 'Adiós', example: 'Goodbye, see you tomorrow.' },
          { word: 'Please', translation: 'Por favor', example: 'Repeat that, please.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "Hello" mean?', options: ['Hola', 'Adiós', 'Gracias', 'Nombre'], answer: 0 },
          { type: 'mcq', prompt: 'What does "Nice to meet you" mean?', options: ['Buenos días', 'Mucho gusto', 'Por favor', 'Amigo'], answer: 1 },
          { type: 'mcq', prompt: 'What does "Teacher" mean?', options: ['Amigo/a', 'Nombre', 'Profesor/a', 'Adiós'], answer: 2 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'about-me',
    title: 'About Me',
    titleEs: 'Sobre mí',
    description: 'Name, age, nationality and feelings.',
    order: 2,
    activities: {
      reading: activity('reading', {
        title: 'My Profile',
        description: 'A short profile text about a student from the Dominican Republic, in three parts.',
        reading: {
          title: 'My Profile',
          parts: [
            'My name is Marco. I am twelve years old. I am from the Dominican Republic, and I live in Santo Domingo. My city is big and colorful, with many parks and friendly people. I go to a school near my house with my sister.',
            'Today is a special day for me: it is my birthday! I am very happy today. I am not tired, and I am not sad at all. My friends say "Happy birthday!" to me at school, and I feel very lucky.',
            'I am a student, and I am also a good friend. I like to help my classmates with their homework. My favorite color is blue, like the sky. Tonight, my family is going to have a small party for my birthday.'
          ],
          questions: [
            'How old is Marco?',
            'Where is Marco from?',
            'Why is Marco happy today?'
          ],
          ordering: {
            prompt: 'Put the events of the story in order.',
            events: [
              'Marco wakes up on his birthday.',
              'His friends say "Happy birthday" at school.',
              'Marco helps a classmate with homework.',
              'Marco\'s family has a small party.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'How old is Marco?', options: ['Ten', 'Eleven', 'Twelve', 'Thirteen'], answer: 2 },
          { type: 'mcq', prompt: 'Where does Marco live?', options: ['Santo Domingo', 'Madrid', 'New York', 'Santiago'], answer: 0 },
          { type: 'mcq', prompt: 'Why is Marco happy?', options: ['It is his birthday', 'He has a new friend', 'He is on vacation', 'He got a good grade'], answer: 0 },
          { type: 'mcq', prompt: 'Who does Marco help at school?', options: ['His teacher', 'His classmates', 'His sister', 'Mr. Green'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: Marco is tired today.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: Marco\'s favorite color is blue.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'True or false: Marco\'s family is having a party tonight.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'Choose the best word: My city is big and ___, with many parks.', options: ['colorful', 'boring', 'empty', 'cold'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Where Are You From?',
        description: 'Listen to two students talking about their age and country.',
        intro: 'Listen to Sofia and Leo talking about where they are from and how old they are.',
        dialogue: [
          { speaker: 'Sofia', line: 'Where are you from, Leo?', translation: '¿De dónde eres, Leo?' },
          { speaker: 'Leo', line: 'I am from Italy. And you?', translation: 'Soy de Italia. ¿Y tú?' },
          { speaker: 'Sofia', line: 'I am from the Dominican Republic. How old are you?', translation: 'Soy de República Dominicana. ¿Cuántos años tienes?' },
          { speaker: 'Leo', line: 'I am twelve years old. What about you?', translation: 'Tengo doce años. ¿Y tú?' },
          { speaker: 'Sofia', line: 'I am eleven. Are you happy at this school?', translation: 'Tengo once. ¿Estás feliz en esta escuela?' },
          { speaker: 'Leo', line: 'Yes, I am very happy here!', translation: 'Sí, ¡estoy muy feliz aquí!' }
        ],
        phrases: ['Where are you from?', 'I am from...', 'How old are you?', 'I am ... years old.'],
        exercises: [
          { type: 'mcq', prompt: 'Where is Leo from?', options: ['Spain', 'Italy', 'Dominican Republic', 'France'], answer: 1 },
          { type: 'mcq', prompt: 'How old is Sofia?', options: ['Ten', 'Eleven', 'Twelve', 'Thirteen'], answer: 1 },
          { type: 'mcq', prompt: 'Is Leo happy at the school?', options: ['Yes', 'No', 'He doesn\'t say', 'A little sad'], answer: 0 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Talk About Yourself',
        description: 'Practice saying your age, country and how you feel today.',
        mission: 'Tell a partner your name, your age, where you are from, and how you feel today.',
        phrases: ['I am ... years old.', 'I am from...', 'Today I am happy/tired/fine.', 'Are you...?'],
        dialogue: [
          { speaker: 'You', line: 'I am ... years old and I am from...', translation: 'Tengo ... años y soy de...' },
          { speaker: 'Partner', line: 'Nice! How do you feel today?', translation: '¡Qué bien! ¿Cómo te sientes hoy?' },
          { speaker: 'You', line: 'Today I am happy because...', translation: 'Hoy estoy feliz porque...' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say out loud: your age, your country, and one feeling you have today.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Ask a partner "How old are you?" and "Where are you from?" and answer their questions too.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Write a Mini Profile',
        description: 'Write four sentences about yourself: name, age, country, feeling.',
        mission: 'Write 4 sentences about yourself using "My name is...", "I am ... years old", "I am from...", and "Today I am...".',
        phrases: ['My name is...', 'I am ... years old.', 'I am from...', 'Today I am...'],
        dialogue: [{ speaker: 'Model', line: 'My name is Marco. I am twelve years old. I am from the Dominican Republic. Today I am happy.', translation: 'Me llamo Marco. Tengo doce años. Soy de República Dominicana. Hoy estoy feliz.' }],
        exercises: [
          { type: 'writing', prompt: 'Write a 4-sentence mini profile about yourself (name, age, country, feeling today).', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'To Be: Negative and Questions',
        description: 'Learn "I am not...", "Is he...?" and possessive adjectives my/your.',
        grammarNote:
          'Goal: make negative sentences and questions with "to be", and use "my"/"your" to talk about people.\n\n' +
          'Rule: to make "to be" negative, add "not" right after am/is/are. To ask a question, move the verb before the subject. "My" and "your" go before a noun to show who it belongs to.\n\n' +
          'Pattern: Negative → Subject + am/is/are + not + rest. Question → Am/Is/Are + subject + rest?\n\n' +
          'Examples:\n1. I am not tired.\n2. She is not sad.\n3. They are not from Spain.\n4. Are you happy?\n5. Is he your brother?\n6. Am I late?\n7. What is your name?\n8. My name is Ana.\n\n' +
          'Affirmative reminder: "I am fine. My name is Leo." (see the previous lesson for the full affirmative forms).\n\n' +
          'Negative: I am not / you are not / he is not / she is not / it is not / we are not / they are not. Example: "He is not my teacher."\n\n' +
          'Questions: Am I...? / Are you...? / Is he/she/it...? / Are we/they...? Example: "Is she from Italy?" Answer short: "Yes, she is." / "No, she isn\'t."\n\n' +
          'Contractions: I\'m not, you\'re not / you aren\'t, he\'s not / he isn\'t, she\'s not / she isn\'t, they\'re not / they aren\'t.\n\n' +
          'Common mistakes: ✗ "She not is sad" → ✓ "She is not sad" (not goes after the verb, not before). ✗ "You is happy?" → ✓ "Are you happy?" ✗ "What is you name?" → ✓ "What is your name?" (your, not you, before a noun).\n\n' +
          'Compare: "my" = belongs to me (my name); "your" = belongs to you (your country). Both come before a noun, never alone.\n\n' +
          'Mini practice: make these negative and then a question. "He is tired." → "He is not tired." → "Is he tired?"\n\n' +
          'Summary: add "not" after am/is/are for negatives; move am/is/are before the subject for questions; use my/your before a noun to show possession.',
        phrases: ['I am not...', 'Are you...?', 'Is he/she...?', 'my name / your name'],
        exercises: [
          { type: 'mcq', prompt: 'I ___ tired today. (negative)', options: ['am not', 'not am', 'isn\'t', 'aren\'t'], answer: 0 },
          { type: 'mcq', prompt: '___ you from Italy?', options: ['Is', 'Am', 'Are', 'Be'], answer: 2 },
          { type: 'mcq', prompt: '___ she happy today?', options: ['Are', 'Is', 'Am', 'Do'], answer: 1 },
          { type: 'mcq', prompt: 'What is ___ name? (talking to a friend)', options: ['my', 'your', 'he', 'is'], answer: 1 }
        ],
        grammarTest: {
          id: 'english-a1-about-me-grammar-test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: 'I ___ tired today. (negative)',
              options: [
                { id: 'o1', text: 'am not' },
                { id: 'o2', text: 'not am' },
                { id: 'o3', text: "isn't" },
                { id: 'o4', text: "aren't" }
              ],
              correctOptionId: 'o1',
              explanation: 'With "I", the negative form is "am not".',
              difficulty: 'easy'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: '___ you from Italy?',
              options: [
                { id: 'o1', text: 'Is' },
                { id: 'o2', text: 'Am' },
                { id: 'o3', text: 'Are' },
                { id: 'o4', text: 'Be' }
              ],
              correctOptionId: 'o3',
              explanation: 'With "you", questions use "Are".',
              difficulty: 'easy'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: '___ she happy today?',
              options: [
                { id: 'o1', text: 'Are' },
                { id: 'o2', text: 'Is' },
                { id: 'o3', text: 'Am' },
                { id: 'o4', text: 'Do' }
              ],
              correctOptionId: 'o2',
              explanation: 'With "she", questions use "Is".',
              difficulty: 'easy'
            },
            {
              id: 'q4',
              type: 'mcq',
              prompt: 'What is ___ name? (talking to a friend)',
              options: [
                { id: 'o1', text: 'is' },
                { id: 'o2', text: 'my' },
                { id: 'o3', text: 'he' },
                { id: 'o4', text: 'your' }
              ],
              correctOptionId: 'o4',
              explanation: 'Talking to a friend, we ask about "your" name.',
              difficulty: 'easy'
            },
            {
              id: 'q5',
              type: 'mcq',
              prompt: 'Choose the correct sentence.',
              options: [
                { id: 'o1', text: 'She not is sad.' },
                { id: 'o2', text: 'She is not sad.' },
                { id: 'o3', text: 'Not she is sad.' },
                { id: 'o4', text: 'She isn\'t not sad.' }
              ],
              correctOptionId: 'o2',
              explanation: '"Not" goes right after the verb "to be": "She is not sad."',
              difficulty: 'medium'
            },
            {
              id: 'q6',
              type: 'mcq',
              prompt: 'Find the mistake: "You is happy?"',
              options: [
                { id: 'o1', text: 'There is no mistake' },
                { id: 'o2', text: '"happy" should be "happier"' },
                { id: 'o3', text: 'It should be "Are you happy?"' },
                { id: 'o4', text: 'It should be "You are happy."' }
              ],
              correctOptionId: 'o3',
              explanation: 'Questions with "you" need "Are" before the subject: "Are you happy?"',
              difficulty: 'medium'
            },
            {
              id: 'q7',
              type: 'mcq',
              prompt: 'He ___ my brother. (negative)',
              options: [
                { id: 'o1', text: "aren't" },
                { id: 'o2', text: 'is not' },
                { id: 'o3', text: 'not is' },
                { id: 'o4', text: 'am not' },
              ],
              correctOptionId: 'o2',
              explanation: 'With "he", the negative form is "is not" (or "isn\'t").',
              difficulty: 'medium'
            },
            {
              id: 'q8',
              type: 'mcq',
              prompt: 'What is the short form of "is not"?',
              options: [
                { id: 'o1', text: "aren't" },
                { id: 'o2', text: "amn't" },
                { id: 'o3', text: "not's" },
                { id: 'o4', text: "isn't" }
              ],
              correctOptionId: 'o4',
              explanation: '"is not" contracts to "isn\'t".',
              difficulty: 'medium'
            },
            {
              id: 'q9',
              type: 'mcq',
              prompt: 'A: "Is she your teacher?" B: "No, ___."',
              options: [
                { id: 'o1', text: "she's" },
                { id: 'o2', text: 'she isn\'t' },
                { id: 'o3', text: 'she aren\'t' },
                { id: 'o4', text: 'she not' }
              ],
              correctOptionId: 'o2',
              explanation: 'A short negative answer with "she" is "she isn\'t".',
              difficulty: 'medium'
            },
            {
              id: 'q10',
              type: 'mcq',
              prompt: 'Complete the dialogue: A: "___ your name?" B: "My name is Leo."',
              options: [
                { id: 'o1', text: 'Who is' },
                { id: 'o2', text: 'What is' },
                { id: 'o3', text: 'Are you' },
                { id: 'o4', text: 'Is your' }
              ],
              correctOptionId: 'o2',
              explanation: 'We ask for a name with "What is your name?"',
              difficulty: 'medium'
            },
            {
              id: 'q11',
              type: 'mcq',
              prompt: 'Choose the equivalent sentence to "He is not from Spain."',
              options: [
                { id: 'o1', text: 'He isn\'t from Spain.' },
                { id: 'o2', text: 'He aren\'t from Spain.' },
                { id: 'o3', text: 'He not from Spain.' },
                { id: 'o4', text: 'Isn\'t he from Spain.' }
              ],
              correctOptionId: 'o1',
              explanation: '"He is not..." and "He isn\'t..." mean exactly the same.',
              difficulty: 'hard'
            },
            {
              id: 'q12',
              type: 'mcq',
              prompt: 'A: "Are your parents doctors?" B: "Yes, ___."',
              options: [
                { id: 'o1', text: "they're" },
                { id: 'o2', text: 'they are' },
                { id: 'o3', text: 'they is' },
                { id: 'o4', text: 'they am' }
              ],
              correctOptionId: 'o2',
              explanation: 'Short affirmative answers do not use a contraction: "Yes, they are."',
              difficulty: 'hard'
            }
          ]
        }
      }),
      vocabulary: activity('vocabulary', {
        title: 'Feelings and Countries',
        description: 'Words to describe age, countries and feelings.',
        vocabulary: [
          { word: 'Happy', translation: 'Feliz', example: 'I am happy today.' },
          { word: 'Sad', translation: 'Triste', example: 'She is a little sad.' },
          { word: 'Tired', translation: 'Cansado/a', example: 'I am not tired.' },
          { word: 'Country', translation: 'País', example: 'What country are you from?' },
          { word: 'Age', translation: 'Edad', example: 'What is your age?' },
          { word: 'Years old', translation: 'Años (de edad)', example: 'I am eleven years old.' },
          { word: 'Fine', translation: 'Bien', example: 'I am fine, thank you.' },
          { word: 'Student', translation: 'Estudiante', example: 'I am a student.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "Happy" mean?', options: ['Triste', 'Feliz', 'Cansado', 'País'], answer: 1 },
          { type: 'mcq', prompt: 'What does "Tired" mean?', options: ['Cansado/a', 'Feliz', 'Edad', 'Bien'], answer: 0 },
          { type: 'mcq', prompt: 'What does "Country" mean?', options: ['Estudiante', 'Edad', 'País', 'Triste'], answer: 2 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'family-and-friends',
    title: 'My Family and Friends',
    titleEs: 'Mi familia y amigos',
    description: 'Family members, possessive \'s, and describing people.',
    order: 3,
    activities: {
      reading: activity('reading', {
        title: 'My Family',
        description: 'A short text about Ana\'s family members, in three parts.',
        reading: {
          title: 'My Family',
          parts: [
            'This is my family. My mother\'s name is Carmen, and my father\'s name is Julio. My parents work near our house, and they always have dinner with us. We live in a small house with a big garden.',
            'I have one sister and one brother. My sister\'s name is Sofia; she is sixteen years old, and she loves music. My brother\'s name is Marco; he is nine, and he loves soccer. We play together every weekend.',
            'My grandmother lives with us too. Her name is Rosa, and she is very kind. She cooks delicious food for the family. On Sundays, we all eat lunch together and talk about our week. We are a happy family.'
          ],
          questions: [
            'What is the mother\'s name?',
            'How many brothers and sisters does the writer have?',
            'Who lives with the family besides the parents?'
          ],
          ordering: {
            prompt: 'Put the events of the story in order.',
            events: [
              'Carmen and Julio have dinner with the family.',
              'Sofia and Marco play together on the weekend.',
              'Rosa cooks lunch on Sunday.',
              'The family eats lunch together and talks.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'What is the father\'s name?', options: ['Marco', 'Julio', 'Rosa', 'Sofia'], answer: 1 },
          { type: 'mcq', prompt: 'How old is the sister?', options: ['Nine', 'Twelve', 'Sixteen', 'Twenty'], answer: 2 },
          { type: 'mcq', prompt: 'Who is Rosa?', options: ['The mother', 'The sister', 'The grandmother', 'A friend'], answer: 2 },
          { type: 'mcq', prompt: 'What does Marco love?', options: ['Music', 'Soccer', 'Cooking', 'Reading'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: Sofia loves music.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'True or false: The family lives in a big city apartment.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: Rosa cooks for the family.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'Choose the best word: Rosa is very ___; she cooks delicious food for us.', options: ['kind', 'angry', 'lazy', 'sad'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'This Is My Brother',
        description: 'Listen to Ana introducing her brother to a friend.',
        intro: 'Listen to Ana showing a photo of her family to her friend Leo and introducing her brother.',
        dialogue: [
          { speaker: 'Leo', line: 'Is this your family, Ana?', translation: '¿Esta es tu familia, Ana?' },
          { speaker: 'Ana', line: 'Yes! This is my mother and this is my father.', translation: 'Sí, esta es mi madre y este es mi padre.' },
          { speaker: 'Leo', line: 'And who is this boy?', translation: '¿Y quién es este niño?' },
          { speaker: 'Ana', line: 'That\'s my brother, Marco. He is nine years old.', translation: 'Ese es mi hermano, Marco. Tiene nueve años.' },
          { speaker: 'Leo', line: 'Do you have a sister too?', translation: '¿También tienes una hermana?' },
          { speaker: 'Ana', line: 'Yes, my sister\'s name is Sofia.', translation: 'Sí, mi hermana se llama Sofia.' }
        ],
        phrases: ['This is my...', 'Who is this?', 'Do you have a...?', 'My brother/sister is...'],
        exercises: [
          { type: 'mcq', prompt: 'What is the brother\'s name?', options: ['Leo', 'Marco', 'Julio', 'Sofia'], answer: 1 },
          { type: 'mcq', prompt: 'How old is the brother?', options: ['Six', 'Nine', 'Eleven', 'Sixteen'], answer: 1 },
          { type: 'mcq', prompt: 'What does Ana have besides a brother?', options: ['A dog', 'A sister', 'A cousin', 'Nothing else'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Describe Your Family',
        description: 'Practice talking about the people in your family.',
        mission: 'Tell a partner about two people in your family: who they are and one thing about them.',
        phrases: ['This is my mother/father.', 'I have a sister/brother.', 'His/Her name is...', 'He/She is ... years old.'],
        dialogue: [
          { speaker: 'You', line: 'I have a sister. Her name is...', translation: 'Tengo una hermana. Se llama...' },
          { speaker: 'Partner', line: 'How old is she?', translation: '¿Cuántos años tiene?' },
          { speaker: 'You', line: 'She is ... years old.', translation: 'Tiene ... años.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say out loud two sentences about a family member (name and age or one detail).', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Ask a partner "Do you have a sister or brother?" and listen to their answer.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Write About Your Family',
        description: 'Write a short paragraph describing your family.',
        mission: 'Write 3-4 sentences describing your family: who is in it and one detail about each person.',
        phrases: ['This is my...', 'I have a...', '...\'s name is...', 'He/She is ... years old.'],
        dialogue: [{ speaker: 'Model', line: 'This is my family. I have one sister. My sister\'s name is Sofia. She is sixteen years old.', translation: 'Esta es mi familia. Tengo una hermana. Mi hermana se llama Sofia. Tiene dieciséis años.' }],
        exercises: [
          { type: 'writing', prompt: 'Write 3-4 sentences describing your family members and one detail about each.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Possessive \'s and Plural Nouns',
        description: 'Learn how to show who something belongs to and how to make plurals.',
        grammarNote:
          'Goal: show who something belongs to with \'s, and make nouns plural correctly.\n\n' +
          'Rule: add \'s to a name or person to show possession (the owner comes first). To make most nouns plural, add -s or -es; some nouns change completely (irregular plurals).\n\n' +
          'Pattern: Owner + \'s + noun (Ana\'s brother). Noun + -s / -es for regular plurals (friend → friends, box → boxes). Irregular: child → children, man → men, woman → women.\n\n' +
          'Examples:\n1. Ana\'s brother is nine.\n2. My sister\'s name is Sofia.\n3. This is my teacher\'s book.\n4. One brother, two brothers.\n5. One friend, three friends.\n6. One child, two children.\n7. My parents\' house is big.\n8. The boy\'s bag is red.\n\n' +
          'Affirmative use: possessive \'s always attaches to the owner, not the thing owned: "my sister\'s name" (NOT "my sister name\'s").\n\n' +
          'Plural nouns don\'t have a negative form, but remember: after a number greater than one, the noun must be plural: "I have two brothers" (not "two brother").\n\n' +
          'Questions: "Whose book is this?" - "It is Ana\'s." / "How many brothers do you have?" - "I have two brothers."\n\n' +
          'Contractions: \'s after a singular owner (Ana\'s) is the same mark used for "is" (she\'s), but the meaning is different - context tells you which one it is. For plural owners ending in -s, just add an apostrophe: my parents\' house.\n\n' +
          'Common mistakes: ✗ "Ana brother" → ✓ "Ana\'s brother" (don\'t forget the \'s). ✗ "two childs" → ✓ "two children" (irregular plural). ✗ "friendes" → ✓ "friends" (only add -s, not -es, unless the word ends in s/sh/ch/x).\n\n' +
          'Compare: \'s shows possession (Ana\'s book = the book that belongs to Ana); plain -s on a noun just shows there is more than one (two books = quantity, no owner).\n\n' +
          'Mini practice: complete: "This is my (sister) ___ book." → sister\'s. "I have three (friend) ___." → friends. "Look at the (child) ___ over there." → children.\n\n' +
          'Summary: use \'s after the owner\'s name to show possession; add -s/-es to most nouns for plurals; memorize irregular plurals like children, men and women.',
        phrases: ['Ana\'s brother', 'my sister\'s name', 'two brothers', 'three friends'],
        exercises: [
          { type: 'mcq', prompt: 'How do you say the name belonging to Ana\'s mother?', options: ['Ana mother name', 'Ana\'s mother\'s name', 'Ana is mother name', 'Mother\'s Ana name'], answer: 1 },
          { type: 'mcq', prompt: 'What is the plural of "friend"?', options: ['friend', 'friends', 'friendes', 'friendies'], answer: 1 },
          { type: 'mcq', prompt: 'What is the plural of "child"?', options: ['childs', 'childes', 'children', 'child'], answer: 2 },
          { type: 'mcq', prompt: 'Choose the correct sentence.', options: ['This is my sister brother.', 'This is my sister\'s brother.', 'This is my sisters brother.', 'This my sister\'s is brother.'], answer: 1 }
        ],
        grammarTest: {
          id: 'english-a1-family-and-friends-grammar-test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: 'This is ___ bag. (belongs to Ana)',
              options: [
                { id: 'o1', text: 'Ana' },
                { id: 'o2', text: "Ana's" },
                { id: 'o3', text: "Anas" },
                { id: 'o4', text: "Ana is" }
              ],
              correctOptionId: 'o2',
              explanation: 'Add \'s to the owner\'s name: "Ana\'s bag."',
              difficulty: 'easy'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: 'What is the plural of "friend"?',
              options: [
                { id: 'o1', text: 'friendes' },
                { id: 'o2', text: 'friend' },
                { id: 'o3', text: 'friends' },
                { id: 'o4', text: 'friendies' }
              ],
              correctOptionId: 'o3',
              explanation: 'Most nouns add just -s: friend → friends.',
              difficulty: 'easy'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: 'What is the plural of "child"?',
              options: [
                { id: 'o1', text: 'childs' },
                { id: 'o2', text: 'childes' },
                { id: 'o3', text: 'child' },
                { id: 'o4', text: 'children' }
              ],
              correctOptionId: 'o4',
              explanation: '"Child" has an irregular plural: children.',
              difficulty: 'easy'
            },
            {
              id: 'q4',
              type: 'mcq',
              prompt: 'Choose the correct sentence.',
              options: [
                { id: 'o1', text: 'This is my sister brother.' },
                { id: 'o2', text: 'This is my sisters brother.' },
                { id: 'o3', text: "This is my sister's brother." },
                { id: 'o4', text: "This my sister's is brother." }
              ],
              correctOptionId: 'o3',
              explanation: 'The owner (sister) needs \'s before the thing owned (brother).',
              difficulty: 'easy'
            },
            {
              id: 'q5',
              type: 'mcq',
              prompt: 'I have two ___.',
              options: [
                { id: 'o1', text: 'brother' },
                { id: 'o2', text: "brother's" },
                { id: 'o3', text: 'brothers' },
                { id: 'o4', text: 'brotheres' }
              ],
              correctOptionId: 'o3',
              explanation: 'After a number greater than one, use the plural: two brothers.',
              difficulty: 'medium'
            },
            {
              id: 'q6',
              type: 'mcq',
              prompt: 'Find the mistake: "I have three friendes."',
              options: [
                { id: 'o1', text: 'There is no mistake' },
                { id: 'o2', text: 'It should be "friend"' },
                { id: 'o3', text: 'It should be "friends"' },
                { id: 'o4', text: 'It should be "friend\'s"' }
              ],
              correctOptionId: 'o3',
              explanation: '"Friend" only needs -s for the plural: friends.',
              difficulty: 'medium'
            },
            {
              id: 'q7',
              type: 'mcq',
              prompt: 'What is the plural of "woman"?',
              options: [
                { id: 'o1', text: 'womans' },
                { id: 'o2', text: 'women' },
                { id: 'o3', text: 'womens' },
                { id: 'o4', text: 'woman' }
              ],
              correctOptionId: 'o2',
              explanation: '"Woman" has the irregular plural "women".',
              difficulty: 'medium'
            },
            {
              id: 'q8',
              type: 'mcq',
              prompt: 'A: "Whose book is this?" B: "It is ___."',
              options: [
                { id: 'o1', text: 'Ana' },
                { id: 'o2', text: 'Ana book' },
                { id: 'o3', text: "Ana's" },
                { id: 'o4', text: 'Anas' }
              ],
              correctOptionId: 'o3',
              explanation: 'We answer "whose" with the owner + \'s: "It is Ana\'s."',
              difficulty: 'medium'
            },
            {
              id: 'q9',
              type: 'mcq',
              prompt: 'Choose the sentence with the same meaning as "The book that belongs to my teacher."',
              options: [
                { id: 'o1', text: "My teacher's book." },
                { id: 'o2', text: 'My teachers book.' },
                { id: 'o3', text: 'My teacher book.' },
                { id: 'o4', text: 'The my teacher book.' }
              ],
              correctOptionId: 'o1',
              explanation: 'Possessive \'s expresses "the book that belongs to my teacher": "my teacher\'s book."',
              difficulty: 'medium'
            },
            {
              id: 'q10',
              type: 'mcq',
              prompt: 'My ___ house is near the school. (belongs to my parents, plural)',
              options: [
                { id: 'o1', text: "parent's" },
                { id: 'o2', text: "parents's" },
                { id: 'o3', text: "parents'" },
                { id: 'o4', text: 'parents' }
              ],
              correctOptionId: 'o3',
              explanation: 'For a plural owner already ending in -s, just add an apostrophe: parents\'.',
              difficulty: 'hard'
            },
            {
              id: 'q11',
              type: 'mcq',
              prompt: 'Choose the correct order: "brother / my / is / this"',
              options: [
                { id: 'o1', text: 'Brother this my is.' },
                { id: 'o2', text: 'This is my brother.' },
                { id: 'o3', text: 'Is this my brother.' },
                { id: 'o4', text: 'My this is brother.' }
              ],
              correctOptionId: 'o2',
              explanation: 'The natural order is subject + verb + rest: "This is my brother."',
              difficulty: 'hard'
            },
            {
              id: 'q12',
              type: 'mcq',
              prompt: 'How many children does the family have if they say "We have one boy and one girl"?',
              options: [
                { id: 'o1', text: 'One child' },
                { id: 'o2', text: 'Two child' },
                { id: 'o3', text: 'Two children' },
                { id: 'o4', text: 'Two childs' }
              ],
              correctOptionId: 'o3',
              explanation: 'One boy + one girl = two children (irregular plural).',
              difficulty: 'hard'
            }
          ]
        }
      }),
      vocabulary: activity('vocabulary', {
        title: 'Family Members',
        description: 'Words for the people in your family.',
        vocabulary: [
          { word: 'Mother', translation: 'Madre', example: 'My mother\'s name is Carmen.' },
          { word: 'Father', translation: 'Padre', example: 'My father works at a school.' },
          { word: 'Sister', translation: 'Hermana', example: 'My sister is sixteen years old.' },
          { word: 'Brother', translation: 'Hermano', example: 'My brother is nine.' },
          { word: 'Grandmother', translation: 'Abuela', example: 'My grandmother is very kind.' },
          { word: 'Grandfather', translation: 'Abuelo', example: 'My grandfather tells great stories.' },
          { word: 'Cousin', translation: 'Primo/a', example: 'My cousin lives in Santiago.' },
          { word: 'Family', translation: 'Familia', example: 'We are a happy family.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "Brother" mean?', options: ['Hermana', 'Hermano', 'Padre', 'Primo'], answer: 1 },
          { type: 'mcq', prompt: 'What does "Grandmother" mean?', options: ['Abuelo', 'Madre', 'Abuela', 'Prima'], answer: 2 },
          { type: 'mcq', prompt: 'What does "Cousin" mean?', options: ['Primo/a', 'Hermano', 'Padre', 'Familia'], answer: 0 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'my-school',
    title: 'My School',
    titleEs: 'Mi escuela',
    description: 'School objects, subjects and classroom language.',
    order: 4,
    activities: {
      reading: activity('reading', {
        title: 'My Classroom',
        description: 'A short text describing a classroom and school subjects, in three parts.',
        reading: {
          title: 'My Classroom',
          parts: [
            'My classroom is big and bright. There is a whiteboard, a teacher\'s desk, and twenty student desks. There are books, pencils, and a big clock on the wall. The walls are yellow, and there are colorful posters everywhere.',
            'My favorite subject is English, but I also like Math and Art. In English class, we learn new words and sing songs. In Art class, we draw and paint pictures. Math is difficult sometimes, but my teacher helps me.',
            'There isn\'t a computer in my classroom, but there is a computer lab at school. We go there once a week to use computers. I like my school very much because my teachers are kind and my friends are fun.'
          ],
          questions: [
            'What is on the wall of the classroom?',
            'What is the writer\'s favorite subject?',
            'Where is the computer?'
          ],
          ordering: {
            prompt: 'Put the events of the story in order.',
            events: [
              'Students sit at their desks in the classroom.',
              'The class studies English and sings songs.',
              'The class studies Art and paints pictures.',
              'The class visits the computer lab.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'What is on the wall?', options: ['A window', 'A clock', 'A door', 'A map'], answer: 1 },
          { type: 'mcq', prompt: 'What is the favorite subject?', options: ['Math', 'Art', 'English', 'Science'], answer: 2 },
          { type: 'mcq', prompt: 'Where is the computer?', options: ['In the classroom', 'At home', 'In the computer lab', 'There is no computer'], answer: 2 },
          { type: 'mcq', prompt: 'What do they do in Art class?', options: ['Sing songs', 'Draw and paint', 'Use computers', 'Read books'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: The classroom walls are yellow.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'True or false: There is a computer in the classroom.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: Math is always easy for the writer.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'Choose the best word: The classroom is big and ___, with yellow walls.', options: ['bright', 'dark', 'small', 'empty'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'What\'s in Your Bag?',
        description: 'Listen to two classmates checking their school bags.',
        intro: 'Listen to Sofia and Marco talking about what is in their school bags before class.',
        dialogue: [
          { speaker: 'Sofia', line: 'Do you have a pencil, Marco?', translation: '¿Tienes un lápiz, Marco?' },
          { speaker: 'Marco', line: 'Yes, I have two pencils and a pen.', translation: 'Sí, tengo dos lápices y un bolígrafo.' },
          { speaker: 'Sofia', line: 'Great, can I borrow one, please?', translation: 'Genial, ¿me prestas uno, por favor?' },
          { speaker: 'Marco', line: 'Sure, here you are.', translation: 'Claro, aquí tienes.' },
          { speaker: 'Sofia', line: 'Thank you! Is there a notebook in your bag too?', translation: '¡Gracias! ¿Hay también un cuaderno en tu mochila?' },
          { speaker: 'Marco', line: 'Yes, there is one notebook and one book.', translation: 'Sí, hay un cuaderno y un libro.' }
        ],
        phrases: ['Do you have a...?', 'Can I borrow...?', 'Here you are.', 'Is there a... in your bag?'],
        exercises: [
          { type: 'mcq', prompt: 'How many pencils does Marco have?', options: ['One', 'Two', 'Three', 'None'], answer: 1 },
          { type: 'mcq', prompt: 'What does Sofia ask to borrow?', options: ['A book', 'A pencil', 'A notebook', 'A pen'], answer: 1 },
          { type: 'mcq', prompt: 'What else is in Marco\'s bag?', options: ['A notebook and a book', 'A ruler', 'A computer', 'Nothing else'], answer: 0 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'What\'s in Your Bag?',
        description: 'Practice asking and answering about school objects.',
        mission: 'Ask a partner what is in their school bag and answer about your own bag.',
        phrases: ['Do you have a...?', 'There is a... / There are...', 'Can I borrow...?', 'My favorite subject is...'],
        dialogue: [
          { speaker: 'You', line: 'What is in your bag?', translation: '¿Qué hay en tu mochila?' },
          { speaker: 'Partner', line: 'There is a notebook and two pens.', translation: 'Hay un cuaderno y dos bolígrafos.' },
          { speaker: 'You', line: 'What is your favorite subject?', translation: '¿Cuál es tu materia favorita?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say out loud three school objects that are in your bag.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Ask a partner "What is your favorite subject?" and tell them yours.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Write About Your Classroom',
        description: 'Write sentences describing your classroom and favorite subject.',
        mission: 'Write 3-4 sentences describing your classroom (what is in it) and your favorite subject.',
        phrases: ['There is a...', 'There are...', 'My favorite subject is...', 'I like...'],
        dialogue: [{ speaker: 'Model', line: 'There is a whiteboard and there are twenty desks in my classroom. My favorite subject is English.', translation: 'Hay una pizarra y hay veinte pupitres en mi salón. Mi materia favorita es inglés.' }],
        exercises: [
          { type: 'writing', prompt: 'Write 3-4 sentences about your classroom and your favorite subject, using "There is/There are".', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'There Is / There Are + Articles',
        description: 'Learn to say what exists using there is / there are, and a / an / the.',
        grammarNote:
          'Goal: say what exists in a place with "there is/are", and choose the right article (a/an/the).\n\n' +
          'Rule: "there is" introduces one thing (singular); "there are" introduces more than one (plural). "A/an" introduce something new or not specific; "the" points to something both speakers already know.\n\n' +
          'Pattern: There is + a/an + singular noun. There are + plural noun. A + consonant sound. An + vowel sound. The + noun already known.\n\n' +
          'Examples:\n1. There is a clock on the wall.\n2. There are twenty desks.\n3. There is an eraser in my bag.\n4. There are some books on the desk.\n5. I have a pencil.\n6. She has an orange notebook.\n7. The whiteboard is white.\n8. There isn\'t a computer in this room.\n\n' +
          'Affirmative: There is/are + noun. Example: "There is a map on the wall."\n\n' +
          'Negative: There isn\'t / there aren\'t + noun. Example: "There isn\'t a window here." "There aren\'t any chairs."\n\n' +
          'Questions: Is there / Are there + noun...? Example: "Is there a library?" "Are there computers in the lab?" Short answers: "Yes, there is." / "No, there aren\'t."\n\n' +
          'Contractions: there\'s = there is, there isn\'t = there is not, there aren\'t = there are not.\n\n' +
          'Common mistakes: ✗ "There is twenty desks" → ✓ "There are twenty desks" (plural noun needs "are"). ✗ "There are a pencil" → ✓ "There is a pencil". ✗ "I have a eraser" → ✓ "I have an eraser" (vowel sound needs "an").\n\n' +
          'Compare: "there is/are" says something exists; "it is" describes something already mentioned. "A/an" = one, not specific yet; "the" = the specific one we both know.\n\n' +
          'Mini practice: complete with is/are, a/an/the. "___ ___ orange on the desk." → There is an orange on the desk. "___ ___ many students in the class." → There are many students in the class.\n\n' +
          'Summary: use "there is" + singular, "there are" + plural; use "a" before consonant sounds, "an" before vowel sounds, and "the" for something specific both people know.',
        phrases: ['There is a...', 'There are...', 'a pencil / an eraser', 'the classroom'],
        exercises: [
          { type: 'mcq', prompt: '___ a computer lab at school.', options: ['There is', 'There are', 'Is there', 'It is'], answer: 0 },
          { type: 'mcq', prompt: '___ twenty students in my class.', options: ['There is', 'There are', 'Is there', 'It are'], answer: 1 },
          { type: 'mcq', prompt: 'I have ___ eraser in my bag.', options: ['a', 'an', 'the', 'some'], answer: 1 },
          { type: 'mcq', prompt: 'I have ___ pencil.', options: ['a', 'an', 'are', 'is'], answer: 0 }
        ],
        grammarTest: {
          id: 'english-a1-my-school-grammar-test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: '___ a computer lab at school.',
              options: [
                { id: 'o1', text: 'There is' },
                { id: 'o2', text: 'There are' },
                { id: 'o3', text: 'Is there' },
                { id: 'o4', text: 'It is' }
              ],
              correctOptionId: 'o1',
              explanation: '"Computer lab" is singular, so we use "There is".',
              difficulty: 'easy'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: '___ twenty students in my class.',
              options: [
                { id: 'o1', text: 'It is' },
                { id: 'o2', text: 'There are' },
                { id: 'o3', text: 'There is' },
                { id: 'o4', text: 'Is there' }
              ],
              correctOptionId: 'o2',
              explanation: '"Twenty students" is plural, so we use "There are".',
              difficulty: 'easy'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: 'I have ___ eraser in my bag.',
              options: [
                { id: 'o1', text: 'a' },
                { id: 'o2', text: 'an' },
                { id: 'o3', text: 'the' },
                { id: 'o4', text: 'some' }
              ],
              correctOptionId: 'o2',
              explanation: '"Eraser" starts with a vowel sound, so we use "an".',
              difficulty: 'easy'
            },
            {
              id: 'q4',
              type: 'mcq',
              prompt: 'I have ___ pencil.',
              options: [
                { id: 'o1', text: 'a' },
                { id: 'o2', text: 'an' },
                { id: 'o3', text: 'are' },
                { id: 'o4', text: 'is' }
              ],
              correctOptionId: 'o1',
              explanation: '"Pencil" starts with a consonant sound, so we use "a".',
              difficulty: 'easy'
            },
            {
              id: 'q5',
              type: 'mcq',
              prompt: 'Find the mistake: "There is twenty desks."',
              options: [
                { id: 'o1', text: 'There is no mistake' },
                { id: 'o2', text: 'It should be "There are twenty desks"' },
                { id: 'o3', text: 'It should be "There is a desks"' },
                { id: 'o4', text: '"twenty" should be "twentieth"' }
              ],
              correctOptionId: 'o2',
              explanation: '"Desks" is plural, so the sentence needs "There are".',
              difficulty: 'medium'
            },
            {
              id: 'q6',
              type: 'mcq',
              prompt: 'Choose the correct negative sentence.',
              options: [
                { id: 'o1', text: "There don't a window here." },
                { id: 'o2', text: "There isn't a window here." },
                { id: 'o3', text: "There is not a windows here." },
                { id: 'o4', text: "There no is a window here." }
              ],
              correctOptionId: 'o2',
              explanation: 'The negative of "there is" is "there isn\'t".',
              difficulty: 'medium'
            },
            {
              id: 'q7',
              type: 'mcq',
              prompt: 'Which question is correct?',
              options: [
                { id: 'o1', text: 'There is a library?' },
                { id: 'o2', text: 'Is a library there?' },
                { id: 'o3', text: 'Is there a library?' },
                { id: 'o4', text: 'There a library is?' }
              ],
              correctOptionId: 'o3',
              explanation: 'Questions move "is" before "there": "Is there a library?"',
              difficulty: 'medium'
            },
            {
              id: 'q8',
              type: 'mcq',
              prompt: 'A: "Are there computers in the lab?" B: "Yes, ___."',
              options: [
                { id: 'o1', text: 'there are' },
                { id: 'o2', text: 'there is' },
                { id: 'o3', text: 'they are' },
                { id: 'o4', text: 'it is' }
              ],
              correctOptionId: 'o1',
              explanation: 'A short answer to "Are there...?" is "Yes, there are."',
              difficulty: 'medium'
            },
            {
              id: 'q9',
              type: 'mcq',
              prompt: 'Choose the sentence that means the same as "A map exists on the wall."',
              options: [
                { id: 'o1', text: 'There is a map on the wall.' },
                { id: 'o2', text: 'It is a map on the wall.' },
                { id: 'o3', text: 'A map is there on the wall.' },
                { id: 'o4', text: 'There map is on the wall.' }
              ],
              correctOptionId: 'o1',
              explanation: '"There is/are" is how English says something exists somewhere.',
              difficulty: 'medium'
            },
            {
              id: 'q10',
              type: 'mcq',
              prompt: 'I already told you about the whiteboard, so now I say: "___ whiteboard is white."',
              options: [
                { id: 'o1', text: 'A' },
                { id: 'o2', text: 'An' },
                { id: 'o3', text: 'The' },
                { id: 'o4', text: 'There' }
              ],
              correctOptionId: 'o3',
              explanation: 'When both speakers already know which thing we mean, we use "the".',
              difficulty: 'hard'
            },
            {
              id: 'q11',
              type: 'mcq',
              prompt: 'What is the short form of "there is not"?',
              options: [
                { id: 'o1', text: "there'sn't" },
                { id: 'o3', text: "theren't" },
                { id: 'o4', text: "there'not" },
                { id: 'o2', text: "there isn't" }
              ],
              correctOptionId: 'o2',
              explanation: '"There is not" contracts to "there isn\'t".',
              difficulty: 'hard'
            },
            {
              id: 'q12',
              type: 'mcq',
              prompt: 'Choose the correct sentence for "one orange on the desk, not mentioned before."',
              options: [
                { id: 'o1', text: 'There is the orange on the desk.' },
                { id: 'o2', text: 'There is an orange on the desk.' },
                { id: 'o3', text: 'There are orange on the desk.' },
                { id: 'o4', text: 'There is a orange on the desk.' }
              ],
              correctOptionId: 'o2',
              explanation: 'Something new and singular uses "there is an" (vowel sound), not "the".',
              difficulty: 'hard'
            }
          ]
        }
      }),
      vocabulary: activity('vocabulary', {
        title: 'School Objects and Subjects',
        description: 'Words for classroom objects and school subjects.',
        vocabulary: [
          { word: 'Classroom', translation: 'Salón de clases', example: 'My classroom is big.' },
          { word: 'Pencil', translation: 'Lápiz', example: 'I have two pencils.' },
          { word: 'Notebook', translation: 'Cuaderno', example: 'Write it in your notebook.' },
          { word: 'Whiteboard', translation: 'Pizarra', example: 'The teacher writes on the whiteboard.' },
          { word: 'Subject', translation: 'Materia', example: 'English is my favorite subject.' },
          { word: 'Desk', translation: 'Pupitre / escritorio', example: 'There are twenty desks.' },
          { word: 'Homework', translation: 'Tarea', example: 'I do my homework after school.' },
          { word: 'Book', translation: 'Libro', example: 'Open your book, please.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "Notebook" mean?', options: ['Cuaderno', 'Lápiz', 'Pizarra', 'Libro'], answer: 0 },
          { type: 'mcq', prompt: 'What does "Subject" mean?', options: ['Salón', 'Materia', 'Pupitre', 'Tarea'], answer: 1 },
          { type: 'mcq', prompt: 'What does "Homework" mean?', options: ['Tarea', 'Libro', 'Cuaderno', 'Pizarra'], answer: 0 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'daily-routine',
    title: 'My Daily Routine',
    titleEs: 'Mi rutina diaria',
    description: 'Daily activities and the present simple.',
    order: 5,
    activities: {
      reading: activity('reading', {
        title: 'A Normal Day',
        description: 'A short text about Ana\'s daily routine, in three parts.',
        reading: {
          title: 'A Normal Day',
          parts: [
            'Every day, I get up at seven o\'clock. First, I brush my teeth and wash my face. Then I eat breakfast with my family: bread, eggs, and juice. After breakfast, I walk to school with my friend Sofia. We talk about our homework on the way.',
            'School starts at eight o\'clock. I have English, Math, and Science in the morning. At noon, I eat lunch with my classmates in the cafeteria. In the afternoon, I do my homework at home, and then I play soccer with my brother in the garden.',
            'In the evening, my family has dinner together at seven o\'clock. We talk about our day and laugh a lot. After dinner, I read a book for a little while. I go to bed at nine thirty. I always sleep well because my day is full of activities!'
          ],
          questions: [
            'What time does the writer get up?',
            'Who does she walk to school with?',
            'What time does she go to bed?'
          ],
          ordering: {
            prompt: 'Put the events of the story in order.',
            events: [
              'Ana gets up and eats breakfast.',
              'Ana walks to school with Sofia.',
              'Ana does her homework and plays soccer.',
              'The family has dinner together.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'What time does she get up?', options: ['Six o\'clock', 'Seven o\'clock', 'Eight o\'clock', 'Nine o\'clock'], answer: 1 },
          { type: 'mcq', prompt: 'What does she eat for breakfast?', options: ['Rice and chicken', 'Bread, eggs and juice', 'Pizza', 'Only fruit'], answer: 1 },
          { type: 'mcq', prompt: 'What does she do after school?', options: ['She sleeps', 'She eats breakfast', 'She does homework and plays soccer', 'She goes to work'], answer: 2 },
          { type: 'mcq', prompt: 'What time does the family have dinner?', options: ['Six o\'clock', 'Seven o\'clock', 'Eight o\'clock', 'Nine o\'clock'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: She walks to school alone.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: She has English, Math and Science in the morning.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'True or false: She goes to bed at eight thirty.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'Choose the best word: We talk about our day and ___ a lot at dinner.', options: ['laugh', 'cry', 'sleep', 'cook'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'What Time Do You Wake Up?',
        description: 'Listen to two friends comparing their daily routines.',
        intro: 'Listen to Leo and Marco talking about what time they do things every day.',
        dialogue: [
          { speaker: 'Leo', line: 'What time do you wake up, Marco?', translation: '¿A qué hora te despiertas, Marco?' },
          { speaker: 'Marco', line: 'I wake up at six thirty. What about you?', translation: 'Me despierto a las seis y media. ¿Y tú?' },
          { speaker: 'Leo', line: 'I get up at seven. Then I eat breakfast quickly.', translation: 'Yo me levanto a las siete. Luego desayuno rápido.' },
          { speaker: 'Marco', line: 'Do you walk to school?', translation: '¿Caminas a la escuela?' },
          { speaker: 'Leo', line: 'Yes, I walk with my sister every day.', translation: 'Sí, camino con mi hermana todos los días.' },
          { speaker: 'Marco', line: 'I take the bus. School starts at eight.', translation: 'Yo tomo el autobús. La escuela empieza a las ocho.' }
        ],
        phrases: ['What time do you...?', 'I wake up at...', 'I get up at...', 'School starts at...'],
        exercises: [
          { type: 'mcq', prompt: 'What time does Marco wake up?', options: ['Six thirty', 'Seven', 'Eight', 'Nine'], answer: 0 },
          { type: 'mcq', prompt: 'How does Leo go to school?', options: ['By bus', 'By car', 'He walks', 'By bike'], answer: 2 },
          { type: 'mcq', prompt: 'What time does school start?', options: ['Six thirty', 'Seven', 'Eight', 'Nine'], answer: 2 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Talk About Your Day',
        description: 'Practice describing your daily routine.',
        mission: 'Tell a partner three things you do every day and what time you do them.',
        phrases: ['I get up at...', 'I go to school at...', 'I do my homework...', 'I go to bed at...'],
        dialogue: [
          { speaker: 'You', line: 'I get up at... and I eat breakfast at...', translation: 'Me levanto a las... y desayuno a las...' },
          { speaker: 'Partner', line: 'What time do you go to bed?', translation: '¿A qué hora te acuestas?' },
          { speaker: 'You', line: 'I go to bed at...', translation: 'Me acuesto a las...' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say out loud three things you do every day, with the time for each one.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Ask a partner "What time do you wake up?" and compare your answers.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Write Your Daily Routine',
        description: 'Write a short paragraph about your typical day.',
        mission: 'Write 4-5 sentences describing your daily routine, from waking up to going to bed.',
        phrases: ['I get up at...', 'After that, I...', 'In the evening, I...', 'I go to bed at...'],
        dialogue: [{ speaker: 'Model', line: 'I get up at seven o\'clock. I eat breakfast and walk to school. After school, I do my homework. I go to bed at nine thirty.', translation: 'Me levanto a las siete. Desayuno y camino a la escuela. Después de la escuela, hago mi tarea. Me acuesto a las nueve y media.' }],
        exercises: [
          { type: 'writing', prompt: 'Write 4-5 sentences describing your daily routine from morning to night.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Present Simple (Affirmative)',
        description: 'Learn how to talk about habits and daily routines.',
        grammarNote:
          'Goal: describe habits, routines and facts using the present simple.\n\n' +
          'Rule: we use the present simple for things that happen regularly or are always true. With he/she/it, the verb takes an extra -s (or -es/changes y to i).\n\n' +
          'Pattern: I/You/We/They + base verb. He/She/It + verb + -s. Special: have → has.\n\n' +
          'Examples:\n1. I get up at seven.\n2. She gets up at seven.\n3. I eat breakfast every day.\n4. He eats breakfast at home.\n5. My brother goes to school by bus.\n6. We have dinner at seven.\n7. She has a big breakfast.\n8. They walk to school together.\n\n' +
          'Affirmative: subject + verb(+s with he/she/it). Example: "He brushes his teeth every morning." Note the spelling: go → goes, watch → watches, study → studies (consonant + y → ies).\n\n' +
          'Negative: don\'t/doesn\'t + base verb (the -s moves to "does"). Example: "I don\'t eat breakfast." "She doesn\'t get up early."\n\n' +
          'Questions: Do/Does + subject + base verb? Example: "Do you walk to school?" "Does she get up at seven?"\n\n' +
          'Contractions: don\'t = do not, doesn\'t = does not.\n\n' +
          'Common mistakes: ✗ "She get up at seven" → ✓ "She gets up at seven" (don\'t forget the -s). ✗ "He haves breakfast" → ✓ "He has breakfast" (have is irregular). ✗ "Does she gets up early?" → ✓ "Does she get up early?" (only one -s per sentence, on "does").\n\n' +
          'Compare: "have" (I/you/we/they) becomes "has" (he/she/it) - it does not just add -s like regular verbs. Time words like "every day", "always" and "usually" signal the present simple.\n\n' +
          'Mini practice: complete with the correct form. "My sister (have) ___ breakfast at seven." → has. "I (walk) ___ to school." → walk. "He (study) ___ English every day." → studies.\n\n' +
          'Summary: use the base verb for I/you/we/they and add -s (or -es, or change y to ies) for he/she/it; "have" becomes "has"; use don\'t/doesn\'t for negatives and do/does for questions.',
        phrases: ['I get up...', 'She gets up...', 'I eat breakfast.', 'He eats breakfast.'],
        exercises: [
          { type: 'mcq', prompt: 'She ___ up at seven every day.', options: ['get', 'gets', 'getting', 'to get'], answer: 1 },
          { type: 'mcq', prompt: 'I ___ breakfast at home.', options: ['eat', 'eats', 'eating', 'ate'], answer: 0 },
          { type: 'mcq', prompt: 'My brother ___ to school by bus.', options: ['go', 'goes', 'going', 'gone'], answer: 1 },
          { type: 'mcq', prompt: 'We ___ dinner at seven in the evening.', options: ['has', 'have', 'having', 'had'], answer: 1 }
        ],
        grammarTest: {
          id: 'english-a1-daily-routine-grammar-test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: 'She ___ up at seven every day.',
              options: [
                { id: 'o2', text: 'gets' },
                { id: 'o1', text: 'get' },
                { id: 'o3', text: 'getting' },
                { id: 'o4', text: 'to get' }
              ],
              correctOptionId: 'o2',
              explanation: 'With "she", the verb takes -s: gets.',
              difficulty: 'easy'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: 'I ___ breakfast at home.',
              options: [
                { id: 'o1', text: 'eats' },
                { id: 'o2', text: 'eating' },
                { id: 'o3', text: 'eat' },
                { id: 'o4', text: 'ate' }
              ],
              correctOptionId: 'o3',
              explanation: 'With "I", we use the base form: eat.',
              difficulty: 'easy'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: 'My brother ___ to school by bus.',
              options: [
                { id: 'o1', text: 'go' },
                { id: 'o2', text: 'goes' },
                { id: 'o3', text: 'going' },
                { id: 'o4', text: 'gone' }
              ],
              correctOptionId: 'o2',
              explanation: 'With "my brother" (he), the verb takes -es: goes.',
              difficulty: 'easy'
            },
            {
              id: 'q4',
              type: 'mcq',
              prompt: 'We ___ dinner at seven in the evening.',
              options: [
                { id: 'o1', text: 'has' },
                { id: 'o2', text: 'have' },
                { id: 'o3', text: 'having' },
                { id: 'o4', text: 'had' }
              ],
              correctOptionId: 'o2',
              explanation: 'With "we", the verb "have" stays the same: have.',
              difficulty: 'easy'
            },
            {
              id: 'q5',
              type: 'mcq',
              prompt: 'She ___ a big breakfast every morning.',
              options: [
                { id: 'o1', text: 'have' },
                { id: 'o2', text: 'haves' },
                { id: 'o3', text: 'has' },
                { id: 'o4', text: 'having' }
              ],
              correctOptionId: 'o3',
              explanation: '"Have" is irregular with he/she/it: has.',
              difficulty: 'medium'
            },
            {
              id: 'q6',
              type: 'mcq',
              prompt: 'I ___ eat breakfast on weekends. (negative)',
              options: [
                { id: 'o1', text: "doesn't" },
                { id: 'o2', text: "don't" },
                { id: 'o3', text: "not" },
                { id: 'o4', text: "am not" }
              ],
              correctOptionId: 'o2',
              explanation: 'With "I", the negative auxiliary is "don\'t".',
              difficulty: 'medium'
            },
            {
              id: 'q7',
              type: 'mcq',
              prompt: 'She ___ get up early on Sundays. (negative)',
              options: [
                { id: 'o1', text: "don't" },
                { id: 'o2', text: "doesn't" },
                { id: 'o3', text: "isn't" },
                { id: 'o4', text: "not" }
              ],
              correctOptionId: 'o2',
              explanation: 'With "she", the negative auxiliary is "doesn\'t", and the verb loses its -s.',
              difficulty: 'medium'
            },
            {
              id: 'q8',
              type: 'mcq',
              prompt: 'Which question is correct?',
              options: [
                { id: 'o1', text: 'Does she gets up at seven?' },
                { id: 'o2', text: 'Do she get up at seven?' },
                { id: 'o3', text: 'Does she get up at seven?' },
                { id: 'o4', text: 'Is she get up at seven?' }
              ],
              correctOptionId: 'o3',
              explanation: 'Questions with he/she/it use "Does" + base verb (no extra -s).',
              difficulty: 'medium'
            },
            {
              id: 'q9',
              type: 'mcq',
              prompt: 'Find the mistake: "He haves breakfast at seven."',
              options: [
                { id: 'o1', text: 'There is no mistake' },
                { id: 'o2', text: 'It should be "He have breakfast"' },
                { id: 'o3', text: 'It should be "He has breakfast"' },
                { id: 'o4', text: 'It should be "He is having breakfast"' }
              ],
              correctOptionId: 'o3',
              explanation: '"Have" is irregular: "he has", never "he haves".',
              difficulty: 'medium'
            },
            {
              id: 'q10',
              type: 'mcq',
              prompt: 'My sister ___ English every day. (study)',
              options: [
                { id: 'o1', text: 'studys' },
                { id: 'o2', text: 'study' },
                { id: 'o3', text: 'studying' },
                { id: 'o4', text: 'studies' }
              ],
              correctOptionId: 'o4',
              explanation: 'Verbs ending in consonant + y change y to ies: study → studies.',
              difficulty: 'hard'
            },
            {
              id: 'q11',
              type: 'mcq',
              prompt: 'A: "Does he walk to school?" B: "Yes, ___."',
              options: [
                { id: 'o1', text: 'he walks' },
                { id: 'o2', text: 'he does' },
                { id: 'o3', text: 'he do' },
                { id: 'o4', text: 'he is' }
              ],
              correctOptionId: 'o2',
              explanation: 'Short answers repeat the auxiliary: "Yes, he does."',
              difficulty: 'hard'
            },
            {
              id: 'q12',
              type: 'mcq',
              prompt: 'Choose the sentence that best fits: "It is always true that my mother teaches at this school."',
              options: [
                { id: 'o1', text: 'My mother is teaching at this school.' },
                { id: 'o2', text: 'My mother teaches at this school.' },
                { id: 'o3', text: 'My mother taught at this school.' },
                { id: 'o4', text: 'My mother teach at this school.' }
              ],
              correctOptionId: 'o2',
              explanation: 'A general truth/routine uses the present simple with -s for "she/mother": teaches.',
              difficulty: 'hard'
            }
          ]
        }
      }),
      vocabulary: activity('vocabulary', {
        title: 'Daily Actions',
        description: 'Words and verbs for everyday routines.',
        vocabulary: [
          { word: 'Wake up', translation: 'Despertarse', example: 'I wake up at six thirty.' },
          { word: 'Get up', translation: 'Levantarse', example: 'I get up at seven.' },
          { word: 'Breakfast', translation: 'Desayuno', example: 'I eat breakfast every morning.' },
          { word: 'Walk to school', translation: 'Caminar a la escuela', example: 'I walk to school with Sofia.' },
          { word: 'Homework', translation: 'Tarea', example: 'I do my homework after school.' },
          { word: 'Dinner', translation: 'Cena', example: 'We have dinner at seven.' },
          { word: 'Go to bed', translation: 'Irse a dormir', example: 'I go to bed at nine thirty.' },
          { word: 'Every day', translation: 'Todos los días', example: 'I brush my teeth every day.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "Wake up" mean?', options: ['Despertarse', 'Cenar', 'Caminar', 'Levantarse'], answer: 0 },
          { type: 'mcq', prompt: 'What does "Dinner" mean?', options: ['Desayuno', 'Cena', 'Tarea', 'Escuela'], answer: 1 },
          { type: 'mcq', prompt: 'What does "Go to bed" mean?', options: ['Levantarse', 'Despertarse', 'Irse a dormir', 'Caminar'], answer: 2 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'time-and-dates',
    title: 'Time and Dates',
    titleEs: 'La hora y las fechas',
    description: 'Telling time, days, months and prepositions of time.',
    order: 6,
    activities: {
      reading: activity('reading', {
        title: 'My Weekly Schedule',
        description: 'A short text about a student\'s weekly schedule, in three parts.',
        reading: {
          title: 'My Weekly Schedule',
          parts: [
            'My English class is on Monday, Wednesday, and Friday, at nine o\'clock in the morning. I also have Math on Tuesday and Thursday, at ten o\'clock. My classes finish at two o\'clock in the afternoon, and then I go home for lunch.',
            'My favorite day is Saturday because I don\'t have school. On Saturday mornings, I usually clean my room and help my mother. In the afternoon, I play with my friends in the park. Sunday is a quiet day; my family rests and visits my grandmother.',
            'My birthday is in June, on the fifteenth. This year, my birthday is on a Sunday, so I can celebrate all day with my family! In the summer, in July and August, we don\'t have classes at all. I love summer because I can sleep late and travel.'
          ],
          questions: [
            'What days does the writer have English class?',
            'When is the writer\'s birthday?',
            'Which months have no classes?'
          ],
          ordering: {
            prompt: 'Put the events of the story in order.',
            events: [
              'The writer goes to English class on Monday.',
              'The writer cleans her room on Saturday morning.',
              'The writer plays with friends on Saturday afternoon.',
              'The writer celebrates her birthday in June.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'What time is English class?', options: ['Eight o\'clock', 'Nine o\'clock', 'Ten o\'clock', 'Noon'], answer: 1 },
          { type: 'mcq', prompt: 'When is the writer\'s birthday?', options: ['May 15th', 'June 15th', 'July 15th', 'June 5th'], answer: 1 },
          { type: 'mcq', prompt: 'Which day has no school?', options: ['Monday', 'Wednesday', 'Friday', 'Saturday'], answer: 3 },
          { type: 'mcq', prompt: 'What time do classes finish?', options: ['One o\'clock', 'Two o\'clock', 'Three o\'clock', 'Four o\'clock'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: Math class is on Tuesday and Thursday.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'True or false: The writer\'s birthday is in July.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: There are no classes in July and August.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'Choose the best word: Sunday is a ___ day; my family rests.', options: ['quiet', 'noisy', 'busy', 'short'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'What Time Is It?',
        description: 'Listen to two friends checking the time and making plans.',
        intro: 'Listen to Sofia and Leo talking about what time it is and their plans for the day.',
        dialogue: [
          { speaker: 'Sofia', line: 'Excuse me, what time is it?', translation: 'Disculpa, ¿qué hora es?' },
          { speaker: 'Leo', line: 'It\'s a quarter past three.', translation: 'Son las tres y cuarto.' },
          { speaker: 'Sofia', line: 'Great, my class starts at four o\'clock.', translation: 'Genial, mi clase empieza a las cuatro.' },
          { speaker: 'Leo', line: 'What day is your English test?', translation: '¿Qué día es tu examen de inglés?' },
          { speaker: 'Sofia', line: 'It\'s on Friday, at half past ten in the morning.', translation: 'Es el viernes, a las diez y media de la mañana.' },
          { speaker: 'Leo', line: 'Good luck! See you on Friday.', translation: '¡Buena suerte! Nos vemos el viernes.' }
        ],
        phrases: ['What time is it?', 'It\'s ... o\'clock.', 'What day is...?', 'It\'s on...'],
        exercises: [
          { type: 'mcq', prompt: 'What time is it in the dialogue?', options: ['Three o\'clock', 'A quarter past three', 'Half past three', 'Four o\'clock'], answer: 1 },
          { type: 'mcq', prompt: 'What day is Sofia\'s test?', options: ['Monday', 'Wednesday', 'Friday', 'Sunday'], answer: 2 },
          { type: 'mcq', prompt: 'What time is the test?', options: ['Ten o\'clock', 'Half past ten', 'Quarter past ten', 'Eleven o\'clock'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Ask About Time and Dates',
        description: 'Practice asking and telling the time and days.',
        mission: 'Ask a partner what time it is and what day their favorite class is.',
        phrases: ['What time is it?', 'It\'s ... o\'clock.', 'What day is it today?', 'My favorite day is...'],
        dialogue: [
          { speaker: 'You', line: 'What time is it?', translation: '¿Qué hora es?' },
          { speaker: 'Partner', line: 'It\'s half past ten.', translation: 'Son las diez y media.' },
          { speaker: 'You', line: 'What is your favorite day of the week?', translation: '¿Cuál es tu día favorito de la semana?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say the current time out loud in English, and your favorite day of the week.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Ask a partner "What time is your favorite class?" and answer their question too.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Write Your Weekly Schedule',
        description: 'Write sentences about your school days and your birthday.',
        mission: 'Write 3-4 sentences about which days you have classes and when your birthday is.',
        phrases: ['My class is on...', 'at ... o\'clock', 'My birthday is in...', 'on the ___ of ___'],
        dialogue: [{ speaker: 'Model', line: 'My English class is on Monday and Wednesday at nine o\'clock. My birthday is in June.', translation: 'Mi clase de inglés es el lunes y el miércoles a las nueve. Mi cumpleaños es en junio.' }],
        exercises: [
          { type: 'writing', prompt: 'Write 3-4 sentences about your school days, the time, and your birthday month.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Prepositions of Time: at / on / in',
        description: 'Learn when to use at, on and in with times, days and months.',
        grammarNote:
          'Goal: choose the right preposition of time (at/on/in) for clocks, days and months.\n\n' +
          'Rule: "at" is for exact points in time, "on" is for days and dates, and "in" is for longer periods like months, years and parts of the day.\n\n' +
          'Pattern: at + clock time/noon/night. on + day/date. in + month/year/season/morning-afternoon-evening.\n\n' +
          'Examples:\n1. My class starts at nine o\'clock.\n2. I go to bed at night.\n3. We have English on Monday.\n4. My birthday is on June 15th.\n5. My birthday is in June.\n6. I do my homework in the evening.\n7. School starts in September.\n8. I play soccer at noon.\n\n' +
          'Affirmative: subject + verb + at/on/in + time expression. Example: "The party is on Saturday."\n\n' +
          'Negative: add don\'t/doesn\'t (or isn\'t) before the verb, the preposition doesn\'t change. Example: "I don\'t have class at nine." "We don\'t have school on Sunday."\n\n' +
          'Questions: "What time...?" asks for a clock time (uses "at"); "What day...?" asks for a day (uses "on"); "When...?" can ask for any of the three. Example: "What time does class start?" "What day is the party?"\n\n' +
          'Contractions: none of these prepositions contract, but remember "o\'clock" is short for "of the clock".\n\n' +
          'Common mistakes: ✗ "at Monday" → ✓ "on Monday". ✗ "on nine o\'clock" → ✓ "at nine o\'clock". ✗ "at June" → ✓ "in June". A helpful memory trick: AT a point, ON a day, IN a longer period.\n\n' +
          'Compare: "on Monday" (one day) vs "in the morning" (a longer part of the day) vs "at seven" (an exact time) - the size of the time period decides the preposition.\n\n' +
          'Mini practice: complete with at/on/in. "The movie starts ___ eight o\'clock." → at. "We don\'t have school ___ Sunday." → on. "It often rains ___ summer." → in.\n\n' +
          'Summary: use "at" for exact times, "on" for days and dates, and "in" for months, years, seasons and parts of the day.',
        phrases: ['at seven o\'clock', 'on Monday', 'in June', 'in the morning'],
        exercises: [
          { type: 'mcq', prompt: 'My class starts ___ nine o\'clock.', options: ['at', 'on', 'in', 'by'], answer: 0 },
          { type: 'mcq', prompt: 'My birthday is ___ June.', options: ['at', 'on', 'in', 'by'], answer: 2 },
          { type: 'mcq', prompt: 'We have English ___ Monday.', options: ['at', 'on', 'in', 'by'], answer: 1 },
          { type: 'mcq', prompt: 'I do my homework ___ the evening.', options: ['at', 'on', 'in', 'by'], answer: 2 }
        ],
        grammarTest: {
          id: 'english-a1-time-and-dates-grammar-test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: 'My class starts ___ nine o\'clock.',
              options: [
                { id: 'o2', text: 'on' },
                { id: 'o3', text: 'in' },
                { id: 'o4', text: 'by' },
                { id: 'o1', text: 'at' }
              ],
              correctOptionId: 'o1',
              explanation: 'An exact clock time uses "at".',
              difficulty: 'easy'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: 'My birthday is ___ June.',
              options: [
                { id: 'o1', text: 'at' },
                { id: 'o2', text: 'on' },
                { id: 'o3', text: 'in' },
                { id: 'o4', text: 'by' }
              ],
              correctOptionId: 'o3',
              explanation: 'A month uses "in".',
              difficulty: 'easy'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: 'We have English ___ Monday.',
              options: [
                { id: 'o1', text: 'at' },
                { id: 'o2', text: 'on' },
                { id: 'o3', text: 'in' },
                { id: 'o4', text: 'by' }
              ],
              correctOptionId: 'o2',
              explanation: 'A day of the week uses "on".',
              difficulty: 'easy'
            },
            {
              id: 'q4',
              type: 'mcq',
              prompt: 'I do my homework ___ the evening.',
              options: [
                { id: 'o1', text: 'at' },
                { id: 'o2', text: 'on' },
                { id: 'o3', text: 'in' },
                { id: 'o4', text: 'by' }
              ],
              correctOptionId: 'o3',
              explanation: 'A part of the day (morning/afternoon/evening) uses "in".',
              difficulty: 'easy'
            },
            {
              id: 'q5',
              type: 'mcq',
              prompt: 'Find the mistake: "The party is at Saturday."',
              options: [
                { id: 'o1', text: 'There is no mistake' },
                { id: 'o2', text: 'It should be "on Saturday"' },
                { id: 'o3', text: 'It should be "in Saturday"' },
                { id: 'o4', text: 'It should be "Saturday at"' }
              ],
              correctOptionId: 'o2',
              explanation: 'Days take "on", not "at": "on Saturday".',
              difficulty: 'medium'
            },
            {
              id: 'q6',
              type: 'mcq',
              prompt: 'Choose the correct sentence.',
              options: [
                { id: 'o1', text: 'School starts on September.' },
                { id: 'o2', text: 'School starts at September.' },
                { id: 'o3', text: 'School starts in September.' },
                { id: 'o4', text: 'School starts September.' }
              ],
              correctOptionId: 'o3',
              explanation: 'Months take "in": "in September".',
              difficulty: 'medium'
            },
            {
              id: 'q7',
              type: 'mcq',
              prompt: 'A: "What time does the movie start?" B: "It starts ___ eight."',
              options: [
                { id: 'o1', text: 'on' },
                { id: 'o2', text: 'in' },
                { id: 'o3', text: 'at' },
                { id: 'o4', text: 'by' }
              ],
              correctOptionId: 'o3',
              explanation: '"What time" is answered with an exact time, using "at".',
              difficulty: 'medium'
            },
            {
              id: 'q8',
              type: 'mcq',
              prompt: 'We don\'t have school ___ Sunday. (negative)',
              options: [
                { id: 'o1', text: 'at' },
                { id: 'o2', text: 'on' },
                { id: 'o3', text: 'in' },
                { id: 'o4', text: 'by' }
              ],
              correctOptionId: 'o2',
              explanation: 'The preposition doesn\'t change in the negative: still "on Sunday".',
              difficulty: 'medium'
            },
            {
              id: 'q9',
              type: 'mcq',
              prompt: 'It often rains ___ summer.',
              options: [
                { id: 'o1', text: 'at' },
                { id: 'o2', text: 'on' },
                { id: 'o3', text: 'in' },
                { id: 'o4', text: 'by' }
              ],
              correctOptionId: 'o3',
              explanation: 'Seasons take "in": "in summer".',
              difficulty: 'medium'
            },
            {
              id: 'q10',
              type: 'mcq',
              prompt: 'Choose the best question for the answer "On June 15th."',
              options: [
                { id: 'o1', text: 'What time is the party?' },
                { id: 'o2', text: 'When is the party?' },
                { id: 'o3', text: 'How is the party?' },
                { id: 'o4', text: 'Who is the party?' }
              ],
              correctOptionId: 'o2',
              explanation: '"When" is the general question word that fits a date answer.',
              difficulty: 'hard'
            },
            {
              id: 'q11',
              type: 'mcq',
              prompt: 'Choose the sentence equivalent to "I sleep during the night."',
              options: [
                { id: 'o1', text: 'I sleep on the night.' },
                { id: 'o2', text: 'I sleep in the night.' },
                { id: 'o3', text: 'I sleep at night.' },
                { id: 'o4', text: 'I sleep by night.' }
              ],
              correctOptionId: 'o3',
              explanation: '"Night" is an exception that uses "at": "at night".',
              difficulty: 'hard'
            },
            {
              id: 'q12',
              type: 'mcq',
              prompt: 'Put in order: "starts / at / class / nine / my"',
              options: [
                { id: 'o1', text: 'My class starts at nine.' },
                { id: 'o2', text: 'At nine my class starts.' },
                { id: 'o3', text: 'My class at nine starts.' },
                { id: 'o4', text: 'Starts my class at nine.' }
              ],
              correctOptionId: 'o1',
              explanation: 'Natural order: subject + verb + preposition + time: "My class starts at nine."',
              difficulty: 'hard'
            }
          ]
        }
      }),
      vocabulary: activity('vocabulary', {
        title: 'Days, Months and Time Words',
        description: 'Words for telling time and talking about dates.',
        vocabulary: [
          { word: 'O\'clock', translation: 'En punto', example: 'It\'s three o\'clock.' },
          { word: 'Quarter past', translation: 'Y cuarto', example: 'It\'s a quarter past three.' },
          { word: 'Half past', translation: 'Y media', example: 'It\'s half past ten.' },
          { word: 'Monday', translation: 'Lunes', example: 'I have class on Monday.' },
          { word: 'Weekend', translation: 'Fin de semana', example: 'I don\'t have school on the weekend.' },
          { word: 'Birthday', translation: 'Cumpleaños', example: 'My birthday is in June.' },
          { word: 'Month', translation: 'Mes', example: 'What month were you born?' },
          { word: 'Today', translation: 'Hoy', example: 'Today is Friday.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "Weekend" mean?', options: ['Semana', 'Fin de semana', 'Cumpleaños', 'Mes'], answer: 1 },
          { type: 'mcq', prompt: 'What does "Half past" mean?', options: ['En punto', 'Y cuarto', 'Y media', 'Menos cuarto'], answer: 2 },
          { type: 'mcq', prompt: 'What does "Birthday" mean?', options: ['Cumpleaños', 'Hoy', 'Mes', 'Lunes'], answer: 0 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'food-and-drinks',
    title: 'Food and Drinks',
    titleEs: 'Comidas y bebidas',
    description: 'Food vocabulary, likes/dislikes, and countable/uncountable nouns.',
    order: 7,
    activities: {
      reading: activity('reading', {
        title: 'Lunch at School',
        description: 'A short text about what a student eats for lunch, in three parts.',
        reading: {
          title: 'Lunch at School',
          parts: [
            'At lunchtime, I usually eat rice, chicken, and some vegetables. My mother cooks a big lunch for the whole family every day. We eat together at the table and talk about our morning. Lunch is my favorite meal of the day.',
            'I love fruit, especially bananas and mangoes. I eat fruit every afternoon as a snack. I don\'t like fish very much, but my brother loves it. He eats fish two or three times a week. We don\'t always like the same food!',
            'For drinks, I have some water or juice with my meals. I don\'t drink coffee because it\'s only for adults. On Fridays, we sometimes have pizza for dinner, and everybody is happy! Pizza with cheese is my favorite kind.'
          ],
          questions: [
            'What does the writer usually eat for lunch?',
            'What fruit does the writer love?',
            'What do they eat on Fridays?'
          ],
          ordering: {
            prompt: 'Put the events of the story in order.',
            events: [
              'The family eats lunch together.',
              'The writer eats fruit in the afternoon.',
              'The writer drinks water or juice with dinner.',
              'The family eats pizza on Friday.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'What does the writer usually eat?', options: ['Pizza', 'Rice, chicken and vegetables', 'Only fruit', 'Fish and rice'], answer: 1 },
          { type: 'mcq', prompt: 'Who loves fish?', options: ['The writer', 'The brother', 'Nobody', 'The teacher'], answer: 1 },
          { type: 'mcq', prompt: 'What do they have on Fridays?', options: ['Fish', 'Coffee', 'Pizza', 'Soup'], answer: 2 },
          { type: 'mcq', prompt: 'When does the writer eat fruit?', options: ['In the morning', 'Every afternoon', 'At night', 'Never'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: The writer\'s favorite meal is lunch.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'True or false: The writer drinks coffee every day.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: The brother eats fish two or three times a week.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'Choose the best word: We eat together and ___ about our morning.', options: ['talk', 'sleep', 'run', 'paint'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'What Would You Like?',
        description: 'Listen to a short conversation at a small restaurant.',
        intro: 'Listen to a waiter and a customer ordering food and drinks at a restaurant.',
        dialogue: [
          { speaker: 'Waiter', line: 'Good afternoon! What would you like to eat?', translation: '¡Buenas tardes! ¿Qué le gustaría comer?' },
          { speaker: 'Customer', line: 'I\'d like some rice and chicken, please.', translation: 'Quisiera arroz y pollo, por favor.' },
          { speaker: 'Waiter', line: 'And would you like something to drink?', translation: '¿Y algo para beber?' },
          { speaker: 'Customer', line: 'Yes, some water, please. No sugar.', translation: 'Sí, agua, por favor. Sin azúcar.' },
          { speaker: 'Waiter', line: 'Do you like fruit? We have mangoes today.', translation: '¿Le gusta la fruta? Hoy tenemos mangos.' },
          { speaker: 'Customer', line: 'Yes, I love mangoes! One, please.', translation: 'Sí, ¡me encantan los mangos! Uno, por favor.' }
        ],
        phrases: ['I\'d like...', 'Would you like...?', 'Do you like...?', 'I love / I don\'t like...'],
        exercises: [
          { type: 'mcq', prompt: 'What does the customer order to eat?', options: ['Fish and salad', 'Rice and chicken', 'Pizza', 'Soup'], answer: 1 },
          { type: 'mcq', prompt: 'What does the customer drink?', options: ['Juice', 'Coffee', 'Water', 'Milk'], answer: 2 },
          { type: 'mcq', prompt: 'Does the customer like mangoes?', options: ['Yes', 'No', 'They don\'t say', 'They are allergic'], answer: 0 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Order Food and Drinks',
        description: 'Practice ordering food like at a restaurant.',
        mission: 'Act out a short restaurant scene: order one food and one drink, and say if you like fruit.',
        phrases: ['I\'d like...', 'Can I have...?', 'I like / I don\'t like...', 'No sugar, please.'],
        dialogue: [
          { speaker: 'You', line: 'I\'d like some rice and chicken, please.', translation: 'Quisiera arroz y pollo, por favor.' },
          { speaker: 'Partner', line: 'Would you like something to drink?', translation: '¿Algo para tomar?' },
          { speaker: 'You', line: 'Yes, some juice, please.', translation: 'Sí, jugo, por favor.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say out loud what food and drink you would like to order at a restaurant.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the restaurant dialogue with a partner, then switch roles (waiter/customer).', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Write About Your Favorite Food',
        description: 'Write sentences about food and drinks you like and don\'t like.',
        mission: 'Write 3-4 sentences about your favorite food, a food you don\'t like, and your favorite drink.',
        phrases: ['My favorite food is...', 'I like...', 'I don\'t like...', 'My favorite drink is...'],
        dialogue: [{ speaker: 'Model', line: 'My favorite food is pizza. I like fruit, but I don\'t like fish. My favorite drink is juice.', translation: 'Mi comida favorita es la pizza. Me gusta la fruta, pero no me gusta el pescado. Mi bebida favorita es el jugo.' }],
        exercises: [
          { type: 'writing', prompt: 'Write 3-4 sentences about the food and drinks you like and don\'t like.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Some, Any and Countable/Uncountable Nouns',
        description: 'Learn how to talk about food using some, any, and countable/uncountable nouns.',
        grammarNote:
          'Goal: tell countable and uncountable food nouns apart, and use "some" and "any" correctly.\n\n' +
          'Rule: countable nouns can be counted one by one (a banana, two bananas); uncountable nouns cannot (rice, water, juice - no plural, no "a/an"). "Some" is for affirmative sentences and offers; "any" is for negatives and most questions.\n\n' +
          'Pattern: Some + noun (affirmative). Any + noun (negative/question). Countable noun + -s for plural; uncountable noun stays the same.\n\n' +
          'Examples:\n1. I\'d like some water.\n2. I have two bananas.\n3. I don\'t have any juice.\n4. Do you have any bananas?\n5. There is some rice in the bowl.\n6. There aren\'t any apples left.\n7. Can I have some bread, please?\n8. We don\'t have any milk.\n\n' +
          'Affirmative: some + noun. Example: "I have some rice for lunch."\n\n' +
          'Negative: any + noun (with don\'t/doesn\'t/isn\'t/aren\'t). Example: "I don\'t have any juice." "There isn\'t any bread."\n\n' +
          'Questions: usually "any" (Do you have any bananas?), but "some" appears in polite offers/requests: "Would you like some water?" "Can I have some rice?"\n\n' +
          'Contractions: don\'t = do not, doesn\'t = does not, isn\'t = is not, aren\'t = are not (all common before "any" in negatives).\n\n' +
          'Common mistakes: ✗ "I have some banana" → ✓ "I have some bananas" (countable plural). ✗ "I don\'t have some juice" → ✓ "I don\'t have any juice" (any in negatives). ✗ "one rice" → ✓ "some rice" (uncountable nouns have no "one/a").\n\n' +
          'Compare: "some" (affirmative/offers) vs "any" (negatives/most questions); countable (can say "how many": bananas, apples) vs uncountable (can say "how much": rice, water, juice).\n\n' +
          'Mini practice: complete with some/any. "I\'d like ___ chicken, please." → some. "We don\'t have ___ vegetables." → any. "Do you want ___ fruit?" → some (an offer).\n\n' +
          'Summary: use "some" in affirmative sentences and polite offers, "any" in negatives and regular questions; remember countable nouns can be plural but uncountable nouns cannot.',
        phrases: ['some water', 'any juice', 'one banana / two bananas', 'I\'d like some...'],
        exercises: [
          { type: 'mcq', prompt: 'I\'d like ___ rice, please.', options: ['some', 'any', 'a', 'many'], answer: 0 },
          { type: 'mcq', prompt: 'I don\'t have ___ juice at home.', options: ['some', 'any', 'a', 'an'], answer: 1 },
          { type: 'mcq', prompt: 'Which word can we count? "I have two ___."', options: ['water', 'rice', 'bananas', 'juice'], answer: 2 },
          { type: 'mcq', prompt: 'Do you have ___ bananas?', options: ['some', 'any', 'a', 'the'], answer: 1 }
        ],
        grammarTest: {
          id: 'english-a1-food-and-drinks-grammar-test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: 'I\'d like ___ rice, please.',
              options: [
                { id: 'o1', text: 'some' },
                { id: 'o2', text: 'any' },
                { id: 'o3', text: 'a' },
                { id: 'o4', text: 'many' }
              ],
              correctOptionId: 'o1',
              explanation: 'A polite affirmative request uses "some": "I\'d like some rice."',
              difficulty: 'easy'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: 'I don\'t have ___ juice at home.',
              options: [
                { id: 'o1', text: 'some' },
                { id: 'o2', text: 'any' },
                { id: 'o3', text: 'a' },
                { id: 'o4', text: 'an' }
              ],
              correctOptionId: 'o2',
              explanation: 'Negative sentences use "any": "I don\'t have any juice."',
              difficulty: 'easy'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: 'Which word can we count? "I have two ___."',
              options: [
                { id: 'o1', text: 'water' },
                { id: 'o2', text: 'rice' },
                { id: 'o3', text: 'juice' },
                { id: 'o4', text: 'bananas' }
              ],
              correctOptionId: 'o4',
              explanation: '"Banana" is countable, so it can have a plural: bananas.',
              difficulty: 'easy'
            },
            {
              id: 'q4',
              type: 'mcq',
              prompt: 'Do you have ___ bananas?',
              options: [
                { id: 'o1', text: 'some' },
                { id: 'o2', text: 'any' },
                { id: 'o3', text: 'a' },
                { id: 'o4', text: 'the' }
              ],
              correctOptionId: 'o2',
              explanation: 'Regular questions use "any": "Do you have any bananas?"',
              difficulty: 'easy'
            },
            {
              id: 'q5',
              type: 'mcq',
              prompt: 'Find the mistake: "I have some banana."',
              options: [
                { id: 'o1', text: 'There is no mistake' },
                { id: 'o2', text: 'It should be "any banana"' },
                { id: 'o3', text: 'It should be "some bananas"' },
                { id: 'o4', text: 'It should be "a bananas"' }
              ],
              correctOptionId: 'o3',
              explanation: '"Banana" is countable, so with "some" it should be plural: "some bananas."',
              difficulty: 'medium'
            },
            {
              id: 'q6',
              type: 'mcq',
              prompt: 'Choose the correct sentence.',
              options: [
                { id: 'o1', text: "I don't have some milk." },
                { id: 'o2', text: "I don't have any milk." },
                { id: 'o3', text: "I don't have a milk." },
                { id: 'o4', text: "I don't have milks." }
              ],
              correctOptionId: 'o2',
              explanation: 'Negative sentences use "any", not "some": "I don\'t have any milk."',
              difficulty: 'medium'
            },
            {
              id: 'q7',
              type: 'mcq',
              prompt: 'A polite offer: "Would you like ___ water?"',
              options: [
                { id: 'o1', text: 'any' },
                { id: 'o2', text: 'some' },
                { id: 'o3', text: 'a' },
                { id: 'o4', text: 'many' }
              ],
              correctOptionId: 'o2',
              explanation: 'Polite offers use "some" even in a question: "Would you like some water?"',
              difficulty: 'medium'
            },
            {
              id: 'q8',
              type: 'mcq',
              prompt: 'Which noun is uncountable?',
              options: [
                { id: 'o1', text: 'apple' },
                { id: 'o2', text: 'rice' },
                { id: 'o3', text: 'banana' },
                { id: 'o4', text: 'egg' }
              ],
              correctOptionId: 'o2',
              explanation: '"Rice" cannot be counted one by one, so it is uncountable.',
              difficulty: 'medium'
            },
            {
              id: 'q9',
              type: 'mcq',
              prompt: 'There ___ any apples left.',
              options: [
                { id: 'o1', text: "isn't" },
                { id: 'o2', text: 'aren\'t' },
                { id: 'o3', text: "don't" },
                { id: 'o4', text: "doesn't" }
              ],
              correctOptionId: 'o2',
              explanation: '"Apples" is plural, so we use "there aren\'t any".',
              difficulty: 'medium'
            },
            {
              id: 'q10',
              type: 'mcq',
              prompt: 'Choose the sentence equivalent to "We have zero milk at home."',
              options: [
                { id: 'o1', text: "We don't have any milk." },
                { id: 'o2', text: 'We have some milk.' },
                { id: 'o3', text: 'We have a milk.' },
                { id: 'o4', text: 'We have any milk.' }
              ],
              correctOptionId: 'o1',
              explanation: '"Zero milk" means none, so the negative "don\'t have any milk" fits.',
              difficulty: 'hard'
            },
            {
              id: 'q11',
              type: 'mcq',
              prompt: 'Which question word goes with an uncountable noun like water?',
              options: [
                { id: 'o1', text: 'How many' },
                { id: 'o2', text: 'How much' },
                { id: 'o3', text: 'How old' },
                { id: 'o4', text: 'How long' }
              ],
              correctOptionId: 'o2',
              explanation: 'Uncountable nouns use "How much": "How much water do you want?"',
              difficulty: 'hard'
            },
            {
              id: 'q12',
              type: 'mcq',
              prompt: 'Put in order: "some / like / I\'d / chicken"',
              options: [
                { id: 'o1', text: "I'd like some chicken." },
                { id: 'o2', text: "Some I'd like chicken." },
                { id: 'o3', text: "I'd chicken like some." },
                { id: 'o4', text: "Like I'd some chicken." }
              ],
              correctOptionId: 'o1',
              explanation: 'Natural order: subject + verb + some + noun: "I\'d like some chicken."',
              difficulty: 'hard'
            }
          ]
        }
      }),
      vocabulary: activity('vocabulary', {
        title: 'Food and Drink Words',
        description: 'Common words for food and drinks.',
        vocabulary: [
          { word: 'Rice', translation: 'Arroz', example: 'I usually eat rice for lunch.' },
          { word: 'Chicken', translation: 'Pollo', example: 'She likes chicken with vegetables.' },
          { word: 'Fruit', translation: 'Fruta', example: 'I love fruit, especially mangoes.' },
          { word: 'Vegetables', translation: 'Verduras', example: 'Vegetables are good for you.' },
          { word: 'Water', translation: 'Agua', example: 'Can I have some water, please?' },
          { word: 'Juice', translation: 'Jugo', example: 'I like orange juice.' },
          { word: 'Breakfast', translation: 'Desayuno', example: 'What do you eat for breakfast?' },
          { word: 'Hungry', translation: 'Tener hambre', example: 'I am hungry, let\'s eat.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "Vegetables" mean?', options: ['Verduras', 'Fruta', 'Pollo', 'Arroz'], answer: 0 },
          { type: 'mcq', prompt: 'What does "Hungry" mean?', options: ['Tener sed', 'Tener hambre', 'Comer', 'Beber'], answer: 1 },
          { type: 'mcq', prompt: 'What does "Juice" mean?', options: ['Agua', 'Leche', 'Jugo', 'Café'], answer: 2 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'my-home',
    title: 'My Home',
    titleEs: 'Mi hogar',
    description: 'Rooms, furniture, and prepositions of place.',
    order: 8,
    activities: {
      reading: activity('reading', {
        title: 'My House',
        description: 'A short text describing the rooms in a house, in three parts.',
        reading: {
          title: 'My House',
          parts: [
            'My house has five rooms: a kitchen, a living room, two bedrooms, and a bathroom. The kitchen is next to the living room, and it is always warm because my mother cooks there every day. Our house is small, but very comfortable.',
            'In my bedroom, there is a bed, a desk, and a small closet. My bed is next to the window, so I can see the garden. I keep my clothes in the closet and my books on the desk. I share my bedroom with my sister.',
            'My favorite room is the living room because there is a big sofa and a television. We watch movies there on weekends. Our cat, Luna, is usually under the table in the kitchen, but sometimes she sleeps on the sofa too. I love my home.'
          ],
          questions: [
            'How many rooms does the house have?',
            'What is in the writer\'s bedroom?',
            'Where is the cat usually?'
          ],
          ordering: {
            prompt: 'Put the events of the story in order.',
            events: [
              'The writer wakes up in her bedroom.',
              'Mother cooks in the warm kitchen.',
              'The family watches a movie in the living room.',
              'Luna the cat sleeps under the kitchen table.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'How many bedrooms are there?', options: ['One', 'Two', 'Three', 'Four'], answer: 1 },
          { type: 'mcq', prompt: 'What is the favorite room?', options: ['The kitchen', 'The bedroom', 'The living room', 'The bathroom'], answer: 2 },
          { type: 'mcq', prompt: 'Where is Luna the cat usually?', options: ['On the bed', 'Under the table', 'In the closet', 'On the sofa'], answer: 1 },
          { type: 'mcq', prompt: 'Who does the writer share a bedroom with?', options: ['Her mother', 'Her sister', 'Her father', 'Nobody'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: The kitchen is always warm.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'True or false: The house has ten rooms.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: The family watches movies in the living room.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'Choose the best word: Our house is small, but very ___.', options: ['comfortable', 'cold', 'empty', 'dangerous'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Where Is My Backpack?',
        description: 'Listen to a family looking for a missing backpack.',
        intro: 'Listen to Marco asking his mother where his backpack is before school.',
        dialogue: [
          { speaker: 'Marco', line: 'Mom, where is my backpack?', translation: 'Mamá, ¿dónde está mi mochila?' },
          { speaker: 'Mother', line: 'Is it under your bed?', translation: '¿Está debajo de tu cama?' },
          { speaker: 'Marco', line: 'No, it isn\'t there.', translation: 'No, no está ahí.' },
          { speaker: 'Mother', line: 'Look next to the door, in the living room.', translation: 'Mira al lado de la puerta, en la sala.' },
          { speaker: 'Marco', line: 'Yes! It\'s here, next to the sofa!', translation: '¡Sí! Está aquí, al lado del sofá.' },
          { speaker: 'Mother', line: 'Good. Now put your shoes on!', translation: 'Bien. ¡Ahora ponte los zapatos!' }
        ],
        phrases: ['Where is my...?', 'Is it under/next to...?', 'It\'s in the...', 'It\'s here!'],
        exercises: [
          { type: 'mcq', prompt: 'Where does Marco look first?', options: ['In the kitchen', 'Under his bed', 'In the bathroom', 'In the closet'], answer: 1 },
          { type: 'mcq', prompt: 'Where is the backpack finally?', options: ['Under the bed', 'In the kitchen', 'Next to the sofa', 'In the bedroom'], answer: 2 },
          { type: 'mcq', prompt: 'What does the mother say at the end?', options: ['Eat breakfast', 'Put your shoes on', 'Go to bed', 'Do your homework'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Describe Your Room',
        description: 'Practice describing where things are in your room.',
        mission: 'Describe your bedroom to a partner: name two things in it and where they are.',
        phrases: ['There is a... in my room.', 'It\'s next to/under/on the...', 'My favorite room is...', 'Where is your...?'],
        dialogue: [
          { speaker: 'You', line: 'There is a bed and a desk in my room.', translation: 'Hay una cama y un escritorio en mi habitación.' },
          { speaker: 'Partner', line: 'Where is the desk?', translation: '¿Dónde está el escritorio?' },
          { speaker: 'You', line: 'It\'s next to the window.', translation: 'Está al lado de la ventana.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Describe your bedroom out loud: name two objects and where they are.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Ask a partner "What is your favorite room?" and why.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Write About Your House',
        description: 'Write sentences describing the rooms in your house.',
        mission: 'Write 4 sentences describing your house: how many rooms, your favorite room, and where one piece of furniture is.',
        phrases: ['My house has...', 'My favorite room is...', 'There is a...', 'It\'s in/next to/under...'],
        dialogue: [{ speaker: 'Model', line: 'My house has four rooms. My favorite room is the living room. There is a big sofa next to the window.', translation: 'Mi casa tiene cuatro habitaciones. Mi habitación favorita es la sala. Hay un sofá grande al lado de la ventana.' }],
        exercises: [
          { type: 'writing', prompt: 'Write 4 sentences describing your house, your favorite room, and where one object is.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Prepositions of Place',
        description: 'Learn in, on, under, next to, and behind to describe where things are.',
        grammarNote:
          'Goal: describe where things are in a house using prepositions of place.\n\n' +
          'Rule: prepositions of place tell us the exact position of something: in (inside), on (on top of a surface), under (below), next to (at the side of), behind (at the back of).\n\n' +
          'Pattern: Subject + is/are + preposition + the + place/object.\n\n' +
          'Examples:\n1. The cat is under the table.\n2. My backpack is next to the sofa.\n3. My books are on the desk.\n4. My clothes are in the closet.\n5. The lamp is behind the TV.\n6. My bed is next to the window.\n7. The keys are on the table.\n8. The shoes are under the bed.\n\n' +
          'Affirmative: subject + is/are + preposition + place. Example: "The sofa is in the living room."\n\n' +
          'Negative: subject + isn\'t/aren\'t + preposition + place. Example: "The cat isn\'t under the bed." "The books aren\'t on the table."\n\n' +
          'Questions: "Where is/are...?" Example: "Where is my backpack?" - "It\'s next to the sofa." "Where are my shoes?" - "They\'re under the bed."\n\n' +
          'Contractions: it\'s = it is, they\'re = they are, isn\'t = is not, aren\'t = are not.\n\n' +
          'Common mistakes: ✗ "The cat is in the table" → ✓ "The cat is under the table" (in means inside something, not on top or below). ✗ "My backpack is at next to the sofa" → ✓ "My backpack is next to the sofa" (no extra "at" needed). ✗ "Where my backpack is?" → ✓ "Where is my backpack?" (verb before subject in questions).\n\n' +
          'Compare: "in" = inside a closed space (in the closet); "on" = touching a surface from above (on the table); "under" = below something (under the bed); "next to" = beside; "behind" = at the back.\n\n' +
          'Mini practice: complete with in/on/under/next to/behind. "My shoes are ___ the bed." → under. "The lamp is ___ the desk." → on. "My room is ___ the bathroom." → next to.\n\n' +
          'Summary: use in/on/under/next to/behind + the + place to say exactly where something is, and ask with "Where is/are...?" to find out.',
        phrases: ['in the kitchen', 'on the table', 'under the bed', 'next to the door'],
        exercises: [
          { type: 'mcq', prompt: 'The cat is ___ the table. (below it)', options: ['on', 'in', 'under', 'next to'], answer: 2 },
          { type: 'mcq', prompt: 'My books are ___ the desk. (on top of it)', options: ['on', 'under', 'behind', 'in'], answer: 0 },
          { type: 'mcq', prompt: 'The backpack is ___ the sofa. (at the side of it)', options: ['under', 'on', 'next to', 'in'], answer: 2 },
          { type: 'mcq', prompt: 'My clothes are ___ the closet. (inside it)', options: ['in', 'on', 'under', 'next to'], answer: 0 }
        ],
        grammarTest: {
          id: 'english-a1-my-home-grammar-test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: 'The cat is ___ the table. (below it)',
              options: [
                { id: 'o1', text: 'on' },
                { id: 'o2', text: 'in' },
                { id: 'o3', text: 'under' },
                { id: 'o4', text: 'next to' }
              ],
              correctOptionId: 'o3',
              explanation: 'Below something is "under".',
              difficulty: 'easy'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: 'My books are ___ the desk. (on top of it)',
              options: [
                { id: 'o1', text: 'under' },
                { id: 'o2', text: 'on' },
                { id: 'o3', text: 'behind' },
                { id: 'o4', text: 'in' }
              ],
              correctOptionId: 'o2',
              explanation: 'On top of a surface is "on".',
              difficulty: 'easy'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: 'The backpack is ___ the sofa. (at the side of it)',
              options: [
                { id: 'o1', text: 'under' },
                { id: 'o2', text: 'on' },
                { id: 'o3', text: 'next to' },
                { id: 'o4', text: 'in' }
              ],
              correctOptionId: 'o3',
              explanation: 'Beside something is "next to".',
              difficulty: 'easy'
            },
            {
              id: 'q4',
              type: 'mcq',
              prompt: 'My clothes are ___ the closet. (inside it)',
              options: [
                { id: 'o1', text: 'in' },
                { id: 'o2', text: 'on' },
                { id: 'o3', text: 'under' },
                { id: 'o4', text: 'next to' }
              ],
              correctOptionId: 'o1',
              explanation: 'Inside a closed space is "in".',
              difficulty: 'easy'
            },
            {
              id: 'q5',
              type: 'mcq',
              prompt: 'Find the mistake: "The cat is in the table."',
              options: [
                { id: 'o1', text: 'There is no mistake' },
                { id: 'o2', text: 'It should be "on the table" or "under the table"' },
                { id: 'o3', text: 'It should be "the cat are"' },
                { id: 'o4', text: 'It should be "table in the cat"' }
              ],
              correctOptionId: 'o2',
              explanation: '"In" means inside a closed space; a table\'s surface is "on" and beneath it is "under".',
              difficulty: 'medium'
            },
            {
              id: 'q6',
              type: 'mcq',
              prompt: 'Choose the correct negative sentence.',
              options: [
                { id: 'o1', text: "The cat don't under the bed." },
                { id: 'o2', text: "The cat isn't under the bed." },
                { id: 'o3', text: "The cat not is under the bed." },
                { id: 'o4', text: "The cat aren't under the bed." }
              ],
              correctOptionId: 'o2',
              explanation: '"The cat" is singular (it), so the negative is "isn\'t".',
              difficulty: 'medium'
            },
            {
              id: 'q7',
              type: 'mcq',
              prompt: 'Which question is correct?',
              options: [
                { id: 'o1', text: 'Where my backpack is?' },
                { id: 'o2', text: 'Where is my backpack?' },
                { id: 'o3', text: 'My backpack where is?' },
                { id: 'o4', text: 'Is where my backpack?' }
              ],
              correctOptionId: 'o2',
              explanation: 'Questions move the verb before the subject: "Where is my backpack?"',
              difficulty: 'medium'
            },
            {
              id: 'q8',
              type: 'mcq',
              prompt: 'A: "Where are my shoes?" B: "They\'re ___ the bed."',
              options: [
                { id: 'o1', text: 'under' },
                { id: 'o2', text: 'is under' },
                { id: 'o3', text: 'are under' },
                { id: 'o4', text: 'under is' }
              ],
              correctOptionId: 'o1',
              explanation: 'After "They\'re" we just add the preposition and place: "They\'re under the bed."',
              difficulty: 'medium'
            },
            {
              id: 'q9',
              type: 'mcq',
              prompt: 'The lamp is ___ the TV. (at the back of it)',
              options: [
                { id: 'o1', text: 'next to' },
                { id: 'o2', text: 'on' },
                { id: 'o3', text: 'under' },
                { id: 'o4', text: 'behind' }
              ],
              correctOptionId: 'o4',
              explanation: 'At the back of something is "behind".',
              difficulty: 'medium'
            },
            {
              id: 'q10',
              type: 'mcq',
              prompt: 'Choose the sentence equivalent to "The sofa is inside the living room."',
              options: [
                { id: 'o1', text: 'The sofa is on the living room.' },
                { id: 'o2', text: 'The sofa is in the living room.' },
                { id: 'o3', text: 'The sofa is under the living room.' },
                { id: 'o4', text: 'The sofa is next the living room.' }
              ],
              correctOptionId: 'o2',
              explanation: '"Inside" a room is expressed with "in".',
              difficulty: 'hard'
            },
            {
              id: 'q11',
              type: 'mcq',
              prompt: 'Choose the correct order: "next to / is / my bed / the window"',
              options: [
                { id: 'o1', text: 'My bed is next to the window.' },
                { id: 'o2', text: 'Next to my bed is the window.' },
                { id: 'o3', text: 'My bed next to is the window.' },
                { id: 'o4', text: 'Is my bed the window next to.' }
              ],
              correctOptionId: 'o1',
              explanation: 'Natural order: subject + is + preposition + place: "My bed is next to the window."',
              difficulty: 'hard'
            },
            {
              id: 'q12',
              type: 'mcq',
              prompt: 'What is the short form of "they are" in "They\'re under the bed"?',
              options: [
                { id: 'o1', text: 'they is' },
                { id: 'o2', text: 'they are' },
                { id: 'o3', text: "they're" },
                { id: 'o4', text: 'there' }
              ],
              correctOptionId: 'o3',
              explanation: '"They are" contracts to "they\'re".',
              difficulty: 'hard'
            }
          ]
        }
      }),
      vocabulary: activity('vocabulary', {
        title: 'Rooms and Furniture',
        description: 'Words for rooms and furniture in a house.',
        vocabulary: [
          { word: 'Kitchen', translation: 'Cocina', example: 'We eat breakfast in the kitchen.' },
          { word: 'Bedroom', translation: 'Dormitorio', example: 'My bedroom is small but nice.' },
          { word: 'Living room', translation: 'Sala', example: 'We watch TV in the living room.' },
          { word: 'Bathroom', translation: 'Baño', example: 'The bathroom is next to my room.' },
          { word: 'Bed', translation: 'Cama', example: 'My bed is next to the window.' },
          { word: 'Sofa', translation: 'Sofá', example: 'The cat sleeps on the sofa.' },
          { word: 'Closet', translation: 'Clóset / armario', example: 'My clothes are in the closet.' },
          { word: 'Table', translation: 'Mesa', example: 'The books are on the table.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "Bedroom" mean?', options: ['Cocina', 'Dormitorio', 'Sala', 'Baño'], answer: 1 },
          { type: 'mcq', prompt: 'What does "Closet" mean?', options: ['Mesa', 'Cama', 'Clóset / armario', 'Sofá'], answer: 2 },
          { type: 'mcq', prompt: 'What does "Living room" mean?', options: ['Sala', 'Baño', 'Cocina', 'Dormitorio'], answer: 0 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'my-town',
    title: 'My Town',
    titleEs: 'Mi ciudad',
    description: 'Places in town and giving directions.',
    order: 9,
    activities: {
      reading: activity('reading', {
        title: 'My Neighborhood',
        description: 'A short text about the places near a student\'s home, in three parts.',
        reading: {
          title: 'My Neighborhood',
          parts: [
            'There is a small park near my house, and I play there with my friends every afternoon. There is also a supermarket, a bakery, and a pharmacy on my street. The bakery smells wonderful in the morning because they bake fresh bread.',
            'My school is not far; it is only a ten-minute walk. I walk there every day with my neighbor. Next to my school, there is a small bookstore where I buy notebooks and pencils. My town also has a beautiful library with many books.',
            'On Saturdays, my family goes to the market to buy fresh fruit and vegetables. The market is busy and colorful, with many friendly sellers. I like my neighborhood because everything is close, and I know almost everybody who lives here.'
          ],
          questions: [
            'What places are on the writer\'s street?',
            'How far is the school?',
            'What do they buy at the market?'
          ],
          ordering: {
            prompt: 'Put the events of the story in order.',
            events: [
              'The writer plays in the park with friends.',
              'The writer walks to school with a neighbor.',
              'The writer buys notebooks at the bookstore.',
              'The family shops at the market on Saturday.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'What is near the writer\'s house?', options: ['A beach', 'A park', 'A mountain', 'A river'], answer: 1 },
          { type: 'mcq', prompt: 'How far is the school?', options: ['A ten-minute walk', 'One hour', 'Very far', 'They don\'t say'], answer: 0 },
          { type: 'mcq', prompt: 'Where do they buy fruit and vegetables?', options: ['The bakery', 'The pharmacy', 'The market', 'The school'], answer: 2 },
          { type: 'mcq', prompt: 'What is next to the school?', options: ['A bakery', 'A bookstore', 'A bank', 'A hospital'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: The bakery smells good in the morning.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'True or false: The writer walks to school alone.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: The market is quiet and empty on Saturdays.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'Choose the best word: The market is busy and ___, with many sellers.', options: ['colorful', 'boring', 'silent', 'empty'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Excuse Me, Where Is the Bank?',
        description: 'Listen to someone asking for directions in town.',
        intro: 'Listen to a tourist asking a local person for directions to the bank.',
        dialogue: [
          { speaker: 'Tourist', line: 'Excuse me, where is the bank, please?', translation: 'Disculpe, ¿dónde está el banco, por favor?' },
          { speaker: 'Local', line: 'Go straight and turn left at the supermarket.', translation: 'Siga derecho y doble a la izquierda en el supermercado.' },
          { speaker: 'Tourist', line: 'Turn left at the supermarket. Is it far?', translation: 'Doblar a la izquierda en el supermercado. ¿Está lejos?' },
          { speaker: 'Local', line: 'No, it\'s not far. It\'s next to the park.', translation: 'No, no está lejos. Está al lado del parque.' },
          { speaker: 'Tourist', line: 'Thank you very much!', translation: '¡Muchas gracias!' },
          { speaker: 'Local', line: 'You\'re welcome. Have a nice day!', translation: 'De nada. ¡Que tenga un buen día!' }
        ],
        phrases: ['Excuse me, where is...?', 'Go straight.', 'Turn left/right.', 'Is it far?'],
        exercises: [
          { type: 'mcq', prompt: 'What is the tourist looking for?', options: ['A park', 'A bank', 'A school', 'A market'], answer: 1 },
          { type: 'mcq', prompt: 'Where should the tourist turn left?', options: ['At the park', 'At the bakery', 'At the supermarket', 'At the school'], answer: 2 },
          { type: 'mcq', prompt: 'Is the bank far?', options: ['Yes, very far', 'No, it\'s close', 'They don\'t know', 'It\'s closed'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Ask for Directions',
        description: 'Practice asking for and giving simple directions.',
        mission: 'Ask a partner for directions to a place in your town and give them directions to another place.',
        phrases: ['Excuse me, where is...?', 'Go straight.', 'Turn left/right.', 'It\'s next to/near...'],
        dialogue: [
          { speaker: 'You', line: 'Excuse me, where is the supermarket?', translation: 'Disculpe, ¿dónde está el supermercado?' },
          { speaker: 'Partner', line: 'Go straight and turn right. It\'s next to the park.', translation: 'Siga derecho y doble a la derecha. Está al lado del parque.' },
          { speaker: 'You', line: 'Thank you very much!', translation: '¡Muchas gracias!' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say out loud directions from your house to your school.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice asking "Where is the...?" and giving directions with a partner, then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Write About Your Neighborhood',
        description: 'Write sentences describing the places near your home.',
        mission: 'Write 3-4 sentences about the places near your house and how far your school is.',
        phrases: ['There is a... near my house.', 'It\'s next to...', 'My school is a ... walk.', 'I like my neighborhood because...'],
        dialogue: [{ speaker: 'Model', line: 'There is a park near my house. There is also a supermarket next to the park. My school is a ten-minute walk.', translation: 'Hay un parque cerca de mi casa. También hay un supermercado al lado del parque. Mi escuela está a diez minutos caminando.' }],
        exercises: [
          { type: 'writing', prompt: 'Write 3-4 sentences about the places near your house and how far your school is.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Imperatives for Directions',
        description: 'Learn to give instructions using the imperative form.',
        grammarNote:
          'Goal: give directions and simple instructions using the imperative.\n\n' +
          'Rule: the imperative uses the base form of the verb, with no subject and no -s, even when talking to one person or many. It gives an order, instruction or direction directly.\n\n' +
          'Pattern: Verb (base form) + rest of the sentence. Negative: Don\'t + verb + rest.\n\n' +
          'Examples:\n1. Go straight.\n2. Turn left at the bank.\n3. Cross the street.\n4. Open your book.\n5. Listen carefully.\n6. Turn right at the corner.\n7. Don\'t turn right, turn left.\n8. Walk two blocks and stop.\n\n' +
          'Affirmative: verb + rest of sentence, no subject. Example: "Turn left at the supermarket."\n\n' +
          'Negative: Don\'t + verb + rest of sentence. Example: "Don\'t cross here." "Don\'t turn right."\n\n' +
          'Questions: imperatives don\'t use questions to give orders, but we can ask for directions with "How do I get to...?" or "Where is...?" and the answer is often an imperative: "Turn left and go straight."\n\n' +
          'Contractions: don\'t = do not (the only contraction used with imperatives).\n\n' +
          'Common mistakes: ✗ "You go straight" → ✓ "Go straight" (no subject in an imperative). ✗ "Goes straight" → ✓ "Go straight" (no -s, always the base form). ✗ "Not turn right" → ✓ "Don\'t turn right" (use "don\'t", not "not", to make it negative).\n\n' +
          'Compare: a statement describes a fact ("You go straight" = habit), while an imperative gives an instruction ("Go straight!" = command) - same verb, very different use, and the imperative drops the subject completely.\n\n' +
          'Mini practice: give these instructions. "(turn) ___ left here." → Turn left here. "(not/cross) ___ now, the light is red." → Don\'t cross now, the light is red.\n\n' +
          'Summary: use the base verb with no subject to give an instruction (Go, Turn, Cross); add "don\'t" before the verb to make it negative.',
        phrases: ['Go straight.', 'Turn left/right.', 'Cross the street.', 'Don\'t turn right.'],
        exercises: [
          { type: 'mcq', prompt: 'Which sentence gives a direction correctly?', options: ['You go straight.', 'Go straight.', 'Going straight.', 'Goes straight.'], answer: 1 },
          { type: 'mcq', prompt: '___ left at the supermarket.', options: ['Turn', 'Turns', 'Turning', 'To turn'], answer: 0 },
          { type: 'mcq', prompt: 'Choose the negative instruction.', options: ['Don\'t turn right.', 'Not turn right.', 'No turn right.', 'Turn not right.'], answer: 0 },
          { type: 'mcq', prompt: 'Which is a classroom instruction?', options: ['I open my book.', 'Open your book.', 'Opening the book.', 'Books are open.'], answer: 1 }
        ],
        grammarTest: {
          id: 'english-a1-my-town-grammar-test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: 'Which sentence gives a direction correctly?',
              options: [
                { id: 'o1', text: 'You go straight.' },
                { id: 'o2', text: 'Go straight.' },
                { id: 'o3', text: 'Going straight.' },
                { id: 'o4', text: 'Goes straight.' }
              ],
              correctOptionId: 'o2',
              explanation: 'Imperatives use the base verb with no subject: "Go straight."',
              difficulty: 'easy'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: '___ left at the supermarket.',
              options: [
                { id: 'o1', text: 'Turn' },
                { id: 'o2', text: 'Turns' },
                { id: 'o3', text: 'Turning' },
                { id: 'o4', text: 'To turn' }
              ],
              correctOptionId: 'o1',
              explanation: 'The base form of the verb starts an imperative: "Turn left."',
              difficulty: 'easy'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: 'Choose the negative instruction.',
              options: [
                { id: 'o1', text: "Don't turn right." },
                { id: 'o2', text: 'Not turn right.' },
                { id: 'o3', text: 'No turn right.' },
                { id: 'o4', text: 'Turn not right.' }
              ],
              correctOptionId: 'o1',
              explanation: 'The negative imperative uses "Don\'t" + verb.',
              difficulty: 'easy'
            },
            {
              id: 'q4',
              type: 'mcq',
              prompt: 'Which is a classroom instruction?',
              options: [
                { id: 'o1', text: 'I open my book.' },
                { id: 'o2', text: 'Open your book.' },
                { id: 'o3', text: 'Opening the book.' },
                { id: 'o4', text: 'Books are open.' }
              ],
              correctOptionId: 'o2',
              explanation: 'An instruction uses the base verb with no subject: "Open your book."',
              difficulty: 'easy'
            },
            {
              id: 'q5',
              type: 'mcq',
              prompt: 'Find the mistake: "You cross the street now."',
              options: [
                { id: 'o1', text: 'There is no mistake' },
                { id: 'o2', text: 'As an instruction, it should be "Cross the street now."' },
                { id: 'o3', text: 'It should be "Crosses the street now."' },
                { id: 'o4', text: 'It should be "Crossing the street now."' }
              ],
              correctOptionId: 'o2',
              explanation: 'Imperatives drop the subject "you": "Cross the street now."',
              difficulty: 'medium'
            },
            {
              id: 'q6',
              type: 'mcq',
              prompt: 'Choose the correct instruction meaning "please listen with attention."',
              options: [
                { id: 'o1', text: 'You listen carefully.' },
                { id: 'o2', text: 'Listen carefully.' },
                { id: 'o3', text: 'Listens carefully.' },
                { id: 'o4', text: 'Listening carefully.' }
              ],
              correctOptionId: 'o2',
              explanation: 'The imperative is the base verb alone: "Listen carefully."',
              difficulty: 'medium'
            },
            {
              id: 'q7',
              type: 'mcq',
              prompt: 'A: "How do I get to the bank?" B: "___ straight and turn left."',
              options: [
                { id: 'o1', text: 'You go' },
                { id: 'o3', text: 'Goes' },
                { id: 'o2', text: 'Go' },
                { id: 'o4', text: 'Going' }
              ],
              correctOptionId: 'o2',
              explanation: 'Directions are given as imperatives: "Go straight and turn left."',
              difficulty: 'medium'
            },
            {
              id: 'q8',
              type: 'mcq',
              prompt: 'Choose the equivalent instruction to "Please don\'t cross here."',
              options: [
                { id: 'o1', text: 'Not cross here.' },
                { id: 'o2', text: "Don't cross here." },
                { id: 'o3', text: 'No crosses here.' },
                { id: 'o4', text: 'Crossing not here.' }
              ],
              correctOptionId: 'o2',
              explanation: '"Don\'t" + base verb is the correct negative imperative.',
              difficulty: 'medium'
            },
            {
              id: 'q9',
              type: 'mcq',
              prompt: 'Complete the dialogue: A: "Excuse me, where is the park?" B: "___ two blocks and turn right."',
              options: [
                { id: 'o2', text: 'You walk' },
                { id: 'o3', text: 'Walks' },
                { id: 'o4', text: 'Walked' },
                { id: 'o1', text: 'Walk' }
              ],
              correctOptionId: 'o1',
              explanation: 'Giving directions uses the base verb form: "Walk two blocks..."',
              difficulty: 'medium'
            },
            {
              id: 'q10',
              type: 'mcq',
              prompt: 'Put in order: "left / at / turn / the bank"',
              options: [
                { id: 'o1', text: 'Turn left at the bank.' },
                { id: 'o2', text: 'At the bank turn left.' },
                { id: 'o3', text: 'Left turn at the bank.' },
                { id: 'o4', text: 'Turn at the bank left.' }
              ],
              correctOptionId: 'o1',
              explanation: 'Natural order for directions: verb + direction + at + place: "Turn left at the bank."',
              difficulty: 'hard'
            },
            {
              id: 'q11',
              type: 'mcq',
              prompt: 'Which sentence is a fact/habit, NOT an instruction?',
              options: [
                { id: 'o1', text: 'Go straight.' },
                { id: 'o2', text: 'She goes straight home after school.' },
                { id: 'o3', text: 'Turn left.' },
                { id: 'o4', text: "Don't turn right." }
              ],
              correctOptionId: 'o2',
              explanation: '"She goes..." has a subject and -s: it is a present simple statement, not an imperative.',
              difficulty: 'hard'
            },
            {
              id: 'q12',
              type: 'mcq',
              prompt: 'Choose the best classroom instruction for a teacher wanting quiet.',
              options: [
                { id: 'o1', text: 'You are quiet.' },
                { id: 'o2', text: 'Be quiet, please.' },
                { id: 'o3', text: 'Quiet are you.' },
                { id: 'o4', text: 'Being quiet.' }
              ],
              correctOptionId: 'o2',
              explanation: '"Be" is the base form of "to be", so the imperative is "Be quiet."',
              difficulty: 'hard'
            }
          ]
        }
      }),
      vocabulary: activity('vocabulary', {
        title: 'Places in Town',
        description: 'Words for common places and directions.',
        vocabulary: [
          { word: 'Park', translation: 'Parque', example: 'I play in the park with my friends.' },
          { word: 'Supermarket', translation: 'Supermercado', example: 'We buy food at the supermarket.' },
          { word: 'Bank', translation: 'Banco', example: 'The bank is next to the park.' },
          { word: 'Bakery', translation: 'Panadería', example: 'The bakery has fresh bread.' },
          { word: 'Pharmacy', translation: 'Farmacia', example: 'There is a pharmacy on my street.' },
          { word: 'Straight', translation: 'Derecho / recto', example: 'Go straight for two blocks.' },
          { word: 'Near', translation: 'Cerca', example: 'My school is near my house.' },
          { word: 'Far', translation: 'Lejos', example: 'The market is not far.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "Pharmacy" mean?', options: ['Panadería', 'Farmacia', 'Banco', 'Parque'], answer: 1 },
          { type: 'mcq', prompt: 'What does "Near" mean?', options: ['Lejos', 'Cerca', 'Derecho', 'Parque'], answer: 1 },
          { type: 'mcq', prompt: 'What does "Straight" mean?', options: ['Derecho / recto', 'Lejos', 'Cerca', 'Banco'], answer: 0 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'free-time',
    title: 'Free Time',
    titleEs: 'Tiempo libre',
    description: 'Hobbies, sports and adverbs of frequency.',
    order: 10,
    activities: {
      reading: activity('reading', {
        title: 'My Weekend',
        description: 'A short text about how a student spends the weekend, in three parts.',
        reading: {
          title: 'My Weekend',
          parts: [
            'On weekends, I usually play soccer with my friends in the park. We play for almost two hours, and it is great exercise. I always watch a movie on Friday night with my family. We choose a different movie every week and eat popcorn together.',
            'I sometimes read books on Saturday afternoon, especially adventure stories. But I never do homework on Sunday morning! Sunday morning is only for relaxing and having a big breakfast with my family. I finish my homework on Sunday evening instead.',
            'My sister usually plays the guitar, and she is very good at it. She practices every weekend and sometimes plays songs for the family. Free time is important because it makes me happy and helps me relax after a busy week at school.'
          ],
          questions: [
            'What does the writer usually do on weekends?',
            'What does the family always do on Friday night?',
            'What does the sister do in her free time?'
          ],
          ordering: {
            prompt: 'Put the events of the story in order.',
            events: [
              'The writer plays soccer with friends.',
              'The family watches a movie on Friday night.',
              'The writer reads a book on Saturday afternoon.',
              'The sister plays guitar for the family.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'What does the writer usually play?', options: ['Guitar', 'Soccer', 'Chess', 'Basketball'], answer: 1 },
          { type: 'mcq', prompt: 'What do they always do on Friday night?', options: ['Play soccer', 'Read books', 'Watch a movie', 'Do homework'], answer: 2 },
          { type: 'mcq', prompt: 'What does the writer never do on Sunday morning?', options: ['Sleep', 'Homework', 'Play soccer', 'Watch TV'], answer: 1 },
          { type: 'mcq', prompt: 'When does the writer finish homework?', options: ['Saturday morning', 'Sunday morning', 'Sunday evening', 'Friday night'], answer: 2 },
          { type: 'mcq', prompt: 'True or false: The writer plays soccer for two hours on weekends.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'True or false: The sister never plays guitar.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: The family eats popcorn on movie night.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'Choose the best word: Sunday morning is only for ___ and having a big breakfast.', options: ['relaxing', 'working', 'studying', 'shopping'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'What Do You Do in Your Free Time?',
        description: 'Listen to two friends talking about their hobbies.',
        intro: 'Listen to Ana and Leo talking about what they usually do in their free time.',
        dialogue: [
          { speaker: 'Ana', line: 'What do you usually do in your free time, Leo?', translation: '¿Qué haces normalmente en tu tiempo libre, Leo?' },
          { speaker: 'Leo', line: 'I usually play video games. And you?', translation: 'Normalmente juego videojuegos. ¿Y tú?' },
          { speaker: 'Ana', line: 'I sometimes paint, and I always read before bed.', translation: 'A veces pinto, y siempre leo antes de dormir.' },
          { speaker: 'Leo', line: 'Do you play any sports?', translation: '¿Practicas algún deporte?' },
          { speaker: 'Ana', line: 'Yes, I play basketball on Saturdays.', translation: 'Sí, juego baloncesto los sábados.' },
          { speaker: 'Leo', line: 'I never play basketball, but I love swimming!', translation: 'Yo nunca juego baloncesto, ¡pero me encanta nadar!' }
        ],
        phrases: ['What do you usually do?', 'I sometimes/always/never...', 'Do you play any sports?', 'I love...'],
        exercises: [
          { type: 'mcq', prompt: 'What does Leo usually do?', options: ['Read', 'Paint', 'Play video games', 'Play basketball'], answer: 2 },
          { type: 'mcq', prompt: 'When does Ana play basketball?', options: ['Every day', 'On Saturdays', 'Never', 'On Fridays'], answer: 1 },
          { type: 'mcq', prompt: 'What does Leo love?', options: ['Painting', 'Reading', 'Swimming', 'Basketball'], answer: 2 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Talk About Your Hobbies',
        description: 'Practice talking about your free time activities.',
        mission: 'Tell a partner two things you usually do in your free time and one thing you never do.',
        phrases: ['I usually...', 'I sometimes...', 'I never...', 'What do you like doing?'],
        dialogue: [
          { speaker: 'You', line: 'I usually play soccer and I sometimes read.', translation: 'Normalmente juego fútbol y a veces leo.' },
          { speaker: 'Partner', line: 'Do you ever play video games?', translation: '¿Alguna vez juegas videojuegos?' },
          { speaker: 'You', line: 'I never play video games, but I love music.', translation: 'Nunca juego videojuegos, pero me encanta la música.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say out loud two hobbies you usually do and one you never do.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Ask a partner "What do you do in your free time?" and listen to their answer.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Write About Your Free Time',
        description: 'Write sentences using adverbs of frequency.',
        mission: 'Write 3-4 sentences about your free time using "always", "usually", "sometimes" or "never".',
        phrases: ['I always...', 'I usually...', 'I sometimes...', 'I never...'],
        dialogue: [{ speaker: 'Model', line: 'I usually play soccer on weekends. I always watch a movie on Friday. I never do homework on Sunday morning.', translation: 'Normalmente juego fútbol los fines de semana. Siempre veo una película el viernes. Nunca hago tarea el domingo por la mañana.' }],
        exercises: [
          { type: 'writing', prompt: 'Write 3-4 sentences about your free time activities using adverbs of frequency.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Adverbs of Frequency',
        description: 'Learn always, usually, sometimes and never.',
        grammarNote:
          'Goal: say how often you do something using adverbs of frequency.\n\n' +
          'Rule: adverbs of frequency show how often an action happens: always (100%), usually (often), sometimes (occasionally), never (0%). Their position in the sentence depends on the verb.\n\n' +
          'Pattern: Subject + adverb + main verb (I always play soccer). Subject + to be + adverb (She is never late).\n\n' +
          'Examples:\n1. I always play soccer on weekends.\n2. She is never late.\n3. I sometimes read on the weekend.\n4. We usually watch movies on Friday.\n5. He always does his homework.\n6. They are usually happy after the game.\n7. I never eat breakfast in bed.\n8. She sometimes paints on Sundays.\n\n' +
          'Affirmative: subject + adverb + verb (or subject + to be + adverb). Example: "We usually play video games."\n\n' +
          'Negative: adverbs like "always/usually/sometimes" rarely appear with "not"; instead, "never" already means 0%, so we don\'t add "not": "I never play soccer" (NOT "I don\'t never play soccer").\n\n' +
          'Questions: "How often do you...?" Example: "How often do you play soccer?" - "I usually play on Saturdays."\n\n' +
          'Contractions: none for the adverbs themselves, but remember "isn\'t/aren\'t" if you need a true negative sentence without "never": "She isn\'t usually late."\n\n' +
          'Common mistakes: ✗ "I play always soccer" → ✓ "I always play soccer" (adverb before the main verb). ✗ "She never is late" → ✓ "She is never late" (adverb after "to be"). ✗ "I don\'t never read" → ✓ "I never read" (never already means 0%, don\'t double the negative).\n\n' +
          'Compare: always (100%) > usually (often) > sometimes (occasionally) > never (0%) - the frequency gets lower as you move down the scale.\n\n' +
          'Mini practice: put the adverb in the right place. "(always) I / play soccer." → I always play soccer. "(never) She / is / late." → She is never late.\n\n' +
          'Summary: put frequency adverbs before the main verb, but after "to be"; "never" already means zero times, so don\'t add another negative word.',
        phrases: ['I always play...', 'She is never late.', 'I sometimes read...', 'We usually watch...'],
        exercises: [
          { type: 'mcq', prompt: 'I ___ play soccer on weekends. (100% of the time)', options: ['never', 'sometimes', 'always', 'usually not'], answer: 2 },
          { type: 'mcq', prompt: 'Choose the correct word order.', options: ['I play always soccer.', 'I always play soccer.', 'Always I play soccer.', 'I play soccer always.'], answer: 1 },
          { type: 'mcq', prompt: 'She ___ late for class. (0% of the time)', options: ['is never', 'never is', 'is not never', 'never be'], answer: 0 },
          { type: 'mcq', prompt: 'I ___ read books, but not every day.', options: ['always', 'never', 'sometimes', 'be'], answer: 2 }
        ],
        grammarTest: {
          id: 'english-a1-free-time-grammar-test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: 'I ___ play soccer on weekends. (100% of the time)',
              options: [
                { id: 'o1', text: 'never' },
                { id: 'o2', text: 'sometimes' },
                { id: 'o4', text: 'usually not' },
                { id: 'o3', text: 'always' }
              ],
              correctOptionId: 'o3',
              explanation: '"Always" means 100% of the time.',
              difficulty: 'easy'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: 'Choose the correct word order.',
              options: [
                { id: 'o1', text: 'I play always soccer.' },
                { id: 'o2', text: 'Always I play soccer.' },
                { id: 'o3', text: 'I always play soccer.' },
                { id: 'o4', text: 'I play soccer always.' }
              ],
              correctOptionId: 'o3',
              explanation: 'The adverb goes before the main verb: "I always play soccer."',
              difficulty: 'easy'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: 'She ___ late for class. (0% of the time)',
              options: [
                { id: 'o1', text: 'is never' },
                { id: 'o2', text: 'never is' },
                { id: 'o3', text: 'is not never' },
                { id: 'o4', text: 'never be' }
              ],
              correctOptionId: 'o1',
              explanation: 'With "to be", the adverb goes after: "She is never late."',
              difficulty: 'easy'
            },
            {
              id: 'q4',
              type: 'mcq',
              prompt: 'I ___ read books, but not every day.',
              options: [
                { id: 'o1', text: 'always' },
                { id: 'o2', text: 'never' },
                { id: 'o3', text: 'sometimes' },
                { id: 'o4', text: 'be' }
              ],
              correctOptionId: 'o3',
              explanation: '"Not every day" but still sometimes = occasionally.',
              difficulty: 'easy'
            },
            {
              id: 'q5',
              type: 'mcq',
              prompt: 'Find the mistake: "She never is late."',
              options: [
                { id: 'o1', text: 'There is no mistake' },
                { id: 'o2', text: 'It should be "She is never late"' },
                { id: 'o3', text: 'It should be "She never be late"' },
                { id: 'o4', text: 'It should be "Never she is late"' }
              ],
              correctOptionId: 'o2',
              explanation: 'With "to be", the adverb comes after the verb: "She is never late."',
              difficulty: 'medium'
            },
            {
              id: 'q6',
              type: 'mcq',
              prompt: 'Choose the correct sentence.',
              options: [
                { id: 'o1', text: "I don't never play video games." },
                { id: 'o2', text: 'I never play video games.' },
                { id: 'o3', text: "I not never play video games." },
                { id: 'o4', text: 'I never don\'t play video games.' }
              ],
              correctOptionId: 'o2',
              explanation: '"Never" already means 0%, so we don\'t add another negative word.',
              difficulty: 'medium'
            },
            {
              id: 'q7',
              type: 'mcq',
              prompt: 'A: "How often do you play soccer?" B: "I ___ play on Saturdays."',
              options: [
                { id: 'o1', text: 'usually' },
                { id: 'o2', text: 'play usually' },
                { id: 'o3', text: 'am usually' },
                { id: 'o4', text: 'usually am' }
              ],
              correctOptionId: 'o1',
              explanation: 'The adverb goes right before the main verb: "I usually play on Saturdays."',
              difficulty: 'medium'
            },
            {
              id: 'q8',
              type: 'mcq',
              prompt: 'Order the adverbs from most to least frequent: always / sometimes / usually / never',
              options: [
                { id: 'o1', text: 'always, usually, sometimes, never' },
                { id: 'o2', text: 'never, sometimes, usually, always' },
                { id: 'o3', text: 'usually, always, never, sometimes' },
                { id: 'o4', text: 'sometimes, never, always, usually' }
              ],
              correctOptionId: 'o1',
              explanation: 'From 100% to 0%: always, usually, sometimes, never.',
              difficulty: 'medium'
            },
            {
              id: 'q9',
              type: 'mcq',
              prompt: 'Choose the sentence equivalent to "She paints on Sundays, but not every Sunday."',
              options: [
                { id: 'o1', text: 'She always paints on Sundays.' },
                { id: 'o2', text: 'She sometimes paints on Sundays.' },
                { id: 'o3', text: 'She never paints on Sundays.' },
                { id: 'o4', text: 'She paints Sundays sometimes on.' }
              ],
              correctOptionId: 'o2',
              explanation: '"Not every time" matches "sometimes".',
              difficulty: 'medium'
            },
            {
              id: 'q10',
              type: 'mcq',
              prompt: 'We ___ watch movies on Friday. (this happens most weeks)',
              options: [
                { id: 'o1', text: 'never' },
                { id: 'o2', text: 'usually' },
                { id: 'o3', text: 'usually watch' },
                { id: 'o4', text: 'watch usually' }
              ],
              correctOptionId: 'o2',
              explanation: '"Usually" fits between subject and verb: "We usually watch movies."',
              difficulty: 'hard'
            },
            {
              id: 'q11',
              type: 'mcq',
              prompt: 'Put in order: "late / is / for / never / class / she"',
              options: [
                { id: 'o1', text: 'She is never late for class.' },
                { id: 'o2', text: 'She never is late for class.' },
                { id: 'o3', text: 'Never she is late for class.' },
                { id: 'o4', text: 'She is late never for class.' }
              ],
              correctOptionId: 'o1',
              explanation: 'Subject + to be + adverb + rest: "She is never late for class."',
              difficulty: 'hard'
            },
            {
              id: 'q12',
              type: 'mcq',
              prompt: 'Choose the best question for the answer "I always do my homework right after school."',
              options: [
                { id: 'o1', text: 'What do you do?' },
                { id: 'o2', text: 'How often do you do your homework?' },
                { id: 'o3', text: 'Where do you do your homework?' },
                { id: 'o4', text: 'Who does your homework?' }
              ],
              correctOptionId: 'o2',
              explanation: 'A question about frequency uses "How often...?"',
              difficulty: 'hard'
            }
          ]
        }
      }),
      vocabulary: activity('vocabulary', {
        title: 'Hobbies and Sports',
        description: 'Words for free-time activities and sports.',
        vocabulary: [
          { word: 'Soccer', translation: 'Fútbol', example: 'I play soccer in the park.' },
          { word: 'Basketball', translation: 'Baloncesto', example: 'She plays basketball on Saturdays.' },
          { word: 'Swimming', translation: 'Natación', example: 'Leo loves swimming.' },
          { word: 'Read', translation: 'Leer', example: 'I always read before bed.' },
          { word: 'Paint', translation: 'Pintar', example: 'I sometimes paint on weekends.' },
          { word: 'Video game', translation: 'Videojuego', example: 'He usually plays video games.' },
          { word: 'Weekend', translation: 'Fin de semana', example: 'What do you do on the weekend?' },
          { word: 'Free time', translation: 'Tiempo libre', example: 'Free time makes me happy.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "Swimming" mean?', options: ['Natación', 'Fútbol', 'Leer', 'Pintar'], answer: 0 },
          { type: 'mcq', prompt: 'What does "Paint" mean?', options: ['Leer', 'Nadar', 'Pintar', 'Jugar'], answer: 2 },
          { type: 'mcq', prompt: 'What does "Free time" mean?', options: ['Fin de semana', 'Tiempo libre', 'Videojuego', 'Deporte'], answer: 1 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'clothes-and-shopping',
    title: 'Clothes and Shopping',
    titleEs: 'Ropa y compras',
    description: 'Clothing items, colors and shopping dialogues.',
    order: 11,
    activities: {
      reading: activity('reading', {
        title: 'At the Clothing Store',
        description: 'A short text about shopping for new clothes, in three parts.',
        reading: {
          title: 'At the Clothing Store',
          parts: [
            'Yesterday, I went to the store with my mother to buy new clothes for school. The store was big, with many colors and styles. I tried on a blue shirt and some black pants. I looked at myself in the big mirror.',
            'The shirt was too big, so I asked the shop assistant for a smaller size. She was very helpful and brought me a medium shirt. It fit perfectly! I also bought a pair of white shoes because my old shoes were too small.',
            'My mother said, "This shirt looks great on you!" I felt happy and confident in my new clothes. We paid at the counter and went home happy. Tomorrow, I am going to wear my new shirt and shoes to school!'
          ],
          questions: [
            'Why did the writer go to the store?',
            'What was wrong with the first shirt?',
            'What did the writer buy?'
          ],
          ordering: {
            prompt: 'Put the events of the story in order.',
            events: [
              'The writer tries on a blue shirt.',
              'The shop assistant brings a smaller size.',
              'The writer buys white shoes.',
              'The family pays and goes home.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Why did they go to the store?', options: ['To buy food', 'To buy new clothes', 'To buy shoes only', 'To buy books'], answer: 1 },
          { type: 'mcq', prompt: 'What was wrong with the shirt?', options: ['Wrong color', 'Too small', 'Too big', 'Too expensive'], answer: 2 },
          { type: 'mcq', prompt: 'What color were the shoes?', options: ['Black', 'Blue', 'White', 'Red'], answer: 2 },
          { type: 'mcq', prompt: 'Who helped find a smaller size?', options: ['The mother', 'The shop assistant', 'The writer\'s friend', 'Nobody'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: The store was big and colorful.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'True or false: The old shoes were too big.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: The writer is going to wear the new clothes tomorrow.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'Choose the best word: I felt happy and ___ in my new clothes.', options: ['confident', 'tired', 'worried', 'sick'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'How Much Is This?',
        description: 'Listen to a customer asking about the price of clothes.',
        intro: 'Listen to a shop assistant helping a customer find a T-shirt.',
        dialogue: [
          { speaker: 'Customer', line: 'Excuse me, how much is this T-shirt?', translation: 'Disculpe, ¿cuánto cuesta esta camiseta?' },
          { speaker: 'Assistant', line: 'It\'s ten dollars. What size do you need?', translation: 'Cuesta diez dólares. ¿Qué talla necesita?' },
          { speaker: 'Customer', line: 'Medium, please. Do you have it in red?', translation: 'Mediana, por favor. ¿La tiene en rojo?' },
          { speaker: 'Assistant', line: 'Yes, here you are. Do you want to try it on?', translation: 'Sí, aquí tiene. ¿Quiere probársela?' },
          { speaker: 'Customer', line: 'Yes, please. Where is the fitting room?', translation: 'Sí, por favor. ¿Dónde está el probador?' },
          { speaker: 'Assistant', line: 'It\'s over there, next to the shoes.', translation: 'Está allí, al lado de los zapatos.' }
        ],
        phrases: ['How much is this?', 'What size do you need?', 'Do you have it in...?', 'Can I try it on?'],
        exercises: [
          { type: 'mcq', prompt: 'How much is the T-shirt?', options: ['Five dollars', 'Ten dollars', 'Fifteen dollars', 'Twenty dollars'], answer: 1 },
          { type: 'mcq', prompt: 'What color does the customer want?', options: ['Blue', 'Black', 'Red', 'White'], answer: 2 },
          { type: 'mcq', prompt: 'Where is the fitting room?', options: ['Next to the shoes', 'Next to the door', 'Upstairs', 'Next to the shirts'], answer: 0 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Go Shopping',
        description: 'Practice a shopping conversation for clothes.',
        mission: 'Act out a shopping scene: ask the price of an item of clothing and its size or color.',
        phrases: ['How much is this?', 'Do you have it in...?', 'What size is it?', 'Can I try it on?'],
        dialogue: [
          { speaker: 'You', line: 'How much is this shirt?', translation: '¿Cuánto cuesta esta camisa?' },
          { speaker: 'Partner', line: 'It\'s twelve dollars. What size do you need?', translation: 'Cuesta doce dólares. ¿Qué talla necesitas?' },
          { speaker: 'You', line: 'Small, please. Do you have it in blue?', translation: 'Pequeña, por favor. ¿La tienes en azul?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say out loud a shopping question: ask the price and color of an item.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the shopping dialogue with a partner (customer/shop assistant), then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Write About Your Clothes',
        description: 'Write sentences describing what you are wearing today.',
        mission: 'Write 3-4 sentences describing the clothes you are wearing today, including colors.',
        phrases: ['I am wearing...', 'It is... (color)', 'My favorite clothes are...', 'I like...'],
        dialogue: [{ speaker: 'Model', line: 'Today I am wearing a blue shirt and black pants. I am also wearing white shoes. My favorite color is blue.', translation: 'Hoy llevo una camisa azul y pantalones negros. También llevo zapatos blancos. Mi color favorito es el azul.' }],
        exercises: [
          { type: 'writing', prompt: 'Write 3-4 sentences describing the clothes you are wearing today, with colors.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'This / That / These / Those',
        description: 'Learn demonstratives and "How much...?" for shopping.',
        grammarNote:
          'Goal: point to things while shopping using this/that/these/those, and ask about price.\n\n' +
          'Rule: demonstratives depend on two things - is it near or far, and is it one thing or more than one? This (near, singular), these (near, plural), that (far, singular), those (far, plural).\n\n' +
          'Pattern: This/That + singular noun. These/Those + plural noun. How much + is/are + demonstrative + noun?\n\n' +
          'Examples:\n1. This shirt is blue.\n2. These shoes are nice.\n3. That dress (over there) is red.\n4. Those pants are new.\n5. How much is this T-shirt?\n6. How much are these shoes?\n7. I like that jacket.\n8. Those shoes are too small.\n\n' +
          'Affirmative: This/That/These/Those + is/are + adjective or noun. Example: "This shirt is blue."\n\n' +
          'Negative: add not after is/are. Example: "This shirt isn\'t blue." "Those shoes aren\'t expensive."\n\n' +
          'Questions: "How much is/are...?" for price; "Is/Are this/that/these/those...?" for yes/no questions. Example: "Is that dress red?" "Are these shoes yours?"\n\n' +
          'Contractions: isn\'t = is not, aren\'t = are not, that\'s = that is.\n\n' +
          'Common mistakes: ✗ "This shoes are nice" → ✓ "These shoes are nice" (shoes is plural, so "these", not "this"). ✗ "How much is these shoes?" → ✓ "How much are these shoes?" (plural noun needs "are"). ✗ "Those shirt" → ✓ "That shirt" (singular noun needs "that", not "those").\n\n' +
          'Compare: this/that = one thing (singular verb "is"); these/those = more than one thing (plural verb "are"). Near = this/these; far = that/those.\n\n' +
          'Mini practice: complete. "___ shoes (in my hands) are white." → These. "___ jacket (across the store) is nice." → That. "How much ___ this shirt?" → is.\n\n' +
          'Summary: use this/these for things close to you and that/those for things farther away; match singular nouns with this/that + is, and plural nouns with these/those + are.',
        phrases: ['this shirt', 'these shoes', 'that dress (over there)', 'How much is/are...?'],
        exercises: [
          { type: 'mcq', prompt: '___ shirt (in my hand) is blue.', options: ['This', 'These', 'Those', 'That'], answer: 0 },
          { type: 'mcq', prompt: '___ shoes (over there) are nice.', options: ['This', 'That', 'Those', 'It'], answer: 2 },
          { type: 'mcq', prompt: 'How much ___ this T-shirt?', options: ['is', 'are', 'am', 'be'], answer: 0 },
          { type: 'mcq', prompt: 'How much ___ these shoes?', options: ['is', 'are', 'am', 'be'], answer: 1 }
        ],
        grammarTest: {
          id: 'english-a1-clothes-and-shopping-grammar-test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: '___ shirt (in my hand) is blue.',
              options: [
                { id: 'o2', text: 'These' },
                { id: 'o3', text: 'Those' },
                { id: 'o4', text: 'That' },
                { id: 'o1', text: 'This' }
              ],
              correctOptionId: 'o1',
              explanation: 'Near + singular = "This".',
              difficulty: 'easy'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: '___ shoes (over there) are nice.',
              options: [
                { id: 'o1', text: 'This' },
                { id: 'o2', text: 'That' },
                { id: 'o3', text: 'Those' },
                { id: 'o4', text: 'It' }
              ],
              correctOptionId: 'o3',
              explanation: 'Far + plural = "Those".',
              difficulty: 'easy'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: 'How much ___ this T-shirt?',
              options: [
                { id: 'o1', text: 'is' },
                { id: 'o2', text: 'are' },
                { id: 'o3', text: 'am' },
                { id: 'o4', text: 'be' }
              ],
              correctOptionId: 'o1',
              explanation: '"T-shirt" is singular, so we use "is".',
              difficulty: 'easy'
            },
            {
              id: 'q4',
              type: 'mcq',
              prompt: 'How much ___ these shoes?',
              options: [
                { id: 'o1', text: 'is' },
                { id: 'o2', text: 'are' },
                { id: 'o3', text: 'am' },
                { id: 'o4', text: 'be' }
              ],
              correctOptionId: 'o2',
              explanation: '"Shoes" is plural, so we use "are".',
              difficulty: 'easy'
            },
            {
              id: 'q5',
              type: 'mcq',
              prompt: 'Find the mistake: "This shoes are nice."',
              options: [
                { id: 'o1', text: 'There is no mistake' },
                { id: 'o2', text: 'It should be "These shoes are nice"' },
                { id: 'o3', text: 'It should be "This shoes is nice"' },
                { id: 'o4', text: 'It should be "That shoes are nice"' }
              ],
              correctOptionId: 'o2',
              explanation: '"Shoes" is plural, so it needs "these", not "this".',
              difficulty: 'medium'
            },
            {
              id: 'q6',
              type: 'mcq',
              prompt: 'Choose the correct negative sentence.',
              options: [
                { id: 'o1', text: "This shirt don't blue." },
                { id: 'o2', text: "This shirt isn't blue." },
                { id: 'o3', text: "This shirt not is blue." },
                { id: 'o4', text: "This shirt aren't blue." }
              ],
              correctOptionId: 'o2',
              explanation: '"Shirt" is singular, so the negative is "isn\'t".',
              difficulty: 'medium'
            },
            {
              id: 'q7',
              type: 'mcq',
              prompt: 'Which question is correct?',
              options: [
                { id: 'o1', text: 'That dress is red?' },
                { id: 'o2', text: 'Is that dress red?' },
                { id: 'o3', text: 'Is red that dress?' },
                { id: 'o4', text: 'That is dress red?' }
              ],
              correctOptionId: 'o2',
              explanation: 'Yes/no questions move "is" before the subject: "Is that dress red?"',
              difficulty: 'medium'
            },
            {
              id: 'q8',
              type: 'mcq',
              prompt: 'A jacket far away from you: "I like ___ jacket."',
              options: [
                { id: 'o1', text: 'this' },
                { id: 'o2', text: 'these' },
                { id: 'o3', text: 'that' },
                { id: 'o4', text: 'those' }
              ],
              correctOptionId: 'o3',
              explanation: 'Far + singular = "that".',
              difficulty: 'medium'
            },
            {
              id: 'q9',
              type: 'mcq',
              prompt: 'Choose the sentence equivalent to "Those shoes are not expensive."',
              options: [
                { id: 'o1', text: "Those shoes isn't expensive." },
                { id: 'o2', text: "Those shoes aren't expensive." },
                { id: 'o3', text: 'Those shoes not expensive.' },
                { id: 'o4', text: "That shoes aren't expensive." }
              ],
              correctOptionId: 'o2',
              explanation: '"Shoes" is plural, so the contraction is "aren\'t".',
              difficulty: 'medium'
            },
            {
              id: 'q10',
              type: 'mcq',
              prompt: 'Complete the dialogue: A: "How much are those pants?" B: "___ twenty dollars."',
              options: [
                { id: 'o1', text: "They're" },
                { id: 'o2', text: "It's" },
                { id: 'o3', text: 'This is' },
                { id: 'o4', text: 'That is' }
              ],
              correctOptionId: 'o1',
              explanation: '"Pants" is plural, so we answer with "They\'re twenty dollars."',
              difficulty: 'hard'
            },
            {
              id: 'q11',
              type: 'mcq',
              prompt: 'Put in order: "is / how much / T-shirt / this"',
              options: [
                { id: 'o1', text: 'How much is this T-shirt?' },
                { id: 'o2', text: 'This T-shirt how much is?' },
                { id: 'o3', text: 'Is how much this T-shirt?' },
                { id: 'o4', text: 'How much this T-shirt is?' }
              ],
              correctOptionId: 'o1',
              explanation: 'The question word order is "How much + is + subject?"',
              difficulty: 'hard'
            },
            {
              id: 'q12',
              type: 'mcq',
              prompt: 'Choose the best word for one dress you are holding right now.',
              options: [
                { id: 'o1', text: 'that' },
                { id: 'o2', text: 'those' },
                { id: 'o3', text: 'this' },
                { id: 'o4', text: 'these' }
              ],
              correctOptionId: 'o3',
              explanation: 'Something you are holding is near and singular: "this".',
              difficulty: 'hard'
            }
          ]
        }
      }),
      vocabulary: activity('vocabulary', {
        title: 'Clothes and Colors',
        description: 'Words for clothing items and colors.',
        vocabulary: [
          { word: 'Shirt', translation: 'Camisa', example: 'I bought a blue shirt.' },
          { word: 'Pants', translation: 'Pantalones', example: 'These black pants are new.' },
          { word: 'Shoes', translation: 'Zapatos', example: 'My shoes are white.' },
          { word: 'Dress', translation: 'Vestido', example: 'She is wearing a red dress.' },
          { word: 'Size', translation: 'Talla', example: 'What size do you need?' },
          { word: 'Price', translation: 'Precio', example: 'What is the price of this shirt?' },
          { word: 'Wear', translation: 'Llevar puesto', example: 'I wear a jacket in winter.' },
          { word: 'Color', translation: 'Color', example: 'What is your favorite color?' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "Size" mean?', options: ['Talla', 'Precio', 'Color', 'Vestido'], answer: 0 },
          { type: 'mcq', prompt: 'What does "Wear" mean?', options: ['Comprar', 'Vender', 'Llevar puesto', 'Lavar'], answer: 2 },
          { type: 'mcq', prompt: 'What does "Price" mean?', options: ['Precio', 'Color', 'Talla', 'Zapatos'], answer: 0 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'weather-and-travel',
    title: 'Weather and Travel',
    titleEs: 'El clima y los viajes',
    description: 'Weather expressions, seasons, and travel plans.',
    order: 12,
    activities: {
      reading: activity('reading', {
        title: 'Our Trip to the Mountains',
        description: 'A short text about a family trip and the weather, in three parts.',
        reading: {
          title: 'Our Trip to the Mountains',
          parts: [
            'Next month, my family is going to travel to the mountains. The weather there is usually cool, not hot like the beach. In the mountains, it sometimes rains in the afternoon, so we need to check the weather before we go. I am already thinking about what to pack.',
            'We are going to pack jackets and warm clothes because the nights are cold. My father is going to drive, and the trip takes about three hours. My mother is going to bring snacks and water for the journey. We are also going to bring a camera to take photos.',
            'I am very excited because it is going to be my first time in the mountains! My brother says there are beautiful views and many trails for walking. We are going to stay in a small cabin near a lake. I can\'t wait for our trip!'
          ],
          questions: [
            'Where is the family going to travel?',
            'What is the weather like there?',
            'How long does the trip take?'
          ],
          ordering: {
            prompt: 'Put the events of the story in order.',
            events: [
              'The family checks the weather and packs jackets.',
              'Father drives the family to the mountains.',
              'The family arrives at the small cabin.',
              'The family walks on the mountain trails.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Where is the family going?', options: ['The beach', 'The mountains', 'Another country', 'The city'], answer: 1 },
          { type: 'mcq', prompt: 'What is the weather usually like there?', options: ['Very hot', 'Cool', 'Rainy every day', 'Snowy'], answer: 1 },
          { type: 'mcq', prompt: 'How long does the trip take?', options: ['One hour', 'Two hours', 'Three hours', 'A whole day'], answer: 2 },
          { type: 'mcq', prompt: 'Where are they going to stay?', options: ['A hotel', 'A small cabin', 'A tent', 'Their car'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: The nights in the mountains are cold.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'True or false: This is not the writer\'s first time in the mountains.', options: ['True', 'False'], answer: 1 },
          { type: 'mcq', prompt: 'True or false: The family is going to bring a camera.', options: ['True', 'False'], answer: 0 },
          { type: 'mcq', prompt: 'Choose the best word: My brother says there are beautiful ___ and many trails.', options: ['views', 'shoes', 'phones', 'prices'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'What\'s the Weather Like?',
        description: 'Listen to two friends planning a trip based on the weather.',
        intro: 'Listen to Sofia and Marco checking the weather before planning a weekend trip.',
        dialogue: [
          { speaker: 'Sofia', line: 'What\'s the weather like today?', translation: '¿Cómo está el clima hoy?' },
          { speaker: 'Marco', line: 'It\'s sunny and warm. Perfect for the beach!', translation: 'Está soleado y cálido. ¡Perfecto para la playa!' },
          { speaker: 'Sofia', line: 'Great! What about tomorrow?', translation: '¡Genial! ¿Y mañana?' },
          { speaker: 'Marco', line: 'Tomorrow it\'s going to rain, I think.', translation: 'Mañana va a llover, creo.' },
          { speaker: 'Sofia', line: 'Then let\'s go to the beach today and travel tomorrow.', translation: 'Entonces vamos a la playa hoy y viajamos mañana.' },
          { speaker: 'Marco', line: 'Good idea! Let\'s pack our bags.', translation: '¡Buena idea! Empaquemos nuestras maletas.' }
        ],
        phrases: ['What\'s the weather like?', 'It\'s sunny/rainy/cold.', 'It\'s going to rain.', 'Let\'s...'],
        exercises: [
          { type: 'mcq', prompt: 'What is the weather like today?', options: ['Rainy', 'Sunny and warm', 'Cold', 'Snowy'], answer: 1 },
          { type: 'mcq', prompt: 'What is the weather going to be like tomorrow?', options: ['Sunny', 'Very hot', 'Rainy', 'Windy'], answer: 2 },
          { type: 'mcq', prompt: 'What do they decide to do today?', options: ['Stay home', 'Go to the beach', 'Travel to the mountains', 'Go to school'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Talk About the Weather and Plans',
        description: 'Practice describing the weather and travel plans.',
        mission: 'Tell a partner what the weather is like today and one place you are going to visit soon.',
        phrases: ['It\'s sunny/rainy/cold/hot today.', 'I\'m going to travel to...', 'What\'s the weather like?', 'I\'m going to pack...'],
        dialogue: [
          { speaker: 'You', line: 'It\'s sunny today. I\'m going to go to the park.', translation: 'Hoy está soleado. Voy a ir al parque.' },
          { speaker: 'Partner', line: 'What are you going to wear?', translation: '¿Qué vas a usar?' },
          { speaker: 'You', line: 'I\'m going to wear a T-shirt because it\'s hot.', translation: 'Voy a usar una camiseta porque hace calor.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say out loud today\'s weather and one travel or weekend plan.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Ask a partner "What are you going to do this weekend?" and listen to their plan.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Write About a Trip',
        description: 'Write sentences about a future trip using "going to".',
        mission: 'Write 3-4 sentences about a trip you are going to take, including the weather and what you are going to pack.',
        phrases: ['I\'m going to travel to...', 'The weather is going to be...', 'I\'m going to pack...', 'I am excited because...'],
        dialogue: [{ speaker: 'Model', line: 'Next month I am going to travel to the mountains. The weather is going to be cool. I am going to pack a jacket.', translation: 'El próximo mes voy a viajar a las montañas. El clima va a estar fresco. Voy a empacar una chaqueta.' }],
        exercises: [
          { type: 'writing', prompt: 'Write 3-4 sentences about a trip you are going to take, using "going to".', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Present Continuous and "Going To" for Plans',
        description: 'Learn to describe the weather now and talk about future plans.',
        grammarNote:
          'Goal: describe what is happening right now (weather) and talk about future plans.\n\n' +
          'Rule: the present continuous (is/am/are + verb-ing) describes something happening at this moment, including weather. "Going to" + base verb talks about a plan or intention for the future. Both need the correct form of "to be" before the main verb.\n\n' +
          'Pattern: Subject + am/is/are + verb-ing (now). Subject + am/is/are + going to + base verb (future plan).\n\n' +
          'Examples:\n1. It is raining right now.\n2. It is snowing in the mountains.\n3. I am going to travel next month.\n4. She is going to pack a jacket.\n5. We are going to visit the beach.\n6. Look! It is getting cloudy.\n7. They are going to stay home because it\'s cold.\n8. He is packing his bag now.\n\n' +
          'Affirmative: subject + am/is/are + verb-ing OR going to + verb. Example: "We are going to visit the mountains."\n\n' +
          'Negative: add not after am/is/are. Example: "It isn\'t raining now." "I am not going to travel this weekend."\n\n' +
          'Questions: Am/Is/Are + subject + verb-ing/going to + verb...? Example: "Is it raining?" "Are you going to pack a jacket?"\n\n' +
          'Contractions: it\'s = it is, I\'m = I am, isn\'t = is not, aren\'t = are not.\n\n' +
          'Common mistakes: ✗ "It rain now" → ✓ "It is raining now" (need "to be" + verb-ing). ✗ "She going to pack" → ✓ "She is going to pack" (don\'t forget "is/am/are"). ✗ "We going visit" → ✓ "We are going to visit" (need "to" between going and the verb).\n\n' +
          'Compare: present continuous for NOW (It is raining = happening this second); "going to" for a PLAN (I am going to travel = decided before, will happen later).\n\n' +
          'Mini practice: complete. "Look outside, it (rain) ___ ." → is raining. "Next week, we (visit) ___ the mountains." → are going to visit.\n\n' +
          'Summary: use is/am/are + verb-ing for what is happening now (including weather); use is/am/are + going to + verb for future plans.',
        phrases: ['It is raining.', 'It is snowing.', 'I am going to travel.', 'She is going to pack...'],
        exercises: [
          { type: 'mcq', prompt: 'Look outside - it ___ raining right now.', options: ['is', 'are', 'am', 'be'], answer: 0 },
          { type: 'mcq', prompt: 'Next week, we ___ going to visit the mountains.', options: ['is', 'am', 'are', 'be'], answer: 2 },
          { type: 'mcq', prompt: 'She ___ going to pack a jacket because it\'s cold.', options: ['am', 'is', 'are', 'be'], answer: 1 },
          { type: 'mcq', prompt: 'Choose the correct sentence for "now".', options: ['It rain today.', 'It is rain today.', 'It is raining today.', 'It raining today.'], answer: 2 }
        ],
        grammarTest: {
          id: 'english-a1-weather-and-travel-grammar-test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              prompt: 'Look outside - it ___ raining right now.',
              options: [
                { id: 'o2', text: 'are' },
                { id: 'o3', text: 'am' },
                { id: 'o4', text: 'be' },
                { id: 'o1', text: 'is' }
              ],
              correctOptionId: 'o1',
              explanation: '"It" needs "is" before the -ing verb: "It is raining."',
              difficulty: 'easy'
            },
            {
              id: 'q2',
              type: 'mcq',
              prompt: 'Next week, we ___ going to visit the mountains.',
              options: [
                { id: 'o1', text: 'is' },
                { id: 'o2', text: 'am' },
                { id: 'o3', text: 'are' },
                { id: 'o4', text: 'be' }
              ],
              correctOptionId: 'o3',
              explanation: '"We" needs "are": "we are going to visit".',
              difficulty: 'easy'
            },
            {
              id: 'q3',
              type: 'mcq',
              prompt: 'She ___ going to pack a jacket because it\'s cold.',
              options: [
                { id: 'o1', text: 'am' },
                { id: 'o2', text: 'is' },
                { id: 'o3', text: 'are' },
                { id: 'o4', text: 'be' }
              ],
              correctOptionId: 'o2',
              explanation: '"She" needs "is": "she is going to pack".',
              difficulty: 'easy'
            },
            {
              id: 'q4',
              type: 'mcq',
              prompt: 'Choose the correct sentence for "now".',
              options: [
                { id: 'o1', text: 'It rain today.' },
                { id: 'o2', text: 'It is rain today.' },
                { id: 'o3', text: 'It is raining today.' },
                { id: 'o4', text: 'It raining today.' }
              ],
              correctOptionId: 'o3',
              explanation: 'The present continuous needs "is" + verb-ing: "It is raining today."',
              difficulty: 'easy'
            },
            {
              id: 'q5',
              type: 'mcq',
              prompt: 'Find the mistake: "We going to visit the beach."',
              options: [
                { id: 'o1', text: 'There is no mistake' },
                { id: 'o2', text: 'It should be "We are going to visit the beach"' },
                { id: 'o3', text: 'It should be "We goes to visit the beach"' },
                { id: 'o4', text: 'It should be "We go to visit the beach"' }
              ],
              correctOptionId: 'o2',
              explanation: '"Going to" needs "to be" before it: "We are going to visit..."',
              difficulty: 'medium'
            },
            {
              id: 'q6',
              type: 'mcq',
              prompt: 'Choose the correct negative sentence.',
              options: [
                { id: 'o1', text: "It don't raining now." },
                { id: 'o2', text: "It isn't raining now." },
                { id: 'o3', text: "It not is raining now." },
                { id: 'o4', text: "It doesn't raining now." }
              ],
              correctOptionId: 'o2',
              explanation: 'The negative of "it is" is "it isn\'t": "It isn\'t raining now."',
              difficulty: 'medium'
            },
            {
              id: 'q7',
              type: 'mcq',
              prompt: 'Which question is correct?',
              options: [
                { id: 'o1', text: 'Is it raining?' },
                { id: 'o2', text: 'It is raining?' },
                { id: 'o3', text: 'Is raining it?' },
                { id: 'o4', text: 'It raining is?' }
              ],
              correctOptionId: 'o1',
              explanation: 'Questions move "is" before the subject: "Is it raining?"',
              difficulty: 'medium'
            },
            {
              id: 'q8',
              type: 'mcq',
              prompt: 'A: "Are you going to pack a jacket?" B: "Yes, ___."',
              options: [
                { id: 'o1', text: 'I is' },
                { id: 'o2', text: 'I am' },
                { id: 'o3', text: 'I do' },
                { id: 'o4', text: 'I are' }
              ],
              correctOptionId: 'o2',
              explanation: 'The short answer for "I" is "Yes, I am."',
              difficulty: 'medium'
            },
            {
              id: 'q9',
              type: 'mcq',
              prompt: 'Choose the sentence that describes a future plan, not something happening now.',
              options: [
                { id: 'o1', text: 'It is snowing in the mountains.' },
                { id: 'o2', text: 'I am going to travel next month.' },
                { id: 'o3', text: 'Look, it is raining.' },
                { id: 'o4', text: 'She is packing her bag right now.' }
              ],
              correctOptionId: 'o2',
              explanation: '"Going to" + verb describes a future plan; the others describe now.',
              difficulty: 'medium'
            },
            {
              id: 'q10',
              type: 'mcq',
              prompt: 'What is the short form of "it is" in "It\'s raining"?',
              options: [
                { id: 'o1', text: 'it is' },
                { id: 'o2', text: 'its' },
                { id: 'o3', text: "it's" },
                { id: 'o4', text: 'it are' }
              ],
              correctOptionId: 'o3',
              explanation: '"It is" contracts to "it\'s".',
              difficulty: 'hard'
            },
            {
              id: 'q11',
              type: 'mcq',
              prompt: 'Put in order: "visit / going to / are / they / the beach"',
              options: [
                { id: 'o1', text: 'They are going to visit the beach.' },
                { id: 'o2', text: 'They going to are visit the beach.' },
                { id: 'o3', text: 'Are they going to visit the beach they.' },
                { id: 'o4', text: 'Going to they are visit the beach.' }
              ],
              correctOptionId: 'o1',
              explanation: 'Order: subject + to be + going to + base verb + rest.',
              difficulty: 'hard'
            },
            {
              id: 'q12',
              type: 'mcq',
              prompt: 'Choose the equivalent sentence to "It is very cold and white snow is falling."',
              options: [
                { id: 'o1', text: 'It is sunny.' },
                { id: 'o2', text: 'It is snowing.' },
                { id: 'o3', text: 'It is going to snow.' },
                { id: 'o4', text: 'It snows every winter.' }
              ],
              correctOptionId: 'o2',
              explanation: 'Snow falling right now is described with the present continuous: "It is snowing."',
              difficulty: 'hard'
            }
          ]
        }
      }),
      vocabulary: activity('vocabulary', {
        title: 'Weather and Travel Words',
        description: 'Words for weather conditions and travel.',
        vocabulary: [
          { word: 'Sunny', translation: 'Soleado', example: 'It\'s sunny today.' },
          { word: 'Rainy', translation: 'Lluvioso', example: 'Tomorrow is going to be rainy.' },
          { word: 'Cold', translation: 'Frío', example: 'It\'s cold in the mountains.' },
          { word: 'Hot', translation: 'Caluroso', example: 'It\'s very hot at the beach.' },
          { word: 'Trip', translation: 'Viaje', example: 'Our trip is next month.' },
          { word: 'Pack', translation: 'Empacar', example: 'I need to pack my bag.' },
          { word: 'Beach', translation: 'Playa', example: 'We are going to the beach.' },
          { word: 'Mountain', translation: 'Montaña', example: 'The mountains are beautiful.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "Rainy" mean?', options: ['Soleado', 'Lluvioso', 'Frío', 'Caluroso'], answer: 1 },
          { type: 'mcq', prompt: 'What does "Pack" mean?', options: ['Viajar', 'Empacar', 'Llegar', 'Nadar'], answer: 1 },
          { type: 'mcq', prompt: 'What does "Mountain" mean?', options: ['Playa', 'Ciudad', 'Montaña', 'Río'], answer: 2 }
        ]
      })
    }
  }
];

module.exports = {
  language: 'english',
  level: 'A1',
  courseTitle: 'English A1',
  courseDescription: 'Survival English: greetings, introductions and basic requests, organized in 12 thematic units.',
  units
};
