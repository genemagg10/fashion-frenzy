import { audio } from './audio';
import { renderPerson, type Pose } from './characters';
import {
  ACCESSORIES,
  briefFor,
  colorName,
  CUSTOMERS,
  DECOR,
  FABRICS,
  fabricById,
  grantRoundRewards,
  JULES,
  PALETTE,
  RUNWAY_GOWNS,
  sketchById,
  SKETCHES,
  THEMES,
} from './data';
import { renderDressForm, renderSketchDrawing } from './garments';
import { icon } from './icons';
import { grade, liveGrade, wishFromTheme, type Draft, type Grade } from './score';
import { sewKind, sewPlan, type SewKind } from './sew';
import { shopSvg } from './shopart';
import {
  customerBust,
  decorArt,
  filesFor,
  modelSignature,
  peekSprite,
  pipSprite,
  preload,
  puppyURL,
  runwayArt,
  sewForm,
  swatchURL,
  tintedSprite,
  trimURL,
  type BustExpr,
  type PipExpr,
} from './spritekit';
import { loadSave, writeSave } from './storage';
import type {
  AccessoryId,
  Customer,
  DecorId,
  FabricId,
  Outfit,
  PersonLook,
  Scene,
  SketchId,
  Theme,
} from './types';
import { esc, saturation } from './color';

const save = loadSave();

interface Rival {
  name: string;
  outfit: Outfit;
  model: PersonLook;
}

interface Award {
  title: string;
  reason: string;
  lookIndex: number;
}

interface ShowRun {
  theme: Theme;
  looks: Outfit[];
  rivals: Rival[];
  awards: Award[];
  paid: boolean;
}

interface RunHandle {
  cancelled: boolean;
  raf: number;
  skip: (() => void) | null;
  progress: number;
}

const session: {
  scene: Scene;
  customer: Customer | null;
  mode: 'customer' | 'show';
  draft: Draft | null;
  phase: 'fabric' | 'sew' | 'finish';
  show: ShowRun | null;
  pendingTheme: Theme | null;
  showOffered: boolean;
  declinedShow: boolean;
  keepCustomer: boolean;
  sketchIndex: number;
  cat: 'sleep' | 'sit' | 'gone';
  catTaps: number;
  lampTaps: number;
  disco: boolean;
  lastScore: Grade | null;
  lastOutfit: Outfit | null;
  viewing: string | null;
  hudBump: boolean;
  parade: boolean;
  titleColor: string;
  leaveArmed: boolean;
  event: 'vip' | 'rush' | 'delivery' | null;
  bonus: number;
} = {
  scene: 'title',
  customer: null,
  mode: 'customer',
  draft: null,
  phase: 'fabric',
  show: null,
  pendingTheme: null,
  showOffered: false,
  declinedShow: false,
  keepCustomer: false,
  sketchIndex: 0,
  cat: 'sleep',
  catTaps: 0,
  lampTaps: 0,
  disco: false,
  lastScore: null,
  lastOutfit: null,
  viewing: null,
  hudBump: false,
  parade: false,
  titleColor: '#E56B93',
  leaveArmed: false,
  event: null,
  bonus: 0,
};

let cleanup: () => void = () => {};
let seq = 1;
let lastCustomerId = '';
let toastTimer = 0;
const runway: RunHandle = { cancelled: false, raf: 0, skip: null, progress: 0 };
let sewApi: { pin: (index: number) => void; snip: (index: number) => void } | null = null;

const MODELS: PersonLook[] = [
  { skin: '#F6D3BA', hair: 'bob', hairColor: '#3a2a22' },
  { skin: '#8D5524', hair: 'puffs', hairColor: '#1a120e' },
  { skin: '#E7B48A', hair: 'waves', hairColor: '#24160f' },
  { skin: '#C68642', hair: 'bun', hairColor: '#2a160c' },
  { skin: '#5C3A2A', hair: 'crop', hairColor: '#140e0c' },
  { skin: '#F3C6A5', hair: 'braid', hairColor: '#4a2e22' },
  { skin: '#E0A87A', hair: 'curls', hairColor: '#6b2d12', freckles: true },
  { skin: '#A86B45', hair: 'locs', hairColor: '#1a120e' },
  { skin: '#F6D3BA', hair: 'hijab', hairColor: '#355e78' },
];

function nextId(prefix = 'g'): string {
  seq += 1;
  return `${prefix}${seq}`;
}

