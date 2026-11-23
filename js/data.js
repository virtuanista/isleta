'use strict';
/* =========================================================
   ISLETA · Datos del juego (catálogo, niveles, misiones, logros)
   ========================================================= */
const TW = 64, TH = 32;          // tamaño de casilla isométrica
const WORLD = 46;                // tamaño de la rejilla
const DAY_LEN = 480;             // segundos por día completo
const MAX_STACK = 5;             // ciclos de producción acumulables
const MAX_LEVEL = 30;

const CATS = [
  { id: 'casas',      name: 'Viviendas',  icon: 'home'  },
  { id: 'negocios',   name: 'Negocios',   icon: 'shop'  },
  { id: 'naturaleza', name: 'Naturaleza', icon: 'tree'  },
  { id: 'deco',       name: 'Decoración', icon: 'spark' },
  { id: 'suelo',      name: 'Suelos',     icon: 'brush' },
];

/* ---------- Suelos ---------- */
const TERRAIN_IDS = ['grass', 'beach', 'meadow', 'sand', 'path', 'water', 'stone', 'soil', 'deck', 'tiles', 'clover'];
const TERRAINS = {
  grass:  { name: 'Césped',     cost: 0, lvl: 1, beauty: 0,    desc: 'Hierba fresca. Úsalo para borrar otros suelos.' },
  beach:  { name: 'Playa',      cost: 0, lvl: 99, beauty: 0,   hidden: true },
  meadow: { name: 'Pradera',    cost: 2, lvl: 1, beauty: 0.25, desc: 'Hierba alta salpicada de florecillas.' },
  sand:   { name: 'Arena',      cost: 2, lvl: 1, beauty: 0,    desc: 'Arena dorada, ideal para rincones playeros.' },
  path:   { name: 'Sendero',    cost: 3, lvl: 1, beauty: 0.1,  walk: 4, desc: 'Los vecinos adoran pasear por los senderos.' },
  water:  { name: 'Estanque',   cost: 6, lvl: 2, beauty: 0.3,  desc: 'Agua cristalina. ¡Prueba a poner nenúfares!' },
  stone:  { name: 'Adoquines',  cost: 5, lvl: 3, beauty: 0.2,  walk: 4, desc: 'Calles empedradas con mucho encanto.' },
  clover: { name: 'Trébol',     cost: 3, lvl: 3, beauty: 0.2,  desc: 'Césped tupido y oscuro. Da suerte.' },
  soil:   { name: 'Huerto',     cost: 4, lvl: 4, beauty: 0.15, desc: 'Tierra fértil con surcos.' },
  deck:   { name: 'Tarima',     cost: 6, lvl: 5, beauty: 0.25, walk: 3, desc: 'Tablones de madera cálida.' },
  tiles:  { name: 'Baldosas',   cost: 8, lvl: 7, beauty: 0.4,  walk: 4, desc: 'Baldosas en tonos pastel para plazas elegantes.' },
};
const T = {}; TERRAIN_IDS.forEach((id, i) => T[id] = i);

/* ---------- Objetos ----------
   w,h: huella; hgt: altura aprox en px (para clics); income/period: producción;
   pop: habitantes; beauty: encanto; tags: etiquetas para misiones */
