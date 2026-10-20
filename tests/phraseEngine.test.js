import { describe, it, expect, beforeEach, vi } from 'vitest';
import PhraseEngine from '../src/modules/phraseEngine.js';
import { ALL_PHRASES } from '../src/data/phrases.js';

describe('PhraseEngine', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('generates exactly 10 phrases per batch', () => {
    const engine = new PhraseEngine().init();
    const batch = engine.generateBatch(10);
    expect(batch).toHaveLength(10);
  });

  it('does not duplicate phrases across consecutive generations', () => {
    const engine = new PhraseEngine().init();
    const batch1 = engine.generateBatch(10);
    const batch2 = engine.generateBatch(10);
    const all = [...batch1, ...batch2].map((p) => p.id);
    expect(new Set(all).size).toBe(20);
  });

  it('recycles gracefully when all phrases in pool are exhausted', () => {
    const engine = new PhraseEngine().init();
    // Exhaust most of the pool so a fresh batch cannot be filled.
    const total = ALL_PHRASES.length;
    engine.seenIds = ALL_PHRASES.slice(0, total - 3).map((p) => p.id);
    const batch = engine.generateBatch(10);
    expect(batch).toHaveLength(10);
    // History was recycled, so overall seen count should equal batch size.
    expect(engine.seenIds).toHaveLength(10);
  });

  it('contains all required fields: id, phrase, meaning, whenToUse', () => {
    const engine = new PhraseEngine().init();
    const batch = engine.generateBatch(10);
    for (const p of batch) {
      expect(typeof p.id).toBe('string');
      expect(typeof p.phrase).toBe('string');
      expect(typeof p.meaning).toBe('string');
      expect(typeof p.whenToUse).toBe('string');
      expect(p.id.length).toBeGreaterThan(0);
      expect(p.phrase.length).toBeGreaterThan(0);
      expect(p.meaning.length).toBeGreaterThan(0);
      expect(p.whenToUse.length).toBeGreaterThan(0);
    }
  });

  it('reports pool stats correctly', () => {
    const engine = new PhraseEngine().init();
    engine.generateBatch(10);
    const stats = engine.getPoolStats();
    expect(stats.total).toBe(ALL_PHRASES.length);
    expect(stats.seen).toBe(10);
    expect(stats.remaining).toBe(ALL_PHRASES.length - 10);
  });
});
