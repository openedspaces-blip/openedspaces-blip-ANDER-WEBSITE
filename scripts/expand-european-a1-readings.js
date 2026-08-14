#!/usr/bin/env node
// Brings European A1 Reading texts to the same practical reading length as
// the English A1 route (roughly 110–145 words), while keeping the language
// simple, culturally situated and directly assessable.
const fs = require('fs');
const path = require('path');

const TARGET_LANGUAGES = new Set(['italian', 'portuguese', 'german']);

const copy = {
  italian: {
    character: 'Sofia',
    companion: 'Marco',
    city: 'Bologna',
    parts: (words) => [
      `Oggi Sofia è a Bologna. Incontra Marco nel suo quartiere e lo saluta con un sorriso. I due parlano lentamente e si ascoltano con attenzione. Sofia vuole usare l'italiano in una situazione vera, quindi prova una frase semplice e Marco le risponde con gentilezza.`,
      `Durante la conversazione usano parole utili della lezione: ${words}. Marco fa una domanda e Sofia risponde senza fretta. Se non capisce una parola, chiede: «Puoi ripetere, per favore?». Poi ripetono insieme le parole più importanti e trovano un piccolo esempio per ciascuna.`,
      `Prima di tornare a casa, Sofia ringrazia Marco. Dice che ascoltare, parlare e ripetere la aiuta a sentirsi più sicura. Marco è d'accordo e propone di incontrarsi di nuovo domani. Sofia torna a casa contenta e scrive nel suo quaderno le nuove parole della giornata.`
    ],
    questions: [
      ['Dove si trova Sofia?', ['Bologna', 'Roma', 'Milano', 'Napoli'], 0],
      ['Con chi parla Sofia?', ['Marco', 'Lucia', 'Paolo', 'Anna'], 0],
      ['Che cosa fa Sofia se non capisce una parola?', ['Chiede di ripetere', 'Va via subito', 'Non ascolta', 'Cambia città'], 0],
      ['Perché Sofia ripete le parole?', ['Per sentirsi più sicura', 'Per fare un esame tecnico', 'Per comprare un biglietto', 'Per evitare Marco'], 0],
      ['Che cosa propone Marco?', ['Incontrarsi di nuovo domani', 'Andare in un altro paese', 'Non parlare più', 'Cambiare le parole'], 0]
    ]
  },
  portuguese: {
    character: 'Luana',
    companion: 'Rafael',
    city: 'Recife',
    parts: (words) => [
      `Hoje Luana está em Recife. Ela encontra Rafael no bairro e o cumprimenta com um sorriso. Os dois falam devagar e escutam com atenção. Luana quer usar o português em uma situação real, por isso tenta uma frase simples e Rafael responde com gentileza.`,
      `Na conversa, eles usam palavras úteis da lição: ${words}. Rafael faz uma pergunta e Luana responde sem pressa. Quando ela não entende uma palavra, pergunta: «Pode repetir, por favor?». Depois, os dois repetem as palavras mais importantes e criam um exemplo pequeno para cada uma.`,
      `Antes de voltar para casa, Luana agradece a Rafael. Ela diz que escutar, falar e repetir ajudam a ter mais confiança. Rafael concorda e propõe um novo encontro amanhã. Luana volta para casa feliz e escreve no caderno as palavras novas do dia.`
    ],
    questions: [
      ['Onde Luana está?', ['Recife', 'Salvador', 'Rio de Janeiro', 'Brasília'], 0],
      ['Com quem Luana conversa?', ['Rafael', 'Pedro', 'Marina', 'Carlos'], 0],
      ['O que Luana pergunta quando não entende uma palavra?', ['Pode repetir, por favor?', 'Onde fica a estação?', 'Que horas são?', 'Você quer café?'], 0],
      ['Por que Luana repete as palavras?', ['Para ter mais confiança', 'Para evitar a conversa', 'Para mudar de cidade', 'Para comprar um livro'], 0],
      ['O que Rafael propõe?', ['Um novo encontro amanhã', 'Uma viagem longa hoje', 'Não estudar mais', 'Trocar de bairro'], 0]
    ]
  },
  german: {
    character: 'Anna',
    companion: 'Leon',
    city: 'Berlin',
    parts: (words) => [
      `Heute ist Anna in Berlin. Sie trifft Leon in ihrem Viertel und begrüßt ihn freundlich. Beide sprechen langsam und hören gut zu. Anna möchte Deutsch in einer echten Situation benutzen. Deshalb sagt sie einen einfachen Satz, und Leon antwortet ihr mit einem Lächeln.`,
      `Im Gespräch benutzen sie wichtige Wörter aus der Lektion: ${words}. Leon stellt eine einfache Frage, und Anna antwortet in Ruhe. Wenn sie ein Wort nicht versteht, fragt sie: „Kannst du das bitte wiederholen?" Danach wiederholen beide die wichtigsten Wörter und finden zu jedem Wort ein kleines Beispiel.`,
      `Bevor Anna nach Hause geht, bedankt sie sich bei Leon. Sie sagt, dass Zuhören, Sprechen und Wiederholen ihr mehr Sicherheit geben. Leon stimmt zu und schlägt ein neues Treffen für morgen vor. Anna geht zufrieden nach Hause und schreibt die neuen Wörter des Tages in ihr Heft.`
    ],
    questions: [
      ['Wo ist Anna?', ['Berlin', 'Hamburg', 'München', 'Köln'], 0],
      ['Mit wem spricht Anna?', ['Leon', 'Paul', 'Mia', 'Lukas'], 0],
      ['Was fragt Anna, wenn sie ein Wort nicht versteht?', ['Kannst du das bitte wiederholen?', 'Wo ist mein Zug?', 'Wie viel kostet das?', 'Wann beginnt die Schule?'], 0],
      ['Warum wiederholt Anna die Wörter?', ['Damit sie mehr Sicherheit hat', 'Damit sie nicht sprechen muss', 'Damit sie ein Ticket kauft', 'Damit sie Leon vermeidet'], 0],
      ['Was schlägt Leon vor?', ['Ein neues Treffen für morgen', 'Eine lange Reise heute', 'Keine Wörter mehr zu lernen', 'Das Viertel zu wechseln'], 0]
    ]
  }
};

