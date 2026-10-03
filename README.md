# Super Mario Runner

An endless side-scrolling runner. Plain HTML/CSS/JS, no build step.

## Run it
ES modules need a web server (opening the file by double-click won't work).
Use VS Code **Live Server**, or `python3 -m http.server` and open http://localhost:8000.

## Where to change things
| File | What's in it |
|---|---|
| `js/config.js` | Gravity, jump height, speed ramp, scoring, obstacle odds, world colour themes |
| `js/sprites.js` | Pixel art for the hero, enemy, mushroom and ground tile |
| `js/level.js` | Obstacle patterns (pipes, pits, platforms...) and the spawner |
| `js/game.js` | Rules: physics, collisions, scoring, death |
| `js/render.js` | All drawing (background, objects, HUD, overlays) |
| `js/audio.js` | Sound effects |
| `js/input.js` | Keyboard / touch controls |
| `js/state.js` | Shared game state |
| `js/main.js` | Entry point and game loop |
| `css/style.css` | Page styling |

To add a new obstacle: write a function in `patterns` (`js/level.js`), add it to `PATTERN_WEIGHTS` (`js/config.js`), then handle its `t` type in `collide()` (`js/game.js`) and `drawObjects()` (`js/render.js`).
