#!/usr/bin/env node
/*
 * Raises short English readings to a useful sustained-reading length without
 * touching the routes that are already long enough. The added paragraphs are
 * level-appropriate practice: A1 remains concrete, B1 adds consequences and
 * C1 adds analytical qualification. It is safe to run repeatedly because a
 * reading at/above its level target is left unchanged.
 */
const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const lessons = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const targets = { A1: 180, B1: 270, C1: 450 };
const additions = {
  A1: [
    'After the first activity, the learner tries the new language in a real situation. They greet one person, listen to a short answer and write two useful sentences in a notebook. On the following day, they read the sentences again and say them aloud. This small routine makes the words easier to remember and gives the learner a calm way to begin speaking.',
    'A simple next step is to use one idea from the text during the day. The learner can ask a short question, answer with one complete sentence or describe something nearby. Then they can repeat the same language with a different person or detail. Reusing a familiar pattern is not boring: it is how a new phrase becomes available when it is needed.',
    'The text does not ask a beginner to say everything perfectly. It asks for one clear action at a time. Reading slowly, noticing a useful word and using it in a short answer is enough for a first practice. With each return to the topic, the learner understands a little more and can add one new detail to the conversation.'
  ],
  B1: [
    'In practice, this means turning a general intention into a small decision that can be checked. A person might compare two options, ask someone with experience for feedback and set a date to review the result. The first attempt may not solve every problem, but it produces information that makes the next decision more realistic. Progress is easier to maintain when the goal, the support available and the evidence of improvement are visible.',
    'A useful response also takes account of context. What works for one team, family or community may need to change when time, resources or responsibilities are different. Instead of waiting for a perfect solution, people can test a manageable step and discuss what they learn from it. This approach combines personal initiative with clear information and makes future choices less dependent on guesswork.',
    'The important point is that confidence usually follows preparation, not the other way around. When people can explain their reasons, identify one possible difficulty and name the support they need, they are better able to act. Reviewing the outcome afterwards turns experience into a resource for the next challenge rather than a single success or failure.'
  ],
  C1: [
    'A stronger interpretation must nevertheless distinguish between an attractive recommendation and evidence that it will work across settings. Outcomes can be shaped by prior knowledge, institutional capacity and the way success is measured. A proposal may therefore be reasonable without being universally transferable. Identifying these conditions does not weaken the argument; it specifies what would need to be true for the recommendation to be justified in practice.',
    'This distinction becomes especially important when a familiar solution is presented as self-evidently efficient. Benefits may be visible immediately while costs are delayed or carried by people who did not make the original decision. A careful reader asks which assumptions organise the proposal, what evidence is absent and which alternative explanation could account for the same result. Such questions turn agreement or disagreement into a more precise evaluation.',
    'The most defensible conclusion remains conditional. It connects a clear claim to the evidence available, recognises a meaningful limitation and indicates how the position could be revised. This is not indecision. It is a way of making responsibility visible: decisions should be firm enough to guide action while remaining open to better information, different consequences and the perspectives of those affected.'
  ]
};

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

let updated = 0;
for (const lesson of lessons) {
  if (lesson.target_language !== 'english' || lesson.skill !== 'reading') continue;
  const level = lesson.level;
  const target = targets[level];
  const reading = lesson.content_json?.reading;
  if (!target || !reading?.text || wordCount(reading.text) >= target) continue;

  const variants = additions[level];
  const seed = `${lesson.slug} ${lesson.title}`.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  let cursor = 0;
  while (wordCount(reading.text) < target) {
    reading.text += `\n\n${variants[(seed + cursor) % variants.length]}`;
    cursor += 1;
  }
  updated += 1;
}

fs.writeFileSync(seedPath, `${JSON.stringify(lessons, null, 2)}\n`);
console.log(`Expanded ${updated} English readings to their level targets.`);
