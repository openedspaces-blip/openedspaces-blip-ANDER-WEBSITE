// Français C2 — science de l'apprentissage et acquisition des langues.
// Chaque unité repose sur une question réelle, des résultats publiés, leurs
// limites et des implications pédagogiques prudentes. Les références sont
// affichées au pied du Reading par le frontend.

function ref(author, year, title, url) {
  return { author, year, title, url };
}

const sources = {
  plasticity2004: ref(
    'Mechelli et al.',
    '2004',
    'Structural plasticity in the bilingual brain',
    'https://www.nature.com/articles/431757a'
  ),
  connectivity2024: ref(
    'Kousaie et al.',
    '2024',
    'Enhanced efficiency in the bilingual brain through the inter-hemispheric cortico-cerebellar pathway',
    'https://www.nature.com/articles/s42003-024-06965-1'
  ),
  adult2021: ref(
    'Ripollés et al.',
    '2021',
    'The challenge of learning a new language in adulthood: Evidence from a multi-methodological neuroscientific approach',
    'https://pubmed.ncbi.nlm.nih.gov/33606715/'
  ),
  retrieval2011: ref(
    'Rawson et al.',
    '2011',
    'Optimizing schedules of retrieval practice for durable and efficient learning',
    'https://pubmed.ncbi.nlm.nih.gov/21707204/'
  ),
  sleep2021: ref(
    'Schimke et al.',
    '2021',
    'The effect of sleep on novel word learning in healthy adults: A systematic review and meta-analysis',
    'https://pubmed.ncbi.nlm.nih.gov/34549375/'
  ),
  sleep2017: ref(
    'Batterink, Westerberg et Paller',
    '2017',
    'Vocabulary learning benefits from REM after slow-wave sleep',
    'https://pubmed.ncbi.nlm.nih.gov/28697944/'
  ),
  sleep2025: ref(
    'James et al.',
    '2025',
    'Does overnight memory consolidation support next-day learning?',
    'https://pubmed.ncbi.nlm.nih.gov/40675054/'
  ),
  incidental2023: ref(
    'Webb, Uchihara et Yanagisawa',
    '2023',
    'How effective is second language incidental vocabulary learning? A meta-analysis',
    'https://www.cambridge.org/core/journals/language-teaching/article/how-effective-is-second-language-incidental-vocabulary-learning-a-metaanalysis/E38E3468FD2090B1FA3051051DE8E70C'
  ),
  interaction2018: ref(
    'Mackey',
    '2018',
    'Interaction and instructed second language acquisition',
    'https://www.cambridge.org/core/journals/language-teaching/article/interaction-and-instructed-second-language-acquisition/78A156EE200F744F5978F99BFB073DBE'
  ),
  audiovisual2026: ref(
    'Sutton et Webb',
    '2026',
    'The effects of audiovisual input on second language learning: A meta-analysis',
    'https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/effects-of-audiovisual-input-on-second-language-learning-a-metaanalysis/9B61BAEF14F110F01148E398D171634A'
  ),
  gloss2020: ref(
    'Yanagisawa, Webb et Uchihara',
    '2020',
    'How do different forms of glossing contribute to L2 vocabulary learning?',
    'https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/abs/how-do-different-forms-of-glossing-contribute-to-l2-vocabulary-learning-from-reading/38124150D59DF3039EE1FF5AE88FE922'
  ),
  notes2024: ref(
    'Jin et Webb',
    '2024',
    'The effectiveness of note taking through exposure to L2 input: A meta-analysis',
    'https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/effectiveness-of-note-taking-through-exposure-to-l2-input-a-metaanalysis/C5CA68C9A1B1E873754EFCFEFF55A005'
  ),
  feedback2010: ref(
    'Lyster et Saito',
    '2010',
    'Oral feedback in classroom SLA: A meta-analysis',
    'https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/volume/0A4A03B3E1A1CAEB8501324E49446E70'
  ),
  pronunciation2017: ref(
    'Sakai et Moorman',
    '2018',
    'Can perception training improve the production of second language phonemes?',
    'https://www.cambridge.org/core/journals/applied-psycholinguistics/article/abs/can-perception-training-improve-the-production-of-second-language-phonemes-a-metaanalytic-review-of-25-years-of-perception-training-research/57401D28450902EE96659AD10AA11488'
  ),
  asr2023: ref(
    'Ngo, Chen et Lai',
    '2023',
    'The effectiveness of automatic speech recognition in ESL/EFL pronunciation: A meta-analysis',
    'https://www.cambridge.org/core/journals/recall/article/effectiveness-of-automatic-speech-recognition-in-eslefl-pronunciation-a-metaanalysis/A915444CF252B61D14961D2FE733822D'
  ),
  anxiety2024: ref(
    'Yu',
    '2024',
    'Foreign language anxiety research in System between 2004 and 2023',
    'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1373290/full'
  ),
  age1998: ref(
    'Perani et al.',
    '1998',
    'The bilingual brain: Proficiency and age of acquisition of the second language',
    'https://pubmed.ncbi.nlm.nih.gov/9798741/'
  ),
  technology2022: ref(
    'Yu et Trainin',
    '2022',
    'A meta-analysis examining technology-assisted L2 vocabulary learning',
    'https://www.cambridge.org/core/journals/recall/article/metaanalysis-examining-technologyassisted-l2-vocabulary-learning/08A549A6CFD1078406E6A4F8AFE28184'
  ),
  genai2024: ref(
    'Guan, Zhang et Gu',
    '2024',
    'Examining generative AI-mediated informal digital learning of English practices',
    'https://www.cambridge.org/core/journals/recall/article/examining-generative-aimediated-informal-digital-learning-of-english-practices-with-social-cognitive-theory/F9B7ACD7BFEC6A3864463DD7F228AC27'
  ),
  chatbot2024: ref(
    'Koç et Savaş',
    '2024',
    'The use of artificially intelligent chatbots in English language learning',
    'https://www.cambridge.org/core/journals/recall/article/use-of-artificially-intelligent-chatbots-in-english-language-learning-a-systematic-metasynthesis-study-of-articles-published-between-2010-and-2024/118654390007CCA33DEAD142D45C8D4F'
  ),
  genaiReview2025: ref(
    'Bao et al.',
    '2025',
    'A systematic review of AI in second language acquisition using the expanded SAMR model',
    'https://link.springer.com/article/10.1007/s10791-025-09833-6'
  )
};

const grammarSequence = [
  ['La concession stratifiée et la contre-attente', 'accorder une part de validité à une objection sans abandonner une conclusion délimitée', 'Quoique et encore que appellent le subjonctif ; quand bien même se construit avec le conditionnel ; avoir beau introduit une concession factuelle.'],
  ['La modalisation épistémique de haute précision', 'distinguer résultat robuste, probabilité, hypothèse et simple possibilité', 'Le conditionnel, devoir, pouvoir, sembler et les adverbes de degré règlent précisément l’engagement du locuteur.'],
  ['La temporalité complexe et le futur antérieur', 'ordonner encodage, consolidation et récupération sans confondre succession et causalité', 'Le plus-que-parfait situe un événement antérieur à un repère passé ; le futur antérieur présente un accomplissement futur ou un bilan conjectural.'],
  ['La nominalisation critique et la restitution de l’agent', 'densifier un raisonnement sans effacer qui apprend, mesure ou intervient', 'La nominalisation condense une proposition ; un complément en par, de la part de ou un possessif restitue l’agent pertinent.'],
  ['Les connecteurs de cause, corrélation et conséquence', 'éviter de transformer une association statistique en mécanisme causal', 'Parce que, puisque, de sorte que, dès lors et pour autant que ne codent ni la même relation ni le même degré de certitude.'],
  ['La polyphonie et le discours rapporté complexe', 'attribuer correctement résultats, interprétations et réserves aux chercheurs', 'Selon, d’après, à en croire, le conditionnel de reprise et les incises signalent la source et la distance du rédacteur.'],
  ['Le subjonctif dans l’évaluation, la restriction et le doute', 'formuler une correction exigeante sans présenter une préférence comme un fait', 'Pour autant que, à supposer que, sans qu’il soit certain que et bien que sélectionnent le subjonctif.'],
  ['Le passif, l’agentivité et la responsabilité discursive', 'mettre le processus perceptif au premier plan tout en conservant les acteurs nécessaires', 'Le passif thématise le patient ou le résultat ; le complément d’agent réapparaît lorsque son omission fausse l’interprétation.'],
  ['Les systèmes hypothétiques complexes et l’irréel', 'raisonner sur les effets possibles de l’anxiété sans annoncer une causalité non démontrée', 'Si plus-que-parfait appelle le conditionnel passé ; si imparfait appelle le conditionnel présent ; à moins que exige le subjonctif.'],
  ['Les relatives complexes : dont, lequel et préposition + relatif', 'enchaîner des précisions sur l’âge, l’aptitude et l’expérience sans perdre l’antécédent', 'Dont remplace de plus nom ; lequel varie après une préposition ; ce à quoi et ce dont reprennent une proposition.'],
  ['Les propositions participiales et la condensation maîtrisée', 'relier plusieurs opérations cognitives en maintenant un sujet non ambigu', 'Le participe présent, le participe passé composé et la proposition absolue condensent le discours lorsque leur sujet reste identifiable.'],
  ['Le conditionnel de prudence et les tournures impersonnelles', 'évaluer les promesses de l’intelligence artificielle sans certitude excessive', 'Le conditionnel marque l’information rapportée ou l’hypothèse ; il semblerait que et il se pourrait que calibrent la prudence.']
];

