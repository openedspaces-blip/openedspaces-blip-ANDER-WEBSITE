#!/usr/bin/env node
// Replaces mechanical padding in European readings with natural paragraphs.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const lessons = require(file);

const followUps = {
  italian: {
    A1: [`Prima di andare via, Sofia e Marco ripetono le parole della lezione. Sofia le scrive nel suo quaderno e Marco le usa in una frase. Cosi possono ricordare il significato e parlare con piu sicurezza domani.`],
    A2: [`Nel secondo incontro, Sofia spiega quali dettagli sono stati piu utili. Marco aggiunge che non basta conoscere parole nuove: bisogna usarle in una domanda, in una risposta e in una breve conversazione.`, `I due preparano alcune frasi pratiche e scelgono chi parlera con il gruppo. In questo modo il prossimo incontro sara piu chiaro, rispettoso e utile per tutti.`],
    B1: [`Nei giorni successivi, Sofia raccoglie i commenti dei partecipanti. Alcuni chiedono istruzioni piu chiare, mentre altri suggeriscono di coinvolgere nuove persone. Marco propone di pubblicare un breve riepilogo con le parole chiave, le responsabilita e la data della verifica.`, `Sofia e d'accordo, perche una decisione condivisa funziona meglio quando ogni persona sa che cosa puo fare e quando puo chiedere aiuto. Il gruppo decide anche di ascoltare le difficolta prima di modificare il piano, invece di cercare una soluzione troppo rapida.`, `Dopo alcune settimane, i partecipanti confronteranno cio che era stato promesso con cio che e stato realizzato. Per Sofia, questa verifica non serve a trovare colpe, ma a imparare e a rendere il progetto piu utile per il quartiere.`]
  },
  portuguese: {
    A1: [`Antes de ir embora, Luana e Rafael repetem as palavras da licao. Luana as escreve no caderno e Rafael usa cada uma em uma frase. Assim, eles lembram o significado e falam com mais seguranca amanha.`],
    A2: [`No segundo encontro, Luana explica quais detalhes foram mais uteis. Rafael acrescenta que nao basta conhecer palavras novas: e preciso usa-las em uma pergunta, em uma resposta e em uma conversa curta.`, `Os dois preparam algumas frases praticas e escolhem quem falara com o grupo. Dessa forma, o proximo encontro sera mais claro, respeitoso e util para todos.`],
    B1: [`Nos dias seguintes, Luana recolhe os comentarios dos participantes. Algumas pessoas pedem instrucoes mais claras, enquanto outras sugerem envolver novos moradores. Rafael propoe publicar um resumo com as palavras-chave, as responsabilidades e a data da avaliacao.`, `Luana concorda, porque uma decisao compartilhada funciona melhor quando cada pessoa sabe o que pode fazer e quando pode pedir ajuda. O grupo tambem decide ouvir as dificuldades antes de mudar o plano, em vez de procurar uma solucao apressada.`, `Depois de algumas semanas, os participantes compararao o que foi prometido com o que foi realizado. Para Luana, essa avaliacao nao serve para procurar culpados, mas para aprender e tornar o projeto mais util para o bairro.`]
  },
  german: {
    A1: [`Bevor sie nach Hause gehen, wiederholen Anna und Leon die Woerter der Lektion. Anna schreibt sie in ihr Heft, und Leon benutzt jedes Wort in einem Satz. So behalten beide die Bedeutung und sprechen morgen sicherer.`],
    A2: [`Beim zweiten Treffen erklaert Anna, welche Details besonders hilfreich waren. Leon ergaenzt, dass es nicht reicht, neue Woerter zu kennen: Man muss sie in einer Frage, einer Antwort und einem kurzen Gespraech benutzen.`, `Beide bereiten praktische Saetze vor und waehlen, wer mit der Gruppe spricht. So wird das naechste Treffen klarer, respektvoller und fuer alle nuetzlicher.`],
    B1: [`In den folgenden Tagen sammelt Anna Rueckmeldungen von den Teilnehmenden. Einige wuenschen sich klarere Informationen, andere moechten neue Nachbarn einbeziehen. Leon schlaegt eine kurze Zusammenfassung mit den Schluesselwoertern, den Verantwortlichkeiten und dem Termin fuer die Auswertung vor.`, `Anna stimmt zu, denn eine gemeinsame Entscheidung funktioniert besser, wenn jede Person weiss, was sie tun kann und wann sie Hilfe braucht. Die Gruppe will ausserdem zuerst Schwierigkeiten anhoeren, bevor sie den Plan veraendert, statt eine zu schnelle Loesung zu waehlen.`, `Nach einigen Wochen vergleichen die Teilnehmenden, was versprochen und was umgesetzt wurde. Fuer Anna dient diese Auswertung nicht dazu, Schuldige zu suchen, sondern dazu, zu lernen und das Projekt fuer das Viertel sinnvoller zu machen.`]
  }
};

for (const lesson of lessons) {
  const { target_language: language, level } = lesson;
  if (!followUps[language]?.[level] || lesson.skill !== 'reading') continue;
  const oldText = String(lesson.content_json?.reading?.text || '');
  const base = oldText
    .replace(/(?:\s*Durante l'incontro usano parole utili come [^.]*\.)+/g, '')
    .replace(/(?:\s*Durante o encontro, usam palavras úteis como [^.]*\.)+/g, '')
    .replace(/(?:\s*Dabei benutzt die Gruppe Wörter wie [^.]*\.)+/g, '')
    .trim();
  const parts = [base, ...followUps[language][level]];
  lesson.content_json.reading = {
    ...lesson.content_json.reading,
    text: parts.join('\n\n'),
    parts
  };
}
fs.writeFileSync(file, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
console.log('European readings restructured into natural paragraphs.');
