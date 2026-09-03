// Exercise banks for the three assessed English B1 skills. Keeping these
// outside the unit narratives makes the content module readable while still
// giving every unit text-specific reading checks and real grammar practice.

const q = (prompt, options, answer, explanation = '') => ({
  type: 'mcq',
  prompt,
  options,
  answer,
  explanation
});

const reading = {
  'new-challenges': [
    q('Why does this month feel different for Sarah?', ['She is leaving Manchester', 'She is coordinating a charity campaign', 'She has finished every project', 'She is working from home'], 1),
    q('How did Sarah respond when she could not answer a question?', ['She invented an answer', 'She ended the meeting', 'She noted it and promised to check', 'She asked Daniel to answer'], 2),
    q("What did Sarah's manager value in her reaction?", ['Her ability to pretend', 'Her way of keeping the project moving', 'Her decision to cancel lunch', 'Her knowledge of every detail'], 1),
    q('Why was Daniel practising longer answers?', ['He had an English interview', 'He wanted to lead the charity', 'He was moving abroad', 'He had missed a deadline'], 0),
    q('What does “speaking under pressure” mean in the text?', ['Speaking very quietly', 'Speaking in a stressful situation', 'Speaking without preparation at home', 'Speaking about the weather'], 1),
    q('Which idea best summarises the final paragraph?', ['Progress can make a difficult challenge worthwhile', 'Challenges should always be avoided', 'Only managers can solve problems', 'Being tired means a plan has failed'], 0)
  ],
  'work-and-ambition': [
    q('What position was advertised?', ['Hotel manager', 'Assistant project manager', 'Charity director', 'Budget officer'], 1),
    q('Why did managing a budget worry Sarah?', ['She disliked numbers', 'She had never done it before', 'The company had no money', 'Priya refused to help'], 1),
    q('What was Priya’s main advice?', ['Wait until next year', 'Learn the role by doing it', 'Ask Daniel to apply', 'Avoid extra responsibility'], 1),
    q('What news did Daniel receive?', ['He got a promotion', 'He had a second interview', 'He was moving to Liverpool', 'He lost his hotel job'], 1),
    q('What similarity does Sarah notice between herself and Daniel?', ['Both must choose between comfort and growth', 'Both want the same job', 'Both dislike interviews', 'Both have managed budgets'], 0),
    q('Why does Sarah finally decide to apply?', ['The promotion is guaranteed', 'Priya writes the application', 'She would regret not trying', 'The role has no pressure'], 2)
  ],
  'community-life': [
    q('Why had residents come to the community centre?', ['To watch a film', 'To discuss problems in the park', 'To apply for jobs', 'To organise a holiday'], 1),
    q('What caused disagreement at the start?', ['Who should take responsibility', 'The price of coffee', 'The meeting time', 'The location of the library'], 0),
    q('What solution did Sarah propose?', ['Closing the park', 'A resident clean-up plus council repairs', 'Building a new library', 'Hiring private security only'], 1),
    q('How did the café owner offer to help?', ['By repairing lights', 'By printing posters', 'By providing coffee', 'By creating an online form'], 2),
    q('What does “somebody else’s problem” suggest?', ['A problem residents do not feel responsible for', 'A private family problem', 'A problem with no solution', 'A problem outside the neighbourhood'], 0),
    q('How did Sarah’s attitude change?', ['From hopeful to angry', 'From expecting complaints to believing in small actions', 'From active to uninterested', 'From confident to confused'], 1)
  ],
  'travel-with-purpose': [
    q('Why was travelling with Sarah usually relaxing?', ['She paid for everything', 'She planned carefully', 'She spoke to every passenger', 'She never used maps'], 1),
    q('What caused the first change of plan?', ['A lost booking', 'A technical train delay', 'Bad weather', 'A closed hotel'], 1),
    q('What unexpected place did they discover at the station?', ['A bookshop', 'A railway exhibition', 'A city museum', 'A new hotel'], 1),
    q('Why did they walk in the wrong direction?', ['The phone battery died', 'Sarah read the map incorrectly', 'The streets were closed', 'A woman gave bad directions'], 0),
    q('What did the elderly woman provide besides directions?', ['Train tickets', 'A restaurant booking', 'A bookshop recommendation', 'A phone charger'], 2),
    q('What lesson did Sarah learn?', ['An itinerary is unnecessary', 'Flexibility can improve a well-planned trip', 'Museums are never worth visiting', 'Daniel should plan every journey'], 1)
  ],
  'health-and-balance': [
    q('Which behaviour first shows Sarah’s poor work-life balance?', ['Walking by the canal', 'Answering emails during dinner', 'Preparing her clothes early', 'Keeping Sunday free'], 1),
    q('What made Daniel realise the situation was serious?', ['Sarah missed a train', 'Sarah forgot their appointment', 'Sarah changed jobs', 'Sarah stopped studying'], 1),
    q('Why did Daniel suggest a walk?', ['To discuss the problem calmly', 'To avoid going home', 'To prepare for work', 'To check work messages'], 0),
    q('What boundary did Sarah choose?', ['No email after eight', 'No meetings before lunch', 'No work on Fridays', 'No phone during the day'], 0),
    q('What would Daniel do differently?', ['Leave his job', 'Prepare his uniform before dinner', 'Sleep at the hotel', 'Work every Sunday'], 1),
    q('What is the central message?', ['Rest and ambition can support each other', 'Only dramatic changes improve health', 'Productivity requires constant availability', 'Work problems disappear immediately'], 0)
  ],
  'money-and-choices': [
    q('Why was the course attractive to Sarah?', ['It was free', 'It supported her promotion goals', 'Daniel was teaching it', 'It required no study'], 1),
    q('Which costs did Sarah and Daniel consider first?', ['Streaming and takeaways', 'Rent, food, transport and bills', 'Travel and cinema', 'Books and clothes'], 1),
    q('Why did Daniel avoid telling Sarah to abandon the course?', ['He wanted to ignore the budget', 'He wanted them to explore realistic options', 'He planned to pay secretly', 'The course price was incorrect'], 1),
    q('How could cooking at home help?', ['It would save money weekly', 'It would shorten the course', 'It would increase Daniel’s shifts', 'It would reduce rent'], 0),
    q('What made the payment easier to manage?', ['A free certificate', 'A monthly payment option', 'A new credit card', 'A larger apartment'], 1),
    q('How does Sarah’s view of a budget change?', ['It becomes a tool for choosing priorities', 'It becomes a list she can ignore', 'It proves the course is impossible', 'It removes every limit'], 0)
  ],
  'digital-life': [
    q('What interrupted dinner repeatedly?', ['A phone call from Priya', 'Work chat notifications', 'A banking problem', 'A travel alarm'], 1),
    q('Why was Sarah embarrassed?', ['The message was not urgent', 'Her phone was broken', 'Daniel had sent the message', 'She had forgotten her password'], 0),
    q('What surprised Sarah in the screen-time report?', ['She used no social media', 'Her usage was higher than she thought', 'Daniel used her phone', 'The report showed no work messages'], 1),
    q('What did Daniel’s app do?', ['Booked travel', 'Blocked notifications at chosen times', 'Answered work messages', 'Tracked bank spending'], 1),
    q('What balanced opinion do they reach?', ['All technology is harmful', 'Useful devices should not control quiet moments', 'Work apps are always urgent', 'Phones should be used only for banking'], 1),
    q('What was the result of their one-week experiment?', ['They stopped using technology', 'Their evenings became calmer', 'Sarah missed every message', 'They ate dinner later'], 1)
  ],
  'culture-and-media': [
    q('Why was Sarah unsure Daniel would enjoy the film?', ['It had no music', 'He usually preferred more action', 'It was in another language', 'He disliked the cinema'], 1),
    q('What surprised Sarah about Daniel?', ['He left early', 'He started the discussion', 'He disliked every character', 'He knew the director'], 1),
    q('Why did one person defend the slow rhythm?', ['It showed ordinary life honestly', 'It made the film shorter', 'It improved the music', 'It created more action'], 0),
    q('What helped Sarah express an opinion more easily?', ['Repeating another person', 'Including a reason and example', 'Speaking before watching', 'Avoiding disagreement'], 1),
    q('What does “interpretations” mean here?', ['Ticket prices', 'Different ways of understanding the film', 'Cinema schedules', 'Types of music'], 1),
    q('Why does Sarah value cultural events?', ['They make familiar things feel new', 'They always change Daniel’s preferences', 'They are cheaper than travel', 'They avoid difficult discussions'], 0)
  ],
  'relationships-and-decisions': [
    q('What possibility did Daniel’s manager mention?', ['A role in Liverpool', 'A promotion for Sarah', 'A course in Manchester', 'A job in York'], 0),
    q('Why was Sarah’s first reaction difficult?', ['She disliked hotels', 'Manchester was central to her life', 'Daniel had accepted already', 'Liverpool was too expensive'], 1),
    q('What did the couple do instead of deciding immediately?', ['They stopped talking', 'They wrote down questions', 'They called Priya', 'They rejected the opportunity'], 1),
    q('Why might Daniel commute first?', ['To gather more information before moving', 'To avoid starting the job', 'To visit the cinema', 'To save for Sarah’s course'], 0),
    q('What risk did they want to avoid?', ['Making one opportunity feel like the other person’s loss', 'Asking too many questions', 'Waiting six months', 'Discussing Sarah’s work'], 0),
    q('What did they find by the end of the conversation?', ['A final answer', 'A fair decision-making process', 'A new apartment', 'An official job offer'], 1)
  ],
  'looking-ahead': [
    q('Why did the café feel important?', ['It marked an earlier point in their story', 'They planned to buy it', 'Daniel worked there', 'It was beside the hotel'], 0),
    q('What became a turning point for Sarah?', ['Lucy’s visit', 'The charity campaign', 'The film club', 'The train delay'], 1),
    q('What did Sarah learn about confidence?', ['It must come before action', 'It can grow through action', 'It depends on a promotion', 'It cannot be learned'], 1),
    q('Why did Daniel value his manager’s comment?', ['It showed that his effort was visible', 'It promised a Liverpool job', 'It reduced his working hours', 'It replaced his interview'], 0),
    q('Which goal shows Sarah wants balance as well as progress?', ['Lead another campaign', 'Continue studying', 'Protect her free time', 'Visit Liverpool'], 2),
    q('Why does the future feel less frightening?', ['Their past gives evidence that they can adapt', 'Every decision has been made', 'They no longer have goals', 'They plan to avoid change'], 0)
  ],
  'sustainable-futures': [
    q('What surprised Sarah in the council report?', ['The garden was closing', 'Her area produced the most household waste nearby', 'Recycling was already perfect', 'The library used renewable energy'], 1),
    q('Why were useful materials being thrown away?', ['The recycling instructions were confusing', 'Residents had no bins', 'Volunteers collected them', 'The council prohibited repairs'], 0),
    q('What happened at the repair workshop?', ['New products were sold', 'Old objects were repaired instead of replaced', 'The garden was closed', 'Only bicycles were collected'], 1),
    q('What was created behind the library?', ['A hotel', 'A car park', 'A community garden', 'A recycling factory'], 2),
    q('Which detail shows the garden used resources carefully?', ['Rainwater was collected', 'Every plant was imported', 'Lights stayed on all night', 'Vegetables were thrown away'], 0),
    q('What is the main lesson of the text?', ['Only councils can create change', 'Sustainable change needs practical information and shared responsibility', 'Recycling solves every environmental problem', 'Community projects should remain small'], 1)
  ],
  'learning-and-communication': [
    q('What problem did Sarah have with her first notes?', ['They were too short', 'The ideas were not connected', 'She lost her notebook', 'The tutor refused questions'], 1),
    q('What did the tutor recommend doing before writing?', ['Listening for the main idea', 'Translating every word', 'Leaving the classroom', 'Reading the final project'], 0),
    q('How did Sarah make her questions more polite?', ['She spoke faster', 'She used indirect question forms', 'She avoided the tutor', 'She wrote only yes/no questions'], 1),
    q('What communication problem did Daniel notice at the hotel?', ['Guests missed important details', 'Guests spoke too slowly', 'The hotel had no transport information', 'Staff refused to explain check-in'], 0),
    q('How did Daniel check understanding?', ['He repeated the same words more loudly', 'He asked guests to explain the plan in their own words', 'He gave every guest a test', 'He removed the details'], 1),
    q('What conclusion does Sarah reach?', ['More words always mean clearer communication', 'Good communication requires useful information and checking understanding', 'Notes are unnecessary', 'Learning strategies only work for professional courses'], 1)
  ]
};

