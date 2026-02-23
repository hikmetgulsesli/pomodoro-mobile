import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TimerProvider } from '../src/contexts/TimerContext';

export default function RootLayout() {
  return (
    <TimerProvider>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </TimerProvider>
  );
}
