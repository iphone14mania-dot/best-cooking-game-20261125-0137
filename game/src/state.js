// HEARTHFIRE — game state: seeded RNG, orders, stations, scoring, win/lose.
import { DAY_LENGTH, MAX_ORDERS, MAX_STRIKES, PLATE_SLOTS, DAY_TARGETS, PATIENCE, ORDER_INTERVAL, CHOP_CLICKS, BOIL_TIME, BAKE_TIME, BURN_AFTER, TIP_MAX, COMBO_STEP, COMBO_CAP } from './config.js';
import { STATIONS, INGREDIENTS, ING_BY_ID, COMPONENTS, DISHES, DISH_BY_ID, CUSTOMERS } from './recipes.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_DAY_END = 'dayend';
export const PHASE_OVER = 'over';

/** Tiny deterministic RNG (mulberry32) so ?seed=N replays the same kitchen. */
export function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

export function newGame(seed) {
  const rng = makeRng(seed ?? (Date.now() % 2147483647));
  return {
    seed, rng,
    phase: PHASE_TITLE,
    day: 0, // 0..2
    timeLeft: DAY_LENGTH,
    coins: 0, dayCoins: 0, score: 0,
    combo: 0, bestCombo: 0,
    served: 0, lost: 0, strikes: 0,
    orders: [], orderTimer: 4, orderSeq: 0,
    held: null, // ingredient id in hand, or null
    plate: [], // component ids on the plate
    stations: STATIONS.map((s) => ({ id: s.id, item: null, progress: 0, clicks: 0, needle: 0, needleDir: 1, done: false, burnt: false, sitTime: 0 })),
    floats: [], // floating score popups {x,y,text,color,ttl}
    particles: [],
    message: '', messageTtl: 0,
    muted: false, paused: false,
    stats: { chopped: 0, grilled: 0, boiled: 0, baked: 0, burnt: 0, perfect: 0 },
    dayResults: [],
    ui: {}, // hit-boxes filled by render: {bins:[], stations:[], bell, trash, ...}
  };
}

export function dishesForDay(day) { return DISHES.filter((d) => d.day <= day); }

export function spawnOrder(game) {
  if (game.orders.length >= MAX_ORDERS) return;
  const dishes = dishesForDay(game.day);
  const dish = pick(game.rng, dishes);
  const cust = pick(game.rng, CUSTOMERS);
  const patience = PATIENCE[game.day] * (0.9 + game.rng() * 0.2);
  game.orders.push({ id: ++game.orderSeq, dish: dish.id, customer: cust, patience, patienceMax: patience, born: game.timeLeft });
}

export function startDay(game, day) {
  game.day = day;
  game.phase = PHASE_PLAY;
  game.timeLeft = DAY_LENGTH;
  game.dayCoins = 0;
  game.combo = 0;
  game.strikes = 0;
  game.orders = [];
  game.orderTimer = 2;
  game.plate = [];
  game.held = null;
  game.stations.forEach((s) => { s.item = null; s.progress = 0; s.clicks = 0; s.done = false; s.burnt = false; s.sitTime = 0; });
  spawnOrder(game);
  spawnOrder(game);
  setMessage(game, day === 0 ? 'Day 1 — the tavern opens! Serve the orders!' : `Day ${day + 1} — busier, hungrier, richer!`);
}

export function startGame(game) { startDay(game, 0); }

export function setMessage(game, text) { game.message = text; game.messageTtl = 3; }

function addFloat(game, x, y, text, color) {
  game.floats.push({ x, y, text, color: color || '#f2b134', ttl: 1.4 });
}

export function stationDef(id) { return STATIONS.find((s) => s.id === id); }

