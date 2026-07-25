// English C2: extended interdisciplinary essays, high-precision vocabulary
// and grammar for nuanced academic/professional argument. Full L2 immersion.
const topics = [
  ['epistemic-fragmentation','Epistemic Fragmentation and Public Knowledge','When Facts Lose Their Common Ground',
    'Public disagreement increasingly concerns not only conclusions but the institutions, methods and witnesses considered credible.',
    'Fragmented media systems can widen participation while dissolving the shared procedures through which claims are corrected.',
    'A durable response must distinguish plural interpretation from indifference to evidence and rebuild transparent practices of verification.',
    ['epistemic','knowledge-related','provenance','documented origin','corroboration','independent confirmation','falsifiability','capacity to be disproved','testimonial','based on a witness account','adjudicate','judge between competing claims','credibility deficit','shortage of public trust','information ecology','system through which information circulates','methodological','concerning methods of inquiry','consensus formation','process of reaching qualified agreement','counterevidence','evidence opposing a claim','epistemic humility','recognition of the limits of knowledge'],
    'Layered concession and counterexpectation','acknowledge legitimate plurality while defending evidential standards',
    'Use much as, even granting that, for all that and be that as it may to concede a substantial point before introducing a carefully delimited counterclaim.'],
  ['quantum-security','Quantum Computing and Cryptographic Transition','Security Before the Breakthrough',
    'Quantum computing remains technically uncertain, yet institutions must decide when to replace cryptographic systems whose failure could expose data retrospectively.',
    'Preparing too slowly creates long-term vulnerability; preparing indiscriminately can waste resources and produce a false sense of security.',
    'Risk governance should combine cryptographic inventory, staged migration, interoperability and explicit assumptions about technological timelines.',
    ['cryptographic','related to coded information security','decryption','conversion of coded data into readable form','fault-tolerant','able to operate despite component failures','computationally intractable','impractical to solve with available computation','interoperability','ability of systems to work together','migration pathway','planned route from one system to another','threat model','structured account of possible attacks','retrospective exposure','future disclosure of previously collected data','contingency','provision for an uncertain event','protocol agility','capacity to replace security methods','asymmetric encryption','encryption using paired public and private keys','risk horizon','time period over which danger is assessed'],
    'Future-in-the-past and prospective perfect aspect','locate forecasts, obligations and completed transitions across uncertain timelines',
    'Use was/were to have, would have been, is projected to have and will have been to distinguish abandoned plans, retrospective expectations and future completion.'],
  ['synthetic-biology','Synthetic Biology and the Governance of Creation','Designing Life, Distributing Risk',
    'Synthetic biology increasingly treats biological systems as design spaces, creating potential benefits in medicine, manufacturing and environmental repair.',
    'The language of engineering promises control, although living systems evolve, interact with environments and exceed laboratory intentions.',
    'Legitimate governance must connect technical containment with public deliberation, distributional analysis and responsibility across long time horizons.',
    ['biosafety','prevention of accidental biological harm','biosecurity','prevention of deliberate biological misuse','containment','measures restricting spread','gene drive','genetic mechanism increasing inheritance of a trait','dual-use','capable of beneficial and harmful application','ecological release','introduction into an ecosystem','reversibility','capacity for an intervention to be undone','distributional','concerning how effects are shared','precautionary','intended to prevent harm under uncertainty','stewardship','responsible long-term management','emergent property','system behaviour not reducible to individual parts','governance gap','absence of adequate rules or institutions'],
    'Advanced passive and responsibility framing','control when agency is backgrounded and restore it when accountability matters',
    'Combine passive reporting, get-passives, have something done and explicit by-phrases; choose agency strategically rather than automatically.'],
  ['solar-geoengineering','Solar Geoengineering and Climate Authority','Who May Dim the Sun?',
    'Proposals to reflect a small proportion of sunlight force climate politics to confront interventions whose effects would cross every border.',
    'Modelling suggests possible temperature reduction, but regional consequences, termination risk and political conflict remain deeply uncertain.',
    'Research governance must not become tacit authorisation for deployment; it requires public oversight, international restraint and explicit exit conditions.',
    ['radiative forcing','change in the balance of incoming and outgoing energy','stratospheric aerosol','small particle introduced into the upper atmosphere','termination shock','rapid warming after an intervention stops','deployment threshold','condition required before use','transboundary','crossing national borders','moral hazard','risk that protection encourages greater risk-taking','climate attribution','analysis connecting events to climatic causes','scenario modelling','simulation of possible future conditions','legitimacy','justified and accepted authority','moratorium','temporary prohibition','governance architecture','arrangement of institutions and rules','irreversibility','inability to restore a previous state'],
    'Inversion across complex negative adverbials','create controlled emphasis in formal warnings and limitations',
    'Invert auxiliary and subject after under no circumstances, only insofar as, not merely and little did; avoid inversion when the negative phrase is not fronted.'],
  ['neurotechnology-agency','Neurotechnology, Agency and Mental Privacy','The Last Private Territory',
    'Devices that infer or influence neural activity challenge legal distinctions between thought, behaviour, health data and personal identity.',
    'Clinical benefits may be profound, yet commercial systems can convert probabilistic signals into claims about intention or character.',
    'Mental privacy requires limits on collection and inference, meaningful consent and protection against discrimination based on uncertain neural predictions.',
    ['neural inference','conclusion drawn from nervous-system signals','cognitive liberty','freedom over one’s own mental processes','mental privacy','protection of thoughts and neural information','probabilistic','expressed in terms of likelihood','neurodiscrimination','unfair treatment based on neural data','informed consent','agreement based on adequate understanding','decisional autonomy','capacity to make one’s own choices','biometric','based on measurable biological characteristics','interpretive overreach','conclusion extending beyond what data supports','neuroplasticity','capacity of the brain to change','clinical validity','evidence that a measure reflects a condition','identity claim','assertion about who a person fundamentally is'],
    'Clefting, fronting and thematic progression','manage information focus across dense analytical paragraphs',
    'Use it-clefts, wh-clefts and fronted complements to connect given information to new emphasis without producing theatrical or ambiguous prose.'],
  ['democratic-resilience','Democratic Resilience and Institutional Erosion','The Coup That Never Arrives',
    'Contemporary democratic decline often proceeds through legal-looking changes that gradually weaken oversight, competition and independent administration.',
    'Each isolated reform may appear defensible, while their cumulative interaction transforms the conditions under which power can be challenged.',
    'Resilience depends less on ceremonial commitments than on enforceable constraints, professional institutions and citizens able to recognise incremental capture.',
    ['democratic backsliding','gradual decline in democratic standards','institutional capture','control of institutions for private or partisan ends','executive aggrandisement','expansion of executive power through legal means','checks and balances','institutions that limit one another’s power','incremental','occurring through small successive changes','pluralism','coexistence of competing groups and views','judicial independence','freedom of courts from improper influence','electoral integrity','fairness and reliability of elections','civic space','conditions enabling public participation and organisation','accountability mechanism','process requiring power holders to explain actions','authoritarian legalism','use of law to weaken democratic competition','institutional resilience','capacity of institutions to resist and recover'],
    'Complex conditionals with implicit premises','reason about institutional paths without repetitive if-clauses',
    'Use but for, otherwise, supposing, provided that and inverted had/were/should clauses to encode necessary, sufficient and counterfactual conditions precisely.'],
  ['global-tax-justice','Global Taxation, Mobility and Justice','Where Does Profit Belong?',
    'Digital production and mobile capital complicate the idea that taxable profit belongs neatly where a company is formally registered.',
    'Coordination can reduce artificial profit shifting, yet uniform rules may constrain lower-income states differently from wealthy market jurisdictions.',
    'A defensible settlement must address allocation, enforcement capacity, transparency and the unequal bargaining power embedded in technical standards.',
    ['tax base','income or activity subject to taxation','profit shifting','moving reported profit to reduce tax','jurisdiction','territory with legal authority','beneficial ownership','person who ultimately controls or benefits','transfer pricing','pricing of transactions within a corporate group','tax incidence','distribution of who ultimately bears a tax','fiscal sovereignty','authority of a state over taxation','minimum effective rate','lowest actual tax rate after adjustments','allocation rule','formula assigning taxing rights','regulatory arbitrage','use of differences between legal systems','compliance burden','cost of meeting regulatory requirements','distributional justice','fairness in the allocation of benefits and burdens'],
    'Nominalisation, grammatical metaphor and unpacking','compress technical argument without obscuring actors or causal sequence',
    'Use nominalisation to build abstract reasoning, then unpack dense noun phrases with finite clauses whenever agency, time or causation would otherwise disappear.'],
  ['museum-restitution','Museum Restitution and Colonial Collections','The Object That Refuses to Stay Silent',
    'Debates over restitution concern legal title, violent acquisition, cultural continuity and the authority to interpret objects removed under colonial rule.',
    'Universal museums claim to preserve shared heritage, but universality can mask histories in which access and possession were radically unequal.',
    'Responsible resolution may include return, shared custody, provenance research and institutional transformation rather than a single formula for every object.',
    ['restitution','return of property to a rightful holder','repatriation','return to a country or community of origin','provenance research','investigation of an object’s ownership history','inalienable','not legally transferable','custodianship','responsibility for care rather than ownership','colonial acquisition','obtaining objects under colonial power relations','cultural patrimony','heritage associated with a community or nation','legal title','formal right of ownership','ethical claim','demand grounded in moral reasoning','shared stewardship','joint responsibility for care and interpretation','deaccession','formal removal from a collection','historical redress','action intended to remedy past injustice'],
    'Distancing, evidentiality and attributed stance','represent contested historical claims without false neutrality',
    'Use is said to, is understood to have, reportedly, according to and stance-rich reporting verbs to distinguish evidence, attribution and institutional position.'],
  ['rights-of-nature','Rights of Nature and Legal Personhood','Can a River Speak in Court?',
    'Legal systems increasingly experiment with recognising ecosystems as rights-bearing entities represented by guardians or communities.',
    'Personhood may create standing and reshape legal imagination, but symbolic rights achieve little without institutions, funding and enforceable remedies.',
    'The strongest models connect ecological limits with representation, indigenous authority and clearly specified duties for governments and private actors.',
    ['legal personhood','status of being recognised as a legal person','standing','right to bring a matter before a court','rights-bearing','possessing legally recognised rights','guardianship','authority to represent another’s interests','ecological integrity','wholeness and functioning of an ecosystem','remedy','legal means of correcting harm','justiciable','capable of being decided by a court','indigenous jurisprudence','legal reasoning rooted in indigenous traditions','anthropocentric','centred on human interests','relational ontology','view that entities exist through relationships','enforceability','capacity of a rule to be applied effectively','statutory duty','obligation created by legislation'],
    'Subjunctive, mandative and formulaic legal structures','express recommendations, requirements and hypothetical legal reasoning',
    'Use the mandative subjunctive after demand/recommend/essential that, were-subjunctive in hypotheticals and fixed forms such as be that as it may.'],
  ['exoplanet-biosignatures','Exoplanets, Biosignatures and Scientific Restraint','A Signal Is Not a Discovery',
    'Astronomers can infer atmospheric composition across immense distances, but a possible biosignature remains several inferential steps from evidence of life.',
    'Individual gases may have biological sources while also arising through poorly understood geological or photochemical processes.',
    'Strong discovery claims require converging observations, explicit alternative hypotheses and instruments capable of testing rather than merely repeating an anomaly.',
    ['biosignature','feature that may indicate biological activity','spectroscopy','analysis of matter through its interaction with light','atmospheric composition','mixture of gases surrounding a planet','false positive','result incorrectly suggesting the phenomenon sought','abiotic','not produced by living processes','habitability','capacity of an environment to support life','inferential chain','sequence of reasoning from evidence to conclusion','signal-to-noise ratio','strength of a signal relative to interference','convergent evidence','independent evidence supporting the same conclusion','photochemistry','chemical reactions driven by light','observational constraint','measurement limiting possible explanations','agnostic biosignature','possible sign of life not tied to familiar biology'],
    'Epistemic modality and scalar certainty','align grammatical commitment with the strength of scientific inference',
    'Distinguish must, should, may, might conceivably and cannot yet be excluded; combine modality with evidential source and scope to avoid inflated certainty.'],
  ['translation-worldviews','Translation, Worldviews and Untranslatability','What Survives Between Languages?',
    'Literary and cultural translation does not move a stable package of meaning between interchangeable codes; it reconstructs relations among voice, history and expectation.',
    'Claims of untranslatability protect difference but can also romanticise linguistic isolation and underestimate creative interpretation.',
    'Ethical translation makes losses and choices visible, preserves productive strangeness and treats readers as capable of encountering unfamiliar conceptual worlds.',
    ['untranslatability','resistance to complete transfer between languages','semantic range','set of meanings a form may carry','pragmatic force','effect an utterance has in context','domestication','translation adapted strongly to target expectations','foreignisation','translation preserving features of source difference','cultural mediation','interpretation between cultural contexts','paratext','material surrounding a main text, such as notes','equivalence','claimed correspondence between forms or meanings','polysemy','presence of multiple related meanings','register shift','change in social or stylistic level','interpretive loss','meaning diminished through interpretation','linguistic relativity','relationship between language and habitual thought'],
    'Ellipsis, substitution and cohesive economy','create sophisticated cohesion without ambiguous omission',
    'Use do so, so/not, one/ones, auxiliary ellipsis and comparative deletion when the recoverable material is exact; repeat the noun when competing antecedents exist.'],
  ['existential-risk','Existential Risk and Obligations to the Future','The Ethics of Unborn Generations',
    'Long-term risk analysis asks present institutions to consider harms whose probability, scale and timing are radically uncertain.',
    'Attention to catastrophic risk can correct political short-termism, yet abstract future populations may displace urgent duties to people already vulnerable.',
    'Serious long-term governance should connect prevention with present justice, democratic accountability and policies valuable across several plausible futures.',
    ['existential risk','risk threatening humanity’s long-term potential or survival','intergenerational','involving relationships between generations','expected value','probability-weighted value of possible outcomes','fat-tailed risk','risk distribution allowing extreme outcomes','moral uncertainty','uncertainty about which ethical theory is correct','option value','benefit of preserving future choices','discount rate','rate reducing the present value of future effects','precautionary principle','reason to prevent serious harm despite uncertainty','catastrophic threshold','point beyond which damage becomes extreme','robust policy','policy performing acceptably across scenarios','longtermism','view emphasising effects on the far future','present bias','tendency to favour immediate outcomes'],
    'Dense noun phrases and postmodification','construct and decode information-rich C2 academic sentences',
    'Build noun phrases with coordinated premodifiers and layered relative, prepositional and participle postmodification; control attachment so each modifier has one plausible head.']
];

