# Notifications

This document describes the notification system and its implementation details for the Pomodoro Timer mobile app.

## Overview

The app uses `expo-notifications` to provide local notifications when timer sessions complete. Notifications help users stay informed about their focus sessions even when the app is in the background.

## Implementation

### Notification Channel (Android)

- Channel ID: `pomodoro-timer`
- Name: Pomodoro Timer
- Importance: High
- Sound: Default
- Light Color: #10B981
- Vibration Pattern: [0, 250, 250, 250]

### Notification Types

1. **Work Session Complete**: "Time for a break!" - Triggered when a work session ends
2. **Break Complete**: "Ready to focus!" - Triggered when a short or long break ends

### Permissions

Notification permissions are requested on first app launch using `Notifications.requestPermissionsAsync()`.

### Sound Effects

When a notification is triggered, a sound effect plays using `expo-av` from `assets/sounds/timer-complete.mp3`. This can be toggled on/off in the settings.

## Technical Details

- Notification handler configured in `TimerContext.tsx`
- Sound playback via `expo-av`
- Haptic feedback via `expo-haptics`
- Notifications work when app is backgrounded or closed