/** Put the held ingredient onto a station. Returns ok/message. */
export function placeOnStation(game, stationId) {
  const st = game.stations.find((s) => s.id === stationId);
  const def = stationDef(stationId);
  if (!st || st.item) return { ok: false, why: st && st.item ? 'Station is busy' : 'No station' };
  if (!game.held) return { ok: false, why: 'Pick an ingredient first' };
  const ing = ING_BY_ID[game.held];
  if (!ing.cooked[stationId]) return { ok: false, why: `${ing.name} can't go on the ${def.name}` };
  st.item = game.held;
  st.progress = 0; st.clicks = 0; st.done = false; st.burnt = false; st.sitTime = 0;
  st.needle = 0; st.needleDir = 1;
  game.held = null;
  return { ok: true };
}

/** Click a station: chop progress, grill needle stop, or collect a finished dish. */
export function clickStation(game, stationId) {
  const st = game.stations.find((s) => s.id === stationId);
  if (!st) return { ok: false };
  if (!st.item) return { ok: false, why: 'Empty station — place an ingredient' };
  if (st.burnt) { // clear the burnt mess
    st.item = null; st.burnt = false; st.progress = 0; st.sitTime = 0;
    game.stats.burnt += 1;
    game.combo = 0;
    setMessage(game, 'Burnt! Cleared — combo lost.');
    return { ok: true, burnt: true };
  }
  if (st.done) return collectStation(game, stationId);
  if (stationId === 'chop') {
    st.clicks += 1;
    game.stats.chopped += 1;
    if (st.clicks >= CHOP_CLICKS) { st.done = true; }
    return { ok: true, chopped: st.clicks };
  }
  if (stationId === 'grill') {
    // Stop the needle: green zone 0.62..0.86 is good, 0.70..0.80 perfect.
    const n = st.needle;
    if (n >= 0.70 && n <= 0.80) { st.done = true; st.perfect = true; game.stats.perfect += 1; game.stats.grilled += 1; return { ok: true, perfect: true }; }
    if (n >= 0.60 && n <= 0.88) { st.done = true; game.stats.grilled += 1; return { ok: true, good: true }; }
    st.item = null; st.progress = 0; st.burnt = false;
    game.combo = 0;
    setMessage(game, n < 0.60 ? 'Undercooked! Tossed out.' : 'Burnt on the grill! Tossed out.');
    return { ok: true, ruined: true };
  }
  if (st.done) return collectStation(game, stationId);
  return { ok: false, why: 'Still cooking — wait for the ding' };
}
export function collectStation(game, stationId) {
  const st = game.stations.find((s) => s.id === stationId);
  if (!st || !st.item || !st.done || st.burnt) return { ok: false };
  if (game.plate.length >= PLATE_SLOTS) return { ok: false, why: 'Plate is full — serve or trash it' };
  const ing = ING_BY_ID[st.item];
  const comp = ing.cooked[stationId];
  game.plate.push(comp);
  st.item = null; st.done = false; st.progress = 0; st.sitTime = 0; st.perfect = false;
  return { ok: true, component: comp };
}

/** Click the Ale bin: a mug goes straight onto the plate. */
export function pourAle(game) {
  if (game.plate.length >= PLATE_SLOTS) return { ok: false, why: 'Plate is full' };
  game.plate.push('ale');
  return { ok: true, component: 'ale' };
}

export function clearPlate(game) {
  if (game.plate.length === 0) return false;
  game.plate = [];
  game.combo = 0;
  setMessage(game, 'Plate cleared.');
  return true;
}

/** Does the plate match a waiting order? Returns the order or null. */
export function matchingOrder(game) {
  const plate = [...game.plate].sort();
  return game.orders.find((o) => {
    const needs = [...DISH_BY_ID[o.dish].needs].sort();
    return needs.length === plate.length && needs.every((n, i) => n === plate[i]);
  }) || null;
}

