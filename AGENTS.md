# Business English Tutor (AGENTS.md)

This repository contains a **US Business English Tutor** web application (see `README.md`). It is an interactive, client-side learning app for mastering American corporate idioms, phrases, and contextual usage.

## Generation behavior

When you ask the app to **"generate"** or **"try now"**, it produces a batch of **10 sentences** — business English phrases with their meaning and the context in which they should be used — presented in a three-column table:

| Phrase | Meaning | When to Use It |
| :--- | :--- | :--- |
| Touch base | To connect briefly and discuss something | "Let's touch base next week to review project progress." |

Each batch contains **10 phrases not covered in the already-shown list** (tracked in `localStorage`). When the phrase bank is exhausted, the history recycles so generation continues without duplicates within a batch.

## UI requirements (implemented)

- A **speaker icon (🔊)** next to every phrase and example sentence so each can be played aloud.
- A **Play All** button that plays the phrase and example one by one in sequence.
- **Voice and speed controls** so you can choose the voice, speed, etc. Sensible defaults are set when the page is loaded.
- A **flashcards** section at the bottom to help with revision (3D flip cards, Next/Prev, Shuffle, Mark as Mastered).
- All content is **US English** (spelling, accent, and `en-US` speech voices).

## Versioning

Semantic versioning `v[major].[minor].[patch]` is followed for every commit, starting at **v1.0.0**. The same version is displayed at the bottom of the page title (`#app-version` badge below the header title and in the footer) and matches the `package.json` version and git tag.

See `README.md` for setup, scripts, and tech stack.
