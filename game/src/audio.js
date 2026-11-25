// HEARTHFIRE — tiny WebAudio synth: no audio assets, everything generated.
let ctx = null;
let muted = false;

function ac() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  } catch { ctx = null; }
  return ctx;
}

function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  const c = ac();
  if (!c || muted) return;
  const t0 = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0); o.stop(t0 + dur + 0.05);
}

function noise(dur, vol, filterFreq) {
  const c = ac();
  if (!c || muted) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass'; f.frequency.value = filterFreq || 1800; f.Q.value = 0.8;
  const g = c.createGain(); g.gain.value = vol || 0.08;
  src.connect(f).connect(g).connect(c.destination);
  src.start();
}

export const sfx = {
  unlock() { ac(); if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); },
  setMuted(m) { muted = m; },
  isMuted() { return muted; },
  chop() { noise(0.08, 0.25, 900); tone(180, 0.07, 'triangle', 0.15, 0, 90); },
  place() { tone(320, 0.08, 'triangle', 0.10, 0, 240); },
  ding() { tone(880, 0.35, 'sine', 0.14); tone(1320, 0.4, 'sine', 0.08, 0.02); },
  sizzle() { noise(0.5, 0.06, 3200); },
  coin() { tone(988, 0.09, 'square', 0.07); tone(1319, 0.18, 'square', 0.07, 0.08); },
  perfect() { tone(523, 0.12, 'sine', 0.12); tone(659, 0.12, 'sine', 0.12, 0.09); tone(784, 0.22, 'sine', 0.12, 0.18); },
  error() { tone(160, 0.22, 'sawtooth', 0.10, 0, 110); },
  walkout() { tone(392, 0.2, 'sawtooth', 0.08, 0, 196); tone(311, 0.3, 'sawtooth', 0.08, 0.15, 155); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.12, i * 0.12)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'triangle', 0.10, i * 0.16)); },
  click() { tone(600, 0.05, 'triangle', 0.06); },
};
