#!/usr/bin/env node
// Authors B2-C2 Listening scripts for Italian, Portuguese and German. This
// deliberately does not call a TTS provider or upload audio; it produces the
// exact approved script and a production manifest for the audio pass.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const lessonsPath = path.join(ROOT, 'lib', 'seed-lessons.json');
const unitsPath = path.join(ROOT, 'lib', 'seed-units.json');
const lessons = require(lessonsPath);
const units = require(unitsPath);
const languages = ['italian', 'portuguese', 'german'];
const levels = ['B2', 'C1', 'C2'];

const copy = {
  italian: {
    title: 'Ascolto',
    transcript: (title, a, b, c) => `In questa puntata dedicata a ${title}, due partecipanti mettono a confronto le loro posizioni. La prima osserva che ${a} non può essere considerato isolatamente: ogni decisione produce conseguenze concrete e richiede attenzione al contesto. L’altro aggiunge che ${b} è utile solo se viene spiegato con esempi verificabili.\n\nNel confronto emerge una possibile difficoltà: ${c} può cambiare la prospettiva di chi ascolta. Per questo il gruppo evita conclusioni affrettate, valuta i limiti delle proposte e formula una soluzione realizzabile. Alla fine, i partecipanti concordano su un criterio: motivare le scelte con chiarezza e restare aperti a una revisione.`,
    prompts: ['Qual è l’idea principale della puntata?', 'Perché il gruppo evita conclusioni affrettate?', 'Quale criterio condividono i partecipanti?', 'Quale elemento può cambiare la prospettiva?']
  },
  portuguese: {
    title: 'Compreensão oral',
    transcript: (title, a, b, c) => `Neste episódio sobre ${title}, duas pessoas comparam suas posições. A primeira observa que ${a} não pode ser considerado de forma isolada: cada decisão produz consequências concretas e exige atenção ao contexto. A outra acrescenta que ${b} só é útil quando é explicado com exemplos verificáveis.\n\nNa conversa surge uma dificuldade possível: ${c} pode mudar a perspectiva de quem escuta. Por isso, o grupo evita conclusões apressadas, avalia os limites das propostas e formula uma solução viável. Ao final, as pessoas concordam em um critério: justificar as escolhas com clareza e permanecer abertas a uma revisão.`,
    prompts: ['Qual é a ideia principal do episódio?', 'Por que o grupo evita conclusões apressadas?', 'Qual critério as pessoas compartilham?', 'Que elemento pode mudar a perspectiva?']
  },
  german: {
    title: 'Hörverstehen',
    transcript: (title, a, b, c) => `In dieser Sendung über ${title} vergleichen zwei Personen ihre Standpunkte. Die erste betont, dass ${a} nicht isoliert betrachtet werden kann: Jede Entscheidung hat konkrete Folgen und verlangt Aufmerksamkeit für den Kontext. Die andere ergänzt, dass ${b} nur dann hilfreich ist, wenn es mit überprüfbaren Beispielen erklärt wird.\n\nIm Gespräch zeigt sich eine mögliche Schwierigkeit: ${c} kann die Perspektive der Zuhörenden verändern. Deshalb vermeidet die Gruppe vorschnelle Schlüsse, prüft die Grenzen der Vorschläge und entwickelt eine umsetzbare Lösung. Am Ende einigen sich die Beteiligten auf ein Kriterium: Entscheidungen klar zu begründen und für eine Überprüfung offen zu bleiben.`,
    prompts: ['Was ist die Hauptidee der Sendung?', 'Warum vermeidet die Gruppe vorschnelle Schlüsse?', 'Auf welches Kriterium einigen sich die Beteiligten?', 'Welches Element kann die Perspektive verändern?']
  }
};

function segments(text) { return text.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean).map((value, index) => ({ id: `segment-${String(index + 1).padStart(2, '0')}`, order: index + 1, text: value })); }
function wordsFor(unit) { const words = unit.unit_overview?.vocabulary || []; return [words[0] || unit.title, words[1] || 'la proposta', words[2] || 'il contesto']; }

