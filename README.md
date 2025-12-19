# TalkNotes Mobile App

Native iOS and Android app for recording and transcribing voice notes.

## Features

- 🎙️ High-quality audio recording
- 🤖 AI-powered transcription via OpenAI Whisper
- 🎨 Beautiful dark theme UI
- 📱 Native iOS and Android support
- ⚡ Real-time recording feedback

## Tech Stack

- React Native + Expo
- TypeScript
- Expo AV (audio recording)
- Supabase Edge Functions (backend)
- OpenAI Whisper API (transcription)

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) or Android Studio

### Installation

```bash
npm install
```

### Run on iOS

```bash
npm run ios
```

### Run on Android

```bash
npm run android
```

### Run on Web (for testing)

```bash
npm run web
```

## Project Structure

```
src/
├── screens/          # App screens
│   └── HomeScreen.tsx
├── hooks/            # Custom React hooks
│   └── useRecording.ts
├── services/         # API services
│   └── supabase.ts
├── components/       # Reusable components (future)
└── types/            # TypeScript types (future)
```

## Building for Production

### iOS

1. Get Apple Developer account ($99/year)
2. Configure bundle identifier in `app.json`
3. Run: `eas build --platform ios`

### Android

1. Get Google Play Developer account ($25 one-time)
2. Configure package name in `app.json`
3. Run: `eas build --platform android`

## Backend

Uses the existing Supabase Edge Function:
- Endpoint: `https://hekavtsofsenadenwfrs.supabase.co/functions/v1/make-server-b1d03c55/transcribe`
- Same backend as the web version

## Version

1.0.0
