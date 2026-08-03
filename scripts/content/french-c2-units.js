// Français C2 — 12 unités d'immersion complète, limitées à Reading,
// Vocabulary et Grammar. Le parcours transpose en français les descripteurs
// du CECR C2 : inférer l'implicite, maîtriser les connotations et garder un
// contrôle grammatical constant dans un discours conceptuellement dense.

const DEFAULTS = {
  reading: { duration: 28, xp: 55 },
  vocabulary: { duration: 18, xp: 40 },
  grammar: { duration: 24, xp: 50 }
};

const activity = (skill, fields) => ({ skill, ...DEFAULTS[skill], ...fields });
const mcq = (prompt, options, answer, explanation = '') => ({
  type: 'mcq',
  prompt,
  options,
  answer,
  explanation
});

const sharedVocabulary = [
  ['circonscrire', 'délimiter précisément la portée d’une notion ou d’un problème'],
  ['un faisceau d’indices', 'un ensemble convergent d’éléments qui soutiennent une interprétation'],
  ['sous-tendre', 'constituer le fondement implicite d’un raisonnement'],
  ['une inférence', 'une conclusion tirée de faits qui ne l’énoncent pas directement'],
  ['une réserve', 'une restriction qui limite la portée d’une affirmation'],
  ['à rebours de', 'dans une direction opposée à une idée ou à une tendance dominante']
];

