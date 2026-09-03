import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth';
import { useSubscription } from '@/context/subscription';
import { TargetLanguage, useGame } from '@/context/game';

const LANGUAGES: { id: TargetLanguage; label: string; flag: string; levels: string }[] = [
  { id: 'english', label: 'Inglés', flag: '🇺🇸', levels: 'A1–C2' },
  { id: 'french', label: 'Francés', flag: '🇫🇷', levels: 'A1–C2' },
  { id: 'spanish', label: 'Español', flag: '🇪🇸', levels: 'A1–C2' },
  { id: 'italian', label: 'Italiano', flag: '🇮🇹', levels: 'A1–B1' },
  { id: 'portuguese', label: 'Portugués', flag: '🇧🇷', levels: 'A1–B1' },
  { id: 'german', label: 'Alemán', flag: '🇩🇪', levels: 'A1–B1' }
];

const PLATFORM_TILES = [
  {
    number: '01',
    title: 'Misiones',
    copy: 'Tu ruta y lecciones',
    color: 'blue',
    destination: '/library'
  },
  {
    number: '02',
    title: 'Historias',
    copy: 'Lee y comprende',
    color: 'violet',
    destination: '/library?tab=reading'
  },
  {
    number: '03',
    title: 'Escucha',
    copy: 'Audios oficiales',
    color: 'cyan',
    destination: '/library?tab=listening'
  },
  {
    number: '04',
    title: 'Palabras',
    copy: 'Colecciona vocabulario',
    color: 'emerald',
    destination: '/library?tab=vocabulary'
  },
  {
    number: '05',
    title: 'Superpoderes',
    copy: 'Gramática y verbos',
    color: 'orange',
    destination: '/library?tab=grammar'
  },
  {
    number: '06',
    title: 'Entrena con Tutor',
    copy: 'Práctica guiada',
    color: 'indigo',
    destination: '/tutor'
  },
  {
    number: '07',
    title: 'Traductor',
    copy: 'Traduce y escucha',
    color: 'rose',
    destination: '/translator'
  },
  {
    number: '08',
    title: 'Juegos',
    copy: 'Reto rápido',
    color: 'blue',
    destination: '/platform?section=games&title=Juegos'
  },
  {
    number: '09',
    title: 'Descubre',
    copy: 'Infografías visuales',
    color: 'violet',
    destination: '/platform?section=infographics&title=Infografías'
  },
  {
    number: '10',
    title: 'Frases útiles',
    copy: 'Habla como un pro',
    color: 'cyan',
    destination: '/platform?section=useful-expressions&title=Useful%20expressions'
  },
  {
    number: '11',
    title: 'Inglés técnico',
    copy: 'Para el mundo real',
    color: 'emerald',
    destination: '/platform?section=technical-english&title=Inglés%20técnico'
  }
] as const;

