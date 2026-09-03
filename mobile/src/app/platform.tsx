import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { loadCurriculum, loadLessonActivity, type LessonActivity } from '@/services/curriculum';
import { useAuth } from '@/context/auth';
import { type TargetLanguage, useGame } from '@/context/game';

const VALID_SECTIONS = new Set(['games', 'infographics', 'useful-expressions', 'technical-english']);
const LOCALES = { english: 'en-US', french: 'fr-FR', spanish: 'es-ES', italian: 'it-IT', portuguese: 'pt-BR', german: 'de-DE' } as const;
// These are the reviewed quick-practice entries from the platform's
// Technical English library, kept native rather than sending the learner
// to a web page or filling the screen with unrelated A1 vocabulary.
const TECHNICAL_TOPICS = [
  { icon: '⚾', title: 'Prospectos de béisbol', copy: 'Perfil, prueba y comunicación con scouts.', phrases: [['I am a shortstop with quick hands.', 'Soy campocorto con manos rápidas.'], ['I am ready for a tryout.', 'Estoy listo para una prueba.'], ['What does the scout look for?', '¿Qué busca el cazatalentos?']] },
  { icon: '💼', title: 'Negocios', copy: 'Reuniones, propuestas y seguimiento.', phrases: [['I would like to discuss the proposal.', 'Me gustaría hablar sobre la propuesta.'], ['Could we schedule a meeting?', '¿Podemos programar una reunión?'], ['Please send me the invoice.', 'Por favor envíeme la factura.']] },
  { icon: '🧳', title: 'Turismo', copy: 'Reservas, orientación y atención.', phrases: [['Could you recommend a local tour?', '¿Puede recomendarme un tour local?'], ['What time does the museum open?', '¿A qué hora abre el museo?'], ['I need help with my reservation.', 'Necesito ayuda con mi reserva.']] },
  { icon: '🍽️', title: 'Servicios gastronómicos', copy: 'Pedidos, alérgenos y cuenta.', phrases: [['May I take your order?', '¿Puedo tomar su orden?'], ['Do you have any food allergies?', '¿Tiene alguna alergia alimentaria?'], ['Your table is ready.', 'Su mesa está lista.']] },
  { icon: '🌐', title: 'Soporte de redes', copy: 'Incidencias, conexión y tickets.', phrases: [['Please restart the router.', 'Por favor reinicie el enrutador.'], ['The connection is unstable.', 'La conexión es inestable.'], ['I will open a support ticket.', 'Abriré un ticket de soporte.']] },
  { icon: '📊', title: 'Contabilidad', copy: 'Facturas, gastos y revisión.', phrases: [['The balance does not match.', 'El balance no coincide.'], ['Please attach the receipt.', 'Por favor adjunte el recibo.'], ['We need to review the expenses.', 'Necesitamos revisar los gastos.']] },
  { icon: '💛', title: 'Para enamorarse', copy: 'Conversaciones respetuosas y cotidianas.', phrases: [['I enjoy spending time with you.', 'Disfruto pasar tiempo contigo.'], ['Would you like to go out with me?', '¿Te gustaría salir conmigo?'], ['You make me feel special.', 'Me haces sentir especial.']] },
  { icon: '✈️', title: 'Viajar', copy: 'Aeropuerto, hotel y movilidad.', phrases: [['Where is the boarding gate?', '¿Dónde está la puerta de embarque?'], ['I would like a window seat.', 'Quisiera un asiento junto a la ventana.'], ['Could you call a taxi, please?', '¿Podría llamar un taxi, por favor?']] },
  { icon: '📖', title: 'Bíblico y teológico', copy: 'Estudio, reflexión y comunidad.', phrases: [['Let us read this passage together.', 'Leamos este pasaje juntos.'], ['What is the meaning of this verse?', '¿Cuál es el significado de este versículo?'], ['Faith gives us hope.', 'La fe nos da esperanza.']] },
  { icon: '🗣️', title: 'Inglés de calle', copy: 'Conversación informal real.', phrases: [['What’s up?', '¿Qué tal?'], ['I’m just hanging out.', 'Solo estoy pasando el rato.'], ['That sounds awesome.', 'Eso suena genial.']] },
] as const;

