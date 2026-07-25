// scripts/content/english-b1-units.js
// Hand-authored English B1 content. Same exported shape as English A1/A2:
// builders flatten these units into lib/seed-lessons.json + lib/seed-units.json,
// and the migration script pushes them into the normalized Supabase course schema.
//
// Scope: 12 thematic units, 6 activities per unit (reading, listening,
// speaking, writing, grammar, vocabulary). Units 1-2 are free; 3-12 premium.

const DEFAULTS = {
  reading: { duration: 18, xp: 35 },
  listening: { duration: 14, xp: 30 },
  speaking: { duration: 12, xp: 30 },
  writing: { duration: 18, xp: 35 },
  grammar: { duration: 14, xp: 30 },
  vocabulary: { duration: 14, xp: 30 }
};

const {
  reading: readingExerciseBanks,
  grammar: grammarExerciseBanks,
  grammarTest,
  vocabularyExercises
} = require('./english-b1-practice');

function activity(skill, fields) {
  return { skill, duration: DEFAULTS[skill].duration, xp: DEFAULTS[skill].xp, ...fields };
}

const unitPlans = [
  {
    slug: 'new-challenges',
    title: 'New Challenges',
    titleEs: 'Nuevos retos',
    description: 'Adjusting to bigger responsibilities at work and in daily life.',
    objective: 'Describe changes, challenges and personal progress with clear B1 detail.',
    grammar: 'Present Perfect vs. Past Simple',
    grammarNote:
      'Use the Present Perfect to connect past experiences to the present: "Sarah has taken on more responsibility." Use the Past Simple when the time is finished or specific: "She led her first meeting last Tuesday." At B1, the contrast helps you explain experience and give precise examples.',
    vocabulary: [
      ['take on', 'asumir', 'Sarah has taken on a new project at work.'],
      ['challenge', 'reto', 'The presentation was a real challenge.'],
      ['make progress', 'progresar', 'Daniel has made progress with his English.'],
      ['deadline', 'fecha limite', 'The deadline is next Friday.'],
      ['confident', 'seguro/a', 'She feels more confident after each meeting.'],
      ['feedback', 'comentarios/retroalimentacion', 'Her manager gave useful feedback.']
    ],
    scenario: 'Sarah receives a new project at the design company while Daniel prepares for a professional English interview.',
    readingTitle: 'A Project That Changed Everything',
    story:
      'Sarah has worked at the same design company in Manchester for three years, but this month feels different. Her manager has asked her to coordinate a campaign for a local charity, and for the first time she is responsible for the schedule, the client meetings and the final presentation. At first, she felt excited. Then she saw the deadline on the calendar and realised how much work was waiting for her.\n\n' +
      'Last Tuesday, Sarah led her first planning meeting. She had prepared carefully, but one colleague asked a question she could not answer immediately. Instead of pretending, she wrote it down and promised to check the details before lunch. Later, her manager told her that this was exactly the right reaction. "Good leaders do not know everything," he said. "They know how to keep the project moving."\n\n' +
      'At home, Daniel was facing his own challenge. He had applied for a position at an international hotel, and the interview would be partly in English. He had studied English for years, but speaking under pressure still made him nervous. Every evening, Sarah asked him interview questions while he practised giving longer answers.\n\n' +
      'By the end of the week, both of them had made progress. Sarah had created a realistic project plan, and Daniel had learned to describe his experience with more confidence. They were tired, but they also felt proud. The week showed them that a new challenge can be uncomfortable and useful at the same time.',
    listeningTitle: 'Practising for the Interview',
    transcript:
      'Daniel is practising for his hotel interview with Sarah. She asks him to describe a difficult situation at work, and he explains how he helped an angry guest stay calm. Sarah tells him to give more details and to finish with what he learned. Daniel repeats the answer, this time more clearly. He says that the experience taught him to listen first, apologise when necessary and offer practical solutions. Sarah smiles because his second answer sounds much more natural.',
    prompts: ['Describe a challenge you have had recently.', 'Explain what you learned from it.']
  },
  {
    slug: 'work-and-ambition',
    title: 'Work and Ambition',
    titleEs: 'Trabajo y ambicion',
    description: 'Talking about goals, choices and professional plans.',
    objective: 'Explain ambitions, compare options and justify career decisions.',
    grammar: 'Future forms: will, going to and Present Continuous',
    grammarNote:
      'Use "going to" for plans or intentions, "will" for decisions made now or predictions, and the Present Continuous for arranged future events. B1 speakers often combine them: "I am meeting the client tomorrow, so I am going to prepare tonight. I think it will go well."',
    vocabulary: [
      ['ambition', 'ambicion', 'Her ambition is to become a project manager.'],
      ['promotion', 'ascenso', 'A promotion would bring more responsibility.'],
      ['apply for', 'solicitar', 'Daniel is going to apply for the position.'],
      ['arrange', 'organizar', 'They arranged a meeting with the client.'],
      ['opportunity', 'oportunidad', 'The campaign is a great opportunity.'],
      ['responsibility', 'responsabilidad', 'More responsibility can be stressful.']
    ],
    scenario: 'Sarah considers applying for a promotion while Daniel waits for news after his interview.',
    readingTitle: 'The Promotion Question',
    story:
      'On Monday morning, Sarah saw an internal job advertisement on the office noticeboard. The company was looking for an assistant project manager, and several colleagues immediately told her she should apply. Sarah was interested, but she was also unsure. The role would give her more influence, better pay and a chance to learn, but it would also mean longer meetings and more pressure.\n\n' +
      'During lunch, she made a list of reasons for and against applying. She had already coordinated part of the charity campaign, so she knew she could organise people and deadlines. However, she had never managed a budget before, and that worried her. Her colleague Priya told her that nobody starts a new role already knowing everything. "You are going to learn by doing," Priya said.\n\n' +
      'That evening, Daniel had his own news. The hotel had invited him for a second interview on Thursday. He was nervous, but happier than he expected. Sarah noticed that both of them were standing at a similar point: they could stay comfortable, or they could accept the next level of responsibility.\n\n' +
      'By the end of the night, Sarah had made a decision. She was going to update her CV, write a short application letter and ask her manager for advice. She did not know if she would get the promotion, but she knew she would regret not trying.',
    listeningTitle: 'A Career Conversation',
    transcript:
      'Sarah tells Daniel that she is thinking about applying for a promotion. Daniel asks whether she really wants the job or only feels pushed by other people. Sarah says she wants to grow, but she is afraid of making mistakes. Daniel reminds her that she encouraged him before his interview, and now he wants to do the same for her. They agree to spend the evening preparing her application.',
    prompts: ['Talk about a job or study goal.', 'Give two reasons why the goal matters to you.']
  },
  {
    slug: 'community-life',
    title: 'Community Life',
    titleEs: 'Vida comunitaria',
    description: 'Participating in local events and expressing opinions politely.',
    objective: 'Discuss community problems and suggest realistic solutions.',
    grammar: 'Modals for advice, obligation and possibility',
    grammarNote:
      'Use "should" for advice, "must" for strong obligation, "have to" for external rules and "might/could" for possibility. At B1, modals help you sound clear without being too direct: "The council should improve the park, but residents could help too."',
    vocabulary: [
      ['neighbourhood', 'barrio', 'Their neighbourhood is becoming more active.'],
      ['resident', 'residente', 'Several residents attended the meeting.'],
      ['volunteer', 'voluntario/a', 'They volunteered at the community clean-up.'],
      ['proposal', 'propuesta', 'Sarah made a proposal about the park.'],
      ['improve', 'mejorar', 'The council should improve the lighting.'],
      ['take part', 'participar', 'Daniel decided to take part in the event.']
    ],
    scenario: 'Sarah and Daniel attend a neighbourhood meeting about improving a small public park.',
    readingTitle: 'The Meeting at the Community Centre',
    story:
      'The community centre was usually quiet on Wednesday evenings, but this week every chair was taken. Residents had come to discuss the small park behind the library. Some people wanted new benches, others complained about rubbish, and several parents said the playground needed repairs. Sarah and Daniel had walked past the park many times, but they had never thought seriously about who looked after it.\n\n' +
      'At first, the meeting was tense. One man said the council had to solve everything, while another woman argued that residents should also take responsibility. Sarah listened carefully and then made a practical suggestion. The neighbourhood could organise a clean-up morning while asking the council to repair the lights and playground equipment.\n\n' +
      'Daniel was surprised when people supported the idea. A retired teacher offered to make posters, a cafe owner promised free coffee for volunteers, and a group of students said they could share the event online. By the end of the meeting, the park no longer felt like somebody else\'s problem.\n\n' +
      'On the walk home, Daniel said that community life was more interesting than he had imagined. Sarah agreed. She had gone to the meeting expecting complaints, but she left with the feeling that small actions could change the place where they lived.',
    listeningTitle: 'Planning the Clean-up',
    transcript:
      'At the community centre, Sarah speaks with two residents about the clean-up morning. They decide that volunteers should arrive at nine, bring gloves if possible and work in small teams. Daniel suggests creating a simple online form so people can choose a task. Everyone agrees that the event must be safe, organised and friendly for families.',
    prompts: ['Suggest one improvement for your neighbourhood.', 'Use should, could or have to in your answer.']
  },
  {
    slug: 'travel-with-purpose',
    title: 'Travel with Purpose',
    titleEs: 'Viajar con proposito',
    description: 'Planning meaningful trips and dealing with unexpected changes.',
    objective: 'Narrate travel experiences and respond to problems while travelling.',
    grammar: 'Past Continuous and Past Simple',
    grammarNote:
      'Use the Past Continuous for background actions and the Past Simple for completed events: "They were waiting for the train when the announcement changed." This contrast helps you tell stories naturally at B1.',
    vocabulary: [
      ['itinerary', 'itinerario', 'Their itinerary included York and the coast.'],
      ['delay', 'retraso', 'There was a delay at the station.'],
      ['announcement', 'anuncio', 'The announcement surprised everyone.'],
      ['get lost', 'perderse', 'They got lost near the old city walls.'],
      ['destination', 'destino', 'York was their first destination.'],
      ['make the most of', 'aprovechar al maximo', 'They made the most of the delay.']
    ],
    scenario: 'Sarah and Daniel take a weekend trip to York and learn to adapt when plans change.',
    readingTitle: 'A Weekend That Did Not Follow the Plan',
    story:
      'Sarah loves planning trips carefully. Before their weekend in York, she had booked the train, chosen a small hotel and written an itinerary with museums, cafes and a walk along the city walls. Daniel laughed when he saw the schedule, but he also admitted that travelling with Sarah was usually relaxing because she thought of everything.\n\n' +
      'On Saturday morning, they were waiting at Manchester station when an announcement changed the mood. Their train was delayed for almost an hour because of a technical problem. Sarah looked disappointed, but Daniel suggested using the extra time to have breakfast nearby. While they were drinking coffee, they found a small exhibition about railway history inside the station.\n\n' +
      'When they finally arrived in York, the second problem appeared. They were following the map on Daniel\'s phone when the battery died. For twenty minutes they walked confidently in the wrong direction. Instead of arguing, they asked an elderly woman for help. She not only showed them the way but also recommended a quiet street with independent bookshops.\n\n' +
      'By Sunday evening, Sarah had stopped worrying about the itinerary. They had missed one museum but discovered two places they would never have found otherwise. The trip reminded her that good planning is useful, but flexibility can make a journey memorable.',
    listeningTitle: 'Changing the Plan',
    transcript:
      'Daniel tells Sarah that the train is delayed and suggests changing the morning plan. Sarah is frustrated because she wanted to arrive early, but Daniel points out that they can still visit the main museum in the afternoon. They decide to have breakfast, check the new arrival time and choose one activity to remove from the itinerary.',
    prompts: ['Tell a short story about a trip problem.', 'Use Past Continuous and Past Simple.']
  },
  {
    slug: 'health-and-balance',
    title: 'Health and Balance',
    titleEs: 'Salud y equilibrio',
    description: 'Talking about stress, habits and realistic self-care.',
    objective: 'Explain habits, give advice and discuss stress in a balanced way.',
    grammar: 'Gerunds and infinitives',
    grammarNote:
      'Some verbs are followed by gerunds ("enjoy walking", "avoid checking emails late"), while others are followed by infinitives ("decide to rest", "need to sleep"). At B1, this helps you talk about habits and choices more accurately.',
    vocabulary: [
      ['balance', 'equilibrio', 'Sarah needs a better work-life balance.'],
      ['stressful', 'estresante', 'The last month has been stressful.'],
      ['routine', 'rutina', 'A calm evening routine helps Daniel sleep.'],
      ['avoid', 'evitar', 'She tries to avoid checking emails at night.'],
      ['rest', 'descansar', 'They decided to rest on Sunday.'],
      ['well-being', 'bienestar', 'Exercise supports her well-being.']
    ],
    scenario: 'After several busy weeks, Sarah and Daniel rethink their routines and boundaries.',
    readingTitle: 'Learning to Slow Down',
    story:
      'For several weeks, Sarah had been saying yes to everything. She answered emails during dinner, accepted extra tasks at work and spent her weekends preparing for Monday. At first, she felt productive, but gradually she became tired and impatient. Daniel noticed it when she forgot an appointment they had planned together.\n\n' +
      'Instead of criticising her, Daniel suggested taking a quiet walk along the canal. While they were walking, Sarah admitted that she enjoyed doing well at work but hated feeling permanently available. Daniel understood the feeling. Since starting his new hotel job, he had also found it difficult to stop thinking about work after his shift ended.\n\n' +
      'They decided to make three simple changes. Sarah would avoid checking work emails after eight o\'clock. Daniel would prepare his uniform before dinner instead of rushing in the morning. Both of them would keep Sunday afternoon free unless something urgent happened.\n\n' +
      'The changes did not solve every problem immediately, but they made daily life feel lighter. Sarah realised that ambition and rest did not have to be enemies. In fact, resting properly helped her think more clearly and work better.',
    listeningTitle: 'A Healthier Routine',
    transcript:
      'Sarah and Daniel discuss their evening routines. Sarah says she needs to stop checking emails late at night. Daniel says he wants to start preparing for work earlier so his mornings are calmer. They agree that small habits can reduce stress more effectively than dramatic promises.',
    prompts: ['Give advice to someone who feels stressed.', 'Use one gerund and one infinitive.']
  },
  {
    slug: 'money-and-choices',
    title: 'Money and Choices',
    titleEs: 'Dinero y decisiones',
    description: 'Discussing budgets, priorities and financial decisions.',
    objective: 'Compare financial options and explain personal priorities.',
    grammar: 'First conditional',
    grammarNote:
      'Use the first conditional for real future possibilities: "If we save for three months, we will be able to travel." The if-clause uses Present Simple, and the result clause often uses will, can or may.',
    vocabulary: [
      ['budget', 'presupuesto', 'They made a budget for the month.'],
      ['save up', 'ahorrar', 'Sarah wants to save up for a course.'],
      ['afford', 'permitirse pagar', 'They cannot afford every plan at once.'],
      ['priority', 'prioridad', 'Their priority is paying rent on time.'],
      ['expense', 'gasto', 'Transport is a monthly expense.'],
      ['worth it', 'vale la pena', 'The course is expensive, but it may be worth it.']
    ],
    scenario: 'Sarah wants to take a professional course, but she and Daniel need to review their budget first.',
    readingTitle: 'The Course and the Budget',
    story:
      'Sarah found an online course in project management that looked perfect for her promotion goals. It included live classes, feedback from tutors and a final certificate. There was only one problem: the course was more expensive than she expected. She closed the laptop, opened it again, and then asked Daniel to look at the details with her.\n\n' +
      'They spent Saturday morning reviewing their budget. Rent, food, transport and bills came first. Then they looked at smaller expenses: takeaway meals, streaming services and weekend plans. Daniel did not want Sarah to give up the course immediately, but he also knew they could not ignore the numbers.\n\n' +
      'After an hour, they created a realistic plan. If they cooked at home more often, they would save a little each week. If Sarah chose the monthly payment option, the course would be easier to manage. And if Daniel received extra shifts at the hotel, they could rebuild their savings faster.\n\n' +
      'Sarah finally enrolled on the course, but the decision felt responsible rather than impulsive. She learned that a budget was not only a list of limits. It was also a way to choose what mattered most.',
    listeningTitle: 'Making the Numbers Work',
    transcript:
      'Sarah explains the price of the course to Daniel. Daniel suggests looking at the monthly payment option and reducing a few non-essential expenses. Sarah says that if they plan carefully, she will be able to study without creating problems. They agree to review the budget again after one month.',
    prompts: ['Describe something you want to save money for.', 'Use a first conditional sentence.']
  },
  {
    slug: 'digital-life',
    title: 'Digital Life',
    titleEs: 'Vida digital',
    description: 'Using technology responsibly and talking about online habits.',
    objective: 'Discuss online behaviour, advantages and disadvantages of technology.',
    grammar: 'Relative clauses',
    grammarNote:
      'Use relative clauses to add information: "The app that Sarah uses tracks her screen time." Use "who" for people, "which/that" for things and "where" for places. At B1, relative clauses make explanations smoother.',
    vocabulary: [
      ['screen time', 'tiempo de pantalla', 'Sarah wants to reduce her screen time.'],
      ['notification', 'notificacion', 'The notification interrupted their dinner.'],
      ['privacy', 'privacidad', 'Daniel is careful about online privacy.'],
      ['device', 'dispositivo', 'He leaves his device outside the bedroom.'],
      ['scroll', 'desplazarse en pantalla', 'She scrolls when she feels tired.'],
      ['digital habit', 'habito digital', 'They want healthier digital habits.']
    ],
    scenario: 'A phone notification during dinner starts a conversation about online habits.',
    readingTitle: 'The Notification Problem',
    story:
      'Sarah and Daniel were halfway through dinner when Sarah\'s phone lit up for the fifth time. It was only a work chat notification, but it pulled her attention away from the conversation. Daniel did not complain immediately. He simply asked whether the message was urgent. Sarah looked embarrassed when she realised it was not.\n\n' +
      'The next day, she checked the screen-time report that her phone produced every Sunday. The result surprised her. She was spending far more time on work messages and social media than she had imagined. Daniel showed her an app that blocked notifications during meals and before bed.\n\n' +
      'They talked about the advantages and disadvantages of technology. Sarah liked tools that helped her organise projects, while Daniel appreciated apps that made travel and banking easier. However, both agreed that devices should not control every quiet moment.\n\n' +
      'For one week, they tried a simple experiment. Phones stayed away from the table during dinner, and notifications were switched off after ten. The evenings became calmer. Sarah did not stop using technology, but she started using it with more intention.',
    listeningTitle: 'A Phone-Free Dinner',
    transcript:
      'Daniel asks Sarah whether they can have dinner without phones on the table. Sarah agrees, although she worries about missing an important message. Daniel says that people who really need her can call. They decide to switch off non-urgent notifications and enjoy the meal.',
    prompts: ['Describe a digital habit you want to change.', 'Use a relative clause with who, which or that.']
  },
  {
    slug: 'culture-and-media',
    title: 'Culture and Media',
    titleEs: 'Cultura y medios',
    description: 'Talking about films, books, reviews and cultural opinions.',
    objective: 'Express opinions about media and support them with examples.',
    grammar: 'Comparatives and superlatives with modifiers',
    grammarNote:
      'Use modifiers to make comparisons more precise: "much better", "slightly more serious", "by far the most interesting". At B1, this helps you give nuanced opinions about films, books and events.',
    vocabulary: [
      ['review', 'resena', 'Sarah read a review before choosing the film.'],
      ['plot', 'trama', 'The plot was simple but moving.'],
      ['character', 'personaje', 'Daniel liked the main character.'],
      ['moving', 'conmovedor/a', 'The final scene was moving.'],
      ['recommend', 'recomendar', 'Priya recommended the documentary.'],
      ['by far', 'con diferencia', 'It was by far the best film they saw that year.']
    ],
    scenario: 'Sarah and Daniel join a small film club and learn to explain their opinions more clearly.',
    readingTitle: 'The Film Club Debate',
    story:
      'Priya invited Sarah and Daniel to a film club at a small independent cinema. The film was a quiet drama about a family restaurant, and Sarah was not sure Daniel would enjoy it. He usually preferred faster stories with more action. However, by the end of the film, he was the first person to start the discussion.\n\n' +
      'Sarah thought the film was much more emotional than she had expected. The plot was simple, but the characters felt real. Daniel agreed, although he said the middle section was slightly too slow. Another person in the group argued that the slow rhythm was the point because it showed ordinary life honestly.\n\n' +
      'The discussion became more interesting than the film itself. People compared it with other dramas, talked about the music and disagreed politely about the ending. Sarah noticed that giving an opinion was easier when she included a reason and an example.\n\n' +
      'On the way home, Daniel said he might try more independent films. It was not by far his favourite type of cinema, but he had enjoyed hearing different interpretations. Sarah smiled because that was exactly why she liked cultural events: they made familiar things feel new.',
    listeningTitle: 'After the Film',
    transcript:
      'Sarah says the film was more moving than she expected. Daniel says it was slower than his usual choice, but the main character was interesting. Priya asks them whether they would recommend it. Sarah says yes, especially to people who enjoy realistic stories.',
    prompts: ['Recommend a film, series or book.', 'Use one comparative and one reason.']
  },
  {
    slug: 'relationships-and-decisions',
    title: 'Relationships and Decisions',
    titleEs: 'Relaciones y decisiones',
    description: 'Discussing personal decisions, compromise and communication.',
    objective: 'Talk about disagreement, compromise and shared plans.',
    grammar: 'Second conditional',
    grammarNote:
      'Use the second conditional for imaginary or less likely situations: "If we moved to another city, we would need new jobs." It helps you explore decisions before they become real.',
    vocabulary: [
      ['compromise', 'acuerdo intermedio', 'A good compromise respects both people.'],
      ['point of view', 'punto de vista', 'Daniel explained his point of view calmly.'],
      ['disagree', 'estar en desacuerdo', 'They disagreed about moving.'],
      ['imagine', 'imaginar', 'Sarah imagined living in another city.'],
      ['support', 'apoyar', 'They support each other\'s goals.'],
      ['decision', 'decision', 'The decision needed time.']
    ],
    scenario: 'A job possibility in another city makes Sarah and Daniel discuss the future seriously.',
    readingTitle: 'What If We Moved?',
    story:
      'One evening, Daniel came home with unexpected news. His manager had mentioned a possible position at a hotel in Liverpool. It was not an official offer yet, but it could become one within a few months. Daniel looked excited and worried at the same time. Sarah listened carefully, but her first reaction was silence.\n\n' +
      'Manchester had become home for Sarah. Her work, friends and routines were there. If they moved to Liverpool, she would have to rethink many parts of her life. Daniel understood, but he also felt that the position could help his career. For the first time in months, they disagreed about something important.\n\n' +
      'Instead of deciding immediately, they wrote down questions. What would happen to Sarah\'s promotion application? Could Daniel commute at first? Would the new job really offer better training? If they waited six months, would they have more information?\n\n' +
      'The conversation was difficult, but it was honest. They did not find a final answer that night. What they found was a process: listen first, imagine different possibilities and avoid turning one person\'s opportunity into the other person\'s loss.',
    listeningTitle: 'Talking About Liverpool',
    transcript:
      'Daniel tells Sarah that a Liverpool position might become available. Sarah says she wants to support him, but she is not ready to leave Manchester quickly. Daniel suggests collecting more information before making a decision. They agree to talk again when the offer becomes clearer.',
    prompts: ['Imagine a big life change.', 'Use: If I moved..., I would...']
  },
  {
    slug: 'looking-ahead',
    title: 'Looking Ahead',
    titleEs: 'Mirando hacia adelante',
    description: 'Reflecting on progress and making realistic future plans.',
    objective: 'Summarise progress, describe lessons learned and set future goals.',
    grammar: 'Reported speech',
    grammarNote:
      'Use reported speech to repeat what someone said: "Priya said that Sarah was ready." When the reporting verb is in the past, tenses often move back. Reported speech is useful for stories, feedback and workplace communication.',
    vocabulary: [
      ['reflect on', 'reflexionar sobre', 'They reflected on the year together.'],
      ['achievement', 'logro', 'The course certificate was an achievement.'],
      ['set a goal', 'fijar una meta', 'Sarah set a goal for the next six months.'],
      ['advice', 'consejo', 'Priya gave honest advice.'],
      ['look ahead', 'mirar hacia adelante', 'They looked ahead to the next stage.'],
      ['turning point', 'punto de inflexion', 'The charity project was a turning point.']
    ],
    scenario: 'Sarah and Daniel look back on a year of changes and decide what they want next.',
    readingTitle: 'The Next Stage',
    story:
      'At the end of the year, Sarah and Daniel returned to the small cafe where they had once planned Lucy\'s visit. So much had changed since then that the place felt like a marker in their story. Sarah had completed her project management course, Daniel had settled into his hotel job, and both of them had become braver about making decisions.\n\n' +
      'Sarah told Daniel that Priya had said she was ready for more leadership. At first, Sarah had not believed it, but the charity campaign had become a turning point. She had learned that confidence did not arrive before action; often, it arrived because of action.\n\n' +
      'Daniel reflected on his own progress too. He said that the English interview had taught him to prepare carefully but speak naturally. His manager had told him that guests appreciated his calm communication. That comment meant a lot because it proved his effort was visible.\n\n' +
      'They each wrote three goals for the next six months. Sarah wanted to lead another campaign, continue studying and protect her free time. Daniel wanted to improve his professional English, save money and visit Liverpool before making any decisions. Looking ahead felt less frightening now because they had evidence from the past: they could adapt, learn and keep moving.',
    listeningTitle: 'Three Goals',
    transcript:
      'Sarah and Daniel discuss their goals for the next six months. Sarah says Priya told her she was ready for leadership. Daniel says his manager told him that his communication had improved. They decide to write realistic goals instead of vague promises.',
    prompts: ['Report one piece of advice someone gave you.', 'Say one realistic goal for the next six months.']
  },
  {
    slug: 'sustainable-futures',
    title: 'Sustainable Futures',
    titleEs: 'Futuros sostenibles',
    description: 'Discussing environmental choices and practical community action.',
    objective: 'Explain environmental problems, their causes and realistic solutions.',
    grammar: 'Passive voice in the present and past',
    grammarNote:
      'Use the passive when the action or result is more important than the person who performs it. Form it with be plus the past participle: "Plastic is collected every Friday" and "The garden was created by local volunteers."',
    vocabulary: [
      ['sustainable', 'sostenible', 'The neighbourhood wants a more sustainable transport plan.'],
      ['waste', 'residuos/desperdicio', 'Food waste is collected separately.'],
      ['recycle', 'reciclar', 'Glass can be recycled many times.'],
      ['renewable', 'renovable', 'The centre now uses renewable energy.'],
      ['reduce', 'reducir', 'Residents hope to reduce plastic use.'],
      ['environmental impact', 'impacto ambiental', 'They measured the environmental impact of the event.']
    ],
    scenario: 'Sarah and Daniel join a neighbourhood project that reduces waste and improves a shared garden.',
    readingTitle: 'The Street That Changed Its Habits',
    story:
      'When a recycling report was published by the local council, Sarah was surprised by one fact: her neighbourhood produced more household waste than any other area nearby. The report was discussed at the community centre, where residents admitted that the recycling instructions were confusing and that many useful materials were being thrown away.\n\n' +
      'A small volunteer team was created to make the system easier. Clear labels were designed for shared recycling bins, short guides were delivered to every building and a monthly repair workshop was organised. Daniel helped at the first workshop, where old lamps, bicycles and kitchen equipment were repaired instead of replaced.\n\n' +
      'The project also transformed an unused space behind the library. The area had been ignored for years, but it was cleaned and turned into a community garden. Vegetables were planted in raised beds, rainwater was collected and local schools were invited to visit. Sarah coordinated the schedule and made sure that tasks were shared fairly.\n\n' +
      'Six months later, less waste was being sent to landfill and the garden had become a popular meeting place. The neighbourhood had not solved every environmental problem, but residents had learned an important lesson: sustainable change is easier when practical information and shared responsibility are provided.',
    listeningTitle: 'Planning a Greener Event',
    transcript:
      'Sarah and Daniel are planning a community event. Food will be served on reusable plates, recycling points will be placed near every entrance and leftover food will be donated. They discuss which tasks can be completed by volunteers and which services must be provided by the council.',
    prompts: ['Describe one sustainable action in your community.', 'Use one present or past passive sentence.']
  },
  {
    slug: 'learning-and-communication',
    title: 'Learning and Communication',
    titleEs: 'Aprendizaje y comunicación',
    description: 'Developing study strategies and communicating clearly across cultures.',
    objective: 'Explain learning strategies, communication problems and ways to improve.',
    grammar: 'Question forms and indirect questions',
    grammarNote:
      'Direct questions use question word plus auxiliary plus subject: "Where does the workshop start?" Indirect questions are more polite and use statement order: "Could you tell me where the workshop starts?" Do not add do or does inside the indirect clause.',
    vocabulary: [
      ['clarify', 'aclarar', 'Daniel asked the trainer to clarify the instructions.'],
      ['misunderstanding', 'malentendido', 'A small misunderstanding delayed the task.'],
      ['strategy', 'estrategia', 'Sarah changed her study strategy.'],
      ['take notes', 'tomar apuntes', 'She takes notes in her own words.'],
      ['figure out', 'descubrir/resolver', 'They figured out why the message was unclear.'],
      ['express yourself', 'expresarte', 'Practice helps you express yourself with confidence.']
    ],
    scenario: 'Sarah begins a professional course while Daniel helps international guests understand local information.',
    readingTitle: 'Learning How to Learn',
    story:
      'During the first week of her project management course, Sarah tried to record every word the tutor said. Her notebook filled quickly, but when she reviewed it later, the ideas did not feel connected. She knew the vocabulary, yet she could not explain the main concepts in her own words. She wondered whether her study method was creating more work than learning.\n\n' +
      'At the next session, the tutor introduced three strategies. Students should listen for the main idea before writing, organise notes as questions and answers, and explain each concept to a partner. Sarah began to write less but think more. Whenever a point was unclear, she asked an indirect question such as, "Could you explain how this stage connects to the deadline?"\n\n' +
      'Daniel was practising similar skills at the hotel. International guests sometimes understood individual words but missed important details about transport or check-in times. He learned to slow down, divide information into steps and ask guests to repeat the plan in their own words. This helped him identify misunderstandings before they became problems.\n\n' +
      'After a month, Sarah could see a clear difference. Her notes were shorter, her questions were more precise and she remembered more after each class. She realised that successful communication was not about using the greatest number of words. It was about choosing useful information, checking understanding and adjusting the message when necessary.',
    listeningTitle: 'Could You Explain That?',
    transcript:
      'Sarah asks her tutor how the final project will be assessed. She uses indirect questions to clarify the deadline, the presentation format and the marking criteria. The tutor answers each question and recommends that Sarah organise the information in a short checklist.',
    prompts: ['Explain a study strategy that works for you.', 'Ask one polite indirect question.']
  }
];

