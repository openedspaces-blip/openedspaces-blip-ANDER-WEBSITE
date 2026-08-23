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
  function render(section, kind, selectedLanguage) {
    const content = section.querySelector('.skill-view-content'); if (!content) return;
    const language = languages[selectedLanguage] ? selectedLanguage : 'english';
    const rows = kind === 'adjectives' ? adjectiveRows[language] : adverbSeeds[language];
    const categories = kind === 'adverbs' ? ['todos','modo','lugar','tiempo','frecuencia','grado','afirmación','posibilidad','conexión'] : ['todos'];
    content.innerHTML = `<section class="lexicon-reference" data-kind="${kind}"><header class="lexicon-reference-head"><div><span>REFERENCIA DE VOCABULARIO</span><h2>${kind === 'adjectives' ? 'Adjetivos: comparativo y superlativo' : 'Adverbios por función'}</h2><p>${kind === 'adjectives' ? 'Compara con precisión: forma base, comparativo, superlativo y antónimo cuando corresponde.' : 'Organiza tu expresión con adverbios de modo, lugar, tiempo, frecuencia, grado y conectores.'}</p></div><label>Idioma <select class="lexicon-language">${Object.entries(languages).map(([key,label]) => `<option value="${key}"${key === language ? ' selected' : ''}>${label}</option>`).join('')}</select></label></header><div class="lexicon-toolbar"><label>Buscar <input class="lexicon-search" type="search" placeholder="Escribe una palabra…"></label>${kind === 'adverbs' ? `<div class="lexicon-categories">${categories.map((category) => `<button type="button" data-category="${category}" class="${category === 'todos' ? 'is-active' : ''}">${category}</button>`).join('')}</div>` : ''}</div><p class="lexicon-count"><strong>${rows.length}</strong> ${kind === 'adjectives' ? 'adjetivos esenciales' : 'adverbios y conectores'} en ${languages[language]}</p><div class="lexicon-table-wrap"><table class="lexicon-table"><thead>${kind === 'adjectives' ? '<tr><th>Adjetivo</th><th>Significado</th><th>Comparativo</th><th>Superlativo</th><th>Antónimo</th></tr>' : '<tr><th>Adverbio</th><th>Significado</th><th>Tipo</th></tr>'}</thead><tbody>${rows.map((row) => kind === 'adjectives' ? `<tr data-search="${esc(row.join(' ').toLowerCase())}"><td><strong>${esc(row[0])}</strong></td><td>${esc(row[1])}</td><td>${esc(row[2])}</td><td>${esc(row[3])}</td><td>${esc(row[4] || '—')}</td></tr>` : `<tr data-category="${esc(row[2])}" data-search="${esc(row.join(' ').toLowerCase())}"><td><strong>${esc(row[0])}</strong></td><td>${esc(row[1])}</td><td><span class="lexicon-category">${esc(row[2])}</span></td></tr>`).join('')}</tbody></table></div></section>`;
    const apply = () => { const query = content.querySelector('.lexicon-search').value.trim().toLowerCase(); const active = content.querySelector('.lexicon-categories .is-active')?.dataset.category || 'todos'; let count = 0; content.querySelectorAll('tbody tr').forEach((row) => { const show = (!query || row.dataset.search.includes(query)) && (active === 'todos' || row.dataset.category === active); row.hidden = !show; if (show) count += 1; }); content.querySelector('.lexicon-count').innerHTML = `<strong>${count}</strong> ${kind === 'adjectives' ? 'adjetivos visibles' : 'adverbios y conectores visibles'} en ${languages[language]}`; };
    content.querySelector('.lexicon-search').addEventListener('input', apply);
    content.querySelector('.lexicon-language').addEventListener('change', (event) => render(section, kind, event.target.value));
    content.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => { content.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('is-active', item === button)); apply(); }));
  }
  window.AndergoLexicon = { render };
})();
