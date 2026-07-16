// scripts/content/french-a1-units.js
// Hand-authored French A1 content: 12 thematic units, 7 real activities each
// (reading/listening/speaking/writing/grammar/vocabulary/dialogue) - one per
// skill per unit, plus a standalone dialogue, not a single generic
// "Quest/Lab/Mission" card per skill. Mirrors the shape of
// scripts/content/english-a1-units.js but is an original, independently
// authored French A1 course (not a translation of the English one),
// following a single narrative thread: Camila, a Dominican exchange student
// on a school year in Tours, France, living with her host family (the
// Lamberts) and befriending Léa (her host sister) and Karim (a classmate).
//
// Everything the learner sees (titles, texts, dialogue, exercises) is in
// French; Spanish only appears in vocabulary/dialogue `translation` fields
// and each unit's `titleEs`, both optional-support fields the frontend
// already renders hidden-by-default. accessTier marks units 1-2 free and
// 3-12 premium (still fully authored, never "coming soon").
//
// Consumed by scripts/build-french-a1-seed.js, which flattens this into
// lib/seed-lessons.json (84 rows: 72 core + 12 dialogues) + lib/seed-units.json
// (12 rows).

const DEFAULTS = {
  reading: { duration: 10, xp: 25 },
  listening: { duration: 10, xp: 25 },
  speaking: { duration: 8, xp: 20 },
  writing: { duration: 12, xp: 25 },
  grammar: { duration: 8, xp: 20 },
  vocabulary: { duration: 6, xp: 20 },
  dialogue: { duration: 10, xp: 20 }
};

function activity(skill, fields) {
  return { skill, duration: DEFAULTS[skill].duration, xp: DEFAULTS[skill].xp, ...fields };
}

