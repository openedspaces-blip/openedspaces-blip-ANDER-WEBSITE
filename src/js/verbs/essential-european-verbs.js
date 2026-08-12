// Compact, offline A1-B1 catalogues. The conjugator starts with present and
// the everyday completed-past form, useful across these routes.
(function () {
  const lists = {
    italian: 'essere avere fare dire andare vedere sapere potere volere venire dovere prendere trovare dare parlare mettere passare guardare amare credere chiedere restare rispondere sentire pensare arrivare conoscere diventare tenere capire aspettare uscire vivere entrare portare cercare tornare chiamare morire partire seguire scrivere mostrare cadere aprire fermare perdere cominciare camminare ascoltare salire ricevere servire finire ridere leggere lasciare continuare mangiare bere correre dormire lavorare giocare studiare imparare scegliere riuscire riflettere riempire crescere agire provare usare cambiare aiutare vincere dimenticare chiudere spiegare comprare vendere inviare condurre costruire nascere lanciare decidere iniziare ricordare pagare incontrare viaggiare lavare cucinare telefonare preferire offrire spendere mandare'.split(' '),
    portuguese: 'ser estar ter fazer dizer ir ver saber poder querer vir dever pegar encontrar dar falar colocar passar olhar amar acreditar perguntar ficar responder ouvir pensar chegar conhecer tornar sentir manter entender esperar sair viver entrar levar procurar voltar chamar morrer partir seguir escrever mostrar cair abrir parar perder começar andar subir receber servir terminar rir ler deixar continuar comer beber correr dormir trabalhar jogar estudar aprender escolher conseguir refletir encher crescer agir tentar usar mudar ajudar ganhar esquecer fechar explicar comprar vender enviar dirigir construir nascer lançar decidir lembrar pagar viajar lavar cozinhar telefonar preferir oferecer gastar mandar visitar morar precisar'.split(' '),
    german: 'sein haben werden machen sagen gehen sehen wissen können wollen kommen sollen nehmen finden geben sprechen stellen bleiben lieben glauben fragen antworten hören denken ankommen kennen fühlen halten verstehen warten ausgehen leben eintreten tragen suchen zurückkommen rufen sterben verlassen folgen schreiben zeigen fallen öffnen stoppen verlieren beginnen laufen zuhören steigen bekommen dienen enden lachen lesen lassen fortsetzen essen trinken rennen schlafen arbeiten spielen studieren lernen wählen gelingen nachdenken füllen wachsen handeln versuchen benutzen ändern helfen gewinnen vergessen schließen erklären kaufen verkaufen senden fahren bauen werfen entscheiden anfangen bezahlen treffen reisen waschen kochen anrufen bevorzugen anbieten ausgeben schicken besuchen wohnen brauchen'.split(' ')
  };
  const meta = {
    italian: { persons: ['io','tu','lui/lei','noi','voi','loro'], labels: ['Presente','Passato prossimo'] },
    portuguese: { persons: ['eu','você','ele/ela','nós','vocês','eles/elas'], labels: ['Presente','Pretérito perfeito'] },
    german: { persons: ['ich','du','er/sie/es','wir','ihr','sie/Sie'], labels: ['Präsens','Perfekt'] }
  };
  function makeForms(language, infinitive) {
    if (language === 'german') {
      const stem = infinitive.replace(/en$/, '');
      return { present: ['e','st','t','en','t','en'].map((x) => stem + x), past: ['habe','hast','hat','haben','habt','haben'].map((x) => `${x} ge${stem}t`), pp: `ge${stem}t` };
    }
    const ending = infinitive.slice(-2); const stem = infinitive.slice(0, -2);
    const endings = language === 'italian'
      ? (infinitive.endsWith('are') ? ['o','i','a','iamo','ate','ano'] : infinitive.endsWith('ire') ? ['o','i','e','iamo','ite','ono'] : ['o','i','e','iamo','ete','ono'])
      : (ending === 'ar' ? ['o','a','a','amos','am','am'] : ending === 'ir' ? ['o','e','e','imos','em','em'] : ['o','e','e','emos','em','em']);
    const pp = language === 'italian' ? `${stem}${infinitive.endsWith('are') ? 'ato' : 'uto'}` : `${stem}${ending === 'ar' ? 'ado' : 'ido'}`;
    const past = language === 'italian' ? ['ho','hai','ha','abbiamo','avete','hanno'].map((x) => `${x} ${pp}`) : ['eu','você','ele','nós','vocês','eles'].map((x) => `${x} ${stem}${ending === 'ar' ? 'ei' : 'i'}`);
    return { present: endings.map((x) => stem + x), past, pp };
  }
  window.ANDERGO_VERBS_DATA = window.ANDERGO_VERBS_DATA || {};
  window.AndergoVerbConjugations = window.AndergoVerbConjugations || {};
  Object.entries(lists).forEach(([language, words]) => {
    window.ANDERGO_VERBS_DATA[language] = words.slice(0, 100).map((infinitive, index) => {
      const forms = makeForms(language, infinitive);
      const level = index < 34 ? 'A1' : index < 67 ? 'A2' : 'B1';
      return { id: `verb-${language}-${infinitive}`, language, rank: index + 1, infinitive, regular: true, group: 'formas esenciales', level, forms: { thirdPersonSingular: forms.present[2], pastSimple: forms.past[0], pastParticiple: forms.pp, presentParticiple: '—', presentRows: forms.present, pastRows: forms.past }, translation: { spanish: 'verbo frecuente' }, directDefinition: { [language]: `Verbo frecuente: ${infinitive}.` }, pronunciation: '', audioText: infinitive, examples: {}, commonCollocations: [], synonyms: [], antonyms: [], notes: `Formas esenciales ${level}: presente y pasado cotidiano.` };
    });
    window.AndergoVerbConjugations[language] = { TENSES: [{ id: 'presentSimple', label: meta[language].labels[0] }, { id: 'pastSimple', label: meta[language].labels[1] }], conjugateTense(raw, tense) { const rows = tense === 'pastSimple' ? raw.forms.pastRows : raw.forms.presentRows; return { rows: meta[language].persons.map((person, index) => ({ label: person, affirmative: rows[index], negative: '', interrogative: '' })), note: 'Formas esenciales para conversación diaria.' }; } };
  });
})();
