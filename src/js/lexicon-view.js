/* Global reference catalogues: concise, searchable and independent from a
   particular course unit. The learner's selected target language is the
   default, but any supported language can be consulted at any time. */
(function () {
  const languages = {
    english: 'Inglés', spanish: 'Español', french: 'Francés', italian: 'Italiano',
    portuguese: 'Portugués', german: 'Alemán'
  };
  const renderedReferences = new Map();
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
  // Keep the Free selection equally useful in every language: the original
  // core shelf has 20 adjectives, so these five complete its 25 essentials.
  const essentialAdjectiveAdditions = {
    english: [
      ['tall', 'alto', 'taller', 'the tallest', 'short'], ['short', 'bajo / corto', 'shorter', 'the shortest', 'tall'],
      ['hot', 'caliente', 'hotter', 'the hottest', 'cold'], ['cold', 'frío', 'colder', 'the coldest', 'hot'], ['clean', 'limpio', 'cleaner', 'the cleanest', 'dirty']
    ],
    spanish: [
      ['alto', 'tall', 'más alto', 'el/la más alto/a', 'bajo'], ['bajo', 'short', 'más bajo', 'el/la más bajo/a', 'alto'],
      ['caliente', 'hot', 'más caliente', 'el/la más caliente', 'frío'], ['frío', 'cold', 'más frío', 'el/la más frío', 'caliente'], ['limpio', 'clean', 'más limpio', 'el/la más limpio', 'sucio']
    ],
    french: [
      ['haut', 'alto', 'plus haut', 'le/la plus haut(e)', 'bas'], ['bas', 'bajo', 'plus bas', 'le/la plus bas(se)', 'haut'],
      ['chaud', 'caliente', 'plus chaud', 'le/la plus chaud(e)', 'froid'], ['froid', 'frío', 'plus froid', 'le/la plus froid(e)', 'chaud'], ['propre', 'limpio', 'plus propre', 'le/la plus propre', 'sale']
    ],
    italian: [
      ['alto', 'alto', 'più alto', 'il/la più alto/a', 'basso'], ['basso', 'bajo', 'più basso', 'il/la più basso/a', 'alto'],
      ['caldo', 'caliente', 'più caldo', 'il/la più caldo/a', 'freddo'], ['freddo', 'frío', 'più freddo', 'il/la più freddo/a', 'caldo'], ['pulito', 'limpio', 'più pulito', 'il/la più pulito/a', 'sporco']
    ],
    portuguese: [
      ['alto', 'alto', 'mais alto', 'o/a mais alto/a', 'baixo'], ['baixo', 'bajo', 'mais baixo', 'o/a mais baixo/a', 'alto'],
      ['quente', 'caliente', 'mais quente', 'o/a mais quente', 'frio'], ['frio', 'frío', 'mais frio', 'o/a mais frio', 'quente'], ['limpo', 'limpio', 'mais limpo', 'o/a mais limpo', 'sujo']
    ],
    german: [
      ['hoch', 'alto', 'höher', 'am höchsten', 'niedrig'], ['niedrig', 'bajo', 'niedriger', 'am niedrigsten', 'hoch'],
      ['heiß', 'caliente', 'heißer', 'am heißesten', 'kalt'], ['kalt', 'frío', 'kälter', 'am kältesten', 'heiß'], ['sauber', 'limpio', 'sauberer', 'am saubersten', 'schmutzig']
    ]
  };
  Object.entries(essentialAdjectiveAdditions).forEach(([language, rows]) => {
    adjectiveRows[language].push(...rows);
  });
  // The reference catalogue is deliberately independent from a single lesson.
  // English previously stopped at the 20 sample cards above; keep a real 200-
  // word reference shelf so learners can search and practise beyond A1.
  const englishAdjectiveExpansion = `able|capaz|unable
absent|ausente|present
active|activo|inactive
afraid|asustado|brave
alive|vivo|dead
angry|enojado|calm
anxious|ansioso|relaxed
awake|despierto|asleep
awful|horrible|wonderful
basic|básico|advanced
brave|valiente|cowardly
bright|brillante|dark
calm|tranquilo|nervous
careful|cuidadoso|careless
certain|seguro|uncertain
clean|limpio|dirty
clear|claro|unclear
clever|ingenioso|foolish
close|cercano|distant
cloudy|nublado|sunny
cold|frío|hot
comfortable|cómodo|uncomfortable
common|común|rare
complete|completo|incomplete
complex|complejo|simple
confident|seguro|insecure
convenient|conveniente|inconvenient
correct|correcto|wrong
creative|creativo|uncreative
crowded|concurrido|empty
curious|curioso|indifferent
dangerous|peligroso|safe
dark|oscuro|bright
deep|profundo|shallow
delicious|delicioso|awful
different|diferente|similar
direct|directo|indirect
dirty|sucio|clean
dry|seco|wet
early|temprano|late
efficient|eficiente|inefficient
empty|vacío|full
enormous|enorme|tiny
equal|igual|unequal
excellent|excelente|poor
exciting|emocionante|boring
fair|justo|unfair
famous|famoso|unknown
far|lejano|near
fashionable|de moda|old-fashioned
friendly|amigable|unfriendly
fresh|fresco|stale
full|lleno|empty
funny|divertido|serious
generous|generoso|selfish
gentle|amable|rough
glad|contento|sad
healthy|saludable|unhealthy
heavy|pesado|light
helpful|útil|useless
honest|honesto|dishonest
hot|caliente|cold
hungry|hambriento|full
ideal|ideal|unsuitable
ill|enfermo|healthy
important|importante|unimportant
independent|independiente|dependent
intelligent|inteligente|stupid
kind|amable|unkind
late|tarde|early
lazy|perezoso|hardworking
light|ligero|heavy
likely|probable|unlikely
lonely|solo|sociable
loud|ruidoso|quiet
lucky|afortunado|unlucky
modern|moderno|traditional
narrow|estrecho|wide
necessary|necesario|unnecessary
nervous|nervioso|calm
new|nuevo|old
nice|agradable|unpleasant
noisy|ruidoso|quiet
normal|normal|unusual
obvious|evidente|unclear
open|abierto|closed
ordinary|ordinario|special
organized|organizado|disorganized
patient|paciente|impatient
peaceful|pacífico|violent
perfect|perfecto|imperfect
pleasant|agradable|unpleasant
polite|cortés|rude
poor|pobre|rich
popular|popular|unpopular
possible|posible|impossible
powerful|poderoso|weak
practical|práctico|impractical
prepared|preparado|unprepared
pretty|bonito|ugly
private|privado|public
proud|orgulloso|ashamed
public|público|private
quiet|silencioso|noisy
rare|raro|common
ready|listo|unprepared
real|real|imaginary
reasonable|razonable|unreasonable
recent|reciente|old
relaxed|relajado|anxious
reliable|confiable|unreliable
rich|rico|poor
safe|seguro|dangerous
salty|salado|sweet
serious|serio|funny
sharp|afilado|blunt
short|corto|long
shy|tímido|confident
sick|enfermo|healthy
simple|simple|complex
sincere|sincero|insincere
skillful|hábil|unskilled
soft|suave|hard
special|especial|ordinary
spicy|picante|mild
strange|extraño|normal
strict|estricto|flexible
successful|exitoso|unsuccessful
sunny|soleado|cloudy
sweet|dulce|bitter
tall|alto|short
terrible|terrible|excellent
thirsty|sediento|satisfied
thin|delgado|thick
tidy|ordenado|messy
tired|cansado|energetic
traditional|tradicional|modern
true|verdadero|false
uncomfortable|incómodo|comfortable
unfair|injusto|fair
unusual|inusual|normal
useful|útil|useless
warm|cálido|cold
wet|mojado|dry
wide|ancho|narrow
wild|salvaje|tame
willing|dispuesto|unwilling
wise|sabio|foolish
wonderful|maravilloso|awful
worried|preocupado|calm
wrong|incorrecto|correct
yellow|amarillo|blue
blue|azul|red
red|rojo|green
green|verde|red
black|negro|white
white|blanco|black
brown|marrón|white
grey|gris|bright
orange|naranja|blue
pink|rosa|grey
purple|morado|yellow
round|redondo|square
square|cuadrado|round
straight|recto|curved
curved|curvo|straight
angular|anguloso|round
attractive|atractivo|unattractive
beautiful|hermoso|ugly
bland|insípido|flavorful
blunt|sin filo|sharp
boring|aburrido|exciting
broken|roto|whole
careless|descuidado|careful
central|central|remote
cheap|barato|expensive
cheerful|alegre|sad
chilly|fresco|warm
closed|cerrado|open
coastal|costero|inland
colorful|colorido|plain
competitive|competitivo|cooperative
concerned|preocupado|calm
conscious|consciente|unaware
constant|constante|variable
contemporary|contemporáneo|ancient
cool|fresco|warm
cooperative|cooperativo|uncooperative
critical|crítico|uncritical
daily|diario|occasional
deaf|sordo|hearing
dependent|dependiente|independent
digital|digital|analog
distant|distante|close
domestic|doméstico|foreign
dramatic|dramático|ordinary
dull|apagado|bright
eager|deseoso|reluctant
economic|económico|expensive
educational|educativo|uneducational
emotional|emocional|calm
energetic|enérgico|tired
enormous|enorme|tiny
environmental|ambiental|industrial
essential|esencial|optional
ethical|ético|unethical
everyday|cotidiano|unusual
exact|exacto|approximate
familiar|familiar|unfamiliar
flexible|flexible|rigid
foreign|extranjero|domestic
formal|formal|informal
free|libre|busy
frequent|frecuente|rare
global|global|local
grateful|agradecido|ungrateful
harmful|dañino|harmless
harmless|inofensivo|harmful
historical|histórico|modern
human|humano|inhuman
immediate|inmediato|delayed
impatient|impaciente|patient
impressive|impresionante|ordinary
inclusive|inclusivo|exclusive
informal|informal|formal
inner|interior|outer
international|internacional|national
legal|legal|illegal
local|local|global
logical|lógico|illogical
main|principal|minor
mental|mental|physical
minor|menor|major
national|nacional|international
natural|natural|artificial
negative|negativo|positive
official|oficial|unofficial
online|en línea|offline
outer|exterior|inner
physical|físico|mental
positive|positivo|negative
present|presente|absent
professional|profesional|amateur
quick|rápido|slow
remote|remoto|central
responsible|responsable|irresponsible
rigid|rígido|flexible
rough|áspero|smooth
safe|seguro|dangerous
secure|seguro|insecure
selfish|egoísta|generous
sensitive|sensible|insensitive
similar|similar|different
smooth|liso|rough
social|social|antisocial
solid|sólido|liquid
specific|específico|general
stable|estable|unstable
standard|estándar|unusual
technical|técnico|nontechnical
temporary|temporal|permanent
thick|grueso|thin
tiny|diminuto|enormous
total|total|partial
typical|típico|atypical
unhappy|infeliz|happy
unique|único|common
urgent|urgente|nonurgent
useful|útil|useless
valuable|valioso|worthless
variable|variable|constant
violent|violento|peaceful
visible|visible|invisible
whole|entero|broken
worthwhile|que vale la pena|worthless`.trim().split('\n').map((line) => {
    const [word, translation, antonym] = line.split('|');
    return [word, translation, `more ${word}`, `the most ${word}`, antonym];
  });
  adjectiveRows.english = [...new Map([...adjectiveRows.english, ...englishAdjectiveExpansion].map((row) => [row[0], row])).values()].slice(0, 200);

  const adverbSeeds = {
    english: [['carefully','cuidadosamente','modo'],['quickly','rápidamente','modo'],['well','bien','modo'],['badly','mal','modo'],['here','aquí','lugar'],['there','allí','lugar'],['nearby','cerca','lugar'],['everywhere','en todas partes','lugar'],['now','ahora','tiempo'],['today','hoy','tiempo'],['yesterday','ayer','tiempo'],['soon','pronto','tiempo'],['always','siempre','frecuencia'],['often','a menudo','frecuencia'],['sometimes','a veces','frecuencia'],['never','nunca','frecuencia'],['very','muy','grado'],['too','demasiado','grado'],['almost','casi','grado'],['enough','suficiente','grado'],['certainly','ciertamente','afirmación'],['perhaps','quizás','posibilidad'],['therefore','por lo tanto','conexión'],['however','sin embargo','conexión']],
    spanish: [['cuidadosamente','carefully','modo'],['rápidamente','quickly','modo'],['bien','well','modo'],['mal','badly','modo'],['aquí','here','lugar'],['allí','there','lugar'],['cerca','nearby','lugar'],['en todas partes','everywhere','lugar'],['ahora','now','tiempo'],['hoy','today','tiempo'],['ayer','yesterday','tiempo'],['pronto','soon','tiempo'],['siempre','always','frecuencia'],['a menudo','often','frecuencia'],['a veces','sometimes','frecuencia'],['nunca','never','frecuencia'],['muy','very','grado'],['demasiado','too','grado'],['casi','almost','grado'],['suficiente','enough','grado'],['ciertamente','certainly','afirmación'],['quizás','perhaps','posibilidad'],['por lo tanto','therefore','conexión'],['sin embargo','however','conexión']],
    french: [['soigneusement','cuidadosamente','modo'],['rapidement','rápidamente','modo'],['bien','bien','modo'],['mal','mal','modo'],['ici','aquí','lugar'],['là-bas','allí','lugar'],['près','cerca','lugar'],['partout','en todas partes','lugar'],['maintenant','ahora','tiempo'],["aujourd’hui",'hoy','tiempo'],['hier','ayer','tiempo'],['bientôt','pronto','tiempo'],['toujours','siempre','frecuencia'],['souvent','a menudo','frecuencia'],['parfois','a veces','frecuencia'],['jamais','nunca','frecuencia'],['très','muy','grado'],['trop','demasiado','grado'],['presque','casi','grado'],['assez','bastante','grado'],['certainement','ciertamente','afirmación'],['peut-être','quizás','posibilidad'],['donc','por lo tanto','conexión'],['cependant','sin embargo','conexión']],
    italian: [['attentamente','cuidadosamente','modo'],['rapidamente','rápidamente','modo'],['bene','bien','modo'],['male','mal','modo'],['qui','aquí','lugar'],['lì','allí','lugar'],['vicino','cerca','lugar'],['ovunque','en todas partes','lugar'],['adesso','ahora','tiempo'],['oggi','hoy','tiempo'],['ieri','ayer','tiempo'],['presto','pronto','tiempo'],['sempre','siempre','frecuencia'],['spesso','a menudo','frecuencia'],['a volte','a veces','frecuencia'],['mai','nunca','frecuencia'],['molto','muy','grado'],['troppo','demasiado','grado'],['quasi','casi','grado'],['abbastanza','bastante','grado'],['certamente','ciertamente','afirmación'],['forse','quizás','posibilidad'],['quindi','por lo tanto','conexión'],['tuttavia','sin embargo','conexión']],
    portuguese: [['cuidadosamente','cuidadosamente','modo'],['rapidamente','rápidamente','modo'],['bem','bien','modo'],['mal','mal','modo'],['aqui','aquí','lugar'],['ali','allí','lugar'],['perto','cerca','lugar'],['em toda parte','en todas partes','lugar'],['agora','ahora','tiempo'],['hoje','hoy','tiempo'],['ontem','ayer','tiempo'],['logo','pronto','tiempo'],['sempre','siempre','frecuencia'],['frequentemente','a menudo','frecuencia'],['às vezes','a veces','frecuencia'],['nunca','nunca','frecuencia'],['muito','muy','grado'],['demais','demasiado','grado'],['quase','casi','grado'],['bastante','bastante','grado'],['certamente','ciertamente','afirmación'],['talvez','quizás','posibilidad'],['portanto','por lo tanto','conexión'],['porém','sin embargo','conexión']],
    german: [['sorgfältig','cuidadosamente','modo'],['schnell','rápidamente','modo'],['gut','bien','modo'],['schlecht','mal','modo'],['hier','aquí','lugar'],['dort','allí','lugar'],['in der Nähe','cerca','lugar'],['überall','en todas partes','lugar'],['jetzt','ahora','tiempo'],['heute','hoy','tiempo'],['gestern','ayer','tiempo'],['bald','pronto','tiempo'],['immer','siempre','frecuencia'],['oft','a menudo','frecuencia'],['manchmal','a veces','frecuencia'],['nie','nunca','frecuencia'],['sehr','muy','grado'],['zu','demasiado','grado'],['fast','casi','grado'],['genug','suficiente','grado'],['sicherlich','ciertamente','afirmación'],['vielleicht','quizás','posibilidad'],['deshalb','por lo tanto','conexión'],['jedoch','sin embargo','conexión']]
  };
  // Only reviewed entries are published. Earlier synthetic combinations used
  // modifiers to inflate the catalogue and produced duplicates or unnatural
  // phrases (for example, "plus bien" and repeated "moins mal" cards).
  const esc = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
  const locales = { english: 'en-US', spanish: 'es-ES', french: 'fr-FR', italian: 'it-IT', portuguese: 'pt-BR', german: 'de-DE' };
  const adverbExamples = {
    english: {
      carefully: ['She checked every answer carefully.', 'Handle the glass carefully.'], quickly: ['He finished the exercise quickly.', 'Please reply quickly.'],
      well: ['Maria speaks English well.', 'The presentation went well.'], badly: ['He hurt his knee badly.', 'The team played badly yesterday.'],
      here: ['Please sit here.', 'Your keys are here.'], there: ['Wait for me there.', 'The bus stop is over there.'],
      nearby: ['There is a pharmacy nearby.', 'My cousins live nearby.'], everywhere: ['We searched everywhere.', 'There were flowers everywhere.'],
      now: ['We need to leave now.', 'I am busy now.'], today: ['We have a lesson today.', 'She is working from home today.'],
      yesterday: ['I called my mother yesterday.', 'It rained yesterday.'], soon: ['The bus will arrive soon.', 'I hope to see you soon.'],
      always: ['I always review my notes.', 'She is always punctual.'], often: ['We often practise together.', 'He often visits his grandparents.'],
      sometimes: ['I sometimes walk to work.', 'They sometimes eat outside.'], never: ['She never misses class.', 'I have never seen snow.'],
      very: ['The instructions are very clear.', 'It is very cold today.'], too: ['This bag is too heavy.', 'We arrived too late.'],
      almost: ['Dinner is almost ready.', 'I have almost finished.'], enough: ['The room is warm enough.', 'We have practised enough.'],
      certainly: ['I will certainly help you.', 'This is certainly a good start.'], perhaps: ['Perhaps we can meet tomorrow.', 'She will perhaps join us later.'],
      therefore: ['It was raining; therefore, we stayed home.', 'The evidence was clear; therefore, they agreed.'], however: ['The task was difficult; however, we finished it.', 'I understand your point; however, I disagree.']
    },
    spanish: {
      cuidadosamente: ['Revisó cada respuesta cuidadosamente.', 'Manipula el vaso cuidadosamente.'], rápidamente: ['Terminó el ejercicio rápidamente.', 'Responde rápidamente, por favor.'],
      bien: ['María habla bien inglés.', 'La presentación salió bien.'], mal: ['El paciente se sentía mal esta mañana.', 'El equipo jugó mal ayer.'],
      aquí: ['Siéntate aquí, por favor.', 'Tus llaves están aquí.'], allí: ['Espérame allí.', 'La parada está allí.'],
      cerca: ['Hay una farmacia cerca.', 'Mis primos viven cerca.'], 'en todas partes': ['Buscamos en todas partes.', 'Había flores en todas partes.'],
      ahora: ['Tenemos que salir ahora.', 'Estoy ocupado ahora.'], hoy: ['Tenemos una clase hoy.', 'Ella trabaja desde casa hoy.'],
      ayer: ['Llamé a mi madre ayer.', 'Ayer llovió mucho.'], pronto: ['El autobús llegará pronto.', 'Espero verte pronto.'],
      siempre: ['Siempre repaso mis notas.', 'Ella siempre llega puntual.'], 'a menudo': ['A menudo practicamos juntos.', 'Él visita a menudo a sus abuelos.'],
      'a veces': ['A veces camino al trabajo.', 'Ellos comen fuera a veces.'], nunca: ['Ella nunca falta a clase.', 'Nunca he visto nieve.'],
      muy: ['Las instrucciones son muy claras.', 'Hoy hace mucho frío.'], demasiado: ['Esta mochila pesa demasiado.', 'Llegamos demasiado tarde.'],
      casi: ['La cena está casi lista.', 'Casi he terminado.'], suficiente: ['La habitación está suficientemente caliente.', 'Ya hemos practicado lo suficiente.'],
      ciertamente: ['Ciertamente te ayudaré.', 'Este es ciertamente un buen comienzo.'], quizás: ['Quizás podamos reunirnos mañana.', 'Quizás ella se una más tarde.'],
      'por lo tanto': ['Estaba lloviendo; por lo tanto, nos quedamos en casa.', 'La evidencia era clara; por lo tanto, aceptaron.'], 'sin embargo': ['La tarea era difícil; sin embargo, la terminamos.', 'Entiendo tu punto; sin embargo, no estoy de acuerdo.']
    },
    french: {
      soigneusement: ['Elle a vérifié chaque réponse soigneusement.', 'Manipulez le verre soigneusement.'], rapidement: ['Il a terminé l’exercice rapidement.', 'Répondez rapidement, s’il vous plaît.'],
      bien: ['Marie parle bien anglais.', 'La présentation s’est bien passée.'], mal: ['Il s’est fait très mal au genou.', 'L’équipe a mal joué hier.'],
      ici: ['Asseyez-vous ici, s’il vous plaît.', 'Vos clés sont ici.'], 'là-bas': ['Attendez-moi là-bas.', 'L’arrêt de bus est là-bas.'],
      près: ['La pharmacie est près d’ici.', 'Mes cousins habitent tout près.'], partout: ['Nous avons cherché partout.', 'Il y avait des fleurs partout.'],
      maintenant: ['Nous devons partir maintenant.', 'Je suis occupé maintenant.'], 'aujourd’hui': ['Nous avons cours aujourd’hui.', 'Elle travaille chez elle aujourd’hui.'],
      hier: ['J’ai appelé ma mère hier.', 'Il a beaucoup plu hier.'], 'bientôt': ['Le bus arrivera bientôt.', 'J’espère vous revoir bientôt.'],
      toujours: ['Je révise toujours mes notes.', 'Elle est toujours ponctuelle.'], souvent: ['Nous nous entraînons souvent ensemble.', 'Il rend souvent visite à ses grands-parents.'],
      parfois: ['Je vais parfois au travail à pied.', 'Ils mangent parfois dehors.'], jamais: ['Elle ne manque jamais un cours.', 'Je n’ai jamais vu la neige.'],
      très: ['Les consignes sont très claires.', 'Il fait très froid aujourd’hui.'], trop: ['Ce sac est trop lourd.', 'Nous sommes arrivés trop tard.'],
      presque: ['Le dîner est presque prêt.', 'J’ai presque terminé.'], assez: ['La pièce est assez chaude.', 'Nous avons assez pratiqué.'],
      certainement: ['Je vous aiderai certainement.', 'C’est certainement un bon début.'], 'peut-être': ['Peut-être pouvons-nous nous voir demain.', 'Elle viendra peut-être plus tard.'],
      donc: ['Il pleuvait, donc nous sommes restés chez nous.', 'Les preuves étaient claires, donc ils ont accepté.'], cependant: ['La tâche était difficile ; cependant, nous l’avons terminée.', 'Je comprends votre point ; cependant, je ne suis pas d’accord.']
    },
    italian: {
      attentamente: ['Ha controllato ogni risposta attentamente.', 'Maneggia il bicchiere attentamente.'], rapidamente: ['Ha finito l’esercizio rapidamente.', 'Rispondi rapidamente, per favore.'],
      bene: ['Maria parla bene l’inglese.', 'La presentazione è andata bene.'], male: ['Si è fatto molto male al ginocchio.', 'La squadra ha giocato male ieri.'],
      qui: ['Siediti qui, per favore.', 'Le tue chiavi sono qui.'], lì: ['Aspettami lì.', 'La fermata è lì.'],
      vicino: ['C’è una farmacia qui vicino.', 'I miei cugini abitano vicino.'], ovunque: ['Abbiamo cercato ovunque.', 'C’erano fiori ovunque.'],
      adesso: ['Dobbiamo partire adesso.', 'Sono occupato adesso.'], oggi: ['Oggi abbiamo una lezione.', 'Lei lavora da casa oggi.'],
      ieri: ['Ieri ho chiamato mia madre.', 'Ieri ha piovuto molto.'], presto: ['L’autobus arriverà presto.', 'Spero di vederti presto.'],
      sempre: ['Ripasso sempre i miei appunti.', 'Lei è sempre puntuale.'], spesso: ['Ci esercitiamo spesso insieme.', 'Lui visita spesso i nonni.'],
      'a volte': ['A volte vado al lavoro a piedi.', 'A volte mangiano fuori.'], mai: ['Non perde mai una lezione.', 'Non ho mai visto la neve.'],
      molto: ['Le istruzioni sono molto chiare.', 'Oggi fa molto freddo.'], troppo: ['Questa borsa è troppo pesante.', 'Siamo arrivati troppo tardi.'],
      quasi: ['La cena è quasi pronta.', 'Ho quasi finito.'], abbastanza: ['La stanza è abbastanza calda.', 'Abbiamo praticato abbastanza.'],
      certamente: ['Ti aiuterò certamente.', 'Questo è certamente un buon inizio.'], forse: ['Forse possiamo incontrarci domani.', 'Forse lei verrà più tardi.'],
      quindi: ['Pioveva, quindi siamo rimasti a casa.', 'Le prove erano chiare, quindi hanno accettato.'], tuttavia: ['Il compito era difficile; tuttavia, lo abbiamo finito.', 'Capisco il tuo punto; tuttavia, non sono d’accordo.']
    },
    portuguese: {
      cuidadosamente: ['Ela conferiu cada resposta cuidadosamente.', 'Manuseie o copo cuidadosamente.'], rapidamente: ['Ele terminou o exercício rapidamente.', 'Responda rapidamente, por favor.'],
      bem: ['Maria fala bem inglês.', 'A apresentação correu bem.'], mal: ['Ele passou mal durante a viagem.', 'A equipe jogou mal ontem.'],
      aqui: ['Sente-se aqui, por favor.', 'Suas chaves estão aqui.'], ali: ['Espere por mim ali.', 'O ponto de ônibus fica ali.'],
      perto: ['Há uma farmácia perto.', 'Meus primos moram perto.'], 'em toda parte': ['Procuramos em toda parte.', 'Havia flores em toda parte.'],
      agora: ['Precisamos sair agora.', 'Estou ocupado agora.'], hoje: ['Temos aula hoje.', 'Ela trabalha de casa hoje.'],
      ontem: ['Liguei para minha mãe ontem.', 'Choveu muito ontem.'], logo: ['O ônibus chegará logo.', 'Espero ver você logo.'],
      sempre: ['Sempre reviso minhas anotações.', 'Ela é sempre pontual.'], frequentemente: ['Praticamos frequentemente juntos.', 'Ele visita frequentemente os avós.'],
      'às vezes': ['Às vezes vou a pé ao trabalho.', 'Eles comem fora às vezes.'], nunca: ['Ela nunca falta à aula.', 'Nunca vi neve.'],
      muito: ['As instruções são muito claras.', 'Hoje está muito frio.'], demais: ['Esta bolsa pesa demais.', 'Chegamos tarde demais.'],
      quase: ['O jantar está quase pronto.', 'Eu quase terminei.'], bastante: ['A sala está bastante quente.', 'Já praticamos bastante.'],
      certamente: ['Certamente vou ajudar você.', 'Este é certamente um bom começo.'], talvez: ['Talvez possamos nos encontrar amanhã.', 'Talvez ela chegue mais tarde.'],
      portanto: ['Estava chovendo; portanto, ficamos em casa.', 'As provas eram claras; portanto, eles concordaram.'], porém: ['A tarefa era difícil; porém, nós a concluímos.', 'Entendo seu ponto; porém, não concordo.']
    },
    german: {
      sorgfältig: ['Sie prüfte jede Antwort sorgfältig.', 'Behandle das Glas sorgfältig.'], schnell: ['Er beendete die Übung schnell.', 'Antworte bitte schnell.'],
      gut: ['Maria spricht gut Englisch.', 'Die Präsentation ist gut gelaufen.'], schlecht: ['Er hat sich das Knie schlimm verletzt.', 'Die Mannschaft spielte gestern schlecht.'],
      hier: ['Setz dich bitte hier hin.', 'Deine Schlüssel sind hier.'], dort: ['Warte dort auf mich.', 'Die Bushaltestelle ist dort.'],
      'in der Nähe': ['In der Nähe gibt es eine Apotheke.', 'Meine Cousins wohnen in der Nähe.'], überall: ['Wir haben überall gesucht.', 'Überall standen Blumen.'],
      jetzt: ['Wir müssen jetzt gehen.', 'Ich bin jetzt beschäftigt.'], heute: ['Wir haben heute Unterricht.', 'Sie arbeitet heute von zu Hause.'],
      gestern: ['Ich habe gestern meine Mutter angerufen.', 'Gestern hat es stark geregnet.'], bald: ['Der Bus kommt bald.', 'Ich hoffe, dich bald zu sehen.'],
      immer: ['Ich wiederhole immer meine Notizen.', 'Sie ist immer pünktlich.'], oft: ['Wir üben oft zusammen.', 'Er besucht oft seine Großeltern.'],
      manchmal: ['Ich gehe manchmal zu Fuß zur Arbeit.', 'Sie essen manchmal draußen.'], nie: ['Sie verpasst nie den Unterricht.', 'Ich habe noch nie Schnee gesehen.'],
      sehr: ['Die Anweisungen sind sehr klar.', 'Heute ist es sehr kalt.'], zu: ['Diese Tasche ist zu schwer.', 'Wir kamen zu spät.'],
      fast: ['Das Abendessen ist fast fertig.', 'Ich bin fast fertig.'], genug: ['Das Zimmer ist warm genug.', 'Wir haben genug geübt.'],
      sicherlich: ['Ich werde dir sicherlich helfen.', 'Das ist sicherlich ein guter Anfang.'], vielleicht: ['Vielleicht können wir uns morgen treffen.', 'Vielleicht kommt sie später dazu.'],
      deshalb: ['Es regnete; deshalb blieben wir zu Hause.', 'Die Beweise waren klar; deshalb stimmten sie zu.'], jedoch: ['Die Aufgabe war schwierig; wir haben sie jedoch beendet.', 'Ich verstehe deinen Standpunkt; ich bin jedoch anderer Meinung.']
    }
  };
  const generatedExpansion = window.ANDERGO_LEXICON_EXPANSION || { adjectives: {}, adverbs: {} };
  Object.entries(generatedExpansion.adjectives || {}).forEach(([language, rows]) => {
    if (adjectiveRows[language] && Array.isArray(rows)) adjectiveRows[language].push(...rows);
  });
  Object.entries(generatedExpansion.adverbs || {}).forEach(([language, rows]) => {
    if (adverbSeeds[language] && Array.isArray(rows)) adverbSeeds[language].push(...rows);
  });
  Object.entries(adverbSeeds).forEach(([language, rows]) => {
    rows.forEach(([word, , , example1, example2]) => {
      if ((!example1 || !example2) && !adverbExamples[language]?.[word]) {
        throw new Error(`Faltan ejemplos revisados para el adverbio ${language}:${word}`);
      }
    });
  });
  const adjectiveExamples = {
    english: (row) => [`This option is ${row[2]} than the other one.`, `It is ${row[3]} choice for this task.`],
    spanish: (row) => [`Esta opción es ${row[2]} que la otra.`, `Es la opción ${row[3]} para esta tarea.`],
    french: (row) => [`Cette option est ${row[2]} que l’autre.`, `C’est l’option ${row[3]} pour cette tâche.`],
    italian: (row) => [`Questa opzione è ${row[2]} dell’altra.`, `È l’opzione ${row[3]} per questo compito.`],
    portuguese: (row) => [`Esta opção é ${row[2]} que a outra.`, `É a opção ${row[3]} para esta tarefa.`],
    german: (row) => [`Diese Option ist ${row[2]} als die andere.`, `Sie ist ${row[3]} Wahl für diese Aufgabe.`]
  };
  // Examples must model several useful positions for the same word instead
  // of repeating one fill-in-the-blank pattern on every card.
  const exampleIndex = (word) => [...String(word)].reduce((total, char) => total + char.charCodeAt(0), 0);
  const practicalAdjectiveTemplates = {
    english: [(row) => [`This option is ${row[2]} than the other one.`, `We chose ${row[3]} plan for the project.`], (row) => [`Her new desk is ${row[2]} than mine.`, `That is ${row[3]} example for beginners.`], (row) => [`The room feels ${row[0]} today.`, `They selected ${row[3]} route to the station.`]],
    spanish: [(row) => [`Esta opción es ${row[2]} que la otra.`, `Elegimos ${row[3]} plan para el proyecto.`], (row) => [`Su escritorio nuevo es ${row[2]} que el mío.`, `Ese es ${row[3]} ejemplo para principiantes.`], (row) => [`La sala se siente ${row[0]} hoy.`, `Seleccionaron ${row[3]} ruta a la estación.`]],
    french: [(row) => [`Cette option est ${row[2]} que l’autre.`, `Nous avons choisi ${row[3]} plan pour le projet.`], (row) => [`Son nouveau bureau est ${row[2]} que le mien.`, `C’est ${row[3]} exemple pour les débutants.`], (row) => [`La salle semble ${row[0]} aujourd’hui.`, `Ils ont choisi ${row[3]} itinéraire vers la gare.`]],
    italian: [(row) => [`Questa opzione è ${row[2]} dell’altra.`, `Abbiamo scelto ${row[3]} piano per il progetto.`], (row) => [`La sua nuova scrivania è ${row[2]} della mia.`, `È ${row[3]} esempio per i principianti.`], (row) => [`La stanza sembra ${row[0]} oggi.`, `Hanno scelto ${row[3]} percorso per la stazione.`]],
    portuguese: [(row) => [`Esta opção é ${row[2]} que a outra.`, `Escolhemos ${row[3]} plano para o projeto.`], (row) => [`A nova mesa dela é ${row[2]} que a minha.`, `Este é ${row[3]} exemplo para iniciantes.`], (row) => [`A sala parece ${row[0]} hoje.`, `Eles escolheram ${row[3]} caminho para a estação.`]],
    german: [(row) => [`Diese Option ist ${row[2]} als die andere.`, `Für dieses Projekt ist „${row[0]}“ eine wichtige Eigenschaft.`], (row) => [`Ihr neuer Schreibtisch ist ${row[2]} als meiner.`, `„${row[0]}“ beschreibt die Situation gut.`], (row) => [`Der Raum wirkt heute ${row[0]}.`, `Das Wort „${row[0]}“ passt zu diesem Beispiel.`]]
  };
  function practicalExamples(row, kind, language) {
    if (kind === 'adjectives') {
      if (row[5] && row[6]) return [row[5], row[6]];
      const templates = practicalAdjectiveTemplates[language] || [adjectiveExamples[language]];
      return templates[exampleIndex(row[0]) % templates.length](row);
    }
    return row[3] && row[4]
      ? [row[3], row[4]]
      : (adverbExamples[language]?.[row[0]] || [row[0], row[0]]);
  }
  const IPA_BY_LANGUAGE = {
    // Curated IPA entries are preferred to any spelling-based approximation.
    // This base set covers the French adjective shelf shown in the catalogue.
    french: {
      grand: 'ɡʁɑ̃', petit: 'pəti', bon: 'bɔ̃', mauvais: 'movɛ', beau: 'bo', laid: 'lɛ',
      facile: 'fasil', difficile: 'difisil', rapide: 'ʁapid', lent: 'lɑ̃', heureux: 'øʁø',
      triste: 'tʁist', jeune: 'ʒœn', vieux: 'vjø', cher: 'ʃɛʁ', 'bon marché': 'bɔ̃ maʁʃe',
      fort: 'fɔʁ', faible: 'fɛbl', important: 'ɛ̃pɔʁtɑ̃', intéressant: 'ɛ̃teʁesɑ̃'
    },
    english: {
      big: 'bɪɡ', small: 'smɔːl', good: 'ɡʊd', bad: 'bæd', beautiful: 'ˈbjuːtɪfəl', ugly: 'ˈʌɡli',
      easy: 'ˈiːzi', difficult: 'ˈdɪfɪkəlt', fast: 'fɑːst', slow: 'sləʊ', happy: 'ˈhæpi', sad: 'sæd',
      young: 'jʌŋ', old: 'əʊld', expensive: 'ɪkˈspensɪv', cheap: 'tʃiːp', strong: 'strɒŋ', weak: 'wiːk',
      important: 'ɪmˈpɔːtənt', interesting: 'ˈɪntrəstɪŋ'
    },
  };
  // No spelling-to-sound conversion is used here: it produces misleading
  // pseudo-IPA. A missing entry is intentionally left blank until curated.
  function ipaTranscription(word, language) {
    return IPA_BY_LANGUAGE[language]?.[word.toLowerCase()] || '';
  }
  function flashcardHtml(row, kind, language) {
    const adjective = kind === 'adjectives';
    const examples = practicalExamples(row, kind, language);
    const examplesLength = examples.reduce((total, example) => total + String(example || '').length, 0);
    const densityClass = examplesLength > (adjective ? 92 : 96)
      ? ' lexicon-flashcard--very-dense'
      : (examplesLength > (adjective ? 64 : 62) ? ' lexicon-flashcard--dense' : '');
    const details = adjective
      ? `<dl><div class="lexicon-forms"><dt>Comparativo · Superlativo</dt><dd>${esc(row[2])} · ${esc(row[3])}</dd></div><div class="lexicon-example"><dt>Ejemplo 1</dt><dd>${esc(examples[0])}<button type="button" class="lexicon-example-speak" data-speak="${esc(examples[0])}" aria-label="Escuchar el ejemplo 1">🔊</button></dd></div><div class="lexicon-example"><dt>Ejemplo 2</dt><dd>${esc(examples[1])}<button type="button" class="lexicon-example-speak" data-speak="${esc(examples[1])}" aria-label="Escuchar el ejemplo 2">🔊</button></dd></div></dl><button type="button" class="lexicon-back-btn">Volver</button>`
      : `<dl><div class="lexicon-example"><dt>Ejemplo 1</dt><dd>${esc(examples[0])}<button type="button" class="lexicon-example-speak" data-speak="${esc(examples[0])}" aria-label="Escuchar el ejemplo 1">🔊</button></dd></div><div class="lexicon-example"><dt>Ejemplo 2</dt><dd>${esc(examples[1])}<button type="button" class="lexicon-example-speak" data-speak="${esc(examples[1])}" aria-label="Escuchar el ejemplo 2">🔊</button></dd></div></dl><button type="button" class="lexicon-back-btn">Volver</button>`;
    const frontLead = adjective
      ? `<strong>${esc(row[0])}</strong>${ipaTranscription(row[0], language) ? `<span class="lexicon-card-pronunciation">/${esc(ipaTranscription(row[0], language))}/</span>` : ''}<span class="lexicon-card-translation">${esc(row[1])}</span>`
      : `<strong>${esc(row[0])}</strong>${ipaTranscription(row[0], language) ? `<span class="lexicon-card-pronunciation">/${esc(ipaTranscription(row[0], language))}/</span>` : ''}<span class="lexicon-card-translation">${esc(row[1])}</span>`;
    const actions = `<div class="lexicon-adverb-actions"><button type="button" class="lexicon-speak" data-speak="${esc(row[0])}" aria-label="Escuchar ${esc(row[0])}">🔊</button><button type="button" class="lexicon-examples-btn">Ver ejemplos</button></div>`;
    return `<article class="lexicon-flashcard${densityClass}" data-speak="${esc(row[0])}" data-category="${adjective ? '' : esc(row[2])}" data-search="${esc(row.join(' ').toLowerCase())}" tabindex="0" role="button" aria-label="Escuchar ${esc(row[0])}"><div class="lexicon-flashcard-inner"><div class="lexicon-flashcard-face lexicon-flashcard-front">${frontLead}${actions}</div><div class="lexicon-flashcard-face lexicon-flashcard-back">${details}<small>Toca la tarjeta para escuchar de nuevo</small></div></div></article>`;
  }
  function render(section, kind, selectedLanguage) {
    const content = section.querySelector('.skill-view-content'); if (!content) return;
    const language = languages[selectedLanguage] ? selectedLanguage : 'english';
    renderedReferences.set(section, { kind, language });
    const allRows = kind === 'adjectives' ? adjectiveRows[language] : adverbSeeds[language];
    // The complete academic catalogue is available in Free and Premium.
    // Premium removes transition advertising and retains its enhanced tools.
    const anonymousPreview = false;
    const rows = allRows;
    const allCategories = ['todos', ...new Set(allRows.map((row) => row[2]))];
    const categories = kind === 'adverbs' ? allCategories : ['todos'];
    const countLabel = kind === 'adjectives' ? 'adjetivos' : 'adverbios y conectores';
    const freeNotice = '';
    content.innerHTML = `<section class="lexicon-reference" data-kind="${kind}" data-language="${language}"><header class="lexicon-reference-head"><div><span>FLASHCARDS DE VOCABULARIO</span><h2>${kind === 'adjectives' ? 'Adjetivos: comparativo y superlativo' : 'Adverbios por función'}</h2><p>${kind === 'adjectives' ? 'Gira cada tarjeta para comparar sus formas y descubrir el antónimo.' : 'Cada tarjeta muestra el adverbio, su guía fonética y significado. Tócala para escucharlo y abre «Ver más» para los ejemplos.'}</p></div><label>Idioma <select class="lexicon-language">${Object.entries(languages).map(([key,label]) => `<option value="${key}"${key === language ? ' selected' : ''}>${label}</option>`).join('')}</select></label></header><div class="lexicon-toolbar"><label>Buscar <input class="lexicon-search" type="search" placeholder="Escribe una palabra…"></label>${kind === 'adverbs' ? `<div class="lexicon-categories">${categories.map((category) => `<button type="button" data-category="${category}" class="${category === 'todos' ? 'is-active' : ''}">${category}</button>`).join('')}</div>` : ''}</div>${freeNotice}<p class="lexicon-count"><strong>${rows.length}</strong> ${countLabel} en ${languages[language]}${anonymousPreview ? ` · muestra gratuita del 25%` : ''}</p><div class="lexicon-flashcard-grid">${rows.map((row) => flashcardHtml(row, kind, language)).join('')}</div>${anonymousPreview ? '<button type="button" class="secondary-btn upgrade-btn lexicon-preview-upgrade">Desbloquear el contenido completo</button>' : ''}<p class="lexicon-source-note">Fuentes léxicas: <a href="https://kaikki.org/" target="_blank" rel="noopener">Kaikki/Wiktionary</a>. Ejemplos de uso: <a href="https://tatoeba.org/" target="_blank" rel="noopener">Tatoeba</a>.</p></section>`;
    const apply = () => { const query = content.querySelector('.lexicon-search').value.trim().toLowerCase(); const active = content.querySelector('.lexicon-categories .is-active')?.dataset.category || 'todos'; let count = 0; content.querySelectorAll('.lexicon-flashcard').forEach((row) => { const show = (!query || row.dataset.search.includes(query)) && (active === 'todos' || row.dataset.category === active); row.hidden = !show; if (show) count += 1; }); content.querySelector('.lexicon-count').innerHTML = `<strong>${count}</strong> ${kind === 'adjectives' ? 'adjetivos visibles' : 'adverbios y conectores visibles'} en ${languages[language]}`; };
    content.querySelector('.lexicon-search').addEventListener('input', apply);
    content.querySelector('.lexicon-language').addEventListener('change', (event) => render(section, kind, event.target.value));
    content.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => { content.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('is-active', item === button)); apply(); }));
    const speak = (text) => { if (!window.speechSynthesis) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = locales[language]; window.speechSynthesis.speak(utterance); };
    content.querySelectorAll('.lexicon-flashcard').forEach((card) => { card.addEventListener('click', (event) => { if (!event.target.closest('.lexicon-speak, .lexicon-example-speak, .lexicon-more-btn, .lexicon-examples-btn')) speak(card.dataset.speak); }); card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); speak(card.dataset.speak); } }); });
    content.querySelectorAll('.lexicon-examples-btn').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); button.closest('.lexicon-flashcard')?.classList.add('is-flipped'); }));
    content.querySelectorAll('.lexicon-back-btn').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); button.closest('.lexicon-flashcard')?.classList.remove('is-flipped'); }));
    content.querySelectorAll('.lexicon-more-btn').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); const details = button.nextElementSibling; const willOpen = details.hidden; details.hidden = !willOpen; button.textContent = willOpen ? 'Ver menos' : 'Ver más'; button.setAttribute('aria-expanded', String(willOpen)); button.closest('.lexicon-flashcard')?.classList.toggle('is-expanded', willOpen); }));
    content.querySelectorAll('.lexicon-speak').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); speak(button.dataset.speak); }));
    content.querySelectorAll('.lexicon-example-speak').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); speak(button.dataset.speak); }));
  }
  // The entitlement arrives asynchronously after restoring a session. Refresh
  // an already open shelf once that plan state is available.
  window.addEventListener('andergo:entitlements-updated', () => {
    queueMicrotask(() => {
      renderedReferences.forEach(({ kind, language }, section) => {
        if (document.contains(section)) render(section, kind, language);
        else renderedReferences.delete(section);
      });
    });
  });
  window.AndergoLexicon = { render };
})();
