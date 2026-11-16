# CoachingCompass

A prototype tool for more effective coach–player communication in baseball. Players fill out a short survey about how they learn, how they like feedback, and what motivates them. Coaches get a profile that combines those preferences with performance stats and their own notes, plus an AI-generated summary with non-binding tips on how to coach that player.

**Live demo:** https://coaching-compass-taupe.vercel.app

> All players, survey responses and statistics in the demo are fictional and for illustration only.

## Features

- **Player survey**: ranked and multiple-choice questions on learning style, feedback style, coaching timing and motivation, plus open-ended goals. Prototype users can stay anonymous with a generated alias.
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

Requires Node.js 20+ and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
npm install
cp .env.example .env   # add your GEMINI_API_KEY
npm run dev
```

## Background

The first version was built in under a day entirely from plain-language prompts in an AI app builder (Firebase Studio), as an experiment in how quickly domain experts can prototype tools without a dedicated development team. It has since been cleaned up for public deployment.
