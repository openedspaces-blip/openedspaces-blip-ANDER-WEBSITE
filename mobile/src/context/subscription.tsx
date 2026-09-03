import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/auth';

const API = 'https://andergo.online';
type Plan = { slug?: string; name?: string };
type Subscription = { plan?: Plan; status?: string; isPremium?: boolean; expiresAt?: string } | null;
type Value = { ready: boolean; subscription: Subscription; isPremium: boolean; refresh: () => Promise<void> };
const Context = createContext<Value | null>(null);

export function SubscriptionProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(async () => {
    if (!accessToken) { setSubscription(null); setReady(true); return; }
    setReady(false);
    try {
      const response = await fetch(`${API}/api/subscription`, { headers: { Authorization: `Bearer ${accessToken}` } });
      setSubscription(response.ok ? await response.json() as Subscription : null);
    } catch { setSubscription(null); }
    finally { setReady(true); }
  }, [accessToken]);
  useEffect(() => { void refresh(); }, [refresh]);
  const value = useMemo(() => ({ ready, subscription, isPremium: Boolean(subscription?.isPremium || subscription?.plan?.slug === 'premium'), refresh }), [ready, subscription, refresh]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSubscription() {
  const value = useContext(Context);
  if (!value) throw new Error('useSubscription must be inside SubscriptionProvider');
  return value;
}
