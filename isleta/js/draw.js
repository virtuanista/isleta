'use strict';
/* =========================================================
   ISLETA · Primitivas de dibujo isométrico y sprites
   ========================================================= */
const ENV = { t: 0, night: 0, tint: '#ffffff', phase: 0.2 };
const LIGHTS = [];
const CUR = { ox: 0, oy: 0, flip: false, sc: 1, collect: false }; // transformación del sprite actual (para luces)

/* ---------- color ---------- */
const _rgbCache = new Map(), _shadeCache = new Map();
function hexToRgb(h) {
  let c = _rgbCache.get(h); if (c) return c;
  let s = h.replace('#', ''); if (s.length === 3) s = s.split('').map(x => x + x).join('');
  const n = parseInt(s, 16); c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; _rgbCache.set(h, c); return c;
}
function shade(hex, amt) {
  const k = hex + '|' + amt; let c = _shadeCache.get(k); if (c) return c;
  const [r, g, b] = hexToRgb(hex);
  const f = v => amt < 0 ? Math.round(v * (1 + amt)) : Math.round(v + (255 - v) * amt);
  c = `rgb(${f(r)},${f(g)},${f(b)})`; _shadeCache.set(k, c); return c;
}
function mixHex(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  const r = Math.round(lerp(A[0], B[0], t)), g = Math.round(lerp(A[1], B[1], t)), bl = Math.round(lerp(A[2], B[2], t));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
}
function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
const _winCache = [];
function winCol() {
  const q = Math.round(ENV.night * 10);
  return _winCache[q] || (_winCache[q] = mixHex('#8cc4e8', '#ffd76e', q / 10));
}

/* ---------- geometría ---------- */
// punto isométrico: x,y en casillas relativas, z en px hacia arriba
function P(cx, cy, x, y, z = 0) { return [cx + (x - y) * 32, cy + (x + y) * 16 - z]; }
function poly(c, pts, fill, stroke, lw) {
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
}
function corners(cx, cy, sx, sy) {
  return {
    T: [cx + (sy - sx) * 32, cy - (sx + sy) * 16],
    R: [cx + (sx + sy) * 32, cy + (sx - sy) * 16],
    B: [cx + (sx - sy) * 32, cy + (sx + sy) * 16],
    L: [cx - (sx + sy) * 32, cy + (sy - sx) * 16],
  };
}
// caja isométrica. Devuelve info de caras
function B3(c, cx, cy, sx, sy, h, col, opts = {}) {
  const k = corners(cx, cy, sx, sy);
  const { T, R, B, L } = k;
  poly(c, [L[0], L[1], B[0], B[1], B[0], B[1] - h, L[0], L[1] - h], opts.left || col);
  poly(c, [B[0], B[1], R[0], R[1], R[0], R[1] - h, B[0], B[1] - h], opts.right || shade(col, -0.2));
  if (!opts.noTop) poly(c, [T[0], T[1] - h, R[0], R[1] - h, B[0], B[1] - h, L[0], L[1] - h], opts.top || shade(col, 0.16));
  if (opts.edge !== false) {
    c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(B[0], B[1]); c.lineTo(B[0], B[1] - h); c.stroke();
  }
  return { cx, cy, sx, sy, h, col, ...k };
}
// cuadrilátero sobre una cara (L o R) en coordenadas s (0..1) y v (px)
function fq(c, f, side, s0, s1, v0, v1, fill) {
  const A = side === 'L' ? f.L : f.B, Bp = side === 'L' ? f.B : f.R;
  const p = s => [A[0] + (Bp[0] - A[0]) * s, A[1] + (Bp[1] - A[1]) * s];
  const a = p(s0), b = p(s1);
  poly(c, [a[0], a[1] - v0, b[0], b[1] - v0, b[0], b[1] - v1, a[0], a[1] - v1], fill);
}
function fline(c, f, side, s0, s1, v, col, lw = 1) {
  const A = side === 'L' ? f.L : f.B, Bp = side === 'L' ? f.B : f.R;
  c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
  c.moveTo(A[0] + (Bp[0] - A[0]) * s0, A[1] + (Bp[1] - A[1]) * s0 - v);
  c.lineTo(A[0] + (Bp[0] - A[0]) * s1, A[1] + (Bp[1] - A[1]) * s1 - v); c.stroke();
}
function win(c, f, side, s0, s1, v0, v1, frame = '#ffffff') {
  fq(c, f, side, s0 - 0.03, s1 + 0.03, v0 - 1.2, v1 + 1.2, frame);
  fq(c, f, side, s0, s1, v0, v1, winCol());
  // brillo
  fq(c, f, side, s0, s0 + (s1 - s0) * 0.35, v0 + (v1 - v0) * 0.45, v1, 'rgba(255,255,255,0.35)');
  const sm = (s0 + s1) / 2;
  fq(c, f, side, sm - 0.008, sm + 0.008, v0, v1, frame);
}
function gable(c, f, rh, col, axis = 'y', ov = 1.18, wall) {
  const y0 = f.cy - f.h;
  const g = corners(f.cx, y0, f.sx * ov, f.sy * ov), w = corners(f.cx, y0, f.sx, f.sy);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - rh];
  const ol = shade(col, -0.35);
  if (axis === 'y') {
    const r1 = mid(g.T, g.R), r2 = mid(g.L, g.B), wr = mid(w.L, w.B);
    poly(c, [...g.T, ...r1, ...r2, ...g.L], shade(col, 0.1), ol);
    poly(c, [...w.L, ...w.B, ...wr], wall || shade(f.col, 0.06));
    poly(c, [...r1, ...g.R, ...g.B, ...r2], shade(col, -0.1), ol);
    c.strokeStyle = shade(col, 0.35); c.lineWidth = 1.5; c.beginPath(); c.moveTo(...r1); c.lineTo(...r2); c.stroke();
    return { r1, r2 };
  } else {
    const r1 = mid(g.T, g.L), r2 = mid(g.R, g.B), wr = mid(w.R, w.B);
    poly(c, [...g.T, ...g.R, ...r2, ...r1], shade(col, -0.18), ol);
    poly(c, [...w.B, ...w.R, ...wr], wall || shade(f.col, -0.2));
    poly(c, [...r1, ...r2, ...g.B, ...g.L], shade(col, 0.04), ol);
    c.strokeStyle = shade(col, 0.35); c.lineWidth = 1.5; c.beginPath(); c.moveTo(...r1); c.lineTo(...r2); c.stroke();
    return { r1, r2 };
  }
}
function hip(c, f, rh, col, ov = 1.15) {
  const y0 = f.cy - f.h, g = corners(f.cx, y0, f.sx * ov, f.sy * ov), ap = [f.cx, y0 - rh];
  const ol = shade(col, -0.35);
  poly(c, [...g.L, ...g.T, ...ap], shade(col, 0.15));
  poly(c, [...g.T, ...g.R, ...ap], shade(col, -0.05));
  poly(c, [...g.L, ...g.B, ...ap], shade(col, 0.06), ol);
  poly(c, [...g.B, ...g.R, ...ap], shade(col, -0.16), ol);
  return ap;
}
function sh(c, x, y, rx, ry, a = 0.2) {
  c.fillStyle = `rgba(20,40,30,${a})`; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
}
function circ(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function ell(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); c.fill(); }
function blob(c, x, y, r, col) {
  circ(c, x, y, r, shade(col, -0.14));
  circ(c, x - r * 0.14, y - r * 0.16, r * 0.84, col);
  circ(c, x - r * 0.38, y - r * 0.42, r * 0.32, shade(col, 0.22));
}
function cyl(c, x, y, rx, ry, h, col, top) {
  const g = c.createLinearGradient(x - rx, 0, x + rx, 0);
  g.addColorStop(0, shade(col, 0.08)); g.addColorStop(0.45, col); g.addColorStop(1, shade(col, -0.28));
  c.beginPath(); c.moveTo(x + rx, y); c.ellipse(x, y, rx, ry, 0, 0, Math.PI); c.lineTo(x - rx, y - h);
  c.ellipse(x, y - h, rx, ry, 0, Math.PI, Math.PI * 2); c.closePath(); c.fillStyle = g; c.fill();
  ell(c, x, y - h, rx, ry, top || shade(col, 0.14));
}
function tower(c, x, y, rb, rt, h, col) {
  const g = c.createLinearGradient(x - rb, 0, x + rb, 0);
  g.addColorStop(0, shade(col, 0.06)); g.addColorStop(0.45, col); g.addColorStop(1, shade(col, -0.26));
  c.beginPath(); c.moveTo(x - rt, y - h); c.lineTo(x - rb, y); c.ellipse(x, y, rb, rb * 0.5, 0, Math.PI, 0, true);
  c.lineTo(x + rt, y - h); c.ellipse(x, y - h, rt, rt * 0.5, 0, 0, Math.PI, true); c.closePath();
  c.fillStyle = g; c.fill();
}
function towerPath(c, x, y, rb, rt, h) {
  c.beginPath(); c.moveTo(x - rt, y - h); c.lineTo(x - rb, y); c.ellipse(x, y, rb, rb * 0.5, 0, Math.PI, 0, true);
  c.lineTo(x + rt, y - h); c.ellipse(x, y - h, rt, rt * 0.5, 0, 0, Math.PI, true); c.closePath();
}
function cone(c, x, y, r, h, col) {
  const g = c.createLinearGradient(x - r, 0, x + r, 0);
  g.addColorStop(0, shade(col, 0.12)); g.addColorStop(0.5, col); g.addColorStop(1, shade(col, -0.3));
  c.beginPath(); c.moveTo(x - r, y); c.ellipse(x, y, r, r * 0.5, 0, Math.PI, 0, true); c.lineTo(x, y - h); c.closePath();
  c.fillStyle = g; c.fill();
}
function striped(c, cx, cy, sx, sy, z, n, a, b, val = 4) {
  const pt = (u, v) => P(cx, cy, -sx + 2 * sx * u, -sy + 2 * sy * v, z);
  for (let k = 0; k < n; k++) {
    const u0 = k / n, u1 = (k + 1) / n, col = k % 2 ? b : a;
    poly(c, [...pt(u0, 0), ...pt(u1, 0), ...pt(u1, 1), ...pt(u0, 1)], col);
    // faldón frontal izquierdo
    const p0 = pt(u0, 1), p1 = pt(u1, 1);
    poly(c, [...p0, ...p1, p1[0], p1[1] + val, p0[0], p0[1] + val], shade(col, -0.12));
  }
  for (let k = 0; k < n; k++) {
    const v0 = k / n, v1 = (k + 1) / n, col = k % 2 ? b : a;
    const p0 = pt(1, v0), p1 = pt(1, v1);
    poly(c, [...p0, ...p1, p1[0], p1[1] + val, p0[0], p0[1] + val], shade(col, -0.25));
  }
}
function light(x, y, r, col, a = 1, type) {
  if (!CUR.collect) return;
  LIGHTS.push({ x: CUR.ox + (CUR.flip ? -x : x) * CUR.sc, y: CUR.oy + y * CUR.sc, r: r * CUR.sc, col, a, type });
}
function line(c, x0, y0, x1, y1, col, lw = 1) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
function tri(c, x, yb, hw, h, col) {
  poly(c, [x - hw, yb, x, yb + hw * 0.22, x, yb - h], col);
  poly(c, [x, yb + hw * 0.22, x + hw, yb, x, yb - h], shade(col, -0.2));
}

