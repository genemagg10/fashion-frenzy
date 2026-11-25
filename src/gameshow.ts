/** Style Showdown: the Dress-to-Impress style game-show mode. Three stages, a new theme each time. */
import { audio } from './audio';
import { esc } from './color';
import {
  GS_ACCESSORIES,
  GS_HAIR,
  GS_OUTFITS,
  GS_RIVALS,
  GS_SKINS,
  GS_THEMES,
  gsAcc,
  gsHair,
  gsOutfit,
  gsTheme,
  type GsAccessory,
  type GsKind,
  type GsLook,
  type GsSlot,
  type GsTheme,
  type GsThemeId,
} from './gsdata';
import { accFileOf, avatarURL, hairTileURL, lookFiles } from './gsavatar';
import { GS_META } from './gsmeta';
import { customerBust, pipSprite, spriteUrl } from './spritekit';

export interface GsHost {
  draw(): void;
  toast(message: string): void;
  /** Save a finished look to the Lookbook; returns false when it was already saved. */
  saveLook(look: GsLook, theme: GsThemeId, place: number): boolean;
  hud(): string;
}

type Phase = 'lobby' | 'intro' | 'dress' | 'walk' | 'judge' | 'results' | 'through' | 'out' | 'podium';
type Tab = 'outfit' | 'hair' | 'acc';

interface Score {
  theme: number;
  color: number;
  finish: number;
  total: number;
  paddles: [number, number, number];
  ovation: boolean;
}

interface Contestant {
  name: string;
  you: boolean;
  kind: GsKind;
  skill: number;
  skin: string;
  look: GsLook;
  score: Score | null;
}

interface Offer {
  outfits: string[];
  hair: string[];
  acc: string[];
}

const BASE = import.meta.env.BASE_URL || './';
const STAGES = 3;
const FIELD = [6, 4, 3];
const DRESS_SECONDS = 90;
const SLOTS: GsSlot[] = ['head', 'face', 'neck', 'back', 'hand'];
const SLOT_NAME: Record<GsSlot, string> = { head: 'Head', face: 'Face', neck: 'Neck', back: 'Back', hand: 'Hand' };
const JUDGES = [
  { id: 'pip', name: 'Pip', role: 'Theme' },
  { id: 'noor', name: 'Noor', role: 'Colors' },
  { id: 'theo', name: 'Theo', role: 'Finishing' },
] as const;
const CROWD = ['girl-clap', 'boy-cheer', 'grandma', 'kid-lightstick', 'girl-hearteyes', 'dad-clap', 'teen-phone', 'boy-wave'];
const PLACE = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

const DEFAULT: Record<GsKind, { outfit: string; hair: string }> = {
  girl: { outfit: 'swirl-dress', hair: 'long-sleek' },
  boy: { outfit: 'surf-shirt', hair: 'fluffy-curls' },
};

const st: {
  phase: Phase;
  kind: GsKind;
  skin: string;
  stage: number;
  themes: GsThemeId[];
  field: Contestant[];
  out: Contestant[];
  look: GsLook;
  offer: Offer;
  tab: Tab;
  timeLeft: number;
  saved: boolean;
  hostTaps: number;
  disco: boolean;
  walkDone: boolean;
} = {
  phase: 'lobby',
  kind: 'girl',
  skin: GS_SKINS[1].hex,
  stage: 0,
  themes: [],
  field: [],
  out: [],
  look: { kind: 'girl', skin: GS_SKINS[1].hex, outfit: DEFAULT.girl.outfit, hair: DEFAULT.girl.hair, acc: [] },
  offer: { outfits: [], hair: [], acc: [] },
  tab: 'outfit',
  timeLeft: DRESS_SECONDS,
  saved: false,
  hostTaps: 0,
  disco: false,
  walkDone: false,
};

let host: GsHost | null = null;

