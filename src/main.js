import { phraseEngine } from './modules/phraseEngine.js';
import { speechService } from './modules/speechService.js';
import Flashcards from './modules/flashcards.js';
import { getItem, setItem, removeItem, STORAGE_KEYS } from './utils/storage.js';
import { EMAIL_PHRASES } from './data/emailPhrases.js';

const VERSION = 'v1.20.1';

const el = {
  version: document.getElementById('app-version'),
  footerVersion: document.getElementById('footer-version'),
  btnGenerate: document.getElementById('btn-generate'),
  btnTryNow: document.getElementById('btn-try-now'),
  btnViewAll: document.getElementById('btn-view-all'),
  btnPlayAll: document.getElementById('btn-play-all'),
  btnStop: document.getElementById('btn-stop'),
  btnPrev: document.getElementById('btn-prev'),
  btnPause: document.getElementById('btn-pause'),
  btnNext: document.getElementById('btn-next'),
  playStatus: document.getElementById('play-status'),
  voiceSelect: document.getElementById('voice-select'),
  rateSlider: document.getElementById('rate-slider'),
  rateValue: document.getElementById('rate-value'),
  poolStats: document.getElementById('pool-stats'),
  tbody: document.getElementById('phrase-tbody'),
  bmTbody: document.getElementById('bookmark-tbody'),
  bmCount: document.getElementById('bookmark-count'),
  bmPlayStatus: document.getElementById('bookmark-play-status'),
  btnPlayBookmarks: document.getElementById('btn-play-bookmarks'),
  btnClearBookmarks: document.getElementById('btn-clear-bookmarks'),
  btnPlayEmail: document.getElementById('btn-play-email'),
  emailCount: document.getElementById('email-count'),
  emailPlayStatus: document.getElementById('email-play-status'),
  emailGroups: document.getElementById('email-groups'),
  searchInput: document.getElementById('search-input'),
  btnSearchClear: document.getElementById('btn-search-clear'),
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
let currentPhrases = [];
let viewMode = 'batch'; // 'batch' | 'all'
let bookmarks = new Set();
let playSource = 'main'; // 'main' | 'bookmarks' | 'email'
let searchQuery = '';

function setVersion() {
  el.version.textContent = VERSION;
  el.footerVersion.textContent = VERSION;
  document.title = `BET — Business English Tutor (${VERSION})`;
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

function groupByCategory(phrases) {
  const groups = new Map();
  phrases.forEach((p) => {
    if (!groups.has(p.category)) groups.set(p.category, []);
    groups.get(p.category).push(p);
  });
  return groups;
}

function matchesPhrase(item, query) {
  const q = query.toLowerCase();
  const haystack = [
    item.phrase,
    item.meaning,
    item.category,
    item.whenToUse,
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(q);
}

function filterForSearch(list) {
  return searchQuery ? list.filter((p) => matchesPhrase(p, searchQuery)) : list;
}

function createRow(p) {
  const tr = document.createElement('tr');
  tr.dataset.id = p.id;

  const tdStar = document.createElement('td');
  const starBtn = document.createElement('button');
  starBtn.type = 'button';
  starBtn.className = 'bookmark-btn';
  starBtn.textContent = '★';
  starBtn.setAttribute('aria-label', bookmarks.has(p.id) ? `Remove ${p.phrase} from bookmarks` : `Bookmark ${p.phrase}`);
  starBtn.classList.toggle('is-bookmarked', bookmarks.has(p.id));
  starBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBookmark(p.id);
  });
  tdStar.appendChild(starBtn);
  tr.appendChild(tdStar);

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
  return tr;
}

function createGroupHeader(category, count) {
  const tr = document.createElement('tr');
  tr.className = 'group-header-row';
  tr.setAttribute('role', 'button');
  tr.setAttribute('aria-expanded', 'true');
  tr.tabIndex = 0;

  const td = document.createElement('td');
  td.colSpan = 4;

  const toggle = document.createElement('span');
  toggle.className = 'group-toggle';
  toggle.textContent = '▾';

  const tag = document.createElement('span');
  tag.className = 'category-tag group-tag';
  tag.textContent = category;

  const countTxt = document.createElement('span');
  countTxt.className = 'group-count';
  countTxt.textContent = `${count} phrases`;

  td.appendChild(toggle);
  td.appendChild(tag);
  td.appendChild(countTxt);
  tr.appendChild(td);

  const setExpanded = (expanded) => {
    tr.classList.toggle('collapsed', !expanded);
    tr.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? '▾' : '▸';
    let node = tr.nextElementSibling;
    while (node && !node.classList.contains('group-header-row')) {
      node.classList.toggle('group-hidden', !expanded);
      node = node.nextElementSibling;
    }
  };

  const toggleCollapse = (e) => {
    e.stopPropagation();
    setExpanded(tr.classList.contains('collapsed'));
  };
  tr.addEventListener('click', toggleCollapse);
  tr.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCollapse(e);
    }
  });

  return tr;
}

