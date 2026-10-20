import { ALL_PHRASES } from '../data/phrases.js';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '../utils/storage.js';

function fisherYatesShuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

class PhraseEngine {
  constructor() {
    this.seenIds = [];
    this.currentBatch = [];
  }

  init() {
    this.seenIds = getItem(STORAGE_KEYS.seenIds, []) || [];
    return this;
  }

  generateBatch(count = 10) {
    const pool = fisherYatesShuffle(
      ALL_PHRASES.filter((p) => !this.seenIds.includes(p.id))
    );

    if (pool.length >= count) {
      this.currentBatch = pool.slice(0, count);
    } else {
      // Recycle: clear history, then sample from the full pool.
      this.seenIds = [];
      const fullPool = fisherYatesShuffle(ALL_PHRASES);
      this.currentBatch = fullPool.slice(0, count);
    }

    this.seenIds.push(...this.currentBatch.map((p) => p.id));
    setItem(STORAGE_KEYS.seenIds, this.seenIds);
    return this.currentBatch;
  }

  getCurrentBatch() {
    return this.currentBatch;
  }

  viewAll() {
    return [...ALL_PHRASES];
  }

  resetHistory() {
    this.seenIds = [];
    removeItem(STORAGE_KEYS.seenIds);
  }

  getPoolStats() {
    const remaining = ALL_PHRASES.filter((p) => !this.seenIds.includes(p.id)).length;
    return {
      total: ALL_PHRASES.length,
      seen: this.seenIds.length,
      remaining,
    };
  }
}

export const phraseEngine = new PhraseEngine();
export default PhraseEngine;