const legacyTopics = [
  {
    slug: 'fragmentation-epistemique',
    title: 'Savoirs, expertise et fragmentation épistémique',
    readingTitle: 'Quand les preuves ne parlent pas d’une seule voix',
    problem: 'La multiplication des sources rend l’information plus accessible, mais elle disperse aussi les critères selon lesquels une affirmation est reconnue comme fiable.',
    tension: 'L’expertise protège la rigueur méthodologique ; elle peut pourtant devenir opaque lorsque ses procédures ne sont ni expliquées ni contestables.',
    response: 'Une démocratie du savoir exige donc des institutions capables de rendre visibles leurs méthodes, leurs incertitudes et les conditions de révision de leurs conclusions.',
    grammar: 'La concession stratifiée et la contre-attente',
    purpose: 'accorder une part de validité à une objection sans renoncer à une thèse précisément délimitée',
    rule: 'Quoique + subjonctif, encore que + subjonctif, quand bien même + conditionnel et avoir beau + infinitif permettent de hiérarchiser plusieurs niveaux de concession.',
    vocabulary: [
      ['une autorité épistémique', 'une autorité reconnue dans la production ou la validation des connaissances'],
      ['la réfutabilité', 'la possibilité qu’une affirmation soit mise à l’épreuve et éventuellement invalidée'],
      ['un biais de sélection', 'une distorsion causée par la manière dont les données ont été choisies'],
      ['une controverse instruite', 'un désaccord fondé sur des arguments et des preuves examinables'],
      ['la robustesse', 'la capacité d’un résultat à résister à plusieurs méthodes de vérification'],
      ['un consensus provisoire', 'un accord scientifique susceptible d’être révisé par de nouvelles preuves']
    ]
  },
  {
    slug: 'intelligence-artificielle-decision',
    title: 'Intelligence artificielle et décision publique',
    readingTitle: 'Déléguer un calcul, déléguer un jugement ?',
    problem: 'Les administrations utilisent des systèmes prédictifs pour distribuer des ressources, détecter des risques et hiérarchiser des dossiers.',
    tension: 'L’automatisation peut réduire certaines incohérences humaines ; elle peut aussi transformer des inégalités historiques en paramètres apparemment neutres.',
    response: 'La légitimité d’un système automatisé dépend moins de sa seule performance que de la possibilité d’expliquer, contester et corriger ses décisions.',
    grammar: 'La modalisation épistémique de haute précision',
    purpose: 'distinguer nécessité logique, probabilité empirique, hypothèse et simple possibilité',
    rule: 'Les verbes modaux, le conditionnel, les adverbes de degré et des tournures comme il se pourrait que règlent exactement le niveau d’engagement du locuteur.',
    vocabulary: [
      ['l’explicabilité', 'la capacité de rendre compréhensible le fonctionnement d’une décision automatisée'],
      ['un effet de seuil', 'une rupture produite lorsqu’une valeur franchit une limite prédéfinie'],
      ['l’opacité algorithmique', 'l’impossibilité pratique de comprendre comment un système produit son résultat'],
      ['un recours effectif', 'une procédure réelle permettant de contester une décision'],
      ['la traçabilité', 'la possibilité de reconstituer les données et étapes d’une décision'],
      ['un proxy', 'une variable utilisée indirectement pour représenter une réalité difficile à mesurer']
    ]
  },
  {
    slug: 'justice-climatique',
    title: 'Justice climatique et responsabilités différenciées',
    readingTitle: 'Qui doit répondre d’un dommage sans frontière ?',
    problem: 'Le changement climatique résulte d’émissions cumulées, tandis que ses effets frappent de manière très inégale des populations qui y ont peu contribué.',
    tension: 'Une politique globale doit être assez commune pour agir à grande échelle, mais assez différenciée pour tenir compte des responsabilités et capacités historiques.',
    response: 'Une transition durable doit articuler efficacité écologique, redistribution, participation locale et mécanismes de réparation.',
    grammar: 'La nominalisation critique et la restitution de l’agent',
    purpose: 'densifier un raisonnement sans dissimuler qui agit, décide ou supporte les conséquences',
    rule: 'La nominalisation condense une proposition ; l’ajout de par, de la part de ou d’un complément possessif restitue l’agent lorsque sa responsabilité est pertinente.',
    vocabulary: [
      ['une dette climatique', 'une responsabilité liée aux émissions historiques et à leurs conséquences'],
      ['une perte irréversible', 'un dommage qui ne peut être compensé ni restauré'],
      ['la vulnérabilité structurelle', 'une exposition au risque produite par l’organisation sociale et économique'],
      ['un coût d’adaptation', 'une dépense nécessaire pour réduire les effets d’un changement climatique'],
      ['la sobriété', 'une réduction organisée de la consommation de ressources'],
      ['une responsabilité différenciée', 'une obligation modulée selon la contribution au problème et les capacités d’action']
    ]
  },
  {
    slug: 'bioethique-consentement',
    title: 'Bioéthique, consentement et innovation',
    readingTitle: 'Peut-on consentir à ce que l’on ne peut prévoir ?',
    problem: 'Les thérapies génétiques et les données biomédicales ouvrent des possibilités dont les conséquences individuelles et collectives restent partiellement inconnues.',
    tension: 'Le consentement protège l’autonomie personnelle ; il ne suffit pas toujours lorsque les effets concernent des descendants, des proches ou des groupes entiers.',
    response: 'Une innovation responsable combine consentement continu, suivi indépendant, partage des bénéfices et droit réel de retrait.',
    grammar: 'Le subjonctif dans l’évaluation, la restriction et le doute',
    purpose: 'présenter une appréciation complexe sans confondre fait établi, souhait, crainte et éventualité',
    rule: 'Le subjonctif suit les jugements, restrictions et doutes : pour autant que, à supposer que, sans qu’il soit certain que, quoiqu’il puisse sembler.',
    vocabulary: [
      ['un consentement éclairé', 'un accord donné après compréhension des risques, bénéfices et alternatives'],
      ['la réversibilité', 'la possibilité d’annuler une intervention ou ses effets'],
      ['un conflit d’intérêts', 'une situation où un intérêt secondaire peut influencer un jugement'],
      ['la portée intergénérationnelle', 'l’ensemble des effets susceptibles de toucher les générations futures'],
      ['un protocole', 'un ensemble formalisé de règles pour conduire une recherche ou un soin'],
      ['la vigilance éthique', 'l’examen continu des conséquences morales d’une pratique']
    ]
  },
  {
    slug: 'democratie-desinformation',
    title: 'Démocratie, désinformation et espace public',
    readingTitle: 'Corriger le faux sans administrer le vrai',
    problem: 'Les campagnes de désinformation exploitent la vitesse des plateformes, les émotions collectives et la difficulté de vérifier des contenus en temps réel.',
    tension: 'La modération protège la délibération publique ; elle peut cependant concentrer un pouvoir considérable entre les mains d’acteurs privés ou gouvernementaux.',
    response: 'La résilience démocratique repose sur la transparence des règles, le pluralisme, l’éducation aux médias et des voies de recours indépendantes.',
    grammar: 'La polyphonie et le discours rapporté complexe',
    purpose: 'faire coexister plusieurs voix tout en signalant la distance, l’adhésion ou la contestation du narrateur',
    rule: 'Le conditionnel de reprise, selon, d’après, à en croire, prétendre que et les incises permettent d’attribuer précisément une parole et d’en marquer le statut.',
    vocabulary: [
      ['une chambre d’écho', 'un environnement où des opinions semblables se renforcent mutuellement'],
      ['la viralité', 'la diffusion rapide et massive d’un contenu'],
      ['une manipulation coordonnée', 'une action organisée pour influencer artificiellement le débat'],
      ['la modération', 'l’application de règles à des contenus publiés'],
      ['un démenti', 'une déclaration qui conteste formellement une information'],
      ['la délibération', 'un examen collectif d’arguments avant une décision']
    ]
  },
  {
    slug: 'restitution-patrimoine',
    title: 'Restitution, patrimoine et mémoire coloniale',
    readingTitle: 'À qui appartient ce qui fut arraché ?',
    problem: 'De nombreuses collections publiques conservent des objets acquis dans des contextes de conquête, de contrainte ou d’inégalité juridique.',
    tension: 'Les musées invoquent la conservation et l’accès universel ; les demandes de restitution rappellent que la propriété ne peut être séparée des conditions d’acquisition.',
    response: 'Une politique juste combine recherche de provenance, dialogue avec les communautés, restitution lorsque celle-ci est fondée et nouvelles formes de circulation.',
    grammar: 'La mise en relief, la dislocation et la focalisation',
    purpose: 'déplacer le centre informatif d’une phrase afin de corriger une présupposition ou lever une ambiguïté',
    rule: 'C’est… qui/que/dont, ce qui… c’est, quant à, la dislocation à gauche ou à droite et les pseudo-clivées organisent la focalisation.',
    vocabulary: [
      ['la provenance', 'l’histoire documentée de la possession et du déplacement d’un objet'],
      ['une spoliation', 'la dépossession illégitime ou violente d’un bien'],
      ['l’inaliénabilité', 'le principe selon lequel un bien public ne peut être cédé'],
      ['un dépositaire', 'une personne ou institution chargée de garder un bien sans en être nécessairement propriétaire'],
      ['une réparation symbolique', 'un acte qui reconnaît un tort sans en compenser entièrement les effets'],
      ['la patrimonialisation', 'le processus par lequel un objet devient patrimoine collectif']
    ]
  },
  {
    slug: 'traduction-multilinguisme',
    title: 'Traduction, multilinguisme et visions du monde',
    readingTitle: 'Traduire sans réduire l’intraduisible',
    problem: 'Toute traduction doit choisir entre plusieurs fidélités : sens référentiel, rythme, registre, implicite culturel et effet produit sur le lecteur.',
    tension: 'Une traduction très fluide facilite l’accès ; elle risque aussi d’effacer l’étrangeté par laquelle le texte transforme la langue d’arrivée.',
    response: 'Le traducteur rend ses choix responsables en identifiant les pertes, en préservant certaines opacités et en adaptant sa stratégie au projet du texte.',
    grammar: 'Les connecteurs argumentatifs et la progression logique',
    purpose: 'rendre explicites des relations de cause, concession, reformulation, restriction et conséquence sans alourdir le discours',
    rule: 'De surcroît, néanmoins, en revanche, pour autant, autrement dit, partant et dès lors ont des portées distinctes et ne sont pas interchangeables.',
    vocabulary: [
      ['l’intraduisible', 'ce qui résiste à une équivalence complète entre deux langues'],
      ['une compensation', 'un procédé qui recrée ailleurs un effet perdu dans la traduction'],
      ['l’étrangeté', 'la qualité de ce qui conserve une différence perceptible'],
      ['une équivalence fonctionnelle', 'une solution qui produit une fonction comparable sans reproduire la même forme'],
      ['un implicite culturel', 'une information comprise dans une culture sans être explicitement formulée'],
      ['la domestication', 'une stratégie qui rapproche fortement le texte des normes de la langue d’arrivée']
    ]
  },
  {
    slug: 'travail-automatisation',
    title: 'Travail, automatisation et valeur sociale',
    readingTitle: 'Ce que la machine remplace — et ce qu’elle révèle',
    problem: 'L’automatisation transforme non seulement les emplois, mais aussi la manière dont une société attribue valeur, statut et sécurité aux activités humaines.',
    tension: 'Les gains de productivité peuvent libérer du temps ; sans redistribution, ils peuvent surtout déplacer les risques vers les travailleurs les moins protégés.',
    response: 'Une politique du travail cohérente associe formation, droits transférables, négociation collective et partage des gains de productivité.',
    grammar: 'Les systèmes hypothétiques complexes et l’irréel',
    purpose: 'raisonner sur des scénarios passés, présents et futurs en distinguant leurs conditions et leurs conséquences',
    rule: 'Si + plus-que-parfait appelle le conditionnel passé ; si + imparfait appelle le conditionnel présent ; à moins que et pour peu que exigent le subjonctif.',
    vocabulary: [
      ['une polarisation de l’emploi', 'une concentration des emplois aux deux extrêmes de qualification et de salaire'],
      ['la transférabilité des droits', 'la conservation de protections lors d’un changement d’emploi'],
      ['un gain de productivité', 'une augmentation de la production obtenue avec les mêmes ressources'],
      ['la déqualification', 'la perte de compétences reconnues ou requises dans un métier'],
      ['une externalisation', 'le transfert d’une activité ou d’un risque vers un acteur extérieur'],
      ['le pouvoir de négociation', 'la capacité d’influencer les conditions d’un accord']
    ]
  },
  {
    slug: 'memoire-archives',
    title: 'Mémoire collective, archives et silences',
    readingTitle: 'L’archive ne dit pas tout, mais son silence parle',
    problem: 'Les archives rendent le passé accessible à travers des documents produits, sélectionnés et conservés par des institutions situées.',
    tension: 'La preuve documentaire limite l’invention ; elle peut également reproduire l’absence de celles et ceux qui n’avaient pas accès à l’écriture ou au pouvoir.',
    response: 'Une histoire critique confronte les sources, analyse leurs conditions de production et distingue clairement ce qui est attesté, inféré ou encore inconnu.',
    grammar: 'Le passif, l’agentivité et la responsabilité discursive',
    purpose: 'choisir consciemment de mettre au premier plan un processus, un résultat ou l’acteur qui en répond',
    rule: 'Le passif est pertinent lorsque le patient ou le résultat est thématique ; le complément d’agent doit réapparaître dès que son omission fausse l’attribution des responsabilités.',
    vocabulary: [
      ['une lacune documentaire', 'une absence significative dans un ensemble d’archives'],
      ['la critique des sources', 'l’examen de l’origine, du contexte et de la fiabilité d’un document'],
      ['une mémoire officielle', 'un récit du passé reconnu et promu par une institution'],
      ['un témoignage situé', 'un récit lié à la position et aux conditions de son auteur'],
      ['l’effacement', 'la disparition active ou passive d’une personne ou d’un fait du récit'],
      ['une corroboration', 'une confirmation obtenue par une source indépendante']
    ]
  },
  {
    slug: 'science-incertitude',
    title: 'Science, incertitude et décision',
    readingTitle: 'Agir avant de tout savoir',
    problem: 'Les décideurs doivent souvent agir lorsque les mécanismes sont partiellement compris et que les conséquences d’une erreur sont asymétriques.',
    tension: 'Attendre davantage de preuves peut éviter une intervention inutile ; l’attente peut aussi rendre certains dommages irréversibles.',
    response: 'Une décision robuste formule ses hypothèses, compare plusieurs scénarios, prévoit des seuils de révision et maintient un suivi public.',
    grammar: 'Les propositions participiales et la condensation maîtrisée',
    purpose: 'relier plusieurs informations sans multiplier les propositions, tout en conservant un sujet et une relation logique non ambigus',
    rule: 'Le participe présent, le participe passé composé et la proposition absolue condensent le discours à condition que leur sujet et leur valeur logique soient identifiables.',
    vocabulary: [
      ['une incertitude irréductible', 'une incertitude qui ne disparaît pas avec davantage de données'],
      ['un scénario contrefactuel', 'une représentation de ce qui se serait produit sous d’autres conditions'],
      ['le principe de précaution', 'un principe autorisant une action préventive face à un risque grave incertain'],
      ['un seuil de révision', 'un niveau de preuve qui déclenche la modification d’une décision'],
      ['la sensibilité d’un modèle', 'la variation des résultats lorsque ses hypothèses changent'],
      ['une décision robuste', 'une décision acceptable dans plusieurs futurs plausibles']
    ]
  },
  {
    slug: 'droits-nature',
    title: 'Droits de la nature et personnalité juridique',
    readingTitle: 'Un fleuve peut-il avoir qualité pour agir ?',
    problem: 'Certains systèmes juridiques reconnaissent des droits à des fleuves, forêts ou écosystèmes afin de mieux représenter leurs intérêts.',
    tension: 'La personnalité juridique peut créer de nouveaux recours ; elle risque de rester symbolique si les représentants, ressources et obligations ne sont pas définis.',
    response: 'L’innovation juridique devient opérante lorsqu’elle précise la gouvernance, la représentation, le financement et l’articulation avec les droits humains.',
    grammar: 'Les relatives complexes : dont, lequel et préposition + relatif',
    purpose: 'enchaîner des précisions denses sans perdre l’antécédent ni la relation syntaxique',
    rule: 'Dont remplace de + nom ; lequel varie après une préposition ; ce à quoi et ce dont reprennent une proposition ou une idée sans antécédent nominal.',
    vocabulary: [
      ['la personnalité juridique', 'la capacité reconnue d’être titulaire de droits et d’obligations'],
      ['la qualité pour agir', 'le droit de saisir une juridiction dans une affaire'],
      ['un gardien légal', 'un représentant chargé de défendre les intérêts d’une entité'],
      ['un écosystème', 'un ensemble d’êtres vivants et de milieux en interaction'],
      ['une obligation positive', 'une obligation d’agir et non seulement de s’abstenir'],
      ['l’effectivité', 'la capacité d’une règle à produire des effets réels']
    ]
  },
  {
    slug: 'risques-long-terme',
    title: 'Gouvernance des risques à long terme',
    readingTitle: 'Décider pour des générations absentes',
    problem: 'Les institutions présentes évaluent des risques dont la probabilité, l’échelle et l’horizon dépassent les cycles politiques ordinaires.',
    tension: 'La prévention protège les générations futures ; une focalisation abstraite sur le futur peut détourner l’attention des injustices déjà vécues.',
    response: 'Une gouvernance légitime relie prévention, justice présente, contrôle démocratique et politiques utiles dans plusieurs futurs plausibles.',
    grammar: 'Le conditionnel de prudence et le futur antérieur prospectif',
    purpose: 'présenter une information non confirmée, une conséquence anticipée ou un bilan futur sans leur attribuer le même statut',
    rule: 'Le conditionnel marque l’information rapportée ou l’hypothèse ; le futur antérieur peut exprimer un accomplissement futur ou une conjecture sur un fait passé.',
    vocabulary: [
      ['un risque existentiel', 'un risque susceptible de compromettre durablement l’avenir de l’humanité'],
      ['l’actualisation', 'une méthode qui compare des valeurs présentes et futures'],
      ['un horizon temporel', 'la période prise en compte dans une décision'],
      ['une politique sans regret', 'une mesure utile dans plusieurs scénarios, même si le risque central ne se réalise pas'],
      ['l’équité intergénérationnelle', 'la justice dans la répartition des droits et charges entre générations'],
      ['une clause de réexamen', 'une disposition imposant de réévaluer périodiquement une décision']
    ]
  }
];
const topics = require('./french-c2-learning-science-topics');

