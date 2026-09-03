// French C1 units 3-12. Each unit is built around a real, factual topic
// (media, translation, migration history, social justice, ecology, etc.)
// and intentionally exposes only Reading, Vocabulary and Grammar, matching
// the scoped C1 course design.

const { enrichAdvancedVocabulary, usefulExpressions } = require('./advanced-vocabulary');
const DEFAULTS = {
  reading: { duration: 20, xp: 40 },
  vocabulary: { duration: 14, xp: 35 },
  grammar: { duration: 18, xp: 40 }
};

const activity = (skill, fields) => ({ skill, ...DEFAULTS[skill], ...fields });
const mcq = (prompt, options, answer, explanation = '') => ({
  type: 'mcq', prompt, options, answer, explanation
});

const plans = [
  {
    slug: 'les-medias-et-la-fabrique-de-lopinion',
    title: 'Les médias et la fabrique de l’opinion',
    titleEs: 'Los medios y la construcción de la opinión',
    readingTitle: 'Une information, plusieurs récits',
    description: 'Comment une même réforme universitaire est racontée différemment selon les médias.',
    objective: 'Analyser le cadrage médiatique, les présupposés et la hiérarchie de l’information.',
    grammar: 'La nominalisation et les tournures impersonnelles',
    grammarNote: 'La nominalisation condense une proposition et densifie le registre analytique : « le gouvernement réforme » devient « la réforme gouvernementale ». Les tournures « il ressort que », « il convient de » et « force est de constater que » permettent de structurer une analyse sans effacer la responsabilité des acteurs.',
    scenario: 'Une analyse comparée de la couverture médiatique de la réforme des retraites de 2023 en France.',
    parts: [
      'Un chiffre, deux mots, trois traitements radicalement différents : voilà ce qu’a produit, au printemps 2023, l’annonce de la réforme des retraites en France. Un quotidien national ouvrait son édition sur « une réforme d’équilibre budgétaire », quand un journal syndical titrait « un recul social imposé sans vote ». Une chaîne d’information continue diffusait en boucle les images des manifestations, tandis qu’un hebdomadaire économique publiait un dossier chiffré sur l’espérance de vie et les régimes de retraite comparés en Europe. Les rédactions citaient les mêmes projections démographiques du Conseil d’orientation des retraites ; aucune ne racontait tout à fait la même histoire.',
      'Une analyse comparée de ce corpus révèle d’abord un contraste lexical révélateur, que la théoricienne américaine du framing, Deborah Tannen, aurait sans doute reconnu : là où le communiqué gouvernemental parlait de « justice entre générations », les organisations syndicales évoquaient une « double peine pour les métiers pénibles ». Ce décalage ne prouve pas qu’un article mente délibérément. Il montre plutôt que sélectionner un chiffre, l’ordonner et le nommer revient déjà à orienter sa lecture, un phénomène que les chercheurs en sciences de l’information désignent sous le terme de cadrage.',
      'Il convient cependant de ne pas transformer ce constat en procès d’intention généralisé. Les rédactions travaillent sous contraintes de temps et d’espace, s’adressent à des publics différents et s’appuient sur des lignes éditoriales identifiables et assumées. Ce qui importe pour un lecteur exigeant est de distinguer une perspective éditoriale assumée d’une manipulation qui, elle, dissimule ses propres procédés. Un tableau comparatif utile retiendrait ainsi, pour chaque article sur la réforme, les sources citées, les voix absentes du débat — retraitées précaires, travailleurs de nuit, aidants familiaux — et le degré de contextualisation des chiffres avancés.',
      'La nominalisation, si fréquente dans ce type d’écriture analytique, mérite ici une attention particulière : elle permet de condenser un jugement sans jamais le formuler ouvertement. Écrire « la contestation de la réforme » plutôt que « les syndicats contestent la réforme » efface, presque insensiblement, la source de l’action au profit du seul processus. Ce n’est pas un procédé condamnable en soi — il structure l’essentiel du discours analytique, y compris celui de ce paragraphe — mais il convient d’apprendre à le repérer, car il rend certains choix moins visibles qu’une phrase à sujet explicite ne le ferait. Il ressort d’ailleurs d’une lecture attentive des trois titres cités plus haut que chacun nominalise différemment le même événement, révélant ainsi, presque malgré lui, sa propre hiérarchie de valeurs.',
      'On ne saurait, en conclusion, désigner un seul de ces articles comme définitivement neutre. Une lecture informée exige plutôt de croiser plusieurs récits et d’en observer les angles morts respectifs, quitte à consulter directement les données brutes du Conseil d’orientation des retraites plutôt que leur seule reformulation médiatique. Cette prudence méthodologique ne conduit pas pour autant au relativisme : l’âge légal de départ, lui, demeure un fait vérifiable, quand bien même son interprétation politique varie considérablement d’une rédaction à l’autre. L’esprit critique, en somme, ne consiste pas seulement à douter systématiquement, mais à se demander comment chaque version du réel a été construite, et dans quel but.'
    ],
    vocabulary: [
      ['le cadrage', 'el encuadre', 'Le cadrage détermine l’angle sous lequel un événement est présenté.'],
      ['un présupposé', 'un presupuesto implícito', 'Le titre repose sur un présupposé discutable.'],
      ['une ligne éditoriale', 'una línea editorial', 'La ligne éditoriale influence le choix des sujets.'],
      ['un angle mort', 'un punto ciego', 'L’article comporte un angle mort important.'],
      ['étayer', 'fundamentar', 'Il faut étayer cette affirmation avec des sources.'],
      ['le relativisme', 'el relativismo', 'La pluralité des points de vue ne signifie pas relativisme.'],
      ['hiérarchiser', 'jerarquizar', 'La rédaction hiérarchise les informations.'],
      ['un procès d’intention', 'un juicio de intenciones', 'Elle évite de faire un procès d’intention au journaliste.']
    ],
    readingChecks: [
      ['Quel événement de 2023 sert de cas d’étude au texte ?', ['Une réforme universitaire', 'La réforme des retraites en France', 'Une élection présidentielle', 'Un scandale financier'], 1],
      ['Quelle opposition lexicale l’analyse comparée met-elle en évidence ?', ['« Justice entre générations » / « double peine pour les métiers pénibles »', '« Réforme » / « université »', '« Étudiante » / « ministre »', '« Économie » / « chronique »'], 0],
      ['Pourquoi le texte met-il en garde contre le procès d’intention envers les rédactions ?', ['Il considère tous les médias neutres', 'Une perspective éditoriale assumée ne prouve pas automatiquement une manipulation', 'Il défend exclusivement le gouvernement', 'Il refuse toute analyse critique'], 1],
      ['Quelles voix le texte identifie-t-il comme souvent absentes du débat médiatique sur la réforme ?', ['Les ministres et les syndicats', 'Les retraitées précaires, les travailleurs de nuit, les aidants familiaux', 'Les journalistes économiques', 'Les chaînes d’information continue'], 1],
      ['Quel fait le texte présente-t-il comme vérifiable malgré la diversité des récits médiatiques ?', ['Le nom du ministre', 'L’âge légal de départ en retraite', 'Le titre de chaque article', 'La ligne éditoriale de chaque journal'], 1]
    ],
    grammarChecks: [
      ['« Le ministère a annoncé la réforme » devient...', ['l’annoncer de la réforme', 'l’annonce de la réforme par le ministère', 'la réforme annonçant', 'le ministère annoncé'], 1],
      ['___ de comparer les sources avant de conclure.', ['Il convient', 'Il convient que', 'C’est convenu à', 'Il convenant'], 0],
      ['___ que les titres orientent la lecture.', ['Il ressort de l’analyse', 'Il sort analyse', 'Il résulte les', 'Il est ressorti à'], 0],
      ['« Les étudiants contestent la mesure » devient...', ['la contestation de la mesure par les étudiants', 'les étudiants de contestation', 'le contesté étudiant', 'la mesure à contester'], 0],
      ['Force est de ___ que les angles diffèrent.', ['constaté', 'constater', 'constatant', 'constate'], 1],
      ['La ___ des informations influence leur réception.', ['hiérarchiser', 'hiérarchisation', 'hiérarchisé', 'hiérarchiquement'], 1],
      ['Quelle formulation appartient au registre analytique ?', ['On voit bien que ça ne va pas.', 'Il apparaît que cette lecture omet plusieurs facteurs.', 'Ce truc est faux.', 'Moi, je trouve ça bizarre.'], 1],
      ['Choisis la phrase correctement nominalisée.', ['La sélection des sources révèle un cadrage.', 'La sélectionner des sources révèle.', 'Le sélectionné source révèle.', 'Sélection des sources révèlent.'], 0]
    ]
  },
  {
    slug: 'intelligence-artificielle-et-traduction',
    title: 'Intelligence artificielle et traduction',
    titleEs: 'Inteligencia artificial y traducción',
    readingTitle: 'Traduire sans effacer la voix',
    description: 'Ce que la traduction automatique révèle, et ce qu’elle efface, face à un texte littéraire.',
    objective: 'Évaluer une technologie en distinguant efficacité, responsabilité et perte de nuance.',
    grammar: 'La concession avancée : quoique, quand bien même, avoir beau',
    grammarNote: 'La concession met en relation deux faits dont le second résiste au premier : « Quoique l’outil soit rapide, il simplifie le style. » « Quand bien même il progresserait, une révision resterait nécessaire. » « Elle a beau corriger le texte, certaines nuances lui échappent. »',
    scenario: 'Une évaluation des limites de la traduction automatique appliquée à un texte littéraire caribéen.',
    parts: [
      'Soumettre une page de Patrick Chamoiseau à un moteur de traduction neuronale, c’est observer en direct les limites d’une technologie par ailleurs impressionnante. Le texte original mêle français standard, créole martiniquais et images empruntées à l’oralité des conteurs ; le résultat produit par la machine, lui, est grammaticalement impeccable, fluide et livré en une seconde. Pourtant, quelque chose s’y aplatit systématiquement : une expression créole intraduisible devient une formule neutre et interchangeable, et l’ironie d’une phrase se transforme, sans prévenir, en affirmation sérieuse.',
      'Les défenseurs de ces outils rappellent, à juste titre, le temps qu’ils permettent de gagner : Google Translate traite aujourd’hui plus de cent milliards de mots par jour, un volume qu’aucune profession humaine ne pourrait absorber. Pour des documents répétitifs, des notices techniques ou une première compréhension globale, leur utilité paraît difficilement contestable. Le problème se situe ailleurs : dans le glissement qui consiste à confondre une traduction acceptable avec une traduction fidèle à une voix. Une phrase peut transmettre une information correcte tout en modifiant profondément la relation que le texte entretient avec son lecteur.',
      'Des ateliers de traduction littéraire comparent régulièrement trois versions d’un même extrait : celle de la machine, celle d’un traducteur humain et une version collective issue de la discussion. Le débat ne porte alors plus sur des erreurs évidentes, mais sur de véritables décisions interprétatives. Faut-il conserver le mot créole et ajouter une note en bas de page, comme le fait souvent la traductrice anglaise de Chamoiseau, ou reproduire une syntaxe inhabituelle, au risque de troubler le lecteur ? Rendre explicite une allusion culturelle que le texte original laisse volontairement implicite ?',
      'Elle a beau proposer, en quelques secondes, une version parfaitement lisible, la machine ne mesure jamais la distance qui sépare une phrase correcte d’une phrase juste. Quoique certains éditeurs y voient déjà un outil de préparation utile — une première passe que le traducteur humain corrigerait ensuite plus vite qu’il ne traduirait seul —, cette pratique déplace un risque plutôt qu’elle ne le supprime : celui de figer, dès la première lecture, une interprétation que la machine aura choisie sans le savoir, et que le traducteur, pressé, n’aura plus la même liberté de reconstruire entièrement.',
      'On peut en conclure que la technologie ne supprime pas la responsabilité du traducteur ; elle la déplace. Plus l’outil produit un texte vraisemblable, plus la vigilance humaine doit porter sur ce qui ne se voit pas immédiatement : le rythme, le sous-entendu et la position de la voix narrative. Quand bien même les systèmes deviendraient plus performants dans les années à venir — et les progrès depuis les premiers modèles neuronaux de 2016 sont réels — choisir entre plusieurs fidélités resterait un acte humain, discutable et toujours situé dans un contexte particulier.'
    ],
    vocabulary: [
      ['aplatir une voix', 'aplanar una voz', 'Une traduction trop neutre peut aplatir une voix littéraire.'],
      ['un sous-entendu', 'un sobreentendido', 'La machine n’a pas détecté le sous-entendu ironique.'],
      ['vraisemblable', 'verosímil', 'Le résultat paraît vraisemblable au premier regard.'],
      ['une décision interprétative', 'una decisión interpretativa', 'Toute traduction implique une décision interprétative.'],
      ['expliciter', 'explicitar', 'Faut-il expliciter cette référence culturelle ?'],
      ['une fidélité', 'una fidelidad', 'La fidélité au sens peut entrer en tension avec le style.'],
      ['situé(e)', 'situado/a, contextualizado/a', 'Le choix du traducteur est toujours situé.'],
      ['une vigilance', 'una vigilancia', 'La fluidité exige une vigilance accrue.']
    ],
    readingChecks: [
      ['Quel écrivain sert d’exemple concret au texte ?', ['Frankétienne', 'Patrick Chamoiseau', 'Nancy L. Green', 'Médéric Gasquet-Cyrus'], 1],
      ['Quel chiffre le texte cite-t-il pour illustrer le gain de temps des outils de traduction ?', ['Cent milliards de mots traités par jour par Google Translate', 'Le nombre de langues créoles existantes', 'Le nombre de traducteurs professionnels en France', 'L’année de création de Chamoiseau'], 0],
      ['Quelle confusion le texte critique-t-il chez les défenseurs de la traduction automatique ?', ['Traduction et écriture', 'Une traduction acceptable et une traduction fidèle à une voix', 'Français et créole', 'Atelier et examen'], 1],
      ['Quelle pratique la traductrice anglaise de Chamoiseau illustre-t-elle, selon le texte ?', ['Supprimer tous les mots créoles', 'Conserver un mot créole et ajouter une note en bas de page', 'Traduire uniquement les dialogues', 'Refuser de traduire l’auteur'], 1],
      ['Comment la technologie déplace-t-elle, selon le texte, la responsabilité du traducteur ?', ['Elle la rend inutile', 'Elle exige une vigilance sur ce qui ne se voit pas immédiatement (rythme, sous-entendu, voix)', 'Elle interdit toute note de bas de page', 'Elle impose une seule fidélité définitive'], 1]
    ],
    grammarChecks: [
      ['___ l’outil soit rapide, il simplifie parfois le style.', ['Quoique', 'Parce que', 'Afin que', 'Depuis que'], 0],
      ['Quand bien même la machine ___, une révision resterait nécessaire.', ['progressera', 'progresserait', 'progresse', 'a progressé'], 1],
      ['Le traducteur a beau ___ le résultat, une nuance lui échappe.', ['relit', 'relire', 'relu', 'relisant'], 1],
      ['Quoique cette version ___ fluide, elle manque de rythme.', ['est', 'soit', 'sera', 'était toujours'], 1],
      ['___ ses avantages, l’outil ne résout pas tout.', ['Malgré', 'Quoique', 'Bien que de', 'Quand bien'], 0],
      ['Il a beau être correct, ce passage ___ la voix originale.', ['effaçait', 'efface', 'effacerait si', 'ait effacé que'], 1],
      ['Quelle phrase exprime une concession hypothétique ?', ['Quand bien même il réussirait, le débat resterait ouvert.', 'Parce qu’il réussit, le débat cesse.', 'Il réussit afin que le débat continue.', 'Dès qu’il réussira, tout sera vrai.'], 0],
      ['Choisis la construction correcte.', ['Bien que le texte est fluide', 'Bien que le texte soit fluide', 'Bien que le texte sera fluide', 'Bien que le texte être fluide'], 1]
    ]
  },
  {
    slug: 'memoire-migration-et-identite',
    title: 'Mémoire, migration et identité',
    titleEs: 'Memoria, migración e identidad',
    readingTitle: 'Les archives de grand-mère',
    description: 'Ce que les correspondances familiales migratoires révèlent, et taisent, aux historiens.',
    objective: 'Interpréter un récit mémoriel où documents, silences et identité se répondent.',
    grammar: 'Les temps du récit et le discours indirect libre',
    grammarNote: 'Le passé simple structure les événements d’un récit soutenu, l’imparfait installe le cadre et le plus-que-parfait marque l’antériorité. Le discours indirect libre rapporte une pensée sans verbe introducteur ni guillemets, en conservant la perspective du personnage.',
    scenario: 'Un chercheur classe et interprète des lettres échangées entre la République dominicaine et la France.',
    parts: [
      'Une boîte à chaussures, cent trente-sept lettres, deux écritures qui se répondent pendant douze ans : c’est à partir d’un fonds de cette nature, aujourd’hui banal dans les centres d’archives régionales, que les historiens de la migration reconstituent depuis une trentaine d’années des trajectoires que la mémoire familiale a coutume de résumer en quelques mots — on partait, on réussissait, puis on revenait. Les lettres échangées entre des personnes parties travailler en Europe dans les années soixante et soixante-dix racontent en réalité une autre histoire, traversée par la solitude, les emplois précaires et la crainte de décevoir des proches qui attendaient des nouvelles rassurantes.',
      'Les chercheurs en histoire orale s’intéressent tout particulièrement à ce que ces lettres taisent. Certaines périodes de plusieurs mois n’y laissent aucune trace ; des difficultés y sont évoquées puis aussitôt minimisées. Dans un corpus étudié par l’historienne Nancy L. Green sur l’émigration ouvrière, une correspondante affirme régulièrement que « tout va pour le mieux », avant de demander discrètement qu’on lui envoie un remède qu’elle ne peut pas acheter sur place. L’optimisme affiché n’était-il qu’une protection destinée à la famille restée au pays, ou une manière de se convaincre soi-même de tenir bon ?',
      'Les témoignages oraux recueillis auprès des générations suivantes complètent parfois ce récit, mais la mémoire transmise hésite souvent : une date se corrige, un nom revient différemment d’un témoignage à l’autre, les adultes reconnaissent qu’à l’époque ils ne disaient pas tout aux enfants. Ce constat conduit les historiens à une conclusion méthodologique importante : l’archive ne livre jamais une vérité intacte, mais des fragments produits dans une situation particulière. Le silence lui-même devient alors une donnée à interpréter, à condition de ne pas prétendre le remplir avec certitude.',
      'Que restait-il vraiment à raconter, une fois les lettres relues une troisième fois ? La question hante encore les petits-enfants qui héritent de ces correspondances sans en avoir vécu la moindre ligne. L’un d’eux confiait, lors d’un entretien recueilli pour un projet universitaire d’histoire orale, qu’il avait longtemps cru sa grand-mère partie par goût de l’aventure, avant de découvrir, à la relecture, qu’elle n’était jamais revenue chercher les meubles qu’elle disait vouloir récupérer « bientôt ». Ce petit détail matériel, presque anodin, en disait davantage sur l’incertitude du départ que n’importe quelle déclaration explicite.',
      'En croisant lettres, archives administratives et entretiens, ces travaux de recherche invitent à abandonner l’idée d’une origine simple qui expliquerait entièrement une identité. Ils font apparaître plutôt une constellation de départs, d’attachements et de récits sans cesse révisés, où chaque génération réinterprète à sa manière les fragments laissées par la précédente. Une histoire familiale migratoire, une fois documentée avec cette rigueur, ne dicte aucune identité définitive : elle offre des questions plus précises et impose une responsabilité, celle de transmettre les sources sans effacer leurs contradictions, plutôt que de les lisser en un récit rassurant transmis sans examen d’une génération à l’autre.'
    ],
    vocabulary: [
      ['une archive', 'un archivo', 'Chaque archive doit être replacée dans son contexte.'],
      ['un récit linéaire', 'un relato lineal', 'La famille avait construit un récit trop linéaire.'],
      ['minimiser', 'minimizar', 'La lettre semble minimiser les difficultés.'],
      ['un fragment', 'un fragmento', 'Le document ne conserve qu’un fragment de l’expérience.'],
      ['une constellation', 'una constelación', 'Son identité ressemble à une constellation de récits.'],
      ['combler un silence', 'llenar un silencio', 'L’historien ne peut pas combler un silence arbitrairement.'],
      ['une trace', 'una huella', 'Plusieurs mois n’ont laissé aucune trace écrite.'],
      ['réviser un récit', 'revisar un relato', 'La découverte oblige la famille à réviser son récit.']
    ],
    readingChecks: [
      ['Sur quel type de fonds d’archives le texte s’ouvre-t-il ?', ['Une boîte à chaussures contenant cent trente-sept lettres', 'Un registre administratif officiel', 'Une collection de photographies', 'Un journal intime unique'], 0],
      ['Quel détail contredit « tout va pour le mieux » dans le corpus étudié par Nancy L. Green ?', ['Une date erronée', 'La demande discrète d’un remède', 'Un changement de nom', 'Une photographie'], 1],
      ['Pourquoi les témoignages oraux restent-ils utiles malgré leurs hésitations, selon le texte ?', ['Ils remplacent entièrement les lettres', 'Ils apportent un contexte tout en révélant leurs propres limites', 'Ils garantissent chaque date avec certitude', 'Ils suppriment les silences des archives'], 1],
      ['Que devient le silence des lettres pour les historiens, selon le texte ?', ['Une preuve certaine', 'Une donnée à interpréter avec prudence', 'Une erreur à supprimer', 'Un passage sans intérêt'], 1],
      ['Comment ces travaux de recherche invitent-ils à reconsidérer l’identité familiale ?', ['En cherchant une origine simple et unique', 'En acceptant une constellation de récits parfois contradictoires', 'En rejetant toute histoire familiale', 'En adoptant uniquement le récit officiel'], 1]
    ],
    grammarChecks: [
      ['La grand-mère lui ___ une boîte, puis la petite-fille l’ouvrit.', ['confia', 'confiait toujours', 'avait confié demain', 'confierait'], 0],
      ['La boîte ___ depuis des années dans l’armoire.', ['attendit', 'attendait', 'attendra', 'ait attendu'], 1],
      ['La grande-tante ___ en France avant d’écrire ces lettres.', ['était partie', 'partit demain', 'partait après', 'sera partie'], 0],
      ['« Était-il possible que la famille n’ait rien su ? » relève...', ['du discours indirect libre', 'd’un ordre direct', 'd’une définition', 'd’un dialogue cité'], 0],
      ['Choisis la succession narrative correcte.', ['Elle ouvrait la boîte et trouva les lettres.', 'Elle ouvrit la boîte et trouvait soudain.', 'Elle avait ouvert demain.', 'Elle ouvre jadis.'], 0],
      ['L’imparfait sert principalement à...', ['installer un cadre ou une durée', 'annoncer un événement futur', 'donner un ordre', 'marquer une action ponctuelle achevée'], 0],
      ['Le plus-que-parfait marque...', ['une action antérieure à un autre passé', 'une hypothèse future', 'un fait simultané présent', 'un ordre passé'], 0],
      ['Quelle phrase adopte la perspective intérieure sans guillemets ?', ['Elle pensa : « Je dois comprendre. »', 'Pourquoi avait-on tant simplifié cette histoire ? Elle referma la lettre.', 'Elle dit qu’elle comprenait.', 'La lettre était ancienne.'], 1]
    ]
  },
  {
    slug: 'justice-sociale-et-inegalites',
    title: 'Justice sociale et inégalités',
    titleEs: 'Justicia social y desigualdades',
    readingTitle: 'Le mérite en question',
    description: 'Les limites du discours méritocratique face aux inégalités de départ.',
    objective: 'Suivre une argumentation contradictoire et distinguer égalité formelle et équité.',
    grammar: 'Les articulateurs logiques et la réfutation',
    grammarNote: 'Une argumentation C1 articule concession, réfutation et reformulation : « certes..., néanmoins... », « encore faut-il que... », « loin de..., cette mesure... ». Ces structures évitent la juxtaposition d’opinions et rendent explicite le rapport logique entre les propositions.',
    scenario: 'Des étudiants débattent de la sélection et des bourses universitaires.',
    parts: [
      'Chaque printemps depuis 2018, environ neuf cent mille lycéens formulent leurs vœux sur Parcoursup, la plateforme nationale d’admission postbac, et chaque printemps la même polémique ressurgit : l’algorithme serait-il un simple outil neutre, ou reproduit-il des inégalités antérieures à tout classement ? Le discours méritocratique repose sur une affirmation apparemment consensuelle — chacun devrait réussir grâce à son travail. Ce consensus se fissure dès lors que l’on considère que les résultats scolaires reflètent aussi les ressources disponibles avant même le dépôt du dossier : certains élèves disposent d’un logement calme, de temps libre et de réseaux familiaux informés sur les filières sélectives ; d’autres cumulent emploi salarié, temps de transport et démarches administratives complexes dès la classe de première.',
      'Les défenseurs les plus fermes du mérite redoutent qu’insister sur ces écarts ne décourage l’effort individuel. Selon eux, reconnaître le mérite protège les élèves contre une vision déterministe de leur propre avenir. Cette inquiétude n’est pas sans fondement, mais l’argument change de sens lorsqu’il sert à présenter toute difficulté scolaire comme un simple manque de volonté. Valoriser l’effort n’oblige en réalité nullement à nier les conditions sociales qui le rendent plus ou moins coûteux selon les élèves.',
      'Les rapports consacrés aux bourses du CROUS illustrent bien cette tension. Un règlement peut traiter tous les candidats de manière strictement identique tout en exigeant des justificatifs complexes — avis d’imposition, attestations de séparation, preuves de domicile — que certaines familles peinent à réunir dans les délais impartis. L’égalité formelle de la procédure produit alors des effets concrètement inégaux. Une simplification ciblée de ces démarches constitue-t-elle un privilège injuste envers certains candidats, ou une correction nécessaire d’un désavantage de départ ? Ce débat révèle que l’équité ne consiste pas forcément à distribuer la même chose à chacun.',
      'Certes, on objectera qu’une aide ciblée introduit une forme d’inégalité de traitement entre candidats. Encore faut-il, cependant, que cette objection ne serve pas à immobiliser toute réforme au nom d’une égalité purement théorique. Loin d’instaurer un privilège, l’accompagnement renforcé des dossiers les plus complexes vise seulement à ramener des candidats vers le point de départ que d’autres occupaient déjà sans effort. Un rapport parlementaire récent sur l’accès aux bourses notait ainsi qu’un taux non négligeable de non-recours — des étudiants éligibles qui, par méconnaissance ou découragement, ne déposent jamais de dossier — pèse plus lourdement sur les inégalités réelles que le montant même des aides distribuées.',
      'On peut en conclure que le mérite demeure une notion utile, à condition de ne pas en faire une explication totale des parcours scolaires. Ceux-ci résultent d’initiatives personnelles, d’institutions et de circonstances parfois invisibles. Loin d’abolir la responsabilité individuelle, cette lecture plus nuancée la replace dans un cadre plus honnête, où l’on peut interroger à la fois ce que chacun fait et ce que la collectivité rend réellement possible.'
    ],
    vocabulary: [
      ['la méritocratie', 'la meritocracia', 'La méritocratie suppose que le mérite détermine la réussite.'],
      ['l’équité', 'la equidad', 'L’équité tient compte des situations différentes.'],
      ['déterministe', 'determinista', 'Une vision déterministe nie toute capacité d’action.'],
      ['un justificatif', 'un comprobante', 'Le dossier exige plusieurs justificatifs.'],
      ['une égalité formelle', 'una igualdad formal', 'L’égalité formelle ne garantit pas les mêmes effets.'],
      ['un effet inégal', 'un efecto desigual', 'La règle uniforme produit un effet inégal.'],
      ['cibler', 'focalizar', 'La réforme cible les obstacles administratifs.'],
      ['un cadre honnête', 'un marco honesto', 'Le débat doit reposer sur un cadre honnête.']
    ],
    readingChecks: [
      ['Quelle plateforme sert de point de départ concret au texte ?', ['Parcoursup', 'Le CROUS uniquement', 'Le baccalauréat', 'Une université étrangère'], 0],
      ['Que craignent les défenseurs les plus fermes du mérite ?', ['La suppression des examens', 'Qu’une analyse des inégalités décourage l’effort individuel', 'La hausse des transports', 'La simplification des dossiers'], 1],
      ['Quelle nuance le texte apporte-t-il à cette crainte ?', ['Effort et conditions sociales peuvent être analysés ensemble sans se nier', 'Toute difficulté scolaire vient uniquement de la volonté', 'Le mérite est une notion inutile', 'Les circonstances expliquent absolument tout'], 0],
      ['Quels documents illustrent, selon le texte, la complexité des démarches de bourse du CROUS ?', ['Un CV et une lettre de motivation', 'Un avis d’imposition, des attestations de séparation, des preuves de domicile', 'Un relevé de notes uniquement', 'Une lettre de recommandation'], 1],
      ['Comment le texte définit-il implicitement l’équité, par opposition à l’égalité formelle ?', ['Donner toujours strictement la même chose à chacun', 'Adapter les moyens aux obstacles réels de chacun', 'Supprimer toute règle administrative', 'Favoriser arbitrairement un groupe de candidats'], 1]
    ],
    grammarChecks: [
      ['___ le mérite compte, il n’explique pas tout.', ['Certes', 'Afin que', 'Depuis', 'Faute de'], 0],
      ['La procédure est identique ; ___, ses effets diffèrent.', ['néanmoins', 'parce que', 'dès que', 'de sorte que toujours'], 0],
      ['Encore faut-il que les candidats ___ accès à l’information.', ['ont', 'aient', 'auront', 'avaient eu uniquement'], 1],
      ['Loin de ___ la responsabilité, cette analyse la précise.', ['supprime', 'supprimer', 'supprimé', 'supprimant que'], 1],
      ['Quel connecteur introduit une réfutation après concession ?', ['Néanmoins', 'D’abord', 'Par exemple', 'En effet uniquement'], 0],
      ['___ traiter chacun pareil, l’équité examine les obstacles.', ['Au lieu de', 'Bien que de', 'Malgré que', 'Pour que de'], 0],
      ['Choisis la formulation la plus structurée.', ['C’est vrai mais bon.', 'Certes la règle est uniforme ; néanmoins, ses effets restent inégaux.', 'La règle est pareille et voilà.', 'Oui non peut-être.'], 1],
      ['« Non que l’effort soit inutile, mais... » exige...', ['le subjonctif après non que', 'le futur après non que', 'l’infinitif passé', 'l’indicatif obligatoire'], 0]
    ]
  },
  {
    slug: 'ecologie-et-responsabilite-collective',
    title: 'Écologie et responsabilité collective',
    titleEs: 'Ecología y responsabilidad colectiva',
    readingTitle: 'Le campus peut-il devenir sobre ?',
    description: 'Les arbitrages d’une politique de sobriété énergétique sur un campus universitaire.',
    objective: 'Évaluer une politique écologique en identifiant arbitrages, indicateurs et effets indirects.',
    grammar: 'L’hypothèse complexe et le conditionnel passé',
    grammarNote: 'Les hypothèses irréelles du passé utilisent si + plus-que-parfait, puis conditionnel passé : « Si l’université avait isolé les bâtiments, elle aurait réduit sa consommation. » Le conditionnel peut aussi rapporter une information non confirmée.',
    scenario: 'L’université doit réduire sa consommation énergétique sans exclure les étudiants.',
    parts: [
      'Réduire le chauffage à dix-neuf degrés, éteindre l’éclairage extérieur après vingt-deux heures, décaler certains cours en visioconférence les jours de tension sur le réseau : ce sont les mesures très concrètes qu’une majorité d’universités françaises ont adoptées à partir de l’automne 2022, dans le cadre du plan national de sobriété énergétique lancé après la crise liée à la guerre en Ukraine, avec pour objectif affiché une baisse de dix pour cent de la consommation en deux ans. Les premières propositions paraissaient simples sur le papier, jusqu’à ce que les usagers en décrivent les conséquences concrètes : une bibliothèque fermée plus tôt prive de lieu de travail les étudiants qui ne peuvent pas réviser chez eux ; certaines formations exigent des laboratoires par nature énergivores ; les étudiants les plus éloignés du campus dépendent de réseaux de transport encore peu fréquents en soirée.',
      'Les diagnostics énergétiques menés sur plusieurs campus étudient les usages réels plutôt que de défendre une solution unique. Les relevés y montrent régulièrement que deux ou trois bâtiments mal isolés consomment à eux seuls davantage que plusieurs résidences réunies. Leur rénovation coûte cependant cher et produira des résultats moins visibles à court terme qu’une campagne demandant à chacun d’éteindre la lumière. Une question méthodologique centrale se pose alors : privilégier les gestes individuels ne risque-t-il pas de détourner l’attention des décisions structurelles réellement décisives ?',
      'Plusieurs associations spécialisées dans la transition énergétique du secteur public répondent qu’opposer comportements individuels et infrastructures serait une erreur d’analyse. Les habitudes peuvent changer rapidement, tandis que les travaux de rénovation prennent des années. Encore faut-il que les efforts demandés aux usagers restent proportionnés et que les établissements publient eux-mêmes leurs propres progrès. Sans indicateurs transparents, la responsabilité collective risque de devenir un slogan qui exige beaucoup des individus sans permettre d’évaluer réellement les décideurs institutionnels.',
      'Si les universités avaient engagé la rénovation de leurs bâtiments les plus énergivores dès les premiers diagnostics, publiés pour certains établissements il y a près de quinze ans, la facture énergétique de la crise de 2022 aurait sans doute été bien plus supportable. Ce constat rétrospectif, aussi juste soit-il, ne doit pas devenir un prétexte à l’immobilisme présent : il rappelle plutôt qu’une politique énergétique sérieuse se juge sur plusieurs décennies, et qu’un plan de sobriété annoncé dans l’urgence, aussi nécessaire fût-il, ne remplace jamais une planification patiente des travaux structurels.',
      'Les rapports les plus récents recommandent généralement de combiner rénovation prioritaire, horaires adaptés et accompagnement des usages. Il en ressort surtout que la sobriété énergétique n’est pas une simple réduction uniforme des consommations. Elle suppose de distinguer ce qui relève du superflu de ce qui garantit l’accès aux études pour tous. Une politique écologique crédible ne mesure donc pas seulement l’énergie économisée ; elle examine aussi qui supporte, concrètement, le coût de cette transition.'
    ],
    vocabulary: [
      ['la sobriété énergétique', 'la sobriedad energética', 'La sobriété énergétique réduit les usages superflus.'],
      ['énergivore', 'de alto consumo energético', 'Le laboratoire est particulièrement énergivore.'],
      ['un arbitrage', 'un arbitraje/decisión entre opciones', 'Chaque politique suppose un arbitrage.'],
      ['structurel(le)', 'estructural', 'L’isolation est une réponse structurelle.'],
      ['un indicateur', 'un indicador', 'Un indicateur transparent permet d’évaluer les progrès.'],
      ['proportionné(e)', 'proporcionado/a', 'L’effort demandé doit être proportionné.'],
      ['superflu(e)', 'superfluo/a', 'Il faut distinguer le besoin de l’usage superflu.'],
      ['supporter un coût', 'asumir un costo', 'Les étudiants ne doivent pas supporter seuls le coût.']
    ],
    readingChecks: [
      ['Quel événement a déclenché le plan national de sobriété énergétique évoqué au début du texte ?', ['Une canicule exceptionnelle', 'La crise énergétique liée à la guerre en Ukraine', 'Une grève des enseignants', 'Un rapport universitaire annuel'], 1],
      ['Quel objectif chiffré ce plan fixait-il aux établissements ?', ['Réduire de dix pour cent la consommation en deux ans', 'Fermer définitivement les bibliothèques', 'Doubler les frais de scolarité', 'Supprimer tous les laboratoires'], 0],
      ['Que révèlent les relevés énergétiques mentionnés dans le texte ?', ['Les gestes individuels suffisent à tout résoudre', 'Deux ou trois bâtiments mal isolés consomment plus que plusieurs résidences réunies', 'Les résidences universitaires sont toutes fermées', 'Les transports en commun sont gratuits'], 1],
      ['Quel risque le texte associe-t-il à une campagne centrée sur les gestes individuels ?', ['Accélérer les travaux de rénovation', 'Détourner l’attention des décisions structurelles décisives', 'Publier trop d’indicateurs publics', 'Réduire trop vite les émissions'], 1],
      ['Quelle conception de la sobriété énergétique conclut le texte ?', ['Une réduction strictement identique pour tous les usages', 'Une réduction qui distingue le superflu de ce qui garantit l’accès aux études', 'Un slogan sans mesure ni indicateur', 'Une rénovation sans changement d’usage'], 1]
    ],
    grammarChecks: [
      ['Si l’université avait rénové plus tôt, elle ___ moins consommé.', ['aurait', 'avait', 'aura', 'aurait été'], 0],
      ['Si la bibliothèque ___ fermé, certains étudiants auraient été exclus.', ['avait', 'aurait', 'a', 'fermait toujours'], 0],
      ['D’après le rapport, les émissions ___ déjà diminué.', ['auraient', 'avaient certainement', 'ont que', 'diminueraient hier'], 0],
      ['Sans cette consultation, la mesure ___ moins équitable.', ['aurait été', 'avait été demain', 'sera été', 'serait eu'], 0],
      ['Choisis l’hypothèse irréelle du passé.', ['Si nous avions mesuré, nous aurions compris.', 'Si nous mesurons, nous comprendrons.', 'Si nous mesurions, nous comprendrions.', 'Quand nous mesurons, nous comprenons.'], 0],
      ['Le conditionnel journalistique peut signaler...', ['une information non confirmée', 'un ordre absolu', 'une habitude passée', 'une définition'], 0],
      ['Si les efforts avaient été proportionnés, la réforme ___ mieux acceptée.', ['aurait été', 'sera', 'est', 'avait accepter'], 0],
      ['Quelle phrase est correcte ?', ['Si elle aurait investi, elle aurait économisé.', 'Si elle avait investi, elle aurait économisé.', 'Si elle avait investi, elle économisera hier.', 'Si elle investissait hier, elle avait économisé demain.'], 1]
    ]
  },
  {
    slug: 'langues-pouvoir-et-inclusion',
    title: 'Langues, pouvoir et inclusion',
    titleEs: 'Lenguas, poder e inclusión',
    readingTitle: 'Qui a le droit de bien parler ?',
    description: 'Comment les normes linguistiques peuvent inclure ou marginaliser selon les contextes.',
    objective: 'Analyser le rapport entre norme, variation linguistique et légitimité sociale.',
    grammar: 'Les relatives complexes : dont, lequel, ce à quoi, ce dont',
    grammarNote: 'Les pronoms relatifs complexes évitent les répétitions et précisent les rapports syntaxiques : « la norme à laquelle on se conforme », « ce dont elle doute », « le contexte dans lequel elle parle ». Le choix dépend de la préposition exigée.',
    scenario: 'Un atelier examine les accents et la légitimité linguistique.',
    parts: [
      'En 2020, l’Assemblée nationale française a inscrit la « glottophobie » — la discrimination fondée sur l’accent ou la façon de parler — dans la loi relative à la lutte contre les discriminations, aux côtés du sexisme et du racisme. Ce vote, largement salué mais aussi moqué par certains éditorialistes, part d’un constat que les sociolinguistes documentent depuis des décennies : une prononciation jugée « fautive » n’entrave généralement en rien la compréhension mutuelle entre locuteurs. Ce n’est donc pas la prononciation elle-même qui pose problème lors des corrections répétées subies par certains locuteurs dès l’enfance, à l’école comme dans la vie professionnelle : c’est l’association implicite que la société établit entre une manière de parler et un supposé manque de sérieux ou de compétence.',
      'Les travaux de la linguiste Médéric Gasquet-Cyrus distinguent ainsi la norme utile à certains contextes précis de l’idée, largement répandue mais scientifiquement infondée, qu’une seule variété de français serait naturellement supérieure aux autres. Une convention orthographique ou syntaxique peut faciliter la rédaction administrative ou l’enseignement ; elle devient problématique dès lors qu’elle se transforme en mesure générale de l’intelligence d’un individu. Les accents régionaux, les usages populaires et les langues issues de l’immigration portent des histoires que la correction systématique risque de rendre invisibles.',
      'Cette question dépasse largement le seul cas des accents régionaux : elle concerne aussi les locuteurs bilingues qui, historiquement, ont souvent cherché à effacer toute trace d’une autre langue dans leur français pour prouver leur compétence. Or maîtriser plusieurs registres ne signifie nullement renoncer à sa voix propre. Il s’agit plutôt de pouvoir choisir, en connaissance de cause, la forme adaptée à une situation donnée, sans accepter que d’autres réduisent la valeur d’un locuteur à un simple écart de prononciation.',
      'Ce à quoi les débats parlementaires de 2020 ont surtout donné une existence juridique, c’est la possibilité, pour une victime de discrimination à l’accent, de porter plainte sur ce fondement précis — un droit dont l’effectivité concrète reste toutefois discutée, faute de jurisprudence abondante à ce jour. La norme dont on se réclame en entretien d’embauche, la variété que l’on moque en cour de récréation, le registre auquel on renonce par prudence : ce sont là autant de situations ordinaires auxquelles le vote de 2020 n’apporte, à lui seul, aucune réponse automatique, mais qu’il rend désormais nommables autrement que comme de simples préférences esthétiques.',
      'Plusieurs établissements scolaires ont ainsi commencé à rédiger des chartes linguistiques explicites : corriger ce qui gêne réellement la compréhension, expliquer clairement les attentes de registre selon le contexte, et ne jamais utiliser la norme comme prétexte à l’humiliation. Un tel texte ne résout évidemment pas tous les rapports de pouvoir liés à la langue. Il rend toutefois visible ce à quoi chaque établissement peut contribuer : créer un espace où apprendre une forme nouvelle n’exige pas de mépriser celles que l’on possède déjà.'
    ],
    vocabulary: [
      ['une norme linguistique', 'una norma lingüística', 'La norme linguistique varie selon les contextes.'],
      ['une variété', 'una variedad lingüística', 'Chaque variété possède ses propres régularités.'],
      ['la légitimité', 'la legitimidad', 'Son accent ne diminue pas sa légitimité.'],
      ['stigmatiser', 'estigmatizar', 'Certaines prononciations sont injustement stigmatisées.'],
      ['un registre', 'un registro', 'Elle adapte son registre à la situation.'],
      ['en connaissance de cause', 'con conocimiento de causa', 'Elle choisit en connaissance de cause.'],
      ['un écart', 'una desviación/diferencia', 'Un écart à la norme n’empêche pas la compréhension.'],
      ['un prétexte', 'un pretexto', 'La correction ne doit pas devenir un prétexte à l’humiliation.']
    ],
    readingChecks: [
      ['Que reconnaît la loi française votée en 2020 mentionnée dans le texte ?', ['La glottophobie comme forme de discrimination', 'L’interdiction des accents régionaux', 'L’obligation d’un accent unique à l’école', 'La suppression du créole'], 0],
      ['Selon le texte, qu’est-ce qui pose réellement problème dans la correction répétée d’un accent régional ?', ['La prononciation empêche la compréhension mutuelle', 'L’association implicite entre accent et manque de compétence', 'L’accent n’existe pas vraiment', 'Personne ne corrige jamais les accents'], 1],
      ['Quelle distinction établissent les travaux de Médéric Gasquet-Cyrus cités dans le texte ?', ['Accent et grammaire', 'Norme utile à un contexte précis et idée d’une supériorité naturelle infondée', 'Écrit et oral uniquement', 'Français et espagnol'], 1],
      ['Comment le texte redéfinit-il la maîtrise linguistique des locuteurs bilingues ?', ['Effacer toute trace d’une autre langue', 'Pouvoir choisir, en connaissance de cause, le registre adapté à une situation', 'Refuser systématiquement le français standard', 'Imiter tous les accents possibles'], 1],
      ['Que prévoit une charte linguistique scolaire, selon le dernier paragraphe ?', ['Ne jamais corriger un élève', 'Corriger ce qui gêne la compréhension sans humilier', 'Imposer un accent unique à toute la classe', 'Supprimer la notion de registre'], 1]
    ],
    grammarChecks: [
      ['La norme ___ elle se conforme dépend du contexte.', ['à laquelle', 'dont', 'que laquelle', 'où que'], 0],
      ['Voilà ce ___ elle doute.', ['à quoi', 'dont', 'lequel', 'qui de'], 1],
      ['Le contexte dans ___ elle parle est formel.', ['dont', 'lequel', 'que', 'ce quoi'], 1],
      ['Ce ___ elle tient, c’est le respect des voix.', ['à quoi', 'dont à', 'lequel', 'où'], 0],
      ['La variété ___ on se moque peut être parfaitement structurée.', ['dont', 'à laquelle de', 'que de', 'où à'], 0],
      ['Le principe au nom ___ on corrige doit être explicite.', ['duquel', 'dont du', 'lequel de', 'qui'], 0],
      ['Choisis la phrase correcte.', ['C’est ce dont nous avons besoin.', 'C’est ce que nous avons besoin.', 'C’est ce auquel nous avons besoin.', 'C’est dont nous besoin.'], 0],
      ['« La situation à laquelle... » remplace...', ['la situation à cette situation', 'la situation dont à', 'la situation que de', 'la situation où de'], 0]
    ]
  },
  {
    slug: 'science-doute-et-esprit-critique',
    title: 'Science, doute et esprit critique',
    titleEs: 'Ciencia, duda y pensamiento crítico',
    readingTitle: 'Ce que signifie ne pas encore savoir',
    description: 'Ce qui distingue l’incertitude scientifique méthodique de la simple ignorance.',
    objective: 'Comprendre la valeur méthodologique du doute et la communication des résultats provisoires.',
    grammar: 'Les modalisateurs de certitude et le subjonctif',
    grammarNote: 'Les modalisateurs calibrent l’engagement du locuteur : « il est établi que » + indicatif ; « il est peu probable que », « rien ne prouve que » + subjonctif. Le choix du mode dépend de la manière dont le fait est présenté, non d’une simple liste mécanique.',
    scenario: 'Une conférence sur la communication scientifique et la gestion publique de l’incertitude.',
    parts: [
      'En mars 2020, l’Organisation mondiale de la santé déconseillait encore le port généralisé du masque en population générale ; six semaines plus tard, elle le recommandait explicitement. Ce revirement, abondamment relayé et critiqué à l’époque, illustre une difficulté que les spécialistes de la communication scientifique connaissent bien : la différence entre deux phrases en apparence proches, « les chercheurs ne savent pas » et « les chercheurs évaluent plusieurs hypothèses en fonction des données disponibles ». Pour un public non spécialiste, elles semblent presque équivalentes ; elles décrivent en réalité des situations radicalement différentes. La première suggère un vide, la seconde un savoir en construction, organisé par des méthodes, des données et des critères de réfutation explicites.',
      'Ce cas des recommandations sanitaires révisées au fil d’une épidémie illustre bien cette difficulté. Lorsque des résultats initiaux sont corrigés après l’arrivée de nouvelles données — ici, la découverte progressive de la transmission par aérosols —, cette révision est parfois utilisée sur les réseaux sociaux comme une preuve que la science se contredirait. Or la capacité de corriger une conclusion constitue précisément une force du processus scientifique : une hypothèse qui ne pourrait jamais être remise en cause relèverait davantage de la croyance que de l’enquête rigoureuse.',
      'Comment, dès lors, communiquer l’incertitude sans affaiblir la confiance du public ? La difficulté est réelle : multiplier les précautions de langage peut rendre un message illisible, tandis qu’une certitude simplifiée à l’excès crée des attentes irréalistes. Les chercheurs en médiation scientifique recommandent généralement de préciser distinctement ce qui est solidement établi, ce qui reste probable et quelles observations futures pourraient modifier l’évaluation actuelle.',
      'Il est établi que le virus se transmettait par gouttelettes ; il était en revanche nettement moins certain, au printemps 2020, que la transmission par aérosols dans des espaces mal ventilés jouât un rôle significatif — une hypothèse que plusieurs équipes de recherche défendaient déjà, sans disposer encore de données suffisamment robustes pour l’affirmer sans réserve. Rien ne prouvait alors qu’elles aient tort ; rien ne permettait non plus de l’affirmer avec la certitude qu’exigerait une recommandation universelle immédiate. C’est précisément cet écart, entre intuition scientifique naissante et preuve consolidée, que la communication publique a le plus grand mal à formuler sans paraître se contredire.',
      'On peut en tirer une définition utile de l’esprit critique : celui-ci ne consiste ni à croire automatiquement une autorité scientifique, ni à rejeter systématiquement toute expertise. Il exige d’examiner la qualité des preuves avancées, les limites explicitement annoncées et la possibilité réelle de révision future. Dire « nous ne savons pas encore » peut alors devenir une information rigoureuse, à condition d’expliquer ce que l’on sait déjà et comment la recherche se poursuit.'
    ],
    vocabulary: [
      ['une hypothèse', 'una hipótesis', 'Une hypothèse doit pouvoir être testée.'],
      ['la réfutation', 'la refutación', 'La réfutation fait partie de la démarche scientifique.'],
      ['provisoire', 'provisional', 'Cette conclusion reste provisoire.'],
      ['une donnée', 'un dato', 'De nouvelles données ont modifié le résultat.'],
      ['une précaution', 'una precaución/matización', 'Le chercheur formule une précaution importante.'],
      ['solidement établi', 'sólidamente establecido', 'Ce mécanisme est solidement établi.'],
      ['une expertise', 'un conocimiento experto', 'L’expertise doit rester ouverte à l’examen.'],
      ['une révision', 'una revisión', 'La révision d’un résultat n’est pas un échec.']
    ],
    readingChecks: [
      ['Quel exemple concret ouvre le texte ?', ['Le revirement de l’OMS sur le port du masque en 2020', 'Une découverte archéologique', 'Un débat sur les vaccins obligatoires', 'Une réforme universitaire'], 0],
      ['Quelle nouvelle donnée a motivé la révision des recommandations, selon le texte ?', ['La découverte progressive de la transmission par aérosols', 'Une pénurie de masques', 'Un changement de gouvernement', 'Une erreur de traduction'], 0],
      ['Comment les réseaux sociaux interprètent-ils souvent ce type de correction scientifique ?', ['Comme une preuve de rigueur', 'Comme une contradiction disqualifiant la science', 'Comme une nouvelle méthode statistique', 'Comme une traduction erronée'], 1],
      ['Pourquoi la capacité de réviser une conclusion est-elle présentée comme une force du processus scientifique ?', ['Elle évite absolument toute erreur', 'Elle permet d’ajuster les conclusions à mesure que les preuves évoluent', 'Elle confirme systématiquement chaque hypothèse initiale', 'Elle supprime tout besoin de données'], 1],
      ['Quelle définition de l’esprit critique conclut le texte ?', ['Refuser systématiquement toute expertise', 'Examiner la qualité des preuves, les limites et la possibilité de révision', 'Croire automatiquement toute autorité scientifique', 'Douter sans aucun critère précis'], 1]
    ],
    grammarChecks: [
      ['Il est établi que les données ___ évolué.', ['ont', 'aient', 'auraient sans preuve', 'évoluent que'], 0],
      ['Il est peu probable que cette hypothèse ___ suffisante.', ['est', 'soit', 'sera', 'était certainement'], 1],
      ['Rien ne prouve que l’étude ___ fausse.', ['est', 'soit', 'sera', 'a été sûrement'], 1],
      ['Il semble que les résultats ___ être révisés.', ['doivent', 'doive', 'devront certainement', 'devaient que'], 0],
      ['Nous savons avec certitude que la méthode ___ documentée.', ['est', 'soit', 'serait peut-être', 'être'], 0],
      ['Le subjonctif présente ici le fait comme...', ['incertain ou évalué', 'nécessairement faux', 'déjà achevé', 'un ordre direct'], 0],
      ['Choisis la formulation la plus prudente.', ['Cette étude prouve tout.', 'Ces résultats suggèrent une tendance qui reste à confirmer.', 'Il est certain sans données.', 'La question est définitivement close.'], 1],
      ['Quelle phrase est correcte ?', ['Il est incontestable que la méthode soit utile.', 'Il est incontestable que la méthode est utile.', 'Il est incontestable la méthode utile.', 'Il est incontestable que méthode être utile.'], 1]
    ]
  },
  {
    slug: 'art-censure-et-liberte',
    title: 'Art, censure et liberté',
    titleEs: 'Arte, censura y libertad',
    readingTitle: 'L’œuvre que personne ne voulait exposer',
    description: 'Une déprogrammation controversée d’exposition interroge liberté artistique et responsabilité.',
    objective: 'Analyser un conflit entre liberté artistique, responsabilité institutionnelle et réception publique.',
    grammar: 'La voix passive, le passif pronominal et faire + infinitif',
    grammarNote: 'Le passif met l’accent sur le résultat ou l’objet : « l’exposition a été annulée ». Le passif pronominal décrit un usage : « cette œuvre se lit à plusieurs niveaux ». Faire + infinitif distingue le commanditaire de l’exécutant : « le musée a fait retirer l’affiche ».',
    scenario: 'Une exposition universitaire est retirée après des plaintes contradictoires.',
    parts: [
      'En novembre 2014, l’installation « Exhibit B » du metteur en scène sud-africain Brett Bailey — une reconstitution de « zoos humains » coloniaux, jouée par des acteurs noirs immobiles dans des vitrines — devait s’ouvrir au théâtre Gérard-Philipe de Saint-Denis. Une pétition rassemblant plus de vingt mille signatures et des manifestations devant le théâtre ont conduit à l’annulation des dernières représentations. Le communiqué de la direction invoquait un risque pour la sécurité, sans jamais trancher sur le fond artistique du débat. Les enquêtes journalistiques menées sur cette affaire ont interrogé la direction, l’artiste et les collectifs antiracistes qui formulaient des critiques opposées : l’un jugeait l’œuvre nécessaire pour affronter la mémoire coloniale, l’autre y voyait une reconstitution déshumanisante rejouant, sans le vouloir, la logique qu’elle prétendait dénoncer.',
      'Brett Bailey expliquait que son installation visait précisément à confronter le public à l’horreur historique des expositions ethnographiques du dix-neuvième siècle, en s’appuyant sur des documents d’archives précis. Plusieurs collectifs de défense des personnes racisées estimaient cependant que rejouer cette violence, même à des fins critiques, sans que les acteurs eux-mêmes n’aient de voix propre sur scène, en reproduisait les effets plutôt qu’elle ne les déconstruisait. Une telle critique ne demandait pas nécessairement l’interdiction pure et simple de l’œuvre ; elle questionnait plutôt la manière dont la souffrance historique d’un groupe devient matériau artistique manié par un créateur extérieur à ce groupe.',
      'Il faut noter que « Exhibit B » avait pourtant été présenté sans incident majeur dans plusieurs villes européennes avant d’arriver à Saint-Denis ; c’est bien le contexte français de cette étape précise — une ville marquée par une forte population issue de l’immigration postcoloniale, et une actualité tendue autour des violences policières — qui a fait basculer la réception de l’œuvre. Une même installation, exposée deux fois, ne se lit donc jamais deux fois de la même manière : le sens d’une œuvre se construit aussi dans la salle, et non seulement sur la scène.',
      'Les directions d’établissements confrontées à ce type de controverse affirment le plus souvent avoir simplement reporté ou déprogrammé un spectacle pour permettre une médiation entre les parties. Il arrive pourtant, comme dans le cas du théâtre Gérard-Philipe, que l’équipe artistique ne reçoive ensuite ni nouveau calendrier ni proposition précise, l’annulation devenant définitive. Le mot « report » semble alors fonctionner comme un adoucissement purement administratif d’une annulation de fait. Il convient malgré tout de ne pas réduire ce type d’affaire à un affrontement entre courageux créateurs et bureaucrates hostiles : les objections éthiques des collectifs antiracistes méritaient une réponse argumentée, mais une décision opaque a empêché justement cette discussion nécessaire.',
      'Une issue régulièrement recommandée par les médiateurs culturels consiste à présenter l’œuvre accompagnée des critiques qu’elle suscite, à documenter l’origine des documents ou témoignages utilisés et à organiser un débat public autour du spectacle lui-même — une option qu’aucune des deux parties n’a pu réellement explorer à Saint-Denis, faute de dialogue institutionnel suffisant. La liberté artistique ne garantit pas l’absence de contestation ; elle suppose que la contestation puisse répondre à l’œuvre sans la faire disparaître silencieusement. Dans plusieurs affaires comparables résolues autrement, le spectacle finalement présenté n’était plus tout à fait le même : il incluait désormais le conflit dont il avait été l’objet.'
    ],
    vocabulary: [
      ['déprogrammer', 'retirar de la programación', 'La direction a déprogrammé l’exposition.'],
      ['une médiation', 'una mediación', 'Une médiation peut organiser le désaccord.'],
      ['un adoucissement', 'un eufemismo/suavización', 'Le mot report constitue un adoucissement.'],
      ['opaque', 'opaco/a', 'La procédure de décision reste opaque.'],
      ['une objection éthique', 'una objeción ética', 'L’association formule une objection éthique.'],
      ['le matériau artistique', 'el material artístico', 'Le témoignage devient matériau artistique.'],
      ['faire disparaître', 'hacer desaparecer', 'Contester ne signifie pas faire disparaître.'],
      ['documenter', 'documentar', 'Le musée doit documenter l’origine des témoignages.']
    ],
    readingChecks: [
      ['Quelle œuvre et quel metteur en scène le texte prend-il comme cas d’étude ?', ['« Exhibit B » de Brett Bailey', 'Une pièce de Patrick Chamoiseau', 'Une exposition sur les retraites', 'Un film documentaire anonyme'], 0],
      ['Quelle justification officielle la direction du théâtre a-t-elle donnée pour l’annulation ?', ['Un problème financier', 'Un risque pour la sécurité', 'Une maladie de l’artiste', 'Un défaut technique du théâtre'], 1],
      ['Que visait, selon l’artiste, l’installation « Exhibit B » ?', ['Célébrer la colonisation', 'Confronter le public à l’horreur historique des expositions ethnographiques', 'Décrire un procès contemporain', 'Illustrer une réforme administrative'], 1],
      ['Quelle nuance porte la critique des collectifs antiracistes envers l’œuvre ?', ['Ils exigent la destruction physique de l’œuvre', 'Ils estiment qu’elle reproduit les effets de la violence qu’elle dénonce', 'Ils nient toute dimension historique', 'Ils refusent toute œuvre politique en général'], 1],
      ['Pourquoi le mot « report » paraît-il suspect dans ce type d’affaire, selon le texte ?', ['Une nouvelle date était déjà fixée', 'Il adoucit une annulation sans calendrier ni proposition concrète', 'Il est grammaticalement incorrect', 'Les artistes l’avaient eux-mêmes choisi'], 1]
    ],
    grammarChecks: [
      ['L’exposition ___ par la direction.', ['a été retirée', 'a retiré', 'est retirer', 's’est retiré par'], 0],
      ['Le musée a fait ___ l’affiche.', ['retirée', 'retirer', 'retirant', 'retire'], 1],
      ['Cette œuvre ___ à plusieurs niveaux.', ['se lit', 'est lire', 'fait lu', 'a lire'], 0],
      ['Les témoignages doivent ___ correctement.', ['être documentés', 'documenter', 'être documenter', 'se documenté'], 0],
      ['Dans « la direction a fait modifier le cartel », qui modifie ?', ['La direction nécessairement', 'Une autre personne à la demande de la direction', 'Le cartel', 'Personne'], 1],
      ['Le passif met ici l’accent sur...', ['l’action subie et son résultat', 'l’auteur uniquement', 'une hypothèse future', 'un ordre'], 0],
      ['Choisis le passif pronominal correct.', ['Ce livre se vend bien.', 'Ce livre est vendre bien.', 'Ce livre se vendu bien.', 'Ce livre fait vend bien.'], 0],
      ['Transformation correcte : « On a reporté l’exposition. »', ['L’exposition a été reportée.', 'L’exposition est reporté par on.', 'L’exposition a reporté.', 'On s’est exposition reportée.'], 0]
    ]
  },
  {
    slug: 'travail-sens-et-epuisement',
    title: 'Travail, sens et épuisement',
    titleEs: 'Trabajo, sentido y agotamiento',
    readingTitle: 'Toujours disponible',
    description: 'Un témoignage sur un stage prestigieux qui interroge la culture de l’urgence en entreprise.',
    objective: 'Comprendre un témoignage professionnel et analyser les mécanismes ordinaires de l’épuisement.',
    grammar: 'Le gérondif, le participe présent et l’adjectif verbal',
    grammarNote: 'Le gérondif exprime une circonstance liée au sujet : « en répondant ». Le participe présent développe une relation : « les messages exigeant une réponse ». L’adjectif verbal qualifie et s’accorde : « une tâche exigeante ». Certaines formes diffèrent : convainquant/convaincant.',
    scenario: 'Un stagiaire dans une agence de traduction internationale est confronté à une culture implicite de la disponibilité permanente.',
    parts: [
      'Un stage commence souvent sous les meilleurs auspices : l’agence travaille avec des institutions internationales, les projets sont stimulants et la tutrice souligne rapidement la qualité des recherches menées par la nouvelle recrue. Pourtant, une habitude s’installe : les messages envoyés tard le soir reçoivent presque toujours une réponse immédiate. Personne n’impose explicitement cette disponibilité, mais chacun semble vouloir prouver son engagement en répondant avant les autres.',
      'La stagiaire se prête au jeu. En consultant son téléphone au réveil, elle anticipe les urgences ; en gardant son ordinateur ouvert pendant le dîner, elle évite d’être prise au dépourvu. Cette organisation lui donne d’abord l’impression de maîtriser son travail. Peu à peu, elle ne distingue plus ce qui est réellement urgent de ce qui a simplement été envoyé avec empressement.',
      'Une collègue expérimentée lui confie avoir frôlé l’épuisement l’année précédente. Elle ne décrit pas un effondrement soudain, mais une accumulation de renoncements minuscules : reporter une promenade, déjeuner devant l’écran, accepter une demande supplémentaire pour ne pas paraître peu coopérative. Le problème, dit-elle, n’est pas seulement individuel. Une équipe qui récompense silencieusement la disponibilité permanente fabrique les comportements qu’elle prétend ensuite regretter.',
      'La stagiaire propose que les messages différés deviennent la règle et que toute urgence soit justifiée. La mesure paraît modeste, mais elle rend visible une norme jusque-là implicite. Le travail conserve son intérêt sans occuper chaque intervalle de la journée. Elle comprend que poser une limite ne signifie pas manquer d’ambition ; cela peut être une manière de préserver la qualité et la durée de son engagement.'
    ],
    vocabulary: [
      ['sous les meilleurs auspices', 'bajo los mejores auspicios', 'Le stage commence sous les meilleurs auspices.'],
      ['être pris au dépourvu', 'ser tomado por sorpresa', 'Elle craint d’être prise au dépourvu.'],
      ['l’empressement', 'el apresuramiento', 'L’empressement ne signifie pas toujours urgence.'],
      ['frôler l’épuisement', 'rozar el agotamiento', 'Sa collègue a frôlé l’épuisement.'],
      ['un renoncement', 'una renuncia', 'Les petits renoncements se sont accumulés.'],
      ['implicite', 'implícito/a', 'La disponibilité était une norme implicite.'],
      ['un message différé', 'un mensaje programado', 'Elle envoie désormais un message différé.'],
      ['préserver', 'preservar', 'Les limites préservent la qualité du travail.']
    ],
    readingChecks: [
      ['Comment la disponibilité permanente s’installe-t-elle ?', ['Par une obligation écrite', 'Par imitation et volonté de prouver son engagement', 'À cause des clients uniquement', 'Par une prime officielle'], 1],
      ['Quelle illusion les habitudes donnent-elles à la stagiaire ?', ['Celle de maîtriser son travail', 'Celle de travailler moins', 'Celle de changer de métier', 'Celle d’éviter les messages'], 0],
      ['Comment la collègue décrit-elle l’épuisement ?', ['Un accident soudain uniquement', 'Une accumulation de petits renoncements', 'Une maladie sans rapport avec le travail', 'Un manque d’ambition'], 1],
      ['Pourquoi le problème est-il collectif ?', ['Les collègues refusent de travailler', 'L’équipe récompense implicitement certains comportements', 'La stagiaire ne sait pas traduire', 'Les clients sont absents'], 1],
      ['Que change la règle des messages différés ?', ['Elle interdit toute communication', 'Elle rend explicite et discutable la norme d’urgence', 'Elle augmente les horaires', 'Elle supprime les projets'], 1],
      ['Quelle idée conclut le texte ?', ['Les limites contredisent l’ambition', 'Les limites peuvent soutenir un engagement durable', 'Tout travail exige une disponibilité totale', 'Il faut quitter l’agence'], 1]
    ],
    grammarChecks: [
      ['___ à tous les messages, elle s’épuise.', ['En répondant', 'Répondante', 'Répondu', 'En répondue'], 0],
      ['Les demandes ___ une réponse immédiate sont rares.', ['exigeantes', 'exigeant', 'en exigeant', 'exigées à'], 1],
      ['C’est une mission particulièrement ___.', ['exigeant', 'exigeante', 'en exigeant', 'exigée de'], 1],
      ['Le gérondif a généralement le même sujet que...', ['la proposition principale', 'le nom précédent uniquement', 'la phrase suivante', 'aucun verbe'], 0],
      ['Sa tutrice, ___ la difficulté, modifie le délai.', ['comprenant', 'comprise', 'en comprise', 'compréhensive de'], 0],
      ['Un argument ___ doit être précis.', ['convainquant', 'convaincant', 'en convaincu', 'convainquée'], 1],
      ['Choisis le participe présent.', ['Une tâche fatigante', 'Les étudiants travaillant le soir', 'En travaillant, elle apprend', 'Une réponse différée'], 1],
      ['Choisis le gérondif.', ['En posant une limite, elle se protège.', 'La limite posée', 'Une limite protectrice', 'Les collègues posant une limite'], 0]
    ]
  },
  {
    slug: 'diplomatie-et-negociation',
    title: 'Diplomatie et négociation',
    titleEs: 'Diplomacia y negociación',
    readingTitle: 'Un accord qui ne satisfait personne',
    description: 'Une simulation diplomatique universitaire où compromis et renoncement se confondent.',
    objective: 'Interpréter les stratégies d’une négociation et les implicites du langage diplomatique.',
    grammar: 'L’atténuation : conditionnel, imparfait de politesse et litote',
    grammarNote: 'Le conditionnel atténue une proposition : « nous souhaiterions ». L’imparfait de politesse crée une distance : « je voulais vous demander ». La litote dit moins pour suggérer davantage : « ce résultat n’est pas négligeable ». Ces formes modulent la relation sans supprimer le désaccord.',
    scenario: 'Une simulation internationale porte sur le partage d’une ressource en eau.',
    parts: [
      'Dans une simulation diplomatique, quatre délégations doivent partager l’eau d’un fleuve fictif. Une participante représente un pays situé en aval, dépendant du débit pour son agriculture. En amont, un autre État souhaite construire un barrage hydroélectrique. Les positions initiales paraissent incompatibles : sécurité énergétique d’un côté, sécurité alimentaire de l’autre.',
      'Les premières interventions sont solennelles et peu productives. Chaque délégation répète ses principes sans préciser ses marges de manœuvre. Une médiatrice demande alors aux participants de distinguer leurs positions publiques de leurs intérêts réels. La déléguée comprend que son pays n’a pas besoin d’empêcher tout barrage ; il a besoin d’un débit minimal prévisible et d’un mécanisme d’alerte en période de sécheresse.',
      'Cette reformulation ouvre un espace. Le pays en amont accepte de partager ses données, mais refuse un contrôle extérieur permanent. Elle propose un comité technique commun dont les décisions seraient rendues publiques. Personne n’obtient exactement ce qu’il demandait. Pourtant, chacun sécurise l’élément qu’il jugeait essentiel. Le compromis n’efface pas le conflit ; il le rend administrable.',
      'Lors du bilan, plusieurs étudiants qualifient l’accord de tiède. La médiatrice répond qu’un texte unanimement enthousiaste serait probablement irréaliste. La réussite se mesure parfois à la capacité de maintenir une coopération entre acteurs qui continuent de diverger. La déléguée retient que le langage diplomatique, lorsqu’il ne sert pas à dissimuler, peut ralentir la confrontation suffisamment pour permettre une décision.'
    ],
    vocabulary: [
      ['en amont', 'río arriba', 'Le barrage est construit en amont.'],
      ['en aval', 'río abajo', 'Les cultures situées en aval dépendent du débit.'],
      ['une marge de manœuvre', 'un margen de maniobra', 'La délégation précise sa marge de manœuvre.'],
      ['un débit', 'un caudal', 'Le traité garantit un débit minimal.'],
      ['un mécanisme d’alerte', 'un mecanismo de alerta', 'Un mécanisme d’alerte sera créé.'],
      ['rendre administrable', 'hacer gestionable', 'Le compromis rend le conflit administrable.'],
      ['un accord tiède', 'un acuerdo tibio', 'Certains critiquent un accord jugé tiède.'],
      ['diverger', 'divergir', 'Les acteurs peuvent coopérer tout en continuant de diverger.']
    ],
    readingChecks: [
      ['Quel conflit structure la négociation ?', ['Énergie en amont et agriculture en aval', 'Tourisme et culture', 'Université et entreprise', 'Langues et médias'], 0],
      ['Pourquoi les premières interventions échouent-elles ?', ['Elles sont trop courtes', 'Elles répètent des positions sans révéler les intérêts', 'La médiatrice est absente', 'Les données sont publiques'], 1],
      ['De quoi le pays de la déléguée a-t-il réellement besoin ?', ['D’interdire tout barrage', 'D’un débit prévisible et d’une alerte', 'De contrôler le pays voisin', 'D’augmenter le prix de l’eau'], 1],
      ['Quelle concession fait le pays en amont ?', ['Abandonner le barrage', 'Partager ses données', 'Accepter un contrôle permanent', 'Financer l’agriculture'], 1],
      ['Comment le texte définit-il le compromis ?', ['La disparition du conflit', 'Une manière de rendre la divergence gérable', 'La victoire d’un camp', 'Un enthousiasme unanime'], 1],
      ['Quel rôle positif le langage diplomatique peut-il jouer ?', ['Éviter toute décision', 'Créer le temps nécessaire à une décision', 'Cacher toutes les informations', 'Supprimer les intérêts'], 1]
    ],
    grammarChecks: [
      ['Nous ___ obtenir un débit minimal.', ['souhaiterions', 'souhaitons impérativement que', 'souhaité', 'souhaiterons hier'], 0],
      ['Je ___ vous demander une précision.', ['voulais', 'veux exigé', 'voudrai hier', 'avais vouloir'], 0],
      ['Ce résultat n’est pas ___ signifie qu’il compte réellement.', ['négligeable', 'certain', 'possible', 'public'], 0],
      ['Le conditionnel atténue...', ['une demande ou une proposition', 'un fait scientifique établi', 'un ordre militaire', 'une date passée'], 0],
      ['Nous ___ envisager un comité commun.', ['pourrions', 'pouvons absolument', 'avions pu demain', 'puissions que'], 0],
      ['« Ce n’est pas idéal » peut constituer...', ['une litote', 'une comparaison', 'un pléonasme', 'une définition'], 0],
      ['Choisis la demande la plus diplomatique.', ['Donnez-nous les données.', 'Nous souhaiterions avoir accès aux données.', 'Vous devez obéir.', 'Les données, maintenant.'], 1],
      ['L’imparfait de politesse exprime surtout...', ['une distance relationnelle', 'une action habituelle obligatoire', 'un futur certain', 'une cause'], 0]
    ]
  },
  {
    slug: 'avenir-incertitude-et-choix',
    title: 'Avenir, incertitude et choix',
    titleEs: 'Futuro, incertidumbre y decisiones',
    readingTitle: 'La proposition de Montréal',
    description: 'Comment décider face à une offre de mobilité internationale sans disposer de toutes les garanties.',
    objective: 'Comprendre une décision complexe où valeurs, risques et temporalités s’opposent.',
    grammar: 'Le futur antérieur et les projections dans le passé',
    grammarNote: 'Le futur antérieur marque l’accomplissement avant un repère futur ou une supposition : « quand elle aura terminé ». Dans un récit au passé, le conditionnel exprime le futur dans le passé : « elle savait qu’elle devrait choisir ». Ces temps structurent les projections complexes.',
    scenario: 'Une étudiante en fin de licence reçoit une proposition de master et de stage à Montréal.',
    parts: [
      'Plus de dix millions de personnes ont participé au programme Erasmus+ depuis sa création en 1987, et chaque année un nombre croissant d’étudiants français en fin de licence reçoivent, par ce biais ou par des accords bilatéraux comme celui qui lie certaines universités françaises à des établissements québécois, des propositions de mobilité internationale — master ou stage — au moment précis où leur réseau amical et professionnel local devient enfin solide. Les conseillers d’orientation universitaire observent que ce type de décision revient fréquemment dans leurs consultations : accepter signifie recommencer ailleurs ; refuser peut fermer une voie qui ne se représentera pas facilement.',
      'Les spécialistes de la prise de décision recommandent souvent de construire un tableau rationnel : coût, contenu des cours, perspectives professionnelles, distance géographique. Un tel tableau, aussi rigoureux soit-il, ne produit pourtant pas toujours de décision claire, car certains éléments ne se comparent pas dans une même unité de mesure. Comment évaluer la proximité d’un cercle amical face à une spécialisation rare ? Comment mesurer un risque dont les conséquences ne seront visibles que plusieurs années plus tard ?',
      'Un biais fréquemment identifié en psychologie de la décision consiste à rechercher une option sans aucune perte. Or tout choix sérieux renonce à quelque chose, même provisoirement. Les chercheurs en sciences de la décision conseillent plutôt de distinguer ce qui est irréversible de ce qui reste révisable. Partir un an à l’étranger ne signifie généralement pas abandonner définitivement un ancrage local ; refuser une offre n’interdit pas nécessairement toute carrière internationale ultérieure. Cette distinction réduit la dramatisation du choix sans le rendre facile pour autant.',
      'Quand elle aura signé les documents d’inscription, quand elle aura annoncé la nouvelle à ses proches, quand le billet d’avion aura été réservé : l’étudiante mesure déjà, avant même d’avoir tranché, tout ce que cette succession d’étapes rendra progressivement plus difficile à défaire. C’est peut-être moins la destination elle-même que cette irréversibilité croissante, accumulée décision après décision, qui rend un tel choix si lourd à porter — et qui explique pourquoi tant d’étudiants, une fois le premier pas franchi, avoueront après coup avoir eu besoin de cette progressivité pour oser réellement partir.',
      'Les témoignages recueillis auprès d’anciens participants à ce type de programme montrent qu’un délai de réflexion, associé à des échanges avec des étudiants ayant vécu une expérience comparable, aide souvent à trancher — non parce que toutes les incertitudes disparaissent, mais parce que l’étudiant sait mieux lesquelles il est prêt à assumer. Quand un tel départ aura été mûrement préparé, il s’accompagne fréquemment d’un sentiment paradoxal, que plusieurs anciens boursiers décrivent avec les mêmes mots : celui de quitter un lieu devenu familier précisément parce qu’on y a appris à ne plus confondre stabilité et immobilité.'
    ],
    vocabulary: [
      ['une voie', 'una vía/camino', 'Cette offre ouvre une voie professionnelle nouvelle.'],
      ['une unité de comparaison', 'una unidad de comparación', 'Tout ne partage pas la même unité de comparaison.'],
      ['irréversible', 'irreversible', 'Elle distingue les décisions irréversibles.'],
      ['révisable', 'revisable', 'Le projet reste révisable après un an.'],
      ['dramatiser', 'dramatizar', 'Cette distinction évite de dramatiser le choix.'],
      ['assumer une incertitude', 'asumir una incertidumbre', 'Elle choisit les incertitudes qu’elle peut assumer.'],
      ['l’immobilité', 'la inmovilidad', 'La stabilité ne signifie pas immobilité.'],
      ['un délai', 'un plazo', 'Elle demande un délai de réflexion.']
    ],
    readingChecks: [
      ['Quel chiffre le texte cite-t-il à propos du programme Erasmus+ ?', ['Plus de dix millions de participants depuis 1987', 'Cent mille bourses par an', 'Un million d’universités partenaires', 'Dix pays participants seulement'], 0],
      ['Pourquoi le tableau rationnel ne suffit-il pas à trancher, selon le texte ?', ['Il manque toujours des chiffres officiels', 'Certaines valeurs, comme les liens amicaux, ne se comparent pas dans la même unité', 'Personne ne sait le remplir correctement', 'Les conseillers d’orientation le détruisent'], 1],
      ['Quel biais de la psychologie de la décision le texte identifie-t-il ?', ['Rechercher une option sans aucune perte', 'Vouloir partir à tout prix', 'Vouloir rester travailler sur place', 'Vouloir consulter uniquement des inconnus'], 0],
      ['Quelle distinction, selon les chercheurs cités, réduit la dramatisation du choix ?', ['Cher et gratuit', 'Irréversible et révisable', 'France et Canada', 'Études et stage'], 1],
      ['Quelle opposition conclut le texte à propos du sentiment ressenti au moment du départ ?', ['Risque et erreur', 'Stabilité et immobilité', 'Travail et repos', 'Langue et technologie'], 1]
    ],
    grammarChecks: [
      ['Quand elle ___ son année, elle partira.', ['aura terminé', 'terminerait', 'avait terminé', 'termine hier'], 0],
      ['Elle savait qu’elle ___ choisir.', ['devra', 'devrait', 'a dû demain', 'doive certainement'], 1],
      ['D’ici septembre, elle ___ tous les étudiants.', ['aura contacté', 'avait contacté', 'contacterait hier', 'contacte autrefois'], 0],
      ['Le futur antérieur exprime...', ['un accomplissement avant un repère futur', 'une habitude passée', 'un ordre présent', 'une concession'], 0],
      ['Elle pensait que le départ ___ difficile.', ['sera', 'serait', 'aura été demain', 'soit'], 1],
      ['Il ___ probablement oublié de répondre.', ['aura', 'aurait hier certain', 'avait demain', 'soit'], 0],
      ['Choisis le futur dans le passé.', ['Elle dit qu’elle partira.', 'Elle disait qu’elle partirait.', 'Elle dira qu’elle partait.', 'Elle a dit qu’elle part.'], 1],
      ['Quelle phrase est correcte ?', ['Quand elle finira, elle aura déjà préparé son dossier.', 'Quand elle aura fini, elle préparerait hier.', 'Quand elle finissait, elle aura partir.', 'Quand elle avait fini demain.'], 0]
    ]
  },
  {
    slug: 'bilan-identite-et-transmission',
    title: 'Bilan, identité et transmission',
    titleEs: 'Balance, identidad y transmisión',
    readingTitle: 'Ce qu’un parcours d’intégration donne à transmettre',
    description: 'Ce que les ateliers d’accueil pour étudiants internationaux choisissent de transmettre.',
    objective: 'Synthétiser un parcours, transmettre une expérience et interroger la position de celui qui conseille.',
    grammar: 'La reprise et la cohésion d’un texte complexe',
    grammarNote: 'Un texte C1 évite la répétition par des reprises nominales, pronominales et conceptuelles : « cette expérience », « un tel déplacement », « ce constat ». Les connecteurs organisent la progression sans devenir mécaniques. Chaque reprise doit avoir un antécédent clair.',
    scenario: 'D’anciens étudiants mobiles transforment leur expérience en ateliers d’accueil sans en faire une recette universelle.',
    parts: [
      'Selon l’agence Campus France, plus de quatre cent mille étudiants internationaux ont été accueillis dans l’enseignement supérieur français lors d’une récente année universitaire — un chiffre en constante progression, qui explique la multiplication, dans de nombreuses universités, d’ateliers animés par d’anciens étudiants mobiles à destination des nouveaux arrivants. Ces intervenants hésitent fréquemment devant le titre proposé par l’administration : « Réussir son intégration ». Le mot réussite suggère un parcours mesurable et presque uniforme, alors que l’expérience de la mobilité internationale est le plus souvent faite d’avancées, de retours en arrière et de liens qui ne se laissent pas réduire à une méthode.',
      'Les ateliers les mieux évalués par les participants s’organisent généralement autour de situations concrètes plutôt que de règles générales. Comment demander de l’aide lorsqu’on ne maîtrise pas les codes implicites d’une institution ? Que faire quand une correction linguistique devient humiliante ? Comment préserver les liens avec son pays d’origine sans vivre uniquement à distance ? Pour chaque situation, plusieurs réponses possibles sont présentées, avec les conditions précises dans lesquelles elles se sont révélées utiles.',
      'Interrogés sur la principale leçon retenue de leur propre parcours, ces intervenants répondent rarement par des termes attendus comme l’autonomie, la persévérance ou l’ouverture. Beaucoup choisissent un terme moins spectaculaire : l’attention. Attention aux mots qui cadrent un débat, aux personnes absentes d’une décision, aux limites que le corps lui-même signale, aux histoires que les documents administratifs ne racontent qu’à moitié.',
      'Ce dernier point revient d’ailleurs dans presque tous les témoignages recueillis par le service d’accueil : un formulaire de demande de titre de séjour, une attestation de logement, une fiche d’inscription pédagogique — ces documents, pourtant rédigés dans une langue neutre et impersonnelle, façonnent en silence l’expérience quotidienne de la mobilité bien plus que les grands discours d’accueil prononcés en amphithéâtre. Les anciens participants insistent ainsi sur un paradoxe qu’ils jugent rarement assez discuté : c’est souvent dans les détails les plus administratifs, et non dans les moments les plus solennels, que se joue le sentiment d’être réellement accueilli.',
      'Cette réponse rassemble des expériences qui semblaient jusque-là séparées, sans transformer un parcours individuel en modèle universel : elle en dégage plutôt une manière de regarder, transmissible sans jamais être prescriptive. Au terme de ce type d’atelier, les nouveaux étudiants repartent généralement sans liste définitive, mais avec des questions qu’ils pourront adapter à leur propre situation, à mesure que celle-ci évoluera au fil des semestres. Transmettre une expérience de mobilité, en définitive, ne consiste pas à faire reproduire son propre chemin aux autres, mais à leur donner des outils pour reconnaître le leur, aussi différent soit-il de celui qu’on a soi-même parcouru.'
    ],
    vocabulary: [
      ['un parcours uniforme', 'un recorrido uniforme', 'Aucun parcours d’intégration n’est uniforme.'],
      ['un retour en arrière', 'un retroceso', 'Un retour en arrière ne signifie pas un échec.'],
      ['un code implicite', 'un código implícito', 'Elle apprend progressivement les codes implicites.'],
      ['dégager une idée', 'extraer una idea', 'L’intervenante dégage une idée de ses expériences.'],
      ['une manière de regarder', 'una manera de mirar', 'Elle transmet une manière de regarder.'],
      ['reproduire un chemin', 'reproducir un camino', 'Il ne faut pas reproduire son chemin chez autrui.'],
      ['un outil d’analyse', 'una herramienta de análisis', 'Chaque question devient un outil d’analyse.'],
      ['un antécédent', 'un antecedente gramatical', 'Le pronom doit avoir un antécédent clair.']
    ],
    readingChecks: [
      ['Quel chiffre Campus France fournit-il en ouverture du texte ?', ['Plus de quatre cent mille étudiants internationaux accueillis en France', 'Dix mille ateliers organisés chaque année', 'Cent universités partenaires', 'Deux millions de diplômés'], 0],
      ['Pourquoi le titre initial de l’atelier, « Réussir son intégration », est-il critiqué dans le texte ?', ['Il est trop long', 'Il suggère un parcours uniforme et mesurable', 'Il est rédigé en espagnol', 'Il exclut les professeurs'], 1],
      ['Comment les ateliers les mieux évalués sont-ils organisés, selon le texte ?', ['Avec des règles générales fixes', 'Autour de situations concrètes et de réponses conditionnelles', 'Avec un examen final', 'Autour de la rédaction d’un CV'], 1],
      ['Pourquoi le mot « attention » revient-il souvent chez ces intervenants interrogés sur leur principale leçon ?', ['Il est plus facile à traduire', 'Il relie des apprentissages issus de plusieurs situations vécues', 'Il résume uniquement la maîtrise de la langue', 'Il évite toute réflexion personnelle'], 1],
      ['Comment la transmission d’une expérience de mobilité est-elle redéfinie à la fin du texte ?', ['Faire imiter son propre chemin aux nouveaux arrivants', 'Donner des outils pour reconnaître son propre chemin', 'Supprimer toute hésitation chez les nouveaux étudiants', 'Garantir formellement leur réussite'], 1]
    ],
    grammarChecks: [
      ['« Cette expérience » reprend...', ['un parcours décrit précédemment', 'un élément futur sans lien', 'aucun antécédent', 'un verbe uniquement'], 0],
      ['Quel démonstratif synthétise un constat précédent ?', ['Ce constat', 'Lequel que', 'Là de', 'Qui constat'], 0],
      ['Choisis la reprise la plus claire.', ['Une ancienne étudiante anime un atelier. Cette rencontre lui permet de transmettre.', 'Une ancienne étudiante anime un atelier. Ça fait ça.', 'Une ancienne étudiante anime un atelier. Elle ceci.', 'Une ancienne étudiante anime un atelier. Lequel sans antécédent.'], 0],
      ['« Un tel déplacement » signifie...', ['un déplacement de cette nature', 'un déplacement très proche', 'n’importe quel verbe', 'un lieu précis'], 0],
      ['Pour éviter une ambiguïté, un pronom doit...', ['avoir un antécédent identifiable', 'être toujours éloigné du nom', 'remplacer plusieurs idées incompatibles', 'ouvrir chaque paragraphe'], 0],
      ['Quel connecteur introduit une reformulation ?', ['Autrement dit', 'Pourtant que', 'Depuis', 'Afin de que'], 0],
      ['Quel connecteur marque une conséquence synthétique ?', ['Dès lors', 'En revanche', 'Certes', 'À supposer que'], 0],
      ['Choisis la progression la plus cohérente.', ['Elle observe plusieurs situations. De ce constat naît une méthode d’attention.', 'Elle observe. Celui-ci sans nom devient.', 'Elle observe plusieurs situations. Pourtant donc parce que.', 'Elle observe et le ceci conclut.'], 0]
    ]
  }
];