/* =========================================================
   SPRITES — origen (0,0) en el centro de la huella
   ========================================================= */
const SPR = {
  /* ---------------- Viviendas ---------------- */
  cabin(c, it) {
    sh(c, 0, 3, 27, 13);
    const f = B3(c, 0, 0, 0.3, 0.3, 18, '#c98b55');
    for (const v of [5, 10, 15]) { fline(c, f, 'L', 0, 1, v, 'rgba(90,50,20,.25)'); fline(c, f, 'R', 0, 1, v, 'rgba(60,30,10,.25)'); }
    fq(c, f, 'R', 0.36, 0.64, 0, 12.5, '#6e4226');
    circ(c, ...P(0, 0, 0.3, -0.03, 6), 0.9, '#ffd36b');
    win(c, f, 'L', 0.3, 0.7, 6, 13, '#f5e6c8');
    B3(c, 8, -26, 0.05, 0.05, 12, '#8d6e63', { edge: false });
    gable(c, f, 13, '#c4553c', 'y');
  },
  cottage(c, it) {
    sh(c, 0, 3, 27, 13);
    const f = B3(c, 0, 0, 0.3, 0.3, 20, '#f4eee2');
    win(c, f, 'L', 0.14, 0.42, 8, 15, '#7aa7e6'); win(c, f, 'L', 0.58, 0.86, 8, 15, '#7aa7e6');
    fq(c, f, 'L', 0.1, 0.9, 4.5, 7.5, '#b5653a');
    for (let i = 0; i < 7; i++) { const s = 0.15 + i * 0.11; const a = f.L, b = f.B; circ(c, a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s - 8, 1.6, i % 2 ? '#ff6b8b' : '#ffd23f'); }
    fq(c, f, 'R', 0.36, 0.64, 0, 14, '#4f7cc9');
    fq(c, f, 'R', 0.4, 0.6, 9, 12.5, winCol());
    gable(c, f, 14, '#4f86e0', 'x');
  },
  farmhouse(c, it) {
    sh(c, 0, 3, 30, 14);
    const f = B3(c, 0, 0, 0.36, 0.31, 32, '#f3d07c');
    fline(c, f, 'L', 0, 1, 16, 'rgba(120,80,20,.3)', 1.5); fline(c, f, 'R', 0, 1, 16, 'rgba(120,80,20,.3)', 1.5);
    for (const s of [0.12, 0.42, 0.72]) win(c, f, 'L', s, s + 0.18, 20, 27, '#ffffff');
    for (const s of [0.18, 0.62]) win(c, f, 'L', s, s + 0.2, 5, 12, '#ffffff');
    fq(c, f, 'R', 0.4, 0.62, 0, 13, '#8a5a3c');
    win(c, f, 'R', 0.12, 0.3, 5, 12); win(c, f, 'R', 0.7, 0.88, 5, 12);
    win(c, f, 'R', 0.2, 0.4, 20, 27); win(c, f, 'R', 0.6, 0.8, 20, 27);
    B3(c, -9, -50, 0.05, 0.05, 14, '#9c6b4e', { edge: false });
    gable(c, f, 15, '#5ea65a', 'y');
  },
  treehouse(c, it) {
    const t = ENV.t, sw = Math.sin(t * 1.2 + it.seed) * 1.2;
    sh(c, 0, 3, 28, 13);
    blob(c, -14 + sw, -60, 14, '#4ea544'); blob(c, 14 + sw, -62, 14, '#4ea544'); blob(c, sw, -74, 15, '#56b04a');
    poly(c, [-5, 0, 5, 0, 4, -40, -4, -40], '#8a5a3c'); poly(c, [0, 0, 5, 0, 4, -40, 0, -40], '#6f452d');
    // escalera
    line(c, 8, 2, 8, -34, '#c69a6a', 1.5); line(c, 13, 0, 13, -34, '#c69a6a', 1.5);
    for (let y = -2; y > -34; y -= 6) line(c, 8, y, 13, y - 1, '#c69a6a', 1.5);
    B3(c, 0, -34, 0.3, 0.3, 3, '#a0714c');
    const f = B3(c, 0, -37, 0.2, 0.2, 13, '#e7b07a');
    win(c, f, 'L', 0.3, 0.7, 4, 10, '#fff2d9');
    fq(c, f, 'R', 0.35, 0.65, 0, 9, '#7a4a2a');
    hip(c, f, 13, '#d4553f');
    blob(c, -18 + sw, -48, 9, '#5cb046'); blob(c, 20 + sw, -46, 8, '#5cb046');
  },
  mansion(c, it) {
    sh(c, 0, 5, 58, 28);
    const f = B3(c, 0, 0, 0.7, 0.66, 36, '#f6d3dc');
    fq(c, f, 'L', 0, 1, 0, 4, '#e4b9c5'); fq(c, f, 'R', 0, 1, 0, 4, '#d4a6b3');
    for (const s of [0.08, 0.3, 0.52, 0.74]) { win(c, f, 'L', s, s + 0.14, 8, 16, '#ffffff'); win(c, f, 'L', s, s + 0.14, 22, 30, '#ffffff'); }
    for (const s of [0.07, 0.24, 0.66, 0.83]) { win(c, f, 'R', s, s + 0.11, 8, 16); win(c, f, 'R', s, s + 0.11, 22, 30); }
    fq(c, f, 'R', 0.4, 0.6, 0, 19, '#ffffff'); fq(c, f, 'R', 0.43, 0.57, 0, 16, '#7a4a8c');
    // columnas
    for (const s of [0.36, 0.64]) fq(c, f, 'R', s - 0.015, s + 0.015, 0, 24, '#ffffff');
    fq(c, f, 'R', 0.33, 0.67, 22, 26, '#ffffff');
    const ap = hip(c, f, 30, '#8f66cc', 1.1);
    B3(c, -14, -52, 0.06, 0.06, 14, '#c49aa8', { edge: false });
    circ(c, ap[0], ap[1] - 3, 3, '#ffd23f');
  },
  /* ---------------- Negocios ---------------- */
  lemonade(c, it) {
    sh(c, 0, 3, 26, 12);
    const f = B3(c, 0, 2, 0.26, 0.22, 13, '#fff6d4');
    for (let i = 0; i < 6; i++) fq(c, f, 'L', i / 6, i / 6 + 0.08, 0, 13, '#ffd23f');
    for (let i = 0; i < 6; i++) fq(c, f, 'R', i / 6, i / 6 + 0.08, 0, 13, '#f2c230');
    const posts = [P(0, 2, -0.24, -0.2), P(0, 2, 0.24, -0.2), P(0, 2, 0.24, 0.2), P(0, 2, -0.24, 0.2)];
    posts.forEach(p => line(c, p[0], p[1] - 13, p[0], p[1] - 28, '#c99a5a', 2));
    // jarra y vasos
    cyl(c, -4, -12, 3, 1.5, 7, 'rgba(255,240,150,.85)'); ell(c, -4, -18, 3, 1.5, '#fff59d');
    cyl(c, 4, -9, 1.6, 0.8, 4, '#fff59d');
    striped(c, 0, 2, 0.32, 0.29, 30, 6, '#ffd23f', '#ffffff');
    // limón
    ell(c, 0, -46, 7, 5.5, '#ffe14d'); ell(c, -2, -48, 2.5, 1.5, '#fff7b0'); line(c, 0, -51, 2, -54, '#5fae3c', 2);
  },
  icecream(c, it) {
    sh(c, 0, 3, 26, 12);
    const f = B3(c, 0, 0, 0.28, 0.28, 22, '#ffd6e6');
    for (let i = 0; i < 5; i++) fq(c, f, 'L', i / 5 + 0.05, i / 5 + 0.12, 0, 4, '#ff9ec4');
    win(c, f, 'L', 0.2, 0.8, 9, 17, '#ffffff');
    fq(c, f, 'R', 0.15, 0.85, 8, 11, '#ffffff');
    fq(c, f, 'R', 0.4, 0.62, 0, 13, '#a66bbd');
    striped(c, 0, 0, 0.33, 0.33, 22, 6, '#7fe0c3', '#ffffff', 5);
    // cucurucho gigante
    poly(c, [-6, -32, 6, -32, 0, -14 - 6], '#e0a45a'); line(c, -3, -28, 3, -24, '#b87a36'); line(c, 3, -28, -2, -23, '#b87a36');
    blob(c, 0, -37, 7, '#ff8fb8'); blob(c, 3, -43, 5, '#fff1c9'); circ(c, 4, -49, 2, '#e53950');
  },
  bakery(c, it) {
    sh(c, 0, 3, 28, 13);
    const f = B3(c, 0, 0, 0.32, 0.3, 22, '#e69b6a');
    for (let v = 4; v < 22; v += 4) { fline(c, f, 'L', 0, 1, v, 'rgba(120,50,20,.25)'); fline(c, f, 'R', 0, 1, v, 'rgba(90,30,10,.25)'); }
    win(c, f, 'R', 0.1, 0.45, 4, 14, '#f7e7c6');
    fq(c, f, 'R', 0.56, 0.84, 0, 14, '#7a4320');
    // toldo sobre la cara derecha
    const n = 6;
    for (let i = 0; i < n; i++) {
      const s0 = i / n, s1 = (i + 1) / n, col = i % 2 ? '#ffffff' : '#e5484d';
      const A = f.B, B = f.R, pt = s => [A[0] + (B[0] - A[0]) * s, A[1] + (B[1] - A[1]) * s - 18];
      const a = pt(s0), b = pt(s1);
      poly(c, [...a, ...b, b[0] + 6, b[1] + 6, a[0] + 6, a[1] + 6], col);
    }
    // cartel de pan
    fq(c, f, 'L', 0.25, 0.75, 8, 17, '#7a4320');
    const a = f.L, b = f.B, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - 12.5;
    ell(c, mx, my, 6, 3, '#f2c27b'); line(c, mx - 3, my - 1, mx - 1, my + 1, '#b87a36'); line(c, mx + 1, my - 1, mx + 3, my + 1, '#b87a36');
    B3(c, 10, -32, 0.05, 0.05, 14, '#a1887f', { edge: false });
    gable(c, f, 13, '#8b4a2b', 'y');
  },
  cafe(c, it) {
    sh(c, 0, 3, 27, 13);
    const f = B3(c, 0, 0, 0.31, 0.31, 21, '#7fcdbb');
    win(c, f, 'L', 0.12, 0.5, 5, 14); win(c, f, 'L', 0.58, 0.88, 5, 14);
    fq(c, f, 'R', 0.36, 0.62, 0, 14, '#3f6f68');
    win(c, f, 'R', 0.7, 0.9, 5, 14);
    const n = 6;
    for (let i = 0; i < n; i++) {
      const s0 = i / n, s1 = (i + 1) / n, col = i % 2 ? '#ffffff' : '#ff8fa3';
      const A = f.L, B = f.B, pt = s => [A[0] + (B[0] - A[0]) * s, A[1] + (B[1] - A[1]) * s - 17];
      const a = pt(s0), b = pt(s1);
      poly(c, [...a, ...b, b[0] - 5, b[1] + 6, a[0] - 5, a[1] + 6], col);
    }
    // parapeto
    B3(c, 0, -21, 0.31, 0.31, 3, '#6bb9a8', { edge: false });
    B3(c, 0, -21, 0.25, 0.25, 0.1, '#5aa595', { edge: false });
    // taza en el tejado
    const t = ENV.t;
    poly(c, [-7, -36, 7, -36, 5, -26, -5, -26], '#ffffff'); ell(c, 0, -36, 7, 2.5, '#6d4c41');
    c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.arc(8, -31, 3, -1.4, 1.4); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5;
    for (let i = 0; i < 2; i++) { c.beginPath(); const ox = -2 + i * 4; c.moveTo(ox, -39); c.quadraticCurveTo(ox + 3 * Math.sin(t * 3 + i), -44, ox, -49); c.stroke(); }
  },
  windmill(c, it) {
    const t = ENV.t;
    sh(c, 0, 5, 56, 26);
    B3(c, 0, 0, 0.55, 0.55, 8, '#c2b49c');
    tower(c, 0, -8, 25, 15, 64, '#f2e8d6');
    c.save(); towerPath(c, 0, -8, 25, 15, 64); c.clip();
    for (let y = -14; y > -70; y -= 10) { c.strokeStyle = 'rgba(150,120,90,.18)'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, y, 24, 10, 0, 0.1, Math.PI - 0.1); c.stroke(); }
    c.restore();
    // puerta y ventanas
    poly(c, [-5, -6, 5, -6, 5, -20, 0, -24, -5, -20], '#7a4a2a');
    ell(c, -6, -44, 3, 4, winCol()); ell(c, 5, -56, 2.5, 3.5, winCol());
    cone(c, 0, -72, 19, 26, '#c4553c');
    // aspas
    const hx = 9, hy = -66, a0 = t * 1.1 + it.seed;
    c.save(); c.translate(hx, hy); c.transform(0.82, -0.3, 0, 1, 0, 0);
    for (let k = 0; k < 4; k++) {
      c.save(); c.rotate(a0 + k * Math.PI / 2);
      c.fillStyle = '#8a5a3c'; c.fillRect(-1.5, 0, 3, 46);
      c.fillStyle = 'rgba(255,250,235,.92)'; c.fillRect(1.5, 10, 10, 34);
      c.strokeStyle = 'rgba(138,90,60,.7)'; c.lineWidth = 1;
      for (let y = 14; y < 44; y += 6) { c.beginPath(); c.moveTo(1.5, y); c.lineTo(11.5, y); c.stroke(); }
      c.restore();
    }
    circ(c, 0, 0, 4, '#5d3b26');
    c.restore();
  },
  market(c, it) {
    sh(c, 0, 5, 60, 28);
    const stalls = [[-0.45, -0.45, '#ff6b6b'], [0.5, -0.45, '#4dabf7'], [-0.45, 0.5, '#ffd43b'], [0.5, 0.5, '#69db7c']];
    const fruits = ['#ff6b6b', '#ffa94d', '#a9e34b', '#ffe066', '#da77f2'];
    stalls.forEach(([x, y, col], i) => {
      const [sx, sy] = P(0, 0, x, y);
      sh(c, sx, sy + 2, 20, 9, 0.12);
      const f = B3(c, sx, sy, 0.24, 0.17, 11, '#c8935a');
      fq(c, f, 'L', 0, 1, 8, 11, '#a8743f');
      for (let k = 0; k < 6; k++) { const p = P(sx, sy, -0.16 + k * 0.065, 0.02 * (k % 2), 13); circ(c, p[0], p[1], 2.6, fruits[(k + i) % 5]); }
      [P(sx, sy, -0.22, -0.15), P(sx, sy, 0.22, -0.15), P(sx, sy, 0.22, 0.15), P(sx, sy, -0.22, 0.15)].forEach(p => line(c, p[0], p[1] - 11, p[0], p[1] - 26, '#8a5a3c', 1.6));
      striped(c, sx, sy, 0.28, 0.22, 28, 5, col, '#ffffff', 3);
    });
  },
  lighthouse(c, it) {
    sh(c, 0, 3, 26, 12);
    blob(c, -12, -2, 9, '#9aa0a6'); blob(c, 12, 0, 8, '#8d939a'); blob(c, 2, 4, 7, '#a5abb1');
    tower(c, 0, -4, 15, 9, 66, '#fbfbfb');
    c.save(); towerPath(c, 0, -4, 15, 9, 66); c.clip();
    c.fillStyle = '#e5484d'; for (const y of [-18, -42]) c.fillRect(-20, y - 11, 40, 11);
    c.restore();
    ell(c, 2, -38, 2, 3, winCol());
    cyl(c, 0, -70, 12, 6, 3, '#37474f');
    cyl(c, 0, -73, 7, 3.5, 10, ENV.night > 0.3 ? '#fff3b0' : '#bfe6ff', '#ffe082');
    cone(c, 0, -83, 9, 12, '#e5484d');
    circ(c, 0, -96, 1.8, '#37474f');
    if (ENV.night > 0.05) { light(0, -78, 120, '#fff3b0', 1); light(0, -78, 0, '#fff3b0', 1, 'beam'); }
  },
  observatory(c, it) {
    const t = ENV.t;
    sh(c, 0, 5, 58, 28);
    const f = B3(c, 0, 0, 0.62, 0.62, 28, '#e9e4f2');
    for (const s of [0.15, 0.45, 0.75]) win(c, f, 'L', s, s + 0.12, 10, 20, '#ffffff');
    fq(c, f, 'R', 0.42, 0.58, 0, 16, '#5a4b8a');
    B3(c, 0, -28, 0.66, 0.66, 3, '#d3cce6', { edge: false });
    // cúpula
    const g = c.createLinearGradient(-34, 0, 34, 0); g.addColorStop(0, '#b9c6e8'); g.addColorStop(0.5, '#8fa3d6'); g.addColorStop(1, '#5d6fa6');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, -31, 34, 17, 0, 0, Math.PI); c.ellipse(0, -31, 34, 40, 0, Math.PI, 0); c.fill();
    poly(c, [-4, -69, 4, -69, 5, -34, -5, -34], '#2f3b66');
    // telescopio
    c.save(); c.translate(2, -58); c.rotate(-0.7 + Math.sin(t * 0.2) * 0.1); c.fillStyle = '#ffd23f'; c.fillRect(-3, -3, 26, 6); c.fillStyle = '#c99a1e'; c.fillRect(20, -4, 5, 8); c.restore();
    if (ENV.night > 0.3) for (let i = 0; i < 3; i++) { const a = Math.sin(t * 3 + i * 2) * 0.5 + 0.5; circ(c, -20 + i * 18, -80 - i * 6, 1.5 + a, `rgba(255,255,200,${a})`); }
  },
  /* ---------------- Naturaleza ---------------- */
  oak(c, it) {
    const s = 0.9 + rnd(it.seed, 1) * 0.25, sw = Math.sin(ENV.t * 1.3 + it.seed) * 1.6;
    const cols = ['#5cb046', '#63ba4a', '#54a742'], col = cols[Math.floor(rnd(it.seed, 2) * 3)];
    sh(c, 0, 2, 17 * s, 8 * s);
    poly(c, [-3.5, 0, 3.5, 0, 2.5, -20 * s, -2.5, -20 * s], '#8a5a3c'); poly(c, [0, 0, 3.5, 0, 2.5, -20 * s, 0, -20 * s], '#6f452d');
    blob(c, -9 * s + sw * 0.7, -22 * s, 10 * s, col); blob(c, 9 * s + sw * 0.7, -23 * s, 10 * s, col);
    blob(c, sw, -30 * s, 13 * s, col); blob(c, 2 * s + sw * 1.2, -40 * s, 9 * s, col);
    if (rnd(it.seed, 3) > 0.6) for (let i = 0; i < 3; i++) circ(c, (-6 + i * 6) * s + sw, (-26 - (i % 2) * 8) * s, 1.8, '#ff6b6b');
  },
  pine(c, it) {
    const s = 0.9 + rnd(it.seed, 1) * 0.25, sw = Math.sin(ENV.t * 1.1 + it.seed) * 1.2;
    sh(c, 0, 2, 15 * s, 7 * s);
    poly(c, [-2.5, 0, 2.5, 0, 2, -12 * s, -2, -12 * s], '#7a4b33');
    tri(c, sw * 0.4, -8 * s, 17 * s, 20 * s, '#3d9a5f');
    tri(c, sw * 0.7, -19 * s, 13.5 * s, 18 * s, '#44a668');
    tri(c, sw, -30 * s, 10 * s, 16 * s, '#4cb272');
    if (ENV.night < 0.2 && rnd(it.seed, 4) > 0.85) circ(c, sw, -46 * s, 2, '#ffd23f');
  },
  bush(c, it) {
    sh(c, 0, 2, 15, 7);
    const col = rnd(it.seed, 1) > 0.5 ? '#66b94a' : '#5aae4a';
    blob(c, -7, -6, 8, col); blob(c, 7, -6, 8, col); blob(c, 0, -11, 9, col);
    if (rnd(it.seed, 2) > 0.4) for (let i = 0; i < 4; i++) circ(c, -7 + rnd(it.seed, 10 + i) * 14, -4 - rnd(it.seed, 20 + i) * 12, 1.7, rnd(it.seed, 5) > 0.5 ? '#e53950' : '#7b5cff');
  },
  tulips(c, it) {
    const pal = ['#ff6b8b', '#ffd23f', '#9b7bff', '#ff9f43', '#ffffff', '#ff4d6d'];
    const pts = [];
    for (let i = 0; i < 9; i++) {
      const a = rnd(it.seed, i * 3) * Math.PI * 2, r = Math.sqrt(rnd(it.seed, i * 3 + 1));
      pts.push([Math.cos(a) * r * 17, Math.sin(a) * r * 8, pal[Math.floor(rnd(it.seed, i * 3 + 2) * pal.length)]]);
    }
    pts.sort((a, b) => a[1] - b[1]);
    ell(c, 0, 1, 20, 9, 'rgba(60,120,40,.25)');
    const sw = Math.sin(ENV.t * 2 + it.seed);
    for (const [x, y, col] of pts) {
      line(c, x, y, x + sw, y - 9, '#3f8f3a', 1.4);
      ell(c, x - 2, y - 3, 2.5, 1.2, '#4caf50');
      circ(c, x + sw, y - 10, 3, col); circ(c, x + sw - 0.8, y - 11, 1, 'rgba(255,255,255,.6)');
    }
  },
  rock(c, it) {
    sh(c, 0, 3, 16, 7);
    const s = 0.85 + rnd(it.seed, 1) * 0.3;
    c.save(); c.scale(s, s);
    poly(c, [-14, 2, -12, -8, -4, -15, 6, -13, 13, -6, 14, 2, 4, 7, -8, 6], '#9aa0a6');
    poly(c, [-12, -8, -4, -15, 6, -13, 13, -6, 2, -5, -6, -3], '#b8bec4');
    poly(c, [-4, -15, 6, -13, 3, -10, -5, -11], '#7fbf5a');
    poly(c, [8, 4, 10, -1, 16, -2, 19, 3, 14, 7], '#8b9197');
    c.restore();
  },
  palm(c, it) {
    const t = ENV.t, sw = Math.sin(t * 1.2 + it.seed) * 2;
    sh(c, 2, 2, 18, 8);
    let x = 0, y = 0;
    for (let i = 0; i < 9; i++) {
      x = Math.sin(i * 0.22) * 9 + sw * i / 9; y = -i * 6.6;
      ell(c, x, y, 4.2 - i * 0.12, 2.6, i % 2 ? '#b98a5a' : '#a77a4c');
    }
    const tx = x, ty = y - 2;
    const leaves = [[-2.6, '#3e9b45'], [-0.3, '#3e9b45'], [-1.6, '#4caf50'], [-3.4, '#4caf50'], [0.4, '#57bb5c'], [-1.1, '#57bb5c']];
    for (const [a0, col] of leaves) {
      const a = a0 + Math.sin(t * 1.5 + a0 + it.seed) * 0.06;
      const ex = tx + Math.cos(a) * 26, ey = ty + Math.sin(a) * 10 + 10;
      c.fillStyle = col; c.beginPath(); c.moveTo(tx, ty);
      c.quadraticCurveTo(tx + Math.cos(a) * 14, ty + Math.sin(a) * 6 - 10, ex, ey);
      c.quadraticCurveTo(tx + Math.cos(a) * 12, ty + Math.sin(a) * 5 - 2, tx, ty); c.fill();
    }
    circ(c, tx - 2, ty + 2, 2.6, '#7a4b2b'); circ(c, tx + 2.5, ty + 3, 2.6, '#6b3f22'); circ(c, tx, ty + 5, 2.4, '#7a4b2b');
  },
  sunflower(c, it) {
    const sw = Math.sin(ENV.t * 1.6 + it.seed) * 1.2;
    sh(c, 0, 2, 14, 6);
    const st = [[-8, 0, 24], [2, -3, 30], [9, 2, 20]];
    for (const [x, y, h] of st) {
      line(c, x, y, x + sw, y - h, '#4f9a3a', 2);
      ell(c, x - 3, y - h * 0.45, 4, 1.6, '#5cb046'); ell(c, x + 3, y - h * 0.6, 4, 1.6, '#5cb046');
      const hx = x + sw, hy = y - h;
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; ell(c, hx + Math.cos(a) * 4.5, hy + Math.sin(a) * 4.2, 2.6, 2.6, k % 2 ? '#ffd23f' : '#ffc107'); }
      circ(c, hx, hy, 3.4, '#6d4c2f'); circ(c, hx - 1, hy - 1, 1, '#8d6e4f');
    }
  },
  lily(c, it) {
    const bob = Math.sin(ENV.t * 2 + it.seed) * 1;
    c.strokeStyle = `rgba(255,255,255,${0.25 + Math.sin(ENV.t * 2 + it.seed) * 0.1})`; c.lineWidth = 1;
    c.beginPath(); c.ellipse(0, 2, 18, 8, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#4fae55'; c.beginPath(); c.moveTo(0, bob); c.ellipse(0, bob, 14, 6.5, 0, 0.35, Math.PI * 2 - 0.1); c.closePath(); c.fill();
    c.fillStyle = '#66c46b'; c.beginPath(); c.ellipse(-2, bob - 1, 9, 4, 0, 0, Math.PI * 2); c.fill();
    if (rnd(it.seed, 1) > 0.3) {
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; ell(c, -3 + Math.cos(a) * 3, bob - 4 + Math.sin(a) * 1.6, 2.4, 2.4, k % 2 ? '#ffb3cf' : '#ff8fb8'); }
      circ(c, -3, bob - 5, 1.6, '#ffe066');
    }
  },
  sakura(c, it) {
    const s = 0.92 + rnd(it.seed, 1) * 0.2, sw = Math.sin(ENV.t * 1.2 + it.seed) * 1.4;
    sh(c, 0, 2, 19 * s, 9 * s);
    c.strokeStyle = '#7a4a3a'; c.lineCap = 'round';
    c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-3, -12, 1, -22 * s); c.stroke();
    c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -14); c.lineTo(-9, -24 * s); c.moveTo(1, -18); c.lineTo(10, -27 * s); c.stroke();
    c.lineCap = 'butt';
    const cols = ['#ffb3cf', '#ffc4da', '#ff9ec4'];
    blob(c, -11 * s + sw, -27 * s, 10 * s, cols[0]); blob(c, 11 * s + sw, -29 * s, 10 * s, cols[2]);
    blob(c, sw, -35 * s, 13 * s, cols[1]); blob(c, -4 * s + sw * 1.2, -45 * s, 8 * s, cols[0]);
  },
  mushroom(c, it) {
    sh(c, 0, 2, 16, 7);
    poly(c, [-5, 0, 5, 0, 4, -18, -4, -18], '#f5ecd9'); poly(c, [0, 0, 5, 0, 4, -18, 0, -18], '#e0d3b8');
    ell(c, 0, -19, 15, 5, '#f0e3c8');
    c.fillStyle = '#e74c3c'; c.beginPath(); c.ellipse(0, -20, 17, 15, 0, Math.PI, 0); c.ellipse(0, -20, 17, 5, 0, 0, Math.PI); c.fill();
    c.fillStyle = '#ff7b6b'; c.beginPath(); c.ellipse(-5, -28, 6, 4, -0.4, 0, Math.PI * 2); c.fill();
    [[-8, -24, 2.8], [3, -31, 2.5], [9, -23, 2.2], [-1, -22, 1.8], [-6, -32, 1.6]].forEach(([x, y, r]) => ell(c, x, y, r, r * 0.8, '#ffffff'));
    if (ENV.night > 0.4) light(0, -22, 40, '#ff9ec4', 0.5);
  },
  autumn(c, it) {
    const s = 0.9 + rnd(it.seed, 1) * 0.22, sw = Math.sin(ENV.t * 1.3 + it.seed) * 1.5;
    sh(c, 0, 2, 17 * s, 8 * s);
    poly(c, [-3.5, 0, 3.5, 0, 2.5, -20 * s, -2.5, -20 * s], '#7a4b33'); poly(c, [0, 0, 3.5, 0, 2.5, -20 * s, 0, -20 * s], '#5e3826');
    blob(c, -9 * s + sw * 0.7, -22 * s, 10 * s, '#e8693a'); blob(c, 9 * s + sw * 0.7, -23 * s, 10 * s, '#f39c3d');
    blob(c, sw, -31 * s, 13 * s, '#f6b545'); blob(c, 2 * s + sw * 1.2, -41 * s, 8 * s, '#e8693a');
  },
  cactus(c, it) {
    sh(c, 0, 2, 13, 6);
    ell(c, 0, 1, 12, 5, '#e8cf9a');
    const col = '#5aa864';
    const cap = (x, y0, y1, w) => { poly(c, [x - w, y0, x + w, y0, x + w, y1, x - w, y1], col); poly(c, [x, y0, x + w, y0, x + w, y1, x, y1], shade(col, -0.18)); circ(c, x, y1, w, col); };
    cap(0, 0, -28, 5);
    cap(-9, -10, -20, 3); poly(c, [-9, -10, -2, -10, -2, -14, -9, -14], col);
    cap(9, -14, -24, 3); poly(c, [2, -14, 9, -14, 9, -18, 2, -18], shade(col, -0.1));
    for (let y = -4; y > -28; y -= 5) { circ(c, -2, y, 0.7, '#e8f5e9'); circ(c, 2, y - 2, 0.7, '#e8f5e9'); }
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; circ(c, Math.cos(a) * 3, -34 + Math.sin(a) * 1.5, 2.2, '#ff6b9e'); }
    circ(c, 0, -34, 1.5, '#ffe066');
  },
  willow(c, it) {
    const t = ENV.t, sw = Math.sin(t * 1 + it.seed) * 2;
    sh(c, 0, 2, 22, 10);
    poly(c, [-4, 0, 4, 0, 3, -26, -3, -26], '#7a5a3c');
    blob(c, sw * 0.5, -40, 18, '#86c06a'); blob(c, -12 + sw * 0.5, -32, 11, '#7db662'); blob(c, 12 + sw * 0.5, -33, 11, '#7db662');
    c.strokeStyle = '#6aa64f'; c.lineWidth = 2;
    for (let i = 0; i < 13; i++) {
      const x = -19 + i * 3.2, top = -34 + Math.abs(i - 6) * 1.5, len = 24 - Math.abs(i - 6) * 1.2;
      const ph = Math.sin(t * 1.4 + i * 0.6 + it.seed) * 2;
      c.beginPath(); c.moveTo(x + sw * 0.5, top); c.quadraticCurveTo(x + ph, top + len * 0.6, x + ph * 1.6, top + len); c.stroke();
    }
  },
  crystal(c, it) {
    const t = ENV.t, pulse = 0.5 + Math.sin(t * 2 + it.seed) * 0.5;
    sh(c, 0, 2, 15, 7);
    blob(c, -8, -2, 6, '#8d939a'); blob(c, 8, -1, 5, '#9aa0a6');
    const shard = (x, y, w, h, col, tilt) => {
      poly(c, [x - w, y, x + tilt - w * 0.6, y - h, x + tilt, y - h - w * 1.3, x + tilt + w * 0.6, y - h, x + w, y], col);
      poly(c, [x, y + 1, x + tilt, y - h - w * 1.3, x + w, y], shade(col, -0.25));
      poly(c, [x - w * 0.5, y - 2, x + tilt - w * 0.3, y - h + 2, x - w * 0.1, y - h * 0.3], 'rgba(255,255,255,.45)');
    };
    shard(-6, 0, 4, 16, '#b197fc', -3); shard(7, 1, 4, 14, '#74c0fc', 3); shard(0, 2, 6, 26, '#99e9f2', 0);
    if (ENV.night > 0.1) light(0, -16, 60, '#9fe7ff', 0.6 + pulse * 0.4);
    circ(c, -3, -28 - pulse * 3, 1.2 + pulse, `rgba(255,255,255,${pulse})`);
  },
  /* ---------------- Decoración ---------------- */
  fence(c, it) {
    const col = '#f6efe0';
    for (const z of [5, 11]) { const a = P(0, 0, -0.5, 0, z), b = P(0, 0, 0.5, 0, z); poly(c, [a[0], a[1], b[0], b[1], b[0], b[1] - 2.5, a[0], a[1] - 2.5], '#e2d6bf'); }
    for (let i = 0; i <= 4; i++) {
      const u = -0.5 + i * 0.25, p = P(0, 0, u, 0, 0);
      const h = i % 2 === 0 ? 16 : 13;
      poly(c, [p[0] - 2, p[1], p[0] + 2, p[1], p[0] + 2, p[1] - h, p[0], p[1] - h - 3, p[0] - 2, p[1] - h], i % 2 === 0 ? col : '#efe6d2');
      line(c, p[0] + 2, p[1], p[0] + 2, p[1] - h, 'rgba(0,0,0,.12)');
    }
  },
  bench(c, it) {
    sh(c, 0, 2, 22, 8, 0.15);
    const back = [P(0, 0, -0.34, -0.13, 9), P(0, 0, 0.34, -0.13, 9), P(0, 0, 0.34, -0.13, 17), P(0, 0, -0.34, -0.13, 17)];
    [P(0, 0, -0.28, -0.13), P(0, 0, 0.28, -0.13)].forEach(p => line(c, p[0], p[1], p[0], p[1] - 16, '#4e5d6c', 2.5));
    poly(c, back.flat(), '#c98b55'); line(c, back[0][0], back[0][1] - 4, back[1][0], back[1][1] - 4, 'rgba(0,0,0,.15)');
    [P(0, 0, -0.28, 0.08), P(0, 0, 0.28, 0.08)].forEach(p => line(c, p[0], p[1], p[0], p[1] - 7, '#4e5d6c', 2.5));
    B3(c, 0, -6, 0.34, 0.12, 2.5, '#d9995e', { edge: false });
  },
  pot(c, it) {
    sh(c, 0, 2, 12, 5);
    const f = B3(c, 0, 0, 0.14, 0.14, 10, '#d0764a');
    B3(c, 0, -10, 0.17, 0.17, 2.5, '#e08a5c', { edge: false });
    const col = ['#ff6b8b', '#ffd23f', '#9b7bff'][Math.floor(rnd(it.seed, 1) * 3)];
    blob(c, -3, -16, 5, '#5cb046'); blob(c, 4, -17, 5, '#66b94a'); blob(c, 0, -21, 5, '#5cb046');
    circ(c, -2, -22, 2.4, col); circ(c, 4, -19, 2.2, col); circ(c, 1, -25, 2, col);
  },
  lamp(c, it) {
    sh(c, 0, 2, 9, 4);
    B3(c, 0, 0, 0.08, 0.08, 4, '#3d4a5c', { edge: false });
    poly(c, [-1.5, -4, 1.5, -4, 1.5, -38, -1.5, -38], '#3d4a5c');
    const on = ENV.night > 0.25;
    B3(c, 0, -38, 0.08, 0.08, 9, on ? '#ffe9a6' : '#cfe6f5', { edge: false, left: on ? '#ffe08a' : '#cfe6f5', right: on ? '#ffc94d' : '#a9c9df' });
    hip(c, { cx: 0, cy: -38, sx: 0.08, sy: 0.08, h: 9 }, 6, '#3d4a5c', 1.4);
    if (ENV.night > 0.05) light(0, -42, 90, '#ffd27a', 1);
  },
  mailbox(c, it) {
    sh(c, 0, 2, 9, 4);
    poly(c, [-1.5, 0, 1.5, 0, 1.5, -16, -1.5, -16], '#8a5a3c');
    const f = B3(c, 0, -16, 0.14, 0.07, 6, '#e5484d', { edge: false });
    c.fillStyle = '#e5484d'; c.beginPath(); const a = P(0, -16, -0.14, 0, 6), b = P(0, -16, 0.14, 0, 6);
    c.moveTo(a[0] - 2, a[1] + 1); c.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 9, b[0] + 2, b[1] + 1); c.fill();
    line(c, 6, -20, 6, -30, '#37474f', 1.2); poly(c, [6, -30, 12, -28, 6, -26], '#ffd23f');
  },
  hedge(c, it) {
    sh(c, 0, 3, 24, 11, 0.15);
    const f = B3(c, 0, 0, 0.4, 0.4, 15, '#4f9e43', { top: '#62b553', edge: false });
    for (let i = 0; i < 14; i++) {
      const s = rnd(it.seed, i), v = rnd(it.seed, i + 30) * 13 + 1;
      const side = i % 2 ? 'L' : 'R';
      const A = side === 'L' ? f.L : f.B, Bp = side === 'L' ? f.B : f.R;
      circ(c, A[0] + (Bp[0] - A[0]) * s, A[1] + (Bp[1] - A[1]) * s - v, 1.6, side === 'L' ? '#5fb252' : '#3f8a36');
    }
    for (let i = 0; i < 6; i++) circ(c, -12 + rnd(it.seed, 50 + i) * 24, -15 - 4 + rnd(it.seed, 60 + i) * 8, 1.6, '#7cc96b');
  },
  campfire(c, it) {
    const t = ENV.t;
    sh(c, 0, 1, 15, 6);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; ell(c, Math.cos(a) * 11, Math.sin(a) * 5, 3.5, 2.5, k % 2 ? '#8d939a' : '#a5abb1'); }
    line(c, -8, 2, 8, -4, '#6d4c2f', 4); line(c, -8, -4, 8, 2, '#5d3f25', 4);
    const fl = 1 + Math.sin(t * 13 + it.seed) * 0.08 + Math.sin(t * 7.3) * 0.06;
    const flame = (w, h, col, ph) => {
      c.fillStyle = col; c.beginPath(); c.moveTo(-w, -1);
      c.quadraticCurveTo(-w * 0.9, -h * 0.6 * fl, Math.sin(t * 9 + ph) * 2, -h * fl);
      c.quadraticCurveTo(w * 0.9, -h * 0.6 * fl, w, -1); c.closePath(); c.fill();
    };
    flame(8, 22, '#ff6b2c', 0); flame(5.5, 16, '#ffa63c', 1); flame(3, 10, '#ffe066', 2);
    if (ENV.night > 0.02) light(0, -8, 85 * fl, '#ff9a3c', 1);
  },
  well(c, it) {
    sh(c, 0, 3, 20, 9);
    cyl(c, 0, 0, 15, 7.5, 14, '#a9a397', '#c2bcb0');
    c.save(); c.beginPath(); c.moveTo(15, 0); c.ellipse(0, 0, 15, 7.5, 0, 0, Math.PI); c.lineTo(-15, -14); c.ellipse(0, -14, 15, 7.5, 0, Math.PI, 0, true); c.clip();
    c.strokeStyle = 'rgba(80,70,60,.35)'; c.lineWidth = 1; for (let y = -3; y > -14; y -= 4) { c.beginPath(); c.ellipse(0, y, 15, 7.5, 0, 0, Math.PI); c.stroke(); }
    c.restore();
    ell(c, 0, -14, 11, 5.5, '#2c5d7a'); ell(c, -2, -15, 5, 2, 'rgba(255,255,255,.25)');
    line(c, -13, -14, -13, -40, '#7a4b33', 3); line(c, 13, -14, 13, -40, '#7a4b33', 3);
    line(c, -13, -34, 13, -34, '#5d3f25', 2); line(c, 0, -34, 0, -24, '#d7ccc8', 1);
    poly(c, [-3, -24, 3, -24, 2.5, -19, -2.5, -19], '#8d6e63');
    poly(c, [-20, -38, 0, -50, 0, -45, -18, -34], '#c4553c'); poly(c, [0, -50, 20, -38, 18, -34, 0, -45], '#a3412c');
  },
  swing(c, it) {
    const t = ENV.t, a = Math.sin(t * 2.2 + it.seed) * 0.45;
    sh(c, 0, 2, 20, 8, 0.15);
    const L0 = P(0, 0, -0.38, 0), R0 = P(0, 0, 0.38, 0);
    for (const p of [L0, R0]) { line(c, p[0] - 6, p[1] + 3, p[0], p[1] - 36, '#c0533a', 3); line(c, p[0] + 6, p[1] - 3, p[0], p[1] - 36, '#c0533a', 3); }
    line(c, L0[0], L0[1] - 36, R0[0], R0[1] - 36, '#8a3a28', 3);
    const dy = Math.sin(a) * 0.35, lift = (1 - Math.cos(a)) * 22;
    const s1 = P(0, 0, -0.15, dy, 9 + lift), s2 = P(0, 0, 0.15, dy, 9 + lift);
    const r1 = P(0, 0, -0.15, 0, 36), r2 = P(0, 0, 0.15, 0, 36);
    line(c, r1[0], r1[1], s1[0], s1[1], '#e0d6c8', 1.2); line(c, r2[0], r2[1], s2[0], s2[1], '#e0d6c8', 1.2);
    poly(c, [s1[0], s1[1], s2[0], s2[1], s2[0] + 2, s2[1] + 3, s1[0] + 2, s1[1] + 3], '#ffd23f');
  },
  fountain(c, it) {
    const t = ENV.t;
    sh(c, 0, 5, 54, 26);
    cyl(c, 0, 0, 50, 25, 12, '#d6cdbf', '#e7e0d4');
    ell(c, 0, -12, 44, 22, '#5cc6e6');
    for (let k = 0; k < 3; k++) {
      const p = ((t * 0.5 + k / 3) % 1);
      c.strokeStyle = `rgba(255,255,255,${0.5 * (1 - p)})`; c.lineWidth = 1.2;
      c.beginPath(); c.ellipse(0, -12, 10 + p * 32, (10 + p * 32) / 2, 0, 0, Math.PI * 2); c.stroke();
    }
    ell(c, -14, -16, 10, 3, 'rgba(255,255,255,.25)');
    cyl(c, 0, -12, 7, 3.5, 24, '#d6cdbf');
    cyl(c, 0, -36, 18, 9, 4, '#d6cdbf', '#e7e0d4'); ell(c, 0, -40, 15, 7.5, '#6fd0ec');
    cyl(c, 0, -40, 3, 1.5, 10, '#d6cdbf');
    // chorros
    c.strokeStyle = 'rgba(200,240,255,.85)'; c.lineWidth = 2;
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * Math.PI * 2 + t * 0.4, ex = Math.cos(a) * 15, ey = -40 + Math.sin(a) * 7.5;
      c.beginPath(); c.moveTo(0, -50); c.quadraticCurveTo(ex * 0.6, -62, ex, ey); c.stroke();
    }
    for (let k = 0; k < 10; k++) {
      const p = (t * 1.3 + k * 0.1) % 1, a = k * 2.4;
      circ(c, Math.cos(a) * (18 + p * 20), -36 + p * 24 + Math.sin(a) * 8, 1.4, `rgba(220,248,255,${1 - p})`);
    }
  },
  statue(c, it) {
    sh(c, 0, 3, 20, 9);
    const f = B3(c, 0, 0, 0.25, 0.25, 16, '#d9d4c7');
    B3(c, 0, -16, 0.28, 0.28, 3, '#e8e3d6', { edge: false });
    fq(c, f, 'L', 0.25, 0.75, 6, 11, '#c9a227');
    // tortuga de bronce
    const col = '#7fb59a';
    ell(c, -11, -22, 4, 2.5, shade(col, -0.1)); ell(c, 9, -21, 4, 2.5, shade(col, -0.1));
    circ(c, -14, -31, 5, col); circ(c, -15.5, -32, 1, '#2d3b33');
    c.fillStyle = col; c.beginPath(); c.ellipse(0, -24, 15, 14, 0, Math.PI, 0); c.ellipse(0, -24, 15, 4, 0, 0, Math.PI); c.fill();
    c.fillStyle = shade(col, 0.2); c.beginPath(); c.ellipse(-4, -31, 6, 4, -0.3, 0, Math.PI * 2); c.fill();
    c.strokeStyle = shade(col, -0.25); c.lineWidth = 1;
    [[-7, -28], [0, -33], [7, -28], [0, -26]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 4, 3, 0, 0, Math.PI * 2); c.stroke(); });
  },
  lanterns(c, it) {
    const t = ENV.t;
    sh(c, 0, 2, 22, 9, 0.12);
    const A = P(0, 0, -0.42, 0), B = P(0, 0, 0.42, 0);
    line(c, A[0], A[1], A[0], A[1] - 38, '#6d4c2f', 2.5); line(c, B[0], B[1], B[0], B[1] - 38, '#6d4c2f', 2.5);
    const a = [A[0], A[1] - 36], b = [B[0], B[1] - 36], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + 10;
    c.strokeStyle = '#4e342e'; c.lineWidth = 1; c.beginPath(); c.moveTo(...a); c.quadraticCurveTo(mx, my, ...b); c.stroke();
    const cols = ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#da77f2'];
    for (let i = 0; i < 5; i++) {
      const u = (i + 1) / 6, x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1];
      const sw = Math.sin(t * 2 + i + it.seed) * 1.2;
      line(c, x, y, x + sw, y + 3, '#4e342e', 1);
      const on = ENV.night > 0.25, col = cols[i];
      ell(c, x + sw, y + 7, 3.6, 4.5, on ? shade(col, 0.45) : col);
      ell(c, x + sw - 1, y + 6, 1.2, 2, 'rgba(255,255,255,.5)');
    }
    if (ENV.night > 0.05) light(0, -26, 70, '#ffb86b', 0.9);
  },
  gazebo(c, it) {
    sh(c, 0, 5, 58, 28);
    B3(c, 0, 0, 0.68, 0.68, 6, '#eadfcb', { top: '#f3eadb' });
    const pil = [];
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; pil.push([Math.cos(a) * 36, -6 + Math.sin(a) * 18]); }
    const back = pil.filter(p => p[1] < -6), front = pil.filter(p => p[1] >= -6);
    back.forEach(([x, y]) => poly(c, [x - 2, y, x + 2, y, x + 2, y - 36, x - 2, y - 36], '#e6ddd0'));
    // banco interior
    B3(c, 0, -6, 0.25, 0.25, 6, '#c98b55', { edge: false });
    front.forEach(([x, y]) => { poly(c, [x - 2.5, y, x + 2.5, y, x + 2.5, y - 36, x - 2.5, y - 36], '#ffffff'); line(c, x + 2.5, y, x + 2.5, y - 36, 'rgba(0,0,0,.1)'); });
    // barandilla
    c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -18, 36, 18, 0, 0.15, Math.PI - 0.15); c.stroke();
    cone(c, 0, -42, 50, 30, '#e05a5a');
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5;
    for (let k = 1; k < 8; k++) { const a = Math.PI * k / 8; c.beginPath(); c.moveTo(0, -72); c.lineTo(-Math.cos(a) * 50, -42 + Math.sin(a) * 25); c.stroke(); }
    circ(c, 0, -74, 3.5, '#ffd23f');
    if (ENV.night > 0.1) light(0, -30, 70, '#ffd27a', 0.6);
  },
  pond_duck(c, it) {
    const t = ENV.t, bob = Math.sin(t * 2.4 + it.seed) * 1.2, dx = Math.sin(t * 0.5 + it.seed) * 5;
    c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1; c.beginPath(); c.ellipse(dx, 2, 13, 5, 0, 0, Math.PI * 2); c.stroke();
    ell(c, dx, bob - 2, 9, 5.5, '#ffd84a'); ell(c, dx - 2, bob - 4, 5, 2.4, '#ffe680');
    poly(c, [dx + 6, bob - 6, dx + 11, bob - 8, dx + 8, bob - 2], '#ffd84a');
    circ(c, dx + 6, bob - 9, 4.5, '#ffd84a'); circ(c, dx + 7.5, bob - 10, 0.9, '#263238');
    poly(c, [dx + 9.5, bob - 9, dx + 14, bob - 8, dx + 9.5, bob - 7], '#ff8f3c');
  },
  arch(c, it) {
    sh(c, 0, 2, 22, 8, 0.14);
    const A = P(0, 0, -0.36, 0), B = P(0, 0, 0.36, 0);
    for (const p of [A, B]) {
      poly(c, [p[0] - 3.5, p[1], p[0] + 3.5, p[1], p[0] + 3.5, p[1] - 34, p[0] - 3.5, p[1] - 34], '#4f9e43');
      for (let y = -4; y > -34; y -= 6) { circ(c, p[0] - 2, p[1] + y, 2, '#ff6b8b'); circ(c, p[0] + 2, p[1] + y - 3, 1.6, '#ffb3cf'); }
    }
    const a = [A[0], A[1] - 32], b = [B[0], B[1] - 32], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - 26;
    c.strokeStyle = '#4f9e43'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(...a); c.quadraticCurveTo(mx, my, ...b); c.stroke(); c.lineCap = 'butt';
    for (let i = 0; i <= 8; i++) {
      const u = i / 8, x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1];
      circ(c, x, y - 1, 2.6, i % 2 ? '#ff6b8b' : '#ff4d6d'); circ(c, x - 1, y - 2, 0.9, '#ffd6e0');
    }
  },
  clocktower(c, it) {
    sh(c, 0, 3, 24, 11);
    const f = B3(c, 0, 0, 0.24, 0.24, 92, '#e2c9a0');
    for (let v = 8; v < 92; v += 8) { fline(c, f, 'L', 0, 1, v, 'rgba(120,80,40,.15)'); fline(c, f, 'R', 0, 1, v, 'rgba(90,60,30,.18)'); }
    fq(c, f, 'R', 0.35, 0.65, 0, 14, '#7a4a2a');
    win(c, f, 'L', 0.38, 0.62, 30, 42); win(c, f, 'R', 0.38, 0.62, 30, 42);
    // esferas del reloj
    const ph = ENV.phase, hrA = ph * Math.PI * 4, mnA = ph * Math.PI * 48;
    for (const side of ['L', 'R']) {
      const A = side === 'L' ? f.L : f.B, Bp = side === 'L' ? f.B : f.R;
      const mx = (A[0] + Bp[0]) / 2, my = (A[1] + Bp[1]) / 2 - 70, dx = (Bp[0] - A[0]) / 2, dy = (Bp[1] - A[1]) / 2;
      c.save(); c.setTransform(c.getTransform().multiply(new DOMMatrix([dx / 12, dy / 12, 0, 1, mx, my])));
      circ(c, 0, 0, 9.5, '#5a4632'); circ(c, 0, 0, 8, '#fffaf0');
      line(c, 0, 0, Math.sin(hrA) * 4.5, -Math.cos(hrA) * 4.5, '#333', 1.6); line(c, 0, 0, Math.sin(mnA) * 6.5, -Math.cos(mnA) * 6.5, '#333', 1);
      c.restore();
    }
    hip(c, f, 32, '#5a6b8c', 1.25);
    line(c, 0, -92 - 32, 0, -92 - 42, '#c9a227', 1.5); circ(c, 0, -92 - 42, 2, '#ffd23f');
  },
};