export function initGameShow(h: GsHost): void {
  host = h;
}

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
function shuffle<T>(list: readonly T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const theme = (): GsTheme => gsTheme(st.themes[st.stage] ?? 'fairy');
const you = (): Contestant | undefined => st.field.find((c) => c.you) ?? st.out.find((c) => c.you);

/* ------------------------------------------------------------------ scoring */

function rgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function closeness(hex: string, palette: string[]): number {
  const [r, g, b] = rgb(hex);
  let best = 999;
  for (const p of palette) {
    const [pr, pg, pb] = rgb(p);
    best = Math.min(best, Math.hypot(r - pr, g - pg, b - pb));
  }
  return Math.max(0, 1 - best / 150);
}

const FINISH = [0.2, 0.5, 0.75, 0.9, 1, 1];

export function scoreLook(look: GsLook, themeId: GsThemeId, flair = 0): Score {
  const t = gsTheme(themeId);
  const outfit = gsOutfit(look.outfit);
  const hair = gsHair(look.hair);
  const items = look.acc.map(gsAcc).filter((x): x is GsAccessory => Boolean(x));
  const outfitFit = outfit.theme === themeId ? 1 : 0.15;
  const hairFit = hair.themes.includes(themeId) ? 1 : hair.themes.length === 0 ? 0.55 : 0.3;
  const onAcc = items.filter((a) => a.themes.includes(themeId)).length;
  const accFit = items.length ? (onAcc + (items.length - onAcc) * 0.2) / items.length : 0;
  const themeScore = 0.5 * outfitFit + 0.2 * hairFit + 0.3 * accFit;
  const weighted: [string, number][] = [
    [outfit.colors[0], 2],
    [outfit.colors[1] ?? outfit.colors[0], 1],
    [hair.color, 0.5],
    ...items.map((a): [string, number] => [a.color, 0.7]),
  ];
  const wsum = weighted.reduce((s, [, w]) => s + w, 0);
  const color = weighted.reduce((s, [hex, w]) => s + closeness(hex, t.palette) * w, 0) / wsum;
  const finish = FINISH[Math.min(5, items.length)];
  const ovation = outfitFit === 1 && hairFit === 1 && onAcc >= 3 && onAcc === items.length;
  const total = Math.max(0, Math.min(100, 100 * (0.5 * themeScore + 0.25 * color + 0.25 * finish) + (ovation ? 2 : 0) + flair));
  const paddle = (x: number) => Math.max(1, Math.min(10, Math.round(1 + 9 * x)));
  return { theme: themeScore, color, finish, total, paddles: [paddle(themeScore), paddle(color), paddle(finish)], ovation };
}

/* ------------------------------------------------------------------ wardrobe */

function onTheme(themeId: GsThemeId) {
  return {
    outfit: (id: string) => gsOutfit(id).theme === themeId,
    hair: (id: string) => gsHair(id).themes.includes(themeId),
    acc: (id: string) => Boolean(gsAcc(id)?.themes.includes(themeId)),
  };
}

function buildOffer(kind: GsKind, themeId: GsThemeId): Offer {
  const mine = GS_OUTFITS.filter((o) => o.kind === kind);
  const outfits = [
    ...shuffle(mine.filter((o) => o.theme === themeId)),
    ...shuffle(mine.filter((o) => o.theme !== themeId)).slice(0, 2),
  ];
  const hairs = GS_HAIR.filter((h) => h.kind === kind);
  const hairOn = hairs.filter((h) => h.themes.includes(themeId));
  const neutral = hairs.filter((h) => h.themes.length === 0);
  const hairOff = shuffle(hairs.filter((h) => h.themes.length && !h.themes.includes(themeId))).slice(0, kind === 'boy' ? 3 : 2);
  const accOn = GS_ACCESSORIES.filter((a) => a.themes.includes(themeId));
  const accOff = shuffle(GS_ACCESSORIES.filter((a) => !a.themes.includes(themeId))).slice(0, 4);
  return {
    outfits: shuffle(outfits).map((o) => o.id),
    hair: shuffle([...hairOn, ...neutral, ...hairOff]).map((h) => h.id),
    acc: shuffle([...accOn, ...accOff])
      .sort((a, b) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot))
      .map((a) => a.id),
  };
}

/** A rival dresses from the whole wardrobe; effort decides how carefully. */
export function rivalLook(kind: GsKind, skin: string, themeId: GsThemeId, effort: number): GsLook {
  const mine = GS_OUTFITS.filter((o) => o.kind === kind);
  const fits = Math.random() < 0.45 + 0.5 * effort;
  const outfit = pick(mine.filter((o) => (o.theme === themeId) === fits)).id;
  const hairs = GS_HAIR.filter((h) => h.kind === kind);
  const hairOn = hairs.filter((h) => h.themes.includes(themeId));
  const hair = (hairOn.length && Math.random() < 0.35 + 0.55 * effort ? pick(hairOn) : pick(hairs)).id;
  const count = Math.max(0, Math.min(5, Math.round(0.4 + effort * 3.6 + (Math.random() - 0.5) * 1.6)));
  const acc: string[] = [];
  for (const slot of shuffle(SLOTS)) {
    if (acc.length >= count) break;
    const inSlot = GS_ACCESSORIES.filter((a) => a.slot === slot);
    const on = inSlot.filter((a) => a.themes.includes(themeId));
    const careful = Math.random() < 0.4 + 0.55 * effort;
    if (careful && !on.length) continue;
    acc.push((careful ? pick(on) : pick(inSlot)).id);
  }
  return { kind, skin, outfit, hair, acc };
}

function flair(): number {
  return (Math.random() - 0.5) * 6;
}

/* ------------------------------------------------------------------ flow */

export function gsEnter(): void {
  st.phase = 'lobby';
  st.look = { kind: st.kind, skin: st.skin, ...DEFAULT[st.kind], acc: [] };
}

function newRun(): void {
  st.themes = shuffle(GS_THEMES.map((t) => t.id)).slice(0, STAGES);
  st.stage = 0;
  st.out = [];
  st.saved = false;
  const rivals = shuffle(GS_RIVALS).slice(0, FIELD[0] - 1);
  st.field = [
    { name: 'You', you: true, kind: st.kind, skill: 1, skin: st.skin, look: st.look, score: null },
    ...rivals.map((r) => ({
      name: r.name,
      you: false,
      kind: r.kind,
      skill: 0.15 + Math.random() * 0.6,
      skin: pick(GS_SKINS).hex,
      look: st.look,
      score: null,
    })),
  ];
  startStage();
}

function startStage(): void {
  const t = theme();
  st.offer = buildOffer(st.kind, t.id);
  st.look = { kind: st.kind, skin: st.skin, outfit: st.offer.outfits[0], hair: DEFAULT[st.kind].hair, acc: [] };
  if (!st.offer.hair.includes(st.look.hair)) st.look.hair = st.offer.hair[0];
  for (const c of st.field) {
    c.score = null;
    if (c.you) continue;
    const effort = Math.min(0.98, c.skill + st.stage * 0.14 + (st.stage === STAGES - 1 ? 0.12 : 0) + Math.random() * 0.12);
    c.look = rivalLook(c.kind, c.skin, t.id, effort);
  }
  st.tab = 'outfit';
  st.timeLeft = DRESS_SECONDS;
  st.hostTaps = 0;
  st.walkDone = false;
  st.phase = 'intro';
}

