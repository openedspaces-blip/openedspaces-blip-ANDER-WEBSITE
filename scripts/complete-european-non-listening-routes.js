#!/usr/bin/env node
// Completes the non-audio curriculum for Italian, German and Brazilian
// Portuguese. Listening is deliberately excluded: it will be authored and
// published with its final audio assets in a later production pass.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const unitsPath = path.join(ROOT, 'lib', 'seed-units.json');
const lessonsPath = path.join(ROOT, 'lib', 'seed-lessons.json');
const units = require(unitsPath);
const lessons = require(lessonsPath);

const SKILLS = ['reading', 'speaking', 'writing', 'grammar', 'vocabulary'];
const LEVELS = ['B2', 'C1', 'C2'];
const LEVEL_META = {
  B2: { freeUnits: 1, xp: 30, grammar: 'Connettori, congiuntivo, registro e argomentazione.' },
  C1: { freeUnits: 1, xp: 35, grammar: 'Sfumature, coesione, discorso indiretto e registro formale.' },
  C2: { freeUnits: 1, xp: 40, grammar: 'Precisione stilistica, implicito, retorica e riformulazione.' }
};

const packs = {
  italian: {
    label: 'Italiano',
    skillLabels: { reading: 'Lettura', speaking: 'Espressione orale', writing: 'Espressione scritta', grammar: 'Grammatica', vocabulary: 'Vocabolario' },
    themes: {
      B2: [
        ['progetti-e-responsabilita', 'Progetti e responsabilità', 'organizzare un progetto e negoziare le responsabilità', ['scadenza', 'incarico', 'risorsa', 'coordinare', 'valutare'], ['plazo', 'tarea asignada', 'recurso', 'coordinar', 'evaluar']],
        ['citta-e-mobilita', 'Città e mobilità', 'confrontare soluzioni di mobilità urbana', ['percorso', 'traffico', 'abbonamento', 'accessibile', 'ridurre'], ['trayecto', 'tráfico', 'abono', 'accesible', 'reducir']],
        ['lavoro-e-competenze', 'Lavoro e competenze', 'descrivere competenze e prospettive professionali', ['colloquio', 'esperienza', 'candidatura', 'affidabile', 'migliorare'], ['entrevista', 'experiencia', 'candidatura', 'fiable', 'mejorar']],
        ['ambiente-e-consumi', 'Ambiente e consumi', 'argomentare scelte di consumo responsabile', ['impatto', 'raccolta', 'spreco', 'sostenibile', 'abitudine'], ['impacto', 'recogida', 'desperdicio', 'sostenible', 'hábito']],
        ['media-e-informazione', 'Media e informazione', 'valutare fonti e notizie in modo critico', ['fonte', 'notizia', 'verificare', 'affidabilità', 'pregiudizio'], ['fuente', 'noticia', 'verificar', 'fiabilidad', 'sesgo']],
        ['salute-e-benessere', 'Salute e benessere', 'proporre abitudini equilibrate', ['benessere', 'prevenzione', 'riposo', 'equilibrio', 'consiglio'], ['bienestar', 'prevención', 'descanso', 'equilibrio', 'consejo']],
        ['cultura-e-identita', 'Cultura e identità', 'presentare pratiche culturali con rispetto', ['tradizione', 'appartenenza', 'prospettiva', 'valorizzare', 'dialogo'], ['tradición', 'pertenencia', 'perspectiva', 'poner en valor', 'diálogo']],
        ['tecnologia-e-privacy', 'Tecnologia e privacy', 'discutere benefici e rischi digitali', ['dispositivo', 'dati', 'proteggere', 'consenso', 'rischio'], ['dispositivo', 'datos', 'proteger', 'consentimiento', 'riesgo']],
        ['viaggi-consapevoli', 'Viaggi consapevoli', 'raccontare un viaggio e formulare raccomandazioni', ['itinerario', 'alloggio', 'imprevisto', 'consigliare', 'rispettare'], ['itinerario', 'alojamiento', 'imprevisto', 'aconsejar', 'respetar']],
        ['relazioni-e-mediazione', 'Relazioni e mediazione', 'gestire un disaccordo con tatto', ['equivoco', 'ascoltare', 'chiarire', 'accordo', 'mediare'], ['malentendido', 'escuchar', 'aclarar', 'acuerdo', 'mediar']],
        ['cittadinanza-attiva', 'Cittadinanza attiva', 'presentare una proposta per la comunità', ['iniziativa', 'quartiere', 'partecipare', 'proposta', 'beneficio'], ['iniciativa', 'barrio', 'participar', 'propuesta', 'beneficio']],
        ['bilanci-e-prospettive', 'Bilanci e prospettive', 'riflettere sui risultati e definire obiettivi', ['traguardo', 'ostacolo', 'percorso', 'priorità', 'raggiungere'], ['meta', 'obstáculo', 'recorrido', 'prioridad', 'alcanzar']]
      ],
      C1: [
        ['argomentazione-pubblica', 'Argomentazione pubblica', 'costruire un argomento equilibrato', ['tesi', 'obiezione', 'evidenza', 'confutare', 'sfumatura'], ['tesis', 'objeción', 'evidencia', 'refutar', 'matiz']],
        ['innovazione-e-societa', 'Innovazione e società', 'analizzare gli effetti dell’innovazione', ['innovazione', 'accesso', 'divario', 'regolare', 'conseguenza'], ['innovación', 'acceso', 'brecha', 'regular', 'consecuencia']],
        ['etica-e-decisioni', 'Etica e decisioni', 'valutare un dilemma da diverse prospettive', ['dilemma', 'principio', 'responsabilità', 'giustificare', 'equità'], ['dilema', 'principio', 'responsabilidad', 'justificar', 'equidad']],
        ['arte-e-interpretazione', 'Arte e interpretazione', 'interpretare un’opera e difendere una lettura', ['opera', 'linguaggio', 'interpretazione', 'evocare', 'contrasto'], ['obra', 'lenguaje', 'interpretación', 'evocar', 'contraste']],
        ['ricerca-e-metodo', 'Ricerca e metodo', 'presentare una ricerca con rigore', ['ipotesi', 'campione', 'risultato', 'dimostrare', 'limite'], ['hipótesis', 'muestra', 'resultado', 'demostrar', 'límite']],
        ['economia-quotidiana', 'Economia quotidiana', 'spiegare decisioni economiche comuni', ['bilancio', 'risparmio', 'investimento', 'variare', 'sostenere'], ['presupuesto', 'ahorro', 'inversión', 'variar', 'sostener']],
        ['territori-e-memoria', 'Territori e memoria', 'collegare memoria, territorio e cambiamento', ['memoria', 'patrimonio', 'trasformazione', 'preservare', 'radice'], ['memoria', 'patrimonio', 'transformación', 'preservar', 'raíz']],
        ['comunicazione-e-registro', 'Comunicazione e registro', 'adattare il registro a destinatari diversi', ['registro', 'destinatario', 'intenzione', 'formulare', 'implicito'], ['registro', 'destinatario', 'intención', 'formular', 'implícito']],
        ['scienza-e-divulgazione', 'Scienza e divulgazione', 'rendere comprensibile un tema complesso', ['fenomeno', 'evidenza', 'modello', 'divulgare', 'precisione'], ['fenómeno', 'evidencia', 'modelo', 'divulgar', 'precisión']],
        ['conflitto-e-negoziazione', 'Conflitto e negoziazione', 'negoziare una soluzione sostenibile', ['interesse', 'compromesso', 'vincolo', 'conciliare', 'mediazione'], ['interés', 'compromiso', 'restricción', 'conciliar', 'mediación']],
        ['letteratura-e-voce', 'Letteratura e voce', 'riconoscere punto di vista e stile', ['narratore', 'tono', 'metafora', 'suggerire', 'ambiguità'], ['narrador', 'tono', 'metáfora', 'sugerir', 'ambigüedad']],
        ['progetto-personale', 'Progetto personale', 'presentare un progetto con una visione coerente', ['visione', 'strategia', 'risorsa', 'realizzare', 'coerenza'], ['visión', 'estrategia', 'recurso', 'realizar', 'coherencia']]
      ],
      C2: [
        ['linguaggio-e-persuasione', 'Linguaggio e persuasione', 'analizzare strategie persuasive', ['retorica', 'premessa', 'inferenza', 'attenuare', 'persuasivo'], ['retórica', 'premisa', 'inferencia', 'atenuar', 'persuasivo']],
        ['politiche-pubbliche', 'Politiche pubbliche', 'valutare una politica pubblica con criteri espliciti', ['politica', 'impatto', 'criterio', 'attuare', 'monitorare'], ['política', 'impacto', 'criterio', 'aplicar', 'supervisar']],
        ['conoscenza-e-incertezza', 'Conoscenza e incertezza', 'esprimere gradi di certezza e dubbio', ['ipotesi', 'probabilità', 'evidenza', 'presumere', 'cautela'], ['hipótesis', 'probabilidad', 'evidencia', 'presumir', 'cautela']],
        ['narrazione-e-identita', 'Narrazione e identità', 'valutare come una narrazione costruisce identità', ['narrazione', 'memoria', 'voce', 'rielaborare', 'appartenenza'], ['narración', 'memoria', 'voz', 'reelaborar', 'pertenencia']],
        ['diritto-e-responsabilita', 'Diritto e responsabilità', 'discutere responsabilità individuale e collettiva', ['diritto', 'dovere', 'principio', 'tutelare', 'responsabilità'], ['derecho', 'deber', 'principio', 'proteger', 'responsabilidad']],
        ['economia-e-disuguaglianza', 'Economia e disuguaglianza', 'interpretare dati e disuguaglianze', ['disuguaglianza', 'reddito', 'indicatore', 'distribuire', 'intervenire'], ['desigualdad', 'ingreso', 'indicador', 'distribuir', 'intervenir']],
        ['ambiente-e-futuro', 'Ambiente e futuro', 'argomentare scenari ambientali complessi', ['scenario', 'risorsa', 'mitigare', 'adattamento', 'interdipendenza'], ['escenario', 'recurso', 'mitigar', 'adaptación', 'interdependencia']],
        ['media-e-discorso', 'Media e discorso', 'analizzare il discorso pubblico nei media', ['cornice', 'narrazione', 'selezionare', 'visibilità', 'interpretare'], ['marco', 'narrativa', 'seleccionar', 'visibilidad', 'interpretar']],
        ['scienza-e-responsabilita', 'Scienza e responsabilità', 'comunicare limiti e implicazioni della ricerca', ['metodo', 'limite', 'replicare', 'implicazione', 'rigore'], ['método', 'límite', 'replicar', 'implicación', 'rigor']],
        ['filosofia-quotidiana', 'Filosofia quotidiana', 'esaminare una domanda astratta con esempi', ['concetto', 'paradosso', 'argomentare', 'premessa', 'coerente'], ['concepto', 'paradoja', 'argumentar', 'premisa', 'coherente']],
        ['mediazione-interculturale', 'Mediazione interculturale', 'mediare tra prospettive culturali differenti', ['mediazione', 'contesto', 'equivoco', 'riconoscere', 'reciprocità'], ['mediación', 'contexto', 'malentendido', 'reconocer', 'reciprocidad']],
        ['sintesi-e-proposta', 'Sintesi e proposta', 'sintetizzare fonti e formulare una proposta', ['sintesi', 'fonte', 'priorità', 'formulare', 'realizzabile'], ['síntesis', 'fuente', 'prioridad', 'formular', 'realizable']]
      ]
    }
  },
  portuguese: { label: 'Português (Brasil)', skillLabels: { reading: 'Leitura', speaking: 'Expressão oral', writing: 'Expressão escrita', grammar: 'Gramática', vocabulary: 'Vocabulário' } },
  german: { label: 'Deutsch', skillLabels: { reading: 'Lesen', speaking: 'Mündlicher Ausdruck', writing: 'Schriftlicher Ausdruck', grammar: 'Grammatik', vocabulary: 'Wortschatz' } }
};

