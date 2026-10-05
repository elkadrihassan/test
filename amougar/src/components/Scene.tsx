import { useId, useMemo, type ReactNode } from 'react';

/**
 * Procedural, photographic-feeling scenes drawn in SVG.
 * They stand in for real photography (see src/data/media.ts to swap in real images)
 * and keep the page light: no image weight, infinite resolution.
 */

export type Mood = 'dusk' | 'gold' | 'dawn' | 'noon' | 'night';
export type SceneKind =
  | 'caravan'
  | 'sahara'
  | 'camp'
  | 'fantasia'
  | 'music'
  | 'market'
  | 'portrait'
  | 'fabric'
  | 'crowd'
  | 'tea'
  | 'port'
  | 'beach'
  | 'city'
  | 'gate'
  | 'nomad';

export interface SceneSpec {
  kind: SceneKind;
  mood?: Mood;
  seed?: number;
  flip?: boolean;
}

const W = 1600;
const H = 1000;

/* ------------------------------------------------------------------ helpers */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
function mix(a: string, b: string, t: number) {
  const x = hex(a);
  const y = hex(b);
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

interface MoodDef {
  sky: string[];
  sunY: number;
  sunX: number;
  sunC: string;
  glow: string;
  dunes: string[];
  haze: string;
  stars?: boolean;
  warm: string; // lamp / fire colour
}
const MOODS: Record<Mood, MoodDef> = {
  dusk: { sky: ['#150f2b', '#4d2548', '#b4533f', '#f2a15f'], sunY: 640, sunX: 1050, sunC: '#ffe1b0', glow: '#ff8f55', dunes: ['#9a5458', '#66303d', '#3c1b27', '#170a10'], haze: '#e8996a', warm: '#ffb45a' },
  gold: { sky: ['#2b2438', '#9b5a46', '#eca25a', '#ffe4b0'], sunY: 600, sunX: 560, sunC: '#fff3d2', glow: '#ffb766', dunes: ['#cf9159', '#a9633c', '#6f3a28', '#2a1610'], haze: '#ffd09a', warm: '#ffc070' },
  dawn: { sky: ['#202a48', '#6d5b7d', '#e0997f', '#fbd8ab'], sunY: 610, sunX: 420, sunC: '#fff0d0', glow: '#ffbf9a', dunes: ['#b0908f', '#8b6a6e', '#58414a', '#292028'], haze: '#f5cba6', warm: '#ffc78a' },
  noon: { sky: ['#4a7ba3', '#8db5c6', '#d6e2d6', '#f5e0b6'], sunY: 250, sunX: 1100, sunC: '#fffdf0', glow: '#fff5c8', dunes: ['#ebcc98', '#d6a96c', '#b88750', '#7f5933'], haze: '#f7e6c4', warm: '#ffd08a' },
  night: { sky: ['#03040a', '#0a1022', '#18203c', '#3a2d3c'], sunY: 330, sunX: 1160, sunC: '#f4efe0', glow: '#8fa4d8', dunes: ['#242744', '#171932', '#0e0f20', '#05050b'], haze: '#4a4466', warm: '#ffad55', stars: true },
};

interface Dune {
  d: string;
  y: (x: number) => number;
}
function makeDune(seed: number, base: number, amp: number, step = 200, bottom = 1500): Dune {
  const r = rng(seed);
  const pts: [number, number][] = [];
  let slow = r() * Math.PI * 2;
  for (let x = -step * 2; x <= W + step * 2; x += step) {
    slow += 0.9 + r() * 0.6;
    pts.push([x, base + Math.sin(slow) * amp * 0.7 + (r() - 0.5) * amp * 0.6]);
  }
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    d += ` Q${x0 + (x1 - x0) * 0.5} ${y0 - (y0 - y1) * 0.1 - amp * 0.18} ${(x0 + x1) / 2 + (x1 - x0) * 0.25} ${(y0 + y1) / 2}`;
    d += ` T${x1} ${y1}`;
  }
  d += ` L${W + step * 2} ${bottom} L${-step * 2} ${bottom} Z`;
  const y = (x: number) => {
    const i = Math.max(0, Math.min(pts.length - 2, Math.floor((x + step * 2) / step)));
    const t = (x - pts[i][0]) / step;
    return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * Math.max(0, Math.min(1, t)) + amp * 0.1;
  };
  return { d, y };
}

/* ------------------------------------------------------------- silhouettes */
// Dromedary facing right, feet on y=100, ~104 wide.
const CAMEL =
  'M9 47C10 38 25 36 34 38C38 25 50 22 55 36C62 39 68 38 74 36C77 28 78 21 82 13C84 8 90 6 94 8L102 14C103 17 100 19 97 19L92 18C90 24 88 33 87 44C86 52 84 56 81 58L83 100L78 100L73 70L71 63C62 65 46 65 38 62L36 100L30 100L28 69L24 100L18 100L14 66C10 60 7 54 9 47Z';
const CAMEL_LEG2 = 'M64 62L69 100L64 100L58 66Z';

// Horse in full gallop facing right (box ~120x90).
const HORSE =
  'M18 42C22 32 48 28 72 32C78 27 84 15 90 7L98 3L111 12C112 16 108 19 104 18C99 22 95 32 92 42C90 49 84 54 78 55L98 68L108 66L109 72L96 78L72 62L52 60L40 68L18 80L6 84L4 79L22 68L30 56C22 54 15 50 18 42Z';