function renderTable(phrases, mode = viewMode) {
  el.tbody.innerHTML = '';
  const list = filterForSearch(phrases);
  if (!list.length) {
    const tr = document.createElement('tr');
    tr.className = 'empty-row';
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = searchQuery ? `No phrases match "${searchQuery}".` : 'No phrases to display.';
    tr.appendChild(td);
    el.tbody.appendChild(tr);
    return;
  }
  if (mode === 'all') {
    const groups = groupByCategory(list);
    for (const [category, items] of groups) {
      el.tbody.appendChild(createGroupHeader(category, items.length));
      items.forEach((p) => el.tbody.appendChild(createRow(p)));
    }
  } else {
    list.forEach((p) => el.tbody.appendChild(createRow(p)));
  }
}

const bookmarkedPhrases = () => phraseEngine.viewAll().filter((p) => bookmarks.has(p.id));

function persistBookmarks() {
  setItem(STORAGE_KEYS.bookmarkedIds, [...bookmarks]);
}

function toggleBookmark(id) {
  if (bookmarks.has(id)) {
    bookmarks.delete(id);
  } else {
    bookmarks.add(id);
  }
  persistBookmarks();
  const phrase = phraseEngine.viewAll().find((p) => p.id === id);
  const label = phrase ? phrase.phrase : '';
  document.querySelectorAll('.bookmark-btn').forEach((btn) => {
    const row = btn.closest('tr');
    if (row && row.dataset.id === id) {
      const isBookmarked = bookmarks.has(id);
      btn.classList.toggle('is-bookmarked', isBookmarked);
      btn.setAttribute('aria-label', isBookmarked ? `Remove ${label} from bookmarks` : `Bookmark ${label}`);
    }
  });
  renderBookmarks();
}

function renderBookmarkTableRows() {
  const list = filterForSearch(bookmarkedPhrases());
  el.bmTbody.innerHTML = '';
  if (!list.length) {
    const tr = document.createElement('tr');
    tr.className = 'empty-row';
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = searchQuery
      ? `No bookmarked phrases match "${searchQuery}".`
      : 'No bookmarked phrases yet. Star a phrase in the Phrase Bank above to save it here.';
    tr.appendChild(td);
    el.bmTbody.appendChild(tr);
  } else {
    list.forEach((p) => el.bmTbody.appendChild(createRow(p)));
  }
  el.bmCount.textContent = `${bookmarkedPhrases().length} phrases`;
}

function renderBookmarkPlayStatus() {
  el.bmPlayStatus.textContent = bookmarks.size
    ? `${bookmarks.size} bookmarked phrase${bookmarks.size === 1 ? '' : 's'} ready to review.`
    : 'No bookmarks yet.';
}

function renderBookmarks() {
  renderBookmarkTableRows();
  renderBookmarkPlayStatus();
}

function playBookmarks() {
  clearActiveRow();
  speechService.stop();
  const list = bookmarkedPhrases();
  if (!list.length) {
    el.bmPlayStatus.textContent = 'Add a bookmark first, then play.';
    return;
  }
  playSource = 'bookmarks';
  el.bmPlayStatus.textContent = '';
  speechService.playAll(list);
  setPlayingControls(true);
  updatePauseButton();
}

