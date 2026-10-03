# Lifemaxxing

Lifemaxxing is a React Native app that helps people break repetitive routines through weekly activity prompts, nearby event recommendations, social participation, and streaks.

This repository contains the shared MVP scaffold for the 24-hour hackathon. Product behavior is intentionally minimal so the team can build screens and backend integrations independently.

## Tech stack

- React Native with Expo
- Expo Router
- TypeScript
- Supabase for the database, authentication, and storage foundation
- Gemini API integration points for prompts and recommendations

## Setup

1. Install Node.js 18 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and fill in the Supabase values when available.
4. Start Expo with `npx expo start`.

Use Expo Go, an iOS simulator, or an Android emulator to open the app.

## Environment variables

| Variable | Description |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key |

Never commit `.env` or real credentials. The app currently falls back to mock data when backend services are not implemented.

## Project structure

```text
app/          Expo Router screens and route layouts
components/   Shared, typed UI components
services/     API and business-logic boundaries
lib/          Supabase client and mock data
types/        Shared domain types
constants/    Shared theme values
```

The `app/` directory owns navigation and screen-specific composition. Components stay reusable and presentational. Services are the only place for API, database, or business logic. Shared types belong in `types/`, and local development data belongs in `lib/mockData.ts`.

## Development Rules

- Do not commit directly to `main`.
- Use short-lived feature branches.
- Keep commits small.
- Avoid changing another developer's area without coordinating.
- Do not add dependencies unless necessary.
- Do not refactor working code during the final hours of the hackathon.