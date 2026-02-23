import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useTimer, useSettings } from '../../src/contexts/TimerContext';

type SessionType = 'work' | 'shortBreak' | 'longBreak';

const SESSION_LABELS: Record<SessionType, string> = {
  work: 'Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

const SESSION_COLORS: Record<SessionType, string> = {
  work: '#e94560',
  shortBreak: '#10B981',
  longBreak: '#3B82F6',
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
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
      Animated.loop(
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
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sessionLabel, { color: SESSION_COLORS[currentSession] }]}>
          {SESSION_LABELS[currentSession]}
        </Text>
        <Text style={styles.sessionCounter}>
          Session {(sessionCount % 4) || 4} of 4
        </Text>
      </View>

      <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.circleBackground}>
          <View style={[styles.progressCircle, { borderColor: SESSION_COLORS[currentSession] }]} />
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
            <Text style={styles.smallButtonText}>RESET</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={skipSession}
          >
            <Text style={styles.smallButtonText}>SKIP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
  },
  sessionCounter: {
    fontSize: 16,
    color: '#666',
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
    borderColor: '#333',
  },
  progressCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 10,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
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
    backgroundColor: '#e94560',
  },
  pauseButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
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
    backgroundColor: '#333',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
