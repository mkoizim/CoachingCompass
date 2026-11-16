# CoachingCompass

A prototype tool for better coach–player communication in baseball. Players fill out a short survey about how they learn, how they like feedback, and what motivates them. Coaches get a profile that combines those preferences with performance stats and their own notes, plus an AI-generated summary of how to coach that player.

**Live demo:** _coming soon_

> All players, survey responses and statistics in the demo are fictional and for illustration only.

## Features

- **Player survey**: ranked and multiple-choice questions on learning style, feedback style, coaching timing and motivation, plus open-ended goals. Players can stay anonymous with a generated alias.
- **Shareable intake**: send the survey by link, email or QR code.
- **Player profile**: survey answers organized into coaching-relevant sections, Statcast-style percentile bars for hitters, catchers and pitchers, and a running log of coaching notes.
- **AI profile summary**: a Genkit flow on Google Gemini combines the survey, notes and weakest stat areas into an intro, do's and don'ts, and suggested focus areas, each with its reasoning cited.

## Tech stack

- **Next.js 15** (App Router, Server Components, Server Actions) and **React 19**
- **Tailwind CSS** with **shadcn/ui** (Radix primitives)
- **Cloud Firestore** for the shared roster
- **Genkit** with the Google AI plugin (`gemini-flash-lite-latest` by default)
- Deployed on **Vercel**

## How the public demo works

The demo is open to anyone, with no login, so it is sandboxed:

- The shared sample roster lives in a Firestore `demoPlayers` collection. [`firestore.rules`](firestore.rules) makes it read-only and closes everything else.
- Each visitor's changes (new players, survey edits, notes, deletes, regenerated summaries) are stored in their own browser's `localStorage` as an overlay on the shared roster ([`src/lib/demo-store.ts`](src/lib/demo-store.ts)). No visitor can affect what anyone else sees, and **Reset demo** restores the original roster.
- AI summaries for the sample players are generated once at seed time, so browsing triggers no model calls. Generating a summary on demand goes through one server action ([`src/app/actions/summarize.ts`](src/app/actions/summarize.ts)) that validates and caps the input and rate-limits each client.

## Running locally

Requires Node.js 20+.

```bash
npm install
cp .env.example .env   # then add your Gemini API key
npm run dev
```

The app reads the roster from the Firebase project configured in [`src/lib/firebase.ts`](src/lib/firebase.ts). To point it at your own project, replace that config and deploy the rules:

```bash
npx firebase-tools deploy --only firestore:rules --project <your-project-id>
```

### Seeding the sample roster

[`scripts/seed-demo.ts`](scripts/seed-demo.ts) writes the sample players, with stats, notes and AI summaries, to `demoPlayers`. The committed rules block all writes, so temporarily allow writes to that collection, run the script, then redeploy `firestore.rules`:

```bash
GEMINI_API_KEY=... npm run seed:demo           # or: npm run seed:demo -- --no-ai
```

## Deploying

Import the repository into Vercel (framework preset: Next.js) and set one environment variable:

| Variable         | Purpose                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `GEMINI_API_KEY` | Google AI Studio key used by the AI summary. Server-side only.              |
| `GEMINI_MODEL`   | Optional. Gemini model id; defaults to `gemini-flash-lite-latest`.          |

## Project structure

```
src/
  app/                 routes: roster, survey, player profile, edit survey
  app/actions/         server actions exposed to the browser
  ai/                  Genkit setup and the profile summary flow
  components/          app components (+ shadcn/ui in components/ui)
  lib/                 types, stats generation, demo sandbox store, sample data
  services/            read-only Firestore access
scripts/seed-demo.ts   seeds the shared sample roster
firestore.rules        Firestore Security Rules
docs/blueprint.md      the original product brief
```

## Background

The first version was built in under a day entirely from plain-language prompts in an AI app builder (Firebase Studio), as an experiment in how quickly domain experts can prototype tools without a dedicated development team. It has since been cleaned up for public deployment.
