import * as Speech from 'expo-speech';
import { Image } from 'expo-image';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth';
import { useGame } from '@/context/game';

const API = 'https://andergo.online';
type Message = { role: 'student' | 'tutor'; text: string };
const CONFIG = {
  english: { label: 'Inglés', locale: 'en-US', welcome: 'Hello! I am your ANDERGO tutor. What would you like to practice today?', suggestions: ['Help me practice English', 'Correct this sentence', 'Give me a short conversation'] },
  french: { label: 'Francés', locale: 'fr-FR', welcome: 'Bonjour ! Je suis ton tuteur ANDERGO. Que veux-tu pratiquer aujourd’hui ?', suggestions: ['Aide-moi à pratiquer le français', 'Corrige cette phrase', 'Créons un dialogue court'] },
  spanish: { label: 'Español', locale: 'es-ES', welcome: '¡Hola! Soy tu tutor ANDERGO. ¿Qué quieres practicar hoy?', suggestions: ['Ayúdame a practicar español', 'Corrige esta frase', 'Hagamos un diálogo corto'] },
  italian: { label: 'Italiano', locale: 'it-IT', welcome: 'Ciao! Sono il tuo tutor ANDERGO. Che cosa vuoi praticare oggi?', suggestions: ['Aiutami a praticare italiano', 'Correggi questa frase', 'Facciamo un dialogo breve'] },
  portuguese: { label: 'Portugués', locale: 'pt-BR', welcome: 'Olá! Sou seu tutor ANDERGO. O que você quer praticar hoje?', suggestions: ['Ajude-me a praticar português', 'Corrija esta frase', 'Vamos criar um diálogo curto'] },
  german: { label: 'Alemán', locale: 'de-DE', welcome: 'Hallo! Ich bin dein ANDERGO Tutor. Was möchtest du heute üben?', suggestions: ['Hilf mir, Deutsch zu üben', 'Korrigiere diesen Satz', 'Lass uns einen kurzen Dialog machen'] },
} as const;

function readTutorEvents(raw: string) {
  let reply = '';
  let error = '';
  for (const line of raw.split(/\r?\n/)) {
    if (!line.startsWith('data:')) continue;
    try {
      const event = JSON.parse(line.slice(5).trim()) as { delta?: string; error?: boolean; message?: string };
      if (event.delta) reply += event.delta;
      if (event.error) error = event.message || 'No se pudo conectar con el Tutor I.A.';
    } catch { /* Ignore malformed stream fragments. */ }
  }
  return { reply: reply.trim(), error };
}

export default function TutorScreen() {
  const { session } = useAuth();
  const { targetLanguage } = useGame();
  const config = CONFIG[targetLanguage];
  const [messages, setMessages] = useState<Message[]>([{ role: 'tutor', text: config.welcome }]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [requestError, setRequestError] = useState('');
  const suggestions = useMemo(() => config.suggestions, [config]);

  // Keep the opening prompt coherent when the learner changes language
  // before beginning a conversation, without discarding an active chat.
  useEffect(() => {
    setMessages((current) => current.length === 1 && current[0].role === 'tutor'
      ? [{ role: 'tutor', text: config.welcome }]
      : current);
  }, [config.welcome]);
  useEffect(() => () => { Speech.stop(); }, []);

  const speak = (text: string) => { Speech.stop(); Speech.speak(text, { language: config.locale, rate: 0.82 }); };
  const send = async (value = input) => {
    const clean = value.trim();
    if (!clean || busy) return;
    if (!session?.access_token) {
      setRequestError('Inicia sesión para usar el Tutor I.A. de ANDERGO.');
      return;
    }
    const previousHistory = messages.slice(-12).map((message) => ({ role: message.role, content: message.text }));
    setMessages((current) => [...current, { role: 'student', text: clean }]);
    setInput('');
    setBusy(true);
    setRequestError('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch(`${API}/api/ai/tutor`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          task: 'general', language: targetLanguage, nativeLanguage: 'spanish', learningMode: 'bilingual',
          skill: 'speaking', level: 'A1', contextScope: 'general', prompt: clean, history: previousHistory,
        }),
      });
      const raw = await response.text();
      if (!response.ok) {
        const body = JSON.parse(raw || '{}') as { error?: string };
        throw new Error(body.error || 'No se pudo conectar con el Tutor I.A.');
      }
      const result = readTutorEvents(raw);
      if (result.error) throw new Error(result.error);
      if (!result.reply) throw new Error('El Tutor I.A. no devolvió una respuesta. Inténtalo de nuevo.');
      setMessages((current) => [...current, { role: 'tutor', text: result.reply }]);
      speak(result.reply);
    } catch (reason) {
      const timedOut = reason instanceof Error && reason.name === 'AbortError';
      setRequestError(timedOut ? 'El Tutor tardó demasiado. Comprueba tu conexión e inténtalo de nuevo.' : reason instanceof Error ? reason.message : 'No se pudo conectar con el Tutor I.A.');
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  };

  useSpeechRecognitionEvent('start', () => { setListening(true); setVoiceError(''); });
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (event) => { const transcript = event.results[0]?.transcript ?? ''; setInput(transcript); if (event.isFinal && transcript.trim()) void send(transcript); });
  useSpeechRecognitionEvent('error', (event) => { setListening(false); setVoiceError(event.error === 'not-allowed' ? 'Activa el permiso del micrófono para hablar.' : 'No pude escuchar con claridad. Inténtalo de nuevo.'); });
  const talk = async () => {
    if (listening) { ExpoSpeechRecognitionModule.stop(); return; }
    Speech.stop();
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) { setVoiceError('Necesito permiso para usar el micrófono.'); return; }
    ExpoSpeechRecognitionModule.start({ lang: config.locale, interimResults: true, continuous: false, maxAlternatives: 1 });
  };


  return <SafeAreaView style={s.safe} edges={['top']}><KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={s.header}><Pressable onPress={() => router.back()} style={s.back}><ThemedText style={s.backText}>‹</ThemedText></Pressable><Image source={require('@/assets/images/andergo-tutor-official.png')} style={s.avatar} contentFit="cover" contentPosition="top" /><View style={s.titleCopy}><ThemedText style={s.kicker}>TUTOR I.A. OFICIAL</ThemedText><ThemedText style={s.title}>Conversación en {config.label}</ThemedText><ThemedText style={s.online}>{busy ? '● Consultando ANDERGO…' : listening ? '● Escuchando…' : '● Disponible'}</ThemedText></View></View>
    <ScrollView contentContainerStyle={s.messages}>{messages.map((message, index) => <View key={`${message.role}-${index}`} style={[s.bubble, message.role === 'student' ? s.student : s.tutor]}><ThemedText style={[s.messageText, message.role === 'student' && s.studentText]}>{message.text}</ThemedText>{message.role === 'tutor' ? <Pressable accessibilityLabel="Escuchar respuesta" onPress={() => speak(message.text)} style={s.speak}><ThemedText style={s.speakText}>🔊 Escuchar</ThemedText></Pressable> : null}</View>)}</ScrollView>
    <View style={s.suggestions}>{suggestions.map((item) => <Pressable disabled={busy} key={item} onPress={() => void send(item)} style={[s.chip, busy && s.disabled]}><ThemedText style={s.chipText}>{item}</ThemedText></Pressable>)}</View>
    {voiceError ? <ThemedText style={s.error}>{voiceError}</ThemedText> : null}{requestError ? <ThemedText style={s.error}>{requestError}</ThemedText> : null}
    <View style={s.composer}><Pressable accessibilityLabel={listening ? 'Detener micrófono' : 'Hablar con Andergo Tutor'} onPress={talk} style={[s.mic, listening && s.micActive]}><ThemedText style={s.micIcon}>{listening ? '■' : '🎙️'}</ThemedText></Pressable><TextInput editable={!busy} value={input} onChangeText={setInput} onSubmitEditing={() => void send()} placeholder={listening ? 'Estoy escuchando…' : `Escribe o habla en ${config.label.toLowerCase()}…`} style={s.input} returnKeyType="send" /><Pressable disabled={busy} onPress={() => void send()} style={[s.send, busy && s.disabled]}><ThemedText style={s.sendText}>➤</ThemedText></Pressable></View>
  </KeyboardAvoidingView></SafeAreaView>;
}

