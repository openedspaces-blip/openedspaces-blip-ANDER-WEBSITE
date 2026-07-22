// scripts/content/french-a2-units.js
// Hand-authored French A2 content, same shape as scripts/content/french-a1-units.js
// (7 activities per unit: reading/listening/speaking/writing/grammar/
// vocabulary/dialogue). Continues the A1 narrative thread - Camila, the
// Dominican exchange student in Tours, now further into her school year
// with her host family (the Lamberts), Léa and Karim - into A2-level
// situations (shopping, restaurants). Two units for now (MVP); the
// remaining A2 modules already sketched in worlds/french/french-a2.js
// (transport, health, travel, past narration, future plans, invitations)
// are left for a follow-up pass.
//
// Consumed by scripts/build-french-a2-seed.js, which flattens this into
// lib/seed-lessons.json/lib/seed-units.json the same way french-a1-units.js
// does for A1.

const DEFAULTS = {
  reading: { duration: 12, xp: 25 },
  listening: { duration: 10, xp: 25 },
  speaking: { duration: 10, xp: 20 },
  writing: { duration: 14, xp: 25 },
  grammar: { duration: 10, xp: 20 },
  vocabulary: { duration: 8, xp: 20 },
  dialogue: { duration: 10, xp: 20 }
};

function activity(skill, fields) {
  return { skill, duration: DEFAULTS[skill].duration, xp: DEFAULTS[skill].xp, ...fields };
}

