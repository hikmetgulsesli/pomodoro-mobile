import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SessionRecord = {
  id: string;
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
  completedAt: string;
  status: 'completed' | 'skipped';
};

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('pomodoro-history');
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('pomodoro-history');
            setSessions([]);
          },
        },
      ]
    );
  };

  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.completedAt);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const todayFocusTime = todaySessions
    .filter(s => s.type === 'work' && s.status === 'completed')
    .reduce((acc, s) => acc + s.duration, 0);

  const todayCompletedSessions = todaySessions.filter(
    s => s.type === 'work' && s.status === 'completed'
  ).length;

  const formatDuration = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSessionLabel = (type: string): string => {
    switch (type) {
      case 'work': return 'Work';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return type;
    }
  };

  const getStatusColor = (status: string): string => {
    return status === 'completed' ? '#10B981' : '#F59E0B';
  };

  const renderSession = ({ item }: { item: SessionRecord }) => (
    <View style={styles.sessionItem}>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionType}>{getSessionLabel(item.type)}</Text>
        <Text style={styles.sessionDate}>
          {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <View style={styles.sessionRight}>
        <Text style={styles.sessionDuration}>{formatDuration(item.duration)}</Text>
        <Text style={[styles.sessionStatus, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Today</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatDuration(todayFocusTime)}</Text>
            <Text style={styles.statLabel}>Focus Time</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{todayCompletedSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>History</Text>
        {sessions.length > 0 && (
          <TouchableOpacity onPress={clearHistory}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={sessions.slice().reverse()}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No sessions yet. Start your first Pomodoro!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  summary: {
    backgroundColor: '#252542',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#e94560',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    color: '#e94560',
    fontSize: 14,
  },
  sessionItem: {
    backgroundColor: '#252542',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  sessionDuration: {
    color: '#fff',
    fontSize: 14,
  },
  sessionStatus: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
});
