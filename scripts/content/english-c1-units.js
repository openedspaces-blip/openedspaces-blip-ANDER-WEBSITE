// English C1: current scientific and social issues.
// Mirrors English B2's exact course shape: 12 units, each containing
// Reading + Vocabulary + Grammar, with 10/8/8 assessed questions.

const topics = [
  {
    slug: 'antimicrobial-resistance',
    title: 'Antimicrobial Resistance and One Health',
    readingTitle: 'When Medicines Stop Working',
    caseStudy: 'In 2026, health authorities begin implementing a renewed global plan against antimicrobial resistance across hospitals, farms and environmental systems.',
    finding: 'Drug resistance is not produced by one careless patient; antimicrobial use, weak infection control, limited diagnostics, sanitation gaps and environmental contamination interact across sectors.',
    tension: 'Restricting antibiotics can protect their effectiveness, but rules that ignore unequal access may leave treatable infections untreated.',
    response: 'A One Health strategy combines prevention, surveillance, responsible use, research incentives and access to effective treatment.',
    caution: 'Global targets require local data because resistance patterns and health-system capacity differ sharply.',
    words: [
      ['antimicrobial resistance','resistencia antimicrobiana','the ability of microbes to survive medicines intended to control them'],
      ['pathogen','patógeno','an organism capable of causing disease'],
      ['surveillance','vigilancia epidemiológica','the continuous collection and analysis of health data'],
      ['stewardship','gestión responsable','careful management intended to preserve a shared resource'],
      ['diagnostic','prueba diagnóstica','a test or method used to identify a condition'],
      ['One Health','Una Salud','an approach connecting human, animal and environmental health'],
      ['drug-resistant','farmacorresistente','not controlled by a medicine that was previously effective'],
      ['infection control','control de infecciones','measures that prevent infections from spreading']
    ],
    grammar: 'Nominalisation and controlled agency',
    purpose: 'compress scientific processes while keeping responsibility visible',
    rule: 'Convert processes into nouns when useful—resist → resistance—but restore an active verb when nominalisation conceals who acts.',
    examples: [
      ['Hospitals implemented the guidelines inconsistently.','The inconsistent implementation of the guidelines weakened infection control.'],
      ['Bacteria resist treatment more frequently.','The increasing resistance of bacteria to treatment requires coordinated surveillance.'],
      ['Authorities monitor antibiotic use.','The monitoring of antibiotic use supports responsible stewardship.'],
      ['The plan does not identify who must finance diagnostics.','The plan leaves responsibility for financing diagnostics unclear.']
    ]
  },
  {
    slug: 'ai-energy-demand',
    title: 'Artificial Intelligence and Energy Demand',
    readingTitle: 'The Hidden Infrastructure of AI',
    caseStudy: 'Energy analysts report that electricity demand from data centres rose rapidly in 2025 as AI investment expanded and grid connections became harder to secure.',
    finding: 'Efficiency per computing task is improving, yet total electricity use can still rise when demand grows faster than those savings.',
    tension: 'AI may help optimise energy systems and accelerate research, but its infrastructure can increase local pressure on grids, water and household affordability.',
    response: 'Transparent reporting, efficient hardware, flexible demand and low-carbon electricity must be assessed together rather than through a single global estimate.',
    caution: 'The footprint of an AI service depends on location, energy mix, model design, hardware utilisation and the scale of user demand.',
    words: [
      ['data centre','centro de datos','a facility containing computing and data-storage equipment'],
      ['electricity demand','demanda eléctrica','the amount of electrical energy required by users'],
      ['grid capacity','capacidad de la red','the amount of electricity a network can reliably transmit'],
      ['energy efficiency','eficiencia energética','the useful output obtained from a given amount of energy'],
      ['rebound effect','efecto rebote','increased use that offsets savings from greater efficiency'],
      ['computing workload','carga computacional','the processing tasks assigned to computing systems'],
      ['carbon intensity','intensidad de carbono','emissions produced per unit of energy or output'],
      ['bottleneck','cuello de botella','a constraint that limits the performance of a wider system']
    ],
    grammar: 'Hedging and epistemic modality',
    purpose: 'calibrate claims about rapidly changing technology and incomplete data',
    rule: 'Use may, appears to, is likely to and cannot be ruled out to match certainty to evidence; avoid presenting projections as observations.',
    examples: [
      ['AI will double global emissions.','AI-related demand may raise emissions where additional electricity is carbon-intensive.'],
      ['Efficiency solves the energy problem.','Efficiency gains appear likely to reduce energy per task, though total demand may still rise.'],
      ['Water use is irrelevant.','Local water constraints cannot be ruled out when cooling demand expands.'],
      ['Every model has the same footprint.','The footprint is likely to vary substantially across models, locations and workloads.']
    ]
  },
  {
    slug: 'gene-editing-access',
    title: 'Gene Editing, Treatment and Access',
    readingTitle: 'A Cure That Few Can Reach',
    caseStudy: 'The arrival of gene-editing therapies for severe inherited blood disorders transforms what is medically possible while exposing the difficulty of delivering complex treatment equitably.',
    finding: 'A therapy can be scientifically transformative and still have limited population impact if diagnosis, specialist centres, financing and long-term follow-up remain scarce.',
    tension: 'High initial prices may reflect research and manufacturing complexity, but they can also shift risk onto health systems and exclude countries carrying a large disease burden.',
    response: 'Outcome-based financing, technology transfer, regional treatment centres and continued investment in simpler therapies should be considered together.',
    caution: 'Early clinical success does not remove uncertainty about durability, late effects or access beyond highly selected patients.',
    words: [
      ['gene editing','edición genética','the deliberate alteration of DNA at a targeted location'],
      ['inherited disorder','trastorno hereditario','a condition transmitted through genetic material'],
      ['clinical trial','ensayo clínico','a controlled study of a medical intervention in people'],
      ['durability','durabilidad','the length of time a treatment effect continues'],
      ['eligibility criteria','criterios de elegibilidad','conditions determining who may receive a treatment'],
      ['technology transfer','transferencia tecnológica','sharing knowledge and capacity to produce a technology'],
      ['long-term follow-up','seguimiento a largo plazo','continued observation after treatment'],
      ['health equity','equidad sanitaria','fair opportunity to attain good health and receive care']
    ],
    grammar: 'Concession and qualification',
    purpose: 'acknowledge scientific achievement without overlooking access or uncertainty',
    rule: 'Use while, although, notwithstanding and adjective + though to concede a valid point before refining the main claim.',
    examples: [
      ['The treatment is promising, but access is narrow.','Promising though the treatment is, access remains extremely narrow.'],
      ['The trials were successful. Follow-up is still short.','While the trials were successful, long-term follow-up remains limited.'],
      ['Manufacturing is complex. Prices require scrutiny.','Notwithstanding the complexity of manufacturing, pricing requires public scrutiny.'],
      ['The therapy may cure individuals. It will not replace prevention.','Although the therapy may cure selected individuals, it will not replace broader care and prevention.']
    ]
  },
  {
    slug: 'climate-health-air-pollution',
    title: 'Climate, Air Pollution and Health',
    readingTitle: 'The Health Case for Clean Energy',
    caseStudy: 'Public-health agencies increasingly connect climate policy with immediate reductions in air pollution, energy poverty and preventable illness.',
    finding: 'Fossil-fuel combustion contributes both to long-term climate change and to pollutants that damage health in the present.',
    tension: 'Rapid transitions can produce major health benefits, but poorly designed energy reforms may raise costs for households with the least capacity to adapt.',
    response: 'Health impact assessment, targeted social protection and clean household energy can make decarbonisation both faster and fairer.',
    caution: 'National averages can hide neighbourhoods where exposure, housing quality and access to care create much greater risk.',
    words: [
      ['co-benefit','beneficio conjunto','an additional benefit produced by an action with another main goal'],
      ['particulate matter','material particulado','tiny airborne particles capable of harming health'],
      ['energy poverty','pobreza energética','inability to afford adequate household energy services'],
      ['decarbonisation','descarbonización','the reduction of carbon emissions from an economy or system'],
      ['health impact assessment','evaluación de impacto sanitario','a process estimating how a policy may affect health'],
      ['exposure','exposición','contact with an environmental hazard'],
      ['clean cooking','cocción limpia','cooking with fuels and technologies that limit harmful pollution'],
      ['environmental risk','riesgo ambiental','the chance of harm arising from environmental conditions']
    ],
    grammar: 'Participle clauses for cause and result',
    purpose: 'connect environmental mechanisms and health outcomes concisely',
    rule: 'Use -ing clauses for active or resulting relationships and past-participle clauses for passive conditions; keep the implied subject unambiguous.',
    examples: [
      ['Because fossil fuels release pollutants, they damage health.','Releasing both greenhouse gases and pollutants, fossil fuels damage health through several pathways.'],
      ['Communities are exposed to dirty air and face higher risk.','Exposed to persistent air pollution, communities face higher health risks.'],
      ['The policy reduced combustion and improved air quality.','The policy reduced combustion, improving local air quality.'],
      ['Officials considered household costs and redesigned the subsidy.','Having considered household costs, officials redesigned the subsidy.']
    ]
  },
  {
    slug: 'loneliness-public-health',
    title: 'Loneliness as a Public-Health Issue',
    readingTitle: 'More Than a Private Feeling',
    caseStudy: 'Health organisations now treat social isolation and loneliness as population-level concerns linked to community design, care systems and digital life.',
    finding: 'Loneliness is subjective, whereas social isolation can be measured through contact and networks; the two overlap but are not identical.',
    tension: 'Medical recognition can mobilise resources, but it may pathologise a social condition if the response is limited to individual treatment.',
    response: 'Community infrastructure, accessible transport, mental-health support and opportunities for meaningful participation should reinforce one another.',
    caution: 'Online contact can support connection for some people and deepen harmful comparison or withdrawal for others.',
    words: [
      ['loneliness','soledad percibida','a distressing feeling that social relationships are insufficient'],
      ['social isolation','aislamiento social','an objective lack of social contact or connection'],
      ['protective factor','factor protector','a condition associated with reduced risk'],
      ['social connection','conexión social','meaningful relationships and participation with others'],
      ['stigma','estigma','social disapproval that marks a person or condition negatively'],
      ['community infrastructure','infraestructura comunitaria','places and services supporting collective life'],
      ['mental well-being','bienestar mental','a person’s psychological and emotional state'],
      ['social prescription','prescripción social','referral to non-clinical community support or activities']
    ],
    grammar: 'Cleft and pseudo-cleft structures',
    purpose: 'focus attention on overlooked social mechanisms',
    rule: 'Use It is/was X that... and What X does is... to foreground a contrast or causal mechanism rather than merely adding emphasis.',
    examples: [
      ['The quality of connection matters most.','It is the quality of connection, not contact alone, that matters most.'],
      ['Accessible transport enables participation.','What accessible transport does is make regular participation possible.'],
      ['Policy often overlooks younger adults.','It is younger adults whom policy discussions often overlook.'],
      ['Medical framing can hide social causes.','What an exclusively medical framing can hide is the social production of isolation.']
    ]
  },
  {
    slug: 'ageing-care-economy',
    title: 'Ageing and the Care Economy',
    readingTitle: 'Longer Lives, Unequal Care',
    caseStudy: 'As populations age, governments debate how to finance long-term care without assuming that families—especially women—will absorb unlimited unpaid work.',
    finding: 'Longer life expectancy is a social achievement, but its benefits depend on health, income, housing and access to dignified support.',
    tension: 'Family care can express solidarity and preference, yet relying on it by default transfers public costs into unequal private burdens.',
    response: 'Integrated care, decent working conditions, support for unpaid carers and age-friendly housing form part of the same policy system.',
    caution: 'Older populations are highly diverse, so chronological age alone is a poor guide to need or capacity.',
    words: [
      ['long-term care','cuidados de larga duración','ongoing assistance for people with reduced functional capacity'],
      ['unpaid care','cuidados no remunerados','care work performed without formal payment'],
      ['care worker','trabajador de cuidados','a person employed to provide practical or personal support'],
      ['dependency ratio','tasa de dependencia','the ratio of dependant to working-age populations'],
      ['healthy ageing','envejecimiento saludable','developing and maintaining abilities that support well-being in later life'],
      ['ageism','edadismo','stereotyping or discrimination based on age'],
      ['care burden','carga de cuidados','the time, cost and responsibility involved in providing care'],
      ['age-friendly','adaptado a las personas mayores','designed to support participation and access across later life']
    ],
    grammar: 'Inversion after limiting adverbials',
    purpose: 'emphasise neglected evidence and delayed institutional responses',
    rule: 'After only then, rarely, never and not until, invert the auxiliary and subject: Only then did the system respond.',
    examples: [
      ['Governments rarely measure unpaid care accurately.','Rarely do governments measure unpaid care accurately.'],
      ['The burden became visible only after the survey.','Only after the survey did the scale of the burden become visible.'],
      ['Care systems have never faced this combination of demand and labour shortage.','Never have care systems faced this combination of demand and labour shortage.'],
      ['Policy changed only then.','Only then did policy begin to treat care as infrastructure.']
    ]
  },
  {
    slug: 'critical-minerals-transition',
    title: 'Critical Minerals and the Energy Transition',
    readingTitle: 'The Material Cost of Clean Technology',
    caseStudy: 'Demand for copper, lithium, battery materials and rare earths keeps growing as grids, storage and electric transport expand.',
    finding: 'Clean-energy technologies reduce dependence on fossil-fuel combustion but create new pressures in mining, refining, recycling and geopolitical supply chains.',
    tension: 'Rapid extraction may accelerate decarbonisation, yet weak standards can transfer environmental damage and labour risk to producing communities.',
    response: 'Diversified supply, material efficiency, recycling, traceability and community consent must complement new mining.',
    caution: 'Calling a mineral critical describes its strategic role and supply risk, not an excuse to suspend social or environmental safeguards.',
    words: [
      ['critical mineral','mineral crítico','a material considered essential and exposed to supply risk'],
      ['supply concentration','concentración del suministro','dependence on a small number of producing or processing locations'],
      ['refining','refinación','processing raw material into a usable form'],
      ['traceability','trazabilidad','the ability to track origin and movement through a supply chain'],
      ['recycling capacity','capacidad de reciclaje','the ability to recover useful material from products and waste'],
      ['community consent','consentimiento comunitario','meaningful agreement by affected local communities'],
      ['material intensity','intensidad material','the quantity of material required for a unit of output'],
      ['supply-chain resilience','resiliencia de la cadena de suministro','the ability of supply networks to withstand disruption']
    ],
    grammar: 'Mixed and inverted conditionals',
    purpose: 'connect past investment choices with present constraints and future risks',
    rule: 'Mixed conditionals connect different time frames; formal conditionals may omit if and invert had, were or should.',
    examples: [
      ['If recycling investment had started earlier, capacity would be higher now.','Had recycling investment started earlier, capacity would be higher now.'],
      ['If supply were more diverse, disruption would be less severe.','Were supply more diverse, disruption would be less severe.'],
      ['If demand should rise faster, shortages may appear.','Should demand rise faster, shortages may appear.'],
      ['Past policy ignored refining, so present dependence is high.','If past policy had not ignored refining, present dependence might be lower.']
    ]
  },
  {
    slug: 'deepfakes-democracy',
    title: 'Deepfakes, Evidence and Democracy',
    readingTitle: 'When Seeing Is No Longer Believing',
    caseStudy: 'Cheap synthetic media makes it easier to fabricate convincing political audio and video while also making authentic evidence easier to dismiss as fake.',
    finding: 'The democratic danger is not only deception; it is the broader erosion of shared standards for verifying public evidence.',
    tension: 'Rapid removal can limit harm, but opaque moderation may suppress satire, journalism or legitimate political speech.',
    response: 'Content provenance, independent verification, clear labels, public literacy and appeal procedures should operate together.',
    caution: 'Detection tools enter an arms race with generation systems and can produce false accusations when treated as perfect judges.',
    words: [
      ['deepfake','ultrafalso','synthetic audio, image or video designed to imitate a real person or event'],
      ['content provenance','procedencia del contenido','information documenting where and how media was created or edited'],
      ['synthetic media','medios sintéticos','media generated or substantially altered by computational systems'],
      ['verification','verificación','the process of checking authenticity or accuracy'],
      ['plausible deniability','negación plausible','the ability to deny responsibility when proof is uncertain'],
      ['media literacy','alfabetización mediática','skills for critically interpreting and evaluating media'],
      ['authentication','autenticación','confirmation that content or identity is genuine'],
      ['public trust','confianza pública','confidence in institutions, evidence and shared procedures']
    ],
    grammar: 'Complex reporting verbs',
    purpose: 'distinguish allegations, evidence, denial and verification',
    rule: 'Choose reporting verbs for evidential force and pattern: allege that, accuse someone of, deny doing, warn against, acknowledge that.',
    examples: [
      ['The candidate said the recording was fake.','The candidate alleged that the recording had been fabricated.'],
      ['Investigators said the campaign created it.','Investigators accused the campaign of creating the synthetic clip.'],
      ['The platform said it did not remove authentic footage.','The platform denied removing authentic footage.'],
      ['Researchers said not to trust detection alone.','Researchers warned against relying on detection tools alone.']
    ]
  },
  {
    slug: 'climate-migration-cities',
    title: 'Climate Migration and Cities',
    readingTitle: 'Moving Before the Crisis',
    caseStudy: 'Cities receiving people displaced by repeated floods, drought or livelihood loss must plan housing and services before movement becomes an emergency.',
    finding: 'Climate change influences mobility through economic, political and social pathways; it rarely acts as a single isolated cause.',
    tension: 'Calling people climate migrants can attract attention, but the label may oversimplify mixed motives and create legal expectations that current frameworks do not meet.',
    response: 'Adaptation in places of origin, safe mobility routes and inclusive urban planning are complementary rather than competing policies.',
    caution: 'Predictions of mass migration can become misleading when they convert populations at risk into assumed future migrants.',
    words: [
      ['climate mobility','movilidad climática','human movement influenced by climate impacts and responses'],
      ['displacement','desplazamiento','movement forced or pressured by dangerous conditions'],
      ['planned relocation','reubicación planificada','organised movement away from a place facing severe risk'],
      ['adaptive capacity','capacidad adaptativa','the resources and ability available to adjust to change'],
      ['receiving city','ciudad receptora','an urban area receiving new residents or displaced people'],
      ['livelihood','medio de vida','the work and resources through which people support themselves'],
      ['mobility pathway','ruta de movilidad','a process or route through which movement occurs'],
      ['urban inclusion','inclusión urbana','fair access to city services, rights and participation']
    ],
    grammar: 'Reduced relative and participle clauses',
    purpose: 'integrate causal and contextual information into formal analysis',
    rule: 'Reduce relative clauses only when reference remains clear: people who are displaced → people displaced; avoid dangling participles.',
    examples: [
      ['Cities that receive displaced households need resources.','Cities receiving displaced households need additional resources.'],
      ['Families who are affected by repeated floods may move gradually.','Families affected by repeated floods may move gradually.'],
      ['The policy was introduced after the drought and supported rental access.','Introduced after the drought, the policy supported rental access.'],
      ['Researchers compared several pathways and rejected a single-cause model.','Comparing several pathways, researchers rejected a single-cause model.']
    ]
  },
  {
    slug: 'neurotechnology-mental-privacy',
    title: 'Neurotechnology and Mental Privacy',
    readingTitle: 'Who Owns a Neural Signal?',
    caseStudy: 'Consumer and clinical devices increasingly record or interpret neural and physiological signals, raising questions about consent, inference and ownership.',
    finding: 'A neural signal is not a transparent copy of a thought, yet probabilistic inferences can still reveal or predict sensitive characteristics.',
    tension: 'Data sharing may improve treatment and accessibility, but consent given under technical complexity or economic pressure may not be meaningfully free.',
    response: 'Purpose limitation, data minimisation, security, independent oversight and rights to challenge consequential inferences are needed.',
    caution: 'Exceptional rules for brain data should not imply that other biometric and behavioural data are harmless.',
    words: [
      ['neurotechnology','neurotecnología','technology that measures or interacts with the nervous system'],
      ['neural data','datos neuronales','data derived from the activity or structure of the nervous system'],
      ['mental privacy','privacidad mental','protection against unwanted access to mental information or inference'],
      ['biometric inference','inferencia biométrica','a conclusion drawn from measurable biological characteristics'],
      ['purpose limitation','limitación de finalidad','using collected data only for specified legitimate purposes'],
      ['data minimisation','minimización de datos','collecting only data necessary for a defined purpose'],
      ['informed consent','consentimiento informado','voluntary agreement based on understandable relevant information'],
      ['cognitive liberty','libertad cognitiva','freedom over one’s mental processes and neural interventions']
    ],
    grammar: 'Mandative subjunctive',
    purpose: 'state formal ethical and regulatory recommendations precisely',
    rule: 'After recommend, require, propose and it is essential that, use the base form: Regulators require that consent be renewed.',
    examples: [
      ['Experts recommend that neural data is protected.','Experts recommend that neural data be protected.'],
      ['It is essential that every inference is challengeable.','It is essential that every inference be challengeable.'],
      ['The panel proposed that companies limited collection.','The panel proposed that companies limit collection.'],
      ['The framework requires that consent is renewed.','The framework requires that consent be renewed.']
    ]
  },
  {
    slug: 'synthetic-biology-biosecurity',
    title: 'Synthetic Biology and Biosecurity',
    readingTitle: 'Designing Life Responsibly',
    caseStudy: 'Cheaper DNA synthesis and increasingly capable biological design tools expand research possibilities while changing how laboratories assess misuse and accidental harm.',
    finding: 'The same methods can support medicines, materials and environmental research while also lowering barriers to dangerous experimentation.',
    tension: 'Excessive restriction can push work underground and slow beneficial science, whereas voluntary guidance alone may leave inconsistent safeguards.',
    response: 'Proportionate screening, secure infrastructure, researcher training, incident reporting and international coordination are required.',
    caution: 'Risk does not reside in a technology alone; it depends on capability, intent, access, context and the effectiveness of safeguards.',
    words: [
      ['synthetic biology','biología sintética','the design or redesign of biological systems using engineering principles'],
      ['biosecurity','bioseguridad contra amenazas','measures preventing deliberate misuse of biological materials or knowledge'],
      ['biosafety','seguridad biológica','measures preventing accidental exposure or release'],
      ['dual use','doble uso','capable of producing both beneficial and harmful outcomes'],
      ['DNA synthesis','síntesis de ADN','the artificial construction of DNA sequences'],
      ['screening protocol','protocolo de detección','a procedure for identifying potentially concerning requests or materials'],
      ['risk assessment','evaluación de riesgos','systematic evaluation of likelihood and consequence'],
      ['incident reporting','notificación de incidentes','formal communication of accidents, breaches or near misses']
    ],
    grammar: 'Stance adverbials and evaluative language',
    purpose: 'distinguish evidence, interpretation and ethical judgement',
    rule: 'Use arguably, notably, apparently and crucially to frame claims, but support the stance with evidence rather than using adverbs as proof.',
    examples: [
      ['The technology is dangerous.','Arguably, risk depends less on the label than on capability and safeguards.'],
      ['Screening reduced some requests.','Notably, screening reduced identifiable high-risk requests in the pilot.'],
      ['The failure came from weak training.','Apparently, weak training contributed to the failure, although the inquiry remains open.'],
      ['International coordination matters most.','Crucially, biological risk can cross national borders.']
    ]
  },
  {
    slug: 'global-health-inequality',
    title: 'Global Health Progress and Inequality',
    readingTitle: 'Progress That Can Be Reversed',
    caseStudy: 'Global health statistics released in 2026 show important gains in prevention and survival alongside stalled targets, financing pressure and persistent inequality.',
    finding: 'Average global improvement can coexist with worsening outcomes in particular regions, groups or diseases.',
    tension: 'International targets make progress visible and comparable, but they may privilege what is easily measured and obscure weak data systems.',
    response: 'Strong primary care, prevention, social protection, sustainable financing and better health information systems must be pursued together.',
    caution: 'A missing data point is not evidence that a problem is absent; data gaps often concentrate where health systems face the greatest constraints.',
    words: [
      ['universal health coverage','cobertura sanitaria universal','access to needed health services without financial hardship'],
      ['health indicator','indicador sanitario','a measure used to describe population health or system performance'],
      ['data gap','brecha de datos','important information that is missing or inadequate'],
      ['financial hardship','dificultad financiera','economic strain caused by costs that exceed available resources'],
      ['primary care','atención primaria','first-contact comprehensive and continuous health care'],
      ['health-system resilience','resiliencia del sistema sanitario','the ability to maintain and recover essential functions'],
      ['preventable mortality','mortalidad prevenible','deaths avoidable through effective prevention or care'],
      ['health inequality','desigualdad sanitaria','systematic differences in health across social groups']
    ],
    grammar: 'Cohesion through reference and connectors',
    purpose: 'sustain a data-based argument across several paragraphs',
    rule: 'Choose connectors for their exact logical relation and reference nouns such as this disparity or such progress to avoid vague repetition.',
    examples: [
      ['Coverage improved. Financial hardship remained.','Coverage improved; nevertheless, financial hardship remained widespread.'],
      ['Data systems are weak. Comparisons are uncertain.','Data systems are weak; consequently, some comparisons remain uncertain.'],
      ['Some regions improved faster. This matters for policy.','Some regions improved faster than others; this disparity matters for policy.'],
      ['Progress is fragile. Investment must continue.','Given the fragility of recent progress, investment must therefore continue.']
    ]
  }
];

