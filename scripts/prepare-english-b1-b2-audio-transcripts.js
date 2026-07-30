#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const b1Transcripts = require('./content/english-b1-audio-transcripts');
const b2Transcripts = require('./content/english-b2-audio-transcripts');
const {
  applyContextualListeningBank
} = require('./content/contextual-listening-comprehension');

const ROOT = path.join(__dirname, '..');
const LESSONS_PATH = path.join(ROOT, 'lib', 'seed-lessons.json');
const EXPORT_PATH = path.join(ROOT, 'docs', 'english-listening-transcripts-b1-b2.md');

const LISTENING_FORMATS = {
  B1: [
    'workplace-roundtable',
    'career-tutorial',
    'community-report',
    'travel-guide',
    'health-podcast',
    'money-coaching',
    'digital-safety-tutorial',
    'entertainment-review',
    'practical-discussion',
    'call-in-show',
    'public-service',
    'workplace-tutorial'
  ],
  B2: [
    'fact-check',
    'news-report',
    'practical-explainer',
    'investigative-report',
    'cultural-commentary',
    'testimony',
    'housing-advice',
    'workplace-report',
    'consumer-guide',
    'education-explainer',
    'editorial',
    'community-news'
  ]
};

const VOICE_STYLES = {
  B1: [
    'friendly-narrative',
    'clear-coach',
    'local-news',
    'calm-instructional',
    'warm-calm',
    'friendly-coach',
    'digital-news',
    'conversational-review',
    'reflective-narrative',
    'warm-radio',
    'calm-explainer',
    'clear-instructional'
  ],
  B2: [
    'investigative-news',
    'environmental-news',
    'calm-explainer',
    'serious-news',
    'reflective-narrative',
    'warm-documentary',
    'calm-news',
    'technology-news',
    'consumer-documentary',
    'education-news',
    'measured-editorial',
    'community-news'
  ]
};

// Keep speaker labels from the editorial transcript. They are part of the
// listening text learners can reveal, rather than formatting to discard.
function normalizeTranscriptText(text) {
  return String(text)
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentenceSegments(text) {
  const parts = String(text)
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.map((textValue, index) => ({
    id: `segment-${String(index + 1).padStart(2, '0')}`,
    order: index + 1,
    text: textValue
  }));
}

function spokenDialogue(text) {
  return String(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([^:]+):\s*(.+)$/s);
      return match ? { speaker: match[1], line: match[2] } : { speaker: 'Narrator', line };
    });
}

function durationSeconds(text, wordsPerMinute) {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(45, Math.round((words / wordsPerMinute) * 60));
}

const lessons = JSON.parse(fs.readFileSync(LESSONS_PATH, 'utf8'));
const selected = lessons
  .filter(
    (row) =>
      row.target_language === 'english' &&
      ['B1', 'B2'].includes(row.level) &&
      row.skill === 'listening'
  )
  .sort((a, b) => a.level.localeCompare(b.level) || a.order_index - b.order_index);

const levelFormatIndex = { B1: 0, B2: 0 };
for (const lesson of selected) {
  const content = lesson.content_json || {};
  const unitSlug = lesson.slug.replace(/^english-(b1|b2)-/, '').replace(/-listening$/, '');
  const authored = lesson.level === 'B2' ? b2Transcripts[unitSlug] : b1Transcripts[unitSlug];
  const transcriptSource = authored?.text || content.extra?.mainTranscript || content.transcript;
  const title = authored?.title || content.extra?.storyTitle || lesson.title.replace(/^Listening Lab:\s*/, '');

  if (!transcriptSource) throw new Error(`${lesson.slug}: missing transcript`);
  if (!authored) throw new Error(`${lesson.slug}: missing authored transcript`);
  const transcript = normalizeTranscriptText(transcriptSource);
  const dialogue = [{ speaker: 'Narrator', line: transcript }];
  const formatIndex = levelFormatIndex[lesson.level]++;

  const extra = { ...(content.extra || {}) };
  extra.storyTitle = title;
  extra.mainTranscript = transcript;
  extra.transcriptSegments = sentenceSegments(transcript);
  extra.listeningType = 'monologue';
  extra.listeningFormat =
    authored.format ||
    LISTENING_FORMATS[lesson.level]?.[formatIndex] ||
    'podcast';
  extra.voiceStyle = authored.voiceStyle || VOICE_STYLES[lesson.level]?.[formatIndex] || 'neutral';
  extra.speakers = [...new Set(dialogue.map((line) => line.speaker))];
  extra.durationSeconds = durationSeconds(transcript, lesson.level === 'B1' ? 135 : 125);
  extra.audioLocale = 'en-US';

  content.transcript = transcript;
  content.dialogue = dialogue;
  content.extra = extra;
  lesson.content_json = content;
  applyContextualListeningBank(lesson);
}

const exportSections = ['# English Listening Audio Transcripts — B1 & B2', ''];
for (const lesson of selected) {
  const extra = lesson.content_json.extra;
  exportSections.push(
    `## ${lesson.level} · ${extra.storyTitle}`,
    '',
    extra.mainTranscript,
    ''
  );
}

fs.writeFileSync(LESSONS_PATH, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
fs.mkdirSync(path.dirname(EXPORT_PATH), { recursive: true });
fs.writeFileSync(EXPORT_PATH, `${exportSections.join('\n').trim()}\n`, 'utf8');

console.log(`Prepared ${selected.length} English Listening transcripts.`);
console.log(`Audio-production document: ${path.relative(ROOT, EXPORT_PATH)}`);
