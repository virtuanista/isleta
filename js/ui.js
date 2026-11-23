'use strict';
/* =========================================================
   ISLETA · Interfaz de usuario
   ========================================================= */
const ICO = {
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
  move: '<path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l-3 3-3-3"/><path d="M19 9l3 3-3 3"/><path d="M2 12h20"/><path d="M12 2v20"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3"/><path d="M7 5H4v2a3 3 0 0 0 3 3"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  home: '<path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  x: '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  target: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/>',
  caret: '<path d="M6 9l6 6 6-6"/>',
  brush: '<path d="M9.1 11.9l8-8a2.9 2.9 0 1 1 4 4l-8 8.1"/><path d="M7.1 14.9c-1.7 0-3 1.4-3 3 0 1.3-2.5 1.5-2 2 1.1 1.1 2.5 2 4 2 2.2 0 4-1.8 4-4a3 3 0 0 0-3-3z"/>',
  home2: '<path d="M3 10l9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M10 20v-6h4v6"/>',
  shop: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v9h14v-9"/><path d="M10 21v-5h4v5"/>',
  tree: '<path d="M12 22v-7"/><path d="M8 15h8a4 4 0 0 0 1.3-7.8A5 5 0 0 0 7 7.2 4 4 0 0 0 8 15z"/>',
  spark: '<path d="M12 2l2.9 6.9 7.1.4-5.5 4.7 1.7 7L12 17.3 5.8 21l1.7-7L2 9.3l7.1-.4z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  music: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
  mute: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M23 9l-6 6"/><path d="M17 9l6 6"/>',
  scroll: '<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/>',
};
const CAT_ICO = { casas: 'home2', negocios: 'shop', naturaleza: 'tree', deco: 'spark', suelo: 'brush' };
const svg = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICO[n] || ''}</svg>`;
const $ = id => document.getElementById(id);
const coinS = '<span class="coin-ico s"></span>';
const ICON_URL = {};
function iconURL(id, kind = 'item') {
  const k = kind + id + (kind === 'terrain' && Game.st ? Game.st.palette : '');
  if (ICON_URL[k]) return ICON_URL[k];
  const cv = kind === 'item' ? itemIcon(id, 72) : terrainIcon(id, 72, Game.st ? Game.st.palette : 'primavera');
  return (ICON_URL[k] = cv.toDataURL());
}

const UI = {
  shownCoins: 0, pending: 0, coinChain: 0, coinChainT: 0, cat: 'casas', modals: [], hudT: 0, infoItem: null,

  init() {
    this.bindGlobal();
    const s = Game.settings;
    Sound.setVolumes(s.music, s.sfx);
    Sound.setMusicEnabled(s.musicOn !== false);
    this.updateTitleSound();
    $('title-sound').onclick = () => {
      Sound.init();
      s.musicOn = !(s.musicOn !== false); Store.saveSettings(s); Sound.setMusicEnabled(s.musicOn); this.updateTitleSound(); Sound.sfx.click();
    };
  },
  updateTitleSound() {
    const on = Game.settings.musicOn !== false;
    $('title-sound').innerHTML = svg(on ? 'music' : 'mute') + (on ? 'Música activada' : 'Música desactivada');
  },
  bindGlobal() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.modals.length) { const m = this.modals[this.modals.length - 1]; if (m.closable) { Sound.sfx.close(); m.close(); } }
    });
    document.addEventListener('pointerover', e => {
      const b = e.target.closest && e.target.closest('.btn, .icon-btn, .tool, .tab, .card, .side-card, .av, .pal');
      if (b && b !== this._lastHoverEl) { this._lastHoverEl = b; Sound.sfx.hover(); }
    });
    // tras pulsar con ratón o dedo un botón del HUD, soltar el foco: así Espacio (arrastrar) no lo vuelve a activar
    document.addEventListener('click', e => {
      const b = e.detail > 0 && e.target.closest && e.target.closest('#hud button, #photo-bar button');
      if (b) b.blur();
    });
    document.addEventListener('pointerdown', e => {
      const b = e.target.closest && e.target.closest('.btn, .icon-btn, .tab, .chip-btn, .seg button, .toggle');
      if (b) Sound.init();
    });
    // tooltips declarativos
    document.addEventListener('pointerover', e => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (t) { const r = t.getBoundingClientRect(); this.showTip(`<span>${t.dataset.tip}</span>`, r.left + r.width / 2, r.bottom + 8, 'below'); }
    });
    document.addEventListener('pointerout', e => { const t = e.target.closest && e.target.closest('[data-tip]'); if (t) this.hideTip(); });
    // dentro de un iframe (itch.io), que las teclas y la rueda no desplacen la página que lo contiene
    const SCROLL_KEYS = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'];
    document.addEventListener('keydown', e => {
      if (!SCROLL_KEYS.includes(e.key)) return;
      const t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      if (tag === 'BUTTON' && e.key === ' ') return;
      const sc = t && t.closest && t.closest('.modal');
      if (sc && sc.scrollHeight > sc.clientHeight + 1) return; // el modal se desplaza solo (overscroll-behavior: contain)
      e.preventDefault();
    });
    document.addEventListener('wheel', e => {
      for (let el = e.target; el && el !== document.body; el = el.parentElement) {
        if (!(el instanceof Element)) continue;
        const cs = getComputedStyle(el);
        if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1) {
          if (e.deltaY < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return;
        }
        if (/(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          if (e.deltaX < 0 ? el.scrollLeft > 0 : el.scrollLeft + el.clientWidth < el.scrollWidth - 1) return;
        }
      }
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('beforeunload', () => Game.stop && Game.st && !Game.demo && Game.save(true));
    document.addEventListener('visibilitychange', () => { if (document.hidden && Game.st && !Game.demo) Game.save(true); });
  },

  /* ================= TÍTULO ================= */
  showTitle() {
    Game.start(demoState(), true);
    document.body.classList.remove('photo');
    $('hud').classList.add('hidden');
    $('photo-bar').classList.add('hidden');
    const t = $('title'); t.classList.remove('hidden', 'leaving');
    const word = 'Isleta', cols = ['#ff7a59', '#ffb703', '#22c3a6', '#36a9d6', '#7b5cff', '#ff5d8f'];
    t.querySelector('.logo').innerHTML = [...word].map((ch, i) => `<span style="--i:${i};--c:${cols[i]}">${ch}</span>`).join('');
    this.buildTitleMenu();
  },
  buildTitleMenu() {
    const last = Store.last(), n = Store.list().length;
    let h = '';
    if (last) h += `<button class="btn primary big" id="m-continue"><span class="em">▶</span><span class="sub">Continuar<small>${last.avatar} ${escapeHtml(last.island)} · Nivel ${last.level}</small></span></button>`;
    h += `<button class="btn ${last ? '' : 'primary '}big" id="m-new"><span class="em">🏝️</span>Nueva isla</button>`;
    if (n) h += `<button class="btn" id="m-load"><span class="em">📂</span>Mis islas <small style="margin-left:auto;opacity:.6">${n}</small></button>`;
    h += `<div class="row"><button class="btn" id="m-settings">⚙️ Ajustes</button><button class="btn" id="m-help">❓ Cómo jugar</button></div>`;
    const m = $('title-menu'); m.innerHTML = h;
    if (last) $('m-continue').onclick = () => { Sound.init(); this.startGame(Store.get(last.id), false); };
    $('m-new').onclick = () => { Sound.init(); this.newIsland(); };
    if (n) $('m-load').onclick = () => { Sound.init(); this.islandsModal(); };
    $('m-settings').onclick = () => { Sound.init(); this.settingsModal(false); };
    $('m-help').onclick = () => { Sound.init(); this.helpModal(); };
  },
  newIsland() {
    let avatar = AVATARS[(Math.random() * AVATARS.length) | 0], palette = 'primavera';
    const randName = () => ISLAND_NAMES_A[(Math.random() * ISLAND_NAMES_A.length) | 0] + ' ' + ISLAND_NAMES_B[(Math.random() * ISLAND_NAMES_B.length) | 0];
    const m = this.modal({
      title: 'Nueva isla 🏝️', lead: 'Cuéntanos un poco sobre ti antes de zarpar.',
      body: `
        <div class="field"><label for="f-name">¿Cómo te llamas?</label><input class="input" id="f-name" maxlength="16" placeholder="Tu nombre" autocomplete="off" spellcheck="false"><div class="err" id="e-name"></div></div>
        <div class="field"><label for="f-island">Nombre de tu isla</label><div class="inrow"><input class="input" id="f-island" maxlength="22" autocomplete="off" spellcheck="false"><button class="dice" id="f-dice" aria-label="Nombre aleatorio" data-tip="Nombre aleatorio">🎲</button></div><div class="err" id="e-island"></div></div>
        <div class="field"><label>Elige tu avatar</label><div class="avatars">${AVATARS.map(a => `<button class="av${a === avatar ? ' on' : ''}" data-a="${a}">${a}</button>`).join('')}</div></div>
        <div class="field"><label>Estilo de la isla</label><div class="palettes">${Object.entries(PALETTES).map(([k, p]) => `<button class="pal${k === palette ? ' on' : ''}" data-p="${k}"><div class="sw" style="background:linear-gradient(${p.sea[0]},${p.sea[1]});--g:${p.grass[0]}"></div>${p.name}</button>`).join('')}</div></div>`,
      foot: `<button class="btn" data-close>Cancelar</button><button class="btn primary" id="f-go">⛵ ¡Zarpar!</button>`,
    });
    const nm = m.q('#f-name'), il = m.q('#f-island');
    il.value = randName();
    setTimeout(() => nm.focus(), 80);
    [nm, il].forEach(i => i.addEventListener('input', () => { Sound.sfx.type(); i.classList.remove('bad'); }));
    m.q('#f-dice').onclick = () => { il.value = randName(); Sound.sfx.rotate(); m.q('#f-dice').animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 400 }); };
    m.el.querySelectorAll('.av').forEach(b => b.onclick = () => { avatar = b.dataset.a; m.el.querySelectorAll('.av').forEach(x => x.classList.toggle('on', x === b)); Sound.sfx.place(Math.random() * 6 | 0); });
    m.el.querySelectorAll('.pal').forEach(b => b.onclick = () => { palette = b.dataset.p; m.el.querySelectorAll('.pal').forEach(x => x.classList.toggle('on', x === b)); Sound.sfx.click(); });
    const go = () => {
      const name = nm.value.trim().replace(/\s+/g, ' '), isl = il.value.trim().replace(/\s+/g, ' ');
      let ok = true;
      if (name.length < 2) { nm.classList.add('bad'); m.q('#e-name').textContent = 'Escribe al menos 2 letras'; ok = false; } else m.q('#e-name').textContent = '';
      if (isl.length < 2) { il.classList.add('bad'); m.q('#e-island').textContent = 'Tu isla necesita un nombre'; ok = false; } else m.q('#e-island').textContent = '';
      if (!ok) { Sound.sfx.error(); return; }
      const st = newState({ player: name, island: isl, avatar, palette });
      st.lastDay = todayKey(); st.streak = 1;
      Store.save(st);
      m.close(true);
      this.startGame(st, true);
    };
    m.q('#f-go').onclick = go;
    [nm, il].forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }));
  },
  islandsModal() {
    const m = this.modal({ title: 'Mis islas', lead: 'Elige una isla para seguir donde lo dejaste.', body: '<div class="slots" id="slots"></div>', cls: 'wide' });
    const render = () => {
      const list = Store.list();
      if (!list.length) { m.q('#slots').innerHTML = '<div class="empty-state"><div class="em">🌊</div>Aún no tienes islas. ¡Crea la primera!</div>'; return; }
      m.q('#slots').innerHTML = list.map(s => {
        const th = Store.thumb(s.id);
        return `<div class="slot" data-id="${s.id}">
          <div class="th">${th ? `<img src="${th}" alt="">` : '🏝️'}</div>
          <div class="meta"><b>${escapeHtml(s.island)}</b><small>${s.avatar} ${escapeHtml(s.player)} · ${timeAgo(s.lastPlayed)}</small>
            <div class="chips"><span>⭐ Nv ${s.level}</span><span>${coinS} ${fmt(s.coins)}</span><span>🏠 ${s.items.length}</span><span>⏱ ${fmtTime(s.playtime || 0)}</span></div></div>
          <button class="btn primary small" data-play>Jugar</button>
          <button class="del" data-del aria-label="Borrar isla" data-tip="Borrar">${svg('trash')}</button></div>`;
      }).join('');
      m.el.querySelectorAll('.slot').forEach(el => {
        const id = el.dataset.id;
        el.querySelector('[data-play]').onclick = () => { m.close(true); this.startGame(Store.get(id), false); };
        el.querySelector('[data-del]').onclick = () => {
          const s = Store.get(id);
          this.confirm('¿Borrar esta isla?', `Se perderá <b>${escapeHtml(s.island)}</b> para siempre. Esta acción no se puede deshacer.`, 'Borrar', () => { Store.remove(id); Sound.sfx.poof(); render(); this.buildTitleMenu(); }, true);
        };
      });
    };
    render();
  },

  /* ================= INICIO DE PARTIDA ================= */
  startGame(st, isNew) {
    if (!st) { this.toast('No se pudo cargar la isla', 'error'); return; }
    Sound.init(); Sound.sfx.start();
    const away = Date.now() - (st.lastPlayed || Date.now());
    const veil = document.createElement('div'); veil.className = 'fade-veil'; document.body.appendChild(veil);
    setTimeout(() => veil.remove(), 1100);
    $('title').classList.add('leaving');
    setTimeout(() => {
      $('title').classList.add('hidden');
      Game.start(st, false);
      this.shownCoins = st.coins; this.pending = 0;
      const hud = $('hud'); hud.classList.remove('hidden'); hud.classList.add('entering');
      setTimeout(() => hud.classList.remove('entering'), 1200);
      this.buildHUD();
      setTimeout(() => { if (isNew || !st.tutorial) this.tutorial(); else this.welcomeBack(away); }, 700);
    }, 420);
  },
  exitToMenu() {
    Game.stop();
    this.hideInfo(); this.hideTip();
    this.modals.slice().forEach(m => m.close(true));
    this.showTitle();
  },
  tutorial() {
    const st = Game.st;
    const steps = [
      `¡Hola, <b>${escapeHtml(st.player)}</b>! Soy <b>Marea</b>, la tortuga guardiana de <b>${escapeHtml(st.island)}</b>. Te ayudaré a convertir esta isleta en el rincón más bonito del mar. 🌊`,
      `Abajo tienes el <b>catálogo</b>. Elige algo y toca la isla para colocarlo. Las <b>viviendas</b> traen vecinos y los <b>negocios</b> generan monedas ${coinS}.`,
      `Cuando un edificio muestre una moneda ★ encima, <b>tócala para cobrar</b>. ¡También puedes arrastrar el dedo o el ratón por encima de varias a la vez!`,
      `La <b>decoración</b> y la naturaleza dan <b>Encanto 💖</b>: cerca de tus edificios hace que produzcan hasta el <b>doble</b>. Usa <span class="kbd">R</span> para girar objetos.`,
      `Completa <b>misiones</b> 📜, abre los <b>regalos</b> 🎁 que aparecen y sube de nivel para desbloquear cosas nuevas. Tu progreso se guarda solo. ¡A construir!`,
    ];
    let i = 0;
    const m = this.modal({ body: `<div class="mascot"><div class="face">🐢</div><div class="bubble" id="tut-b"></div></div><div class="steps" id="tut-s"></div>`, foot: `<button class="btn" id="tut-skip">Saltar</button><button class="btn primary" id="tut-next">Siguiente</button>`, closable: false });
    const show = () => {
      m.q('#tut-b').innerHTML = steps[i];
      m.q('#tut-b').animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 250 });
      m.q('#tut-s').innerHTML = steps.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
      m.q('#tut-next').textContent = i === steps.length - 1 ? '¡A construir! 🔨' : 'Siguiente';
    };
    const finish = () => { st.tutorial = true; m.close(true); Game.save(false); this.selectCat('casas'); setTimeout(() => { const c = document.querySelector('.card[data-id="cabin"]'); if (c) c.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-14px) scale(1.08)' }, { transform: 'translateY(0)' }], { duration: 600, iterations: 3 }); }, 300); };
    m.q('#tut-next').onclick = () => { Sound.sfx.click(); if (i < steps.length - 1) { i++; show(); } else finish(); };
    m.q('#tut-skip').onclick = () => { Sound.sfx.close(); finish(); };
    show();
  },
  welcomeBack(away) {
    const st = Game.st;
    const today = todayKey(), yest = todayKey(new Date(Date.now() - 864e5));
    let daily = 0;
    if (st.lastDay !== today) {
      st.streak = st.lastDay === yest ? (st.streak || 0) + 1 : 1;
      st.lastDay = today;
      daily = Math.round((40 + 20 * Math.min(st.streak, 7)) * (1 + st.level * 0.15));
    }
    const ready = st.items.filter(it => Game.cyclesOf(it) > 0);
    const waiting = ready.reduce((s, it) => s + Game.incomeOf(it) * Game.cyclesOf(it), 0);
    if (!daily && away < 3 * 60 * 1000) { this.toast(`¡Hola de nuevo, ${escapeHtml(st.player)}! ${st.avatar}`, 'good'); return; }
    const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const sk = daily ? `<p style="margin:14px 0 0;font-weight:600;text-align:center">Recompensa diaria · racha de ${st.streak} ${st.streak === 1 ? 'día' : 'días'} 🔥</p>
      <div class="streak">${[1, 2, 3, 4, 5, 6, 7].map(d => { const cur = ((st.streak - 1) % 7) + 1; return `<div class="${d <= cur ? 'got' : ''} ${d === cur ? 'today' : ''}"><span class="em">${d === 7 ? '💎' : '🎁'}</span>Día ${d}</div>`; }).join('')}</div>
      <div style="text-align:center"><span class="reward-chip">${coinS} +${fmt(daily)}</span></div>` : '';
    const m = this.modal({
      body: `<div class="mascot"><div class="face">🐢</div><div class="bubble">¡Hola de nuevo, <b>${escapeHtml(st.player)}</b>! ${st.avatar} Mientras no estabas, tus vecinos han estado muy ocupados.</div></div>
        <div class="welcome-stats"><div><b>${fmtTime(away / 1000)}</b>tiempo fuera</div><div><b>${coinS} ${fmt(waiting)}</b>monedas esperando</div></div>${sk}`,
      foot: `<button class="btn primary big" id="wb-go" style="width:100%">${waiting || daily ? '¡Recogerlo todo! ✨' : '¡A jugar!'}</button>`, closable: false,
    });
    m.q('#wb-go').onclick = () => {
      const r = m.q('#wb-go').getBoundingClientRect();
      m.close(true);
      if (daily) { Game.addCoinsScreen(daily, r.left + r.width / 2, r.top, 10); Sound.sfx.gift(); Game.confetti(80); }
      if (ready.length) setTimeout(() => Game.collectAll(), 350);
      Game.save(false);
    };
  },

  /* ================= HUD ================= */
  buildHUD() {
    const st = Game.st;
    $('avatar').textContent = st.avatar; $('pname').textContent = st.player; $('iname').textContent = st.island;
    $('profile').onclick = () => { Sound.sfx.click(); this.profileModal(); };
    $('top-actions').innerHTML = `
      <button class="icon-btn" id="b-ach" data-tip="Logros" aria-label="Logros">${svg('trophy')}<span class="badge" id="ach-badge" hidden></span></button>
      <button class="icon-btn opt" id="b-photo" data-tip="Modo foto (P)" aria-label="Modo foto">${svg('camera')}</button>
      <button class="icon-btn opt" id="b-help" data-tip="Ayuda" aria-label="Ayuda">${svg('help')}</button>
      <button class="icon-btn" id="b-set" data-tip="Ajustes" aria-label="Ajustes">${svg('gear')}</button>
      <button class="icon-btn" id="b-home" data-tip="Menú principal" aria-label="Menú principal">${svg('home')}</button>`;
    $('b-ach').onclick = () => { Sound.sfx.click(); this.achModal(); };
    $('b-photo').onclick = () => { Sound.sfx.click(); this.enterPhoto(); };
    $('b-help').onclick = () => { Sound.sfx.click(); this.helpModal(); };
    $('b-set').onclick = () => { Sound.sfx.click(); this.settingsModal(true); };
    $('b-home').onclick = () => { Sound.sfx.click(); this.exitToMenu(); };
    $('tools').innerHTML = `
      <button class="tool" data-t="hand" data-tip="Mano (H) · cobrar e inspeccionar">${svg('hand')}<span>Mano</span></button>
      <button class="tool" data-t="move" data-tip="Mover (M)">${svg('move')}<span>Mover</span></button>
      <button class="tool remove" data-t="remove" data-tip="Vender (X) · recuperas el 50 %">${svg('trash')}<span>Vender</span></button>
      <button class="tool" data-t="undo" data-tip="Deshacer (Ctrl+Z)">${svg('undo')}<span>Deshacer</span></button>`;
    $('tools').querySelectorAll('.tool').forEach(b => b.onclick = () => {
      const t = b.dataset.t;
      if (t === 'undo') { Game.undo(); return; }
      Sound.sfx.click(); Game.setTool(t);
    });
    $('zoom').innerHTML = `<button data-z="in" aria-label="Acercar" data-tip="Acercar">${svg('plus')}</button><button data-z="out" aria-label="Alejar" data-tip="Alejar">${svg('minus')}</button><button data-z="c" aria-label="Centrar" data-tip="Centrar vista">${svg('target')}</button>`;
    $('zoom').querySelectorAll('button').forEach(b => b.onclick = () => { Sound.sfx.soft(); const z = b.dataset.z; if (z === 'in') Game.zoomBy(1.25); else if (z === 'out') Game.zoomBy(0.8); else Game.centerView(); });
    $('tabs').innerHTML = CATS.map(c => `<button class="tab" data-c="${c.id}">${svg(CAT_ICO[c.id])}<span class="lbl">${c.name}</span></button>`).join('');
    $('tabs').querySelectorAll('.tab').forEach(b => b.onclick = () => { Sound.sfx.click(); this.selectCat(b.dataset.c); });
    $('cards').addEventListener('wheel', e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); $('cards').scrollLeft += e.deltaY; } }, { passive: false });
    $('collect-all').onclick = () => { Game.collectAll(); };
    $('expand-btn').onclick = () => this.expandModal();
    const setDock = () => document.documentElement.style.setProperty('--dockh', $('dock').offsetHeight + 'px');
    if (!this._dockRO && window.ResizeObserver) { this._dockRO = new ResizeObserver(setDock); this._dockRO.observe($('dock')); }
    setTimeout(setDock, 50);
    this.selectCat(this.cat);
    this.renderQuests(true);
    this.refreshHUD(true);
    this.toolChanged();
  },
  selectCat(cat) {
    this.cat = cat;
    $('tabs').querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.c === cat));
    this.renderCards();
  },
  isNew(id, kind) {
    const st = Game.st; st.seen = st.seen || {};
    const d = kind === 'terrain' ? TERRAINS[id] : ITEM[id];
    if (d.lvl <= 1 || st.level < d.lvl || st.seen[kind + id]) return false;
    return kind === 'terrain' ? !st.stats.painted[id] : !st.stats.placed[id];
  },
  renderCards() {
    const st = Game.st, cat = this.cat;
    let list;
    if (cat === 'suelo') list = TERRAIN_IDS.filter(t => !TERRAINS[t].hidden).map(t => ({ kind: 'terrain', id: t, d: TERRAINS[t] }));
    else list = ITEMS.filter(i => i.cat === cat).sort((a, b) => a.lvl - b.lvl || a.cost - b.cost).map(i => ({ kind: 'item', id: i.id, d: i }));
    $('cards').innerHTML = list.map((e, i) => `<button class="card" style="--i:${i}" data-id="${e.id}" data-kind="${e.kind}">
      <img src="${iconURL(e.id, e.kind)}" alt="" draggable="false"><span class="nm">${e.d.name}</span>
      <span class="pr ${e.d.cost ? '' : 'free'}">${e.d.cost ? coinS + fmt(e.d.cost) : 'Gratis'}</span></button>`).join('');
    $('cards').scrollLeft = 0;
    $('cards').querySelectorAll('.card').forEach(b => {
      b.onclick = () => this.pickCard(b);
      b.onpointerenter = () => this.cardTip(b);
      b.onpointerleave = () => this.hideTip();
    });
    this.refreshDock();
  },
  pickCard(b) {
    const st = Game.st, id = b.dataset.id, kind = b.dataset.kind, d = kind === 'terrain' ? TERRAINS[id] : ITEM[id];
    if (st.level < d.lvl) { Sound.sfx.error(); this.toast(`🔒 Se desbloquea en el nivel ${d.lvl}`, 'error'); b.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 300 }); return; }
    st.seen = st.seen || {}; st.seen[kind + id] = 1;
    if (Game.sel === id) { Game.setTool('hand'); Sound.sfx.close(); return; }
    Sound.sfx.pickup();
    Game.setTool(kind === 'terrain' ? 'paint' : 'build', id);
    this.hideTip();
  },
  cardTip(b) {
    const id = b.dataset.id, kind = b.dataset.kind, d = kind === 'terrain' ? TERRAINS[id] : ITEM[id], st = Game.st;
    let h = `<b>${d.name}</b><span class="muted">${d.desc || ''}</span><div class="row">`;
    if (kind === 'item') {
      if (d.income) h += `<span class="ok">${coinS} ${d.income} / ${d.period} s</span>`;
      if (d.pop) h += `<span>🧑‍🌾 +${d.pop}</span>`;
      if (d.beauty) h += `<span>💖 +${d.beauty}</span>`;
      if (d.w > 1) h += `<span class="muted">${d.w}×${d.h}</span>`;
    } else if (d.beauty) h += `<span>💖 +${d.beauty}</span>`;
    if (st.level < d.lvl) h += `<span class="warn">🔒 Nivel ${d.lvl}</span>`;
    else if (st.coins < d.cost) h += `<span class="warn">Te faltan ${fmt(d.cost - st.coins)} monedas</span>`;
    h += '</div>';
    const r = b.getBoundingClientRect();
    this.showTip(h, r.left + r.width / 2, r.top - 10, 'above');
  },
  refreshDock() {
    if (!Game.st || Game.demo) return;
    const st = Game.st;
    $('cards').querySelectorAll('.card').forEach(b => {
      const id = b.dataset.id, kind = b.dataset.kind, d = kind === 'terrain' ? TERRAINS[id] : ITEM[id];
      const locked = st.level < d.lvl;
      b.classList.toggle('locked', locked);
      b.classList.toggle('poor', !locked && st.coins < d.cost);
      b.classList.toggle('sel', Game.sel === id);
      let lk = b.querySelector('.lock');
      if (locked && !lk) { lk = document.createElement('span'); lk.className = 'lock'; lk.textContent = '🔒 Nv ' + d.lvl; b.appendChild(lk); }
      if (!locked && lk) lk.remove();
      const nw = this.isNew(id, kind); let ne = b.querySelector('.new');
      if (nw && !ne) { ne = document.createElement('span'); ne.className = 'new'; ne.textContent = '¡Nuevo!'; b.appendChild(ne); }
      if (!nw && ne) ne.remove();
    });
    $('tabs').querySelectorAll('.tab').forEach(t => {
      const c = t.dataset.c;
      const has = c === 'suelo' ? TERRAIN_IDS.some(id => !TERRAINS[id].hidden && this.isNew(id, 'terrain')) : ITEMS.some(i => i.cat === c && this.isNew(i.id, 'item'));
      let dt = t.querySelector('.dot');
      if (has && !dt) { dt = document.createElement('span'); dt.className = 'dot'; t.appendChild(dt); }
      if (!has && dt) dt.remove();
    });
  },
  toolChanged() {
    if (!Game.st || Game.demo) return;
    $('tools').querySelectorAll('.tool').forEach(b => b.classList.toggle('on', b.dataset.t === Game.tool && !(Game.tool === 'build' || Game.tool === 'paint')));
    this.refreshDock();
    if (Game.tool !== 'hand') this.hideInfo();
    this.updateHint();
  },
  updateHint() {
    const h = $('hint'), t = Game.tool, st = Game.st;
    let txt = '', btns = '';
    if (t === 'build') { const d = ITEM[Game.sel]; txt = `Toca la isla para colocar <b>${d.name}</b>`; btns = `<button data-h="rot">${svg('rotate')}Girar <span class="kbd" style="background:transparent;border-color:rgba(255,255,255,.3);color:#fff">R</span></button><button data-h="end">${svg('x')}Terminar</button>`; }
    else if (t === 'paint') { const d = TERRAINS[Game.sel]; txt = `Arrastra para pintar <b>${d.name}</b>`; btns = `<button data-h="b1" class="${Game.brush === 1 ? 'on' : ''}">1×1</button><button data-h="b3" class="${Game.brush === 3 ? 'on' : ''}">3×3</button><button data-h="end">${svg('x')}Terminar</button>`; }
    else if (t === 'move') { txt = Game.carry ? `Elige dónde soltar <b>${ITEM[Game.carry.id].name}</b>` : 'Toca un objeto para moverlo'; btns = (Game.carry ? `<button data-h="rot">${svg('rotate')}Girar</button>` : '') + `<button data-h="end">${svg('x')}Terminar</button>`; }
    else if (t === 'remove') { txt = 'Toca un objeto para venderlo (recuperas el 50 %)'; btns = `<button data-h="end">${svg('x')}Terminar</button>`; }
    else if (st.stats.collects < 8) txt = matchMedia('(pointer: coarse)').matches ? 'Toca las monedas ★ para cobrar · Arrastra para moverte' : 'Toca las monedas ★ para cobrar · Arrastra para moverte · Rueda para zoom';
    h.innerHTML = txt ? `<span class="txt">${txt}</span>${btns}` : '';
    h.classList.toggle('empty', !txt);
    h.querySelectorAll('button').forEach(b => b.onclick = () => {
      const a = b.dataset.h;
      if (a === 'rot') { Game.flip = !Game.flip; Sound.sfx.rotate(); }
      if (a === 'end') { Game.setTool('hand'); Sound.sfx.close(); }
      if (a === 'b1' || a === 'b3') { Game.brush = a === 'b1' ? 1 : 3; Sound.sfx.click(); this.updateHint(); }
    });
  },
  refreshHUD(force) {
    const st = Game.st; if (!st || Game.demo) return;
    const need = xpNeeded(st.level), pct = st.level >= MAX_LEVEL ? 1 : clamp(st.xp / need, 0, 1);
    const key = st.level + '|' + Math.floor(st.xp) + '|' + Game.beauty + '|' + Game.pop;
    if (force || key !== this._hudKey) {
      if (this._lvl != null && this._lvl !== st.level) this.bump('profile');
      if (this._beauty != null && Game.beauty > this._beauty) this.bump('pill-beauty');
      if (this._pop != null && Game.pop > this._pop) this.bump('pill-pop');
      this._lvl = st.level; this._beauty = Game.beauty; this._pop = Game.pop; this._hudKey = key;
      $('lvl').textContent = st.level;
      $('xp-ring').style.strokeDashoffset = 132 * (1 - pct);
      $('xpfill').style.width = (pct * 100) + '%';
      $('xptext').textContent = st.level >= MAX_LEVEL ? 'Nivel máximo' : `${Math.floor(st.xp)} / ${need} XP`;
      $('beauty').textContent = fmt(Game.beauty); $('pop').textContent = fmt(Game.pop);
    }
    // reloj
    const ph = ENV.phase;
    const [ic, tx] = ph < 0.07 ? ['🌅', 'Amanecer'] : ph < 0.52 ? ['☀️', 'Día'] : ph < 0.64 ? ['🌇', 'Atardecer'] : ph < 0.92 ? ['🌙', 'Noche'] : ['🌅', 'Amanecer'];
    if ($('clock-txt').textContent !== tx) { $('clock-txt').textContent = tx; $('clock-ico').textContent = ic; }
    // recoger todo
    const ready = st.items.reduce((n, it) => n + (Game.cyclesOf(it) > 0 ? 1 : 0), 0);
    const ca = $('collect-all');
    if (ready >= 2) { ca.hidden = false; const h = `<span class="em">🧺</span><span>Recoger todo<small>${ready} edificios listos · C</small></span>`; if (ca._h !== h) { ca.innerHTML = h; ca._h = h; } ca.classList.add('ready'); }
    else ca.hidden = true;
    // ampliar
    const e = Game.expandCost(), eb = $('expand-btn');
    if (e) {
      eb.hidden = false;
      const can = st.level >= e.lvl, rich = st.coins >= e.cost;
      const h = `<span class="em">🏝️</span><span>Ampliar isla<small>${can ? `${coinS} ${fmt(e.cost)}` : `🔒 Nivel ${e.lvl}`}</small></span>`;
      if (eb._h !== h) { eb.innerHTML = h; eb._h = h; }
      eb.classList.toggle('locked', !can); eb.classList.toggle('ready', can && rich);
    } else eb.hidden = true;
    // logros sin ver
    const nAch = Object.keys(st.ach).length, seen = st.achSeen || 0, badge = $('ach-badge');
    if (badge) { badge.hidden = nAch <= seen; badge.textContent = nAch - seen; }
  },
  tick(dt) {
    if (!Game.st || Game.demo) return;
    const st = Game.st, target = st.coins - this.pending;
    if (Math.abs(target - this.shownCoins) > 0.5) this.shownCoins += (target - this.shownCoins) * Math.min(1, dt * 9);
    else this.shownCoins = target;
    const txt = fmt(Math.round(this.shownCoins));
    if (this._coinTxt !== txt) { $('coins').textContent = txt; this._coinTxt = txt; }
    this.coinChainT -= dt; if (this.coinChainT <= 0) this.coinChain = 0;
    this.hudT += dt;
    if (this.hudT > 0.25) { this.hudT = 0; this.refreshHUD(); this.updateInfo(); }
  },
  bump(id) { const el = $(id); if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); },
  shakeCoins() { const el = $('pill-coins'); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); },
  saved() { const el = $('savedot'); el.classList.add('show'); clearTimeout(this._svT); this._svT = setTimeout(() => el.classList.remove('show'), 1300); },
  combo(n) {
    const el = $('combo');
    el.innerHTML = `x${n}<small>${n >= 15 ? '¡IMPARABLE!' : n >= 10 ? '¡INCREÍBLE!' : n >= 6 ? '¡GENIAL!' : 'COMBO'}</small>`;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    el.style.fontSize = Math.min(48, 26 + n * 1.2) + 'px';
    clearTimeout(this._cbT); this._cbT = setTimeout(() => el.classList.remove('show'), 1600);
  },

  /* ================= MONEDAS VOLADORAS ================= */
  flyCoins(sx, sy, amount, count) {
    if (!Game.st || Game.demo) return;
    const fx = $('fx'), tgt = $('pill-coins').querySelector('.coin-ico').getBoundingClientRect();
    const ex = tgt.left + tgt.width / 2, ey = tgt.top + tgt.height / 2;
    count = Math.max(1, Math.min(10, count || Math.min(8, 1 + Math.floor(Math.log2(amount + 1)))));
    if (!document.body.animate || this.settingsLow()) { this.bump('pill-coins'); Sound.sfx.coin(this.coinChain++); this.coinChainT = 0.6; return; }
    this.pending += amount;
    let left = amount;
    for (let i = 0; i < count; i++) {
      const share = i === count - 1 ? left : Math.floor(amount / count); left -= share;
      const el = document.createElement('div'); el.className = 'fly-coin'; fx.appendChild(el);
      const ox = sx + (Math.random() - 0.5) * 34, oy = sy + (Math.random() - 0.5) * 20;
      const cx = ox + (Math.random() - 0.5) * 180, cy = Math.min(oy, ey) - 30 - Math.random() * 90;
      const frames = [];
      for (let k = 0; k <= 12; k++) {
        const u = k / 12, x = (1 - u) * (1 - u) * ox + 2 * (1 - u) * u * cx + u * u * ex, y = (1 - u) * (1 - u) * oy + 2 * (1 - u) * u * cy + u * u * ey;
        const s = u < 0.15 ? 0.3 + u / 0.15 * 0.9 : 1.2 - u * 0.55;
        frames.push({ transform: `translate(${x}px,${y}px) scale(${s}) rotate(${u * 360}deg)` });
      }
      const a = el.animate(frames, { duration: 620 + Math.random() * 220, delay: i * 55, easing: 'cubic-bezier(.4,.1,.7,.6)', fill: 'both' });
      const done = () => { el.remove(); this.pending = Math.max(0, this.pending - share); Sound.sfx.coin(this.coinChain++); this.coinChainT = 0.6; this.bump('pill-coins'); };
      a.onfinish = done; a.oncancel = done;
    }
  },
  settingsLow() { return false; },

  /* ================= MISIONES ================= */
  renderQuests(full) {
    const st = Game.st; if (!st || Game.demo) return;
    const el = $('quests');
    const icon = q => ({ place: '🔨', cat: q.param === 'deco' ? '🎀' : q.param === 'casas' ? '🏠' : '🏪', tag: q.param === 'tree' ? '🌳' : '🌷', paint: '🎨', collect: '🪙', beauty: '💖', pop: '🧑‍🌾', level: '⭐', gifts: '🎁', expand: '🏝️', earned: '💰' }[q.type] || '📜');
    if (full || !el._built) {
      el._built = true;
      const collapsed = Game.settings.questsCollapsed != null ? Game.settings.questsCollapsed : window.innerWidth < 720;
      el.classList.toggle('collapsed', !!collapsed);
      const nDone = st.quests.filter(q => q.done).length;
      el.innerHTML = `<div class="q-head" id="q-head"><span>📜 Misiones ${nDone ? `<span class="badge" style="background:var(--pink);color:#fff;border-radius:10px;padding:0 7px;font-size:12px">${nDone}</span>` : ''}</span>${svg('caret', 'i caret')}</div>
        <div class="q-list">${st.quests.map(q => {
          const p = Game.questProgress(q);
          return `<div class="quest${q.done ? ' done' : ''}" data-k="${q.k}"><div class="qt"><span class="em">${icon(q)}</span><span>${q.title}</span></div>
          <div class="qbar"><i style="width:${p / q.target * 100}%"></i></div>
          <div class="qf"><span class="pv">${fmt(p)} / ${fmt(q.target)}</span><span class="rw"><span>${coinS}${fmt(q.coins)}</span>${q.xp ? `<span>⭐${q.xp}</span>` : ''}</span></div>
          ${q.done ? `<button class="btn primary small claim">🎉 ¡Reclamar!</button>` : ''}</div>`;
        }).join('')}</div>`;
      $('q-head').onclick = () => { Sound.sfx.soft(); el.classList.toggle('collapsed'); Game.settings.questsCollapsed = el.classList.contains('collapsed'); Store.saveSettings(Game.settings); };
      el.querySelectorAll('.claim').forEach(b => b.onclick = e => {
        e.stopPropagation();
        const r = b.getBoundingClientRect();
        Game.claimQuest(b.closest('.quest').dataset.k, r.left + r.width / 2, r.top + r.height / 2);
      });
    } else {
      for (const q of st.quests) {
        const qe = el.querySelector(`.quest[data-k="${q.k}"]`); if (!qe) continue;
        const p = Game.questProgress(q);
        qe.querySelector('.qbar i').style.width = (p / q.target * 100) + '%';
        const pv = qe.querySelector('.pv'), t = `${fmt(p)} / ${fmt(q.target)}`; if (pv.textContent !== t) pv.textContent = t;
      }
    }
  },

  /* ================= INFO DE OBJETO ================= */
  showInfo(it) {
    const d = ITEM[it.id], el = $('info');
    this.infoItem = it;
    const bld = isBuilding(d);
    const refund = Math.floor(d.cost * 0.5);
    el.innerHTML = `<div class="ih"><img src="${iconURL(d.id)}" alt=""><div><h3>${d.name}</h3><p>${d.desc}</p></div><button class="close" aria-label="Cerrar">${svg('x')}</button></div>
      <div class="stats">
        ${bld ? `<span class="stat">${coinS} ${this.incomeTxt(it)} cada ${d.period} s</span>` : ''}
        ${bld && it.bonus ? `<span class="stat good">💖 +${Math.round(it.bonus * 100)} % por encanto</span>` : ''}
        ${d.pop ? `<span class="stat">🧑‍🌾 ${d.pop} habitantes</span>` : ''}
        ${d.beauty ? `<span class="stat good">💖 Encanto +${d.beauty}</span>` : ''}
        ${!bld && d.beauty ? `<span class="stat">Mejora edificios a 3 casillas</span>` : ''}
      </div>
      ${bld ? `<div class="prog"><i id="info-prog"></i></div><div class="ptxt" id="info-ptxt"></div>` : ''}
      <div class="acts">
        ${bld ? `<button class="btn primary" id="i-col">Cobrar</button>` : ''}
        <button class="btn" id="i-mov">${svg('move')}Mover</button>
        <button class="btn" id="i-rot">${svg('rotate')}Girar</button>
        <button class="btn danger" id="i-sell">${svg('trash')}+${fmt(refund)}</button>
      </div>`;
    el.classList.remove('hidden');
    $('hint').classList.add('empty');
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    el.querySelector('.close').onclick = () => { Sound.sfx.close(); this.hideInfo(); };
    if (bld) $('i-col').onclick = () => { if (!Game.collect(it)) { Sound.sfx.error(); this.toast('Todavía está trabajando…', 'info'); } };
    $('i-mov').onclick = () => { Sound.sfx.pickup(); Game.setTool('move'); Game.carry = it; Game.flip = !!it.f; Game.rebuildOccExcept(it); this.toolChanged(); };
    $('i-rot').onclick = () => { it.f = it.f ? 0 : 1; it.pulse = performance.now(); Sound.sfx.rotate(); Game.dirty = true; };
    $('i-sell').onclick = () => {
      const sell = () => Game.removeItem(it);
      if (d.cost >= 200) this.confirm(`¿Vender ${d.name}?`, `Recuperarás <b>${fmt(refund)}</b> monedas (el 50 %). Puedes deshacerlo con Ctrl+Z.`, 'Vender', sell, true);
      else sell();
    };
    this.updateInfo();
  },
  incomeTxt(it) { return fmt(Game.incomeOf(it)); },
  updateInfo() {
    const it = this.infoItem; if (!it || $('info').classList.contains('hidden')) return;
    if (!Game.st.items.includes(it)) { this.hideInfo(); return; }
    const d = ITEM[it.id]; if (!isBuilding(d)) return;
    const cyc = Game.cyclesOf(it), p = cyc >= MAX_STACK ? 1 : ((Date.now() - it.t) / (d.period * 1000)) % 1;
    const pr = $('info-prog'); if (pr) pr.style.width = (p * 100) + '%';
    const left = d.period - ((Date.now() - it.t) / 1000) % d.period;
    const pt = $('info-ptxt');
    if (pt) pt.innerHTML = cyc >= MAX_STACK ? `¡Almacén lleno! (${cyc}/${MAX_STACK}) Cobra para seguir produciendo` : `${cyc ? `<b>${cyc}× listo</b> · ` : ''}Siguiente en ${fmtTime(left)} · almacén ${cyc}/${MAX_STACK}`;
    const b = $('i-col'); if (b) { b.disabled = !cyc; b.innerHTML = cyc ? `${coinS} Cobrar ${fmt(Game.incomeOf(it) * cyc)}` : 'Trabajando…'; }
  },
  hideInfo() { const was = !$('info').classList.contains('hidden'); $('info').classList.add('hidden'); this.infoItem = null; if (was && Game.st && !Game.demo) this.updateHint(); },
  hoverTip(it, sx, sy) {
    if (!it) { if (this._hoverTip) { this.hideTip(); this._hoverTip = false; } return; }
    const d = ITEM[it.id];
    let h = `<b>${d.name}</b>`;
    if (isBuilding(d)) {
      const cyc = Game.cyclesOf(it);
      h += cyc ? `<span class="ok">¡Listo! Toca para cobrar ${coinS} ${fmt(Game.incomeOf(it) * cyc)}</span>` : `<span class="muted">${coinS} ${fmt(Game.incomeOf(it))} en ${fmtTime(d.period - ((Date.now() - it.t) / 1000) % d.period)}</span>`;
    } else if (d.beauty) h += `<span class="muted">💖 Encanto +${d.beauty}</span>`;
    this.showTip(h, sx + 16, sy + 18, 'right');
    this._hoverTip = true;
  },
  showTip(html, x, y, mode) {
    const t = $('tip'); t.innerHTML = html; t.classList.add('show');
    const r = t.getBoundingClientRect();
    let left = x, top = y;
    if (mode === 'above') { left = x - r.width / 2; top = y - r.height; }
    if (mode === 'below') { left = x - r.width / 2; }
    left = clamp(left, 8, window.innerWidth - r.width - 8); top = clamp(top, 8, window.innerHeight - r.height - 8);
    t.style.left = left + 'px'; t.style.top = top + 'px';
  },
  hideTip() { $('tip').classList.remove('show'); },

  /* ================= TOASTS / LOGROS / NIVEL ================= */
  toast(msg, kind = 'info', ms = 2600) {
    const box = $('toasts');
    while (box.children.length > 3) box.firstChild.remove();
    const t = document.createElement('div'); t.className = 'toast ' + kind; t.innerHTML = msg; box.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, ms);
  },
  achievement(a) {
    this.toast(`<div class="big">${a.icon}</div><div><small>Logro desbloqueado</small>${a.name}</div>`, 'ach', 4000);
    this.refreshHUD(true);
  },
  levelUp(lv, unlocks, reward) {
    const items = unlocks.slice(0, 8).map((u, i) => `<div class="unlock" style="--i:${i}"><img src="${iconURL(u.id, u.kind)}" alt=""><b>${u.name}</b></div>`).join('');
    const exp = EXPANSIONS.find(e => e.lvl === lv);
    let given = false;
    const give = (btn) => {
      if (given) return; given = true;
      const r = (btn || $('modals')).getBoundingClientRect();
      Game.addCoinsScreen(reward, r.left + r.width / 2, r.top + r.height / 2, 10);
    };
    const m = this.modal({
      cls: 'lvl-modal',
      body: `<div class="lvl-burst"><div class="rays"></div><div class="star">${lv}</div></div>
        <h2>¡Nivel ${lv}!</h2><p class="lead" style="margin-bottom:6px">¡Tu isla no para de crecer, ${escapeHtml(Game.st.player)}!</p>
        <span class="reward-chip">${coinS} +${fmt(reward)}</span>
        ${items ? `<p style="margin:6px 0 0;font-weight:600">Desbloqueado:</p><div class="unlocks">${items}</div>` : ''}
        ${exp ? `<p style="margin:10px 0 0;color:var(--ink2)">🏝️ ¡Ya puedes <b>ampliar tu isla</b>!</p>` : ''}`,
      foot: `<button class="btn primary big" id="lv-ok" style="min-width:200px">¡Genial! ✨</button>`,
      onClose: () => give(),
    });
    m.el.querySelector('.foot').classList.add('center');
    m.q('#lv-ok').onclick = () => { give(m.q('#lv-ok')); Sound.sfx.click(); m.close(); };
    this.refreshDock(); this.refreshHUD(true);
  },
  expandModal() {
    const e = Game.expandCost(); if (!e) return;
    const st = Game.st;
    if (st.level < e.lvl) { Sound.sfx.error(); this.toast(`🔒 Necesitas nivel ${e.lvl} para ampliar la isla`, 'error'); return; }
    this.confirm('Ampliar isla 🏝️', `Tu isla ganará un anillo nuevo de tierra con playa para seguir construyendo.<br><br>Coste: <b>${fmt(e.cost)}</b> monedas.`, `Ampliar · ${fmt(e.cost)}`, () => Game.expand());
  },

  /* ================= MODALES ================= */
  modalOpen() { return this.modals.length > 0; },
  modal({ title, lead, body, foot, cls, onClose, closable = true }) {
    this.hideTip();
    const ov = document.createElement('div'); ov.className = 'overlay';
    ov.innerHTML = `<div class="modal ${cls || ''}" role="dialog" aria-modal="true">${closable ? `<button class="x" data-close aria-label="Cerrar">${svg('x')}</button>` : ''}${title ? `<h2>${title}</h2>` : ''}${lead ? `<p class="lead">${lead}</p>` : ''}<div class="mb">${body || ''}</div>${foot ? `<div class="foot">${foot}</div>` : ''}</div>`;
    $('modals').appendChild(ov);
    // que el foco no se quede en el botón de detrás (Espacio/Intro volverían a pulsarlo)
    const box = ov.querySelector('.modal'); box.tabIndex = -1;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    try { box.focus({ preventScroll: true }); } catch (e) { }
    const m = {
      el: ov, closable, q: s => ov.querySelector(s),
      close: (silent) => {
        if (m.closed) return; m.closed = true;
        ov.classList.add('out'); setTimeout(() => ov.remove(), 230);
        this.modals = this.modals.filter(x => x !== m);
        if (onClose) onClose();
      },
    };
    ov.addEventListener('pointerdown', e => { if (e.target === ov && closable) { Sound.sfx.close(); m.close(); } });
    ov.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { Sound.sfx.close(); m.close(); });
    Sound.sfx.open();
    this.modals.push(m);
    return m;
  },
  confirm(title, text, ok, fn, danger) {
    const m = this.modal({ title, body: `<p style="margin:4px 0 0;font-size:15.5px;line-height:1.5;color:var(--ink2)">${text}</p>`, foot: `<button class="btn" data-close>Cancelar</button><button class="btn ${danger ? 'danger' : 'primary'}" id="cf-ok">${ok}</button>` });
    m.q('#cf-ok').onclick = () => { m.close(true); fn(); };
  },
  settingsModal(inGame) {
    const s = Game.settings;
    const seg = (key, opts) => `<div class="seg" data-key="${key}">${opts.map(([v, l]) => `<button data-v="${v}" class="${s[key] === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    const m = this.modal({
      title: 'Ajustes ⚙️',
      body: `
      <div class="set-row"><div class="lbl">🎵 Música</div><input type="range" min="0" max="1" step="0.05" value="${s.music}" id="s-music"></div>
      <div class="set-row"><div class="lbl">🔊 Efectos</div><input type="range" min="0" max="1" step="0.05" value="${s.sfx}" id="s-sfx"></div>
      <div class="set-row"><div class="lbl">🌗 Día y noche<small>Ciclo de ${DAY_LEN / 60} minutos</small></div>${seg('daynight', [['auto', 'Auto'], ['day', 'Día'], ['night', 'Noche']])}</div>
      <div class="set-row"><div class="lbl">✨ Partículas<small>Bájalas si va lento</small></div>${seg('particles', [['high', 'Altas'], ['low', 'Bajas']])}</div>
      <div class="set-row"><div class="lbl">▦ Cuadrícula siempre visible</div><button class="toggle ${s.grid ? 'on' : ''}" id="s-grid" aria-label="Cuadrícula"></button></div>
      <div class="set-row"><div class="lbl">🖥️ Pantalla completa</div><button class="btn small" id="s-fs">Alternar</button></div>
      <div class="set-row"><div class="lbl">💾 Copia de seguridad<small>${inGame ? 'Exporta esta isla a un archivo' : 'Exporta o importa tus islas'}</small></div><div class="btn-row"><button class="btn small" id="s-exp">Exportar</button><button class="btn small" id="s-imp">Importar</button></div></div>
      ${inGame ? `<div class="set-row"><div class="lbl">🏠 Menú principal<small>Tu progreso se guarda automáticamente</small></div><button class="btn small" id="s-menu">Salir</button></div>` : ''}`,
      foot: '<button class="btn primary" data-close>Listo</button>',
    });
    const rng = (el, key) => {
      const upd = () => { el.style.setProperty('--v', (el.value * 100) + '%'); };
      upd();
      el.oninput = () => { s[key] = parseFloat(el.value); upd(); Sound.setVolumes(s.music, s.sfx); if (key === 'music' && s.music > 0) Sound.setMusicEnabled(s.musicOn = true); Store.saveSettings(s); };
      el.onchange = () => { if (key === 'sfx') Sound.sfx.coin(); };
    };
    rng(m.q('#s-music'), 'music'); rng(m.q('#s-sfx'), 'sfx');
    m.el.querySelectorAll('.seg').forEach(sg => sg.querySelectorAll('button').forEach(b => b.onclick = () => {
      s[sg.dataset.key] = b.dataset.v; sg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); Store.saveSettings(s); Sound.sfx.click();
    }));
    m.q('#s-grid').onclick = () => { s.grid = !s.grid; m.q('#s-grid').classList.toggle('on', s.grid); Store.saveSettings(s); Sound.sfx.click(); };
    m.q('#s-fs').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => { }); };
    m.q('#s-exp').onclick = () => {
      const data = inGame ? JSON.stringify(Game.st) : JSON.stringify(Store.db());
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      a.download = inGame ? `isleta-${Game.st.island.replace(/\s+/g, '-').toLowerCase()}.json` : 'isleta-copia.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      this.toast('💾 Copia exportada', 'good');
    };
    m.q('#s-imp').onclick = () => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
      inp.onchange = () => {
        const f = inp.files[0]; if (!f) return;
        f.text().then(txt => {
          try {
            const o = JSON.parse(txt), db = Store.db();
            let n = 0;
            const valid = s2 => s2 && typeof s2 === 'object' && s2.id && Array.isArray(s2.terrain) && Array.isArray(s2.items) && s2.island;
            if (o.slots) Object.values(o.slots).forEach(s2 => { if (valid(s2)) { db.slots[s2.id] = s2; n++; } });
            else if (valid(o)) { if (Game.st && o.id === Game.st.id) o.id = o.id + 'b'; db.slots[o.id] = o; n++; }
            if (!n) throw new Error('vacío');
            Store.write(db); this.toast(`📥 ${n} ${n === 1 ? 'isla importada' : 'islas importadas'}`, 'good');
            if (!inGame) this.buildTitleMenu();
          } catch (e) { this.toast('El archivo no es una copia válida', 'error'); }
        });
      };
      inp.click();
    };
    if (inGame) m.q('#s-menu').onclick = () => { m.close(true); this.exitToMenu(); };
  },
  helpModal() {
    this.modal({
      title: 'Cómo jugar ❓', cls: 'wide',
      body: `<div class="help">
        <p class="lead" style="margin:0">En <b>Isleta</b> construyes y decoras tu propia isla. No hay prisa ni forma de perder: ¡solo crear algo bonito!</p>
        <h3>🌱 Lo básico</h3><ul>
          <li>🏠 <span><b>Viviendas</b> traen habitantes que pasean por la isla y producen algunas monedas.</span></li>
          <li>🏪 <span><b>Negocios</b> generan monedas cada cierto tiempo. Toca la moneda ★ para cobrar (se acumulan hasta ${MAX_STACK} veces).</span></li>
          <li>💖 <span><b>Encanto</b>: la naturaleza y la decoración a 3 casillas de un edificio aumentan su producción hasta un +100 %.</span></li>
          <li>⭐ <span>Ganas <b>experiencia</b> al construir, cobrar y completar misiones. Cada nivel desbloquea objetos nuevos.</span></li>
          <li>🏝️ <span>Cuando subas de nivel podrás <b>ampliar la isla</b> para tener más espacio.</span></li>
          <li>🎁 <span>De vez en cuando aparecen <b>regalos</b>. ¡Tócalos antes de que se vayan! Y vuelve cada día para tu <b>recompensa diaria</b>.</span></li>
          <li>🔥 <span>Encadena acciones rápidas para hacer <b>combos</b>: cada x10 te da monedas extra.</span></li>
        </ul>
        <h3>🖱️ Controles</h3><ul>
          <li><span class="kbd">Clic</span><span>Colocar, cobrar o inspeccionar</span></li>
          <li><span class="kbd">Arrastrar</span><span>Mover la cámara · pintar suelo · recoger varias monedas</span></li>
          <li><span class="kbd">Rueda</span><span>Zoom (o pellizca en el móvil)</span></li>
          <li><span class="kbd">Clic dcho.</span><span>Cancelar la herramienta</span></li>
          <li><span class="kbd">R</span><span>Girar el objeto</span></li>
          <li><span class="kbd">H</span> <span class="kbd">M</span> <span class="kbd">X</span><span>Mano · Mover · Vender</span></li>
          <li><span class="kbd">B</span><span>Pincel 1×1 / 3×3 al pintar</span></li>
          <li><span class="kbd">C</span><span>Recoger todas las monedas</span></li>
          <li><span class="kbd">Ctrl</span> + <span class="kbd">Z</span><span>Deshacer</span></li>
          <li><span class="kbd">WASD</span><span>Mover la cámara</span></li>
          <li><span class="kbd">P</span><span>Modo foto</span></li>
          <li><span class="kbd">Esc</span><span>Cerrar / cancelar</span></li>
        </ul></div>`,
      foot: '<button class="btn primary" data-close>¡Entendido!</button>',
    });
  },
  achModal() {
    const st = Game.st, got = Object.keys(st.ach).length;
    st.achSeen = got; this.refreshHUD(true);
    this.modal({
      title: 'Logros 🏆', cls: 'wide', lead: `Has conseguido ${got} de ${ACHIEVEMENTS.length}`,
      body: `<div class="ach-progress"><i style="width:${got / ACHIEVEMENTS.length * 100}%"></i></div><div class="achs">${ACHIEVEMENTS.map(a => {
        const t = st.ach[a.id];
        return `<div class="ach ${t ? 'got' : ''}"><div class="em">${a.icon}</div><b>${a.name}</b><small>${a.desc}</small>${t ? `<small class="when">✓ ${new Date(t).toLocaleDateString('es-ES')}</small>` : ''}</div>`;
      }).join('')}</div>`,
    });
  },
  profileModal() {
    const st = Game.st, S = st.stats;
    const m = this.modal({
      title: `${st.avatar} ${escapeHtml(st.player)}`, lead: `Alcalde/sa de <b>${escapeHtml(st.island)}</b> · Nivel ${st.level}`,
      body: `<div class="welcome-stats">
        <div><b>${fmtTime(st.playtime)}</b>tiempo de juego</div><div><b>${fmt(S.earned)}</b>monedas ganadas</div>
        <div><b>${st.items.length}</b>objetos en la isla</div><div><b>${fmt(S.collects)}</b>cobros</div>
        <div><b>${S.quests}</b>misiones completadas</div><div><b>${S.paintedTotal}</b>casillas pintadas</div>
        <div><b>${S.gifts}</b>regalos abiertos</div><div><b>x${S.maxCombo}</b>mejor combo</div></div>
        <div class="field" style="margin-top:14px"><label>Cambiar avatar</label><div class="avatars">${AVATARS.map(a => `<button class="av${a === st.avatar ? ' on' : ''}" data-a="${a}">${a}</button>`).join('')}</div></div>`,
      foot: '<button class="btn primary" data-close>Cerrar</button>',
    });
    m.el.querySelectorAll('.av').forEach(b => b.onclick = () => { st.avatar = b.dataset.a; $('avatar').textContent = st.avatar; m.el.querySelectorAll('.av').forEach(x => x.classList.toggle('on', x === b)); Sound.sfx.place(3); m.el.querySelector('h2').textContent = `${st.avatar} ${st.player}`; Game.save(false); });
  },

  /* ================= FOTO ================= */
  enterPhoto() {
    Game.setTool('hand'); this.hideInfo(); this.hideTip();
    Game.photoMode = true; document.body.classList.add('photo');
    $('photo-bar').classList.remove('hidden');
    $('photo-snap').onclick = () => {
      Sound.sfx.shutter();
      const f = document.createElement('div'); f.className = 'flash'; document.body.appendChild(f); setTimeout(() => f.remove(), 520);
      Game.photo(); this.toast('📸 ¡Foto guardada en descargas!', 'good');
    };
    $('photo-exit').onclick = () => this.exitPhoto();
    this.toast('Modo foto · mueve la cámara y captura', 'info');
  },
  exitPhoto() {
    Game.photoMode = false; document.body.classList.remove('photo'); $('photo-bar').classList.add('hidden'); Sound.sfx.close();
  },
};
