// Pixel-art sprites. Each letter in a row maps to a colour in the palette.

function sprite(rows, pal, s = 2) {
  const c = document.createElement('canvas');
  c.width = rows[0].length * s;
  c.height = rows.length * s;
  const g = c.getContext('2d');
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x * s, y * s, s, s); }
  }));
  return c;
}

/* ----- hero ----- */
const HERO_PAL = { R: '#e52521', B: '#6b3a0f', S: '#fcb98a', U: '#2038ec', Y: '#fbd000' };
const HERO_BODY = [
  '....RRRRR...',
  '...RRRRRRRRR',
  '...BBBSSBS..',
  '..BSBSSSBSSS',
  '..BSBBSSSBSS',
  '..BBSSSSBBBB',
  '....SSSSSSS.',
  '...RRURRR...',
  '..RRRURRURRR',
  'RRRRUUUURRRR',
  'SSRUYUUYURSS',
  'SSSUUUUUUSSS',
  'SSUUUUUUUUSS',
];
const HERO_LEGS = {
  a: ['..UUU..UUU..', '.BBB....BBB.', 'BBBB....BBBB'],  // run frame 1
  b: ['...UUUUUU...', '...BBBBBB...', '..BBBBBBB...'],  // run frame 2
  j: ['..UUU..UUUBB', 'BBBB....UUU.', 'BBB......BBB'],  // jump
};
export const HERO = {};
for (const k in HERO_LEGS) HERO[k] = sprite(HERO_BODY.concat(HERO_LEGS[k]), HERO_PAL);

/* ----- enemy ----- */
export const GOOMBA = sprite([
  '......DDDD......', '....DDDDDDDD....', '..DDDDDDDDDDDD..', '.DDDDDDDDDDDDDD.',
  '.DDDWWDDDDWWDDD.', 'DDDWWWDDDDWWWDDD', 'DDDWKWDDDDWKWDDD', 'DDDDDDDDDDDDDDDD',
  'DDDDDDDDDDDDDDDD', '.DDDDDDDDDDDDDD.', '....SSSSSSSS....', '...SSSSSSSSSS...',
  '...SSSSSSSSSS...', '..KKKK....KKKK..', '.KKKKKK..KKKKKK.', '.KKKKK....KKKKK.',
], { D: '#a0522d', W: '#fff', K: '#2a1608', S: '#f5cfa0' });

/* ----- power-up ----- */
export const SHROOM = sprite([
  '....RRRR....', '..RRWWRRRR..', '.RRWWRRRWWR.', 'RRWWWRRRWWWR', 'RRRWWRRRRWWR',
  'RRRRRRRRRRRR', '..WWWWWWWW..', '.WWKWWWWKWW.', '.WWWWWWWWWW.', '..WWWWWWWW..', '...WWWWWW...',
], { R: '#e52521', W: '#fff4d6', K: '#222' });

/* ----- ground tile ----- */
function makeTile(T) {
  const c = document.createElement('canvas');
  c.width = c.height = T;
  const g = c.getContext('2d');
  g.fillStyle = '#c84c0c'; g.fillRect(0, 0, T, T);
  g.fillStyle = '#fcbcb0'; g.fillRect(0, 0, T, 2); g.fillRect(0, 0, 2, T);
  g.fillStyle = '#000';
  g.fillRect(0, T - 2, T, 2); g.fillRect(T - 2, 0, 2, T);
  g.fillRect(0, 14, T, 2); g.fillRect(16, 0, 2, 14); g.fillRect(8, 16, 2, 14); g.fillRect(24, 16, 2, 14);
  return c;
}
export const TILE_IMG = makeTile(32);