/**
 * The same visual-dictionary topics and artwork used by the web platform.
 * Coordinates point at the object in the official image (not at decorative
 * labels), so this remains a genuine touch activity on a phone.
 */
type VisualPoint = { id: string; x: number; y: number; labels: Record<TargetLanguage, string> };
type VisualScene = { id: string; icon: string; image: string; title: Record<TargetLanguage, string>; points: VisualPoint[] };
const asset = (name: string) => `https://andergo.online/images/infographics/topics/${name}.png`;
const label = (id: string, x: number, y: number, english: string, french: string, spanish: string, italian: string, portuguese: string, german: string): VisualPoint => ({ id, x, y, labels: { english, french, spanish, italian, portuguese, german } });
const title = (english: string, french: string, spanish: string, italian: string, portuguese: string, german: string): Record<TargetLanguage, string> => ({ english, french, spanish, italian, portuguese, german });
const VISUAL_SCENES: VisualScene[] = [
  { id: 'body-front', icon: '🧑', image: asset('body-front'), title: title('Human body', 'Le corps humain', 'El cuerpo humano', 'Il corpo umano', 'O corpo humano', 'Der menschliche Körper'), points: [
    label('head',50,9.5,'Head','Tête','Cabeza','Testa','Cabeça','Kopf'), label('shoulder',40,24,'Shoulder','Épaule','Hombro','Spalla','Ombro','Schulter'), label('chest',50,32,'Chest','Poitrine','Pecho','Petto','Peito','Brust'), label('arm',37,40,'Arm','Bras','Brazo','Braccio','Braço','Arm'), label('hand',32,55,'Hand','Main','Mano','Mano','Mão','Hand'), label('knee',44,69,'Knee','Genou','Rodilla','Ginocchio','Joelho','Knie'), label('foot',42,95,'Foot','Pied','Pie','Piede','Pé','Fuß')
  ]},
  { id: 'car', icon: '🚗', image: asset('car'), title: title('Parts of a car', 'Les parties d’une voiture', 'Partes de un automóvil', 'Parti di un’automobile', 'Partes de um carro', 'Teile eines Autos'), points: [
    label('windshield',45,35,'Windshield','Pare-brise','Parabrisas','Parabrezza','Para-brisa','Windschutzscheibe'), label('door',75,50,'Door','Porte','Puerta','Porta','Porta','Tür'), label('mirror',71,38,'Mirror','Rétroviseur','Espejo','Specchietto','Espelho','Spiegel'), label('hood',30,48,'Hood','Capot','Capó','Cofano','Capô','Motorhaube'), label('wheel',58,65,'Wheel','Roue','Rueda','Ruota','Roda','Rad'), label('headlight',42,53,'Headlight','Phare','Faro','Faro','Farol','Scheinwerfer'), label('trunk',95,40,'Trunk','Coffre','Maletero','Bagagliaio','Porta-malas','Kofferraum')
  ]},
  { id: 'house', icon: '🏠', image: asset('house'), title: title('Parts of a house', 'Les parties d’une maison', 'Partes de una casa', 'Parti di una casa', 'Partes de uma casa', 'Teile eines Hauses'), points: [
    label('roof',55,20,'Roof','Toit','Techo','Tetto','Telhado','Dach'), label('chimney',27,16,'Chimney','Cheminée','Chimenea','Camino','Chaminé','Schornstein'), label('window',28,34,'Window','Fenêtre','Ventana','Finestra','Janela','Fenster'), label('door',51,57,'Door','Porte','Puerta','Porta','Porta','Tür'), label('wall',85,58,'Wall','Mur','Pared','Muro','Parede','Wand'), label('porch',45,68,'Porch','Porche','Porche','Portico','Varanda','Veranda'), label('garden',15,75,'Garden','Jardin','Jardín','Giardino','Jardim','Garten')
  ]},
  { id: 'tree', icon: '🌳', image: asset('tree'), title: title('Parts of a tree', 'Les parties d’un arbre', 'Partes de un árbol', 'Parti di un albero', 'Partes de uma árvore', 'Teile eines Baums'), points: [
    label('crown',50,24,'Crown','Cime','Copa','Chioma','Copa','Baumkrone'), label('branch',39,42,'Branch','Branche','Rama','Ramo','Galho','Ast'), label('leaf',28,20,'Leaf','Feuille','Hoja','Foglia','Folha','Blatt'), label('trunk',51,67,'Trunk','Tronc','Tronco','Tronco','Tronco','Stamm'), label('bark',51,70,'Bark','Écorce','Corteza','Corteccia','Casca','Rinde'), label('root',51,92,'Root','Racine','Raíz','Radice','Raiz','Wurzel'), label('fruit',25,43,'Fruit','Fruit','Fruta','Frutto','Fruta','Frucht')
  ]},
  { id: 'weather', icon: '⛅', image: asset('weather-v2'), title: title('The weather', 'La météo', 'El tiempo', 'Il tempo', 'O tempo', 'Das Wetter'), points: [
    label('sun',18,18,'Sun','Soleil','Sol','Sole','Sol','Sonne'), label('cloud',50,19,'Cloud','Nuage','Nube','Nuvola','Nuvem','Wolke'), label('rain',82,26,'Rain','Pluie','Lluvia','Pioggia','Chuva','Regen'), label('lightning',16,50,'Lightning','Éclair','Relámpago','Fulmine','Relâmpago','Blitz'), label('wind',48,50,'Wind','Vent','Viento','Vento','Vento','Wind'), label('snow',88,52,'Snow','Neige','Nieve','Neve','Neve','Schnee'), label('rainbow',18,80,'Rainbow','Arc-en-ciel','Arcoíris','Arcobaleno','Arco-íris','Regenbogen')
  ]},
  { id: 'face', icon: '😊', image: asset('face'), title: title('Parts of the face', 'Les parties du visage', 'Partes de la cara', 'Parti del viso', 'Partes do rosto', 'Teile des Gesichts'), points: [
    label('hair',50,16,'Hair','Cheveux','Cabello','Capelli','Cabelo','Haare'), label('forehead',50,34,'Forehead','Front','Frente','Fronte','Testa','Stirn'), label('eye',40,45,'Eye','Œil','Ojo','Occhio','Olho','Auge'), label('ear',26,50,'Ear','Oreille','Oreja','Orecchio','Orelha','Ohr'), label('nose',50,57,'Nose','Nez','Nariz','Naso','Nariz','Nase'), label('mouth',50,69,'Mouth','Bouche','Boca','Bocca','Boca','Mund'), label('chin',50,81,'Chin','Menton','Mentón','Mento','Queixo','Kinn')
  ]},
  { id: 'classroom', icon: '🏫', image: asset('classroom'), title: title('The classroom', 'La salle de classe', 'El aula', 'L’aula', 'A sala de aula', 'Das Klassenzimmer'), points: [
    label('board',60,37,'Board','Tableau','Pizarra','Lavagna','Quadro','Tafel'), label('clock',59.3,17.8,'Clock','Horloge','Reloj','Orologio','Relógio','Uhr'), label('desk',37,70,'Desk','Bureau','Escritorio','Banco','Carteira','Tisch'), label('chair',73.8,69.1,'Chair','Chaise','Silla','Sedia','Cadeira','Stuhl'), label('book',36.8,59.3,'Book','Livre','Libro','Libro','Livro','Buch'), label('window',14.5,34.3,'Window','Fenêtre','Ventana','Finestra','Janela','Fenster'), label('backpack',84.1,81.6,'Backpack','Sac à dos','Mochila','Zaino','Mochila','Rucksack')
  ]},
  { id: 'bicycle', icon: '🚲', image: asset('bicycle'), title: title('Parts of a bicycle', 'Les parties d’un vélo', 'Partes de una bicicleta', 'Parti di una bicicletta', 'Partes de uma bicicleta', 'Teile eines Fahrrads'), points: [
    label('handlebars',72,23,'Handlebars','Guidon','Manubrio','Manubrio','Guidão','Lenker'), label('seat',33,28,'Seat','Selle','Asiento','Sella','Assento','Sitz'), label('frame',53,47,'Frame','Cadre','Cuadro','Telaio','Quadro','Rahmen'), label('pedal',53,59,'Pedal','Pédale','Pedal','Pedale','Pedal','Pedal'), label('chain',31,60,'Chain','Chaîne','Cadena','Catena','Corrente','Kette'), label('wheel',18,62,'Wheel','Roue','Rueda','Ruota','Roda','Rad'), label('tire',82,77,'Tire','Pneu','Neumático','Pneumatico','Pneu','Reifen')
  ]},
  { id: 'clothing', icon: '👕', image: asset('clothing'), title: title('Clothing', 'Les vêtements', 'La ropa', 'L’abbigliamento', 'Roupas', 'Kleidung'), points: [
    label('shirt',21.4,23.3,'Shirt','Chemise','Camisa','Camicia','Camisa','Hemd'), label('trousers',50.8,33.4,'Trousers','Pantalon','Pantalones','Pantaloni','Calças','Hose'), label('dress',79.7,28.2,'Dress','Robe','Vestido','Vestito','Vestido','Kleid'), label('jacket',21,57.8,'Jacket','Veste','Chaqueta','Giacca','Jaqueta','Jacke'), label('shoes',82.5,63.5,'Shoes','Chaussures','Zapatos','Scarpe','Sapatos','Schuhe'), label('hat',13.4,85.8,'Hat','Chapeau','Sombrero','Cappello','Chapéu','Hut'), label('socks',32.4,85.2,'Socks','Chaussettes','Calcetines','Calzini','Meias','Socken')
  ]},
  { id: 'food', icon: '🥖', image: asset('food'), title: title('Basic foods', 'Les aliments de base', 'Alimentos básicos', 'Alimenti di base', 'Alimentos básicos', 'Grundnahrungsmittel'), points: [
    label('bread',20.7,17.9,'Bread','Pain','Pan','Pane','Pão','Brot'), label('milk',50,17.1,'Milk','Lait','Leche','Latte','Leite','Milch'), label('cheese',79.5,17.6,'Cheese','Fromage','Queso','Formaggio','Queijo','Käse'), label('rice',19.8,44,'Rice','Riz','Arroz','Riso','Arroz','Reis'), label('egg',49.7,44.6,'Egg','Œuf','Huevo','Uovo','Ovo','Ei'), label('chicken',79.4,45.3,'Chicken','Poulet','Pollo','Pollo','Frango','Huhn'), label('fish',20.1,67.5,'Fish','Poisson','Pescado','Pesce','Peixe','Fisch')
  ]},
];