/* ---------- Extras: regalo, aldeano ---------- */
function drawGift(c, x, y, t) {
  const bob = Math.sin(t * 3) * 3 - 10;
  sh(c, x, y + 2, 12 - bob * 0.2, 5, 0.2);
  const f = B3(c, x, y + bob, 0.16, 0.16, 14, '#ff6b8b', { edge: false });
  fq(c, f, 'L', 0.42, 0.58, 0, 14, '#ffd23f'); fq(c, f, 'R', 0.42, 0.58, 0, 14, '#f2c230');
  B3(c, x, y + bob - 14, 0.18, 0.18, 4, '#ff8fa3', { edge: false });
  const tp = [x, y + bob - 18];
  ell(c, tp[0] - 5, tp[1] - 3, 5, 3.5, '#ffd23f'); ell(c, tp[0] + 5, tp[1] - 3, 5, 3.5, '#ffd23f'); circ(c, tp[0], tp[1] - 2, 2.5, '#f2c230');
}
function drawVillager(c, v, t) {
  const walk = v.moving ? Math.abs(Math.sin(t * 9 + v.ph)) : 0;
  const bob = walk * 2;
  sh(c, 0, 1, 5, 2.4, 0.25);
  // piernas
  const lg = v.moving ? Math.sin(t * 9 + v.ph) * 1.6 : 0;
  line(c, -1.6, 0, -1.6 + lg, -5, '#4a4a68', 2); line(c, 1.6, 0, 1.6 - lg, -5, '#4a4a68', 2);
  // cuerpo
  c.fillStyle = v.shirt; c.beginPath(); c.roundRect(-4, -12 - bob, 8, 8, 3); c.fill();
  circ(c, 0, -15.5 - bob, 3.8, v.skin);
  if (v.hat === 1) { ell(c, 0, -18 - bob, 5.5, 1.6, v.hatCol); c.fillStyle = v.hatCol; c.fillRect(-3, -22 - bob, 6, 4); }
  else if (v.hat === 2) { c.fillStyle = v.hair; c.beginPath(); c.arc(0, -16.5 - bob, 4, Math.PI, 0); c.fill(); }
  else { c.fillStyle = v.hair; c.beginPath(); c.arc(0, -16 - bob, 4, Math.PI * 1.05, -0.05); c.fill(); circ(c, 3, -18 - bob, 1.6, v.hair); }
  circ(c, 1.3, -15.5 - bob, 0.6, '#2b2b2b');
}