export default function HomeScreen() {
  const { session } = useAuth();
  const { isPremium } = useSubscription();
  const { targetLanguage, setTargetLanguage } = useGame();
  const current = LANGUAGES.find((language) => language.id === targetLanguage) ?? LANGUAGES[0];
  const firstName = session?.displayName?.split(' ')[0];
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.screen}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.topbar}>
          <View style={s.brandLockup}>
            <View style={s.brandMark} accessibilityLabel="ANDERGO Play">
              <ThemedText style={s.brandMarkText}>A</ThemedText>
            </View>
            <View>
              <ThemedText style={s.brand}>ANDERGO Play</ThemedText>
              <ThemedText style={s.subtitle}>Aprende jugando</ThemedText>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Abrir mi cuenta"
            onPress={() => router.push('/account' as never)}
            style={s.accountButton}
          >
            {session ? (
              <>
                <ThemedText style={s.accountAvatar}>{session.avatarEmoji}</ThemedText>
                <View style={s.accountInfo}>
                  <ThemedText numberOfLines={1} style={s.accountText}>
                    {firstName}
                  </ThemedText>
                  <ThemedText numberOfLines={1} style={s.accountPlan}>
                    {isPremium ? 'Premium' : 'Free'}
                  </ThemedText>
                </View>
              </>
            ) : (
              <ThemedText numberOfLines={1} style={s.accountText}>
                Entrar
              </ThemedText>
            )}
          </Pressable>
        </View>
        <View style={s.hero}>
          <View style={s.heroGlow} />
          <ThemedText style={s.heroKicker}>
            ✦ AVENTURA EN {current.flag} {current.label.toUpperCase()} · {current.levels}
          </ThemedText>
          <ThemedText style={s.heroTitle}>
            {firstName ? `¡Hola, ${firstName}!` : '¡Vamos a jugar,'}
            {'\n'}aprender y ganar!
          </ThemedText>
          <ThemedText style={s.heroCopy}>
            Completa misiones reales de ANDERGO, consigue puntos y practica hablando con tu Tutor.
          </ThemedText>
          <Pressable onPress={() => router.push('/library' as never)} style={s.heroAction}>
            <ThemedText style={s.heroActionText}>Comenzar mi misión →</ThemedText>
          </Pressable>
        </View>
        <View style={s.sectionHead}>
          <ThemedText style={s.sectionTitle}>Selecciona tu idioma</ThemedText>
          <ThemedText style={s.sectionHint}>Puedes cambiarlo después</ThemedText>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.languages}
        >
          {LANGUAGES.map((language) => (
            <Pressable
              key={language.id}
              onPress={() => setTargetLanguage(language.id)}
              style={[s.language, targetLanguage === language.id && s.languageActive]}
            >
              <ThemedText style={s.flag}>{language.flag}</ThemedText>
              <ThemedText
                style={[s.languageText, targetLanguage === language.id && s.languageTextActive]}
              >
                {language.label}
              </ThemedText>
              <ThemedText
                style={[s.languageLevel, targetLanguage === language.id && s.languageLevelActive]}
              >
                {language.levels}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
        <View style={s.platformHead}>
          <View>
            <ThemedText style={s.sectionTitle}>Elige tu próxima aventura</ThemedText>
            <ThemedText style={s.platformHint}>Aprende, juega y practica con tu Tutor</ThemedText>
          </View>
          <ThemedText style={s.platformCount}>11</ThemedText>
        </View>
        <View style={s.tileGrid}>
          {PLATFORM_TILES.map((tile) => (
            <PlatformTile key={tile.number} {...tile} />
          ))}
        </View>
        <View style={s.bottomNav}>
          <Nav active label="Inicio" onPress={() => undefined} />
          <Nav label="Biblioteca" onPress={() => router.push('/library' as never)} />
          <Nav label="Tutor IA" onPress={() => router.push('/tutor' as never)} />
          <Nav label="Cuenta" onPress={() => router.push('/account' as never)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Nav({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={s.navItem}>
      <ThemedText style={[s.navLabel, active && s.navActive]}>{label}</ThemedText>
    </Pressable>
  );
}
function PlatformTile({
  number,
  title,
  copy,
  color,
  destination
}: (typeof PLATFORM_TILES)[number]) {
  const tone =
    color === 'blue'
      ? s.tileBlue
      : color === 'violet'
        ? s.tileViolet
        : color === 'cyan'
          ? s.tileCyan
          : color === 'emerald'
            ? s.tileEmerald
            : color === 'orange'
              ? s.tileOrange
              : color === 'indigo'
                ? s.tileIndigo
                : color === 'rose'
                  ? s.tileRose
                  : s.tileSlate;
  return (
    <Pressable onPress={() => router.push(destination as never)} style={[s.tile, tone]}>
      <ThemedText style={s.tileNumber}>{number}</ThemedText>
      <ThemedText style={s.tileTitle}>{title}</ThemedText>
      <ThemedText style={s.tileCopy}>{copy}</ThemedText>
      <ThemedText style={s.tileArrow}>→</ThemedText>
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F8FD' },
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 30, gap: 14 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 2
  },
  brandLockup: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, minWidth: 0 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#173F91',
    shadowColor: '#173F91',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  brandMarkText: { color: '#FFF', fontSize: 21, fontWeight: '900', fontStyle: 'italic' },
  brand: { color: '#172554', fontSize: 15, fontWeight: '900', letterSpacing: 1.4 },
  subtitle: { color: '#64748B', fontSize: 10, fontWeight: '700', marginTop: 1 },
  accountButton: {
    maxWidth: 130,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DCE6F7'
  },
  accountAvatar: { fontSize: 23 },
  accountInfo: { flexShrink: 1 },
  accountText: { color: '#1D4ED8', fontSize: 12, fontWeight: '900' },
  accountPlan: { color: '#64748B', fontSize: 9, fontWeight: '800' },
  hero: {
    overflow: 'hidden',
    borderRadius: 26,
    padding: 23,
    backgroundColor: '#173F91',
    minHeight: 246
  },
  heroGlow: {
    position: 'absolute',
    height: 205,
    width: 205,
    borderRadius: 110,
    backgroundColor: '#0EA5E9',
    opacity: 0.44,
    right: -76,
    top: -65
  },
  heroKicker: { color: '#BFDBFE', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  heroTitle: { color: '#FFF', fontSize: 29, lineHeight: 34, fontWeight: '900', marginTop: 13 },
  heroCopy: { color: '#DBEAFE', fontSize: 14, lineHeight: 20, marginTop: 9, maxWidth: '84%' },
  heroAction: {
    alignSelf: 'flex-start',
    marginTop: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFF'
  },
  heroActionText: { color: '#1D4ED8', fontSize: 13, fontWeight: '900' },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 5
  },
  sectionTitle: { color: '#172554', fontSize: 18, fontWeight: '900', marginTop: 5 },
  sectionHint: { color: '#8190A7', fontSize: 10, fontWeight: '700' },
  languages: { gap: 9, paddingRight: 16 },
  language: {
    width: 88,
    minHeight: 86,
    borderRadius: 18,
    padding: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E7F1',
    justifyContent: 'center'
  },
  languageActive: { backgroundColor: '#E8F0FF', borderColor: '#2563EB' },
  flag: { fontSize: 20 },
  languageText: { color: '#475569', fontSize: 12, fontWeight: '900', marginTop: 6 },
  languageTextActive: { color: '#1D4ED8' },
  languageLevel: { color: '#94A3B8', fontSize: 10, fontWeight: '700', marginTop: 2 },
  languageLevelActive: { color: '#3B82F6' },
  platformHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 5
  },
  platformHint: { color: '#64748B', fontSize: 11, marginTop: 2 },
  platformCount: { fontSize: 26, lineHeight: 28, fontWeight: '900', color: '#BFDBFE' },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  tile: { width: '48%', minHeight: 132, borderRadius: 20, padding: 14, overflow: 'hidden' },
  tileBlue: { backgroundColor: '#1D4ED8' },
  tileViolet: { backgroundColor: '#6D28D9' },
  tileCyan: { backgroundColor: '#0891B2' },
  tileEmerald: { backgroundColor: '#059669' },
  tileOrange: { backgroundColor: '#D97706' },
  tileIndigo: { backgroundColor: '#4338CA' },
  tileRose: { backgroundColor: '#E11D48' },
  tileSlate: { backgroundColor: '#334155' },
  tileNumber: { color: '#BFDBFE', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  tileTitle: { color: '#FFF', fontSize: 19, fontWeight: '900', marginTop: 14 },
  tileCopy: { color: '#E0F2FE', fontSize: 11, lineHeight: 15, marginTop: 3, maxWidth: '88%' },
  tileArrow: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    position: 'absolute',
    right: 13,
    bottom: 9
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 13,
    marginTop: 5,
    borderTopWidth: 1,
    borderColor: '#E2E8F0'
  },
  navItem: { minWidth: 55, alignItems: 'center', paddingVertical: 4 },
  navLabel: { color: '#64748B', fontSize: 10, fontWeight: '800' },
  navActive: { color: '#2563EB' }
});
