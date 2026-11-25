// HEARTHFIRE — all canvas drawing. Registers click targets in game.ui.
import { W, H, COLORS, MAX_STRIKES } from './config.js';
import { STATIONS, INGREDIENTS, COMPONENTS, DISH_BY_ID } from './recipes.js';
import { PHASE_TITLE, PHASE_PLAY, PHASE_DAY_END, PHASE_OVER, matchingOrder, dishesForDay } from './state.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = 'left', bold = true) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? '700' : '400'} ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function panel(ctx, x, y, w, h, fill, stroke) {
  rr(ctx, x, y, w, h, 12);
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

/** Simple original pictogram for an ingredient / component (by base ingredient id). */
export function drawIcon(ctx, baseId, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = 2;
  switch (baseId) {
    case 'chicken': // drumstick
      ctx.fillStyle = '#e8a87c';
      ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 0.62, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f7e8c9'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(r * 0.25, r * 0.35); ctx.lineTo(r * 0.7, r * 0.8); ctx.moveTo(r * 0.05, r * 0.45); ctx.lineTo(r * 0.45, r * 0.85); ctx.stroke();
      break;
    case 'potato':
      ctx.fillStyle = '#d9b380';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.75, r * 0.6, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8a6a3e';
      [[-0.3, -0.1], [0.25, 0.15], [0, -0.3]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.08, 0, Math.PI * 2); ctx.fill(); });
      break;
    case 'carrot':
      ctx.fillStyle = '#58b368';
      ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.6); ctx.lineTo(0, -r * 1.05); ctx.lineTo(r * 0.4, -r * 0.6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e67e22';
      ctx.beginPath(); ctx.moveTo(-r * 0.55, -r * 0.55); ctx.lineTo(r * 0.55, -r * 0.55); ctx.lineTo(0, r * 0.9); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#b34724'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.1); ctx.lineTo(r * 0.3, -r * 0.1); ctx.moveTo(-r * 0.2, r * 0.3); ctx.lineTo(r * 0.2, r * 0.3); ctx.stroke();
      break;
    case 'mushroom':
      ctx.fillStyle = '#c96f6f';
      ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.75, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f7e8c9';
      [[-0.35, -0.45], [0.3, -0.55], [0, -0.7]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.1, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#f7e8c9';
      rr(ctx, -r * 0.25, -r * 0.1, r * 0.5, r * 0.7, 4); ctx.fill();
      break;
    case 'bread':
      ctx.fillStyle = '#b97e3e';
      rr(ctx, -r * 0.8, -r * 0.35, r * 1.6, r * 0.75, r * 0.35); ctx.fill();
      ctx.strokeStyle = '#7a4d1c'; ctx.lineWidth = 2;
      [-0.4, 0, 0.4].forEach((dx) => { ctx.beginPath(); ctx.moveTo(dx * r - r * 0.15, -r * 0.3); ctx.lineTo(dx * r + r * 0.15, r * 0.25); ctx.stroke(); });
      break;
    case 'cheese':
      ctx.fillStyle = '#f2d13d';
      ctx.beginPath(); ctx.moveTo(-r * 0.8, r * 0.5); ctx.lineTo(r * 0.8, r * 0.5); ctx.lineTo(r * 0.8, -r * 0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d9a92c';
      [[-0.3, 0.15], [0.35, 0.2], [0.45, -0.2]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.12, 0, Math.PI * 2); ctx.fill(); });
      break;
    case 'herb':
      ctx.strokeStyle = '#58b368'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, r * 0.8); ctx.lineTo(0, -r * 0.7); ctx.stroke();
      ctx.fillStyle = '#3f9e57';
      [[-0.45, -0.3], [0.45, -0.1], [-0.4, -0.65], [0.4, -0.5]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.ellipse(dx * r, dy * r, r * 0.35, r * 0.16, dx > 0 ? 0.6 : -0.6, 0, Math.PI * 2); ctx.fill();
      });
      break;
    case 'ale':
      ctx.fillStyle = '#f2b134';
      rr(ctx, -r * 0.55, -r * 0.5, r * 1.1, r * 1.1, 4); ctx.fill();
      ctx.strokeStyle = '#f2b134'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(r * 0.7, 0, r * 0.35, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.fillStyle = '#fff8e6';
      ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.6, r * 0.28, 0, Math.PI * 2); ctx.arc(r * 0.25, -r * 0.55, r * 0.22, 0, Math.PI * 2); ctx.fill();
      break;
    default:
      ctx.fillStyle = '#ccc'; ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawCustomer(ctx, cust, x, y, r) {
  ctx.save();
  ctx.fillStyle = '#f0c8a0';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = cust.color;
  if (cust.hat === 'pointy') { ctx.beginPath(); ctx.moveTo(x - r, y - r * 0.5); ctx.lineTo(x, y - r * 2.1); ctx.lineTo(x + r, y - r * 0.5); ctx.closePath(); ctx.fill(); }
  else if (cust.hat === 'helm') { ctx.beginPath(); ctx.arc(x, y - r * 0.25, r * 1.02, Math.PI, 0); ctx.fill(); ctx.fillRect(x - r, y - r * 0.4, r * 2, r * 0.35); }
  else if (cust.hat === 'straw') { ctx.beginPath(); ctx.ellipse(x, y - r * 0.55, r * 1.25, r * 0.4, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (cust.hat === 'feather') { ctx.beginPath(); ctx.ellipse(x + r * 0.7, y - r * 1.1, r * 0.18, r * 0.6, 0.7, 0, Math.PI * 2); ctx.fill(); }
  else if (cust.hat === 'hood') { ctx.beginPath(); ctx.arc(x, y - r * 0.15, r * 1.15, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(x + r, y - r * 0.5); ctx.lineTo(x - r, y - r * 0.5); ctx.closePath(); ctx.fill(); }
  else { ctx.fillRect(x - r, y - r * 0.75, r * 2, r * 0.3); }
  ctx.fillStyle = '#241708';
  ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.05, r * 0.09, 0, Math.PI * 2); ctx.arc(x + r * 0.35, y - r * 0.05, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#241708'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y + r * 0.25, r * 0.4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.restore();
}

function fmtTime(s) {
  const m = Math.floor(Math.max(0, s) / 60);
  const sec = Math.floor(Math.max(0, s) % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function render(game) {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  game.ui = { bins: [], stations: [], bell: null, trash: null, buttons: [] };
  drawBackground(ctx);
  if (game.phase === PHASE_TITLE) { drawKitchen(ctx, game); drawTitle(ctx, game); return; }
  drawTopBar(ctx, game);
  drawOrderBoard(ctx, game);
  drawStations(ctx, game);
  drawPlateArea(ctx, game);
  drawRecipeBook(ctx, game);
  drawPantry(ctx, game);
  drawMessage(ctx, game);
  drawFloats(ctx, game);
  if (game.phase === PHASE_DAY_END) drawDayEnd(ctx, game);
  if (game.phase === PHASE_OVER) drawGameOver(ctx, game);
  if (game.paused && game.phase === PHASE_PLAY) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
    text(ctx, 'PAUSED — press P to resume', W / 2, H / 2, 34, COLORS.cream, 'center');
  }
}

function drawBackground(ctx) {
  ctx.fillStyle = COLORS.wall; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = COLORS.wallDark;
  for (let i = 0; i < 8; i++) ctx.fillRect(0, 90 + i * 80, W, 4);
  ctx.fillStyle = COLORS.floor; ctx.fillRect(0, 560, W, 160);
  // hearth glow top-right
  const g = ctx.createRadialGradient(1150, 60, 10, 1150, 60, 260);
  g.addColorStop(0, 'rgba(255,123,36,0.35)'); g.addColorStop(1, 'rgba(255,123,36,0)');
  ctx.fillStyle = g; ctx.fillRect(880, 0, 400, 320);
}

function drawTopBar(ctx, game) {
  panel(ctx, 0, 0, W, 64, '#1d130a', null);
  text(ctx, '🔥 HEARTHFIRE', 18, 42, 26, COLORS.gold);
  text(ctx, `DAY ${game.day + 1}/3`, 230, 42, 20, COLORS.cream);
  const tColor = game.timeLeft < 30 ? COLORS.red : COLORS.cream;
  text(ctx, `⏱ ${fmtTime(game.timeLeft)}`, 350, 42, 24, tColor);
  text(ctx, `🪙 ${game.coins} / ${[90, 170, 260][game.day]}`, 500, 42, 22, COLORS.gold);
  text(ctx, game.combo > 1 ? `COMBO x${game.combo} 🔥` : 'COMBO —', 700, 42, 20, game.combo > 1 ? COLORS.ember : '#9a8a70');
  text(ctx, `Served ${game.served}`, 880, 42, 18, COLORS.cream, 'left', false);
  // strikes
  for (let i = 0; i < MAX_STRIKES; i++) {
    ctx.fillStyle = i < game.strikes ? COLORS.red : '#4a3a26';
    ctx.beginPath(); ctx.arc(1010 + i * 30, 32, 11, 0, Math.PI * 2); ctx.fill();
    text(ctx, '✕', 1010 + i * 30, 37, 16, '#fff', 'center');
  }
  text(ctx, game.muted ? '🔇 M' : '🔊 M', 1130, 42, 18, COLORS.cream);
  text(ctx, 'P pause', 1210, 42, 16, '#9a8a70', 'left', false);
}

function drawOrderBoard(ctx, game) {
  panel(ctx, 16, 80, 296, 462, '#241708', COLORS.wood);
  text(ctx, '📋 ORDER BOARD', 30, 110, 20, COLORS.gold);
  if (game.orders.length === 0) text(ctx, 'No orders yet…', 30, 150, 16, '#9a8a70', 'left', false);
  game.orders.forEach((o, i) => {
    const y = 122 + i * 106;
    const dish = DISH_BY_ID[o.dish];
    const urgent = o.patience / o.patienceMax < 0.35;
    panel(ctx, 28, y, 272, 96, urgent ? '#4a1f16' : '#3a2a1a', urgent ? COLORS.red : '#5d4630');
    drawCustomer(ctx, o.customer, 62, y + 34, 22);
    text(ctx, o.customer.name, 92, y + 26, 15, COLORS.cream);
    text(ctx, dish.name, 92, y + 48, 18, dish.color === '#2e6f8e' ? '#7fb8d9' : COLORS.gold);
    // component checklist
    dish.needs.forEach((need, j) => {
      const done = game.plate.includes(need);
      const cx = 96 + j * 52;
      ctx.globalAlpha = done ? 1 : 0.55;
      drawIcon(ctx, COMPONENTS[need].from, cx, y + 74, 13);
      ctx.globalAlpha = 1;
      if (done) { ctx.strokeStyle = COLORS.green; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, y + 74, 16, 0, Math.PI * 2); ctx.stroke(); }
    });
    text(ctx, `${dish.price}🪙`, 258, y + 48, 16, COLORS.gold);
    // patience bar
    const pw = 248;
    ctx.fillStyle = '#1d130a'; ctx.fillRect(32, y + 88, pw, 6);
    ctx.fillStyle = urgent ? COLORS.red : COLORS.green;
    ctx.fillRect(32, y + 88, pw * Math.max(0, o.patience / o.patienceMax), 6);
  });
  text(ctx, 'Serve the exact plate —', 30, 528, 13, '#9a8a70', 'left', false);
  text(ctx, 'extra items mean no sale!', 30, 546, 13, '#9a8a70', 'left', false);
}

function drawStations(ctx, game) {
  text(ctx, '🍳 THE KITCHEN — click a pantry item, then a station', 336, 104, 17, COLORS.cream);
  STATIONS.forEach((def, i) => {
    const x = 336 + (i % 2) * 268;
    const y = 118 + Math.floor(i / 2) * 158;
    const st = game.stations[i];
    const heldOk = game.held && INGREDIENTS.find((g) => g.id === game.held)?.cooked[def.id];
    panel(ctx, x, y, 256, 146, heldOk ? '#4a3416' : '#332416', heldOk ? COLORS.gold : COLORS.wood);
    text(ctx, `${def.verb} · ${def.name}`, x + 12, y + 26, 16, COLORS.cream);
    text(ctx, def.blurb, x + 12, y + 44, 12, '#9a8a70', 'left', false);
    game.ui.stations.push({ id: def.id, x, y, w: 256, h: 146 });
    if (!st.item) {
      text(ctx, '— empty —', x + 128, y + 100, 16, '#6b5a40', 'center', false);
      return;
    }
    const ing = INGREDIENTS.find((g) => g.id === st.item);
    drawIcon(ctx, st.item, x + 44, y + 92, 26);
    text(ctx, ing.name, x + 82, y + 84, 15, COLORS.cream);
    if (st.burnt) { text(ctx, '🔥 BURNT! Click to clear', x + 82, y + 106, 13, COLORS.red); return; }
    if (def.id === 'chop') {
      text(ctx, `Chops: ${st.clicks}/3 — click!`, x + 82, y + 106, 13, COLORS.gold);
      ctx.fillStyle = '#1d130a'; ctx.fillRect(x + 82, y + 114, 140, 8);
      ctx.fillStyle = COLORS.gold; ctx.fillRect(x + 82, y + 114, 140 * (st.clicks / 3), 8);
    } else if (def.id === 'grill') {
      if (st.done) { text(ctx, st.perfect ? '★ PERFECT SEAR! Click to plate' : 'Done! Click to plate it', x + 82, y + 106, 13, COLORS.green); }
      else {
        // needle gauge
        ctx.fillStyle = '#1d130a'; ctx.fillRect(x + 82, y + 96, 150, 12);
        ctx.fillStyle = COLORS.green; ctx.fillRect(x + 82 + 150 * 0.60, y + 96, 150 * 0.28, 12);
        ctx.fillStyle = '#f2d13d'; ctx.fillRect(x + 82 + 150 * 0.70, y + 96, 150 * 0.10, 12);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 82 + 150 * st.needle - 2, y + 92, 4, 20);
        text(ctx, 'CLICK to stop the needle!', x + 82, y + 130, 12, COLORS.ember);
      }
    } else {
      const total = def.id === 'boil' ? 11 : 11;
      void total;
      if (st.done) text(ctx, '✅ DONE! Click to plate it', x + 82, y + 106, 13, COLORS.green);
      else {
        text(ctx, `${Math.ceil((1 - st.progress) * (def.id === 'boil' ? 9 : 11))}s left…`, x + 82, y + 106, 13, COLORS.cream);
        ctx.fillStyle = '#1d130a'; ctx.fillRect(x + 82, y + 114, 140, 8);
        ctx.fillStyle = def.id === 'boil' ? '#5aa3c9' : COLORS.fire;
        ctx.fillRect(x + 82, y + 114, 140 * st.progress, 8);
      }
    }
    if (st.done && !st.burnt) {
      ctx.fillStyle = 'rgba(88,179,104,0.25)';
      rr(ctx, x + 4, y + 4, 248, 138, 10); ctx.fill();
    }
  });
}

function drawPlateArea(ctx, game) {
  const x = 900, y = 80, w = 364, h = 210;
  const match = matchingOrder(game);
  panel(ctx, x, y, w, h, '#241708', match ? COLORS.green : COLORS.wood);
  text(ctx, '🍽 YOUR PLATE', x + 14, y + 28, 18, COLORS.gold);
  if (match) text(ctx, `★ MATCHES: ${DISH_BY_ID[match.dish].name} — RING THE BELL!`, x + 14, y + 50, 14, COLORS.green);
  else text(ctx, game.plate.length ? 'Build the exact order…' : 'Plate is empty', x + 14, y + 50, 14, '#9a8a70', 'left', false);
  // plate slots
  for (let i = 0; i < 4; i++) {
    const cx = x + 56 + i * 62, cy = y + 96;
    ctx.fillStyle = '#f7e8c9';
    ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b9a06a'; ctx.lineWidth = 2; ctx.stroke();
    if (game.plate[i]) drawIcon(ctx, COMPONENTS[game.plate[i]].from, cx, cy, 17);
  }
  // bell
  const bx = x + 30, by = y + 140, bw = 180, bh = 48;
  rr(ctx, bx, by, bw, bh, match ? COLORS.green : '#5d4630', match ? '#d7ffd7' : null);
  if (match) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; rr(ctx, bx, by, bw, bh, 10); ctx.stroke(); }
  text(ctx, '🔔 SERVE  [Space]', bx + bw / 2, by + 32, 18, '#fff', 'center');
  game.ui.bell = { x: bx, y: by, w: bw, h: bh };
  // trash
  const tx = x + 226, ty = y + 140, tw = 108, th = 48;
  rr(ctx, tx, ty, tw, th, '#4a1f16'); ctx.fill();
  text(ctx, '🗑 Trash [X]', tx + tw / 2, ty + 32, 15, '#e8a0a0', 'center');
  game.ui.trash = { x: tx, y: ty, w: tw, h: th };
  // held ingredient
  if (game.held) {
    const ing = INGREDIENTS.find((g) => g.id === game.held);
    text(ctx, `In hand: ${ing.name} → click a station`, x + 14, y + 202, 13, COLORS.gold, 'left', false);
  }
}

function drawRecipeBook(ctx, game) {
  const x = 900, y = 306, w = 364, h = 248;
  panel(ctx, x, y, w, h, '#241708', COLORS.wood);
  text(ctx, '📖 RECIPE BOOK', x + 14, y + 28, 18, COLORS.gold);
  const short = (n) => n.replace('Chopped ', '').replace('Grilled ', '').replace('Boiled ', '').replace('Baked ', '').replace('Grated ', '').replace('Mug of Ale', 'Ale');
  dishesForDay(game.day).forEach((d, i) => {
    const dy = y + 50 + i * 30;
    text(ctx, d.name, x + 14, dy, 15, COLORS.cream);
    text(ctx, `${d.price}🪙`, x + w - 16, dy, 15, COLORS.gold, 'right');
    text(ctx, d.needs.map((n) => short(COMPONENTS[n].name)).join(' + '), x + 14, dy + 14, 11, '#cbb98f', 'left', false);
  });
  text(ctx, 'Fast serves pay tips; chains build combos.', x + 14, y + h - 10, 12, '#9a8a70', 'left', false);
}

function drawPantry(ctx, game) {
  panel(ctx, 16, 560, 1248, 146, '#1d130a', COLORS.wood);
  text(ctx, '🥕 PANTRY — click an ingredient (keys 1–8), then click a station that takes it', 30, 588, 16, COLORS.cream);
  INGREDIENTS.forEach((ing, i) => {
    const x = 30 + i * 152, y = 600, w = 140, h = 92;
    const held = game.held === ing.id;
    const usable = ing.id === 'ale' || Object.keys(ing.cooked).length > 0;
    panel(ctx, x, y, w, h, held ? '#4a3416' : '#332416', held ? COLORS.gold : '#5d4630');
    drawIcon(ctx, ing.id, x + 30, y + 46, 24);
    text(ctx, ing.name, x + 62, y + 40, 16, COLORS.cream);
    const stText = ing.id === 'ale' ? '→ plate' : Object.keys(ing.cooked).map((s) => s.toUpperCase()).join(' / ');
    let fs = 12;
    ctx.font = `400 ${fs}px Trebuchet MS, Verdana, sans-serif`;
    while (fs > 9 && ctx.measureText(stText).width > 74) { fs -= 1; ctx.font = `400 ${fs}px Trebuchet MS, Verdana, sans-serif`; }
    ctx.fillStyle = '#9a8a70'; ctx.textAlign = 'left'; ctx.fillText(stText, x + 62, y + 62);
    text(ctx, String(i + 1), x + w - 12, y + 20, 13, '#6b5a40', 'right');
    game.ui.bins.push({ id: ing.id, x, y, w, h });
    void usable;
  });
}

function drawMessage(ctx, game) {
  if (game.messageTtl > 0 && game.message) {
    ctx.globalAlpha = Math.min(1, game.messageTtl);
    text(ctx, game.message, W / 2, 552, 18, COLORS.gold, 'center');
    ctx.globalAlpha = 1;
  }
}

function drawFloats(ctx, game) {
  for (const f of game.floats) {
    ctx.globalAlpha = Math.min(1, f.ttl);
    text(ctx, f.text, f.x, f.y - (1.4 - f.ttl) * 40, 22, f.color, 'center');
    ctx.globalAlpha = 1;
  }
}

function drawKitchen(ctx, game) {
  drawTopBar(ctx, game);
  drawOrderBoard(ctx, game);
  drawStations(ctx, game);
  drawPlateArea(ctx, game);
  drawRecipeBook(ctx, game);
  drawPantry(ctx, game);
}

function overlay(ctx) {
  ctx.fillStyle = 'rgba(12,7,3,0.82)'; ctx.fillRect(0, 0, W, H);
}

function drawTitle(ctx, game) {
  overlay(ctx);
  text(ctx, '🔥', W / 2, 150, 90, COLORS.ember, 'center');
  text(ctx, 'HEARTHFIRE', W / 2, 220, 72, COLORS.gold, 'center');
  text(ctx, 'TAVERN KITCHEN RUSH', W / 2, 262, 30, COLORS.cream, 'center');
  text(ctx, 'You are the new cook at the Ember & Oak tavern. Adventurers are hungry,', W / 2, 320, 18, COLORS.cream, 'center', false);
  text(ctx, 'the hearth is hot, and the orders will not wait.', W / 2, 346, 18, COLORS.cream, 'center', false);
  const lines = [
    '1  Pick an ingredient from the pantry (click or keys 1–8)',
    '2  Cook it: CHOP ×3 clicks · GRILL stop the needle in green · BOIL / BAKE watch the timer',
    '3  Click a finished station to put it on your plate — match the ticket exactly',
    '4  Ring the SERVE bell. Fast serves pay tips; chains build combos. 3 walk-outs = fired!',
  ];
  lines.forEach((l, i) => text(ctx, l, W / 2, 396 + i * 30, 17, '#e8d9b0', 'center', false));
  text(ctx, '3 days · 6 dishes · hit the coin target each day to keep the tavern', W / 2, 540, 16, COLORS.gold, 'center', false);
  const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 300);
  ctx.globalAlpha = pulse;
  text(ctx, '▶  CLICK OR PRESS ENTER TO START  ◀', W / 2, 600, 26, '#fff', 'center');
  ctx.globalAlpha = 1;
  game.ui.buttons = [{ id: 'start', x: W / 2 - 260, y: 560, w: 520, h: 60 }];
}

