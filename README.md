# VaakCare - AI Patient Monitoring Platform

A complete, polished hackathon-winning full-stack application.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts, Zustand.
- **Backend**: Node.js, Express, MongoDB, Socket.io, JWT.
- **AI**: OpenRouter (OpenAI models).

## Features
- Real-time Patient-Doctor communication & alerts via Socket.io.
- AI-driven patient transcript analysis (symptoms, emotional tone, risk analysis).
- Beautiful SaaS-grade Glassmorphic UI with animated transitions.
- Interactive Analytics & Risk trend graphing using Recharts.

## Setup Instructions

### 1. Backend Setup
```bash
cd server
npm install

# Copy .env.example to .env and fill in your keys (OPENROUTER_API_KEY, MONGO_URI)
cp .env.example .env

# Seed the database with demo users (4 doctors, 4 patients, dummy logs)
node seed.js

# Start backend
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install

# Start frontend
npm run dev
```

### 3. Usage (Demo Mode)
1. Go to the Landing Page.
2. Click **Doctor Dashboard**. You can use the "Use Demo Doctor" button to login as Dr. Sharma (`DOC001`).
3. Open a **new incognito tab** and go to **Patient Portal**. Use the "Use Demo Patient" button to login as Ramesh Kumar.
4. From the Patient Dashboard, send a message like "I am having severe chest pain right now."
5. See the real-time AI processing.
6. Look at the Doctor's tab: A global red alert will pop up instantly, the risk badge will update to `HIGH`, and the SMS log will appear in the server console!