/** Native entry points for content already available through the ANDERGO curriculum API. */
export default function PlatformScreen() {
  const { section, title } = useLocalSearchParams<{ section?: string; title?: string }>();
  const resolvedSection = section && VALID_SECTIONS.has(section) ? section : 'games';
  const { targetLanguage } = useGame();
  const { session } = useAuth();
  const [activity, setActivity] = useState<LessonActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setSelectedAnswer(null);
    void loadCurriculum(targetLanguage, 'A1', session?.access_token).then(async (items) => {
      if (!active) return;
      const source = items.find((item) => item.skill === 'vocabulary') ?? items[0];
      const result = source ? await loadLessonActivity(source.slug, { lessonId: source.id, language: targetLanguage, level: 'A1' }, session?.access_token) : null;
      if (active) setActivity(result);
    }).catch(() => { if (active) setActivity(null); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session?.access_token, targetLanguage]);

  const pairs = useMemo(() => activity?.pairs.filter((pair) => pair.source && pair.target).slice(0, 12) ?? [], [activity]);
  const quiz = useMemo(() => {
    const answer = pairs[0]; if (!answer) return null;
    const options = [answer.target, ...pairs.filter((pair) => pair.target !== answer.target).slice(0, 3).map((pair) => pair.target)].sort((a, b) => a.localeCompare(b));
    return { ...answer, options };
  }, [pairs]);
  const heading = title || ({ games: 'Juegos', infographics: 'Infografías', 'useful-expressions': 'Useful expressions', 'technical-english': 'Inglés técnico' } as const)[resolvedSection];
  const speak = (text: string) => Speech.speak(text, { language: LOCALES[targetLanguage], rate: .9 });

  return <SafeAreaView style={s.safe} edges={['top']}><View style={s.header}><Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={s.back}><ThemedText style={s.backText}>‹</ThemedText></Pressable><View style={s.headerCopy}><ThemedText style={s.brand}>ANDERGO</ThemedText><ThemedText numberOfLines={1} style={s.title}>{heading}</ThemedText></View></View>
    {loading ? <Loading /> : <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {resolvedSection === 'games' && <GameView quiz={quiz} selected={selectedAnswer} onAnswer={setSelectedAnswer} />}
      {resolvedSection === 'infographics' && <InfographicView language={targetLanguage} speak={speak} />}
      {resolvedSection === 'useful-expressions' && <ExpressionsView pairs={pairs} speak={speak} />}
      {resolvedSection === 'technical-english' && <TechnicalView pairs={pairs} speak={speak} />}
    </ScrollView>}
  </SafeAreaView>;
}

