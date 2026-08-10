import { Image } from 'expo-image';
import { Href, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGame } from '@/context/game';

const quests = [
  { icon: '🎯', title: 'Completa una lección', reward: '+40 XP', done: false },
  { icon: '⚡', title: 'Responde 5 preguntas', reward: '+10 monedas', done: false },
  { icon: '🔥', title: 'Mantén tu racha', reward: 'Cofre diario', done: true },
];

export default function HomeScreen() {
  const game = useGame();
  const level = Math.floor(game.xp / 200) + 1;
  const levelProgress = game.xp % 200;

  const startLesson = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/lesson' as Href);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image source={require('@/assets/images/android-icon-foreground.png')} style={styles.logo} />
            <View style={styles.headerCopy}>
              <ThemedText style={styles.eyebrow}>ANDERGO QUEST</ThemedText>
              <ThemedText style={styles.greeting}>¡Hola, explorador!</ThemedText>
            </View>
            <View style={styles.resource}><ThemedText style={styles.resourceIcon}>🔥</ThemedText><ThemedText style={styles.resourceText}>{game.streak}</ThemedText></View>
          </View>

          <View style={styles.resources}>
            <View style={styles.resource}><ThemedText style={styles.resourceIcon}>❤️</ThemedText><ThemedText style={styles.resourceText}>{game.hearts}</ThemedText></View>
            <View style={styles.resource}><ThemedText style={styles.resourceIcon}>🪙</ThemedText><ThemedText style={styles.resourceText}>{game.coins}</ThemedText></View>
            <View style={styles.resource}><ThemedText style={styles.resourceIcon}>⚡</ThemedText><ThemedText style={styles.resourceText}>{game.xp} XP</ThemedText></View>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroRow}>
              <View style={styles.heroCopy}>
                <ThemedText style={styles.heroKicker}>MUNDO 1 · INGLÉS A1</ThemedText>
                <ThemedText style={styles.heroTitle}>La aventura comienza</ThemedText>
                <ThemedText style={styles.heroBody}>Supera desafíos de vocabulario y gramática para desbloquear el siguiente territorio.</ThemedText>
              </View>
              <View style={styles.levelBadge}><ThemedText style={styles.levelLabel}>NIVEL</ThemedText><ThemedText style={styles.levelValue}>{level}</ThemedText></View>
            </View>
            <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(8, levelProgress / 2)}%` }]} /></View>
            <ThemedText style={styles.progressText}>{levelProgress} / 200 XP para subir de nivel</ThemedText>
            <Pressable onPress={startLesson} style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
              <ThemedText style={styles.playIcon}>▶</ThemedText>
              <View style={styles.playCopy}><ThemedText style={styles.playTitle}>Jugar lección</ThemedText><ThemedText style={styles.playMeta}>5 desafíos · hasta 70 XP</ThemedText></View>
              <ThemedText style={styles.arrow}>›</ThemedText>
            </Pressable>
          </View>

          <View style={styles.sectionHead}><ThemedText style={styles.sectionTitle}>Misiones de hoy</ThemedText><ThemedText style={styles.sectionMeta}>{game.dailyGoal}/3</ThemedText></View>
          <View style={styles.questList}>
            {quests.map((quest, index) => {
              const done = index < game.dailyGoal;
              return <View key={quest.title} style={[styles.quest, done && styles.questDone]}>
                <View style={styles.questIcon}><ThemedText style={styles.questEmoji}>{done ? '✓' : quest.icon}</ThemedText></View>
                <View style={styles.questCopy}><ThemedText style={styles.questTitle}>{quest.title}</ThemedText><ThemedText style={styles.questReward}>{quest.reward}</ThemedText></View>
                <View style={[styles.questCheck, done && styles.questCheckDone]} />
              </View>;
            })}
          </View>

          <View style={styles.sectionHead}><ThemedText style={styles.sectionTitle}>Ruta de aprendizaje</ThemedText><ThemedText style={styles.sectionMeta}>1 de 6</ThemedText></View>
          <View style={styles.path}>
            {['Saludos', 'Presentarte', 'Verbo to be', 'La familia', 'Rutinas', 'Jefe final'].map((title, index) => (
              <Pressable key={title} disabled={index > 1} onPress={startLesson} style={[styles.pathNode, index === 0 && styles.pathCurrent, index > 1 && styles.pathLocked]}>
                <ThemedText style={styles.pathIcon}>{index === 0 ? '▶' : index === 1 ? '⭐' : index === 5 ? '🏆' : '🔒'}</ThemedText>
                <View><ThemedText style={styles.pathTitle}>{title}</ThemedText><ThemedText style={styles.pathMeta}>{index === 0 ? 'En progreso' : index === 1 ? 'Siguiente' : 'Bloqueado'}</ThemedText></View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1},safe:{flex:1},content:{padding:18,paddingBottom:120,gap:18,width:'100%',maxWidth:720,alignSelf:'center'},
  header:{flexDirection:'row',alignItems:'center',gap:10},logo:{width:48,height:48},headerCopy:{flex:1},eyebrow:{fontSize:11,fontWeight:'900',letterSpacing:1.2,color:'#2563EB'},greeting:{fontSize:21,fontWeight:'900'},
  resources:{flexDirection:'row',gap:8},resource:{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:11,height:38,borderRadius:19,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E2E8F0'},resourceIcon:{fontSize:15},resourceText:{fontSize:13,fontWeight:'900',color:'#0F172A'},
  hero:{padding:20,borderRadius:28,gap:14,backgroundColor:'#173F91'},heroRow:{flexDirection:'row',gap:12},heroCopy:{flex:1,gap:5},heroKicker:{fontSize:10,fontWeight:'900',letterSpacing:1.1,color:'#67E8F9'},heroTitle:{fontSize:27,lineHeight:32,fontWeight:'900',color:'#FFFFFF'},heroBody:{fontSize:14,lineHeight:20,color:'#DBEAFE'},levelBadge:{width:62,height:66,borderRadius:19,backgroundColor:'#FFFFFF',alignItems:'center',justifyContent:'center'},levelLabel:{fontSize:9,fontWeight:'900',color:'#2563EB'},levelValue:{fontSize:25,lineHeight:28,fontWeight:'900',color:'#173F91'},
  track:{height:9,borderRadius:5,backgroundColor:'#315AAA',overflow:'hidden'},fill:{height:'100%',borderRadius:5,backgroundColor:'#39D5F6'},progressText:{fontSize:11,color:'#BFDBFE'},playButton:{minHeight:70,borderRadius:20,paddingHorizontal:16,flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#FFFFFF'},playIcon:{width:34,height:34,borderRadius:17,textAlign:'center',lineHeight:34,color:'#FFFFFF',backgroundColor:'#2563EB'},playCopy:{flex:1},playTitle:{fontSize:17,fontWeight:'900',color:'#0F172A'},playMeta:{fontSize:11,color:'#64748B'},arrow:{fontSize:30,color:'#2563EB'},pressed:{opacity:.82,transform:[{scale:.99}]},
  sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},sectionTitle:{fontSize:21,fontWeight:'900'},sectionMeta:{fontSize:13,fontWeight:'900',color:'#2563EB'},questList:{gap:9},quest:{minHeight:76,padding:13,borderRadius:20,flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E2E8F0'},questDone:{backgroundColor:'#ECFDF5',borderColor:'#A7F3D0'},questIcon:{width:46,height:46,borderRadius:15,alignItems:'center',justifyContent:'center',backgroundColor:'#EAF2FF'},questEmoji:{fontSize:21,color:'#059669',fontWeight:'900'},questCopy:{flex:1},questTitle:{fontSize:14,fontWeight:'900'},questReward:{fontSize:11,color:'#64748B'},questCheck:{width:12,height:12,borderRadius:6,borderWidth:2,borderColor:'#CBD5E1'},questCheckDone:{backgroundColor:'#10B981',borderColor:'#10B981'},
  path:{gap:10},pathNode:{minHeight:70,borderRadius:20,padding:14,flexDirection:'row',alignItems:'center',gap:13,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E2E8F0'},pathCurrent:{borderWidth:2,borderColor:'#2563EB',backgroundColor:'#EAF2FF'},pathLocked:{opacity:.5},pathIcon:{fontSize:23,width:38,textAlign:'center'},pathTitle:{fontSize:15,fontWeight:'900'},pathMeta:{fontSize:11,color:'#64748B'},
});