const referencesByTopic = {
  'antimicrobial-resistance': [
    { author: 'World Health Organization', title: 'The World Health Assembly adopts updated Global Action Plan on Antimicrobial Resistance (2026–2036)', year: 2026, url: 'https://www.who.int/news/item/25-05-2026-the-world-health-assembly-adopts-updated-global-action-plan-on-antimicrobial-resistance-%282026-2036%29' }
  ],
  'ai-energy-demand': [
    { author: 'International Energy Agency', title: 'Energy and AI', year: 2025, url: 'https://www.iea.org/reports/energy-and-ai' }
  ],
  'gene-editing-access': [
    { author: 'World Health Organization', title: 'Human genome editing: ensuring responsible use of life sciences research', year: 2025, url: 'https://www.who.int/health-topics/human-genome-editing/ensuring-responsible-use-of-life-sciences-research' }
  ],
  'climate-health-air-pollution': [
    { author: 'World Health Organization', title: 'WHO launches plan on the health response to climate change, air pollution and energy poverty', year: 2026, url: 'https://www.who.int/news/item/18-05-2026-who-launches-advocacy--communications-and-partnerships-plan-on-the-health-response-to-climate-change--air-pollution-and-energy-poverty' }
  ],
  'loneliness-public-health': [
    { author: 'World Health Organization', title: 'WHO Commission on Social Connection', year: 2025, url: 'https://www.who.int/groups/commission-on-social-connection' }
  ],
  'ageing-care-economy': [
    { author: 'World Health Organization', title: 'United Nations Decade of Healthy Ageing (2021–2030)', year: 2025, url: 'https://www.who.int/initiatives/decade-of-healthy-ageing' }
  ],
  'critical-minerals-transition': [
    { author: 'International Energy Agency', title: 'Global Critical Minerals Outlook 2026', year: 2026, url: 'https://www.iea.org/reports/global-critical-minerals-outlook-2026' }
  ],
  'deepfakes-democracy': [
    { author: 'UNESCO', title: 'Guidelines for the Governance of Digital Platforms', year: 2023, url: 'https://www.unesco.org/en/internet-trust/guidelines' }
  ],
  'climate-migration-cities': [
    { author: 'International Organization for Migration', title: 'World Migration Report 2026: Chapter 6', year: 2026, url: 'https://publications.iom.int/books/world-migration-report-2026-chapter-6' }
  ],
  'neurotechnology-mental-privacy': [
    { author: 'UNESCO', title: 'Recommendation on the Ethics of Neurotechnology', year: 2025, url: 'https://www.unesco.org/en/legal-affairs/recommendation-ethics-neurotechnology?hub=66535' }
  ],
  'synthetic-biology-biosecurity': [
    { author: 'World Health Organization', title: 'Global guidance framework for the responsible use of the life sciences', year: 2022, url: 'https://www.who.int/publications/i/item/9789240056107' }
  ],
  'global-health-inequality': [
    { author: 'World Health Organization', title: 'Global health gains face threat of reversal', year: 2026, url: 'https://www.who.int/news/item/13-05-2026-global-health-gains-face-threat-of-reversal' }
  ]
};

