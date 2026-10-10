// Reviewed questions for short recordings with several facts per sentence.
const stories = {
  'english-b1-travel-with-purpose-listening': [
    ['Why do they need to change their plan?', 'the train is delayed', ['the museum is closed', 'Sarah has lost her ticket', 'Daniel is ill']],
    ['Why is Sarah frustrated?', 'she wanted to arrive early', ['she dislikes museums', 'she missed breakfast', 'she forgot her luggage']],
    ['When can they visit the main museum?', 'in the afternoon', ['before sunrise', 'next week', 'at midnight']],
    ['What do they decide to remove from the itinerary?', 'one activity', ['every museum visit', 'their breakfast', 'the entire trip']]
  ],
  'english-b1-sustainable-futures-listening': [
    ['What are Sarah and Daniel planning?', 'a community event', ['a private holiday', 'a university exam', 'a shopping trip']],
    ['What will the food be served on?', 'reusable plates', ['paper bags', 'plastic trays', 'disposable cups']],
    ['Where will the recycling points be placed?', 'near every entrance', ['inside the council office', 'behind the stage only', 'outside the town']],
    ['What will happen to leftover food?', 'leftover food will be donated', ['it will be sold tomorrow', 'it will be thrown away', 'volunteers will cook it again']]
  ],
  'english-b1-learning-and-communication-listening': [
    ['What does Sarah ask about?', 'how the final project will be assessed', ['how to book a holiday', 'where to buy a textbook', 'when the tutor is retiring']],
    ['What kind of questions does she use?', 'indirect questions', ['rhetorical questions', 'multiple-choice questions', 'questions about prices']],
    ['Which three details does she want to clarify?', 'the deadline, the presentation format and the marking criteria', ['the classroom, the weather and the bus route', 'the price, the colour and the size', 'the teacher, the textbook and the library']],
    ['How does the tutor recommend organising the information?', 'in a short checklist', ['in a long essay', 'in a video diary', 'in a travel brochure']]
  ]
};

function shortListeningBank(row, supports) {
  const entries = stories[row.slug];
  if (!entries) return null;
  const transcript = row.content_json?.extra?.mainTranscript || row.content_json?.transcript || '';
  const title = row.content_json?.extra?.storyTitle || row.title;
  return {
    id: `${row.slug}-listening-comprehension`, passingScore: 70,
    questions: entries.map(([prompt, answer, distractors], index) => {
      if (!supports(transcript, answer)) throw new Error(`${row.slug}: reviewed answer no longer matches its recording`);
      const options = [...distractors];
      options.splice(index, 0, answer);
      return {
        id: `q${index + 1}`, type: 'mcq', prompt: `${title}: ${prompt}`,
        options: options.map((text, i) => ({ id: `o${i + 1}`, text })),
        correctOptionId: `o${index + 1}`, evidence: answer,
        explanation: `The audio states: “${answer}”.`
      };
    })
  };
}
module.exports = { shortListeningBank };
