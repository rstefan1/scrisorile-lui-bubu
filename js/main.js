// Scrisori pentru Bubu — the entry point: wires the sheet of paper.

import { Letter } from './letter.js';

const $ = (id) => document.getElementById(id);

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

export { letter };
