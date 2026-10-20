import { phraseEngine } from './modules/phraseEngine.js';
import { speechService } from './modules/speechService.js';
import Flashcards from './modules/flashcards.js';
import { getItem, STORAGE_KEYS } from './utils/storage.js';

const VERSION = 'v1.4.0';

const el = {
  version: document.getElementById('app-version'),
  footerVersion: document.getElementById('footer-version'),
  btnGenerate: document.getElementById('btn-generate'),
  btnTryNow: document.getElementById('btn-try-now'),
  btnPlayAll: document.getElementById('btn-play-all'),
  btnStop: document.getElementById('btn-stop'),
  playStatus: document.getElementById('play-status'),
  voiceSelect: document.getElementById('voice-select'),
  rateSlider: document.getElementById('rate-slider'),
  rateValue: document.getElementById('rate-value'),
  poolStats: document.getElementById('pool-stats'),
  tbody: document.getElementById('phrase-tbody'),
  fcPrev: document.getElementById('fc-prev'),
  fcNext: document.getElementById('fc-next'),
  fcFlip: document.getElementById('fc-flip'),
  fcShuffle: document.getElementById('fc-shuffle'),
  fcMastered: document.getElementById('fc-mastered'),
  fcCounter: document.getElementById('fc-counter'),
  flashcard: document.getElementById('flashcard'),
  fcCategory: document.getElementById('fc-category'),
  fcCategoryBack: document.getElementById('fc-category-back'),
  fcPhrase: document.getElementById('fc-phrase'),
  fcMeaning: document.getElementById('fc-meaning'),
  fcWhen: document.getElementById('fc-when'),
};

let cards = null;
let activeSpeakBtn = null;

function setVersion() {
  el.version.textContent = VERSION;
  el.footerVersion.textContent = VERSION;
  document.title = `Business English Tutor - ${VERSION}`;
}

function clearActiveRow() {
  document.querySelectorAll('.phrase-table tbody tr.is-active').forEach((r) => {
    r.classList.remove('is-active');
  });
  if (activeSpeakBtn) {
    activeSpeakBtn.classList.remove('speaking');
    activeSpeakBtn = null;
  }
}

function createSpeakButton(text, label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'speak-btn';
  btn.textContent = '🔊';
  btn.setAttribute('aria-label', `Play ${label}`);
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearActiveRow();
    activeSpeakBtn = btn;
    btn.classList.add('speaking');
    speechService.speakText(text, {
      onEnd: () => btn.classList.remove('speaking'),
      onError: () => btn.classList.remove('speaking'),
    });
  });
  return btn;
}

function renderTable(phrases) {
  el.tbody.innerHTML = '';
  phrases.forEach((p) => {
    const tr = document.createElement('tr');
    tr.dataset.id = p.id;

    const tdPhrase = document.createElement('td');
    const phraseWrap = document.createElement('div');
    phraseWrap.className = 'phrase-word';
    phraseWrap.appendChild(createSpeakButton(p.phrase, 'phrase'));
    const phraseTxt = document.createElement('span');
    phraseTxt.textContent = p.phrase;
    phraseWrap.appendChild(phraseTxt);
    tdPhrase.appendChild(phraseWrap);
    tdPhrase.appendChild(Object.assign(document.createElement('span'), {
      className: 'category-tag',
      textContent: p.category,
    }));

    const tdMeaning = document.createElement('td');
    tdMeaning.textContent = p.meaning;

    const tdWhen = document.createElement('td');
    const whenWrap = document.createElement('div');
    whenWrap.className = 'phrase-word';
    whenWrap.appendChild(createSpeakButton(p.whenToUse, 'example'));
    const whenTxt = document.createElement('span');
    whenTxt.textContent = p.whenToUse;
    whenWrap.appendChild(whenTxt);
    tdWhen.appendChild(whenWrap);

    tr.appendChild(tdPhrase);
    tr.appendChild(tdMeaning);
    tr.appendChild(tdWhen);
    el.tbody.appendChild(tr);
  });
}

function renderPoolStats() {
  const stats = phraseEngine.getPoolStats();
  el.poolStats.textContent = `${stats.total} phrases in bank · ${stats.seen} shown · ${stats.remaining} remaining`;
}

function highlightRow(id) {
  clearActiveRow();
  const row = el.tbody.querySelector(`tr[data-id="${id}"]`);
  if (row) row.classList.add('is-active');
}

function renderFlashcard() {
  const card = cards.getCurrent();
  if (!card) return;
  el.fcCategory.textContent = card.category;
  el.fcCategoryBack.textContent = card.category;
  el.fcPhrase.textContent = card.phrase;
  el.fcMeaning.textContent = card.meaning;
  el.fcWhen.textContent = `"${card.whenToUse}"`;
  el.fcCounter.textContent = `Card ${cards.getCardNumber()} of ${cards.getTotal()}`;
  el.flashcard.classList.toggle('is-flipped', cards.isFlipped);
  const mastered = cards.isMastered(card.id);
  el.fcMastered.textContent = mastered ? '✓ Mastered' : '✓ Mark as Mastered';
  el.fcMastered.classList.toggle('btn-accent', mastered);
}

