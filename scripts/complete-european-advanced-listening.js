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
    transcript: (title, a, b, c) => `Neste episódio sobre ${title}, Marina e Caio visitam ${brazilSetting(title)}. Eles foram convidados a ouvir uma questão que afeta muitas pessoas no dia a dia. Marina conta que, no início, alguns participantes queriam resolver tudo depressa. No entanto, uma conversa com os moradores mostrou que havia necessidades diferentes e que seria preciso organizar melhor as prioridades. Ela explica que, antes de agir, é importante observar as pessoas envolvidas, os recursos disponíveis e as consequências de cada escolha.\n\nCaio concorda e acrescenta que uma boa proposta precisa de informações claras, exemplos que todos possam verificar e espaço para perguntas. Durante a conversa, eles usam ideias como «${a}», «${b}» e «${c}» para relacionar o tema com situações reais no Brasil. Marina lembra que duas soluções podem parecer boas, mas produzir resultados muito diferentes para quem depende delas. Uma moradora diz que participar da decisão é importante, porque quem vive o problema conhece detalhes que não aparecem em um relatório.\n\nNo final, os dois chegam a uma conclusão prática: explicar os motivos das escolhas, ouvir opiniões diferentes e acompanhar o resultado depois da decisão. Se algo não funcionar como esperado, não é preciso abandonar todo o plano; é possível rever uma parte, aprender com a experiência e tentar novamente de forma mais justa. A história mostra que uma mudança local pode fortalecer vínculos e inspirar outras comunidades.`,
    prompts: ['Qual é a ideia principal do episódio?', 'Por que o grupo evita conclusões apressadas?', 'Qual critério as pessoas compartilham?', 'Que elemento pode mudar a perspectiva?']
  },
  german: {
    title: 'Hörverstehen',
    transcript: (title, a, b, c) => `In dieser Sendung über ${title} vergleichen zwei Personen ihre Standpunkte. Die erste betont, dass ${a} nicht isoliert betrachtet werden kann: Jede Entscheidung hat konkrete Folgen und verlangt Aufmerksamkeit für den Kontext. Die andere ergänzt, dass ${b} nur dann hilfreich ist, wenn es mit überprüfbaren Beispielen erklärt wird.\n\nIm Gespräch zeigt sich eine mögliche Schwierigkeit: ${c} kann die Perspektive der Zuhörenden verändern. Deshalb vermeidet die Gruppe vorschnelle Schlüsse, prüft die Grenzen der Vorschläge und entwickelt eine umsetzbare Lösung. Am Ende einigen sich die Beteiligten auf ein Kriterium: Entscheidungen klar zu begründen und für eine Überprüfung offen zu bleiben.`,
    prompts: ['Was ist die Hauptidee der Sendung?', 'Warum vermeidet die Gruppe vorschnelle Schlüsse?', 'Auf welches Kriterium einigen sich die Beteiligten?', 'Welches Element kann die Perspektive verändern?']
  }
};