function judgeAll(): void {
  const t = theme();
  for (const c of st.field) {
    if (c.you) c.look = { ...st.look, acc: [...st.look.acc] };
    c.score = scoreLook(c.look, t.id, flair());
  }
  st.field.sort((a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0));
}

function ranked(): Contestant[] {
  return [...st.field].sort((a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0));
}

function keepCount(): number {
  return FIELD[st.stage + 1] ?? FIELD[FIELD.length - 1];
}

function yourPlace(): number {
  return ranked().findIndex((c) => c.you);
}

function settle(): void {
  if (st.stage >= STAGES - 1) {
    st.phase = 'podium';
    const place = yourPlace();
    if (place === 0) saveMine(place);
    return;
  }
  const keep = keepCount();
  const order = ranked();
  const safe = order.slice(0, keep);
  st.out.push(...order.slice(keep));
  st.field = safe;
  st.phase = safe.some((c) => c.you) ? 'through' : 'out';
}

function saveMine(place: number): void {
  if (st.saved || !host) return;
  const me = you();
  if (!me) return;
  st.saved = host.saveLook(me.look, theme().id, place);
}

/* ------------------------------------------------------------------ files */

export function gsFiles(): string[] {
  const files = new Set<string>();
  const add = (list: string[]) => list.forEach((f) => files.add(f));
  add(['sprites/customers/full/jules.png']);
  if (st.phase === 'lobby') {
    for (const kind of ['girl', 'boy'] as const) add(lookFiles({ ...DEFAULT[kind], acc: [] }));
    return [...files];
  }
  add(lookFiles(st.look));
  for (const id of st.offer.outfits) add(lookFiles({ outfit: id, hair: st.look.hair, acc: [] }));
  for (const id of st.offer.hair) add(lookFiles({ outfit: st.look.outfit, hair: id, acc: [] }));
  for (const id of st.offer.acc) files.add(accFileOf(id));
  for (const c of [...st.field, ...st.out]) add(lookFiles(c.look));
  add(['pip-happy', 'pip-love', 'pip-thinking', 'pip-cheer', 'pip-surprised'].map((p) => `sprites/pip/${p}.png`));
  for (const who of ['noor', 'theo', 'jules']) {
    for (const e of ['happy', 'love', 'thinking']) files.add(`sprites/customers/bust/${who}-${e}.png`);
  }
  for (const c of CROWD) files.add(`sprites/runway/crowd-${c}.png`);
  add(['sprites/runway/trophy.png', 'sprites/runway/fx-flash.png', 'sprites/gs/stage/podium.png']);
  return [...files];
}

/* ------------------------------------------------------------------ render */

function av(look: GsLook, cls = '', alt = ''): string {
  return `<img class="sprite gs-av ${cls}" width="320" height="440" alt="${esc(alt)}" src="${avatarURL(look)}" draggable="false">`;
}

function steps(): string {
  const field = FIELD.map((_n, i) => {
    const state = i < st.stage ? 'done' : i === st.stage ? 'now' : '';
    return `<li class="${state}"><b>${i + 1}</b></li>`;
  }).join('<i aria-hidden="true"></i>');
  return `<ol class="gs-steps" aria-label="Stage ${st.stage + 1} of ${STAGES}">${field}</ol>`;
}

function particles(t: GsTheme): string {
  const glyph: Record<GsTheme['particle'], string[]> = {
    petal: ['❀', '✿', '•'],
    bubble: ['○', '◦', '○'],
    star: ['✦', '✧', '⋆'],
    crown: ['♛', '✦', '✧'],
    note: ['♪', '♫', '⚡'],
    candy: ['●', '✦', '♥'],
  };
  const set = glyph[t.particle];
  return Array.from({ length: 14 }, (_, i) => {
    const x = (i * 37 + 11) % 100;
    const d = 7 + ((i * 13) % 7);
    const delay = -((i * 1.7) % d);
    const s = 0.7 + ((i * 7) % 5) * 0.18;
    const c = t.palette[i % t.palette.length];
    return `<i style="--x:${x}%;--d:${d}s;--delay:${delay}s;--s:${s};color:${c}">${set[i % set.length]}</i>`;
  }).join('');
}

function confetti(n = 36): string {
  const colors = ['#E56B93', '#F6D56B', '#8EC6E6', '#CDB4E4', '#A8C3A0', '#F4B8C8'];
  return `<div class="gs-confetti" aria-hidden="true">${Array.from({ length: n }, (_, i) => {
    const x = (i * 29 + 7) % 100;
    const d = 2.6 + ((i * 7) % 10) / 6;
    const delay = ((i * 3) % 12) / 10;
    const r = (i * 47) % 360;
    return `<i style="--x:${x}%;--d:${d}s;--delay:${delay}s;--r:${r}deg;background:${colors[i % colors.length]}"></i>`;
  }).join('')}</div>`;
}

function wantChips(t: GsTheme): string {
  return `<ul class="gs-wants">${t.wants.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>`;
}