function Camel({ x, y, s = 1, flip = false, fill, tilt = 0 }: { x: number; y: number; s?: number; flip?: boolean; fill: string; tilt?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${flip ? -s : s} ${s}) translate(-52 -100)`} fill={fill}>
      <path d={CAMEL} />
      <path d={CAMEL_LEG2} />
    </g>
  );
}

function Walker({ x, y, s = 1, fill, staff = true }: { x: number; y: number; s?: number; fill: string; staff?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} stroke={fill}>
      <circle cx="0" cy="-38" r="4.6" stroke="none" />
      <path d="M-3.6 -43C-1 -48 3 -48 4.4 -43Z" stroke="none" />
      <path d="M-7 0L-4.5 -31Q0 -35 4.5 -31L7 0Z" stroke="none" />
      {staff && <path d="M10 0L9 -44" strokeWidth="1.6" fill="none" />}
    </g>
  );
}

function Tent({ x, y, w, h, fill, glow, id }: { x: number; y: number; w: number; h: number; fill: string; glow?: boolean; id: string }) {
  const half = w / 2;
  return (
    <g>
      <path d={`M${x - half} ${y}L${x - half * 0.78} ${y - h * 0.6}Q${x} ${y - h * 1.12} ${x + half * 0.78} ${y - h * 0.6}L${x + half} ${y}Z`} fill={fill} />
      <path d={`M${x - half * 0.78} ${y - h * 0.6}Q${x} ${y - h * 1.12} ${x + half * 0.78} ${y - h * 0.6}`} fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="2" />
      {glow && (
        <>
          <path d={`M${x - half * 0.22} ${y}L${x - half * 0.16} ${y - h * 0.5}Q${x} ${y - h * 0.62} ${x + half * 0.16} ${y - h * 0.5}L${x + half * 0.22} ${y}Z`} fill={`url(#${id}-lamp)`} />
          <ellipse cx={x} cy={y} rx={half * 1.1} ry={h * 0.18} fill={`url(#${id}-lamp-g)`} opacity="0.55" />
        </>
      )}
      <path d={`M${x - half} ${y - 3}H${x + half}`} stroke="#000" strokeOpacity="0.3" strokeWidth="6" />
    </g>
  );
}

function Rider({ x, y, s = 1, fill, gun = true, flip = false }: { x: number; y: number; s?: number; fill: string; gun?: boolean; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={fill} stroke={fill}>
      <circle cx="0" cy="-30" r="4.4" stroke="none" />
      <path d="M-5 -34C-2 -41 5 -40 6 -34Z" stroke="none" />
      <path d="M-9 8L-5 -24Q0 -28 5 -24L8 6Q-1 12 -9 8Z" stroke="none" />
      <path d="M-9 4C-18 4 -24 14 -28 20C-20 14 -14 10 -6 8Z" stroke="none" />
      {gun && <path d="M4 -18L26 -50" strokeWidth="1.8" fill="none" />}
    </g>
  );
}

function Horse({ x, y, s = 1, fill, flip = false, tilt = 0 }: { x: number; y: number; s?: number; fill: string; flip?: boolean; tilt?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${flip ? -s : s} ${s}) translate(-60 -90)`} fill={fill}>
      <path d={HORSE} />
      <path d="M70 62L58 84L50 84L56 62Z" />
      <path d="M28 58L18 74L12 70L22 56Z" />
    </g>
  );
}

function Palm({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  const fronds = [-70, -40, -10, 20, 50, 80, 110, 140, 170];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} stroke={fill}>
      <path d="M-4 0Q-2 -60 6 -130L11 -130Q4 -60 4 0Z" stroke="none" />
      {fronds.map((a, i) => (
        <path key={i} d="M0 0Q40 -34 84 -4Q42 -22 0 0Z" transform={`translate(8 -130) rotate(${a - 90})`} stroke="none" />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------- shared layers */
function Sky({ m, id, stars }: { m: MoodDef; id: string; stars?: boolean }) {
  const stops = m.sky;
  const r = useMemo(() => rng(77), []);
  const starPts = useMemo(
    () => Array.from({ length: 140 }, () => ({ x: r() * W, y: r() * 560, s: r() * 1.5 + 0.4, o: r() * 0.7 + 0.3 })),
    [r],
  );
  return (
    <g data-depth="0">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          {stops.map((c, i) => (
            <stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <rect x="-300" y="-500" width={W + 600} height={H + 800} fill={`url(#${id}-sky)`} />
      {stars &&
        starPts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.s} fill="#fff" opacity={p.o} />)}
    </g>
  );
}

