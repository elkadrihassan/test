// Keyboard, mouse and touch controls.
import { PHYSICS } from './config.js';
import { S } from './state.js';
import { startGame } from './game.js';
import { unlockAudio, toggleMute } from './audio.js';

const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW']);

function press() {
  unlockAudio();
  if (S.state === 'title' || S.state === 'over') startGame();
  if (S.state === 'play') { S.jumpBuf = PHYSICS.jumpBufferFrames; S.jumpHeld = true; }
}
const release = () => { S.jumpHeld = false; };

function togglePause() {
  if (S.state === 'play') S.state = 'paused';
  else if (S.state === 'paused') S.state = 'play';
}

export function setupInput(canvas) {
  addEventListener('keydown', e => {
    if (JUMP_KEYS.has(e.code)) { e.preventDefault(); if (!e.repeat) press(); }
    else if (e.code === 'Enter' && (S.state === 'title' || S.state === 'over')) press();
    else if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
    else if (e.code === 'KeyM') toggleMute();
  });
  addEventListener('keyup', e => { if (JUMP_KEYS.has(e.code)) release(); });

  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (S.state === 'paused') S.state = 'play'; else press();
  });
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);

  document.addEventListener('visibilitychange', () => { if (document.hidden && S.state === 'play') S.state = 'paused'; });
}
