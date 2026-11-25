import { GS_META } from './gsmeta';
import { gsAcc, gsOutfit, type GsAccessory, type GsLook } from './gsdata';
import { peekSprite } from './spritekit';

export const GS_W = 320;
export const GS_H = 440;

type Img = HTMLImageElement | HTMLCanvasElement;
type Box = { x: number; y: number; w: number; h: number };

const urls = new Map<string, string>();
const skins = new Map<string, HTMLCanvasElement>();

const bodyFile = (id: string) => `sprites/gs/bodies/${id}.png`;
const headFile = (id: string, part = '') => `sprites/gs/heads/${id}${part}.png`;
const accFile = (id: string) => `sprites/gs/acc/${id}.png`;

export function lookFiles(look: Pick<GsLook, 'outfit' | 'hair' | 'acc'>): string[] {
  return [
    bodyFile(look.outfit),
    bodyFile(`${look.outfit}.skin`),
    headFile(look.hair),
    headFile(look.hair, '.back'),
    headFile(look.hair, '.skin'),
    ...look.acc.map(accFile),
  ];
}

export function accFileOf(id: string): string {
  return accFile(id);
}

function hexRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Repaint the skin (through its mask) in the chosen tone, keeping every shadow. */
function skinned(file: string, maskFile: string, ref: readonly number[], tone: string): Img | null {
  const key = `${file}|${tone}`;
  const hit = skins.get(key);
  if (hit) return hit;
  const base = peekSprite(file);
  const mask = peekSprite(maskFile);
  if (!base) return null;
  const c = document.createElement('canvas');
  c.width = base.naturalWidth || base.width;
  c.height = base.naturalHeight || base.height;
  const g = c.getContext('2d', { willReadFrequently: true });
  if (!g) return base;
  g.drawImage(base, 0, 0);
  if (!mask) return c;
  const m = document.createElement('canvas');
  m.width = c.width;
  m.height = c.height;
  const mg = m.getContext('2d', { willReadFrequently: true });
  if (!mg) return c;
  mg.drawImage(mask, 0, 0, c.width, c.height);
  const px = g.getImageData(0, 0, c.width, c.height);
  const mk = mg.getImageData(0, 0, c.width, c.height).data;
  const [tr, tg, tb] = hexRgb(tone);
  const kr = tr / Math.max(1, ref[0]);
  const kg = tg / Math.max(1, ref[1]);
  const kb = tb / Math.max(1, ref[2]);
  const d = px.data;
  for (let i = 0; i < d.length; i += 4) {
    const a = mk[i + 3] / 255;
    if (a <= 0.02 || d[i + 3] === 0) continue;
    const r = Math.min(255, d[i] * kr);
    const gg = Math.min(255, d[i + 1] * kg);
    const b = Math.min(255, d[i + 2] * kb);
    d[i] = d[i] + (r - d[i]) * a;
    d[i + 1] = d[i + 1] + (gg - d[i + 1]) * a;
    d[i + 2] = d[i + 2] + (b - d[i + 2]) * a;
  }
  g.putImageData(px, 0, 0);
  skins.set(key, c);
  return c;
}

function size(img: Img): { w: number; h: number } {
  if (img instanceof HTMLImageElement) return { w: img.naturalWidth || img.width, h: img.naturalHeight || img.height };
  return { w: img.width, h: img.height };
}

function bodyMeta(id: string) {
  return (GS_META.bodies as Record<string, { chin: number; cx: number; hands: readonly (readonly number[] | null)[]; ref: readonly number[] }>)[id];
}

function headMeta(id: string) {
  return (GS_META.heads as Record<string, { chin: number; cx: number; ref: readonly number[] }>)[id];
}

/** Where an accessory sits on this body. */
export function accBox(item: GsAccessory, outfit: string, img: { w: number; h: number }): Box {
  const meta = bodyMeta(outfit);
  const C = meta?.chin ?? 96;
  const X = meta?.cx ?? 160;
  const w = item.w;
  const h = (w * img.h) / img.w;
  const dx = item.dx ?? 0;
  const dy = item.dy ?? 0;
  const right = meta?.hands?.[1] ?? null;
  const left = meta?.hands?.[0] ?? null;
  const hand = right ? { x: right[0], y: right[1] } : left ? { x: left[0], y: left[1] } : { x: X + 48, y: C + 170 };
  switch (item.anchor) {
    case 'crown':
      return { x: X - w / 2 + dx, y: C - 70 - h + dy, w, h };
    case 'band':
      return { x: X - w / 2 + dx, y: C - 34 - h + dy, w, h };
    case 'ears':
      return { x: X - w / 2 + dx, y: C - 22 - h + dy, w, h };
    case 'bow':
      return { x: X + 30 - w / 2 + dx, y: C - 82 - h / 2 + dy, w, h };
    case 'eyes':
      return { x: X - w / 2 + dx, y: C - 31 - h / 2 + dy, w, h };
    case 'neck':
      return { x: X - w / 2 + dx, y: C + 3 + dy, w, h };
    case 'tie':
      return { x: X - w / 2 + dx, y: C + 9 - h / 2 + dy, w, h };
    case 'back':
      return { x: X - w / 2 + dx, y: C + 80 - h / 2 + dy, w, h };
    case 'cape':
      return { x: X - w / 2 + dx, y: C - 4 + dy, w, h };
    case 'pack':
      return { x: X - w / 2 + dx, y: C - 6 + dy, w, h };
    case 'grip':
      return { x: hand.x - w / 2 + dx, y: hand.y - h * 0.8 + dy, w, h };
    case 'strap':
      return { x: hand.x - w / 2 + 6 + dx, y: hand.y - 8 + dy, w, h };
    case 'guitar':
      return { x: hand.x - w / 2 - 16 + dx, y: hand.y - h * 0.62 + dy, w, h };
    default:
      return { x: X - w / 2, y: C, w, h };
  }
}

