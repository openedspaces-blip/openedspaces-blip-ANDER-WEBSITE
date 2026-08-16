#!/usr/bin/env node
// Builds the first complete, culture-led CEFR routes for Italian and Brazilian
// Portuguese. Each course has 12 units x 6 integrated skills; a small amount
// of shared shaping code keeps the pedagogical contract consistent without
// making the learner-facing texts generic translations of another language.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const LESSONS = path.join(ROOT, 'lib', 'seed-lessons.json');
const UNITS = path.join(ROOT, 'lib', 'seed-units.json');
const SKILLS = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];

const CULTURES = {
  italian: {
    label: 'Italiano', country: 'Italia', city: 'Bologna', person: 'Sofia', friend: 'Marco',
    a1: [
      ['benvenuti-in-italia', 'Benvenuti in Italia', 'Saluti e presentazioni a Bologna', 'Ciao, come stai?', 'salutare e presentarsi', 'ciao, buongiorno, piacere, grazie'],
      ['un-caffe-al-bar', 'Un caffè al bar', 'Un bar di quartiere e le cortesie quotidiane', 'Un caffè, per favore.', 'ordinare con cortesia', 'caffè, acqua, per favore, grazie'],
      ['la-famiglia-a-tavola', 'La famiglia a tavola', 'Una cena familiare e gli orari italiani', 'Ceniamo insieme.', 'parlare della famiglia', 'famiglia, cena, tavola, insieme'],
      ['il-mercato-del-sabato', 'Il mercato del sabato', 'Frutta, verdura e prezzi al mercato', 'Quanto costa un chilo?', 'comprare al mercato', 'pomodoro, mela, chilo, euro'],
      ['in-bicicletta', 'In bicicletta', 'Moverse por la ciudad en bicicleta', 'Dov’è la stazione?', 'chiedere indicazioni', 'strada, piazza, stazione, bicicletta'],
      ['scuola-e-amici', 'Scuola e amici', 'La vida escolar y una merienda', 'Che materia ti piace?', 'hablar de gustos', 'scuola, amico, lezione, compito'],
      ['una-casa-italiana', 'Una casa italiana', 'Habitaciones y vida en casa', 'La cucina è luminosa.', 'describir una casa', 'cucina, camera, finestra, balcone'],
      ['il-tempo-e-le-stagioni', 'Il tempo e le stagioni', 'El clima y las estaciones', 'Oggi fa caldo.', 'hablar del tiempo', 'sole, pioggia, caldo, freddo'],
      ['una-festa-di-quartiere', 'Una festa di quartiere', 'Una pequeña fiesta comunitaria', 'Ci vediamo alla festa.', 'invitar y aceptar', 'festa, musica, vicino, sabato'],
      ['in-treno', 'In treno', 'Un viaje corto en tren regional', 'Un biglietto per Firenze.', 'comprar un billete', 'treno, biglietto, binario, viaggio'],
      ['sapori-d-italia', "Sapori d'Italia", 'Sabores regionales sin estereotipos', 'Mi piace questa zuppa.', 'expresar preferencias', 'pane, zuppa, formaggio, gusto'],
      ['un-messaggio-a-casa', 'Un messaggio a casa', 'Contar una experiencia sencilla', 'Oggi ho imparato molto.', 'escribir un mensaje breve', 'oggi, domani, casa, esperienza']
    ],
    a2: [
      ['vita-in-citta', 'Vita in città', 'Rutinas urbanas y servicios públicos', 'Di solito prendo l’autobus.', 'describir una rutina', 'quartiere, fermata, ufficio, servizio'],
      ['un-fine-settimana-a-napoli', 'Un fine settimana a Napoli', 'Planificar una visita respetuosa', 'Vorrei visitare il museo.', 'hacer planes', 'museo, passeggiata, prenotazione, visita'],
      ['ricette-di-famiglia', 'Ricette di famiglia', 'Recetas, recuerdos y medidas', 'Prima taglio le verdure.', 'explicar una secuencia', 'ricetta, ingrediente, prima, dopo'],
      ['il-lavoro-e-il-caffe', 'Il lavoro e il caffè', 'Pausas laborales y registros de cortesía', 'Posso fare una pausa?', 'interactuar en el trabajo', 'collega, pausa, riunione, orario'],
      ['arte-nel-quartiere', 'Arte nel quartiere', 'Arte local y espacios compartidos', 'La mostra era interessante.', 'dar una opinión', 'mostra, artista, piazza, opinione'],
      ['viaggiare-con-responsabilita', 'Viaggiare con responsabilità', 'Viajar cuidando barrios y personas', 'Non voglio disturbare i residenti.', 'expresar intención', 'residente, rispetto, mappa, scelta'],
      ['sport-e-tempo-libero', 'Sport e tempo libero', 'Aficiones más allá de un solo deporte', 'Da giovane giocavo spesso.', 'hablar del pasado', 'nuoto, corsa, squadra, allenamento'],
      ['la-salute-ogni-giorno', 'La salute ogni giorno', 'Bienestar y farmacia', 'Mi fa male la gola.', 'expresar malestar simple', 'farmacia, dolore, riposo, consiglio'],
      ['storie-di-migrazione', 'Storie di migrazione', 'Italia diversa: familias y trayectorias', 'La sua famiglia è arrivata anni fa.', 'contar una historia sencilla', 'famiglia, origine, arrivare, comunità'],
      ['un-progetto-di-classe', 'Un progetto di classe', 'Colaborar para una propuesta local', 'Possiamo dividere i compiti.', 'proponer y colaborar', 'progetto, compito, idea, gruppo'],
      ['ambiente-e-citta', 'Ambiente e città', 'Reciclaje y movilidad cotidiana', 'Vorrei usare meno plastica.', 'hablar de hábitos', 'rifiuti, plastica, riciclare, ambiente'],
      ['raccontare-il-proprio-viaggio', 'Raccontare il proprio viaggio', 'Cerrar el nivel con una experiencia personal', 'È stato un viaggio importante.', 'narrar una experiencia', 'ricordo, incontro, cambiare, futuro']
    ]
  },
  portuguese: {
    label: 'Português (Brasil)', country: 'Brasil', city: 'Recife', person: 'Luana', friend: 'Rafael',
    a1: [
      ['chegando-ao-brasil', 'Chegando ao Brasil', 'Saludos y presentaciones en Recife', 'Oi, tudo bem?', 'cumprimentar e apresentar-se', 'oi, bom dia, prazer, obrigada'],
      ['um-cafe-na-padaria', 'Um café na padaria', 'Una panadería de barrio y sus pedidos', 'Um café, por favor.', 'pedir com cortesia', 'café, pão, água, por favor'],
      ['familia-e-almoco', 'Família e almoço', 'Una comida familiar cotidiana', 'A família almoça junta.', 'falar da família', 'família, almoço, mesa, juntos'],
      ['a-feira-do-bairro', 'A feira do bairro', 'Frutas, verduras y medidas en la feria', 'Quanto custa um quilo?', 'comprar na feira', 'banana, tomate, quilo, real'],
      ['caminhos-da-cidade', 'Caminhos da cidade', 'Moverse por la ciudad con claridad', 'Onde fica a parada?', 'pedir informações', 'rua, praça, parada, bicicleta'],
      ['escola-e-amizade', 'Escola e amizade', 'La escuela, amistades y proyectos', 'Qual matéria você gosta?', 'falar de gostos', 'escola, amigo, aula, tarefa'],
      ['casa-e-vizinhanca', 'Casa e vizinhança', 'La casa y el vecindario', 'A cozinha é clara.', 'descrever lugares', 'cozinha, quarto, janela, varanda'],
      ['tempo-no-recife', 'Tempo no Recife', 'El clima y las estaciones locales', 'Hoje está quente.', 'falar do tempo', 'sol, chuva, quente, vento'],
      ['uma-roda-cultural', 'Uma roda cultural', 'Una actividad cultural comunitaria', 'Vamos à roda no sábado.', 'convidar alguém', 'roda, música, bairro, sábado'],
      ['de-onibus', 'De ônibus', 'Un trayecto y una tarjeta de transporte', 'Um bilhete para o centro.', 'usar transporte', 'ônibus, bilhete, ponto, viagem'],
      ['sabores-do-brasil', 'Sabores do Brasil', 'Comidas cotidianas y regiones diversas', 'Eu gosto desta sopa.', 'expressar preferências', 'arroz, feijão, sopa, sabor'],
      ['mensagem-para-casa', 'Mensagem para casa', 'Un mensaje sobre el día', 'Hoje eu aprendi muito.', 'escrever mensagem curta', 'hoje, amanhã, casa, experiência']
    ],
    a2: [
      ['rotina-na-cidade', 'Rotina na cidade', 'Rutinas y servicios urbanos', 'Normalmente vou de ônibus.', 'descrever rotina', 'bairro, parada, trabalho, serviço'],
      ['um-fim-de-semana-em-salvador', 'Um fim de semana em Salvador', 'Planear una visita con respeto', 'Gostaria de visitar o museu.', 'fazer planos', 'museu, passeio, reserva, visita'],
      ['receitas-e-memorias', 'Receitas e memórias', 'Cocinar y recordar en familia', 'Primeiro corto os legumes.', 'explicar sequência', 'receita, ingrediente, primeiro, depois'],
      ['trabalho-e-pausa', 'Trabalho e pausa', 'Pausas y comunicación laboral', 'Posso fazer uma pausa?', 'interagir no trabalho', 'colega, pausa, reunião, horário'],
      ['arte-na-comunidade', 'Arte na comunidade', 'Arte local y espacios comunes', 'A exposição foi interessante.', 'dar opinião', 'exposição, artista, praça, opinião'],
      ['viajar-com-respeito', 'Viajar com respeito', 'Turismo responsable y comunidades', 'Não quero incomodar os moradores.', 'expressar intenção', 'morador, respeito, mapa, escolha'],
      ['esporte-e-lazer', 'Esporte e lazer', 'Aficiones y actividades al aire libre', 'Quando era criança, eu nadava.', 'falar do passado', 'natação, corrida, equipe, treino'],
      ['saude-e-bem-estar', 'Saúde e bem-estar', 'Farmacia y cuidado cotidiano', 'Minha garganta está doendo.', 'falar de mal-estar', 'farmácia, dor, descanso, conselho'],
      ['historias-de-origem', 'Histórias de origem', 'Brasil plural: orígenes y familias', 'A família chegou há muitos anos.', 'contar história simples', 'origem, chegar, família, comunidade'],
      ['um-projeto-coletivo', 'Um projeto coletivo', 'Colaborar con un proyecto de barrio', 'Podemos dividir as tarefas.', 'propor e colaborar', 'projeto, tarefa, ideia, grupo'],
      ['cidade-e-ambiente', 'Cidade e ambiente', 'Hábitos, residuos y ciudad', 'Quero usar menos plástico.', 'falar de hábitos', 'lixo, plástico, reciclar, ambiente'],
      ['contar-uma-experiencia', 'Contar uma experiência', 'Cerrar el nivel con una vivencia', 'Foi uma viagem importante.', 'contar experiência', 'lembrança, encontro, mudar, futuro']
    ]
  }
};

