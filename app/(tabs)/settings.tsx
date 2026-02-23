import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSettings } from '../../src/contexts/TimerContext';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function SettingsScreen() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { colors, isDark, setMode } = useTheme();

  const handleReset = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            setMode('dark');
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    setting: {
      marginBottom: 20,
    },
    toggleSetting: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    label: {
      color: colors.text,
      fontSize: 16,
    },
    slider: {
      width: '100%',
      height: 40,
      marginTop: 8,
    },
    resetButton: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resetButtonText: {
      color: colors.error,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timer Durations</Text>

        <View style={styles.setting}>
          <Text style={styles.label}>Work Duration: {settings.workDuration} min</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={60}
            step={1}
            value={settings.workDuration}
            onValueChange={(value) => updateSettings({ workDuration: value })}
            minimumTrackTintColor={colors.timerWork}
            maximumTrackTintColor={colors.surfaceAlt}
            thumbTintColor={colors.timerWork}
          />
        </View>

        <View style={styles.setting}>
          <Text style={styles.label}>Short Break: {settings.shortBreakDuration} min</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={15}
            step={1}
            value={settings.shortBreakDuration}
            onValueChange={(value) => updateSettings({ shortBreakDuration: value })}
            minimumTrackTintColor={colors.timerShortBreak}
            maximumTrackTintColor={colors.surfaceAlt}
            thumbTintColor={colors.timerShortBreak}
          />
        </View>

        <View style={styles.setting}>
          <Text style={styles.label}>Long Break: {settings.longBreakDuration} min</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={30}
            step={1}
            value={settings.longBreakDuration}
            onValueChange={(value) => updateSettings({ longBreakDuration: value })}
            minimumTrackTintColor={colors.timerLongBreak}
            maximumTrackTintColor={colors.surfaceAlt}
            thumbTintColor={colors.timerLongBreak}
          />
        </View>

        <View style={styles.setting}>
          <Text style={styles.label}>Sessions until Long Break: {settings.sessionsUntilLongBreak}</Text>
          <Slider
            style={styles.slider}
            minimumValue={2}
            maximumValue={8}
            step={1}
            value={settings.sessionsUntilLongBreak}
            onValueChange={(value) => updateSettings({ sessionsUntilLongBreak: value })}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surfaceAlt}
            thumbTintColor={colors.primary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.toggleSetting}>
          <Text style={styles.label}>Sound</Text>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => updateSettings({ soundEnabled: value })}
            trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>

        <View style={styles.toggleSetting}>
          <Text style={styles.label}>Vibration</Text>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(value) => updateSettings({ vibrationEnabled: value })}
            trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>

        <View style={styles.toggleSetting}>
          <Text style={styles.label}>Dark Theme</Text>
          <Switch
            value={isDark}
            onValueChange={(value) => setMode(value ? 'dark' : 'light')}
            trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>Reset to Defaults</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
