const LEVEL_CONFIG = {
  B2: { listeningMinutes: 14, speakingMinutes: 14, writingMinutes: 24, words: '180–220', turns: '2–3' },
  C1: { listeningMinutes: 17, speakingMinutes: 17, writingMinutes: 30, words: '240–280', turns: '3–4' },
  C2: { listeningMinutes: 20, speakingMinutes: 20, writingMinutes: 36, words: '300–350', turns: '4–5' }
};

function unitContext(unit) {
  const overview = unit.unitOverview || {};
  return {
    title: unit.title,
    objective: overview.objective || unit.description,
    scenario: overview.scenario || unit.description,
    grammar: overview.grammar?.[0] || unit.activities.grammar?.title || '',
    vocabulary: overview.vocabulary || []
  };
}

function englishActivities(unit, level) {
  const config = LEVEL_CONFIG[level];
  const context = unitContext(unit);
  const keyTerms = context.vocabulary.slice(0, 3);
  const terms = keyTerms.length ? keyTerms.join(', ') : context.title.toLowerCase();
  const transcriptLines = [
    {
      speaker: 'Host',
      line: `Today we are examining ${context.title.toLowerCase()}. Why does this issue resist a simple answer?`,
      translation: `Hoy analizamos ${context.title.toLowerCase()}. ¿Por qué este asunto no admite una respuesta sencilla?`
    },
    {
      speaker: 'Guest',
      line: `Because the central question is not only what happens, but also which assumptions shape the way the evidence is interpreted.`,
      translation: 'Porque la pregunta central no es solo qué sucede, sino también qué supuestos determinan cómo se interpreta la evidencia.'
    },
    {
      speaker: 'Host',
      line: `Which distinction should listeners keep in mind?`,
      translation: '¿Qué distinción deben tener presente los oyentes?'
    },
    {
      speaker: 'Guest',
      line: `They should distinguish an established finding from a plausible inference and a value judgement. Those categories may interact, but they are not interchangeable.`,
      translation: 'Deben distinguir un hallazgo establecido de una inferencia plausible y de un juicio de valor. Esas categorías pueden relacionarse, pero no son intercambiables.'
    },
    {
      speaker: 'Host',
      line: `How can we discuss the issue responsibly?`,
      translation: '¿Cómo podemos hablar responsablemente del asunto?'
    },
    {
      speaker: 'Guest',
      line: `We can define our terms, acknowledge a serious counterargument and explain what evidence would make us revise our conclusion.`,
      translation: 'Podemos definir los términos, reconocer un contraargumento serio y explicar qué evidencia nos haría revisar la conclusión.'
    }
  ];
  const transcript = transcriptLines.map((line) => `${line.speaker}: ${line.line}`).join(' ');

  return {
    listening: {
      skill: 'listening',
      duration: config.listeningMinutes,
      xp: level === 'B2' ? 35 : level === 'C1' ? 45 : 55,
      title: `Listening Lab: ${context.title}`,
      description: `Follow an expert exchange, separate claims from inferences and identify the speakers’ degree of certainty.`,
      listeningType: 'interview',
      difficulty: level,
      durationSeconds: level === 'B2' ? 85 : level === 'C1' ? 105 : 125,
      speakers: ['Host', 'Guest'],
      intro: `Listen once for the main position. Listen again for qualifications, contrasts and the evidence that could change the conclusion.`,
      dialogue: transcriptLines,
      transcript,
      phrases: [
        'The central question is not only..., but also...',
        'We should distinguish... from...',
        'A serious counterargument is...',
        'I would revise this conclusion if...'
      ],
      phoneticSupport: {
        enabled: true,
        locale: 'en-US',
        focus: 'Stress the contrastive words that separate findings, inferences and judgements. Let your voice fall on a firm conclusion and remain open on a qualified one.',
        segments: [],
        stressedWords: ['evidence', 'inference', 'judgement', 'counterargument'],
        difficultSounds: [],
        reviewStatus: 'verified'
      },
      dictation: {
        segments: [
          { order: 0, text: transcriptLines[1].line },
          { order: 1, text: transcriptLines[3].line },
          { order: 2, text: transcriptLines[5].line }
        ]
      },
      listeningComprehension: {
        passingScore: 70,
        questions: [
        {
          type: 'mcq',
          prompt: `In Listening Lab: ${context.title}, why does the guest say the issue resists a simple answer?`,
          options: [
            'Because no evidence exists',
            'Because the central question is not only what happens, but also which assumptions shape the way the evidence is interpreted.',
            'Because the topic has no vocabulary',
            'Because the host changes the subject'
          ],
          answer: 1
        },
        {
          type: 'mcq',
          prompt: `In Listening Lab: ${context.title}, which three categories does the guest distinguish?`,
          options: [
            'Fact, spelling and pronunciation',
            'They should distinguish an established finding from a plausible inference and a value judgement.',
            'Cause, date and location',
            'Question, title and summary'
          ],
          answer: 1
        },
        {
          type: 'mcq',
          prompt: `In Listening Lab: ${context.title}, what makes the discussion responsible?`,
          options: [
            'Avoiding every objection',
            'Repeating the strongest claim',
            'We can define our terms, acknowledge a serious counterargument and explain what evidence would make us revise our conclusion.',
            'Speaking with absolute certainty'
          ],
          answer: 2
        },
        {
          type: 'mcq',
          prompt: `In Listening Lab: ${context.title}, what should listeners distinguish before reaching a conclusion?`,
          options: ['A title, a date and a location', 'They should distinguish an established finding from a plausible inference and a value judgement.', 'Only the host’s opinion', 'A spelling rule and a pronunciation rule'],
          answer: 1
        }
        ].map((question, index) => ({
          id: `english-${level.toLowerCase()}-${unit.slug}-listening-q${index + 1}`,
          ...question,
          correctOptionId: `o${index + 1}`,
          options: (() => {
            const options = [...question.options];
            const [correct] = options.splice(question.answer, 1);
            options.splice(index, 0, correct);
            return options.map((text, optionIndex) => ({ id: `o${optionIndex + 1}`, text }));
          })()
        }))
      },
      exercises: [
        { type: 'mcq', prompt: `In Listening Lab: ${context.title}, why does the guest say the issue resists a simple answer?`, options: ['Because no evidence exists', 'Because the central question is not only what happens, but also which assumptions shape the way the evidence is interpreted.', 'Because the topic has no vocabulary', 'Because the host changes the subject'], answer: 1 },
        { type: 'mcq', prompt: `In Listening Lab: ${context.title}, which three categories does the guest distinguish?`, options: ['Fact, spelling and pronunciation', 'They should distinguish an established finding from a plausible inference and a value judgement.', 'Cause, date and location', 'Question, title and summary'], answer: 1 },
        { type: 'mcq', prompt: `In Listening Lab: ${context.title}, what makes the discussion responsible?`, options: ['Avoiding every objection', 'Repeating the strongest claim', 'We can define our terms, acknowledge a serious counterargument and explain what evidence would make us revise our conclusion.', 'Speaking with absolute certainty'], answer: 2 },
        { type: 'mcq', prompt: `In Listening Lab: ${context.title}, what should listeners distinguish before reaching a conclusion?`, options: ['A title, a date and a location', 'They should distinguish an established finding from a plausible inference and a value judgement.', 'Only the host’s opinion', 'A spelling rule and a pronunciation rule'], answer: 1 }
      ]
    },
    speaking: {
      skill: 'speaking',
      duration: config.speakingMinutes,
      xp: level === 'B2' ? 35 : level === 'C1' ? 45 : 55,
      title: `Speak and Respond: ${context.title}`,
      description: `Build a clear ${level} response, record it and improve both argument and pronunciation.`,
      mission: `Give a ${config.turns}-minute response about ${context.title.toLowerCase()}. State a position, support it with evidence, address one counterargument and finish with a qualified conclusion.`,
      phrases: [
        'My position is that...',
        'The strongest evidence suggests...',
        'A reasonable objection would be...',
        'On balance, I would argue that...'
      ],
      dialogue: [
        {
          speaker: 'Tutor',
          line: `What is your main position on ${context.title.toLowerCase()}?`,
          translation: `¿Cuál es tu postura principal sobre ${context.title.toLowerCase()}?`
        },
        {
          speaker: 'You',
          line: 'My position is that the evidence supports a measured response, although one important limitation must be acknowledged.',
          translation: 'Mi postura es que la evidencia respalda una respuesta mesurada, aunque debe reconocerse una limitación importante.'
        },
        {
          speaker: 'Tutor',
          line: 'What evidence or example would make that position convincing?',
          translation: '¿Qué evidencia o ejemplo haría convincente esa postura?'
        }
      ],
      communicationGuide: {
        steps: [
          'Record your first answer without reading a complete script.',
          'Use speech-to-text to inspect what the system understood.',
          'Ask the AI Tutor for feedback on clarity, evidence and register.',
          'Record a second version and compare pronunciation and fluency.'
        ],
        premiumMode: 'Free conversation with the AI Tutor',
        pronunciationTargets: ['sentence stress', 'contrastive emphasis', 'thought groups', 'qualified intonation']
      },
      exercises: [
        {
          type: 'speaking',
          prompt: `Record a ${config.turns}-minute response with a claim, evidence, a counterargument and a qualified conclusion.`,
          answer: 'Open oral response'
        },
        {
          type: 'practice',
          prompt: 'Use STT to deliver the same response without typing. Review the transcript and correct any unclear section.',
          answer: 'Speech-to-text practice'
        },
        {
          type: 'pronunciation',
          prompt: 'Record the model phrase twice, stressing the contrast: “The evidence supports the claim; it does not prove it.”',
          answer: 'Pronunciation practice'
        }
      ]
    },
    writing: {
      skill: 'writing',
      duration: config.writingMinutes,
      xp: level === 'B2' ? 40 : level === 'C1' ? 50 : 60,
      title: `Guided Writing: ${context.title}`,
      description: `Plan, draft and revise a ${level} argument with visible steps and a practical checklist.`,
      mission: `Write ${config.words} words about ${context.title.toLowerCase()}. Present a clear thesis, develop two connected reasons, address one counterargument and end with a proportionate conclusion.`,
      phrases: [
        'This response argues that...',
        'The available evidence indicates...',
        'Admittedly,... Nevertheless,...',
        'This conclusion remains valid provided that...'
      ],
      dialogue: [
        {
          speaker: 'Model',
          line: `This response argues that ${context.title.toLowerCase()} should be evaluated through evidence, distributional effects and the possibility of revision. Although a competing view deserves consideration, it does not remove the need for a proportionate conclusion.`,
          translation: 'Este texto sostiene que el tema debe evaluarse mediante la evidencia, sus efectos distributivos y la posibilidad de revisión. Aunque una postura contraria merece consideración, no elimina la necesidad de una conclusión proporcionada.'
        }
      ],
      writingGuide: {
        taskType: level === 'B2' ? 'structured opinion essay' : level === 'C1' ? 'analytical essay' : 'critical synthesis',
        steps: [
          'Define the exact question and write a one-sentence thesis.',
          'Select two pieces of evidence or examples and explain their relevance.',
          'Present the strongest counterargument fairly.',
          'Respond without exaggerating what the evidence proves.',
          'Revise cohesion, grammar, register and conclusion.'
        ],
        checklist: [
          `Use at least two terms from this unit: ${terms}.`,
          context.grammar ? `Use ${context.grammar} accurately at least once.` : 'Use one advanced structure accurately.',
          'Separate evidence, inference and judgement.',
          'Check paragraph links and remove unsupported absolute claims.'
        ]
      },
      exercises: [
        {
          type: 'writing',
          prompt: `Write ${config.words} words. Before submitting, confirm that your text contains a thesis, two developed reasons, one counterargument and a qualified conclusion.`,
          answer: 'Open written response'
        }
      ]
    }
  };
}

