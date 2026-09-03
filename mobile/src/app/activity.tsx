import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import {
  checkMobileAnswer,
  completeMobileLesson,
  LessonActivity,
  MobileCompletion,
  ReadingQuizQuestion,
  loadLessonActivity,
  missionForSkill
} from '@/services/curriculum';
import { useAuth } from '@/context/auth';

const LOCALES: Record<string, string> = {
  english: 'en-US',
  french: 'fr-FR',
  spanish: 'es-ES',
  italian: 'it-IT',
  portuguese: 'pt-BR',
  german: 'de-DE'
};
type Skill = 'listening' | 'speaking' | 'reading' | 'writing' | 'grammar' | 'vocabulary';

export default function ActivityScreen() {
  const params = useLocalSearchParams<{
    slug: string;
    lessonId?: string;
    language?: string;
    level?: string;
    skill?: Skill;
  }>();
  const skill = params.skill ?? 'vocabulary';
  const mission = missionForSkill(skill);
  const auth = useAuth();
  const [content, setContent] = useState<LessonActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [transcript, setTranscript] = useState(false);
  const [completion, setCompletion] = useState<MobileCompletion | null>(null);
  const [completionError, setCompletionError] = useState('');
  const [readingPlaying, setReadingPlaying] = useState(false);
  const [readingRate, setReadingRate] = useState(0.82);
  const player = useAudioPlayer(content?.officialAudioUrl || content?.audioUrl || null, {
    updateInterval: 250
  });
  const playerStatus = useAudioPlayerStatus(player);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    loadLessonActivity(
      params.slug,
      { lessonId: params.lessonId, language: params.language, level: params.level },
      auth.session?.access_token
    )
      .then((item) => {
        if (active) setContent(item);
      })
      .catch(() => {
        if (active) {
          setContent(null);
          setLoadError(
            'No pudimos descargar la lección. Comprueba tu conexión e inténtalo de nuevo.'
          );
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [
    params.slug,
    params.lessonId,
    params.language,
    params.level,
    auth.session?.access_token,
    retryKey
  ]);
  useEffect(
    () => () => {
      Speech.stop();
    },
    []
  );
  const pairs = useMemo(() => content?.pairs.slice(0, 30) ?? [], [content]);
  const readingParagraphs = useMemo(
    () =>
      content?.reading?.text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((paragraph) => paragraph.trim()) ?? [],
    [content?.reading?.text]
  );
  const audio = Boolean(content?.officialAudioUrl || content?.audioUrl);
  const speak = (text: string) => {
    const fallback =
      !audio && skill === 'listening' && text === content?.title
        ? content.transcript || content.reading?.text || text
        : text;
    Speech.stop();
    Speech.speak(fallback, {
      language: LOCALES[params.language ?? 'english'] ?? 'en-US',
      rate: 0.82
    });
  };
  const stopReading = () => {
    Speech.stop();
    setReadingPlaying(false);
  };
  const speakReading = (text: string) => {
    if (!text) return;
    Speech.stop();
    setReadingPlaying(true);
    Speech.speak(text, {
      language: LOCALES[params.language ?? 'english'] ?? 'en-US',
      rate: readingRate,
      onDone: () => setReadingPlaying(false),
      onStopped: () => setReadingPlaying(false),
      onError: () => setReadingPlaying(false)
    });
  };
  const cycleReadingRate = () =>
    setReadingRate((current) => (current >= 1.1 ? 0.72 : current >= 0.9 ? 1.1 : 0.9));
  const formatTime = (seconds: number) => {
    const value = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  };
  const seek = (offset: number) =>
    player.seekTo(
      Math.max(0, Math.min(playerStatus.duration || 0, playerStatus.currentTime + offset))
    );
  const cycleRate = () => {
    const next =
      playerStatus.playbackRate >= 1.25 ? 0.8 : playerStatus.playbackRate >= 1 ? 1.25 : 1;
    player.setPlaybackRate(next);
  };
  const saveAssessment = async (answers: { exerciseId: string; selectedOptionId: string }[]) => {
    if (!auth.session?.access_token) {
      setCompletionError('Inicia sesión para guardar tu nota, puntos y racha.');
      return;
    }
    try {
      setCompletionError('');
      setCompletion(await completeMobileLesson(params.slug, answers, auth.session.access_token));
    } catch (error) {
      setCompletionError(
        error instanceof Error ? error.message : 'No se pudo guardar esta evaluación.'
      );
    }
  };
  const checkAnswer = async (exerciseId: string, selectedOptionId: string) => {
    if (!auth.session?.access_token) throw new Error('Inicia sesión para comprobar tu respuesta.');
    return checkMobileAnswer(params.slug, exerciseId, selectedOptionId, auth.session.access_token);
  };
  if (loading)
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <ThemedText style={s.muted}>Abriendo la lección de ANDERGO…</ThemedText>
        </View>
      </SafeAreaView>
    );
  if (!content)
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ThemedText style={s.emptyEmoji}>⚠️</ThemedText>
          <ThemedText style={s.emptyTitle}>No pudimos abrir esta lección</ThemedText>
          <ThemedText style={s.muted}>
            {loadError || 'Comprueba tu conexión e inténtalo de nuevo.'}
          </ThemedText>
          <View style={s.emptyActions}>
            <Pressable onPress={() => setRetryKey((value) => value + 1)} style={s.secondary}>
              <ThemedText style={s.secondaryText}>Reintentar</ThemedText>
            </Pressable>
            <Pressable onPress={() => router.back()} style={s.backToLibrary}>
              <ThemedText style={s.backToLibraryText}>Biblioteca</ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.top}>
          <Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={s.back}>
            <ThemedText style={s.backText}>‹</ThemedText>
          </Pressable>
          <View style={s.topCopy}>
            <ThemedText style={s.kicker}>
              {mission.icon} {mission.label.toUpperCase()} · LECCIÓN ANDERGO
            </ThemedText>
            <ThemedText numberOfLines={2} style={s.title}>
              {content.title}
            </ThemedText>
          </View>
        </View>
        {content.mission ? (
          <View style={s.mission}>
            <ThemedText style={s.missionLabel}>OBJETIVO</ThemedText>
            <ThemedText style={s.missionText}>{content.mission}</ThemedText>
          </View>
        ) : null}
        {skill === 'listening' || audio ? (
          <View style={s.audio}>
            <View style={s.audioHead}>
              <View>
                <ThemedText style={s.audioEyebrow}>
                  {content.officialAudioUrl ? 'AUDIO OFICIAL DE ANDERGO' : 'AUDIO DE LA LECCIÓN'}
                </ThemedText>
                <ThemedText style={s.audioTitle}>
                  {skill === 'listening' ? 'Escucha antes de leer' : 'Escucha la pronunciación'}
                </ThemedText>
              </View>
              <View style={s.audioBadge}>
                <ThemedText style={s.audioBadgeText}>🎧</ThemedText>
              </View>
            </View>
            {audio ? (
              <>
                <View style={s.audioTrack}>
                  <View
                    style={[
                      s.audioTrackFill,
                      {
                        width: `${Math.min(100, ((playerStatus.currentTime || 0) / Math.max(playerStatus.duration || 1, 1)) * 100)}%`
                      }
                    ]}
                  />
                </View>
                <View style={s.audioTimes}>
                  <ThemedText style={s.audioTime}>
                    {formatTime(playerStatus.currentTime)}
                  </ThemedText>
                  <ThemedText style={s.audioTime}>{formatTime(playerStatus.duration)}</ThemedText>
                </View>
                <View style={s.audioControls}>
                  <Pressable
                    accessibilityLabel="Retroceder 10 segundos"
                    onPress={() => seek(-10)}
                    style={s.audioUtility}
                  >
                    <ThemedText style={s.audioUtilityText}>↺10</ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={playerStatus.playing ? 'Pausar audio' : 'Reproducir audio'}
                    onPress={() => (playerStatus.playing ? player.pause() : player.play())}
                    style={s.audioPlay}
                  >
                    <ThemedText style={s.audioPlayText}>
                      {playerStatus.playing ? 'Ⅱ' : '▶'}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Adelantar 10 segundos"
                    onPress={() => seek(10)}
                    style={s.audioUtility}
                  >
                    <ThemedText style={s.audioUtilityText}>10↻</ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Cambiar velocidad"
                    onPress={cycleRate}
                    style={s.audioRate}
                  >
                    <ThemedText style={s.audioRateText}>
                      {playerStatus.playbackRate.toFixed(2).replace('.00', '')}×
                    </ThemedText>
                  </Pressable>
                </View>
              </>
            ) : (
              <Pressable onPress={() => speak(content.title)} style={s.audioFallback}>
                <ThemedText style={s.audioFallbackText}>▶ Escuchar con TTS</ThemedText>
              </Pressable>
            )}
            {content.transcript ? (
              <Pressable
                onPress={() => setTranscript((value) => !value)}
                style={s.transcriptButton}
              >
                <ThemedText style={s.transcriptToggle}>
                  {transcript ? 'Ocultar transcripción' : 'Ver transcripción'}
                </ThemedText>
              </Pressable>
            ) : null}
            {transcript && content.transcript ? (
              <ThemedText style={s.transcript}>{content.transcript}</ThemedText>
            ) : null}
          </View>
        ) : null}
        {content.reading ? (
          <View style={s.reading}>
            <ThemedText style={s.sectionKicker}>LECTURA</ThemedText>
            <ThemedText style={s.readingTitle}>{content.reading.title}</ThemedText>
            <View style={s.readingPlayer}>
              <View style={s.readingPlayerStars}>
                <ThemedText>✦</ThemedText>
                <ThemedText>☁️</ThemedText>
                <ThemedText>✦</ThemedText>
              </View>
              <View style={s.readingPlayerHead}>
                <View>
                  <ThemedText style={s.readingPlayerKicker}>CUENTACUENTOS ANDERGO</ThemedText>
                  <ThemedText style={s.readingPlayerTitle}>Escucha toda la aventura</ThemedText>
                </View>
                <View style={s.readingMascot}>
                  <ThemedText style={s.readingMascotText}>📖</ThemedText>
                </View>
              </View>
              <ThemedText style={s.readingPlayerCopy}>
                Toca el botón y sigue cada palabra mientras la historia cobra vida.
              </ThemedText>
              <View style={s.readingProgress}>
                <View style={s.readingProgressDotActive} />
              </View>
              <View style={s.readingControls}>
                <Pressable
                  accessibilityLabel="Cambiar velocidad de lectura"
                  onPress={cycleReadingRate}
                  style={s.readingRate}
                >
                  <ThemedText style={s.readingRateText}>{readingRate}×</ThemedText>
                </Pressable>
                <Pressable
                  accessibilityLabel={
                    readingPlaying ? 'Detener lectura completa' : 'Escuchar lectura completa'
                  }
                  onPress={() =>
                    readingPlaying ? stopReading() : speakReading(content.reading!.text)
                  }
                  style={s.readingMainControl}
                >
                  <ThemedText style={s.readingMainControlText}>
                    {readingPlaying ? '■' : '▶'}
                  </ThemedText>
                </Pressable>
                <Pressable
                  accessibilityLabel="Reiniciar lectura completa"
                  onPress={() => speakReading(content.reading!.text)}
                  style={s.readingControl}
                >
                  <ThemedText style={s.readingControlText}>↺</ThemedText>
                </Pressable>
              </View>
              <ThemedText style={s.readingHint}>
                {readingPlaying
                  ? 'Leyendo la historia…'
                  : `Lista para leer · ${readingParagraphs.length || 1} partes`}
              </ThemedText>
            </View>
            {readingParagraphs.map((paragraph, index) => (
              <View key={`${index}-${paragraph.slice(0, 12)}`} style={s.readingParagraph}>
                <ThemedText style={s.readingText}>{paragraph}</ThemedText>
                <Pressable
                  accessibilityLabel={`Escuchar este fragmento como apoyo`}
                  onPress={() => speak(paragraph)}
                  style={s.readingParagraphListen}
                >
                  <ThemedText>🔊</ThemedText>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        {content.grammarNote ? (
          <View style={s.note}>
            <ThemedText style={s.sectionKicker}>IDEA CLAVE</ThemedText>
            <ThemedText style={s.noteText}>{content.grammarNote}</ThemedText>
          </View>
        ) : null}
        {pairs.length ? (
          <View style={s.vocabulary}>
            <ThemedText style={s.sectionKicker}>VOCABULARIO DE LA LECCIÓN</ThemedText>
            <ThemedText style={s.sectionTitle}>{pairs.length} palabras y expresiones</ThemedText>
            {pairs.map((pair, index) => (
              <View key={`${pair.source}-${index}`} style={s.pair}>
                <View style={s.pairCopy}>
                  <ThemedText style={s.word}>{pair.source}</ThemedText>
                  <ThemedText style={s.translation}>{pair.target}</ThemedText>
                  <ThemedText style={s.example}>
                    {pair.example || `Ejemplo práctico: ${pair.source}`}
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityLabel={`Escuchar ${pair.source}`}
                  onPress={() => speak(pair.source)}
                  style={s.speaker}
                >
                  <ThemedText>🔊</ThemedText>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        {skill === 'reading' && content.assessment.length ? (
          <ReadingChallenge
            questions={content.assessment.slice(0, 4)}
            onCheck={checkAnswer}
            onComplete={saveAssessment}
            completion={completion}
            error={completionError}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
function ReadingChallenge({
  questions,
  onCheck,
  onComplete,
  completion,
  error
}: {
  questions: ReadingQuizQuestion[];
  onCheck: (
    exerciseId: string,
    selectedOptionId: string
  ) => Promise<{ correct: boolean; correctOption?: number }>;
  onComplete: (answers: { exerciseId: string; selectedOptionId: string }[]) => Promise<void>;
  completion: MobileCompletion | null;
  error: string;
}) {
  const [started, setStarted] = useState(false);
  const [position, setPosition] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ exerciseId: string; selectedOptionId: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const done = position >= questions.length;
  const question = questions[position];
  const answer = async (index: number) => {
    if (selected !== null || checking) return;
    setChecking(true);
    setCheckError('');
    const option = question.options[index];
    try {
      const result = await onCheck(question.id, option.id);
      setSelected(index);
      setCorrect(result.correct);
      setCorrectAnswer(
        typeof result.correctOption === 'number'
          ? question.options[result.correctOption]?.text || ''
          : ''
      );
      setAnswers((current) => [
        ...current,
        { exerciseId: question.id, selectedOptionId: option.id }
      ]);
      if (result.correct) setScore((value) => value + 1);
    } catch (checkFailure) {
      setCheckError(
        checkFailure instanceof Error ? checkFailure.message : 'No se pudo comprobar la respuesta.'
      );
    } finally {
      setChecking(false);
    }
  };
  const next = () => {
    setSelected(null);
    setCorrect(null);
    setCorrectAnswer('');
    setCheckError('');
    setPosition((value) => value + 1);
  };
  if (!started)
    return (
      <View style={s.challengeIntro}>
        <View>
          <ThemedText style={s.challengeKicker}>RETO DE COMPRENSIÓN</ThemedText>
          <ThemedText style={s.challengeTitle}>
            {questions.length} preguntas con corrección
          </ThemedText>
          <ThemedText style={s.challengeCopy}>
            Selecciona una opción: verás al instante si acertaste.
          </ThemedText>
        </View>
        <Pressable onPress={() => setStarted(true)} style={s.challengeStart}>
          <ThemedText style={s.challengeStartText}>Empezar →</ThemedText>
        </Pressable>
      </View>
    );
  if (done) {
    const scoreOutOf100 = Math.round((score / questions.length) * 100);
    const feedback =
      scoreOutOf100 >= 90
        ? 'Excelente. Dominas muy bien esta habilidad.'
        : scoreOutOf100 >= 70
          ? 'Muy bien. Vas por buen camino.'
          : scoreOutOf100 >= 60
            ? 'Bueno. Repasa y vuelve a intentarlo.'
            : 'Sigue practicando: cada intento fortalece tu aprendizaje.';
    return (
      <View style={s.challengeDone}>
        <ThemedText style={s.challengeEmoji}>{scoreOutOf100 >= 90 ? '🏆' : '🎉'}</ThemedText>
        <ThemedText style={s.challengeDoneTitle}>Nota: {scoreOutOf100}/100</ThemedText>
        <ThemedText style={s.challengeDoneCopy}>{feedback}</ThemedText>
        {completion ? (
          <View style={s.savedScore}>
            <ThemedText style={s.savedScoreText}>
              ✓ Guardado · +{completion.earnedXp} XP · 🔥 {completion.streak} días
            </ThemedText>
            <ThemedText style={s.savedScoreMeta}>
              Mejor nota: {completion.bestScore}/100 · Nivel {completion.xp} XP
            </ThemedText>
          </View>
        ) : (
          <Pressable
            disabled={saving}
            onPress={async () => {
              setSaving(true);
              await onComplete(answers);
              setSaving(false);
            }}
            style={s.challengeSave}
          >
            <ThemedText style={s.challengeSaveText}>
              {saving ? 'Guardando…' : 'Guardar nota y puntos'}
            </ThemedText>
          </Pressable>
        )}
        {error ? <ThemedText style={s.challengeError}>{error}</ThemedText> : null}
        <Pressable
          onPress={() => {
            setPosition(0);
            setScore(0);
            setSelected(null);
            setAnswers([]);
          }}
          style={s.challengeAgain}
        >
          <ThemedText style={s.challengeAgainText}>Repetir reto</ThemedText>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={s.challenge}>
      <View style={s.challengeTop}>
        <View>
          <ThemedText style={s.challengeKicker}>
            PREGUNTA {position + 1} DE {questions.length}
          </ThemedText>
          <ThemedText style={s.challengePrompt}>Elige la respuesta correcta</ThemedText>
        </View>
        <ThemedText style={s.challengePoints}>✦</ThemedText>
      </View>
      <View style={s.challengeProgress}>
        {questions.map((item, index) => (
          <View key={item.id} style={[s.challengeDot, index <= position && s.challengeDotActive]} />
        ))}
      </View>
      <ThemedText style={s.challengeQuestion}>{question.prompt}</ThemedText>
      <View style={q.optionList}>
        {question.options.map((option, index) => {
          const checked = selected !== null;
          const result =
            checked &&
            (correct
              ? index === selected
                ? q.optionCorrect
                : null
              : index === selected
                ? q.optionWrong
                : null);
          return (
            <Pressable
              key={option.id}
              disabled={checked || checking}
              onPress={() => answer(index)}
              style={[q.option, result]}
            >
              <ThemedText style={[q.optionLetter, result && q.optionLetterResult]}>
                {String.fromCharCode(65 + index)}
              </ThemedText>
              <ThemedText style={[q.optionText, result && q.optionTextResult]}>
                {option.text}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      {checking ? <ThemedText style={q.checking}>Comprobando…</ThemedText> : null}
      {checkError ? <ThemedText style={q.checkError}>{checkError}</ThemedText> : null}
      {selected !== null ? (
        <View style={[q.feedback, correct ? q.feedbackGood : q.feedbackBad]}>
          <ThemedText style={q.feedbackText}>
            {correct
              ? '✓ ¡Correcto! Muy bien.'
              : correctAnswer
                ? `↳ Correcta: ${correctAnswer}`
                : '↳ Respuesta incorrecta. Revisa la lectura.'}
          </ThemedText>
          <Pressable onPress={next} style={q.nextButton}>
            <ThemedText style={q.nextText}>
              {position + 1 === questions.length ? 'Ver resultado' : 'Siguiente →'}
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const q = StyleSheet.create({
  optionList: { gap: 8 },
  option: {
    minHeight: 45,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9
  },
  optionLetter: {
    height: 24,
    width: 24,
    borderRadius: 8,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 11,
    fontWeight: '900',
    color: '#BFDBFE',
    backgroundColor: '#475569'
  },
  optionText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '700', color: '#F8FAFC' },
  optionCorrect: { backgroundColor: '#047857' },
  optionWrong: { backgroundColor: '#BE123C' },
  optionLetterResult: { backgroundColor: 'rgba(255,255,255,.2)', color: '#FFF' },
  optionTextResult: { color: '#FFF' },
  checking: { fontSize: 11, fontWeight: '800', color: '#BAE6FD' },
  checkError: { fontSize: 11, lineHeight: 16, fontWeight: '700', color: '#FCA5A5' },
  feedback: { padding: 11, borderRadius: 12, gap: 8 },
  feedbackGood: { backgroundColor: '#065F46' },
  feedbackBad: { backgroundColor: '#7F1D1D' },
  feedbackText: { fontSize: 12, lineHeight: 17, fontWeight: '800', color: '#FFF' },
  nextButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFF'
  },
  nextText: { fontSize: 11, fontWeight: '900', color: '#1D4ED8' }
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F8FD' },
  content: { padding: 20, paddingBottom: 44, gap: 15 },
  center: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 14 },
  emptyActions: { flexDirection: 'row', gap: 9 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  back: {
    height: 42,
    width: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  backText: { fontSize: 31, lineHeight: 34, color: '#2563EB' },
  topCopy: { flex: 1 },
  kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8, color: '#2563EB' },
  title: { fontSize: 23, lineHeight: 29, fontWeight: '900', color: '#172554', marginTop: 3 },
  mission: {
    padding: 15,
    borderRadius: 18,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  missionLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8, color: '#2563EB' },
  missionText: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: '#1E3A8A', marginTop: 4 },
  audio: { padding: 17, borderRadius: 24, backgroundColor: '#173F91', gap: 10 },
  audioHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  audioEyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8, color: '#67E8F9' },
  audioTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', marginTop: 3 },
  audioBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.13)'
  },
  audioBadgeText: { fontSize: 19 },
  audioTrack: {
    height: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,.26)',
    overflow: 'hidden',
    marginTop: 3
  },
  audioTrackFill: { height: '100%', borderRadius: 4, backgroundColor: '#67E8F9' },
  audioTimes: { flexDirection: 'row', justifyContent: 'space-between' },
  audioTime: { fontSize: 10, fontWeight: '800', color: '#BFDBFE' },
  audioControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11 },
  audioUtility: {
    height: 38,
    minWidth: 42,
    paddingHorizontal: 7,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.1)'
  },
  audioUtilityText: { fontSize: 11, fontWeight: '900', color: '#DBEAFE' },
  audioPlay: {
    height: 52,
    width: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  audioPlayText: { fontSize: 20, fontWeight: '900', color: '#1D4ED8' },
  audioRate: {
    height: 36,
    minWidth: 43,
    paddingHorizontal: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.15)'
  },
  audioRateText: { fontSize: 11, fontWeight: '900', color: '#FFF' },
  audioFallback: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: '#FFF'
  },
  audioFallbackText: { fontSize: 12, fontWeight: '900', color: '#1D4ED8' },
  transcriptButton: { alignSelf: 'flex-start', marginTop: 1 },
  transcriptToggle: { fontSize: 12, fontWeight: '800', color: '#BFDBFE' },
  transcript: { fontSize: 13, lineHeight: 20, color: '#E0F2FE', marginTop: 3 },
  reading: {
    padding: 18,
    borderRadius: 23,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  sectionKicker: { fontSize: 9, fontWeight: '900', letterSpacing: 0.85, color: '#2563EB' },
  readingTitle: { fontSize: 19, fontWeight: '900', color: '#172554', marginTop: 4 },
  readingPlayer: {
    marginTop: 12,
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#4730B7',
    gap: 10,
    overflow: 'hidden'
  },
  readingPlayerStars: {
    position: 'absolute',
    top: 8,
    right: 13,
    left: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    opacity: 0.8
  },
  readingPlayerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  readingPlayerKicker: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8, color: '#FDE68A' },
  readingPlayerTitle: { fontSize: 17, fontWeight: '900', color: '#FFF', marginTop: 2 },
  readingMascot: {
    height: 43,
    width: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDE68A'
  },
  readingMascotText: { fontSize: 22 },
  readingPlayerCopy: { fontSize: 12, lineHeight: 17, fontWeight: '700', color: '#E9E7FF' },
  readingProgress: {
    height: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,.26)',
    overflow: 'hidden'
  },
  readingProgressDotActive: {
    height: '100%',
    width: '100%',
    borderRadius: 6,
    backgroundColor: '#67E8F9'
  },
  readingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13
  },
  readingControl: {
    height: 42,
    width: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.16)'
  },
  readingControlDisabled: { opacity: 0.34 },
  readingControlText: { fontSize: 19, fontWeight: '900', color: '#FFF' },
  readingMainControl: {
    height: 60,
    width: 60,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDE68A',
    borderWidth: 3,
    borderColor: '#FFF'
  },
  readingMainControlText: { fontSize: 22, fontWeight: '900', color: '#3B218F' },
  readingRate: {
    height: 38,
    minWidth: 44,
    paddingHorizontal: 7,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.17)'
  },
  readingRateText: { fontSize: 11, fontWeight: '900', color: '#FFF' },
  readingPlayerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  readingPlayerLink: { fontSize: 11, fontWeight: '900', color: '#7DD3FC' },
  readingHint: { fontSize: 11, fontWeight: '800', color: '#E9E7FF', textAlign: 'center' },
  readingParagraph: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    marginTop: 12,
    paddingTop: 10
  },
  readingText: { flex: 1, fontSize: 15, lineHeight: 23, color: '#334155' },
  readingParagraphListen: {
    height: 34,
    width: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4FF'
  },
  challengeIntro: {
    marginTop: 17,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#EEF4FF',
    gap: 12
  },
  challengeKicker: { fontSize: 9, fontWeight: '900', letterSpacing: 0.9, color: '#2563EB' },
  challengeTitle: { fontSize: 16, fontWeight: '900', color: '#172554', marginTop: 3 },
  challengeCopy: { fontSize: 12, lineHeight: 17, color: '#64748B', marginTop: 3 },
  challengeStart: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2563EB'
  },
  challengeStartText: { fontSize: 12, fontWeight: '900', color: '#FFF' },
  challenge: { marginTop: 17, padding: 15, borderRadius: 20, backgroundColor: '#172554', gap: 12 },
  challengeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  challengePrompt: { fontSize: 12, color: '#BFDBFE', marginTop: 3 },
  challengePoints: {
    height: 31,
    width: 31,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 31,
    fontSize: 16,
    color: '#172554',
    backgroundColor: '#FDE68A'
  },
  challengeProgress: { flexDirection: 'row', gap: 5 },
  challengeDot: { height: 4, flex: 1, borderRadius: 3, backgroundColor: '#475569' },
  challengeDotActive: { backgroundColor: '#38BDF8' },
  challengeQuestion: { fontSize: 16, lineHeight: 23, fontWeight: '800', color: '#FFF' },
  challengeActions: { flexDirection: 'row', gap: 8 },
  challengeReview: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155'
  },
  challengeReviewText: { fontSize: 12, fontWeight: '900', color: '#E2E8F0' },
  challengeAnswer: {
    flex: 1.65,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8'
  },
  challengeAnswerText: { fontSize: 12, fontWeight: '900', color: '#082F49' },
  challengeDone: {
    marginTop: 17,
    padding: 17,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#ECFDF5'
  },
  challengeEmoji: { fontSize: 26 },
  challengeDoneTitle: { fontSize: 18, fontWeight: '900', color: '#065F46', marginTop: 3 },
  challengeDoneCopy: { fontSize: 12, color: '#047857', marginTop: 3, textAlign: 'center' },
  challengeSave: {
    marginTop: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: '#2563EB'
  },
  challengeSaveText: { fontSize: 12, fontWeight: '900', color: '#FFF' },
  savedScore: { marginTop: 11, padding: 10, borderRadius: 12, backgroundColor: '#D1FAE5' },
  savedScoreText: { fontSize: 12, fontWeight: '900', color: '#047857', textAlign: 'center' },
  savedScoreMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 3,
    textAlign: 'center'
  },
  challengeError: {
    marginTop: 9,
    fontSize: 11,
    lineHeight: 16,
    color: '#B91C1C',
    textAlign: 'center'
  },
  challengeAgain: {
    marginTop: 11,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: '#D1FAE5'
  },
  challengeAgainText: { fontSize: 12, fontWeight: '900', color: '#047857' },
  note: {
    padding: 17,
    borderRadius: 21,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  noteText: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: '#713F12', marginTop: 5 },
  vocabulary: { gap: 9 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#172554', marginTop: -4 },
  pair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  pairCopy: { flex: 1 },
  word: { fontSize: 16, fontWeight: '900', color: '#172554' },
  translation: { fontSize: 13, fontWeight: '800', color: '#2563EB', marginTop: 2 },
  example: { fontSize: 11, lineHeight: 16, color: '#64748B', marginTop: 5 },
  reveal: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
  speaker: {
    height: 36,
    width: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F0FF'
  },
  emptyEmoji: { fontSize: 46 },
  emptyTitle: { fontSize: 21, fontWeight: '900', textAlign: 'center', color: '#172554' },
  muted: { fontSize: 13, lineHeight: 19, textAlign: 'center', color: '#64748B' },
  secondary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#2563EB'
  },
  secondaryText: { fontSize: 13, fontWeight: '900', color: '#FFF' },
  backToLibrary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#E8F0FF'
  },
  backToLibraryText: { fontSize: 13, fontWeight: '900', color: '#1D4ED8' }
});