const sharedVocabulary = [
  ['mettre en perspective', 'poner en perspectiva', 'Le séminaire permet de mettre le problème en perspective.'],
  ['nuancer', 'matizar', 'Une analyse solide doit nuancer ses conclusions.'],
  ['un enjeu', 'un desafío/asunto clave', 'Cet enjeu dépasse la situation individuelle.'],
  ['rendre compte de', 'dar cuenta de', 'Le rapport cherche à rendre compte de la complexité.']
];

function vocabularyItems(plan) {
  return enrichAdvancedVocabulary([...plan.vocabulary, ...sharedVocabulary].map(([word, translation, example]) => ({
    word, translation, definition: translation, example,
    partOfSpeech: word.includes(' ') ? 'expression' : 'nom ou verbe'
  })), { language: 'french', topic: plan.title.toLowerCase() });
}

function vocabularyExercises(items) {
  return items.map((item, index) => {
    const answer = index % 4;
    const options = [1, 2, 3].map((offset) => items[(index + offset) % items.length].translation);
    options.splice(answer, 0, item.translation);
    return mcq(`Que signifie « ${item.word} » dans cette unité ?`, options, answer);
  });
}

function grammarTest(slug, exercises) {
  const positions = [0, 0, 1, 1, 2, 2, 3, 3];
  let state = [...slug].reduce((hash, character) => ((hash * 31 + character.charCodeAt(0)) >>> 0), 7);
  for (let index = positions.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [positions[index], positions[swapIndex]] = [positions[swapIndex], positions[index]];
  }
  return {
    id: `french-c1-${slug}-grammar-test`,
    passingScore: 70,
    questions: exercises.map((exercise, index) => {
      const options = (exercise.options || []).filter((_, optionIndex) => optionIndex !== exercise.answer);
      const answer = positions[index] ?? exercise.answer;
      options.splice(answer, 0, exercise.options[exercise.answer]);
      return {
      id: `q${index + 1}`,
      type: 'mcq',
      prompt: exercise.prompt,
      options: options.map((text, optionIndex) => ({ id: `o${optionIndex + 1}`, text })),
      correctOptionId: `o${answer + 1}`,
      explanation: exercise.explanation || 'La réponse respecte la structure grammaticale étudiée dans cette unité.',
      difficulty: index < 2 ? 'easy' : index < 6 ? 'medium' : 'hard'
      };
    })
  };
}

