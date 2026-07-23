// scripts/content/french-c1-units.js
// Hand-authored French C1 content, restricted scope per spec: only units 1
// and 2, only reading/vocabulary/grammar activities (no listening/speaking/
// writing/dialogue yet). Same shape as french-a1/a2/b1/b2-units.js for the
// activities it does define. Continues the narrative: Camila has just
// started her licence de langues étrangères appliquées at the université
// de Tours, reunited with Léa and Karim.
//
// Consumed by scripts/build-french-c1-seed.js, which only emits the 3
// activities each unit actually has (not the usual 7).

const DEFAULTS = {
  reading: { duration: 20, xp: 40 },
  vocabulary: { duration: 12, xp: 30 },
  grammar: { duration: 16, xp: 35 }
};

function activity(skill, fields) {
  return { skill, duration: DEFAULTS[skill].duration, xp: DEFAULTS[skill].xp, ...fields };
}

const units = [
  // ---------------------------------------------------------------
  {
    slug: 'la-rentree-universitaire',
    title: 'La rentrée universitaire',
    titleEs: 'El inicio del curso universitario',
    description: 'Camila commence sa licence de langues étrangères appliquées à l’université de Tours et retrouve Léa et Karim.',
    order: 1,
    accessTier: 'free',
    unitOverview: {
      objective: 'Comprendre un récit universitaire complexe et maîtriser des nuances grammaticales de haut niveau.',
      outcomes: [
        'comprendre un texte long à registre soutenu',
        'analyser des nuances lexicales fines à l’université',
        'utiliser les structures de mise en relief (c’est... qui/que)',
        'reconnaître l’usage du subjonctif dans des tournures nuancées d’opinion'
      ],
      grammar: ['la mise en relief (c’est... qui/que)', 'subjonctif après verbes d’opinion nuancée', 'registre soutenu à l’écrit universitaire'],
      vocabulary: ['un amphithéâtre', 'une unité d’enseignement', 'un syllabus', 'l’autonomie académique'],
      scenario: 'Camila arrive pour son premier jour de cours à l’université de Tours, où elle retrouve Léa et Karim.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Premier jour à l’université',
        description: 'Camila découvre le monde universitaire français lors de sa première semaine de cours à Tours.',
        reading: {
          title: 'Premier jour à l’université',
          parts: [
            "C'est dans un amphithéâtre bondé, où résonnent les murmures de centaines d'étudiants qu'elle ne connaît pas encore, que Camila s'installe pour son tout premier cours de licence. L'université de Tours, avec son architecture qui mêle bâtiments historiques et infrastructures modernes, n'a que peu à voir avec le lycée qu'elle fréquentait deux ans plus tôt lors de son année d'échange. C'est précisément cette différence d'échelle, autant que la liberté qui l'accompagne, qui la déstabilise légèrement en ce premier jour. Personne ne vérifie sa présence, personne ne lui rappelle la date des examens : c'est à elle, désormais, qu'il revient d'organiser son propre parcours académique.",
            "Le professeur de linguistique, dès les premières minutes de son cours magistral, distribue un syllabus détaillé, expliquant qu'il attend de ses étudiants une véritable autonomie intellectuelle, bien loin des méthodes plus encadrées qu'elle avait connues auparavant. « Ici, ce n'est pas moi qui viendrai vous chercher si vous décrochez », prévient-il avec un sourire à la fois bienveillant et exigeant. « C'est à vous qu'il incombe de solliciter de l'aide en cas de difficulté, et c'est cette responsabilité individuelle qui, à terme, fera toute la différence entre un parcours réussi et un parcours simplement subi. » Camila, tout en prenant des notes fébrilement, sent une pointe d'anxiété se mêler à son enthousiasme.",
            "À la pause déjeuner, elle retrouve enfin Léa et Karim, tous deux inscrits dans des filières différentes de la sienne, mais présents sur le même campus. « Alors, comment tu trouves ta première matinée ? » demande Karim, un sandwich à la main. « C'est vertigineux », avoue Camila avec un sourire nerveux. « Je crois que c'est justement cette liberté qui m'impressionne le plus, presque autant qu'elle m'effraie. » Léa, plus habituée au système, la rassure : « C'est normal de se sentir un peu perdue au début. C'est avec le temps que tu trouveras ton propre rythme de travail, et crois-moi, ça viendra plus vite que tu ne le penses. »",
            "En fin de journée, épuisée mais galvanisée par cette première immersion, Camila rentre dans le petit studio qu'elle a loué près du centre-ville, celui-là même qu'elle avait comparé, deux ans plus tôt, à un autre logement plus spacieux mais moins central. Assise à son bureau, elle relit ses notes de la journée et réalise, non sans une certaine fierté, à quel point le chemin parcouru depuis son arrivée initiale en France, hésitante et pleine d'appréhension, l'a menée jusqu'à ce moment précis : celui où elle s'apprête enfin à construire, pierre par pierre, le projet professionnel dont elle rêve depuis des années."
          ],
          questions: [
            'Qu’est-ce qui déstabilise Camila lors de son premier jour à l’université ?',
            'Que réclame le professeur de linguistique de ses étudiants ?',
            'Comment Léa rassure-t-elle Camila à la pause déjeuner ?'
          ],
          ordering: {
            prompt: 'Remets les moments de la journée de Camila dans l’ordre.',
            events: [
              'Camila s’installe dans l’amphithéâtre pour son premier cours.',
              'Le professeur distribue le syllabus et explique ses attentes.',
              'Camila retrouve Léa et Karim à la pause déjeuner.',
              'Elle rentre dans son studio et relit ses notes, fière du chemin parcouru.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce texte ?', options: ['D’un voyage touristique', 'Du premier jour de Camila à l’université de Tours', 'D’une dispute avec un professeur', 'D’un déménagement raté'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : dans quelle filière Camila est-elle inscrite ?', options: ['Linguistique pure', 'Langues étrangères appliquées', 'Histoire de l’art', 'Sciences politiques'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’est-ce qui différencie principalement l’université du lycée, selon le texte ?', options: ['Le prix des cours', 'Le degré d’autonomie exigé des étudiants', 'La distance depuis chez elle', 'La couleur des bâtiments'], answer: 1 },
          { type: 'mcq', prompt: 'Que prévient le professeur de linguistique ?', options: ['Qu’il viendra chercher les étudiants en difficulté', 'Que la responsabilité de solliciter de l’aide revient à l’étudiant', 'Qu’il n’y aura pas d’examens', 'Que la présence est obligatoire chaque jour'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila se sent-elle en toute fin de matinée ?', options: ['Complètement indifférente', 'Un mélange d’anxiété et d’enthousiasme', 'Totalement confiante', 'En colère'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : pourquoi Léa peut-elle rassurer Camila avec autant d’assurance ?', options: ['Parce qu’elle ment', 'Parce qu’elle est déjà plus habituée au système universitaire', 'Parce qu’elle n’a jamais eu de difficulté', 'Par pure politesse'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « il incombe à » ?', options: ['Il est interdit à', 'C’est la responsabilité de', 'Il est impossible pour', 'Il est facultatif pour'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime une opinion, et non un fait ?', options: ['Le professeur distribue un syllabus détaillé.', 'C’est vertigineux, avoue Camila.', 'Camila retrouve Léa et Karim à la pause déjeuner.', 'Camila loue un studio près du centre-ville.'], answer: 1 },
          { type: 'mcq', prompt: 'Comparaison d’informations : en quoi le studio actuel de Camila diffère-t-il de celui évoqué deux ans plus tôt ?', options: ['Il est identique en tout point', 'Il est plus central mais moins spacieux', 'Il est plus spacieux mais moins central', 'Il n’y a aucune comparaison dans le texte'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : quel sentiment domine à la fin du texte ?', options: ['Le regret d’être partie', 'La fierté du chemin parcouru', 'La peur de l’échec', 'L’indifférence totale'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de la vie universitaire',
        description: 'Le vocabulaire essentiel pour décrire l’environnement et les exigences universitaires françaises.',
        vocabulary: [
          { word: 'un amphithéâtre', translation: 'un auditorio/aula magna', example: 'Le cours magistral a lieu dans un grand amphithéâtre.' },
          { word: 'une unité d’enseignement', translation: 'una asignatura/módulo', example: 'Cette unité d’enseignement porte sur la linguistique appliquée.' },
          { word: 'un syllabus', translation: 'un programa de curso', example: 'Le professeur a distribué le syllabus dès le premier cours.' },
          { word: 'l’autonomie académique', translation: 'la autonomía académica', example: 'L’université exige une grande autonomie académique de ses étudiants.' },
          { word: 'décrocher (familier, scolaire)', translation: 'quedarse atrás/desconectar', example: 'Certains étudiants décrochent dès les premières semaines.' },
          { word: 'galvanisé(e)', translation: 'galvanizado/a, entusiasmado/a', example: 'Elle rentre chez elle galvanisée par cette première journée.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « un amphithéâtre » dans un contexte universitaire ?', options: ['Un gimnasio', 'Un auditorio/aula magna', 'Una biblioteca', 'Un laboratorio'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « décrocher » dans un contexte scolaire ?', options: ['Aprobar con éxito', 'Quedarse atrás/desconectar', 'Graduarse', 'Faltar una vez'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « l’autonomie académique » ?', options: ['La ayuda constante del profesor', 'La capacidad de organizarse sin supervisión directa', 'La obligación de asistir a clase', 'El pago de la matrícula'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « galvanisé(e) » ?', options: ['Agotado/a sin energía', 'Lleno/a de energía y entusiasmo', 'Indiferente', 'Confundido/a'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « un syllabus » ?', options: ['Un examen final', 'Un programa detallado de curso', 'Una lista de estudiantes', 'Un edificio universitario'], answer: 1 }
        ]
      }),
      grammar: activity('grammar', {
        title: 'La mise en relief (c’est... qui/que) et le subjonctif d’opinion nuancée',
        description: 'Mettre en valeur un élément de la phrase et exprimer une opinion nuancée avec le subjonctif.',
        grammarNote: 'La mise en relief avec « c’est... qui » (pour un sujet) ou « c’est... que » (pour un complément) permet d’insister sur un élément précis de la phrase à l’écrit soutenu : « C’est cette différence d’échelle qui la déstabilise. » « C’est à elle qu’il revient d’organiser son parcours. » Après certains verbes d’opinion nuancée (il semble que, il se peut que, il n’est pas certain que), on utilise le subjonctif pour marquer un degré d’incertitude, même en registre soutenu.',
        phrases: ['C’est... qui...', 'C’est... que...', 'Il semble que...', 'Il n’est pas certain que...'],
        exercises: [
          { type: 'mcq', prompt: '___ cette liberté qui l’impressionne le plus.', options: ['Ça', 'C’est', 'Il est', 'Elle est'], answer: 1 },
          { type: 'mcq', prompt: 'C’est à elle ___ il revient d’organiser son parcours.', options: ['qui', 'que', 'dont', 'où'], answer: 1 },
          { type: 'mcq', prompt: 'Il semble que cette expérience lui ___ énormément appris.', options: ['a', 'ait', 'avait', 'aura'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle structure met en relief le sujet de la phrase ?', options: ['C’est... que', 'C’est... qui', 'C’est... dont', 'C’est... où'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'un-exposer-a-preparer',
    title: 'Un exposé à préparer',
    titleEs: 'Una exposición por preparar',
    description: 'Camila prépare, avec un groupe d’étudiants internationaux, un exposé complexe sur la diversité linguistique dans les Caraïbes.',
    order: 2,
    accessTier: 'free',
    unitOverview: {
      objective: 'Comprendre un travail de groupe académique complexe et maîtriser le discours rapporté nuancé.',
      outcomes: [
        'comprendre les dynamiques d’un travail de groupe universitaire',
        'analyser un vocabulaire académique spécialisé',
        'utiliser le discours rapporté avec concordance des temps complète',
        'reconnaître les nuances de l’expression de la probabilité en français soutenu'
      ],
      grammar: ['discours rapporté avec concordance des temps complète', 'expression de la probabilité (registre soutenu : il est probable que, il n’est pas exclu que)', 'accord et cohérence dans un texte académique long'],
      vocabulary: ['une soutenance', 'la diversité linguistique', 'un consensus', 'une problématique'],
      scenario: 'Camila collabore avec un groupe international pour préparer un exposé sur la diversité linguistique caribéenne, un sujet qui la touche personnellement.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Un travail de groupe exigeant',
        description: 'Camila collabore avec des étudiants internationaux sur un exposé académique concernant la diversité linguistique des Caraïbes.',
        reading: {
          title: 'Un travail de groupe exigeant',
          parts: [
            "Pour son premier grand exposé universitaire, Camila se retrouve associée à trois autres étudiants d'origines très différentes : Yuki, japonaise, spécialiste en sociolinguistique ; Ahmed, tunisien, passionné d'histoire coloniale ; et Clara, française, dont c'est le premier contact réel avec des perspectives extra-européennes sur la langue. Leur sujet, imposé par le professeur, porte sur la diversité linguistique dans les Caraïbes, une problématique que Camila connaît intimement, mais qu'elle n'avait encore jamais eu l'occasion d'analyser avec une telle rigueur académique.",
            "Dès la première réunion de préparation, des tensions méthodologiques apparaissent. Ahmed insiste pour que le groupe adopte une approche essentiellement historique, centrée sur l'héritage colonial des langues créoles, tandis que Yuki, elle, souhaiterait davantage explorer les mécanismes linguistiques contemporains de contact entre langues. Clara, plus hésitante, avait initialement proposé une approche purement descriptive, avant d'admettre, après discussion, qu'elle manquait sans doute de recul sur un sujet aussi complexe. « Il est probable que nous devions combiner ces trois perspectives plutôt que d'en privilégier une seule », suggère finalement Camila, consciente qu'aucun consensus rapide ne semble se dessiner naturellement.",
            "Le professeur, consulté par e-mail sur cette difficulté méthodologique, avait répondu qu'il n'était pas exclu qu'un travail véritablement interdisciplinaire produise, en définitive, un résultat plus riche qu'une approche unique et univoque. Il avait ajouté, dans son message, qu'il attendait précisément de ses étudiants qu'ils apprennent à négocier entre des perspectives divergentes, une compétence qu'il jugeait tout aussi précieuse que la maîtrise du contenu académique lui-même. Cette réponse, transmise par Camila au reste du groupe, contribue à apaiser sensiblement les tensions initiales.",
            "Après plusieurs semaines de travail acharné, incluant de nombreuses visioconférences tardives et des débats parfois houleux sur la structure finale de leur présentation, le groupe parvient enfin à un exposé cohérent, combinant habilement les perspectives historique, linguistique et descriptive initialement défendues par chacun. Le jour de la soutenance, alors que Camila prend la parole pour présenter la partie consacrée à son expérience personnelle du multilinguisme caribéen, elle ressent une fierté particulière : celle d'avoir transformé un désaccord méthodologique initial en une véritable richesse collective, une leçon qu'elle sait devoir dépasser largement le cadre de ce seul exposé universitaire.",
            "À l'issue de la présentation, le jury, composé de deux professeurs de linguistique, salue unanimement la qualité de l'articulation entre les trois approches défendues par le groupe, soulignant en particulier la rareté d'un tel exercice de synthèse chez des étudiants de première année. Camila, en recevant ces félicitations, songe avec émotion à quel point ce travail collectif a fini par ressembler, presque malgré elle, à sa propre existence entre plusieurs cultures : un espace où la tension entre des perspectives divergentes, loin d'être un obstacle, devient précisément la source d'une compréhension plus profonde et plus nuancée du monde."
          ],
          questions: [
            'Qui compose le groupe de travail de Camila, et quelles sont leurs spécialités respectives ?',
            'Quelle tension méthodologique apparaît lors de la première réunion ?',
            'Comment le professeur répond-il à la difficulté rencontrée par le groupe ?'
          ],
          ordering: {
            prompt: 'Remets les étapes du travail de groupe dans l’ordre.',
            events: [
              'Le groupe de quatre étudiants est formé autour du sujet de la diversité linguistique caribéenne.',
              'Des tensions méthodologiques apparaissent lors de la première réunion.',
              'Le professeur répond par e-mail, encourageant une approche interdisciplinaire.',
              'Le groupe présente un exposé cohérent lors de la soutenance finale.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce texte ?', options: ['D’un examen individuel de Camila', 'De la préparation collective d’un exposé universitaire complexe', 'D’un voyage au Japon', 'D’une dispute personnelle entre Camila et Clara'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : quelle est la spécialité d’Ahmed ?', options: ['La sociolinguistique', 'L’histoire coloniale', 'La littérature comparée', 'La linguistique contemporaine'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle approche Yuki souhaite-t-elle privilégier ?', options: ['Une approche purement historique', 'Les mécanismes contemporains de contact entre langues', 'Une approche uniquement descriptive', 'Aucune approche académique'], answer: 1 },
          { type: 'mcq', prompt: 'Que suggère finalement Camila face au désaccord méthodologique ?', options: ['D’abandonner le sujet', 'De combiner les trois perspectives plutôt que d’en choisir une seule', 'De changer complètement de groupe', 'De demander un autre sujet au professeur'], answer: 1 },
          { type: 'mcq', prompt: 'Que répond le professeur, consulté sur cette difficulté ?', options: ['Qu’il faut choisir une seule approche', 'Qu’une approche interdisciplinaire peut être plus riche', 'Qu’il refuse de répondre', 'Qu’il faut changer de sujet'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : pourquoi le professeur valorise-t-il autant la négociation entre perspectives divergentes ?', options: ['Parce que c’est plus facile à noter', 'Parce qu’il la considère comme une compétence aussi précieuse que le contenu académique', 'Parce qu’il n’a pas d’autre choix', 'Par simple habitude administrative'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « il n’était pas exclu que » ?', options: ['C’était impossible', 'C’était une possibilité envisageable', 'C’était certain', 'C’était interdit'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime une opinion, et non un fait ?', options: ['Le groupe est composé de quatre étudiants.', 'Il est probable que nous devions combiner ces trois perspectives.', 'Le professeur a répondu par e-mail.', 'La soutenance a eu lieu après plusieurs semaines de travail.'], answer: 1 },
          { type: 'mcq', prompt: 'Quel sentiment Camila ressent-elle le jour de la soutenance ?', options: ['Le regret d’avoir participé', 'Une fierté particulière liée à la transformation du désaccord en richesse collective', 'L’indifférence totale', 'La peur de parler en public'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : quelle leçon générale Camila tire-t-elle de cette expérience ?', options: ['Il vaut mieux travailler seul', 'Un désaccord initial peut se transformer en richesse collective', 'Les travaux de groupe sont toujours inutiles', 'Il faut toujours imposer son propre point de vue'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire académique avancé',
        description: 'Le vocabulaire essentiel pour décrire un travail de recherche universitaire collectif.',
        vocabulary: [
          { word: 'une soutenance', translation: 'una defensa (académica)', example: 'La soutenance de l’exposé a eu lieu devant toute la classe.' },
          { word: 'la diversité linguistique', translation: 'la diversidad lingüística', example: 'Les Caraïbes sont marquées par une grande diversité linguistique.' },
          { word: 'un consensus', translation: 'un consenso', example: 'Le groupe a fini par trouver un consensus.' },
          { word: 'une problématique', translation: 'una problemática/enfoque de investigación', example: 'La problématique choisie était particulièrement complexe.' },
          { word: 'interdisciplinaire', translation: 'interdisciplinario/a', example: 'Le professeur encourageait une approche interdisciplinaire.' },
          { word: 'univoque', translation: 'unívoco/a, de un solo sentido', example: 'Il vaut mieux éviter une approche trop univoque.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « une soutenance » dans un contexte académique ?', options: ['Un examen escrito', 'Una defensa oral de un trabajo', 'Una biblioteca', 'Un descanso entre clases'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « un consensus » ?', options: ['Un desacuerdo total', 'Un consenso, un acuerdo colectivo', 'Un examen final', 'Una crítica'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « interdisciplinaire » ?', options: ['Limitado a una sola disciplina', 'Que combina varias disciplinas', 'Sin ninguna disciplina', 'Solo teórico'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « une problématique » dans ce contexte ?', options: ['Un problema sin solución', 'Un enfoque o pregunta central de investigación', 'Un examen difícil', 'Una discusión sin importancia'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « univoque » ?', options: ['Que tiene un solo sentido posible', 'Que tiene múltiples interpretaciones', 'Que es contradictorio', 'Que es incomprensible'], answer: 0 }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le discours rapporté complexe et l’expression de la probabilité soutenue',
        description: 'Rapporter des propos avec une concordance des temps complète et exprimer la probabilité en registre soutenu.',
        grammarNote: 'Au discours rapporté avec un verbe introducteur au passé, la concordance des temps est complète : présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel présent : « Il avait répondu qu’il n’était pas exclu qu’un travail interdisciplinaire produise un résultat plus riche. » En registre soutenu, la probabilité s’exprime avec des tournures comme « il est probable que », « il n’est pas exclu que » (suivies du subjonctif ou de l’indicatif selon le degré de certitude).',
        phrases: ['Il avait répondu que...', 'Il avait ajouté que...', 'Il est probable que...', 'Il n’est pas exclu que...'],
        exercises: [
          { type: 'mcq', prompt: 'Le professeur avait répondu qu’il ___ pas exclu qu’un tel travail soit plus riche.', options: ['n’est', 'n’était', 'ne sera', 'ne soit'], answer: 1 },
          { type: 'mcq', prompt: 'Il avait ajouté qu’il ___ cette compétence tout aussi précieuse.', options: ['juge', 'jugeait', 'jugera', 'jugerait'], answer: 1 },
          { type: 'mcq', prompt: 'Il est probable que le groupe ___ un compromis.', options: ['trouve', 'trouvera', 'a trouvé', 'trouverait'], answer: 0 },
          { type: 'mcq', prompt: 'Au discours rapporté au passé, le futur simple devient...', options: ['Le passé composé', 'Le conditionnel présent', 'L’imparfait', 'Le subjonctif'], answer: 1 }
        ]
      })
    }
  }
];

module.exports = {
  language: 'french',
  level: 'C1',
  courseTitle: 'Français C1',
  courseDescription:
    'Français avancé (niveau C1) : registre universitaire et soutenu, organisé en unités thématiques qui poursuivent le parcours de Camila devenue étudiante à l’université de Tours. Portée actuelle : unités 1 et 2, sections reading/vocabulary/grammar.',
  units
};
