// Entry point: wires everything together and runs the fixed-timestep loop.
import { STEP } from './config.js';
import { S, reset } from './state.js';
import { update } from './game.js';
import { render, canvas } from './render.js';
import { setupInput } from './input.js';

reset(false);          // title screen scene
setupInput(canvas);

if (document.fonts && document.fonts.load) document.fonts.load('16px "Press Start 2P"').catch(() => {});

let last = performance.now(), acc = 0;
function frame(now) {
  acc += Math.min(100, now - last);
  last = now;
  while (acc >= STEP) { update(); acc -= STEP; }
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Handy for debugging in the browser console: __game.S.speed = 9
window.__game = { S };