function createEmailRow(p) {
  const row = document.createElement('div');
  row.className = 'email-row';
  row.dataset.id = p.id;

  const text = document.createElement('div');
  text.className = 'email-row-text';
  const phraseEl = document.createElement('strong');
  phraseEl.className = 'email-phrase';
  phraseEl.textContent = p.phrase;
  text.appendChild(phraseEl);
  const meaningEl = document.createElement('span');
  meaningEl.className = 'email-meaning';
  meaningEl.textContent = p.meaning;
  text.appendChild(meaningEl);

  row.appendChild(createSpeakButton(p.phrase, p.id));
  row.appendChild(text);
  return row;
}

function renderEmailSection() {
  el.emailGroups.innerHTML = '';
  const filtered = filterForSearch(EMAIL_PHRASES);
  const groups = groupByCategory(filtered);
  el.emailCount.textContent = `${filtered.length} of ${EMAIL_PHRASES.length} phrases`;

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'email-empty';
    empty.textContent = searchQuery
      ? `No email/conversation phrases match "${searchQuery}".`
      : 'No email/conversation phrases to display.';
    el.emailGroups.appendChild(empty);
    return;
  }

  for (const [category, items] of groups) {
    const sub = document.createElement('div');
    sub.className = 'email-group collapsed';

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'email-group-header';
    header.setAttribute('aria-expanded', 'false');

    const toggle = document.createElement('span');
    toggle.className = 'group-toggle';
    toggle.textContent = '▸';
    header.appendChild(toggle);

    const tag = document.createElement('span');
    tag.className = 'category-tag group-tag';
    tag.textContent = category;
    header.appendChild(tag);

    const countTxt = document.createElement('span');
    countTxt.className = 'group-count';
    countTxt.textContent = `${items.length} phrases`;
    header.appendChild(countTxt);

    const list = document.createElement('div');
    list.className = 'email-group-list';
    items.forEach((p) => list.appendChild(createEmailRow(p)));

    const setExpanded = (expanded) => {
      sub.classList.toggle('collapsed', !expanded);
      header.setAttribute('aria-expanded', String(expanded));
      toggle.textContent = expanded ? '▾' : '▸';
    };
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      setExpanded(sub.classList.contains('collapsed'));
    });

    sub.appendChild(header);
    sub.appendChild(list);
    el.emailGroups.appendChild(sub);
  }
}

function clearEmailActive() {
  el.emailGroups.querySelectorAll('.email-row.is-active').forEach((r) => {
    r.classList.remove('is-active');
  });
}

function highlightEmailStep(id) {
  clearEmailActive();
  const row = el.emailGroups.querySelector(`.email-row[data-id="${id}"]`);
  if (row) row.classList.add('is-active');
}

function playEmail() {
  clearActiveRow();
  clearEmailActive();
  speechService.stop();
  if (!EMAIL_PHRASES.length) return;
  playSource = 'email';
  el.emailPlayStatus.textContent = '';
  const steps = EMAIL_PHRASES.flatMap((p, i) => [
    { type: 'phrase', text: p.phrase, id: p.id, index: i },
    { type: 'example', text: p.meaning, id: p.id, index: i },
  ]);
  speechService.playFlattened(steps);
  setPlayingControls(true);
  updatePauseButton();
}

function renderPoolStats() {
  const stats = phraseEngine.getPoolStats();
  el.poolStats.textContent = `${stats.total} phrases in bank · ${stats.seen} shown · ${stats.remaining} remaining`;
}