const grammar = {
  'new-challenges': [
    q('Sarah ___ at the company for three years.', ['worked', 'has worked', 'is working', 'works yesterday'], 1, 'An unfinished period connected to now uses the Present Perfect.'),
    q('She ___ her first planning meeting last Tuesday.', ['has led', 'leads', 'led', 'has lead'], 2, 'A finished time expression uses the Past Simple.'),
    q('Daniel ___ for the hotel position, so he is waiting for news.', ['applied yesterday', 'has applied', 'apply', 'has apply'], 1, 'The application has a present result.'),
    q('We ___ the client yesterday afternoon.', ['have met', 'met', 'have meet', 'meet already'], 1, 'Yesterday requires the Past Simple.'),
    q('___ you ever ___ a team?', ['Did / led', 'Have / led', 'Have / lead', 'Do / leading'], 1, 'Ever + life experience takes the Present Perfect.'),
    q('I ___ the report yet.', ["didn't finish", "haven't finished", "don't finished", "wasn't finish"], 1, 'Yet commonly appears with the Present Perfect.'),
    q('Priya ___ Sarah useful feedback after the meeting.', ['has given last week', 'gave', 'has gave', 'give'], 1, 'The meeting is a finished past event.'),
    q('Choose the correct sentence.', ['I have joined the company in 2023.', 'I joined the company in 2023.', 'I have join the company in 2023.', 'I did joined the company in 2023.'], 1, 'A specific finished year takes the Past Simple.')
  ],
  'work-and-ambition': [
    q('Sarah ___ the client tomorrow at ten; it is in her calendar.', ['will meet', 'is meeting', 'meet', 'met'], 1, 'The Present Continuous expresses a fixed arrangement.'),
    q('She is ___ update her CV tonight.', ['will', 'going to', 'go to', 'going'], 1, 'Going to expresses an intention.'),
    q('The phone is ringing. I ___ answer it.', ['am going', 'will', 'am answering yesterday', 'going to'], 1, 'Will can express a decision made now.'),
    q('I think the interview ___ go well.', ['is going', 'will', 'going to', 'is'], 1, 'Will commonly expresses a prediction.'),
    q('We ___ Priya after work; we arranged it yesterday.', ['are meeting', 'will met', 'going meet', 'meet yesterday'], 0, 'A planned arrangement uses the Present Continuous.'),
    q('Look at those clouds! It ___ rain.', ['will to', 'is going to', 'is raining tomorrow', 'goes to'], 1, 'Visible evidence supports going to.'),
    q('Perhaps Daniel ___ get the job.', ['is going', 'will', 'is get', 'going to'], 1, 'Will works for a less certain prediction.'),
    q('Choose the correct plan.', ['I am going apply.', 'I going to apply.', 'I am going to apply.', 'I will to apply.'], 2, 'Going to requires be + going to + base verb.')
  ],
  'community-life': [
    q('The council ___ repair the broken lights; it is their responsibility.', ['might', 'has to', 'could maybe', 'should to'], 1, 'Have to expresses an external obligation.'),
    q('Residents ___ leave rubbish in the park.', ["mustn't", "don't have", 'should to not', "mightn't to"], 0, 'Must not expresses prohibition.'),
    q('We ___ organise a clean-up on Saturday.', ['could', 'must to', 'have', 'should to'], 0, 'Could offers a possible suggestion.'),
    q('You look tired. You ___ rest.', ['have', 'should', 'might to', 'must not to'], 1, 'Should gives advice.'),
    q('Volunteers ___ bring gloves if they have some.', ['should', 'should to', 'must bringing', 'have bring'], 0, 'Should is followed by the base verb.'),
    q('The event ___ attract more people if we share it online.', ['has to', 'might', 'must to', 'shoulds'], 1, 'Might expresses possibility.'),
    q('Do we ___ register before the event?', ['must to', 'have to', 'should to', 'might to'], 1, 'Have to forms questions with do.'),
    q('Choose the polite suggestion.', ['The council must doing it.', 'The council could improve the lighting.', 'The council should to improve it.', 'The council might improving it.'], 1, 'A modal is followed by the base verb.')
  ],
  'travel-with-purpose': [
    q('They ___ for the train when the announcement came.', ['waited', 'were waiting', 'have waited', 'are waiting'], 1, 'The longer background action uses the Past Continuous.'),
    q('Daniel’s phone ___ while they were following the map.', ['was dying', 'died', 'has died', 'dies'], 1, 'The short completed event uses the Past Simple.'),
    q('While they ___ coffee, they found an exhibition.', ['drank', 'were drinking', 'have drunk', 'drink'], 1, 'While introduces the ongoing background action.'),
    q('What ___ Sarah doing when the train arrived?', ['was', 'did', 'were', 'has'], 0, 'Past Continuous questions use was/were + subject + -ing.'),
    q('They ___ in the wrong direction for twenty minutes.', ['were walk', 'walked', 'was walking', 'have walked'], 1, 'A completed past action takes the Past Simple.'),
    q('I ___ when you called me.', ['drove', 'was driving', 'am driving', 'have driven'], 1, 'The call interrupted an ongoing action.'),
    q('As they were walking, they ___ an elderly woman for help.', ['asked', 'were ask', 'have asked', 'asking'], 0, 'The completed event is in the Past Simple.'),
    q('Choose the correct sentence.', ['We waited when the train was arriving.', 'We were waiting when the train arrived.', 'We were wait when the train arrived.', 'We waiting when the train arrived.'], 1, 'Background: were waiting; interrupting event: arrived.')
  ],
  'health-and-balance': [
    q('Sarah enjoys ___ well at work.', ['to doing', 'doing', 'do', 'to did'], 1, 'Enjoy is followed by a gerund.'),
    q('She decided ___ her email after eight.', ['not checking', 'not to check', 'to not checking', 'not check'], 1, 'Decide is followed by an infinitive.'),
    q('Daniel suggested ___ a walk.', ['to take', 'taking', 'take', 'to taking'], 1, 'Suggest is followed by a gerund.'),
    q('They need ___ more time for rest.', ['making', 'to make', 'make to', 'made'], 1, 'Need is followed by an infinitive here.'),
    q('I avoid ___ work messages during dinner.', ['to answer', 'answering', 'answer', 'answered'], 1, 'Avoid is followed by a gerund.'),
    q('He wants ___ his uniform earlier.', ['preparing', 'to prepare', 'prepare to', 'prepared'], 1, 'Want is followed by an infinitive.'),
    q('Sarah stopped ___ emails late at night.', ['to checking', 'checking', 'check', 'checked'], 1, 'Stop + gerund means end an activity.'),
    q('Choose the correct sentence.', ['We agreed keeping Sunday free.', 'We agreed to keep Sunday free.', 'We agreed keep Sunday free.', 'We agreed to keeping Sunday free.'], 1, 'Agree is followed by to + infinitive.')
  ],
  'money-and-choices': [
    q('If they cook at home, they ___ money.', ['save', 'will save', 'saved', 'would saved'], 1, 'The result clause of a first conditional can use will.'),
    q('If Sarah ___ monthly, the course will be easier to manage.', ['will pay', 'pays', 'paid', 'would pay'], 1, 'The if-clause uses the Present Simple.'),
    q('They will review the budget if expenses ___.', ['will rise', 'rise', 'rose', 'would rise'], 1, 'Use Present Simple after if.'),
    q('If Daniel gets extra shifts, they ___ rebuild their savings faster.', ['can', 'can to', 'will can', 'could to'], 0, 'Can is possible in the result clause.'),
    q('What will you do if the course ___ too expensive?', ['is', 'will be', 'was', 'would be'], 0, 'A real future condition uses Present Simple after if.'),
    q('If we do not plan, we ___ afford both options.', ["won't", "don't will", "wouldn't to", 'not will'], 0, 'Use will not in the result clause.'),
    q('Unless we save, we will not have enough means...', ['If we save', 'If we do not save', 'When we saved', 'Because we save'], 1, 'Unless means if not.'),
    q('Choose the correct sentence.', ['If I will save, I buy it.', 'If I save, I will buy it.', 'If I saved, I will bought it.', 'If I save, I would bought it.'], 1, 'First conditional: if + Present Simple, will + base verb.')
  ],
  'digital-life': [
    q('The app ___ blocks notifications is useful.', ['who', 'where', 'that', 'whose'], 2, 'That can introduce a defining clause about a thing.'),
    q('Sarah is the person ___ checked the report.', ['which', 'who', 'where', 'what'], 1, 'Who refers to people.'),
    q('Dinner is a time ___ they keep phones away.', ['who', 'which person', 'when', 'whose'], 2, 'When refers to a time.'),
    q('The table is the place ___ phones are not allowed.', ['where', 'who', 'whose', 'which person'], 0, 'Where refers to a place.'),
    q('Daniel showed her an app ___ settings can be customised.', ['who', 'whose', 'where person', 'when'], 1, 'Whose shows possession.'),
    q('The messages ___ interrupted dinner were not urgent.', ['who', 'that', 'where', 'whose'], 1, 'That refers to things in a defining clause.'),
    q('The colleague ___ sent the message apologised.', ['which', 'who', 'where', 'when'], 1, 'Who refers to a person.'),
    q('Choose the correct sentence.', ['This is the app who I use.', 'This is the app that I use.', 'This is the app where I use it.', 'This is the app whose I use.'], 1, 'That correctly introduces the defining relative clause.')
  ],
  'culture-and-media': [
    q('The film was ___ than Daniel expected.', ['more emotional', 'emotionaler', 'most emotional', 'more emotionally'], 0, 'Long adjectives form the comparative with more.'),
    q('The middle section was ___ slow for Daniel.', ['slightly too', 'by far more', 'muchest', 'the more'], 0, 'Slightly can modify an adjective; too marks excess.'),
    q('It was one of the ___ discussions Sarah had attended.', ['more interesting', 'most interesting', 'interestinger', 'much interesting'], 1, 'One of the + superlative + plural noun.'),
    q('Action films are usually ___ paced than this drama.', ['fastest', 'faster', 'more fast', 'the faster'], 1, 'Short adjectives take -er.'),
    q('The discussion was ___ more interesting than she expected.', ['much', 'most', 'many', 'very'], 0, 'Much can strengthen a comparative.'),
    q('This was ___ Daniel’s favourite genre.', ['by far', 'not by far', 'more far', 'the far'], 1, 'Not by far emphasises that it was clearly not his favourite.'),
    q('Independent cinemas are often ___ than large chains.', ['more small', 'smaller', 'smallest', 'the smaller'], 1, 'Small forms the comparative with -er.'),
    q('Choose the correct sentence.', ['The ending was much better.', 'The ending was very better.', 'The ending was more good.', 'The ending was the better of all.'], 0, 'Better is the irregular comparative of good and can be modified by much.')
  ],
  'relationships-and-decisions': [
    q('If they moved, Sarah ___ rethink her routines.', ['will have to', 'would have to', 'has to', 'had to yesterday'], 1, 'Second conditional: would + base verb for a hypothetical result.'),
    q('What ___ you do if you received a job offer abroad?', ['will', 'would', 'did', 'have'], 1, 'Use would in a hypothetical result question.'),
    q('If Daniel ___ at first, they could delay the move.', ['commutes', 'commuted', 'will commute', 'would commute'], 1, 'The if-clause uses Past Simple.'),
    q('Sarah would feel better if they ___ more information.', ['have', 'had', 'will have', 'would had'], 1, 'Use Past Simple in the if-clause.'),
    q('If I were Sarah, I ___ wait before deciding.', ['will', 'would', 'am', 'did'], 1, 'If I were... commonly gives hypothetical advice.'),
    q('They ___ Liverpool if the offer became official.', ['might visit', 'might to visit', 'visited will', 'would visited'], 0, 'Might can express a possible hypothetical result.'),
    q('If the job did not offer training, Daniel ___ it.', ["wouldn't take", "won't take", "didn't took", "wouldn't took"], 0, 'Would not + base verb forms the negative result.'),
    q('Choose the correct sentence.', ['If we moved, we would need a plan.', 'If we would move, we needed a plan.', 'If we move, we would needed a plan.', 'If we moved, we will need a plan.'], 0, 'Second conditional: if + Past Simple, would + base verb.')
  ],
  'looking-ahead': [
    q('Priya said that Sarah ___ ready for more leadership.', ['is yesterday', 'was', 'were', 'has'], 1, 'Reported speech commonly backshifts is to was.'),
    q('Daniel said, “I want to improve.” Daniel said that he ___ to improve.', ['wants', 'wanted', 'has want', 'wanting'], 1, 'Present Simple often backshifts to Past Simple.'),
    q('His manager told him that guests ___ his calm communication.', ['appreciated', 'appreciate tomorrow', 'were appreciate', 'has appreciated yesterday'], 0, 'The reported verb is expressed in the past.'),
    q('“I have completed the course,” Sarah said. Sarah said she ___ the course.', ['completed tomorrow', 'had completed', 'has complete', 'was completing always'], 1, 'Present Perfect backshifts to Past Perfect.'),
    q('Daniel told Sarah that he ___ visit Liverpool before deciding.', ['will', 'would', 'is', 'has'], 1, 'Will commonly backshifts to would.'),
    q('Priya ___ Sarah to apply for another leadership role.', ['said', 'told', 'told to', 'said her'], 1, 'Tell is followed by a person; say is not.'),
    q('Sarah said ___ confidence often came through action.', ['that', 'me', 'to me that to', 'if me'], 0, 'That can introduce the reported statement.'),
    q('Choose the correct report: “You are making progress,” he told me.', ['He told that I am making progress.', 'He told me that I was making progress.', 'He said me I was make progress.', 'He told me that you were progress.'], 1, 'Pronouns and tense change in reported speech.')
  ],
  'sustainable-futures': [
    q('Household waste ___ every Friday.', ['collects', 'is collected', 'is collecting', 'collected is'], 1, 'Present passive: am/is/are + past participle.'),
    q('The community garden ___ by volunteers last year.', ['created', 'was created', 'is create', 'was creating by'], 1, 'Past passive: was/were + past participle.'),
    q('Old bicycles ___ instead of being replaced.', ['were repaired', 'repaired', 'was repair', 'are repairing yesterday'], 0, 'The receiver of the action is the subject, so use the passive.'),
    q('Clear labels ___ on every recycling bin now.', ['are placed', 'place', 'were placing', 'is placed'], 0, 'Plural subject labels takes are + past participle.'),
    q('The report ___ by the local council.', ['published', 'was published', 'was publish', 'is publishing yesterday'], 1, 'Use by to name the agent in a passive sentence.'),
    q('Rainwater can ___ in large containers.', ['be collected', 'is collected', 'be collect', 'collected'], 0, 'Modal passive: modal + be + past participle.'),
    q('Which sentence focuses on the result?', ['Volunteers cleaned the area.', 'The area was cleaned by volunteers.', 'Volunteers were cleaning.', 'The area cleaned volunteers.'], 1, 'The passive focuses on the area and the completed result.'),
    q('Choose the correct passive sentence.', ['Plastic is recycled here.', 'Plastic recycles here by people.', 'Plastic is recycle here.', 'Plastic was recycling every day.'], 0, 'Use be plus the past participle recycled.')
  ],
  'learning-and-communication': [
    q('Where ___ the workshop start?', ['does', 'do', 'is', 'has'], 0, 'A direct Present Simple question uses does before the subject.'),
    q('Could you tell me where the workshop ___?', ['does start', 'starts', 'start does', 'is start'], 1, 'Indirect questions use statement word order.'),
    q('Do you know what the deadline ___?', ['is', 'does it', 'is it', 'be'], 0, 'The indirect clause uses subject + verb: the deadline is.'),
    q('Why ___ Sarah change her study strategy?', ['did', 'was', 'does yesterday', 'has to did'], 0, 'A direct Past Simple question uses did + base verb.'),
    q('Could you explain how this stage ___ to the deadline?', ['does connect', 'connects', 'connect', 'is connect'], 1, 'No do/does appears inside an indirect question.'),
    q('I would like to know ___ the project will be assessed.', ['how', 'how will', 'does how', 'that how'], 0, 'Use a question word followed by statement order.'),
    q('Which question is more polite?', ['What does this mean?', 'Could you tell me what this means?', 'Could you tell me what does this mean?', 'Tell what means this.'], 1, 'The indirect form is polite and keeps statement order.'),
    q('Choose the correct indirect question.', ['Do you know where is the room?', 'Do you know where the room is?', 'Do you know where does the room be?', 'Do you know where the room does?'], 1, 'Use where + subject + verb in the indirect clause.')
  ]
};