function Loading() { return <View style={s.loading}><ActivityIndicator color="#2563EB" size="large" /><ThemedText style={s.loadingText}>Preparando contenido de ANDERGO…</ThemedText></View>; }
function Empty() { return <View style={s.empty}><ThemedText style={s.emptyTitle}>Aún estamos preparando este contenido</ThemedText><ThemedText style={s.emptyCopy}>Elige otro idioma o vuelve a intentar cuando tengas conexión.</ThemedText></View>; }
function GameView({ quiz, selected, onAnswer }: { quiz: { source: string; target: string; options: string[] } | null; selected: string | null; onAnswer: (value: string) => void }) {
  if (!quiz) return <Empty />; const correct = selected === quiz.target;
  return <><View style={[s.hero, s.gameHero]}><ThemedText style={s.kicker}>JUEGO RÁPIDO · CONTENIDO DE TU RUTA</ThemedText><ThemedText style={s.heroTitle}>¿Qué significa?</ThemedText><ThemedText style={s.word}>{quiz.source}</ThemedText><ThemedText style={s.heroCopy}>Elige la respuesta correcta y practica con las palabras reales de ANDERGO.</ThemedText></View><View style={s.quizCard}>{quiz.options.map((option) => <Pressable key={option} onPress={() => onAnswer(option)} disabled={Boolean(selected)} style={[s.answer, selected === option && (option === quiz.target ? s.answerCorrect : s.answerWrong)]}><ThemedText style={[s.answerText, selected === option && s.answerTextSelected]}>{option}</ThemedText>{selected === option && <ThemedText style={s.answerMark}>{option === quiz.target ? '✓' : '×'}</ThemedText>}</Pressable>)}{selected && <View style={s.result}><ThemedText style={s.resultTitle}>{correct ? '¡Muy bien!' : 'Casi. Sigue practicando.'}</ThemedText><ThemedText style={s.resultCopy}>{quiz.source} = {quiz.target}</ThemedText></View>}</View></>;
}
function InfographicView({ language, speak }: { language: TargetLanguage; speak: (text: string) => void }) {
  const [sceneId, setSceneId] = useState(VISUAL_SCENES[0].id);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const scene = VISUAL_SCENES.find((item) => item.id === sceneId) ?? VISUAL_SCENES[0];
  const used = new Set(Object.values(placed));
  const chooseScene = (id: string) => { setSceneId(id); setSelectedWord(null); setPlaced({}); setFeedback(''); };
  const place = (point: VisualPoint) => {
    if (!selectedWord || placed[point.id]) return;
    if (point.id === selectedWord) { setPlaced((current) => ({ ...current, [point.id]: selectedWord })); setFeedback('✓ ¡Correcto!'); }
    else setFeedback('Inténtalo otra vez: toca el punto que corresponde a la palabra seleccionada.');
  };
  return <><View style={s.intro}><ThemedText style={s.kicker}>DICCIONARIO VISUAL · {language.toUpperCase()}</ThemedText><ThemedText style={s.screenTitle}>Infografías interactivas</ThemedText><ThemedText style={s.introCopy}>Elige una palabra, tócala en la imagen y escucha su pronunciación.</ThemedText></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scenePicker}>{VISUAL_SCENES.map((item) => <Pressable key={item.id} onPress={() => chooseScene(item.id)} style={[s.sceneChip, scene.id === item.id && s.sceneChipActive]}><ThemedText style={s.sceneChipIcon}>{item.icon}</ThemedText><ThemedText numberOfLines={1} style={[s.sceneChipText, scene.id === item.id && s.sceneChipTextActive]}>{item.title[language]}</ThemedText></Pressable>)}</ScrollView>
    <View style={s.visualCard}><View style={s.visualHead}><View><ThemedText style={s.visualKicker}>COLOCA CADA NOMBRE</ThemedText><ThemedText style={s.visualTitle}>{scene.title[language]}</ThemedText></View><ThemedText style={s.visualScore}>{Object.keys(placed).length}/{scene.points.length}</ThemedText></View><View style={s.artFrame}><ImageBackground source={{ uri: scene.image }} resizeMode="contain" style={s.artwork} imageStyle={s.artworkImage}>{scene.points.map((point, index) => <Pressable key={point.id} accessibilityLabel={`Punto ${index + 1}`} onPress={() => place(point)} style={[s.hotspot, { left: `${point.x}%`, top: `${point.y}%` }, placed[point.id] && s.hotspotDone]}><ThemedText style={s.hotspotText}>{placed[point.id] ? '✓' : index + 1}</ThemedText></Pressable>)}</ImageBackground></View></View>
    <View style={s.wordBank}><ThemedText style={s.wordBankLabel}>BANCO DE PALABRAS</ThemedText><View style={s.wordGrid}>{scene.points.map((point) => <Pressable key={point.id} disabled={used.has(point.id)} onPress={() => { setSelectedWord(point.id); setFeedback(''); speak(point.labels[language]); }} style={[s.wordChip, selectedWord === point.id && s.wordChipSelected, used.has(point.id) && s.wordChipUsed]}><ThemedText style={[s.wordChipText, selectedWord === point.id && s.wordChipTextSelected]}>{point.labels[language]}  🔊</ThemedText></Pressable>)}</View>{feedback ? <ThemedText style={[s.infoFeedback, feedback.startsWith('✓') && s.infoFeedbackGood]}>{feedback}</ThemedText> : null}{Object.keys(placed).length === scene.points.length ? <Pressable onPress={() => { setPlaced({}); setSelectedWord(null); setFeedback(''); }} style={s.resetInfo}><ThemedText style={s.resetInfoText}>Practicar de nuevo</ThemedText></Pressable> : null}</View></>;
}
function ExpressionsView({ pairs, speak }: { pairs: LessonActivity['pairs']; speak: (text: string) => void }) { if (!pairs.length) return <Empty />; return <><View style={s.intro}><ThemedText style={s.kicker}>EN CONTEXTO · TU RUTA ACTUAL</ThemedText><ThemedText style={s.screenTitle}>Expresiones útiles</ThemedText><ThemedText style={s.introCopy}>Toca cada frase para escucharla. Las expresiones se obtienen de las lecciones existentes, sin duplicar un curso.</ThemedText></View><View style={s.expressionList}>{pairs.map((pair, index) => <View key={pair.source + index} style={s.expression}><ThemedText style={s.expressionNumber}>{index + 1}</ThemedText><View style={s.expressionCopy}><Pressable onPress={() => speak(pair.source)}><ThemedText style={s.expressionSource}>{pair.source}  🔊</ThemedText></Pressable><ThemedText style={s.expressionTarget}>{pair.target}</ThemedText>{pair.example && <ThemedText style={s.expressionExample}>{pair.example}</ThemedText>}</View></View>)}</View></>; }
function TechnicalView({ speak }: { pairs: LessonActivity['pairs']; speak: (text: string) => void }) {
  const [selectedTitle, setSelectedTitle] = useState<string>(TECHNICAL_TOPICS[0].title);
  const selected = TECHNICAL_TOPICS.find((topic) => topic.title === selectedTitle) ?? TECHNICAL_TOPICS[0];
  return <><View style={[s.hero, s.techHero]}><ThemedText style={s.kicker}>ENGLISH FOR WORK & LIFE</ThemedText><ThemedText style={s.heroTitle}>Inglés técnico</ThemedText><ThemedText style={s.heroCopy}>Elige un área y practica frases reales de la biblioteca técnica de ANDERGO.</ThemedText></View><View style={s.topicGrid}>{TECHNICAL_TOPICS.map((topic) => <Pressable key={topic.title} onPress={() => setSelectedTitle(topic.title)} style={[s.topic, topic.title === selected.title && s.topicActive]}><ThemedText style={s.topicIcon}>{topic.icon}</ThemedText><ThemedText style={s.topicTitle}>{topic.title}</ThemedText><ThemedText style={s.topicCopy}>{topic.copy}</ThemedText></Pressable>)}</View><View style={s.practice}><ThemedText style={s.practiceLabel}>{selected.title.toUpperCase()} · 3 FRASES DE INICIO</ThemedText>{selected.phrases.map(([english, spanish]) => <Pressable key={english} onPress={() => speak(english)} style={s.practiceRow}><ThemedText style={s.practiceSource}>{english}  🔊</ThemedText><ThemedText style={s.practiceTarget}>{spanish}</ThemedText></Pressable>)}</View></>;
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F6F8FD'},header:{minHeight:64,paddingHorizontal:16,flexDirection:'row',alignItems:'center',gap:11,backgroundColor:'#FFF',borderBottomWidth:1,borderColor:'#E2E8F0'},back:{height:40,width:40,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:'#EEF4FF'},backText:{fontSize:30,lineHeight:33,color:'#2563EB'},headerCopy:{flex:1},brand:{fontSize:9,letterSpacing:1.1,fontWeight:'900',color:'#2563EB'},title:{fontSize:16,fontWeight:'900',color:'#172554',marginTop:1},content:{padding:18,paddingBottom:36,gap:16},loading:{flex:1,alignItems:'center',justifyContent:'center',gap:12},loadingText:{color:'#64748B',fontSize:13,fontWeight:'700'},hero:{borderRadius:24,padding:22,overflow:'hidden'},gameHero:{backgroundColor:'#4338CA'},techHero:{backgroundColor:'#075985'},kicker:{color:'#BFDBFE',fontSize:10,fontWeight:'900',letterSpacing:.7},heroTitle:{color:'#FFF',fontSize:27,lineHeight:32,fontWeight:'900',marginTop:11},word:{color:'#FFF',fontSize:25,lineHeight:30,fontWeight:'900',marginTop:5},heroCopy:{color:'#DBEAFE',fontSize:13,lineHeight:19,marginTop:9},quizCard:{padding:14,borderRadius:22,backgroundColor:'#FFF',borderWidth:1,borderColor:'#DCE6F7',gap:9},answer:{minHeight:53,paddingHorizontal:15,borderRadius:15,borderWidth:1,borderColor:'#D8E2F1',flexDirection:'row',alignItems:'center',justifyContent:'space-between'},answerCorrect:{borderColor:'#22C55E',backgroundColor:'#F0FDF4'},answerWrong:{borderColor:'#FB7185',backgroundColor:'#FFF1F2'},answerText:{color:'#243B65',fontSize:14,fontWeight:'800'},answerTextSelected:{color:'#172554'},answerMark:{fontSize:20,fontWeight:'900',color:'#2563EB'},result:{padding:13,borderRadius:14,backgroundColor:'#EFF6FF',marginTop:3},resultTitle:{color:'#1D4ED8',fontSize:15,fontWeight:'900'},resultCopy:{color:'#475569',fontSize:13,marginTop:3},intro:{padding:4},screenTitle:{color:'#172554',fontSize:26,lineHeight:31,fontWeight:'900',marginTop:7},introCopy:{color:'#64748B',fontSize:13,lineHeight:19,marginTop:7},scenePicker:{gap:8,paddingRight:18},sceneChip:{width:122,padding:10,borderRadius:16,borderWidth:1,borderColor:'#DCE6F7',backgroundColor:'#FFF'},sceneChipActive:{borderColor:'#2563EB',backgroundColor:'#E8F0FF'},sceneChipIcon:{fontSize:19},sceneChipText:{color:'#475569',fontSize:10,lineHeight:14,fontWeight:'900',marginTop:4},sceneChipTextActive:{color:'#1D4ED8'},visualCard:{padding:13,borderRadius:22,backgroundColor:'#FFF',borderWidth:1,borderColor:'#DCE6F7',gap:11},visualHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},visualKicker:{fontSize:9,fontWeight:'900',letterSpacing:.7,color:'#2563EB'},visualTitle:{color:'#172554',fontSize:18,lineHeight:22,fontWeight:'900',marginTop:3,maxWidth:250},visualScore:{color:'#2563EB',fontSize:15,fontWeight:'900'},artFrame:{aspectRatio:1,borderRadius:18,overflow:'hidden',backgroundColor:'#EFF6FF'},artwork:{flex:1},artworkImage:{borderRadius:18},hotspot:{position:'absolute',width:29,height:29,marginLeft:-14.5,marginTop:-14.5,borderRadius:15,alignItems:'center',justifyContent:'center',backgroundColor:'#1D4ED8',borderWidth:2,borderColor:'#FFF',shadowColor:'#172554',shadowOpacity:.23,shadowRadius:4,shadowOffset:{width:0,height:2},elevation:4},hotspotDone:{backgroundColor:'#16A34A'},hotspotText:{fontSize:11,fontWeight:'900',color:'#FFF'},wordBank:{padding:14,borderRadius:20,backgroundColor:'#FFF',borderWidth:1,borderColor:'#DCE6F7'},wordBankLabel:{fontSize:10,fontWeight:'900',letterSpacing:.7,color:'#2563EB',marginBottom:10},wordGrid:{flexDirection:'row',flexWrap:'wrap',gap:8},wordChip:{paddingHorizontal:10,paddingVertical:8,borderRadius:13,borderWidth:1,borderColor:'#D8E2F1',backgroundColor:'#FFF'},wordChipSelected:{backgroundColor:'#173F91',borderColor:'#173F91'},wordChipUsed:{opacity:.48,backgroundColor:'#F0FDF4',borderColor:'#86EFAC'},wordChipText:{fontSize:12,fontWeight:'800',color:'#243B65'},wordChipTextSelected:{color:'#FFF'},infoFeedback:{marginTop:12,padding:10,borderRadius:12,backgroundColor:'#FFF7ED',color:'#9A3412',fontSize:12,lineHeight:17,fontWeight:'800'},infoFeedbackGood:{backgroundColor:'#F0FDF4',color:'#15803D'},resetInfo:{alignSelf:'flex-start',marginTop:12,paddingHorizontal:12,paddingVertical:9,borderRadius:12,backgroundColor:'#E8F0FF'},resetInfoText:{color:'#1D4ED8',fontSize:12,fontWeight:'900'},expressionList:{gap:9},expression:{padding:14,borderRadius:18,backgroundColor:'#FFF',borderWidth:1,borderColor:'#DCE6F7',flexDirection:'row',gap:11},expressionNumber:{color:'#2563EB',fontSize:12,fontWeight:'900',minWidth:18},expressionCopy:{flex:1},expressionSource:{color:'#172554',fontSize:15,lineHeight:20,fontWeight:'900'},expressionTarget:{color:'#2563EB',fontSize:13,lineHeight:18,fontWeight:'800',marginTop:3},expressionExample:{color:'#64748B',fontSize:11,lineHeight:16,marginTop:5},topicGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},topic:{width:'48.4%',minHeight:130,padding:14,borderRadius:19,backgroundColor:'#FFF',borderWidth:1,borderColor:'#DCE6F7'},topicActive:{backgroundColor:'#E8F0FF',borderColor:'#2563EB'},topicIcon:{fontSize:22},topicTitle:{color:'#172554',fontSize:14,lineHeight:18,fontWeight:'900',marginTop:9},topicCopy:{color:'#64748B',fontSize:11,lineHeight:15,marginTop:4},practice:{padding:15,borderRadius:20,backgroundColor:'#FFF',borderWidth:1,borderColor:'#DCE6F7'},practiceLabel:{color:'#2563EB',fontSize:10,fontWeight:'900',letterSpacing:.6,marginBottom:8},practiceRow:{paddingVertical:10,borderTopWidth:1,borderColor:'#E9EFF8'},practiceSource:{color:'#172554',fontSize:14,fontWeight:'900'},practiceTarget:{color:'#2563EB',fontSize:12,fontWeight:'700',marginTop:3},empty:{margin:18,padding:22,borderRadius:20,backgroundColor:'#FFF',borderWidth:1,borderColor:'#DCE6F7'},emptyTitle:{color:'#172554',fontSize:17,fontWeight:'900'},emptyCopy:{color:'#64748B',fontSize:13,lineHeight:19,marginTop:7},
});
