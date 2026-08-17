// scripts/content/french-b1-units.js
// Hand-authored French B1 content, same shape as
// scripts/content/french-a1-units.js / french-a2-units.js. Real-world,
// editorial/topic-based content organized in ten thematic units, covering
// more independent, opinion-driven B1 situations. Meant to be extended the
// same way A2 grew from 2 to 4 units.
//
// Consumed by scripts/build-french-b1-seed.js, which flattens this into
// lib/seed-lessons.json/lib/seed-units.json the same way the A1/A2 files
// do for their levels.

const DEFAULTS = {
  reading: { duration: 15, xp: 30 },
  listening: { duration: 12, xp: 30 },
  speaking: { duration: 12, xp: 25 },
  writing: { duration: 16, xp: 30 },
  grammar: { duration: 12, xp: 25 },
  vocabulary: { duration: 8, xp: 20 },
  dialogue: { duration: 10, xp: 20 }
};

function activity(skill, fields) {
  return { skill, duration: DEFAULTS[skill].duration, xp: DEFAULTS[skill].xp, ...fields };
}

const units = [
  // ---------------------------------------------------------------
  {
    slug: 'projets-et-avenir',
    title: 'Projets et avenir',
    titleEs: 'Proyectos y futuro',
    description: 'Comment transformer une ambition professionnelle en un projet réaliste, étape par étape.',
    order: 1,
    accessTier: 'free',
    unitOverview: {
      objective: 'Exprimer un projet, formuler une hypothèse et justifier un choix.',
      outcomes: [
        'parler de projets avec le futur simple',
        'exprimer une hypothèse avec si + présent',
        'donner son opinion et la justifier',
        'comparer deux options avec nuance'
      ],
      grammar: ['futur simple', 'hypothèse avec si + présent', 'conditionnel présent (politesse et hypothèse)', 'connecteurs d’opinion'],
      vocabulary: ['le projet', 'l’avenir', 'à mon avis', 'd’un côté / de l’autre côté'],
      scenario: 'De nombreux lycéens doivent transformer une ambition professionnelle vague en un projet concret, étape par étape.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Rester ou repartir ? Le dilemme des élèves en échange',
        description: 'De nombreux élèves en échange scolaire hésitent entre prolonger leur séjour en France ou rentrer chez eux.',
        reading: {
          title: 'Rester ou repartir ? Le dilemme des élèves en échange',
          parts: [
            "À quelques mois de la fin de leur année scolaire en France, de nombreux élèves en échange doivent prendre une décision importante : rester une année de plus, ou rentrer chez eux. Certains parents proposent de prolonger l'échange si l'élève le souhaite vraiment, mais la décision n'est jamais simple. D'un côté, beaucoup d'élèves adorent leur nouvelle vie : leurs amis, leur famille d'accueil, le lycée, et tout ce qu'ils ont appris en français. De l'autre côté, leur famille et leurs amis d'enfance leur manquent énormément, surtout les grands-parents, qu'ils n'ont parfois pas vus depuis presque un an.",
            "Beaucoup en parlent avec leurs amis les plus proches. « Si je reste, je vais continuer à progresser en français et je pourrai peut-être étudier dans une université française plus tard », expliquent souvent ces élèves. « Mais si je rentre maintenant, je vais retrouver ma famille, mais je vais aussi devoir tout recommencer avec mes amis là-bas, qui ont continué leur vie sans moi. » Un ami répond souvent : « À mon avis, il n'y a pas de mauvaise décision ici. Si tu restes, on continuera à être amis ; si tu pars, on s'écrira et je viendrai peut-être te rendre visite un jour ! »",
            "Ces conversations aident souvent les élèves à voir la situation plus clairement. Beaucoup réalisent que, quelle que soit leur décision, ils ne perdront pas ce qu'ils ont construit cette année : une nouvelle langue, de nouveaux amis, une nouvelle façon de voir le monde. Selon les associations d'échanges scolaires, environ un élève sur cinq décide de prolonger son séjour d'une année supplémentaire, tandis que la majorité rentre chez eux avec le projet de revenir étudier en France plus tard, si tout se passe bien. Dans les deux cas, les amitiés nouées pendant l'échange durent souvent bien au-delà de cette année."
          ],
          questions: [
            'Quelle décision doivent prendre de nombreux élèves en échange ?',
            'Que leur manque-t-il le plus s’ils restent en France ?',
            'Quelle proportion d’élèves décide de prolonger son séjour, selon le texte ?'
          ],
          ordering: {
            prompt: 'Remets les idées du texte dans l’ordre.',
            events: [
              'Certains parents proposent de prolonger l’échange.',
              'Les élèves parlent de leur hésitation avec un ami proche.',
              'Ces conversations les aident à voir la situation plus clairement.',
              'La majorité rentre chez eux, avec le projet de revenir plus tard.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Quel est le sujet principal du texte ?', options: ['Un voyage touristique', 'Une décision importante sur l’avenir des élèves en échange', 'Un problème de santé', 'Un examen scolaire'], answer: 1 },
          { type: 'mcq', prompt: 'Que proposent certains parents ?', options: ['De rentrer immédiatement', 'De prolonger l’échange si l’élève le souhaite', 'De changer de famille d’accueil', 'De changer de ville en France'], answer: 1 },
          { type: 'mcq', prompt: 'Qui manque le plus aux élèves s’ils restent en France ?', options: ['Leurs amis d’enfance seulement', 'Leurs grands-parents et leur famille', 'Leurs professeurs', 'Personne en particulier'], answer: 1 },
          { type: 'mcq', prompt: 'Que répond souvent un ami pour rassurer ?', options: ['Qu’il faut absolument rester', 'Qu’il n’y a pas de mauvaise décision', 'Qu’il faut absolument partir', 'Qu’on ne se reverra jamais'], answer: 1 },
          { type: 'mcq', prompt: 'Que fait la majorité des élèves, selon le texte ?', options: ['Ils restent tous définitivement en France', 'Ils rentrent chez eux avec le projet de revenir plus tard', 'Ils ne reviennent jamais en France', 'Ils changent de pays d’échange'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « quelle que soit leur décision » signifie...', options: ['Peu importe ce qu’ils choisissent', 'Ils doivent absolument choisir la France', 'Ils n’ont pas le droit de choisir', 'Leur décision est déjà annulée'], answer: 0 },
          { type: 'mcq', prompt: 'Quel connecteur le texte utilise-t-il pour opposer deux idées ?', options: ['Parce que', 'D’un côté / de l’autre côté', 'Donc', 'Ensuite'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle inférence peut-on faire sur les amitiés nouées pendant l’échange ?', options: ['Elles se terminent presque toujours', 'Elles durent souvent bien au-delà de l’année', 'Elles ne sont jamais sincères', 'Elles causent des conflits'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle phrase exprime une opinion, et non un fait ?', options: ['Les élèves vivent en France depuis un an.', 'À mon avis, il n’y a pas de mauvaise décision ici.', 'Les élèves parlent avec leurs amis.', 'Certains parents proposent de prolonger l’échange.'], answer: 1 },
          { type: 'mcq', prompt: 'Quel est le ton général de la fin du texte ?', options: ['Pessimiste et froid', 'Nostalgique mais plein d’espoir', 'Fâché et déçu', 'Indifférent'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Une conversation entre amies',
        description: 'Écoute Camila et Léa discuter de l’avenir de Camila.',
        intro: 'Écoute la conversation entre Camila et Léa au sujet de la décision de Camila.',
        dialogue: [
          { speaker: 'Camila', line: 'Si je reste, je vais continuer à progresser en français.', translation: 'Si me quedo, voy a seguir progresando en francés.' },
          { speaker: 'Léa', line: 'Et si tu pars, tu vas retrouver ta famille.', translation: 'Y si te vas, vas a reencontrarte con tu familia.' },
          { speaker: 'Camila', line: 'C’est vrai, mais je vais devoir tout recommencer avec mes amis là-bas.', translation: 'Es verdad, pero voy a tener que empezar de nuevo con mis amigos allá.' },
          { speaker: 'Léa', line: 'À mon avis, il n’y a pas de mauvaise décision.', translation: 'En mi opinión, no hay una mala decisión aquí.' },
          { speaker: 'Camila', line: 'Merci, Léa. Ça m’aide vraiment d’en parler avec toi.', translation: 'Gracias, Léa. Realmente me ayuda hablar de esto contigo.' }
        ],
        phrases: ['Si je reste...', 'Si tu pars...', 'À mon avis...', 'Ça m’aide de...'],
        exercises: [
          { type: 'mcq', prompt: 'Que se passe-t-il si Camila reste, selon elle ?', options: ['Elle va oublier le français', 'Elle va continuer à progresser en français', 'Elle va retourner tout de suite', 'Elle va changer de famille'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit Léa sur la décision de Camila ?', options: ['Qu’elle est mauvaise', 'Qu’il n’y a pas de mauvaise décision', 'Qu’elle doit rester obligatoirement', 'Qu’elle ne la comprend pas'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila se sent-elle après avoir parlé avec Léa ?', options: ['Plus confuse', 'Aidée et soutenue', 'Fâchée', 'Indifférente'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Exposer un dilemme',
        description: 'Présente oralement une décision difficile et justifie ton choix.',
        mission: 'Prépare une présentation de deux minutes sur un dilemme (réel ou imaginaire), en donnant les avantages et les inconvénients de chaque option, puis ta décision finale et pourquoi.',
        phrases: ['D’un côté... / de l’autre côté...', 'Si je choisis..., je vais...', 'À mon avis...', 'Finalement, j’ai décidé de...'],
        dialogue: [
          { speaker: 'Toi', line: 'D’un côté, si je reste, je vais progresser encore plus. De l’autre côté, si je pars, je vais retrouver ma famille.', translation: 'Por un lado, si me quedo, voy a progresar aún más. Por otro lado, si me voy, voy a reencontrarme con mi familia.' },
          { speaker: 'Toi', line: 'Finalement, j’ai décidé de rentrer, parce que ma famille me manque trop.', translation: 'Finalmente, decidí regresar, porque extraño demasiado a mi familia.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente un dilemme personnel ou imaginaire pendant deux minutes, en justifiant ta décision finale.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Débats avec un/une camarade : chacun défend une option différente du même dilemme.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Une lettre à mes amis',
        description: 'Écris une lettre expliquant ta décision et tes projets futurs.',
        mission: 'Écris 150 à 200 mots sous forme de lettre à un ami, expliquant une décision importante que tu as prise et tes projets pour l’avenir.',
        phrases: ['Je t’écris pour t’annoncer que...', 'J’ai décidé de...', 'Dans le futur, je...', 'Si tout se passe bien, je...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Cher ami, je t’écris pour t’annoncer que j’ai décidé de m’orienter vers des études de vétérinaire. C’était une décision difficile, mais c’est un métier qui me passionne depuis toujours. Si tout se passe bien, je commencerai la classe préparatoire l’année prochaine. Je sais que le chemin sera long, mais je suis prêt(e) à m’organiser étape par étape.', translation: 'Querido amigo, te escribo para anunciarte que decidí orientarme hacia estudios de veterinaria. Fue una decisión difícil, pero es una profesión que me apasiona desde siempre. Si todo va bien, empezaré la clase preparatoria el año que viene. Sé que el camino será largo, pero estoy listo/a para organizarme etapa por etapa.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris une lettre de 150 à 200 mots expliquant une décision importante et tes projets pour l’avenir, en utilisant le futur simple et au moins une hypothèse avec « si ».', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le futur simple et l’hypothèse avec si + présent',
        description: 'Exprimer un projet futur et une conséquence probable.',
        grammarNote: 'Le futur simple se forme généralement à partir de l’infinitif + terminaisons -ai, -as, -a, -ons, -ez, -ont : je resterai, tu partiras, elle décidera. Pour exprimer une hypothèse probable, on utilise « si + présent, futur simple » : « Si je reste, je progresserai en français. » Le verbe après « si » reste toujours au présent, jamais au futur.',
        phrases: ['Si je reste, je...', 'Si tu pars, tu...', 'Nous déciderons...', 'Ils reviendront...'],
        exercises: [
          { type: 'mcq', prompt: 'Si je reste en France, je ___ mon français.', options: ['améliore', 'améliorerai', 'améliorerais', 'ai amélioré'], answer: 1 },
          { type: 'mcq', prompt: 'Si tu ___, tu retrouveras ta famille.', options: ['pars', 'partiras', 'partirais', 'es parti'], answer: 0 },
          { type: 'mcq', prompt: 'Quelle phrase est correcte ?', options: ['Si je serai riche, je voyagerai.', 'Si je suis riche, je voyagerai.', 'Si je suis riche, je voyage.', 'Si je serais riche, je voyagerais.'], answer: 1 },
          { type: 'mcq', prompt: 'Mes amis ___ me rendre visite un jour.', options: ['viendront', 'viennent', 'venir', 'sont venus'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire des projets et de l’opinion',
        description: 'Le vocabulaire essentiel pour parler de l’avenir et exprimer une opinion nuancée.',
        vocabulary: [
          { word: 'le projet', translation: 'el proyecto', example: 'Mon projet est d’étudier en France après le lycée.' },
          { word: 'l’avenir', translation: 'el futuro', example: 'Je pense souvent à mon avenir.' },
          { word: 'à mon avis', translation: 'en mi opinión', example: 'À mon avis, c’est une bonne décision.' },
          { word: 'd’un côté / de l’autre côté', translation: 'por un lado / por otro lado', example: 'D’un côté je veux rester, de l’autre côté ma famille me manque.' },
          { word: 'décider de', translation: 'decidir', example: 'J’ai décidé de rentrer chez moi.' },
          { word: 'quelle que soit', translation: 'cualquiera que sea', example: 'Quelle que soit ta décision, je te soutiens.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « à mon avis » ?', options: ['En mi opinión', 'Por otro lado', 'En el futuro', 'Decidir'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « l’avenir » ?', options: ['El pasado', 'El futuro', 'El proyecto', 'La opinión'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « d’un côté... de l’autre côté... » ?', options: ['Por un lado... por otro lado...', 'A pesar de...', 'Sin embargo...', 'Por lo tanto...'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Un plan B, au cas où',
        description: 'Deux élèves discutent d’un plan de secours si leur premier choix d’orientation échoue.',
        intro: 'Après une réunion d’orientation, deux élèves comparent leurs projets d’avenir.',
        dialogue: [
          { speaker: 'Élève 1', line: 'Si le concours ne marche pas, j’aurai vraiment besoin d’un plan B.', translation: 'Si el examen de acceso no funciona, de verdad necesitaré un plan B.' },
          { speaker: 'Élève 2', line: 'Moi, si ça échoue, je referai une tentative l’année suivante, c’est promis.', translation: 'Yo, si eso falla, lo intentaré de nuevo al año siguiente, lo prometo.' },
          { speaker: 'Élève 1', line: 'Ça me rassure énormément d’en parler avec toi.', translation: 'Me tranquiliza mucho hablar de esto contigo.' },
          { speaker: 'Élève 2', line: 'Et qui sait, peut-être qu’on étudiera dans la même ville un jour.', translation: 'Y quién sabe, quizás estudiemos en la misma ciudad algún día.' }
        ],
        phrases: ['J’aurai besoin de...', 'C’est promis.', 'Ça me rassure.', 'Qui sait...'],
        exercises: [
          { type: 'mcq', prompt: 'Que dit l’élève 1 si le concours ne marche pas ?', options: ['Qu’il abandonnera tout', 'Qu’il aura besoin d’un plan B', 'Qu’il déménagera', 'Qu’il oubliera ce projet'], answer: 1 },
          { type: 'mcq', prompt: 'Que fera l’élève 2 en cas d’échec ?', options: ['Il changera complètement de projet', 'Il retentera l’année suivante', 'Il arrêtera ses études', 'Il ne sait pas'], answer: 1 },
          { type: 'mcq', prompt: 'Que suggère l’élève 2 à la fin du dialogue ?', options: ['Qu’ils ne se reverront jamais', 'Qu’ils pourraient étudier dans la même ville un jour', 'Qu’il faut rester seul', 'Que leur amitié va se terminer'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'identite-et-parcours-personnel',
    title: 'Identité et parcours personnel',
    titleEs: 'Identidad y trayectoria personal',
    description: 'Comment l’identité se construit à travers les expériences vécues, selon les chercheurs en psychologie sociale.',
    order: 2,
    accessTier: 'free',
    unitOverview: {
      objective: 'Raconter son parcours personnel et décrire comment on a changé.',
      outcomes: [
        'raconter une biographie simple',
        'décrire un changement personnel',
        'consolider l’usage du passé composé et de l’imparfait',
        'exprimer une évolution dans le temps'
      ],
      grammar: ['imparfait (introduction)', 'contraste passé composé / imparfait', 'expressions de temps (avant, maintenant, depuis)'],
      vocabulary: ['le parcours', 'changer', 'grandir', 'devenir'],
      scenario: 'Beaucoup de jeunes racontent comment ils ont changé après une expérience marquante, comme un séjour à l’étranger.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Comment un séjour à l’étranger transforme les élèves',
        description: 'Un témoignage type sur la façon dont une année d’échange scolaire change durablement les élèves.',
        reading: {
          title: 'Comment un séjour à l’étranger transforme les élèves',
          parts: [
            "Avant leur départ, beaucoup d'élèves en échange se décrivent comme des personnes plutôt timides. Ils parlaient peu en public, et l'idée de déménager seuls dans un autre pays les terrifiait. Ils passaient leur temps libre avec le même petit groupe d'amis depuis l'école primaire, et ils n'aimaient pas beaucoup sortir de leur zone de confort. Leurs professeurs disaient souvent qu'ils étaient « des élèves sages et discrets ».",
            "Après leur arrivée en France, huit mois en moyenne, la plupart racontent avoir beaucoup changé. Au début, c'était très difficile : ils ne comprenaient presque rien en français, et ils se sentaient souvent seuls, même entourés de leur famille d'accueil. Mais petit à petit, ils ont commencé à prendre confiance en eux. Ils ont dû parler français tous les jours, poser des questions même quand ils avaient peur de se tromper, et se faire de nouveaux amis dans une culture complètement différente de la leur.",
            "Après leur échange, la plupart de ces élèves se disent beaucoup plus sûrs d'eux. Ils participent activement en classe, ils n'ont plus peur de faire des erreurs quand ils parlent, et ils ont appris à sortir de leur zone de confort régulièrement. Leurs amis français disent souvent en riant qu'ils sont devenus « plus bavards qu'eux » ! Selon plusieurs études sur les programmes d'échange, ce type de voyage apprend aux jeunes que le changement est parfois difficile, mais qu'il les rend plus forts.",
            "Quand ils repensent à la personne timide qui est arrivée à l'aéroport de Paris huit mois plus tôt, beaucoup d'anciens élèves en échange ont presque du mal à se reconnaître. Bien sûr, il leur reste encore des progrès à faire en français, et il y a souvent d'autres défis à surmonter avant la fin de l'année scolaire. Mais ils savent désormais qu'ils sont capables de s'adapter à des situations nouvelles, même difficiles. Cette confiance en soi, la plupart la gardent bien après leur retour chez eux."
          ],
          questions: [
            'Comment beaucoup d’élèves se décrivaient-ils avant leur départ pour la France ?',
            'Quelles difficultés rencontrent-ils souvent au début de leur séjour ?',
            'Comment ces élèves changent-ils généralement après leur échange ?'
          ],
          ordering: {
            prompt: 'Remets les étapes du parcours dans l’ordre.',
            events: [
              'Les élèves étaient souvent timides avant leur départ.',
              'Au début en France, ils se sentaient seuls et perdus.',
              'Petit à petit, ils ont pris confiance en eux.',
              'Après l’échange, ils sont devenus des personnes plus sûres d’elles.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Comment beaucoup d’élèves se décrivaient-ils avant leur départ ?', options: ['Bavards et confiants', 'Timides et discrets', 'Fâchés et froids', 'Paresseux'], answer: 1 },
          { type: 'mcq', prompt: 'Après combien de temps, en moyenne, ces élèves racontent-ils avoir beaucoup changé ?', options: ['Deux mois', 'Cinq mois', 'Huit mois', 'Un an'], answer: 2 },
          { type: 'mcq', prompt: 'Quelle difficulté rencontrent-ils souvent au début ?', options: ['Ils n’aimaient pas la nourriture', 'Ils ne comprenaient presque rien en français', 'Ils n’avaient pas de famille d’accueil', 'Ils voulaient rentrer immédiatement'], answer: 1 },
          { type: 'mcq', prompt: 'Comment prennent-ils progressivement confiance en eux ?', options: ['En évitant de parler français', 'En parlant français tous les jours, malgré la peur de se tromper', 'En restant seuls tout le temps', 'En changeant de famille d’accueil'], answer: 1 },
          { type: 'mcq', prompt: 'Que disent souvent leurs amis français d’eux ?', options: ['Qu’ils sont toujours aussi timides', 'Qu’ils sont devenus plus bavards qu’eux', 'Qu’ils ne parlent jamais en classe', 'Qu’ils veulent rentrer chez eux'], answer: 1 },
          { type: 'mcq', prompt: 'Quel temps grammatical domine la description de la vie « avant » ?', options: ['Le futur simple', 'L’imparfait', 'Le conditionnel', 'Le subjonctif'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : le texte présente le changement comme une mauvaise chose.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « sortir de sa zone de confort » signifie...', options: ['Rester dans ses habitudes', 'Faire des choses qui nous mettent mal à l’aise mais nous font grandir', 'Voyager souvent', 'Éviter les problèmes'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’intention principale de ce texte ?', options: ['Se plaindre de la vie en France', 'Réfléchir sur la transformation personnelle des élèves en échange', 'Décrire la ville de Tours', 'Expliquer un problème de logement'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle conclusion le texte tire-t-il de cette expérience ?', options: ['Le changement est toujours facile', 'Le changement peut être difficile mais rend plus fort', 'Il ne faut jamais changer', 'Les échanges scolaires sont à éviter'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Avant et maintenant',
        description: 'Écoute Camila comparer sa vie avant et après son arrivée en France.',
        intro: 'Écoute Camila expliquer à Karim comment elle était avant de venir en France.',
        dialogue: [
          { speaker: 'Karim', line: 'Tu étais comment, avant de venir en France ?', translation: '¿Cómo eras antes de venir a Francia?' },
          { speaker: 'Camila', line: 'J’étais beaucoup plus timide, je parlais très peu en public.', translation: 'Era mucho más tímida, hablaba muy poco en público.' },
          { speaker: 'Karim', line: 'Vraiment ? Je n’aurais jamais deviné !', translation: '¿En serio? ¡Nunca lo hubiera adivinado!' },
          { speaker: 'Camila', line: 'Oui, j’ai beaucoup changé depuis mon arrivée ici.', translation: 'Sí, he cambiado mucho desde que llegué aquí.' }
        ],
        phrases: ['Tu étais comment, avant ?', 'J’étais...', 'Je n’aurais jamais deviné.', 'J’ai beaucoup changé.'],
        exercises: [
          { type: 'mcq', prompt: 'Comment Camila décrit-elle sa personnalité avant son arrivée en France ?', options: ['Bavarde', 'Timide', 'Impatiente', 'Fâchée'], answer: 1 },
          { type: 'mcq', prompt: 'Comment réagit Karim à cette information ?', options: ['Il n’est pas surpris', 'Il est surpris', 'Il ne la croit pas', 'Il change de sujet'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit Camila sur son évolution ?', options: ['Elle n’a pas changé', 'Elle a beaucoup changé', 'Elle veut redevenir comme avant', 'Elle ne sait pas'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Raconte ton parcours',
        description: 'Présente un aspect de ton parcours personnel et une évolution que tu as vécue.',
        mission: 'Prépare une présentation de deux minutes sur un changement important dans ta vie : comment tu étais avant, ce qui a changé, et comment tu es maintenant.',
        phrases: ['Avant, j’étais...', 'Maintenant, je suis...', 'Ce qui a changé, c’est...', 'Cette expérience m’a appris que...'],
        dialogue: [
          { speaker: 'Toi', line: 'Avant, j’avais peur de parler en public. Maintenant, je suis beaucoup plus confiant(e), grâce à la pratique.', translation: 'Antes tenía miedo de hablar en público. Ahora soy mucho más seguro/a, gracias a la práctica.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente un changement personnel important, en utilisant l’imparfait pour le « avant » et le présent pour le « maintenant ».', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Débats avec un/une camarade sur ce qui rend un changement personnel réussi.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Ma courte biographie',
        description: 'Écris une courte biographie sur ton parcours personnel.',
        mission: 'Écris 150 à 200 mots racontant ton parcours personnel : comment tu étais avant, un événement marquant, et comment tu as changé.',
        phrases: ['Avant, j’étais...', 'Un jour, j’ai...', 'Depuis, je...', 'Aujourd’hui, je suis...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Avant, j’étais quelqu’un de très timide. Un jour, j’ai décidé de sortir de ma zone de confort et de participer à un projet nouveau. Depuis, j’ai gagné en confiance. Aujourd’hui, je suis une personne plus sûre d’elle-même.', translation: 'Antes era alguien muy tímido. Un día decidí salir de mi zona de confort y participar en un nuevo proyecto. Desde entonces, he ganado confianza. Hoy soy una persona más segura de sí misma.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris une biographie de 150 à 200 mots sur ton parcours personnel, en utilisant l’imparfait et le passé composé.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'L’imparfait et le contraste avec le passé composé',
        description: 'Décrire une situation passée habituelle avec l’imparfait, et distinguer son usage du passé composé.',
        grammarNote: 'L’imparfait décrit une situation, une habitude ou un état dans le passé, sans limite de temps précise : « J’étais timide. Je parlais peu. » Le passé composé décrit une action ponctuelle et terminée : « Un jour, j’ai décidé de changer. » On utilise souvent les deux ensemble : l’imparfait pour le contexte, le passé composé pour l’événement précis.',
        phrases: ['J’étais...', 'Je parlais...', 'Un jour, j’ai décidé de...', 'J’ai changé.'],
        exercises: [
          { type: 'mcq', prompt: 'Avant, je ___ très timide.', options: ['ai été', 'étais', 'suis', 'serai'], answer: 1 },
          { type: 'mcq', prompt: 'Un jour, j’___ de participer au projet.', options: ['ai décidé', 'décidais', 'décide', 'déciderai'], answer: 0 },
          { type: 'mcq', prompt: 'Quelle phrase utilise correctement l’imparfait pour une habitude passée ?', options: ['J’ai mangé souvent des tartines.', 'Je mangeais souvent des tartines.', 'Je vais manger souvent des tartines.', 'J’aurais mangé souvent des tartines.'], answer: 1 },
          { type: 'mcq', prompt: 'Quel temps utilise-t-on pour une action ponctuelle terminée ?', options: ['L’imparfait', 'Le passé composé', 'Le présent', 'Le futur simple'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de l’identité et du parcours',
        description: 'Le vocabulaire essentiel pour parler de son parcours personnel.',
        vocabulary: [
          { word: 'le parcours', translation: 'la trayectoria', example: 'Mon parcours en France a été riche en expériences.' },
          { word: 'changer', translation: 'cambiar', example: 'J’ai beaucoup changé depuis mon arrivée.' },
          { word: 'grandir', translation: 'crecer', example: 'J’ai grandi en tant que personne cette année.' },
          { word: 'devenir', translation: 'convertirse en', example: 'Je suis devenue plus confiante.' },
          { word: 'la zone de confort', translation: 'la zona de confort', example: 'Il faut parfois sortir de sa zone de confort.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « grandir » ?', options: ['Crecer', 'Cambiar', 'Viajar', 'Estudiar'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « devenir » ?', options: ['Volver', 'Convertirse en', 'Olvidar', 'Recordar'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « le parcours » ?', options: ['El camino', 'La trayectoria', 'El destino', 'El obstáculo'], answer: 1 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Une fierté partagée',
        description: 'Un professeur félicite un élève pour son évolution durant l’année d’échange.',
        intro: 'Un professeur observe le changement d’un élève depuis son arrivée et le lui exprime.',
        dialogue: [
          { speaker: 'Professeur', line: 'Tu as tellement changé depuis ton arrivée. Je suis fier/fière de toi.', translation: 'Has cambiado tanto desde que llegaste. Estoy orgulloso/a de ti.' },
          { speaker: 'Élève', line: 'Merci, ça me touche beaucoup.', translation: 'Gracias, eso me conmueve mucho.' },
          { speaker: 'Professeur', line: 'Au début, tu étais si timide, et maintenant, tu parles avec confiance.', translation: 'Al principio eras tan tímido/a, y ahora hablas con confianza.' },
          { speaker: 'Élève', line: 'C’est grâce à toute l’équipe qui m’a accueilli. Ils m’ont beaucoup aidé(e).', translation: 'Es gracias a todo el equipo que me acogió. Me han ayudado mucho.' }
        ],
        phrases: ['Tu as changé.', 'Je suis fier/fière de toi.', 'Ça me touche.', 'C’est grâce à vous.'],
        exercises: [
          { type: 'mcq', prompt: 'Que remarque le professeur chez l’élève ?', options: ['Qu’il n’a pas changé', 'Qu’il a beaucoup changé', 'Qu’il veut partir', 'Qu’il est fatigué'], answer: 1 },
          { type: 'mcq', prompt: 'Comment l’élève réagit-il au compliment ?', options: ['Il est indifférent', 'Il est touché', 'Il est fâché', 'Il ne répond pas'], answer: 1 },
          { type: 'mcq', prompt: 'À qui l’élève attribue-t-il son évolution ?', options: ['À lui seul', 'À l’équipe qui l’a accueilli', 'À personne en particulier', 'À son école d’origine'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'etudes-et-apprentissage',
    title: 'Études et apprentissage',
    titleEs: 'Estudios y aprendizaje',
    description: 'Les techniques de révision les plus efficaces selon les sciences cognitives : rappel actif, espacement et explication à voix haute.',
    order: 3,
    accessTier: 'free',
    unitOverview: {
      objective: 'Parler de stratégies d’apprentissage et exprimer des difficultés et des progrès scolaires.',
      outcomes: [
        'décrire des stratégies d’apprentissage',
        'exprimer une difficulté et un progrès',
        'donner un conseil académique',
        'utiliser le conditionnel présent pour suggérer'
      ],
      grammar: ['conditionnel présent (suggestion)', 'expressions de difficulté et de progrès', 'gérondif introductoire (en + participe présent)'],
      vocabulary: ['réviser', 'progresser', 'une difficulté', 'un conseil'],
      scenario: 'Avant un examen de mathématiques important, un élève demande des conseils d’étude à un camarade plus expérimenté.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Bien réviser pour un examen',
        description: 'Des conseils d’élèves et de professeurs pour bien réviser un examen difficile.',
        reading: {
          title: 'Bien réviser pour un examen',
          parts: [
            "Beaucoup d'élèves ont un examen de mathématiques important une semaine avant la date fatidique, et se sentent très inquiets. « Je comprends les explications en classe, mais dès que je suis seul pour faire les exercices, j'ai l'impression de tout oublier », expliquent-ils souvent à un ami qui a de très bonnes notes. Ce dernier propose alors une méthode simple. « À ta place, je commencerais par refaire les exercices les plus simples, pour bien comprendre la base avant de passer aux exercices difficiles », suggère-t-il souvent.",
            "Ceux qui suivent ce conseil passent chaque soir, en rentrant de l'école, trente minutes à réviser calmement, en refaisant d'abord les exercices simples, puis en essayant progressivement des exercices plus complexes. Une technique utile, recommandée par de nombreux professeurs : en expliquant à voix haute comment résoudre un problème, on comprend souvent mieux qu'en le lisant silencieusement. Beaucoup d'élèves trouvent cette méthode très efficace, même s'ils se sentent un peu ridicules à parler tout seuls dans leur chambre au début !",
            "Après une semaine de révisions régulières, la plupart des élèves se sentent beaucoup plus confiants. Le jour de l'examen, ils reconnaissent plusieurs types d'exercices qu'ils ont pratiqués et parviennent à les résoudre sans trop de difficulté. Selon plusieurs études sur les méthodes d'apprentissage, les élèves qui révisent régulièrement obtiennent en moyenne de meilleures notes que ceux qui révisent seulement la veille de l'examen.",
            "Cette méthode fonctionne aussi pour d'autres matières : le français, l'histoire, et même les sciences. La difficulté n'est souvent pas dans la matière elle-même, mais dans la façon d'étudier. Beaucoup de professeurs encouragent leurs élèves à s'entraider et à partager leurs meilleures techniques de révision entre camarades. Comme le disent souvent les enseignants : « Un bon conseil, ça se partage ! »"
          ],
          questions: [
            'Quelle difficulté beaucoup d’élèves rencontrent-ils avec les mathématiques ?',
            'Quel conseil un ami donne-t-il souvent en premier ?',
            'Que montrent les études sur les élèves qui révisent régulièrement ?'
          ],
          ordering: {
            prompt: 'Remets les étapes de la méthode dans l’ordre.',
            events: [
              'L’élève explique sa difficulté en mathématiques à un ami.',
              'L’ami conseille de commencer par les exercices simples.',
              'L’élève révise régulièrement chaque soir pendant une semaine.',
              'L’élève obtient une meilleure note grâce à cette méthode.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Quelle difficulté décrivent souvent les élèves ?', options: ['Ils ne comprennent rien en classe', 'Ils oublient tout quand ils sont seuls pour les exercices', 'Ils n’aiment pas les mathématiques', 'Ils n’ont pas de livre'], answer: 1 },
          { type: 'mcq', prompt: 'Que suggère souvent l’ami en premier ?', options: ['D’abandonner les mathématiques', 'De commencer par les exercices simples', 'D’étudier seulement la veille', 'De changer de classe'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle technique recommandent de nombreux professeurs ?', options: ['Écouter de la musique en étudiant', 'Expliquer à voix haute comment résoudre un problème', 'Copier les réponses d’un ami', 'Étudier seulement le matin'], answer: 1 },
          { type: 'mcq', prompt: 'Combien de temps recommande-t-on de réviser chaque soir ?', options: ['Quinze minutes', 'Trente minutes', 'Une heure', 'Deux heures'], answer: 1 },
          { type: 'mcq', prompt: 'Que montrent les études sur les méthodes d’apprentissage ?', options: ['Réviser la veille est plus efficace', 'Réviser régulièrement donne de meilleures notes en moyenne', 'Réviser ne sert à rien', 'Les mathématiques sont impossibles à apprendre'], answer: 1 },
          { type: 'mcq', prompt: 'Comment se sentent souvent les élèves après une semaine de révisions ?', options: ['Toujours très inquiets', 'Plus confiants', 'Indifférents', 'Fâchés'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : cette méthode ne fonctionne que pour les mathématiques.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « à ta place » signifie...', options: ['Dans ta maison', 'Si j’étais toi', 'À ton école', 'Devant toi'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la conclusion principale du texte ?', options: ['Les mathématiques sont impossibles à apprendre', 'Avec une bonne méthode et de la régularité, on progresse', 'Il faut toujours étudier seul', 'Les conseils des amis ne servent à rien'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi certains élèves se sentent-ils « un peu ridicules » au début ?', options: ['Parce qu’ils échouent à l’examen', 'Parce qu’ils parlent tout seuls dans leur chambre', 'Parce qu’un ami se moque d’eux', 'Parce qu’ils n’ont pas de livre'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Un conseil de révision',
        description: 'Écoute Karim donner un conseil de méthode de travail à Camila.',
        intro: 'Écoute la conversation entre Karim et Camila au sujet des révisions.',
        dialogue: [
          { speaker: 'Camila', line: 'J’ai l’impression de tout oublier quand je suis seule pour réviser.', translation: 'Tengo la impresión de olvidarlo todo cuando estoy sola para repasar.' },
          { speaker: 'Karim', line: 'À ta place, je commencerais par les exercices les plus simples.', translation: 'Yo en tu lugar empezaría por los ejercicios más simples.' },
          { speaker: 'Camila', line: 'D’accord, et ensuite ?', translation: 'De acuerdo, ¿y luego?' },
          { speaker: 'Karim', line: 'Essaie d’expliquer à voix haute comment tu résous chaque problème.', translation: 'Intenta explicar en voz alta cómo resuelves cada problema.' },
          { speaker: 'Camila', line: 'Bonne idée, je vais essayer ce soir !', translation: '¡Buena idea, lo voy a intentar esta noche!' }
        ],
        phrases: ['J’ai l’impression que...', 'À ta place, je...', 'Essaie de...', 'Bonne idée !'],
        exercises: [
          { type: 'mcq', prompt: 'Quel est le problème de Camila ?', options: ['Elle n’a pas de livre', 'Elle oublie tout en révisant seule', 'Elle n’aime pas Karim', 'Elle n’a pas le temps'], answer: 1 },
          { type: 'mcq', prompt: 'Quel conseil Karim donne-t-il en premier ?', options: ['Étudier avec de la musique', 'Commencer par les exercices simples', 'Étudier seulement la nuit', 'Ne pas étudier du tout'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle technique Karim recommande-t-il ensuite ?', options: ['Copier les réponses', 'Expliquer à voix haute', 'Dormir plus', 'Éviter les mathématiques'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Donner un conseil d’étude',
        description: 'Donne un conseil académique à un/une camarade en difficulté.',
        mission: 'Imagine qu’un ami a des difficultés dans une matière. Donne-lui trois conseils avec le conditionnel présent (« à ta place, je... »).',
        phrases: ['À ta place, je...', 'Tu devrais...', 'Il serait utile de...', 'Ça t’aiderait à...'],
        dialogue: [
          { speaker: 'Toi', line: 'À ta place, je réviserais un peu chaque jour, plutôt que tout la veille de l’examen.', translation: 'Yo en tu lugar repasaría un poco cada día, en vez de todo la víspera del examen.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Donne trois conseils d’étude à un ami imaginaire, en utilisant le conditionnel présent.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, échangez des conseils sur vos propres difficultés scolaires.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Mes stratégies d’apprentissage',
        description: 'Écris un texte sur tes stratégies pour apprendre efficacement.',
        mission: 'Écris 150 à 200 mots décrivant tes stratégies d’apprentissage : ce qui fonctionne pour toi, une difficulté que tu as eue, et comment tu l’as surmontée.',
        phrases: ['Ma stratégie principale est de...', 'J’ai eu des difficultés avec...', 'J’ai surmonté cette difficulté en...', 'Je recommanderais de...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Ma stratégie principale est de réviser régulièrement, un peu chaque jour. J’ai eu des difficultés en mathématiques, mais j’ai surmonté ce problème en expliquant les exercices à voix haute. Je recommanderais cette méthode à tout le monde.', translation: 'Mi estrategia principal es repasar regularmente, un poco cada día. Tuve dificultades en matemáticas, pero superé ese problema explicando los ejercicios en voz alta. Recomendaría este método a todos.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 150 à 200 mots sur tes stratégies d’apprentissage, avec au moins une phrase au conditionnel.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le conditionnel présent pour suggérer',
        description: 'Utiliser le conditionnel présent pour donner un conseil.',
        grammarNote: 'Le conditionnel présent se forme avec le radical du futur simple + les terminaisons de l’imparfait : je commencerais, tu devrais, il/elle serait. On l’utilise souvent pour donner un conseil de façon polie : « À ta place, je commencerais par les exercices simples. Tu devrais réviser chaque soir. »',
        phrases: ['À ta place, je...', 'Tu devrais...', 'Il serait utile de...', 'Ça t’aiderait à...'],
        exercises: [
          { type: 'mcq', prompt: 'À ta place, je ___ par les exercices simples.', options: ['commence', 'commencerais', 'ai commencé', 'commencerai'], answer: 1 },
          { type: 'mcq', prompt: 'Tu ___ réviser chaque soir.', options: ['devrais', 'dois', 'devras', 'devais'], answer: 0 },
          { type: 'mcq', prompt: 'Il ___ utile de refaire les exercices.', options: ['est', 'sera', 'serait', 'était'], answer: 2 },
          { type: 'mcq', prompt: 'Quelle terminaison caractérise le conditionnel présent ?', options: ['-ai, -as, -a', '-ais, -ais, -ait', '-é, -is, -u', '-ant'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire des études',
        description: 'Le vocabulaire essentiel pour parler d’apprentissage et de révisions.',
        vocabulary: [
          { word: 'réviser', translation: 'repasar', example: 'Je révise mes mathématiques chaque soir.' },
          { word: 'progresser', translation: 'progresar', example: 'J’ai beaucoup progressé en français.' },
          { word: 'une difficulté', translation: 'una dificultad', example: 'J’ai eu une difficulté avec cet exercice.' },
          { word: 'un conseil', translation: 'un consejo', example: 'Merci pour ton conseil, ça m’a beaucoup aidée.' },
          { word: 'la note', translation: 'la calificación', example: 'J’ai eu une bonne note à l’examen.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « réviser » ?', options: ['Repasar', 'Olvidar', 'Enseñar', 'Corregir'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « progresser » ?', options: ['Retroceder', 'Progresar', 'Detenerse', 'Repetir'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « un conseil » ?', options: ['Un consejo', 'Un examen', 'Una nota', 'Un problema'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Les résultats de l’examen',
        description: 'Un élève reçoit sa note et remercie un camarade pour son aide.',
        intro: 'Un élève vient de recevoir sa note d’examen et court en parler à un camarade.',
        dialogue: [
          { speaker: 'Élève 1', line: 'J’ai eu dix-sept sur vingt à l’examen !', translation: '¡Tuve diecisiete sobre veinte en el examen!' },
          { speaker: 'Élève 2', line: 'C’est génial ! Je savais que tu pouvais y arriver.', translation: '¡Es genial! Sabía que lo lograrías.' },
          { speaker: 'Élève 1', line: 'Merci pour tes conseils, ils ont vraiment fait la différence.', translation: 'Gracias por tus consejos, realmente marcaron la diferencia.' },
          { speaker: 'Élève 2', line: 'De rien ! C’est toi qui as fait tout le travail.', translation: '¡De nada! Fuiste tú quien hizo todo el trabajo.' }
        ],
        phrases: ['J’ai eu... sur vingt !', 'C’est génial !', 'Ça a fait la différence.', 'De rien !'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle note l’élève 1 annonce-t-il ?', options: ['Douze sur vingt', 'Quinze sur vingt', 'Dix-sept sur vingt', 'Vingt sur vingt'], answer: 2 },
          { type: 'mcq', prompt: 'Comment l’élève 2 réagit-il à la nouvelle ?', options: ['Il est indifférent', 'Il est content et pas surpris', 'Il est jaloux', 'Il ne le croit pas'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit l’élève 2 sur le mérite du succès de l’élève 1 ?', options: ['Que c’est grâce à lui seul', 'Que c’est l’élève 1 qui a fait tout le travail', 'Que c’était de la chance', 'Qu’il a triché'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'monde-du-travail',
    title: 'Monde du travail',
    titleEs: 'El mundo laboral',
    description: 'Comment bien se préparer à un entretien d’embauche et rédiger un e-mail de candidature efficace.',
    order: 4,
    accessTier: 'free',
    unitOverview: {
      objective: 'Comprendre et simuler un entretien d’embauche, écrire un e-mail formel.',
      outcomes: [
        'parler de professions et de compétences',
        'simuler un entretien d’embauche',
        'écrire un e-mail formel',
        'utiliser le conditionnel de politesse dans un contexte professionnel'
      ],
      grammar: ['conditionnel de politesse (révision approfondie)', 'vocabulaire formel vs informel', 'structure d’un e-mail formel'],
      vocabulary: ['le CV', 'un entretien d’embauche', 'les compétences', 'postuler'],
      scenario: 'Chaque été, de nombreux jeunes préparent un entretien pour un premier stage et s’entraînent avec un conseiller ou un camarade.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Bien se préparer à un entretien d’embauche',
        description: 'Des conseils pratiques pour réussir un premier entretien d’embauche.',
        reading: {
          title: 'Bien se préparer à un entretien d’embauche',
          parts: [
            "Beaucoup de jeunes postulent chaque été pour un stage à la bibliothèque municipale ou dans une association, et sont ensuite convoqués pour un entretien. Pour la plupart, c'est leur premier entretien d'embauche, et ils sont très nerveux. « Je ne sais pas quoi répondre s'ils me demandent pourquoi je veux ce stage », avouent-ils souvent à un ami. Ceux qui ont déjà de l'expérience avec les entretiens décident souvent d'aider les autres à s'entraîner.",
            "« D'abord, il faut que tu expliques clairement tes motivations », conseillent les spécialistes du recrutement. « Par exemple, tu pourrais dire que tu adores lire et que tu voudrais aider les autres à découvrir de bons livres. » Il est aussi utile de préparer des réponses aux questions les plus courantes : « Quelles sont vos qualités ? » et « Pourquoi devrions-nous vous choisir vous, plutôt qu'un autre candidat ? » Les candidats s'entraînent à répondre calmement, en utilisant un langage plus formel que d'habitude.",
            "Les conseillers rappellent aussi l'importance de la politesse dans ce contexte : utiliser « vous » plutôt que « tu », dire « je voudrais » plutôt que « je veux », et remercier la personne à la fin de l'entretien. Le jour de l'entretien, les candidats bien préparés se sentent souvent plus confiants. Selon plusieurs études sur le recrutement, les candidats qui s'entraînent à l'avance obtiennent le poste presque deux fois plus souvent que ceux qui ne se préparent pas.",
            "Le premier jour de stage reste souvent un peu impressionnant, même après un bon entretien. Mais les responsables félicitent généralement les nouveaux stagiaires pour leur sérieux et leur motivation, exactement les qualités mises en avant lors de l'entretien. Cette expérience montre qu'une bonne préparation, même pour un premier emploi, fait toute la différence."
          ],
          questions: [
            'Pour quel type de poste postulent souvent ces jeunes ?',
            'Quel conseil donnent souvent les spécialistes du recrutement sur le langage à utiliser ?',
            'Que montrent les études sur les candidats qui s’entraînent à l’avance ?'
          ],
          ordering: {
            prompt: 'Remets les étapes dans l’ordre.',
            events: [
              'Le candidat postule pour un stage.',
              'Un ami ou un conseiller l’aide à préparer ses réponses.',
              'Le candidat passe l’entretien, bien préparé.',
              'Le candidat obtient le stage.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Pour quel type de poste postulent souvent ces jeunes ?', options: ['Un stage dans un restaurant', 'Un stage à la bibliothèque municipale', 'Un emploi dans un magasin', 'Un poste de professeur'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi ces candidats sont-ils souvent nerveux ?', options: ['C’est leur premier entretien d’embauche', 'Ils n’aiment pas lire', 'Ils n’ont pas préparé leur CV', 'Ils ne veulent pas ce stage'], answer: 0 },
          { type: 'mcq', prompt: 'Quel conseil donne-t-on souvent sur le langage à utiliser ?', options: ['Utiliser « tu » pour être amical', 'Utiliser « vous » et un langage plus formel', 'Parler très vite', 'Ne pas remercier le recruteur'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle question prépare-t-on souvent à l’avance ?', options: ['Quel est votre plat préféré ?', 'Pourquoi devrions-nous vous choisir ?', 'Où habitez-vous ?', 'Quel âge avez-vous ?'], answer: 1 },
          { type: 'mcq', prompt: 'Comment se sentent souvent les candidats bien préparés ?', options: ['Complètement paniqués', 'Plus confiants', 'Indifférents', 'En retard'], answer: 1 },
          { type: 'mcq', prompt: 'Que montrent les études sur le recrutement ?', options: ['Les candidats préparés obtiennent le poste presque deux fois plus souvent', 'La préparation ne sert à rien', 'Il vaut mieux ne pas se préparer', 'Les entretiens sont toujours annulés'], answer: 0 },
          { type: 'mcq', prompt: 'Vrai ou faux : le premier jour de stage est toujours facile, même après un bon entretien.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « fait toute la différence » signifie...', options: ['N’a aucun effet', 'A un effet très important', 'Est interdit', 'Est facultatif'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’intention principale du texte ?', options: ['Décrire une bibliothèque', 'Montrer comment bien se préparer à un entretien', 'Se plaindre d’un employeur', 'Expliquer un problème scolaire'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle qualité les responsables félicitent-ils souvent chez les nouveaux stagiaires ?', options: ['Le sérieux et la motivation', 'La rapidité', 'La chance', 'L’indifférence'], answer: 0 }
        ]
      }),
      listening: activity('listening', {
        title: 'Simulation d’entretien',
        description: 'Écoute la simulation d’entretien entre Camila et Karim.',
        intro: 'Écoute Camila jouer le rôle du recruteur pendant que Karim s’entraîne pour son entretien.',
        dialogue: [
          { speaker: 'Camila (recruteuse)', line: 'Pourquoi voudriez-vous faire ce stage avec nous ?', translation: '¿Por qué querría hacer esta pasantía con nosotros?' },
          { speaker: 'Karim', line: 'Je voudrais faire ce stage parce que j’adore la lecture et aider les autres.', translation: 'Quisiera hacer esta pasantía porque me encanta la lectura y ayudar a los demás.' },
          { speaker: 'Camila (recruteuse)', line: 'Quelles sont vos principales qualités ?', translation: '¿Cuáles son sus principales cualidades?' },
          { speaker: 'Karim', line: 'Je suis organisé et je travaille bien en équipe.', translation: 'Soy organizado y trabajo bien en equipo.' }
        ],
        phrases: ['Pourquoi voudriez-vous... ?', 'Je voudrais... parce que...', 'Quelles sont vos qualités ?', 'Je suis... et je...'],
        exercises: [
          { type: 'mcq', prompt: 'Pourquoi Karim veut-il faire ce stage ?', options: ['Pour gagner de l’argent', 'Parce qu’il adore la lecture et aider les autres', 'Parce que c’est obligatoire', 'Il ne sait pas pourquoi'], answer: 1 },
          { type: 'mcq', prompt: 'Quelles qualités Karim mentionne-t-il ?', options: ['Rapide et impatient', 'Organisé et bon en équipe', 'Timide et lent', 'Créatif seulement'], answer: 1 },
          { type: 'mcq', prompt: 'Qui joue le rôle du recruteur dans cette simulation ?', options: ['Karim', 'Camila', 'Léa', 'Madame Lambert'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Simuler un entretien d’embauche',
        description: 'Participe à une simulation d’entretien d’embauche.',
        mission: 'Prépare et présente tes réponses à trois questions classiques d’entretien : tes motivations, tes qualités, et pourquoi on devrait te choisir.',
        phrases: ['Je voudrais ce poste parce que...', 'Mes qualités principales sont...', 'Vous devriez me choisir parce que...', 'Je vous remercie de votre temps.'],
        dialogue: [
          { speaker: 'Toi', line: 'Je voudrais ce stage parce que je suis passionné(e) par ce domaine. Mes qualités principales sont l’organisation et la motivation.', translation: 'Quisiera esta pasantía porque me apasiona este campo. Mis principales cualidades son la organización y la motivación.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Simule un entretien d’embauche complet, avec un langage formel et le conditionnel de politesse.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, alternez les rôles du recruteur et du candidat.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Un e-mail de candidature',
        description: 'Écris un e-mail formel pour postuler à un stage.',
        mission: 'Écris 150 à 200 mots sous forme d’e-mail formel pour postuler à un stage, en expliquant tes motivations et tes qualités.',
        phrases: ['Madame, Monsieur,', 'Je me permets de vous écrire pour...', 'Je voudrais...', 'Dans l’attente de votre réponse, je vous prie d’agréer...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Madame, Monsieur, je me permets de vous écrire pour postuler au stage d’été à la bibliothèque. Je suis passionné par la lecture et je voudrais mettre mes compétences organisationnelles à votre service. Dans l’attente de votre réponse, je vous prie d’agréer mes salutations distinguées.', translation: 'Señora, señor, me permito escribirle para postular a la pasantía de verano en la biblioteca. Me apasiona la lectura y quisiera poner mis habilidades organizativas a su servicio. En espera de su respuesta, le saluda atentamente.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris un e-mail formel de 150 à 200 mots pour postuler à un stage ou un emploi de ton choix.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le conditionnel de politesse dans un contexte professionnel',
        description: 'Utiliser le conditionnel de politesse pour un langage formel.',
        grammarNote: 'Dans un contexte professionnel, on remplace « je veux » par « je voudrais », « pouvez-vous » par « pourriez-vous », et « tu » par « vous ». Cela rend le discours plus poli et adapté à une situation formelle : « Je voudrais ce stage. Pourriez-vous me donner plus d’informations ? »',
        phrases: ['Je voudrais...', 'Pourriez-vous... ?', 'Je vous remercie de...', 'Dans l’attente de votre réponse...'],
        exercises: [
          { type: 'mcq', prompt: 'Dans un e-mail formel, on préfère dire...', options: ['Je veux ce stage.', 'Je voudrais ce stage.', 'Donne-moi ce stage.', 'Je dois avoir ce stage.'], answer: 1 },
          { type: 'mcq', prompt: '___ me donner plus d’informations sur le poste ?', options: ['Pouvez-vous', 'Pourriez-vous', 'Peux-tu', 'Pourrais-tu'], answer: 1 },
          { type: 'mcq', prompt: 'Dans un contexte formel, on utilise généralement...', options: ['Tu', 'Vous', 'Toi', 'Te'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle formule est appropriée pour terminer un e-mail formel ?', options: ['Bisous !', 'À plus !', 'Dans l’attente de votre réponse, je vous prie d’agréer mes salutations distinguées.', 'Salut, à bientôt !'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire du monde du travail',
        description: 'Le vocabulaire essentiel pour parler d’emploi et d’entretiens.',
        vocabulary: [
          { word: 'le CV', translation: 'el currículum', example: 'J’ai envoyé mon CV pour le stage.' },
          { word: 'un entretien d’embauche', translation: 'una entrevista de trabajo', example: 'J’ai un entretien d’embauche demain.' },
          { word: 'les compétences', translation: 'las competencias', example: 'Mes compétences principales sont l’organisation et la communication.' },
          { word: 'postuler', translation: 'postular/aplicar', example: 'J’ai postulé pour un stage à la bibliothèque.' },
          { word: 'un stage', translation: 'una pasantía', example: 'C’est mon premier stage professionnel.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « postuler » ?', options: ['Postular/aplicar', 'Rechazar', 'Contratar', 'Renunciar'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « un entretien d’embauche » ?', options: ['Un CV', 'Una entrevista de trabajo', 'Un salario', 'Un despido'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « les compétences » ?', options: ['Las competencias', 'Los horarios', 'Los salarios', 'Las vacaciones'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Un candidat obtient le stage',
        description: 'Un candidat reçoit la bonne nouvelle et remercie un ami pour son aide.',
        intro: 'Une semaine après l’entretien, un candidat reçoit une réponse par e-mail.',
        dialogue: [
          { speaker: 'Candidat', line: 'J’ai obtenu le stage à la bibliothèque !', translation: '¡Conseguí la pasantía en la biblioteca!' },
          { speaker: 'Ami', line: 'C’est fantastique ! Je savais que tu réussirais.', translation: '¡Es fantástico! Sabía que lo lograrías.' },
          { speaker: 'Candidat', line: 'Merci pour ton aide, sans toi, je n’aurais pas été aussi confiant.', translation: 'Gracias por tu ayuda, sin ti no habría estado tan seguro.' },
          { speaker: 'Ami', line: 'De rien ! Tu as travaillé dur pour ça.', translation: '¡De nada! Trabajaste duro para lograrlo.' }
        ],
        phrases: ['J’ai obtenu...', 'Je savais que tu réussirais.', 'Sans toi, je n’aurais pas...', 'Tu as travaillé dur.'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle nouvelle le candidat annonce-t-il ?', options: ['Il n’a pas eu le stage', 'Il a obtenu le stage', 'L’entretien est reporté', 'Il a changé d’avis'], answer: 1 },
          { type: 'mcq', prompt: 'Comment l’ami réagit-il à la nouvelle ?', options: ['Avec indifférence', 'Avec joie et confiance', 'Avec surprise négative', 'Avec jalousie'], answer: 1 },
          { type: 'mcq', prompt: 'Que reconnaît le candidat à propos de l’aide de son ami ?', options: ['Qu’il n’a pas aidé du tout', 'Qu’il a été essentiel à sa confiance', 'Qu’il l’a stressé', 'Qu’il aurait réussi seul de toute façon'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'voyages-et-interculturalite',
    title: 'Voyages et interculturalité',
    titleEs: 'Viajes e interculturalidad',
    description: 'Comment voyager en respectant les lieux visités, et comparer des habitudes culturelles différentes.',
    order: 5,
    accessTier: 'free',
    unitOverview: {
      objective: 'Comparer des habitudes culturelles et raconter une expérience interculturelle.',
      outcomes: [
        'comparer deux cultures',
        'décrire un choc culturel',
        'raconter une expérience de voyage marquante',
        'exprimer une opinion sur d’autres pays avec nuance'
      ],
      grammar: ['comparaison avancée', 'connecteurs d’opposition (alors que, tandis que)', 'discours rapporté simple'],
      vocabulary: ['une habitude culturelle', 'un choc culturel', 'ce qui m’a surpris', 'tandis que'],
      scenario: 'De nombreux élèves en échange préparent un exposé comparant une habitude culturelle française et une habitude de leur pays d’origine.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Deux cultures, un exposé',
        description: 'Un exposé type comparant les habitudes des repas en France et en République dominicaine.',
        reading: {
          title: 'Deux cultures, un exposé',
          parts: [
            "Dans les cours de vie sociale et culturelle, les élèves en échange préparent souvent un exposé de trois minutes comparant une habitude culturelle française et une habitude de leur pays d'origine. Beaucoup choisissent de parler des repas, un sujet qu'ils connaissent bien après quelques mois sur place. « En France, les repas sont souvent des moments assez calmes, avec des horaires fixes : le déjeuner vers midi, le dîner vers dix-neuf ou vingt heures », expliquent-ils souvent à leur classe. « Tandis qu'en République dominicaine, les repas sont généralement plus bruyants, avec de la musique en fond, et les horaires sont beaucoup plus flexibles. »",
            "Beaucoup de ces élèves racontent aussi ce qui les a le plus surpris à leur arrivée : « Ce qui m'a le plus étonné, c'est que les Français passent souvent plus de deux heures à table pendant les grandes occasions, alors que chez moi, les repas sont généralement plus rapides, sauf lors des fêtes. Au début, j'ai trouvé ça un peu long, mais maintenant, j'apprécie vraiment ces longs moments en famille. » Beaucoup expliquent aussi que, contrairement à ce qu'ils pensaient avant leur départ, les Français ne sont pas toujours « froids » : une fois qu'on les connaît bien, ils sont souvent très chaleureux.",
            "À la fin de ce type d'exposé, un camarade demande souvent : « Est-ce que tu préfères la culture française ou celle de ton pays ? » La réponse la plus fréquente est nuancée : « Je ne dirais pas que je préfère l'une à l'autre, elles sont juste différentes, et j'ai appris à apprécier les deux. Mon pays me manque parfois, mais je suis reconnaissant(e) d'avoir découvert une nouvelle façon de vivre. » Ce type de réponse impressionne souvent la classe, et les professeurs félicitent généralement ces élèves pour leur capacité à comparer deux cultures sans les juger."
          ],
          questions: [
            'Quel sujet choisissent souvent ces élèves pour leur exposé ?',
            'Qu’est-ce qui surprend souvent ces élèves à leur arrivée en France ?',
            'Comment ces élèves répondent-ils souvent à la question sur leur préférence culturelle ?'
          ],
          ordering: {
            prompt: 'Remets les idées de l’exposé dans l’ordre.',
            events: [
              'Les élèves comparent les horaires de repas français et de leur pays.',
              'Ils expliquent ce qui les a surpris sur la durée des repas français.',
              'Ils mentionnent que les Français ne sont pas toujours « froids ».',
              'Ils répondent à la question d’un camarade sur leur préférence culturelle.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Sur quel sujet porte souvent cet exposé ?', options: ['Les vêtements', 'Les repas', 'Les transports', 'Les fêtes'], answer: 1 },
          { type: 'mcq', prompt: 'Comment sont généralement décrits les repas dominicains ?', options: ['Silencieux et rapides', 'Bruyants, avec de la musique, et flexibles', 'Toujours à heure fixe', 'Sans importance'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’est-ce qui surprend souvent ces élèves en France ?', options: ['La nourriture française', 'La durée des repas lors des grandes occasions', 'Le prix des restaurants', 'Le manque de repas en famille'], answer: 1 },
          { type: 'mcq', prompt: 'Que pensaient souvent ces élèves des Français avant leur arrivée ?', options: ['Qu’ils étaient très chaleureux', 'Qu’ils étaient froids', 'Qu’ils ne mangeaient jamais ensemble', 'Ils n’avaient pas d’opinion'], answer: 1 },
          { type: 'mcq', prompt: 'Comment répondent souvent ces élèves à la question sur leur préférence ?', options: ['Ils préfèrent clairement la culture française', 'Ils préfèrent clairement leur culture d’origine', 'Ils disent apprécier les deux différemment', 'Ils refusent de répondre'], answer: 2 },
          { type: 'mcq', prompt: 'Comment réagissent souvent les professeurs à ce type de réponse ?', options: ['Ils la critiquent', 'Ils la félicitent', 'Ils l’ignorent', 'Ils changent de sujet'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : le texte affirme qu’une culture est toujours meilleure que l’autre.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « tandis que » exprime...', options: ['Une cause', 'Une opposition/contraste', 'Une conséquence', 'Un but'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’intention principale de ce type d’exposé ?', options: ['Critiquer la culture française', 'Comparer deux cultures sans les juger', 'Convaincre la classe de voyager', 'Se plaindre de son pays d’origine'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle inférence peut-on faire sur l’évolution de ces élèves ?', options: ['Ils ont du mal à s’adapter à la France', 'Ils apprennent à voir la richesse des deux cultures', 'Ils veulent oublier leur pays d’origine', 'Ils rejettent la culture française'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Un choc culturel',
        description: 'Écoute Camila raconter un moment de choc culturel à Léa.',
        intro: 'Écoute Camila expliquer à Léa un moment surprenant de son adaptation en France.',
        dialogue: [
          { speaker: 'Léa', line: 'Qu’est-ce qui t’a le plus surprise en arrivant ici ?', translation: '¿Qué fue lo que más te sorprendió al llegar aquí?' },
          { speaker: 'Camila', line: 'La durée des repas ! Chez moi, on mange beaucoup plus vite.', translation: '¡La duración de las comidas! En mi casa comemos mucho más rápido.' },
          { speaker: 'Léa', line: 'Vraiment ? Et maintenant, tu préfères quoi ?', translation: '¿En serio? ¿Y ahora qué prefieres?' },
          { speaker: 'Camila', line: 'J’aime bien les deux, en fait, ça dépend de l’occasion.', translation: 'Me gustan ambas, de hecho, depende de la ocasión.' }
        ],
        phrases: ['Qu’est-ce qui t’a surpris(e) ?', 'Chez moi, on...', 'Ça dépend de...', 'J’aime bien les deux.'],
        exercises: [
          { type: 'mcq', prompt: 'Qu’est-ce qui a le plus surpris Camila ?', options: ['La langue française', 'La durée des repas', 'Le climat', 'Les vêtements'], answer: 1 },
          { type: 'mcq', prompt: 'Comment mange-t-on généralement chez Camila, selon elle ?', options: ['Plus lentement qu’en France', 'Plus vite qu’en France', 'De la même façon qu’en France', 'Elle ne le précise pas'], answer: 1 },
          { type: 'mcq', prompt: 'Que préfère finalement Camila ?', options: ['Seulement la façon française', 'Seulement la façon dominicaine', 'Les deux, selon l’occasion', 'Aucune des deux'], answer: 2 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Comparer deux cultures',
        description: 'Compare deux habitudes culturelles de pays différents.',
        mission: 'Prépare une présentation de deux minutes comparant une habitude culturelle de ton pays avec celle d’un autre pays que tu connais.',
        phrases: ['Dans mon pays, on...', 'Tandis que dans..., on...', 'Ce qui m’a surpris, c’est...', 'J’apprécie les deux parce que...'],
        dialogue: [
          { speaker: 'Toi', line: 'Dans mon pays, les fêtes commencent tard, tandis que dans d’autres cultures, elles commencent plus tôt. Ce qui m’a surpris, c’est la différence d’horaires.', translation: 'En mi país, las fiestas empiezan tarde, mientras que en otras culturas empiezan más temprano. Lo que me sorprendió fue la diferencia de horarios.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Compare deux habitudes culturelles de pays différents, en utilisant « tandis que » ou « alors que ».', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Débats avec un/une camarade sur les avantages et inconvénients de deux cultures différentes.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Un choc culturel que j’ai vécu',
        description: 'Raconte une expérience interculturelle marquante.',
        mission: 'Écris 150 à 200 mots racontant une expérience interculturelle marquante (réelle ou imaginaire), en comparant deux habitudes culturelles différentes.',
        phrases: ['Ce qui m’a surpris(e), c’est...', 'Dans ma culture, on..., tandis que...', 'Au début, j’ai trouvé ça...', 'Maintenant, j’apprécie...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Ce qui m’a le plus surpris pendant mon voyage, c’est la façon de saluer les gens. Dans ma culture, on se serre la main, tandis qu’ailleurs, on fait la bise. Au début, j’ai trouvé ça étrange, mais maintenant, j’apprécie cette diversité.', translation: 'Lo que más me sorprendió durante mi viaje fue la forma de saludar a la gente. En mi cultura nos damos la mano, mientras que en otros lugares se dan un beso. Al principio me pareció extraño, pero ahora aprecio esa diversidad.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 150 à 200 mots racontant une expérience interculturelle, avec au moins un connecteur d’opposition (tandis que/alors que).', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Les connecteurs d’opposition : tandis que, alors que',
        description: 'Comparer deux idées opposées avec des connecteurs.',
        grammarNote: '« Tandis que » et « alors que » servent à opposer deux idées dans une même phrase : « En France, on dîne vers vingt heures, tandis qu’à Saint-Domingue, on dîne souvent plus tard. » Ils sont suivis d’un sujet et d’un verbe conjugué, comme « parce que ».',
        phrases: ['..., tandis que...', '..., alors que...', 'Contrairement à...', 'Par contre...'],
        exercises: [
          { type: 'mcq', prompt: 'En France, on dîne tôt, ___ à Saint-Domingue, on dîne plus tard.', options: ['parce que', 'tandis que', 'donc', 'car'], answer: 1 },
          { type: 'mcq', prompt: 'Quel connecteur exprime une opposition ?', options: ['Parce que', 'Donc', 'Alors que', 'Si bien que'], answer: 2 },
          { type: 'mcq', prompt: 'Les Français passent du temps à table, ___ les repas sont plus rapides ailleurs.', options: ['tandis que', 'parce que', 'donc', 'ainsi'], answer: 0 },
          { type: 'mcq', prompt: 'Quelle phrase utilise correctement un connecteur d’opposition ?', options: ['Je mange vite parce que je suis pressé.', 'Je mange lentement, tandis que mon frère mange vite.', 'Je mange donc je suis en retard.', 'Je mange si j’ai faim.'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de l’interculturalité',
        description: 'Le vocabulaire essentiel pour comparer des cultures.',
        vocabulary: [
          { word: 'une habitude culturelle', translation: 'una costumbre cultural', example: 'Chaque pays a ses propres habitudes culturelles.' },
          { word: 'un choc culturel', translation: 'un choque cultural', example: 'J’ai vécu un petit choc culturel en arrivant en France.' },
          { word: 'ce qui m’a surpris', translation: 'lo que me sorprendió', example: 'Ce qui m’a surpris, c’est la durée des repas.' },
          { word: 'tandis que', translation: 'mientras que', example: 'On dîne tôt, tandis qu’ailleurs on dîne tard.' },
          { word: 'apprécier', translation: 'apreciar', example: 'J’apprécie beaucoup les deux cultures.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « un choc culturel » ?', options: ['Un choque cultural', 'Una fiesta', 'Un idioma', 'Un país'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « tandis que » ?', options: ['Porque', 'Mientras que', 'Entonces', 'Además'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « apprécier » ?', options: ['Rechazar', 'Apreciar', 'Ignorar', 'Olvidar'], answer: 1 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Après l’exposé',
        description: 'Deux camarades félicitent un élève après son exposé sur les différences culturelles.',
        intro: 'Après le cours, deux camarades discutent avec un élève en échange de son exposé.',
        dialogue: [
          { speaker: 'Camarade 1', line: 'Ton exposé était vraiment intéressant !', translation: '¡Tu exposición fue realmente interesante!' },
          { speaker: 'Camarade 2', line: 'Oui, j’ai appris plein de choses sur ton pays.', translation: 'Sí, aprendí muchas cosas sobre tu país.' },
          { speaker: 'Élève en échange', line: 'Merci ! J’ai adoré comparer nos deux cultures.', translation: '¡Gracias! Me encantó comparar nuestras dos culturas.' },
          { speaker: 'Camarade 1', line: 'On devrait organiser une vraie soirée internationale un jour !', translation: '¡Deberíamos organizar una verdadera noche internacional algún día!' }
        ],
        phrases: ['Ton exposé était...', 'J’ai appris que...', 'J’ai adoré...', 'On devrait organiser...'],
        exercises: [
          { type: 'mcq', prompt: 'Comment le camarade 1 trouve-t-il l’exposé ?', options: ['Ennuyeux', 'Intéressant', 'Trop long', 'Confus'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’a appris le camarade 2 grâce à l’exposé ?', options: ['Rien de nouveau', 'Des choses sur le pays de l’élève en échange', 'Des recettes françaises', 'Rien, il n’écoutait pas'], answer: 1 },
          { type: 'mcq', prompt: 'Que propose le camarade 1 à la fin ?', options: ['D’oublier le sujet', 'D’organiser une soirée internationale', 'De refaire l’exposé', 'De voyager en France'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'technologie-et-societe',
    title: 'Technologie et société',
    titleEs: 'Tecnología y sociedad',
    description: 'Comment choisir ses usages numériques pour éviter que les notifications ne contrôlent notre attention.',
    order: 6,
    accessTier: 'free',
    unitOverview: {
      objective: 'Argumenter sur les avantages et les risques de la technologie de façon simple.',
      outcomes: [
        'présenter des avantages et des inconvénients',
        'exprimer un accord/désaccord nuancé',
        'utiliser des connecteurs d’argumentation',
        'comprendre un débat simple'
      ],
      grammar: ['connecteurs d’argumentation (d’une part/d’autre part, cependant)', 'expression de l’opinion nuancée', 'subjonctif présent introductorio (il est important que)'],
      vocabulary: ['un avantage / un inconvénient', 'dépendre de', 'un risque', 'la vie privée'],
      scenario: 'En cours d’éducation civique, une classe débat de l’impact des réseaux sociaux sur les jeunes.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Le débat sur les réseaux sociaux',
        description: 'Un débat de classe type sur les avantages et les risques des réseaux sociaux pour les jeunes.',
        reading: {
          title: 'Le débat sur les réseaux sociaux',
          parts: [
            "En cours d'éducation civique, les professeurs proposent souvent un débat sur un sujet d'actualité : l'impact des réseaux sociaux sur les jeunes. « D'une part, les réseaux sociaux permettent de rester en contact avec des amis éloignés et de découvrir de nouvelles idées », commence souvent un premier élève. « Grâce à eux, je peux parler avec ma cousine qui habite à l'étranger presque tous les jours. » Plusieurs élèves acquiescent, d'accord avec cet argument.",
            "Cependant, un deuxième élève n'est pas toujours complètement d'accord : « D'autre part, il est important que les jeunes fassent attention à leur vie privée. Beaucoup de personnes partagent trop d'informations personnelles sans réfléchir aux risques. » Un troisième élève ajoute souvent un autre point de vue : « Je pense aussi que ça dépend de la façon dont on les utilise. Si on passe trop de temps à comparer sa vie à celle des autres, ça peut créer du stress et de l'anxiété. Mais si on les utilise avec modération, pour s'informer ou garder contact, c'est plutôt positif. »",
            "Le professeur résume souvent le débat à la fin du cours : « Vous avez tous raison, d'une certaine façon. Les réseaux sociaux ne sont ni complètement bons ni complètement mauvais ; tout dépend de l'usage qu'on en fait. » Il propose alors à la classe de réfléchir, pour le prochain cours, à des règles personnelles pour une utilisation plus équilibrée des réseaux sociaux. Beaucoup d'élèves décident alors de limiter leur temps d'écran le soir, pour mieux profiter de leurs moments en famille.",
            "Quelques jours plus tard, la classe se retrouve souvent pour partager les règles personnelles que chacun a choisies. Certains décident de ne plus regarder leur téléphone avant de dormir, d'autres préfèrent limiter le nombre d'applications installées. Les professeurs sont généralement impressionnés par la maturité des réponses et proposent d'afficher les meilleures idées dans la salle de classe, pour que d'autres élèves puissent s'en inspirer tout au long de l'année."
          ],
          questions: [
            'Quel argument présente souvent le premier élève en faveur des réseaux sociaux ?',
            'Quelle inquiétude exprime souvent le deuxième élève ?',
            'Quelle conclusion tire souvent le professeur du débat ?'
          ],
          ordering: {
            prompt: 'Remets les interventions du débat dans l’ordre.',
            events: [
              'Un élève présente l’avantage de rester en contact avec des proches éloignés.',
              'Un autre élève exprime son inquiétude sur la vie privée.',
              'Un troisième élève explique que tout dépend de l’usage qu’on en fait.',
              'Le professeur résume le débat et propose une réflexion personnelle.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Quel avantage des réseaux sociaux mentionne souvent le premier élève ?', options: ['Ils sont gratuits', 'Ils permettent de rester en contact avec des proches éloignés', 'Ils remplacent l’école', 'Ils n’ont aucun avantage'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’inquiétude principale du deuxième élève ?', options: ['Le prix des téléphones', 'La vie privée', 'La vitesse d’internet', 'Le manque de réseaux sociaux'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit souvent le troisième élève sur l’effet des réseaux sociaux ?', options: ['Ils sont toujours mauvais', 'Ils sont toujours excellents', 'Ça dépend de la façon dont on les utilise', 'Il n’a pas d’opinion'], answer: 2 },
          { type: 'mcq', prompt: 'Quel risque ce troisième élève mentionne-t-il spécifiquement ?', options: ['La perte d’argent', 'Le stress de se comparer aux autres', 'Les virus informatiques', 'La perte de mémoire'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la conclusion du professeur ?', options: ['Les réseaux sociaux sont interdits', 'Tout dépend de l’usage qu’on en fait', 'Il faut les utiliser tout le temps', 'Ils sont inutiles'], answer: 1 },
          { type: 'mcq', prompt: 'Que décident souvent de faire les élèves après ce débat ?', options: ['Supprimer tous leurs réseaux sociaux', 'Limiter leur temps d’écran le soir', 'Passer plus de temps en ligne', 'Ne rien changer'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : tous les élèves sont d’accord dès le début du débat.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « d’une part... d’autre part... » sert à...', options: ['Donner deux exemples opposés ou complémentaires', 'Exprimer une cause', 'Poser une question', 'Terminer un texte'], answer: 0 },
          { type: 'mcq', prompt: 'Quel est le ton général du débat ?', options: ['Agressif et fermé', 'Ouvert et nuancé', 'Indifférent', 'Moqueur'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle inférence peut-on faire sur l’attitude des professeurs ?', options: ['Ils imposent leur opinion', 'Ils encouragent la réflexion personnelle des élèves', 'Ils sont contre les réseaux sociaux', 'Ils ignorent le débat'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Mon avis sur les réseaux sociaux',
        description: 'Écoute Karim et Léa continuer leur débat après le cours.',
        intro: 'Écoute la suite du débat entre Karim et Léa, à la sortie des cours.',
        dialogue: [
          { speaker: 'Karim', line: 'D’une part, je pense que les réseaux sociaux nous aident à rester connectés.', translation: 'Por un lado, creo que las redes sociales nos ayudan a mantenernos conectados.' },
          { speaker: 'Léa', line: 'Cependant, il est important de faire attention aux informations qu’on partage.', translation: 'Sin embargo, es importante tener cuidado con la información que compartimos.' },
          { speaker: 'Karim', line: 'Tu as raison, ça dépend vraiment de la façon dont on les utilise.', translation: 'Tienes razón, realmente depende de cómo las usemos.' },
          { speaker: 'Léa', line: 'Exactement, l’équilibre est la clé.', translation: 'Exactamente, el equilibrio es la clave.' }
        ],
        phrases: ['D’une part... cependant...', 'Il est important de...', 'Ça dépend de...', 'L’équilibre est la clé.'],
        exercises: [
          { type: 'mcq', prompt: 'Quel argument Karim présente-t-il ?', options: ['Les réseaux sociaux sont dangereux', 'Les réseaux sociaux aident à rester connectés', 'Il ne les utilise jamais', 'Il préfère les lettres'], answer: 1 },
          { type: 'mcq', prompt: 'À quoi Léa fait-elle attention ?', options: ['Au temps passé en ligne', 'Aux informations partagées', 'Au prix du téléphone', 'À la vitesse d’internet'], answer: 1 },
          { type: 'mcq', prompt: 'Sur quoi Karim et Léa sont-ils finalement d’accord ?', options: ['Que les réseaux sociaux sont inutiles', 'Que l’équilibre est important', 'Qu’il faut les interdire', 'Qu’il faut les utiliser sans limite'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Débattre d’un sujet de société',
        description: 'Présente et défends une opinion nuancée sur un sujet technologique.',
        mission: 'Présente les avantages et les inconvénients d’un outil technologique de ton choix (téléphone, réseaux sociaux, intelligence artificielle), avec une opinion nuancée.',
        phrases: ['D’une part... d’autre part...', 'Cependant...', 'Il est important que...', 'À mon avis, ça dépend de...'],
        dialogue: [
          { speaker: 'Toi', line: 'D’une part, le téléphone facilite la communication. D’autre part, il peut créer une dépendance. À mon avis, ça dépend de la façon dont on l’utilise.', translation: 'Por un lado, el teléfono facilita la comunicación. Por otro lado, puede crear dependencia. En mi opinión, depende de cómo se use.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente une opinion nuancée sur un outil technologique, avec des avantages et des inconvénients.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Organise un mini-débat avec un/une camarade sur les réseaux sociaux.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Avantages et inconvénients de la technologie',
        description: 'Écris un texte argumentatif sur les avantages et inconvénients de la technologie.',
        mission: 'Écris 150 à 200 mots présentant les avantages et les inconvénients d’une technologie (réseaux sociaux, intelligence artificielle, téléphone), avec ton opinion personnelle.',
        phrases: ['D’une part... d’autre part...', 'Cependant...', 'Il est important que...', 'En conclusion, je pense que...'],
        dialogue: [
          { speaker: 'Modèle', line: 'D’une part, les réseaux sociaux permettent de rester en contact avec des amis éloignés. D’autre part, ils peuvent créer une dépendance chez certaines personnes. En conclusion, je pense qu’il est important de les utiliser avec modération.', translation: 'Por un lado, las redes sociales permiten mantenerse en contacto con amigos lejanos. Por otro lado, pueden crear dependencia en algunas personas. En conclusión, creo que es importante usarlas con moderación.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 150 à 200 mots sur les avantages et les inconvénients d’une technologie, avec des connecteurs d’argumentation.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Les connecteurs d’argumentation et le subjonctif introductif',
        description: 'Structurer une argumentation et introduire le subjonctif avec « il est important que ».',
        grammarNote: '« D’une part... d’autre part... » et « cependant » structurent une argumentation avec deux points de vue. « Il est important que » introduit le subjonctif présent : « Il est important que les jeunes fassent attention. » Le subjonctif de « faire » est je fasse, tu fasses, il/elle fasse.',
        phrases: ['D’une part... d’autre part...', 'Cependant...', 'Il est important que...', 'Il faut que...'],
        exercises: [
          { type: 'mcq', prompt: 'Il est important que tu ___ attention à ta vie privée.', options: ['fais', 'fasses', 'faisais', 'feras'], answer: 1 },
          { type: 'mcq', prompt: 'Quel connecteur introduit une opposition ?', options: ['Donc', 'Cependant', 'Ainsi', 'Parce que'], answer: 1 },
          { type: 'mcq', prompt: '___, les réseaux sociaux facilitent la communication.', options: ['Cependant', 'D’une part', 'Donc', 'Ainsi'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle structure introduit le subjonctif ?', options: ['Je pense que', 'Il est important que', 'Il est vrai que', 'Je sais que'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de la technologie et de la société',
        description: 'Le vocabulaire essentiel pour débattre de sujets technologiques.',
        vocabulary: [
          { word: 'un avantage / un inconvénient', translation: 'una ventaja / una desventaja', example: 'Chaque technologie a des avantages et des inconvénients.' },
          { word: 'dépendre de', translation: 'depender de', example: 'Ça dépend de la façon dont on l’utilise.' },
          { word: 'un risque', translation: 'un riesgo', example: 'Il y a des risques à partager trop d’informations.' },
          { word: 'la vie privée', translation: 'la vida privada', example: 'Il faut protéger sa vie privée en ligne.' },
          { word: 'l’équilibre', translation: 'el equilibrio', example: 'L’équilibre est la clé pour bien utiliser la technologie.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « un risque » ?', options: ['Un riesgo', 'Una ventaja', 'Un equilibrio', 'Una opinión'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « dépendre de » ?', options: ['Depender de', 'Rechazar', 'Compartir', 'Olvidar'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « la vie privée » ?', options: ['La vida pública', 'La vida privada', 'La vida escolar', 'La vida familiar'], answer: 1 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'De nouvelles règles personnelles',
        description: 'Un élève explique à un camarade les nouvelles règles qu’il s’impose pour les réseaux sociaux.',
        intro: 'Après le débat en classe, un élève partage sa décision avec un camarade.',
        dialogue: [
          { speaker: 'Élève 1', line: 'J’ai décidé de limiter mon temps d’écran le soir.', translation: 'Decidí limitar mi tiempo de pantalla por la noche.' },
          { speaker: 'Élève 2', line: 'Bonne idée ! Et qu’est-ce que tu vas faire à la place ?', translation: '¡Buena idea! ¿Y qué vas a hacer en su lugar?' },
          { speaker: 'Élève 1', line: 'Je vais lire un peu, ou passer du temps en famille.', translation: 'Voy a leer un poco, o pasar tiempo en familia.' },
          { speaker: 'Élève 2', line: 'J’aime beaucoup cette idée, on pourrait le faire ensemble.', translation: 'Me gusta mucho esa idea, podríamos hacerlo juntos.' }
        ],
        phrases: ['J’ai décidé de...', 'Qu’est-ce que tu vas faire à la place ?', 'Je vais...', 'On pourrait le faire ensemble.'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle décision l’élève 1 a-t-il prise ?', options: ['Supprimer ses réseaux sociaux', 'Limiter son temps d’écran le soir', 'Utiliser plus les réseaux sociaux', 'Acheter un nouveau téléphone'], answer: 1 },
          { type: 'mcq', prompt: 'Que va faire l’élève 1 à la place ?', options: ['Rien de spécial', 'Lire ou passer du temps en famille', 'Dormir toute la soirée', 'Regarder la télévision'], answer: 1 },
          { type: 'mcq', prompt: 'Comment l’élève 2 réagit-il à cette décision ?', options: ['Il la trouve inutile', 'Il l’approuve et propose de participer', 'Il s’en moque', 'Il ne dit rien'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'sante-et-mode-de-vie',
    title: 'Santé et mode de vie',
    titleEs: 'Salud y estilo de vida',
    description: 'Comment gérer le stress des examens et adopter des habitudes de vie plus saines, selon les médecins scolaires.',
    order: 7,
    accessTier: 'free',
    unitOverview: {
      objective: 'Parler du stress, des habitudes saines et donner des recommandations de bien-être.',
      outcomes: [
        'décrire le stress et ses causes',
        'proposer des habitudes de vie saines',
        'donner des recommandations avec le subjonctif',
        'comprendre un conseil médical simple'
      ],
      grammar: ['subjonctif présent (recommandations)', 'expressions liées au bien-être', 'impératif (révision, conseils)'],
      vocabulary: ['le stress', 'se détendre', 'une habitude saine', 'l’activité physique'],
      scenario: 'À l’approche des examens de fin d’année, de nombreux élèves se sentent de plus en plus stressés et cherchent des conseils.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Gérer le stress des examens',
        description: 'Des conseils de médecins scolaires pour gérer le stress des examens de fin d’année.',
        reading: {
          title: 'Gérer le stress des examens',
          parts: [
            "À l'approche des examens de fin d'année, beaucoup d'élèves se sentent de plus en plus stressés. Ils dorment mal, ont du mal à se concentrer, et se sentent tendus en permanence. Les infirmières scolaires remarquent souvent ces signes chez des élèves qui révisent tard, l'air fatigué, et décident de leur parler. « Tu sembles très stressé ces derniers temps. Il faut que tu prennes soin de toi aussi, pas seulement de tes études », leur disent-elles souvent.",
            "Les médecins scolaires proposent généralement plusieurs conseils pour mieux gérer le stress des examens. « Il est important que tu fasses des pauses régulières pendant tes révisions, même courtes. Il vaut mieux que tu dormes suffisamment plutôt que de réviser jusqu'à minuit. » Ils suggèrent aussi de reprendre une activité physique régulière : « Ça t'aiderait beaucoup de faire une petite promenade ou du sport, même vingt minutes par jour, ça réduit vraiment le stress. »",
            "Les élèves qui suivent ces conseils commencent souvent à faire une courte promenade chaque après-midi, à limiter leurs révisions à vingt et une heures, et à essayer de dormir au moins sept heures par nuit. Après une semaine, beaucoup se sentent déjà plus calmes et plus concentrés pendant leurs révisions. Selon plusieurs études en médecine scolaire, réussir ses examens ne veut pas dire sacrifier sa santé, mais plutôt trouver un équilibre entre le travail et le repos.",
            "Le jour du premier examen, la plupart des élèves se sentent nerveux, comme toujours, mais d'une façon différente : plus légère, plus gérable. Pendant la pause avant l'épreuve, beaucoup prennent cinq minutes pour respirer calmement, comme leur infirmière scolaire le leur avait suggéré. Cette petite habitude, presque insignifiante en apparence, les aide à se concentrer pleinement une fois l'examen commencé. Les médecins scolaires recommandent de continuer ces habitudes bien après la fin des examens de fin d'année."
          ],
          questions: [
            'Quels symptômes de stress ressentent souvent les élèves avant les examens ?',
            'Quels conseils donnent souvent les médecins scolaires ?',
            'Quelle leçon en tirent les études en médecine scolaire ?'
          ],
          ordering: {
            prompt: 'Remets les idées du texte dans l’ordre.',
            events: [
              'Les élèves se sentent de plus en plus stressés avant les examens.',
              'Les infirmières scolaires remarquent ces signes et leur parlent.',
              'Elles donnent des conseils sur les pauses, le sommeil et le sport.',
              'Les élèves appliquent ces conseils et se sentent plus calmes.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Quels symptômes ressentent souvent les élèves à cause du stress ?', options: ['Ils dorment trop', 'Ils dorment mal et ont du mal à se concentrer', 'Ils n’ont aucun symptôme', 'Ils sont toujours calmes'], answer: 1 },
          { type: 'mcq', prompt: 'Qui remarque souvent ces signes de stress chez les élèves ?', options: ['Les infirmières scolaires', 'Personne', 'Les autres élèves seulement', 'Les parents seulement'], answer: 0 },
          { type: 'mcq', prompt: 'Quel conseil donnent souvent les médecins scolaires sur le sommeil ?', options: ['Réviser jusqu’à minuit', 'Dormir suffisamment plutôt que réviser tard', 'Ne pas dormir avant les examens', 'Dormir toute la journée'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle activité recommandent-ils souvent ?', options: ['Regarder la télévision', 'Une activité physique régulière', 'Manger davantage', 'Étudier plus longtemps'], answer: 1 },
          { type: 'mcq', prompt: 'Que font souvent les élèves qui suivent ces conseils, chaque après-midi ?', options: ['Ils révisent', 'Ils font une courte promenade', 'Ils regardent des films', 'Ils dorment'], answer: 1 },
          { type: 'mcq', prompt: 'Jusqu’à quelle heure conseille-t-on souvent de limiter les révisions ?', options: ['Dix-neuf heures', 'Vingt et une heures', 'Vingt-trois heures', 'Minuit'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : après une semaine, la plupart des élèves se sentent plus stressés qu’avant.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « gérable » signifie...', options: ['Impossible à supporter', 'Que l’on peut gérer, contrôler', 'Interdit', 'Sans importance'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la leçon principale de ce texte ?', options: ['Il faut sacrifier sa santé pour réussir', 'Il faut trouver un équilibre entre travail et repos', 'Le sport n’aide pas contre le stress', 'Il ne faut jamais réviser'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’intention principale du texte ?', options: ['Décrire un examen difficile', 'Montrer l’importance de l’équilibre entre études et bien-être', 'Se plaindre du système scolaire', 'Décrire une dispute familiale'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Conseils de bien-être',
        description: 'Écoute Madame Lambert donner des conseils de bien-être à Camila.',
        intro: 'Écoute la conversation entre Madame Lambert et Camila au sujet du stress.',
        dialogue: [
          { speaker: 'Mme Lambert', line: 'Il faut que tu fasses des pauses pendant tes révisions.', translation: 'Es necesario que hagas pausas durante tus repasos.' },
          { speaker: 'Camila', line: 'D’accord, et pour le sommeil ?', translation: 'De acuerdo, ¿y para el sueño?' },
          { speaker: 'Mme Lambert', line: 'Il vaut mieux que tu dormes sept heures, plutôt que de réviser tard.', translation: 'Es mejor que duermas siete horas, en vez de repasar hasta tarde.' },
          { speaker: 'Camila', line: 'Merci, je vais essayer de suivre ces conseils.', translation: 'Gracias, voy a intentar seguir estos consejos.' }
        ],
        phrases: ['Il faut que tu...', 'Il vaut mieux que tu...', 'Plutôt que de...', 'Je vais essayer de...'],
        exercises: [
          { type: 'mcq', prompt: 'Quel conseil Madame Lambert donne-t-elle sur les révisions ?', options: ['Réviser sans pause', 'Faire des pauses régulières', 'Réviser seulement la nuit', 'Ne pas réviser du tout'], answer: 1 },
          { type: 'mcq', prompt: 'Combien d’heures de sommeil recommande-t-elle ?', options: ['Cinq heures', 'Sept heures', 'Neuf heures', 'Dix heures'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila réagit-elle aux conseils ?', options: ['Elle les refuse', 'Elle accepte de les essayer', 'Elle ne répond pas', 'Elle se fâche'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Donner des conseils de bien-être',
        description: 'Donne des conseils de bien-être à une personne stressée.',
        mission: 'Imagine qu’un ami est très stressé par les examens. Donne-lui trois recommandations en utilisant « il faut que » ou « il est important que ».',
        phrases: ['Il faut que tu...', 'Il est important que tu...', 'Il vaut mieux que tu...', 'Ça t’aiderait de...'],
        dialogue: [
          { speaker: 'Toi', line: 'Il faut que tu fasses des pauses régulières. Il est important que tu dormes suffisamment avant l’examen.', translation: 'Es necesario que hagas pausas regulares. Es importante que duermas lo suficiente antes del examen.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Donne trois recommandations de bien-être à un ami stressé, en utilisant le subjonctif.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, échangez des conseils sur la gestion du stress.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Mes habitudes saines',
        description: 'Écris un texte sur tes habitudes de vie saine.',
        mission: 'Écris 150 à 200 mots décrivant tes habitudes de vie (ou celles que tu voudrais avoir) pour rester en bonne santé et gérer le stress.',
        phrases: ['Il est important que je...', 'J’essaie de...', 'Ça m’aide à...', 'Pour rester en bonne santé, je...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Pour rester en bonne santé, il est important que je dorme suffisamment et que je fasse de l’exercice régulièrement. J’essaie aussi de faire des pauses pendant mes études, ça m’aide beaucoup à réduire le stress.', translation: 'Para mantenerme sano, es importante que duerma lo suficiente y haga ejercicio regularmente. También intento hacer pausas durante mis estudios, eso me ayuda mucho a reducir el estrés.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 150 à 200 mots sur tes habitudes de vie saine, avec au moins deux phrases au subjonctif.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le subjonctif présent pour les recommandations',
        description: 'Utiliser le subjonctif présent après « il faut que » et « il est important que ».',
        grammarNote: 'Après des expressions comme « il faut que », « il est important que » ou « il vaut mieux que », le verbe suivant se met au subjonctif présent : « Il faut que tu dormes. Il est important que tu fasses des pauses. » Pour les verbes réguliers en -er, le subjonctif ressemble beaucoup au présent : que je dorme, que tu dormes, qu’il/elle dorme.',
        phrases: ['Il faut que tu...', 'Il est important que tu...', 'Il vaut mieux que tu...', 'Il est essentiel que...'],
        exercises: [
          { type: 'mcq', prompt: 'Il faut que tu ___ suffisamment.', options: ['dors', 'dormes', 'dormais', 'dormiras'], answer: 1 },
          { type: 'mcq', prompt: 'Il est important que je ___ des pauses.', options: ['fais', 'fasse', 'faisais', 'ferai'], answer: 1 },
          { type: 'mcq', prompt: 'Il vaut mieux que nous ___ du sport.', options: ['faisons', 'fassions', 'ferons', 'faisions'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle expression introduit le subjonctif ?', options: ['Je sais que', 'Il faut que', 'Je vois que', 'Il est vrai que'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de la santé et du bien-être',
        description: 'Le vocabulaire essentiel pour parler du stress et des habitudes saines.',
        vocabulary: [
          { word: 'le stress', translation: 'el estrés', example: 'Le stress des examens est difficile à gérer.' },
          { word: 'se détendre', translation: 'relajarse', example: 'Il faut prendre du temps pour se détendre.' },
          { word: 'une habitude saine', translation: 'un hábito saludable', example: 'Dormir suffisamment est une habitude saine.' },
          { word: 'l’activité physique', translation: 'la actividad física', example: 'L’activité physique aide à réduire le stress.' },
          { word: 'prendre soin de soi', translation: 'cuidarse a uno mismo', example: 'Il faut prendre soin de soi, pas seulement de ses études.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « se détendre » ?', options: ['Relajarse', 'Estresarse', 'Trabajar', 'Correr'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « l’activité physique » ?', options: ['El descanso', 'La actividad física', 'La comida', 'El sueño'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « prendre soin de soi » ?', options: ['Cuidarse a uno mismo', 'Ignorarse', 'Trabajar mucho', 'Estudiar sin parar'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Une semaine plus calme',
        description: 'Une semaine après avoir suivi des conseils de bien-être, un élève se sent beaucoup mieux.',
        intro: 'Une semaine plus tard, un élève raconte à un camarade comment il se sent après avoir changé ses habitudes.',
        dialogue: [
          { speaker: 'Camarade', line: 'Tu sembles beaucoup plus détendu(e) cette semaine !', translation: '¡Pareces mucho más relajado/a esta semana!' },
          { speaker: 'Élève', line: 'Oui, j’ai suivi les conseils de l’infirmière : plus de pauses, plus de sommeil.', translation: 'Sí, seguí los consejos de la enfermera: más pausas, más sueño.' },
          { speaker: 'Camarade', line: 'Et ça marche vraiment ?', translation: '¿Y realmente funciona?' },
          { speaker: 'Élève', line: 'Oui, je me concentre beaucoup mieux pendant mes révisions maintenant.', translation: 'Sí, ahora me concentro mucho mejor durante mis repasos.' }
        ],
        phrases: ['Tu sembles...', 'J’ai suivi les conseils de...', 'Ça marche vraiment ?', 'Je me concentre mieux.'],
        exercises: [
          { type: 'mcq', prompt: 'Comment l’élève semble-t-il cette semaine ?', options: ['Plus stressé', 'Plus détendu', 'Fâché', 'Fatigué'], answer: 1 },
          { type: 'mcq', prompt: 'Quels conseils l’élève a-t-il suivis ?', options: ['Réviser plus tard', 'Faire plus de pauses et dormir plus', 'Arrêter d’étudier', 'Ne rien changer'], answer: 1 },
          { type: 'mcq', prompt: 'Quel résultat l’élève observe-t-il ?', options: ['Il se concentre moins bien', 'Il se concentre beaucoup mieux', 'Aucun changement', 'Il est plus fatigué'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'environnement-et-consommation',
    title: 'Environnement et consommation',
    titleEs: 'Medioambiente y consumo',
    description: 'Comment un projet scolaire de réduction des déchets peut faire évoluer les habitudes de tout un établissement.',
    order: 8,
    accessTier: 'free',
    unitOverview: {
      objective: 'Discuter de problèmes environnementaux et proposer des solutions concrètes.',
      outcomes: [
        'parler des problèmes environnementaux',
        'proposer des solutions et des projets écologiques',
        'exprimer la cause et la conséquence',
        'utiliser il faut que pour proposer une action collective'
      ],
      grammar: ['cause et conséquence (parce que, donc, c’est pourquoi)', 'subjonctif (proposition d’action)', 'quantificateurs (trop de, moins de)'],
      vocabulary: ['le recyclage', 'les déchets', 'l’environnement', 'réduire'],
      scenario: 'Une classe de lycée organise un projet écologique pour réduire les déchets dans son établissement.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Un projet pour l’environnement',
        description: 'Comment des lycées français réduisent la quantité de déchets grâce à des projets d’élèves.',
        reading: {
          title: 'Un projet pour l’environnement',
          parts: [
            "Chaque trimestre, de nombreuses classes de lycée en France participent à un projet écologique : réduire la quantité de déchets produits dans leur établissement. « Nous produisons trop de déchets à la cantine, surtout du plastique à usage unique », expliquent souvent les professeurs de sciences. « C'est pourquoi nous devons trouver des solutions ensemble. » Les classes se divisent en petits groupes pour réfléchir à des idées concrètes.",
            "Un groupe propose souvent d'installer des poubelles de tri sélectif dans toute l'école, parce que beaucoup d'élèves ne savent pas où jeter le plastique, le verre et le papier séparément. « Si on installe des poubelles claires et bien identifiées, le recyclage sera beaucoup plus simple », expliquent-ils souvent au reste de la classe. Un autre groupe propose souvent une idée complémentaire : remplacer les bouteilles en plastique par des gourdes réutilisables, puisque beaucoup d'élèves achètent une bouteille chaque jour à la cantine.",
            "Après avoir présenté toutes les propositions, la classe vote généralement pour les deux meilleures idées : le tri sélectif et les gourdes réutilisables. Il faut ensuite que les élèves convainquent la direction du lycée d'accepter ces changements. Ils préparent souvent une présentation avec des chiffres sur la quantité de déchets économisée. Dans de nombreux cas, la direction accepte le projet, et de nouvelles poubelles de tri apparaissent dans les couloirs.",
            "Quelques mois plus tard, ces classes remarquent souvent une différence claire : la quantité de bouteilles en plastique jetées à la cantine diminue nettement, et de plus en plus d'élèves utilisent leur gourde réutilisable chaque jour. Selon l'ADEME, l'agence française de la transition écologique, ce type de projet scolaire peut réduire les déchets plastiques d'un établissement de plus de trente pour cent en une année. Encouragées par ce succès, beaucoup de classes proposent ensuite un nouveau projet pour l'année suivante, comme organiser un compost pour les déchets alimentaires."
          ],
          questions: [
            'Quel problème identifient souvent les professeurs de sciences à la cantine ?',
            'Quelle solution propose souvent un premier groupe d’élèves ?',
            'Que peut réduire ce type de projet, selon l’ADEME ?'
          ],
          ordering: {
            prompt: 'Remets les événements du projet dans l’ordre.',
            events: [
              'Le professeur explique le problème des déchets à la cantine.',
              'Les groupes réfléchissent à des solutions.',
              'La classe vote pour le tri sélectif et les gourdes réutilisables.',
              'La direction accepte le projet et installe de nouvelles poubelles.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Quel problème identifient souvent les professeurs de sciences ?', options: ['Trop de bruit à la cantine', 'Trop de déchets plastiques à la cantine', 'Pas assez de nourriture', 'Trop d’élèves absents'], answer: 1 },
          { type: 'mcq', prompt: 'Que propose souvent un premier groupe d’élèves ?', options: ['Fermer la cantine', 'Installer des poubelles de tri sélectif', 'Interdire le plastique complètement', 'Réduire les heures de cours'], answer: 1 },
          { type: 'mcq', prompt: 'Que propose souvent un deuxième groupe ?', options: ['Des gourdes réutilisables', 'Des assiettes en carton', 'Des sacs en papier', 'Rien de spécial'], answer: 0 },
          { type: 'mcq', prompt: 'Pourquoi propose-t-on souvent cette solution ?', options: ['Parce que les bouteilles sont trop chères', 'Parce que beaucoup d’élèves achètent une bouteille chaque jour', 'Parce que c’est obligatoire', 'Parce que la cantine va fermer'], answer: 1 },
          { type: 'mcq', prompt: 'Que doivent faire les élèves après le vote ?', options: ['Rien de plus', 'Convaincre la direction d’accepter les changements', 'Changer d’école', 'Annuler le projet'], answer: 1 },
          { type: 'mcq', prompt: 'Que préparent-ils souvent pour convaincre la direction ?', options: ['Une pétition', 'Une présentation avec des chiffres', 'Une manifestation', 'Une lettre anonyme'], answer: 1 },
          { type: 'mcq', prompt: 'De combien ce type de projet peut-il réduire les déchets plastiques, selon l’ADEME ?', options: ['Plus de dix pour cent', 'Plus de trente pour cent', 'Cent pour cent', 'Aucune réduction'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « c’est pourquoi » exprime...', options: ['Une cause', 'Une conséquence', 'Une opposition', 'Un but'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’est-ce que l’ADEME, selon le texte ?', options: ['Une école', 'L’agence française de la transition écologique', 'Un magasin de vêtements', 'Un syndicat étudiant'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’intention principale du texte ?', options: ['Critiquer l’école', 'Montrer comment un projet collectif peut créer un changement concret', 'Décrire un examen', 'Parler d’un voyage scolaire'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Présenter le projet à la direction',
        description: 'Écoute Camila et Karim présenter leur projet écologique à la direction.',
        intro: 'Écoute la présentation de Camila et Karim devant le directeur du lycée.',
        dialogue: [
          { speaker: 'Camila', line: 'Nous produisons trop de déchets plastiques à la cantine.', translation: 'Producimos demasiados residuos plásticos en el comedor.' },
          { speaker: 'Le directeur', line: 'Quelle solution proposez-vous ?', translation: '¿Qué solución proponen?' },
          { speaker: 'Karim', line: 'Des poubelles de tri sélectif et des gourdes réutilisables.', translation: 'Contenedores de reciclaje selectivo y botellas reutilizables.' },
          { speaker: 'Le directeur', line: 'C’est une excellente idée, nous allons l’étudier.', translation: 'Es una excelente idea, la vamos a estudiar.' }
        ],
        phrases: ['Nous produisons trop de...', 'Quelle solution proposez-vous ?', 'Nous proposons...', 'Nous allons l’étudier.'],
        exercises: [
          { type: 'mcq', prompt: 'Quel problème Camila présente-t-elle ?', options: ['Le bruit', 'Les déchets plastiques', 'Le manque de professeurs', 'Le prix de la cantine'], answer: 1 },
          { type: 'mcq', prompt: 'Quelles solutions Karim propose-t-il ?', options: ['Fermer la cantine', 'Le tri sélectif et les gourdes réutilisables', 'Plus de vacances', 'Rien de spécial'], answer: 1 },
          { type: 'mcq', prompt: 'Comment réagit le directeur ?', options: ['Il refuse immédiatement', 'Il trouve l’idée excellente', 'Il ne répond pas', 'Il se fâche'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Proposer une solution écologique',
        description: 'Propose une solution à un problème environnemental.',
        mission: 'Identifie un problème environnemental dans ton école ou ta ville, et propose une solution concrète avec « il faut que ».',
        phrases: ['Le problème, c’est que...', 'C’est pourquoi...', 'Il faut que nous...', 'Je propose de...'],
        dialogue: [
          { speaker: 'Toi', line: 'Le problème, c’est que nous utilisons trop de plastique. C’est pourquoi il faut que nous installions des poubelles de tri.', translation: 'El problema es que usamos demasiado plástico. Por eso es necesario que instalemos contenedores de reciclaje.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Identifie un problème environnemental et propose une solution concrète.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, préparez une courte présentation pour convaincre la direction de votre école.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Une proposition écologique',
        description: 'Écris une proposition pour résoudre un problème environnemental.',
        mission: 'Écris 150 à 200 mots présentant un problème environnemental et une solution concrète, en utilisant cause et conséquence.',
        phrases: ['Le problème principal est que...', 'C’est pourquoi je propose de...', 'Il faut que nous...', 'Cette solution permettrait de...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Le problème principal est que nous produisons trop de déchets plastiques. C’est pourquoi je propose d’installer des poubelles de tri sélectif dans toute l’école. Il faut que chaque élève participe pour que cette solution fonctionne vraiment.', translation: 'El problema principal es que producimos demasiados residuos plásticos. Por eso propongo instalar contenedores de reciclaje selectivo en toda la escuela. Es necesario que cada estudiante participe para que esta solución realmente funcione.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 150 à 200 mots présentant un problème environnemental et une solution, avec cause et conséquence.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Cause et conséquence : parce que, c’est pourquoi',
        description: 'Exprimer une cause et sa conséquence dans un texte argumentatif.',
        grammarNote: '« Parce que » introduit une cause (répond à « pourquoi ? ») : « On recycle parce que c’est important pour la planète. » « C’est pourquoi » introduit une conséquence : « Nous produisons trop de déchets, c’est pourquoi nous devons agir. »',
        phrases: ['... parce que...', 'C’est pourquoi...', '... donc...', '... c’est la raison pour laquelle...'],
        exercises: [
          { type: 'mcq', prompt: 'On recycle ___ c’est important pour la planète.', options: ['parce que', 'c’est pourquoi', 'donc', 'alors que'], answer: 0 },
          { type: 'mcq', prompt: 'Nous produisons trop de déchets, ___ nous devons agir.', options: ['parce que', 'c’est pourquoi', 'bien que', 'tandis que'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle expression introduit une conséquence ?', options: ['Parce que', 'C’est pourquoi', 'Bien que', 'Tandis que'], answer: 1 },
          { type: 'mcq', prompt: 'Il faut trier les déchets ___ ça aide l’environnement.', options: ['parce que', 'c’est pourquoi', 'cependant', 'or'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de l’environnement',
        description: 'Le vocabulaire essentiel pour parler de l’environnement et de la consommation responsable.',
        vocabulary: [
          { word: 'le recyclage', translation: 'el reciclaje', example: 'Le recyclage aide à protéger l’environnement.' },
          { word: 'les déchets', translation: 'los desechos', example: 'Nous produisons trop de déchets à la cantine.' },
          { word: 'l’environnement', translation: 'el medioambiente', example: 'Il faut protéger l’environnement.' },
          { word: 'réduire', translation: 'reducir', example: 'Nous devons réduire notre consommation de plastique.' },
          { word: 'une gourde réutilisable', translation: 'una botella reutilizable', example: 'J’utilise une gourde réutilisable tous les jours.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « le recyclage » ?', options: ['El reciclaje', 'La basura', 'El agua', 'El aire'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « réduire » ?', options: ['Aumentar', 'Reducir', 'Comprar', 'Vender'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « les déchets » ?', options: ['Los desechos', 'Los recursos', 'Los productos', 'Los envases'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Le projet est accepté',
        description: 'La direction accepte le projet écologique de la classe.',
        intro: 'Quelques semaines après leur présentation, deux élèves reçoivent une bonne nouvelle.',
        dialogue: [
          { speaker: 'Le directeur', line: 'J’ai le plaisir de vous annoncer que votre projet est accepté.', translation: 'Tengo el placer de anunciarles que su proyecto es aceptado.' },
          { speaker: 'Élève 1', line: 'C’est une excellente nouvelle, merci beaucoup !', translation: '¡Es una excelente noticia, muchas gracias!' },
          { speaker: 'Élève 2', line: 'Toute la classe va être très contente.', translation: 'Toda la clase va a estar muy contenta.' },
          { speaker: 'Le directeur', line: 'Les nouvelles poubelles seront installées la semaine prochaine.', translation: 'Los nuevos contenedores se instalarán la próxima semana.' }
        ],
        phrases: ['J’ai le plaisir de vous annoncer que...', 'C’est une excellente nouvelle.', 'Toute la classe va être...', 'Ce sera installé...'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle nouvelle le directeur annonce-t-il ?', options: ['Le projet est refusé', 'Le projet est accepté', 'Le projet est reporté', 'Le projet est annulé'], answer: 1 },
          { type: 'mcq', prompt: 'Comment l’élève 1 réagit-elle à la nouvelle ?', options: ['Avec déception', 'Avec joie et gratitude', 'Avec indifférence', 'Avec colère'], answer: 1 },
          { type: 'mcq', prompt: 'Quand les nouvelles poubelles seront-elles installées ?', options: ['Le jour même', 'La semaine prochaine', 'L’année prochaine', 'Jamais'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'medias-et-information',
    title: 'Médias et information',
    titleEs: 'Medios e información',
    description: 'Comment reconnaître une fausse information en ligne et vérifier la fiabilité d’une source, selon les journalistes spécialisés.',
    order: 9,
    accessTier: 'free',
    unitOverview: {
      objective: 'Distinguer une source fiable d’une désinformation et exprimer une opinion sur une information.',
      outcomes: [
        'identifier une source d’information fiable',
        'exprimer un doute ou une certitude',
        'reformuler une information au discours indirect',
        'donner son opinion sur une nouvelle'
      ],
      grammar: ['discours indirect simple (il a dit que)', 'expression du doute et de la certitude', 'connecteurs d’explication (c’est-à-dire, en effet)'],
      vocabulary: ['une source fiable', 'une fausse nouvelle', 'vérifier', 'douter de'],
      scenario: 'En cours d’éducation aux médias, une classe analyse un article partagé sur les réseaux sociaux pour vérifier s’il est fiable.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Vrai ou faux ? Apprendre à repérer la désinformation',
        description: 'Une méthode utilisée dans les cours d’éducation aux médias pour vérifier la fiabilité d’une information en ligne.',
        reading: {
          title: 'Vrai ou faux ? Apprendre à repérer la désinformation',
          parts: [
            "En cours d'éducation aux médias, les professeurs proposent souvent un exercice révélateur : ils montrent à la classe un article partagé des centaines de fois sur les réseaux sociaux, qui affirme qu'un nouveau fruit exotique guérit toutes les maladies. « Que pensez-vous de cet article ? » demandent-ils. Un premier élève répond souvent : « Il a l'air très convaincant, avec beaucoup de partages ! » Mais un autre élève reste prudent : « Je doute que ce soit vrai, aucune source scientifique n'est citée. »",
            "Le professeur explique alors comment vérifier une information : regarder qui a écrit l'article, chercher si d'autres sources fiables confirment l'information, et vérifier la date de publication. Les élèves remarquent généralement que l'article ne mentionne aucun auteur ni aucune étude scientifique précise. « C'est exactement le genre de signal qui doit nous alerter », confirme le professeur. Ensemble, la classe cherche l'information sur un site d'actualités reconnu, et ne trouve rien qui confirme cette affirmation.",
            "Le professeur explique que ce type de fausse nouvelle est appelé « désinformation », et qu'il devient de plus en plus fréquent en ligne. Il donne un conseil simple : avant de partager une information, il faut toujours se demander si la source est fiable et vérifier auprès d'au moins une autre source. Selon le CLEMI, le centre français pour l'éducation aux médias, plus de la moitié des jeunes de quinze à dix-huit ans admettent avoir déjà partagé une fausse information sans le savoir.",
            "Pour aller plus loin, le professeur demande souvent à chaque élève de trouver, avant le prochain cours, un exemple de désinformation qu'il a vu circuler récemment, et d'expliquer pourquoi il ne fallait pas y faire confiance. Beaucoup d'élèves choisissent des messages affirmant qu'une application populaire allait devenir payante du jour au lendemain. En cherchant sur le site officiel de l'application, ils découvrent rapidement que l'information est totalement fausse, une bonne occasion de mettre en pratique ce qu'ils viennent d'apprendre."
          ],
          questions: [
            'Quelle affirmation fait souvent l’article présenté en classe ?',
            'Comment les élèves apprennent-ils à vérifier une information ?',
            'Comment s’appelle ce type de fausse information ?'
          ],
          ordering: {
            prompt: 'Remets les étapes de la leçon dans l’ordre.',
            events: [
              'Le professeur montre un article sur un fruit miracle.',
              'Un élève exprime son doute sur la véracité de l’article.',
              'La classe cherche l’information sur un site fiable.',
              'Le professeur explique le concept de désinformation.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Que prétend souvent l’article partagé sur les réseaux sociaux ?', options: ['Qu’un fruit guérit toutes les maladies', 'Qu’il va neiger demain', 'Qu’une nouvelle école ouvre', 'Qu’un examen est annulé'], answer: 0 },
          { type: 'mcq', prompt: 'Qui doute souvent en premier de la véracité de ce type d’article ?', options: ['Un élève prudent', 'Personne', 'Le professeur seulement', 'Tout le monde y croit'], answer: 0 },
          { type: 'mcq', prompt: 'Que remarquent souvent les élèves à propos de ce type d’article ?', options: ['Il cite plusieurs études', 'Il ne mentionne aucun auteur ni étude scientifique', 'Il est très récent', 'Il vient d’un site officiel'], answer: 1 },
          { type: 'mcq', prompt: 'Que trouve souvent la classe en cherchant sur un site d’actualités reconnu ?', options: ['Une confirmation de l’article', 'Rien qui confirme l’affirmation', 'Un article encore plus convaincant', 'Une interdiction du fruit'], answer: 1 },
          { type: 'mcq', prompt: 'Comment s’appelle ce type de fausse information ?', options: ['La publicité', 'La désinformation', 'La fiction', 'La biographie'], answer: 1 },
          { type: 'mcq', prompt: 'Quel conseil donne souvent le professeur avant de partager une information ?', options: ['Toujours la partager rapidement', 'Vérifier la fiabilité de la source', 'Ne jamais lire les articles', 'Croire tout ce qu’on lit'], answer: 1 },
          { type: 'mcq', prompt: 'Selon le CLEMI, quelle proportion de jeunes a déjà partagé une fausse information sans le savoir ?', options: ['Moins de dix pour cent', 'Plus de la moitié', 'Aucun jeune', 'Cent pour cent'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « révélateur » signifie...', options: ['Sans intérêt', 'Qui montre quelque chose clairement', 'Ennuyeux', 'Interdit'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’intention principale de ce cours ?', options: ['Se moquer des réseaux sociaux', 'Apprendre à évaluer la fiabilité d’une information', 'Interdire internet', 'Décourager la lecture'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’est-ce que le CLEMI, selon le texte ?', options: ['Un réseau social', 'Le centre français pour l’éducation aux médias', 'Une application', 'Un magazine de mode'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Vérifier une information',
        description: 'Écoute Camila et Karim discuter d’un article qu’ils ont vu en ligne.',
        intro: 'Écoute Camila et Karim analyser ensemble un article suspect.',
        dialogue: [
          { speaker: 'Camila', line: 'Tu as vu cet article ? Il dit que ce fruit guérit tout.', translation: '¿Viste este artículo? Dice que esta fruta lo cura todo.' },
          { speaker: 'Karim', line: 'Je doute que ce soit vrai, il n’y a pas de source citée.', translation: 'Dudo que sea verdad, no hay ninguna fuente citada.' },
          { speaker: 'Camila', line: 'Tu as raison, vérifions sur un site fiable.', translation: 'Tienes razón, verifiquémoslo en un sitio confiable.' },
          { speaker: 'Karim', line: 'En effet, aucun autre site ne confirme ça, c’est de la désinformation.', translation: 'En efecto, ningún otro sitio confirma eso, es desinformación.' }
        ],
        phrases: ['Je doute que...', 'Il n’y a pas de source.', 'Vérifions sur...', 'C’est de la désinformation.'],
        exercises: [
          { type: 'mcq', prompt: 'Que prétend l’article ?', options: ['Qu’un fruit guérit tout', 'Qu’il va pleuvoir', 'Qu’une école ferme', 'Qu’un examen est reporté'], answer: 0 },
          { type: 'mcq', prompt: 'Pourquoi Karim doute-t-il de l’article ?', options: ['Il n’aime pas les fruits', 'Il n’y a pas de source citée', 'L’article est trop court', 'Il ne l’a pas lu'], answer: 1 },
          { type: 'mcq', prompt: 'Que décident de faire Camila et Karim ?', options: ['Partager l’article', 'Vérifier sur un site fiable', 'Ignorer le problème', 'Croire l’article sans vérifier'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Analyser une information',
        description: 'Analyse la fiabilité d’une information et exprime ton opinion.',
        mission: 'Présente une information (réelle ou fictive) que tu as vue en ligne, et explique comment tu vérifierais si elle est fiable.',
        phrases: ['J’ai vu que...', 'Je doute que...', 'Il faudrait vérifier si...', 'Une source fiable dirait que...'],
        dialogue: [
          { speaker: 'Toi', line: 'J’ai vu un article qui dit que... Je doute que ce soit vrai, parce qu’il n’y a pas de source citée. Il faudrait vérifier sur un site officiel.', translation: 'Vi un artículo que dice que... Dudo que sea verdad, porque no hay fuente citada. Habría que verificarlo en un sitio oficial.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente une information trouvée en ligne et explique comment vérifier sa fiabilité.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, analysez ensemble un titre d’actualité fictif pour décider s’il semble fiable.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Comment reconnaître une fausse nouvelle',
        description: 'Écris un guide pour aider les autres à reconnaître une fausse information.',
        mission: 'Écris 150 à 200 mots expliquant comment reconnaître une fausse information en ligne, avec au moins trois conseils concrets.',
        phrases: ['Il faut vérifier si...', 'Une source fiable...', 'Je doute que...', 'En effet...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Pour reconnaître une fausse information, il faut vérifier si l’article cite un auteur et des sources fiables. Il faut aussi comparer avec d’autres sites d’actualités reconnus. En effet, si aucune autre source ne confirme l’information, il faut douter de sa véracité.', translation: 'Para reconocer una información falsa, hay que verificar si el artículo cita un autor y fuentes fiables. También hay que comparar con otros sitios de noticias reconocidos. En efecto, si ninguna otra fuente confirma la información, hay que dudar de su veracidad.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 150 à 200 mots avec trois conseils pour reconnaître une fausse information en ligne.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le doute et le discours indirect simple',
        description: 'Exprimer le doute avec le subjonctif et rapporter une information au discours indirect.',
        grammarNote: '« Je doute que » introduit le subjonctif : « Je doute que ce soit vrai. » Le discours indirect rapporte les paroles de quelqu’un sans les citer directement : « Il a dit que le fruit guérissait tout » (au lieu de « Il a dit : "Le fruit guérit tout." »). Au discours indirect présent, le verbe reste souvent au même temps, introduit par « que ».',
        phrases: ['Je doute que ce soit...', 'Il a dit que...', 'Elle pense que...', 'En effet, c’est vrai que...'],
        exercises: [
          { type: 'mcq', prompt: 'Je doute que cette information ___ vraie.', options: ['est', 'soit', 'était', 'sera'], answer: 1 },
          { type: 'mcq', prompt: 'Il a dit que l’article ___ pas fiable.', options: ['n’est', 'n’était', 'ne soit', 'ne sera'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle expression introduit le subjonctif ?', options: ['Je suis sûr que', 'Je doute que', 'Je sais que', 'Il est vrai que'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle phrase est au discours indirect ?', options: ['Elle a dit : « C’est faux. »', 'Elle a dit que c’était faux.', 'Est-ce que c’est faux ?', 'C’est faux !'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire des médias et de l’information',
        description: 'Le vocabulaire essentiel pour parler de la fiabilité des informations.',
        vocabulary: [
          { word: 'une source fiable', translation: 'una fuente fiable', example: 'Il faut toujours vérifier une source fiable.' },
          { word: 'une fausse nouvelle', translation: 'una noticia falsa', example: 'Cet article est une fausse nouvelle.' },
          { word: 'vérifier', translation: 'verificar', example: 'Il faut vérifier l’information avant de la partager.' },
          { word: 'douter de', translation: 'dudar de', example: 'Je doute de la véracité de cet article.' },
          { word: 'la désinformation', translation: 'la desinformación', example: 'La désinformation se propage vite sur internet.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « une fausse nouvelle » ?', options: ['Una noticia falsa', 'Una noticia real', 'Un artículo largo', 'Una fuente fiable'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « vérifier » ?', options: ['Ignorar', 'Verificar', 'Compartir', 'Escribir'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « douter de » ?', options: ['Confiar en', 'Dudar de', 'Compartir', 'Aceptar'], answer: 1 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Un débat sur la désinformation',
        description: 'Un élève demande à deux camarades comment reconnaître une source fiable.',
        intro: 'Après le cours, un élève pose des questions à deux camarades sur la fiabilité des informations.',
        dialogue: [
          { speaker: 'Élève 1', line: 'Comment savoir si une source est fiable ?', translation: '¿Cómo saber si una fuente es fiable?' },
          { speaker: 'Élève 2', line: 'Il faut vérifier qui a écrit l’article et s’il cite des sources.', translation: 'Hay que verificar quién escribió el artículo y si cita fuentes.' },
          { speaker: 'Élève 3', line: 'Et comparer avec d’autres sites d’actualités reconnus.', translation: 'Y comparar con otros sitios de noticias reconocidos.' },
          { speaker: 'Élève 1', line: 'D’accord, je vais faire plus attention maintenant !', translation: '¡De acuerdo, voy a prestar más atención ahora!' }
        ],
        phrases: ['Comment savoir si...', 'Il faut vérifier...', 'Comparer avec...', 'Je vais faire attention.'],
        exercises: [
          { type: 'mcq', prompt: 'Que conseille l’élève 2 à l’élève 1 ?', options: ['De ne jamais lire d’articles', 'De vérifier qui a écrit l’article', 'De partager tout rapidement', 'De ne faire confiance à personne'], answer: 1 },
          { type: 'mcq', prompt: 'Que conseille l’élève 3 en plus ?', options: ['De comparer avec d’autres sites reconnus', 'D’arrêter internet', 'D’écrire son propre article', 'De ne rien vérifier'], answer: 0 },
          { type: 'mcq', prompt: 'Comment réagit l’élève 1 à la fin du dialogue ?', options: ['Il ignore les conseils', 'Il décide de faire plus attention', 'Il se fâche', 'Il ne comprend pas'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'relations-et-conflits',
    title: 'Relations et conflits',
    titleEs: 'Relaciones y conflictos',
    description: 'Comment exprimer un désaccord sans rompre le dialogue et trouver un compromis, selon les spécialistes de la médiation.',
    order: 10,
    accessTier: 'free',
    unitOverview: {
      objective: 'Exprimer un désaccord, une émotion, et négocier une solution à un conflit.',
      outcomes: [
        'exprimer une émotion avec précision',
        'exposer un désaccord respectueusement',
        'négocier une solution à un petit conflit',
        'utiliser le subjonctif après des expressions d’émotion'
      ],
      grammar: ['subjonctif après les expressions d’émotion (je suis triste que, ça me dérange que)', 'expressions de négociation', 'connecteurs de concession (même si)'],
      vocabulary: ['un désaccord', 'se sentir blessé(e)', 'trouver un compromis', 'se réconcilier'],
      scenario: 'Deux camarades de classe se disputent à propos d’un projet scolaire commun, et doivent apprendre à résoudre le conflit calmement.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Un désaccord entre camarades de classe',
        description: 'Comment deux camarades de classe résolvent un désaccord pendant un projet scolaire.',
        reading: {
          title: 'Un désaccord entre camarades de classe',
          parts: [
            "Deux camarades de classe doivent souvent préparer un exposé ensemble sur la francophonie, mais ils ne sont pas toujours d'accord sur la façon de s'organiser. L'un veut tout préparer à l'avance et suivre un plan très structuré, tandis que l'autre préfère improviser et laisser de la place à la créativité. « Ça me dérange que tu changes toujours le plan au dernier moment », dit souvent le premier, un peu frustré. L'autre, surpris par ce ton inhabituel, répond : « Je suis triste que tu penses que je ne prends pas ce projet au sérieux, ce n'est pas vrai du tout ! »",
            "La tension monte pendant quelques minutes, et les deux camarades se sentent un peu blessés. Après un moment de silence, l'un prend souvent une grande respiration et dit : « Excuse-moi, je crois que je suis juste stressé par cet exposé, ce n'est pas contre toi. » L'autre, soulagé, répond : « Je comprends, moi aussi je suis stressé. Peut-être qu'on pourrait trouver un compromis ? Toi, tu prépares la structure, et moi, j'ajoute des idées créatives dans ce cadre. » Le premier sourit : « Ça me semble être une excellente idée, même si ça demande qu'on communique bien tout au long du projet. »",
            "Grâce à ce genre de conversation honnête, beaucoup de binômes trouvent un équilibre qui respecte leurs deux façons de travailler. Ils terminent leur exposé ensemble, sans autre dispute, et obtiennent souvent une très bonne note. Selon les conseillers d'éducation, cette expérience enseigne une leçon importante sur les relations entre camarades : même les meilleurs amis ne sont pas toujours d'accord, mais parler calmement de ses émotions et chercher un compromis permet souvent de résoudre un conflit sans abîmer la relation.",
            "Quelques semaines plus tard, quand un nouveau projet de groupe est annoncé en classe, ces binômes demandent souvent immédiatement à travailler ensemble à nouveau, sans la moindre hésitation. Cette fois, ils décident de discuter de leur méthode de travail dès le début, avant même de commencer, pour éviter que les mêmes tensions ne réapparaissent. Les professeurs remarquent souvent avec plaisir à quel point la collaboration de ces élèves s'améliore d'un projet à l'autre."
          ],
          questions: [
            'Pourquoi ces deux camarades ne sont-ils pas d’accord au début ?',
            'Quel compromis trouvent-ils souvent ?',
            'Quelle leçon les conseillers d’éducation en tirent-ils ?'
          ],
          ordering: {
            prompt: 'Remets les événements du conflit dans l’ordre.',
            events: [
              'Un élève exprime sa frustration sur l’organisation du projet.',
              'L’autre se sent blessé par ce commentaire.',
              'Le premier s’excuse et explique qu’il est stressé.',
              'Ils trouvent un compromis pour travailler ensemble.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Sur quoi ces deux camarades ne sont-ils pas d’accord ?', options: ['Sur le sujet de l’exposé', 'Sur la façon de s’organiser', 'Sur la note qu’ils veulent avoir', 'Sur le jour de la présentation'], answer: 1 },
          { type: 'mcq', prompt: 'Que reproche souvent le premier élève à l’autre ?', options: ['De ne jamais travailler', 'De changer toujours le plan au dernier moment', 'D’être en retard', 'De ne pas parler français'], answer: 1 },
          { type: 'mcq', prompt: 'Comment se sent l’autre élève après ce commentaire ?', options: ['Indifférent', 'Blessé et triste', 'Heureux', 'Fâché contre lui-même'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi le premier élève était-il si frustré, en réalité ?', options: ['Parce qu’il n’aime pas l’autre', 'Parce qu’il était stressé par l’exposé', 'Parce qu’il voulait changer de partenaire', 'Parce qu’il avait raté un examen'], answer: 1 },
          { type: 'mcq', prompt: 'Quel compromis trouvent-ils souvent ?', options: ['Ils arrêtent le projet', 'L’un prépare la structure, l’autre ajoute des idées créatives', 'Ils travaillent séparément', 'Une troisième personne les remplace'], answer: 1 },
          { type: 'mcq', prompt: 'Comment se termine souvent ce genre d’histoire ?', options: ['Ils arrêtent d’être amis', 'Ils terminent l’exposé ensemble avec une bonne note', 'Ils échouent à l’exposé', 'Ils changent de sujet'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : selon le texte, les camarades ne se réconcilient jamais.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « ça me dérange que » exprime...', options: ['Une joie', 'Un dérangement/une gêne', 'Une certitude', 'Une indifférence'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la leçon principale de ce texte ?', options: ['Il ne faut jamais se disputer', 'Parler calmement de ses émotions aide à résoudre un conflit', 'Les amitiés se terminent toujours mal', 'Il faut toujours avoir raison'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle inférence peut-on faire sur la relation entre ces deux camarades après ce conflit ?', options: ['Elle est plus fragile', 'Elle est renforcée par une communication honnête', 'Elle est terminée', 'Elle est ignorée par les deux'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Résoudre un désaccord',
        description: 'Écoute Camila et Léa résoudre leur désaccord calmement.',
        intro: 'Écoute la conversation entre Camila et Léa au moment où elles trouvent un compromis.',
        dialogue: [
          { speaker: 'Léa', line: 'Excuse-moi, je crois que je suis juste stressée par cet exposé.', translation: 'Perdona, creo que solo estoy estresada por esta exposición.' },
          { speaker: 'Camila', line: 'Je comprends, moi aussi je suis stressée.', translation: 'Entiendo, yo también estoy estresada.' },
          { speaker: 'Léa', line: 'Peut-être qu’on pourrait trouver un compromis ?', translation: '¿Quizás podríamos encontrar un compromiso?' },
          { speaker: 'Camila', line: 'Bonne idée, toi la structure, moi les idées créatives.', translation: 'Buena idea, tú la estructura, yo las ideas creativas.' }
        ],
        phrases: ['Excuse-moi, je crois que...', 'Je comprends.', 'On pourrait trouver un compromis ?', 'Bonne idée.'],
        exercises: [
          { type: 'mcq', prompt: 'Pourquoi Léa s’excuse-t-elle ?', options: ['Parce qu’elle a menti', 'Parce qu’elle était stressée', 'Parce qu’elle est en retard', 'Parce qu’elle a oublié le projet'], answer: 1 },
          { type: 'mcq', prompt: 'Que propose Léa pour résoudre le conflit ?', options: ['D’arrêter le projet', 'De trouver un compromis', 'De travailler séparément', 'De changer de sujet'], answer: 1 },
          { type: 'mcq', prompt: 'Quel compromis acceptent-elles ?', options: ['Léa fait tout', 'Camila fait tout', 'Léa la structure, Camila les idées créatives', 'Elles ne décident rien'], answer: 2 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Négocier une solution',
        description: 'Simule la résolution d’un petit conflit entre amis.',
        mission: 'Imagine un désaccord avec un ami sur un projet commun, et simule une conversation pour trouver un compromis, en exprimant tes émotions calmement.',
        phrases: ['Ça me dérange que...', 'Je suis triste que...', 'Peut-être qu’on pourrait...', 'Je comprends ton point de vue.'],
        dialogue: [
          { speaker: 'Toi', line: 'Ça me dérange un peu que tu changes toujours nos plans. Peut-être qu’on pourrait décider ensemble la prochaine fois ?', translation: 'Me molesta un poco que siempre cambies nuestros planes. ¿Quizás podríamos decidir juntos la próxima vez?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Simule la résolution d’un petit conflit, en exprimant une émotion et en proposant un compromis.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, jouez une scène de désaccord suivie d’une réconciliation.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Un conflit résolu',
        description: 'Raconte un conflit (réel ou imaginaire) et comment il a été résolu.',
        mission: 'Écris 150 à 200 mots racontant un désaccord (réel ou imaginaire) avec un ami ou un membre de ta famille, et comment vous l’avez résolu.',
        phrases: ['Nous n’étions pas d’accord sur...', 'Je me sentais...', 'Nous avons trouvé un compromis...', 'Depuis, notre relation...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Nous n’étions pas d’accord sur la façon d’organiser notre projet. Je me sentais un peu blessé(e), mais nous avons parlé calmement et trouvé un compromis. Depuis, notre relation est encore plus forte.', translation: 'No estábamos de acuerdo sobre cómo organizar nuestro proyecto. Me sentía un poco herido/a, pero hablamos con calma y encontramos un compromiso. Desde entonces, nuestra relación es aún más fuerte.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 150 à 200 mots racontant un désaccord et sa résolution, avec au moins une expression d’émotion au subjonctif.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le subjonctif après les expressions d’émotion',
        description: 'Utiliser le subjonctif après des expressions comme « je suis triste que » ou « ça me dérange que ».',
        grammarNote: 'Après une expression d’émotion (je suis content(e) que, je suis triste que, ça me dérange que), le verbe se met au subjonctif : « Je suis triste que tu penses ça. Ça me dérange que tu changes le plan. » Cette règle suit la même logique que « il faut que » ou « il est important que ».',
        phrases: ['Je suis triste que...', 'Ça me dérange que...', 'Je suis content(e) que...', 'J’ai peur que...'],
        exercises: [
          { type: 'mcq', prompt: 'Je suis triste que tu ___ ça de moi.', options: ['penses', 'pense', 'pensais', 'penseras'], answer: 0 },
          { type: 'mcq', prompt: 'Ça me dérange que tu ___ toujours le plan.', options: ['changes', 'change', 'changeais', 'changeras'], answer: 0 },
          { type: 'mcq', prompt: 'Je suis content(e) que nous ___ un compromis.', options: ['trouvons', 'trouvions', 'trouverons', 'trouviez'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle expression introduit le subjonctif ?', options: ['Je sais que', 'Je suis content que', 'Je vois que', 'Je pense que'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire des relations et conflits',
        description: 'Le vocabulaire essentiel pour parler d’émotions et résoudre un conflit.',
        vocabulary: [
          { word: 'un désaccord', translation: 'un desacuerdo', example: 'Nous avons eu un petit désaccord.' },
          { word: 'se sentir blessé(e)', translation: 'sentirse herido/a', example: 'Je me suis sentie blessée par ce commentaire.' },
          { word: 'trouver un compromis', translation: 'encontrar un compromiso', example: 'Nous avons trouvé un compromis ensemble.' },
          { word: 'se réconcilier', translation: 'reconciliarse', example: 'Nous nous sommes réconciliées après la dispute.' },
          { word: 'ça me dérange que', translation: 'me molesta que', example: 'Ça me dérange que tu sois toujours en retard.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « un désaccord » ?', options: ['Un desacuerdo', 'Un acuerdo', 'Una amistad', 'Un compromiso'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « se réconcilier » ?', options: ['Pelearse', 'Reconciliarse', 'Ignorarse', 'Mudarse'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « trouver un compromis » ?', options: ['Encontrar un compromiso', 'Perder una amistad', 'Evitar el problema', 'Ganar una discusión'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Une amitié plus forte',
        description: 'Après avoir résolu leur conflit, deux camarades réfléchissent à leur amitié.',
        intro: 'Après avoir terminé leur exposé avec succès, deux camarades parlent de ce qu’ils ont appris.',
        dialogue: [
          { speaker: 'Camarade 1', line: 'Je suis content(e) qu’on ait pu parler calmement de notre désaccord.', translation: 'Estoy contento/a de que hayamos podido hablar con calma de nuestro desacuerdo.' },
          { speaker: 'Camarade 2', line: 'Moi aussi. Je pense que notre amitié est encore plus forte maintenant.', translation: 'Yo también. Creo que nuestra amistad es aún más fuerte ahora.' },
          { speaker: 'Camarade 1', line: 'Même si on n’est pas toujours d’accord, on sait qu’on peut se parler honnêtement.', translation: 'Aunque no siempre estemos de acuerdo, sabemos que podemos hablar honestamente.' },
          { speaker: 'Camarade 2', line: 'Exactement, et c’est ça, une vraie amitié.', translation: 'Exactamente, y eso es una verdadera amistad.' }
        ],
        phrases: ['Je suis content(e) que...', 'Notre amitié est plus forte.', 'Même si on n’est pas d’accord...', 'C’est ça, une vraie amitié.'],
        exercises: [
          { type: 'mcq', prompt: 'Comment se sent le camarade 1 après avoir résolu le désaccord ?', options: ['Toujours fâché', 'Content d’avoir pu en parler calmement', 'Indifférent', 'Triste'], answer: 1 },
          { type: 'mcq', prompt: 'Que pense le camarade 2 de leur amitié après ce conflit ?', options: ['Qu’elle est terminée', 'Qu’elle est plus forte', 'Qu’elle est plus fragile', 'Il n’en parle pas'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la conclusion du camarade 2 sur une vraie amitié ?', options: ['Il ne faut jamais se disputer', 'Pouvoir se parler honnêtement même en désaccord', 'Toujours être d’accord sur tout', 'Éviter les conflits à tout prix'], answer: 1 }
        ]
      })
    }
  }
];

// Les lectures B1 sont des articles documentaires. Elles ne reposent pas
// sur un récit fictif : chaque texte traite directement le thème de
// l'unité avec des situations observables, des faits vérifiables et des
// pistes concrètes, tout en réutilisant naturellement le point de grammaire
// travaillé dans l'unité. Les questions et le QCM sont propres à chaque
// article (aucun gabarit générique partagé entre les unités).
const REAL_B1_READINGS = {
  'projets-et-avenir': {
    title: 'Construire un projet d’avenir',
    description: 'Comment transformer une ambition en étapes réalistes, avec l’aide de conseillers d’orientation.',
    parts: [
      "Vouloir devenir vétérinaire est un objectif clair sur le papier, mais entre ce rêve et le premier jour de cours, il existe souvent six années d’étapes précises que peu de lycéens anticipent. Au Centre d’Information et de Documentation Jeunesse (CIDJ), qui reçoit plus de 40 000 jeunes chaque année partout en France, les conseillers le répètent presque tous les jours : « Si vous écrivez seulement votre rêve sur une feuille, sans étapes, vous ne saurez pas par où commencer. » Leur méthode consiste à transformer une ambition floue en calendrier concret, avec des dates limites d’inscription, des concours et des documents à préparer.",
      "Prenons un exemple fréquent : un baccalauréat scientifique, une classe préparatoire de deux ans, un concours national très sélectif — qui refuse en moyenne neuf candidats sur dix — puis cinq années d’études. Si chaque étape est écrite avec sa date précise, elle devient une tâche concrète plutôt qu’un vague espoir. Beaucoup de familles découvrent, en consultant ce type de calendrier, qu’elles auraient dû commencer certaines démarches un an plus tôt.",
      "Les conseillers insistent aussi sur un point que peu d’élèves anticipent : le plan B. Si un concours aussi sélectif échoue une première fois, quelle autre voie restera ouverte ? Une école privée, une réorientation, une nouvelle tentative l’année suivante ? Prévoir cette alternative avant l’échec, plutôt qu’après, évite des mois perdus dans la panique et le découragement.",
      "Selon les responsables du CIDJ, les jeunes qui repartent avec un calendrier écrit, même approximatif, se sentent presque immédiatement moins anxieux. Ce n’est pas parce qu’ils savent déjà s’ils réussiront, mais parce qu’ils savent enfin par où commencer. Comme le résume une conseillère : « Un projet d’avenir, ce n’est jamais une seule décision. C’est une suite de petites cases à cocher, une par une. »"
    ],
    exercises: [
      { type: 'mcq', prompt: 'Combien de jeunes le CIDJ reçoit-il chaque année, selon le texte ?', options: ['Plus de 40 000', 'Environ 4 000', 'Moins de 1 000', 'Le texte ne le précise pas'], answer: 0 },
      { type: 'mcq', prompt: 'Quelle proportion de candidats une classe préparatoire sélective refuse-t-elle, selon le texte ?', options: ['Un sur dix', 'Neuf sur dix', 'La moitié', 'Aucun candidat'], answer: 1 },
      { type: 'mcq', prompt: 'Que recommandent les conseillers de prévoir avant un possible échec au concours ?', options: ['Un plan B', 'Un nouveau rêve', 'Un déménagement', 'Rien de particulier'], answer: 0 },
      { type: 'mcq', prompt: 'Comment se sentent les jeunes qui repartent du CIDJ avec un calendrier écrit ?', options: ['Plus anxieux', 'Presque immédiatement moins anxieux', 'Indifférents', 'Découragés'], answer: 1 },
      { type: 'mcq', prompt: 'Selon la conseillère citée à la fin du texte, qu’est-ce qu’un projet d’avenir ?', options: ['Une seule décision définitive', 'Une suite de petites cases à cocher, une par une', 'Un rêve impossible à planifier', 'Un secret qu’il ne faut partager avec personne'], answer: 1 }
    ]
  },
  'identite-et-parcours-personnel': {
    title: 'Identité et parcours personnel',
    description: 'Pourquoi l’identité se construit à travers plusieurs expériences, selon les chercheurs en psychologie sociale.',
    parts: [
      "« Tu étais si timide en arrivant, on ne t’entendait presque jamais en classe. » C’est la phrase que beaucoup d’anciens élèves en échange scolaire entendent de la bouche de leurs professeurs, huit ou dix mois après leur arrivée. Avant leur départ, ces jeunes se décrivaient rarement comme des personnes à l’aise en public : ils parlaient peu devant un groupe, ils sortaient rarement de leur cercle d’amis d’enfance, et l’idée de déménager seuls dans un pays étranger leur semblait presque impossible à imaginer.",
      "Les premières semaines confirment souvent ces craintes. Un élève qui comprenait facilement sa langue maternelle se retrouve soudain incapable de suivre une conversation à table, même simple. Certains racontent avoir pleuré en silence dans leur chambre les premiers soirs, sans oser le dire à leur famille d’accueil. Puis, sans qu’ils s’en rendent vraiment compte, quelque chose a changé : ils ont posé une première question en cours malgré la peur de se tromper, ils ont commandé seuls dans un café, ils ont réussi à expliquer une blague, même mal.",
      "Ce phénomène porte un nom chez les chercheurs en éducation interculturelle : la « courbe en U » de l’adaptation. Elle décrit un enthousiasme initial, suivi d’une phase de fatigue et de doute, puis d’une remontée progressive vers un nouvel équilibre, souvent plus solide que l’état de départ. Les élèves qui ont traversé cette courbe complète rapportent presque tous la même chose au retour : ils étaient une version plus prudente d’eux-mêmes avant de partir, et ils sont devenus une version plus audacieuse en revenant.",
      "Certains, en rentrant chez eux, vivent même un « choc culturel inversé » : leur ville natale leur semble soudain plus petite, et leurs amis d’enfance ont du mal à reconnaître la personne bavarde qui leur raconte son année. Ce décalage passe généralement en quelques semaines, mais la confiance acquise, elle, reste durablement ancrée."
    ],
    exercises: [
      { type: 'mcq', prompt: 'Que disent souvent les professeurs aux anciens élèves en échange, plusieurs mois après leur arrivée ?', options: ['Qu’ils étaient timides en arrivant', 'Qu’ils n’ont pas progressé', 'Qu’ils devraient rentrer chez eux', 'Qu’ils parlaient déjà bien en public'], answer: 0 },
      { type: 'mcq', prompt: 'Que racontent certains élèves à propos des premiers soirs en France ?', options: ['Ils sortaient beaucoup', 'Ils pleuraient en silence dans leur chambre', 'Ils ne pensaient jamais à leur famille', 'Ils comprenaient déjà tout'], answer: 1 },
      { type: 'mcq', prompt: 'Comment les chercheurs en éducation interculturelle appellent-ils ce phénomène d’adaptation ?', options: ['La courbe en U', 'Le choc frontal', 'La spirale descendante', 'L’effet miroir'], answer: 0 },
      { type: 'mcq', prompt: 'Que décrit la « courbe en U », selon le texte ?', options: ['Un enthousiasme initial, une phase de doute, puis une remontée vers un nouvel équilibre', 'Une tristesse permanente sans amélioration', 'Un bonheur constant sans aucune difficulté', 'Un retour immédiat à la timidité initiale'], answer: 0 },
      { type: 'mcq', prompt: 'Qu’est-ce que le « choc culturel inversé », d’après le dernier paragraphe ?', options: ['Le fait que la ville natale semble plus petite au retour', 'Le fait de ne plus vouloir rentrer chez soi', 'Un problème administratif au retour', 'Le fait d’oublier complètement le français'], answer: 0 }
    ]
  },
  'etudes-et-apprentissage': {
    title: 'Apprendre de façon active',
    description: 'Les habitudes qui rendent l’apprentissage plus durable, selon les spécialistes des sciences cognitives.',
    parts: [
      "Vingt minutes après avoir lu un chapitre une seule fois, la moitié de son contenu s’est déjà évaporée de la mémoire, selon la célèbre courbe de l’oubli établie par le psychologue Hermann Ebbinghaus il y a plus d’un siècle, et confirmée depuis par de nombreuses études en sciences cognitives. Relire un cours en silence donne pourtant une impression trompeuse de maîtrise : on reconnaît les mots, mais on serait souvent incapable de les réécrire seul, sans le texte sous les yeux.",
      "À la place d’une relecture passive, les chercheurs recommandent le « rappel actif » : fermer le livre, puis essayer de reformuler l’idée principale avec ses propres mots, sans regarder. Un élève qui teste cette méthode avant un contrôle de mathématiques commencerait, par exemple, par les exercices les plus simples, pour vérifier ce qu’il maîtrise vraiment, avant de s’attaquer aux exercices complexes. Expliquer un problème à voix haute, même seul dans sa chambre, révèle immédiatement les zones encore floues : si l’explication devient hésitante, c’est le signal qu’il faut retravailler cette partie précise.",
      "L’espacement compte tout autant que la méthode. Réviser trente minutes chaque soir pendant une semaine produirait de bien meilleurs résultats qu’une seule session de trois heures la veille de l’examen, d’après plusieurs comparaisons menées auprès de lycéens. Le cerveau retient mieux une information récupérée plusieurs fois, à intervalles réguliers, qu’une information simplement revue une seule fois de façon intensive.",
      "Un professeur consulté sur ce sujet résumerait volontiers la méthode en une phrase : « À ta place, je ne chercherais jamais à tout retenir d’un coup. Je préférerais me tromper plusieurs fois cette semaine, plutôt qu’une seule fois le jour de l’examen. » Cette approche, encore peu enseignée explicitement dans les salles de classe, gagne du terrain à mesure que les résultats se confirment."
    ],
    exercises: [
      { type: 'mcq', prompt: 'Que montre la courbe de l’oubli d’Ebbinghaus, selon le texte ?', options: ['Qu’on retient tout après une seule lecture', 'Qu’une grande partie du contenu est oubliée peu après une seule lecture', 'Qu’il ne faut jamais relire un cours', 'Qu’Ebbinghaus recommandait de dormir avant un examen'], answer: 1 },
      { type: 'mcq', prompt: 'Qu’est-ce que le « rappel actif », selon le texte ?', options: ['Relire un cours plusieurs fois de suite', 'Reformuler une idée avec ses propres mots, sans regarder le texte', 'Copier un cours à la main', 'Écouter un enregistrement du cours'], answer: 1 },
      { type: 'mcq', prompt: 'Que révèle le fait d’expliquer un problème à voix haute, selon le texte ?', options: ['Le niveau de bruit dans la pièce', 'Les zones encore floues de la compréhension', 'Le temps qu’il reste avant l’examen', 'Rien d’utile'], answer: 1 },
      { type: 'mcq', prompt: 'Que produirait de meilleurs résultats qu’une session de trois heures la veille de l’examen, selon le texte ?', options: ['Réviser trente minutes chaque soir pendant une semaine', 'Ne pas réviser du tout', 'Relire le cours une seule fois', 'Dormir toute la journée précédente'], answer: 0 },
      { type: 'mcq', prompt: 'Que dirait le professeur cité à la fin du texte, « à ta place » ?', options: ['Qu’il faut tout retenir d’un coup', 'Qu’il préférerait se tromper plusieurs fois dans la semaine plutôt qu’une fois le jour de l’examen', 'Qu’il vaut mieux réviser seulement la veille', 'Qu’il ne faut jamais se tromper'], answer: 1 }
    ]
  },
  'monde-du-travail': {
    title: 'Comprendre une offre d’emploi',
    description: 'Comment lire les responsabilités, les compétences et les conditions d’un poste avant de postuler.',
    parts: [
      "« Salut, je veux le poste. » Ce type de message, reçu régulièrement par les recruteurs qui gèrent les candidatures de stage, finit presque toujours à la corbeille en quelques secondes, non pas à cause du candidat, mais à cause du registre employé. Selon plusieurs conseillers en insertion professionnelle, la différence entre « je veux » et « je voudrais », entre « peux-tu » et « pourriez-vous », pèse souvent plus lourd dans une première impression que le contenu réel du message.",
      "Une offre de stage ou d’emploi mentionne généralement des missions, des compétences attendues et des conditions de travail. Avant de répondre, il vaut mieux comparer chaque critère avec sa propre expérience, plutôt que d’envoyer la même candidature à toutes les offres sans distinction. Si une annonce cite une compétence que le candidat ne maîtrise pas encore, mieux vaudrait l’assumer clairement — « je n’ai pas encore utilisé ce logiciel, mais je serais ravi d’apprendre rapidement » — plutôt que de l’ignorer ou de l’inventer.",
      "La structure d’un e-mail formel suit une logique simple, presque toujours identique : une formule d’appel respectueuse (« Madame, Monsieur »), un objet clair, deux ou trois phrases expliquant la motivation, puis une formule de politesse pour conclure. Les recruteurs interrogés dans plusieurs enquêtes affirment reconnaître, en quelques lignes seulement, si un candidat a pris le temps de personnaliser son message ou s’il a simplement copié un modèle trouvé en ligne.",
      "L’entretien qui suit fonctionne selon la même logique. On y demanderait volontiers « pourriez-vous m’en dire plus sur l’équipe ? » plutôt que « c’est qui, l’équipe ? ». Ce registre n’a rien d’artificiel : il signale au recruteur qu’un jeune candidat, même sans expérience, comprend déjà les codes implicites du monde professionnel — un signal souvent plus décisif que le diplôme lui-même."
    ],
    exercises: [
      { type: 'mcq', prompt: 'Pourquoi un message commençant par « Salut, je veux le poste » finit-il souvent à la corbeille, selon le texte ?', options: ['À cause du registre trop informel employé', 'Parce que le candidat n’a pas de diplôme', 'Parce que le poste est déjà pris', 'Parce que le message est trop long'], answer: 0 },
      { type: 'mcq', prompt: 'Que vaut-il mieux faire si une offre cite une compétence qu’on ne maîtrise pas encore, selon le texte ?', options: ['Ne rien dire du tout', 'L’assumer clairement et dire qu’on est prêt à apprendre', 'Inventer une expérience', 'Renoncer immédiatement à postuler'], answer: 1 },
      { type: 'mcq', prompt: 'Quels éléments composent la structure d’un e-mail formel, selon le texte ?', options: ['Une formule d’appel, un objet, la motivation, une formule de politesse', 'Uniquement une signature', 'Un CV joint et rien d’autre', 'Une seule phrase courte'], answer: 0 },
      { type: 'mcq', prompt: 'Que remarquent les recruteurs en quelques lignes, selon les enquêtes citées ?', options: ['Si le candidat a un accent régional', 'Si le candidat a personnalisé son message ou copié un modèle', 'Le prix du CV imprimé', 'La couleur du papier utilisé'], answer: 1 },
      { type: 'mcq', prompt: 'Que signale l’usage d’un registre poli en entretien, selon le dernier paragraphe ?', options: ['Que le candidat comprend les codes du monde professionnel', 'Que le candidat a peur du recruteur', 'Que le candidat manque d’expérience', 'Que l’entretien va durer plus longtemps'], answer: 0 }
    ]
  },
  'voyages-et-interculturalite': {
    title: 'Voyager en respectant les lieux',
    description: 'Des choix simples qui améliorent l’expérience des visiteurs et des habitants, selon les offices de tourisme.',
    parts: [
      "À Venise, depuis 2024, les visiteurs à la journée doivent payer une taxe d’entrée de cinq euros pendant certaines périodes de forte affluence, tandis qu’à Barcelone, la mairie a annoncé la suppression progressive des locations touristiques de courte durée d’ici 2028. Ces deux décisions, prises à quelques centaines de kilomètres l’une de l’autre, illustrent un même problème : dans les villes les plus photographiées du monde, le nombre de visiteurs a fini par dépasser ce que les habitants peuvent supporter au quotidien.",
      "Les offices de tourisme rappellent qu’un minimum de préparation change radicalement l’expérience d’un voyage. Consulter les horaires, les règles locales et les jours de fermeture évite les files d’attente interminables, alors que l’improvisation totale mène souvent à un site fermé au moment précis de l’arrivée. Un itinéraire flexible reste toutefois préférable à un planning trop rigide : une grève de transport ou une fermeture exceptionnelle peut bouleverser une journée entière en quelques heures, et il vaut mieux prévoir un musée voisin ou un quartier de repli plutôt que de rester bloqué.",
      "Le comportement individuel des visiteurs compte aussi. Dans le centre historique de certaines villes très fréquentées, le prix moyen des loyers a doublé en dix ans, alors que les commerces de proximité ont peu à peu cédé la place à des boutiques de souvenirs identiques d’une rue à l’autre. Les chercheurs qui étudient ce phénomène, qu’ils appellent le « surtourisme », expliquent que privilégier les commerces locaux et éviter les horaires de forte affluence limite directement cette pression sur les habitants.",
      "Un guide touristique interrogé sur le sujet a expliqué qu’un voyage préparé n’était pas un voyage moins spontané, mais un voyage où la spontanéité pouvait enfin s’exprimer une fois les bases sécurisées. Respecter un lieu, résumait-il, commence toujours par respecter les personnes qui y vivent toute l’année."
    ],
    exercises: [
      { type: 'mcq', prompt: 'Que doivent payer les visiteurs à la journée à Venise depuis 2024, selon le texte ?', options: ['Une taxe d’entrée de cinq euros', 'Un dépôt de garantie', 'Rien du tout', 'Un abonnement annuel'], answer: 0 },
      { type: 'mcq', prompt: 'Qu’a annoncé la mairie de Barcelone, selon le texte ?', options: ['La construction de nouveaux hôtels', 'La suppression progressive des locations touristiques de courte durée d’ici 2028', 'La gratuité des transports pour les touristes', 'L’interdiction totale du tourisme'], answer: 1 },
      { type: 'mcq', prompt: 'Que peut bouleverser une journée entière en quelques heures, selon le texte ?', options: ['Une grève de transport ou une fermeture exceptionnelle', 'Un changement de guide touristique', 'Un jour férié annoncé longtemps à l’avance', 'Le prix d’un billet de musée'], answer: 0 },
      { type: 'mcq', prompt: 'Comment les chercheurs appellent-ils la pression excessive des visiteurs sur les habitants ?', options: ['Le surtourisme', 'La surconsommation', 'Le tourisme durable', 'L’effet de mode'], answer: 0 },
      { type: 'mcq', prompt: 'Selon le guide interrogé à la fin du texte, que permet un voyage préparé ?', options: ['D’éviter toute spontanéité', 'À la spontanéité de s’exprimer une fois les bases sécurisées', 'De ne jamais rencontrer d’imprévu', 'De voyager sans jamais consulter d’horaires'], answer: 1 }
    ]
  },
  'technologie-et-societe': {
    title: 'Choisir ses usages numériques',
    description: 'Comment utiliser les outils numériques sans perdre son attention, selon les chercheurs en psychologie du numérique.',
    parts: [
      "Soixante-dix-huit notifications par jour en moyenne : c’est ce qu’a mesuré une étude menée auprès de lycéens français sur l’usage de leur smartphone, la majorité de ces alertes ne concernant rien d’urgent. D’une part, les outils numériques permettent de rester en contact avec des proches éloignés, de traduire une phrase en une seconde ou d’apprendre une langue gratuitement en ligne. D’autre part, ils interrompent en moyenne l’attention d’un utilisateur toutes les six minutes, selon les mêmes chercheurs, ce qui rend presque impossible toute concentration prolongée sur une seule tâche.",
      "Ce phénomène n’est pas un accident. De nombreuses applications sont conçues, dès leur création, pour capter l’attention le plus longtemps possible : des notifications colorées, un défilement sans fin, des sons précis qui déclenchent une petite décharge de satisfaction. Il est important que les utilisateurs, en particulier les plus jeunes, comprennent ce mécanisme, non pas pour rejeter la technologie, mais pour reprendre le contrôle de leurs propres réglages.",
      "Plusieurs lycées français ont commencé à tester des solutions concrètes : rangement obligatoire des téléphones dans un casier pendant les cours, ou zones sans écran pendant la pause déjeuner. Dans les établissements ayant adopté ces règles depuis plus d’un an, les enseignants rapportent une amélioration nette de la concentration en classe, même si certains élèves ont d’abord protesté. Il faudrait que chaque personne, au-delà de l’école, définisse elle-même des moments précis pour consulter ses réseaux, plutôt que de les vérifier de façon compulsive toute la journée.",
      "Cependant, la responsabilité ne repose pas uniquement sur les individus. Plusieurs pays européens ont récemment adopté des règles plus strictes sur la protection des données des mineurs en ligne, obligeant les plateformes elles-mêmes à limiter certaines fonctionnalités jugées addictives pour les jeunes utilisateurs."
    ],
    exercises: [
      { type: 'mcq', prompt: 'Combien de notifications par jour reçoit en moyenne un lycéen, selon l’étude citée ?', options: ['Soixante-dix-huit', 'Cinq', 'Exactement dix', 'Aucune'], answer: 0 },
      { type: 'mcq', prompt: 'Selon les chercheurs, toutes les combien de minutes l’attention est-elle interrompue en moyenne ?', options: ['Toutes les six minutes', 'Toutes les deux heures', 'Une seule fois par jour', 'Toutes les secondes'], answer: 0 },
      { type: 'mcq', prompt: 'Pourquoi de nombreuses applications utilisent-elles notifications colorées et défilement sans fin, selon le texte ?', options: ['Par accident, sans intention particulière', 'Pour capter l’attention le plus longtemps possible', 'Pour respecter une loi européenne', 'Pour économiser de la batterie'], answer: 1 },
      { type: 'mcq', prompt: 'Que testent plusieurs lycées français concernant les téléphones, selon le texte ?', options: ['Rangement obligatoire pendant les cours et zones sans écran à la pause déjeuner', 'La distribution gratuite de smartphones', 'L’interdiction totale d’internet dans le pays', 'Aucune règle particulière'], answer: 0 },
      { type: 'mcq', prompt: 'Que font plusieurs pays européens, selon le dernier paragraphe ?', options: ['Ils adoptent des règles pour protéger les données des mineurs et limiter les fonctionnalités addictives', 'Ils interdisent totalement les smartphones', 'Ils laissent les plateformes s’autoréguler sans règle', 'Ils suppriment l’accès à internet pour les jeunes'], answer: 0 }
    ]
  },
  'sante-et-mode-de-vie': {
    title: 'Des habitudes de santé réalistes',
    description: 'Pourquoi les routines simples comptent sur la durée, selon les recommandations de santé publique.',
    parts: [
      "Dix mille pas par jour : ce chiffre, devenu un standard mondial, ne vient en réalité d’aucune étude scientifique sérieuse, mais d’une campagne publicitaire japonaise des années 1960 pour un podomètre baptisé littéralement « compteur de dix mille pas ». Santé publique France recommande aujourd’hui un objectif plus réaliste et surtout plus flexible : au moins trente minutes d’activité physique modérée par jour, réparties si besoin en plusieurs courtes séances.",
      "Il est essentiel que chacun adapte ces recommandations à sa propre vie, plutôt que de suivre un modèle unique impossible à tenir. Marchez une partie du trajet vers le lycée, prenez les escaliers plutôt que l’ascenseur, préparez un repas la veille pour éviter la restauration rapide entre deux cours : ces gestes modestes, répétés chaque jour, produisent sur la durée un effet plus important qu’un changement radical abandonné après deux semaines.",
      "Le sommeil mérite une attention particulière chez les adolescents. Les spécialistes recommandent entre huit et dix heures de sommeil par nuit à cet âge, alors que les enquêtes montrent qu’un lycéen sur trois en France dort en réalité moins de sept heures, souvent à cause des écrans consultés tard le soir ou du stress lié aux examens. Il faudrait que les jeunes limitent les écrans au moins trente minutes avant le coucher, car la lumière bleue retarde la production naturelle de mélatonine, l’hormone du sommeil.",
      "Quand la fatigue, le stress ou une douleur deviennent importants et durables, ces conseils du quotidien ne remplacent jamais un avis médical. Consultez un professionnel dès que la situation semble se prolonger anormalement : ce n’est pas un signe de faiblesse, mais une décision responsable qui évite souvent que le problème ne s’aggrave davantage."
    ],
    exercises: [
      { type: 'mcq', prompt: 'D’où vient réellement le chiffre de « dix mille pas par jour », selon le texte ?', options: ['D’une étude médicale récente', 'D’une campagne publicitaire japonaise des années 1960 pour un podomètre', 'D’une recommandation de l’Organisation mondiale de la santé', 'D’un livre de sport américain'], answer: 1 },
      { type: 'mcq', prompt: 'Que recommande Santé publique France comme objectif d’activité physique, selon le texte ?', options: ['Dix mille pas obligatoires chaque jour', 'Au moins trente minutes d’activité physique modérée par jour', 'Une heure de sport intense quotidienne', 'Aucune activité physique n’est nécessaire'], answer: 1 },
      { type: 'mcq', prompt: 'Combien d’heures de sommeil les spécialistes recommandent-ils aux adolescents, selon le texte ?', options: ['Entre huit et dix heures', 'Quatre heures', 'Douze heures', 'Le texte ne le précise pas'], answer: 0 },
      { type: 'mcq', prompt: 'Selon les enquêtes citées, quelle proportion de lycéens dort moins de sept heures ?', options: ['Un lycéen sur trois', 'Tous les lycéens', 'Un lycéen sur cent', 'Aucun lycéen'], answer: 0 },
      { type: 'mcq', prompt: 'Pourquoi faut-il limiter les écrans avant le coucher, selon le texte ?', options: ['Parce que la lumière bleue retarde la production de mélatonine', 'Parce que les écrans consomment trop de batterie', 'Parce que c’est interdit par la loi', 'Parce que cela abîme les yeux définitivement'], answer: 0 }
    ]
  },
  'environnement-et-consommation': {
    title: 'Consommer avec moins de déchets',
    description: 'Pourquoi prévenir les déchets est aussi important que les recycler, selon les experts en économie circulaire.',
    parts: [
      "En Allemagne, le système de consigne pour les bouteilles en plastique fonctionne depuis des décennies : plus de 98 % des bouteilles consignées y sont rapportées et recyclées, contre une proportion beaucoup plus faible dans les pays sans consigne. Ce chiffre intéresse de près les experts en économie circulaire, car il montre qu’un geste individuel devient presque automatique dès que le système collectif est bien conçu.",
      "Le recyclage intervient pourtant à la toute fin du cycle de vie d’un produit, après sa fabrication et son transport. C’est pourquoi de nombreux spécialistes insistent d’abord sur la prévention : choisir un objet durable plutôt que jetable, réparer un appareil qui fonctionne encore, refuser un emballage inutile à la caisse. Il faudrait que ces gestes deviennent aussi naturels que le tri lui-même, car ils réduisent la quantité de matière avant même qu’elle n’entre dans le système de traitement des déchets.",
      "Plusieurs lycées français ont mis en place des gourdes réutilisables et des poubelles de tri clairement identifiées dans leurs cantines. Dans certains établissements, la quantité de bouteilles en plastique jetées a diminué de plus de moitié en moins d’un an, parce que le nouveau réflexe est devenu plus simple que l’ancien. Moins de plastique à usage unique signifie donc moins de déchets à traiter, mais aussi moins de dépenses pour la cantine, qui n’achète plus de bouteilles chaque semaine.",
      "Ces décisions ne reposent cependant pas uniquement sur les individus. Un système de consigne ne fonctionne que si les commerces acceptent facilement de reprendre les emballages, c’est pourquoi plusieurs villes françaises ont commencé à installer des points de collecte automatiques. L’objectif, selon les experts en économie circulaire, n’est pas de faire porter toute la responsabilité à une seule personne, mais de rendre le meilleur choix le plus simple possible pour tout le monde."
    ],
    exercises: [
      { type: 'mcq', prompt: 'Quel pourcentage de bouteilles consignées est rapporté et recyclé en Allemagne, selon le texte ?', options: ['Plus de 98 %', 'Environ 20 %', 'Moins de 10 %', 'Le texte ne le précise pas'], answer: 0 },
      { type: 'mcq', prompt: 'À quel moment du cycle de vie d’un produit le recyclage intervient-il, selon le texte ?', options: ['Avant sa fabrication', 'À la toute fin, après la fabrication et le transport', 'Pendant sa conception uniquement', 'Il n’intervient jamais'], answer: 1 },
      { type: 'mcq', prompt: 'Que s’est-il passé dans certains lycées ayant adopté gourdes réutilisables et poubelles de tri, selon le texte ?', options: ['Les bouteilles jetées ont diminué de plus de moitié en moins d’un an', 'Rien n’a changé', 'Les déchets ont doublé', 'Les cantines ont dépensé plus qu’avant'], answer: 0 },
      { type: 'mcq', prompt: 'À quelle condition un système de consigne fonctionne-t-il, selon le texte ?', options: ['Si les commerces acceptent facilement de reprendre les emballages', 'Si le gouvernement l’interdit', 'Si les bouteilles sont en verre uniquement', 'Cela ne dépend d’aucune condition'], answer: 0 },
      { type: 'mcq', prompt: 'Quel est l’objectif final décrit par les experts en économie circulaire cités dans le texte ?', options: ['Rendre le meilleur choix le plus simple possible pour tout le monde', 'Punir les personnes qui produisent des déchets', 'Supprimer totalement la consommation', 'Rendre le recyclage obligatoire uniquement en Allemagne'], answer: 0 }
    ]
  },
  'medias-et-information': {
    title: 'Vérifier avant de partager',
    description: 'Les réflexes utiles face à une information en ligne, selon les journalistes spécialisés en vérification des faits.',
    parts: [
      "En une seule journée, une photo présentée comme récente peut être partagée des dizaines de milliers de fois avant qu’un vérificateur ne découvre qu’elle date en réalité de plusieurs années. AFP Factuel, l’un des principaux services de vérification des faits en France, traite chaque semaine des centaines de signalements de ce type : une image authentique, mais sortie de son contexte d’origine, dont le sens a été complètement modifié par la légende qui l’accompagne.",
      "Les vérificateurs expliquent qu’une information circule d’autant plus vite qu’elle provoque une émotion forte, c’est-à-dire la surprise, la colère ou la peur. Avant de partager un contenu, il est donc utile de vérifier la date de publication, l’auteur et la source originale. Une organisation de vérification a récemment indiqué que le nombre de signalements douteux avait presque triplé pendant les périodes électorales, ce qui confirme que la désinformation suit généralement l’actualité la plus sensible.",
      "Les plateformes numériques ont mis en place des outils pour limiter cette propagation : des étiquettes signalant un contenu contesté, ou des liens automatiques vers des sources fiables. Ces outils ne suffisent cependant pas, en effet, car les formes de désinformation évoluent constamment pour les contourner, notamment grâce à des images générées par intelligence artificielle, de plus en plus difficiles à distinguer d’une photo réelle.",
      "Un journaliste spécialisé en vérification a expliqué qu’il valait mieux douter d’abord et vérifier ensuite, plutôt que de partager immédiatement par réflexe. Ce doute méthodique, disait-il, n’est pas un manque de confiance envers l’information en général, mais une habitude de prudence, comparable au réflexe de regarder à gauche et à droite avant de traverser une rue."
    ],
    exercises: [
      { type: 'mcq', prompt: 'Que traite AFP Factuel chaque semaine, selon le texte ?', options: ['Des centaines de signalements de contenus douteux', 'Uniquement des articles sportifs', 'Des publicités', 'Rien de particulier'], answer: 0 },
      { type: 'mcq', prompt: 'Pourquoi une image authentique peut-elle induire en erreur, selon le texte ?', options: ['Parce qu’elle est sortie de son contexte et sa légende en modifie le sens', 'Parce qu’elle est toujours truquée', 'Parce qu’elle n’a jamais existé', 'Parce que les vérificateurs la refusent systématiquement'], answer: 0 },
      { type: 'mcq', prompt: 'Que confirme la hausse des signalements douteux pendant les périodes électorales, selon le texte ?', options: ['Que la désinformation suit l’actualité la plus sensible', 'Que les élections n’intéressent personne', 'Que les vérificateurs travaillent moins pendant ces périodes', 'Que les images sont toujours fausses pendant les élections'], answer: 0 },
      { type: 'mcq', prompt: 'Pourquoi les outils automatiques des plateformes ne suffisent-ils pas, selon le texte ?', options: ['Parce que les formes de désinformation évoluent pour les contourner, notamment via l’intelligence artificielle', 'Parce qu’ils sont trop chers', 'Parce que personne ne les active', 'Parce qu’ils bloquent tous les contenus, y compris les vrais'], answer: 0 },
      { type: 'mcq', prompt: 'Que recommande le journaliste spécialisé en vérification cité à la fin du texte ?', options: ['Partager immédiatement par réflexe', 'Douter d’abord et vérifier ensuite, avant de partager', 'Ne jamais faire confiance à aucune source', 'Ignorer complètement les réseaux sociaux'], answer: 1 }
    ]
  },
  'relations-et-conflits': {
    title: 'Parler pour trouver un accord',
    description: 'Comment exprimer un désaccord sans rompre le dialogue, selon les spécialistes de la communication et de la médiation.',
    parts: [
      "« Ça me dérange que tu changes toujours le plan au dernier moment » exprime une émotion précise. « Tu ne penses jamais à moi » est une accusation. Cette distinction, au cœur de la méthode de communication non violente développée par le psychologue américain Marshall Rosenberg dans les années 1960, change presque tout dans la façon dont un désaccord évolue : la première phrase invite à une réponse, la seconde pousse presque toujours à la défense.",
      "Les médiateurs professionnels, formés pour intervenir en cas de conflit au travail ou à l’école, utilisent une méthode en trois temps qui reprend directement ce principe. D’abord, chaque personne décrit la situation sans être interrompue. Ensuite, elle exprime ce qu’elle ressent, sans accuser l’autre directement. Enfin, les deux parties proposent ensemble une solution concrète. Cette méthode fonctionne aussi bien pour un désaccord entre camarades de classe que pour un conflit entre collègues, même si les enjeux paraissent très différents d’une situation à l’autre.",
      "Un compromis n’oblige personne à abandonner complètement son opinion. Il s’agit plutôt d’identifier les priorités de chacun, puis de vérifier que la solution reste équitable pour les deux parties. Dire précisément qui fera quoi, et à quel moment, évite de nombreux malentendus, alors qu’un accord resté vague — « on va faire un effort » — se termine presque toujours par une nouvelle frustration quelques jours plus tard.",
      "Il est rare qu’un conflit se résolve dès la première conversation, même si les deux personnes le souhaitent sincèrement. Les formations à la gestion de conflit, de plus en plus proposées dans les établissements scolaires français, montrent que ces compétences s’apprennent, se pratiquent, et renforcent presque toujours une relation plutôt que de l’affaiblir durablement."
    ],
    exercises: [
      { type: 'mcq', prompt: 'Qui a développé la méthode de communication non violente citée dans le texte ?', options: ['Le psychologue américain Marshall Rosenberg', 'Un médiateur scolaire français', 'Un chercheur en économie circulaire', 'Un journaliste spécialisé en vérification des faits'], answer: 0 },
      { type: 'mcq', prompt: 'Quelle est la différence entre les deux phrases données en exemple au début du texte ?', options: ['L’une exprime une émotion précise, l’autre est une accusation', 'Elles signifient exactement la même chose', 'L’une est en anglais, l’autre en français', 'Aucune différence n’est mentionnée'], answer: 0 },
      { type: 'mcq', prompt: 'Quelles sont les trois étapes de la méthode utilisée par les médiateurs professionnels, selon le texte ?', options: ['Décrire la situation, exprimer son ressenti, proposer une solution ensemble', 'Accuser, se défendre, puis se réconcilier', 'Ignorer, attendre, oublier', 'Choisir un gagnant et un perdant'], answer: 0 },
      { type: 'mcq', prompt: 'Pourquoi un accord trop vague comme « on va faire un effort » pose-t-il souvent problème, selon le texte ?', options: ['Il se termine presque toujours par une nouvelle frustration', 'Il est toujours très efficace', 'Il est interdit entre collègues', 'Personne ne s’en souvient jamais'], answer: 0 },
      { type: 'mcq', prompt: 'Que montrent les formations à la gestion de conflit proposées dans les écoles françaises, selon le texte ?', options: ['Que ces compétences s’apprennent et renforcent la relation', 'Qu’elles sont réservées aux adultes', 'Qu’elles créent davantage de disputes', 'Qu’elles ne servent à rien à l’école'], answer: 0 }
    ]
  }
};

units.forEach((unit) => {
  const activity = unit.activities?.reading;
  const realReading = REAL_B1_READINGS[unit.slug];
  if (activity?.reading && realReading) {
    activity.title = realReading.title;
    activity.description = realReading.description;
    activity.reading = { title: realReading.title, parts: realReading.parts };
    activity.exercises = realReading.exercises;
  }
  if (activity?.reading && Array.isArray(activity.exercises)) {
    activity.reading.questions = activity.exercises.slice(0, 5).map((exercise) => exercise.prompt);
    delete activity.reading.ordering;
  }
});

require('./french-b1-b2-listening-scripts').applyFrenchUpperListening(units, 'B1');
require('./french-grammar-tests').ensureFrenchGrammarTests(units, 'B1');

module.exports = {
  language: 'french',
  level: 'B1',
  courseTitle: 'Français B1',
  courseDescription:
    'Français intermédiaire : projets, opinions et expériences de la vie réelle, organisés en unités thématiques autour de sujets d’actualité et de société.',
  units
};