function mcq(prompt, options, answer) {
  return { type: 'mcq', prompt, options, answer };
}

const grammarGuides = {
  'new-challenges': {
    pattern: 'Present Perfect: subject + have/has + past participle. Past Simple: subject + past form.',
    mistake: 'Do not combine the Present Perfect with finished-time expressions such as yesterday or last Tuesday.'
  },
  'work-and-ambition': {
    pattern: 'going to + base verb for intentions; will + base verb for instant decisions/predictions; be + -ing for arrangements.',
    mistake: 'Do not add to after will, and always include the verb be before going to.'
  },
  'community-life': {
    pattern: 'subject + modal + base verb; have to uses do/does in questions and negatives.',
    mistake: 'Do not use to after should, could, might or must.'
  },
  'travel-with-purpose': {
    pattern: 'Past Continuous: was/were + -ing. Past Simple: completed past form.',
    mistake: 'Use the continuous action as background and the Past Simple event as the interruption.'
  },
  'health-and-balance': {
    pattern: 'verb + -ing after enjoy/avoid/suggest; verb + to-infinitive after decide/need/want/agree.',
    mistake: 'Learn the verb pattern as a complete chunk; do not choose gerund or infinitive only by translation.'
  },
  'money-and-choices': {
    pattern: 'If + Present Simple, will/can/may + base verb.',
    mistake: 'Do not normally use will inside the if-clause.'
  },
  'digital-life': {
    pattern: 'person + who; thing + that/which; place + where; time + when; possession + whose.',
    mistake: 'Do not repeat the subject or object pronoun when the relative word already performs that role.'
  },
  'culture-and-media': {
    pattern: 'short adjective + -er/-est; more/most + long adjective; use much/slightly to modify comparisons.',
    mistake: 'Avoid double comparatives such as more better or more easier.'
  },
  'relationships-and-decisions': {
    pattern: 'If + Past Simple, would/could/might + base verb.',
    mistake: 'Do not use would in the if-clause of a standard second conditional.'
  },
  'looking-ahead': {
    pattern: 'reporting verb + that-clause; present often backshifts to past, will to would, and have done to had done.',
    mistake: 'Use tell with a person (tell me) but say without a person or with to (say to me).'
  },
  'sustainable-futures': {
    pattern: 'Present passive: am/is/are + past participle. Past passive: was/were + past participle.',
    mistake: 'The passive needs a form of be and the past participle, not the simple past alone.'
  },
  'learning-and-communication': {
    pattern: 'Direct: question word + auxiliary + subject. Indirect: opening phrase + question word + subject + verb.',
    mistake: 'Do not keep do/does/did or inverted word order inside an indirect question.'
  }
};

