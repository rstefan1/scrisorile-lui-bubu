# Scrisori pentru Bubu

A page where children write a letter to Bubu, the plush ladybug. The letter
is written on a sheet of notebook paper lying on a wooden table, goes into an
envelope with a stamp and flies away to Bubu; behind the scenes it is sent to
a Google Form, so every letter ends up in the form's answers (and its Google
Sheet).

Plain static HTML, CSS and JavaScript modules: no libraries, no build step, no
server code. It works on laptops, tablets and phones. The code is in English;
the text on the page is in Romanian.

## Structure

```
index.html          the page: the table, the sheet, the envelope and the cards after sending
css/tokens.css      colours, fonts and sizes
css/page.css        the title, the buttons, the footer
css/desk.css        the wooden table, the desk lamp and the things lying on the table
css/letter.css      the sheet of notebook paper and the "room left" bar
css/post.css        the send button and the cards ("it reached Bubu" / "it did not go")
css/envelope.css    the envelope animation
js/config.js        the Google Form's address, its question ids and the limits
js/main.js          the entry point: wires everything together
js/letter.js        the sheet: grows line by line, counts the room left, keeps a draft
js/guard.js         the guard against spam
js/send.js          sends the letter to the Google Form
js/envelope.js      the steps of the envelope animation
js/lamp.js          the desk lamp (a tap turns its bulb off and on)
js/words.js         Romanian words that change with a number ("3 litere", "20 de litere")
assets/             Bubu, the favicon and the icon
serve.py            local development server
```

## Running locally

The page uses JavaScript modules, so it must be served over HTTP (opening
`index.html` from disk does not work):

```sh
python3 serve.py
```

Then open <http://localhost:8000/>. To try it on a phone or tablet in the
same Wi-Fi network: `python3 serve.py 8000 0.0.0.0` and open
`http://<computer IP>:8000/` on the device.

To try the envelope without filling the form with test letters:

| Address        | What happens                                       |
|----------------|----------------------------------------------------|
| `/?test`       | the letter "goes" after a moment, nothing is sent  |
| `/?test=fail`  | the letter does not go, as if there were no internet |

## The Google Form

The letter is posted straight from the browser to the form's `formResponse`
address, with one field per question (`entry.<id>`). The ids are in
`js/config.js`:

| Question in the form   | Id                 |
|------------------------|--------------------|
| Mesajul pentru Bubu    | `entry.1036479831` |
| Numele tău (optional)  | `entry.1406855150` |

### What the page can know about a letter

Google does not let a page from another site read the form's reply, so the
request is sent with `mode: "no-cors"` and the browser hides the answer. The
page still knows:

- **the letter did not go**: no internet, Google could not be reached, or it
  took longer than 20 seconds. The child sees "Ups! Scrisoarea nu a plecat."
  and the letter waits on the sheet (it is also kept in the browser, so a
  reload does not lose it);
- **the letter reached Google and Google answered**: the envelope flies away.

It cannot know whether Google saved the answer. Google saves it as long as
the form stays as it is now. So, in the form:

- keep **Accepting responses** on;
- do not require sign-in, and do not limit it to one response per person;
- do not delete or recreate the two questions (their ids would change); their
  titles and descriptions may change freely;
- a new **required** question would make every letter fail without anyone
  noticing: add it as optional, or add it to `js/config.js` too.

### Changing the form

If the questions change, open the form, ⋮ → **Get pre-filled link**, write
something in every question and press **Get link**. The copied link contains
`entry.<id>=...` for every question: put those ids in `js/config.js`.
If it is a different form, also change `action` in `js/config.js` (the form's
link, with `viewform` replaced by `formResponse`).

## Against spam

The site is static, so the guard (`js/guard.js`) runs in the browser. It stops
simple robots and a child pressing "send" again and again, not someone who
knows programming:

- a hidden text box (a trap): people never see it, robots fill it in; such a
  letter is not sent, but the robot is shown that it worked;
- a letter sent in the first 3 seconds after the page opened is dropped the
  same way;
- the message has at most 1000 letters and the name at most 40;
- after a letter has gone, the next one waits 60 seconds (kept in the
  browser, so a reload does not skip it); the send button counts down.

The limits are in `js/config.js` (`LIMITS`).

The form itself should also limit the length, as Google enforces that for
every answer, whoever sends it: in the form, on **Mesajul pentru Bubu**,
⋮ → **Response validation** → **Length** → **Maximum character count** → 1000,
and on **Numele tău** the same with 40.

## The children's safety

The page asks only for the message and, optionally, a first name, and reminds
the children not to write their address, phone number or school. The letters
are not shown anywhere on the site: they reach only the form's owner.
