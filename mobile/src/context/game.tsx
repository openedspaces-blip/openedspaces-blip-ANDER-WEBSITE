import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'andergo.learning-preferences.v1';

export type TargetLanguage = 'english' | 'french' | 'spanish' | 'italian' | 'portuguese' | 'german';

const TARGET_LANGUAGES: TargetLanguage[] = ['english', 'french', 'spanish', 'italian', 'portuguese', 'german'];

type LearningPreferences = {
  targetLanguage: TargetLanguage;
};

type LearningContextValue = LearningPreferences & {
  ready: boolean;
  setTargetLanguage: (language: TargetLanguage) => void;
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
          setState({ targetLanguage: saved.targetLanguage as TargetLanguage });
        }
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const value = useMemo<LearningContextValue>(() => ({
    ...state,
    ready,
    setTargetLanguage(targetLanguage) {
      setState({ targetLanguage });
    },
  }), [ready, state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used inside GameProvider');
  return context;
}