function attachFlashcardSpeech() {
  const frontBtn = el.flashcard.querySelector('.flashcard-front .fc-speak');
  const backBtn = el.flashcard.querySelector('.flashcard-back .speak-btn');

  frontBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = cards.getCurrent();
    if (!card) return;
    speechService.speakText(card.phrase);
  });

  backBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = cards.getCurrent();
    if (!card) return;
    speechService.speakText(card.whenToUse);
  });
}

function setupFlashcardControls() {
  el.fcPrev.addEventListener('click', () => {
    cards.previous();
    renderFlashcard();
  });
  el.fcNext.addEventListener('click', () => {
    cards.next();
    renderFlashcard();
  });
  el.fcFlip.addEventListener('click', () => {
    cards.flip();
    renderFlashcard();
  });
  el.flashcard.addEventListener('click', () => {
    cards.flip();
    renderFlashcard();
  });
  el.fcShuffle.addEventListener('click', () => {
    cards.shuffle();
    renderFlashcard();
  });
  el.fcMastered.addEventListener('click', () => {
    const card = cards.getCurrent();
    if (card) {
      cards.toggleMastered(card.id);
      renderFlashcard();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      cards.previous();
      renderFlashcard();
    } else if (e.key === 'ArrowRight') {
      cards.next();
      renderFlashcard();
    }
  });
}

function setupSettings() {
  const savedRate = getItem(STORAGE_KEYS.rate, 1);
  const rate = typeof savedRate === 'number' ? savedRate : 1;
  el.rateSlider.value = String(rate);
  el.rateValue.textContent = `${Number(rate).toFixed(1)}x`;
  speechService.rate = rate;

  el.rateSlider.addEventListener('input', () => {
    const value = parseFloat(el.rateSlider.value);
    speechService.setRate(value);
    el.rateValue.textContent = `${value.toFixed(1)}x`;
  });

  el.voiceSelect.addEventListener('change', () => {
    speechService.setVoice(el.voiceSelect.value);
  });
}

function populateVoices() {
  const current = el.voiceSelect.value || getItem(STORAGE_KEYS.voiceName, null);
  el.voiceSelect.innerHTML = '';
  const voices = speechService.voices;
  if (!voices.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'System default';
    el.voiceSelect.appendChild(opt);
    return;
  }
  const usVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en-us'));
  const otherVoices = voices.filter((v) => !v.lang.toLowerCase().startsWith('en-us'));
  [...usVoices, ...otherVoices].forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = v.name;
    el.voiceSelect.appendChild(opt);
  });
  if (current && [...el.voiceSelect.options].some((o) => o.value === current)) {
    el.voiceSelect.value = current;
  }
}

function setupPlayStatus() {
  speechService.onProgress = (step) => {
    highlightRow(step.id);
    el.playStatus.textContent = step.type === 'phrase'
      ? `Playing phrase ${step.index + 1} of ${cards.getTotal()}...`
      : `Playing example ${step.index + 1} of ${cards.getTotal()}...`;
    el.playStatus.classList.add('active');
  };
  speechService.onComplete = () => {
    el.playStatus.textContent = '';
    el.playStatus.classList.remove('active');
    el.btnPlayAll.disabled = false;
    el.btnStop.disabled = true;
    clearActiveRow();
  };
}

function generateAndRender() {
  clearActiveRow();
  speechService.stop();
  const batch = phraseEngine.generateBatch(10);
  cards.setPhrases(batch);
  renderTable(batch);
  renderFlashcard();
  renderPoolStats();
  el.playStatus.textContent = '';
}

function init() {
  setVersion();
  phraseEngine.init();
  speechService.init();

  cards = new Flashcards([]);
  setupSettings();
  setupFlashcardControls();
  setupPlayStatus();
  attachFlashcardSpeech();

  speechService.onVoicesChanged = populateVoices;
  populateVoices();

  el.btnGenerate.addEventListener('click', generateAndRender);
  el.btnTryNow.addEventListener('click', generateAndRender);

  el.btnPlayAll.addEventListener('click', () => {
    const batch = phraseEngine.getCurrentBatch();
    if (!batch.length) {
      generateAndRender();
    }
    const phrases = phraseEngine.getCurrentBatch();
    if (!phrases.length) return;
    clearActiveRow();
    el.btnPlayAll.disabled = true;
    el.btnStop.disabled = false;
    speechService.playAll(phrases);
  });

  el.btnStop.addEventListener('click', () => {
    speechService.stop();
    el.btnPlayAll.disabled = false;
    el.btnStop.disabled = true;
    el.playStatus.textContent = '';
  });

  generateAndRender();
}

init();
