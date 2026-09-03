import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router, useRootNavigationState, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { GameProvider } from '@/context/game';
import { AuthProvider, useAuth } from '@/context/auth';
import { SubscriptionProvider } from '@/context/subscription';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider><SubscriptionProvider><GameProvider>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
  <Stack.Screen name="tutor" />
  <Stack.Screen name="account" />
  <Stack.Screen name="library" />
  <Stack.Screen name="activity" />
  <Stack.Screen name="translator" />
  <Stack.Screen name="platform" />
        </Stack>
        <AuthGate />
      </GameProvider></SubscriptionProvider></AuthProvider>
    </ThemeProvider>
  );
}

function AuthGate() {
  const { ready, session } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [redirecting, setRedirecting] = useState(false);
  const onAccount = segments[0] === 'account';
  useEffect(() => {
    if (!ready || !navigationState?.key) return;
    if (!session && !onAccount) {
      setRedirecting(true);
      router.replace('/account');
      return;
    }
    setRedirecting(false);
  }, [ready, session, onAccount, navigationState?.key]);
  if (!ready || redirecting) return <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F8FD', zIndex: 50 }}><ActivityIndicator color="#2563EB" /></View>;
  return null;
}
