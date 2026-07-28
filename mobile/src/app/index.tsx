import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://andergo.online';
const LANGUAGES = [
  { id: 'english', label: 'English', flag: '🇺🇸' },
  { id: 'french', label: 'Français', flag: '🇫🇷' },
  { id: 'spanish', label: 'Español', flag: '🇪🇸' },
] as const;
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export default function HomeScreen() {
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]['id']>('english');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('A1');
  const [online, setOnline] = useState<boolean | null>(null);
  const routeUrl = useMemo(
    () => `${API_URL}/#learn/${language}/${level}`,
    [language, level]
  );

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
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <ThemedText style={styles.logoLetter}>A</ThemedText>
            </View>
            <View style={styles.brandCopy}>
              <ThemedText type="subtitle" style={styles.brandTitle}>
                ANDERGO
              </ThemedText>
              <ThemedText themeColor="textSecondary">Language Academy</ThemedText>
            </View>
            <View
              accessibilityLabel={online ? 'Servidor disponible' : 'Comprobando servidor'}
              style={[styles.statusDot, online === false && styles.statusDotOffline]}
            />
          </View>

          <View style={styles.hero}>
            <ThemedText type="title" style={styles.heroTitle}>
              Tu ruta, clara desde el primer toque.
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Esta primera versión móvil reutiliza la misma ruta y la misma API de progreso de
              ANDERGO.
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Idioma que quieres aprender</ThemedText>
            <View style={styles.optionGrid}>
              {LANGUAGES.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: language === item.id }}
                  onPress={() => setLanguage(item.id)}
                  style={[styles.option, language === item.id && styles.optionSelected]}>
                  <ThemedText style={styles.optionText}>
                    {item.flag} {item.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText type="smallBold">Nivel MCER</ThemedText>
            <View style={styles.levelRow}>
              {LEVELS.map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityState={{ selected: level === item }}
                  onPress={() => setLevel(item)}
                  style={[styles.level, level === item && styles.levelSelected]}>
                  <ThemedText style={level === item && styles.levelSelectedText}>{item}</ThemedText>
                </Pressable>
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => Linking.openURL(routeUrl)}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}>
              <ThemedText style={styles.primaryText}>Comenzar ruta →</ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedText type="small" themeColor="textSecondary" style={styles.foundationNote}>
            Base móvil iniciada · Expo SDK 57 · Android e iOS · sin progreso duplicado.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: 24, gap: 28, paddingBottom: 120 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  logoLetter: { color: '#fff', fontSize: 25, fontWeight: '900' },
  brandCopy: { flex: 1 },
  brandTitle: { fontSize: 23, lineHeight: 27, fontWeight: '900' },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e' },
  statusDotOffline: { backgroundColor: '#f59e0b' },
  hero: { gap: 10 },
  heroTitle: { fontSize: 36, lineHeight: 40, fontWeight: '900' },
  card: { padding: 20, borderRadius: 24, gap: 16 },
  optionGrid: { gap: 10 },
  option: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  optionSelected: { borderColor: '#2563eb', backgroundColor: '#dbeafe' },
  optionText: { fontWeight: '700' },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  level: {
    minWidth: 48,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  levelSelected: { borderColor: '#2563eb', backgroundColor: '#2563eb' },
  levelSelectedText: { color: '#fff', fontWeight: '800' },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    marginTop: 4,
  },
  primaryPressed: { opacity: 0.82 },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  foundationNote: { textAlign: 'center' },
});