export function gsSceneHtml(): string {
  const t = st.phase === 'lobby' ? null : theme();
  const vars = t
    ? `--gs-a:${t.light[0]};--gs-b:${t.light[1]};--gs-c:${t.light[2]}`
    : '--gs-a:#f6b8d8;--gs-b:#c9b6ff;--gs-c:#fff6fb';
  const body = phaseHtml();
  return `${host?.hud() ?? ''}
  <section class="gs gs-p-${st.phase}${st.disco ? ' disco' : ''}" style="${vars}" data-theme="${t?.id ?? 'lobby'}">
    <div class="gs-bg" style="background-image:url('${BASE}sprites/gs/stage/stage-wide.jpg')" aria-hidden="true"></div>
    <div class="gs-tint" aria-hidden="true"></div>
    <div class="gs-beams" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    ${t ? `<div class="gs-particles" aria-hidden="true">${particles(t)}</div>` : ''}
    <button class="gs-bulbs" type="button" data-act="gs-disco" aria-label="Stage lights"></button>
    ${body}
  </section>`;
}

function phaseHtml(): string {
  switch (st.phase) {
    case 'lobby':
      return lobbyHtml();
    case 'intro':
      return introHtml();
    case 'dress':
      return dressHtml();
    case 'walk':
      return walkHtml();
    case 'judge':
      return judgeHtml();
    case 'results':
      return resultsHtml();
    case 'through':
      return throughHtml();
    case 'out':
      return outHtml();
    case 'podium':
      return podiumHtml();
  }
}

function lobbyHtml(): string {
  const look: GsLook = { kind: st.kind, skin: st.skin, ...DEFAULT[st.kind], acc: [] };
  return `<div class="gs-lobby">
    <div class="gs-spot">${av(look, 'gs-lobby-av', 'Your contestant')}</div>
    <div class="gs-card">
      <p class="kicker">Game show</p>
      <h1 class="gs-title">Style Showdown</h1>
      <p class="gs-sub">Three stages. A new theme each time.</p>
      <div class="gs-seg" role="group" aria-label="Contestant">
        <button type="button" class="${st.kind === 'girl' ? 'on' : ''}" data-act="gs-kind" data-id="girl" aria-pressed="${st.kind === 'girl'}">Girl</button>
        <button type="button" class="${st.kind === 'boy' ? 'on' : ''}" data-act="gs-kind" data-id="boy" aria-pressed="${st.kind === 'boy'}">Boy</button>
      </div>
      <div class="gs-skins" role="group" aria-label="Skin tone">
        ${GS_SKINS.map((s) => `<button type="button" class="gs-skin ${s.hex === st.skin ? 'on' : ''}" style="--c:${s.hex}" data-act="gs-skin" data-id="${s.hex}" aria-label="${s.name}" aria-pressed="${s.hex === st.skin}"></button>`).join('')}
      </div>
      <button class="btn gs-go" type="button" data-act="gs-start">Start the show</button>
    </div>
  </div>`;
}

function introHtml(): string {
  const t = theme();
  const keep = keepCount();
  const finale = st.stage === STAGES - 1;
  return `<div class="gs-intro">
    <div class="gs-topbar">${steps()}</div>
    <button class="gs-host" type="button" data-act="gs-host" aria-label="Jules, your host"><img class="sprite" width="512" height="768" alt="" src="${spriteUrl('sprites/customers/full/jules.png')}"></button>
    <div class="gs-bubble">
      <p class="kicker">${finale ? 'The finale' : `Stage ${st.stage + 1} of ${STAGES}`}</p>
      <h1 class="gs-theme-name">${esc(t.name)}</h1>
      <p class="gs-call">${esc(t.call)}</p>
      ${wantChips(t)}
      <div class="gs-lineup" aria-label="Contestants">${st.field.map((c) => `<figure class="${c.you ? 'me' : ''}"><span class="gs-face">${av(c.you ? st.look : c.look)}</span><figcaption>${esc(c.name)}</figcaption></figure>`).join('')}</div>
      <p class="gs-rule">${finale ? 'Top three take the podium.' : `${st.field.length} contestants · ${keep} go through`}</p>
      <button class="btn gs-go" type="button" data-act="gs-dress">Let’s get dressed!</button>
    </div>
  </div>`;
}

function meter(): string {
  const s = scoreLook(st.look, theme().id);
  const bar = (label: string, v: number) => `<li><span>${label}</span><b style="--v:${Math.round(v * 100)}%"></b></li>`;
  return `<ul class="gs-meter" aria-label="Judge hints">${bar('Theme', s.theme)}${bar('Colors', s.color)}${bar('Extras', s.finish)}</ul>`;
}

function tileHtml(tab: Tab, id: string): string {
  const look = st.look;
  if (tab === 'outfit') {
    const o = gsOutfit(id);
    return `<button type="button" class="gs-tile ${look.outfit === id ? 'on' : ''}" data-act="gs-pick" data-kind="outfit" data-id="${id}" aria-pressed="${look.outfit === id}">
      <img class="sprite gs-tile-av" width="320" height="440" alt="" src="${avatarURL({ ...look, outfit: id, acc: [] })}"><span>${esc(o.name)}</span></button>`;
  }
  if (tab === 'hair') {
    const h = gsHair(id);
    return `<button type="button" class="gs-tile ${look.hair === id ? 'on' : ''}" data-act="gs-pick" data-kind="hair" data-id="${id}" aria-pressed="${look.hair === id}">
      <img class="sprite gs-tile-hair" width="200" height="200" alt="" src="${hairTileURL(id, look.skin)}"><span>${esc(h.name)}</span></button>`;
  }
  const a = gsAcc(id);
  if (!a) return '';
  const on = look.acc.includes(id);
  return `<button type="button" class="gs-tile acc ${on ? 'on' : ''}" data-act="gs-pick" data-kind="acc" data-id="${id}" aria-pressed="${on}">
    <em>${SLOT_NAME[a.slot]}</em><span class="gs-acc-box">${accImg(id)}</span><span>${esc(a.name)}</span></button>`;
}

