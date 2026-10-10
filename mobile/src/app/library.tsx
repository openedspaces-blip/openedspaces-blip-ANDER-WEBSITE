import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth';
import { useGame } from '@/context/game';
import { CourseLanguage, CurriculumLesson, loadCurriculum } from '@/services/curriculum';

const TABS: { id: CurriculumLesson['skill'] | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Mapa', icon: '🗺️' },
  { id: 'listening', label: 'Reto audio', icon: '🎧' },
  { id: 'reading', label: 'Historias', icon: '📖' },
  { id: 'vocabulary', label: 'Palabras', icon: '🧩' },
  { id: 'grammar', label: 'Poderes', icon: '⚡' },
  { id: 'speaking', label: 'Habla', icon: '🗣️' },
  { id: 'writing', label: 'Crea', icon: '✍️' }
];
const LABEL: Partial<Record<CurriculumLesson['skill'], string>> = {
  listening: 'Reto de escucha',
  reading: 'Misión de lectura',
  vocabulary: 'Misión de palabras',
  grammar: 'Superpoder gramatical',
  writing: 'Reto creativo',
  speaking: 'Reto oral'
};
const PLAY_LEVELS = ['A1', 'A2'];

function themeIcon(title = '') {
  const value = title.toLowerCase();
  if (/family|famille|relationship/.test(value)) return '👨‍👩‍👧';
  if (/school|école|collège|work|travail/.test(value)) return '🏫';
  if (/food|drink|table|restaurant|shopping|achats/.test(value)) return '🍎';
  if (/home|house|chez moi|logement|neighborhood|ville/.test(value)) return '🏠';
  if (/travel|voyage|transport|météo|weather/.test(value)) return '✈️';
  if (/time|date|journée|routine|everyday/.test(value)) return '⏰';
  if (/health|santé/.test(value)) return '💚';
  if (/clothes|vêtements/.test(value)) return '👕';
  if (/free time|loisirs|hobby/.test(value)) return '⚽';
  return '🌟';
}

