// scripts/content/english-a2-units.js
// Hand-authored English A2 content - same architecture as
// scripts/content/english-a1-units.js (12-unit English A1), french-a1-units.js
// and spanish-a1-units.js: one module per language+level, consumed by
// scripts/build-english-a2-seed.js, which flattens it into
// lib/seed-lessons.json + lib/seed-units.json for
// scripts/migrate-english-a2-units.js to push into Supabase.
//
// Phase 1 of 10: only Unit 1 (Everyday Life) is fully authored here, as a
// complete reference pattern - the remaining 9 units (Family and
// Relationships, Home and Neighborhood, Food and Shopping, Past Experiences,
// Travel and Transportation, Health and Healthy Habits, Plans and
// Celebrations, School and Work, Stories and Achievements) are added the
// same way in follow-up passes, not stubbed out here.
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
  }
];

module.exports = {
  language: 'english',
  level: 'A2',
  courseTitle: 'English A2',
  courseDescription:
    'Everyday communication in English: routines, family, home, food, past experiences, travel, health, plans, work and personal stories, organized in 10 thematic units (Phase 1: Unit 1, Everyday Life, fully authored; units 2-10 in progress).',
  units
};