function accImg(id: string): string {
  const m = (GS_META.acc as Record<string, { w: number; h: number }>)[id] ?? { w: 100, h: 100 };
  const k = Math.min(84 / m.w, 52 / m.h);
  const w = Math.round(m.w * k);
  const h = Math.round(m.h * k);
  return `<img class="sprite gs-tile-acc" width="${w}" height="${h}" style="width:${w}px;height:${h}px" alt="" src="${spriteUrl(accFileOf(id))}">`;
}

function gridHtml(): string {
  const ids = st.tab === 'outfit' ? st.offer.outfits : st.tab === 'hair' ? st.offer.hair : st.offer.acc;
  return ids.map((id) => tileHtml(st.tab, id)).join('');
}

function timerHtml(): string {
  const r = 17;
  const c = 2 * Math.PI * r;
  const off = c * (1 - st.timeLeft / DRESS_SECONDS);
  return `<div class="gs-timer ${st.timeLeft <= 10 ? 'low' : ''}" role="timer" aria-label="${st.timeLeft} seconds left">
    <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${r}" class="track"/><circle cx="20" cy="20" r="${r}" class="ring" style="stroke-dasharray:${c.toFixed(1)};stroke-dashoffset:${off.toFixed(1)}"/></svg>
    <b>${st.timeLeft}</b></div>`;
}

function dressHtml(): string {
  const t = theme();
  const tabs: [Tab, string][] = [
    ['outfit', 'Outfits'],
    ['hair', 'Hair'],
    ['acc', 'Extras'],
  ];
  return `<div class="gs-dress">
    <div class="gs-mirror">
      <div class="gs-mirror-top">${steps()}<span class="gs-chip">${esc(t.name)}</span>${timerHtml()}</div>
      <button class="gs-me" type="button" data-act="gs-twirl" aria-label="Twirl">${av(st.look, 'gs-main', 'Your look')}</button>
      ${meter()}
    </div>
    <section class="gs-closet" aria-label="Wardrobe">
      <div class="gs-tabs" role="tablist">
        ${tabs.map(([id, label]) => `<button type="button" role="tab" class="gs-tab ${st.tab === id ? 'on' : ''}" data-act="gs-tab" data-id="${id}" aria-selected="${st.tab === id}">${label}${id === 'acc' ? `<small>${st.look.acc.length}</small>` : ''}</button>`).join('')}
      </div>
      <div class="gs-grid" data-tab="${st.tab}">${gridHtml()}</div>
      <div class="gs-dock"><button class="btn gs-ready" type="button" data-act="gs-ready">Walk the runway</button></div>
    </section>
  </div>`;
}

function walkHtml(): string {
  return `<div class="gs-walk">
    <div class="gs-topbar">${steps()}<span class="gs-chip">${esc(theme().name)}</span></div>
    <div class="gs-runway"><div class="gs-walker-slot"></div><div class="gs-namecard"></div></div>
    <div class="gs-flashes" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="gs-crowd" aria-hidden="true">${CROWD.map((c) => `<img class="sprite" width="224" height="224" alt="" src="${spriteUrl(`sprites/runway/crowd-${c}.png`)}">`).join('')}</div>
    <button class="btn secondary gs-skip" type="button" data-act="gs-skip">Skip</button>
  </div>`;
}

function judgeLine(i: number, s: Score, t: GsTheme): string {
  const p = s.paddles[i];
  if (i === 0) {
    if (p >= 9) return `That is SO ${t.name}!`;
    if (p >= 7) return 'Lovely theme vibes!';
    return `More ${t.wants[0]} next time!`;
  }
  if (i === 1) {
    if (p >= 9) return 'Those colors sing together!';
    if (p >= 7) return 'Pretty palette!';
    return 'Theme colors would shine more!';
  }
  if (p >= 9) return 'Every detail — wow!';
  if (p >= 7) return 'Nice finishing touches!';
  return 'Try a crown, wings or a prop!';
}

function judgeFace(i: number, p: number): string {
  const mood = p >= 9 ? 'love' : p >= 6 ? 'happy' : 'thinking';
  if (i === 0) return pipSprite(p >= 9 ? 'love' : p >= 6 ? 'cheer' : 'thinking');
  return customerBust(JUDGES[i].id, mood);
}

function judgeHtml(): string {
  const me = you();
  const s = me?.score;
  if (!me || !s) return '';
  const t = theme();
  return `<div class="gs-judge">
    <div class="gs-topbar">${steps()}<span class="gs-chip">${esc(t.name)}</span></div>
    <div class="gs-judge-row">
      <div class="gs-judge-me">${av(me.look, '', 'Your look')}${s.ovation ? '<p class="gs-ovation">Standing ovation!</p>' : ''}</div>
      <ul class="gs-panel">
        ${JUDGES.map((j, i) => `<li style="--i:${i}">
          <img class="sprite gs-judge-face" width="320" height="320" alt="" src="${judgeFace(i, s.paddles[i])}">
          <div><p class="gs-judge-name">${j.name} <small>${j.role}</small></p><p class="gs-judge-say">${esc(judgeLine(i, s, t))}</p></div>
          <b class="gs-paddle">${s.paddles[i]}</b></li>`).join('')}
      </ul>
    </div>
    <div class="gs-dock center"><button class="btn gs-go" type="button" data-act="gs-results">See the results</button></div>
  </div>`;
}

function hearts(total: number): string {
  return `<span class="gs-score" aria-label="${Math.round(total)} points"><b>${Math.round(total)}</b></span>`;
}

