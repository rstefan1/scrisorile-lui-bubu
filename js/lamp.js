// The desk lamp: a tap turns it off (the room gets dark) and another tap
// turns it on again. Just for fun.

export function setupLamp(lamp) {
  lamp.addEventListener('click', () => {
    const on = lamp.getAttribute('aria-pressed') !== 'true';
    lamp.setAttribute('aria-pressed', String(on));
    document.documentElement.classList.toggle('lamp-off', !on);

    lamp.classList.remove('is-clicked');
    void lamp.offsetWidth; // restart the little nod
    lamp.classList.add('is-clicked');
  });
}
