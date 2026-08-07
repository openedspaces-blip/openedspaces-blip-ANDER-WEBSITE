const FORMATS = [
  'documentary',
  'podcast',
  'editorial',
  'lecture',
  'news',
  'analysis',
  'chronicle',
  'reflection',
  'report',
  'essay',
  'portrait',
  'synthesis'
];

const FORMAT_TITLES = {
  documentary: 'Documentaire',
  podcast: 'Podcast',
  editorial: 'Éditorial',
  lecture: 'Conférence',
  news: 'Dossier d’actualité',
  analysis: 'Analyse',
  chronicle: 'Chronique',
  reflection: 'Réflexion',
  report: 'Reportage',
  essay: 'Essai sonore',
  portrait: 'Portrait',
  synthesis: 'Synthèse'
};

const GRAMMAR_MODELS = {
  C1: [
    [
      'C’est la différence entre le lycée et l’université qui déstabilise d’abord les nouveaux étudiants, et c’est leur autonomie que les enseignants veulent développer.',
      'Il semble que chacun doive inventer sa méthode, même s’il n’est pas certain que les premiers choix soient définitifs.'
    ],
    [
      'Le professeur avait répondu que la diversité des approches enrichissait la problématique et il avait ajouté que le groupe trouverait un consensus.',
      'Il est probable que cette coopération produise un exposé plus nuancé, et il n’est pas exclu qu’elle transforme aussi leur manière de travailler.'
    ],
    [
      'Le cadrage des faits par les rédactions et la hiérarchisation des témoignages influencent la perception du public.',
      'Il convient donc d’identifier chaque présupposé, et il ressort de l’analyse qu’aucune ligne éditoriale n’est entièrement neutre.'
    ],
    [
      'Quoique la traduction automatique soit vraisemblable, elle peut aplatir une voix ou effacer un sous-entendu.',
      'Quand bien même le système progresserait, le traducteur aurait beau relire chaque proposition, toute décision interprétative exigerait encore une vigilance humaine.'
    ],
    [
      'La grand-mère avait longtemps minimisé cette archive, puis elle confia qu’un fragment manquait au récit familial.',
      'Camila regardait les lettres : sa mère était partie avant que toute l’histoire soit racontée. Fallait-il combler ce silence ou accepter que la mémoire demeure une constellation incomplète ?'
    ],
    [
      'Certes, la méritocratie promet une égalité formelle ; néanmoins, des conditions de départ différentes produisent un effet inégal.',
      'On pourrait objecter que chacun reste libre de réussir. Toutefois, cet argument ne suffit pas à réfuter la nécessité d’une équité plus concrète.'
    ],
    [
      'Si le campus avait mesuré plus tôt sa consommation, il aurait évité certains choix énergivores et aurait mieux réparti les coûts.',
      'Une politique de sobriété aurait été plus crédible si chaque arbitrage avait été proportionné aux responsabilités réelles.'
    ],
    [
      'La norme linguistique dont l’institution se réclame n’est pas la seule variété à laquelle les étudiants donnent une légitimité.',
      'Ce dont ils ont besoin, c’est d’un cadre dans lequel un écart ne serve pas de prétexte à stigmatiser ; voilà ce à quoi devrait conduire l’inclusion.'
    ],
    [
      'Il est certain que les données disponibles ont renforcé l’hypothèse, mais il est possible que leur portée soit encore provisoire.',
      'Il semble que toute expertise doive rester ouverte à la réfutation, sans que cette précaution affaiblisse ce qui est solidement établi.'
    ],
    [
      'L’œuvre a été retirée de l’exposition, puis l’artiste a fait documenter les objections qui avaient motivé cette décision.',
      'Une objection éthique ne se fait pas disparaître par un simple adoucissement : elle doit être examinée sans que le matériau artistique soit rendu opaque.'
    ],
    [
      'Lorsque Camila aura comparé chaque voie, elle aura mieux distingué ce qui est révisable de ce qui paraît irréversible.',
      'Elle expliqua qu’elle devrait répondre avant vendredi et qu’à cette date elle aurait déjà contacté Montréal, sans dramatiser l’incertitude.'
    ],
    [
      'Camila relit son parcours, puis elle en dégage une idée : celui-ci n’a jamais été uniforme.',
      'Ce constat l’aide à reconnaître les codes implicites ; cette manière de regarder son expérience devient alors un outil d’analyse qu’elle peut transmettre.'
    ]
  ],
  C2: [
    [
      'Il semblerait qu’un modèle génératif produise une œuvre plausible, mais il ne pourrait s’agir de créativité au sens plein que si un choix humain substantiel demeurait décelable.',
      'Quand bien même le pastiche serait techniquement irréprochable, il ne suffirait pas à établir une intention ni une inscription dans une histoire artistique reconnue.'
    ],
    [
      'Si la trajectoire actuelle des émissions s’était infléchie plus tôt, le seuil de 1,5 degré aurait pu rester atteignable sans mesures aussi coûteuses.',
      'À moins que l’électrification ne s’accompagne d’une décarbonation équivalente de la production, le gain climatique resterait largement illusoire.'
    ],
    [
      'Selon certains analystes, la multipolarité multiplierait les frictions ; d’autres soutiennent au contraire qu’elle multiplie les canaux de médiation disponibles.',
      'À en croire les partisans du multilatéralisme, la robustesse des institutions compterait davantage que le nombre de pôles de puissance en présence.'
    ],
    [
      'Pour autant que l’usage demeure actif plutôt que passif, il n’est pas certain que le lien entre réseaux sociaux et mal-être soit aussi massif qu’on le prétend.',
      'Bien que la corrélation soit statistiquement établie, il faut douter qu’elle suffise, à elle seule, à démontrer une causalité univoque.'
    ],
    [
      'La concentration de la richesse mondiale s’explique par le rendement du capital, lequel a dépassé la croissance elle-même sur longue période.',
      'Sans redistribution de la part des États, les gains de productivité tendent à profiter surtout aux détenteurs de capital plutôt qu’aux salariés.'
    ],
    [
      'Lorsque les astronomes auront confirmé une biosignature de manière indépendante, ils pourront enfin distinguer une origine biologique d’une simple origine abiotique.',
      'Avant que l’instrument n’ait franchi plusieurs niveaux de vérification, aucune annonce ne saurait être qualifiée de découverte plutôt que d’indice préliminaire.'
    ],
    [
      'Quoique l’édition somatique soit désormais bien maîtrisée, l’édition germinale demeure suspendue à un moratoire international informel.',
      'Encore que la précision de CRISPR soit remarquable, elle n’élimine pas entièrement le risque d’effets hors cible sur le génome.'
    ],
    [
      'L’épuisement professionnel est décrit par l’OMS comme un déséquilibre entre exigences et ressources, sans que la responsabilité en soit réduite à l’individu.',
      'Une charge de travail excessive a été maintenue par certaines organisations, ce qui a rendu les solutions purement individuelles insuffisantes.'
    ],
    [
      'La plupart des personnes déplacées, dont le nombre dépasse cent millions, restent dans un pays limitrophe plutôt que de rejoindre un pays riche.',
      'Ce à quoi s’ajoute l’absence de voies légales suffisantes, ce dont dépend en grande partie la persistance de la migration irrégulière.'
    ],
    [
      'Puisque la désinformation vise surtout des convictions déjà établies, dès lors la conversion massive d’électeurs indécis paraît moins probable qu’on ne le suppose.',
      'La viralité d’un contenu trompeur tient à l’émotion qu’il suscite, si bien que sa diffusion dépasse presque toujours celle de son démenti.'
    ],
    [
      'Les trois légitimations — critique, institutionnelle et marchande — convergeant sur un même artiste, elles produisent un effet cumulatif difficile à inverser.',
      'Le prix d’une œuvre ayant explosé sur le marché secondaire, l’artiste vivant n’en tire généralement aucun bénéfice direct.'
    ],
    [
      'Il se pourrait qu’un système paraisse neutre alors même qu’il encoderait une hiérarchie de valeurs à travers le choix d’un simple proxy.',
      'Il conviendrait que l’explicabilité et la supervision humaine soient garanties ; la performance seule ne saurait, à elle seule, légitimer une décision automatisée.'
    ]
  ]
};

