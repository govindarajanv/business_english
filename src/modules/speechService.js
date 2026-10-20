import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';

function getSpeechSynthesis() {
  return typeof window !== 'undefined' ? window.speechSynthesis : null;
}

function getVoices() {
  const synth = getSpeechSynthesis();
  return synth && typeof synth.getVoices === 'function' ? synth.getVoices() : [];
}

function sortUSVoicesFirst(voices) {
  const isUS = (v) => (v.lang || '').toLowerCase().startsWith('en-us');
  return [...voices].sort((a, b) => Number(isUS(b)) - Number(isUS(a)));
}

class SpeechService {
  constructor() {
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.queue = [];
    this.isPlaying = false;
    this.isPaused = false;
    this.currentStep = null;
    this.onVoicesChanged = () => {};
    this.onProgress = () => {};
    this.onComplete = () => {};
    this.onStateChange = () => {};
    this._handlers = [];
  }

  init() {
    const synth = getSpeechSynthesis();
    if (synth && typeof synth.addEventListener === 'function') {
      const handler = () => this._resolveVoices();
      synth.addEventListener('voiceschanged', handler);
      this._handlers.push(handler);
    }
    this._resolveVoices();

    const savedRate = getItem(STORAGE_KEYS.rate, null);
    if (typeof savedRate === 'number' && savedRate >= 0.5 && savedRate <= 2) {
      this.rate = savedRate;
    }
    const savedVoice = getItem(STORAGE_KEYS.voiceName, null);
    if (typeof savedVoice === 'string') {
      this.selectedVoiceName = savedVoice;
    }
    this.selectedVoice = this._findVoice(this.selectedVoiceName);
    return this;
  }

  _resolveVoices() {
    this.voices = sortUSVoicesFirst(getVoices());
    this.selectedVoice = this._findVoice(this.selectedVoiceName) || this.voices[0] || null;
    if (typeof this.onVoicesChanged === 'function') {
      this.onVoicesChanged(this.voices);
    }
  }

  _findVoice(name) {
    if (!name) return null;
    return this.voices.find((v) => v.name === name) || null;
  }

  setRate(rate) {
    this.rate = Math.min(2, Math.max(0.5, rate));
    setItem(STORAGE_KEYS.rate, this.rate);
    return this.rate;
  }

  setVoice(voiceName) {
    this.selectedVoice = this._findVoice(voiceName);
    this.selectedVoiceName = voiceName;
    setItem(STORAGE_KEYS.voiceName, voiceName);
  }

  _buildUtterance(text, { onStart, onEnd, onError } = {}) {
    const synth = getSpeechSynthesis();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = 'en-US';
    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;
    if (synth) synth.speak(utterance);
    return utterance;
  }

  speakText(text, { onStart, onEnd, onError } = {}) {
    const synth = getSpeechSynthesis();
    if (synth && this.isSpeaking()) {
      synth.cancel();
    }
    this._buildUtterance(text, { onStart, onEnd, onError });
  }

  isSpeaking() {
    const synth = getSpeechSynthesis();
    return !!synth && synth.speaking;
  }

  speakPhrase(phrase, { onStart, onEnd } = {}) {
    this.speakText(phrase, { onStart, onEnd });
  }

  speakExample(sentence, { onStart, onEnd } = {}) {
    this.speakText(sentence, { onStart, onEnd });
  }

  _flattenQueue(phrases) {
    return phrases.flatMap((p) => [
      { type: 'phrase', text: p.phrase, id: p.id, index: phrases.indexOf(p) },
      { type: 'example', text: p.whenToUse, id: p.id, index: phrases.indexOf(p) },
    ]);
  }

  playAll(phrases, { onProgress, onComplete, onStateChange } = {}) {
    if (onProgress) this.onProgress = onProgress;
    if (onComplete) this.onComplete = onComplete;
    if (onStateChange) this.onStateChange = onStateChange;

    const synth = getSpeechSynthesis();
    if (synth) synth.cancel();

    this.queue = this._flattenQueue(phrases);
    this.isPlaying = true;
    this.isPaused = false;
    this.currentStep = 0;
    this._emitState();
    this._playStep();
  }

  _playStep() {
    const step = this.queue[this.currentStep];
    if (!step) {
      this._finish();
      return;
    }

    if (typeof this.onProgress === 'function') {
      this.onProgress({ ...step });
    }

    this.isPlaying = true;
    this._buildUtterance(step.text, {
      onEnd: () => {
        this.currentStep += 1;
        setTimeout(() => {
          if (!this.isPaused) this._playStep();
        }, step.type === 'example' ? 400 : 150);
      },
      onError: () => {
        this.currentStep += 1;
        setTimeout(() => {
          if (!this.isPaused) this._playStep();
        }, 150);
      },
    });
  }

  pause() {
    const synth = getSpeechSynthesis();
    if (synth && "pause" in synth) synth.pause();
    this.isPaused = true;
    this._emitState();
  }

  resume() {
    const synth = getSpeechSynthesis();
    if (synth && "resume" in synth) synth.resume();
    this.isPaused = false;
    if (synth && !synth.speaking) {
      this._playStep();
    }
    this._emitState();
  }

  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else if (this.isPlaying) {
      this.pause();
    }
    return this.isPaused;
  }

  next() {
    const synth = getSpeechSynthesis();
    if (synth) synth.cancel();
    this.isPaused = false;
    const total = this.queue.length;
    if (!total) return;
    this.currentStep = total - 1 === this.currentStep ? 0 : this.currentStep + 1;
    this._playStep();
  }

  previous() {
    const synth = getSpeechSynthesis();
    if (synth) synth.cancel();
    this.isPaused = false;
    const total = this.queue.length;
    if (!total) return;
    this.currentStep = this.currentStep === 0 ? total - 1 : this.currentStep - 1;
    this._playStep();
  }

  getCurrentSentence() {
    const step = this.queue[this.currentStep];
    return step ? step.text : '';
  }

  stop() {
    const synth = getSpeechSynthesis();
    if (synth) synth.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentStep = null;
    this.queue = [];
    if (typeof this.onComplete === 'function') {
      this.onComplete({ cancelled: true });
    }
    this._emitState();
  }

  _finish() {
    this.isPlaying = false;
    this.isPaused = false;
    if (typeof this.onComplete === 'function') {
      this.onComplete({ cancelled: false });
    }
    this._emitState();
  }

  _emitState() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        currentStep: this.currentStep,
      });
    }
  }
}

export const speechService = new SpeechService();
export default SpeechService;