// Every Grammar stop must teach a named language topic, not merely repeat the
// cultural setting of its unit. These are deliberately cumulative within each
// CEFR level, while the examples keep their connection to the unit context.
const GRAMMAR_TOPICS = {
  portuguese: {
    A1: [
      ['Ser e estar: apresentações', 'Use ser para identidade e estar para estado ou localização.', 'Eu sou Luana. / Estou em Recife.', 'Apresentar-se e dizer onde você está.'],
      ['Artigos e gênero', 'Os artigos acompanham o gênero e o número do substantivo.', 'um café / uma água / os pães', 'Pedir produtos com precisão.'],
      ['Presente do indicativo', 'Use o presente para rotinas e ações habituais.', 'A família almoça junta.', 'Falar sobre ações do dia a dia.'],
      ['Perguntas com quanto e qual', 'Use quanto para preço ou quantidade e qual para escolher.', 'Quanto custa um quilo?', 'Fazer compras e pedir informação.'],
      ['Onde fica? e preposições de lugar', 'Use em, perto de e ao lado de para localizar lugares.', 'Onde fica a parada? Fica perto da praça.', 'Pedir e dar direções simples.'],
      ['Gostar de + infinitivo', 'Depois de gostar de, use o verbo no infinitivo.', 'Eu gosto de estudar português.', 'Falar de gostos e preferências.'],
      ['Adjetivos e concordância', 'O adjetivo concorda com o substantivo em gênero e número.', 'A cozinha é clara. As janelas são claras.', 'Descrever a casa e o bairro.'],
      ['Fazer e estar para o tempo', 'Use fazer para temperatura e estar para condições do tempo.', 'Hoje faz calor. O céu está nublado.', 'Falar sobre o clima.'],
      ['Ir + a / para', 'Use ir para indicar movimento e destino.', 'Vamos à roda no sábado.', 'Convidar alguém e combinar um encontro.'],
      ['Querer e poder', 'Use querer para pedir ou desejar e poder para possibilidade.', 'Quero um bilhete. Posso pagar aqui?', 'Usar transporte com cortesia.'],
      ['Gostar, preferir e não gostar', 'Use estes verbos para expressar preferências.', 'Eu gosto desta sopa, mas prefiro arroz.', 'Falar sobre comidas e gostos.'],
      ['Passado recente com ontem', 'Use o pretérito perfeito para ações concluídas.', 'Ontem eu aprendi muito.', 'Contar algo que aconteceu.']
    ],
    A2: [
      ['Rotina: advérbios de frequência', 'Use normalmente, sempre e às vezes antes do verbo principal.', 'Normalmente vou de ônibus.', 'Descrever hábitos e rotina.'],
      ['Futuro com ir + infinitivo', 'Use ir + infinitivo para planos próximos.', 'Vou visitar o museu amanhã.', 'Fazer planos.'],
      ['Sequência com primeiro, depois e por fim', 'Use conectores para organizar ações.', 'Primeiro corto os legumes; depois cozinho.', 'Explicar uma receita ou processo.'],
      ['Poder e dever', 'Use poder para pedir permissão e dever para dar conselho.', 'Posso fazer uma pausa? Você deve descansar.', 'Interagir no trabalho.'],
      ['Pretérito perfeito: foi e era', 'Use foi para um fato concluído e era para descrever.', 'A exposição foi interessante.', 'Dar opinião e contexto.'],
      ['Querer, gostar e preferir com respeito', 'Use formas suaves para expressar intenção e preferência.', 'Não quero incomodar os moradores.', 'Falar de decisiones responsables.'],
      ['Pretérito imperfeito', 'Use o imperfeito para hábitos e descrições no passado.', 'Quando era criança, eu nadava.', 'Contar hábitos do passado.'],
      ['Estar + gerúndio', 'Use estar + gerúndio para uma ação em andamento.', 'Minha garganta está doendo.', 'Descrever como você se sente agora.'],
      ['Há + tempo', 'Use há para dizer há quanto tempo algo aconteceu.', 'A família chegou há muitos anos.', 'Contar histórias familiares.'],
      ['Podemos e vamos + infinitivo', 'Use estas formas para propor ações em grupo.', 'Podemos dividir as tarefas.', 'Colaborar em um projeto.'],
      ['Menos, mais e comparativos', 'Use mais/menos ... do que para comparar hábitos.', 'Quero usar menos plástico do que antes.', 'Falar de mudanças e ambiente.'],
      ['Pretérito perfeito para experiências', 'Use o pretérito perfeito para narrar fatos concluídos.', 'Foi uma viagem importante.', 'Contar uma experiência pessoal.']
    ]
  },
  italian: {
    A1: [
      ['Essere e stare: presentarsi', 'Usa essere per l’identità e stare per lo stato o il luogo.', 'Sono Sofia. / Sto a Bologna.', 'Presentarsi e dire dove ci si trova.'],
      ['Articoli e genere', 'Gli articoli accompagnano genere e numero del nome.', 'un caffè / un’acqua / i panini', 'Ordinare con precisione.'],
      ['Presente indicativo', 'Usa il presente per abitudini e azioni quotidiane.', 'La famiglia cena insieme.', 'Parlare della routine.'],
      ['Domande con quanto e quale', 'Usa quanto per prezzo o quantità e quale per scegliere.', 'Quanto costa un chilo?', 'Fare acquisti.'],
      ['Dov’è? e preposizioni di luogo', 'Usa in, vicino a e accanto a per localizzare.', 'Dov’è la stazione?', 'Chiedere indicazioni.'],
      ['Piacere e infinito', 'Dopo piacere usa l’infinito.', 'Mi piace studiare italiano.', 'Parlare di gusti.'],
      ['Aggettivi e accordo', 'L’aggettivo concorda con nome in genere e numero.', 'La cucina è luminosa.', 'Descrivere una casa.'],
      ['Fare e c’è per il tempo', 'Usa fare per il clima e c’è per le condizioni.', 'Oggi fa caldo.', 'Parlare del tempo.'],
      ['Andare a e in', 'Usa andare a per città e andare in per luoghi.', 'Ci vediamo alla festa.', 'Fare inviti.'],
      ['Volere e potere', 'Usa volere per chiedere e potere per possibilità.', 'Vorrei un biglietto.', 'Viaggiare con cortesia.'],
      ['Mi piace e preferisco', 'Usa queste forme per esprimere preferenze.', 'Mi piace questa zuppa.', 'Parlare di cibo.'],
      ['Passato prossimo', 'Usa il passato prossimo per azioni concluse.', 'Oggi ho imparato molto.', 'Raccontare la giornata.']
    ],
    A2: [
      ['Avverbi di frequenza', 'Usa di solito, sempre e a volte per la routine.', 'Di solito prendo l’autobus.', 'Descrivere abitudini.'],
      ['Futuro con stare per', 'Usa stare per + infinito per un piano imminente.', 'Sto per visitare il museo.', 'Fare programmi.'],
      ['Connettori di sequenza', 'Usa prima, poi e infine per ordinare azioni.', 'Prima taglio le verdure, poi cucino.', 'Spiegare un processo.'],
      ['Potere e dovere', 'Usa potere per il permesso e dovere per un consiglio.', 'Posso fare una pausa?', 'Interagire al lavoro.'],
      ['Passato prossimo e imperfetto', 'Distingui fatto concluso e descrizione.', 'La mostra era interessante.', 'Dare un’opinione.'],
      ['Volere e non voler disturbare', 'Usa forme cortesi per intenzioni e rispetto.', 'Non voglio disturbare i residenti.', 'Viaggiare responsabilmente.'],
      ['Imperfetto per le abitudini', 'Usa l’imperfetto per abitudini nel passato.', 'Da giovane giocavo spesso.', 'Parlare del passato.'],
      ['Mi fa male', 'Usa mi fa male + parte del corpo.', 'Mi fa male la gola.', 'Esprimere un malessere.'],
      ['Da + tempo', 'Usa da per la durata di una situazione.', 'La famiglia vive qui da anni.', 'Raccontare una storia.'],
      ['Possiamo + infinito', 'Usa possiamo per fare proposte condivise.', 'Possiamo dividere i compiti.', 'Collaborare.'],
      ['Comparativi', 'Usa più/meno ... di per confrontare.', 'Vorrei usare meno plastica.', 'Parlare di cambiamenti.'],
      ['Passato prossimo per esperienze', 'Usa il passato prossimo per esperienze concluse.', 'È stato un viaggio importante.', 'Raccontare un’esperienza.']
    ]
  }
};