/* ---------- Iconos para el catálogo ---------- */
const ICON_CACHE = {};
function itemIcon(id, size = 64) {
  const key = id + size;
  if (ICON_CACHE[key]) return ICON_CACHE[key];
  const d = ITEM[id];
  const cv = document.createElement('canvas'); const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = size * dpr; cv.height = size * dpr;
  const c = cv.getContext('2d');
  const big = d.w > 1;
  const sc = (size / (big ? 150 : 82)) * dpr;
  const hgt = d.hgt || 40;
  const saveN = ENV.night, saveT = ENV.t; ENV.night = 0; ENV.t = 1.3;
  c.setTransform(sc, 0, 0, sc, size * dpr / 2, size * dpr * (big ? 0.72 : 0.74) + Math.min(0, (hgt - (big ? 100 : 56))) * -0.0);
  // ajustar si es muy alto
  const totalH = hgt + (big ? 34 : 18);
  const avail = (big ? 150 : 82);
  if (totalH > avail * 0.92) {
    const k = (avail * 0.92) / totalH;
    c.setTransform(sc * k, 0, 0, sc * k, size * dpr / 2, size * dpr * 0.82);
  }
  if (d.onWater) { c.fillStyle = '#7fd6ef'; c.beginPath(); c.ellipse(0, 0, 26, 13, 0, 0, Math.PI * 2); c.fill(); }
  try { SPR[id](c, { seed: 11 }); } catch (e) { console.warn(id, e); }
  ENV.night = saveN; ENV.t = saveT;
  return (ICON_CACHE[key] = cv);
}
function terrainIcon(tid, size = 64, palette) {
  const key = 'T' + tid + size + (palette || '');
  if (ICON_CACHE[key]) return ICON_CACHE[key];
  const cv = document.createElement('canvas'); const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = size * dpr; cv.height = size * dpr;
  const c = cv.getContext('2d');
  const sc = size / 80 * dpr;
  c.setTransform(sc, 0, 0, sc, size * dpr / 2, size * dpr / 2 - 4 * dpr);
  // bloque de 1 casilla con lateral
  drawTerrainTile(c, 0, -16, T[tid], 3, 3, palette || 'primavera', 1.3, true);
  return (ICON_CACHE[key] = cv);
}