for (const language of languages) for (const level of levels) {
  const courseUnits = units.filter((unit) => unit.target_language === language && unit.level === level).sort((a, b) => a.order_index - b.order_index);
  if (courseUnits.length !== 12) throw new Error(`${language}/${level}: 12 units are required before authoring Listening.`);
  for (const unit of courseUnits) {
    const [a, b, c] = wordsFor(unit);
    const ui = copy[language];
    const transcript = ui.transcript(unit.title, a, b, c);
    const optionSets = [
      [unit.title, a, b, c],
      ['Per valutare limiti e conseguenze', 'Per ignorare il contesto', 'Per scegliere la prima proposta', 'Per ripetere le stesse parole'],
      ['Giustificare le scelte con chiarezza', 'Evitare ogni revisione', 'Non ascoltare posizioni diverse', 'Ridurre il tema a un dettaglio'],
      [c, a, b, unit.title]
    ];
    const exercises = ui.prompts.map((prompt, index) => ({ type: 'mcq', prompt, options: optionSets[index], answer: 0 }));
    const bank = { id: `${language}-${level.toLowerCase()}-${unit.slug}-listening-listening-comprehension`, passingScore: 70, questions: exercises.map((exercise, index) => ({ id: `q${index + 1}`, type: 'mcq', prompt: exercise.prompt, options: exercise.options.map((text, optionIndex) => ({ id: `o${optionIndex + 1}`, text })), correctOptionId: 'o1', explanation: exercise.options[0] })) };
    const slug = `${language}-${level.toLowerCase()}-${unit.slug}-listening`;
    const row = { slug, target_language: language, level, skill: 'listening', unit_slug: unit.slug, title: `${unit.title} · ${ui.title}`, description: unit.description, order_index: unit.order_index * 10 + 1, estimated_minutes: 15, is_free: unit.order_index === 1, access_tier: unit.order_index === 1 ? 'free' : 'premium', payment_price_usd: 4.99, content_json: { language: language === 'italian' ? 'Italiano' : language === 'portuguese' ? 'Português (Brasil)' : 'Deutsch', language_key: language, level_title: `${language === 'german' ? 'Deutsch' : language === 'portuguese' ? 'Português (Brasil)' : 'Italiano'} ${level}`, intro: unit.description, mission: unit.description, transcript, transcriptSegments: segments(transcript), dictationSegments: segments(transcript).slice(0, 2).map((segment) => segment.text), listeningType: 'story', exercises, xp_reward: level === 'B2' ? 30 : level === 'C1' ? 35 : 40, extra: { mainTranscript: transcript, transcriptSegments: segments(transcript), listeningType: 'story', listeningComprehension: bank, audioProduction: { status: 'script-ready', language, level, unit: unit.order_index, voice: 'native narrator', normalSpeed: true, slowSpeed: true } } } };
    const existing = lessons.findIndex((lesson) => lesson.slug === slug);
    if (existing >= 0) lessons[existing] = row; else lessons.push(row);
  }
}

const manifest = lessons.filter((lesson) => languages.includes(lesson.target_language) && levels.includes(lesson.level) && lesson.skill === 'listening' && lesson.unit_slug).map((lesson) => `## ${lesson.target_language} ${lesson.level} · ${lesson.title}\n\n- Slug: \`${lesson.slug}\`\n- Voz: narrador/a nativo/a\n- Estado: guion listo; MP3 pendiente de producción\n- Texto exacto:\n\n${lesson.content_json.transcript}\n`).join('\n');
fs.writeFileSync(lessonsPath, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(ROOT, 'docs', 'european-listening-audio-production.md'), `# Producción de audio · Italiano, Portugués y Alemán B2–C2\n\n${manifest}`, 'utf8');
console.log('Prepared 108 European B2-C2 Listening scripts and audio-production manifest.');
