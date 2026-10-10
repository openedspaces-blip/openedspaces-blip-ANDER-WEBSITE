import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'andergo.learning-preferences.v1';

/** ANDERGO Play teaches English and French from Spanish through A1–A2 play. */
export type TargetLanguage = 'english' | 'french';

const TARGET_LANGUAGES: TargetLanguage[] = ['english', 'french'];

type LearningPreferences = {
  targetLanguage: TargetLanguage;
  lastMission?: LastMission;
};

export type LastMission = {
  language: TargetLanguage;
  slug: string;
  lessonId: string;
  skill: 'listening' | 'speaking' | 'reading' | 'writing' | 'grammar' | 'vocabulary';
  title: string;
  level: 'A1' | 'A2';
  unitId?: string;
  unitTitle?: string;
};

type LearningContextValue = LearningPreferences & {
  ready: boolean;
  setTargetLanguage: (language: TargetLanguage) => void;
  setLastMission: (mission: LastMission) => void;
};

const initialState: LearningPreferences = { targetLanguage: 'english' };
const GameContext = createContext<LearningContextValue | null>(null);

/**
 * Compatibility name for the former mobile game context. It now stores only
 * the language preference; learning content remains in the ANDERGO platform.
 */
export function GameProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<LearningPreferences>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!value) return;
        const saved = JSON.parse(value) as Partial<LearningPreferences>;
        if (TARGET_LANGUAGES.includes(saved.targetLanguage as TargetLanguage)) {
          setState({
            targetLanguage: saved.targetLanguage as TargetLanguage,
            lastMission: saved.lastMission
          });
        } else {
          // Older installations may have saved an unavailable language.
          // Keep Play inside its three intentional worlds.
          setState(initialState);
        }
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const value = useMemo<LearningContextValue>(
    () => ({
      ...state,
      ready,
      setTargetLanguage(targetLanguage) {
        setState((current) => ({ ...current, targetLanguage }));
      },
      setLastMission(lastMission) {
        setState((current) => ({ ...current, lastMission }));
      }
    }),
    [ready, state]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used inside GameProvider');
  return context;
}