const q = (prompt, options, answer, explanation) => ({ type: 'mcq', prompt, options, answer, ...(explanation ? { explanation } : {}) });
const activity = (skill, fields) => ({ skill, duration: skill === 'reading' ? 24 : 18, xp: skill === 'reading' ? 50 : 45, ...fields });

function buildReading(topic) {
  return [
    `${topic.caseStudy} The case belongs to a recognisably current debate, but the central C1 task is not to repeat a headline. It is to determine which claim the available evidence supports, which causal mechanisms are plausible and whose interests or risks may disappear inside an average.`,
    `The strongest finding is that ${topic.finding} This matters because public discussion often treats a visible outcome as if it had a single cause. Scientific and social analysis instead asks how systems interact, what is being compared and whether the measurement captures the concept that policy is supposed to address.`,
    `A genuine tension complicates the response: ${topic.tension} The second position does not erase the first. It identifies a cost, trade-off or distributional effect that a technically successful intervention may create. At C1, acknowledging that objection should refine the argument rather than reduce it to “both sides” without judgement.`,
    `The most defensible response is therefore institutional as well as individual: ${topic.response} Such a programme requires measurable objectives, responsible organisations and a way to revise decisions when outcomes differ from expectations. It also requires language precise enough to separate observed results from forecasts and ethical preferences.`,
    `One limitation remains: ${topic.caution} The conclusion is consequently conditional rather than weak. A responsible reader can support action while specifying uncertainty, monitoring unequal effects and stating what future evidence would justify a different decision. That combination of judgement and revisability defines advanced scientific-social literacy.`
  ].join('\n\n');
}

