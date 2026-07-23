// scripts/content/french-b2-units.js
// Hand-authored French B2 content, same shape as french-a1/a2/b1-units.js.
// Continues the narrative: Camila is back in Saint-Domingue after her
// exchange year, applying to French universities, staying in touch with
// Léa and Karim, and engaging with more abstract, argumentative B2-level
// topics (society, literature, ethics, science, the arts).
//
// Target: 12 units minimum (per spec), delivered in batches. This file
// currently holds batch 1 (3 units) - more are appended in subsequent
// passes, same growth pattern french-a2-units.js followed (4 -> 10).
//
// Consumed by scripts/build-french-b2-seed.js.

const DEFAULTS = {
  reading: { duration: 18, xp: 35 },
  listening: { duration: 14, xp: 35 },
  speaking: { duration: 14, xp: 30 },
  writing: { duration: 18, xp: 35 },
  grammar: { duration: 14, xp: 30 },
  vocabulary: { duration: 10, xp: 25 },
  dialogue: { duration: 12, xp: 25 }
};

function activity(skill, fields) {
  return { skill, duration: DEFAULTS[skill].duration, xp: DEFAULTS[skill].xp, ...fields };
}

const units = [
  // ---------------------------------------------------------------
  {
    slug: 'retour-a-saint-domingue',
    title: 'Retour à Saint-Domingue',
    titleEs: 'Regreso a Santo Domingo',
    description: 'Camila retrouve sa famille et ses amis d’enfance à Saint-Domingue, avec un regard transformé par son année en France.',
    order: 1,
    accessTier: 'free',
    unitOverview: {
      objective: 'Décrire un retour au pays et exprimer un sentiment ambivalent avec nuance.',
      outcomes: [
        'décrire des retrouvailles avec précision émotionnelle',
        'exprimer une nostalgie tout en valorisant le présent',
        'utiliser le plus-que-parfait pour situer un souvenir dans le passé',
        'nuancer une opinion sur deux lieux de vie différents'
      ],
      grammar: ['plus-que-parfait', 'concordance des temps (passé)', 'nuance et modération de l’opinion'],
      vocabulary: ['les retrouvailles', 'le mal du pays', 'ambivalent(e)', 'avoir le sentiment de'],
      scenario: 'Camila atterrit à Saint-Domingue après un an d’absence et retrouve sa famille et Sofía à l’aéroport.'
    },
    activities: {
      reading: activity('reading', {
        title: 'L’aéroport des retrouvailles',
        description: 'Camila atterrit à Saint-Domingue après un an en France et retrouve sa famille et Sofía.',
        reading: {
          title: 'L’aéroport des retrouvailles',
          parts: [
            "Quand l'avion atterrit à Saint-Domingue, Camila sent son cœur battre plus vite qu'à l'accoutumée. Un an s'était écoulé depuis son départ, et elle avait presque oublié à quel point la chaleur humide des Caraïbes pouvait la saisir dès la sortie de l'appareil. En traversant le hall des arrivées, elle aperçoit une pancarte tenue par sa petite sœur : « Bienvenue chez toi, Camila ! », avec des fautes d'orthographe qui la font sourire aux larmes. Sa mère, son père et Sofía, sa meilleure amie, l'attendent également, tous les quatre agitant les bras avec un enthousiasme qu'elle avait presque oublié.",
            "Les retrouvailles sont un mélange étrange d'émotions. D'un côté, Camila ressent une joie immense de serrer sa famille dans ses bras après tant de mois passés à communiquer uniquement par écran interposé. De l'autre, elle a l'étrange sensation d'être devenue, en quelque sorte, une étrangère dans son propre pays. Sofía le remarque immédiatement : « Tu parles différemment maintenant, tu fais des pauses bizarres, comme si tu traduisais dans ta tête avant de parler espagnol ! » Camila rit, un peu gênée, mais elle sait que son amie a raison : après un an immergée dans une autre langue et une autre culture, quelque chose en elle a changé, sans qu'elle sache exactement quoi.",
            "Dans la voiture qui les ramène à la maison, Camila observe par la fenêtre les rues qu'elle connaissait par cœur avant son départ. Tout lui semble à la fois familier et légèrement différent, comme si elle regardait sa propre vie à travers un objectif légèrement décalé. Elle se surprend à comparer inconsciemment : la façon dont on klaxonne dans la circulation, l'odeur de la cuisine dominicaine qui s'échappe des fenêtres ouvertes, la musique qui joue plus fort que dans les rues tranquilles de Tours. Elle n'avait pas anticipé que revenir chez elle demanderait, lui aussi, un temps d'adaptation, presque comme si elle avait deux maisons désormais, et qu'aucune des deux ne lui appartenait plus complètement.",
            "Ce soir-là, allongée dans son ancienne chambre restée exactement comme elle l'avait laissée, Camila repense à sa dernière conversation avec Léa avant de partir. « Tu vas voir, m'avait-elle dit, revenir chez toi ne sera pas aussi simple que tu le penses. » Sur le moment, Camila n'avait pas vraiment compris ce que son amie voulait dire. Maintenant, allongée dans le noir, elle comprend enfin : elle n'est plus tout à fait la même personne qui était partie un an plus tôt, et il lui faudra du temps pour réapprendre à habiter pleinement cette vie qu'elle avait quittée avec tant d'appréhension, et qu'elle retrouve aujourd'hui avec un mélange de joie sincère et de trouble inattendu."
          ],
          questions: [
            'Comment Camila se sent-elle en sortant de l’avion ?',
            'Que remarque Sofía chez Camila ?',
            'Pourquoi Camila se sent-elle « étrangère dans son propre pays » ?'
          ],
          ordering: {
            prompt: 'Remets les moments du retour de Camila dans l’ordre.',
            events: [
              'L’avion de Camila atterrit à Saint-Domingue.',
              'Sofía remarque que Camila parle différemment.',
              'Camila observe les rues familières depuis la voiture.',
              'Camila repense, le soir, à ce que Léa lui avait dit avant son départ.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce texte ?', options: ['D’un voyage touristique à Saint-Domingue', 'Du retour ambivalent de Camila dans son pays natal', 'D’une dispute familiale à l’aéroport', 'D’un problème de vol retardé'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : qui attend Camila à l’aéroport ?', options: ['Seulement ses parents', 'Sa famille et Sofía', 'Seulement Sofía', 'Léa et Karim'], answer: 1 },
          { type: 'mcq', prompt: 'Que remarque Sofía chez Camila ?', options: ['Qu’elle a beaucoup grossi', 'Qu’elle parle différemment, avec des pauses', 'Qu’elle ne veut plus parler espagnol', 'Qu’elle a changé de nom'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : pourquoi Camila compare-t-elle inconsciemment Saint-Domingue et Tours ?', options: ['Parce qu’elle déteste son pays', 'Parce que son séjour en France a transformé son regard', 'Parce qu’elle veut convaincre sa famille de déménager', 'Parce que c’est un exercice scolaire'], answer: 1 },
          { type: 'mcq', prompt: 'Intention communicative : que voulait dire Léa avec « revenir chez toi ne sera pas aussi simple » ?', options: ['Qu’il y aurait des problèmes d’avion', 'Qu’un retour implique aussi une forme de réadaptation', 'Que la famille de Camila serait fâchée', 'Que Camila devrait rester en France'], answer: 1 },
          { type: 'mcq', prompt: 'Cause et conséquence : pourquoi Camila fait-elle des pauses en parlant espagnol ?', options: ['Elle a oublié sa langue maternelle', 'Elle traduit inconsciemment depuis le français', 'Elle est fatiguée du voyage', 'Elle ne veut pas parler à Sofía'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « à travers un objectif légèrement décalé » ?', options: ['Avec des lunettes cassées', 'Avec un regard légèrement différent d’avant', 'En prenant des photos', 'En conduisant une voiture'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime un sentiment, pas un fait ?', options: ['L’avion de Camila atterrit à Saint-Domingue.', 'Elle a l’étrange sensation d’être devenue une étrangère dans son propre pays.', 'Sofía est la meilleure amie de Camila.', 'Camila était partie un an plus tôt.'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : quelle est la conclusion implicite du texte ?', options: ['Camila regrette complètement son voyage en France', 'Le retour chez soi peut être aussi complexe qu’un départ', 'Il ne faut jamais voyager à l’étranger', 'Sofía et Camila ne sont plus amies'], answer: 1 },
          { type: 'mcq', prompt: 'Comparaison d’informations : qu’est-ce qui a changé chez Camila, selon le texte, depuis son départ ?', options: ['Rien du tout', 'Sa façon de percevoir son pays et elle-même', 'Son apparence physique uniquement', 'Sa relation avec ses parents seulement'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Une conversation à l’aéroport',
        description: 'Écoute Camila et Sofía se retrouver à l’aéroport de Saint-Domingue.',
        intro: 'Écoute les premiers échanges entre Camila et Sofía après un an de séparation.',
        dialogue: [
          { speaker: 'Sofía', line: 'Camila ! Tu m’as tellement manqué, je n’arrive pas à y croire !', translation: '¡Camila! Te extrañé tanto, ¡no puedo creerlo!' },
          { speaker: 'Camila', line: 'Toi aussi, Sofía. C’est tellement étrange d’être enfin de retour.', translation: 'Tú también, Sofía. Es tan extraño estar por fin de vuelta.' },
          { speaker: 'Sofía', line: 'Tu parles bizarrement, on dirait que tu réfléchis avant chaque mot !', translation: '¡Hablas raro, parece que piensas antes de cada palabra!' },
          { speaker: 'Camila', line: 'Ha ha, c’est vrai, j’ai dû traduire dans ma tête pendant si longtemps.', translation: 'Ja ja, es verdad, tuve que traducir en mi cabeza durante tanto tiempo.' }
        ],
        phrases: ['Tu m’as manqué.', 'C’est étrange de...', 'On dirait que...', 'J’ai dû...'],
        exercises: [
          { type: 'mcq', prompt: 'Comment Sofía réagit-elle en voyant Camila ?', options: ['Avec indifférence', 'Avec une grande joie', 'Avec de la colère', 'Avec de la tristesse'], answer: 1 },
          { type: 'mcq', prompt: 'Que remarque Sofía dans la façon de parler de Camila ?', options: ['Elle parle trop vite', 'Elle fait des pauses avant de parler', 'Elle ne parle plus espagnol', 'Elle chuchote'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila explique-t-elle ce changement ?', options: ['Elle ne l’explique pas', 'Elle a dû traduire dans sa tête pendant longtemps', 'Elle est fatiguée du voyage', 'Elle ne veut plus parler'], answer: 1 },
          { type: 'mcq', prompt: 'Quel est le ton général de cette conversation ?', options: ['Tendu et froid', 'Chaleureux et joyeux', 'Fâché', 'Indifférent'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Décrire un retour ambivalent',
        description: 'Décris un sentiment ambivalent à propos d’un retour ou d’un changement de vie.',
        mission: 'Décris une situation (réelle ou imaginaire) où tu es retourné(e) quelque part après une longue absence, en exprimant des sentiments contradictoires avec nuance.',
        phrases: ['D’un côté... de l’autre côté...', 'J’ai le sentiment de...', 'Ambivalent(e)...', 'Ce qui m’a surpris, c’est...'],
        dialogue: [
          { speaker: 'Toi', line: 'D’un côté, j’étais heureux/heureuse de retrouver ma famille. De l’autre, j’avais le sentiment étrange d’avoir changé plus que prévu.', translation: 'Por un lado, estaba feliz de reencontrarme con mi familia. Por otro, tenía la extraña sensación de haber cambiado más de lo esperado.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente un sentiment ambivalent sur un retour ou un changement, avec au moins deux nuances opposées.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, discutez d’une expérience où vous vous êtes senti(e) « entre deux mondes ».', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Un journal de retour',
        description: 'Écris une entrée de journal sur un retour chargé d’émotions contradictoires.',
        mission: 'Écris 180 à 220 mots sous forme d’entrée de journal intime décrivant un retour (réel ou imaginaire) après une longue absence, avec des émotions nuancées.',
        phrases: ['J’ai le sentiment de...', 'D’un côté... de l’autre côté...', 'Je ne m’attendais pas à...', 'Il me faudra du temps pour...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Aujourd’hui, je suis enfin rentré(e) chez moi après un an d’absence. J’ai le sentiment d’être à la fois exactement à ma place et complètement étranger/étrangère. Il me faudra du temps pour réapprendre à habiter cette vie que j’avais quittée.', translation: 'Hoy por fin volví a casa después de un año de ausencia. Tengo la sensación de estar exactamente en mi lugar y a la vez completamente extraño/a. Necesitaré tiempo para volver a habitar esta vida que había dejado.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris une entrée de journal de 180 à 220 mots sur un retour ambivalent, avec au moins une phrase au plus-que-parfait.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le plus-que-parfait',
        description: 'Situer un événement antérieur à un autre moment du passé.',
        grammarNote: 'Le plus-que-parfait se forme avec avoir/être à l’imparfait + participe passé : « J’avais oublié à quel point il faisait chaud. Elle était partie un an plus tôt. » Il exprime une action antérieure à une autre action passée, souvent racontée au passé composé ou à l’imparfait : « Elle comprit ce que Léa avait voulu dire. »',
        phrases: ['J’avais oublié que...', 'Elle était partie...', 'Nous avions déjà...', 'Il n’avait pas anticipé que...'],
        exercises: [
          { type: 'mcq', prompt: 'Camila ___ presque oublié la chaleur de Saint-Domingue.', options: ['a', 'avait', 'ait', 'aura'], answer: 1 },
          { type: 'mcq', prompt: 'Elle ___ un an plus tôt, pleine d’appréhension.', options: ['était partie', 'est partie', 'partait', 'sera partie'], answer: 0 },
          { type: 'mcq', prompt: 'Camila n’___ pas anticipé que le retour serait difficile.', options: ['a', 'avait', 'ait', 'aurait'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle structure forme le plus-que-parfait ?', options: ['Avoir/être au présent + participe passé', 'Avoir/être à l’imparfait + participe passé', 'Avoir au futur + infinitif', 'Être au conditionnel + gérondif'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire du retour et des retrouvailles',
        description: 'Le vocabulaire essentiel pour décrire un retour et des émotions nuancées.',
        vocabulary: [
          { word: 'les retrouvailles', translation: 'el reencuentro', example: 'Les retrouvailles à l’aéroport étaient très émouvantes.' },
          { word: 'le mal du pays', translation: 'la nostalgia del país', example: 'Elle a ressenti le mal du pays pendant son séjour en France.' },
          { word: 'ambivalent(e)', translation: 'ambivalente', example: 'Ses sentiments à propos du retour étaient ambivalents.' },
          { word: 'avoir le sentiment de', translation: 'tener la sensación de', example: 'J’ai le sentiment d’avoir changé.' },
          { word: 's’adapter', translation: 'adaptarse', example: 'Il faut du temps pour s’adapter à nouveau.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « les retrouvailles » ?', options: ['El reencuentro', 'La despedida', 'El viaje', 'La mudanza'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « ambivalent(e) » ?', options: ['Muy feliz', 'Con sentimientos contradictorios', 'Indiferente', 'Furioso'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « le mal du pays » ?', options: ['Una enfermedad', 'La nostalgia del país natal', 'Un problema político', 'Un dolor físico'], answer: 1 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Une soirée en famille',
        description: 'Le premier soir, la famille de Camila l’interroge sur son année en France.',
        intro: 'Autour de la table, la famille de Camila veut tout savoir sur son année à Tours.',
        dialogue: [
          { speaker: 'La mère', line: 'Raconte-nous tout ! Comment c’était, vraiment, cette année ?', translation: '¡Cuéntanos todo! ¿Cómo fue realmente ese año?' },
          { speaker: 'Camila', line: 'C’était incroyable, mais aussi plus difficile que je ne l’avais imaginé au début.', translation: 'Fue increíble, pero también más difícil de lo que había imaginado al principio.' },
          { speaker: 'Le père', line: 'Et tu comptes vraiment y retourner pour tes études ?', translation: '¿Y realmente piensas volver allá para tus estudios?' },
          { speaker: 'Camila', line: 'Oui, je crois que oui, même si ça me fait un peu peur de repartir si loin.', translation: 'Sí, creo que sí, aunque me da un poco de miedo irme tan lejos de nuevo.' }
        ],
        phrases: ['Raconte-nous tout !', 'C’était plus... que je ne l’avais imaginé.', 'Tu comptes... ?', 'Ça me fait un peu peur de...'],
        exercises: [
          { type: 'mcq', prompt: 'Comment Camila décrit-elle son année en France ?', options: ['Ennuyeuse et facile', 'Incroyable, mais plus difficile que prévu', 'Un échec complet', 'Sans intérêt'], answer: 1 },
          { type: 'mcq', prompt: 'Que demande le père de Camila ?', options: ['Si elle a bien mangé', 'Si elle compte retourner en France pour ses études', 'Si elle a rencontré quelqu’un', 'Si elle veut rester définitivement'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila se sent-elle à l’idée de repartir ?', options: ['Complètement confiante', 'Un peu effrayée, mais déterminée', 'Totalement contre l’idée', 'Indifférente'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'candidature-universitaire',
    title: 'Candidature universitaire',
    titleEs: 'Solicitud universitaria',
    description: 'Camila prépare sa candidature pour étudier à l’université en France, avec l’aide à distance de Léa et Karim.',
    order: 2,
    accessTier: 'free',
    unitOverview: {
      objective: 'Rédiger une lettre de motivation et argumenter un projet académique de façon structurée.',
      outcomes: [
        'structurer une lettre de motivation formelle',
        'argumenter un choix académique avec des exemples concrets',
        'utiliser le subjonctif passé pour évoquer une expérience accomplie',
        'nuancer une auto-présentation sans excès de modestie ni d’arrogance'
      ],
      grammar: ['subjonctif passé', 'connecteurs d’argumentation avancés (par ailleurs, en outre)', 'structure d’une lettre de motivation'],
      vocabulary: ['une lettre de motivation', 'un dossier de candidature', 'convaincant(e)', 'se démarquer'],
      scenario: 'Camila rédige sa lettre de motivation pour candidater à une licence de langues à l’université de Tours.'
    },
    activities: {
      reading: activity('reading', {
        title: 'La lettre de motivation de Camila',
        description: 'Camila rédige sa candidature pour étudier à l’université de Tours, avec l’aide de Karim par appel vidéo.',
        reading: {
          title: 'La lettre de motivation de Camila',
          parts: [
            "Assise devant son ordinateur, Camila fixe la page blanche depuis presque une heure. Elle doit rédiger sa lettre de motivation pour candidater à une licence de langues étrangères appliquées à l'université de Tours, la même ville où elle a passé son année d'échange. « C'est plus difficile que je ne le pensais », avoue-t-elle à Karim, qu'elle a appelé en visioconférence pour obtenir de l'aide. « Je ne sais pas comment expliquer pourquoi je veux étudier là-bas sans avoir l'air prétentieuse ou, au contraire, trop timide. »",
            "Karim, qui a lui-même rédigé plusieurs lettres de motivation pour des stages, lui propose une structure simple : commencer par expliquer concrètement ce qui a déclenché son intérêt, puis développer des exemples précis de son expérience, et terminer en expliquant ce qu'elle compte apporter à l'université, et non seulement ce qu'elle espère en recevoir. « Il ne suffit pas que tu dises que tu as aimé la France », précise-t-il. « Il faut que tu montres, avec des exemples concrets, pourquoi cette expérience t'a changée. »",
            "Suivant ces conseils, Camila commence à écrire différemment. Elle raconte comment, après avoir vécu un an immergée dans la langue française, elle a découvert une véritable passion pour la traduction et la médiation interculturelle. Elle mentionne des moments précis : le jour où elle a aidé une touriste perdue à Tours en traduisant entre le français et l'espagnol, ou celui où elle a présenté un exposé comparant les cultures dominicaine et française devant toute sa classe. Par ailleurs, elle explique qu'elle souhaite, à terme, devenir traductrice ou interprète, pour aider d'autres personnes à franchir les barrières linguistiques qu'elle a elle-même dû surmonter.",
            "Après plusieurs relectures et un dernier appel avec Léa pour corriger quelques fautes de français, Camila envoie enfin sa candidature, le cœur battant. Elle sait que le résultat n'est pas garanti, mais pour la première fois depuis qu'elle a commencé à écrire cette lettre, elle a le sentiment d'avoir exprimé honnêtement qui elle est devenue et ce qu'elle souhaite construire pour son avenir. Quelle que soit la réponse de l'université, elle est fière du chemin parcouru depuis cette première journée nerveuse à l'école de Tours, un an plus tôt."
          ],
          questions: [
            'Pourquoi Camila trouve-t-elle cet exercice difficile au début ?',
            'Quelle structure Karim lui propose-t-il pour sa lettre ?',
            'Que souhaite faire Camila professionnellement à l’avenir ?'
          ],
          ordering: {
            prompt: 'Remets les étapes de la rédaction de la lettre dans l’ordre.',
            events: [
              'Camila fixe une page blanche, sans savoir comment commencer.',
              'Karim lui propose une structure en trois parties.',
              'Camila écrit des exemples concrets de son expérience en France.',
              'Elle envoie sa candidature après relecture avec Léa.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce texte ?', options: ['D’un examen final de français', 'De la rédaction d’une lettre de motivation universitaire', 'D’un voyage touristique à Tours', 'D’un problème administratif'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : pour quelle formation Camila candidate-t-elle ?', options: ['Une licence de médecine', 'Une licence de langues étrangères appliquées', 'Un master de commerce', 'Un diplôme d’ingénieur'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle structure Karim propose-t-il pour la lettre ?', options: ['Une seule longue phrase', 'Déclencheur, exemples concrets, ce qu’elle apportera', 'Uniquement des compliments sur la France', 'Une liste de ses notes scolaires'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : pourquoi Karim insiste-t-il sur les exemples concrets ?', options: ['Parce que c’est obligatoire administrativement', 'Parce que des exemples précis rendent l’argumentation plus convaincante', 'Parce qu’il veut que la lettre soit plus longue', 'Parce que Camila écrit trop vite'], answer: 1 },
          { type: 'mcq', prompt: 'Quel exemple concret Camila mentionne-t-elle dans sa lettre ?', options: ['Un voyage à Paris', 'Avoir aidé une touriste perdue à traduire', 'Un problème de logement', 'Une compétition sportive'], answer: 1 },
          { type: 'mcq', prompt: 'Cause et conséquence : pourquoi Camila veut-elle devenir traductrice ?', options: ['Parce que c’est bien payé', 'Pour aider d’autres personnes à franchir des barrières linguistiques', 'Parce que ses parents l’exigent', 'Par hasard, sans raison précise'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « par ailleurs » dans le troisième paragraphe ?', options: ['Malgré tout', 'De plus, en complément', 'Cependant', 'Enfin'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime une opinion de Camila ?', options: ['Elle candidate à l’université de Tours.', 'Elle a le sentiment d’avoir exprimé honnêtement qui elle est devenue.', 'Karim a rédigé plusieurs lettres de motivation.', 'Léa relit sa lettre par appel vidéo.'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : comment se sent Camila après avoir envoyé sa candidature ?', options: ['Complètement indifférente', 'Fière du chemin parcouru, quel que soit le résultat', 'Certaine d’être refusée', 'En colère contre l’université'], answer: 1 },
          { type: 'mcq', prompt: 'Intention communicative : pourquoi Camila mentionne-t-elle son exposé sur les cultures dominicaine et française ?', options: ['Pour se plaindre de l’école', 'Pour illustrer concrètement son intérêt pour l’interculturalité', 'Parce que c’est obligatoire dans toute lettre', 'Pour critiquer ses camarades de classe'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Un conseil de rédaction',
        description: 'Écoute Karim expliquer à Camila comment structurer sa lettre de motivation.',
        intro: 'Écoute la conversation en visioconférence entre Camila et Karim.',
        dialogue: [
          { speaker: 'Camila', line: 'Je ne sais pas comment commencer cette lettre sans avoir l’air prétentieuse.', translation: 'No sé cómo empezar esta carta sin parecer pretenciosa.' },
          { speaker: 'Karim', line: 'Commence par expliquer ce qui a vraiment déclenché ton intérêt.', translation: 'Empieza explicando qué fue lo que realmente despertó tu interés.' },
          { speaker: 'Camila', line: 'D’accord, et ensuite ?', translation: 'De acuerdo, ¿y después?' },
          { speaker: 'Karim', line: 'Donne des exemples concrets, puis explique ce que tu apporteras à l’université.', translation: 'Da ejemplos concretos, luego explica lo que aportarás a la universidad.' }
        ],
        phrases: ['Je ne sais pas comment...', 'Commence par...', 'Donne des exemples concrets.', 'Ce que tu apporteras...'],
        exercises: [
          { type: 'mcq', prompt: 'Quel est le problème de Camila au début ?', options: ['Elle n’a pas d’ordinateur', 'Elle ne sait pas comment commencer sa lettre', 'Elle a raté la date limite', 'Elle ne veut plus étudier en France'], answer: 1 },
          { type: 'mcq', prompt: 'Que conseille Karim en premier ?', options: ['De copier une lettre modèle', 'D’expliquer ce qui a déclenché son intérêt', 'De ne rien écrire de personnel', 'D’écrire en anglais'], answer: 1 },
          { type: 'mcq', prompt: 'Que doit expliquer Camila à la fin de la lettre, selon Karim ?', options: ['Ses notes scolaires uniquement', 'Ce qu’elle apportera à l’université', 'Ses problèmes personnels', 'Le prix des études'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Présenter sa motivation',
        description: 'Présente oralement ta motivation pour un projet académique ou professionnel.',
        mission: 'Prépare une présentation de deux à trois minutes expliquant pourquoi tu voudrais suivre une formation ou un projet précis, avec au moins un exemple concret.',
        phrases: ['Ce qui a déclenché mon intérêt pour...', 'Par exemple, j’ai...', 'Par ailleurs, je...', 'Ce que je souhaite apporter, c’est...'],
        dialogue: [
          { speaker: 'Toi', line: 'Ce qui a déclenché mon intérêt pour ce domaine, c’est une expérience précise. Par exemple, j’ai... Par ailleurs, je pense pouvoir apporter...', translation: 'Lo que despertó mi interés en este campo fue una experiencia concreta. Por ejemplo, yo... Además, creo que puedo aportar...' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente ta motivation pour un projet académique ou professionnel, avec un exemple concret et une conclusion.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, échangez des retours sur vos présentations de motivation respectives.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Une lettre de motivation',
        description: 'Rédige une lettre de motivation formelle pour un projet académique.',
        mission: 'Écris 200 à 250 mots sous forme de lettre de motivation pour une formation ou un projet de ton choix, avec une structure claire (déclencheur, exemples, apport).',
        phrases: ['Madame, Monsieur,', 'Ce qui a déclenché mon intérêt pour...', 'Par ailleurs...', 'Je vous prie d’agréer...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Madame, Monsieur, ce qui a déclenché mon intérêt pour cette formation remonte à une expérience précise durant laquelle j’ai découvert ma passion pour ce domaine. Par ailleurs, je suis convaincu(e) que mon parcours m’a préparé(e) à contribuer activement à votre programme.', translation: 'Señora, señor, lo que despertó mi interés por esta formación se remonta a una experiencia concreta durante la cual descubrí mi pasión por este campo. Además, estoy convencido/a de que mi trayectoria me ha preparado para contribuir activamente a su programa.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris une lettre de motivation de 200 à 250 mots, avec au moins un exemple concret et une phrase au subjonctif passé.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le subjonctif passé',
        description: 'Exprimer une expérience accomplie après une expression subjective ou émotionnelle.',
        grammarNote: 'Le subjonctif passé se forme avec avoir/être au subjonctif présent + participe passé : « Je suis content(e) que tu aies réussi. Il est important que nous ayons vécu cette expérience. » Il s’utilise après les mêmes expressions que le subjonctif présent, mais pour une action déjà accomplie au moment où l’on parle.',
        phrases: ['Je suis content(e) que tu aies...', 'Il est important que nous ayons...', 'Bien que j’aie déjà...', 'Il se peut qu’elle soit...'],
        exercises: [
          { type: 'mcq', prompt: 'Je suis fière que tu ___ cette candidature.', options: ['envoies', 'aies envoyé', 'enverrais', 'envoyais'], answer: 1 },
          { type: 'mcq', prompt: 'Il est important que nous ___ cette expérience ensemble.', options: ['vivons', 'ayons vécu', 'vivrons', 'vivions'], answer: 1 },
          { type: 'mcq', prompt: 'Bien qu’elle ___ nerveuse, elle a envoyé sa lettre.', options: ['soit', 'ait été', 'était', 'sera'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle structure forme le subjonctif passé ?', options: ['Avoir/être au subjonctif présent + participe passé', 'Avoir au futur + infinitif', 'Être à l’imparfait + gérondif', 'Avoir au conditionnel + infinitif'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de la candidature universitaire',
        description: 'Le vocabulaire essentiel pour rédiger une candidature académique.',
        vocabulary: [
          { word: 'une lettre de motivation', translation: 'una carta de motivación', example: 'J’ai rédigé ma lettre de motivation avec soin.' },
          { word: 'un dossier de candidature', translation: 'un expediente de solicitud', example: 'Mon dossier de candidature est complet.' },
          { word: 'convaincant(e)', translation: 'convincente', example: 'Ton argument est très convaincant.' },
          { word: 'se démarquer', translation: 'destacarse', example: 'Il faut se démarquer des autres candidats.' },
          { word: 'un déclencheur', translation: 'un detonante', example: 'Quel a été le déclencheur de ta passion pour les langues ?' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « se démarquer » ?', options: ['Destacarse', 'Rendirse', 'Copiar', 'Esconderse'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « convaincant(e) » ?', options: ['Aburrido', 'Convincente', 'Confuso', 'Falso'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « un dossier de candidature » ?', options: ['Un expediente de solicitud', 'Una carta personal', 'Un examen final', 'Un certificado médico'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'La relecture avec Léa',
        description: 'Léa aide Camila à relire et corriger sa lettre de motivation.',
        intro: 'Avant d’envoyer sa candidature, Camila demande à Léa de relire son texte en français.',
        dialogue: [
          { speaker: 'Camila', line: 'Tu peux relire ma lettre ? J’ai peur qu’il y ait des fautes.', translation: '¿Puedes releer mi carta? Temo que haya errores.' },
          { speaker: 'Léa', line: 'Bien sûr ! C’est très bien écrit, juste une petite erreur ici.', translation: '¡Claro! Está muy bien escrita, solo un pequeño error aquí.' },
          { speaker: 'Camila', line: 'Merci, je suis tellement stressée à l’idée de l’envoyer.', translation: 'Gracias, estoy tan estresada con la idea de enviarla.' },
          { speaker: 'Léa', line: 'Tu as raison d’être fière de ce que tu as écrit, c’est sincère et convaincant.', translation: 'Tienes razón en estar orgullosa de lo que escribiste, es sincero y convincente.' }
        ],
        phrases: ['Tu peux relire... ?', 'J’ai peur qu’il y ait...', 'Je suis stressé(e) à l’idée de...', 'Tu as raison d’être fière de...'],
        exercises: [
          { type: 'mcq', prompt: 'Pourquoi Camila demande-t-elle à Léa de relire sa lettre ?', options: ['Pour la traduire en anglais', 'Elle a peur qu’il y ait des fautes', 'Léa doit la réécrire entièrement', 'C’est une obligation administrative'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Léa trouve-t-elle la lettre de Camila ?', options: ['Mauvaise et à refaire', 'Bien écrite, avec une petite erreur', 'Trop courte', 'Incompréhensible'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Léa qualifie-t-elle la lettre de Camila à la fin ?', options: ['Ennuyeuse', 'Sincère et convaincante', 'Trop longue', 'Impersonnelle'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'debats-de-societe',
    title: 'Débats de société',
    titleEs: 'Debates de sociedad',
    description: 'Dans un club de discussion en ligne avec Karim, Camila débat de sujets de société complexes en français.',
    order: 3,
    accessTier: 'free',
    unitOverview: {
      objective: 'Participer à un débat structuré sur un sujet de société et défendre une position nuancée.',
      outcomes: [
        'structurer un argument avec des connecteurs logiques avancés',
        'anticiper et réfuter un contre-argument',
        'utiliser la voix passive dans un contexte argumentatif',
        'nuancer une position sans paraître catégorique'
      ],
      grammar: ['la voix passive', 'connecteurs d’argumentation avancés (néanmoins, or, par conséquent)', 'nuance argumentative (il me semble que, dans une certaine mesure)'],
      vocabulary: ['un point de vue', 'réfuter', 'dans une certaine mesure', 'un contre-argument'],
      scenario: 'Camila rejoint un club de discussion en ligne où des étudiants francophones débattent de sujets de société, dont l’usage des écrans chez les jeunes.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Le club de discussion',
        description: 'Camila participe pour la première fois à un débat en ligne sur l’usage des écrans chez les jeunes.',
        reading: {
          title: 'Le club de discussion',
          parts: [
            "Pour continuer à pratiquer son français après son retour à Saint-Domingue, Camila rejoint un club de discussion en ligne organisé par d'anciens élèves d'échange scolaire, où l'on débat chaque semaine d'un sujet de société différent. Ce soir, le thème est : « Faut-il limiter l'usage des écrans chez les adolescents ? » Camila, un peu nerveuse à l'idée de débattre devant des inconnus, écoute d'abord attentivement les arguments des autres participants avant de prendre la parole.",
            "Un étudiant belge ouvre le débat : « Il me semble que les écrans, utilisés avec modération, peuvent être un formidable outil éducatif. Néanmoins, il ne faut pas ignorer les risques d'addiction, particulièrement documentés chez les plus jeunes. » Une autre participante, française, nuance : « Dans une certaine mesure, je suis d'accord, mais je pense que le vrai problème n'est pas l'écran en lui-même, mais le contenu qui y est consommé. Or, ce contenu est rarement contrôlé par les parents. »",
            "Camila, encouragée par ce ton respectueux et nuancé, décide finalement de partager son propre point de vue. « D'après mon expérience personnelle, les réseaux sociaux m'ont aidée à garder le contact avec mes amis pendant mon année à l'étranger. Ils ne peuvent donc pas être considérés uniquement comme négatifs. Cependant, je reconnais qu'ils peuvent aussi devenir une source de stress, notamment quand on compare sa vie à celle des autres. » Son intervention est bien accueillie, et plusieurs participants la remercient d'avoir apporté une perspective différente, fondée sur une expérience vécue plutôt que sur des généralités.",
            "À la fin de la session, l'animateur du club résume les positions exprimées : selon lui, aucun argument n'a été complètement réfuté, mais chacun a permis d'affiner la réflexion collective. Camila raccroche son ordinateur avec un sentiment de satisfaction inédit : pour la première fois, elle a réussi à argumenter en français sur un sujet complexe, devant des inconnus, sans se sentir dépassée par la difficulté de la tâche. Elle comprend que ce type d'exercice, bien plus que la simple mémorisation de vocabulaire, est ce qui lui permettra réellement de progresser vers la maîtrise complète de cette langue qu'elle a apprise à aimer."
          ],
          questions: [
            'Quel est le sujet du débat de ce soir-là ?',
            'Quel argument la participante française apporte-t-elle ?',
            'Quelle expérience personnelle Camila partage-t-elle ?'
          ],
          ordering: {
            prompt: 'Remets les interventions du débat dans l’ordre.',
            events: [
              'L’étudiant belge présente l’écran comme un outil éducatif avec des risques.',
              'La participante française nuance en parlant du contenu consommé.',
              'Camila partage son expérience personnelle des réseaux sociaux.',
              'L’animateur résume les positions à la fin de la session.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : sur quoi porte ce débat en ligne ?', options: ['Sur les vacances scolaires', 'Sur l’usage des écrans chez les adolescents', 'Sur le système éducatif dominicain', 'Sur les réseaux de transport'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : que dit l’étudiant belge sur les écrans ?', options: ['Qu’il faut les interdire totalement', 'Qu’ils peuvent être un outil éducatif malgré des risques', 'Qu’ils n’ont aucun avantage', 'Qu’il ne les utilise jamais'], answer: 1 },
          { type: 'mcq', prompt: 'Quel argument central apporte la participante française ?', options: ['Les écrans sont toujours mauvais', 'Le vrai problème est le contenu, pas l’écran lui-même', 'Il faut plus d’écrans à l’école', 'Les parents contrôlent toujours le contenu'], answer: 1 },
          { type: 'mcq', prompt: 'Quel argument personnel Camila apporte-t-elle ?', options: ['Les réseaux sociaux ne servent à rien', 'Ils l’ont aidée à garder contact, mais peuvent créer du stress', 'Elle n’a jamais utilisé de réseaux sociaux', 'Elle est complètement contre les écrans'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : pourquoi l’intervention de Camila est-elle bien accueillie ?', options: ['Parce qu’elle a parlé le plus fort', 'Parce qu’elle apporte une perspective fondée sur une expérience vécue', 'Parce qu’elle a flatté les autres participants', 'Parce qu’elle a terminé le débat rapidement'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « néanmoins » dans le deuxième paragraphe ?', options: ['Donc', 'Cependant/pourtant', 'Parce que', 'De plus'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « dans une certaine mesure » ?', options: ['Complètement', 'Jamais', 'Partiellement, avec des nuances', 'Rapidement'], answer: 2 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime un fait, et non une opinion ?', options: ['Il me semble que les écrans peuvent être un outil éducatif.', 'Camila rejoint un club de discussion en ligne chaque semaine.', 'Je pense que le vrai problème est le contenu.', 'Ils ne peuvent donc pas être considérés uniquement comme négatifs.'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : comment se sent Camila à la fin du débat ?', options: ['Déçue de sa performance', 'Satisfaite d’avoir argumenté en français sur un sujet complexe', 'Fâchée contre les autres participants', 'Indifférente'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la conclusion de l’animateur sur le débat ?', options: ['Un argument a complètement gagné', 'Aucun argument n’a été réfuté, mais la réflexion s’est affinée', 'Le débat n’a rien apporté', 'Tout le monde était d’accord dès le début'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Un échange d’arguments',
        description: 'Écoute deux participants du club de discussion échanger leurs points de vue.',
        intro: 'Écoute l’échange entre deux participants sur le sujet des écrans chez les jeunes.',
        dialogue: [
          { speaker: 'L’étudiant belge', line: 'Il me semble que les écrans, utilisés avec modération, sont un bon outil éducatif.', translation: 'Me parece que las pantallas, usadas con moderación, son una buena herramienta educativa.' },
          { speaker: 'La participante française', line: 'Néanmoins, il ne faut pas ignorer les risques d’addiction.', translation: 'Sin embargo, no hay que ignorar los riesgos de adicción.' },
          { speaker: 'L’étudiant belge', line: 'Vous avez raison, mais le vrai problème, c’est souvent le manque de contrôle parental.', translation: 'Tiene razón, pero el verdadero problema suele ser la falta de control parental.' },
          { speaker: 'La participante française', line: 'Dans une certaine mesure, je suis d’accord avec vous.', translation: 'En cierta medida, estoy de acuerdo con usted.' }
        ],
        phrases: ['Il me semble que...', 'Néanmoins...', 'Le vrai problème, c’est...', 'Dans une certaine mesure...'],
        exercises: [
          { type: 'mcq', prompt: 'Quel est le premier argument de l’étudiant belge ?', options: ['Les écrans sont toujours mauvais', 'Les écrans peuvent être un bon outil éducatif', 'Il faut interdire les écrans', 'Il n’utilise jamais d’écran'], answer: 1 },
          { type: 'mcq', prompt: 'Quel risque mentionne la participante française ?', options: ['Le prix des écrans', 'Le risque d’addiction', 'La pollution', 'Le manque de wifi'], answer: 1 },
          { type: 'mcq', prompt: 'Quel autre problème l’étudiant belge mentionne-t-il ensuite ?', options: ['Le manque de contrôle parental', 'Le prix des téléphones', 'La vitesse d’internet', 'Le manque d’écoles'], answer: 0 },
          { type: 'mcq', prompt: 'Comment se termine cet échange ?', options: ['Par une dispute', 'Par un accord partiel et nuancé', 'Par un désaccord total', 'Sans conclusion'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Défendre une position nuancée',
        description: 'Participe à un débat sur un sujet de société avec une position nuancée.',
        mission: 'Choisis un sujet de société (technologie, environnement, éducation) et présente une position nuancée, avec au moins un contre-argument anticipé.',
        phrases: ['Il me semble que...', 'Néanmoins...', 'On pourrait objecter que...', 'Dans une certaine mesure...'],
        dialogue: [
          { speaker: 'Toi', line: 'Il me semble que ce sujet a des avantages réels. Néanmoins, on pourrait objecter que... Dans une certaine mesure, je reconnais cette limite.', translation: 'Me parece que este tema tiene ventajas reales. Sin embargo, se podría objetar que... En cierta medida, reconozco ese límite.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Défends une position nuancée sur un sujet de société, en anticipant et en répondant à un contre-argument.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Organise un débat structuré avec un/une camarade sur un sujet de société de votre choix.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Un texte argumentatif nuancé',
        description: 'Écris un texte argumentatif présentant une position nuancée sur un sujet de société.',
        mission: 'Écris 200 à 250 mots présentant une position nuancée sur un sujet de société de ton choix, avec un argument principal, un contre-argument reconnu, et une conclusion mesurée.',
        phrases: ['Il me semble que...', 'Néanmoins...', 'Dans une certaine mesure...', 'En conclusion...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Il me semble que les réseaux sociaux offrent de réels avantages pour rester connecté. Néanmoins, ils comportent aussi des risques bien documentés. Dans une certaine mesure, tout dépend de l’usage qu’on en fait. En conclusion, un usage modéré et conscient semble être la meilleure approche.', translation: 'Me parece que las redes sociales ofrecen ventajas reales para mantenerse conectado. Sin embargo, también conllevan riesgos bien documentados. En cierta medida, todo depende del uso que se les dé. En conclusión, un uso moderado y consciente parece ser el mejor enfoque.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris un texte argumentatif nuancé de 200 à 250 mots sur un sujet de société, avec des connecteurs avancés.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'La voix passive',
        description: 'Utiliser la voix passive dans un contexte argumentatif.',
        grammarNote: 'La voix passive se forme avec être + participe passé, le sujet de la phrase active devenant le complément d’agent introduit par « par » : « Ce contenu est rarement contrôlé par les parents » (au lieu de « Les parents contrôlent rarement ce contenu »). Elle est fréquente à l’écrit argumentatif pour mettre l’accent sur l’action plutôt que sur celui qui la fait.',
        phrases: ['... est contrôlé par...', '... a été démontré que...', '... sont souvent considérés comme...', '... n’a pas été réfuté.'],
        exercises: [
          { type: 'mcq', prompt: 'Ce contenu ___ rarement contrôlé par les parents.', options: ['est', 'a', 'sera', 'était'], answer: 0 },
          { type: 'mcq', prompt: 'Aucun argument n’___ complètement réfuté.', options: ['a été', 'est', 'sera', 'avait'], answer: 0 },
          { type: 'mcq', prompt: 'Quelle phrase est à la voix passive ?', options: ['Les parents contrôlent le contenu.', 'Le contenu est contrôlé par les parents.', 'Les parents vont contrôler le contenu.', 'Les parents contrôlaient le contenu.'], answer: 1 },
          { type: 'mcq', prompt: 'Les risques d’addiction ___ bien documentés par les chercheurs.', options: ['sont', 'ont', 'seront', 'étaient'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire du débat',
        description: 'Le vocabulaire essentiel pour argumenter et débattre en français.',
        vocabulary: [
          { word: 'un point de vue', translation: 'un punto de vista', example: 'Chacun a exprimé son point de vue.' },
          { word: 'réfuter', translation: 'refutar', example: 'Personne n’a réfuté cet argument.' },
          { word: 'dans une certaine mesure', translation: 'en cierta medida', example: 'Dans une certaine mesure, je suis d’accord.' },
          { word: 'un contre-argument', translation: 'un contraargumento', example: 'Elle a présenté un contre-argument solide.' },
          { word: 'néanmoins', translation: 'sin embargo', example: 'C’est un bon outil, néanmoins il y a des risques.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « réfuter » ?', options: ['Refutar', 'Confirmar', 'Ignorar', 'Repetir'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « un contre-argument » ?', options: ['Un ejemplo', 'Un contraargumento', 'Una pregunta', 'Una conclusión'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « néanmoins » ?', options: ['Por lo tanto', 'Sin embargo', 'Además', 'Porque'], answer: 1 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Après le débat',
        description: 'Camila et Karim discutent de son expérience au club de discussion.',
        intro: 'Après la session, Camila appelle Karim pour lui raconter son premier débat en français.',
        dialogue: [
          { speaker: 'Camila', line: 'J’ai réussi à débattre en français devant des inconnus, tu te rends compte ?', translation: 'Logré debatir en francés frente a desconocidos, ¿te das cuenta?' },
          { speaker: 'Karim', line: 'C’est génial, je suis vraiment fier de toi !', translation: '¡Es genial, estoy muy orgulloso de ti!' },
          { speaker: 'Camila', line: 'J’étais nerveuse au début, mais j’ai fini par prendre confiance.', translation: 'Estaba nerviosa al principio, pero terminé ganando confianza.' },
          { speaker: 'Karim', line: 'C’est exactement comme ça qu’on progresse vraiment dans une langue.', translation: 'Así es exactamente como se progresa de verdad en un idioma.' }
        ],
        phrases: ['Tu te rends compte ?', 'Je suis fier/fière de toi.', 'J’ai fini par...', 'C’est comme ça qu’on progresse.'],
        exercises: [
          { type: 'mcq', prompt: 'Qu’a réussi à faire Camila pour la première fois ?', options: ['Écrire un livre', 'Débattre en français devant des inconnus', 'Voyager seule', 'Passer un examen officiel'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila se sentait-elle au début du débat ?', options: ['Très confiante', 'Nerveuse', 'Indifférente', 'En colère'], answer: 1 },
          { type: 'mcq', prompt: 'Que pense Karim de ce type d’exercice pour apprendre une langue ?', options: ['Que ce n’est pas utile', 'Que c’est exactement comme ça qu’on progresse', 'Qu’il vaut mieux éviter les débats', 'Qu’il faut seulement étudier la grammaire'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'le-teletravail-et-lavenir-professionnel',
    title: 'Le télétravail et l’avenir professionnel',
    titleEs: 'El teletrabajo y el futuro profesional',
    description: 'En attendant la réponse de l’université, Camila décroche un petit emploi de traduction à distance et découvre les avantages et limites du télétravail.',
    order: 4,
    accessTier: 'free',
    unitOverview: {
      objective: 'Décrire une expérience professionnelle et peser les avantages et inconvénients du télétravail.',
      outcomes: [
        'décrire une routine de travail à distance',
        'peser des avantages et des inconvénients avec nuance',
        'utiliser le gérondif pour exprimer la simultanéité',
        'employer des pronoms relatifs composés (dont, ce dont)'
      ],
      grammar: ['le gérondif (en + participe présent)', 'pronoms relatifs composés (dont, ce dont)', 'expressions de nuance professionnelle'],
      vocabulary: ['le télétravail', 'la productivité', 'l’isolement', 'gérer son temps'],
      scenario: 'Camila commence un petit emploi de traduction à distance pour une agence tout en attendant la réponse de l’université.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Travailler seule chez soi',
        description: 'Camila commence un emploi de traduction à distance et découvre les avantages et les difficultés du télétravail.',
        reading: {
          title: 'Travailler seule chez soi',
          parts: [
            "En attendant la réponse de l'université de Tours, Camila décide de mettre à profit ses compétences linguistiques en acceptant un petit contrat de traduction à distance pour une agence spécialisée dans les documents touristiques. Chaque matin, elle s'installe à son bureau, allume son ordinateur, et commence à traduire des brochures de l'espagnol vers le français, tout en écoutant parfois de la musique douce pour rester concentrée. « C'est étrange de travailler sans jamais rencontrer physiquement mes collègues », confie-t-elle à Karim lors d'un appel vidéo. « Mais en même temps, ça me permet d'organiser ma journée exactement comme je le souhaite. »",
            "Après quelques semaines, Camila commence néanmoins à ressentir certaines limites de ce mode de travail. En travaillant seule chez elle toute la journée, elle réalise à quel point les interactions sociales spontanées lui manquent : les petites conversations informelles, les pauses café partagées, les blagues échangées entre collègues. Ce dont elle a le plus besoin, remarque-t-elle, ce n'est pas tant de superviseur ou d'horaires fixes, mais simplement de présence humaine régulière. Sa mère, en la voyant travailler d'affilée pendant des heures sans sortir de sa chambre, s'inquiète également : « Tu devrais peut-être aller travailler dans un café de temps en temps, pour changer d'air. »",
            "Camila décide alors de suivre ce conseil et commence à travailler deux après-midis par semaine dans un café près de chez elle. Ce changement, aussi simple soit-il, améliore considérablement son moral : elle apprécie l'ambiance animée du lieu, tout en restant suffisamment concentrée pour respecter ses délais de traduction. Elle comprend alors que le télétravail, contrairement à ce qu'elle avait imaginé au début, n'est ni entièrement positif ni entièrement négatif : tout dépend de la façon dont on organise son environnement et ses relations sociales autour de ce nouveau rythme de vie.",
            "Ce petit emploi lui permet également de mettre en pratique, de façon très concrète, les compétences qu'elle espère développer davantage à l'université : la précision linguistique, la rigueur, et la capacité à s'adapter à des contextes professionnels variés. Elle prend conscience, en discutant avec Sofía un soir, que cette expérience, bien que modeste, constitue déjà une première étape vers le métier de traductrice dont elle rêve depuis son année en France. « Je crois que je suis vraiment sur la bonne voie », confie-t-elle à son amie, avec une confiance qu'elle n'aurait pas eue un an plus tôt."
          ],
          questions: [
            'Pourquoi Camila accepte-t-elle ce contrat de traduction à distance ?',
            'Quelle limite du télétravail Camila découvre-t-elle après quelques semaines ?',
            'Quelle solution trouve-t-elle pour améliorer son moral ?'
          ],
          ordering: {
            prompt: 'Remets les étapes de l’expérience de Camila dans l’ordre.',
            events: [
              'Camila accepte un contrat de traduction à distance.',
              'Elle réalise que les interactions sociales lui manquent.',
              'Sa mère lui suggère de travailler parfois dans un café.',
              'Camila comprend que le télétravail dépend de son organisation personnelle.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce texte ?', options: ['D’un voyage professionnel', 'De l’expérience de Camila avec le télétravail', 'D’un conflit avec un employeur', 'D’une candidature refusée'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : quel type de traduction fait Camila ?', options: ['Des documents juridiques', 'Des brochures touristiques', 'Des livres scientifiques', 'Des articles de presse'], answer: 1 },
          { type: 'mcq', prompt: 'Quel avantage du télétravail Camila mentionne-t-elle au début ?', options: ['Un meilleur salaire', 'La liberté d’organiser sa journée', 'Moins de travail à faire', 'Plus de vacances'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle limite Camila ressent-elle après quelques semaines ?', options: ['Le manque d’équipement', 'Le manque d’interactions sociales', 'Le manque d’argent', 'Le manque de temps libre'], answer: 1 },
          { type: 'mcq', prompt: 'Que suggère la mère de Camila ?', options: ['D’arrêter de travailler', 'D’aller travailler parfois dans un café', 'De changer complètement de métier', 'De déménager'], answer: 1 },
          { type: 'mcq', prompt: 'Cause et conséquence : pourquoi le changement au café améliore-t-il son moral ?', options: ['Parce qu’elle gagne plus d’argent', 'Parce qu’elle retrouve une ambiance sociale tout en restant concentrée', 'Parce qu’elle arrête de travailler', 'Parce que le café est gratuit'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « ce dont elle a le plus besoin » ?', options: ['Ce qu’elle possède déjà', 'Ce qui lui manque le plus', 'Ce qu’elle a acheté', 'Ce qu’elle a oublié'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime une conclusion personnelle de Camila ?', options: ['Elle traduit des brochures touristiques.', 'Le télétravail n’est ni entièrement positif ni entièrement négatif.', 'Elle travaille deux après-midis au café.', 'Sa mère s’inquiète en la voyant travailler.'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : que représente ce petit emploi pour l’avenir de Camila ?', options: ['Une perte de temps', 'Une première étape vers le métier de traductrice', 'Un obstacle à ses études', 'Une expérience sans importance'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : comment Camila se sent-elle à la fin du texte, comparée à un an plus tôt ?', options: ['Moins confiante', 'Plus confiante dans son projet professionnel', 'Exactement pareille', 'Découragée'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Un appel avec Karim sur le télétravail',
        description: 'Écoute Camila expliquer à Karim ses impressions sur le télétravail.',
        intro: 'Écoute la conversation entre Camila et Karim sur les débuts de son travail à distance.',
        dialogue: [
          { speaker: 'Karim', line: 'Alors, comment se passe ton nouveau travail à distance ?', translation: '¿Y cómo va tu nuevo trabajo a distancia?' },
          { speaker: 'Camila', line: 'Plutôt bien, mais c’est étrange de ne jamais voir mes collègues.', translation: 'Bastante bien, pero es extraño no ver nunca a mis colegas.' },
          { speaker: 'Karim', line: 'Ce dont tu as besoin, c’est peut-être de sortir travailler ailleurs de temps en temps.', translation: 'Lo que necesitas quizás es salir a trabajar a otro lugar de vez en cuando.' },
          { speaker: 'Camila', line: 'Tu as raison, je vais essayer un café près de chez moi.', translation: 'Tienes razón, voy a probar un café cerca de casa.' }
        ],
        phrases: ['Comment se passe... ?', 'C’est étrange de...', 'Ce dont tu as besoin...', 'Je vais essayer...'],
        exercises: [
          { type: 'mcq', prompt: 'Comment Camila décrit-elle son nouveau travail au début ?', options: ['Terrible', 'Plutôt bien, mais étrange sans collègues', 'Complètement décevant', 'Trop facile'], answer: 1 },
          { type: 'mcq', prompt: 'Que suggère Karim ?', options: ['D’arrêter le travail', 'De sortir travailler ailleurs parfois', 'De travailler toute la nuit', 'De ne rien changer'], answer: 1 },
          { type: 'mcq', prompt: 'Que décide de faire Camila ?', options: ['Rien du tout', 'Essayer de travailler dans un café', 'Démissionner', 'Déménager'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Peser le pour et le contre',
        description: 'Présente les avantages et les inconvénients d’une modalité de travail.',
        mission: 'Présente les avantages et les inconvénients du télétravail (ou d’une autre modalité de travail), avec au moins une nuance personnelle.',
        phrases: ['D’un côté... de l’autre...', 'Ce dont j’ai besoin, c’est...', 'En travaillant ainsi, je...', 'Tout dépend de...'],
        dialogue: [
          { speaker: 'Toi', line: 'D’un côté, le télétravail offre de la liberté. De l’autre, il peut créer de l’isolement. Ce dont j’ai besoin, c’est d’un bon équilibre entre les deux.', translation: 'Por un lado, el teletrabajo ofrece libertad. Por otro, puede generar aislamiento. Lo que necesito es un buen equilibrio entre ambos.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente les avantages et inconvénients d’une modalité de travail, avec le gérondif et un pronom relatif composé.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, comparez vos préférences entre travail à distance et travail en présentiel.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Mon expérience professionnelle',
        description: 'Raconte une expérience professionnelle ou un stage, avec ses avantages et ses limites.',
        mission: 'Écris 200 à 250 mots décrivant une expérience professionnelle (réelle ou imaginaire), avec un avantage, une limite, et une solution trouvée.',
        phrases: ['En travaillant, j’ai découvert...', 'Ce dont j’avais besoin, c’était...', 'Cependant...', 'J’ai fini par trouver un équilibre.'],
        dialogue: [
          { speaker: 'Modèle', line: 'En travaillant à distance, j’ai découvert une grande liberté d’organisation. Cependant, ce dont j’avais besoin, c’était davantage de contact humain. J’ai fini par trouver un équilibre en travaillant parfois dans un espace partagé.', translation: 'Al trabajar a distancia, descubrí una gran libertad de organización. Sin embargo, lo que necesitaba era más contacto humano. Terminé encontrando un equilibrio trabajando a veces en un espacio compartido.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 200 à 250 mots sur une expérience professionnelle, avec au moins un gérondif et un pronom relatif composé (dont/ce dont).', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le gérondif et les pronoms relatifs composés',
        description: 'Exprimer la simultanéité avec le gérondif et utiliser dont/ce dont.',
        grammarNote: 'Le gérondif (en + participe présent) exprime une action simultanée : « En travaillant seule, elle a réalisé... » « Dont » remplace un complément introduit par « de » : « Le métier dont elle rêve. » « Ce dont » s’utilise sans antécédent précis : « Ce dont elle a besoin, c’est de présence humaine. »',
        phrases: ['En travaillant...', 'En écoutant...', 'Le métier dont je rêve...', 'Ce dont j’ai besoin, c’est...'],
        exercises: [
          { type: 'mcq', prompt: '___ travaillant seule, elle a réalisé qu’elle avait besoin de contact humain.', options: ['En', 'Dans', 'Par', 'Pour'], answer: 0 },
          { type: 'mcq', prompt: 'C’est le métier ___ elle rêve depuis longtemps.', options: ['que', 'dont', 'où', 'qui'], answer: 1 },
          { type: 'mcq', prompt: '___ elle a le plus besoin, c’est de présence humaine.', options: ['Ce que', 'Ce dont', 'Ce qui', 'Ce à quoi'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle structure exprime la simultanéité ?', options: ['En + participe présent', 'Avoir + participe passé', 'Aller + infinitif', 'Être + adjectif'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire du télétravail',
        description: 'Le vocabulaire essentiel pour parler du travail à distance.',
        vocabulary: [
          { word: 'le télétravail', translation: 'el teletrabajo', example: 'Le télétravail lui offre beaucoup de liberté.' },
          { word: 'la productivité', translation: 'la productividad', example: 'Sa productivité a augmenté depuis qu’elle travaille au café.' },
          { word: 'l’isolement', translation: 'el aislamiento', example: 'L’isolement est un vrai défi du télétravail.' },
          { word: 'gérer son temps', translation: 'gestionar su tiempo', example: 'Il faut savoir gérer son temps en télétravail.' },
          { word: 'un délai', translation: 'un plazo', example: 'Elle respecte toujours ses délais de traduction.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « l’isolement » ?', options: ['El aislamiento', 'La productividad', 'El plazo', 'El teletrabajo'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « gérer son temps » ?', options: ['Perder el tiempo', 'Gestionar su tiempo', 'Trabajar de noche', 'Descansar'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « un délai » ?', options: ['Un plazo', 'Un salario', 'Un colega', 'Un contrato'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Une pause café bien méritée',
        description: 'Camila travaille pour la première fois dans un café et raconte son expérience à Sofía.',
        intro: 'Après plusieurs semaines de travail isolé, Camila essaie de travailler dans un café pour la première fois.',
        dialogue: [
          { speaker: 'Sofía', line: 'Alors, comment c’était, travailler au café aujourd’hui ?', translation: '¿Y cómo estuvo trabajar en el café hoy?' },
          { speaker: 'Camila', line: 'Vraiment agréable ! L’ambiance m’a aidée à rester motivée toute la journée.', translation: '¡Realmente agradable! El ambiente me ayudó a mantenerme motivada todo el día.' },
          { speaker: 'Sofía', line: 'Tu vas continuer à y aller régulièrement ?', translation: '¿Vas a seguir yendo regularmente?' },
          { speaker: 'Camila', line: 'Oui, je pense que ça va devenir une bonne habitude pour moi.', translation: 'Sí, creo que se va a convertir en un buen hábito para mí.' }
        ],
        phrases: ['Comment c’était... ?', 'L’ambiance m’a aidée à...', 'Tu vas continuer à... ?', 'Ça va devenir une bonne habitude.'],
        exercises: [
          { type: 'mcq', prompt: 'Comment Camila décrit-elle sa journée au café ?', options: ['Ennuyeuse', 'Agréable et motivante', 'Fatigante', 'Décevante'], answer: 1 },
          { type: 'mcq', prompt: 'Que demande Sofía à la fin ?', options: ['Si Camila va arrêter de travailler', 'Si elle va continuer à aller au café', 'Si elle veut changer de métier', 'Si elle est fatiguée'], answer: 1 },
          { type: 'mcq', prompt: 'Que pense Camila de cette nouvelle habitude ?', options: ['Elle ne va pas la garder', 'Elle pense que ça va devenir une bonne habitude', 'Elle est indifférente', 'Elle préfère travailler seule'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'litterature-francophone',
    title: 'Littérature francophone',
    titleEs: 'Literatura francófona',
    description: 'Camila rejoint un club de lecture en ligne qui étudie un roman francophone caribéen, mêlant sa propre culture à la langue qu’elle a apprise.',
    order: 5,
    accessTier: 'free',
    unitOverview: {
      objective: 'Analyser un extrait littéraire simple et rapporter les propos d’un auteur au discours indirect.',
      outcomes: [
        'analyser le thème et le ton d’un extrait littéraire',
        'rapporter des propos au discours indirect au passé',
        'utiliser des pronoms relatifs composés (lequel, laquelle)',
        'exprimer une impression de lecture avec nuance'
      ],
      grammar: ['discours indirect au passé', 'pronoms relatifs composés (lequel, auquel, duquel)', 'expressions d’analyse littéraire'],
      vocabulary: ['un extrait', 'le narrateur', 'évoquer', 'un thème récurrent'],
      scenario: 'Camila rejoint un club de lecture en ligne qui étudie un roman francophone caribéen évoquant l’identité et le déracinement.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Le club de lecture',
        description: 'Camila découvre un roman francophone caribéen dans un club de lecture en ligne, et son thème résonne particulièrement avec son expérience.',
        reading: {
          title: 'Le club de lecture',
          parts: [
            "Pour continuer à progresser en français tout en explorant sa propre identité culturelle, Camila rejoint un club de lecture en ligne consacré à la littérature francophone caribéenne. Le premier roman étudié, écrit par une autrice guadeloupéenne, raconte l'histoire d'une jeune femme partagée entre deux cultures, deux langues et deux façons de comprendre le monde. Dès les premières pages, Camila se reconnaît dans le personnage principal, à tel point qu'elle doit parfois s'arrêter de lire pour reprendre son souffle.",
            "Lors de la première réunion du club, l'animatrice, une professeure de littérature à la retraite, explique que ce roman explore un thème récurrent dans la littérature caribéenne : le déracinement et la quête d'une identité qui ne se limite pas à un seul territoire. Elle rapporte une interview dans laquelle l'autrice avait expliqué qu'elle avait voulu montrer que l'on pouvait appartenir pleinement à plusieurs mondes à la fois, sans jamais devoir en choisir un seul de manière définitive. Camila écoute, fascinée, en pensant immédiatement à sa propre expérience entre Saint-Domingue et la France.",
            "Quand vient son tour de parler, Camila partage timidement son interprétation : « Ce roman auquel je pensais beaucoup en le lisant m'a fait comprendre que mon sentiment d'être « entre deux mondes » n'était pas un problème à résoudre, mais peut-être simplement une nouvelle façon d'exister. » Les autres participants du club acquiescent, visiblement touchés par cette lecture personnelle du texte. L'animatrice ajoute que c'est exactement la force de la grande littérature : permettre à chaque lecteur de retrouver, à travers les mots d'un autre, une part de sa propre vérité.",
            "Après la réunion, Camila referme son ordinateur avec un sentiment inhabituel de plénitude. Elle qui pensait, un an plus tôt, que le français ne serait qu'un outil pratique pour communiquer, découvre aujourd'hui qu'il peut aussi devenir une langue dans laquelle elle pense, ressent, et même se comprend elle-même un peu mieux. Elle décide, dès le lendemain, de commander le roman suivant proposé par le club, impatiente de continuer cette exploration littéraire qui, elle le sent, va profondément l'accompagner dans les années à venir. Elle envoie même un message à Léa et Karim pour leur recommander le livre, certaine qu'eux aussi trouveraient un écho à leur propre façon de vivre entre plusieurs cultures et plusieurs langues."
          ],
          questions: [
            'Quel type de roman le club de lecture étudie-t-il en premier ?',
            'Quel thème récurrent l’animatrice identifie-t-elle dans ce roman ?',
            'Comment Camila interprète-t-elle personnellement le roman ?'
          ],
          ordering: {
            prompt: 'Remets les moments de la réunion du club de lecture dans l’ordre.',
            events: [
              'Camila commence à lire le roman et se reconnaît dans le personnage.',
              'L’animatrice explique le thème du déracinement et de l’identité.',
              'Camila partage son interprétation personnelle du roman.',
              'Elle décide de commander le roman suivant proposé par le club.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce texte ?', options: ['D’un cours de grammaire française', 'De la découverte de la littérature francophone par Camila', 'D’un voyage en Guadeloupe', 'D’un problème technique lors d’une visioconférence'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : qui a écrit le roman étudié ?', options: ['Un auteur français', 'Une autrice guadeloupéenne', 'Un auteur dominicain', 'Camila elle-même'], answer: 1 },
          { type: 'mcq', prompt: 'Quel thème récurrent l’animatrice mentionne-t-elle ?', options: ['La guerre et la paix', 'Le déracinement et l’identité multiple', 'L’amour impossible', 'Le voyage dans le temps'], answer: 1 },
          { type: 'mcq', prompt: 'Que rapporte l’animatrice sur l’intention de l’autrice ?', options: ['Qu’elle voulait critiquer son pays', 'Qu’elle voulait montrer qu’on peut appartenir à plusieurs mondes', 'Qu’elle écrivait pour de l’argent', 'Qu’elle regrettait d’avoir écrit ce livre'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila interprète-t-elle son propre sentiment « entre deux mondes » après cette lecture ?', options: ['Comme un problème à résoudre absolument', 'Comme une nouvelle façon d’exister', 'Comme une erreur de jeunesse', 'Comme quelque chose à cacher'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : pourquoi les autres participants sont-ils touchés par l’intervention de Camila ?', options: ['Parce qu’elle a parlé très fort', 'Parce que son interprétation personnelle résonne avec le texte', 'Parce qu’elle a critiqué le roman', 'Parce qu’elle a fait une erreur de français'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « la force de la grande littérature » selon l’animatrice ?', options: ['Sa capacité à faire vendre beaucoup de livres', 'Sa capacité à permettre à chacun de retrouver sa propre vérité', 'Sa difficulté de lecture', 'Sa longueur'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime un fait, et non une impression ?', options: ['Camila se reconnaît dans le personnage principal.', 'L’animatrice est une professeure de littérature à la retraite.', 'Ce roman lui a fait comprendre beaucoup de choses.', 'Elle ressent un sentiment inhabituel de plénitude.'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : que représente désormais le français pour Camila, selon la fin du texte ?', options: ['Un outil purement pratique, rien de plus', 'Une langue dans laquelle elle pense et se comprend elle-même', 'Une langue qu’elle veut abandonner', 'Une matière scolaire obligatoire'], answer: 1 },
          { type: 'mcq', prompt: 'Intention communicative : pourquoi Camila décide-t-elle de commander le roman suivant ?', options: ['Par obligation pour le club', 'Parce qu’elle est impatiente de continuer cette exploration littéraire', 'Parce que c’est gratuit', 'Parce que Sofía le lui a demandé'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'L’interview de l’autrice',
        description: 'Écoute l’animatrice rapporter les propos de l’autrice du roman.',
        intro: 'Écoute l’animatrice du club de lecture expliquer l’intention de l’autrice.',
        dialogue: [
          { speaker: 'L’animatrice', line: 'Dans une interview, l’autrice a dit qu’elle voulait explorer le thème du déracinement.', translation: 'En una entrevista, la autora dijo que quería explorar el tema del desarraigo.' },
          { speaker: 'Camila', line: 'C’est exactement ce que j’ai ressenti en lisant le roman.', translation: 'Es exactamente lo que sentí al leer la novela.' },
          { speaker: 'L’animatrice', line: 'Elle a expliqué qu’on pouvait appartenir à plusieurs cultures sans devoir en choisir une seule.', translation: 'Explicó que uno podía pertenecer a varias culturas sin tener que elegir una sola.' },
          { speaker: 'Camila', line: 'Ça résonne beaucoup avec mon expérience entre deux pays.', translation: 'Eso resuena mucho con mi experiencia entre dos países.' }
        ],
        phrases: ['Elle a dit que...', 'Elle a expliqué que...', 'Ça résonne avec...', 'C’est exactement ce que...'],
        exercises: [
          { type: 'mcq', prompt: 'Que rapporte l’animatrice sur l’intention de l’autrice ?', options: ['Qu’elle voulait raconter une histoire d’amour', 'Qu’elle voulait explorer le thème du déracinement', 'Qu’elle voulait écrire un roman policier', 'Qu’elle ne voulait rien exprimer de particulier'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila réagit-elle à cette explication ?', options: ['Elle est indifférente', 'Elle se reconnaît dans ce thème', 'Elle n’est pas d’accord', 'Elle ne comprend pas'], answer: 1 },
          { type: 'mcq', prompt: 'À quoi Camila compare-t-elle le thème du roman ?', options: ['À un film qu’elle a vu', 'À sa propre expérience entre deux pays', 'À un cours d’histoire', 'À rien en particulier'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Analyser une œuvre',
        description: 'Présente ton analyse d’un livre, film ou œuvre qui t’a marqué.',
        mission: 'Présente une œuvre (livre, film, chanson) qui t’a marqué, en expliquant son thème principal et pourquoi elle résonne avec ton expérience personnelle.',
        phrases: ['Le thème principal est...', 'L’auteur/autrice a voulu montrer que...', 'Ça résonne avec mon expérience parce que...', 'Ce que j’en retiens, c’est...'],
        dialogue: [
          { speaker: 'Toi', line: 'Le thème principal de cette œuvre est... L’auteur a voulu montrer que... Ça résonne avec mon expérience parce que...', translation: 'El tema principal de esta obra es... El autor quiso mostrar que... Esto resuena con mi experiencia porque...' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente une analyse d’une œuvre qui t’a marqué, avec au moins une phrase au discours indirect.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, discutez d’un livre ou film que vous avez tous les deux aimé.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Une critique littéraire',
        description: 'Rédige une courte critique littéraire d’un livre qui t’a marqué.',
        mission: 'Écris 200 à 250 mots présentant un livre (réel ou imaginaire) qui t’a marqué, son thème principal, et pourquoi il résonne avec toi.',
        phrases: ['Ce roman évoque...', 'L’auteur/autrice a expliqué que...', 'Un thème récurrent est...', 'Ce livre auquel je pense souvent...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Ce roman évoque le thème du déracinement à travers l’histoire d’une jeune femme partagée entre deux cultures. L’autrice a expliqué qu’elle voulait montrer qu’on pouvait appartenir à plusieurs mondes à la fois. Ce livre auquel je pense souvent m’a beaucoup marquée.', translation: 'Esta novela evoca el tema del desarraigo a través de la historia de una joven dividida entre dos culturas. La autora explicó que quería mostrar que se podía pertenecer a varios mundos a la vez. Este libro en el que pienso a menudo me marcó mucho.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris une critique littéraire de 200 à 250 mots, avec au moins une phrase au discours indirect et un pronom relatif composé (lequel/auquel).', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le discours indirect au passé et lequel/auquel',
        description: 'Rapporter des propos passés et utiliser lequel/auquel comme pronoms relatifs.',
        grammarNote: 'Au discours indirect au passé, le présent devient l’imparfait et le passé composé devient le plus-que-parfait : « Elle a dit : "Je veux explorer ce thème." » → « Elle a dit qu’elle voulait explorer ce thème. » « Lequel/auquel/duquel » remplacent un nom précédé d’une préposition : « Le roman auquel je pensais. »',
        phrases: ['Elle a dit que...', 'Elle a expliqué qu’elle voulait...', 'Le roman auquel je pensais...', 'L’idée à laquelle elle tenait...'],
        exercises: [
          { type: 'mcq', prompt: 'Elle a dit qu’elle ___ explorer ce thème.', options: ['veut', 'voulait', 'voudra', 'a voulu'], answer: 1 },
          { type: 'mcq', prompt: 'L’autrice a expliqué qu’elle ___ ce roman pendant deux ans.', options: ['écrit', 'avait écrit', 'écrira', 'écrivant'], answer: 1 },
          { type: 'mcq', prompt: 'Le roman ___ je pensais beaucoup était passionnant.', options: ['que', 'dont', 'auquel', 'où'], answer: 2 },
          { type: 'mcq', prompt: 'Au discours indirect passé, le présent devient...', options: ['Le futur', 'L’imparfait', 'Le conditionnel', 'Le subjonctif'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de l’analyse littéraire',
        description: 'Le vocabulaire essentiel pour analyser et discuter d’une œuvre littéraire.',
        vocabulary: [
          { word: 'un extrait', translation: 'un extracto', example: 'Nous avons lu un extrait du roman.' },
          { word: 'le narrateur / la narratrice', translation: 'el narrador / la narradora', example: 'Le narrateur raconte l’histoire à la première personne.' },
          { word: 'évoquer', translation: 'evocar', example: 'Ce roman évoque le thème de l’identité.' },
          { word: 'un thème récurrent', translation: 'un tema recurrente', example: 'Le déracinement est un thème récurrent de cette autrice.' },
          { word: 'résonner avec', translation: 'resonar con', example: 'Cette histoire résonne avec ma propre expérience.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « évoquer » ?', options: ['Evocar', 'Escribir', 'Vender', 'Traducir'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « un thème récurrent » ?', options: ['Un tema único', 'Un tema recurrente', 'Un tema olvidado', 'Un tema secreto'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « le narrateur » ?', options: ['El narrador', 'El editor', 'El lector', 'El título'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Une nouvelle passion',
        description: 'Camila raconte à Sofía sa nouvelle passion pour la littérature francophone.',
        intro: 'Après la réunion du club de lecture, Camila partage son enthousiasme avec Sofía.',
        dialogue: [
          { speaker: 'Sofía', line: 'Tu as l’air vraiment enthousiaste par ce club de lecture !', translation: '¡Pareces realmente entusiasmada con ese club de lectura!' },
          { speaker: 'Camila', line: 'Oui, ce roman m’a fait comprendre beaucoup de choses sur moi-même.', translation: 'Sí, esta novela me hizo entender muchas cosas sobre mí misma.' },
          { speaker: 'Sofía', line: 'Tu pourrais me le prêter en espagnol, s’il existe une traduction ?', translation: '¿Me lo podrías prestar en español, si existe una traducción?' },
          { speaker: 'Camila', line: 'Bien sûr ! Je pense que tu aimerais beaucoup ce livre.', translation: '¡Claro! Creo que te gustaría mucho este libro.' }
        ],
        phrases: ['Tu as l’air...', 'Ça m’a fait comprendre...', 'Tu pourrais me... ?', 'Je pense que tu aimerais...'],
        exercises: [
          { type: 'mcq', prompt: 'Comment Sofía perçoit-elle l’enthousiasme de Camila ?', options: ['Elle ne le remarque pas', 'Elle le remarque et le mentionne', 'Elle s’en moque', 'Elle est jalouse'], answer: 1 },
          { type: 'mcq', prompt: 'Que demande Sofía à Camila ?', options: ['De ne plus parler du livre', 'De lui prêter le livre en espagnol', 'D’arrêter le club de lecture', 'De lui offrir le livre'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila répond-elle à cette demande ?', options: ['Elle refuse', 'Elle accepte avec plaisir', 'Elle ne répond pas', 'Elle change de sujet'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'cinema-et-critique',
    title: 'Cinéma et critique',
    titleEs: 'Cine y crítica',
    description: 'Camila regarde un film français avec Sofía et rédige sa première critique de cinéma argumentée.',
    order: 6,
    accessTier: 'free',
    unitOverview: {
      objective: 'Rédiger une critique de film structurée avec des arguments et une évaluation nuancée.',
      outcomes: [
        'décrire l’intrigue d’un film sans trop en révéler',
        'évaluer la mise en scène et le jeu des acteurs',
        'utiliser ce qui / ce que pour résumer une impression',
        'nuancer une critique entre points forts et points faibles'
      ],
      grammar: ['ce qui / ce que (récapitulatif)', 'expressions d’évaluation critique', 'comparatifs et superlatifs avancés'],
      vocabulary: ['la mise en scène', 'le scénario', 'un rebondissement', 'convaincant(e) (cinéma)'],
      scenario: 'Camila et Sofía regardent ensemble un film français récent, et Camila décide d’en écrire une critique pour son blog personnel.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Ma première critique de cinéma',
        description: 'Camila regarde un film français avec Sofía et rédige, pour son blog, sa première vraie critique de cinéma.',
        reading: {
          title: 'Ma première critique de cinéma',
          parts: [
            "Camila et Sofía passent leur samedi soir à regarder un film français récent, recommandé par Léa lors d'un appel vidéo la semaine précédente. Il s'agit d'un drame familial se déroulant dans une petite ville de province, racontant l'histoire de trois sœurs qui se retrouvent après des années de silence pour régler la succession de leur mère. Dès les premières minutes, Camila est frappée par la qualité de la mise en scène : les silences, les regards échangés entre les personnages, tout semble raconter une histoire aussi importante que les dialogues eux-mêmes.",
            "Après le film, Camila décide de rédiger sa première vraie critique de cinéma pour le blog qu'elle a commencé à tenir depuis son retour de France. « Ce qui m'a le plus marquée dans ce film, c'est la façon dont la réalisatrice parvient à créer une tension palpable sans jamais recourir à des effets spectaculaires », écrit-elle. « Ce que j'ai particulièrement apprécié, c'est le jeu des trois actrices principales, absolument convaincantes dans leur complexité émotionnelle. »",
            "Cependant, Camila reste honnête dans son évaluation : elle reconnaît que le rythme du film, particulièrement lent pendant la première demi-heure, pourrait rebuter certains spectateurs habitués à des scénarios plus rythmés. « Ce n'est certainement pas le film le plus divertissant que j'aie vu cette année, mais c'est probablement l'un des plus émouvants et des mieux interprétés », conclut-elle. Elle ajoute également une remarque sur la fin du film, sans trop en révéler pour ne pas gâcher la surprise à ses lecteurs : le dernier rebondissement lui a semblé un peu prévisible, mais n'a en rien diminué l'impact émotionnel de l'ensemble.",
            "En relisant sa critique avant de la publier, Camila réalise avec fierté à quel point elle a progressé depuis son arrivée en France, un an et demi plus tôt : non seulement elle comprend désormais des films entiers en français sans sous-titres, mais elle est également capable d'analyser leur construction narrative et d'exprimer une opinion nuancée et argumentée à leur sujet. Sofía, en lisant le texte par-dessus son épaule, s'exclame : « Tu écris exactement comme une vraie critique de cinéma ! » Camila sourit, fière de ce nouveau talent qu'elle ne se connaissait pas."
          ],
          questions: [
            'De quel type de film s’agit-il ?',
            'Qu’est-ce que Camila a le plus apprécié dans ce film ?',
            'Quelle réserve Camila exprime-t-elle dans sa critique ?'
          ],
          ordering: {
            prompt: 'Remets les étapes de la soirée de Camila dans l’ordre.',
            events: [
              'Camila et Sofía regardent le film recommandé par Léa.',
              'Camila commence à rédiger sa critique pour son blog.',
              'Elle exprime une réserve honnête sur le rythme du film.',
              'Elle relit son texte et réalise à quel point elle a progressé en français.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce texte ?', options: ['D’un cours de cinéma à l’université', 'De la rédaction d’une critique de film par Camila', 'D’un tournage de film en France', 'D’une dispute entre Camila et Sofía'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : quel type de film Camila et Sofía regardent-elles ?', options: ['Une comédie romantique', 'Un drame familial', 'Un film d’action', 'Un documentaire animalier'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’est-ce que Camila apprécie particulièrement dans le film ?', options: ['Les effets spéciaux', 'Le jeu des trois actrices principales', 'La musique', 'Les décors'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle réserve Camila exprime-t-elle sur le film ?', options: ['Les acteurs sont mauvais', 'Le rythme est lent pendant la première demi-heure', 'L’histoire n’a aucun sens', 'Le film est trop court'], answer: 1 },
          { type: 'mcq', prompt: 'Que pense Camila du dernier rebondissement du film ?', options: ['Il est totalement surprenant', 'Il lui a semblé un peu prévisible', 'Il n’existe pas', 'Elle ne le comprend pas'], answer: 1 },
          { type: 'mcq', prompt: 'Cause et conséquence : pourquoi Camila reste-t-elle honnête dans sa critique malgré son appréciation du film ?', options: ['Parce qu’elle n’aime pas vraiment le film', 'Parce qu’une critique nuancée est plus juste et crédible', 'Parce que Sofía le lui a demandé', 'Par obligation du blog'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « rebuter » dans le troisième paragraphe ?', options: ['Attirer fortement', 'Décourager, déplaire', 'Amuser', 'Informer'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime un fait, et non une opinion ?', options: ['C’est l’un des films les plus émouvants qu’elle ait vus.', 'Le film raconte l’histoire de trois sœurs qui se retrouvent.', 'Le rythme aurait pu rebuter certains spectateurs.', 'Les actrices sont absolument convaincantes.'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : que réalise Camila en relisant sa critique ?', options: ['Qu’elle n’a rien appris en France', 'À quel point elle a progressé en français depuis son arrivée', 'Qu’elle déteste le cinéma', 'Qu’elle veut arrêter son blog'], answer: 1 },
          { type: 'mcq', prompt: 'Intention communicative : pourquoi Camila ne révèle-t-elle pas trop la fin du film ?', options: ['Parce qu’elle l’a oubliée', 'Pour ne pas gâcher la surprise à ses lecteurs', 'Parce que c’est interdit', 'Parce que la fin n’a pas d’importance'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Discuter du film',
        description: 'Écoute Camila et Sofía discuter de leurs impressions juste après le film.',
        intro: 'Écoute la conversation entre Camila et Sofía immédiatement après avoir regardé le film.',
        dialogue: [
          { speaker: 'Sofía', line: 'Alors, qu’est-ce que tu en as pensé ?', translation: '¿Y qué te pareció?' },
          { speaker: 'Camila', line: 'Ce qui m’a le plus marquée, c’est le jeu des actrices.', translation: 'Lo que más me marcó fue la actuación de las actrices.' },
          { speaker: 'Sofía', line: 'Moi, j’ai trouvé le début un peu lent.', translation: 'Yo encontré el principio un poco lento.' },
          { speaker: 'Camila', line: 'C’est vrai, mais ça valait vraiment la peine d’attendre.', translation: 'Es verdad, pero realmente valió la pena esperar.' }
        ],
        phrases: ['Qu’est-ce que tu en as pensé ?', 'Ce qui m’a marqué(e), c’est...', 'J’ai trouvé... un peu...', 'Ça valait la peine.'],
        exercises: [
          { type: 'mcq', prompt: 'Qu’est-ce qui a le plus marqué Camila ?', options: ['La musique', 'Le jeu des actrices', 'Les décors', 'La durée du film'], answer: 1 },
          { type: 'mcq', prompt: 'Que pense Sofía du début du film ?', options: ['Qu’il est trop rapide', 'Qu’il est un peu lent', 'Qu’il est parfait', 'Qu’il est incompréhensible'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila conclut-elle la conversation ?', options: ['Que le film ne valait pas la peine', 'Que ça valait vraiment la peine d’attendre', 'Qu’elle ne recommande pas le film', 'Qu’elle veut le revoir immédiatement'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Présenter une critique orale',
        description: 'Présente oralement une critique nuancée d’un film ou d’une série.',
        mission: 'Présente une critique orale de deux à trois minutes sur un film ou une série, avec des points forts, une réserve honnête, et une conclusion.',
        phrases: ['Ce qui m’a marqué(e), c’est...', 'Ce que j’ai moins aimé, c’est...', 'Cependant...', 'En conclusion, je recommande/ne recommande pas...'],
        dialogue: [
          { speaker: 'Toi', line: 'Ce qui m’a marqué(e) dans ce film, c’est... Ce que j’ai moins aimé, c’est... En conclusion, je recommande ce film pour...', translation: 'Lo que me marcó de esta película fue... Lo que me gustó menos fue... En conclusión, recomiendo esta película para...' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente une critique orale nuancée d’un film ou d’une série, avec ce qui/ce que et une conclusion argumentée.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, comparez vos critiques respectives du même film ou d’une série que vous connaissez tous les deux.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Rédiger une critique de film',
        description: 'Rédige une critique de film complète et nuancée.',
        mission: 'Écris 200 à 250 mots présentant une critique de film (réel ou imaginaire), avec un résumé bref, des points forts, une réserve, et une conclusion.',
        phrases: ['Ce qui m’a le plus marqué(e), c’est...', 'Ce que j’ai particulièrement apprécié, c’est...', 'Cependant...', 'Je recommande ce film pour...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Ce qui m’a le plus marqué dans ce film, c’est la subtilité de la mise en scène. Ce que j’ai particulièrement apprécié, c’est le jeu des actrices principales. Cependant, le rythme est parfois lent. Je recommande ce film aux amateurs de drames familiaux.', translation: 'Lo que más me marcó de esta película fue la sutileza de la puesta en escena. Lo que aprecié especialmente fue la actuación de las actrices principales. Sin embargo, el ritmo es a veces lento. Recomiendo esta película a los amantes de los dramas familiares.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris une critique de film de 200 à 250 mots, avec « ce qui »/« ce que » et une conclusion nuancée.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Ce qui / ce que et les superlatifs avancés',
        description: 'Utiliser ce qui/ce que pour résumer une impression et des superlatifs nuancés.',
        grammarNote: '« Ce qui » remplace un sujet sans antécédent précis, « ce que » remplace un complément d’objet direct : « Ce qui m’a marqué, c’est... / Ce que j’ai aimé, c’est... » Les superlatifs nuancés (l’un des plus..., parmi les plus...) évitent une affirmation trop catégorique : « C’est l’un des films les plus émouvants que j’aie vus. »',
        phrases: ['Ce qui m’a marqué(e), c’est...', 'Ce que j’ai aimé, c’est...', 'C’est l’un des plus...', 'Parmi les plus...'],
        exercises: [
          { type: 'mcq', prompt: '___ m’a le plus marquée, c’est le jeu des actrices.', options: ['Ce que', 'Ce qui', 'Ce dont', 'Ce à quoi'], answer: 1 },
          { type: 'mcq', prompt: '___ j’ai apprécié, c’est la mise en scène.', options: ['Ce qui', 'Ce que', 'Ce dont', 'Lequel'], answer: 1 },
          { type: 'mcq', prompt: 'C’est l’un des films les plus émouvants ___ j’aie vus.', options: ['que', 'qui', 'dont', 'où'], answer: 0 },
          { type: 'mcq', prompt: 'Quelle expression nuance une affirmation catégorique ?', options: ['C’est le meilleur film', 'C’est l’un des meilleurs films', 'C’est un film nul', 'C’est un film parfait'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de la critique de cinéma',
        description: 'Le vocabulaire essentiel pour rédiger une critique de film.',
        vocabulary: [
          { word: 'la mise en scène', translation: 'la puesta en escena', example: 'La mise en scène est très soignée.' },
          { word: 'le scénario', translation: 'el guion', example: 'Le scénario est original et bien construit.' },
          { word: 'un rebondissement', translation: 'un giro argumental', example: 'Le dernier rebondissement m’a surprise.' },
          { word: 'convaincant(e)', translation: 'convincente (actuación)', example: 'Les actrices sont absolument convaincantes.' },
          { word: 'le rythme', translation: 'el ritmo', example: 'Le rythme du film est un peu lent au début.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « un rebondissement » ?', options: ['Un giro argumental', 'Un actor', 'Un director', 'Un guion'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « la mise en scène » ?', options: ['La puesta en escena', 'El actor principal', 'El guion', 'La música'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « le rythme » ?', options: ['El ritmo', 'El final', 'El título', 'El cartel'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Publier la critique',
        description: 'Camila hésite à publier sa critique sur son blog et demande l’avis de Sofía.',
        intro: 'Avant de publier son article, Camila demande une dernière relecture à Sofía.',
        dialogue: [
          { speaker: 'Camila', line: 'Tu penses que je devrais publier cette critique telle quelle ?', translation: '¿Crees que debería publicar esta crítica tal cual?' },
          { speaker: 'Sofía', line: 'Oui, complètement ! Elle est honnête et bien argumentée.', translation: '¡Sí, completamente! Es honesta y está bien argumentada.' },
          { speaker: 'Camila', line: 'J’ai un peu peur que les gens ne soient pas d’accord avec moi.', translation: 'Tengo un poco de miedo de que la gente no esté de acuerdo conmigo.' },
          { speaker: 'Sofía', line: 'C’est justement ça, une bonne critique : donner un avis personnel assumé.', translation: 'Precisamente eso es una buena crítica: dar una opinión personal asumida.' }
        ],
        phrases: ['Tu penses que je devrais... ?', 'Elle est honnête et bien argumentée.', 'J’ai peur que...', 'Un avis personnel assumé.'],
        exercises: [
          { type: 'mcq', prompt: 'Que demande Camila à Sofía ?', options: ['De réécrire toute la critique', 'Son avis sur la publication de la critique', 'De la traduire en espagnol', 'De supprimer l’article'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Sofía trouve-t-elle la critique de Camila ?', options: ['Trop courte', 'Honnête et bien argumentée', 'Incompréhensible', 'Trop négative'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la peur de Camila ?', options: ['D’être en retard', 'Que les gens ne soient pas d’accord avec elle', 'De perdre son ordinateur', 'De ne plus aimer le cinéma'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'dilemmes-ethiques',
    title: 'Dilemmes éthiques',
    titleEs: 'Dilemas éticos',
    description: 'Dans un forum de discussion philosophique, Camila débat d’un dilemme moral et explore des hypothèses complexes avec le club de lecture.',
    order: 7,
    accessTier: 'free',
    unitOverview: {
      objective: 'Discuter d’un dilemme moral et formuler des hypothèses complexes sur le passé.',
      outcomes: [
        'présenter un dilemme éthique avec précision',
        'formuler une hypothèse irréelle sur le passé',
        'utiliser le conditionnel passé pour exprimer un regret ou un reproche',
        'nuancer un jugement moral sans catégoriser trop vite'
      ],
      grammar: ['hypothèse avec si + plus-que-parfait / conditionnel passé', 'le conditionnel passé (regret, reproche)', 'nuance du jugement moral'],
      vocabulary: ['un dilemme', 'une valeur', 'juger', 'se mettre à la place de'],
      scenario: 'Camila participe à un forum de discussion philosophique en ligne où l’on débat d’un dilemme moral classique.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Le dilemme du forum',
        description: 'Camila participe à un débat philosophique en ligne autour d’un dilemme moral classique.',
        reading: {
          title: 'Le dilemme du forum',
          parts: [
            "Dans le cadre d'un cours de philosophie en ligne auquel elle s'est inscrite pour préparer son entrée à l'université, Camila doit participer à un forum de discussion consacré à un dilemme moral classique : que ferait-on si l'on découvrait qu'un ami proche avait menti pour obtenir un avantage injuste, sans que personne d'autre ne le sache ? Faut-il le dénoncer, au risque de briser une amitié précieuse, ou rester silencieux, au risque de cautionner une injustice ? Le sujet, en apparence simple, suscite des dizaines de réponses passionnées de la part des autres étudiants.",
            "Un participant argentin écrit : « Si j'avais découvert un tel mensonge, j'aurais probablement confronté directement mon ami, sans passer par une dénonciation publique. » Une autre étudiante, sénégalaise, nuance : « Tout dépend des conséquences du mensonge. Si personne n'avait été lésé par cette action, j'aurais peut-être choisi de ne rien dire, tout en exprimant clairement ma désapprobation à mon ami. » Camila, en lisant ces différents points de vue, réalise à quel point ce type de dilemme ne possède aucune réponse universelle et définitive.",
            "Après réflexion, elle décide de partager sa propre position : « Je pense que si j'avais été à la place de cette personne, j'aurais eu énormément de mal à me taire, non pas par principe moral absolu, mais parce que je n'aurais pas pu vivre avec ce secret sans que cela affecte notre amitié à long terme. Cela dit, je comprends aussi ceux qui choisiraient le silence, car juger rapidement la situation de quelqu'un d'autre, sans s'être vraiment mis à sa place, me semble toujours risqué. » Son intervention reçoit plusieurs réponses encourageantes, notamment celle du professeur, qui salue sa capacité à formuler une position claire tout en reconnaissant la légitimité d'autres perspectives.",
            "En refermant son ordinateur ce soir-là, Camila repense à une situation similaire vécue avec une camarade de classe l'année précédente, à Tours, lorsqu'elle avait hésité longuement avant de signaler une tricherie lors d'un examen. Elle se demande si elle referait exactement le même choix aujourd'hui, avec le recul et la maturité qu'elle a acquis depuis. Cet exercice philosophique, au-delà de la simple pratique du conditionnel passé et des hypothèses complexes, lui permet également de mieux comprendre ses propres valeurs, et la façon dont elles continuent d'évoluer avec chaque nouvelle expérience qu'elle traverse."
          ],
          questions: [
            'Quel dilemme moral est présenté au début du forum ?',
            'Quelle nuance apporte l’étudiante sénégalaise ?',
            'À quelle situation personnelle Camila repense-t-elle à la fin du texte ?'
          ],
          ordering: {
            prompt: 'Remets les interventions du forum dans l’ordre.',
            events: [
              'Le professeur présente le dilemme moral au forum.',
              'Le participant argentin explique qu’il aurait confronté son ami directement.',
              'L’étudiante sénégalaise nuance selon les conséquences du mensonge.',
              'Camila partage sa propre position et repense à une expérience similaire.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce texte ?', options: ['D’un examen de mathématiques', 'D’un débat philosophique sur un dilemme moral', 'D’un voyage en Argentine', 'D’une dispute entre amis'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : quel est le dilemme présenté ?', options: ['Voler ou ne pas voler', 'Dénoncer ou taire le mensonge d’un ami', 'Voyager ou rester chez soi', 'Étudier ou travailler'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit le participant argentin qu’il aurait fait ?', options: ['Il aurait ignoré la situation', 'Il aurait confronté directement son ami', 'Il aurait dénoncé publiquement', 'Il n’aurait rien fait'], answer: 1 },
          { type: 'mcq', prompt: 'Sur quoi l’étudiante sénégalaise fait-elle dépendre sa décision ?', options: ['Sur son humeur du jour', 'Sur les conséquences du mensonge', 'Sur l’opinion des autres', 'Sur des règles fixes et universelles'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la position finale de Camila ?', options: ['Elle condamne fermement le silence', 'Elle aurait du mal à se taire, mais comprend aussi le choix du silence', 'Elle refuse de donner un avis', 'Elle pense qu’il faut toujours dénoncer'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : pourquoi le professeur salue-t-il l’intervention de Camila ?', options: ['Parce qu’elle a écrit le plus long message', 'Parce qu’elle formule une position claire tout en reconnaissant d’autres perspectives', 'Parce qu’elle a flatté le professeur', 'Parce qu’elle a copié un autre message'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « cautionner une injustice » ?', options: ['Dénoncer une injustice', 'Approuver silencieusement une injustice', 'Ignorer complètement le sujet', 'Réparer une injustice'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime une opinion personnelle ?', options: ['Camila s’est inscrite à un cours de philosophie en ligne.', 'Juger rapidement la situation de quelqu’un me semble toujours risqué.', 'Un participant argentin a répondu au forum.', 'Le sujet suscite des dizaines de réponses.'], answer: 1 },
          { type: 'mcq', prompt: 'À quelle expérience personnelle Camila repense-t-elle ?', options: ['Un examen raté', 'Une tricherie qu’elle avait hésité à signaler à Tours', 'Un voyage en Argentine', 'Une dispute avec Sofía'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : que lui apporte cet exercice philosophique, selon le dernier paragraphe ?', options: ['Uniquement de la pratique grammaticale', 'Une meilleure compréhension de ses propres valeurs', 'Une note plus élevée au cours', 'Rien de particulier'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Deux points de vue opposés',
        description: 'Écoute deux étudiants du forum exposer des points de vue différents sur le dilemme.',
        intro: 'Écoute l’échange entre deux participants du forum de philosophie.',
        dialogue: [
          { speaker: 'Le participant argentin', line: 'Si j’avais découvert ce mensonge, j’aurais confronté mon ami directement.', translation: 'Si hubiera descubierto esa mentira, habría confrontado a mi amigo directamente.' },
          { speaker: 'L’étudiante sénégalaise', line: 'Moi, tout dépendrait des conséquences réelles du mensonge.', translation: 'Yo, todo dependería de las consecuencias reales de la mentira.' },
          { speaker: 'Le participant argentin', line: 'C’est vrai, mais je n’aurais pas pu garder ce secret longtemps.', translation: 'Es verdad, pero no habría podido guardar ese secreto mucho tiempo.' },
          { speaker: 'L’étudiante sénégalaise', line: 'Chacun réagit différemment face à ce genre de situation.', translation: 'Cada uno reacciona diferente ante este tipo de situación.' }
        ],
        phrases: ['Si j’avais découvert...', 'J’aurais confronté...', 'Tout dépendrait de...', 'Chacun réagit différemment.'],
        exercises: [
          { type: 'mcq', prompt: 'Qu’aurait fait le participant argentin ?', options: ['Il aurait ignoré la situation', 'Il aurait confronté son ami directement', 'Il aurait dénoncé publiquement', 'Il n’aurait rien fait'], answer: 1 },
          { type: 'mcq', prompt: 'De quoi dépendrait la décision de l’étudiante sénégalaise ?', options: ['De son humeur', 'Des conséquences réelles du mensonge', 'De l’opinion générale', 'De l’âge de son ami'], answer: 1 },
          { type: 'mcq', prompt: 'Sur quoi les deux participants sont-ils d’accord à la fin ?', options: ['Qu’il faut toujours dénoncer', 'Que chacun réagit différemment', 'Qu’il ne faut jamais rien dire', 'Qu’ils ont totalement tort tous les deux'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Présenter un dilemme moral',
        description: 'Présente un dilemme moral et exprime ce que tu aurais fait dans cette situation.',
        mission: 'Présente un dilemme moral (réel ou imaginaire) et explique, avec des hypothèses au passé, ce que tu aurais fait et pourquoi.',
        phrases: ['Si j’avais été à sa place, j’aurais...', 'Tout dépendrait de...', 'Je comprends aussi que...', 'Ce n’est pas une décision facile.'],
        dialogue: [
          { speaker: 'Toi', line: 'Si j’avais été à sa place, j’aurais probablement... Cela dit, je comprends aussi ceux qui auraient choisi différemment.', translation: 'Si hubiera estado en su lugar, probablemente habría... Dicho esto, también entiendo a quienes hubieran elegido diferente.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente un dilemme moral et exprime une hypothèse sur ce que tu aurais fait, avec le conditionnel passé.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Débats avec un/une camarade sur un dilemme moral, en défendant des positions différentes.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Mon opinion sur un dilemme',
        description: 'Écris ton opinion argumentée sur un dilemme moral.',
        mission: 'Écris 200 à 250 mots présentant un dilemme moral et ta position, avec au moins une hypothèse au plus-que-parfait/conditionnel passé.',
        phrases: ['Si j’avais découvert que...', 'J’aurais probablement...', 'Cela dit, je comprends aussi...', 'Ce type de dilemme ne possède pas de réponse universelle.'],
        dialogue: [
          { speaker: 'Modèle', line: 'Si j’avais découvert qu’un ami avait menti pour un avantage injuste, j’aurais probablement essayé de lui en parler directement. Cela dit, je comprends aussi ceux qui choisiraient le silence, car ce type de dilemme ne possède pas de réponse universelle.', translation: 'Si hubiera descubierto que un amigo mintió por una ventaja injusta, probablemente habría intentado hablarlo directamente con él. Dicho esto, también entiendo a quienes eligieran el silencio, porque este tipo de dilema no tiene una respuesta universal.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 200 à 250 mots sur un dilemme moral, avec au moins une hypothèse au plus-que-parfait/conditionnel passé.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Hypothèse avec si + plus-que-parfait et le conditionnel passé',
        description: 'Formuler une hypothèse irréelle sur le passé et exprimer un regret ou un reproche.',
        grammarNote: 'Pour une hypothèse irréelle sur le passé : « Si + plus-que-parfait, conditionnel passé » : « Si j’avais su, je serais venu. » Le conditionnel passé (avoir/être au conditionnel présent + participe passé) exprime aussi un regret ou un reproche : « J’aurais dû lui parler. Tu aurais pu me le dire. »',
        phrases: ['Si j’avais su...', '..., j’aurais...', 'J’aurais dû...', 'Tu aurais pu...'],
        exercises: [
          { type: 'mcq', prompt: 'Si j’___ ce mensonge, j’aurais réagi immédiatement.', options: ['découvre', 'avais découvert', 'découvrirai', 'découvrais'], answer: 1 },
          { type: 'mcq', prompt: 'Si tu avais su, tu ___ différemment.', options: ['agis', 'agirais', 'aurais agi', 'agissais'], answer: 2 },
          { type: 'mcq', prompt: 'J’___ dû lui parler plus tôt.', options: ['ai', 'aurais', 'avais', 'aurai'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle structure exprime une hypothèse irréelle sur le passé ?', options: ['Si + présent, futur', 'Si + imparfait, conditionnel présent', 'Si + plus-que-parfait, conditionnel passé', 'Si + subjonctif, indicatif'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire des dilemmes éthiques',
        description: 'Le vocabulaire essentiel pour discuter d’éthique et de dilemmes moraux.',
        vocabulary: [
          { word: 'un dilemme', translation: 'un dilema', example: 'C’est un vrai dilemme moral.' },
          { word: 'une valeur', translation: 'un valor', example: 'L’honnêteté est une valeur importante pour moi.' },
          { word: 'juger', translation: 'juzgar', example: 'Il ne faut pas juger trop vite.' },
          { word: 'se mettre à la place de', translation: 'ponerse en el lugar de', example: 'Essaie de te mettre à sa place.' },
          { word: 'une désapprobation', translation: 'una desaprobación', example: 'Elle a exprimé sa désapprobation calmement.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « un dilemme » ?', options: ['Un dilema', 'Una solución', 'Una ley', 'Un premio'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « se mettre à la place de » ?', options: ['Ponerse en el lugar de', 'Alejarse de', 'Olvidarse de', 'Culpar a'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « juger » ?', options: ['Juzgar', 'Perdonar', 'Ignorar', 'Ayudar'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Un souvenir similaire',
        description: 'Camila raconte à Karim une situation similaire qu’elle a vécue à Tours.',
        intro: 'Camila appelle Karim pour lui raconter le dilemme du forum et un souvenir lié à leur année à Tours.',
        dialogue: [
          { speaker: 'Camila', line: 'Tu te souviens de la tricherie pendant l’examen, l’année dernière ?', translation: '¿Te acuerdas de la trampa durante el examen, el año pasado?' },
          { speaker: 'Karim', line: 'Oui, tu avais hésité longtemps avant de la signaler.', translation: 'Sí, habías dudado mucho antes de reportarla.' },
          { speaker: 'Camila', line: 'Exactement. Si j’avais su à quel point ce serait difficile, j’aurais peut-être réagi différemment.', translation: 'Exactamente. Si hubiera sabido lo difícil que sería, quizás habría reaccionado diferente.' },
          { speaker: 'Karim', line: 'Je pense que tu as fait le bon choix, malgré tout.', translation: 'Creo que tomaste la decisión correcta, a pesar de todo.' }
        ],
        phrases: ['Tu te souviens de... ?', 'Tu avais hésité...', 'Si j’avais su..., j’aurais...', 'Tu as fait le bon choix.'],
        exercises: [
          { type: 'mcq', prompt: 'À quel souvenir Camila fait-elle référence ?', options: ['Un voyage raté', 'Une tricherie pendant un examen', 'Une dispute avec Léa', 'Un accident de vélo'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit Camila sur sa réaction à l’époque ?', options: ['Elle avait réagi immédiatement', 'Elle avait hésité longtemps', 'Elle n’avait rien fait du tout', 'Elle avait menti elle-même'], answer: 1 },
          { type: 'mcq', prompt: 'Que pense Karim de la décision de Camila ?', options: ['Qu’elle a mal agi', 'Qu’elle a fait le bon choix', 'Qu’il ne sait pas', 'Qu’elle aurait dû ne rien dire'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'sciences-et-innovations',
    title: 'Sciences et innovations',
    titleEs: 'Ciencias e innovaciones',
    description: 'Karim partage un article de vulgarisation scientifique sur l’intelligence artificielle, et Camila apprend à discuter de sciences en français.',
    order: 8,
    accessTier: 'free',
    unitOverview: {
      objective: 'Comprendre et discuter d’un texte de vulgarisation scientifique avec nuance.',
      outcomes: [
        'comprendre un texte de vulgarisation scientifique',
        'exprimer une incertitude ou une probabilité scientifique',
        'utiliser des connecteurs de cause scientifique (étant donné que, dans la mesure où)',
        'nuancer une opinion sur une innovation technologique'
      ],
      grammar: ['subjonctif d’incertitude (il est possible que, il se peut que)', 'connecteurs de cause avancés (étant donné que, dans la mesure où)', 'expression de la probabilité'],
      vocabulary: ['l’intelligence artificielle', 'un algorithme', 'une avancée', 'les répercussions'],
      scenario: 'Karim, passionné de technologie, partage avec Camila un article sur l’intelligence artificielle et ses répercussions sur la société.'
    },
    activities: {
      reading: activity('reading', {
        title: 'L’article de Karim',
        description: 'Karim partage avec Camila un article de vulgarisation scientifique sur l’intelligence artificielle.',
        reading: {
          title: 'L’article de Karim',
          parts: [
            "Karim, qui envisage désormais des études d'informatique, envoie un jour à Camila un long article de vulgarisation scientifique sur l'intelligence artificielle, accompagné d'un message enthousiaste : « Il faut absolument que tu lises ça, c'est fascinant ! » L'article explique, en termes accessibles, comment fonctionnent les algorithmes d'apprentissage automatique, ces systèmes capables de « apprendre » à partir d'énormes quantités de données, sans qu'un humain ne leur explique explicitement chaque règle à suivre.",
            "Camila, intriguée mais aussi un peu inquiète, lit attentivement l'article et découvre que ces technologies sont déjà utilisées dans des domaines aussi variés que la médecine, la traduction automatique, ou même la création artistique. Étant donné que ces systèmes continuent de s'améliorer rapidement, l'article soulève une question qui préoccupe de nombreux chercheurs : quelles seront les répercussions de cette évolution sur le marché du travail dans les prochaines décennies ? Il se peut que certains métiers disparaissent complètement, tandis que d'autres, encore inimaginables aujourd'hui, verront le jour.",
            "En discutant de l'article par appel vidéo, Karim se montre optimiste : « Dans la mesure où l'intelligence artificielle reste un outil créé et contrôlé par des humains, je pense qu'elle peut nous aider à résoudre des problèmes complexes, comme certaines maladies ou le changement climatique. » Camila, elle, reste plus prudente : « Il est possible que tu aies raison, mais je pense aussi qu'il faut rester vigilant. Une technologie aussi puissante peut être utilisée pour le meilleur comme pour le pire, selon les intentions de ceux qui la contrôlent. »",
            "Cette conversation pousse Camila à réfléchir différemment à son propre projet professionnel : et si son futur métier de traductrice était, lui aussi, transformé par ces nouvelles technologies dans les années à venir ? Plutôt que de s'en inquiéter excessivement, elle décide d'adopter une attitude proactive : elle pourrait, par exemple, se spécialiser dans des domaines de traduction où la sensibilité culturelle et l'interprétation nuancée resteront difficilement remplaçables par une machine, quelle que soit la sophistication de ses algorithmes. Cette perspective la rassure, tout en confirmant l'importance de rester curieuse et informée face à un monde en perpétuelle évolution technologique."
          ],
          questions: [
            'De quel sujet l’article partagé par Karim traite-t-il ?',
            'Quelle question l’article soulève-t-il sur le marché du travail ?',
            'Comment Camila réagit-elle finalement à cette réflexion sur son propre avenir professionnel ?'
          ],
          ordering: {
            prompt: 'Remets les étapes de la conversation dans l’ordre.',
            events: [
              'Karim envoie l’article sur l’intelligence artificielle à Camila.',
              'Camila lit l’article et découvre ses domaines d’application.',
              'Karim et Camila débattent des risques et bénéfices par appel vidéo.',
              'Camila réfléchit à l’impact de ces technologies sur son propre projet professionnel.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce texte ?', options: ['D’un voyage scientifique', 'De la découverte de l’intelligence artificielle par Camila', 'D’un examen de mathématiques', 'D’un problème informatique de Karim'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : dans quels domaines l’article mentionne-t-il l’usage de l’IA ?', options: ['Seulement les jeux vidéo', 'La médecine, la traduction, la création artistique', 'Seulement l’agriculture', 'Seulement le sport'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle question l’article soulève-t-il sur le futur ?', options: ['Le prix des ordinateurs', 'Les répercussions sur le marché du travail', 'La couleur des robots', 'La vitesse d’internet'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la position de Karim sur l’intelligence artificielle ?', options: ['Complètement négative', 'Optimiste, tant qu’elle reste contrôlée par des humains', 'Indifférente', 'Il refuse d’en parler'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est la position de Camila ?', options: ['Totalement optimiste', 'Prudente, reconnaissant les deux côtés possibles', 'Complètement négative', 'Elle n’a pas d’opinion'], answer: 1 },
          { type: 'mcq', prompt: 'Cause et conséquence : pourquoi Camila décide-t-elle de se spécialiser dans certains domaines de traduction ?', options: ['Par hasard', 'Pour rester dans des domaines difficiles à remplacer par une machine', 'Parce que Karim le lui a ordonné', 'Parce que c’est plus facile'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « étant donné que » ?', options: ['Bien que', 'Parce que/vu que', 'Malgré', 'Sans que'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime une opinion ?', options: ['Karim envoie un article à Camila.', 'Une technologie aussi puissante peut être utilisée pour le meilleur comme pour le pire.', 'L’article explique le fonctionnement des algorithmes.', 'Camila lit attentivement l’article.'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : quelle attitude Camila adopte-t-elle finalement face à l’IA ?', options: ['Le déni complet', 'Une attitude proactive et curieuse', 'La peur paralysante', 'L’indifférence totale'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : quelle leçon générale peut-on tirer de ce texte ?', options: ['Il faut éviter toute nouvelle technologie', 'Il est important de rester informé et adaptable face au changement technologique', 'L’intelligence artificielle est totalement dangereuse', 'Le métier de traducteur va disparaître demain'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Un débat sur l’IA',
        description: 'Écoute Karim et Camila débattre des avantages et des risques de l’intelligence artificielle.',
        intro: 'Écoute la conversation par appel vidéo entre Karim et Camila au sujet de l’article.',
        dialogue: [
          { speaker: 'Karim', line: 'Dans la mesure où l’IA reste contrôlée par des humains, je pense qu’elle peut nous aider énormément.', translation: 'En la medida en que la IA siga siendo controlada por humanos, creo que puede ayudarnos enormemente.' },
          { speaker: 'Camila', line: 'Il est possible que tu aies raison, mais il faut aussi rester vigilant.', translation: 'Es posible que tengas razón, pero también hay que estar atentos.' },
          { speaker: 'Karim', line: 'Bien sûr, aucune technologie n’est neutre en soi.', translation: 'Claro, ninguna tecnología es neutral en sí misma.' },
          { speaker: 'Camila', line: 'Exactement, tout dépend de ceux qui la contrôlent.', translation: 'Exactamente, todo depende de quienes la controlan.' }
        ],
        phrases: ['Dans la mesure où...', 'Il est possible que...', 'Il faut rester vigilant.', 'Tout dépend de...'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle est la condition de l’optimisme de Karim ?', options: ['Que l’IA soit gratuite', 'Que l’IA reste contrôlée par des humains', 'Que l’IA remplace tous les métiers', 'Aucune condition'], answer: 1 },
          { type: 'mcq', prompt: 'Que répond Camila à Karim ?', options: ['Qu’il a complètement tort', 'Qu’il a peut-être raison, mais qu’il faut rester vigilant', 'Qu’elle est totalement d’accord sans réserve', 'Qu’elle ne veut plus en parler'], answer: 1 },
          { type: 'mcq', prompt: 'Sur quoi Karim et Camila sont-ils finalement d’accord ?', options: ['Que la technologie n’est jamais neutre', 'Que l’IA est complètement mauvaise', 'Que l’IA est complètement bonne', 'Ils ne sont d’accord sur rien'], answer: 0 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Discuter d’une innovation',
        description: 'Présente une innovation scientifique ou technologique avec des avantages et des risques.',
        mission: 'Présente une innovation scientifique ou technologique de ton choix, avec au moins une expression d’incertitude (il est possible que, il se peut que).',
        phrases: ['Étant donné que...', 'Il est possible que...', 'Il se peut que...', 'Dans la mesure où...'],
        dialogue: [
          { speaker: 'Toi', line: 'Étant donné que cette technologie évolue rapidement, il est possible qu’elle transforme complètement notre façon de travailler.', translation: 'Dado que esta tecnología evoluciona rápidamente, es posible que transforme completamente nuestra forma de trabajar.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente une innovation scientifique ou technologique, avec au moins une expression de probabilité/incertitude.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, débattez des avantages et des risques d’une technologie de votre choix.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Une réflexion sur la technologie',
        description: 'Écris une réflexion nuancée sur une innovation technologique.',
        mission: 'Écris 200 à 250 mots présentant une innovation technologique, ses avantages, ses risques potentiels, et ta propre position nuancée.',
        phrases: ['Étant donné que...', 'Il est possible que...', 'Dans la mesure où...', 'Il faut rester vigilant quant à...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Étant donné que l’intelligence artificielle continue de progresser rapidement, il est possible qu’elle transforme profondément le marché du travail. Dans la mesure où elle reste contrôlée par des humains responsables, elle peut néanmoins apporter de réels bénéfices à la société.', translation: 'Dado que la inteligencia artificial sigue progresando rápidamente, es posible que transforme profundamente el mercado laboral. En la medida en que siga siendo controlada por humanos responsables, puede sin embargo aportar reales beneficios a la sociedad.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 200 à 250 mots sur une innovation technologique, avec au moins un connecteur de cause avancé et une expression d’incertitude.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le subjonctif d’incertitude et les connecteurs de cause avancés',
        description: 'Exprimer une incertitude scientifique et utiliser étant donné que/dans la mesure où.',
        grammarNote: '« Il est possible que » et « il se peut que » introduisent le subjonctif pour exprimer une incertitude : « Il se peut que ce métier disparaisse. » « Étant donné que » et « dans la mesure où » introduisent une cause, suivies de l’indicatif : « Étant donné que la technologie évolue vite, il faut s’adapter. »',
        phrases: ['Il est possible que...', 'Il se peut que...', 'Étant donné que...', 'Dans la mesure où...'],
        exercises: [
          { type: 'mcq', prompt: 'Il se peut que certains métiers ___ dans le futur.', options: ['disparaissent', 'disparaissent', 'disparaîtront', 'disparaissaient'], answer: 0 },
          { type: 'mcq', prompt: '___ cette technologie évolue rapidement, il faut rester informé.', options: ['Étant donné que', 'Bien que', 'Pour que', 'Sans que'], answer: 0 },
          { type: 'mcq', prompt: 'Il est possible que tu ___ raison sur ce point.', options: ['as', 'aies', 'auras', 'avais'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle expression introduit l’indicatif, pas le subjonctif ?', options: ['Il est possible que', 'Il se peut que', 'Dans la mesure où', 'Il n’est pas certain que'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire des sciences et innovations',
        description: 'Le vocabulaire essentiel pour discuter de sciences et de technologie.',
        vocabulary: [
          { word: 'l’intelligence artificielle', translation: 'la inteligencia artificial', example: 'L’intelligence artificielle progresse très rapidement.' },
          { word: 'un algorithme', translation: 'un algoritmo', example: 'Cet algorithme apprend à partir de données.' },
          { word: 'une avancée', translation: 'un avance', example: 'C’est une avancée importante pour la médecine.' },
          { word: 'les répercussions', translation: 'las repercusiones', example: 'Quelles seront les répercussions sur le marché du travail ?' },
          { word: 'proactif / proactive', translation: 'proactivo/a', example: 'Elle adopte une attitude proactive face au changement.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « les répercussions » ?', options: ['Las repercusiones', 'Los algoritmos', 'Las máquinas', 'Los datos'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « une avancée » ?', options: ['Un avance', 'Un retraso', 'Un error', 'Un fracaso'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « proactif » ?', options: ['Proactivo', 'Pasivo', 'Indiferente', 'Confundido'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Un nouveau projet professionnel',
        description: 'Camila explique à Karim comment cette conversation a influencé son projet professionnel.',
        intro: 'Quelques jours plus tard, Camila rappelle Karim pour lui parler de sa réflexion.',
        dialogue: [
          { speaker: 'Camila', line: 'Notre conversation sur l’IA m’a vraiment fait réfléchir à mon métier futur.', translation: 'Nuestra conversación sobre la IA realmente me hizo reflexionar sobre mi futura profesión.' },
          { speaker: 'Karim', line: 'Ah oui ? Dans quel sens ?', translation: '¿Ah sí? ¿En qué sentido?' },
          { speaker: 'Camila', line: 'Je pense me spécialiser dans une traduction où la sensibilité culturelle compte énormément.', translation: 'Pienso especializarme en una traducción donde la sensibilidad cultural cuenta muchísimo.' },
          { speaker: 'Karim', line: 'C’est une excellente idée, ça, une machine ne pourra jamais vraiment le remplacer.', translation: 'Es una excelente idea, eso una máquina nunca podrá reemplazarlo realmente.' }
        ],
        phrases: ['Ça m’a fait réfléchir à...', 'Dans quel sens ?', 'Je pense me spécialiser dans...', 'Une machine ne pourra jamais...'],
        exercises: [
          { type: 'mcq', prompt: 'Comment la conversation sur l’IA a-t-elle influencé Camila ?', options: ['Elle a abandonné son projet de traduction', 'Elle a décidé de se spécialiser dans un domaine résistant à l’automatisation', 'Elle veut maintenant étudier l’informatique', 'Elle n’a rien changé du tout'], answer: 1 },
          { type: 'mcq', prompt: 'Que pense Karim de cette nouvelle idée ?', options: ['Qu’elle est mauvaise', 'Que c’est une excellente idée', 'Il n’a pas d’opinion', 'Qu’elle devrait changer complètement de métier'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi Karim pense-t-il qu’une machine ne pourra pas remplacer ce domaine ?', options: ['Parce que c’est trop cher', 'Parce que la sensibilité culturelle est difficile à automatiser', 'Parce que les machines n’existent pas encore', 'Parce que c’est illégal'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'histoire-et-memoire',
    title: 'Histoire et mémoire',
    titleEs: 'Historia y memoria',
    description: 'En regardant un documentaire avec sa grand-mère, Camila explore l’histoire partagée de la Caraïbe francophone et hispanophone.',
    order: 9,
    accessTier: 'free',
    unitOverview: {
      objective: 'Comprendre un récit historique et discuter de la mémoire collective avec nuance.',
      outcomes: [
        'comprendre un récit historique complexe',
        'discuter de la mémoire collective et de ses interprétations multiples',
        'utiliser les pronoms démonstratifs (celui, celle, ceux, celles)',
        'nuancer un point de vue sur un événement historique sensible'
      ],
      grammar: ['pronoms démonstratifs (celui, celle, ceux, celles, celui-ci/celui-là)', 'l’accord du participe passé avec avoir (complément direct antéposé)', 'expressions de la mémoire historique'],
      vocabulary: ['la mémoire collective', 'un héritage', 'une perspective', 'transmettre'],
      scenario: 'Camila regarde un documentaire sur l’histoire partagée d’Haïti et de la République dominicaine avec sa grand-mère, qui lui raconte ses propres souvenirs familiaux.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Le documentaire avec grand-mère',
        description: 'Camila regarde un documentaire historique avec sa grand-mère, qui partage ses propres souvenirs familiaux.',
        reading: {
          title: 'Le documentaire avec grand-mère',
          parts: [
            "Un dimanche après-midi, Camila regarde avec sa grand-mère un documentaire consacré à l'histoire partagée, complexe et parfois douloureuse, entre Haïti et la République dominicaine, deux pays qui se partagent la même île des Caraïbes. Le documentaire, réalisé par un historien francophone, explore différentes perspectives sur cette histoire commune, en donnant la parole à des chercheurs des deux côtés de la frontière. « C'est fascinant, mais aussi assez difficile à regarder », confie Camila à sa grand-mère, en pensant à certains épisodes évoqués dans le film.",
            "Sa grand-mère, qui a vécu une partie de cette histoire à travers les récits que lui racontait sa propre mère, ajoute une dimension personnelle à ce que raconte le documentaire. « Celle dont je me souviens le mieux, c'est l'histoire de ta arrière-arrière-grand-mère, qui avait accueilli chez elle des voisins haïtiens pendant une période particulièrement troublée », raconte-t-elle. « Ce sont des histoires que l'on a longtemps préféré taire dans la famille, mais je pense qu'il est important que tu les connaisses aujourd'hui, pour comprendre d'où tu viens vraiment. »",
            "Camila, profondément touchée par ce témoignage, réalise à quel point la mémoire collective d'un pays est souvent constituée de multiples récits individuels, parfois contradictoires, que l'histoire officielle ne raconte que partiellement. Elle repense également à la diversité culturelle qu'elle a découverte pendant son année en France, où elle avait déjà commencé à réfléchir à la façon dont chaque pays construit sa propre version des événements historiques, en fonction de la perspective de celui qui les raconte.",
            "En fin de soirée, Camila remercie sa grand-mère pour ce moment de partage inattendu. « J'aimerais beaucoup que tu me racontes davantage ces histoires familiales, celles que je n'ai jamais entendues », lui dit-elle avec sincérité. Sa grand-mère sourit, visiblement émue par cet intérêt, et promet de continuer ces récits lors de leurs prochains dimanches ensemble. Camila comprend alors que la transmission de la mémoire, loin d'être un simple exercice académique, constitue aussi un acte profondément intime entre les générations, un fil invisible qui relie le passé de sa famille à ce qu'elle est en train de devenir, entre deux cultures et deux continents."
          ],
          questions: [
            'Quel est le sujet principal du documentaire regardé par Camila et sa grand-mère ?',
            'Quelle histoire personnelle la grand-mère de Camila raconte-t-elle ?',
            'Quelle réflexion Camila tire-t-elle sur la mémoire collective ?'
          ],
          ordering: {
            prompt: 'Remets les moments de l’après-midi dans l’ordre.',
            events: [
              'Camila et sa grand-mère commencent à regarder le documentaire.',
              'La grand-mère raconte l’histoire de l’arrière-arrière-grand-mère de Camila.',
              'Camila réfléchit à la nature multiple de la mémoire collective.',
              'Camila demande à sa grand-mère de lui raconter davantage d’histoires familiales.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce documentaire ?', options: ['D’un film de fiction', 'De l’histoire partagée entre Haïti et la République dominicaine', 'D’un voyage touristique', 'D’un problème économique actuel'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : qui a réalisé le documentaire ?', options: ['La grand-mère de Camila', 'Un historien francophone', 'Camila elle-même', 'Un journaliste dominicain'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle histoire personnelle la grand-mère raconte-t-elle ?', options: ['Un voyage en Europe', 'L’accueil de voisins haïtiens par une ancêtre', 'Un mariage familial', 'Un conflit avec des voisins'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi cette histoire n’avait-elle jamais été racontée avant, selon la grand-mère ?', options: ['Parce qu’elle l’avait oubliée', 'Parce que la famille avait préféré la taire', 'Parce que c’est un secret d’État', 'Parce que personne ne s’y intéressait'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : pourquoi ce témoignage touche-t-il particulièrement Camila ?', options: ['Parce qu’elle ne connaît pas sa grand-mère', 'Parce qu’il révèle une partie inconnue de son histoire familiale', 'Parce qu’il est raconté en français', 'Parce que c’est amusant'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle réflexion Camila fait-elle sur la mémoire collective ?', options: ['Qu’elle est toujours identique pour tout le monde', 'Qu’elle est faite de récits individuels multiples et parfois contradictoires', 'Qu’elle n’a aucune importance', 'Qu’elle ne change jamais'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « un fil invisible qui relie le passé... » ?', options: ['Un objet physique', 'Un lien symbolique entre les générations', 'Un problème technique', 'Une erreur historique'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime une opinion de Camila ?', options: ['Le documentaire a été réalisé par un historien francophone.', 'C’est fascinant, mais aussi assez difficile à regarder.', 'Sa grand-mère raconte une histoire familiale.', 'Camila remercie sa grand-mère en fin de soirée.'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : que représente la transmission de la mémoire pour Camila, selon la fin du texte ?', options: ['Un simple exercice scolaire', 'Un acte intime qui relie les générations', 'Une perte de temps', 'Une obligation ennuyeuse'], answer: 1 },
          { type: 'mcq', prompt: 'Intention communicative : pourquoi Camila demande-t-elle à sa grand-mère de lui raconter davantage d’histoires ?', options: ['Par simple politesse', 'Parce qu’elle veut sincèrement mieux comprendre d’où elle vient', 'Parce qu’un professeur le lui a demandé', 'Parce qu’elle doit écrire un devoir'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Le récit de grand-mère',
        description: 'Écoute la grand-mère de Camila raconter un souvenir familial.',
        intro: 'Écoute la grand-mère de Camila partager un souvenir familial lié au documentaire.',
        dialogue: [
          { speaker: 'La grand-mère', line: 'Celle dont je me souviens le mieux, c’est l’histoire de ton arrière-arrière-grand-mère.', translation: 'La que mejor recuerdo es la historia de tu tatarabuela.' },
          { speaker: 'Camila', line: 'Raconte-moi, s’il te plaît, je ne connais pas cette histoire.', translation: 'Cuéntame, por favor, no conozco esa historia.' },
          { speaker: 'La grand-mère', line: 'Elle avait accueilli des voisins haïtiens chez elle, pendant une période très difficile.', translation: 'Ella había acogido a vecinos haitianos en su casa, durante un período muy difícil.' },
          { speaker: 'Camila', line: 'C’est une histoire incroyable, merci de me la raconter enfin.', translation: 'Es una historia increíble, gracias por contármela por fin.' }
        ],
        phrases: ['Celle dont je me souviens le mieux...', 'Raconte-moi, s’il te plaît.', 'Elle avait accueilli...', 'Merci de me la raconter.'],
        exercises: [
          { type: 'mcq', prompt: 'De qui la grand-mère se souvient-elle le mieux ?', options: ['De sa propre mère', 'De l’arrière-arrière-grand-mère de Camila', 'D’une voisine actuelle', 'D’une amie d’école'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’avait fait cette ancêtre ?', options: ['Elle avait voyagé en Europe', 'Elle avait accueilli des voisins haïtiens chez elle', 'Elle avait écrit un livre', 'Elle avait fondé une école'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila réagit-elle à ce récit ?', options: ['Avec indifférence', 'Avec gratitude et intérêt', 'Avec colère', 'Avec incrédulité'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Raconter une histoire familiale',
        description: 'Présente un souvenir ou une histoire transmise dans ta famille.',
        mission: 'Présente une histoire familiale (réelle ou imaginaire) qui t’a été transmise, avec au moins un pronom démonstratif (celui, celle, ceux, celles).',
        phrases: ['Celle dont je me souviens le plus, c’est...', 'On m’a raconté que...', 'C’est une histoire qui...', 'Cela m’aide à comprendre d’où je viens.'],
        dialogue: [
          { speaker: 'Toi', line: 'Celle dont je me souviens le plus, c’est l’histoire de... On m’a raconté que... Cela m’aide à comprendre d’où je viens.', translation: 'La que más recuerdo es la historia de... Me contaron que... Eso me ayuda a entender de dónde vengo.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Raconte une histoire familiale transmise, avec un pronom démonstratif.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, échangez sur une tradition ou un récit transmis dans vos familles respectives.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Un récit de mémoire familiale',
        description: 'Écris le récit d’une histoire transmise dans ta famille.',
        mission: 'Écris 200 à 250 mots racontant une histoire familiale (réelle ou imaginaire) transmise par un membre de ta famille, avec au moins un pronom démonstratif.',
        phrases: ['Celle/celui dont je me souviens le mieux...', 'On m’a longtemps caché que...', 'Aujourd’hui, je comprends que...', 'Cette histoire fait partie de qui je suis.'],
        dialogue: [
          { speaker: 'Modèle', line: 'Celle dont je me souviens le mieux, c’est l’histoire que ma grand-mère m’a racontée un dimanche après-midi. On m’avait longtemps caché cette partie de notre histoire familiale. Aujourd’hui, je comprends que cette histoire fait partie de qui je suis.', translation: 'La que más recuerdo es la historia que mi abuela me contó un domingo por la tarde. Durante mucho tiempo me habían ocultado esa parte de nuestra historia familiar. Hoy entiendo que esa historia es parte de quien soy.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 200 à 250 mots sur une histoire familiale transmise, avec un pronom démonstratif et un participe passé accordé correctement.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Les pronoms démonstratifs et l’accord du participe passé',
        description: 'Utiliser celui/celle/ceux/celles et accorder le participe passé avec un complément direct antéposé.',
        grammarNote: 'Les pronoms démonstratifs (celui, celle, ceux, celles) remplacent un nom déjà mentionné : « Celle dont je me souviens le mieux... » Avec avoir, le participe passé s’accorde avec le complément d’objet direct seulement s’il est placé avant le verbe : « Cette histoire, je l’ai entendue hier » (accord avec « l’ », féminin).',
        phrases: ['Celui/celle dont...', 'Ceux/celles qui...', 'Cette histoire, je l’ai entendue...', 'Les récits qu’elle nous a racontés...'],
        exercises: [
          { type: 'mcq', prompt: '___ dont je me souviens le mieux, c’est cette histoire.', options: ['Celui', 'Celle', 'Ceux', 'Celles'], answer: 1 },
          { type: 'mcq', prompt: 'Cette histoire, je l’ai ___ hier soir.', options: ['entendu', 'entendue', 'entendus', 'entendues'], answer: 1 },
          { type: 'mcq', prompt: 'Les récits qu’elle nous a ___ étaient émouvants.', options: ['raconté', 'racontée', 'racontés', 'racontant'], answer: 2 },
          { type: 'mcq', prompt: 'Quand le participe passé avec avoir s’accorde-t-il avec le complément direct ?', options: ['Toujours', 'Jamais', 'Quand le complément est placé avant le verbe', 'Seulement au féminin'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de la mémoire et de l’histoire',
        description: 'Le vocabulaire essentiel pour discuter de mémoire collective et d’histoire familiale.',
        vocabulary: [
          { word: 'la mémoire collective', translation: 'la memoria colectiva', example: 'La mémoire collective se construit à partir de récits multiples.' },
          { word: 'un héritage', translation: 'una herencia', example: 'Cette histoire fait partie de mon héritage familial.' },
          { word: 'une perspective', translation: 'una perspectiva', example: 'Chaque témoin apporte une perspective différente.' },
          { word: 'transmettre', translation: 'transmitir', example: 'Elle veut transmettre cette histoire à ses petits-enfants.' },
          { word: 'un témoignage', translation: 'un testimonio', example: 'Son témoignage était très émouvant.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « transmettre » ?', options: ['Transmitir', 'Olvidar', 'Ocultar', 'Inventar'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « un héritage » ?', options: ['Una herencia', 'Un secreto', 'Un problema', 'Un viaje'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « un témoignage » ?', options: ['Un testimonio', 'Un documental', 'Un libro', 'Una película'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Partager avec Sofía',
        description: 'Camila raconte à Sofía ce qu’elle a appris de sa grand-mère.',
        intro: 'Le lendemain, Camila partage avec Sofía l’histoire familiale qu’elle vient de découvrir.',
        dialogue: [
          { speaker: 'Camila', line: 'Ma grand-mère m’a raconté une histoire familiale incroyable hier.', translation: 'Mi abuela me contó una historia familiar increíble ayer.' },
          { speaker: 'Sofía', line: 'Vraiment ? Raconte-moi tout !', translation: '¿En serio? ¡Cuéntamelo todo!' },
          { speaker: 'Camila', line: 'C’est l’histoire de notre arrière-arrière-grand-mère, que je ne connaissais pas du tout.', translation: 'Es la historia de nuestra tatarabuela, que no conocía en absoluto.' },
          { speaker: 'Sofía', line: 'C’est précieux de connaître ce genre d’histoire, ça ne se perd pas facilement.', translation: 'Es valioso conocer ese tipo de historia, no se pierde fácilmente.' }
        ],
        phrases: ['Elle m’a raconté une histoire incroyable.', 'Raconte-moi tout !', 'Que je ne connaissais pas du tout.', 'C’est précieux de...'],
        exercises: [
          { type: 'mcq', prompt: 'Qu’a raconté la grand-mère de Camila ?', options: ['Une recette de cuisine', 'Une histoire familiale incroyable', 'Un problème de voisinage', 'Une histoire inventée'], answer: 1 },
          { type: 'mcq', prompt: 'Camila connaissait-elle déjà cette histoire ?', options: ['Oui, très bien', 'Non, pas du tout', 'Un peu seulement', 'Elle ne le précise pas'], answer: 1 },
          { type: 'mcq', prompt: 'Que pense Sofía de cette découverte ?', options: ['Que ce n’est pas important', 'Que c’est précieux de connaître ce genre d’histoire', 'Qu’elle préfère ne pas en entendre parler', 'Qu’elle n’y croit pas'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'ecologie-et-engagement-citoyen',
    title: 'Écologie et engagement citoyen',
    titleEs: 'Ecología y compromiso ciudadano',
    description: 'Camila rejoint un groupe de jeunes engagés pour la protection des mangroves de Saint-Domingue et rédige une pétition en français pour un partenariat associatif.',
    order: 10,
    accessTier: 'free',
    unitOverview: {
      objective: 'Exprimer un but et une opinion négative nuancée dans un contexte d’engagement citoyen.',
      outcomes: [
        'exprimer un but avec afin que + subjonctif',
        'formuler une opinion négative nuancée (je ne pense pas que + subjonctif)',
        'rédiger une pétition ou un appel à l’action structuré',
        'comparer des politiques environnementales avec des comparatifs avancés'
      ],
      grammar: ['expression du but (afin que, pour que + subjonctif)', 'opinion négative + subjonctif (je ne pense pas que, je ne crois pas que)', 'comparatifs et superlatifs dans un contexte argumentatif'],
      vocabulary: ['une mangrove', 'la biodiversité', 'un engagement citoyen', 'une pétition'],
      scenario: 'Camila rejoint un groupe de jeunes bénévoles qui protège les mangroves près de Saint-Domingue et doit rédiger, en français, une demande de partenariat à une association francophone.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Sauver les mangroves',
        description: 'Camila rejoint un groupe de bénévoles engagés dans la protection des mangroves et rédige une demande de partenariat en français.',
        reading: {
          title: 'Sauver les mangroves',
          parts: [
            "Depuis quelques semaines, Camila consacre une partie de ses week-ends à un groupe de jeunes bénévoles engagés dans la protection des mangroves situées près de Saint-Domingue, un écosystème essentiel mais gravement menacé par la construction immobilière incontrôlée et la pollution plastique. « Les mangroves abritent une biodiversité extraordinaire, en plus de protéger la côte contre l'érosion », lui explique Ana, la coordinatrice du groupe, lors de sa première sortie sur le terrain. Camila, immédiatement séduite par ce projet concret, décide de s'impliquer activement.",
            "Lorsque le groupe apprend qu'une association environnementale francophone basée en Guadeloupe mène des projets similaires de restauration de mangroves, Ana propose d'établir un partenariat afin que les deux organisations puissent échanger leurs connaissances et leurs méthodes de travail. Étant donné les compétences linguistiques de Camila, on lui confie naturellement la tâche de rédiger le courrier officiel en français, afin que le message soit compris sans ambiguïté et transmette efficacement le sérieux de leur démarche.",
            "Dans sa lettre, Camila explique en détail les actions déjà menées par le groupe : nettoyage régulier des zones côtières, plantation de nouvelles pousses de palétuviers, et sensibilisation des habitants locaux. « Je ne pense pas que ces problèmes environnementaux puissent être résolus isolément par un seul pays », écrit-elle avec conviction. « C'est pourquoi nous croyons qu'un partenariat international, aussi modeste soit-il au départ, pourrait avoir un impact bien plus important que des actions purement locales et isolées. » Elle ajoute que le climat des Caraïbes, plus vulnérable que celui de nombreuses autres régions du monde, exige une coopération régionale renforcée entre pays voisins, quelle que soit leur langue officielle.",
            "Quelques semaines après l'envoi de la lettre, l'association guadeloupéenne répond favorablement, proposant même d'organiser une visioconférence entre les deux groupes de bénévoles. Camila, fière du rôle qu'elle a joué dans cette collaboration naissante, réalise à quel point ses compétences en français, qu'elle percevait initialement comme un simple atout académique, peuvent également devenir un véritable outil d'engagement citoyen et de solidarité internationale, bien au-delà de ce qu'elle avait imaginé au début de son apprentissage. Elle se promet, dès ce jour-là, de continuer à défendre ce type de coopération régionale tout au long de ses futures études universitaires."
          ],
          questions: [
            'Pourquoi les mangroves sont-elles importantes, selon Ana ?',
            'Pourquoi confie-t-on à Camila la rédaction de la lettre en français ?',
            'Comment l’association guadeloupéenne répond-elle à la demande de partenariat ?'
          ],
          ordering: {
            prompt: 'Remets les événements de cette collaboration dans l’ordre.',
            events: [
              'Camila rejoint le groupe de protection des mangroves.',
              'Ana propose un partenariat avec une association guadeloupéenne.',
              'Camila rédige la lettre officielle en français.',
              'L’association guadeloupéenne répond favorablement.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce texte ?', options: ['D’un voyage en Guadeloupe', 'De l’engagement de Camila pour la protection des mangroves', 'D’un cours de biologie', 'D’un problème administratif'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : quelles menaces pèsent sur les mangroves ?', options: ['Le froid et la neige', 'La construction immobilière et la pollution plastique', 'Les tremblements de terre', 'Les incendies'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi confie-t-on la lettre à Camila ?', options: ['Parce qu’elle est la plus âgée', 'Grâce à ses compétences en français', 'Parce qu’elle a le plus de temps libre', 'Par tirage au sort'], answer: 1 },
          { type: 'mcq', prompt: 'Quelles actions le groupe mène-t-il déjà ?', options: ['Seulement des réunions', 'Nettoyage, plantation, sensibilisation', 'Uniquement des dons financiers', 'Rien de concret'], answer: 1 },
          { type: 'mcq', prompt: 'Que pense Camila de la résolution isolée des problèmes environnementaux ?', options: ['Qu’elle est suffisante', 'Qu’elle n’est probablement pas suffisante', 'Elle n’a pas d’avis', 'Qu’elle est la seule solution possible'], answer: 1 },
          { type: 'mcq', prompt: 'Comment répond l’association guadeloupéenne ?', options: ['Elle refuse la proposition', 'Elle répond favorablement et propose une visioconférence', 'Elle ne répond jamais', 'Elle demande de l’argent'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « afin que » ?', options: ['Bien que', 'Pour que/dans le but que', 'Malgré', 'Sans que'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime une opinion ?', options: ['Le groupe nettoie les zones côtières.', 'Je ne pense pas que ces problèmes puissent être résolus isolément.', 'Ana est la coordinatrice du groupe.', 'La lettre est envoyée en français.'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : que révèle cette expérience sur la vision de Camila concernant le français ?', options: ['Qu’elle regrette de l’avoir appris', 'Qu’il peut devenir un outil d’engagement citoyen, pas seulement académique', 'Qu’elle veut l’abandonner', 'Qu’il ne sert à rien dans la vie réelle'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : quel message général ce texte transmet-il ?', options: ['Les problèmes environnementaux ne concernent qu’un seul pays', 'La coopération internationale peut renforcer l’action environnementale locale', 'Il est inutile d’agir localement', 'Les langues étrangères ne servent qu’à voyager'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Une sortie sur le terrain',
        description: 'Écoute Ana expliquer à Camila l’importance des mangroves lors de leur première sortie.',
        intro: 'Écoute Ana présenter le projet de protection des mangroves à Camila.',
        dialogue: [
          { speaker: 'Ana', line: 'Les mangroves protègent la côte et abritent une biodiversité incroyable.', translation: 'Los manglares protegen la costa y albergan una biodiversidad increíble.' },
          { speaker: 'Camila', line: 'Je ne savais pas qu’elles étaient si importantes.', translation: 'No sabía que eran tan importantes.' },
          { speaker: 'Ana', line: 'Malheureusement, elles sont menacées par la construction et la pollution.', translation: 'Lamentablemente, están amenazadas por la construcción y la contaminación.' },
          { speaker: 'Camila', line: 'Je veux vraiment aider à les protéger, comment puis-je m’impliquer ?', translation: 'Realmente quiero ayudar a protegerlas, ¿cómo puedo involucrarme?' }
        ],
        phrases: ['Elles protègent...', 'Je ne savais pas que...', 'Elles sont menacées par...', 'Comment puis-je m’impliquer ?'],
        exercises: [
          { type: 'mcq', prompt: 'Que protègent les mangroves, selon Ana ?', options: ['Rien de particulier', 'La côte et la biodiversité', 'Seulement les poissons', 'Les routes'], answer: 1 },
          { type: 'mcq', prompt: 'Quelles menaces pèsent sur les mangroves ?', options: ['Le vent', 'La construction et la pollution', 'Les oiseaux', 'Le soleil'], answer: 1 },
          { type: 'mcq', prompt: 'Que veut faire Camila après cette explication ?', options: ['Partir immédiatement', 'S’impliquer pour aider à les protéger', 'Ignorer le problème', 'Changer de sujet'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Présenter une cause environnementale',
        description: 'Présente une cause environnementale et exprime un but précis.',
        mission: 'Présente une cause environnementale qui te tient à cœur, avec au moins une expression de but (afin que/pour que) et une opinion négative nuancée.',
        phrases: ['Afin que...', 'Je ne pense pas que...', 'Il est essentiel de...', 'Cette cause me tient à cœur parce que...'],
        dialogue: [
          { speaker: 'Toi', line: 'Je m’engage pour cette cause afin que les générations futures puissent en profiter aussi. Je ne pense pas qu’on puisse résoudre ce problème sans action collective.', translation: 'Me comprometo con esta causa para que las generaciones futuras también puedan disfrutarla. No creo que podamos resolver este problema sin acción colectiva.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente une cause environnementale qui te tient à cœur, avec « afin que » et une opinion négative nuancée.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, imaginez une petite action citoyenne que vous pourriez organiser ensemble.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Une lettre de partenariat',
        description: 'Rédige une lettre formelle proposant un partenariat pour une cause environnementale.',
        mission: 'Écris 200 à 250 mots sous forme de lettre proposant un partenariat pour une cause environnementale, avec au moins « afin que » et une opinion négative nuancée.',
        phrases: ['Nous vous écrivons afin que...', 'Je ne pense pas que... isolément.', 'Notre groupe mène déjà...', 'Nous espérons vivement collaborer avec vous.'],
        dialogue: [
          { speaker: 'Modèle', line: 'Nous vous écrivons afin que nos deux associations puissent collaborer sur ce projet environnemental. Je ne pense pas que ces problèmes puissent être résolus isolément. Notre groupe mène déjà des actions concrètes sur le terrain, et nous espérons vivement collaborer avec vous.', translation: 'Le escribimos para que nuestras dos asociaciones puedan colaborar en este proyecto ambiental. No creo que estos problemas puedan resolverse de forma aislada. Nuestro grupo ya lleva a cabo acciones concretas sobre el terreno, y esperamos con interés colaborar con ustedes.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris une lettre de partenariat de 200 à 250 mots pour une cause environnementale, avec « afin que » et une opinion négative au subjonctif.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le but (afin que) et l’opinion négative (subjonctif)',
        description: 'Exprimer un but avec afin que/pour que et une opinion négative avec le subjonctif.',
        grammarNote: '« Afin que » et « pour que » expriment un but et sont suivis du subjonctif : « Nous agissons afin que la biodiversité soit préservée. » Les verbes d’opinion à la forme négative (je ne pense pas que, je ne crois pas que) sont aussi suivis du subjonctif, car ils expriment un doute : « Je ne pense pas que ce soit suffisant. »',
        phrases: ['Afin que...', 'Pour que...', 'Je ne pense pas que...', 'Je ne crois pas que...'],
        exercises: [
          { type: 'mcq', prompt: 'Nous agissons afin que la biodiversité ___ préservée.', options: ['est', 'soit', 'sera', 'était'], answer: 1 },
          { type: 'mcq', prompt: 'Je ne pense pas que ce problème ___ facile à résoudre.', options: ['est', 'soit', 'sera', 'était'], answer: 1 },
          { type: 'mcq', prompt: 'Elle écrit cette lettre pour que le message ___ bien compris.', options: ['est', 'soit', 'sera', 'était'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle structure exprime un but ?', options: ['Parce que', 'Afin que', 'Donc', 'Cependant'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de l’écologie et de l’engagement citoyen',
        description: 'Le vocabulaire essentiel pour parler d’écologie et d’engagement citoyen.',
        vocabulary: [
          { word: 'une mangrove', translation: 'un manglar', example: 'Les mangroves protègent la côte contre l’érosion.' },
          { word: 'la biodiversité', translation: 'la biodiversidad', example: 'Cet écosystème abrite une riche biodiversité.' },
          { word: 'un engagement citoyen', translation: 'un compromiso ciudadano', example: 'Son engagement citoyen est admirable.' },
          { word: 'une pétition', translation: 'una petición', example: 'Ils ont lancé une pétition pour protéger les mangroves.' },
          { word: 'un partenariat', translation: 'una alianza/asociación', example: 'Les deux groupes ont établi un partenariat.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « la biodiversité » ?', options: ['La biodiversidad', 'La contaminación', 'El clima', 'El turismo'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « un partenariat » ?', options: ['Una alianza', 'Un conflicto', 'Una queja', 'Una donación'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « un engagement citoyen » ?', options: ['Un compromiso ciudadano', 'Un impuesto', 'Una elección', 'Un examen'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'La réponse de la Guadeloupe',
        description: 'Camila reçoit la réponse favorable de l’association guadeloupéenne et l’annonce au groupe.',
        intro: 'Camila annonce avec enthousiasme la réponse reçue de l’association francophone.',
        dialogue: [
          { speaker: 'Camila', line: 'Ils ont répondu ! L’association guadeloupéenne accepte le partenariat !', translation: '¡Respondieron! ¡La asociación guadalupeña acepta la alianza!' },
          { speaker: 'Ana', line: 'C’est une excellente nouvelle, bravo pour cette lettre !', translation: '¡Es una excelente noticia, felicidades por esa carta!' },
          { speaker: 'Camila', line: 'Ils proposent même d’organiser une visioconférence entre nos deux groupes.', translation: 'Incluso proponen organizar una videoconferencia entre nuestros dos grupos.' },
          { speaker: 'Ana', line: 'Ton français nous a vraiment été utile pour ce projet.', translation: 'Tu francés realmente nos fue útil para este proyecto.' }
        ],
        phrases: ['Ils ont répondu !', 'C’est une excellente nouvelle.', 'Ils proposent de...', 'Ça nous a été utile.'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle nouvelle Camila annonce-t-elle ?', options: ['Le refus du partenariat', 'L’acceptation du partenariat', 'Un problème technique', 'Un changement de projet'], answer: 1 },
          { type: 'mcq', prompt: 'Que propose l’association guadeloupéenne ?', options: ['Rien de particulier', 'Une visioconférence entre les deux groupes', 'Une visite immédiate', 'De l’argent'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit Ana sur le rôle du français de Camila ?', options: ['Qu’il n’a servi à rien', 'Qu’il a été vraiment utile pour ce projet', 'Qu’elle aurait dû écrire en espagnol', 'Qu’elle ne comprend pas le français'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'art-et-creativite',
    title: 'Art et créativité',
    titleEs: 'Arte y creatividad',
    description: 'Camila interviewe, pour son blog, une artiste peintre franco-dominicaine qui explore l’identité caribéenne dans son travail.',
    order: 11,
    accessTier: 'free',
    unitOverview: {
      objective: 'Mener une interview structurée et rapporter des propos sur le processus créatif.',
      outcomes: [
        'préparer et mener une interview structurée',
        'rapporter les propos d’un artiste avec précision',
        'utiliser des comparatifs et superlatifs avancés dans un contexte artistique',
        'décrire un processus créatif avec un vocabulaire précis'
      ],
      grammar: ['comparatifs et superlatifs avancés (autant que, de moins en moins)', 'discours rapporté (révision élargie)', 'expressions du processus créatif'],
      vocabulary: ['une œuvre', 'un processus créatif', 's’inspirer de', 'une exposition'],
      scenario: 'Pour son blog, Camila interviewe une artiste peintre franco-dominicaine dont le travail explore l’identité caribéenne.'
    },
    activities: {
      reading: activity('reading', {
        title: 'L’interview de l’artiste',
        description: 'Camila interviewe une artiste peintre franco-dominicaine pour son blog, et découvre son processus créatif.',
        reading: {
          title: 'L’interview de l’artiste',
          parts: [
            "Pour la nouvelle série d'articles qu'elle a commencé à publier sur son blog, Camila décide d'interviewer Mireille, une artiste peintre franco-dominicaine dont le travail, exposé récemment dans une petite galerie de Saint-Domingue, explore les thèmes de l'identité caribéenne et du métissage culturel. Avant leur rencontre, Camila prépare soigneusement une liste de questions, consciente que la qualité de son interview dépendra autant de sa préparation que de sa capacité d'écoute pendant l'échange.",
            "Lors de l'entretien, Mireille explique que son processus créatif commence toujours par une longue période d'observation, avant même de toucher un pinceau. « Je m'inspire énormément des couleurs et des textures que je retrouve dans mon quotidien : le bleu de la mer des Caraïbes, mais aussi celui du ciel de Bretagne où j'ai grandi », confie-t-elle. Elle ajoute que, plus elle avance dans sa carrière, plus elle se sent libre de mélanger des influences visuelles a priori très différentes, sans chercher à les opposer artificiellement.",
            "Camila lui demande alors si elle a déjà rencontré des difficultés à faire reconnaître un travail artistique qui refuse justement de se laisser enfermer dans une seule catégorie culturelle. Mireille répond avec sincérité : « Au début de ma carrière, on me demandait souvent de choisir un camp, comme si je devais absolument me définir comme artiste française ou comme artiste caribéenne. Aujourd'hui, je reçois de moins en moins ce genre de remarque, sans doute parce que le public est devenu plus habitué à des identités multiples et complexes. » Elle explique également que sa dernière exposition, la plus personnelle qu'elle ait jamais réalisée, a été particulièrement bien accueillie par la critique, ce qui la conforte dans cette direction artistique.",
            "En terminant la rédaction de son article, Camila réalise à quel point cette conversation résonne avec sa propre expérience entre deux cultures. Elle décide de conclure son texte par une citation de Mireille qui l'a particulièrement marquée : « Je ne crois pas qu'il faille choisir entre ses différentes appartenances culturelles. Au contraire, c'est précisément dans cette tension créative que naît, selon moi, ce qu'il y a de plus authentique dans une œuvre. » Camila publie son article avec une fierté particulière, consciente d'avoir su, cette fois-ci, poser les bonnes questions."
          ],
          questions: [
            'Quel thème l’œuvre de Mireille explore-t-elle ?',
            'Comment Mireille décrit-elle son processus créatif ?',
            'Comment a évolué la perception du public sur son travail au fil du temps ?'
          ],
          ordering: {
            prompt: 'Remets les étapes de l’interview dans l’ordre.',
            events: [
              'Camila prépare soigneusement une liste de questions.',
              'Mireille explique son processus créatif basé sur l’observation.',
              'Mireille parle de la difficulté initiale à faire reconnaître son travail hybride.',
              'Camila publie son article en concluant sur une citation de Mireille.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce texte ?', options: ['D’une exposition d’art à Paris', 'D’une interview de Camila avec une artiste franco-dominicaine', 'D’un cours de peinture', 'D’un problème avec le blog de Camila'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : quel thème explore le travail de Mireille ?', options: ['La politique internationale', 'L’identité caribéenne et le métissage culturel', 'L’histoire militaire', 'La cuisine française'], answer: 1 },
          { type: 'mcq', prompt: 'Comment commence le processus créatif de Mireille ?', options: ['Par la vente de ses œuvres', 'Par une longue période d’observation', 'Par des cours en ligne', 'Par une lecture de journaux'], answer: 1 },
          { type: 'mcq', prompt: 'Que demandait-on souvent à Mireille au début de sa carrière ?', options: ['De peindre plus vite', 'De choisir un camp culturel unique', 'D’arrêter de peindre', 'De vendre moins cher'], answer: 1 },
          { type: 'mcq', prompt: 'Comment la situation a-t-elle évolué aujourd’hui ?', options: ['Elle reçoit encore plus ce genre de remarque', 'Elle reçoit de moins en moins ce genre de remarque', 'Rien n’a changé', 'Elle a arrêté de peindre'], answer: 1 },
          { type: 'mcq', prompt: 'Comment a été accueillie sa dernière exposition ?', options: ['Très mal', 'Particulièrement bien par la critique', 'Elle n’a pas eu de retour', 'Elle a été annulée'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « se laisser enfermer dans une seule catégorie » ?', options: ['Être libre de tout mélanger', 'Être limité à une seule identité définie', 'Voyager beaucoup', 'Vendre ses œuvres facilement'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime une opinion de Mireille ?', options: ['Mireille est une artiste franco-dominicaine.', 'Je ne crois pas qu’il faille choisir entre ses différentes appartenances culturelles.', 'Camila prépare une liste de questions.', 'L’exposition a eu lieu à Saint-Domingue.'], answer: 1 },
          { type: 'mcq', prompt: 'Inférence : pourquoi ce texte résonne-t-il particulièrement avec l’expérience de Camila ?', options: ['Parce qu’elle est aussi peintre', 'Parce qu’elle vit elle-même entre deux cultures', 'Par pur hasard', 'Parce qu’elle connaît Mireille depuis l’enfance'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : quel message central Mireille transmet-elle à la fin de l’interview ?', options: ['Il faut absolument choisir une seule identité culturelle', 'La tension entre plusieurs appartenances peut être source d’authenticité créative', 'L’art n’a aucun lien avec l’identité', 'Il vaut mieux éviter de mélanger les cultures'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Le processus créatif de Mireille',
        description: 'Écoute Mireille expliquer comment elle travaille avant de commencer une œuvre.',
        intro: 'Écoute Mireille décrire son processus créatif à Camila pendant l’interview.',
        dialogue: [
          { speaker: 'Camila', line: 'Comment commence votre processus créatif, en général ?', translation: '¿Cómo comienza generalmente su proceso creativo?' },
          { speaker: 'Mireille', line: 'Toujours par une longue période d’observation, avant même de toucher un pinceau.', translation: 'Siempre por un largo período de observación, antes incluso de tocar un pincel.' },
          { speaker: 'Camila', line: 'Et qu’est-ce qui vous inspire le plus ?', translation: '¿Y qué es lo que más le inspira?' },
          { speaker: 'Mireille', line: 'Les couleurs et les textures que je retrouve dans mon quotidien.', translation: 'Los colores y las texturas que encuentro en mi día a día.' }
        ],
        phrases: ['Comment commence votre processus... ?', 'Toujours par...', 'Qu’est-ce qui vous inspire ?', 'Je m’inspire de...'],
        exercises: [
          { type: 'mcq', prompt: 'Par quoi commence le processus créatif de Mireille ?', options: ['Par la vente', 'Par une période d’observation', 'Par un voyage', 'Par un cours'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’est-ce qui inspire le plus Mireille ?', options: ['La musique', 'Les couleurs et textures du quotidien', 'Les livres', 'Les films'], answer: 1 },
          { type: 'mcq', prompt: 'Quel type de question Camila pose-t-elle dans cet extrait ?', options: ['Des questions personnelles sans rapport', 'Des questions sur le processus créatif', 'Des questions sur le prix des œuvres', 'Des questions sur sa famille'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Mener une interview',
        description: 'Prépare et simule une interview sur un processus créatif ou professionnel.',
        mission: 'Prépare cinq questions et simule une interview avec un/une camarade sur un processus créatif (artistique, professionnel ou personnel).',
        phrases: ['Comment commence votre processus... ?', 'Qu’est-ce qui vous inspire ?', 'Avez-vous déjà rencontré des difficultés ?', 'Que diriez-vous à quelqu’un qui débute ?'],
        dialogue: [
          { speaker: 'Toi', line: 'Comment commence votre processus créatif ? Qu’est-ce qui vous inspire le plus dans votre travail ?', translation: '¿Cómo comienza su proceso creativo? ¿Qué es lo que más le inspira en su trabajo?' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Mène une interview simulée de cinq questions sur un processus créatif, avec un/une camarade.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Échangez les rôles : interviewer et interviewé(e), sur un sujet de votre choix.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Rédiger une interview',
        description: 'Rédige le compte-rendu écrit d’une interview sur un processus créatif.',
        mission: 'Écris 200 à 250 mots présentant une interview (réelle ou imaginaire) sur un processus créatif, avec au moins une citation rapportée et un comparatif avancé.',
        phrases: ['Elle explique que...', 'Elle a confié que...', 'De plus en plus / de moins en moins...', 'Selon elle...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Lors de notre entretien, l’artiste a expliqué que son processus créatif commence toujours par une longue période d’observation. Elle a confié que, de plus en plus, elle se sent libre de mélanger différentes influences culturelles dans son travail.', translation: 'Durante nuestra entrevista, la artista explicó que su proceso creativo siempre comienza con un largo período de observación. Confesó que, cada vez más, se siente libre de mezclar diferentes influencias culturales en su trabajo.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris le compte-rendu de 200 à 250 mots d’une interview sur un processus créatif, avec une citation rapportée et un comparatif avancé.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Les comparatifs avancés (de plus en plus, de moins en moins, autant que)',
        description: 'Exprimer une évolution progressive et une comparaison d’intensité égale.',
        grammarNote: '« De plus en plus » et « de moins en moins » expriment une évolution progressive : « Elle se sent de plus en plus libre. » « Autant que » compare deux intensités égales : « Sa préparation compte autant que son écoute. »',
        phrases: ['De plus en plus...', 'De moins en moins...', 'Autant que...', 'Plus elle avance, plus elle...'],
        exercises: [
          { type: 'mcq', prompt: 'Elle se sent ___ libre dans son travail au fil du temps.', options: ['de plus en plus', 'de moins en moins', 'autant que', 'aussi'], answer: 0 },
          { type: 'mcq', prompt: 'Sa préparation compte ___ sa capacité d’écoute.', options: ['plus que', 'autant que', 'moins que', 'aussi bon que'], answer: 1 },
          { type: 'mcq', prompt: 'Elle reçoit ___ ce genre de remarque aujourd’hui.', options: ['de plus en plus', 'de moins en moins', 'aussi', 'que'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle structure exprime une évolution progressive ?', options: ['Plus... que', 'De plus en plus', 'Aussi... que', 'Moins... que'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de l’art et de la créativité',
        description: 'Le vocabulaire essentiel pour parler d’art et de processus créatif.',
        vocabulary: [
          { word: 'une œuvre', translation: 'una obra', example: 'Cette œuvre explore le thème de l’identité.' },
          { word: 'un processus créatif', translation: 'un proceso creativo', example: 'Son processus créatif commence par l’observation.' },
          { word: 's’inspirer de', translation: 'inspirarse en', example: 'Elle s’inspire des couleurs de la mer.' },
          { word: 'une exposition', translation: 'una exposición', example: 'Sa dernière exposition a eu beaucoup de succès.' },
          { word: 'le métissage', translation: 'el mestizaje', example: 'Son art explore le métissage culturel.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « une œuvre » ?', options: ['Una obra', 'Un pincel', 'Una galería', 'Un museo'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « s’inspirer de » ?', options: ['Inspirarse en', 'Ignorar', 'Copiar exactamente', 'Vender'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « le métissage » ?', options: ['El mestizaje', 'La pintura', 'El museo', 'La escultura'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Après la publication',
        description: 'Mireille remercie Camila pour son article et ses questions.',
        intro: 'Après la publication de l’interview, Mireille contacte Camila pour la remercier.',
        dialogue: [
          { speaker: 'Mireille', line: 'J’ai lu votre article, il est vraiment très juste.', translation: 'Leí su artículo, es realmente muy acertado.' },
          { speaker: 'Camila', line: 'Merci beaucoup, j’ai adoré cette conversation avec vous.', translation: 'Muchas gracias, me encantó esta conversación con usted.' },
          { speaker: 'Mireille', line: 'Vos questions étaient particulièrement pertinentes, on sentait une vraie curiosité.', translation: 'Sus preguntas fueron particularmente pertinentes, se sentía una verdadera curiosidad.' },
          { speaker: 'Camila', line: 'C’est un sujet qui me touche personnellement, ça a dû s’entendre.', translation: 'Es un tema que me toca personalmente, seguramente se notó.' }
        ],
        phrases: ['J’ai lu votre article.', 'J’ai adoré cette conversation.', 'Vos questions étaient pertinentes.', 'Ça a dû s’entendre.'],
        exercises: [
          { type: 'mcq', prompt: 'Que pense Mireille de l’article de Camila ?', options: ['Qu’il est mauvais', 'Qu’il est vraiment très juste', 'Qu’il est trop court', 'Elle ne l’a pas lu'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Mireille qualifie-t-elle les questions de Camila ?', options: ['Sans intérêt', 'Particulièrement pertinentes', 'Trop personnelles', 'Répétitives'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi Camila pense-t-elle que sa curiosité s’est ressentie ?', options: ['Parce qu’elle a menti', 'Parce que le sujet la touche personnellement', 'Par hasard', 'Elle ne le pense pas'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'bilan-et-projets-davenir',
    title: 'Bilan et projets d’avenir',
    titleEs: 'Balance y proyectos de futuro',
    description: 'Camila reçoit la réponse de l’université de Tours et fait le bilan de tout ce qu’elle a accompli et appris depuis son premier jour d’échange scolaire.',
    order: 12,
    accessTier: 'free',
    unitOverview: {
      objective: 'Faire un bilan personnel structuré et exprimer des projets d’avenir avec assurance.',
      outcomes: [
        'faire le bilan d’un parcours personnel complet',
        'exprimer un projet d’avenir avec des hypothèses nuancées',
        'utiliser le conditionnel passé pour évoquer ce qui aurait pu se passer différemment',
        'conclure une réflexion personnelle avec clarté et maturité'
      ],
      grammar: ['récapitulatif : conditionnel passé, subjonctif, hypothèses complexes', 'expressions de bilan (avec le recul, en fin de compte)', 'expression de la certitude et de la détermination'],
      vocabulary: ['un bilan', 'avec le recul', 'un accomplissement', 'être déterminé(e) à'],
      scenario: 'Camila reçoit enfin la réponse de l’université de Tours et écrit une lettre ouverte à la Camila d’il y a deux ans, avant son départ pour la France.'
    },
    activities: {
      reading: activity('reading', {
        title: 'La lettre à mon ancien moi',
        description: 'Camila reçoit la réponse de l’université de Tours et écrit une lettre à la version d’elle-même d’il y a deux ans.',
        reading: {
          title: 'La lettre à mon ancien moi',
          parts: [
            "Un matin ordinaire, en vérifiant sa boîte mail entre deux traductions, Camila découvre enfin la réponse tant attendue de l'université de Tours : elle est acceptée en licence de langues étrangères appliquées, à partir de la rentrée prochaine. Après avoir crié de joie et immédiatement appelé sa mère, puis Léa et Karim en visioconférence, Camila s'assoit, encore émue, et décide d'écrire une lettre un peu particulière : non pas à un ami ou à un membre de sa famille, mais à la version d'elle-même qui, deux ans plus tôt, s'apprêtait à partir pour la France pour la première fois.",
            "« Chère Camila d'il y a deux ans, si tu savais tout ce qui t'attend », commence-t-elle à écrire. « Tu es en train de faire tes valises, terrifiée à l'idée de quitter ta famille pour un pays où tu ne connais personne. Avec le recul, je peux te dire que oui, ce sera parfois difficile : tu vas te sentir seule certains soirs, tu vas douter de toi en cours de français, et ton retour à la maison sera lui-même plus compliqué que tu ne l'imagines. Mais tu vas aussi te faire des amis pour la vie, découvrir une langue qui deviendra une véritable partie de toi, et développer une confiance en toi que tu ne soupçonnais même pas posséder. »",
            "Camila poursuit sa lettre en évoquant, avec une certaine émotion, tout ce qu'elle aurait pu manquer si elle avait cédé à la peur au moment de partir : « Si tu avais annulé ce voyage, comme tu y as pensé plusieurs fois avant le départ, tu n'aurais jamais rencontré Léa et Karim, tu n'aurais jamais découvert cette passion pour la traduction qui définit maintenant ton projet professionnel, et tu ne serais probablement pas en train de t'engager aujourd'hui pour protéger les mangroves de ton propre pays, en utilisant une langue que tu croyais, à l'époque, purement scolaire. » Elle sourit en écrivant ces mots, mesurant enfin pleinement le chemin parcouru.",
            "En fin de compte, Camila conclut sa lettre par un message qu'elle espère aussi vrai pour son ancien moi que pour n'importe qui traversant une période d'incertitude similaire : « Je suis fière de la décision que tu vas prendre, même si tu ne le sais pas encore. Tu vas grandir de façons que tu ne peux même pas imaginer maintenant. Sois déterminée, reste curieuse, et surtout, n'aie pas peur de te tromper : c'est exactement de ces erreurs et de ces doutes que naîtra la personne que tu es en train de devenir aujourd'hui. » Elle publie finalement cette lettre sur son blog, certaine qu'elle pourrait, elle aussi, résonner avec d'autres jeunes hésitant à se lancer dans une aventure similaire à la sienne."
          ],
          questions: [
            'Quelle nouvelle Camila reçoit-elle au début du texte ?',
            'À qui Camila décide-t-elle d’écrire une lettre ?',
            'Que serait-il arrivé si Camila avait annulé son voyage, selon elle-même ?'
          ],
          ordering: {
            prompt: 'Remets les moments du texte dans l’ordre.',
            events: [
              'Camila découvre qu’elle est acceptée à l’université de Tours.',
              'Elle décide d’écrire une lettre à la Camila d’il y a deux ans.',
              'Elle évoque tout ce qu’elle aurait manqué si elle avait annulé son départ.',
              'Elle conclut sa lettre et la publie sur son blog.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Idée principale : de quoi parle ce texte ?', options: ['D’un examen raté', 'Du bilan que fait Camila de son parcours après avoir été acceptée à l’université', 'D’une dispute familiale', 'D’un voyage touristique'], answer: 1 },
          { type: 'mcq', prompt: 'Information explicite : à quelle formation Camila est-elle acceptée ?', options: ['Un master de commerce', 'Une licence de langues étrangères appliquées', 'Un diplôme de médecine', 'Une école d’art'], answer: 1 },
          { type: 'mcq', prompt: 'À qui Camila écrit-elle sa lettre ?', options: ['À sa mère', 'À la version d’elle-même d’il y a deux ans', 'À l’université de Tours', 'À Mireille l’artiste'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit Camila sur les difficultés de son année en France ?', options: ['Qu’il n’y en a eu aucune', 'Qu’elle admet honnêtement qu’il y a eu des moments difficiles', 'Qu’elle les cache complètement', 'Qu’elle regrette tout'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’aurait manqué Camila si elle avait annulé son voyage ?', options: ['Rien d’important', 'Ses amitiés, sa passion pour la traduction, son engagement pour les mangroves', 'Seulement de meilleures notes', 'Un diplôme supplémentaire'], answer: 1 },
          { type: 'mcq', prompt: 'Quel conseil final Camila donne-t-elle à son ancien moi ?', options: ['D’éviter tout risque', 'D’être déterminée, curieuse, et de ne pas avoir peur de se tromper', 'De rester chez elle', 'De ne faire confiance à personne'], answer: 1 },
          { type: 'mcq', prompt: 'Signification en contexte : que signifie « avec le recul » ?', options: ['Immédiatement', 'En regardant les choses après coup, avec plus de perspective', 'Sans réfléchir', 'De façon impulsive'], answer: 1 },
          { type: 'mcq', prompt: 'Opinion vs fait : quelle phrase exprime un fait, et non une réflexion personnelle ?', options: ['Elle est acceptée en licence de langues étrangères appliquées.', 'Tu vas grandir de façons que tu ne peux même pas imaginer.', 'Je suis fière de la décision que tu vas prendre.', 'C’est exactement de ces erreurs que naîtra la personne que tu es en train de devenir.'], answer: 0 },
          { type: 'mcq', prompt: 'Inférence : pourquoi Camila publie-t-elle cette lettre sur son blog plutôt que de la garder privée ?', options: ['Par erreur', 'Parce qu’elle espère qu’elle résonnera avec d’autres jeunes dans une situation similaire', 'Parce qu’on l’y oblige', 'Parce qu’elle veut se vanter'], answer: 1 },
          { type: 'mcq', prompt: 'Conclusion : quel est le message central de cette lettre ?', options: ['Il vaut mieux éviter tout risque dans la vie', 'Les décisions courageuses, malgré la peur, peuvent transformer une vie', 'Il faut toujours rester chez soi', 'L’université est la seule chose qui compte'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'L’appel avec Léa et Karim',
        description: 'Écoute Camila annoncer la bonne nouvelle à Léa et Karim en visioconférence.',
        intro: 'Écoute la réaction de Léa et Karim quand Camila leur annonce son admission à l’université.',
        dialogue: [
          { speaker: 'Camila', line: 'J’ai une nouvelle incroyable : je suis acceptée à l’université de Tours !', translation: '¡Tengo una noticia increíble: fui aceptada en la universidad de Tours!' },
          { speaker: 'Léa', line: 'Camila, c’est fantastique ! Tu vas revenir vivre ici !', translation: '¡Camila, es fantástico! ¡Vas a volver a vivir aquí!' },
          { speaker: 'Karim', line: 'On va enfin pouvoir se voir en vrai à nouveau !', translation: '¡Por fin vamos a poder vernos en persona otra vez!' },
          { speaker: 'Camila', line: 'Je n’arrive pas encore à y croire, je suis tellement heureuse.', translation: 'Todavía no puedo creerlo, estoy tan feliz.' }
        ],
        phrases: ['J’ai une nouvelle incroyable.', 'C’est fantastique !', 'On va enfin pouvoir...', 'Je n’arrive pas à y croire.'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle nouvelle Camila annonce-t-elle ?', options: ['Qu’elle déménage', 'Qu’elle est acceptée à l’université de Tours', 'Qu’elle change de métier', 'Qu’elle part en vacances'], answer: 1 },
          { type: 'mcq', prompt: 'Comment réagit Léa ?', options: ['Avec indifférence', 'Avec une grande joie', 'Avec tristesse', 'Avec surprise négative'], answer: 1 },
          { type: 'mcq', prompt: 'Que se réjouit de faire Karim ?', options: ['De déménager lui-même', 'De revoir Camila en vrai', 'De ne plus lui parler', 'De changer d’université'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Faire le bilan d’un parcours',
        description: 'Présente le bilan d’un parcours personnel ou d’une année importante de ta vie.',
        mission: 'Présente le bilan d’une expérience importante de ta vie (réelle ou imaginaire), avec ce que tu aurais manqué si tu avais fait un choix différent.',
        phrases: ['Avec le recul...', 'Si j’avais choisi différemment, je n’aurais jamais...', 'En fin de compte...', 'Je suis déterminé(e) à...'],
        dialogue: [
          { speaker: 'Toi', line: 'Avec le recul, je réalise à quel point cette décision a été importante. Si j’avais choisi différemment, je n’aurais jamais... En fin de compte, je suis fier/fière du chemin parcouru.', translation: 'Con la perspectiva del tiempo, me doy cuenta de lo importante que fue esa decisión. Si hubiera elegido diferente, nunca habría... En definitiva, estoy orgulloso/a del camino recorrido.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Fais le bilan d’une expérience importante de ta vie, avec une hypothèse au conditionnel passé.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, échangez sur une décision qui a changé le cours de votre vie.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Une lettre à mon ancien moi',
        description: 'Écris une lettre à la version de toi-même du passé, avec le recul de ton expérience actuelle.',
        mission: 'Écris 220 à 260 mots sous forme de lettre à la version de toi-même d’il y a quelques années, en faisant le bilan de ce que tu as appris et en donnant un conseil.',
        phrases: ['Chère/cher... d’il y a...', 'Avec le recul, je peux te dire que...', 'Si tu avais fait autrement, tu n’aurais jamais...', 'Sois déterminé(e) et...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Chère moi d’il y a deux ans, avec le recul, je peux te dire que cette décision difficile en valait vraiment la peine. Si tu avais renoncé, tu n’aurais jamais découvert tout ce que tu es devenue aujourd’hui. Sois déterminée et n’aie pas peur de te tromper.', translation: 'Querida yo de hace dos años, con la perspectiva del tiempo, puedo decirte que esa difícil decisión realmente valió la pena. Si hubieras renunciado, nunca habrías descubierto todo lo que te has convertido hoy. Sé decidida y no tengas miedo de equivocarte.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris une lettre de 220 à 260 mots à ton ancien toi, avec au moins une hypothèse au conditionnel passé et une expression de bilan.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Récapitulatif : hypothèses complexes et expressions de bilan',
        description: 'Réviser les hypothèses avec si + plus-que-parfait et les expressions de bilan personnel.',
        grammarNote: 'Ce récapitulatif combine les points du niveau B2 : hypothèse irréelle du passé (si + plus-que-parfait, conditionnel passé), expressions de bilan (avec le recul, en fin de compte), et détermination (être déterminé(e) à + infinitif) : « Si j’avais renoncé, je n’aurais jamais grandi. Avec le recul, je suis déterminée à continuer. »',
        phrases: ['Si j’avais renoncé, je n’aurais jamais...', 'Avec le recul...', 'En fin de compte...', 'Je suis déterminé(e) à...'],
        exercises: [
          { type: 'mcq', prompt: 'Si elle ___ ce voyage, elle n’aurait jamais rencontré Léa et Karim.', options: ['annule', 'avait annulé', 'annulerait', 'annulait'], answer: 1 },
          { type: 'mcq', prompt: 'Avec le recul, elle ___ fière de sa décision.', options: ['est', 'était', 'sera', 'soit'], answer: 0 },
          { type: 'mcq', prompt: 'Elle est déterminée ___ continuer ses études en France.', options: ['de', 'à', 'pour', 'que'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle expression introduit un bilan final ?', options: ['Étant donné que', 'En fin de compte', 'Afin que', 'Bien que'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire du bilan personnel',
        description: 'Le vocabulaire essentiel pour faire un bilan personnel et parler de son parcours.',
        vocabulary: [
          { word: 'un bilan', translation: 'un balance', example: 'Elle fait le bilan de son année en France.' },
          { word: 'avec le recul', translation: 'con la perspectiva del tiempo', example: 'Avec le recul, je comprends mieux cette décision.' },
          { word: 'un accomplissement', translation: 'un logro', example: 'Cette admission est un accomplissement important.' },
          { word: 'être déterminé(e) à', translation: 'estar decidido/a a', example: 'Elle est déterminée à réussir ses études.' },
          { word: 'en fin de compte', translation: 'en definitiva', example: 'En fin de compte, cette expérience l’a transformée.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « un bilan » ?', options: ['Un balance', 'Un problema', 'Una fiesta', 'Un examen'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « avec le recul » ?', options: ['Con la perspectiva del tiempo', 'Inmediatamente', 'Sin pensar', 'Al principio'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « être déterminé(e) à » ?', options: ['Estar decidido/a a', 'Dudar de', 'Renunciar a', 'Olvidar'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Le début d’un nouveau chapitre',
        description: 'Camila partage avec sa grand-mère sa décision de repartir étudier en France.',
        intro: 'Camila annonce à sa grand-mère qu’elle repart bientôt en France pour ses études.',
        dialogue: [
          { speaker: 'Camila', line: 'Grand-mère, je pars étudier à Tours à la rentrée prochaine.', translation: 'Abuela, me voy a estudiar a Tours el próximo curso.' },
          { speaker: 'La grand-mère', line: 'Je suis tellement fière de toi, ma chérie.', translation: 'Estoy tan orgullosa de ti, cariño.' },
          { speaker: 'Camila', line: 'Merci, grand-mère. Cette fois, je pars avec beaucoup plus de confiance.', translation: 'Gracias, abuela. Esta vez me voy con mucha más confianza.' },
          { speaker: 'La grand-mère', line: 'C’est normal, tu as beaucoup grandi depuis ton premier départ.', translation: 'Es normal, has crecido mucho desde tu primera partida.' }
        ],
        phrases: ['Je pars étudier à...', 'Je suis fière de toi.', 'Je pars avec beaucoup plus de confiance.', 'Tu as beaucoup grandi.'],
        exercises: [
          { type: 'mcq', prompt: 'Quelle nouvelle Camila annonce-t-elle à sa grand-mère ?', options: ['Qu’elle reste définitivement à Saint-Domingue', 'Qu’elle repart étudier à Tours', 'Qu’elle change de métier', 'Qu’elle arrête ses études'], answer: 1 },
          { type: 'mcq', prompt: 'Comment réagit la grand-mère ?', options: ['Avec inquiétude', 'Avec fierté', 'Avec indifférence', 'Avec tristesse uniquement'], answer: 1 },
          { type: 'mcq', prompt: 'Comment ce départ diffère-t-il du premier, selon Camila ?', options: ['Il est identique', 'Elle part avec beaucoup plus de confiance', 'Elle part à contrecœur', 'Elle ne veut pas partir'], answer: 1 }
        ]
      })
    }
  }
];

module.exports = {
  language: 'french',
  level: 'B2',
  courseTitle: 'Français B2',
  courseDescription:
    'Français avancé : argumentation, société, culture et projets académiques, organisés en unités thématiques qui poursuivent le parcours de Camila après son retour à Saint-Domingue.',
  units
};
