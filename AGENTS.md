# Business English Tutor (AGENTS.md)

This repository contains a **US Business English Tutor** web application (see `README.md`). It is an interactive, client-side learning app for mastering American corporate idioms, phrases, and contextual usage.

## Generation behavior

When the user asks to **"generate"** or **"try now"**, produce a batch of **10 sentences** — US business English phrases with their meaning and the context in which they should be used — presented in a three-column table:

| Phrase | Meaning | When to Use It |
| :--- | :--- | :--- |
| Touch base | To connect briefly and discuss something | "Let's touch base next week to review project progress." |

The generated batch must contain **10 phrases that do NOT exist anywhere in the current phrase bank** (`src/data/phrases.js`, currently 120 phrases) — not merely phrases absent from an already-shown list. Confirmed user rule: "all [the current count] should not have these newly generated phrases." To meet this:

- If the phrases already exist in the bank, sample 10 unseen ones (deduplicated, tracked in `localStorage`); the bank recycles when exhausted so generation continues without within-batch duplicates.
- If the user wants phrases beyond the bank, **generate brand-new phrases** and **add them to `src/data/phrases.js`**, then verify the new count.

## UI requirements (implemented)

- A **speaker icon (🔊)** next to every phrase and example sentence so each can be played aloud.
- A **Play All** button that plays the phrase and example one by one in sequence.
- **Playback controls** — Pause/Play, Prev, and Next let you move through the playing phrases; Stop ends playback.
- A **View All** button that shows the entire phrase bank grouped by category (tag), with per-group counts; Play All plays through all groups in sequence.
- **Voice and speed controls** so you can choose the voice, speed, etc. Sensible defaults are set when the page is loaded.
- A **flashcards** section at the bottom to help with revision (3D flip cards, Next/Prev, Shuffle, Mark as Mastered).
- All content is **US English** (spelling, accent, and `en-US` speech voices).

## Versioning

Semantic versioning `v[major].[minor].[patch]` is followed for every commit, starting at **v1.0.0**. The same version is displayed at the bottom of the page title (`#app-version` badge below the header title and in the footer) and matches the `package.json` version and git tag.

See `README.md` for setup, scripts, and tech stack.