function buildReadingExercises(topic) {
  return [
    q('What is the main C1 task established in paragraph one?', ['Repeating the most recent headline', 'Evaluating claims, mechanisms and hidden distributional effects', 'Memorising every statistic', 'Rejecting public policy'], 1),
    q('Which finding anchors the article?', [topic.finding, topic.tension, topic.response, topic.caution], 0),
    q('Why does the writer reject single-cause explanations?', ['They are always grammatically incorrect', 'Current scientific-social problems emerge through interacting systems', 'They contain too much evidence', 'Policy never addresses causes'], 1),
    q('What function does the tension serve?', ['It adds a credible trade-off that the response must address', 'It cancels the evidence completely', 'It introduces an unrelated historical detail', 'It proves that no decision is possible'], 0),
    q('Which response does the text defend?', [topic.caution, topic.response, 'Individual awareness alone', 'Waiting until uncertainty disappears'], 1),
    q('What distinction should precise language preserve?', ['Observed results, forecasts and ethical preferences', 'Long and short words', 'Scientific and social topics', 'Headlines and titles only'], 0),
    q('How does the limitation affect the conclusion?', ['It makes every claim false', 'It defines the scope and conditions of a responsible claim', 'It removes the need for monitoring', 'It proves that averages are useless'], 1),
    q('What does “revisability” mean in the final sentence?', ['The capacity to change a judgement when evidence changes', 'The removal of all institutional responsibility', 'The repetition of an existing claim', 'The refusal to reach any conclusion'], 0),
    q('Which description best captures the author’s stance?', ['Uncritically optimistic', 'Qualified, evidence-sensitive and action-oriented', 'Entirely opposed to innovation', 'Indifferent to unequal effects'], 1),
    q(`Which term is central to this unit?`, ['weekend', topic.words[0][0], 'bedroom', 'recipe'], 1)
  ];
}

