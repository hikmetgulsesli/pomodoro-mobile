// Design tokens for Pomodoro Timer app
// Following design-standards.md: Sora (headings), Nunito Sans (body)

export const colors = {
  // Dark theme (default)
  dark: {
    // Primary palette - Monitoring/Status
    primary: '#10b981',      // Emerald - for active states
    primaryDark: '#059669',
    accent: '#f43f5e',       // Rose - for important actions
    accentDark: '#e11d48',

    // Surface colors
    background: '#111827',  // Gray 900 - dark surface
    surface: '#1f2937',     // Gray 800
    surfaceAlt: '#374151',  // Gray 700
    border: '#4b5563',     // Gray 600

    // Text colors
    text: '#f9fafb',        // Gray 50
    textMuted: '#9ca3af',   // Gray 400
    textSubtle: '#6b7280',  // Gray 500

    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Timer specific
    timerWork: '#10b981',     // Emerald for work
    timerShortBreak: '#3b82f6', // Blue for short break
    timerLongBreak: '#8b5cf6',  // Purple for long break
  },

  // Light theme
  light: {
    // Primary palette - Monitoring/Status
    primary: '#10b981',      // Emerald - for active states
    primaryDark: '#059669',
    accent: '#f43f5e',       // Rose - for important actions
    accentDark: '#e11d48',

    // Surface colors
    background: '#f9fafb',  // Gray 50
    surface: '#ffffff',     // White
    surfaceAlt: '#f3f4f6',  // Gray 100
    border: '#e5e7eb',      // Gray 200

    // Text colors
    text: '#111827',        // Gray 900
    textMuted: '#6b7280',   // Gray 500
    textSubtle: '#9ca3af',  // Gray 400

    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Timer specific
    timerWork: '#10b981',     // Emerald for work
    timerShortBreak: '#3b82f6', // Blue for short break
    timerLongBreak: '#8b5cf6',  // Purple for long break
  },
};

export const typography = {
  // Font families (loaded via expo-google-fonts)
  heading: 'Sora',
  body: 'NunitoSans',

  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Default timer durations (in minutes)
export const timerDefaults = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
};

export type ThemeMode = 'dark' | 'light' | 'system';

// Full color scheme with all properties merged
export interface ColorScheme {
  // Primary palette
  primary: string;
  primaryDark: string;
  accent: string;
  accentDark: string;

  // Surface colors
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;

  // Text colors
  text: string;
  textMuted: string;
  textSubtle: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Timer specific
  timerWork: string;
  timerShortBreak: string;
  timerLongBreak: string;
}
