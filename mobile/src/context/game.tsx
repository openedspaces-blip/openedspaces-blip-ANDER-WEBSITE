import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'andergo.game.v1';

export type GameState = {
  xp: number;
  coins: number;
  streak: number;
  hearts: number;
  lessons: number;
  dailyGoal: number;
  lastPractice: string | null;
};

const initialState: GameState = {
  xp: 120,
  coins: 45,
  streak: 3,
  hearts: 5,
  lessons: 6,
  dailyGoal: 1,
  lastPractice: null,
};

type GameContextValue = GameState & {
  ready: boolean;
  finishLesson: (correctAnswers: number, total: number) => void;
  loseHeart: () => void;
  refillHearts: () => void;
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
      const earnedXp = correctAnswers * 10 + (correctAnswers === total ? 20 : 0);
      setState((current) => ({
        ...current,
        xp: current.xp + earnedXp,
        coins: current.coins + correctAnswers * 2,
        lessons: current.lessons + 1,
        dailyGoal: Math.min(3, current.dailyGoal + 1),
        lastPractice: today,
        hearts: Math.min(5, current.hearts + 1),
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
  }), [ready, state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used inside GameProvider');
  return context;
}