// Portuguese and German follow the same CEFR sequence with target-language
// titles generated from their existing route vocabulary. The educational
// payload stays in L2; Spanish appears only as the requested L1 gloss.
const localized = {
  portuguese: {
    B2: ['Projetos e responsabilidades', 'Cidade e mobilidade', 'Trabalho e competências', 'Ambiente e consumo', 'Mídia e informação', 'Saúde e bem-estar', 'Cultura e identidade', 'Tecnologia e privacidade', 'Viagens conscientes', 'Relações e mediação', 'Cidadania ativa', 'Balanços e perspectivas'],
    C1: ['Argumentação pública', 'Inovação e sociedade', 'Ética e decisões', 'Arte e interpretação', 'Pesquisa e método', 'Economia cotidiana', 'Territórios e memória', 'Comunicação e registro', 'Ciência e divulgação', 'Conflito e negociação', 'Literatura e voz', 'Projeto pessoal'],
    C2: ['Linguagem e persuasão', 'Políticas públicas', 'Conhecimento e incerteza', 'Narrativa e identidade', 'Direito e responsabilidade', 'Economia e desigualdade', 'Ambiente e futuro', 'Mídia e discurso', 'Ciência e responsabilidade', 'Filosofia cotidiana', 'Mediação intercultural', 'Síntese e proposta']
  },
  german: {
    B2: ['Projekte und Verantwortung', 'Stadt und Mobilität', 'Arbeit und Kompetenzen', 'Umwelt und Konsum', 'Medien und Information', 'Gesundheit und Wohlbefinden', 'Kultur und Identität', 'Technik und Datenschutz', 'Bewusst reisen', 'Beziehungen und Vermittlung', 'Aktive Bürgerschaft', 'Bilanz und Perspektiven'],
    C1: ['Öffentliche Argumentation', 'Innovation und Gesellschaft', 'Ethik und Entscheidungen', 'Kunst und Interpretation', 'Forschung und Methode', 'Alltagsökonomie', 'Orte und Erinnerung', 'Kommunikation und Register', 'Wissenschaft und Vermittlung', 'Konflikt und Verhandlung', 'Literatur und Stimme', 'Persönliches Projekt'],
    C2: ['Sprache und Überzeugung', 'Öffentliche Politik', 'Wissen und Unsicherheit', 'Erzählung und Identität', 'Recht und Verantwortung', 'Ökonomie und Ungleichheit', 'Umwelt und Zukunft', 'Medien und Diskurs', 'Wissenschaft und Verantwortung', 'Alltagsphilosophie', 'Interkulturelle Vermittlung', 'Synthese und Vorschlag']
  }
};

