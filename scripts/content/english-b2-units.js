// English B2: social-issue readings framed through Sarah and Daniel's story.
// Scope: 12 units, Reading + Vocabulary + Grammar.
const topics = [
  ['social-media-public-opinion','Social Media and Public Opinion','The Viral Story','Sarah investigates why a misleading local story spread faster than its correction.','algorithms reward emotional reactions','platforms also help ignored voices reach an audience','media literacy and transparent moderation',['viral','misleading','echo chamber','fact-check','source','bias','moderation','public opinion'],'Passive reporting structures'],
  ['plastic-pollution-cities','Plastic Pollution in Our Cities','The River After the Festival','Daniel joins a clean-up and discovers why collecting rubbish cannot solve plastic pollution alone.','single-use packaging creates costs that communities carry','plastic remains useful in medicine and food safety','reduce unnecessary use while redesigning systems',['single-use','waste stream','microplastic','reusable','landfill','packaging','clean-up','producer responsibility'],'Causative and passive forms'],
  ['climate-change-daily-decisions','Climate Change and Everyday Decisions','Beyond the Carbon Footprint','Sarah compares personal climate choices with decisions made by companies and governments.','individual choices can influence habits and demand','personal responsibility can distract from major emitters','combine credible personal action with structural policy',['carbon footprint','emissions','renewable','adaptation','mitigation','fossil fuel','incentive','infrastructure'],'Mixed conditionals'],
  ['corruption-public-trust','Corruption and Public Trust in Latin America and the Caribbean','The Contract Nobody Could Explain','Daniel follows a cross-border investigation into public contracts in several Latin American and Caribbean communities.','clientelism, secret procurement and conflicts of interest can weaken institutions and public trust','Latin America and the Caribbean are diverse, and an inefficient decision is not automatically evidence of corruption','strengthen open procurement, independent journalism, civic oversight and institutions adapted to each national context',['clientelism','bribery','conflict of interest','public procurement','accountability','whistleblower','impunity','civic oversight'],'Modals of deduction in the past'],
  ['fourth-of-july','The Fourth of July: Freedom and Contradictions','Fireworks and Unfinished Promises','Sarah and Daniel spend July 4th with American friends and discuss how national celebrations hold pride and criticism together.','the holiday commemorates independence and shared ideals','the promise of freedom was historically distributed unequally','celebrate achievement while examining unfinished work',['independence','founding document','civil rights','patriotism','commemorate','contradiction','liberty','national identity'],'Participle clauses'],
  ['migration-cultural-identity','Migration and Cultural Identity','More Than One Home','A neighbour asks Daniel where he is really from, beginning a difficult but generous conversation.','migration creates layered identities and new communities','integration debates often demand a false choice between cultures','belonging can be multiple without being superficial',['belonging','heritage','integration','assimilation','diaspora','identity','host community','roots'],'Advanced relative clauses'],
  ['housing-inequality','Housing Inequality','The Rent Increase','Sarah helps a colleague understand why wages have not kept pace with local rents.','limited supply and investment pressure raise prices','development can help but may displace existing residents','build more housing with tenant protection and planning',['affordable housing','rent increase','tenant','landlord','shortage','displacement','zoning','cost of living'],'Comparatives with modifiers'],
  ['ai-and-employment','Artificial Intelligence and Employment','The Job That Changed','Daniel’s hotel introduces an AI scheduling system that saves time but creates unexpected problems.','automation can remove repetitive work and improve planning','opaque systems can reproduce bias and weaken worker control','human oversight, explanation and retraining',['automation','algorithmic bias','oversight','retraining','productivity','displacement','decision-making','transparent system'],'Future perfect and future continuous'],
  ['fast-fashion-hidden-costs','Fast Fashion and Hidden Costs','The Five-Pound Shirt','Sarah traces the social and environmental cost of an extremely cheap shirt.','low prices make fashion accessible','hidden labour and environmental costs are shifted elsewhere','buy less, demand traceability and improve regulation',['fast fashion','supply chain','garment worker','traceability','disposable','labour rights','consumer demand','hidden cost'],'Concession clauses'],
  ['education-social-mobility','Education and Social Mobility','The Scholarship Form','Daniel mentors a student whose ability is clear but whose application is incomplete.','education can expand opportunity','access depends on money, information and institutional support','combine high expectations with practical access',['social mobility','scholarship','tuition','mentoring','barrier','opportunity gap','merit','access'],'Inversion for emphasis'],
  ['free-speech-misinformation','Freedom of Speech and Misinformation','The Post the Forum Removed','Sarah moderates a community forum after a harmful false claim appears.','free expression protects disagreement and accountability','unchecked misinformation can cause measurable harm','use clear rules, proportionate action and appeal processes',['free speech','misinformation','censorship','harmful claim','appeal','evidence','content policy','proportionate'],'Reported speech and reporting verbs'],
  ['community-action','Community Action and Local Change','The Street That Organised','Sarah and Daniel help residents turn repeated complaints into a practical neighbourhood plan.','local action produces visible knowledge and trust','volunteers cannot replace adequately funded public services','connect community initiative with institutional responsibility',['grassroots','volunteer','petition','stakeholder','local council','initiative','public service','collective action'],'Emphatic cleft structures']
];