function segments(text) { return text.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean).map((value, index) => ({ id: `segment-${String(index + 1).padStart(2, '0')}`, order: index + 1, text: value })); }
const PORTUGUESE_TERM_FIXES = {
  scadenza: 'prazo', incarico: 'tarefa', risorsa: 'recurso',
  percorso: 'trajeto', traffico: 'trânsito', abbonamento: 'assinatura',
  colloquio: 'entrevista', esperienza: 'experiência', candidatura: 'candidatura',
  impatto: 'impacto', raccolta: 'coleta', spreco: 'desperdício',
  notizia: 'notícia', verificare: 'verificar', benessere: 'bem-estar',
  prevenzione: 'prevenção', riposo: 'descanso', tradizione: 'tradição',
  appartenenza: 'pertencimento', prospettiva: 'perspectiva', dispositivo: 'dispositivo',
  dati: 'dados', proteggere: 'proteger', itinerario: 'roteiro',
  alloggio: 'hospedagem', imprevisto: 'imprevisto', equivoco: 'mal-entendido',
  ascoltare: 'escuta', chiarire: 'esclarecer', iniziativa: 'iniciativa',
  quartiere: 'bairro', partecipare: 'participar', traguardo: 'meta',
  ostacolo: 'obstáculo'
};
const BRAZIL_SOCIAL_SETTINGS = {
  'Projetos e responsabilidades': 'uma associação de moradores de Belo Horizonte',
  'Cidade e mobilidade': 'um grupo de usuários de ônibus em São Paulo',
  'Trabalho e competências': 'uma cooperativa de costureiras em Recife',
  'Ambiente e consumo': 'uma comunidade que recupera uma praça em Curitiba',
  'Mídia e informação': 'uma rádio comunitária em Salvador',
  'Saúde e bem-estar': 'uma unidade de saúde de bairro em Fortaleza',
  'Cultura e identidade': 'um centro cultural de periferia no Rio de Janeiro',
  'Tecnologia e privacidade': 'uma oficina de inclusão digital em Brasília',
  'Viagens conscientes': 'uma iniciativa de turismo comunitário na Bahia',
  'Relações e mediação': 'uma escola pública em Porto Alegre',
  'Cidadania ativa': 'um conselho jovem de bairro em Manaus',
  'Balanços e perspectivas': 'uma rede de voluntários em Belém'
};
const PORTUGUESE_AUDIO_STORY_TITLES = {
  'portuguese-b2-b2-projetos-e-responsabilidades-listening': 'Orçamento participativo no bairro',
  'portuguese-b2-b2-cidade-e-mobilidade-listening': 'O caminho até a escola',
  'portuguese-b2-b2-trabalho-e-competencias-listening': 'Uma cooperativa de costureiras',
  'portuguese-b2-b2-ambiente-e-consumo-listening': 'A praça que voltou a ser usada',
  'portuguese-b2-b2-midia-e-informacao-listening': 'Notícias na rádio comunitária',
  'portuguese-b2-b2-saude-e-bem-estar-listening': 'A campanha de saúde do posto',
  'portuguese-b2-b2-cultura-e-identidade-listening': 'Memórias de um centro cultural',
  'portuguese-b2-b2-tecnologia-e-privacidade-listening': 'Celulares, dados e segurança',
  'portuguese-b2-b2-viagens-conscientes-listening': 'Turismo feito com a comunidade',
  'portuguese-b2-b2-relacoes-e-mediacao-listening': 'Um conflito resolvido na escola',
  'portuguese-b2-b2-cidadania-ativa-listening': 'Jovens cuidam do próprio bairro',
  'portuguese-b2-b2-balancos-e-perspectivas-listening': 'O que mudou depois do mutirão'
};
function brazilSetting(title) {
  return BRAZIL_SOCIAL_SETTINGS[title] || 'uma comunidade brasileira';
}
function wordsFor(unit, language) {
  const words = unit.unit_overview?.vocabulary || [];
  const localized = language === 'portuguese'
    ? words.map((word) => PORTUGUESE_TERM_FIXES[String(word || '').toLowerCase()] || word)
    : words;
  return [localized[0] || unit.title, localized[1] || (language === 'portuguese' ? 'proposta' : 'la proposta'), localized[2] || (language === 'portuguese' ? 'contexto' : 'il contesto')];
}
function portugueseB1Transcript(title, a, b, c) {
  return `Hoje, em uma conversa sobre ${title}, três colegas contam uma história que aconteceu em ${brazilSetting(title)}. A ideia surgiu depois de perceberem que muitas pessoas tinham a mesma dúvida, mas não sabiam a quem pedir ajuda. Primeiro, eles conversaram com vizinhos, trabalhadores e estudantes, anotaram sugestões e tentaram entender quais eram as necessidades mais urgentes. A conversa não foi sempre fácil: cada pessoa tinha uma experiência diferente e, em alguns momentos, parecia impossível chegar a um acordo.\n\nUma das participantes explicou que as palavras «${a}», «${b}» e «${c}» ajudaram o grupo a organizar as ideias. Em vez de procurar uma resposta rápida, eles decidiram dividir as tarefas e marcar um novo encontro para a semana seguinte. Também combinaram de explicar as decisões com linguagem simples, para que mais pessoas pudessem participar. Uma senhora que mora no bairro há muitos anos disse que se sentiu respeitada por poder contar o que observa todos os dias.\n\nNo encontro seguinte, o grupo percebeu que ouvir com atenção tinha sido tão importante quanto apresentar uma proposta. Algumas sugestões precisaram mudar, mas o resultado ficou mais claro e mais útil para todos. Ao terminar, os colegas concluíram que pequenos passos, quando são bem planejados e compartilhados, podem melhorar uma situação cotidiana e aproximar pessoas de diferentes idades.`;
}