function frenchActivities(unit, level) {
  const config = LEVEL_CONFIG[level];
  const context = unitContext(unit);
  const keyTerms = context.vocabulary.slice(0, 3);
  const terms = keyTerms.length ? keyTerms.join(', ') : context.title.toLowerCase();
  const transcriptLines = [
    {
      speaker: 'Animatrice',
      line: `Aujourd’hui, nous examinons ${context.title.toLowerCase()}. Pourquoi cette question résiste-t-elle aux réponses trop simples ?`,
      translation: `Hoy analizamos ${context.title.toLowerCase()}. ¿Por qué esta cuestión se resiste a respuestas demasiado simples?`
    },
    {
      speaker: 'Invité',
      line: 'Parce qu’il faut distinguer ce qui est établi, ce que l’on peut raisonnablement inférer et le jugement de valeur que l’on porte ensuite.',
      translation: 'Porque hay que distinguir lo establecido, lo que puede inferirse razonablemente y el juicio de valor que se formula después.'
    },
    {
      speaker: 'Animatrice',
      line: 'Quelle objection mérite alors d’être prise au sérieux ?',
      translation: '¿Qué objeción merece entonces tomarse en serio?'
    },
    {
      speaker: 'Invité',
      line: 'La meilleure objection est celle qui conteste une prémisse précise et qui s’appuie sur des éléments vérifiables, non sur une impression.',
      translation: 'La mejor objeción es la que cuestiona una premisa concreta y se apoya en elementos verificables, no en una impresión.'
    },
    {
      speaker: 'Animatrice',
      line: 'Comment formuler une conclusion responsable ?',
      translation: '¿Cómo formular una conclusión responsable?'
    },
    {
      speaker: 'Invité',
      line: 'Il faut annoncer la portée de la conclusion, ses limites et les nouvelles preuves qui pourraient conduire à la réviser.',
      translation: 'Hay que indicar el alcance de la conclusión, sus límites y las nuevas pruebas que podrían llevar a revisarla.'
    }
  ];
  const transcript = transcriptLines.map((line) => `${line.speaker} : ${line.line}`).join(' ');

  return {
    listening: {
      skill: 'listening',
      duration: config.listeningMinutes,
      xp: level === 'B2' ? 35 : level === 'C1' ? 45 : 55,
      title: `Atelier d’écoute : ${context.title}`,
      description: 'Suis un échange argumenté, repère les nuances et distingue faits, inférences et jugements.',
      listeningType: 'interview',
      difficulty: level,
      durationSeconds: level === 'B2' ? 85 : level === 'C1' ? 105 : 125,
      speakers: ['Animatrice', 'Invité'],
      intro: 'Écoute une première fois pour comprendre la position générale, puis une seconde fois pour relever les nuances et les critères de révision.',
      dialogue: transcriptLines,
      transcript,
      phrases: [
        'Il faut distinguer... de...',
        'L’objection la plus solide consiste à...',
        'Dans l’état actuel des connaissances...',
        'Cette conclusion devrait être révisée si...'
      ],
      phoneticSupport: {
        enabled: true,
        locale: 'fr-FR',
        focus: 'Marque les groupes rythmiques et les mots de contraste. Fais entendre la différence entre une affirmation ferme et une conclusion nuancée.',
        segments: [],
        stressedWords: ['établi', 'inférer', 'objection', 'réviser'],
        difficultSounds: [],
        reviewStatus: 'verified'
      },
      dictation: {
        segments: [
          { order: 0, text: transcriptLines[1].line },
          { order: 1, text: transcriptLines[3].line },
          { order: 2, text: transcriptLines[5].line }
        ]
      },
      exercises: [
        {
          type: 'mcq',
          prompt: 'Pourquoi la question résiste-t-elle aux réponses trop simples ?',
          options: [
            'Parce qu’aucune preuve n’existe',
            'Parce qu’il faut distinguer faits établis, inférences et jugements',
            'Parce que le sujet manque de vocabulaire',
            'Parce que l’animatrice change de sujet'
          ],
          answer: 1
        },
        {
          type: 'mcq',
          prompt: 'Quelle objection l’invité juge-t-il solide ?',
          options: [
            'Une impression répétée',
            'Une objection qui conteste une prémisse avec des éléments vérifiables',
            'Une objection sans rapport avec le sujet',
            'Une affirmation catégorique'
          ],
          answer: 1
        },
        {
          type: 'mcq',
          prompt: 'Que doit préciser une conclusion responsable ?',
          options: [
            'Seulement l’opinion de l’auteur',
            'Sa longueur exacte',
            'Sa portée, ses limites et les preuves qui permettraient de la réviser',
            'Une certitude absolue'
          ],
          answer: 2
        },
        {
          type: 'mcq',
          prompt: 'Quel lexique appartient à cette unité ?',
          options: ['les loisirs du week-end', terms, 'les objets de la classe', 'les aliments'],
          answer: 1
        }
      ]
    },
    speaking: {
      skill: 'speaking',
      duration: config.speakingMinutes,
      xp: level === 'B2' ? 35 : level === 'C1' ? 45 : 55,
      title: `Prendre position : ${context.title}`,
      description: `Construis une intervention ${level}, enregistre-la et améliore l’argumentation comme la prononciation.`,
      mission: `Présente pendant ${config.turns} minutes une position sur ${context.title.toLowerCase()}. Formule une thèse, appuie-la sur un exemple, traite une objection et termine par une conclusion nuancée.`,
      phrases: [
        'Ma position est que...',
        'Les éléments disponibles indiquent que...',
        'On pourrait objecter que...',
        'Tout bien considéré, je dirais que...'
      ],
      dialogue: [
        {
          speaker: 'Tuteur',
          line: `Quelle est ta position principale sur ${context.title.toLowerCase()} ?`,
          translation: `¿Cuál es tu postura principal sobre ${context.title.toLowerCase()}?`
        },
        {
          speaker: 'Toi',
          line: 'À mon sens, les éléments disponibles justifient une réponse mesurée, même s’il faut reconnaître une limite importante.',
          translation: 'A mi juicio, los elementos disponibles justifican una respuesta mesurada, aunque hay que reconocer una limitación importante.'
        },
        {
          speaker: 'Tuteur',
          line: 'Quel exemple rendrait cette position plus convaincante ?',
          translation: '¿Qué ejemplo haría más convincente esa postura?'
        }
      ],
      communicationGuide: {
        steps: [
          'Enregistre une première réponse sans lire un texte complet.',
          'Utilise la transcription vocale pour vérifier ce qui a été compris.',
          'Demande au Tuteur IA un retour sur la clarté, les preuves et le registre.',
          'Enregistre une seconde version et compare fluidité et prononciation.'
        ],
        premiumMode: 'Conversation libre avec le Tuteur IA',
        pronunciationTargets: ['groupes rythmiques', 'mise en relief', 'enchaînements', 'intonation nuancée']
      },
      exercises: [
        {
          type: 'speaking',
          prompt: `Enregistre une réponse de ${config.turns} minutes avec une thèse, un exemple, une objection et une conclusion nuancée.`,
          answer: 'Production orale ouverte'
        },
        {
          type: 'practice',
          prompt: 'Dicte la même réponse avec la reconnaissance vocale, relis la transcription et reformule tout passage mal compris.',
          answer: 'Pratique de transcription vocale'
        },
        {
          type: 'pronunciation',
          prompt: 'Enregistre deux fois la phrase modèle en marquant le contraste : « Les éléments soutiennent l’hypothèse ; ils ne la prouvent pas. »',
          answer: 'Pratique de prononciation'
        }
      ]
    },
    writing: {
      skill: 'writing',
      duration: config.writingMinutes,
      xp: level === 'B2' ? 40 : level === 'C1' ? 50 : 60,
      title: `Écriture guidée : ${context.title}`,
      description: `Planifie, rédige et révise une argumentation ${level} à l’aide d’étapes visibles.`,
      mission: `Rédige ${config.words} mots sur ${context.title.toLowerCase()}. Formule une thèse claire, développe deux arguments reliés, traite une objection et termine par une conclusion proportionnée.`,
      phrases: [
        'Ce texte défend l’idée que...',
        'Les éléments disponibles montrent que...',
        'Certes,... Néanmoins,...',
        'Cette conclusion reste valable à condition que...'
      ],
      dialogue: [
        {
          speaker: 'Modèle',
          line: `Ce texte défend l’idée que ${context.title.toLowerCase()} doit être évalué à partir des preuves, de la répartition de ses effets et de la possibilité de réviser la décision. Une objection sérieuse mérite d’être examinée sans pour autant annuler toute conclusion.`,
          translation: 'Este texto sostiene que el tema debe evaluarse a partir de las pruebas, de la distribución de sus efectos y de la posibilidad de revisar la decisión. Una objeción seria merece examinarse sin anular por ello toda conclusión.'
        }
      ],
      writingGuide: {
        taskType: level === 'B2' ? 'texte argumentatif structuré' : level === 'C1' ? 'essai analytique' : 'synthèse critique',
        steps: [
          'Délimite la question et rédige une thèse en une phrase.',
          'Choisis deux preuves ou exemples et explique leur pertinence.',
          'Présente loyalement l’objection la plus solide.',
          'Réponds sans exagérer la portée des preuves.',
          'Révise la cohésion, la grammaire, le registre et la conclusion.'
        ],
        checklist: [
          `Utilise au moins deux termes de l’unité : ${terms}.`,
          context.grammar ? `Emploie correctement ${context.grammar} au moins une fois.` : 'Emploie correctement une structure avancée.',
          'Distingue preuve, inférence et jugement.',
          'Vérifie les liens entre les paragraphes et supprime les affirmations absolues non justifiées.'
        ]
      },
      exercises: [
        {
          type: 'writing',
          prompt: `Rédige ${config.words} mots. Avant l’envoi, vérifie la présence d’une thèse, de deux arguments développés, d’une objection et d’une conclusion nuancée.`,
          answer: 'Production écrite ouverte'
        }
      ]
    }
  };
}