/* Portuguese and German previously inherited the Italian word list for every
   upper-level unit. Titles were translated, but learners then encountered
   Italian vocabulary inside Portuguese and German routes. Keep the shared
   CEFR sequence while authoring the lexical layer in the target language. */
const nativeVocabulary = {
  portuguese: {
    B2: [
      'prazo|tarefa|recurso|coordenar|avaliar', 'trajeto|trânsito|passe|acessível|reduzir',
      'entrevista|experiência|candidatura|confiável|aperfeiçoar', 'impacto|coleta|desperdício|sustentável|hábito',
      'fonte|notícia|verificar|credibilidade|viés', 'bem-estar|prevenção|descanso|equilíbrio|conselho',
      'tradição|pertencimento|perspectiva|valorizar|diálogo', 'dispositivo|dados|proteger|consentimento|risco',
      'roteiro|hospedagem|imprevisto|recomendar|respeitar', 'mal-entendido|escutar|esclarecer|acordo|mediar',
      'iniciativa|bairro|participar|proposta|benefício', 'meta|obstáculo|trajetória|prioridade|alcançar'
    ],
    C1: [
      'tese|objeção|evidência|refutar|nuance', 'inovação|acesso|desigualdade|regular|consequência',
      'dilema|princípio|responsabilidade|justificar|equidade', 'obra|linguagem|interpretação|evocar|contraste',
      'hipótese|amostra|resultado|demonstrar|limite', 'orçamento|poupança|investimento|variar|sustentar',
      'memória|patrimônio|transformação|preservar|raiz', 'registro|destinatário|intenção|formular|implícito',
      'fenômeno|evidência|modelo|divulgar|precisão', 'interesse|compromisso|restrição|conciliar|mediação',
      'narrador|tom|metáfora|sugerir|ambiguidade', 'visão|estratégia|recurso|realizar|coerência'
    ],
    C2: [
      'retórica|premissa|inferência|atenuar|persuasivo', 'política|impacto|critério|implementar|monitorar',
      'hipótese|probabilidade|evidência|presumir|cautela', 'narrativa|memória|voz|reelaborar|pertencimento',
      'direito|dever|princípio|resguardar|responsabilidade', 'desigualdade|renda|indicador|distribuir|intervir',
      'cenário|recurso|mitigar|adaptação|interdependência', 'enquadramento|narrativa|selecionar|visibilidade|interpretar',
      'método|limite|replicar|implicação|rigor', 'conceito|paradoxo|argumentar|premissa|coerente',
      'mediação|contexto|mal-entendido|reconhecer|reciprocidade', 'síntese|fonte|prioridade|formular|viável'
    ]
  },
  german: {
    B2: [
      'Frist|Aufgabe|Ressource|koordinieren|bewerten', 'Strecke|Verkehr|Fahrkarte|barrierefrei|verringern',
      'Vorstellungsgespräch|Erfahrung|Bewerbung|zuverlässig|verbessern', 'Auswirkung|Sammlung|Verschwendung|nachhaltig|Gewohnheit',
      'Quelle|Nachricht|überprüfen|Glaubwürdigkeit|Vorurteil', 'Wohlbefinden|Prävention|Erholung|Gleichgewicht|Ratschlag',
      'Tradition|Zugehörigkeit|Perspektive|würdigen|Dialog', 'Gerät|Daten|schützen|Einwilligung|Risiko',
      'Reiseplan|Unterkunft|Zwischenfall|empfehlen|respektieren', 'Missverständnis|zuhören|klären|Vereinbarung|vermitteln',
      'Initiative|Stadtteil|teilnehmen|Vorschlag|Vorteil', 'Ziel|Hindernis|Weg|Priorität|erreichen'
    ],
    C1: [
      'These|Einwand|Beleg|widerlegen|Nuance', 'Innovation|Zugang|Kluft|regulieren|Folge',
      'Dilemma|Grundsatz|Verantwortung|begründen|Gerechtigkeit', 'Werk|Sprache|Deutung|hervorrufen|Kontrast',
      'Hypothese|Stichprobe|Ergebnis|belegen|Grenze', 'Haushalt|Ersparnis|Investition|schwanken|tragen',
      'Erinnerung|Kulturerbe|Wandel|bewahren|Wurzel', 'Register|Adressat|Absicht|formulieren|implizit',
      'Phänomen|Beleg|Modell|vermitteln|Genauigkeit', 'Interesse|Kompromiss|Vorgabe|vereinbaren|Vermittlung',
      'Erzähler|Ton|Metapher|andeuten|Mehrdeutigkeit', 'Vision|Strategie|Ressource|verwirklichen|Stimmigkeit'
    ],
    C2: [
      'Rhetorik|Prämisse|Schlussfolgerung|abschwächen|überzeugend', 'Politik|Auswirkung|Kriterium|umsetzen|beobachten',
      'Hypothese|Wahrscheinlichkeit|Beleg|annehmen|Vorsicht', 'Erzählung|Erinnerung|Stimme|neu deuten|Zugehörigkeit',
      'Recht|Pflicht|Grundsatz|schützen|Verantwortung', 'Ungleichheit|Einkommen|Indikator|verteilen|eingreifen',
      'Szenario|Ressource|abmildern|Anpassung|Wechselwirkung', 'Rahmen|Erzählung|auswählen|Sichtbarkeit|deuten',
      'Methode|Grenze|replizieren|Folgerung|Strenge', 'Begriff|Paradox|argumentieren|Prämisse|stimmig',
      'Vermittlung|Kontext|Missverständnis|anerkennen|Gegenseitigkeit', 'Synthese|Quelle|Priorität|formulieren|umsetzbar'
    ]
  }
};