const s = StyleSheet.create({ safe:{flex:1,backgroundColor:'#F6F8FD'},loading:{flex:1,alignItems:'center',justifyContent:'center'},loadingText:{fontSize:14,fontWeight:'800',color:'#64748B'},header:{padding:14,flexDirection:'row',alignItems:'center',gap:11,borderBottomWidth:1,borderColor:'#E2E8F0',backgroundColor:'#FFF'},back:{width:42,height:42,borderRadius:21,alignItems:'center',justifyContent:'center',backgroundColor:'#F1F5F9'},backText:{fontSize:32,color:'#2563EB'},avatar:{width:54,height:54,borderRadius:18,backgroundColor:'#EAF2FF'},titleCopy:{flex:1},kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.1,color:'#2563EB'},title:{fontSize:18,fontWeight:'900',color:'#172554'},online:{fontSize:10,fontWeight:'700',color:'#059669',marginTop:2},messages:{padding:18,gap:12},bubble:{maxWidth:'86%',padding:14,borderRadius:20},tutor:{alignSelf:'flex-start',backgroundColor:'#FFF',borderWidth:1,borderColor:'#BFDBFE'},student:{alignSelf:'flex-end',backgroundColor:'#2563EB'},messageText:{fontSize:15,lineHeight:21,color:'#172554'},studentText:{color:'#FFF'},speak:{marginTop:9,alignSelf:'flex-start'},speakText:{fontSize:11,fontWeight:'900',color:'#2563EB'},suggestions:{paddingHorizontal:14,paddingVertical:8,flexDirection:'row',gap:7},chip:{flex:1,minHeight:48,padding:7,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:'#EAF2FF'},chipText:{fontSize:10,fontWeight:'800',textAlign:'center',color:'#173F91'},error:{paddingHorizontal:16,paddingVertical:7,fontSize:11,fontWeight:'700',color:'#B91C1C',backgroundColor:'#FEF2F2'},composer:{padding:12,flexDirection:'row',gap:8,borderTopWidth:1,borderColor:'#E2E8F0',backgroundColor:'#FFF'},mic:{width:50,height:50,borderRadius:17,alignItems:'center',justifyContent:'center',backgroundColor:'#DBEAFE'},micActive:{backgroundColor:'#FEE2E2',borderWidth:2,borderColor:'#EF4444'},micIcon:{fontSize:21},input:{flex:1,minHeight:50,borderRadius:17,paddingHorizontal:13,backgroundColor:'#F1F5F9',fontSize:14,color:'#172554'},send:{width:50,height:50,borderRadius:17,alignItems:'center',justifyContent:'center',backgroundColor:'#2563EB'},sendText:{fontSize:20,color:'#FFF'},disabled:{opacity:.45} });