function Sun({ m, id, y, x, size = 1, hidden }: { m: MoodDef; id: string; y?: number; x?: number; size?: number; hidden?: boolean }) {
  if (hidden) return null;
  const sx = x ?? m.sunX;
  const sy = y ?? m.sunY;
  return (
    <g data-depth="0.05">
      <defs>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor={m.glow} stopOpacity="0.95" />
          <stop offset="0.35" stopColor={m.glow} stopOpacity="0.4" />
          <stop offset="1" stopColor={m.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={sx} cy={sy} r={620 * size} fill={`url(#${id}-sun)`} />
      <circle cx={sx} cy={sy} r={(m.stars ? 46 : 62) * size} fill={m.sunC} />
      {m.stars && <circle cx={sx + 16} cy={sy - 8} r={40 * size} fill={m.sky[1]} opacity="0.6" />}
    </g>
  );
}

function Dunes({ m, id, seed, base = 600, count = 4, spread = 95, amp = 70, depthStart = 0.08, solid }: { m: MoodDef; solid?: string; id: string; seed: number; base?: number; count?: number; spread?: number; amp?: number; depthStart?: number }) {
  const layers = useMemo(() => Array.from({ length: count }, (_, i) => makeDune(seed + i * 31, base + i * spread, amp * (0.6 + i * 0.28), 150 + i * 70)), [seed, base, count, spread, amp]);
  const colours = useMemo(() => {
    if (solid) return Array.from({ length: count }, () => solid);
    const n = count;
    return Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 0 : i / (n - 1);
      const pos = t * (m.dunes.length - 1);
      const a = Math.floor(pos);
      const b = Math.min(m.dunes.length - 1, a + 1);
      return mix(m.dunes[a], m.dunes[b], pos - a);
    });
  }, [m, count, solid]);
  return (
    <>
      <defs>
        {colours.map((c, i) => (
          <linearGradient key={i} id={`${id}-d${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={mix(c, m.haze, i === 0 ? 0.28 : 0.1)} />
            <stop offset="0.35" stopColor={c} />
            <stop offset="1" stopColor={mix(c, '#000000', 0.55)} />
          </linearGradient>
        ))}
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.haze} stopOpacity="0" />
          <stop offset="1" stopColor={m.haze} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {layers.map((l, i) => (
        <g key={i} data-depth={(depthStart + i * 0.07).toFixed(2)}>
          <path d={l.d} fill={`url(#${id}-d${i})`} />
          <path d={l.d.replace(/L[^L]*L[^L]*Z$/, '')} fill="none" stroke={m.sunC} strokeOpacity={0.16 - i * 0.03} strokeWidth="2" />
          {i === 0 && <rect x="-300" y={base - 80} width={W + 600} height={170} fill={`url(#${id}-haze)`} />}
        </g>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ scenes */
type Ctx = { m: MoodDef; id: string; seed: number; ink: string };

function Caravan({ m, id, seed, ink }: Ctx) {
  const ridge = useMemo(() => makeDune(seed + 5, 770, 34, 220), [seed]);
  const items = [
    { x: 330, s: 1.75 },
    { x: 545, s: 1.85 },
    { x: 770, s: 1.95 },
    { x: 985, s: 1.8 },
    { x: 1190, s: 1.7 },
  ];
  return (
    <>
      <Sky m={m} id={id} />
      <Sun m={m} id={id} y={610} x={900} size={1.1} />
      <Dunes m={m} id={id} seed={seed} base={560} count={3} spread={110} amp={55} />
      <g data-depth="0.26">
        <path d={ridge.d} fill={ink} />
        {items.map((c, i) => (
          <g key={i}>
            <Camel x={c.x} y={ridge.y(c.x) + 8} s={c.s} fill={ink} />
            {i % 2 === 0 && <Walker x={c.x + 118} y={ridge.y(c.x + 118) + 12} s={1.7} fill={ink} />}
          </g>
        ))}
        <Walker x={180} y={ridge.y(180) + 12} s={1.8} fill={ink} />
      </g>
      <Dunes m={m} id={`${id}f`} seed={seed + 900} base={900} count={1} spread={0} amp={60} depthStart={0.36} solid={ink} />
    </>
  );
}

function Sahara({ m, id, seed, ink }: Ctx) {
  return (
    <>
      <Sky m={m} id={id} />
      <Sun m={m} id={id} y={m.sunY - 80} />
      <Dunes m={m} id={id} seed={seed} base={520} count={5} spread={105} amp={80} />
      <g data-depth="0.28">
        <Camel x={1080} y={738} s={0.9} fill={ink} />
        <Walker x={1000} y={742} s={1} fill={ink} />
      </g>
    </>
  );
}

function Camp({ m, id, seed, ink }: Ctx) {
  const r = useMemo(() => rng(seed), [seed]);
  const ridge = useMemo(() => makeDune(seed + 3, 740, 40, 260), [seed]);
  return (
    <>
      <defs>
        <linearGradient id={`${id}-lamp`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe3a8" />
          <stop offset="1" stopColor={m.warm} />
        </linearGradient>
        <radialGradient id={`${id}-lamp-g`}>
          <stop offset="0" stopColor={m.warm} stopOpacity="0.8" />
          <stop offset="1" stopColor={m.warm} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-fire`}>
          <stop offset="0" stopColor="#ffd08a" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#ff8a3a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ff6a1a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Sky m={m} id={id} stars={m.stars} />
      <Sun m={m} id={id} x={400} y={260} size={0.55} hidden={!m.stars} />
      <Dunes m={m} id={id} seed={seed} base={600} count={3} spread={90} amp={55} />
      <g data-depth="0.22">
        <path d={ridge.d} fill={ink} />
        <Tent x={430} y={ridge.y(430) + 14} w={420} h={190} fill={mix(ink, '#3a2a2a', 0.5)} glow id={id} />
        <Tent x={900} y={ridge.y(900) + 10} w={520} h={230} fill={mix(ink, '#2b1f26', 0.45)} glow id={id} />
        <Tent x={1330} y={ridge.y(1330) + 12} w={340} h={160} fill={mix(ink, '#3a2a2a', 0.4)} id={id} />
        <circle cx={680} cy={ridge.y(680) + 6} r={150} fill={`url(#${id}-fire)`} />
        <path d={`M${672} ${ridge.y(680) + 12}Q${676} ${ridge.y(680) - 34} ${684} ${ridge.y(680) - 50}Q${690} ${ridge.y(680) - 30} ${694} ${ridge.y(680) + 12}Z`} fill="#ffcf7a" />
        {[0, 1, 2, 3].map((i) => (
          <Walker key={i} x={620 + i * 38 + r() * 8} y={ridge.y(640 + i * 30) + 14} s={1.3 + r() * 0.2} fill={ink} staff={false} />
        ))}
        <Camel x={160} y={ridge.y(160) + 14} s={1.5} fill={ink} />
      </g>
      <Dunes m={m} id={`${id}f`} seed={seed + 900} base={940} count={1} amp={50} depthStart={0.34} solid={ink} />
    </>
  );
}

function Fantasia({ m, id, seed, ink }: Ctx) {
  const r = useMemo(() => rng(seed), [seed]);
  const line = useMemo(() => makeDune(seed + 8, 810, 20, 300), [seed]);
  const xs = [260, 540, 820, 1100, 1370];
  return (
    <>
      <defs>
        <filter id={`${id}-blur`} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>
      <Sky m={m} id={id} />
      <Sun m={m} id={id} y={640} x={780} size={1.2} />
      <Dunes m={m} id={id} seed={seed} base={620} count={3} spread={80} amp={40} />
      <g data-depth="0.24">
        <g filter={`url(#${id}-blur)`} fill={mix(m.haze, '#c78a5a', 0.4)} opacity="0.75">
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse key={i} cx={120 + i * 190 + r() * 40} cy={800 + r() * 40} rx={160 + r() * 80} ry={60 + r() * 30} />
          ))}
        </g>
        {xs.map((x, i) => {
          const y = line.y(x) + 40 + (i % 2) * 14;
          return (
            <g key={i}>
              <Horse x={x} y={y} s={2.3 + (i % 2) * 0.25} fill={ink} tilt={-3 + (i % 3)} />
              <Rider x={x + 6} y={y - 120 - (i % 2) * 10} s={2.1} fill={ink} />
            </g>
          );
        })}
      </g>
      <g data-depth="0.36" filter={`url(#${id}-blur)`} fill={mix(m.haze, '#b5764a', 0.5)} opacity="0.85">
        <ellipse cx="800" cy="930" rx="900" ry="90" />
      </g>
    </>
  );
}

function Music({ m, id, seed }: Ctx) {
  const r = useMemo(() => rng(seed), [seed]);
  const bits = useMemo(() => Array.from({ length: 36 }, () => ({ x: r() * W, y: r() * 800, s: r() * 3 + 1, o: r() * 0.6 + 0.2 })), [r]);
  return (
    <>
      <defs>
        <radialGradient id={`${id}-room`} cx="0.5" cy="0.55" r="0.8">
          <stop offset="0" stopColor="#7a3a22" />
          <stop offset="0.45" stopColor="#3a1a18" />
          <stop offset="1" stopColor="#0c0708" />
        </radialGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d89a5a" />
          <stop offset="0.5" stopColor="#8a4a28" />
          <stop offset="1" stopColor="#3b1c12" />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor={m.warm} stopOpacity="0.55" />
          <stop offset="1" stopColor={m.warm} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-300" y="-300" width={W + 600} height={H + 600} fill={`url(#${id}-room)`} data-depth="0" />
      <g data-depth="0.08">
        {bits.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.s} fill={m.warm} opacity={b.o * 0.6} />
        ))}
      </g>
      <g data-depth="0.12">
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx="800" cy="520" r={260 + i * 110} fill="none" stroke={m.warm} strokeOpacity={0.28 - i * 0.05} strokeWidth="2" />
        ))}
        <circle cx="800" cy="520" r="560" fill={`url(#${id}-halo)`} />
      </g>
      <g data-depth="0.22" transform="translate(800 520) rotate(-24)">
        <ellipse cx="0" cy="170" rx="150" ry="205" fill={`url(#${id}-wood)`} />
        <ellipse cx="0" cy="170" rx="150" ry="205" fill="none" stroke="#ffd9a0" strokeOpacity="0.25" strokeWidth="3" />
        <ellipse cx="0" cy="170" rx="46" ry="46" fill="#1b0c0a" />
        <rect x="-26" y="-460" width="52" height="560" rx="18" fill="#3a1a12" />
        <rect x="-26" y="-460" width="14" height="560" rx="7" fill="#ffd9a0" opacity="0.18" />
        {[-34, -18, 0, 18].map((x, i) => (
          <line key={i} x1={x * 0.4} y1="-440" x2={x * 0.7} y2="320" stroke="#f3dca8" strokeWidth="2" opacity="0.8" />
        ))}
        {[-440, -410, -380].map((y, i) => (
          <g key={i}>
            <rect x="-48" y={y} width="30" height="9" rx="4" fill="#d9b06a" />
            <rect x="18" y={y + 6} width="30" height="9" rx="4" fill="#d9b06a" />
          </g>
        ))}
      </g>
      <g data-depth="0.3">
        {['#b5532f', '#5e1a26', '#d8c3a0', '#2a3a5c', '#b5532f', '#5e1a26', '#d8c3a0', '#2a3a5c'].map((c, i) => (
          <rect key={i} x={-100 + i * 220} y="860" width="220" height="200" fill={c} opacity="0.88" />
        ))}
        <rect x="-200" y="860" width={W + 400} height="200" fill="#000" opacity="0.35" />
      </g>
    </>
  );
}

