# Comprehensive Implementation Plan: US Business English Tutor Web Application

> **Target Version**: `v1.0.0` (Semantic Versioning compliance)  
> **Source Requirements**: [`AGENTS.md`](./AGENTS.md) and Global Agent Memory Rules

---

## 1. Executive Summary & Requirements Traceability

The goal is to build an interactive, responsive, client-side US Business English learning web application. The application enables users to discover, listen to, and practice business English expressions used across American corporate settings.

### Traceability Matrix

| Requirement from `AGENTS.md` | Architectural Implementation | Verification Method |
| :--- | :--- | :--- |
| **"generate 10 sentences whenever I ask you to 'generate' or 'try now'"** | `PhraseEngine` module selects a batch of 10 items from a rich dataset. Dedicated "Generate (10 Phrases)" and "Try Now" buttons trigger updates. | Unit tests verify batch size = 10; UI verification of table & flashcard sync. |
| **"Business english phrases with meaning and context when it should be used"** | Data schema: `{ id, phrase, meaning, whenToUse, category }`. Displayed in a structured 3-column table: `Phrase \| Meaning \| When to Use It`. | DOM inspection and schema validation unit tests. |
| **"Everytime I ask you to generate, you should generate 10 sentences which are not covered in the existing list"** | State manager maintains a history of shown phrase IDs in `localStorage`. Generation filters out all seen IDs before sampling. Recycles gracefully when bank is depleted. | Unit test verifying 0 duplicates across consecutive `generateBatch(10)` runs. |
| **"Add a speaker icon next to the phrase and example sentence so that I can play"** | Dedicated speaker icon buttons (`<button class="speak-btn">🔊</button>`) next to every phrase and every example sentence. Integrated with browser `window.speechSynthesis`. | Click triggers speech utterance with corresponding text; visual wave animation during playback. |
| **"There should be a play all button that plays the phrase and example one by one"** | `SpeechQueue` runner queues phrase then example for all 10 items in sequence with visual row highlights and Stop/Pause controls. | Sequenced event listeners verified with automated mock and manual playback test. |
| **"I should be able to choose the voice, speed etc. You can set the default when the page is loaded"** | Settings controls for Voice selection (filtered for `en-US`), Speed/Rate slider (0.5x to 2.0x, default 1.0x), Pitch, and Volume. | Setting modification changes `utterance.rate` and `utterance.voice`. |
| **"There should be flash cards section at the bottom to help me revize"** | Interactive 3D flip card section at the bottom of the page with Next, Previous, Flip, Shuffle, Audio playback, and Mastered status. | Card flip toggle and keyboard/touch navigation manual check. |
| **"The english should be US english"** | All vocabulary, idioms, spelling (e.g. *organize*, *analyze*, *prioritize*), and speech voices strictly adhere to US standard (`en-US`). | Code review of phrase bank and `voice.lang === 'en-US'` priority filtering. |
| **"Semantic versioning v[major].[minor].[patch] should be followed for every commit and the same should be displayed on the page title at the bottom of it"** | Semantic version starts at `v1.0.0` in `package.json`, git commit tag/message, and rendered right beneath page header title. | Visible badge `#app-version` beneath header displaying `v1.0.0`. |

---

## 2. System Architecture & Tech Stack

