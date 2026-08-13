#!/usr/bin/env node
// Rebuild the Italian, Portuguese and German A1-B1 readings as distinct,
// topic-led texts. This deliberately replaces the older generic padding.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'lib', 'seed-lessons.json');
const lessons = require(file);
const languages = new Set(['italian', 'portuguese', 'german']);
const levels = new Set(['A1', 'A2', 'B1']);

const THEMES = {
  italian: {
    welcome: ['una studentessa appena arrivata', 'Marco', 'la piazza vicino alla stazione', 'presentarsi e chiedere informazioni'],
    cafe: ['Giulia', 'il barista Paolo', 'un piccolo bar del quartiere', 'ordinare con gentilezza'],
    family: ['Elena', 'sua nonna', 'la cucina di casa', 'raccontare la famiglia'],
    market: ['Luca', 'la venditrice del mercato', 'il mercato del sabato', 'comprare frutta e verdura'],
    bike: ['Marta', 'il suo vicino Davide', 'la pista ciclabile', 'muoversi in sicurezza'],
    school: ['Sara', 'la sua compagna Nina', 'la biblioteca della scuola', 'studiare con gli amici'],
    home: ['Paolo', 'sua sorella Anna', 'un appartamento luminoso', 'descrivere la casa'],
    weather: ['Chiara', 'suo padre', 'il parco', 'parlare del tempo'],
    festival: ['Amir', 'la signora Rosa', 'la festa di quartiere', 'invitare le persone'],
    train: ['Valentina', 'un controllore gentile', 'la stazione centrale', 'fare un viaggio in treno'],
    food: ['Tommaso', 'la cuoca del ristorante', 'una trattoria familiare', 'scoprire i sapori italiani'],
    message: ['Francesca', 'sua madre', 'il suo telefono', 'scrivere un messaggio affettuoso'],
    city: ['Claudia', 'un collega', 'il centro della città', 'organizzare la giornata'],
    napoli: ['Riccardo', 'la sua amica Elena', 'Napoli per un fine settimana', 'visitare senza fretta'],
    recipes: ['Marta', 'suo zio', 'la cucina della famiglia', 'preparare una ricetta'],
    work: ['Andrea', 'la collega Sofia', "l'ufficio e il bar vicino", 'bilanciare lavoro e pausa'],
    art: ['Elisa', 'un artista locale', 'un muro del quartiere', 'partecipare a un progetto artistico'],
    travel: ['Sofia', 'un gestore di un piccolo albergo', 'un paese sul lago', 'viaggiare con rispetto'],
    sport: ['Matteo', 'il suo allenatore', 'il centro sportivo', "scegliere un'attività sana"],
    health: ['Laura', 'il medico di famiglia', 'la farmacia del quartiere', 'prendersi cura della salute'],
    migration: ['Nadia', 'sua zia', 'una cena tra vicini', 'ascoltare una storia di origine'],
    project: ['Federico', 'la sua classe', "l'aula di scienze", 'presentare una ricerca'],
    environment: ['Irene', 'un volontario', 'il giardino pubblico', 'ridurre gli sprechi'],
    experience: ['Giorgio', 'un gruppo di viaggiatori', 'un ostello', 'raccontare un viaggio'],
    workgoals: ['Sofia', 'Marco', 'un piccolo laboratorio', 'definire obiettivi concreti'],
    travelb1: ['Sofia', 'Marco', 'una valle visitata da molti turisti', 'proteggere un luogo durante il viaggio'],
    healthb1: ['Elena', 'un fisioterapista', 'un centro di quartiere', 'cercare un equilibrio sostenibile'],
    media: ['Giulia', 'un giornalista locale', 'una redazione civica', 'valutare una notizia'],
    environmentb1: ['Lorenzo', 'un gruppo di vicini', 'un cortile comune', 'ridurre i rifiuti'],
    memories: ['Marta', 'suo nonno', 'un album di fotografie', 'collegare memoria e cambiamento'],
    classproject: ['Paolo', 'la sua classe', 'la biblioteca comunale', 'realizzare una ricerca condivisa'],
    technology: ['Chiara', 'suo fratello', 'un laboratorio digitale', 'usare la tecnologia con attenzione'],
    mobility: ['Davide', "un'associazione locale", 'una strada trafficata', 'migliorare gli spostamenti'],
    future: ['Nadia', 'la sua tutor', 'un centro di orientamento', 'scegliere un percorso futuro'],
    relationships: ['Elisa', 'la sua collega Sara', 'un gruppo di lavoro', 'ascoltare e chiarire un malinteso'],
    citizenship: ['Luca', 'un consigliere comunale', "un'assemblea di quartiere", 'partecipare a una decisione pubblica']
  },
  portuguese: {
    welcome: ['uma estudante recém-chegada', 'Rafael', 'a praça perto da estação', 'apresentar-se e pedir informações'],
    cafe: ['Julia', 'o padeiro Paulo', 'uma padaria do bairro', 'fazer um pedido com gentileza'],
    family: ['Elena', 'a avó', 'a cozinha de casa', 'contar sobre a família'],
    market: ['Lucas', 'a vendedora da feira', 'a feira do bairro', 'comprar frutas e verduras'],
    city: ['Marta', 'o vizinho Davi', 'as ruas da cidade', 'encontrar um caminho'],
    school: ['Sara', 'a colega Nina', 'a biblioteca da escola', 'estudar com amigos'],
    home: ['Paulo', 'a irmã Ana', 'um apartamento claro', 'descrever a casa'],
    weather: ['Clara', 'o pai', 'um parque no Recife', 'falar sobre o tempo'],
    festival: ['Amir', 'dona Rosa', 'uma roda cultural', 'convidar as pessoas'],
    bus: ['Valentina', 'um motorista atencioso', 'um ônibus urbano', 'viajar pela cidade'],
    food: ['Tomás', 'a cozinheira do restaurante', 'um restaurante familiar', 'conhecer sabores do Brasil'],
    message: ['Francisca', 'a mãe', 'o celular', 'escrever uma mensagem carinhosa'],
    routine: ['Claudia', 'um colega', 'o centro da cidade', 'organizar a rotina'],
    salvador: ['Ricardo', 'a amiga Elena', 'Salvador num fim de semana', 'conhecer a cidade com calma'],
    recipes: ['Marta', 'o tio', 'a cozinha da família', 'preparar uma receita'],
    work: ['André', 'a colega Sofia', 'o escritório e um café próximo', 'equilibrar trabalho e pausa'],
    art: ['Elisa', 'uma artista local', 'um muro da comunidade', 'participar de um projeto artístico'],
    travel: ['Sofia', 'uma dona de pousada', 'uma cidade perto do mar', 'viajar com respeito'],
    sport: ['Mateus', 'o treinador', 'um centro esportivo', 'escolher uma atividade saudável'],
    health: ['Laura', 'a médica da família', 'o posto de saúde', 'cuidar da saúde'],
    origin: ['Nádia', 'a tia', 'um jantar entre vizinhos', 'escutar uma história de origem'],
    project: ['Frederico', 'a turma', 'a sala de ciências', 'apresentar uma pesquisa'],
    environment: ['Irene', 'um voluntário', 'um jardim público', 'reduzir desperdícios'],
    experience: ['Gustavo', 'um grupo de viajantes', 'uma pousada', 'contar uma experiência'],
    workgoals: ['Sofia', 'Rafael', 'uma pequena oficina', 'definir metas concretas'],
    travelb1: ['Sofia', 'Rafael', 'uma região visitada por turistas', 'proteger um lugar durante a viagem'],
    healthb1: ['Elena', 'um fisioterapeuta', 'um centro comunitário', 'buscar equilíbrio duradouro'],
    media: ['Julia', 'um jornalista local', 'uma redação comunitária', 'avaliar uma notícia'],
    environmentb1: ['Lorenzo', 'um grupo de vizinhos', 'um pátio coletivo', 'reduzir resíduos'],
    memories: ['Marta', 'o avô', 'um álbum de fotografias', 'ligar memória e mudança'],
    classproject: ['Paulo', 'a turma', 'a biblioteca municipal', 'realizar uma pesquisa coletiva'],
    technology: ['Clara', 'o irmão', 'um laboratório digital', 'usar a tecnologia com atenção'],
    mobility: ['Davi', 'uma associação local', 'uma avenida movimentada', 'melhorar os deslocamentos'],
    future: ['Nádia', 'a orientadora', 'um centro de orientação', 'escolher um caminho futuro'],
    relationships: ['Elisa', 'a colega Sara', 'uma equipe de trabalho', 'escutar e esclarecer um mal-entendido'],
    citizenship: ['Lucas', 'um conselheiro municipal', 'uma reunião do bairro', 'participar de uma decisão pública']
  },
  german: {
    welcome: ['eine neu angekommene Studentin', 'Leon', 'den Platz an der Station', 'sich vorstellen und Informationen fragen'],
    cafe: ['Julia', 'den Kellner Paul', 'ein Café im Viertel', 'höflich bestellen'],
    family: ['Elena', 'ihre Großmutter', 'die Küche zu Hause', 'über die Familie erzählen'],
    market: ['Lukas', 'die Verkäuferin', 'den Wochenmarkt', 'Obst und Gemüse kaufen'],
    city: ['Marta', 'den Nachbarn David', 'die Straßen der Stadt', 'einen Weg finden'],
    school: ['Sara', 'ihre Freundin Nina', 'die Schulbibliothek', 'mit Freunden lernen'],
    home: ['Paul', 'seine Schwester Anna', 'eine helle Wohnung', 'die Wohnung beschreiben'],
    weather: ['Clara', 'ihren Vater', 'den Park', 'über das Wetter sprechen'],
    festival: ['Amir', 'Frau Rosa', 'ein Nachbarschaftsfest', 'Menschen einladen'],
    train: ['Valentina', 'einen freundlichen Schaffner', 'den Hauptbahnhof', 'mit dem Zug reisen'],
    clothes: ['Lea', 'ihre Freundin Emma', 'ein kleines Geschäft', 'Kleidung und Farben auswählen'],
    birthday: ['Jonas', 'seinen Cousin', 'eine Geburtstagsfeier', 'eine Einladung verstehen'],
    routine: ['Claudia', 'einen Kollegen', 'das Stadtzentrum', 'den Alltag planen'],
    homea2: ['Ricarda', 'einen Makler', 'eine ruhige Straße', 'eine Wohnung suchen'],
    health: ['Laura', 'den Hausarzt', 'die Apotheke', 'auf die Gesundheit achten'],
    work: ['Andreas', 'seine Kollegin Sofia', 'das Büro', 'über Arbeit und Beruf sprechen'],
    travel: ['Sofia', 'einen Reiseleiter', 'eine kleine Stadt', 'eine Reise beschreiben'],
    food: ['Marta', 'ihren Onkel', 'die Familienküche', 'ein Rezept erklären'],
    environment: ['Irene', 'einen Freiwilligen', 'einen öffentlichen Garten', 'Müll vermeiden'],
    media: ['Julia', 'einen Bibliothekar', 'ein Medienzentrum', 'Informationen prüfen'],
    learning: ['Nadia', 'ihre Lehrerin', 'einen Sprachkurs', 'Lernziele setzen'],
    service: ['Lukas', 'eine Mitarbeiterin im Rathaus', 'ein Servicebüro', 'ein Formular verstehen'],
    traditions: ['Amir', 'seine Tante', 'ein Stadtfest', 'eine Tradition erleben'],
    workgoals: ['Sofia', 'Leon', 'eine kleine Werkstatt', 'konkrete Ziele vereinbaren'],
    travelb1: ['Sofia', 'Leon', 'eine stark besuchte Landschaft', 'einen Ort auf Reisen schützen'],
    healthb1: ['Elena', 'einen Physiotherapeuten', 'ein Nachbarschaftszentrum', 'ein gesundes Gleichgewicht finden'],
    mediaB1: ['Julia', 'einen Lokaljournalisten', 'eine Bürgerredaktion', 'eine Nachricht bewerten'],
    environmentb1: ['Lorenzo', 'eine Gruppe von Nachbarn', 'einen gemeinsamen Hof', 'Abfall reduzieren'],
    memories: ['Marta', 'ihren Großvater', 'ein Fotoalbum', 'Erinnerung und Veränderung verbinden'],
    classproject: ['Paul', 'seine Klasse', 'die Stadtbibliothek', 'eine gemeinsame Recherche durchführen'],
    technology: ['Clara', 'ihren Bruder', 'ein digitales Labor', 'Technik bewusst nutzen'],
    mobility: ['David', 'einen örtlichen Verein', 'eine volle Straße', 'Wege in der Stadt verbessern'],
    future: ['Nadia', 'ihre Beraterin', 'ein Beratungszentrum', 'einen Weg für die Zukunft wählen'],
    relationships: ['Elisa', 'ihre Kollegin Sara', 'ein Arbeitsteam', 'zuhören und ein Missverständnis klären'],
    citizenship: ['Lukas', 'einen Stadtrat', 'eine Bürgerversammlung', 'an einer öffentlichen Entscheidung mitwirken']
  }
};

