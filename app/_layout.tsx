import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TimerProvider } from '../src/contexts/TimerContext';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';

function RootLayoutNav() {
  const { isDark } = useTheme();
  
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TimerProvider>
        <RootLayoutNav />
      </TimerProvider>
    </ThemeProvider>
  );
}
