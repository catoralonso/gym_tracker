# Gym Tracker

A personal workout tracking PWA built with React + Vite, deployed on Vercel.

## Features

- **3-day routine** with warmup checklist and exercise list
- **Free exercise order** — pick any exercise from the day, skip occupied machines
- **Per-set logging** — weight, reps, RIR (reps in reserve), and rest timer
- **Rest timer** with add time (+30s / +1min), skip, or mark as done
- **Progression alerts** — notifies when you're ready to increase weight
- **Previous session overlay** — shows last session's sets while you train
- **Session notes** per exercise
- **Manual session entry** — log past workouts with custom date and time
- **History** — expandable session log with CSV export
- **Progress charts** — weight over time per exercise
- **Stats** — current/max streak, volume per week, sessions per day, weekly grid
- **Body metrics** — weight, body fat %, measurements with date and trend charts
- **Quick weight log** from the home screen
- **Responsive** — mobile-first with a desktop layout and phone frame for workout views
- **PWA** — installable on Android/iOS home screen

## Stack

- React 18 + Vite
- Recharts for charts
- Syne (Google Fonts) for typography
- localStorage for persistence
- Deployed on Vercel

## Local setup

```bash
npm install
npm run dev
```

## Deployment

Push to `main` — Vercel auto-deploys.

## Adding exercises

Add an entry to the `DAYS` constant in `src/App.jsx`. Every exercise needs a unique `id` across all three days.

```js
{ id:"cable_fly", name:"Cable Fly", sets:3, reps:"12-15", weight:20, rest:45, next:"22.5kg", w4:"25kg" }
```
