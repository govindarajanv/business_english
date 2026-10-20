# Business English Tutor

An interactive, client-side **US Business English** learning web application. It helps you discover, listen to, and practice business expressions used across American corporate settings.

## Features

- **Generate 10 phrases** — Click **Generate 10 Phrases** or **Try Now** to load a fresh batch of 10 unique phrases (never repeated across batches until the bank is exhausted).
- **Phrase table** — Each row shows the phrase, its meaning, and a contextual "When to Use It" example.
- **Speaker icons** — 🔊 button next to every phrase and every example sentence lets you play the US audio.
- **Play All** — Plays every phrase and example in sequence, one by one, with real-time row highlighting and a Stop control.
- **Voice & speed controls** — Choose a US English voice and adjust playback speed (0.5x–2.0x). Defaults are set on page load and remembered.
- **Revision flashcards** — A 3D flip-card deck at the bottom to revise: flip, Previous/Next, Shuffle, and Mark as Mastered.

## Getting Started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # preview the production build
npm test         # run unit tests (Vitest)
```

## Tech Stack

- [Vite](https://vitejs.dev/) — build tool & dev server
- Vanilla JavaScript (ES modules), HTML5, CSS3
- Native Web Speech API (`window.speechSynthesis`) for audio
- `localStorage` for phrase history and settings
- [Vitest](https://vitest.dev/) + JSDOM for unit tests

## Access the App

The live app is hosted on GitHub Pages:

**https://govindarajanv.github.io/business_english/**

> Note: it goes live after the first successful GitHub Actions run once Pages is enabled with **Source → GitHub Actions**. If it's not yet available, run the workflow manually (Actions → "Deploy to GitHub Pages" → Run workflow).

## GitHub Pages

The app is fully static (client-side) and **GitHub Pages compatible**. A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the site and deploys `dist/` to Pages automatically on every push to `main`. The Vite config uses relative asset paths (`base: './'`) so the site works under the repo's Pages URL.

Manual alternative: enable **Pages** in the repo settings, set **Source → Deploy from a branch**, and select the `dist` folder as the source. Then run `npm run build` and commit `dist/`.

> Note: because Pages deployment is configured through Actions, the repo settings should use **"GitHub Actions"** as the Pages source (the workflow handles it).

## Versioning

Follows Semantic Versioning (`v[major].[minor].[patch]`), starting at **v1.0.0**. The live version is displayed below the page title and in the footer, and matches the `package.json` version and git tag.