const rawTopics = [
  {
    slug: 'neuroplasticite-adulte',
    title: 'Neuroplasticité et apprentissage linguistique adulte',
    readingTitle: 'Le cerveau adulte a-t-il vraiment perdu sa capacité d’apprendre ?',
    problem: 'L’idée d’un cerveau adulte presque figé alimente un fatalisme pédagogique : passé un certain âge, apprendre une langue ne serait plus qu’une compensation lente et imparfaite.',
    evidence: 'Les travaux d’imagerie racontent une histoire plus nuancée. Mechelli et ses collègues ont associé le bilinguisme à des différences de densité de matière grise modulées par la compétence et l’âge d’acquisition. Une étude de 2024 portant sur 151 participants a observé chez les bilingues une efficacité fonctionnelle globale plus élevée et des connexions particulières entre réseaux associatifs et cervelet. Ces résultats montrent une plasticité liée à l’expérience ; ils ne prouvent pas qu’une langue agit comme un médicament universel.',
    mechanism: 'Apprendre mobilise des systèmes distribués : perception auditive, mémoire déclarative, contrôle attentionnel, planification articulatoire et sélection lexicale. Au début, l’adulte s’appuie fortement sur le contrôle conscient et sur sa langue première. Avec la pratique, certaines opérations deviennent plus rapides et moins coûteuses. Une expérience combinant EEG et spectroscopie proche infrarouge a détecté des changements après un entraînement sémantique très bref, rappelant que la plasticité peut commencer avant qu’un progrès spectaculaire soit visible dans un test classique.',
    method: 'Une image cérébrale colorée n’est toutefois pas une preuve pédagogique autosuffisante. Les études transversales comparent souvent des groupes déjà constitués ; elles distinguent mal ce que l’apprentissage a produit de ce qui préexistait chez ceux qui ont choisi de devenir bilingues. Les études d’intervention réduisent cette ambiguïté, mais leurs échantillons sont fréquemment petits et leurs tâches très éloignées d’une conversation réelle. Il faut donc croiser imagerie, comportement, durée de suivi et qualité de l’exposition.',
    debate: 'La période sensible reste pertinente, surtout pour certains aspects phonologiques, mais elle ne constitue pas une date d’expiration. L’âge modifie les conditions d’apprentissage : temps disponible, sommeil, motivation, expérience scolaire et richesse du vocabulaire antérieur. Un adulte peut progresser grâce à des stratégies explicites auxquelles un enfant recourt moins. Comparer leurs trajectoires comme si elles devaient être identiques confond la possibilité d’apprendre avec la probabilité d’atteindre une prononciation indiscernable de celle d’un natif.',
    limits: 'Les bénéfices cognitifs généraux du bilinguisme font également débat. Une différence moyenne de connectivité ou de contrôle exécutif ne garantit pas un avantage chez chaque personne, et les variables sociales sont difficiles à neutraliser. Niveau d’éducation, migration, fréquence d’usage et statut des langues peuvent expliquer une partie des écarts. La conclusion solide est plus modeste : le cerveau adulte reste sensible à une expérience linguistique intensive, mais la forme et l’ampleur de la réorganisation varient.',
    practice: 'Pour l’apprenant, la conséquence n’est pas de rechercher un exercice prétendument « neuro-compatible ». Il vaut mieux organiser une pratique régulière qui combine compréhension, rappel, interaction et feedback. Les progrès doivent être suivis sur des tâches fonctionnelles — comprendre un podcast, raconter un événement, reformuler un argument — plutôt que déduits d’un discours sur les neurones. La science du cerveau soutient ici une possibilité ; la pédagogie doit encore déterminer quelles activités la réalisent pour une personne donnée.',
    conclusion: 'Le cerveau adulte n’est donc ni vierge ni fermé. Son expérience antérieure impose des habitudes, mais fournit aussi des connaissances et des stratégies. Apprendre tard demande souvent davantage d’attention délibérée et d’occasions d’usage ; cela demeure biologiquement et cognitivement possible. La formulation la plus fidèle aux données n’est pas « tout est aussi facile à tout âge », mais « aucune frontière simple ne transforme soudain l’apprentissage en impossibilité ».',
    response: 'La plasticité adulte est réelle, variable et dépendante d’une pratique linguistique soutenue ; elle ne justifie ni le fatalisme ni les promesses miraculeuses.',
    vocabulary: [['la neuroplasticité','capacité du système nerveux à se modifier avec l’expérience'],['un réseau fonctionnel','ensemble de régions dont l’activité coordonnée soutient une tâche'],['la matière grise','tissu cérébral riche en corps cellulaires neuronaux'],['une étude transversale','comparaison de groupes observés à un moment donné'],['une période sensible','phase durant laquelle certains apprentissages sont particulièrement favorisés'],['une inférence causale','conclusion selon laquelle un facteur produit un effet']],
    references: [sources.plasticity2004, sources.connectivity2024, sources.adult2021]
  },
  {
    slug: 'recuperation-espacee',
    title: 'Récupération active et répétition espacée',
    readingTitle: 'Relire ou se tester : quelle pratique construit une mémoire durable ?',
    problem: 'Relire une liste procure une impression de familiarité immédiate, alors que tenter de retrouver un mot sans le regarder paraît plus lent et plus inconfortable.',
    evidence: 'Les recherches sur l’effet de test montrent pourtant que la récupération active peut produire une rétention plus durable que la répétition passive. Dans trois expériences totalisant 533 étudiants, Rawson et ses collègues ont comparé plusieurs calendriers de rappel. Leur recommandation prudente consistait à atteindre d’abord trois rappels corrects, puis à réapprendre l’information lors de trois séances largement espacées. Le chiffre n’est pas une loi universelle, mais il illustre une idée robuste : réussir aujourd’hui ne suffit pas à garantir l’accès au mot dans plusieurs semaines.',
    mechanism: 'Récupérer une expression oblige la mémoire à reconstruire un chemin d’accès. Cette tentative fournit également une information métacognitive : ce que l’apprenant croyait savoir résiste-t-il réellement sans indice ? L’espacement ajoute une difficulté utile, car une trace légèrement affaiblie demande davantage de reconstruction. Si l’intervalle est trop court, la réponse reste simplement active ; s’il est trop long, les échecs se multiplient et le coût augmente. Le calendrier efficace dépend donc du niveau de maîtrise, du délai visé et de la complexité de l’élément.',
    method: 'Les expériences de laboratoire contrôlent précisément le nombre d’expositions et la date des tests, ce qui permet d’isoler un effet. Elles utilisent néanmoins souvent des paires de mots ou des faits courts. Or connaître un mot en langue seconde implique sa forme sonore, son orthographe, ses collocations, son registre et sa disponibilité en production. Un score de reconnaissance ne prédit pas parfaitement la capacité de l’employer dans une conversation. Une application sérieuse doit mesurer plusieurs formes de rappel et pas seulement le clic sur une bonne option.',
    debate: 'Le slogan « il suffit de faire des cartes mémoire » transforme un principe de mémorisation en méthode complète d’acquisition. Les cartes sont efficaces pour stabiliser des correspondances, mais elles ne remplacent ni l’interprétation d’un discours continu ni la négociation du sens. Inversement, l’exposition seule peut laisser des mots vaguement familiers mais difficiles à produire. La controverse utile n’oppose donc pas contexte et mémorisation : elle porte sur la manière de les articuler afin que chaque rappel renvoie à des usages authentiques.',
    limits: 'Les performances moyennes masquent des différences importantes. Un mot transparent pour un hispanophone n’impose pas la même charge qu’un idiome opaque. La similarité entre items peut créer des interférences, tandis qu’un exemple personnel favorise parfois la distinction. Le retour correctif compte également : récupérer plusieurs fois une forme erronée peut consolider l’erreur. Enfin, un algorithme d’espacement optimise ce qu’il mesure ; s’il ne demande que la traduction vers la langue première, il entraînera surtout cette direction.',
    practice: 'Une séquence équilibrée commence par rencontrer le mot dans un texte ou un audio, en inférer le sens, vérifier l’hypothèse, puis le récupérer sous plusieurs formes. On peut rappeler la définition, compléter une collocation, reconnaître la forme sonore et produire une phrase liée à sa propre vie. Les intervalles s’allongent lorsque les réponses restent correctes et se resserrent après un échec expliqué. L’objectif n’est pas de collectionner des répétitions, mais de rendre le mot disponible dans des contextes variés.',
    conclusion: 'La pratique la plus facile sur le moment n’est donc pas nécessairement celle qui fait gagner du temps à long terme. Une difficulté calibrée peut renforcer la mémoire, à condition de ne pas devenir décourageante et de recevoir un feedback fiable. Relire conserve une fonction de compréhension ; se tester révèle et consolide l’accès. Leur combinaison, distribuée sur plusieurs jours, constitue une stratégie plus défendable qu’une séance intensive à la veille d’un examen.',
    response: 'La récupération active espacée favorise une mémoire durable lorsqu’elle est contextualisée, multidirectionnelle et accompagnée d’un feedback correct.',
    vocabulary: [['la récupération active','rappel d’une information sans la revoir au préalable'],['l’espacement','distribution des révisions sur plusieurs intervalles'],['une trace mnésique','représentation laissée en mémoire par une expérience'],['la familiarité','impression de connaître sans pouvoir nécessairement rappeler'],['une interférence','perturbation produite par des informations concurrentes'],['un critère de maîtrise','niveau de réussite requis avant d’espacer davantage']],
    references: [sources.retrieval2011, sources.gloss2020, sources.technology2022]
  },
  {
    slug: 'sommeil-consolidation',
    title: 'Sommeil et consolidation du vocabulaire',
    readingTitle: 'Apprend-on une langue pendant que l’on dort ?',
    problem: 'L’expression « apprendre en dormant » promet une acquisition sans effort, mais elle mélange l’encodage de nouvelles informations et la consolidation de ce qui a déjà été étudié.',
    evidence: 'Une méta-analyse de 25 études et 1 396 participants conclut que le sommeil bénéficie globalement à l’apprentissage de mots nouveaux par rapport à une période équivalente d’éveil. L’effet moyen était modéré pour le rappel et la reconnaissance, plus faible pour l’intégration lexicale. Cela ne signifie pas qu’un enregistrement nocturne enseigne une langue à une personne endormie. Les participants avaient rencontré les mots auparavant ; le sommeil a surtout favorisé la stabilisation ou la réorganisation de traces déjà encodées.',
    mechanism: 'Les modèles de consolidation décrivent un dialogue entre hippocampe et néocortex. Au début, une nouvelle association demeure fragile et dépend fortement de systèmes de mémoire rapide. Durant le sommeil lent, certaines activations seraient rejouées ; les phases ultérieures, dont le sommeil paradoxal, pourraient participer à leur intégration dans des réseaux existants. Une expérience de réactivation ciblée a montré que le bénéfice des indices sonores variait avec la quantité de sommeil paradoxal, résultat intéressant mais trop conditionnel pour devenir une recette domestique.',
    method: 'Comparer une nuit de sommeil à une journée d’éveil pose plusieurs difficultés. L’heure d’apprentissage, la fatigue, la lumière et les activités accomplies pendant le délai peuvent différer. Les chercheurs utilisent donc des siestes, des groupes contrôles, la polysomnographie et plusieurs tests de mémoire. Même ainsi, un effet sur des pseudomots ne garantit pas une amélioration de la grammaire ou de la conversation. La consolidation est une étape de l’apprentissage, non un substitut à l’exposition, à la compréhension et à la production.',
    debate: 'Une étude préenregistrée publiée en 2025 a confirmé une meilleure rétention après une nuit qu’après une période d’éveil, mais n’a pas trouvé d’avantage clair pour l’apprentissage d’une nouvelle liste le lendemain. Ce résultat sépare deux affirmations souvent confondues : dormir peut protéger ce qui vient d’être appris sans nécessairement augmenter automatiquement la capacité d’apprendre davantage. Les analyses exploratoires suggéraient une relation, mais elles doivent être distinguées des hypothèses confirmées avant l’expérience.',
    limits: 'Les besoins de sommeil varient avec l’âge et la personne, tandis que la qualité du sommeil est difficile à réduire à une durée. Les études de laboratoire portent souvent sur une nuit ou une sieste et ne disent pas exactement comment plusieurs mois de sommeil irrégulier influencent une langue complexe. Il serait également trompeur de transformer une association moyenne en prescription médicale. Insomnie, apnée et fatigue persistante relèvent d’une évaluation de santé, pas d’une simple stratégie d’étude.',
    practice: 'Une implication raisonnable consiste à placer une courte récupération active avant le sommeil, puis à reprendre les mêmes éléments le lendemain. Cette organisation exploite la consolidation sans prétendre contrôler directement les phases cérébrales. Réduire une nuit pour prolonger une séance intensive risque d’être contre-productif : le temps supplémentaire d’exposition s’achète alors au prix d’une attention et d’une stabilisation moindres. Une routine régulière, compatible avec la santé, vaut mieux qu’un dispositif diffusant des listes durant toute la nuit.',
    conclusion: 'On n’acquiert donc pas une langue à son insu pendant le sommeil. On peut en revanche mieux conserver une partie de ce qui a été correctement encodé avant de dormir. La distinction est essentielle : la veille construit et teste les représentations ; le sommeil contribue à leur consolidation. La méthode efficace reste active, mais elle reconnaît que l’apprentissage continue biologiquement lorsque l’étude consciente s’interrompt.',
    response: 'Le sommeil consolide des mots préalablement appris, mais ne remplace ni l’encodage conscient ni la pratique linguistique.',
    vocabulary: [['la consolidation','stabilisation progressive d’une information en mémoire'],['l’encodage','transformation d’une expérience en représentation mémorisable'],['le sommeil lent','phase de sommeil caractérisée par des ondes cérébrales lentes'],['le sommeil paradoxal','phase associée notamment à des mouvements oculaires rapides'],['une réactivation ciblée','présentation d’un indice lié à un souvenir pendant le sommeil'],['une analyse préenregistrée','analyse annoncée avant l’observation des résultats']],
    references: [sources.sleep2021, sources.sleep2017, sources.sleep2025]
  },
  {
    slug: 'input-comprehensible',
    title: 'Input compréhensible et apprentissage incident',
    readingTitle: 'Comprendre beaucoup suffit-il pour apprendre à parler ?',
    problem: 'L’exposition compréhensible est indispensable : sans messages à interpréter, aucun système linguistique riche ne peut se construire. Elle n’est pourtant pas synonyme d’acquisition automatique.',
    evidence: 'Une méta-analyse publiée en 2023 a synthétisé l’apprentissage incident du vocabulaire pendant la lecture, l’écoute et le visionnage. Les apprenants acquièrent effectivement des mots sans que la mémorisation soit l’objectif déclaré, mais les gains restent partiels et dépendent du nombre de rencontres, du mode d’exposition, du test et du niveau. Comprendre l’intrigue d’une série peut donc laisser des traces lexicales ; cela ne garantit ni la maîtrise précise de chaque forme ni sa disponibilité spontanée en production.',
    mechanism: 'Pour qu’une séquence devienne apprenable, elle doit être remarquée, reliée à un sens et rencontrée dans des contextes suffisamment informatifs. La fréquence aide, mais une fréquence brute ne suffit pas : dix occurrences opaques peuvent apporter moins qu’une rencontre clairement interprétable. L’attention se distribue entre le contenu et la forme. Lorsqu’un récit exige déjà toute la capacité de compréhension, certains détails grammaticaux passent inaperçus. Les connaissances antérieures déterminent ainsi ce qui peut être extrait du même document.',
    method: 'Les chercheurs distinguent connaissance réceptive et productive, rappel et reconnaissance, gain immédiat et maintien différé. Un apprenant peut reconnaître un mot après un film sans savoir l’utiliser, ou comprendre une construction sans pouvoir l’expliquer. Les études comptent aussi les occurrences, contrôlent la difficulté et comparent lecture, écoute ou visionnage. Ces choix méthodologiques expliquent pourquoi une affirmation générale comme « regarder des séries enseigne une langue » est trop imprécise pour être évaluée scientifiquement.',
    debate: 'Certains programmes privilégient presque exclusivement l’exposition, craignant que l’analyse explicite ne rompe la communication. D’autres enseignent règles et listes au risque de produire un savoir inerte. La recherche invite à dépasser cette opposition. Un épisode, un article ou une conversation crée une nécessité de comprendre ; une brève attention à une expression aide ensuite à la discriminer ; la récupération et le réemploi testent enfin si elle est devenue disponible. Le sens organise la séquence, tandis que l’étude ciblée consolide ce que l’exposition seule laisserait fragile.',
    limits: 'Le seuil de compréhension n’est pas identique pour tous les objectifs. Un document facile favorise la fluidité et le volume d’exposition ; un document légèrement plus exigeant peut stimuler l’inférence, mais aussi saturer l’attention. Les sous-titres, images et connaissances du sujet modifient la difficulté réelle. De plus, les études utilisent des durées et des populations diverses. Une moyenne ne détermine donc pas le pourcentage exact de mots connus qu’exigerait chaque apprenant dans chaque situation.',
    practice: 'Une stratégie efficace alterne exposition extensive et exploitation intensive. Pendant une première écoute, l’apprenant poursuit le sens global sans interrompre chaque phrase. Il sélectionne ensuite quelques éléments à forte utilité, vérifie leur signification, observe leurs collocations et les réemploie. Une nouvelle exposition permet de constater si le traitement devient plus rapide. Cette boucle protège le plaisir de comprendre tout en empêchant que l’input reste un flux familier dont peu de formes sont réellement récupérables.',
    conclusion: 'Comprendre beaucoup est donc une condition puissante, mais non suffisante, pour parler avec précision. L’input alimente le système ; l’attention, le rappel, l’interaction et le feedback transforment une partie de cette matière en compétence contrôlable. La méthode la plus réaliste n’oppose pas immersion et étude : elle utilise l’immersion pour donner un sens aux formes, puis l’étude pour rendre ces formes plus accessibles lors d’un nouvel échange.',
    response: 'L’input compréhensible devient plus productif lorsqu’il est répété, remarqué et prolongé par le rappel, l’interaction et le feedback.',
    vocabulary: [['l’input compréhensible','message accessible malgré la présence de formes nouvelles'],['l’apprentissage incident','acquisition survenue sans intention principale de mémoriser'],['une connaissance réceptive','capacité de reconnaître ou comprendre une forme'],['une connaissance productive','capacité d’utiliser une forme de manière autonome'],['le repérage','fait de remarquer consciemment un élément linguistique'],['un savoir inerte','connaissance disponible en théorie mais peu mobilisable en situation']],
    references: [sources.incidental2023, sources.interaction2018, sources.gloss2020]
  },
  {
    slug: 'apprentissage-multimodal',
    title: 'Lecture, écoute et vidéo dans l’apprentissage',
    readingTitle: 'Texte, son ou image : faut-il choisir un seul canal ?',
    problem: 'Les ressources numériques combinent parole, sous-titres et images, mais multiplier les canaux peut aussi multiplier les distractions.',
    evidence: 'Une méta-analyse publiée en 2026 a rassemblé 56 expériences et 1 954 participants sur l’input audiovisuel en langue seconde. Les auteurs ont observé des progrès dans plusieurs domaines, tout en montrant que le type de vidéo comptait : les contenus pédagogiques produisaient des résultats différents des divertissements. Ce constat interdit deux raccourcis opposés. La vidéo n’est ni une solution magique parce qu’elle serait « naturelle », ni un simple loisir incapable de soutenir l’apprentissage.',
    mechanism: 'L’image peut désambiguïser une action, le son fournit les indices prosodiques et le texte stabilise une forme fugitive. Lorsque ces informations convergent, elles facilitent la construction du sens. Lorsqu’elles se concurrencent, l’apprenant peut lire les sous-titres sans traiter finement la parole ou suivre l’action sans segmenter les mots. La multimodalité ne garantit donc pas une double mémorisation. Son effet dépend de la synchronisation, de la densité, du niveau et de la tâche demandée.',
    method: 'Mesurer les bénéfices exige de préciser la comparaison : vidéo contre absence d’étude, vidéo contre audio seul, sous-titres dans la langue cible contre traduction, ou visionnage unique contre répétition. Les tests immédiats favorisent parfois la reconnaissance, tandis qu’un test différé révèle ce qui persiste. Les méta-analyses combinent ces expériences mais doivent modéliser leur hétérogénéité. Un effet moyen respectable ne signifie pas que toutes les vidéos, tous les sous-titres et tous les objectifs sont équivalents.',
    debate: 'La prise de notes illustre la tension entre activité et surcharge. Une synthèse récente indique des bénéfices, mais ceux-ci varient selon le type d’input et le contexte institutionnel. Noter peut orienter l’attention et créer une trace externe ; pendant une écoute rapide, cela peut aussi détourner des indices acoustiques. La consigne doit donc être calibrée. Relever trois idées après une première écoute n’impose pas la même charge que transcrire chaque phrase en temps réel.',
    limits: 'Les apprenants expérimentés savent souvent mieux choisir où porter leur attention. Les débutants peuvent dépendre de sous-titres traduits qui facilitent le sens mais réduisent le traitement de la langue cible. Les personnes ayant des besoins sensoriels ou attentionnels ne bénéficient pas de la même configuration. Enfin, un contenu intéressant augmente le temps volontaire d’exposition, variable rarement capturée par une séance de laboratoire. L’efficacité quotidienne résulte ainsi de l’apprentissage par minute et du nombre réel de minutes.',
    practice: 'Une séquence multimodale peut commencer par un visionnage global, se poursuivre par une écoute avec sous-titres dans la langue cible, puis revenir à un court passage sans texte. L’apprenant compare ce qu’il croyait entendre, vérifie quelques expressions et résume oralement le contenu. Les aides disparaissent progressivement, non comme une punition, mais pour tester l’autonomie. Le document reste le même tandis que la tâche change, ce qui réduit la nouveauté thématique et libère de l’attention pour la forme.',
    conclusion: 'Il n’existe donc pas de canal intrinsèquement supérieur. Le texte donne de la stabilité, le son entraîne la segmentation temporelle et l’image fournit du contexte. Leur combinaison devient efficace lorsque chaque support répond à un obstacle identifiable et qu’une étape ultérieure vérifie la compréhension sans cette aide. Choisir un média revient moins à suivre une hiérarchie qu’à concevoir une progression entre soutien, attention et autonomie.',
    response: 'La multimodalité aide lorsque texte, son et image sont coordonnés et que les aides sont progressivement retirées.',
    vocabulary: [['la multimodalité','combinaison de plusieurs modes de représentation'],['un indice prosodique','information portée par le rythme, l’accent ou l’intonation'],['la segmentation','découpage du flux sonore en unités interprétables'],['la surcharge cognitive','demande excédant momentanément les ressources attentionnelles'],['un test différé','évaluation réalisée après un délai'],['l’étayage','aide temporaire destinée à rendre une tâche accessible']],
    references: [sources.audiovisual2026, sources.notes2024, sources.gloss2020]
  },
  {
    slug: 'interaction-production',
    title: 'Interaction, production et négociation du sens',
    readingTitle: 'Pourquoi parler avant de se sentir prêt ?',
    problem: 'Beaucoup d’apprenants attendent de posséder suffisamment de grammaire et de vocabulaire avant de parler, comme si la production ne faisait qu’exposer un savoir déjà achevé.',
    evidence: 'La recherche sur l’interaction suggère au contraire que l’échange peut devenir un lieu d’apprentissage. Une demande de clarification, une reformulation ou un malentendu rend visible l’écart entre l’intention et les ressources disponibles. Les synthèses du domaine montrent que le feedback correctif porte sur la morphosyntaxe, le lexique et la phonologie et que ses effets dépendent de la cible et de la manière dont l’apprenant doit répondre. Parler ne garantit pas le progrès, mais crée des occasions diagnostiques que l’écoute seule offre moins directement.',
    mechanism: 'Produire oblige à sélectionner des mots, ordonner une phrase et surveiller son intelligibilité sous contrainte temporelle. Lorsqu’une forme manque, l’apprenant formule une périphrase, sollicite son interlocuteur ou remarque après coup une approximation. Cette tension entre message et forme peut orienter l’attention vers un besoin précis. La négociation du sens ajoute des indices : répétition plus lente, question, geste ou exemple. Le système linguistique n’est plus seulement reconnu ; il est testé contre une intention communicative et une réaction réelle.',
    method: 'Les études codent les épisodes de négociation, les types de feedback et les modifications apportées par l’apprenant. Elles évaluent ensuite si la forme ciblée réapparaît immédiatement ou dans un test ultérieur. Un échange riche n’est cependant pas facile à standardiser. La personnalité des partenaires, la difficulté de la tâche et le rapport de pouvoir influencent la participation. Les mesures de laboratoire capturent parfois une structure précise, tandis que la fluidité conversationnelle repose sur une constellation de ressources plus difficiles à isoler.',
    debate: 'Faut-il corriger pendant que la personne parle ? Une interruption fréquente peut fragmenter le message et augmenter l’autosurveillance ; l’absence totale de réaction peut laisser certaines formes stables mais inadéquates. La solution dépend de l’objectif. Dans une activité de fluidité, l’enseignant peut différer et sélectionner le feedback. Dans une tâche focalisée, une invitation à reformuler immédiatement devient pertinente. Le critère n’est pas de corriger tout ce qui s’écarte d’une norme, mais de choisir ce qui améliore l’intelligibilité ou la compétence visée.',
    limits: 'La quantité de parole n’équivaut pas à sa qualité d’apprentissage. Deux partenaires peuvent communiquer efficacement avec un répertoire limité sans pousser la précision. À l’inverse, une tâche trop exigeante peut réduire la production à des fragments anxieux. Les interlocuteurs natifs ne sont pas toujours les meilleurs partenaires et ne fournissent pas nécessairement un feedback compréhensible. Une interaction pédagogique utile exige sécurité, but partagé, possibilité de répétition et attention à la diversité légitime des usages.',
    practice: 'On peut parler tôt sans improviser dans le vide. Une préparation brève fournit quelques expressions, un modèle et un objectif concret ; la première tentative révèle les besoins ; un feedback limité prépare une seconde tentative. Comparer les deux versions rend le progrès observable. Les tâches d’écart d’information, les résumés croisés et les décisions négociées obligent à écouter autant qu’à produire. L’enjeu n’est pas la performance publique parfaite, mais une boucle où chaque échange renseigne la prochaine pratique.',
    conclusion: 'Attendre d’être prêt inverse donc une partie du processus : c’est aussi en parlant que l’on découvre ce qu’il reste à apprendre. La production ne remplace pas l’input, car on ne peut mobiliser durablement ce que l’on n’a jamais rencontré. Elle transforme cependant la compréhension en choix, puis soumet ce choix à autrui. Une méthode équilibrée fait de l’erreur non un spectacle ni une faute morale, mais une information exploitable dans une nouvelle tentative.',
    response: 'La production précoce devient formatrice lorsqu’elle est préparée, interactive, suivie d’un feedback ciblé et répétée.',
    vocabulary: [['la négociation du sens','ajustements utilisés pour résoudre un problème de compréhension'],['une demande de clarification','invitation à expliquer ou reformuler un message'],['une reformulation','nouvelle formulation qui conserve l’intention initiale'],['une périphrase','expression développée utilisée faute du mot précis'],['l’intelligibilité','degré auquel un message peut être compris'],['une tâche d’écart d’information','activité où les partenaires possèdent des informations complémentaires']],
    references: [sources.interaction2018, sources.feedback2010, sources.incidental2023]
  },
  {
    slug: 'feedback-correctif',
    title: 'Feedback correctif et traitement de l’erreur',
    readingTitle: 'Corriger davantage signifie-t-il enseigner mieux ?',
    problem: 'Une correction peut rendre une forme immédiatement visible, mais une accumulation de remarques peut aussi saturer l’attention et réduire la volonté de communiquer.',
    evidence: 'La méta-analyse de Lyster et Saito, fondée sur quinze études de classe et 827 apprenants, a trouvé des effets significatifs et durables du feedback oral. Les invitations à produire une correction obtenaient en moyenne des effets plus importants que les reformulations fournies par l’enseignant, notamment dans des tâches exigeant une réponse construite. Ce résultat ne transforme pas une technique en gagnante universelle : l’âge, la durée, la cible linguistique et la possibilité de percevoir l’erreur modifiaient les résultats.',
    mechanism: 'Une reformulation implicite conserve le rythme de la conversation, mais l’apprenant peut l’interpréter comme une simple confirmation du sens. Une correction explicite réduit cette ambiguïté, au risque d’interrompre davantage. Une invite — « Peux-tu le dire autrement ? » — engage la récupération et révèle si la forme est disponible. Pour apprendre, le feedback doit être remarqué, compris puis réutilisé. Sa valeur ne réside donc pas seulement dans la justesse de l’information, mais dans le traitement cognitif et affectif qu’il déclenche.',
    method: 'Les études distinguent uptake immédiat, réparation réussie et acquisition différée. Répéter correctement après l’enseignant peut n’être qu’une imitation momentanée ; employer la structure dans une nouvelle situation fournit une preuve plus forte. Les chercheurs doivent aussi vérifier que les groupes ont reçu une quantité comparable de pratique. Sans cette précaution, l’avantage attribué au feedback peut provenir du temps supplémentaire consacré à la forme. Les conclusions dépendent enfin de la fiabilité avec laquelle les erreurs et réactions sont codées.',
    debate: 'La norme ciblée mérite elle-même examen. Corriger une forme qui bloque le sens n’a pas le même enjeu que supprimer une variante sociale ou régionale intelligible. Un enseignement responsable distingue erreur développementale, choix de registre et diversité linguistique. À un niveau C2, le feedback peut porter sur la portée d’un modal, la cohésion ou une connotation, plutôt que sur une conformité abstraite au locuteur natif. La précision recherchée doit servir l’intention et le contexte.',
    limits: 'Le feedback automatisé ajoute une difficulté : un système peut signaler rapidement des motifs, mais manquer le but discursif ou proposer une correction erronée. Même un enseignant humain doit sélectionner. Trop d’informations simultanées empêchent l’apprenant d’établir une priorité, tandis qu’une correction sans explication peut devenir dépendance. Les préférences déclarées ne prédisent pas toujours les gains : certains souhaitent une correction exhaustive qu’ils ne peuvent réellement traiter pendant une conversation.',
    practice: 'Une procédure efficace annonce d’abord le contrat : quelle dimension sera observée et à quel moment le feedback arrivera-t-il ? Pendant la tâche, on collecte quelques exemples. Après la première tentative, l’apprenant identifie le problème, reçoit un indice gradué, reformule et réemploie la structure dans un nouveau message. Les autres erreurs sont conservées pour une séance ultérieure. Cette sélection protège la communication tout en donnant à la correction une trajectoire complète, du repérage au transfert.',
    conclusion: 'Corriger davantage ne signifie donc pas enseigner mieux. Le feedback devient apprentissage lorsqu’il cible une priorité, respecte la diversité, exige un traitement actif et vérifie le réemploi. Une correction parfaite mais oubliée vaut moins qu’un indice compris et mobilisé. L’enseignant — ou le tuteur numérique — doit ainsi agir moins comme un détecteur permanent que comme un guide capable de choisir le moment, le niveau d’explication et la prochaine occasion de pratique.',
    response: 'Le feedback est efficace lorsqu’il est sélectif, compréhensible, actif et suivi d’une occasion de transfert.',
    vocabulary: [['le feedback correctif','information indiquant qu’une production doit être révisée'],['une reformulation implicite','version corrigée fournie sans annoncer directement l’erreur'],['une invite','signal qui pousse l’apprenant à produire lui-même la correction'],['la réparation','modification réussie d’une production problématique'],['le transfert','réemploi d’un apprentissage dans une situation nouvelle'],['une erreur développementale','forme provisoire liée à la construction du système linguistique']],
    references: [sources.feedback2010, sources.interaction2018, sources.asr2023]
  },
  {
    slug: 'perception-prononciation',
    title: 'Perception auditive et prononciation',
    readingTitle: 'Faut-il rééduquer l’oreille avant la bouche ?',
    problem: 'Un son difficile à prononcer est souvent aussi difficile à percevoir comme une catégorie distincte, car la langue première organise déjà l’écoute.',
    evidence: 'Une synthèse de vingt-cinq années de recherche a examiné si l’entraînement perceptif des phonèmes d’une langue seconde améliore également leur production. Les résultats soutiennent un lien entre perception et articulation, sans les rendre identiques. Plus récemment, une méta-analyse sur la reconnaissance automatique de la parole a observé un effet global moyen sur la prononciation. Le feedback explicite semblait plus efficace que la simple transcription, et les progrès étaient plus nets pour les segments que pour le rythme ou l’intonation.',
    mechanism: 'Entendre un contraste exige de pondérer des indices acoustiques que la langue première juge parfois non pertinents. Un entraînement à haute variabilité présente plusieurs voix et contextes afin que l’apprenant construise une catégorie suffisamment abstraite. La production ajoute le contrôle moteur, le retour auditif et les sensations articulatoires. Une perception améliorée peut guider la bouche, mais savoir distinguer deux sons dans un test ne garantit pas leur réalisation stable au milieu d’une phrase rapide.',
    method: 'Les expériences utilisent des tâches d’identification, de discrimination et de production évaluée par des auditeurs ou des mesures acoustiques. Le choix du test change la conclusion. Une amélioration sur les mêmes mots et la même voix peut refléter la mémorisation du matériel ; réussir avec une nouvelle voix ou dans une phrase inédite démontre une généralisation plus convaincante. Les évaluateurs doivent également distinguer accent, intelligibilité et compréhensibilité, trois dimensions liées mais non interchangeables.',
    debate: 'Viser l’accent natif comme norme unique est scientifiquement et socialement contestable. Beaucoup d’accents restent pleinement intelligibles, tandis qu’une prosodie mal maîtrisée peut gêner davantage qu’un segment non natif. L’objectif pertinent dépend de l’usage : présenter un rapport, comprendre plusieurs locuteurs ou interagir dans un environnement multilingue. L’enseignement peut travailler les contrastes qui modifient le sens et les indices prosodiques qui structurent le discours, sans demander l’effacement de l’identité vocale.',
    limits: 'Les systèmes de reconnaissance ont été conçus à partir de données qui ne représentent pas également tous les accents. Un mot mal transcrit peut révéler un problème de prononciation, du bruit, un microphone médiocre ou une limite du modèle. Le score automatique ne doit donc pas devenir un verdict. Les méta-analyses signalent aussi que les traitements plus longs et le travail avec des pairs obtiennent parfois de meilleurs résultats, ce qui rappelle que la technologie ne remplace pas le contexte communicatif.',
    practice: 'Une progression utile commence par identifier un contraste dans plusieurs voix, puis relie l’écoute à un geste articulatoire et à des mots fréquents. L’apprenant s’enregistre, compare, reçoit un indice précis et répète dans une phrase porteuse de sens. Une seconde tâche communicative vérifie si la forme survit lorsque l’attention se déplace vers le message. Pour la prosodie, l’imitation de groupes rythmiques et l’annotation des accents peuvent compléter le travail segmental.',
    conclusion: 'L’oreille et la bouche s’éduquent donc dans une boucle plutôt que dans un ordre rigide. La perception fournit une cible, la production génère un retour, et l’interaction révèle l’intelligibilité réelle. Les outils automatiques offrent davantage d’essais, mais leur feedback doit rester interprétable et contestable. Le but n’est pas une ressemblance absolue avec une voix idéale : c’est une parole suffisamment précise, adaptable et compréhensible pour les interlocuteurs visés.',
    response: 'L’entraînement perceptif et articulatoire doit être coordonné, varié et orienté vers l’intelligibilité plutôt que vers l’effacement de l’accent.',
    vocabulary: [['un contraste phonémique','opposition sonore capable de distinguer des mots'],['un indice acoustique','propriété mesurable du signal utilisée pour reconnaître un son'],['la haute variabilité','présentation d’exemples produits par plusieurs voix et contextes'],['la généralisation','réussite avec du matériel différent de celui de l’entraînement'],['la compréhensibilité','facilité avec laquelle un auditeur traite un message'],['un trait suprasegmental','propriété portant sur le rythme, l’accent ou l’intonation']],
    references: [sources.pronunciation2017, sources.asr2023, sources.interaction2018]
  },
  {
    slug: 'anxiete-attention',
    title: 'Anxiété linguistique, attention et mémoire de travail',
    readingTitle: 'Quand la peur de l’erreur occupe la mémoire',
    problem: 'Un apprenant peut connaître une forme dans un exercice calme et ne plus y accéder lorsqu’il doit parler devant autrui.',
    evidence: 'La recherche sur l’anxiété en langue étrangère décrit un phénomène spécifique, lié à la communication, à l’évaluation et à la crainte du jugement. Une revue couvrant les travaux publiés dans la revue System entre 2004 et 2023 montre l’ampleur du champ et la diversité de ses modèles. Les associations entre anxiété et performance sont fréquentes, mais leur direction peut être réciproque : l’inquiétude gêne la tâche, tandis que des échecs répétés renforcent l’anticipation négative.',
    mechanism: 'Pendant une production rapide, la mémoire de travail maintient l’intention, sélectionne le lexique et surveille l’interlocuteur. Si une partie de cette capacité traite des pensées comme « je vais me tromper », moins de ressources restent disponibles pour le message. L’autosurveillance excessive ralentit alors l’accès à des formes pourtant connues. Une activation modérée peut cependant préparer l’action. Le problème n’est pas toute émotion, mais une charge qui détourne durablement l’attention et favorise l’évitement.',
    method: 'Les chercheurs combinent questionnaires, entretiens, journaux, performances et parfois mesures physiologiques. Un questionnaire capture une perception relativement stable, non chaque fluctuation au cours d’une tâche. Une corrélation entre anxiété élevée et note faible ne suffit pas à établir la cause, car la compétence antérieure influence les deux. Les interventions doivent donc comparer des groupes, suivre l’évolution et examiner des comportements concrets : prise de parole, persistance, demandes d’aide et qualité du message.',
    debate: 'Le conseil « sors simplement de ta zone de confort » peut devenir contre-productif s’il transforme l’exposition en épreuve incontrôlable. À l’inverse, éviter indéfiniment toute difficulté empêche la construction d’expériences de réussite. Une progression graduée maintient un défi réel tout en donnant préparation, choix et droit à une seconde tentative. La sécurité pédagogique ne signifie pas absence d’exigence ; elle signifie que l’erreur produit une information et non une humiliation.',
    limits: 'Les différences culturelles, le statut social de la langue et les expériences de discrimination modifient la situation. Une anxiété attribuée à la personnalité peut résulter d’un environnement qui ridiculise certains accents. Les stratégies individuelles ne doivent pas masquer cette responsabilité collective. Par ailleurs, une détresse intense ou persistante dépasse le rôle d’une application linguistique. Le tuteur peut adapter une tâche et encourager ; il ne doit ni diagnostiquer ni promettre de traiter un trouble clinique.',
    practice: 'Une séance peut réduire la charge en séparant les objectifs. La première tentative privilégie le sens ; le feedback porte ensuite sur un seul point ; la seconde tentative mesure une amélioration observable. Répéter avec un partenaire stable avant un groupe plus large crée une exposition graduée. Des préparations lexicales brèves, un temps de planification et des critères transparents réduisent l’incertitude. Le suivi compare surtout l’apprenant à ses performances antérieures, pas à une voix idéale.',
    conclusion: 'La facilité d’apprentissage dépend donc aussi du climat dans lequel l’effort se déroule. Une méthode cognitivement efficace sur le papier peut échouer si elle déclenche l’évitement. Inversement, le confort sans pratique exigeante produit peu de transfert. La bonne coordination consiste à calibrer la difficulté, préserver la dignité et multiplier des expériences où l’apprenant constate qu’il peut réparer un message. La confiance devient alors une conséquence documentée de l’action, non une injonction préalable.',
    response: 'Réduire l’anxiété utilement exige une difficulté graduée, un feedback limité, des secondes tentatives et un environnement sans humiliation.',
    vocabulary: [['l’anxiété langagière','inquiétude spécifiquement associée à l’apprentissage ou l’usage d’une langue'],['la mémoire de travail','système maintenant temporairement les informations nécessaires à une tâche'],['l’autosurveillance','contrôle de sa propre production pendant l’action'],['l’évitement','stratégie consistant à ne pas affronter une situation menaçante'],['une exposition graduée','progression contrôlée vers des tâches plus difficiles'],['la réciprocité causale','situation où deux facteurs peuvent s’influencer mutuellement']],
    references: [sources.anxiety2024, sources.interaction2018, sources.feedback2010]
  },
  {
    slug: 'age-differences-individuelles',
    title: 'Âge, aptitude et différences individuelles',
    readingTitle: 'Existe-t-il une méthode universelle pour tous les cerveaux ?',
    problem: 'Les conseils d’apprentissage généralisent souvent à partir d’un étudiant moyen qui n’existe pas : mêmes horaires, mêmes langues antérieures, même audition et même motivation.',
    evidence: 'Les études cérébrales et comportementales montrent que l’âge d’acquisition et la compétence atteinte contribuent tous deux à l’organisation de la langue seconde. Perani et ses collègues ont observé que, pour des langues relativement proches, un haut niveau de compétence pouvait rapprocher les patrons d’activation de ceux de la langue première, même chez des bilingues tardifs. Une étude de connectivité publiée en 2024 associe également le moment de l’exposition à certaines caractéristiques fonctionnelles, sans conclure que l’apprentissage tardif serait biologiquement fermé.',
    mechanism: 'Les différences concernent la mémoire phonologique, l’attention, la sensibilité aux régularités, les connaissances métalinguistiques et la tolérance à l’incertitude. Une personne bénéficiant d’une mémoire associative forte peut retenir rapidement des paires ; une autre apprend mieux à travers des contextes riches. La proximité entre langues facilite certains transferts et crée aussi de faux amis. Ces variables n’agissent pas isolément : une stratégie compense parfois une faiblesse, tandis que l’expérience transforme progressivement l’aptitude observée.',
    method: 'Pour démontrer qu’une méthode convient mieux à un profil, il ne suffit pas de constater que les meilleurs apprenants la préfèrent. Il faut tester une interaction : la différence entre deux méthodes change-t-elle réellement selon une caractéristique mesurée avant l’entraînement ? Ces études demandent de grands échantillons et des mesures fiables. Beaucoup de promesses de personnalisation reposent sur des catégories intuitives — notamment les « styles d’apprentissage » — sans preuve qu’assigner un média préféré améliore les résultats.',
    debate: 'L’âge est souvent présenté comme cause unique, alors qu’il réorganise tout un environnement. Un enfant reçoit des milliers d’heures d’interaction, peut jouer sans enjeu professionnel et développe encore sa langue première. Un adulte dispose de moins de temps, mais sait lire, comparer des règles et fixer des objectifs. Les différences de prononciation moyenne sont réelles ; elles ne prédisent ni le parcours d’un individu ni sa capacité à devenir un communicateur hautement compétent.',
    limits: 'Personnaliser comporte un risque de figer. Dire à quelqu’un qu’il possède un « cerveau visuel » ou une faible aptitude peut réduire l’exploration et transformer une mesure provisoire en identité. Les adaptations doivent rester hypothèses testables. Elles sont utiles si elles modifient une tâche, produisent un résultat observable et peuvent être révisées. Elles deviennent problématiques lorsqu’elles enferment l’apprenant dans un parcours simplifié dont on ne vérifie jamais l’effet.',
    practice: 'Une personnalisation sobre commence par les performances : quels mots sont oubliés, quels sons sont confondus, dans quelles tâches la compréhension s’effondre-t-elle ? On ajuste ensuite la quantité d’aide, l’intervalle, le débit ou le type de feedback, puis on mesure la tentative suivante. Deux apprenants peuvent partager le même objectif tout en suivant des doses différentes. Les principes généraux — exposition, rappel, interaction — restent communs ; leur combinaison et leur rythme deviennent individuels.',
    conclusion: 'Il n’existe donc pas une méthode universellement la plus facile. Il existe des mécanismes relativement généraux et des contraintes personnelles, sociales et linguistiques. Une pédagogie scientifique ne choisit ni l’uniformité ni l’étiquetage définitif : elle formule une adaptation, observe ses effets et la révise. Le meilleur parcours n’est pas celui qui correspond à une identité supposée, mais celui qui produit un progrès durable dans les tâches que la personne souhaite accomplir.',
    response: 'Les principes d’apprentissage sont partageables, mais leur dosage doit être adapté à partir de performances observées plutôt que d’étiquettes fixes.',
    vocabulary: [['une différence individuelle','caractéristique par laquelle les apprenants varient'],['l’aptitude linguistique','ensemble de capacités associées à la facilité d’apprentissage d’une langue'],['le transfert interlinguistique','influence d’une langue connue sur une nouvelle langue'],['une interaction statistique','variation de l’effet d’une méthode selon un autre facteur'],['un style d’apprentissage','préférence déclarée souvent confondue avec une prescription efficace'],['une adaptation révisable','modification conservée seulement si ses effets sont confirmés']],
    references: [sources.age1998, sources.connectivity2024, sources.adult2021]
  },
  {
    slug: 'lexique-contextuel',
    title: 'Apprentissage lexical, gloses et contexte',
    readingTitle: 'Traduire un mot empêche-t-il vraiment de le maîtriser ?',
    problem: 'Certains discours opposent la traduction, supposée superficielle, au contexte, supposé naturel et toujours suffisant.',
    evidence: 'Une méta-régression portant sur 42 études et 3 802 participants a montré que la lecture accompagnée de gloses produisait davantage d’apprentissage lexical que la lecture sans aide, immédiatement et après un délai. Les gloses en langue première obtenaient même des gains supérieurs aux gloses en langue seconde dans cet ensemble de données. Cela ne prouve pas qu’une traduction épuise le sens d’un mot ; cela montre qu’un accès rapide à une signification peut libérer des ressources pour la compréhension et créer une première association mémorisable.',
    mechanism: 'Un mot comprend plusieurs dimensions : forme écrite et sonore, sens, collocations, contraintes grammaticales, registre et connotations. Une traduction fournit parfois un point d’entrée économique, surtout lorsque le contexte reste ambigu. Les rencontres ultérieures enrichissent cette représentation. Le danger ne vient donc pas de la traduction elle-même, mais de l’arrêt prématuré : connaître une équivalence ne garantit pas que l’on reconnaîtra le mot dans la parole ni que l’on choisira sa collocation correcte.',
    method: 'Les études de gloses varient par format — définition, choix multiple, image, son —, position et langue. Elles utilisent aussi des tests de reconnaissance ou de rappel, qui ne mesurent pas la même profondeur. La méta-régression cherche quels paramètres expliquent les écarts entre résultats, mais une association entre format et gain peut dépendre des populations qui l’ont utilisé. Les pourcentages moyens décrivent un corpus d’études ; ils ne prédisent pas exactement le nombre de mots retenus par chaque lecteur.',
    debate: 'Les outils de traduction instantanée rendent l’aide presque gratuite, mais peuvent fragmenter la lecture si chaque sélection interrompt le sens. Interdire l’outil pousse parfois l’apprenant à deviner incorrectement ou à abandonner. Une règle plus utile limite la sélection aux mots importants pour le message ou susceptibles d’être réemployés. Après la consultation, une phrase, une collocation et un rappel différé transforment l’aide ponctuelle en apprentissage. Le traducteur devient alors une étape, non la destination.',
    limits: 'Une glose peut simplifier excessivement un terme polysémique ou ignorer le registre. Les traductions automatiques héritent du contexte fourni et peuvent proposer une équivalence grammaticalement plausible mais pragmatiquement inadéquate. Les mots culturellement chargés résistent particulièrement à une correspondance unique. L’apprenant doit pouvoir ouvrir une définition plus riche, écouter la forme et consulter le tuteur lorsque le passage exige une distinction conceptuelle, sans croire que toute sortie automatique possède la même autorité.',
    practice: 'Dans un reading, sélectionner une expression devrait afficher une traduction brève, une définition contextualisée, un exemple et l’audio. L’apprenant décide ensuite de l’enregistrer. Le système peut proposer un rappel dans les deux directions et, plus tard, demander de choisir la collocation dans un nouveau passage. Les données enregistrées doivent alimenter le Vocabulary de la leçon afin que la consultation spontanée rejoigne une progression organisée plutôt que de rester une suite de recherches oubliées.',
    conclusion: 'Traduire n’empêche donc pas de maîtriser un mot ; réduire le mot à sa traduction, oui. Le contexte fournit les usages, la glose résout une incertitude et la récupération construit l’accès durable. La solution la plus facile à court terme — cliquer puis continuer — devient pédagogiquement utile si le système invite à revenir, distinguer et produire. L’opposition entre traduction et immersion disparaît au profit d’une chaîne où chaque outil remplit une fonction limitée.',
    response: 'Une traduction brève facilite l’accès initial lorsqu’elle est suivie d’exemples, de collocations, de rappels et de nouveaux contextes.',
    vocabulary: [['une glose','aide brève associée à un mot ou passage'],['la polysémie','présence de plusieurs sens liés pour une même forme'],['une collocation','association habituelle de mots'],['une équivalence','forme proposée comme correspondance dans une autre langue'],['la profondeur lexicale','richesse des connaissances disponibles sur un mot'],['une méta-régression','analyse expliquant la variation des effets entre plusieurs études']],
    references: [sources.gloss2020, sources.technology2022, sources.incidental2023]
  },
  {
    slug: 'intelligence-artificielle-tutorat',
    title: 'Intelligence artificielle et tutorat linguistique',
    readingTitle: 'Un tuteur artificiel peut-il personnaliser sans inventer ?',
    problem: 'L’intelligence artificielle générative peut converser à toute heure et produire un feedback immédiat, mais la fluidité de sa réponse masque parfois son incertitude.',
    evidence: 'Une étude mixte de dix semaines menée auprès de 47 étudiants a associé des pratiques informelles médiées par l’IA générative à une amélioration de l’oral, tout en constatant que le partenaire conversationnel ne suffisait pas à maintenir durablement ces pratiques hors classe. Une revue de 281 études publiées entre 2015 et 2024 conclut que l’IA améliore souvent des tâches existantes, mais que seules 35 % des études atteignaient les niveaux de modification ou redéfinition du modèle utilisé par les auteurs. Possibilité technique et transformation pédagogique ne coïncident donc pas.',
    mechanism: 'Un modèle de langue prédit une suite plausible à partir de régularités apprises ; il ne consulte pas spontanément un dossier pédagogique vérifié ni ne connaît l’élève comme une personne. Bien configuré, il peut reformuler une explication, générer un exemple contrastif et adapter le degré d’aide. Sans contexte, il risque d’expliquer la mauvaise structure ou de produire une règle trop générale. La personnalisation exige ainsi des données fiables sur la leçon, le niveau, les erreurs précédentes et l’objectif immédiat.',
    method: 'Les études récentes utilisent souvent de petits échantillons, des interventions courtes et des étudiants déjà à l’aise avec la technologie. L’effet de nouveauté et le temps supplémentaire de pratique peuvent expliquer une partie des gains. Il faut comparer l’IA à un accompagnement crédible, évaluer des tâches indépendantes et mesurer la persistance. Les versions de modèles changent rapidement, ce qui complique la réplication : un résultat obtenu avec une configuration précise ne décrit pas automatiquement tous les assistants futurs.',
    debate: 'Le tuteur doit-il donner la réponse ou guider ? Pour une question factuelle simple, une correction directe peut être économique. Pour comprendre une structure, l’explication doit diagnostiquer le raisonnement, fournir des exemples gradués, demander à l’élève de reformuler puis vérifier une nouvelle application. Une conversation agréable ne suffit pas. Le système doit savoir ralentir, reconnaître l’incertitude, citer une source lorsqu’il avance un fait scientifique et transmettre à un humain les situations qu’il ne peut traiter de façon fiable.',
    limits: 'Les risques comprennent l’hallucination, les biais linguistiques, la standardisation des variétés et la collecte de données. Une IA peut présenter comme erreur une forme légitime ou privilégier les normes dominantes de son corpus. La voix synthétique ajoute une apparence humaine sans garantir l’exactitude. Les protections doivent inclure limitation des données, transparence, possibilité de contester le feedback et séparation claire entre aide pédagogique et conseil médical ou psychologique.',
    practice: 'Dans Andergo, le tuteur devrait recevoir la leçon active, la structure ciblée et les exemples validés. Lorsqu’un élève sélectionne une phrase, il explique comme un enseignant : observation, règle, contraste, exemple, question de contrôle et nouvelle tentative. Il peut proposer un exercice supplémentaire, mais ne modifie pas silencieusement le parcours ni le score. Les réponses scientifiques affichent leurs références ; les affirmations incertaines sont signalées. La personnalisation reste ainsi traçable et liée au curriculum.',
    conclusion: 'L’IA ne constitue ni un professeur autonome ni un simple gadget. Elle peut augmenter la fréquence du dialogue, réduire le délai du feedback et rendre une explication plus accessible. Sa valeur dépend toutefois d’un cadre pédagogique, de sources, de limites explicites et d’une vérification humaine possible. Le meilleur tuteur artificiel n’est pas celui qui paraît tout savoir, mais celui qui organise une prochaine action d’apprentissage tout en indiquant honnêtement ce qu’il ignore.',
    response: 'Un tuteur IA devient pédagogiquement fiable lorsqu’il est ancré dans la leçon, guidant plutôt que devinant, transparent sur ses limites et vérifiable.',
    vocabulary: [['un modèle génératif','système produisant du contenu à partir de régularités apprises'],['une hallucination','information plausible mais non fondée produite par un modèle'],['l’ancrage contextuel','fourniture de données validées pour guider une réponse'],['la traçabilité','possibilité de reconstituer l’origine et les étapes d’une réponse'],['un effet de nouveauté','amélioration temporaire liée à l’intérêt pour un outil nouveau'],['une supervision humaine','possibilité qu’une personne contrôle ou corrige le système']],
    references: [sources.genai2024, sources.chatbot2024, sources.genaiReview2025]
  }
];