function keyFor(slug) {
  const key = slug.replace(/^(italian|portuguese|german)-(a1|a2|b1)-/, '').replace(/-reading$/, '');
  const maps = {
    italian: [['benvenuti','welcome'],['caffe','cafe'],['famiglia','family'],['mercato','market'],['bicicletta','bike'],['scuola','school'],['casa','home'],['tempo','weather'],['festa','festival'],['treno','train'],['sapori','food'],['messaggio','message'],['vita-in-citta','city'],['napoli','napoli'],['ricette','recipes'],['lavoro-e-il','work'],['arte','art'],['responsabilita','travel'],['sport','sport'],['salute-ogni','health'],['migrazione','migration'],['progetto-di','project'],['ambiente-e','environment'],['raccontare','experience'],['lavoro-e-obiettivi','workgoals'],['viaggi-consapevoli','travelb1'],['salute-e-benessere','healthb1'],['cultura-e-media','media'],['ambiente-nel','environmentb1'],['storie-e','memories'],['progetti-di','classproject'],['tecnologia','technology'],['citta-e','mobility'],['piani','future'],['relazioni','relationships'],['cittadinanza','citizenship']],
    portuguese: [['chegando','welcome'],['cafe','cafe'],['familia','family'],['feira','market'],['caminhos','city'],['escola','school'],['casa','home'],['tempo','weather'],['roda','festival'],['onibus','bus'],['sabores','food'],['mensagem','message'],['rotina','routine'],['salvador','salvador'],['receitas','recipes'],['trabalho-e-pausa','work'],['arte','art'],['viajar','travel'],['esporte','sport'],['saude-e-bem','health'],['origem','origin'],['projeto-coletivo','project'],['cidade-e-ambiente','environment'],['contar','experience'],['trabalho-e-planos','workgoals'],['viagens-com','travelb1'],['saude-e-equilibrio','healthb1'],['cultura-e','media'],['ambiente-no','environmentb1'],['historias','memories'],['projeto-coletivo','classproject'],['tecnologia','technology'],['cidade-e-mobilidade','mobility'],['planos','future'],['relacoes','relationships'],['cidadania','citizenship']],
    german: [['begrussung','welcome'],['cafe','cafe'],['familie','family'],['einkaufen','market'],['in-der-stadt','city'],['schule','school'],['zu-hause','home'],['wetter','weather'],['freizeit','festival'],['unterwegs','train'],['kleidung','clothes'],['geburtstag','birthday'],['alltag','routine'],['wohnungssuche','homea2'],['gesundheit','health'],['arbeit-und-beruf','work'],['reisen-und','travel'],['essen','food'],['natur','environment'],['medien-und','media'],['lernen','learning'],['stadt-und-service','service'],['feste','traditions'],['arbeit-und-ziele','workgoals'],['bewusst-reisen','travelb1'],['gesundheit-und','healthb1'],['kultur-und-medien','mediaB1'],['umwelt','environmentb1'],['geschichten','memories'],['gemeinschaftsprojekt','classproject'],['technik','technology'],['stadt-und-mobilitat','mobility'],['plane','future'],['beziehungen','relationships'],['gesellschaft','citizenship']]
  };
  return maps[slug.split('-')[0]].find(([fragment]) => key.includes(fragment))?.[1] || 'city';
}

