// The sheet of paper: the letter grows line by line while the child writes,
// the bar under it shows how much room is left, and what is written is kept
// in the browser (a draft), so a reload or a closed tab does not lose it.

import { letters } from './words.js';

const DRAFT_KEY = 'scrisori-pentru-bubu:draft';

export class Letter {
  constructor({ form, message, name, room, roomFill, roomText }) {
    this.form = form;
    this.message = message;
    this.name = name;
    this.room = room;
    this.roomFill = roomFill;
    this.roomText = roomText;
    this.max = message.maxLength;

    this.restoreDraft();
    this.update();

    message.addEventListener('input', () => {
      this.update();
      this.saveDraft();
      this.hop();
    });
    name.addEventListener('input', () => this.saveDraft());
    // the lines change size with the window
    window.addEventListener('resize', () => this.grow());
    // the handwriting font may arrive after the first drawing
    document.fonts?.ready.then(() => this.grow());
  }

  /** The letter as it will be sent (spaces around it removed). */
  read() {
    return {
      message: this.message.value.trim(),
      name: this.name.value.trim(),
    };
  }

  isEmpty() {
    return this.read().message.length === 0;
  }

  /** After the letter has gone: a clean sheet, but the name stays. */
  clearMessage() {
    this.message.value = '';
    this.update();
    this.saveDraft();
  }

  focus() {
    this.message.focus({ preventScroll: true });
  }

  /** The sheet shakes and the cursor goes into it: there is nothing to send. */
  shake() {
    this.form.classList.remove('is-empty');
    void this.form.offsetWidth; // restart the animation
    this.form.classList.add('is-empty');
    this.focus();
  }

  update() {
    this.grow();
    this.showRoom();
  }

  /** The textarea is always a whole number of notebook lines high. */
  grow() {
    const ta = this.message;
    const line = parseFloat(getComputedStyle(ta).lineHeight) || 48;
    ta.style.height = 'auto';
    const lines = Math.max(5, Math.ceil((ta.scrollHeight - 1) / line));
    ta.style.height = `${lines * line}px`;
  }

  showRoom() {
    const used = this.message.value.length;
    const left = Math.max(0, this.max - used);
    this.roomFill.style.transform = `scaleX(${left / this.max})`;
    this.room.classList.toggle('is-low', left > 0 && left <= this.max * 0.15);
    this.room.classList.toggle('is-full', left === 0);
    this.roomText.textContent = left === 0
      ? 'Foaia e plină!'
      : `Mai ai loc de ${letters(left)}`;
  }

  hop() {
    clearTimeout(this.hopTimer);
    this.form.classList.add('is-writing');
    this.hopTimer = setTimeout(() => this.form.classList.remove('is-writing'), 450);
  }

  saveDraft() {
    try {
      const draft = { message: this.message.value, name: this.name.value };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch { /* private mode or full storage: the draft is simply not kept */ }
  }

  restoreDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (!draft) return;
      this.message.value = String(draft.message || '').slice(0, this.max);
      this.name.value = String(draft.name || '').slice(0, this.name.maxLength);
    } catch { /* a broken draft is ignored */ }
  }
}