function wordList(row) {
  const words = (row.content_json?.vocabulary || [])
    .map((entry) => entry.word || entry.targetWord)
    .filter(Boolean)
    .slice(0, 5);
  return words.length ? words.join(', ') : 'parole semplici';
}

function makeExercises(row, prompts) {
  return prompts.map(([prompt, options, answer], index) => ({
    id: `${row.slug}-reading-comprehension-${index + 1}`,
    type: 'mcq',
    prompt,
    options,
    answer
  }));
}

function expandEuropeanA1Readings(lessons) {
  let changed = 0;
  for (const row of lessons) {
    if (row.level !== 'A1' || row.skill !== 'reading' || !TARGET_LANGUAGES.has(row.target_language)) continue;
    const languageCopy = copy[row.target_language];
    const parts = languageCopy.parts(wordList(row));
    row.content_json = row.content_json || {};
    row.content_json.reading = {
      ...(row.content_json.reading || {}),
      parts,
      text: parts.join('\n\n'),
      questions: languageCopy.questions.slice(0, 4).map(([prompt]) => prompt)
    };
    row.content_json.exercises = makeExercises(row, languageCopy.questions.slice(0, 4));
    row.estimated_minutes = 10;
    changed += 1;
  }
  return changed;
}

if (require.main === module) {
  const seedPath = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
  const lessons = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const changed = expandEuropeanA1Readings(lessons);
  fs.writeFileSync(seedPath, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
  console.log(`Expanded ${changed} Italian, Portuguese and German A1 readings.`);
}

module.exports = { expandEuropeanA1Readings };
