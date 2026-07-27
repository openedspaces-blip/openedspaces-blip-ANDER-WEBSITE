const catalogs = [
  require('./content/english-a1-units'),
  require('./content/english-a2-units'),
  require('./content/french-a1-units')
];

const expectedCounts = new Map([
  ['english:A1', 12],
  ['english:A2', 10],
  ['french:A1', 12]
]);

const failures = [];
let lessonCount = 0;

for (const catalog of catalogs) {
  const key = `${catalog.language}:${catalog.level}`;
  const expected = expectedCounts.get(key);
  if (catalog.units.length !== expected) {
    failures.push(`${key}: expected ${expected} units, found ${catalog.units.length}`);
  }

  const slugs = new Set();
  catalog.units.forEach((unit, index) => {
    const listening = unit.activities?.listening;
    const label = `${key} unit ${index + 1}`;
    lessonCount += 1;
    if (!unit.slug || slugs.has(unit.slug)) failures.push(`${label}: missing or duplicate unit slug`);
    slugs.add(unit.slug);
    if (!listening) failures.push(`${label}: missing Listening activity`);
    if (listening?.listeningType !== 'story') failures.push(`${label}: Listening is not story type`);
    if (!listening?.storyTitle) failures.push(`${label}: missing story title`);
    if (!listening?.mainTranscript) failures.push(`${label}: missing mainTranscript`);
    const segments = listening?.transcriptSegments || [];
    if (!segments.length) failures.push(`${label}: missing transcriptSegments`);
    if (segments.map((segment) => segment.text).join(' ') !== listening?.mainTranscript) {
      failures.push(`${label}: transcriptSegments do not reconstruct mainTranscript exactly`);
    }
    for (const segment of listening?.dictation?.segments || []) {
      if (!listening.mainTranscript.includes(segment.text)) {
        failures.push(`${label}: dictation contains text outside the official transcript`);
      }
    }
    for (const question of listening?.listeningComprehension?.questions || []) {
      const correct = question.options?.find((option) => option.id === question.correctOptionId);
      if (!correct || !listening.mainTranscript.includes(correct.text)) {
        failures.push(`${label}: comprehension answer is not supported literally by the transcript`);
      }
    }
    if (listening?.listeningComprehension?.questions?.length !== 4) {
      failures.push(`${label}: comprehension must contain exactly four story questions`);
    }
    if (listening?.phoneticSupport?.fullIpa) failures.push(`${label}: unverified full IPA found`);
  });
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Official Listening validation passed: ${lessonCount} lessons across 34 units.`);
}
