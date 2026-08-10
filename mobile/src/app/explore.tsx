import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGame } from '@/context/game';

const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function ProgressScreen() {
  const game = useGame();
  const leagueProgress = Math.min(100, (game.xp % 500) / 5);
  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View><ThemedText style={styles.eyebrow}>TU PERFIL DE AVENTURA</ThemedText><ThemedText style={styles.title}>Explorador nivel {Math.floor(game.xp / 200) + 1}</ThemedText><ThemedText style={styles.subtitle}>Cada práctica fortalece tu dominio del idioma.</ThemedText></View>
      <View style={styles.stats}>
        <View style={[styles.stat,styles.blue]}><ThemedText style={styles.statIcon}>⚡</ThemedText><ThemedText style={styles.statValue}>{game.xp}</ThemedText><ThemedText style={styles.statLabel}>XP TOTAL</ThemedText></View>
        <View style={[styles.stat,styles.orange]}><ThemedText style={styles.statIcon}>🔥</ThemedText><ThemedText style={styles.statValue}>{game.streak}</ThemedText><ThemedText style={styles.statLabel}>RACHA</ThemedText></View>
        <View style={[styles.stat,styles.green]}><ThemedText style={styles.statIcon}>✓</ThemedText><ThemedText style={styles.statValue}>{game.lessons}</ThemedText><ThemedText style={styles.statLabel}>LECCIONES</ThemedText></View>
      </View>
      <View style={styles.card}><View style={styles.cardHead}><View><ThemedText style={styles.cardTitle}>Racha semanal</ThemedText><ThemedText style={styles.cardMeta}>{game.streak} días aprendiendo</ThemedText></View><ThemedText style={styles.bigIcon}>🔥</ThemedText></View><View style={styles.week}>{WEEK.map((day,index)=><View key={`${day}-${index}`} style={styles.day}><View style={[styles.dayCircle,index<game.streak&&styles.dayDone]}><ThemedText style={index<game.streak&&styles.dayDoneText}>{index<game.streak?'✓':'·'}</ThemedText></View><ThemedText style={styles.dayLabel}>{day}</ThemedText></View>)}</View></View>
      <View style={styles.card}><View style={styles.cardHead}><View><ThemedText style={styles.cardTitle}>Liga Zafiro</ThemedText><ThemedText style={styles.cardMeta}>Compite contigo mismo esta semana</ThemedText></View><ThemedText style={styles.bigIcon}>💎</ThemedText></View><View style={styles.track}><View style={[styles.fill,{width:`${leagueProgress}%`}]} /></View><View style={styles.trackLabels}><ThemedText style={styles.trackStrong}>{game.xp % 500} XP</ThemedText><ThemedText style={styles.cardMeta}>500 XP</ThemedText></View></View>
      <View style={styles.sectionHead}><ThemedText style={styles.sectionTitle}>Insignias</ThemedText><ThemedText style={styles.sectionCount}>3 / 12</ThemedText></View>
      <View style={styles.badges}>{[
        ['🌟','Primer paso','Completa tu primera lección'],['🔥','En llamas','Alcanza una racha de 3 días'],['🎯','Buena puntería','Obtén 100% en una lección'],['🔒','Políglota','Aprende en dos idiomas'],['🔒','Imparable','Racha de 30 días'],['🔒','Maestro','Completa un nivel MCER'],
      ].map(([icon,title,meta],index)=><View key={title} style={[styles.badge,index>2&&styles.locked]}><ThemedText style={styles.badgeIcon}>{icon}</ThemedText><ThemedText style={styles.badgeTitle}>{title}</ThemedText><ThemedText style={styles.badgeMeta}>{meta}</ThemedText></View>)}</View>
      {game.hearts<5&&<Pressable onPress={game.refillHearts} style={[styles.shop,game.coins<20&&styles.locked]} disabled={game.coins<20}><View><ThemedText style={styles.shopTitle}>Recuperar 5 vidas</ThemedText><ThemedText style={styles.shopMeta}>Usa tus monedas ganadas jugando</ThemedText></View><ThemedText style={styles.shopPrice}>🪙 20</ThemedText></Pressable>}
    </ScrollView>
  </SafeAreaView></ThemedView>;
}

const styles=StyleSheet.create({screen:{flex:1},safe:{flex:1},content:{padding:20,paddingBottom:120,gap:20,width:'100%',maxWidth:720,alignSelf:'center'},eyebrow:{fontSize:11,fontWeight:'900',letterSpacing:1.2,color:'#2563EB',marginBottom:7},title:{fontSize:31,lineHeight:37,fontWeight:'900'},subtitle:{fontSize:14,color:'#64748B',marginTop:5},stats:{flexDirection:'row',gap:9},stat:{flex:1,minHeight:120,padding:13,borderRadius:22,justifyContent:'center'},blue:{backgroundColor:'#EAF2FF'},orange:{backgroundColor:'#FFF3E8'},green:{backgroundColor:'#EAFBF1'},statIcon:{fontSize:21},statValue:{fontSize:24,fontWeight:'900'},statLabel:{fontSize:9,fontWeight:'900',color:'#64748B'},card:{padding:18,borderRadius:25,gap:18,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E2E8F0'},cardHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},cardTitle:{fontSize:19,fontWeight:'900'},cardMeta:{fontSize:11,color:'#64748B'},bigIcon:{fontSize:29},week:{flexDirection:'row',justifyContent:'space-between'},day:{alignItems:'center',gap:5},dayCircle:{width:36,height:36,borderRadius:18,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#CBD5E1'},dayDone:{backgroundColor:'#2563EB',borderColor:'#2563EB'},dayDoneText:{color:'#FFFFFF',fontWeight:'900'},dayLabel:{fontSize:10,color:'#64748B'},track:{height:11,borderRadius:6,backgroundColor:'#E2E8F0',overflow:'hidden'},fill:{height:'100%',backgroundColor:'#39D5F6'},trackLabels:{flexDirection:'row',justifyContent:'space-between'},trackStrong:{fontSize:12,fontWeight:'900'},sectionHead:{flexDirection:'row',justifyContent:'space-between'},sectionTitle:{fontSize:21,fontWeight:'900'},sectionCount:{fontSize:13,fontWeight:'900',color:'#2563EB'},badges:{flexDirection:'row',flexWrap:'wrap',gap:10},badge:{width:'48%',minHeight:140,padding:14,borderRadius:22,justifyContent:'center',backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E2E8F0'},locked:{opacity:.43},badgeIcon:{fontSize:29,marginBottom:7},badgeTitle:{fontSize:14,fontWeight:'900'},badgeMeta:{fontSize:10,lineHeight:14,color:'#64748B'},shop:{minHeight:72,padding:16,borderRadius:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#173F91'},shopTitle:{fontSize:15,fontWeight:'900',color:'#FFFFFF'},shopMeta:{fontSize:10,color:'#BFDBFE'},shopPrice:{fontSize:15,fontWeight:'900',color:'#FFFFFF'}});