const C2_OPENINGS = [
  'Pendant longtemps, l’âge adulte a été présenté comme une frontière biologique après laquelle l’apprentissage deviendrait presque marginal.',
  'Dans une salle d’étude, deux stratégies produisent des sensations opposées : l’une rassure immédiatement, l’autre oblige la mémoire à travailler.',
  'Chaque soir, des applications promettent d’enseigner des mots nouveaux sans interrompre le sommeil, comme si le cerveau restait disponible à toute sollicitation.',
  'On rencontre parfois des apprenants capables de suivre une conférence complexe, mais encore hésitants lorsqu’ils doivent formuler une réponse spontanée.',
  'Sur un même écran, une voix, des sous-titres et des images sollicitent simultanément l’attention de l’apprenant.',
  'Attendre de posséder toutes les formes avant de prendre la parole paraît prudent, mais cette prudence peut retarder l’apprentissage qu’elle prétend protéger.',
  'Dans certaines classes, presque chaque erreur reçoit une correction ; ailleurs, l’enseignant intervient seulement lorsque la compréhension est menacée.',
  'Avant de produire un son nouveau, l’apprenant doit souvent parvenir à entendre une différence que sa langue première lui avait appris à ignorer.',
  'Au moment de parler devant le groupe, des connaissances pourtant disponibles quelques minutes plus tôt semblent parfois devenir inaccessibles.',
  'Les méthodes universelles séduisent parce qu’elles promettent une réponse simple à des profils d’apprentissage profondément différents.',
  'Un mot accompagné de sa traduction paraît immédiatement accessible, mais cette première équivalence ne garantit ni ses usages ni ses nuances.',
  'Un assistant artificiel peut répondre sans attendre, varier les exercices et commenter chaque production avec une fluidité impressionnante.'
];

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function splitSentences(text) {
  return clean(text)
    .split(/(?<=[.!?…])(?:[»”])?\s+(?=[«“]?[A-ZÀÂÇÉÈÊËÎÏÔÙÛÜŸ])/u)
    .map(clean)
    .filter(Boolean);
}

