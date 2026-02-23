import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useTimer, useSettings } from '../../src/contexts/TimerContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type SessionType = 'work' | 'shortBreak' | 'longBreak';

const SESSION_LABELS: Record<SessionType, string> = {
  work: 'Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

export default function TimerScreen() {
  const {
    timeRemaining,
    isRunning,
    currentSession,
    sessionCount,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession
  } = useTimer();

  const { settings } = useSettings();
  const { colors } = useTheme();
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const getSessionColor = (): string => {
    switch (currentSession) {
      case 'work':
        return colors.timerWork;
      case 'shortBreak':
        return colors.timerShortBreak;
      case 'longBreak':
        return colors.timerLongBreak;
    }
  };

  const getTotalTime = (): number => {
    switch (currentSession) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  };

  const totalTime = getTotalTime();
  const progress = timeRemaining / totalTime;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [progress]);

  useEffect(() => {
    if (isRunning) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimRef.current = animation;
      animation.start();
    } else {
      if (pulseAnimRef.current) {
        pulseAnimRef.current.stop();
        pulseAnimRef.current = null;
      }
      pulseAnim.setValue(1);
    }

    return () => {
      if (pulseAnimRef.current) {
        pulseAnimRef.current.stop();
        pulseAnimRef.current = null;
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sessionColor = getSessionColor();
  const sessionsTotal = settings.sessionsUntilLongBreak;
  const currentSessionNum = (sessionCount % sessionsTotal) || sessionsTotal;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    sessionLabel: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      color: sessionColor,
    },
    sessionCounter: {
      fontSize: 16,
      color: colors.textMuted,
    },
    timerContainer: {
      width: 300,
      height: 300,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 40,
    },
    circleBackground: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      borderWidth: 10,
      borderColor: colors.surfaceAlt,
    },
    progressCircle: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      borderWidth: 10,
      borderColor: sessionColor,
    },
    timerText: {
      fontSize: 64,
      fontWeight: 'bold',
      color: colors.text,
    },
    controls: {
      alignItems: 'center',
      gap: 20,
    },
    button: {
      paddingVertical: 20,
      paddingHorizontal: 60,
      borderRadius: 50,
      minWidth: 200,
      alignItems: 'center',
    },
    startButton: {
      backgroundColor: sessionColor,
    },
    pauseButton: {
      backgroundColor: colors.surfaceAlt,
    },
    buttonText: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
    },
    secondaryControls: {
      flexDirection: 'row',
      gap: 20,
    },
    smallButton: {
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    smallButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sessionLabel}>
          {SESSION_LABELS[currentSession]}
        </Text>
        <Text style={styles.sessionCounter}>
          Session {currentSessionNum} of {sessionsTotal}
        </Text>
      </View>

      <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.circleBackground}>
          <View style={styles.progressCircle} />
        </View>
        <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
      </Animated.View>

      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={startTimer}
          >
            <Text style={styles.buttonText}>START</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.pauseButton]}
            onPress={pauseTimer}
          >
            <Text style={styles.buttonText}>PAUSE</Text>
          </TouchableOpacity>
        )}

        <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={resetTimer}
          >
            <MaterialCommunityIcons name="restart" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={skipSession}
          >
            <MaterialCommunityIcons name="skip-next" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
