window.ANDERGO_FRENCH_LEVELS = window.ANDERGO_FRENCH_LEVELS || {};
window.ANDERGO_FRENCH_LEVELS.A2 = {
  level: 'A2',
  title: 'Français élémentaire',
  theme:
    'Communication quotidienne : routines, achats, nourriture, déplacements, santé et expériences passées.',
  levelGoal:
    'Communiquer dans des situations courantes, décrire une routine, raconter un événement simple et exprimer des projets.',
  cefrCanDoStatements: [
    'Je peux comprendre des expressions fréquentes liées à la vie quotidienne.',
    'Je peux échanger des informations simples sur des sujets familiers.',
    'Je peux décrire brièvement mon environnement et mes activités passées.',
    'Je peux écrire des messages et invitations simples.'
  ],
  progressDimensions: [
    'listening',
    'speaking',
    'interaction',
    'reading',
    'writing',
    'mediation',
    'vocabulary',
    'grammar',
    'pronunciation',
    'culture'
  ],
  modules: [
    {
      id: 'fr-a2-m01',
      title: 'Les achats',
      theme: 'Au marché et dans les magasins',
      goal: 'Demander un prix, comparer des produits, choisir une taille et payer.',
      lessons: [
        {
          id: 'fr-a2-m01-l01',
          title: 'Au marché',
          objective: 'Demander le prix d’un produit et acheter au marché.',
          estimatedMinutes: 20,
          skillFocus: ['listening', 'speaking', 'reading', 'writing'],
          vocabulary: [
            { french: 'le marché', spanish: 'el mercado', example: 'Je vais au marché le samedi matin.' },
            { french: 'combien ça coûte ?', spanish: '¿cuánto cuesta?', example: 'Combien ça coûte, un kilo de tomates ?' },
            { french: 'un kilo', spanish: 'un kilo', example: 'Je voudrais un kilo de pommes, s’il vous plaît.' },
            { french: 'cher / pas cher', spanish: 'caro / barato', example: 'Les fraises sont un peu chères aujourd’hui.' },
            { french: 'le vendeur / la vendeuse', spanish: 'el vendedor / la vendedora', example: 'La vendeuse me conseille des légumes frais.' },
            { french: 'la monnaie', spanish: 'el cambio, el vuelto', example: 'Voici votre monnaie, madame.' }
          ],
          grammarFocus: {
            title: 'Le passé composé avec avoir (introduction)',
            explanation:
              'Le passé composé raconte une action terminée. Pour la majorité des verbes, on forme le passé composé avec « avoir » au présent + le participe passé du verbe (acheter → acheté, manger → mangé, voir → vu).',
            examples: [
              'Hier, j’ai acheté des fruits au marché.',
              'Nous avons choisi des légumes frais.',
              'Tu as payé combien pour les tomates ?'
            ],
            commonMistakes: [
              'Oublier l’auxiliaire « avoir » : « J’acheté » (incorrect) → « J’ai acheté » (correct).',
              'Confondre le participe passé de « faire » (fait) avec l’infinitif « faire ».'
            ]
          },
          pronunciationFocus: {
            title: 'La liaison après « j’ai »',
            instruction: 'Écoute, répète lentement, puis enregistre-toi.',
            examples: ['j’ai acheté', 'j’ai eu', 'j’ai fait']
          },
          dialogue: [
            { speaker: 'A', text: 'Bonjour ! Combien ça coûte, un kilo de tomates ?' },
            { speaker: 'B', text: 'Deux euros cinquante le kilo, madame.' },
            { speaker: 'A', text: 'D’accord, j’en voudrais deux kilos, s’il vous plaît.' },
            { speaker: 'B', text: 'Voilà. Ça fait cinq euros.' },
            { speaker: 'A', text: 'Merci, voici l’argent.' }
          ],
          listeningScript:
            'Bonjour ! Combien ça coûte, un kilo de tomates ? Deux euros cinquante le kilo, madame. D’accord, j’en voudrais deux kilos, s’il vous plaît. Voilà. Ça fait cinq euros. Merci, voici l’argent.',
          readingText: {
            title: 'Une matinée au marché',
            text: 'Chaque samedi matin, Camila va au marché près de chez elle. Elle aime parler avec les vendeurs et choisir des produits frais. Aujourd’hui, elle a acheté des tomates, des pommes et du fromage. Le vendeur de fruits lui a dit : « Les fraises sont très bonnes cette semaine, et pas trop chères. » Camila a goûté une fraise et elle a décidé d’en acheter une boîte. Ensuite, elle est allée chez le boulanger pour acheter du pain. Elle a payé en espèces et elle a reçu sa monnaie. Camila adore le marché parce que les produits sont frais et parce que l’ambiance est joyeuse. Elle préfère le marché au supermarché.'
          },
          interactiveExercises: [
            {
              id: 'fr-a2-m01-l01-ex01',
              type: 'multipleChoice',
              instruction: 'Choisis la bonne réponse.',
              question: 'Que demande-t-on pour connaître le prix d’un produit ?',
              options: ['Combien ça coûte ?', 'Où est-ce ?', 'Qui est-ce ?', 'Quand est-ce ?'],
              answer: 0,
              xp: 5
            },
            {
              id: 'fr-a2-m01-l01-ex02',
              type: 'multipleChoice',
              instruction: 'D’après le texte, pourquoi Camila préfère-t-elle le marché ?',
              question: 'Pourquoi Camila préfère-t-elle le marché au supermarché ?',
              options: [
                'Parce que c’est plus rapide.',
                'Parce que les produits sont frais et l’ambiance est joyeuse.',
                'Parce que c’est plus proche de son travail.',
                'Parce qu’il n’y a pas de vendeurs.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m01-l01-ex03',
              type: 'matching',
              instruction: 'Associe chaque mot à sa traduction.',
              pairs: [
                { left: 'le marché', right: 'el mercado' },
                { left: 'combien ça coûte ?', right: '¿cuánto cuesta?' },
                { left: 'cher', right: 'caro' },
                { left: 'la monnaie', right: 'el cambio' }
              ],
              xp: 5
            },
            {
              id: 'fr-a2-m01-l01-ex04',
              type: 'shortAnswer',
              instruction: 'Écris trois phrases au passé composé sur des achats que tu as faits.',
              prompt: 'Utilise « j’ai acheté », « j’ai payé » ou « j’ai choisi ».',
              xp: 10
            }
          ],
          speakingTask: {
            instruction: 'Simule un dialogue au marché : demande le prix de trois produits et achète-les.',
            minimumSeconds: 30
          },
          writingTask: {
            instruction: 'Décris tes achats de la semaine dernière au passé composé (80 à 100 mots).',
            minimumWords: 80
          },
          mediationTask: {
            instruction: 'Explique en espagnol à un ami ce que Camila a acheté et pourquoi elle aime le marché.',
            expectedElements: ['produits achetés', 'raison de sa préférence', 'ambiance du marché']
          },
          culturalNote: {
            title: 'Le marché en France',
            text: 'Dans de nombreuses villes francophones, le marché en plein air a lieu une ou deux fois par semaine. C’est un moment social important, pas seulement pour faire les courses.'
          },
          assessment: { listening: 15, speaking: 20, interaction: 15, reading: 20, writing: 20, pronunciation: 10 },
          xpReward: 35,
          unlockRequirements: null
        },
        {
          id: 'fr-a2-m01-l02',
          title: 'Dans un magasin de vêtements',
          objective: 'Demander une taille, essayer un vêtement et comparer deux articles.',
          estimatedMinutes: 20,
          skillFocus: ['listening', 'speaking', 'reading', 'writing'],
          vocabulary: [
            { french: 'la taille', spanish: 'la talla', example: 'Quelle taille faites-vous ?' },
            { french: 'essayer', spanish: 'probarse', example: 'Je peux essayer cette veste ?' },
            { french: 'la cabine d’essayage', spanish: 'el probador', example: 'La cabine d’essayage est au fond du magasin.' },
            { french: 'plus grand / plus petit', spanish: 'más grande / más pequeño', example: 'Ce pantalon est plus grand que l’autre.' },
            { french: 'moins cher / aussi cher que', spanish: 'menos caro / tan caro como', example: 'Cette robe est moins chère que celle-là.' },
            { french: 'rendre / échanger', spanish: 'devolver / cambiar', example: 'Je voudrais échanger ce pull, il est trop petit.' }
          ],
          grammarFocus: {
            title: 'Les comparatifs',
            explanation:
              'On forme le comparatif avec plus / moins / aussi + adjectif + que. Plus grand que = más grande que. Moins cher que = menos caro que. Aussi joli que = tan bonito como.',
            examples: [
              'Ce pull est plus grand que l’autre.',
              'Cette jupe est moins chère que la robe.',
              'Le magasin en ville est aussi bon que celui du centre commercial.'
            ],
            commonMistakes: [
              'Oublier « que » après l’adjectif : « plus grand l’autre » (incorrect) → « plus grand que l’autre » (correct).',
              'Utiliser « plus bon » au lieu de « meilleur ».'
            ]
          },
          pronunciationFocus: {
            title: 'Le son /ø/ de « peu » et /œ/ de « peur »',
            instruction: 'Écoute la différence, répète, puis enregistre-toi.',
            examples: ['un peu cher', 'la couleur', 'la taille inférieure']
          },
          dialogue: [
            { speaker: 'A', text: 'Bonjour, je peux essayer cette veste en taille M ?' },
            { speaker: 'B', text: 'Bien sûr, la cabine d’essayage est là-bas.' },
            { speaker: 'A', text: 'Merci... Elle est un peu petite. Vous avez la taille L ?' },
            { speaker: 'B', text: 'Oui, voilà. Elle est plus grande et elle est moins chère aussi.' },
            { speaker: 'A', text: 'Parfait, je la prends !' }
          ],
          listeningScript:
            'Bonjour, je peux essayer cette veste en taille M ? Bien sûr, la cabine d’essayage est là-bas. Merci... Elle est un peu petite. Vous avez la taille L ? Oui, voilà. Elle est plus grande et elle est moins chère aussi. Parfait, je la prends !',
          readingText: {
            title: 'Un après-midi de shopping',
            text: 'Karim a besoin d’un nouveau manteau pour l’hiver. Il entre dans un magasin de vêtements près de la place. La vendeuse lui montre deux manteaux : le premier est noir et coûte quatre-vingts euros, le second est bleu et coûte soixante euros. « Le manteau bleu est moins cher que le noir, mais il est aussi chaud », explique-t-elle. Karim essaie les deux dans la cabine d’essayage. Le manteau noir est plus élégant, mais un peu trop grand. Le manteau bleu lui va parfaitement. Il décide d’acheter le manteau bleu parce qu’il est moins cher et qu’il est à sa taille. À la caisse, il paie par carte bancaire et il reçoit un reçu. La vendeuse lui rappelle qu’il peut échanger l’article dans les quinze jours s’il change d’avis.'
          },
          interactiveExercises: [
            {
              id: 'fr-a2-m01-l02-ex01',
              type: 'multipleChoice',
              instruction: 'Choisis la bonne réponse selon le texte.',
              question: 'Pourquoi Karim choisit-il le manteau bleu ?',
              options: [
                'Parce qu’il est plus élégant.',
                'Parce qu’il est moins cher et à sa taille.',
                'Parce que la vendeuse le préfère.',
                'Parce qu’il n’y a pas d’autre choix.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m01-l02-ex02',
              type: 'multipleChoice',
              instruction: 'Retrouve l’information dans le texte.',
              question: 'Combien de temps Karim a-t-il pour échanger l’article ?',
              options: ['Sept jours', 'Dix jours', 'Quinze jours', 'Un mois'],
              answer: 2,
              xp: 5
            },
            {
              id: 'fr-a2-m01-l02-ex03',
              type: 'matching',
              instruction: 'Associe chaque expression à sa traduction.',
              pairs: [
                { left: 'la taille', right: 'la talla' },
                { left: 'essayer', right: 'probarse' },
                { left: 'échanger', right: 'cambiar' },
                { left: 'moins cher', right: 'menos caro' }
              ],
              xp: 5
            },
            {
              id: 'fr-a2-m01-l02-ex04',
              type: 'shortAnswer',
              instruction: 'Compare deux vêtements en utilisant des comparatifs.',
              prompt: 'Écris trois phrases avec « plus... que », « moins... que » ou « aussi... que ».',
              xp: 10
            }
          ],
          speakingTask: {
            instruction: 'Joue une scène dans un magasin : demande une taille, essaie un vêtement, compare deux articles.',
            minimumSeconds: 30
          },
          writingTask: {
            instruction: 'Écris un court avis (80 à 100 mots) comparant deux vêtements que tu as achetés ou vus.',
            minimumWords: 80
          },
          mediationTask: {
            instruction: 'Résume en espagnol pourquoi Karim a choisi le manteau bleu.',
            expectedElements: ['comparaison des prix', 'la taille', 'la décision finale']
          },
          culturalNote: {
            title: 'Les soldes',
            text: 'En France, « les soldes » sont des périodes officielles de réduction, deux fois par an, très attendues par les acheteurs.'
          },
          assessment: { listening: 15, speaking: 20, interaction: 15, reading: 20, writing: 20, pronunciation: 10 },
          xpReward: 35,
          unlockRequirements: null
        },
        {
          id: 'fr-a2-m01-l03',
          title: 'Payer et échanger',
          objective: 'Payer, demander un reçu et résoudre un problème simple avec un achat.',
          estimatedMinutes: 20,
          skillFocus: ['listening', 'speaking', 'reading', 'writing'],
          vocabulary: [
            { french: 'la caisse', spanish: 'la caja', example: 'Passez à la caisse, s’il vous plaît.' },
            { french: 'payer en espèces / par carte', spanish: 'pagar en efectivo / con tarjeta', example: 'Je préfère payer par carte.' },
            { french: 'le reçu', spanish: 'el recibo', example: 'Gardez le reçu pour un éventuel échange.' },
            { french: 'rembourser', spanish: 'reembolsar', example: 'Le magasin peut vous rembourser sous dix jours.' },
            { french: 'ça ne marche pas', spanish: 'no funciona', example: 'Ce produit ne marche pas, je peux le rendre ?' },
            { french: 'le / la / les (pronoms)', spanish: 'lo / la / los / las', example: 'Ce pull, je le prends.' }
          ],
          grammarFocus: {
            title: 'Les pronoms d’objet direct : le, la, les',
            explanation:
              'Le, la et les remplacent un nom déjà mentionné pour éviter la répétition. Ils se placent avant le verbe conjugué. « Tu prends la veste ? » → « Oui, je la prends. »',
            examples: [
              'Ce pantalon, je le prends.',
              'Cette robe, tu la trouves jolie ?',
              'Les chaussures, je les ai déjà payées.'
            ],
            commonMistakes: [
              'Placer le pronom après le verbe : « Je prends le » (incorrect) → « Je le prends » (correct).',
              'Confondre « le/la » (singulier) et « les » (pluriel).'
            ]
          },
          pronunciationFocus: {
            title: 'L’élision devant une voyelle',
            instruction: 'Écoute et répète : « je l’achète », pas « je le achète ».',
            examples: ['je l’achète', 'je l’ai payé', 'je les prends']
          },
          dialogue: [
            { speaker: 'A', text: 'Bonjour, ce sac ne marche pas, la fermeture est cassée.' },
            { speaker: 'B', text: 'Vous avez le reçu ?' },
            { speaker: 'A', text: 'Oui, le voici. Je l’ai acheté hier.' },
            { speaker: 'B', text: 'D’accord, je peux vous le rembourser ou l’échanger.' },
            { speaker: 'A', text: 'Je préfère l’échanger, s’il vous plaît.' }
          ],
          listeningScript:
            'Bonjour, ce sac ne marche pas, la fermeture est cassée. Vous avez le reçu ? Oui, le voici. Je l’ai acheté hier. D’accord, je peux vous le rembourser ou l’échanger. Je préfère l’échanger, s’il vous plaît.',
          readingText: {
            title: 'Un problème résolu',
            text: 'La semaine dernière, Léa a acheté une paire de chaussures dans un grand magasin. Quand elle est rentrée chez elle, elle a remarqué qu’une chaussure avait un petit défaut. Le lendemain, elle est retournée au magasin avec le reçu. « Bonjour, j’ai un problème avec ces chaussures, elles sont abîmées », a-t-elle expliqué à la vendeuse. La vendeuse les a examinées et elle a confirmé le défaut. « Pas de problème, nous pouvons vous les échanger ou vous rembourser », a-t-elle proposé. Léa a préféré les échanger contre une nouvelle paire, dans la même taille. La vendeuse l’a remerciée pour sa patience et lui a offert un petit bon de réduction pour son prochain achat. Léa est repartie satisfaite, avec des chaussures neuves et sans défaut.'
          },
          interactiveExercises: [
            {
              id: 'fr-a2-m01-l03-ex01',
              type: 'multipleChoice',
              instruction: 'Choisis la bonne réponse selon le texte.',
              question: 'Quel était le problème de Léa ?',
              options: [
                'Les chaussures étaient trop chères.',
                'Une chaussure avait un défaut.',
                'Elle avait perdu le reçu.',
                'Les chaussures n’étaient pas à sa taille.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m01-l03-ex02',
              type: 'multipleChoice',
              instruction: 'Retrouve la conséquence dans le texte.',
              question: 'Qu’a proposé la vendeuse à Léa ?',
              options: [
                'De garder les chaussures abîmées.',
                'De les échanger ou de rembourser.',
                'De payer plus cher.',
                'De revenir dans un mois.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m01-l03-ex03',
              type: 'matching',
              instruction: 'Associe chaque expression à sa traduction.',
              pairs: [
                { left: 'le reçu', right: 'el recibo' },
                { left: 'rembourser', right: 'reembolsar' },
                { left: 'échanger', right: 'cambiar' },
                { left: 'la caisse', right: 'la caja' }
              ],
              xp: 5
            },
            {
              id: 'fr-a2-m01-l03-ex04',
              type: 'shortAnswer',
              instruction: 'Raconte un problème d’achat (réel ou imaginaire) et comment tu l’as résolu.',
              prompt: 'Utilise le passé composé et au moins un pronom (le, la, les).',
              xp: 10
            }
          ],
          speakingTask: {
            instruction: 'Explique un problème avec un article acheté et demande un remboursement ou un échange.',
            minimumSeconds: 30
          },
          writingTask: {
            instruction: 'Écris un court message au service client décrivant un problème avec un achat (80 à 100 mots).',
            minimumWords: 80
          },
          mediationTask: {
            instruction: 'Explique en espagnol la solution que la vendeuse a proposée à Léa.',
            expectedElements: ['le problème', 'la solution proposée', 'la décision de Léa']
          },
          culturalNote: {
            title: 'Le droit de rétractation',
            text: 'Dans de nombreux pays francophones, on a souvent quatorze jours pour rendre un article acheté en ligne, à condition de garder le reçu ou la facture.'
          },
          assessment: { listening: 15, speaking: 20, interaction: 15, reading: 20, writing: 20, pronunciation: 10 },
          xpReward: 35,
          unlockRequirements: null
        },
        {
          id: 'fr-a2-m01-l04',
          title: 'Bilan : une journée de courses',
          objective: 'Consolider le vocabulaire et la grammaire du module « Les achats » à travers un texte plus long.',
          estimatedMinutes: 25,
          skillFocus: ['listening', 'speaking', 'reading', 'writing', 'mediation'],
          vocabulary: [
            { french: 'faire les courses', spanish: 'hacer las compras', example: 'Le samedi, je fais les courses pour toute la semaine.' },
            { french: 'la liste de courses', spanish: 'la lista de compras', example: 'J’ai oublié ma liste de courses à la maison.' },
            { french: 'le centre commercial', spanish: 'el centro comercial', example: 'Le centre commercial ouvre à dix heures.' },
            { french: 'promotion / en solde', spanish: 'promoción / en oferta', example: 'Ces pulls sont en solde cette semaine.' },
            { french: 'fatigué(e) mais content(e)', spanish: 'cansado/a pero contento/a', example: 'Après les courses, j’étais fatiguée mais contente.' }
          ],
          grammarFocus: {
            title: 'Révision : passé composé, pronoms directs et comparatifs',
            explanation:
              'Ce bilan combine les trois points du module : raconter au passé composé, remplacer un nom par le/la/les, et comparer deux choses avec plus/moins/aussi... que.',
            examples: [
              'J’ai acheté une veste ; je l’ai payée par carte.',
              'La veste bleue était moins chère que la noire.',
              'Nous avons fait les courses ensemble samedi.'
            ],
            commonMistakes: [
              'Mélanger l’ordre des mots avec les pronoms directs.',
              'Oublier l’accord du participe passé avec « avoir » quand le complément direct est placé avant (niveau avancé, à survoler seulement).'
            ]
          },
          pronunciationFocus: {
            title: 'Rythme et groupes de souffle',
            instruction: 'Lis le texte à voix haute en marquant une courte pause après chaque virgule.',
            examples: ['Samedi matin, je suis allée au marché.', 'Ensuite, je suis allée au centre commercial.']
          },
          dialogue: [
            { speaker: 'A', text: 'Tu as fini tes courses ?' },
            { speaker: 'B', text: 'Presque ! J’ai acheté les fruits, mais je n’ai pas encore trouvé de veste.' },
            { speaker: 'A', text: 'Il y a des promotions au centre commercial.' },
            { speaker: 'B', text: 'Parfait, on y va ensemble ?' }
          ],
          listeningScript:
            'Tu as fini tes courses ? Presque ! J’ai acheté les fruits, mais je n’ai pas encore trouvé de veste. Il y a des promotions au centre commercial. Parfait, on y va ensemble ?',
          readingText: {
            title: 'Une journée de courses bien remplie',
            text: 'Samedi dernier, Inès a passé toute la journée à faire des courses. Le matin, elle est allée au marché du quartier avec sa liste. Elle a acheté des légumes, des fruits et du fromage frais. Le vendeur lui a dit que les fraises étaient moins chères que la semaine précédente, alors elle en a pris deux boîtes. Vers midi, elle est rentrée déposer ses sacs, puis elle est repartie au centre commercial pour acheter une veste d’hiver. Dans le magasin, elle a essayé trois vestes différentes. La vendeuse lui a montré une veste grise et une veste noire : la grise était plus chaude, mais la noire était moins chère et plus élégante. Après avoir hésité, Inès a choisi la veste noire. Elle l’a payée par carte et elle a gardé le reçu, au cas où elle voudrait l’échanger. En fin d’après-midi, un peu fatiguée mais contente de sa journée, Inès est rentrée chez elle avec tous ses achats. Elle a préparé le dîner avec les légumes du marché et elle a essayé sa nouvelle veste devant le miroir.'
          },
          interactiveExercises: [
            {
              id: 'fr-a2-m01-l04-ex01',
              type: 'multipleChoice',
              instruction: 'Idée principale.',
              question: 'De quoi parle principalement ce texte ?',
              options: [
                'D’un voyage à Paris.',
                'D’une journée de courses au marché et au centre commercial.',
                'D’un dîner entre amis.',
                'D’un problème avec une carte bancaire.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m01-l04-ex02',
              type: 'multipleChoice',
              instruction: 'Information spécifique.',
              question: 'Qu’est-ce qu’Inès a acheté au marché ?',
              options: [
                'Des vêtements.',
                'Des légumes, des fruits et du fromage.',
                'Une veste d’hiver.',
                'Des chaussures.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m01-l04-ex03',
              type: 'multipleChoice',
              instruction: 'Séquence.',
              question: 'Qu’est-ce qu’Inès a fait juste après être rentrée déposer ses sacs ?',
              options: [
                'Elle a préparé le dîner.',
                'Elle est repartie au centre commercial.',
                'Elle a essayé sa nouvelle veste.',
                'Elle a dormi un peu.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m01-l04-ex04',
              type: 'multipleChoice',
              instruction: 'Cause et conséquence.',
              question: 'Pourquoi Inès a-t-elle choisi la veste noire ?',
              options: [
                'Parce qu’elle était la plus chaude.',
                'Parce qu’elle était moins chère et plus élégante.',
                'Parce que la vendeuse l’a obligée.',
                'Parce que c’était la seule disponible.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m01-l04-ex05',
              type: 'multipleChoice',
              instruction: 'Vocabulaire en contexte.',
              question: 'Dans le texte, « au cas où elle voudrait l’échanger » signifie...',
              options: [
                'Elle est certaine de vouloir l’échanger.',
                'Elle envisage une possibilité future.',
                'Elle a déjà échangé la veste.',
                'Elle refuse d’échanger la veste.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m01-l04-ex06',
              type: 'multipleChoice',
              instruction: 'Inférence.',
              question: 'Comment se sent Inès à la fin de la journée ?',
              options: [
                'En colère.',
                'Fatiguée mais contente.',
                'Déçue de ses achats.',
                'Pressée de recommencer.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m01-l04-ex07',
              type: 'matching',
              instruction: 'Associe chaque expression à sa traduction.',
              pairs: [
                { left: 'faire les courses', right: 'hacer las compras' },
                { left: 'en solde', right: 'en oferta' },
                { left: 'le centre commercial', right: 'el centro comercial' },
                { left: 'fatiguée mais contente', right: 'cansada pero contenta' }
              ],
              xp: 5
            },
            {
              id: 'fr-a2-m01-l04-ex08',
              type: 'shortAnswer',
              instruction: 'Résume le texte en cinq phrases au passé composé.',
              prompt: 'Utilise au moins deux pronoms directs (le, la, les) et un comparatif.',
              xp: 15
            }
          ],
          speakingTask: {
            instruction: 'Raconte ta propre journée de courses idéale, du matin au soir.',
            minimumSeconds: 45
          },
          writingTask: {
            instruction: 'Écris le résumé de la journée d’Inès en tes propres mots (100 à 150 mots).',
            minimumWords: 100
          },
          mediationTask: {
            instruction: 'Explique en espagnol, en trois phrases, pourquoi Inès a choisi la veste noire.',
            expectedElements: ['comparaison des deux vestes', 'critère de choix', 'sentiment final d’Inès']
          },
          culturalNote: {
            title: 'Marché ou centre commercial ?',
            text: 'Beaucoup de Français combinent les deux : le marché pour les produits frais et de saison, le centre commercial pour les vêtements et l’équipement.'
          },
          assessment: { listening: 15, speaking: 20, interaction: 10, reading: 25, writing: 20, pronunciation: 10 },
          xpReward: 45,
          unlockRequirements: { minimumAverage: 60, previousLessons: ['fr-a2-m01-l01', 'fr-a2-m01-l02', 'fr-a2-m01-l03'] }
        }
      ]
    },
    {
      id: 'fr-a2-m02',
      title: 'Au restaurant',
      theme: 'Réserver, commander et exprimer une préférence',
      goal: 'Réserver une table, commander un repas et exprimer poliment une préférence ou une plainte.',
      lessons: [
        {
          id: 'fr-a2-m02-l01',
          title: 'Réserver une table',
          objective: 'Réserver une table par téléphone en précisant l’heure et le nombre de personnes.',
          estimatedMinutes: 20,
          skillFocus: ['listening', 'speaking', 'reading', 'writing'],
          vocabulary: [
            { french: 'réserver une table', spanish: 'reservar una mesa', example: 'Je voudrais réserver une table pour ce soir.' },
            { french: 'pour combien de personnes ?', spanish: '¿para cuántas personas?', example: 'C’est pour combien de personnes ?' },
            { french: 'à quelle heure ?', spanish: '¿a qué hora?', example: 'À quelle heure voulez-vous venir ?' },
            { french: 'complet / disponible', spanish: 'completo / disponible', example: 'Désolé, nous sommes complets à vingt heures.' },
            { french: 'vouloir / pouvoir', spanish: 'querer / poder', example: 'Je voudrais réserver ; est-ce que je peux venir avec des enfants ?' },
            { french: 'au nom de', spanish: 'a nombre de', example: 'La réservation est au nom de Martin.' }
          ],
          grammarFocus: {
            title: 'Vouloir et pouvoir au conditionnel de politesse',
            explanation:
              'Pour demander poliment, on utilise souvent « je voudrais » (vouloir) et « est-ce que je pourrais » (pouvoir) plutôt que « je veux » ou « je peux », qui sonnent plus directs.',
            examples: [
              'Je voudrais réserver une table pour deux personnes.',
              'Est-ce que je pourrais avoir une table près de la fenêtre ?',
              'Pourriez-vous confirmer l’heure, s’il vous plaît ?'
            ],
            commonMistakes: [
              'Utiliser « je veux » dans un contexte formel, ce qui peut sembler impoli.',
              'Oublier de préciser le nombre de personnes et l’heure.'
            ]
          },
          pronunciationFocus: {
            title: 'L’intonation polie',
            instruction: 'Écoute et répète avec une intonation montante et douce.',
            examples: ['je voudrais...', 'est-ce que je pourrais...', 's’il vous plaît']
          },
          dialogue: [
            { speaker: 'A', text: 'Bonjour, je voudrais réserver une table pour ce soir.' },
            { speaker: 'B', text: 'Bien sûr, c’est pour combien de personnes ?' },
            { speaker: 'A', text: 'Pour quatre personnes, à vingt heures trente.' },
            { speaker: 'B', text: 'C’est noté. C’est à quel nom ?' },
            { speaker: 'A', text: 'Au nom de Dubois, merci beaucoup.' }
          ],
          listeningScript:
            'Bonjour, je voudrais réserver une table pour ce soir. Bien sûr, c’est pour combien de personnes ? Pour quatre personnes, à vingt heures trente. C’est noté. C’est à quel nom ? Au nom de Dubois, merci beaucoup.',
          readingText: {
            title: 'Une réservation pour un anniversaire',
            text: 'Marc organise l’anniversaire de sa sœur et il décide de réserver un restaurant. Il appelle le restaurant « Le Petit Jardin » vers midi. « Bonjour, je voudrais réserver une table pour six personnes samedi soir », dit-il. La personne au téléphone lui répond qu’à vingt heures, le restaurant est complet, mais qu’il reste de la place à vingt et une heures trente. Marc accepte sans hésiter, car l’important est de fêter l’anniversaire ensemble. Il précise que sa sœur ne mange pas de viande, et la personne lui confirme qu’il y a plusieurs plats végétariens au menu. Avant de raccrocher, Marc donne son nom et son numéro de téléphone pour confirmer la réservation. Il est content, car il pourra surprendre sa sœur avec un dîner spécial dans un endroit qu’elle adore.'
          },
          interactiveExercises: [
            {
              id: 'fr-a2-m02-l01-ex01',
              type: 'multipleChoice',
              instruction: 'Choisis la bonne réponse selon le texte.',
              question: 'Pourquoi Marc réserve-t-il une table ?',
              options: [
                'Pour un rendez-vous professionnel.',
                'Pour fêter l’anniversaire de sa sœur.',
                'Pour un déjeuner d’affaires.',
                'Pour un dîner romantique.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l01-ex02',
              type: 'multipleChoice',
              instruction: 'Information spécifique.',
              question: 'À quelle heure Marc obtient-il finalement une table ?',
              options: ['À vingt heures', 'À vingt et une heures trente', 'À dix-neuf heures', 'À vingt-deux heures'],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l01-ex03',
              type: 'matching',
              instruction: 'Associe chaque expression à sa traduction.',
              pairs: [
                { left: 'réserver une table', right: 'reservar una mesa' },
                { left: 'complet', right: 'completo' },
                { left: 'au nom de', right: 'a nombre de' },
                { left: 'végétarien', right: 'vegetariano' }
              ],
              xp: 5
            },
            {
              id: 'fr-a2-m02-l01-ex04',
              type: 'shortAnswer',
              instruction: 'Écris un court dialogue téléphonique de réservation.',
              prompt: 'Précise le nombre de personnes, l’heure et une préférence alimentaire.',
              xp: 10
            }
          ],
          speakingTask: {
            instruction: 'Simule un appel pour réserver une table pour un événement de ton choix.',
            minimumSeconds: 30
          },
          writingTask: {
            instruction: 'Écris un court e-mail de réservation à un restaurant (80 à 100 mots).',
            minimumWords: 80
          },
          mediationTask: {
            instruction: 'Explique en espagnol à un ami pourquoi Marc a accepté l’heure de vingt et une heures trente.',
            expectedElements: ['heure demandée initialement', 'raison de l’acceptation', 'préférence alimentaire mentionnée']
          },
          culturalNote: {
            title: 'Réserver dans un restaurant francophone',
            text: 'Dans beaucoup de restaurants populaires, il est fortement recommandé de réserver à l’avance, surtout le week-end.'
          },
          assessment: { listening: 15, speaking: 20, interaction: 15, reading: 20, writing: 20, pronunciation: 10 },
          xpReward: 35,
          unlockRequirements: null
        },
        {
          id: 'fr-a2-m02-l02',
          title: 'Commander au restaurant',
          objective: 'Commander un repas, poser des questions sur un plat et exprimer une quantité.',
          estimatedMinutes: 20,
          skillFocus: ['listening', 'speaking', 'reading', 'writing'],
          vocabulary: [
            { french: 'la carte / le menu', spanish: 'la carta / el menú', example: 'Est-ce que je peux voir la carte, s’il vous plaît ?' },
            { french: 'l’entrée, le plat, le dessert', spanish: 'la entrada, el plato principal, el postre', example: 'Comme entrée, je vais prendre la salade.' },
            { french: 'il faut / devoir', spanish: 'hay que / deber', example: 'Il faut réserver pour ce restaurant.' },
            { french: 'un peu de / beaucoup de', spanish: 'un poco de / mucho de', example: 'Je voudrais un peu de sauce, pas trop.' },
            { french: 'l’addition', spanish: 'la cuenta', example: 'L’addition, s’il vous plaît.' },
            { french: 'à point / bien cuit', spanish: 'a punto / bien cocido', example: 'Je préfère ma viande bien cuite.' }
          ],
          grammarFocus: {
            title: 'Devoir et il faut : exprimer l’obligation',
            explanation:
              '« Devoir » se conjugue selon la personne (je dois, tu dois, il/elle doit...) tandis que « il faut » est impersonnel et reste invariable, suivi d’un infinitif ou d’un nom.',
            examples: [
              'Je dois choisir entre le poisson et la viande.',
              'Il faut goûter la spécialité de la maison.',
              'Il faut un peu de temps pour préparer ce plat.'
            ],
            commonMistakes: [
              'Conjuguer « il faut » selon la personne : « je faux » (incorrect, n’existe pas).',
              'Oublier l’infinitif après « devoir » ou « il faut ».'
            ]
          },
          pronunciationFocus: {
            title: 'Les adverbes de quantité',
            instruction: 'Écoute et répète en marquant bien le son nasal de « beaucoup ».',
            examples: ['un peu de', 'beaucoup de', 'assez de']
          },
          dialogue: [
            { speaker: 'A', text: 'Bonsoir, vous avez choisi ?' },
            { speaker: 'B', text: 'Oui, comme entrée, je prends la soupe, et comme plat, le poulet.' },
            { speaker: 'A', text: 'Très bien. Vous voulez de la sauce ?' },
            { speaker: 'B', text: 'Oui, un peu de sauce, pas trop, s’il vous plaît.' },
            { speaker: 'A', text: 'Parfait, et comme boisson ?' },
            { speaker: 'B', text: 'De l’eau, merci.' }
          ],
          listeningScript:
            'Bonsoir, vous avez choisi ? Oui, comme entrée, je prends la soupe, et comme plat, le poulet. Très bien. Vous voulez de la sauce ? Oui, un peu de sauce, pas trop, s’il vous plaît. Parfait, et comme boisson ? De l’eau, merci.',
          readingText: {
            title: 'Un dîner découverte',
            text: 'Pour son anniversaire, Sophie a invité deux amies dans un restaurant italien du centre-ville. Le serveur leur apporte la carte et explique les spécialités du jour. « Il faut absolument goûter les pâtes maison », dit-il avec un sourire. Sophie hésite entre le poisson et les pâtes, mais elle décide finalement de suivre le conseil du serveur. Ses amies commandent une pizza et une salade. Quand le serveur demande si elles veulent du fromage sur les pâtes, Sophie répond : « Oui, un peu, s’il vous plaît, mais pas trop, je dois faire attention. » Pendant le repas, elles discutent, rient et goûtent les plats des autres. À la fin, le serveur leur propose un dessert offert par la maison pour l’anniversaire de Sophie. Avant de partir, elles demandent l’addition et décident de partager équitablement entre les trois amies. Sophie repart enchantée de sa soirée et promet de revenir bientôt avec d’autres amis.'
          },
          interactiveExercises: [
            {
              id: 'fr-a2-m02-l02-ex01',
              type: 'multipleChoice',
              instruction: 'Idée principale.',
              question: 'De quoi parle ce texte ?',
              options: [
                'D’un dîner d’anniversaire entre amies.',
                'D’un cours de cuisine.',
                'D’une réservation annulée.',
                'D’un problème avec l’addition.'
              ],
              answer: 0,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l02-ex02',
              type: 'multipleChoice',
              instruction: 'Information spécifique.',
              question: 'Que conseille le serveur à Sophie ?',
              options: ['La pizza', 'Les pâtes maison', 'La salade', 'Le poisson'],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l02-ex03',
              type: 'multipleChoice',
              instruction: 'Intention communicative.',
              question: 'Que veut dire Sophie quand elle répond « oui, un peu, s’il vous plaît, mais pas trop » ?',
              options: [
                'Elle ne veut pas de fromage du tout.',
                'Elle veut une petite quantité de fromage.',
                'Elle veut beaucoup de fromage.',
                'Elle demande le prix du fromage.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l02-ex04',
              type: 'matching',
              instruction: 'Associe chaque expression à sa traduction.',
              pairs: [
                { left: 'la carte', right: 'la carta' },
                { left: 'l’addition', right: 'la cuenta' },
                { left: 'un peu de', right: 'un poco de' },
                { left: 'il faut', right: 'hay que' }
              ],
              xp: 5
            },
            {
              id: 'fr-a2-m02-l02-ex05',
              type: 'shortAnswer',
              instruction: 'Rédige ta propre commande au restaurant.',
              prompt: 'Choisis une entrée, un plat et une boisson, et utilise « il faut » ou « devoir » une fois.',
              xp: 10
            }
          ],
          speakingTask: {
            instruction: 'Commande un repas complet dans un restaurant imaginaire, en posant une question sur un plat.',
            minimumSeconds: 30
          },
          writingTask: {
            instruction: 'Écris une critique de restaurant décrivant ce que tu as commandé (80 à 120 mots).',
            minimumWords: 80
          },
          mediationTask: {
            instruction: 'Explique en espagnol à un ami ce que Sophie et ses amies ont commandé et pourquoi.',
            expectedElements: ['plats commandés', 'conseil du serveur', 'ambiance du dîner']
          },
          culturalNote: {
            title: 'Le service en France',
            text: 'Le service est généralement inclus dans l’addition en France ; laisser un petit pourboire supplémentaire reste apprécié mais n’est pas obligatoire.'
          },
          assessment: { listening: 15, speaking: 20, interaction: 15, reading: 20, writing: 20, pronunciation: 10 },
          xpReward: 35,
          unlockRequirements: null
        },
        {
          id: 'fr-a2-m02-l03',
          title: 'Exprimer une préférence ou une plainte polie',
          objective: 'Exprimer une préférence, dire ce qu’on n’aime pas et faire une réclamation polie.',
          estimatedMinutes: 20,
          skillFocus: ['listening', 'speaking', 'reading', 'writing'],
          vocabulary: [
            { french: 'je préfère', spanish: 'yo prefiero', example: 'Je préfère le poisson à la viande.' },
            { french: 'ce n’est pas terrible', spanish: 'no está muy bueno', example: 'Le plat n’était pas terrible, un peu froid.' },
            { french: 'ne... jamais / ne... plus / ne... rien', spanish: 'nunca / ya no / nada', example: 'Je ne mange jamais de viande crue.' },
            { french: 'excusez-moi, mais...', spanish: 'disculpe, pero...', example: 'Excusez-moi, mais ce plat est froid.' },
            { french: 'pourriez-vous... ?', spanish: '¿podría usted...?', example: 'Pourriez-vous réchauffer mon plat, s’il vous plaît ?' },
            { french: 'satisfait(e) / déçu(e)', spanish: 'satisfecho/a / decepcionado/a', example: 'Nous sommes déçus du service ce soir.' }
          ],
          grammarFocus: {
            title: 'Les négations : ne... jamais, ne... plus, ne... rien',
            explanation:
              'Ces négations encadrent le verbe conjugué comme « ne... pas », mais expriment des nuances différentes : jamais (nunca), plus (ya no), rien (nada).',
            examples: [
              'Je ne mange jamais de fruits de mer.',
              'Il n’y a plus de pain, désolé.',
              'Je n’ai rien commandé de spécial.'
            ],
            commonMistakes: [
              'Oublier le « ne » à l’oral n’est pas grave en langue parlée informelle, mais à l’écrit il est obligatoire.',
              'Confondre « ne... plus » (ya no) avec « ne... pas plus » (comparatif).'
            ]
          },
          pronunciationFocus: {
            title: 'Intonation d’une plainte polie',
            instruction: 'Écoute et répète avec un ton calme mais ferme.',
            examples: ['excusez-moi, mais...', 'pourriez-vous...', 'ce n’est pas terrible']
          },
          dialogue: [
            { speaker: 'A', text: 'Excusez-moi, mais mon plat est froid.' },
            { speaker: 'B', text: 'Je suis désolé, je vais le faire réchauffer tout de suite.' },
            { speaker: 'A', text: 'Merci. Et pourriez-vous apporter un peu plus de pain ?' },
            { speaker: 'B', text: 'Bien sûr, tout de suite.' },
            { speaker: 'A', text: 'Je préfère toujours signaler poliment plutôt que de rester insatisfait.' }
          ],
          listeningScript:
            'Excusez-moi, mais mon plat est froid. Je suis désolé, je vais le faire réchauffer tout de suite. Merci. Et pourriez-vous apporter un peu plus de pain ? Bien sûr, tout de suite. Je préfère toujours signaler poliment plutôt que de rester insatisfait.',
          readingText: {
            title: 'Une soirée presque parfaite',
            text: 'Théo et Nadia dînent dans un nouveau restaurant recommandé par des amis. Au début, tout se passe bien : l’accueil est chaleureux et l’ambiance est agréable. Mais quand les plats arrivent, Nadia remarque que sa soupe n’est plus assez chaude. Elle appelle poliment le serveur : « Excusez-moi, mais ma soupe n’est plus chaude, pourriez-vous la réchauffer ? » Le serveur s’excuse immédiatement et l’emporte en cuisine. Pendant ce temps, Théo goûte son plat et le trouve délicieux ; il ne regrette rien d’avoir choisi ce restaurant. Quand la soupe de Nadia revient, elle est parfaite. À la fin du repas, le serveur leur offre un café pour s’excuser du désagrément. Nadia apprécie ce geste : elle préfère toujours un restaurant qui sait reconnaître une erreur plutôt qu’un endroit qui ne fait jamais rien pour ses clients. Ils décident tous les deux qu’ils reviendront, malgré ce petit incident, parce que le reste de la soirée était vraiment agréable.'
          },
          interactiveExercises: [
            {
              id: 'fr-a2-m02-l03-ex01',
              type: 'multipleChoice',
              instruction: 'Idée principale.',
              question: 'Quel est le sujet principal du texte ?',
              options: [
                'Un dîner sans aucun problème.',
                'Un petit incident bien géré pendant un dîner.',
                'Une réservation annulée.',
                'Un restaurant fermé.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l03-ex02',
              type: 'multipleChoice',
              instruction: 'Cause et conséquence.',
              question: 'Pourquoi Nadia appelle-t-elle le serveur ?',
              options: [
                'Parce qu’elle veut l’addition.',
                'Parce que sa soupe n’est plus chaude.',
                'Parce qu’elle veut changer de table.',
                'Parce que le service est trop lent.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l03-ex03',
              type: 'multipleChoice',
              instruction: 'Opinion vs fait.',
              question: 'Quelle phrase exprime une opinion de Nadia, et non un fait ?',
              options: [
                'La soupe n’était plus chaude.',
                'Elle préfère un restaurant qui reconnaît une erreur.',
                'Le serveur a offert un café.',
                'Ils ont dîné dans un nouveau restaurant.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l03-ex04',
              type: 'matching',
              instruction: 'Associe chaque expression à sa traduction.',
              pairs: [
                { left: 'ce n’est pas terrible', right: 'no está muy bueno' },
                { left: 'pourriez-vous...', right: '¿podría usted...?' },
                { left: 'déçu(e)', right: 'decepcionado/a' },
                { left: 'ne... jamais', right: 'nunca' }
              ],
              xp: 5
            },
            {
              id: 'fr-a2-m02-l03-ex05',
              type: 'shortAnswer',
              instruction: 'Rédige une réclamation polie au restaurant.',
              prompt: 'Utilise au moins une négation (ne... jamais / ne... plus / ne... rien) et « pourriez-vous ».',
              xp: 10
            }
          ],
          speakingTask: {
            instruction: 'Fais une réclamation polie au sujet d’un plat, puis remercie le serveur pour sa solution.',
            minimumSeconds: 30
          },
          writingTask: {
            instruction: 'Écris un avis en ligne sur ce restaurant, en mentionnant le problème et la solution (100 à 130 mots).',
            minimumWords: 100
          },
          mediationTask: {
            instruction: 'Explique en espagnol à un ami ce qui s’est passé avec la soupe de Nadia et comment le serveur a réagi.',
            expectedElements: ['le problème', 'la réaction du serveur', 'l’opinion finale de Nadia']
          },
          culturalNote: {
            title: 'Se plaindre poliment',
            text: 'Dans la culture francophone, une réclamation formulée calmement, avec « excusez-moi » et « pourriez-vous », est généralement bien reçue et efficace.'
          },
          assessment: { listening: 15, speaking: 20, interaction: 15, reading: 20, writing: 20, pronunciation: 10 },
          xpReward: 35,
          unlockRequirements: null
        },
        {
          id: 'fr-a2-m02-l04',
          title: 'Bilan : critique de restaurant',
          objective: 'Consolider le vocabulaire et la grammaire du module « Au restaurant » à travers une critique complète.',
          estimatedMinutes: 25,
          skillFocus: ['listening', 'speaking', 'reading', 'writing', 'mediation'],
          vocabulary: [
            { french: 'l’ambiance', spanish: 'el ambiente', example: 'L’ambiance du restaurant était très chaleureuse.' },
            { french: 'recommander', spanish: 'recomendar', example: 'Je recommande vivement ce restaurant.' },
            { french: 'le rapport qualité-prix', spanish: 'la relación calidad-precio', example: 'Le rapport qualité-prix est excellent.' },
            { french: 'décevant(e)', spanish: 'decepcionante', example: 'Le dessert était un peu décevant.' },
            { french: 'dans l’ensemble', spanish: 'en general', example: 'Dans l’ensemble, nous avons passé une bonne soirée.' }
          ],
          grammarFocus: {
            title: 'Révision : devoir/il faut, négations et politesse',
            explanation:
              'Ce bilan combine les structures du module : formuler une demande polie avec « je voudrais »/« pourriez-vous », exprimer une obligation avec « devoir »/« il faut », et utiliser des négations pour exprimer un manque ou une absence.',
            examples: [
              'Il faut réserver, sinon il n’y a plus de table.',
              'Nous ne recommandons jamais un restaurant sans bon service.',
              'Pourriez-vous nous dire le plat du jour ?'
            ],
            commonMistakes: [
              'Oublier « ne » à l’écrit dans les négations.',
              'Utiliser un ton trop direct pour une demande formelle.'
            ]
          },
          pronunciationFocus: {
            title: 'Lecture expressive d’une critique',
            instruction: 'Lis le texte à voix haute en variant l’intonation entre les points positifs et négatifs.',
            examples: ['Dans l’ensemble, c’était excellent.', 'Le service était un peu lent, malheureusement.']
          },
          dialogue: [
            { speaker: 'A', text: 'Tu as aimé le restaurant hier soir ?' },
            { speaker: 'B', text: 'Dans l’ensemble, oui ! Le plat principal était délicieux.' },
            { speaker: 'A', text: 'Et le service ?' },
            { speaker: 'B', text: 'Un peu lent, mais le personnel était très aimable.' },
            { speaker: 'A', text: 'Tu le recommandes ?' },
            { speaker: 'B', text: 'Oui, surtout pour le rapport qualité-prix.' }
          ],
          listeningScript:
            'Tu as aimé le restaurant hier soir ? Dans l’ensemble, oui ! Le plat principal était délicieux. Et le service ? Un peu lent, mais le personnel était très aimable. Tu le recommandes ? Oui, surtout pour le rapport qualité-prix.',
          readingText: {
            title: 'Critique : Le Petit Jardin',
            text: 'Le week-end dernier, ma famille et moi avons dîné au restaurant « Le Petit Jardin », dans le centre-ville. Nous avions réservé une table pour cinq personnes à dix-neuf heures trente, et l’accueil a été chaleureux dès notre arrivée. L’ambiance est agréable : des lumières douces, de la musique discrète et une décoration simple mais élégante. Pour commencer, nous avons commandé plusieurs entrées à partager, comme la soupe du jour et une salade de saison. Il a fallu attendre un peu, mais le serveur nous a expliqué que le restaurant était complet ce soir-là. Ensuite, les plats principaux sont arrivés : mon frère a pris le poisson, ma mère a préféré les pâtes maison, et moi, j’ai choisi le poulet aux légumes. Tout le monde a beaucoup aimé, sauf mon père, qui a trouvé son plat un peu décevant, moins savoureux que ce qu’il attendait. Pour le dessert, nous avons partagé une tarte aux fruits délicieuse. Le service a été un peu lent pendant la soirée, mais jamais désagréable. En sortant, nous avons décidé que, dans l’ensemble, l’expérience valait le coup, surtout pour le rapport qualité-prix. Je recommande ce restaurant pour un dîner en famille, à condition de réserver à l’avance et de ne pas être trop pressé.'
          },
          interactiveExercises: [
            {
              id: 'fr-a2-m02-l04-ex01',
              type: 'multipleChoice',
              instruction: 'Idée principale.',
              question: 'De quoi parle ce texte ?',
              options: [
                'D’une critique d’un dîner en famille au restaurant.',
                'D’une recette de cuisine.',
                'D’un problème de réservation non résolu.',
                'D’un restaurant fermé définitivement.'
              ],
              answer: 0,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l04-ex02',
              type: 'multipleChoice',
              instruction: 'Information spécifique.',
              question: 'Pour combien de personnes la table était-elle réservée ?',
              options: ['Trois', 'Quatre', 'Cinq', 'Six'],
              answer: 2,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l04-ex03',
              type: 'multipleChoice',
              instruction: 'Séquence.',
              question: 'Qu’est-ce que la famille a mangé en dernier ?',
              options: ['La soupe du jour', 'Le plat principal', 'La tarte aux fruits', 'La salade de saison'],
              answer: 2,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l04-ex04',
              type: 'multipleChoice',
              instruction: 'Cause et conséquence.',
              question: 'Pourquoi a-t-il fallu attendre un peu avant les entrées ?',
              options: [
                'Le restaurant était complet ce soir-là.',
                'La famille était en retard.',
                'Le serveur avait oublié la commande.',
                'Il n’y avait pas assez de personnel.'
              ],
              answer: 0,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l04-ex05',
              type: 'multipleChoice',
              instruction: 'Différence entre fait et opinion.',
              question: 'Laquelle de ces phrases est une opinion, pas un fait ?',
              options: [
                'Le père a trouvé son plat décevant.',
                'La famille a réservé pour dix-neuf heures trente.',
                'Ils ont partagé une tarte aux fruits.',
                'Le restaurant s’appelle « Le Petit Jardin ».'
              ],
              answer: 0,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l04-ex06',
              type: 'multipleChoice',
              instruction: 'Vocabulaire en contexte.',
              question: 'Dans le texte, « valait le coup » signifie...',
              options: ['Coûtait trop cher', 'En valait la peine', 'Était trop lent', 'Était complet'],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l04-ex07',
              type: 'multipleChoice',
              instruction: 'Inférence.',
              question: 'Que recommande l’auteur pour bien profiter de ce restaurant ?',
              options: [
                'D’arriver sans réserver.',
                'De réserver à l’avance et de ne pas être pressé.',
                'D’éviter les desserts.',
                'De venir uniquement le midi.'
              ],
              answer: 1,
              xp: 5
            },
            {
              id: 'fr-a2-m02-l04-ex08',
              type: 'matching',
              instruction: 'Associe chaque expression à sa traduction.',
              pairs: [
                { left: 'l’ambiance', right: 'el ambiente' },
                { left: 'décevant', right: 'decepcionante' },
                { left: 'le rapport qualité-prix', right: 'la relación calidad-precio' },
                { left: 'dans l’ensemble', right: 'en general' }
              ],
              xp: 5
            },
            {
              id: 'fr-a2-m02-l04-ex09',
              type: 'shortAnswer',
              instruction: 'Écris ta propre critique d’un restaurant (réel ou imaginaire).',
              prompt: 'Mentionne l’ambiance, un point positif, un point négatif et ta recommandation finale.',
              xp: 15
            }
          ],
          speakingTask: {
            instruction: 'Présente oralement une critique de restaurant de deux minutes : ambiance, plats, service et recommandation.',
            minimumSeconds: 60
          },
          writingTask: {
            instruction: 'Rédige une critique complète de restaurant (120 à 150 mots), avec un point positif et un point négatif.',
            minimumWords: 120
          },
          mediationTask: {
            instruction: 'Résume en espagnol l’expérience de la famille, en trois phrases maximum.',
            expectedElements: ['ce qu’ils ont commandé', 'le problème mineur du service', 'la recommandation finale']
          },
          culturalNote: {
            title: 'Les critiques de restaurant en ligne',
            text: 'En France, les avis en ligne influencent beaucoup le choix d’un restaurant ; ils mentionnent presque toujours le rapport qualité-prix.'
          },
          assessment: { listening: 15, speaking: 20, interaction: 10, reading: 25, writing: 20, pronunciation: 10 },
          xpReward: 45,
          unlockRequirements: { minimumAverage: 60, previousLessons: ['fr-a2-m02-l01', 'fr-a2-m02-l02', 'fr-a2-m02-l03'] }
        }
      ]
    },
    {
      id: 'fr-a2-m03',
      title: 'Se déplacer',
      status: 'planned',
      lessons: []
    },
    {
      id: 'fr-a2-m04',
      title: 'La santé',
      status: 'planned',
      lessons: []
    },
    {
      id: 'fr-a2-m05',
      title: 'Les voyages',
      status: 'planned',
      lessons: []
    },
    {
      id: 'fr-a2-m06',
      title: 'Raconter au passé',
      status: 'planned',
      lessons: []
    },
    {
      id: 'fr-a2-m07',
      title: 'Les projets',
      status: 'planned',
      lessons: []
    },
    {
      id: 'fr-a2-m08',
      title: 'Inviter et répondre',
      status: 'planned',
      lessons: []
    }
  ],
  skills: {
    listening: { title: 'Compréhension orale', status: 'connected' },
    speaking: { title: 'Production et interaction orales', status: 'connected' },
    reading: { title: 'Compréhension écrite', status: 'connected' },
    writing: { title: 'Production écrite', status: 'connected' },
    mediation: { title: 'Médiation', status: 'connected' }
  },
  vocabulary: [
    'rendez-vous',
    'marché',
    'prix',
    'reçu',
    'carte bancaire',
    'arrêt de bus',
    'tout droit',
    'tournez à gauche',
    'nourriture saine',
    'météo',
    'hier',
    'la semaine dernière'
  ],
  grammar: [
    'présent des verbes fréquents',
    'passé composé',
    'futur proche',
    'impératif',
    'verbes pronominaux',
    'comparatifs',
    'pronoms directs',
    'prépositions de lieu et de temps'
  ],
  pronunciation: ['liaison', 'élision', 'rythme', 'intonation', 'e muet'],
  communicativeFunctions: [
    'Comprendre et transmettre des informations.',
    'Interagir dans des situations adaptées au niveau.',
    'Exprimer un point de vue avec un degré croissant de précision.',
    'Médiatiser ou reformuler une information pour autrui.'
  ],
  tasks: [
    'Commander au restaurant',
    'Demander son chemin',
    'Raconter une activité passée',
    'Écrire une invitation',
    'Décrire un projet proche'
  ],
  examPreparation: {
    exam: 'DELF A2',
    note: 'Parcours de préparation; ANDERGO ne délivre pas le diplôme officiel.',
    components: [
      'Compréhension de l’oral',
      'Compréhension des écrits',
      'Production écrite',
      'Production orale'
    ]
  }
};
