# 👟 VibeWalk — Next-Gen AI Step Tracker & Health Analytics

**VibeWalk** is a modern, high-performance React Native mobile application built on **Expo SDK 54** paired with an **AI Analytics Engine**. It tracks daily steps, calories burned, distance covered, active duration, walking cadence, GPS routes, achievement milestones, and 30-day activity trends with a futuristic **Electric Cyan & Cyber Violet OLED dark interface**, **smooth liquid flow UI-thread transitions**, **audio coaching & cadence soundscapes**, and **hardware sensor step filtering**.

---

## 🌟 Key Features

### 1. 🎯 Holographic Concentric Dual-Ring Hero Dial
- **Outer Progress Ring**: Visual step goal arc (`#00F5FF` → `#9D00FF` → `#FF007A`) powered by `react-native-reanimated` spring physics.
- **Inner Sub-Arc**: Sub-metric calorie target track.
- **Center Readout**: Ultra-bold hero step count, target goal readout (`TARGET 10,000`), mini progress bar, and dynamic status tags (`⚡ GOAL CRUSHED`, `🔥 ALMOST THERE`).

### 2. 🌊 Liquid Flow Transitions & Staggered Section Animations
- **Tab Focus Morphing (`LiquidScreenWrapper.tsx`)**: Fluid UI-thread slide, scale, and cross-fade animations on tab switches powered by `react-native-reanimated` and `@react-navigation/native`.
- **Staggered Wave Sections (`LiquidSection.tsx`)**: Cards, grids, and timeline elements enter with organic staggered spring physics (`FadeInDown.springify().damping(13)`) and touch rebound interaction.