const units = [
  // ---------------------------------------------------------------
  {
    slug: 'les-achats',
    title: 'Les achats',
    titleEs: 'Las compras',
    description: 'Camila et Léa font des courses au marché et achètent des vêtements en ville.',
    order: 1,
    accessTier: 'free',
    unitOverview: {
      objective: 'Demander un prix, comparer deux articles et payer dans un magasin.',
      outcomes: [
        'demander le prix d’un produit',
        'comparer deux articles avec plus/moins/aussi... que',
        'utiliser le passé composé pour raconter un achat',
        'remplacer un nom par le/la/les'
      ],
      grammar: ['passé composé avec avoir', 'comparatifs', 'pronoms d’objet direct'],
      vocabulary: ['le marché', 'la taille', 'la caisse', 'le reçu', 'échanger'],
      scenario: 'Camila accompagne Léa faire des courses un samedi matin.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Une matinée au marché',
        description: 'Camila découvre le marché de Tours avec Léa et achète des fruits pour la famille Lambert.',
        reading: {
          title: 'Une matinée au marché',
          parts: [
            "Le samedi matin, Léa emmène Camila au marché du quartier. « On achète les fruits et légumes de la semaine ici, c'est moins cher qu'au supermarché », explique Léa. Elles marchent entre les étals colorés. Un vendeur leur sourit : « Bonjour, mesdemoiselles ! Vous cherchez quelque chose de particulier ? » Camila demande : « Combien ça coûte, un kilo de fraises ? » Le vendeur répond : « Trois euros le kilo, elles sont très bonnes cette semaine. »",
            "Camila goûte une fraise et elle adore. « On en prend deux kilos ! » dit-elle. Léa ajoute des tomates et des pommes dans le panier. Ensuite, elles s'arrêtent chez le fromager. Camila n'a jamais goûté autant de fromages différents. Léa lui explique la différence entre un fromage doux et un fromage plus fort. Elles choisissent finalement un fromage de chèvre, moins fort que le roquefort mais très savoureux.",
            "À la fin, elles ont dépensé vingt-cinq euros pour toute la semaine. « C'est vraiment moins cher qu'au supermarché », remarque Camila. Léa sourit : « Et en plus, c'est plus frais et plus sympa ! On parle avec les vendeurs, on découvre de nouveaux produits. » Sur le chemin du retour, Camila pense qu'elle va proposer ce marché à sa propre famille, un jour, à Saint-Domingue. Elle a adoré cette matinée pleine de couleurs, d'odeurs et de nouvelles découvertes."
          ],
          questions: [
            'Pourquoi Léa préfère-t-elle faire les courses au marché ?',
            'Qu’est-ce que Camila et Léa achètent chez le fromager ?',
            'Combien ont-elles dépensé au total ?'
          ],
          ordering: {
            prompt: 'Remets les événements de l’histoire dans l’ordre.',
            events: [
              'Léa emmène Camila au marché du quartier.',
              'Camila demande le prix des fraises et en achète deux kilos.',
              'Elles choisissent un fromage de chèvre chez le fromager.',
              'Elles rentrent chez elles, satisfaites de leurs achats.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Pourquoi Léa emmène-t-elle Camila au marché ?', options: ['Pour visiter la ville', 'Pour acheter les fruits et légumes de la semaine', 'Pour rencontrer des amis', 'Pour acheter des vêtements'], answer: 1 },
          { type: 'mcq', prompt: 'Combien coûte un kilo de fraises ?', options: ['Deux euros', 'Trois euros', 'Cinq euros', 'Dix euros'], answer: 1 },
          { type: 'mcq', prompt: 'Quel fromage choisissent-elles finalement ?', options: ['Du roquefort', 'Du fromage de chèvre', 'Du camembert', 'Aucun fromage'], answer: 1 },
          { type: 'mcq', prompt: 'Combien ont-elles dépensé pour toute la semaine ?', options: ['Quinze euros', 'Vingt euros', 'Vingt-cinq euros', 'Trente euros'], answer: 2 },
          { type: 'mcq', prompt: 'D’après Léa, pourquoi le marché est-il mieux que le supermarché ?', options: ['C’est plus rapide', 'C’est plus frais et plus sympa', 'C’est plus proche de l’école', 'Il n’y a personne'], answer: 1 },
          { type: 'mcq', prompt: 'Que pense faire Camila à la fin du texte ?', options: ['Ne plus jamais retourner au marché', 'Proposer ce marché à sa famille à Saint-Domingue', 'Travailler comme vendeuse', 'Acheter un fromage tous les jours'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila avait déjà goûté beaucoup de fromages avant ce jour.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « savoureux » signifie...', options: ['Cher', 'Qui a bon goût', 'Froid', 'Difficile à trouver'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle expression montre que les fraises sont de bonne qualité cette semaine ?', options: ['« C’est moins cher »', '« Elles sont très bonnes cette semaine »', '« On en prend deux kilos »', '« Un fromage plus fort »'], answer: 1 },
          { type: 'mcq', prompt: 'Quel est le ton général du texte ?', options: ['Triste et déçu', 'Joyeux et curieux', 'Fâché et pressé', 'Ennuyé et indifférent'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Combien ça coûte ?',
        description: 'Écoute Camila qui achète des fraises au marché.',
        intro: 'Écoute le dialogue entre Camila et le vendeur de fruits au marché.',
        dialogue: [
          { speaker: 'Camila', line: 'Bonjour ! Combien ça coûte, un kilo de fraises ?', translation: 'Hola. ¿Cuánto cuesta un kilo de fresas?' },
          { speaker: 'Le vendeur', line: 'Trois euros le kilo, elles sont très bonnes cette semaine.', translation: 'Tres euros el kilo, están muy buenas esta semana.' },
          { speaker: 'Camila', line: 'D’accord, j’en voudrais deux kilos, s’il vous plaît.', translation: 'De acuerdo, quisiera dos kilos, por favor.' },
          { speaker: 'Le vendeur', line: 'Voilà. Ça fait six euros.', translation: 'Aquí tiene. Son seis euros.' },
          { speaker: 'Camila', line: 'Merci, voici l’argent.', translation: 'Gracias, aquí tiene el dinero.' }
        ],
        phrases: ['Combien ça coûte ?', 'J’en voudrais...', 'Ça fait combien ?', 'Voici l’argent.'],
        exercises: [
          { type: 'mcq', prompt: 'Combien coûte un kilo de fraises ?', options: ['Deux euros', 'Trois euros', 'Six euros', 'Dix euros'], answer: 1 },
          { type: 'mcq', prompt: 'Combien de kilos Camila achète-t-elle ?', options: ['Un', 'Deux', 'Trois', 'Quatre'], answer: 1 },
          { type: 'mcq', prompt: 'Combien Camila paie-t-elle au total ?', options: ['Trois euros', 'Cinq euros', 'Six euros', 'Neuf euros'], answer: 2 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Au marché',
        description: 'Simule un dialogue au marché : demande le prix et achète un produit.',
        mission: 'Demande le prix d’un fruit ou légume, précise une quantité, puis remercie le vendeur.',
        phrases: ['Combien ça coûte... ?', 'J’en voudrais...', 'Ça fait combien ?', 'Merci, au revoir !'],
        dialogue: [
          { speaker: 'Toi', line: 'Bonjour, combien coûtent les tomates ?', translation: 'Hola, ¿cuánto cuestan los tomates?' },
          { speaker: 'Le vendeur', line: 'Deux euros le kilo.', translation: 'Dos euros el kilo.' },
          { speaker: 'Toi', line: 'J’en voudrais un kilo, s’il vous plaît.', translation: 'Quisiera un kilo, por favor.' },
          { speaker: 'Le vendeur', line: 'Voilà, ça fait deux euros.', translation: 'Aquí tiene, son dos euros.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Simule un dialogue complet au marché : salue, demande un prix, précise une quantité et paie.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Répète le dialogue avec un/une camarade en changeant le produit et le prix.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Mes achats de la semaine',
        description: 'Décris tes achats au passé composé.',
        mission: 'Écris 80 à 100 mots pour raconter ce que tu as acheté la semaine dernière, où et combien tu as payé.',
        phrases: ['J’ai acheté...', 'J’ai payé...', 'C’était moins cher que...', 'J’ai choisi...'],
        dialogue: [
          { speaker: 'Modèle', line: 'La semaine dernière, j’ai acheté des fruits au marché. J’ai payé cinq euros. C’était moins cher qu’au supermarché.', translation: 'La semana pasada compré fruta en el mercado. Pagué cinco euros. Era más barato que en el supermercado.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 80 à 100 mots au passé composé sur tes achats de la semaine, en utilisant au moins un comparatif et un pronom (le/la/les).', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le passé composé avec avoir',
        description: 'Former le passé composé pour raconter une action terminée.',
        grammarNote: 'Le passé composé se forme avec avoir au présent + le participe passé du verbe : acheter → acheté, choisir → choisi, faire → fait. Exemple : « J’ai acheté des fraises. Nous avons choisi un fromage. » On l’utilise pour parler d’une action ponctuelle et terminée dans le passé.',
        phrases: ['J’ai acheté...', 'Tu as choisi...', 'Elle a payé...', 'Nous avons pris...'],
        exercises: [
          { type: 'mcq', prompt: 'Hier, j’___ des fraises au marché.', options: ['ai acheté', 'achète', 'achetais', 'acheter'], answer: 0 },
          { type: 'mcq', prompt: 'Léa et Camila ___ un fromage de chèvre.', options: ['choisissent', 'ont choisi', 'choisir', 'choisissaient'], answer: 1 },
          { type: 'mcq', prompt: 'Tu ___ combien pour les tomates ?', options: ['payes', 'as payé', 'paie', 'payer'], answer: 1 },
          { type: 'mcq', prompt: 'Quel est le participe passé du verbe « faire » ?', options: ['fait', 'faisé', 'faisait', 'faire'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire des achats',
        description: 'Le vocabulaire essentiel pour faire des courses et acheter des vêtements.',
        vocabulary: [
          { word: 'le marché', translation: 'el mercado', example: 'Je vais au marché le samedi matin.' },
          { word: 'combien ça coûte ?', translation: '¿cuánto cuesta?', example: 'Combien ça coûte, un kilo de tomates ?' },
          { word: 'un kilo', translation: 'un kilo', example: 'Je voudrais un kilo de pommes.' },
          { word: 'cher / pas cher', translation: 'caro / barato', example: 'Les fraises sont un peu chères aujourd’hui.' },
          { word: 'la monnaie', translation: 'el cambio', example: 'Voici votre monnaie, madame.' },
          { word: 'la taille', translation: 'la talla', example: 'Quelle taille faites-vous ?' },
          { word: 'essayer', translation: 'probarse', example: 'Je peux essayer cette veste ?' },
          { word: 'la caisse', translation: 'la caja', example: 'Passez à la caisse, s’il vous plaît.' },
          { word: 'le reçu', translation: 'el recibo', example: 'Gardez le reçu pour un éventuel échange.' },
          { word: 'échanger', translation: 'cambiar', example: 'Je voudrais échanger ce pull, il est trop petit.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « combien ça coûte ? » ?', options: ['¿Dónde está?', '¿Cuánto cuesta?', '¿Cuándo llega?', '¿Quién es?'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « la taille » ?', options: ['El precio', 'La talla', 'El recibo', 'La caja'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « échanger » ?', options: ['Pagar', 'Probarse', 'Cambiar', 'Vender'], answer: 2 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Dans un magasin de vêtements',
        description: 'Karim aide Camila à choisir une veste dans un magasin du centre-ville.',
        intro: 'Camila a besoin d’une veste pour l’hiver. Karim l’accompagne dans un magasin.',
        dialogue: [
          { speaker: 'Camila', line: 'Bonjour, je peux essayer cette veste en taille M ?', translation: 'Hola, ¿puedo probarme esta chaqueta en talla M?' },
          { speaker: 'La vendeuse', line: 'Bien sûr, la cabine d’essayage est là-bas.', translation: 'Claro, el probador está allí.' },
          { speaker: 'Camila', line: 'Elle est un peu petite. Vous avez la taille L ?', translation: 'Me queda un poco pequeña. ¿Tienen la talla L?' },
          { speaker: 'La vendeuse', line: 'Oui, voilà. Elle est plus grande et moins chère aussi.', translation: 'Sí, aquí tiene. Es más grande y también más barata.' },
          { speaker: 'Karim', line: 'Elle te va très bien, Camila !', translation: '¡Te queda muy bien, Camila!' },
          { speaker: 'Camila', line: 'Parfait, je la prends !', translation: '¡Perfecto, me la llevo!' }
        ],
        phrases: ['Je peux essayer... ?', 'C’est un peu petit/grand.', 'Vous avez la taille... ?', 'Je la prends !'],
        exercises: [
          { type: 'mcq', prompt: 'Pourquoi Camila veut-elle une nouvelle taille ?', options: ['La couleur ne lui plaît pas', 'La veste est trop petite', 'La veste est trop chère', 'Elle a changé d’avis'], answer: 1 },
          { type: 'mcq', prompt: 'Qui accompagne Camila au magasin ?', options: ['Léa', 'Karim', 'Madame Lambert', 'Personne'], answer: 1 },
          { type: 'mcq', prompt: 'Que décide finalement Camila ?', options: ['Elle n’achète rien', 'Elle prend la veste en taille L', 'Elle prend la veste en taille M', 'Elle revient un autre jour'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'au-restaurant',
    title: 'Au restaurant',
    titleEs: 'En el restaurante',
    description: 'La famille Lambert fête l’anniversaire de Léa au restaurant et Camila apprend à commander et à réclamer poliment.',
    order: 2,
    accessTier: 'free',
    unitOverview: {
      objective: 'Réserver une table, commander un repas et exprimer poliment une préférence ou une plainte.',
      outcomes: [
        'réserver une table par téléphone',
        'commander un repas et poser des questions sur un plat',
        'exprimer une obligation avec devoir/il faut',
        'faire une réclamation polie avec « pourriez-vous »'
      ],
      grammar: ['vouloir/pouvoir au conditionnel de politesse', 'devoir et il faut', 'négations ne... jamais/plus/rien'],
      vocabulary: ['réserver une table', 'la carte', 'l’addition', 'pourriez-vous...'],
      scenario: 'La famille Lambert fête l’anniversaire de Léa dans un restaurant du centre-ville.'
    },
    activities: {
      reading: activity('reading', {
        title: 'L’anniversaire de Léa',
        description: 'La famille Lambert célèbre l’anniversaire de Léa au restaurant « Le Petit Jardin ».',
        reading: {
          title: 'L’anniversaire de Léa',
          parts: [
            "Pour l'anniversaire de Léa, Monsieur Lambert a réservé une table au restaurant « Le Petit Jardin ». Il a appelé la semaine précédente : « Je voudrais réserver une table pour cinq personnes, samedi soir. » À vingt heures, le restaurant était complet, mais il restait de la place à vingt et une heures trente. Monsieur Lambert a accepté sans hésiter, car l'important était de fêter l'anniversaire ensemble.",
            "Le samedi soir, toute la famille arrive au restaurant, avec Camila. Le serveur leur apporte la carte et explique les spécialités du jour. « Il faut absolument goûter les pâtes maison », dit-il en souriant. Léa hésite entre le poisson et les pâtes, mais elle décide finalement de suivre le conseil du serveur. Camila, elle, commande le poulet aux légumes, et Karim, invité pour l'occasion, choisit une pizza.",
            "Pendant le repas, tout le monde discute et rit. Mais quand les plats arrivent, Camila remarque que sa soupe n'est plus très chaude. Elle appelle poliment le serveur : « Excusez-moi, mais ma soupe n'est plus chaude, pourriez-vous la réchauffer ? » Le serveur s'excuse immédiatement et l'emporte en cuisine. Quelques minutes plus tard, la soupe revient, parfaite. À la fin du repas, le serveur offre un dessert gratuit pour l'anniversaire de Léa, avec une bougie. Toute la table chante « Joyeux anniversaire », et Léa souffle la bougie en souriant, entourée de sa famille et de ses amis."
          ],
          questions: [
            'Pourquoi Monsieur Lambert a-t-il dû accepter une heure plus tardive ?',
            'Que recommande le serveur ?',
            'Comment Camila réagit-elle quand sa soupe n’est plus chaude ?'
          ],
          ordering: {
            prompt: 'Remets les événements de l’histoire dans l’ordre.',
            events: [
              'Monsieur Lambert réserve une table pour cinq personnes.',
              'Le serveur recommande les pâtes maison.',
              'Camila signale poliment que sa soupe n’est plus chaude.',
              'Le serveur offre un dessert gratuit pour l’anniversaire de Léa.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Pour combien de personnes Monsieur Lambert réserve-t-il ?', options: ['Trois', 'Quatre', 'Cinq', 'Six'], answer: 2 },
          { type: 'mcq', prompt: 'À quelle heure la famille a-t-elle finalement une table ?', options: ['Vingt heures', 'Vingt et une heures trente', 'Dix-neuf heures', 'Vingt-deux heures'], answer: 1 },
          { type: 'mcq', prompt: 'Que recommande le serveur ?', options: ['La pizza', 'Les pâtes maison', 'La soupe', 'Le poulet'], answer: 1 },
          { type: 'mcq', prompt: 'Que commande Camila ?', options: ['Une pizza', 'Des pâtes', 'Le poulet aux légumes', 'Le poisson'], answer: 2 },
          { type: 'mcq', prompt: 'Pourquoi Camila appelle-t-elle le serveur ?', options: ['Pour demander l’addition', 'Parce que sa soupe n’est plus chaude', 'Pour changer de table', 'Pour commander un dessert'], answer: 1 },
          { type: 'mcq', prompt: 'Comment le serveur réagit-il à la remarque de Camila ?', options: ['Il l’ignore', 'Il s’excuse et réchauffe la soupe', 'Il se fâche', 'Il annule la commande'], answer: 1 },
          { type: 'mcq', prompt: 'Que fait le serveur à la fin du repas ?', options: ['Il demande l’addition immédiatement', 'Il offre un dessert gratuit pour l’anniversaire', 'Il propose une autre table', 'Il ferme le restaurant'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Karim est invité pour l’occasion.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Dans le texte, « sans hésiter » signifie...', options: ['Après beaucoup de réflexion', 'Immédiatement, sans doute', 'En refusant', 'En pleurant'], answer: 1 },
          { type: 'mcq', prompt: 'Quel est le sentiment général à la fin du texte ?', options: ['La déception', 'La joie et la célébration', 'La colère', 'L’ennui'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Je voudrais réserver une table',
        description: 'Écoute Monsieur Lambert qui réserve une table par téléphone.',
        intro: 'Écoute l’appel de Monsieur Lambert au restaurant « Le Petit Jardin ».',
        dialogue: [
          { speaker: 'M. Lambert', line: 'Bonjour, je voudrais réserver une table pour ce week-end.', translation: 'Hola, quisiera reservar una mesa para este fin de semana.' },
          { speaker: 'Le restaurant', line: 'Bien sûr, c’est pour combien de personnes ?', translation: 'Claro, ¿para cuántas personas?' },
          { speaker: 'M. Lambert', line: 'Pour cinq personnes, samedi soir à vingt heures.', translation: 'Para cinco personas, el sábado por la noche a las ocho.' },
          { speaker: 'Le restaurant', line: 'Désolé, nous sommes complets à vingt heures. Il reste de la place à vingt et une heures trente.', translation: 'Lo siento, estamos completos a las ocho. Queda lugar a las nueve y media.' },
          { speaker: 'M. Lambert', line: 'D’accord, c’est parfait. Au nom de Lambert, merci.', translation: 'De acuerdo, está perfecto. A nombre de Lambert, gracias.' }
        ],
        phrases: ['Je voudrais réserver...', 'C’est pour combien de personnes ?', 'Nous sommes complets.', 'Au nom de...'],
        exercises: [
          { type: 'mcq', prompt: 'Pour combien de personnes M. Lambert réserve-t-il ?', options: ['Trois', 'Quatre', 'Cinq', 'Six'], answer: 2 },
          { type: 'mcq', prompt: 'Pourquoi le restaurant ne peut-il pas accueillir la famille à vingt heures ?', options: ['Il est fermé', 'Il est complet', 'Il n’y a pas de menu', 'Le personnel est en congé'], answer: 1 },
          { type: 'mcq', prompt: 'À quel nom est faite la réservation ?', options: ['Dubois', 'Lambert', 'Léa', 'Camila'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Commander au restaurant',
        description: 'Simule une commande complète au restaurant.',
        mission: 'Choisis une entrée, un plat et une boisson, puis demande l’addition à la fin.',
        phrases: ['Je voudrais...', 'Comme entrée/plat, je prends...', 'L’addition, s’il vous plaît.', 'Pourriez-vous... ?'],
        dialogue: [
          { speaker: 'Le serveur', line: 'Bonsoir, vous avez choisi ?', translation: 'Buenas noches, ¿ya eligió?' },
          { speaker: 'Toi', line: 'Oui, comme entrée, la soupe, et comme plat, le poulet.', translation: 'Sí, de entrada la sopa, y de plato principal el pollo.' },
          { speaker: 'Le serveur', line: 'Très bien, et comme boisson ?', translation: 'Muy bien, ¿y para beber?' },
          { speaker: 'Toi', line: 'De l’eau, merci. Et l’addition à la fin, s’il vous plaît.', translation: 'Agua, gracias. Y la cuenta al final, por favor.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Commande un repas complet (entrée, plat, boisson) et demande l’addition.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, joue la scène du serveur et du client au restaurant.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Critique de restaurant',
        description: 'Écris une critique de restaurant.',
        mission: 'Écris 100 à 130 mots décrivant un dîner au restaurant : ce que tu as commandé, un point positif et un point négatif.',
        phrases: ['J’ai commandé...', 'Le service était...', 'Je recommande...', 'Dans l’ensemble...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Samedi soir, j’ai dîné au restaurant « Le Petit Jardin ». J’ai commandé le poulet aux légumes, c’était délicieux. Le service était un peu lent, mais dans l’ensemble, je recommande ce restaurant.', translation: 'El sábado por la noche cené en el restaurante "Le Petit Jardin". Pedí pollo con verduras, estaba delicioso. El servicio fue un poco lento, pero en general, recomiendo este restaurante.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 100 à 130 mots pour décrire un dîner au restaurant, avec un point positif, un point négatif et une recommandation finale.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Devoir, il faut et les négations',
        description: 'Exprimer une obligation et utiliser les négations ne... jamais / ne... plus / ne... rien.',
        grammarNote: '« Devoir » se conjugue selon la personne (je dois, tu dois, il/elle doit) tandis que « il faut » est impersonnel, suivi d’un infinitif. Les négations ne... jamais (nunca), ne... plus (ya no) et ne... rien (nada) encadrent le verbe conjugué, comme ne... pas.',
        phrases: ['Il faut goûter...', 'Je dois choisir...', 'Il n’y a plus de...', 'Je ne mange jamais de...'],
        exercises: [
          { type: 'mcq', prompt: 'Il ___ absolument goûter les pâtes maison.', options: ['faut', 'faux', 'fait', 'fais'], answer: 0 },
          { type: 'mcq', prompt: 'Excusez-moi, ma soupe n’est ___ chaude.', options: ['pas', 'plus', 'jamais', 'rien'], answer: 1 },
          { type: 'mcq', prompt: 'Je ___ choisir entre le poisson et les pâtes.', options: ['dois', 'doit', 'devons', 'devez'], answer: 0 },
          { type: 'mcq', prompt: 'Il n’y a ___ de pain, désolé.', options: ['jamais', 'rien', 'plus', 'pas encore'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire du restaurant',
        description: 'Le vocabulaire essentiel pour réserver, commander et réclamer poliment.',
        vocabulary: [
          { word: 'réserver une table', translation: 'reservar una mesa', example: 'Je voudrais réserver une table pour ce soir.' },
          { word: 'la carte / le menu', translation: 'la carta / el menú', example: 'Est-ce que je peux voir la carte ?' },
          { word: 'l’entrée, le plat, le dessert', translation: 'la entrada, el plato principal, el postre', example: 'Comme entrée, je vais prendre la salade.' },
          { word: 'l’addition', translation: 'la cuenta', example: 'L’addition, s’il vous plaît.' },
          { word: 'pourriez-vous... ?', translation: '¿podría usted...?', example: 'Pourriez-vous réchauffer mon plat ?' },
          { word: 'complet', translation: 'completo', example: 'Désolé, nous sommes complets ce soir.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « l’addition » ?', options: ['El menú', 'La cuenta', 'La reserva', 'La cocina'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « pourriez-vous... ? » ?', options: ['¿Podría usted...?', '¿Dónde está...?', '¿Cuánto cuesta...?', '¿Qué hora es...?'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « complet » ?', options: ['Vacío', 'Completo', 'Barato', 'Cerca'], answer: 1 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Une soupe pas assez chaude',
        description: 'Camila fait une réclamation polie au restaurant.',
        intro: 'Pendant le dîner d’anniversaire de Léa, Camila remarque que sa soupe n’est plus chaude.',
        dialogue: [
          { speaker: 'Camila', line: 'Excusez-moi, mais ma soupe n’est plus très chaude.', translation: 'Disculpe, pero mi sopa ya no está muy caliente.' },
          { speaker: 'Le serveur', line: 'Je suis désolé, je vais la faire réchauffer tout de suite.', translation: 'Lo siento, la voy a calentar enseguida.' },
          { speaker: 'Camila', line: 'Merci beaucoup. Et pourriez-vous apporter un peu plus de pain ?', translation: 'Muchas gracias. ¿Y podría traer un poco más de pan?' },
          { speaker: 'Le serveur', line: 'Bien sûr, tout de suite.', translation: 'Claro, enseguida.' },
          { speaker: 'Léa', line: 'Tu as bien fait de le signaler poliment, Camila.', translation: 'Hiciste bien en decirlo con amabilidad, Camila.' }
        ],
        phrases: ['Excusez-moi, mais...', 'Pourriez-vous... ?', 'Je suis désolé(e)...', 'Tout de suite.'],
        exercises: [
          { type: 'mcq', prompt: 'Quel est le problème de Camila ?', options: ['Le plat est trop épicé', 'La soupe n’est plus chaude', 'Il n’y a pas assez de pain', 'L’addition est trop élevée'], answer: 1 },
          { type: 'mcq', prompt: 'Que fait le serveur pour résoudre le problème ?', options: ['Il ignore la remarque', 'Il réchauffe la soupe', 'Il offre l’addition gratuite', 'Il change de restaurant'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit Léa à la fin ?', options: ['Que Camila a mal fait de se plaindre', 'Que Camila a bien fait de le signaler poliment', 'Qu’il ne faut jamais se plaindre', 'Que le serveur est impoli'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'se-deplacer',
    title: 'Se déplacer',
    titleEs: 'Desplazarse',
    description: 'Camila apprend à prendre le bus et à demander son chemin dans Tours.',
    order: 3,
    accessTier: 'free',
    unitOverview: {
      objective: 'Demander et comprendre un itinéraire, utiliser les transports en commun.',
      outcomes: [
        'demander son chemin',
        'comprendre des indications simples',
        'acheter un ticket de bus',
        'utiliser l’impératif pour donner une indication'
      ],
      grammar: ['impératif', 'prépositions de lieu', 'futur proche (révision)'],
      vocabulary: ['l’arrêt de bus', 'tout droit', 'tournez à gauche/à droite', 'le ticket'],
      scenario: 'Camila doit se rendre seule chez Karim pour la première fois.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Perdue dans Tours',
        description: 'Camila prend le bus toute seule pour la première fois et doit demander son chemin.',
        reading: {
          title: 'Perdue dans Tours',
          parts: [
            "Aujourd'hui, Camila doit aller chez Karim pour réviser ensemble, mais Léa est malade et ne peut pas l'accompagner. C'est la première fois que Camila prend le bus toute seule à Tours. Elle regarde le plan sur son téléphone : il faut prendre le bus numéro sept jusqu'à l'arrêt « Place Plumereau », puis marcher dix minutes.",
            "À l'arrêt de bus, Camila achète un ticket au distributeur automatique. Le bus arrive, elle monte et elle valide son ticket. Après quinze minutes, elle descend à l'arrêt « Place Plumereau », mais elle ne reconnaît pas la rue. Elle demande à une dame : « Excusez-moi, madame, pour aller rue des Tanneurs, s'il vous plaît ? » La dame répond gentiment : « Continuez tout droit, puis tournez à gauche après la boulangerie. C'est à environ cinq minutes. »",
            "Camila suit les indications avec attention : tout droit, puis à gauche après la boulangerie. Elle reconnaît enfin l'immeuble de Karim. Elle sonne, un peu fière d'elle-même. « Tu as trouvé sans problème ? » demande Karim en ouvrant la porte. « Presque ! Une dame très gentille m'a aidée », répond Camila en souriant. Elle est contente d'avoir réussi à se déplacer toute seule dans une nouvelle ville, en français, sans l'aide de Léa."
          ],
          questions: [
            'Pourquoi Camila prend-elle le bus toute seule aujourd’hui ?',
            'Quel bus doit-elle prendre ?',
            'Qui l’aide à trouver son chemin ?'
          ],
          ordering: {
            prompt: 'Remets les événements de l’histoire dans l’ordre.',
            events: [
              'Camila regarde le plan sur son téléphone.',
              'Elle achète un ticket et monte dans le bus.',
              'Elle demande son chemin à une dame.',
              'Elle arrive enfin chez Karim.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Pourquoi Léa n’accompagne-t-elle pas Camila ?', options: ['Elle est en voyage', 'Elle est malade', 'Elle ne veut pas y aller', 'Elle travaille'], answer: 1 },
          { type: 'mcq', prompt: 'Quel numéro de bus Camila doit-elle prendre ?', options: ['Le cinq', 'Le sept', 'Le neuf', 'Le douze'], answer: 1 },
          { type: 'mcq', prompt: 'Où Camila achète-t-elle son ticket ?', options: ['Dans le bus', 'Au distributeur automatique', 'Chez Karim', 'À l’école'], answer: 1 },
          { type: 'mcq', prompt: 'Que doit faire Camila après la boulangerie ?', options: ['Tourner à droite', 'Continuer tout droit', 'Tourner à gauche', 'S’arrêter'], answer: 2 },
          { type: 'mcq', prompt: 'Qui aide Camila à trouver son chemin ?', options: ['Karim', 'Une dame dans la rue', 'Un chauffeur de bus', 'Léa par téléphone'], answer: 1 },
          { type: 'mcq', prompt: 'Comment se sent Camila à la fin du texte ?', options: ['Fâchée', 'Fière d’elle-même', 'Triste', 'Fatiguée'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila avait déjà pris le bus seule avant.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « valider son ticket » signifie...', options: ['Acheter un ticket', 'Composter/activer le ticket', 'Jeter le ticket', 'Perdre le ticket'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’intention de Camila en racontant « presque » à Karim ?', options: ['Se plaindre', 'Minimiser l’aide qu’elle a reçue avec humour', 'Mentir sur son trajet', 'Se fâcher contre la dame'], answer: 1 },
          { type: 'mcq', prompt: 'Quel est le thème principal du texte ?', options: ['Un problème de bus non résolu', 'L’autonomie de Camila dans une nouvelle ville', 'Une dispute entre amis', 'Un cours de géographie'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Pour aller à... ?',
        description: 'Écoute Camila qui demande son chemin dans la rue.',
        intro: 'Écoute le dialogue entre Camila et une passante à Tours.',
        dialogue: [
          { speaker: 'Camila', line: 'Excusez-moi, madame, pour aller rue des Tanneurs, s’il vous plaît ?', translation: 'Disculpe, señora, ¿para ir a la calle des Tanneurs, por favor?' },
          { speaker: 'La dame', line: 'Continuez tout droit, puis tournez à gauche après la boulangerie.', translation: 'Continúe todo recto y luego gire a la izquierda después de la panadería.' },
          { speaker: 'Camila', line: 'D’accord, tout droit, puis à gauche. C’est loin ?', translation: 'De acuerdo, todo recto y luego a la izquierda. ¿Está lejos?' },
          { speaker: 'La dame', line: 'Non, c’est à environ cinq minutes à pied.', translation: 'No, está a unos cinco minutos a pie.' },
          { speaker: 'Camila', line: 'Merci beaucoup, madame !', translation: '¡Muchas gracias, señora!' }
        ],
        phrases: ['Pour aller à... ?', 'Tout droit', 'Tournez à gauche/à droite', 'C’est loin ?'],
        exercises: [
          { type: 'mcq', prompt: 'Où Camila veut-elle aller ?', options: ['À la gare', 'Rue des Tanneurs', 'À l’école', 'Chez Léa'], answer: 1 },
          { type: 'mcq', prompt: 'Après quoi faut-il tourner à gauche ?', options: ['La pharmacie', 'La boulangerie', 'L’église', 'Le musée'], answer: 1 },
          { type: 'mcq', prompt: 'À combien de minutes est le chemin ?', options: ['Deux minutes', 'Cinq minutes', 'Dix minutes', 'Vingt minutes'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Demander son chemin',
        description: 'Simule une demande d’itinéraire dans la rue.',
        mission: 'Demande poliment ton chemin vers un lieu, puis répète les indications reçues pour vérifier.',
        phrases: ['Pour aller à... ?', 'Vous pouvez répéter, s’il vous plaît ?', 'Tout droit, puis...', 'Merci beaucoup !'],
        dialogue: [
          { speaker: 'Toi', line: 'Excusez-moi, pour aller à la gare, s’il vous plaît ?', translation: 'Disculpe, ¿para ir a la estación, por favor?' },
          { speaker: 'Un passant', line: 'Tournez à droite, puis continuez tout droit.', translation: 'Gire a la derecha y luego continúe todo recto.' },
          { speaker: 'Toi', line: 'D’accord, à droite puis tout droit. Merci beaucoup !', translation: 'De acuerdo, a la derecha y luego recto. ¡Muchas gracias!' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Demande ton chemin vers trois lieux différents et répète chaque indication reçue.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, alternez les rôles du passant et de la personne qui demande son chemin.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Comment aller chez moi',
        description: 'Écris un itinéraire pour expliquer comment se rendre chez toi.',
        mission: 'Écris 80 à 100 mots pour expliquer, à l’impératif, comment aller de l’école jusqu’à chez toi.',
        phrases: ['Prenez le bus...', 'Continuez tout droit...', 'Tournez à...', 'C’est à... minutes.'],
        dialogue: [
          { speaker: 'Modèle', line: 'Pour aller chez moi, prenez le bus numéro sept. Descendez à l’arrêt « Centre-ville ». Continuez tout droit, puis tournez à gauche après la pharmacie. C’est à cinq minutes à pied.', translation: 'Para ir a mi casa, tome el autobús número siete. Baje en la parada "Centro". Continúe todo recto y luego gire a la izquierda después de la farmacia. Está a cinco minutos a pie.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 80 à 100 mots à l’impératif pour expliquer un itinéraire de ton choix.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'L’impératif',
        description: 'Donner un ordre ou une indication simple.',
        grammarNote: 'L’impératif se forme à partir du présent, sans pronom sujet, pour tu, nous et vous : « Tourne à gauche » (tu), « Tournons à gauche » (nous), « Tournez à gauche » (vous). Les verbes en -er perdent le « s » final à la forme « tu » : tu tournes → tourne !',
        phrases: ['Tourne / Tournez à gauche.', 'Continue / Continuez tout droit.', 'Prends / Prenez le bus.', 'Descends / Descendez ici.'],
        exercises: [
          { type: 'mcq', prompt: '(tu) ___ tout droit, puis tourne à gauche.', options: ['Continues', 'Continue', 'Continuez', 'Continuer'], answer: 1 },
          { type: 'mcq', prompt: '(vous) ___ le bus numéro sept.', options: ['Prend', 'Prends', 'Prenez', 'Prendre'], answer: 2 },
          { type: 'mcq', prompt: '(nous) ___ à l’arrêt suivant.', options: ['Descendons', 'Descendez', 'Descends', 'Descendre'], answer: 0 },
          { type: 'mcq', prompt: 'Quelle forme est correcte pour « tu » avec un verbe en -er ?', options: ['Tu tournes !', 'Tourne !', 'Tournez !', 'Tournons !'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire des déplacements',
        description: 'Le vocabulaire essentiel pour se déplacer en ville.',
        vocabulary: [
          { word: 'l’arrêt de bus', translation: 'la parada de autobús', example: 'L’arrêt de bus est juste là.' },
          { word: 'tout droit', translation: 'todo recto', example: 'Continuez tout droit jusqu’au feu.' },
          { word: 'tournez à gauche / à droite', translation: 'gire a la izquierda / a la derecha', example: 'Tournez à gauche après la boulangerie.' },
          { word: 'le ticket', translation: 'el boleto', example: 'N’oubliez pas de valider votre ticket.' },
          { word: 'le distributeur automatique', translation: 'la máquina expendedora', example: 'Achetez votre ticket au distributeur automatique.' },
          { word: 'c’est loin / c’est près', translation: 'está lejos / está cerca', example: 'Ce n’est pas loin, cinq minutes à pied.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « tout droit » ?', options: ['A la derecha', 'Todo recto', 'A la izquierda', 'Cerca'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « l’arrêt de bus » ?', options: ['La estación de tren', 'La parada de autobús', 'El aeropuerto', 'El taxi'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « valider un ticket » ?', options: ['Comprar un boleto', 'Perder un boleto', 'Activar un boleto', 'Tirar un boleto'], answer: 2 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Chez Karim, enfin !',
        description: 'Camila arrive chez Karim après son trajet en bus.',
        intro: 'Camila sonne chez Karim après avoir trouvé son chemin toute seule.',
        dialogue: [
          { speaker: 'Karim', line: 'Salut, Camila ! Tu as trouvé sans problème ?', translation: 'Hola, Camila. ¿Encontraste el camino sin problema?' },
          { speaker: 'Camila', line: 'Presque ! Une dame très gentille m’a aidée dans la rue.', translation: 'Casi. Una señora muy amable me ayudó en la calle.' },
          { speaker: 'Karim', line: 'C’est bien, tu deviens une vraie Tourangelle !', translation: '¡Qué bien, te estás convirtiendo en una verdadera tourangelle!' },
          { speaker: 'Camila', line: 'Ha ha, pas encore, mais je suis fière d’avoir réussi toute seule.', translation: 'Ja ja, todavía no, pero estoy orgullosa de haberlo logrado sola.' }
        ],
        phrases: ['Tu as trouvé sans problème ?', 'Presque !', 'Une dame m’a aidée.', 'Je suis fière de...'],
        exercises: [
          { type: 'mcq', prompt: 'Comment Camila a-t-elle trouvé son chemin ?', options: ['Toute seule, sans aide', 'Avec l’aide d’une dame dans la rue', 'Karim est venu la chercher', 'Elle a suivi Léa'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Karim complimente-t-il Camila ?', options: ['Il dit qu’elle est en retard', 'Il dit qu’elle devient une vraie Tourangelle', 'Il se moque d’elle', 'Il ne dit rien'], answer: 1 },
          { type: 'mcq', prompt: 'Comment se sent Camila à la fin du dialogue ?', options: ['Fâchée', 'Fière', 'Fatiguée', 'Inquiète'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'la-sante',
    title: 'La santé',
    titleEs: 'La salud',
    description: 'Camila ne se sent pas bien et va consulter un médecin avec Madame Lambert.',
    order: 4,
    accessTier: 'free',
    unitOverview: {
      objective: 'Décrire des symptômes simples et comprendre les conseils d’un médecin.',
      outcomes: [
        'décrire un symptôme',
        'prendre rendez-vous chez le médecin',
        'comprendre des conseils de santé',
        'utiliser les verbes pronominaux liés au corps'
      ],
      grammar: ['verbes pronominaux', 'avoir mal à...', 'devoir + infinitif'],
      vocabulary: ['avoir mal à la tête/gorge', 'la fièvre', 'le rendez-vous médical', 'le médicament'],
      scenario: 'Camila se sent fatiguée et a mal à la gorge depuis deux jours.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Chez le médecin',
        description: 'Camila ne se sent pas bien et Madame Lambert l’emmène chez le médecin.',
        reading: {
          title: 'Chez le médecin',
          parts: [
            "Depuis deux jours, Camila se sent fatiguée. Elle a mal à la gorge et un peu de fièvre. Madame Lambert remarque que Camila ne mange presque rien au dîner. « Ça ne va pas, Camila ? » demande-t-elle. « J'ai mal à la gorge et je me sens très fatiguée », répond Camila. Madame Lambert décide de prendre rendez-vous chez le médecin pour le lendemain matin.",
            "Le lendemain, elles arrivent chez le docteur Martin. « Bonjour, qu'est-ce qui ne va pas ? » demande-t-il. Camila explique : « J'ai mal à la gorge depuis deux jours, et j'ai un peu de fièvre. Je me sens très fatiguée aussi. » Le médecin l'examine, regarde sa gorge et prend sa température. « Vous avez une petite angine, rien de grave », dit-il. « Vous devez vous reposer, boire beaucoup d'eau et prendre ce médicament trois fois par jour. »",
            "Le médecin ajoute : « Il faut aussi éviter l'école pendant deux ou trois jours pour ne pas contaminer vos camarades. » Camila est un peu déçue de manquer les cours, mais elle est rassurée que ce ne soit pas grave. En sortant, Madame Lambert lui achète le médicament à la pharmacie et lui prépare une soupe chaude pour le soir. Camila se repose tout le week-end, et le lundi suivant, elle se sent enfin beaucoup mieux et peut retourner à l'école avec Léa et Karim."
          ],
          questions: [
            'Depuis combien de temps Camila se sent-elle fatiguée ?',
            'Que dit le médecin à Camila ?',
            'Pourquoi Camila doit-elle éviter l’école ?'
          ],
          ordering: {
            prompt: 'Remets les événements de l’histoire dans l’ordre.',
            events: [
              'Madame Lambert remarque que Camila ne mange presque rien.',
              'Elle prend rendez-vous chez le médecin.',
              'Le docteur Martin examine Camila et lui donne des conseils.',
              'Camila se repose et retourne à l’école le lundi suivant.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Depuis combien de temps Camila a-t-elle mal à la gorge ?', options: ['Un jour', 'Deux jours', 'Une semaine', 'Un mois'], answer: 1 },
          { type: 'mcq', prompt: 'Qui remarque que Camila ne va pas bien ?', options: ['Léa', 'Madame Lambert', 'Karim', 'Le médecin'], answer: 1 },
          { type: 'mcq', prompt: 'Que diagnostique le docteur Martin ?', options: ['Une grippe grave', 'Une petite angine', 'Rien du tout', 'Une allergie'], answer: 1 },
          { type: 'mcq', prompt: 'Combien de fois par jour Camila doit-elle prendre le médicament ?', options: ['Une fois', 'Deux fois', 'Trois fois', 'Quatre fois'], answer: 2 },
          { type: 'mcq', prompt: 'Pourquoi Camila doit-elle éviter l’école ?', options: ['Pour se reposer davantage seulement', 'Pour ne pas contaminer ses camarades', 'Parce que l’école est fermée', 'Parce qu’elle est punie'], answer: 1 },
          { type: 'mcq', prompt: 'Que fait Madame Lambert après la visite chez le médecin ?', options: ['Elle rentre directement à la maison', 'Elle achète le médicament et prépare une soupe', 'Elle emmène Camila au restaurant', 'Elle appelle Léa'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila est contente de manquer l’école.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « rassurée » signifie...', options: ['Encore plus inquiète', 'Soulagée, moins inquiète', 'En colère', 'Fatiguée'], answer: 1 },
          { type: 'mcq', prompt: 'Quand Camila retourne-t-elle à l’école ?', options: ['Le jour même', 'Le lendemain', 'Le lundi suivant', 'Jamais'], answer: 2 },
          { type: 'mcq', prompt: 'Quel est le ton général de l’histoire ?', options: ['Inquiétant du début à la fin', 'Rassurant, avec une bonne résolution', 'Triste et sans espoir', 'Comique'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Qu’est-ce qui ne va pas ?',
        description: 'Écoute la consultation de Camila chez le médecin.',
        intro: 'Écoute le dialogue entre Camila et le docteur Martin.',
        dialogue: [
          { speaker: 'Le médecin', line: 'Bonjour, qu’est-ce qui ne va pas ?', translation: 'Hola, ¿qué le pasa?' },
          { speaker: 'Camila', line: 'J’ai mal à la gorge et un peu de fièvre.', translation: 'Me duele la garganta y tengo un poco de fiebre.' },
          { speaker: 'Le médecin', line: 'Depuis combien de temps ?', translation: '¿Desde hace cuánto tiempo?' },
          { speaker: 'Camila', line: 'Depuis deux jours.', translation: 'Desde hace dos días.' },
          { speaker: 'Le médecin', line: 'Vous devez vous reposer et prendre ce médicament trois fois par jour.', translation: 'Debe descansar y tomar este medicamento tres veces al día.' }
        ],
        phrases: ['Qu’est-ce qui ne va pas ?', 'J’ai mal à...', 'Depuis combien de temps ?', 'Vous devez...'],
        exercises: [
          { type: 'mcq', prompt: 'De quoi Camila se plaint-elle ?', options: ['Mal à la tête', 'Mal à la gorge et fièvre', 'Mal au ventre', 'Mal aux dents'], answer: 1 },
          { type: 'mcq', prompt: 'Depuis quand a-t-elle ces symptômes ?', options: ['Un jour', 'Deux jours', 'Une semaine', 'Un mois'], answer: 1 },
          { type: 'mcq', prompt: 'Combien de fois par jour doit-elle prendre le médicament ?', options: ['Une fois', 'Deux fois', 'Trois fois', 'Quatre fois'], answer: 2 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Décrire un symptôme',
        description: 'Simule une consultation médicale simple.',
        mission: 'Décris un symptôme au médecin (mal à la tête, à la gorge, au ventre...) et écoute ses conseils.',
        phrases: ['J’ai mal à...', 'Je me sens...', 'Depuis quand... ?', 'Je dois...'],
        dialogue: [
          { speaker: 'Le médecin', line: 'Qu’est-ce qui ne va pas ?', translation: '¿Qué le pasa?' },
          { speaker: 'Toi', line: 'J’ai mal à la tête depuis ce matin.', translation: 'Me duele la cabeza desde esta mañana.' },
          { speaker: 'Le médecin', line: 'Vous devez vous reposer et boire de l’eau.', translation: 'Debe descansar y beber agua.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Décris trois symptômes différents et les conseils que le médecin pourrait donner.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Avec un/une camarade, joue la scène du médecin et du patient.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Un message à l’infirmerie',
        description: 'Écris un message pour expliquer pourquoi tu ne peux pas aller en cours.',
        mission: 'Écris 80 à 100 mots pour expliquer tes symptômes et pourquoi tu dois rester chez toi.',
        phrases: ['J’ai mal à...', 'Je me sens...', 'Le médecin a dit que...', 'Je dois...'],
        dialogue: [
          { speaker: 'Modèle', line: 'Bonjour, je ne peux pas venir en cours aujourd’hui. J’ai mal à la gorge et de la fièvre depuis deux jours. Le médecin a dit que je dois me reposer et éviter l’école pendant trois jours.', translation: 'Hola, no puedo venir a clase hoy. Me duele la garganta y tengo fiebre desde hace dos días. El médico dijo que debo descansar y evitar la escuela durante tres días.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 80 à 100 mots pour expliquer un symptôme et les conseils reçus du médecin.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Avoir mal à... et les verbes pronominaux',
        description: 'Décrire un symptôme et parler du corps avec les verbes pronominaux.',
        grammarNote: '« Avoir mal à » + partie du corps décrit une douleur : j’ai mal à la tête, à la gorge, au ventre. Les verbes pronominaux (se sentir, se reposer) utilisent un pronom réfléchi qui s’accorde avec le sujet : je me sens, tu te sens, il/elle se sent, nous nous sentons.',
        phrases: ['J’ai mal à la tête.', 'Je me sens fatigué(e).', 'Tu dois te reposer.', 'Elle se sent mieux.'],
        exercises: [
          { type: 'mcq', prompt: 'J’ai mal ___ gorge.', options: ['au', 'à la', 'à l’', 'aux'], answer: 1 },
          { type: 'mcq', prompt: 'Je ___ fatiguée depuis ce matin.', options: ['sens', 'me sens', 'sentent', 'sentir'], answer: 1 },
          { type: 'mcq', prompt: 'Tu dois ___ pendant deux jours.', options: ['te reposer', 'reposer', 'se reposer', 'reposant'], answer: 0 },
          { type: 'mcq', prompt: 'Ils ___ beaucoup mieux aujourd’hui.', options: ['se sent', 'se sentent', 'sentent', 'se sens'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de la santé',
        description: 'Le vocabulaire essentiel pour décrire un symptôme chez le médecin.',
        vocabulary: [
          { word: 'avoir mal à la tête/gorge', translation: 'tener dolor de cabeza/garganta', example: 'J’ai mal à la tête depuis ce matin.' },
          { word: 'la fièvre', translation: 'la fiebre', example: 'Elle a un peu de fièvre.' },
          { word: 'le rendez-vous médical', translation: 'la cita médica', example: 'J’ai un rendez-vous médical demain matin.' },
          { word: 'le médicament', translation: 'el medicamento', example: 'Prenez ce médicament trois fois par jour.' },
          { word: 'se reposer', translation: 'descansar', example: 'Vous devez vous reposer.' },
          { word: 'la pharmacie', translation: 'la farmacia', example: 'J’achète le médicament à la pharmacie.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « la fièvre » ?', options: ['El dolor', 'La fiebre', 'La receta', 'El descanso'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « se reposer » ?', options: ['Trabajar', 'Descansar', 'Comer', 'Caminar'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « le rendez-vous médical » ?', options: ['La farmacia', 'La cita médica', 'El hospital', 'El medicamento'], answer: 1 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'De retour à l’école',
        description: 'Camila retourne à l’école après s’être reposée et retrouve Léa et Karim.',
        intro: 'Le lundi matin, Camila se sent enfin mieux et retrouve ses amis.',
        dialogue: [
          { speaker: 'Léa', line: 'Tu vas mieux, Camila ? Tu nous as manqué !', translation: '¿Estás mejor, Camila? ¡Te extrañamos!' },
          { speaker: 'Camila', line: 'Oui, beaucoup mieux, merci ! J’ai bien dormi et j’ai pris mon médicament.', translation: 'Sí, mucho mejor, ¡gracias! Dormí bien y tomé mi medicamento.' },
          { speaker: 'Karim', line: 'On a pris des notes pour toi en cours.', translation: 'Tomamos apuntes por ti en clase.' },
          { speaker: 'Camila', line: 'Merci beaucoup, vous êtes de vrais amis !', translation: '¡Muchas gracias, son verdaderos amigos!' }
        ],
        phrases: ['Tu vas mieux ?', 'Tu nous as manqué.', 'J’ai pris mon médicament.', 'Vous êtes de vrais amis.'],
        exercises: [
          { type: 'mcq', prompt: 'Comment se sent Camila ce lundi matin ?', options: ['Toujours malade', 'Beaucoup mieux', 'Un peu pire', 'Fatiguée mais pas malade'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’ont fait Léa et Karim pendant l’absence de Camila ?', options: ['Rien de spécial', 'Ils ont pris des notes pour elle', 'Ils ont annulé les cours', 'Ils sont allés chez le médecin'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila remercie-t-elle ses amis ?', options: ['Elle ne dit rien', 'Elle dit qu’ils sont de vrais amis', 'Elle se fâche', 'Elle repart tout de suite'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'la-vie-quotidienne',
    title: 'La vie quotidienne',
    titleEs: 'La vida cotidiana',
    description: 'Camila décrit sa routine chez les Lambert, ses horaires et l’organisation de sa semaine.',
    order: 5,
    accessTier: 'free',
    unitOverview: {
      objective: 'Décrire une routine détaillée avec des horaires et des adverbes de fréquence.',
      outcomes: [
        'décrire une routine avec précision',
        'utiliser les adverbes de fréquence',
        'utiliser les verbes pronominaux du quotidien',
        'organiser un récit avec des connecteurs temporels'
      ],
      grammar: ['verbes pronominaux', 'adverbes de fréquence', 'prépositions de temps'],
      vocabulary: ['se réveiller', 'toujours / souvent / parfois / jamais', 'l’emploi du temps', 'd’habitude'],
      scenario: 'Camila explique sa nouvelle routine à sa mère, par appel vidéo depuis Tours.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Ma nouvelle routine à Tours',
        description: 'Camila explique à sa mère comment se passe une journée typique chez les Lambert.',
        reading: {
          title: 'Ma nouvelle routine à Tours',
          parts: [
            "« Alors, raconte-moi ta journée typique ! » demande la mère de Camila pendant leur appel vidéo du dimanche. Camila sourit et commence : « D'habitude, je me réveille à sept heures. Je me lave, je m'habille, puis je prends le petit-déjeuner avec toute la famille Lambert. On mange souvent des tartines et on boit toujours du chocolat chaud. Ensuite, je pars à l'école avec Léa vers huit heures moins le quart. »",
            "« Et l'après-midi ? » demande sa mère, curieuse. « Les cours finissent généralement vers dix-sept heures. Après, je fais souvent mes devoirs avec Karim à la bibliothèque, puis je rentre à la maison vers dix-huit heures trente. Le mercredi, par contre, je ne rentre jamais directement : j'ai un cours de danse avec Léa. C'est mon activité préférée de la semaine ! » Camila continue : « Le soir, on dîne tous ensemble vers dix-neuf heures trente, on discute, et je me couche généralement vers vingt-deux heures. »",
            "« Tu ne t'ennuies jamais ? » demande sa mère en riant. « Jamais ! Parfois, le week-end, on sort avec Karim et Léa, on va au cinéma ou on se promène en ville. J'adore cette routine, elle est différente de celle que j'avais à Saint-Domingue, mais je m'y suis vite habituée. » Sa mère, rassurée, sourit à l'écran : « Je vois que tu es vraiment bien organisée maintenant ! »"
          ],
          questions: [
            'À quelle heure Camila se réveille-t-elle ?',
            'Que fait-elle le mercredi après les cours ?',
            'Comment Camila décrit-elle sa nouvelle routine ?'
          ],
          ordering: {
            prompt: 'Remets les événements de la journée de Camila dans l’ordre.',
            events: [
              'Camila se réveille et prend le petit-déjeuner.',
              'Elle va à l’école avec Léa.',
              'Elle fait ses devoirs avec Karim à la bibliothèque.',
              'Toute la famille dîne ensemble le soir.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'À quelle heure Camila se réveille-t-elle d’habitude ?', options: ['Six heures', 'Sept heures', 'Huit heures', 'Neuf heures'], answer: 1 },
          { type: 'mcq', prompt: 'Que boit toujours la famille au petit-déjeuner ?', options: ['Du café', 'Du jus d’orange', 'Du chocolat chaud', 'Du thé'], answer: 2 },
          { type: 'mcq', prompt: 'À quelle heure finissent généralement les cours ?', options: ['Seize heures', 'Dix-sept heures', 'Dix-huit heures', 'Dix-neuf heures'], answer: 1 },
          { type: 'mcq', prompt: 'Que fait Camila le mercredi après les cours ?', options: ['Elle fait ses devoirs', 'Elle a un cours de danse', 'Elle rentre directement', 'Elle regarde la télévision'], answer: 1 },
          { type: 'mcq', prompt: 'À quelle heure la famille dîne-t-elle ?', options: ['Dix-huit heures', 'Dix-neuf heures trente', 'Vingt et une heures', 'Vingt-deux heures'], answer: 1 },
          { type: 'mcq', prompt: 'Que fait Camila le week-end, selon le texte ?', options: ['Elle reste toujours seule', 'Elle sort parfois avec Karim et Léa', 'Elle travaille', 'Elle voyage chaque semaine'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila s’ennuie souvent dans sa nouvelle routine.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « je m’y suis vite habituée » signifie...', options: ['Elle a mis longtemps à s’adapter', 'Elle s’est adaptée rapidement', 'Elle n’aime pas sa routine', 'Elle a changé de routine'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’activité préférée de la semaine de Camila ?', options: ['Les devoirs à la bibliothèque', 'Le dîner en famille', 'Le cours de danse du mercredi', 'Le petit-déjeuner'], answer: 2 },
          { type: 'mcq', prompt: 'Quel est le ton général de la conversation ?', options: ['Inquiet et tendu', 'Chaleureux et rassurant', 'Fâché', 'Indifférent'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'L’emploi du temps de Camila',
        description: 'Écoute Camila qui décrit son emploi du temps de la semaine à Karim.',
        intro: 'Écoute Camila expliquer à Karim comment s’organise sa semaine.',
        dialogue: [
          { speaker: 'Karim', line: 'Tu as un emploi du temps chargé cette semaine ?', translation: '¿Tienes un horario cargado esta semana?' },
          { speaker: 'Camila', line: 'Assez, oui. Le lundi et le jeudi, j’ai cours jusqu’à dix-sept heures.', translation: 'Bastante, sí. Los lunes y jueves tengo clases hasta las cinco.' },
          { speaker: 'Karim', line: 'Et le mercredi, tu as toujours ton cours de danse ?', translation: '¿Y los miércoles siempre tienes tu clase de baile?' },
          { speaker: 'Camila', line: 'Oui, toujours ! Je ne le rate jamais, j’adore ça.', translation: 'Sí, ¡siempre! Nunca me la pierdo, me encanta.' },
          { speaker: 'Karim', line: 'D’accord, alors on se voit à la bibliothèque le vendredi comme d’habitude ?', translation: 'De acuerdo, ¿entonces nos vemos en la biblioteca el viernes como siempre?' }
        ],
        phrases: ['un emploi du temps chargé', 'jusqu’à...', 'toujours / jamais', 'comme d’habitude'],
        exercises: [
          { type: 'mcq', prompt: 'Jusqu’à quelle heure Camila a-t-elle cours le lundi et le jeudi ?', options: ['Seize heures', 'Dix-sept heures', 'Dix-huit heures', 'Dix-neuf heures'], answer: 1 },
          { type: 'mcq', prompt: 'Quel jour Camila a-t-elle son cours de danse ?', options: ['Le lundi', 'Le mercredi', 'Le jeudi', 'Le vendredi'], answer: 1 },
          { type: 'mcq', prompt: 'Où se voient Camila et Karim le vendredi ?', options: ['Au cinéma', 'À la bibliothèque', 'Chez Léa', 'Au marché'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila décrit-elle son cours de danse ?', options: ['Elle le rate souvent', 'Elle ne le rate jamais', 'Elle n’aime pas ça', 'Elle vient d’arrêter'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Décris ta routine',
        description: 'Décris ta propre routine quotidienne avec des adverbes de fréquence.',
        mission: 'Décris ta journée typique à voix haute, du réveil au coucher, en utilisant au moins trois adverbes de fréquence (toujours, souvent, parfois, jamais).',
        phrases: ['D’habitude, je...', 'Je me réveille à...', 'Je... toujours/souvent/parfois.', 'Le soir, je...'],
        dialogue: [
          { speaker: 'Toi', line: 'D’habitude, je me réveille à sept heures et je prends toujours un café.', translation: 'Normalmente me despierto a las siete y siempre tomo un café.' },
          { speaker: 'Toi', line: 'Le week-end, je sors parfois avec mes amis.', translation: 'El fin de semana a veces salgo con mis amigos.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Décris ta routine quotidienne complète, du matin au soir, avec des adverbes de fréquence.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Compare ta routine avec celle d’un/une camarade et trouvez trois différences.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Mon emploi du temps',
        description: 'Décris ton emploi du temps hebdomadaire.',
        mission: 'Écris 80 à 100 mots pour décrire ton emploi du temps de la semaine, avec des horaires précis et des adverbes de fréquence.',
        phrases: ['D’habitude...', 'Le lundi, je...', 'Je... toujours/souvent/parfois/jamais.', 'Le week-end...'],
        dialogue: [
          { speaker: 'Modèle', line: 'D’habitude, je me réveille à sept heures. Le lundi et le mercredi, j’ai cours jusqu’à dix-sept heures. Je fais souvent mes devoirs le soir, mais je ne travaille jamais après vingt-deux heures.', translation: 'Normalmente me despierto a las siete. Los lunes y miércoles tengo clases hasta las cinco. A menudo hago mis deberes por la noche, pero nunca trabajo después de las diez.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 80 à 100 mots décrivant ton emploi du temps hebdomadaire, avec au moins trois adverbes de fréquence.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Les adverbes de fréquence et les verbes pronominaux',
        description: 'Exprimer la fréquence d’une action et décrire des actions réfléchies.',
        grammarNote: 'Les adverbes de fréquence (toujours, souvent, parfois, rarement, jamais) se placent généralement après le verbe conjugué : « Je me réveille toujours à sept heures. » Les verbes pronominaux (se réveiller, se laver, s’habiller, se coucher) utilisent un pronom réfléchi qui change avec le sujet : je me réveille, tu te réveilles, il/elle se réveille, nous nous réveillons.',
        phrases: ['Je me réveille toujours à...', 'Il/elle s’habille souvent...', 'Nous nous couchons parfois...', 'Ils ne se lèvent jamais tôt.'],
        exercises: [
          { type: 'mcq', prompt: 'Je ___ toujours à sept heures.', options: ['réveille', 'me réveille', 'te réveilles', 'réveillent'], answer: 1 },
          { type: 'mcq', prompt: 'Léa et Camila ___ ensemble le matin.', options: ['s’habille', 's’habillent', 'habillent', 'habille'], answer: 1 },
          { type: 'mcq', prompt: 'Quel adverbe signifie « nunca » ?', options: ['Toujours', 'Souvent', 'Parfois', 'Jamais'], answer: 3 },
          { type: 'mcq', prompt: 'Nous ___ vers vingt-deux heures.', options: ['couchons', 'nous couchons', 'se couchent', 'couche'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire de la routine',
        description: 'Le vocabulaire essentiel pour décrire une journée typique.',
        vocabulary: [
          { word: 'se réveiller', translation: 'despertarse', example: 'Je me réveille à sept heures.' },
          { word: 'd’habitude', translation: 'de costumbre, normalmente', example: 'D’habitude, je prends le petit-déjeuner à huit heures.' },
          { word: 'toujours / souvent / parfois / jamais', translation: 'siempre / a menudo / a veces / nunca', example: 'Je ne suis jamais en retard.' },
          { word: 'l’emploi du temps', translation: 'el horario', example: 'Mon emploi du temps est très chargé cette semaine.' },
          { word: 'se coucher', translation: 'acostarse', example: 'Je me couche vers vingt-deux heures.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « se réveiller » ?', options: ['Acostarse', 'Despertarse', 'Ducharse', 'Vestirse'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « l’emploi du temps » ?', options: ['El trabajo', 'El horario', 'La rutina diaria', 'El descanso'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « d’habitude » ?', options: ['Nunca', 'De costumbre', 'A veces', 'Rara vez'], answer: 1 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Le dimanche chez les Lambert',
        description: 'Camila découvre la routine spéciale du dimanche chez la famille Lambert.',
        intro: 'C’est dimanche matin, et la routine chez les Lambert est différente du reste de la semaine.',
        dialogue: [
          { speaker: 'Mme Lambert', line: 'Le dimanche, on ne se réveille jamais tôt, on peut dormir plus longtemps.', translation: 'Los domingos nunca nos despertamos temprano, podemos dormir más.' },
          { speaker: 'Camila', line: 'C’est vrai, j’ai remarqué ! Et on prend toujours un grand petit-déjeuner.', translation: 'Es verdad, ¡lo noté! Y siempre tomamos un gran desayuno.' },
          { speaker: 'Léa', line: 'Oui, et l’après-midi, on se promène souvent au bord de la Loire.', translation: 'Sí, y por la tarde a menudo paseamos junto al Loira.' },
          { speaker: 'Camila', line: 'J’adore cette routine du dimanche, elle est très différente de la semaine !', translation: '¡Me encanta esta rutina del domingo, es muy diferente de la semana!' }
        ],
        phrases: ['On ne se réveille jamais tôt.', 'On prend toujours...', 'On se promène souvent...', 'C’est différent de...'],
        exercises: [
          { type: 'mcq', prompt: 'Que fait la famille le dimanche matin, selon Mme Lambert ?', options: ['Elle se réveille très tôt', 'Elle dort plus longtemps', 'Elle part immédiatement en ville', 'Elle travaille'], answer: 1 },
          { type: 'mcq', prompt: 'Que font-ils souvent l’après-midi ?', options: ['Ils regardent la télévision', 'Ils se promènent au bord de la Loire', 'Ils vont à l’école', 'Ils font les courses'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila trouve-t-elle la routine du dimanche ?', options: ['Ennuyeuse', 'Différente et agréable', 'Fatigante', 'Identique à la semaine'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'les-experiences-passees',
    title: 'Les expériences passées',
    titleEs: 'Las experiencias pasadas',
    description: 'Camila raconte son premier mois en France et les expériences marquantes qu’elle a vécues.',
    order: 6,
    accessTier: 'free',
    unitOverview: {
      objective: 'Raconter des expériences passées avec le passé composé (avoir et être).',
      outcomes: [
        'utiliser le passé composé avec avoir',
        'utiliser le passé composé avec être',
        'reconnaître les participes passés fréquents',
        'faire l’accord du participe passé avec être'
      ],
      grammar: ['passé composé avec avoir', 'passé composé avec être', 'accord du participe passé avec être'],
      vocabulary: ['une expérience', 'inoubliable', 'la première fois', 'se souvenir de'],
      scenario: 'Camila écrit dans son journal les expériences les plus marquantes de son premier mois en France.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Mon premier mois en France',
        description: 'Camila raconte, dans son journal, les expériences marquantes de son premier mois à Tours.',
        reading: {
          title: 'Mon premier mois en France',
          parts: [
            "Cher journal, ça fait maintenant un mois que je suis arrivée en France, et tellement de choses se sont passées ! Le premier jour, je suis arrivée à l'aéroport de Paris, fatiguée mais très excitée. La famille Lambert est venue me chercher, et nous avons pris le train ensemble jusqu'à Tours. J'ai tout de suite aimé la ville, avec ses vieilles rues et sa rivière.",
            "La semaine suivante, je suis allée à l'école pour la première fois. J'ai rencontré Léa et Karim, qui sont devenus mes meilleurs amis ici. Nous avons visité le château de Chenonceau ensemble, et j'ai pris des centaines de photos ! Un week-end, toute la famille est partie à Paris en train : nous sommes montés à la tour Eiffel, nous avons marché le long de la Seine, et j'ai goûté mon premier vrai croissant parisien, c'était délicieux.",
            "Il y a deux semaines, j'ai eu un petit accident : je suis tombée de vélo devant l'école et je me suis fait mal au genou ! Heureusement, ce n'était pas grave. Léa m'a aidée à rentrer et Madame Lambert m'a soignée avec beaucoup de gentillesse. Cette expérience m'a montré à quel point cette famille est devenue importante pour moi. En un mois seulement, j'ai appris tellement de choses : une nouvelle langue, une nouvelle ville, et surtout, de nouvelles amitiés inoubliables."
          ],
          questions: [
            'Comment Camila et la famille Lambert sont-elles allées de Paris à Tours ?',
            'Qu’est-ce que Camila et ses amis ont visité ensemble ?',
            'Que s’est-il passé il y a deux semaines ?'
          ],
          ordering: {
            prompt: 'Remets les événements du mois de Camila dans l’ordre.',
            events: [
              'Camila arrive à l’aéroport de Paris.',
              'Elle rencontre Léa et Karim à l’école.',
              'Toute la famille visite Paris en train.',
              'Camila tombe de vélo devant l’école.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Comment Camila est-elle arrivée en France ?', options: ['En bateau', 'En avion', 'En voiture', 'En train depuis l’Espagne'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’ont visité Camila et ses amis ensemble ?', options: ['Le Louvre', 'Le château de Chenonceau', 'La tour Eiffel seulement', 'Un musée à Tours'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’a goûté Camila à Paris ?', options: ['Une baguette', 'Un croissant', 'Un macaron', 'Une crêpe'], answer: 1 },
          { type: 'mcq', prompt: 'Que s’est-il passé il y a deux semaines ?', options: ['Camila est tombée de vélo', 'Camila est tombée malade', 'Camila a perdu son téléphone', 'Camila s’est disputée avec Léa'], answer: 0 },
          { type: 'mcq', prompt: 'Qui a aidé Camila après son accident ?', options: ['Karim', 'Léa et Madame Lambert', 'Personne', 'Le médecin seulement'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila décrit-elle ses nouvelles amitiés ?', options: ['Ennuyeuses', 'Inoubliables', 'Difficiles', 'Sans importance'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : l’accident de vélo était très grave.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « à quel point » signifie...', options: ['Combien / à quel degré', 'À quel endroit', 'Quand exactement', 'Pourquoi'], answer: 0 },
          { type: 'mcq', prompt: 'Quel sentiment domine ce journal ?', options: ['La déception', 'La gratitude et l’enthousiasme', 'La colère', 'L’indifférence'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle inférence peut-on faire sur la relation de Camila avec la famille Lambert ?', options: ['Elle est distante', 'Elle est devenue proche et importante pour elle', 'Elle veut déménager', 'Elle ne les voit presque jamais'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Le week-end à Paris',
        description: 'Écoute Camila raconter son week-end à Paris à sa mère.',
        intro: 'Écoute Camila décrire, par téléphone, son week-end à Paris avec la famille Lambert.',
        dialogue: [
          { speaker: 'Camila', line: 'Maman, on est allés à Paris ce week-end, c’était incroyable !', translation: 'Mamá, fuimos a París este fin de semana, ¡fue increíble!' },
          { speaker: 'La mère', line: 'Raconte-moi ! Qu’est-ce que vous avez fait ?', translation: '¡Cuéntame! ¿Qué hicieron?' },
          { speaker: 'Camila', line: 'Nous sommes montés à la tour Eiffel et nous avons marché le long de la Seine.', translation: 'Subimos a la torre Eiffel y caminamos junto al Sena.' },
          { speaker: 'La mère', line: 'Et vous avez mangé quelque chose de spécial ?', translation: '¿Y comieron algo especial?' },
          { speaker: 'Camila', line: 'Oui, j’ai goûté mon premier vrai croissant parisien, c’était délicieux !', translation: 'Sí, probé mi primer croissant parisino de verdad, ¡estaba delicioso!' }
        ],
        phrases: ['On est allés à...', 'Nous sommes montés à...', 'J’ai goûté...', 'C’était incroyable !'],
        exercises: [
          { type: 'mcq', prompt: 'Où la famille est-elle allée ce week-end ?', options: ['À Tours', 'À Paris', 'À Chenonceau', 'À Saint-Domingue'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’ont-ils fait à Paris ?', options: ['Ils sont montés à la tour Eiffel', 'Ils ont visité un château', 'Ils sont allés à la plage', 'Ils ont fait du vélo'], answer: 0 },
          { type: 'mcq', prompt: 'Qu’a goûté Camila ?', options: ['Une pizza', 'Un croissant', 'Une glace', 'Un chocolat chaud'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Raconte une expérience marquante',
        description: 'Raconte une expérience personnelle marquante au passé composé.',
        mission: 'Raconte à voix haute une expérience marquante de ta vie (un voyage, une première fois, un événement important), en utilisant le passé composé avec avoir et être.',
        phrases: ['J’ai vécu...', 'Je suis allé(e)...', 'C’était la première fois que...', 'Je ne l’oublierai jamais.'],
        dialogue: [
          { speaker: 'Toi', line: 'L’année dernière, je suis allé(e) en France pour la première fois. J’ai visité Paris et j’ai adoré la tour Eiffel.', translation: 'El año pasado fui a Francia por primera vez. Visité París y me encantó la torre Eiffel.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Raconte une expérience marquante de ta vie, avec au moins trois verbes au passé composé (avoir et être).', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Écoute l’expérience d’un/une camarade et pose-lui deux questions sur son récit.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Mon expérience inoubliable',
        description: 'Écris le récit d’une expérience marquante.',
        mission: 'Écris 80 à 100 mots pour raconter une expérience inoubliable, en utilisant le passé composé avec avoir et avec être.',
        phrases: ['J’ai vécu une expérience...', 'Je suis allé(e) à...', 'J’ai rencontré...', 'C’était inoubliable.'],
        dialogue: [
          { speaker: 'Modèle', line: 'L’été dernier, je suis parti(e) en voyage avec ma famille. Nous avons visité une nouvelle ville et j’ai rencontré des gens formidables. C’était une expérience inoubliable que je n’oublierai jamais.', translation: 'El verano pasado me fui de viaje con mi familia. Visitamos una nueva ciudad y conocí gente formidable. Fue una experiencia inolvidable que nunca olvidaré.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 80 à 100 mots racontant une expérience marquante, avec au moins deux verbes au passé composé avec avoir et deux avec être.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le passé composé avec être',
        description: 'Former le passé composé avec être et faire l’accord du participe passé.',
        grammarNote: 'Certains verbes forment leur passé composé avec être plutôt qu’avoir (aller, venir, arriver, partir, monter, descendre, tomber, rester, naître, mourir...). Avec être, le participe passé s’accorde en genre et en nombre avec le sujet : « Elle est allée à Paris. Ils sont montés à la tour Eiffel. Nous sommes parties. »',
        phrases: ['Je suis allé(e)...', 'Elle est tombée...', 'Nous sommes montés...', 'Ils sont partis...'],
        exercises: [
          { type: 'mcq', prompt: 'Camila ___ tombée de vélo.', options: ['a', 'est', 'suis', 'as'], answer: 1 },
          { type: 'mcq', prompt: 'Léa et Camila ___ allées à Paris.', options: ['sont', 'ont', 'est', 'a'], answer: 0 },
          { type: 'mcq', prompt: 'Nous ___ montés à la tour Eiffel.', options: ['avons', 'sommes', 'êtes', 'ont'], answer: 1 },
          { type: 'mcq', prompt: 'Quel verbe utilise « être » au passé composé ?', options: ['Manger', 'Voir', 'Arriver', 'Acheter'], answer: 2 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire des expériences',
        description: 'Le vocabulaire essentiel pour raconter une expérience passée.',
        vocabulary: [
          { word: 'une expérience', translation: 'una experiencia', example: 'C’était une expérience inoubliable.' },
          { word: 'inoubliable', translation: 'inolvidable', example: 'Ce voyage était inoubliable.' },
          { word: 'la première fois', translation: 'la primera vez', example: 'C’était la première fois que je voyais la tour Eiffel.' },
          { word: 'se souvenir de', translation: 'acordarse de', example: 'Je me souviens de ce jour-là.' },
          { word: 'un accident', translation: 'un accidente', example: 'J’ai eu un petit accident de vélo.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « inoubliable » ?', options: ['Olvidable', 'Inolvidable', 'Aburrido', 'Normal'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « se souvenir de » ?', options: ['Olvidar', 'Acordarse de', 'Preguntar', 'Explicar'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « la première fois » ?', options: ['La última vez', 'A veces', 'La primera vez', 'Nunca'], answer: 2 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'L’accident de vélo',
        description: 'Léa aide Camila après sa chute de vélo devant l’école.',
        intro: 'Camila vient de tomber de vélo devant l’école, et Léa se précipite pour l’aider.',
        dialogue: [
          { speaker: 'Léa', line: 'Camila ! Tu es tombée ! Ça va ?', translation: '¡Camila! ¡Te caíste! ¿Estás bien?' },
          { speaker: 'Camila', line: 'Aïe, je me suis fait mal au genou, mais ça va.', translation: 'Ay, me lastimé la rodilla, pero estoy bien.' },
          { speaker: 'Léa', line: 'Viens, je t’aide à rentrer. On va appeler ma mère.', translation: 'Ven, te ayudo a volver a casa. Vamos a llamar a mi madre.' },
          { speaker: 'Camila', line: 'Merci, Léa. Heureusement, tu étais là !', translation: 'Gracias, Léa. ¡Menos mal que estabas ahí!' }
        ],
        phrases: ['Tu es tombée !', 'Je me suis fait mal à...', 'Je t’aide à...', 'Heureusement, tu étais là.'],
        exercises: [
          { type: 'mcq', prompt: 'Que s’est-il passé à Camila ?', options: ['Elle est tombée de vélo', 'Elle a perdu son sac', 'Elle a raté le bus', 'Elle s’est disputée avec Karim'], answer: 0 },
          { type: 'mcq', prompt: 'Où Camila s’est-elle fait mal ?', options: ['Au bras', 'Au genou', 'À la tête', 'Au dos'], answer: 1 },
          { type: 'mcq', prompt: 'Que propose Léa pour aider Camila ?', options: ['De continuer seule', 'De l’aider à rentrer et appeler sa mère', 'D’appeler une ambulance', 'De ne rien faire'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'les-voyages-et-les-vacances',
    title: 'Les voyages et les vacances',
    titleEs: 'Los viajes y las vacaciones',
    description: 'Camila et la famille Lambert préparent leurs vacances de printemps et réservent un hôtel.',
    order: 7,
    accessTier: 'free',
    unitOverview: {
      objective: 'Organiser un voyage, réserver un hôtel et raconter une expérience de voyage.',
      outcomes: [
        'réserver une chambre d’hôtel',
        'parler de transport et de destinations',
        'décrire une expérience de voyage',
        'utiliser le futur proche pour planifier'
      ],
      grammar: ['futur proche', 'prépositions de lieu (à, en, au)', 'passé composé (révision)'],
      vocabulary: ['réserver une chambre', 'la destination', 'faire les valises', 'un séjour'],
      scenario: 'La famille Lambert prépare un voyage de printemps dans le sud de la France.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Un voyage dans le sud',
        description: 'La famille Lambert organise un voyage de printemps et réserve un hôtel à Nice.',
        reading: {
          title: 'Un voyage dans le sud',
          parts: [
            "Pour les vacances de printemps, la famille Lambert a décidé d'organiser un voyage dans le sud de la France, à Nice. « On va prendre le train jusqu'à Nice, ça va prendre environ six heures », explique Monsieur Lambert en regardant les horaires sur son ordinateur. Camila est très excitée : elle n'a jamais vu la mer Méditerranée ! Madame Lambert s'occupe de réserver une chambre d'hôtel avec vue sur la mer, pour cinq personnes.",
            "Le soir, toute la famille prépare les valises ensemble. « N'oublie pas ton maillot de bain, Camila, on va se baigner tous les jours ! » dit Léa en riant. Camila fait sa valise avec soin : des vêtements légers, de la crème solaire, et un appareil photo pour capturer tous les moments de ce voyage. Le lendemain matin, ils prennent le train très tôt, avec beaucoup d'excitation et un peu de fatigue.",
            "Après six heures de voyage, ils arrivent enfin à Nice. La vue depuis leur hôtel est magnifique : la mer bleue s'étend à perte de vue. Pendant leur séjour, ils vont se baigner tous les jours, visiter la vieille ville, et goûter la cuisine locale, notamment la fameuse salade niçoise. Camila prend des centaines de photos pour les montrer à sa famille à Saint-Domingue. Ce voyage restera l'un des plus beaux souvenirs de son année en France, et elle espère revenir un jour dans cette magnifique région."
          ],
          questions: [
            'Comment la famille Lambert va-t-elle voyager jusqu’à Nice ?',
            'Que réserve Madame Lambert ?',
            'Que font-ils pendant leur séjour à Nice ?'
          ],
          ordering: {
            prompt: 'Remets les événements du voyage dans l’ordre.',
            events: [
              'La famille décide d’organiser un voyage à Nice.',
              'Ils préparent leurs valises ensemble.',
              'Ils prennent le train tôt le matin.',
              'Ils arrivent à Nice et découvrent la vue sur la mer.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Où la famille Lambert va-t-elle en vacances ?', options: ['À Paris', 'À Nice', 'À Tours', 'En Espagne'], answer: 1 },
          { type: 'mcq', prompt: 'Combien de temps dure le voyage en train ?', options: ['Deux heures', 'Quatre heures', 'Six heures', 'Huit heures'], answer: 2 },
          { type: 'mcq', prompt: 'Que réserve Madame Lambert ?', options: ['Un restaurant', 'Une chambre d’hôtel avec vue sur la mer', 'Une voiture', 'Des billets d’avion'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’est-ce que Léa rappelle à Camila d’emporter ?', options: ['Son passeport', 'Son maillot de bain', 'Son ordinateur', 'Ses livres d’école'], answer: 1 },
          { type: 'mcq', prompt: 'Que font-ils tous les jours pendant leur séjour ?', options: ['Ils vont au musée', 'Ils se baignent', 'Ils font du shopping', 'Ils restent à l’hôtel'], answer: 1 },
          { type: 'mcq', prompt: 'Quel plat local goûtent-ils ?', options: ['La bouillabaisse', 'La salade niçoise', 'La ratatouille', 'La quiche lorraine'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila avait déjà vu la mer Méditerranée avant ce voyage.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « à perte de vue » signifie...', options: ['Très petite', 'Aussi loin que l’œil peut voir', 'Cachée', 'Dangereuse'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi Camila prend-elle beaucoup de photos ?', options: ['Pour les vendre', 'Pour les montrer à sa famille à Saint-Domingue', 'Parce que c’est obligatoire', 'Pour un devoir scolaire'], answer: 1 },
          { type: 'mcq', prompt: 'Quel est le sentiment général de Camila à propos de ce voyage ?', options: ['La déception', 'L’enthousiasme et la joie', 'L’ennui', 'La peur'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Réserver une chambre d’hôtel',
        description: 'Écoute Madame Lambert qui réserve une chambre d’hôtel par téléphone.',
        intro: 'Écoute l’appel de Madame Lambert à l’hôtel de Nice.',
        dialogue: [
          { speaker: 'Mme Lambert', line: 'Bonjour, je voudrais réserver une chambre pour cinq personnes.', translation: 'Hola, quisiera reservar una habitación para cinco personas.' },
          { speaker: 'L’hôtel', line: 'Bien sûr, pour quelles dates ?', translation: 'Claro, ¿para qué fechas?' },
          { speaker: 'Mme Lambert', line: 'Du quinze au vingt avril, s’il vous plaît.', translation: 'Del quince al veinte de abril, por favor.' },
          { speaker: 'L’hôtel', line: 'Parfait, nous avons une chambre avec vue sur la mer.', translation: 'Perfecto, tenemos una habitación con vista al mar.' },
          { speaker: 'Mme Lambert', line: 'C’est exactement ce que nous cherchions, merci !', translation: '¡Eso es exactamente lo que buscábamos, gracias!' }
        ],
        phrases: ['Je voudrais réserver...', 'Pour quelles dates ?', 'Du... au...', 'Une chambre avec vue sur...'],
        exercises: [
          { type: 'mcq', prompt: 'Pour combien de personnes est la réservation ?', options: ['Trois', 'Quatre', 'Cinq', 'Six'], answer: 2 },
          { type: 'mcq', prompt: 'Pour quelles dates réserve-t-elle ?', options: ['Du 5 au 10 avril', 'Du 15 au 20 avril', 'Du 1er au 7 mai', 'Du 20 au 25 avril'], answer: 1 },
          { type: 'mcq', prompt: 'Quel type de chambre l’hôtel propose-t-il ?', options: ['Une chambre sans fenêtre', 'Une chambre avec vue sur la mer', 'Une chambre familiale sans vue', 'Une suite présidentielle'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Organiser un voyage',
        description: 'Simule l’organisation d’un voyage de vacances.',
        mission: 'Présente un projet de voyage : destination, moyen de transport, dates et une activité que tu vas faire (futur proche).',
        phrases: ['Je vais aller à...', 'On va prendre le train/l’avion...', 'On va visiter...', 'Ça va être...'],
        dialogue: [
          { speaker: 'Toi', line: 'Cet été, je vais aller à Nice avec ma famille. On va prendre le train et on va se baigner tous les jours.', translation: 'Este verano voy a ir a Niza con mi familia. Vamos a tomar el tren y nos vamos a bañar todos los días.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Présente un projet de voyage complet (destination, transport, activités) avec le futur proche.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Compare ton projet de voyage avec celui d’un/une camarade.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Une carte postale de vacances',
        description: 'Écris une carte postale décrivant tes vacances.',
        mission: 'Écris 80 à 100 mots sous forme de carte postale décrivant un voyage (réel ou imaginaire) : destination, activités et impressions.',
        phrases: ['Je suis à...', 'On a visité...', 'C’était...', 'À bientôt !'],
        dialogue: [
          { speaker: 'Modèle', line: 'Chère maman, je suis à Nice avec la famille Lambert ! On s’est baignés tous les jours et on a visité la vieille ville. La vue depuis l’hôtel est magnifique. C’était un voyage inoubliable. À bientôt, Camila.', translation: 'Querida mamá, ¡estoy en Niza con la familia Lambert! Nos bañamos todos los días y visitamos el casco antiguo. La vista desde el hotel es magnífica. Fue un viaje inolvidable. Hasta pronto, Camila.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris une carte postale de 80 à 100 mots décrivant un voyage de vacances.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Le futur proche et les prépositions de lieu',
        description: 'Exprimer un projet proche et utiliser à/en/au avec les destinations.',
        grammarNote: 'Le futur proche se forme avec aller au présent + infinitif : « Nous allons visiter Nice. » Les prépositions de lieu varient selon le pays/la ville : à + ville (à Nice), en + pays féminin (en France), au + pays masculin (au Portugal).',
        phrases: ['Je vais aller à...', 'Nous allons visiter...', 'Ils vont voyager en...', 'On va partir au...'],
        exercises: [
          { type: 'mcq', prompt: 'Nous ___ visiter Nice le mois prochain.', options: ['allons', 'allez', 'vais', 'va'], answer: 0 },
          { type: 'mcq', prompt: 'La famille va voyager ___ France.', options: ['à', 'en', 'au', 'de'], answer: 1 },
          { type: 'mcq', prompt: 'Ils vont passer une semaine ___ Nice.', options: ['en', 'au', 'à', 'du'], answer: 2 },
          { type: 'mcq', prompt: 'Quelle est la structure correcte du futur proche ?', options: ['Aller + participe passé', 'Aller (présent) + infinitif', 'Avoir + infinitif', 'Être + gérondif'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire des voyages',
        description: 'Le vocabulaire essentiel pour organiser un voyage et parler de vacances.',
        vocabulary: [
          { word: 'réserver une chambre', translation: 'reservar una habitación', example: 'Nous avons réservé une chambre avec vue sur la mer.' },
          { word: 'la destination', translation: 'el destino', example: 'Notre destination cette année, c’est Nice.' },
          { word: 'faire les valises', translation: 'hacer las maletas', example: 'On fait les valises la veille du départ.' },
          { word: 'un séjour', translation: 'una estancia', example: 'Nous avons passé un séjour inoubliable à Nice.' },
          { word: 'se baigner', translation: 'bañarse', example: 'On va se baigner tous les jours.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « faire les valises » ?', options: ['Hacer las maletas', 'Reservar un hotel', 'Ir a la playa', 'Comprar billetes'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « un séjour » ?', options: ['Un viaje corto', 'Una estancia', 'Un billete', 'Una maleta'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « se baigner » ?', options: ['Nadar/bañarse', 'Caminar', 'Comer', 'Dormir'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Faire les valises',
        description: 'Camila et Léa préparent leurs valises la veille du départ pour Nice.',
        intro: 'C’est la veille du départ, et Camila et Léa préparent leurs affaires ensemble.',
        dialogue: [
          { speaker: 'Léa', line: 'N’oublie pas ton maillot de bain, on va se baigner tous les jours !', translation: '¡No olvides tu traje de baño, nos vamos a bañar todos los días!' },
          { speaker: 'Camila', line: 'Bonne idée ! Et de la crème solaire aussi.', translation: '¡Buena idea! Y protector solar también.' },
          { speaker: 'Léa', line: 'Tu emmènes ton appareil photo ?', translation: '¿Llevas tu cámara?' },
          { speaker: 'Camila', line: 'Bien sûr, je vais prendre des centaines de photos pour ma famille !', translation: '¡Claro, voy a tomar cientos de fotos para mi familia!' }
        ],
        phrases: ['N’oublie pas...', 'On va se baigner...', 'Tu emmènes... ?', 'Je vais prendre des photos.'],
        exercises: [
          { type: 'mcq', prompt: 'Que rappelle Léa à Camila d’emporter ?', options: ['Son passeport', 'Son maillot de bain', 'Son livre préféré', 'Son ordinateur'], answer: 1 },
          { type: 'mcq', prompt: 'Qu’ajoute Camila à sa valise ?', options: ['Un parapluie', 'De la crème solaire', 'Un manteau', 'Des bottes'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi Camila emmène-t-elle son appareil photo ?', options: ['Pour le vendre', 'Pour prendre des photos pour sa famille', 'Parce que c’est obligatoire', 'Elle ne l’emmène pas'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'le-logement',
    title: 'Le logement',
    titleEs: 'La vivienda',
    description: 'Karim aide Camila à comprendre comment on cherche un appartement en France, pour un projet d’école.',
    order: 8,
    accessTier: 'free',
    unitOverview: {
      objective: 'Décrire un logement, comparer deux appartements et comprendre une annonce immobilière.',
      outcomes: [
        'décrire les pièces d’un logement',
        'comparer deux logements',
        'comprendre une petite annonce immobilière',
        'parler des meubles et des services d’un appartement'
      ],
      grammar: ['comparatifs (révision)', 'il y a / il n’y a pas de', 'prépositions de lieu dans la maison'],
      vocabulary: ['la chambre', 'le loyer', 'meublé', 'le quartier'],
      scenario: 'Pour un projet d’école, Camila et Karim comparent deux annonces d’appartements à louer à Tours.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Deux appartements à comparer',
        description: 'Pour un projet d’école, Camila et Karim comparent deux annonces d’appartements à louer.',
        reading: {
          title: 'Deux appartements à comparer',
          parts: [
            "Pour un projet d'école sur la vie quotidienne en France, Camila et Karim doivent comparer deux annonces d'appartements à louer à Tours. La première annonce décrit un studio meublé au centre-ville : une seule pièce avec un coin cuisine, une salle de bain, et un petit balcon. Le loyer est de quatre cents euros par mois, charges comprises. « C'est petit, mais c'est très bien situé, près de tout », remarque Karim.",
            "La deuxième annonce présente un appartement plus grand, avec deux chambres, un salon, une cuisine séparée et une salle de bain, dans un quartier plus calme, un peu éloigné du centre-ville. Le loyer est de six cents euros par mois, mais les charges ne sont pas comprises. « Cet appartement est plus grand que le studio, mais il est aussi plus cher », observe Camila. « Et il est moins bien situé, il faut prendre le bus pour aller au centre. »",
            "Après avoir comparé les deux annonces, Camila et Karim discutent des avantages et des inconvénients de chaque option pour leur projet. Le studio est moins cher et très central, mais il est petit et n'a pas de vraie chambre séparée. L'appartement est plus spacieux et plus confortable pour une famille, mais il est plus cher et moins pratique pour se déplacer. « Ça dépend vraiment des besoins de chaque personne », conclut Karim. « Pour un étudiant seul, je choisirais le studio ; pour une famille, l'appartement est mieux. » Camila est d'accord et ils décident de présenter les deux options dans leur projet, avec cette conclusion."
          ],
          questions: [
            'Que doivent faire Camila et Karim pour leur projet d’école ?',
            'Quelle est la différence de loyer entre les deux logements ?',
            'Quelle conclusion tirent-ils à la fin de leur comparaison ?'
          ],
          ordering: {
            prompt: 'Remets les événements dans l’ordre.',
            events: [
              'Camila et Karim lisent la première annonce, un studio meublé.',
              'Ils lisent la deuxième annonce, un appartement plus grand.',
              'Ils comparent les avantages et les inconvénients de chaque option.',
              'Ils décident de présenter les deux options dans leur projet.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Combien de pièces a le studio meublé ?', options: ['Une seule pièce', 'Deux pièces', 'Trois pièces', 'Quatre pièces'], answer: 0 },
          { type: 'mcq', prompt: 'Combien coûte le loyer du studio ?', options: ['Trois cents euros', 'Quatre cents euros', 'Cinq cents euros', 'Six cents euros'], answer: 1 },
          { type: 'mcq', prompt: 'Combien de chambres a le deuxième appartement ?', options: ['Une', 'Deux', 'Trois', 'Quatre'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi le deuxième appartement est-il moins pratique pour se déplacer ?', options: ['Il est au centre-ville', 'Il est dans un quartier calme, éloigné du centre', 'Il n’a pas de bus proche jamais', 'Il n’a pas de rue'], answer: 1 },
          { type: 'mcq', prompt: 'Les charges sont-elles comprises dans le loyer du studio ?', options: ['Oui', 'Non', 'Le texte ne le dit pas', 'Seulement en hiver'], answer: 0 },
          { type: 'mcq', prompt: 'Que recommande Karim pour un étudiant seul ?', options: ['L’appartement', 'Le studio', 'Aucun des deux', 'Un troisième logement'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : le studio a un balcon.', options: ['Vrai', 'Faux'], answer: 0 },
          { type: 'mcq', prompt: 'Dans le texte, « charges comprises » signifie...', options: ['Les charges sont en plus du loyer', 'Les charges sont incluses dans le prix', 'Il n’y a pas de charges', 'Les charges sont très élevées'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’intention principale de Camila et Karim dans ce texte ?', options: ['Choisir un logement pour eux-mêmes', 'Comparer deux annonces pour un projet scolaire', 'Vendre un appartement', 'Se plaindre d’un logement'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle conclusion tirent-ils finalement ?', options: ['Le studio est toujours meilleur', 'L’appartement est toujours meilleur', 'Le meilleur choix dépend des besoins de chaque personne', 'Aucun des deux logements n’est bon'], answer: 2 }
        ]
      }),
      listening: activity('listening', {
        title: 'Une visite d’appartement',
        description: 'Écoute une agente immobilière qui décrit un appartement à visiter.',
        intro: 'Écoute la description d’un appartement par une agente immobilière.',
        dialogue: [
          { speaker: 'L’agente', line: 'Voici le salon : il est grand et très lumineux.', translation: 'Aquí está el salón: es grande y muy luminoso.' },
          { speaker: 'Karim', line: 'Il y a combien de chambres ?', translation: '¿Cuántas habitaciones hay?' },
          { speaker: 'L’agente', line: 'Il y a deux chambres, et une salle de bain avec une baignoire.', translation: 'Hay dos habitaciones, y un baño con bañera.' },
          { speaker: 'Camila', line: 'Et la cuisine, elle est séparée ?', translation: '¿Y la cocina, está separada?' },
          { speaker: 'L’agente', line: 'Oui, la cuisine est séparée et complètement équipée.', translation: 'Sí, la cocina está separada y completamente equipada.' }
        ],
        phrases: ['Il y a...', 'La cuisine est séparée.', 'C’est lumineux.', 'complètement équipé(e)'],
        exercises: [
          { type: 'mcq', prompt: 'Combien de chambres a l’appartement ?', options: ['Une', 'Deux', 'Trois', 'Quatre'], answer: 1 },
          { type: 'mcq', prompt: 'Comment est décrit le salon ?', options: ['Petit et sombre', 'Grand et lumineux', 'Moyen et froid', 'Sans fenêtre'], answer: 1 },
          { type: 'mcq', prompt: 'Comment est la cuisine ?', options: ['Dans le salon', 'Séparée et équipée', 'Il n’y en a pas', 'Très petite'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Décris ton logement',
        description: 'Décris ton logement idéal ou réel.',
        mission: 'Décris ton logement (réel ou idéal) : nombre de pièces, meubles, quartier, et pourquoi tu l’aimes.',
        phrases: ['Il y a... pièces.', 'Ma chambre est...', 'Le quartier est...', 'J’aime ce logement parce que...'],
        dialogue: [
          { speaker: 'Toi', line: 'Mon appartement a deux chambres et un grand salon. Le quartier est calme et j’aime beaucoup ça.', translation: 'Mi apartamento tiene dos habitaciones y un gran salón. El barrio es tranquilo y me gusta mucho.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Décris ton logement (réel ou idéal) en détail, avec au moins un comparatif.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Compare ton logement avec celui d’un/une camarade.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Une annonce immobilière',
        description: 'Écris une petite annonce pour louer un logement.',
        mission: 'Écris 80 à 100 mots pour décrire un appartement à louer (nombre de pièces, meubles, quartier, prix).',
        phrases: ['À louer :', 'Il y a...', 'Le loyer est de...', 'Situé dans le quartier de...'],
        dialogue: [
          { speaker: 'Modèle', line: 'À louer : appartement meublé avec deux chambres, un salon lumineux et une cuisine séparée. Situé dans un quartier calme, près du centre-ville. Loyer : cinq cents euros par mois, charges comprises.', translation: 'Se alquila: apartamento amueblado con dos habitaciones, un salón luminoso y una cocina separada. Ubicado en un barrio tranquilo, cerca del centro. Alquiler: quinientos euros al mes, gastos incluidos.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris une petite annonce de 80 à 100 mots pour un logement à louer.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Il y a / il n’y a pas de et les comparatifs',
        description: 'Décrire l’existence de quelque chose et comparer deux logements.',
        grammarNote: '« Il y a » indique la présence de quelque chose : « Il y a deux chambres. » À la forme négative, on utilise « il n’y a pas de » : « Il n’y a pas de balcon. » Pour comparer deux logements, on réutilise plus/moins/aussi + adjectif + que : « Cet appartement est plus grand que le studio. »',
        phrases: ['Il y a...', 'Il n’y a pas de...', 'C’est plus grand que...', 'C’est moins cher que...'],
        exercises: [
          { type: 'mcq', prompt: '___ deux chambres dans cet appartement.', options: ['Il y a', 'Il n’y a pas', 'C’est', 'Il est'], answer: 0 },
          { type: 'mcq', prompt: 'Dans le studio, ___ de balcon.', options: ['il y a', 'il n’y a pas', 'il est', 'c’est'], answer: 1 },
          { type: 'mcq', prompt: 'Cet appartement est ___ que le studio.', options: ['plus grand', 'plus grande', 'grand plus', 'aussi grand comme'], answer: 0 },
          { type: 'mcq', prompt: 'Le loyer du studio est ___ cher que celui de l’appartement.', options: ['moins', 'aussi', 'plus', 'que'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire du logement',
        description: 'Le vocabulaire essentiel pour décrire un logement.',
        vocabulary: [
          { word: 'la chambre', translation: 'la habitación', example: 'Ma chambre est petite mais confortable.' },
          { word: 'le loyer', translation: 'el alquiler', example: 'Le loyer est de quatre cents euros par mois.' },
          { word: 'meublé', translation: 'amueblado', example: 'C’est un studio meublé.' },
          { word: 'le quartier', translation: 'el barrio', example: 'Le quartier est calme et sympathique.' },
          { word: 'charges comprises', translation: 'gastos incluidos', example: 'Le loyer est de cinq cents euros, charges comprises.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « le loyer » ?', options: ['El alquiler', 'La habitación', 'El barrio', 'El mueble'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « meublé » ?', options: ['Vacío', 'Amueblado', 'Sucio', 'Nuevo'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « le quartier » ?', options: ['El barrio', 'El piso', 'La ciudad', 'El país'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Quel appartement choisir ?',
        description: 'Camila et Karim discutent de leur préférence entre les deux appartements.',
        intro: 'Après la visite, Camila et Karim comparent leurs impressions sur les deux logements.',
        dialogue: [
          { speaker: 'Karim', line: 'Alors, tu préfères le studio ou l’appartement ?', translation: 'Entonces, ¿prefieres el estudio o el apartamento?' },
          { speaker: 'Camila', line: 'Je préfère l’appartement, il est plus grand et plus confortable.', translation: 'Prefiero el apartamento, es más grande y más cómodo.' },
          { speaker: 'Karim', line: 'Mais il est plus cher et moins bien situé !', translation: '¡Pero es más caro y está peor ubicado!' },
          { speaker: 'Camila', line: 'C’est vrai, mais pour une famille, je pense que c’est le meilleur choix.', translation: 'Es verdad, pero para una familia, creo que es la mejor opción.' }
        ],
        phrases: ['Je préfère...', 'Il est plus... que...', 'C’est le meilleur choix.', 'Ça dépend de...'],
        exercises: [
          { type: 'mcq', prompt: 'Quel logement Camila préfère-t-elle ?', options: ['Le studio', 'L’appartement', 'Aucun des deux', 'Elle ne sait pas'], answer: 1 },
          { type: 'mcq', prompt: 'Quel inconvénient Karim mentionne-t-il ?', options: ['Il est trop petit', 'Il est plus cher et moins bien situé', 'Il n’a pas de cuisine', 'Il est trop loin de l’école'], answer: 1 },
          { type: 'mcq', prompt: 'Pour qui Camila pense-t-elle que l’appartement est le meilleur choix ?', options: ['Pour un étudiant seul', 'Pour une famille', 'Pour un couple sans enfants', 'Pour personne'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'les-loisirs-et-les-medias',
    title: 'Les loisirs et les médias',
    titleEs: 'El ocio y los medios',
    description: 'Camila, Léa et Karim discutent de leurs films, séries et réseaux sociaux préférés.',
    order: 9,
    accessTier: 'free',
    unitOverview: {
      objective: 'Exprimer une préférence culturelle et discuter d’un film ou d’une série.',
      outcomes: [
        'parler de ses loisirs préférés',
        'donner son opinion sur un film ou une série',
        'comparer deux préférences',
        'parler des réseaux sociaux de façon simple'
      ],
      grammar: ['pronoms toniques (moi, toi, lui...)', 'expression de préférence (préférer, aimer mieux)', 'négation ne... rien / ne... personne'],
      vocabulary: ['un film', 'une série', 'les réseaux sociaux', 'à mon avis'],
      scenario: 'Un vendredi soir, Camila, Léa et Karim débattent de quel film regarder ensemble.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Quel film regarder ce soir ?',
        description: 'Camila, Léa et Karim n’arrivent pas à se mettre d’accord sur le film à regarder.',
        reading: {
          title: 'Quel film regarder ce soir ?',
          parts: [
            "Vendredi soir, Camila, Léa et Karim se retrouvent chez les Lambert pour une soirée cinéma. Le problème, c'est qu'ils n'arrivent pas à se mettre d'accord sur le film à regarder. « Moi, je préfère les comédies, elles me font toujours rire », dit Léa. « Personnellement, je préfère les films d'action, ils sont plus intéressants », répond Karim. Camila, elle, n'aime ni les comédies ni les films d'action : « Moi, j'aime mieux les films romantiques, mais je sais que vous n'aimez pas ça du tout. »",
            "Après quelques minutes de discussion, ils décident de regarder les avis sur leurs téléphones. Léa propose une série qu'elle suit sur les réseaux sociaux : « Tout le monde en parle en ce moment, ça a l'air très bien ! » Karim n'est pas très convaincu : « Je ne fais jamais confiance aux réseaux sociaux pour choisir un film, les avis sont souvent faux. » Camila propose alors une solution : « Et si on regardait un documentaire ? Ce n'est ni une comédie, ni un film d'action, ni un film romantique, ça devrait convenir à tout le monde ! »",
            "Finalement, tous les trois acceptent l'idée de Camila et choisissent un documentaire sur les océans. Après le film, ils sont tous surpris : ils l'ont adoré, même Karim qui n'aime jamais les documentaires d'habitude ! « À mon avis, on devrait regarder plus de documentaires ensemble », dit Léa en riant. Cette soirée leur montre qu'il n'est pas toujours facile de se mettre d'accord, mais qu'il existe toujours une solution qui satisfait tout le monde."
          ],
          questions: [
            'Pourquoi Camila, Léa et Karim ont-ils du mal à choisir un film ?',
            'Que propose Camila comme solution ?',
            'Comment se termine la soirée ?'
          ],
          ordering: {
            prompt: 'Remets les événements de la soirée dans l’ordre.',
            events: [
              'Chacun exprime sa préférence de film.',
              'Léa propose une série vue sur les réseaux sociaux.',
              'Camila propose de regarder un documentaire.',
              'Tous les trois adorent le documentaire sur les océans.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Quel genre de film Léa préfère-t-elle ?', options: ['Les films d’action', 'Les comédies', 'Les films romantiques', 'Les documentaires'], answer: 1 },
          { type: 'mcq', prompt: 'Quel genre de film Karim préfère-t-il ?', options: ['Les comédies', 'Les films d’action', 'Les films romantiques', 'Les documentaires'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi Karim ne fait-il pas confiance aux réseaux sociaux ?', options: ['Il ne les utilise jamais', 'Les avis sont souvent faux', 'Ils sont trop lents', 'Il préfère les livres'], answer: 1 },
          { type: 'mcq', prompt: 'Que propose Camila comme solution ?', options: ['Ne rien regarder', 'Regarder un documentaire', 'Regarder trois films différents', 'Aller au cinéma'], answer: 1 },
          { type: 'mcq', prompt: 'Sur quel sujet est le documentaire qu’ils regardent ?', options: ['L’espace', 'Les océans', 'Les animaux d’Afrique', 'L’histoire de France'], answer: 1 },
          { type: 'mcq', prompt: 'Comment réagit Karim après le documentaire ?', options: ['Il n’aime pas du tout', 'Il est surpris et il adore', 'Il s’endort', 'Il refuse de commenter'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Karim aime habituellement les documentaires.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « ça devrait convenir à tout le monde » signifie...', options: ['Ça ne va plaire à personne', 'Ça devrait satisfaire tout le monde', 'C’est interdit', 'Personne ne le sait'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle leçon peut-on tirer de cette soirée ?', options: ['Il est impossible de se mettre d’accord', 'Il existe toujours une solution qui satisfait tout le monde', 'Il faut toujours choisir seul', 'Les documentaires sont ennuyeux'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle phrase exprime une opinion, pas un fait ?', options: ['Ils se retrouvent chez les Lambert.', 'Personnellement, je préfère les films d’action.', 'Ils regardent un documentaire sur les océans.', 'Léa propose une série.'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Mon film préféré',
        description: 'Écoute Léa parler de son film préféré à Camila.',
        intro: 'Écoute Léa expliquer pourquoi elle aime tant ce film en particulier.',
        dialogue: [
          { speaker: 'Léa', line: 'Mon film préféré, c’est une comédie française avec des acteurs incroyables.', translation: 'Mi película favorita es una comedia francesa con actores increíbles.' },
          { speaker: 'Camila', line: 'Pourquoi tu l’aimes autant ?', translation: '¿Por qué te gusta tanto?' },
          { speaker: 'Léa', line: 'Parce qu’elle me fait toujours rire, même après l’avoir vue dix fois.', translation: 'Porque siempre me hace reír, incluso después de haberla visto diez veces.' },
          { speaker: 'Camila', line: 'Moi, je ne l’ai jamais vue. On peut la regarder ensemble ?', translation: 'Yo nunca la he visto. ¿Podemos verla juntas?' },
          { speaker: 'Léa', line: 'Bien sûr, avec plaisir !', translation: '¡Claro, con mucho gusto!' }
        ],
        phrases: ['Mon film préféré, c’est...', 'Il/elle me fait rire.', 'Je ne l’ai jamais vu(e).', 'Avec plaisir !'],
        exercises: [
          { type: 'mcq', prompt: 'Quel genre est le film préféré de Léa ?', options: ['Un film d’action', 'Une comédie', 'Un documentaire', 'Un film romantique'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi Léa aime-t-elle ce film ?', options: ['Il la fait pleurer', 'Il la fait rire', 'Il est très long', 'Il est éducatif'], answer: 1 },
          { type: 'mcq', prompt: 'Combien de fois Léa a-t-elle vu ce film ?', options: ['Une fois', 'Cinq fois', 'Dix fois', 'Elle ne se souvient pas'], answer: 2 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Parle de tes loisirs préférés',
        description: 'Décris tes loisirs préférés et donne ton opinion.',
        mission: 'Parle de ton film, série ou activité de loisir préférée, et explique pourquoi tu l’aimes.',
        phrases: ['Mon/ma... préféré(e), c’est...', 'Je l’aime parce que...', 'À mon avis...', 'Je préfère... à...'],
        dialogue: [
          { speaker: 'Toi', line: 'Ma série préférée, c’est une série française. Je l’aime parce que l’histoire est passionnante.', translation: 'Mi serie favorita es una serie francesa. Me gusta porque la historia es apasionante.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Parle de ton loisir préféré (film, série, musique) et justifie ton opinion.', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Compare tes préférences avec celles d’un/une camarade et trouvez un point commun.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Mon avis sur un film',
        description: 'Écris ton opinion sur un film ou une série.',
        mission: 'Écris 80 à 100 mots donnant ton opinion sur un film ou une série que tu as vu récemment.',
        phrases: ['À mon avis...', 'J’ai beaucoup aimé...', 'Je ne recommande pas...', 'Ce film parle de...'],
        dialogue: [
          { speaker: 'Modèle', line: 'À mon avis, ce documentaire sur les océans est excellent. J’ai beaucoup aimé les images sous-marines et les explications claires. Je le recommande à tout le monde, même à ceux qui n’aiment pas normalement les documentaires.', translation: 'En mi opinión, este documental sobre los océanos es excelente. Me gustaron mucho las imágenes submarinas y las explicaciones claras. Lo recomiendo a todos, incluso a quienes normalmente no les gustan los documentales.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris 80 à 100 mots donnant ton opinion sur un film ou une série, avec au moins une justification.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Les pronoms toniques et l’expression de préférence',
        description: 'Utiliser moi/toi/lui/elle pour insister sur une préférence personnelle.',
        grammarNote: 'Les pronoms toniques (moi, toi, lui, elle, nous, vous, eux, elles) s’utilisent pour insister sur le sujet, souvent en début de phrase : « Moi, je préfère les comédies. » Pour exprimer une préférence, on utilise préférer + nom, ou aimer mieux + verbe : « Je préfère les films d’action. J’aime mieux regarder des documentaires. »',
        phrases: ['Moi, je préfère...', 'Toi, tu aimes...', 'Lui, il préfère...', 'J’aime mieux...'],
        exercises: [
          { type: 'mcq', prompt: '___ je préfère les comédies.', options: ['Je', 'Moi,', 'Me', 'Mien'], answer: 1 },
          { type: 'mcq', prompt: 'Karim ___ préfère les films d’action.', options: ['lui', 'il', 'le', 'eux'], answer: 1 },
          { type: 'mcq', prompt: 'J’aime mieux ___ des documentaires.', options: ['regarde', 'regarder', 'regardé', 'regardant'], answer: 1 },
          { type: 'mcq', prompt: 'Quel pronom tonique correspond à « elles » ?', options: ['Eux', 'Elles', 'Leur', 'Les'], answer: 1 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire des loisirs et médias',
        description: 'Le vocabulaire essentiel pour parler de films, séries et réseaux sociaux.',
        vocabulary: [
          { word: 'un film', translation: 'una película', example: 'On regarde un film ce soir ?' },
          { word: 'une série', translation: 'una serie', example: 'Cette série est passionnante.' },
          { word: 'les réseaux sociaux', translation: 'las redes sociales', example: 'Tout le monde en parle sur les réseaux sociaux.' },
          { word: 'à mon avis', translation: 'en mi opinión', example: 'À mon avis, ce film est excellent.' },
          { word: 'un documentaire', translation: 'un documental', example: 'On a regardé un documentaire sur les océans.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « une série » ?', options: ['Una serie', 'Una película', 'Un documental', 'Una red social'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « les réseaux sociaux » ?', options: ['Los amigos', 'Las redes sociales', 'Los documentales', 'Las películas'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « à mon avis » ?', options: ['En mi opinión', 'A veces', 'Nunca', 'Por supuesto'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Une soirée cinéma réussie',
        description: 'Après le documentaire, les trois amis discutent de leur soirée.',
        intro: 'Le documentaire vient de se terminer, et les trois amis partagent leurs impressions.',
        dialogue: [
          { speaker: 'Karim', line: 'Je n’aime jamais les documentaires normalement, mais celui-là était génial !', translation: 'Normalmente nunca me gustan los documentales, ¡pero ese estuvo genial!' },
          { speaker: 'Léa', line: 'À mon avis, on devrait regarder plus de documentaires ensemble.', translation: 'En mi opinión, deberíamos ver más documentales juntos.' },
          { speaker: 'Camila', line: 'Je suis contente que ma proposition ait plu à tout le monde !', translation: '¡Estoy contenta de que mi propuesta haya gustado a todos!' },
          { speaker: 'Karim', line: 'La prochaine fois, c’est moi qui choisis, promis !', translation: '¡La próxima vez, elijo yo, lo prometo!' }
        ],
        phrases: ['Je n’aime jamais...', 'À mon avis, on devrait...', 'Je suis content(e) que...', 'La prochaine fois...'],
        exercises: [
          { type: 'mcq', prompt: 'Que pense Karim du documentaire, contrairement à d’habitude ?', options: ['Il ne l’aime pas', 'Il l’a trouvé génial', 'Il s’est endormi', 'Il ne l’a pas regardé'], answer: 1 },
          { type: 'mcq', prompt: 'Que propose Léa pour les prochaines soirées ?', options: ['Ne plus regarder de films', 'Regarder plus de documentaires ensemble', 'Regarder seulement des comédies', 'Arrêter les soirées cinéma'], answer: 1 },
          { type: 'mcq', prompt: 'Que promet Karim pour la prochaine fois ?', options: ['De ne jamais choisir', 'De choisir le prochain film', 'De ne plus venir', 'De regarder seul'], answer: 1 }
        ]
      })
    }
  },
  // ---------------------------------------------------------------
  {
    slug: 'relations-et-communication',
    title: 'Relations et communication',
    titleEs: 'Relaciones y comunicación',
    description: 'Camila écrit un e-mail à sa meilleure amie de Saint-Domingue pour lui raconter sa vie en France.',
    order: 10,
    accessTier: 'free',
    unitOverview: {
      objective: 'Parler de ses relations personnelles et écrire un message informel.',
      outcomes: [
        'décrire une relation d’amitié ou de famille',
        'exprimer un accord ou un désaccord poliment',
        'utiliser les pronoms relatifs qui, que et où',
        'écrire un e-mail personnel'
      ],
      grammar: ['pronoms relatifs qui, que, où', 'expressions d’accord/désaccord', 'présent + passé composé (révision combinée)'],
      vocabulary: ['la meilleure amie', 'être d’accord / ne pas être d’accord', 'manquer à quelqu’un', 'garder contact'],
      scenario: 'Camila écrit à Sofía, sa meilleure amie restée à Saint-Domingue, pour lui raconter sa vie et ses nouvelles amitiés.'
    },
    activities: {
      reading: activity('reading', {
        title: 'Un e-mail à Sofía',
        description: 'Camila écrit à sa meilleure amie de Saint-Domingue pour lui raconter sa nouvelle vie.',
        reading: {
          title: 'Un e-mail à Sofía',
          parts: [
            "Chère Sofía, ça fait longtemps que je ne t'ai pas écrit, excuse-moi ! La vie ici, en France, est tellement différente de celle qu'on avait à Saint-Domingue. Je me suis fait deux amis formidables : Léa, la fille de la famille qui m'héberge, et Karim, un garçon de ma classe qui est toujours prêt à m'aider. Ce sont des amis avec qui je passe presque tout mon temps libre, et je crois que je ne les oublierai jamais.",
            "Je dois t'avouer que tu me manques énormément, ainsi que le reste de notre groupe d'amies. Je pense souvent aux moments qu'on passait ensemble, dans le quartier où on a grandi. Mais je suis aussi très heureuse ici : j'apprends une nouvelle langue, je découvre une nouvelle culture, et j'ai rencontré des personnes qui, comme toi, sont devenues très importantes pour moi. Léa et moi, on n'est pas toujours d'accord sur tout (elle adore les comédies romantiques, alors que moi, je préfère les documentaires !), mais on se respecte et on rigole beaucoup ensemble.",
            "J'espère qu'on pourra garder contact, même quand je rentrerai à Saint-Domingue. Peut-être que tu pourrais venir me rendre visite en France un jour, ou que je pourrais te présenter Léa et Karim par appel vidéo ! En attendant, je t'envoie plein de photos de Tours, la ville où j'habite maintenant. Réponds-moi vite, j'ai hâte d'avoir de tes nouvelles. Je t'embrasse très fort, Camila."
          ],
          questions: [
            'Qui sont les deux nouveaux amis de Camila en France ?',
            'Sur quoi Camila et Léa ne sont-elles pas toujours d’accord ?',
            'Que propose Camila pour garder contact avec Sofía ?'
          ],
          ordering: {
            prompt: 'Remets les idées de l’e-mail dans l’ordre.',
            events: [
              'Camila s’excuse de ne pas avoir écrit depuis longtemps.',
              'Elle raconte comment elle s’est fait deux nouveaux amis.',
              'Elle avoue que Sofía et ses amies lui manquent.',
              'Elle propose de garder contact avec Sofía.'
            ]
          }
        },
        exercises: [
          { type: 'mcq', prompt: 'Qui sont les deux nouveaux amis de Camila ?', options: ['Léa et Karim', 'Sofía et Karim', 'Madame et Monsieur Lambert', 'Léa et Madame Lambert'], answer: 0 },
          { type: 'mcq', prompt: 'Qui manque énormément à Camila ?', options: ['Léa', 'Karim', 'Sofía et son groupe d’amies', 'Madame Lambert'], answer: 2 },
          { type: 'mcq', prompt: 'Sur quoi Camila et Léa ne sont-elles pas d’accord ?', options: ['Le type de films qu’elles préfèrent', 'La routine du matin', 'Le choix de l’école', 'Le pays où voyager'], answer: 0 },
          { type: 'mcq', prompt: 'Que propose Camila pour rester en contact avec Sofía ?', options: ['Ne plus jamais lui écrire', 'Se voir en France ou par appel vidéo', 'Attendre son retour définitif', 'Écrire seulement une fois par an'], answer: 1 },
          { type: 'mcq', prompt: 'Que dit Camila à propos de la ville où elle habite ?', options: ['Elle la déteste', 'Elle envoie des photos de Tours à Sofía', 'Elle veut déménager', 'Elle n’en parle pas'], answer: 1 },
          { type: 'mcq', prompt: 'Comment Camila décrit-elle sa relation avec Léa et Karim ?', options: ['Distante et froide', 'Proche, malgré quelques désaccords', 'Conflictuelle', 'Sans importance'], answer: 1 },
          { type: 'mcq', prompt: 'Vrai ou faux : Camila regrette d’être partie en France.', options: ['Vrai', 'Faux'], answer: 1 },
          { type: 'mcq', prompt: 'Dans le texte, « j’ai hâte de » signifie...', options: ['Je n’ai pas envie de', 'J’attends avec impatience', 'J’ai peur de', 'Je refuse de'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle est l’intention principale de cet e-mail ?', options: ['Se plaindre de la France', 'Partager des nouvelles et maintenir le lien d’amitié', 'Demander de l’argent', 'Annoncer un retour définitif'], answer: 1 },
          { type: 'mcq', prompt: 'Quelle phrase du texte exprime un sentiment, et non un fait ?', options: ['Léa est la fille de la famille qui m’héberge.', 'Tu me manques énormément.', 'Karim est un garçon de ma classe.', 'J’habite à Tours maintenant.'], answer: 1 }
        ]
      }),
      listening: activity('listening', {
        title: 'Un appel vidéo entre amies',
        description: 'Écoute Camila et Sofía qui se parlent enfin par appel vidéo.',
        intro: 'Écoute la conversation vidéo entre Camila et Sofía, après plusieurs semaines sans se parler.',
        dialogue: [
          { speaker: 'Sofía', line: 'Camila ! Enfin, on se voit ! Tu m’as tellement manqué.', translation: '¡Camila! ¡Por fin nos vemos! Te he extrañado muchísimo.' },
          { speaker: 'Camila', line: 'Toi aussi ! Raconte-moi tout, comment vont les autres filles ?', translation: '¡Tú también! Cuéntame todo, ¿cómo están las demás chicas?' },
          { speaker: 'Sofía', line: 'Elles vont bien, on pense souvent à toi. Et toi, comment vas-tu là-bas ?', translation: 'Están bien, pensamos mucho en ti. ¿Y tú, cómo estás allá?' },
          { speaker: 'Camila', line: 'Très bien ! Je me suis fait des amis formidables, je te les présente bientôt.', translation: '¡Muy bien! Me hice amigos formidables, te los presento pronto.' }
        ],
        phrases: ['Tu m’as manqué.', 'Raconte-moi tout.', 'On pense souvent à toi.', 'Je te les présente bientôt.'],
        exercises: [
          { type: 'mcq', prompt: 'Comment se parlent Camila et Sofía ?', options: ['Par lettre', 'Par appel vidéo', 'En personne', 'Par message texte'], answer: 1 },
          { type: 'mcq', prompt: 'Que demande Camila à Sofía ?', options: ['Comment va la France', 'Comment vont les autres filles', 'Quand elle va venir', 'Ce qu’elle a mangé'], answer: 1 },
          { type: 'mcq', prompt: 'Que promet Camila à Sofía ?', options: ['De ne plus l’appeler', 'De lui présenter ses nouveaux amis', 'De rentrer immédiatement', 'De ne rien lui dire'], answer: 1 }
        ]
      }),
      speaking: activity('speaking', {
        title: 'Parler d’une relation importante',
        description: 'Décris une relation personnelle importante pour toi.',
        mission: 'Décris une personne importante dans ta vie (ami/amie, membre de la famille) et explique pourquoi cette relation compte pour toi.',
        phrases: ['C’est une personne qui...', 'Nous sommes toujours d’accord sur...', 'Parfois, on n’est pas d’accord sur...', 'Cette personne compte pour moi parce que...'],
        dialogue: [
          { speaker: 'Toi', line: 'Ma meilleure amie est une personne qui me comprend toujours. Nous ne sommes pas toujours d’accord, mais notre amitié est très importante pour moi.', translation: 'Mi mejor amiga es una persona que siempre me entiende. No siempre estamos de acuerdo, pero nuestra amistad es muy importante para mí.' }
        ],
        exercises: [
          { type: 'speaking', prompt: 'Décris une relation personnelle importante, en utilisant au moins un pronom relatif (qui/que/où).', answer: 'Oral practice' },
          { type: 'practice', prompt: 'Écoute la description d’un/une camarade et pose-lui une question sur cette relation.', answer: 'Oral practice' }
        ]
      }),
      writing: activity('writing', {
        title: 'Un e-mail à un ami éloigné',
        description: 'Écris un e-mail personnel à un ami ou un membre de ta famille qui vit loin.',
        mission: 'Écris 80 à 100 mots sous forme d’e-mail à un ami ou un membre de ta famille qui vit loin, pour lui raconter tes nouvelles.',
        phrases: ['Cher/chère...', 'Ça fait longtemps que...', 'Tu me manques.', 'Garde contact !'],
        dialogue: [
          { speaker: 'Modèle', line: 'Chère Sofía, ça fait longtemps que je ne t’ai pas écrit ! Je me suis fait de nouveaux amis en France, mais tu me manques beaucoup. J’espère qu’on pourra garder contact. Je t’embrasse fort, Camila.', translation: 'Querida Sofía, ¡hace tiempo que no te escribo! Hice nuevos amigos en Francia, pero te extraño mucho. Espero que podamos mantener el contacto. Un abrazo fuerte, Camila.' }
        ],
        exercises: [
          { type: 'writing', prompt: 'Écris un e-mail de 80 à 100 mots à un ami ou un membre de ta famille éloigné, avec au moins un pronom relatif.', answer: 'Open answer' }
        ]
      }),
      grammar: activity('grammar', {
        title: 'Les pronoms relatifs qui, que et où',
        description: 'Relier deux phrases avec les pronoms relatifs qui, que et où.',
        grammarNote: '« Qui » remplace le sujet : « J’ai un ami qui m’aide toujours. » « Que » remplace le complément d’objet direct : « C’est une amie que j’adore. » « Où » remplace un lieu ou un moment : « C’est la ville où j’habite. »',
        phrases: ['C’est une personne qui...', 'C’est un film que j’aime...', 'C’est l’endroit où...', 'J’ai un ami qui...'],
        exercises: [
          { type: 'mcq', prompt: 'C’est une amie ___ me comprend toujours.', options: ['qui', 'que', 'où', 'dont'], answer: 0 },
          { type: 'mcq', prompt: 'C’est un documentaire ___ j’ai beaucoup aimé.', options: ['qui', 'que', 'où', 'qu’'], answer: 3 },
          { type: 'mcq', prompt: 'Tours est la ville ___ j’habite maintenant.', options: ['qui', 'que', 'où', 'dont'], answer: 2 },
          { type: 'mcq', prompt: 'J’ai des amis ___ sont formidables.', options: ['qui', 'que', 'où', 'quoi'], answer: 0 }
        ]
      }),
      vocabulary: activity('vocabulary', {
        title: 'Le vocabulaire des relations',
        description: 'Le vocabulaire essentiel pour parler de ses relations personnelles.',
        vocabulary: [
          { word: 'la meilleure amie', translation: 'la mejor amiga', example: 'Sofía est ma meilleure amie.' },
          { word: 'être d’accord / ne pas être d’accord', translation: 'estar de acuerdo / no estar de acuerdo', example: 'Nous ne sommes pas toujours d’accord.' },
          { word: 'manquer à quelqu’un', translation: 'extrañar a alguien', example: 'Tu me manques beaucoup.' },
          { word: 'garder contact', translation: 'mantener el contacto', example: 'J’espère qu’on va garder contact.' },
          { word: 'héberger', translation: 'hospedar', example: 'La famille Lambert m’héberge cette année.' }
        ],
        exercises: [
          { type: 'mcq', prompt: 'Que signifie « manquer à quelqu’un » ?', options: ['Extrañar a alguien', 'Olvidar a alguien', 'Ayudar a alguien', 'Visitar a alguien'], answer: 0 },
          { type: 'mcq', prompt: 'Que signifie « garder contact » ?', options: ['Perder el contacto', 'Mantener el contacto', 'Cambiar de número', 'Bloquear a alguien'], answer: 1 },
          { type: 'mcq', prompt: 'Que signifie « être d’accord » ?', options: ['Estar de acuerdo', 'Estar enojado', 'Estar cansado', 'Estar solo'], answer: 0 }
        ]
      }),
      dialogue: activity('dialogue', {
        title: 'Un léger désaccord',
        description: 'Léa et Camila ont un petit désaccord amical, qu’elles résolvent avec respect.',
        intro: 'Léa et Camila discutent de leurs projets pour le week-end et ne sont pas d’accord.',
        dialogue: [
          { speaker: 'Léa', line: 'On pourrait aller au cinéma samedi ?', translation: '¿Podríamos ir al cine el sábado?' },
          { speaker: 'Camila', line: 'Je ne suis pas vraiment d’accord, je préfère rester à la maison ce week-end.', translation: 'No estoy muy de acuerdo, prefiero quedarme en casa este fin de semana.' },
          { speaker: 'Léa', line: 'D’accord, je comprends. On peut regarder un film ici, alors ?', translation: 'De acuerdo, entiendo. ¿Podemos ver una película aquí, entonces?' },
          { speaker: 'Camila', line: 'Avec plaisir ! C’est une bonne solution pour nous deux.', translation: '¡Con mucho gusto! Es una buena solución para las dos.' }
        ],
        phrases: ['Je ne suis pas d’accord.', 'Je comprends.', 'On peut... alors ?', 'C’est une bonne solution.'],
        exercises: [
          { type: 'mcq', prompt: 'Que propose Léa au début ?', options: ['Rester à la maison', 'Aller au cinéma', 'Faire les courses', 'Aller au restaurant'], answer: 1 },
          { type: 'mcq', prompt: 'Pourquoi Camila n’est-elle pas d’accord ?', options: ['Elle n’aime pas Léa', 'Elle préfère rester à la maison', 'Elle n’a pas d’argent', 'Elle est malade'], answer: 1 },
          { type: 'mcq', prompt: 'Comment résolvent-elles leur désaccord ?', options: ['Elles se disputent', 'Elles trouvent un compromis', 'Elles ne se parlent plus', 'Camila change complètement d’avis'], answer: 1 }
        ]
      })
    }
  }
];

module.exports = {
  language: 'french',
  level: 'A2',
  courseTitle: 'Français A2',
  courseDescription:
    "Français élémentaire : achats, restaurants et vie quotidienne, organisés en unités thématiques qui poursuivent le parcours de Camila, élève dominicaine en échange scolaire à Tours.",
  units
};
