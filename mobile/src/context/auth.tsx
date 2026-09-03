import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, Session as SupabaseSession } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = 'https://kdfzpqqyklqxprcweuqu.supabase.co';
const KEY = 'sb_publishable_V6eyM6swE72C5UmPs9KKOg_hKtpRbwZ';
const STORE = 'andergo.session.v1';

// Expo Router renders the web bundle once on the server. AsyncStorage's web
// adapter expects `window`, so keep that server pass in memory and switch back
// to persistent storage as soon as the app runs in a browser or on mobile.
const serverStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {},
};
const authStorage = typeof window === 'undefined' ? serverStorage : AsyncStorage;

WebBrowser.maybeCompleteAuthSession();

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    lock: processLock,
  },
});

type Session = { access_token: string; email: string; userId: string; displayName: string; avatarEmoji: string };
type Provider = 'google' | 'facebook';
type Auth = {
  ready: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<boolean>;
  signUp: (displayName: string, email: string, password: string) => Promise<'signed-in' | 'confirmation-required'>;
  signOut: () => Promise<void>;
  updateAvatarEmoji: (emoji: string) => Promise<void>;
};
const Context = createContext<Auth | null>(null);

function toAppSession(session: SupabaseSession): Session {
  const user = session.user;
  const metadata = user.user_metadata || {};
  return {
    access_token: session.access_token,
    email: user.email || '',
    userId: user.id,
    displayName: metadata.display_name || metadata.full_name || metadata.name || user.email?.split('@')[0] || 'Estudiante',
    avatarEmoji: metadata.avatar_emoji || '🙂',
  };
}

function providerLabel(provider: Provider) {
  return provider === 'facebook' ? 'Facebook' : 'Google';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const save = async (next: SupabaseSession | null) => {
    const appSession = next ? toAppSession(next) : null;
    setSession(appSession);
    if (appSession) await AsyncStorage.setItem(STORE, JSON.stringify(appSession));
    else await AsyncStorage.removeItem(STORE);
  };

  useEffect(() => {
    let active = true;
    const restore = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (active) await save(data.session);
      } catch {
        // A corrupt or expired local token must never leave the mobile app
        // blocked on its splash/auth gate. Supabase will renew it on next sign-in.
        if (active) await save(null);
      } finally {
        if (active) setReady(true);
      }
    };
    void restore();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) void save(next);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<Auth>(
    () => ({
      ready,
      session,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signInWithProvider(provider) {
        // This exact deep link must be included in Supabase Auth's Redirect URLs.
        // It returns to this installed app after Google/Facebook, where the PKCE
        // code is exchanged and persisted by the same Supabase client.
        const redirectTo = Linking.createURL('auth/callback');
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error || !data.url) throw error || new Error(`No pudimos abrir ${providerLabel(provider)}.`);

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        // A cancelled provider sheet is a normal outcome. Keep the learner on
        // the native account screen instead of routing to an unauthenticated
        // home screen and immediately bouncing back.
        if (result.type === 'cancel' || result.type === 'dismiss') return false;
        if (result.type !== 'success') throw new Error(`No pudimos completar el acceso con ${providerLabel(provider)}.`);

        const callback = new URL(result.url);
        const providerError = callback.searchParams.get('error_description') || callback.searchParams.get('error');
        if (providerError) throw new Error(providerError);
        const code = callback.searchParams.get('code');
        if (!code) throw new Error(`No recibimos una sesión de ${providerLabel(provider)}.`);

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
        return true;
      },
      async signUp(displayName, email, password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        if (error) throw error;
        if (!data.session) return 'confirmation-required';
        return 'signed-in';
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        await save(null);
        if (error) throw error;
      },
      async updateAvatarEmoji(emoji) {
        const { data, error } = await supabase.auth.updateUser({ data: { avatar_emoji: emoji } });
        if (error) throw error;
        const { data: refreshed } = await supabase.auth.getSession();
        if (data.user && refreshed.session) await save(refreshed.session);
      },
    }),
    [ready, session],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error('useAuth must be inside AuthProvider');
  return value;
}
