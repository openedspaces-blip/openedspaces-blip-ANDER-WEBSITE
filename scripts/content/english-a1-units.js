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
        grammarNote: 'The verb "to be" changes depending on the subject: I am, you are, he/she/it is, we are, they are. We use it to say names, feelings, and where we are from. Example: "I am Ana. You are my friend. He is the teacher."',
        phrases: ['I am...', 'You are...', 'He/She is...', 'We are...', 'They are...'],
        exercises: [
          { type: 'mcq', prompt: 'I ___ a student.', options: ['am', 'is', 'are', 'be'], answer: 0 },
          { type: 'mcq', prompt: 'She ___ my teacher.', options: ['am', 'is', 'are', 'be'], answer: 1 },
          { type: 'mcq', prompt: 'They ___ my classmates.', options: ['am', 'is', 'are', 'be'], answer: 2 },
          { type: 'mcq', prompt: 'You ___ very kind.', options: ['am', 'is', 'are', 'be'], answer: 2 }
        ]
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
        grammarNote: 'To make "to be" negative, add "not": I am not tired. She is not sad. To ask a question, put the verb first: Are you happy? Is he from Spain? We also use "my" (mine) and "your" (yours) before a noun: my name, your country.',
        phrases: ['I am not...', 'Are you...?', 'Is he/she...?', 'my name / your name'],
        exercises: [
          { type: 'mcq', prompt: 'I ___ tired today. (negative)', options: ['am not', 'not am', 'isn\'t', 'aren\'t'], answer: 0 },
          { type: 'mcq', prompt: '___ you from Italy?', options: ['Is', 'Am', 'Are', 'Be'], answer: 2 },
          { type: 'mcq', prompt: '___ she happy today?', options: ['Are', 'Is', 'Am', 'Do'], answer: 1 },
          { type: 'mcq', prompt: 'What is ___ name? (talking to a friend)', options: ['my', 'your', 'he', 'is'], answer: 1 }
        ]
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
        grammarNote: 'We add \'s to a name or person to show possession: Ana\'s brother, my sister\'s name. To make most nouns plural, add -s: one brother → two brothers, one friend → three friends. Some plurals are irregular: one child → two children.',
        phrases: ['Ana\'s brother', 'my sister\'s name', 'two brothers', 'three friends'],
        exercises: [
          { type: 'mcq', prompt: 'How do you say the name belonging to Ana\'s mother?', options: ['Ana mother name', 'Ana\'s mother\'s name', 'Ana is mother name', 'Mother\'s Ana name'], answer: 1 },
          { type: 'mcq', prompt: 'What is the plural of "friend"?', options: ['friend', 'friends', 'friendes', 'friendies'], answer: 1 },
          { type: 'mcq', prompt: 'What is the plural of "child"?', options: ['childs', 'childes', 'children', 'child'], answer: 2 },
          { type: 'mcq', prompt: 'Choose the correct sentence.', options: ['This is my sister brother.', 'This is my sister\'s brother.', 'This is my sisters brother.', 'This my sister\'s is brother.'], answer: 1 }
        ]
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
        grammarNote: 'We use "there is" with singular nouns and "there are" with plural nouns: There is a clock. There are twenty desks. Use "a" before a consonant sound (a pen) and "an" before a vowel sound (an eraser). Use "the" when both speakers know exactly which thing we mean: the whiteboard (the one in our classroom).',
        phrases: ['There is a...', 'There are...', 'a pencil / an eraser', 'the classroom'],
        exercises: [
          { type: 'mcq', prompt: '___ a computer lab at school.', options: ['There is', 'There are', 'Is there', 'It is'], answer: 0 },
          { type: 'mcq', prompt: '___ twenty students in my class.', options: ['There is', 'There are', 'Is there', 'It are'], answer: 1 },
          { type: 'mcq', prompt: 'I have ___ eraser in my bag.', options: ['a', 'an', 'the', 'some'], answer: 1 },
          { type: 'mcq', prompt: 'I have ___ pencil.', options: ['a', 'an', 'are', 'is'], answer: 0 }
        ]
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
        grammarNote: 'We use the present simple for habits and routines. Add -s to the verb with he/she/it: I get up at seven, but She gets up at seven. I eat breakfast, but He eats breakfast. Time expressions like "every day" and "always" often go with this tense.',
        phrases: ['I get up...', 'She gets up...', 'I eat breakfast.', 'He eats breakfast.'],
        exercises: [
          { type: 'mcq', prompt: 'She ___ up at seven every day.', options: ['get', 'gets', 'getting', 'to get'], answer: 1 },
          { type: 'mcq', prompt: 'I ___ breakfast at home.', options: ['eat', 'eats', 'eating', 'ate'], answer: 0 },
          { type: 'mcq', prompt: 'My brother ___ to school by bus.', options: ['go', 'goes', 'going', 'gone'], answer: 1 },
          { type: 'mcq', prompt: 'We ___ dinner at seven in the evening.', options: ['has', 'have', 'having', 'had'], answer: 1 }
        ]
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
        grammarNote: 'Use "at" with exact times: at seven o\'clock, at noon. Use "on" with days and dates: on Monday, on June 15th. Use "in" with months, years and longer periods: in June, in the morning, in summer. Questions with these use "What time...?" and "What day...?".',
        phrases: ['at seven o\'clock', 'on Monday', 'in June', 'in the morning'],
        exercises: [
          { type: 'mcq', prompt: 'My class starts ___ nine o\'clock.', options: ['at', 'on', 'in', 'by'], answer: 0 },
          { type: 'mcq', prompt: 'My birthday is ___ June.', options: ['at', 'on', 'in', 'by'], answer: 2 },
          { type: 'mcq', prompt: 'We have English ___ Monday.', options: ['at', 'on', 'in', 'by'], answer: 1 },
          { type: 'mcq', prompt: 'I do my homework ___ the evening.', options: ['at', 'on', 'in', 'by'], answer: 2 }
        ]
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
        grammarNote: 'Countable nouns can be counted: one banana, two bananas. Uncountable nouns cannot: rice, water, juice (we don\'t say "one rice"). We use "some" in affirmative sentences (I\'d like some water) and "any" in negatives and questions (I don\'t have any juice. Do you have any bananas?).',
        phrases: ['some water', 'any juice', 'one banana / two bananas', 'I\'d like some...'],
        exercises: [
          { type: 'mcq', prompt: 'I\'d like ___ rice, please.', options: ['some', 'any', 'a', 'many'], answer: 0 },
          { type: 'mcq', prompt: 'I don\'t have ___ juice at home.', options: ['some', 'any', 'a', 'an'], answer: 1 },
          { type: 'mcq', prompt: 'Which word can we count? "I have two ___."', options: ['water', 'rice', 'bananas', 'juice'], answer: 2 },
          { type: 'mcq', prompt: 'Do you have ___ bananas?', options: ['some', 'any', 'a', 'the'], answer: 1 }
        ]
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
        grammarNote: 'Prepositions of place tell us where something is: in (the box), on (the table), under (the bed), next to (the door), behind (the sofa). Example: "The cat is under the table." "My backpack is next to the sofa."',
        phrases: ['in the kitchen', 'on the table', 'under the bed', 'next to the door'],
        exercises: [
          { type: 'mcq', prompt: 'The cat is ___ the table. (below it)', options: ['on', 'in', 'under', 'next to'], answer: 2 },
          { type: 'mcq', prompt: 'My books are ___ the desk. (on top of it)', options: ['on', 'under', 'behind', 'in'], answer: 0 },
          { type: 'mcq', prompt: 'The backpack is ___ the sofa. (at the side of it)', options: ['under', 'on', 'next to', 'in'], answer: 2 },
          { type: 'mcq', prompt: 'My clothes are ___ the closet. (inside it)', options: ['in', 'on', 'under', 'next to'], answer: 0 }
        ]
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
        grammarNote: 'To give directions or instructions, use the base form of the verb without a subject: Go straight. Turn left. Cross the street. Use "don\'t" for a negative instruction: Don\'t turn right, turn left. This is also how we give simple classroom instructions: Open your book. Listen carefully.',
        phrases: ['Go straight.', 'Turn left/right.', 'Cross the street.', 'Don\'t turn right.'],
        exercises: [
          { type: 'mcq', prompt: 'Which sentence gives a direction correctly?', options: ['You go straight.', 'Go straight.', 'Going straight.', 'Goes straight.'], answer: 1 },
          { type: 'mcq', prompt: '___ left at the supermarket.', options: ['Turn', 'Turns', 'Turning', 'To turn'], answer: 0 },
          { type: 'mcq', prompt: 'Choose the negative instruction.', options: ['Don\'t turn right.', 'Not turn right.', 'No turn right.', 'Turn not right.'], answer: 0 },
          { type: 'mcq', prompt: 'Which is a classroom instruction?', options: ['I open my book.', 'Open your book.', 'Opening the book.', 'Books are open.'], answer: 1 }
        ]
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
        grammarNote: 'Adverbs of frequency say how often we do something: always (100%), usually (often), sometimes (occasionally), never (0%). They go before the main verb, but after the verb "to be": I always play soccer. She is never late. I sometimes read on the weekend.',
        phrases: ['I always play...', 'She is never late.', 'I sometimes read...', 'We usually watch...'],
        exercises: [
          { type: 'mcq', prompt: 'I ___ play soccer on weekends. (100% of the time)', options: ['never', 'sometimes', 'always', 'usually not'], answer: 2 },
          { type: 'mcq', prompt: 'Choose the correct word order.', options: ['I play always soccer.', 'I always play soccer.', 'Always I play soccer.', 'I play soccer always.'], answer: 1 },
          { type: 'mcq', prompt: 'She ___ late for class. (0% of the time)', options: ['is never', 'never is', 'is not never', 'never be'], answer: 0 },
          { type: 'mcq', prompt: 'I ___ read books, but not every day.', options: ['always', 'never', 'sometimes', 'be'], answer: 2 }
        ]
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
        grammarNote: 'Use "this" (singular, near) and "these" (plural, near) for things close to you: This shirt, these shoes. Use "that" (singular, far) and "those" (plural, far) for things farther away: That shirt (over there), those shoes. Ask about price with "How much is/are...?": How much is this shirt? How much are these shoes?',
        phrases: ['this shirt', 'these shoes', 'that dress (over there)', 'How much is/are...?'],
        exercises: [
          { type: 'mcq', prompt: '___ shirt (in my hand) is blue.', options: ['This', 'These', 'Those', 'That'], answer: 0 },
          { type: 'mcq', prompt: '___ shoes (over there) are nice.', options: ['This', 'That', 'Those', 'It'], answer: 2 },
          { type: 'mcq', prompt: 'How much ___ this T-shirt?', options: ['is', 'are', 'am', 'be'], answer: 0 },
          { type: 'mcq', prompt: 'How much ___ these shoes?', options: ['is', 'are', 'am', 'be'], answer: 1 }
        ]
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
        grammarNote: 'We use the present continuous (is/am/are + verb-ing) to describe what is happening now, including weather: It is raining. It is snowing. We use "going to" + verb to talk about future plans: I am going to travel. She is going to pack a jacket. Both need the correct form of "to be" before the main verb.',
        phrases: ['It is raining.', 'It is snowing.', 'I am going to travel.', 'She is going to pack...'],
        exercises: [
          { type: 'mcq', prompt: 'Look outside - it ___ raining right now.', options: ['is', 'are', 'am', 'be'], answer: 0 },
          { type: 'mcq', prompt: 'Next week, we ___ going to visit the mountains.', options: ['is', 'am', 'are', 'be'], answer: 2 },
          { type: 'mcq', prompt: 'She ___ going to pack a jacket because it\'s cold.', options: ['am', 'is', 'are', 'be'], answer: 1 },
          { type: 'mcq', prompt: 'Choose the correct sentence for "now".', options: ['It rain today.', 'It is rain today.', 'It is raining today.', 'It raining today.'], answer: 2 }
        ]
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