const ITEMS = [
  // Viviendas
  { id: 'cabin',     cat: 'casas', name: 'Cabaña',         cost: 50,   lvl: 1,  w: 1, h: 1, hgt: 52, pop: 2,  income: 5,   period: 30, beauty: 0, smoke: [7, -44], desc: 'Un refugio de madera acogedor.' },
  { id: 'cottage',   cat: 'casas', name: 'Casita',         cost: 140,  lvl: 2,  w: 1, h: 1, hgt: 56, pop: 4,  income: 11,  period: 40, beauty: 1, desc: 'Paredes encaladas y tejado azul.' },
  { id: 'farmhouse', cat: 'casas', name: 'Casa de campo',  cost: 340,  lvl: 4,  w: 1, h: 1, hgt: 70, pop: 6,  income: 24,  period: 50, beauty: 1, smoke: [-9, -66], desc: 'Dos plantas y mucho espacio.' },
  { id: 'treehouse', cat: 'casas', name: 'Casa del árbol', cost: 650,  lvl: 6,  w: 1, h: 1, hgt: 86, pop: 5,  income: 40,  period: 60, beauty: 4, desc: 'Un hogar entre las ramas.' },
  { id: 'mansion',   cat: 'casas', name: 'Mansión',        cost: 1400, lvl: 8,  w: 2, h: 2, hgt: 96, pop: 14, income: 95,  period: 70, beauty: 5, desc: 'La residencia más elegante de la isla.' },
  // Negocios
  { id: 'lemonade',  cat: 'negocios', name: 'Puesto de limonada', cost: 80,   lvl: 1,  w: 1, h: 1, hgt: 44, income: 12,  period: 20,  beauty: 1, desc: '¡Limonada fresquita para todos!' },
  { id: 'icecream',  cat: 'negocios', name: 'Heladería',          cost: 180,  lvl: 2,  w: 1, h: 1, hgt: 50, income: 22,  period: 30,  beauty: 2, desc: 'Helados de mil sabores.' },
  { id: 'bakery',    cat: 'negocios', name: 'Panadería',          cost: 280,  lvl: 3,  w: 1, h: 1, hgt: 60, income: 38,  period: 45,  beauty: 1, smoke: [10, -58], desc: 'Huele a pan recién hecho.' },
  { id: 'cafe',      cat: 'negocios', name: 'Cafetería',          cost: 480,  lvl: 5,  w: 1, h: 1, hgt: 56, income: 62,  period: 60,  beauty: 2, desc: 'Café, tartas y buena conversación.' },
  { id: 'windmill',  cat: 'negocios', name: 'Molino',             cost: 850,  lvl: 6,  w: 2, h: 2, hgt: 130, income: 115, period: 75, beauty: 4, desc: 'Sus aspas giran sin descanso.' },
  { id: 'market',    cat: 'negocios', name: 'Mercadillo',         cost: 1600, lvl: 9,  w: 2, h: 2, hgt: 60, income: 210, period: 90,  beauty: 4, desc: 'Frutas, flores y artesanía.' },
  { id: 'lighthouse',cat: 'negocios', name: 'Faro',               cost: 2600, lvl: 11, w: 1, h: 1, hgt: 120, income: 280, period: 100, beauty: 10, desc: 'Ilumina la costa por la noche.' },
  { id: 'observatory',cat:'negocios', name: 'Observatorio',       cost: 4200, lvl: 14, w: 2, h: 2, hgt: 110, income: 430, period: 120, beauty: 12, desc: 'Para contemplar las estrellas.' },
  // Naturaleza
  { id: 'oak',       cat: 'naturaleza', name: 'Roble',          cost: 10, lvl: 1, w: 1, h: 1, hgt: 56, beauty: 2, tags: ['tree'], desc: 'Frondoso y robusto.' },
  { id: 'pine',      cat: 'naturaleza', name: 'Pino',           cost: 12, lvl: 1, w: 1, h: 1, hgt: 58, beauty: 2, tags: ['tree'], desc: 'Siempre verde.' },
  { id: 'bush',      cat: 'naturaleza', name: 'Arbusto',        cost: 6,  lvl: 1, w: 1, h: 1, hgt: 24, beauty: 1, desc: 'Redondito y con bayas.' },
  { id: 'tulips',    cat: 'naturaleza', name: 'Flores',         cost: 5,  lvl: 1, w: 1, h: 1, hgt: 16, beauty: 1, tags: ['flower'], desc: 'Un macizo de flores de colores.' },
  { id: 'rock',      cat: 'naturaleza', name: 'Roca',           cost: 4,  lvl: 1, w: 1, h: 1, hgt: 20, beauty: 1, desc: 'Piedra cubierta de musgo.' },
  { id: 'palm',      cat: 'naturaleza', name: 'Palmera',        cost: 30, lvl: 2, w: 1, h: 1, hgt: 70, beauty: 3, tags: ['tree'], desc: 'Un toque tropical.' },
  { id: 'sunflower', cat: 'naturaleza', name: 'Girasoles',      cost: 15, lvl: 2, w: 1, h: 1, hgt: 34, beauty: 2, tags: ['flower'], desc: 'Siempre mirando al sol.' },
  { id: 'lily',      cat: 'naturaleza', name: 'Nenúfar',        cost: 8,  lvl: 2, w: 1, h: 1, hgt: 10, beauty: 2, onWater: true, tags: ['flower'], desc: 'Solo se puede poner sobre el estanque.' },
  { id: 'sakura',    cat: 'naturaleza', name: 'Cerezo',         cost: 40, lvl: 3, w: 1, h: 1, hgt: 60, beauty: 4, tags: ['tree'], petals: true, desc: 'Sus pétalos rosados vuelan con el viento.' },
  { id: 'mushroom',  cat: 'naturaleza', name: 'Seta gigante',   cost: 25, lvl: 4, w: 1, h: 1, hgt: 36, beauty: 3, desc: 'Mágica y moteada.' },
  { id: 'autumn',    cat: 'naturaleza', name: 'Arce otoñal',    cost: 35, lvl: 5, w: 1, h: 1, hgt: 58, beauty: 3, tags: ['tree'], desc: 'Hojas de fuego todo el año.' },
  { id: 'cactus',    cat: 'naturaleza', name: 'Cactus',         cost: 18, lvl: 5, w: 1, h: 1, hgt: 40, beauty: 2, desc: 'Pincha, pero tiene flor.' },
  { id: 'willow',    cat: 'naturaleza', name: 'Sauce',          cost: 60, lvl: 7, w: 1, h: 1, hgt: 64, beauty: 5, tags: ['tree'], desc: 'Ramas que acarician el suelo.' },
  { id: 'crystal',   cat: 'naturaleza', name: 'Cristal brillante', cost: 120, lvl: 10, w: 1, h: 1, hgt: 40, beauty: 8, glow: '#9fe7ff', desc: 'Brilla con luz propia por la noche.' },
  // Decoración
  { id: 'fence',     cat: 'deco', name: 'Valla',         cost: 3,   lvl: 1, w: 1, h: 1, hgt: 20, beauty: 1, desc: 'Gírala para cambiar su dirección.' },
  { id: 'bench',     cat: 'deco', name: 'Banco',         cost: 15,  lvl: 1, w: 1, h: 1, hgt: 20, beauty: 2, desc: 'Para descansar y mirar el mar.' },
  { id: 'pot',       cat: 'deco', name: 'Maceta',        cost: 8,   lvl: 1, w: 1, h: 1, hgt: 22, beauty: 1, desc: 'Barro cocido y una planta feliz.' },
  { id: 'lamp',      cat: 'deco', name: 'Farola',        cost: 20,  lvl: 2, w: 1, h: 1, hgt: 50, beauty: 2, glow: '#ffd27a', desc: 'Se enciende al anochecer.' },
  { id: 'mailbox',   cat: 'deco', name: 'Buzón',         cost: 10,  lvl: 2, w: 1, h: 1, hgt: 28, beauty: 1, desc: 'Cartas y postales de otras islas.' },
  { id: 'hedge',     cat: 'deco', name: 'Seto',          cost: 12,  lvl: 2, w: 1, h: 1, hgt: 22, beauty: 2, desc: 'Verde, cuadrado y bien podado.' },
  { id: 'campfire',  cat: 'deco', name: 'Hoguera',       cost: 40,  lvl: 3, w: 1, h: 1, hgt: 22, beauty: 3, glow: '#ff9a3c', desc: 'Crepita y calienta las noches.' },
  { id: 'well',      cat: 'deco', name: 'Pozo',          cost: 60,  lvl: 3, w: 1, h: 1, hgt: 48, beauty: 4, desc: 'Pide un deseo.' },
  { id: 'swing',     cat: 'deco', name: 'Columpio',      cost: 90,  lvl: 4, w: 1, h: 1, hgt: 40, beauty: 5, desc: '¡Arriba y abajo!' },
  { id: 'fountain',  cat: 'deco', name: 'Fuente',        cost: 300, lvl: 4, w: 2, h: 2, hgt: 56, beauty: 12, desc: 'El corazón de cualquier plaza.' },
  { id: 'statue',    cat: 'deco', name: 'Estatua',       cost: 160, lvl: 5, w: 1, h: 1, hgt: 56, beauty: 8, desc: 'Homenaje a la tortuga fundadora.' },
  { id: 'lanterns',  cat: 'deco', name: 'Guirnalda',     cost: 45,  lvl: 6, w: 1, h: 1, hgt: 42, beauty: 4, glow: '#ffb86b', desc: 'Farolillos de papel de colores.' },
  { id: 'gazebo',    cat: 'deco', name: 'Glorieta',      cost: 520, lvl: 7, w: 2, h: 2, hgt: 80, beauty: 16, desc: 'Música en las tardes de verano.' },
  { id: 'pond_duck', cat: 'deco', name: 'Patito',        cost: 25,  lvl: 3, w: 1, h: 1, hgt: 14, beauty: 3, onWater: true, desc: '¡Cuac! Necesita un estanque.' },
  { id: 'arch',      cat: 'deco', name: 'Arco floral',   cost: 140, lvl: 8, w: 1, h: 1, hgt: 54, beauty: 9, desc: 'Un portal cubierto de rosas.' },
  { id: 'clocktower',cat: 'deco', name: 'Torre del reloj', cost: 900, lvl: 12, w: 1, h: 1, hgt: 120, beauty: 20, desc: 'Marca las horas de la isla.' },
];
const ITEM = {}; ITEMS.forEach(it => { ITEM[it.id] = it; it.tags = it.tags || []; });
const isBuilding = d => !!d.income;

