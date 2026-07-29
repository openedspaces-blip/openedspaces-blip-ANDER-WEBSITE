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
      'Quand bien même la neuroplasticité persisterait à l’âge adulte, une étude transversale ne suffirait pas à établir une inférence causale.',
      'Tout en reconnaissant la portée du faisceau d’indices, l’analyse en circonscrit les conséquences, encore qu’un réseau fonctionnel puisse se réorganiser avec l’entraînement.'
    ],
    [
      'La récupération active pourrait renforcer une trace mnésique davantage que la simple familiarité, mais ce résultat semblerait dépendre de l’espacement.',
      'Aucune méthode ne saurait donc être déclarée supérieure sans préciser le critère de maîtrise et les interférences observées.'
    ],
    [
      'Lorsque les chercheurs auront comparé le sommeil lent et le sommeil paradoxal, ils pourront mieux décrire la consolidation.',
      'Une fois l’encodage terminé, une réactivation ciblée pourrait modifier la trace ; encore faudra-t-il que l’analyse préenregistrée ait écarté les interprétations concurrentes.'
    ],
    [
      'La présentation de l’input compréhensible par les enseignants favorise le repérage, mais l’acquisition d’une connaissance productive par les apprenants n’est pas automatique.',
      'En restituant les agents, on voit que la transformation d’une connaissance réceptive en usage actif exige des tâches qui empêchent le savoir de rester inerte.'
    ],
    [
      'Puisque la multimodalité associe texte, son et image, elle fournit davantage d’indices prosodiques ; pourtant, elle peut aussi accroître la surcharge cognitive.',
      'L’étayage doit donc guider la segmentation, si bien qu’un test différé mesure un apprentissage durable plutôt qu’un simple effet de présentation.'
    ],
    [
      'Selon certains chercheurs, la négociation du sens ralentirait l’échange ; d’autres affirment qu’une demande de clarification déclenche précisément la reformulation utile.',
      'L’apprenant reconnaît qu’il cherche parfois une périphrase, tandis que l’enseignant répond que l’intelligibilité compte davantage que la perfection immédiate.'
    ],
    [
      'Bien que le feedback correctif soit utile, il faut qu’une reformulation implicite soit perçue pour déclencher une réparation.',
      'Pour peu que l’invite laisse à l’apprenant le temps de répondre, le transfert peut se produire sans que chaque erreur développementale soit traitée comme un échec.'
    ],
    [
      'Le contraste phonémique est d’abord perçu grâce à un indice acoustique, puis sa généralisation est testée par des voix variées.',
      'La compréhensibilité ne doit pas être confondue avec l’imitation d’un accent : elle est aussi construite par les traits suprasegmentaux et évaluée par les interlocuteurs.'
    ],
    [
      'Si l’anxiété langagière avait occupé moins de place dans la mémoire de travail, l’apprenant aurait moins recouru à l’autosurveillance et à l’évitement.',
      'Une exposition graduée aurait pu interrompre cette réciprocité causale ; eût-elle été imposée trop vite, elle aurait néanmoins renforcé la peur de l’erreur.'
    ],
    [
      'L’aptitude linguistique est une différence individuelle dont l’effet dépend des tâches auxquelles l’apprenant est confronté.',
      'Le transfert interlinguistique, auquel certaines études attribuent un rôle central, interagit avec le contexte dans lequel l’adaptation révisable est mise en œuvre.'
    ],
    [
      'Les gloses ayant facilité l’accès au sens, les apprenants peuvent ensuite observer la polysémie et les collocations en contexte.',
      'L’équivalence isolée étant insuffisante, une méta-régression intégrant plusieurs études permet d’estimer la profondeur lexicale réellement acquise.'
    ],
    [
      'Un modèle génératif pourrait personnaliser les exercices, mais il semblerait qu’une supervision humaine demeure nécessaire pour limiter l’hallucination.',
      'Il convient que l’ancrage contextuel et la traçabilité soient vérifiables ; l’effet de nouveauté ne saurait, à lui seul, prouver l’efficacité du tutorat.'
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