const q=(prompt,options,answer,explanation)=>({type:'mcq',prompt,options,answer,explanation});
const activity=(skill,fields)=>({skill,duration:skill==='reading'?32:skill==='grammar'?24:22,xp:skill==='reading'?60:50,...fields});
const referencesByTopic = {
  'epistemic-fragmentation': [
    { author: 'UNESCO', title: 'Internet for Trust', url: 'https://www.unesco.org/en/internet-trust' }
  ],
  'quantum-security': [
    { author: 'National Institute of Standards and Technology', year: '2024', title: 'NIST Releases First 3 Finalized Post-Quantum Encryption Standards', url: 'https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards' }
  ],
  'synthetic-biology': [
    { author: 'World Health Organization', year: '2022', title: 'Global guidance framework for the responsible use of the life sciences', url: 'https://www.who.int/publications-detail-redirect/9789240056107/' }
  ],
  'solar-geoengineering': [
    { author: 'United Nations Environment Programme', year: '2023', title: 'One Atmosphere: An Independent Expert Review on Solar Radiation Modification Research and Deployment', url: 'https://www.unep.org/resources/report/Solar-Radiation-Modification-research-deployment' }
  ],
  'neurotechnology-agency': [
    { author: 'UNESCO', year: '2025', title: 'Recommendation on the Ethics of Neurotechnology', url: 'https://www.unesco.org/en/legal-affairs/recommendation-ethics-neurotechnology' }
  ],
  'democratic-resilience': [
    { author: 'V-Dem Institute', year: '2026', title: 'Democracy Report 2026: Unraveling the Democratic Era?', url: 'https://v-dem.net/publications/democracy-reports/' }
  ],
  'global-tax-justice': [
    { author: 'OECD', title: 'Global Anti-Base Erosion Model Rules (Pillar Two)', url: 'https://www.oecd.org/en/topics/sub-issues/global-minimum-tax/global-anti-base-erosion-model-rules-pillar-two.html' }
  ],
  'museum-restitution': [
    { author: 'UNESCO', year: '1970', title: 'Convention on the Means of Prohibiting and Preventing the Illicit Transfer of Ownership of Cultural Property', url: 'https://www.unesco.org/en/legal-affairs/convention-means-prohibiting-and-preventing-illicit-import-export-and-transfer-ownership-cultural' }
  ],
  'rights-of-nature': [
    { author: 'United Nations General Assembly', year: '2019', title: 'Harmony with Nature: Report of the Secretary-General', url: 'https://documents.un.org/doc/undoc/gen/n19/232/63/pdf/n1923263.pdf' }
  ],
  'exoplanet-biosignatures': [
    { author: 'NASA Science', title: 'Ladder of Life Detection', url: 'https://science.nasa.gov/astrobiology/researchers/life-detection-resources/ladder-of-life-detection/' }
  ],
  'translation-worldviews': [
    { author: 'UNESCO', title: 'Multilingualism and Linguistic Diversity', url: 'https://www.unesco.org/en/multilingualism-linguistic-diversity' }
  ],
  'existential-risk': [
    { author: 'United Nations', year: '2024', title: 'Pact for the Future', url: 'https://www.un.org/pact-for-the-future/en/pact-future-0' }
  ]
};