function readingParts(topic) {
  if (Array.isArray(topic.parts) && topic.parts.length) return topic.parts;
  const paragraphs = [
    `${topic.readingTitle} part d’une difficulté qui résiste aux réponses binaires. ${topic.problem} À ce niveau de maîtrise, comprendre ne consiste plus seulement à repérer une thèse : il faut reconstruire les présupposés qui rendent chaque argument plausible, identifier les voix auxquelles il répond et mesurer exactement la portée de sa conclusion.`,
    `Le débat est souvent présenté comme l’affrontement de deux principes symétriques. Cette mise en scène facilite la discussion publique, mais elle simplifie l’histoire des institutions, la distribution inégale des risques et les désaccords sur l’autorité légitime. Dès que ces dimensions réapparaissent, les mots apparemment neutres changent de valeur. Ce qui est nommé progrès par un acteur peut constituer, pour un autre, un transfert de coût ou une perte de pouvoir.`,
    `${topic.tension} Cette contradiction apparente ne prouve pas que l’analyse a échoué. Elle révèle que plusieurs valeurs pertinentes ne peuvent être maximisées simultanément. Une lecture précise distingue donc les constats empiriques, les prévisions, les classifications juridiques et les jugements normatifs, même lorsqu’un même paragraphe passe rapidement de l’un à l’autre.`,
    `Les preuves ne sont presque jamais absentes ; elles sont distribuées de façon inégale et interprétées selon des méthodes différentes. Les modèles quantitatifs rendent visibles l’échelle et la sensibilité d’un phénomène. Les enquêtes qualitatives décrivent les mécanismes, les expériences vécues et les catégories que le modèle a parfois supposées sans les tester. Leur pertinence dépend de la question posée, de la qualité du recueil et de la distance entre l’observation et l’inférence.`,
    `La langue participe elle-même à la construction du problème. Une tournure passive peut mettre utilement un processus au premier plan, mais elle peut aussi faire disparaître l’acteur responsable. La nominalisation condense une chaîne de raisonnement ; trop chargée, elle dissimule le temps, la causalité ou le désaccord. Les marques de modalité établissent pareillement une hiérarchie : ce qui doit suivre logiquement ne se confond ni avec ce qui pourrait survenir ni avec ce qui est seulement souhaité.`,
    `Un contre-argument sérieux ne se réduit pas à la mention cérémonielle d’un désaccord. Il expose la meilleure explication concurrente, précise les éléments qui la soutiendraient et montre quelle prémisse de la thèse initiale elle conteste. Cette exigence ne conduit pas à mettre toutes les opinions sur le même plan. Elle oblige plutôt chaque conclusion importante à rencontrer l’objection la mieux construite qui puisse lui être opposée.`,
    `La comparaison historique affine encore l’examen, à condition que l’analogie ne soit pas prise pour une identité. Les controverses antérieures révèlent la formation des catégories, des institutions et des incitations ; elles ne prédisent pas mécaniquement le présent. Le lecteur averti demande quels traits structurels se répètent, quelles différences modifient le mécanisme et quelles archives ont été suffisamment conservées pour orienter la comparaison.`,
    `L’échelle complique également l’évaluation. Une mesure efficace dans une moyenne globale peut imposer localement des coûts concentrés. Une intervention réussie dans un cadre contrôlé peut dépendre d’institutions absentes ailleurs. La distribution n’est donc pas un supplément moral ajouté après l’analyse : elle transforme la faisabilité, l’adhésion et la durée probable du résultat.`,
    `La mise en œuvre produit enfin des connaissances au lieu de se contenter d’appliquer un plan. Les règles sont interprétées par des agents, les techniques adaptées par leurs utilisateurs et les groupes concernés découvrent des conséquences imprévues. Sans mécanisme de retour, les hypothèses initiales deviennent des faits administratifs et l’incertitude est transférée vers celles et ceux qui disposent du moins de moyens pour la contester.`,
    `${topic.response} Cette orientation demeure volontairement conditionnelle. Elle formule une direction tout en conservant des critères de révision. Une institution responsable annonce les résultats attendus, les preuves qui infirmeraient son approche et l’autorité habilitée à la modifier ou à l’interrompre.`,
    `La leçon plus générale concerne la posture intellectuelle. L’humilité épistémique n’est pas l’indécision, pas plus que la confiance ne constitue une certitude. Un jugement mûr peut être ferme sur les éléments établis, explicite sur les mécanismes encore discutés et provisoire sur les prévisions. Cette combinaison rend visible la structure de l’engagement au lieu de la masquer sous une assurance rhétorique.`,
    `Suivre ce raisonnement revient ainsi à le considérer à plusieurs échelles : phrase, paragraphe, institution et vision du monde. La maîtrise ne réside pas dans une complexité maximale, mais dans une complexité contrôlée : savoir ce qui doit être explicité, ce qui peut rester implicite, quelle objection mérite une réponse et à quel moment une conclusion soigneusement nuancée est plus forte qu’une affirmation absolue.`
  ];
  return Array.from({ length: 6 }, (_, index) =>
    paragraphs.slice(index * 2, index * 2 + 2).join('\n\n')
  );
}

