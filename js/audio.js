'use strict';
/* =========================================================
   ISLETA · Audio sintetizado con WebAudio (sin archivos)
   ========================================================= */
const Sound = (() => {
  let ctx = null, master, sfxBus, musicBus, verb, verbSend, noiseBuf, musicFilter;
  let vol = { music: 0.55, sfx: 0.8 };
  let nightAmt = 0, musicOn = true, lastHover = 0;
  const PENTA = [0, 2, 4, 7, 9];

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => { }); return; }
    // en táctil, pointerdown aún no cuenta como gesto: esperar al toque completo evita el aviso de autoplay
    const ua = navigator.userActivation;
    if (ua && !ua.isActive && !ua.hasBeenActive) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.2;
    master = ctx.createGain(); master.gain.value = 0.9;
    master.connect(comp); comp.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    musicFilter = ctx.createBiquadFilter(); musicFilter.type = 'lowpass'; musicFilter.frequency.value = 5200;
    musicBus = ctx.createGain(); musicBus.connect(musicFilter); musicFilter.connect(master);
    // reverberación generada
    verb = ctx.createConvolver();
    const len = ctx.sampleRate * 2.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    verb.buffer = ir;
    verbSend = ctx.createGain(); verbSend.gain.value = 0.35;
    verbSend.connect(verb); verb.connect(master);
    // ruido blanco
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    apply();
    startMusic();
  }
  function apply() {
    if (!ctx) return;
    sfxBus.gain.setTargetAtTime(vol.sfx, ctx.currentTime, 0.05);
    musicBus.gain.setTargetAtTime(musicOn ? vol.music * 0.9 : 0, ctx.currentTime, 0.3);
  }
  function setVolumes(m, s) { vol.music = m; vol.sfx = s; apply(); }
  function setMusicEnabled(on) { musicOn = on; apply(); }
  function setNight(n) {
    nightAmt = n;
    if (musicFilter) musicFilter.frequency.setTargetAtTime(5200 - n * 3400, ctx.currentTime, 1.5);
  }
  const midi = m => 440 * Math.pow(2, (m - 69) / 12);

  function tone(f, dur, o = {}) {
    if (!ctx) return;
    const t = ctx.currentTime + (o.delay || 0);
    const osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + (o.slideT || dur));
    if (o.detune) osc.detune.value = o.detune;
    const g = ctx.createGain();
    const v = o.vol == null ? 0.25 : o.vol;
    const a = o.a || 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(o.dest || sfxBus);
    if (o.verb) { const s = ctx.createGain(); s.gain.value = o.verb; g.connect(s); s.connect(verbSend); }
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  function noise(dur, o = {}) {
    if (!ctx) return;
    const t = ctx.currentTime + (o.delay || 0);
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = o.ftype || 'bandpass';
    f.frequency.setValueAtTime(o.f0 || 1000, t);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + dur);
    f.Q.value = o.q || 1.2;
    const g = ctx.createGain(); const v = o.vol == null ? 0.2 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + (o.a || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(o.dest || sfxBus);
    if (o.verb) { const s = ctx.createGain(); s.gain.value = o.verb; g.connect(s); s.connect(verbSend); }
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }
  // nota pentatónica según índice (para combos ascendentes)
  function pent(i, base = 72) {
    i = Math.max(0, Math.floor(i) || 0); // índice entero: PENTA[2.1] daría NaN y una excepción en Web Audio
    const oct = Math.floor(i / 5), deg = i % 5;
    return midi(base + oct * 12 + PENTA[deg]);
  }

  const sfx = {
    click() { tone(660, 0.07, { slide: 990, type: 'triangle', vol: 0.12 }); },
    soft() { tone(520, 0.06, { slide: 700, vol: 0.07 }); },
    hover() { const n = performance.now(); if (n - lastHover < 45) return; lastHover = n; tone(1400, 0.03, { vol: 0.025 }); },
    open() { tone(380, 0.14, { slide: 620, vol: 0.08, type: 'triangle' }); noise(0.18, { f0: 600, f1: 2400, vol: 0.03 }); },
    close() { tone(620, 0.12, { slide: 360, vol: 0.07, type: 'triangle' }); },
    place(combo = 0) {
      const f = pent(Math.min(combo, 14), 60);
      tone(f * 0.5, 0.11, { slide: f * 1.2, vol: 0.32 });
      tone(f * 2, 0.22, { type: 'triangle', vol: 0.07, delay: 0.035, verb: 0.4 });
      noise(0.08, { f0: 2500, vol: 0.05, ftype: 'highpass' });
    },
    paint(combo = 0) {
      const f = pent(combo % 16, 67);
      tone(f, 0.09, { type: 'triangle', vol: 0.09, verb: 0.2 });
      noise(0.05, { f0: 3000, vol: 0.025 });
    },
    coin(i = 0) {
      const r = Math.pow(2, Math.min(i, 12) / 24);
      tone(988 * r, 0.09, { type: 'square', vol: 0.045 });
      tone(1319 * r, 0.28, { type: 'square', vol: 0.045, delay: 0.07 });
      tone(2637 * r, 0.25, { vol: 0.03, delay: 0.07, verb: 0.3 });
    },
    bigcoin() { [0, 4, 7, 12].forEach((s, i) => tone(midi(79 + s), 0.3, { type: 'triangle', vol: 0.09, delay: i * 0.06, verb: 0.4 })); },
    error() { tone(196, 0.1, { type: 'square', vol: 0.05 }); tone(165, 0.14, { type: 'square', vol: 0.05, delay: 0.1 }); },
    poof() { noise(0.32, { f0: 1800, f1: 250, vol: 0.22, q: 0.8 }); tone(260, 0.2, { slide: 90, vol: 0.12 }); },
    rotate() { tone(500, 0.08, { slide: 880, type: 'triangle', vol: 0.09 }); noise(0.1, { f0: 1500, f1: 4000, vol: 0.03 }); },
    undo() { tone(880, 0.1, { slide: 440, type: 'triangle', vol: 0.1 }); },
    pickup() { tone(440, 0.1, { slide: 880, vol: 0.14 }); },
    levelup() {
      [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => tone(midi(m), 0.4, { type: 'triangle', vol: 0.12, delay: i * 0.07, verb: 0.5 }));
      [72, 76, 79, 84].forEach(m => tone(midi(m), 1.6, { vol: 0.06, delay: 0.55, a: 0.05, verb: 0.6 }));
      noise(1.2, { f0: 6000, vol: 0.03, delay: 0.5, ftype: 'highpass' });
    },
    quest() { [76, 79, 83, 88].forEach((m, i) => tone(midi(m), 0.5, { type: 'triangle', vol: 0.1, delay: i * 0.08, verb: 0.5 })); },
    claim() { [72, 76, 79, 84, 88].forEach((m, i) => tone(midi(m), 0.35, { type: 'square', vol: 0.035, delay: i * 0.05, verb: 0.4 })); },
    achievement() {
      [0, 0.12, 0.24].forEach((d, i) => { const f = midi([84, 88, 91][i]); tone(f, 1.4, { vol: 0.08, delay: d, verb: 0.6 }); tone(f * 2.76, 0.6, { vol: 0.02, delay: d }); });
    },
    gift() { for (let i = 0; i < 9; i++) tone(pent(i, 72), 0.22, { type: 'triangle', vol: 0.08, delay: i * 0.035, verb: 0.5 }); },
    whoosh() { noise(0.5, { f0: 300, f1: 2600, vol: 0.12, q: 0.7, a: 0.15 }); },
    expand() {
      noise(1.2, { f0: 200, f1: 1200, vol: 0.18, q: 0.6, a: 0.3 });
      tone(55, 1.2, { vol: 0.25, slide: 40 });
      [60, 67, 72, 76, 79].forEach((m, i) => tone(midi(m), 1.2, { type: 'triangle', vol: 0.07, delay: 0.4 + i * 0.09, verb: 0.6 }));
    },
    combo(n) { tone(pent(n, 79), 0.25, { type: 'square', vol: 0.04, verb: 0.3 }); tone(pent(n + 2, 79), 0.3, { type: 'square', vol: 0.04, delay: 0.06, verb: 0.3 }); },
    type() { tone(1800 + Math.random() * 400, 0.025, { vol: 0.03, type: 'triangle' }); },
    shutter() { noise(0.06, { f0: 4000, vol: 0.2, ftype: 'highpass' }); noise(0.08, { f0: 2500, vol: 0.15, delay: 0.09 }); },
    start() { [60, 64, 67, 72].forEach((m, i) => tone(midi(m), 0.6, { type: 'triangle', vol: 0.1, delay: i * 0.1, verb: 0.6 })); noise(0.8, { f0: 400, f1: 3000, vol: 0.08, a: 0.3 }); },
    quack() { tone(600, 0.12, { slide: 380, type: 'sawtooth', vol: 0.05 }); },
  };

  /* ---------- Música generativa ---------- */
  const PROG = [
    [48, [60, 64, 67, 71]],  // Cmaj7
    [45, [57, 60, 64, 67]],  // Am7
    [41, [57, 60, 65, 69]],  // Fmaj7
    [43, [55, 59, 62, 65]],  // G7
    [48, [60, 64, 67, 72]],
    [52, [59, 64, 67, 71]],  // Em
    [41, [57, 60, 65, 69]],
    [43, [55, 59, 62, 67]],
  ];
  const SCALE = [0, 2, 4, 7, 9];
  let nextT = 0, step = 0, timer = null, melodyLast = 76;
  function startMusic() {
    if (timer) return;
    nextT = ctx.currentTime + 0.3;
    timer = setInterval(schedule, 60);
  }
  function pad(m, t, dur) {
    for (const det of [-7, 7]) {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = midi(m); o.detune.value = det;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1100;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.022, t + 0.9);
      g.gain.setValueAtTime(0.022, t + dur - 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.2);
      o.connect(f); f.connect(g); g.connect(musicBus);
      const s = ctx.createGain(); s.gain.value = 0.5; g.connect(s); s.connect(verbSend);
      o.start(t); o.stop(t + dur + 1.3);
    }
  }
  function pluck(m, t, v = 0.05, dur = 0.9) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = midi(m);
    const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = midi(m + 12);
    const g = ctx.createGain(), g2 = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(v * 0.25, t + 0.005); g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.4);
    o.connect(g); o2.connect(g2); g.connect(musicBus); g2.connect(musicBus);
    const s = ctx.createGain(); s.gain.value = 0.7; g.connect(s); s.connect(verbSend);
    o.start(t); o2.start(t); o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
  }
  function shaker(t, v) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    src.connect(f); f.connect(g); g.connect(musicBus); src.start(t, Math.random() * 0.5); src.stop(t + 0.1);
  }
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    const eighth = 60 / 84 / 2;
    while (nextT < ctx.currentTime + 0.25) {
      const bar = Math.floor(step / 8) % PROG.length, pos = step % 8;
      const [root, chord] = PROG[bar];
      if (pos === 0) {
        chord.forEach(m => pad(m, nextT, eighth * 8));
        pluck(root - 12 + 12, nextT, 0.07, 1.6);
      }
      if (pos === 4) pluck(root + 7, nextT, 0.035, 1.0);
      // melodía
      const prob = (pos % 2 === 0 ? 0.42 : 0.18) * (1 - nightAmt * 0.45);
      if (Math.random() < prob) {
        let cand = [];
        for (let o = 60; o <= 91; o += 12) SCALE.forEach(s => cand.push(o + s));
        cand = cand.filter(m => Math.abs(m - melodyLast) <= 5 && m >= 69 && m <= 88);
        if (pos === 0) { const ct = chord.map(c => c + 12).filter(c => c >= 69 && c <= 88); if (ct.length) cand = ct; }
        const m = cand[Math.floor(Math.random() * cand.length)] || 76;
        melodyLast = m;
        pluck(m, nextT, 0.04 + Math.random() * 0.015, 0.8 + Math.random() * 0.5);
      }
      if (pos % 2 === 1 && nightAmt < 0.6) shaker(nextT, 0.008);
      nextT += eighth; step++;
    }
  }

  return { init, sfx, setVolumes, setMusicEnabled, setNight, get ready() { return !!ctx; } };
})();