function essay(topic) {
  const [,,title,problem,tension,response]=topic;
  return [
    `${title} begins with a difficulty that resists the usual demand for a simple position. ${problem} At C2 level, the central task is not merely to identify arguments but to reconstruct the assumptions that allow those arguments to count as reasonable in the first place.`,
    `The issue is frequently narrated as a conflict between innovation and restraint. That framing is useful, yet incomplete. It compresses institutional history, unequal exposure to risk and disagreement about legitimate authority into two apparently symmetrical choices. Once those suppressed dimensions are restored, the vocabulary of “progress” and “delay” becomes less neutral than it initially appears.`,
    `${tension} The apparent contradiction is not evidence that analysis has failed. It indicates that the object of analysis contains values that cannot be maximised simultaneously. Precision therefore requires a distinction between empirical claims, forecasts, legal classifications and ethical judgements, even when a single paragraph moves among all four.`,
    `Evidence in such debates is rarely absent; it is unevenly distributed and differently interpreted. Quantitative models can reveal scale and sensitivity, while qualitative accounts disclose mechanisms, lived consequences and categories the model may have assumed rather than tested. Neither form should be treated as automatically superior. Their relevance depends on the question, the quality of collection and the inferential distance between observation and conclusion.`,
    `Language plays a constitutive role. Passive constructions can appropriately foreground a process, but they can also remove the actor responsible for it. Nominalisation can condense a chain of reasoning, yet an overloaded noun phrase may conceal time, causation or disagreement. Modal verbs similarly encode a hierarchy of confidence: what must follow logically is not the same as what may occur under a scenario.`,
    `A serious counterargument deserves more than ceremonial mention. It should identify the strongest competing explanation, specify the evidence that would support it and show which premise of the original claim it challenges. This practice differs from false balance: not every position has equal evidential standing, but every consequential conclusion benefits from exposure to the best available objection.`,
    `Historical comparison can sharpen that objection, provided analogy is not mistaken for identity. Earlier controversies reveal how categories, institutions and incentives developed; they do not mechanically predict the present. The disciplined reader asks which structural features genuinely recur, which differences alter the causal pathway and whose archive has been preserved strongly enough to shape the comparison.`,
    `Scale further complicates evaluation. A policy that appears efficient globally may impose concentrated costs locally; an intervention that succeeds in a controlled setting may depend on institutions unavailable elsewhere. Distribution is therefore not an optional ethical appendix. It changes feasibility, compliance and the durability of the result.`,
    `Implementation also produces knowledge rather than simply applying it. Rules are interpreted by administrators, technologies are adapted by users and affected groups discover consequences that designers did not anticipate. Feedback mechanisms must therefore be treated as part of the intervention itself. Without them, initial assumptions harden into administrative facts and uncertainty is transferred to those least able to contest it.`,
    `${response} This conclusion is deliberately conditional. It identifies a direction while preserving criteria for revision. Responsible institutions should announce what outcomes they expect, what evidence would count against their approach and who possesses the authority to alter or terminate it.`,
    `The broader lesson concerns intellectual posture. Epistemic humility is not indecision, just as confidence is not certainty. A mature judgement can be firm about established evidence, explicit about unresolved mechanisms and provisional about forecasts. That combination is more demanding than either scepticism or advocacy because it makes the structure of commitment visible.`,
    `Ultimately, C2 reading asks the learner to follow argument across levels: sentence, paragraph, institution and worldview. The achievement lies not in producing maximal complexity but in controlling complexity—deciding what must be stated, what can be implied, which alternative must be answered and where a carefully qualified conclusion is stronger than an absolute one.`
  ].join('\n\n');
}

