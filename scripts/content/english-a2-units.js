// scripts/content/english-a2-units.js
// Hand-authored English A2 content - same architecture as
// scripts/content/english-a1-units.js (12-unit English A1), french-a1-units.js
// and spanish-a1-units.js: one module per language+level, consumed by
// scripts/build-english-a2-seed.js, which flattens it into
// lib/seed-lessons.json + lib/seed-units.json for
// scripts/migrate-english-a2-units.js to push into Supabase.
//
// Batch 3 of 3: all 10 units (Everyday Life, Family and Relationships, Home
// and Neighborhood, Food and Shopping, Past Experiences, Travel and
// Transportation, Health and Healthy Habits, Plans and Celebrations, School
// and Work, Stories and Achievements) are now fully authored here, following
// Unit 1's reference pattern. All ten units share one continuous story
// (Sarah, in Manchester, and her boyfriend Daniel) so the course reads as a
// single narrative from Unit 1 to Unit 10, the same device
// english-a1-units.js and french-a1-units.js already use.
//
// Differences from the A1 pattern, deliberate for A2 (see the task this was
// written against):
//   - reading.parts is NOT used - each reading is a single continuous text
//     (350-550 words), never split into "Part 1 of 3" pages. shapeReading()
//     in build-english-a2-seed.js only fills reading.text from parts when
//     parts exists, so a plain reading.text works exactly like A1's already
//     does after its parts are joined - no renderer change needed.
//   - No `ordering` field and no true/false-phrased mcq options anywhere
//     (A1 uses both) - every exercise here is single-answer, 4-option mcq.
//   - accessTier marks units 1-2 free and 3-10 premium, same field/mechanism
//     already used by french-a1-units.js (units 1-2 free, 3-12 premium) -
//     not a new gating system.
const DEFAULTS = {
  reading: { duration: 15, xp: 30 },
  listening: { duration: 12, xp: 25 },
  speaking: { duration: 10, xp: 25 },
  writing: { duration: 15, xp: 30 },
  grammar: { duration: 12, xp: 25 },
  vocabulary: { duration: 12, xp: 25 }
};

function activity(skill, fields) {
  return { skill, duration: DEFAULTS[skill].duration, xp: DEFAULTS[skill].xp, ...fields };
}

