// HEARTHFIRE — mouse + keyboard input.
import { INGREDIENTS } from './recipes.js';
import { PHASE_TITLE, PHASE_PLAY, PHASE_DAY_END, PHASE_OVER, placeOnStation, clickStation, servePlate, clearPlate, pourAle, startGame, startDay } from './state.js';
import { sfx } from './audio.js';

function inRect(x, y, r) { return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

export function bindInput(game, canvas, onPhaseChange) {
  canvas.addEventListener('click', (ev) => {
    sfx.unlock();
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (canvas.width / rect.width);
    const y = (ev.clientY - rect.top) * (canvas.height / rect.height);
    handleClick(game, x, y, onPhaseChange);
  });

  window.addEventListener('keydown', (ev) => {
    if (ev.repeat) return;
    const k = ev.key.toLowerCase();
    if (k === 'm') { game.muted = !game.muted; sfx.setMuted(game.muted); return; }
    if (k === 'p' && game.phase === PHASE_PLAY) { game.paused = !game.paused; return; }
    if (k === 'enter' || k === ' ') {
      ev.preventDefault();
      if (game.phase === PHASE_TITLE) { startGame(game); sfx.click(); onPhaseChange?.(); return; }
      if (game.phase === PHASE_DAY_END) { if (game.dayPassed && game.day < 2) { startDay(game, game.day + 1); sfx.click(); } return; }
      if (game.phase === PHASE_OVER) { window.__hearthRestart?.(); return; }
      if (game.phase === PHASE_PLAY && k === ' ') { doServe(game); return; }
    }
    if (k === 'r' && (game.phase === PHASE_OVER || game.phase === PHASE_DAY_END)) { window.__hearthRestart?.(); return; }
    if (game.phase !== PHASE_PLAY || game.paused) return;
    if (k === 'x') { if (clearPlate(game)) sfx.error(); return; }
    const num = Number(k);
    if (num >= 1 && num <= INGREDIENTS.length) { pickIngredient(game, INGREDIENTS[num - 1].id); }
  });
}

// Restart is owned by main.js (it rebuilds the game object); see window.__hearthRestart.

function pickIngredient(game, id) {
  if (id === 'ale') {
    const r = pourAle(game);
    if (r.ok) sfx.place(); else sfx.error();
    return;
  }
  game.held = game.held === id ? null : id;
  if (game.held) sfx.click();
}

function doServe(game) {
  const r = servePlate(game);
  if (r.ok) { sfx.coin(); if (game.combo >= 3) sfx.perfect(); }
  else sfx.error();
}

export function handleClick(game, x, y, onPhaseChange) {
  const ui = game.ui || {};
  if (game.phase === PHASE_TITLE) {
    startGame(game); sfx.click(); onPhaseChange?.(); return;
  }
  if (game.phase === PHASE_DAY_END) {
    if (game.dayPassed && game.day < 2) { startDay(game, game.day + 1); sfx.click(); }
    return;
  }
  if (game.phase === PHASE_OVER) { window.__hearthRestart?.(); return; }
  if (game.phase !== PHASE_PLAY || game.paused) return;

  for (const b of ui.bins || []) {
    if (inRect(x, y, b)) { pickIngredient(game, b.id); return; }
  }
  for (const s of ui.stations || []) {
    if (inRect(x, y, s)) {
      const st = game.stations.find((v) => v.id === s.id);
      if (st && !st.item && game.held) {
        const r = placeOnStation(game, s.id);
        if (r.ok) { sfx.place(); if (s.id === 'grill') sfx.sizzle(); }
        else { sfx.error(); }
      } else if (st && st.item) {
        const wasDone = st.done;
        const r = clickStation(game, s.id);
        if (r.ok) {
          if (r.perfect) sfx.perfect();
          else if (r.chopped) sfx.chop();
          else if (r.burnt || r.ruined) sfx.error();
          else if (wasDone) sfx.place();
          else if (s.id === 'grill') sfx.click();
        } else sfx.error();
      } else if (!game.held) { sfx.error(); }
      return;
    }
  }
  if (inRect(x, y, ui.bell)) { doServe(game); return; }
  if (inRect(x, y, ui.trash)) { if (clearPlate(game)) sfx.error(); }
}
