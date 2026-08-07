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
        title: 'L’autonomie, pierre angulaire de l’université française',
        description: 'Un dossier d’analyse sur les réformes qui ont fait de l’autonomie étudiante le principe central du premier cycle universitaire en France.',
        reading: {
          title: 'L’autonomie, pierre angulaire de l’université française',
          parts: [
            "Personne ne viendra vous chercher si vous manquez trois semaines de cours. C'est en 2007, avec la loi relative aux libertés et responsabilités des universités, que la France a engagé une transformation profonde de son enseignement supérieur, dont les effets se font encore sentir aujourd'hui dans chaque amphithéâtre du pays. Contrairement au lycée, où l'élève est suivi de près, encadré par des professeurs principaux et des conseils de classe réguliers, l'université repose sur un principe radicalement différent : c'est à l'étudiant lui-même qu'il revient d'organiser son travail, de solliciter de l'aide en cas de difficulté et de construire, semestre après semestre, son propre parcours au sein d'unités d'enseignement souvent peu coordonnées entre elles.",
            "Cette autonomie, présentée par les textes officiels comme une préparation à la vie professionnelle, produit des effets contrastés selon les profils étudiants. Les enquêtes menées par le ministère de l'Enseignement supérieur montrent qu'environ un tiers des étudiants de première année ne poursuivent pas directement en deuxième année, un taux qui reste, malgré plusieurs réformes successives, l'un des plus élevés d'Europe occidentale. Les chercheurs qui étudient ce phénomène s'accordent sur un constat : ce n'est pas nécessairement le niveau académique qui fait défaut, mais bien la capacité à s'orienter seul dans un système qui suppose, dès les premières semaines, une maturité méthodologique que le secondaire ne prépare pas toujours suffisamment.",
            "Face à ce constat, de nombreux établissements ont mis en place des dispositifs d'accompagnement : tutorat entre pairs, semaines de méthodologie, référents pédagogiques joignables par courriel. Il n'est pas exclu que ces mesures expliquent en partie l'amélioration progressive des taux de réussite observée depuis une décennie. Il reste cependant que l'efficacité de ces dispositifs dépend largement de la manière dont les étudiants eux-mêmes en font usage, ce qui replace, une fois encore, la question de l'autonomie au centre du débat : peut-on réellement enseigner l'autonomie, ou celle-ci ne s'acquiert-elle que par l'expérience, parfois douloureuse, de la difficulté ?",
            "C'est cette tension, entre liberté accordée et accompagnement nécessaire, qui définit aujourd'hui l'identité de l'université française. Il semble peu probable qu'un modèle unique de soutien convienne à l'ensemble d'un public aussi hétérogène que celui des premiers cycles, où se côtoient bacheliers généraux, technologiques et professionnels. C'est précisément cette diversité de parcours antérieurs qui explique, selon plusieurs rapports parlementaires récents, la nécessité de repenser continuellement l'équilibre entre exigence académique et droit à l'erreur pendant les premières années d'études supérieures.",
            "Certains établissements sont allés plus loin que le simple tutorat en repensant l'organisation même de la première année. C'est le cas du dispositif « Oui si », qui permet à un étudiant dont le dossier de candidature laisse craindre des difficultés de s'inscrire tout de même dans la filière de son choix, à condition de suivre en parallèle des heures de renforcement méthodologique. Il n'est pas exclu que ce type de parcours, qui reste minoritaire, inspire à terme une réorganisation plus large du premier cycle, tant les comparaisons internationales - notamment avec les systèmes scandinaves, où l'accompagnement individualisé est intégré dès le départ au cursus - alimentent aujourd'hui les débats sur l'avenir de l'université française."
          ],
          questions: [
            'Quel principe distingue fondamentalement l’université du lycée en France ?',
            'Que révèlent les enquêtes ministérielles sur la première année d’université ?',
            'Quels dispositifs les établissements ont-ils mis en place pour accompagner les étudiants ?'
          ],
          ordering: {
            prompt: 'Remets les étapes de ce dossier d’analyse dans l’ordre.',
            events: [
              'La loi de 2007 transforme l’organisation de l’enseignement supérieur français.',
              'Les enquêtes ministérielles révèlent un taux élevé d’échec en première année.',
              'Les établissements créent des dispositifs d’accompagnement.',
              'Le dossier interroge la possibilité même d’enseigner l’autonomie.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Information explicite : que change la loi de 2007 relative aux libertés et responsabilités des universités ?', options: ['Elle supprime les examens', 'Elle engage une transformation vers davantage d’autonomie des universités', 'Elle rend le lycée obligatoire jusqu’à 20 ans', 'Elle finance la construction de nouveaux amphithéâtres'], answer: 1 },
          { type: 'mcq', prompt: 'Que montrent les enquêtes du ministère citées dans le texte ?', options: ['Que tous les étudiants réussissent leur première année', 'Qu’environ un tiers des étudiants ne passent pas directement en deuxième année', 'Que la France a le meilleur taux de réussite d’Europe', 'Que les cours magistraux ont disparu'], answer: 1 },
          { type: 'mcq', prompt: 'Selon les chercheurs cités, quelle est la cause principale de l’échec en première année ?', options: ['Le manque de niveau académique uniquement', 'La difficulté à s’orienter seul dans un système autonome', 'Le prix des logements étudiants', 'L’absence totale de cours'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’est-ce que le dispositif « Oui si », décrit dans le dernier paragraphe, permet concrètement à un étudiant ?', options: ['De redoubler automatiquement', 'De s’inscrire dans la filière choisie en suivant en parallèle un renforcement méthodologique', 'D’éviter tous les examens', 'De changer d’université sans dossier'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : quelle question centrale le texte laisse-t-il ouverte ?', options: ['Faut-il supprimer l’université ?', 'L’autonomie peut-elle vraiment s’enseigner, ou s’acquiert-elle par l’expérience ?', 'Faut-il rendre le lycée plus court ?', 'Faut-il interdire le tutorat ?'], answer: 1 }
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
        title: 'Créoles caribéens : d’une langue de la plantation à une langue de la nation',
        description: 'Un dossier documentaire sur la formation historique et le statut actuel des langues créoles dans les Caraïbes.',
        reading: {
          title: 'Créoles caribéens : d’une langue de la plantation à une langue de la nation',
          parts: [
            "Un mot, deux syllabes, et pourtant des siècles de préjugés à déconstruire : c'est ainsi que Karim résume, en une phrase, le sujet que son groupe a choisi pour l'exposé. C'est au cours des dix-septième et dix-huitième siècles, sur les habitations sucrières des Caraïbes, que sont nés les créoles à base lexicale française, notamment en Haïti, en Guadeloupe, en Martinique et dans les Petites Antilles. Confrontées à un français administratif qu'elles ne maîtrisaient pas et entre elles souvent dépourvues d'une langue commune, les populations réduites en esclavage ont élaboré des systèmes linguistiques nouveaux, empruntant leur lexique en grande partie au français tout en développant une grammaire propre, largement influencée par les langues d'Afrique de l'Ouest. C'est cette double origine qui explique pourquoi les créoles ne peuvent être réduits, comme on l'a longtemps affirmé à tort, à un français simplifié ou déformé.",
            "Les linguistes qui étudient ces langues insistent aujourd'hui sur leur cohérence grammaticale interne : le créole haïtien, par exemple, possède un système verbal fondé sur des marqueurs de temps et d'aspect placés avant le verbe, une structure radicalement différente de la conjugaison française. Il est donc probable que les préjugés persistants envers les créoles tiennent moins à une réalité linguistique qu'à l'héritage social de la colonisation, qui associait la langue des maîtres au prestige et celle des esclaves à l'infériorité — une hiérarchie que la sociolinguistique contemporaine s'attache précisément à déconstruire.",
            "Le statut institutionnel des créoles reste néanmoins très inégal selon les territoires. En Haïti, la Constitution de 1987 a fait du créole une langue officielle à part entière, aux côtés du français, et son enseignement s'est progressivement généralisé à l'école primaire. Dans les départements français d'Amérique, en revanche, le créole demeure une langue régionale reconnue mais non officielle, enseignée de façon optionnelle, alors même qu'il reste la langue la plus couramment parlée dans la vie quotidienne d'une majorité d'habitants. Il n'est pas exclu que cet écart entre pratique sociale et reconnaissance institutionnelle continue d'alimenter les débats sur l'identité linguistique de ces territoires.",
            "Cette question dépasse largement le seul cadre scolaire. Reconnaître pleinement une langue créole, c'est aussi interroger la manière dont une société hiérarchise ses propres formes d'expression et transmet sa mémoire collective. De nombreux écrivains caribéens, de Patrick Chamoiseau à Frankétienne, ont ainsi fait du créole un instrument littéraire à part entière, démontrant qu'une langue née dans la contrainte peut devenir, plusieurs siècles plus tard, un espace de création et de souveraineté culturelle pleinement assumé.",
            "Le débat déborde également largement les frontières caribéennes, puisqu'il rejoint des questions plus générales de politique linguistique. Il est probable que la manière dont un État choisit de reconnaître - ou non - ses langues régionales et créoles en dise long sur sa conception même de la nation : une seule langue commune imposée à tous, ou une pluralité de langues coexistant à égalité de statut. C'est sans doute cette même tension qui explique pourquoi, dans les Caraïbes comme ailleurs, la question créole continue de mobiliser linguistes, écrivains et responsables politiques bien au-delà des salles de classe."
          ],
          questions: [
            'Dans quel contexte historique les créoles caribéens sont-ils nés ?',
            'Qu’est-ce qui distingue grammaticalement le créole haïtien du français ?',
            'Quel est le statut officiel du créole en Haïti, et dans les départements français d’Amérique ?'
          ],
          ordering: {
            prompt: 'Remets les étapes de ce dossier documentaire dans l’ordre.',
            events: [
              'Les créoles naissent sur les habitations sucrières aux dix-septième et dix-huitième siècles.',
              'Les linguistes démontrent la cohérence grammaticale propre aux créoles.',
              'Haïti reconnaît le créole comme langue officielle en 1987.',
              'Des écrivains caribéens font du créole un instrument littéraire.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Information explicite : où et quand naissent les créoles à base française, selon le texte ?', options: ['En Europe au vingtième siècle', 'Sur les habitations sucrières des Caraïbes aux dix-septième et dix-huitième siècles', 'En Afrique avant la colonisation', 'Au Canada au dix-neuvième siècle'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’est-ce qui caractérise le système verbal du créole haïtien, selon le texte ?', options: ['Il est identique à la conjugaison française', 'Il utilise des marqueurs de temps et d’aspect placés avant le verbe', 'Il n’a aucune structure grammaticale', 'Il n’existe qu’à l’écrit'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : pourquoi les préjugés envers le créole persistent-ils, selon le texte ?', options: ['Parce que le créole est réellement une langue inférieure', 'Parce qu’ils tiennent à l’héritage social de la colonisation plutôt qu’à des faits linguistiques', 'Parce qu’aucun linguiste ne l’étudie', 'Parce que le créole n’a pas de grammaire'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle différence le texte établit-il entre le statut du créole en Haïti et dans les départements français d’Amérique ?', options: ['Aucune différence n’existe', 'Il est langue officielle en Haïti, seulement régionale reconnue ailleurs', 'Il n’est parlé qu’en Haïti', 'Il est interdit dans les départements français'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : quel rôle les écrivains caribéens, comme Chamoiseau et Frankétienne, jouent-ils selon le texte ?', options: ['Ils rejettent le créole', 'Ils transforment le créole en instrument littéraire et de souveraineté culturelle', 'Ils écrivent uniquement en français', 'Ils ignorent la question linguistique'], answer: 1 }
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

units.push(...require('./french-c1-advanced-units'));

// Each unit's activities.reading now carries its own real, factual C1 essay
// (see french-c1-units.js units 1-2 above and french-c1-advanced-units.js
// for units 3-14). We only resync the reading.questions preview from the
// unit's own exercises so it always reflects that unit's specific text.
units.forEach((unit) => {
  const activity = unit.activities?.reading;
  if (activity?.reading && Array.isArray(activity.exercises)) {
    activity.reading.questions = activity.exercises.slice(0, 5).map((exercise) => exercise.prompt);
  }
});
require('./french-grammar-tests').ensureFrenchGrammarTests(units, 'C1');
require('./advanced-communication-skills').ensureAdvancedCommunicationSkills(units, {
  language: 'french',
  level: 'C1'
});
require('./french-c1-c2-listening-adapter').applyFrenchC1C2Listening(units, 'C1');

module.exports = {
  language: 'french',
  level: 'C1',
  courseTitle: 'Français C1',
  courseDescription:
    'Français avancé (niveau C1) : douze unités intégrant compréhension écrite et orale, production orale, écriture guidée, lexique analytique et grammaire avancée.',
  units
};