for (const language of languages) for (const level of levels) {
  const courseUnits = units.filter((unit) => unit.target_language === language && unit.level === level).sort((a, b) => a.order_index - b.order_index);
  if (courseUnits.length !== 12) throw new Error(`${language}/${level}: 12 units are required before authoring Listening.`);
  for (const unit of courseUnits) {
    const [a, b, c] = wordsFor(unit, language);
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
    const row = { slug, target_language: language, level, skill: 'listening', unit_slug: unit.slug, title: `${unit.title} · ${ui.title}`, description: unit.description, order_index: unit.order_index * 10 + 1, estimated_minutes: 15, is_free: unit.order_index === 1, access_tier: unit.order_index === 1 ? 'free' : 'premium', payment_price_usd: 7, content_json: { language: language === 'italian' ? 'Italiano' : language === 'portuguese' ? 'Português (Brasil)' : 'Deutsch', language_key: language, level_title: `${language === 'german' ? 'Deutsch' : language === 'portuguese' ? 'Português (Brasil)' : 'Italiano'} ${level}`, intro: unit.description, mission: unit.description, transcript, transcriptSegments: segments(transcript), dictationSegments: segments(transcript).slice(0, 2).map((segment) => segment.text), listeningType: 'story', exercises, xp_reward: level === 'B2' ? 30 : level === 'C1' ? 35 : 40, extra: { mainTranscript: transcript, transcriptSegments: segments(transcript), listeningType: 'story', listeningComprehension: bank, audioProduction: { status: 'script-ready', language, level, unit: unit.order_index, voice: 'native narrator', normalSpeed: true, slowSpeed: true } } } };
    const existing = lessons.findIndex((lesson) => lesson.slug === slug);
    if (existing >= 0) lessons[existing] = row; else lessons.push(row);
  }
}

for (const row of lessons.filter((lesson) => lesson.target_language === 'portuguese' && lesson.level === 'B1' && lesson.skill === 'listening' && lesson.unit_slug)) {
  const vocabulary = row.content_json?.phrases || [];
  const transcript = portugueseB1Transcript(row.title.replace(/: palavras$/, ''), vocabulary[0] || 'ideia', vocabulary[1] || 'proposta', vocabulary[2] || 'comunidade');
  row.content_json.transcript = transcript;
  row.content_json.extra = {
    ...(row.content_json.extra || {}),
    mainTranscript: transcript,
    transcriptSegments: segments(transcript),
    audioProduction: { status: 'script-ready', language: 'portuguese', level: 'B1', voice: 'native narrator', normalSpeed: true, slowSpeed: true }
  };
}

const manifest = lessons
  .filter((lesson) => (
    lesson.skill === 'listening' &&
    lesson.unit_slug &&
    (languages.includes(lesson.target_language) && levels.includes(lesson.level) ||
      lesson.target_language === 'portuguese' && lesson.level === 'B1')
  ))
  .sort((a, b) => a.target_language.localeCompare(b.target_language) || a.level.localeCompare(b.level) || a.order_index - b.order_index)
  .map((lesson) => `## ${lesson.target_language} ${lesson.level} · ${lesson.title}\n\n- Slug: \`${lesson.slug}\`\n- Voz: narrador/a nativo/a\n- Estado: guion listo; MP3 pendiente de producción\n- Texto exacto:\n\n${lesson.content_json.transcript}\n`).join('\n');
const portugueseB1B2Manifest = lessons
  .filter((lesson) => lesson.target_language === 'portuguese' && ['B1', 'B2'].includes(lesson.level) && lesson.skill === 'listening' && lesson.unit_slug)
  .sort((a, b) => a.level.localeCompare(b.level) || a.order_index - b.order_index)
  .map((lesson) => {
    const title = PORTUGUESE_AUDIO_STORY_TITLES[lesson.slug] || lesson.title.replace(/: palavras$/, '');
    return `## ${lesson.level} · ${title}\n\n${lesson.content_json.transcript}\n`;
  }).join('\n');
fs.writeFileSync(lessonsPath, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(ROOT, 'docs', 'european-listening-audio-production.md'), `# Producción de audio · Portugués B1–C2 · Italiano y Alemán B2–C2\n\n${manifest}`, 'utf8');
fs.writeFileSync(path.join(ROOT, 'docs', 'portuguese-b1-b2-listening-audio-scripts.md'), `# Português B1 e B2 · Roteiros de listening para áudio\n\nTextos em português do Brasil, prontos para locução ou TTS.\n\n${portugueseB1B2Manifest}`, 'utf8');
console.log('Prepared 108 European B2-C2 Listening scripts and audio-production manifest.');
