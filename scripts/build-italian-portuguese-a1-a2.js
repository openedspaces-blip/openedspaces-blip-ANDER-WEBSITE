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

function mcq(prompt, right, wrong) { return { type: 'mcq', prompt, options: [right, ...wrong], answer: 0 }; }
function buildUnit(language, level, raw, order) {
  const c = CULTURES[language]; const [slug, title, culture, phrase, goal, words] = raw;
  const [w1, w2, w3, w4] = words.split(', '); const isA2 = level === 'A2';
  const pt = language === 'portuguese';
  const copy = pt
    ? { is: 'está', lives: 'mora', talks: 'conversa', first: 'Primeiro', then: 'depois', note: 'No final', asks: 'faz uma pergunta simples', writes: 'escreve uma nota', where: 'Onde', withWho: 'Com quem', why: 'Por que', listen: 'ouça', speak: 'fale', write: 'escreva', grammar: 'gramática', words: 'palavras', community: 'comunidade', learn: 'aprender', more: 'Quero saber mais.' }
    : { is: 'è', lives: 'vive', talks: 'parla', first: 'Prima', then: 'poi', note: 'Al final', asks: 'fa una domanda semplice', writes: 'scrive una nota', where: 'Dove', withWho: 'Con chi', why: 'Perché', listen: 'ascolta', speak: 'parla', write: 'scrivi', grammar: 'grammatica', words: 'parole', community: 'comunità', learn: 'Vorrei sapere di più.' };
  const text = isA2
    ? `${c.person} ${copy.lives} em ${c.city} e ${copy.talks} con ${c.friend} sobre ${culture.toLowerCase()}. ${copy.first} osservano il luogo e ascoltano le persone; ${copy.then} scelgono parole utili per la loro giornata. ${c.person} dice: “${phrase}” e spiega perché questa esperienza è importante per il quartiere.`
    : `${c.person} ${copy.is} em ${c.city}. Hoje descobre ${culture.toLowerCase()}. Encontra ${c.friend} e diz: “${phrase}”. Os dois falam com respeito e aprendem quatro palavras novas: ${w1}, ${w2}, ${w3} e ${w4}.`;
  const vocab = [w1,w2,w3,w4].map((word, i) => ({ word, translation: ['palabra cultural','acción cotidiana','lugar o cosa','expresión útil'][i], example: `${phrase}` }));
  const titleEs = culture;
  const base = (skill, fields) => ({ skill, duration: skill === 'writing' ? 12 : 8, xp: skill === 'reading' ? 25 : 20, ...fields });
  return { slug, title, titleEs, description: culture, order, accessTier: order <= 2 ? 'free' : 'premium', unitOverview: { objective: goal, outcomes: [goal, 'comprender un fragmento cultural breve', 'usar vocabulario en un reto'], grammar: [isA2 ? 'presente y pasado cercano' : 'presente y frases útiles'], vocabulary: [w1,w2,w3,w4], scenario: culture }, activities: {
    reading: base('reading', { title: `${title}: lectura`, description: culture, reading: { title, parts: [text, `${c.friend} ${copy.asks} e ${c.person} responde con una frase corta. La conversación muestra que la cultura se aprende escuchando y participando.`, `${copy.note}, ${c.person} ${copy.writes}: “${phrase}”.`], questions: [`${copy.where} è/está ${c.person}?`, `${copy.withWho} fala/parla ${c.person}?`, `Qual frase usa ${c.person}?`, `${copy.why} l’esperienza é importante?`] }, exercises: [mcq('¿Qué practica la unidad?', culture, ['Una regla aislada','Un examen técnico','Un tema sin contexto']), mcq('¿Qué hace el estudiante?', goal, ['Memoriza sin usar','Evita hablar','Solo traduce'])] }),
    listening: base('listening', { title: `${title}: ${copy.listen}`, description: 'Escucha un diálogo cultural corto.', intro: `Escucha una situación sobre ${culture.toLowerCase()}.`, dialogue: [{speaker:c.person,line:phrase,translation:'Expresión del día.'},{speaker:c.friend,line:pt ? `Falamos de ${w1}.` : `Parliamo di ${w1}.`,translation:'Hablemos del tema.'},{speaker:c.person,line:pt ? `Gosto de aprender com a ${copy.community}.` : `Mi piace imparare con la ${copy.community}.`,translation:'Me gusta aprender con la comunidad.'},{speaker:c.friend,line:pt ? `Vamos praticar juntos amanhã.` : `Facciamo pratica insieme domani.`,translation:'Practiquemos juntos mañana.'}], transcript: `${phrase} ${pt ? `Falamos de ${w1}. Gosto de aprender com a ${copy.community}. Vamos praticar juntos amanhã.` : `Parliamo di ${w1}. Mi piace imparare con la ${copy.community}. Facciamo pratica insieme domani.`}`, phrases:[phrase, w1, w2], exercises:[mcq('¿Qué expresión escuchas?', phrase, [w1,w2,w3])] }),
    speaking: base('speaking', { title: `${title}: ${copy.speak}`, description: `Practica ${goal}.`, mission:`Di ${phrase} y añade una frase sobre ${culture.toLowerCase()}.`, phrases:[phrase, pt ? `Gosto de ${w1}.` : `Mi piace ${w1}.`, copy.learn], exercises:[{type:'speaking',prompt:`Habla 30 segundos: ${goal}. Usa «${phrase}».`,answer:'Oral practice'}] }),
    writing: base('writing', { title: `${title}: ${copy.write}`, description:'Escribe un mensaje cultural breve.', mission:`Escribe 4 frases sobre ${culture.toLowerCase()} y usa ${w1} y ${w2}.`, phrases:[phrase, pt ? `Hoje aprendi ${w1}.` : `Oggi ho imparato ${w1}.`], exercises:[{type:'writing',prompt:`Escribe un mensaje de 40-60 palabras sobre ${culture.toLowerCase()}.`,answer:'Open answer'}] }),
    grammar: base('grammar', { title:`${title}: ${copy.grammar}`, description:'Estructura útil en contexto.', grammarNote: isA2 ? 'Usa el presente para describir y una forma de pasado cercano para contar una experiencia terminada.' : 'Usa frases breves en presente y expresiones de cortesía para participar en una situación cotidiana.', phrases:[phrase], exercises:[mcq('Elige la frase útil.', phrase, [w1,w2,w3]),mcq('Elige una palabra del tema.',w1,[w2,w3,w4]),mcq('Completa una frase cultural.',w2,[w1,w3,w4]),mcq('¿Qué opción es más cortés?',phrase,[w3,w4,w1])] }),
    vocabulary: base('vocabulary', { title:`${title}: ${copy.words}`, description:'Vocabulario para el reto.', vocabulary:vocab, exercises:[mcq('¿Qué palabra pertenece a la unidad?',w1,['computadora','laboratorio','satélite'])] })
  }};
}

