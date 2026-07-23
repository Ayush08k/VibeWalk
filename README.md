# 👟 VibeWalk — Next-Gen AI Step Tracker & Health Analytics

**VibeWalk** is a modern, high-performance React Native mobile application built on **Expo SDK 54** paired with an **AI Analytics Engine**. It tracks daily steps, calories burned, distance covered, active duration, walking cadence, and 30-day activity trends with a futuristic **Electric Cyan & Cyber Violet OLED dark interface**, **smooth 90fps UI-thread transitions**, and **hardware sensor step filtering**.

---

## 🌟 Key Features

### 1. 🎯 Holographic Concentric Dual-Ring Hero Dial
- **Outer Progress Ring**: Visual step goal arc (`#00F5FF` → `#9D00FF` → `#FF007A`) powered by `react-native-reanimated` spring physics.
- **Inner Sub-Arc**: Sub-metric calorie target track.
- **Center Readout**: Ultra-bold hero step count, target goal readout (`TARGET 10,000`), mini progress bar, and dynamic status tags (`⚡ GOAL CRUSHED`, `🔥 ALMOST THERE`).

### 2. 📊 4-Grid Activity Metrics & Action Dock
- **🔥 Calories**: Burned kilocalories with individual progress mini-fill (`#FF007A`).
- **📏 Distance**: Kilometers covered with pace calculations (`#00F5FF`).
- **⏱ Active Duration**: Active walking minutes (`#9D00FF`).
- **⚡ Walk Pace**: Real-time walking cadence in `steps / min` (`#FF9900`).
- **Action Control Dock**: Floating pill dock featuring **`+100 Quick Steps`** and **`Auto Walk`** mode toggle for instant testing on desks or emulators.

### 3. 📅 Interactive 7-Day Week Selector & 30-Day Activity Chart
- **Interactive Week Selector**: Tap any weekday pill (**MON – SUN**) in History to inspect that specific day's step breakdown, date stamp, and target achievement ratio.
- **Dual-Gradient 30-Day Chart**: Built with `react-native-gifted-charts`, featuring a target reference threshold line, average steps pill badge, and color-coded bars (Cyan for goal met, Violet for moderate, Red/Orange for low).
- **Weekly Pace Comparison Split Card**: Dual progress bars comparing this week's daily average versus last week's daily average with trend percentage diff badges (`+14% ↗`).

### 4. ⚡ 90fps Tab Focus Screen Transitions
- **Bi-Directional Liquid Slide & Cross-Fade**: Hardware-accelerated UI-thread screen transitions using `useIsFocused` from `@react-navigation/native` and `react-native-reanimated`.
- **Today Screen**: Slides in smoothly from the left when selected.
- **History Screen**: Slides in smoothly from the right when selected.

### 5. 🛡️ Rhythmic Cadence Step Filter (Zero False Steps While Sitting)
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

## 🛠️ Tech Stack

### **Mobile Application (`/mobile`)**
- **Framework**: React Native SDK 54 (`expo@~54.0.0`, `react-native@0.81.5`, `react@19.1.0`)
- **Navigation**: `@react-navigation/native` & `@react-navigation/bottom-tabs`
- **Animations**: `react-native-reanimated` (90fps UI-thread spring animations)
- **Data Visualization**: `react-native-gifted-charts` & `react-native-svg`
- **Sensors & Pedometer**: `expo-sensors` (`Accelerometer` & `Pedometer` with Rhythmic Cadence Filtering)

### **AI Backend (`/backend`)**
Available in both **Node.js / Express** and **Python / FastAPI**:
- **Node.js**: Express.js (ES Modules, CORS enabled)
- **Python**: FastAPI, Pydantic, Uvicorn

---

## 📁 Repository Structure

```text
stepCounter/
├── backend/                  # AI Analytics Engine Backend
│   ├── app/
│   │   ├── analytics.js      # JS AI Analytics Engine
│   │   ├── analytics.py      # Python AI Analytics Engine
│   │   ├── main.js           # Express.js entry point
│   │   ├── main.py           # FastAPI entry point
│   │   └── models.py         # Pydantic schema models
│   ├── package.json
│   └── requirements.txt
│
└── mobile/                   # React Native Mobile App (Expo SDK 54)
    ├── mocks/                # HealthKit / Pedometer mock module
    ├── src/
    │   ├── components/       # StepRing, BarChart, InsightCard, PermissionGate
    │   ├── hooks/            # useSteps (Hybrid Engine), useStepHistory, useAnalytics
    │   ├── screens/          # HomeScreen, HistoryScreen, PermissionScreen
    │   ├── services/         # apiService (AI Client & Fallback), healthService
    │   └── theme/            # Global OLED Cyber Dark color system
    ├── app.json
    ├── babel.config.js
    ├── index.js
    └── package.json
```

---

## ⚙️ Quick Start Guide

### 1. Prerequisites
- **Node.js**: `>= 20.x`
- **Expo Go** app installed on your physical mobile phone (iOS / Android)

---

### 2. Start the Backend Server (Optional)

#### Option A: Node.js Backend
```bash
cd backend
npm install
npm run dev
```
> Server runs at `http://localhost:8000`

#### Option B: Python FastAPI Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
> API Docs available at `http://localhost:8000/docs`

---

### 3. Run the Mobile App in Expo Go

```bash
cd mobile
npm install
npx expo start
```

1. Open **Expo Go** on your Android or iOS device.
2. Scan the terminal **QR code**.
3. Enjoy VibeWalk in real time!

---

## 📡 API Reference

### `POST /api/v1/analyze`
Generates step analytics, wellness score, and AI insight cards.

**Request:**
```json
{
  "daily_steps": [7500, 9200, 10400, 8100, 11500, 12000, 9800],
  "goal": 10000
}
```

**Response:**
```json
{
  "wellness_score": 88,
  "trend": "up",
  "total_steps": 68500,
  "average_steps": 9785,
  "streak_days": 4,
  "best_day": { "date": "2026-07-20", "steps": 12000 },
  "weekly_comparison": {
    "this_week_avg": 9785,
    "last_week_avg": 8500,
    "change_percent": 15.1,
    "direction": "up"
  },
  "insights": [
    {
      "emoji": "🔥",
      "title": "4-Day Goal Streak!",
      "description": "You've hit your 10,000 step goal 4 days in a row.",
      "severity": "success"
    },
    {
      "emoji": "🚀",
      "title": "Trending Up",
      "description": "You're walking 15% more than last week. Keep it up!",
      "severity": "success"
    }
  ]
}
```

---

## 📜 License

Distributed under the MIT License.