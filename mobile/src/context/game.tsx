import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'andergo.game.v1';

export type GameState = {
  targetLanguage: 'english' | 'french' | 'spanish';
  xp: number;
  coins: number;
  streak: number;
  hearts: number;
  lessons: number;
  dailyGoal: number;
  lastPractice: string | null;
  bestScore: number;
  perfectLessons: number;
};

const initialState: GameState = {
  targetLanguage: 'english',
  xp: 0,
  coins: 20,
  streak: 0,
  hearts: 5,
  lessons: 0,
  dailyGoal: 0,
  lastPractice: null,
  bestScore: 0,
  perfectLessons: 0,
};

type GameContextValue = GameState & {
  ready: boolean;
  finishLesson: (correctAnswers: number, total: number) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  setTargetLanguage: (language: GameState['targetLanguage']) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => value && setState({ ...initialState, ...JSON.parse(value) }))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const value = useMemo<GameContextValue>(() => ({
    ...state,
    ready,
    finishLesson(correctAnswers, total) {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const earnedXp = correctAnswers * 10 + (correctAnswers === total ? 20 : 0);
      const score = Math.round((correctAnswers / total) * 100);
      setState((current) => ({
        ...current,
        xp: current.xp + earnedXp,
        coins: current.coins + correctAnswers * 2,
        lessons: current.lessons + 1,
        dailyGoal: current.lastPractice === today ? Math.min(3, current.dailyGoal + 1) : 1,
        lastPractice: today,
        hearts: Math.min(5, current.hearts + 1),
        streak: current.lastPractice === today
          ? current.streak
          : current.lastPractice === yesterday
            ? current.streak + 1
            : 1,
        bestScore: Math.max(current.bestScore, score),
        perfectLessons: current.perfectLessons + (correctAnswers === total ? 1 : 0),
      }));
    },
    loseHeart() {
      setState((current) => ({ ...current, hearts: Math.max(0, current.hearts - 1) }));
    },
    refillHearts() {
      setState((current) => current.coins >= 20
        ? { ...current, coins: current.coins - 20, hearts: 5 }
        : current);
    },
    setTargetLanguage(targetLanguage) {
      setState((current) => ({ ...current, targetLanguage }));
    },
  }), [ready, state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used inside GameProvider');
  return context;
}
