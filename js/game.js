// Game rules: physics, collisions, scoring, life cycle.
import { GY, H, PX, PHYSICS, DIFFICULTY, SCORE } from './config.js';
import { S, player as p, reset, saveHi, worldName, rr } from './state.js';
import { spawn, cleanup, supported } from './level.js';
import { sfx } from './audio.js';

const overlap = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

function burst(x, y, color, n = 8) {
  for (let i = 0; i < n; i++) S.parts.push({ x, y, vx: rr(-3, 3), vy: rr(-5, -1), life: 30, c: color });
}
const floatText = (x, y, text) => S.parts.push({ x, y, vx: 0, vy: -1, life: 40, text });

export function startGame() { reset(true); S.state = 'play'; }

function hurt() {
  if (p.inv > 0 || S.state !== 'play') return;
  if (p.shield) {
    p.shield = false; p.inv = 100; S.shake = 8;
    sfx.hit(); burst(PX + 10, p.y + 16, '#fbd000', 12);
    return;
  }
  die(false);
}

function die(fell) {
  if (S.state === 'dying') return;
  S.state = 'dying';
  if (!fell) p.vy = -11;   // little death hop
  sfx.die();
  const total = Math.floor(S.camX * SCORE.perDistance) + S.bonus;
  if (total > S.hi) { S.hi = total; saveHi(); }
}

function updateDifficulty() {
  const target = Math.min(DIFFICULTY.maxSpeed, DIFFICULTY.startSpeed + S.camX / DIFFICULTY.speedRampDistance);
  S.speed += (target - S.speed) * 0.02;
  const lv = Math.floor(S.camX / DIFFICULTY.levelDistance);
  if (lv > S.level) { S.level = lv; sfx.level(); floatText(PX, 140, 'WORLD ' + worldName()); }
}

function updatePlayer(px, prevBottom) {
  if (S.jumpBuf > 0) S.jumpBuf--;
  if (S.coyote > 0) S.coyote--;
  if (S.jumpBuf > 0 && S.coyote > 0) {
    p.vy = PHYSICS.jumpVelocity; p.jumping = true; p.ground = false; S.coyote = 0; S.jumpBuf = 0;
    sfx.jump();
  }
  if (!S.jumpHeld && p.jumping && p.vy < PHYSICS.shortHopVelocity) p.vy = PHYSICS.shortHopVelocity;
  p.vy += PHYSICS.gravity;
  p.y += p.vy;
}

function collide(px, prevBottom) {
  let landed = false;
  const land = top => { p.y = top - p.h; p.vy = 0; landed = true; };

  // ground
  if (p.y + p.h >= GY && prevBottom <= GY + 4 && p.vy >= 0 && supported(px + 4, px + p.w - 4)) land(GY);

  for (const o of S.obs) {
    const sx = o.wx - S.camX;
    if (sx > 900 || sx + (o.w || 40) < -100) continue;

    if (o.t === 'pipe') {
      const top = GY - o.h;
      if (overlap(px, p.y, p.w, p.h, o.wx, top, o.w, o.h)) {
        if (p.vy >= 0 && prevBottom <= top + 10) land(top); else hurt();
      }
    } else if (o.t === 'plat') { // one-way: you can jump up through it
      if (px + p.w > o.wx && px < o.wx + o.w && p.vy >= 0 && prevBottom <= o.y + 4 && p.y + p.h >= o.y) land(o.y);
    } else if (o.t === 'enemy') {
      if (o.dead) { o.dead++; continue; }
      o.wx -= 0.8;
      if (!supported(o.wx, o.wx + o.w)) { o.vy += 0.5; o.y += o.vy; if (o.y > H) o.dead = 999; continue; }
      if (overlap(px, p.y, p.w, p.h, o.wx, o.y, o.w, o.h)) {
        if (p.vy > 0 && prevBottom <= o.y + 12) {  // stomp
          o.dead = 1; p.jumping = true;
          p.vy = S.jumpHeld ? PHYSICS.stompBounceHeld : PHYSICS.stompBounce;
          S.bonus += SCORE.stomp; sfx.stomp();
          floatText(sx, o.y - 8, String(SCORE.stomp)); burst(sx + 14, o.y + 20, '#a0522d', 6);
        } else hurt();
      }
    } else if (o.t === 'coin') {
      if (!o.got && overlap(px, p.y, p.w, p.h, o.wx - 10, o.y - 10, 20, 20)) {
        o.got = true; S.coins++; S.bonus += SCORE.coin; sfx.coin(); burst(sx, o.y, '#fbd000', 5);
      }
    } else if (o.t === 'shroom') {
      if (!o.got && overlap(px, p.y, p.w, p.h, o.wx, o.y, 24, 24)) {
        o.got = true; p.shield = true; S.bonus += SCORE.mushroom; sfx.power();
        floatText(sx, o.y - 8, String(SCORE.mushroom));
      }
    }
  }

  if (landed) { p.ground = true; p.jumping = false; S.coyote = PHYSICS.coyoteFrames; } else p.ground = false;
}

export function update() {
  S.time++;

  if (S.state === 'dying') {
    p.vy += PHYSICS.gravity; p.y += p.vy;
    if (p.y > H + 120) S.state = 'over';
    return;
  }
  if (S.state === 'paused' || S.state === 'over') return;

  if (S.state === 'play') updateDifficulty();
  S.camX += S.speed;
  if (S.state === 'play') spawn();
  S.score = Math.floor(S.camX * SCORE.perDistance) + S.bonus;

  if (S.state === 'title') { p.frame += 0.25; return; }

  const px = S.camX + PX, prevBottom = p.y + p.h;
  updatePlayer(px, prevBottom);
  collide(px, prevBottom);

  if (p.inv > 0) p.inv--;
  p.frame += S.speed * 0.05;
  if (p.y > GY + 60 && S.state === 'play') die(true);

  if (S.time % 60 === 0) cleanup();
  for (const q of S.parts) { q.x += q.vx || 0; q.y += q.vy; if (!q.text) q.vy += 0.3; q.life--; }
  S.parts = S.parts.filter(q => q.life > 0);
  if (S.shake > 0) S.shake--;
}
