// French C1 units 3-12. These continue Camila's university storyline and
// intentionally expose only Reading, Vocabulary and Grammar, matching the
// scoped C1 course design.

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
    description: 'Camila compare le traitement d’une même réforme universitaire dans différents médias.',
    objective: 'Analyser le cadrage médiatique, les présupposés et la hiérarchie de l’information.',
    grammar: 'La nominalisation et les tournures impersonnelles',
    grammarNote: 'La nominalisation condense une proposition et densifie le registre analytique : « le gouvernement réforme » devient « la réforme gouvernementale ». Les tournures « il ressort que », « il convient de » et « force est de constater que » permettent de structurer une analyse sans effacer la responsabilité des acteurs.',
    scenario: 'Camila prépare une revue de presse sur une réforme des universités.',
    parts: [
      'Lorsque son enseignante demande une revue de presse consacrée à la réforme du financement universitaire, Camila croit d’abord qu’il suffira de résumer trois articles. Elle découvre vite que les faits bruts occupent une place étonnamment réduite. Un quotidien national insiste sur la modernisation promise par le ministère ; un média étudiant décrit surtout la précarisation redoutée ; une chronique économique présente la mesure comme une rationalisation devenue inévitable. Tous citent les mêmes chiffres, mais aucun ne raconte exactement la même histoire.',
      'Camila relève alors les choix lexicaux. Là où le communiqué officiel parle d’« autonomie renforcée », le journal étudiant évoque un « désengagement financier ». Le premier place en ouverture la souplesse administrative accordée aux établissements ; le second commence par le témoignage d’une étudiante qui travaille la nuit. Ce décalage ne prouve pas nécessairement qu’un article ment. Il montre plutôt que sélectionner, ordonner et nommer les faits revient déjà à leur donner une orientation.',
      'Karim lui conseille toutefois de ne pas transformer son analyse en procès d’intention. Les journalistes travaillent sous contraintes, s’adressent à des publics différents et s’appuient sur des lignes éditoriales identifiables. Ce qui importe, selon lui, est de distinguer une perspective assumée d’une manipulation qui dissimule ses procédés. Camila ajoute donc une colonne à son tableau : sources citées, voix absentes, données contextualisées et degré de certitude des affirmations.',
      'Dans sa conclusion, elle refuse de désigner un article comme définitivement neutre. Elle soutient plutôt qu’une lecture informée exige de croiser les récits et d’observer leurs angles morts. Cette prudence ne la conduit pas au relativisme : certains faits restent vérifiables et certaines affirmations sont mieux étayées que d’autres. Elle comprend néanmoins que l’esprit critique ne consiste pas seulement à douter, mais à demander comment une version du réel a été construite.'
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
      ['Pourquoi les trois articles produisent-ils des récits différents ?', ['Ils utilisent des chiffres différents', 'Ils sélectionnent et hiérarchisent différemment les mêmes faits', 'Deux articles sont fictifs', 'Ils traitent de réformes distinctes'], 1],
      ['Quelle opposition lexicale Camila remarque-t-elle ?', ['Autonomie renforcée / désengagement financier', 'Réforme / université', 'Étudiante / ministre', 'Économie / chronique'], 0],
      ['Pourquoi Karim refuse-t-il un procès d’intention ?', ['Il considère tous les médias neutres', 'Une perspective éditoriale ne prouve pas automatiquement une manipulation', 'Il travaille pour le ministère', 'Il refuse toute analyse critique'], 1],
      ['Que place Camila dans son tableau comparatif ?', ['Le prix des journaux', 'Les sources, les voix absentes et le degré de certitude', 'Le nombre de lecteurs seulement', 'La longueur des titres'], 1],
      ['Quelle nuance apparaît dans la conclusion ?', ['Toutes les versions se valent', 'La prudence critique n’empêche pas de vérifier les faits', 'Aucun fait ne peut être établi', 'Un seul média dit toujours la vérité'], 1],
      ['Que signifie « étayées » dans le dernier paragraphe ?', ['Cachées', 'Soutenues par des éléments solides', 'Raccourcies', 'Traduites'], 1]
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
    description: 'Camila évalue un outil de traduction automatique et s’interroge sur ses limites.',
    objective: 'Évaluer une technologie en distinguant efficacité, responsabilité et perte de nuance.',
    grammar: 'La concession avancée : quoique, quand bien même, avoir beau',
    grammarNote: 'La concession met en relation deux faits dont le second résiste au premier : « Quoique l’outil soit rapide, il simplifie le style. » « Quand bien même il progresserait, une révision resterait nécessaire. » « Elle a beau corriger le texte, certaines nuances lui échappent. »',
    scenario: 'Camila doit traduire le témoignage littéraire d’une autrice caribéenne.',
    parts: [
      'Dans le cadre d’un atelier, Camila reçoit un extrait où une autrice caribéenne mêle français standard, créole et souvenirs familiaux. Par curiosité, elle soumet le passage à un outil de traduction automatique. Le résultat est grammaticalement propre, fluide et presque instantané. Pourtant, quelque chose s’est aplati : les hésitations de la narratrice disparaissent, une expression créole devient une formule neutre et l’ironie d’une phrase se transforme en affirmation sérieuse.',
      'Son camarade Hugo défend l’outil en rappelant le temps qu’il fait gagner. Pour des documents répétitifs, des notices ou une première compréhension, son utilité lui paraît incontestable. Camila l’admet volontiers. Ce qu’elle conteste, c’est le glissement qui consiste à confondre une traduction acceptable avec une traduction fidèle à une voix. Une phrase peut transmettre une information correcte tout en modifiant la relation que le texte entretient avec son lecteur.',
      'L’enseignante leur demande alors de comparer trois versions : celle de la machine, celle de Camila et une version collective. Le débat ne porte bientôt plus sur les erreurs évidentes, mais sur des décisions interprétatives. Faut-il conserver le mot créole et ajouter une note ? Reproduire une syntaxe inhabituelle au risque de troubler le lecteur ? Rendre explicite une allusion culturelle que le texte original laisse volontairement implicite ?',
      'Camila conclut que la technologie ne supprime pas la responsabilité du traducteur ; elle la déplace. Plus l’outil produit un texte vraisemblable, plus la vigilance doit porter sur ce qui ne se voit pas immédiatement : le rythme, le sous-entendu et la position de la voix. Quand bien même les systèmes deviendraient plus performants, choisir entre plusieurs fidélités resterait un acte humain, discutable et situé.'
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
      ['Qu’est-ce que la machine fait disparaître ?', ['La grammaire', 'Les hésitations, une expression créole et l’ironie', 'Le sujet du texte', 'Les souvenirs familiaux entiers'], 1],
      ['Sur quel point Hugo défend-il l’outil ?', ['Sa créativité littéraire', 'Le gain de temps', 'Sa connaissance du créole', 'Son absence totale d’erreurs'], 1],
      ['Quelle confusion Camila critique-t-elle ?', ['Traduction et écriture', 'Acceptabilité et fidélité à une voix', 'Français et créole', 'Atelier et examen'], 1],
      ['Pourquoi la version collective est-elle utile ?', ['Elle élimine tout désaccord', 'Elle rend visibles les choix interprétatifs', 'Elle copie la machine', 'Elle raccourcit le texte'], 1],
      ['Comment la technologie déplace-t-elle la responsabilité ?', ['Elle rend le traducteur inutile', 'Elle exige d’examiner des pertes moins visibles', 'Elle interdit les notes', 'Elle choisit une fidélité unique'], 1],
      ['Que signifie « situé » dans ce contexte ?', ['Immobile', 'Dépendant d’un contexte et d’une position', 'Géographiquement proche', 'Automatique'], 1]
    ],
    grammarChecks: [
      ['___ l’outil soit rapide, il simplifie parfois le style.', ['Quoique', 'Parce que', 'Afin que', 'Depuis que'], 0],
      ['Quand bien même la machine ___, une révision resterait nécessaire.', ['progressera', 'progresserait', 'progresse', 'a progressé'], 1],
      ['Camila a beau ___ le résultat, une nuance lui échappe.', ['relit', 'relire', 'relu', 'relisant'], 1],
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
    description: 'Une boîte de lettres familiales oblige Camila à reconsidérer son histoire.',
    objective: 'Interpréter un récit mémoriel où documents, silences et identité se répondent.',
    grammar: 'Les temps du récit et le discours indirect libre',
    grammarNote: 'Le passé simple structure les événements d’un récit soutenu, l’imparfait installe le cadre et le plus-que-parfait marque l’antériorité. Le discours indirect libre rapporte une pensée sans verbe introducteur ni guillemets, en conservant la perspective du personnage.',
    scenario: 'Camila classe des lettres envoyées entre la République dominicaine et la France.',
    parts: [
      'Pendant les vacances, la grand-mère de Camila lui confie une boîte dont le carton a jauni. Elle contient des lettres écrites par une grande-tante partie travailler en France dans les années soixante-dix. La famille avait toujours résumé cette histoire en quelques mots : elle était partie, avait réussi, puis était revenue. Les lettres révèlent un parcours moins linéaire, traversé par la solitude, les emplois précaires et la crainte de décevoir ceux qui attendaient des nouvelles rassurantes.',
      'Camila remarque surtout ce que les lettres taisent. Certaines périodes de plusieurs mois ne laissent aucune trace ; des difficultés sont évoquées puis aussitôt minimisées. Dans une lettre, la grande-tante affirme que « tout va pour le mieux », avant de demander discrètement qu’on lui envoie un remède qu’elle ne peut pas acheter. L’optimisme n’était-il qu’une protection destinée à la famille, ou une manière de se convaincre elle-même de tenir bon ?',
      'Sa grand-mère complète parfois le récit, mais sa mémoire hésite. Elle corrige une date, revient sur un nom, admet qu’à l’époque les adultes ne disaient pas tout aux enfants. Camila comprend que l’archive ne livre pas une vérité intacte : elle conserve des fragments produits dans une situation particulière. Le silence lui-même devient une donnée, à condition de ne pas prétendre le remplir avec certitude.',
      'En numérisant les documents, Camila cesse de chercher une origine simple qui expliquerait qui elle est. Elle découvre plutôt une constellation de départs, d’attachements et de récits révisés. Cette histoire familiale ne lui dicte aucune identité définitive. Elle lui donne des questions plus précises et une responsabilité : transmettre les lettres sans effacer leurs contradictions.'
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
      ['Quelle version familiale les lettres compliquent-elles ?', ['Un départ sans retour', 'Un parcours simple de réussite puis de retour', 'Une histoire universitaire', 'Un conflit politique'], 1],
      ['Quel détail contredit « tout va pour le mieux » ?', ['Une date erronée', 'La demande discrète d’un remède', 'Un changement de nom', 'Une photographie'], 1],
      ['Pourquoi la mémoire de la grand-mère reste-t-elle utile malgré ses hésitations ?', ['Elle remplace les lettres', 'Elle apporte un contexte tout en révélant ses propres limites', 'Elle garantit chaque date', 'Elle supprime les silences'], 1],
      ['Que devient le silence pour Camila ?', ['Une preuve certaine', 'Une donnée à interpréter avec prudence', 'Une erreur à supprimer', 'Un passage inutile'], 1],
      ['Comment sa conception de l’identité évolue-t-elle ?', ['Elle cherche une origine unique', 'Elle accepte une pluralité de récits contradictoires', 'Elle rejette son histoire', 'Elle adopte uniquement le récit officiel'], 1],
      ['Que veut dire « constellation » ici ?', ['Un groupe d’éléments liés sans centre unique', 'Une vérité immuable', 'Une carte géographique', 'Une chronologie exacte'], 0]
    ],
    grammarChecks: [
      ['La grand-mère lui ___ une boîte, puis Camila l’ouvrit.', ['confia', 'confiait toujours', 'avait confié demain', 'confierait'], 0],
      ['La boîte ___ depuis des années dans l’armoire.', ['attendit', 'attendait', 'attendra', 'ait attendu'], 1],
      ['La grande-tante ___ en France avant d’écrire ces lettres.', ['était partie', 'partit demain', 'partait après', 'sera partie'], 0],
      ['« Était-il possible que la famille n’ait rien su ? » relève...', ['du discours indirect libre', 'd’un ordre direct', 'd’une définition', 'd’un dialogue cité'], 0],
      ['Choisis la succession narrative correcte.', ['Elle ouvrait la boîte et trouva les lettres.', 'Elle ouvrit la boîte et trouvait soudain.', 'Elle avait ouvert demain.', 'Elle ouvre jadis.'], 0],
      ['L’imparfait sert principalement à...', ['installer un cadre ou une durée', 'annoncer un événement futur', 'donner un ordre', 'marquer une action ponctuelle achevée'], 0],
      ['Le plus-que-parfait marque...', ['une action antérieure à un autre passé', 'une hypothèse future', 'un fait simultané présent', 'un ordre passé'], 0],
      ['Quelle phrase adopte la perspective intérieure sans guillemets ?', ['Camila pensa : « Je dois comprendre. »', 'Pourquoi avait-on tant simplifié cette histoire ? Camila referma la lettre.', 'Camila dit qu’elle comprenait.', 'La lettre était ancienne.'], 1]
    ]
  },
  {
    slug: 'justice-sociale-et-inegalites',
    title: 'Justice sociale et inégalités',
    titleEs: 'Justicia social y desigualdades',
    readingTitle: 'Le mérite en question',
    description: 'Un séminaire pousse Camila à examiner les limites du discours méritocratique.',
    objective: 'Suivre une argumentation contradictoire et distinguer égalité formelle et équité.',
    grammar: 'Les articulateurs logiques et la réfutation',
    grammarNote: 'Une argumentation C1 articule concession, réfutation et reformulation : « certes..., néanmoins... », « encore faut-il que... », « loin de..., cette mesure... ». Ces structures évitent la juxtaposition d’opinions et rendent explicite le rapport logique entre les propositions.',
    scenario: 'Des étudiants débattent de la sélection et des bourses universitaires.',
    parts: [
      'Le séminaire commence par une affirmation apparemment consensuelle : chacun devrait réussir grâce à son travail. La discussion se tend lorsqu’une étudiante ajoute que les résultats scolaires reflètent aussi les ressources disponibles avant même l’entrée à l’université. Certains disposent d’un logement calme, de temps et de réseaux informés ; d’autres cumulent emploi, transport et démarches administratives.',
      'Thomas redoute qu’insister sur ces écarts ne décourage l’effort individuel. Selon lui, reconnaître le mérite protège les étudiants contre une vision déterministe de leur avenir. Camila comprend cette inquiétude, mais elle remarque que l’argument change de sens lorsqu’il sert à présenter toute difficulté comme un manque de volonté. Valoriser l’effort n’oblige pas à nier les conditions qui le rendent plus ou moins coûteux.',
      'Le groupe examine ensuite un programme de bourses. Son règlement traite tous les candidats de manière identique, mais exige des justificatifs complexes que certaines familles ont du mal à fournir. L’égalité formelle de la procédure produit donc des effets inégaux. Une simplification ciblée constituerait-elle un privilège injuste ou une correction nécessaire ? Le débat révèle que l’équité ne consiste pas forcément à distribuer la même chose à chacun.',
      'Camila conclut que le mérite peut rester une notion utile à condition de ne pas devenir une explication totale. Les parcours résultent d’initiatives personnelles, d’institutions et de circonstances parfois invisibles. Loin d’abolir la responsabilité individuelle, cette lecture la replace dans un cadre plus honnête, où l’on peut demander à la fois ce que chacun fait et ce que la collectivité rend possible.'
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
      ['Quelle limite du mérite est présentée au début ?', ['Il empêche tout travail', 'Les conditions de départ influencent les résultats', 'Il concerne uniquement les bourses', 'Il garantit le logement'], 1],
      ['Que craint Thomas ?', ['La suppression des examens', 'Qu’une analyse des inégalités décourage l’effort', 'La hausse des transports', 'La simplification des dossiers'], 1],
      ['Quelle nuance apporte Camila ?', ['Effort et conditions sociales peuvent être analysés ensemble', 'Toute difficulté vient de la volonté', 'Le mérite est inutile', 'Les circonstances expliquent absolument tout'], 0],
      ['Pourquoi la procédure de bourse pose-t-elle problème ?', ['Elle refuse tous les étudiants', 'Des exigences identiques créent des obstacles différents', 'Elle ne demande aucun document', 'Elle récompense uniquement les notes'], 1],
      ['Comment le texte définit-il implicitement l’équité ?', ['Donner toujours la même chose', 'Adapter les moyens aux obstacles réels', 'Supprimer toute règle', 'Favoriser arbitrairement un groupe'], 1],
      ['Quelle thèse domine la conclusion ?', ['Le mérite suffit à tout expliquer', 'La responsabilité doit être replacée dans ses conditions', 'Les institutions n’ont aucun rôle', 'L’effort individuel est une illusion'], 1]
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
    description: 'Camila participe à une consultation sur la transition écologique du campus.',
    objective: 'Évaluer une politique écologique en identifiant arbitrages, indicateurs et effets indirects.',
    grammar: 'L’hypothèse complexe et le conditionnel passé',
    grammarNote: 'Les hypothèses irréelles du passé utilisent si + plus-que-parfait, puis conditionnel passé : « Si l’université avait isolé les bâtiments, elle aurait réduit sa consommation. » Le conditionnel peut aussi rapporter une information non confirmée.',
    scenario: 'L’université doit réduire sa consommation énergétique sans exclure les étudiants.',
    parts: [
      'L’université annonce un objectif ambitieux : réduire de moitié ses émissions en dix ans. Les premières propositions paraissent simples — baisser le chauffage, limiter les déplacements, fermer certains bâtiments le soir — jusqu’à ce que les étudiants décrivent leurs conséquences concrètes. La bibliothèque tardive accueille ceux qui ne peuvent pas travailler chez eux ; certaines formations exigent des laboratoires énergivores ; les étudiants éloignés dépendent de transports encore peu fréquents.',
      'Camila rejoint un groupe chargé d’étudier les usages plutôt que de défendre une solution unique. Les relevés montrent que deux bâtiments mal isolés consomment davantage que plusieurs résidences réunies. Pourtant, leur rénovation coûte cher et produira des résultats moins visibles qu’une campagne demandant à chacun d’éteindre la lumière. Le groupe s’interroge : privilégier les gestes individuels ne risque-t-il pas de détourner l’attention des décisions structurelles ?',
      'Une association répond qu’opposer comportements et infrastructures serait une erreur. Les habitudes peuvent changer rapidement, tandis que les travaux prennent des années. Encore faut-il que les efforts demandés soient proportionnés et que l’institution publie ses propres progrès. Sans indicateurs transparents, la responsabilité collective devient un slogan qui exige beaucoup des individus sans permettre d’évaluer les décideurs.',
      'Le rapport final combine rénovation prioritaire, horaires adaptés et accompagnement des usages. Camila retient surtout que la sobriété n’est pas une simple réduction uniforme. Elle suppose de distinguer ce qui est superflu de ce qui garantit l’accès aux études. Une politique écologique crédible ne mesure donc pas seulement l’énergie économisée ; elle examine aussi qui supporte le coût de la transition.'
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
      ['Pourquoi fermer la bibliothèque pose-t-il problème ?', ['Elle consomme peu', 'Certains étudiants n’ont pas d’autre lieu de travail', 'Elle accueille des laboratoires', 'Elle est déjà rénovée'], 1],
      ['Que révèlent les relevés ?', ['Les gestes individuels suffisent', 'Deux bâtiments mal isolés consomment énormément', 'Les résidences sont fermées', 'Les transports sont gratuits'], 1],
      ['Quel risque comporte une campagne individuelle ?', ['Accélérer les travaux', 'Masquer les responsabilités structurelles', 'Publier trop d’indicateurs', 'Réduire les émissions'], 1],
      ['Quelle position adopte l’association ?', ['Il faut choisir entre individus et infrastructures', 'Les deux niveaux sont nécessaires', 'Les habitudes ne changent jamais', 'Les travaux sont inutiles'], 1],
      ['Pourquoi les indicateurs sont-ils importants ?', ['Pour supprimer les objectifs', 'Pour rendre les décideurs évaluables', 'Pour fermer les bâtiments', 'Pour augmenter les coûts'], 1],
      ['Quelle conception de la sobriété conclut le texte ?', ['Une réduction identique pour tous', 'Une réduction attentive aux besoins et à la justice', 'Un slogan sans mesure', 'Une rénovation sans changement d’usage'], 1]
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
    description: 'Camila observe comment les normes linguistiques peuvent inclure ou marginaliser.',
    objective: 'Analyser le rapport entre norme, variation linguistique et légitimité sociale.',
    grammar: 'Les relatives complexes : dont, lequel, ce à quoi, ce dont',
    grammarNote: 'Les pronoms relatifs complexes évitent les répétitions et précisent les rapports syntaxiques : « la norme à laquelle on se conforme », « ce dont elle doute », « le contexte dans lequel elle parle ». Le choix dépend de la préposition exigée.',
    scenario: 'Un atelier examine les accents et la légitimité linguistique.',
    parts: [
      'Lors d’un atelier de phonétique, un étudiant imite plusieurs accents pour faire rire le groupe. La scène semble légère, mais une camarade cesse de participer. Elle explique ensuite que son accent régional a souvent été corrigé dans des situations où personne ne remettait réellement en cause la compréhension. Ce n’était pas seulement sa prononciation qu’on évaluait : on associait sa manière de parler à un manque de sérieux.',
      'L’enseignante distingue alors la norme utile à certains contextes de l’idée qu’une seule variété serait naturellement supérieure. Une convention peut faciliter la rédaction administrative ou l’enseignement ; elle devient problématique lorsqu’elle se transforme en mesure générale de l’intelligence. Les accents, les usages populaires et les langues familiales portent des histoires que la correction systématique risque de rendre invisibles.',
      'Camila pense à son propre français. Elle a longtemps cherché à effacer toute trace d’espagnol pour prouver sa compétence. Avec le temps, elle comprend que maîtriser plusieurs registres ne signifie pas renoncer à sa voix. Il s’agit plutôt de pouvoir choisir, en connaissance de cause, la forme adaptée à une situation, sans accepter que les autres réduisent sa valeur à un écart de prononciation.',
      'Le groupe rédige finalement une charte : corriger ce qui gêne la compréhension, expliquer les attentes de registre et ne jamais utiliser la norme comme prétexte à l’humiliation. Le texte ne résout pas tous les rapports de pouvoir. Il rend toutefois visible ce à quoi chacun peut contribuer : créer un espace où apprendre une forme nouvelle n’exige pas de mépriser celles que l’on possède déjà.'
    ],
    vocabulary: [
      ['une norme linguistique', 'una norma lingüística', 'La norme linguistique varie selon les contextes.'],
      ['une variété', 'una variedad lingüística', 'Chaque variété possède ses propres régularités.'],
      ['la légitimité', 'la legitimidad', 'Son accent ne diminue pas sa légitimité.'],
      ['stigmatiser', 'estigmatizar', 'Certaines prononciations sont injustement stigmatisées.'],
      ['un registre', 'un registro', 'Elle adapte son registre à la situation.'],
      ['en connaissance de cause', 'con conocimiento de causa', 'Camila choisit en connaissance de cause.'],
      ['un écart', 'una desviación/diferencia', 'Un écart à la norme n’empêche pas la compréhension.'],
      ['un prétexte', 'un pretexto', 'La correction ne doit pas devenir un prétexte à l’humiliation.']
    ],
    readingChecks: [
      ['Pourquoi la camarade cesse-t-elle de participer ?', ['Elle ne comprend pas le cours', 'L’imitation réactive une expérience de stigmatisation', 'Elle refuse la phonétique', 'Elle parle trop bas'], 1],
      ['Quelle distinction fait l’enseignante ?', ['Accent et grammaire', 'Convention contextuelle et supériorité naturelle supposée', 'Écrit et oral uniquement', 'Français et espagnol'], 1],
      ['Quel danger comporte la correction systématique ?', ['Elle améliore tous les textes', 'Elle peut effacer des histoires linguistiques', 'Elle empêche toute norme', 'Elle crée de nouveaux accents'], 1],
      ['Comment Camila redéfinit-elle la maîtrise linguistique ?', ['Effacer son origine', 'Pouvoir choisir entre plusieurs registres', 'Refuser le français standard', 'Imiter tous les accents'], 1],
      ['Que prévoit la charte ?', ['Ne jamais corriger', 'Corriger pour la compréhension sans humilier', 'Imposer un accent unique', 'Supprimer les registres'], 1],
      ['Que signifie « en connaissance de cause » ?', ['Par hasard', 'Avec compréhension des conséquences', 'Sans autorisation', 'Sous la contrainte'], 1]
    ],
    grammarChecks: [
      ['La norme ___ elle se conforme dépend du contexte.', ['à laquelle', 'dont', 'que laquelle', 'où que'], 0],
      ['Voilà ce ___ Camila doute.', ['à quoi', 'dont', 'lequel', 'qui de'], 1],
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
    description: 'Une conférence apprend à Camila à distinguer incertitude scientifique et ignorance.',
    objective: 'Comprendre la valeur méthodologique du doute et la communication des résultats provisoires.',
    grammar: 'Les modalisateurs de certitude et le subjonctif',
    grammarNote: 'Les modalisateurs calibrent l’engagement du locuteur : « il est établi que » + indicatif ; « il est peu probable que », « rien ne prouve que » + subjonctif. Le choix du mode dépend de la manière dont le fait est présenté, non d’une simple liste mécanique.',
    scenario: 'Camila assiste à une conférence sur la communication scientifique.',
    parts: [
      'La conférencière commence par projeter deux phrases : « Les chercheurs ne savent pas » et « Les chercheurs évaluent plusieurs hypothèses ». Pour le public, elles semblent presque équivalentes ; pour elle, elles décrivent des situations radicalement différentes. La première suggère un vide, la seconde un savoir en construction, organisé par des méthodes, des données et des critères de réfutation.',
      'Elle présente une étude dont les résultats initiaux ont été corrigés après l’arrivée de nouvelles données. Sur les réseaux sociaux, cette révision avait été utilisée comme preuve que la science se contredisait. Or, explique-t-elle, la capacité de corriger une conclusion constitue précisément une force du processus scientifique. Une hypothèse qui ne pourrait jamais être remise en cause relèverait davantage de la croyance que de l’enquête.',
      'Camila demande comment communiquer l’incertitude sans affaiblir la confiance. La conférencière reconnaît la difficulté : multiplier les précautions peut rendre un message illisible, tandis qu’une certitude simplifiée crée des attentes irréalistes. Elle recommande de préciser ce qui est solidement établi, ce qui reste probable et quelles observations pourraient modifier l’évaluation.',
      'En sortant, Camila comprend que l’esprit critique ne consiste ni à croire automatiquement une autorité ni à rejeter toute expertise. Il exige d’examiner la qualité des preuves, les limites annoncées et la possibilité réelle de révision. Dire « nous ne savons pas encore » peut alors devenir une information rigoureuse, à condition d’expliquer ce que l’on sait déjà et comment on cherche la suite.'
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
      ['Pourquoi les deux phrases initiales diffèrent-elles ?', ['Elles parlent de disciplines opposées', 'L’une suggère un vide, l’autre un processus structuré', 'L’une est fausse grammaticalement', 'Elles ont exactement le même sens'], 1],
      ['Comment les réseaux sociaux interprètent-ils la correction ?', ['Comme une force', 'Comme une contradiction disqualifiante', 'Comme une nouvelle méthode', 'Comme une traduction'], 1],
      ['Pourquoi la révision est-elle une force ?', ['Elle évite toute erreur', 'Elle permet d’ajuster les conclusions aux preuves', 'Elle confirme chaque hypothèse', 'Elle supprime le doute'], 1],
      ['Quel dilemme pose la communication de l’incertitude ?', ['Précision illisible ou certitude trompeuse', 'Science ou littérature', 'Données ou méthodes', 'Autorité ou université'], 0],
      ['Quelle solution propose la conférencière ?', ['Masquer les limites', 'Distinguer établi, probable et révisable', 'Donner une réponse unique', 'Éviter le public'], 1],
      ['Quelle définition de l’esprit critique conclut le texte ?', ['Refuser toute expertise', 'Examiner preuves, limites et révisabilité', 'Croire uniquement les autorités', 'Douter sans critère'], 1]
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
    description: 'Camila enquête sur la déprogrammation controversée d’une exposition.',
    objective: 'Analyser un conflit entre liberté artistique, responsabilité institutionnelle et réception publique.',
    grammar: 'La voix passive, le passif pronominal et faire + infinitif',
    grammarNote: 'Le passif met l’accent sur le résultat ou l’objet : « l’exposition a été annulée ». Le passif pronominal décrit un usage : « cette œuvre se lit à plusieurs niveaux ». Faire + infinitif distingue le commanditaire de l’exécutant : « le musée a fait retirer l’affiche ».',
    scenario: 'Une exposition universitaire est retirée après des plaintes contradictoires.',
    parts: [
      'Une semaine avant son ouverture, une exposition étudiante consacrée aux frontières est retirée du programme. Le communiqué invoque un risque de conflit, sans préciser quelles œuvres posent problème. Pour son journal universitaire, Camila interroge la direction, les artistes et deux associations qui ont formulé des critiques opposées : l’une juge une installation offensante, l’autre considère son retrait comme une censure.',
      'L’artiste concernée explique que son œuvre reproduit des formulaires administratifs sur lesquels des phrases personnelles ont été brodées. Elle voulait montrer comment une existence complexe se trouve réduite à des cases. Une association estime cependant que l’installation utilise des témoignages de migrants sans leur donner assez de contexte. La critique ne demande pas nécessairement l’interdiction ; elle questionne la manière dont la souffrance d’autrui devient matériau artistique.',
      'La direction affirme avoir reporté l’exposition pour permettre une médiation. Pourtant, les artistes n’ont reçu ni nouveau calendrier ni proposition précise. Le mot « report » semble donc fonctionner comme un adoucissement administratif. Camila refuse malgré tout de réduire l’affaire à un affrontement entre courageux créateurs et bureaucrates hostiles : les objections éthiques méritent une réponse, mais une décision opaque empêche justement cette discussion.',
      'Son article propose une issue : présenter l’œuvre avec les critiques, documenter l’origine des témoignages et organiser un débat public. La liberté artistique ne garantit pas l’absence de contestation ; elle suppose que la contestation puisse répondre à l’œuvre sans la faire disparaître silencieusement. Quelques jours plus tard, la direction accepte une nouvelle date. L’exposition n’est plus tout à fait la même : elle inclut désormais le conflit dont elle a été l’objet.'
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
      ['Quelle justification donne le communiqué ?', ['Un problème financier', 'Un risque de conflit non précisé', 'Une maladie de l’artiste', 'Un défaut technique'], 1],
      ['Que cherche à montrer l’installation ?', ['La beauté des formulaires', 'La réduction des vies à des catégories administratives', 'L’histoire du musée', 'Une technique de broderie'], 1],
      ['Quelle nuance porte la critique associative ?', ['Elle exige clairement la destruction', 'Elle questionne l’usage des témoignages', 'Elle nie l’existence des migrants', 'Elle refuse toute œuvre politique'], 1],
      ['Pourquoi le mot « report » paraît-il suspect ?', ['Une nouvelle date est déjà fixée', 'Il adoucit une annulation sans solution concrète', 'Il est grammaticalement incorrect', 'Les artistes l’ont choisi'], 1],
      ['Quelle fausse opposition Camila évite-t-elle ?', ['Art et broderie', 'Créateurs courageux contre bureaucrates hostiles', 'Étudiants et associations', 'Formulaires et témoignages'], 1],
      ['Quelle solution permet de maintenir le débat ?', ['Retirer définitivement l’œuvre', 'Exposer avec contexte, critiques et discussion publique', 'Ignorer les objections', 'Changer uniquement le titre'], 1]
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
    description: 'Un stage prestigieux conduit Camila à interroger la culture de l’urgence.',
    objective: 'Comprendre un témoignage professionnel et analyser les mécanismes ordinaires de l’épuisement.',
    grammar: 'Le gérondif, le participe présent et l’adjectif verbal',
    grammarNote: 'Le gérondif exprime une circonstance liée au sujet : « en répondant ». Le participe présent développe une relation : « les messages exigeant une réponse ». L’adjectif verbal qualifie et s’accorde : « une tâche exigeante ». Certaines formes diffèrent : convainquant/convaincant.',
    scenario: 'Camila effectue un stage dans une agence de traduction.',
    parts: [
      'Le stage de Camila commence sous les meilleurs auspices. L’agence travaille avec des institutions internationales, les projets sont stimulants et sa tutrice souligne rapidement la qualité de ses recherches. Pourtant, une habitude s’installe : les messages envoyés tard le soir reçoivent presque toujours une réponse immédiate. Personne n’impose explicitement cette disponibilité, mais chacun semble vouloir prouver son engagement en répondant avant les autres.',
      'Camila se prête au jeu. En consultant son téléphone au réveil, elle anticipe les urgences ; en gardant son ordinateur ouvert pendant le dîner, elle évite d’être prise au dépourvu. Cette organisation lui donne d’abord l’impression de maîtriser son travail. Peu à peu, elle ne distingue plus ce qui est réellement urgent de ce qui a simplement été envoyé avec empressement.',
      'Une collègue expérimentée lui confie avoir frôlé l’épuisement l’année précédente. Elle ne décrit pas un effondrement soudain, mais une accumulation de renoncements minuscules : reporter une promenade, déjeuner devant l’écran, accepter une demande supplémentaire pour ne pas paraître peu coopérative. Le problème, dit-elle, n’est pas seulement individuel. Une équipe qui récompense silencieusement la disponibilité permanente fabrique les comportements qu’elle prétend ensuite regretter.',
      'Camila propose que les messages différés deviennent la règle et que toute urgence soit justifiée. La mesure paraît modeste, mais elle rend visible une norme jusque-là implicite. Le travail conserve son intérêt sans occuper chaque intervalle de la journée. Camila comprend que poser une limite ne signifie pas manquer d’ambition ; cela peut être une manière de préserver la qualité et la durée de son engagement.'
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
      ['Quelle illusion les habitudes donnent-elles à Camila ?', ['Celle de maîtriser son travail', 'Celle de travailler moins', 'Celle de changer de métier', 'Celle d’éviter les messages'], 0],
      ['Comment la collègue décrit-elle l’épuisement ?', ['Un accident soudain uniquement', 'Une accumulation de petits renoncements', 'Une maladie sans rapport avec le travail', 'Un manque d’ambition'], 1],
      ['Pourquoi le problème est-il collectif ?', ['Les collègues refusent de travailler', 'L’équipe récompense implicitement certains comportements', 'Camila ne sait pas traduire', 'Les clients sont absents'], 1],
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
    description: 'Camila participe à une simulation où compromis et renoncement se confondent.',
    objective: 'Interpréter les stratégies d’une négociation et les implicites du langage diplomatique.',
    grammar: 'L’atténuation : conditionnel, imparfait de politesse et litote',
    grammarNote: 'Le conditionnel atténue une proposition : « nous souhaiterions ». L’imparfait de politesse crée une distance : « je voulais vous demander ». La litote dit moins pour suggérer davantage : « ce résultat n’est pas négligeable ». Ces formes modulent la relation sans supprimer le désaccord.',
    scenario: 'Une simulation internationale porte sur le partage d’une ressource en eau.',
    parts: [
      'Dans une simulation diplomatique, quatre délégations doivent partager l’eau d’un fleuve fictif. Camila représente un pays situé en aval, dépendant du débit pour son agriculture. En amont, un autre État souhaite construire un barrage hydroélectrique. Les positions initiales paraissent incompatibles : sécurité énergétique d’un côté, sécurité alimentaire de l’autre.',
      'Les premières interventions sont solennelles et peu productives. Chaque délégation répète ses principes sans préciser ses marges de manœuvre. Une médiatrice demande alors aux participants de distinguer leurs positions publiques de leurs intérêts réels. Camila comprend que son pays n’a pas besoin d’empêcher tout barrage ; il a besoin d’un débit minimal prévisible et d’un mécanisme d’alerte en période de sécheresse.',
      'Cette reformulation ouvre un espace. Le pays en amont accepte de partager ses données, mais refuse un contrôle extérieur permanent. Camila propose un comité technique commun dont les décisions seraient rendues publiques. Personne n’obtient exactement ce qu’il demandait. Pourtant, chacun sécurise l’élément qu’il jugeait essentiel. Le compromis n’efface pas le conflit ; il le rend administrable.',
      'Lors du bilan, plusieurs étudiants qualifient l’accord de tiède. La médiatrice répond qu’un texte unanimement enthousiaste serait probablement irréaliste. La réussite se mesure parfois à la capacité de maintenir une coopération entre acteurs qui continuent de diverger. Camila retient que le langage diplomatique, lorsqu’il ne sert pas à dissimuler, peut ralentir la confrontation suffisamment pour permettre une décision.'
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
      ['De quoi le pays de Camila a-t-il réellement besoin ?', ['D’interdire tout barrage', 'D’un débit prévisible et d’une alerte', 'De contrôler le pays voisin', 'D’augmenter le prix de l’eau'], 1],
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
    description: 'Une offre inattendue oblige Camila à choisir sans disposer de toutes les garanties.',
    objective: 'Comprendre une décision complexe où valeurs, risques et temporalités s’opposent.',
    grammar: 'Le futur antérieur et les projections dans le passé',
    grammarNote: 'Le futur antérieur marque l’accomplissement avant un repère futur ou une supposition : « quand elle aura terminé ». Dans un récit au passé, le conditionnel exprime le futur dans le passé : « elle savait qu’elle devrait choisir ». Ces temps structurent les projections complexes.',
    scenario: 'Camila reçoit une proposition de master et de stage à Montréal.',
    parts: [
      'À quelques semaines de la fin de l’année, Camila reçoit une proposition de Montréal : un master orienté vers les technologies linguistiques, accompagné d’un stage. L’offre correspond à plusieurs de ses intérêts, mais elle arrive au moment où son réseau à Tours devient enfin solide. Accepter signifierait recommencer ailleurs ; refuser pourrait fermer une voie qu’elle ne retrouvera pas facilement.',
      'Elle construit d’abord un tableau rationnel : coût, contenu des cours, perspectives professionnelles, distance. Les colonnes se remplissent sans produire de décision. Certains éléments ne se comparent pas dans une même unité : comment mesurer la proximité de ses amis face à une spécialisation rare ? Comment évaluer un risque dont les conséquences ne seront visibles que plusieurs années plus tard ?',
      'Karim lui fait remarquer qu’elle cherche une option sans perte. Or tout choix sérieux renonce à quelque chose, même provisoirement. Il lui conseille de distinguer l’irréversible du révisable. Partir un an ne signifie pas abandonner définitivement Tours ; refuser cette offre n’interdit pas toute carrière internationale. Cette distinction réduit la dramatisation sans rendre la décision facile.',
      'Camila demande un délai et contacte d’anciens étudiants du programme. Elle finit par accepter, non parce que toutes ses incertitudes ont disparu, mais parce qu’elle sait mieux lesquelles elle est prête à assumer. Quand elle aura terminé son année à Tours, elle partira avec le sentiment paradoxal de quitter un lieu devenu familier précisément parce qu’elle y a appris à ne plus confondre stabilité et immobilité.'
    ],
    vocabulary: [
      ['une voie', 'una vía/camino', 'Cette offre ouvre une voie professionnelle nouvelle.'],
      ['une unité de comparaison', 'una unidad de comparación', 'Tout ne partage pas la même unité de comparaison.'],
      ['irréversible', 'irreversible', 'Elle distingue les décisions irréversibles.'],
      ['révisable', 'revisable', 'Le projet reste révisable après un an.'],
      ['dramatiser', 'dramatizar', 'Cette distinction évite de dramatiser le choix.'],
      ['assumer une incertitude', 'asumir una incertidumbre', 'Elle choisit les incertitudes qu’elle peut assumer.'],
      ['l’immobilité', 'la inmovilidad', 'La stabilité ne signifie pas immobilité.'],
      ['un délai', 'un plazo', 'Camila demande un délai de réflexion.']
    ],
    readingChecks: [
      ['Pourquoi l’offre est-elle difficile à accepter ?', ['Le programme ne l’intéresse pas', 'Elle implique de quitter un réseau enfin solide', 'Le stage est annulé', 'Montréal est proche de Tours'], 1],
      ['Pourquoi le tableau rationnel ne suffit-il pas ?', ['Il manque des chiffres', 'Certaines valeurs ne sont pas directement comparables', 'Camila ne sait pas lire', 'Karim le détruit'], 1],
      ['Quelle illusion Karim identifie-t-il ?', ['Vouloir une option sans aucune perte', 'Vouloir partir', 'Vouloir travailler', 'Vouloir consulter des étudiants'], 0],
      ['Quelle distinction réduit la dramatisation ?', ['Cher et gratuit', 'Irréversible et révisable', 'France et Canada', 'Études et stage'], 1],
      ['Pourquoi Camila accepte-t-elle finalement ?', ['Toute incertitude a disparu', 'Elle sait quelles incertitudes elle accepte', 'Ses amis l’obligent', 'Tours ne lui plaît plus'], 1],
      ['Quelle opposition conclut le texte ?', ['Risque et erreur', 'Stabilité et immobilité', 'Travail et repos', 'Langue et technologie'], 1]
    ],
    grammarChecks: [
      ['Quand elle ___ son année, elle partira.', ['aura terminé', 'terminerait', 'avait terminé', 'termine hier'], 0],
      ['Elle savait qu’elle ___ choisir.', ['devra', 'devrait', 'a dû demain', 'doive certainement'], 1],
      ['D’ici septembre, elle ___ tous les étudiants.', ['aura contacté', 'avait contacté', 'contacterait hier', 'contacte autrefois'], 0],
      ['Le futur antérieur exprime...', ['un accomplissement avant un repère futur', 'une habitude passée', 'un ordre présent', 'une concession'], 0],
      ['Camila pensait que le départ ___ difficile.', ['sera', 'serait', 'aura été demain', 'soit'], 1],
      ['Il ___ probablement oublié de répondre.', ['aura', 'aurait hier certain', 'avait demain', 'soit'], 0],
      ['Choisis le futur dans le passé.', ['Elle dit qu’elle partira.', 'Elle disait qu’elle partirait.', 'Elle dira qu’elle partait.', 'Elle a dit qu’elle part.'], 1],
      ['Quelle phrase est correcte ?', ['Quand elle finira, elle aura déjà préparé son dossier.', 'Quand elle aura fini, elle préparerait hier.', 'Quand elle finissait, elle aura partir.', 'Quand elle avait fini demain.'], 0]
    ]
  },
  {
    slug: 'bilan-identite-et-transmission',
    title: 'Bilan, identité et transmission',
    titleEs: 'Balance, identidad y transmisión',
    readingTitle: 'Ce que Camila choisit de transmettre',
    description: 'Avant son départ, Camila prépare un atelier pour les nouveaux étudiants internationaux.',
    objective: 'Synthétiser un parcours, transmettre une expérience et interroger la position de celui qui conseille.',
    grammar: 'La reprise et la cohésion d’un texte complexe',
    grammarNote: 'Un texte C1 évite la répétition par des reprises nominales, pronominales et conceptuelles : « cette expérience », « un tel déplacement », « ce constat ». Les connecteurs organisent la progression sans devenir mécaniques. Chaque reprise doit avoir un antécédent clair.',
    scenario: 'Camila transforme son expérience en atelier sans en faire une recette universelle.',
    parts: [
      'Avant de quitter Tours, Camila accepte d’animer un atelier destiné aux étudiants internationaux. On lui demande des conseils pratiques, mais elle hésite devant le titre proposé : « Réussir son intégration ». Le mot réussite suggère un parcours mesurable et presque uniforme, alors que son expérience a été faite d’avancées, de retours en arrière et de liens qui ne se laissent pas réduire à une méthode.',
      'Elle construit donc l’atelier autour de situations plutôt que de règles. Comment demander de l’aide lorsqu’on ne maîtrise pas les codes ? Que faire quand une correction linguistique devient humiliante ? Comment préserver les liens avec son pays sans vivre uniquement à distance ? À chaque fois, elle présente plusieurs réponses possibles et précise les conditions dans lesquelles elles lui ont été utiles.',
      'Un étudiant lui demande finalement quelle est la principale leçon de son parcours. Camila pourrait répondre l’autonomie, la persévérance ou l’ouverture. Elle choisit un terme moins spectaculaire : l’attention. Attention aux mots qui cadrent un débat, aux personnes absentes d’une décision, aux limites que le corps signale, aux histoires que les documents ne racontent qu’à moitié.',
      'Cette réponse rassemble des expériences qui lui semblaient jusque-là séparées. Elle ne transforme pas son parcours en modèle ; elle en dégage une manière de regarder. Au terme de l’atelier, les étudiants repartent sans liste définitive, mais avec des questions qu’ils pourront adapter à leur propre situation. Camila comprend alors que transmettre ne consiste pas à reproduire son chemin chez les autres, mais à leur donner des outils pour reconnaître le leur.'
    ],
    vocabulary: [
      ['un parcours uniforme', 'un recorrido uniforme', 'Aucun parcours d’intégration n’est uniforme.'],
      ['un retour en arrière', 'un retroceso', 'Un retour en arrière ne signifie pas un échec.'],
      ['un code implicite', 'un código implícito', 'Elle apprend progressivement les codes implicites.'],
      ['dégager une idée', 'extraer una idea', 'Camila dégage une idée de ses expériences.'],
      ['une manière de regarder', 'una manera de mirar', 'Elle transmet une manière de regarder.'],
      ['reproduire un chemin', 'reproducir un camino', 'Il ne faut pas reproduire son chemin chez autrui.'],
      ['un outil d’analyse', 'una herramienta de análisis', 'Chaque question devient un outil d’analyse.'],
      ['un antécédent', 'un antecedente gramatical', 'Le pronom doit avoir un antécédent clair.']
    ],
    readingChecks: [
      ['Pourquoi Camila critique-t-elle le titre initial ?', ['Il est trop long', 'Il suggère un parcours uniforme et mesurable', 'Il est en espagnol', 'Il exclut les professeurs'], 1],
      ['Comment organise-t-elle l’atelier ?', ['Avec des règles fixes', 'Autour de situations et réponses conditionnelles', 'Avec un examen', 'Autour de son CV'], 1],
      ['Pourquoi choisit-elle le mot « attention » ?', ['Il est plus facile à traduire', 'Il relie ses apprentissages dans plusieurs domaines', 'Il résume uniquement la langue', 'Il évite toute réflexion'], 1],
      ['Que refuse-t-elle de faire de son parcours ?', ['Le raconter', 'Le transformer en modèle universel', 'Le partager', 'Le relier aux documents'], 1],
      ['Avec quoi les étudiants repartent-ils ?', ['Une recette définitive', 'Des questions adaptables', 'Une offre de stage', 'Un manuel de grammaire'], 1],
      ['Comment la transmission est-elle redéfinie ?', ['Faire imiter son chemin', 'Donner des outils pour reconnaître son propre chemin', 'Supprimer les hésitations', 'Garantir la réussite'], 1]
    ],
    grammarChecks: [
      ['« Cette expérience » reprend...', ['un parcours décrit précédemment', 'un élément futur sans lien', 'aucun antécédent', 'un verbe uniquement'], 0],
      ['Quel démonstratif synthétise un constat précédent ?', ['Ce constat', 'Lequel que', 'Là de', 'Qui constat'], 0],
      ['Choisis la reprise la plus claire.', ['Camila anime un atelier. Cette rencontre lui permet de transmettre.', 'Camila anime un atelier. Ça fait ça.', 'Camila anime un atelier. Elle ceci.', 'Camila anime un atelier. Lequel sans antécédent.'], 0],
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
  return [...plan.vocabulary, ...sharedVocabulary].map(([word, translation, example]) => ({
    word, translation, definition: translation, example,
    partOfSpeech: word.includes(' ') ? 'expression' : 'nom ou verbe'
  }));
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
  return {
    id: `french-c1-${slug}-grammar-test`,
    passingScore: 70,
    questions: exercises.map((exercise, index) => ({
      id: `q${index + 1}`,
      type: 'mcq',
      prompt: exercise.prompt,
      options: exercise.options.map((text, optionIndex) => ({ id: `o${optionIndex + 1}`, text })),
      correctOptionId: `o${exercise.answer + 1}`,
      explanation: exercise.explanation || 'La réponse respecte la structure grammaticale étudiée dans cette unité.',
      difficulty: index < 2 ? 'easy' : index < 6 ? 'medium' : 'hard'
    }))
  };
}

function expandedParts(plan) {
  const [term1, term2, term3, term4] = plan.vocabulary.map(([word]) => word);
  const sentenceCase = (value) => value.charAt(0).toLocaleUpperCase('fr-FR') + value.slice(1);
  return [
    ...plan.parts,
    `Pour approfondir la question, le groupe reprend le dossier en distinguant trois niveaux souvent confondus : les faits observables, l’interprétation qu’on en propose et les valeurs au nom desquelles on juge la situation. Cette méthode oblige chacun à préciser ses termes. ${sentenceCase(term1)} ne peut plus servir de formule vague ; ${term2} doit être relié à un exemple, et ${term3} à une conséquence vérifiable. Camila remarque que le désaccord devient plus fécond dès que les participants cessent de défendre une conclusion globale et examinent séparément les prémisses qui la soutiennent. Ils ne parviennent pas toujours au même jugement, mais ils comprennent mieux le point exact où leurs raisonnements se séparent.`,
    `Cette reprise modifie aussi la position de Camila. Elle était entrée dans la discussion avec une intuition forte, qu’elle prenait presque pour une évidence. En confrontant cette intuition aux objections, elle ne l’abandonne pas nécessairement ; elle apprend à en limiter la portée et à reconnaître ce qu’elle ne permet pas d’affirmer. ${sentenceCase(term4)} devient ainsi moins un mot à mémoriser qu’un outil pour penser. À la fin, Camila rédige une synthèse qui conserve les tensions au lieu de les résoudre artificiellement. Cette capacité à articuler des données, des voix et des incertitudes devient peu à peu une méthode de travail.`
  ];
}

function buildUnit(plan, offset) {
  const order = offset + 3;
  const vocab = vocabularyItems(plan);
  const readingExercises = [
    ...plan.readingChecks.map(([prompt, options, answer]) => mcq(prompt, options, answer)),
    mcq(
      'Comment l’argumentation du texte progresse-t-elle ?',
      [
        'Elle juxtapose des faits sans conclusion.',
        'Elle part d’une situation concrète, confronte plusieurs perspectives puis formule une synthèse nuancée.',
        'Elle répète une opinion identique dans chaque paragraphe.',
        'Elle abandonne le sujet après le premier exemple.'
      ],
      1
    ),
    mcq(
      'Quelle compétence de lecture C1 ce texte sollicite-t-il particulièrement ?',
      [
        'Repérer uniquement des dates.',
        'Mémoriser une liste isolée.',
        'Relier les implicites, les objections et les limites d’une conclusion.',
        'Traduire chaque mot sans contexte.'
      ],
      2
    ),
    mcq(
      `Pourquoi l’objectif « ${plan.objective} » exige-t-il une lecture nuancée ?`,
      [
        'Parce qu’une seule phrase donne toute la réponse.',
        'Parce que le texte met en tension plusieurs critères sans les rendre équivalents.',
        'Parce que le texte ne contient aucun argument.',
        'Parce que seule la longueur du texte compte.'
      ],
      1
    ),
    mcq(
      `Quel rôle joue la notion « ${plan.vocabulary[0][0]} » dans le raisonnement ?`,
      [
        'Elle sert de détail décoratif sans rapport avec le sujet.',
        'Elle permet de nommer précisément un mécanisme central du texte.',
        'Elle remplace tous les autres arguments.',
        'Elle indique uniquement le lieu de l’action.'
      ],
      1
    )
  ];
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