function buildItalian(level, [name, partner, place, goal]) {
  if (level === 'A1') return [
    `${name} è a ${place}. Incontra ${partner} e saluta con un sorriso. ${name} vuole ${goal}, perciò ascolta con attenzione e usa parole semplici. ${partner} risponde lentamente e indica ciò che può aiutare.`,
    `Poi i due parlano di una piccola situazione della giornata. ${name} fa una domanda, riceve una risposta e ringrazia. Prima di andare via, decidono di ripetere le parole più utili: così la prossima conversazione sarà più facile.`
  ];
  if (level === 'A2') return [
    `La settimana scorsa ${name} ha trascorso un pomeriggio a ${place}. Aveva deciso di ${goal}, ma all'inizio non conosceva tutti i dettagli. Per questo ha chiesto informazioni a ${partner}, che le ha spiegato con calma come organizzarsi.`,
    `Durante l'attività, ${name} ha osservato le persone e ha scoperto una soluzione pratica. Non tutto è andato come previsto, tuttavia ha cambiato piano senza perdere la calma. ${partner} ha apprezzato il suo modo di ascoltare prima di scegliere.`,
    `Alla fine hanno condiviso ciò che avevano imparato e hanno preparato un breve messaggio per chi arriverà dopo. ${name} pensa che l'esperienza sia stata utile perché le ha dato parole nuove e più fiducia per agire da sola.`
  ];
  return [
    `Per ${name}, ${goal} è diventato un tema concreto dopo un incontro a ${place}. Con ${partner} ha raccolto opinioni diverse: alcune persone volevano una decisione immediata, altre chiedevano prima informazioni più affidabili.`,
    `${name} ha proposto di distinguere tra ciò che era urgente e ciò che richiedeva una verifica. Invece di scegliere la soluzione più visibile, il gruppo ha confrontato costi, conseguenze e bisogni delle persone coinvolte. Questa discussione ha mostrato che collaborare significa anche accettare dubbi ragionevoli.`,
    `Nei giorni seguenti, ${partner} ha preparato un riepilogo con gli accordi e le domande ancora aperte. ${name} ha contattato chi non aveva potuto partecipare, perché una decisione è più solida quando include prospettive diverse.`,
    `Dopo un mese valuteranno i risultati con esempi concreti, non solo con impressioni. ${name} non cerca una risposta perfetta: vuole un modo responsabile per migliorare la situazione e imparare dall'esperienza.`
  ];
}