export function servePlate(game) {
  const order = matchingOrder(game);
  if (!order) {
    game.combo = 0;
    setMessage(game, 'No order matches this plate — check the tickets!');
    return { ok: false, why: 'no match' };
  }
  const dish = DISH_BY_ID[order.dish];
  const tip = Math.round((order.patience / order.patienceMax) * TIP_MAX);
  const comboBonus = Math.min(game.combo * COMBO_STEP, COMBO_CAP);
  const earned = dish.price + tip + comboBonus;
  game.coins += earned;
  game.dayCoins += earned;
  game.score += earned * 10 + (game.combo + 1) * 5;
  game.combo += 1;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  game.served += 1;
  game.orders = game.orders.filter((o) => o.id !== order.id);
  addFloat(game, 980, 560, `+${earned} coins${game.combo > 1 ? `  COMBO x${game.combo}` : ''}`, '#f2b134');
  game.plate = [];
  setMessage(game, `${dish.name} served to ${order.customer.name}! +${earned} coins`);
  return { ok: true, earned, order, dish };
}

function endDay(game, passed) {
  game.phase = PHASE_DAY_END;
  game.dayPassed = passed;
  const stars = passed ? (game.dayCoins >= DAY_TARGETS[game.day] * 1.3 ? 3 : game.dayCoins >= DAY_TARGETS[game.day] * 1.1 ? 2 : 1) : 0;
  game.dayResults.push({ day: game.day + 1, coins: game.dayCoins, target: DAY_TARGETS[game.day], passed, stars });
  if (!passed) { game.phase = PHASE_OVER; game.won = false; }
  else if (game.day >= 2) { game.phase = PHASE_OVER; game.won = true; }
}

/** Advance timers, needle, patience, orders. dt in seconds. */
export function tick(game, dt) {
  if (game.phase !== PHASE_PLAY || game.paused) return;
  game.timeLeft -= dt;
  if (game.messageTtl > 0) game.messageTtl -= dt;
  for (const f of game.floats) f.ttl -= dt;
  game.floats = game.floats.filter((f) => f.ttl > 0);
  // orders
  game.orderTimer -= dt;
  if (game.orderTimer <= 0) { spawnOrder(game); game.orderTimer = ORDER_INTERVAL[game.day] * (0.8 + game.rng() * 0.4); }
  for (const o of game.orders) o.patience -= dt;
  const walked = game.orders.filter((o) => o.patience <= 0);
  if (walked.length) {
    game.orders = game.orders.filter((o) => o.patience > 0);
    game.strikes += walked.length;
    game.lost += walked.length;
    game.combo = 0;
    setMessage(game, `${walked[0].customer.name} stormed out! Strike ${game.strikes}/${MAX_STRIKES}`);
    if (game.strikes >= MAX_STRIKES) { endDay(game, false); return; }
  }
  // stations
  for (const st of game.stations) {
    if (!st.item || st.done || st.burnt) {
      if (st.done && !st.burnt) { st.sitTime += dt; if (st.sitTime > BURN_AFTER) { st.burnt = true; setMessage(game, 'Left too long — it burnt!'); } }
      continue;
    }
    if (st.id === 'grill') {
      st.needle += st.needleDir * dt * 1.15;
      if (st.needle >= 1) { st.needle = 1; st.needleDir = -1; }
      if (st.needle <= 0) { st.needle = 0; st.needleDir = 1; }
    } else if (st.id === 'boil') {
      st.progress += dt / BOIL_TIME;
      if (st.progress >= 1) { st.progress = 1; st.done = true; game.stats.boiled += 1; }
    } else if (st.id === 'bake') {
      st.progress += dt / BAKE_TIME;
      if (st.progress >= 1) { st.progress = 1; st.done = true; game.stats.baked += 1; }
    }
    if (st.done && st.id !== 'chop' && st.id !== 'grill') { /* ding handled by render/audio via done flag */ }
  }
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    endDay(game, game.dayCoins >= DAY_TARGETS[game.day]);
  }
}

export function plateSummary(game) {
  return game.plate.map((c) => COMPONENTS[c]?.name || c);
}
