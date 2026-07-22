# 👟 VibeWalk — AI-Powered Step Tracking & Health Analytics

**VibeWalk** is a modern, high-performance React Native mobile application paired with an AI analytics engine designed to track daily steps, calories burned, distance covered, and activity trends with a premium OLED dark design.

---

## 🚀 Features

- ⚡ **Real-Time Step Tracking**: Syncs directly with HealthKit / Health Connect (with built-in development mock fallback).
- 🟢 **Dynamic Activity Ring & Progress**: Visual step goal ring with real-time percentage progress.
- 📊 **Interactive History & Charts**: Weekly step trend visualization using interactive bar charts (`react-native-gifted-charts`).
- 🤖 **AI-Driven Personal Insights**: Backend analytics engine providing personalized activity summaries, goal achievement status, and health tips.
- 🎨 **OLED Dark Mode Aesthetics**: Sleek dark UI with neon green/cyan accents, glassmorphism, and smooth micro-animations (`react-native-reanimated`).
- 🔒 **Privacy & Permission Gate**: User-controlled permissions with transparent data usage guarantees.

---

## 🛠️ Tech Stack

### **Mobile App (`/mobile`)**
- **Framework**: React Native 0.86 (TypeScript)
- **Navigation**: `@react-navigation/native` & `@react-navigation/bottom-tabs` (v7)
- **Animations**: `react-native-reanimated`
- **Data Visualization**: `react-native-gifted-charts` & `react-native-svg`
- **Health Integration**: `@mbdayo/react-native-health-kits` (HealthKit / Google Fit wrapper with dev mock)

### **Analytics Backend (`/backend`)**
Available in both **Node.js / Express** and **Python / FastAPI**:
- **Node.js**: Express.js (ES Modules, CORS enabled)
- **Python**: FastAPI, Pydantic, Uvicorn

---

## 📁 Repository Structure

```text
VibeWalk/
├── backend/                  # AI Analytics Engine
│   ├── app/
│   │   ├── analytics.js      # JS Analytics logic
│   │   ├── analytics.py      # Python Analytics logic
│   │   ├── main.js           # Express.js entry point
│   │   ├── main.py           # FastAPI entry point
│   │   └── models.py         # Pydantic data schemas
│   ├── package.json          # Node.js dependencies
│   └── requirements.txt      # Python dependencies
│
└── mobile/                   # React Native Mobile App
    ├── mocks/                # HealthKit mock module for local dev
    ├── src/
    │   ├── components/       # StepRing, BarChart, InsightCard, PermissionGate
    │   ├── hooks/            # useSteps, useStepHistory, useAnalytics
    │   ├── screens/          # HomeScreen, HistoryScreen, PermissionScreen
    │   ├── services/         # apiService, healthService
    │   └── theme/            # Global OLED dark mode color system
    ├── app.json
    ├── index.js
    └── package.json
```

---

## ⚙️ How to Run VibeWalk

### 1. Prerequisites
- **Node.js**: `>= 20.x`
- **npm** or **yarn**
- **Android Studio** (for Android Emulator) or **Xcode** (for iOS Simulator, macOS only)
- *(Optional)* **Python 3.10+** (if running the Python FastAPI backend)

---

### 2. Start the Backend Server

You can run either the **Node.js (Express)** backend or the **Python (FastAPI)** backend:

#### Option A: Node.js Backend (Recommended)
```bash
cd backend
npm install
npm run dev
```
> Server will start at `http://localhost:8000`

#### Option B: Python FastAPI Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
> Server will start at `http://localhost:8000` (Docs available at `http://localhost:8000/docs`)

---

### 3. Start the Mobile App

In a new terminal window:

```bash
cd mobile
npm install

# Start Metro Bundler
npm start
```

In another terminal, launch the application on your simulator/device:

#### For Android:
```bash
cd mobile
npm run android
```

#### For iOS (macOS only):
```bash
cd mobile
npm run ios
```

---

## 📡 API Endpoints

### `GET /health`
Returns system status.
```json
{ "status": "healthy" }
```

### `POST /api/v1/analyze`
Generates step analytics and insights.

**Request Body:**
```json
{
  "daily_steps": [6500, 8200, 10400, 9100, 11500, 12000, 7800],
  "goal": 10000
}
```

**Response Body:**
```json
{
  "total_steps": 65500,
  "average_steps": 9357,
  "completion_rate": 85.7,
  "streak_days": 3,
  "insights": [
    "Great job! You met your goal 3 out of 7 days.",
    "Your highest activity was on Saturday with 12,000 steps."
  ]
}
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.