function Rug({ x, y, w, h, c, seed }: { x: number; y: number; w: number; h: number; c: [string, string, string]; seed: number }) {
  const r = rng(seed);
  const bands = 3 + Math.floor(r() * 3);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={c[0]} />
      {Array.from({ length: bands }, (_, i) => (
        <rect key={i} x={x} y={y + h * 0.1 + (i * h * 0.8) / bands} width={w} height={h * 0.07} fill={c[1 + (i % 2)]} opacity="0.95" />
      ))}
      {Array.from({ length: 3 }, (_, i) => {
        const cx = x + w / 2;
        const cy = y + h * (0.28 + i * 0.22);
        const s = Math.min(w, h) * 0.12;
        return <path key={i} d={`M${cx} ${cy - s}L${cx + s} ${cy}L${cx} ${cy + s}L${cx - s} ${cy}Z`} fill={c[1 + (i % 2)]} stroke={c[2]} strokeWidth="3" />;
      })}
      {Array.from({ length: Math.floor(w / 14) }, (_, i) => (
        <line key={i} x1={x + 7 + i * 14} y1={y + h} x2={x + 7 + i * 14} y2={y + h + 26} stroke={c[2]} strokeWidth="3" />
      ))}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="3" />
    </g>
  );
}

function Market({ m, id, seed }: Ctx) {
  const pal: [string, string, string][] = [
    ['#8a3a22', '#e1b86b', '#2a1410'],
    ['#4a1220', '#c9694a', '#1c0810'],
    ['#25375a', '#e6d3a8', '#101a30'],
    ['#b5532f', '#4a1220', '#2a1410'],
    ['#d8c3a0', '#8a3a22', '#4a2a1a'],
    ['#3a2a52', '#d9a24e', '#17102a'],
  ];
  const layout = [
    { x: 40, y: 150, w: 280, h: 400 },
    { x: 350, y: 90, w: 330, h: 470 },
    { x: 710, y: 170, w: 250, h: 380 },
    { x: 990, y: 100, w: 300, h: 450 },
    { x: 1320, y: 160, w: 260, h: 390 },
  ];
  return (
    <>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a160f" />
          <stop offset="1" stopColor="#6a3a22" />
        </linearGradient>
        <radialGradient id={`${id}-lampg`}>
          <stop offset="0" stopColor={m.warm} stopOpacity="0.9" />
          <stop offset="1" stopColor={m.warm} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-300" y="-300" width={W + 600} height={H + 600} fill={`url(#${id}-wall)`} data-depth="0" />
      <g data-depth="0.1">
        <rect x="0" y="60" width={W} height="26" fill="#14090a" />
        {layout.map((l, i) => (
          <Rug key={i} {...l} c={pal[(i + seed) % pal.length]} seed={seed + i * 7} />
        ))}
      </g>
      <g data-depth="0.22">
        {[220, 640, 1000, 1400].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="60" x2={x} y2={640 + (i % 2) * 40} stroke="#14090a" strokeWidth="3" />
            <circle cx={x} cy={680 + (i % 2) * 40} r="150" fill={`url(#${id}-lampg)`} />
            <path d={`M${x - 24} ${660 + (i % 2) * 40}h48l-8 52h-32z`} fill={m.warm} />
            <rect x={x - 28} y={652 + (i % 2) * 40} width="56" height="10" fill="#14090a" />
          </g>
        ))}
      </g>
      <g data-depth="0.32">
        <rect x="-200" y="800" width={W + 400} height="400" fill="#0f0706" />
        {[100, 400, 760, 1180, 1480].map((x, i) => (
          <g key={i}>
            <ellipse cx={x} cy="810" rx={100 + (i % 2) * 40} ry="26" fill="#3a1d12" />
            <ellipse cx={x} cy="800" rx={90 + (i % 2) * 40} ry="20" fill={['#d9a24e', '#b5532f', '#e6d3a8', '#8a3a22', '#d9a24e'][i]} />
          </g>
        ))}
      </g>
    </>
  );
}