function grammarTest(slug, exercises) {
  const answerPositions = [0, 0, 1, 1, 2, 2, 3, 3];
  let shuffleState = [...slug].reduce((hash, character) => ((hash * 31 + character.charCodeAt(0)) >>> 0), 7);
  for (let index = answerPositions.length - 1; index > 0; index -= 1) {
    shuffleState = (shuffleState * 1664525 + 1013904223) >>> 0;
    const swapIndex = shuffleState % (index + 1);
    [answerPositions[index], answerPositions[swapIndex]] = [answerPositions[swapIndex], answerPositions[index]];
  }
  return {
    id: `english-b1-${slug}-grammar-test`,
    passingScore: 70,
    questions: exercises.map((exercise, index) => {
      const answer = answerPositions[index] ?? exercise.answer;
      const options = exercise.options.filter((_, optionIndex) => optionIndex !== exercise.answer);
      options.splice(answer, 0, exercise.options[exercise.answer]);
      const correctId = `o${answer + 1}`;
      return {
        id: `q${index + 1}`,
        type: 'mcq',
        prompt: exercise.prompt,
        options: options.map((text, optionIndex) => ({ id: `o${optionIndex + 1}`, text })),
        correctOptionId: correctId,
        explanation: exercise.explanation,
        difficulty: index < 2 ? 'easy' : index < 6 ? 'medium' : 'hard'
      };
    })
  };
}

function vocabularyExercises(items) {
  return items.map((item, index) => {
    const answer = index % 4;
    const distractors = [1, 2, 3].map((offset) => items[(index + offset) % items.length].translation);
    const options = [...distractors];
    options.splice(answer, 0, item.translation);
    return q(`What does “${item.word}” mean in this unit?`, options, answer);
  });
}

module.exports = { reading, grammar, grammarTest, vocabularyExercises };
