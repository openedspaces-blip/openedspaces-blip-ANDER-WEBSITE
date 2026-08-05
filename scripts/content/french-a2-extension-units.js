function lesson(skill, fields) {
  const defaults = {
    reading: [12, 25],
    listening: [10, 25],
    speaking: [10, 20],
    writing: [14, 25],
    grammar: [10, 20],
    vocabulary: [8, 20],
    dialogue: [10, 20]
  };
  const [duration, xp] = defaults[skill];
  return { skill, duration, xp, ...fields };
}

const units = [
  {
    slug: 'services-et-demarches',
    title: 'Services et démarches',
    titleEs: 'Servicios y trámites',
    description:
      'Comprendre une démarche simple, demander des informations et préparer un dossier.',
    order: 11,
    accessTier: 'premium',
    unitOverview: {
      objective:
        'Demander un service, comprendre des instructions administratives simples et utiliser les pronoms y et en.',
      outcomes: [
        'identifier les étapes d’une démarche',
        'demander une information à un guichet',
        'indiquer les documents nécessaires',
        'remplacer un complément par y ou en'
      ],
      grammar: ['les pronoms y et en', 'il faut + infinitif', 'les quantités'],
      vocabulary: ['la mairie', 'un formulaire', 'un dossier', 'un justificatif', 'un guichet'],
      scenario: 'Une habitante prépare son inscription à la médiathèque municipale.'
    },
    activities: {
      reading: lesson('reading', {
        title: 'Une carte pour la médiathèque',
        description:
          'Nora découvre comment s’inscrire à la nouvelle médiathèque de son quartier.',
        reading: {
          title: 'Une carte pour la médiathèque',
          parts: [
            'Nora vient de s’installer dans un nouveau quartier de Rennes. Elle aime lire, travailler au calme et participer à des activités culturelles. En passant devant la médiathèque municipale, elle voit une affiche qui annonce des ateliers gratuits. Elle décide d’entrer pour demander une carte. À l’accueil, un agent lui explique qu’il faut remplir un formulaire et présenter une pièce d’identité ainsi qu’un justificatif de domicile.',
            'Nora n’a pas son justificatif avec elle. L’agent lui montre le site de la mairie : elle peut y télécharger le formulaire et envoyer certains documents en ligne. Pour terminer l’inscription, elle devra cependant revenir au guichet avec les originaux. Nora demande s’il faut prendre rendez-vous. L’agent répond qu’il n’est pas nécessaire d’en prendre le matin, mais que l’après-midi est souvent plus chargé.',
            'Le lendemain, Nora prépare son dossier. Elle y met son passeport, une facture récente et le formulaire complété. Elle retourne à la médiathèque avant midi. Cette fois, son dossier est complet. Elle reçoit sa carte et emprunte deux romans. Elle s’inscrit aussi à un atelier de conversation qui aura lieu le samedi suivant. Grâce aux explications claires de l’agent, la démarche a été rapide et Nora connaît maintenant un lieu utile dans son quartier.'
          ]
        },
        exercises: [
          {
            type: 'mcq',
            prompt: 'Pourquoi Nora entre-t-elle dans la médiathèque ?',
            options: ['Pour chercher un emploi', 'Pour demander une carte', 'Pour payer une facture', 'Pour rencontrer la mairie'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Quels documents doit-elle présenter ?',
            options: ['Un billet et une photo', 'Une pièce d’identité et un justificatif de domicile', 'Un diplôme et un CV', 'Une ordonnance et une carte bancaire'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Que peut-elle télécharger sur le site ?',
            options: ['Le formulaire', 'Les romans', 'Sa pièce d’identité', 'Sa carte définitive'],
            answer: 0
          },
          {
            type: 'mcq',
            prompt: 'Pourquoi Nora revient-elle le lendemain ?',
            options: ['Pour annuler son inscription', 'Pour apporter les documents originaux', 'Pour changer de quartier', 'Pour rendre un livre'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Quand le guichet est-il généralement moins chargé ?',
            options: ['Le matin', 'L’après-midi', 'Le soir', 'Le dimanche'],
            answer: 0
          },
          {
            type: 'mcq',
            prompt: 'Qu’emprunte Nora après son inscription ?',
            options: ['Deux films', 'Deux romans', 'Un ordinateur', 'Un formulaire'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'À quelle activité s’inscrit-elle ?',
            options: ['Un cours de cuisine', 'Un atelier de conversation', 'Une visite de la mairie', 'Un club sportif'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Quelle conclusion correspond au texte ?',
            options: ['La démarche reste impossible', 'Les explications rendent la démarche plus simple', 'Nora préfère renoncer', 'La médiathèque est fermée'],
            answer: 1
          }
        ]
      }),
      listening: lesson('listening', {
        title: 'Information de la mairie',
        description:
          'Écoute une annonce publique qui explique comment renouveler une carte municipale.',
        intro:
          'Une seule personne présente les étapes, les horaires et les documents nécessaires.',
        phrases: [
          'Vous pouvez y accéder...',
          'Il faut apporter...',
          'Vous en aurez besoin.',
          'Prenez rendez-vous.'
        ],
        exercises: []
      }),
      speaking: lesson('speaking', {
        title: 'Au guichet municipal',
        description: 'Demande les informations nécessaires pour effectuer une démarche.',
        mission:
          'Explique la raison de ta visite, demande les documents nécessaires et vérifie les horaires.',
        phrases: [
          'Je voudrais des informations sur...',
          'Quels documents faut-il apporter ?',
          'Est-ce qu’il faut prendre rendez-vous ?',
          'Je peux le faire en ligne ?'
        ],
        dialogue: [
          {
            speaker: 'Usager',
            line: 'Bonjour, je voudrais renouveler ma carte. Quels documents faut-il apporter ?',
            translation: 'Buenos días, quisiera renovar mi tarjeta. ¿Qué documentos hay que llevar?'
          },
          {
            speaker: 'Agent',
            line: 'Il faut une pièce d’identité et un justificatif de domicile.',
            translation: 'Se necesita un documento de identidad y un comprobante de domicilio.'
          }
        ],
        exercises: [
          {
            type: 'speaking',
            prompt:
              'Simule une demande au guichet : présente ta démarche et pose au moins trois questions pratiques.',
            answer: 'Oral practice'
          }
        ]
      }),
      writing: lesson('writing', {
        title: 'Demander une information par e-mail',
        description: 'Rédige un message clair à un service municipal.',
        mission:
          'Écris 80 à 100 mots pour demander les horaires, les documents nécessaires et la possibilité de faire la démarche en ligne.',
        phrases: [
          'Madame, Monsieur,',
          'Je souhaiterais obtenir des informations...',
          'Pourriez-vous m’indiquer...',
          'Je vous remercie par avance.'
        ],
        exercises: [
          {
            type: 'writing',
            prompt:
              'Écris un e-mail de 80 à 100 mots à un service public en utilisant y ou en au moins une fois.',
            answer: 'Open answer'
          }
        ]
      }),
      grammar: lesson('grammar', {
        title: 'Les pronoms y et en',
        description: 'Éviter les répétitions avec y et en.',
        grammarNote:
          '« Y » remplace généralement un lieu introduit par à, dans ou chez : « Je vais à la mairie → J’y vais. » « En » remplace un complément introduit par de ou une quantité : « J’ai besoin de deux documents → J’en ai besoin de deux. »',
        phrases: ['J’y vais demain.', 'Vous pouvez y accéder.', 'J’en ai besoin.', 'Il faut en apporter deux.'],
        exercises: [
          {
            type: 'mcq',
            prompt: 'Tu vas à la mairie ? Oui, j’___ vais demain.',
            options: ['y', 'en', 'le', 'lui'],
            answer: 0
          },
          {
            type: 'mcq',
            prompt: 'Vous avez besoin de ce formulaire ? Oui, j’___ ai besoin.',
            options: ['y', 'en', 'la', 'les'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Combien de justificatifs faut-il ? Il faut ___ apporter deux.',
            options: ['y', 'en', 'leur', 'les'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Elle est au guichet et elle ___ attend son tour.',
            options: ['y', 'en', 'le', 'lui'],
            answer: 0
          }
        ]
      }),
      vocabulary: lesson('vocabulary', {
        title: 'Le vocabulaire des démarches',
        description: 'Les mots utiles pour comprendre et effectuer une démarche simple.',
        vocabulary: [
          { word: 'la mairie', translation: 'el ayuntamiento', example: 'Je vais à la mairie demain.' },
          { word: 'un formulaire', translation: 'un formulario', example: 'Remplissez ce formulaire.' },
          { word: 'un dossier', translation: 'un expediente', example: 'Votre dossier est complet.' },
          { word: 'un justificatif de domicile', translation: 'un comprobante de domicilio', example: 'Apportez un justificatif récent.' },
          { word: 'une pièce d’identité', translation: 'un documento de identidad', example: 'Présentez votre pièce d’identité.' },
          { word: 'le guichet', translation: 'la ventanilla', example: 'Le guichet ouvre à neuf heures.' },
          { word: 'prendre rendez-vous', translation: 'pedir una cita', example: 'Il faut prendre rendez-vous en ligne.' },
          { word: 'renouveler', translation: 'renovar', example: 'Je dois renouveler ma carte.' }
        ],
        exercises: [
          {
            type: 'mcq',
            prompt: 'Où parle-t-on avec un agent ?',
            options: ['Au guichet', 'Dans un panier', 'À la caisse du marché', 'Sur un quai'],
            answer: 0
          },
          {
            type: 'mcq',
            prompt: 'Quel document prouve votre adresse ?',
            options: ['Un menu', 'Un justificatif de domicile', 'Un ticket de bus', 'Une carte postale'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Que signifie « renouveler » ?',
            options: ['Annuler définitivement', 'Rendre de nouveau valable', 'Comparer deux prix', 'Changer de logement'],
            answer: 1
          }
        ]
      }),
      dialogue: lesson('dialogue', {
        title: 'Un dossier incomplet',
        description: 'Un agent aide une personne à compléter son dossier.',
        intro: 'Au guichet, un usager découvre qu’il manque un document.',
        dialogue: [
          {
            speaker: 'Agent',
            line: 'Votre formulaire est rempli, mais il manque un justificatif de domicile.',
            translation: 'Su formulario está completo, pero falta un comprobante de domicilio.'
          },
          {
            speaker: 'Usager',
            line: 'Je peux vous l’envoyer en ligne cet après-midi ?',
            translation: '¿Puedo enviárselo en línea esta tarde?'
          },
          {
            speaker: 'Agent',
            line: 'Oui, vous pouvez le déposer dans votre espace personnel.',
            translation: 'Sí, puede subirlo a su espacio personal.'
          },
          {
            speaker: 'Usager',
            line: 'Parfait, je vais le faire dès mon retour.',
            translation: 'Perfecto, lo haré en cuanto regrese.'
          }
        ],
        phrases: ['Il manque...', 'Je peux l’envoyer...', 'Vous pouvez le déposer...', 'Je vais le faire.'],
        exercises: [
          {
            type: 'mcq',
            prompt: 'Quel document manque-t-il ?',
            options: ['Le formulaire', 'Le justificatif de domicile', 'La carte définitive', 'Le reçu'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Comment l’usager va-t-il transmettre le document ?',
            options: ['Par la poste', 'En ligne', 'Par un voisin', 'Il ne va pas le transmettre'],
            answer: 1
          }
        ]
      })
    }
  },
  {
    slug: 'projets-solidaires',
    title: 'Projets solidaires',
    titleEs: 'Proyectos solidarios',
    description:
      'Proposer une action collective, inviter des participants et organiser un projet local.',
    order: 12,
    accessTier: 'premium',
    unitOverview: {
      objective:
        'Comprendre et présenter un projet solidaire en utilisant des propositions et des demandes polies.',
      outcomes: [
        'identifier l’objectif d’une action collective',
        'proposer une activité',
        'accepter ou refuser poliment',
        'répartir des tâches simples'
      ],
      grammar: ['le conditionnel de politesse', 'on pourrait + infinitif', 'le futur proche'],
      vocabulary: ['une collecte', 'un bénévole', 'faire un don', 'distribuer', 'participer'],
      scenario: 'Une association de quartier organise une collecte solidaire.'
    },
    activities: {
      reading: lesson('reading', {
        title: 'Un samedi pour partager',
        description:
          'Des habitants organisent une collecte de vêtements et de fournitures scolaires.',
        reading: {
          title: 'Un samedi pour partager',
          parts: [
            'Dans le quartier des Fleurs, une petite association prépare une journée solidaire. Plusieurs familles ont besoin de vêtements chauds et de matériel scolaire avant l’hiver. Lina, une étudiante qui fait du bénévolat, propose d’organiser une collecte le samedi suivant. Elle réserve la salle du centre culturel et publie une invitation sur les réseaux sociaux du quartier.',
            'Pendant la réunion, les bénévoles répartissent les tâches. On pourrait installer une table pour les vêtements, une autre pour les cahiers et les livres, suggère Lina. Hugo va préparer des affiches, Samira va contacter les écoles et Monsieur Petit va chercher des cartons. L’association demande aux habitants d’apporter uniquement des objets propres et en bon état. Elle précise aussi qu’un petit don financier est possible, mais jamais obligatoire.',
            'Le samedi, beaucoup de personnes participent. Les bénévoles trient les dons, notent les quantités et préparent des sacs adaptés à chaque famille. À la fin de la journée, ils ont collecté cent vingt vêtements, quatre-vingts livres et de nombreuses fournitures scolaires. Lina remercie tout le monde et propose une nouvelle action pour le printemps. Les habitants repartent fatigués, mais heureux d’avoir réalisé ensemble un projet utile.'
          ]
        },
        exercises: [
          {
            type: 'mcq',
            prompt: 'Quel est l’objectif de la journée ?',
            options: ['Vendre des vêtements', 'Organiser une collecte solidaire', 'Préparer un concert', 'Nettoyer une gare'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Où la collecte a-t-elle lieu ?',
            options: ['À la mairie', 'Au centre culturel', 'Dans une école', 'Au marché'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Que va préparer Hugo ?',
            options: ['Des affiches', 'Des repas', 'Des billets', 'Des médicaments'],
            answer: 0
          },
          {
            type: 'mcq',
            prompt: 'Quels objets l’association accepte-t-elle ?',
            options: ['Tous les objets sans condition', 'Des objets propres et en bon état', 'Seulement de l’argent', 'Uniquement des meubles'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Le don financier est-il obligatoire ?',
            options: ['Oui, toujours', 'Non, il est facultatif', 'Seulement pour les bénévoles', 'Le texte ne le précise pas'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Que font les bénévoles avec les dons ?',
            options: ['Ils les jettent', 'Ils les trient et préparent des sacs', 'Ils les vendent en ligne', 'Ils les renvoient'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Combien de vêtements ont-ils collectés ?',
            options: ['Quarante', 'Quatre-vingts', 'Cent', 'Cent vingt'],
            answer: 3
          },
          {
            type: 'mcq',
            prompt: 'Comment les participants se sentent-ils à la fin ?',
            options: ['Fatigués mais heureux', 'Déçus et en colère', 'Indifférents', 'Inquiets'],
            answer: 0
          }
        ]
      }),
      listening: lesson('listening', {
        title: 'Appel aux bénévoles',
        description:
          'Écoute un message associatif qui invite les habitants à participer à une collecte.',
        intro:
          'Une seule personne présente l’objectif, les horaires, les dons acceptés et les besoins en bénévoles.',
        phrases: [
          'Nous recherchons des bénévoles.',
          'Vous pourriez apporter...',
          'La collecte va avoir lieu...',
          'Merci de votre participation.'
        ],
        exercises: []
      }),
      speaking: lesson('speaking', {
        title: 'Présenter une action solidaire',
        description: 'Propose une activité utile à ton école ou à ton quartier.',
        mission:
          'Présente l’objectif, le lieu, la date et les tâches. Invite ensuite les autres à participer.',
        phrases: [
          'On pourrait organiser...',
          'Est-ce que vous pourriez...',
          'La journée va avoir lieu...',
          'Nous avons besoin de...'
        ],
        dialogue: [
          {
            speaker: 'Organisateur',
            line: 'On pourrait organiser une collecte de livres samedi.',
            translation: 'Podríamos organizar una colecta de libros el sábado.'
          },
          {
            speaker: 'Bénévole',
            line: 'Bonne idée. Je pourrais préparer les affiches.',
            translation: 'Buena idea. Yo podría preparar los carteles.'
          }
        ],
        exercises: [
          {
            type: 'speaking',
            prompt:
              'Présente une action solidaire pendant une minute et formule au moins deux demandes polies.',
            answer: 'Oral practice'
          }
        ]
      }),
      writing: lesson('writing', {
        title: 'Une invitation solidaire',
        description: 'Rédige une annonce pour inviter des participants.',
        mission:
          'Écris une annonce de 90 à 110 mots avec l’objectif, la date, le lieu, les objets recherchés et un contact.',
        phrases: [
          'Nous organisons...',
          'Vous pourriez apporter...',
          'Nous recherchons...',
          'Pour participer, contactez...'
        ],
        exercises: [
          {
            type: 'writing',
            prompt:
              'Rédige une annonce de 90 à 110 mots en utilisant « on pourrait » et une demande au conditionnel.',
            answer: 'Open answer'
          }
        ]
      }),
      grammar: lesson('grammar', {
        title: 'Proposer et demander poliment',
        description: 'Utiliser le conditionnel pour faire une proposition ou une demande.',
        grammarNote:
          'Pour proposer une action, on peut utiliser « on pourrait + infinitif ». Pour demander poliment, on emploie souvent « pourriez-vous + infinitif ? » ou « je voudrais + nom/infinitif ». Ces formes sont plus douces que l’impératif.',
        phrases: ['On pourrait organiser...', 'Pourriez-vous participer ?', 'Je voudrais aider.', 'Tu pourrais préparer...'],
        exercises: [
          {
            type: 'mcq',
            prompt: 'Pour faire une proposition polie : On ___ organiser une collecte.',
            options: ['pourrait', 'peut', 'devait', 'va'],
            answer: 0
          },
          {
            type: 'mcq',
            prompt: '___-vous apporter des cartons, s’il vous plaît ?',
            options: ['Pouvez', 'Pourriez', 'Pourrez', 'Deviez'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Je ___ participer comme bénévole.',
            options: ['voudrais', 'veux de', 'voudrait', 'voulais de'],
            answer: 0
          },
          {
            type: 'mcq',
            prompt: 'Tu ___ préparer une affiche pour demain.',
            options: ['pourrais', 'pourriez', 'pourrait', 'pourrions'],
            answer: 0
          }
        ]
      }),
      vocabulary: lesson('vocabulary', {
        title: 'Le vocabulaire de la solidarité',
        description: 'Les mots utiles pour organiser une action collective.',
        vocabulary: [
          { word: 'une collecte', translation: 'una colecta', example: 'Nous organisons une collecte de livres.' },
          { word: 'un bénévole', translation: 'un voluntario', example: 'Les bénévoles arrivent à neuf heures.' },
          { word: 'faire un don', translation: 'hacer una donación', example: 'Vous pouvez faire un don en ligne.' },
          { word: 'distribuer', translation: 'distribuir', example: 'Nous allons distribuer les vêtements.' },
          { word: 'trier', translation: 'clasificar', example: 'Il faut trier les objets.' },
          { word: 'participer', translation: 'participar', example: 'Tout le quartier peut participer.' },
          { word: 'une association', translation: 'una asociación', example: 'Cette association aide les familles.' },
          { word: 'en bon état', translation: 'en buen estado', example: 'Apportez des livres en bon état.' }
        ],
        exercises: [
          {
            type: 'mcq',
            prompt: 'Comment appelle-t-on une personne qui aide gratuitement ?',
            options: ['Un vendeur', 'Un bénévole', 'Un locataire', 'Un agent immobilier'],
            answer: 1
          },
          {
            type: 'mcq',
            prompt: 'Que signifie « trier » ?',
            options: ['Classer par catégories', 'Acheter à crédit', 'Réserver une chambre', 'Remplir un formulaire'],
            answer: 0
          },
          {
            type: 'mcq',
            prompt: 'Quel objet peut être donné ?',
            options: ['Un livre en bon état', 'Un vêtement sale et déchiré', 'Un dossier administratif', 'Un ticket utilisé'],
            answer: 0
          }
        ]
      }),
      dialogue: lesson('dialogue', {
        title: 'Répartir les tâches',
        description: 'Deux bénévoles organisent le travail avant une collecte.',
        intro: 'Lina et Hugo décident qui va préparer chaque élément.',
        dialogue: [
          {
            speaker: 'Lina',
            line: 'Tu pourrais préparer les affiches pour la collecte ?',
            translation: '¿Podrías preparar los carteles para la colecta?'
          },
          {
            speaker: 'Hugo',
            line: 'Oui, bien sûr. Et toi, tu pourrais contacter les écoles ?',
            translation: 'Sí, claro. ¿Y tú podrías contactar a las escuelas?'
          },
          {
            speaker: 'Lina',
            line: 'D’accord. Je vais aussi réserver la salle.',
            translation: 'De acuerdo. También voy a reservar la sala.'
          },
          {
            speaker: 'Hugo',
            line: 'Parfait, notre projet avance bien.',
            translation: 'Perfecto, nuestro proyecto avanza bien.'
          }
        ],
        phrases: ['Tu pourrais...', 'Oui, bien sûr.', 'Je vais aussi...', 'Notre projet avance.'],
        exercises: [
          {
            type: 'mcq',
            prompt: 'Que va préparer Hugo ?',
            options: ['Les affiches', 'La salle', 'Les repas', 'Les cartes'],
            answer: 0
          },
          {
            type: 'mcq',
            prompt: 'Que va réserver Lina ?',
            options: ['Un hôtel', 'La salle', 'Un billet', 'Un appartement'],
            answer: 1
          }
        ]
      })
    }
  }
];

units.forEach((unit) => {
  const activity = unit.activities?.reading;
  if (activity?.reading && Array.isArray(activity.exercises)) {
    activity.reading.questions = activity.exercises.slice(0, 5).map((exercise) => exercise.prompt);
  }
});

module.exports = { units };