function Portrait({ m, id, seed }: Ctx) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-robe`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f5aa8" />
          <stop offset="0.5" stopColor="#1f2f66" />
          <stop offset="1" stopColor="#0c1330" />
        </linearGradient>
        <linearGradient id={`${id}-turban`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6a86d0" />
          <stop offset="0.6" stopColor="#2c4286" />
          <stop offset="1" stopColor="#141c40" />
        </linearGradient>
        <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5a3220" />
          <stop offset="0.7" stopColor="#9a5e3a" />
          <stop offset="1" stopColor="#d89a68" />
        </linearGradient>
        <filter id={`${id}-soft`}>
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <Sky m={m} id={id} />
      <g filter={`url(#${id}-soft)`}>
        <Sun m={m} id={id} x={1250} y={470} size={1} />
        <Dunes m={m} id={id} seed={seed} base={640} count={3} spread={110} amp={50} />
      </g>
      <g data-depth="0.12" transform="translate(800 0)">
        <path d="M-420 1100C-440 880 -380 760 -230 700L-110 650L110 650L230 700C380 760 440 880 420 1100Z" fill={`url(#${id}-robe)`} />
        <path d="M-90 650L0 780L90 650Z" fill="#0c1330" />
        <path d="M-230 700C-140 760 -80 820 -50 1100" stroke="#0c1330" strokeWidth="6" fill="none" opacity="0.6" />
        <path d="M230 700C140 760 80 820 50 1100" stroke="#0c1330" strokeWidth="6" fill="none" opacity="0.6" />
        <rect x="-70" y="560" width="140" height="120" fill="#5a3220" />
        <ellipse cx="0" cy="470" rx="150" ry="190" fill={`url(#${id}-skin)`} />
        {/* veil covering lower face */}
        <path d="M-148 500C-100 470 100 470 150 500C150 620 80 690 0 700C-80 690 -150 620 -148 500Z" fill={`url(#${id}-turban)`} />
        <path d="M-140 540C-60 580 60 580 140 540" stroke="#0c1330" strokeOpacity="0.5" strokeWidth="4" fill="none" />
        <path d="M-120 600C-50 640 50 640 120 600" stroke="#0c1330" strokeOpacity="0.4" strokeWidth="4" fill="none" />
        {/* eyes */}
        <path d="M-96 440C-70 424 -44 424 -22 440C-44 452 -70 452 -96 440Z" fill="#1a0e0a" />
        <path d="M22 440C44 424 70 424 96 440C70 452 44 452 22 440Z" fill="#1a0e0a" />
        <circle cx="-62" cy="438" r="5" fill="#ffe9c8" opacity="0.8" />
        <circle cx="60" cy="438" r="5" fill="#ffe9c8" opacity="0.8" />
        <path d="M-110 410C-70 390 -40 392 -14 406" stroke="#1a0e0a" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M14 406C40 392 70 390 110 410" stroke="#1a0e0a" strokeWidth="9" strokeLinecap="round" fill="none" />
        {/* turban */}
        <path d="M-200 400C-210 250 -120 160 0 160C120 160 210 250 200 400C120 360 -120 360 -200 400Z" fill={`url(#${id}-turban)`} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${-190 + i * 8} ${390 - i * 55}C-80 ${340 - i * 55} 80 ${340 - i * 55} ${190 - i * 8} ${390 - i * 55}`} stroke="#0c1330" strokeOpacity="0.45" strokeWidth="5" fill="none" />
        ))}
        <path d="M-200 400C-130 330 -100 250 -20 180" stroke="#fff" strokeOpacity="0.12" strokeWidth="14" fill="none" />
      </g>
      {/* rim light from the sun */}
      <rect x="-300" y="-300" width={W + 600} height={H + 600} fill={mix(m.glow, '#000000', 0.2)} opacity="0.12" />
    </>
  );
}

function Fabric({ m, id, seed }: Ctx) {
  const r = useMemo(() => rng(seed), [seed]);
  const folds = useMemo(() => Array.from({ length: 11 }, (_, i) => ({ y: -60 + i * 105 + r() * 30, a: 50 + r() * 70, p: r() * 6 })), [r]);
  return (
    <>
      <defs>
        <linearGradient id={`${id}-cloth`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f5ab0" />
          <stop offset="1" stopColor="#0d1536" />
        </linearGradient>
        <linearGradient id={`${id}-fold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8aa3ea" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#2a3d86" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id={`${id}-brass`}>
          <stop offset="0" stopColor="#f6dc9a" />
          <stop offset="0.6" stopColor="#b8975a" />
          <stop offset="1" stopColor="#6a4a22" />
        </radialGradient>
      </defs>
      <rect x="-300" y="-300" width={W + 600} height={H + 600} fill={`url(#${id}-cloth)`} data-depth="0" />
      <g data-depth="0.12">
        {folds.map((f, i) => (
          <path
            key={i}
            d={`M-100 ${f.y}C300 ${f.y - f.a} 700 ${f.y + f.a + f.p * 4} 1100 ${f.y - f.a * 0.4}S1500 ${f.y + f.a} 1700 ${f.y}L1700 ${f.y + 150}C1500 ${f.y + 150 + f.a} 1100 ${f.y + 150 - f.a * 0.4} 700 ${f.y + 150 + f.a}S300 ${f.y + 150 - f.a} -100 ${f.y + 150}Z`}
            fill={`url(#${id}-fold)`}
          />
        ))}
      </g>
      <g data-depth="0.24">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${260 + i * 270} ${300 + Math.sin(i * 1.6) * 70})`}>
            <circle r="76" fill={`url(#${id}-brass)`} />
            <circle r="56" fill="none" stroke="#3a2412" strokeWidth="4" opacity="0.6" />
            <circle r="32" fill="none" stroke="#3a2412" strokeWidth="3" opacity="0.5" />
            <circle r="10" fill="#3a2412" opacity="0.6" />
          </g>
        ))}
        <path d="M110 300C300 560 600 640 800 620S1300 560 1500 300" fill="none" stroke="#b8975a" strokeWidth="5" strokeDasharray="2 18" strokeLinecap="round" />
      </g>
      <rect x="-300" y="-300" width={W + 600} height={H + 600} fill={m.glow} opacity="0.05" />
    </>
  );
}