function expandedParts(plan) {
  // Each unit's prose now lives entirely in plan.parts (rewritten to be
  // text-specific and voice-distinct per unit), so no generic filler is
  // appended here anymore.
  return [...plan.parts];
}

function buildUnit(plan, offset) {
  const order = offset + 3;
  const vocab = vocabularyItems(plan);
  // Exactly 5 text-specific MCQs per unit, drawn only from plan.readingChecks
  // (no generic/reusable template questions).
  const readingExercises = plan.readingChecks.map(([prompt, options, answer]) => mcq(prompt, options, answer));
  const grammarExercises = plan.grammarChecks.map(([prompt, options, answer]) => mcq(prompt, options, answer));
  return {
    slug: plan.slug,
    title: plan.title,
    titleEs: plan.titleEs,
    description: plan.description,
    order,
    accessTier: 'premium',
    unitOverview: {
      objective: plan.objective,
      outcomes: [
        'comprendre un texte long et conceptuellement dense',
        'identifier les implicites et les nuances argumentatives',
        'réutiliser un lexique précis en contexte',
        'maîtriser une structure grammaticale de niveau C1'
      ],
      grammar: [plan.grammar],
      vocabulary: plan.vocabulary.slice(0, 4).map(([word]) => word),
      scenario: plan.scenario
    },
    activities: {
      reading: activity('reading', {
        title: plan.readingTitle,
        description: plan.description,
        reading: {
          title: plan.readingTitle,
          parts: expandedParts(plan),
          questions: readingExercises.slice(0, 3).map((exercise) => exercise.prompt)
        },
        exercises: readingExercises
      }),
      vocabulary: activity('vocabulary', {
        title: `Le lexique de l’unité : ${plan.title}`,
        description: `Vocabulaire C1 pour analyser ${plan.title.toLowerCase()}.`,
        vocabulary: vocab,
        phrases: usefulExpressions('french', plan.title.toLowerCase()),
        exercises: vocabularyExercises(vocab)
      }),
      grammar: activity('grammar', {
        title: plan.grammar,
        description: `Maîtriser ${plan.grammar.toLowerCase()} dans un contexte argumentatif C1.`,
        grammarNote: plan.grammarNote,
        phrases: [plan.grammar],
        exercises: grammarExercises,
        grammarTest: grammarTest(plan.slug, grammarExercises)
      })
    }
  };
}

const selectedPlans = plans.filter(
  (plan) => !['travail-sens-et-epuisement', 'diplomatie-et-negociation'].includes(plan.slug)
);

module.exports = selectedPlans.map(buildUnit);