function slugify(value) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function localizedTheme(language, level, index) {
  if (language === 'italian') return packs.italian.themes[level][index];
  const italian = packs.italian.themes[level][index];
  const title = localized[language][level][index];
  const verb = language === 'german' ? ['erläutern', 'vergleichen', 'bewerten', 'begründen', 'zusammenfassen'][index % 5] : ['explicar', 'comparar', 'avaliar', 'justificar', 'resumir'][index % 5];
  const objective = language === 'german'
    ? `${verb} ein Thema mit klaren Argumenten`
    : `${verb} um tema com argumentos claros`;
  return [`${level.toLowerCase()}-${slugify(title)}`, title, objective, nativeVocabulary[language][level][index].split('|'), italian[4]];
}
function l2(language, variants) { return variants[language]; }
function grammarInL2(language, level) {
  const profiles = {
    italian: {
      B2: 'Connettori, congiuntivo, registro e argomentazione.',
      C1: 'Sfumature, coesione, discorso indiretto e registro formale.',
      C2: 'Precisione stilistica, implicito, retorica e riformulazione.'
    },
    portuguese: {
      B2: 'Conectores, subjuntivo, registro e argumentação.',
      C1: 'Nuances, coesão, discurso indireto e registro formal.',
      C2: 'Precisão estilística, implícito, retórica e reformulação.'
    },
    german: {
      B2: 'Konnektoren, Konjunktiv, Register und Argumentation.',
      C1: 'Nuancen, Kohärenz, indirekte Rede und formelles Register.',
      C2: 'Stilistische Präzision, Implizites, Rhetorik und Umformulierung.'
    }
  };
  return profiles[language][level];
}
function lessonFor(language, level, unit, order, skill) {
  const [slug, title, objective, words, translations] = unit;
  const meta = LEVEL_META[level];
  const unitNumber = Math.floor(order / 10);
  const isFree = unitNumber <= meta.freeUnits;
  const prompts = {
    italian: { reading: 'Leggi il testo e individua tesi, argomenti ed esempio.', speaking: `Esponi per un minuto: ${objective}.`, writing: `Scrivi 120–160 parole per ${objective}.`, grammar: `Scegli la formulazione più precisa per esprimere ${words[0]}.`, vocabulary: `Quale parola corrisponde a “${translations[0]}”?`, text: `Nel modulo «${title}», il gruppo esamina ${words[0]} e ${words[1]}. Ogni partecipante porta un esempio concreto, confronta le prospettive e giustifica la propria posizione. La discussione non cerca una risposta unica: mette in relazione conseguenze, limiti e possibili soluzioni.\n\nAlla fine, il gruppo formula una sintesi condivisa. La proposta deve essere chiara, realizzabile e rispettosa dei diversi punti di vista.` },
    portuguese: { reading: 'Leia o texto e identifique tese, argumentos e exemplo.', speaking: `Fale por um minuto: ${objective}.`, writing: `Escreva 120–160 palavras para ${objective}.`, grammar: `Escolha a formulação mais precisa para expressar ${words[0]}.`, vocabulary: `Qual palavra corresponde a “${translations[0]}”?`, text: `No módulo «${title}», o grupo analisa ${words[0]} e ${words[1]}. Cada participante traz um exemplo concreto, compara perspectivas e justifica sua posição. A discussão não procura uma única resposta: relaciona consequências, limites e soluções possíveis.\n\nNo final, o grupo formula uma síntese compartilhada. A proposta deve ser clara, viável e respeitosa com diferentes pontos de vista.` },
    german: { reading: 'Lies den Text und erkenne These, Argumente und Beispiel.', speaking: `Sprich eine Minute lang: ${objective}.`, writing: `Schreibe 120–160 Wörter, um ${objective}.`, grammar: `Wähle die präziseste Formulierung zu ${words[0]}.`, vocabulary: `Welches Wort bedeutet „${translations[0]}“?`, text: `Im Modul «${title}» untersucht die Gruppe ${words[0]} und ${words[1]}. Jede Person bringt ein konkretes Beispiel ein, vergleicht Perspektiven und begründet die eigene Position. Die Diskussion sucht keine einzige Antwort, sondern verbindet Folgen, Grenzen und mögliche Lösungen.\n\nAm Ende formuliert die Gruppe eine gemeinsame Zusammenfassung. Der Vorschlag soll klar, umsetzbar und gegenüber verschiedenen Sichtweisen respektvoll sein.` }
  }[language];
  const vocabulary = words.map((word, index) => ({ word, translation: translations[index], example: l2(language, { italian: `La discussione chiarisce il ruolo di ${word}.`, portuguese: `A discussão esclarece o papel de ${word}.`, german: `Die Diskussion klärt die Rolle von ${word}.` }) }));
  const titleWithSkill = `${title} · ${packs[language].skillLabels[skill]}`;
  const content = {
    language: packs[language].label, language_key: language, level_title: `${packs[language].label} ${level}`,
    intro: objective, mission: objective, grammar: grammarInL2(language, level), phrases: words.slice(0, 3), vocabulary,
    xp_reward: meta.xp,
    access_policy: { free_lessons_per_level: 1, is_free_preview: isFree, premium_price_usd: 4.99, premium_label: 'Premium desbloquea la ruta completa' },
    extra: { grammarProfile: { name: title, definition: grammarInL2(language, level), function: objective, examples: [] } }
  };
  if (skill === 'reading') {
    content.reading = { text: prompts.text, questions: [prompts.reading] };
    content.exercises = [
      { type: 'mcq', prompt: prompts.reading, options: [words[0], words[2], words[3], words[4]], answer: 0 },
      { type: 'mcq', prompt: l2(language, { italian: 'Qual è lo scopo della sintesi finale?', portuguese: 'Qual é o objetivo da síntese final?', german: 'Was ist das Ziel der abschließenden Zusammenfassung?' }), options: l2(language, { italian: ['Collegare prospettive e formulare una proposta', 'Ripetere tutte le parole nuove', 'Evitare ogni confronto', 'Scegliere senza motivazione'], portuguese: ['Relacionar perspectivas e formular uma proposta', 'Repetir todas as palavras novas', 'Evitar qualquer comparação', 'Escolher sem justificativa'], german: ['Perspektiven verbinden und einen Vorschlag formulieren', 'Alle neuen Wörter wiederholen', 'Jeden Vergleich vermeiden', 'Ohne Begründung wählen'] }), answer: 0 }
    ];
  } else if (skill === 'speaking' || skill === 'writing') {
    const prompt = skill === 'speaking' ? prompts.speaking : prompts.writing;
    content.dialogue = skill === 'speaking' ? [{ speaker: 'Tutor', line: prompt }, { speaker: 'Student', line: l2(language, { italian: 'Secondo me, è importante considerare più prospettive.', portuguese: 'Na minha opinião, é importante considerar mais de uma perspectiva.', german: 'Meiner Meinung nach ist es wichtig, mehrere Perspektiven zu berücksichtigen.' }) }] : [];
    content.assignment = skill === 'writing' ? prompt : undefined;
    content.criteria = [l2(language, { italian: 'argomentazione chiara', portuguese: 'argumentação clara', german: 'klare Argumentation' }), l2(language, { italian: 'registro adeguato', portuguese: 'registro adequado', german: 'angemessenes Register' })];
    content.exercises = [{ type: 'practice', prompt }];
  } else if (skill === 'grammar') {
    content.exercises = words.map((word, index) => ({ type: 'mcq', prompt: `${prompts.grammar} (${index + 1})`, options: [word, words[(index + 1) % words.length], words[(index + 2) % words.length], words[(index + 3) % words.length]], answer: 0 }));
  } else {
    content.exercises = words.map((word, index) => ({ type: 'mcq', prompt: index === 0 ? prompts.vocabulary : l2(language, { italian: `Seleziona «${word}».`, portuguese: `Selecione «${word}».`, german: `Wähle „${word}“.` }), options: [word, words[(index + 1) % words.length], words[(index + 2) % words.length], words[(index + 3) % words.length]], answer: 0 }));
  }
  return { slug: `${language}-${level.toLowerCase()}-${slug}-${skill}`, target_language: language, level, skill, unit_slug: slug, title: titleWithSkill, description: objective, order_index: order, estimated_minutes: skill === 'writing' ? 20 : 15, is_free: isFree, access_tier: isFree ? 'free' : 'premium', payment_price_usd: 4.99, content_json: content };
}