function Crowd({ m, id, seed }: Ctx) {
  const r = useMemo(() => rng(seed), [seed]);
  const heads = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const row = Math.floor(i / 24);
        return { x: ((i % 24) + r() * 0.6) * 72 - 40, y: 790 + row * 70 + r() * 20, s: 0.9 + row * 0.35 + r() * 0.2, row, w: r() > 0.55 };
      }),
    [r],
  );
  const bokeh = useMemo(() => Array.from({ length: 28 }, () => ({ x: r() * W, y: 120 + r() * 520, s: 14 + r() * 50, o: 0.15 + r() * 0.5, c: r() > 0.5 ? m.warm : '#ff7a5a' })), [r, m.warm]);
  return (
    <>
      <defs>
        <radialGradient id={`${id}-stage`} cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#ffb870" />
          <stop offset="0.4" stopColor="#8a3a3a" />
          <stop offset="1" stopColor="#0a0610" />
        </radialGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-b`}>
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <rect x="-300" y="-300" width={W + 600} height={H + 600} fill={`url(#${id}-stage)`} data-depth="0" />
      <g data-depth="0.08">
        <path d="M200 -50L700 800L100 800Z" fill={`url(#${id}-beam)`} />
        <path d="M800 -50L1100 800L500 800Z" fill={`url(#${id}-beam)`} />
        <path d="M1400 -50L1700 800L1000 800Z" fill={`url(#${id}-beam)`} />
      </g>
      <g data-depth="0.14" filter={`url(#${id}-b)`}>
        {bokeh.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.s} fill={b.c} opacity={b.o} />
        ))}
      </g>
      <g data-depth="0.26" fill="#07040a">
        {heads
          .sort((a, b) => a.row - b.row)
          .map((h, i) => (
            <g key={i} transform={`translate(${h.x} ${h.y}) scale(${h.s * 1.3})`}>
              <ellipse cx="0" cy="-22" rx="17" ry="19" />
              {h.w && <path d="M-19 -30C-14 -52 14 -52 19 -30C10 -36 -10 -36 -19 -30Z" />}
              <path d="M-34 60L-30 12Q0 -4 30 12L34 60Z" />
            </g>
          ))}
        <rect x="-100" y="1000" width={W + 200} height="300" />
      </g>
    </>
  );
}

