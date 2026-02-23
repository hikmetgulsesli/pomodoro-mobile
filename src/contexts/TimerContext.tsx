import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Session record type for history
export type SessionRecord = {
  id: string;
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
  completedAt: string;
  status: 'completed' | 'skipped';
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationListenerRef = useRef<Notifications.Subscription | null>(null);
  const responseListenerRef = useRef<Notifications.Subscription | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Initialize notification channel and permissions
  useEffect(() => {
    initializeNotifications();
    
    return () => {
      if (notificationListenerRef.current) {
        Notifications.removeNotificationSubscription(notificationListenerRef.current);
      }
      if (responseListenerRef.current) {
        Notifications.removeNotificationSubscription(responseListenerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      unloadSound();
    };
  }, []);

  const initializeNotifications = async () => {
    // Configure Android notification channel
    await Notifications.setNotificationChannelAsync('pomodoro-timer', {
      name: 'Pomodoro Timer',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
      sound: 'default',
    });
    
    // Request permissions
    await requestNotificationPermissions();
    
    // Handle notification tap to bring app to foreground
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Notification was tapped - app will automatically come to foreground
      console.log('Notification tapped:', response.notification.request.content.title);
    });
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
    }
  };

  // Load and play sound
  const playSound = async () => {
    if (!settings.soundEnabled) return;
    
    try {
      // Unload previous sound if exists
      await unloadSound();
      
      // Create and play new sound
      const { sound } = await Audio.Sound.createAsync(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../../assets/sounds/timer-complete.mp3'),
        { shouldPlay: true, volume: 1.0 }
      );
      soundRef.current = sound;
      
      // Cleanup after playing
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          unloadSound();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
      // Fallback: try system notification sound
      try {
        await Notifications.scheduleNotificationAsync({
          content: { title: 'Timer Complete', body: 'Timer finished' },
          trigger: null,
        });
      } catch (e) {
        console.log('Fallback notification failed:', e);
      }
    }
  };

  const unloadSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {
        // Ignore unload errors
      }
      soundRef.current = null;
    }
  };

  const triggerHaptic = async () => {
    if (settings.vibrationEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const sendNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { sessionType: currentSession },
      },
      trigger: null,
    });
  };

  // Save session to history
  const saveSession = async (type: SessionType, duration: number, status: 'completed' | 'skipped') => {
    try {
      const session: SessionRecord = {
        id: Date.now().toString(),
        type,
        duration,
        completedAt: new Date().toISOString(),
        status,
      };
      
      const stored = await AsyncStorage.getItem('pomodoro-history');
      const sessions: SessionRecord[] = stored ? JSON.parse(stored) : [];
      sessions.push(session);
      
      await AsyncStorage.setItem('pomodoro-history', JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save session:', e);
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

    // Get the session duration before changing state
    const durationMinutes = Math.floor(getSessionDuration(currentSession) / 60);

    // Play sound and trigger haptic
    await playSound();
    await triggerHaptic();

    // Save session to history
    await saveSession(currentSession, durationMinutes, 'completed');

    // Send notification based on session type
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

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('pomodoro-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed, theme: (parsed.theme || 'dark') as 'dark' | 'light' });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  // Timer countdown effect
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
    
    // Get the session duration before changing state
    const durationMinutes = Math.floor(getSessionDuration(currentSession) / 60);
    
    // Save skipped session
    await saveSession(currentSession, durationMinutes, 'skipped');
    
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
            const updated = { ...settings, ...newSettings, theme: (newSettings.theme || settings.theme) as 'dark' | 'light' };
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