function resultsHtml(): string {
  const order = ranked();
  const keep = st.stage >= STAGES - 1 ? order.length : keepCount();
  return `<div class="gs-results">
    <div class="gs-topbar">${steps()}<span class="gs-chip">${esc(theme().name)}</span></div>
    <h2 class="gs-head">The judges have decided…</h2>
    <ol class="gs-board">
      ${order
        .map(
          (c, i) => `<li class="${c.you ? 'me' : ''} ${i >= keep ? 'bow' : 'safe'}" style="--i:${order.length - i}">
        <span class="gs-rank">${PLACE[i]}</span><span class="gs-face">${av(c.look)}</span>
        <span class="gs-who">${esc(c.name)}<small>${i >= keep ? 'takes a bow' : st.stage >= STAGES - 1 ? '' : 'through!'}</small></span>${hearts(c.score?.total ?? 0)}</li>`,
        )
        .join('')}
    </ol>
    <div class="gs-dock center"><button class="btn gs-go" type="button" data-act="gs-settle">Continue</button></div>
  </div>`;
}

function throughHtml(): string {
  const me = you();
  const next = gsTheme(st.themes[st.stage + 1] ?? 'fairy');
  return `<div class="gs-through">
    ${confetti()}
    <div class="gs-card center">
      <p class="kicker">Stage ${st.stage + 1} complete</p>
      <h1 class="gs-big">You’re through!</h1>
      ${me ? av(me.look, 'gs-hero', 'Your look') : ''}
      <p class="gs-sub">${st.stage + 1 === STAGES - 1 ? 'Next up: the finale!' : 'Next stage, new theme…'} <span class="gs-teaser">${esc(next.name)}</span></p>
      <button class="btn gs-go" type="button" data-act="gs-next">${st.stage + 1 === STAGES - 1 ? 'On to the finale' : 'Next stage'}</button>
    </div>
  </div>`;
}

function tip(s: Score, t: GsTheme): string {
  const gaps: [number, string][] = [
    [s.theme, `The judges hoped for ${t.wants.slice(0, 3).join(', ')}. A matching outfit and hairstyle is a great start.`],
    [s.color, `Colors from the ${t.name} palette make a look glow.`],
    [s.finish, 'Add more extras: something for your head, face, neck, back and hand.'],
  ];
  gaps.sort((a, b) => a[0] - b[0]);
  return gaps[0][1];
}

function outHtml(): string {
  const me = you();
  const t = theme();
  const s = me?.score;
  const swatches = t.palette.map((c) => `<i style="background:${c}"></i>`).join('');
  return `<div class="gs-out">
    <div class="gs-card center">
      <p class="kicker">Stage ${st.stage + 1} · ${esc(t.name)}</p>
      <h1 class="gs-big soft">What a look!</h1>
      ${me ? av(me.look, 'gs-hero', 'Your look') : ''}
      <p class="gs-sub">You took a bow this time — the other contestants are cheering for you!</p>
      ${s ? `<p class="gs-tip"><b>Judge’s tip</b> ${esc(tip(s, t))}<span class="gs-swatches">${swatches}</span></p>` : ''}
      <button class="btn gs-go gs-new" type="button" data-act="gs-new">New Run</button>
      <div class="gs-row"><button class="btn secondary" type="button" data-act="gs-save">${st.saved ? 'Saved' : 'Save look'}</button><button class="btn secondary" type="button" data-act="home">Home</button></div>
    </div>
  </div>`;
}

