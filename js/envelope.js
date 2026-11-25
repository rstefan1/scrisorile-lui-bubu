// The envelope: the letter slides in, the flap closes and a stamp with
// Bubu lands on it (pack); then it flies away to Bubu (fly) or, when the
// letter could not go, shakes its head (refuse). The steps are classes on
// the envelope, styled in css/envelope.css.

const calm = matchMedia('(prefers-reduced-motion: reduce)');
const STEPS = ['is-in', 'is-closed', 'is-stamped', 'is-waiting', 'is-flying', 'is-back'];

export class Envelope {
  constructor({ envelope, words, text }) {
    this.el = envelope;
    this.words = words;
    this.text = text;
  }

  /** Puts the letter (its first words are seen) into a sealed, stamped envelope. */
  async pack(message) {
    this.el.classList.remove(...STEPS);
    this.words.textContent = message.length > 90 ? `${message.slice(0, 90)}…` : message;
    this.text.textContent = 'Pun scrisoarea în plic…';
    // the open envelope is drawn first, so the steps below are animated
    // (requestAnimationFrame would wait for ever in a tab in the background)
    void this.el.offsetWidth;
    await this.step('is-in', 800);
    await this.step('is-closed', 800);
    await this.step('is-stamped', 600);
    this.text.textContent = 'Scrisoarea pleacă spre Bubu…';
    this.el.classList.add('is-waiting');
  }

  async fly() {
    this.text.textContent = 'Zbooor!';
    this.el.classList.remove('is-waiting');
    await this.step('is-flying', 1000);
  }

  async refuse() {
    this.el.classList.remove('is-waiting');
    await this.step('is-back', 700);
  }

  async step(name, ms) {
    this.el.classList.add(name);
    await wait(calm.matches ? 150 : ms);
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