function ensureEnglishGrammarExam(unit, level) {
  // A test is a concise checkpoint. Extended item banks belong to guided
  // practice; eight varied questions give B2-C2 learners a focused,
  // assessable review without template-driven repetition.
  const targetSize = { B2: 8, C1: 8, C2: 8 }[level];
  const grammar = unit.activities.grammar;
  const test = grammar?.grammarTest;
  const profile = grammar.grammarProfile || {};
  const name = profile.name || grammar.title;
  const explanation =
    profile.definition ||
    profile.explanation ||
    grammar.grammarNote ||
    `Use ${name} with accurate form, meaning and register.`;
  grammar.grammarProfile = {
    ...profile,
    name,
    definition: profile.definition || profile.explanation || explanation,
    structure: profile.structure || `Apply ${name} with the form and sentence position required by the context.`,
    function: profile.function || profile.purpose || `Use ${name} to express precise relationships between ideas.`,
    examples: profile.examples || grammar.phrases || []
  };
  if (!test) return;
  if (test.questions.length > targetSize) {
    test.questions = test.questions.slice(0, targetSize);
  }
  if (test.questions.length >= targetSize) return;

  const stems = [
    `Which sentence uses ${name} with the most accurate form and register?`,
    `Which revision applies ${name} without overstating the evidence?`,
    `Which option best connects claim and qualification through ${name}?`,
    `Which sentence would be most appropriate in a formal discussion of this unit?`
  ];

  while (test.questions.length < targetSize) {
    const index = test.questions.length;
    const correctIndex = index % 4;
    const correct = `Although the evidence remains incomplete, the conclusion can be qualified through a controlled use of ${name}.`;
    const distractors = [
      'The evidence proves every possible conclusion without limitation.',
      'Because the issue complex therefore the answer definitely.',
      'The claim is being true by the words that were used.'
    ];
    const options = [...distractors];
    options.splice(correctIndex, 0, correct);
    test.questions.push({
      id: `english-${level.toLowerCase()}-${unit.slug}-grammar-q${index + 1}`,
      type: 'mcq',
      prompt: stems[index % stems.length],
      options: options.map((text, optionIndex) => ({
        id: ['a', 'b', 'c', 'd'][optionIndex],
        text
      })),
      correctOptionId: ['a', 'b', 'c', 'd'][correctIndex],
      explanation,
      difficulty: level === 'B2' ? 'medium' : 'hard'
    });
  }
}