function vocabularyItems(topic) {
  return [...topic.vocabulary, ...sharedVocabulary].map(([word, definition]) => ({
    word,
    translation: definition,
    definition,
    simpleDefinition: definition,
    example: `Dans cette unité, « ${word} » permet de formuler une distinction avec précision.`,
    partOfSpeech: word.includes(' ') ? 'expression ou groupe nominal' : 'nom ou verbe'
  }));
}

function vocabularyExercises(items) {
  return items.map((item, index) => {
    const answer = index % 4;
    const options = [1, 2, 3].map((offset) => items[(index + offset) % items.length].definition);
    options.splice(answer, 0, item.definition);
    return mcq(
      `Quelle définition correspond à « ${item.word} » ?`,
      options,
      answer,
      `« ${item.word} » désigne ${item.definition}.`
    );
  });
}

function grammarExercises(topic) {
  const examples = [
    [`Quelle phrase maîtrise correctement « ${topic.grammar} » ?`, 'Quand bien même les preuves resteraient incomplètes, la conclusion pourrait être provisoirement défendue.'],
    [`Quelle formulation répond le mieux à l’objectif suivant : ${topic.purpose} ?`, 'Tout en reconnaissant la portée de l’objection, l’analyse en circonscrit les conséquences.'],
    ['Quelle phrase calibre le plus précisément le degré de certitude ?', 'Le mécanisme ne saurait être tenu pour établi, encore qu’il mérite un examen complémentaire.'],
    ['Quelle option maintient un registre formel et maîtrisé ?', 'La proposition appelle un examen approfondi dans la mesure où ses prémisses n’ont pas été vérifiées indépendamment.'],
    ['Quelle phrase distingue clairement preuve et inférence ?', 'L’observation étaye l’hypothèse sans suffire, à elle seule, à établir la chaîne causale annoncée.'],
    ['Quelle formulation évite d’effacer la responsabilité ?', 'L’autorité de contrôle a différé la publication, empêchant les personnes concernées d’évaluer la décision.'],
    ['Quelle phrase intègre un contre-argument substantiel ?', 'Si le modèle améliore effectivement la prévision, il ne résout pas la question distributive dont dépend sa mise en œuvre.'],
    ['Quelle conclusion est correctement nuancée ?', 'Dans l’état actuel des preuves, cette politique paraît défendable, pour autant que ses garanties restent contrôlables.'],
    ['Quelle phrase présente la meilleure cohésion entre les propositions ?', 'La première analyse explique le calendrier ; la seconde, les conditions institutionnelles qui ont rendu le résultat possible.'],
    [`Quelle définition décrit correctement « ${topic.grammar} » ?`, topic.rule]
  ];
  return examples.slice(0, 8).map(([prompt, correct], index) => {
    const answer = index % 4;
    const options = [
      'Les données sont pertinentes ; la conclusion est donc certaine.',
      'L’argument est recevable, mais il ne distingue pas suffisamment l’observation de l’inférence.',
      'La proposition paraît utile, sans que ses conditions institutionnelles soient précisées.',
      'La conclusion est prudente, mais la relation entre l’agent, la cause et l’effet reste imprécise.'
    ];
    options[answer] = correct;
    return mcq(
      prompt,
      options,
      answer,
      `La réponse applique « ${topic.grammar} » avec une forme, une portée et un registre contrôlés.`
    );
  });
}

