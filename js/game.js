'use strict';
/* =========================================================
   ISLETA · Motor del juego
   ========================================================= */
const Store = {
  KEY: 'isleta.v1', SKEY: 'isleta.settings',
  db() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(this.KEY)); } catch (e) { }
    if (!d || typeof d !== 'object' || !d.slots || typeof d.slots !== 'object') return { slots: {}, last: null };
    // descarta ranuras dañadas para que el menú no se rompa
    for (const k of Object.keys(d.slots)) { const s = d.slots[k]; if (!s || typeof s !== 'object' || !s.id || !Array.isArray(s.items) || !Array.isArray(s.terrain)) delete d.slots[k]; }
    return d;
  },
  write(db) { try { localStorage.setItem(this.KEY, JSON.stringify(db)); return true; } catch (e) { console.warn('save failed', e); return false; } },
  save(st) { const db = this.db(); st.lastPlayed = Date.now(); db.slots[st.id] = st; db.last = st.id; return this.write(db); },
  list() { const db = this.db(); return Object.values(db.slots).sort((a, b) => b.lastPlayed - a.lastPlayed); },
  get(id) { return this.db().slots[id] || null; },
  last() { const db = this.db(); return db.last && db.slots[db.last] ? db.slots[db.last] : (this.list()[0] || null); },
  remove(id) { const db = this.db(); delete db.slots[id]; if (db.last === id) db.last = null; this.write(db); try { localStorage.removeItem('isleta.thumb.' + id); } catch (e) { } },
  thumb(id, data) { try { if (data) localStorage.setItem('isleta.thumb.' + id, data); else return localStorage.getItem('isleta.thumb.' + id); } catch (e) { return null; } },
  settings() {
    const def = { music: 0.5, sfx: 0.8, daynight: 'auto', particles: 'high', grid: false, musicOn: true };
    try { return Object.assign(def, JSON.parse(localStorage.getItem(this.SKEY)) || {}); } catch (e) { return def; }
  },
  saveSettings(s) { try { localStorage.setItem(this.SKEY, JSON.stringify(s)); } catch (e) { } },
};

function newState({ player, island, avatar, palette }) {
  const seed = (Math.random() * 1e9) | 0;
  const st = {
    v: 1, id: 'i' + Date.now().toString(36) + ((Math.random() * 1e4) | 0).toString(36),
    player, island, avatar, palette, seed, created: Date.now(), lastPlayed: Date.now(), playtime: 0,
    coins: 300, xp: 0, level: 1, expands: 0, radius: BASE_RADIUS,
    terrain: new Array(WORLD * WORLD).fill(0), items: [], uid: 1,
    stats: { placed: {}, cats: {}, tags: {}, painted: {}, paintedTotal: 0, collects: 0, earned: 0, gifts: 0, removed: 0, nightCollects: 0, maxCombo: 0, photos: 0, quests: 0 },
    quests: [], qi: 0, gen: 0, ach: {}, lastDay: null, streak: 0, tutorial: false, phase: 0.12,
  };
  // generar paisaje inicial
  const land = computeLandArr(st);
  for (let i = 0; i < WORLD * WORLD; i++) if (land[i] && isCoast(land, i % WORLD, (i / WORLD) | 0)) st.terrain[i] = T.beach;
  const C = WORLD / 2;
  const nat = ['oak', 'pine', 'oak', 'bush', 'tulips', 'rock', 'pine', 'bush', 'tulips', 'oak', 'rock', 'palm'];
  let tries = 0, placed = 0;
  while (placed < 14 && tries++ < 400) {
    const x = (C - 8 + Math.random() * 16) | 0, y = (C - 8 + Math.random() * 16) | 0, i = y * WORLD + x;
    if (!land[i] || Math.abs(x - C) < 3 && Math.abs(y - C) < 3) continue;
    if (st.items.some(it => it.x === x && it.y === y)) continue;
    const beach = st.terrain[i] === T.beach;
    const id = beach ? (Math.random() < 0.5 ? 'palm' : 'rock') : nat[placed % nat.length];
    st.items.push({ uid: st.uid++, id, x, y, f: Math.random() < 0.5 ? 1 : 0, t: Date.now() });
    placed++;
  }
  return st;
}
function islandRadiusAt(st, x, y) {
  const C = WORLD / 2, dx = x + 0.5 - C, dy = y + 0.5 - C;
  const a = Math.atan2(dy, dx), s = st.seed % 1000;
  const n = Math.sin(a * 3 + s) * 0.55 + Math.sin(a * 5 + s * 1.7) * 0.35 + Math.sin(a * 2 + s * 0.3) * 0.45;
  return { d: Math.sqrt(dx * dx + dy * dy), r: st.radius + n * (0.6 + st.radius * 0.05) };
}
function computeLandArr(st) {
  const land = new Uint8Array(WORLD * WORLD);
  for (let y = 0; y < WORLD; y++) for (let x = 0; x < WORLD; x++) {
    const { d, r } = islandRadiusAt(st, x, y);
    if (d < Math.min(r, WORLD / 2 - 2)) land[y * WORLD + x] = 1;
  }
  return land;
}
function isCoast(land, x, y) {
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= WORLD || ny >= WORLD || !land[ny * WORLD + nx]) return true;
  }
  return false;
}
function demoState() {
  const st = newState({ player: 'Demo', island: 'Demo', avatar: '🐢', palette: 'primavera' });
  st.seed = 4242; st.radius = 9.5; st.items = []; st.terrain.fill(0);
  const land = computeLandArr(st);
  for (let i = 0; i < WORLD * WORLD; i++) if (land[i] && isCoast(land, i % WORLD, (i / WORLD) | 0)) st.terrain[i] = T.beach;
  const C = WORLD / 2;
  const put = (id, x, y, f = 0) => st.items.push({ uid: st.uid++, id, x: C + x, y: C + y, f, t: Date.now() - 1e6 });
  for (let k = -6; k <= 6; k++) { st.terrain[(C) * WORLD + C + k] = T.path; st.terrain[(C + k) * WORLD + C] = T.path; }
  for (let a = -1; a <= 2; a++) for (let b = -1; b <= 2; b++) st.terrain[(C + b) * WORLD + C + a] = T.stone;
  for (let a = 3; a <= 5; a++) for (let b = 3; b <= 4; b++) st.terrain[(C + b) * WORLD + C + a] = T.water;
  put('fountain', 0, 0);
  put('cottage', -2, -2); put('cabin', 2, -2, 1); put('bakery', -2, 2); put('cafe', -3, -2); put('farmhouse', 2, -4);
  put('windmill', -5, 2); put('lemonade', 3, 1); put('lighthouse', 6, -5); put('lamp', 1, -1 + 3); put('lamp', -1, 1 - 3);
  put('sakura', -4, -4); put('oak', -6, -1); put('pine', 4, -6); put('pine', -1, -6); put('oak', 5, -2); put('sakura', 1, 5);
  put('tulips', -1, 3); put('tulips', 2, 3); put('bench', 2, 2); put('lily', 3, 3); put('lily', 5, 4); put('pond_duck', 4, 3);
  put('palm', 7, 1); put('palm', -7, -3); put('rock', 2, 7); put('bush', 0, -4); put('hedge', -2, -4); put('campfire', 4, 6);
  put('gazebo', -4, 5); put('autumn', -7, 3); put('sunflower', 1, -3); put('willow', 5, 6); put('mushroom', -6, 5);
  return st;
}

/* =========================================================
   Juego
   ========================================================= */