/* ---------- Niveles ---------- */
function xpNeeded(level) { return Math.round(45 * Math.pow(level, 1.55)); }

/* ---------- Ampliaciones de isla ---------- */
const EXPANSIONS = [
  { lvl: 3,  cost: 400 },
  { lvl: 5,  cost: 1100 },
  { lvl: 7,  cost: 2400 },
  { lvl: 9,  cost: 4800 },
  { lvl: 12, cost: 8500 },
  { lvl: 15, cost: 15000 },
  { lvl: 18, cost: 26000 },
];
const BASE_RADIUS = 6.3, RADIUS_STEP = 2.3;

/* ---------- Avatares y paletas ---------- */
const AVATARS = ['🐻', '🦊', '🐰', '🐸', '🐼', '🐱', '🐧', '🦉', '🐨', '🐯', '🐙', '🦄'];
const PALETTES = {
  primavera: { name: 'Primavera', grass: ['#86d65a', '#7ccd52'], cliffTop: '#5fae3c', sea: ['#63cde6', '#3aa8d4'] },
  tropical:  { name: 'Tropical',  grass: ['#6fdc8c', '#62d380'], cliffTop: '#40b066', sea: ['#4fe0d9', '#1fb5c9'] },
  otono:     { name: 'Otoño',     grass: ['#c4cf5a', '#b8c552'], cliffTop: '#97a23c', sea: ['#6ec2e0', '#4a9cc9'] },
};
const ISLAND_NAMES_A = ['Isla', 'Islote', 'Cayo', 'Isleta', 'Atolón', 'Puerto'];
const ISLAND_NAMES_B = ['Brisa', 'Coral', 'Caracola', 'Lucero', 'Marea', 'Gaviota', 'Nácar', 'Ámbar', 'Turquesa', 'Algodón', 'Menta', 'Canela', 'Arrecife', 'Duna', 'Perla', 'Sirena', 'Albahaca', 'Mandarina'];