const q=(prompt,options,answer)=>({type:'mcq',prompt,options,answer});
const activity=(skill,fields)=>({skill,duration:skill==='reading'?20:16,xp:skill==='reading'?40:35,...fields});
const grammarTest=(slug,title,exercises)=>({
  id:`english-b2-${slug}-grammar-test`,
  passingScore:70,
  questions:exercises.map((exercise,index)=>({
    id:`english-b2-${slug}-grammar-q${index+1}`,
    type:'mcq',
    prompt:exercise.prompt,
    options:exercise.options.map((text,optionIndex)=>({id:['a','b','c','d'][optionIndex],text})),
    correctOptionId:['a','b','c','d'][exercise.answer],
    explanation:exercise.explanation||`Review ${title} and compare the form, meaning and register of all four options.`
  }))
});

function buildReading(t) {
  const [slug,title,readingTitle,scene,claim,counter,conclusion,vocab]=t;
  if (slug === 'corruption-public-trust') {
    return [
      `Daniel first notices the story in a collaborative investigation published by journalists from Latin America and the Caribbean. Reporters in several countries have examined public contracts for school meals, road repairs and emergency supplies. The cases are not identical, and the article warns readers not to treat the region as a single political system. However, a repeated question appears: why do some contracts become unusually expensive while the companies behind them remain difficult to identify?`,
      `One Caribbean municipality provides the investigation’s central case. After a hurricane, officials awarded an emergency contract to repair community buildings. Speed was necessary, but months later several roofs were still leaking and the final cost had doubled. A local reporter discovered that one company director had close political connections. That relationship might have influenced the decision, but it does not prove bribery by itself. Bank records, messages or testimony would be needed to support a stronger accusation.`,
      `The investigation then compares this case with procurement disputes elsewhere in Latin America. In some places, clientelism allows political networks to exchange jobs or contracts for loyalty. In others, digital procurement portals and independent audit institutions have made spending easier to examine. These differences matter. Corruption is not a cultural characteristic of the region; it is enabled or limited by particular rules, enforcement systems, economic pressures and concentrations of power.`,
      `Citizens also face difficult choices. A whistleblower may expose wrongdoing but risk losing employment or personal safety. Journalists can reveal conflicts of interest, yet they must distinguish evidence from suspicion. Anti-corruption campaigns can strengthen accountability, but they can also be used selectively against political opponents. For that reason, Daniel learns to ask whether investigations follow consistent standards and whether accused people have an opportunity to respond.`,
      `The article concludes that reducing impunity requires more than arresting one famous official. Open public procurement, protection for whistleblowers, independent courts, investigative journalism and civic oversight must work together. Daniel’s main lesson is methodological: public trust grows when institutions make decisions visible and evidence can be examined. Regional comparison is useful only when it respects national differences and avoids turning a complex institutional problem into a stereotype about Latin America and the Caribbean.`
    ].join('\n\n');
  }
  return [
    `${scene} What begins as a personal situation soon becomes a wider B2 question. Sarah and Daniel collect examples, speak to people affected by the issue and compare what they hear with information from reliable reports. They notice that the language used to describe the problem often determines which solutions appear reasonable.`,
    `One side argues that ${claim}. Supporters point to practical examples and insist that waiting for a perfect solution would allow the problem to grow. Their position is persuasive because it identifies real consequences, although some of the evidence describes correlation rather than direct cause.`,
    `A different group replies that ${counter}. This objection does not necessarily reject the first concern; instead, it questions who carries the cost, whose experience is missing and whether the proposed response addresses a symptom rather than the underlying system.`,
    `Sarah and Daniel resist choosing a simple winner. They check the source of each claim, distinguish measurable facts from predictions and ask what evidence could change their minds. The disagreement becomes more useful once everyone states not only what they believe but also the assumptions behind that belief.`,
    `By the end, they support a balanced direction: ${conclusion}. The experience teaches them that informed citizenship requires more than having an opinion. It involves listening across disagreement, evaluating evidence and accepting that a responsible conclusion may remain open to revision.`
  ].join('\n\n');
}