function articleParts(topic) {
  const paragraphs = [
    `${topic.readingTitle} pose une question centrale pour la science contemporaine de l’apprentissage. ${topic.problem} Une réponse sérieuse doit distinguer ce que les données montrent, le mécanisme proposé pour l’expliquer et la recommandation pédagogique que l’on souhaite en tirer. Ces trois niveaux se soutiennent, mais ils ne sont pas interchangeables : une observation cérébrale ne prescrit pas directement une méthode, et une activité appréciée ne prouve pas à elle seule un apprentissage durable.`,
    topic.evidence,
    topic.mechanism,
    topic.method,
    topic.debate,
    topic.limits,
    topic.practice,
    `${topic.conclusion} En définitive, ${topic.response.toLowerCase()} Cette conclusion reste révisable : elle vaut dans les limites des populations, des tâches et des mesures étudiées. Pour le lecteur C2, l’enjeu consiste précisément à conserver ensemble la force d’un résultat et les conditions qui en bornent la portée, sans réduire l’incertitude à l’ignorance ni transformer une moyenne en destin individuel.`
  ];
  return Array.from({ length: 4 }, (_, index) =>
    paragraphs.slice(index * 2, index * 2 + 2).join('\n\n')
  );
}

function readingQuestions(topic) {
  const correct = [
    topic.response,
    'Elle distingue les résultats, les mécanismes proposés et les recommandations pédagogiques.',
    'Parce qu’un résultat moyen ne détermine pas le parcours de chaque apprenant.',
    'Il faut examiner la population, la tâche, la comparaison et le délai du test.',
    topic.practice,
    'Une association ou une image cérébrale ne suffit pas à démontrer une prescription causale.',
    topic.limits,
    'Elle doit produire un apprentissage transférable au-delà de l’exercice immédiat.',
    'Les aides sont utiles lorsqu’elles répondent à un obstacle identifiable et restent révisables.',
    'La conclusion est argumentée mais limitée par les conditions des études disponibles.'
  ];
  const distractors = [
    ['La méthode la plus récente est nécessairement la meilleure.', 'Toute différence entre apprenants est négligeable.', 'Une seule étude suffit pour établir une règle universelle.'],
    ['Les mécanismes cérébraux remplacent les observations comportementales.', 'La motivation permet d’ignorer toute méthode.', 'Les recommandations ne nécessitent aucune donnée.'],
    ['Chaque participant réagit exactement comme la moyenne.', 'Les résultats de groupe décrivent une obligation individuelle.', 'La variation invalide automatiquement toute recherche.'],
    ['Seul le titre de l’article doit être vérifié.', 'La popularité de la méthode constitue le meilleur contrôle.', 'Un résultat immédiat permet d’ignorer la rétention.'],
    ['Il faut supprimer toute difficulté de la tâche.', 'Il suffit d’augmenter le nombre de clics.', 'L’apprenant ne doit jamais réutiliser la forme.'],
    ['La corrélation prouve toujours le mécanisme.', 'Toute activité du cerveau constitue une recommandation.', 'Une explication plausible vaut démonstration.'],
    ['Aucune limite méthodologique n’est pertinente.', 'Les outils mesurent toujours exactement la compétence.', 'Le contexte social n’influence jamais l’apprentissage.'],
    ['La réussite sur le même exercice suffit.', 'Le transfert ne peut pas être évalué.', 'La compétence se réduit au temps passé.'],
    ['Une adaptation doit devenir définitive.', 'Toutes les aides doivent rester visibles.', 'La personnalisation repose sur une étiquette fixe.'],
    ['Elle affirme une certitude indépendante des données.', 'Elle refuse toute implication pratique.', 'Elle confond prudence et absence de conclusion.']
  ];
  return correct.map((answerText, index) => ({
    prompt: [
      `Quelle thèse résume le mieux « ${topic.readingTitle} » ?`,
      'Quelle distinction structure l’analyse scientifique proposée ?',
      'Pourquoi l’article refuse-t-il de transformer une moyenne en destin individuel ?',
      'Quels éléments faut-il examiner avant de généraliser un résultat ?',
      'Quelle application pratique respecte le mieux les données présentées ?',
      'Quelle erreur de raisonnement l’article cherche-t-il à éviter ?',
      'Quelle limite doit rester visible dans l’interprétation ?',
      'Quel critère renforce la valeur pédagogique d’une activité ?',
      'Comment l’article conçoit-il une aide ou une adaptation responsable ?',
      'Quel statut l’article donne-t-il à sa conclusion ?'
    ][index],
    correct: answerText,
    distractors: distractors[index]
  }));
}

module.exports = rawTopics.map((topic, index) => {
  const [grammar, purpose, rule] = grammarSequence[index];
  return {
    ...topic,
    grammar,
    purpose,
    rule,
    parts: articleParts(topic),
    questions: readingQuestions(topic)
  };
});
