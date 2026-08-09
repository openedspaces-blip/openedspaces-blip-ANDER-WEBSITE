import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://andergo.online';
const WEEK = [
  { day: 'L', done: true }, { day: 'M', done: true }, { day: 'M', done: true },
  { day: 'J', done: false }, { day: 'V', done: false }, { day: 'S', done: false }, { day: 'D', done: false },
] as const;

export default function ProgressScreen() {
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View>
            <ThemedText style={styles.eyebrow}>TU AVANCE</ThemedText>
            <ThemedText type="title" style={styles.title}>Paso a paso, más lejos.</ThemedText>
            <ThemedText themeColor="textSecondary">Mantén el ritmo y convierte cada práctica en progreso.</ThemedText>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statBlue]}>
              <ThemedText style={styles.statIcon}>⚡</ThemedText>
              <ThemedText style={styles.statValue}>120</ThemedText>
              <ThemedText style={styles.statLabel}>XP total</ThemedText>
            </View>
            <View style={[styles.statCard, styles.statOrange]}>
              <ThemedText style={styles.statIcon}>🔥</ThemedText>
              <ThemedText style={styles.statValue}>3</ThemedText>
              <ThemedText style={styles.statLabel}>días de racha</ThemedText>
            </View>
            <View style={[styles.statCard, styles.statGreen]}>
              <ThemedText style={styles.statIcon}>✓</ThemedText>
              <ThemedText style={styles.statValue}>6</ThemedText>
              <ThemedText style={styles.statLabel}>lecciones</ThemedText>
            </View>
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <ThemedText type="subtitle" style={styles.cardTitle}>Racha semanal</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">3 de 5 días completados</ThemedText>
              </View>
              <ThemedText style={styles.fire}>🔥</ThemedText>
            </View>
            <View style={styles.weekRow}>
              {WEEK.map((item, index) => (
                <View key={`${item.day}-${index}`} style={styles.dayColumn}>
                  <View style={[styles.dayCircle, item.done && styles.dayDone]}>
                    <ThemedText style={[styles.dayMark, item.done && styles.dayMarkDone]}>{item.done ? '✓' : '·'}</ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">{item.day}</ThemedText>
                </View>
              ))}
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <ThemedText type="subtitle" style={styles.cardTitle}>Liga Explorador</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Faltan 80 XP para subir de liga</ThemedText>
              </View>
              <View style={styles.leagueBadge}><ThemedText style={styles.leagueEmoji}>🏅</ThemedText></View>
            </View>
            <View style={styles.leagueTrack}><View style={styles.leagueFill} /></View>
            <View style={styles.leagueLabels}>
              <ThemedText type="smallBold">120 XP</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">200 XP</ThemedText>
            </View>
          </ThemedView>

          <Pressable
            accessibilityRole="button"
            accessibilityHint="Abre tu progreso completo en ANDERGO"
            onPress={() => Linking.openURL(`${API_URL}/#progress`)}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <ThemedText style={styles.buttonText}>Ver progreso completo</ThemedText>
            <ThemedText style={styles.buttonArrow}>→</ThemedText>
          </Pressable>
          <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
            Tus resultados completos se sincronizan con tu cuenta de ANDERGO.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 18, gap: 22, paddingBottom: 120, width: '100%', maxWidth: 720, alignSelf: 'center' },
  eyebrow: { color: '#2563EB', fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 7 },
  title: { fontSize: 34, lineHeight: 39, fontWeight: '900', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, minHeight: 125, padding: 14, borderRadius: 22, justifyContent: 'center' },
  statBlue: { backgroundColor: '#EAF2FF' }, statOrange: { backgroundColor: '#FFF3E8' }, statGreen: { backgroundColor: '#EAFBF1' },
  statIcon: { fontSize: 21, marginBottom: 5 }, statValue: { fontSize: 24, lineHeight: 29, fontWeight: '900', color: '#0F172A' }, statLabel: { fontSize: 11, color: '#475569', fontWeight: '700' },
  card: { borderRadius: 26, padding: 19, gap: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 20, lineHeight: 26, fontWeight: '900' }, fire: { fontSize: 28 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' }, dayColumn: { alignItems: 'center', gap: 6 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CBD5E1' },
  dayDone: { backgroundColor: '#2563EB', borderColor: '#2563EB' }, dayMark: { color: '#94A3B8', fontWeight: '900' }, dayMarkDone: { color: '#FFFFFF' },
  leagueBadge: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF7D6' }, leagueEmoji: { fontSize: 26 },
  leagueTrack: { height: 11, borderRadius: 6, backgroundColor: '#CBD5E1', overflow: 'hidden' }, leagueFill: { width: '60%', height: '100%', borderRadius: 6, backgroundColor: '#39D5F6' },
  leagueLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { minHeight: 60, borderRadius: 19, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#173F91' },
  pressed: { opacity: 0.84 }, buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' }, buttonArrow: { color: '#FFFFFF', fontSize: 25 }, note: { textAlign: 'center' },
});