function grammarTest(topic, exercises) {
  return {
    id: `french-c2-${topic.slug}-grammar-test`,
    passingScore: 70,
    questions: exercises.map((exercise, index) => ({
      id: `french-c2-${topic.slug}-grammar-q${index + 1}`,
      type: 'mcq',
      prompt: exercise.prompt,
      options: exercise.options.map((text, optionIndex) => ({
        id: ['a', 'b', 'c', 'd'][optionIndex],
        text
      })),
      correctOptionId: ['a', 'b', 'c', 'd'][exercise.answer],
      explanation: exercise.explanation,
      difficulty: index < 2 ? 'application' : index < 6 ? 'analysis' : 'precision'
    }))
  };
}

function buildUnit(topic, index) {
  const vocabulary = vocabularyItems(topic);
  const reading = readingParts(topic);
  const readingExercises = Array.isArray(topic.questions)
    ? topic.questions.map((question, questionIndex) => {
        const answer = questionIndex % 4;
        const options = [...question.distractors];
        options.splice(answer, 0, question.correct);
        return mcq(
          question.prompt,
          options,
          answer,
          `La réponse s'appuie sur les résultats, les limites et la conclusion de « ${topic.readingTitle} ».`
        );
      })
    : [
    mcq('Quelle exigence analytique centrale le texte met-il en avant ?', ['Reconstruire les présupposés, les voix et la portée des conclusions', 'Choisir systématiquement l’argument le plus long', 'Écarter toute donnée qualitative', 'Traduire chaque phrase isolément'], 0),
    mcq('Pourquoi la présentation binaire d’un débat est-elle jugée insuffisante ?', ['Elle ne contient aucun exemple', 'Elle masque l’histoire, la distribution des risques et la question de l’autorité', 'Elle appartient uniquement à la littérature', 'Elle interdit toute conclusion'], 1),
    mcq('Que faut-il distinguer même lorsque ces éléments interagissent ?', ['Les paragraphes longs et courts', 'Les titres et les sous-titres', 'Les constats, prévisions, classifications et jugements normatifs', 'Les noms propres et les verbes'], 2),
    mcq('Comment le texte compare-t-il données quantitatives et enquêtes qualitatives ?', ['Leur pertinence dépend de la question et de la qualité de l’inférence', 'Les nombres sont toujours supérieurs', 'Les témoignages remplacent toute mesure', 'Les deux formes sont inutiles'], 0),
    mcq('Quel danger peut présenter une nominalisation trop chargée ?', ['Elle rend toujours le registre familier', 'Elle peut dissimuler le temps, la causalité ou le désaccord', 'Elle supprime les paragraphes', 'Elle empêche toute modalisation'], 1),
    mcq('Qu’est-ce qui caractérise un contre-argument sérieux ?', ['La simple mention d’une opposition', 'L’examen de la meilleure explication concurrente et de la prémisse contestée', 'L’égalité automatique de toutes les opinions', 'Le refus de toute preuve'], 1),
    mcq('Pourquoi la distribution des effets appartient-elle à l’analyse de faisabilité ?', ['Les coûts concentrés modifient l’adhésion et la durabilité', 'Elle n’est qu’une question stylistique', 'Les moyennes mondiales décrivent chaque situation', 'Elle efface les institutions'], 0),
    mcq('Pourquoi la réponse proposée reste-t-elle conditionnelle ?', ['Parce que l’auteur refuse toute position', 'Parce qu’elle conserve des critères explicites de révision', 'Parce que le sujet est fictif', 'Parce qu’une conclusion doit rester vague'], 1),
    mcq('Comment le texte définit-il l’humilité épistémique ?', ['Comme une indécision permanente', 'Comme la reconnaissance des limites associée à un jugement justifié', 'Comme un manque de compétence', 'Comme le refus de comparer des preuves'], 1),
    mcq(`Quelle réponse correspond le mieux au problème traité dans « ${topic.readingTitle} » ?`, [topic.response, 'Toute décision doit être définitivement suspendue.', 'Seule l’opinion individuelle possède une valeur.', 'Les preuves ne devraient pas être rendues publiques.'], 0)
    ];
  const grammar = grammarExercises(topic);
  return {
    slug: topic.slug,
    title: topic.title,
    titleEs: topic.title,
    description: `Enquête interdisciplinaire C2 : ${topic.readingTitle}.`,
    order: index + 1,
    accessTier: index < 2 ? 'free' : 'premium',
    unitOverview: {
      objective: `Évaluer des cadres concurrents dans le domaine suivant : ${topic.title.toLowerCase()}.`,
      outcomes: [
        'inférer les présupposés et les liens laissés implicites',
        'évaluer des preuves hétérogènes et leurs limites',
        'maîtriser un lexique précis, idiomatique et connoté',
        'maintenir un contrôle grammatical constant dans une argumentation complexe'
      ],
      grammar: [topic.grammar],
      vocabulary: vocabulary.slice(0, 6).map((item) => item.word),
      scenario: topic.readingTitle,
      cefrTargets: ['compréhension approfondie et inférence', 'étendue et contrôle du vocabulaire', 'correction grammaticale constante']
    },
    activities: {
      reading: activity('reading', {
        title: topic.readingTitle,
        description: `Lecture C2 pour interpréter ${topic.title.toLowerCase()} avec précision et nuance.`,
        reading: {
          title: topic.readingTitle,
          parts: reading,
          questions: readingExercises.slice(0, 3).map((exercise) => exercise.prompt),
          references: topic.references || []
        },
        readingReferences: topic.references || [],
        exercises: readingExercises
      }),
      vocabulary: activity('vocabulary', {
        title: `Le lexique de l’unité : ${topic.title}`,
        description: `Vocabulaire C2 pour analyser ${topic.title.toLowerCase()}.`,
        vocabulary,
        exercises: vocabularyExercises(vocabulary)
      }),
      grammar: activity('grammar', {
        title: topic.grammar,
        description: `Maîtriser ${topic.grammar.toLowerCase()} dans un contexte argumentatif C2.`,
        grammarNote: `${topic.rule} Cette ressource permet de ${topic.purpose}. Les formes étudiées servent à articuler les thèses, les objections et les nuances de « ${topic.readingTitle} » sans perdre la précision du propos.`,
        phrases: grammar.slice(0, 4).map((exercise) => exercise.options[exercise.answer]),
        grammarProfile: {
          name: topic.grammar,
          definition: topic.rule,
          structure: `Structures et marqueurs étudiés dans cette unité : ${topic.grammar}.`,
          function: topic.purpose,
          examples: grammar.slice(0, 4).map((exercise) => exercise.options[exercise.answer])
        },
        exercises: grammar,
        grammarTest: grammarTest(topic, grammar)
      })
    }
  };
}

const units = topics.map(buildUnit);
require('./advanced-communication-skills').ensureAdvancedCommunicationSkills(units, {
  language: 'french',
  level: 'C2'
});
require('./french-c1-c2-listening-adapter').applyFrenchC1C2Listening(units, 'C2');

module.exports = {
  language: 'french',
  level: 'C2',
  courseTitle: 'Français C2',
  courseDescription:
    'Français de maîtrise selon le CECR : douze enquêtes interdisciplinaires intégrant lecture critique, écoute experte, argumentation orale, écriture guidée, vocabulaire et grammaire.',
  units
};
