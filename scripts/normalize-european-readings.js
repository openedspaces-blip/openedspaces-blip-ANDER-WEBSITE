#!/usr/bin/env node
// Gives every Italian, Portuguese and German A1-B1 Reading a CEFR-appropriate
// length and five comprehension checks. Run before sync-worlds-from-seed.js.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const lessons = require(file);
const ranges = { A1: [120, 150], A2: [180, 250], B1: [300, 380] };

const copy = {
  italian: {
    A1: (title, words) => `Oggi Sofia vive una piccola esperienza legata a ${title}. Incontra Marco nel suo quartiere e gli parla con calma. Marco ascolta, sorride e fa una domanda semplice. Sofia risponde con parole chiare, perché vuole capire bene la situazione. Insieme osservano il luogo, salutano le persone e scelgono una piccola attività per il pomeriggio. Non tutto è nuovo: alcune cose sono familiari, ma altre invitano a fare domande. Alla fine Sofia racconta a Marco che imparare una lingua significa anche partecipare alla vita quotidiana. Marco è d'accordo e propone di ripetere l'esperienza domani.`,
    A2: (title, words) => `La settimana scorsa Sofia ha partecipato a un'attività chiamata ${title}. All'inizio non conosceva bene il programma, quindi ha chiesto informazioni e ha ascoltato le persone del quartiere. Marco è arrivato più tardi, ma ha portato una buona idea. I due hanno confrontato le loro esperienze e hanno deciso di collaborare. Durante l'attività hanno notato che le soluzioni più semplici spesso aiutano molte persone. Sofia ha spiegato che vuole continuare a imparare, perché una città si capisce meglio quando si osservano le abitudini di chi ci vive. Alla fine hanno scritto un breve messaggio per ringraziare il gruppo e hanno programmato un nuovo incontro per la settimana seguente.`,
    B1: (title, words) => `Nel quartiere di Sofia, il tema “${title}” è diventato importante dopo una riunione aperta. Alcuni abitanti pensavano che il problema dovesse essere risolto soltanto dalle istituzioni; altri sostenevano che anche i cittadini potessero contribuire con azioni concrete. Sofia ha ascoltato entrambe le posizioni e ha osservato che una proposta utile deve essere realistica, non soltanto interessante. Marco ha raccontato un'esperienza personale: in passato aveva partecipato a un progetto simile e aveva capito che la comunicazione regolare evita molti malintesi. Il gruppo ha quindi diviso i compiti, ha fissato una scadenza e ha scelto un modo semplice per informare il vicinato. Non tutti erano d'accordo su ogni dettaglio, tuttavia hanno accettato di valutare i risultati dopo un mese. Sofia ritiene che questa decisione sia equilibrata, perché permette di agire subito e di correggere il progetto con calma. Alla fine della riunione, le persone hanno lasciato la sala con responsabilità diverse, ma con un obiettivo comune: migliorare la vita quotidiana senza escludere nessuno.`
  },
  portuguese: {
    A1: (title) => `Hoje Luana vive uma pequena experiência ligada a ${title}. Ela encontra Rafael no bairro e fala com calma. Rafael escuta, sorri e faz uma pergunta simples. Luana responde com palavras claras porque quer entender bem a situação. Juntos, eles observam o lugar, cumprimentam as pessoas e escolhem uma atividade para a tarde. Algumas coisas são conhecidas, mas outras convidam a fazer perguntas. No final, Luana conta a Rafael que aprender uma língua também significa participar da vida cotidiana. Rafael concorda e propõe repetir a experiência amanhã.`,
    A2: (title) => `Na semana passada, Luana participou de uma atividade chamada ${title}. No começo, ela não conhecia bem o programa, então pediu informações e ouviu as pessoas do bairro. Rafael chegou mais tarde, mas trouxe uma boa ideia. Os dois compararam suas experiências e decidiram colaborar. Durante a atividade, perceberam que soluções simples podem ajudar muitas pessoas. Luana explicou que quer continuar aprendendo, pois uma cidade é melhor compreendida quando observamos os hábitos de quem mora nela. No final, escreveram uma mensagem curta para agradecer ao grupo e marcaram um novo encontro para a semana seguinte.`,
    B1: (title) => `No bairro de Luana, o tema “${title}” tornou-se importante depois de uma reunião aberta. Alguns moradores pensavam que o problema deveria ser resolvido apenas pelas instituições; outros defendiam que os cidadãos também podiam contribuir com ações concretas. Luana ouviu as duas posições e observou que uma proposta útil precisa ser realista, e não apenas interessante. Rafael contou uma experiência pessoal: no passado, participou de um projeto parecido e percebeu que a comunicação regular evita muitos mal-entendidos. Por isso, o grupo dividiu as tarefas, definiu um prazo e escolheu uma maneira simples de informar a vizinhança. Nem todos concordaram com cada detalhe; mesmo assim, aceitaram avaliar os resultados depois de um mês. Luana considera essa decisão equilibrada, porque permite agir agora e corrigir o projeto com calma. Ao final da reunião, as pessoas saíram com responsabilidades diferentes, mas com um objetivo comum: melhorar a vida cotidiana sem deixar ninguém de fora.`
  },
  german: {
    A1: (title) => `Heute erlebt Anna etwas zum Thema ${title}. Sie trifft Leon in ihrem Viertel und spricht langsam mit ihm. Leon hört zu, lächelt und stellt eine einfache Frage. Anna antwortet mit klaren Wörtern, denn sie möchte die Situation gut verstehen. Zusammen sehen sie sich den Ort an, begrüßen Menschen und wählen eine kleine Aktivität für den Nachmittag. Einige Dinge kennen sie schon, andere machen sie neugierig. Am Ende sagt Anna, dass eine Sprache lernen auch bedeutet, am Alltag teilzunehmen. Leon stimmt zu und möchte die Erfahrung morgen wiederholen.`,
    A2: (title) => `Letzte Woche hat Anna an einer Aktivität zum Thema ${title} teilgenommen. Zuerst kannte sie das Programm nicht gut, deshalb hat sie nach Informationen gefragt und den Menschen im Viertel zugehört. Leon kam später, brachte aber eine gute Idee mit. Beide verglichen ihre Erfahrungen und beschlossen, zusammenzuarbeiten. Während der Aktivität bemerkten sie, dass einfache Lösungen vielen Menschen helfen können. Anna erklärte, dass sie weiterlernen möchte, weil man eine Stadt besser versteht, wenn man die Gewohnheiten der Menschen beobachtet. Am Ende schrieben sie eine kurze Nachricht, um der Gruppe zu danken, und planten ein neues Treffen für die nächste Woche.`,
    B1: (title) => `Im Viertel von Anna ist das Thema „${title}“ nach einer offenen Sitzung wichtig geworden. Einige Bewohner meinten, das Problem müsse nur von Institutionen gelöst werden; andere fanden, dass auch Bürger mit konkreten Aktionen beitragen können. Anna hörte beide Positionen an und sagte, ein guter Vorschlag müsse realistisch und nicht nur interessant sein. Leon berichtete von einer persönlichen Erfahrung: Früher hatte er an einem ähnlichen Projekt teilgenommen und gelernt, dass regelmäßige Kommunikation viele Missverständnisse verhindert. Die Gruppe teilte deshalb Aufgaben auf, setzte eine Frist und wählte einen einfachen Weg, die Nachbarschaft zu informieren. Nicht alle waren mit jedem Detail einverstanden. Trotzdem beschlossen sie, die Ergebnisse nach einem Monat gemeinsam zu prüfen. Anna hält diese Entscheidung für ausgewogen, weil sie sofortiges Handeln ermöglicht und später Raum für Verbesserungen lässt. Am Ende der Sitzung gingen die Menschen mit unterschiedlichen Verantwortlichkeiten nach Hause, aber mit einem gemeinsamen Ziel: den Alltag zu verbessern, ohne jemanden auszuschließen.`
  }
};