const Game = {
  st: null, demo: false, running: false,
  cam: { x: 0, y: 0, z: 1, tz: 1 },
  tool: 'hand', sel: null, flip: false, brush: 1, carry: null,
  hover: { x: -1, y: -1, sx: 0, sy: 0, inside: false },
  particles: [], sparts: [], floaters: [], dying: [], villagers: [], bubbles: [],
  gift: null, giftTimer: 50, undoStack: [], combo: { n: 0, last: 0 },
  shake: 0, beauty: 0, pop: 0, tileAnim: new Map(), lastSave: 0, saveTimer: 0, ambT: 0, checkT: 0,
  settings: null, photoMode: false, landBorn: null,

  init() {
    this.cv = document.getElementById('world');
    this.c = this.cv.getContext('2d');
    this.settings = Store.settings();
    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.bindInput();
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (this.st) { this.update(dt); this.render(); }
      UI.tick(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },
  resize() {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = window.innerWidth; this.H = window.innerHeight;
    this.cv.width = this.W * this.dpr; this.cv.height = this.H * this.dpr;
    this.cv.style.width = this.W + 'px'; this.cv.style.height = this.H + 'px';
  },

  /* ---------- ciclo de vida ---------- */
  start(st, demo = false) {
    this.st = st; this.demo = demo;
    this.particles = []; this.floaters = []; this.dying = []; this.villagers = []; this.sparts = [];
    this.undoStack = []; this.gift = null; this.giftTimer = 40 + Math.random() * 40; this.carry = null;
    this.tool = 'hand'; this.sel = null; this.tileAnim.clear();
    this.landBorn = new Float32Array(WORLD * WORLD);
    this.computeLand();
    this.rebuild();
    const C = WORLD / 2, [wx, wy] = this.iso(C, C);
    const z = demo ? (this.W < 700 ? 0.75 : 1.15) : (this.W < 700 ? 0.8 : 1.15);
    this.cam.z = this.cam.tz = z;
    this.cam.x = this.W / 2 - wx * z; this.cam.y = this.H / 2 - wy * z - (demo ? 0 : 30);
    if (demo) this.st.phase = 0.47;
    if (!demo) {
      // migración ligera
      st.stats = Object.assign({ placed: {}, cats: {}, tags: {}, painted: {}, paintedTotal: 0, collects: 0, earned: 0, gifts: 0, removed: 0, nightCollects: 0, maxCombo: 0, photos: 0, quests: 0 }, st.stats);
      this.refillQuests();
      this.lastSave = performance.now();
    }
    for (let i = 0; i < Math.min(this.pop, 40); i++) this.spawnVillager(true);
    this.running = true;
  },
  stop() { if (this.st && !this.demo) this.save(true); this.running = false; },
  save(withThumb) {
    if (!this.st || this.demo) return;
    if (!Store.save(this.st)) {
      // almacenamiento lleno o bloqueado (p. ej. cookies de terceros desactivadas en el iframe)
      if (!this._saveWarned) { this._saveWarned = true; UI.toast('⚠️ No se puede guardar: el navegador bloquea el almacenamiento local', 'error', 6000); }
      return;
    }
    this._saveWarned = false;
    if (withThumb) { try { Store.thumb(this.st.id, this.makeThumb()); } catch (e) { } }
    UI.saved();
  },
  makeThumb() {
    const cv = document.createElement('canvas'); cv.width = 320; cv.height = 200;
    const c = cv.getContext('2d');
    const sw = this.cv.width, sh = this.cv.height, ratio = 320 / 200;
    let w = sw, h = sw / ratio; if (h > sh) { h = sh; w = sh * ratio; }
    c.drawImage(this.cv, (sw - w) / 2, (sh - h) / 2, w, h, 0, 0, 320, 200);
    return cv.toDataURL('image/jpeg', 0.72);
  },

  /* ---------- mundo ---------- */
  computeLand(animateNew) {
    const old = this.land;
    this.land = computeLandArr(this.st);
    const now = performance.now();
    if (animateNew && old) {
      const C = WORLD / 2;
      for (let i = 0; i < this.land.length; i++) if (this.land[i] && !old[i]) {
        const x = i % WORLD, y = (i / WORLD) | 0, d = Math.hypot(x - C, y - C);
        this.landBorn[i] = now + (d - this.st.radius + RADIUS_STEP) * 120 + Math.random() * 80;
      }
    }
    // distancia a costa en el mar (para aguas someras)
    const N = WORLD, dist = new Uint8Array(N * N).fill(9);
    let q = [];
    for (let i = 0; i < N * N; i++) if (this.land[i]) { dist[i] = 0; q.push(i); }
    for (let d = 1; d <= 3; d++) {
      const nq = [];
      for (const i of q) { const x = i % N, y = (i / N) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (dist[j] > d) { dist[j] = d; nq.push(j); } } }
      q = nq;
    }
    this.coast = dist;
  },
  isLand(x, y) { return x >= 0 && y >= 0 && x < WORLD && y < WORLD && this.land[y * WORLD + x] === 1; },
  terr(x, y) { return this.st.terrain[y * WORLD + x]; },
  rebuild() {
    const st = this.st;
    this.occ = new Int32Array(WORLD * WORLD);
    this.byUid = new Map();
    for (const it of st.items) {
      const d = ITEM[it.id]; if (!d) continue;
      it.seed = it.seed || (it.uid * 7919) % 100000;
      this.byUid.set(it.uid, it);
      for (let a = 0; a < d.w; a++) for (let b = 0; b < d.h; b++) this.occ[(it.y + b) * WORLD + it.x + a] = it.uid;
    }
    st.items = st.items.filter(it => ITEM[it.id]);
    this.recompute();
  },
  recompute() {
    let beauty = 0, pop = 0;
    const st = this.st;
    for (const it of st.items) { const d = ITEM[it.id]; beauty += d.beauty || 0; pop += d.pop || 0; }
    let tb = 0; for (let i = 0; i < st.terrain.length; i++) if (this.land[i]) tb += TERRAINS[TERRAIN_IDS[st.terrain[i]]].beauty || 0;
    this.beauty = Math.floor(beauty + tb); this.pop = pop;
    // bonificación por encanto cercano
    const deco = st.items.filter(it => !isBuilding(ITEM[it.id]) && ITEM[it.id].beauty);
    for (const it of st.items) {
      const d = ITEM[it.id]; if (!isBuilding(d)) continue;
      let sum = 0;
      for (const o of deco) {
        const od = ITEM[o.id];
        const dx = Math.max(it.x - (o.x + od.w - 1), o.x - (it.x + d.w - 1), 0), dy = Math.max(it.y - (o.y + od.h - 1), o.y - (it.y + d.h - 1), 0);
        if (Math.max(dx, dy) <= 3) sum += od.beauty;
      }
      it.bonus = Math.min(1, sum * 0.025);
    }
  },
  iso(x, y) { return [(x - y) * TW / 2, (x + y) * TH / 2]; },
  toWorld(sx, sy) { return [(sx - this.cam.x) / this.cam.z, (sy - this.cam.y) / this.cam.z]; },
  toScreen(wx, wy) { return [wx * this.cam.z + this.cam.x, wy * this.cam.z + this.cam.y]; },
  tileAt(sx, sy) {
    const [wx, wy] = this.toWorld(sx, sy);
    return [Math.floor((wx / 32 + wy / 16) / 2), Math.floor((wy / 16 - wx / 32) / 2)];
  },
  itemBase(it) { const d = ITEM[it.id]; return this.iso(it.x + d.w / 2, it.y + d.h / 2); },

  canPlace(d, x, y, ignoreUid) {
    for (let a = 0; a < d.w; a++) for (let b = 0; b < d.h; b++) {
      const tx = x + a, ty = y + b;
      if (!this.isLand(tx, ty)) return false;
      const o = this.occ[ty * WORLD + tx]; if (o && o !== ignoreUid) return false;
      const water = this.terr(tx, ty) === T.water;
      if (!!d.onWater !== water) return false;
    }
    return true;
  },
  walkable(x, y) {
    if (!this.isLand(x, y)) return false;
    const i = y * WORLD + x;
    return !this.occ[i] && this.st.terrain[i] !== T.water;
  },

  /* ---------- economía ---------- */
  spend(n) {
    if (this.st.coins < n) { Sound.sfx.error(); UI.toast('No tienes suficientes monedas', 'error'); UI.shakeCoins(); return false; }
    this.st.coins -= n; return true;
  },
  addCoins(n, wx, wy, opts = {}) {
    n = Math.round(n); if (n <= 0) return;
    this.st.coins += n; this.st.stats.earned += n;
    if (wx != null) { const [sx, sy] = this.toScreen(wx, wy); UI.flyCoins(sx, sy, n, opts.count); }
    else UI.flyCoins(this.W / 2, this.H / 2, n, opts.count);
  },
  addCoinsScreen(n, sx, sy, count) {
    n = Math.round(n); if (n <= 0) return;
    this.st.coins += n; this.st.stats.earned += n;
    UI.flyCoins(sx, sy, n, count);
    this.checkProgress(); UI.refreshDock();
  },
  addXP(n, wx, wy) {
    const st = this.st; if (n <= 0) return;
    st.xp += n;
    if (wx != null && n >= 1) this.floater(wx, wy - 18, '+' + Math.round(n) + ' XP', '#b197fc', 0.85);
    const ups = [];
    while (st.level < MAX_LEVEL && st.xp >= xpNeeded(st.level)) { st.xp -= xpNeeded(st.level); st.level++; ups.push(st.level); }
    if (ups.length) {
      const lv = st.level;
      const unlocks = [];
      for (const l of ups) {
        ITEMS.filter(i => i.lvl === l).forEach(i => unlocks.push({ kind: 'item', id: i.id, name: i.name }));
        TERRAIN_IDS.filter(t => TERRAINS[t].lvl === l).forEach(t => unlocks.push({ kind: 'terrain', id: t, name: TERRAINS[t].name }));
      }
      const reward = 50 * lv;
      setTimeout(() => { Sound.sfx.levelup(); this.confetti(160); this.shake = 6; UI.levelUp(lv, unlocks, reward); }, 250);
    }
    UI.refreshDock();
  },
  cyclesOf(it) {
    const d = ITEM[it.id]; if (!isBuilding(d)) return 0;
    return Math.min(MAX_STACK, Math.floor((Date.now() - it.t) / (d.period * 1000)));
  },
  incomeOf(it) { const d = ITEM[it.id]; return Math.round(d.income * (1 + (it.bonus || 0))); },
  collect(it, idx = 0) {
    const cyc = this.cyclesOf(it); if (!cyc) return false;
    const d = ITEM[it.id];
    const amt = this.incomeOf(it) * cyc;
    it.t = cyc >= MAX_STACK ? Date.now() : it.t + cyc * d.period * 1000;
    it.pulse = performance.now();
    const [bx, by] = this.itemBase(it);
    this.addCoins(amt, bx, by - d.hgt - 10, { count: Math.min(8, 2 + cyc) });
    this.floater(bx, by - d.hgt - 12, '+' + fmt(amt), '#ffd23f', 1.1);
    this.burst(bx, by - d.hgt * 0.6, 10, ['#ffd23f', '#fff3b0', '#ffb703'], 'star');
    this.st.stats.collects++;
    if (ENV.night > 0.5) this.st.stats.nightCollects++;
    this.addXP(Math.max(1, Math.ceil(amt / 12)), bx, by - d.hgt);
    this.registerAction('collect');
    this.afterChange(false);
    return true;
  },
  collectAll() {
    const ready = this.st.items.filter(it => this.cyclesOf(it) > 0);
    ready.forEach((it, i) => setTimeout(() => this.collect(it, i), i * 90));
    if (ready.length) Sound.sfx.bigcoin();
  },

  /* ---------- acciones ---------- */
  registerAction(kind) {
    const now = performance.now(), c = this.combo;
    c.n = now - c.last < 2200 ? c.n + 1 : 1; c.last = now;
    if (c.n > this.st.stats.maxCombo) this.st.stats.maxCombo = c.n;
    if (c.n >= 3) UI.combo(c.n);
    if (c.n % 10 === 0 && kind !== 'paint') {
      const b = 10 + this.st.level * 4;
      setTimeout(() => { Sound.sfx.combo(c.n / 10); this.addCoins(b, null, null, { count: 5 }); UI.toast(`🔥 ¡Racha x${c.n}! +${b} monedas`, 'combo'); }, 120);
    }
  },
  place(id, x, y) {
    const d = ITEM[id], st = this.st;
    if (st.level < d.lvl) { Sound.sfx.error(); UI.toast(`Se desbloquea en el nivel ${d.lvl}`, 'error'); return false; }
    if (!this.canPlace(d, x, y)) { Sound.sfx.error(); this.flashBad = performance.now(); if (d.onWater) UI.toast('Necesita agua de estanque debajo', 'error'); return false; }
    if (!this.spend(d.cost)) return false;
    const it = { uid: st.uid++, id, x, y, f: this.flip ? 1 : 0, t: Date.now(), born: performance.now() };
    it.seed = (it.uid * 7919) % 100000;
    st.items.push(it);
    this.rebuild();
    st.stats.placed[id] = (st.stats.placed[id] || 0) + 1;
    st.stats.cats[d.cat] = (st.stats.cats[d.cat] || 0) + 1;
    d.tags.forEach(t => st.stats.tags[t] = (st.stats.tags[t] || 0) + 1);
    const [bx, by] = this.itemBase(it);
    this.registerAction('build');
    Sound.sfx.place(this.combo.n - 1);
    if (id === 'pond_duck') setTimeout(() => Sound.sfx.quack(), 200);
    const pc = d.cat === 'naturaleza' ? ['#7ed957', '#b9f18c', '#ffffff', '#ffd23f'] : d.cat === 'deco' ? ['#ff8fb8', '#ffd23f', '#9b7bff', '#ffffff'] : ['#ffd23f', '#ffffff', '#7fd6ef', '#ff9f6b'];
    this.burst(bx, by - 8, 14 + d.w * 8, pc, 'star');
    this.dust(bx, by, d.w);
    this.floater(bx, by - d.hgt - 6, '-' + d.cost, '#ff7a7a', 0.8);
    if (d.w > 1) this.shake = 3;
    const xp = Math.max(1, Math.round(d.cost / 9) + 1);
    this.addXP(xp, bx, by - d.hgt + 10);
    this.undoStack.push({ type: 'place', uid: it.uid, cost: d.cost, xp });
    if (this.undoStack.length > 60) this.undoStack.shift();
    if (d.pop) for (let i = 0; i < Math.min(d.pop, 3); i++) setTimeout(() => this.spawnVillager(false, it), 600 + i * 400);
    this.afterChange(true);
    return true;
  },
  removeItem(it, opts = {}) {
    const d = ITEM[it.id], st = this.st;
    st.items = st.items.filter(o => o !== it);
    this.rebuild();
    const [bx, by] = this.itemBase(it);
    this.dying.push({ it, t0: performance.now() });
    this.burst(bx, by - 10, 14, ['#ffffff', '#e0e0e0', '#cfd8dc'], 'puff');
    if (opts.undo) return;
    Sound.sfx.poof();
    const refund = Math.floor(d.cost * 0.5);
    if (refund > 0) { st.coins += refund; const [sx, sy] = this.toScreen(bx, by - 20); UI.flyCoins(sx, sy, refund, 3); this.floater(bx, by - d.hgt, '+' + refund, '#ffd23f', 0.9); }
    st.stats.removed++;
    this.undoStack.push({ type: 'remove', item: { ...it }, refund });
    UI.hideInfo();
    this.afterChange(true);
  },
  moveItem(it, x, y) {
    const d = ITEM[it.id];
    if (!this.canPlace(d, x, y, it.uid)) { Sound.sfx.error(); return false; }
    const old = { x: it.x, y: it.y, f: it.f };
    it.x = x; it.y = y; it.f = this.flip ? 1 : 0; it.born = performance.now();
    this.rebuild();
    const [bx, by] = this.itemBase(it);
    Sound.sfx.place(2); this.dust(bx, by, d.w); this.burst(bx, by - 8, 10, ['#ffffff', '#ffd23f'], 'star');
    this.undoStack.push({ type: 'move', uid: it.uid, old });
    this.afterChange(true);
    return true;
  },
  paint(x, y, tid) {
    const st = this.st, td = TERRAINS[tid], code = T[tid];
    if (!this.isLand(x, y)) return false;
    const i = y * WORLD + x;
    if (st.terrain[i] === code) return false;
    const o = this.occ[i];
    if (o) {
      const od = ITEM[this.byUid.get(o).id];
      if ((code === T.water) !== !!od.onWater) return false;
    }
    if (st.level < td.lvl) { Sound.sfx.error(); UI.toast(`Se desbloquea en el nivel ${td.lvl}`, 'error'); return 'stop'; }
    if (!this.spend(td.cost)) return 'stop';
    const old = st.terrain[i];
    st.terrain[i] = code;
    this.tileAnim.set(i, performance.now());
    st.stats.painted[tid] = (st.stats.painted[tid] || 0) + 1;
    st.stats.paintedTotal++;
    const [wx, wy] = this.iso(x + 0.5, y + 0.5);
    const cols = { water: ['#7fd6ef', '#ffffff'], path: ['#e3cf9f', '#fff'], meadow: ['#ffffff', '#ffd23f', '#ff8fb8'], grass: ['#7ed957', '#b9f18c'], sand: ['#f2d99a', '#fff'], stone: ['#d0ccc6', '#fff'], soil: ['#9a6b45', '#6dbb4f'], deck: ['#d4a373', '#fff'], tiles: ['#f8d7e0', '#d7ecf8', '#fdf1c7'], clover: ['#62bd5a', '#fff'] }[tid] || ['#ffffff'];
    this.burst(wx, wy, 5, cols, 'spark', 0.6);
    this.registerAction('paint');
    Sound.sfx.paint(this.combo.n);
    if (td.cost) this.addXP(td.cost * 0.2);
    return { i, old, cost: td.cost };
  },
  undo() {
    const a = this.undoStack.pop();
    if (!a) { Sound.sfx.error(); UI.toast('Nada que deshacer', 'info'); return; }
    const st = this.st;
    if (a.type === 'place') {
      const it = this.byUid.get(a.uid);
      if (it) {
        const d = ITEM[it.id];
        this.removeItem(it, { undo: true });
        st.coins += a.cost; st.xp = Math.max(0, st.xp - a.xp);
        st.stats.placed[d.id] = Math.max(0, (st.stats.placed[d.id] || 1) - 1);
        st.stats.cats[d.cat] = Math.max(0, (st.stats.cats[d.cat] || 1) - 1);
        d.tags.forEach(t => st.stats.tags[t] = Math.max(0, (st.stats.tags[t] || 1) - 1));
      }
    } else if (a.type === 'remove') {
      if (st.coins < a.refund) { Sound.sfx.error(); UI.toast('No tienes monedas para deshacer', 'error'); this.undoStack.push(a); return; }
      const d = ITEM[a.item.id];
      if (!this.canPlace(d, a.item.x, a.item.y)) { Sound.sfx.error(); UI.toast('El hueco está ocupado', 'error'); return; }
      st.coins -= a.refund; const it = { ...a.item, born: performance.now() }; st.items.push(it); this.rebuild();
    } else if (a.type === 'paint') {
      for (const p of a.tiles) { st.terrain[p.i] = p.old; this.tileAnim.set(p.i, performance.now()); st.stats.paintedTotal = Math.max(0, st.stats.paintedTotal - 1); }
      st.coins += a.cost;
    } else if (a.type === 'move') {
      const it = this.byUid.get(a.uid);
      if (it && this.canPlace(ITEM[it.id], a.old.x, a.old.y, it.uid)) { it.x = a.old.x; it.y = a.old.y; it.f = a.old.f; it.born = performance.now(); this.rebuild(); }
    }
    Sound.sfx.undo();
    this.afterChange(true);
  },
  afterChange(structural) {
    if (structural) this.recompute();
    this.checkProgress();
    UI.refreshDock();
    this.dirty = true;
  },
  expandCost() { return EXPANSIONS[this.st.expands] || null; },
  expand() {
    const e = this.expandCost(); if (!e) return;
    if (this.st.level < e.lvl) { Sound.sfx.error(); UI.toast(`Necesitas nivel ${e.lvl}`, 'error'); return; }
    if (!this.spend(e.cost)) return;
    const st = this.st;
    const oldLand = this.land;
    st.expands++; st.radius += RADIUS_STEP;
    this.computeLand(true);
    // playa: costa nueva, la antigua vuelve a césped
    for (let i = 0; i < this.land.length; i++) {
      const x = i % WORLD, y = (i / WORLD) | 0;
      if (!this.land[i]) continue;
      const coast = isCoast(this.land, x, y);
      if (coast && (!oldLand[i] || st.terrain[i] === T.grass)) st.terrain[i] = T.beach;
      else if (!coast && st.terrain[i] === T.beach) st.terrain[i] = T.grass;
    }
    Sound.sfx.expand(); this.shake = 10; this.cam.tz = Math.max(0.6, this.cam.tz * 0.85);
    this.confetti(80);
    UI.toast('🏝️ ¡La isla ha crecido!', 'good');
    this.addXP(40 + st.expands * 30);
    this.afterChange(true);
    UI.refreshHUD(true);
  },

  /* ---------- misiones y logros ---------- */
  statValue(q) {
    const s = this.st, S = s.stats;
    switch (q.type) {
      case 'place': return S.placed[q.param] || 0;
      case 'cat': return S.cats[q.param] || 0;
      case 'tag': return S.tags[q.param] || 0;
      case 'paint': return q.param === '*' ? S.paintedTotal : (S.painted[q.param] || 0);
      case 'collect': return S.collects;
      case 'beauty': return this.beauty;
      case 'pop': return this.pop;
      case 'level': return s.level;
      case 'gifts': return S.gifts;
      case 'expand': return s.expands;
      case 'earned': return S.earned;
    }
    return 0;
  },
  questProgress(q) {
    const abs = ['beauty', 'pop', 'level', 'expand'].includes(q.type);
    return Math.min(q.target, abs ? this.statValue(q) : this.statValue(q) - (q.base || 0));
  },
  refillQuests() {
    const st = this.st;
    while (st.quests.length < 3) {
      let q;
      if (st.qi < QUESTS.length) { q = { ...QUESTS[st.qi++], base: 0 }; }
      else {
        const s = st.gen++;
        const tpl = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)](Math.floor(s / 2) + 1);
        q = { ...tpl, coins: Math.round((90 + s * 35) * (1 + st.level * 0.08)), xp: 30 + s * 8 };
        q.base = this.statValue(q);
        if (['beauty', 'pop'].includes(q.type)) q.base = 0;
      }
      q.done = false; q.k = Math.random().toString(36).slice(2, 8);
      st.quests.push(q);
    }
  },
  claimQuest(k, sx, sy) {
    const st = this.st, i = st.quests.findIndex(q => q.k === k);
    if (i < 0) return; const q = st.quests[i]; if (!q.done) return;
    st.quests.splice(i, 1);
    st.stats.quests++;
    Sound.sfx.claim();
    if (sx != null) this.addCoinsScreen(q.coins, sx, sy, 8); else this.addCoins(q.coins, null, null, { count: 8 });
    this.burstScreen(sx, sy);
    this.addXP(q.xp);
    this.refillQuests();
    this.checkProgress();
    UI.renderQuests(true);
  },
  checkProgress() {
    if (this.demo) return;
    const st = this.st;
    let changed = false;
    for (const q of st.quests) if (!q.done && this.questProgress(q) >= q.target) { q.done = true; changed = true; Sound.sfx.quest(); UI.toast('📜 ¡Misión cumplida! ' + q.title, 'quest'); }
    UI.renderQuests(changed);
    for (const a of ACHIEVEMENTS) if (!st.ach[a.id] && a.check(st, this)) {
      st.ach[a.id] = Date.now();
      setTimeout(() => { Sound.sfx.achievement(); UI.achievement(a); this.confetti(60); }, 400);
    }
  },

  /* ---------- partículas ---------- */
  pLimit() { return this.settings.particles === 'low' ? 150 : 600; },
  burst(x, y, n, cols, type = 'spark', sp = 1) {
    if (this.settings.particles === 'low') n = Math.ceil(n / 3);
    for (let i = 0; i < n && this.particles.length < this.pLimit(); i++) {
      const a = Math.random() * Math.PI * 2, v = (40 + Math.random() * 110) * sp;
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6 - 70 * sp, g: type === 'puff' ? -20 : 240, life: 0, max: 0.6 + Math.random() * 0.5, s: 2 + Math.random() * 3, col: cols[(Math.random() * cols.length) | 0], type, rot: Math.random() * 6 });
    }
  },
  dust(x, y, w = 1) {
    for (let i = 0; i < 10 * w; i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({ x: x + Math.cos(a) * 20 * w, y: y + Math.sin(a) * 10 * w, vx: Math.cos(a) * 50, vy: Math.sin(a) * 25, g: -10, life: 0, max: 0.5 + Math.random() * 0.3, s: 4 + Math.random() * 4, col: 'rgba(255,255,255,0.7)', type: 'puff' });
    }
  },
  floater(x, y, txt, col, size = 1) { this.floaters.push({ x, y, txt, col, size, life: 0, max: 1.3 }); },
  confetti(n) {
    if (this.settings.particles === 'low') n = Math.ceil(n / 3);
    const cols = ['#ff6b8b', '#ffd23f', '#7ed957', '#4dabf7', '#b197fc', '#ff9f43'];
    for (let i = 0; i < n; i++) this.sparts.push({ x: Math.random() * this.W, y: -20 - Math.random() * this.H * 0.4, vx: (Math.random() - 0.5) * 120, vy: 80 + Math.random() * 160, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, s: 5 + Math.random() * 5, col: cols[i % cols.length], life: 0, max: 3 + Math.random() * 2 });
  },

  /* ---------- aldeanos ---------- */
  spawnVillager(instant, from) {
    if (this.villagers.length >= Math.min(40, this.pop)) return;
    let tx, ty, ok = false;
    if (from) {
      const d = ITEM[from.id];
      for (let k = 0; k < 12 && !ok; k++) { tx = from.x + ((Math.random() * (d.w + 2)) | 0) - 1; ty = from.y + d.h; ok = this.walkable(tx, ty); if (!ok) { tx = from.x + d.w; ty = from.y + ((Math.random() * d.h) | 0); ok = this.walkable(tx, ty); } }
    }
    for (let k = 0; k < 80 && !ok; k++) { tx = (Math.random() * WORLD) | 0; ty = (Math.random() * WORLD) | 0; ok = this.walkable(tx, ty); }
    if (!ok) return;
    const shirts = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#da77f2', '#ff922b', '#20c997', '#f783ac'];
    const skins = ['#ffd7b5', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffe0c4'];
    const hairs = ['#3b2a20', '#6d4c2f', '#e8c07d', '#222', '#b5523b', '#9e9e9e'];
    this.villagers.push({ tx, ty, nx: tx, ny: ty, p: 1, speed: 0.9 + Math.random() * 0.6, moving: false, wait: instant ? Math.random() * 2 : 0.3, shirt: shirts[(Math.random() * 8) | 0], skin: skins[(Math.random() * 6) | 0], hair: hairs[(Math.random() * 6) | 0], hat: (Math.random() * 3) | 0, hatCol: shirts[(Math.random() * 8) | 0], ph: Math.random() * 6, px: tx, py: ty, bub: null, born: instant ? 0 : performance.now() });
  },
  updateVillagers(dt) {
    const target = Math.min(40, this.pop);
    if (this.villagers.length < target && Math.random() < dt * 0.5) this.spawnVillager(false);
    while (this.villagers.length > target) this.villagers.pop();
    for (const v of this.villagers) {
      if (v.bub && (v.bub.t -= dt) <= 0) v.bub = null;
      if (!this.walkable(v.tx, v.ty) && !v.moving) {
        let ok = false;
        for (let k = 0; k < 40 && !ok; k++) { const x = (Math.random() * WORLD) | 0, y = (Math.random() * WORLD) | 0; if (this.walkable(x, y)) { v.tx = v.nx = x; v.ty = v.ny = y; ok = true; } }
        if (!ok) continue;
      }
      if (v.moving) {
        v.p += dt * v.speed;
        if (v.p >= 1) { v.px = v.tx; v.py = v.ty; v.tx = v.nx; v.ty = v.ny; v.p = 0; v.moving = false; if (Math.random() < 0.12) v.wait = 1 + Math.random() * 3; }
      } else if (v.wait > 0) { v.wait -= dt; }
      else {
        const opts = [];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = v.tx + dx, ny = v.ty + dy;
          if (!this.walkable(nx, ny)) continue;
          let w = TERRAINS[TERRAIN_IDS[this.terr(nx, ny)]].walk || 1;
          if (nx === v.px && ny === v.py) w *= 0.15;
          opts.push([nx, ny, w]);
        }
        if (!opts.length) { v.wait = 1; continue; }
        let r = Math.random() * opts.reduce((s, o) => s + o[2], 0);
        for (const o of opts) { r -= o[2]; if (r <= 0) { v.nx = o[0]; v.ny = o[1]; break; } }
        if (v.nx === v.tx && v.ny === v.ty) { v.nx = opts[0][0]; v.ny = opts[0][1]; }
        v.moving = true; v.p = 0;
        if (!v.bub && Math.random() < 0.015) v.bub = { txt: ['♥', '♪', '☀', '😊', '✿', '★'][(Math.random() * 6) | 0], t: 2.2 };
      }
      const p = v.moving ? v.p : 0;
      v.x = lerp(v.tx, v.nx, p) + 0.5; v.y = lerp(v.ty, v.ny, p) + 0.5;
      v.dir = (v.nx - v.tx) - (v.ny - v.ty) >= 0 ? 1 : -1;
    }
  },

  /* ---------- update ---------- */
  update(dt) {
    const st = this.st;
    ENV.t += dt;
    // día / noche
    const mode = this.demo ? 'auto' : this.settings.daynight;
    if (mode === 'auto') st.phase = (st.phase + dt / (this.demo ? DAY_LEN * 0.7 : DAY_LEN)) % 1;
    const ph = mode === 'day' ? 0.25 : mode === 'night' ? 0.78 : st.phase;
    ENV.phase = ph;
    const K = [[0, '#ffd2b0', 0.25], [0.07, '#ffffff', 0], [0.5, '#ffffff', 0], [0.6, '#ffb98f', 0.25], [0.68, '#6f7cc8', 1], [0.88, '#6f7cc8', 1], [0.95, '#ffc3a6', 0.35], [1, '#ffd2b0', 0.25]];
    for (let i = 0; i < K.length - 1; i++) if (ph >= K[i][0] && ph <= K[i + 1][0]) {
      const u = (ph - K[i][0]) / (K[i + 1][0] - K[i][0]);
      ENV.tint = mixHex(K[i][1], K[i + 1][1], u); ENV.night = lerp(K[i][2], K[i + 1][2], u); break;
    }
    if (Sound.ready) Sound.setNight(ENV.night);
    // cámara suave
    const cam = this.cam;
    if (Math.abs(cam.tz - cam.z) > 0.0005) {
      const fx = this.zoomAnchor ? this.zoomAnchor[0] : this.W / 2, fy = this.zoomAnchor ? this.zoomAnchor[1] : this.H / 2;
      const [wx, wy] = this.toWorld(fx, fy);
      cam.z = lerp(cam.z, cam.tz, Math.min(1, dt * 12));
      cam.x = fx - wx * cam.z; cam.y = fy - wy * cam.z;
    }
    if (this.demo) { cam.x += Math.sin(ENV.t * 0.1) * 6 * dt; cam.y += Math.cos(ENV.t * 0.13) * 4 * dt; }
    // teclado pan
    if (this.keys) {
      const sp = 600 * dt; let kx = 0, ky = 0;
      if (this.keys.has('a') || this.keys.has('arrowleft')) kx += sp; if (this.keys.has('d') || this.keys.has('arrowright')) kx -= sp;
      if (this.keys.has('w') || this.keys.has('arrowup')) ky += sp; if (this.keys.has('s') || this.keys.has('arrowdown')) ky -= sp;
      if (kx || ky) { cam.x += kx; cam.y += ky; }
    }
    this.clampCam();
    this.shake *= Math.pow(0.02, dt);
    // partículas
    for (const p of this.particles) { p.life += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.98; p.rot += dt * 4; }
    this.particles = this.particles.filter(p => p.life < p.max);
    for (const p of this.sparts) { p.life += dt; p.vy += 30 * dt; p.x += p.vx * dt + Math.sin(p.life * 3 + p.rot) * 30 * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
    this.sparts = this.sparts.filter(p => p.life < p.max && p.y < this.H + 30);
    for (const f of this.floaters) f.life += dt;
    this.floaters = this.floaters.filter(f => f.life < f.max);
    this.dying = this.dying.filter(d => performance.now() - d.t0 < 300);
    this.updateVillagers(dt);
    this.ambient(dt);
    if (this.demo) return;
    // regalo flotante
    if (!this.gift) {
      this.giftTimer -= dt;
      if (this.giftTimer <= 0) {
        this.giftTimer = 70 + Math.random() * 80;
        for (let k = 0; k < 60; k++) { const x = (Math.random() * WORLD) | 0, y = (Math.random() * WORLD) | 0; if (this.walkable(x, y)) { this.gift = { x, y, t0: performance.now(), life: 50 }; Sound.sfx.gift(); UI.toast('🎁 ¡Ha aparecido un regalo en tu isla!', 'gift'); break; } }
      }
    } else if ((performance.now() - this.gift.t0) / 1000 > this.gift.life) this.gift = null;
    st.playtime += dt;
    this.checkT += dt; if (this.checkT > 2) { this.checkT = 0; this.checkProgress(); }
    this.saveTimer += dt; if (this.saveTimer > 15) { this.saveTimer = 0; this.save(false); }
  },
  ambient(dt) {
    this.ambT += dt; if (this.ambT < 0.12) return; const step = this.ambT; this.ambT = 0;
    if (this.particles.length > this.pLimit() * 0.8) return;
    const now = Date.now();
    for (const it of this.st.items) {
      const d = ITEM[it.id];
      if (d.smoke && Math.random() < step * 1.2) {
        const [bx, by] = this.itemBase(it), sx = it.f ? -d.smoke[0] : d.smoke[0];
        this.particles.push({ x: bx + sx, y: by + d.smoke[1], vx: 6 + Math.random() * 6, vy: -18 - Math.random() * 8, g: -4, life: 0, max: 2.4, s: 3 + Math.random() * 2, col: 'rgba(240,240,240,0.55)', type: 'smoke' });
      }
      if (d.petals && Math.random() < step * 0.6) {
        const [bx, by] = this.itemBase(it);
        this.particles.push({ x: bx + (Math.random() - 0.5) * 30, y: by - 30 - Math.random() * 15, vx: 10 + Math.random() * 14, vy: 6, g: 8, life: 0, max: 2.5, s: 2.2, col: Math.random() < 0.5 ? '#ffb3cf' : '#ffd6e5', type: 'petal', rot: Math.random() * 6 });
      }
      if (it.id === 'campfire' && Math.random() < step * 3) {
        const [bx, by] = this.itemBase(it);
        this.particles.push({ x: bx + (Math.random() - 0.5) * 8, y: by - 14, vx: (Math.random() - 0.5) * 12, vy: -40 - Math.random() * 30, g: 0, life: 0, max: 0.9, s: 1.4, col: '#ffcf5c', type: 'ember' });
      }
      if (it.id === 'crystal' && Math.random() < step * 1.5) {
        const [bx, by] = this.itemBase(it);
        this.particles.push({ x: bx + (Math.random() - 0.5) * 24, y: by - 10 - Math.random() * 26, vx: 0, vy: -8, g: 0, life: 0, max: 1.2, s: 2, col: '#d0f4ff', type: 'twinkle' });
      }
      if (ITEM[it.id].tags.includes('flower') && ENV.night < 0.3 && Math.random() < step * 0.06) {
        const [bx, by] = this.itemBase(it);
        this.particles.push({ x: bx, y: by - 14, vx: (Math.random() - 0.5) * 30, vy: -10, g: 0, life: 0, max: 4, s: 3, col: ['#ffd23f', '#ff8fb8', '#9b7bff', '#ffffff'][(Math.random() * 4) | 0], type: 'butterfly', rot: Math.random() * 6 });
      }
      if (ENV.night > 0.6 && d.cat === 'naturaleza' && Math.random() < step * 0.05) {
        const [bx, by] = this.itemBase(it);
        this.particles.push({ x: bx + (Math.random() - 0.5) * 40, y: by - Math.random() * 30, vx: (Math.random() - 0.5) * 10, vy: -4, g: 0, life: 0, max: 4, s: 1.8, col: '#e6ff8a', type: 'firefly', rot: Math.random() * 6 });
      }
    }
    if (this.gift && Math.random() < step * 5) {
      const [bx, by] = this.iso(this.gift.x + 0.5, this.gift.y + 0.5);
      this.particles.push({ x: bx + (Math.random() - 0.5) * 26, y: by - 10 - Math.random() * 26, vx: 0, vy: -15, g: 0, life: 0, max: 1, s: 2.2, col: '#fff3b0', type: 'twinkle' });
    }
  },
  clampCam() {
    const C = WORLD / 2, [wx, wy] = this.iso(C, C), cam = this.cam;
    const R = (this.st.radius + 4) * 32 * cam.z;
    const sx = wx * cam.z + cam.x, sy = wy * cam.z + cam.y;
    const minX = -R * 0.9 + this.W * 0.1, maxX = this.W * 0.9 + R * 0.9, minY = -R * 0.5 + this.H * 0.1, maxY = this.H * 0.9 + R * 0.5;
    if (sx < minX) cam.x += minX - sx; if (sx > maxX) cam.x -= sx - maxX;
    if (sy < minY) cam.y += minY - sy; if (sy > maxY) cam.y -= sy - maxY;
  },

  /* ---------- render ---------- */
  burstScreen(sx, sy) {
    if (sx == null) return;
    const cols = ['#ff6b8b', '#ffd23f', '#7ed957', '#4dabf7', '#b197fc'];
    for (let i = 0; i < 26; i++) { const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 200; this.sparts.push({ x: sx, y: sy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14, s: 5 + Math.random() * 4, col: cols[i % 5], life: 0, max: 1.4 }); }
  },
  render(forPhoto = false) {
    forPhoto = forPhoto || this.photoMode;
    const c = this.c, st = this.st, cam = this.cam, dpr = this.dpr, now = performance.now(), t = ENV.t;
    const pal = PALETTES[st.palette] || PALETTES.primavera;
    // mar
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = c.createLinearGradient(0, 0, 0, this.H);
    g.addColorStop(0, pal.sea[0]); g.addColorStop(1, pal.sea[1]);
    c.fillStyle = g; c.fillRect(0, 0, this.W, this.H);
    const shx = this.shake > 0.3 ? (Math.random() - 0.5) * this.shake : 0, shy = this.shake > 0.3 ? (Math.random() - 0.5) * this.shake : 0;
    c.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, (cam.x + shx) * dpr, (cam.y + shy) * dpr);
    LIGHTS.length = 0;
    // brillos del mar
    const C = WORLD / 2, [cx0, cy0] = this.iso(C, C);
    for (let i = 0; i < 90; i++) {
      const a = Math.sin(t * 0.7 + i * 1.9);
      if (a < 0.3) continue;
      const hx = hash2(i, 3, 1) * 2 - 1, hy = hash2(i, 5, 2) * 2 - 1;
      const x = cx0 + hx * 1300 + Math.sin(t * 0.2 + i) * 10, y = cy0 + hy * 700;
      c.strokeStyle = `rgba(255,255,255,${(a - 0.3) * 0.5})`; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + 6, y); c.stroke();
    }
    // aguas someras y espuma
    for (let y = 0; y < WORLD; y++) for (let x = 0; x < WORLD; x++) {
      const i = y * WORLD + x, d = this.coast[i];
      if (d === 0 || d > 3) continue;
      const [px, py] = this.iso(x, y);
      const a = d === 1 ? 0.55 : d === 2 ? 0.32 : 0.15;
      poly(c, [px, py, px + 32, py + 16, px, py + 32, px - 32, py + 16], `rgba(150,235,245,${a})`);
    }
    for (let y = 0; y < WORLD; y++) for (let x = 0; x < WORLD; x++) {
      const i = y * WORLD + x; if (this.coast[i] !== 1) continue;
      const [px, py] = this.iso(x, y);
      const w = Math.sin(t * 1.6 + x * 0.6 + y * 0.4) * 0.5 + 0.5;
      const k = 0.55 + w * 0.25;
      c.fillStyle = `rgba(255,255,255,${0.18 + w * 0.22})`;
      c.beginPath(); c.ellipse(px, py + 16 + 6, 32 * k, 16 * k, 0, 0, Math.PI * 2); c.fill();
    }
    // suelo
    const showGrid = !forPhoto && (this.tool === 'build' || this.tool === 'paint' || this.tool === 'move' || this.settings.grid);
    for (let y = 0; y < WORLD; y++) for (let x = 0; x < WORLD; x++) {
      const i = y * WORLD + x; if (!this.land[i]) continue;
      let [px, py] = this.iso(x, y);
      let alpha = 1;
      const lb = this.landBorn[i];
      if (lb && now < lb + 600) { const p = clamp((now - lb) / 600, 0, 1); if (p <= 0) continue; const e = 1 - Math.pow(1 - p, 3); py += (1 - e) * 40; alpha = e; }
      const ta = this.tileAnim.get(i);
      if (ta) { const p = (now - ta) / 300; if (p >= 1) this.tileAnim.delete(i); else py -= Math.sin(p * Math.PI) * 5; }
      if (alpha < 1) c.globalAlpha = alpha;
      const cl = !this.isLand(x, y + 1), cr = !this.isLand(x + 1, y);
      const code = st.terrain[i];
      if (code === T.water) {
        WATER_NB = (this.terr2(x - 1, y) ? 1 : 0) | (this.terr2(x, y - 1) ? 2 : 0) | (this.terr2(x + 1, y) ? 4 : 0) | (this.terr2(x, y + 1) ? 8 : 0);
      }
      drawTerrainTile(c, px, py, code, x, y, st.palette, t, false, cl, cr);
      if (alpha < 1) c.globalAlpha = 1;
    }
    if (showGrid) {
      c.strokeStyle = 'rgba(255,255,255,0.13)'; c.lineWidth = 1; c.beginPath();
      for (let y = 0; y < WORLD; y++) for (let x = 0; x < WORLD; x++) {
        if (!this.land[y * WORLD + x]) continue; const [px, py] = this.iso(x, y);
        c.moveTo(px, py); c.lineTo(px + 32, py + 16); c.moveTo(px, py); c.lineTo(px - 32, py + 16);
      }
      c.stroke();
    }
    // cursor sobre el suelo
    if (!forPhoto && this.hover.inside && !this.demo) this.drawCursor(c, now);
    // objetos
    const list = [];
    for (const it of st.items) {
      if (this.carry && this.carry === it) continue;
      const d = ITEM[it.id];
      list.push({ k: it.x + d.w - 1 + it.y + d.h - 1, x: it.x, it });
    }
    for (const v of this.villagers) list.push({ k: Math.max(v.tx + v.ty, v.nx + v.ny) + 0.1, x: v.x, v });
    if (this.gift) list.push({ k: this.gift.x + this.gift.y + 0.2, x: this.gift.x, gift: true });
    for (const d of this.dying) list.push({ k: d.it.x + d.it.y + 0.3, x: d.it.x, dying: d });
    list.sort((a, b) => a.k - b.k || a.x - b.x);
    for (const e of list) {
      if (e.it) this.drawItem(c, e.it, now);
      else if (e.v) {
        const v = e.v, [vx, vy] = this.iso(v.x, v.y);
        c.save(); c.translate(vx, vy);
        if (v.born) { const p = clamp((now - v.born) / 400, 0, 1); c.scale(p, p); }
        if (v.dir < 0) c.scale(-1, 1);
        drawVillager(c, v, t); c.restore();
        if (v.bub) {
          const a = Math.min(1, v.bub.t * 2);
          c.globalAlpha = a; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(vx - 7, vy - 36, 14, 12, 5); c.fill();
          c.fillStyle = '#ff6b8b'; c.font = '600 9px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(v.bub.txt, vx, vy - 30); c.globalAlpha = 1;
        }
      } else if (e.gift) { const [gx, gy] = this.iso(this.gift.x + 0.5, this.gift.y + 0.5); drawGift(c, gx, gy, t); }
      else if (e.dying) {
        const p = (now - e.dying.t0) / 300, it = e.dying.it, [bx, by] = this.itemBase(it);
        c.save(); c.globalAlpha = 1 - p; c.translate(bx, by); c.scale((it.f ? -1 : 1) * (1 - p * 0.6), 1 - p * 0.8); CUR.collect = false; SPR[it.id](c, it); c.restore();
      }
    }
    // fantasma de colocación
    if (!forPhoto && this.hover.inside && !this.demo) this.drawGhost(c, now);
    // partículas mundo
    for (const p of this.particles) this.drawParticle(c, p, t);
    // nubes
    this.drawClouds(c, t, cx0, cy0);
    // tinte día/noche + luces
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (ENV.tint !== '#ffffff') {
      c.globalCompositeOperation = 'multiply'; c.fillStyle = ENV.tint; c.fillRect(0, 0, this.W, this.H);
      c.globalCompositeOperation = 'source-over';
    }
    if (ENV.night > 0.05 && LIGHTS.length) {
      c.globalCompositeOperation = 'lighter';
      for (const L of LIGHTS) {
        const [sx, sy] = this.toScreen(L.x, L.y), r = L.r * cam.z;
        if (L.type === 'beam') {
          const ang = t * 0.9;
          c.save(); c.translate(sx, sy); c.scale(1, 0.5); c.rotate(ang);
          const gb = c.createLinearGradient(0, 0, 420 * cam.z, 0); gb.addColorStop(0, rgba('#fff3b0', 0.35 * ENV.night)); gb.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = gb; c.beginPath(); c.moveTo(0, 0); c.lineTo(420 * cam.z, -50 * cam.z); c.lineTo(420 * cam.z, 50 * cam.z); c.closePath(); c.fill(); c.restore();
          continue;
        }
        if (sx < -r || sy < -r || sx > this.W + r || sy > this.H + r) continue;
        const gl = c.createRadialGradient(sx, sy, 0, sx, sy, r);
        gl.addColorStop(0, rgba(L.col, 0.5 * ENV.night * L.a)); gl.addColorStop(0.4, rgba(L.col, 0.18 * ENV.night * L.a)); gl.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = gl; c.fillRect(sx - r, sy - r, r * 2, r * 2);
      }
      c.globalCompositeOperation = 'source-over';
    }
    // estrellas de noche en el mar
    if (ENV.night > 0.3) {
      for (let i = 0; i < 40; i++) {
        const x = hash2(i, 1, 9) * this.W, y = hash2(i, 2, 9) * this.H * 0.5;
        const a = (Math.sin(t * 2 + i) * 0.5 + 0.5) * (ENV.night - 0.3);
        c.fillStyle = `rgba(255,255,230,${a * 0.6})`; c.fillRect(x, y, 1.5, 1.5);
      }
    }
    // burbujas de monedas y textos (siempre brillantes)
    c.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, (cam.x + shx) * dpr, (cam.y + shy) * dpr);
    if (!forPhoto && !this.demo) this.drawBubbles(c, now);
    for (const f of this.floaters) {
      const p = f.life / f.max, e = 1 - Math.pow(1 - Math.min(1, p * 2), 3);
      const y = f.y - e * 34, a = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
      const sc = (p < 0.15 ? 0.6 + p / 0.15 * 0.6 : 1.2 - Math.min(0.2, (p - 0.15))) * f.size / Math.max(0.7, Math.sqrt(cam.z));
      c.save(); c.globalAlpha = a; c.translate(f.x, y); c.scale(sc, sc);
      c.font = '700 16px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = 4; c.strokeStyle = 'rgba(40,30,60,.75)'; c.strokeText(f.txt, 0, 0); c.fillStyle = f.col; c.fillText(f.txt, 0, 0);
      c.restore();
    }
    // confeti en pantalla
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const p of this.sparts) {
      c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.globalAlpha = Math.min(1, (p.max - p.life) * 2);
      c.fillStyle = p.col; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore();
    }
    c.globalAlpha = 1;
  },
  terr2(x, y) { return this.isLand(x, y) && this.terr(x, y) === T.water; },
  drawItem(c, it, now) {
    const d = ITEM[it.id]; const [bx, by] = this.itemBase(it);
    let sx = 1, sy = 1;
    if (it.born) {
      const p = (now - it.born) / 520;
      if (p < 1) { const e = 1 - Math.pow(2, -9 * p) * Math.cos(p * Math.PI * 3.2); sx = e; sy = e * (1 + 0.12 * Math.sin(p * Math.PI)); }
      else it.born = 0;
    }
    if (it.pulse) { const p = (now - it.pulse) / 350; if (p < 1) { const k = Math.sin(p * Math.PI) * 0.1; sx *= 1 + k; sy *= 1 - k * 0.6; } else it.pulse = 0; }
    const hov = this.hoverItem === it && (this.tool === 'hand' || this.tool === 'remove' || this.tool === 'move');
    c.save(); c.translate(bx, by);
    if (it.f) c.scale(-1, 1);
    c.scale(sx, sy);
    CUR.ox = bx; CUR.oy = by; CUR.flip = !!it.f; CUR.sc = 1; CUR.collect = true;
    if (hov) { c.shadowColor = this.tool === 'remove' ? 'rgba(255,80,80,.9)' : 'rgba(255,255,255,.95)'; c.shadowBlur = 12; }
    if (d.onWater && !this.isWaterTile(it.x, it.y)) { }
    SPR[it.id](c, it);
    c.restore();
    CUR.collect = false;
  },
  isWaterTile(x, y) { return this.terr(x, y) === T.water; },
  drawCursor(c, now) {
    const { x, y } = this.hover;
    const pulse = 0.6 + Math.sin(now / 160) * 0.25;
    const diam = (tx, ty, fill, stroke) => { const [px, py] = this.iso(tx, ty); poly(c, [px, py, px + 32, py + 16, px, py + 32, px - 32, py + 16], fill, stroke, 2); };
    if (this.tool === 'paint') {
      const r = this.brush === 3 ? 1 : 0;
      for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) if (this.isLand(x + a, y + b)) diam(x + a, y + b, `rgba(255,255,255,${0.18 * pulse})`, `rgba(255,255,255,${0.8 * pulse})`);
    } else if (this.tool === 'build' || (this.tool === 'move' && this.carry)) {
      const d = this.tool === 'build' ? ITEM[this.sel] : ITEM[this.carry.id];
      const ok = this.canPlace(d, x, y, this.carry ? this.carry.uid : 0) && (this.tool !== 'build' || (this.st.level >= d.lvl && this.st.coins >= d.cost));
      for (let a = 0; a < d.w; a++) for (let b = 0; b < d.h; b++) diam(x + a, y + b, ok ? `rgba(120,255,160,${0.35 * pulse})` : `rgba(255,90,90,${0.4 * pulse})`, ok ? 'rgba(200,255,210,.9)' : 'rgba(255,150,150,.9)');
      // radio de influencia del encanto
      if (d.beauty && !isBuilding(d)) {
        c.strokeStyle = 'rgba(255,143,184,.35)'; c.setLineDash([6, 6]); c.lineWidth = 2;
        const [p0x, p0y] = this.iso(x - 3, y - 3), [p1x, p1y] = this.iso(x + d.w + 3, y - 3), [p2x, p2y] = this.iso(x + d.w + 3, y + d.h + 3), [p3x, p3y] = this.iso(x - 3, y + d.h + 3);
        poly(c, [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y], null, 'rgba(255,143,184,.45)', 2); c.setLineDash([]);
      }
    } else if (this.isLand(x, y) && !this.hoverItem) {
      diam(x, y, 'rgba(255,255,255,0.1)', `rgba(255,255,255,${0.45 * pulse})`);
    }
  },
  drawGhost(c, now) {
    const { x, y } = this.hover;
    let d, flip = this.flip;
    if (this.tool === 'build' && this.sel) d = ITEM[this.sel];
    else if (this.tool === 'move' && this.carry) d = ITEM[this.carry.id];
    else return;
    const [bx, by] = this.iso(x + d.w / 2, y + d.h / 2);
    c.save(); c.globalAlpha = 0.7 + Math.sin(now / 200) * 0.1; c.translate(bx, by - 3 - Math.sin(now / 250) * 2);
    if (flip) c.scale(-1, 1);
    CUR.collect = false;
    SPR[d.id](c, this.carry || { seed: 77, uid: 0 });
    c.restore();
  },
  drawBubbles(c, now) {
    this.bubbles = [];
    const zc = 1 / Math.max(0.75, Math.sqrt(this.cam.z));
    for (const it of this.st.items) {
      const d = ITEM[it.id]; if (!isBuilding(d)) continue;
      const cyc = this.cyclesOf(it);
      const [bx, by] = this.itemBase(it);
      const y0 = by - d.hgt - 12;
      if (!cyc) {
        // anillo de progreso cuando se pasa el ratón
        if (this.hoverItem === it) {
          const p = ((Date.now() - it.t) / (d.period * 1000)) % 1;
          c.save(); c.translate(bx, y0); c.scale(zc, zc);
          c.fillStyle = 'rgba(30,30,60,.45)'; c.beginPath(); c.arc(0, 0, 11, 0, Math.PI * 2); c.fill();
          c.strokeStyle = '#ffd23f'; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 9, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); c.stroke(); c.lineCap = 'butt';
          c.restore();
        }
        continue;
      }
      const bob = Math.sin(now / 300 + it.uid) * 3, full = cyc >= MAX_STACK;
      const sc = zc * (full ? 1 + Math.sin(now / 150) * 0.06 : 1);
      c.save(); c.translate(bx, y0 + bob); c.scale(sc, sc);
      c.fillStyle = 'rgba(40,30,70,.25)'; c.beginPath(); c.ellipse(0, 18, 8, 3, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, 14, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(-5, 11); c.lineTo(0, 18); c.lineTo(5, 11); c.fill();
      c.fillStyle = '#ffb703'; c.beginPath(); c.arc(0, 0, 9.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(-0.8, -0.8, 7.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(-3, -3.4, 2.2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#d98e04'; c.font = '700 9px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('★', 0, 0.5);
      if (cyc > 1) {
        c.fillStyle = full ? '#ff4d6d' : '#7b5cff'; c.beginPath(); c.arc(11, -10, 7, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff'; c.font = '700 9px Fredoka, sans-serif'; c.fillText('x' + cyc, 11, -9.5);
      }
      c.restore();
      this.bubbles.push({ it, x: bx, y: y0 + bob, r: 17 * sc });
    }
  },
  drawParticle(c, p, t) {
    const a = 1 - p.life / p.max;
    c.globalAlpha = Math.max(0, Math.min(1, a * 1.5));
    switch (p.type) {
      case 'star': {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col; const s = p.s * (0.5 + a * 0.8);
        c.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? s * 0.45 : s * 1.2, an = k * Math.PI / 4; c.lineTo(Math.cos(an) * r, Math.sin(an) * r); } c.closePath(); c.fill(); c.restore(); break;
      }
      case 'puff': case 'smoke': { c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.s * (1 + (1 - a) * 1.6), 0, Math.PI * 2); c.fill(); break; }
      case 'petal': { c.save(); c.translate(p.x + Math.sin(t * 3 + p.rot) * 6, p.y); c.rotate(p.rot + t); c.fillStyle = p.col; c.beginPath(); c.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, Math.PI * 2); c.fill(); c.restore(); break; }
      case 'butterfly': {
        const x = p.x + Math.sin(t * 2 + p.rot) * 14, y = p.y + Math.cos(t * 1.7 + p.rot) * 8, fl = Math.abs(Math.sin(t * 14 + p.rot));
        c.fillStyle = p.col; c.beginPath(); c.ellipse(x - 2.4 * fl, y, 2.4 * fl + 0.5, 2.2, 0, 0, Math.PI * 2); c.ellipse(x + 2.4 * fl, y, 2.4 * fl + 0.5, 2.2, 0, 0, Math.PI * 2); c.fill(); break;
      }
      case 'firefly': case 'twinkle': case 'ember': {
        const x = p.type === 'firefly' ? p.x + Math.sin(t * 1.5 + p.rot) * 8 : p.x, y = p.y;
        const tw = p.type === 'twinkle' ? Math.sin(p.life / p.max * Math.PI) : (0.5 + Math.sin(t * 6 + p.rot) * 0.5);
        c.globalAlpha = tw * Math.min(1, a * 2);
        c.fillStyle = p.col; c.beginPath(); c.arc(x, y, p.s, 0, Math.PI * 2); c.fill();
        c.globalAlpha *= 0.3; c.beginPath(); c.arc(x, y, p.s * 3, 0, Math.PI * 2); c.fill();
        break;
      }
      default: { c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.s * a + 0.5, 0, Math.PI * 2); c.fill(); }
    }
    c.globalAlpha = 1;
  },
  drawClouds(c, t, cx, cy) {
    for (let i = 0; i < 6; i++) {
      const sp = 8 + hash2(i, 1, 3) * 10;
      const span = 2600;
      const x = cx - 1300 + ((hash2(i, 2, 3) * span + t * sp) % span);
      const y = cy - 500 + hash2(i, 4, 3) * 900;
      const s = 0.8 + hash2(i, 5, 3) * 0.9;
      c.fillStyle = 'rgba(20,40,60,0.07)';
      c.beginPath(); c.ellipse(x + 30, y + 160, 70 * s, 22 * s, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = `rgba(255,255,255,${0.5 + 0.2 * (1 - ENV.night)})`;
      c.beginPath();
      c.ellipse(x, y, 50 * s, 18 * s, 0, 0, Math.PI * 2);
      c.ellipse(x - 30 * s, y + 4 * s, 30 * s, 13 * s, 0, 0, Math.PI * 2);
      c.ellipse(x + 26 * s, y - 8 * s, 32 * s, 18 * s, 0, 0, Math.PI * 2);
      c.ellipse(x + 50 * s, y + 4 * s, 24 * s, 11 * s, 0, 0, Math.PI * 2);
      c.fill();
    }
  },

  /* ---------- entrada ---------- */
  pickItem(sx, sy) {
    const [wx, wy] = this.toWorld(sx, sy);
    let best = null, bk = -1;
    for (const it of this.st.items) {
      const d = ITEM[it.id]; const [bx, by] = this.itemBase(it);
      const hw = (d.w + d.h) * 16, hh = (d.w + d.h) * 8;
      const inDia = Math.abs(wx - bx) / hw + Math.abs(wy - by) / hh <= 1;
      const inBody = Math.abs(wx - bx) < hw * 0.62 && wy < by + hh * 0.3 && wy > by - d.hgt;
      if (inDia || inBody) { const k = it.x + d.w + it.y + d.h + (inDia ? 0.5 : 0); if (k > bk) { bk = k; best = it; } }
    }
    return best;
  },
  hitBubble(sx, sy) {
    const [wx, wy] = this.toWorld(sx, sy);
    for (let i = this.bubbles.length - 1; i >= 0; i--) { const b = this.bubbles[i]; if (Math.hypot(wx - b.x, wy - b.y) < b.r + 4) return b; }
    return null;
  },
  hitGift(sx, sy) {
    if (!this.gift) return false;
    const [wx, wy] = this.toWorld(sx, sy), [gx, gy] = this.iso(this.gift.x + 0.5, this.gift.y + 0.5);
    return Math.hypot(wx - gx, wy - gy + 18) < 24;
  },
  openGift() {
    const g = this.gift; if (!g) return; this.gift = null;
    const [gx, gy] = this.iso(g.x + 0.5, g.y + 0.5);
    const amt = Math.round((30 + Math.random() * 60) * (1 + this.st.level * 0.35));
    Sound.sfx.gift();
    this.burst(gx, gy - 20, 30, ['#ff6b8b', '#ffd23f', '#ffffff', '#b197fc'], 'star', 1.3);
    this.floater(gx, gy - 40, '🎁 +' + amt, '#ffd23f', 1.3);
    this.addCoins(amt, gx, gy - 30, { count: 8 });
    this.addXP(10 + this.st.level * 2, gx, gy - 20);
    this.st.stats.gifts++;
    this.shake = 4;
    this.afterChange(false);
  },
  setTool(tool, sel) {
    this.tool = tool; this.sel = sel || null;
    if (this.carry) { this.carry = null; this.rebuild(); }
    UI.toolChanged();
  },
  bindInput() {
    const cv = this.cv;
    const ptrs = new Map();
    let down = null, pinch = null, paintAct = null, lastPaintTile = null;
    this.keys = new Set();
    const updateHover = (sx, sy) => {
      this.hover.sx = sx; this.hover.sy = sy;
      const [tx, ty] = this.tileAt(sx, sy);
      let ox = 0, oy = 0;
      const d = this.tool === 'build' && this.sel ? ITEM[this.sel] : (this.carry ? ITEM[this.carry.id] : null);
      if (d && d.w > 1) { const [wx, wy] = this.toWorld(sx, sy); ox = Math.floor((wx / 32 + wy / 16) / 2 - d.w / 2 + 0.5); oy = Math.floor((wy / 16 - wx / 32) / 2 - d.h / 2 + 0.5); this.hover.x = ox; this.hover.y = oy; }
      else { this.hover.x = tx; this.hover.y = ty; }
      this.hover.inside = true;
      const hi = (this.tool === 'hand' || this.tool === 'remove' || (this.tool === 'move' && !this.carry)) ? this.pickItem(sx, sy) : null;
      if (hi !== this.hoverItem) { this.hoverItem = hi; if (hi) Sound.sfx.hover(); }
      const overB = this.hitBubble(sx, sy) || this.hitGift(sx, sy);
      cv.style.cursor = overB ? 'pointer' : (this.tool === 'hand' ? (hi ? 'pointer' : (down && down.panning ? 'grabbing' : 'grab')) : 'crosshair');
      if (hi && this.tool === 'hand') UI.hoverTip(hi, sx, sy); else UI.hoverTip(null);
    };
    const paintAt = (tx, ty) => {
      const r = this.brush === 3 ? 1 : 0;
      for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) {
        const res = this.paint(tx + a, ty + b, this.sel);
        if (res === 'stop') return false;
        if (res) { paintAct.tiles.push({ i: res.i, old: res.old }); paintAct.cost += res.cost; }
      }
      return true;
    };
    const line = (x0, y0, x1, y1, fn) => {
      const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx - dy;
      for (let n = 0; n < 200; n++) { if (fn(x0, y0) === false) return; if (x0 === x1 && y0 === y1) return; const e2 = err * 2; if (e2 > -dy) { err -= dy; x0 += sx; } if (e2 < dx) { err += dx; y0 += sy; } }
    };
    cv.addEventListener('contextmenu', e => e.preventDefault());
    cv.addEventListener('pointerdown', e => {
      Sound.init();
      if (this.demo || !this.st) return;
      cv.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      UI.hoverTip(null);
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: this.cam.tz, cx: (a[0] + b[0]) / 2, cy: (a[1] + b[1]) / 2 };
        if (paintAct) { this.finishPaint(paintAct); paintAct = null; }
        down = null; return;
      }
      if (e.button === 2) { if (this.tool !== 'hand') { this.setTool('hand'); Sound.sfx.close(); } else down = { x: e.clientX, y: e.clientY, cx: this.cam.x, cy: this.cam.y, panning: false, right: true }; return; }
      down = { x: e.clientX, y: e.clientY, cx: this.cam.x, cy: this.cam.y, panning: e.button === 1, consumed: false, collected: new Set() };
      updateHover(e.clientX, e.clientY);
      const b = this.hitBubble(e.clientX, e.clientY);
      if (b && !(this.tool === 'move' && this.carry)) { this.collect(b.it); down.consumed = true; down.collected.add(b.it); return; }
      if (this.hitGift(e.clientX, e.clientY)) { this.openGift(); down.consumed = true; return; }
      if (this.tool === 'paint' && e.button === 0 && !this.spaceDown) {
        paintAct = { type: 'paint', tiles: [], cost: 0 };
        lastPaintTile = [this.hover.x, this.hover.y];
        paintAt(this.hover.x, this.hover.y);
      }
    });
    cv.addEventListener('pointermove', e => {
      if (!this.st || this.demo) return;
      if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (pinch && ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]), cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2;
        this.cam.x += cx - pinch.cx; this.cam.y += cy - pinch.cy; pinch.cx = cx; pinch.cy = cy;
        this.zoomAnchor = [cx, cy]; this.cam.tz = clamp(pinch.z * d / pinch.d, 0.45, 2.6);
        return;
      }
      updateHover(e.clientX, e.clientY);
      if (!down) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (paintAct) {
        const [tx, ty] = [this.hover.x, this.hover.y];
        if (!lastPaintTile || tx !== lastPaintTile[0] || ty !== lastPaintTile[1]) {
          let ok = true;
          line(lastPaintTile[0], lastPaintTile[1], tx, ty, (x, y) => { if (!ok) return false; ok = paintAt(x, y); return ok; });
          lastPaintTile = [tx, ty];
          if (!ok) { this.finishPaint(paintAct); paintAct = null; }
        }
        return;
      }
      if (!down.panning && Math.hypot(dx, dy) > 6) down.panning = true;
      if (down.panning) {
        // en modo mano, arrastrar sobre burbujas también recoge
        if (this.tool === 'hand') { const b = this.hitBubble(e.clientX, e.clientY); if (b && !down.collected.has(b.it)) { down.collected.add(b.it); this.collect(b.it); down.swiped = true; } }
        if (!down.swiped || this.tool !== 'hand') { this.cam.x = down.cx + dx; this.cam.y = down.cy + dy; }
      }
    });
    const up = e => {
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinch = null;
      if (paintAct) { this.finishPaint(paintAct); paintAct = null; down = null; return; }
      if (!down || this.demo) { down = null; return; }
      const wasPan = down.panning || down.right, consumed = down.consumed; down = null;
      if (wasPan || consumed) return;
      const sx = e.clientX, sy = e.clientY;
      if (this.tool === 'hand') {
        const it = this.pickItem(sx, sy);
        if (it) { if (!this.collect(it)) { Sound.sfx.soft(); UI.showInfo(it); it.pulse = performance.now(); } }
        else UI.hideInfo();
      } else if (this.tool === 'build') {
        this.place(this.sel, this.hover.x, this.hover.y);
      } else if (this.tool === 'remove') {
        const it = this.pickItem(sx, sy);
        if (it) this.removeItem(it); else Sound.sfx.error();
      } else if (this.tool === 'move') {
        if (!this.carry) {
          const it = this.pickItem(sx, sy);
          if (it) { this.carry = it; this.flip = !!it.f; this.rebuildOccExcept(it); Sound.sfx.pickup(); UI.toolChanged(); }
          else Sound.sfx.error();
        } else {
          const it = this.carry; this.carry = null; this.rebuild();
          if (!this.moveItem(it, this.hover.x, this.hover.y)) { this.carry = it; this.rebuildOccExcept(it); }
          UI.toolChanged();
        }
      }
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', () => { this.hover.inside = false; this.hoverItem = null; UI.hoverTip(null); });
    cv.addEventListener('wheel', e => {
      e.preventDefault(); if (this.demo || !this.st) return;
      this.zoomAnchor = [e.clientX, e.clientY];
      this.cam.tz = clamp(this.cam.tz * Math.pow(1.0015, -e.deltaY), 0.45, 2.6);
    }, { passive: false });
    window.addEventListener('keydown', e => {
      if (!this.st || this.demo || UI.modalOpen() || e.target.tagName === 'INPUT') return;
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { this.keys.add(k); e.preventDefault(); }
      if (k === ' ') this.spaceDown = true;
      if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); this.undo(); return; }
      if (k === 'r') { this.flip = !this.flip; Sound.sfx.rotate(); }
      if (k === 'escape') { if (this.photoMode) UI.exitPhoto(); else if (this.tool !== 'hand') { this.setTool('hand'); Sound.sfx.close(); } else UI.hideInfo(); }
      if (k === 'h' || k === '1') { this.setTool('hand'); Sound.sfx.click(); }
      if (k === 'm' || k === '2') { this.setTool('move'); Sound.sfx.click(); }
      if (k === 'x' || k === '3' || k === 'delete') { this.setTool('remove'); Sound.sfx.click(); }
      if (k === 'b') { this.brush = this.brush === 1 ? 3 : 1; Sound.sfx.click(); UI.toolChanged(); }
      if (k === '+' || k === '=') { this.zoomAnchor = null; this.cam.tz = clamp(this.cam.tz * 1.2, 0.45, 2.6); }
      if (k === '-') { this.zoomAnchor = null; this.cam.tz = clamp(this.cam.tz / 1.2, 0.45, 2.6); }
      if (k === 'c') this.collectAll();
      if (k === 'p') UI.enterPhoto();
    });
    window.addEventListener('keyup', e => { this.keys.delete(e.key.toLowerCase()); if (e.key === ' ') this.spaceDown = false; });
    window.addEventListener('blur', () => this.keys.clear());
  },
  rebuildOccExcept(it) {
    const d = ITEM[it.id];
    for (let a = 0; a < d.w; a++) for (let b = 0; b < d.h; b++) { const i = (it.y + b) * WORLD + it.x + a; if (this.occ[i] === it.uid) this.occ[i] = 0; }
  },
  finishPaint(act) {
    if (act.tiles.length) { this.undoStack.push(act); this.afterChange(true); }
  },
  zoomBy(f) { this.zoomAnchor = null; this.cam.tz = clamp(this.cam.tz * f, 0.45, 2.6); },
  centerView() {
    const C = WORLD / 2, [wx, wy] = this.iso(C, C);
    this.cam.tz = this.W < 700 ? 0.8 : 1.1; this.zoomAnchor = null;
    const z = this.cam.z;
    this.cam.x = this.W / 2 - wx * z; this.cam.y = this.H / 2 - wy * z - 30;
  },
  photo() {
    this.render(true);
    const cv = document.createElement('canvas'); cv.width = this.cv.width; cv.height = this.cv.height;
    const c = cv.getContext('2d'); c.drawImage(this.cv, 0, 0);
    const s = this.dpr;
    c.font = `700 ${22 * s}px Fredoka, sans-serif`; c.textAlign = 'right'; c.textBaseline = 'bottom';
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillText('Isleta · ' + this.st.island, cv.width - 18 * s + 2 * s, cv.height - 16 * s + 2 * s);
    c.fillStyle = '#fff'; c.fillText('Isleta · ' + this.st.island, cv.width - 18 * s, cv.height - 16 * s);
    const a = document.createElement('a');
    a.download = 'isleta-' + this.st.island.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '-') + '.png';
    a.href = cv.toDataURL('image/png'); a.click();
    this.st.stats.photos++;
    this.checkProgress();
  },
};
let WATER_NB = 15;
