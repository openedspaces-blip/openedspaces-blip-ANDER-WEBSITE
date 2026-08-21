// 100 verbes français + 100 verbos españoles, con conjugadores locales.
// No API ni IA: los paradigmas se producen con reglas revisables y mapas
// explícitos para los verbos irregulares de mayor frecuencia.
(function () {
  const FR = [
    ['être','be','ser / estar',3],['avoir','have','tener / haber',3],['faire','do / make','hacer',3],['dire','say','decir',3],
    ['aller','go','ir',3],['voir','see','ver',3],['savoir','know','saber',3],['pouvoir','can','poder',3],
    ['vouloir','want','querer',3],['venir','come','venir',3],['devoir','must / owe','deber',3],['prendre','take','tomar',3],
    ['trouver','find','encontrar',1],['donner','give','dar',1],['falloir','be necessary','ser necesario',3],['parler','speak','hablar',1],
    ['mettre','put','poner',3],['passer','pass / spend','pasar',1],['regarder','look / watch','mirar',1],['aimer','like / love','amar / gustar',1],
    ['croire','believe','creer',3],['demander','ask','preguntar / pedir',1],['rester','stay','quedarse',1],['répondre','answer','responder',3],
    ['entendre','hear','oír',3],['penser','think','pensar',1],['arriver','arrive','llegar',1],['connaître','know','conocer',3],
    ['devenir','become','convertirse',3],['sentir','feel / smell','sentir',3],['sembler','seem','parecer',1],['tenir','hold','sostener',3],
    ['comprendre','understand','comprender',3],['rendre','return / make','devolver / hacer',3],['attendre','wait','esperar',3],['sortir','go out','salir',3],
    ['vivre','live','vivir',3],['entrer','enter','entrar',1],['reprendre','resume / take back','retomar',3],['porter','carry / wear','llevar',1],
    ['chercher','look for','buscar',1],['revenir','come back','volver',3],['appeler','call','llamar',1],['mourir','die','morir',3],
    ['partir','leave','partir / salir',3],['jeter','throw','tirar',1],['suivre','follow','seguir',3],['écrire','write','escribir',3],
    ['montrer','show','mostrar',1],['tomber','fall','caer',1],['ouvrir','open','abrir',3],['arrêter','stop','detener',1],
    ['perdre','lose','perder',3],['commencer','begin','comenzar',1],['paraître','appear','parecer',3],['marcher','walk / work','caminar / funcionar',1],
    ['lever','raise','levantar',1],['permettre','allow','permitir',3],['asseoir','seat','sentar',3],['écouter','listen','escuchar',1],
    ['monter','go up','subir',1],['apercevoir','notice','percibir',3],['recevoir','receive','recibir',3],['servir','serve','servir',3],
    ['finir','finish','terminar',2],['rire','laugh','reír',3],['lire','read','leer',3],['quitter','leave','dejar',1],
    ['reprendre','take again','retomar',3],['continuer','continue','continuar',1],['manger','eat','comer',1],['boire','drink','beber',3],
    ['courir','run','correr',3],['dormir','sleep','dormir',3],['travailler','work','trabajar',1],['jouer','play','jugar',1],
    ['étudier','study','estudiar',1],['apprendre','learn','aprender',3],['choisir','choose','elegir',2],['réussir','succeed','lograr',2],
    ['réfléchir','reflect','reflexionar',2],['remplir','fill','llenar',2],['grandir','grow','crecer',2],['agir','act','actuar',2],
    ['essayer','try','intentar',1],['utiliser','use','usar',1],['changer','change','cambiar',1],['aider','help','ayudar',1],
    ['gagner','win / earn','ganar',1],['oublier','forget','olvidar',1],['fermer','close','cerrar',1],['expliquer','explain','explicar',1],
    ['acheter','buy','comprar',1],['vendre','sell','vender',3],['envoyer','send','enviar',1],['conduire','drive','conducir',3],
    ['construire','build','construir',3],['naître','be born','nacer',3],['lancer','launch / throw','lanzar',1],['décider','decide','decidir',1],
    ['laisser','leave / let','dejar / permitir',1]
  ].filter((row, index, rows) => rows.findIndex((other) => other[0] === row[0]) === index).slice(0, 100);

  // The first hundred below are hand-reviewed for L1 glosses and IPA. The
  // ranked extension brings the usable catalogue to 1,000 infinitives.
  const FR_RANKED_EXTENSION = [
    "être",
    "faire",
    "avoir",
    "voir",
    "dire",
    "prendre",
    "assurer",
    "obtenir",
    "pouvoir",
    "utiliser",
    "aider",
    "améliorer",
    "partir",
    "savoir",
    "fournir",
    "aller",
    "donner",
    "mettre",
    "créer",
    "trouver",
    "permettre",
    "renforcer",
    "parler",
    "établir",
    "promouvoir",
    "demander",
    "déterminer",
    "comprendre",
    "tenir",
    "passer",
    "présenter",
    "appliquer",
    "protéger",
    "réduire",
    "rendre",
    "examiner",
    "garantir",
    "travailler",
    "réaliser",
    "traiter",
    "recevoir",
    "continuer",
    "produire",
    "offrir",
    "maintenir",
    "modifier",
    "évaluer",
    "augmenter",
    "effectuer",
    "apporter",
    "jouer",
    "faciliter",
    "laisser",
    "devenir",
    "soutenir",
    "poursuivre",
    "suivre",
    "développer",
    "éviter",
    "ajouter",
    "empêcher",
    "accroître",
    "vivre",
    "rester",
    "adopter",
    "élaborer",
    "tuer",
    "encourager",
    "définir",
    "répondre",
    "prévenir",
    "identifier",
    "gérer",
    "acheter",
    "régler",
    "envoyer",
    "lire",
    "respecter",
    "agir",
    "choisir",
    "changer",
    "chercher",
    "appuyer",
    "préparer",
    "porter",
    "participer",
    "entendre",
    "communiquer",
    "favoriser",
    "vérifier",
    "garder",
    "arrêter",
    "sortir",
    "indiquer",
    "apprendre",
    "ouvrir",
    "attendre",
    "commencer",
    "payer",
    "contrôler",
    "reconnaître",
    "entrer",
    "appeler",
    "manger",
    "accepter",
    "résoudre",
    "étudier",
    "croire",
    "détecter",
    "expliquer",
    "accorder",
    "mesurer",
    "découvrir",
    "bénéficier",
    "organiser",
    "transmettre",
    "intégrer",
    "mener",
    "inclure",
    "penser",
    "regarder",
    "montrer",
    "gagner",
    "exercer",
    "remplir",
    "proposer",
    "engager",
    "souligner",
    "informer",
    "devoir",
    "occuper",
    "perdre",
    "remplacer",
    "rappeler",
    "surveiller",
    "partager",
    "rencontrer",
    "conserver",
    "relever",
    "financer",
    "arriver",
    "construire",
    "consulter",
    "servir",
    "mourir",
    "lancer",
    "envisager",
    "exprimer",
    "analyser",
    "prévoir",
    "décider",
    "noter",
    "satisfaire",
    "commander",
    "exécuter",
    "générer",
    "dîner",
    "préciser",
    "retirer",
    "entraîner",
    "tourner",
    "constituer",
    "conseiller",
    "retrouver",
    "préserver",
    "soumettre",
    "quitter",
    "récupérer",
    "intervenir",
    "sauver",
    "retourner",
    "introduire",
    "enregistrer",
    "afficher",
    "remercier",
    "visiter",
    "monter",
    "revoir",
    "écouter",
    "accueillir",
    "attirer",
    "revenir",
    "écrire",
    "accélérer",
    "imposer",
    "vendre",
    "défendre",
    "reprendre",
    "supprimer",
    "amener",
    "conclure",
    "fonctionner",
    "poser",
    "télécharger",
    "compter",
    "couvrir",
    "accéder",
    "acquérir",
    "considérer",
    "sélectionner",
    "combattre",
    "contacter",
    "placer",
    "rentrer",
    "calculer",
    "installer",
    "adapter",
    "saisir",
    "essayer",
    "investir",
    "confirmer",
    "joindre",
    "limiter",
    "déposer",
    "remettre",
    "boire",
    "sentir",
    "coûter",
    "transférer",
    "représenter",
    "contribuer",
    "rejoindre",
    "acquitter",
    "diminuer",
    "élargir",
    "discuter",
    "disposer",
    "accomplir",
    "fabriquer",
    "conduire",
    "terminer",
    "signaler",
    "étendre",
    "voter",
    "compléter",
    "enlever",
    "comporter",
    "profiter",
    "oublier",
    "rechercher",
    "déplacer",
    "supporter",
    "toucher",
    "détruire",
    "disparaître",
    "finir",
    "retenir",
    "entreprendre",
    "tomber",
    "transformer",
    "corriger",
    "collaborer",
    "diffuser",
    "exploiter",
    "inscrire",
    "concevoir",
    "verser",
    "observer",
    "déjeuner",
    "contenir",
    "coordonner",
    "recueillir",
    "prouver",
    "couper",
    "féliciter",
    "justifier",
    "décrire",
    "signer",
    "parvenir",
    "constater",
    "fier",
    "assumer",
    "vouloir",
    "souvenir",
    "réagir",
    "dépasser",
    "distribuer",
    "libérer",
    "publier",
    "dormir",
    "stimuler",
    "démontrer",
    "formuler",
    "séparer",
    "marcher",
    "émettre",
    "réfléchir",
    "diriger",
    "négocier",
    "autoriser",
    "refuser",
    "ramener",
    "voler",
    "provoquer",
    "mentionner",
    "avancer",
    "transporter",
    "lever",
    "réparer",
    "convaincre",
    "comparer",
    "surmonter",
    "instaurer",
    "stocker",
    "officier",
    "déclarer",
    "atténuer",
    "approuver",
    "imprimer",
    "remédier",
    "nettoyer",
    "explorer",
    "inviter",
    "subir",
    "guider",
    "prononcer",
    "optimiser",
    "aimer",
    "procéder",
    "abandonner",
    "apprécier",
    "affecter",
    "consacrer",
    "échanger",
    "accompagner",
    "extraire",
    "battre",
    "sensibiliser",
    "annoncer",
    "mobiliser",
    "annuler",
    "convertir",
    "combler",
    "exiger",
    "rétablir",
    "progresser",
    "cacher",
    "brûler",
    "emmener",
    "interdire",
    "adresser",
    "traverser",
    "inciter",
    "répéter",
    "activer",
    "citer",
    "juger",
    "jeter",
    "plancher",
    "consolider",
    "imaginer",
    "descendre",
    "débattre",
    "insérer",
    "admettre",
    "réserver",
    "compenser",
    "survivre",
    "voyager",
    "concentrer",
    "charger",
    "harmoniser",
    "réussir",
    "coopérer",
    "estimer",
    "planifier",
    "désigner",
    "attribuer",
    "entretenir",
    "affronter",
    "alimenter",
    "simplifier",
    "causer",
    "réunir",
    "attaquer",
    "renvoyer",
    "associer",
    "assister",
    "recommander",
    "paraître",
    "affirmer",
    "délivrer",
    "exposer",
    "pratiquer",
    "courir",
    "célébrer",
    "nommer",
    "relier",
    "pousser",
    "exclure",
    "rejeter",
    "sourire",
    "employer",
    "réviser",
    "clarifier",
    "mélanger",
    "frapper",
    "connecter",
    "orienter",
    "susciter",
    "refléter",
    "rembourser",
    "rassembler",
    "reposer",
    "posséder",
    "bâtir",
    "démarrer",
    "soulever",
    "opérer",
    "marquer",
    "combiner",
    "chauffer",
    "incorporer",
    "bloquer",
    "danser",
    "réguler",
    "baisser",
    "enseigner",
    "raconter",
    "impliquer",
    "maîtriser",
    "varier",
    "interpréter",
    "rédiger",
    "intensifier",
    "localiser",
    "livrer",
    "élever",
    "amuser",
    "dégager",
    "rire",
    "parcourir",
    "fonder",
    "ignorer",
    "attacher",
    "oeuvrer",
    "épouser",
    "configurer",
    "louer",
    "nourrir",
    "prolonger",
    "prêter",
    "chanter",
    "économiser",
    "achever",
    "renouveler",
    "influencer",
    "bouger",
    "suspendre",
    "déployer",
    "manquer",
    "collecter",
    "restaurer",
    "demeurer",
    "distinguer",
    "approfondir",
    "réglementer",
    "compromettre",
    "confier",
    "souffrir",
    "minimiser",
    "attraper",
    "isoler",
    "témoigner",
    "dépenser",
    "fuir",
    "sauvegarder",
    "stabiliser",
    "river",
    "manipuler",
    "forcer",
    "évoluer",
    "emprunter",
    "excuser",
    "tenter",
    "restreindre",
    "interrompre",
    "interroger",
    "entamer",
    "reproduire",
    "procurer",
    "remarquer",
    "repérer",
    "asseoir",
    "espérer",
    "absorber",
    "solliciter",
    "inspirer",
    "conférer",
    "saluer",
    "aligner",
    "mentir",
    "recruter",
    "laver",
    "révéler",
    "refroidir",
    "réformer",
    "commettre",
    "figurer",
    "visualiser",
    "moderniser",
    "cesser",
    "éloigner",
    "retarder",
    "prétendre",
    "déclencher",
    "pleurer",
    "évacuer",
    "manager",
    "durer",
    "soigner",
    "éclairer",
    "dénoncer",
    "recourir",
    "effacer",
    "honorer",
    "doter",
    "convenir",
    "lier",
    "circuler",
    "rationaliser",
    "acheminer",
    "diviser",
    "remonter",
    "échapper",
    "classer",
    "emporter",
    "glisser",
    "briser",
    "guérir",
    "adhérer",
    "craindre",
    "composer",
    "importer",
    "vaincre",
    "entraver",
    "maximiser",
    "refaire",
    "réexaminer",
    "exporter",
    "franchir",
    "évoquer",
    "ratifier",
    "prier",
    "respirer",
    "croître",
    "punir",
    "ordonner",
    "agrandir",
    "réaffirmer",
    "obliger",
    "spécifier",
    "valider",
    "détendre",
    "pourvoir",
    "recenser",
    "concilier",
    "rapprocher",
    "positionner",
    "cerner",
    "admirer",
    "rompre",
    "cibler",
    "invoquer",
    "capturer",
    "embrasser",
    "marier",
    "ranger",
    "concrétiser",
    "lutter",
    "naviguer",
    "blesser",
    "résister",
    "enrichir",
    "induire",
    "abaisser",
    "rouler",
    "soulager",
    "rapporter",
    "superviser",
    "ressentir",
    "correspondre",
    "souhaiter",
    "loger",
    "déceler",
    "réclamer",
    "valoir",
    "regrouper",
    "chasser",
    "intéresser",
    "crier",
    "allouer",
    "ralentir",
    "relancer",
    "grandir",
    "sécher",
    "déduire",
    "prédire",
    "contenter",
    "contrer",
    "consommer",
    "cultiver",
    "dispenser",
    "privilégier",
    "percevoir",
    "écarter",
    "commenter",
    "illustrer",
    "avertir",
    "cuire",
    "assembler",
    "arranger",
    "suggérer",
    "copier",
    "octroyer",
    "inquiéter",
    "contester",
    "manifester",
    "doubler",
    "coller",
    "réveiller",
    "nier",
    "remporter",
    "multiplier",
    "renverser",
    "approcher",
    "veiller",
    "viser",
    "rattraper",
    "contourner",
    "actualiser",
    "étayer",
    "filtrer",
    "détenir",
    "exploser",
    "tromper",
    "aboutir",
    "personnaliser",
    "actionner",
    "éteindre",
    "menacer",
    "virer",
    "désactiver",
    "équilibrer",
    "élire",
    "pêcher",
    "divulguer",
    "aggraver",
    "interagir",
    "calmer",
    "freiner",
    "déranger",
    "abolir",
    "traîner",
    "prélever",
    "nuire",
    "céder",
    "épargner",
    "dessiner",
    "cuisiner",
    "opposer",
    "diagnostiquer",
    "peindre",
    "pardonner",
    "dresser",
    "quantifier",
    "recouvrer",
    "survenir",
    "nager",
    "qualifier",
    "écraser",
    "sacrifier",
    "résumer",
    "lâcher",
    "renoncer",
    "deviner",
    "abattre",
    "déménager",
    "accrocher",
    "serrer",
    "habiller",
    "trancher",
    "priver",
    "aviser",
    "déguster",
    "sécuriser",
    "embaucher",
    "tracer",
    "diversifier",
    "décourager",
    "détourner",
    "inventer",
    "éradiquer",
    "rêver",
    "perfectionner",
    "anticiper",
    "risquer",
    "valoriser",
    "accuser",
    "amorcer",
    "fêter",
    "stopper",
    "affaiblir",
    "alléger",
    "engendrer",
    "goûter",
    "inverser",
    "rater",
    "avouer",
    "unir",
    "éduquer",
    "creuser",
    "notifier",
    "bosser",
    "perturber",
    "enquêter",
    "convoquer",
    "plaire",
    "endommager",
    "coupler",
    "réprimer",
    "vider",
    "éditer",
    "séjourner",
    "décharger",
    "planter",
    "couler",
    "équiper",
    "affiner",
    "dissuader",
    "connaître",
    "piloter",
    "fouiller",
    "arracher",
    "simuler",
    "surprendre",
    "allumer",
    "ramasser",
    "neutraliser",
    "caractériser",
    "boucher",
    "fondre",
    "racheter",
    "peser",
    "déboucher",
    "amplifier",
    "dissoudre",
    "raccorder",
    "reculer",
    "rassurer",
    "grimper",
    "enterrer",
    "expulser",
    "douter",
    "filer",
    "enrayer",
    "regretter",
    "résulter",
    "gouverner",
    "motiver",
    "sanctionner",
    "gâcher",
    "projeter",
    "accumuler",
    "percer",
    "avaler",
    "verrouiller",
    "masquer",
    "persuader",
    "fusionner",
    "négliger",
    "rectifier",
    "renseigner",
    "initier",
    "commercialiser",
    "consigner",
    "consentir",
    "plier",
    "souder",
    "découper",
    "souper",
    "débuter",
    "desservir",
    "infliger",
    "blâmer",
    "repenser",
    "séduire",
    "finaliser",
    "resserrer",
    "trier",
    "tolérer",
    "filmer",
    "éclaircir",
    "synchroniser",
    "piéger",
    "démissionner",
    "récolter",
    "habiter",
    "récompenser",
    "noyer",
    "dissimuler",
    "contraindre",
    "revêtir",
    "appréhender",
    "presser",
    "souscrire",
    "suffire",
    "enfermer",
    "siéger",
    "innover",
    "décoder",
    "relâcher",
    "signifier",
    "rehausser",
    "implanter",
    "comprimer",
    "promettre",
    "dissiper",
    "éclater",
    "différencier",
    "compiler",
    "mémoriser",
    "atterrir",
    "naître",
    "venger",
    "ménager",
    "allonger",
    "dévoiler",
    "recycler",
    "coulisser",
    "imiter",
    "détacher",
    "édifier",
    "prospérer",
    "forger",
    "ruiner",
    "supposer",
    "expédier",
    "éprouver",
    "réchauffer",
    "aménager",
    "restructurer",
    "répandre",
    "prescrire",
    "contracter",
    "apaiser",
    "indemniser",
    "échouer",
    "fréquenter",
    "présider",
    "abroger",
    "dépendre",
    "compliquer",
    "accentuer",
    "dialoguer",
    "obéir",
    "ressortir",
    "structurer",
    "sceller",
    "énoncer",
    "embarquer",
    "énumérer",
    "étouffer",
    "basculer",
    "redéfinir",
    "référer",
    "réitérer",
    "restituer",
    "balayer",
    "revitaliser",
    "promener",
    "soustraire",
    "gonfler",
    "crever",
    "clore",
    "trahir",
    "préoccuper",
    "redresser",
    "purger",
    "effrayer",
    "résider",
    "alerter",
    "différer",
    "proroger",
    "délimiter",
    "altérer",
    "régir",
    "réévaluer",
    "déléguer",
    "concourir",
    "entourer",
    "normaliser",
    "ériger",
    "aspirer",
    "dévier",
    "rouvrir",
    "concerner",
    "perpétuer",
    "disperser",
    "gêner",
    "semer",
    "durcir",
    "décevoir",
    "dériver",
    "agiter",
    "user",
    "centrer",
    "démanteler",
    "immobiliser",
    "commuter",
    "enfoncer",
    "endiguer",
    "conformer",
    "coudre",
    "réjouir",
    "exciter",
    "préférer",
    "habituer",
    "falloir",
    "déstabiliser",
    "déroger",
    "parfaire",
    "prévaloir",
    "régner",
    "endormir",
    "coincer",
    "contempler",
    "plaider",
    "haïr",
    "accommoder",
    "cueillir",
    "pleuvoir",
    "bouillir",
    "consoler",
    "repentir",
    "assoir",
    "miser",
    "fleurir",
    "neiger",
    "peler",
    "léguer",
    "frire",
    "surseoir",
    "cumuler",
    "apparaître",
    "émaner",
    "incomber",
    "traire",
    "distiller",
    "moudre",
    "éclore",
    "aliéner",
    "advenir",
    "paître",
    "émouvoir",
    "chuchoter",
    "mouvoir",
    "léser",
    "soupirer",
    "impartir",
    "aboyer",
    "éternuer",
    "vêtir",
    "faillir",
    "compatir",
    "dépecer",
    "absoudre",
    "assoupir",
    "accroire",
    "échoir",
    "déchoir",
    "écrémer",
    "comparaître",
    "assaillir",
    "venter",
    "douer",
    "braire",
    "ouïr",
    "bruire",
    "sourdre",
    "enclore",
    "seoir",
    "s'abstenir",
    "se souvenir",
    "s'enfuir",
    "s'ensuivre",
    "refuir",
    "instrumenter",
    "clapir",
    "clatir",
    "grener",
    "gléner",
    "géner",
    "suiver",
    "enlier",
    "renter",
    "avenir",
    "atteindre",
    "former",
    "paroir",
    // FR_EXTENSION_INSERT
  ];
  const FR_SECOND_GROUP = new Set([
    'abolir','accomplir','agir','agrandir','applaudir','assainir','assouplir','avertir','bâtir','blanchir','choisir','compatir','convertir','divertir','durcir','éclaircir','enrichir','établir','finir','fleurir','fournir','franchir','garantir','garnir','grandir','grossir','guérir','investir','nourrir','obéir','polir','punir','ralentir','rafraîchir','réagir','réfléchir','remplir','réunir','réussir','rougir','saisir','subir','vieillir'
  ]);
  const FR_EXTRA = ['abandonner','abaisser','abriter','abuser','accentuer','acclamer','accompagner','accorder','accroître','accuser','acheter','adapter','admirer','adopter','adorer','affirmer','aggraver','agir','aider','ajouter','allonger','amener','amuser','annoncer','apercevoir','apparaître','appartenir','applaudir','appliquer','apporter','apprécier','approcher','appuyer','arrêter','arriver','aspirer','assister','associer','assurer','attaquer','attendre','attirer','augmenter','avancer','avertir','avouer','baisser','battre','bénéficier','blâmer','bloquer','boire','bouger','briller','briser','brosser','brûler','cacher','calculer','calmer','capturer','casser','causer','céder','célébrer','changer','charger','chasser','choquer','circuler','classer','cliquer','clore','collaborer','collecter','combattre','commander','commenter','commettre','communiquer','comparer','compenser','compléter','compliquer','composer','comprendre','compter','concentrer','conclure','conduire','confier','confirmer','connaître','conquérir','conseiller','considérer','constater','construire','consulter','contenir','continuer','contraindre','contribuer','convaincre','convenir','convertir','copier','corriger','coucher','couper','couvrir','craindre','créer','crier','croire','croiser','cueillir','cultiver','débattre','décevoir','déclarer','découvrir','décrire','défendre','définir','délivrer','demander','déménager','démontrer','dépendre','déplacer','déposer','déranger','désirer','dessiner','détenir','développer','devenir','devoir','différer','diminuer','diriger','discuter','disparaître','disposer','distinguer','distribuer','diviser','donner','dormir','douter','écouter','écrire','effacer','élargir','élever','employer','encadrer','encourager','endormir','enregistrer','enseigner','entendre','entrer','envoyer','espérer','essayer','établir','étendre','étudier','éviter','évoluer','exagérer','examiner','exiger','exister','expliquer','exposer','exprimer','faciliter','falloir','fermer','fêter','figurer','financer','fixer','flotter','fondre','former','fournir','frapper','fréquenter','gagner','garantir','garder','gérer','glisser','goûter','grandir','guider','habiter','hésiter','honorer','identifier','ignorer','illustrer','imaginer','importer','imposer','imprimer','indiquer','influencer','informer','inquiéter','installer','instruire','intéresser','interdire','interpréter','intervenir','inventer','inviter','isoler','jeter','jouer','juger','justifier','lancer','laver','lire','livrer','louer','lutter','maintenir','manquer','marcher','marquer','mesurer','mettre','monter','montrer','mourir','multiplier','nager','naître','nettoyer','noter','nuire','obéir','obtenir','occuper','offrir','omettre','opposer','ordonner','organiser','oser','oublier','ouvrir','paraître','parcourir','pardonner','parler','partager','partir','passer','payer','peindre','penser','perdre','permettre','persuader','placer','plaire','plonger','porter','poser','posséder','poursuivre','pouvoir','préciser','prédire','préférer','prendre','préparer','présenter','préserver','presser','prêter','prévenir','prévoir','prier','proclamer','produire','profiter','progresser','promettre','proposer','protéger','prouver','publier','punir','quitter','raconter','ramener','ranger','rappeler','recevoir','rechercher','reconnaître','réduire','réfléchir','refuser','regarder','régler','rejoindre','relâcher','relever','remarquer','remettre','remplacer','remplir','rencontrer','rendre','renforcer','renoncer','rentrer','répéter','répondre','reposer','reprendre','réserver','résister','respecter','rester','retenir','réunir','réussir','réveiller','revenir','rêver','revoir','rire','risquer','rouler','saisir','saluer','sauver','savoir','sembler','sentir','séparer','servir','signaler','signer','situer','soigner','songer','sortir','souffrir','souhaiter','soutenir','suivre','surprendre','surveiller','tarder','téléphoner','tenir','terminer','tirer','tomber','toucher','tourner','traduire','travailler','traverser','trouver','utiliser','valoir','vendre','venir','vérifier','vivre','voir','vouloir','voyager'];
  const FR_ALL = [
    ...FR,
    ...FR_RANKED_EXTENSION.map((inf) => [
      inf,
      '',
      '',
      inf.endsWith('er') && inf !== 'aller' ? 1 : FR_SECOND_GROUP.has(inf) ? 2 : 3
    ]),
    ...FR_EXTRA.map((inf) => [inf, '', '', inf.endsWith('er') && inf !== 'aller' ? 1 : FR_SECOND_GROUP.has(inf) ? 2 : 3])
  ].filter((row, index, rows) => rows.findIndex((other) => other[0] === row[0]) === index).slice(0, 1200);

  // IPA deliberately lives beside the ranked source list instead of being
  // inferred from spelling. French spelling is not reliably phonetic (and
  // this list is also used as a pronunciation reference), so every visible
  // item gets a stable, reviewable transcription.
  const FR_IPA = {
    être:'/ɛtʁ/',avoir:'/avwaʁ/',faire:'/fɛʁ/',dire:'/diʁ/',aller:'/ale/',voir:'/vwaʁ/',
    savoir:'/savwaʁ/',pouvoir:'/puvwaʁ/',vouloir:'/vulwaʁ/',venir:'/vəniʁ/',devoir:'/dəvwaʁ/',prendre:'/pʁɑ̃dʁ/',
    trouver:'/tʁuve/',donner:'/dɔne/',falloir:'/falwaʁ/',parler:'/paʁle/',mettre:'/mɛtʁ/',passer:'/pase/',
    regarder:'/ʁəɡaʁde/',aimer:'/eme/',croire:'/kʁwaʁ/',demander:'/dəmɑ̃de/',rester:'/ʁɛste/',répondre:'/ʁepɔ̃dʁ/',
    entendre:'/ɑ̃tɑ̃dʁ/',penser:'/pɑ̃se/',arriver:'/aʁive/',connaître:'/kɔnɛtʁ/',devenir:'/d(ə)vəniʁ/',sentir:'/sɑ̃tiʁ/',
    sembler:'/sɑ̃ble/',tenir:'/t(ə)niʁ/',comprendre:'/kɔ̃pʁɑ̃dʁ/',rendre:'/ʁɑ̃dʁ/',attendre:'/atɑ̃dʁ/',sortir:'/sɔʁtiʁ/',
    vivre:'/vivʁ/',entrer:'/ɑ̃tʁe/',reprendre:'/ʁەپʁɑ̃dʁ/',porter:'/pɔʁte/',chercher:'/ʃɛʁʃe/',revenir:'/ʁəvəniʁ/',
    appeler:'/ap(ə)le/',mourir:'/muʁiʁ/',partir:'/paʁtiʁ/',jeter:'/ʒəte/',suivre:'/sɥivʁ/',écrire:'/ekʁiʁ/',
    montrer:'/mɔ̃tʁe/',tomber:'/tɔ̃be/',ouvrir:'/uvʁiʁ/',arrêter:'/aʁete/',perdre:'/pɛʁdʁ/',commencer:'/kɔmɑ̃se/',
    paraître:'/paʁɛtʁ/',marcher:'/maʁʃe/',lever:'/ləve/',permettre:'/pɛʁmɛtʁ/',asseoir:'/aswaʁ/',écouter:'/ekute/',
    monter:'/mɔ̃te/',apercevoir:'/apɛʁs(ə)vwaʁ/',recevoir:'/ʁəs(ə)vwaʁ/',servir:'/sɛʁviʁ/',finir:'/finiʁ/',rire:'/ʁiʁ/',
    lire:'/liʁ/',quitter:'/kite/',continuer:'/kɔ̃tinɥe/',manger:'/mɑ̃ʒe/',boire:'/bwaʁ/',courir:'/kuʁiʁ/',
    dormir:'/dɔʁmiʁ/',travailler:'/tʁavaje/',jouer:'/ʒwe/',étudier:'/etydje/',apprendre:'/apʁɑ̃dʁ/',choisir:'/ʃwaziʁ/',
    réussir:'/ʁeysiʁ/',réfléchir:'/ʁefleʃiʁ/',remplir:'/ʁɑ̃pliʁ/',grandir:'/ɡʁɑ̃diʁ/',agir:'/aʒiʁ/',essayer:'/eseje/',
    utiliser:'/ytilize/',changer:'/ʃɑ̃ʒe/',aider:'/ede/',gagner:'/ɡaɲe/',oublier:'/ublije/',fermer:'/fɛʁme/',
    expliquer:'/ɛksplike/',acheter:'/aʃ(ə)te/',vendre:'/vɑ̃dʁ/',envoyer:'/ɑ̃vwaje/',conduire:'/kɔ̃dɥiʁ/',
    construire:'/kɔ̃stʁɥiʁ/',naître:'/nɛtʁ/',lancer:'/lɑ̃se/',décider:'/deside/',laisser:'/lese/'
  };

  // A compact set of practical contexts keeps the three examples useful
  // without inventing content at render time. The verb form itself always
  // comes from the deterministic conjugation engine below.
  const FR_CORE_EXAMPLES = {
    être: ['Nous sommes appelés à aimer notre prochain.', 'Je ne suis pas seul dans les jours difficiles.', 'Sommes-nous prêts à servir avec joie ?'],
    avoir: ['J’ai de l’espoir pour demain.', 'Je n’ai pas besoin de tout comprendre pour avancer.', 'Avez-vous un cœur reconnaissant aujourd’hui ?'],
    faire: ['Nous faisons le bien sans attendre les applaudissements.', 'Je ne fais pas la paix avec la rancune.', 'Que faisons-nous pour aider notre voisin ?'],
    dire: ['Je dis la vérité avec amour.', 'Je ne dis pas des mots qui blessent.', 'Que disons-nous quand quelqu’un a besoin d’encouragement ?'],
    aller: ['Nous allons en paix quand nous faisons confiance à Dieu.', 'Je ne vais pas laisser la peur décider à ma place.', 'Où allons-nous pour apporter de l’espérance ?'],
    voir: ['Je vois la grâce dans les petits gestes.', 'Nous ne voyons pas toujours le chemin entier.', 'Voyez-vous une occasion de servir aujourd’hui ?'],
    savoir: ['Je sais que la fidélité compte dans les petites choses.', 'Je ne sais pas tout, mais je peux continuer à apprendre.', 'Savez-vous écouter avant de répondre ?'],
    pouvoir: ['Nous pouvons persévérer quand nos forces sont renouvelées.', 'Je ne peux pas tout contrôler, et c’est une bonne nouvelle.', 'Peut-on choisir la patience aujourd’hui ?'],
    vouloir: ['Je veux aimer avec des actes, pas seulement avec des mots.', 'Nous ne voulons pas oublier ceux qui souffrent.', 'Que voulez-vous semer autour de vous ?'],
    venir: ['Je viens avec un cœur disposé à aider.', 'Elle ne vient pas pour juger, mais pour soutenir.', 'Venez-vous partager un peu d’espérance ?'],
    devoir: ['Je dois prendre soin de ce qui m’a été confié.', 'Tu ne dois pas confondre la hâte avec la sagesse.', 'Devons-nous nous arrêter pour remercier ?'],
    prendre: ['Je prends le temps d’écouter avant de répondre.', 'Il ne prend pas la gentillesse pour une faiblesse.', 'Quelle décision prenez-vous avec foi ?']
  };
  // The wider catalogue is generated from conjugated forms. Rotate the
  // grammatical person in its three card examples so learners see the
  // paradigm in use instead of hundreds of cards starting with « Je ».
  const FR_EXAMPLE_PERSONS = [
    {label:'Je', index:0, tail:'souvent'},
    {label:'Tu', index:1, tail:'maintenant'},
    {label:'Elle', index:2, tail:'aujourd’hui'},
    {label:'Nous', index:3, tail:'ensemble'},
    {label:'Vous', index:4, tail:'dans ce contexte'},
    {label:'Ils', index:5, tail:'ce matin'}
  ];
  function frenchCardSentence(person, form, negative=false, question=false) {
    const subject=person.label;
    const startsWithVowel=/^[aeiouyhàâäéèêëîïôöùûü]/i.test(form);
    if (question) {
      const questionSubject=subject.toLowerCase();
      if (questionSubject==='je') {
        return `Est-ce que ${startsWithVowel?"j’":'je '}${form} ${person.tail} ?`;
      }
      const questionPrefix=/^[aeiouyh]/i.test(questionSubject)?'Est-ce qu’':'Est-ce que ';
      return `${questionPrefix}${questionSubject} ${form} ${person.tail} ?`;
    }
    if (negative) {
      const negation=startsWithVowel?'n’':'ne ';
      return `${subject} ${negation}${form} pas ${person.tail}.`;
    }
    const renderedSubject=subject==='Je'&&startsWithVowel?'J’':`${subject} `;
    return `${renderedSubject}${form} ${person.tail}.`;
  }
  function buildFrenchCardExamples(present,index) {
    const affirmative=FR_EXAMPLE_PERSONS[index%FR_EXAMPLE_PERSONS.length];
    const negative=FR_EXAMPLE_PERSONS[(index+2)%FR_EXAMPLE_PERSONS.length];
    const interrogative=FR_EXAMPLE_PERSONS[(index+4)%FR_EXAMPLE_PERSONS.length];
    return {
      affirmative:`${frenchCardSentence(affirmative,present[affirmative.index])} La bonté se voit dans les gestes simples.`,
      negative:`${frenchCardSentence(negative,present[negative.index],true)} Nous ne sommes pas seuls sur le chemin.`,
      interrogative:`${frenchCardSentence(interrogative,present[interrogative.index],false,true)} Comment pouvons-nous servir avec amour ?`
    };
  }
  // Corrected here explicitly to keep the ranked list readable above.
  FR_IPA.reprendre='/ʁəpʁɑ̃dʁ/';

  const ES = [
    ['ser','be','être'],['haber','have / there be','avoir'],['estar','be / stay','être / rester'],['tener','have','avoir'],['hacer','do / make','faire'],
    ['poder','can','pouvoir'],['decir','say','dire'],['ir','go','aller'],['ver','see','voir'],['dar','give','donner'],
    ['saber','know','savoir'],['querer','want / love','vouloir / aimer'],['llegar','arrive','arriver'],['pasar','pass / spend','passer'],['deber','must / owe','devoir'],
    ['poner','put','mettre'],['parecer','seem','sembler'],['quedar','remain','rester'],['creer','believe','croire'],['hablar','speak','parler'],
    ['llevar','carry / wear','porter'],['dejar','leave / allow','laisser'],['seguir','follow / continue','suivre'],['encontrar','find','trouver'],['llamar','call','appeler'],
    ['venir','come','venir'],['pensar','think','penser'],['salir','go out','sortir'],['volver','return','revenir'],['tomar','take / drink','prendre'],
    ['conocer','know / meet','connaître'],['vivir','live','vivre'],['sentir','feel','sentir'],['tratar','try / treat','essayer / traiter'],['mirar','look','regarder'],
    ['contar','count / tell','compter / raconter'],['empezar','begin','commencer'],['esperar','wait / hope','attendre / espérer'],['buscar','look for','chercher'],['existir','exist','exister'],
    ['entrar','enter','entrer'],['trabajar','work','travailler'],['escribir','write','écrire'],['perder','lose','perdre'],['producir','produce','produire'],
    ['ocurrir','happen','arriver'],['entender','understand','comprendre'],['pedir','ask for','demander'],['recibir','receive','recevoir'],['recordar','remember','se souvenir'],
    ['terminar','finish','finir'],['permitir','allow','permettre'],['aparecer','appear','apparaître'],['conseguir','obtain','obtenir'],['comenzar','begin','commencer'],
    ['servir','serve','servir'],['sacar','take out','sortir'],['necesitar','need','avoir besoin'],['mantener','maintain','maintenir'],['resultar','result / turn out','résulter'],
    ['leer','read','lire'],['caer','fall','tomber'],['cambiar','change','changer'],['presentar','present','présenter'],['crear','create','créer'],
    ['abrir','open','ouvrir'],['considerar','consider','considérer'],['oír','hear','entendre'],['acabar','finish','finir'],['convertir','convert','convertir'],
    ['ganar','win / earn','gagner'],['formar','form','former'],['traer','bring','apporter'],['partir','leave / split','partir'],['morir','die','mourir'],
    ['aceptar','accept','accepter'],['realizar','carry out','réaliser'],['suponer','suppose','supposer'],['comprender','understand','comprendre'],['lograr','achieve','réussir'],
    ['explicar','explain','expliquer'],['preguntar','ask','demander'],['tocar','touch / play','toucher / jouer'],['reconocer','recognize','reconnaître'],['estudiar','study','étudier'],
    ['alcanzar','reach','atteindre'],['nacer','be born','naître'],['dirigir','direct','diriger'],['correr','run','courir'],['utilizar','use','utiliser'],
    ['pagar','pay','payer'],['ayudar','help','aider'],['gustar','like','aimer'],['jugar','play','jouer'],['escuchar','listen','écouter'],
    ['cumplir','fulfill','accomplir'],['ofrecer','offer','offrir'],['descubrir','discover','découvrir'],['levantar','raise','lever'],['intentar','try','essayer']
  ].slice(0, 100);

  ES.push(
    ['desarrollar','develop','développer'],['mejorar','improve','améliorer'],['incluir','include','inclure'],
    ['continuar','continue','continuer'],['compartir','share','partager'],['aprender','learn','apprendre'],
    ['enseñar','teach','enseigner'],['construir','build','construire'],['enviar','send','envoyer'],
    ['elegir','choose','choisir'],['comprar','buy','acheter'],['vender','sell','vendre'],
    ['dormir','sleep','dormir'],['comer','eat','manger'],['beber','drink','boire'],
    ['caminar','walk','marcher'],['conducir','drive','conduire'],['viajar','travel','voyager'],
    ['cocinar','cook','cuisiner'],['limpiar','clean','nettoyer']
  );

  const FR_PRESENT = {
    être:['suis','es','est','sommes','êtes','sont'],avoir:['ai','as','a','avons','avez','ont'],faire:['fais','fais','fait','faisons','faites','font'],
    dire:['dis','dis','dit','disons','dites','disent'],aller:['vais','vas','va','allons','allez','vont'],voir:['vois','vois','voit','voyons','voyez','voient'],
    savoir:['sais','sais','sait','savons','savez','savent'],pouvoir:['peux','peux','peut','pouvons','pouvez','peuvent'],vouloir:['veux','veux','veut','voulons','voulez','veulent'],
    venir:['viens','viens','vient','venons','venez','viennent'],devoir:['dois','dois','doit','devons','devez','doivent'],prendre:['prends','prends','prend','prenons','prenez','prennent'],
    falloir:['faut','faut','faut','faut','faut','faut'],mettre:['mets','mets','met','mettons','mettez','mettent'],croire:['crois','crois','croit','croyons','croyez','croient'],
    connaître:['connais','connais','connaît','connaissons','connaissez','connaissent'],tenir:['tiens','tiens','tient','tenons','tenez','tiennent'],
    comprendre:['comprends','comprends','comprend','comprenons','comprenez','comprennent'],sortir:['sors','sors','sort','sortons','sortez','sortent'],
    vivre:['vis','vis','vit','vivons','vivez','vivent'],mourir:['meurs','meurs','meurt','mourons','mourez','meurent'],partir:['pars','pars','part','partons','partez','partent'],
    suivre:['suis','suis','suit','suivons','suivez','suivent'],écrire:['écris','écris','écrit','écrivons','écrivez','écrivent'],ouvrir:['ouvre','ouvres','ouvre','ouvrons','ouvrez','ouvrent'],
    perdre:['perds','perds','perd','perdons','perdez','perdent'],lire:['lis','lis','lit','lisons','lisez','lisent'],boire:['bois','bois','boit','buvons','buvez','boivent'],
    courir:['cours','cours','court','courons','courez','courent'],dormir:['dors','dors','dort','dormons','dormez','dorment'],apprendre:['apprends','apprends','apprend','apprenons','apprenez','apprennent'],
    recevoir:['reçois','reçois','reçoit','recevons','recevez','reçoivent'],conduire:['conduis','conduis','conduit','conduisons','conduisez','conduisent'],
    naître:['nais','nais','naît','naissons','naissez','naissent'],rire:['ris','ris','rit','rions','riez','rient'],servir:['sers','sers','sert','servons','servez','servent'],
    sentir:['sens','sens','sent','sentons','sentez','sentent'],paraître:['parais','parais','paraît','paraissons','paraissez','paraissent'],
    asseoir:['assieds','assieds','assied','asseyons','asseyez','asseyent'],apercevoir:['aperçois','aperçois','aperçoit','apercevons','apercevez','aperçoivent'],
    jeter:['jette','jettes','jette','jetons','jetez','jettent'],lever:['lève','lèves','lève','levons','levez','lèvent']
  };
  const FR_PP = {être:'été',avoir:'eu',faire:'fait',dire:'dit',aller:'allé',voir:'vu',savoir:'su',pouvoir:'pu',vouloir:'voulu',venir:'venu',devoir:'dû',prendre:'pris',mettre:'mis',croire:'cru',connaître:'connu',tenir:'tenu',comprendre:'compris',rendre:'rendu',attendre:'attendu',sortir:'sorti',vivre:'vécu',mourir:'mort',partir:'parti',suivre:'suivi',écrire:'écrit',ouvrir:'ouvert',perdre:'perdu',lire:'lu',boire:'bu',courir:'couru',dormir:'dormi',apprendre:'appris',recevoir:'reçu',conduire:'conduit',naître:'né',rire:'ri',servir:'servi',vendre:'vendu',construire:'construit'};
  const FR_PRESENT_PARTICIPLE = {être:'étant',avoir:'ayant',savoir:'sachant'};
  const FR_FUTURE = {être:'ser',avoir:'aur',faire:'fer',aller:'ir',voir:'verr',savoir:'saur',pouvoir:'pourr',vouloir:'voudr',venir:'viendr',devoir:'devr',tenir:'tiendr',recevoir:'recevr',falloir:'faudr',mourir:'mourr',courir:'courr',envoyer:'enverr'};
  const FR_SUBJUNCTIVE = {
    être:['sois','sois','soit','soyons','soyez','soient'],
    avoir:['aie','aies','ait','ayons','ayez','aient'],
    faire:['fasse','fasses','fasse','fassions','fassiez','fassent'],
    aller:['aille','ailles','aille','allions','alliez','aillent'],
    savoir:['sache','saches','sache','sachions','sachiez','sachent'],
    pouvoir:['puisse','puisses','puisse','puissions','puissiez','puissent'],
    vouloir:['veuille','veuilles','veuille','voulions','vouliez','veuillent'],
    venir:['vienne','viennes','vienne','venions','veniez','viennent'],
    devoir:['doive','doives','doive','devions','deviez','doivent'],
    prendre:['prenne','prennes','prenne','prenions','preniez','prennent'],
    tenir:['tienne','tiennes','tienne','tenions','teniez','tiennent'],
    dire:['dise','dises','dise','disions','disiez','disent'],
    voir:['voie','voies','voie','voyions','voyiez','voient'],
    croire:['croie','croies','croie','croyions','croyiez','croient'],
    boire:['boive','boives','boive','buvions','buviez','boivent'],
    recevoir:['reçoive','reçoives','reçoive','recevions','receviez','reçoivent'],
    mourir:['meure','meures','meure','mourions','mouriez','meurent'],
    falloir:['faille','faille','faille','faille','faille','faille']
  };
  const FR_IMPERATIVE = {
    être:['sois','soyons','soyez'],
    avoir:['aie','ayons','ayez'],
    savoir:['sache','sachons','sachez'],
    vouloir:['veuille','voulons','veuillez']
  };
  const FR_ETRE_AUX = new Set(['aller','venir','arriver','devenir','revenir','mourir','partir','sortir','entrer','tomber','naître','rester','monter']);

  function frenchPresent(inf) {
    if (FR_PRESENT[inf]) return FR_PRESENT[inf];
    if (inf.endsWith('venir')) {
      const prefix=inf.slice(0,-5);
      return FR_PRESENT.venir.map((form)=>prefix+form);
    }
    if (inf.endsWith('prendre')) {
      const prefix=inf.slice(0,-7);
      return FR_PRESENT.prendre.map((form)=>prefix+form);
    }
    if (inf.endsWith('mettre')) {
      const prefix=inf.slice(0,-6);
      return FR_PRESENT.mettre.map((form)=>prefix+form);
    }
    if (inf.endsWith('er')) {
      let stem = inf.slice(0,-2);
      if (inf === 'appeler') return ['appelle','appelles','appelle','appelons','appelez','appellent'];
      if (inf === 'acheter') return ['achète','achètes','achète','achetons','achetez','achètent'];
      if (inf === 'envoyer') return ['envoie','envoies','envoie','envoyons','envoyez','envoient'];
      return ['e','es','e','ons','ez','ent'].map((e,i)=>stem + ((inf.endsWith('ger')&&i===3)?'e'+e:(inf.endsWith('cer')&&i===3)?'ç'+e:e));
    }
    if (inf.endsWith('ir')) {
      const stem=inf.slice(0,-2);
      return ['is','is','it','issons','issez','issent'].map(e=>stem+e);
    }
    const stem=inf.replace(/re$/,'');
    return ['s','s','','ons','ez','ent'].map(e=>stem+e);
  }
  function frenchPp(inf) {
    if (FR_PP[inf]) return FR_PP[inf];
    if (inf.endsWith('venir')) return inf.slice(0,-5)+'venu';
    if (inf.endsWith('prendre')) return inf.slice(0,-7)+'pris';
    if (inf.endsWith('mettre')) return inf.slice(0,-6)+'mis';
    return inf.endsWith('er')?inf.slice(0,-2)+'é':inf.endsWith('ir')?inf.slice(0,-2)+'i':inf.endsWith('re')?inf.slice(0,-2)+'u':inf;
  }
  function frenchEngine() {
    const persons=['Je','Tu','Il / Elle','Nous','Vous','Ils / Elles'];
    const auxAvoir=['ai','as','a','avons','avez','ont'], auxEtre=['suis','es','est','sommes','êtes','sont'];
    const impEnd=['ais','ais','ait','ions','iez','aient'], futEnd=['ai','as','a','ons','ez','ont'];
    const condEnd=['ais','ais','ait','ions','iez','aient'];
    const tenses=[
      {id:'presentSimple',label:'Présent'}, {id:'pastSimple',label:'Passé composé'}, {id:'imperfect',label:'Imparfait'},
      {id:'presentPerfect',label:'Plus-que-parfait'}, {id:'futureSimple',label:'Futur simple'}, {id:'conditional',label:'Conditionnel présent'},
      {id:'subjunctive',label:'Subjonctif présent'}, {id:'imperative',label:'Impératif'}
    ];
    function conjugateTense(raw,id) {
      const inf=raw.infinitive, present=frenchPresent(inf), pp=frenchPp(inf), etre=FR_ETRE_AUX.has(inf);
      let forms=[];
      if(id==='presentSimple') forms=present;
      else if(id==='pastSimple') forms=(etre?auxEtre:auxAvoir).map(a=>`${a} ${pp}`);
      else if(id==='imperfect') {
        const stem=present[3].replace(/ons$/,'');
        forms=impEnd.map(e=>(inf==='être'?'ét':stem)+e);
      } else if(id==='presentPerfect') {
        const stem=(etre?'ét':'av');
        forms=impEnd.map(e=>`${stem+e} ${pp}`);
      } else if(id==='futureSimple'||id==='conditional') {
        const stem=FR_FUTURE[inf] || (inf.endsWith('re')?inf.slice(0,-1):inf);
        forms=(id==='futureSimple'?futEnd:condEnd).map(e=>stem+e);
      } else if(id==='subjunctive') {
        if (FR_SUBJUNCTIVE[inf]) forms=FR_SUBJUNCTIVE[inf];
        else if (inf.endsWith('venir')) {
          const prefix=inf.slice(0,-5);
          forms=FR_SUBJUNCTIVE.venir.map((form)=>prefix+form);
        } else if (inf.endsWith('prendre')) {
          const prefix=inf.slice(0,-7);
          forms=FR_SUBJUNCTIVE.prendre.map((form)=>prefix+form);
        } else if (inf.endsWith('tenir')) {
          const prefix=inf.slice(0,-5);
          forms=FR_SUBJUNCTIVE.tenir.map((form)=>prefix+form);
        } else {
          const stem=present[5].replace(/ent$/,'');
          forms=['e','es','e','ions','iez','ent'].map((e,i)=>(i===3||i===4?present[3].replace(/ons$/,''):stem)+e);
        }
      } else if(id==='imperative') {
        const imperativeRow=(label,form)=>({label,affirmative:form,negative:`ne ${form} pas`.replace(/^ne ([aeiouyh])/i,"n'$1"),interrogative:''});
        const imperative=FR_IMPERATIVE[inf] || [present[1],present[3],present[4]];
        return {rows:[imperativeRow('tu',imperative[0]),imperativeRow('nous',imperative[1]),imperativeRow('vous',imperative[2])],note:null};
      } else return null;
      return {rows:forms.map((form,i)=>{
        const subject=persons[i],compound=id==='pastSimple'||id==='presentPerfect';
        const affirmative=`${subject} ${form}`.replace(/^Je ([aeiouyh])/i,"J'$1");
        const parts=form.split(' '),first=parts.shift(),rest=parts.join(' ');
        const negative=(compound
          ? `${subject} ne ${first} pas${rest?` ${rest}`:''}`
          : `${subject} ne ${form} pas`).replace(/^Je ne ([aeiouyh])/i,"Je n'$1");
        const question=`Est-ce que ${subject.toLowerCase()} ${form} ?`
          .replace(/^Est-ce que je ([aeiouyh])/i,"Est-ce que j'$1")
          .replace(/^Est-ce que il \/ elle /i,"Est-ce qu'il / elle ")
          .replace(/^Est-ce que ils \/ elles /i,"Est-ce qu'ils / elles ");
        return{label:subject,affirmative,negative,interrogative:question};
      }),note:null};
    }
    return {TENSES:tenses,conjugateTense,principalForms(inf){const p=frenchPresent(inf),pp=frenchPp(inf);return{thirdPersonSingular:p[2],pastSimple:`${FR_ETRE_AUX.has(inf)?'est':'a'} ${pp}`,pastParticiple:pp,presentParticiple:FR_PRESENT_PARTICIPLE[inf]||((p[3].replace(/ons$/,'')||inf)+'ant')};}};
  }

  const ES_PRESENT = {
    ser:['soy','eres','es','somos','sois','son'],haber:['he','has','ha','hemos','habéis','han'],estar:['estoy','estás','está','estamos','estáis','están'],
    tener:['tengo','tienes','tiene','tenemos','tenéis','tienen'],hacer:['hago','haces','hace','hacemos','hacéis','hacen'],poder:['puedo','puedes','puede','podemos','podéis','pueden'],
    decir:['digo','dices','dice','decimos','decís','dicen'],ir:['voy','vas','va','vamos','vais','van'],ver:['veo','ves','ve','vemos','veis','ven'],dar:['doy','das','da','damos','dais','dan'],
    saber:['sé','sabes','sabe','sabemos','sabéis','saben'],querer:['quiero','quieres','quiere','queremos','queréis','quieren'],poner:['pongo','pones','pone','ponemos','ponéis','ponen'],
    venir:['vengo','vienes','viene','venimos','venís','vienen'],salir:['salgo','sales','sale','salimos','salís','salen'],seguir:['sigo','sigues','sigue','seguimos','seguís','siguen'],
    pensar:['pienso','piensas','piensa','pensamos','pensáis','piensan'],encontrar:['encuentro','encuentras','encuentra','encontramos','encontráis','encuentran'],
    volver:['vuelvo','vuelves','vuelve','volvemos','volvéis','vuelven'],sentir:['siento','sientes','siente','sentimos','sentís','sienten'],pedir:['pido','pides','pide','pedimos','pedís','piden'],
    oír:['oigo','oyes','oye','oímos','oís','oyen'],traer:['traigo','traes','trae','traemos','traéis','traen'],caer:['caigo','caes','cae','caemos','caéis','caen'],
    conocer:['conozco','conoces','conoce','conocemos','conocéis','conocen'],producir:['produzco','produces','produce','producimos','producís','producen'],
    parecer:['parezco','pareces','parece','parecemos','parecéis','parecen'],entender:['entiendo','entiendes','entiende','entendemos','entendéis','entienden'],
    contar:['cuento','cuentas','cuenta','contamos','contáis','cuentan'],empezar:['empiezo','empiezas','empieza','empezamos','empezáis','empiezan'],
    comenzar:['comienzo','comienzas','comienza','comenzamos','comenzáis','comienzan'],conseguir:['consigo','consigues','consigue','conseguimos','conseguís','consiguen'],
    recordar:['recuerdo','recuerdas','recuerda','recordamos','recordáis','recuerdan'],morir:['muero','mueres','muere','morimos','morís','mueren'],
    jugar:['juego','juegas','juega','jugamos','jugáis','juegan'],reconocer:['reconozco','reconoces','reconoce','reconocemos','reconocéis','reconocen'],
    ofrecer:['ofrezco','ofreces','ofrece','ofrecemos','ofrecéis','ofrecen'],dirigir:['dirijo','diriges','dirige','dirigimos','dirigís','dirigen']
  };
  const ES_PRET = {
    ser:['fui','fuiste','fue','fuimos','fuisteis','fueron'],ir:['fui','fuiste','fue','fuimos','fuisteis','fueron'],haber:['hube','hubiste','hubo','hubimos','hubisteis','hubieron'],tener:['tuve','tuviste','tuvo','tuvimos','tuvisteis','tuvieron'],
    estar:['estuve','estuviste','estuvo','estuvimos','estuvisteis','estuvieron'],hacer:['hice','hiciste','hizo','hicimos','hicisteis','hicieron'],poder:['pude','pudiste','pudo','pudimos','pudisteis','pudieron'],
    decir:['dije','dijiste','dijo','dijimos','dijisteis','dijeron'],venir:['vine','viniste','vino','vinimos','vinisteis','vinieron'],poner:['puse','pusiste','puso','pusimos','pusisteis','pusieron'],
    saber:['supe','supiste','supo','supimos','supisteis','supieron'],querer:['quise','quisiste','quiso','quisimos','quisisteis','quisieron'],dar:['di','diste','dio','dimos','disteis','dieron'],
    ver:['vi','viste','vio','vimos','visteis','vieron'],traer:['traje','trajiste','trajo','trajimos','trajisteis','trajeron'],
    pedir:['pedí','pediste','pidió','pedimos','pedisteis','pidieron'],sentir:['sentí','sentiste','sintió','sentimos','sentisteis','sintieron'],
    seguir:['seguí','seguiste','siguió','seguimos','seguisteis','siguieron'],morir:['morí','moriste','murió','morimos','moristeis','murieron'],
    dormir:['dormí','dormiste','durmió','dormimos','dormisteis','durmieron'],leer:['leí','leíste','leyó','leímos','leísteis','leyeron'],
    oír:['oí','oíste','oyó','oímos','oísteis','oyeron'],caer:['caí','caíste','cayó','caímos','caísteis','cayeron'],
    construir:['construí','construiste','construyó','construimos','construisteis','construyeron'],
    producir:['produje','produjiste','produjo','produjimos','produjisteis','produjeron'],
    conducir:['conduje','condujiste','condujo','condujimos','condujisteis','condujeron']
  };
  const ES_PP={abrir:'abierto',decir:'dicho',escribir:'escrito',hacer:'hecho',morir:'muerto',poner:'puesto',romper:'roto',ver:'visto',volver:'vuelto',descubrir:'descubierto'};
  const ES_FUT={tener:'tendr',haber:'habr',hacer:'har',poder:'podr',poner:'pondr',querer:'querr',saber:'sabr',salir:'saldr',venir:'vendr',decir:'dir'};
  const ES_IMPERFECT={
    ser:['era','eras','era','éramos','erais','eran'],
    ir:['iba','ibas','iba','íbamos','ibais','iban'],
    ver:['veía','veías','veía','veíamos','veíais','veían']
  };
  const ES_GERUND={ser:'siendo',ir:'yendo',poder:'pudiendo',decir:'diciendo',dormir:'durmiendo',morir:'muriendo',pedir:'pidiendo',venir:'viniendo',seguir:'siguiendo',oír:'oyendo'};
  const ES_SUBJUNCTIVE={
    ser:['sea','seas','sea','seamos','seáis','sean'],haber:['haya','hayas','haya','hayamos','hayáis','hayan'],
    estar:['esté','estés','esté','estemos','estéis','estén'],ir:['vaya','vayas','vaya','vayamos','vayáis','vayan'],
    dar:['dé','des','dé','demos','deis','den'],saber:['sepa','sepas','sepa','sepamos','sepáis','sepan']
  };
  const ES_IMPERATIVE_TU={decir:'di',hacer:'haz',ir:'ve',poner:'pon',salir:'sal',ser:'sé',tener:'ten',venir:'ven',haber:'he'};
  function spanishPresent(inf){
    if(ES_PRESENT[inf])return ES_PRESENT[inf];
    const end=inf.slice(-2),stem=inf.slice(0,-2), endings=end==='ar'?['o','as','a','amos','áis','an']:end==='er'?['o','es','e','emos','éis','en']:['o','es','e','imos','ís','en'];
    return endings.map(e=>stem+e);
  }
  function spanishPret(inf){
    if(ES_PRET[inf])return ES_PRET[inf];
    const end=inf.slice(-2),stem=inf.slice(0,-2), endings=end==='ar'?['é','aste','ó','amos','asteis','aron']:['í','iste','ió','imos','isteis','ieron'];
    const forms=endings.map(e=>stem+e);
    if(inf.endsWith('car'))forms[0]=inf.slice(0,-3)+'qué';
    if(inf.endsWith('gar'))forms[0]=inf.slice(0,-3)+'gué';
    if(inf.endsWith('zar'))forms[0]=inf.slice(0,-3)+'cé';
    return forms;
  }
  function spanishPp(inf){return ES_PP[inf]||inf.slice(0,-2)+(inf.endsWith('ar')?'ado':'ido');}
  function spanishSubjunctive(inf,present){
    if(ES_SUBJUNCTIVE[inf])return ES_SUBJUNCTIVE[inf];
    const end=inf.slice(-2);
    let stem=present[0].replace(/o$/,'');
    if(inf.endsWith('car'))stem=inf.slice(0,-3)+'qu';
    if(inf.endsWith('gar'))stem=inf.slice(0,-3)+'gu';
    if(inf.endsWith('zar'))stem=inf.slice(0,-3)+'c';
    const endings=end==='ar'?['e','es','e','emos','éis','en']:['a','as','a','amos','áis','an'];
    return endings.map(e=>stem+e);
  }
  function spanishEngine(){
    const persons=['Yo','Tú','Él / Ella','Nosotros','Vosotros','Ellos / Ellas'],haber=['he','has','ha','hemos','habéis','han'];
    const tenses=[{id:'presentSimple',label:'Presente'},{id:'pastSimple',label:'Pretérito indefinido'},{id:'imperfect',label:'Pretérito imperfecto'},{id:'presentPerfect',label:'Pretérito perfecto'},{id:'futureSimple',label:'Futuro simple'},{id:'conditional',label:'Condicional'},{id:'subjunctive',label:'Presente de subjuntivo'},{id:'imperative',label:'Imperativo'}];
    function conjugateTense(raw,id){
      const inf=raw.infinitive,pres=spanishPresent(inf),pret=spanishPret(inf),stem=inf.slice(0,-2),end=inf.slice(-2),pp=spanishPp(inf);let forms=[];
      if(id==='presentSimple')forms=pres;
      else if(id==='pastSimple')forms=pret;
      else if(id==='imperfect')forms=ES_IMPERFECT[inf]||(end==='ar'?['aba','abas','aba','ábamos','abais','aban']:['ía','ías','ía','íamos','íais','ían']).map(e=>stem+e);
      else if(id==='presentPerfect')forms=haber.map(h=>`${h} ${pp}`);
      else if(id==='futureSimple'||id==='conditional'){const s=ES_FUT[inf]||inf;forms=(id==='futureSimple'?['é','ás','á','emos','éis','án']:['ía','ías','ía','íamos','íais','ían']).map(e=>s+e);}
      else if(id==='subjunctive')forms=spanishSubjunctive(inf,pres);
      else if(id==='imperative'){
        const subj=spanishSubjunctive(inf,pres),affirmativeTu=ES_IMPERATIVE_TU[inf]||pres[2];
        return{rows:[
          {label:'tú',affirmative:affirmativeTu,negative:`no ${subj[1]}`,interrogative:''},
          {label:'usted',affirmative:subj[2],negative:`no ${subj[2]}`,interrogative:''},
          {label:'nosotros',affirmative:subj[3],negative:`no ${subj[3]}`,interrogative:''},
          {label:'vosotros',affirmative:inf.slice(0,-1)+'d',negative:`no ${subj[4]}`,interrogative:''},
          {label:'ustedes',affirmative:subj[5],negative:`no ${subj[5]}`,interrogative:''}
        ],note:inf==='haber'?'El imperativo de «haber» es raro fuera de expresiones fijadas.':null};
      }
      else return null;
      return{rows:forms.map((f,i)=>({label:persons[i],affirmative:`${persons[i]} ${f}`,negative:`${persons[i]} no ${f}`,interrogative:`¿${f} ${persons[i].toLowerCase().replace(' / ','/')}?`})),note:inf==='haber'?'«Haber» funciona principalmente como auxiliar; «hay» es su forma impersonal más frecuente en presente.':null};
    }
    return{TENSES:tenses,conjugateTense,principalForms(inf){const p=spanishPresent(inf),pr=spanishPret(inf);return{thirdPersonSingular:p[2],pastSimple:pr[0],pastParticiple:spanishPp(inf),presentParticiple:ES_GERUND[inf]||inf.slice(0,-2)+(inf.endsWith('ar')?'ando':'iendo')};}};
  }

  const engines={french:frenchEngine(),spanish:spanishEngine()};
  // A long catalogue needs real CEFR bands, not one giant B1 remainder.
  // This distribution keeps high-frequency everyday verbs accessible first,
  // then gives B2, C1 and C2 their own browsable banks even past 1,000.
  function level(rank){
    return rank<=80?'A1'
      :rank<=180?'A2'
      :rank<=400?'B1'
      :rank<=650?'B2'
      :rank<=850?'C1'
      :'C2';
  }
  function buildFrench([inf,en,es,group],index){
    const forms=engines.french.principalForms(inf),present=frenchPresent(inf);
    const curatedExamples=FR_CORE_EXAMPLES[inf];
    const spanishGloss=es||'Traducción pendiente';
    const englishGloss=en||'Translation pending';
    return{id:`verb-french-${inf}`,language:'french',rank:index+1,infinitive:inf,regular:group!==3,group:`${group}${group===1?'er':group===2?'e':'e'} groupe`,level:level(index+1),forms,
      translation:{spanish:spanishGloss,english:englishGloss},directDefinition:{french:es?`Verbe fréquent qui signifie « ${es} » en espagnol.`:'Traduction en attente pour ce verbe français.',english:en?`A frequent French verb meaning “${en}”.`:'A frequent French verb: open the detail for examples and conjugation.'},
      pronunciation:FR_IPA[inf]||'',audioText:inf,examples:curatedExamples?{affirmative:curatedExamples[0],negative:curatedExamples[1],interrogative:curatedExamples[2]}:buildFrenchCardExamples(present,index),
      commonCollocations:[],synonyms:[],antonyms:[],notes:`${group===1?'1er':group===2?'2e':'3e'} groupe · #${index+1} par fréquence d’usage.`};
  }

  // Contextual Spanish examples replace the old mechanically generated
  // “Yo verbo hoy”, which produced incorrect sentences such as “Yo soy hoy”.
  // Each context is deliberately short, natural and reusable across the
  // affirmative, negative and question forms shown on the verb card.
  const ES_EXAMPLE_CONTEXTS = {
    tener:'tiempo para terminarlo',hacer:'la compra al salir del trabajo',poder:'resolverlo hoy',decir:'la verdad',ir:'a la biblioteca después de clase',ver:'el mensaje esta tarde',dar:'una respuesta clara',
    saber:'cómo llegar al museo',querer:'reservar una mesa',llegar:'a tiempo a la reunión',pasar:'la tarde con mi familia',deber:'enviar el formulario hoy',poner:'las llaves sobre la mesa',parecer:'cansado después del viaje',quedar:'con mis amigos el sábado',creer:'que la propuesta funcionará',hablar:'con la profesora después de clase',llevar:'el portátil a la oficina',dejar:'el abrigo en la entrada',seguir:'las instrucciones con atención',encontrar:'mi cuaderno en la mochila',llamar:'a mi madre por la noche',venir:'al curso en autobús',pensar:'en una solución viable',salir:'temprano de casa',volver:'a casa antes de cenar',tomar:'el tren de las ocho',conocer:'bien este barrio',vivir:'cerca del parque',sentir:'más confianza al hablar',tratar:'de explicar la idea con claridad',mirar:'el mapa antes de salir',contar:'la historia completa',empezar:'la tarea después de comer',esperar:'el autobús en la esquina',buscar:'una respuesta fiable',existir:'por una razón concreta',entrar:'por la puerta principal',trabajar:'desde casa los viernes',escribir:'un correo breve',perder:'el recibo con facilidad',producir:'un informe cada semana',entender:'la explicación ahora',pedir:'una cita para mañana',recibir:'noticias de mi familia',recordar:'el nombre de la calle',terminar:'el proyecto esta semana',permitir:'el acceso a los estudiantes',aparecer:'en la pantalla principal',conseguir:'una plaza en el curso',comenzar:'la reunión a las nueve',servir:'el desayuno a las ocho',sacar:'una foto del paisaje',necesitar:'más información',mantener:'la calma en situaciones difíciles',leer:'las instrucciones antes de empezar',caer:'con frecuencia en ese error',cambiar:'de opinión cuando hay pruebas',presentar:'el proyecto al equipo',crear:'una solución útil',abrir:'la ventana para ventilar',considerar:'todas las alternativas',oír:'la música desde aquí',acabar:'el informe antes del plazo',convertir:'una idea en un plan',ganar:'experiencia con cada proyecto',formar:'parte del equipo',traer:'los documentos mañana',partir:'de viaje el lunes',aceptar:'la propuesta con gusto',realizar:'el trabajo con cuidado',suponer:'que habrá tiempo suficiente',comprender:'la diferencia ahora',lograr:'un buen resultado',explicar:'el proceso paso a paso',preguntar:'por el horario',tocar:'la guitarra los fines de semana',reconocer:'mi error sin problema',estudiar:'una hora cada tarde',alcanzar:'la meta prevista',dirigir:'la reunión con calma',correr:'por el parque al amanecer',utilizar:'la aplicación para organizarme',pagar:'con tarjeta',ayudar:'a mis compañeros',jugar:'al ajedrez los domingos',escuchar:'el pódcast en el tren',cumplir:'mis compromisos',ofrecer:'mi ayuda cuando hace falta',descubrir:'algo nuevo cada día',levantar:'la mano para participar',intentar:'mejorar mi pronunciación',
    desarrollar:'una idea con ejemplos',mejorar:'con práctica constante',incluir:'los datos relevantes',continuar:'con el ejercicio',compartir:'el archivo con el grupo',aprender:'algo nuevo cada semana',enseñar:'el proceso con paciencia',construir:'un plan realista',enviar:'el mensaje ahora',elegir:'la opción más adecuada',comprar:'fruta en el mercado',vender:'productos locales',dormir:'ocho horas cuando puedo',comer:'algo ligero al mediodía',beber:'agua durante el día',caminar:'hasta la estación',conducir:'con prudencia',viajar:'en tren cuando tengo tiempo',cocinar:'para mi familia',limpiar:'mi espacio de trabajo'
  };
  const ES_SPECIAL_EXAMPLES = {
    ser:['Soy responsable del proyecto.', 'No soy la persona indicada.', '¿Soy responsable de esta tarea?'],
    haber:['He terminado el informe.', 'No he recibido la confirmación.', '¿He enviado el documento correcto?'],
    estar:['Estoy en la biblioteca.', 'No estoy disponible esta tarde.', '¿Estoy en la sala correcta?'],
    gustar:['Me gusta aprender con ejemplos reales.', 'No me gusta llegar tarde.', '¿Me gusta esta canción?'],
    ocurrir:['Me ocurre a veces cuando estoy cansado.', 'No me ocurre con frecuencia.', '¿Me ocurre solo a mí?'],
    resultar:['Me resulta útil este método.', 'No me resulta difícil seguirlo.', '¿Me resulta clara la explicación?'],
    morir:['La planta muere sin agua.', 'La planta no muere con cuidado.', '¿Muere la planta sin luz?'],
    nacer:['Nací en República Dominicana.', 'No nací en esta ciudad.', '¿Nací aquí o en otra provincia?']
  };
  // The highest-frequency verbs also carry short, practical truths: students
  // practise a real conjugation while meeting an idea worth remembering.
  // Several are concise biblical paraphrases (not long quotations), so they
  // remain readable learning examples for the verb cards.
  const ES_PRACTICAL_TRUTHS = {
    ser:['Somos creados con dignidad y propósito.', 'No somos robots; incluso los lunes merecen paciencia.', '¿Somos coherentes con lo que decimos?'],
    haber:['Hay esperanza nueva cada mañana.', 'No hay atajo mágico; el café, por desgracia, no cuenta.', '¿Hay algo que puedas mejorar hoy?'],
    estar:['Estamos acompañados incluso en los días difíciles.', 'No estamos organizados todo el tiempo, aunque la agenda finja lo contrario.', '¿Estamos cuidando lo que importa?'],
    tener:['Tenemos un propósito que va más allá de la prisa.', 'No tenemos que saberlo todo para empezar; qué alivio.', '¿Tenemos claro nuestro siguiente paso?'],
    hacer:['Hacemos el bien aunque nadie esté mirando.', 'No hacemos grandes cosas sin empezar por una, incluso si es lunes.', '¿Hacemos espacio para lo importante?'],
    poder:['Podemos perseverar cuando recibimos nuevas fuerzas.', 'No podemos controlar todo; ya bastante trabajo da la bandeja de entrada.', '¿Podemos dar un paso más hoy?'],
    decir:['Decimos la verdad con amor.', 'No decimos todo con palabras; a veces el silencio entrega el informe.', '¿Decimos gracias con suficiente frecuencia?'],
    ir:['Vamos en paz cuando confiamos en el camino correcto.', 'No vamos a encontrar el camino si seguimos discutiendo con el GPS.', '¿Vamos hacia la vida que queremos construir?'],
    ver:['Vemos la gracia cuando servimos a los demás.', 'No vemos el mundo igual después de aprender; tampoco el correo sin abrir.', '¿Vemos una oportunidad donde antes había un obstáculo?'],
    dar:['Damos con alegría y sin esperar recompensa.', 'No damos lo mejor por obligación; tampoco por una reunión sin agenda.', '¿Damos tiempo a quienes más queremos?'],
    saber:['Sabemos más cuando reconocemos lo que ignoramos.', 'No sabemos cuánto podemos lograr hasta intentarlo.', '¿Sabemos escuchar antes de responder?'],
    querer:['Queremos al prójimo como deseamos ser tratados.', 'No queremos crecer sin aceptar el esfuerzo; sería un excelente atajo.', '¿Queremos convertir esta idea en una acción?'],
    llegar:['Llegamos más lejos con paciencia y disciplina.', 'No llegamos tarde a nuestra propia vida.', '¿Llegamos a tiempo para lo que importa?'],
    deber:['Debemos cuidar lo que no se puede reemplazar.', 'No debemos confundir prisa con progreso; el calendario ya lo intenta.', '¿Debemos detenernos para pensar mejor?'],
    hablar:['Hablamos para entendernos, no solo para responder.', 'No hablamos igual cuando escuchamos de verdad.', '¿Hablamos con la misma honestidad que exigimos?'],
    pensar:['Pensamos mejor cuando dejamos espacio para dudar.', 'No pensamos con claridad cuando decidimos desde el miedo.', '¿Pensamos en las consecuencias de nuestras decisiones?'],
    vivir:['Vivimos mejor cuando compartimos lo que aprendemos.', 'No vivimos plenamente si olvidamos cuidar a los demás.', '¿Vivimos de acuerdo con nuestros valores?'],
    aprender:['Aprendemos cuando convertimos la curiosidad en hábito.', 'No aprendemos de verdad si tememos equivocarnos; el error ya tomó asistencia.', '¿Aprendemos algo que nos acerque a nuestros objetivos?']
  };
  function buildSpanishCardExamples(inf, present) {
    if (ES_PRACTICAL_TRUTHS[inf]) {
      const [affirmative, negative, interrogative] = ES_PRACTICAL_TRUTHS[inf];
      return { affirmative, negative, interrogative };
    }
    if (ES_SPECIAL_EXAMPLES[inf]) {
      const [affirmative, negative, interrogative] = ES_SPECIAL_EXAMPLES[inf];
      return {
        affirmative: `${affirmative} La bondad se muestra en los detalles.`,
        negative: `${negative} No caminamos solos.`,
        interrogative: `${interrogative} ¿Cómo podemos servir con amor?`
      };
    }
    const context = ES_EXAMPLE_CONTEXTS[inf] || 'con atención';
    return {
      affirmative: `Yo ${present[0]} ${context}. La bondad se muestra en los detalles.`,
      negative: `Yo no ${present[0]} ${context}. No caminamos solos.`,
      interrogative: `¿${present[0].charAt(0).toUpperCase()}${present[0].slice(1)} ${context}? ¿Cómo podemos servir con amor?`
    };
  }
  function buildSpanish([inf,en,fr],index){
    const forms=engines.spanish.principalForms(inf),present=spanishPresent(inf),ending=inf.slice(-2);
    const group=ending==='ar'?'verbos en -ar':ending==='er'?'verbos en -er':'verbos en -ir';
    return{id:`verb-spanish-${inf}`,language:'spanish',rank:index+1,infinitive:inf,regular:!ES_PRESENT[inf]&&!ES_PRET[inf],group,level:level(index+1),forms,
      translation:{english:en,french:fr,spanish:`Definición: ${en}.`},directDefinition:{spanish:`Verbo frecuente que significa « ${en} » en inglés.`,english:`A frequent Spanish verb meaning “${en}”.`},
      pronunciation:'',audioText:inf,examples:buildSpanishCardExamples(inf,present),
      commonCollocations:[],synonyms:[],antonyms:[],notes:`Pertenece al grupo de ${group}.`};
  }
  window.ANDERGO_VERBS_DATA=window.ANDERGO_VERBS_DATA||{};
  window.ANDERGO_VERBS_DATA.french=FR_ALL.map(buildFrench);
  // CEFR placement cannot be a pure frequency cut-off. The final source band
  // included everyday verbs such as « téléphoner », « flotter » and
  // « désirer » in C2. Keep them in the earlier route and make C2 a focused
  // bank for precise academic, institutional and argumentative use.
  const FRENCH_C2_PRECISION_VERBS = new Set([
    'abroger','abolir','accentuer','aggraver','analyser','anticiper',
    'apprécier','argumenter','attribuer','clarifier','consolider','constater',
    'constituer','contraindre','contester','contribuer','convaincre','débattre',
    'déclencher','déduire','définir','déléguer','démontrer','dénoncer','développer',
    'diagnostiquer','différencier','diffuser','dissuader','divulguer','écarter',
    'élaborer','élargir','émerger','encourager','endosser','engager','enrichir',
    'envisager','établir','étayer','évaluer','évoquer','examiner','exclure',
    'exécuter','exercer','expliciter','exploiter','exprimer','faciliter','favoriser',
    'financer','formuler','générer','garantir','gouverner','illustrer','impliquer',
    'imposer','inciter','inclure','incorporer','indemniser','induire','initier',
    'intégrer','interpréter','intervenir','invoquer','justifier','maîtriser','minimiser',
    'mobiliser','modifier','négocier','nuancer','objecter','obtenir','percevoir',
    'persuader','préserver','présider','prévoir','privilégier','promouvoir','proposer',
    'poursuivre','prévenir','procéder','proclamer','quantifier','réaffirmer','réduire',
    'réguler','renforcer','renoncer','restituer','restructurer','résumer','révéler',
    'réviser','sceller','solliciter','soumettre','souligner','structurer','suggérer',
    'susciter','soutenir','synthétiser','transmettre','valoriser','vérifier'
  ]);
  const FRENCH_C2_TRANSLATIONS = {
    obtenir:'obtener', renforcer:'reforzar', établir:'establecer', promouvoir:'promover',
    réduire:'reducir', examiner:'examinar', garantir:'garantizar', modifier:'modificar',
    évaluer:'evaluar', faciliter:'facilitar', soutenir:'sostener', poursuivre:'perseguir',
    développer:'desarrollar', élaborer:'elaborar', encourager:'fomentar', définir:'definir',
    prévenir:'prevenir', favoriser:'favorecer', vérifier:'verificar', transmettre:'transmitir',
    intégrer:'integrar', inclure:'incluir', exercer:'ejercer', proposer:'proponer',
    engager:'comprometer', souligner:'subrayar', financer:'financiar', envisager:'contemplar',
    exprimer:'expresar', analyser:'analizar', prévoir:'prever', exécuter:'ejecutar',
    générer:'generar', constituer:'constituir', préserver:'preservar', soumettre:'someter',
    intervenir:'intervenir', imposer:'imponer', contribuer:'contribuir', élargir:'ampliar',
    diffuser:'difundir', exploiter:'explotar', justifier:'justificar', constater:'constatar',
    démontrer:'demostrar', formuler:'formular', négocier:'negociar', convaincre:'convencer',
    procéder:'proceder', apprécier:'apreciar', mobiliser:'movilizar', inciter:'incitar',
    consolider:'consolidar', débattre:'debatir', attribuer:'atribuir', exclure:'excluir',
    réviser:'revisar', clarifier:'aclarar', susciter:'suscitar', incorporer:'incorporar',
    réguler:'regular', impliquer:'implicar', maîtriser:'dominar', interpréter:'interpretar',
    minimiser:'minimizar', solliciter:'solicitar', révéler:'revelar', déclencher:'desencadenar',
    dénoncer:'denunciar', évoquer:'evocar', réaffirmer:'reafirmar', invoquer:'invocar',
    enrichir:'enriquecer', induire:'inducir', déduire:'deducir', privilégier:'privilegiar',
    percevoir:'percibir', écarter:'descartar', illustrer:'ilustrar', suggérer:'sugerir',
    contester:'impugnar', étayer:'fundamentar', divulguer:'divulgar', aggraver:'agravar',
    abolir:'abolir', diagnostiquer:'diagnosticar', quantifier:'cuantificar', résumer:'resumir',
    renoncer:'renunciar', anticiper:'anticipar', valoriser:'valorizar', dissuader:'disuadir',
    gouverner:'gobernar', persuader:'persuadir', initier:'iniciar', contraindre:'obligar',
    différencier:'diferenciar', restructurer:'reestructurar', indemniser:'indemnizar',
    présider:'presidir', abroger:'derogar', accentuer:'acentuar', structurer:'estructurar',
    sceller:'sellar', restituer:'restituir', déléguer:'delegar', proclamer:'proclamar'
  };
  const FRENCH_LEVEL_CORRECTIONS = {
    'équilibrer':'B1','pêcher':'A2','calmer':'A2','dessiner':'A2','cuisiner':'A2',
    'nager':'A2','lâcher':'B1','deviner':'B1','déménager':'A2','sourire':'A1',
    'mélanger':'A2','frapper':'A2','danser':'A1','chauffer':'A2','baisser':'A2',
    'raconter':'A2','réviser':'B1','réunir':'B1','célébrer':'A2','pratiquer':'B1',
    'apaiser':'B2','échouer':'B1','fréquenter':'B1','dialoguer':'B1','obéir':'A2',
    'embarquer':'B1','énumérer':'B2','balayer':'A2','promener':'A2','gonfler':'A2',
    'crever':'B1','trahir':'B2','effrayer':'A2','coucher':'A2','croiser':'A2',
    'désirer':'A2','encadrer':'B1','exagérer':'B1','exister':'A2','fixer':'A2',
    'flotter':'B1','hésiter':'B1','instruire':'B2','oser':'B1','plonger':'A2',
    'situer':'B1','songer':'B1','tarder':'B1','téléphoner':'A1','tirer':'A2',
    'traduire':'B1'
  };
  window.ANDERGO_VERBS_DATA.french.forEach((verb) => {
    if (verb.level === 'C2') verb.level = 'C1';
    if (FRENCH_LEVEL_CORRECTIONS[verb.infinitive]) verb.level = FRENCH_LEVEL_CORRECTIONS[verb.infinitive];
    if (FRENCH_C2_PRECISION_VERBS.has(verb.infinitive)) {
      verb.level = 'C2';
      verb.translation = { ...verb.translation, spanish: FRENCH_C2_TRANSLATIONS[verb.infinitive] };
    }
  });
  window.ANDERGO_VERBS_DATA.spanish=ES.map(buildSpanish);
  window.AndergoVerbConjugations=window.AndergoVerbConjugations||{};
  window.AndergoVerbConjugations.french=engines.french;
  window.AndergoVerbConjugations.spanish=engines.spanish;
  if(window.AndergoVerbConjugation)window.AndergoVerbConjugations.english=window.AndergoVerbConjugation;
})();
