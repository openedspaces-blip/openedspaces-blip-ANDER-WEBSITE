#!/usr/bin/env node
// Gives every Italian upper-level grammar lesson the same assessed structure
// as Italian A1: 9 grammar, 3 vocabulary and 3 verb questions.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const lessons = JSON.parse(fs.readFileSync(file, 'utf8'));
const letters = ['a', 'b', 'c', 'd'];

const levelQuestions = {
  B2: {
    grammar: [
      ['È necessario che il gruppo ___ le conseguenze prima di decidere.', 'valuti', ['valuta', 'valutare', 'valutano']],
      ['Sebbene il termine ___ vicino, possiamo riorganizzare le risorse.', 'sia', ['è', 'essere', 'sono']],
      ['La proposta è valida, purché ___ sostenibile.', 'rimanga', ['rimane', 'rimanere', 'rimangono']],
      ['Nonostante le difficoltà, il progetto ___ nei tempi previsti.', 'prosegue', ['proseguire', 'proseguono', 'proseguito']],
      ['È preferibile che ogni incarico ___ con chiarezza.', 'venga definito', ['viene definito', 'venire definito', 'vengono definiti']],
      ['Il coordinatore spiega la scelta affinché tutti la ___.', 'comprendano', ['comprendono', 'comprendere', 'comprende']],
      ['La squadra ha agito con cautela, ___ mancavano alcuni dati.', 'benché', ['quindi', 'infatti', 'perciò']],
      ['Prima di procedere, occorre ___ le alternative.', 'valutare', ['valuta', 'valutando', 'valutato']],
      ['Quale frase usa un registro formale appropriato?', 'Le chiediamo di confermare la disponibilità entro venerdì.', ['Ti chiediamo confermare disponibilità entro venerdì.', 'Chiediamo a te di confermi entro venerdì.', 'Le chiediamo che conferma la disponibilità entro venerdì.']]
    ],
    verbs: [
      ['È importante che il gruppo ___ ogni conseguenza.', 'valuti', ['valuta', 'valutare', 'valutano']],
      ['Noi ___ le risorse prima dell’incontro.', 'coordineremo', ['coordinerà', 'coordinare', 'coordinato']],
      ['Il responsabile ___ un incarico preciso a ciascuno.', 'assegnerà', ['assegnano', 'assegnare', 'assegnato']]
    ]
  },
  C1: {
    grammar: [
      ['Pur ___ l’obiezione, l’autore sostiene la tesi con evidenze verificabili.', 'riconoscendo', ['riconosce', 'riconoscere', 'riconosciuto']],
      ['Non si può concludere nulla finché i dati non ___.', 'siano stati verificati', ['sono verificati', 'essere verificati', 'saranno verificano']],
      ['L’autrice formula la tesi in modo che non ___ ambiguità.', 'lasci', ['lascia', 'lasciare', 'lasciano']],
      ['La relazione distingue tra un fatto dimostrato e un’ipotesi che ___ ulteriori prove.', 'richiede', ['richiedere', 'richiedano', 'richiesta']],
      ['Benché il ragionamento ___ convincente, manca una fonte indipendente.', 'appaia', ['appare', 'apparire', 'appaiono']],
      ['Il portavoce ha riformulato la posizione senza ___ il dissenso.', 'minimizzare', ['minimizza', 'minimizzato', 'minimizzando']],
      ['Quale connettore introduce una concessione?', 'Tuttavia', ['Pertanto', 'Infatti', 'Di conseguenza']],
      ['La conclusione è credibile solo se ___ dalle evidenze.', 'è sostenuta', ['sostiene', 'sostenere', 'sono sostenuti']],
      ['Quale frase mantiene un registro argomentativo preciso?', 'La tesi richiede una distinzione tra correlazione e causalità.', ['La tesi è super perché sembra vera.', 'La tesi dice cose molto importanti, punto.', 'La tesi ha una cosa che forse va bene.']]
    ],
    verbs: [
      ['Benché l’autore ___ un’obiezione, la sua tesi resta coerente.', 'riconosca', ['riconosce', 'riconoscere', 'riconoscono']],
      ['Le evidenze ___ la conclusione con precisione.', 'sostengono', ['sostiene', 'sostenere', 'sostenuto']],
      ['Il relatore ___ la propria posizione alla luce dei dati.', 'riformula', ['riformulare', 'riformulano', 'riformulato']]
    ]
  },
  C2: {
    grammar: [
      ['La formulazione attenuata non elimina la premessa, ma ne ___ l’inferenza implicita.', 'precisa', ['precisare', 'precisano', 'precisato']],
      ['Sarebbe improprio affermare che un solo indizio ___ una conclusione definitiva.', 'giustifichi', ['giustifica', 'giustificare', 'giustificano']],
      ['L’autore ricorre a una concessione affinché la tesi non ___ categorica.', 'risulti', ['risulta', 'risultare', 'risultano']],
      ['Il testo lascia intendere, senza dirlo esplicitamente, che la premessa ___ discussa.', 'può essere', ['può essere stata', 'potere essere', 'possono essere']],
      ['Quale riformulazione conserva il grado di certezza?', 'I dati sembrano suggerire una tendenza, non una prova definitiva.', ['I dati dimostrano tutto senza dubbio.', 'I dati sono certamente una prova totale.', 'I dati dicono una cosa sicura sempre.']],
      ['La scelta lessicale è persuasiva, pur non ___ il dissenso.', 'cancellando', ['cancella', 'cancellare', 'cancellata']],
      ['Una premessa è rilevante nella misura in cui ___ la conclusione.', 'sostiene', ['sostenere', 'sostengono', 'sostenuta']],
      ['Quale espressione attenua correttamente un’affermazione?', 'È plausibile ipotizzare che…', ['È sicuro al cento per cento che…', 'È ovvio per tutti che…', 'Non esiste alcun dubbio che…']],
      ['L’inferenza è valida solo se non ___ oltre quanto le prove consentono.', 'si spinge', ['si spingere', 'si spingono', 'si spinta']]
    ],
    verbs: [
      ['Non si può ___ una conclusione da un unico indizio.', 'dedurre', ['deduce', 'deducono', 'dedotto']],
      ['La formulazione ___ il tono senza alterare il significato.', 'attenua', ['attenuare', 'attenuano', 'attenuato']],
      ['L’autore ___ una premessa prima di sviluppare l’argomento.', 'esplicita', ['esplicitare', 'esplicitano', 'esplicitato']]
    ]
  }
};