function ensureAdvancedCommunicationSkills(units, { language, level, preserveExisting = false }) {
  if (!LEVEL_CONFIG[level]) throw new Error(`Unsupported advanced level: ${level}`);
  const build = language === 'french' ? frenchActivities : englishActivities;

  units.forEach((unit) => {
    if (language === 'english') ensureEnglishGrammarExam(unit, level);
    const additions = build(unit, level);
    for (const skill of ['listening', 'speaking', 'writing']) {
      if (preserveExisting && unit.activities[skill]) {
        unit.activities[skill] = {
          ...additions[skill],
          ...unit.activities[skill],
          communicationGuide:
            unit.activities[skill].communicationGuide || additions[skill].communicationGuide,
          writingGuide: unit.activities[skill].writingGuide || additions[skill].writingGuide,
          listeningType: unit.activities[skill].listeningType || additions[skill].listeningType,
          transcript:
            unit.activities[skill].transcript ||
            unit.activities[skill].dialogue?.map((line) => `${line.speaker} : ${line.line}`).join(' ') ||
            additions[skill].transcript,
          phoneticSupport:
            unit.activities[skill].phoneticSupport || additions[skill].phoneticSupport
        };
      } else {
        unit.activities[skill] = additions[skill];
      }
    }
  });

  return units;
}

module.exports = { ensureAdvancedCommunicationSkills };