function buildGrammarLessonNote(plan, exercises) {
  const guide = grammarGuides[plan.slug];
  const examples = exercises
    .slice(0, 3)
    .map((exercise) => exercise.options[exercise.answer])
    .join(' · ');
  return [
    `Goal: Use ${plan.grammar} accurately while discussing ${plan.title.toLowerCase()}.`,
    `Rule: ${plan.grammarNote}`,
    `Pattern: ${guide.pattern}`,
    `Examples: ${examples}`,
    `Common mistakes: ${guide.mistake}`,
    `Mini practice: Complete the eight guided items, review each explanation and then take the scored grammar test.`
  ].join('\n\n');
}

function expandVocabulary(plan) {
  const buildContexts = (word, example) => [
    { targetText: example },
    {
      targetText: `Sarah used “${word}” while discussing ${plan.title.toLowerCase()}.`
    },
    {
      targetText: `Daniel added “${word}” to his vocabulary notebook and used it in a new sentence.`
    }
  ];
  const base = plan.vocabulary.map(([word, translation, example]) => ({
    word,
    translation,
    definition: translation,
    example,
    contexts: buildContexts(word, example),
    partOfSpeech: word.includes(' ') ? 'phrase' : 'noun'
  }));
  const topic = plan.title.toLowerCase();
  const extras = [
    ['deal with', 'manejar/lidiar con', `They learned to deal with ${topic} in a practical way.`, 'phrasal verb'],
    ['point out', 'senalar', `Daniel pointed out one important detail during the conversation.`, 'phrasal verb'],
    ['come up with', 'proponer/idear', `Sarah came up with a realistic solution.`, 'phrasal verb'],
    ['keep track of', 'llevar registro de', `They kept track of their progress during the week.`, 'phrase'],
    ['on purpose', 'a proposito/con intencion', `They made the decision on purpose, not by accident.`, 'phrase'],
    ['in the long run', 'a largo plazo', `The change would help them in the long run.`, 'phrase']
  ];
  return [
    ...base,
    ...extras.map(([word, translation, example, partOfSpeech]) => ({
      word,
      translation,
      definition: translation,
      example,
      contexts: buildContexts(word, example),
      partOfSpeech
    }))
  ];
}