function oid(): string {
  return `look-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function persist(): void {
  writeSave(save);
}

export function boot(): void {
  audio.setMuted(save.muted);
  const app = document.getElementById('app');
  if (!app) return;
  let origin: { x: number; y: number } | null = null;
  let suppressClickUntil = 0;
  app.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    origin = { x: event.clientX, y: event.clientY };
  });
  app.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'mouse') return;
    const start = origin;
    origin = null;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 16) return;
    suppressClickUntil = performance.now() + 700;
    onClick(event);
  });
  app.addEventListener('click', (event) => {
    if (performance.now() < suppressClickUntil) return;
    onClick(event);
  });
  if (location.hash === '#gallery') session.scene = 'gallery';
  else if (location.hash === '#cover') session.scene = 'cover';
  draw();
}

function showLoader(on: boolean): void {
  let el = document.getElementById('sprite-loader');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sprite-loader';
    el.className = 'sprite-loader';
    el.innerHTML = `<img alt="" src="${pipSprite('happy')}"><p>Pip is threading a needle…</p>`;
    document.body.appendChild(el);
  }
  el.classList.toggle('on', on);
}

let paintToken = 0;

function neededFiles(): string[] {
  const extra: string[] = [];
  const who = session.customer?.id;
  if (who) {
    extra.push(`sprites/customers/full/${who}.png`);
    for (const expr of ['happy', 'love', 'thinking', 'disappointed'] as const) {
      extra.push(`sprites/customers/bust/${who}-${expr}.png`);
    }
  }
  if (session.draft) {
    const id = session.draft.sketchId;
    extra.push(
      `sprites/models/tint/${id}.png`,
      `sprites/models/tint/${id}.mask.png`,
      `sprites/forms/${id}.png`,
      `sprites/forms/${id}.mask.png`,
      `sprites/garments/${id}.png`,
      `sprites/models/signature/${id}.png`,
    );
  }
  if (session.scene === 'sketch') {
    for (const sketch of unlockedSketches()) extra.push(`sprites/garments/${sketch.id}.png`);
  }
  if (session.scene === 'gallery') {
    for (const sketch of SKETCHES) extra.push(`sprites/models/signature/${sketch.id}.png`);
    for (const person of CUSTOMERS) extra.push(`sprites/customers/full/${person.id}.png`);
  }
  if (session.scene === 'runway' && session.show) {
    for (const rival of session.show.rivals) extra.push(`sprites/models/signature/${rival.outfit.sketchId}.png`);
    for (const look of session.show.looks) {
      extra.push(`sprites/models/tint/${look.sketchId}.png`, `sprites/models/tint/${look.sketchId}.mask.png`);
    }
  }
  if (session.scene === 'reaction' && session.lastOutfit) {
    extra.push(`sprites/forms/${session.lastOutfit.sketchId}.png`, `sprites/forms/${session.lastOutfit.sketchId}.mask.png`);
  }
  if (session.scene === 'lookbook' || session.scene === 'awards') {
    const looks = session.scene === 'lookbook' ? save.lookbook : (session.show?.looks ?? []);
    for (const look of looks) extra.push(`sprites/forms/${look.sketchId}.png`, `sprites/forms/${look.sketchId}.mask.png`);
  }
  if (session.scene === 'reviews') {
    for (const review of save.reviews) {
      const id = review.name.toLowerCase();
      extra.push(`sprites/customers/bust/${id}-happy.png`, `sprites/customers/bust/${id}-love.png`);
    }
  }
  return filesFor(session.scene, extra);
}

function draw(): void {
  const token = ++paintToken;
  const missing = neededFiles().filter((file) => !peekSprite(file));
  if (missing.length) {
    showLoader(true);
    void preload(missing).then(() => {
      if (token !== paintToken) return;
      showLoader(false);
      paint();
    });
    return;
  }
  showLoader(false);
  paint();
}

function paint(): void {
  cleanup();
  cleanup = () => {};
  runway.skip = null;
  const app = document.getElementById('app');
  if (!app) return;
  app.dataset.scene = session.scene;
  app.innerHTML = `<div class="${stageClass()}">${sceneHtml()}</div><div id="toast" role="status"></div><div id="live" class="sr-only" aria-live="polite"></div>`;
  cleanup = mount() ?? (() => {});
  const bump = session.hudBump;
  session.hudBump = false;
  if (bump) document.querySelector('.stat-coins')?.classList.add('bump');
}

function stageClass(): string {
  if (session.scene === 'title' || session.scene === 'runway' || session.scene === 'cover') return 'stage bare';
  return 'stage framed';
}

function sceneHtml(): string {
  switch (session.scene) {
    case 'title':
      return titleScene();
    case 'shop':
      return shopScene();
    case 'sketch':
      return sketchScene();
    case 'studio':
      return studioScene();
    case 'reaction':
      return reactionScene();
    case 'runway':
      return runwayScene();
    case 'awards':
      return awardsScene();
    case 'lookbook':
      return lookbookScene();
    case 'shelf':
      return shelfScene();
    case 'gallery':
      return galleryScene();
    case 'reviews':
      return reviewsScene();
    case 'cover':
      return coverScene();
    default:
      return titleScene();
  }
}

function mount(): (() => void) | void {
  if (session.scene === 'title') return mountTitle();
  if (session.scene === 'sketch') return mountSketch();
  if (session.scene === 'studio') return mountStudio();
  if (session.scene === 'runway') return mountRunway();
  return undefined;
}

function goto(scene: Scene): void {
  const from = session.scene;
  if (scene === 'shop' && !session.keepCustomer) prepareShop();
  session.keepCustomer = false;
  session.scene = scene;
  if (scene === 'runway') audio.setMode('runway');
  else audio.setMode('shop');
  if (scene === 'shop' && from !== 'shop') audio.door();
  draw();
}

function returnToShop(): void {
  session.keepCustomer = true;
  goto('shop');
}

function prepareShop(): void {
  session.cat = chooseCat();
  session.catTaps = 0;
  session.mode = 'customer';
  session.draft = null;
  session.parade = false;
  session.leaveArmed = false;
  if (!save.tutorialDone) {
    session.customer = { ...CUSTOMERS[0] };
    session.event = null;
    session.bonus = 0;
    return;
  }
  const showAfter = reputation() >= 4 ? 2 : 3;
  if (save.customersServed >= showAfter && !session.showOffered && !session.declinedShow) {
    session.showOffered = true;
    const theme = pickTheme();
    session.pendingTheme = theme;
    session.customer = {
      ...JULES,
      request: `Fashion show tonight! Theme: ${theme.name}.`,
      hint: theme.blurb,
      icon: theme.icon,
      color: theme.colors[0],
      colorName: theme.name,
    };
    session.event = null;
    return;
  }
  session.customer = { ...randomCustomer() };
  if (session.customer) applyBrief(session.customer);
  rollEvent();
}

function rollEvent(): void {
  session.bonus = 0;
  const roll = Math.random();
  if (roll < 0.22) {
    session.event = 'vip';
    session.bonus = 16;
    if (session.customer) session.customer.request = `VIP visit! ${session.customer.request}`;
    return;
  }
  if (roll < 0.44) {
    session.event = 'rush';
    session.bonus = 1;
    if (session.customer) session.customer.hint = `Rush order. ${session.customer.hint}`;
    return;
  }
  if (roll < 0.66) {
    session.event = 'delivery';
    const queue = ['floral', 'denim', 'tulle', 'velvet'] as const;
    const next = queue.find((id) => !save.fabrics.includes(id));
    if (next) {
      save.fabrics.push(next);
      persist();
      toast(`A parcel arrived: ${fabricById(next).name}!`);
    } else toast('A parcel of cloth arrived, just because.');
    return;
  }
  session.event = null;
}

function chooseCat(): 'sleep' | 'sit' | 'gone' {
  if (!save.rainbow) return Math.random() < 0.6 ? 'sleep' : 'sit';
  const roll = Math.random();
  if (roll < 0.28) return 'gone';
  return roll < 0.6 ? 'sleep' : 'sit';
}

function randomCustomer(): Customer {
  const fancy = reputation() >= 4 ? CUSTOMERS.filter((c) => c.fancy) : [];
  const source = fancy.length && Math.random() < 0.7 ? fancy : CUSTOMERS;
  const pool = source.filter((c) => c.id !== lastCustomerId);
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? CUSTOMERS[0];
  lastCustomerId = pick.id;
  return pick;
}

function pickTheme(): Theme {
  const pool = THEMES.filter((t) => t.id !== save.lastTheme);
  return pool[Math.floor(Math.random() * pool.length)] ?? THEMES[0];
}

function onClick(event: MouseEvent): void {
  const target = (event.target as Element | null)?.closest('[data-act]');
  audio.unlock();
  if (!target) return;
  const act = target.getAttribute('data-act');
  if (!act || act === 'book') return;
  if (act === 'pin' || act === 'snip') {
    const index = Number(target.getAttribute('data-id') ?? target.getAttribute('data-i'));
    if (act === 'pin') sewApi?.pin(index);
    else sewApi?.snip(index);
    return;
  }
  if (act !== 'mute' && act !== 'sketch-prev' && act !== 'sketch-next' && act !== 'cat' && act !== 'chandelier') audio.tap();
  const id = target.getAttribute('data-id') ?? '';
  switch (act) {
    case 'mute':
      toggleMute();
      break;
    case 'open-shop':
      goto('shop');
      break;
    case 'home':
      if (session.scene !== 'title') goto('title');
      break;
    case 'design':
      session.mode = 'customer';
      session.sketchIndex = 0;
      session.draft = null;
      goto('sketch');
      break;
    case 'start-show':
      startShow(session.pendingTheme ?? pickTheme());
      break;
    case 'decline-show': {
      session.declinedShow = true;
      session.customer = { ...randomCustomer() };
      if (session.customer) applyBrief(session.customer);
      rollEvent();
      draw();
      break;
    }
    case 'poster':
      onPoster();
      break;
    case 'cat':
      pokeCat();
      break;
    case 'chandelier':
      pokeLamp();
      break;
    case 'sketch-prev':
      flipSketch(-1);
      break;
    case 'sketch-next':
      flipSketch(1);
      break;
    case 'sketch-pick':
      pickSketch();
      break;
    case 'back':
      goBack();
      break;
    case 'leave-show':
      leaveShow();
      break;
    case 'color':
      if (session.draft) {
        session.draft.color = id;
        session.phase = 'fabric';
        draw();
      }
      break;
    case 'pattern':
      if (session.draft && isFabric(id)) {
        session.draft.pattern = id;
        draw();
      }
      break;
    case 'to-sew':
      if (!session.draft?.color || !session.draft.pattern) {
        toast('Pick a color and a cloth first.');
        break;
      }
      session.phase = 'sew';
      draw();
      break;
    case 'reviews':
      goto('reviews');
      break;
    case 'help-sew':
      helpSew();
      break;
    case 'auto-sew':
      helpSew(true);
      break;
    case 'accessory':
      toggleAccessory(id);
      break;
    case 'finish':
      finishOutfit();
      break;
    case 'next-customer':
      goto('shop');
      break;
    case 'save-look':
      if (session.lastOutfit) toggleLook(session.lastOutfit);
      break;
    case 'save-show':
      saveShowLooks();
      break;
    case 'share-look':
      void shareCurrent();
      break;
    case 'lookbook':
      session.viewing = null;
      goto('lookbook');
      break;
    case 'shelf':
      goto('shelf');
      break;
    case 'open-look':
      session.viewing = id;
      draw();
      break;
    case 'close-look':
      session.viewing = null;
      draw();
      break;
    case 'drop-look':
      save.lookbook = save.lookbook.filter((look) => look.id !== id);
      session.viewing = null;
      persist();
      draw();
      break;
    case 'buy':
      buy(target.getAttribute('data-kind') ?? '', id);
      break;
    case 'runway-next':
      runway.skip?.();
      break;
    case 'to-shop':
      session.mode = 'customer';
      session.show = null;
      goto('shop');
      break;
    default:
      break;
  }
}

function toggleMute(): void {
  save.muted = !save.muted;
  audio.setMuted(save.muted);
  persist();
  document.querySelectorAll('[data-act="mute"]').forEach((node) => {
    node.setAttribute('aria-label', save.muted ? 'Unmute' : 'Mute');
    node.innerHTML = icon(save.muted ? 'mute' : 'sound');
  });
}

function isFabric(id: string): id is FabricId {
  return FABRICS.some((fabric) => fabric.id === id);
}

function isAccessory(id: string): id is AccessoryId {
  return ACCESSORIES.some((item) => item.id === id);
}

function hud(extra = ''): string {
  const deal = affordable();
  return `<header class="hud">
    <button class="wordmark" data-act="home" type="button">Fashion Frenzy</button>
    <div class="hud-stats">
      <span class="stat stat-coins">${icon('coin')}<b>${save.coins}</b></span>
      <span class="stat">${icon('heart')}<b>${save.hearts}</b></span>
    </div>
    <div class="hud-actions">
      ${extra}
      <button class="icon-btn ${deal ? 'deal' : ''}" type="button" data-act="shelf" aria-label="Shop shelf">${icon('shelf')}</button>
      <button class="icon-btn" type="button" data-act="lookbook" aria-label="Lookbook">${icon('lookbook')}</button>
      <button class="icon-btn" type="button" data-act="mute" aria-label="${save.muted ? 'Unmute' : 'Mute'}">${icon(save.muted ? 'mute' : 'sound')}</button>
    </div>
  </header>`;
}

function affordable(): boolean {
  if (FABRICS.some((item) => !item.starter && !item.secret && !save.fabrics.includes(item.id) && save.coins >= item.price)) return true;
  if (SKETCHES.some((item) => !item.starter && !save.sketches.includes(item.id) && save.coins >= item.price)) return true;
  if (ACCESSORIES.some((item) => !item.starter && !save.accessories.includes(item.id) && save.coins >= item.price)) return true;
  if (DECOR.some((item) => !save.decor.includes(item.id) && save.coins >= item.price)) return true;
  return false;
}

function pipMood(): PipExpr {
  if (session.scene === 'reaction' && (session.lastScore?.review ?? 0) >= 5) return 'cheer';
  if (session.scene === 'studio' && session.draft && (session.phase === 'fabric' || session.phase === 'finish')) {
    const mood = liveGrade(session.draft, session.customer ?? CUSTOMERS[0], activeWish()).mood;
    if (mood === 'sparkle') return 'love';
    if (mood === 'think') return 'thinking';
    return 'disappointed';
  }
  if (session.scene === 'studio' && session.phase === 'sew') return 'thinking';
  return 'happy';
}

function pip(line: string): string {
  if (!line) return '';
  return `<div class="pip">
    <img class="sprite pip-svg" alt="" width="72" height="72" src="${pipSprite(pipMood())}">
    <p>${esc(line)}</p>
  </div>`;
}

function pipLine(): string {
  const name = session.customer?.name ?? 'Your customer';
  const round = save.customersServed;
  if (session.event === 'vip' && session.scene === 'shop') return `${name} is a VIP today. Extra coins if you sew with care.`;
  if (session.event === 'rush' && session.scene === 'shop') return 'Rush order! There is still no wrong answer.';
  if (session.event === 'delivery' && session.scene === 'shop') return 'A new cloth just landed on the shelf.';
  if (!save.tutorialDone) {
    if (session.scene === 'shop') return `${name} is here. Read the wish, then tap the pink button.`;
    if (session.scene === 'sketch') return 'Flip the pages, then tap Sew this sketch.';
    if (session.scene === 'studio' && session.phase === 'fabric') return 'Try pink and sequins — or choose your own.';
    if (session.scene === 'studio' && session.phase === 'sew') return 'Tap the pins, follow each dot, then snip the threads.';
    if (session.scene === 'studio' && session.phase === 'finish') return 'A bow is lovely. Nothing extra is lovely too.';
    if (session.scene === 'reaction') return 'You did it. This look is yours.';
  }
  const fresh = [
    'Every customer wants something a little different.',
    'New pages are hiding in the sketchbook as you sew.',
    'A coat, a gown, a cape — they are all good answers.',
    'If a stitch feels long, I can help. The trims are still yours.',
    'Look at their hint. It is a friend, not a test.',
  ];
  if (session.scene === 'shop' && session.customer?.show && session.pendingTheme) {
    return `${session.pendingTheme.name}: ${session.pendingTheme.blurb}`;
  }
  if (session.scene === 'shop') return fresh[round % fresh.length];
  if (session.scene === 'sketch' && session.mode === 'show' && session.show) {
    return `Look ${session.show.looks.length + 1} of 3. ${session.show.theme.chips.join(' · ')}`;
  }
  if (session.scene === 'sketch') return round % 2 === 0 ? 'A new page might be waiting at the end of the book.' : 'Pick a shape that matches the wish.';
  if (session.scene === 'studio' && session.draft && (session.phase === 'fabric' || session.phase === 'finish')) {
    return liveGrade(session.draft, session.customer ?? CUSTOMERS[0], activeWish()).hint;
  }
  if (session.scene === 'studio' && session.phase === 'sew') {
    const kind = session.draft ? sewKind(session.draft.sketchId) : 'seam';
    const lines: Record<SewKind, string> = {
      seam: 'Stay on the dots. The seam will not skip ahead.',
      hem: 'Hemming is a slow circle. Follow it all the way.',
      pleat: 'Fold the pleats in order, left to right.',
      buttons: 'One glowing button at a time.',
      zipper: 'Zip from the top dot down to the last one.',
    };
    return lines[kind];
  }
  if (session.scene === 'studio' && session.phase === 'finish' && session.draft) {
    return liveGrade(session.draft, session.customer ?? CUSTOMERS[0], activeWish()).hint;
  }
  if (session.scene === 'reaction') return fresh[(round + 2) % fresh.length];
  if (session.scene === 'shelf') return 'Happy customers leave coins here.';
  if (session.scene === 'lookbook') return 'Favorites stay on this device.';
  if (session.scene === 'reviews') return 'Kind words live on the wall.';
  return '';
}

function titleScene(): string {
  return `<section class="title-screen">
    <button class="icon-btn mute-corner" type="button" data-act="mute" aria-label="${save.muted ? 'Unmute' : 'Mute'}">${icon(save.muted ? 'mute' : 'sound')}</button>
    <div class="title-art"><img class="sprite title-model" alt="" src="${modelSignature('ball-gown')}"></div>
    <div class="title-copy">
      <p class="kicker">a boutique game</p>
      <h1>Fashion Frenzy</h1>
      <p class="byline">by Ella</p>
      <button class="btn" type="button" data-act="open-shop">Open the shop</button>
    </div>
    <div class="sparkles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
  </section>`;
}

function mountTitle(): () => void {
  const looks = ['ball-gown', 'starry-gown', 'princess-gown', 'garden-roses', 'cherry-kimono'] as const;
  let index = 0;
  const timer = window.setInterval(() => {
    index = (index + 1) % looks.length;
    const img = document.querySelector('.title-model') as HTMLImageElement | null;
    if (img) img.src = modelSignature(looks[index]);
  }, 2200);
  return () => window.clearInterval(timer);
}

function shopScene(): string {
  const customer = session.customer ?? CUSTOMERS[0];
  const art = shopSvg({
    decor: save.decor,
    customerId: customer.id,
    posterOn: save.tutorialDone && save.customersServed >= (reputation() >= 4 ? 2 : 3),
  });
  const show = Boolean(customer.show);
  return `${hud()}
    <div class="split">
      <div class="art shop-art">${art}</div>
      <section class="panel">
        <div class="panel-scroll">
          <p class="eyebrow">${esc(customer.name)} · ${esc(reputationLabel())}</p>
          <h1 class="request">${icon(customer.icon, 'icon bubble-icon')}<span>${esc(customer.request)}</span></h1>
          ${moodBoard(show && session.pendingTheme ? [{ kind: 'swatch', hex: session.pendingTheme.colors[0] }, { kind: 'icon', name: session.pendingTheme.icon }, { kind: 'swatch', hex: session.pendingTheme.colors[1] ?? session.pendingTheme.colors[0] }] : customer.board)}
          <p class="hint">${esc(customer.hint)}</p>
          ${pip(pipLine())}
        </div>
        <div class="panel-dock">
          <button class="btn" type="button" data-act="${show ? 'start-show' : 'design'}">${show ? 'Design the looks' : 'Design an outfit'}</button>
          ${show ? '<button class="btn secondary" type="button" data-act="decline-show">Maybe later</button>' : '<button class="btn secondary" type="button" data-act="reviews">Guestbook</button>'}
        </div>
      </section>
    </div>`;
}

function pokeCat(): void {
  session.catTaps += 1;
  audio.purr();
  document.querySelector('.cat')?.classList.add('awake');
  if (!save.rainbow && session.catTaps >= 5) {
    save.rainbow = true;
    if (!save.fabrics.includes('rainbow')) save.fabrics.push('rainbow');
    persist();
    draw();
    toast('The cat unrolled a secret rainbow cloth!');
    audio.sparkle();
    return;
  }
  if (session.catTaps === 1) toast(session.cat === 'sleep' ? 'Prrrp. Someone was napping.' : 'The cat blinks, slow and pleased.');
}

function pokeLamp(): void {
  session.lampTaps += 1;
  if (session.lampTaps === 7) {
    session.disco = true;
    audio.sparkle();
    draw();
    toast('The lights want to dance!');
  }
}

function onPoster(): void {
  if (!save.tutorialDone || save.customersServed < (reputation() >= 4 ? 2 : 3)) {
    toast(save.tutorialDone ? 'Sew for two customers, then the show begins.' : 'Let’s help this customer first.');
    return;
  }
  startShow(session.pendingTheme ?? pickTheme());
}

function unlockedSketches(): typeof SKETCHES {
  return SKETCHES.filter((sketch) => save.sketches.includes(sketch.id));
}

function sketchScene(): string {
  const list = unlockedSketches();
  const index = ((session.sketchIndex % list.length) + list.length) % list.length;
  session.sketchIndex = index;
  const sketch = list[index];
  const show = session.mode === 'show' && session.show;
  const title = show ? `Look ${show.looks.length + 1} of 3` : 'Sketchbook';
  return `${hud()}
    <div class="sketch-layout">
      <div class="sketch-top">
        <button class="icon-btn" type="button" data-act="back" aria-label="Back">${icon('back')}</button>
        <div>
          <p class="eyebrow">${esc(title)}</p>
          <h1>${esc(sketch.name)}</h1>
        </div>
      </div>
      <div class="book" data-act="book">
        <div class="page-notes">
          <p class="hand-label">Idea ${String(index + 1).padStart(2, '0')}</p>
          <h2>${esc(sketch.name)}</h2>
          <p class="note">${esc(sketch.note)}</p>
          <p class="note soft">${esc(sketch.blurb)}</p>
        </div>
        <div class="page-draw">
          ${renderSketchDrawing(sketch.id, nextId('sk'))}
        </div>
      </div>
      <div class="sketch-controls">
        <div class="sketch-nav">
          <button class="icon-btn big" type="button" data-act="sketch-prev" aria-label="Previous sketch">${icon('back')}</button>
          <div class="dots">${list.map((item, dot) => `<i class="${dot === index ? 'on' : ''}" title="${esc(item.name)}"></i>`).join('')}</div>
          <button class="icon-btn big flip" type="button" data-act="sketch-next" aria-label="Next sketch">${icon('back')}</button>
        </div>
        ${pip(pipLine())}
        <button class="btn" type="button" data-act="sketch-pick">Sew this sketch</button>
        ${show ? '<button class="btn secondary" type="button" data-act="leave-show">Leave the show</button>' : ''}
      </div>
    </div>`;
}

function mountSketch(): () => void {
  const book = document.querySelector('.book');
  if (!book) return () => {};
  let startX = 0;
  let tracking = false;
  const down = (event: Event) => {
    const pointer = event as PointerEvent;
    tracking = true;
    startX = pointer.clientX;
  };
  const up = (event: Event) => {
    if (!tracking) return;
    tracking = false;
    const pointer = event as PointerEvent;
    const dx = pointer.clientX - startX;
    if (dx > 48) flipSketch(-1);
    else if (dx < -48) flipSketch(1);
  };
  book.addEventListener('pointerdown', down);
  book.addEventListener('pointerup', up);
  return () => {
    book.removeEventListener('pointerdown', down);
    book.removeEventListener('pointerup', up);
  };
}

function flipSketch(dir: number): void {
  const list = unlockedSketches();
  session.sketchIndex = (session.sketchIndex + dir + list.length) % list.length;
  audio.page();
  draw();
}

function activeWish() {
  if (session.mode === 'show' && session.show) return wishFromTheme(session.show.theme);
  return (session.customer ?? CUSTOMERS[0]).wish;
}

function reputation(): number {
  if (!save.reviews.length) return 0;
  return save.reviews.reduce((sum, review) => sum + review.stars, 0) / save.reviews.length;
}

function reputationLabel(): string {
  if (!save.reviews.length) return 'New shop';
  return `Love ${reputation().toFixed(1)}`;
}

function moodBoard(bits: { kind: string; hex?: string; name?: string }[]): string {
  const html = bits
    .map((bit) => {
      if (bit.kind === 'swatch' && bit.hex) return `<i class="mini-swatch" style="background:${bit.hex}" title="A clue color"></i>`;
      if (bit.kind === 'puppy') return `<img class="pixel puppy" alt="A little puppy" src="${puppyURL()}">`;
      return icon(bit.name ?? 'sparkle', 'icon bubble-icon');
    })
    .join('');
  return `<div class="mood-board" aria-label="Mood clues">${html}</div>`;
}

function meterBlock(draft: Draft): string {
  const customer = session.customer ?? CUSTOMERS[0];
  const g = liveGrade(draft, customer, activeWish());
  const filled = Math.round(g.overall * 5);
  const hearts = [1, 2, 3, 4, 5].map((n) => `<i class="${n <= filled ? 'on' : ''}"></i>`).join('');
  const expr: BustExpr = g.mood === 'sparkle' ? 'love' : g.mood === 'think' ? 'thinking' : 'disappointed';
  const label = g.mood === 'sparkle' ? 'They love this' : g.mood === 'think' ? 'Hmm, close' : 'Not quite yet';
  return `<div class="meter mood-${g.mood}" data-mood="${g.mood}">
    <div class="meter-face"><img class="sprite sprite-bust" alt="" src="${customerBust(customer.id, expr)}"></div>
    <div>
      <p class="meter-label">${label}</p>
      <div class="hearts" aria-label="Happiness ${filled} of 5">${hearts}</div>
    </div>
  </div>`;
}

function applyBrief(customer: Customer): void {
  const brief = briefFor(save.customersServed);
  if (!brief) return;
  customer.request = brief.request;
  customer.hint = brief.hint;
  customer.wish = brief.wish;
  customer.board = brief.board;
}

function pickSketch(): void {
  const list = unlockedSketches();
  const sketch = list[session.sketchIndex];
  if (!sketch) return;
  session.draft = {
    sketchId: sketch.id,
    pattern: null,
    color: '',
    accessories: [],
    sewQuality: 0,
  };
  session.phase = 'fabric';
  session.parade = false;
  audio.chime();
  goto('studio');
}

function studioScene(): string {
  const draft = session.draft;
  if (!draft) {
    return `${hud()}<section class="panel"><button class="btn" type="button" data-act="back">Back to sketches</button></section>`;
  }
  const sketch = sketchById(draft.sketchId);
  const show = session.mode === 'show' && session.show;
  const heading = show ? `Look ${show.looks.length + 1} of 3` : sketch.name;
  const formMode = session.phase === 'sew' ? 'paper' : 'fashion';
  const preview: Outfit = {
    id: 'draft',
    sketchId: draft.sketchId,
    pattern: draft.pattern ?? 'solid',
    color: draft.color || '#f4e4d4',
    accessories: session.phase === 'finish' ? draft.accessories : [],
  };
  const sewKindNow = draft ? sewKind(draft.sketchId) : 'seam';
  const autoReady = (save.sewCounts?.[sewKindNow] ?? 0) >= 2;
  const dock =
    session.phase === 'fabric'
      ? `<button class="btn" type="button" data-act="to-sew">Sew it</button>`
      : session.phase === 'sew'
        ? `<p class="step-label">Follow the marks.</p><div class="dock-row">${autoReady ? '<button class="btn secondary" type="button" data-act="auto-sew">Auto-stitch</button>' : ''}<button class="btn" type="button" data-act="help-sew">Pip, help me sew</button></div>`
        : `<button class="btn" type="button" data-act="finish">${esc(session.mode === 'show' ? (session.show && session.show.looks.length === 2 ? 'To the runway' : 'Save this look') : `Show ${session.customer?.name ?? 'them'}`)}</button>`;
  return `${hud()}
    <div class="split studio studio-${session.phase}">
      <div class="art form-art">${renderDressForm(preview, nextId('form'), formMode)}</div>
      <section class="panel">
        <div class="panel-scroll">
          <div class="sketch-top">
            <button class="icon-btn" type="button" data-act="back" aria-label="Back">${icon('back')}</button>
            <div>
              <p class="eyebrow">${esc(heading)}</p>
              <h1>${session.phase === 'fabric' ? 'Choose cloth' : session.phase === 'sew' ? 'Sew' : 'Finishing'}</h1>
            </div>
          </div>
          <ol class="steps">
            <li class="${session.phase === 'fabric' ? 'on' : 'done'}">Cloth</li>
            <li class="${session.phase === 'sew' ? 'on' : session.phase === 'finish' ? 'done' : ''}">Sew</li>
            <li class="${session.phase === 'finish' ? 'on' : ''}">Trim</li>
          </ol>
          ${session.phase === 'fabric' || session.phase === 'finish' ? meterBlock(draft) : ''}
          ${session.phase === 'fabric' ? fabricControls(draft) : ''}
          ${session.phase === 'finish' ? finishControls(draft) : ''}
          ${pip(pipLine())}
          ${session.phase === 'sew' ? `<div class="sew-track" aria-hidden="true"><i></i><i></i><i></i></div><p class="step-label">Follow the marks.</p>` : ''}
        </div>
        <div class="panel-dock">${session.phase === 'sew' ? dock.replace('<p class="step-label">Follow the marks.</p>', '') : dock}</div>
      </section>
    </div>`;
}

function fabricControls(draft: Draft): string {
  const owned = FABRICS.filter((fabric) => save.fabrics.includes(fabric.id));
  const cloth = draft.color || '#f4e4d4';
  return `<p class="color-name">${draft.color ? esc(colorName(draft.color)) : 'Choose a color'}</p>
    <div class="patterns" aria-label="Cloth">${owned
      .map((fabric) => `<button type="button" class="pat ${draft.pattern === fabric.id ? 'on' : ''}" data-act="pattern" data-id="${fabric.id}" style="--c:${cloth}">
          <i class="pat-swatch" style="background-image:url(${swatchURL(fabric.id, cloth)})"></i><span>${esc(fabric.name)}</span>
        </button>`)
      .join('')}</div>
    <div class="colors">${PALETTE.map((swatch) => `<button type="button" class="dot ${draft.color === swatch.hex ? 'on' : ''}" data-act="color" data-id="${swatch.hex}" aria-label="${esc(swatch.name)}" style="background:${swatch.hex}"></button>`).join('')}</div>
    <button class="btn secondary" type="button" data-act="shelf">More cloth is on the shelf</button>`;
}

function finishControls(draft: Draft): string {
  const owned = ACCESSORIES.filter((item) => save.accessories.includes(item.id));
  return `<div class="patterns trims">${owned
    .map((item) => `<button type="button" class="pat ${draft.accessories.includes(item.id) ? 'on' : ''}" data-act="accessory" data-id="${item.id}">
        <i class="trim-icon"><img alt="" src="${trimURL(item.id)}"></i><span>${esc(item.name)}</span>
      </button>`)
    .join('')}</div>`;
}

function mountStudio(): () => void {
  const stops: Array<() => void> = [];
  if (session.phase === 'sew') stops.push(mountSew());
  if (session.phase === 'fabric' || session.phase === 'finish') stops.push(mountTape());
  return () => stops.forEach((stop) => stop());
}

function mountTape(): () => void {
  const svg = document.querySelector('.dress-svg');
  if (!svg) return () => {};
  let timer = 0;
  const down = (event: Event) => {
    const target = event.target as Element | null;
    if (target?.closest('[data-act]')) return;
    timer = window.setTimeout(() => {
      if (!save.tapeFound) {
        save.tapeFound = true;
        save.hearts += 1;
        persist();
      }
      toast('The tape says: you are exactly the right size.');
      audio.chime();
    }, 700);
  };
  const up = () => window.clearTimeout(timer);
  svg.addEventListener('pointerdown', down);
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointerleave', up);
  return () => {
    window.clearTimeout(timer);
    svg.removeEventListener('pointerdown', down);
    svg.removeEventListener('pointerup', up);
    svg.removeEventListener('pointerleave', up);
  };
}

function mountSew(): () => void {
  const svg = document.querySelector('.dress-svg') as SVGSVGElement | null;
  const draft = session.draft;
  if (!svg || !draft) return () => {};
  const plan = sewPlan(draft.sketchId, (save.customersServed * 17 + draft.sketchId.length * 13) >>> 0);
  const layout = { pins: plan.pins, snips: plan.snips };
  const samples = plan.path.length ? samplePolyline(plan.path, 18) : [];
  const done = samples.map(() => false);
  let nextDot = 0;
  let nextTap = 0;
  let step: 'pin' | 'stitch' | 'snip' | 'tap' = plan.pins.length ? 'pin' : plan.taps.length ? 'tap' : 'stitch';
  const pins = new Set<number>();
  const snips = new Set<number>();
  const taps = new Set<number>();
  svg.dataset.sewKind = plan.kind;
  svg.dataset.sewShape = plan.curved ? 'curved' : 'straight';
  const showSewPicture = (which: 'pattern' | 'half' | 'draped') => {
    const photo = svg.querySelector('#form-photo');
    if (photo) photo.setAttribute('href', sewForm(which === 'half' ? 'half' : which === 'draped' ? 'draped' : 'pattern'));
  };
  showSewPicture(step === 'stitch' ? 'half' : step === 'tap' ? 'draped' : 'pattern');
  let drawing = false;
  let last: { x: number; y: number } | null = null;
  let lastSound = 0;
  let stitchLocked = false;
  svg.classList.add(step === 'pin' ? 'step-pin' : step === 'tap' ? 'step-stitch' : 'step-stitch');
  const host = svg.parentElement;
  const pads: HTMLButtonElement[] = [];
  const PAD = 56;
  const placePads = (kind: 'pin' | 'snip' | 'tap', points: { x: number; y: number }[]) => {
    pads.forEach((pad) => pad.remove());
    pads.length = 0;
    if (!host || points.length === 0) return;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const bounds = host.getBoundingClientRect();
    const spots: { x: number; y: number }[] = [];
    points.forEach((point) => {
      const local = svg.createSVGPoint();
      local.x = point.x;
      local.y = point.y;
      const screen = local.matrixTransform(matrix);
      let x = screen.x - bounds.left;
      let y = screen.y - bounds.top;
      for (const other of spots) {
        const dx = x - other.x;
        const dy = y - other.y;
        const dist = Math.hypot(dx, dy);
        if (dist < PAD + 8) {
          const push = (PAD + 8 - dist) / 2 + 1;
          const ux = dist < 1 ? 1 : dx / dist;
          const uy = dist < 1 ? 0 : dy / dist;
          x += ux * push;
          other.x -= ux * push;
          other.y -= uy * push;
          y += uy * push;
        }
      }
      spots.push({ x, y });
    });
    spots.forEach((spot) => {
      spot.x = Math.min(bounds.width - PAD / 2 - 4, Math.max(PAD / 2 + 4, spot.x));
      spot.y = Math.min(bounds.height - PAD / 2 - 4, Math.max(PAD / 2 + 4, spot.y));
    });
    spots.forEach((spot, index) => {
      const pad = document.createElement('button');
      pad.type = 'button';
      pad.className = 'touch-pad';
      pad.dataset.act = kind;
      pad.dataset.id = String(index);
      const labelWord = kind === 'pin' ? 'Pin' : kind === 'tap' ? 'Mark' : 'Loose thread';
      pad.setAttribute('aria-label', `${labelWord} ${index + 1}`);
      pad.style.width = `${PAD}px`;
      pad.style.height = `${PAD}px`;
      pad.style.left = `${spot.x - PAD / 2}px`;
      pad.style.top = `${spot.y - PAD / 2}px`;
      const doneAlready = kind === 'pin' ? pins.has(index) : kind === 'tap' ? taps.has(index) : snips.has(index);
      if (doneAlready) pad.classList.add('done');
      if (kind === 'tap') pad.classList.toggle('next', index === nextTap);
      pad.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (kind === 'pin') placePin(index);
        else if (kind === 'tap') placeTap(index);
        else placeSnip(index);
      });
      host.appendChild(pad);
      pads.push(pad);
    });
  };
  const donePath = svg.querySelector('.stitch-done');
  const loose = svg.querySelector('.loose-thread');
  const label = document.querySelector('.step-label');

  const setLabel = (text: string) => {
    if (label) label.textContent = text;
    const root = document.querySelector('.studio-sew') as HTMLElement | null;
    if (root) root.dataset.substep = step;
  };

  const redraw = () => {
    let d = '';
    let pen = false;
    samples.forEach((point, index) => {
      if (!done[index]) {
        pen = false;
        return;
      }
      d += `${pen ? 'L' : 'M'} ${point.x.toFixed(1)} ${point.y.toFixed(1)} `;
      pen = true;
    });
    donePath?.setAttribute('d', d);
  };

  const dotEls: SVGCircleElement[] = [];
  samples.forEach((point, index) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('class', 'stitch-dot');
    dot.setAttribute('cx', point.x.toFixed(1));
    dot.setAttribute('cy', point.y.toFixed(1));
    dot.setAttribute('r', '8');
    dot.dataset.i = String(index);
    svg.appendChild(dot);
    dotEls.push(dot);
  });
  const needle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  needle.setAttribute('class', 'needle');
  needle.setAttribute('r', '5');
  needle.setAttribute('cx', String(samples[0]?.x ?? 0));
  needle.setAttribute('cy', String(samples[0]?.y ?? 0));
  if (samples.length) svg.appendChild(needle);

  const screenDist = (point: { x: number; y: number }, clientX: number, clientY: number) => {
    const local = svg.createSVGPoint();
    local.x = point.x;
    local.y = point.y;
    const matrix = svg.getScreenCTM();
    if (!matrix) return 999;
    const screen = local.matrixTransform(matrix);
    return Math.hypot(screen.x - clientX, screen.y - clientY);
  };

  const advanceAt = (clientX: number, clientY: number) => {
    if (step !== 'stitch' || stitchLocked) return;
    let hit = false;
    while (nextDot < samples.length && screenDist(samples[nextDot], clientX, clientY) <= 28) {
      done[nextDot] = true;
      dotEls[nextDot]?.classList.add('filled');
      const here = samples[nextDot];
      needle.setAttribute('cx', here.x.toFixed(1));
      needle.setAttribute('cy', here.y.toFixed(1));
      nextDot += 1;
      hit = true;
    }
    if (!hit) return;
    redraw();
    const now = performance.now();
    if (now - lastSound > 70) {
      lastSound = now;
      audio.sew();
    }
    if (nextDot >= samples.length) finishStitch();
  };

  const finishStitch = () => {
    if (stitchLocked) return;
    stitchLocked = true;
    const cov = samples.length ? nextDot / samples.length : 1;
    redraw();
    draft.sewQuality = Math.min(1, 0.7 + cov * 0.3);
    loose?.setAttribute('d', '');
    noteSew(plan.kind);
    if (!layout.snips.length) {
      window.setTimeout(() => {
        if (session.phase === 'sew') {
          session.phase = 'finish';
          audio.sparkle();
          draw();
        }
      }, 280);
      return;
    }
    step = 'snip';
    showSewPicture('half');
    svg.classList.remove('step-stitch');
    svg.classList.add('step-snip', 'sew-snap');
    setLabel('Tap the two loose threads.');
    placePads('snip', layout.snips);
    burstSparkle(host);
    audio.sparkle();
  };

  const placePin = (index: number) => {
    if (step !== 'pin' || pins.has(index) || Number.isNaN(index)) return;
    pins.add(index);
    svg.querySelector(`.pin-spot[data-i="${index}"]`)?.classList.add('pinned');
    pads.find((pad) => pad.dataset.act === 'pin' && pad.dataset.id === String(index))?.classList.add('done');
    audio.pin();
    if (pins.size >= layout.pins.length) {
      step = 'stitch';
      showSewPicture('half');
      svg.classList.remove('step-pin');
      svg.classList.add('step-stitch');
      setLabel(plan.label);
      placePads('pin', []);
    }
  };

  const placeTap = (index: number) => {
    if (step !== 'tap' || index !== nextTap || taps.has(index)) return;
    taps.add(index);
    nextTap += 1;
    audio.pin();
    pads.forEach((pad, padIndex) => {
      pad.classList.toggle('done', taps.has(padIndex));
      pad.classList.toggle('next', padIndex === nextTap);
    });
    if (nextTap >= plan.taps.length) {
      noteSew(plan.kind);
      draft.sewQuality = 0.86;
      window.setTimeout(() => {
        if (session.phase === 'sew') {
          session.phase = 'finish';
          burstSparkle(host);
          audio.sparkle();
          draw();
        }
      }, 220);
    }
  };

  const placeSnip = (index: number) => {
    if (step !== 'snip' || snips.has(index) || Number.isNaN(index)) return;
    snips.add(index);
    svg.querySelector(`.snip-spot[data-i="${index}"]`)?.classList.add('snipped');
    pads.find((pad) => pad.dataset.act === 'snip' && pad.dataset.id === String(index))?.classList.add('done');
    audio.snip();
    if (snips.size >= layout.snips.length) {
      window.setTimeout(() => {
        if (session.phase === 'sew') {
          session.phase = 'finish';
          audio.sparkle();
          draw();
        }
      }, 280);
    }
  };

  const down = (event: PointerEvent) => {
    const hit = (event.target as Element | null)?.closest('[data-act]');
    const act = hit?.getAttribute('data-act');
    if (act === 'pin' && step === 'pin') {
      event.stopPropagation();
      placePin(Number(hit?.getAttribute('data-id') ?? hit?.getAttribute('data-i')));
      return;
    }
    if (act === 'snip' && step === 'snip') {
      event.stopPropagation();
      placeSnip(Number(hit?.getAttribute('data-id') ?? hit?.getAttribute('data-i')));
      return;
    }
    if (step !== 'stitch') return;
    drawing = true;
    try {
      svg.setPointerCapture(event.pointerId);
    } catch {
      /* Touch listeners cover the drag when this pointer id is not live. */
    }
    last = { x: event.clientX, y: event.clientY };
    advanceAt(event.clientX, event.clientY);
  };

  const move = (event: PointerEvent) => {
    if (!drawing || step !== 'stitch') return;
    const point = { x: event.clientX, y: event.clientY };
    if (last) {
      const dist = Math.hypot(point.x - last.x, point.y - last.y);
      const steps = Math.max(1, Math.ceil(dist / 6));
      for (let index = 1; index <= steps; index++) {
        advanceAt(last.x + ((point.x - last.x) * index) / steps, last.y + ((point.y - last.y) * index) / steps);
      }
    }
    last = point;
  };

  const up = () => {
    drawing = false;
    loose?.setAttribute('d', '');
  };

  const fromTouch = (event: TouchEvent) => {
    const touch = event.changedTouches[0] || event.touches[0];
    if (!touch) return null;
    return {
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: document.elementFromPoint(touch.clientX, touch.clientY),
      pointerId: 1,
      stopPropagation() {},
    } as unknown as PointerEvent;
  };
  const touchStart = (event: TouchEvent) => {
    if (step === 'stitch') event.preventDefault();
    const pointer = fromTouch(event);
    if (pointer) down(pointer);
  };
  const touchMove = (event: TouchEvent) => {
    if (step !== 'stitch' || !drawing) return;
    event.preventDefault();
    const pointer = fromTouch(event);
    if (pointer) move(pointer);
  };
  svg.addEventListener('pointerdown', down);
  svg.addEventListener('pointermove', move);
  svg.addEventListener('touchstart', touchStart, { passive: false });
  svg.addEventListener('touchmove', touchMove, { passive: false });
  window.addEventListener('pointerup', up);
  window.addEventListener('touchend', up);
  const refreshPads = () => {
    if (step === 'pin') placePads('pin', layout.pins);
    else if (step === 'tap') placePads('tap', plan.taps);
    else if (step === 'snip') placePads('snip', layout.snips);
  };
  setLabel(step === 'pin' ? 'Tap each pink pin.' : plan.label);
  refreshPads();
  requestAnimationFrame(refreshPads);
  const onResize = () => refreshPads();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  const stageObserver = new ResizeObserver(() => refreshPads());
  if (host) stageObserver.observe(host);
  sewApi = { pin: placePin, snip: placeSnip };

  const assist = window.setTimeout(() => {
    if (step === 'pin') {
      layout.pins.forEach((_, index) => placePin(index));
      toast('Pinned! Trace the pink thread.');
    }
  }, 11000);

  return () => {
    window.clearTimeout(assist);
    sewApi = null;
    pads.forEach((pad) => pad.remove());
    svg.removeEventListener('pointerdown', down);
    svg.removeEventListener('pointermove', move);
    svg.removeEventListener('touchstart', touchStart);
    svg.removeEventListener('touchmove', touchMove);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('touchend', up);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onResize);
    stageObserver.disconnect();
  };
}

function samplePolyline(points: { x: number; y: number }[], step: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let index = 0; index < points.length - 1; index++) {
    const a = points[index];
    const b = points[index + 1];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const slices = Math.max(1, Math.ceil(length / step));
    for (let slice = 0; slice < slices; slice++) {
      const t = slice / slices;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  const last = points[points.length - 1];
  if (last) out.push(last);
  return out;
}

function noteSew(kind: SewKind): void {
  const counts = save.sewCounts ?? {};
  counts[kind] = (counts[kind] ?? 0) + 1;
  save.sewCounts = counts;
  persist();
}

function burstSparkle(host: HTMLElement | null): void {
  if (!host) return;
  const burst = document.createElement('div');
  burst.className = 'sew-spark';
  burst.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i>';
  host.appendChild(burst);
  window.setTimeout(() => burst.remove(), 700);
}

function helpSew(auto = false): void {
  if (!session.draft) return;
  session.draft.sewQuality = auto ? 0.74 : 0.58;
  session.phase = 'finish';
  toast(auto ? 'Auto-stitch done. The trims are still yours.' : 'Pip finished the stitches. You can still add trims.');
  audio.chime();
  draw();
}

function toggleAccessory(id: string): void {
  if (!session.draft || !isAccessory(id)) return;
  const list = session.draft.accessories;
  const index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1);
  else list.push(id);
  if (list.length >= 5 && !session.parade) {
    session.parade = true;
    toast('A whole parade of extras!');
    audio.sparkle();
  }
  draw();
}

function finishOutfit(): void {
  const draft = session.draft;
  if (!draft) return;
  if (session.mode === 'show' && session.show) {
    const theme = session.show.theme;
    const matched = theme.sketches.includes(draft.sketchId) || (draft.pattern ? theme.patterns.includes(draft.pattern) : false);
    const stars = draft.sewQuality > 0.9 || matched ? 3 : 2;
    const outfit = draftToOutfit(draft, stars, theme.id);
    session.show.looks.push(outfit);
    earn(12, 1, stars);
    session.draft = null;
    if (session.show.looks.length >= 3) {
      audio.sparkle();
      goto('runway');
    } else {
      toast(`Look ${session.show.looks.length} is ready for the runway.`);
      goto('sketch');
    }
    return;
  }
  const customer = session.customer ?? CUSTOMERS[0];
  const score = grade(draft, customer, activeWish());
  const outfit = draftToOutfit(draft, score.review);
  session.lastScore = score;
  session.lastOutfit = outfit;
  save.reviews.unshift({
    id: oid(),
    name: customer.name,
    stars: score.review,
    quote: score.line,
    coins: score.coins,
    look: {
      skin: customer.skin,
      hair: customer.hair,
      hairColor: customer.hairColor,
      glasses: customer.glasses,
      freckles: customer.freckles,
      beret: customer.beret,
      blush: customer.blush,
    },
  });
  save.reviews = save.reviews.slice(0, 24);
  earn(score.coins, score.hearts, score.review);
  save.customersServed += 1;
  save.tutorialDone = true;
  const rewards = grantRoundRewards(save);
  if (session.bonus > 1) save.coins += session.bonus;
  if (session.event === 'rush') save.hearts += 1;
  if (rewards.length) toast(`New in the shop: ${rewards.join(', ')}.`);
  persist();
  audio.chime();
  if (score.sparkle) audio.sparkle();
  goto('reaction');
}

function draftToOutfit(draft: Draft, stars: number, themeId?: string): Outfit {
  const sketch = sketchById(draft.sketchId);
  return {
    id: oid(),
    sketchId: draft.sketchId,
    pattern: draft.pattern ?? 'solid',
    color: draft.color || '#f4e4d4',
    accessories: [...draft.accessories],
    stars,
    label: `${colorName(draft.color)} ${sketch.name}`,
    themeId,
  };
}

function earn(coins: number, hearts: number, stars: number): void {
  save.coins += coins;
  save.hearts += hearts;
  save.stars += stars;
  session.hudBump = true;
  audio.coin();
  persist();
}

function reactionScene(): string {
  const outfit = session.lastOutfit;
  const score = session.lastScore;
  const customer = session.customer ?? CUSTOMERS[0];
  if (!outfit || !score) {
    return `${hud()}<section class="panel"><button class="btn" type="button" data-act="next-customer">Back to the shop</button></section>`;
  }
  const saved = save.lookbook.some((look) => look.id === outfit.id);
  const mood = score.review >= 4 ? 'love' : score.review <= 2 ? 'disappointed' : score.mood === 'think' ? 'thinking' : 'happy';
  return `${hud()}
    <div class="reaction">
      ${score.sparkle ? confetti() : ''}
      ${hearts()}
      <div class="reaction-stage">
        ${renderDressForm(outfit, nextId('react'))}
        <img class="sprite reaction-bust ${mood === 'love' ? 'cheer' : ''}" alt="" src="${customerBust(customer.id, mood)}">
      </div>
      <section class="panel slim">
        <div class="panel-scroll">
        <div class="review-head">
          <div class="review-face"><img class="sprite sprite-bust" alt="" src="${customerBust(customer.id, score.review >= 4 ? 'love' : score.review <= 2 ? 'disappointed' : score.mood === 'think' ? 'thinking' : 'happy')}"></div>
          <div>
            <div class="stars" aria-label="${score.review} star review">${[1, 2, 3, 4, 5].map((n) => `<span class="${n <= score.review ? 'on' : ''}">${icon('star')}</span>`).join('')}</div>
            <h1>${esc(customer.name)}’s review</h1>
            <p class="request-line">${esc(score.line)}</p>
          </div>
        </div>
        <ul class="receipt">
          <li><span>Color</span><b>${score.starsFor.color}/5</b></li>
          <li class="cloth-row"><span>Cloth</span><b class="cloth-score"><img class="receipt-swatch" alt="" src="${swatchURL(outfit.pattern, outfit.color)}"><span>${esc(fabricById(outfit.pattern).name)}</span><span>${score.starsFor.cloth}/5</span></b></li>
          <li><span>Shape</span><b>${score.starsFor.shape}/5</b></li>
          <li><span>Stitch</span><b>${score.starsFor.sew}/5</b></li>
          <li><span>Base</span><b>${score.basePay}</b></li>
          <li><span>Tip</span><b>${score.tip}</b></li>
          <li><span>Secret wish</span><b>${score.secretBonus ? `+${score.secretBonus}` : '—'}</b></li>
          <li class="total"><span>Paid</span><b>${score.coins} coins</b></li>
        </ul>
        ${pip(pipLine())}
        </div>
        <div class="panel-dock">
          <button class="btn" type="button" data-act="save-look">${saved ? 'Saved in the lookbook' : 'Keep in my lookbook'}</button>
          <button class="btn secondary" type="button" data-act="share-look">Save a picture</button>
          <button class="btn secondary" type="button" data-act="next-customer">Next customer</button>
        </div>
      </section>
    </div>`;
}

function reviewsScene(): string {
  const cards = save.reviews
    .map(
      (review) => `<article class="review-card">
        <div class="review-face"><img class="sprite sprite-bust" alt="" src="${customerBust(review.name.toLowerCase(), review.stars >= 4 ? 'love' : 'happy')}"></div>
        <div>
          <h2>${esc(review.name)}</h2>
          <p class="stars">${[1, 2, 3, 4, 5].map((n) => `<span class="${n <= review.stars ? 'on' : ''}">${icon('star')}</span>`).join('')}</p>
          <p>${esc(review.quote)}</p>
        </div>
      </article>`,
    )
    .join('');
  return `${hud()}
    <div class="guest-page">
      <div class="sketch-top">
        <button class="icon-btn" type="button" data-act="back" aria-label="Back">${icon('back')}</button>
        <div>
          <p class="eyebrow">${esc(reputationLabel())}</p>
          <h1>Guestbook</h1>
        </div>
      </div>
      ${pip(pipLine())}
      <div class="review-list">
        ${cards || '<div class="empty"><h2>No reviews yet</h2><p>Sew a look and the wall will fill up.</p></div>'}
      </div>
    </div>`;
}

function hearts(): string {
  return `<div class="floaters" aria-hidden="true">${[18, 32, 48, 63, 74, 86]
    .map((left, index) => `<span style="left:${left}%;animation-delay:${index * 0.12}s">${icon('heart')}</span>`)
    .join('')}</div>`;
}

function confetti(): string {
  const bits = Array.from({ length: 26 }, (_, index) => {
    const left = (index * 37) % 100;
    const top = (index * 23) % 86;
    const delay = (index % 7) * 0.07;
    const color = ['#e56b93', '#f2c14e', '#7dce82', '#8ec6e6', '#c9a6e0'][index % 5];
    return `<i style="left:${left}%;top:${top}%;animation-delay:${delay}s;background:${color}"></i>`;
  }).join('');
  return `<div class="confetti" aria-hidden="true">${bits}</div>`;
}

function toggleLook(outfit: Outfit): void {
  const index = save.lookbook.findIndex((look) => look.id === outfit.id);
  if (index >= 0) {
    save.lookbook.splice(index, 1);
    toast('Taken out of the lookbook.');
  } else {
    save.lookbook.unshift(outfit);
    if (save.lookbook.length > 24) {
      save.lookbook.pop();
      toast('The book made room for this new look.');
    } else toast('Saved in your lookbook.');
    audio.chime();
  }
  persist();
  draw();
}

async function shareCurrent(): Promise<void> {
  const outfit = session.viewing
    ? save.lookbook.find((look) => look.id === session.viewing) ?? session.lastOutfit
    : session.lastOutfit;
  if (!outfit) return;
  try {
    const url = tintedSprite('form', outfit.sketchId, outfit.color, outfit.pattern);
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('picture'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.fillStyle = '#fbf6f0';
    ctx.fillRect(0, 0, 1080, 1440);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, 270, 240, 540, 864);
    ctx.fillStyle = '#2a211c';
    ctx.textAlign = 'center';
    ctx.font = '700 72px Fraunces, Georgia, serif';
    ctx.fillText('Fashion Frenzy', 540, 120);
    ctx.font = '700 36px Nunito, sans-serif';
    ctx.fillStyle = '#6d5b52';
    ctx.fillText(outfit.label ?? 'A look by Ella', 540, 1320);
    ctx.font = '600 28px Nunito, sans-serif';
    ctx.fillText('by Ella', 540, 1370);
    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('png'))), 'image/png');
    });
    const file = new File([png], 'fashion-frenzy-look.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Fashion Frenzy', text: 'A look I designed.' });
    } else {
      const pngUrl = URL.createObjectURL(png);
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = 'fashion-frenzy-look.png';
      link.click();
      URL.revokeObjectURL(pngUrl);
      toast('Picture saved.');
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    toast('The picture couldn’t be made just now.');
  }
}

function lookbookScene(): string {
  const open = save.lookbook.find((look) => look.id === session.viewing);
  if (open) {
    return `${hud()}
      <div class="detail">
        <div class="art">${renderDressForm(open, nextId('detail'))}</div>
        <section class="panel">
          <button class="icon-btn" type="button" data-act="close-look" aria-label="Back">${icon('back')}</button>
          <h1>${esc(open.label ?? 'A look')}</h1>
          <div class="stars">${[1, 2, 3].map((n) => `<span class="${n <= (open.stars ?? 2) ? 'on' : ''}">${icon('star')}</span>`).join('')}</div>
          <p class="hint">${esc(fabricById(open.pattern).name)} · ${esc(colorName(open.color))}</p>
          <button class="btn" type="button" data-act="share-look">Save a picture</button>
          <button class="btn ghost" type="button" data-act="drop-look" data-id="${esc(open.id)}">Let this one go</button>
        </section>
      </div>`;
  }
  const cards = save.lookbook
    .map(
      (look) => `<button class="look-card" type="button" data-act="open-look" data-id="${esc(look.id)}">
        <img class="sprite sprite-card" alt="" src="${modelSignature(look.sketchId)}">
        <span>${esc(look.label ?? sketchById(look.sketchId).name)}</span>
      </button>`,
    )
    .join('');
  return `${hud()}
    <div class="book-page">
      <div class="sketch-top">
        <button class="icon-btn" type="button" data-act="back" aria-label="Back">${icon('back')}</button>
        <h1>Lookbook</h1>
      </div>
      ${pip(pipLine())}
      ${
        cards
          ? `<div class="look-grid">${cards}</div>`
          : '<div class="empty"><h2>No favorites yet</h2><p>Sew a look, then tap the heart button to keep it.</p></div>'
      }
    </div>`;
}

function shelfScene(): string {
  return `${hud()}
    <div class="book-page shelf">
      <div class="sketch-top">
        <button class="icon-btn" type="button" data-act="back" aria-label="Back">${icon('back')}</button>
        <div>
          <p class="eyebrow">${save.coins} coins</p>
          <h1>The shelf</h1>
        </div>
      </div>
      ${pip(pipLine())}
      ${shelfGroup('Sketches', SKETCHES.filter((item) => !item.starter).map((item) => shelfCard('sketch', item.id, item.name, item.blurb, item.price, save.sketches.includes(item.id))))}
      ${shelfGroup('Cloth', FABRICS.filter((item) => !item.starter).map((item) => shelfCard('fabric', item.id, item.name, item.blurb, item.secret ? 0 : item.price, save.fabrics.includes(item.id), item.secret)))}
      ${shelfGroup('Trims', ACCESSORIES.filter((item) => !item.starter).map((item) => shelfCard('accessory', item.id, item.name, item.blurb, item.price, save.accessories.includes(item.id))))}
      ${shelfGroup('Boutique', DECOR.map((item) => shelfCard('decor', item.id, item.name, item.blurb, item.price, save.decor.includes(item.id))))}
    </div>`;
}

function shelfGroup(title: string, cards: string[]): string {
  return `<section class="shelf-group"><h2>${esc(title)}</h2><div class="shelf-row">${cards.join('')}</div></section>`;
}

function shelfCard(
  kind: string,
  id: string,
  name: string,
  blurb: string,
  price: number,
  owned: boolean,
  secret = false,
): string {
  if (secret && !owned) return '';
  const tag = owned ? 'Yours' : secret ? 'Found' : `${price} coins`;
  const art =
    kind === 'sketch'
      ? modelSignature(id)
      : kind === 'fabric'
        ? swatchURL(id as FabricId, '#e56b93')
        : kind === 'accessory'
          ? trimURL(id)
          : decorArt(id);
  return `<button class="shelf-card ${owned ? 'owned' : ''}" type="button" data-act="buy" data-kind="${kind}" data-id="${id}">
    <img class="pixel shelf-art" alt="" src="${art}">
    <strong>${esc(name)}</strong>
    <span>${esc(blurb)}</span>
    <em>${esc(tag)}</em>
  </button>`;
}

function buy(kind: string, id: string): void {
  const spent = (price: number, name: string, take: () => void, owned: boolean) => {
    if (owned) return;
    if (save.coins < price) {
      toast('A few more coins and it’s yours.');
      audio.tap();
      return;
    }
    save.coins -= price;
    take();
    persist();
    audio.chime();
    toast(`${name} unlocked!`);
    draw();
  };
  if (kind === 'fabric') {
    const item = FABRICS.find((entry) => entry.id === id);
    if (!item || item.secret) return;
    spent(item.price, item.name, () => save.fabrics.push(item.id), save.fabrics.includes(item.id));
  } else if (kind === 'sketch') {
    const item = SKETCHES.find((entry) => entry.id === id);
    if (!item) return;
    spent(item.price, item.name, () => save.sketches.push(item.id), save.sketches.includes(item.id));
  } else if (kind === 'accessory') {
    const item = ACCESSORIES.find((entry) => entry.id === id);
    if (!item) return;
    spent(item.price, item.name, () => save.accessories.push(item.id), save.accessories.includes(item.id));
  } else if (kind === 'decor') {
    const item = DECOR.find((entry) => entry.id === id);
    if (!item) return;
    spent(item.price, item.name, () => save.decor.push(item.id as DecorId), save.decor.includes(item.id));
  }
}

function needTheme(): Theme {
  return session.show?.theme ?? session.pendingTheme ?? THEMES[0];
}

function startShow(theme: Theme): void {
  session.mode = 'show';
  session.pendingTheme = theme;
  session.show = {
    theme,
    looks: [],
    rivals: makeRivals(theme),
    awards: [],
    paid: false,
  };
  session.draft = null;
  session.sketchIndex = 0;
  audio.chime();
  goto('sketch');
}

function leaveShow(): void {
  if (!session.leaveArmed) {
    session.leaveArmed = true;
    toast('Tap Leave the show again to go.');
    return;
  }
  session.mode = 'customer';
  session.show = null;
  session.leaveArmed = false;
  toast('The runway will be here when you want it.');
  goto('shop');
}

function makeRivals(theme: Theme): Rival[] {
  const rng = mulberry32((Date.now() ^ theme.name.length * 131) >>> 0);
  const specs: { name: string; patterns: FabricId[]; sketches: SketchId[]; acc: AccessoryId[] }[] = [
    {
      name: 'Maison Lumi',
      patterns: ['floral', 'tulle', 'polka', 'solid'],
      sketches: ['ball-gown', 'princess-gown', 'garden-roses', 'sunset-chiffon', 'candy-party'],
      acc: ['bow', 'shoes'],
    },
    {
      name: 'Atelier Pip',
      patterns: ['stripes', 'denim', 'solid'],
      sketches: ['mermaid-gown', 'cherry-kimono', 'tiered-ruffle', 'peacock-train'],
      acc: ['buttons', 'belt', 'shoes'],
    },
    {
      name: 'House of Nia',
      patterns: ['sequins', 'velvet', 'rainbow'],
      sketches: ['starry-gown', 'ice-crystal', 'butterfly-cape', 'ball-gown', 'hero-cape'],
      acc: ['hat', 'sequins', 'belt'],
    },
  ];
  return specs.map((spec) => {
    const pattern = spec.patterns[Math.floor(rng() * spec.patterns.length)];
    const sketchId = spec.sketches[Math.floor(rng() * spec.sketches.length)];
    const color = theme.colors[Math.floor(rng() * theme.colors.length)];
    const accessory = spec.acc[Math.floor(rng() * spec.acc.length)];
    const model = MODELS[Math.floor(rng() * MODELS.length)];
    return {
      name: spec.name,
      model,
      outfit: {
        id: oid(),
        sketchId,
        pattern,
        color,
        accessories: [accessory],
        label: spec.name,
        themeId: theme.id,
      },
    };
  });
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function runwayScene(): string {
  const theme = needTheme();
  return `<section class="runway">
      <header class="runway-bar">
        <button class="icon-btn" type="button" data-act="mute" aria-label="${save.muted ? 'Unmute' : 'Mute'}">${icon(save.muted ? 'mute' : 'sound')}</button>
        <p class="runway-theme">${esc(theme.name)}</p>
        <button class="btn secondary tiny" type="button" data-act="runway-next">Next</button>
      </header>
      <div class="crowd crowd-left">${crowd(0)}</div>
      <div class="crowd crowd-right">${crowd(3)}</div>
      <div class="photog left">${photographer('kneel')}</div>
      <div class="photog right">${photographer('stand')}</div>
      <img class="sprite runway-flash" alt="" src="${runwayArt('fx-flash')}">
      <div class="catwalk"><div class="lane"></div></div>
      <div class="spot"></div>
      <div class="model-slot"></div>
      <div class="ella-banner"><b>Ella</b><span>her look</span></div>
      <div class="namecard"><b>Tonight</b><span>${esc(theme.name)}</span></div>
      <div class="confetti ella-confetti" aria-hidden="true"></div>
      <div class="flash"></div>
    </section>`;
}

function photographer(which: 'stand' | 'kneel'): string {
  return `<img class="sprite photog-sprite" alt="" src="${runwayArt(which === 'stand' ? 'photographer-stand' : 'photographer-kneel')}">`;
}

function crowd(shift: number): string {
  const fans = [
    'crowd-girl-clap',
    'crowd-boy-cheer',
    'crowd-grandma',
    'crowd-teen-phone',
    'crowd-kid-lightstick',
    'crowd-dad-clap',
    'crowd-girl-hearteyes',
    'crowd-boy-wave',
  ];
  return Array.from({ length: 6 }, (_, index) => {
    const name = fans[(index + shift) % fans.length];
    return `<img class="sprite fan" alt="" style="--i:${index}" src="${runwayArt(name)}">`;
  }).join('');
}

function mountRunway(): () => void {
  runway.cancelled = false;
  runway.raf = 0;
  runway.skip = null;
  runway.progress = 0;
  const onResize = () => {
    const slot = document.querySelector('.model-slot') as HTMLElement | null;
    if (slot) fitRunwaySlot(slot, runway.progress || 1);
  };
  window.addEventListener('resize', onResize);
  const stage = document.querySelector('.runway');
  const observer = new ResizeObserver(onResize);
  if (stage) observer.observe(stage);
  void playShow();
  return () => {
    runway.cancelled = true;
    runway.skip?.();
    cancelAnimationFrame(runway.raf);
    window.removeEventListener('resize', onResize);
    observer.disconnect();
  };
}

async function playShow(): Promise<void> {
  const show = session.show;
  if (!show) {
    goto('shop');
    return;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lineup = show.rivals.flatMap((rival, index) => {
    const mine = show.looks[index];
    const entries: { label: string; sub: string; look: PersonLook; outfit: Outfit; finale: boolean }[] = [
      {
        label: rival.name,
        sub: sketchById(rival.outfit.sketchId).name,
        look: rival.model,
        outfit: rival.outfit,
        finale: false,
      },
    ];
    if (mine) {
      entries.push({
        label: 'Ella',
        sub: sketchById(mine.sketchId).name,
        look: MODELS[(index + 3) % MODELS.length],
        outfit: mine,
        finale: index === show.looks.length - 1,
      });
    }
    return entries;
  });
  await pause(reduce ? 400 : 1000);
  for (const entry of lineup) {
    if (runway.cancelled || session.scene !== 'runway') return;
    const ella = entry.label === 'Ella';
    setCard(ella ? 'Ella' : entry.label, entry.sub);
    document.querySelector('.runway')?.classList.toggle('ella-show', ella);
    const banner = document.querySelector('.ella-banner span');
    if (banner) banner.textContent = entry.sub;
    if (ella) {
      const burst = document.querySelector('.ella-confetti');
      if (burst) burst.innerHTML = confetti().replace(/^<div[^>]*>/, '').replace(/<\/div>$/, '');
    }
    const slot = document.querySelector('.model-slot') as HTMLElement | null;
    if (!slot) return;
    const pose: Pose = 'stride';
    slot.innerHTML = renderPerson({
      look: entry.look,
      outfit: entry.outfit,
      pose,
      uid: nextId('run'),
      showcase: entry.label !== 'Ella',
    });
    slot.classList.toggle('finale', entry.finale);
    slot.classList.remove('posing');
    await walk(slot, reduce ? 700 : ella ? 3000 : 2400);
    if (runway.cancelled || session.scene !== 'runway') return;
    const person = slot.querySelector('.person');
    person?.classList.remove('pose-stride');
    person?.classList.add(ella ? 'pose-finale' : 'pose-cheer');
    slot.classList.add('posing');
    document.querySelector('.runway')?.classList.add('cheering');
    popFlash();
    audio.cheer();
    window.setTimeout(popFlash, 260);
    if (ella) window.setTimeout(popFlash, 520);
    await pause(reduce ? 500 : ella ? 1600 : 1100);
    document.querySelector('.runway')?.classList.remove('cheering');
  }
  if (runway.cancelled || session.scene !== 'runway') return;
  if (!show.paid) {
    const stars = show.looks.reduce((sum, look) => sum + (look.stars ?? 2), 0);
    earn(40 + stars * 4, 8, stars);
    save.showsDone += 1;
    save.lastTheme = show.theme.id;
    show.paid = true;
    show.awards = buildAwards(show.looks, show.theme);
    persist();
  }
  audio.sparkle();
  goto('awards');
}

function setCard(title: string, sub: string): void {
  const card = document.querySelector('.namecard');
  if (!card) return;
  const strong = card.querySelector('b');
  const span = card.querySelector('span');
  if (strong) strong.textContent = title;
  if (span) span.textContent = sub;
  card.classList.remove('pop');
  void (card as HTMLElement).offsetWidth;
  card.classList.add('pop');
}

function fitRunwaySlot(slot: HTMLElement, progress: number): void {
  const stage = slot.offsetParent as HTMLElement | null;
  const stageH = stage?.clientHeight || window.innerHeight;
  const header = document.querySelector('.runway-bar') as HTMLElement | null;
  const namecard = document.querySelector('.namecard') as HTMLElement | null;
  const clearance = (header?.offsetHeight ?? 64) + 16;
  const floorGap = (namecard?.offsetHeight ?? 72) + 16;
  const naturalH = Math.max(1, slot.offsetHeight);
  const u = Math.min(1, Math.max(0, progress));
  const sway = Math.sin(u * Math.PI * 7) * 8;
  let bottom = stageH * (0.42 - u * 0.22);
  let scale = 0.55 + u * 0.5;
  if (bottom < floorGap) bottom = floorGap;
  const room = (stageH - bottom - clearance) / naturalH;
  if (scale > room) scale = Math.max(0.28, room);
  const top = stageH - bottom - naturalH * scale;
  if (top < clearance) bottom = Math.max(floorGap, stageH - clearance - naturalH * scale);
  slot.style.bottom = `${bottom}px`;
  slot.style.transform = `translateX(calc(-50% + ${sway}px)) scale(${scale})`;
}

function walk(slot: HTMLElement, duration: number): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    runway.skip = finish;
    const frame = (now: number) => {
      if (runway.cancelled) return finish();
      const u = Math.min(1, (now - start) / duration);
      runway.progress = u;
      fitRunwaySlot(slot, u);
      if (u < 1) runway.raf = requestAnimationFrame(frame);
      else finish();
    };
    runway.raf = requestAnimationFrame(frame);
  });
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    runway.skip = () => {
      window.clearTimeout(timer);
      resolve();
    };
  });
}

function popFlash(): void {
  const el = document.querySelector('.flash');
  const burst = document.querySelector('.runway-flash');
  if (el) {
    el.classList.remove('on');
    void (el as HTMLElement).offsetWidth;
    el.classList.add('on');
  }
  if (burst) {
    burst.classList.remove('on');
    void (burst as HTMLElement).offsetWidth;
    burst.classList.add('on');
  }
  audio.flash();
}

function buildAwards(looks: Outfit[], theme: Theme): Award[] {
  const metrics = looks.map((look, index) => ({
    index,
    sparkle:
      (look.pattern === 'sequins' || look.pattern === 'rainbow' ? 3 : 0) +
      (look.pattern === 'tulle' || look.pattern === 'polka' ? 1 : 0) +
      (look.accessories.includes('sequins') ? 2 : 0) +
      (look.accessories.includes('bow') ? 0.5 : 0),
    bold: saturation(look.color) * 3 + (look.pattern === 'stripes' ? 0.8 : 0),
    theme:
      (theme.sketches.includes(look.sketchId) ? 2 : 0) +
      (theme.patterns.includes(look.pattern) ? 2 : 0) +
      (theme.colors.some((color) => color.toLowerCase() === look.color.toLowerCase()) ? 1.4 : 0),
    twirl: ['twirl-set', 'garden-gown', 'sunny-dress', 'pleat-parade'].includes(look.sketchId) ? 2 : 0,
    cozy: ['rain-coat', 'crop-jacket', 'palazzo'].includes(look.sketchId) || look.pattern === 'velvet' ? 2 : 0,
    cape: look.sketchId === 'hero-cape' ? 3 : 0,
    jacket: look.sketchId === 'crop-jacket' || look.sketchId === 'rain-coat' ? 2 : 0,
    detail: look.accessories.length,
  }));
  const catalog = [
    { key: 'sparkle', title: 'Most Sparkly', reason: 'It catches every light.' },
    { key: 'bold', title: 'Boldest Color', reason: 'What a brave, beautiful color.' },
    { key: 'theme', title: 'Perfect for the Theme', reason: 'It belongs on this runway.' },
    { key: 'twirl', title: 'Twirliest', reason: 'That skirt could spin all night.' },
    { key: 'cozy', title: 'Coziest', reason: 'It looks like a warm hug.' },
    { key: 'cape', title: 'Coolest Cape', reason: 'A story just walked by.' },
    { key: 'jacket', title: 'Sharpest Jacket', reason: 'Those lapels mean business.' },
    { key: 'detail', title: 'Sweetest Extra', reason: 'The finishing touch is perfect.' },
  ] as const;
  type Key = (typeof catalog)[number]['key'];
  const pairs: { score: number; key: Key; title: string; reason: string; index: number }[] = [];
  for (const award of catalog) {
    for (const metric of metrics) {
      const score = metric[award.key];
      if (score > 0) pairs.push({ score, key: award.key, title: award.title, reason: award.reason, index: metric.index });
    }
  }
  pairs.sort((a, b) => b.score - a.score);
  const usedLooks = new Set<number>();
  const usedAwards = new Set<string>();
  const awards: Award[] = [];
  for (const pair of pairs) {
    if (awards.length >= 3) break;
    if (usedLooks.has(pair.index) || usedAwards.has(pair.key)) continue;
    usedLooks.add(pair.index);
    usedAwards.add(pair.key);
    awards.push({ title: pair.title, reason: pair.reason, lookIndex: pair.index });
  }
  for (const metric of metrics) {
    if (awards.length >= 3) break;
    if (usedLooks.has(metric.index)) continue;
    usedLooks.add(metric.index);
    awards.push({
      title: 'Show Stopper',
      reason: 'The crowd cheered loudest for this one.',
      lookIndex: metric.index,
    });
  }
  return awards;
}

function awardsScene(): string {
  const show = session.show;
  if (!show) {
    return `${hud()}<section class="panel"><button class="btn" type="button" data-act="to-shop">Back to the shop</button></section>`;
  }
  const awards = show.awards.length ? show.awards : buildAwards(show.looks, show.theme);
  show.awards = awards;
  const cards = awards
    .map((award) => {
      const look = show.looks[award.lookIndex];
      if (!look) return '';
      return `<article class="award">
        <div class="award-form">${renderDressForm(look, nextId('aw'))}</div>
        <h2>${esc(award.title)}</h2>
        <p>${esc(award.reason)}</p>
      </article>`;
    })
    .join('');
  const rivals = show.rivals
    .map((rival) => `<p><strong>${esc(rival.name)}</strong> — ${esc(sketchById(rival.outfit.sketchId).name)}. Gorgeous.</p>`)
    .join('');
  return `${hud()}
    <div class="awards">
      ${confetti()}
      <div class="awards-copy">
        <p class="eyebrow">${esc(show.theme.name)}</p>
        <h1>Everyone takes a bow</h1>
        <div class="rival-notes">${rivals}</div>
        <p class="applause">Every design got applause. Tonight’s special awards go to Ella.</p>
        <div class="award-row">${cards}</div>
        <div class="awards-actions">
          <button class="btn" type="button" data-act="save-show">Keep all three looks</button>
          <button class="btn secondary" type="button" data-act="to-shop">Back to the shop</button>
        </div>
      </div>
    </div>`;
}

function saveShowLooks(): void {
  if (!session.show) return;
  let added = 0;
  for (const look of session.show.looks) {
    if (save.lookbook.some((saved) => saved.id === look.id)) continue;
    save.lookbook.unshift(look);
    added += 1;
  }
  save.lookbook = save.lookbook.slice(0, 24);
  persist();
  toast(added ? 'All three looks are in the book.' : 'Those looks are already saved.');
  audio.chime();
}

function galleryScene(): string {
  const patterns: FabricId[] = ['floral', 'stripes', 'polka', 'sequins', 'denim', 'velvet', 'tulle', 'rainbow', 'solid', 'stripes'];
  const cards = SKETCHES.map((sketch, index) => {
    const outfit: Outfit = {
      id: `gal-${sketch.id}`,
      sketchId: sketch.id,
      pattern: patterns[index % patterns.length],
      color: PALETTE[(index * 3) % PALETTE.length].hex,
      accessories: (['bow', 'buttons', 'belt', 'shoes'] as AccessoryId[]).slice(0, (index % 4) + 1),
    };
    return `<figure class="look-card static"><div>${renderDressForm(outfit, `gal${index}`)}</div><figcaption>${esc(sketch.name)}</figcaption></figure>`;
  }).join('');
  const people = [...CUSTOMERS, JULES]
    .map(
      (person, index) =>
        `<div class="gal-person">${renderPerson({ look: person, pose: 'stand', uid: `gp${index}` })}<span>${esc(person.name)}</span></div>`,
    )
    .join('');
  const gowns = RUNWAY_GOWNS.map(
    (id) =>
      `<figure class="look-card static gown-card"><div><img class="sprite sprite-card" alt="" src="${modelSignature(id)}"></div><figcaption>${esc(sketchById(id).name)}</figcaption></figure>`,
  ).join('');
  return `${hud()}
    <div class="book-page">
      <div class="sketch-top">
        <button class="icon-btn" type="button" data-act="home" aria-label="Home">${icon('back')}</button>
        <h1>Pattern library</h1>
      </div>
      <h2>Runway gowns</h2>
      <div class="look-grid gown-row">${gowns}</div>
      <div class="look-grid">${cards}</div>
      <div class="gal-people">${people}</div>
    </div>`;
}

function coverScene(): string {
  const gown: Outfit = {
    id: 'cover-gown',
    sketchId: 'garden-gown',
    pattern: 'floral',
    color: '#E56B93',
    accessories: ['bow', 'shoes'],
  };
  return `<div class="cover-frame">
    <div class="cover-copy">
      <p>a boutique game</p>
      <h1>Fashion<br/>Frenzy</h1>
      <p class="byline">by Ella</p>
    </div>
    <div class="cover-form">${renderDressForm(gown, 'coverform')}</div>
    <div class="cover-model"><img class="sprite sprite-model" alt="" src="${modelSignature('twirl-set')}"></div>
  </div>`;
}

function goBack(): void {
  if (session.scene === 'studio') {
    if (session.phase !== 'fabric') {
      session.phase = 'fabric';
      draw();
      return;
    }
    goto('sketch');
    return;
  }
  if (session.scene === 'sketch') {
    if (session.mode === 'show') {
      leaveShow();
      return;
    }
    returnToShop();
    return;
  }
  if (session.scene === 'lookbook' && session.viewing) {
    session.viewing = null;
    draw();
    return;
  }
  if (session.scene === 'reviews') {
    returnToShop();
    return;
  }
  if (session.scene === 'gallery') {
    goto('title');
    return;
  }
  returnToShop();
}

function toast(text: string): void {
  const el = document.getElementById('toast');
  const live = document.getElementById('live');
  if (live) live.textContent = text;
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 2600);
}
