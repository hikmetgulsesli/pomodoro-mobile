import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSettings } from '../../src/contexts/TimerContext';

export default function SettingsScreen() {
  const { settings, updateSettings, resetSettings } = useSettings();

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
            minimumTrackTintColor="#e94560"
            maximumTrackTintColor="#333"
            thumbTintColor="#e94560"
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
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#333"
            thumbTintColor="#10B981"
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
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#333"
            thumbTintColor="#3B82F6"
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
            minimumTrackTintColor="#8B5CF6"
            maximumTrackTintColor="#333"
            thumbTintColor="#8B5CF6"
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
            trackColor={{ false: '#333', true: '#e94560' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.toggleSetting}>
          <Text style={styles.label}>Vibration</Text>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(value) => updateSettings({ vibrationEnabled: value })}
            trackColor={{ false: '#333', true: '#e94560' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.toggleSetting}>
          <Text style={styles.label}>Dark Theme</Text>
          <Switch
            value={settings.theme === 'dark'}
            onValueChange={(value) => updateSettings({ theme: value ? 'dark' : 'light' })}
            trackColor={{ false: '#333', true: '#e94560' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
        <Text style={styles.resetButtonText}>Reset to Defaults</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
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
    borderBottomColor: '#333',
  },
  label: {
    color: '#fff',
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
});