function applySearch() {
  searchQuery = el.searchInput.value.trim();
  el.btnSearchClear.hidden = !searchQuery;
  if (searchQuery) {
    // Global: search across the entire bank (grouped), regardless of current view.
    renderTable(phraseEngine.viewAll(), 'all');
  } else {
    renderTable(currentPhrases, viewMode);
  }
  renderBookmarks();
  renderEmailSection();
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

function setPlayingControls(isPlaying) {
  el.btnPlayAll.disabled = isPlaying;
  el.btnStop.disabled = !isPlaying;
  el.btnPause.disabled = !isPlaying;
  el.btnPrev.disabled = !isPlaying;
  el.btnNext.disabled = !isPlaying;
  if (isPlaying) {
    el.btnPause.textContent = '⏸ Pause';
  } else {
    el.btnPause.textContent = '⏸ Pause';
  }
}

function updatePauseButton() {
  el.btnPause.textContent = speechService.isPaused ? '▶ Play' : '⏸ Pause';
}

function setupPlayStatus() {
  speechService.onProgress = (step) => {
    if (playSource === 'email') {
      clearActiveRow();
      highlightEmailStep(step.id);
      el.emailPlayStatus.textContent = `Playing ${step.index + 1} of ${EMAIL_PHRASES.length}...`;
      el.emailPlayStatus.classList.add('active');
      el.playStatus.textContent = '';
      el.playStatus.classList.remove('active');
      return;
    }
    highlightRow(step.id);
    const total = currentPhrases.length;
    el.playStatus.textContent = step.type === 'phrase'
      ? `Playing phrase ${step.index + 1} of ${total}...`
      : `Playing example ${step.index + 1} of ${total}...`;
    el.playStatus.classList.add('active');
  };
  speechService.onComplete = () => {
    el.playStatus.textContent = '';
    el.playStatus.classList.remove('active');
    el.emailPlayStatus.textContent = '';
    el.emailPlayStatus.classList.remove('active');
    setPlayingControls(false);
    updatePauseButton();
    clearActiveRow();
    clearEmailActive();
    playSource = 'main';
  };
  speechService.onStateChange = () => {
    updatePauseButton();
  };
}

function generateAndRender() {
  clearActiveRow();
  speechService.stop();
  const batch = phraseEngine.generateBatch(10);
  currentPhrases = batch;
  viewMode = 'batch';
  cards.setPhrases(batch);
  renderTable(batch, 'batch');
  renderFlashcard();
  renderPoolStats();
  el.playStatus.textContent = '';
  setPlayingControls(false);
  updatePauseButton();
}

function viewAllAndRender() {
  clearActiveRow();
  speechService.stop();
  const all = phraseEngine.getPoolStats();
  const phrases = phraseEngine.viewAll();
  currentPhrases = phrases;
  viewMode = 'all';
  cards.setPhrases(phrases);
  renderTable(phrases, 'all');
  renderFlashcard();
  renderPoolStats();
  el.playStatus.textContent = `Showing all ${phrases.length} phrases in the bank, grouped by category.`;
  el.playStatus.classList.add('active');
  setPlayingControls(false);
  updatePauseButton();
}

function init() {
  setVersion();
  phraseEngine.init();
  speechService.init();

  bookmarks = new Set(getItem(STORAGE_KEYS.bookmarkedIds, []) || []);

  cards = new Flashcards([]);
  setupSettings();
  setupFlashcardControls();
  setupPlayStatus();
  attachFlashcardSpeech();

  speechService.onVoicesChanged = populateVoices;
  populateVoices();

  el.btnGenerate.addEventListener('click', generateAndRender);
  el.btnTryNow.addEventListener('click', generateAndRender);
  el.btnViewAll.addEventListener('click', viewAllAndRender);

  el.btnPlayBookmarks.addEventListener('click', playBookmarks);
  el.btnClearBookmarks.addEventListener('click', () => {
    bookmarks.clear();
    persistBookmarks();
    renderTable(currentPhrases, viewMode);
    renderBookmarks();
  });

  el.btnPlayEmail.addEventListener('click', playEmail);

  el.searchInput.addEventListener('input', applySearch);
  el.btnSearchClear.addEventListener('click', () => {
    el.searchInput.value = '';
    applySearch();
    el.searchInput.focus();
  });

  el.btnPlayAll.addEventListener('click', () => {
    if (!currentPhrases.length) {
      generateAndRender();
    }
    if (!currentPhrases.length) return;
    clearActiveRow();
    speechService.playAll(currentPhrases);
    setPlayingControls(true);
    updatePauseButton();
  });

  el.btnStop.addEventListener('click', () => {
    speechService.stop();
    setPlayingControls(false);
    updatePauseButton();
    el.playStatus.textContent = '';
  });

  el.btnPause.addEventListener('click', () => {
    speechService.togglePause();
    updatePauseButton();
  });

  el.btnPrev.addEventListener('click', () => {
    speechService.previous();
    updatePauseButton();
  });

  el.btnNext.addEventListener('click', () => {
    speechService.next();
    updatePauseButton();
  });

  setPlayingControls(false);
  generateAndRender();
  renderBookmarks();
  renderEmailSection();
}

init();
