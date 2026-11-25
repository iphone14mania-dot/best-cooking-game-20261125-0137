// HEARTHFIRE — deterministic screenshot scenes behind ?shot=title|kitchen|serve|win.
// Every scene is a real game state reached through the real rules (place, chop,
// grill, boil, bake, plate) — nothing is faked, the same seed gives the same frame.
import { newGame, startGame, placeOnStation, clickStation, spawnOrder, setMessage } from './state.js';
import { PHASE_OVER } from './state.js';

function cook(game, ingredient, station, extra) {
  game.held = ingredient;
  placeOnStation(game, station);
  if (extra) extra(game.stations.find((s) => s.id === station));
}

/** Stage `name` on a fresh seeded game and return it, ready to render. */
export function stageShot(name, seed) {
  const game = newGame(seed ?? 7);
  if (name === 'title') return game; // title screen, fresh game

  if (name === 'win') {
    startGame(game);
    game.day = 2;
    game.coins = 312; game.score = 4860; game.served = 14; game.bestCombo = 5;
    game.dayResults = [
      { day: 1, coins: 118, target: 90, passed: true, stars: 3 },
      { day: 2, coins: 205, target: 170, passed: true, stars: 2 },
      { day: 3, coins: 312, target: 260, passed: true, stars: 2 },
    ];
    game.phase = PHASE_OVER;
    game.won = true;
    return game;
  }

  startGame(game);
  game.timeLeft = 112;
  game.coins = 48; game.dayCoins = 48; game.score = 640;
  game.combo = 2; game.bestCombo = 2; game.served = 3;
  // Three tickets on the board: the plate below is 2/3 of the first one.
  game.orders = [];
  game.orderSeq = 0;
  const mk = (dish, custIdx, patience) => {
    spawnOrder(game);
    const o = game.orders[game.orders.length - 1];
    o.dish = dish;
    o.customer = [{ name: 'Sir Bram', kind: 'Knight', color: '#8fa3b8', hat: 'helm' }, { name: 'Mira', kind: 'Wizard', color: '#7b5ea7', hat: 'pointy' }, { name: 'Lira', kind: 'Elf', color: '#58b368', hat: 'hood' }][custIdx];
    o.patience = patience; o.patienceMax = 75;
  };
  mk('roast-chicken', 0, 52);
  mk('hearty-stew', 1, 34);
  mk('mushroom-melt', 2, 61);

  if (name === 'serve') {
    // Full plate, exact match for Sir Bram's Roast Chicken — bell lit green.
    cook(game, 'chicken', 'grill', (st) => { st.done = true; st.perfect = true; });
    clickStation(game, 'grill');
    cook(game, 'potato', 'chop', (st) => { st.clicks = 3; st.done = true; });
    clickStation(game, 'chop');
    cook(game, 'carrot', 'chop', (st) => { st.clicks = 3; st.done = true; });
    clickStation(game, 'chop');
    setMessage(game, 'Plate complete — ring the bell!');
    return game;
  }

  // 'kitchen' (cover): one dish mid-assembly, every station busy, timer running.
  cook(game, 'chicken', 'grill', (st) => { st.needle = 0.74; st.needleDir = 1; });
  cook(game, 'potato', 'chop', (st) => { st.clicks = 2; });
  cook(game, 'carrot', 'boil', (st) => { st.progress = 0.62; });
  cook(game, 'bread', 'bake', (st) => { st.done = true; st.progress = 1; });
  // Plate: 2 of 3 components of the Roast Chicken (mid-assembly).
  game.plate = ['grilled-chicken', 'chopped-potato'];
  game.held = 'mushroom';
  setMessage(game, 'Sir Bram wants Roast Chicken — one carrot to go!');
  return game;
}
