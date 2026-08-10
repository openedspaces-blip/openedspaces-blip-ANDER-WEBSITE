import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGame } from '@/context/game';

const QUESTIONS = [
  { prompt: 'Selecciona el saludo correcto:', clue: 'Buenos días', answers: ['Good morning', 'Good night', 'Goodbye', 'Thank you'], correct: 0 },
  { prompt: 'Completa la oración:', clue: 'I ___ Andrea.', answers: ['is', 'am', 'are', 'be'], correct: 1 },
  { prompt: '¿Qué significa “Nice to meet you”?', clue: 'Elige la traducción', answers: ['¿Cómo estás?', 'Hasta mañana', 'Mucho gusto', 'Buenos días'], correct: 2 },
  { prompt: 'Selecciona la respuesta correcta:', clue: 'How are you?', answers: ['I am fine, thanks.', 'My name are Luis.', 'Good night morning.', 'I is happy.'], correct: 0 },
  { prompt: 'Orden lógico para presentarte:', clue: 'Elige la frase completa', answers: ['Hello, my name is Ana.', 'Goodbye, I fine.', 'Name my Ana is.', 'I hello are Ana.'], correct: 0 },
] as const;

export default function LessonScreen() {
  const game = useGame();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = QUESTIONS[index];

  const choose = (answer: number) => {
    if (selected !== null) return;
    setSelected(answer);
    if (answer === question.correct) {
      setCorrect((value) => value + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      game.loseHeart();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const continueLesson = () => {
    const finalCorrect = correct + (selected === question.correct ? 0 : 0);
    if (index === QUESTIONS.length - 1) {
      game.finishLesson(finalCorrect, QUESTIONS.length);
      setFinished(true);
    } else {
      setIndex((value) => value + 1);
      setSelected(null);
    }
  };

  if (finished) {
    const earned = correct * 10 + (correct === QUESTIONS.length ? 20 : 0);
    return <ThemedView style={styles.screen}><SafeAreaView style={styles.result}>
      <ThemedText style={styles.trophy}>🏆</ThemedText>
      <ThemedText style={styles.resultKicker}>MISIÓN COMPLETADA</ThemedText>
      <ThemedText style={styles.resultTitle}>¡Excelente trabajo!</ThemedText>
      <ThemedText style={styles.resultBody}>Superaste {correct} de {QUESTIONS.length} desafíos y desbloqueaste nuevas recompensas.</ThemedText>
      <View style={styles.rewards}>
        <View style={styles.reward}><ThemedText style={styles.rewardIcon}>⚡</ThemedText><ThemedText style={styles.rewardValue}>+{earned}</ThemedText><ThemedText style={styles.rewardLabel}>XP</ThemedText></View>
        <View style={styles.reward}><ThemedText style={styles.rewardIcon}>🪙</ThemedText><ThemedText style={styles.rewardValue}>+{correct * 2}</ThemedText><ThemedText style={styles.rewardLabel}>MONEDAS</ThemedText></View>
        <View style={styles.reward}><ThemedText style={styles.rewardIcon}>🎯</ThemedText><ThemedText style={styles.rewardValue}>{Math.round(correct / QUESTIONS.length * 100)}%</ThemedText><ThemedText style={styles.rewardLabel}>PRECISIÓN</ThemedText></View>
      </View>
      <Pressable onPress={() => router.replace('/')} style={styles.continue}><ThemedText style={styles.continueText}>Volver a mi aventura</ThemedText></Pressable>
    </SafeAreaView></ThemedView>;
  }

  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safe}>
    <View style={styles.topbar}>
      <Pressable onPress={() => router.back()} hitSlop={12}><ThemedText style={styles.close}>×</ThemedText></Pressable>
      <View style={styles.progress}><View style={[styles.progressFill, { width: `${((index + 1) / QUESTIONS.length) * 100}%` }]} /></View>
      <ThemedText style={styles.hearts}>❤️ {game.hearts}</ThemedText>
    </View>
    <View style={styles.content}>
      <View><ThemedText style={styles.step}>DESAFÍO {index + 1} DE {QUESTIONS.length}</ThemedText><ThemedText style={styles.prompt}>{question.prompt}</ThemedText></View>
      <View style={styles.clue}><ThemedText style={styles.clueIcon}>💬</ThemedText><ThemedText style={styles.clueText}>{question.clue}</ThemedText></View>
      <View style={styles.answers}>{question.answers.map((answer, answerIndex) => {
        const isSelected = selected === answerIndex;
        const isCorrect = selected !== null && answerIndex === question.correct;
        const isWrong = isSelected && answerIndex !== question.correct;
        return <Pressable key={answer} onPress={() => choose(answerIndex)} style={[styles.answer, isCorrect && styles.correct, isWrong && styles.wrong]}>
          <View style={[styles.answerKey, isCorrect && styles.correctKey, isWrong && styles.wrongKey]}><ThemedText style={styles.answerKeyText}>{String.fromCharCode(65 + answerIndex)}</ThemedText></View>
          <ThemedText style={styles.answerText}>{answer}</ThemedText>
          {isCorrect && <ThemedText style={styles.mark}>✓</ThemedText>}{isWrong && <ThemedText style={styles.wrongMark}>×</ThemedText>}
        </Pressable>;
      })}</View>
    </View>
    {selected !== null && <View style={[styles.feedback, selected === question.correct ? styles.feedbackGood : styles.feedbackBad]}>
      <View style={styles.feedbackCopy}><ThemedText style={styles.feedbackTitle}>{selected === question.correct ? '¡Correcto! +10 XP' : 'Casi. Revisa la respuesta correcta.'}</ThemedText><ThemedText style={styles.feedbackBody}>{question.answers[question.correct]}</ThemedText></View>
      <Pressable onPress={continueLesson} style={styles.feedbackButton}><ThemedText style={styles.feedbackButtonText}>{index === QUESTIONS.length - 1 ? 'Ver resultados' : 'Continuar'}</ThemedText></Pressable>
    </View>}
  </SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({
  screen:{flex:1},safe:{flex:1},topbar:{height:66,paddingHorizontal:18,flexDirection:'row',alignItems:'center',gap:14},close:{fontSize:32,color:'#64748B'},progress:{flex:1,height:11,borderRadius:6,backgroundColor:'#E2E8F0',overflow:'hidden'},progressFill:{height:'100%',backgroundColor:'#39D5F6'},hearts:{fontSize:14,fontWeight:'900'},content:{flex:1,padding:22,gap:24,width:'100%',maxWidth:680,alignSelf:'center'},step:{fontSize:11,fontWeight:'900',letterSpacing:1.1,color:'#2563EB',marginBottom:8},prompt:{fontSize:29,lineHeight:35,fontWeight:'900'},clue:{minHeight:112,borderRadius:25,padding:20,flexDirection:'row',alignItems:'center',gap:15,backgroundColor:'#173F91'},clueIcon:{fontSize:33},clueText:{flex:1,fontSize:24,fontWeight:'900',color:'#FFFFFF'},answers:{gap:11},answer:{minHeight:64,borderRadius:19,padding:11,flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#FFFFFF',borderWidth:2,borderColor:'#E2E8F0'},answerKey:{width:38,height:38,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:'#F1F5F9'},answerKeyText:{fontSize:14,fontWeight:'900',color:'#475569'},answerText:{flex:1,fontSize:16,fontWeight:'800'},correct:{borderColor:'#10B981',backgroundColor:'#ECFDF5'},wrong:{borderColor:'#F43F5E',backgroundColor:'#FFF1F2'},correctKey:{backgroundColor:'#A7F3D0'},wrongKey:{backgroundColor:'#FECDD3'},mark:{fontSize:24,color:'#059669'},wrongMark:{fontSize:27,color:'#E11D48'},feedback:{padding:18,paddingBottom:28,gap:13,borderTopWidth:1},feedbackGood:{backgroundColor:'#D1FAE5',borderColor:'#6EE7B7'},feedbackBad:{backgroundColor:'#FFE4E6',borderColor:'#FDA4AF'},feedbackCopy:{maxWidth:680,width:'100%',alignSelf:'center'},feedbackTitle:{fontSize:17,fontWeight:'900'},feedbackBody:{fontSize:13,color:'#475569'},feedbackButton:{minHeight:54,maxWidth:680,width:'100%',alignSelf:'center',alignItems:'center',justifyContent:'center',borderRadius:17,backgroundColor:'#173F91'},feedbackButtonText:{fontSize:16,fontWeight:'900',color:'#FFFFFF'},
  result:{flex:1,padding:25,alignItems:'center',justifyContent:'center',gap:15},trophy:{fontSize:78},resultKicker:{fontSize:11,fontWeight:'900',letterSpacing:1.4,color:'#2563EB'},resultTitle:{fontSize:33,fontWeight:'900',textAlign:'center'},resultBody:{fontSize:16,lineHeight:23,color:'#64748B',textAlign:'center',maxWidth:440},rewards:{flexDirection:'row',gap:10,marginVertical:16},reward:{width:100,minHeight:116,borderRadius:22,alignItems:'center',justifyContent:'center',backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E2E8F0'},rewardIcon:{fontSize:25},rewardValue:{fontSize:21,fontWeight:'900'},rewardLabel:{fontSize:9,fontWeight:'900',color:'#64748B'},continue:{minHeight:58,width:'100%',maxWidth:440,borderRadius:19,alignItems:'center',justifyContent:'center',backgroundColor:'#2563EB'},continueText:{fontSize:16,fontWeight:'900',color:'#FFFFFF'},
});
