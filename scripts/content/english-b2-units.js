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

const q=(prompt,options,answer,explanation)=>({type:'mcq',prompt,options,answer,explanation});
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
    explanation:exercise.explanation||`Review ${title} and compare the form, meaning and register of all four options.`,
    difficulty:index<2?'application':index<6?'analysis':'precision'
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
  const details = {
    'social-media-public-opinion': [
      'The original post claims that the council has secretly approved a major development beside the park. By lunchtime it has been shared hundreds of times, although the linked document is an old consultation paper rather than a final decision.',
      'Sarah traces the story back to a cropped screenshot. A local journalist shows her the complete document, while residents explain that the rumour spread because it confirmed fears they already had.',
      'When the council publishes a correction, it attracts much less attention. Sarah therefore argues that accurate information needs clear explanations and timely distribution, not merely a quiet factual update.'
    ],
    'plastic-pollution-cities': [
      'After a weekend festival, volunteers remove bags of cups, wrappers and bottles from the riverbank. Daniel notices that the same branded packaging appears again and again, even though visitors used the bins provided.',
      'A waste officer explains that lightweight plastic can escape during collection and that contaminated material is often impossible to recycle. A food-stall owner adds that affordable alternatives are not always available from suppliers.',
      'The clean-up restores the riverbank for a day, but it does not change what will be sold at the next event. Daniel concludes that organisers, producers and local authorities must redesign the system before rubbish reaches the water.'
    ],
    'climate-change-daily-decisions': [
      'Sarah begins by comparing the emissions from her commute, heating and food. The exercise helps her identify practical changes, but it also reveals that some options depend on rents, transport networks and energy policy.',
      'Daniel can take a bus to work, whereas a colleague on the night shift has no service available. Their different circumstances show why the same advice can be easy for one household and unrealistic for another.',
      'They decide to reduce avoidable consumption while supporting better public transport and cleaner energy. Personal action matters most, Sarah argues, when it also creates demand for structural change.'
    ],
    'fourth-of-july': [
      'At a neighbourhood barbecue, one guest describes the holiday as a celebration of political independence. Another points out that the declaration\'s language of equality did not include everyone living in the new nation.',
      'The discussion moves from fireworks to civil rights, Indigenous history and the different meanings of patriotism. Sarah notices that criticism is not necessarily rejection; for several guests, it expresses a demand that national ideals be applied more consistently.',
      'The group keeps the celebration but adds a local history display and a collection for a voting-rights organisation. Pride and scrutiny remain in tension, yet neither has to silence the other.'
    ],
    'migration-cultural-identity': [
      'Daniel explains that a simple answer cannot contain his family history, accent and sense of belonging. The neighbour apologises for the word “really” and asks what a better question might sound like.',
      'At a community event, migrants describe maintaining family traditions while forming new friendships and habits. Their experiences differ: some value a strong connection to one homeland, while others feel at home in several places.',
      'Daniel comes to see identity as layered rather than divided. Integration can involve participation in a shared society without requiring people to erase language, memory or heritage.'
    ],
    'housing-inequality': [
      'Priya receives a rent increase shortly after salaries at the company remain almost unchanged. Flats farther from the centre are cheaper, but the additional travel time and cost would cancel much of the saving.',
      'Sarah compares local wage data, vacancy rates and planning applications. She finds that new construction is slow, while some recently completed flats are marketed beyond the budgets of ordinary workers.',
      'At a tenants\' meeting, residents support more building but also request longer leases and protection from sudden displacement. Supply matters, they agree, but so do the type, location and price of the homes created.'
    ],
    'ai-and-employment': [
      'The hotel\'s new system predicts staffing needs and assigns shifts automatically. It reduces the manager\'s paperwork, but Daniel receives several late shifts followed by early starts because the software treats each day separately.',
      'Employees cannot see why particular schedules were chosen or correct inaccurate availability data. Management initially calls the problem a technical exception, until staff collect examples showing a consistent pattern.',
      'The hotel keeps the tool but introduces human review, written explanations and a way to challenge decisions. Automation remains useful only when workers can understand and contest its effects.'
    ],
    'fast-fashion-hidden-costs': [
      'Sarah buys a very cheap shirt, then searches the label and discovers a supply chain crossing several countries. The brand publishes environmental promises but gives little information about the factory or wages.',
      'A labour-rights report explains how short deadlines and changing orders transfer risk to suppliers and garment workers. The retail price looks efficient partly because pollution, insecure work and discarded clothing are paid for elsewhere.',
      'Sarah cannot verify every product, but she can buy fewer items, repair what she owns and ask brands for traceable information. Consumer choices alone are insufficient, so she also supports stronger disclosure and labour standards.'
    ],
    'education-social-mobility': [
      'Daniel\'s student has strong grades but has left the financial section of a scholarship form blank. No one in the family has applied to university before, and the instructions assume knowledge that the student has never been taught.',
      'Daniel helps gather documents and arrange a reference, but he avoids writing the application for the student. The aim is to remove an information barrier while preserving the applicant\'s own voice and responsibility.',
      'The completed form demonstrates ability that was present from the beginning. The experience shows that merit cannot be judged fairly when some candidates lack time, guidance or money to make their achievements visible.'
    ],
    'free-speech-misinformation': [
      'A forum post falsely claims that a local vaccination clinic has injured several children. The message names a nurse and encourages readers to confront staff, so Sarah temporarily hides it while checking the evidence.',
      'Some members accuse her of censorship; others demand a permanent ban. Sarah publishes the rule she applied, links to verified health information and allows the author to appeal after removing the personal accusation.',
      'The response distinguishes unpopular opinion from a demonstrably false claim linked to a risk of harm. Clear standards and proportionate action make moderation more accountable than either automatic removal or complete inaction.'
    ],
    'community-action': [
      'Residents have complained for months about dangerous crossings and broken streetlights, but their messages describe separate incidents. Sarah helps them map each location and record when the problems are most serious.',
      'The evidence turns frustration into a proposal with priorities, costs and named responsibilities. Volunteers can survey the area and consult neighbours, whereas only the council can change signals or repair public lighting.',
      'Officials agree to a trial after residents present the plan at a public meeting. The result comes from combining local knowledge with institutional authority, not from pretending that unpaid volunteers can provide public services alone.'
    ]
  }[slug];
  return [
    scene,
    details?.[0] || `The issue raises a concrete disagreement about ${title.toLowerCase()}.`,
    details?.[1] || `Sarah and Daniel compare testimony with reliable evidence before evaluating the competing claims.`,
    `The debate has two credible concerns. One side argues that ${claim}. The other replies that ${counter}. Instead of treating these positions as slogans, Sarah and Daniel ask what evidence supports each one, who carries the cost and which important experiences may be missing.`,
    details?.[2] || `They ultimately support this direction: ${conclusion}.`,
    `Their conclusion is not a convenient compromise but a reasoned proposal: ${conclusion}. It remains open to revision if stronger evidence emerges.`
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
    q('Which approach is most important here?',['Evaluating argument and evidence','Listing isolated words','Copying one sentence','Memorising dates only'],0),
    q('Why is the conclusion open to revision?',['The writer forgot the topic','New evidence may change a responsible judgement','Facts never exist','Every opinion is equally strong'],1),
    q('What function does the counterargument serve?',['It adds complexity and tests the first claim','It repeats the title','It ends the article immediately','It changes the language'],0),
    q(`Which term belongs most directly to this topic?`,['breakfast',words[0],'bedroom','weekend'],1)
  ];
  const grammarExercises=buildB2GrammarExercises({ title, readingTitle, grammar, claim, counter, conclusion });
  return {slug,title,titleEs:title,description:scene,order:index+1,accessTier:index<2?'free':'premium',unitOverview:{objective:`Evaluate arguments about ${title.toLowerCase()}.`,outcomes:['identify a writer’s position','evaluate evidence and counterarguments','use topic vocabulary','apply advanced grammar'],grammar:[grammar],vocabulary:words.slice(0,4),scenario:scene},activities:{
    reading:activity('reading',{title:readingTitle,description:scene,reading:{title:readingTitle,text,questions:[
      `What specific event introduces the debate in “${readingTitle}”?`,
      `What evidence supports the claim that ${claim}?`,
      `How does the text respond to the concern that ${counter}?`,
      `Why do Sarah and Daniel support the following direction: ${conclusion}?`,
      `What new evidence could reasonably change the conclusion in “${readingTitle}”?`
    ]},exercises:readingExercises}),
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

function buildB2GrammarExercises({title,readingTitle,grammar,claim,counter,conclusion}) {
  const contexts={
    'Passive reporting structures':[
      [`Which report sentence presents an unconfirmed claim cautiously in “${readingTitle}”?`,`The misleading post is believed to have reached thousands of local users before it was corrected.`],
      ['Which option separates evidence from attribution?','Several residents are said to have shared the story without checking its source.'],
      ['Which sentence is appropriate for a formal media-literacy report?','The platform is reported to be reviewing its moderation policy.'],
      ['Which wording avoids claiming more evidence than is available?','The algorithm is thought to favour highly emotional content, although the available data are incomplete.'],
      ['Which sentence correctly uses a passive reporting verb with an infinitive?','The original claim was considered to be misleading by independent fact-checkers.'],
      ['Which sentence best reports a later development?','The correction is expected to receive less attention than the original post.'],
      ['Which sentence uses the perfect infinitive accurately?','The rumour is believed to have originated in a private messaging group.'],
      ['Which conclusion uses a reporting structure with suitable caution?','Greater transparency is widely regarded as necessary for restoring public trust.']
    ],
    'Causative and passive forms':[
      ['Which sentence shows that the organisers arranged for someone else to do the work?','Festival organisers had the riverbank cleaned before volunteers arrived.'],
      ['Which option focuses appropriately on the object affected by the action?','Thousands of plastic cups were collected during the clean-up.'],
      ['Which sentence uses the causative form to describe a service?','The council is having new recycling bins installed near the station.'],
      ['Which report sentence avoids hiding the responsible institution?','The city required retailers to reduce unnecessary packaging.'],
      ['Which passive sentence describes an ongoing policy change?','Single-use containers are being replaced by reusable alternatives in several cafés.'],
      ['Which sentence uses have something done correctly?','Residents can have damaged collection bins replaced through the local service.'],
      ['Which option is most suitable for a formal environmental report?','The cost of waste disposal is often passed on to local communities.'],
      ['Which sentence distinguishes a planned action from an accidental result?','The organisers had extra water stations provided for volunteers.']
    ],
    'Mixed conditionals':[
      ['Which sentence links a past policy decision to its present consequence?','If cities had invested in public transport earlier, residents would rely less on private cars today.'],
      ['Which option expresses a present condition with a past result?','If companies were more transparent now, they would have earned greater public trust during the crisis.'],
      ['Which sentence makes a plausible mixed conditional argument?','If households had received clearer information, they would be making lower-carbon choices now.'],
      ['Which sentence correctly combines a past cause with a current outcome?','If the infrastructure had not been neglected, the neighbourhood would be better prepared for extreme weather today.'],
      ['Which option avoids confusing a real future possibility with a counterfactual?','If governments had acted sooner, adaptation costs would be lower now.'],
      ['Which sentence is best for evaluating responsibility?','If major emitters took the issue more seriously today, earlier commitments would not have been abandoned so quickly.'],
      ['Which conclusion uses a mixed conditional accurately?','If the subsidy had been designed more fairly, public support would be stronger now.'],
      ['Which sentence keeps the time relationship clear?','If consumers were less dependent on cheap fuel now, last year’s price rise would have caused less disruption.']
    ],
    'Modals of deduction in the past':[
      ['Which sentence makes a strong, evidence-based deduction about the contract?','The company must have known about the deadline, because it submitted the same documents in two municipalities.'],
      ['Which option expresses a possible explanation without presenting it as fact?','Political connections may have influenced the decision, but the records do not prove this.'],
      ['Which sentence draws a negative deduction from the evidence?','The officials cannot have reviewed every invoice carefully; several identical errors remained.'],
      ['Which wording is most appropriate for investigative reporting?','The contractor might have underestimated the cost, although deliberate overpricing is also possible.'],
      ['Which sentence avoids accusing someone without sufficient evidence?','The delay could have resulted from weak oversight rather than bribery.'],
      ['Which sentence uses must have correctly?','The whistleblower must have had access to internal records to identify the missing payments.'],
      ['Which option uses can’t have correctly?','The audit cannot have been completed before the emergency repairs began.'],
      ['Which conclusion is suitably cautious?','The missing documents may have been removed, but the investigation has not established who removed them.']
    ],
    'Participle clauses':[
      ['Which sentence uses a participle clause to add background information concisely?','Celebrating the holiday with friends, Sarah also listened to their criticisms of its history.'],
      ['Which option avoids a dangling participle?','Raised during the discussion, the question of unequal freedom required a careful response.'],
      ['Which sentence links cause and result clearly?','Having read several historical accounts, Daniel understood why the celebration meant different things to different families.'],
      ['Which sentence uses a past participle clause accurately?','Founded on ideals of liberty, the national narrative has also been challenged by excluded voices.'],
      ['Which option is suitable for a balanced B2 reflection?','Recognising both pride and contradiction, the group discussed the holiday respectfully.'],
      ['Which sentence shows a completed earlier action?','Having spoken to local historians, Sarah revised her first impression.'],
      ['Which option places the participle clause with the correct subject?','Watching the fireworks, the children asked why some neighbours chose not to celebrate.'],
      ['Which conclusion uses a participle clause naturally?','Remembered differently across communities, the holiday invites both celebration and reflection.']
    ],
    'Advanced relative clauses':[
      ['Which sentence identifies the person connected to the question of belonging?','Daniel spoke to a neighbour whose question made him reflect on his identity.'],
      ['Which option uses a preposition before a relative pronoun correctly?','The community centre in which the meeting took place offered language classes.'],
      ['Which sentence adds non-essential but relevant information?','His grandmother, from whom he learned the family stories, had migrated decades earlier.'],
      ['Which option is most appropriate in a formal discussion?','The assumption that identity must be singular is one with which many migrants disagree.'],
      ['Which sentence uses whose correctly?','She described the traditions whose meaning had changed after migration.'],
      ['Which option avoids ending a formal relative clause with an unnecessary preposition?','The city to which they moved offered support for new arrivals.'],
      ['Which sentence refers to an entire preceding idea?','Daniel described his mixed feelings, which surprised some of the listeners.'],
      ['Which conclusion connects belonging and place accurately?','The neighbourhood where several languages are spoken has become a shared home.']
    ],
    'Comparatives with modifiers':[
      ['Which sentence compares the two areas precisely?','Rent in the city centre is considerably higher than it was five years ago.'],
      ['Which option uses a modifier with a comparative correctly?','New tenants are finding it far more difficult to secure affordable housing than long-term residents did.'],
      ['Which sentence makes a measured comparison?','The proposed scheme is slightly less expensive, but it serves fewer families.'],
      ['Which option strengthens a comparison appropriately?','Investment pressure has made the area much less accessible to lower-income workers.'],
      ['Which sentence compares change over time accurately?','Wages have risen nowhere near as quickly as local rents.'],
      ['Which option uses as … as correctly?','The outer district is not nearly as well connected as the city centre.'],
      ['Which sentence makes a balanced policy comparison?','Building more homes is no less important than protecting existing tenants.'],
      ['Which conclusion is suitable for a B2 report?','The new regulation is marginally more protective of renters than the previous one.']
    ],
    'Future perfect and future continuous':[
      ['Which sentence describes a completed action by a future deadline?','By next summer, the hotel will have introduced a transparent system for allocating shifts.'],
      ['Which option describes an action in progress at a future time?','This time next year, staff will be using the new scheduling platform every day.'],
      ['Which sentence combines future planning with a clear deadline?','By 2030, the company will have trained every manager to review automated decisions.'],
      ['Which option is appropriate for forecasting change?','In five years, workers will still be adapting to new forms of automation.'],
      ['Which sentence uses the future perfect to evaluate progress?','By the end of the trial, the team will have collected enough feedback to assess the system.'],
      ['Which option avoids using the present perfect for a future deadline?','By next month, the hotel will have published its fairness guidelines.'],
      ['Which sentence describes a temporary future activity?','During the pilot, managers will be monitoring how the algorithm affects weekend shifts.'],
      ['Which conclusion uses both forms coherently?','By the time the review begins, employees will have submitted comments and the panel will be examining them.']
    ],
    'Concession clauses':[
      ['Which sentence concedes a benefit while keeping the main criticism clear?','Although low prices make fashion accessible, they can conceal serious labour costs.'],
      ['Which option uses even though correctly?','Even though the shirt was cheap, its environmental cost was not insignificant.'],
      ['Which sentence uses despite correctly?','Despite improving transparency, the company did not disclose the wages paid to suppliers.'],
      ['Which option presents a contrast in a formal register?','While consumers may value convenience, regulation can still require better traceability.'],
      ['Which sentence uses much as appropriately?','Much as the campaign raised awareness, it did not change purchasing habits overnight.'],
      ['Which option avoids treating a concession as a contradiction?','Although the brand published a code of conduct, independent monitoring remained necessary.'],
      ['Which sentence is best for a balanced conclusion?','Even if demand remains high, companies should reduce avoidable waste.'],
      ['Which option maintains a clear logical relationship?','Despite the promise of cheaper clothing, the hidden costs are borne elsewhere.']
    ],
    'Inversion for emphasis':[
      ['Which sentence uses inversion after a negative adverbial correctly?','Rarely do students receive clear guidance about every stage of a scholarship application.'],
      ['Which option adds emphasis to a key finding?','Not only did mentoring improve the application, but it also made the student more confident.'],
      ['Which sentence is grammatically correct after only when?','Only when the deadline approached did Daniel realise how much support the student needed.'],
      ['Which option uses under no circumstances correctly?','Under no circumstances should financial barriers be treated as evidence of low ability.'],
      ['Which sentence makes a formal contrast?','Little did the committee know that one missing document would delay the decision.'],
      ['Which option is suitable for an academic conclusion?','No sooner had the guidance been published than students began asking for individual advice.'],
      ['Which sentence uses scarcely correctly?','Scarcely had the mentoring programme started when demand exceeded expectations.'],
      ['Which conclusion uses inversion without sounding theatrical?','Not until practical support is available can access become genuinely fair.']
    ],
    'Reported speech and reporting verbs':[
      ['Which sentence reports the moderator’s warning accurately?','The moderator warned that the false claim could cause real harm.'],
      ['Which option uses a reporting verb with the correct pattern?','Sarah urged forum members to check a source before sharing it.'],
      ['Which sentence reports a request appropriately?','A resident asked whether the post could be removed while it was reviewed.'],
      ['Which option distinguishes allegation from evidence?','The journalist alleged that the account had spread misinformation deliberately.'],
      ['Which sentence uses advise correctly?','The policy team advised users not to repost unverified claims.'],
      ['Which option reports an explanation rather than a direct quotation?','The platform explained that its appeal process allowed users to challenge decisions.'],
      ['Which sentence uses deny accurately?','The account owner denied having intended to mislead readers.'],
      ['Which conclusion reports a recommendation in a formal register?','The panel recommended that clear rules and appeal procedures be published.']
    ],
    'Emphatic cleft structures':[
      ['Which sentence uses a wh-cleft to focus on the community’s need?','What residents need is a clear route from complaint to action.'],
      ['Which option uses an it-cleft accurately?','It was the lack of coordination that delayed the neighbourhood plan.'],
      ['Which sentence focuses on time appropriately?','What changed the discussion was the meeting held after work.'],
      ['Which option highlights the responsible group?','It was local volunteers who first mapped the dangerous crossings.'],
      ['Which sentence uses all correctly for emphasis?','All the residents wanted was a safe place for children to play.'],
      ['Which option keeps the focus and verb agreement correct?','What the council needs to provide is reliable information about the timetable.'],
      ['Which sentence draws attention to a specific action?','It was by sharing evidence that the group persuaded the council to respond.'],
      ['Which conclusion uses a cleft naturally?','What makes local action effective is the connection between experience and public responsibility.']
    ]
  };
  const items=contexts[grammar] || [];
  return items.map(([prompt,correct],index)=>{
    const options=[
      `The discussion of ${title.toLowerCase()} includes several important viewpoints.`,
      `The issue matters, but the report does not make its relationship clear.`,
      `People have opinions about ${title.toLowerCase()}, and the situation is complicated.`,
      correct
    ];
    const answer=index%4;
    options.splice(3,1);
    options.splice(answer,0,correct);
    return q(prompt,options,answer,`The correct option applies ${grammar} accurately and keeps the argument connected to “${readingTitle}”.`);
  });
}

const units = topics.map(buildUnit);
require('./advanced-communication-skills').ensureAdvancedCommunicationSkills(units, {
  language: 'english',
  level: 'B2'
});

module.exports={language:'english',level:'B2',courseTitle:'English B2',courseDescription:'Upper-intermediate English through twelve social-issue units combining narrative, evidence and debate.',units};