/* ---------- Suelo ---------- */
// (x0,y0) = vértice superior de la casilla
function drawTerrainTile(c, x0, y0, code, tx, ty, palName, t, sides, cliffL, cliffR) {
  const pal = PALETTES[palName] || PALETTES.primavera;
  const id = TERRAIN_IDS[code];
  const h = hash2(tx, ty, 7);
  const L = [x0 - 32, y0 + 16], R = [x0 + 32, y0 + 16], B = [x0, y0 + 32], Tp = [x0, y0];
  const dia = (col) => poly(c, [Tp[0], Tp[1], R[0], R[1], B[0], B[1], L[0], L[1]], col);
  const grassCol = ((tx + ty) % 2 === 0) ? pal.grass[0] : pal.grass[1];
  // laterales (acantilado)
  if (sides || cliffL || cliffR) {
    const CH = 12;
    if (sides || cliffL) { poly(c, [L[0], L[1], B[0], B[1], B[0], B[1] + CH, L[0], L[1] + CH], '#a8774e'); poly(c, [L[0], L[1], B[0], B[1], B[0], B[1] + 3, L[0], L[1] + 3], id === 'beach' || id === 'sand' ? '#d9b779' : pal.cliffTop); }
    if (sides || cliffR) { poly(c, [B[0], B[1], R[0], R[1], R[0], R[1] + CH, B[0], B[1] + CH], '#8c6140'); poly(c, [B[0], B[1], R[0], R[1], R[0], R[1] + 3, B[0], B[1] + 3], id === 'beach' || id === 'sand' ? '#c9a769' : shade(pal.cliffTop, -0.15)); }
  }
  switch (id) {
    case 'grass': {
      dia(grassCol);
      if (h > 0.55) { c.strokeStyle = shade(pal.grass[0], -0.18); c.lineWidth = 1; const gx = x0 - 10 + h * 20, gy = y0 + 12 + (h * 7 % 1) * 10; c.beginPath(); c.moveTo(gx - 2, gy - 3); c.lineTo(gx, gy); c.lineTo(gx + 2, gy - 3); c.stroke(); }
      break;
    }
    case 'clover': {
      dia((tx + ty) % 2 ? '#4fa64a' : '#4a9e45');
      for (let i = 0; i < 3; i++) { const a = hash2(tx, ty, i + 20); circ(c, x0 - 14 + a * 28, y0 + 10 + hash2(tx, ty, i + 30) * 12, 1.6, '#62bd5a'); }
      break;
    }
    case 'meadow': {
      dia(shade(grassCol, 0.06));
      const cols = ['#ffffff', '#ffd23f', '#ff8fb8', '#b197fc'];
      for (let i = 0; i < 4; i++) { const a = hash2(tx, ty, i + 40), b = hash2(tx, ty, i + 50); circ(c, x0 - 16 + a * 32, y0 + 9 + b * 14, 1.5, cols[(i + (h * 4 | 0)) % 4]); }
      break;
    }
    case 'beach': case 'sand': {
      dia(((tx + ty) % 2) ? '#f2d99a' : '#efd492');
      for (let i = 0; i < 3; i++) { const a = hash2(tx, ty, i + 60); circ(c, x0 - 14 + a * 28, y0 + 10 + hash2(tx, ty, i + 70) * 12, 0.8, '#d6b56f'); }
      if (id === 'beach' && h > 0.93) { ell(c, x0 + 4, y0 + 16, 3, 1.6, '#ffb3a0'); }
      break;
    }
    case 'path': {
      dia(((tx + ty) % 2) ? '#e3cf9f' : '#dfca98');
      for (let i = 0; i < 3; i++) { const a = hash2(tx, ty, i + 80), b = hash2(tx, ty, i + 90); ell(c, x0 - 12 + a * 24, y0 + 11 + b * 10, 3.5, 1.8, '#cbb27a'); }
      break;
    }
    case 'stone': {
      dia('#b9b4ad');
      c.strokeStyle = 'rgba(90,85,80,.35)'; c.lineWidth = 1;
      for (let k = 1; k < 3; k++) {
        const a = [x0 - 32 + k * 32 / 3 * 1, 0];
        c.beginPath(); c.moveTo(Tp[0] + (L[0] - Tp[0]) * k / 3, Tp[1] + (L[1] - Tp[1]) * k / 3); c.lineTo(R[0] + (B[0] - R[0]) * k / 3, R[1] + (B[1] - R[1]) * k / 3); c.stroke();
        c.beginPath(); c.moveTo(Tp[0] + (R[0] - Tp[0]) * k / 3, Tp[1] + (R[1] - Tp[1]) * k / 3); c.lineTo(L[0] + (B[0] - L[0]) * k / 3, L[1] + (B[1] - L[1]) * k / 3); c.stroke();
      }
      ell(c, x0 - 6 + h * 12, y0 + 14, 3, 1.4, 'rgba(255,255,255,.25)');
      break;
    }
    case 'soil': {
      dia('#9a6b45');
      c.strokeStyle = '#7d5434'; c.lineWidth = 2;
      for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(Tp[0] + (L[0] - Tp[0]) * k / 4, Tp[1] + (L[1] - Tp[1]) * k / 4); c.lineTo(R[0] + (B[0] - R[0]) * k / 4, R[1] + (B[1] - R[1]) * k / 4); c.stroke(); }
      for (let k = 1; k < 4; k++) { const p = [Tp[0] + (L[0] - Tp[0]) * k / 4 + 16, Tp[1] + (L[1] - Tp[1]) * k / 4 + 8]; if (hash2(tx, ty, k) > 0.5) circ(c, p[0], p[1] - 2, 2, '#6dbb4f'); }
      break;
    }
    case 'deck': {
      dia('#d4a373');
      c.strokeStyle = 'rgba(110,70,40,.35)'; c.lineWidth = 1;
      for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(Tp[0] + (R[0] - Tp[0]) * k / 5, Tp[1] + (R[1] - Tp[1]) * k / 5); c.lineTo(L[0] + (B[0] - L[0]) * k / 5, L[1] + (B[1] - L[1]) * k / 5); c.stroke(); }
      break;
    }
    case 'tiles': {
      const pc = ['#f8d7e0', '#d7ecf8', '#fdf1c7', '#dff5df'];
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
        const col = pc[((tx * 2 + a) + (ty * 2 + b)) % 2 === 0 ? (tx + ty) % 4 : 4 - 1 - (tx + ty) % 4];
        const p = (u, v) => [x0 + (u - v) * 32, y0 + (u + v) * 16];
        const u0 = a / 2, v0 = b / 2, u1 = u0 + 0.5, v1 = v0 + 0.5;
        poly(c, [...p(u0, v0), ...p(u1, v0), ...p(u1, v1), ...p(u0, v1)], col, 'rgba(255,255,255,.7)', 1);
      }
      break;
    }
    case 'water': {
      const nb = (typeof WATER_NB === 'number') ? WATER_NB : 0;
      if (typeof WATER_NB === 'number') WATER_NB = 0;
      const w = Math.sin(t * 1.5 + tx * 0.7 + ty * 0.5) * 0.5 + 0.5;
      dia(mixHex('#3fb3d8', '#56c4e4', w));
      // reflejos
      c.strokeStyle = `rgba(255,255,255,${0.12 + w * 0.3})`; c.lineWidth = 1.2;
      c.beginPath(); const yy = y0 + 12 + w * 6; c.moveTo(x0 - 10 + w * 4, yy); c.lineTo(x0 - 1 + w * 4, yy + 0.5); c.stroke();
      // orillas donde no hay agua vecina
      const bank = shade(grassCol, -0.12);
      const edges = [[Tp, L, 1], [Tp, R, 2], [R, B, 4], [B, L, 8]];
      c.lineCap = 'round';
      for (const [a, b, bit] of edges) {
        if (nb & bit) continue;
        c.strokeStyle = bank; c.lineWidth = 5; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1.2;
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ix = (x0 - mx) * 0.14, iy = (y0 + 16 - my) * 0.14;
        c.beginPath(); c.moveTo(a[0] + ix + (b[0] - a[0]) * 0.1, a[1] + iy + (b[1] - a[1]) * 0.1); c.lineTo(b[0] + ix - (b[0] - a[0]) * 0.1, b[1] + iy - (b[1] - a[1]) * 0.1); c.stroke();
      }
      c.lineCap = 'butt';
      break;
    }
    default: dia(grassCol);
  }
}
