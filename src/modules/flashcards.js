class Flashcards {
  constructor(phrases = []) {
    this.phrases = phrases;
    this.order = phrases.map((p, i) => i);
    this.currentIndex = 0;
    this.isFlipped = false;
    this.mastered = new Set();
    this.isShuffled = false;
    this.onChange = () => {};
  }

  setPhrases(phrases) {
    this.phrases = phrases;
    this.order = phrases.map((p, i) => i);
    this.currentIndex = 0;
    this.isFlipped = false;
    this.isShuffled = false;
    this.onChange();
  }

  getCurrent() {
    if (!this.phrases.length) return null;
    return this.phrases[this.order[this.currentIndex]];
  }

  getCardNumber() {
    return this.phrases.length ? this.currentIndex + 1 : 0;
  }

  getTotal() {
    return this.phrases.length;
  }

  flip() {
    this.isFlipped = !this.isFlipped;
    this.onChange();
    return this.isFlipped;
  }

  next() {
    if (!this.phrases.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.phrases.length;
    this.isFlipped = false;
    this.onChange();
  }

  previous() {
    if (!this.phrases.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.phrases.length) % this.phrases.length;
    this.isFlipped = false;
    this.onChange();
  }

  shuffle() {
    this.order = [...Array(this.phrases.length).keys()];
    for (let i = this.order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.order[i], this.order[j]] = [this.order[j], this.order[i]];
    }
    this.isShuffled = true;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.onChange();
  }

  resetOrder() {
    this.order = this.phrases.map((p, i) => i);
    this.isShuffled = false;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.onChange();
  }

  toggleMastered(id) {
    if (this.mastered.has(id)) {
      this.mastered.delete(id);
    } else {
      this.mastered.add(id);
    }
    this.onChange();
    return this.mastered.has(id);
  }

  isMastered(id) {
    return this.mastered.has(id);
  }
}

export default Flashcards;