/* ---------- Misiones guionizadas ---------- */
// type: place(id) | cat(cat) | tag(tag) | paint(terrain|'*') | collect | beauty | pop | level | gifts | expand | earned
const QUESTS = [
  { type: 'place', param: 'cabin',    target: 1,  title: 'Construye tu primera Cabaña',        coins: 60,  xp: 20 },
  { type: 'place', param: 'lemonade', target: 1,  title: 'Abre un Puesto de limonada',         coins: 60,  xp: 20 },
  { type: 'collect',                   target: 3,  title: 'Recoge monedas 3 veces',             coins: 50,  xp: 25 },
  { type: 'tag',   param: 'tree',     target: 5,  title: 'Planta 5 árboles',                   coins: 80,  xp: 30 },
  { type: 'paint', param: 'path',     target: 10, title: 'Traza 10 casillas de Sendero',       coins: 60,  xp: 25 },
  { type: 'cat',   param: 'deco',     target: 4,  title: 'Coloca 4 objetos de Decoración',     coins: 90,  xp: 30 },
  { type: 'beauty',                    target: 40, title: 'Alcanza 40 de Encanto',              coins: 120, xp: 40 },
  { type: 'pop',                       target: 10, title: 'Consigue 10 habitantes',             coins: 150, xp: 50 },
  { type: 'gifts',                     target: 1,  title: 'Abre un regalo flotante',            coins: 100, xp: 30 },
  { type: 'place', param: 'bakery',   target: 1,  title: 'Hornea en una Panadería',            coins: 200, xp: 60 },
  { type: 'expand',                    target: 1,  title: 'Amplía tu isla',                     coins: 300, xp: 80 },
  { type: 'paint', param: 'water',    target: 6,  title: 'Crea un estanque de 6 casillas',     coins: 150, xp: 50 },
  { type: 'place', param: 'lily',     target: 3,  title: 'Pon 3 nenúfares en el estanque',     coins: 120, xp: 40 },
  { type: 'level',                     target: 6,  title: 'Alcanza el nivel 6',                 coins: 300, xp: 0 },
  { type: 'place', param: 'windmill', target: 1,  title: 'Levanta un Molino',                  coins: 400, xp: 100 },
  { type: 'beauty',                    target: 150,title: 'Alcanza 150 de Encanto',             coins: 500, xp: 120 },
  { type: 'pop',                       target: 40, title: 'Consigue 40 habitantes',             coins: 600, xp: 150 },
  { type: 'place', param: 'gazebo',   target: 1,  title: 'Construye una Glorieta',             coins: 600, xp: 150 },
];
const QUEST_TEMPLATES = [
  s => ({ type: 'collect', target: 6 + s * 2, title: `Recoge monedas ${6 + s * 2} veces` }),
  s => ({ type: 'tag', param: 'tree', target: 5 + s * 2, title: `Planta ${5 + s * 2} árboles más` }),
  s => ({ type: 'tag', param: 'flower', target: 6 + s * 2, title: `Planta ${6 + s * 2} flores más` }),
  s => ({ type: 'cat', param: 'deco', target: 5 + s * 2, title: `Coloca ${5 + s * 2} decoraciones más` }),
  s => ({ type: 'paint', param: '*', target: 20 + s * 5, title: `Pinta ${20 + s * 5} casillas de suelo` }),
  s => ({ type: 'earned', target: 800 + s * 600, title: `Gana ${800 + s * 600} monedas` }),
  s => ({ type: 'cat', param: 'casas', target: 2 + Math.floor(s / 2), title: `Construye ${2 + Math.floor(s / 2)} viviendas más` }),
  s => ({ type: 'cat', param: 'negocios', target: 1 + Math.floor(s / 3), title: `Abre ${1 + Math.floor(s / 3)} negocios más` }),
  s => ({ type: 'gifts', target: 2 + Math.floor(s / 3), title: `Abre ${2 + Math.floor(s / 3)} regalos flotantes` }),
];