function mcq(prompt, right, wrong) { return { type: 'mcq', prompt, options: [right, ...wrong], answer: 0 }; }
function buildUnit(language, level, raw, order) {
  const c = CULTURES[language]; const [slug, title, culture, phrase, goal, words] = raw;
  const [w1, w2, w3, w4] = words.split(', '); const isA2 = level === 'A2';
  const [grammarName, grammarDefinition, grammarExample, grammarFunction] = GRAMMAR_TOPICS[language][level][order - 1];
  const pt = language === 'portuguese';
  const copy = pt
    ? { is: 'está', lives: 'mora', talks: 'conversa', first: 'Primeiro', then: 'depois', note: 'No final', asks: 'faz uma pergunta simples', writes: 'escreve uma nota', where: 'Onde', withWho: 'Com quem', why: 'Por que', listen: 'ouça', speak: 'fale', write: 'escreva', grammar: 'gramática', words: 'palavras', community: 'comunidade', learn: 'aprender', more: 'Quero saber mais.' }
    : { is: 'è', lives: 'vive', talks: 'parla', first: 'Prima', then: 'poi', note: 'Al final', asks: 'fa una domanda semplice', writes: 'scrive una nota', where: 'Dove', withWho: 'Con chi', why: 'Perché', listen: 'ascolta', speak: 'parla', write: 'scrivi', grammar: 'grammatica', words: 'parole', community: 'comunità', learn: 'Vorrei sapere di più.' };
  const text = pt
    ? (isA2
      ? `${c.person} mora em ${c.city} e conversa com ${c.friend} sobre como ${goal}. Primeiro, observam o lugar e escutam as pessoas; depois, escolhem palavras úteis para o dia. ${c.person} diz: “${phrase}” e explica por que essa experiência é importante para o bairro.`
      : `${c.person} está em ${c.city}. Hoje aprende a ${goal}. Encontra ${c.friend} e diz: “${phrase}”. Os dois conversam com respeito e aprendem quatro palavras novas: ${w1}, ${w2}, ${w3} e ${w4}.`)
    : (isA2
      ? `${c.person} ${copy.lives} em ${c.city} e ${copy.talks} con ${c.friend} sobre ${culture.toLowerCase()}. ${copy.first} osservano il luogo e ascoltano le persone; ${copy.then} scelgono parole utili per la loro giornata. ${c.person} dice: “${phrase}” e spiega perché questa experiência è importante per il quartiere.`
      : `${c.person} ${copy.is} em ${c.city}. Hoje descobre ${culture.toLowerCase()}. Encontra ${c.friend} e diz: “${phrase}”. Os dois falam com respeito e aprendem quatro palavras novas: ${w1}, ${w2}, ${w3} e ${w4}.`);
  const vocab = [w1,w2,w3,w4].map((word, i) => ({ word, translation: ['palabra cultural','acción cotidiana','lugar o cosa','expresión útil'][i], example: `${phrase}` }));
  const titleEs = culture;
  const base = (skill, fields) => ({ skill, duration: skill === 'writing' ? 12 : 8, xp: skill === 'reading' ? 25 : 20, ...fields });
  const freeUnitLimit = level === 'A1' ? 3 : 2;
  return { slug, title, titleEs, description: culture, order, accessTier: order <= freeUnitLimit ? 'free' : 'premium', unitOverview: { objective: goal, outcomes: [goal, 'comprender un fragmento cultural breve', 'usar vocabulario en un reto'], grammar: [isA2 ? 'presente y pasado cercano' : 'presente y frases útiles'], vocabulary: [w1,w2,w3,w4], scenario: culture }, activities: {
    reading: base('reading', { title: `${title}: ${pt ? 'leitura' : 'lettura'}`, description: culture, reading: { title, parts: pt ? [text, `${c.friend} faz uma pergunta simples e ${c.person} responde com uma frase curta. A conversa mostra que a cultura se aprende escutando e participando.`, `No final, ${c.person} escreve: “${phrase}”.`] : [text, `${c.friend} ${copy.asks} e ${c.person} risponde con una frase breve. La conversazione mostra che la cultura si impara ascoltando e partecipando.`, `${copy.note}, ${c.person} ${copy.writes}: “${phrase}”.`], questions: pt ? [`Onde está ${c.person}?`, `Com quem ${c.person} conversa?`, `Qual frase ${c.person} usa?`, `Por que a experiência é importante?`] : [`${copy.where} è ${c.person}?`, `${copy.withWho} parla ${c.person}?`, `Quale frase usa ${c.person}?`, `${copy.why} l’esperienza è importante?`] }, exercises: pt ? [mcq('O que a unidade pratica?', goal, ['Uma regra isolada', 'Um exame técnico', 'Um tema sem contexto']), mcq('O que o estudante faz?', goal, ['Memoriza sem usar', 'Evita falar', 'Só traduz'])] : [mcq('Che cosa pratica l’unità?', goal, ['Una regola isolata', 'Un esame tecnico', 'Un tema senza contesto']), mcq('Che cosa fa lo studente?', goal, ['Memorizza senza usare', 'Evita di parlare', 'Traduce soltanto'])] }),
    listening: base('listening', { title: `${title}: ${copy.listen}`, description: 'Escucha un diálogo cultural corto.', intro: `Escucha una situación sobre ${culture.toLowerCase()}.`, dialogue: [{speaker:c.person,line:phrase,translation:'Expresión del día.'},{speaker:c.friend,line:pt ? `Falamos de ${w1}.` : `Parliamo di ${w1}.`,translation:'Hablemos del tema.'},{speaker:c.person,line:pt ? `Gosto de aprender com a ${copy.community}.` : `Mi piace imparare con la ${copy.community}.`,translation:'Me gusta aprender con la comunidad.'},{speaker:c.friend,line:pt ? `Vamos praticar juntos amanhã.` : `Facciamo pratica insieme domani.`,translation:'Practiquemos juntos mañana.'}], transcript: `${phrase} ${pt ? `Falamos de ${w1}. Gosto de aprender com a ${copy.community}. Vamos praticar juntos amanhã.` : `Parliamo di ${w1}. Mi piace imparare con la ${copy.community}. Facciamo pratica insieme domani.`}`, phrases:[phrase, w1, w2], exercises:[mcq('¿Qué expresión escuchas?', phrase, [w1,w2,w3])] }),
    speaking: base('speaking', { title: `${title}: ${copy.speak}`, description: `Practica ${goal}.`, mission:`Di ${phrase} y añade una frase sobre ${culture.toLowerCase()}.`, phrases:[phrase, pt ? `Gosto de ${w1}.` : `Mi piace ${w1}.`, copy.learn], exercises:[{type:'speaking',prompt:`Habla 30 segundos: ${goal}. Usa «${phrase}».`,answer:'Oral practice'}] }),
    writing: base('writing', { title: `${title}: ${copy.write}`, description:'Escribe un mensaje cultural breve.', mission:`Escribe 4 frases sobre ${culture.toLowerCase()} y usa ${w1} y ${w2}.`, phrases:[phrase, pt ? `Hoje aprendi ${w1}.` : `Oggi ho imparato ${w1}.`], exercises:[{type:'writing',prompt:`Escribe un mensaje de 40-60 palabras sobre ${culture.toLowerCase()}.`,answer:'Open answer'}] }),
    grammar: base('grammar', { title: grammarName, description: grammarFunction, mission: `Aprende ${grammarName.toLowerCase()} y úsalo en una frase sobre ${culture.toLowerCase()}.`, grammarNote: grammarDefinition, phrases:[grammarExample, phrase], extra: { grammarProfile: { name: grammarName, definition: grammarDefinition, structure: grammarExample, function: grammarFunction, examples: [grammarExample, phrase] } }, exercises:[mcq('Elige el ejemplo que corresponde al tema.', grammarExample, [phrase, w1, w2]),mcq('Elige una palabra del tema.',w1,[w2,w3,w4]),mcq('Completa una frase cultural.',w2,[w1,w3,w4]),mcq('¿Qué opción se usa en este contexto?',phrase,[w3,w4,w1])] }),
    vocabulary: base('vocabulary', { title:`${title}: ${copy.words}`, description:'Vocabulario para el reto.', vocabulary:vocab, exercises:[mcq('¿Qué palabra pertenece a la unidad?',w1,['computadora','laboratorio','satélite'])] })
  }};
}

