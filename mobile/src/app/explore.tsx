import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://andergo.online';

type Health = {
  ok?: boolean;
  supabase?: { configured?: boolean };
  aiTutor?: { configured?: boolean };
  translator?: { configured?: boolean };
};

export default function RouteStatusScreen() {
  const [health, setHealth] = useState<Health | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/health`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('health');
        return response.json();
      })
      .then((payload) => setHealth(payload))
      .catch(() => setFailed(true));
    return () => controller.abort();
  }, []);

  const checks = [
    ['Contenido y progreso', Boolean(health?.supabase?.configured)],
    ['Tutor de aprendizaje', Boolean(health?.aiTutor?.configured)],
    ['Traductor ANDERGO', Boolean(health?.translator?.configured)],
  ] as const;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>Tu ruta ANDERGO</ThemedText>
          <ThemedText themeColor="textSecondary">
            La aplicación usa el mismo contenido y progreso de andergo.online; no crea una cuenta
            ni una ruta separada.
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="subtitle">Servicios conectados</ThemedText>
            {checks.map(([label, ready]) => (
              <View key={label} style={styles.checkRow}>
                <View style={[styles.dot, ready && styles.dotReady]} />
                <ThemedText style={styles.checkLabel}>{label}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {failed ? 'Sin conexión' : health ? (ready ? 'Listo' : 'No disponible') : 'Comprobando…'}
                </ThemedText>
              </View>
            ))}
          </ThemedView>

          <Pressable
            accessibilityRole="button"
            onPress={() => Linking.openURL(`${API_URL}/#progress`)}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <ThemedText style={styles.buttonText}>Abrir mi progreso →</ThemedText>
          </Pressable>
          <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
            El acceso seguro y las actividades completas se abren en la versión web mientras se
            completa la experiencia nativa.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: 24, gap: 20, paddingBottom: 120 },
  title: { fontSize: 34, lineHeight: 39, fontWeight: '900' },
  card: { borderRadius: 24, padding: 20, gap: 16 },
  checkRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#f59e0b' },
  dotReady: { backgroundColor: '#22c55e' },
  checkLabel: { flex: 1, fontWeight: '700' },
  button: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  pressed: { opacity: 0.82 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  note: { textAlign: 'center' },
});
