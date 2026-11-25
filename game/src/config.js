// HEARTHFIRE — Tavern Kitchen Rush. Shared constants and tuning.
export const W = 1280;
export const H = 720;

// One shift (day) lasts this long, in seconds.
export const DAY_LENGTH = 150;
export const MAX_ORDERS = 4;
export const MAX_STRIKES = 3;
export const PLATE_SLOTS = 4;

// Coins needed to pass each day (day index 0..2).
export const DAY_TARGETS = [90, 170, 260];
// Seconds a customer waits before storming out (scaled by day).
export const PATIENCE = [75, 65, 55];
// Seconds between new orders.
export const ORDER_INTERVAL = [14, 11, 9];

// Station cook times (seconds). Grill uses a sweeping needle instead.
export const CHOP_CLICKS = 3;
export const BOIL_TIME = 9;
export const BAKE_TIME = 11;
export const BURN_AFTER = 6; // seconds a finished boil/bake sits before it burns

export const TIP_MAX = 15; // bonus coins for serving at full patience
export const COMBO_STEP = 2; // +coins per combo level, capped
export const COMBO_CAP = 10;

export const COLORS = {
  wall: '#3a2a1a',
  wallDark: '#2c1f12',
  floor: '#241708',
  wood: '#6b4423',
  woodLight: '#8a5a2e',
  woodDark: '#4a2f16',
  stone: '#5d5648',
  stoneDark: '#453f33',
  gold: '#f2b134',
  cream: '#f7e8c9',
  red: '#c0392b',
  green: '#58b368',
  fire: '#e67e22',
  ember: '#ff7b24',
};
