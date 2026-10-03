// Shared mutable game state + small helpers. Every other module imports `S` and `player`.
import { GY, W, DIFFICULTY } from './config.js';

export const S = {
  state: 'title',  // title | play | paused | dying | over
  camX: 0,         // how far the world has scrolled (also the distance run)
  speed: 3,
  score: 0,
  bonus: 0,        // points from coins/stomps/mushrooms
  coins: 0,
  level: 0,
  nextX: 0,        // world x where the next obstacle group spawns
  obs: [],         // pipes, platforms, enemies, coins, mushrooms
  pits: [],        // holes in the ground
  parts: [],       // particles + floating text
  hi: 0,
  shake: 0,
  time: 0,
  jumpHeld: false,
  jumpBuf: 0,
  coyote: 0,
};

export const player = { y: 0, w: 20, h: 32, vy: 0, jumping: false, ground: true, shield: false, inv: 0, frame: 0 };

try { S.hi = +localStorage.getItem('smr-hi') || 0; } catch (e) {}
export function saveHi() { try { localStorage.setItem('smr-hi', S.hi); } catch (e) {} }

export function reset(playing) {
  Object.assign(S, {
    camX: 0, speed: playing ? DIFFICULTY.startSpeed : 3, score: 0, bonus: 0, coins: 0, level: 0,
    nextX: playing ? W + 150 : 1e9,   // on the title screen nothing spawns
    obs: [], pits: [], parts: [], jumpBuf: 0, coyote: 0, shake: 0,
  });
  Object.assign(player, { y: GY - player.h, vy: 0, jumping: false, ground: true, shield: false, inv: 0, frame: 0 });
}

export const worldName = () => (Math.floor(S.level / 4) + 1) + '-' + (S.level % 4 + 1);

// helpers
export const rnd = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }; // deterministic
export const rr = (a, b) => a + Math.random() * (b - a);