function drawDayEnd(ctx, game) {
  overlay(ctx);
  const r = game.dayResults[game.dayResults.length - 1];
  if (!r) return;
  text(ctx, r.passed ? `DAY ${r.day} COMPLETE!` : `DAY ${r.day} — NOT ENOUGH COINS`, W / 2, 220, 44, r.passed ? COLORS.green : COLORS.red, 'center');
  text(ctx, '★'.repeat(r.stars) + '☆'.repeat(3 - r.stars), W / 2, 290, 48, COLORS.gold, 'center');
  text(ctx, `Earned ${r.coins} coins — target was ${r.target}`, W / 2, 350, 22, COLORS.cream, 'center');
  text(ctx, `Served ${game.served} dishes · Best combo x${game.bestCombo}`, W / 2, 390, 18, COLORS.cream, 'center', false);
  if (game.day < 2 && r.passed) {
    text(ctx, '▶  CLICK OR PRESS ENTER FOR THE NEXT DAY  ◀', W / 2, 480, 24, '#fff', 'center');
    game.ui.buttons = [{ id: 'nextday', x: W / 2 - 280, y: 440, w: 560, h: 60 }];
  }
}

function drawGameOver(ctx, game) {
  overlay(ctx);
  if (game.won) {
    text(ctx, '🏆 THE TAVERN THRIVES!', W / 2, 200, 48, COLORS.gold, 'center');
    text(ctx, 'Three days, every target hit. The Ember & Oak sings your name,', W / 2, 260, 20, COLORS.cream, 'center', false);
    text(ctx, 'and the bards will tell of your cooking for years.', W / 2, 288, 20, COLORS.cream, 'center', false);
  } else {
    text(ctx, '💀 FIRED FROM THE KITCHEN', W / 2, 200, 44, COLORS.red, 'center');
    text(ctx, game.strikes >= MAX_STRIKES ? 'Too many hungry customers stormed out.' : 'The day ended short of the coin target.', W / 2, 260, 20, COLORS.cream, 'center', false);
  }
  text(ctx, `Final coins: ${game.coins} · Score: ${game.score} · Served: ${game.served} · Best combo x${game.bestCombo}`, W / 2, 340, 20, COLORS.cream, 'center');
  game.dayResults.forEach((r, i) => {
    text(ctx, `Day ${r.day}: ${r.coins}/${r.target} coins ${'★'.repeat(r.stars)}${r.passed ? '' : ' — failed'}`, W / 2, 390 + i * 30, 17, COLORS.cream, 'center', false);
  });
  text(ctx, '▶  CLICK OR PRESS R TO COOK AGAIN  ◀', W / 2, 520, 24, '#fff', 'center');
  game.ui.buttons = [{ id: 'restart', x: W / 2 - 260, y: 480, w: 520, h: 60 }];
}
