import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../src/contexts/ThemeContext';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

type SessionRecord = {
  id: string;
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
  completedAt: string;
  status: 'completed' | 'skipped';
};

interface WeeklyData {
  day: string;
  minutes: number;
}

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const { colors } = useTheme();

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

  // Calculate weekly data
  const getWeeklyData = (): WeeklyData[] => {
    const days: WeeklyData[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayMinutes = sessions
        .filter(s => {
          const sessionDate = new Date(s.completedAt);
          return s.type === 'work' && 
                 s.status === 'completed' &&
                 sessionDate >= dayStart && 
                 sessionDate <= dayEnd;
        })
        .reduce((acc, s) => acc + s.duration, 0);
      
      days.push({ day: dayName, minutes: dayMinutes });
    }
    
    return days;
  };

  const weeklyData = getWeeklyData();
  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 60); // Minimum 60 for scale

  // Render weekly chart using react-native-svg
  const renderWeeklyChart = () => {
    const chartWidth = Dimensions.get('window').width - 80;
    const chartHeight = 120;
    const barWidth = (chartWidth - 40) / 7;
    const maxBarHeight = chartHeight - 30;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>This Week</Text>
        <Svg width={chartWidth} height={chartHeight}>
          {weeklyData.map((data, index) => {
            const barHeight = maxMinutes > 0 ? (data.minutes / maxMinutes) * maxBarHeight : 0;
            const x = index * barWidth + 10;
            const y = maxBarHeight - barHeight + 20;
            
            return (
              <React.Fragment key={index}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth - 6}
                  height={Math.max(barHeight, 2)}
                  rx={4}
                  fill={data.minutes > 0 ? colors.primary : colors.surfaceAlt}
                />
                <SvgText
                  x={x + (barWidth - 6) / 2}
                  y={chartHeight - 5}
                  fontSize={10}
                  fill={colors.textMuted}
                  textAnchor="middle"
                >
                  {data.day}
                </SvgText>
                {data.minutes > 0 && (
                  <SvgText
                    x={x + (barWidth - 6) / 2}
                    y={y - 5}
                    fontSize={8}
                    fill={colors.text}
                    textAnchor="middle"
                  >
                    {data.minutes}m
                  </SvgText>
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    );
  };

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
    return status === 'completed' ? colors.success : colors.warning;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    summary: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    summaryTitle: {
      color: colors.text,
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
      color: colors.accent,
      fontSize: 24,
      fontWeight: 'bold',
    },
    statLabel: {
      color: colors.textMuted,
      fontSize: 14,
      marginTop: 4,
    },
    chartContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
    },
    chartTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    historyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    clearButton: {
      color: colors.error,
      fontSize: 14,
    },
    sessionItem: {
      backgroundColor: colors.surface,
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
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    sessionDate: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 4,
    },
    sessionRight: {
      alignItems: 'flex-end',
    },
    sessionDuration: {
      color: colors.text,
      fontSize: 14,
    },
    sessionStatus: {
      fontSize: 12,
      marginTop: 4,
      textTransform: 'capitalize',
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 40,
    },
  });

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

      {renderWeeklyChart()}

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
