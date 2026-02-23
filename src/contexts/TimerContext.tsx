import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SessionType = 'work' | 'shortBreak' | 'longBreak';

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  currentSession: SessionType;
  sessionCount: number;
}

interface TimerContextType extends TimerState {
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
  vibrationEnabled: true,
  theme: 'dark',
};

interface Settings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'dark' | 'light';
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionType>('work');
  const [sessionCount, setSessionCount] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSettings();
    requestNotificationPermissions();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('pomodoro-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed, theme: (parsed.theme || "dark") as "dark" | "light" });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
    }
  };

  const sendNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  };

  const playSound = async () => {
    if (settings.soundEnabled) {
      // Sound will be added once audio file is in place
      console.log('Sound notification');
    }
  };

  const triggerHaptic = async () => {
    if (settings.vibrationEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const getSessionDuration = (session: SessionType): number => {
    switch (session) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  };

  const handleSessionComplete = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);

    await playSound();
    await triggerHaptic();

    if (currentSession === 'work') {
      await sendNotification('Time for a break!', 'Great work! Take a break now.');
      if (sessionCount >= settings.sessionsUntilLongBreak) {
        setCurrentSession('longBreak');
        setTimeRemaining(settings.longBreakDuration * 60);
        setSessionCount(1);
      } else {
        setCurrentSession('shortBreak');
        setTimeRemaining(settings.shortBreakDuration * 60);
      }
    } else {
      await sendNotification('Ready to focus!', 'Break is over. Time to work!');
      setCurrentSession('work');
      setTimeRemaining(settings.workDuration * 60);
      if (currentSession !== 'longBreak') {
        setSessionCount(prev => prev + 1);
      }
    }
  }, [currentSession, sessionCount, settings]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, handleSessionComplete]);

  const startTimer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(true);
  };

  const pauseTimer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
  };

  const resetTimer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(false);
    setTimeRemaining(getSessionDuration(currentSession));
  };

  const skipSession = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentSession === 'work') {
      if (sessionCount >= settings.sessionsUntilLongBreak) {
        setCurrentSession('longBreak');
        setTimeRemaining(settings.longBreakDuration * 60);
        setSessionCount(1);
      } else {
        setCurrentSession('shortBreak');
        setTimeRemaining(settings.shortBreakDuration * 60);
      }
    } else {
      setCurrentSession('work');
      setTimeRemaining(settings.workDuration * 60);
      if (currentSession === 'shortBreak') {
        setSessionCount(prev => prev + 1);
      }
    }
    setIsRunning(false);
  };

  return (
    <TimerContext.Provider
      value={{
        timeRemaining,
        isRunning,
        currentSession,
        sessionCount,
        startTimer,
        pauseTimer,
        resetTimer,
        skipSession,
      }}
    >
      <SettingsContext.Provider
        value={{
          settings,
          updateSettings: async (newSettings) => {
            const updated = { ...settings, ...newSettings, theme: (newSettings.theme || settings.theme) as "dark" | "light" };
            setSettings(updated);
            await AsyncStorage.setItem('pomodoro-settings', JSON.stringify(updated));
          },
          resetSettings: async () => {
            setSettings(DEFAULT_SETTINGS);
            await AsyncStorage.setItem('pomodoro-settings', JSON.stringify(DEFAULT_SETTINGS));
          },
        }}
      >
        {children}
      </SettingsContext.Provider>
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within TimerProvider');
  }
  return context;
}
