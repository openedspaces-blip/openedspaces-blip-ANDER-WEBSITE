import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { GameProvider } from '@/context/game';
import { AuthProvider } from '@/context/auth';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider><GameProvider>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="explore" />
  <Stack.Screen name="lesson" />
  <Stack.Screen name="tutor" />
  <Stack.Screen name="game" />
  <Stack.Screen name="account" />
  <Stack.Screen name="library" />
        </Stack>
      </GameProvider></AuthProvider>
    </ThemeProvider>
  );
}