function wordCount(text) {
  return clean(text).split(/\s+/).filter(Boolean).length;
}

function excerptForAudio(text, minimumWords, maximumWords) {
  const sentences = splitSentences(text);
  const selected = [];
  let count = 0;
  for (const sentence of sentences) {
    const nextCount = count + wordCount(sentence);
    if (selected.length && nextCount > maximumWords && count >= minimumWords) break;
    selected.push(sentence);
    count = nextCount;
    if (count >= minimumWords && count >= maximumWords - 12) break;
  }
  if (count < minimumWords) {
    throw new Error(`Texte source trop court pour une adaptation de ${minimumWords} mots.`);
  }
  return selected.join(' ');
}

function sentenceSegments(transcript) {
  return splitSentences(transcript).map((text, index) => ({
    id: `segment-${String(index + 1).padStart(2, '0')}`,
    order: index + 1,
    text
  }));
}

function vocabularyTerms(unit) {
  const items = unit.activities?.vocabulary?.vocabulary || [];
  return items
    .map((item) => clean(item?.word || item?.term || item))
    .filter(Boolean)
    .slice(0, 6)
    .map((term) =>
      term
        .replace(/\s*\([^)]*\)\s*/g, ' ')
        .replace(/\(e\)/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    );
}

function lexicalBridge(terms) {
  if (!terms.length) return '';
  const finalTerm = terms[terms.length - 1];
  const preceding = terms.slice(0, -1).join(', ');
  return (
    `Six notions permettent de suivre le raisonnement : ${preceding} et ${finalTerm}. ` +
    'Elles ne constituent pas une simple liste : chacune éclaire une étape, une tension ou une conséquence du problème.'
  );
}

