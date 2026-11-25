// A small guard against spam, before a letter is sent. The site is static,
// so all of this happens in the browser: it stops simple robots and a child
// pressing "send" again and again, not someone who knows programming (the
// form itself should also limit the length of the answers, see README.md).
//
//   trap     a text box people never see; robots fill in every box they find
//   too fast a letter sent in the first seconds after the page opened was
//            not written by a child
//   length   the message and the name are not longer than the limits
//   pause    after a letter has gone, the next one waits a little; the time
//            is kept in the browser, so a reload does not skip it

import { LIMITS } from './config.js';

const LAST_SENT_KEY = 'scrisori-pentru-bubu:last-sent';

export class Guard {
  constructor({ trap }) {
    this.trap = trap;
    this.openedAt = Date.now();
  }

  /**
   * What to do with the letter:
   *   "send"      everything is fine
   *   "robot"     drop it quietly (the robot is shown that it worked)
   *   "too-long"  the message or the name is too long
   *   "pause"     a letter has just gone: wait pauseLeft() seconds
   */
  check({ message, name }) {
    if (this.trap.value !== '') return 'robot';
    if (Date.now() - this.openedAt < LIMITS.minSecondsOnPage * 1000) return 'robot';
    if (message.length > LIMITS.message || name.length > LIMITS.name) return 'too-long';
    if (this.pauseLeft() > 0) return 'pause';
    return 'send';
  }

  /** Remembers that a letter has just gone: the pause starts now. */
  sent() {
    try {
      localStorage.setItem(LAST_SENT_KEY, String(Date.now()));
    } catch { /* without storage the pause lasts only while the page is open */ }
    this.lastSent = Date.now();
  }

  /** Seconds left until the next letter may go (0 when it may go now). */
  pauseLeft() {
    let last = this.lastSent || 0;
    try {
      last = Math.max(last, Number(localStorage.getItem(LAST_SENT_KEY)) || 0);
    } catch { /* no storage */ }
    const left = last + LIMITS.pauseSeconds * 1000 - Date.now();
    // a clock turned back must not lock the button for ever
    if (left > LIMITS.pauseSeconds * 1000) return 0;
    return Math.max(0, Math.ceil(left / 1000));
  }
}
