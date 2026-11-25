// Scrisori pentru Bubu — the entry point: the sheet of paper, the send
// button and the cards shown after the letter has gone (or has not).

import { LIMITS } from './config.js';
import { Guard } from './guard.js';
import { setupLamp } from './lamp.js';
import { Letter } from './letter.js';
import { sendLetter } from './send.js';
import { seconds } from './words.js';

const $ = (id) => document.getElementById(id);

const screens = { desk: $('desk'), sent: $('sent'), failed: $('failed') };
const sendButton = $('send');
const sendLabel = $('send-label');
const note = $('send-note');

$('message').maxLength = LIMITS.message;
$('name').maxLength = LIMITS.name;

const letter = new Letter({
  form: $('letter'),
  message: $('message'),
  name: $('name'),
  room: $('room'),
  roomFill: $('room-fill'),
  roomText: $('room-text'),
});

const guard = new Guard({ trap: $('website') });

setupLamp($('lamp'));

// Enter in the name box must not reload the page
$('letter').addEventListener('submit', (event) => event.preventDefault());

sendButton.addEventListener('click', send);
$('again').addEventListener('click', () => show('desk'));
$('retry').addEventListener('click', () => show('desk'));

let busy = false;

async function send() {
  if (busy) return;
  hideNote();

  if (letter.isEmpty()) {
    letter.shake();
    showNote('Scrie-i ceva lui Bubu mai întâi!');
    return;
  }

  const verdict = guard.check(letter.read());
  if (verdict === 'robot') {
    // nothing is sent, but a robot must not learn that it was caught
    letter.clearMessage();
    show('sent');
    return;
  }
  if (verdict === 'too-long') {
    showNote('Scrisoarea e prea lungă pentru o singură foaie. Mai scurtează puțin!');
    return;
  }
  if (verdict === 'pause') {
    showNote(`Bubu încă citește scrisoarea ta de adineauri. Mai așteaptă ${seconds(guard.pauseLeft())}!`, { pause: true });
    return;
  }

  setBusy(true);
  try {
    await sendLetter(letter.read());
    guard.sent();
    letter.clearMessage();
    show('sent');
  } catch {
    show('failed');
  } finally {
    setBusy(false);
  }
}

function setBusy(on) {
  busy = on;
  sendButton.classList.toggle('is-busy', on);
  showButton();
}

/** The send button: busy, waiting for the pause to end, or ready. */
function showButton() {
  const left = guard.pauseLeft();
  sendButton.setAttribute('aria-disabled', String(busy || left > 0));
  if (busy) sendLabel.textContent = 'Se trimite…';
  else if (left > 0) sendLabel.textContent = `Mai așteaptă ${seconds(left)}`;
  else sendLabel.textContent = 'Trimite scrisoarea';
  // once the pause is over, its note goes away too
  if (left === 0 && note.dataset.pause) hideNote();
}

// the button counts down the pause, second by second
showButton();
setInterval(showButton, 1000);

/** Shows one screen: "desk" (the sheet), "sent" or "failed". */
function show(name) {
  for (const [key, el] of Object.entries(screens)) el.hidden = key !== name;
  document.querySelector('.main').classList.toggle('is-card', name !== 'desk');
  window.scrollTo({ top: 0 });
  if (name === 'desk') {
    letter.update();
    letter.focus();
  } else {
    screens[name].querySelector('.card-title').focus({ preventScroll: true });
  }
}

function showNote(text, { pause = false } = {}) {
  note.textContent = text;
  note.hidden = false;
  if (pause) note.dataset.pause = '1';
  else delete note.dataset.pause;
}

function hideNote() {
  note.hidden = true;
  delete note.dataset.pause;
}