function buildUnit(t,index){
  const [slug,title,readingTitle,scene,claim,counter,conclusion,words,grammar]=t;
  const text=buildReading(t);
  const vocabulary=words.map((word,i)=>({word,translation:`concepto B2: ${word}`,definition:`A key B2 term used when discussing ${title.toLowerCase()}.`,example:`The article uses “${word}” to analyse the issue more precisely.`,partOfSpeech:word.includes(' ')?'phrase':'noun'}));
  const readingExercises=[
    q('What first introduces the wider issue?',[scene,'A scientific experiment','A fictional competition','A grammar lesson'],0),
    q('What is the main supporting claim?',[counter,claim,conclusion,'No position is presented'],1),
    q('What does the opposing group question?',['Only the spelling','Costs, missing voices and underlying causes','The characters’ names','Whether evidence matters'],1),
    q('How do Sarah and Daniel evaluate the debate?',['They choose the loudest speaker','They compare sources, facts and assumptions','They avoid all disagreement','They accept every prediction'],1),
    q('Which conclusion best represents the text?',['Only individuals are responsible',conclusion,'The issue has no solution','Evidence should be ignored'],1),
    q('What is the writer’s attitude?',['Completely dismissive','Critical but open to competing evidence','Unquestioningly enthusiastic','Unrelated to the topic'],1),
    q('Which B2 skill is most important here?',['Evaluating argument and evidence','Listing isolated words','Copying one sentence','Memorising dates only'],0),
    q('Why is the conclusion open to revision?',['The writer forgot the topic','New evidence may change a responsible judgement','Facts never exist','Every opinion is equally strong'],1),
    q('What function does the counterargument serve?',['It adds complexity and tests the first claim','It repeats the title','It ends the article immediately','It changes the language'],0),
    q(`Which term belongs most directly to this topic?`,['breakfast',words[0],'bedroom','weekend'],1)
  ];
  const grammarExercises=Array.from({length:8},(_,i)=>q(
    i===0?`What is the grammar focus of this unit?`:`Choose the sentence that uses ${grammar} appropriately in a formal B2 discussion.`,
    i===0?['Basic spelling',grammar,'The alphabet','Numbers only']:[
      `The issue is discussed without a clear structure.`,
      `This example demonstrates controlled use of ${grammar} in context.`,
      `This sentence no grammar.`,
      `Using words random the issue.`
    ],1));
  return {slug,title,titleEs:title,description:scene,order:index+1,accessTier:index<2?'free':'premium',unitOverview:{objective:`Evaluate arguments about ${title.toLowerCase()}.`,outcomes:['identify a writer’s position','evaluate evidence and counterarguments','use topic vocabulary','apply advanced grammar'],grammar:[grammar],vocabulary:words.slice(0,4),scenario:scene},activities:{
    reading:activity('reading',{title:readingTitle,description:scene,reading:{title:readingTitle,text,questions:readingExercises.slice(0,3).map(x=>x.prompt)},exercises:readingExercises}),
    vocabulary:activity('vocabulary',{title:`Vocabulary: ${title}`,description:`Key language for ${title.toLowerCase()}.`,vocabulary,exercises:vocabulary.map((v,i)=>q(`Which term matches this definition: ${v.definition}`,[words[(i+1)%8],v.word,words[(i+2)%8],words[(i+3)%8]],1))}),
    grammar:activity('grammar',{
      title:grammar,
      description:`Use ${grammar} while discussing “${readingTitle}”.`,
      grammarNote:`Goal: use ${grammar} to express a precise relationship in the story “${readingTitle}”.\n\nRule: this unit practises ${grammar} to express complex relationships clearly and accurately in formal discussion.\n\nExamples: The issue is examined from more than one perspective. Evidence should be evaluated before a conclusion is reached.`,
      phrases:[`The story uses ${grammar} to connect evidence and interpretation.`,`A careful writer applies ${grammar} without overstating the evidence.`],
      grammarProfile:{
        name:grammar,
        definition:`${grammar} is the unit’s target structure for expressing relationships between claims, evidence and interpretation.`,
        structure:`Apply ${grammar} with the form and sentence position required by the context.`,
        function:`Use ${grammar} to evaluate claims, qualify conclusions and connect complex ideas.`,
        context:`Grammar connected to the B2 reading “${readingTitle}”.`,
        explanation:`Learn the form and sentence position of ${grammar}.`,
        purpose:`Use it to evaluate claims, qualify conclusions and connect complex ideas.`,
        examples:[`The story uses ${grammar} to connect evidence and interpretation.`,`A careful writer applies ${grammar} without overstating the evidence.`]
      },
      exercises:grammarExercises,
      grammarTest:grammarTest(slug,grammar,grammarExercises)
    })
  }};
}

const units = topics.map(buildUnit);
require('./advanced-communication-skills').ensureAdvancedCommunicationSkills(units, {
  language: 'english',
  level: 'B2'
});

module.exports={language:'english',level:'B2',courseTitle:'English B2',courseDescription:'Upper-intermediate English through twelve social-issue units combining narrative, evidence and debate.',units};
