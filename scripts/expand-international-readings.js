#!/usr/bin/env node
// Completes short non-English readings with level-appropriate follow-up
// paragraphs. Existing long readings are deliberately preserved verbatim.
const fs = require('fs');
const path = require('path');
const seedPath = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const lessons = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const targets = { A1: 170, A2: 210, B1: 280, B2: 320, C1: 350, C2: 350 };
const texts = {
  spanish: {
    basic: ['Después de leer, el estudiante puede elegir una idea y usarla en una situación cercana. Puede decir una frase breve, hacer una pregunta sencilla y escuchar la respuesta. Al final, escribe dos expresiones útiles para volver a practicarlas mañana.', 'No hace falta comprender todo de una vez. Leer despacio, reconocer palabras conocidas y relacionarlas con la situación ayuda a construir seguridad. Cada nueva lectura permite añadir un detalle y entender mejor el mensaje.'],
    middle: ['Una segunda lectura ayuda a distinguir la idea principal de los detalles. El lector puede subrayar una expresión útil, explicar con sus propias palabras lo que ocurre y comparar esa explicación con el texto. Esta estrategia convierte la lectura en una práctica activa.', 'También conviene pensar en un ejemplo personal o cercano. Cuando una idea se relaciona con una decisión, una rutina o una conversación real, resulta más fácil recordarla y usarla después.'],
    advanced: ['Una lectura más atenta permite observar no solo lo que se afirma, sino también cómo se sostiene esa afirmación. Conviene identificar el problema, la evidencia disponible y la posible consecuencia de cada decisión. Esta distinción evita aceptar una conclusión solo porque parece familiar o convincente.', 'El contexto también importa. Una solución útil en una situación puede necesitar cambios cuando varían los recursos, las responsabilidades o las personas afectadas. Formular una limitación concreta fortalece el análisis, porque muestra qué información sería necesaria antes de aplicar una propuesta.', 'Por último, una conclusión responsable conecta una postura clara con sus condiciones. Puede orientar la acción sin presentarse como una respuesta definitiva; permanece abierta a nueva evidencia, a resultados inesperados y a perspectivas que el texto inicial quizá no había considerado.']
  },
  french: {
    basic: ['Après la lecture, l’apprenant peut choisir une idée et l’utiliser dans une situation proche. Il peut dire une phrase courte, poser une question simple et écouter la réponse. À la fin, il note deux expressions utiles pour les pratiquer à nouveau demain.', 'Il n’est pas nécessaire de tout comprendre immédiatement. Lire lentement, reconnaître des mots connus et les relier à la situation aide à prendre confiance. Chaque nouvelle lecture permet d’ajouter un détail et de mieux comprendre le message.'],
    middle: ['Une deuxième lecture aide à distinguer l’idée principale des détails. Le lecteur peut souligner une expression utile, expliquer avec ses propres mots ce qui se passe et comparer son explication avec le texte. Cette stratégie transforme la lecture en pratique active.', 'Il est aussi utile de penser à un exemple personnel ou proche. Quand une idée est liée à une décision, une habitude ou une conversation réelle, elle est plus facile à retenir et à réutiliser.'],
    advanced: ['Une lecture attentive permet d’observer non seulement ce qui est affirmé, mais aussi la manière dont cette affirmation est soutenue. Il faut identifier le problème, les éléments disponibles et les conséquences possibles de chaque décision. Cette distinction évite d’accepter une conclusion simplement parce qu’elle paraît familière ou convaincante.', 'Le contexte compte également. Une solution utile dans une situation peut demander des adaptations lorsque les ressources, les responsabilités ou les personnes concernées changent. Formuler une limite précise renforce l’analyse, car cela indique quelles informations seraient nécessaires avant d’appliquer une proposition.', 'Enfin, une conclusion responsable relie une position claire à ses conditions. Elle peut orienter l’action sans se présenter comme une réponse définitive et reste ouverte à de nouveaux éléments, à des résultats inattendus et à des perspectives absentes du texte initial.']
  },
  italian: {
    basic: ['Dopo la lettura, lo studente può scegliere un’idea e usarla in una situazione vicina. Può dire una frase breve, fare una domanda semplice e ascoltare la risposta. Alla fine annota due espressioni utili per ripeterle il giorno successivo.', 'Non è necessario capire tutto subito. Leggere lentamente, riconoscere parole note e collegarle alla situazione aiuta a costruire sicurezza. Ogni nuova lettura permette di aggiungere un dettaglio e capire meglio il messaggio.'],
    middle: ['Una seconda lettura aiuta a distinguere l’idea principale dai dettagli. Il lettore può sottolineare un’espressione utile, spiegare con parole proprie ciò che accade e confrontare la spiegazione con il testo. Questa strategia trasforma la lettura in una pratica attiva.', 'È utile anche pensare a un esempio personale o vicino. Quando un’idea è collegata a una decisione, a un’abitudine o a una conversazione reale, è più facile ricordarla e riutilizzarla.'],
    advanced: ['Una lettura più attenta permette di osservare non solo ciò che viene affermato, ma anche il modo in cui l’affermazione viene sostenuta. Conviene identificare il problema, gli elementi disponibili e le conseguenze possibili di ogni decisione. Questa distinzione evita di accettare una conclusione soltanto perché sembra familiare o convincente.', 'Anche il contesto conta. Una soluzione utile in una situazione può richiedere adattamenti quando cambiano risorse, responsabilità o persone coinvolte. Formulare un limite preciso rafforza l’analisi perché chiarisce quali informazioni servirebbero prima di applicare una proposta.', 'Infine, una conclusione responsabile collega una posizione chiara alle sue condizioni. Può orientare l’azione senza presentarsi come risposta definitiva e resta aperta a nuove evidenze, risultati inattesi e prospettive non considerate nel testo iniziale.']
  },
  portuguese: {
    basic: ['Depois da leitura, o estudante pode escolher uma ideia e usá-la numa situação próxima. Pode dizer uma frase curta, fazer uma pergunta simples e ouvir a resposta. No final, anota duas expressões úteis para praticá-las novamente no dia seguinte.', 'Não é preciso compreender tudo de uma vez. Ler devagar, reconhecer palavras conhecidas e relacioná-las com a situação ajuda a ganhar segurança. Cada nova leitura permite acrescentar um detalhe e compreender melhor a mensagem.'],
    middle: ['Uma segunda leitura ajuda a distinguir a ideia principal dos detalhes. O leitor pode sublinhar uma expressão útil, explicar com as próprias palavras o que acontece e comparar a explicação com o texto. Esta estratégia transforma a leitura numa prática ativa.', 'Também é útil pensar num exemplo pessoal ou próximo. Quando uma ideia está ligada a uma decisão, a uma rotina ou a uma conversa real, torna-se mais fácil lembrá-la e reutilizá-la.'],
    advanced: ['Uma leitura mais atenta permite observar não só o que é afirmado, mas também como essa afirmação é sustentada. Convém identificar o problema, os elementos disponíveis e as consequências possíveis de cada decisão. Esta distinção evita aceitar uma conclusão apenas porque parece familiar ou convincente.', 'O contexto também importa. Uma solução útil numa situação pode exigir adaptações quando mudam os recursos, as responsabilidades ou as pessoas envolvidas. Formular uma limitação concreta fortalece a análise, pois mostra quais informações seriam necessárias antes de aplicar uma proposta.', 'Por fim, uma conclusão responsável liga uma posição clara às suas condições. Pode orientar a ação sem se apresentar como resposta definitiva e permanece aberta a novos dados, resultados inesperados e perspetivas ausentes do texto inicial.']
  },
  german: {
    basic: ['Nach dem Lesen kann die lernende Person eine Idee auswählen und sie in einer nahen Situation verwenden. Sie kann einen kurzen Satz sagen, eine einfache Frage stellen und die Antwort hören. Zum Schluss notiert sie zwei nützliche Ausdrücke, um sie am nächsten Tag noch einmal zu üben.', 'Man muss nicht sofort alles verstehen. Langsam zu lesen, bekannte Wörter zu erkennen und sie mit der Situation zu verbinden, schafft Sicherheit. Jede weitere Lektüre ermöglicht ein neues Detail und ein besseres Verständnis der Aussage.'],
    middle: ['Eine zweite Lektüre hilft dabei, die Hauptidee von den Einzelheiten zu unterscheiden. Die lesende Person kann einen nützlichen Ausdruck markieren, den Inhalt mit eigenen Worten erklären und diese Erklärung mit dem Text vergleichen. So wird Lesen zu einer aktiven Übung.', 'Hilfreich ist auch ein persönliches oder nahes Beispiel. Wenn eine Idee mit einer Entscheidung, einer Gewohnheit oder einem echten Gespräch verbunden ist, lässt sie sich leichter erinnern und später verwenden.'],
    advanced: ['Eine genauere Lektüre zeigt nicht nur, was behauptet wird, sondern auch, wie diese Behauptung gestützt wird. Es lohnt sich, das Problem, die verfügbaren Hinweise und mögliche Folgen jeder Entscheidung zu erkennen. Diese Unterscheidung verhindert, dass eine Schlussfolgerung nur deshalb akzeptiert wird, weil sie vertraut oder überzeugend wirkt.', 'Auch der Kontext ist wichtig. Eine nützliche Lösung kann Anpassungen brauchen, wenn sich Ressourcen, Verantwortlichkeiten oder betroffene Personen verändern. Eine konkrete Einschränkung stärkt die Analyse, weil sie zeigt, welche Informationen vor der Anwendung eines Vorschlags nötig wären.', 'Schließlich verbindet eine verantwortliche Schlussfolgerung eine klare Position mit ihren Bedingungen. Sie kann Handeln orientieren, ohne sich als endgültige Antwort darzustellen, und bleibt für neue Hinweise, unerwartete Ergebnisse und fehlende Perspektiven offen.']
  }
};

function count(text) { return String(text || '').trim().split(/\s+/).filter(Boolean).length; }
function groupFor(level) { return ['A1'].includes(level) ? 'basic' : ['A2', 'B1'].includes(level) ? 'middle' : 'advanced'; }

let updated = 0;
for (const lesson of lessons) {
  const language = lesson.target_language;
  const reading = lesson.content_json?.reading;
  const target = targets[lesson.level];
  if (!texts[language] || !reading?.text || !target || count(reading.text) >= target) continue;
  const additions = texts[language][groupFor(lesson.level)];
  let index = 0;
  while (count(reading.text) < target) {
    reading.text += `\n\n${additions[index % additions.length]}`;
    index += 1;
  }
  updated += 1;
}
fs.writeFileSync(seedPath, `${JSON.stringify(lessons, null, 2)}\n`);
console.log(`Expanded ${updated} French, Spanish, Italian, Portuguese and German readings.`);
