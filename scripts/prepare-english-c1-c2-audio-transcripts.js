#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const c1Transcripts = require('./content/english-c1-audio-transcripts');
const c2Transcripts = require('./content/english-c2-audio-transcripts');

const ROOT = path.join(__dirname, '..');
const LESSONS_PATH = path.join(ROOT, 'lib', 'seed-lessons.json');
const EXPORT_PATH = path.join(ROOT, 'docs', 'english-listening-transcripts-c1-c2.md');

const FORMATS = {
  C1: ['documentary', 'technology-news', 'feature-article', 'public-health-report', 'calm-podcast', 'conference-talk', 'documentary', 'fact-check-editorial', 'narrative-report', 'science-conference', 'science-news', 'global-affairs-article'],
  C2: ['academic-podcast', 'conference-lecture', 'science-narrative', 'audio-article', 'expert-explainer', 'academic-podcast', 'teaching-masterclass', 'speech-science-conference', 'calm-lecture', 'research-editorial', 'audio-essay', 'technology-editorial']
};

function sentenceSegments(text) {
  return String(text).replace(/\s+/g, ' ').trim()
    .split(/(?<=[.!?])\s+(?=[A-Z])/).map((part) => part.trim()).filter(Boolean)
    .map((textValue, index) => ({
      id: `segment-${String(index + 1).padStart(2, '0')}`,
      order: index + 1,
      text: textValue
    }));
}

function durationSeconds(text, wordsPerMinute) {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(60, Math.round((words / wordsPerMinute) * 60));
}

const lessons = JSON.parse(fs.readFileSync(LESSONS_PATH, 'utf8'));
const selected = lessons
  .filter((row) => row.target_language === 'english' && ['C1', 'C2'].includes(row.level) && row.skill === 'listening')
  .sort((a, b) => a.level.localeCompare(b.level) || a.order_index - b.order_index);

const levelIndex = { C1: 0, C2: 0 };
for (const lesson of selected) {
  const content = lesson.content_json || {};
  const unitSlug = lesson.slug.replace(/^english-(c1|c2)-/, '').replace(/-listening$/, '');
  const authored = lesson.level === 'C2' ? c2Transcripts[unitSlug] : c1Transcripts[unitSlug];
  if (!authored?.text) throw new Error(`${lesson.slug}: missing authored transcript`);

  const transcript = String(authored.text).replace(/\s+/g, ' ').trim();
  const currentIndex = levelIndex[lesson.level]++;
  const extra = { ...(content.extra || {}) };
  extra.storyTitle = authored.title;
  extra.mainTranscript = transcript;
  extra.transcriptSegments = sentenceSegments(transcript);
  extra.listeningType = 'monologue';
  extra.listeningFormat = authored.format || FORMATS[lesson.level][currentIndex];
  extra.voiceStyle = authored.voiceStyle || 'neutral-academic';
  extra.speakers = ['Narrator'];
  extra.durationSeconds = durationSeconds(transcript, lesson.level === 'C1' ? 125 : 115);
  extra.audioLocale = 'en-US';

  content.transcript = transcript;
  content.dialogue = [{ speaker: 'Narrator', line: transcript }];
  content.extra = extra;
  lesson.content_json = content;
}

const sections = ['# English Listening Audio Transcripts — C1 & C2', ''];
for (const lesson of selected) {
  sections.push(`## ${lesson.level} · ${lesson.content_json.extra.storyTitle}`, '', lesson.content_json.extra.mainTranscript, '');
}

fs.writeFileSync(LESSONS_PATH, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
fs.mkdirSync(path.dirname(EXPORT_PATH), { recursive: true });
fs.writeFileSync(EXPORT_PATH, `${sections.join('\n').trim()}\n`, 'utf8');
console.log(`Prepared ${selected.length} English C1-C2 Listening transcripts.`);
console.log(`Audio-production document: ${path.relative(ROOT, EXPORT_PATH)}`);
