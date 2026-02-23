import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { colors, ThemeMode, ColorScheme } from '../constants/theme';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: ColorScheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  
  const isDark = mode === 'system' 
    ? systemColorScheme === 'dark' 
    : mode === 'dark';
  
  const themeColors = isDark ? colors.dark : colors.light;
  
  const toggleTheme = () => {
    setMode(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      return 'dark';
    });
  };
  
  // Persist theme preference
  useEffect(() => {
    // Could add AsyncStorage persistence here
  }, [mode]);
  
  return (
    <ThemeContext.Provider 
      value={{ 
        mode, 
        setMode, 
        isDark, 
        colors: themeColors,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
