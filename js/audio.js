// Tiny WebAudio synth for sound effects.
let actx = null;
let muted = false;
try { muted = localStorage.getItem('smr-muted') === '1'; } catch (e) {}

export const isMuted = () => muted;

export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('smr-muted', muted ? '1' : '0'); } catch (e) {}
}

// Browsers only allow audio after a user gesture, so call this from input handlers.
export function unlockAudio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (actx && actx.state === 'suspended') actx.resume();
}

function tone(freq, dur, type = 'square', vol = 0.06, slideTo = null, delay = 0) {
  if (!actx || muted) return;
  const t = actx.currentTime + delay;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(actx.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

const arpeggio = (notes, dur, type, vol, step) =>
  notes.forEach((f, i) => tone(f, dur, type, vol, null, i * step));

export const sfx = {
  jump:  () => tone(300, 0.18, 'square', 0.06, 700),
  coin:  () => { tone(988, 0.08); tone(1319, 0.22, 'square', 0.06, null, 0.07); },
  stomp: () => tone(260, 0.15, 'square', 0.08, 90),
  hit:   () => tone(180, 0.25, 'sawtooth', 0.08, 60),
  power: () => arpeggio([523, 659, 784, 1047], 0.1, 'square', 0.06, 0.07),
  die:   () => arpeggio([494, 392, 330, 262, 196], 0.16, 'triangle', 0.12, 0.14),
  level: () => arpeggio([392, 523, 659, 784], 0.12, 'square', 0.05, 0.08),
};
