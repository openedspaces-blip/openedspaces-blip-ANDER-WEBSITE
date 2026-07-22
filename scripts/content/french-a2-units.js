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
