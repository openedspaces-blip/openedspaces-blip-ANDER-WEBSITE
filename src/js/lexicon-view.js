/* Global reference catalogues: concise, searchable and independent from a
   particular course unit. The learner's selected target language is the
   default, but any supported language can be consulted at any time. */
(function () {
  const languages = {
    english: 'Inglés', spanish: 'Español', french: 'Francés', italian: 'Italiano',
    portuguese: 'Portugués', german: 'Alemán'
  };
  const adjectiveRows = {
    english: [
      ['big', 'grande', 'bigger', 'the biggest', 'small'], ['small', 'pequeño', 'smaller', 'the smallest', 'big'],
      ['good', 'bueno', 'better', 'the best', 'bad'], ['bad', 'malo', 'worse', 'the worst', 'good'],
      ['beautiful', 'hermoso', 'more beautiful', 'the most beautiful', 'ugly'], ['ugly', 'feo', 'uglier', 'the ugliest', 'beautiful'],
      ['easy', 'fácil', 'easier', 'the easiest', 'difficult'], ['difficult', 'difícil', 'more difficult', 'the most difficult', 'easy'],
      ['fast', 'rápido', 'faster', 'the fastest', 'slow'], ['slow', 'lento', 'slower', 'the slowest', 'fast'],
      ['happy', 'feliz', 'happier', 'the happiest', 'sad'], ['sad', 'triste', 'sadder', 'the saddest', 'happy'],
      ['young', 'joven', 'younger', 'the youngest', 'old'], ['old', 'viejo / mayor', 'older', 'the oldest', 'young'],
      ['expensive', 'caro', 'more expensive', 'the most expensive', 'cheap'], ['cheap', 'barato', 'cheaper', 'the cheapest', 'expensive'],
      ['strong', 'fuerte', 'stronger', 'the strongest', 'weak'], ['weak', 'débil', 'weaker', 'the weakest', 'strong'],
      ['important', 'importante', 'more important', 'the most important', 'unimportant'], ['interesting', 'interesante', 'more interesting', 'the most interesting', 'boring']
    ],
    spanish: [
      ['grande', 'big', 'más grande', 'el/la más grande', 'pequeño'], ['pequeño', 'small', 'más pequeño', 'el/la más pequeño', 'grande'],
      ['bueno', 'good', 'mejor', 'el/la mejor', 'malo'], ['malo', 'bad', 'peor', 'el/la peor', 'bueno'],
      ['bonito', 'beautiful', 'más bonito', 'el/la más bonito', 'feo'], ['feo', 'ugly', 'más feo', 'el/la más feo', 'bonito'],
      ['fácil', 'easy', 'más fácil', 'el/la más fácil', 'difícil'], ['difícil', 'difficult', 'más difícil', 'el/la más difícil', 'fácil'],
      ['rápido', 'fast', 'más rápido', 'el/la más rápido', 'lento'], ['lento', 'slow', 'más lento', 'el/la más lento', 'rápido'],
      ['feliz', 'happy', 'más feliz', 'el/la más feliz', 'triste'], ['triste', 'sad', 'más triste', 'el/la más triste', 'feliz'],
      ['joven', 'young', 'más joven', 'el/la más joven', 'viejo'], ['viejo', 'old', 'más viejo', 'el/la más viejo', 'joven'],
      ['caro', 'expensive', 'más caro', 'el/la más caro', 'barato'], ['barato', 'cheap', 'más barato', 'el/la más barato', 'caro'],
      ['fuerte', 'strong', 'más fuerte', 'el/la más fuerte', 'débil'], ['débil', 'weak', 'más débil', 'el/la más débil', 'fuerte'],
      ['importante', 'important', 'más importante', 'el/la más importante', 'sin importancia'], ['interesante', 'interesting', 'más interesante', 'el/la más interesante', 'aburrido']
    ],
    french: [
      ['grand', 'grande', 'plus grand', 'le/la plus grand', 'petit'], ['petit', 'pequeño', 'plus petit', 'le/la plus petit', 'grand'],
      ['bon', 'bueno', 'meilleur', 'le/la meilleur(e)', 'mauvais'], ['mauvais', 'malo', 'pire', 'le/la pire', 'bon'],
      ['beau', 'hermoso', 'plus beau', 'le/la plus beau/belle', 'laid'], ['laid', 'feo', 'plus laid', 'le/la plus laid', 'beau'],
      ['facile', 'fácil', 'plus facile', 'le/la plus facile', 'difficile'], ['difficile', 'difícil', 'plus difficile', 'le/la plus difficile', 'facile'],
      ['rapide', 'rápido', 'plus rapide', 'le/la plus rapide', 'lent'], ['lent', 'lento', 'plus lent', 'le/la plus lent', 'rapide'],
      ['heureux', 'feliz', 'plus heureux', 'le/la plus heureux/heureuse', 'triste'], ['triste', 'triste', 'plus triste', 'le/la plus triste', 'heureux'],
      ['jeune', 'joven', 'plus jeune', 'le/la plus jeune', 'vieux'], ['vieux', 'viejo', 'plus vieux', 'le/la plus vieux/vieille', 'jeune'],
      ['cher', 'caro', 'plus cher', 'le/la plus cher/chère', 'bon marché'], ['bon marché', 'barato', 'moins cher', 'le moins cher', 'cher'],
      ['fort', 'fuerte', 'plus fort', 'le/la plus fort/forte', 'faible'], ['faible', 'débil', 'plus faible', 'le/la plus faible', 'fort'],
      ['important', 'importante', 'plus important', 'le/la plus important(e)', 'secondaire'], ['intéressant', 'interesante', 'plus intéressant', 'le/la plus intéressant(e)', 'ennuyeux']
    ],
    italian: [
      ['grande', 'grande', 'più grande', 'il/la più grande', 'piccolo'], ['piccolo', 'pequeño', 'più piccolo', 'il/la più piccolo', 'grande'],
      ['buono', 'bueno', 'migliore', 'il/la migliore', 'cattivo'], ['cattivo', 'malo', 'peggiore', 'il/la peggiore', 'buono'],
      ['bello', 'hermoso', 'più bello', 'il/la più bello/a', 'brutto'], ['brutto', 'feo', 'più brutto', 'il/la più brutto/a', 'bello'],
      ['facile', 'fácil', 'più facile', 'il/la più facile', 'difficile'], ['difficile', 'difícil', 'più difficile', 'il/la più difficile', 'facile'],
      ['veloce', 'rápido', 'più veloce', 'il/la più veloce', 'lento'], ['lento', 'lento', 'più lento', 'il/la più lento/a', 'veloce'],
      ['felice', 'feliz', 'più felice', 'il/la più felice', 'triste'], ['triste', 'triste', 'più triste', 'il/la più triste', 'felice'],
      ['giovane', 'joven', 'più giovane', 'il/la più giovane', 'vecchio'], ['vecchio', 'viejo', 'più vecchio', 'il/la più vecchio/a', 'giovane'],
      ['costoso', 'caro', 'più costoso', 'il/la più costoso/a', 'economico'], ['economico', 'barato', 'più economico', 'il/la più economico/a', 'costoso'],
      ['forte', 'fuerte', 'più forte', 'il/la più forte', 'debole'], ['debole', 'débil', 'più debole', 'il/la più debole', 'forte'],
      ['importante', 'importante', 'più importante', 'il/la più importante', 'secondario'], ['interessante', 'interesante', 'più interessante', 'il/la più interessante', 'noioso']
    ],
    portuguese: [
      ['grande', 'grande', 'maior', 'o/a maior', 'pequeno'], ['pequeno', 'pequeño', 'menor', 'o/a menor', 'grande'],
      ['bom', 'bueno', 'melhor', 'o/a melhor', 'mau'], ['mau', 'malo', 'pior', 'o/a pior', 'bom'],
      ['bonito', 'hermoso', 'mais bonito', 'o/a mais bonito/a', 'feio'], ['feio', 'feo', 'mais feio', 'o/a mais feio/a', 'bonito'],
      ['fácil', 'fácil', 'mais fácil', 'o/a mais fácil', 'difícil'], ['difícil', 'difícil', 'mais difícil', 'o/a mais difícil', 'fácil'],
      ['rápido', 'rápido', 'mais rápido', 'o/a mais rápido/a', 'lento'], ['lento', 'lento', 'mais lento', 'o/a mais lento/a', 'rápido'],
      ['feliz', 'feliz', 'mais feliz', 'o/a mais feliz', 'triste'], ['triste', 'triste', 'mais triste', 'o/a mais triste', 'feliz'],
      ['jovem', 'joven', 'mais jovem', 'o/a mais jovem', 'velho'], ['velho', 'viejo', 'mais velho', 'o/a mais velho/a', 'jovem'],
      ['caro', 'caro', 'mais caro', 'o/a mais caro/a', 'barato'], ['barato', 'barato', 'mais barato', 'o/a mais barato/a', 'caro'],
      ['forte', 'fuerte', 'mais forte', 'o/a mais forte', 'fraco'], ['fraco', 'débil', 'mais fraco', 'o/a mais fraco/a', 'forte'],
      ['importante', 'importante', 'mais importante', 'o/a mais importante', 'secundário'], ['interessante', 'interesante', 'mais interessante', 'o/a mais interessante', 'entediante']
    ],
    german: [
      ['groß', 'grande', 'größer', 'am größten', 'klein'], ['klein', 'pequeño', 'kleiner', 'am kleinsten', 'groß'],
      ['gut', 'bueno', 'besser', 'am besten', 'schlecht'], ['schlecht', 'malo', 'schlechter', 'am schlechtesten', 'gut'],
      ['schön', 'hermoso', 'schöner', 'am schönsten', 'hässlich'], ['hässlich', 'feo', 'hässlicher', 'am hässlichsten', 'schön'],
      ['leicht', 'fácil', 'leichter', 'am leichtesten', 'schwierig'], ['schwierig', 'difícil', 'schwieriger', 'am schwierigsten', 'leicht'],
      ['schnell', 'rápido', 'schneller', 'am schnellsten', 'langsam'], ['langsam', 'lento', 'langsamer', 'am langsamsten', 'schnell'],
      ['glücklich', 'feliz', 'glücklicher', 'am glücklichsten', 'traurig'], ['traurig', 'triste', 'trauriger', 'am traurigsten', 'glücklich'],
      ['jung', 'joven', 'jünger', 'am jüngsten', 'alt'], ['alt', 'viejo', 'älter', 'am ältesten', 'jung'],
      ['teuer', 'caro', 'teurer', 'am teuersten', 'billig'], ['billig', 'barato', 'billiger', 'am billigsten', 'teuer'],
      ['stark', 'fuerte', 'stärker', 'am stärksten', 'schwach'], ['schwach', 'débil', 'schwächer', 'am schwächsten', 'stark'],
      ['wichtig', 'importante', 'wichtiger', 'am wichtigsten', 'unwichtig'], ['interessant', 'interesante', 'interessanter', 'am interessantesten', 'langweilig']
    ]
  };
  const adverbSeeds = {
    english: [['carefully','cuidadosamente','modo'],['quickly','rápidamente','modo'],['well','bien','modo'],['badly','mal','modo'],['here','aquí','lugar'],['there','allí','lugar'],['nearby','cerca','lugar'],['everywhere','en todas partes','lugar'],['now','ahora','tiempo'],['today','hoy','tiempo'],['yesterday','ayer','tiempo'],['soon','pronto','tiempo'],['always','siempre','frecuencia'],['often','a menudo','frecuencia'],['sometimes','a veces','frecuencia'],['never','nunca','frecuencia'],['very','muy','grado'],['too','demasiado','grado'],['almost','casi','grado'],['enough','suficiente','grado'],['certainly','ciertamente','afirmación'],['perhaps','quizás','posibilidad'],['therefore','por lo tanto','conexión'],['however','sin embargo','conexión']],
    spanish: [['cuidadosamente','carefully','modo'],['rápidamente','quickly','modo'],['bien','well','modo'],['mal','badly','modo'],['aquí','here','lugar'],['allí','there','lugar'],['cerca','nearby','lugar'],['en todas partes','everywhere','lugar'],['ahora','now','tiempo'],['hoy','today','tiempo'],['ayer','yesterday','tiempo'],['pronto','soon','tiempo'],['siempre','always','frecuencia'],['a menudo','often','frecuencia'],['a veces','sometimes','frecuencia'],['nunca','never','frecuencia'],['muy','very','grado'],['demasiado','too','grado'],['casi','almost','grado'],['suficiente','enough','grado'],['ciertamente','certainly','afirmación'],['quizás','perhaps','posibilidad'],['por lo tanto','therefore','conexión'],['sin embargo','however','conexión']],
    french: [['soigneusement','cuidadosamente','modo'],['rapidement','rápidamente','modo'],['bien','bien','modo'],['mal','mal','modo'],['ici','aquí','lugar'],['là-bas','allí','lugar'],['près','cerca','lugar'],['partout','en todas partes','lugar'],['maintenant','ahora','tiempo'],["aujourd’hui",'hoy','tiempo'],['hier','ayer','tiempo'],['bientôt','pronto','tiempo'],['toujours','siempre','frecuencia'],['souvent','a menudo','frecuencia'],['parfois','a veces','frecuencia'],['jamais','nunca','frecuencia'],['très','muy','grado'],['trop','demasiado','grado'],['presque','casi','grado'],['assez','bastante','grado'],['certainement','ciertamente','afirmación'],['peut-être','quizás','posibilidad'],['donc','por lo tanto','conexión'],['cependant','sin embargo','conexión']],
    italian: [['attentamente','cuidadosamente','modo'],['rapidamente','rápidamente','modo'],['bene','bien','modo'],['male','mal','modo'],['qui','aquí','lugar'],['lì','allí','lugar'],['vicino','cerca','lugar'],['ovunque','en todas partes','lugar'],['adesso','ahora','tiempo'],['oggi','hoy','tiempo'],['ieri','ayer','tiempo'],['presto','pronto','tiempo'],['sempre','siempre','frecuencia'],['spesso','a menudo','frecuencia'],['a volte','a veces','frecuencia'],['mai','nunca','frecuencia'],['molto','muy','grado'],['troppo','demasiado','grado'],['quasi','casi','grado'],['abbastanza','bastante','grado'],['certamente','ciertamente','afirmación'],['forse','quizás','posibilidad'],['quindi','por lo tanto','conexión'],['tuttavia','sin embargo','conexión']],
    portuguese: [['cuidadosamente','cuidadosamente','modo'],['rapidamente','rápidamente','modo'],['bem','bien','modo'],['mal','mal','modo'],['aqui','aquí','lugar'],['ali','allí','lugar'],['perto','cerca','lugar'],['em toda parte','en todas partes','lugar'],['agora','ahora','tiempo'],['hoje','hoy','tiempo'],['ontem','ayer','tiempo'],['logo','pronto','tiempo'],['sempre','siempre','frecuencia'],['frequentemente','a menudo','frecuencia'],['às vezes','a veces','frecuencia'],['nunca','nunca','frecuencia'],['muito','muy','grado'],['demais','demasiado','grado'],['quase','casi','grado'],['bastante','bastante','grado'],['certamente','ciertamente','afirmación'],['talvez','quizás','posibilidad'],['portanto','por lo tanto','conexión'],['porém','sin embargo','conexión']],
    german: [['sorgfältig','cuidadosamente','modo'],['schnell','rápidamente','modo'],['gut','bien','modo'],['schlecht','mal','modo'],['hier','aquí','lugar'],['dort','allí','lugar'],['in der Nähe','cerca','lugar'],['überall','en todas partes','lugar'],['jetzt','ahora','tiempo'],['heute','hoy','tiempo'],['gestern','ayer','tiempo'],['bald','pronto','tiempo'],['immer','siempre','frecuencia'],['oft','a menudo','frecuencia'],['manchmal','a veces','frecuencia'],['nie','nunca','frecuencia'],['sehr','muy','grado'],['zu','demasiado','grado'],['fast','casi','grado'],['genug','suficiente','grado'],['sicherlich','ciertamente','afirmación'],['vielleicht','quizás','posibilidad'],['deshalb','por lo tanto','conexión'],['jedoch','sin embargo','conexión']]
  };
  const esc = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
  const locales = { english: 'en-US', spanish: 'es-ES', french: 'fr-FR', italian: 'it-IT', portuguese: 'pt-BR', german: 'de-DE' };
  const adverbExamples = {
    english: { modo: (word) => `I work ${word}.`, lugar: (word) => `The book is ${word}.`, tiempo: (word) => `${word}, I will study.`, frecuencia: (word) => `I ${word} practise.`, grado: (word) => `It is ${word} useful.`, afirmación: (word) => `${word}, it is true.`, posibilidad: (word) => `${word}, we can go.`, conexión: (word) => `${word}, we continue.` },
    spanish: { modo: (word) => `Trabajo ${word}.`, lugar: (word) => `El libro está ${word}.`, tiempo: (word) => `${word}, voy a estudiar.`, frecuencia: (word) => `${word} practico.`, grado: (word) => `Es ${word} útil.`, afirmación: (word) => `${word}, es verdad.`, posibilidad: (word) => `${word}, podemos ir.`, conexión: (word) => `${word}, continuamos.` },
    french: { modo: (word) => `Je travaille ${word}.`, lugar: (word) => `Le livre est ${word}.`, tiempo: (word) => `${word}, je vais étudier.`, frecuencia: (word) => `Je pratique ${word}.`, grado: (word) => `C’est ${word} utile.`, afirmación: (word) => `${word}, c’est vrai.`, posibilidad: (word) => `${word}, nous pouvons y aller.`, conexión: (word) => `${word}, nous continuons.` },
    italian: { modo: (word) => `Lavoro ${word}.`, lugar: (word) => `Il libro è ${word}.`, tiempo: (word) => `${word}, studierò.`, frecuencia: (word) => `Mi esercito ${word}.`, grado: (word) => `È ${word} utile.`, afirmación: (word) => `${word}, è vero.`, posibilidad: (word) => `${word}, possiamo andare.`, conexión: (word) => `${word}, continuiamo.` },
    portuguese: { modo: (word) => `Trabalho ${word}.`, lugar: (word) => `O livro está ${word}.`, tiempo: (word) => `${word}, vou estudar.`, frecuencia: (word) => `Eu pratico ${word}.`, grado: (word) => `É ${word} útil.`, afirmación: (word) => `${word}, é verdade.`, posibilidad: (word) => `${word}, podemos ir.`, conexión: (word) => `${word}, continuamos.` },
    german: { modo: (word) => `Ich arbeite ${word}.`, lugar: (word) => `Das Buch ist ${word}.`, tiempo: (word) => `${word} werde ich lernen.`, frecuencia: (word) => `Ich übe ${word}.`, grado: (word) => `Es ist ${word} nützlich.`, afirmación: (word) => `${word}, es ist wahr.`, posibilidad: (word) => `${word} können wir gehen.`, conexión: (word) => `${word} machen wir weiter.` }
  };
  const adjectiveExamples = {
    english: (row) => [`This option is ${row[2]} than the other one.`, `It is ${row[3]} choice for this task.`],
    spanish: (row) => [`Esta opción es ${row[2]} que la otra.`, `Es la opción ${row[3]} para esta tarea.`],
    french: (row) => [`Cette option est ${row[2]} que l’autre.`, `C’est l’option ${row[3]} pour cette tâche.`],
    italian: (row) => [`Questa opzione è ${row[2]} dell’altra.`, `È l’opzione ${row[3]} per questo compito.`],
    portuguese: (row) => [`Esta opção é ${row[2]} que a outra.`, `É a opção ${row[3]} para esta tarefa.`],
    german: (row) => [`Diese Option ist ${row[2]} als die andere.`, `Sie ist ${row[3]} Wahl für diese Aufgabe.`]
  };
  function flashcardHtml(row, kind, language) {
    const adjective = kind === 'adjectives';
    const example = adjective ? '' : (adverbExamples[language][row[2]] || (() => row[0]))(row[0]);
    const adjectiveMore = adjective
      ? `<button type="button" class="lexicon-more-btn" aria-expanded="false">Ver más</button><div class="lexicon-more-details" hidden><div class="lexicon-example"><dt>Ejemplo comparativo</dt><dd>${esc(adjectiveExamples[language](row)[0])}</dd></div><div class="lexicon-example"><dt>Ejemplo superlativo</dt><dd>${esc(adjectiveExamples[language](row)[1])}</dd></div><div class="lexicon-synonym-row"><span>Sinónimo: —</span><span>Antónimo: ${esc(row[4] || '—')}</span></div></div>`
      : '';
    const details = adjective
      ? `<dl><div><dt>Significado</dt><dd>${esc(row[1])}</dd></div><div><dt>Comparativo</dt><dd>${esc(row[2])}</dd></div><div><dt>Superlativo</dt><dd>${esc(row[3])}</dd></div><div><dt>Antónimo</dt><dd>${esc(row[4] || '—')}</dd></div></dl>${adjectiveMore}`
      : `<dl><div><dt>Significado</dt><dd>${esc(row[1])}</dd></div><div><dt>Tipo</dt><dd>${esc(row[2])}</dd></div><div class="lexicon-example"><dt>Ejemplo</dt><dd>${esc(example)}</dd></div></dl>`;
    return `<article class="lexicon-flashcard" data-category="${adjective ? '' : esc(row[2])}" data-search="${esc(row.join(' ').toLowerCase())}" tabindex="0" role="button" aria-label="Ver detalles de ${esc(row[0])}"><div class="lexicon-flashcard-inner"><div class="lexicon-flashcard-face lexicon-flashcard-front"><span class="lexicon-flashcard-kicker">${adjective ? 'ADJETIVO' : esc(row[2]).toUpperCase()}</span><strong>${esc(row[0])}</strong><button type="button" class="lexicon-speak" data-speak="${esc(row[0])}" aria-label="Escuchar ${esc(row[0])}">🔊</button><small>Toca para ver detalles</small></div><div class="lexicon-flashcard-face lexicon-flashcard-back">${details}<small>Toca para volver</small></div></div></article>`;
  }
  function render(section, kind, selectedLanguage) {
    const content = section.querySelector('.skill-view-content'); if (!content) return;
    const language = languages[selectedLanguage] ? selectedLanguage : 'english';
    const rows = kind === 'adjectives' ? adjectiveRows[language] : adverbSeeds[language];
    const categories = kind === 'adverbs' ? ['todos','modo','lugar','tiempo','frecuencia','grado','afirmación','posibilidad','conexión'] : ['todos'];
    content.innerHTML = `<section class="lexicon-reference" data-kind="${kind}"><header class="lexicon-reference-head"><div><span>FLASHCARDS DE VOCABULARIO</span><h2>${kind === 'adjectives' ? 'Adjetivos: comparativo y superlativo' : 'Adverbios por función'}</h2><p>${kind === 'adjectives' ? 'Gira cada tarjeta para comparar sus formas y descubrir el antónimo.' : 'Gira cada tarjeta para ver su tipo, significado y un ejemplo en contexto.'}</p></div><label>Idioma <select class="lexicon-language">${Object.entries(languages).map(([key,label]) => `<option value="${key}"${key === language ? ' selected' : ''}>${label}</option>`).join('')}</select></label></header><div class="lexicon-toolbar"><label>Buscar <input class="lexicon-search" type="search" placeholder="Escribe una palabra…"></label>${kind === 'adverbs' ? `<div class="lexicon-categories">${categories.map((category) => `<button type="button" data-category="${category}" class="${category === 'todos' ? 'is-active' : ''}">${category}</button>`).join('')}</div>` : ''}</div><p class="lexicon-count"><strong>${rows.length}</strong> ${kind === 'adjectives' ? 'adjetivos' : 'adverbios y conectores'} en ${languages[language]}</p><div class="lexicon-flashcard-grid">${rows.map((row) => flashcardHtml(row, kind, language)).join('')}</div></section>`;
    const apply = () => { const query = content.querySelector('.lexicon-search').value.trim().toLowerCase(); const active = content.querySelector('.lexicon-categories .is-active')?.dataset.category || 'todos'; let count = 0; content.querySelectorAll('.lexicon-flashcard').forEach((row) => { const show = (!query || row.dataset.search.includes(query)) && (active === 'todos' || row.dataset.category === active); row.hidden = !show; if (show) count += 1; }); content.querySelector('.lexicon-count').innerHTML = `<strong>${count}</strong> ${kind === 'adjectives' ? 'adjetivos visibles' : 'adverbios y conectores visibles'} en ${languages[language]}`; };
    content.querySelector('.lexicon-search').addEventListener('input', apply);
    content.querySelector('.lexicon-language').addEventListener('change', (event) => render(section, kind, event.target.value));
    content.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => { content.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('is-active', item === button)); apply(); }));
    content.querySelectorAll('.lexicon-flashcard').forEach((card) => { const flip = () => card.classList.toggle('is-flipped'); card.addEventListener('click', (event) => { if (!event.target.closest('.lexicon-speak, .lexicon-more-btn')) flip(); }); card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flip(); } }); });
    content.querySelectorAll('.lexicon-more-btn').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); const details = button.nextElementSibling; const willOpen = details.hidden; details.hidden = !willOpen; button.textContent = willOpen ? 'Ver menos' : 'Ver más'; button.setAttribute('aria-expanded', String(willOpen)); button.closest('.lexicon-flashcard')?.classList.toggle('is-expanded', willOpen); }));
    content.querySelectorAll('.lexicon-speak').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); if (!window.speechSynthesis) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(button.dataset.speak); utterance.lang = locales[language]; window.speechSynthesis.speak(utterance); }));
  }
  window.AndergoLexicon = { render };
})();