const units = [
  // ---------------------------------------------------------------
  {
    slug: 'bonjour-et-bienvenue',
    title: 'Bonjour et bienvenue',
    titleEs: 'Hola y bienvenida',
    description: "Salutations, présentations et l'alphabet, avec Camila à son premier jour à Tours.",
    order: 1,
    accessTier: 'free',
    activities: {
      reading: activity('reading', {
        title: 'Bienvenue à Tours !',
        description: "Le premier jour de Camila à l'école, en trois parties.",
        reading: {
          title: 'Bienvenue à Tours !',
          parts: [
            "Bonjour ! Je m'appelle Camila. Je viens de Saint-Domingue, en République dominicaine. Aujourd'hui, c'est mon premier jour à l'école, à Tours, en France. Je suis un peu nerveuse, mais je suis très contente. J'habite chez une famille française, la famille Lambert. Le matin, je prends mon sac et je marche vers l'école avec Léa, la fille de la famille. Léa a quinze ans, comme moi. Elle est sympathique et elle parle lentement pour m'aider. Devant l'école, il y a beaucoup d'élèves. Ils parlent, ils rient, et moi, j'observe tout en silence.",
            "Dans la salle de classe, la professeure s'appelle Madame Dubois. Elle a un grand sourire et une voix calme. Elle dit : « Bonjour, la classe ! Bienvenue ! » et les élèves répondent : « Bonjour, madame ! » Je m'assois à côté d'un garçon sympathique. Il s'appelle Karim. « Salut ! Tu es nouvelle ? » demande-t-il. « Oui, je m'appelle Camila. Je suis dominicaine », je réponds. « Enchanté, Camila ! Bienvenue à Tours », dit Karim avec un grand sourire. Léa est assise juste derrière nous. Elle chuchote : « Ne t'inquiète pas, tout va bien se passer ! »",
            "Madame Dubois demande à chaque élève d'épeler son prénom avec l'alphabet. J'épelle mon prénom : C-A-M-I-L-A. Karim épelle le sien : K-A-R-I-M. Tout le monde applaudit. À la fin du cours, Léa me dit : « Bravo, Camila ! C'est un bon début. » Je souris. J'ai déjà deux nouveaux amis, Léa et Karim, et j'ai envie d'apprendre encore plus de français. Ce premier jour à Tours restera un très bon souvenir."
          ],
          questions: [
            "Comment s'appelle la nouvelle élève ?",
            'Qui est la professeure ?',
            'Que font les élèves pour se présenter ?'
          ],
          ordering: {
            prompt: 'Remets les événements de l\'histoire dans l\'ordre.',
            events: [
              "Camila arrive devant l'école avec Léa.",
              'Madame Dubois accueille la classe.',
              'Camila rencontre Karim et ils se présentent.',
              'Les élèves épellent leur prénom avec l\'alphabet.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: "Comment s'appelle la professeure ?", options: ['Madame Dubois', 'Madame Lambert', 'Madame Camila', 'Madame Karim'], answer: 0 },
          { type: 'mcq', prompt: "D'où vient Camila ?", options: ['De France', 'De République dominicaine', 'Du Maroc', "D'Espagne"], answer: 1 },
          { type: 'mcq', prompt: 'Qui est Léa ?', options: ['La professeure', 'La fille de la famille Lambert', 'La sœur de Karim', "La directrice de l'école"], answer: 1 },
          { type: 'mcq', prompt: "Qu'est-ce que les élèves font à la fin du cours ?", options: ['Ils chantent une chanson', 'Ils épellent leur prénom', 'Ils dessinent', 'Ils mangent un gâteau'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila est un peu nerveuse le premier jour.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Vrai ou faux : Karim est la professeure de la classe.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila habite chez la famille de Léa.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Choisis le bon mot : Madame Dubois a un grand sourire et une voix ___.', options: ['fâchée', 'calme', 'triste', 'fatiguée'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Bonjour et bienvenue !',
        description: 'Écoute Léa et Camila qui se rencontrent pour la première fois.',
        intro: 'Écoute Léa et Camila devant l\'école, le premier jour. Fais attention à la façon de se saluer et de se présenter.',
        dialogue: [
          { speaker: 'Léa', line: "Bonjour ! Je m'appelle Léa. Comment tu t'appelles ?", translation: '¿Hola? Me llamo Léa. ¿Cómo te llamas?' },
          { speaker: 'Camila', line: "Salut, Léa ! Je m'appelle Camila. Enchantée.", translation: 'Hola, Léa. Me llamo Camila. Encantada.' },
          { speaker: 'Léa', line: 'Enchantée aussi ! Comment ça va ?', translation: 'Encantada también. ¿Cómo estás?' },
          { speaker: 'Camila', line: 'Ça va bien, merci. Et toi ?', translation: 'Estoy bien, gracias. ¿Y tú?' },
          { speaker: 'Léa', line: 'Ça va très bien ! Bienvenue à Tours.', translation: 'Muy bien. ¡Bienvenida a Tours!' },
          { speaker: 'Camila', line: 'Merci beaucoup, Léa. À bientôt !', translation: 'Muchas gracias, Léa. ¡Hasta pronto!' }
        ],
        phrases: ["Comment tu t'appelles ?", 'Enchanté(e).', 'Comment ça va ?', 'À bientôt !'],
        exercises: [
          { type: 'mcq', prompt: "Comment s'appelle la nouvelle amie de Camila ?", options: ['Madame Dubois', 'Léa', 'Karim', 'Sofía'], answer: 1 },
          { type: 'mcq', prompt: 'Que répond Camila quand Léa demande « Comment ça va ? »', options: ['Ça va bien, merci', 'Je m\'appelle Camila', 'Bienvenue à Tours', 'Au revoir'], answer: 0 },
          { type: 'mcq', prompt: 'Comment Camila dit-elle au revoir ?', options: ['Bonjour', 'Enchantée', 'À bientôt', 'Comment ça va'], answer: 2 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Dis bonjour !',
        description: 'Salue un/une camarade et présente-toi à voix haute.',
        mission: 'Salue un/une camarade, présente-toi avec ton prénom et demande comment il/elle va.',
        phrases: ['Bonjour ! / Salut !', "Je m'appelle...", 'Enchanté(e).', 'Comment ça va ?', 'Ça va bien, merci.'],
        dialogue: [
          { speaker: 'Toi', line: "Bonjour ! Je m'appelle...", translation: 'Hola, me llamo...' },
          { speaker: 'Camarade', line: "Salut ! Je m'appelle... Enchanté(e).", translation: 'Hola, me llamo... Encantado/a.' },
          { speaker: 'Toi', line: 'Enchanté(e) aussi. Comment ça va ?', translation: 'Encantado/a también. ¿Cómo estás?' },
          { speaker: 'Camarade', line: 'Ça va bien, merci. Et toi ?', translation: 'Estoy bien, gracias. ¿Y tú?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Dis à voix haute : « Bonjour, je m\'appelle... » et termine la phrase avec ton prénom.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Pratique le dialogue de salutation avec un/une camarade, puis échangez les rôles.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Écris ta présentation',
        description: 'Écris trois phrases simples pour te présenter.',
        mission: 'Écris 3 phrases : ton prénom, comment tu vas aujourd\'hui, et une salutation à un ami.',
        phrases: ["Je m'appelle...", 'Je vais bien.', 'Bonjour, ...!'],
        dialogue: [
          { speaker: 'Modèle', line: "Je m'appelle Camila. Je vais bien aujourd'hui. Bonjour, Léa !", translation: 'Me llamo Camila. Estoy bien hoy. ¡Hola, Léa!' }
        ],
        exercises: [
          { type: 'writing', prompt: "Écris 3 phrases courtes pour te présenter, avec « Je m'appelle... », « Je vais... » et « Bonjour, ...! »", answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le verbe être et les pronoms sujets',
        description: 'Les pronoms sujets et le verbe être au présent, tu et vous.',
        grammarNote: "Les pronoms sujets sont je, tu, il/elle, nous, vous, ils/elles. Le verbe être change selon le sujet : je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont. On utilise tu avec un ami ou un enfant, et vous avec un adulte ou pour être poli. Exemple : « Je suis Camila. Tu es Léa. Vous êtes Madame Dubois. »",
        phrases: ['Je suis...', 'Tu es...', 'Il/Elle est...', 'Nous sommes...', 'Vous êtes...', 'Ils/Elles sont...'],
        exercises: [
          { type: 'mcq', prompt: 'Je ___ dominicaine.', options: ['suis', 'es', 'est', 'sommes'], answer: 0 },
          { type: 'mcq', prompt: "Tu ___ nouvelle à l'école.", options: ['suis', 'es', 'est', 'êtes'], answer: 1 },
          { type: 'mcq', prompt: 'Madame Dubois ___ la professeure.', options: ['suis', 'es', 'est', 'sont'], answer: 2 },
          { type: 'mcq', prompt: 'Léa et Karim ___ mes amis.', options: ['est', 'es', 'sommes', 'sont'], answer: 3 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Les mots de bienvenue',
        description: 'Le vocabulaire essentiel pour saluer et se présenter.',
        vocabulary: [
          { word: 'Bonjour', translation: 'Buenos días / Hola', example: 'Bonjour, madame !' },
          { word: 'Salut', translation: 'Hola (familiar)', example: 'Salut, Karim !' },
          { word: 'Merci', translation: 'Gracias', example: 'Merci beaucoup, Léa.' },
          { word: "S'il te plaît", translation: 'Por favor (familiar)', example: "Répète, s'il te plaît." },
          { word: 'Enchanté(e)', translation: 'Encantado/a', example: 'Enchantée, Camila.' },
          { word: 'Au revoir', translation: 'Adiós', example: 'Au revoir, à demain !' },
          { word: 'À bientôt', translation: 'Hasta pronto', example: 'À bientôt, Léa !' },
          { word: 'Comment ça va ?', translation: '¿Cómo estás?', example: 'Comment ça va, Karim ?' },
          { word: 'Ça va bien', translation: 'Estoy bien', example: 'Ça va bien, merci.' },
          { word: 'Le prénom', translation: 'El nombre de pila', example: "Mon prénom, c'est Camila." },
          { word: 'La salle de classe', translation: 'El salón de clase', example: 'La salle de classe est grande.' },
          { word: 'Le professeur / la professeure', translation: 'El profesor / la profesora', example: 'Madame Dubois est ma professeure.' },
          { word: "L'élève", translation: 'El/la estudiante', example: 'Karim est un bon élève.' },
          { word: "L'ami(e)", translation: 'El amigo / la amiga', example: 'Léa est mon amie.' },
          { word: 'Bienvenue', translation: 'Bienvenida/o', example: 'Bienvenue à Tours !' },
          { word: 'Nouveau / nouvelle', translation: 'Nuevo / nueva', example: "Je suis nouvelle à l'école." }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « merci » ?', options: ['Hola', 'Gracias', 'Adiós', 'Por favor'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « au revoir » ?', options: ['Bienvenida', 'Encantado', 'Adiós', 'Buenos días'], answer: 2 },
          { type: 'mcq', prompt: 'Que signifie « la salle de classe » ?', options: ['El salón de clase', 'El profesor', 'El amigo', 'El nombre'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Une nouvelle camarade',
        description: 'Camila rencontre Léa devant l\'école, le premier jour.',
        intro: "Camila arrive à l'école de Tours pour la première fois. Elle rencontre Léa, la fille de sa famille d'accueil, devant l'entrée.",
        dialogue: [
          { speaker: 'Léa', line: "Bonjour, Camila ! Bienvenue à l'école.", translation: 'Hola, Camila. Bienvenida a la escuela.' },
          { speaker: 'Camila', line: 'Merci, Léa. Je suis un peu nerveuse.', translation: 'Gracias, Léa. Estoy un poco nerviosa.' },
          { speaker: 'Léa', line: "Ne t'inquiète pas ! Je suis avec toi.", translation: 'No te preocupes. Estoy contigo.' },
          { speaker: 'Camila', line: 'Merci beaucoup. Tu es très gentille.', translation: 'Muchas gracias. Eres muy amable.' },
          { speaker: 'Léa', line: 'Viens, je te présente Karim, un camarade de classe.', translation: 'Ven, te presento a Karim, un compañero de clase.' },
          { speaker: 'Karim', line: 'Salut, Camila ! Enchanté.', translation: '¡Hola, Camila! Encantado.' },
          { speaker: 'Camila', line: 'Enchantée, Karim !', translation: '¡Encantada, Karim!' }
        ],
        phrases: ['Bienvenue à...', "Ne t'inquiète pas.", 'Je te présente...', 'Enchanté(e).'],
        vocabulary: [
          { word: "Je te présente...", translation: 'Te presento a...', example: 'Je te présente Karim.' },
          { word: "Ne t'inquiète pas", translation: 'No te preocupes', example: "Ne t'inquiète pas, tout va bien." }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Qui présente Karim à Camila ?', options: ['Madame Dubois', 'Léa', 'Le directeur', 'Personne'], answer: 1 },
          { type: 'mcq', prompt: 'Comment se sent Camila au début du dialogue ?', options: ['Fâchée', 'Un peu nerveuse', 'Fatiguée', 'Triste'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit Léa pour rassurer Camila ?', options: ["Ne t'inquiète pas", 'Au revoir', 'Bon appétit', 'Quelle heure est-il ?'], answer: 0 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'je-me-presente',
    title: 'Je me présente',
    titleEs: 'Me presento',
    description: 'Âge, nationalité et centres d\'intérêt : Camila et ses camarades se présentent.',
    order: 2,
    accessTier: 'free',
    activities: {
      reading: activity('reading', {
        title: 'Ma fiche de présentation',
        description: 'Camila, Karim et Léa remplissent une fiche de présentation en classe, en trois parties.',
        reading: {
          title: 'Ma fiche de présentation',
          parts: [
            "Aujourd'hui, dans la classe de Madame Dubois, nous avons une activité amusante : remplir une fiche de présentation. J'écris mon prénom, mon âge et ma nationalité. Je m'appelle Camila Ramírez. J'ai seize ans. Je suis dominicaine, mais j'habite maintenant à Tours, en France. Sur ma fiche, j'écris aussi mes centres d'intérêt : la musique, la danse et les langues. Madame Dubois demande : « Qui a une fiche originale ? » Karim lève la main tout de suite.",
            "Karim se présente : « Je m'appelle Karim Haddad. J'ai quinze ans. Je suis marocain et français, parce que ma famille vient du Maroc, mais je suis né à Tours. » Léa continue : « Moi, je m'appelle Léa Lambert. J'ai quinze ans aussi. Je suis française, de Tours. » Madame Dubois pose une question à toute la classe : « D'où venez-vous ? » Nous répondons chacun notre tour, avec notre pays d'origine et notre ville.",
            "À la fin de l'activité, Madame Dubois affiche toutes les fiches sur le mur de la classe. « Vous n'êtes pas seuls », dit-elle. « Cette classe a des élèves de plusieurs pays, et c'est une richesse. » Je regarde ma fiche à côté de celle de Karim et de Léa. Je ne suis pas triste d'être loin de Saint-Domingue, parce que j'ai déjà de nouveaux amis à Tours. Ce jour-là, je comprends que ma nouvelle vie en France commence vraiment bien."
          ],
          questions: ['Quel âge a Camila ?', 'Quelle est la nationalité de Karim ?', 'Que fait Madame Dubois à la fin de l\'activité ?'],
          ordering: {
            prompt: 'Remets les événements de l\'histoire dans l\'ordre.',
            events: [
              'Madame Dubois demande de remplir une fiche de présentation.',
              'Karim se présente à la classe.',
              'Léa se présente à la classe.',
              'Madame Dubois affiche les fiches sur le mur.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Quel âge a Camila ?', options: ['Quinze ans', 'Seize ans', 'Dix-sept ans', 'Quatorze ans'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la nationalité de Karim ?', options: ['Français seulement', 'Marocain seulement', 'Marocain et français', 'Dominicain'], answer: 2 },
          { type: 'mcq', prompt: 'Où est né Karim ?', options: ['Au Maroc', 'À Tours', 'À Saint-Domingue', 'À Paris'], answer: 1 },
          { type: 'mcq', prompt: 'Que fait Madame Dubois avec les fiches ?', options: ['Elle les jette', 'Elle les affiche sur le mur', 'Elle les corrige en rouge', 'Elle les envoie aux parents'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Léa est française, de Tours.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila est triste d\'être loin de Saint-Domingue à la fin du texte.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Karim a quinze ans, comme Léa.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Choisis le bon mot : La classe a des élèves de plusieurs pays, et c\'est une ___.', options: ['problème', 'richesse', 'erreur', 'surprise triste'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: "D'où viens-tu ?",
        description: 'Karim et Camila parlent de leur âge et de leur nationalité pendant la récréation.',
        intro: 'Écoute Karim et Camila qui parlent de leur nationalité et de leur âge, pendant la récréation.',
        dialogue: [
          { speaker: 'Karim', line: 'Camila, quel âge as-tu ?', translation: 'Camila, ¿cuántos años tienes?' },
          { speaker: 'Camila', line: "J'ai seize ans. Et toi, quel âge as-tu ?", translation: 'Tengo dieciséis años. ¿Y tú, cuántos años tienes?' },
          { speaker: 'Karim', line: "J'ai quinze ans. D'où viens-tu, Camila ?", translation: 'Tengo quince años. ¿De dónde vienes, Camila?' },
          { speaker: 'Camila', line: 'Je viens de République dominicaine. Et toi ?', translation: 'Vengo de República Dominicana. ¿Y tú?' },
          { speaker: 'Karim', line: 'Ma famille vient du Maroc, mais je suis né ici, à Tours.', translation: 'Mi familia viene de Marruecos, pero yo nací aquí, en Tours.' },
          { speaker: 'Camila', line: "C'est intéressant ! Tu parles arabe aussi ?", translation: '¡Qué interesante! ¿Hablas árabe también?' },
          { speaker: 'Karim', line: 'Oui, un peu. Je parle français, arabe et anglais.', translation: 'Sí, un poco. Hablo francés, árabe e inglés.' }
        ],
        phrases: ['Quel âge as-tu ?', "J'ai... ans.", "D'où viens-tu ?", 'Je viens de...'],
        exercises: [
          { type: 'mcq', prompt: 'Quel âge a Camila ?', options: ['Quinze ans', 'Seize ans', 'Dix-sept ans', 'Treize ans'], answer: 1 },
          { type: 'mcq', prompt: 'D\'où vient la famille de Karim ?', options: ['De France', 'Du Maroc', "D'Espagne", 'Du Portugal'], answer: 1 },
          { type: 'mcq', prompt: 'Combien de langues parle Karim ?', options: ['Une', 'Deux', 'Trois', 'Quatre'], answer: 2 }
        ]
      }),
      speaking: activity('speaking', {
        title: "Présente-toi à un(e) camarade",
        description: "Présente ton prénom, ton âge et ta nationalité à voix haute.",
        mission: "Présente ton prénom, ton âge et ta nationalité à un(e) camarade, puis pose-lui les mêmes questions.",
        phrases: ["Comment tu t'appelles ?", 'Quel âge as-tu ?', "D'où viens-tu ?", 'Je suis...'],
        dialogue: [
          { speaker: 'Toi', line: "Je m'appelle... J'ai... ans.", translation: 'Me llamo... Tengo... años.' },
          { speaker: 'Camarade', line: "Moi, je m'appelle... Je suis...", translation: 'Yo me llamo... Soy...' },
          { speaker: 'Toi', line: "D'où viens-tu ?", translation: '¿De dónde vienes?' },
          { speaker: 'Camarade', line: 'Je viens de...', translation: 'Vengo de...' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Dis à voix haute ton prénom, ton âge et ta nationalité.', answer: 'Oral practice' },
          { type: 'practice', prompt: "Pose à un(e) camarade les questions « Quel âge as-tu ? » et « D'où viens-tu ? », puis échangez les rôles.", answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Ma fiche de présentation',
        description: 'Complète ta propre fiche de présentation.',
        mission: 'Remplis ta fiche de présentation : prénom, âge, nationalité et une phrase sur tes centres d\'intérêt (30 à 40 mots).',
        phrases: ["Je m'appelle...", "J'ai... ans.", 'Je suis...', "J'aime..."],
        dialogue: [
          { speaker: 'Modèle', line: "Je m'appelle Camila. J'ai seize ans. Je suis dominicaine et j'habite à Tours. J'aime la musique et la danse.", translation: 'Me llamo Camila. Tengo dieciséis años. Soy dominicana y vivo en Tours. Me gusta la música y el baile.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris ta fiche de présentation (30 à 40 mots) : prénom, âge, nationalité et centres d\'intérêt.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: "Avoir, s'appeler et la négation",
        description: 'Le verbe avoir, le verbe s\'appeler, les nationalités et la négation ne...pas.',
        grammarNote: "Le verbe avoir : j'ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont. On l'utilise pour l'âge : « J'ai seize ans. » Le verbe pronominal s'appeler : je m'appelle, tu t'appelles, il/elle s'appelle. Les nationalités s'écrivent en minuscule quand ce sont des adjectifs : je suis dominicaine, il est marocain. Pour poser des questions, on utilise comment (Comment tu t'appelles ?), où (Où habites-tu ?) et quel/quelle (Quel âge as-tu ?). La négation simple se forme avec ne...pas : « Je ne suis pas française. »",
        phrases: ["J'ai... ans.", "Je m'appelle...", 'Je ne suis pas...', 'Quel âge as-tu ?'],
        exercises: [
          { type: 'mcq', prompt: 'Tu ___ quinze ans.', options: ['ai', 'as', 'a', 'avons'], answer: 1 },
          { type: 'mcq', prompt: 'Elle ___ Léa.', options: ["m'appelle", "t'appelles", "s'appelle", "s'appellent"], answer: 2 },
          { type: 'mcq', prompt: 'Je ne ___ pas française.', options: ['suis', 'es', 'est', 'sommes'], answer: 0 },
          { type: 'mcq', prompt: '___ âge as-tu ?', options: ['Quel', 'Quelle', 'Comment', 'Où'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Les nationalités et les nombres',
        description: 'Vocabulaire des nationalités, des nombres et des centres d\'intérêt.',
        vocabulary: [
          { word: 'dominicain(e)', translation: 'dominicano/a', example: 'Camila est dominicaine.' },
          { word: 'français(e)', translation: 'francés/a', example: 'Léa est française.' },
          { word: 'marocain(e)', translation: 'marroquí', example: 'Karim est marocain.' },
          { word: "l'âge", translation: 'la edad', example: 'Quel âge as-tu ?' },
          { word: 'un, deux, trois', translation: 'uno, dos, tres', example: "J'ai un frère et deux sœurs." },
          { word: 'quinze', translation: 'quince', example: 'Karim a quinze ans.' },
          { word: 'seize', translation: 'dieciséis', example: 'Camila a seize ans.' },
          { word: 'la nationalité', translation: 'la nacionalidad', example: 'Quelle est ta nationalité ?' },
          { word: 'habiter', translation: 'vivir / habitar', example: "J'habite à Tours." },
          { word: 'né(e)', translation: 'nacido/a', example: 'Karim est né à Tours.' },
          { word: 'la langue', translation: 'el idioma', example: 'Karim parle trois langues.' },
          { word: 'le pays', translation: 'el país', example: "Quel est ton pays d'origine ?" },
          { word: "le centre d'intérêt", translation: 'el interés / la afición', example: "Mon centre d'intérêt, c'est la musique." },
          { word: 'aimer', translation: 'gustar / amar', example: "J'aime la danse." },
          { word: 'la fiche de présentation', translation: 'la ficha de presentación', example: 'Nous remplissons notre fiche de présentation.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « le pays » ?', options: ["L'idioma", 'El país', 'La edad', 'El interés'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « habiter » ?', options: ['Vivir', 'Hablar', 'Gustar', 'Nacer'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « né(e) » ?', options: ['Nacido/a', 'Vivido', 'Amado', 'Llamado'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: "À l'accueil",
        description: "Camila s'inscrit à l'accueil de l'école et répond à des questions personnelles.",
        intro: "Camila arrive à l'accueil de l'école pour s'inscrire. La secrétaire lui pose des questions personnelles.",
        dialogue: [
          { speaker: 'Secrétaire', line: "Bonjour ! Comment tu t'appelles ?", translation: 'Hola. ¿Cómo te llamas?' },
          { speaker: 'Camila', line: 'Je m\'appelle Camila Ramírez.', translation: 'Me llamo Camila Ramírez.' },
          { speaker: 'Secrétaire', line: 'Quel âge as-tu ?', translation: '¿Cuántos años tienes?' },
          { speaker: 'Camila', line: "J'ai seize ans.", translation: 'Tengo dieciséis años.' },
          { speaker: 'Secrétaire', line: "D'où viens-tu ?", translation: '¿De dónde vienes?' },
          { speaker: 'Camila', line: 'Je viens de République dominicaine.', translation: 'Vengo de República Dominicana.' },
          { speaker: 'Secrétaire', line: 'Parfait, merci. Bienvenue à l\'école !', translation: 'Perfecto, gracias. ¡Bienvenida a la escuela!' }
        ],
        phrases: ["Comment tu t'appelles ?", 'Quel âge as-tu ?', "D'où viens-tu ?", 'Je viens de...'],
        vocabulary: [
          { word: "l'accueil", translation: 'la recepción', example: "Je vais à l'accueil de l'école." }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Où se passe ce dialogue ?', options: ['Dans la classe', "À l'accueil de l'école", 'Chez Léa', 'Au café'], answer: 1 },
          { type: 'mcq', prompt: 'Quel âge dit Camila ?', options: ['Quinze ans', 'Seize ans', 'Dix-sept ans', 'Quatorze ans'], answer: 1 },
          { type: 'mcq', prompt: 'D\'où vient Camila ?', options: ['Du Maroc', 'De France', 'De République dominicaine', "D'Espagne"], answer: 2 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'ma-famille-et-mes-amis',
    title: 'Ma famille et mes amis',
    titleEs: 'Mi familia y mis amigos',
    description: "Camila présente sa famille de Saint-Domingue et sa famille d'accueil à Tours.",
    order: 3,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: "Ma famille et ma famille d'accueil",
        description: "Camila décrit sa famille dominicaine et sa famille d'accueil française, en trois parties.",
        reading: {
          title: "Ma famille et ma famille d'accueil",
          parts: [
            "Aujourd'hui, je vais vous présenter ma famille. À Saint-Domingue, j'habite avec mes parents et mon frère et ma sœur. Ma mère s'appelle Rosa. Elle est infirmière et elle est très patiente. Mon père s'appelle Miguel. Il est professeur de mathématiques. J'ai un petit frère, Diego. Il a dix ans et il adore le football. J'ai aussi une grande sœur, Sofía. Elle a dix-neuf ans et elle étudie à l'université. Ma famille me manque un peu, mais nous parlons par vidéo tous les dimanches.",
            "Ici, à Tours, j'habite avec ma famille d'accueil, la famille Lambert. Madame Lambert est la mère de Léa. Elle est architecte et elle est très accueillante. Monsieur Lambert est le père de Léa. Il est cuisinier dans un restaurant, alors les repas chez eux sont délicieux ! Léa est fille unique, donc elle est très contente d'avoir « une sœur » pendant cette année. Son chat s'appelle Minou et il dort toujours sur mon lit.",
            "Mes deux familles sont très différentes, mais toutes les deux sont importantes pour moi. Ma famille dominicaine me donne des racines, et ma famille d'accueil me donne un nouveau foyer. Léa dit souvent : « Ta famille est loin, mais ici, tu as aussi une famille. » J'aime cette phrase. Maintenant, j'ai deux familles et deux maisons, une à Saint-Domingue et une à Tours."
          ],
          questions: ["Comment s'appelle la mère de Camila ?", 'Qui est Madame Lambert ?', "Comment s'appelle le chat de Léa ?"],
          ordering: {
            prompt: 'Remets les événements de l\'histoire dans l\'ordre.',
            events: [
              'Camila présente sa famille de Saint-Domingue.',
              "Camila présente sa famille d'accueil à Tours.",
              'Camila compare ses deux familles.',
              "Léa dit à Camila qu'elle a aussi une famille à Tours."
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Comment s\'appelle le petit frère de Camila ?', options: ['Diego', 'Miguel', 'Karim', 'Léa'], answer: 0 },
          { type: 'mcq', prompt: 'Quel est le métier de Monsieur Lambert ?', options: ['Professeur', 'Infirmier', 'Cuisinier', 'Architecte'], answer: 2 },
          { type: 'mcq', prompt: 'Quel âge a Sofía, la sœur de Camila ?', options: ['Dix ans', 'Seize ans', 'Dix-neuf ans', 'Vingt ans'], answer: 2 },
          { type: 'mcq', prompt: 'Comment s\'appelle le chat de la famille Lambert ?', options: ['Minou', 'Diego', 'Rosa', 'Karim'], answer: 0 },
          { type: 'mcq', prompt: 'Vrai ou faux : Madame Lambert est infirmière.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Léa est fille unique.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Vrai ou faux : La famille de Camila lui manque un peu.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Choisis le bon mot : Madame Lambert est très ___, elle aime recevoir des invités.', options: ['accueillante', 'fâchée', 'fatiguée', 'triste'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Ma famille en photos',
        description: 'Camila montre à Léa une photo de sa famille dominicaine.',
        intro: 'Écoute Camila qui montre à Léa une photo de sa famille et lui présente chaque personne.',
        dialogue: [
          { speaker: 'Camila', line: 'Regarde, Léa ! Voici une photo de ma famille.', translation: 'Mira, Léa. Aquí hay una foto de mi familia.' },
          { speaker: 'Léa', line: 'Super ! Qui est-ce, à côté de toi ?', translation: '¡Genial! ¿Quién es, al lado tuyo?' },
          { speaker: 'Camila', line: "C'est ma mère, Rosa. Et lui, c'est mon père, Miguel.", translation: 'Es mi madre, Rosa. Y él es mi padre, Miguel.' },
          { speaker: 'Léa', line: 'Et ce petit garçon ?', translation: '¿Y este niño pequeño?' },
          { speaker: 'Camila', line: "C'est mon petit frère, Diego. Il a dix ans.", translation: 'Es mi hermanito, Diego. Tiene diez años.' },
          { speaker: 'Léa', line: "Ta famille a l'air très sympathique !", translation: '¡Tu familia parece muy simpática!' },
          { speaker: 'Camila', line: 'Merci ! Ta famille aussi est très gentille avec moi.', translation: '¡Gracias! Tu familia también es muy amable conmigo.' }
        ],
        phrases: ['Voici mon/ma...', "C'est mon/ma...", "Ta famille a l'air...", 'Mon petit frère / ma grande sœur'],
        exercises: [
          { type: 'mcq', prompt: 'Qui montre la photo ?', options: ['Léa', 'Camila', 'Karim', 'Madame Dubois'], answer: 1 },
          { type: 'mcq', prompt: 'Comment s\'appelle le père de Camila ?', options: ['Diego', 'Miguel', 'Karim', 'Minou'], answer: 1 },
          { type: 'mcq', prompt: 'Quel âge a Diego ?', options: ['Dix ans', 'Seize ans', 'Dix-neuf ans', 'Quinze ans'], answer: 0 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Présente ta famille',
        description: 'Décris à voix haute trois membres de ta famille.',
        mission: 'Décris trois membres de ta famille : qui ils sont, leur âge ou leur métier.',
        phrases: ['Mon père / ma mère...', 'Mon frère / ma sœur...', "Il/Elle s'appelle...", 'Il/Elle a... ans.'],
        dialogue: [
          { speaker: 'Toi', line: 'Voici ma mère. Elle s\'appelle...', translation: 'Esta es mi madre. Se llama...' },
          { speaker: 'Camarade', line: 'Et ton père, comment il s\'appelle ?', translation: 'Y tu padre, ¿cómo se llama?' },
          { speaker: 'Toi', line: 'Il s\'appelle... Il a... ans.', translation: 'Se llama... Tiene... años.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Décris à voix haute trois membres de ta famille.', answer: 'Oral practice' },
          { type: 'practice', prompt: "Montre une photo de ta famille (réelle ou imaginaire) à un(e) camarade et réponds à ses questions.", answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Décris ta famille',
        description: 'Écris une courte description de ta famille.',
        mission: 'Décris ta famille en 30 à 40 mots : qui sont les membres, leur âge et une qualité de chacun.',
        phrases: ['Mon père/ma mère est...', 'Mon frère/ma sœur a... ans.', 'Il/Elle est...'],
        dialogue: [
          { speaker: 'Modèle', line: "Ma mère s'appelle Rosa. Elle est infirmière et très patiente. Mon petit frère, Diego, a dix ans et il adore le football.", translation: 'Mi madre se llama Rosa. Es enfermera y muy paciente. Mi hermanito, Diego, tiene diez años y adora el fútbol.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris une description de ta famille (30 à 40 mots) avec au moins deux adjectifs possessifs.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Les adjectifs possessifs',
        description: 'Mon/ma/mes, ton/ta/tes, son/sa/ses et l\'accord des adjectifs.',
        grammarNote: "Les adjectifs possessifs s'accordent avec la chose possédée, pas avec la personne qui possède. Pour « je » : mon frère, ma sœur, mes parents. Pour « tu » : ton frère, ta sœur, tes parents. Pour « il/elle » : son frère, sa sœur, ses parents. Devant un mot féminin qui commence par une voyelle, on utilise mon/ton/son : mon amie (et non « ma amie »). Les adjectifs s'accordent aussi en genre et en nombre : il est patient / elle est patiente ; ils sont gentils / elles sont gentilles.",
        phrases: ['Mon/ma/mes...', 'Ton/ta/tes...', 'Son/sa/ses...', 'Il est... / Elle est...'],
        exercises: [
          { type: 'mcq', prompt: '___ mère s\'appelle Rosa.', options: ['Mon', 'Ma', 'Mes', 'Ton'], answer: 1 },
          { type: 'mcq', prompt: 'Léa aime beaucoup ___ chat.', options: ['son', 'sa', 'ses', 'ton'], answer: 0 },
          { type: 'mcq', prompt: 'Camila adore ___ parents.', options: ['mon', 'ma', 'mes', 'ses'], answer: 2 },
          { type: 'mcq', prompt: 'Madame Lambert est très ___.', options: ['patient', 'patiente', 'patients', 'patientes'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'La famille',
        description: 'Vocabulaire pour parler de la famille.',
        vocabulary: [
          { word: 'la mère', translation: 'la madre', example: 'Ma mère est infirmière.' },
          { word: 'le père', translation: 'el padre', example: 'Mon père est professeur.' },
          { word: 'le frère', translation: 'el hermano', example: "J'ai un petit frère." },
          { word: 'la sœur', translation: 'la hermana', example: "J'ai une grande sœur." },
          { word: 'les parents', translation: 'los padres', example: 'Mes parents habitent à Saint-Domingue.' },
          { word: 'le petit frère / la petite sœur', translation: 'el hermanito / la hermanita', example: 'Mon petit frère a dix ans.' },
          { word: 'la grande sœur / le grand frère', translation: 'la hermana mayor / el hermano mayor', example: 'Ma grande sœur étudie à l\'université.' },
          { word: "la famille d'accueil", translation: 'la familia de acogida', example: "J'habite avec ma famille d'accueil." },
          { word: 'le chat / le chien', translation: 'el gato / el perro', example: 'Le chat de Léa dort sur mon lit.' },
          { word: 'fille unique / fils unique', translation: 'hija única / hijo único', example: 'Léa est fille unique.' },
          { word: 'accueillant(e)', translation: 'acogedor/a', example: 'Madame Lambert est très accueillante.' },
          { word: 'le métier', translation: 'la profesión', example: 'Quel est ton métier ?' },
          { word: 'infirmier / infirmière', translation: 'enfermero/a', example: 'Rosa est infirmière.' },
          { word: 'cuisinier / cuisinière', translation: 'cocinero/a', example: 'Monsieur Lambert est cuisinier.' },
          { word: 'gentil / gentille', translation: 'amable', example: 'Léa est très gentille.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « la sœur » ?', options: ['El hermano', 'La hermana', 'La madre', 'El padre'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « accueillant(e) » ?', options: ['Acogedor/a', 'Enojado/a', 'Cansado/a', 'Triste'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « fille unique » ?', options: ['Hija mayor', 'Hija única', 'Hija menor', 'Hija de acogida'], answer: 1 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Voici ma famille',
        description: "Karim visite la famille d'accueil de Camila pour la première fois.",
        intro: "Karim vient chez la famille Lambert pour la première fois. Camila lui présente tout le monde.",
        dialogue: [
          { speaker: 'Camila', line: "Karim, voici ma famille d'accueil ! Voici Madame Lambert.", translation: 'Karim, esta es mi familia de acogida. Esta es la señora Lambert.' },
          { speaker: 'Karim', line: 'Bonjour, Madame Lambert. Enchanté.', translation: 'Hola, señora Lambert. Encantado.' },
          { speaker: 'Madame Lambert', line: 'Enchantée, Karim ! Bienvenue chez nous.', translation: 'Encantada, Karim. Bienvenido a nuestra casa.' },
          { speaker: 'Camila', line: "Et voici Léa, ma sœur d'accueil.", translation: 'Y esta es Léa, mi hermana de acogida.' },
          { speaker: 'Karim', line: "Salut, Léa ! On se connaît déjà, de l'école.", translation: '¡Hola, Léa! Ya nos conocemos, de la escuela.' },
          { speaker: 'Léa', line: "Bien sûr ! Entre, Karim, installe-toi.", translation: 'Claro. Entra, Karim, ponte cómodo.' }
        ],
        phrases: ['Voici ma famille...', "Ma sœur d'accueil", 'Bienvenue chez nous.', 'Enchanté(e).'],
        vocabulary: [
          { word: "la famille d'accueil", translation: 'la familia de acogida', example: "Voici ma famille d'accueil." }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Qui vient chez la famille Lambert ?', options: ['Madame Dubois', 'Karim', 'Sofía', 'Diego'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila appelle Léa ?', options: ['Ma cousine', "Ma sœur d'accueil", 'Ma professeure', 'Ma voisine'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit Madame Lambert pour accueillir Karim ?', options: ['Au revoir', 'Bienvenue chez nous', 'Comment ça va', 'À bientôt'], answer: 1 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'a-l-ecole',
    title: "À l'école",
    titleEs: 'En la escuela',
    description: 'Karim fait visiter le collège de Tours à Camila.',
    order: 4,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'Mon emploi du temps',
        description: 'Karim fait découvrir le collège de Tours à Camila, en trois parties.',
        reading: {
          title: 'Mon emploi du temps',
          parts: [
            "Le collège de Tours est très différent de mon ancienne école à Saint-Domingue. Il y a une grande cour, une bibliothèque, un gymnase et une cantine. Karim me fait visiter le collège pendant la pause. « Regarde, dans cette salle, il y a un tableau, des tables et des chaises pour trente élèves », dit-il. Sur mon bureau, j'ai un cahier, un stylo, une trousse et un livre de français. Dans mon sac, il y a aussi une calculatrice pour les cours de mathématiques.",
            "Après la visite, nous allons à la bibliothèque. « Il y a beaucoup de livres ici, » dit Karim, « et un ordinateur pour chercher des informations. » Je vois une affiche avec l'emploi du temps de la semaine. Le lundi, il y a français, mathématiques et sport. Le mercredi après-midi, il n'y a pas de cours ; c'est libre pour les activités. Karim me demande : « Tu as combien de cours par jour ? » Je réponds : « Ici, j'ai six cours, comme toi ! »",
            "À la fin de la journée, je retourne dans la salle de classe pour prendre mon sac. Madame Dubois pose une question à la classe : « Qu'est-ce qu'il y a dans une trousse ? » Les élèves répondent : « Un stylo, un crayon, une gomme et une règle ! » Je souris, parce que maintenant je connais bien le vocabulaire de l'école. Ce collège commence à devenir ma deuxième maison."
          ],
          questions: ["Qu'est-ce qu'il y a à la bibliothèque du collège ?", 'Qu\'est-ce que Camila a sur son bureau ?', 'Combien de cours a Camila par jour ?'],
          ordering: {
            prompt: 'Remets les événements de l\'histoire dans l\'ordre.',
            events: [
              'Karim fait visiter le collège à Camila.',
              'Ils vont à la bibliothèque.',
              "Camila regarde l'emploi du temps.",
              'Madame Dubois pose une question sur la trousse.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Qui fait visiter le collège à Camila ?', options: ['Madame Dubois', 'Karim', 'Léa', 'Monsieur Lambert'], answer: 1 },
          { type: 'mcq', prompt: "Qu'est-ce qu'il y a à la bibliothèque ?", options: ['Un terrain de foot', 'Des livres et un ordinateur', 'Une cuisine', 'Un jardin'], answer: 1 },
          { type: 'mcq', prompt: "Quel jour n'y a-t-il pas de cours l'après-midi ?", options: ['Le lundi', 'Le mercredi', 'Le vendredi', 'Le dimanche'], answer: 1 },
          { type: 'mcq', prompt: 'Combien de cours Camila a-t-elle par jour ?', options: ['Quatre', 'Cinq', 'Six', 'Sept'], answer: 2 },
          { type: 'mcq', prompt: 'Vrai ou faux : Il y a un gymnase dans le collège.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila a une calculatrice dans son sac.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: "Vrai ou faux : Il y a cours le mercredi après-midi.", options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: "Choisis le bon mot : Dans une trousse, il y a un stylo, un crayon, une gomme et une ___.", options: ['règle', 'chaise', 'cantine', 'bibliothèque'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Qu\'est-ce qu\'il y a dans ton sac ?',
        description: 'Léa et Camila comparent le contenu de leur sac de classe.',
        intro: "Écoute Léa et Camila qui parlent de ce qu'il y a dans leur sac de classe.",
        dialogue: [
          { speaker: 'Léa', line: "Qu'est-ce qu'il y a dans ton sac, Camila ?", translation: '¿Qué hay en tu mochila, Camila?' },
          { speaker: 'Camila', line: 'Il y a un cahier, un stylo et une trousse.', translation: 'Hay un cuaderno, un bolígrafo y un estuche.' },
          { speaker: 'Léa', line: 'Tu as une calculatrice aussi ?', translation: '¿Tienes también una calculadora?' },
          { speaker: 'Camila', line: "Oui, j'ai une calculatrice pour les mathématiques.", translation: 'Sí, tengo una calculadora para matemáticas.' },
          { speaker: 'Léa', line: "Moi, j'ai aussi un livre de sciences.", translation: 'Yo también tengo un libro de ciencias.' },
          { speaker: 'Camila', line: "Il y a combien de cours aujourd'hui ?", translation: '¿Cuántas clases hay hoy?' },
          { speaker: 'Léa', line: "Il y a six cours, comme d'habitude.", translation: 'Hay seis clases, como siempre.' }
        ],
        phrases: ["Qu'est-ce qu'il y a dans...", 'Il y a...', 'Tu as... ?', 'Combien de... ?'],
        exercises: [
          { type: 'mcq', prompt: 'Qu\'est-ce qu\'il y a dans le sac de Camila ?', options: ['Un ballon', 'Un cahier, un stylo et une trousse', 'Une raquette', 'Un téléphone'], answer: 1 },
          { type: 'mcq', prompt: 'Qu\'est-ce que Léa a en plus ?', options: ['Une calculatrice', 'Un livre de sciences', 'Un dictionnaire', 'Un cahier de musique'], answer: 1 },
          { type: 'mcq', prompt: "Combien de cours y a-t-il aujourd'hui ?", options: ['Quatre', 'Cinq', 'Six', 'Sept'], answer: 2 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Qu\'est-ce qu\'il y a dans ta trousse ?',
        description: "Décris à voix haute le contenu de ton sac ou de ta trousse.",
        mission: "Décris à voix haute ce qu'il y a dans ton sac ou ta trousse, en utilisant « il y a ».",
        phrases: ["Il y a...", "Dans mon sac, il y a...", "J'ai aussi..."],
        dialogue: [
          { speaker: 'Toi', line: 'Dans ma trousse, il y a un stylo et un crayon.', translation: 'En mi estuche hay un bolígrafo y un lápiz.' },
          { speaker: 'Camarade', line: 'Et dans ton sac, qu\'est-ce qu\'il y a ?', translation: '¿Y en tu mochila, qué hay?' },
          { speaker: 'Toi', line: 'Il y a un cahier, un livre et une calculatrice.', translation: 'Hay un cuaderno, un libro y una calculadora.' }
        ],
        exercises: [
          { type: 'speaking', prompt: "Décris à voix haute ce qu'il y a dans ton sac ou ta trousse.", answer: 'Oral practice' },
          { type: 'practice', prompt: 'Compare le contenu de ton sac avec celui d\'un(e) camarade.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Décris ta salle de classe',
        description: 'Écris une courte description de ta salle de classe ou de ton emploi du temps.',
        mission: 'Décris ta salle de classe ou ton emploi du temps en 30 à 40 mots, avec « il y a ».',
        phrases: ['Il y a...', "Dans ma salle de classe...", 'Le lundi, il y a...'],
        dialogue: [
          { speaker: 'Modèle', line: "Dans ma salle de classe, il y a vingt-cinq tables et un grand tableau. Le lundi, il y a français, mathématiques et sport.", translation: 'En mi salón de clase hay veinticinco mesas y una gran pizarra. Los lunes hay francés, matemáticas y deporte.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Décris ta salle de classe ou ton emploi du temps (30 à 40 mots) avec « il y a ».', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Les articles et il y a',
        description: "Les articles indéfinis, définis et l'expression il y a.",
        grammarNote: "Les articles indéfinis un (masculin), une (féminin), des (pluriel) présentent une chose non précisée : un cahier, une trousse, des livres. Les articles définis le (masculin), la (féminin), l' (devant une voyelle), les (pluriel) désignent une chose précise : le tableau, la cantine, l'école, les élèves. L'expression il y a sert à dire ce qui existe : « Il y a un tableau dans la salle. » « Il y a trente élèves. » À la forme négative, on dit il n'y a pas de : « Il n'y a pas de cours le mercredi après-midi. »",
        phrases: ['Il y a...', "Il n'y a pas de...", 'Un/une/des...', "Le/la/l'/les..."],
        exercises: [
          { type: 'mcq', prompt: 'Il y a ___ tableau dans la salle.', options: ['un', 'une', 'des', 'le'], answer: 0 },
          { type: 'mcq', prompt: '___ bibliothèque du collège est grande.', options: ['Le', 'La', 'Les', 'Un'], answer: 1 },
          { type: 'mcq', prompt: 'Dans mon sac, il y a ___ livres.', options: ['un', 'une', 'des', 'le'], answer: 2 },
          { type: 'mcq', prompt: "Le mercredi après-midi, il ___ pas de cours.", options: ['a', 'y a', "n'y a", 'est'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: "L'école et la salle de classe",
        description: "Vocabulaire de l'école et des fournitures scolaires.",
        vocabulary: [
          { word: 'le cahier', translation: 'el cuaderno', example: "J'ai un cahier de français." },
          { word: 'le stylo', translation: 'el bolígrafo', example: 'Karim a un stylo bleu.' },
          { word: 'le crayon', translation: 'el lápiz', example: 'J\'écris avec un crayon.' },
          { word: 'la trousse', translation: 'el estuche', example: 'Ma trousse est verte.' },
          { word: 'la gomme', translation: 'la goma de borrar', example: 'Léa a une gomme rose.' },
          { word: 'la règle', translation: 'la regla', example: "J'utilise une règle pour dessiner." },
          { word: 'le tableau', translation: 'la pizarra', example: 'Le tableau est grand.' },
          { word: 'la table / la chaise', translation: 'la mesa / la silla', example: 'Il y a trente tables et chaises.' },
          { word: 'le sac', translation: 'la mochila', example: 'Mon sac est lourd.' },
          { word: 'le livre', translation: 'el libro', example: "J'ai un livre de français." },
          { word: 'la calculatrice', translation: 'la calculadora', example: "J'utilise ma calculatrice en mathématiques." },
          { word: 'la bibliothèque', translation: 'la biblioteca', example: 'La bibliothèque a beaucoup de livres.' },
          { word: 'la cour', translation: 'el patio', example: 'La cour du collège est grande.' },
          { word: 'la cantine', translation: 'el comedor escolar', example: 'Nous mangeons à la cantine.' },
          { word: "l'emploi du temps", translation: 'el horario', example: "L'emploi du temps est affiché dans la classe." }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « le cahier » ?', options: ['El cuaderno', 'El lápiz', 'La mesa', 'El libro'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « la cantine » ?', options: ['La biblioteca', 'El comedor escolar', 'El patio', 'El horario'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « l\'emploi du temps » ?', options: ['El horario', 'El estuche', 'La regla', 'La goma'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Dans la classe',
        description: 'Madame Dubois pose des questions à la classe pour pratiquer le vocabulaire scolaire.',
        intro: 'Madame Dubois pose des questions simples à la classe pour pratiquer le vocabulaire scolaire.',
        dialogue: [
          { speaker: 'Madame Dubois', line: 'Qui a un stylo bleu ?', translation: '¿Quién tiene un bolígrafo azul?' },
          { speaker: 'Karim', line: "Moi, madame ! J'ai un stylo bleu.", translation: '¡Yo, señora! Tengo un bolígrafo azul.' },
          { speaker: 'Madame Dubois', line: "Merci, Karim. Camila, qu'est-ce qu'il y a sur ton bureau ?", translation: 'Gracias, Karim. Camila, ¿qué hay en tu escritorio?' },
          { speaker: 'Camila', line: 'Il y a un cahier, un livre et une trousse.', translation: 'Hay un cuaderno, un libro y un estuche.' },
          { speaker: 'Madame Dubois', line: 'Très bien ! Léa, tu as une gomme ?', translation: '¡Muy bien! Léa, ¿tienes una goma de borrar?' },
          { speaker: 'Léa', line: 'Oui, madame, voici ma gomme.', translation: 'Sí, señora, aquí está mi goma.' }
        ],
        phrases: ['Qui a... ?', "J'ai...", "Qu'est-ce qu'il y a sur... ?", 'Voici ma/mon...'],
        exercises: [
          { type: 'mcq', prompt: 'Qui a un stylo bleu ?', options: ['Léa', 'Karim', 'Camila', 'Madame Dubois'], answer: 1 },
          { type: 'mcq', prompt: 'Qu\'est-ce qu\'il y a sur le bureau de Camila ?', options: ['Un ballon', 'Un cahier, un livre et une trousse', 'Une calculatrice seulement', 'Rien'], answer: 1 },
          { type: 'mcq', prompt: 'Qu\'est-ce que Léa montre à la professeure ?', options: ['Un stylo', 'Une gomme', 'Un livre', 'Une règle'], answer: 1 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'ma-journee',
    title: 'Ma journée',
    titleEs: 'Mi día',
    description: "La routine quotidienne de Camila chez la famille Lambert.",
    order: 5,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'Ma journée à Tours',
        description: "Camila décrit sa routine quotidienne, du réveil au coucher, en trois parties.",
        reading: {
          title: 'Ma journée à Tours',
          parts: [
            "Ma journée à Tours commence tôt. Je me réveille à six heures et demie. Je me lève tout de suite, parce que j'aime avoir du temps le matin. Je me lave et je m'habille rapidement. Ensuite, je descends dans la cuisine pour prendre le petit-déjeuner avec la famille Lambert. Madame Lambert prépare toujours du pain, du beurre et de la confiture. Je mange avec Léa et nous parlons un peu en français. À sept heures et demie, nous partons pour le collège, à pied, parce que l'école n'est pas loin de la maison.",
            "Les cours commencent à huit heures et finissent à seize heures trente. Entre les cours, il y a une pause de dix minutes. À midi, je mange à la cantine avec Karim et Léa. Nous parlons souvent de nos activités préférées. Après les cours, je rentre à la maison avec Léa. Je fais mes devoirs pendant une heure, puis je me repose un peu. Le soir, je dîne avec la famille Lambert, et parfois, j'aide Madame Lambert à préparer le repas.",
            "Avant de dormir, j'écris toujours quelques lignes dans mon journal, en français. J'écris sur ma journée, mes émotions et mes progrès. Je me couche généralement à vingt-deux heures, parce que je me lève tôt le lendemain. Ma routine à Tours est différente de ma routine à Saint-Domingue, mais je commence à m'habituer. Chaque jour, j'apprends un peu plus de français, et chaque jour, je me sens un peu plus chez moi."
          ],
          questions: ['À quelle heure Camila se réveille-t-elle ?', 'Où mange-t-elle à midi ?', 'Que fait Camila avant de dormir ?'],
          ordering: {
            prompt: "Remets les événements de l'histoire dans l'ordre.",
            events: [
              'Camila se réveille et se lève.',
              'Elle prend le petit-déjeuner avec la famille Lambert.',
              'Elle mange à la cantine avec Karim et Léa.',
              'Elle écrit dans son journal avant de dormir.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'À quelle heure Camila se réveille-t-elle ?', options: ['Six heures et demie', 'Sept heures', 'Huit heures', 'Neuf heures'], answer: 0 },
          { type: 'mcq', prompt: 'Qui prépare le petit-déjeuner ?', options: ['Léa', 'Madame Lambert', 'Camila', 'Karim'], answer: 1 },
          { type: 'mcq', prompt: 'Avec qui Camila mange-t-elle à la cantine ?', options: ['Seule', 'Karim et Léa', 'Madame Dubois', 'Sofía'], answer: 1 },
          { type: 'mcq', prompt: 'Que fait Camila avant de dormir ?', options: ['Elle regarde la télévision', 'Elle écrit dans son journal', 'Elle téléphone à sa mère', 'Elle fait du sport'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila va au collège en voiture.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Les cours finissent à seize heures trente.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila se couche à minuit.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Choisis le bon mot : Le soir, Camila ___ avec la famille Lambert.', options: ['dîne', 'se lève', "s'habille", 'se réveille'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Une journée typique',
        description: 'Léa demande à Camila de décrire sa routine quotidienne.',
        intro: 'Écoute Léa qui pose des questions à Camila sur sa routine quotidienne.',
        dialogue: [
          { speaker: 'Léa', line: 'À quelle heure tu te réveilles, Camila ?', translation: '¿A qué hora te despiertas, Camila?' },
          { speaker: 'Camila', line: 'Je me réveille à six heures et demie.', translation: 'Me despierto a las seis y media.' },
          { speaker: 'Léa', line: 'Tu te lèves tout de suite ?', translation: '¿Te levantas de inmediato?' },
          { speaker: 'Camila', line: "Oui, je me lève, je me lave et je m'habille rapidement.", translation: 'Sí, me levanto, me lavo y me visto rápidamente.' },
          { speaker: 'Léa', line: "Et après, qu'est-ce que tu fais ?", translation: '¿Y después, qué haces?' },
          { speaker: 'Camila', line: 'Je prends le petit-déjeuner, puis je pars pour le collège.', translation: 'Tomo el desayuno, luego salgo hacia el colegio.' }
        ],
        phrases: ['Je me réveille à...', 'Je me lève.', "Je m'habille.", 'Je pars pour...'],
        exercises: [
          { type: 'mcq', prompt: 'À quelle heure Camila se réveille-t-elle ?', options: ['Six heures', 'Six heures et demie', 'Sept heures', 'Huit heures'], answer: 1 },
          { type: 'mcq', prompt: "Que fait Camila après s'être levée ?", options: ["Elle se lave et s'habille", 'Elle regarde la télévision', 'Elle dort encore', 'Elle fait du sport'], answer: 0 },
          { type: 'mcq', prompt: 'Où va Camila après le petit-déjeuner ?', options: ['Au parc', 'Au collège', 'À la bibliothèque', 'Chez Karim'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Raconte ta journée',
        description: 'Décris ta routine quotidienne à voix haute.',
        mission: 'Décris ta routine quotidienne à voix haute, du réveil au coucher.',
        phrases: ['Je me réveille à...', 'Je me lève.', 'Je vais à...', 'Je me couche à...'],
        dialogue: [
          { speaker: 'Toi', line: 'Je me réveille à... Je me lève tout de suite.', translation: 'Me despierto a las... Me levanto enseguida.' },
          { speaker: 'Camarade', line: 'Et à quelle heure tu te couches ?', translation: '¿Y a qué hora te acuestas?' },
          { speaker: 'Toi', line: 'Je me couche à... heures.', translation: 'Me acuesto a las... horas.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Décris ta routine quotidienne à voix haute, du réveil au coucher.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Compare ta routine avec celle d\'un(e) camarade.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Écris ta routine quotidienne',
        description: 'Écris ta journée typique.',
        mission: 'Décris ta journée typique en 40 à 50 mots, avec au moins trois verbes pronominaux.',
        phrases: ['Je me réveille...', 'Je me lave...', "Je m'habille...", 'Je me couche...'],
        dialogue: [
          { speaker: 'Modèle', line: "Je me réveille à sept heures. Je me lave et je m'habille. Puis je vais à l'école avec mes amis.", translation: 'Me despierto a las siete. Me lavo y me visto. Luego voy a la escuela con mis amigos.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Décris ta journée typique (40 à 50 mots) avec au moins trois verbes pronominaux.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Les verbes en -er et les verbes pronominaux',
        description: 'La conjugaison des verbes réguliers en -er et des verbes pronominaux.',
        grammarNote: "Les verbes réguliers en -er suivent un modèle : parler → je parle, tu parles, il/elle parle, nous parlons, vous parlez, ils/elles parlent. Les verbes pronominaux ont un pronom réfléchi devant le verbe : se lever (je me lève, tu te lèves, il/elle se lève), se laver (je me lave), s'habiller (je m'habille). Les adverbes de fréquence précisent une habitude : toujours, souvent, parfois, rarement, jamais. Exemple : « Je me lève toujours à six heures et demie. »",
        phrases: ['Je me lève...', "Je m'habille...", 'Toujours / souvent / parfois / jamais'],
        exercises: [
          { type: 'mcq', prompt: 'Je ___ à six heures et demie.', options: ['me lève', 'te lèves', 'se lève', 'nous levons'], answer: 0 },
          { type: 'mcq', prompt: 'Léa ___ rapidement le matin.', options: ["m'habille", "t'habilles", "s'habille", "s'habillent"], answer: 2 },
          { type: 'mcq', prompt: 'Nous ___ français en classe.', options: ['parle', 'parles', 'parlons', 'parlent'], answer: 2 },
          { type: 'mcq', prompt: 'Camila mange ___ à la cantine avec ses amis.', options: ['jamais', 'souvent', 'rarement', 'personne'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'La routine quotidienne',
        description: 'Vocabulaire pour décrire une journée typique.',
        vocabulary: [
          { word: 'se réveiller', translation: 'despertarse', example: 'Je me réveille à six heures et demie.' },
          { word: 'se lever', translation: 'levantarse', example: 'Je me lève tout de suite.' },
          { word: 'se laver', translation: 'lavarse', example: 'Je me lave rapidement.' },
          { word: "s'habiller", translation: 'vestirse', example: "Je m'habille avant le petit-déjeuner." },
          { word: 'le petit-déjeuner', translation: 'el desayuno', example: 'Je prends le petit-déjeuner à sept heures.' },
          { word: 'dîner', translation: 'cenar', example: 'Nous dînons ensemble le soir.' },
          { word: 'faire les devoirs', translation: 'hacer la tarea', example: 'Je fais mes devoirs après les cours.' },
          { word: 'se reposer', translation: 'descansar', example: "Je me repose un peu l'après-midi." },
          { word: 'se coucher', translation: 'acostarse', example: 'Je me couche à vingt-deux heures.' },
          { word: 'tôt / tard', translation: 'temprano / tarde', example: 'Je me lève tôt.' },
          { word: 'toujours', translation: 'siempre', example: 'Je me lève toujours à la même heure.' },
          { word: 'souvent', translation: 'a menudo', example: 'Je mange souvent à la cantine.' },
          { word: 'parfois', translation: 'a veces', example: "Parfois, j'aide Madame Lambert."},
          { word: 'rarement', translation: 'rara vez', example: 'Je me couche rarement tard.' },
          { word: 'jamais', translation: 'nunca', example: 'Je ne suis jamais en retard.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « se coucher » ?', options: ['Levantarse', 'Acostarse', 'Vestirse', 'Lavarse'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « souvent » ?', options: ['Nunca', 'A menudo', 'Rara vez', 'Siempre'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « faire les devoirs » ?', options: ['Hacer la tarea', 'Descansar', 'Cenar', 'Despertarse'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Ma journée',
        description: 'Karim demande à Camila comment se passe sa journée chez la famille Lambert.',
        intro: 'Karim demande à Camila comment se passe sa journée chez la famille Lambert.',
        dialogue: [
          { speaker: 'Karim', line: 'Comment se passe ta journée chez la famille Lambert ?', translation: '¿Cómo es tu día en casa de la familia Lambert?' },
          { speaker: 'Camila', line: 'Je me réveille tôt et je prends le petit-déjeuner avec Léa.', translation: 'Me despierto temprano y desayuno con Léa.' },
          { speaker: 'Karim', line: 'Vous venez au collège à pied ?', translation: '¿Vienen al colegio a pie?' },
          { speaker: 'Camila', line: 'Oui, nous marchons ensemble tous les matins.', translation: 'Sí, caminamos juntas todas las mañanas.' },
          { speaker: 'Karim', line: "Et le soir, qu'est-ce que tu fais ?", translation: '¿Y por la noche, qué haces?' },
          { speaker: 'Camila', line: 'Je fais mes devoirs, puis je dîne avec la famille.', translation: 'Hago mis tareas, luego ceno con la familia.' }
        ],
        phrases: ['Comment se passe ta journée ?', 'Je me réveille...', 'Nous marchons ensemble.', 'Je fais mes devoirs.'],
        exercises: [
          { type: 'mcq', prompt: 'Avec qui Camila prend-elle le petit-déjeuner ?', options: ['Karim', 'Léa', 'Madame Dubois', 'Sofía'], answer: 1 },
          { type: 'mcq', prompt: 'Comment vont-elles au collège ?', options: ['En voiture', 'En bus', 'À pied', 'À vélo'], answer: 2 },
          { type: 'mcq', prompt: 'Que fait Camila avant le dîner ?', options: ['Elle dort', 'Elle fait ses devoirs', 'Elle regarde la télévision', 'Elle joue au football'], answer: 1 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'l-heure-et-les-dates',
    title: "L'heure et les dates",
    titleEs: 'La hora y las fechas',
    description: "Camila et Karim organisent une fête surprise pour l'anniversaire de Léa.",
    order: 6,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: "L'anniversaire de Léa",
        description: "Camila et Karim préparent une fête surprise, en trois parties.",
        reading: {
          title: "L'anniversaire de Léa",
          parts: [
            "Le quinze octobre, c'est l'anniversaire de Léa. Elle va avoir seize ans. Avec Karim, nous décidons d'organiser une petite fête surprise. La fête commence à dix-huit heures, chez la famille Lambert, mais Léa ne le sait pas encore ! Nous devons tout préparer avant son retour du collège. Karim s'occupe de la musique, et moi, je m'occupe des décorations et du gâteau.",
            "Madame Lambert nous aide à organiser l'emploi du temps de la journée. « Léa rentre du collège à seize heures trente, » dit-elle. « Vous avez deux heures pour tout préparer. » Nous accrochons des ballons dans le salon et nous préparons un gâteau au chocolat. À dix-sept heures quarante-cinq, les premiers invités arrivent : trois camarades de classe. Tout le monde se cache derrière le canapé pour la surprise.",
            "À dix-huit heures précises, la porte s'ouvre. Léa entre, fatiguée après sa journée. Tout le monde crie : « Joyeux anniversaire ! » Léa est très surprise et très heureuse. « Merci beaucoup ! Quelle belle surprise ! » dit-elle en riant. Nous mangeons le gâteau, nous dansons et nous parlons jusqu'à vingt et une heures. C'est le premier anniversaire de Léa que je célèbre avec elle, et c'est un moment inoubliable."
          ],
          questions: ["Quelle est la date de l'anniversaire de Léa ?", 'À quelle heure commence la fête ?', 'Qui organise la fête avec Camila ?'],
          ordering: {
            prompt: "Remets les événements de l'histoire dans l'ordre.",
            events: [
              "Camila et Karim décident d'organiser une fête surprise.",
              'Ils préparent les décorations et le gâteau.',
              'Les invités arrivent et se cachent.',
              "Léa arrive et tout le monde crie « Joyeux anniversaire ! »"
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: "Quelle est la date de l'anniversaire de Léa ?", options: ['Le premier octobre', 'Le quinze octobre', 'Le vingt octobre', 'Le quinze novembre'], answer: 1 },
          { type: 'mcq', prompt: 'Quel âge va avoir Léa ?', options: ['Quinze ans', 'Seize ans', 'Dix-sept ans', 'Dix-huit ans'], answer: 1 },
          { type: 'mcq', prompt: 'À quelle heure Léa rentre-t-elle du collège ?', options: ['Seize heures', 'Seize heures trente', 'Dix-sept heures', 'Dix-huit heures'], answer: 1 },
          { type: 'mcq', prompt: 'Qui s\'occupe de la musique ?', options: ['Camila', 'Karim', 'Madame Lambert', 'Léa'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : La fête commence à dix-huit heures.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Vrai ou faux : Léa sait qu\'il y a une fête surprise.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Ils mangent un gâteau au chocolat.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Choisis le bon mot : Quand Léa arrive, tout le monde ___ : « Joyeux anniversaire ! »', options: ['crie', 'dort', 'pleure', 'part'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Le programme de la semaine',
        description: 'Karim et Camila organisent les derniers détails de la fête.',
        intro: 'Écoute Karim et Camila qui parlent des jours et des heures pour organiser la fête.',
        dialogue: [
          { speaker: 'Karim', line: 'Quel jour sommes-nous aujourd\'hui ?', translation: '¿Qué día es hoy?' },
          { speaker: 'Camila', line: 'Nous sommes mardi, le douze octobre.', translation: 'Es martes, doce de octubre.' },
          { speaker: 'Karim', line: 'La fête est vendredi, non ?', translation: '¿La fiesta es el viernes, no?' },
          { speaker: 'Camila', line: 'Non, elle est samedi, le quinze octobre, à dix-huit heures.', translation: 'No, es el sábado, quince de octubre, a las seis de la tarde.' },
          { speaker: 'Karim', line: "D'accord ! Je peux venir à dix-sept heures pour aider ?", translation: 'De acuerdo. ¿Puedo venir a las cinco para ayudar?' },
          { speaker: 'Camila', line: 'Parfait, merci beaucoup, Karim !', translation: '¡Perfecto, muchas gracias, Karim!' }
        ],
        phrases: ['Quel jour sommes-nous ?', 'Nous sommes...', 'À quelle heure... ?', 'Le douze octobre'],
        exercises: [
          { type: 'mcq', prompt: 'Quel jour est la conversation ?', options: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi'], answer: 1 },
          { type: 'mcq', prompt: 'Quel jour est la fête ?', options: ['Vendredi', 'Samedi', 'Dimanche', 'Mercredi'], answer: 1 },
          { type: 'mcq', prompt: 'À quelle heure Karim propose-t-il de venir ?', options: ['Seize heures', 'Dix-sept heures', 'Dix-huit heures', 'Dix-neuf heures'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Organise ton emploi du temps',
        description: 'Décris à voix haute ton emploi du temps de la semaine.',
        mission: "Dis à voix haute ton emploi du temps de la semaine : quel jour et à quelle heure tu fais tes activités.",
        phrases: ['Le lundi, je...', 'À quelle heure... ?', 'Il est... heures.'],
        dialogue: [
          { speaker: 'Toi', line: 'Le lundi, je vais au collège à huit heures.', translation: 'Los lunes, voy al colegio a las ocho.' },
          { speaker: 'Camarade', line: 'Et le mercredi, à quelle heure finit ta journée ?', translation: 'Y el miércoles, ¿a qué hora termina tu día?' },
          { speaker: 'Toi', line: 'Elle finit à midi.', translation: 'Termina al mediodía.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Dis à voix haute ton emploi du temps de la semaine.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Demande à un(e) camarade à quelle heure il/elle fait trois activités de sa semaine.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Planifie une semaine',
        description: 'Écris ton emploi du temps de la semaine.',
        mission: "Écris ton emploi du temps de la semaine (40 à 50 mots) avec les jours, les heures et les activités.",
        phrases: ['Le lundi...', 'À... heures...', "Le week-end..."],
        dialogue: [
          { speaker: 'Modèle', line: "Le lundi, j'ai français à huit heures. Le mercredi après-midi, je joue au football avec Karim. Le week-end, je me repose.", translation: 'Los lunes tengo francés a las ocho. Los miércoles por la tarde juego al fútbol con Karim. El fin de semana, descanso.' }
        ],
        exercises: [
          { type: 'writing', prompt: "Écris ton emploi du temps de la semaine (40 à 50 mots) avec les jours et les heures.", answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: "Dire l'heure et les dates",
        description: "L'heure, les jours, les mois et les prépositions à/en/le.",
        grammarNote: "Pour dire l'heure : « Il est huit heures. » « Il est dix-huit heures trente. » Pour les dates : « le quinze octobre » (jour + mois, sans article devant le mois). On utilise à pour l'heure (à dix-huit heures), en pour le mois ou l'année (en octobre, en deux mille vingt-cinq) et le pour les jours habituels (le lundi, je vais au sport). Les questions quand ? et à quelle heure ? servent à demander le moment : « Quand est la fête ? » « À quelle heure commence-t-elle ? » Les nombres ordinaux : premier, deuxième, troisième, quatrième...",
        phrases: ['Il est... heures.', 'Le quinze octobre', 'Quand ?', 'À quelle heure ?'],
        exercises: [
          { type: 'mcq', prompt: 'La fête est ___ dix-huit heures.', options: ['à', 'en', 'le', 'de'], answer: 0 },
          { type: 'mcq', prompt: 'Léa est née ___ octobre.', options: ['à', 'en', 'le', 'de'], answer: 1 },
          { type: 'mcq', prompt: '___ lundi, j\'ai cours de français.', options: ['À', 'En', 'Le', 'De'], answer: 2 },
          { type: 'mcq', prompt: '___ est ton anniversaire ?', options: ['Quand', 'Comment', 'Où', 'Qui'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: "Les jours, les mois et l'heure",
        description: "Vocabulaire des jours de la semaine, des mois et de l'heure.",
        vocabulary: [
          { word: 'lundi, mardi, mercredi', translation: 'lunes, martes, miércoles', example: 'Le lundi, j\'ai français.' },
          { word: 'jeudi, vendredi', translation: 'jueves, viernes', example: 'Le vendredi, je suis content.' },
          { word: 'samedi, dimanche', translation: 'sábado, domingo', example: 'La fête est samedi.' },
          { word: 'janvier, février, mars', translation: 'enero, febrero, marzo', example: 'Mon anniversaire est en mars.' },
          { word: "l'heure", translation: 'la hora', example: 'Quelle heure est-il ?' },
          { word: 'la minute', translation: 'el minuto', example: 'Il reste dix minutes.' },
          { word: 'le matin / l\'après-midi / le soir', translation: 'la mañana / la tarde / la noche', example: 'Le soir, je fais mes devoirs.' },
          { word: "l'anniversaire", translation: 'el cumpleaños', example: "C'est l'anniversaire de Léa." },
          { word: 'la fête', translation: 'la fiesta', example: 'La fête commence à dix-huit heures.' },
          { word: 'premier / première', translation: 'primero/a', example: 'Le premier octobre.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « l\'anniversaire » ?', options: ['El cumpleaños', 'La fiesta', 'La hora', 'El minuto'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « le soir » ?', options: ['La mañana', 'La tarde', 'La noche', 'El mediodía'], answer: 2 },
          { type: 'mcq', prompt: 'Que signifie « premier » ?', options: ['Primero', 'Segundo', 'Tercero', 'Último'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Quelle heure est-il ?',
        description: "Camila demande l'heure à Léa entre deux cours.",
        intro: "Entre deux cours, Camila demande l'heure à Léa dans le couloir.",
        dialogue: [
          { speaker: 'Camila', line: 'Léa, quelle heure est-il ?', translation: 'Léa, ¿qué hora es?' },
          { speaker: 'Léa', line: 'Il est dix heures et quart.', translation: 'Son las diez y cuarto.' },
          { speaker: 'Camila', line: 'Le prochain cours commence à quelle heure ?', translation: '¿A qué hora empieza la próxima clase?' },
          { speaker: 'Léa', line: 'Il commence à dix heures et demie.', translation: 'Empieza a las diez y media.' },
          { speaker: 'Camila', line: 'Merci ! On a encore quinze minutes.', translation: '¡Gracias! Todavía tenemos quince minutos.' },
          { speaker: 'Léa', line: 'Oui, allons à la cafétéria !', translation: 'Sí, ¡vamos a la cafetería!' }
        ],
        phrases: ['Quelle heure est-il ?', 'Il est... heure(s).', 'À quelle heure... ?'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle heure est-il au début du dialogue ?', options: ['Dix heures', 'Dix heures et quart', 'Dix heures et demie', 'Onze heures'], answer: 1 },
          { type: 'mcq', prompt: 'À quelle heure commence le prochain cours ?', options: ['Dix heures et quart', 'Dix heures et demie', 'Onze heures', 'Onze heures et demie'], answer: 1 },
          { type: 'mcq', prompt: 'Où vont Camila et Léa ?', options: ['À la bibliothèque', 'À la cafétéria', 'Au gymnase', 'Chez Léa'], answer: 1 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'a-table',
    title: 'À table',
    titleEs: 'A la mesa',
    description: "Camila découvre les repas en famille et la nourriture française.",
    order: 7,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'À table avec la famille Lambert',
        description: 'Camila décrit un dîner chez la famille Lambert, en trois parties.',
        reading: {
          title: 'À table avec la famille Lambert',
          parts: [
            "Le dîner chez la famille Lambert est un moment que j'adore. Chaque soir, nous mangeons tous ensemble autour de la table. Monsieur Lambert, qui est cuisinier, prépare souvent des plats délicieux. Ce soir, il y a du poulet, des légumes et du riz. « Tu veux du pain, Camila ? » demande Madame Lambert. « Oui, merci, j'adore le pain français ! » je réponds. Léa n'aime pas beaucoup les légumes, mais elle adore le fromage. Moi, je préfère les fruits pour le dessert.",
            "Après le plat principal, Madame Lambert apporte du fromage et de la salade. « Tu veux de la salade ? » me demande-t-elle. « Un peu, s'il vous plaît, » je réponds. Léa prend beaucoup de fromage, mais elle ne prend pas de salade du tout. « Je n'aime pas la salade, » dit-elle en riant. Pour le dessert, il y a des fruits et un gâteau au chocolat. Je voudrais un peu des deux, s'il vous plaît !",
            "Après le repas, nous aidons tous à débarrasser la table. J'apprends beaucoup de mots nouveaux pendant les repas : le pain, le fromage, les légumes, les fruits. Madame Lambert dit toujours : « Bon appétit ! » avant de manger, et nous répondons « Merci, vous aussi ! » Ces repas en famille sont devenus mon moment préféré de la journée, parce que nous parlons, nous rions et nous partageons beaucoup de choses ensemble."
          ],
          questions: ['Qui prépare le dîner chez la famille Lambert ?', "Qu'est-ce que Léa n'aime pas ?", 'Que dit Madame Lambert avant de manger ?'],
          ordering: {
            prompt: "Remets les événements de l'histoire dans l'ordre.",
            events: [
              'La famille Lambert se réunit pour le dîner.',
              'Madame Lambert propose du pain et de la salade.',
              'Léa prend du fromage mais pas de salade.',
              'Tout le monde aide à débarrasser la table.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Qui prépare souvent les plats chez la famille Lambert ?', options: ['Madame Lambert', 'Monsieur Lambert', 'Léa', 'Camila'], answer: 1 },
          { type: 'mcq', prompt: "Qu'est-ce que Léa n'aime pas ?", options: ['Le fromage', 'Les légumes', 'Les fruits', 'Le pain'], answer: 1 },
          { type: 'mcq', prompt: 'Qu\'est-ce que Camila préfère pour le dessert ?', options: ['Le fromage', 'La salade', 'Les fruits', 'Le pain'], answer: 2 },
          { type: 'mcq', prompt: 'Que dit la famille avant de manger ?', options: ['Au revoir', 'Bon appétit', 'À bientôt', 'Bonne nuit'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Léa prend beaucoup de fromage.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Vrai ou faux : Léa aime beaucoup la salade.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila aide à débarrasser la table.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Choisis le bon mot : Madame Lambert apporte du fromage et de la ___.', options: ['salade', 'chaise', 'trousse', 'cour'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Qu\'est-ce que tu veux manger ?',
        description: 'Camila et Léa parlent de leurs préférences au petit-déjeuner.',
        intro: 'Écoute Madame Lambert, Camila et Léa qui parlent du petit-déjeuner.',
        dialogue: [
          { speaker: 'Madame Lambert', line: 'Camila, tu veux du pain ?', translation: 'Camila, ¿quieres pan?' },
          { speaker: 'Camila', line: "Oui, merci, j'adore le pain français.", translation: 'Sí, gracias, me encanta el pan francés.' },
          { speaker: 'Madame Lambert', line: 'Tu veux aussi de la confiture ?', translation: '¿Quieres también mermelada?' },
          { speaker: 'Camila', line: "Un peu, s'il vous plaît. Je n'aime pas trop le sucre.", translation: 'Un poco, por favor. No me gusta mucho el azúcar.' },
          { speaker: 'Léa', line: "Moi, je voudrais du chocolat chaud, s'il te plaît, maman.", translation: 'Yo quisiera chocolate caliente, por favor, mamá.' },
          { speaker: 'Madame Lambert', line: 'Bien sûr, ma chérie !', translation: 'Claro, cariño.' }
        ],
        phrases: ['Tu veux... ?', 'Je voudrais...', "Un peu, s'il vous plaît.", "Je n'aime pas..."],
        exercises: [
          { type: 'mcq', prompt: "Qu'est-ce que Camila aime ?", options: ['Le sucre', 'Le pain français', 'Le chocolat chaud', 'La salade'], answer: 1 },
          { type: 'mcq', prompt: 'Que demande Léa ?', options: ['Du pain', 'De la confiture', 'Du chocolat chaud', 'Du fromage'], answer: 2 },
          { type: 'mcq', prompt: 'Comment Camila prend-elle la confiture ?', options: ['Beaucoup', 'Un peu', 'Pas du tout', 'Avec du sucre'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Commande ton repas',
        description: 'Commande un repas à voix haute avec « je voudrais ».',
        mission: 'Commande un repas à voix haute avec « je voudrais » et dis ce que tu aimes ou n\'aimes pas.',
        phrases: ['Je voudrais...', "J'aime / je n'aime pas...", 'Un peu de...'],
        dialogue: [
          { speaker: 'Toi', line: 'Je voudrais du poulet et des légumes, s\'il vous plaît.', translation: 'Quisiera pollo y verduras, por favor.' },
          { speaker: 'Serveur', line: 'Très bien. Et pour boire ?', translation: 'Muy bien. ¿Y para beber?' },
          { speaker: 'Toi', line: "Un jus d'orange, merci.", translation: 'Un jugo de naranja, gracias.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Commande un repas à voix haute avec « je voudrais ».', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Dis à un(e) camarade trois aliments que tu aimes et un que tu n\'aimes pas.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Écris ton menu préféré',
        description: 'Décris ton repas préféré.',
        mission: 'Décris ton repas préféré en 30 à 40 mots, avec des articles partitifs (du, de la, des).',
        phrases: ['Je mange...', "J'aime...", 'Il y a du/de la/des...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Mon repas préféré, c\'est le poulet avec du riz et des légumes. Pour le dessert, je préfère les fruits.', translation: 'Mi comida favorita es el pollo con arroz y verduras. De postre, prefiero la fruta.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Décris ton repas préféré (30 à 40 mots) avec au moins deux articles partitifs.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Les articles partitifs et vouloir',
        description: 'Du/de la/de l\'/des, aimer/adorer/préférer, vouloir et je voudrais.',
        grammarNote: "Les articles partitifs indiquent une quantité non précisée : du pain (masculin), de la salade (féminin), de l'eau (devant une voyelle), des fruits (pluriel). Avec aimer, adorer, préférer, on utilise l'article défini pour parler en général : « J'aime le fromage. » « Je préfère les fruits. » Le verbe vouloir : je veux, tu veux, il/elle veut, nous voulons, vous voulez, ils/elles veulent. Pour être poli, on utilise je voudrais : « Je voudrais du pain, s'il vous plaît. » À la forme négative, du/de la/des deviennent simplement de : « Je ne veux pas de salade. »",
        phrases: ['Du/de la/des...', "J'aime le/la/les...", 'Je voudrais...', 'Je ne veux pas de...'],
        exercises: [
          { type: 'mcq', prompt: 'Je voudrais ___ pain, s\'il vous plaît.', options: ['un', 'du', 'de la', 'des'], answer: 1 },
          { type: 'mcq', prompt: 'Léa adore ___ fromage.', options: ['un', 'le', 'du', 'de la'], answer: 1 },
          { type: 'mcq', prompt: 'Tu ___ de la salade ?', options: ['veux', 'veut', 'voulons', 'voulez'], answer: 0 },
          { type: 'mcq', prompt: 'Je ne veux pas ___ légumes.', options: ['des', 'de', 'du', 'les'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'La nourriture',
        description: 'Vocabulaire des repas et de la nourriture.',
        vocabulary: [
          { word: 'le pain', translation: 'el pan', example: "J'adore le pain français." },
          { word: 'le fromage', translation: 'el queso', example: 'Léa adore le fromage.' },
          { word: 'les légumes', translation: 'las verduras', example: 'Léa n\'aime pas les légumes.' },
          { word: 'les fruits', translation: 'las frutas', example: 'Je préfère les fruits.' },
          { word: 'le riz', translation: 'el arroz', example: 'Il y a du riz ce soir.' },
          { word: 'le poulet', translation: 'el pollo', example: 'Monsieur Lambert prépare du poulet.' },
          { word: 'la salade', translation: 'la ensalada', example: 'Léa ne prend pas de salade.' },
          { word: 'le dessert', translation: 'el postre', example: 'Pour le dessert, il y a un gâteau.' },
          { word: 'le sucre', translation: 'el azúcar', example: 'Je n\'aime pas trop le sucre.' },
          { word: 'la confiture', translation: 'la mermelada', example: 'Tu veux de la confiture ?' },
          { word: 'avoir faim', translation: 'tener hambre', example: "J'ai faim, on mange ?" },
          { word: 'avoir soif', translation: 'tener sed', example: 'Léa a soif.' },
          { word: 'bon appétit', translation: 'buen provecho', example: 'Bon appétit à tous !' },
          { word: 'délicieux / délicieuse', translation: 'delicioso/a', example: 'Ce plat est délicieux.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « le fromage » ?', options: ['El pan', 'El queso', 'El arroz', 'El pollo'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « avoir faim » ?', options: ['Tener sed', 'Tener hambre', 'Tener frío', 'Tener sueño'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « délicieux » ?', options: ['Delicioso', 'Feo', 'Frío', 'Caro'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Au café',
        description: 'Camila et Léa commandent une pâtisserie au café après les cours.',
        intro: 'Camila et Léa vont au café après les cours pour goûter une pâtisserie française.',
        dialogue: [
          { speaker: 'Serveur', line: "Bonjour ! Qu'est-ce que vous voulez ?", translation: 'Hola. ¿Qué desean?' },
          { speaker: 'Léa', line: "Je voudrais un croissant et un jus d'orange, s'il vous plaît.", translation: 'Quisiera un cruasán y un jugo de naranja, por favor.' },
          { speaker: 'Camila', line: 'Pour moi, je voudrais un pain au chocolat et un thé.', translation: 'Para mí, quisiera un pan de chocolate y un té.' },
          { speaker: 'Serveur', line: "Très bien. C'est tout ?", translation: 'Muy bien. ¿Eso es todo?' },
          { speaker: 'Léa', line: 'Oui, merci beaucoup.', translation: 'Sí, muchas gracias.' },
          { speaker: 'Camila', line: "C'est délicieux, ce café !", translation: '¡Este café es delicioso!' }
        ],
        phrases: ['Je voudrais...', 'Qu\'est-ce que vous voulez ?', "C'est tout ?", "C'est délicieux."],
        exercises: [
          { type: 'mcq', prompt: 'Qu\'est-ce que Léa commande ?', options: ['Un pain au chocolat', "Un croissant et un jus d'orange", 'Une salade', 'Un café'], answer: 1 },
          { type: 'mcq', prompt: 'Qu\'est-ce que Camila commande ?', options: ['Un croissant et un thé', 'Un pain au chocolat et un thé', "Une salade et de l'eau", "Un jus d'orange"], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila trouve-t-elle le café ?', options: ['Mauvais', 'Délicieux', 'Trop cher', 'Fermé'], answer: 1 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'chez-moi',
    title: 'Chez moi',
    titleEs: 'En mi casa',
    description: "Camila décrit sa chambre chez la famille Lambert.",
    order: 8,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'Ma chambre à Tours',
        description: 'Camila décrit sa chambre chez la famille Lambert, en trois parties.',
        reading: {
          title: 'Ma chambre à Tours',
          parts: [
            "Ma chambre, chez la famille Lambert, est petite mais très confortable. Il y a un lit, une armoire et un bureau. Sur le bureau, il y a mon ordinateur et des photos de ma famille dominicaine. Devant la fenêtre, il y a une jolie plante verte que Madame Lambert m'a offerte. Le lit est à côté de la fenêtre, et l'armoire est en face du lit.",
            "Sous mon lit, il y a une grande valise avec des souvenirs de Saint-Domingue. Entre le bureau et l'armoire, il y a une petite étagère avec mes livres de français. Le chat de Léa, Minou, aime dormir sur mon lit, à côté de mon oreiller. Derrière la porte, il y a un miroir où je me regarde avant de partir à l'école.",
            "Ma chambre à Saint-Domingue était plus grande, avec des couleurs vives, mais celle-ci est calme et chaleureuse. Léa m'a aidée à décorer les murs avec des photos et des dessins. « C'est ta chambre maintenant, » dit-elle souvent. J'aime beaucoup cet espace : c'est un petit coin de chez moi, ici, à Tours."
          ],
          questions: ['Qu\'est-ce qu\'il y a sur le bureau de Camila ?', 'Où dort le chat Minou ?', 'Comment est la chambre de Camila à Saint-Domingue ?'],
          ordering: {
            prompt: "Remets les événements de l'histoire dans l'ordre.",
            events: [
              'Camila décrit les meubles de sa chambre.',
              'Elle parle de la valise sous son lit.',
              'Le chat Minou dort sur son lit.',
              'Léa aide Camila à décorer les murs.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Qu\'est-ce qu\'il y a sur le bureau de Camila ?', options: ['Un lit', 'Un ordinateur et des photos', 'Une valise', 'Un miroir'], answer: 1 },
          { type: 'mcq', prompt: "Où est l'armoire par rapport au lit ?", options: ['Sous le lit', 'À côté du lit', 'En face du lit', 'Derrière le lit'], answer: 2 },
          { type: 'mcq', prompt: 'Qu\'est-ce qu\'il y a sous le lit de Camila ?', options: ['Un chat', 'Une valise', 'Des livres', 'Un miroir'], answer: 1 },
          { type: 'mcq', prompt: 'Où dort le chat Minou ?', options: ['Sous le lit', 'Sur le lit de Camila', "Dans l'armoire", 'Sur le bureau'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : La chambre de Camila à Tours est très grande.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Léa a aidé Camila à décorer sa chambre.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: "Vrai ou faux : Il y a un miroir derrière la porte.", options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Choisis le bon mot : La chambre de Camila est petite mais très ___.', options: ['confortable', 'fâchée', 'triste', 'fermée'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Décris ta chambre',
        description: 'Léa demande à Camila de comparer sa chambre à Tours et à Saint-Domingue.',
        intro: 'Écoute Léa et Camila qui parlent de leur chambre.',
        dialogue: [
          { speaker: 'Léa', line: 'Comment est ta chambre à Saint-Domingue, Camila ?', translation: '¿Cómo es tu cuarto en Santo Domingo, Camila?' },
          { speaker: 'Camila', line: 'Elle est grande, avec des couleurs vives.', translation: 'Es grande, con colores vivos.' },
          { speaker: 'Léa', line: "Et qu'est-ce qu'il y a dedans ?", translation: '¿Y qué hay dentro?' },
          { speaker: 'Camila', line: 'Il y a un grand lit et beaucoup de photos sur les murs.', translation: 'Hay una cama grande y muchas fotos en las paredes.' },
          { speaker: 'Léa', line: "C'est différent de ta chambre ici !", translation: '¡Es diferente de tu cuarto aquí!' },
          { speaker: 'Camila', line: "Oui, mais j'aime beaucoup ma chambre ici aussi.", translation: 'Sí, pero también me gusta mucho mi cuarto aquí.' }
        ],
        phrases: ['Comment est ta chambre ?', 'Il y a...', 'C\'est différent de...', "J'aime..."],
        exercises: [
          { type: 'mcq', prompt: 'Comment est la chambre de Camila à Saint-Domingue ?', options: ['Petite et sombre', 'Grande, avec des couleurs vives', 'Vide', 'Froide'], answer: 1 },
          { type: 'mcq', prompt: 'Qu\'est-ce qu\'il y a dans sa chambre à Saint-Domingue ?', options: ['Un grand lit et des photos', 'Une valise', 'Un chat', 'Un bureau seulement'], answer: 0 },
          { type: 'mcq', prompt: 'Camila aime-t-elle sa chambre à Tours ?', options: ['Non, pas du tout', 'Oui, beaucoup', 'Elle ne sait pas', 'Un peu seulement'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Décris ta chambre',
        description: 'Décris à voix haute ta chambre et où se trouvent les meubles.',
        mission: 'Décris ta chambre à voix haute : les meubles et où ils se trouvent.',
        phrases: ['Il y a...', 'à côté de...', 'devant / derrière...', 'sur / sous...'],
        dialogue: [
          { speaker: 'Toi', line: 'Dans ma chambre, il y a un lit et un bureau.', translation: 'En mi habitación hay una cama y un escritorio.' },
          { speaker: 'Camarade', line: "Où est le bureau ?", translation: '¿Dónde está el escritorio?' },
          { speaker: 'Toi', line: 'Il est à côté de la fenêtre.', translation: 'Está al lado de la ventana.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Décris ta chambre à voix haute avec au moins trois prépositions de lieu.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Dessine ta chambre et explique-la à un(e) camarade.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Décris ta chambre',
        description: 'Écris une description de ta chambre.',
        mission: 'Décris ta chambre en 30 à 40 mots avec au moins trois prépositions de lieu.',
        phrases: ['Il y a...', 'à côté de...', 'sur / sous...'],
        dialogue: [
          { speaker: 'Modèle', line: "Dans ma chambre, il y a un lit et une armoire. Le bureau est à côté de la fenêtre, et mes livres sont sur l'étagère.", translation: 'En mi habitación hay una cama y un armario. El escritorio está al lado de la ventana, y mis libros están en el estante.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Décris ta chambre (30 à 40 mots) avec au moins trois prépositions de lieu.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: "Il y a, c'est/ce sont et les prépositions de lieu",
        description: "Il y a, c'est/ce sont, et les prépositions de lieu sur/sous/devant/derrière/entre/à côté de.",
        grammarNote: "Il y a indique l'existence d'une chose : « Il y a un lit dans ma chambre. » C'est identifie une seule chose ou personne : « C'est mon bureau. » Ce sont identifie plusieurs choses : « Ce sont mes livres. » Les prépositions de lieu situent les objets : sur (le livre est sur la table), sous (la valise est sous le lit), devant (la chaise est devant le bureau), derrière (le miroir est derrière la porte), entre (l'étagère est entre le bureau et l'armoire), à côté de (le lit est à côté de la fenêtre). Les adjectifs s'accordent avec le nom : une chambre confortable, un lit confortable.",
        phrases: ['Il y a...', "C'est... / Ce sont...", 'sur / sous / devant / derrière / entre / à côté de'],
        exercises: [
          { type: 'mcq', prompt: '___ un lit et une armoire dans ma chambre.', options: ['Il y a', "C'est", 'Ce sont', 'Il est'], answer: 0 },
          { type: 'mcq', prompt: '___ mon bureau.', options: ['Il y a', "C'est", 'Ce sont', 'Il est'], answer: 1 },
          { type: 'mcq', prompt: 'Le chat dort ___ le lit.', options: ['sur', 'sous', 'devant', 'entre'], answer: 0 },
          { type: 'mcq', prompt: "L'étagère est ___ le bureau et l'armoire.", options: ['sur', 'sous', 'entre', 'devant'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'La chambre et la maison',
        description: 'Vocabulaire des meubles et des prépositions de lieu.',
        vocabulary: [
          { word: 'la chambre', translation: 'la habitación', example: 'Ma chambre est petite.' },
          { word: 'le lit', translation: 'la cama', example: 'Le chat dort sur le lit.' },
          { word: "l'armoire", translation: 'el armario', example: "L'armoire est en face du lit." },
          { word: 'le bureau', translation: 'el escritorio', example: 'Mon ordinateur est sur le bureau.' },
          { word: "l'étagère", translation: 'el estante', example: 'Mes livres sont sur l\'étagère.' },
          { word: 'le miroir', translation: 'el espejo', example: 'Le miroir est derrière la porte.' },
          { word: 'la fenêtre', translation: 'la ventana', example: 'Le lit est à côté de la fenêtre.' },
          { word: 'la porte', translation: 'la puerta', example: 'La porte de ma chambre est bleue.' },
          { word: 'confortable', translation: 'cómodo/a', example: 'Ma chambre est confortable.' },
          { word: 'sur / sous', translation: 'sobre / debajo de', example: 'La valise est sous le lit.' },
          { word: 'devant / derrière', translation: 'delante de / detrás de', example: 'La chaise est devant le bureau.' },
          { word: 'entre', translation: 'entre', example: "L'étagère est entre le bureau et l'armoire." },
          { word: 'à côté de', translation: 'al lado de', example: 'Le lit est à côté de la fenêtre.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « l\'armoire » ?', options: ['El armario', 'La cama', 'El espejo', 'El estante'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « à côté de » ?', options: ['Debajo de', 'Al lado de', 'Detrás de', 'Encima de'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « confortable » ?', options: ['Cómodo/a', 'Pequeño/a', 'Frío/a', 'Vacío/a'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Bienvenue chez moi',
        description: 'Camila montre sa chambre à Karim.',
        intro: 'Karim visite la maison de la famille Lambert. Camila lui montre sa chambre.',
        dialogue: [
          { speaker: 'Camila', line: 'Bienvenue chez moi, Karim ! Voici ma chambre.', translation: 'Bienvenido a mi casa, Karim. Esta es mi habitación.' },
          { speaker: 'Karim', line: "Elle est belle ! Qu'est-ce que c'est, sur le bureau ?", translation: '¡Es bonita! ¿Qué es eso, en el escritorio?' },
          { speaker: 'Camila', line: 'Ce sont des photos de ma famille à Saint-Domingue.', translation: 'Son fotos de mi familia en Santo Domingo.' },
          { speaker: 'Karim', line: 'Et le chat, il dort toujours ici ?', translation: '¿Y el gato, siempre duerme aquí?' },
          { speaker: 'Camila', line: 'Oui, Minou adore mon lit !', translation: 'Sí, ¡a Minou le encanta mi cama!' },
          { speaker: 'Karim', line: "C'est une chambre très chaleureuse.", translation: 'Es una habitación muy acogedora.' }
        ],
        phrases: ['Bienvenue chez moi.', 'Qu\'est-ce que c\'est ?', 'Ce sont...', "C'est très..."],
        exercises: [
          { type: 'mcq', prompt: 'Que montre Camila à Karim ?', options: ['La cuisine', 'Sa chambre', 'Le jardin', "L'école"], answer: 1 },
          { type: 'mcq', prompt: 'Qu\'est-ce qu\'il y a sur le bureau ?', options: ['Des livres', 'Des photos de famille', 'Un miroir', 'Une valise'], answer: 1 },
          { type: 'mcq', prompt: 'Où dort Minou, le chat ?', options: ["Dans l'armoire", 'Sur le lit de Camila', 'Sous le bureau', 'Dans la cuisine'], answer: 1 }
        ]
      })
    }
  },

  // ---------------------------------------------------------------
  {
    slug: 'dans-ma-ville',
    title: 'Dans ma ville',
    titleEs: 'En mi ciudad',
    description: 'Camila et Léa se promènent dans Tours et demandent leur chemin.',
    order: 9,
    accessTier: 'premium',
    activities: {
      reading: activity('reading', {
        title: 'Une promenade dans Tours',
        description: 'Camila et Léa explorent le centre-ville de Tours, en trois parties.',
        reading: {
          title: 'Une promenade dans Tours',
          parts: [
            "Le samedi après-midi, Léa et moi aimons nous promener dans Tours. Nous allons souvent au parc, à la piscine ou au cinéma. Aujourd'hui, nous allons à la médiathèque pour emprunter des livres. Le centre-ville de Tours est joli, avec de vieilles maisons et de petites rues. Nous passons devant la cathédrale, qui est très grande et impressionnante.",
            "Ensuite, nous voulons aller au marché pour acheter des fruits. « Excusez-moi, où se trouve le marché ? » demande Léa à une dame. « Tournez à droite, puis continuez tout droit jusqu'à la place. Le marché est juste là, » répond la dame. Nous suivons ses indications et nous arrivons rapidement au marché. Il y a beaucoup de fruits, de légumes et de fleurs.",
            "Après le marché, nous allons à la boulangerie pour acheter du pain, puis nous rentrons à la maison. Sur le chemin, nous croisons Karim, qui va à la piscine avec son frère. « À demain, à l'école ! » nous dit-il. Cette promenade dans Tours me permet de mieux connaître la ville, et chaque semaine, je découvre un nouvel endroit intéressant."
          ],
          questions: ['Où vont Léa et Camila en premier ?', 'Comment trouvent-elles le marché ?', 'Qui croisent-elles sur le chemin ?'],
          ordering: {
            prompt: "Remets les événements de l'histoire dans l'ordre.",
            events: [
              'Léa et Camila vont à la médiathèque.',
              'Elles demandent où se trouve le marché.',
              'Elles achètent des fruits au marché.',
              'Elles croisent Karim sur le chemin du retour.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Où vont Léa et Camila au début de la promenade ?', options: ['Au cinéma', 'À la médiathèque', 'À la piscine', 'Au marché'], answer: 1 },
          { type: 'mcq', prompt: 'Que font-elles au marché ?', options: ['Elles achètent des fruits et des légumes', 'Elles regardent un film', 'Elles nagent', 'Elles empruntent des livres'], answer: 0 },
          { type: 'mcq', prompt: 'Qui donne des indications à Léa ?', options: ['Karim', 'Une dame dans la rue', 'Madame Dubois', 'Un vendeur'], answer: 1 },
          { type: 'mcq', prompt: 'Qui croisent-elles sur le chemin du retour ?', options: ['Madame Lambert', 'Karim', 'Madame Dubois', 'Sofía'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Elles passent devant la cathédrale.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Vrai ou faux : Elles vont au marché en voiture.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Elles achètent du pain à la boulangerie.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Choisis le bon mot : Le centre-ville de Tours est joli, avec de vieilles maisons et de petites ___.', options: ['rues', 'piscines', 'voitures', 'écoles'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Où se trouve la piscine ?',
        description: 'Camila demande son chemin à un passant.',
        intro: 'Écoute Camila qui demande son chemin pour aller à la piscine.',
        dialogue: [
          { speaker: 'Camila', line: 'Excusez-moi, où se trouve la piscine ?', translation: 'Disculpe, ¿dónde está la piscina?' },
          { speaker: 'Un passant', line: 'Continuez tout droit, puis tournez à gauche après la boulangerie.', translation: 'Siga todo recto, luego gire a la izquierda después de la panadería.' },
          { speaker: 'Camila', line: "C'est loin d'ici ?", translation: '¿Está lejos de aquí?' },
          { speaker: 'Un passant', line: "Non, c'est à cinq minutes à pied.", translation: 'No, está a cinco minutos a pie.' },
          { speaker: 'Camila', line: 'Merci beaucoup !', translation: '¡Muchas gracias!' },
          { speaker: 'Un passant', line: 'Je vous en prie. Bonne journée !', translation: 'De nada. ¡Que tenga un buen día!' }
        ],
        phrases: ['Où se trouve... ?', 'Tournez à droite/gauche.', 'Continuez tout droit.', "C'est loin ?"],
        exercises: [
          { type: 'mcq', prompt: 'Que cherche Camila ?', options: ['Le marché', 'La piscine', 'La gare', 'La médiathèque'], answer: 1 },
          { type: 'mcq', prompt: 'Comment y aller ?', options: ['Tout droit puis à droite', 'Tout droit puis à gauche', 'À gauche puis à droite', 'Tout droit seulement'], answer: 1 },
          { type: 'mcq', prompt: "C'est loin ?", options: ['Oui, très loin', 'Non, cinq minutes à pied', 'Une heure en bus', 'Personne ne sait'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Demande ton chemin',
        description: 'Demande et donne des indications à voix haute.',
        mission: 'Demande et donne des indications à voix haute pour aller à un endroit de ta ville.',
        phrases: ['Où se trouve... ?', 'Tournez à...', 'Continuez tout droit.'],
        dialogue: [
          { speaker: 'Toi', line: "Excusez-moi, où se trouve la bibliothèque ?", translation: 'Disculpe, ¿dónde está la biblioteca?' },
          { speaker: 'Camarade', line: 'Tournez à droite, puis continuez tout droit.', translation: 'Gire a la derecha, luego siga todo recto.' },
          { speaker: 'Toi', line: "C'est loin d'ici ?", translation: '¿Está lejos de aquí?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Demande ton chemin à voix haute pour aller à un endroit de ta ville.', answer: 'Oral practice' },
          { type: 'practice', prompt: "Donne des indications à un(e) camarade pour aller de l'école à un endroit connu.", answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Décris ta ville',
        description: 'Décris ta ville ou ton quartier.',
        mission: 'Décris ta ville ou ton quartier en 40 à 50 mots : les endroits importants et comment y aller.',
        phrases: ["Dans ma ville, il y a...", 'Pour aller à..., tournez...'],
        dialogue: [
          { speaker: 'Modèle', line: "Dans ma ville, il y a un parc, une médiathèque et un grand marché. Pour aller au marché, on continue tout droit puis on tourne à droite.", translation: 'En mi ciudad hay un parque, una mediateca y un gran mercado. Para ir al mercado, se sigue todo recto y luego se gira a la derecha.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Décris ta ville ou ton quartier (40 à 50 mots) avec au moins une indication de chemin.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: "Le verbe aller et l'impératif",
        description: 'Le verbe aller, les contractions au/à la/à l\'/aux et l\'impératif pour donner des indications.',
        grammarNote: "Le verbe aller : je vais, tu vas, il/elle va, nous allons, vous allez, ils/elles vont. Avec à, la préposition se contracte : à + le = au (au marché), à + la = à la (à la piscine), à + l' = à l' (à l'école), à + les = aux (aux magasins). Pour donner des indications, on utilise l'impératif : tournez à droite, allez tout droit, continuez jusqu'à la place. La question où se trouve... ? sert à demander un lieu : « Où se trouve la gare ? »",
        phrases: ['Je vais...', 'au / à la / à l\' / aux', 'Tournez... Continuez...', 'Où se trouve... ?'],
        exercises: [
          { type: 'mcq', prompt: 'Je vais ___ marché le samedi.', options: ['à', 'au', 'à la', 'aux'], answer: 1 },
          { type: 'mcq', prompt: 'Nous allons ___ piscine cet après-midi.', options: ['au', 'à la', "à l'", 'aux'], answer: 1 },
          { type: 'mcq', prompt: '___ à droite, puis continuez tout droit.', options: ['Tourne', 'Tournez', 'Tournons', 'Tourner'], answer: 1 },
          { type: 'mcq', prompt: '___ se trouve la médiathèque ?', options: ['Où', 'Quand', 'Comment', 'Quel'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Les lieux publics et les directions',
        description: 'Vocabulaire des lieux publics et des directions.',
        vocabulary: [
          { word: 'la piscine', translation: 'la piscina', example: 'Karim va à la piscine.' },
          { word: 'le marché', translation: 'el mercado', example: 'Nous achetons des fruits au marché.' },
          { word: 'la médiathèque', translation: 'la mediateca', example: 'Léa emprunte des livres à la médiathèque.' },
          { word: 'la boulangerie', translation: 'la panadería', example: 'Nous achetons du pain à la boulangerie.' },
          { word: 'la cathédrale', translation: 'la catedral', example: 'La cathédrale de Tours est très grande.' },
          { word: 'la place', translation: 'la plaza', example: 'Le marché est sur la place.' },
          { word: 'le centre-ville', translation: 'el centro de la ciudad', example: 'Le centre-ville de Tours est joli.' },
          { word: 'à droite / à gauche', translation: 'a la derecha / a la izquierda', example: 'Tournez à droite.' },
          { word: 'tout droit', translation: 'todo recto', example: 'Continuez tout droit.' },
          { word: 'tourner', translation: 'girar', example: 'Tournez au feu.' },
          { word: 'continuer', translation: 'seguir/continuar', example: 'Continuez jusqu\'à la place.' },
          { word: 'où se trouve... ?', translation: '¿dónde está...?', example: 'Où se trouve la gare ?' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « la boulangerie » ?', options: ['La panadería', 'La piscina', 'La plaza', 'La catedral'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « tout droit » ?', options: ['A la derecha', 'A la izquierda', 'Todo recto', 'Detrás'], answer: 2 },
          { type: 'mcq', prompt: 'Que signifie « tourner » ?', options: ['Girar', 'Continuar', 'Parar', 'Comprar'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Où est la gare ?',
        description: 'Camila demande son chemin pour aller à la gare.',
        intro: 'Camila doit prendre le train et demande son chemin à un passant dans la rue.',
        dialogue: [
          { speaker: 'Camila', line: "Excusez-moi, où est la gare, s'il vous plaît ?", translation: 'Disculpe, ¿dónde está la estación de tren, por favor?' },
          { speaker: 'Passant', line: 'Allez tout droit, puis tournez à gauche au feu.', translation: 'Vaya todo recto, luego gire a la izquierda en el semáforo.' },
          { speaker: 'Camila', line: "C'est loin d'ici ?", translation: '¿Está lejos de aquí?' },
          { speaker: 'Passant', line: "Non, c'est à dix minutes à pied.", translation: 'No, está a diez minutos a pie.' },
          { speaker: 'Camila', line: 'Merci beaucoup pour votre aide !', translation: '¡Muchas gracias por su ayuda!' },
          { speaker: 'Passant', line: 'De rien, bon voyage !', translation: 'De nada, ¡buen viaje!' }
        ],
        phrases: ['Où est... ?', 'Allez tout droit.', 'Tournez à gauche.', "C'est à... minutes à pied."],
        exercises: [
          { type: 'mcq', prompt: 'Que cherche Camila ?', options: ['Le marché', 'La gare', 'La piscine', 'La cathédrale'], answer: 1 },
          { type: 'mcq', prompt: 'Comment aller à la gare ?', options: ['Tout droit puis à gauche au feu', 'À droite seulement', 'Tout droit seulement', 'À gauche puis à droite'], answer: 0 },
          { type: 'mcq', prompt: 'À combien de minutes à pied est la gare ?', options: ['Cinq minutes', 'Dix minutes', 'Vingt minutes', 'Une heure'], answer: 1 }
        ]
      })
    }
  }
];

module.exports = {
  language: 'french',
  level: 'A1',
  courseTitle: 'Français A1',
  courseDescription:
    "Français de survie : salutations, présentations, famille, vie quotidienne et premières sorties, organisés en 12 unités thématiques autour du parcours de Camila, élève dominicaine en échange scolaire à Tours.",
  units
};