function extendReadingText(plan) {
  return plan.story;
}

function transcriptSegments(text) {
  return text
    .split('. ')
    .map((part, index, parts) => ({
      id: `segment-${String(index + 1).padStart(2, '0')}`,
      order: index + 1,
      text: index === parts.length - 1 || part.endsWith('.') ? part : `${part}.`
    }));
}

function buildUnit(plan, index) {
  const order = index + 1;
  const vocabItems = expandVocabulary(plan);
  const readingExercises = readingExerciseBanks[plan.slug];
  const grammarExercises = grammarExerciseBanks[plan.slug];
  if (!readingExercises || !grammarExercises) {
    throw new Error(`Missing English B1 exercise bank for "${plan.slug}"`);
  }

  return {
    slug: plan.slug,
    title: plan.title,
    titleEs: plan.titleEs,
    description: plan.description,
    order,
    accessTier: order <= 2 ? 'free' : 'premium',
    unitOverview: {
      objective: plan.objective,
      outcomes: [
        'understand a B1 narrative with connected paragraphs',
        'explain opinions and decisions with reasons',
        'use the target grammar in realistic contexts',
        'reuse key vocabulary in speaking and writing'
      ],
      grammar: [plan.grammar],
      vocabulary: plan.vocabulary.slice(0, 4).map(([word]) => word),
      scenario: plan.scenario
    },
    activities: {
      reading: activity('reading', {
        title: plan.readingTitle,
        description: `Read a B1 story about ${plan.title.toLowerCase()} and answer comprehension questions.`,
        reading: {
          title: plan.readingTitle,
          text: extendReadingText(plan),
          questions: [
            'What is the main challenge in this text?',
            'How do Sarah and Daniel respond to the situation?',
            'What lesson or change appears at the end?'
          ]
        },
        exercises: readingExercises
      }),
      listening: activity('listening', {
        listeningType: 'story',
        storyTitle: plan.listeningTitle,
        mainTranscript: plan.transcript,
        transcriptSegments: transcriptSegments(plan.transcript),
        title: plan.listeningTitle,
        description: `Listen to a short B1 conversation linked to ${plan.title.toLowerCase()}.`,
        exercises: [
          mcq('What is the listening mainly about?', [plan.title, 'Buying a train ticket only', 'A weather report', 'A recipe'], 0),
          mcq('What should you listen for?', ['Only names', 'The problem, suggestion and result', 'Only numbers', 'Silent pauses'], 1),
          mcq('What kind of language appears in the audio?', ['Connected B1 sentences', 'Only alphabet practice', 'Only slang', 'Only commands'], 0)
        ]
      }),
      speaking: activity('speaking', {
        title: `Talk about ${plan.title}`,
        description: 'Practise giving longer B1 answers with reasons and examples.',
        dialogue: [
          { speaker: 'Coach', line: plan.prompts[0], translation: plan.prompts[0] },
          { speaker: 'Student', line: 'I would answer with a clear situation, one reason and one example.', translation: 'Responderia con una situacion clara, una razon y un ejemplo.' },
          { speaker: 'Coach', line: plan.prompts[1], translation: plan.prompts[1] }
        ],
        exercises: [
          mcq('A strong B1 speaking answer should include...', ['Only one word', 'A situation, a reason and an example', 'Only a translation', 'No details'], 1),
          mcq('Which phrase helps you add a reason?', ['Because...', 'Yesterday?', 'Blue', 'Nothing'], 0)
        ]
      }),
      writing: activity('writing', {
        title: `Write about ${plan.title}`,
        description: 'Write a structured B1 paragraph with connectors.',
        intro: 'Write 90-120 words. Include a short introduction, two details and a final sentence.',
        phrases: ['First of all,', 'In my opinion,', 'For example,', 'As a result,'],
        exercises: [
          mcq('What is the best structure for this task?', ['One long sentence', 'Introduction, details and final sentence', 'Only bullet points', 'Only copied text'], 1),
          mcq('Which connector introduces an example?', ['For example,', 'Although?', 'Never mind', 'At six'], 0)
        ]
      }),
      grammar: activity('grammar', {
        title: plan.grammar,
        description: `Use ${plan.grammar} in a realistic B1 context.`,
        grammarNote: buildGrammarLessonNote(plan, grammarExercises),
        phrases: [plan.grammar, ...plan.prompts],
        exercises: grammarExercises,
        grammarTest: grammarTest(plan.slug, grammarExercises)
      }),
      vocabulary: activity('vocabulary', {
        title: `Vocabulary for ${plan.title}`,
        description: `Key B1 words and phrases for ${plan.title.toLowerCase()}.`,
        vocabulary: vocabItems,
        exercises: vocabularyExercises(vocabItems)
      })
    }
  };
}

const units = unitPlans.map(buildUnit);

module.exports = {
  language: 'english',
  level: 'B1',
  courseTitle: 'English B1',
  courseDescription:
    'Intermediate English (B1): work, community, travel, health, money, digital life, culture, relationships and future goals through a continuous Sarah and Daniel storyline.',
  units
};