function vocab(topic) {
  const words=topic[6];
  const out=[];
  for(let i=0;i<words.length;i+=2) out.push({word:words[i],translation:'',definition:words[i+1],example:`The essay uses “${words[i]}” to make a precise distinction.`,partOfSpeech:words[i].includes(' ')?'phrase':'noun'});
  return out;
}

function grammarExercises(topic) {
  const name=topic[7], purpose=topic[8], rule=topic[9];
  const stems=[
    [`Which sentence best demonstrates controlled use of ${name}?`,`Although the evidence remains incomplete, the conclusion may still be provisionally warranted.`],
    [`Which revision best serves the purpose “${purpose}”?`,`Even granting the objection, the narrower claim remains defensible on the available evidence.`],
    ['Which sentence most accurately calibrates certainty?',`The mechanism cannot yet be confirmed, though it should not be excluded from further analysis.`],
    ['Which option maintains an appropriately formal C2 register?',`The proposal warrants scrutiny insofar as its assumptions have not been independently tested.`],
    ['Which sentence makes the relationship between evidence and inference clearest?',`The observation supports the hypothesis; it does not, by itself, establish the predicted causal pathway.`],
    ['Which option avoids concealing responsibility?',`The regulatory agency delayed publication, leaving affected communities unable to evaluate the decision.`],
    ['Which sentence integrates a substantial counterargument?',`Much as the model improves prediction, it does not resolve the distributional question on which implementation depends.`],
    ['Which conclusion is most appropriately qualified?',`On balance, the policy appears defensible, provided that its safeguards remain independently enforceable.`],
    ['Which sentence shows cohesive control across clauses?',`The first account explains the timing; the second, the institutional conditions that made the outcome possible.`],
    [`Which statement accurately describes ${name}?`,rule]
  ];
  return stems.map(([prompt,correct],index)=>q(
    prompt,
    [
      index % 4 === 0 ? correct : 'The claim proves itself because complexity always guarantees accuracy.',
      index % 4 === 1 ? correct : 'Evidence is being perhaps conclusion without any stated limitation.',
      index % 4 === 2 ? correct : 'The issue is very big and people should basically fix it somehow.',
      index % 4 === 3 ? correct : 'Having considered by the evidence, the policy definitely must perhaps succeed.'
    ],
    index % 4,
    `The correct option applies ${name} with controlled form, scope, register and evidential commitment.`
  ));
}

