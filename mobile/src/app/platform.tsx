import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth';
import { type TargetLanguage, useGame } from '@/context/game';
import { loadCurriculum, loadLessonActivity } from '@/services/curriculum';

const LOCALES: Record<TargetLanguage, string> = { english: 'en-US', french: 'fr-FR' };
const LANGUAGE_NAMES: Record<TargetLanguage, string> = { english: 'inglés', french: 'francés' };
const MAX_ROUNDS = 5;
type LessonPair = { source: string; target: string; example?: string };
type GameMode = 'trivia' | 'listen' | 'spell';

const MODES: { id: GameMode; icon: string; label: string; caption: string }[] = [
  { id: 'trivia', icon: '❓', label: 'Trivia', caption: 'Elige la respuesta' },
  { id: 'listen', icon: '🔊', label: 'Escucha', caption: 'Oye y acierta' },
  { id: 'spell', icon: '🔤', label: 'Letras', caption: 'Forma la palabra' }
];

function rotate<T>(items: T[], offset: number) {
  if (!items.length) return [];
  const start = offset % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

function isSpellable(pair: LessonPair) {
  return /^[\p{L}]+$/u.test(pair.source) && Array.from(pair.source).length <= 12;
}

export default function GameScreen() {
  const { session } = useAuth();
  const { targetLanguage, lastMission } = useGame();
  const [pairs, setPairs] = useState<LessonPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<GameMode>('trivia');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [theme, setTheme] = useState('');

  useEffect(() => {
    if (!session) {
      router.replace('/account');
      return;
    }
    let live = true;
    setLoading(true);
    setRound(0);
    setScore(0);
    setAnswer(null);
    setSelectedLetters([]);
    const gameLevel = lastMission?.language === targetLanguage ? lastMission.level : 'A1';
    void loadCurriculum(targetLanguage, gameLevel, session.access_token)
      .then(async (lessons) => {
        const activeUnit =
          lastMission?.language === targetLanguage ? lastMission.unitId : undefined;
        const source =
          lessons.find((lesson) => lesson.skill === 'vocabulary' && lesson.unitId === activeUnit) ??
          lessons.find((lesson) => lesson.skill === 'vocabulary') ??
          lessons[0];
        if (!source) return { pairs: [], theme: '' };
        const activity = await loadLessonActivity(
          source.slug,
          { lessonId: source.id, language: targetLanguage, level: gameLevel },
          session.access_token
        );
        return {
          pairs: activity?.pairs.filter((pair) => pair.source && pair.target).slice(0, 12) ?? [],
          theme: source.unitTitle || source.title
        };
      })
      .then((result) => {
        if (!live) return;
        setPairs(result.pairs);
        setTheme(result.theme);
      })
      .catch(() => {
        if (!live) return;
        setPairs([]);
        setTheme('');
      })
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [lastMission, session, targetLanguage]);

  const gamePairs = useMemo(
    () => (mode === 'spell' ? pairs.filter(isSpellable) : pairs),
    [mode, pairs]
  );
  const questions = useMemo(
    () => rotate(gamePairs, round).slice(0, MAX_ROUNDS),
    [gamePairs, round]
  );
  const question = questions[0];
  const options = useMemo(() => {
    if (!question) return [];
    return [
      question.target,
      ...rotate(
        gamePairs.filter((pair) => pair.target !== question.target),
        round
      )
        .slice(0, 3)
        .map((pair) => pair.target)
    ].sort((a, b) => a.localeCompare(b));
  }, [gamePairs, question, round]);
  const letters = useMemo(
    () => (question ? rotate(Array.from(question.source), round + 2) : []),
    [question, round]
  );
  const rounds = Math.min(MAX_ROUNDS, gamePairs.length);

  useEffect(() => {
    if (mode !== 'listen' || !question || answer) return;
    const timer = setTimeout(() => {
      Speech.speak(question.source, { language: LOCALES[targetLanguage], rate: 0.78 });
    }, 280);
    return () => clearTimeout(timer);
  }, [answer, mode, question, targetLanguage]);

  const resetRound = () => {
    setAnswer(null);
    setSelectedLetters([]);
  };
  const changeMode = (nextMode: GameMode) => {
    Speech.stop();
    setMode(nextMode);
    setRound(0);
    setScore(0);
    resetRound();
  };
  const choose = (value: string) => {
    if (!question || answer) return;
    setAnswer(value);
    if (value === question.target) setScore((current) => current + 1);
  };
  const addLetter = (index: number) => {
    if (!question || answer || selectedLetters.includes(index)) return;
    const nextLetters = [...selectedLetters, index];
    setSelectedLetters(nextLetters);
    if (nextLetters.length !== letters.length) return;
    const value = nextLetters.map((letterIndex) => letters[letterIndex]).join('');
    setAnswer(value);
    if (value.toLocaleLowerCase() === question.source.toLocaleLowerCase()) {
      setScore((current) => current + 1);
    }
  };
  const next = () => {
    resetRound();
    setRound((current) => current + 1);
  };
  const restart = () => {
    setRound(0);
    setScore(0);
    resetRound();
  };
  const spellCorrect = Boolean(
    question && answer && answer.toLocaleLowerCase() === question.source.toLocaleLowerCase()
  );
  const isCorrect = mode === 'spell' ? spellCorrect : answer === question?.target;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={s.back}>
            <ThemedText style={s.backText}>‹</ThemedText>
          </Pressable>
          <View style={s.headerCopy}>
            <ThemedText style={s.kicker}>ANDERGO PLAY · MINIJUEGOS</ThemedText>
            <ThemedText style={s.title}>Palabras en juego</ThemedText>
          </View>
        </View>
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color="#2563EB" size="large" />
            <ThemedText style={s.muted}>Preparando tus minijuegos…</ThemedText>
          </View>
        ) : !gamePairs.length ? (
          <View style={s.empty}>
            <ThemedText style={s.emptyEmoji}>🧩</ThemedText>
            <ThemedText style={s.emptyTitle}>Aún no hay palabras para este reto</ThemedText>
            <ThemedText style={s.muted}>Vuelve a una misión A1 e inténtalo otra vez.</ThemedText>
          </View>
        ) : (
          <>
            <View style={s.modeGrid}>
              {MODES.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => changeMode(item.id)}
                  style={[s.mode, mode === item.id && s.modeActive]}
                >
                  <ThemedText style={s.modeIcon}>{item.icon}</ThemedText>
                  <ThemedText style={[s.modeText, mode === item.id && s.modeTextActive]}>
                    {item.label}
                  </ThemedText>
                  <ThemedText style={[s.modeCaption, mode === item.id && s.modeCaptionActive]}>
                    {item.caption}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
            {round >= rounds ? (
              <View style={s.finish}>
                <ThemedText style={s.finishEmoji}>{score === rounds ? '🏆' : '⭐'}</ThemedText>
                <ThemedText style={s.finishTitle}>¡Reto completado!</ThemedText>
                <ThemedText style={s.finishScore}>
                  {score} de {rounds} correctas
                </ThemedText>
                <Pressable onPress={restart} style={s.primary}>
                  <ThemedText style={s.primaryText}>Jugar otra vez</ThemedText>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={s.progress}>
                  <ThemedText style={s.progressText}>
                    RETO {round + 1}/{rounds}
                  </ThemedText>
                  <ThemedText style={s.progressText}>⭐ {score}</ThemedText>
                </View>
                {theme ? <ThemedText style={s.theme}>Aventura: {theme}</ThemedText> : null}
                <View style={s.question}>
                  <ThemedText style={s.questionKicker}>
                    {mode === 'trivia'
                      ? 'TRIVIA · ¿QUÉ SIGNIFICA?'
                      : mode === 'listen'
                        ? 'ESCUCHA Y ELIGE LA RESPUESTA'
                        : `FORMA LA PALABRA EN ${LANGUAGE_NAMES[targetLanguage].toUpperCase()}`}
                  </ThemedText>
                  {mode === 'listen' ? (
                    <Pressable
                      onPress={() =>
                        Speech.speak(question.source, {
                          language: LOCALES[targetLanguage],
                          rate: 0.78
                        })
                      }
                      style={s.bigListen}
                    >
                      <ThemedText style={s.bigListenIcon}>🔊</ThemedText>
                      <ThemedText style={s.bigListenText}>Toca para escuchar</ThemedText>
                    </Pressable>
                  ) : mode === 'spell' ? (
                    <>
                      <ThemedText style={s.clue}>{question.target}</ThemedText>
                      <ThemedText style={s.letterAnswer}>
                        {selectedLetters.length
                          ? selectedLetters
                              .map((index) => letters[index])
                              .join('')
                              .toUpperCase()
                          : '— — —'}
                      </ThemedText>
                    </>
                  ) : (
                    <>
                      <ThemedText style={s.word}>{question.source}</ThemedText>
                      <Pressable
                        onPress={() =>
                          Speech.speak(question.source, {
                            language: LOCALES[targetLanguage],
                            rate: 0.84
                          })
                        }
                        style={s.listen}
                      >
                        <ThemedText style={s.listenText}>🔊 Escuchar</ThemedText>
                      </Pressable>
                    </>
                  )}
                </View>
                {mode === 'spell' ? (
                  <>
                    <View style={s.letterGrid}>
                      {letters.map((letter, index) => (
                        <Pressable
                          key={`${letter}-${index}`}
                          disabled={Boolean(answer) || selectedLetters.includes(index)}
                          onPress={() => addLetter(index)}
                          style={[s.letter, selectedLetters.includes(index) && s.letterUsed]}
                        >
                          <ThemedText style={s.letterText}>{letter.toUpperCase()}</ThemedText>
                        </Pressable>
                      ))}
                    </View>
                    {selectedLetters.length && !answer ? (
                      <Pressable onPress={() => setSelectedLetters((value) => value.slice(0, -1))}>
                        <ThemedText style={s.undo}>← Quitar última letra</ThemedText>
                      </Pressable>
                    ) : null}
                  </>
                ) : (
                  <View style={s.answers}>
                    {options.map((option) => {
                      const selected = answer === option;
                      const right = option === question.target;
                      return (
                        <Pressable
                          key={option}
                          disabled={Boolean(answer)}
                          onPress={() => choose(option)}
                          style={[
                            s.answer,
                            selected && (right ? s.right : s.wrong),
                            answer && right && s.right
                          ]}
                        >
                          <ThemedText
                            style={[
                              s.answerText,
                              (selected || (answer && right)) && s.answerTextSelected
                            ]}
                          >
                            {option}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
                {answer ? (
                  <View style={s.feedback}>
                    <ThemedText style={s.feedbackText}>
                      {isCorrect
                        ? '¡Correcto! +1 estrella'
                        : mode === 'spell'
                          ? `La palabra era: ${question.source}`
                          : `La respuesta era: ${question.target}`}
                    </ThemedText>
                    <Pressable onPress={next} style={s.next}>
                      <ThemedText style={s.nextText}>
                        {round + 1 === rounds ? 'Ver resultado' : 'Siguiente reto'} →
                      </ThemedText>
                    </Pressable>
                  </View>
                ) : null}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F8FD' },
  content: { padding: 20, paddingBottom: 42, gap: 16 },
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
  kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: '#2563EB' },
  title: { fontSize: 25, fontWeight: '900', color: '#172554' },
  center: { minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: 14 },
  muted: { fontSize: 13, lineHeight: 19, textAlign: 'center', color: '#64748B' },
  modeGrid: { flexDirection: 'row', gap: 8 },
  mode: {
    flex: 1,
    minHeight: 91,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: 8,
    borderRadius: 19,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DCE6F7'
  },
  modeActive: { backgroundColor: '#E8F0FF', borderColor: '#2563EB' },
  modeIcon: { fontSize: 22 },
  modeText: { fontSize: 12, fontWeight: '900', color: '#334155' },
  modeTextActive: { color: '#1D4ED8' },
  modeCaption: { fontSize: 9, textAlign: 'center', color: '#94A3B8' },
  modeCaptionActive: { color: '#3B82F6' },
  progress: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  progressText: { fontSize: 12, fontWeight: '900', color: '#2563EB' },
  theme: {
    alignSelf: 'center',
    maxWidth: '90%',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    color: '#64748B'
  },
  question: {
    alignItems: 'center',
    padding: 25,
    borderRadius: 28,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 9
  },
  questionKicker: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#2563EB',
    textAlign: 'center'
  },
  word: { fontSize: 32, fontWeight: '900', textAlign: 'center', color: '#172554' },
  clue: { fontSize: 23, fontWeight: '900', textAlign: 'center', color: '#172554' },
  letterAnswer: {
    fontSize: 27,
    letterSpacing: 3,
    fontWeight: '900',
    color: '#2563EB',
    textAlign: 'center'
  },
  listen: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 13, backgroundColor: '#FFF' },
  listenText: { fontSize: 12, fontWeight: '900', color: '#2563EB' },
  bigListen: { alignItems: 'center', gap: 5, paddingVertical: 9 },
  bigListenIcon: { fontSize: 54 },
  bigListenText: { fontSize: 15, fontWeight: '900', color: '#2563EB' },
  answers: { gap: 10 },
  answer: {
    minHeight: 55,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DCE6F7'
  },
  letterGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 9 },
  letter: {
    minWidth: 47,
    minHeight: 48,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#93C5FD'
  },
  letterUsed: { opacity: 0.34, backgroundColor: '#E2E8F0' },
  letterText: { fontSize: 19, fontWeight: '900', color: '#1D4ED8' },
  undo: { alignSelf: 'center', color: '#2563EB', fontSize: 12, fontWeight: '900' },
  right: { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
  wrong: { backgroundColor: '#FFE4E6', borderColor: '#FB7185' },
  answerText: { fontSize: 15, fontWeight: '900', textAlign: 'center', color: '#334155' },
  answerTextSelected: { color: '#172554' },
  feedback: {
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    backgroundColor: '#FFF5E7'
  },
  feedbackText: { fontSize: 14, fontWeight: '900', textAlign: 'center', color: '#92400E' },
  next: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#2563EB'
  },
  nextText: { fontSize: 12, fontWeight: '900', color: '#FFF' },
  empty: { padding: 28, gap: 11, alignItems: 'center', borderRadius: 24, backgroundColor: '#FFF' },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 19, fontWeight: '900', textAlign: 'center', color: '#172554' },
  finish: { padding: 30, gap: 13, alignItems: 'center', borderRadius: 28, backgroundColor: '#FFF' },
  finishEmoji: { fontSize: 54 },
  finishTitle: { fontSize: 25, fontWeight: '900', color: '#172554' },
  finishScore: { fontSize: 18, fontWeight: '900', color: '#2563EB' },
  primary: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#2563EB'
  },
  primaryText: { fontSize: 14, fontWeight: '900', color: '#FFF' }
});