function questions(language, words) {
  const [first = 'tema', second = 'grupo'] = words;
  const prompts = language === 'german'
    ? ['Worum geht es im Text?', 'Was macht die Hauptperson zuerst?', 'Welche Rolle hat die zweite Person?', 'Warum arbeitet die Gruppe zusammen?', 'Was ist das gemeinsame Ziel?']
    : language === 'italian'
      ? ['Di che cosa parla il testo?', 'Che cosa fa prima la protagonista?', 'Quale ruolo ha la seconda persona?', 'Perché il gruppo collabora?', 'Qual è l’obiettivo comune?']
      : ['Sobre o que é o texto?', 'O que a personagem faz primeiro?', 'Qual é o papel da segunda pessoa?', 'Por que o grupo colabora?', 'Qual é o objetivo comum?'];
  const answers = [[first, second, 'Un examen aislado', 'Una compra sin contexto'], ['Pide información y escucha', 'Se va sin hablar', 'Cancela la actividad', 'Ignora al grupo'], ['Aporta una idea y colabora', 'Prohíbe participar', 'No escucha a nadie', 'Evita el tema'], ['Porque buscan una solución concreta', 'Porque no tienen objetivo', 'Porque trabajan solos', 'Porque rechazan cambios'], ['Mejorar la vida cotidiana de forma inclusiva', 'Ganar una competencia', 'Evitar toda comunicación', 'Cambiar de ciudad']];
  return prompts.map((prompt, index) => ({ type: 'mcq', prompt, options: answers[index], answer: 0 }));
}

for (const lesson of lessons) {
  const language = lesson.target_language;
  const level = lesson.level;
  if (!copy[language] || !ranges[level] || lesson.skill !== 'reading') continue;
  const title = lesson.title.replace(/:\s*(lectura|reading)$/i, '').trim();
  const words = (lesson.content_json?.vocabulary || []).map((item) => item.word).filter(Boolean);
  let text = copy[language][level](title, words);
  const [minimum] = ranges[level];
  const additions = language === 'german' ? ` Dabei benutzt die Gruppe Wörter wie ${words.slice(0, 4).join(', ')}.` : language === 'italian' ? ` Durante l'incontro usano parole utili come ${words.slice(0, 4).join(', ')}.` : ` Durante o encontro, usam palavras úteis como ${words.slice(0, 4).join(', ')}.`;
  while (text.split(/\s+/).length < minimum) text += additions;
  lesson.content_json.reading = { title, text, questions: questions(language, words).map((item) => item.prompt) };
  lesson.content_json.exercises = questions(language, words);
  lesson.estimated_minutes = level === 'A1' ? 10 : level === 'A2' ? 14 : 18;
}
fs.writeFileSync(file, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
console.log('European A1-B1 readings normalized.');