function removeRepeatedTitleLead(readingText, title) {
  let source = clean(readingText);
  const cleanTitle = clean(title);
  if (cleanTitle && source.startsWith(cleanTitle)) {
    source = source.slice(cleanTitle.length).trim();
  }
  return source.replace(
    /^pose une question centrale pour la science contemporaine de l’apprentissage\.\s*/i,
    ''
  );
}

function buildAlignedTranscript(readingText, terms, grammarModels, level, opening = '') {
  const baseMinimum = level === 'C2' ? 112 : 92;
  const baseMaximum = level === 'C2' ? 142 : 118;
  const base = excerptForAudio(readingText, baseMinimum, baseMaximum);
  return clean([
    opening,
    base,
    lexicalBridge(terms),
    ...grammarModels,
    level === 'C2'
      ? 'À ce niveau, la conclusion reste indissociable des réserves qui en déterminent la portée.'
      : '',
    'Ce cadre permet enfin de relier les faits à une décision argumentée.'
  ].join(' '));
}

function applyFrenchC1C2Listening(units, level) {
  const minimumWords = level === 'C2' ? 225 : 185;
  const maximumWords = level === 'C2' ? 300 : 250;

  units.forEach((unit, index) => {
    const listening = unit.activities?.listening;
    const reading = unit.activities?.reading?.reading;
    const readingText =
      reading?.text || (Array.isArray(reading?.parts) ? reading.parts.join(' ') : '');
    if (!listening || !readingText) {
      throw new Error(`${level} ${unit.slug}: Reading ou Listening introuvable.`);
    }
    const format = FORMATS[index % FORMATS.length];
    const baseTitle = clean(reading.title || unit.activities.reading.title || unit.title);
    const terms = vocabularyTerms(unit);
    const grammarModels = GRAMMAR_MODELS[level]?.[index] || [];
    const opening = level === 'C2' ? C2_OPENINGS[index] : '';
    const adaptedReadingText =
      level === 'C2' ? removeRepeatedTitleLead(readingText, baseTitle) : readingText;
    const transcript = buildAlignedTranscript(
      adaptedReadingText,
      terms,
      grammarModels,
      level,
      opening
    );
    const transcriptWords = wordCount(transcript);
    if (transcriptWords < minimumWords || transcriptWords > maximumWords) {
      throw new Error(
        `${level} ${unit.slug}: transcription alignée hors plage (${transcriptWords} mots).`
      );
    }

    listening.title = `${FORMAT_TITLES[format]} : ${baseTitle}`;
    listening.description =
      `Adaptation audio monologique de niveau ${level}, reliée au dossier de l’unité.`;
    listening.intro =
      'Une seule personne développe le sujet. Repère la thèse, les nuances, les preuves et les limites.';
    listening.listeningType = 'monologue';
    listening.listeningFormat = format;
    listening.storyTitle = listening.title;
    listening.mainTranscript = transcript;
    listening.transcript = transcript;
    listening.transcriptSegments = sentenceSegments(transcript);
    listening.dialogue = [];
    listening.curricularAlignment = {
      readingTitle: baseTitle,
      vocabulary: terms,
      grammar: clean(unit.activities?.grammar?.title),
      grammarModels
    };
  });
  return units;
}

module.exports = {
  applyFrenchC1C2Listening,
  buildAlignedTranscript,
  excerptForAudio,
  removeRepeatedTitleLead,
  vocabularyTerms,
  wordCount
};