function podiumHtml(): string {
  const order = ranked();
  const place = yourPlace();
  const lines = ['You won the crown!', 'Silver star!', 'Bronze sparkle!'];
  const sub = [
    'First place in the Style Showdown! Your look is in the Lookbook.',
    'Second place in the finale — what a run!',
    'Third place in the finale — you made the podium!',
  ];
  const spot = (i: number) => {
    const c = order[i];
    if (!c) return '';
    return `<figure class="gs-pod p${i + 1} ${c.you ? 'me' : ''}">${i === 0 ? '<span class="gs-crown" aria-hidden="true">♛</span>' : ''}${av(c.look)}<figcaption>${esc(c.name)}</figcaption></figure>`;
  };
  return `<div class="gs-podium">
    ${confetti(place === 0 ? 60 : 36)}
    <div class="gs-topbar">${steps()}<span class="gs-chip">Finale · ${esc(theme().name)}</span></div>
    <div class="gs-stage-pod">
      ${spot(1)}${spot(0)}${spot(2)}
      <img class="sprite gs-pod-base" width="640" height="262" alt="" src="${spriteUrl('sprites/gs/stage/podium.png')}">
    </div>
    <div class="gs-card center slim">
      ${place === 0 ? `<img class="sprite gs-trophy" width="256" height="256" alt="" src="${spriteUrl('sprites/runway/trophy.png')}">` : ''}
      <h1 class="gs-big">${lines[Math.max(0, place)] ?? 'What a show!'}</h1>
      <p class="gs-sub">${sub[Math.max(0, place)] ?? ''}</p>
      <div class="gs-row">
        <button class="btn gs-go gs-new" type="button" data-act="gs-new">New Run</button>
        ${place === 0 ? '<button class="btn secondary" type="button" data-act="lookbook">Lookbook</button>' : `<button class="btn secondary" type="button" data-act="gs-save">${st.saved ? 'Saved' : 'Save look'}</button>`}
      </div>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ live bits */

let walkTimers: number[] = [];

export function gsMount(): () => void {
  const stops: (() => void)[] = [];
  if (st.phase === 'dress') stops.push(mountDress());
  if (st.phase === 'walk') stops.push(mountWalk());
  if (st.phase === 'judge') stops.push(mountJudge());
  if (st.phase === 'results') {
    audio.stinger('drumroll');
    const t = window.setTimeout(() => audio.stinger('reveal'), 1000);
    stops.push(() => window.clearTimeout(t));
  }
  if (st.phase === 'through') {
    audio.stinger('through');
    audio.cheer();
  }
  if (st.phase === 'out') audio.stinger('bow');
  if (st.phase === 'podium') {
    audio.stinger(yourPlace() === 0 ? 'win' : 'through');
    audio.cheer();
  }
  return () => stops.forEach((s) => s());
}

function mountDress(): () => void {
  const grid = document.querySelector('.gs-grid') as HTMLElement | null;
  let sx = 0;
  let sy = 0;
  let tracking = false;
  const down = (e: PointerEvent) => {
    sx = e.clientX;
    sy = e.clientY;
    tracking = true;
  };
  const up = (e: PointerEvent) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      const order: Tab[] = ['outfit', 'hair', 'acc'];
      const next = order[(order.indexOf(st.tab) + (dx < 0 ? 1 : 2)) % 3];
      setTab(next, dx < 0 ? 'left' : 'right');
    }
  };
  grid?.addEventListener('pointerdown', down);
  grid?.addEventListener('pointerup', up);
  const timer = window.setInterval(() => {
    if (document.hidden) return;
    st.timeLeft = Math.max(0, st.timeLeft - 1);
    const box = document.querySelector('.gs-timer');
    if (box) box.outerHTML = timerHtml();
    if (st.timeLeft === 10) audio.chime();
    if (st.timeLeft === 0) {
      host?.toast('Time! Off to the runway.');
      goWalk();
    }
  }, 1000);
  return () => {
    window.clearInterval(timer);
    grid?.removeEventListener('pointerdown', down);
    grid?.removeEventListener('pointerup', up);
  };
}

function setTab(tab: Tab, from: 'left' | 'right' | '' = ''): void {
  st.tab = tab;
  document.querySelectorAll('.gs-tab').forEach((el) => {
    const on = el.getAttribute('data-id') === tab;
    el.classList.toggle('on', on);
    el.setAttribute('aria-selected', String(on));
  });
  const grid = document.querySelector('.gs-grid') as HTMLElement | null;
  if (!grid) return;
  grid.dataset.tab = tab;
  grid.innerHTML = gridHtml();
  grid.scrollTop = 0;
  grid.classList.remove('slide-left', 'slide-right');
  if (from) {
    void grid.offsetWidth;
    grid.classList.add(`slide-${from}`);
  }
  audio.page();
}

function refreshDress(): void {
  const main = document.querySelector('.gs-main') as HTMLImageElement | null;
  if (main) main.src = avatarURL(st.look);
  const m = document.querySelector('.gs-meter');
  if (m) m.outerHTML = meter();
  const grid = document.querySelector('.gs-grid');
  if (grid) {
    const scroll = grid.scrollTop;
    grid.innerHTML = gridHtml();
    grid.scrollTop = scroll;
  }
  const count = document.querySelector('.gs-tab[data-id="acc"] small');
  if (count) count.textContent = String(st.look.acc.length);
  const me = document.querySelector('.gs-me');
  me?.classList.remove('pop');
  void (me as HTMLElement | null)?.offsetWidth;
  me?.classList.add('pop');
}

function pickItem(kind: string, id: string): void {
  if (kind === 'outfit') st.look.outfit = id;
  else if (kind === 'hair') st.look.hair = id;
  else {
    const item = gsAcc(id);
    if (!item) return;
    if (st.look.acc.includes(id)) st.look.acc = st.look.acc.filter((x) => x !== id);
    else {
      st.look.acc = st.look.acc.filter((x) => gsAcc(x)?.slot !== item.slot);
      st.look.acc.push(id);
      if (item.anchor === 'pack' || item.slot === 'back') audio.sparkle();
    }
  }
  audio.chime();
  refreshDress();
}

function goWalk(): void {
  judgeAll();
  st.phase = 'walk';
  audio.setShow(theme().id, true);
  host?.draw();
}

function mountWalk(): () => void {
  const order = [...st.field.filter((c) => !c.you), ...st.field.filter((c) => c.you)];
  const slot = document.querySelector('.gs-walker-slot') as HTMLElement | null;
  const card = document.querySelector('.gs-namecard') as HTMLElement | null;
  const flashes = document.querySelector('.gs-flashes') as HTMLElement | null;
  let at = 0;
  walkTimers.forEach((t) => window.clearTimeout(t));
  walkTimers = [];
  const quick = order.length > 4 ? 1900 : 2300;
  order.forEach((c, i) => {
    const dur = c.you ? 4200 : quick;
    walkTimers.push(
      window.setTimeout(() => {
        if (!slot || !card) return;
        const fx = [c.look.acc.includes('jetpack') ? 'float' : '', c.look.acc.some((a) => gsAcc(a)?.slot === 'back') || gsOutfit(c.look.outfit).winged ? 'flutter' : ''].join(' ');
        slot.innerHTML = `<div class="gs-walker ${c.you ? 'me' : ''} ${fx}" style="--dur:${dur}ms">${av(c.look, '', c.name)}</div>`;
        card.innerHTML = `<b>${esc(c.you ? 'You!' : c.name)}</b><span>${i + 1} of ${order.length}</span>`;
        card.classList.remove('show');
        void card.offsetWidth;
        card.classList.add('show');
        audio.stinger('walk');
        if (c.you) {
          if (c.score?.ovation) document.querySelector('.gs-walk')?.classList.add('ovation');
          document.querySelector('.gs-crowd')?.classList.add('cheer');
          [900, 1500, 2100].forEach((ms) =>
            walkTimers.push(
              window.setTimeout(() => {
                flashes?.classList.remove('pop');
                void flashes?.offsetWidth;
                flashes?.classList.add('pop');
                audio.flash();
              }, ms),
            ),
          );
          walkTimers.push(window.setTimeout(() => audio.cheer(), 1600));
        }
      }, at),
    );
    at += dur;
  });
  walkTimers.push(window.setTimeout(() => toJudge(), at + 200));
  return () => {
    walkTimers.forEach((t) => window.clearTimeout(t));
    walkTimers = [];
  };
}

function toJudge(): void {
  if (st.phase !== 'walk') return;
  st.phase = 'judge';
  host?.draw();
}

function mountJudge(): () => void {
  const timers = [0, 1, 2].map((i) => window.setTimeout(() => audio.stinger('paddle'), 700 + i * 650));
  const me = you();
  if (me?.score?.ovation) timers.push(window.setTimeout(() => audio.cheer(), 2600));
  return () => timers.forEach((t) => window.clearTimeout(t));
}

/* ------------------------------------------------------------------ input */

export function gsAct(act: string, id: string, target: Element): boolean {
  switch (act) {
    case 'gs-kind':
      if (id === 'girl' || id === 'boy') {
        st.kind = id;
        gsEnter();
        host?.draw();
      }
      return true;
    case 'gs-skin':
      st.skin = id;
      gsEnter();
      host?.draw();
      return true;
    case 'gs-start':
      newRun();
      audio.setShow(theme().id, false);
      audio.chime();
      host?.draw();
      return true;
    case 'gs-host': {
      st.hostTaps += 1;
      const el = target as HTMLElement;
      el.classList.remove('spin');
      void el.offsetWidth;
      el.classList.add('spin');
      if (st.hostTaps === 3) {
        st.disco = !st.disco;
        document.querySelector('.gs')?.classList.toggle('disco', st.disco);
        host?.toast(st.disco ? 'Jules hit the disco switch!' : 'Lights back to normal.');
        audio.sparkle();
        st.hostTaps = 0;
      }
      return true;
    }
    case 'gs-disco':
      st.disco = !st.disco;
      document.querySelector('.gs')?.classList.toggle('disco', st.disco);
      audio.sparkle();
      return true;
    case 'gs-dress':
      st.phase = 'dress';
      host?.draw();
      return true;
    case 'gs-tab':
      if (id === 'outfit' || id === 'hair' || id === 'acc') setTab(id);
      return true;
    case 'gs-pick':
      pickItem(target.getAttribute('data-kind') ?? '', id);
      return true;
    case 'gs-twirl': {
      const el = target as HTMLElement;
      el.classList.remove('twirl');
      void el.offsetWidth;
      el.classList.add('twirl');
      audio.sparkle();
      return true;
    }
    case 'gs-ready':
      goWalk();
      return true;
    case 'gs-skip':
      toJudge();
      return true;
    case 'gs-results':
      st.phase = 'results';
      host?.draw();
      return true;
    case 'gs-settle':
      settle();
      audio.setShow(theme().id, st.phase === 'podium');
      host?.draw();
      return true;
    case 'gs-next':
      st.stage += 1;
      startStage();
      audio.setShow(theme().id, false);
      host?.draw();
      return true;
    case 'gs-new':
      st.phase = 'lobby';
      gsEnter();
      newRun();
      audio.setShow(theme().id, false);
      host?.draw();
      return true;
    case 'gs-save': {
      const place = yourPlace();
      if (!st.saved) saveMine(place < 0 ? 5 : place);
      host?.toast(st.saved ? 'Saved to your Lookbook!' : 'Already in your Lookbook.');
      const btn = target as HTMLButtonElement;
      btn.textContent = 'Saved';
      return true;
    }
    default:
      return false;
  }
}

/** Music for the current phase (called by the host when entering the scene). */
export function gsMusic(): void {
  if (st.phase === 'lobby') audio.setShow('lobby', false);
  else audio.setShow(theme().id, st.phase === 'walk' || st.phase === 'podium');
}

/** Test hook: jump the run along so every ending can be checked quickly. */
export function gsDebug() {
  return {
    state: st,
    scoreLook,
    rivalLook,
    best(): void {
      const t = theme().id;
      const on = onTheme(t);
      st.look.outfit = st.offer.outfits.find(on.outfit) ?? st.look.outfit;
      st.look.hair = st.offer.hair.find(on.hair) ?? st.look.hair;
      const acc: string[] = [];
      for (const slot of SLOTS) {
        const hit = st.offer.acc.find((id) => on.acc(id) && gsAcc(id)?.slot === slot);
        if (hit) acc.push(hit);
      }
      st.look.acc = acc;
      host?.draw();
    },
    rivals(effort: number): void {
      const t = theme().id;
      for (const c of st.field) if (!c.you) c.look = rivalLook(c.kind, c.skin, t, effort);
    },
    worst(): void {
      const t = theme().id;
      const on = onTheme(t);
      st.look.outfit = st.offer.outfits.find((x) => !on.outfit(x)) ?? st.look.outfit;
      st.look.hair = st.offer.hair.find((x) => !on.hair(x)) ?? st.look.hair;
      st.look.acc = [];
      host?.draw();
    },
  };
}