/* ---------- Logros ---------- */
const ACHIEVEMENTS = [
  { id: 'first_home', name: 'Primer hogar',     icon: '🏡', desc: 'Construye tu primera vivienda.',          check: (s, g) => (s.stats.cats.casas || 0) >= 1 },
  { id: 'shopkeeper', name: 'Emprendedor/a',    icon: '🍋', desc: 'Abre tu primer negocio.',                 check: (s, g) => (s.stats.cats.negocios || 0) >= 1 },
  { id: 'green',      name: 'Pulgar verde',     icon: '🌳', desc: 'Planta 25 árboles.',                      check: (s, g) => (s.stats.tags.tree || 0) >= 25 },
  { id: 'urbanist',   name: 'Urbanista',        icon: '🏘️', desc: 'Ten 60 objetos en tu isla.',              check: (s, g) => s.items.length >= 60 },
  { id: 'painter',    name: 'Artista del suelo',icon: '🎨', desc: 'Pinta 200 casillas.',                     check: (s, g) => s.stats.paintedTotal >= 200 },
  { id: 'charming',   name: 'Isla de postal',   icon: '💖', desc: 'Alcanza 250 de Encanto.',                 check: (s, g) => g.beauty >= 250 },
  { id: 'crowd',      name: 'Villa bulliciosa', icon: '👥', desc: 'Llega a 50 habitantes.',                  check: (s, g) => g.pop >= 50 },
  { id: 'tycoon',     name: 'Magnate',          icon: '💰', desc: 'Gana 10.000 monedas en total.',           check: (s, g) => s.stats.earned >= 10000 },
  { id: 'piggy',      name: 'Hucha llena',      icon: '🐷', desc: 'Ahorra 5.000 monedas a la vez.',          check: (s, g) => s.coins >= 5000 },
  { id: 'lvl10',      name: 'Veterano/a',       icon: '⭐', desc: 'Alcanza el nivel 10.',                    check: (s, g) => s.level >= 10 },
  { id: 'explorer',   name: 'Explorador/a',     icon: '🧭', desc: 'Amplía la isla 3 veces.',                 check: (s, g) => s.expands >= 3 },
  { id: 'collector',  name: 'Coleccionista',    icon: '📦', desc: 'Coloca 20 tipos de objeto distintos.',    check: (s, g) => Object.keys(s.stats.placed).filter(k => s.stats.placed[k] > 0).length >= 20 },
  { id: 'lucky',      name: 'Suertudo/a',       icon: '🎁', desc: 'Abre 10 regalos flotantes.',              check: (s, g) => s.stats.gifts >= 10 },
  { id: 'owl',        name: 'Ave nocturna',     icon: '🌙', desc: 'Recoge monedas de noche.',                check: (s, g) => s.stats.nightCollects >= 1 },
  { id: 'combo',      name: 'En racha',         icon: '🔥', desc: 'Consigue un combo de x15.',               check: (s, g) => s.stats.maxCombo >= 15 },
  { id: 'photo',      name: 'Fotógrafo/a',      icon: '📸', desc: 'Haz una foto de tu isla.',                check: (s, g) => s.stats.photos >= 1 },
  { id: 'pond',       name: 'Remanso',          icon: '🦆', desc: 'Pon un patito en un estanque.',           check: (s, g) => (s.stats.placed.pond_duck || 0) >= 1 },
  { id: 'quests',     name: 'Siempre dispuesto/a', icon: '📜', desc: 'Completa 20 misiones.',               check: (s, g) => s.stats.quests >= 20 },
];

/* ---------- Utilidades ---------- */
function hash2(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + (s | 0) * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function rnd(seed, k) { return hash2(seed | 0, k | 0, 9187); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function fmt(n) {
  n = Math.floor(n);
  if (n >= 1e6) return (n / 1e6).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' M';
  return n.toLocaleString('es-ES');
}
function fmtTime(sec) {
  sec = Math.max(0, Math.ceil(sec));
  if (sec < 60) return sec + ' s';
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m < 60) return m + ' min' + (s ? ' ' + s + ' s' : '');
  const h = Math.floor(m / 60);
  return h + ' h ' + (m % 60) + ' min';
}
function timeAgo(ts) {
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return 'hace un momento';
  if (d < 3600) return 'hace ' + Math.floor(d / 60) + ' min';
  if (d < 86400) return 'hace ' + Math.floor(d / 3600) + ' h';
  const days = Math.floor(d / 86400);
  return 'hace ' + days + (days === 1 ? ' día' : ' días');
}
function todayKey(d = new Date()) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
