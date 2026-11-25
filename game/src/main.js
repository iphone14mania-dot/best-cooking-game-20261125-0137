// HEARTHFIRE — boot and wiring.
// ?seed=N fixes the shuffle. ?shot=title|kitchen|serve|win (with &seed=N)
// stages that scene instead of starting interactively, paints it frozen, and
// sets window.__shotReady for the screenshot runner.
import { newGame, startGame, tick, PHASE_PLAY, PHASE_OVER } from './state.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { stageShot } from './shots.js';
import { sfx } from './audio.js';

const params = new URLSearchParams(location.search);
const seedParam = params.get('seed');
const seed = seedParam === null ? undefined : Number(seedParam) || 0;
const shot = params.get('shot');

const canvas = document.getElementById('game');
let game = shot ? stageShot(shot, seed) : newGame(seed);

// Restart in place so the input handlers keep their object reference.
window.__hearthRestart = () => {
  const fresh = newGame((Math.random() * 1e9) | 0);
  for (const k of Object.keys(fresh)) game[k] = fresh[k];
  startGame(game);
};

bindInput(game, canvas, () => {});

let last = performance.now();
let dinged = new Set();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shot && game.phase === PHASE_PLAY && !game.paused) {
    const before = new Set(game.stations.filter((s) => s.done).map((s) => s.id));
    tick(game, dt);
    // Ding once when a boil/bake finishes.
    for (const s of game.stations) {
      if (s.done && !before.has(s.id) && (s.id === 'boil' || s.id === 'bake')) sfx.ding();
    }
    if (game.phase === PHASE_OVER) {
      if (game.won) sfx.win(); else sfx.lose();
    }
  }
  render(game);
  if (!window.__shotReady) window.__shotReady = true;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
