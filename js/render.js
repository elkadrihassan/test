// All drawing. Reads state, never changes it.
import { W, H, GY, PX, TILE, THEMES } from './config.js';
import { S, player as p, worldName, rnd, rr } from './state.js';
import { HERO, GOOMBA, SHROOM, TILE_IMG } from './sprites.js';
import { isMuted } from './audio.js';

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

/* ---------- helpers ---------- */
function text(s, x, y, size = 14, align = 'left', col = '#fff') {
  ctx.font = `${size}px "Press Start 2P", monospace`;
  ctx.textAlign = align; ctx.textBaseline = 'top';
  ctx.fillStyle = '#000'; ctx.fillText(s, x + 2, y + 2);
  ctx.fillStyle = col; ctx.fillText(s, x, y);
}
const pad = (n, len) => String(n).padStart(len, '0');

/* ---------- background ---------- */
function drawSky(th) {
  const g = ctx.createLinearGradient(0, 0, 0, GY);
  g.addColorStop(0, th.top); g.addColorStop(1, th.bot);
  ctx.fillStyle = g; ctx.fillRect(-10, -10, W + 20, H + 20);

  if (th.stars) {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
      const sx = ((rnd(i) * W * 1.5 - S.camX * 0.05) % W + W) % W, sy = rnd(i + 99) * (GY - 80);
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(S.time * 0.05 + i);
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1;
  }
}
function cloud(x, y, s, col) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, 7); ctx.arc(x + 22 * s, y - 10 * s, 24 * s, 0, 7);
  ctx.arc(x + 50 * s, y, 20 * s, 0, 7); ctx.rect(x, y - 2 * s, 50 * s, 18 * s);
  ctx.fill();
}
function drawClouds(th) {
  const first = Math.floor(S.camX * 0.15 / 260);
  for (let i = first - 1; i < first + 5; i++) {
    cloud(i * 260 - S.camX * 0.15 + rnd(i) * 80, 50 + rnd(i + 3) * 80, 0.8 + rnd(i + 7) * 0.7, th.cloud);
  }
}
function hills(factor, period, colour, hMul) {
  ctx.fillStyle = colour;
  const first = Math.floor(S.camX * factor / period);
  for (let i = first - 1; i < first + Math.ceil(W / period) + 2; i++) {
    const hx = i * period - S.camX * factor + rnd(i) * 80;
    const w = 120 + rnd(i + 9) * 120, h = (50 + rnd(i + 5) * 70) * hMul;
    ctx.beginPath(); ctx.ellipse(hx, GY, w, h, 0, Math.PI, 2 * Math.PI); ctx.fill();
  }
}
function drawGround() {
  const t0 = Math.floor(S.camX / TILE);
  for (let i = t0; i < t0 + W / TILE + 2; i++) {
    const wx = i * TILE;
    if (S.pits.some(pt => wx >= pt.wx && wx < pt.wx + pt.w)) continue;
    for (let r = 0; GY + r * TILE < H; r++) ctx.drawImage(TILE_IMG, wx - S.camX, GY + r * TILE);
  }
}

