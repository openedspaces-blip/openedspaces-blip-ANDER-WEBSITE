import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://andergo.online';
const LANGUAGES = [
  { id: 'english', label: 'Inglés', flag: '🇺🇸', greeting: 'Ready to learn?' },
  { id: 'french', label: 'Francés', flag: '🇫🇷', greeting: 'Prêt à apprendre ?' },
  { id: 'spanish', label: 'Español', flag: '🇪🇸', greeting: '¿Listo para aprender?' },
] as const;
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export default function HomeScreen() {
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]['id']>('english');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('A1');
  const [online, setOnline] = useState<boolean | null>(null);
  const selectedLanguage = LANGUAGES.find((item) => item.id === language) ?? LANGUAGES[0];
  const routeUrl = useMemo(() => `${API_URL}/#learn/${language}/${level}`, [language, level]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/health`, { signal: controller.signal })
      .then((response) => setOnline(response.ok))
      .catch(() => setOnline(false));
    return () => controller.abort();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <Image source={require('@/assets/images/android-icon-foreground.png')} style={styles.logo} />
            <View style={styles.brandCopy}>
              <ThemedText style={styles.eyebrow}>ANDERGO ACADEMY</ThemedText>
              <ThemedText type="subtitle" style={styles.welcome}>¡Hola, estudiante!</ThemedText>
            </View>
            <View style={styles.streakPill} accessibilityLabel="Racha actual: 3 días">
              <ThemedText style={styles.streakEmoji}>🔥</ThemedText>
              <ThemedText style={styles.streakText}>3</ThemedText>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroCopy}>
                <ThemedText style={styles.heroKicker}>MISIÓN DE HOY</ThemedText>
                <ThemedText style={styles.heroTitle}>{selectedLanguage.greeting}</ThemedText>
                <ThemedText style={styles.heroBody}>Completa una lección corta y suma 20 XP.</ThemedText>
              </View>
              <View style={styles.xpBadge}>
                <ThemedText style={styles.xpValue}>20</ThemedText>
                <ThemedText style={styles.xpLabel}>XP</ThemedText>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <View style={styles.progressRow}>
              <ThemedText style={styles.progressLabel}>Progreso diario</ThemedText>
              <ThemedText style={styles.progressValue}>1 de 3 metas</ThemedText>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <ThemedText style={styles.sectionEyebrow}>TU PRÓXIMA LECCIÓN</ThemedText>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Elige tu ruta</ThemedText>
            </View>
            <View style={[styles.connectionDot, online === false && styles.connectionOffline]} />
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Idioma</ThemedText>
            <View style={styles.languageRow}>
              {LANGUAGES.map((item) => {
                const selected = language === item.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Aprender ${item.label}`}
                    accessibilityState={{ selected }}
                    onPress={() => setLanguage(item.id)}
                    style={({ pressed }) => [styles.language, selected && styles.languageSelected, pressed && styles.pressed]}>
                    <ThemedText style={styles.flag}>{item.flag}</ThemedText>
                    <ThemedText style={[styles.languageLabel, selected && styles.languageLabelSelected]}>{item.label}</ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <ThemedText type="smallBold">Nivel MCER</ThemedText>
            <View style={styles.levelRow}>
              {LEVELS.map((item) => {
                const selected = level === item;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityLabel={`Nivel ${item}`}
                    accessibilityState={{ selected }}
                    onPress={() => setLevel(item)}
                    style={({ pressed }) => [styles.level, selected && styles.levelSelected, pressed && styles.pressed]}>
                    <ThemedText style={selected && styles.levelSelectedText}>{item}</ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityHint="Abre la lección seleccionada"
              onPress={() => Linking.openURL(routeUrl)}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}>
              <View>
                <ThemedText style={styles.primaryOverline}>{selectedLanguage.label.toUpperCase()} · {level}</ThemedText>
                <ThemedText style={styles.primaryText}>Continuar aprendiendo</ThemedText>
              </View>
              <ThemedText style={styles.arrow}>→</ThemedText>
            </Pressable>
          </ThemedView>

          <View style={styles.quickRow}>
            <View style={styles.quickCard}>
              <ThemedText style={styles.quickIcon}>🎧</ThemedText>
              <ThemedText style={styles.quickTitle}>Escucha</ThemedText>
              <ThemedText type="small" style={styles.quickMeta}>5 min</ThemedText>
            </View>
            <View style={styles.quickCard}>
              <ThemedText style={styles.quickIcon}>💬</ThemedText>
              <ThemedText style={styles.quickTitle}>Practica</ThemedText>
              <ThemedText type="small" style={styles.quickMeta}>Tutor IA</ThemedText>
            </View>
            <View style={styles.quickCard}>
              <ThemedText style={styles.quickIcon}>⚡</ThemedText>
              <ThemedText style={styles.quickTitle}>Repasa</ThemedText>
              <ThemedText type="small" style={styles.quickMeta}>10 palabras</ThemedText>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, gap: 22, paddingBottom: 120, width: '100%', maxWidth: 720, alignSelf: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 50, height: 50 },
  brandCopy: { flex: 1 },
  eyebrow: { color: '#2563EB', fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  welcome: { fontSize: 22, lineHeight: 28, fontWeight: '900' },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, height: 42, borderRadius: 21, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA' },
  streakEmoji: { fontSize: 18 },
  streakText: { color: '#C2410C', fontWeight: '900' },
  heroCard: { borderRadius: 28, padding: 22, gap: 16, backgroundColor: '#173F91', shadowColor: '#173F91', shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  heroTop: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  heroCopy: { flex: 1, gap: 5 },
  heroKicker: { color: '#93C5FD', fontSize: 11, fontWeight: '900', letterSpacing: 1.3 },
  heroTitle: { color: '#FFFFFF', fontSize: 27, lineHeight: 33, fontWeight: '900' },
  heroBody: { color: '#DBEAFE', fontSize: 15, lineHeight: 21 },
  xpBadge: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  xpValue: { color: '#173F91', fontSize: 22, lineHeight: 24, fontWeight: '900' },
  xpLabel: { color: '#2563EB', fontSize: 10, fontWeight: '900' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#315AAA', overflow: 'hidden' },
  progressFill: { width: '33%', height: '100%', borderRadius: 4, backgroundColor: '#39D5F6' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: '#DBEAFE', fontSize: 12 },
  progressValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionEyebrow: { color: '#64748B', fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  sectionTitle: { fontSize: 25, lineHeight: 31, fontWeight: '900' },
  connectionDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' },
  connectionOffline: { backgroundColor: '#F59E0B' },
  card: { padding: 18, borderRadius: 26, gap: 15 },
  languageRow: { flexDirection: 'row', gap: 8 },
  language: { flex: 1, minHeight: 82, alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 18, borderWidth: 1, borderColor: '#CBD5E1' },
  languageSelected: { borderWidth: 2, borderColor: '#2563EB', backgroundColor: '#EAF2FF' },
  flag: { fontSize: 26 },
  languageLabel: { fontSize: 13, fontWeight: '700' },
  languageLabelSelected: { color: '#173F91', fontWeight: '900' },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  level: { flexGrow: 1, minWidth: 46, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: '#CBD5E1' },
  levelSelected: { borderColor: '#2563EB', backgroundColor: '#2563EB' },
  levelSelectedText: { color: '#FFFFFF', fontWeight: '900' },
  primaryButton: { minHeight: 66, borderRadius: 20, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2563EB', marginTop: 3 },
  primaryPressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  primaryOverline: { color: '#BFDBFE', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  primaryText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  arrow: { color: '#FFFFFF', fontSize: 27, fontWeight: '700' },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickCard: { flex: 1, minHeight: 116, borderRadius: 22, padding: 14, justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  quickIcon: { fontSize: 24, marginBottom: 7 },
  quickTitle: { color: '#0F172A', fontSize: 14, fontWeight: '900' },
  quickMeta: { color: '#64748B' },
  pressed: { opacity: 0.75 },
});