const BACK = new Set(['back']);

function keyOf(look: GsLook, mode: string): string {
  return `${mode}|${look.outfit}|${look.hair}|${look.skin}|${[...look.acc].sort().join(',')}`;
}

/** Paint a full contestant: wings, back hair, outfit, face and hair, then the accessories. */
export function avatarURL(look: GsLook): string {
  const key = keyOf(look, 'full');
  const hit = urls.get(key);
  if (hit) return hit;
  const body = skinned(bodyFile(look.outfit), bodyFile(`${look.outfit}.skin`), bodyMeta(look.outfit)?.ref ?? [252, 188, 122], look.skin);
  const head = skinned(headFile(look.hair), headFile(look.hair, '.skin'), headMeta(look.hair)?.ref ?? [252, 188, 122], look.skin);
  const back = peekSprite(headFile(look.hair, '.back'));
  if (!body || !head) return '';
  const c = document.createElement('canvas');
  c.width = GS_W;
  c.height = GS_H;
  const g = c.getContext('2d');
  if (!g) return '';
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  const items = look.acc.map((id) => gsAcc(id)).filter((x): x is GsAccessory => Boolean(x));
  const drawAcc = (item: GsAccessory) => {
    const img = peekSprite(accFile(item.id));
    if (!img) return;
    const box = accBox(item, look.outfit, size(img));
    g.drawImage(img, box.x, box.y, box.w, box.h);
  };
  const outfit = gsOutfit(look.outfit);
  items.filter((item) => BACK.has(item.slot) && !(outfit.winged && item.anchor === 'back')).forEach(drawAcc);
  const bm = bodyMeta(look.outfit);
  const hm = headMeta(look.hair);
  const hx = (bm?.cx ?? 160) - (hm?.cx ?? 60);
  const hy = (bm?.chin ?? 96) - (hm?.chin ?? 120);
  if (back) g.drawImage(back, Math.round(hx), Math.round(hy));
  g.drawImage(body, 0, 0);
  g.drawImage(head, Math.round(hx), Math.round(hy));
  const order: Record<string, number> = { face: 1, head: 2, neck: 3, hand: 4 };
  items
    .filter((item) => !BACK.has(item.slot))
    .sort((a, b) => order[a.slot] - order[b.slot])
    .forEach(drawAcc);
  const url = c.toDataURL('image/png');
  urls.set(key, url);
  if (urls.size > 160) {
    const first = urls.keys().next().value;
    if (first) urls.delete(first);
  }
  return url;
}

/** Just the hairstyle on the contestant's face, for wardrobe tiles. */
export function hairTileURL(hair: string, skin: string): string {
  const key = `hair|${hair}|${skin}`;
  const hit = urls.get(key);
  if (hit) return hit;
  const head = skinned(headFile(hair), headFile(hair, '.skin'), headMeta(hair)?.ref ?? [252, 188, 122], skin);
  const back = peekSprite(headFile(hair, '.back'));
  if (!head) return '';
  const hs = size(head);
  const bs = back ? size(back) : { w: 0, h: 0 };
  const w = Math.max(hs.w, bs.w);
  const h = Math.max(hs.h, bs.h);
  const c = document.createElement('canvas');
  c.width = 200;
  c.height = 200;
  const g = c.getContext('2d');
  if (!g) return '';
  const s = Math.min(186 / w, 186 / h);
  const ox = (200 - w * s) / 2;
  const oy = (200 - h * s) / 2;
  g.imageSmoothingQuality = 'high';
  if (back) g.drawImage(back, ox, oy, bs.w * s, bs.h * s);
  g.drawImage(head, ox, oy, hs.w * s, hs.h * s);
  const url = c.toDataURL('image/png');
  urls.set(key, url);
  return url;
}