function buildVocabulary(topic) {
  return topic.words.map(([word, translation, definition]) => ({
    word,
    translation,
    definition,
    example: `The article uses “${word}” to analyse ${topic.title.toLowerCase()} precisely.`,
    partOfSpeech: word.includes(' ') ? 'phrase' : 'noun'
  }));
}

function buildVocabularyExercises(items) {
  return items.map((item, index) => {
    const answer = index % 4;
    const options = [1, 2, 3].map((offset) => items[(index + offset) % items.length].word);
    options.splice(answer, 0, item.word);
    return q(`Which term means “${item.definition}”?`, options, answer);
  });
}

function buildGrammarExercises(topic) {
  const applied = topic.examples.map(([source, target], index) => {
    const answer = index % 4;
    const options = [
      source,
      `${target} This being incorrect.`,
      `Because ${source.toLowerCase()} therefore.`,
      `The text uses words but not the target structure.`
    ];
    options.splice(answer, 0, target);
    return q(`Choose the best C1 revision using ${topic.grammar}: “${source}”`, options.slice(0, 4), answer, topic.rule);
  });
  return [
    q('What is the grammar focus of this unit?', ['Basic spelling', topic.grammar, 'Informal abbreviations', 'Numbers only'], 1, topic.rule),
    q(`Why is ${topic.grammar} useful in this article?`, ['It removes all uncertainty', topic.purpose, 'It replaces evidence', 'It makes every sentence longer'], 1, topic.rule),
    ...applied,
    q('Which revision principle best supports C1 academic accuracy?', ['Match grammatical emphasis to the logical force of the evidence', 'Always select the longest form', 'Remove every qualification', 'Use one structure throughout'], 0, topic.rule),
    q('What should a final grammar check examine?', ['Form, meaning and register together', 'Punctuation only', 'Word count only', 'Translation only'], 0, topic.rule)
  ];
}

