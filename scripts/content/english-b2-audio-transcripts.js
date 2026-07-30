const transcripts = {
  'social-media-public-opinion': {
    title: 'When AI Makes a False Story Look Real',
    text: `Host: A video about a city election went viral last week, but fact-checkers later described it as misleading. How did it influence public opinion?

Guest: It is widely believed that the clip showed a candidate insulting local residents. In fact, the video had been cut, and the missing section changed the meaning. The original source was difficult to find because thousands of accounts had already shared the shorter version.

Host: Why did the correction travel more slowly?

Guest: Users inside an echo chamber tend to receive information that confirms what they already believe. It has also been argued that emotional content is rewarded by recommendation systems. That does not prove deliberate bias, but it helps explain why the false claim spread quickly.

Host: What should platforms do?

Guest: Stronger moderation may be needed, but every decision should be transparent. A source should be checked before a post is removed, and users should be shown the evidence. Otherwise, fact-checking itself may be seen as political control.`
  },
  'plastic-pollution-cities': {
    title: 'Why Cities Are Cutting Single-Use Plastic',
    text: `Host: The river clean-up collected hundreds of bags after the festival. What did volunteers find?

Guest: Most of the material was single-use packaging: cups, food containers and plastic bags. The city had the waste removed, but much of it had already entered the water. Over time, some pieces will break down into microplastic.

Host: Can a clean-up solve the problem?

Guest: It helps, but it only treats the final stage of the waste stream. Organizers should have vendors use reusable containers, and they can get water stations installed instead of selling individual bottles. Better signs would also help visitors sort waste correctly.

Host: Who carries the greatest responsibility?

Guest: Consumers make choices, but producer responsibility matters too. If packaging is designed to be disposable, more material reaches a landfill or the river. The city could have suppliers redesign it and could require a deposit system. That would prevent waste instead of merely having it collected afterward.`
  },
  'climate-change-daily-decisions': {
    title: 'Extreme Weather and Everyday Choices',
    text: `Host: People are often told to reduce their carbon footprint. Are personal choices enough?

Guest: They matter, but they operate inside a larger system. If cities had invested in reliable public transportation years ago, fewer commuters would depend on fossil fuel today. And if clean infrastructure were available everywhere, many households would already be using renewable energy.

Host: Does that remove individual responsibility?

Guest: No. Lower demand can reduce emissions and signal support for change. However, mitigation also requires rules for major producers, while adaptation requires communities to prepare for effects that are already unavoidable.

Host: What makes policy effective?

Guest: A practical incentive can help families choose efficient transport or home energy, but the option must be affordable. If governments had treated climate action only as a personal moral test, they would have ignored structural barriers. Daily decisions are useful when public investment makes better decisions possible.`
  },
  'corruption-public-trust': {
    title: 'Why Public Contracts Need Transparency',
    text: `Host: A public procurement contract doubled in price, although several repairs were never completed. What might have happened?

Guest: Officials may have acted too quickly after the hurricane, but the missing records suggest more than simple confusion. The company could have received special treatment, and a conflict of interest might have influenced the decision.

Host: Some residents immediately alleged bribery. Is that conclusion justified?

Guest: Not yet. Money may have been exchanged, but investigators need evidence. A whistleblower reported that competing bids had disappeared, which should have triggered stronger civic oversight. The documents might also have been removed later to protect someone.

Host: Why does this affect public trust?

Guest: Without accountability, people assume that clientelism and impunity are normal. Even an honest emergency decision can look corrupt when nobody explains it. Transparent records would allow residents to distinguish poor management from deliberate wrongdoing and would make future contracts easier to examine.`
  },
  'fourth-of-july': {
    title: 'What the Fourth of July Means Today',
    text: `Host: Fireworks are beginning across the city. What does the Fourth of July commemorate?

Guest: Marking the declaration of independence, the holiday celebrates a founding document that placed liberty at the center of the new nation. For many families, displaying the flag expresses patriotism and a shared national identity.

Host: Yet the celebration can also produce discomfort.

Guest: Written in the language of equality, the declaration existed alongside slavery and exclusion. Recognizing that contradiction does not erase the achievement of independence. It asks whether the promise was available to everyone.

Host: How have later generations responded?

Guest: Drawing on the same language of freedom, civil rights movements demanded that the country honor its stated ideals. Seen in that context, the holiday is not only about the past. Celebrated thoughtfully, it can join pride with responsibility: people can value a national tradition while acknowledging the unfinished work required to make liberty real.`
  },
  'migration-cultural-identity': {
    title: 'Living Between Languages and Cultures',
    text: `Host: Our guest Maya grew up in a diaspora family. Maya, where do you call home?

Guest: Home is not a single place. My parents, whose roots are in Jamaica, taught me family stories and music. Manchester, where I was born, shaped my education and friendships. Both places belong to my identity.

Host: What does successful integration mean to you?

Guest: It means participating fully in the host community without being required to erase your heritage. Assimilation, which expects people to abandon visible differences, creates a false choice. The neighbors who welcomed my parents also became part of our story.

Host: Does a layered identity ever feel difficult?

Guest: Certainly. There are moments when others question my belonging or ask where I am “really” from. But the communities in which cultures meet can create new traditions. Identity is not a suitcase with room for only one object; it is a relationship among memory, place and the people with whom we build a life.`
  },
  'housing-inequality': {
    title: 'Why Rent Keeps Rising',
    text: `Host: Lena, a tenant in the city center, has received another rent increase. How serious is the change?

Guest: Her rent is considerably higher than it was two years ago, while her salary is only slightly higher. The cost of living has risen much faster than household income, so affordable housing is becoming far harder to find.

Host: Landlords point to maintenance costs and a housing shortage.

Guest: Those pressures are real, but the market is much less balanced than it appears. A landlord can often replace a tenant quickly, whereas a family facing displacement may have nowhere nearby to go.

Host: Would new construction solve the problem?

Guest: It could help, especially where restrictive zoning limits supply. However, luxury development alone is far less effective than mixed housing that includes affordable units. The strongest policy would be more ambitious: protect existing tenants, build substantially more homes and connect housing decisions to transportation, wages and local services.`
  },
  'ai-and-employment': {
    title: 'How AI Is Changing Entry-Level Work',
    text: `Host: A regional hotel chain has introduced an automated scheduling system. What will have changed by next year?

Guest: Managers will have reduced the time they spend building weekly schedules, and the hotel may have improved productivity. Staff will also be checking shifts through an app instead of speaking directly with a supervisor.

Host: What concerns have employees raised?

Guest: Some workers fear displacement, but the immediate problem is decision-making. If the system does not consider caregiving duties, algorithmic bias may give the least convenient shifts to the same people repeatedly.

Host: How should the hotel respond?

Guest: Human oversight must remain central. Over the coming months, managers will be reviewing disputed schedules and explaining how recommendations are produced. By the end of the trial, employees should have received retraining, and the company should have published clear rules. Automation can support workers, but only a transparent system allows them to challenge a harmful decision.`
  },
  'fast-fashion-hidden-costs': {
    title: 'Why Cheap Fashion Goes Viral',
    text: `Host: A five-pound shirt looks affordable. Why might its real price be higher?

Guest: Although the customer pays very little, the supply chain can transfer costs to a garment worker, a polluted river or a community near a factory. The low price does not show those consequences.

Host: Some people argue that fast fashion makes clothing accessible.

Guest: That is true, even though the disposable model encourages people to buy more than they need. Consumer demand is part of the system, but companies still control contracts, materials and labour conditions.

Host: Can labels help?

Guest: They can, provided that claims are supported by traceability. While a brand may advertise one sustainable collection, it might reveal very little about the rest of its production. Better information will not solve every labour-rights problem; nevertheless, it can expose the hidden cost and help shoppers compare products. Affordability matters, but it should not depend on keeping workers and environmental damage invisible.`
  },
  'education-social-mobility': {
    title: 'Can Education Still Create Opportunity?',
    text: `Host: A community mentoring program supports Aisha, whose grades qualify her for a scholarship. Why is her application unfinished?

Guest: Not only does she work evenings to help her family, but she also lacks reliable advice about admissions. Tuition is the visible barrier; information and time create an opportunity gap as well.

Host: Some people say scholarships reward merit fairly.

Guest: Rarely is merit produced by effort alone. Students also need safe schools, mentoring and access to activities that strengthen an application. Never had Aisha met anyone from the university before this program.

Host: What would improve social mobility?

Guest: Financial support is essential, but so is guidance. Only when institutions simplify forms and explain requirements clearly can talented students compete on more equal terms. The scholarship may open one door, yet broader access requires transportation, academic support and policies that recognize unequal starting points. Education creates opportunity, but it cannot remove every social barrier by itself.`
  },
  'free-speech-misinformation': {
    title: 'Who Decides What Stays Online?',
    text: `Host: A community forum removed a post containing a harmful claim about a local clinic. Critics called the decision censorship. What did the moderators say?

Guest: They explained that the post had presented misinformation as medical fact and that several users had begun sharing it. The clinic reported that patients were canceling appointments because of the claim.

Host: Did anyone defend the post?

Guest: One member argued that free speech included the right to question institutions. Another accused the moderators of hiding criticism. The team replied that disagreement was permitted, but unsupported medical advice violated the content policy.

Host: Was removal proportionate?

Guest: The evidence suggested a measurable risk, so temporary removal was reasonable. However, the moderators also published their reasons and offered an appeal. They emphasized that criticism would be restored if the harmful claim was corrected. A fair policy should not silence unpopular opinions; it should distinguish opinion from false factual claims and explain every restriction transparently.`
  },
  'community-action': {
    title: 'When a Neighborhood Organizes for Change',
    text: `Host: Residents had complained about poor lighting for months. What finally changed?

Guest: It was a small grassroots meeting that turned frustration into collective action. What the neighbors needed was not another general complaint but a clear record of broken lights and unsafe areas.

Host: Who organized the initiative?

Guest: A volunteer mapped the problems, while other residents created a petition. It was the evidence gathered door to door that persuaded each stakeholder to attend a public meeting.

Host: Did the local council accept every request?

Guest: No. What officials emphasized was the limited public-service budget. The residents responded that volunteers could provide local knowledge but should not replace trained workers. It was through that distinction that the group found common ground.

Host: What happened next?

Guest: The council repaired the most dangerous locations and published a longer plan. What made the campaign effective was its combination of practical evidence, respectful pressure and shared responsibility.`
  }
};

module.exports = transcripts;