function buildPortuguese(level, [name, partner, place, goal]) {
  if (level === 'A1') return [
    `${name} está em ${place}. Ela encontra ${partner} e cumprimenta com um sorriso. ${name} quer ${goal}, por isso escuta com atenção e usa palavras simples. ${partner} responde devagar e mostra o que pode ajudar.`,
    `Depois, os dois falam de uma situação pequena do dia. ${name} faz uma pergunta, recebe uma resposta e agradece. Antes de sair, eles repetem as palavras mais úteis: assim, a próxima conversa será mais fácil.`
  ];
  if (level === 'A2') return [
    `Na semana passada, ${name} passou uma tarde em ${place}. Ela tinha decidido ${goal}, mas no começo não conhecia todos os detalhes. Por isso, pediu informações a ${partner}, que explicou com calma como se organizar.`,
    `Durante a atividade, ${name} observou as pessoas e descobriu uma solução prática. Nem tudo aconteceu como ela esperava; mesmo assim, mudou o plano sem perder a tranquilidade. ${partner} gostou da maneira como ela escutou antes de escolher.`,
    `No fim, os dois compartilharam o que aprenderam e prepararam uma mensagem curta para quem chegasse depois. ${name} acha que a experiência foi útil porque trouxe palavras novas e mais confiança para agir sozinha.`
  ];
  return [
    `Para ${name}, ${goal} tornou-se um assunto concreto depois de uma reunião em ${place}. Com ${partner}, ela ouviu opiniões diferentes: algumas pessoas queriam decidir logo, enquanto outras pediam informações mais seguras antes de agir.`,
    `${name} sugeriu separar o que era urgente do que precisava de mais pesquisa. Em vez de escolher a solução mais visível, o grupo comparou custos, consequências e necessidades das pessoas envolvidas. A conversa mostrou que colaborar também exige aceitar dúvidas razoáveis.`,
    `Nos dias seguintes, ${partner} preparou um resumo com os acordos e as perguntas que continuavam abertas. ${name} procurou quem não pôde participar, pois uma decisão é mais forte quando inclui perspectivas diferentes.`,
    `Depois de um mês, eles vão avaliar os resultados com exemplos concretos, e não apenas com impressões. ${name} não procura uma resposta perfeita: ela quer melhorar a situação com responsabilidade e aprender com a experiência.`
  ];
}