function test(topic, exercises) {
  return {
    id:`english-c2-${topic[0]}-grammar-test`,
    passingScore:70,
    questions:exercises.map((exercise,index)=>({
      id:`english-c2-${topic[0]}-grammar-q${index+1}`,
      type:'mcq',
      prompt:exercise.prompt,
      options:exercise.options.map((text,optionIndex)=>({id:['a','b','c','d'][optionIndex],text})),
      correctOptionId:['a','b','c','d'][exercise.answer],
      explanation:exercise.explanation
    }))
  };
}

function buildUnit(topic,index) {
  const [slug,title,readingTitle,,,response,,grammar,purpose,rule]=topic;
  const vocabulary=vocab(topic);
  const readingText=essay(topic);
  const readingExercises=[
    q('What is the essay’s central analytical demand?',['To reconstruct the assumptions that make arguments appear reasonable','To select the longest argument','To reject every model','To avoid ethical judgement'],0),
    q('Why is the innovation-versus-restraint framing incomplete?',['It contains no verbs','It suppresses history, unequal risk and questions of authority','It is always scientifically false','It only applies to literature'],1),
    q('What does the essay say about empirical and ethical claims?',['They are identical','Ethical claims replace evidence','They should be distinguished even when they interact','Neither belongs in C2 writing'],2),
    q('How are quantitative and qualitative evidence compared?',['Relevance depends on the question and quality of inference','Numbers are always superior','Accounts are always superior','Both are rejected'],0),
    q('What risk can nominalisation create?',['It always makes prose informal','It can conceal time, causation or disagreement','It prevents paragraphing','It removes vocabulary'],1),
    q('What makes a counterargument serious?',['It merely mentions disagreement','It identifies the strongest alternative and the premise challenged','It treats every view as equal','It avoids evidence'],1),
    q('Why does distribution affect feasibility?',['Concentrated costs can change compliance and durability','Distribution is only stylistic','Global averages describe every locality','It eliminates institutional differences'],0),
    q('Why is the conclusion conditional?',['The writer has no position','It preserves criteria for evidence-based revision','All conclusions must be vague','The topic is fictional'],1),
    q('How is epistemic humility defined?',['Permanent indecision','Recognition of limits alongside warranted judgement','Lack of expertise','Refusal to compare evidence'],1),
    q('What ultimately characterises C2 control?',['Using the longest possible sentences','Managing complexity across language, institutions and worldviews','Memorising isolated terminology','Avoiding qualified conclusions'],1),
    q(`Which response best fits the unit “${title}”?`,[response,'No institutional response is possible','Only individual opinion matters','Evidence should remain private'],0),
    q('What is the overall tone?',['Analytical, qualified and institutionally aware','Comic and dismissive','Purely autobiographical','Uncritically promotional'],0)
  ];
  const vocabularyExercises=vocabulary.map((item,i)=>q(
    `Which term means “${item.definition}”?`,
    [vocabulary[(i+3)%vocabulary.length].word,vocabulary[(i+1)%vocabulary.length].word,item.word,vocabulary[(i+5)%vocabulary.length].word],
    2
  ));
  const gExercises=grammarExercises(topic);
  return {
    slug,title,titleEs:title,description:`C2 interdisciplinary inquiry: ${readingTitle}.`,order:index+1,
    accessTier:index<2?'free':'premium',
    unitOverview:{objective:`Evaluate competing frameworks in ${title.toLowerCase()}.`,outcomes:['reconstruct implicit premises','evaluate layered evidence','use specialist vocabulary','control advanced grammar and register'],grammar:[grammar],vocabulary:vocabulary.slice(0,6).map(x=>x.word),scenario:readingTitle},
    activities:{
      reading:activity('reading',{title:readingTitle,description:`An extended C2 essay on ${title.toLowerCase()}.`,reading:{title:readingTitle,text:readingText,questions:readingExercises.slice(0,3).map(x=>x.prompt),references:referencesByTopic[slug]||[]},exercises:readingExercises}),
      vocabulary:activity('vocabulary',{title:`Conceptual Vocabulary: ${title}`,description:'Twelve high-precision terms defined and practised entirely in English.',vocabulary,exercises:vocabularyExercises}),
      grammar:activity('grammar',{title:grammar,description:`Use ${grammar} to analyse “${readingTitle}”.`,grammarNote:`Goal: ${purpose}.\n\nRule: ${rule}\n\nContext: Apply the structure to the claims, counterarguments and qualifications in “${readingTitle}”.`,phrases:gExercises.slice(0,4).map(x=>x.options[x.answer]),grammarProfile:{name:grammar,context:`Grammar connected to the C2 essay “${readingTitle}”.`,explanation:rule,purpose,examples:gExercises.slice(0,4).map(x=>x.options[x.answer])},exercises:gExercises,grammarTest:test(topic,gExercises)})
    }
  };
}

module.exports={
  language:'english',
  level:'C2',
  courseTitle:'English C2',
  courseDescription:'Mastery-level English through twelve extended interdisciplinary essays, conceptual vocabulary and advanced grammatical control.',
  units:topics.map(buildUnit)
};
