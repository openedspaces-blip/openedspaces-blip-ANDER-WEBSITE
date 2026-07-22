// scripts/content/french-b1-units.js
// Hand-authored French B1 content, same shape as
// scripts/content/french-a1-units.js / french-a2-units.js. Continues the
// narrative thread - Camila, now further into her exchange year in Tours,
// facing more independent, opinion-driven B1 situations. One starter unit
// (MVP), meant to be extended the same way A2 grew from 2 to 4 units.
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
    description: 'Camila réfléchit à son avenir et discute de ses projets avec Léa et Karim.',
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
      scenario: 'À quelques mois de la fin de son année d’échange, Camila doit décider si elle prolonge son séjour en France.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Rester ou repartir ?',
        description: 'Camila hésite entre prolonger son échange en France ou rentrer en République dominicaine.',
        reading: {
          title: 'Rester ou repartir ?',
          parts: [
            "À quelques mois de la fin de son année scolaire à Tours, Camila doit prendre une décision importante : rester une année de plus en France, ou rentrer chez elle, à Saint-Domingue. Ses parents lui ont proposé de prolonger son échange si elle le souhaite vraiment, mais elle hésite. D'un côté, elle adore sa vie à Tours : ses amis Léa et Karim, la famille Lambert, le lycée, et tout ce qu'elle a appris en français. De l'autre côté, sa famille et ses amis d'enfance lui manquent énormément, surtout sa grand-mère, qu'elle n'a pas vue depuis presque un an.",
            "Un soir, elle en parle avec Léa. « Si je reste, je vais continuer à progresser en français et je pourrai peut-être étudier dans une université française plus tard », explique Camila. « Mais si je rentre maintenant, je vais retrouver ma famille, mais je vais aussi devoir tout recommencer avec mes amis là-bas, qui ont continué leur vie sans moi. » Léa l'écoute attentivement, puis lui répond : « À mon avis, il n'y a pas de mauvaise décision ici. Si tu restes, on continuera à être amies ; si tu pars, on s'écrira et je viendrai peut-être te rendre visite un jour ! »",
            "Cette conversation aide Camila à voir la situation plus clairement. Elle réalise que, quelle que soit sa décision, elle ne perdra pas ce qu'elle a construit cette année : une nouvelle langue, de nouveaux amis, une nouvelle façon de voir le monde. Finalement, après avoir longuement réfléchi et parlé avec ses parents au téléphone, elle décide de rentrer à Saint-Domingue à la fin de l'année scolaire, mais avec le projet de revenir étudier en France après le lycée, si tout se passe bien. Léa et Karim promettent de venir la voir un jour dans les Caraïbes, et tous les trois savent que cette amitié durera bien au-delà de cette année d'échange."
          ],
          questions: [
            'Quelle décision Camila doit-elle prendre ?',
            'Que lui manque le plus si elle reste en France ?',
            'Quelle décision prend-elle finalement, et avec quel projet ?'
          ],
          ordering: {
            prompt: 'Remets les événements de l’histoire dans l’ordre.',
            events: [
              'Les parents de Camila lui proposent de prolonger son échange.',
              'Camila parle de son hésitation avec Léa un soir.',
              'Camila réfléchit et parle avec ses parents au téléphone.',
              'Elle décide de rentrer, avec le projet de revenir étudier en France plus tard.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Quel est le sujet principal du texte ?', options: ['Un voyage touristique', 'Une décision importante sur l’avenir de Camila', 'Un problème de santé', 'Un examen scolaire'], answer: 1 },
          { type: 'mcq', prompt: 'Que lui proposent ses parents ?', options: ['De rentrer immédiatement', 'De prolonger son échange si elle le souhaite', 'De changer de famille d’accueil', 'De changer de ville en France'], answer: 1 },
          { type: 'mcq', prompt: 'Qui manque le plus à Camila si elle reste en France ?', options: ['Ses amis d’enfance seulement', 'Sa grand-mère et sa famille', 'Ses professeurs', 'Personne en particulier'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit Léa pour rassurer Camila ?', options: ['Qu’elle doit absolument rester', 'Qu’il n’y a pas de mauvaise décision', 'Qu’elle doit absolument partir', 'Qu’elle ne la reverra jamais'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la décision finale de Camila ?', options: ['Rester définitivement en France', 'Rentrer à Saint-Domingue avec le projet de revenir plus tard', 'Ne jamais revenir en France', 'Changer de pays d’échange'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « quelle que soit sa décision » signifie...', options: ['Peu importe ce qu’elle choisit', 'Elle doit absolument choisir la France', 'Elle n’a pas le droit de choisir', 'Sa décision est déjà annulée'], answer: 0 },
          { type: 'mcq', prompt: 'Quel connecteur le texte utilise-t-il pour opposer deux idées ?', options: ['Parce que', 'D’un côté / de l’autre côté', 'Donc', 'Ensuite'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle inférence peut-on faire sur l’amitié entre Camila et Léa ?', options: ['Elle va probablement se terminer', 'Elle va probablement continuer malgré la distance', 'Elle n’a jamais été sincère', 'Léa est en colère contre Camila'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle phrase exprime une opinion, et non un fait ?', options: ['Camila vit à Tours depuis un an.', 'À mon avis, il n’y a pas de mauvaise décision ici.', 'Camila parle avec Léa un soir.', 'Ses parents lui ont proposé de prolonger son échange.'], answer: 1 },
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
        mission: 'Écris 150 à 200 mots sous forme de lettre à un ami, expliquant une décision importante que tu as prise (ou que Camila a prise) et tes projets pour l’avenir.',
        phrases: ['Je t’écris pour t’annoncer que...', 'J’ai décidé de...', 'Dans le futur, je...', 'Si tout se passe bien, je...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Cher Karim, je t’écris pour t’annoncer que j’ai décidé de rentrer à Saint-Domingue à la fin de l’année. C’était une décision difficile, mais ma famille me manque beaucoup. Si tout se passe bien, je reviendrai étudier en France après le lycée. Je n’oublierai jamais cette année incroyable avec vous.', translation: 'Querido Karim, te escribo para anunciarte que decidí regresar a Santo Domingo al final del año. Fue una decisión difícil, pero extraño mucho a mi familia. Si todo va bien, volveré a estudiar en Francia después del bachillerato. Nunca olvidaré este año increíble con ustedes.' }
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
          { type: 'mcq', prompt: 'Léa et Karim ___ visiter Camila un jour.', options: ['viendront', 'viennent', 'venir', 'sont venus'], answer: 0 }
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
        title: 'La promesse de Léa et Karim',
        description: 'Léa et Karim promettent à Camila de lui rendre visite un jour.',
        intro: 'Après avoir appris la décision de Camila, Léa et Karim lui font une promesse.',
        dialogue: [
          { speaker: 'Léa', line: 'On va beaucoup te manquer, Camila, mais on comprend ta décision.', translation: 'Te vamos a extrañar mucho, Camila, pero entendemos tu decisión.' },
          { speaker: 'Karim', line: 'Un jour, on viendra te rendre visite dans les Caraïbes, c’est promis !', translation: '¡Un día iremos a visitarte al Caribe, lo prometemos!' },
          { speaker: 'Camila', line: 'Ça me touche énormément. On restera toujours en contact.', translation: 'Eso me conmueve mucho. Siempre estaremos en contacto.' },
          { speaker: 'Léa', line: 'Et qui sait, peut-être que tu reviendras étudier ici un jour.', translation: 'Y quién sabe, quizás vuelvas a estudiar aquí algún día.' }
        ],
        phrases: ['On va te manquer.', 'C’est promis !', 'Ça me touche.', 'Qui sait...'],
        exercises: [
          { type: 'mcq', prompt: 'Que promettent Léa et Karim à Camila ?', options: ['De ne jamais lui parler', 'De venir lui rendre visite un jour', 'De déménager avec elle', 'D’oublier cette année'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila réagit-elle à cette promesse ?', options: ['Avec indifférence', 'Elle est touchée', 'Elle se met en colère', 'Elle ne les croit pas'], answer: 1 },
          { type: 'mcq', prompt: 'Que suggère Léa à la fin du dialogue ?', options: ['Que Camila ne reviendra jamais', 'Que Camila pourrait revenir étudier en France un jour', 'Qu’elle doit rester maintenant', 'Que leur amitié va se terminer'], answer: 1 }
        ]
      })
    }
  }
];

module.exports = {
  language: 'french',
  level: 'B1',
  courseTitle: 'Français B1',
  courseDescription:
    'Français intermédiaire : projets, opinions et expériences, organisés en unités thématiques qui poursuivent le parcours de Camila, élève dominicaine en échange scolaire à Tours.',
  units
};