function rowsFor(language, level) { return CULTURES[language][level.toLowerCase()].map((raw,i)=>buildUnit(language,level,raw,i+1)); }
function flatten(language, level) { return rowsFor(language,level).flatMap(unit=>SKILLS.map((skill,index)=>{ const a=unit.activities[skill]; return { slug:`${language}-${level.toLowerCase()}-${unit.slug}-${skill}`, target_language:language, level, skill, unit_slug:unit.slug, title:a.title, description:a.description, order_index:unit.order*10+index, estimated_minutes:a.duration, is_free:unit.accessTier!=='premium', access_tier:unit.accessTier, content_json:{language:CULTURES[language].label,language_key:language,level_title:`${CULTURES[language].label} ${level}`,intro:a.intro||'',mission:a.mission||'',grammar:a.grammarNote||'',phrases:a.phrases||[],vocabulary:a.vocabulary||[],dialogue:a.dialogue||[],reading:a.reading ? {...a.reading,text:a.reading.parts.join('\n\n')} : null,transcript:a.transcript||'',exercises:a.exercises||[],xp_reward:a.xp} }; })); }
function main(){ const lessons=JSON.parse(fs.readFileSync(LESSONS,'utf8')); const units=JSON.parse(fs.readFileSync(UNITS,'utf8')); const courses=[['italian','A1'],['italian','A2'],['portuguese','A1'],['portuguese','A2']]; const keep=lessons.filter(row=>!courses.some(([l,v])=>row.target_language===l&&row.level===v)); const keepUnits=units.filter(row=>!courses.some(([l,v])=>row.target_language===l&&row.level===v)); const newUnits=courses.flatMap(([l,v])=>rowsFor(l,v).map(u=>({slug:u.slug,target_language:l,level:v,title:u.title,title_es:u.titleEs,description:u.description,order_index:u.order,unit_overview:u.unitOverview}))); fs.writeFileSync(LESSONS,JSON.stringify([...keep,...courses.flatMap(([l,v])=>flatten(l,v))],null,2)+'\n'); fs.writeFileSync(UNITS,JSON.stringify([...keepUnits,...newUnits],null,2)+'\n'); console.log(`Built ${newUnits.length} units and ${courses.length*72} activities.`); }
main();
