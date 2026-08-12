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
function options(correct, distractors, index) { const values=[correct,...distractors].slice(0,4); const answer=index%4; [values[0],values[answer]]=[values[answer],values[0]]; return {options:values,answer}; }
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
    const correct=examples[0]; const wrong=language==='german'?['Ich wohnen im Viertel.','Ich wohnt im Viertel.','Wohne ich im Viertel.']:language==='italian'?['Io vivere nel quartiere.','Io vivi nel quartiere.','Vivo io nel quartiere?']:['Eu morar no bairro.','Eu mora no bairro.','Moro eu no bairro?'];
    const questions=Array.from({length:8},(_,i)=>({type:'mcq',prompt:language==='german'?'Welcher Satz ist korrekt?':language==='italian'?'Quale frase è corretta?':'Qual frase está correta?',...options(correct,wrong,i),explanation:definition}));
    content.exercises=questions; content.extra.grammarTest={questions};
  }
}
fs.writeFileSync(file, `${JSON.stringify(lessons,null,2)}\n`, 'utf8');
console.log('European grammar and vocabulary enriched.');