function grammarTest(topic, exercises) {
  return {
    id: `english-c1-${topic.slug}-grammar-test`,
    passingScore: 75,
    questions: exercises.map((exercise, index) => ({
      id: `english-c1-${topic.slug}-grammar-q${index + 1}`,
      type: 'mcq',
      prompt: exercise.prompt,
      options: exercise.options.map((text, optionIndex) => ({ id: ['a','b','c','d'][optionIndex], text })),
      correctOptionId: ['a','b','c','d'][exercise.answer],
      explanation: exercise.explanation || topic.rule,
      difficulty: index < 2 ? 'medium' : 'hard'
    }))
  };
}

function buildUnit(topic, index) {
  const vocabulary = buildVocabulary(topic);
  const readingExercises = buildReadingExercises(topic);
  const grammarExercises = buildGrammarExercises(topic);
  return {
    slug: topic.slug,
    title: topic.title,
    titleEs: topic.title,
    description: topic.caseStudy,
    order: index + 1,
    accessTier: index < 2 ? 'free' : 'premium',
    unitOverview: {
      objective: `Evaluate current evidence and competing responses concerning ${topic.title.toLowerCase()}.`,
      outcomes: ['identify findings and limitations', 'evaluate trade-offs and institutional responses', 'use current scientific-social vocabulary', 'apply advanced grammar in context'],
      grammar: [topic.grammar],
      vocabulary: topic.words.slice(0, 4).map(([word]) => word),
      scenario: topic.caseStudy
    },
    activities: {
      reading: activity('reading', {
        title: topic.readingTitle,
        description: topic.caseStudy,
        reading: {
          title: topic.readingTitle,
          text: buildReading(topic),
          questions: readingExercises.slice(0, 3).map((item) => item.prompt),
          references: referencesByTopic[topic.slug] || []
        },
        exercises: readingExercises
      }),
      vocabulary: activity('vocabulary', {
        title: `Vocabulary: ${topic.title}`,
        description: `Eight current scientific-social terms used in “${topic.readingTitle}”.`,
        vocabulary,
        exercises: buildVocabularyExercises(vocabulary)
      }),
      grammar: activity('grammar', {
        title: topic.grammar,
        description: `Use ${topic.grammar} while analysing “${topic.readingTitle}”.`,
        grammarNote: `Goal: ${topic.purpose}.\n\nRule: ${topic.rule}\n\nContext: ${topic.caseStudy}`,
        phrases: topic.examples.map(([, target]) => target),
        grammarProfile: {
          name: topic.grammar,
          context: `Grammar connected to the C1 reading “${topic.readingTitle}”.`,
          explanation: topic.rule,
          purpose: topic.purpose,
          examples: topic.examples.map(([, target]) => target)
        },
        exercises: grammarExercises,
        grammarTest: grammarTest(topic, grammarExercises)
      })
    }
  };
}

module.exports = {
  language: 'english',
  level: 'C1',
  courseTitle: 'English C1',
  courseDescription: 'Advanced English through twelve current scientific and social debates, evidence evaluation and precise academic language.',
  units: topics.map(buildUnit)
};