function buildGerman(level, [name, partner, place, goal]) {
  if (level === 'A1') return [
    `${name} ist an ${place}. Dort trifft ${name} ${partner} und sagt freundlich Hallo. ${name} möchte ${goal}, deshalb hört sie gut zu und benutzt einfache Wörter. ${partner} antwortet langsam und zeigt, was helfen kann.`,
    `Danach sprechen beide über eine kleine Situation aus dem Alltag. ${name} stellt eine Frage, bekommt eine Antwort und sagt Danke. Bevor sie gehen, wiederholen sie die wichtigsten Wörter. So wird das nächste Gespräch leichter.`
  ];
  if (level === 'A2') return [
    `Letzte Woche war ${name} an ${place}. ${name} wollte ${goal}, kannte aber zuerst nicht alle Details. Deshalb fragte sie ${partner} nach Informationen. ${partner} erklärte ruhig, wie man sich vorbereiten kann.`,
    `Während der Aktivität beobachtete ${name} die Menschen und fand eine praktische Lösung. Nicht alles lief wie geplant, trotzdem änderte sie den Plan ohne Stress. ${partner} fand es gut, dass ${name} zuerst zuhörte und dann entschied.`,
    `Am Ende erzählten beide, was sie gelernt hatten, und schrieben eine kurze Nachricht für die nächsten Besucher. ${name} fand die Erfahrung hilfreich, weil sie neue Wörter gelernt und mehr Mut bekommen hatte.`
  ];
  return [
    `Für ${name} wurde ${goal} nach einem Treffen an ${place} zu einem wichtigen Thema. Zusammen mit ${partner} hörte ${name} verschiedene Meinungen: Einige wollten sofort entscheiden, andere wollten zuerst verlässliche Informationen sammeln.`,
    `${name} schlug vor, Dringendes von Fragen zu trennen, die noch geprüft werden mussten. Statt die sichtbarste Lösung zu wählen, verglich die Gruppe Kosten, Folgen und Bedürfnisse der betroffenen Menschen. Das Gespräch zeigte: Zusammenarbeit bedeutet auch, vernünftige Zweifel ernst zu nehmen.`,
    `In den folgenden Tagen schrieb ${partner} eine Zusammenfassung mit den Vereinbarungen und den offenen Fragen. ${name} sprach außerdem mit Personen, die nicht dabei sein konnten, denn eine Entscheidung wird besser, wenn unterschiedliche Perspektiven gehört werden.`,
    `Nach einem Monat wollen sie die Ergebnisse anhand konkreter Beispiele prüfen, nicht nur nach Gefühlen. ${name} sucht keine perfekte Antwort. Sie möchte die Situation verantwortungsvoll verbessern und aus der Erfahrung lernen.`
  ];
}

const builders = { italian: buildItalian, portuguese: buildPortuguese, german: buildGerman };
let changed = 0;
for (const lesson of lessons) {
  if (!languages.has(lesson.target_language) || !levels.has(lesson.level) || lesson.skill !== 'reading') continue;
  const theme = THEMES[lesson.target_language][keyFor(lesson.slug)];
  if (!theme) throw new Error(`Missing theme for ${lesson.slug}`);
  const parts = builders[lesson.target_language](lesson.level, theme);
  lesson.content_json.reading = { ...lesson.content_json.reading, text: parts.join('\n\n'), parts };
  changed += 1;
}
fs.writeFileSync(file, `${JSON.stringify(lessons, null, 2)}\n`, 'utf8');
console.log(`Rebuilt ${changed} distinct European readings.`);
