// lib/server.js
// Express app used both for local development (`npm run dev` / `npm start`),
// the test suite (server.test.js imports `createServer`), and production -
// api/index.js is the only Vercel serverless function and delegates
// every request straight into this same app (routed there via the /api/:match*
// rewrite in vercel.json - see that file for why a plain filename is used
// instead of a [...catchall].js dynamic route).
const express = require('express');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const compression = require('compression');

const config = require('./config');
const authService = require('./authService');
const profilesService = require('./profilesService');
const mfaService = require('./mfaService');
const lessonsService = require('./lessonsService');
const courseLessonsService = require('./courseLessonsService');
const verbProgressService = require('./verbProgressService');
const preferencesService = require('./preferencesService');
const goalsService = require('./goalsService');
const dashboardService = require('./dashboardService');
const {
  getTutorReplyStream,
  getSpeakingCorrection,
  getTextCorrection,
  getPhoneticTranscription,
  tutorConfigError,
  isAnyProviderConfigured
} = require('./aiTutorService');
const listeningService = require('./listeningService');
const speakingService = require('./speakingService');
const usageLimitService = require('./usageLimitService');
const { getUserEntitlements } = require('./entitlementsService');
const translatorService = require('./translatorService');
const translatorLanguages = require('../src/js/translator-languages.js');
const { levelContent, languageContent } = require('./uiContent');
const plansConfig = require('./plansConfig');
const planService = require('./planService');
const subscriptionService = require('./subscriptionService');
const billingService = require('./billingService');
const paypalBillingService = require('./paypalBillingService');
const azulBillingService = require('./azulBillingService');
const { publicBusinessInfo } = require('./businessConfig');
const savedVocabularyService = require('./savedVocabularyService');
const curriculumService = require('./curriculumService');
const musicService = require('./musicService');
const seedLessons = require('./seed-lessons.json');
const seedUnits = require('./seed-units.json');

const englishVerbContext = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'verbs', 'english-verbs-data.js'), 'utf8'),
  englishVerbContext
);
const englishTestVerbs = englishVerbContext.window.ANDERGO_VERBS_DATA?.english || [];
const romanceVerbContext = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'verbs', 'romance-verbs-data.js'), 'utf8'),
  romanceVerbContext
);
const frenchTestVerbs = (romanceVerbContext.window.ANDERGO_VERBS_DATA?.french || []).slice(0, 100);
const spanishTestVerbs = (romanceVerbContext.window.ANDERGO_VERBS_DATA?.spanish || []).slice(0, 100);
const europeanVerbContext = { window: { ANDERGO_VERBS_DATA: {} } };
for (const file of ['essential-european-verbs.js', 'european-verb-catalogues.js']) {
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'verbs', file), 'utf8'),
    europeanVerbContext
  );
}
const italianTestVerbs = europeanVerbContext.window.ANDERGO_VERBS_DATA.italian || [];
const portugueseTestVerbs = europeanVerbContext.window.ANDERGO_VERBS_DATA.portuguese || [];
const germanTestVerbs = europeanVerbContext.window.ANDERGO_VERBS_DATA.german || [];

