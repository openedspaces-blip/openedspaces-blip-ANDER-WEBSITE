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
  },
  // ---------------------------------------------------------------
  {
    slug: 'identite-et-parcours-personnel',
    title: 'Identité et parcours personnel',
    titleEs: 'Identidad y trayectoria personal',
    description: 'Camila écrit une courte biographie pour un projet scolaire sur son parcours et les changements vécus depuis son arrivée en France.',
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
      scenario: 'Pour un projet scolaire, Camila écrit une courte biographie sur son parcours et sur la façon dont elle a changé depuis son arrivée en France.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Comment j’ai changé',
        description: 'Camila réfléchit, dans un texte pour l’école, à la façon dont son séjour en France l’a transformée.',
        reading: {
          title: 'Comment j’ai changé',
          parts: [
            "Avant, quand j'étais à Saint-Domingue, j'étais une personne plutôt timide. Je parlais peu en public, et l'idée de déménager seule dans un autre pays me terrifiait. Je passais mon temps libre avec le même petit groupe d'amies depuis l'école primaire, et je n'aimais pas beaucoup sortir de ma zone de confort. Ma famille et mes professeurs disaient souvent que j'étais « la fille sage et discrète » de la classe.",
            "Depuis mon arrivée en France, il y a maintenant huit mois, j'ai beaucoup changé. Au début, c'était très difficile : je ne comprenais presque rien en français, et je me sentais souvent seule, même entourée de la famille Lambert. Mais petit à petit, j'ai commencé à prendre confiance en moi. J'ai dû parler français tous les jours, poser des questions même quand j'avais peur de me tromper, et me faire de nouveaux amis dans une culture complètement différente de la mienne.",
            "Aujourd'hui, je suis une personne beaucoup plus sûre d'elle. Je participe activement en classe, je n'ai plus peur de faire des erreurs quand je parle, et j'ai appris à sortir de ma zone de confort régulièrement. Mes amis français, Léa et Karim, disent en riant que je suis devenue « plus bavarde qu'eux » ! Ce voyage m'a appris que le changement est parfois difficile, mais qu'il nous rend plus forts. Je ne suis plus la même personne qu'avant mon départ, et je pense que c'est une très bonne chose.",
            "Quand je repense à la Camila timide qui est arrivée à l'aéroport de Paris il y a huit mois, j'ai presque du mal à me reconnaître. Bien sûr, il me reste encore des progrès à faire en français, et il y aura sans doute d'autres défis à surmonter avant la fin de l'année scolaire. Mais je sais maintenant que je suis capable de m'adapter à des situations nouvelles, même difficiles. Cette confiance en moi, je la garderai bien après mon retour à Saint-Domingue."
          ],
          questions: [
            'Comment Camila se décrivait-elle avant son départ pour la France ?',
            'Quelles difficultés a-t-elle rencontrées au début de son séjour ?',
            'Comment Camila a-t-elle changé depuis son arrivée en France ?'
          ],
          ordering: {
            prompt: 'Remets les étapes du parcours de Camila dans l’ordre.',
            events: [
              'Camila était une personne timide à Saint-Domingue.',
              'Au début en France, elle se sentait seule et perdue.',
              'Petit à petit, elle a pris confiance en elle.',
              'Aujourd’hui, elle est devenue une personne plus sûre d’elle.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Comment Camila se décrivait-elle avant son départ ?', options: ['Bavarde et confiante', 'Timide et discrète', 'Fâchée et froide', 'Paresseuse'], answer: 1 },
          { type: 'mcq', prompt: 'Depuis combien de temps Camila est-elle en France ?', options: ['Deux mois', 'Cinq mois', 'Huit mois', 'Un an'], answer: 2 },
          { type: 'mcq', prompt: 'Quelle difficulté Camila a-t-elle rencontrée au début ?', options: ['Elle n’aimait pas la nourriture', 'Elle ne comprenait presque rien en français', 'Elle n’avait pas de famille d’accueil', 'Elle voulait rentrer immédiatement'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila a-t-elle progressivement pris confiance en elle ?', options: ['En évitant de parler français', 'En parlant français tous les jours, malgré la peur de se tromper', 'En restant seule tout le temps', 'En changeant de famille d’accueil'], answer: 1 },
          { type: 'mcq', prompt: 'Que disent Léa et Karim de Camila aujourd’hui ?', options: ['Qu’elle est toujours aussi timide', 'Qu’elle est devenue plus bavarde qu’eux', 'Qu’elle ne parle jamais en classe', 'Qu’elle veut rentrer chez elle'], answer: 1 },
          { type: 'mcq', prompt: 'Quel temps grammatical domine la description de la vie de Camila « avant » ?', options: ['Le futur simple', 'L’imparfait', 'Le conditionnel', 'Le subjonctif'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila pense que le changement est une mauvaise chose.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « sortir de sa zone de confort » signifie...', options: ['Rester dans ses habitudes', 'Faire des choses qui nous mettent mal à l’aise mais nous font grandir', 'Voyager souvent', 'Éviter les problèmes'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’intention principale de ce texte ?', options: ['Se plaindre de la vie en France', 'Réfléchir sur son évolution personnelle', 'Décrire la ville de Tours', 'Expliquer un problème de logement'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle conclusion Camila tire-t-elle de son expérience ?', options: ['Le changement est toujours facile', 'Le changement peut être difficile mais nous rend plus forts', 'Il ne faut jamais changer', 'Elle regrette d’être partie'], answer: 1 }
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
        description: 'Madame Lambert félicite Camila pour son évolution durant l’année.',
        intro: 'Madame Lambert observe le changement de Camila depuis son arrivée et le lui exprime.',
        dialogue: [
          { speaker: 'Mme Lambert', line: 'Tu as tellement changé depuis ton arrivée, Camila. Je suis fière de toi.', translation: 'Has cambiado tanto desde que llegaste, Camila. Estoy orgullosa de ti.' },
          { speaker: 'Camila', line: 'Merci, Madame Lambert, ça me touche beaucoup.', translation: 'Gracias, señora Lambert, eso me conmueve mucho.' },
          { speaker: 'Mme Lambert', line: 'Au début, tu étais si timide, et maintenant, tu parles avec confiance.', translation: 'Al principio eras tan tímida, y ahora hablas con confianza.' },
          { speaker: 'Camila', line: 'C’est grâce à vous tous. Vous m’avez beaucoup aidée.', translation: 'Es gracias a todos ustedes. Me han ayudado mucho.' }
        ],
        phrases: ['Tu as changé.', 'Je suis fier/fière de toi.', 'Ça me touche.', 'C’est grâce à vous.'],
        exercises: [
          { type: 'mcq', prompt: 'Que remarque Madame Lambert chez Camila ?', options: ['Qu’elle n’a pas changé', 'Qu’elle a beaucoup changé', 'Qu’elle veut partir', 'Qu’elle est fatiguée'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila réagit-elle au compliment ?', options: ['Elle est indifférente', 'Elle est touchée', 'Elle est fâchée', 'Elle ne répond pas'], answer: 1 },
          { type: 'mcq', prompt: 'À qui Camila attribue-t-elle son évolution ?', options: ['À elle seule', 'À la famille Lambert', 'À personne en particulier', 'À son école à Saint-Domingue'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'etudes-et-apprentissage',
    title: 'Études et apprentissage',
    titleEs: 'Estudios y aprendizaje',
    description: 'Camila partage ses stratégies pour apprendre le français et discute de ses difficultés scolaires avec Karim.',
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
      scenario: 'Camila a un examen de mathématiques important et demande des conseils d’étude à Karim.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Réviser pour l’examen',
        description: 'Camila prépare un examen difficile et demande conseil à Karim, qui est très bon élève.',
        reading: {
          title: 'Réviser pour l’examen',
          parts: [
            "Camila a un examen de mathématiques important dans une semaine, et elle est très inquiète. « Je comprends les explications en classe, mais dès que je suis seule pour faire les exercices, j'ai l'impression de tout oublier », explique-t-elle à Karim pendant la pause déjeuner. Karim, qui a toujours de très bonnes notes en mathématiques, lui propose de l'aider. « À ta place, je commencerais par refaire les exercices les plus simples, pour bien comprendre la base avant de passer aux exercices difficiles », suggère-t-il.",
            "Camila décide de suivre son conseil. Chaque soir, en rentrant de l'école, elle passe trente minutes à réviser calmement, en refaisant d'abord les exercices simples, puis en essayant progressivement des exercices plus complexes. Karim lui montre aussi une technique utile : en expliquant à voix haute comment résoudre un problème, on comprend souvent mieux qu'en le lisant silencieusement. Camila trouve cette méthode très efficace, même si elle se sent un peu ridicule à parler toute seule dans sa chambre au début !",
            "Après une semaine de révisions régulières, Camila se sent beaucoup plus confiante. Le jour de l'examen, elle reconnaît plusieurs types d'exercices qu'elle a pratiqués et parvient à les résoudre sans trop de difficulté. Quelques jours plus tard, elle reçoit sa note : dix-sept sur vingt, sa meilleure note de l'année en mathématiques ! Elle remercie chaleureusement Karim pour ses conseils et comprend maintenant qu'avec une bonne méthode et de la régularité, même les matières les plus difficiles deviennent plus faciles à maîtriser.",
            "Depuis cette expérience, Camila applique la même méthode à ses autres matières : le français, l'histoire, et même les sciences. Elle a compris que la difficulté n'était pas dans la matière elle-même, mais dans sa façon d'étudier auparavant. Elle propose maintenant à son tour d'aider d'autres élèves qui rencontrent des difficultés similaires, en leur transmettant les conseils que Karim lui avait donnés. Comme elle le dit souvent : « Un bon conseil, ça se partage ! »"
          ],
          questions: [
            'Quelle difficulté Camila rencontre-t-elle avec les mathématiques ?',
            'Quel conseil Karim lui donne-t-il ?',
            'Quel résultat Camila obtient-elle à l’examen ?'
          ],
          ordering: {
            prompt: 'Remets les événements dans l’ordre.',
            events: [
              'Camila explique sa difficulté en mathématiques à Karim.',
              'Karim lui conseille de commencer par les exercices simples.',
              'Camila révise régulièrement chaque soir pendant une semaine.',
              'Camila obtient sa meilleure note de l’année à l’examen.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Quelle difficulté Camila décrit-elle ?', options: ['Elle ne comprend rien en classe', 'Elle oublie tout quand elle est seule pour les exercices', 'Elle n’aime pas les mathématiques', 'Elle n’a pas de livre'], answer: 1 },
          { type: 'mcq', prompt: 'Que suggère Karim en premier ?', options: ['D’abandonner les mathématiques', 'De commencer par les exercices simples', 'D’étudier seulement la veille', 'De changer de classe'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle technique Karim montre-t-il à Camila ?', options: ['Écouter de la musique en étudiant', 'Expliquer à voix haute comment résoudre un problème', 'Copier les réponses d’un ami', 'Étudier seulement le matin'], answer: 1 },
          { type: 'mcq', prompt: 'Combien de temps Camila révise-t-elle chaque soir ?', options: ['Quinze minutes', 'Trente minutes', 'Une heure', 'Deux heures'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle note Camila obtient-elle à l’examen ?', options: ['Douze sur vingt', 'Quinze sur vingt', 'Dix-sept sur vingt', 'Vingt sur vingt'], answer: 2 },
          { type: 'mcq', prompt: 'Comment Camila se sent-elle avant l’examen, après une semaine de révisions ?', options: ['Toujours très inquiète', 'Plus confiante', 'Indifférente', 'Fâchée'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : c’était la première fois que Camila avait une si bonne note en mathématiques.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Dans le texte, « à ta place » signifie...', options: ['Dans ta maison', 'Si j’étais toi', 'À ton école', 'Devant toi'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la conclusion principale du texte ?', options: ['Les mathématiques sont impossibles à apprendre', 'Avec une bonne méthode et de la régularité, on progresse', 'Il faut toujours étudier seul', 'Les conseils des amis ne servent à rien'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi Camila se sent-elle « un peu ridicule » au début ?', options: ['Parce qu’elle échoue à l’examen', 'Parce qu’elle parle toute seule dans sa chambre', 'Parce que Karim se moque d’elle', 'Parce qu’elle n’a pas de livre'], answer: 1 }
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
        description: 'Camila reçoit sa note et remercie Karim pour son aide.',
        intro: 'Camila vient de recevoir sa note d’examen et court en parler à Karim.',
        dialogue: [
          { speaker: 'Camila', line: 'Karim ! J’ai eu dix-sept sur vingt à l’examen !', translation: '¡Karim! ¡Tuve diecisiete sobre veinte en el examen!' },
          { speaker: 'Karim', line: 'C’est génial ! Je savais que tu pouvais y arriver.', translation: '¡Es genial! Sabía que lo lograrías.' },
          { speaker: 'Camila', line: 'Merci pour tes conseils, ils ont vraiment fait la différence.', translation: 'Gracias por tus consejos, realmente marcaron la diferencia.' },
          { speaker: 'Karim', line: 'De rien ! C’est toi qui as fait tout le travail.', translation: '¡De nada! Fuiste tú quien hizo todo el trabajo.' }
        ],
        phrases: ['J’ai eu... sur vingt !', 'C’est génial !', 'Ça a fait la différence.', 'De rien !'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle note Camila annonce-t-elle à Karim ?', options: ['Douze sur vingt', 'Quinze sur vingt', 'Dix-sept sur vingt', 'Vingt sur vingt'], answer: 2 },
          { type: 'mcq', prompt: 'Comment Karim réagit-il à la nouvelle ?', options: ['Il est indifférent', 'Il est content et pas surpris', 'Il est jaloux', 'Il ne la croit pas'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit Karim sur le mérite du succès de Camila ?', options: ['Que c’est grâce à lui seul', 'Que c’est elle qui a fait tout le travail', 'Que c’était de la chance', 'Qu’elle a triché'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'monde-du-travail',
    title: 'Monde du travail',
    titleEs: 'El mundo laboral',
    description: 'Karim prépare un entretien pour un stage d’été et demande à Camila de l’aider à s’entraîner.',
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
      scenario: 'Karim a un entretien pour un stage d’été dans une bibliothèque et demande à Camila de l’aider à se préparer.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Se préparer à un entretien',
        description: 'Karim se prépare pour son premier entretien d’embauche, avec l’aide de Camila.',
        reading: {
          title: 'Se préparer à un entretien',
          parts: [
            "Karim a postulé pour un stage d'été à la bibliothèque municipale de Tours, et il a été convoqué pour un entretien la semaine prochaine. C'est son premier entretien d'embauche, et il est très nerveux. « Je ne sais pas quoi répondre s'ils me demandent pourquoi je veux ce stage », avoue-t-il à Camila pendant la pause. Camila, qui a déjà préparé un entretien pour un club de bénévolat, décide de l'aider à s'entraîner.",
            "« D'abord, il faut que tu expliques clairement tes motivations », explique Camila. « Par exemple, tu pourrais dire que tu adores lire et que tu voudrais aider les autres à découvrir de bons livres. » Ensemble, ils préparent aussi des réponses aux questions les plus courantes : « Quelles sont vos qualités ? » et « Pourquoi devrions-nous vous choisir vous, plutôt qu'un autre candidat ? » Karim s'entraîne à répondre calmement, en utilisant un langage plus formel que d'habitude.",
            "Camila lui rappelle aussi l'importance de la politesse dans ce contexte : utiliser « vous » plutôt que « tu », dire « je voudrais » plutôt que « je veux », et remercier la personne à la fin de l'entretien. Le jour de l'entretien, Karim se sent bien préparé grâce à cet entraînement. Une semaine plus tard, il reçoit un e-mail : il a obtenu le stage ! Il remercie chaleureusement Camila pour son aide précieuse, sans laquelle, dit-il, il n'aurait probablement pas été aussi confiant devant le recruteur.",
            "Le premier jour de son stage, Karim est encore un peu nerveux, mais il se sent beaucoup plus à l'aise que pendant l'entretien. La responsable de la bibliothèque le félicite pour son sérieux et sa motivation, exactement les qualités qu'il avait mises en avant lors de l'entretien. En rentrant chez lui ce soir-là, il envoie un message à Camila : « Merci encore, sans toi, je n'aurais jamais osé postuler pour quelque chose d'aussi important. »"
          ],
          questions: [
            'Pour quel poste Karim a-t-il postulé ?',
            'Quels conseils Camila lui donne-t-elle sur le langage à utiliser ?',
            'Quel est le résultat final de l’entretien de Karim ?'
          ],
          ordering: {
            prompt: 'Remets les événements dans l’ordre.',
            events: [
              'Karim postule pour un stage à la bibliothèque.',
              'Camila l’aide à préparer ses réponses.',
              'Karim passe l’entretien, bien préparé.',
              'Karim reçoit un e-mail confirmant qu’il a obtenu le stage.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Pour quel poste Karim a-t-il postulé ?', options: ['Un stage dans un restaurant', 'Un stage à la bibliothèque municipale', 'Un emploi dans un magasin', 'Un poste de professeur'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi Karim est-il nerveux ?', options: ['C’est son premier entretien d’embauche', 'Il n’aime pas lire', 'Il n’a pas préparé son CV', 'Il ne veut pas ce stage'], answer: 0 },
          { type: 'mcq', prompt: 'Quel conseil Camila donne-t-elle sur le langage à utiliser ?', options: ['Utiliser « tu » pour être amical', 'Utiliser « vous » et un langage plus formel', 'Parler très vite', 'Ne pas remercier le recruteur'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle question Camila prépare-t-elle avec Karim ?', options: ['Quel est votre plat préféré ?', 'Pourquoi devrions-nous vous choisir ?', 'Où habitez-vous ?', 'Quel âge avez-vous ?'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Karim se sent-il le jour de l’entretien ?', options: ['Complètement paniqué', 'Bien préparé', 'Indifférent', 'En retard'], answer: 1 },
          { type: 'mcq', prompt: 'Quel est le résultat final ?', options: ['Karim n’obtient pas le stage', 'Karim obtient le stage', 'L’entretien est annulé', 'Karim change d’avis'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila avait déjà de l’expérience avec les entretiens.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Dans le texte, « sans laquelle » fait référence à...', options: ['La bibliothèque', 'L’aide de Camila', 'La question du recruteur', 'Sa motivation'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’intention principale du texte ?', options: ['Décrire une bibliothèque', 'Montrer comment bien se préparer à un entretien', 'Se plaindre d’un employeur', 'Expliquer un problème scolaire'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle inférence peut-on faire sur l’amitié entre Karim et Camila ?', options: ['Ils sont rivaux', 'Ils s’entraident dans les moments importants', 'Ils ne se parlent presque jamais', 'Camila est jalouse de Karim'], answer: 1 }
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
        title: 'Karim obtient le stage',
        description: 'Karim reçoit la bonne nouvelle et remercie Camila.',
        intro: 'Une semaine après l’entretien, Karim reçoit une réponse par e-mail.',
        dialogue: [
          { speaker: 'Karim', line: 'Camila ! J’ai obtenu le stage à la bibliothèque !', translation: '¡Camila! ¡Conseguí la pasantía en la biblioteca!' },
          { speaker: 'Camila', line: 'C’est fantastique ! Je savais que tu réussirais.', translation: '¡Es fantástico! Sabía que lo lograrías.' },
          { speaker: 'Karim', line: 'Merci pour ton aide, sans toi, je n’aurais pas été aussi confiant.', translation: 'Gracias por tu ayuda, sin ti no habría estado tan seguro.' },
          { speaker: 'Camila', line: 'De rien ! Tu as travaillé dur pour ça.', translation: '¡De nada! Trabajaste duro para lograrlo.' }
        ],
        phrases: ['J’ai obtenu...', 'Je savais que tu réussirais.', 'Sans toi, je n’aurais pas...', 'Tu as travaillé dur.'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle nouvelle Karim annonce-t-il à Camila ?', options: ['Il n’a pas eu le stage', 'Il a obtenu le stage', 'L’entretien est reporté', 'Il a changé d’avis'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila réagit-elle à la nouvelle ?', options: ['Avec indifférence', 'Avec joie et confiance', 'Avec surprise négative', 'Avec jalousie'], answer: 1 },
          { type: 'mcq', prompt: 'Que reconnaît Karim à propos de l’aide de Camila ?', options: ['Qu’elle n’a pas aidé du tout', 'Qu’elle a été essentielle à sa confiance', 'Qu’elle l’a stressé', 'Qu’il aurait réussi seul de toute façon'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'voyages-et-interculturalite',
    title: 'Voyages et interculturalité',
    titleEs: 'Viajes e interculturalidad',
    description: 'Camila compare les habitudes culturelles françaises et dominicaines lors d’un exposé pour sa classe.',
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
      scenario: 'Camila prépare un exposé pour sa classe sur les différences culturelles entre la France et la République dominicaine.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Deux cultures, un exposé',
        description: 'Camila prépare un exposé de classe sur les différences culturelles entre la France et son pays.',
        reading: {
          title: 'Deux cultures, un exposé',
          parts: [
            "Pour son cours de vie sociale et culturelle, Camila doit préparer un exposé de trois minutes comparant une habitude culturelle française et une habitude dominicaine. Elle choisit de parler des repas, un sujet qu'elle connaît bien depuis son arrivée. « En France, les repas sont souvent des moments assez calmes, avec des horaires fixes : le déjeuner vers midi, le dîner vers dix-neuf ou vingt heures », explique-t-elle à sa classe. « Tandis qu'à Saint-Domingue, les repas sont généralement plus bruyants, avec de la musique en fond, et les horaires sont beaucoup plus flexibles. »",
            "Camila raconte aussi ce qui l'a le plus surprise à son arrivée : « Ce qui m'a le plus étonnée, c'est que les Français passent souvent plus de deux heures à table pendant les grandes occasions, alors que chez moi, les repas sont généralement plus rapides, sauf lors des fêtes. Au début, j'ai trouvé ça un peu long, mais maintenant, j'apprécie vraiment ces longs moments en famille. » Elle explique aussi que, contrairement à ce qu'elle pensait avant son départ, les Français ne sont pas toujours « froids » : une fois qu'on les connaît bien, ils sont très chaleureux.",
            "À la fin de son exposé, un camarade lui demande : « Est-ce que tu préfères la culture française ou dominicaine ? » Camila réfléchit un instant avant de répondre : « Je ne dirais pas que je préfère l'une à l'autre, elles sont juste différentes, et j'ai appris à apprécier les deux. La culture dominicaine me manque parfois, mais je suis reconnaissante d'avoir découvert une nouvelle façon de vivre. » Sa réponse impressionne la classe, et la professeure la félicite pour sa capacité à comparer les deux cultures sans les juger."
          ],
          questions: [
            'Quel sujet Camila choisit-elle pour son exposé ?',
            'Qu’est-ce qui a le plus surpris Camila à son arrivée en France ?',
            'Comment Camila répond-elle à la question sur sa préférence culturelle ?'
          ],
          ordering: {
            prompt: 'Remets les idées de l’exposé de Camila dans l’ordre.',
            events: [
              'Camila compare les horaires de repas français et dominicains.',
              'Elle explique ce qui l’a surprise sur la durée des repas français.',
              'Elle mentionne que les Français ne sont pas toujours « froids ».',
              'Elle répond à la question d’un camarade sur sa préférence culturelle.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Sur quel sujet porte l’exposé de Camila ?', options: ['Les vêtements', 'Les repas', 'Les transports', 'Les fêtes'], answer: 1 },
          { type: 'mcq', prompt: 'Comment sont généralement les repas dominicains, selon Camila ?', options: ['Silencieux et rapides', 'Bruyants, avec de la musique, et flexibles', 'Toujours à heure fixe', 'Sans importance'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’est-ce qui a le plus surpris Camila en France ?', options: ['La nourriture française', 'La durée des repas lors des grandes occasions', 'Le prix des restaurants', 'Le manque de repas en famille'], answer: 1 },
          { type: 'mcq', prompt: 'Que pensait Camila des Français avant son arrivée ?', options: ['Qu’ils étaient très chaleureux', 'Qu’ils étaient froids', 'Qu’ils ne mangeaient jamais ensemble', 'Elle n’avait pas d’opinion'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila répond-elle à la question sur sa préférence ?', options: ['Elle préfère clairement la culture française', 'Elle préfère clairement la culture dominicaine', 'Elle dit apprécier les deux différemment', 'Elle refuse de répondre'], answer: 2 },
          { type: 'mcq', prompt: 'Comment réagit la professeure à la réponse de Camila ?', options: ['Elle la critique', 'Elle la félicite', 'Elle l’ignore', 'Elle change de sujet'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila pense que la culture dominicaine est meilleure que la culture française.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « tandis que » exprime...', options: ['Une cause', 'Une opposition/contraste', 'Une conséquence', 'Un but'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’intention principale de l’exposé de Camila ?', options: ['Critiquer la culture française', 'Comparer deux cultures sans les juger', 'Convaincre la classe de voyager', 'Se plaindre de son pays d’origine'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle inférence peut-on faire sur l’évolution de Camila ?', options: ['Elle a du mal à s’adapter à la France', 'Elle a appris à voir la richesse des deux cultures', 'Elle veut oublier son pays d’origine', 'Elle rejette la culture française'], answer: 1 }
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
        description: 'Léa et Karim félicitent Camila après son exposé sur les différences culturelles.',
        intro: 'Après le cours, Léa et Karim discutent avec Camila de son exposé.',
        dialogue: [
          { speaker: 'Léa', line: 'Ton exposé était vraiment intéressant, Camila !', translation: '¡Tu exposición fue realmente interesante, Camila!' },
          { speaker: 'Karim', line: 'Oui, j’ai appris plein de choses sur ton pays.', translation: 'Sí, aprendí muchas cosas sobre tu país.' },
          { speaker: 'Camila', line: 'Merci ! J’ai adoré comparer nos deux cultures.', translation: '¡Gracias! Me encantó comparar nuestras dos culturas.' },
          { speaker: 'Léa', line: 'On devrait organiser une vraie soirée dominicaine un jour !', translation: '¡Deberíamos organizar una verdadera noche dominicana algún día!' }
        ],
        phrases: ['Ton exposé était...', 'J’ai appris que...', 'J’ai adoré...', 'On devrait organiser...'],
        exercises: [
          { type: 'mcq', prompt: 'Comment Léa trouve-t-elle l’exposé de Camila ?', options: ['Ennuyeux', 'Intéressant', 'Trop long', 'Confus'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’a appris Karim grâce à l’exposé ?', options: ['Rien de nouveau', 'Des choses sur le pays de Camila', 'Des recettes françaises', 'Rien, il n’écoutait pas'], answer: 1 },
          { type: 'mcq', prompt: 'Que propose Léa à la fin ?', options: ['D’oublier le sujet', 'D’organiser une soirée dominicaine', 'De refaire l’exposé', 'De voyager en France'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'technologie-et-societe',
    title: 'Technologie et société',
    titleEs: 'Tecnología y sociedad',
    description: 'La classe de Camila débat des avantages et des risques des réseaux sociaux chez les jeunes.',
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
      scenario: 'En cours d’éducation civique, la classe de Camila débat de l’impact des réseaux sociaux sur les jeunes.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Le débat sur les réseaux sociaux',
        description: 'La classe de Camila débat des avantages et des risques des réseaux sociaux.',
        reading: {
          title: 'Le débat sur les réseaux sociaux',
          parts: [
            "En cours d'éducation civique, la professeure propose un débat sur un sujet d'actualité : l'impact des réseaux sociaux sur les jeunes. « D'une part, les réseaux sociaux permettent de rester en contact avec des amis éloignés et de découvrir de nouvelles idées », commence Karim. « Grâce à eux, je peux parler avec ma cousine qui habite au Maroc presque tous les jours. » Plusieurs élèves acquiescent, d'accord avec cet argument.",
            "Cependant, Léa n'est pas complètement d'accord : « D'autre part, il est important que les jeunes fassent attention à leur vie privée. Beaucoup de personnes partagent trop d'informations personnelles sans réfléchir aux risques. » Camila ajoute un autre point de vue : « Je pense aussi que ça dépend de la façon dont on les utilise. Si on passe trop de temps à comparer sa vie à celle des autres, ça peut créer du stress et de l'anxiété. Mais si on les utilise avec modération, pour s'informer ou garder contact, c'est plutôt positif. »",
            "La professeure résume le débat à la fin du cours : « Vous avez tous raison, d'une certaine façon. Les réseaux sociaux ne sont ni complètement bons ni complètement mauvais ; tout dépend de l'usage qu'on en fait. » Elle propose alors à la classe de réfléchir, pour le prochain cours, à des règles personnelles pour une utilisation plus équilibrée des réseaux sociaux. Camila, en particulier, décide de limiter son temps d'écran le soir, pour mieux profiter de ses moments en famille.",
            "Quelques jours plus tard, la classe se retrouve pour partager les règles personnelles que chacun a choisies. Certains décident de ne plus regarder leur téléphone avant de dormir, d'autres préfèrent limiter le nombre d'applications installées. La professeure est impressionnée par la maturité des réponses et propose d'afficher les meilleures idées dans la salle de classe, pour que d'autres élèves puissent s'en inspirer tout au long de l'année."
          ],
          questions: [
            'Quel argument Karim présente-t-il en faveur des réseaux sociaux ?',
            'Quelle inquiétude Léa exprime-t-elle ?',
            'Quelle conclusion la professeure tire-t-elle du débat ?'
          ],
          ordering: {
            prompt: 'Remets les interventions du débat dans l’ordre.',
            events: [
              'Karim présente l’avantage de rester en contact avec des proches éloignés.',
              'Léa exprime son inquiétude sur la vie privée.',
              'Camila explique que tout dépend de l’usage qu’on en fait.',
              'La professeure résume le débat et propose une réflexion personnelle.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Quel avantage des réseaux sociaux Karim mentionne-t-il ?', options: ['Ils sont gratuits', 'Ils permettent de rester en contact avec des proches éloignés', 'Ils remplacent l’école', 'Ils n’ont aucun avantage'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’inquiétude principale de Léa ?', options: ['Le prix des téléphones', 'La vie privée', 'La vitesse d’internet', 'Le manque de réseaux sociaux'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit Camila sur l’effet des réseaux sociaux ?', options: ['Ils sont toujours mauvais', 'Ils sont toujours excellents', 'Ça dépend de la façon dont on les utilise', 'Elle n’a pas d’opinion'], answer: 2 },
          { type: 'mcq', prompt: 'Quel risque Camila mentionne-t-elle spécifiquement ?', options: ['La perte d’argent', 'Le stress de se comparer aux autres', 'Les virus informatiques', 'La perte de mémoire'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la conclusion de la professeure ?', options: ['Les réseaux sociaux sont interdits', 'Tout dépend de l’usage qu’on en fait', 'Il faut les utiliser tout le temps', 'Ils sont inutiles'], answer: 1 },
          { type: 'mcq', prompt: 'Que décide de faire Camila après ce débat ?', options: ['Supprimer tous ses réseaux sociaux', 'Limiter son temps d’écran le soir', 'Passer plus de temps en ligne', 'Ne rien changer'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : tous les élèves sont d’accord dès le début du débat.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « d’une part... d’autre part... » sert à...', options: ['Donner deux exemples opposés ou complémentaires', 'Exprimer une cause', 'Poser une question', 'Terminer un texte'], answer: 0 },
          { type: 'mcq', prompt: 'Quel est le ton général du débat ?', options: ['Agressif et fermé', 'Ouvert et nuancé', 'Indifférent', 'Moqueur'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle inférence peut-on faire sur l’attitude de la professeure ?', options: ['Elle impose son opinion', 'Elle encourage la réflexion personnelle de ses élèves', 'Elle est contre les réseaux sociaux', 'Elle ignore le débat'], answer: 1 }
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
        description: 'Camila explique à Léa les nouvelles règles qu’elle s’impose pour les réseaux sociaux.',
        intro: 'Après le débat en classe, Camila partage sa décision avec Léa.',
        dialogue: [
          { speaker: 'Camila', line: 'J’ai décidé de limiter mon temps d’écran le soir.', translation: 'Decidí limitar mi tiempo de pantalla por la noche.' },
          { speaker: 'Léa', line: 'Bonne idée ! Et qu’est-ce que tu vas faire à la place ?', translation: '¡Buena idea! ¿Y qué vas a hacer en su lugar?' },
          { speaker: 'Camila', line: 'Je vais lire un peu, ou passer du temps avec ta famille.', translation: 'Voy a leer un poco, o pasar tiempo con tu familia.' },
          { speaker: 'Léa', line: 'J’aime beaucoup cette idée, on pourrait le faire ensemble.', translation: 'Me gusta mucho esa idea, podríamos hacerlo juntas.' }
        ],
        phrases: ['J’ai décidé de...', 'Qu’est-ce que tu vas faire à la place ?', 'Je vais...', 'On pourrait le faire ensemble.'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle décision Camila a-t-elle prise ?', options: ['Supprimer ses réseaux sociaux', 'Limiter son temps d’écran le soir', 'Utiliser plus les réseaux sociaux', 'Acheter un nouveau téléphone'], answer: 1 },
          { type: 'mcq', prompt: 'Que va faire Camila à la place ?', options: ['Rien de spécial', 'Lire ou passer du temps en famille', 'Dormir toute la soirée', 'Regarder la télévision'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Léa réagit-elle à cette décision ?', options: ['Elle la trouve inutile', 'Elle l’approuve et propose de participer', 'Elle s’en moque', 'Elle ne dit rien'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'sante-et-mode-de-vie',
    title: 'Santé et mode de vie',
    titleEs: 'Salud y estilo de vida',
    description: 'Camila remarque qu’elle est souvent stressée avant les examens et cherche des habitudes plus saines avec Madame Lambert.',
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
      scenario: 'À l’approche des examens de fin d’année, Camila se sent de plus en plus stressée et en parle avec Madame Lambert.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Gérer le stress des examens',
        description: 'Camila se sent stressée par les examens de fin d’année et Madame Lambert lui donne des conseils.',
        reading: {
          title: 'Gérer le stress des examens',
          parts: [
            "À l'approche des examens de fin d'année, Camila se sent de plus en plus stressée. Elle dort mal, elle a du mal à se concentrer, et elle se sent tendue en permanence. Un soir, Madame Lambert la trouve en train de réviser tard, l'air fatiguée, et décide de lui parler. « Tu sembles très stressée ces derniers temps, Camila. Il faut que tu prennes soin de toi aussi, pas seulement de tes études. »",
            "Madame Lambert lui propose plusieurs conseils pour mieux gérer son stress. « Il est important que tu fasses des pauses régulières pendant tes révisions, même courtes. Il vaut mieux que tu dormes suffisamment plutôt que de réviser jusqu'à minuit. » Elle lui suggère aussi de reprendre une activité physique régulière : « Ça t'aiderait beaucoup de faire une petite promenade ou du sport, même vingt minutes par jour, ça réduit vraiment le stress. » Camila écoute attentivement, un peu surprise que quelqu'un remarque son état.",
            "Camila décide de suivre ces conseils : elle commence à faire une courte promenade chaque après-midi avec Léa, elle limite ses révisions à vingt et une heures, et elle essaie de dormir au moins sept heures par nuit. Après une semaine, elle se sent déjà plus calme et plus concentrée pendant ses révisions. Elle comprend alors une leçon importante : réussir ses examens ne veut pas dire sacrifier sa santé, mais plutôt trouver un équilibre entre le travail et le repos. Elle remercie Madame Lambert pour son attention et sa bienveillance.",
            "Le jour du premier examen, Camila se sent nerveuse, comme toujours, mais d'une façon différente : plus légère, plus gérable. Pendant la pause avant l'épreuve, elle prend cinq minutes pour respirer calmement, comme Madame Lambert le lui avait suggéré. Cette petite habitude, presque insignifiante en apparence, l'aide à se concentrer pleinement une fois l'examen commencé. Camila se promet de continuer ces nouvelles habitudes bien après la fin des examens de fin d'année."
          ],
          questions: [
            'Quels symptômes de stress Camila ressent-elle ?',
            'Quels conseils Madame Lambert lui donne-t-elle ?',
            'Quelle leçon Camila tire-t-elle de cette expérience ?'
          ],
          ordering: {
            prompt: 'Remets les événements dans l’ordre.',
            events: [
              'Camila se sent de plus en plus stressée avant les examens.',
              'Madame Lambert remarque son état et lui parle.',
              'Elle lui donne des conseils sur les pauses, le sommeil et le sport.',
              'Camila applique ces conseils et se sent plus calme.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Quels symptômes Camila ressent-elle à cause du stress ?', options: ['Elle dort trop', 'Elle dort mal et a du mal à se concentrer', 'Elle n’a aucun symptôme', 'Elle est toujours calme'], answer: 1 },
          { type: 'mcq', prompt: 'Que remarque Madame Lambert un soir ?', options: ['Que Camila est très joyeuse', 'Que Camila révise tard, l’air fatiguée', 'Que Camila ne révise jamais', 'Que Camila veut arrêter l’école'], answer: 1 },
          { type: 'mcq', prompt: 'Quel conseil Madame Lambert donne-t-elle sur le sommeil ?', options: ['Réviser jusqu’à minuit', 'Dormir suffisamment plutôt que réviser tard', 'Ne pas dormir avant les examens', 'Dormir toute la journée'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle activité Madame Lambert recommande-t-elle ?', options: ['Regarder la télévision', 'Une activité physique régulière', 'Manger davantage', 'Étudier plus longtemps'], answer: 1 },
          { type: 'mcq', prompt: 'Que fait Camila avec Léa chaque après-midi ?', options: ['Elle révise', 'Elle fait une courte promenade', 'Elle regarde des films', 'Elle dort'], answer: 1 },
          { type: 'mcq', prompt: 'Jusqu’à quelle heure Camila décide-t-elle de limiter ses révisions ?', options: ['Dix-neuf heures', 'Vingt et une heures', 'Vingt-trois heures', 'Minuit'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : après une semaine, Camila se sent plus stressée qu’avant.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « bienveillance » signifie...', options: ['Indifférence', 'Gentillesse et attention envers les autres', 'Colère', 'Jalousie'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la leçon principale que Camila retient ?', options: ['Il faut sacrifier sa santé pour réussir', 'Il faut trouver un équilibre entre travail et repos', 'Le sport n’aide pas contre le stress', 'Il ne faut jamais réviser'], answer: 1 },
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
        description: 'Une semaine après les conseils de Madame Lambert, Camila se sent beaucoup mieux.',
        intro: 'Une semaine plus tard, Camila raconte à Léa comment elle se sent après avoir changé ses habitudes.',
        dialogue: [
          { speaker: 'Léa', line: 'Tu sembles beaucoup plus détendue cette semaine !', translation: '¡Pareces mucho más relajada esta semana!' },
          { speaker: 'Camila', line: 'Oui, j’ai suivi les conseils de ta mère : plus de pauses, plus de sommeil.', translation: 'Sí, seguí los consejos de tu mamá: más pausas, más sueño.' },
          { speaker: 'Léa', line: 'Et ça marche vraiment ?', translation: '¿Y realmente funciona?' },
          { speaker: 'Camila', line: 'Oui, je me concentre beaucoup mieux pendant mes révisions maintenant.', translation: 'Sí, ahora me concentro mucho mejor durante mis repasos.' }
        ],
        phrases: ['Tu sembles...', 'J’ai suivi les conseils de...', 'Ça marche vraiment ?', 'Je me concentre mieux.'],
        exercises: [
          { type: 'mcq', prompt: 'Comment Camila semble-t-elle cette semaine ?', options: ['Plus stressée', 'Plus détendue', 'Fâchée', 'Fatiguée'], answer: 1 },
          { type: 'mcq', prompt: 'Quels conseils Camila a-t-elle suivis ?', options: ['Réviser plus tard', 'Faire plus de pauses et dormir plus', 'Arrêter d’étudier', 'Ne rien changer'], answer: 1 },
          { type: 'mcq', prompt: 'Quel résultat Camila observe-t-elle ?', options: ['Elle se concentre moins bien', 'Elle se concentre beaucoup mieux', 'Aucun changement', 'Elle est plus fatiguée'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'environnement-et-consommation',
    title: 'Environnement et consommation',
    titleEs: 'Medioambiente y consumo',
    description: 'La classe de Camila organise un projet de réduction des déchets pour protéger l’environnement.',
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
      scenario: 'La classe de Camila organise un projet écologique pour réduire les déchets au lycée.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Un projet pour l’environnement',
        description: 'La classe de Camila lance un projet pour réduire les déchets au lycée.',
        reading: {
          title: 'Un projet pour l’environnement',
          parts: [
            "Ce trimestre, la classe de Camila participe à un projet écologique : réduire la quantité de déchets produits au lycée. « Nous produisons trop de déchets à la cantine, surtout du plastique à usage unique », explique la professeure de sciences. « C'est pourquoi nous devons trouver des solutions ensemble. » La classe se divise en petits groupes pour réfléchir à des idées concrètes.",
            "Le groupe de Camila propose d'installer des poubelles de tri sélectif dans toute l'école, parce que beaucoup d'élèves ne savent pas où jeter le plastique, le verre et le papier séparément. « Si on installe des poubelles claires et bien identifiées, le recyclage sera beaucoup plus simple », explique Camila au reste de la classe. Le groupe de Karim propose une autre idée : remplacer les bouteilles en plastique par des gourdes réutilisables, puisque beaucoup d'élèves achètent une bouteille chaque jour à la cantine.",
            "Après avoir présenté toutes les propositions, la classe vote pour les deux meilleures idées : le tri sélectif et les gourdes réutilisables. Il faut maintenant que les élèves convainquent la direction du lycée d'accepter ces changements. Camila et Karim préparent ensemble une présentation avec des chiffres sur la quantité de déchets économisée. Quelques semaines plus tard, la direction accepte le projet, et de nouvelles poubelles de tri apparaissent dans les couloirs. Camila est fière d'avoir contribué à un changement concret, même petit, pour l'environnement de son lycée.",
            "Quelques mois plus tard, la classe remarque déjà une différence : la quantité de bouteilles en plastique jetées à la cantine a nettement diminué, et de plus en plus d'élèves utilisent leur gourde réutilisable chaque jour. Encouragée par ce succès, la classe décide de proposer un nouveau projet pour l'année suivante : organiser un compost pour les déchets alimentaires de la cantine. Camila comprend que même les petites actions, quand elles sont bien organisées, peuvent avoir un impact réel."
          ],
          questions: [
            'Quel problème la professeure identifie-t-elle à la cantine ?',
            'Quelle solution propose le groupe de Camila ?',
            'Quel résultat obtient la classe à la fin du projet ?'
          ],
          ordering: {
            prompt: 'Remets les événements du projet dans l’ordre.',
            events: [
              'La professeure explique le problème des déchets à la cantine.',
              'Les groupes réfléchissent à des solutions.',
              'La classe vote pour le tri sélectif et les gourdes réutilisables.',
              'La direction accepte le projet et installe de nouvelles poubelles.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Quel problème la professeure identifie-t-elle ?', options: ['Trop de bruit à la cantine', 'Trop de déchets plastiques à la cantine', 'Pas assez de nourriture', 'Trop d’élèves absents'], answer: 1 },
          { type: 'mcq', prompt: 'Que propose le groupe de Camila ?', options: ['Fermer la cantine', 'Installer des poubelles de tri sélectif', 'Interdire le plastique complètement', 'Réduire les heures de cours'], answer: 1 },
          { type: 'mcq', prompt: 'Que propose le groupe de Karim ?', options: ['Des gourdes réutilisables', 'Des assiettes en carton', 'Des sacs en papier', 'Rien de spécial'], answer: 0 },
          { type: 'mcq', prompt: 'Pourquoi Karim propose-t-il cette solution ?', options: ['Parce que les bouteilles sont trop chères', 'Parce que beaucoup d’élèves achètent une bouteille chaque jour', 'Parce que c’est obligatoire', 'Parce que la cantine va fermer'], answer: 1 },
          { type: 'mcq', prompt: 'Que doivent faire les élèves après le vote ?', options: ['Rien de plus', 'Convaincre la direction d’accepter les changements', 'Changer d’école', 'Annuler le projet'], answer: 1 },
          { type: 'mcq', prompt: 'Que préparent Camila et Karim pour convaincre la direction ?', options: ['Une pétition', 'Une présentation avec des chiffres', 'Une manifestation', 'Une lettre anonyme'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : la direction refuse le projet.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « c’est pourquoi » exprime...', options: ['Une cause', 'Une conséquence', 'Une opposition', 'Un but'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila se sent-elle à la fin du texte ?', options: ['Déçue', 'Fière', 'Indifférente', 'Fâchée'], answer: 1 },
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
        intro: 'Quelques semaines après leur présentation, Camila et Karim reçoivent une bonne nouvelle.',
        dialogue: [
          { speaker: 'Le directeur', line: 'J’ai le plaisir de vous annoncer que votre projet est accepté.', translation: 'Tengo el placer de anunciarles que su proyecto es aceptado.' },
          { speaker: 'Camila', line: 'C’est une excellente nouvelle, merci beaucoup !', translation: '¡Es una excelente noticia, muchas gracias!' },
          { speaker: 'Karim', line: 'Toute la classe va être très contente.', translation: 'Toda la clase va a estar muy contenta.' },
          { speaker: 'Le directeur', line: 'Les nouvelles poubelles seront installées la semaine prochaine.', translation: 'Los nuevos contenedores se instalarán la próxima semana.' }
        ],
        phrases: ['J’ai le plaisir de vous annoncer que...', 'C’est une excellente nouvelle.', 'Toute la classe va être...', 'Ce sera installé...'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle nouvelle le directeur annonce-t-il ?', options: ['Le projet est refusé', 'Le projet est accepté', 'Le projet est reporté', 'Le projet est annulé'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila réagit-elle à la nouvelle ?', options: ['Avec déception', 'Avec joie et gratitude', 'Avec indifférence', 'Avec colère'], answer: 1 },
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
    description: 'La classe de Camila apprend à distinguer une information fiable d’une fausse nouvelle sur internet.',
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
      scenario: 'En cours de français, la classe de Camila analyse un article partagé sur les réseaux sociaux pour vérifier s’il est fiable.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Vrai ou faux ?',
        description: 'La classe de Camila apprend à vérifier la fiabilité d’une information trouvée en ligne.',
        reading: {
          title: 'Vrai ou faux ?',
          parts: [
            "En cours de français, la professeure propose un exercice inhabituel : elle montre à la classe un article partagé des centaines de fois sur les réseaux sociaux, qui affirme qu'un nouveau fruit exotique guérit toutes les maladies. « Que pensez-vous de cet article ? » demande-t-elle. Léa répond immédiatement : « Il a l'air très convaincant, avec beaucoup de partages ! » Mais Karim n'est pas si sûr : « Je doute que ce soit vrai, aucune source scientifique n'est citée. »",
            "La professeure explique alors comment vérifier une information : regarder qui a écrit l'article, chercher si d'autres sources fiables confirment l'information, et vérifier la date de publication. Camila remarque que l'article ne mentionne aucun auteur ni aucune étude scientifique précise. « En effet, c'est-à-dire qu'on ne sait même pas qui a écrit ça », observe-t-elle. « C'est exactement le genre de signal qui doit nous alerter », confirme la professeure. Ensemble, ils cherchent l'information sur un site d'actualités reconnu, et ne trouvent rien qui confirme cette affirmation.",
            "La professeure leur explique que ce type de fausse nouvelle est appelé « désinformation », et qu'il devient de plus en plus fréquent en ligne. Elle leur donne un conseil simple : avant de partager une information, il faut toujours se demander si la source est fiable et vérifier auprès d'au moins une autre source. Karim résume la leçon du jour : « On a dit que ce fruit guérissait tout, mais en réalité, personne ne peut le prouver. » La classe termine le cours en comprenant mieux l'importance d'un regard critique sur les informations qu'ils reçoivent chaque jour.",
            "Pour aller plus loin, la professeure demande à chaque élève de trouver, avant le prochain cours, un exemple de désinformation qu'il a vu circuler récemment, et d'expliquer pourquoi il ne fallait pas y faire confiance. Camila choisit un message qu'elle avait reçu affirmant qu'une application populaire allait devenir payante du jour au lendemain. En cherchant sur le site officiel de l'application, elle découvre rapidement que l'information est totalement fausse, une bonne occasion de mettre en pratique ce qu'elle vient d'apprendre."
          ],
          questions: [
            'Quelle affirmation l’article partagé fait-il ?',
            'Comment Camila et la professeure vérifient-elles l’information ?',
            'Comment s’appelle ce type de fausse information, selon la professeure ?'
          ],
          ordering: {
            prompt: 'Remets les étapes de la leçon dans l’ordre.',
            events: [
              'La professeure montre un article sur un fruit miracle.',
              'Karim exprime son doute sur la véracité de l’article.',
              'La classe cherche l’information sur un site fiable.',
              'La professeure explique le concept de désinformation.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Que prétend l’article partagé sur les réseaux sociaux ?', options: ['Qu’un fruit guérit toutes les maladies', 'Qu’il va neiger demain', 'Qu’une nouvelle école ouvre', 'Qu’un examen est annulé'], answer: 0 },
          { type: 'mcq', prompt: 'Qui doute en premier de la véracité de l’article ?', options: ['Léa', 'Karim', 'La professeure', 'Personne'], answer: 1 },
          { type: 'mcq', prompt: 'Que remarque Camila à propos de l’article ?', options: ['Il cite plusieurs études', 'Il ne mentionne aucun auteur ni étude scientifique', 'Il est très récent', 'Il vient d’un site officiel'], answer: 1 },
          { type: 'mcq', prompt: 'Que trouve la classe en cherchant sur un site d’actualités reconnu ?', options: ['Une confirmation de l’article', 'Rien qui confirme l’affirmation', 'Un article encore plus convaincant', 'Une interdiction du fruit'], answer: 1 },
          { type: 'mcq', prompt: 'Comment s’appelle ce type de fausse information ?', options: ['La publicité', 'La désinformation', 'La fiction', 'La biographie'], answer: 1 },
          { type: 'mcq', prompt: 'Quel conseil la professeure donne-t-elle avant de partager une information ?', options: ['Toujours la partager rapidement', 'Vérifier la fiabilité de la source', 'Ne jamais lire les articles', 'Croire tout ce qu’on lit'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : l’article contenait des preuves scientifiques solides.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « c’est-à-dire » sert à...', options: ['Reformuler ou préciser une idée', 'Poser une question', 'Exprimer une opposition', 'Terminer un texte'], answer: 0 },
          { type: 'mcq', prompt: 'Quelle est l’intention principale de ce cours ?', options: ['Se moquer des réseaux sociaux', 'Apprendre à évaluer la fiabilité d’une information', 'Interdire internet', 'Décourager la lecture'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle inférence peut-on faire sur l’attitude de Karim face à l’information en ligne ?', options: ['Il croit tout ce qu’il lit', 'Il a un regard critique et prudent', 'Il n’utilise jamais internet', 'Il partage tout sans vérifier'], answer: 1 }
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
          { type: 'mcq', prompt: 'Karim a dit que l’article ___ pas fiable.', options: ['n’est', 'n’était', 'ne soit', 'ne sera'], answer: 1 },
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
        description: 'Léa demande à Camila et Karim comment reconnaître une source fiable.',
        intro: 'Après le cours, Léa pose des questions à Camila et Karim sur la fiabilité des informations.',
        dialogue: [
          { speaker: 'Léa', line: 'Comment savoir si une source est fiable ?', translation: '¿Cómo saber si una fuente es fiable?' },
          { speaker: 'Camila', line: 'Il faut vérifier qui a écrit l’article et s’il cite des sources.', translation: 'Hay que verificar quién escribió el artículo y si cita fuentes.' },
          { speaker: 'Karim', line: 'Et comparer avec d’autres sites d’actualités reconnus.', translation: 'Y comparar con otros sitios de noticias reconocidos.' },
          { speaker: 'Léa', line: 'D’accord, je vais faire plus attention maintenant !', translation: '¡De acuerdo, voy a prestar más atención ahora!' }
        ],
        phrases: ['Comment savoir si...', 'Il faut vérifier...', 'Comparer avec...', 'Je vais faire attention.'],
        exercises: [
          { type: 'mcq', prompt: 'Que conseille Camila à Léa ?', options: ['De ne jamais lire d’articles', 'De vérifier qui a écrit l’article', 'De partager tout rapidement', 'De ne faire confiance à personne'], answer: 1 },
          { type: 'mcq', prompt: 'Que conseille Karim en plus ?', options: ['De comparer avec d’autres sites reconnus', 'D’arrêter internet', 'D’écrire son propre article', 'De ne rien vérifier'], answer: 0 },
          { type: 'mcq', prompt: 'Comment réagit Léa à la fin du dialogue ?', options: ['Elle ignore les conseils', 'Elle décide de faire plus attention', 'Elle se fâche', 'Elle ne comprend pas'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'relations-et-conflits',
    title: 'Relations et conflits',
    titleEs: 'Relaciones y conflictos',
    description: 'Camila et Léa ont leur premier vrai désaccord depuis l’arrivée de Camila, et apprennent à le résoudre calmement.',
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
      scenario: 'Camila et Léa se disputent pour la première fois à propos d’un projet scolaire commun, et doivent apprendre à résoudre le conflit.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Notre premier désaccord',
        description: 'Camila et Léa se disputent pour la première fois à propos d’un projet scolaire.',
        reading: {
          title: 'Notre premier désaccord',
          parts: [
            "Camila et Léa doivent préparer un exposé ensemble sur la francophonie, mais elles ne sont pas d'accord sur la façon de s'organiser. Léa veut tout préparer à l'avance et suivre un plan très structuré, tandis que Camila préfère improviser et laisser de la place à la créativité. « Ça me dérange que tu changes toujours le plan au dernier moment », dit Léa, un peu frustrée. Camila, surprise par ce ton inhabituel, répond : « Je suis triste que tu penses que je ne prends pas ce projet au sérieux, ce n'est pas vrai du tout ! »",
            "La tension monte pendant quelques minutes, et les deux amies se sentent un peu blessées. Après un moment de silence, Léa prend une grande respiration et dit : « Excuse-moi, je crois que je suis juste stressée par cet exposé, ce n'est pas contre toi. » Camila, soulagée, répond : « Je comprends, moi aussi je suis stressée. Peut-être qu'on pourrait trouver un compromis ? Toi, tu prépares la structure, et moi, j'ajoute des idées créatives dans ce cadre. » Léa sourit : « Ça me semble être une excellente idée, même si ça demande qu'on communique bien tout au long du projet. »",
            "Grâce à cette conversation honnête, Camila et Léa trouvent un équilibre qui respecte leurs deux façons de travailler. Elles terminent leur exposé ensemble, sans autre dispute, et obtiennent même une très bonne note. Cette expérience leur apprend une leçon importante sur l'amitié : même les meilleures amies ne sont pas toujours d'accord, mais parler calmement de ses émotions et chercher un compromis permet souvent de résoudre un conflit sans abîmer la relation.",
            "Quelques semaines plus tard, quand un nouveau projet de groupe est annoncé en classe, Camila et Léa demandent immédiatement à travailler ensemble à nouveau, sans la moindre hésitation. Cette fois, elles décident de discuter de leur méthode de travail dès le début, avant même de commencer, pour éviter que les mêmes tensions ne réapparaissent. Leur professeure remarque avec plaisir à quel point leur collaboration s'est améliorée depuis leur premier projet ensemble."
          ],
          questions: [
            'Pourquoi Léa et Camila se disputent-elles ?',
            'Quel compromis trouvent-elles ?',
            'Quelle leçon tirent-elles de cette expérience ?'
          ],
          ordering: {
            prompt: 'Remets les événements du conflit dans l’ordre.',
            events: [
              'Léa exprime sa frustration sur l’organisation du projet.',
              'Camila se sent blessée par le commentaire de Léa.',
              'Léa s’excuse et explique qu’elle est stressée.',
              'Elles trouvent un compromis pour travailler ensemble.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Pourquoi Léa et Camila ne sont-elles pas d’accord ?', options: ['Sur le sujet de l’exposé', 'Sur la façon de s’organiser', 'Sur la note qu’elles veulent avoir', 'Sur le jour de la présentation'], answer: 1 },
          { type: 'mcq', prompt: 'Que reproche Léa à Camila ?', options: ['De ne jamais travailler', 'De changer toujours le plan au dernier moment', 'D’être en retard', 'De ne pas parler français'], answer: 1 },
          { type: 'mcq', prompt: 'Comment se sent Camila après le commentaire de Léa ?', options: ['Indifférente', 'Blessée et triste', 'Heureuse', 'Fâchée contre elle-même'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi Léa était-elle si frustrée, en réalité ?', options: ['Parce qu’elle n’aime pas Camila', 'Parce qu’elle était stressée par l’exposé', 'Parce qu’elle voulait changer de partenaire', 'Parce qu’elle avait raté un examen'], answer: 1 },
          { type: 'mcq', prompt: 'Quel compromis trouvent-elles ?', options: ['Elles arrêtent le projet', 'Léa prépare la structure, Camila ajoute des idées créatives', 'Elles travaillent séparément', 'Une troisième personne les remplace'], answer: 1 },
          { type: 'mcq', prompt: 'Comment se termine l’histoire ?', options: ['Elles arrêtent d’être amies', 'Elles terminent l’exposé ensemble avec une bonne note', 'Elles échouent à l’exposé', 'Elles changent de sujet'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Léa et Camila ne se réconcilient jamais.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « ça me dérange que » exprime...', options: ['Une joie', 'Un dérangement/une gêne', 'Une certitude', 'Une indifférence'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la leçon principale de ce texte ?', options: ['Il ne faut jamais se disputer', 'Parler calmement de ses émotions aide à résoudre un conflit', 'Les amitiés se terminent toujours mal', 'Il faut toujours avoir raison'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle inférence peut-on faire sur la relation entre Camila et Léa après ce conflit ?', options: ['Elle est plus fragile', 'Elle est renforcée par une communication honnête', 'Elle est terminée', 'Elle est ignorée par les deux'], answer: 1 }
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
          { type: 'mcq', prompt: 'Je suis content(e) que nous ___ un compromis.', options: ['trouvons', 'trouvions', 'trouverons', 'trouvions'], answer: 1 },
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
        description: 'Après avoir résolu leur conflit, Camila et Léa réfléchissent à leur amitié.',
        intro: 'Après avoir terminé leur exposé avec succès, Camila et Léa parlent de ce qu’elles ont appris.',
        dialogue: [
          { speaker: 'Camila', line: 'Je suis contente qu’on ait pu parler calmement de notre désaccord.', translation: 'Estoy contenta de que hayamos podido hablar con calma de nuestro desacuerdo.' },
          { speaker: 'Léa', line: 'Moi aussi. Je pense que notre amitié est encore plus forte maintenant.', translation: 'Yo también. Creo que nuestra amistad es aún más fuerte ahora.' },
          { speaker: 'Camila', line: 'Même si on n’est pas toujours d’accord, on sait qu’on peut se parler honnêtement.', translation: 'Aunque no siempre estemos de acuerdo, sabemos que podemos hablar honestamente.' },
          { speaker: 'Léa', line: 'Exactement, et c’est ça, une vraie amitié.', translation: 'Exactamente, y eso es una verdadera amistad.' }
        ],
        phrases: ['Je suis content(e) que...', 'Notre amitié est plus forte.', 'Même si on n’est pas d’accord...', 'C’est ça, une vraie amitié.'],
        exercises: [
          { type: 'mcq', prompt: 'Comment se sent Camila après avoir résolu le désaccord ?', options: ['Toujours fâchée', 'Contente d’avoir pu en parler calmement', 'Indifférente', 'Triste'], answer: 1 },
          { type: 'mcq', prompt: 'Que pense Léa de leur amitié après ce conflit ?', options: ['Qu’elle est terminée', 'Qu’elle est plus forte', 'Qu’elle est plus fragile', 'Elle n’en parle pas'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la conclusion de Léa sur une vraie amitié ?', options: ['Il ne faut jamais se disputer', 'Pouvoir se parler honnêtement même en désaccord', 'Toujours être d’accord sur tout', 'Éviter les conflits à tout prix'], answer: 1 }
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
