// Scrisori pentru Bubu — the entry point: the sheet of paper, the send
// button and the cards shown after the letter has gone (or has not).

import { LIMITS } from './config.js';
import { Letter } from './letter.js';
import { sendLetter } from './send.js';

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

  setBusy(true);
  try {
    await sendLetter(letter.read());
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
  sendButton.setAttribute('aria-disabled', String(on));
  sendLabel.textContent = on ? 'Se trimite…' : 'Trimite scrisoarea';
}

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

function showNote(text) {
  note.textContent = text;
  note.hidden = false;
}

function hideNote() {
  note.hidden = true;
}
