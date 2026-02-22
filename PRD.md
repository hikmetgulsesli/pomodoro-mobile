# Pomodoro Timer - Mobile App

## Overview
A clean, minimal Pomodoro timer mobile app built with React Native and Expo. Focus timer with work/break cycles, session tracking, and local notifications.

## Tech Stack
- **Framework:** React Native with Expo SDK 52+
- **Language:** TypeScript
- **State:** React Context + AsyncStorage for persistence
- **UI:** React Native built-in components + custom styling (no external UI library)
- **Notifications:** expo-notifications for timer alerts
- **Navigation:** expo-router (file-based routing)
- **Audio:** expo-av for timer sound effects

## Design
- Dark theme by default (easy on eyes during focus)
- Large circular timer display in center
- Minimal controls: Start, Pause, Reset, Skip
- Bottom tab navigation: Timer, History, Settings
- Colors: Dark background (#1a1a2e), accent (#e94560), success (#0f3460)

## User Stories

### US-001: Project Setup with Expo
**As a** developer
**I want** the project scaffolded with Expo and TypeScript
**So that** development can begin

**Acceptance Criteria:**
- Create Expo project with TypeScript template
- Configure expo-router for file-based navigation
- Set up 3 tabs: Timer, History, Settings
- App icon and splash screen configured (simple tomato icon)
- App name: "Pomodoro"
- Package name: com.setrox.pomodoro
- ESLint configured
- App builds and runs without errors on Android

### US-002: Timer Core Logic
**As a** user
**I want** a working Pomodoro timer
**So that** I can track my focus sessions

**Acceptance Criteria:**
- Countdown timer displays MM:SS format
- Default: 25 min work, 5 min short break, 15 min long break
- Long break after every 4 work sessions
- Timer states: idle, running, paused
- Auto-transition from work to break and vice versa
- Timer continues when app is in background (expo-task-manager)
- Circular progress indicator around the timer
- Current session type shown (Work / Short Break / Long Break)
- Session counter: "Session 2 of 4"

### US-003: Timer Controls
**As a** user
**I want** intuitive controls for the timer
**So that** I can manage my focus sessions easily

**Acceptance Criteria:**
- Start button (large, centered, accent color)
- Pause/Resume toggle button
- Reset button (resets current timer to beginning)
- Skip button (skip to next session - work/break)
- Haptic feedback on button press (expo-haptics)
- Buttons disable appropriately based on timer state

### US-004: Notifications & Sound
**As a** user
**I want** to be notified when a session ends
**So that** I know when to take a break or resume work

**Acceptance Criteria:**
- Local notification when work session ends: "Time for a break!"
- Local notification when break ends: "Ready to focus!"
- Short sound effect when timer completes (bundled audio file)
- Notification permissions requested on first launch
- Notifications work when app is in background

### US-005: Session History
**As a** user
**I want** to see my completed sessions
**So that** I can track my productivity

**Acceptance Criteria:**
- History tab shows completed sessions
- Each entry: date, session type, duration, completed/skipped
- Today's summary at top: total focus time, sessions completed
- Weekly summary with simple bar chart (last 7 days)
- Data persisted with AsyncStorage
- Clear history option

### US-006: Settings
**As a** user
**I want** to customize timer durations
**So that** I can adjust to my preferred work style

**Acceptance Criteria:**
- Work duration: slider 1-60 min (default 25)
- Short break: slider 1-15 min (default 5)
- Long break: slider 1-30 min (default 15)
- Sessions until long break: 2-8 (default 4)
- Sound on/off toggle
- Vibration on/off toggle
- Dark/Light theme toggle
- Settings persisted with AsyncStorage
- Reset to defaults button