function question(id, prompt, correct, distractors, index, difficulty) {
  const options = [...distractors.slice(0, 3)];
  const answer = index % 4;
  options.splice(answer, 0, correct);
  return {
    id,
    type: 'mcq',
    prompt,
    options: options.map((text, optionIndex) => ({ id: letters[optionIndex], text })),
    correctOptionId: letters[answer],
    difficulty
  };
}

let updated = 0;
for (const lesson of lessons) {
  if (lesson.target_language !== 'italian' || lesson.skill !== 'grammar' || !levelQuestions[lesson.level]) continue;
  const content = lesson.content_json || {};
  const existing = content.extra?.grammarTest?.questions || [];
  if (existing.length === 15) continue;

  const set = levelQuestions[lesson.level];
  const words = (content.vocabulary || []).map((entry) => entry.word).filter(Boolean);
  const grammar = set.grammar.map(([prompt, correct, distractors], index) =>
    question(`${lesson.slug}-grammar-${index + 1}`, prompt, correct, distractors, index, index < 3 ? 'recognition' : index < 6 ? 'application' : 'control')
  );
  const vocabulary = words.slice(0, 3).map((word, index) =>
    question(
      `${lesson.slug}-vocabulary-${index + 10}`,
      'Quale parola appartiene al tema della lezione?',
      word,
      [...words.slice(0, 5).filter((candidate) => candidate !== word), 'contesto', 'prospettiva'].slice(0, 3),
      index + 9,
      'vocabulary'
    )
  );
  const verbs = set.verbs.map(([prompt, correct, distractors], index) =>
    question(`${lesson.slug}-verb-${index + 13}`, prompt, correct, distractors, index + 12, 'verbs')
  );

  content.extra = content.extra || {};
  content.extra.grammarTest = {
    id: `${lesson.slug}-final-test`,
    passingScore: 70,
    sections: [
      { id: 'grammar', label: 'Grammatica', from: 1, to: 9 },
      { id: 'vocabulary', label: 'Vocabolario', from: 10, to: 12 },
      { id: 'verbs', label: 'Verbi', from: 13, to: 15 }
    ],
    questions: [...grammar, ...vocabulary, ...verbs]
  };
  lesson.content_json = content;
  updated += 1;
}

fs.writeFileSync(file, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
console.log(`Standardized ${updated} Italian B2-C2 grammar tests.`);