function makeStandaloneGrammarPrompt(prompt, grammarName, language) {
  let result = String(prompt || '').trim();
  if (language === 'french') {
    result = result
      .replace(/^Dans le contexte grammatical \d+ de \u00ab[^\u00bb]+\u00bb,\s*/i, '')
      .replace(/^Pourquoi l[\u2019']exemple (\d+) convient-il \u00e0 cette unit\u00e9 \?$/i, (_match, number) =>
        `Quelle explication montre le mieux pourquoi l\u2019exemple ${number} emploie correctement \u00ab ${grammarName} \u00bb ?`
      );
  } else if (language === 'spanish') {
    result = result.replace(/^En el contexto gramatical \d+ de [\u00ab\u201c"][^\u00bb\u201d"]+[\u00bb\u201d"],\s*/i, '');
  } else {
    result = result
      .replace(/^In grammar context \d+ from [\u201c"][^\u201d"]+[\u201d"],\s*/i, '')
      .replace(/\s+in [\u201c"][^\u201d"]+[\u201d"](?=\?)?/gi, '')
      .replace(/^Why is example (\d+) an effective (?:[A-C]\d )?choice for this unit\?$/i, (_match, number) =>
        `Which explanation best shows why example ${number} uses ${grammarName} accurately?`
      );
  }
  return result.replace(/\s+([?.!,;:])/g, '$1');
}

function inferGrammarExampleHighlight(text, grammarName, language) {
  const value = String(text || '').trim();
  const patterns = language === 'french'
    ? [
        /\b(?:j['’]\s*)?(?:avais|avait|avions|aviez|avaient|étais|était|étions|étiez|étaient)\s+(?:\S+\s+){0,1}\S+/i,
        /\b(?:bien que|quoique|même si|à condition que|pourvu que|afin que|avant que|après que|malgré|en dépit de)\b/i,
        /\b(?:je|tu|il|elle|nous|vous|ils|elles)\s+(?:me\s+|te\s+|se\s+|nous\s+|vous\s+)?(?:\w+)(?:ais|ait|ions|iez|aient|erai|eras|era|erons|erez|eront)\b/i
      ]
    : language === 'spanish'
      ? [
          /\b(?:aunque|pese a(?: que)?|a pesar de(?: que)?|aun cuando|sin embargo|siempre que|a condición de que|antes de que|después de que)\b/i,
          /\b(?:había|habías|habíamos|habíais|habían|habría|habrías|habríamos|habrían)\s+\w+/i,
          /\b(?:sea|seas|seamos|sean|fuera|fueras|fuéramos|fueran|haya|hayas|hayamos|hayan)\s+\w+/i
        ]
      : [
          /\b(?:am|is|are|was|were)\s+(?:believed|said|reported|thought|expected|known|considered|regarded)\s+to(?:\s+have)?\s+\w+/i,
          /\b(?:have|has|had|get|gets|got)\s+(?:\w+\s+){0,3}(?:\w+ed|\w+en)\b/i,
          /\b(?:am|is|are|was|were|be|been|being)\s+(?:\w+\s+){0,3}(?:\w+ed|\w+en)\b/i,
          /\b(?:would have|could have|should have|might have|must have)\s+\w+/i,
          /\b(?:although|even though|despite|in spite of|unless|provided that|as long as|had better|used to)\b/i
        ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[0]) return match[0].replace(/[.,;:!?]+$/, '');
  }
  const titleWords = String(grammarName || '')
    .toLocaleLowerCase()
    .split(/[^\p{L}]+/u)
    .filter((word) => word.length >= 4);
  const titleMatch = value.split(/\s+/).find((word) =>
    titleWords.some((titleWord) => word.toLocaleLowerCase().replace(/[^\p{L}]/gu, '').startsWith(titleWord))
  );
  return titleMatch?.replace(/[.,;:!?]+$/, '') || value.split(/\s+/).slice(0, 2).join(' ');
}

function buildGrammarTestExamples(grammarLesson, grammarName, language) {
  const rawQuestions = grammarLesson?.content_json?.extra?.grammarTest?.questions ||
    grammarLesson?.content_json?.exercises || [];
  const candidates = [];
  for (const question of rawQuestions) {
    const options = (question.options || []).map((option) =>
      typeof option === 'string' ? option : option?.text
    );
    const answerIndex = Number.isInteger(question.answer)
      ? question.answer
      : (question.options || []).findIndex((option) => option?.id === question.correctOptionId);
    const answer = String(options[answerIndex] || '').trim();
    if (!answer) continue;
    let text = String(question.prompt || '').includes('___')
      ? String(question.prompt).replace('___', answer)
      : answer;
    const quoted = text.match(/[«“"]([^»”"]{18,})[»”"]/);
    if (quoted?.[1]) text = quoted[1];
    if (!/[.!?…]$/.test(text)) text += '.';
    if (candidates.some((item) => item.text.toLocaleLowerCase() === text.toLocaleLowerCase())) continue;
    const highlight = String(question.prompt || '').includes('___')
      ? answer
      : inferGrammarExampleHighlight(text, grammarName, language);
    candidates.push({ text, highlight });
  }

  // Two correct answers can still be near-duplicates (for example, the same
  // subject + frequency adverb with only a short complement removed). Prefer
  // examples with substantially different vocabulary; if the bank has no
  // genuinely different second example, show one strong example instead of
  // repeating the same model twice.
  const words = (text) => new Set(
    String(text || '')
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2)
  );
  const similarity = (left, right) => {
    const a = words(left);
    const b = words(right);
    if (!a.size || !b.size) return 0;
    const shared = [...a].filter((word) => b.has(word)).length;
    return shared / new Set([...a, ...b]).size;
  };
  const selected = [];
  for (const candidate of candidates) {
    if (!selected.length || selected.every((item) => similarity(item.text, candidate.text) < 0.5)) {
      selected.push(candidate);
    }
    if (selected.length === 2) break;
  }
  return selected;
}

function isUsefulVocabularyContext(example, word) {
  const text = String(example || '').trim();
  if (!text || !word) return false;
  const escaped = String(word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const generic = /(?:the article uses|in the article|analyse(?:s)? (?:the )?issue|used .+ while discussing|added .+ to (?:his|her) vocabulary)/i;
  return new RegExp(escaped, 'i').test(text) && !generic.test(text);
}

function buildVocabularyQuestion(item, wordRows, index, language) {
  const answerValue = item.word;
  const optionValues = uniqueVerbOptions(
    wordRows
      .map((word) => word.word)
      .filter((word) => String(word || '').toLocaleLowerCase() !== String(answerValue).toLocaleLowerCase())
  );
  // Wrap through the full vocabulary bank instead of taking a tail slice.
  // The latter produced only three choices for the final word in a short
  // unit, which makes the assessment inconsistent and can make guessing
  // easier.
  const distractors = Array.from(
    { length: Math.min(3, optionValues.length) },
    (_item, offset) => optionValues[(index + offset) % optionValues.length]
  );
  const options = [answerValue, ...distractors];
  const rotation = index % options.length;
  const ordered = [...options.slice(rotation), ...options.slice(0, rotation)].slice(0, 4);

  const definition = String(item.definition || item.translation || '').trim();
  // A bare sentence cloze is not a vocabulary assessment when two choices
  // fit the grammar and meaning (for example, both "pants" and "shoes" in
  // "These black _____ are new"). Ask for the word's meaning instead: it
  // keeps the question in a light real-life learning context while making
  // one—and only one—answer defensible.
  const prompt = language === 'french'
    ? `Dans cette unité, un apprenant veut dire « ${definition} ». Quel mot doit-il employer ?`
    : language === 'spanish'
      ? `En esta unidad, un estudiante quiere decir « ${definition} ». ¿Qué palabra debe usar?`
      : language === 'italian'
        ? `In questa unità, quale parola corrisponde a « ${definition} »?`
        : language === 'portuguese'
          ? `Nesta unidade, qual palavra corresponde a “${definition}”?`
          : language === 'german'
            ? `Welches Wort passt in dieser Einheit zu „${definition}“?`
      : `In this unit, a learner wants to say “${definition}”. Which word should they use?`;

  return { id: `v-${index}`, area: 'Vocabulary', prompt, options: ordered, answer: ordered.indexOf(answerValue) };
}

function testReviewPrompt(language) {
  const prompts = {
    english: 'Choose the version that communicates the idea naturally.',
    french: 'Choisissez la version qui exprime l’idée naturellement.',
    spanish: 'Elige la versión que expresa la idea de forma natural.',
    italian: 'Scegli la versione che esprime l’idea in modo naturale.',
    portuguese: 'Escolha a versão que expressa a ideia de forma natural.',
    german: 'Wähle die Version, die die Idee natürlich ausdrückt.'
  };
  return prompts[language] || prompts.english;
}

function buildItalianGrammarQuestions(level, grammarName, unitTitle) {
  const banks = {
    A1: [
      ['Scegli la presentazione corretta.', 'Mi chiamo Luca e sono studente.', 'Mi chiamo Luca e sto studente.', 'Mi chiamo Luca e essere studente.', 'Mi chiamo Luca e sono studenti.'],
      ['Completa: Io ___ a Roma.', 'abito', 'abiti', 'abitare', 'abitate'],
      ['Quale articolo è corretto?', 'la città', 'il città', 'lo città', 'un città'],
      ['Completa: ___ è la stazione?', 'Dov’è', 'Dove sono', 'Dove hai', 'Dovete'],
      ['Scegli la frase con l’aggettivo corretto.', 'Una casa italiana.', 'Una casa italiano.', 'Un casa italiana.', 'Una italiana casa.'],
      ['Completa: Mi ___ il caffè.', 'piace', 'piacciono', 'piacere', 'piaci'],
      ['Scegli la domanda naturale.', 'Come ti chiami?', 'Come ti chiama?', 'Come ti chiamo?', 'Come si chiami?'],
      ['Completa: Domani ___ al museo.', 'vado', 'andare', 'vai', 'andiamo io'],
      ['Nel contesto di questa unità, scegli la frase corretta.', 'Posso parlare un po’ più lentamente?', 'Posso parlato un po’ più lentamente?', 'Posso parla un po’ più lentamente?', 'Posso parlando un po’ più lentamente?']
    ],
    A2: [
      ['Completa: Di solito ___ l’autobus alle otto.', 'prendo', 'prendere', 'prendi io', 'preso'],
      ['Scegli la frase con un avverbio di frequenza.', 'A volte lavoro da casa.', 'A volte lavorato da casa.', 'A volte lavorare da casa.', 'A volte lavori da casa io.'],
      ['Completa: Stasera ___ cucinare.', 'sto per', 'sono per', 'ho per', 'vado di'],
      ['Ordina le azioni in modo naturale.', 'Prima studio, poi esco.', 'Prima esco, perché poi studio prima.', 'Poi prima studio esco.', 'Studio prima perché poi.'],
      ['Completa: Ieri, mentre ___, è arrivato Marco.', 'studiavo', 'studio', 'studierò', 'ho studiare'],
      ['Scegli il consiglio corretto.', 'Devi riposarti un po’.', 'Devi riposato un po’.', 'Devi riposa un po’.', 'Devi riposarti ieri.'],
      ['Completa: Vivo qui ___ tre anni.', 'da', 'perché', 'a', 'con'],
      ['Scegli il confronto corretto.', 'Questo percorso è più breve di quello.', 'Questo percorso è più breve da quello.', 'Questo percorso è molto breve quello.', 'Questo percorso più breve quello è.'],
      ['Nel contesto di questa unità, scegli la forma corretta.', 'Possiamo dividere i compiti.', 'Possiamo dividiamo i compiti.', 'Possiamo diviso i compiti.', 'Possiamo divideremo i compiti.']
    ],
    B1: [
      ['Completa: Penso che la proposta ___ utile.', 'sia', 'è', 'essere', 'sono'],
      ['Scegli il periodo ipotetico corretto.', 'Se avessi tempo, parteciperei.', 'Se avrei tempo, parteciperei.', 'Se avessi tempo, partecipo ieri.', 'Se ho tempo, parteciperei ieri.'],
      ['Completa: Glielo ___ domani.', 'dirò', 'dice', 'detto', 'dire'],
      ['Scegli il connettore di contrasto.', 'Tuttavia, dobbiamo verificare i dati.', 'Tuttavia perché dobbiamo verificare i dati.', 'Tuttavia di verificare i dati.', 'Tuttavia verifichiamo ieri.'],
      ['Completa: Mi hanno detto che Luca ___ tardi.', 'arriverà', 'arrivi ieri', 'arrivare', 'arrivato domani'],
      ['Scegli la forma impersonale corretta.', 'In Italia si mangia tardi.', 'In Italia si mangiano tardi.', 'In Italia si mangiare tardi.', 'In Italia si mangiato tardi.'],
      ['Completa: Quando sono arrivato, Marta ___ già partita.', 'era', 'è', 'sarà', 'essere'],
      ['Scegli il relativo corretto.', 'Il libro che mi hai consigliato è utile.', 'Il libro cui mi hai consigliato è utile.', 'Il libro dove mi hai consigliato è utile.', 'Il libro chi mi hai consigliato è utile.'],
      ['Nel contesto di questa unità, scegli il registro più naturale.', 'Le sarei grato se potesse rispondere.', 'Tu potresti rispondere subito, grazie.', 'Rispondere tu, per favore ieri.', 'Lei rispondeva domani.']
    ],
    B2: [
      ['Scegli la formulazione più precisa.', 'È necessario che il team valuti i rischi.', 'È necessario che il team valuta i rischi.', 'È necessario il team valutare i rischi.', 'È necessario che il team valutato i rischi.'],
      ['Completa: Il progetto ___ entro venerdì.', 'sarà consegnato', 'consegnerà stato', 'è consegnare', 'sarà consegnare'],
      ['Scegli il connettore più adatto.', 'Nonostante le difficoltà, il piano procede.', 'Nonostante perché le difficoltà, il piano procede.', 'Nonostante le difficoltà, il piano procedere.', 'Nonostante il piano, le difficoltà procede.'],
      ['Completa: Abbiamo bisogno di una soluzione che ___ sostenibile.', 'sia', 'è', 'essere', 'sono'],
      ['Scegli la frase con registro professionale.', 'Vorremmo definire le responsabilità del gruppo.', 'Vogliamo definire le responsabilità, dai.', 'Definire responsabilità subito noi.', 'Le responsabilità definito dal gruppo ieri.'],
      ['Completa: Pur ___ molti dati, non possiamo concludere.', 'avendo', 'avere', 'abbiamo', 'avuto'],
      ['Scegli la riformulazione corretta.', 'Il risultato dipende da come verranno usate le risorse.', 'Il risultato dipende da come useranno le risorse ieri.', 'Il risultato dipende usare le risorse.', 'Il risultato dipende le risorse usate.'],
      ['Completa: È importante ___ i tempi concordati.', 'rispettare', 'rispetti', 'rispettato', 'rispetterà'],
      ['Nel contesto di questa unità, scegli la frase più equilibrata.', 'La proposta è valida, purché sia monitorata regolarmente.', 'La proposta è valida, purché è monitorata regolarmente.', 'La proposta valida purché monitorare.', 'La proposta è valida, purché monitorata ieri.']
    ],
    C1: [
      ['Scegli la formulazione più sfumata.', 'I dati sembrano indicare una tendenza stabile.', 'I dati indicano certamente sempre tutto.', 'I dati sono indicare una tendenza.', 'I dati indicavano domani una tendenza.'],
      ['Completa: Benché ___ diverse obiezioni, la tesi resta plausibile.', 'esistano', 'esistono', 'esistere', 'esistevano domani'],
      ['Scegli il connettore più preciso.', 'Ciononostante, la discussione deve proseguire.', 'Ciononostante perché, la discussione prosegue.', 'Ciononostante di proseguire.', 'Ciononostante la discussione proseguita.'],
      ['Completa: L’autore sostiene che la misura ___ effetti indiretti.', 'avrebbe', 'ha avuto domani', 'avere', 'aveva per forza'],
      ['Scegli la frase con registro formale.', 'Si rende opportuno distinguere i due piani del problema.', 'È meglio dividere le cose, no?', 'Distinguere i piani problema subito.', 'I piani sono distinto ieri.'],
      ['Completa: La questione, ___ complessa, merita un esame accurato.', 'per quanto', 'perché', 'se', 'quando'],
      ['Scegli la citazione indiretta corretta.', 'Ha affermato che avrebbe rivisto il testo.', 'Ha affermato che rivedrà il testo ieri.', 'Ha affermato rivedere il testo.', 'Ha affermato che avrebbe rivisto testo domani.'],
      ['Completa: È un tema ___ occorre riflettere con attenzione.', 'su cui', 'che', 'dove', 'chi'],
      ['Nel contesto di questa unità, scegli la conclusione più prudente.', 'Si può quindi ipotizzare un cambiamento, senza considerarlo definitivo.', 'È sicuramente definitivo senza prove.', 'Il cambiamento ipotizzare definitivo.', 'Si può ipotizzato ieri.']
    ],
    C2: [
      ['Scegli la riformulazione più precisa.', 'L’argomento presuppone una relazione causale non dimostrata.', 'L’argomento è molto bello e basta.', 'L’argomento presupposto ieri una relazione.', 'L’argomento causale dimostrare non.'],
      ['Completa: Non è escluso che la scelta ___ effetti inattesi.', 'produca', 'produce', 'produrre', 'prodotta'],
      ['Scegli la frase con la concessione corretta.', 'Per quanto persuasiva, la tesi richiede ulteriori prove.', 'Per quanto la tesi persuasiva, richiede prove.', 'Per quanto persuadere, la tesi prove.', 'Per quanto tesi, richiede ulteriori provata.'],
      ['Completa: La formulazione è stata volutamente ___ per evitare semplificazioni.', 'attenuata', 'attenuare', 'attenua', 'attenuerà ieri'],
      ['Scegli l’analisi più rigorosa.', 'Il testo alterna dati verificabili e valutazioni implicite.', 'Il testo ha molte parole interessanti.', 'Il testo alternare dati ieri.', 'Il testo è analizzare con facile.'],
      ['Completa: La proposta va giudicata ___ delle sue conseguenze sociali.', 'alla luce', 'a luce', 'con luce', 'per la luce'],
      ['Scegli il periodo più coeso.', 'Se la premessa fosse condivisa, la conclusione risulterebbe più convincente.', 'Se la premessa sarebbe condivisa, la conclusione risulterebbe.', 'Se condividere la premessa, conclusione convincente.', 'La premessa condivisa risulterebbe ieri.'],
      ['Completa: Conviene distinguere ciò che è affermato da ciò che viene ___.', 'suggerito', 'suggerire', 'suggerisce', 'suggerirà'],
      ['Nel contesto di questa unità, scegli il giudizio più equilibrato.', 'La strategia può essere efficace, ma dipende dal pubblico e dal contesto.', 'La strategia funziona sempre per tutti.', 'La strategia efficace senza contesto.', 'La strategia funzionata domani.']
    ]
  };
  const source = banks[level] || banks.A1;
  return source.map(([prompt, correct, ...distractors], index) => ({
    id: `italian-${level.toLowerCase()}-${index + 1}`,
    area: 'Grammar',
    prompt: index === source.length - 1 ? `${prompt} (${unitTitle})` : prompt,
    options: [correct, ...distractors],
    answer: 0,
    grammarName
  }));
}

function buildItalianVocabularyQuestion(item, index) {
  const word = String(item.word || '').trim();
  const variants = uniqueVerbOptions([
    word,
    word.length > 4 ? `${word.slice(0, -1)}${word.endsWith('a') ? 'e' : 'a'}` : `${word}e`,
    word.length > 4 ? `${word.slice(0, 2)}${word.slice(3)}` : `${word}i`,
    word.length > 4 ? `${word.slice(0, 1)}${word.slice(2, 3)}${word.slice(1, 2)}${word.slice(3)}` : `${word}${word.slice(-1)}`
  ]).slice(0, 4);
  const options = variants.length === 4 ? variants : [word, 'parolla', 'vocabolario', 'lezione'];
  const rotation = index % 4;
  const ordered = [...options.slice(rotation), ...options.slice(0, rotation)];
  return {
    id: `it-v-${index}`,
    area: 'Vocabulary',
    prompt: 'Scegli la grafia corretta della parola studiata nella lezione.',
    options: ordered,
    answer: ordered.indexOf(word)
  };
}

function buildGrammarReviewQuestions(items, grammarProfile, language) {
  const prepared = items
    .map((item) => {
      const options = (item.options || []).map((option) =>
        typeof option === 'string' ? option : option?.text
      );
      const answer = Number.isInteger(item.answer)
        ? item.answer
        : options.findIndex((_, index) => item.options?.[index]?.id === item.correctOptionId);
      return { ...item, options, answer };
    })
    .filter(
      (item) =>
        hasFourDistinctTestOptions(item.options) &&
        item.answer >= 0 &&
        item.answer < item.options.length
    );
  const reviews = [];
  prepared.filter((item) => /_{2,}/.test(String(item.prompt || ''))).forEach((fillBlank) => {
    const options = fillBlank.options
      .map((option) => String(fillBlank.prompt).replace(/_{2,}/g, option))
      .filter((option, index, list) => option && list.indexOf(option) === index);
    if (options.length >= 2) {
      const answerText = String(fillBlank.prompt).replace(/_{2,}/g, fillBlank.options[fillBlank.answer]);
      reviews.push({
        id: `g-review-${reviews.length}`,
        area: 'Grammar',
        prompt: testReviewPrompt(language),
        options,
        answer: options.indexOf(answerText)
      });
    }
  });

  const example = (grammarProfile?.examples || [])
    .map((item) => String(item || '').trim())
    .find((item) => item.length >= 12 && !/\b(?:grammar|gramática|grammaire)\b/i.test(item));
  const distractors = prepared
    .flatMap((item) => item.options.filter((_option, index) => index !== item.answer))
    .map((item) => String(item || '').trim())
    .filter((item, index, list) => item.length >= 3 && list.indexOf(item) === index);
  if (example && distractors.length >= 3) {
    const options = [example, ...distractors.slice(0, 3)];
    reviews.push({
      id: `g-review-${reviews.length}`,
      area: 'Grammar',
      prompt: testReviewPrompt(language),
      options,
      answer: 0
    });
  }

  // Some early European units currently provide only four authored grammar
  // items. Preserve their intended answers and add contextualized variants so
  // every full test still keeps the same 9/3/3 learning rhythm.
  // Cycle through the validated source questions when an older unit has a
  // very short bank.  The wording and option order vary, but an invalid or
  // duplicated authored choice never reaches a learner just to fill space.
  for (let attempt = 0; prepared.length && reviews.length < 9; attempt += 1) {
    const item = prepared[attempt % prepared.length];
    const rotation = (reviews.length + 1) % item.options.length;
    const options = [...item.options.slice(rotation), ...item.options.slice(0, rotation)];
    reviews.push({
      id: `g-review-${reviews.length}`,
      area: 'Grammar',
      prompt: `${testReviewPrompt(language)} ${String(item.prompt || '').trim()}`.trim(),
      options,
      answer: options.indexOf(item.options[item.answer])
    });
  }
  return reviews;
}

function buildLevelVocabularyQuestion(item, levelVocabulary, index, language, level, unitTitle) {
  const answerValue = item.word;
  const distractors = levelVocabulary.filter(
    (word) => String(word).toLocaleLowerCase() !== String(answerValue).toLocaleLowerCase()
  );
  const options = [answerValue, ...distractors.slice(index, index + 3)];
  const rotation = index % options.length;
  const ordered = [...options.slice(rotation), ...options.slice(0, rotation)].slice(0, 4);
  const prompt = language === 'french'
    ? `Quel terme de vocabulaire de niveau ${level} correspond au thème « ${unitTitle} » ?`
    : language === 'spanish'
      ? `¿Cuál término de vocabulario del nivel ${level} corresponde al tema « ${unitTitle} »?`
      : language === 'italian'
        ? `Quale termine di livello ${level} appartiene al tema « ${unitTitle} »?`
        : language === 'portuguese'
          ? `Qual termo de nível ${level} pertence ao tema “${unitTitle}”?`
          : language === 'german'
            ? `Welcher Begriff auf Niveau ${level} gehört zum Thema „${unitTitle}“?`
      : `Which ${level} vocabulary term belongs to the topic “${unitTitle}”?`;

  // The test uses the CEFR word bank for this lesson topic. It never asks the
  // learner to return to, or remember wording from, a Reading passage.
  return {
    id: `v-${index}`,
    area: 'Vocabulary',
    prompt,
    options: ordered,
    answer: ordered.indexOf(answerValue)
  };
}

function uniqueVerbOptions(values) {
  const seen = new Set();
  return values.filter((value) => {
    const text = String(value || '').trim();
    if (!text || text === '—') return false;
    const key = text.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function hasFourDistinctTestOptions(values) {
  const normalized = (values || []).map((value) => String(value || '').trim().toLocaleLowerCase());
  return normalized.length === 4 && normalized.every(Boolean) && new Set(normalized).size === 4;
}

function getVerbForms(verb) {
  return uniqueVerbOptions([
    verb?.infinitive || verb?.baseForm,
    verb?.forms?.thirdPersonSingular,
    verb?.forms?.pastSimple,
    verb?.forms?.pastParticiple,
    verb?.forms?.presentParticiple
  ]);
}

function rotateTestOptions(correct, distractors, seed) {
  const options = uniqueVerbOptions([correct, ...distractors]).slice(0, 4);
  if (options.length < 4) return null;
  const rotation = Math.abs(seed) % options.length;
  const ordered = [...options.slice(rotation), ...options.slice(0, rotation)];
  return { options: ordered, answer: ordered.indexOf(correct) };
}

function verbTestText(language, key, values = {}) {
  const infinitive = values.infinitive || '';
  const tense = values.tense || '';
  const texts = {
    english: {
      family: `Which form belongs to the word family of “${infinitive}”?`,
      intruder: `Find the intruder: which form does not belong to “${infinitive}”?`,
      definition: `The best definition of “${infinitive}” is:`,
      tense: `Choose the ${tense} form of “${infinitive}”.`
    },
    french: {
      family: `Quelle forme appartient à la famille du verbe « ${infinitive} » ?`,
      intruder: `Trouvez l’intrus : quelle forme n’appartient pas au verbe « ${infinitive} » ?`,
      definition: `La meilleure définition du verbe « ${infinitive} » est :`,
      tense: `Choisissez la forme au ${tense} du verbe « ${infinitive} ».`
    },
    spanish: {
      family: `¿Qué forma pertenece a la familia del verbo « ${infinitive} »?`,
      intruder: `Encuentra el intruso: ¿qué forma no pertenece al verbo « ${infinitive} »?`,
      definition: `La mejor definición del verbo « ${infinitive} » es:`,
      tense: `Elige la forma en ${tense} del verbo « ${infinitive} ».`
    },
    italian: {
      family: `Quale forma appartiene alla famiglia del verbo « ${infinitive} »?`,
      intruder: `Trova l’intruso: quale forma non appartiene al verbo « ${infinitive} »?`,
      definition: `Il significato più preciso del verbo « ${infinitive} » è:`,
      tense: `Scegli la forma al ${tense} del verbo « ${infinitive} ».`
    },
    portuguese: {
      family: `Qual forma pertence à família do verbo « ${infinitive} »?`,
      intruder: `Encontre o intruso: qual forma não pertence ao verbo « ${infinitive} »?`,
      tense: `Escolha a forma no ${tense} do verbo « ${infinitive} ».`
    },
    german: {
      family: `Welche Form gehört zur Wortfamilie des Verbs „${infinitive}“?`,
      intruder: `Finde den Eindringling: Welche Form gehört nicht zu „${infinitive}“?`,
      tense: `Wähle die Form im ${tense} des Verbs „${infinitive}“.`
    }
  };
  return texts[language]?.[key] || texts.english[key];
}

function getVerbTenseLabel(language, formKey) {
  const past = formKey === 'pastSimple';
  const labels = {
    english: past ? 'Past Simple' : 'Past Participle',
    french: past ? 'passé composé' : 'participe passé',
    spanish: past ? 'pretérito' : 'participio',
    italian: past ? 'passato' : 'participio passato',
    portuguese: past ? 'pretérito' : 'particípio passado',
    german: past ? 'Präteritum' : 'Partizip II'
  };
  return labels[language] || labels.english;
}

function hasTargetLanguageDefinition(verb, language) {
  const definition = String(verb?.directDefinition?.[language] || '').trim();
  if (!definition) return false;
  // European catalogue placeholders only repeat the infinitive and are not a
  // genuine definition. Keep those Tests entirely in the target language by
  // using the form-based activities instead.
  return !/^(Verbo frecuente|Verb häufig|Frequent verb)/i.test(definition);
}

function buildVariedVerbQuestion(verb, eligibleVerbs, index, language, level, seed) {
  const infinitive = verb.infinitive || verb.baseForm;
  const ownForms = getVerbForms(verb);
  const otherVerbs = eligibleVerbs.filter((item) => item.id !== verb.id);
  const otherForms = otherVerbs.flatMap(getVerbForms);
  const formKey = ['A1', 'A2'].includes(level) ? 'pastSimple' : 'pastParticiple';
  const tense = getVerbTenseLabel(language, formKey);
  const variant = index % (hasTargetLanguageDefinition(verb, language) ? 4 : 3);

  if (variant === 0) {
    const correct = ownForms[Math.min(1, ownForms.length - 1)] || infinitive;
    const choice = rotateTestOptions(correct, otherForms, seed + index);
    if (choice) {
      return { id: `verb-${index}`, area: 'Verbs', kind: 'word-family', prompt: verbTestText(language, 'family', { infinitive }), ...choice };
    }
  }

  if (variant === 1 && ownForms.length >= 3) {
    const correct = otherForms[(seed + index * 7) % otherForms.length];
    const choice = rotateTestOptions(correct, ownForms.slice(0, 3), seed + index);
    if (choice) {
      return { id: `verb-${index}`, area: 'Verbs', kind: 'odd-one-out', prompt: verbTestText(language, 'intruder', { infinitive }), ...choice };
    }
  }

  if (variant === 2 && hasTargetLanguageDefinition(verb, language)) {
    const correct = String(verb.directDefinition[language]).trim();
    const definitions = otherVerbs
      .filter((item) => hasTargetLanguageDefinition(item, language))
      .map((item) => String(item.directDefinition[language]).trim());
    const choice = rotateTestOptions(correct, definitions, seed + index);
    if (choice) {
      return { id: `verb-${index}`, area: 'Verbs', kind: 'best-definition', prompt: verbTestText(language, 'definition', { infinitive }), ...choice };
    }
  }

  const correct = verb.forms?.[formKey] || ownForms[1] || infinitive;
  const distractors = otherVerbs.map((item) => item.forms?.[formKey]).filter(Boolean);
  const choice = rotateTestOptions(correct, distractors, seed + index);
  if (choice) {
    return { id: `verb-${index}`, area: 'Verbs', kind: 'verb-form', prompt: verbTestText(language, 'tense', { infinitive, tense }), ...choice };
  }
  return null;
}

function buildLanguageLessonTest(language, level, unitSlug) {
  const grammarQuestionCount = 9;
  const vocabularyQuestionCount = 3;
  const verbQuestionCount = 3;
  const rows = seedLessons.filter(
    (row) => row.target_language === language && row.level === level && row.unit_slug === unitSlug
  );
  const grammar = rows.find((row) => row.skill === 'grammar');
  const vocabulary = rows.find((row) => row.skill === 'vocabulary');
  const grammarName = grammar?.content_json?.extra?.grammarProfile?.name || grammar?.content_json?.grammarProfile?.name || grammar?.content_json?.title || 'Grammar';
  const grammarBank = grammar?.content_json?.extra?.grammarTest?.questions || [];
  const rawGrammarItems = grammarBank.length ? grammarBank : grammar?.content_json?.exercises || [];
  const grammarQuestions = rawGrammarItems
    .map((item) => {
      const options = (item.options || []).map((option) =>
        typeof option === 'string' ? option : option?.text
      );
      const answer = Number.isInteger(item.answer)
        ? item.answer
        : options.findIndex((_, index) => item.options?.[index]?.id === item.correctOptionId);
      return { ...item, options, answer };
    })
    .filter(
      (item) =>
        item.type === 'mcq' &&
        hasFourDistinctTestOptions(item.options) &&
        Number.isInteger(item.answer) &&
        item.answer >= 0 &&
        item.answer < item.options.length
    )
    .slice(0, grammarQuestionCount)
    .map((item, index) => ({
      id: `g-${index}`,
      area: 'Grammar',
      prompt: makeStandaloneGrammarPrompt(item.prompt, grammarName, language),
      options: item.options,
      answer: item.answer
    }));
  const grammarProfile = grammar?.content_json?.extra?.grammarProfile || grammar?.content_json?.grammarProfile;
  if (grammarQuestions.length < grammarQuestionCount) {
    const reviews = buildGrammarReviewQuestions(rawGrammarItems, grammarProfile, language);
    grammarQuestions.push(...reviews.slice(0, grammarQuestionCount - grammarQuestions.length));
  }
  const wordRows = (vocabulary?.content_json?.vocabulary || [])
    .map((item) => ({
      word: item.targetWord || item.word,
      translation: item.translation || item.meaning,
      definition: item.definition,
      example: item.example
    }))
    .filter((item) => item.word && item.translation);
  const unitTitle = seedUnits.find(
    (unit) => unit.target_language === language && unit.level === level && unit.slug === unitSlug
  )?.title || unitSlug;
  const levelVocabulary = seedLessons
    .filter(
      (row) =>
        row.target_language === language &&
        row.level === level &&
        row.skill === 'vocabulary' &&
        row.unit_slug !== unitSlug
    )
    .flatMap((row) => row.content_json?.vocabulary || [])
    .map((item) => item.targetWord || item.word)
    .filter(Boolean);
  const vocabularyCount = Math.min(wordRows.length, vocabularyQuestionCount);
  const vocabularyQuestions = wordRows
    .slice(0, vocabularyCount)
    .map((item, index) => language === 'italian' && /^(palabra cultural|acción cotidiana|lugar o cosa|expresión útil)$/i.test(String(item.translation || '').trim())
      ? buildItalianVocabularyQuestion(item, index)
      : buildVocabularyQuestion(item, wordRows, index, language));
  if (language === 'italian' && level !== 'B1') {
    grammarQuestions.splice(
      0,
      grammarQuestions.length,
      ...buildItalianGrammarQuestions(level, grammarName, unitTitle)
    );
  }
  const unitSeed = [...unitSlug].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const verbPools = {
    english: englishTestVerbs,
    french: frenchTestVerbs,
    spanish: spanishTestVerbs,
    italian: italianTestVerbs,
    portuguese: portugueseTestVerbs,
    german: germanTestVerbs
  };
  const verbPool = verbPools[language] || englishTestVerbs;
  // Tests must assess the level selected by the learner.  The former
  // non-A1 fallback drew from the whole catalogue, allowing advanced or
  // beginner verbs into Italian (and other language) level tests.
  const levelVerbs = verbPool.filter((verb) => verb.level === level);
  const eligibleVerbs = levelVerbs.length >= verbQuestionCount
    ? levelVerbs
    : verbPool.filter((verb) => verb.level === 'A1');
  const verbCount = verbQuestionCount;
  const selectedVerbs = Array.from({ length: verbCount }, (_, index) => eligibleVerbs[(unitSeed + index * 17) % eligibleVerbs.length]);
  // Rotate the verbs through different cognitive tasks. Learners identify a
  // word family, spot an intruder, select a best definition where the source
  // catalogue has a real target-language definition, and recognise a form.
  // This keeps assessment practical instead of repeating translation prompts.
  const verbQuestions = selectedVerbs
    .map((verb, index) => buildVariedVerbQuestion(verb, eligibleVerbs, index, language, level, unitSeed))
    .filter(Boolean);
  // This is a general assessment of the level/unit language system. It uses
  // the grammar, CEFR vocabulary and verb knowledge taught here, but never
  // depends on remembering a Reading passage or its exact wording.
  return [...grammarQuestions, ...vocabularyQuestions, ...verbQuestions];
}

// Every successful Tutor consultation is metered, whether written or spoken.
// Limits are plan-based: 30/month on Free and 500/month on Premium.
async function getTutorQueryUsage(userId) {
  const entitlements = await getUserEntitlements(userId);
  const planSlug = entitlements.isPremium ? 'premium' : 'free';
  const monthlyLimit = plansConfig.getFeatureLimit(planSlug, 'tutor_query');
  const usage = await usageLimitService.checkUsage({
    userId,
    feature: 'tutor_query',
    monthlyLimit
  });
  return { ...usage, planSlug };
}

// memoryStorage keeps the uploaded audio in a Buffer on req.file - it is
// never written to disk, and speakingService discards its reference to that
// buffer as soon as the request is handled (see /api/speaking/analyze).
const speakingUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // ~15MB - generous headroom over a 60s compressed clip
});

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' ? token : null;
}

async function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  const user = await authService.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
  }
  req.user = user;
  next();
}

// A lesson write and the progress shown immediately afterwards must come
// from the same persisted snapshot.  Returning only completeLesson()'s
// legacy profile percentage made the UI briefly show `completed * 12`,
// regardless of the selected language/level or the seventh Verbs activity.
// Dashboard already composes the six lesson rows plus unit verb progress, so
// reuse that single source of truth after a successful write.
async function withFreshCourseProgress(userId, result) {
  try {
    const dashboard = await dashboardService.getDashboard(userId);
    return {
      ...result,
      progress: dashboard.progress,
      courseProgress: dashboard.courseProgress
    };
  } catch (error) {
    // Saving the activity succeeded. A transient summary-read failure must
    // not turn that successful write into an HTTP 500 or invite a duplicate
    // retry; the client can refresh the dashboard independently.
    console.warn('Could not attach fresh course progress', error);
    return result;
  }
}

async function requirePremiumSavedVocabulary(req, res, next) {
  try {
    const entitlements = await getUserEntitlements(req.user?.id);
    if (!entitlements.hasFullAccess) {
      return res.status(403).json({
        code: 'PREMIUM_REQUIRED',
        error: 'Guardar y repasar palabras de Reading en Vocabulary requiere ANDERGO Premium.'
      });
    }
    req.entitlements = entitlements;
    next();
  } catch {
    res.status(503).json({
      error: 'No se pudo verificar tu acceso Premium en este momento.'
    });
  }
}

async function requireCurriculumStaff(req, res, next) {
  try {
    const entitlements = await getUserEntitlements(req.user?.id);
    if (!['teacher', 'ceo'].includes(entitlements.role)) {
      return res.status(403).json({
        code: 'CURRICULUM_STAFF_REQUIRED',
        error: 'Este panel está disponible únicamente para personal docente autorizado.'
      });
    }
    req.entitlements = entitlements;
    next();
  } catch {
    res.status(503).json({ error: 'No se pudo verificar el acceso docente.' });
  }
}

// Attaches req.user when a valid token is present, but never blocks the
// request - used for endpoints that behave differently for guests vs. users
// without requiring authentication (e.g. lesson listing).
async function attachUserIfPresent(req, _res, next) {
  const token = getBearerToken(req);
  req.user = token ? await authService.verifyToken(token) : null;
  next();
}

function createServer() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  // The language "world" bundles (src/worlds/*/content.js) are several MB
  // each uncompressed - gzip/brotli shrinks that JS/JSON-heavy text by ~85%,
  // which is what actually made the Games tab (and lesson loads) feel slow
  // over the network. Must run before express.static below to compress what
  // it serves.
  app.use(compression());
  // helmet()'s default CSP only allows 'self', which silently blocked every
  // third-party script this app actually loads at runtime: Paddle.js
  // (checkout overlay), the PayPal SDK (fallback checkout), the Supabase JS
  // UMD build (loaded from a CDN instead of bundled), and Google Fonts -
  // each fails with a CSP console error and no visible app-level error.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          scriptSrc: ["'self'", 'https://cdn.paddle.com', 'https://www.paypal.com', 'https://cdn.jsdelivr.net'],
          connectSrc: ["'self'", 'https://*.paddle.com', 'https://*.paypal.com', 'https://*.supabase.co'],
          frameSrc: ["'self'", 'https://*.paddle.com', 'https://www.paypal.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https://*.paddle.com', 'https://*.paypal.com'],
          // Missing here, media-src falls back to default-src ('self'),
          // silently blocking every <audio src="..."> pointing at the
          // "lesson-audio" Supabase Storage bucket (a different origin) -
          // the browser's own error, never surfaced past a generic "No
          // pudimos cargar este audio" on the player. TTS playback
          // (window.speechSynthesis) is unaffected either way since it
          // isn't a CSP-governed network fetch.
          mediaSrc: ["'self'", 'https://*.supabase.co']
        }
      }
    })
  );
  app.use(
    cors({
      // No Origin header (same-origin page loads, curl, server-to-server) is
      // always allowed; cross-origin browser requests are checked against
      // config.allowedOrigins (see lib/config.js for how to extend it).
      origin(origin, callback) {
        if (!origin || config.allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    })
  );
  // Without this, the cors() middleware's origin callback erroring out (any
  // browser Origin not in config.allowedOrigins - e.g. the onrender.com
  // subdomain Render keeps alongside a custom domain) falls through to
  // Express's default error handler: a bare HTML 500 with no JSON body.
  // The frontend's postJson() then fails to parse it and every request
  // surfaces as a generic "Request failed", indistinguishable from a real
  // server crash. Answer disallowed origins with a clean 403 instead.
  app.use((err, req, res, next) => {
    if (err && err.message === 'Not allowed by CORS') {
      return res.status(403).json({ error: 'Origin not allowed.' });
    }
    next(err);
  });
  // Paddle signs the exact request bytes. This route must stay before the
  // general JSON parser or signature verification would always fail.
  const paddleWebhookHandler = async (req, res) => {
    try {
      const result = await billingService.handleWebhookEvent(
        req.body,
        req.headers['paddle-signature']
      );
      res.json({ ok: true, ...result });
    } catch (error) {
      const status = error.status || 500;
      if (status >= 500) console.error('[paddle-webhook]', error.message);
      res.status(status).json({
        ok: false,
        error: status >= 500 ? 'No se pudo procesar el webhook de Paddle.' : error.message
      });
    }
  };
  const paddleRawBody = express.raw({ type: 'application/json', limit: '1mb' });
  app.post('/api/paddle/webhook', paddleRawBody, paddleWebhookHandler);
  // Preserve the previously published path while Paddle destinations move
  // to the canonical /api/paddle/webhook URL.
  app.post('/api/billing/paddle/webhook', paddleRawBody, paddleWebhookHandler);
  app.all(['/api/paddle/webhook', '/api/billing/paddle/webhook'], (_req, res) => {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
  });
  // Vercel's Node runtime can pre-parse a JSON body into req.body before this
  // app ever sees the request, having already drained the stream - letting
  // express.json() try to read it again would leave req.body empty on every
  // route. Skip re-parsing whenever a body object is already present.
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      return next();
    }
    express.json()(req, res, next);
  });
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('tiny'));
  }

  app.post('/api/paypal/webhook', async (req, res) => {
    try {
      const result = await paypalBillingService.handleWebhook(req);
      res.json({ ok: true, ...result });
    } catch (error) {
      const status = error.status || 500;
      if (status >= 500) console.error('[paypal-webhook]', error.internalMessage || error.message);
      res.status(status).json({
        ok: false,
        error: status >= 500 ? 'No se pudo procesar el webhook de PayPal.' : error.message
      });
    }
  });

  app.get('/welcome', (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'welcome.html'));
  });
  app.use(express.static(PUBLIC_DIR));

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api', apiLimiter);

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      configured: config.isSupabaseConfigured,
      supabase: {
        configured: config.isSupabaseConfigured,
        mode: config.isSupabaseConfigured ? 'supabase' : 'demo'
      },
      // No keys, no other provider names - just enough for a status page to
      // show whether the tutor can respond at all right now.
      aiTutor: {
        configured: isAnyProviderConfigured(),
        primaryProvider: 'cerebras',
        streaming: true,
        automaticFallback: 'groq'
      },
      translator: {
        provider: 'deepl',
        configured: Boolean(process.env.DEEPL_API_KEY),
        baseUrlConfigured: Boolean(process.env.DEEPL_API_BASE_URL)
      },
      // Confirms only that Supabase Auth is the configured sender path -
      // the actual SMTP account/credentials live in the Supabase dashboard
      // (Brevo), never in this app's env or code. "configured" intentionally
      // says "dashboard-managed" rather than true/false: this endpoint has
      // no way to check the dashboard's SMTP settings, and must never claim
      // delivery succeeded - that's only ever verifiable in Brevo's own
      // Transactional Logs.
      emailAuth: {
        provider: 'supabase-brevo-smtp',
        sender: config.noReplyEmail,
        configured: 'dashboard-managed'
      }
    });
  });

  app.get('/api/content/languages', (_req, res) => {
    res.json({ levelContent, languageContent });
  });

  // Read-only peek at the Tutor's monthly query cap, so the #tutor
  // view can show the plan-specific remaining allowance as soon as it opens instead
  // of only after the first message streams back. usageLimitService.checkUsage
  // never records/increments (only recordUsage does, after a real reply) -
  // safe to call as often as the UI wants.
  app.get('/api/ai/tutor/usage', requireAuth, async (req, res) => {
    const usage = await getTutorQueryUsage(req.user.id);
    res.json({ used: usage.used, remaining: usage.remaining, limit: usage.limit });
  });

  // Streams the tutor's reply to the browser as it's generated (SSE:
  // `data: {"delta": "..."}\n\n` per chunk, ending with `{"done": true}` or
  // `{"error": true, "message": "..."}`). If no provider is configured at
  // all, that's knowable before any streaming starts, so it stays a plain
  // JSON 503 - only failures discovered mid-stream (after headers are sent)
  // go through the SSE error event, since the HTTP status can't change by then.
  app.post('/api/ai/tutor', requireAuth, async (req, res) => {
    const configError = tutorConfigError();
    if (configError) {
      res.status(configError.status).json({ error: configError.message });
      return;
    }

    const {
      task,
      language,
      skill,
      level,
      nativeLanguage,
      // 'bilingual' | 'direct' (learningPathState.learningMode) - see
      // lib/aiTutorService.js#buildTutorInput for how this changes the
      // language rule (L2-only main response, optional L1 support block).
      learningMode,
      prompt,
      lessonTitle,
      lessonIntro,
      currentActivity,
      selectedSuggestion,
      history,
      topicTurn,
      topicLimit,
      transcript,
      vocabulary,
      currentQuestion,
      selectedAnswer,
      supportMode,
      contextScope,
      // speaking_correction-only fields (§10 of the Speaking redesign spec) -
      // ignored by the general tutor branch below.
      bridgeLanguage,
      unitId,
      lessonId,
      activityType,
      situation,
      studentResponse,
      conversationHistory
    } = req.body || {};

    const tutorUsage = await getTutorQueryUsage(req.user.id);
    if (!tutorUsage.allowed) {
      res.status(403).json({
        error:
          'Has utilizado todas las consultas incluidas en tu plan. Tu cuota se renovará automáticamente el próximo ciclo.',
        code: 'USAGE_LIMIT_REACHED',
        limited: true,
        remaining: 0,
        limit: tutorUsage.limit
      });
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Disables buffering on Vercel/nginx-style proxies so chunks reach the
      // browser as they're written instead of arriving all at once at the end.
      'X-Accel-Buffering': 'no'
    });
    res.flushHeaders?.();

    const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);
    // A query only "counts" once the provider has actually returned
    // content - never on a validation/server/timeout/provider error, and
    // never on a technically-successful-but-empty reply.
    let respondedWithContent = false;
    const onDelta = (text) => {
      if (text) respondedWithContent = true;
      send({ delta: text });
    };

    try {
      if (task === 'speaking_correction') {
        // Speaking's integrated corrector (§7/§11/§12) - a distinct task
        // from the general tutor chat above, only ever given this one
        // activity's transcribed text, never audio (see script.js's
        // requestSpeakingCorrection, which builds this exact narrow payload).
        await getSpeakingCorrection({
          language,
          bridgeLanguage,
          level,
          unitId,
          lessonId,
          activityType,
          situation,
          prompt,
          studentResponse,
          conversationHistory: Array.isArray(conversationHistory)
            ? conversationHistory.slice(-3)
            : undefined,
          onDelta
        });
      } else {
        await getTutorReplyStream({
          language,
          skill,
          level,
          nativeLanguage,
          learningMode,
          prompt,
          lessonTitle,
          lessonIntro,
          currentActivity,
          selectedSuggestion,
          contextScope,
          topicTurn: Number(topicTurn) || 1,
          topicLimit:
            contextScope === 'general'
              ? 500
              : Math.min(10, Math.max(1, Number(topicLimit) || 10)),
          transcript,
          vocabulary,
          currentQuestion,
          selectedAnswer,
          supportMode,
          history: Array.isArray(history) ? history.slice(-12) : undefined,
          onDelta
        });
      }

      let usagePayload;
      if (respondedWithContent && req.user?.id) {
        // Never let a usage-recording failure break an otherwise-successful
        // reply that's already been streamed to the browser.
        await usageLimitService
          .recordUsage({ userId: req.user.id, feature: 'tutor_query' })
          .catch(() => {});
        usagePayload =
          tutorUsage?.remaining != null
            ? { remaining: Math.max(0, tutorUsage.remaining - 1), limit: tutorUsage.limit }
            : undefined;
      }
      send({ done: true, ...(usagePayload ? { usage: usagePayload } : {}) });
    } catch (error) {
      send({ error: true, message: error.message || 'No se pudo conectar con el tutor IA.' });
    } finally {
      res.end();
    }
  });

  // Free/guest cap matches the frontend textarea's own maxlength (see
  // index.html #translatorInput) - Premium gets a higher ceiling, still well
  // under DeepL's own per-request limits. Neither is the DeepL *plan* quota
  // (character budget per billing period), which DeepL enforces on its side
  // and this route surfaces via the 456 status handled in translatorService.
  const FREE_MAX_TRANSLATE_TEXT_LENGTH = 1000;
  const PREMIUM_MAX_TRANSLATE_TEXT_LENGTH = 5000;
  // Central language list (src/js/translator-languages.js) - only the
  // DeepL-supported ones are ever accepted here; languages not yet backed
  // by DeepL (currently Hawaiian) are excluded automatically.
  const TRANSLATABLE_LANGUAGES = new Set(
    translatorLanguages.getSelectableLanguages().map((lang) => lang.key)
  );

  const translatorLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      message: 'Demasiadas traducciones seguidas. Espera un momento e inténtalo de nuevo.'
    }
  });

  // Public (no requireAuth) - the Traductor tab works for guests and signed-in
  // students alike. attachUserIfPresent only reads req.user when a valid
  // session token is sent; it never blocks a guest request. Never calls
  // DeepL from the browser: the frontend only ever hits this route (see
  // translator-* handlers in src/js/script.js). Renamed from the earlier
  // /api/translator (Azure-backed) - DeepL is now the sole provider.
  app.post('/api/translate', translatorLimiter, attachUserIfPresent, async (req, res) => {
    const { text, context, sourceLanguage, targetLanguage, targetVariant } = req.body || {};

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ ok: false, message: 'Escribe un texto para traducir.' });
    }
    if (!TRANSLATABLE_LANGUAGES.has(targetLanguage)) {
      return res.status(400).json({ ok: false, message: 'Idioma de destino no soportado.' });
    }
    if (sourceLanguage && sourceLanguage !== 'auto' && !TRANSLATABLE_LANGUAGES.has(sourceLanguage)) {
      return res.status(400).json({ ok: false, message: 'Idioma de origen no soportado.' });
    }
    // Only a real, resolved source language can equal the target - 'auto'
    // is never rejected here, since the actual detected language isn't
    // known until DeepL responds (and may legitimately equal the target,
    // e.g. proofreading text that's already in that language).
    if (sourceLanguage && sourceLanguage !== 'auto' && sourceLanguage === targetLanguage) {
      return res.status(400).json({ ok: false, message: 'Selecciona dos idiomas diferentes.' });
    }

    const entitlements = await getUserEntitlements(req.user?.id);
    const maxLength = entitlements.isPremium
      ? PREMIUM_MAX_TRANSLATE_TEXT_LENGTH
      : FREE_MAX_TRANSLATE_TEXT_LENGTH;
    if (text.length > maxLength) {
      return res.status(400).json({
        ok: false,
        message: entitlements.isPremium
          ? 'El texto es demasiado largo para traducir.'
          : `El texto supera el límite gratuito de ${FREE_MAX_TRANSLATE_TEXT_LENGTH} caracteres. Desbloquea ANDERGO Premium para traducir textos más largos.`
      });
    }
    if (context != null && (typeof context !== 'string' || context.length > 1000)) {
      return res.status(400).json({ ok: false, message: 'El contexto de traducción no es válido.' });
    }

    if (!translatorService.isTranslatorConfigured()) {
      return res.json({
        ok: false,
        configured: false,
        message: 'El traductor está temporalmente en configuración.'
      });
    }

    try {
      const result = await translatorService.translateText({
        text,
        context,
        sourceLanguage,
        targetLanguage,
        targetVariant
      });
      res.json({ ok: true, configured: true, ...result });
    } catch (error) {
      // Never log `text` - only the error code/message, matching the
      // "no registrar el texto completo" requirement.
      console.warn('[translate] request failed', error.code || error.message);
      const status = error.code === 'TRANSLATOR_TIMEOUT' ? 504 : 502;
      res.status(status).json({
        ok: false,
        configured: true,
        message: error.message || 'No se pudo traducir el texto en este momento. Inténtalo de nuevo.'
      });
    }
  });

  app.get('/api/vocabulary/saved', requireAuth, requirePremiumSavedVocabulary, async (req, res) => {
    try {
      const items = await savedVocabularyService.listSavedVocabulary({
        userId: req.user.id,
        unitSlug: req.query.unitSlug,
        lessonSlug: req.query.lessonSlug
      });
      res.json({ items });
    } catch {
      res.status(500).json({ error: 'No se pudo cargar tu vocabulario guardado.' });
    }
  });

  app.post('/api/vocabulary/saved', requireAuth, requirePremiumSavedVocabulary, async (req, res) => {
    try {
      const item = await savedVocabularyService.saveVocabulary({
        userId: req.user.id,
        ...req.body
      });
      res.status(201).json({ item });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo guardar esta palabra.' });
    }
  });

  app.delete('/api/vocabulary/saved/:id', requireAuth, requirePremiumSavedVocabulary, async (req, res) => {
    try {
      await savedVocabularyService.deleteSavedVocabulary({
        userId: req.user.id,
        id: req.params.id
      });
      res.status(204).end();
    } catch {
      res.status(500).json({ error: 'No se pudo eliminar esta palabra.' });
    }
  });

  // Corrector (Fase 3) - a distinct mode from /api/translate above, never
  // combined into the same call ("no mezclar traducción y corrección en una
  // sola llamada sin control"): this never touches DeepL, and /api/translate
  // never touches the AI Tutor cascade. English/Spanish/French only for now
  // (spec item: "detectar o seleccionar English, Spanish o French").
  const CORRECTABLE_LANGUAGES = new Set(['english', 'spanish', 'french']);
  const MAX_CORRECTION_TEXT_LENGTH = 1000;

  const correctorLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      message: 'Demasiadas correcciones seguidas. Espera un momento e inténtalo de nuevo.'
    }
  });

  // Public (no requireAuth), same posture as /api/translate - the Corrector
  // is part of the Traductor's public UI for guests and signed-in students
  // alike. Unmetered by usageLimitService, same as getSpeakingCorrection's
  // existing precedent (task === 'speaking_correction' on /api/ai/tutor).
  app.post('/api/correct-text', correctorLimiter, attachUserIfPresent, async (req, res) => {
    const { text, language } = req.body || {};

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ ok: false, message: 'Escribe un texto para corregir.' });
    }
    if (!CORRECTABLE_LANGUAGES.has(language)) {
      return res.status(400).json({ ok: false, message: 'Idioma no soportado para corrección.' });
    }
    if (text.length > MAX_CORRECTION_TEXT_LENGTH) {
      return res.status(400).json({
        ok: false,
        message: `El texto supera el límite de ${MAX_CORRECTION_TEXT_LENGTH} caracteres.`
      });
    }

    const configError = tutorConfigError();
    if (configError) {
      return res.json({
        ok: false,
        configured: false,
        message: 'El corrector está temporalmente en configuración.'
      });
    }

    try {
      const result = await getTextCorrection({ text, language });
      res.json({ ok: true, configured: true, ...result });
    } catch (error) {
      // Never log `text` - only the error code/message, matching
      // /api/translate's own "no registrar el texto completo" rule.
      console.warn('[correct-text] request failed', error.code || error.message);
      const status = error.status && error.status >= 400 ? error.status : 502;
      res.status(status).json({
        ok: false,
        configured: true,
        message: error.message || 'No se pudo corregir el texto en este momento. Inténtalo de nuevo.'
      });
    }
  });

  const PHONETIC_LANGUAGES = new Set(['english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'japanese', 'chinese', 'haitianCreole']);
  const phoneticLimiter = rateLimit({
    windowMs: 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
    message: { ok: false, message: 'Demasiadas transcripciones seguidas. Espera un momento e inténtalo de nuevo.' }
  });
  app.post('/api/phonetic-transcription', phoneticLimiter, attachUserIfPresent, async (req, res) => {
    const { text, language } = req.body || {};
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ ok: false, message: 'Escribe un texto para transcribir.' });
    }
    if (!PHONETIC_LANGUAGES.has(language)) {
      return res.status(400).json({ ok: false, message: 'Idioma no soportado para transcripción fonética.' });
    }
    if (text.length > 1000) {
      return res.status(400).json({ ok: false, message: 'El texto supera el límite de 1000 caracteres.' });
    }
    if (tutorConfigError()) {
      return res.json({ ok: false, configured: false, message: 'La transcripción fonética está temporalmente en configuración.' });
    }
    try {
      const result = await getPhoneticTranscription({ text, language });
      res.json({ ok: true, configured: true, language, ...result });
    } catch (error) {
      console.warn('[phonetic-transcription] request failed', error.code || error.message);
      res.status(error.status && error.status >= 400 ? error.status : 502).json({
        ok: false, configured: true,
        message: error.message || 'No se pudo generar la transcripción fonética en este momento.'
      });
    }
  });

  // Separate from the general /api limiter and only counts login attempts
  // (register/logout on this same route are unaffected) - brute-forcing a
  // password is exactly what this needs to slow down, whether the attempt
  // used an email or a username identifier.
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => (req.body || {}).action !== 'login',
    message: {
      error: 'TOO_MANY_ATTEMPTS',
      message: 'Has realizado varios intentos. Espera un momento y vuelve a intentarlo.'
    }
  });

  // register also triggers a real Supabase signUp() (and its confirmation
  // email send) - same rationale as resendOtpLimiter/resendConfirmationLimiter
  // below, just scoped to action==='register' the same way loginLimiter is
  // scoped to action==='login', so repeated signup attempts can't be used to
  // spam a target inbox with OTP codes.
  const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => (req.body || {}).action !== 'register',
    message: {
      error: 'TOO_MANY_ATTEMPTS',
      message: 'Has realizado varios intentos. Espera un momento y vuelve a intentarlo.'
    }
  });

  app.post('/api/auth', loginLimiter, registerLimiter, async (req, res) => {
    const { action, email, password, name, username, identifier } = req.body || {};
    try {
      if (action === 'register') {
        const result = await authService.register({ email, password, name, username });
        return res.status(201).json(result);
      }
      if (action === 'logout') {
        const result = await authService.logout();
        return res.json(result);
      }
      // Default / 'login' - identifier is the new field (username or email);
      // email is kept working as a back-compat alias (see authService.login).
      const result = await authService.login({ identifier, email, password });
      return res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      // `email` is only ever set on the EMAIL_NOT_CONFIRMED error (see
      // authService.login) - undefined for every other error and dropped by
      // JSON.stringify, so no other failure path gains a new field here.
      return res
        .status(status)
        .json({ error: error.message || 'Request failed.', code: error.code, email: error.email });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    const result = await authService.logout();
    res.json(result);
  });

  // Social OAuth completes in the browser because Supabase returns the
  // session through the redirect URL.  The client then calls this same-origin
  // route to obtain the public ANDERGO account shape used by saveSession().
  // Keep it behind requireAuth: the token is verified server-side and no
  // credential or provider metadata is sent back to the browser.
  app.get('/api/user', requireAuth, async (req, res) => {
    // OAuth identity must preserve the student's claimed ANDERGO username.
    // Google supplies a personal name, but that is only intended for a
    // voluntarily shared Test result, never for the signed-in UI.
    let username = req.user.username || null;
    try {
      username = (await preferencesService.getPreferences(req.user.id)).username || username;
    } catch (error) {
      console.warn('[api/user] could not load profile username', error.message);
    }
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email || null,
        name: req.user.name || null,
        username,
        emailConfirmedAt: null
      }
    });
  });

  // Exchanges a stored refresh_token for a new access/refresh pair - the
  // frontend calls this once when any authenticated request comes back 401
  // with a still-present local session (see authFetch()/refreshAuthSession()
  // in script.js), instead of forcing a full re-login every time a Supabase
  // access token's ~1h lifetime runs out mid-session.
  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body || {};
      const result = await authService.refreshSession(refreshToken);
      res.json({ ok: true, ...result });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ ok: false, error: error.message || 'No se pudo renovar la sesión.' });
    }
  });

  // Stricter than the general /api limiter: this endpoint triggers a real
  // Supabase email send (itself rate-limited) and could otherwise be used to
  // spam a target inbox or probe which emails have pending accounts.
  const resendConfirmationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Si existe una cuenta pendiente para ese correo, enviaremos un nuevo enlace.'
    }
  });

  app.post('/api/auth/resend-confirmation', resendConfirmationLimiter, async (req, res) => {
    const { email } = req.body || {};
    const result = await authService.resendConfirmation(email);
    res.json(result);
  });

  // Same limits/rationale as resendConfirmationLimiter - kept as a
  // separate instance so resending an OTP and the legacy resend-confirmation
  // route don't share one counter.
  const resendOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: true,
      message: 'Si el correo corresponde a una cuenta pendiente, recibirás un nuevo código.'
    }
  });

  app.post('/api/auth/resend-otp', resendOtpLimiter, async (req, res) => {
    const { email } = req.body || {};
    const result = await authService.resendConfirmation(email);
    res.json(result);
  });

  // Only counts failed/successful verification attempts, not resends
  // (those have their own limiter above) - this is the endpoint an
  // attacker would hammer to brute-force a 6-digit code (1M combinations,
  // so a generous-looking limit like 10/15min is still a meaningful
  // slow-down layered on top of Supabase's own otp_expired enforcement).
  const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      error: 'TOO_MANY_ATTEMPTS',
      message: 'Has realizado varios intentos. Espera un momento.'
    }
  });

  app.post('/api/auth/verify-otp', verifyOtpLimiter, async (req, res) => {
    try {
      const { email, token, purpose } = req.body || {};
      const result = await authService.verifyOtp({ email, token, purpose });
      res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({
        ok: false,
        error: error.code || 'OTP_VERIFY_FAILED',
        message: error.message || 'No se pudo verificar el código.'
      });
    }
  });

  // Reuses resendConfirmationLimiter's rationale/limits: also triggers a
  // real Supabase email send, so the same abuse concerns apply. `error`
  // (not `ok`) carries the machine code - same shape as loginLimiter/
  // registerLimiter above - so the frontend's postJson can tell "rate
  // limited" apart from a genuine send/network failure (see
  // forgotPasswordForm's submit handler in script.js) instead of both
  // collapsing into the same generic error state.
  const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'RATE_LIMITED',
      message: 'Espera un momento antes de solicitar otro correo.'
    }
  });

  app.post('/api/auth/request-password-reset', passwordResetLimiter, async (req, res) => {
    const { email } = req.body || {};
    const result = await authService.requestPasswordReset(email);
    res.json(result);
  });

  // Single exact-match lookup, never a partial/listing search - see
  // profilesService.isUsernameAvailable. Rate-limited the same as login:
  // this is also the endpoint an attacker would hammer to enumerate
  // registered usernames one guess at a time.
  const usernameAvailableLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      error: 'TOO_MANY_ATTEMPTS',
      message: 'Has realizado varios intentos. Espera un momento y vuelve a intentarlo.'
    }
  });

  app.get('/api/auth/username-available', usernameAvailableLimiter, async (req, res) => {
    const raw = String(req.query.u || '');
    const formatCheck = profilesService.validateUsernameFormat(raw);
    if (!formatCheck.valid) {
      return res
        .status(400)
        .json({ ok: false, error: 'INVALID_USERNAME', message: formatCheck.message });
    }

    const normalizedUsername = profilesService.normalizeUsername(raw);
    try {
      const available = await profilesService.isUsernameAvailable(normalizedUsername);
      return res.json({ ok: true, available, normalizedUsername });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: 'USERNAME_CHECK_FAILED',
        message: 'No se pudo comprobar la disponibilidad del nombre de usuario.'
      });
    }
  });

  // Public, safe-to-expose values (Supabase's anon key is designed for
  // browser use, distinct from and far less privileged than the service
  // role key, which never leaves this server). Requesting the reset email
  // (POST /api/auth/request-password-reset below) stays backend-mediated
  // like everything else in this app; only the /reset-password page itself
  // uses these to load supabase-js directly, because the recovery token
  // Supabase appends to the redirect URL arrives as a fragment/query the
  // browser reads client-side - our backend never sees it.
  app.get('/api/auth/client-config', (_req, res) => {
    res.json({
      ok: true,
      supabaseUrl: config.supabaseUrl || null,
      supabaseAnonKey: config.supabaseAnonKey || null
    });
  });

  // TOTP MFA ("Seguridad de la cuenta" -> "Verificación en dos pasos").
  // Every route here forwards the caller's own access token to
  // mfaService (never the service-role client) so Supabase enforces these
  // as "acting as this specific user" calls, same as the rest of Supabase's
  // MFA API expects. No phone/SMS/WhatsApp factor routes exist yet - see
  // PHONE_AUTH_ENABLED in lib/config.js.
  function mfaErrorResponse(res, error) {
    const status = error.status && error.status >= 400 ? error.status : 500;
    res.status(status).json({
      ok: false,
      error: error.code || 'MFA_ERROR',
      message: error.message || 'No se pudo completar la operación de seguridad.'
    });
  }

  app.post('/api/mfa/totp/enroll', requireAuth, async (req, res) => {
    try {
      const result = await mfaService.enrollTotp(getBearerToken(req));
      res.json({ ok: true, ...result });
    } catch (error) {
      mfaErrorResponse(res, error);
    }
  });

  app.post('/api/mfa/totp/challenge', requireAuth, async (req, res) => {
    try {
      const { factorId } = req.body || {};
      const result = await mfaService.challengeFactor(getBearerToken(req), factorId);
      res.json({ ok: true, ...result });
    } catch (error) {
      mfaErrorResponse(res, error);
    }
  });

  app.post('/api/mfa/totp/verify', requireAuth, async (req, res) => {
    try {
      const { factorId, challengeId, code } = req.body || {};
      const result = await mfaService.verifyFactor(getBearerToken(req), {
        factorId,
        challengeId,
        code
      });
      res.json(result);
    } catch (error) {
      mfaErrorResponse(res, error);
    }
  });

  app.get('/api/mfa/factors', requireAuth, async (req, res) => {
    try {
      const result = await mfaService.listFactors(getBearerToken(req));
      res.json({ ok: true, ...result });
    } catch (error) {
      mfaErrorResponse(res, error);
    }
  });

  app.post('/api/mfa/totp/unenroll', requireAuth, async (req, res) => {
    try {
      const { factorId } = req.body || {};
      const result = await mfaService.unenrollFactor(getBearerToken(req), factorId);
      res.json(result);
    } catch (error) {
      mfaErrorResponse(res, error);
    }
  });

  // Used by the frontend right after password login and again on reload -
  // "no mostrar la aplicación hasta completar aal2" for accounts with a
  // verified factor.
  app.get('/api/mfa/assurance-level', requireAuth, async (req, res) => {
    try {
      const result = await mfaService.getAssuranceLevel(getBearerToken(req));
      res.json({ ok: true, ...result });
    } catch (error) {
      mfaErrorResponse(res, error);
    }
  });

  app.get('/api/lessons', attachUserIfPresent, async (req, res) => {
    try {
      const level = String(req.query.level || 'A1').toUpperCase();
      const language = String(req.query.language || 'english').toLowerCase();

      // English A1 lives in the normalized courses schema; every other
      // language/level still reads from the legacy content_json table.
      const normalizedLessons = await courseLessonsService.getLessons({
        languageCode: language,
        levelCode: level,
        userId: req.user?.id
      });
      if (normalizedLessons) {
        res.json({ lessons: normalizedLessons, source: 'courses' });
        return;
      }

      const lessons = await lessonsService.getLessons({ level, language, userId: req.user?.id });
      res.json({ lessons, source: 'legacy' });
    } catch (error) {
      res.status(500).json({ error: 'No se pudieron cargar las lecciones.' });
    }
  });

  app.get('/api/music/tracks', requireAuth, async (_req, res) => {
    try {
      const tracks = await musicService.listPublishedTracks();
      res.json({ tracks });
    } catch (error) {
      console.error('Could not load Music tracks', error.message);
      res.status(500).json({ error: 'No se pudo cargar la biblioteca de Music.' });
    }
  });

  const supportsTestSelection = (language, level) => {
    const allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    return ['english', 'french', 'spanish', 'italian', 'portuguese', 'german'].includes(language) &&
      allLevels.includes(level);
  };

  app.get('/api/tests', (req, res) => {
    const language = String(req.query.language || 'english').toLowerCase();
    const level = String(req.query.level || 'A1').toUpperCase();
    if (!supportsTestSelection(language, level)) {
      res.status(400).json({ error: 'Idioma o nivel de examen no válido.' });
      return;
    }
    const units = seedUnits
      .filter((unit) => unit.target_language === language && unit.level === level)
      .sort((a, b) => a.order_index - b.order_index)
      .map((unit) => {
        const questions = buildLanguageLessonTest(language, level, unit.slug);
        const grammarLesson = seedLessons.find(
          (row) =>
            row.target_language === language &&
            row.level === level &&
            row.unit_slug === unit.slug &&
            row.skill === 'grammar'
        );
        const grammarTitle =
          grammarLesson?.content_json?.extra?.grammarProfile?.name ||
          grammarLesson?.content_json?.grammarProfile?.name ||
          grammarLesson?.content_json?.title ||
          grammarLesson?.title ||
          unit.title;
        const grammarExamples = buildGrammarTestExamples(grammarLesson, grammarTitle, language);
        return {
          id: unit.slug,
          order: unit.order_index,
          title: unit.title,
          grammarTitle,
          grammarExamples,
          questionCount: questions.length,
          questions: questions.map(({ answer: _answer, ...question }) => question)
        };
      });
    res.json({ language, level, units });
  });

  app.get('/api/tests/answer-key', (req, res) => {
    const language = String(req.query.language || 'english').toLowerCase();
    const level = String(req.query.level || 'A1').toUpperCase();
    const unitSlug = String(req.query.unitSlug || '');
    if (!supportsTestSelection(language, level)) {
      res.status(400).json({ error: 'Idioma o nivel de examen no válido.' });
      return;
    }
    const questions = buildLanguageLessonTest(language, level, unitSlug);
    if (!questions.length) {
      res.status(404).json({ error: 'Examen no encontrado.' });
      return;
    }
    res.json({
      answers: questions.map((question, index) => ({
        number: index + 1,
        letter: String.fromCharCode(97 + question.answer),
        text: question.options[question.answer]
      }))
    });
  });

  app.post('/api/tests/grade', (req, res) => {
    const language = String(req.body?.language || 'english').toLowerCase();
    const level = String(req.body?.level || 'A1').toUpperCase();
    const unitSlug = String(req.body?.unitSlug || '');
    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
    if (!supportsTestSelection(language, level)) {
      res.status(400).json({ error: 'Nivel de examen no válido.' });
      return;
    }
    const questions = buildLanguageLessonTest(language, level, unitSlug);
    if (!questions.length) {
      res.status(404).json({ error: 'Examen no encontrado.' });
      return;
    }
    const submitted = new Map(answers.map((item) => [String(item.questionId), Number(item.answer)]));
    const results = questions.map((question) => ({
      questionId: question.id,
      correct: submitted.get(question.id) === question.answer,
      correctAnswer: question.options[question.answer]
    }));
    const correct = results.filter((item) => item.correct).length;
    res.json({ score: Math.round((correct / questions.length) * 100), correct, total: questions.length, results });
  });

  app.post('/api/tests/check', (req, res) => {
    const language = String(req.body?.language || 'english').toLowerCase();
    const level = String(req.body?.level || 'A1').toUpperCase();
    const unitSlug = String(req.body?.unitSlug || '');
    const questionId = String(req.body?.questionId || '');
    const selectedAnswer = Number(req.body?.answer);
    if (!supportsTestSelection(language, level)) {
      res.status(400).json({ error: 'Nivel de examen no válido.' });
      return;
    }
    const question = buildLanguageLessonTest(language, level, unitSlug).find((item) => item.id === questionId);
    if (!question || !Number.isInteger(selectedAnswer)) {
      res.status(400).json({ error: 'Pregunta o respuesta no válida.' });
      return;
    }
    const correct = selectedAnswer === question.answer;
    res.json({ correct, correctAnswer: question.options[question.answer] });
  });

  app.get('/api/lessons/:slug', attachUserIfPresent, async (req, res) => {
    try {
      const lesson = await courseLessonsService.getLessonDetail({
        slug: req.params.slug,
        userId: req.user?.id
      });
      if (!lesson) {
        res.status(404).json({ error: 'Lesson not found.' });
        return;
      }
      res.json({ lesson });
    } catch (error) {
      res.status(500).json({ error: 'No se pudo cargar la lección.' });
    }
  });

  app.post('/api/lessons/:slug/start', requireAuth, async (req, res) => {
    try {
      const slug = req.params.slug;
      if (!(await courseLessonsService.hasLesson(slug))) {
        res.status(404).json({ error: 'Lesson not found.' });
        return;
      }
      const result = await courseLessonsService.startLesson({ userId: req.user.id, slug });
      res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo iniciar la lección.' });
    }
  });

  app.post('/api/lessons/:slug/complete', requireAuth, async (req, res) => {
    try {
      const { answers, assessmentScope, assessmentExerciseIds } = req.body || {};
      const safeAnswers = Array.isArray(answers) ? answers : [];
      const safeAssessmentExerciseIds = Array.isArray(assessmentExerciseIds)
        ? assessmentExerciseIds.map(String)
        : [];
      const slug = req.params.slug;

      if (await courseLessonsService.hasLesson(slug)) {
        const result = await courseLessonsService.completeLesson({
          userId: req.user.id,
          slug,
          answers: safeAnswers,
          assessmentScope,
          assessmentExerciseIds: safeAssessmentExerciseIds
        });
        res.json(await withFreshCourseProgress(req.user.id, result));
        return;
      }

      const result = await lessonsService.completeLesson({
        userId: req.user.id,
        slug,
        answers: safeAnswers,
        assessmentScope,
        assessmentExerciseIds: safeAssessmentExerciseIds
      });
      res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo completar la lección.' });
    }
  });

  app.get('/api/verbs/unit-progress', requireAuth, async (req, res) => {
    try {
      const progress = await verbProgressService.getUnitProgress({
        userId: req.user.id,
        languageCode: String(req.query.language || 'english').toLowerCase(),
        levelCode: String(req.query.level || 'A1').toUpperCase()
      });
      res.json({ progress });
    } catch (error) {
      res.status(500).json({ error: 'No se pudo cargar el progreso de Verbos.' });
    }
  });

  app.post('/api/verbs/unit-progress', requireAuth, async (req, res) => {
    try {
      const result = await verbProgressService.saveUnitAttempt({
        userId: req.user.id,
        languageCode: String(req.body?.language || 'english').toLowerCase(),
        levelCode: String(req.body?.level || 'A1').toUpperCase(),
        unitSlug: String(req.body?.unitSlug || ''),
        score: req.body?.score
      });
      res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo guardar el progreso de Verbos.' });
    }
  });

  // "Historial de intentos" for a scored Grammar test (spec §4) - read-only,
  // scoped to the signed-in user's own attempts on this one lesson. Never
  // exposes another user's data (courseLessonsService.getGrammarTestHistory
  // always filters by req.user.id).
  app.get('/api/lessons/:slug/grammar-test-history', requireAuth, async (req, res) => {
    try {
      const history = await courseLessonsService.getGrammarTestHistory({
        userId: req.user.id,
        slug: req.params.slug
      });
      res.json({ history });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo cargar el historial de intentos.' });
    }
  });

  app.post('/api/lessons/:slug/check-answer', requireAuth, async (req, res) => {
    try {
      const slug = req.params.slug;

      // Fetched once and reused below instead of hasLesson() (a fresh
      // findLessonRowBySlug) followed by checkAnswer() doing that exact same
      // lookup again - this endpoint fires on every single answer click, so
      // that duplicate round trip was adding latency to an already
      // latency-sensitive interaction.
      const normalizedLessonRow = await courseLessonsService.findLessonRowBySlug(slug);
      if (normalizedLessonRow) {
        const { exerciseId, selectedOptionId, index, selectedOption } = req.body || {};
        const result = await courseLessonsService.checkAnswer({
          userId: req.user.id,
          slug,
          exerciseId,
          selectedOptionId,
          exerciseIndex: index,
          selectedOptionIndex: selectedOption,
          lessonRow: normalizedLessonRow
        });
        res.json({
          success: true,
          feedback: result.correct ? '¡Correcto!' : 'Respuesta incorrecta, intenta de nuevo.',
          ...result
        });
        return;
      }

      const { index, selectedOption } = req.body || {};
      const result = await lessonsService.checkAnswer({
        userId: req.user.id,
        slug,
        index,
        selectedOption
      });
      res.json({
        success: true,
        feedback: result.correct ? '¡Correcto!' : 'Respuesta incorrecta, intenta de nuevo.',
        ...result
      });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res
        .status(status)
        .json({ success: false, error: error.message || 'No se pudo verificar la respuesta.' });
    }
  });

  // Dictation is only implemented for the normalized-schema courses (see
  // lesson_dictation_segments, 202607220001_rich_listening_content.sql) -
  // there is no legacy-content_json equivalent, so this always goes through
  // courseLessonsService. The expected transcript is read server-side only;
  // the client submits its attempt and gets back a scored diff, never the
  // answer key itself.
  app.post('/api/lessons/:slug/dictation/check', requireAuth, async (req, res) => {
    try {
      const slug = req.params.slug;
      const { attempts, attemptNumber } = req.body || {};
      const result = await courseLessonsService.checkDictation({
        userId: req.user.id,
        slug,
        attempts: Array.isArray(attempts) ? attempts : [],
        attemptNumber: Number(attemptNumber) || 1
      });
      res.json({ success: true, ...result });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res
        .status(status)
        .json({ success: false, error: error.message || 'No se pudo verificar el dictado.' });
    }
  });

  // Listening's only audio source is public.lesson_audio (see
  // lib/listeningService.js) - no AI-generated/TTS fallback status is ever
  // returned here. Three states reach the frontend (spec §3): 'official'
  // (normal + slow both published), 'partial' (normal only, slow missing -
  // still fully usable, just without a slow-speed variant), 'unavailable'
  // (no published row at all).
  app.get('/api/listening/audio', attachUserIfPresent, async (req, res) => {
    try {
      const language = String(req.query.language || '').toLowerCase();
      const level = String(req.query.level || '').toUpperCase();
      const lessonSlug = String(req.query.lessonSlug || '');
      const lessonIdRaw = String(req.query.lessonId || '');
      // Only a real UUID is ever passed to the course_lesson_id lookup - a
      // malformed value (or the empty string legacy callers still send)
      // falls straight through to the language/level/slug fallback instead
      // of causing a Postgres "invalid input syntax for type uuid" error.
      const lessonId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonIdRaw)
        ? lessonIdRaw
        : null;

      const official = await listeningService.getOfficialAudio(lessonId, language, level, lessonSlug);
      if (official) {
        res.json({
          status: official.slow_file_path ? 'official' : 'partial',
          audio: {
            audioUrl: official.main_file_path,
            slowAudioUrl: official.slow_file_path || null,
            // very_slow_file_path: supabase/migrations/202607220001_rich_listening_content.sql.
            // Null on any lesson_audio row that predates that migration -
            // the player falls back to a client-side playbackRate
            // reduction, same as it already does today when slowAudioUrl
            // itself is absent.
            verySlowAudioUrl: official.very_slow_file_path || null,
            transcript: official.transcript || '',
            duration: official.duration || null,
            title: official.title || ''
          }
        });
        return;
      }

      res.json({ status: 'unavailable' });
    } catch (error) {
      res
        .status(500)
        .json({ status: 'unavailable', error: 'No se pudo consultar el audio de Listening.' });
    }
  });

  // Speaking submissions are processed and discarded in the same request -
  // nothing here writes to disk or to Supabase Storage (see speakingService.js).
  const speakingAnalyzeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      error: 'RATE_LIMITED',
      message: 'Se alcanzó el límite de envíos de Speaking. Intenta de nuevo en unos minutos.'
    }
  });

  function runSpeakingUpload(req, res) {
    return new Promise((resolve, reject) => {
      speakingUpload.single('audio')(req, res, (error) => (error ? reject(error) : resolve()));
    });
  }

  app.post('/api/speaking/analyze', speakingAnalyzeLimiter, async (req, res) => {
    try {
      await runSpeakingUpload(req, res);
      const { language, level, lessonId, expectedPrompt, durationSeconds } = req.body || {};
      const result = await speakingService.analyzeSpeakingSubmission({
        file: req.file,
        language,
        level,
        lessonId,
        expectedPrompt,
        durationSeconds
      });
      res.json(result);
    } catch (error) {
      if (error instanceof multer.MulterError) {
        const tooLarge = error.code === 'LIMIT_FILE_SIZE';
        res.status(tooLarge ? 413 : 400).json({
          ok: false,
          error: error.code,
          message: tooLarge
            ? 'El archivo de audio es demasiado grande.'
            : 'No se pudo procesar el archivo de audio.'
        });
        return;
      }
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({
        ok: false,
        error: error.code || 'SPEAKING_ANALYZE_FAILED',
        message: error.message || 'No se pudo procesar el audio.'
      });
    }
  });

  app.get('/api/progress', requireAuth, async (req, res) => {
    try {
      const progress = await lessonsService.getProgress(req.user.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: 'No se pudo cargar el progreso.' });
    }
  });

  app.get('/api/preferences', requireAuth, async (req, res) => {
    try {
      const preferences = await preferencesService.getPreferences(req.user.id);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ error: 'No se pudieron cargar las preferencias.' });
    }
  });

  app.put('/api/preferences', requireAuth, async (req, res) => {
    try {
      const { language, level, bridgeLanguage } = req.body || {};
      const preferences = await preferencesService.updatePreferences(req.user.id, {
        language,
        level,
        bridgeLanguage
      });
      res.json(preferences);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res
        .status(status)
        .json({ error: error.message || 'No se pudieron guardar las preferencias.' });
    }
  });

  // "Create your username" onboarding for accounts that predate this
  // migration (profiles.username still null) - same validation/availability
  // path as registration, just applied to an already-signed-in account.
  app.post('/api/profile/username', requireAuth, async (req, res) => {
    try {
      const { username } = req.body || {};
      const result = await profilesService.claimUsername(req.user.id, username);
      res.json({ ok: true, username: result.username });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({
        ok: false,
        error: error.code || 'USERNAME_CLAIM_FAILED',
        message: error.message || 'No se pudo guardar el nombre de usuario.'
      });
    }
  });

  app.get('/api/goals', requireAuth, async (req, res) => {
    try {
      const goal = await goalsService.getGoal(req.user.id);
      res.json({ goal });
    } catch (error) {
      res.status(500).json({ error: 'No se pudo cargar el objetivo.' });
    }
  });

  app.post('/api/goals', requireAuth, async (req, res) => {
    try {
      const { goalKey } = req.body || {};
      const goal = await goalsService.upsertGoal(req.user.id, goalKey);
      res.status(201).json({ goal });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo guardar el objetivo.' });
    }
  });

  app.put('/api/goals/:id', requireAuth, async (req, res) => {
    try {
      const { goalKey } = req.body || {};
      const goal = await goalsService.updateGoal(req.user.id, req.params.id, goalKey);
      res.json({ goal });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo actualizar el objetivo.' });
    }
  });

  app.delete('/api/goals/:id', requireAuth, async (req, res) => {
    try {
      const result = await goalsService.deleteGoal(req.user.id, req.params.id);
      res.json(result);
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo eliminar el objetivo.' });
    }
  });

  app.post('/api/goals/:id/complete', requireAuth, async (req, res) => {
    try {
      const goal = await goalsService.completeGoal(req.user.id, req.params.id);
      res.json({ goal });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo completar el objetivo.' });
    }
  });

  app.get('/api/dashboard', requireAuth, async (req, res) => {
    try {
      const dashboard = await dashboardService.getDashboard(req.user.id);
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ error: 'No se pudo cargar tu panel.' });
    }
  });

  // Public plan catalog (Free/Premium today, more later) - drives the home
  // Premium card, the pricing section, and the paywall modal. No auth
  // required; prices/limits/features all come from lib/plansConfig.js via
  // lib/planService.js, never hardcoded in the response or in a caller.
  app.get('/api/plans', async (_req, res) => {
    try {
      const plans = await planService.getActivePlans();
      res.json({ plans });
    } catch (error) {
      res.status(500).json({ error: 'No se pudieron cargar los planes.' });
    }
  });

  app.post('/api/lessons/:slug/check-question', requireAuth, async (req, res) => {
    try {
      const slug = req.params.slug;
      const { questionId, answer } = req.body || {};
      if (!questionId || answer === undefined || answer === null) {
        res.status(400).json({ error: 'Question and answer are required.' });
        return;
      }
      const service = (await courseLessonsService.hasLesson(slug))
        ? courseLessonsService
        : lessonsService;
      const result = await service.checkQuestionBankAnswer({
        userId: req.user.id,
        slug,
        questionId,
        answer
      });
      res.json({ success: true, ...result });
    } catch (error) {
      const status = error.status && error.status >= 400 ? error.status : 500;
      res.status(status).json({ error: error.message || 'No se pudo comprobar la respuesta.' });
    }
  });

  app.get('/api/teacher/curriculum-summary', requireAuth, requireCurriculumStaff, async (_req, res) => {
    try {
      const summary = await curriculumService.getCurriculumSummary();
      res.json(summary);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'No se pudo cargar el resumen curricular.'
      });
    }
  });

  // Paddle's client-side token and price IDs are intentionally public; API
  // keys and webhook secrets never leave the server.
  app.get('/api/billing/config', (req, res) => {
    res.set('Cache-Control', 'private, no-store');
    res.json(
      billingService.getPublicConfig({
        countryCode: req.headers['x-vercel-ip-country']
      })
    );
  });

  // Safe PayPal checkout identifiers only. The server still verifies the
  // subscription and webhook before Premium access is granted.
  app.get('/api/billing/paypal/config', (_req, res) => {
    res.set('Cache-Control', 'private, no-store');
    res.json(paypalBillingService.getPublicConfig());
  });

  app.get('/api/billing/azul/config', (_req, res) => {
    res.set('Cache-Control', 'private, no-store');
    res.json(azulBillingService.getPublicConfig());
  });

  app.get('/api/business-info', (_req, res) => {
    res.set('Cache-Control', 'public, max-age=300');
    res.json(publicBusinessInfo());
  });

  app.post('/api/billing/paypal/checkout', requireAuth, async (req, res) => {
    try {
      const checkout = await paypalBillingService.createCheckout({
        userId: req.user.id,
        billingCycle: String(req.body?.billingCycle || '').toLowerCase()
      });
      res.status(201).json(checkout);
    } catch (error) {
      const status = error.status || 500;
      if (status >= 500) console.error('[paypal-checkout]', error.internalMessage || error.message);
      res.status(status).json({
        error:
          error.code === 'PAYPAL_CONFIGURATION_MISSING'
            ? 'El pago con PayPal todavía no está configurado.'
            : error.message || 'No se pudo iniciar el pago con PayPal.'
      });
    }
  });

  app.post('/api/billing/azul/checkout', requireAuth, async (req, res) => {
    try {
      const checkout = await azulBillingService.createCheckout({
        userId: req.user.id,
        billingCycle: String(req.body?.billingCycle || '').toLowerCase()
      });
      res.status(201).json(checkout);
    } catch (error) {
      if ((error.status || 500) >= 500) console.error('[azul-checkout]', error.message);
      res.status(error.status || 500).json({
        error: error.code === 'AZUL_CONFIGURATION_MISSING'
          ? 'El pago con tarjeta Azul todavía no está configurado.'
          : error.message || 'No se pudo iniciar el pago con Azul.'
      });
    }
  });

  app.get('/api/billing/azul/return', async (req, res) => {
    try {
      if (req.query.result === 'cancelled') return res.redirect('/?payment=cancelled&provider=azul');
      const result = await azulBillingService.handleReturn(req.query);
      res.redirect(`/?payment=${result.approved ? 'approved' : 'declined'}&provider=azul`);
    } catch (error) {
      if ((error.status || 500) >= 500) console.error('[azul-return]', error.message);
      res.redirect('/?payment=error&provider=azul');
    }
  });

  app.get('/api/billing/azul/receipts/:orderNumber', requireAuth, async (req, res) => {
    try {
      res.json(await azulBillingService.getReceipt({ userId: req.user.id, orderNumber: req.params.orderNumber }));
    } catch (error) {
      res.status(error.status || 500).json({ error: error.status ? error.message : 'No se pudo cargar el comprobante.' });
    }
  });

  app.post('/api/billing/paypal/activate', requireAuth, async (req, res) => {
    try {
      const subscriptionId = String(req.body?.subscriptionId || '').trim();
      if (!subscriptionId) {
        return res.status(400).json({ error: 'Falta la suscripción de PayPal.' });
      }
      const result = await paypalBillingService.syncVerifiedSubscription({
        userId: req.user.id,
        subscriptionId
      });
      res.status(201).json({ ok: true, ...result });
    } catch (error) {
      const status = error.status || 500;
      if (status >= 500) console.error('[paypal-activate]', error.internalMessage || error.message);
      res.status(status).json({
        error:
          status >= 500
            ? 'No se pudo confirmar el pago con PayPal.'
            : error.message
      });
    }
  });

  app.post('/api/billing/checkout', requireAuth, async (req, res) => {
    try {
      const result = await billingService.createCheckoutTransaction({
        userId: req.user.id,
        tier: String(req.body?.tier || 'premium').toLowerCase(),
        billingCycle: String(req.body?.billingCycle || '').toLowerCase()
      });
      res.status(201).json(result);
    } catch (error) {
      const status = error.status || 500;
      const configurationMissing = error.code === 'PADDLE_CONFIGURATION_MISSING';
      if (status >= 500) {
        console.error('[paddle-checkout]', error.internalMessage || error.message);
      }
      const providerMessages = {
        transaction_default_checkout_url_not_set:
          'Paddle necesita un Default payment link configurado para andergo.online.',
        transaction_checkout_url_domain_is_not_approved:
          'El dominio andergo.online todavía no está aprobado para Checkout en Paddle.',
        transaction_checkout_not_enabled:
          'Paddle todavía no ha habilitado los cobros Live para esta cuenta.',
        forbidden:
          'La API key de Paddle no tiene permiso Transactions: Write.',
        unauthorized:
          'La API key Live de Paddle no es válida para esta cuenta.'
      };
      res.status(status).json({
        error: configurationMissing
          ? 'El pago Premium está temporalmente en mantenimiento.'
          : error.providerCode && providerMessages[error.providerCode]
            ? providerMessages[error.providerCode]
          : status >= 500
            ? 'No se pudo iniciar el pago con Paddle. Inténtalo nuevamente más tarde.'
            : error.message,
        ...(error.providerCode ? { providerCode: error.providerCode } : {})
      });
    }
  });

  // Coarse locale hint only: Vercel derives the country at the edge and the
  // browser sends its language preferences. The application never receives,
  // returns or stores the visitor's IP address.
  app.get('/api/locale-hint', (req, res) => {
    res.set('Cache-Control', 'private, no-store');
    res.json({
      country: String(req.headers['x-vercel-ip-country'] || '').toUpperCase(),
      acceptLanguage: String(req.headers['accept-language'] || '').slice(0, 160)
    });
  });

  app.post('/api/billing/portal', requireAuth, async (req, res) => {
    try {
      const portal = await billingService.createCustomerPortalSession({
        userId: req.user.id
      });
      res.status(201).json(portal);
    } catch (error) {
      const status = error.status || 500;
      if (status >= 500) {
        console.error('[paddle-portal]', error.internalMessage || error.message);
      }
      res.status(status).json({
        error:
          status >= 500
            ? 'No se pudo abrir la administración segura de tu plan.'
            : error.message
      });
    }
  });

  app.post('/api/billing/pause', requireAuth, async (req, res) => {
    try {
      const result = await billingService.pauseSubscriptionAtPeriodEnd({
        userId: req.user.id
      });
      res.status(200).json(result);
    } catch (error) {
      const status = error.status || 500;
      if (status >= 500) {
        console.error('[paddle-pause]', error.internalMessage || error.message);
      }
      res.status(status).json({
        error:
          status >= 500
            ? 'No se pudo programar la pausa de tu plan.'
            : error.message
      });
    }
  });

  // The signed-in user's current plan, status, renewal/expiry, and this
  // month's Tutor/voice usage - for a "Mi plan" screen and for the paywall
  // modal to show real remaining counts without waiting for a 403.
  app.get('/api/subscription', requireAuth, async (req, res) => {
    try {
      const subscription = await subscriptionService.getSubscriptionSummary(req.user.id);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: 'No se pudo cargar tu suscripción.' });
    }
  });

  // Fallback for unknown API routes.
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found.' });
  });

  return app;
}

if (require.main === module) {
  const app = createServer();
  app.listen(config.port, () => {
    console.log(
      `ANDERGO backend listening on port ${config.port} (Supabase ${config.isSupabaseConfigured ? 'configured' : 'NOT configured - using dev fallback'})`
    );
  });
}

// The pure generator is exported for the curriculum audit. It remains
// server-side only; the public API still strips its answer index.
module.exports = { createServer, createApp: createServer, buildLanguageLessonTest };