const units = [
  // ---------------------------------------------------------------
  {
    slug: 'everyday-life',
    title: 'Everyday Life',
    titleEs: 'La vida cotidiana',
    description: 'Routines, schedules and activities happening right now.',
    order: 1,
    accessTier: 'free',
    unitOverview: {
      objective: 'Hablar de rutinas diarias, horarios y lo que está pasando en este momento.',
      outcomes: [
        'describir tu rutina diaria con adverbios de frecuencia',
        'distinguir cuándo usar Present Simple y cuándo Present Continuous',
        'hablar de tareas domésticas y del tiempo libre',
        'entender y escribir un correo o mensaje sobre tu semana'
      ],
      grammar: ['Present Simple vs. Present Continuous'],
      vocabulary: ['daily routines', 'time expressions', 'household activities'],
      scenario: 'Una semana normal se vuelve especial cuando recibes una visita inesperada.'
    },
    activities: {
      reading: activity('reading', {
        title: 'A Busy Week in Manchester',
        description:
          "Sarah's normal weekly routine changes when her sister comes to visit - a single full-length A2 reading about everyday life, habits, and one memorable weekend.",
        reading: {
          title: 'A Busy Week in Manchester',
          illustration: {
            // File does not exist yet - documented in the delivery report.
            // 16:9, ~360px wide on desktop, subtle-float animation, respects
            // prefers-reduced-motion (see renderReadingIllustrationHtml).
            src: '/assets/readings/english/a2/unit-01-busy-week.webp',
            alt: 'Sarah checking her weekly schedule at her desk in Manchester',
            animation: 'subtle-float'
          },
          text:
            'Sarah lives in Manchester and works at a small design company in the city center. Every week looks almost the same for her, but this week is a little different, because her sister Lucy is visiting from Leeds.\n\n' +
            'On Monday, Sarah wakes up at half past six, just like every day. She has a quick breakfast, checks her emails, and takes the bus to work at eight o\'clock. She usually finishes work at five and goes straight home. But this Monday, she picks Lucy up from the train station at six, so she leaves work a little early.\n\n' +
            'On Tuesday and Wednesday, Sarah follows her normal routine. She goes to the gym after work on Tuesday, and on Wednesday she meets her friend Amy for dinner. Lucy stays at the apartment and explores the city on her own. She visits the market and buys some fruit and cheese for later.\n\n' +
            'Thursday is different, because Sarah is working from home today. She and Lucy have breakfast together and talk about their plans for the weekend. In the afternoon, Sarah has three online meetings, so Lucy reads a book in the living room and waits patiently.\n\n' +
            'On Friday evening, everything changes. Sarah finishes work early, and the two sisters take the train to the countryside. They stay at a small hotel near a lake. First, they walk around the lake and take photos. Then, they have dinner at a small restaurant that Lucy found online. The food is delicious, and they talk for hours about their family and their childhood.\n\n' +
            'On Saturday, they wake up late because they are tired from the trip. They have a big breakfast at the hotel, and after that, they go for a long walk in the hills. The weather is sunny, so they decide to have a picnic near the lake. It is a perfect afternoon.\n\n' +
            'On Sunday, they take the train back to Manchester. Sarah feels happy but a little sad, because Lucy is leaving on Monday morning. "This was a great week," Lucy says at the station. "Yes, it was," Sarah answers, "but next time, you have to visit for longer!"\n\n' +
            "Sarah's normal week is usually busy and predictable, but this week she had a wonderful surprise. She learned that a small change in her routine can make a big difference.",
          questions: [
            '¿Qué parte de la rutina de Sarah se parece más a la tuya?',
            'Escribe dos frases sobre un cambio inesperado que hizo especial a una semana normal para ti.'
          ]
        },
        exercises: [
          { type: 'mcq', prompt: 'What is the reading mainly about?', options: ['A business trip to Leeds', "A normal week that becomes special because of a visit", 'A new job in Manchester', 'A problem at the design company'], answer: 1 },
          { type: 'mcq', prompt: 'What does Sarah usually do right after breakfast on a normal day?', options: ['She goes to the gym', 'She checks her emails', 'She meets Amy for dinner', 'She takes the train to the countryside'], answer: 1 },
          { type: 'mcq', prompt: 'Why does Sarah leave work early on Monday?', options: ['She feels sick', "She has an online meeting", 'She has to pick Lucy up from the station', 'The office closes early'], answer: 2 },
          { type: 'mcq', prompt: 'In the sentence "she goes straight home," what does straight mean here?', options: ['Slowly', 'Directly, without stopping', 'By bus', 'Late'], answer: 1 },
          { type: 'mcq', prompt: 'In "The food is delicious, and they talk for hours," who does they refer to?', options: ['Sarah and Amy', 'Sarah and her boss', 'Sarah and Lucy', 'The waiter and Sarah'], answer: 2 },
          { type: 'mcq', prompt: 'Why do Sarah and Lucy wake up late on Saturday?', options: ['They have no plans', 'They are tired from the trip', 'The hotel is very noisy', 'It is raining outside'], answer: 1 },
          { type: 'mcq', prompt: 'What can you infer about how Sarah feels about the week with Lucy?', options: ['She found it boring', 'She was happy but is sad it is ending', 'She wanted to work instead', 'She did not enjoy the countryside'], answer: 1 },
          { type: 'mcq', prompt: 'What does Sarah mean when she says, "next time, you have to visit for longer"?', options: ['She wants Lucy to leave sooner next time', 'She enjoyed the visit and wants a longer one next time', 'She thinks the trip was too long', 'She is asking Lucy to move to Manchester'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Planning the Visit',
        description: "Listen to Sarah and Lucy's phone call planning the weekend trip mentioned in the reading.",
        intro: 'Listen to the phone call between Sarah and Lucy before the visit. Focus on times, days, and their plans for the weekend.',
        dialogue: [
          { speaker: 'Sarah', line: 'Hi, Lucy! What time does your train arrive on Monday?', translation: 'Hola, Lucy. ¿A qué hora llega tu tren el lunes?' },
          { speaker: 'Lucy', line: 'It arrives at six, just after your work finishes.', translation: 'Llega a las seis, justo cuando terminas de trabajar.' },
          { speaker: 'Sarah', line: "Perfect, I'll leave work a bit early and pick you up.", translation: 'Perfecto, saldré un poco antes del trabajo y te recojo.' },
          { speaker: 'Lucy', line: 'Great! What are we doing this week?', translation: '¡Genial! ¿Qué vamos a hacer esta semana?' },
          { speaker: 'Sarah', line: "I'm working from home on Thursday, so we can relax together in the morning.", translation: 'El jueves trabajo desde casa, así que podemos relajarnos juntas en la mañana.' },
          { speaker: 'Lucy', line: 'Sounds good. And what about the weekend?', translation: 'Suena bien. ¿Y el fin de semana?' },
          { speaker: 'Sarah', line: "On Friday evening, we're taking the train to the countryside. I booked a small hotel near a lake.", translation: 'El viernes en la noche tomamos el tren al campo. Reservé un hotel pequeño cerca de un lago.' },
          { speaker: 'Lucy', line: "That's wonderful! I can't wait.", translation: '¡Qué maravilla! No puedo esperar.' },
          { speaker: 'Sarah', line: "Me neither. See you Monday at six, at the station.", translation: 'Yo tampoco. Nos vemos el lunes a las seis, en la estación.' },
          { speaker: 'Lucy', line: 'See you then, Sarah!', translation: '¡Nos vemos entonces, Sarah!' }
        ],
        phrases: [
          'What time does your train arrive?',
          "I'll pick you up.",
          "I'm working from home.",
          'What about the weekend?',
          "I can't wait."
        ],
        exercises: [
          { type: 'mcq', prompt: 'What time does Lucy arrive on Monday?', options: ['Five o\'clock', 'Six o\'clock', 'Seven o\'clock', 'Eight o\'clock'], answer: 1 },
          { type: 'mcq', prompt: 'Why does Sarah leave work early on Monday?', options: ['She feels tired', 'She has to pick Lucy up', 'She has a meeting', 'The office closes'], answer: 1 },
          { type: 'mcq', prompt: 'What is Sarah doing on Thursday?', options: ['Going to the gym', 'Meeting a friend', 'Working from home', 'Traveling to Leeds'], answer: 2 },
          { type: 'mcq', prompt: 'Where are Sarah and Lucy going on Friday evening?', options: ['To a restaurant in the city', 'To the countryside, near a lake', 'To the train station only', 'To a hotel in Leeds'], answer: 1 },
          { type: 'mcq', prompt: 'Who booked the hotel?', options: ['Lucy', 'Sarah', 'Amy', 'Neither of them'], answer: 1 },
          { type: 'mcq', prompt: 'How does Lucy feel about the plan?', options: ['Bored', 'Worried', 'Excited', 'Confused'], answer: 2 },
          { type: 'mcq', prompt: 'Where will Sarah pick Lucy up?', options: ['At the hotel', 'At the office', 'At the station', 'At the lake'], answer: 2 },
          { type: 'mcq', prompt: 'Which best describes the purpose of the call?', options: ['To cancel the visit', 'To plan the week and weekend together', 'To complain about work', 'To book a train ticket'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'My Routine vs. Today',
        description: 'Compare what you usually do with what is happening today or right now.',
        mission:
          "Talk about your usual routine using the Present Simple, then compare it with something different happening today or right now, using the Present Continuous.",
        phrases: [
          'I usually...',
          'But today, I...',
          'Right now, I...',
          'On a normal day, I... / This week, I...'
        ],
        dialogue: [
          { speaker: 'You', line: 'I usually wake up at seven and take the bus to work.', translation: 'Normalmente me despierto a las siete y tomo el autobús al trabajo.' },
          { speaker: 'Partner', line: 'And what are you doing differently today?', translation: '¿Y qué estás haciendo diferente hoy?' },
          { speaker: 'You', line: "Today I'm working from home, so I'm having breakfast much later.", translation: 'Hoy estoy trabajando desde casa, así que estoy desayunando mucho más tarde.' },
          { speaker: 'Partner', line: 'That sounds nice. Do you usually have more free time?', translation: 'Suena bien. ¿Normalmente tienes más tiempo libre?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say three sentences about your usual weekly routine using the Present Simple (e.g. "I usually...", "Every day, I...").', answer: 'Oral practice' },
          { type: 'speaking', prompt: 'Now say two sentences about something different happening today or right now, using the Present Continuous.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the routine-vs-today dialogue with a partner, then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'A Normal Day and a Special Day',
        description: 'Write about one of your normal days and one special day that was different.',
        mission:
          'Write two short paragraphs (80-130 words in total): one about a normal day in your routine, and one about a day that was special or different, like Sarah\'s week in the reading.',
        phrases: [
          'On a normal day, I...',
          'I usually...',
          'But last..., something different happened.',
          'First..., then..., after that...',
          'It was a great/special day because...'
        ],
        dialogue: [
          {
            speaker: 'Model',
            line:
              'On a normal day, I wake up at seven and go to work by bus. I usually have lunch at my desk and get home at six. But last Saturday was different. First, my best friend visited from another city. Then, we walked around the old town and had lunch at a small restaurant. After that, we watched a movie at home. It was a special day because I don\'t see my friend very often.',
            translation:
              'En un día normal, me despierto a las siete y voy al trabajo en autobús. Normalmente almuerzo en mi escritorio y llego a casa a las seis. Pero el sábado pasado fue diferente. Primero, mi mejor amiga visitó desde otra ciudad. Luego, caminamos por el casco antiguo y almorzamos en un restaurante pequeño. Después, vimos una película en casa. Fue un día especial porque no veo a mi amiga muy seguido.'
          }
        ],
        exercises: [
          {
            type: 'writing',
            prompt:
              'Write 80-130 words in two short paragraphs: (1) your normal daily routine using the Present Simple, and (2) one special day, using sequence connectors (first, then, after that, finally).',
            answer: 'Open answer'
          }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Present Simple vs. Present Continuous',
        description: 'Choose between routines/facts and actions happening right now.',
        grammarNote:
          'Use the Present Simple for routines, habits, and things that are always true, like "I go to work by bus" or "She lives in Manchester." Use the Present Continuous for actions happening right now, at this exact moment, like "I am writing an email" or "They are waiting for the bus."\n\n' +
          'A common mistake is using the Present Continuous for permanent routines: say "I go to the gym on Tuesdays," not "I am going to the gym on Tuesdays" as a habit. Time words like every day, usually, and on Saturdays signal the Present Simple; now, right now, and at the moment signal the Present Continuous.\n\n' +
          'Apoyo: usa el Present Simple para rutinas y hechos generales; usa el Present Continuous para acciones que ocurren en este momento.',
        phrases: [
          'I usually... / She always...',
          'Right now, I am... / Look! It is...',
          'every day / on Saturdays / usually',
          'now / right now / at the moment'
        ],
        exercises: [
          { type: 'mcq', prompt: 'My brother ___ football every Saturday.', options: ['play', 'plays', 'is playing', 'playing'], answer: 1 },
          { type: 'mcq', prompt: 'Look! It ___ outside right now.', options: ['rains', 'rain', 'is raining', 'raining'], answer: 2 },
          { type: 'mcq', prompt: 'I usually ___ to work by bus.', options: ['go', 'goes', 'am going', 'going'], answer: 0 },
          { type: 'mcq', prompt: 'She ___ a shower at the moment.', options: ['takes', 'take', 'is taking', 'taking'], answer: 2 },
          { type: 'mcq', prompt: 'We ___ dinner together every evening.', options: ['have', 'has', 'are having', 'having'], answer: 0 },
          { type: 'mcq', prompt: 'Listen! The baby ___.', options: ['cries', 'cry', 'is crying', 'crying'], answer: 2 },
          { type: 'mcq', prompt: 'He never ___ breakfast before school.', options: ['eat', 'eats', 'is eating', 'eating'], answer: 1 },
          { type: 'mcq', prompt: 'Right now, they ___ for the bus.', options: ['wait', 'waits', 'are waiting', 'waiting'], answer: 2 },
          { type: 'mcq', prompt: 'My parents ___ in a small house near the park.', options: ['live', 'lives', 'are living', 'living'], answer: 0 },
          { type: 'mcq', prompt: 'Be quiet, please! I ___ on the phone.', options: ['talk', 'talks', 'am talking', 'talking'], answer: 2 },
          { type: 'mcq', prompt: 'Sara ___ her homework every day after school.', options: ['do', 'does', 'is doing', 'doing'], answer: 1 },
          { type: 'mcq', prompt: 'At the moment, the children ___ in the garden.', options: ['play', 'plays', 'is playing', 'are playing'], answer: 3 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Daily Routines and Household Activities',
        description: 'Key words for routines, time expressions, and things you do at home.',
        vocabulary: [
          { word: 'wake up', translation: 'despertarse', definition: 'To stop sleeping and become awake.', example: 'I wake up at seven every morning.', partOfSpeech: 'verb' },
          { word: 'get dressed', translation: 'vestirse', definition: 'To put on your clothes.', example: 'She gets dressed quickly before school.', partOfSpeech: 'verb' },
          { word: 'have breakfast', translation: 'desayunar', definition: 'To eat the first meal of the day.', example: 'We have breakfast together every day.', partOfSpeech: 'verb' },
          { word: 'commute', translation: 'trasladarse al trabajo', definition: 'The journey you make to get to work or school.', example: 'His commute takes forty minutes by train.', partOfSpeech: 'noun' },
          { word: 'schedule', translation: 'horario', definition: 'A plan that shows when activities happen.', example: 'My schedule is very busy this week.', partOfSpeech: 'noun' },
          { word: 'routine', translation: 'rutina', definition: 'The usual things you do, in the usual order.', example: 'Exercise is part of my daily routine.', partOfSpeech: 'noun' },
          { word: 'chore', translation: 'tarea doméstica', definition: 'A small job you do regularly at home.', example: 'Washing the dishes is my least favorite chore.', partOfSpeech: 'noun' },
          { word: 'tidy up', translation: 'ordenar', definition: 'To make a place clean and organized.', example: 'I tidy up my room every Sunday.', partOfSpeech: 'verb' },
          { word: 'do the laundry', translation: 'lavar la ropa', definition: 'To wash and dry clothes.', example: 'He does the laundry on Saturdays.', partOfSpeech: 'verb' },
          { word: 'take out the trash', translation: 'sacar la basura', definition: 'To carry the rubbish outside the house.', example: 'Can you take out the trash tonight?', partOfSpeech: 'verb' },
          { word: 'errand', translation: 'diligencia', definition: 'A short trip to do a small task.', example: 'I need to run a few errands this afternoon.', partOfSpeech: 'noun' },
          { word: 'appointment', translation: 'cita', definition: 'An arranged time to meet someone or visit somewhere.', example: 'I have a dentist appointment at four o\'clock.', partOfSpeech: 'noun' },
          { word: 'nap', translation: 'siesta', definition: 'A short sleep, usually during the day.', example: 'My grandfather takes a short nap after lunch.', partOfSpeech: 'noun' },
          { word: 'household', translation: 'del hogar', definition: 'Relating to a home and the people living in it.', example: 'Cooking is one of my household responsibilities.', partOfSpeech: 'adjective' },
          { word: 'exhausted', translation: 'agotado/a', definition: 'Extremely tired.', example: 'I feel exhausted after a long day at work.', partOfSpeech: 'adjective' },
          { word: 'relax', translation: 'relajarse', definition: 'To rest and stop worrying or working.', example: 'I like to relax on the sofa after dinner.', partOfSpeech: 'verb' },
          { word: 'spare time', translation: 'tiempo libre', definition: 'Time when you are not working or studying.', example: 'In my spare time, I read or watch films.', partOfSpeech: 'noun' },
          { word: 'deadline', translation: 'fecha límite', definition: 'The time by which something must be finished.', example: 'The report deadline is next Friday.', partOfSpeech: 'noun' },
          { word: 'oversleep', translation: 'quedarse dormido', definition: 'To sleep longer than you planned.', example: 'I overslept and missed the bus this morning.', partOfSpeech: 'verb' },
          { word: 'get ready', translation: 'alistarse', definition: 'To prepare yourself to leave or start something.', example: 'It takes me twenty minutes to get ready.', partOfSpeech: 'verb' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does "wake up" mean?', options: ['To go to sleep', 'To stop sleeping and become awake', 'To eat breakfast', 'To get dressed'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "a plan that shows when activities happen"?', options: ['Routine', 'Schedule', 'Chore', 'Errand'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "extremely tired"?', options: ['Relaxed', 'Household', 'Exhausted', 'Ready'], answer: 2 },
          { type: 'mcq', prompt: '"Washing the dishes" is an example of a...', options: ['schedule', 'chore', 'nap', 'deadline'], answer: 1 },
          { type: 'mcq', prompt: 'Complete: "I need to run a few ___ this afternoon."', options: ['naps', 'errands', 'chores', 'schedules'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "a short sleep during the day"?', options: ['Commute', 'Deadline', 'Nap', 'Routine'], answer: 2 },
          { type: 'mcq', prompt: 'What does "get ready" mean?', options: ['To relax', 'To prepare yourself to leave or start something', 'To sleep longer than planned', 'To do a household chore'], answer: 1 },
          { type: 'mcq', prompt: 'Which sentence uses "oversleep" correctly?', options: ['I overslept and missed the bus.', 'I oversleep the dishes every day.', 'She overslept a meeting on time.', 'We oversleep breakfast together.'], answer: 0 },
          { type: 'mcq', prompt: 'Which word best completes: "The report ___ is next Friday"?', options: ['errand', 'deadline', 'nap', 'commute'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "time when you are not working or studying"?', options: ['Spare time', 'Household', 'Appointment', 'Chore'], answer: 0 },
          { type: 'mcq', prompt: 'Which situation best matches "I have a dentist appointment"?', options: ['You are meeting the dentist at an arranged time', 'You are doing a household chore', 'You are taking a nap', 'You are commuting to work'], answer: 0 },
          { type: 'mcq', prompt: 'Which word means "to make a place clean and organized"?', options: ['Tidy up', 'Relax', 'Oversleep', 'Commute'], answer: 0 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'family-and-relationships',
    title: 'Family and Relationships',
    titleEs: 'La familia y las relaciones',
    description: 'Family members, personalities, and a big Sunday lunch with the whole family.',
    order: 2,
    accessTier: 'free',
    unitOverview: {
      objective: 'Hablar de tu familia, describir personalidades y relaciones usando have got/has got.',
      outcomes: [
        'describir a los miembros de tu familia y sus características',
        'usar have got / has got para hablar de posesiones y rasgos físicos',
        'usar el genitivo sajón (\'s) para mostrar relaciones y pertenencia',
        'entender un texto sobre una reunión familiar'
      ],
      grammar: ["Have got / Has got", "Possessive 's"],
      vocabulary: ['family members', 'relationships', 'personality adjectives'],
      scenario: 'La familia de Sarah se reúne cada mes para un gran almuerzo dominical, y hoy Sarah lleva a alguien nuevo.'
    },
    activities: {
      reading: activity('reading', {
        title: 'A Sunday Lunch with the Whole Family',
        description:
          "Sarah's family gathers for their monthly Sunday lunch, and this time she brings someone new to meet everyone.",
        reading: {
          title: 'A Sunday Lunch with the Whole Family',
          illustration: {
            src: '/assets/readings/english/a2/unit-02-sunday-lunch.webp',
            alt: "Sarah's family sitting around a table for Sunday lunch",
            animation: 'subtle-float'
          },
          text:
            "Sarah's family has a tradition: on the first Sunday of every month, everyone meets at her parents' house for a big lunch. Today is one of those Sundays, and the house is full of noise, laughter, and the smell of roast chicken.\n\n" +
            "Sarah's parents, Michael and Diane, live in a small house with a big garden near Manchester. Michael has got short grey hair and a loud, friendly laugh. Diane has got long dark hair, and she loves cooking for the whole family. Every month, she spends the whole morning in the kitchen.\n\n" +
            "Sarah's sister Lucy arrives first, with a bottle of wine and a big smile. \"I've got some news,\" she says, but she doesn't explain yet. A few minutes later, their grandmother, Rose, arrives too. She is eighty-two years old, and she still walks to the house every Sunday, with her small dog, Biscuit.\n\n" +
            "Sarah's aunt Carol and uncle Tom come next, with their son, Jake. Jake is Sarah's cousin, and he is only ten years old, but he has got a lot of energy. He runs straight into the garden to play football with Biscuit.\n\n" +
            "At one o'clock, everyone sits down at the big table in the dining room. There are nine people today: Sarah, Lucy, their parents, their grandmother, their aunt and uncle, their cousin Jake, and Sarah's new boyfriend, Daniel, who is meeting the family for the first time.\n\n" +
            '"So, Daniel," says Michael, "what\'s your job?" Daniel explains that he\'s a teacher at a secondary school in the city. Diane asks him lots of questions about his family, his hobbies, and his favourite food. Daniel answers every question calmly, and by the end of lunch, he already feels like part of the family.\n\n' +
            "After lunch, Lucy finally shares her news. \"I've got a new flat in Leeds,\" she says, \"with a spare room for visitors!\" Everyone is happy for her, and Sarah promises to visit soon.\n\n" +
            "In the afternoon, Jake and Biscuit play in the garden, Rose falls asleep in the armchair, and the adults have coffee and talk about old family stories. Sarah's family isn't perfect, and lunch is often loud and a little chaotic, but she wouldn't change it for anything.\n\n" +
            '"Same time next month?" asks Diane, as everyone says goodbye at the door. "Of course," Sarah answers. "We wouldn\'t miss it."',
          questions: [
            '¿Tu familia tiene una tradición parecida a la de Sarah? Descríbela.',
            'Escribe dos frases sobre un miembro de tu familia, usando has got.'
          ]
        },
        exercises: [
          { type: 'mcq', prompt: 'What is the reading mainly about?', options: ['A birthday party', "A family's monthly Sunday lunch tradition", 'A trip to Leeds', "Daniel's new job"], answer: 1 },
          { type: 'mcq', prompt: 'Who cooks lunch every month?', options: ['Rose', 'Lucy', 'Diane, Sarah\'s mother', 'Carol'], answer: 2 },
          { type: 'mcq', prompt: "What does Rose bring with her every Sunday?", options: ['A bottle of wine', 'Her dog, Biscuit', 'A cake', 'Her grandson Jake'], answer: 1 },
          { type: 'mcq', prompt: 'Why is Daniel at lunch?', options: ['He is Diane\'s brother', 'He is meeting the family for the first time', 'He is Jake\'s teacher', 'He lives next door'], answer: 1 },
          { type: 'mcq', prompt: 'In "lunch is often loud and a little chaotic," what does chaotic mean?', options: ['Very quiet and calm', 'Boring and slow', 'Disorganized and busy', 'Sad'], answer: 2 },
          { type: 'mcq', prompt: 'What news does Lucy share after lunch?', options: ['She has a new job', 'She has a new flat in Leeds', 'She is moving to Manchester', 'She is getting married'], answer: 1 },
          { type: 'mcq', prompt: 'What can you infer about how Sarah feels about her family?', options: ['She finds them boring', 'She loves them, even though lunch is chaotic', 'She rarely sees them', 'She prefers to eat alone'], answer: 1 },
          { type: 'mcq', prompt: 'What does Diane mean by "Same time next month?"', options: ['She is planning a different event', 'She is confirming the next monthly lunch', 'She is asking Daniel to leave', 'She is talking about work'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Meeting the Family',
        description: 'Listen to Sarah and Lucy talking on the phone the night before the Sunday lunch.',
        intro: "Listen to Sarah and Lucy's phone call the night before lunch. Focus on the family details and Lucy's questions about Daniel.",
        dialogue: [
          { speaker: 'Lucy', line: "Hi, Sarah! Are you ready for tomorrow? Daniel's finally meeting everyone!", translation: '¡Hola, Sarah! ¿Estás lista para mañana? ¡Daniel por fin va a conocer a todos!' },
          { speaker: 'Sarah', line: "I know, I'm a little nervous. Mum's going to ask him a hundred questions.", translation: 'Lo sé, estoy un poco nerviosa. Mamá le va a hacer cien preguntas.' },
          { speaker: 'Lucy', line: "That's normal! What's Daniel like, exactly?", translation: 'Eso es normal. ¿Cómo es Daniel exactamente?' },
          { speaker: 'Sarah', line: "He's got a great sense of humour, and he's very calm. I think he'll be fine.", translation: 'Tiene mucho sentido del humor y es muy tranquilo. Creo que estará bien.' },
          { speaker: 'Lucy', line: "Has he got any brothers or sisters?", translation: '¿Tiene hermanos o hermanas?' },
          { speaker: 'Sarah', line: "Yes, he's got one younger brother, but he lives in Scotland.", translation: 'Sí, tiene un hermano menor, pero vive en Escocia.' },
          { speaker: 'Lucy', line: "And is Jake going to be there too? He's a lot of energy for a first meeting!", translation: '¿Y Jake también va a estar? ¡Es mucha energía para una primera reunión!' },
          { speaker: 'Sarah', line: "Ha! Yes, he'll probably want to show Daniel his football skills.", translation: '¡Ja! Sí, probablemente querrá mostrarle a Daniel sus habilidades de fútbol.' },
          { speaker: 'Lucy', line: "Well, don't worry. Our family's loud, but we're friendly. Daniel will love it.", translation: 'Bueno, no te preocupes. Nuestra familia es ruidosa, pero somos amigables. A Daniel le encantará.' },
          { speaker: 'Sarah', line: "I hope so! See you tomorrow, Lucy.", translation: '¡Eso espero! Nos vemos mañana, Lucy.' }
        ],
        phrases: [
          "He's got a great sense of humour.",
          'Has he got any brothers or sisters?',
          "I'm a little nervous.",
          "Don't worry.",
          "See you tomorrow."
        ],
        exercises: [
          { type: 'mcq', prompt: 'Why is Sarah a little nervous?', options: ['She is late for lunch', 'Her mum will ask Daniel lots of questions', 'She lost her phone', 'Daniel cancelled'], answer: 1 },
          { type: 'mcq', prompt: "How does Sarah describe Daniel's personality?", options: ['Shy and quiet', 'Funny and calm', 'Serious and strict', 'Loud and energetic'], answer: 1 },
          { type: 'mcq', prompt: "Has Daniel got any siblings?", options: ['No, he is an only child', 'Yes, one younger brother', 'Yes, two older sisters', 'Yes, a twin sister'], answer: 1 },
          { type: 'mcq', prompt: 'Where does Daniel\'s brother live?', options: ['Leeds', 'Manchester', 'Scotland', 'London'], answer: 2 },
          { type: 'mcq', prompt: 'What does Lucy say about Jake?', options: ['He is shy with new people', "He'll probably show Daniel his football skills", 'He is not coming tomorrow', 'He does not like football'], answer: 1 },
          { type: 'mcq', prompt: 'How does Lucy describe their family?', options: ['Quiet and formal', 'Loud but friendly', 'Small and serious', 'Distant'], answer: 1 },
          { type: 'mcq', prompt: 'What is the purpose of this phone call?', options: ['To cancel the lunch', 'To talk about Daniel before he meets the family', 'To plan a trip to Scotland', 'To argue about Jake'], answer: 1 },
          { type: 'mcq', prompt: 'What does Lucy mean by "Daniel will love it"?', options: ['Daniel will love the food', 'Daniel will enjoy the loud, friendly family', 'Daniel will love Manchester', 'Daniel will love playing football'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Describing My Family',
        description: "Describe your own family members using have got/has got and possessive 's.",
        mission:
          "Describe three members of your family: who they are, what they look like or have got, and one thing about their personality.",
        phrases: [
          "My... has got...",
          "He's/She's got a great sense of humour.",
          "My sister's name is...",
          "We're a big/small family."
        ],
        dialogue: [
          { speaker: 'You', line: "I've got a big family. My mum has got dark hair and she's very kind.", translation: 'Tengo una familia grande. Mi mamá tiene el pelo oscuro y es muy amable.' },
          { speaker: 'Partner', line: "Have you got any brothers or sisters?", translation: '¿Tienes hermanos o hermanas?' },
          { speaker: 'You', line: "Yes, I've got one brother. He's got a lot of energy, like Jake in the story!", translation: 'Sí, tengo un hermano. Tiene mucha energía, ¡como Jake en la historia!' },
          { speaker: 'Partner', line: "That sounds like a fun family lunch!", translation: '¡Eso suena como un almuerzo familiar divertido!' }
        ],
        exercises: [
          { type: 'speaking', prompt: "Describe three members of your family using have got/has got (appearance or possessions).", answer: 'Oral practice' },
          { type: 'speaking', prompt: "Now say one sentence about each person's personality, using an adjective.", answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the dialogue about describing family with a partner, then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'My Family Tree',
        description: 'Write a short description of your family, like the one about Sarah\'s family lunch.',
        mission:
          "Write 80-130 words describing your family: who is in it, what they are like, and one family tradition or gathering you have (like Sarah's Sunday lunch).",
        phrases: [
          "My family is...",
          "My... has got...",
          "Every..., we...",
          "I love my family because..."
        ],
        dialogue: [
          {
            speaker: 'Model',
            line:
              "My family is quite small. I've got one sister and two parents. My sister's name is Elena, and she's got a great sense of humour - she always makes us laugh. My dad has got grey hair and he loves cooking, just like Diane in the story. Every Sunday, we have lunch together at my grandmother's house. It's not always calm, but it's always fun. I love my family because we're always there for each other, even when things are chaotic.",
            translation:
              'Mi familia es bastante pequeña. Tengo una hermana y dos padres. Mi hermana se llama Elena y tiene mucho sentido del humor; siempre nos hace reír. Mi papá tiene el pelo canoso y le encanta cocinar, igual que Diane en la historia. Cada domingo almorzamos juntos en casa de mi abuela. No siempre es tranquilo, pero siempre es divertido. Amo a mi familia porque siempre estamos ahí para el otro, incluso cuando las cosas están caóticas.'
          }
        ],
        exercises: [
          {
            type: 'writing',
            prompt:
              "Write 80-130 words about your family: who is in it, at least two descriptions using has got, and one family tradition or gathering.",
            answer: 'Open answer'
          }
        ]
      }),
      grammar: activity('grammar', {
        title: "Have Got / Has Got and Possessive 's",
        description: "Talk about family, possessions and appearance with have got/has got and the possessive 's.",
        grammarNote:
          "Use have got (I/you/we/they) and has got (he/she/it) to talk about what people have, including family members, possessions, and physical features: \"I've got a brother,\" \"She has got long hair.\" The negative is haven't got / hasn't got, and the question is Have you got...? / Has he got...?\n\n" +
          "Use the possessive 's to show who something belongs to or a relationship: \"Sarah's sister,\" \"my grandmother's dog.\" For plural nouns already ending in -s, just add an apostrophe: \"my parents' house.\"\n\n" +
          "Apoyo: usa have got/has got para hablar de lo que alguien tiene (familia, posesiones, apariencia); usa 's para mostrar posesión o relación entre personas.",
        phrases: [
          "I've got.../ She's got...",
          "Have you got...? / Has he got...?",
          "I haven't got... / She hasn't got...",
          "Sarah's sister / my parents' house"
        ],
        exercises: [
          { type: 'mcq', prompt: 'My brother ___ a new bike.', options: ['have got', 'has got', 'is got', 'got has'], answer: 1 },
          { type: 'mcq', prompt: '___ you got any pets?', options: ['Do', 'Have', 'Has', 'Are'], answer: 1 },
          { type: 'mcq', prompt: 'This is ___ car, not mine.', options: ['Sarah', "Sarah's", "Sarahs'", 'of Sarah'], answer: 1 },
          { type: 'mcq', prompt: 'We ___ got a big garden.', options: ['has', "haven't", "have", 'is'], answer: 2 },
          { type: 'mcq', prompt: 'She ___ got two brothers.', options: ['have', 'has', "haven't", 'is'], answer: 1 },
          { type: 'mcq', prompt: 'I like their house - it ___ got a lovely kitchen.', options: ['have', 'has', "haven't", 'am'], answer: 1 },
          { type: 'mcq', prompt: 'Those are the ___ shoes, not the children\'s.', options: ['parent', "parents'", "parent's", 'parents'], answer: 1 },
          { type: 'mcq', prompt: 'He ___ got a car - he always takes the bus.', options: ["hasn't", "haven't", 'has', 'is'], answer: 0 },
          { type: 'mcq', prompt: '___ your sister got a job yet?', options: ['Do', 'Is', 'Has', 'Have'], answer: 2 },
          { type: 'mcq', prompt: 'My ___ dog is called Biscuit.', options: ['grandmother', "grandmother's", "grandmothers'", 'of grandmother'], answer: 1 },
          { type: 'mcq', prompt: 'They ___ got a lot of free time this week.', options: ['has', "haven't", 'is', "isn't"], answer: 1 },
          { type: 'mcq', prompt: 'What colour hair ___ she got?', options: ['have', 'has', 'is', 'does'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Family Members and Relationships',
        description: 'Key words for family, relationships, and describing personality.',
        vocabulary: [
          { word: 'sibling', translation: 'hermano/a', definition: 'A brother or a sister.', example: 'I have two siblings, a brother and a sister.', partOfSpeech: 'noun' },
          { word: 'grandparent', translation: 'abuelo/a', definition: 'The parent of your mother or father.', example: 'My grandparents live in a small village.', partOfSpeech: 'noun' },
          { word: 'cousin', translation: 'primo/a', definition: "The child of your aunt or uncle.", example: 'My cousin Jake loves football.', partOfSpeech: 'noun' },
          { word: 'relative', translation: 'pariente', definition: 'A member of your family.', example: 'We have relatives all over the country.', partOfSpeech: 'noun' },
          { word: 'in-laws', translation: 'suegros/familia política', definition: "Your husband's or wife's family.", example: 'My in-laws are visiting next weekend.', partOfSpeech: 'noun' },
          { word: 'only child', translation: 'hijo/a único/a', definition: 'A child with no brothers or sisters.', example: 'She is an only child, so she has no siblings.', partOfSpeech: 'noun phrase' },
          { word: 'twin', translation: 'gemelo/a', definition: 'One of two children born to the same mother at the same time.', example: 'My twin brother and I look very similar.', partOfSpeech: 'noun' },
          { word: 'close', translation: 'cercano/unido', definition: 'Having a strong relationship with someone.', example: 'I am very close to my grandmother.', partOfSpeech: 'adjective' },
          { word: 'resemble', translation: 'parecerse a', definition: 'To look similar to someone.', example: 'Sarah really resembles her mother.', partOfSpeech: 'verb' },
          { word: 'get on well (with)', translation: 'llevarse bien (con)', definition: 'To have a good relationship with someone.', example: 'I get on well with my brother.', partOfSpeech: 'phrasal verb' },
          { word: 'argue', translation: 'discutir', definition: 'To disagree with someone, often loudly.', example: 'Siblings sometimes argue about small things.', partOfSpeech: 'verb' },
          { word: 'reunion', translation: 'reunión (familiar)', definition: 'A meeting of family or friends who have not seen each other for a while.', example: 'The family reunion happens every summer.', partOfSpeech: 'noun' },
          { word: 'generous', translation: 'generoso/a', definition: 'Willing to give money, help, or time.', example: 'My uncle is very generous with his time.', partOfSpeech: 'adjective' },
          { word: 'strict', translation: 'estricto/a', definition: 'Expecting people to follow rules exactly.', example: 'My father was quite strict when I was young.', partOfSpeech: 'adjective' },
          { word: 'easy-going', translation: 'de trato fácil, relajado/a', definition: 'Relaxed and not easily worried or annoyed.', example: 'Daniel is very easy-going, so he fits in well.', partOfSpeech: 'adjective' },
          { word: 'stubborn', translation: 'terco/a', definition: 'Refusing to change your opinion or way of doing things.', example: 'My grandmother is lovely but very stubborn.', partOfSpeech: 'adjective' },
          { word: 'supportive', translation: 'que brinda apoyo', definition: 'Giving help and encouragement.', example: 'My family is always supportive of my decisions.', partOfSpeech: 'adjective' },
          { word: 'raise (a child)', translation: 'criar (a un hijo)', definition: 'To care for a child until they are an adult.', example: 'They raised three children in that house.', partOfSpeech: 'verb' },
          { word: 'household', translation: 'hogar/casa', definition: 'A home and the people who live there together.', example: 'There are five people in our household.', partOfSpeech: 'noun' },
          { word: 'extended family', translation: 'familia extendida', definition: 'Family members beyond parents and siblings, like aunts, uncles, and cousins.', example: 'We invited our extended family to the wedding.', partOfSpeech: 'noun phrase' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What is a "sibling"?', options: ['A cousin', 'A brother or a sister', 'A grandparent', 'An in-law'], answer: 1 },
          { type: 'mcq', prompt: 'Which word describes someone with no brothers or sisters?', options: ['Twin', 'Only child', 'Sibling', 'Cousin'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "to look similar to someone"?', options: ['Argue', 'Resemble', 'Raise', 'Get on well'], answer: 1 },
          { type: 'mcq', prompt: '"My uncle always shares what he has and helps others" describes someone who is...', options: ['strict', 'stubborn', 'generous', 'easy-going'], answer: 2 },
          { type: 'mcq', prompt: 'Which word means "relaxed and not easily annoyed"?', options: ['Strict', 'Easy-going', 'Stubborn', 'Supportive'], answer: 1 },
          { type: 'mcq', prompt: 'Complete: "My brother and I ___ well - we rarely argue."', options: ['get on', 'resemble', 'raise', 'argue'], answer: 0 },
          { type: 'mcq', prompt: 'Which word means "a meeting of family after a long time apart"?', options: ['Household', 'Reunion', 'In-laws', 'Extended family'], answer: 1 },
          { type: 'mcq', prompt: 'Your husband\'s parents are your...', options: ['siblings', 'in-laws', 'cousins', 'twins'], answer: 1 },
          { type: 'mcq', prompt: 'Which word describes someone who expects rules to be followed exactly?', options: ['Generous', 'Strict', 'Supportive', 'Easy-going'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "to disagree with someone, often loudly"?', options: ['Argue', 'Resemble', 'Support', 'Raise'], answer: 0 },
          { type: 'mcq', prompt: 'Aunts, uncles, and cousins are part of your...', options: ['household', 'extended family', 'in-laws', 'siblings'], answer: 1 },
          { type: 'mcq', prompt: 'Which word describes a family that always encourages and helps you?', options: ['Stubborn', 'Strict', 'Supportive', 'Distant'], answer: 2 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'home-and-neighborhood',
    title: 'Home and Neighborhood',
    titleEs: 'La casa y el vecindario',
    description: "Sarah visits Lucy's new flat in Leeds and explores rooms, furniture and the neighborhood.",
    order: 3,
    accessTier: 'premium',
    unitOverview: {
      objective: 'Describir casas, habitaciones y vecindarios usando there is/there are y preposiciones de lugar.',
      outcomes: [
        'describir las habitaciones y los muebles de una casa',
        'usar there is / there are para hablar de lo que existe en un lugar',
        'usar preposiciones de lugar (next to, between, opposite, near, on the corner of)',
        'entender un texto sobre una visita a un piso nuevo'
      ],
      grammar: ['There is / There are', 'Prepositions of place'],
      vocabulary: ['rooms and furniture', 'neighborhood places', 'describing a home'],
      scenario: 'Sarah visita el piso nuevo de Lucy en Leeds por primera vez y descubre su vecindario.'
    },
    activities: {
      reading: activity('reading', {
        title: "A Weekend in Lucy's New Flat",
        description: "Sarah visits Lucy's new flat in Leeds for the first time and explores the neighborhood.",
        reading: {
          title: "A Weekend in Lucy's New Flat",
          illustration: {
            src: '/assets/readings/english/a2/unit-03-lucys-flat.webp',
            alt: 'Sarah and Lucy standing on the balcony of a new flat',
            animation: 'subtle-float'
          },
          text:
            "Sarah takes the train to Leeds on Saturday morning to see Lucy's new flat for the first time. Lucy meets her at the station with a huge smile. \"Come on, it's only a ten-minute walk from here!\"\n\n" +
            "Lucy's new flat is on the second floor of an old building near the city centre. There is a small balcony at the front, with a good view of the street below. Inside, there are two bedrooms, a bathroom, and a large open kitchen and living room. \"I love the kitchen,\" Lucy says. \"There's so much space to cook, and the light is great in the morning.\"\n\n" +
            "In the living room, there is a comfortable grey sofa next to the window, and a small bookshelf in the corner. There isn't a television yet - Lucy says she prefers to read or listen to music in the evenings. On the wall, there are some black-and-white photos from her trip to Portugal last year.\n\n" +
            "Sarah looks around the second bedroom, the spare room Lucy mentioned at the family lunch. \"This can be your room whenever you visit,\" Lucy says. There is a single bed, a small desk, and a wardrobe, but no other furniture yet. \"It's not finished, but it's a start.\"\n\n" +
            "After exploring the flat, they go outside to see the neighborhood. Lucy's street is quiet, with a small park at the end of it. There is a bakery on the corner, between a pharmacy and a coffee shop, and Lucy says the bread there is amazing. Opposite the building, there is a small supermarket, which is very convenient for quick shopping.\n\n" +
            '"What about restaurants?" Sarah asks. "There are a few good ones near the park," Lucy answers, "and there\'s an excellent Italian place just behind the supermarket." They decide to have lunch there, and it really is delicious.\n\n' +
            "In the afternoon, they walk to the park and sit on a bench under a big tree. From there, they can see the whole neighborhood: the old buildings, the busy main road in the distance, and children playing near the swings.\n\n" +
            '"So, what do you think?" Lucy asks. "I think you made a great choice," Sarah says. "There\'s everything you need here, and it feels friendly." Lucy smiles. "I\'m really happy here. And now you know exactly where to find me."\n\n' +
            'Before Sarah leaves for the train home, Lucy gives her a key to the flat. "For next time," she says. "The spare room is always ready."',
          questions: [
            'Describe tu propia casa o tu habitación favorita usando there is/there are.',
            '¿Qué lugar del vecindario de Lucy te gustaría visitar? ¿Por qué?'
          ]
        },
        exercises: [
          { type: 'mcq', prompt: 'What is the reading mainly about?', options: ['Sarah moving to Leeds', "Sarah's first visit to Lucy's new flat and neighborhood", 'A problem with the flat', 'Lucy looking for a new flat'], answer: 1 },
          { type: 'mcq', prompt: 'How far is the flat from the train station?', options: ['A ten-minute walk', 'A twenty-minute drive', 'A five-minute bus ride', 'It is next to the station'], answer: 0 },
          { type: 'mcq', prompt: "What does Lucy love most about the kitchen?", options: ['The furniture', 'The space and the morning light', 'The view of the park', 'The colour of the walls'], answer: 1 },
          { type: 'mcq', prompt: "Why doesn't the living room have a television?", options: ['It is broken', 'Lucy prefers reading and listening to music', 'There is no space for one', 'Lucy cannot afford one'], answer: 1 },
          { type: 'mcq', prompt: 'In "It\'s not finished, but it\'s a start," what does a start mean here?', options: ['An ending', 'A beginning, not yet complete', 'A mistake', 'A big improvement'], answer: 1 },
          { type: 'mcq', prompt: "Where exactly is the bakery?", options: ['Opposite the building', 'On the corner, between a pharmacy and a coffee shop', 'Behind the supermarket', 'Next to the park'], answer: 1 },
          { type: 'mcq', prompt: 'What can you infer about how Lucy feels about her new home?', options: ['She regrets moving there', 'She is happy and proud of it', 'She is bored of it already', 'She wants to move again soon'], answer: 1 },
          { type: 'mcq', prompt: 'What does Lucy give Sarah before she leaves?', options: ['A book', 'A key to the flat', 'A photo from Portugal', 'Some bread from the bakery'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Calling the Letting Agent',
        description: 'Listen to Lucy on the phone with the letting agent, asking about the flat before she moved in.',
        intro: "Listen to Lucy's phone call with the letting agent before she rented the flat. Focus on the rooms and the neighborhood.",
        dialogue: [
          { speaker: 'Agent', line: 'Hello, this is Leeds City Lettings. How can I help?', translation: 'Hola, habla Leeds City Lettings. ¿En qué puedo ayudarle?' },
          { speaker: 'Lucy', line: "Hi, I'm calling about the flat on Park Street. Is there a balcony?", translation: 'Hola, llamo por el piso en Park Street. ¿Tiene balcón?' },
          { speaker: 'Agent', line: 'Yes, there is a small balcony at the front of the building.', translation: 'Sí, hay un pequeño balcón en la parte frontal del edificio.' },
          { speaker: 'Lucy', line: 'Great. How many bedrooms are there?', translation: 'Genial. ¿Cuántas habitaciones hay?' },
          { speaker: 'Agent', line: "There are two bedrooms, a bathroom, and an open kitchen and living room.", translation: 'Hay dos habitaciones, un baño, y una cocina y sala abiertas.' },
          { speaker: 'Lucy', line: 'Perfect, I need a spare room. Is there a supermarket nearby?', translation: 'Perfecto, necesito un cuarto extra. ¿Hay un supermercado cerca?' },
          { speaker: 'Agent', line: 'Yes, there is one right opposite the building, and a bakery on the corner too.', translation: 'Sí, hay uno justo enfrente del edificio, y también una panadería en la esquina.' },
          { speaker: 'Lucy', line: 'That sounds very convenient. Is it a quiet street?', translation: 'Eso suena muy conveniente. ¿Es una calle tranquila?' },
          { speaker: 'Agent', line: "Yes, quite quiet, and there's a small park at the end of the street.", translation: 'Sí, bastante tranquila, y hay un pequeño parque al final de la calle.' },
          { speaker: 'Lucy', line: "It sounds perfect. I'd like to see it this weekend, please.", translation: 'Suena perfecto. Me gustaría verlo este fin de semana, por favor.' }
        ],
        phrases: [
          'Is there a...?',
          'How many... are there?',
          'There is/are...',
          'Is it a quiet street?',
          "I'd like to see it."
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does Lucy ask about first?', options: ['The kitchen', 'The balcony', 'The bathroom', 'The neighborhood'], answer: 1 },
          { type: 'mcq', prompt: 'How many bedrooms does the flat have?', options: ['One', 'Two', 'Three', 'Four'], answer: 1 },
          { type: 'mcq', prompt: 'Why does Lucy need two bedrooms?', options: ['For an office', 'For a spare room', 'For a second kitchen', 'For storage'], answer: 1 },
          { type: 'mcq', prompt: 'Where is the supermarket?', options: ['On the corner', 'Right opposite the building', 'Next to the park', 'Behind the flat'], answer: 1 },
          { type: 'mcq', prompt: 'What is on the corner of the street?', options: ['A supermarket', 'A bakery', 'A restaurant', 'A pharmacy only'], answer: 1 },
          { type: 'mcq', prompt: 'How does the agent describe the street?', options: ['Busy and noisy', 'Quite quiet', 'Very dangerous', 'Far from everything'], answer: 1 },
          { type: 'mcq', prompt: 'What is at the end of the street?', options: ['A school', 'A small park', 'A train station', 'A hospital'], answer: 1 },
          { type: 'mcq', prompt: 'What does Lucy want to do at the end of the call?', options: ['Cancel her interest', 'See the flat this weekend', 'Ask about the price only', 'Speak to someone else'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Describing My Home and Street',
        description: 'Describe your home and neighborhood using there is/there are and prepositions of place.',
        mission:
          "Describe your home (rooms and furniture) and your street or neighborhood, using there is/there are and at least two prepositions of place.",
        phrases: [
          'There is/are... in my...',
          'Next to / between / opposite / near',
          'On the corner of my street, there is...',
          'My favourite room is... because...'
        ],
        dialogue: [
          { speaker: 'You', line: "In my living room, there is a big sofa next to the window.", translation: 'En mi sala, hay un sofá grande al lado de la ventana.' },
          { speaker: 'Partner', line: "What's near your house?", translation: '¿Qué hay cerca de tu casa?' },
          { speaker: 'You', line: "There's a small shop on the corner, between a bakery and a pharmacy.", translation: 'Hay una tienda pequeña en la esquina, entre una panadería y una farmacia.' },
          { speaker: 'Partner', line: "That sounds convenient, like Lucy's neighborhood!", translation: '¡Eso suena conveniente, como el vecindario de Lucy!' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Describe three rooms in your home and what furniture is in each one, using there is/there are.', answer: 'Oral practice' },
          { type: 'speaking', prompt: 'Now describe your street or neighborhood using at least two prepositions of place.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the dialogue about describing a home and street with a partner, then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'My Ideal Home',
        description: 'Write a short description of your ideal home and its neighborhood.',
        mission:
          "Write 80-130 words describing your ideal home: the rooms, the furniture, and the neighborhood around it, using there is/there are and prepositions of place.",
        phrases: [
          'In my ideal home, there is/are...',
          'My favourite room would be...',
          'Near my house, there is...',
          'It would be perfect because...'
        ],
        dialogue: [
          {
            speaker: 'Model',
            line:
              "My ideal home is a small flat in the city, like Lucy's. There are two bedrooms, a large kitchen, and a balcony with a view of the park. In the living room, there is a comfortable sofa next to a big window, and a bookshelf in the corner. Near my house, there is a bakery, a small supermarket, and a quiet park with a bench under a tree. It would be perfect because everything I need is close, and the neighborhood feels friendly and safe.",
            translation:
              'Mi casa ideal es un piso pequeño en la ciudad, como el de Lucy. Hay dos habitaciones, una cocina grande y un balcón con vista al parque. En la sala hay un sofá cómodo al lado de una ventana grande, y un librero en la esquina. Cerca de mi casa hay una panadería, un supermercado pequeño y un parque tranquilo con una banca bajo un árbol. Sería perfecto porque todo lo que necesito está cerca, y el vecindario se siente amigable y seguro.'
          }
        ],
        exercises: [
          {
            type: 'writing',
            prompt:
              "Write 80-130 words describing your ideal home and neighborhood, using there is/there are and at least two prepositions of place.",
            answer: 'Open answer'
          }
        ]
      }),
      grammar: activity('grammar', {
        title: 'There is / There are and Prepositions of Place',
        description: 'Talk about what exists in a place and exactly where it is.',
        grammarNote:
          'Use there is with singular/uncountable nouns and there are with plural nouns to say that something exists: "There is a park near my house," "There are two bedrooms." The negative is there isn\'t / there aren\'t, and the question is Is there...? / Are there...?\n\n' +
          "Prepositions of place tell us exactly where something is: next to (beside), between (in the middle of two things), opposite (facing), near (close to), and on the corner of (where two streets meet). Example: \"The bakery is on the corner, between a pharmacy and a coffee shop.\"\n\n" +
          'Apoyo: usa there is/are para decir que algo existe en un lugar; usa preposiciones de lugar para decir exactamente dónde está.',
        phrases: [
          "There is a... / There are...",
          "Is there...? / Are there...?",
          'next to / between / opposite / near',
          'on the corner of...'
        ],
        exercises: [
          { type: 'mcq', prompt: '___ a park near my house.', options: ['There is', 'There are', 'There has', 'Is there'], answer: 0 },
          { type: 'mcq', prompt: '___ two bathrooms in the flat.', options: ['There is', 'There are', 'There has', 'Is there'], answer: 1 },
          { type: 'mcq', prompt: '___ a supermarket on this street?', options: ['There is', 'Is there', 'There are', 'Are'], answer: 1 },
          { type: 'mcq', prompt: 'The bookshelf is ___ the window.', options: ['between', 'next to', 'opposite of', 'near of'], answer: 1 },
          { type: 'mcq', prompt: 'The bakery is ___ a pharmacy and a coffee shop.', options: ['next to', 'opposite', 'between', 'on'], answer: 2 },
          { type: 'mcq', prompt: 'The supermarket is ___ the building, so it is very convenient.', options: ['opposite', 'between', 'on the corner', 'far'], answer: 0 },
          { type: 'mcq', prompt: '___ any good restaurants near the park?', options: ['Is there', 'Are there', 'There is', 'There are'], answer: 1 },
          { type: 'mcq', prompt: 'There ___ a television in the living room yet.', options: ["isn't", "aren't", 'is', 'are'], answer: 0 },
          { type: 'mcq', prompt: 'The shop is ___ my street, where it meets the main road.', options: ['between', 'on the corner of', 'opposite', 'next'], answer: 1 },
          { type: 'mcq', prompt: '___ many parks in this neighborhood.', options: ['There is', 'There are', 'Is there', 'There has'], answer: 1 },
          { type: 'mcq', prompt: 'Our house is ___ the school, so we can see it from the window.', options: ['opposite', 'between', 'on the corner', 'next'], answer: 0 },
          { type: 'mcq', prompt: '___ a desk and a wardrobe in the spare room.', options: ['There is', 'There are', 'Is there', 'Are there'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Rooms, Furniture and the Neighborhood',
        description: 'Key words for describing a home, its furniture, and the places around it.',
        vocabulary: [
          { word: 'balcony', translation: 'balcón', definition: 'A small platform outside an upstairs window or door.', example: 'There is a small balcony at the front of the flat.', partOfSpeech: 'noun' },
          { word: 'wardrobe', translation: 'armario/ropero', definition: 'A large piece of furniture for storing clothes.', example: 'The wardrobe in the spare room is quite small.', partOfSpeech: 'noun' },
          { word: 'bookshelf', translation: 'librero/estante', definition: 'A piece of furniture with shelves for books.', example: 'There is a bookshelf in the corner of the living room.', partOfSpeech: 'noun' },
          { word: 'convenient', translation: 'conveniente', definition: 'Easy to use or useful for a particular purpose.', example: 'The supermarket opposite the flat is very convenient.', partOfSpeech: 'adjective' },
          { word: 'spare room', translation: 'cuarto de huéspedes', definition: 'An extra bedroom for guests.', example: 'The spare room is always ready for visitors.', partOfSpeech: 'noun phrase' },
          { word: 'view', translation: 'vista', definition: 'What you can see from a particular place.', example: 'There is a good view of the street from the balcony.', partOfSpeech: 'noun' },
          { word: 'pharmacy', translation: 'farmacia', definition: 'A shop that sells medicine.', example: 'The bakery is between a pharmacy and a coffee shop.', partOfSpeech: 'noun' },
          { word: 'bakery', translation: 'panadería', definition: 'A shop that sells bread and cakes.', example: 'The bread from the local bakery is delicious.', partOfSpeech: 'noun' },
          { word: 'landlord / letting agent', translation: 'arrendador / agente inmobiliario', definition: 'A person or company that rents flats or houses to tenants.', example: 'Lucy called the letting agent to ask about the flat.', partOfSpeech: 'noun' },
          { word: 'furnished', translation: 'amueblado', definition: 'Having furniture already in it.', example: 'The flat was partly furnished when Lucy moved in.', partOfSpeech: 'adjective' },
          { word: 'move in', translation: 'mudarse (a un lugar)', definition: 'To start living in a new home.', example: 'Lucy moved in to her new flat last month.', partOfSpeech: 'phrasal verb' },
          { word: 'rent', translation: 'alquiler / alquilar', definition: 'Money paid regularly to live in a place you do not own; or to pay to use something.', example: 'The rent for her flat is not too expensive.', partOfSpeech: 'noun/verb' },
          { word: 'neighborhood', translation: 'vecindario', definition: 'The area around your home.', example: 'The neighborhood feels friendly and safe.', partOfSpeech: 'noun' },
          { word: 'quiet', translation: 'tranquilo/silencioso', definition: 'With little noise.', example: 'Lucy\'s street is quiet, with a small park at the end.', partOfSpeech: 'adjective' },
          { word: 'city centre', translation: 'centro de la ciudad', definition: 'The middle, busiest part of a city.', example: 'The flat is near the city centre.', partOfSpeech: 'noun phrase' },
          { word: 'ground floor', translation: 'planta baja', definition: 'The floor of a building that is at street level.', example: 'The supermarket is on the ground floor of that building.', partOfSpeech: 'noun phrase' },
          { word: 'staircase', translation: 'escalera', definition: 'A set of stairs inside a building.', example: 'There is an old wooden staircase in the building.', partOfSpeech: 'noun' },
          { word: 'block of flats', translation: 'edificio de apartamentos', definition: 'A building divided into several flats.', example: 'Lucy lives in a small block of flats near the park.', partOfSpeech: 'noun phrase' },
          { word: 'cosy', translation: 'acogedor', definition: 'Warm, comfortable, and pleasant.', example: "The living room feels really cosy in the evening.", partOfSpeech: 'adjective' },
          { word: 'spacious', translation: 'espacioso', definition: 'Having a lot of space.', example: 'The kitchen is spacious and bright in the morning.', partOfSpeech: 'adjective' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What is a "balcony"?', options: ['A room for clothes', 'A platform outside a window or door', 'A type of sofa', 'A small park'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "easy to use or useful"?', options: ['Spacious', 'Convenient', 'Cosy', 'Furnished'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "having a lot of space"?', options: ['Cosy', 'Convenient', 'Spacious', 'Quiet'], answer: 2 },
          { type: 'mcq', prompt: 'Where do you buy bread?', options: ['A pharmacy', 'A bakery', 'A wardrobe', 'A staircase'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "to start living in a new home"?', options: ['Rent', 'Move in', 'Furnish', 'View'], answer: 1 },
          { type: 'mcq', prompt: 'Which word describes a home with furniture already in it?', options: ['Spacious', 'Cosy', 'Furnished', 'Convenient'], answer: 2 },
          { type: 'mcq', prompt: 'Who do you contact to rent a flat?', options: ['A letting agent', 'A bakery', 'A pharmacy', 'A neighbor only'], answer: 0 },
          { type: 'mcq', prompt: 'Which word means "warm, comfortable and pleasant"?', options: ['Spacious', 'Cosy', 'Convenient', 'Quiet'], answer: 1 },
          { type: 'mcq', prompt: 'What is a "block of flats"?', options: ['A single house', 'A building divided into several flats', 'A type of furniture', 'A shop'], answer: 1 },
          { type: 'mcq', prompt: 'Where do you put your books?', options: ['A wardrobe', 'A bookshelf', 'A staircase', 'A balcony'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "the area around your home"?', options: ['City centre', 'Neighborhood', 'Ground floor', 'Rent'], answer: 1 },
          { type: 'mcq', prompt: 'Complete: "The flat is on the ___, so we don\'t need the stairs."', options: ['staircase', 'ground floor', 'balcony', 'wardrobe'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'food-and-shopping',
    title: 'Food and Shopping',
    titleEs: 'La comida y las compras',
    description: 'Sarah cooks dinner for Daniel for the first time, from the shopping list to the table.',
    order: 4,
    accessTier: 'premium',
    unitOverview: {
      objective: 'Hablar de comida, cantidades y compras usando sustantivos contables e incontables.',
      outcomes: [
        'diferenciar sustantivos contables e incontables',
        'usar some, any, much, many correctamente',
        'preguntar y responder con How much...? / How many...?',
        'entender un texto sobre ir de compras y cocinar'
      ],
      grammar: ['Countable and uncountable nouns', 'Some / any / much / many'],
      vocabulary: ['food and ingredients', 'shopping', 'quantities'],
      scenario: 'Sarah cocina cena para Daniel por primera vez, y todo empieza con una lista de compras.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Cooking Dinner for the First Time',
        description: 'Sarah goes shopping and cooks a special Italian dinner for Daniel.',
        reading: {
          title: 'Cooking Dinner for the First Time',
          illustration: {
            src: '/assets/readings/english/a2/unit-04-cooking-dinner.webp',
            alt: 'Sarah cooking pasta in her kitchen with a shopping bag on the counter',
            animation: 'subtle-float'
          },
          text:
            'On Friday evening, Sarah decides to cook dinner for Daniel at her flat for the first time. She wants to make a special Italian pasta dish, but first, she needs to go shopping.\n\n' +
            "She makes a shopping list: some tomatoes, a bit of garlic, fresh basil, a packet of pasta, and some parmesan cheese. \"I don't have much time,\" she thinks, checking her watch. It's already six o'clock, and Daniel is coming at eight.\n\n" +
            'At the supermarket, Sarah finds most things quickly. There are plenty of tomatoes, and she chooses six ripe ones. She looks for basil in the vegetable section, but there isn\'t any left. "Excuse me," she asks a shop assistant, "do you have any fresh basil?" The assistant checks and finds a few packets at the back of the shop.\n\n' +
            "Next, Sarah needs pasta. There are so many different types on the shelf - she isn't sure how much she needs for two people. She decides on a medium packet, just to be safe. She also buys a bottle of olive oil, because she doesn't have much left at home.\n\n" +
            'At the cheese counter, Sarah asks for some parmesan. "How much would you like?" the assistant asks. "About two hundred grams, please," Sarah answers. She also picks up a small carton of cream and a loaf of bread, just in case.\n\n' +
            "By seven o'clock, Sarah is home and starting to cook. She chops the garlic and tomatoes, and puts a large pot of water on the stove. The kitchen smells wonderful, but she suddenly realizes something: she doesn't have any wine!\n\n" +
            'She quickly calls Daniel. "Can you bring a bottle of wine?" she asks. "Of course," he laughs. "Red or white?" "Red, please - it\'s a tomato sauce!"\n\n' +
            'Daniel arrives at exactly eight o\'clock with a bottle of red wine and a bunch of flowers. "Something smells amazing," he says, stepping into the kitchen. "It\'s almost ready," Sarah replies, stirring the sauce. "Can you set the table? There are plates in that cupboard."\n\n' +
            "They sit down to eat a few minutes later. The pasta is perfect, the sauce is rich and delicious, and the conversation flows easily. \"You're a great cook,\" Daniel says. \"Thank you,\" Sarah smiles. \"I had a little help from the shop assistant and a lot of luck.\"\n\n" +
            "By the end of the evening, there isn't much pasta left, but there's plenty of laughter and a very happy couple.",
          questions: [
            '¿Qué comida especial te gusta cocinar para alguien? Descríbela.',
            'Escribe tu propia lista de compras para una cena especial, usando some y a bit of.'
          ]
        },
        exercises: [
          { type: 'mcq', prompt: 'What is the reading mainly about?', options: ["Sarah's job at the design company", 'Sarah shopping for and cooking a special dinner for Daniel', 'A problem at the supermarket', 'Daniel learning to cook'], answer: 1 },
          { type: 'mcq', prompt: 'Why does Sarah go shopping?', options: ['To buy a birthday present', 'To buy ingredients for a special Italian dinner', 'To buy new kitchen furniture', 'To meet Daniel at the supermarket'], answer: 1 },
          { type: 'mcq', prompt: 'What does the shop assistant help Sarah find?', options: ['Wine', 'Fresh basil', 'A shopping trolley', 'Parmesan cheese'], answer: 1 },
          { type: 'mcq', prompt: 'What does Sarah forget to buy?', options: ['Pasta', 'Tomatoes', 'Wine', 'Bread'], answer: 2 },
          { type: 'mcq', prompt: 'In "just to be safe," what does this phrase mean?', options: ['To save money', 'To avoid a possible problem', 'To be dangerous', 'To finish quickly'], answer: 1 },
          { type: 'mcq', prompt: 'How much parmesan does Sarah ask for?', options: ['One hundred grams', 'About two hundred grams', 'Half a kilo', 'A whole block'], answer: 1 },
          { type: 'mcq', prompt: 'What can you infer about how the evening goes?', options: ['It goes badly and they argue', 'It goes well - good food and easy conversation', 'Daniel does not like the food', 'They order food instead'], answer: 1 },
          { type: 'mcq', prompt: 'What does Daniel bring besides the wine?', options: ['A dessert', 'A bunch of flowers', 'A loaf of bread', 'Extra pasta'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'At the Supermarket',
        description: "Listen to Sarah's conversation with the shop assistant while she looks for ingredients.",
        intro: "Listen to Sarah asking the shop assistant for help finding ingredients. Focus on quantities and countable/uncountable words.",
        dialogue: [
          { speaker: 'Sarah', line: 'Excuse me, do you have any fresh basil?', translation: 'Disculpe, ¿tiene albahaca fresca?' },
          { speaker: 'Assistant', line: "Let me check... yes, there are a few packets at the back.", translation: 'Déjeme revisar... sí, hay unos paquetes al fondo.' },
          { speaker: 'Sarah', line: "Great, thank you. How much pasta do I need for two people?", translation: 'Genial, gracias. ¿Cuánta pasta necesito para dos personas?' },
          { speaker: 'Assistant', line: "A medium packet is usually enough for two.", translation: 'Un paquete mediano usualmente es suficiente para dos.' },
          { speaker: 'Sarah', line: "Perfect. And could I get some parmesan cheese, please?", translation: 'Perfecto. ¿Y me da un poco de queso parmesano, por favor?' },
          { speaker: 'Assistant', line: "Of course. How much would you like?", translation: 'Claro. ¿Cuánto le doy?' },
          { speaker: 'Sarah', line: "About two hundred grams, please.", translation: 'Unos doscientos gramos, por favor.' },
          { speaker: 'Assistant', line: "Here you go. Do you need anything else?", translation: 'Aquí tiene. ¿Necesita algo más?' },
          { speaker: 'Sarah', line: "Actually, yes - do you have any olive oil? I don't have much left at home.", translation: 'De hecho, sí, ¿tiene aceite de oliva? No me queda mucho en casa.' },
          { speaker: 'Assistant', line: "Yes, it's in aisle three, next to the vinegar.", translation: 'Sí, está en el pasillo tres, al lado del vinagre.' }
        ],
        phrases: [
          'Do you have any...?',
          'How much... do I need?',
          'Could I get some...?',
          "I don't have much...",
          'Do you need anything else?'
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does Sarah ask for first?', options: ['Parmesan cheese', 'Fresh basil', 'Olive oil', 'Pasta'], answer: 1 },
          { type: 'mcq', prompt: 'Where does the assistant find the basil?', options: ['In aisle three', 'At the back of the shop', 'Next to the pasta', 'At the cheese counter'], answer: 1 },
          { type: 'mcq', prompt: 'How much pasta does the assistant recommend for two people?', options: ['A small packet', 'A medium packet', 'A large packet', 'Two packets'], answer: 1 },
          { type: 'mcq', prompt: 'How much parmesan does Sarah ask for?', options: ['One hundred grams', 'Two hundred grams', 'Half a kilo', 'A whole block'], answer: 1 },
          { type: 'mcq', prompt: 'Why does Sarah need olive oil?', options: ['She has never bought it before', "She doesn't have much left at home", 'It is on sale', 'Daniel asked for it'], answer: 1 },
          { type: 'mcq', prompt: 'Where is the olive oil?', options: ['Next to the pasta', 'At the back of the shop', 'In aisle three, next to the vinegar', 'At the cheese counter'], answer: 2 },
          { type: 'mcq', prompt: 'Which best describes the assistant in this conversation?', options: ['Unhelpful and rushed', 'Helpful and patient', 'Confused about the products', 'Rude to Sarah'], answer: 1 },
          { type: 'mcq', prompt: 'What is the main purpose of this conversation?', options: ['To complain about a product', 'To help Sarah find ingredients for dinner', 'To return an item', 'To ask about opening hours'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Talking About Food and Quantities',
        description: 'Talk about food you like, shopping habits, and quantities using some/any/much/many.',
        mission:
          "Talk about what food you usually buy, how much or how many of each thing, and one meal you like to cook.",
        phrases: [
          'I usually buy some...',
          'I need a lot of... / a little...',
          'How much/many... do you buy?',
          'My favourite meal to cook is...'
        ],
        dialogue: [
          { speaker: 'You', line: "I usually buy some vegetables and a little cheese every week.", translation: 'Normalmente compro algunas verduras y un poco de queso cada semana.' },
          { speaker: 'Partner', line: "How many eggs do you usually buy?", translation: '¿Cuántos huevos compras normalmente?' },
          { speaker: 'You', line: "About a dozen. And I always need a lot of coffee!", translation: 'Como una docena. ¡Y siempre necesito mucho café!' },
          { speaker: 'Partner', line: "What's your favourite meal to cook?", translation: '¿Cuál es tu comida favorita para cocinar?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Say three sentences about food you usually buy, using some, a lot of, or a little.', answer: 'Oral practice' },
          { type: 'speaking', prompt: 'Now ask a partner how much/many of two different foods they buy each week.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the shopping habits dialogue with a partner, then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'A Meal I Cooked',
        description: 'Write about a meal you cooked, including your shopping list and the result.',
        mission:
          "Write 80-130 words about a meal you cooked (or would like to cook) for someone: the ingredients you needed, and how it turned out.",
        phrases: [
          "I decided to cook...",
          "I needed some/a bit of...",
          "I didn't have much/many...",
          "In the end, it was..."
        ],
        dialogue: [
          {
            speaker: 'Model',
            line:
              "Last month, I decided to cook dinner for my best friend's birthday. I needed some chicken, a bit of garlic, and a lot of vegetables, so I went to the market in the morning. I didn't have much time, because she was arriving at seven. I also didn't have any dessert, so I bought a small cake on the way home. In the end, the dinner was delicious, and we talked for hours. It wasn't perfect, but she loved it, and that's what mattered most.",
            translation:
              'El mes pasado, decidí cocinar cena para el cumpleaños de mi mejor amiga. Necesitaba algo de pollo, un poco de ajo y muchas verduras, así que fui al mercado en la mañana. No tenía mucho tiempo, porque ella llegaba a las siete. Tampoco tenía postre, así que compré un pastel pequeño de camino a casa. Al final, la cena estuvo deliciosa y hablamos por horas. No fue perfecta, pero a ella le encantó, y eso fue lo más importante.'
          }
        ],
        exercises: [
          {
            type: 'writing',
            prompt:
              "Write 80-130 words about a meal you cooked or would like to cook for someone, using some/a bit of/a lot of/much/many.",
            answer: 'Open answer'
          }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Countable and Uncountable Nouns; Some / Any / Much / Many',
        description: 'Talk about quantities of food and other things correctly.',
        grammarNote:
          'Countable nouns can be counted and have a plural form: one tomato, two tomatoes. Uncountable nouns cannot be counted and have no plural: rice, cheese, water, bread. Use a/an or a number with countable nouns, and words like some/a bit of/a lot of with uncountable nouns.\n\n' +
          "Use some in positive sentences and offers (\"I need some milk\"), and any in negatives and questions (\"I don't have any milk,\" \"Do you have any milk?\"). Use many with countable plural nouns (\"How many eggs?\") and much with uncountable nouns (\"How much cheese?\"), especially in questions and negatives; a lot of works with both in positive sentences.\n\n" +
          'Apoyo: usa some (afirmaciones/ofertas) y any (negaciones/preguntas); usa many con contables y much con incontables.',
        phrases: [
          'some / any',
          'much / many',
          'How much...? / How many...?',
          'a lot of / a bit of'
        ],
        exercises: [
          { type: 'mcq', prompt: 'Which noun is uncountable?', options: ['Tomato', 'Egg', 'Rice', 'Apple'], answer: 2 },
          { type: 'mcq', prompt: 'I need ___ milk for the recipe.', options: ['a', 'some', 'many', 'a few'], answer: 1 },
          { type: 'mcq', prompt: "I don't have ___ eggs left.", options: ['some', 'any', 'much', 'a'], answer: 1 },
          { type: 'mcq', prompt: '___ cheese do you want?', options: ['How many', 'How much', 'How', 'What'], answer: 1 },
          { type: 'mcq', prompt: '___ apples are there in the bag?', options: ['How much', 'How many', 'How', 'What'], answer: 1 },
          { type: 'mcq', prompt: 'There are ___ tomatoes in the fridge - we need to buy more.', options: ['not much', 'not many', 'much', 'any'], answer: 1 },
          { type: 'mcq', prompt: 'Would you like ___ coffee?', options: ['some', 'any', 'many', 'a'], answer: 0 },
          { type: 'mcq', prompt: 'We have ___ pasta - too much for two people!', options: ['a few', 'a lot of', 'many', 'any'], answer: 1 },
          { type: 'mcq', prompt: 'Is there ___ bread in the kitchen?', options: ['some', 'any', 'much', 'many'], answer: 1 },
          { type: 'mcq', prompt: 'I only have ___ money, so I can\'t buy everything.', options: ['a little', 'a few', 'many', 'some'], answer: 0 },
          { type: 'mcq', prompt: 'She bought ___ new potatoes at the market.', options: ['a little', 'a few', 'much', 'a bit of'], answer: 1 },
          { type: 'mcq', prompt: '___ oil do we need for the pasta sauce?', options: ['How many', 'How much', 'How', 'What'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Food, Ingredients and Quantities',
        description: 'Key words for food, ingredients, and shopping.',
        vocabulary: [
          { word: 'ingredient', translation: 'ingrediente', definition: 'One of the foods used to make a dish.', example: 'Garlic is an important ingredient in this recipe.', partOfSpeech: 'noun' },
          { word: 'recipe', translation: 'receta', definition: 'A set of instructions for cooking a dish.', example: 'Sarah found the recipe online.', partOfSpeech: 'noun' },
          { word: 'ripe', translation: 'maduro/a', definition: 'Ready to eat (usually fruit or vegetables).', example: 'She chose six ripe tomatoes.', partOfSpeech: 'adjective' },
          { word: 'packet', translation: 'paquete', definition: 'A small container or bag for food.', example: 'She bought a medium packet of pasta.', partOfSpeech: 'noun' },
          { word: 'carton', translation: 'cartón/envase', definition: 'A container made of cardboard or plastic for liquids.', example: 'She also picked up a small carton of cream.', partOfSpeech: 'noun' },
          { word: 'loaf (of bread)', translation: 'barra/pan (una pieza)', definition: 'A shaped piece of baked bread.', example: 'She bought a loaf of bread, just in case.', partOfSpeech: 'noun' },
          { word: 'grams / kilos', translation: 'gramos / kilos', definition: 'Units used to measure the weight of food.', example: 'She asked for two hundred grams of cheese.', partOfSpeech: 'noun' },
          { word: 'shopping list', translation: 'lista de compras', definition: 'A written list of things to buy.', example: 'Sarah made a shopping list before going out.', partOfSpeech: 'noun phrase' },
          { word: 'shop assistant', translation: 'dependiente/a', definition: 'A person who works in a shop and helps customers.', example: 'The shop assistant helped her find the basil.', partOfSpeech: 'noun phrase' },
          { word: 'aisle', translation: 'pasillo (de tienda)', definition: 'A passage between rows of shelves in a shop.', example: 'The olive oil is in aisle three.', partOfSpeech: 'noun' },
          { word: 'fresh', translation: 'fresco/a', definition: 'Recently made or picked, not old or frozen.', example: 'She needed fresh basil for the sauce.', partOfSpeech: 'adjective' },
          { word: 'leftovers', translation: 'sobras', definition: 'Food that remains after a meal.', example: 'There were some leftovers, so we had them the next day.', partOfSpeech: 'noun' },
          { word: 'stir', translation: 'revolver/remover', definition: 'To mix a liquid or food with a spoon.', example: 'Sarah kept stirring the sauce.', partOfSpeech: 'verb' },
          { word: 'chop', translation: 'picar/cortar', definition: 'To cut food into small pieces.', example: 'She chopped the garlic and tomatoes.', partOfSpeech: 'verb' },
          { word: 'set the table', translation: 'poner la mesa', definition: 'To put plates, glasses, and cutlery on the table before eating.', example: 'Can you set the table, please?', partOfSpeech: 'phrase' },
          { word: 'delicious', translation: 'delicioso/a', definition: 'Having a very pleasant taste.', example: 'The pasta sauce was rich and delicious.', partOfSpeech: 'adjective' },
          { word: 'sauce', translation: 'salsa', definition: 'A liquid food served with or on other food.', example: 'The tomato sauce needed more basil.', partOfSpeech: 'noun' },
          { word: 'dessert', translation: 'postre', definition: 'Sweet food eaten after the main part of a meal.', example: 'They didn\'t have time for dessert.', partOfSpeech: 'noun' },
          { word: 'cupboard', translation: 'alacena/armario de cocina', definition: 'A cabinet in a kitchen for storing food or dishes.', example: 'There are plates in that cupboard.', partOfSpeech: 'noun' },
          { word: 'counter', translation: 'mostrador/encimera', definition: 'A flat surface in a shop or kitchen where food is served or prepared.', example: 'She asked for parmesan at the cheese counter.', partOfSpeech: 'noun' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What is an "ingredient"?', options: ['A type of shop', 'One of the foods used in a dish', 'A cooking tool', 'A weight measurement'], answer: 1 },
          { type: 'mcq', prompt: 'Which word describes fruit that is ready to eat?', options: ['Fresh', 'Ripe', 'Delicious', 'Leftover'], answer: 1 },
          { type: 'mcq', prompt: 'Where do you find products between rows of shelves?', options: ['The counter', 'The cupboard', 'The aisle', 'The carton'], answer: 2 },
          { type: 'mcq', prompt: 'Which word means "to cut food into small pieces"?', options: ['Stir', 'Chop', 'Set', 'Pack'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "food that remains after a meal"?', options: ['Ingredients', 'Leftovers', 'Dessert', 'Recipe'], answer: 1 },
          { type: 'mcq', prompt: 'Who helps you find products in a shop?', options: ['A shop assistant', 'A chef', 'A recipe', 'A shopping list'], answer: 0 },
          { type: 'mcq', prompt: 'What do you use to measure how heavy food is?', options: ['Aisles', 'Grams and kilos', 'Cartons', 'Counters'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "to mix a liquid or food with a spoon"?', options: ['Chop', 'Stir', 'Set', 'Pack'], answer: 1 },
          { type: 'mcq', prompt: 'Which phrase means "to put plates and cutlery on the table"?', options: ['Set the table', 'Stir the sauce', 'Chop the garlic', 'Make a list'], answer: 0 },
          { type: 'mcq', prompt: 'What is a "loaf"?', options: ['A liquid container', 'A shaped piece of bread', 'A cooking pot', 'A shopping list'], answer: 1 },
          { type: 'mcq', prompt: 'What do you eat after the main course?', options: ['A sauce', 'A dessert', 'An ingredient', 'A leftover'], answer: 1 },
          { type: 'mcq', prompt: 'Where do you store plates in a kitchen?', options: ['The aisle', 'The cupboard', 'The counter', 'The carton'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'past-experiences',
    title: 'Past Experiences',
    titleEs: 'Experiencias pasadas',
    description: 'Sarah tells Daniel about the summer she backpacked through Europe with Lucy.',
    order: 5,
    accessTier: 'premium',
    unitOverview: {
      objective: 'Hablar de experiencias pasadas usando el Past Simple, verbos regulares e irregulares.',
      outcomes: [
        'contar una historia o experiencia pasada en orden cronológico',
        'usar el Past Simple afirmativo, negativo e interrogativo',
        'reconocer y usar verbos irregulares comunes',
        'entender un relato largo sobre un viaje'
      ],
      grammar: ['Past Simple (regular and irregular verbs)'],
      vocabulary: ['travel', 'past experiences', 'time expressions for the past'],
      scenario: 'Daniel le pregunta a Sarah sobre su viaje más memorable, y ella le cuenta la historia de una mochila por Europa.'
    },
    activities: {
      reading: activity('reading', {
        title: 'The Summer I Backpacked Through Europe',
        description: 'Sarah tells Daniel about the summer after university, when she and Lucy backpacked through Europe.',
        reading: {
          title: 'The Summer I Backpacked Through Europe',
          illustration: {
            src: '/assets/readings/english/a2/unit-05-backpacking-europe.webp',
            alt: 'Sarah and Lucy with backpacks in front of a European landmark',
            animation: 'subtle-float'
          },
          text:
            "One evening, Daniel asks Sarah about her most memorable trip. \"Oh, that's easy,\" she says. \"The summer after university, when Lucy and I backpacked through Europe.\"\n\n" +
            "They finished their exams in June, and two weeks later, they flew to Paris with just two backpacks and a very small budget. \"We didn't have much money,\" Sarah remembers, \"so we stayed in cheap hostels and ate a lot of bread and cheese.\"\n\n" +
            "In Paris, they visited the Eiffel Tower and walked along the river for hours. They didn't spend much on museums, but they enjoyed simply exploring the streets. After three days, they took a night train to Barcelona.\n\n" +
            "\"That train was an adventure,\" Sarah laughs. \"We didn't sleep much - the seats were uncomfortable, and a group of students talked and laughed all night. But when we arrived, the city was beautiful, and we forgot about the tiredness immediately.\"\n\n" +
            'In Barcelona, they spent a whole day at the beach and tried paella for the first time. They also visited an amazing park designed by a famous architect, with colourful buildings and unusual shapes. "I took hundreds of photos," Sarah says, "but none of them showed how incredible it really looked."\n\n' +
            'From Barcelona, they travelled to Rome by bus, which took almost twenty hours. "It was long and tiring, but we met some interesting people and played cards for hours," Sarah explains. In Rome, they visited ancient ruins, threw coins in a famous fountain, and ate the best pizza of their lives.\n\n' +
            'One night in Rome, they got lost after dinner and walked for two hours before they finally found their hostel. "We laughed so much that night," Sarah remembers. "We were exhausted, but it\'s one of my favourite memories."\n\n' +
            'Their last stop was Florence, where they saw incredible art and climbed to the top of a cathedral for an amazing view of the city. "That was the perfect end to the trip," Sarah says.\n\n' +
            'After five weeks, they flew home, tired but full of stories. "We spent almost no money, we didn\'t plan very well, and everything sometimes went wrong," Sarah tells Daniel, "but it was one of the best summers of my life."\n\n' +
            'Daniel smiles. "Maybe we should have our own adventure like that one day." Sarah looks at him and grins. "I like that idea."',
          questions: [
            'Cuenta tu experiencia de viaje más memorable usando el Past Simple.',
            '¿Qué ciudad de la historia te gustaría visitar? ¿Por qué?'
          ]
        },
        exercises: [
          { type: 'mcq', prompt: 'What is the reading mainly about?', options: ["Sarah's job interview", 'Sarah telling Daniel about a backpacking trip through Europe', 'A trip Sarah is planning now', "Daniel's university years"], answer: 1 },
          { type: 'mcq', prompt: 'When did the trip happen?', options: ['Last month', 'The summer after university', 'When Sarah was a child', 'Last year with Daniel'], answer: 1 },
          { type: 'mcq', prompt: 'Why did they stay in cheap hostels?', options: ['They preferred them', "They didn't have much money", 'All hotels were full', 'Lucy worked at a hostel'], answer: 1 },
          { type: 'mcq', prompt: 'How did they travel from Paris to Barcelona?', options: ['By plane', 'By car', 'By night train', 'By bus'], answer: 2 },
          { type: 'mcq', prompt: 'In "they forgot about the tiredness immediately," what does tiredness mean?', options: ['Excitement', 'The feeling of being tired', 'Hunger', 'Confusion'], answer: 1 },
          { type: 'mcq', prompt: 'What happened one night in Rome?', options: ['They missed their train', 'They got lost and walked for two hours', 'They lost their backpacks', 'They argued about money'], answer: 1 },
          { type: 'mcq', prompt: 'What can you infer about how Sarah feels about the trip now?', options: ['She regrets it', 'She remembers it fondly as one of her best summers', 'She found it boring', 'She never wants to travel again'], answer: 1 },
          { type: 'mcq', prompt: 'What does Daniel suggest at the end?', options: ['That they study together', 'That they have their own adventure someday', 'That Sarah travels alone', 'That they visit Lucy'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Remembering the Trip',
        description: 'Listen to Sarah and Lucy on the phone, remembering their old backpacking trip together.',
        intro: "Listen to Sarah and Lucy's phone call about their old trip. Focus on the Past Simple questions and answers.",
        dialogue: [
          { speaker: 'Lucy', line: 'I told Daniel about our trip to Europe last night. Do you remember Rome?', translation: 'Le conté a Daniel sobre nuestro viaje a Europa anoche. ¿Te acuerdas de Roma?' },
          { speaker: 'Sarah', line: 'Of course! We got lost after dinner, remember?', translation: '¡Claro! Nos perdimos después de la cena, ¿recuerdas?' },
          { speaker: 'Lucy', line: "Yes! Did we ever find the hostel that night?", translation: '¡Sí! ¿Alguna vez encontramos el hostal esa noche?' },
          { speaker: 'Sarah', line: "Eventually! It took us almost two hours, but we laughed the whole time.", translation: '¡Al final sí! Nos tomó casi dos horas, pero nos reímos todo el tiempo.' },
          { speaker: 'Lucy', line: "What was your favourite city?", translation: '¿Cuál fue tu ciudad favorita?' },
          { speaker: 'Sarah', line: "I think Florence. Do you remember that view from the cathedral?", translation: 'Creo que Florencia. ¿Recuerdas esa vista desde la catedral?' },
          { speaker: 'Lucy', line: "I'll never forget it. We didn't spend much money, but we saw so much.", translation: 'Nunca la olvidaré. No gastamos mucho dinero, pero vimos muchísimo.' },
          { speaker: 'Sarah', line: "Exactly. We didn't plan very well, but everything worked out.", translation: 'Exacto. No planeamos muy bien, pero todo salió bien.' },
          { speaker: 'Lucy', line: "We should do another trip like that one day.", translation: 'Deberíamos hacer otro viaje así algún día.' },
          { speaker: 'Sarah', line: "Definitely. Maybe next summer!", translation: '¡Definitivamente! ¡Quizás el próximo verano!' }
        ],
        phrases: [
          'Do you remember...?',
          'We got lost.',
          "Did we ever...?",
          "I'll never forget it.",
          'We should do... again.'
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does Lucy ask about first?', options: ['Barcelona', 'Rome', 'Florence', 'Paris'], answer: 1 },
          { type: 'mcq', prompt: 'What happened in Rome, according to the call?', options: ['They missed a train', 'They got lost after dinner', 'They lost their tickets', 'They arrived late'], answer: 1 },
          { type: 'mcq', prompt: 'How long did it take them to find the hostel?', options: ['Thirty minutes', 'One hour', 'Almost two hours', 'All night'], answer: 2 },
          { type: 'mcq', prompt: "What was Sarah's favourite city?", options: ['Rome', 'Paris', 'Barcelona', 'Florence'], answer: 3 },
          { type: 'mcq', prompt: 'What does Lucy say she will never forget?', options: ['The train journey', 'The view from the cathedral', 'The paella', 'The hostel'], answer: 1 },
          { type: 'mcq', prompt: 'How does Sarah describe their planning?', options: ['Very careful', "They didn't plan very well, but it worked out", 'They planned everything perfectly', 'They had no plan at all'], answer: 1 },
          { type: 'mcq', prompt: 'What do they suggest doing in the future?', options: ['Never travelling together again', 'Another trip like that one day', 'Visiting Rome only', 'Staying in luxury hotels next time'], answer: 1 },
          { type: 'mcq', prompt: 'What is the purpose of this phone call?', options: ['To plan a new trip in detail', 'To remember their old trip together', 'To argue about the past', 'To cancel a future trip'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Telling a Story About the Past',
        description: 'Talk about a memorable past experience using the Past Simple.',
        mission:
          "Tell a partner about a memorable trip or experience from your past: where you went, what you did, and one funny or surprising thing that happened.",
        phrases: [
          'A few years ago, I...',
          'First, we... Then, we...',
          "We didn't... but we...",
          "It was one of the best/worst..."
        ],
        dialogue: [
          { speaker: 'You', line: "A few years ago, I travelled to the coast with my friends.", translation: 'Hace unos años, viajé a la costa con mis amigos.' },
          { speaker: 'Partner', line: "What did you do there?", translation: '¿Qué hicieron ahí?' },
          { speaker: 'You', line: "We swam in the sea, ate a lot of seafood, and got lost on the way back to the hotel!", translation: 'Nadamos en el mar, comimos mucho marisco, ¡y nos perdimos de vuelta al hotel!' },
          { speaker: 'Partner', line: "That sounds like Sarah and Lucy's trip to Rome!", translation: '¡Eso suena como el viaje de Sarah y Lucy a Roma!' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Tell a partner about a memorable trip or experience, using at least five Past Simple verbs.', answer: 'Oral practice' },
          { type: 'speaking', prompt: 'Now describe one funny or surprising thing that happened during that experience.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the storytelling dialogue about a past trip with a partner, then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'A Trip I Will Never Forget',
        description: 'Write about a memorable trip or experience from your past.',
        mission:
          "Write 80-130 words about a memorable trip or experience from your past, using the Past Simple and time expressions like first, then, after that.",
        phrases: [
          '... years ago, I...',
          'First, ... Then, ...',
          "I didn't... but I...",
          "It was unforgettable because..."
        ],
        dialogue: [
          {
            speaker: 'Model',
            line:
              "Three years ago, I visited the mountains with my family for the first time. We drove for six hours and arrived late at night. The next morning, we walked to a beautiful waterfall and had a picnic near the river. We didn't plan much, but we found a small village with amazing food. On the last day, it rained all morning, so we played cards in the cabin and told stories. It wasn't a perfect trip, but it was unforgettable because we laughed so much together.",
            translation:
              'Hace tres años, visité las montañas con mi familia por primera vez. Manejamos durante seis horas y llegamos tarde en la noche. A la mañana siguiente, caminamos hasta una hermosa cascada e hicimos un picnic cerca del río. No planeamos mucho, pero encontramos un pueblo pequeño con comida increíble. El último día, llovió toda la mañana, así que jugamos cartas en la cabaña y contamos historias. No fue un viaje perfecto, pero fue inolvidable porque nos reímos mucho juntos.'
          }
        ],
        exercises: [
          {
            type: 'writing',
            prompt:
              "Write 80-130 words about a memorable trip or experience from your past, using the Past Simple and at least two time-sequence words (first, then, after that, finally).",
            answer: 'Open answer'
          }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Past Simple (Regular and Irregular Verbs)',
        description: 'Talk about completed actions and experiences in the past.',
        grammarNote:
          'Use the Past Simple for completed actions at a specific time in the past: "We visited Paris in June." Regular verbs add -ed: visit -> visited, travel -> travelled. Irregular verbs change form completely and must be memorised: go -> went, see -> saw, have -> had, get -> got.\n\n' +
          "The negative uses didn't + base verb for all subjects: \"We didn't sleep much.\" The question uses Did + subject + base verb: \"Did you visit Rome?\" Time expressions like yesterday, last year, two weeks ago, and in June often signal the Past Simple.\n\n" +
          'Apoyo: usa el Past Simple para acciones terminadas en el pasado; recuerda que los verbos irregulares cambian de forma y deben memorizarse.',
        phrases: [
          'I/We visited... (regular)',
          "I/We went... (irregular)",
          "I/We didn't...",
          'Did you...?'
        ],
        exercises: [
          { type: 'mcq', prompt: 'They ___ to Paris last summer.', options: ['fly', 'flied', 'flew', 'flown'], answer: 2 },
          { type: 'mcq', prompt: 'We ___ the museum yesterday.', options: ['visit', 'visited', 'visiting', 'visits'], answer: 1 },
          { type: 'mcq', prompt: 'She ___ have much money when she travelled.', options: ["doesn't", "didn't", "don't", "wasn't"], answer: 1 },
          { type: 'mcq', prompt: '___ you enjoy the trip?', options: ['Do', 'Does', 'Did', 'Were'], answer: 2 },
          { type: 'mcq', prompt: 'I ___ lost in the old city.', options: ['get', 'gets', 'getting', 'got'], answer: 3 },
          { type: 'mcq', prompt: 'We ___ some amazing photos on that trip.', options: ['take', 'took', 'taken', 'taking'], answer: 1 },
          { type: 'mcq', prompt: 'He ___ his backpack at the hostel.', options: ['leave', 'left', 'leaves', 'leaving'], answer: 1 },
          { type: 'mcq', prompt: 'They ___ not stay in a hotel - it was too expensive.', options: ['did', 'was', 'do', 'were'], answer: 0 },
          { type: 'mcq', prompt: 'We ___ a lot of new people during the trip.', options: ['meet', 'meeted', 'met', 'meets'], answer: 2 },
          { type: 'mcq', prompt: 'Last year, I ___ to Italy for the first time.', options: ['go', 'goed', 'went', 'gone'], answer: 2 },
          { type: 'mcq', prompt: '___ they travel by train or by bus?', options: ['Do', 'Does', 'Did', 'Were'], answer: 2 },
          { type: 'mcq', prompt: 'I ___ that view - it was unforgettable.', options: ['never forget', 'never forgot', 'will never forget', 'not forget'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Travel and Past Experiences',
        description: 'Key words for travelling and talking about past experiences.',
        vocabulary: [
          { word: 'backpack', translation: 'mochila', definition: 'A bag carried on your back, used for travelling.', example: 'They travelled with just two backpacks.', partOfSpeech: 'noun' },
          { word: 'hostel', translation: 'albergue', definition: 'A cheap place to stay, popular with young travellers.', example: 'They stayed in cheap hostels to save money.', partOfSpeech: 'noun' },
          { word: 'budget', translation: 'presupuesto', definition: 'The amount of money you have to spend.', example: 'They travelled with a very small budget.', partOfSpeech: 'noun' },
          { word: 'unforgettable', translation: 'inolvidable', definition: 'So good or special that you will always remember it.', example: 'The view from the cathedral was unforgettable.', partOfSpeech: 'adjective' },
          { word: 'memory', translation: 'recuerdo', definition: 'Something you remember from the past.', example: "Getting lost in Rome is one of Sarah's favourite memories.", partOfSpeech: 'noun' },
          { word: 'adventure', translation: 'aventura', definition: 'An exciting or unusual experience.', example: 'The night train was quite an adventure.', partOfSpeech: 'noun' },
          { word: 'ruins', translation: 'ruinas', definition: 'The remaining parts of an old, damaged building.', example: 'They visited ancient ruins in Rome.', partOfSpeech: 'noun' },
          { word: 'fountain', translation: 'fuente', definition: 'A structure that sends water into the air, often decorative.', example: 'They threw coins in a famous fountain.', partOfSpeech: 'noun' },
          { word: 'view', translation: 'vista', definition: 'What you can see from a particular place.', example: 'They had an amazing view from the top of the cathedral.', partOfSpeech: 'noun' },
          { word: 'get lost', translation: 'perderse', definition: 'To not know where you are or how to reach your destination.', example: 'They got lost after dinner one night.', partOfSpeech: 'phrasal verb' },
          { word: 'exhausted', translation: 'agotado/a', definition: 'Extremely tired.', example: 'They were exhausted after walking for two hours.', partOfSpeech: 'adjective' },
          { word: 'explore', translation: 'explorar', definition: 'To travel through a place to learn about it.', example: 'They enjoyed simply exploring the streets.', partOfSpeech: 'verb' },
          { word: 'journey', translation: 'trayecto/viaje', definition: 'An act of travelling from one place to another.', example: 'The bus journey to Rome took twenty hours.', partOfSpeech: 'noun' },
          { word: 'destination', translation: 'destino', definition: 'The place someone is travelling to.', example: 'Florence was their last destination.', partOfSpeech: 'noun' },
          { word: 'souvenir', translation: 'recuerdo (objeto)', definition: 'An object you keep to remember a place or trip.', example: 'She bought a small souvenir in every city.', partOfSpeech: 'noun' },
          { word: 'itinerary', translation: 'itinerario', definition: 'A planned route or schedule for a trip.', example: 'They didn\'t really have an itinerary - they just explored.', partOfSpeech: 'noun' },
          { word: 'accommodation', translation: 'alojamiento', definition: 'A place to stay, such as a hotel or hostel.', example: 'Cheap accommodation let them travel for longer.', partOfSpeech: 'noun' },
          { word: 'local', translation: 'local (persona/lugar)', definition: 'A person or thing from a particular area.', example: 'A local told them the best place to eat pizza.', partOfSpeech: 'adjective/noun' },
          { word: 'landmark', translation: 'monumento/punto de referencia', definition: 'A famous building or place that is easy to recognise.', example: 'The Eiffel Tower is a famous landmark.', partOfSpeech: 'noun' },
          { word: 'worth it', translation: 'que vale la pena', definition: 'Deserving the time, money, or effort spent.', example: 'The long bus journey was worth it in the end.', partOfSpeech: 'adjective phrase' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What is a "hostel"?', options: ['An expensive hotel', 'A cheap place for travellers to stay', 'A type of bag', 'A famous landmark'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "the amount of money you have to spend"?', options: ['Journey', 'Budget', 'Souvenir', 'Destination'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "extremely tired"?', options: ['Unforgettable', 'Exhausted', 'Local', 'Worth it'], answer: 1 },
          { type: 'mcq', prompt: 'Which phrase means "to not know where you are"?', options: ['Get lost', 'Explore', 'Travel', 'Arrive'], answer: 0 },
          { type: 'mcq', prompt: 'What is an "itinerary"?', options: ['A type of bag', 'A planned route or schedule', 'A cheap hotel', 'A famous building'], answer: 1 },
          { type: 'mcq', prompt: 'Which word describes something "so good you will always remember it"?', options: ['Local', 'Unforgettable', 'Exhausted', 'Accommodation'], answer: 1 },
          { type: 'mcq', prompt: 'What do you call a famous building that is easy to recognise?', options: ['A landmark', 'A ruin', 'A journey', 'A souvenir'], answer: 0 },
          { type: 'mcq', prompt: 'Which word means "an object you keep to remember a place"?', options: ['Itinerary', 'Souvenir', 'Fountain', 'Destination'], answer: 1 },
          { type: 'mcq', prompt: 'What is a "fountain"?', options: ['A place to sleep', 'A structure that sends water into the air', 'An old, damaged building', 'A type of bag'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "a place to stay, like a hotel or hostel"?', options: ['Accommodation', 'Journey', 'Landmark', 'Adventure'], answer: 0 },
          { type: 'mcq', prompt: 'Complete: "A ___ told us the best place to eat pizza."', options: ['souvenir', 'local', 'ruin', 'budget'], answer: 1 },
          { type: 'mcq', prompt: 'Which phrase means "deserving the time or effort spent"?', options: ['Get lost', 'Worth it', 'Explore', 'Unforgettable'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'travel-and-transportation',
    title: 'Travel and Transportation',
    titleEs: 'Los viajes y el transporte',
    description: 'Sarah and Daniel plan their first trip together, comparing destinations, hotels and transport.',
    order: 6,
    accessTier: 'premium',
    unitOverview: {
      objective: 'Comparar destinos, transporte y alojamiento usando comparativos y superlativos.',
      outcomes: [
        'comparar dos opciones usando adjetivos comparativos',
        'describir la mejor o peor opción usando superlativos',
        'hablar de medios de transporte y sus ventajas',
        'entender un texto sobre planear un viaje'
      ],
      grammar: ['Comparative and superlative adjectives'],
      vocabulary: ['transportation', 'travel planning', 'accommodation'],
      scenario: 'Sarah y Daniel planean su primer viaje juntos, comparando ciudades, hoteles y formas de transporte.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Planning Our First Trip Together',
        description: 'Sarah and Daniel compare destinations, hotels and transport to plan their first trip together.',
        reading: {
          title: 'Planning Our First Trip Together',
          illustration: {
            src: '/assets/readings/english/a2/unit-06-planning-trip.webp',
            alt: 'Sarah and Daniel looking at a map on the kitchen table',
            animation: 'subtle-float'
          },
          text:
            'After months of talking about it, Sarah and Daniel finally decide to plan a trip together. "Let\'s choose somewhere neither of us has been," Daniel suggests one Sunday afternoon, with a map spread across the kitchen table.\n\n' +
            '\"Edinburgh looks amazing,\" says Sarah, \"and it\'s closer than most other cities we\'re thinking of.\" Daniel agrees, but he also suggests Dublin. \"Dublin might be more interesting for us - I\'ve heard the nightlife there is livelier than in Edinburgh, but the castle in Edinburgh looks more impressive than anything in Dublin.\"\n\n' +
            'They compare prices online. A flight to Dublin is cheaper than a flight to Edinburgh, but the train to Edinburgh is faster than the ferry to Dublin. "The train is definitely more convenient," Sarah says. "We don\'t have to worry about the airport, and it\'s more comfortable than flying." In the end, they choose Edinburgh - it seems like the easiest option, and Sarah has always wanted to see the castle.\n\n' +
            'Next, they need to decide on accommodation. They compare three hotels online. The first is the cheapest, but the reviews say it\'s noisier than the others. The second is more expensive, but it has the best location, right in the historic centre. The third is the most luxurious, with a spa and a beautiful view, but it\'s also the most expensive of the three. "Let\'s choose the second one," Daniel says. "It\'s not the cheapest, but it\'s better value, and the location is more important than luxury for a short trip."\n\n' +
            'They also plan how to get around the city once they arrive. "Walking is usually the best way to explore a new city," Sarah says, "but the buses here look easier than in some other places I\'ve visited." Daniel agrees that walking will let them see more, but they decide to use public transport if the weather is worse than expected.\n\n' +
            'Finally, they choose the dates: a long weekend in October, when flights and trains are less busy than in summer. "It\'s smarter to travel in autumn," Daniel points out. "Everything is quieter, and the prices are lower than during the busiest months."\n\n' +
            'By the end of the afternoon, they have a plan: the train there, three nights in a comfortable hotel in the centre, and plenty of walking. "This is going to be the best trip yet," Sarah says, smiling at Daniel. "Well," he laughs, "it\'s certainly going to be more organised than your last one!"',
          questions: [
            'Compara dos lugares que conoces usando comparativos (more/less/-er than).',
            '¿Prefieres viajar en tren, avión o autobús? ¿Por qué?'
          ]
        },
        exercises: [
          { type: 'mcq', prompt: 'What is the reading mainly about?', options: ["Sarah's solo trip to Dublin", 'Sarah and Daniel planning their first trip together', 'A problem with their flight', "Daniel's business trip"], answer: 1 },
          { type: 'mcq', prompt: 'Which two cities do they consider?', options: ['London and Paris', 'Edinburgh and Dublin', 'Rome and Florence', 'Barcelona and Paris'], answer: 1 },
          { type: 'mcq', prompt: 'Why do they choose the train instead of flying to Dublin?', options: ["It's cheaper", "It's more convenient and comfortable", "It's the only option", 'Daniel dislikes flying'], answer: 1 },
          { type: 'mcq', prompt: 'Which hotel do they choose?', options: ['The cheapest one', 'The second one, for its location', 'The most luxurious one', 'None of them'], answer: 1 },
          { type: 'mcq', prompt: 'In "it\'s better value," what does "better value" mean here?', options: ['More expensive but worth it', 'Good quality for a reasonable price', 'The cheapest option available', 'The most luxurious choice'], answer: 1 },
          { type: 'mcq', prompt: 'Why do they choose October for the trip?', options: ['It is warmer than summer', "It's less busy and cheaper than summer", 'It is the only free month', 'The hotel is only open then'], answer: 1 },
          { type: 'mcq', prompt: 'What does Daniel mean by "more organised than your last one"?', options: ['He is criticising Sarah seriously', 'He is joking about her unplanned trip with Lucy', 'He means their flight was disorganised', 'He is talking about work'], answer: 1 },
          { type: 'mcq', prompt: 'How do they plan to get around the city?', options: ['Only by taxi', 'Mostly walking, buses if the weather is bad', 'Only by bus', 'They will rent a car'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Booking the Hotel',
        description: 'Listen to Daniel calling the hotel in Edinburgh to confirm the booking.',
        intro: "Listen to Daniel's phone call to the hotel. Focus on the comparisons he makes about rooms and prices.",
        dialogue: [
          { speaker: 'Receptionist', line: 'Good morning, Castle View Hotel. How can I help?', translation: 'Buenos días, Hotel Castle View. ¿En qué puedo ayudarle?' },
          { speaker: 'Daniel', line: "Hi, I'd like to book a room for three nights in October, please.", translation: 'Hola, quisiera reservar una habitación por tres noches en octubre, por favor.' },
          { speaker: 'Receptionist', line: 'Of course. We have a standard room and a deluxe room available.', translation: 'Claro. Tenemos una habitación estándar y una deluxe disponibles.' },
          { speaker: 'Daniel', line: "What's the difference between them?", translation: '¿Cuál es la diferencia entre ellas?' },
          { speaker: 'Receptionist', line: 'The deluxe room is bigger and quieter, but it is more expensive than the standard room.', translation: 'La habitación deluxe es más grande y más silenciosa, pero es más cara que la estándar.' },
          { speaker: 'Daniel', line: "Is the standard room noisy?", translation: '¿Es ruidosa la habitación estándar?' },
          { speaker: 'Receptionist', line: 'A little, since it faces the street, but it has the best view of the castle.', translation: 'Un poco, ya que da a la calle, pero tiene la mejor vista del castillo.' },
          { speaker: 'Daniel', line: "That sounds perfect, actually. We'll take the standard room, please.", translation: 'Eso suena perfecto, en realidad. Tomaremos la habitación estándar, por favor.' },
          { speaker: 'Receptionist', line: 'Great choice! It is also cheaper, so that works well for you.', translation: '¡Buena elección! También es más barata, así que les conviene.' },
          { speaker: 'Daniel', line: "Perfect. Thank you very much for your help.", translation: 'Perfecto. Muchas gracias por su ayuda.' }
        ],
        phrases: [
          "What's the difference between...?",
          '... is bigger/quieter/cheaper than...',
          'It has the best...',
          "We'll take..."
        ],
        exercises: [
          { type: 'mcq', prompt: 'How many nights does Daniel book?', options: ['Two', 'Three', 'Four', 'Five'], answer: 1 },
          { type: 'mcq', prompt: 'Which two room types does the hotel offer?', options: ['Standard and deluxe', 'Single and double', 'Cheap and luxury', 'Small and large'], answer: 0 },
          { type: 'mcq', prompt: 'Which room is bigger and quieter?', options: ['The standard room', 'The deluxe room', 'Both are the same', 'Neither room'], answer: 1 },
          { type: 'mcq', prompt: 'Why might the standard room be noisy?', options: ['It is near the kitchen', 'It faces the street', 'It is next to the lift', 'It has no windows'], answer: 1 },
          { type: 'mcq', prompt: 'What is special about the standard room?', options: ['It has a private balcony', 'It has the best view of the castle', 'It has a spa', 'It is the biggest room'], answer: 1 },
          { type: 'mcq', prompt: 'Which room does Daniel choose?', options: ['The deluxe room', 'The standard room', 'Neither room', 'Both rooms'], answer: 1 },
          { type: 'mcq', prompt: 'Why is Daniel happy with his choice?', options: ['It is the most expensive', 'It has a good view and is cheaper', 'It is the quietest room', 'It has room service'], answer: 1 },
          { type: 'mcq', prompt: 'What is the purpose of this phone call?', options: ['To cancel a booking', 'To book and choose a hotel room', 'To complain about noise', 'To ask about restaurants'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Comparing Places and Transport',
        description: 'Compare two places or ways of travelling using comparative and superlative adjectives.',
        mission:
          "Compare two cities, hotels, or ways of travelling that you know, using comparative adjectives, and say which one is the best or the most convenient.",
        phrases: [
          '... is bigger/cheaper/faster than...',
          'The best way to travel is...',
          'The most convenient/expensive option is...',
          'I prefer... because it is more...'
        ],
        dialogue: [
          { speaker: 'You', line: "I think the train is more comfortable than the bus.", translation: 'Creo que el tren es más cómodo que el autobús.' },
          { speaker: 'Partner', line: "But isn't the bus cheaper?", translation: '¿Pero no es más barato el autobús?' },
          { speaker: 'You', line: "Yes, it's cheaper, but the train is faster and less tiring.", translation: 'Sí, es más barato, pero el tren es más rápido y menos cansado.' },
          { speaker: 'Partner', line: "That's true. For me, the most important thing is comfort.", translation: 'Es cierto. Para mí, lo más importante es la comodidad.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Compare two cities or places you know, using at least three comparative adjectives.', answer: 'Oral practice' },
          { type: 'speaking', prompt: 'Now say which way of travelling (train, bus, plane, car) you think is the best, and why.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the dialogue comparing transport with a partner, then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Comparing Two Destinations',
        description: 'Write a short comparison of two travel destinations or ways of travelling.',
        mission:
          "Write 80-130 words comparing two travel destinations (or two ways of travelling), and say which one you would choose and why.",
        phrases: [
          '... is more/less... than...',
          'The biggest difference is...',
          'In the end, I would choose... because...',
          'It is the best/cheapest/most convenient option.'
        ],
        dialogue: [
          {
            speaker: 'Model',
            line:
              "I once compared a trip to the mountains and a trip to the beach. The mountains are quieter and cheaper than the beach in summer, but the beach is more relaxing and has better weather. The biggest difference is the activities: in the mountains, we go hiking, but at the beach, we usually just swim and rest. In the end, I would choose the beach for a short holiday, because it is more relaxing and less tiring than hiking all day.",
            translation:
              'Una vez comparé un viaje a las montañas y un viaje a la playa. Las montañas son más tranquilas y más baratas que la playa en verano, pero la playa es más relajante y tiene mejor clima. La diferencia más grande son las actividades: en las montañas hacemos senderismo, pero en la playa normalmente solo nadamos y descansamos. Al final, elegiría la playa para unas vacaciones cortas, porque es más relajante y menos cansada que caminar todo el día.'
          }
        ],
        exercises: [
          {
            type: 'writing',
            prompt:
              "Write 80-130 words comparing two travel destinations or two ways of travelling, using at least three comparative or superlative adjectives.",
            answer: 'Open answer'
          }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Comparative and Superlative Adjectives',
        description: 'Compare two or more things using comparative and superlative forms.',
        grammarNote:
          'Use comparative adjectives to compare two things: short adjectives add -er (cheap -> cheaper), and longer adjectives use more (expensive -> more expensive). Use than to introduce the second thing: "The train is faster than the bus."\n\n' +
          'Use superlative adjectives to compare three or more things and show the extreme: short adjectives add the -est (cheap -> the cheapest), and longer adjectives use the most (expensive -> the most expensive). Some adjectives are irregular: good -> better -> the best; bad -> worse -> the worst.\n\n' +
          'Apoyo: usa comparativos (-er/more + than) para comparar dos cosas; usa superlativos (the -est/the most) para comparar tres o más cosas.',
        phrases: [
          '... -er than / more... than',
          'the -est / the most...',
          'better than / the best',
          'worse than / the worst'
        ],
        exercises: [
          { type: 'mcq', prompt: 'The train is ___ than the bus.', options: ['fast', 'faster', 'fastest', 'more fast'], answer: 1 },
          { type: 'mcq', prompt: 'This is ___ hotel in the city.', options: ['expensive', 'more expensive', 'the most expensive', 'expensiver'], answer: 2 },
          { type: 'mcq', prompt: 'Flying is usually ___ than taking the train.', options: ['expensive', 'more expensive', 'the most expensive', 'expensivest'], answer: 1 },
          { type: 'mcq', prompt: 'This is ___ trip we have ever taken.', options: ['good', 'better', 'the best', 'best'], answer: 2 },
          { type: 'mcq', prompt: 'October is ___ than summer for travelling.', options: ['cheap', 'cheaper', 'the cheapest', 'cheapest'], answer: 1 },
          { type: 'mcq', prompt: 'This room is ___ than the other one - I can hear the street.', options: ['noisy', 'noisier', 'the noisiest', 'more noisy'], answer: 1 },
          { type: 'mcq', prompt: 'Of all three hotels, this one is ___.', options: ['luxurious', 'more luxurious', 'the most luxurious', 'luxuriouser'], answer: 2 },
          { type: 'mcq', prompt: 'Walking is ___ way to see the city.', options: ['good', 'the best', 'better', 'best'], answer: 1 },
          { type: 'mcq', prompt: 'This bus is ___ than I expected.', options: ['comfortable', 'more comfortable', 'the most comfortable', 'comfortabler'], answer: 1 },
          { type: 'mcq', prompt: 'That was ___ meal of the whole trip.', options: ['bad', 'worse', 'the worst', 'worst'], answer: 2 },
          { type: 'mcq', prompt: 'Dublin is ___ than Edinburgh in some ways.', options: ['interesting', 'more interesting', 'the most interesting', 'interestinger'], answer: 1 },
          { type: 'mcq', prompt: 'This is ___ way to travel - it saves a lot of money.', options: ['cheap', 'cheaper', 'the cheapest', 'more cheap'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Transportation and Travel Planning',
        description: 'Key words for transport, accommodation, and planning a trip.',
        vocabulary: [
          { word: 'flight', translation: 'vuelo', definition: 'A journey by plane.', example: 'A flight to Dublin was cheaper than to Edinburgh.', partOfSpeech: 'noun' },
          { word: 'ferry', translation: 'ferri/transbordador', definition: 'A boat that carries passengers or vehicles on a regular route.', example: 'The ferry to Dublin takes longer than the train.', partOfSpeech: 'noun' },
          { word: 'platform', translation: 'andén', definition: 'The area of a station where you get on or off a train.', example: 'The train left from platform three.', partOfSpeech: 'noun' },
          { word: 'reservation / booking', translation: 'reserva', definition: 'An arrangement to have something (a room, a table) kept for you.', example: 'They made a hotel reservation for three nights.', partOfSpeech: 'noun' },
          { word: 'review', translation: 'reseña', definition: 'A written opinion about a product or service.', example: 'The reviews said the first hotel was noisy.', partOfSpeech: 'noun' },
          { word: 'location', translation: 'ubicación', definition: 'The place where something is.', example: 'The hotel has the best location in the city.', partOfSpeech: 'noun' },
          { word: 'value (for money)', translation: 'relación calidad-precio', definition: 'How good something is for the price you pay.', example: 'The second hotel is better value than the third.', partOfSpeech: 'noun phrase' },
          { word: 'luxurious', translation: 'lujoso/a', definition: 'Very comfortable and expensive.', example: 'The third hotel is the most luxurious of the three.', partOfSpeech: 'adjective' },
          { word: 'public transport', translation: 'transporte público', definition: 'Buses, trains, and other transport available to everyone.', example: "They'll use public transport if the weather is bad.", partOfSpeech: 'noun phrase' },
          { word: 'convenient', translation: 'conveniente', definition: 'Easy or useful for a particular purpose.', example: 'The train is more convenient than flying.', partOfSpeech: 'adjective' },
          { word: 'departure', translation: 'salida', definition: 'The act of leaving, especially at the start of a journey.', example: 'Their departure time is early in the morning.', partOfSpeech: 'noun' },
          { word: 'arrival', translation: 'llegada', definition: 'The act of reaching a place.', example: 'Their arrival in Edinburgh is at midday.', partOfSpeech: 'noun' },
          { word: 'delay', translation: 'retraso', definition: 'A situation in which something happens later than planned.', example: 'There was a short delay before the train left.', partOfSpeech: 'noun' },
          { word: 'get around', translation: 'moverse/desplazarse (en un lugar)', definition: 'To travel or move within a place.', example: 'Walking is the best way to get around the city.', partOfSpeech: 'phrasal verb' },
          { word: 'sightseeing', translation: 'hacer turismo', definition: 'Visiting interesting places as a tourist.', example: 'They spent the first day sightseeing in the city centre.', partOfSpeech: 'noun' },
          { word: 'itinerary', translation: 'itinerario', definition: 'A planned route or schedule for a trip.', example: 'They planned a simple itinerary: the castle, then the old town.', partOfSpeech: 'noun' },
          { word: 'round trip / return ticket', translation: 'boleto de ida y vuelta', definition: 'A ticket for travelling to a place and back again.', example: 'A return ticket was cheaper than two single tickets.', partOfSpeech: 'noun phrase' },
          { word: 'crowded', translation: 'lleno/concurrido', definition: 'Full of people.', example: 'Trains are more crowded in summer than in autumn.', partOfSpeech: 'adjective' },
          { word: 'off-season', translation: 'temporada baja', definition: 'The time of year when fewer people travel.', example: 'They travelled off-season, so prices were lower.', partOfSpeech: 'noun phrase' },
          { word: 'pack (a bag)', translation: 'empacar', definition: 'To put clothes and things into a bag for a trip.', example: 'Sarah packed her bag the night before.', partOfSpeech: 'verb' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What is a "flight"?', options: ['A journey by boat', 'A journey by plane', 'A journey by train', 'A journey on foot'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "an arrangement to keep a room or table for you"?', options: ['Review', 'Reservation', 'Departure', 'Delay'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "very comfortable and expensive"?', options: ['Convenient', 'Crowded', 'Luxurious', 'Off-season'], answer: 2 },
          { type: 'mcq', prompt: 'Which word means "full of people"?', options: ['Crowded', 'Convenient', 'Luxurious', 'Off-season'], answer: 0 },
          { type: 'mcq', prompt: 'What does "get around" mean?', options: ['To leave a place', 'To travel or move within a place', 'To book a hotel', 'To arrive somewhere'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "the time of year when fewer people travel"?', options: ['Departure', 'Off-season', 'Arrival', 'Delay'], answer: 1 },
          { type: 'mcq', prompt: 'What is a "review"?', options: ['A ticket', 'A written opinion about a service', 'A type of transport', 'A hotel room'], answer: 1 },
          { type: 'mcq', prompt: 'What is "sightseeing"?', options: ['Booking a hotel', 'Visiting interesting places as a tourist', 'Waiting at the airport', 'Packing a bag'], answer: 1 },
          { type: 'mcq', prompt: 'Which word describes the place where a hotel or shop is?', options: ['Location', 'Delay', 'Value', 'Departure'], answer: 0 },
          { type: 'mcq', prompt: 'What is a "delay"?', options: ['A situation where something happens later than planned', 'A type of ticket', 'A famous place', 'A cheap hotel'], answer: 0 },
          { type: 'mcq', prompt: 'Which word means "a ticket for travelling somewhere and back"?', options: ['Platform', 'Round trip', 'Itinerary', 'Arrival'], answer: 1 },
          { type: 'mcq', prompt: 'What do you do before a trip, with your clothes?', options: ['Pack a bag', 'Get around', 'Book a review', 'Arrive'], answer: 0 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'health-and-healthy-habits',
    title: 'Health and Healthy Habits',
    titleEs: 'La salud y los hábitos saludables',
    description: 'Sarah catches a cold after the Edinburgh trip, sees a doctor, and decides to build healthier habits.',
    order: 7,
    accessTier: 'premium',
    unitOverview: {
      objective: 'Dar consejos y hablar de obligaciones sobre la salud usando should/shouldn\'t y have to/don\'t have to.',
      outcomes: [
        'dar y pedir consejos de salud con should/shouldn\'t',
        'hablar de obligaciones y su ausencia con have to / don\'t have to',
        'describir síntomas y hábitos saludables',
        'entender una consulta médica y una conversación sobre cambios de hábito'
      ],
      grammar: ["Should / shouldn't (advice)", "Have to / don't have to (obligation)"],
      vocabulary: ['illness and symptoms', 'healthy habits', 'seeing a doctor'],
      scenario: 'Sarah se resfría después del viaje a Edimburgo, visita al médico, y decide adoptar hábitos más saludables.'
    },
    activities: {
      reading: activity('reading', {
        title: 'A Cold After Edinburgh',
        description: 'Sarah catches a cold after the trip, sees a doctor, and decides to build healthier habits.',
        reading: {
          title: 'A Cold After Edinburgh',
          illustration: {
            src: '/assets/readings/english/a2/unit-07-cold-after-trip.webp',
            alt: 'Sarah resting on the sofa with tea and tissues',
            animation: 'subtle-float'
          },
          text:
            'Two days after returning from Edinburgh, Sarah wakes up with a sore throat, a headache, and a temperature. "I think I caught a cold in the rain," she tells Daniel over the phone, her voice hoarse. "You should stay in bed today," Daniel says. "I\'ll bring you some soup later."\n\n' +
            'By the afternoon, Sarah feels worse, so she decides to see a doctor. At the clinic, the doctor listens to her symptoms carefully. "It\'s a common cold, nothing serious," the doctor says, "but you should rest for a few days. You don\'t have to take antibiotics - they won\'t help with a virus."\n\n' +
            '"What should I do, then?" Sarah asks. "You should drink plenty of water, and you should sleep at least eight hours a night," the doctor explains. "You shouldn\'t go to work until your temperature is normal, and you shouldn\'t exercise until you feel completely better." The doctor also recommends some vitamin C and a warm honey and lemon drink for her throat.\n\n' +
            '"Do I have to stay at home all week?" Sarah asks, worried about missing work. "No, you don\'t have to stay home all week," the doctor smiles, "just until the worst symptoms pass - probably two or three days."\n\n' +
            'Sarah follows the advice. She sleeps a lot, drinks water and herbal tea, and watches films on the sofa. Daniel visits every evening with soup and fruit. "You don\'t have to cook for yourself this week," he tells her. "Just rest."\n\n' +
            'After four days, Sarah feels much better. The experience makes her think about her health more generally. "I should probably take better care of myself," she tells Daniel. "I don\'t exercise enough, and I eat too much fast food when I\'m busy."\n\n' +
            'Together, they make a plan. Sarah decides she should walk more instead of always taking the bus, and she shouldn\'t skip breakfast, even on busy mornings. She also decides she should drink less coffee and more water during the day.\n\n' +
            '"You don\'t have to change everything at once," Daniel reminds her. "Small changes are usually the ones that last." Sarah agrees, and the next Monday, she walks part of the way to work for the first time in months.\n\n' +
            'A month later, Sarah feels healthier and has more energy. "I still love pizza," she laughs, "but I definitely feel better since the cold." Daniel smiles. "Maybe getting sick was a strange kind of luck."',
          questions: [
            '¿Qué consejo de salud le darías a un amigo resfriado, usando should/shouldn\'t?',
            'Escribe dos hábitos saludables que quieras mejorar en tu vida.'
          ]
        },
        exercises: [
          { type: 'mcq', prompt: 'What is the reading mainly about?', options: ['Sarah planning another trip', 'Sarah getting a cold and deciding to build healthier habits', "Daniel's illness", 'A problem at the clinic'], answer: 1 },
          { type: 'mcq', prompt: 'Why does Sarah go to the doctor?', options: ['For a routine check-up', 'Because she feels worse - sore throat, headache, temperature', 'Because Daniel is sick', 'To ask about exercise'], answer: 1 },
          { type: 'mcq', prompt: 'Does the doctor prescribe antibiotics?', options: ['Yes, immediately', "No, because it's a virus and antibiotics won't help", 'Yes, but only for one day', 'The reading does not say'], answer: 1 },
          { type: 'mcq', prompt: 'How many days does the doctor think she needs to stay home?', options: ['One day', 'Two or three days', 'A full week', 'Two weeks'], answer: 1 },
          { type: 'mcq', prompt: 'In "her voice hoarse," what does hoarse mean?', options: ['Loud and clear', 'Rough and weak-sounding', 'Very quiet', 'Happy'], answer: 1 },
          { type: 'mcq', prompt: 'What healthy habits does Sarah decide to start?', options: ['Only sleeping more', 'Walking more, not skipping breakfast, drinking less coffee', 'Stopping all fast food completely', 'Only drinking more water'], answer: 1 },
          { type: 'mcq', prompt: 'What does Daniel mean by "small changes are usually the ones that last"?', options: ['Big changes work better', 'Gradual changes are more likely to become permanent habits', 'Nothing ever really changes', 'Changes should happen quickly'], answer: 1 },
          { type: 'mcq', prompt: 'How does Sarah feel a month later?', options: ['Sicker than before', 'Healthier, with more energy', 'The same as before', 'Tired of walking'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: "At the Doctor's",
        description: "Listen to Sarah's consultation with the doctor after she catches a cold.",
        intro: "Listen to the consultation between Sarah and the doctor. Focus on the advice given with should/shouldn't and have to/don't have to.",
        dialogue: [
          { speaker: 'Doctor', line: 'So, tell me your symptoms.', translation: 'Bueno, dígame sus síntomas.' },
          { speaker: 'Sarah', line: "I have a sore throat, a headache, and I think I have a temperature.", translation: 'Tengo dolor de garganta, dolor de cabeza, y creo que tengo temperatura.' },
          { speaker: 'Doctor', line: "It's a common cold. You should rest and drink plenty of water.", translation: 'Es un resfriado común. Debería descansar y tomar mucha agua.' },
          { speaker: 'Sarah', line: "Do I have to take antibiotics?", translation: '¿Tengo que tomar antibióticos?' },
          { speaker: 'Doctor', line: "No, you don't have to - it's a virus, so antibiotics won't help.", translation: 'No, no tiene que hacerlo, es un virus, así que los antibióticos no ayudarán.' },
          { speaker: 'Sarah', line: "Should I go to work tomorrow?", translation: '¿Debería ir al trabajo mañana?' },
          { speaker: 'Doctor', line: "No, you shouldn't - not until your temperature is normal.", translation: 'No, no debería, no hasta que su temperatura sea normal.' },
          { speaker: 'Sarah', line: "How long do I have to stay home?", translation: '¿Cuánto tiempo tengo que quedarme en casa?' },
          { speaker: 'Doctor', line: "Probably two or three days. You don't have to stay home all week.", translation: 'Probablemente dos o tres días. No tiene que quedarse en casa toda la semana.' },
          { speaker: 'Sarah', line: "Thank you, doctor. I'll follow your advice.", translation: 'Gracias, doctor. Seguiré su consejo.' }
        ],
        phrases: [
          'You should... / You shouldn\'t...',
          'Do I have to...?',
          "You don't have to...",
          'How long do I have to...?'
        ],
        exercises: [
          { type: 'mcq', prompt: 'What symptoms does Sarah describe?', options: ['A stomach ache', 'A sore throat, headache, and temperature', 'A broken arm', 'A cough only'], answer: 1 },
          { type: 'mcq', prompt: 'What does the doctor recommend first?', options: ['Antibiotics', 'Rest and plenty of water', 'A hospital visit', 'Surgery'], answer: 1 },
          { type: 'mcq', prompt: 'Does Sarah have to take antibiotics?', options: ['Yes, immediately', 'No, because it is a virus', 'Yes, for a week', 'The doctor is not sure'], answer: 1 },
          { type: 'mcq', prompt: 'Should Sarah go to work tomorrow?', options: ['Yes, she should', 'No, not until her temperature is normal', 'Yes, but only in the morning', 'The doctor does not say'], answer: 1 },
          { type: 'mcq', prompt: 'How long does the doctor think she needs to stay home?', options: ['One day', 'Two or three days', 'A full week', 'Two weeks'], answer: 1 },
          { type: 'mcq', prompt: 'Does Sarah have to stay home all week?', options: ['Yes, all week', "No, she doesn't have to", 'Yes, if the fever continues', 'The doctor does not know'], answer: 1 },
          { type: 'mcq', prompt: 'What is the doctor\'s overall diagnosis?', options: ['A serious infection', 'A common cold, nothing serious', 'The flu', 'An allergy'], answer: 1 },
          { type: 'mcq', prompt: 'What is the main purpose of this conversation?', options: ['To book a future appointment', 'For the doctor to diagnose Sarah and give advice', 'To discuss Sarah\'s trip', 'To prescribe surgery'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Giving Health Advice',
        description: "Give advice about health using should/shouldn't and have to/don't have to.",
        mission:
          "Give a partner advice about staying healthy (sleep, food, exercise) using should/shouldn't, and talk about one thing you don't have to do but choose to do anyway.",
        phrases: [
          'You should... / You shouldn\'t...',
          "You don't have to..., but...",
          'I have to... every day.',
          'What do you think I should do about...?'
        ],
        dialogue: [
          { speaker: 'You', line: "You should drink more water every day.", translation: 'Deberías tomar más agua cada día.' },
          { speaker: 'Partner', line: "You're right. Do I have to stop drinking coffee completely?", translation: 'Tienes razón. ¿Tengo que dejar de tomar café por completo?' },
          { speaker: 'You', line: "No, you don't have to stop completely, but you shouldn't drink too much.", translation: 'No, no tienes que dejarlo por completo, pero no deberías tomar demasiado.' },
          { speaker: 'Partner', line: "That makes sense. I should probably sleep more too.", translation: 'Tiene sentido. Probablemente también debería dormir más.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Give a partner three pieces of health advice using should/shouldn\'t.', answer: 'Oral practice' },
          { type: 'speaking', prompt: "Now talk about one thing you have to do every day, and one thing you don't have to do but choose to.", answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the health advice dialogue with a partner, then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'My Healthy Habits',
        description: 'Write about your healthy habits, or habits you want to improve.',
        mission:
          "Write 80-130 words about your health habits: what you should do more of, what you shouldn't do, and one small change you want to make.",
        phrases: [
          'I think I should...',
          "I shouldn't...",
          "I don't have to..., but I choose to...",
          'A small change I want to make is...'
        ],
        dialogue: [
          {
            speaker: 'Model',
            line:
              "I think I should exercise more - I usually walk very little during the week. I shouldn't eat so much fast food when I'm busy, because it makes me feel tired afterwards. I don't have to go to the gym every day, but I choose to go three times a week, because it helps my mood. A small change I want to make is drinking more water and less coffee. I know small changes are usually the ones that last, so I'm starting slowly.",
            translation:
              'Creo que debería hacer más ejercicio; normalmente camino muy poco durante la semana. No debería comer tanta comida rápida cuando estoy ocupado, porque me hace sentir cansado después. No tengo que ir al gimnasio todos los días, pero elijo ir tres veces por semana, porque ayuda a mi estado de ánimo. Un pequeño cambio que quiero hacer es tomar más agua y menos café. Sé que los pequeños cambios suelen ser los que duran, así que estoy empezando despacio.'
          }
        ],
        exercises: [
          {
            type: 'writing',
            prompt:
              "Write 80-130 words about your health habits, using should/shouldn't and have to/don't have to at least twice each.",
            answer: 'Open answer'
          }
        ]
      }),
      grammar: activity('grammar', {
        title: "Should / Shouldn't and Have to / Don't Have to",
        description: 'Give advice and talk about obligations related to health.',
        grammarNote:
          "Use should to give advice or say what is a good idea: \"You should rest.\" Use shouldn't for advice against something: \"You shouldn't skip breakfast.\" The question form is Should I...?\n\n" +
          "Use have to for obligations or necessary rules: \"I have to take this medicine.\" Use don't have to when something is not necessary, but not forbidden: \"You don't have to stay home all week.\" This is different from shouldn't, which means it's a bad idea, not just unnecessary.\n\n" +
          "Apoyo: usa should/shouldn't para dar consejos; usa have to para obligaciones necesarias y don't have to cuando algo NO es necesario (pero no está prohibido).",
        phrases: [
          "You should... / You shouldn't...",
          'Should I...?',
          'I have to... / I don\'t have to...',
          'Do I have to...?'
        ],
        exercises: [
          { type: 'mcq', prompt: 'You ___ drink plenty of water when you have a cold.', options: ['should', 'shouldn\'t', 'has to', 'have'], answer: 0 },
          { type: 'mcq', prompt: 'You ___ smoke - it is very bad for your health.', options: ['should', "shouldn't", 'have to', "don't have to"], answer: 1 },
          { type: 'mcq', prompt: '___ I take this medicine before or after food?', options: ['Do', 'Should', 'Have', 'Am'], answer: 1 },
          { type: 'mcq', prompt: 'I ___ to see a doctor - it is just a small cold.', options: ["don't have", "shouldn't have", 'have', "doesn't have"], answer: 0 },
          { type: 'mcq', prompt: 'Patients ___ to wear a mask in this clinic - it is a rule.', options: ["don't have", 'have', "shouldn't", 'should not'], answer: 1 },
          { type: 'mcq', prompt: 'You ___ exercise until you feel completely better.', options: ["shouldn't", 'should', 'have to', "don't have to"], answer: 0 },
          { type: 'mcq', prompt: '___ I have to take antibiotics for a cold?', options: ['Should', 'Do', 'Have', 'Am'], answer: 1 },
          { type: 'mcq', prompt: 'You ___ eat more vegetables - it would help your health.', options: ["shouldn't", 'should', "don't have to", 'has to'], answer: 1 },
          { type: 'mcq', prompt: 'We ___ pay for this appointment - it is free.', options: ["don't have to", 'have to', "shouldn't", 'should'], answer: 0 },
          { type: 'mcq', prompt: 'You ___ stay in bed all day, just rest when you feel tired.', options: ["don't have to", 'have to', 'should', "shouldn't"], answer: 0 },
          { type: 'mcq', prompt: 'He ___ go to work today - his temperature is still high.', options: ["shouldn't", 'should', "doesn't have to", 'has to'], answer: 0 },
          { type: 'mcq', prompt: 'You ___ sleep at least eight hours a night for good health.', options: ["shouldn't", 'should', "don't have to", 'has to'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Illness, Symptoms and Healthy Habits',
        description: 'Key words for describing illness, symptoms, and healthy habits.',
        vocabulary: [
          { word: 'sore throat', translation: 'dolor de garganta', definition: 'Pain or discomfort in the throat.', example: 'Sarah woke up with a sore throat.', partOfSpeech: 'noun phrase' },
          { word: 'temperature (fever)', translation: 'fiebre', definition: 'A body temperature higher than normal, usually from illness.', example: 'She had a temperature after the trip.', partOfSpeech: 'noun' },
          { word: 'symptom', translation: 'síntoma', definition: 'A sign of illness that a person feels or shows.', example: 'The doctor asked about her symptoms.', partOfSpeech: 'noun' },
          { word: 'cold (illness)', translation: 'resfriado', definition: 'A common mild illness affecting the nose and throat.', example: 'She caught a cold in the rain.', partOfSpeech: 'noun' },
          { word: 'virus', translation: 'virus', definition: 'A tiny organism that can cause illness.', example: 'Antibiotics do not help with a virus.', partOfSpeech: 'noun' },
          { word: 'antibiotics', translation: 'antibióticos', definition: 'Medicine used to treat infections caused by bacteria.', example: 'The doctor said she did not need antibiotics.', partOfSpeech: 'noun' },
          { word: 'rest', translation: 'descansar/descanso', definition: 'To relax and stop physical activity, usually to recover.', example: 'The doctor told her to rest for a few days.', partOfSpeech: 'noun/verb' },
          { word: 'recover', translation: 'recuperarse', definition: 'To become well again after an illness.', example: 'She recovered after four days.', partOfSpeech: 'verb' },
          { word: 'clinic', translation: 'clínica', definition: 'A place where people go to see a doctor.', example: 'Sarah went to the clinic in the afternoon.', partOfSpeech: 'noun' },
          { word: 'appointment', translation: 'cita (médica)', definition: 'An arranged time to see a doctor or professional.', example: 'She had a doctor\'s appointment at three o\'clock.', partOfSpeech: 'noun' },
          { word: 'diagnosis', translation: 'diagnóstico', definition: 'The doctor\'s identification of an illness.', example: 'The diagnosis was a common cold.', partOfSpeech: 'noun' },
          { word: 'exercise', translation: 'ejercicio/ejercitarse', definition: 'Physical activity to stay healthy and fit.', example: 'She decided to exercise more after the cold.', partOfSpeech: 'noun/verb' },
          { word: 'skip (a meal)', translation: 'saltarse (una comida)', definition: 'To not eat a meal you usually eat.', example: 'She decided not to skip breakfast anymore.', partOfSpeech: 'verb' },
          { word: 'balanced diet', translation: 'dieta equilibrada', definition: 'Eating a variety of healthy foods in the right amounts.', example: 'A balanced diet helps you stay healthy.', partOfSpeech: 'noun phrase' },
          { word: 'energy', translation: 'energía', definition: 'The physical or mental strength to do things.', example: 'Sarah has more energy since her new habits.', partOfSpeech: 'noun' },
          { word: 'habit', translation: 'hábito', definition: 'Something you do regularly, often without thinking.', example: 'Small habits can make a big difference.', partOfSpeech: 'noun' },
          { word: 'stay in shape', translation: 'mantenerse en forma', definition: 'To keep your body healthy and fit.', example: 'Walking to work helps her stay in shape.', partOfSpeech: 'phrase' },
          { word: 'herbal tea', translation: 'té de hierbas', definition: 'A hot drink made from plants, often for health benefits.', example: 'She drank herbal tea while she was sick.', partOfSpeech: 'noun phrase' },
          { word: 'take care of yourself', translation: 'cuidarte a ti mismo/a', definition: 'To look after your own health and wellbeing.', example: 'She decided to take better care of herself.', partOfSpeech: 'phrase' },
          { word: 'improve', translation: 'mejorar', definition: 'To make or become better.', example: 'Her health improved after a few weeks.', partOfSpeech: 'verb' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What is a "symptom"?', options: ['A type of medicine', 'A sign of illness', 'A doctor\'s office', 'A healthy habit'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "to become well again after an illness"?', options: ['Recover', 'Skip', 'Improve', 'Diagnose'], answer: 0 },
          { type: 'mcq', prompt: 'What is a "virus"?', options: ['A type of medicine', 'A tiny organism that can cause illness', 'A healthy habit', 'A doctor\'s appointment'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "to not eat a meal you usually eat"?', options: ['Recover', 'Skip', 'Rest', 'Improve'], answer: 1 },
          { type: 'mcq', prompt: 'Where do you go to see a doctor?', options: ['A clinic', 'A habit', 'A diagnosis', 'A symptom'], answer: 0 },
          { type: 'mcq', prompt: 'Which word means "an arranged time to see a doctor"?', options: ['Appointment', 'Diagnosis', 'Habit', 'Energy'], answer: 0 },
          { type: 'mcq', prompt: 'What is a "balanced diet"?', options: ['Eating only one type of food', 'Eating a variety of healthy foods in the right amounts', 'Not eating breakfast', 'Only eating fast food'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "the physical or mental strength to do things"?', options: ['Habit', 'Energy', 'Diagnosis', 'Symptom'], answer: 1 },
          { type: 'mcq', prompt: 'Which phrase means "to look after your own health"?', options: ['Skip a meal', 'Take care of yourself', 'Stay in shape', 'Recover'], answer: 1 },
          { type: 'mcq', prompt: 'What is a "habit"?', options: ['A medicine', 'Something you do regularly', 'A symptom of illness', 'A doctor\'s diagnosis'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "medicine used to treat infections caused by bacteria"?', options: ['Antibiotics', 'Herbal tea', 'Energy', 'Diagnosis'], answer: 0 },
          { type: 'mcq', prompt: 'Which phrase means "to keep your body healthy and fit"?', options: ['Skip a meal', 'Stay in shape', 'Take a temperature', 'Have a symptom'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'plans-and-celebrations',
    title: 'Plans and Celebrations',
    titleEs: 'Planes y celebraciones',
    description: "Sarah plans a surprise birthday party for Daniel with Lucy's help.",
    order: 8,
    accessTier: 'premium',
    unitOverview: {
      objective: "Hablar de planes y decisiones espontáneas usando 'going to' y 'will'.",
      outcomes: [
        "usar 'going to' para hablar de planes ya decididos",
        "usar 'will' para decisiones espontáneas, ofrecimientos y predicciones",
        'hablar de celebraciones y organizar un evento',
        'entender un texto sobre la organización de una fiesta sorpresa'
      ],
      grammar: ["Going to (plans)", "Will (spontaneous decisions and predictions)"],
      vocabulary: ['celebrations', 'party planning', 'invitations'],
      scenario: 'Sarah organiza una fiesta sorpresa de cumpleaños para Daniel, con la ayuda de Lucy y el resto de la familia.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Planning a Surprise for Daniel',
        description: "Sarah organizes a surprise birthday party for Daniel with Lucy's help.",
        reading: {
          title: 'Planning a Surprise for Daniel',
          illustration: {
            src: '/assets/readings/english/a2/unit-08-surprise-party.webp',
            alt: 'Sarah and Lucy planning a surprise party with balloons and a cake',
            animation: 'subtle-float'
          },
          text:
            "Daniel's birthday is next Saturday, and Sarah has a plan: a surprise party at her flat, with his closest friends and her family. \"I'm going to invite everyone this week,\" she tells Lucy on the phone, \"but I need your help with the food.\"\n\n" +
            '"Of course!" Lucy says. "I\'ll bring a cake - I know a great bakery near my flat." Sarah smiles. "Perfect. I\'m going to order some pizza too, and Mum\'s going to make her famous trifle."\n\n' +
            'They start planning the details. "Are you going to tell Daniel anything?" Lucy asks. "No," Sarah laughs, "he thinks we\'re just going to have a quiet dinner together. I\'m going to ask Jake to keep him busy in the garden while everyone arrives."\n\n' +
            'On Wednesday, Sarah calls Daniel\'s best friend, Marcus. "We\'re going to surprise Daniel on Saturday," she explains. "Can you come at six, but don\'t tell him?" Marcus agrees immediately. "I won\'t say a word," he promises. "I\'ll bring some music too - I\'ve got a great playlist."\n\n' +
            'By Friday, everything is almost ready. Sarah is going to pick up balloons in the morning, and Lucy is going to collect the cake in the afternoon. "What if it rains?" Lucy asks, worried. "Then we\'ll have the party inside," Sarah decides quickly. "I\'ll move the furniture if we need to."\n\n' +
            'On Saturday morning, Sarah tells Daniel they\'re just going to relax at home. "Are we going to do anything special?" he asks, a little suspicious. "Not really," Sarah says, trying not to smile too much. "Maybe I\'ll cook something simple."\n\n' +
            'At five o\'clock, Jake arrives and takes Daniel outside to look at some old bicycle he "needs help fixing." While they\'re in the garden, everyone else arrives quietly: Lucy with the cake, Marcus with his speaker, Sarah\'s parents with the trifle, and a dozen friends with presents and balloons.\n\n' +
            'At exactly six o\'clock, Sarah calls Daniel inside. "Surprise!" everyone shouts as he walks through the door. Daniel freezes for a second, completely shocked, then starts laughing. "I really didn\'t expect this," he says. "You\'re all going to get me back for this one day, I promise."\n\n' +
            'Later that evening, as everyone eats cake and dances to Marcus\'s playlist, Daniel finds Sarah in the kitchen. "Thank you for this," he says quietly. "I\'ll never forget it." Sarah smiles. "We\'re going to have many more birthdays like this one."',
          questions: [
            '¿Qué planes tienes para tu próximo cumpleaños o el de alguien cercano? Usa going to.',
            'Escribe dos frases sobre una decisión espontánea que tomaste recientemente, usando will.'
          ]
        },
        exercises: [
          { type: 'mcq', prompt: 'What is the reading mainly about?', options: ["Daniel's work project", 'Sarah organizing a surprise birthday party for Daniel', 'A family argument', "Lucy's new flat"], answer: 1 },
          { type: 'mcq', prompt: 'Who brings the cake?', options: ['Sarah', 'Lucy', 'Marcus', "Sarah's mum"], answer: 1 },
          { type: 'mcq', prompt: 'How does Sarah keep Daniel busy while guests arrive?', options: ['She sends him shopping', 'Jake takes him to the garden to fix a bicycle', 'She asks him to cook', 'He is asleep'], answer: 1 },
          { type: 'mcq', prompt: "What is the backup plan if it rains?", options: ['Cancel the party', 'Have the party inside', 'Move it to a restaurant', 'Postpone it to Sunday'], answer: 1 },
          { type: 'mcq', prompt: 'In "Daniel freezes for a second," what does freezes mean here?', options: ['Feels cold', 'Stops moving for a moment, from surprise', 'Runs away', 'Starts dancing'], answer: 1 },
          { type: 'mcq', prompt: 'Who brings the music?', options: ['Lucy', "Sarah's parents", 'Marcus', 'Jake'], answer: 2 },
          { type: 'mcq', prompt: 'How does Daniel feel about the surprise?', options: ['Angry', 'Shocked but happy', 'Bored', 'Embarrassed'], answer: 1 },
          { type: 'mcq', prompt: 'What does Daniel say he will do?', options: ['Never celebrate again', 'Get everyone back with a surprise one day', 'Move to a new flat', 'Stop eating cake'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Calling Marcus',
        description: "Listen to Sarah's phone call with Daniel's best friend Marcus about the surprise party.",
        intro: "Listen to Sarah's call with Marcus. Focus on the plans (going to) and spontaneous decisions (will).",
        dialogue: [
          { speaker: 'Sarah', line: "Hi Marcus, we're going to surprise Daniel on Saturday for his birthday.", translation: 'Hola Marcus, vamos a sorprender a Daniel el sábado por su cumpleaños.' },
          { speaker: 'Marcus', line: "That's great! What time should I come?", translation: '¡Qué bien! ¿A qué hora debería llegar?' },
          { speaker: 'Sarah', line: "Can you come at six? But please don't tell him anything.", translation: '¿Puedes venir a las seis? Pero por favor no le digas nada.' },
          { speaker: 'Marcus', line: "Don't worry, I won't say a word. I'll bring some music too.", translation: 'No te preocupes, no diré nada. También traeré música.' },
          { speaker: 'Sarah', line: "Perfect! Lucy's going to bring a cake, and my parents are going to bring dessert.", translation: '¡Perfecto! Lucy va a traer un pastel, y mis padres van a traer postre.' },
          { speaker: 'Marcus', line: "Sounds amazing. Are you going to decorate the flat?", translation: 'Suena increíble. ¿Vas a decorar el piso?' },
          { speaker: 'Sarah', line: "Yes, I'm going to buy balloons tomorrow morning.", translation: 'Sí, voy a comprar globos mañana en la mañana.' },
          { speaker: 'Marcus', line: "What if Daniel gets suspicious?", translation: '¿Y si Daniel sospecha algo?' },
          { speaker: 'Sarah', line: "If he asks anything, I'll just say we're having a quiet dinner.", translation: 'Si pregunta algo, solo diré que vamos a tener una cena tranquila.' },
          { speaker: 'Marcus', line: "Great plan. See you Saturday at six!", translation: '¡Gran plan! ¡Nos vemos el sábado a las seis!' }
        ],
        phrases: [
          "We're going to...",
          "I won't say a word.",
          "I'll bring...",
          "If he asks, I'll..."
        ],
        exercises: [
          { type: 'mcq', prompt: 'What time does Sarah ask Marcus to arrive?', options: ['Five o\'clock', 'Six o\'clock', 'Seven o\'clock', 'Eight o\'clock'], answer: 1 },
          { type: 'mcq', prompt: 'What does Marcus promise?', options: ['To arrive late', 'Not to say a word to Daniel', 'To bring a cake', 'To cancel his plans'], answer: 1 },
          { type: 'mcq', prompt: 'What does Marcus decide to bring?', options: ['A cake', 'Dessert', 'Music', 'Balloons'], answer: 2 },
          { type: 'mcq', prompt: 'Who is going to bring the cake?', options: ['Marcus', 'Lucy', "Sarah's parents", 'Sarah'], answer: 1 },
          { type: 'mcq', prompt: 'What are Sarah\'s parents going to bring?', options: ['A cake', 'Dessert', 'Balloons', 'Music'], answer: 1 },
          { type: 'mcq', prompt: 'When is Sarah going to buy balloons?', options: ['Tonight', 'Tomorrow morning', 'On Saturday', 'She already bought them'], answer: 1 },
          { type: 'mcq', prompt: 'What will Sarah say if Daniel gets suspicious?', options: ['That there is a party', 'That they are having a quiet dinner', 'That Marcus is coming', 'Nothing at all'], answer: 1 },
          { type: 'mcq', prompt: 'What is the main purpose of this call?', options: ['To cancel the party', 'To coordinate plans for the surprise party', 'To argue about the date', 'To plan a different event'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Talking About Plans and Celebrations',
        description: "Talk about plans for a celebration using 'going to' and spontaneous decisions with 'will'.",
        mission:
          "Talk about a celebration you are planning (or would like to plan) using going to, and practice making spontaneous offers or decisions using will.",
        phrases: [
          "I'm going to organize...",
          "Who's going to bring...?",
          "I'll help with...",
          "If it rains, we'll..."
        ],
        dialogue: [
          { speaker: 'You', line: "I'm going to organize a small party for my friend's birthday.", translation: 'Voy a organizar una pequeña fiesta para el cumpleaños de mi amigo.' },
          { speaker: 'Partner', line: "That sounds fun! What are you going to do?", translation: '¡Eso suena divertido! ¿Qué vas a hacer?' },
          { speaker: 'You', line: "I'm going to invite close friends and order some food. I'll bring the cake myself.", translation: 'Voy a invitar a amigos cercanos y pedir comida. Yo traeré el pastel.' },
          { speaker: 'Partner', line: "Need any help? I'll bring some music if you want.", translation: '¿Necesitas ayuda? Traeré música si quieres.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Talk about a celebration you are planning using going to (at least three sentences).', answer: 'Oral practice' },
          { type: 'speaking', prompt: 'Now practice making two spontaneous offers or decisions using will (e.g. "I\'ll bring...", "I\'ll help with...").', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the party-planning dialogue with a partner, then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'A Celebration I Am Planning',
        description: 'Write about plans for an upcoming celebration.',
        mission:
          "Write 80-130 words about a celebration you are planning (real or imaginary), using going to for plans and will for at least one spontaneous decision or offer.",
        phrases: [
          "I'm going to celebrate...",
          "We're going to invite...",
          "I'll... / If..., we'll...",
          "It's going to be..."
        ],
        dialogue: [
          {
            speaker: 'Model',
            line:
              "Next month, I'm going to celebrate my sister's graduation. We're going to have a small party at home, with close family and friends. My mum is going to cook her special lasagne, and I'm going to make a cake for the first time. If the weather is nice, we'll have the party in the garden; if not, we'll stay inside. I'll also prepare a short speech to celebrate her achievement. It's going to be a simple celebration, but I know it will be really special.",
            translation:
              'El próximo mes voy a celebrar la graduación de mi hermana. Vamos a hacer una pequeña fiesta en casa, con familia cercana y amigos. Mi mamá va a cocinar su lasaña especial, y yo voy a hacer un pastel por primera vez. Si hace buen clima, haremos la fiesta en el jardín; si no, nos quedaremos adentro. También prepararé un pequeño discurso para celebrar su logro. Va a ser una celebración sencilla, pero sé que será muy especial.'
          }
        ],
        exercises: [
          {
            type: 'writing',
            prompt:
              "Write 80-130 words about a celebration you are planning, using going to for plans and will at least once for a spontaneous decision or offer.",
            answer: 'Open answer'
          }
        ]
      }),
      grammar: activity('grammar', {
        title: "Going to (Plans) and Will (Spontaneous Decisions/Predictions)",
        description: 'Talk about plans already decided and spontaneous decisions or predictions.',
        grammarNote:
          "Use going to for plans and intentions decided before the moment of speaking: \"I'm going to invite everyone this week\" (already decided). Use will for decisions made at the moment of speaking, offers, and promises: \"I'll bring a cake!\" (deciding right now).\n\n" +
          "Will is also used for predictions, often with think/probably: \"I think it will rain.\" Going to is used for predictions based on evidence you can see now: \"Look at those clouds - it's going to rain.\"\n\n" +
          "Apoyo: usa going to para planes ya decididos; usa will para decisiones espontáneas, ofrecimientos, promesas y predicciones generales.",
        phrases: [
          "I'm going to... (plan)",
          "I'll... (spontaneous decision)",
          "I think it will...",
          "It's going to... (evidence)"
        ],
        exercises: [
          { type: 'mcq', prompt: "I've already decided - I ___ study medicine next year.", options: ['will', "am going to", 'am', 'do'], answer: 1 },
          { type: 'mcq', prompt: 'The phone is ringing - I ___ answer it!', options: ['am going to', "'ll", 'am', 'do'], answer: 1 },
          { type: 'mcq', prompt: 'Look at those clouds - it ___ rain soon.', options: ["'ll", "is going to", 'does', 'is'], answer: 1 },
          { type: 'mcq', prompt: "We ___ have a party next Saturday - it's all planned.", options: ["'ll", "are going to", 'are', 'do'], answer: 1 },
          { type: 'mcq', prompt: "I don't know what to bring... I ___ bring a salad!", options: ["'ll", "am going to", 'am', 'do'], answer: 0 },
          { type: 'mcq', prompt: 'I think our team ___ win the match tomorrow.', options: ["is going to", "'ll", 'does', 'is'], answer: 1 },
          { type: 'mcq', prompt: 'She ___ study abroad next year - the plan is already made.', options: ['will', "is going to", 'is', 'does'], answer: 1 },
          { type: 'mcq', prompt: "That box looks heavy - I ___ help you with it.", options: ["'ll", "am going to", 'am', 'do'], answer: 0 },
          { type: 'mcq', prompt: '___ you come to the party on Saturday?', options: ['Will', 'Do', 'Are', 'Have'], answer: 0 },
          { type: 'mcq', prompt: "We've already booked the cake, so we ___ have chocolate flavour.", options: ['will', "are going to", 'do', 'have'], answer: 1 },
          { type: 'mcq', prompt: "A: \"We need more chairs.\" B: \"OK, I ___ bring some from my house.\"", options: ["'ll", "am going to", 'am', 'do'], answer: 0 },
          { type: 'mcq', prompt: 'I promise I ___ never tell your secret.', options: ["'ll", "am going to", 'am', 'do'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Celebrations and Party Planning',
        description: 'Key words for celebrations, invitations, and organizing an event.',
        vocabulary: [
          { word: 'surprise party', translation: 'fiesta sorpresa', definition: 'A party organized secretly for someone who does not know about it.', example: 'Sarah organized a surprise party for Daniel.', partOfSpeech: 'noun phrase' },
          { word: 'invitation', translation: 'invitación', definition: 'A written or spoken request for someone to attend an event.', example: 'She sent invitations to all their friends.', partOfSpeech: 'noun' },
          { word: 'guest', translation: 'invitado/a', definition: 'A person invited to an event.', example: 'A dozen guests arrived with presents.', partOfSpeech: 'noun' },
          { word: 'decoration', translation: 'decoración', definition: 'Objects used to make a place look attractive for an event.', example: 'Balloons were the main decoration.', partOfSpeech: 'noun' },
          { word: 'venue', translation: 'lugar/sede (del evento)', definition: 'The place where an event happens.', example: "Sarah's flat was the venue for the party.", partOfSpeech: 'noun' },
          { word: 'organize', translation: 'organizar', definition: 'To plan and arrange an event.', example: 'Sarah organized the whole surprise alone.', partOfSpeech: 'verb' },
          { word: 'celebrate', translation: 'celebrar', definition: 'To do something enjoyable for a special occasion.', example: 'They celebrated with cake and music.', partOfSpeech: 'verb' },
          { word: 'gathering', translation: 'reunión', definition: 'A meeting of people, often for a social occasion.', example: 'The birthday gathering had about fifteen people.', partOfSpeech: 'noun' },
          { word: 'keep a secret', translation: 'guardar un secreto', definition: 'To not tell anyone information you know.', example: 'Marcus promised to keep the secret.', partOfSpeech: 'phrase' },
          { word: 'suspicious', translation: 'sospechoso/receloso', definition: 'Feeling that something is not quite right or normal.', example: 'Daniel seemed a little suspicious that morning.', partOfSpeech: 'adjective' },
          { word: 'shocked', translation: 'sorprendido/en shock', definition: 'Feeling very surprised, often because of something unexpected.', example: 'Daniel was completely shocked by the surprise.', partOfSpeech: 'adjective' },
          { word: 'present / gift', translation: 'regalo', definition: 'Something given to someone, often for a special occasion.', example: 'Friends arrived with presents and balloons.', partOfSpeech: 'noun' },
          { word: 'trifle', translation: 'postre en capas (tipo trifle)', definition: 'A British dessert made of layers of cake, fruit, custard, and cream.', example: "Sarah's mum made her famous trifle.", partOfSpeech: 'noun' },
          { word: 'candles (on a cake)', translation: 'velas (del pastel)', definition: 'Small wax sticks placed on a birthday cake and lit.', example: 'They put candles on the cake before singing.', partOfSpeech: 'noun' },
          { word: 'toast (a toast)', translation: 'brindis', definition: 'A short speech and drink to celebrate someone or something.', example: 'Everyone raised their glasses for a toast.', partOfSpeech: 'noun' },
          { word: 'get someone back', translation: 'desquitarse/vengarse (en broma)', definition: 'To do something similar to someone in return, often as a joke.', example: 'Daniel promised to get everyone back one day.', partOfSpeech: 'phrasal verb' },
          { word: 'RSVP', translation: 'confirmar asistencia', definition: 'To reply to an invitation to say if you are coming.', example: 'Please RSVP by Thursday.', partOfSpeech: 'verb/abbreviation' },
          { word: 'playlist', translation: 'lista de reproducción', definition: 'A collection of songs chosen to play in order.', example: 'Marcus brought a great playlist for the party.', partOfSpeech: 'noun' },
          { word: 'anniversary', translation: 'aniversario', definition: 'The date on which something special happened in a previous year.', example: 'They celebrated their first anniversary quietly at home.', partOfSpeech: 'noun' },
          { word: 'milestone', translation: 'hito/momento importante', definition: 'An important event or stage in someone\'s life.', example: 'Turning thirty felt like a big milestone for Daniel.', partOfSpeech: 'noun' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What is a "surprise party"?', options: ['A party the guest of honour plans themselves', 'A party organized secretly for someone', 'A party with no guests', 'A very small celebration'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "a place where an event happens"?', options: ['Guest', 'Venue', 'Invitation', 'Toast'], answer: 1 },
          { type: 'mcq', prompt: 'Which word describes feeling "very surprised"?', options: ['Suspicious', 'Shocked', 'Organized', 'Invited'], answer: 1 },
          { type: 'mcq', prompt: 'What does "keep a secret" mean?', options: ['To tell everyone something', 'To not tell anyone information you know', 'To forget something', 'To celebrate an event'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "an important event or stage in someone\'s life"?', options: ['Milestone', 'Playlist', 'Gathering', 'Toast'], answer: 0 },
          { type: 'mcq', prompt: 'What do you do at a "toast"?', options: ['Eat bread', 'Give a short speech and raise a drink', 'Decorate a room', 'Send invitations'], answer: 1 },
          { type: 'mcq', prompt: 'What does "RSVP" mean?', options: ['To decorate a room', 'To reply to an invitation', 'To cancel a party', 'To bring a gift'], answer: 1 },
          { type: 'mcq', prompt: 'Which word describes objects used to make a place look attractive for an event?', options: ['Decorations', 'Guests', 'Invitations', 'Toasts'], answer: 0 },
          { type: 'mcq', prompt: 'What does "get someone back" mean here?', options: ['To return a present', 'To do something similar in return, as a joke', 'To apologize to someone', 'To leave a party early'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "a meeting of people for a social occasion"?', options: ['Gathering', 'Venue', 'Candle', 'Anniversary'], answer: 0 },
          { type: 'mcq', prompt: 'What is a "trifle"?', options: ['A type of invitation', 'A British layered dessert', 'A birthday song', 'A type of decoration'], answer: 1 },
          { type: 'mcq', prompt: 'Which word describes the date something special happened in a previous year?', options: ['Milestone', 'Anniversary', 'Playlist', 'Gathering'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'school-and-work',
    title: 'School and Work',
    titleEs: 'La escuela y el trabajo',
    description: 'Sarah leads her first big project at work and earns a well-deserved promotion.',
    order: 9,
    accessTier: 'premium',
    unitOverview: {
      objective: 'Hablar de habilidades y capacidades en el trabajo o los estudios usando can, could y be able to.',
      outcomes: [
        'hablar de habilidades presentes con can y be able to',
        'hablar de habilidades pasadas con could y was/were able to',
        'describir un proyecto de trabajo o estudio',
        'entender un texto sobre un ascenso laboral'
      ],
      grammar: ['Can / could / be able to (ability)'],
      vocabulary: ['work and skills', 'projects', 'workplace language'],
      scenario: 'A Sarah le ofrecen liderar un proyecto importante en su trabajo, y demuestra que puede con el reto.'
    },
    activities: {
      reading: activity('reading', {
        title: 'A New Project at Work',
        description: 'Sarah is asked to lead a new project at her design company and proves she can handle it.',
        reading: {
          title: 'A New Project at Work',
          illustration: {
            src: '/assets/readings/english/a2/unit-09-new-project.webp',
            alt: 'Sarah presenting a design project to her team at the office',
            animation: 'subtle-float'
          },
          text:
            "On Monday morning, Sarah's boss, Helen, calls her into the office. \"I've got some good news,\" Helen says. \"We want you to lead the new website project for our client in Leeds.\"\n\n" +
            'Sarah is surprised. She has worked at the company for three years, but she has never led a project before. "Are you sure I can handle it?" she asks. "Absolutely," Helen says. "You can design better than anyone on the team, and you\'re able to explain your ideas clearly to clients. That\'s exactly what we need."\n\n' +
            'The project is important: a new website for a growing restaurant chain. Sarah will need to manage two other designers, Tom and Priya, and meet the client every two weeks. "Can I choose my own team?" Sarah asks. "Yes, you can," Helen replies. "Tom and Priya have already agreed to work with you."\n\n' +
            'That afternoon, Sarah meets Tom and Priya to plan the project. "I can\'t promise it will be easy," she tells them honestly, "but I know we can create something amazing together." Priya smiles. "I\'ve always been able to work well under pressure, so don\'t worry about me." Tom laughs. "And I can definitely handle the technical side."\n\n' +
            'Over the next few weeks, the team works hard. Sarah discovers that she is able to manage people better than she expected. She can listen to different opinions, and she is able to make quick decisions when problems appear. When Tom struggles with a technical issue, Sarah can\'t fix it herself, but she knows exactly who to ask for help.\n\n' +
            'The client, a friendly woman called Grace, is impressed with their progress. "You were able to understand exactly what we wanted," Grace tells Sarah after the second meeting. "Not every team can do that."\n\n' +
            'After six weeks, the project is finished, and everyone is proud of the result. Helen calls Sarah into her office again. "You did an excellent job," she says. "You couldn\'t have done this a year ago, but now you clearly can lead a team. We\'d like to offer you a permanent position as senior designer."\n\n' +
            '"I got a promotion!" she says, unable to stop smiling, when she calls Daniel with the news. "I always knew you could do it," Daniel replies. "Now, can we celebrate with dinner tonight?" Sarah laughs. "Of course we can."',
          questions: [
            '¿Qué habilidades tienes que te ayudan en el trabajo o los estudios? Usa can/be able to.',
            '¿Hay algo que antes no podías hacer y ahora sí puedes? Descríbelo con could/can.'
          ]
        },
        exercises: [
          { type: 'mcq', prompt: 'What is the reading mainly about?', options: ["Sarah looking for a new job", "Sarah leading a new project and earning a promotion", 'A problem with a client', 'Helen leaving the company'], answer: 1 },
          { type: 'mcq', prompt: 'What is the new project about?', options: ['A mobile app', 'A website for a restaurant chain', 'A marketing campaign', 'A new office design'], answer: 1 },
          { type: 'mcq', prompt: 'Who does Sarah work with on the project?', options: ['Helen and Grace', 'Tom and Priya', 'Marcus and Jake', 'Lucy and Daniel'], answer: 1 },
          { type: 'mcq', prompt: 'What skill does Priya mention she has?', options: ['Speaking many languages', 'Working well under pressure', 'Cooking well', 'Managing money'], answer: 1 },
          { type: 'mcq', prompt: 'In "the client is impressed with their progress," what does impressed mean?', options: ['Confused', 'Having a positive opinion or admiration', 'Angry', 'Bored'], answer: 1 },
          { type: 'mcq', prompt: 'What does the client Grace say about the team?', options: ['They were too slow', 'They were able to understand exactly what she wanted', 'They needed more meetings', 'They made too many mistakes'], answer: 1 },
          { type: 'mcq', prompt: 'What can you infer about how Helen feels about Sarah?', options: ['Disappointed', 'Proud and confident in her abilities', 'Indifferent', 'Worried'], answer: 1 },
          { type: 'mcq', prompt: 'What does Sarah get at the end of the reading?', options: ['A holiday', 'A promotion to senior designer', 'A new client', 'A pay cut'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: "Helen's Offer",
        description: "Listen to the conversation between Sarah and Helen when she is offered the new project.",
        intro: "Listen to Helen offering Sarah the new project. Focus on can, could, and be able to.",
        dialogue: [
          { speaker: 'Helen', line: "Sarah, we want you to lead the new website project.", translation: 'Sarah, queremos que lideres el nuevo proyecto de la página web.' },
          { speaker: 'Sarah', line: "Me? Are you sure I can handle it?", translation: '¿Yo? ¿Estás segura de que puedo manejarlo?' },
          { speaker: 'Helen', line: "Absolutely. You can design better than anyone on the team.", translation: 'Absolutamente. Puedes diseñar mejor que cualquiera del equipo.' },
          { speaker: 'Sarah', line: "Can I choose my own team for the project?", translation: '¿Puedo elegir mi propio equipo para el proyecto?' },
          { speaker: 'Helen', line: "Yes, you can. Tom and Priya have already agreed to help.", translation: 'Sí, puedes. Tom y Priya ya aceptaron ayudar.' },
          { speaker: 'Sarah', line: "Great. I know we can create something really good together.", translation: 'Genial. Sé que podemos crear algo muy bueno juntos.' },
          { speaker: 'Helen', line: "I know you couldn't lead a project a year ago, but now you clearly can.", translation: 'Sé que no podías liderar un proyecto hace un año, pero ahora claramente puedes.' },
          { speaker: 'Sarah', line: "Thank you, Helen. That really means a lot.", translation: 'Gracias, Helen. Eso significa mucho para mí.' },
          { speaker: 'Helen', line: "You've earned it. When can you start?", translation: 'Te lo has ganado. ¿Cuándo puedes empezar?' },
          { speaker: 'Sarah', line: "I can start right away!", translation: '¡Puedo empezar de inmediato!' }
        ],
        phrases: [
          'Can I...?',
          'You can...',
          "I know we can...",
          "I couldn't... but now I can."
        ],
        exercises: [
          { type: 'mcq', prompt: 'What does Helen ask Sarah to do?', options: ['Take a holiday', 'Lead the new website project', 'Change departments', 'Train a new employee'], answer: 1 },
          { type: 'mcq', prompt: 'Why does Helen think Sarah can handle the project?', options: ['She has more free time', 'She can design better than anyone on the team', 'She has worked there the longest', 'She asked for it'], answer: 1 },
          { type: 'mcq', prompt: 'What does Sarah ask about her team?', options: ['If she can work alone', 'If she can choose her own team', 'If she can change the deadline', 'If she can work from home'], answer: 1 },
          { type: 'mcq', prompt: 'Who has already agreed to help Sarah?', options: ['Marcus and Jake', 'Tom and Priya', 'Lucy and Daniel', 'Grace and Helen'], answer: 1 },
          { type: 'mcq', prompt: 'What does Helen say about a year ago?', options: ['Sarah couldn\'t lead a project then, but now she can', 'Sarah worked somewhere else', 'The company was much smaller', 'Sarah wanted to quit'], answer: 0 },
          { type: 'mcq', prompt: 'How does Sarah react to Helen\'s comment?', options: ['She feels offended', 'She is grateful - it means a lot to her', 'She disagrees completely', 'She changes the subject'], answer: 1 },
          { type: 'mcq', prompt: 'When can Sarah start the project?', options: ['Next month', 'Right away', 'In a year', 'She is not sure yet'], answer: 1 },
          { type: 'mcq', prompt: 'What is the main purpose of this conversation?', options: ['To fire Sarah', 'To offer Sarah a new project and show confidence in her', 'To discuss a client complaint', 'To plan a holiday'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Talking About Skills and Abilities',
        description: 'Talk about your skills and abilities, now and in the past, using can, could, and be able to.',
        mission:
          "Talk about three things you can do well now (for school or work), and one thing you couldn't do a few years ago but can do now.",
        phrases: [
          "I can... / I'm able to...",
          "I couldn't... a few years ago.",
          "Now I can...",
          "I'm good at..."
        ],
        dialogue: [
          { speaker: 'You', line: "I can speak two languages, and I'm able to work well in a team.", translation: 'Puedo hablar dos idiomas, y soy capaz de trabajar bien en equipo.' },
          { speaker: 'Partner', line: "That's great! Could you always speak two languages?", translation: '¡Qué bien! ¿Siempre pudiste hablar dos idiomas?' },
          { speaker: 'You', line: "No, I couldn't speak English well a few years ago, but now I can!", translation: 'No, no podía hablar bien inglés hace unos años, ¡pero ahora sí puedo!' },
          { speaker: 'Partner', line: "That's a real achievement.", translation: 'Eso es un verdadero logro.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Talk about three things you can do well for school or work.', answer: 'Oral practice' },
          { type: 'speaking', prompt: "Now talk about one thing you couldn't do a few years ago but can do now.", answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the skills and abilities dialogue with a partner, then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'My Skills and Abilities',
        description: 'Write about your skills and abilities for school or work.',
        mission:
          "Write 80-130 words about your skills and abilities: what you can do well, what you couldn't do before but can now, and one skill you would like to develop.",
        phrases: [
          "I can... / I am able to...",
          "A few years ago, I couldn't...",
          "Now I can...",
          "I would like to be able to..."
        ],
        dialogue: [
          {
            speaker: 'Model',
            line:
              "I can organize my time well, and I am able to explain difficult ideas simply, which helps a lot at work. A few years ago, I couldn't speak in front of a group without feeling very nervous, but now I can give a presentation without a problem. I can also work well under pressure when there is a tight deadline. In the future, I would like to be able to manage a small team, like Sarah in the reading.",
            translation:
              'Puedo organizar bien mi tiempo, y soy capaz de explicar ideas difíciles de forma sencilla, lo cual ayuda mucho en el trabajo. Hace unos años, no podía hablar frente a un grupo sin sentirme muy nervioso, pero ahora puedo dar una presentación sin problema. También puedo trabajar bien bajo presión cuando hay una fecha límite ajustada. En el futuro, me gustaría poder liderar un pequeño equipo, como Sarah en la lectura.'
          }
        ],
        exercises: [
          {
            type: 'writing',
            prompt:
              "Write 80-130 words about your skills and abilities, using can/be able to and could at least twice each.",
            answer: 'Open answer'
          }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Can / Could / Be Able To (Ability)',
        description: 'Talk about present and past abilities.',
        grammarNote:
          "Use can for present ability: \"I can design websites.\" Use could for general ability in the past: \"She could speak French as a child.\" Use was/were able to especially for a specific achievement in the past (one occasion): \"She was able to finish the project on time.\"\n\n" +
          "Be able to is also used where can/could is not possible, like after another modal or in the future: \"I will be able to help tomorrow,\" \"I haven't been able to finish yet.\"\n\n" +
          "Apoyo: usa can para habilidad presente; usa could para habilidad general en el pasado; usa was/were able to especialmente para un logro específico en el pasado.",
        phrases: [
          "I can... (present ability)",
          "I could... (past general ability)",
          "I was able to... (specific past achievement)",
          "I will be able to..."
        ],
        exercises: [
          { type: 'mcq', prompt: 'She ___ speak three languages fluently.', options: ['can', 'could', 'is able', 'will'], answer: 0 },
          { type: 'mcq', prompt: 'When he was young, he ___ run very fast.', options: ['can', 'could', "is able to", 'will'], answer: 1 },
          { type: 'mcq', prompt: 'Despite the problems, we ___ finish the project on time.', options: ['could', 'were able to', 'can', 'will'], answer: 1 },
          { type: 'mcq', prompt: 'I ___ help you tomorrow if you need it.', options: ['can', 'could', "will be able to", 'am able'], answer: 2 },
          { type: 'mcq', prompt: '___ you drive when you were eighteen?', options: ['Can', 'Could', 'Are able to', 'Will'], answer: 1 },
          { type: 'mcq', prompt: 'I ___ finish the report - can you help me?', options: ["can't", "couldn't", "am not able", "wasn't able to"], answer: 0 },
          { type: 'mcq', prompt: 'After months of practice, she ___ finally able to give the presentation confidently.', options: ['is', 'was', 'can', 'could'], answer: 1 },
          { type: 'mcq', prompt: 'He ___ speak any English before he moved to the UK.', options: ["can't", "couldn't", "isn't able to", "wasn't able"], answer: 1 },
          { type: 'mcq', prompt: 'We hope we ___ able to travel next year.', options: ['will be', 'can be', 'could be', 'are'], answer: 0 },
          { type: 'mcq', prompt: 'Priya ___ work well under pressure - it\'s one of her strengths.', options: ['can', 'is able', 'could', 'was able'], answer: 0 },
          { type: 'mcq', prompt: 'I haven\'t ___ to finish the design yet.', options: ['can', 'could', 'been able', 'able'], answer: 2 },
          { type: 'mcq', prompt: 'Sarah ___ lead a team a year ago, but now she can.', options: ["couldn't", "can't", "wasn't able", 'is not able'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Work, Projects and Skills',
        description: 'Key words for talking about work, projects, and abilities.',
        vocabulary: [
          { word: 'promotion', translation: 'ascenso', definition: 'A move to a higher position at work.', example: 'Sarah got a promotion to senior designer.', partOfSpeech: 'noun' },
          { word: 'colleague', translation: 'colega/compañero de trabajo', definition: 'A person you work with.', example: 'Tom and Priya are her colleagues.', partOfSpeech: 'noun' },
          { word: 'deadline', translation: 'fecha límite', definition: 'The time by which something must be finished.', example: 'They met every deadline for the project.', partOfSpeech: 'noun' },
          { word: 'manage', translation: 'gestionar/dirigir', definition: 'To be responsible for organizing people or a project.', example: 'Sarah had to manage two designers.', partOfSpeech: 'verb' },
          { word: 'handle', translation: 'manejar (una situación)', definition: 'To deal successfully with a task or problem.', example: 'Helen was sure Sarah could handle the project.', partOfSpeech: 'verb' },
          { word: 'client', translation: 'cliente', definition: 'A person or company that pays for a service.', example: 'The client was impressed with the design.', partOfSpeech: 'noun' },
          { word: 'skill', translation: 'habilidad', definition: 'The ability to do something well, usually learned.', example: 'Explaining ideas clearly is an important skill.', partOfSpeech: 'noun' },
          { word: 'strength', translation: 'fortaleza', definition: 'Something a person does particularly well.', example: 'Working under pressure is one of her strengths.', partOfSpeech: 'noun' },
          { word: 'under pressure', translation: 'bajo presión', definition: 'In a difficult or stressful situation, often with limited time.', example: 'Priya works well under pressure.', partOfSpeech: 'adjective phrase' },
          { word: 'confident', translation: 'seguro/a de sí mismo/a', definition: 'Feeling sure about your own abilities.', example: 'Sarah felt more confident after the project.', partOfSpeech: 'adjective' },
          { word: 'position', translation: 'puesto (de trabajo)', definition: 'A job or role in a company.', example: 'She was offered a permanent position.', partOfSpeech: 'noun' },
          { word: 'permanent', translation: 'permanente/fijo', definition: 'Lasting for a long time or forever, not temporary.', example: 'The company offered her a permanent contract.', partOfSpeech: 'adjective' },
          { word: 'lead (a team/project)', translation: 'liderar (un equipo/proyecto)', definition: 'To be in charge of a group or task.', example: 'Sarah led the project successfully.', partOfSpeech: 'verb' },
          { word: 'progress', translation: 'progreso/avance', definition: 'Development towards a goal.', example: 'The client was impressed with their progress.', partOfSpeech: 'noun' },
          { word: 'experience', translation: 'experiencia', definition: 'Knowledge or skill gained from doing something over time.', example: 'She had three years of experience at the company.', partOfSpeech: 'noun' },
          { word: 'achievement', translation: 'logro', definition: 'Something successfully accomplished, usually with effort.', example: 'The promotion was a big achievement for Sarah.', partOfSpeech: 'noun' },
          { word: 'opportunity', translation: 'oportunidad', definition: 'A chance to do something good.', example: 'This project was a great opportunity for Sarah.', partOfSpeech: 'noun' },
          { word: 'struggle (with)', translation: 'tener dificultades (con)', definition: 'To find something difficult to do.', example: 'Tom struggled with a technical issue.', partOfSpeech: 'verb' },
          { word: 'reliable', translation: 'confiable', definition: 'Able to be trusted to do something well.', example: 'Sarah is known as a reliable colleague.', partOfSpeech: 'adjective' },
          { word: 'earn (a promotion)', translation: 'ganarse (un ascenso)', definition: 'To get something because you deserve it through hard work.', example: 'Sarah earned her promotion through hard work.', partOfSpeech: 'verb' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What is a "promotion"?', options: ['A type of project', 'A move to a higher position at work', 'A meeting with a client', 'A work deadline'], answer: 1 },
          { type: 'mcq', prompt: 'Who is a "colleague"?', options: ['A person you work with', 'A company client', 'A family member', 'A boss only'], answer: 0 },
          { type: 'mcq', prompt: 'Which word means "to deal successfully with a task or problem"?', options: ['Manage', 'Handle', 'Struggle', 'Earn'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "something a person does particularly well"?', options: ['Deadline', 'Strength', 'Position', 'Client'], answer: 1 },
          { type: 'mcq', prompt: 'What does "under pressure" mean?', options: ['Very relaxed', 'In a difficult, stressful situation', 'On holiday', 'Working alone'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "lasting a long time, not temporary"?', options: ['Permanent', 'Confident', 'Reliable', 'Skilled'], answer: 0 },
          { type: 'mcq', prompt: 'Which word means "to find something difficult to do"?', options: ['Manage', 'Struggle', 'Handle', 'Lead'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "something successfully accomplished"?', options: ['Deadline', 'Achievement', 'Client', 'Position'], answer: 1 },
          { type: 'mcq', prompt: 'What is a "client"?', options: ['A colleague', 'A person or company that pays for a service', 'A boss', 'A type of skill'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "able to be trusted to do something well"?', options: ['Reliable', 'Confident', 'Permanent', 'Skilled'], answer: 0 },
          { type: 'mcq', prompt: 'What does "lead a team" mean?', options: ['To join a team', 'To be in charge of a team', 'To leave a team', 'To criticize a team'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "to get something because you deserve it"?', options: ['Struggle', 'Earn', 'Handle', 'Manage'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'stories-and-achievements',
    title: 'Stories and Achievements',
    titleEs: 'Historias y logros',
    description: "On New Year's Eve, Sarah and Daniel look back on everything they have achieved together this year.",
    order: 10,
    accessTier: 'premium',
    unitOverview: {
      objective: 'Hablar de experiencias y logros de vida usando el Present Perfect.',
      outcomes: [
        'hablar de experiencias de vida con el Present Perfect',
        "usar ever, never, just y already correctamente",
        'reflexionar sobre logros personales',
        'entender una conversación de fin de año sobre logros'
      ],
      grammar: ['Present Perfect (life experiences: ever, never, just, already)'],
      vocabulary: ['life experiences', 'achievements', 'reflecting on the past'],
      scenario: 'En Nochevieja, Sarah y Daniel repasan todo lo que han vivido y logrado juntos a lo largo del año.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Looking Back on an Amazing Year',
        description: "On New Year's Eve, Sarah and Daniel reflect on everything they have achieved together this year.",
        reading: {
          title: 'Looking Back on an Amazing Year',
          illustration: {
            src: '/assets/readings/english/a2/unit-10-looking-back.webp',
            alt: "Sarah and Daniel sitting together on New Year's Eve, talking and smiling",
            animation: 'subtle-float'
          },
          text:
            'On New Year\'s Eve, Sarah sits on the sofa with Daniel, looking back on the year. "It\'s been an incredible year," she says. "I\'ve never had a year quite like this one."\n\n' +
            '"Let\'s make a list," Daniel suggests, smiling. "What have you achieved this year?" Sarah thinks for a moment. "Well, I\'ve met the most important person in my life," she says, looking at Daniel. "That\'s definitely at the top of the list."\n\n' +
            '"I\'ve introduced you to my whole family," she continues, "and you\'ve survived Jake\'s football skills and my mum\'s endless questions." Daniel laughs. "I\'ve never met a family quite like yours - in the best way."\n\n' +
            'Sarah keeps thinking. "I\'ve learned to cook a proper Italian dinner," she says proudly. "I hadn\'t cooked pasta from scratch before this year." Daniel nods. "And it\'s become one of my favourite meals."\n\n' +
            '"We\'ve also travelled together for the first time," Sarah adds. "We\'ve visited Edinburgh, we\'ve compared hotels, and we\'ve walked around that whole city together." Daniel smiles. "I\'ve never planned a trip so carefully in my life - you\'ve turned me into an organised traveller."\n\n' +
            '"I\'ve also had a health scare," Sarah says, "well, just a cold, but it changed things. I\'ve started walking more, and I haven\'t skipped breakfast since then." Daniel adds, "You\'ve definitely become healthier this year - I\'ve noticed."\n\n' +
            '"And at work," Sarah continues, "I\'ve led my first big project, and I\'ve just been promoted to senior designer." Daniel raises his glass. "You\'ve worked so hard for that. I\'m really proud of you."\n\n' +
            '"Have you achieved anything this year, Daniel?" Sarah asks. "I\'ve become a better cook, thanks to you," he laughs, "and I\'ve finally learned to enjoy surprise parties, even if they still shock me a little." Sarah laughs at the memory of his face at the party.\n\n' +
            '"I\'ve never felt so lucky," Sarah says quietly. "This year has given me so much - you, new experiences, and a healthier, happier life." Daniel takes her hand. "We\'ve achieved a lot together, and I think next year will be even better."\n\n' +
            'Just before midnight, Sarah looks at Daniel. "Have you ever thought about what comes next for us?" she asks. Daniel smiles mysteriously. "I have," he says, "but you\'ll have to wait and see." Sarah raises an eyebrow, curious, as the clock finally strikes midnight.',
          questions: [
            '¿Qué has logrado tú este año? Escribe tres frases usando el Present Perfect.',
            '¿Hay algo que nunca has hecho pero te gustaría hacer? Usa never.'
          ]
        },
        exercises: [
          { type: 'mcq', prompt: 'What is the reading mainly about?', options: ['Sarah and Daniel planning next year', 'Sarah and Daniel reflecting on what they have achieved this year', 'A New Year\'s Eve party going wrong', 'Daniel leaving for a new job'], answer: 1 },
          { type: 'mcq', prompt: 'What does Sarah say is at the top of her list?', options: ['Getting a promotion', 'Meeting Daniel', 'Travelling to Edinburgh', 'Learning to cook'], answer: 1 },
          { type: 'mcq', prompt: 'What has Sarah learned to cook this year?', options: ['A full roast dinner', 'A proper Italian pasta dinner', 'A birthday cake', 'Traditional bread'], answer: 1 },
          { type: 'mcq', prompt: 'What health habit has Sarah kept up?', options: ['Going to the gym daily', 'Walking more and not skipping breakfast', 'Drinking more coffee', 'Sleeping less'], answer: 1 },
          { type: 'mcq', prompt: 'In "you\'ve turned me into an organised traveller," what does "turned into" mean?', options: ['Caused someone to become something', 'Travelled somewhere', 'Argued with someone', 'Forgot something'], answer: 0 },
          { type: 'mcq', prompt: 'What has Sarah achieved at work this year?', options: ['She started a new job', 'She led her first big project and got promoted', 'She lost her job', 'She changed careers completely'], answer: 1 },
          { type: 'mcq', prompt: 'What can you infer from Daniel\'s mysterious answer at the end?', options: ['He is planning something significant for their future', 'He wants to end the relationship', 'He is moving away', 'He forgot the question'], answer: 0 },
          { type: 'mcq', prompt: 'What does Daniel say about next year?', options: ['It will be worse', 'It will probably be even better', 'It will be exactly the same', 'He does not want to think about it'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: "Lucy's New Year Call",
        description: "Listen to Sarah and Lucy's phone call on New Year's Eve, reflecting on the year's achievements.",
        intro: "Listen to Sarah and Lucy's New Year phone call. Focus on the Present Perfect and words like ever, never, just, and already.",
        dialogue: [
          { speaker: 'Lucy', line: "Happy almost New Year! Have you thought about your achievements this year?", translation: '¡Casi feliz año nuevo! ¿Has pensado en tus logros de este año?' },
          { speaker: 'Sarah', line: "Yes, actually. I've just made a list with Daniel.", translation: 'Sí, de hecho. Acabo de hacer una lista con Daniel.' },
          { speaker: 'Lucy', line: "What's on it?", translation: '¿Qué hay en ella?' },
          { speaker: 'Sarah', line: "Well, I've met Daniel, obviously, and I've learned to cook properly.", translation: 'Bueno, conocí a Daniel, obviamente, y aprendí a cocinar de verdad.' },
          { speaker: 'Lucy', line: "Have you already told him about your promotion?", translation: '¿Ya le contaste sobre tu ascenso?' },
          { speaker: 'Sarah', line: "Yes, he already knows. He's really proud of me.", translation: 'Sí, ya lo sabe. Está muy orgulloso de mí.' },
          { speaker: 'Lucy', line: "Have you ever felt this happy before?", translation: '¿Alguna vez te has sentido tan feliz antes?' },
          { speaker: 'Sarah', line: "Honestly, never. This has been an incredible year.", translation: 'Honestamente, nunca. Este ha sido un año increíble.' },
          { speaker: 'Lucy', line: "I'm so happy for you. What about next year?", translation: 'Estoy muy feliz por ti. ¿Y el próximo año?' },
          { speaker: 'Sarah', line: "I have a feeling it's going to be even better!", translation: '¡Tengo el presentimiento de que va a ser aún mejor!' }
        ],
        phrases: [
          "I've just...",
          'Have you ever...?',
          "Have you already...?",
          "I've never..."
        ],
        exercises: [
          { type: 'mcq', prompt: 'What has Sarah just done with Daniel?', options: ['Cooked dinner', 'Made a list of achievements', 'Planned a trip', 'Watched a film'], answer: 1 },
          { type: 'mcq', prompt: 'What does Sarah say she has learned to do this year?', options: ['Speak French', 'Cook properly', 'Drive a car', 'Play an instrument'], answer: 1 },
          { type: 'mcq', prompt: 'Has Sarah already told Daniel about the promotion?', options: ['No, not yet', 'Yes, he already knows', 'She is planning to tell him tomorrow', 'The call does not say'], answer: 1 },
          { type: 'mcq', prompt: 'How does Daniel feel about the promotion?', options: ['Jealous', 'Really proud of Sarah', 'Indifferent', 'Worried'], answer: 1 },
          { type: 'mcq', prompt: 'Has Sarah ever felt this happy before?', options: ['Yes, many times', 'No, never', 'She is not sure', 'Only once before'], answer: 1 },
          { type: 'mcq', prompt: 'How does Sarah describe this year?', options: ['Difficult', 'Incredible', 'Boring', 'Ordinary'], answer: 1 },
          { type: 'mcq', prompt: 'What does Sarah think about next year?', options: ['It will be worse', 'It will probably be even better', 'It will be the same', "She hasn't thought about it"], answer: 1 },
          { type: 'mcq', prompt: 'What is the main purpose of this call?', options: ['To argue about the past', 'To reflect on achievements and celebrate the new year', 'To plan a trip', 'To discuss a problem'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Talking About Achievements',
        description: 'Talk about your achievements and experiences using the Present Perfect.',
        mission:
          "Talk about three achievements or experiences from this year, using the Present Perfect and words like ever, never, just, or already.",
        phrases: [
          "I've achieved... / I've learned...",
          "I've never...",
          "I've just... / I've already...",
          "Have you ever...?"
        ],
        dialogue: [
          { speaker: 'You', line: "This year, I've learned a new skill and I've made some great new friends.", translation: 'Este año, aprendí una nueva habilidad e hice grandes nuevos amigos.' },
          { speaker: 'Partner', line: "That's wonderful! Have you ever felt this proud of yourself before?", translation: '¡Qué maravilla! ¿Alguna vez te has sentido tan orgulloso de ti mismo antes?' },
          { speaker: 'You', line: "Honestly, not like this. I've never worked so hard for something.", translation: 'Honestamente, no así. Nunca había trabajado tan duro por algo.' },
          { speaker: 'Partner', line: "That's a real achievement, like Sarah's promotion!", translation: '¡Eso es un verdadero logro, como el ascenso de Sarah!' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Talk about three achievements or experiences from this year, using the Present Perfect.', answer: 'Oral practice' },
          { type: 'speaking', prompt: 'Now ask a partner "Have you ever...?" about two different experiences.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Practice the achievements dialogue with a partner, then switch roles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'My Achievements This Year',
        description: 'Write a reflection on your achievements and experiences this year.',
        mission:
          "Write 80-130 words reflecting on this year: what you have achieved, one thing you have never done before, and how you feel looking back.",
        phrases: [
          "This year, I've...",
          "I've never... before.",
          "I've just / already...",
          "Looking back, I feel..."
        ],
        dialogue: [
          {
            speaker: 'Model',
            line:
              "This year, I've achieved more than I expected. I've started a new job, and I've made new friends there. I've never travelled alone before, but this year I finally did it, and it changed the way I see myself. I've also just finished a course I've wanted to do for years. Looking back, I feel proud and a little surprised at how much has changed. I think next year, I'll try to be even braver.",
            translation:
              'Este año, he logrado más de lo que esperaba. Empecé un nuevo trabajo, e hice nuevos amigos ahí. Nunca había viajado sola antes, pero este año finalmente lo hice, y cambió la forma en que me veo a mí misma. También acabo de terminar un curso que quería hacer desde hace años. Mirando atrás, me siento orgullosa y un poco sorprendida de cuánto ha cambiado. Creo que el próximo año, intentaré ser aún más valiente.'
          }
        ],
        exercises: [
          {
            type: 'writing',
            prompt:
              "Write 80-130 words reflecting on your achievements this year, using the Present Perfect and at least one of ever/never/just/already.",
            answer: 'Open answer'
          }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Present Perfect: Ever, Never, Just, Already',
        description: 'Talk about life experiences and recent actions using the Present Perfect.',
        grammarNote:
          "Use the Present Perfect (have/has + past participle) for life experiences without a specific time, or actions with a present result: \"I've visited Edinburgh,\" \"She has just arrived.\"\n\n" +
          "Use ever in questions (\"Have you ever been to Italy?\"), never for negative experience (\"I've never tried sushi\"), just for something that happened a very short time ago (\"I've just finished\"), and already for something completed sooner than expected (\"I've already eaten\").\n\n" +
          "Apoyo: usa el Present Perfect para experiencias de vida y acciones recientes; ever en preguntas, never para negar experiencia, just para algo reciente, already para algo completado antes de lo esperado.",
        phrases: [
          "I've / She's + past participle",
          "Have you ever...?",
          "I've never...",
          "I've just... / I've already..."
        ],
        exercises: [
          { type: 'mcq', prompt: '___ you ever visited Scotland?', options: ['Do', 'Have', 'Did', 'Are'], answer: 1 },
          { type: 'mcq', prompt: 'I ___ never eaten Ethiopian food before.', options: ['have', 'has', 'am', 'did'], answer: 0 },
          { type: 'mcq', prompt: 'She ___ just finished her project.', options: ['have', 'has', 'is', 'did'], answer: 1 },
          { type: 'mcq', prompt: "We ___ already had dinner, so we're not hungry.", options: ['have', 'has', 'are', 'did'], answer: 0 },
          { type: 'mcq', prompt: "I've ___ seen that film - I don't want to watch it again.", options: ['ever', 'never', 'already', 'just'], answer: 2 },
          { type: 'mcq', prompt: 'Have you ___ tried sushi?', options: ['ever', 'never', 'already', 'just'], answer: 0 },
          { type: 'mcq', prompt: "She's ___ arrived - give her a minute to settle in.", options: ['ever', 'never', 'already', 'just'], answer: 3 },
          { type: 'mcq', prompt: 'They ___ never been to Rome, but they want to go.', options: ['have', 'has', 'are', 'did'], answer: 0 },
          { type: 'mcq', prompt: 'I ___ finished the book - it was excellent.', options: ["'ve just", 'ever', 'never', 'do'], answer: 0 },
          { type: 'mcq', prompt: 'Has he ___ worked abroad?', options: ['already', 'ever', 'just', 'never'], answer: 1 },
          { type: 'mcq', prompt: "I haven't ___ been to Asia, but I'd love to go.", options: ['already', 'just', 'ever', 'yet'], answer: 2 },
          { type: 'mcq', prompt: 'We ___ finished the report early - it wasn\'t due until Friday.', options: ["'ve already", 'ever', 'never', 'do'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Life Experiences and Achievements',
        description: 'Key words for talking about achievements, life experiences, and reflecting on the past.',
        vocabulary: [
          { word: 'achievement', translation: 'logro', definition: 'Something successfully accomplished, usually with effort.', example: 'Getting the promotion was a big achievement.', partOfSpeech: 'noun' },
          { word: 'experience', translation: 'experiencia', definition: 'Something that happens to you that you learn from.', example: 'Travelling together was a new experience for them.', partOfSpeech: 'noun' },
          { word: 'look back (on)', translation: 'mirar atrás/recordar', definition: 'To think about something from the past.', example: 'They looked back on the whole year together.', partOfSpeech: 'phrasal verb' },
          { word: 'proud (of)', translation: 'orgulloso/a (de)', definition: 'Feeling pleased about an achievement or someone\'s success.', example: "Daniel is really proud of Sarah's promotion.", partOfSpeech: 'adjective' },
          { word: 'grateful', translation: 'agradecido/a', definition: 'Feeling thankful for something.', example: 'Sarah feels grateful for everything this year.', partOfSpeech: 'adjective' },
          { word: 'incredible', translation: 'increíble', definition: 'Extremely good, impressive, or hard to believe.', example: "It's been an incredible year for both of them.", partOfSpeech: 'adjective' },
          { word: 'from scratch', translation: 'desde cero', definition: 'Starting with basic ingredients or materials, without shortcuts.', example: 'She learned to cook pasta from scratch.', partOfSpeech: 'adverb phrase' },
          { word: 'lucky', translation: 'afortunado/a', definition: 'Having good things happen by chance.', example: "Sarah feels lucky to have met Daniel.", partOfSpeech: 'adjective' },
          { word: 'reflect (on)', translation: 'reflexionar (sobre)', definition: 'To think carefully about something, often from the past.', example: 'They reflected on everything they had done that year.', partOfSpeech: 'verb' },
          { word: 'goal', translation: 'meta/objetivo', definition: 'Something you want to achieve.', example: 'Getting fit was one of her goals this year.', partOfSpeech: 'noun' },
          { word: 'growth', translation: 'crecimiento (personal)', definition: 'The process of developing or improving.', example: "Sarah's personal growth this year has been huge.", partOfSpeech: 'noun' },
          { word: 'milestone', translation: 'hito', definition: 'An important event or stage in someone\'s life.', example: 'The promotion was a real milestone for Sarah.', partOfSpeech: 'noun' },
          { word: 'unforgettable', translation: 'inolvidable', definition: 'So special that you will always remember it.', example: 'It has been an unforgettable year.', partOfSpeech: 'adjective' },
          { word: 'surprise (someone)', translation: 'sorprender (a alguien)', definition: 'To make someone feel astonished, often with something unexpected.', example: 'Daniel wants to surprise Sarah with his own plans.', partOfSpeech: 'verb' },
          { word: 'mysterious', translation: 'misterioso/a', definition: 'Difficult to understand or explain; keeping something secret.', example: 'Daniel gave a mysterious answer about the future.', partOfSpeech: 'adjective' },
          { word: 'turn out (well)', translation: 'resultar (bien)', definition: 'To happen or develop in a particular way.', example: 'Their trip turned out even better than expected.', partOfSpeech: 'phrasal verb' },
          { word: 'come a long way', translation: 'haber avanzado mucho', definition: 'To have improved or progressed a lot.', example: "Sarah has come a long way since last year.", partOfSpeech: 'phrase' },
          { word: 'value (something)', translation: 'valorar (algo)', definition: 'To think that something is important.', example: 'She has learned to value small moments.', partOfSpeech: 'verb' },
          { word: 'meaningful', translation: 'significativo/a', definition: 'Having real importance or value.', example: 'This year has been really meaningful for them both.', partOfSpeech: 'adjective' },
          { word: 'looking forward to', translation: 'con ganas de/esperando con ilusión', definition: 'Feeling excited about something that will happen.', example: "Sarah is looking forward to next year.", partOfSpeech: 'phrase' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'What is an "achievement"?', options: ['A problem', 'Something successfully accomplished', 'A daily routine', 'A type of holiday'], answer: 1 },
          { type: 'mcq', prompt: 'Which phrase means "to think about something from the past"?', options: ['Look back on', 'Turn out well', 'Come a long way', 'Surprise someone'], answer: 0 },
          { type: 'mcq', prompt: 'Which word means "extremely good or hard to believe"?', options: ['Mysterious', 'Incredible', 'Grateful', 'Meaningful'], answer: 1 },
          { type: 'mcq', prompt: 'What does "from scratch" mean?', options: ['Using a recipe book', 'Starting with basic ingredients, no shortcuts', 'Buying something ready-made', 'Asking for help'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "feeling thankful for something"?', options: ['Lucky', 'Grateful', 'Proud', 'Mysterious'], answer: 1 },
          { type: 'mcq', prompt: 'Which phrase means "to have improved or progressed a lot"?', options: ['Turn out well', 'Come a long way', 'Look back on', 'Reflect on'], answer: 1 },
          { type: 'mcq', prompt: 'What is a "milestone"?', options: ['A type of holiday', 'An important event or stage in life', 'A daily habit', 'A small mistake'], answer: 1 },
          { type: 'mcq', prompt: 'Which word describes something so special you will always remember it?', options: ['Unforgettable', 'Mysterious', 'Lucky', 'Grateful'], answer: 0 },
          { type: 'mcq', prompt: 'What does "reflect on" mean?', options: ['To ignore something', 'To think carefully about something', 'To argue about something', 'To forget something'], answer: 1 },
          { type: 'mcq', prompt: 'Which phrase means "feeling excited about something in the future"?', options: ['Looking forward to', 'Looking back on', 'Turning out well', 'Coming a long way'], answer: 0 },
          { type: 'mcq', prompt: 'What is a "goal"?', options: ['A type of achievement', 'Something you want to achieve', 'A past experience', 'A mysterious answer'], answer: 1 },
          { type: 'mcq', prompt: 'Which word means "having real importance or value"?', options: ['Meaningful', 'Mysterious', 'Lucky', 'Incredible'], answer: 0 }
        ]
      })
    }
  }
];

module.exports = {
  language: 'english',
  level: 'A2',
  courseTitle: 'English A2',
  courseDescription:
    'Everyday communication in English: routines, family, home, food, past experiences, travel, health, plans, work and personal stories, organized in 10 thematic units - all fully authored.',
  units
};
