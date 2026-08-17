#!/usr/bin/env node
// Enriches the European A1-B1 routes with usable vocabulary banks and
// structured grammar teaching/tests, while retaining each unit's topic.
const fs = require('fs'); const path = require('path');
const file = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const lessons = require(file);
const extra = {
  italian: [['oggi','hoy'],['insieme','juntos'],['quartiere','barrio'],['domanda','pregunta'],['risposta','respuesta'],['esperienza','experiencia'],['scegliere','elegir'],['capire','comprender'],['proposta','propuesta'],['importante','importante'],['cambiamento','cambio'],['comunità','comunidad']],
  portuguese: [['hoje','hoy'],['juntos','juntos'],['bairro','barrio'],['pergunta','pregunta'],['resposta','respuesta'],['experiência','experiencia'],['escolher','elegir'],['entender','comprender'],['proposta','propuesta'],['importante','importante'],['mudança','cambio'],['comunidade','comunidad']],
  german: [['heute','hoy'],['zusammen','juntos'],['Viertel','barrio'],['Frage','pregunta'],['Antwort','respuesta'],['Erfahrung','experiencia'],['wählen','elegir'],['verstehen','comprender'],['Vorschlag','propuesta'],['wichtig','importante'],['Veränderung','cambio'],['Gemeinschaft','comunidad']]
};
const grammar = {
  italian: { A1:['Il presente serve per parlare di abitudini e fatti semplici.','soggetto + verbo al presente','Descrivere persone, luoghi e routine.',['Io vivo nel quartiere.','Marco parla con Sofia.']], A2:['Il passato prossimo racconta azioni concluse; i connettori ordinano il racconto.','ausiliare avere/essere + participio passato','Raccontare esperienze e progetti.',['Ieri ho visitato il museo.','Poi abbiamo parlato insieme.']], B1:['Connettori, opinioni e ipotesi aiutano a costruire un argomento.','opinione + perché/tuttavia/quindi + motivazione','Esprimere e giustificare un punto di vista.',['Penso che la proposta sia utile.','Tuttavia dobbiamo valutare i risultati.']] },
  portuguese: { A1:['O presente descreve rotinas e informações simples.','sujeito + verbo no presente','Falar de pessoas, lugares e hábitos.',['Eu moro no bairro.','Rafael fala com Luana.']], A2:['O pretérito perfeito conta ações concluídas; conectores organizam a narrativa.','sujeito + verbo no passado + conector','Contar experiências e planos.',['Ontem visitei o museu.','Depois conversamos juntos.']], B1:['Conectores, opiniões e hipóteses ajudam a construir um argumento.','opinião + porque/porém/portanto + justificativa','Expressar e justificar um ponto de vista.',['Acho que a proposta é útil.','Porém, devemos avaliar os resultados.']] },
  german: { A1:['Das Präsens beschreibt einfache Gewohnheiten und Fakten.','Subjekt + Verb + Ergänzung','Über Personen, Orte und Alltag sprechen.',['Ich wohne im Viertel.','Leon spricht mit Anna.']], A2:['Das Perfekt erzählt abgeschlossene Handlungen; Konnektoren ordnen die Geschichte.','haben/sein + Partizip II','Erfahrungen und Pläne erzählen.',['Gestern habe ich das Museum besucht.','Danach haben wir zusammen gesprochen.']], B1:['Konnektoren, Meinungen und Vermutungen helfen bei einer Argumentation.','Meinung + weil/obwohl/deshalb + Begründung','Eine Meinung ausdrücken und begründen.',['Ich finde den Vorschlag sinnvoll.','Trotzdem müssen wir die Ergebnisse prüfen.']] }
};
function options(correct, distractors, index) {
  const values=[correct,...distractors].slice(0,4);
  const answer=index%4;
  [values[0],values[answer]]=[values[answer],values[0]];
  return {
    options:values.map((text, optionIndex)=>({id:`o${optionIndex+1}`,text})),
    correctOptionId:`o${answer+1}`
  };
}
function grammarQuestions(language, level, definition) {
  const sets = {
    italian: {
      A1: [
        ['Completa: Io ___ nel quartiere.', 'vivo', ['vive', 'vivere', 'viviamo']],
        ['Scegli la forma corretta per Marco.', 'Marco parla con Sofia.', ['Marco parlare con Sofia.', 'Marco parlo con Sofia.', 'Marco parlano con Sofia.']],
        ['Completa: Noi ___ italiano ogni giorno.', 'studiamo', ['studia', 'studiare', 'studiate']],
        ['Quale domanda è corretta?', 'Dove abiti?', ['Dove abita tu?', 'Dove abitare?', 'Dove abiti tu è?']],
        ['Completa: Lei ___ una domanda.', 'fa', ['faccio', 'fare', 'fanno']],
        ['Scegli la frase con l’articolo corretto.', 'La casa è luminosa.', ['Il casa è luminosa.', 'La casa sono luminosa.', 'La casa è luminoso.']],
        ['Completa: Tu ___ il caffè?', 'prendi', ['prende', 'prendere', 'prendiamo']],
        ['Quale frase parla di una routine?', 'Ogni mattina lavoro in centro.', ['Ieri lavorare in centro.', 'Domani lavorato in centro.', 'Ogni mattina lavorano io in centro.']]
      ],
      A2: [
        ['Completa: Ieri io ___ il museo.', 'ho visitato', ['visito', 'ho visitare', 'sono visitato']],
        ['Scegli la frase al passato prossimo corretta.', 'Abbiamo cenato insieme.', ['Abbiamo cenare insieme.', 'Siamo cenato insieme.', 'Ceniamo ieri insieme.']],
        ['Completa: Marta ___ a casa tardi.', 'è tornata', ['ha tornata', 'è tornare', 'torna ieri']],
        ['Quale connettore indica la sequenza?', 'Prima abbiamo studiato, poi siamo usciti.', ['Prima abbiamo studiato, perché siamo usciti.', 'Prima abbiamo studiato, ma siamo usciti.', 'Prima abbiamo studiato, se siamo usciti.']],
        ['Completa: Tu ___ il messaggio?', 'hai letto', ['hai leggere', 'sei letto', 'leggi ieri']],
        ['Scegli la frase corretta.', 'I miei amici hanno preso il treno.', ['I miei amici sono preso il treno.', 'I miei amici hanno prendere il treno.', 'I miei amici prendono il treno ieri.']],
        ['Completa: Noi ___ una bella esperienza.', 'abbiamo avuto', ['siamo avuti', 'abbiamo avere', 'aviamo avuto']],
        ['Quale frase racconta un’azione conclusa?', 'Sabato ho incontrato mia cugina.', ['Sabato incontro mia cugina domani.', 'Sabato incontrare mia cugina.', 'Sabato sono incontrato mia cugina.']]
      ],
      B1: [
        ['Completa: Penso che la proposta ___ utile.', 'sia', ['è', 'essere', 'sono']],
        ['Scegli il connettore di contrasto.', 'Vorrei uscire, tuttavia piove.', ['Vorrei uscire, quindi piove.', 'Vorrei uscire, perché piove.', 'Vorrei uscire, infatti piove.']],
        ['Completa: Resto a casa perché ___ stanco.', 'sono', ['sia', 'essere', 'sarei']],
        ['Quale frase esprime un’opinione?', 'Secondo me, il progetto funziona.', ['Il progetto ieri funziona?', 'Funzionare progetto secondo me.', 'Il progetto funziona perché?']],
        ['Completa: Sebbene ___ tardi, continuiamo.', 'sia', ['è', 'essere', 'sono']],
        ['Scegli la conclusione logica.', 'Abbiamo poco tempo, quindi organizziamo il lavoro.', ['Abbiamo poco tempo, tuttavia organizziamo il lavoro.', 'Abbiamo poco tempo, perché organizziamo il lavoro.', 'Abbiamo poco tempo, se organizziamo il lavoro.']],
        ['Completa: Credo che loro ___ ragione.', 'abbiano', ['hanno', 'avere', 'avranno']],
        ['Quale frase giustifica una scelta?', 'Scelgo il treno perché è più sostenibile.', ['Scelgo il treno tuttavia è più sostenibile.', 'Scelgo il treno quindi è più sostenibile?', 'Scelgo il treno è più sostenibile perché?']]
      ]
    },
    portuguese: {
      A1: [
        ['Complete: Eu ___ no bairro.', 'moro', ['mora', 'morar', 'moramos']],
        ['Escolha a frase correta.', 'Rafael fala com Luana.', ['Rafael falar com Luana.', 'Rafael falo com Luana.', 'Rafael falam com Luana.']],
        ['Complete: Nós ___ português todos os dias.', 'estudamos', ['estuda', 'estudar', 'estudam']],
        ['Qual pergunta está correta?', 'Onde você mora?', ['Onde você morar?', 'Onde mora você?', 'Onde você moram?']],
        ['Complete: Ela ___ uma pergunta.', 'faz', ['faço', 'fazer', 'fazem']],
        ['Escolha a frase que descreve uma casa.', 'A casa é clara.', ['O casa é clara.', 'A casa são clara.', 'A casa é claro.']],
        ['Complete: Você ___ café?', 'toma', ['tomam', 'tomar', 'tomamos']],
        ['Qual frase fala de uma rotina?', 'Toda manhã trabalho no centro.', ['Ontem trabalhar no centro.', 'Amanhã trabalhei no centro.', 'Toda manhã trabalham eu no centro.']]
      ],
      A2: [
        ['Complete: Ontem eu ___ o museu.', 'visitei', ['visito', 'visitar', 'visitamos']],
        ['Escolha a frase correta no passado.', 'Nós jantamos juntos.', ['Nós jantar juntos.', 'Nós jantou juntos.', 'Nós jantaremos ontem.']],
        ['Complete: Marta ___ tarde para casa.', 'voltou', ['volta', 'voltar', 'voltaram']],
        ['Qual frase mostra sequência?', 'Primeiro estudamos, depois saímos.', ['Primeiro estudamos, porque saímos.', 'Primeiro estudamos, porém saímos.', 'Primeiro estudamos, se saímos.']],
        ['Complete: Você ___ a mensagem?', 'leu', ['lê', 'ler', 'leram']],
        ['Escolha a frase com o verbo no passado.', 'Meus amigos pegaram o ônibus.', ['Meus amigos pegar o ônibus.', 'Meus amigos pegou o ônibus.', 'Meus amigos pegam ontem o ônibus.']],
        ['Complete: Nós ___ uma experiência importante.', 'tivemos', ['temos', 'ter', 'teve']],
        ['Qual frase conta uma ação concluída?', 'No sábado encontrei minha prima.', ['No sábado encontro minha prima amanhã.', 'No sábado encontrar minha prima.', 'No sábado encontro eu minha prima.']]
      ],
      B1: [
        ['Complete: Acho que a proposta ___ útil.', 'é', ['são', 'ser', 'seja']],
        ['Escolha o conector de contraste.', 'Quero sair, porém está chovendo.', ['Quero sair, portanto está chovendo.', 'Quero sair, porque está chovendo.', 'Quero sair, então está chovendo.']],
        ['Complete: Fico em casa porque ___ cansado.', 'estou', ['está', 'estar', 'estamos']],
        ['Qual frase expressa uma opinião?', 'Na minha opinião, o projeto funciona.', ['O projeto ontem funciona?', 'Funcionar projeto na minha opinião.', 'O projeto funciona por quê?']],
        ['Complete: Embora ___ tarde, continuamos.', 'seja', ['é', 'ser', 'são']],
        ['Escolha uma consequência.', 'Temos pouco tempo, portanto organizamos o trabalho.', ['Temos pouco tempo, porém organizamos o trabalho.', 'Temos pouco tempo, porque organizamos o trabalho.', 'Temos pouco tempo, embora organizamos o trabalho.']],
        ['Complete: Acredito que eles ___ razão.', 'tenham', ['têm', 'ter', 'terão']],
        ['Qual frase justifica uma escolha?', 'Escolho o trem porque é mais sustentável.', ['Escolho o trem porém é mais sustentável.', 'Escolho o trem portanto é mais sustentável?', 'Escolho o trem é mais sustentável porque?']]
      ]
    },
    german: {
      A1: [
        ['Ergänze: Ich ___ im Viertel.', 'wohne', ['wohnt', 'wohnen', 'wohnst']],
        ['Wähle den richtigen Satz.', 'Leon spricht mit Anna.', ['Leon sprechen mit Anna.', 'Leon spreche mit Anna.', 'Leon sprich mit Anna.']],
        ['Ergänze: Wir ___ jeden Tag Deutsch.', 'lernen', ['lernt', 'lerne', 'lernst']],
        ['Welche Frage ist richtig?', 'Wo wohnst du?', ['Wo wohnen du?', 'Wo du wohnst?', 'Wo wohnst?']],
        ['Ergänze: Sie ___ eine Frage.', 'stellt', ['stelle', 'stellen', 'stellst']],
        ['Wähle den Satz über ein Haus.', 'Das Haus ist hell.', ['Das Haus sind hell.', 'Die Haus ist hell.', 'Das Haus ist helle.']],
        ['Ergänze: Du ___ Kaffee.', 'trinkst', ['trinkt', 'trinken', 'trinke']],
        ['Welcher Satz beschreibt eine Routine?', 'Jeden Morgen arbeite ich im Zentrum.', ['Gestern arbeiten ich im Zentrum.', 'Morgen arbeitete ich im Zentrum.', 'Jeden Morgen arbeitet ich im Zentrum.']]
      ],
      A2: [
        ['Ergänze: Gestern ___ ich das Museum ___.', 'habe besucht', ['besuche', 'habe besuchen', 'bin besucht']],
        ['Wähle den richtigen Perfekt-Satz.', 'Wir haben zusammen gegessen.', ['Wir haben zusammen essen.', 'Wir sind zusammen gegessen.', 'Wir essen gestern zusammen.']],
        ['Ergänze: Marta ___ spät nach Hause ___.', 'ist gekommen', ['hat gekommen', 'ist kommen', 'kommt gestern']],
        ['Welcher Satz zeigt eine Reihenfolge?', 'Zuerst haben wir gelernt, dann sind wir gegangen.', ['Zuerst haben wir gelernt, weil sind wir gegangen.', 'Zuerst haben wir gelernt, obwohl sind wir gegangen.', 'Zuerst haben wir gelernt, wenn sind wir gegangen.']],
        ['Ergänze: ___ du die Nachricht ___?', 'Hast gelesen', ['Hast lesen', 'Bist gelesen', 'Liest gestern']],
        ['Wähle den Perfekt-Satz mit dem richtigen Hilfsverb.', 'Meine Freunde haben den Bus genommen.', ['Meine Freunde sind den Bus genommen.', 'Meine Freunde haben den Bus nehmen.', 'Meine Freunde nehmen gestern den Bus.']],
        ['Ergänze: Wir ___ eine wichtige Erfahrung ___.', 'haben gemacht', ['sind gemacht', 'haben machen', 'machen gestern']],
        ['Welcher Satz beschreibt eine abgeschlossene Handlung?', 'Am Samstag habe ich meine Cousine getroffen.', ['Am Samstag treffe ich meine Cousine morgen.', 'Am Samstag treffen meine Cousine.', 'Am Samstag bin ich meine Cousine getroffen.']]
      ],
      B1: [
        ['Ergänze: Ich finde, dass der Vorschlag sinnvoll ___.', 'ist', ['sind', 'sein', 'sei']],
        ['Wähle den Konnektor für einen Gegensatz.', 'Ich möchte ausgehen, aber es regnet.', ['Ich möchte ausgehen, deshalb es regnet.', 'Ich möchte ausgehen, weil es regnet.', 'Ich möchte ausgehen, dann es regnet.']],
        ['Ergänze: Ich bleibe zu Hause, weil ich müde ___.', 'bin', ['ist', 'sein', 'bist']],
        ['Welcher Satz drückt eine Meinung aus?', 'Meiner Meinung nach funktioniert das Projekt.', ['Das Projekt gestern funktioniert?', 'Funktionieren das Projekt meiner Meinung.', 'Das Projekt funktioniert warum?']],
        ['Ergänze: Obwohl es spät ___, arbeiten wir weiter.', 'ist', ['sind', 'sein', 'bist']],
        ['Wähle eine logische Folge.', 'Wir haben wenig Zeit, deshalb planen wir die Arbeit.', ['Wir haben wenig Zeit, aber planen wir die Arbeit.', 'Wir haben wenig Zeit, weil planen wir die Arbeit.', 'Wir haben wenig Zeit, obwohl planen wir die Arbeit.']],
        ['Ergänze: Ich glaube, dass sie Recht ___.', 'hat', ['haben', 'sein', 'hatte']],
        ['Welcher Satz begründet eine Wahl?', 'Ich nehme den Zug, weil er nachhaltiger ist.', ['Ich nehme den Zug, aber er nachhaltiger ist.', 'Ich nehme den Zug, deshalb er nachhaltiger ist?', 'Ich nehme den Zug er nachhaltiger ist weil.']]
      ]
    }
  };
  const templates = sets[language]?.[level] || [];
  return templates.map(([prompt, correct, distractors], index) => ({
    id:`q${index+1}`, type: 'mcq', prompt, ...options(correct, distractors, index), explanation: definition
  }));
}
for (const lesson of lessons) {
  const language=lesson.target_language, level=lesson.level;
  if (!extra[language] || !grammar[language][level]) continue;
  const content=lesson.content_json ||= {};
  if (lesson.skill==='vocabulary') {
    const current=(content.vocabulary||[]).map(v=>[v.word,v.translation||'traducción']).filter(v=>v[0]);
    const terms=[...current,...extra[language]].filter((v,i,a)=>a.findIndex(x=>x[0].toLocaleLowerCase()===v[0].toLocaleLowerCase())===i).slice(0,12);
    content.vocabulary=terms.map(([word,translation])=>({word,translation,definition:translation,example:language==='german'?`Ich benutze „${word}“ in einem Satz.`:language==='italian'?`Uso «${word}» in una frase.`:`Uso “${word}” em uma frase.`,contexts:[`${word} · tema`,`${word} · conversación`,`${word} · práctica`] }));
    content.exercises=terms.map(([word],i)=>({type:'mcq',prompt:language==='german'?`Wähle das Wort aus dieser Einheit.`:language==='italian'?`Scegli una parola di questa unità.`:`Escolha uma palavra desta unidade.`,...options(word,terms.filter((_,j)=>j!==i).slice(0,3).map(x=>x[0]),i)}));
  }
  if (lesson.skill==='grammar') {
    const [definition,structure,functionText,examples]=grammar[language][level];
    content.extra ||= {}; content.extra.grammarProfile={name:lesson.title,definition,structure,function:functionText,examples};
    const questions=grammarQuestions(language, level, definition);
    content.exercises=questions; content.extra.grammarTest={questions};
  }
}
fs.writeFileSync(file, `${JSON.stringify(lessons,null,2)}\n`, 'utf8');
console.log('European grammar and vocabulary enriched.');