### 3. 🎵 Cadence Beat Sync & Audio Voice Cues
- **Live Audio Coach (`voiceCoachService.ts`)**: Speech-synthesized text-to-speech updates using `expo-speech` announcing session start, pause, finish, and per-kilometer split updates (*"Kilometer 1 complete. Average pace: 5'32" per kilometer"*).
- **Cadence Soundscapes (`soundscapeService.ts`)**: Ambient audio tracks (`Synthwave Pulse`, `Cyber Rain`, `Lo-Fi Walk Groove`) featuring a dynamic tempo multiplier (0.85x to 1.35x) adjusting live to your walking cadence (steps/min).

### 4. 🗺️ Live GPS Route Tracker & GPX Export
- **Real-Time Mapping**: Interactive map integration displaying real-time user movement polyline trails (`#00F5FF`).
- **GPX Export (`gpxService.ts`)**: Export tracked workout sessions into standard `.gpx` XML files ready for Strava, Garmin, or Apple Health import using `expo-sharing`.
- **Bookmarked Favorite Trails (`favoriteTrailsService.ts`)**: Bookmark AI-suggested routes in the AI Planner (`⭐ Save Trail`) and select them on the GPS Walk screen via a horizontal trail carousel.

### 5. 🌤️ Weather & Air Quality Telemetry
- **Environmental Status Card (`weatherService.ts`)**: Displays live outdoor environmental conditions on the GPS Walk screen including Temperature (°C/°F), Weather Condition, Humidity %, UV Index rating, Air Quality Index (AQI 1-5), and outdoor walking safety advice.

### 6. 📊 4-Grid Activity Metrics & Action Dock
- **🔥 Calories**: Burned kilocalories with individual progress mini-fill (`#FF007A`).
- **📏 Distance**: Kilometers covered with pace calculations (`#00F5FF`).
- **⏱ Active Duration**: Active walking minutes (`#9D00FF`).
- **⚡ Walk Pace**: Real-time walking cadence in `steps / min` (`#FF9900`).
- **Action Control Dock**: Floating pill dock featuring **`+100 Quick Steps`** and **`Auto Walk`** mode toggle for instant testing on desks or emulators.

### 7. 📅 Interactive 7-Day Week Selector & 30-Day Activity Chart
- **Interactive Week Selector**: Tap any weekday pill (**MON – SUN**) in History to inspect that specific day's step breakdown, date stamp, and target achievement ratio.
- **Dual-Gradient 30-Day Chart**: Built with `react-native-gifted-charts`, featuring a target reference threshold line, average steps pill badge, and color-coded bars (Cyan for goal met, Violet for moderate, Red/Orange for low).
- **Weekly Pace Comparison Split Card**: Dual progress bars comparing this week's daily average versus last week's daily average with trend percentage diff badges (`+14% ↗`).

### 8. 🏆 Gamified Achievement & Badge System
- **Tiered Milestone Badges**: Unlockable achievements categorized across step goals, streak milestones, distance benchmarks, and active time consistency.
- **Visual Progress Tiers**: Color-coded badges (`#00F5FF`, `#9D00FF`, `#FF007A`) showing completion percentage, unlocked dates, and locked criteria previews.

### 9. 🤖 AI Health Planner & Goal Recommendations
- **Dynamic Weekly Schedules**: Customized daily step targets based on recent activity performance and AI wellness score recommendations.
- **Route Suggestions & Window Times**: Recommends optimal circadian walking time windows and neighborhood routes with one-tap trail bookmarking.

### 10. 📲 Lock Screen Live Activities & Dynamic Island Controller
- **System Widget Previews**: Interactive preview component (`WidgetPreviewCard.tsx`) rendering Home Screen, Lock Screen, and Dynamic Island ongoing notification controls.
- **Quick Metrics Glance**: Displays live step count, ring completion arc, and active timer telemetry directly in widget formats.

### 11. 🛡️ Rhythmic Cadence Step Filter (Zero False Steps While Sitting)
- **Impact Acceleration Threshold (`1.42g`)**: Prevents slight hand movements or wrist turns while sitting/resting from triggering false steps.
- **Rhythmic Step Cadence Window (`[320ms, 1100ms]`)**: Requires at least **3 consecutive rhythmic steps** matching human walking cadence before steps are counted. Isolated hand twitches while resting or sleeping are completely discarded.

---

## 🤖 Where AI Is Used in VibeWalk

AI power is integrated at both the **Backend Engine** and **Client-Side Fallback System**:

```
+-------------------------------------------------------------------+
|                        VibeWalk App Flow                          |
+-------------------------------------------------------------------+
                                  |
                   [30-Day Activity Vector Data]
                                  |
                                  v
+-------------------------------------------------------------------+
|                      AI Analytics Engine                          |
|             (FastAPI / Express or Offline AI Fallback)            |
+-------------------------------------------------------------------+
    |                             |                            |
    v                             v                            v
[Pattern Analysis &      [0-100 Dynamic Wellness     [Ranked Contextual AI
 Trend Mining]            Performance Score]          Insight Generation]
    |                             |                            |
    +-----------------------------+----------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                      Cyber Frontend Timeline                      |
|       (Renders Ranked AI Insights: Success, Warning, Alert)       |
+-------------------------------------------------------------------+
```

### 1. 📈 Pattern Analysis & Trend Mining
- The AI engine processes 30-day historical step arrays `[s1, s2, ..., s30]` sent by the mobile app.
- Calculates exponential moving averages (EMA), rolling 7-day averages, and week-over-week variance to detect upward momentum (`up`), activity dips (`down`), or steady consistency (`stable`).

### 2. 🏆 Dynamic 0–100 Wellness Performance Scoring
- Evaluates four weighted dimensions:
  - **Goal Consistency Rate** (weight: 50%)
  - **Active Streak Multiplier** (weight: 20%)
  - **Week-over-Week Growth Rate** (weight: 15%)
  - **Volume Stability** (weight: 15%)
- Assigns dynamic performance tier badges: **`OPTIMAL`** (85–100), **`HEALTHY`** (65–84), **`MODERATE`** (45–64), and **`LOW ACTIVITY`** (0–44).

### 3. 💡 Contextual Ranked AI Health Insights
- Generates severity-ranked health cards with emoji tags and actionable coaching:
  - **`success` (🔥 Streak & 🚀 Momentum)**: "You've hit your 10,000 step goal 5 days in a row!"
  - **`warning` (⚠️ Activity Dip)**: "Your steps dropped 18% compared to last week."
  - **`alert` (🚨 Inactivity Dip)**: Detects multi-day inactivity and suggests recovery targets.
  - **`info` (📊 Benchmark Insights)**: Compares weekend vs. weekday walking patterns.

### 4. ⚡ Embedded Client-Side Offline AI Engine
- If the remote AI backend is unreachable (offline mode or dev network change), `apiService.ts` automatically executes an embedded client-side AI analysis algorithm so users always receive accurate wellness scores, trends, and smart insights.

---

## 🛠️ Tech Stack & Workflow Tools

### **Mobile Application (`/mobile`)**
- **Framework**: React Native SDK 54 (`expo@~54.0.0`, `react-native@0.81.5`, `react@19.1.0`)
- **Navigation**: `@react-navigation/native` & `@react-navigation/bottom-tabs`
- **Animations**: `react-native-reanimated` (UI-thread liquid flow spring animations)
- **Audio & Voice**: `expo-speech` (Live Voice Coach TTS & Cadence Soundscapes)
- **Sharing & Files**: `expo-sharing` & `expo-file-system` (GPX route export)
- **Data Visualization**: `react-native-gifted-charts` & `react-native-svg`
- **Maps & GPS**: `react-native-maps` & `expo-location`
- **Notifications**: `expo-notifications`
- **Sensors & Pedometer**: `expo-sensors` (`Accelerometer` & `Pedometer` with Rhythmic Cadence Filtering)

### **AI Backend (`/backend`)**
Available in both **Node.js / Express** and **Python / FastAPI**:
- **Node.js**: Express.js (ES Modules, CORS enabled)
- **Python**: FastAPI, Pydantic, Uvicorn

---

## 📁 Repository & File Structure

```text
stepCounter/
├── backend/                  # AI Analytics Engine Backend
│   ├── app/
│   │   ├── analytics.js      # JS AI Analytics Engine logic
│   │   ├── analytics.py      # Python AI Analytics Engine logic
│   │   ├── main.js           # Express.js entry point & endpoints
│   │   ├── main.py           # FastAPI entry point & routes
│   │   └── models.py         # Pydantic schema models
│   ├── package.json
│   └── requirements.txt
│
└── mobile/                   # React Native Mobile App (Expo SDK 54)
    ├── mocks/                # HealthKit / Pedometer mock module
    ├── src/
    │   ├── components/       # UI Components
    │   │   ├── BarChart.tsx          # 30-day interactive bar chart
    │   │   ├── HealthSyncBanner.tsx  # HealthKit / Health Connect sync banner
    │   │   ├── InsightCard.tsx       # AI insight card renderer
    │   │   ├── LiquidScreenWrapper.tsx# Fluid liquid tab focus screen wrapper
    │   │   ├── LiquidSection.tsx     # Staggered wave section container
    │   │   ├── PermissionGate.tsx    # Permission gate wrapper
    │   │   ├── SplitTableCard.tsx    # Weekly pace comparison split card
    │   │   ├── StepRing.tsx          # Holographic concentric hero dial
    │   │   └── WidgetPreviewCard.tsx # System Widgets & Live Activity controller
    │   ├── hooks/            # Custom React Hooks
    │   │   ├── useAnalytics.ts       # AI analytics hook
    │   │   ├── useStepHistory.ts     # Step history state manager
    │   │   └── useSteps.ts           # Sensor & hybrid pedometer hook
    │   ├── screens/          # Main Tab & Feature Screens
    │   │   ├── BadgesScreen.tsx      # Gamified achievements & milestone badges
    │   │   ├── HistoryScreen.tsx     # 7-day selector & 30-day analytics history
    │   │   ├── HomeScreen.tsx        # Main dashboard screen
    │   │   ├── PermissionScreen.tsx   # Sensor & location permissions screen
    │   │   ├── PlannerScreen.tsx     # AI health planner & route bookmarking
    │   │   └── TrackerScreen.tsx     # Live GPS route map, audio coach, & weather
    │   ├── services/         # App Services & Integrations
    │   │   ├── apiService.ts         # Backend API client & offline fallback engine
    │   │   ├── badgeService.ts       # Achievement & badge evaluation service
    │   │   ├── favoriteTrailsService.ts# Bookmarked favorite routes manager
    │   │   ├── gpxService.ts         # GPX route XML export & sharing
    │   │   ├── gpsService.ts         # Location tracking & route management
    │   │   ├── healthService.ts      # Native health platform sync bridge
    │   │   ├── notificationService.ts# Local push notification scheduling
    │   │   ├── soundscapeService.ts  # Cadence soundscapes & dynamic tempo engine
    │   │   ├── voiceCoachService.ts  # Audio Voice Coach TTS announcements
    │   │   ├── weatherService.ts     # Outdoor weather & AQI telemetry
    │   │   └── widgetService.ts      # Widget configuration service
    │   ├── theme/            # Styling & Color System
    │   │   └── colors.ts             # OLED Cyber Dark color palette
    │   └── utils/            # Helper Utilities
    │       └── normalize.ts          # Responsive font & layout normalization
    ├── App.tsx               # Root App Component & Navigation Stack
    ├── app.json              # Expo application configuration
    ├── babel.config.js       # Babel compiler configuration
    ├── index.js              # Entry point registration
    ├── metro.config.js       # Metro bundler config
    ├── package.json          # Node dependencies & scripts
    └── tsconfig.json         # TypeScript configuration
```

---

## ⚙️ Quick Start Guide

### 1. Prerequisites
- **Node.js**: `>= 20.x`
- **Expo Go** app installed on your physical mobile phone (iOS / Android) or simulator/emulator.

---

## 🚀 Step-by-Step Execution Workflow

### Step 1: Clone & Setup
```bash
git clone https://github.com/Ayush08k/VibeWalk.git
cd VibeWalk
```

---

### Step 2: Start the Backend Server (Optional)

#### Option A: Node.js / Express Backend
```bash
cd backend
npm install
npm run dev
```
> Server runs at `http://localhost:8000`

#### Option B: Python / FastAPI Backend
```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
> API interactive documentation available at `http://localhost:8000/docs`

---

### Step 3: Launch the React Native Mobile Application

```bash
cd mobile
npm install
npx expo start -c
```

#### Running Options:
1. **Physical Device (Recommended)**:
   - Open **Expo Go** on your iOS or Android phone.
   - Scan the QR code printed in the terminal.
2. **Android Emulator**: Press `a` in the terminal after launching Expo CLI.
3. **iOS Simulator** (macOS only): Press `i` in the terminal.

---

## 📜 License

Distributed under the MIT License.