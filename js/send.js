// Sends a letter to the Google Form, straight from the browser.
//
// Google does not let a page from another site read the form's answer, so
// the request is sent with mode "no-cors": the browser sends it, but hides
// the reply. What the page still learns:
//   - the promise is fulfilled  → the letter reached Google and Google answered;
//   - the promise is rejected   → no internet, Google could not be reached,
//                                 or it took too long.
// A letter that reached Google is saved, as long as the form accepts
// answers, needs no sign-in and its questions keep the ids in config.js.
//
// Testing without filling the form with letters (see README.md):
//   ?test        the letter "goes" after a moment, nothing is sent
//   ?test=fail   the letter does not go, as if there were no internet

import { FORM, LIMITS } from './config.js';

const test = new URLSearchParams(location.search).get('test');

export async function sendLetter({ message, name }) {
  if (test !== null) return pretend(test === 'fail');
  if (navigator.onLine === false) throw new Error('offline');

  const body = new URLSearchParams();
  body.set(FORM.fields.message, message);
  if (name) body.set(FORM.fields.name, name);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIMITS.timeoutSeconds * 1000);
  try {
    await fetch(FORM.action, {
      method: 'POST',
      mode: 'no-cors',
      body,
      // the child's Google account (if any) has nothing to do with the letter
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function pretend(fail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (fail ? reject(new Error('test')) : resolve()), 1200);
  });
}