/* ---------- objects ---------- */
function drawPipe(sx, h, w) {
  const top = GY - h;
  ctx.fillStyle = '#000'; ctx.fillRect(sx - 4, top - 2, w + 8, 34); ctx.fillRect(sx, top + 30, w, h - 30);
  ctx.fillStyle = '#2bb62b'; ctx.fillRect(sx - 2, top, w + 4, 30); ctx.fillRect(sx + 4, top + 30, w - 8, h - 30);
  ctx.fillStyle = '#7ef27e'; ctx.fillRect(sx + 2, top + 2, 8, 26); ctx.fillRect(sx + 8, top + 30, 6, h - 30);
  ctx.fillStyle = '#157515'; ctx.fillRect(sx + w - 12, top + 2, 8, 26); ctx.fillRect(sx + w - 18, top + 30, 8, h - 30);
}
function drawPlat(sx, y, w) {
  for (let x = 0; x < w; x += TILE) {
    ctx.fillStyle = '#d98a2b'; ctx.fillRect(sx + x, y, TILE, TILE / 2 + 4);
    ctx.fillStyle = '#000'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.strokeRect(sx + x + 1, y + 1, TILE - 2, TILE / 2 + 2);
    ctx.fillRect(sx + x + 15, y + 1, 2, 9);
    ctx.fillStyle = '#ffd28a'; ctx.fillRect(sx + x + 2, y + 2, TILE - 4, 2);
  }
}
function drawCoin(sx, y) {
  const w = Math.abs(Math.cos((S.time + sx * 0.05) * 0.1)) * 9 + 2;
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(sx, y, w + 2, 12, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#fbd000'; ctx.beginPath(); ctx.ellipse(sx, y, w, 10, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff1a0'; ctx.fillRect(sx - 1, y - 6, 2, 12);
}
function drawEnemy(o, sx) {
  if (o.dead) { if (o.dead < 30) ctx.drawImage(GOOMBA, sx - 2, o.y + 18, 32, 14); return; }
  ctx.save();
  if (Math.floor(S.time / 10) % 2) { ctx.translate(sx + 30, 0); ctx.scale(-1, 1); ctx.drawImage(GOOMBA, 0, o.y - 4); }
  else ctx.drawImage(GOOMBA, sx - 2, o.y - 4);
  ctx.restore();
}
function drawObjects() {
  for (const o of S.obs) {
    const sx = o.wx - S.camX;
    if (sx > W + 80 || sx + (o.w || 40) < -80) continue;
    if (o.t === 'pipe') drawPipe(sx, o.h, o.w);
    else if (o.t === 'plat') drawPlat(sx, o.y, o.w);
    else if (o.t === 'coin' && !o.got) drawCoin(sx, o.y);
    else if (o.t === 'shroom' && !o.got) ctx.drawImage(SHROOM, sx, o.y + Math.sin(S.time * 0.1) * 2);
    else if (o.t === 'enemy' && o.dead < 900) drawEnemy(o, sx);
  }
}

/* ---------- player, particles, HUD ---------- */
function drawPlayer() {
  const blinking = p.inv > 0 && Math.floor(S.time / 4) % 2 && S.state === 'play';
  if (blinking) return;
  let img = HERO.j;
  if (S.state !== 'dying' && p.ground) img = Math.floor(p.frame) % 2 ? HERO.a : HERO.b;
  if (p.shield && S.state !== 'dying') {
    ctx.strokeStyle = `rgba(255,230,80,${0.5 + 0.3 * Math.sin(S.time * 0.2)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(PX + 10, p.y + 16, 22, 26, 0, 0, 7); ctx.stroke();
  }
  ctx.drawImage(img, PX - 2, p.y);
}
function drawParticles() {
  for (const q of S.parts) {
    if (q.text) text(q.text, q.x, q.y, 10, 'center');
    else { ctx.fillStyle = q.c; ctx.fillRect(q.x, q.y, 4, 4); }
  }
}
function drawHud() {
  text('SCORE', 20, 14, 10); text(pad(S.score, 6), 20, 30);
  text('COINS', 190, 14, 10); text('x' + pad(S.coins, 2), 190, 30, 14, 'left', '#fbd000');
  text('WORLD', 330, 14, 10); text(worldName(), 330, 30);
  text('BEST', W - 20, 14, 10, 'right'); text(pad(Math.max(S.hi, S.score), 6), W - 20, 30, 14, 'right');
  if (p.shield) text('SHIELD', 20, 54, 8, 'left', '#fbd000');
  if (isMuted()) text('MUTED', W - 20, 54, 8, 'right', '#ccc');
}
function overlay(a, b, c, d) {
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H);
  text(a, W / 2, 110, 36, 'center', '#fbd000');
  if (b) text(b, W / 2, 162, 28, 'center');
  if (d) text(d, W / 2, 222, 12, 'center', '#9fe870');
  if (Math.floor(S.time / 30) % 2 === 0) text(c, W / 2, 270, 12, 'center');
}

/* ---------- main entry ---------- */
export function render() {
  const th = THEMES[S.level % THEMES.length];
  ctx.save();
  if (S.shake > 0) ctx.translate(rr(-3, 3), rr(-3, 3));
  drawSky(th);
  drawClouds(th);
  hills(0.2, 420, th.hill2, 1.2);
  hills(0.4, 330, th.hill, 0.8);
  drawGround();
  drawObjects();
  drawPlayer();
  drawParticles();
  ctx.restore();

  if (S.state !== 'title') drawHud();

  if (S.state === 'title') overlay('SUPER MARIO', 'RUNNER', 'PRESS SPACE OR TAP TO START', S.hi ? 'BEST ' + S.hi : '');
  else if (S.state === 'over') overlay('GAME OVER', 'SCORE ' + S.score, 'PRESS SPACE OR TAP TO RETRY', S.score >= S.hi && S.score > 0 ? 'NEW BEST!' : 'BEST ' + S.hi);
  else if (S.state === 'paused') overlay('PAUSED', '', 'PRESS P TO RESUME', '');
}

export const canvas = cv;
