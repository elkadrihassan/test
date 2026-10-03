// Everything you'd want to tweak lives here.

export const W = 800;          // canvas width
export const H = 400;          // canvas height
export const GY = 320;         // ground line (y of the top of the ground)
export const PX = 130;         // player's fixed x position on screen
export const TILE = 32;        // ground tile size
export const STEP = 1000 / 60; // fixed timestep (ms)

export const PHYSICS = {
  gravity: 0.65,
  jumpVelocity: -12.8,   // more negative = higher jump
  shortHopVelocity: -8,  // jump height when you let go of the button early
  stompBounce: -8,
  stompBounceHeld: -12,
  coyoteFrames: 6,       // grace frames to still jump after leaving a ledge
  jumpBufferFrames: 8,   // grace frames for pressing jump slightly early
};

export const DIFFICULTY = {
  startSpeed: 4.8,
  maxSpeed: 11,
  speedRampDistance: 6000,  // distance over which speed increases by 1
  levelDistance: 3000,      // distance per world/stage
  baseGap: 230,             // empty space between obstacle groups
  gapPerSpeed: 18,
  gapRandom: 140,
};

export const SCORE = {
  perDistance: 0.1, // points per distance unit
  coin: 10,
  stomp: 100,
  mushroom: 500,
};

// Chance of each obstacle group (must add up to 1). See js/level.js.
export const PATTERN_WEIGHTS = [
  ['pipe', 0.22],
  ['pit', 0.18],
  ['enemies', 0.20],
  ['plat', 0.18],
  ['coins', 0.12],
  ['combo', 0.10],
];

// One entry per stage; they repeat.
export const THEMES = [
  { top: '#5c94fc', bot: '#a8ccff', hill: '#3fae3f', hill2: '#2e8b2e', cloud: '#fff', stars: false },
  { top: '#ff7e5f', bot: '#ffd27f', hill: '#3a7d3a', hill2: '#2b5f2b', cloud: '#ffe9d0', stars: false },
  { top: '#0b1030', bot: '#2b3a7a', hill: '#1c4a3a', hill2: '#12342a', cloud: '#5a6aa8', stars: true },
  { top: '#2a0a3a', bot: '#7a2a6a', hill: '#4a2a5a', hill2: '#321a40', cloud: '#a870a8', stars: true },
];
