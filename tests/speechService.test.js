import { describe, it, expect, beforeEach, vi } from 'vitest';
import SpeechService from '../src/modules/speechService.js';

class MockUtterance {
  constructor(text) {
    this.text = text;
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.lang = '';
    this.voice = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  }
}

const US_VOICE = { name: 'Google US English', lang: 'en-US' };
const UK_VOICE = { name: 'UK English Male', lang: 'en-GB' };

function setupMockSpeech() {
  const utterances = [];
  const synth = {
    speaking: false,
    paused: false,
    speak: vi.fn((u) => {
      utterances.push(u);
      if (u.onstart) u.onstart();
    }),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => [UK_VOICE, US_VOICE]),
    addEventListener: vi.fn(),
  };
  window.speechSynthesis = synth;
  window.SpeechSynthesisUtterance = MockUtterance;
  return { synth, utterances };
}

beforeEach(() => {
  delete window.speechSynthesis;
  delete window.SpeechSynthesisUtterance;
  vi.restoreAllMocks();
});

describe('SpeechService', () => {
  it('prioritizes en-US voices from available speech synthesis voices', () => {
    const { synth } = setupMockSpeech();
    const service = new SpeechService().init();
    synth.addEventListener.mock.calls.forEach(([event, handler]) => {
      if (event === 'voiceschanged') handler();
    });
    expect(service.voices[0].lang.startsWith('en-US')).toBe(true);
    expect(service.voices[0].name).toBe('Google US English');
    expect(service.selectedVoice.name).toBe('Google US English');
  });

  it('configures rate correctly on speech utterance', () => {
    setupMockSpeech();
    const service = new SpeechService().init();
    service.setRate(1.5);
    service.speakText('Hello team');
    const lastUtterance = window.speechSynthesis.speak.mock.calls.at(-1)[0];
    expect(lastUtterance.rate).toBe(1.5);
    expect(lastUtterance.lang).toBe('en-US');
  });

  it('sequences items properly during playAll execution', () => {
    vi.useFakeTimers();
    const { synth } = setupMockSpeech();
    const service = new SpeechService().init();
    const phrases = [
      { id: 'a', phrase: 'Phrase A', whenToUse: 'Example A', meaning: 'M' },
      { id: 'b', phrase: 'Phrase B', whenToUse: 'Example B', meaning: 'M' },
    ];
    const progress = [];
    service.playAll(phrases, { onProgress: (s) => progress.push(s) });

    // First step spoken immediately.
    expect(progress[0]).toMatchObject({ type: 'phrase', id: 'a', index: 0 });
    expect(synth.speak).toHaveBeenCalledTimes(1);

    // Advance through the queue manually via onend callbacks + timers.
    const step = () => {
      const utterances = synth.speak.mock.calls.filter((c) => c[0]);
      const last = utterances.at(-1)[0];
      last.onend();
      vi.runAllTimers();
    };
    step();
    step();
    step();

    expect(progress).toHaveLength(4);
    expect(progress[1]).toMatchObject({ type: 'example', id: 'a', index: 0 });
    expect(progress[2]).toMatchObject({ type: 'phrase', id: 'b', index: 1 });
    expect(progress[3]).toMatchObject({ type: 'example', id: 'b', index: 1 });
    vi.useRealTimers();
  });

  it('stops playback and cancels active speech', () => {
    setupMockSpeech();
    const service = new SpeechService().init();
    const phrases = [{ id: 'a', phrase: 'P', whenToUse: 'E', meaning: 'M' }];
    let completed = null;
    service.playAll(phrases, { onComplete: (r) => { completed = r; } });
    service.stop();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(completed).toEqual({ cancelled: true });
  });

  it('moves forward with next() and backward with previous()', () => {
    vi.useFakeTimers();
    const { synth } = setupMockSpeech();
    const service = new SpeechService().init();
    const phrases = [
      { id: 'a', phrase: 'Phrase A', whenToUse: 'Example A', meaning: 'M' },
      { id: 'b', phrase: 'Phrase B', whenToUse: 'Example B', meaning: 'M' },
    ];
    const progress = [];
    service.playAll(phrases, { onProgress: (s) => progress.push(s) });

    expect(progress[0]).toMatchObject({ type: 'phrase', id: 'a' });

    service.next();
    expect(progress.at(-1)).toMatchObject({ type: 'example', id: 'a' });

    service.next();
    expect(progress.at(-1)).toMatchObject({ type: 'phrase', id: 'b' });

    service.previous();
    expect(progress.at(-1)).toMatchObject({ type: 'example', id: 'a' });

    service.previous();
    expect(progress.at(-1)).toMatchObject({ type: 'phrase', id: 'a' });

    expect(synth.cancel).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('pauses and resumes playback correctly', () => {
    vi.useFakeTimers();
    setupMockSpeech();
    const service = new SpeechService().init();
    const phrases = [{ id: 'a', phrase: 'P', whenToUse: 'E', meaning: 'M' }];
    service.playAll(phrases);
    expect(service.isPaused).toBe(false);
    service.togglePause();
    expect(service.isPaused).toBe(true);
    service.togglePause();
    expect(service.isPaused).toBe(false);
    vi.useRealTimers();
  });
});