export default function LibraryScreen() {
  const game = useGame();
  const auth = useAuth();
  const levels = PLAY_LEVELS;
  const params = useLocalSearchParams<{ tab?: string }>();
  const requestedTab = TABS.some((item) => item.id === params.tab)
    ? (params.tab as CurriculumLesson['skill'] | 'all')
    : 'all';
  const [tab, setTab] = useState<CurriculumLesson['skill'] | 'all'>(requestedTab);
  const [level, setLevel] = useState('A1');
  const [lessons, setLessons] = useState<CurriculumLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  useEffect(() => {
    if (!auth.session) router.replace('/account');
  }, [auth.session]);
  useEffect(() => {
    setTab(requestedTab);
  }, [requestedTab]);
  useEffect(() => {
    if (!levels.includes(level)) setLevel('A1');
  }, [game.targetLanguage, level, levels]);
  useEffect(() => {
    if (!auth.session) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setLoadError('');
    loadCurriculum(game.targetLanguage as CourseLanguage, level, auth.session?.access_token)
      .then((items) => {
        if (alive) setLessons(items);
      })
      .catch(() => {
        if (alive) {
          setLessons([]);
          setLoadError(
            'No pudimos cargar el contenido ahora. Comprueba tu conexión e inténtalo de nuevo.'
          );
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [game.targetLanguage, level, auth.session, auth.session?.access_token, retryKey]);
  const visible = useMemo(
    () => (tab === 'all' ? lessons : lessons.filter((lesson) => lesson.skill === tab)),
    [lessons, tab]
  );
  const unitGroups = useMemo(() => {
    const groups = new Map<
      string,
      { id: string; order: number; title: string; description: string; lessons: CurriculumLesson[] }
    >();
    lessons.forEach((lesson) => {
      const id = lesson.unitId || `unit-${lesson.unitOrder || 1}`;
      const existing = groups.get(id) || {
        id,
        order: lesson.unitOrder || 999,
        title: lesson.unitTitle || '',
        description: lesson.unitDescription || '',
        lessons: []
      };
      if (!existing.title && lesson.unitTitle) existing.title = lesson.unitTitle;
      if (!existing.description && lesson.unitDescription)
        existing.description = lesson.unitDescription;
      existing.lessons.push(lesson);
      groups.set(id, existing);
    });
    return [...groups.values()].sort((a, b) => a.order - b.order);
  }, [lessons]);
  useEffect(() => {
    if (unitGroups.length && !unitGroups.some((unit) => unit.id === selectedUnitId))
      setSelectedUnitId(unitGroups[0].id);
  }, [unitGroups, selectedUnitId]);
  const selectedUnit = unitGroups.find((unit) => unit.id === selectedUnitId) || unitGroups[0];
  const selectedUnitScore = selectedUnit
    ? Math.round(
        selectedUnit.lessons.reduce((sum, lesson) => sum + Number(lesson.bestScore || 0), 0) /
          Math.max(1, selectedUnit.lessons.length)
      )
    : 0;
  const selectedUnitComplete =
    Boolean(selectedUnit) && selectedUnit.lessons.every((lesson) => lesson.completed);
  const unitFeedback =
    selectedUnitScore >= 90
      ? 'Excelente: dominas esta unidad.'
      : selectedUnitScore >= 70
        ? 'Muy bien: sigue consolidando.'
        : selectedUnitScore >= 60
          ? 'Bueno: repasa antes de avanzar.'
          : 'Sigue practicando para reforzar esta unidad.';
  const open = (lesson: CurriculumLesson) => {
    game.setLastMission({
      language: game.targetLanguage,
      slug: lesson.slug,
      lessonId: lesson.id,
      skill: lesson.skill,
      title: lesson.title,
      level: level as 'A1' | 'A2',
      unitId: lesson.unitId,
      unitTitle: lesson.unitTitle
    });
    router.push(
      `/activity?language=${game.targetLanguage}&level=${level}&slug=${encodeURIComponent(lesson.slug)}&lessonId=${lesson.id}&skill=${lesson.skill}` as never
    );
  };
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={s.back}>
            <ThemedText style={s.backText}>‹</ThemedText>
          </Pressable>
          <View style={s.headerCopy}>
            <ThemedText style={s.kicker}>ANDERGO PLAY · MAPA DE MISIONES</ThemedText>
            <ThemedText style={s.title}>Mi aventura</ThemedText>
          </View>
        </View>
        <ThemedText style={s.intro}>
          Explora temas reales de la ruta oficial y conviértelos en retos cortos, historias y
          conversación.
        </ThemedText>
        <ThemedText style={s.selectorLabel}>ELIGE TU MUNDO</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.levels}
        >
          {levels.map((item) => (
            <Pressable
              key={item}
              onPress={() => setLevel(item)}
              style={[s.level, item === level && s.levelActive]}
            >
              <ThemedText style={[s.levelText, item === level && s.levelTextActive]}>
                {item}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabs}
        >
          {TABS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setTab(item.id)}
              style={[s.tab, tab === item.id && s.tabActive]}
            >
              <ThemedText style={[s.tabText, tab === item.id && s.tabTextActive]}>
                {item.icon} {item.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color="#2563EB" size="large" />
            <ThemedText style={s.muted}>Preparando tus misiones…</ThemedText>
          </View>
        ) : loadError ? (
          <View style={s.empty}>
            <ThemedText style={s.emptyEmoji}>📡</ThemedText>
            <ThemedText style={s.emptyTitle}>No pudimos abrir tu mapa</ThemedText>
            <ThemedText style={s.muted}>{loadError}</ThemedText>
            <Pressable onPress={() => setRetryKey((value) => value + 1)} style={s.retry}>
              <ThemedText style={s.retryText}>Reintentar</ThemedText>
            </Pressable>
          </View>
        ) : tab === 'all' && selectedUnit ? (
          <>
            <View style={s.routeHead}>
              <View>
                <ThemedText style={s.routeKicker}>TEMAS DE TU RUTA</ThemedText>
                <ThemedText style={s.routeTitle}>Elige una aventura</ThemedText>
              </View>
              <ThemedText style={s.routeCount}>
                {selectedUnit.lessons.filter((lesson) => lesson.completed).length}/
                {selectedUnit.lessons.length}
              </ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.units}
            >
              {unitGroups.map((unit) => (
                <Pressable
                  key={unit.id}
                  onPress={() => setSelectedUnitId(unit.id)}
                  style={[s.unit, unit.id === selectedUnit.id && s.unitActive]}
                >
                  <ThemedText
                    style={[s.unitNumber, unit.id === selectedUnit.id && s.unitNumberActive]}
                  >
                    TEMA {unit.order}
                  </ThemedText>
                  <ThemedText
                    numberOfLines={2}
                    style={[s.unitText, unit.id === selectedUnit.id && s.unitTextActive]}
                  >
                    {themeIcon(unit.title)} {unit.title || `Aventura ${unit.order}`}
                  </ThemedText>
                  <ThemedText style={[s.unitMeta, unit.id === selectedUnit.id && s.unitMetaActive]}>
                    {unit.lessons.length} retos
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
            <View style={s.routeCurrent}>
              <ThemedText style={s.routeCurrentKicker}>TEMA ACTUAL</ThemedText>
              <ThemedText style={s.routeCurrentTitle}>
                {themeIcon(selectedUnit.title)}{' '}
                {selectedUnit.title || `Aventura ${selectedUnit.order}`}
              </ThemedText>
              <ThemedText style={s.routeCurrentScore}>{selectedUnitScore}/100 ✦</ThemedText>
              <ThemedText style={s.routeCurrentCopy}>
                {selectedUnitComplete
                  ? unitFeedback
                  : selectedUnit.description ||
                    'Completa los retos de este tema para desbloquear tu medalla.'}
              </ThemedText>
            </View>
            <View style={s.cards}>
              {selectedUnit.lessons.map((lesson) => (
                <Pressable key={lesson.id} onPress={() => open(lesson)} style={s.card}>
                  <View style={s.cardIcon}>
                    <ThemedText style={s.cardEmoji}>
                      {TABS.find((item) => item.id === lesson.skill)?.icon ?? '✦'}
                    </ThemedText>
                  </View>
                  <View style={s.cardCopy}>
                    <ThemedText style={s.cardType}>{LABEL[lesson.skill] ?? 'Lección'}</ThemedText>
                    <ThemedText style={s.cardTitle}>{lesson.title}</ThemedText>
                    <ThemedText numberOfLines={2} style={s.cardDesc}>
                      {lesson.description || 'Abre la actividad en formato móvil.'}
                    </ThemedText>
                    <ThemedText style={s.cardMeta}>
                      {lesson.completed
                        ? `✓ ${lesson.bestScore || 0}/100 · Completada`
                        : `${lesson.estimated_minutes ?? 5} min · +10 XP`}
                    </ThemedText>
                  </View>
                  <ThemedText style={s.go}>›</ThemedText>
                </Pressable>
              ))}
            </View>
          </>
        ) : visible.length ? (
          <View style={s.cards}>
            {visible.map((lesson) => (
              <Pressable key={lesson.id} onPress={() => open(lesson)} style={s.card}>
                <View style={s.cardIcon}>
                  <ThemedText style={s.cardEmoji}>
                    {TABS.find((item) => item.id === lesson.skill)?.icon ?? '✦'}
                  </ThemedText>
                </View>
                <View style={s.cardCopy}>
                  <ThemedText style={s.cardType}>{LABEL[lesson.skill] ?? 'Lección'}</ThemedText>
                  <ThemedText style={s.cardTitle}>{lesson.title}</ThemedText>
                  <ThemedText numberOfLines={2} style={s.cardDesc}>
                    {lesson.description || 'Abre la actividad en formato móvil.'}
                  </ThemedText>
                  <ThemedText style={s.cardMeta}>
                    {lesson.completed
                      ? `✓ ${lesson.bestScore || 0}/100 · Completada`
                      : `${lesson.estimated_minutes ?? 5} min · +10 XP`}
                  </ThemedText>
                </View>
                <ThemedText style={s.go}>›</ThemedText>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={s.empty}>
            <ThemedText style={s.emptyEmoji}>📚</ThemedText>
            <ThemedText style={s.emptyTitle}>Esta isla aún está en preparación</ThemedText>
            <ThemedText style={s.muted}>Prueba otra misión o el otro nivel de tu mundo.</ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F8FD' },
  content: { padding: 20, paddingBottom: 42, gap: 15 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerCopy: { flex: 1 },
  back: {
    height: 42,
    width: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  backText: { fontSize: 31, lineHeight: 34, color: '#2563EB' },
  kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.1, color: '#2563EB' },
  title: { fontSize: 25, fontWeight: '900', color: '#172554' },
  intro: { fontSize: 14, lineHeight: 20, color: '#64748B' },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
    color: '#64748B',
    marginBottom: -7
  },
  levels: { gap: 8, paddingRight: 12 },
  level: {
    minWidth: 49,
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DCE6F7'
  },
  levelActive: { backgroundColor: '#172554', borderColor: '#172554' },
  levelText: { fontSize: 12, fontWeight: '900', color: '#475569' },
  levelTextActive: { color: '#FFF' },
  tabs: { gap: 8, paddingRight: 12 },
  tab: {
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  tabActive: { backgroundColor: '#E8F0FF', borderColor: '#93C5FD' },
  tabText: { fontSize: 12, fontWeight: '900', color: '#475569' },
  tabTextActive: { color: '#1D4ED8' },
  routeHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 3
  },
  routeKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: '#2563EB' },
  routeTitle: { fontSize: 18, fontWeight: '900', color: '#172554', marginTop: 2 },
  routeCount: { fontSize: 13, fontWeight: '900', color: '#2563EB' },
  units: { gap: 8, paddingRight: 12 },
  unit: {
    width: 142,
    minHeight: 92,
    padding: 11,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DCE6F7'
  },
  unitActive: { backgroundColor: '#E8F0FF', borderColor: '#2563EB' },
  unitNumber: { fontSize: 11, fontWeight: '900', color: '#64748B' },
  unitNumberActive: { color: '#2563EB' },
  unitText: { fontSize: 11, lineHeight: 14, fontWeight: '900', color: '#334155', marginTop: 5 },
  unitTextActive: { color: '#1D4ED8' },
  unitMeta: { fontSize: 9, fontWeight: '700', color: '#94A3B8', marginTop: 3 },
  unitMetaActive: { color: '#3B82F6' },
  routeCurrent: {
    padding: 14,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  routeCurrentKicker: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8, color: '#2563EB' },
  routeCurrentTitle: { fontSize: 16, fontWeight: '900', color: '#172554', marginTop: 3 },
  routeCurrentScore: { fontSize: 12, fontWeight: '900', color: '#2563EB', marginTop: 3 },
  routeCurrentCopy: { fontSize: 11, lineHeight: 16, color: '#526B8E', marginTop: 3 },
  cards: { gap: 11 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 21,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  cardLocked: { backgroundColor: '#FAFAFC' },
  cardIcon: {
    height: 46,
    width: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F0FF'
  },
  cardEmoji: { fontSize: 21 },
  cardCopy: { flex: 1 },
  cardType: { fontSize: 9, fontWeight: '900', letterSpacing: 0.7, color: '#2563EB' },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#172554', marginTop: 2 },
  cardDesc: { fontSize: 11, lineHeight: 15, color: '#64748B', marginTop: 3 },
  cardMeta: { fontSize: 10, fontWeight: '800', color: '#059669', marginTop: 6 },
  go: { fontSize: 28, color: '#2563EB' },
  center: { paddingVertical: 80, alignItems: 'center', gap: 14 },
  empty: {
    padding: 28,
    borderRadius: 25,
    alignItems: 'center',
    gap: 11,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#172554', textAlign: 'center' },
  muted: { fontSize: 13, lineHeight: 19, color: '#64748B', textAlign: 'center' },
  retry: {
    marginTop: 5,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 13,
    backgroundColor: '#2563EB'
  },
  retryText: { fontSize: 12, fontWeight: '900', color: '#FFF' }
});