### Tech Stack Selection
- **Build Tool & Bundler**: [Vite](https://vitejs.dev/) (fast, standard ES modules, zero runtime backend requirements, static deployable).
- **Core Languages**: Modern JavaScript (ES6+ Modules), HTML5, and CSS3 with CSS variables.
- **Audio Engine**: Native Web Speech API (`window.speechSynthesis` and `SpeechSynthesisUtterance`).
- **Storage**: Browser `localStorage` for phrase history, preferred voice, and speed settings.
- **Testing Framework**: [Vitest](https://vitest.dev/) with JSDOM for fast, headless unit tests.

### Directory Structure

```
business_english/
├── index.html                  # Main markup with semantic version below header
├── package.json                # Project config (v1.0.0, scripts, dependencies)
├── vite.config.js              # Vite bundler configuration
├── AGENTS.md                   # Core user specifications
├── PLAN.md                     # This implementation plan
├── src/
│   ├── main.js                 # App entry point, DOM event listeners, orchestration
│   ├── style.css               # Clean corporate typography, responsive grid, 3D flip styles
│   ├── data/
│   │   └── phrases.js          # Curated dictionary of 100+ US Business English phrases
│   ├── modules/
│   │   ├── phraseEngine.js     # Sampling, deduplication, state tracking
│   │   ├── speechService.js    # Speech synthesis, voice loading, sequential queue runner
│   │   └── flashcards.js       # Flashcard view model, flip animations, navigation
│   └── utils/
│       └── storage.js          # LocalStorage helpers with fallback
└── tests/
    ├── phraseEngine.test.js    # Unit tests for phrase engine and deduplication
    └── speechService.test.js   # Unit tests for speech queue logic and US voice selection
```

---

## 3. Detailed Component Specifications

### 3.1 Data Module (`src/data/phrases.js`)
Contains an offline-first library of at least 100 authentic US business expressions across executive communication, meetings, feedback, and negotiations.

#### Schema
```typescript
interface BusinessPhrase {
  id: string;          // kebab-case identifier (e.g., "touch-base")
  phrase: string;      // US corporate idiom/phrase
  meaning: string;     // Concise definition in clear US English
  whenToUse: string;   // Contextual example sentence demonstrating corporate usage
  category: string;    // "Strategy" | "Meetings" | "Communication" | "Leadership" | "Negotiation"
}
```

#### Curated Phrases to Include (Minimum 100):
1. **Touch base** - *To connect briefly and discuss something* - *"Let's touch base next week to review project progress."*
2. **Circle back** - *To return to an earlier topic or follow up later* - *"I don't have that data right now, so let me circle back with you by end of day."*
3. **Move the needle** - *To make a noticeable or meaningful impact* - *"We need high-impact marketing initiatives that will really move the needle on conversions."*
4. **Low-hanging fruit** - *The easiest tasks, targets, or opportunities to tackle first* - *"Fixing these onboarding drop-offs is low-hanging fruit for boosting retention."*
5. **Bandwidth** - *Mental or physical capacity to take on more work* - *"Our engineering team doesn't have the bandwidth to take on an extra sprint this quarter."*
6. **Drill down** - *To investigate or examine details in depth* - *"Let's drill down into the churn metrics by region during Thursday's executive sync."*
7. **Boil the ocean** - *To attempt an impossibly large or overly complex project* - *"Let's focus solely on MVP feature set; we don't want to boil the ocean on launch day."*
8. **Take it offline** - *To discuss a complex or non-agenda item privately outside the meeting* - *"That's an important architecture question, but let's take it offline to keep this standup brief."*
9. **Table this discussion** - *To postpone or set aside a topic for future review* - *"Given the time constraint, let's table this discussion until our quarterly review."*
10. **Pivot** - *To change strategic direction fundamentally based on new data* - *"Customer feedback indicates weak interest in B2C, so we need to pivot towards B2B enterprise."*
11. **Deep dive** - *A thorough, exhaustive exploration of a topic* - *"We will conduct a deep dive into our cost of customer acquisition in tomorrow's workshop."*
12. **Hard stop** - *A fixed, non-negotiable end time for a meeting* - *"I have a hard stop at 3:00 PM for a client presentation, so let's address priority items first."*
13. **Buy-in** - *Agreement, support, or consensus from stakeholders* - *"We must secure executive buy-in before committing the budget to this expansion."*
14. **Run up the flagpole** - *To test an idea or proposal to see what feedback it gets* - *"Let's run this new pricing model up the flagpole with a few trusted partners."*
15. **Level set** - *To establish a shared understanding or baseline across a group* - *"Before discussing timelines, let's level set on what deliverables are in scope."*
16. **On my radar** - *Being aware of or monitoring an upcoming event or issue* - *"The contract expiration in December is on my radar; negotiations begin next month."*
17. **Synergy** - *Increased effectiveness resulting from combined collaboration* - *"The merger is expected to create significant cost and operational synergy."*
18. **Wheelhouse** - *One's area of specific expertise or strong capability* - *"Cloud database optimization is right in Sarah's wheelhouse; she should lead that initiative."*
19. **Actionable items** - *Concrete tasks or next steps resulting from a discussion* - *"Let's summarize the key takeaways and actionable items before ending the call."*
20. **Push back** - *To disagree or resist an idea, requirement, or unreasonable timeline* - *"We had to push back on the aggressive deadline to ensure rigorous security testing."*
*(... and 80+ additional industry-standard phrases spanning strategy, project management, and cross-functional leadership).*

---

### 3.2 Phrase Engine (`src/modules/phraseEngine.js`)
Responsible for sampling, state persistence, and deduplication.

- **Methods**:
  - `init()`: Loads seen phrase IDs from `localStorage`.
  - `generateBatch(count = 10)`:
    - Filters `ALL_PHRASES` by excluding `seenIds`.
    - If available unshown phrases < `count`, triggers an automatic recycle notification and resets `seenIds` while ensuring current batch is unique.
    - Uses Fisher-Yates shuffle algorithm on available items to pick `count` items.
    - Saves newly selected IDs to `seenIds` in `localStorage`.
    - Returns array of 10 items.
  - `getCurrentBatch()`: Returns current 10 items.
  - `resetHistory()`: Clears `seenIds` from storage and resets pool.
  - `getPoolStats()`: Returns `{ total: number, seen: number, remaining: number }`.

---

### 3.3 Speech Synthesis Service (`src/modules/speechService.js`)
Encapsulates Web Speech API logic and sequential playback orchestration.

- **Initialization & US Voice Selection**:
  - Listens to `speechSynthesis.onvoiceschanged`.
  - Populates voice dropdown prioritizing `en-US` voices (e.g., `Google US English`, `Samantha`, `Alex`, `Microsoft David`, `Microsoft Zira`).
  - Sets sensible default (first available `en-US` voice, or system default).
- **Controls**:
  - Rate/Speed slider (0.5x to 2.0x in 0.1 increments, default `1.0x`).
  - Voice selector dropdown.
- **Single Playback**:
  - `speakText(text, options)`: Cancels any active utterance, creates `SpeechSynthesisUtterance`, sets rate and voice, executes `speechSynthesis.speak()`.
  - Dispatches `start` and `end` callbacks to trigger UI animations (e.g. glowing speaker icon).
- **Sequential "Play All" Queue**:
  - `playAll(phrasesArray, onProgressCallback, onCompleteCallback)`:
    - Flattens the 10 phrases into a sequential queue of 20 speech steps:
      - Step 1: Speak Phrase 1
      - Step 2: Speak Example 1 (with 400ms pause)
      - Step 3: Speak Phrase 2
      - ...
      - Step 20: Speak Example 10
    - Calls `onProgressCallback({ index, type: 'phrase' | 'example', id })` to highlight the corresponding row and speaker button in real time.
    - Exposes `pause()`, `resume()`, and `stop()` to let user cancel or pause playback anytime.

---

### 3.4 Interactive Flashcards Module (`src/modules/flashcards.js`)
Provides revision capability at the bottom of the page.

- **Components**:
  - 3D CSS perspective card container (`perspective: 1000px`, `transform-style: preserve-3d`).
  - **Front of Card**:
    - Large phrase text.
    - Category pill (e.g., "Meetings", "Negotiation").
    - Speaker icon button.
    - "Flip to see meaning & usage" prompt.
  - **Back of Card**:
    - Meaning header and definition.
    - When to Use It (contextual example) with quotation formatting.
    - Speaker icon button.
    - "Flip to front" prompt.
  - **Controls Bar**:
    - `[← Previous]` and `[Next →]` navigation buttons with keyboard arrow key support.
    - `[🔀 Shuffle]` button to mix card order.
    - `Card X of 10` counter.
    - `[Flip Card]` button or click anywhere on the card.
    - `[✓ Mark as Mastered]` toggle button to track revision progress.

---

### 3.5 User Interface & Semantic Versioning Layout (`index.html` & `src/style.css`)
- **Header Section**:
  ```html
  <header class="app-header">
    <div class="header-container">
      <h1 class="app-title">Business English Tutor</h1>
      <div class="version-tag">
        <span class="version-label">Version</span>
        <span class="version-badge" id="app-version">v1.0.0</span>
      </div>
      <p class="app-subtitle">Master US Corporate Idioms, Business Phrases & Contextual Usage</p>
    </div>
  </header>
  ```
- **Control Bar**:
  - "Generate" & "Try Now" buttons with primary corporate styling (indigo/slate theme).
  - "Play All" with audio player bar showing status (`Playing phrase 3 of 10...`).
  - Voice select dropdown (`en-US`) and Speed slider (`1.0x` display).
- **Table View**:
  - Responsive table with clear column headers:
    1. **Phrase** (with speaker icon)
    2. **Meaning**
    3. **When to Use It** (with speaker icon)
  - Rows highlight with an active border/background when currently spoken.
- **Flashcards Section**:
  - Located cleanly at the bottom of the page, titled "Revision Flashcards".
  - Centered card container with smooth 3D CSS transition (`transition: transform 0.6s`).

---

## 4. Step-by-Step Implementation Instructions for the Agent

### Step 1: Initialize Project & Tooling
1. Initialize `package.json`:
   ```json
   {
     "name": "business-english-tutor",
     "version": "1.0.0",
     "private": true,
     "type": "module",
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview",
       "test": "vitest run"
     },
     "devDependencies": {
       "vite": "^5.4.0",
       "vitest": "^2.1.0",
       "jsdom": "^25.0.0"
     }
   }
   ```
2. Run `npm install`.
3. Create `vite.config.js` with test configuration using `environment: 'jsdom'`.

### Step 2: Build the Curated US Business English Dataset
1. Create `src/data/phrases.js`.
2. Populate with at least 100 authentic US business expressions with detailed meanings and contextual sentences.
3. Verify that all spellings are standard US English (e.g., *prioritize*, *analyze*, *programs*, *labor*).

### Step 3: Implement `PhraseEngine` & Storage
1. Create `src/utils/storage.js` for safe `localStorage` access.
2. Create `src/modules/phraseEngine.js` implementing unique 10-item batch generation and deduplication.
3. Write `tests/phraseEngine.test.js` to verify:
   - Exactly 10 items returned per call.
   - No duplicates across consecutive batches.
   - Proper schema format.
4. Execute `npm run test` to verify.

### Step 4: Implement Speech Service
1. Create `src/modules/speechService.js`.
2. Implement US voice filtering, voice change listeners, rate control, single utterance playback, and the sequential `playAll` runner.
3. Write `tests/speechService.test.js` to verify speech synthesis mocking and event emission.

### Step 5: Implement Interactive Flashcards & UI
1. Create `src/modules/flashcards.js` handling card index, flipping, shuffling, and mastered badges.
2. Build `index.html` with complete semantic structure, ensuring `v1.0.0` is rendered directly beneath the page title.
3. Build `src/style.css` with responsive layout, clean typography, speaker button animations, and 3D flip card styles.
4. Wire everything together in `src/main.js`.

### Step 6: End-to-End Verification & Semantic Version Tagging
1. Run `npm run test` to ensure all tests pass.
2. Build the project using `npm run build` to confirm zero build errors.
3. Launch dev server and manually verify in browser:
   - Title displays `v1.0.0`.
   - "Generate" and "Try Now" buttons generate 10 unique phrases.
   - Individual speaker icons trigger correct audio for phrase and example.
   - "Play All" sequentially speaks all items with real-time row highlights.
   - Voice and speed controls alter speech playback as expected.
   - Flashcards at the bottom flip smoothly, navigate with Previous/Next/Shuffle, and play audio.
4. Stage changes and commit following semantic versioning (`v1.0.0`).

---

## 5. Automated & Manual Test Plan

### Automated Test Specifications (`npm run test`)
- `tests/phraseEngine.test.js`:
  ```javascript
  describe('PhraseEngine', () => {
    it('generates exactly 10 phrases per batch', () => { ... });
    it('does not duplicate phrases across consecutive generations', () => { ... });
    it('recycles gracefully when all phrases in pool are exhausted', () => { ... });
    it('contains all required fields: id, phrase, meaning, whenToUse', () => { ... });
  });
  ```
- `tests/speechService.test.js`:
  ```javascript
  describe('SpeechService', () => {
    it('prioritizes en-US voices from available speech synthesis voices', () => { ... });
    it('configures rate correctly on speech utterance', () => { ... });
    it('sequences items properly during playAll execution', () => { ... });
  });
  ```

### Manual Verification Checklist
- [ ] Title header displays `v1.0.0` clearly underneath.
- [ ] Initial load displays 10 phrases in table and 10 cards in flashcard deck.
- [ ] Clicking "Generate" or "Try Now" generates 10 fresh, unseen phrases.
- [ ] Clicking speaker icon on phrase speaks phrase in US accent.
- [ ] Clicking speaker icon on example sentence speaks example sentence in US accent.
- [ ] Clicking "Play All" plays each phrase and example in sequence with visual active highlight.
- [ ] Adjusting speed slider to 0.75x or 1.25x updates playback rate.
- [ ] Flashcard flip works on card click and button click.
- [ ] Flashcard next/prev and shuffle work correctly.
- [ ] Flashcard audio buttons speak front and back text properly.

---

## 6. Commit & Semantic Versioning Rules

- Brand-new repository starts at `v1.0.0`.
- Each subsequent functional change set increments SemVer:
  - Fixes -> `v1.0.1`
  - New features -> `v1.1.0`
  - Breaking changes -> `v2.0.0`
- The visible version badge `#app-version` in `index.html` must always match the tag and `package.json`.
