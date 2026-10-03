// Procedural level generation. Add a new obstacle by writing a pattern and giving it a weight in config.js.
import { GY, W, TILE, DIFFICULTY, PATTERN_WEIGHTS } from './config.js';
import { S, player, rr } from './state.js';

const snap = x => Math.ceil(x / TILE) * TILE;

function coinArc(cx, y, n, spread, rise) {
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    S.obs.push({ t: 'coin', wx: cx + (t - 0.5) * spread, y: y - Math.sin(t * Math.PI) * rise, got: false });
  }
}
const enemy = wx => ({ t: 'enemy', wx, y: GY - 28, vy: 0, w: 28, h: 28, dead: 0 });

// Each pattern places things starting at S.nextX and returns how much width it used.
const patterns = {
  pipe() {
    const h = [48, 64, 80][Math.floor(Math.random() * 3)];
    S.obs.push({ t: 'pipe', wx: S.nextX, w: 64, h });
    coinArc(S.nextX + 32, GY - h - 36, 5, 130, 40);
    return 90;
  },
  pit() {
    const max = S.level >= 2 ? 160 : 128;           // pits get wider in later worlds
    const w = TILE * (2 + Math.floor(Math.random() * ((max - 64) / TILE + 1)));
    const wx = snap(S.nextX);
    S.pits.push({ wx, w });
    coinArc(wx + w / 2, GY - 60, 5, w + 40, 60);
    return wx - S.nextX + w + 32;
  },
  enemies() {
    const n = 1 + Math.floor(Math.random() * Math.min(3, 1 + S.level));
    for (let i = 0; i < n; i++) S.obs.push(enemy(S.nextX + i * 70));
    return n * 70;
  },
  plat() {
    const w = TILE * (3 + Math.floor(Math.random() * 3));
    const y = GY - rr(90, 110);
    S.obs.push({ t: 'plat', wx: S.nextX, y, w });
    if (!player.shield && Math.random() < 0.25) S.obs.push({ t: 'shroom', wx: S.nextX + w / 2 - 12, y: y - 24, got: false });
    else coinArc(S.nextX + w / 2, y - 24, 4, w - 40, 0);
    if (Math.random() < 0.5) S.obs.push(enemy(S.nextX + w / 2));
    return w + 20;
  },
  coins() {
    for (let i = 0; i < 6; i++) S.obs.push({ t: 'coin', wx: S.nextX + i * 36, y: GY - 28, got: false });
    return 6 * 36;
  },
  combo() { // a pit with a platform floating over it
    const wx = snap(S.nextX + 16);
    S.pits.push({ wx, w: 128 });
    S.obs.push({ t: 'plat', wx: wx - 16, y: GY - 100, w: 160 });
    coinArc(wx + 64, GY - 124, 5, 130, 0);
    return wx - S.nextX + 128 + 40;
  },
};

function pickPattern() {
  let r = Math.random();
  for (const [name, weight] of PATTERN_WEIGHTS) if ((r -= weight) < 0) return name;
  return 'coins';
}

export function spawn() {
  while (S.nextX < S.camX + W + 300) {
    const used = patterns[pickPattern()]();
    S.nextX += used + DIFFICULTY.baseGap + S.speed * DIFFICULTY.gapPerSpeed + Math.random() * DIFFICULTY.gapRandom;
  }
}

export function cleanup() {
  S.obs = S.obs.filter(o => o.wx + (o.w || 40) > S.camX - 200 && o.dead < 900);
  S.pits = S.pits.filter(pt => pt.wx + pt.w > S.camX - 200);
}

// Is there ground under the span [l, r] (world x)? False only if it's fully inside a pit.
export const supported = (l, r) => !S.pits.some(pt => l >= pt.wx && r <= pt.wx + pt.w);