for (const language of Object.keys(packs)) {
  for (const level of LEVELS) {
    // Supersede flat prototype entries only for the non-audio skills being rebuilt.
    for (let i = lessons.length - 1; i >= 0; i -= 1) {
      const row = lessons[i];
      if (row.target_language === language && row.level === level && SKILLS.includes(row.skill) && !row.unit_slug) lessons.splice(i, 1);
    }
    for (let index = 0; index < 12; index += 1) {
      const unit = localizedTheme(language, level, index);
      const [slug, title, objective, words, translations] = unit;
      const unitIndex = units.findIndex((row) => row.target_language === language && row.level === level && row.slug === slug);
      const unitRow = { slug, target_language: language, level, title, title_es: objective, description: objective, order_index: index + 1, unit_overview: { objective, outcomes: [objective, 'comprender argumentos', 'usar vocabulario específico', 'expresar una propuesta propia'], grammar: [grammarInL2(language, level)], vocabulary: words, scenario: title } };
      if (unitIndex >= 0) units[unitIndex] = unitRow; else units.push(unitRow);
      SKILLS.forEach((skill, skillIndex) => {
        const lesson = lessonFor(language, level, [slug, title, objective, words, translations], (index + 1) * 10 + skillIndex, skill);
        const existingIndex = lessons.findIndex((row) => row.slug === lesson.slug);
        if (existingIndex >= 0) lessons[existingIndex] = lesson; else lessons.push(lesson);
      });
    }
  }
}

fs.writeFileSync(unitsPath, `${JSON.stringify(units, null, 2)}\n`, 'utf8');
fs.writeFileSync(lessonsPath, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
console.log('Completed B2-C2 non-listening routes for Italian, Portuguese and German.');
