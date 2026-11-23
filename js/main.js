'use strict';
/* =========================================================
   ISLETA · Arranque
   ========================================================= */
(function boot() {
  const start = () => {
    Game.init();
    UI.init();
    UI.showTitle();
    const hide = () => {
      const sp = document.getElementById('splash');
      sp.classList.add('out');
      setTimeout(() => sp.remove(), 700);
    };
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise(r => setTimeout(r, 2500))]).then(() => setTimeout(hide, 900));
  };
  // el audio necesita un gesto del usuario
  const unlock = () => { Sound.init(); };
  ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, true));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.addEventListener('error', e => console.error('[Isleta]', e.message, e.filename, e.lineno));
})();