function Tea({ m, id, seed }: Ctx) {
  const r = useMemo(() => rng(seed), [seed]);
  const steam = useMemo(() => Array.from({ length: 4 }, (_, i) => ({ x: 760 + i * 28, o: 0.2 + r() * 0.2 })), [r]);
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a0f12" />
          <stop offset="0.6" stopColor="#5a2c28" />
          <stop offset="1" stopColor="#20100e" />
        </linearGradient>
        <radialGradient id={`${id}-lg`}>
          <stop offset="0" stopColor={m.warm} stopOpacity="0.9" />
          <stop offset="1" stopColor={m.warm} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-brassg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4d890" />
          <stop offset="0.5" stopColor="#b8975a" />
          <stop offset="1" stopColor="#5a3a1a" />
        </linearGradient>
        <linearGradient id={`${id}-tea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0b34a" />
          <stop offset="1" stopColor="#8a3a14" />
        </linearGradient>
        <filter id={`${id}-bl`}>
          <feGaussianBlur stdDeviation="30" />
        </filter>
      </defs>
      <rect x="-300" y="-300" width={W + 600} height={H + 600} fill={`url(#${id}-bg)`} data-depth="0" />
      <g data-depth="0.08" filter={`url(#${id}-bl)`}>
        <circle cx="300" cy="260" r="120" fill={m.warm} opacity="0.6" />
        <circle cx="1280" cy="200" r="150" fill={m.warm} opacity="0.5" />
        <circle cx="1000" cy="420" r="80" fill="#ff7a5a" opacity="0.5" />
      </g>
      <g data-depth="0.16">
        <circle cx="800" cy="600" r="620" fill={`url(#${id}-lg)`} opacity="0.35" />
      </g>
      <g data-depth="0.26">
        <rect x="-200" y="760" width={W + 400} height="360" fill="#2a120e" />
        {['#b5532f', '#4a1220', '#d8c3a0', '#25375a', '#b5532f', '#4a1220', '#d8c3a0', '#25375a'].map((c, i) => (
          <rect key={i} x={-100 + i * 220} y="800" width="220" height="400" fill={c} opacity="0.7" />
        ))}
        <ellipse cx="800" cy="800" rx="520" ry="96" fill="#000" opacity="0.4" />
        <ellipse cx="800" cy="780" rx="520" ry="96" fill={`url(#${id}-brassg)`} />
        <ellipse cx="800" cy="772" rx="470" ry="78" fill="none" stroke="#3a2412" strokeOpacity="0.6" strokeWidth="3" />
        {/* teapot */}
        <g transform="translate(800 770)">
          <path d="M-110 0C-130 -90 -80 -150 0 -150C80 -150 130 -90 110 0Z" fill={`url(#${id}-brassg)`} />
          <path d="M-60 -148C-40 -190 40 -190 60 -148Z" fill="#8a6a34" />
          <circle cx="0" cy="-196" r="14" fill="#d8b66a" />
          <path d="M100 -40C170 -60 200 -130 250 -200C260 -206 268 -196 262 -186C216 -112 186 -50 112 -14Z" fill={`url(#${id}-brassg)`} />
          <path d="M-108 -90C-190 -110 -190 -10 -108 -22" fill="none" stroke="#8a6a34" strokeWidth="14" />
          <path d="M-80 -70C-40 -40 40 -40 80 -70" fill="none" stroke="#3a2412" strokeOpacity="0.4" strokeWidth="4" />
        </g>
        {[-340, 340, -200].map((x, i) => (
          <g key={i} transform={`translate(${800 + x} ${i === 2 ? 810 : 790})`}>
            <path d="M-34 -84H34L28 0H-28Z" fill="#fff" opacity="0.15" stroke="#ffe3b0" strokeOpacity="0.55" strokeWidth="3" />
            <path d="M-31 -66H31L27 0H-27Z" fill={`url(#${id}-tea)`} />
            <ellipse cx="0" cy="-66" rx="31" ry="7" fill="#f6c76a" />
          </g>
        ))}
        {steam.map((s, i) => (
          <path key={i} d={`M${s.x} 560C${s.x - 30} 500 ${s.x + 30} 450 ${s.x} 380C${s.x - 24} 330 ${s.x + 20} 300 ${s.x + 6} 250`} fill="none" stroke="#fff" strokeOpacity={s.o} strokeWidth="9" strokeLinecap="round" filter={`url(#${id}-bl)`} />
        ))}
      </g>
    </>
  );
}

function Port({ m, id, seed, ink }: Ctx) {
  const r = useMemo(() => rng(seed), [seed]);
  const boats = [
    { x: 330, y: 790, s: 1.25, c: '#2a5a9a' },
    { x: 780, y: 760, s: 1, c: '#b5532f' },
    { x: 1190, y: 830, s: 1.45, c: '#d8c3a0' },
  ];
  return (
    <>
      <Sky m={m} id={id} />
      <Sun m={m} id={id} y={560} x={820} size={1.2} />
      <defs>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(m.sky[2], '#203a5a', 0.4)} />
          <stop offset="1" stopColor="#0a1426" />
        </linearGradient>
      </defs>
      <g data-depth="0.08">
        <rect x="-300" y="560" width={W + 600} height="900" fill={`url(#${id}-sea)`} />
        <rect x="660" y="560" width="320" height="400" fill={m.sunC} opacity="0.22" />
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={i} x={640 + r() * 360} y={575 + i * 14} width={30 + r() * 150} height="3" fill={m.sunC} opacity={0.5 - i * 0.015} />
        ))}
      </g>
      <g data-depth="0.2">
        {boats.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
            <path d="M-190 -30H190L150 30Q0 54 -150 30Z" fill={ink} />
            <path d="M-182 -22H182" stroke={b.c} strokeWidth="12" />
            <rect x="-60" y="-96" width="86" height="66" fill={ink} />
            <rect x="-48" y="-82" width="26" height="22" fill={m.warm} opacity="0.85" />
            <line x1="90" y1="-30" x2="90" y2="-210" stroke={ink} strokeWidth="6" />
            <line x1="90" y1="-200" x2="170" y2="-30" stroke={ink} strokeWidth="2" />
            <line x1="90" y1="-200" x2="-150" y2="-34" stroke={ink} strokeWidth="2" />
            <ellipse cx="0" cy="62" rx="210" ry="9" fill="#000" opacity="0.4" />
          </g>
        ))}
      </g>
      <g data-depth="0.32" fill={ink}>
        <rect x="-100" y="900" width={W + 200} height="300" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={80 + i * 230} y="840" width="14" height="70" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${200 + i * 260} ${180 + r() * 90}l16 -10l16 10m-16 -10l4 -6m12 6l-4 -6`} fill="none" stroke={ink} strokeWidth="3" />
        ))}
      </g>
    </>
  );
}

function Beach({ m, id, seed, ink }: Ctx) {
  const r = useMemo(() => rng(seed), [seed]);
  const dune = useMemo(() => makeDune(seed + 2, 700, 60, 260), [seed]);
  return (
    <>
      <Sky m={m} id={id} />
      <Sun m={m} id={id} y={580} x={620} size={1.1} />
      <defs>
        <linearGradient id={`${id}-oc`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(m.sky[2], '#274a6a', 0.5)} />
          <stop offset="1" stopColor="#102238" />
        </linearGradient>
      </defs>
      <g data-depth="0.06">
        <rect x="-300" y="570" width={W + 600} height="500" fill={`url(#${id}-oc)`} />
        {Array.from({ length: 18 }, (_, i) => (
          <rect key={i} x={400 + r() * 500} y={585 + i * 16} width={30 + r() * 160} height="3" fill={m.sunC} opacity={0.5 - i * 0.02} />
        ))}
      </g>
      <g data-depth="0.14">
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M-100 ${700 + i * 50}C200 ${680 + i * 50} 500 ${730 + i * 50} 800 ${705 + i * 50}S1400 ${690 + i * 50} 1700 ${712 + i * 50}`} stroke="#fff" strokeOpacity={0.12 + i * 0.06} strokeWidth={3 + i * 2} fill="none" />
        ))}
      </g>
      <g data-depth="0.24">
        <path d={`M-100 ${dune.y(-100)}C400 ${dune.y(300) + 70} 900 ${dune.y(900) + 90} 1700 ${dune.y(1600) + 150}L1700 1200L-100 1200Z`} fill={mix(m.dunes[1], m.haze, 0.2)} />
        <path d={`M-100 900C400 860 900 880 1700 830L1700 1200L-100 1200Z`} fill={m.dunes[2]} />
        <Camel x={1000} y={866} s={1.5} fill={ink} flip />
        <Walker x={870} y={872} s={1.7} fill={ink} />
      </g>
    </>
  );
}

function City({ m, id, seed, ink }: Ctx) {
  const r = useMemo(() => rng(seed), [seed]);
  const blocks = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const w = 70 + r() * 90;
        return { x: -30 + i * 82 + r() * 10, w, h: 90 + r() * 170, win: Math.floor(r() * 5) + 2 };
      }),
    [r],
  );
  return (
    <>
      <Sky m={m} id={id} />
      <Sun m={m} id={id} y={620} x={420} size={1} />
      <Dunes m={m} id={id} seed={seed} base={650} count={2} spread={90} amp={40} />
      <g data-depth="0.22">
        <rect x="-100" y="820" width={W + 200} height="400" fill={ink} />
        {blocks.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={820 - b.h} width={b.w} height={b.h} fill={mix(ink, '#3a2020', 0.3 + (i % 3) * 0.1)} />
            {Array.from({ length: b.win }, (_, j) => (
              <rect key={j} x={b.x + 12 + (j % 3) * (b.w / 3.4)} y={820 - b.h + 26 + Math.floor(j / 3) * 46} width="12" height="18" fill={m.warm} opacity={r() > 0.35 ? 0.9 : 0.15} />
            ))}
          </g>
        ))}
        {/* minaret */}
        <rect x="1120" y="470" width="50" height="350" fill={ink} />
        <rect x="1112" y="470" width="66" height="26" fill={mix(ink, '#3a2020', 0.4)} />
        <rect x="1128" y="420" width="34" height="52" fill={ink} />
        <path d="M1128 420Q1145 380 1162 420Z" fill={ink} />
        <line x1="1145" y1="400" x2="1145" y2="360" stroke={ink} strokeWidth="3" />
        <circle cx="1145" cy="354" r="7" fill={m.warm} />
        <Palm x={90} y={830} s={1.3} fill={ink} />
        <Palm x={1450} y={830} s={1.1} fill={ink} />
      </g>
    </>
  );
}

function Gate({ m, id, seed, ink }: Ctx) {
  const stone = mix('#8a6a48', ink, 0.45);
  return (
    <>
      <defs>
        <clipPath id={`${id}-arch`}>
          <path d="M560 1000V470C560 360 660 260 800 240C940 260 1040 360 1040 470V1000Z" />
        </clipPath>
        <linearGradient id={`${id}-st`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={mix(stone, '#000000', 0.45)} />
          <stop offset="0.6" stopColor={stone} />
          <stop offset="1" stopColor={mix(stone, m.sunC, 0.3)} />
        </linearGradient>
      </defs>
      <g data-depth="0.05">
        <g clipPath={`url(#${id}-arch)`}>
          <Sky m={m} id={`${id}i`} />
          <Sun m={m} id={`${id}i`} y={640} x={800} size={0.9} />
          <Dunes m={m} id={`${id}i`} seed={seed} base={640} count={3} spread={90} amp={40} />
          <Camel x={760} y={800} s={1.2} fill={ink} />
          <Walker x={900} y={806} s={1.4} fill={ink} />
        </g>
      </g>
      <g data-depth="0.16">
        <path fillRule="evenodd" d="M-300 1100V260H1900V1100ZM560 1100V470C560 360 660 260 800 240C940 260 1040 360 1040 470V1100Z" fill={`url(#${id}-st)`} />
        <path d="M560 1000V470C560 360 660 260 800 240C940 260 1040 360 1040 470V1000" fill="none" stroke="#000" strokeOpacity="0.45" strokeWidth="6" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-300 + i * 150} y="226" width="70" height="40" fill={`url(#${id}-st)`} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${100 + i * 280} 560l30 40l-30 40l-30 -40z`} fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="3" />
        ))}
      </g>
      <rect x="-300" y="-300" width={W + 600} height={H + 600} fill={m.glow} opacity="0.06" />
    </>
  );
}

function Nomad({ m, id, seed, ink }: Ctx) {
  // a tent in the foreground, seen from the dunes, at golden hour
  const ridge = useMemo(() => makeDune(seed + 4, 730, 50, 260), [seed]);
  return (
    <>
      <defs>
        <linearGradient id={`${id}-lamp`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe3a8" />
          <stop offset="1" stopColor={m.warm} />
        </linearGradient>
        <radialGradient id={`${id}-lamp-g`}>
          <stop offset="0" stopColor={m.warm} stopOpacity="0.8" />
          <stop offset="1" stopColor={m.warm} stopOpacity="0" />
        </radialGradient>
      </defs>
      <Sky m={m} id={id} />
      <Sun m={m} id={id} x={400} y={m.sunY} />
      <Dunes m={m} id={id} seed={seed} base={600} count={3} spread={95} amp={55} />
      <g data-depth="0.24">
        <path d={ridge.d} fill={ink} />
        <Tent x={1000} y={ridge.y(1000) + 20} w={640} h={330} fill={mix(ink, '#3a2420', 0.45)} glow id={id} />
        <Camel x={520} y={ridge.y(520) + 20} s={2.2} fill={ink} />
        <Camel x={300} y={ridge.y(300) + 24} s={1.9} fill={ink} flip />
        <Walker x={720} y={ridge.y(720) + 22} s={2.4} fill={ink} />
      </g>
    </>
  );
}

const SCENES: Record<SceneKind, { C: (p: Ctx) => ReactNode; mood: Mood }> = {
  caravan: { C: Caravan, mood: 'dusk' },
  sahara: { C: Sahara, mood: 'gold' },
  camp: { C: Camp, mood: 'night' },
  fantasia: { C: Fantasia, mood: 'gold' },
  music: { C: Music, mood: 'night' },
  market: { C: Market, mood: 'dusk' },
  portrait: { C: Portrait, mood: 'gold' },
  fabric: { C: Fabric, mood: 'dusk' },
  crowd: { C: Crowd, mood: 'night' },
  tea: { C: Tea, mood: 'dusk' },
  port: { C: Port, mood: 'dawn' },
  beach: { C: Beach, mood: 'dusk' },
  city: { C: City, mood: 'dusk' },
  gate: { C: Gate, mood: 'gold' },
  nomad: { C: Nomad, mood: 'gold' },
};

/* ------------------------------------------------------------------ public */
export function Scene({ spec, label, className = '', style }: { spec: SceneSpec; label?: string; className?: string; style?: React.CSSProperties }) {
  const raw = useId();
  const id = 's' + raw.replace(/[^a-zA-Z0-9]/g, '');
  const def = SCENES[spec.kind];
  const m = MOODS[spec.mood ?? def.mood];
  const ink = mix(m.dunes[3], '#000000', 0.3);
  const seed = spec.seed ?? 11;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <g transform={spec.flip ? `translate(${W} 0) scale(-1 1)` : undefined}>
        <def.C m={m} id={id} seed={seed} ink={ink} />
      </g>
    </svg>
  );
}