function rowsFor(language, level) { return CULTURES[language][level.toLowerCase()].map((raw,i)=>buildUnit(language,level,raw,i+1)); }
function flatten(language, level) { return rowsFor(language,level).flatMap(unit=>SKILLS.map((skill,index)=>{ const a=unit.activities[skill]; return { slug:`${language}-${level.toLowerCase()}-${unit.slug}-${skill}`, target_language:language, level, skill, unit_slug:unit.slug, title:a.title, description:a.description, order_index:unit.order*10+index, estimated_minutes:a.duration, is_free:unit.accessTier!=='premium', access_tier:unit.accessTier, content_json:{language:CULTURES[language].label,language_key:language,level_title:`${CULTURES[language].label} ${level}`,intro:a.intro||'',mission:a.mission||'',grammar:a.grammarNote||'',phrases:a.phrases||[],vocabulary:a.vocabulary||[],dialogue:a.dialogue||[],reading:a.reading ? {...a.reading,text:a.reading.parts.join('\n\n')} : null,transcript:a.transcript||'',extra:a.extra||null,exercises:a.exercises||[],xp_reward:a.xp} }; })); }
function main(){ const lessons=JSON.parse(fs.readFileSync(LESSONS,'utf8')); const units=JSON.parse(fs.readFileSync(UNITS,'utf8')); const courses=[['italian','A1'],['italian','A2'],['portuguese','A1'],['portuguese','A2']]; const keep=lessons.filter(row=>!courses.some(([l,v])=>row.target_language===l&&row.level===v)); const keepUnits=units.filter(row=>!courses.some(([l,v])=>row.target_language===l&&row.level===v)); const newUnits=courses.flatMap(([l,v])=>rowsFor(l,v).map(u=>({slug:u.slug,target_language:l,level:v,title:u.title,title_es:u.titleEs,description:u.description,order_index:u.order,unit_overview:u.unitOverview}))); fs.writeFileSync(LESSONS,JSON.stringify([...keep,...courses.flatMap(([l,v])=>flatten(l,v))],null,2)+'\n'); fs.writeFileSync(UNITS,JSON.stringify([...keepUnits,...newUnits],null,2)+'\n'); console.log(`Built ${newUnits.length} units and ${courses.length*72} activities.`); }
main();
