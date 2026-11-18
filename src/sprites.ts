import { darken, lighten, mix } from './color';
import { Pix, cachedPng } from './px';
import type { AccessoryId, FabricId, Outfit, PersonLook, SketchId } from './types';

export type PoseName = 'idle' | 'stand' | 'stride' | 'twirl' | 'cheer' | 'think' | 'frown';
export type GownFx = 'sparkle' | 'swish' | 'petals' | 'stars' | 'none';

const W = 128;
const H = 192;

const IRISES = ['#6b4636', '#3d6a4c', '#3c5c84', '#7a5430', '#6a3e58'];

function edgeOf(hex: string): string {
  const mixed = darken(hex, 0.32);
  const raw = mixed.replace('#', '');
  const n = Number.parseInt(raw, 16);
  const r = Math.max(36, (n >> 16) & 255);
  const g = Math.max(28, (n >> 8) & 255);
  const b = Math.max(24, n & 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function clothAt(pattern: FabricId, color: string, x: number, y: number): string {
  const alt = lighten(color, 0.38);
  const deep = darken(color, 0.16);
  const ink = lighten(color, 0.55);
  if (pattern === 'stripes') return x % 4 < 2 ? color : alt;
  if (pattern === 'polka') return x % 5 === 2 && y % 5 === 2 ? '#fff8ee' : color;
  if (pattern === 'floral') {
    const fx = x % 6;
    const fy = y % 6;
    if (fx === 2 && fy === 2) return '#fff6ea';
    if ((fx === 1 || fx === 3) && fy === 2) return '#f2b3c4';
    if (fx === 2 && (fy === 1 || fy === 3)) return '#f2b3c4';
    if (fx === 4 && fy === 4) return '#7dae74';
    return color;
  }
  if (pattern === 'denim') return (x + y) % 3 === 0 ? deep : color;
  if (pattern === 'sequins') {
    if (x % 3 === 1 && y % 3 === 0) return '#fff6d4';
    if (x % 3 === 0 && y % 3 === 2) return lighten(color, 0.45);
    return x % 2 === 0 ? color : deep;
  }
  if (pattern === 'velvet') return y % 4 === 0 ? lighten(color, 0.22) : darken(color, 0.08);
  if (pattern === 'tulle') return y % 2 === 0 ? lighten(color, 0.3) : color;
  if (pattern === 'rainbow') {
    const hues = ['#e56b93', '#f2c14e', '#7dce82', '#7eb6e0', '#c9a6e0'];
    return hues[Math.abs(x + y) % hues.length];
  }
  if (pattern === 'solid') return (x + y) % 7 === 0 ? ink : color;
  return color;
}

function shade(color: string, x: number, mid: number): string {
  if (x > mid + 8) return darken(color, 0.2);
  if (x > mid + 3) return darken(color, 0.1);
  if (x < mid - 8) return lighten(color, 0.18);
  return color;
}

function tube(p: Pix, x0: number, y0: number, x1: number, y1: number, r: number, fill: string, edge: string): void {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    p.disc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r + 1.3, edge);
  }
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    p.disc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, fill);
  }
  p.disc(x1, y1 + 1, r + 2, edge);
  p.disc(x1, y1, r + 1, fill);
}

type Sil =
  | 'sundress'
  | 'coat'
  | 'twirl'
  | 'cape'
  | 'ball'
  | 'pencil'
  | 'pants'
  | 'jacket'
  | 'pleats'
  | 'jumpsuit'
  | 'princess'
  | 'mermaid'
  | 'chiffon'
  | 'roses'
  | 'starry'
  | 'butterfly'
  | 'tiered'
  | 'ice'
  | 'candy'
  | 'peacock'
  | 'kimono';

function silhouette(id: SketchId): Sil {
  switch (id) {
    case 'sunny-dress':
      return 'sundress';
    case 'rain-coat':
      return 'coat';
    case 'twirl-set':
      return 'twirl';
    case 'hero-cape':
      return 'cape';
    case 'garden-gown':
    case 'ball-gown':
      return 'ball';
    case 'puff-pencil':
      return 'pencil';
    case 'palazzo':
      return 'pants';
    case 'crop-jacket':
      return 'jacket';
    case 'pleat-parade':
      return 'pleats';
    case 'jumpsuit':
      return 'jumpsuit';
    case 'princess-gown':
      return 'princess';
    case 'mermaid-gown':
      return 'mermaid';
    case 'sunset-chiffon':
      return 'chiffon';
    case 'garden-roses':
      return 'roses';
    case 'starry-gown':
      return 'starry';
    case 'butterfly-cape':
      return 'butterfly';
    case 'tiered-ruffle':
      return 'tiered';
    case 'ice-crystal':
      return 'ice';
    case 'candy-party':
      return 'candy';
    case 'peacock-train':
      return 'peacock';
    case 'cherry-kimono':
      return 'kimono';
    default:
      return 'sundress';
  }
}

export function gownFx(id: SketchId | undefined): GownFx {
  switch (id) {
    case 'ball-gown':
    case 'mermaid-gown':
    case 'ice-crystal':
    case 'candy-party':
      return 'sparkle';
    case 'princess-gown':
    case 'sunset-chiffon':
    case 'butterfly-cape':
    case 'tiered-ruffle':
    case 'peacock-train':
      return 'swish';
    case 'garden-roses':
    case 'cherry-kimono':
      return 'petals';
    case 'starry-gown':
      return 'stars';
    default:
      return 'none';
  }
}

interface Box {
  cx: number;
  shoulder: number;
  waist: number;
  hem: number;
  scale: number;
}

function paintCloth(pattern: FabricId, color: string, x: number, y: number, mid: number): string {
  return shade(clothAt(pattern, color, x, y), x, mid);
}

function sleeves(p: Pix, box: Box, pattern: FabricId, color: string, len: number, puff = false): void {
  const edge = edgeOf(color);
  const s = box.scale;
  const y0 = box.shoulder;
  const y1 = box.shoulder + len * s;
  const reach = (puff ? 18 : 14) * s;
  const paint = (x: number, y: number) => paintCloth(pattern, color, x, y, box.cx);
  p.trap(y0, y1, box.cx - 16 * s, box.cx - 8 * s, box.cx - reach, box.cx - reach + 7 * s, paint, edge);
  p.trap(y0, y1, box.cx + 8 * s, box.cx + 16 * s, box.cx + reach - 7 * s, box.cx + reach, paint, edge);
  if (puff) {
    p.disc(box.cx - 18 * s, y0 + 4, 7 * s, color);
    p.disc(box.cx + 18 * s, y0 + 4, 7 * s, color);
    p.disc(box.cx - 20 * s, y0, 3 * s, lighten(color, 0.4));
    p.disc(box.cx + 16 * s, y0, 3 * s, lighten(color, 0.4));
  }
}

function skirt(
  p: Pix,
  box: Box,
  pattern: FabricId,
  color: string,
  hem: number,
  flare: number,
  waistHalf = 8,
): void {
  const edge = edgeOf(color);
  const s = box.scale;
  const flarePx = Math.min(flare * s, box.cx - 4, p.w - box.cx - 4);
  const waistPx = waistHalf * s;
  const paint = (x: number, y: number) => paintCloth(pattern, color, x, y, box.cx);
  p.trap(box.waist, hem, box.cx - waistPx, box.cx + waistPx, box.cx - flarePx, box.cx + flarePx, paint, edge);
  p.rect(box.cx - flarePx, hem - s, flarePx * 2, s + 1, edge);
  for (let x = box.cx - flarePx + s * 2; x < box.cx + flarePx; x += 4 * s) {
    for (let y = box.waist + s * 2; y < hem - s; y += s) p.set(x, y, darken(color, 0.14));
  }
  for (let x = box.cx - flarePx + s; x < box.cx + flarePx; x += 3 * s) p.set(x, hem - s * 2, lighten(color, 0.4));
}

function bodice(p: Pix, box: Box, pattern: FabricId, color: string, neck = 4): void {
  const edge = edgeOf(color);
  const s = box.scale;
  const paint = (x: number, y: number) => paintCloth(pattern, color, x, y, box.cx);
  p.trap(box.shoulder, box.waist, box.cx - 14 * s, box.cx + 14 * s, box.cx - 9 * s, box.cx + 9 * s, paint, edge);
  p.rect(box.cx - neck * s, box.shoulder, neck * s * 2, s, lighten(color, 0.28));
}

function buttons(p: Pix, box: Box, count: number): void {
  const s = box.scale;
  for (let i = 0; i < count; i++) {
    const y = box.shoulder + 6 * s + i * 6 * s;
    p.disc(box.cx, y, 1.6 * s, '#f6e2a8');
    p.set(box.cx, y, '#a67c3a');
  }
}

function lapels(p: Pix, box: Box, color: string): void {
  const lip = lighten(color, 0.28);
  const edge = edgeOf(color);
  const s = box.scale;
  p.trap(box.shoulder, box.shoulder + 14 * s, box.cx - 4 * s, box.cx, box.cx - 10 * s, box.cx - s, () => lip, edge);
  p.trap(box.shoulder, box.shoulder + 14 * s, box.cx, box.cx + 4 * s, box.cx + s, box.cx + 10 * s, () => lip, edge);
}

function rose(p: Pix, x: number, y: number): void {
  p.set(x, y, '#e56b93');
  p.set(x - 1, y, '#f2a0b8');
  p.set(x + 1, y, '#c23b5a');
  p.set(x, y - 1, '#f2a0b8');
  p.set(x, y + 1, '#7dae74');
}

function star(p: Pix, x: number, y: number, color = '#fff6d0'): void {
  p.set(x, y, color);
  p.set(x - 1, y, color);
  p.set(x + 1, y, color);
  p.set(x, y - 1, color);
  p.set(x, y + 1, color);
}

function drawGarment(p: Pix, id: SketchId, pattern: FabricId, color: string, box: Box, extras: AccessoryId[]): void {
  const kind = silhouette(id);
  const cloth = pattern === 'solid' ? pattern : pattern;
  const hem = box.hem;
  const s = box.scale;
  const room = Math.min(box.cx - 6, p.w - box.cx - 6);
  if (kind === 'butterfly' || kind === 'cape' || kind === 'peacock') {
    const cape = kind === 'peacock' ? '#1f6b4a' : kind === 'butterfly' ? lighten(color, 0.12) : darken(color, 0.08);
    const edge = edgeOf(cape);
    const wing = Math.min(room, 28 * s);
    p.trap(box.shoulder, hem + (kind === 'peacock' ? 10 : 2), box.cx - 8 * s, box.cx + 8 * s, box.cx - wing, box.cx + wing, (x) => shade(cape, x, box.cx), edge);
    if (kind === 'butterfly') {
      p.ellipse(box.cx - 18 * s, box.shoulder + 4 * s, 12 * s, 16 * s, lighten(color, 0.22), edgeOf(lighten(color, 0.05)));
      p.ellipse(box.cx + 18 * s, box.shoulder + 4 * s, 12 * s, 16 * s, lighten(color, 0.22), edgeOf(lighten(color, 0.05)));
      p.ellipse(box.cx - 20 * s, box.shoulder + 16 * s, 8 * s, 10 * s, lighten(color, 0.4), edge);
      p.ellipse(box.cx + 20 * s, box.shoulder + 16 * s, 8 * s, 10 * s, lighten(color, 0.4), edge);
      p.disc(box.cx - 22 * s, box.shoulder + 2 * s, 2, '#fff6ea');
      p.disc(box.cx + 22 * s, box.shoulder + 2 * s, 2, '#fff6ea');
    }
    if (kind === 'peacock') {
      for (let i = 0; i < 6; i++) {
        const x = box.cx - wing + 8 + ((i * 17) % (wing * 2 - 10));
        const y = box.waist + 10 + (i % 3) * 12;
        p.disc(x, y, 4 * s, '#0e4d34');
        p.disc(x, y, 2 * s, '#1f8a62');
        p.disc(x, y, s, '#f2c14e');
      }
    }
  }
  if (kind === 'coat' || kind === 'jacket') {
    sleeves(p, box, cloth, color, kind === 'coat' ? 22 : 14, false);
    bodice(p, box, cloth, color, 3);
    skirt(p, box, cloth, color, kind === 'coat' ? hem : box.waist + 8, kind === 'coat' ? 16 : 12, 9);
    lapels(p, box, color);
    buttons(p, box, kind === 'coat' ? 4 : 3);
    p.rect(box.cx - 10, box.waist - 2, 6, 4, darken(color, 0.1));
    p.rect(box.cx + 4, box.waist - 2, 6, 4, darken(color, 0.1));
    if (kind === 'jacket') skirt(p, box, cloth, lighten(color, 0.08), hem, 14, 8);
    drawExtras(p, box, color, kind, extras);
    return;
  }
  if (kind === 'pants' || kind === 'jumpsuit') {
    if (kind === 'jumpsuit') bodice(p, box, cloth, color, 5);
    else bodice(p, box, cloth, color, 4);
    const edge = edgeOf(color);
    const paint = (x: number, y: number) => paintCloth(cloth, color, x, y, box.cx);
    p.trap(box.waist, hem, box.cx - 8, box.cx - 1, box.cx - 12, box.cx - 2, paint, edge);
    p.trap(box.waist, hem, box.cx + 1, box.cx + 8, box.cx + 2, box.cx + 12, paint, edge);
    p.rect(box.cx - 2, box.waist, 4, 3, darken(color, 0.15));
    drawExtras(p, box, color, kind, extras);
    return;
  }
  if (kind === 'pencil') {
    sleeves(p, box, cloth, color, 10, true);
    bodice(p, box, cloth, color);
    skirt(p, box, cloth, color, hem - 4, 7, 7);
    drawExtras(p, box, color, kind, extras);
    return;
  }
  if (kind === 'twirl') {
    bodice(p, box, cloth, color, 5);
    skirt(p, box, cloth, color, hem, 20, 7);
    p.rect(box.cx - 6, box.waist - 1, 12, 2, lighten(color, 0.3));
    drawExtras(p, box, color, kind, extras);
    return;
  }
  if (kind === 'pleats' || kind === 'tiered') {
    bodice(p, box, cloth, color);
    skirt(p, box, cloth, color, hem, 16, 8);
    for (let x = box.cx - 14; x <= box.cx + 14; x += 3) {
      for (let y = box.waist + 2; y < hem; y++) p.set(x, y, darken(color, 0.18));
    }
    if (kind === 'tiered') {
      const bands = [0.2, 0.42, 0.64, 0.86];
      bands.forEach((t, index) => {
        const y = box.waist + (hem - box.waist) * t;
        const half = (10 + index * 4) * s;
        p.trap(y - 2 * s, y + 3 * s, box.cx - half + 4, box.cx + half - 4, box.cx - half, box.cx + half, () => lighten(color, 0.28), edgeOf(color));
      });
    }
    drawExtras(p, box, color, kind, extras);
    return;
  }
  if (kind === 'mermaid') {
    bodice(p, box, 'sequins', color);
    const edge = edgeOf(color);
    const paint = (x: number, y: number) => paintCloth('sequins', color, x, y, box.cx);
    const knee = box.waist + Math.round((hem - box.waist) * 0.62);
    p.trap(box.waist, knee, box.cx - 8 * s, box.cx + 8 * s, box.cx - 5 * s, box.cx + 5 * s, paint, edge);
    p.trap(knee, hem, box.cx - 5 * s, box.cx + 5 * s, box.cx - Math.min(room, 22 * s), box.cx + Math.min(room, 22 * s), paint, edge);
    for (let y = knee; y < hem; y += 4 * s) {
      const t = (y - knee) / (hem - knee || 1);
      const half = 5 * s + t * 12 * s;
      for (let x = box.cx - half; x <= box.cx + half; x += 4 * s) {
        p.disc(x, y, s + 0.4, lighten(color, 0.35));
        p.set(x, y, '#fff6ea');
      }
    }
    drawExtras(p, box, color, kind, extras);
    return;
  }
  if (kind === 'kimono') {
    const edge = edgeOf(color);
    const paint = (x: number, y: number) => paintCloth(cloth, color, x, y, box.cx);
    sleeves(p, box, cloth, color, 14, false);
    p.trap(box.shoulder, hem, box.cx - 16 * s, box.cx + 16 * s, box.cx - Math.min(room, 18 * s), box.cx + Math.min(room, 18 * s), paint, edge);
    p.trap(box.shoulder + 4, hem - 4, box.cx - 3 * s, box.cx + 3 * s, box.cx - 4 * s, box.cx + 4 * s, () => lighten(color, 0.22), edge);
    p.rect(box.cx - 10 * s, box.waist - s, 20 * s, 4 * s, '#c23b4b');
    p.rect(box.cx - 10 * s, box.waist, 20 * s, s, '#f2c14e');
    for (let i = 0; i < 7; i++) rose(p, box.cx - 16 * s + i * 5 * s, box.shoulder + 10 * s + (i % 2) * 8 * s);
    drawExtras(p, box, color, kind, extras);
    return;
  }
  if (kind === 'princess') {
    sleeves(p, box, cloth, color, 8, true);
    bodice(p, box, cloth, color, 3);
    skirt(p, box, 'tulle', lighten(color, 0.2), hem + s, 26, 12);
    skirt(p, box, cloth, color, hem - s, 18, 8);
    drawExtras(p, box, color, kind, extras);
    return;
  }
  const long = kind !== 'sundress' && kind !== 'candy';
  const flare = kind === 'candy' ? 15 : long ? 18 : 14;
  if (kind === 'chiffon') {
    bodice(p, box, cloth, color, 6);
    const edge = edgeOf(color);
    p.trap(
      box.waist,
      hem,
      box.cx - 8,
      box.cx + 8,
      box.cx - flare,
      box.cx + flare,
      (x, y) => {
        const t = (y - box.waist) / (hem - box.waist || 1);
        const ombre = mix('#f2a0b0', '#f2c14e', t);
        return shade(y % 2 ? lighten(ombre, 0.15) : ombre, x, box.cx);
      },
      edge,
    );
  } else if (kind === 'starry') {
    bodice(p, box, 'solid', '#24315c');
    skirt(p, box, 'solid', '#24315c', hem, flare, 8);
    for (let i = 0; i < 16; i++) {
      star(p, box.cx - 20 * s + ((i * 7 * s) % (36 * s)), box.waist + 4 * s + ((i * 5 * s) % Math.max(8, hem - box.waist - 8)));
    }
  } else if (kind === 'ice') {
    bodice(p, box, 'solid', '#d7eef2');
    skirt(p, box, 'solid', '#e7f6f8', hem, flare, 8);
    for (let i = 0; i < 8; i++) {
      const x = box.cx - 16 * s + ((i * 5 * s) % (32 * s));
      const y = box.waist + 6 * s + (i % 4) * 6 * s;
      p.disc(x, y, 2 * s, '#ffffff');
      p.set(x, y - s, '#9fd8e4');
      p.set(x - s, y, '#9fd8e4');
      p.set(x + s, y, '#9fd8e4');
      p.set(x, y + s, '#d7f4f8');
    }
  } else if (kind === 'roses' || kind === 'ball' || kind === 'peacock' || kind === 'butterfly' || kind === 'cape') {
    bodice(p, box, cloth, color, kind === 'ball' ? 6 : 4);
    skirt(p, box, kind === 'ball' ? 'tulle' : cloth, color, hem, kind === 'peacock' ? 24 : kind === 'ball' ? 22 : 16, 8);
    if (kind === 'ball') {
      skirt(p, box, 'tulle', lighten(color, 0.22), hem + s, 28, 12);
    }
  } else {
    bodice(p, box, cloth, color);
    skirt(p, box, cloth, color, hem, flare, 8);
  }
  if (kind === 'candy') {
    for (let y = box.waist; y < hem; y += 3) p.rect(box.cx - 14, y, 28, 1, lighten(color, 0.4));
    p.disc(box.cx, box.shoulder + 1, 2, '#fff');
  }
  if (kind === 'roses' || kind === 'peacock') {
    for (let i = 0; i < 7; i++) rose(p, box.cx - 12 + (i * 4) % 24, box.waist + 4 + (i % 4) * 4);
  }
  if (kind === 'peacock') {
    for (let i = 0; i < 4; i++) {
      const x = box.cx - 8 + i * 5;
      const y = hem - 6;
      p.disc(x, y, 2, '#1f6b4a');
      p.set(x, y, '#f2c14e');
    }
  }
  if (kind === 'peacock') {
    const train = Math.min(room, 26 * s);
    const edge = edgeOf('#1f6b4a');
    p.trap(hem - 8 * s, Math.min(p.h - 2, hem + 8 * s), box.cx - 10 * s, box.cx + 10 * s, box.cx - train, box.cx + train, (x) => shade('#1f6b4a', x, box.cx), edge);
    for (let i = 0; i < 5; i++) {
      const x = box.cx - train + 8 + i * ((train * 2) / 5);
      const y = hem + 2 * s;
      p.disc(x, y, 3 * s, '#0e4d34');
      p.disc(x, y, 1.6 * s, '#3dba86');
      p.set(x, y, '#f6e7a8');
    }
  }
  drawExtras(p, box, color, kind, extras);
}

function drawExtras(p: Pix, box: Box, color: string, kind: Sil, extras: AccessoryId[]): void {
  const s = box.scale;
  if (extras.includes('buttons') && kind !== 'coat' && kind !== 'jacket') buttons(p, box, 3);
  if (extras.includes('belt')) {
    p.rect(box.cx - 10 * s, box.waist - s, 20 * s, 3 * s, '#f2c14e');
    p.rect(box.cx - 2 * s, box.waist - s, 4 * s, 3 * s, '#a67c3a');
  }
  if (extras.includes('bow')) {
    const y = box.shoulder + 2 * s;
    const bow = mix(color, '#e56b93', 0.45);
    p.disc(box.cx - 4 * s, y, 2.2 * s, bow);
    p.disc(box.cx + 4 * s, y, 2.2 * s, bow);
    p.disc(box.cx, y, s, edgeOf(bow));
  }
  if (extras.includes('sequins')) {
    for (let i = 0; i < 10; i++) p.set(box.cx - 16 * s + ((i * 4 * s) % (32 * s)), box.waist + 4 * s + ((i * 3 * s) % (16 * s)), '#fff6d0');
  }
  if (extras.includes('bag')) {
    p.rect(box.cx + 14 * s, box.waist + 2 * s, 7 * s, 6 * s, '#f2c14e');
    p.rect(box.cx + 16 * s, box.waist, 3 * s, 3 * s, '#a67c3a');
  }
}

function hairBack(p: Pix, look: PersonLook, bob = 0, lean = 0): void {
  const c = look.hairColor;
  const edge = edgeOf(c);
  const hi = lighten(c, 0.3);
  const cx = 64 + lean;
  const y = 48 + bob;
  if (look.hair === 'puffs') {
    p.disc(cx - 36, y + 10, 16, c);
    p.disc(cx + 36, y + 10, 16, c);
    p.disc(cx - 40, y + 4, 5, hi);
    p.disc(cx + 32, y + 4, 5, hi);
    p.ellipse(cx, y, 34, 24, c, edge);
  } else if (look.hair === 'bob') {
    p.ellipse(cx, y + 16, 42, 34, c, edge);
    p.rect(cx - 28, y, 40, 5, hi);
  } else if (look.hair === 'curls') {
    for (const [x, yy, r] of [
      [cx - 36, y, 12],
      [cx - 16, y - 12, 12],
      [cx, y - 16, 13],
      [cx + 18, y - 12, 12],
      [cx + 36, y, 12],
      [cx - 42, y + 16, 10],
      [cx + 42, y + 16, 10],
    ] as const) {
      p.disc(x, yy, r, c);
    }
    p.disc(cx - 8, y - 18, 4, hi);
  } else if (look.hair === 'bun') {
    p.ellipse(cx, y, 32, 22, c, edge);
    p.disc(cx, y - 28, 14, c);
    p.disc(cx - 4, y - 34, 4, hi);
  } else if (look.hair === 'crop') {
    p.ellipse(cx, y + 4, 34, 20, c, edge);
    p.rect(cx - 18, y - 6, 28, 4, hi);
  } else if (look.hair === 'locs') {
    p.ellipse(cx, y, 32, 22, c, edge);
    for (const x of [cx - 36, cx - 22, cx - 8, cx + 6, cx + 20, cx + 34]) {
      p.rect(x, y + 8, 6, 36 + (x % 7), c);
      p.rect(x + 1, y + 8, 2, 8, hi);
    }
  } else if (look.hair === 'waves') {
    p.ellipse(cx, y + 8, 40, 28, c, edge);
    p.trap(y + 16, y + 78, cx - 40, cx - 22, cx - 46, cx - 28, () => c, edge);
    p.trap(y + 16, y + 74, cx + 22, cx + 40, cx + 28, cx + 46, () => c, edge);
    p.rect(cx - 22, y - 4, 36, 4, hi);
  } else if (look.hair === 'braid') {
    p.ellipse(cx, y, 32, 22, c, edge);
    for (let i = 0; i < 8; i++) p.disc(cx - 30 + (i % 2) * 6, y + 20 + i * 8, 6, i % 2 ? darken(c, 0.1) : c);
  } else if (look.hair === 'pony') {
    p.ellipse(cx, y, 32, 22, c, edge);
    p.trap(y - 4, y + 64, cx + 16, cx + 30, cx + 24, cx + 40, () => c, edge);
    p.disc(cx + 32, y + 66, 7, c);
    p.rect(cx + 6, y - 10, 16, 4, hi);
  } else if (look.hair === 'hijab') {
    p.ellipse(cx, y + 10, 44, 36, c, edge);
    p.trap(y + 16, y + 70, cx - 42, cx + 42, cx - 34, cx + 34, () => c, edge);
    p.rect(cx - 24, y - 8, 40, 5, hi);
  }
}

function hairFront(p: Pix, look: PersonLook, bob = 0, lean = 0): void {
  const c = look.hairColor;
  const edge = edgeOf(c);
  const hi = lighten(c, 0.32);
  const cx = 64 + lean;
  const y = 40 + bob;
  if (look.hair !== 'hijab') {
    p.ellipse(cx, 42 + bob, 34, 16, c, edge);
    p.rect(cx - 16, 30 + bob, 20, 3, hi);
  }
  if (look.hair === 'hijab') {
    p.trap(y, y + 14, cx - 36, cx + 36, cx - 28, cx + 28, () => c, edge);
    p.rect(cx - 16, y + 2, 28, 3, hi);
    return;
  }
  if (look.hair === 'bob' || look.hair === 'waves' || look.hair === 'puffs') {
    p.set(cx - 20, 36 + bob, hi);
    p.set(cx - 19, 35 + bob, hi);
    p.set(cx + 16, 35 + bob, hi);
  } else if (look.hair === 'curls') {
    p.disc(cx - 22, y + 10, 7, c);
    p.disc(cx, y + 4, 7, c);
    p.disc(cx + 22, y + 10, 7, c);
    p.disc(cx - 4, y + 2, 3, hi);
  } else {
    p.disc(cx - 12, y + 12, 4, c);
    p.disc(cx + 10, y + 12, 4, c);
    p.rect(cx - 8, y + 8, 12, 2, hi);
  }
  if (look.beret) {
    p.ellipse(cx + 10, y - 4, 18, 8, '#3a241c', '#24160f');
    p.rect(cx - 6, y, 28, 4, '#3a241c');
    p.set(cx + 18, y - 8, '#f2c14e');
  }
}

type EyeMode = 'open' | 'blink' | 'joy';

/** Round kawaii eye. cx/cy is the center. Default size is about 14×16. */
function drawEye(p: Pix, cx: number, cy: number, iris: string, mode: EyeMode, rx = 7, ry = 8): void {
  const lash = darken(iris, 0.42);
  const pupil = darken(iris, 0.5);
  const upper = darken(iris, 0.16);
  const lower = lighten(iris, 0.32);
  if (mode === 'blink') {
    for (let x = -rx; x <= rx; x++) {
      const y = cy + (x * x > rx * rx * 0.45 ? 1 : 0);
      p.set(cx + x, y, lash);
      p.set(cx + x, y + 1, lash);
    }
    return;
  }
  if (mode === 'joy') {
    for (let x = -rx; x <= rx; x++) {
      const y = cy + 1 - Math.round((rx * rx - x * x) / (rx * 3.2));
      p.set(cx + x, y, lash);
      p.set(cx + x, y + 1, lash);
    }
    return;
  }
  p.ellipse(cx, cy, rx, ry, '#fffdf8', lash);
  p.ellipse(cx, cy + 1, rx - 2, ry - 2, iris);
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      const nx = x / (rx - 2);
      const ny = (y - 1) / (ry - 2);
      if (nx * nx + ny * ny > 1) continue;
      if (y < -1) p.set(cx + x, cy + y, upper);
      else if (y > 2) p.set(cx + x, cy + y, lower);
    }
  }
  p.ellipse(cx, cy + 1, Math.max(2, rx - 5), Math.max(2, ry - 5), pupil);
  p.rect(cx - rx + 2, cy - ry + 3, 2, 2, '#ffffff');
  p.set(cx + 2, cy + 1, '#ffffff');
  for (let x = -rx + 1; x <= rx - 1; x++) {
    p.set(cx + x, cy - ry + (Math.abs(x) > rx - 3 ? 1 : 0), lash);
  }
}

function drawFace(p: Pix, look: PersonLook, mode: EyeMode, bob: number, mouth: 'happy' | 'soft' | 'flat' | 'down' = 'soft', lean = 0): void {
  const cx = 64 + lean;
  const y = 72 + bob;
  const iris = IRISES[look.hair.length % IRISES.length];
  drawEye(p, cx - 18, y, iris, mode);
  drawEye(p, cx + 18, y, iris, mode);
  const blush = look.blush ?? '#f4a8b4';
  p.ellipse(cx - 30, y + 12, 6, 3, blush);
  p.ellipse(cx + 30, y + 12, 6, 3, blush);
  const lip = '#d26478';
  const my = y + 20;
  if (mouth === 'happy' || mode === 'joy') {
    for (let x = -5; x <= 5; x++) {
      const dy = 2 - Math.round((25 - x * x) / 14);
      p.set(cx + x, my + dy, lip);
    }
    p.set(cx - 1, my + 1, '#fff');
    p.set(cx, my + 1, '#fff');
  } else if (mouth === 'down') {
    for (let x = -4; x <= 4; x++) p.set(cx + x, my + (Math.abs(x) > 2 ? 0 : 1), lip);
  } else if (mouth === 'flat') {
    p.rect(cx - 4, my, 9, 2, lip);
  } else {
    for (let x = -3; x <= 3; x++) p.set(cx + x, my + (Math.abs(x) === 3 ? 0 : 1), lip);
  }
  if (look.freckles) {
    for (const [fx, fy] of [
      [cx - 28, y + 8],
      [cx - 24, y + 12],
      [cx + 24, y + 8],
      [cx + 28, y + 12],
    ] as const) {
      p.set(fx, fy, '#c48a62');
    }
  }
  if (look.glasses) {
    const g = '#6a5346';
    const ring = (ex: number, ey: number) => {
      for (let a = 0; a < 28; a++) {
        const t = (a / 28) * Math.PI * 2;
        p.set(ex + Math.round(Math.cos(t) * 10), ey + Math.round(Math.sin(t) * 9), g);
      }
    };
    ring(cx - 18, y);
    ring(cx + 18, y);
    p.rect(cx - 8, y, 16, 1, g);
  }
}

function drawBody(p: Pix, look: PersonLook, frame: number, longHem: boolean, hipHand = false): void {
  const skin = look.skin;
  const edge = edgeOf(skin);
  const bob = frame % 2 === 0 ? 0 : -2;
  const lean = [0, 2, 4, 2, -1, -3][frame] ?? 0;
  const step = [0, 4, 8, 4, 0, -4][frame] ?? 0;
  const cx = 64 + lean;
  p.ellipse(cx, 62 + bob, 40, 36, skin, edge);
  p.ellipse(cx - 38, 68 + bob, 7, 9, skin, edge);
  p.ellipse(cx + 38, 68 + bob, 7, 9, skin, edge);
  p.ellipse(cx, 108 + bob, 12, 10, skin, edge);
  p.ellipse(cx, 124 + bob, 30, 18, skin, edge);
  p.ellipse(cx, 142 + bob, 24, 16, skin, edge);
  const sway = frame ? step : 0;
  if (hipHand) {
    tube(p, cx - 28, 112 + bob, cx - 40, 136 + bob, 7, skin, edge);
    tube(p, cx - 40, 136 + bob, cx - 16, 146 + bob, 6, skin, edge);
  } else {
    tube(p, cx - 28, 112 + bob, cx - 40, 158 + bob - sway, 7, skin, edge);
  }
  tube(p, cx + 28, 112 + bob, cx + 40, 160 + bob + Math.round(sway / 2), 7, skin, edge);
  if (!longHem) {
    tube(p, cx - 12, 152 + bob, cx - 14, 180 + bob - Math.max(0, step), 7, skin, edge);
    tube(p, cx + 12, 152 + bob, cx + 16, 180 + bob - Math.max(0, -step), 7, skin, edge);
  }
}

function street(p: Pix, look: PersonLook, bob: number, lean = 0): void {
  const top = look.streetTop ?? '#e23b6a';
  const bottom = look.streetBottom ?? '#5c3a4a';
  const box: Box = { cx: 64 + lean, shoulder: 108 + bob, waist: 136 + bob, hem: 176 + bob, scale: 2 };
  if (look.streetKind === 'separates') {
    bodice(p, box, 'solid', top, 4);
    const edge = edgeOf(bottom);
    const paint = (x: number) => shade(bottom, x, box.cx);
    p.trap(box.waist, box.hem, box.cx - 16, box.cx - 4, box.cx - 18, box.cx - 4, paint, edge);
    p.trap(box.waist, box.hem, box.cx + 4, box.cx + 16, box.cx + 4, box.cx + 18, paint, edge);
  } else {
    bodice(p, box, 'solid', top);
    skirt(p, box, 'solid', top, box.hem, 12, 8);
  }
  if (!look.streetKind || look.streetKind === 'dress') {
    p.ellipse(box.cx - 16, 184 + bob, 10, 5, bottom, edgeOf(bottom));
    p.ellipse(box.cx + 16, 184 + bob, 10, 5, bottom, edgeOf(bottom));
  } else {
    p.ellipse(box.cx - 16, 184 + bob, 10, 5, darken(bottom, 0.1), edgeOf(bottom));
    p.ellipse(box.cx + 16, 184 + bob, 10, 5, darken(bottom, 0.1), edgeOf(bottom));
  }
}

const LONG = new Set<SketchId>([
  'rain-coat',
  'garden-gown',
  'palazzo',
  'jumpsuit',
  'hero-cape',
  'puff-pencil',
  'ball-gown',
  'princess-gown',
  'mermaid-gown',
  'sunset-chiffon',
  'garden-roses',
  'starry-gown',
  'butterfly-cape',
  'tiered-ruffle',
  'ice-crystal',
  'peacock-train',
  'cherry-kimono',
]);

function renderFrame(
  look: PersonLook,
  outfit: Outfit | null | undefined,
  frame: number,
  eye: EyeMode,
  mouth: 'happy' | 'soft' | 'flat' | 'down' = 'soft',
  hipHand = false,
): Pix {
  const p = new Pix(W, H);
  const bob = frame % 2 === 0 ? 0 : -2;
  const lean = [0, 2, 4, 2, -1, -3][frame] ?? 0;
  const longHem = Boolean(outfit && LONG.has(outfit.sketchId));
  hairBack(p, look, bob, lean);
  drawBody(p, look, outfit ? frame : 0, longHem, hipHand);
  if (outfit) {
    const hem = longHem ? 186 + bob : outfit.sketchId === 'candy-party' || outfit.sketchId === 'sunny-dress' ? 162 + bob : 172 + bob;
    drawGarment(
      p,
      outfit.sketchId,
      outfit.pattern,
      outfit.color,
      { cx: 64 + lean, shoulder: 108 + bob, waist: 136 + bob, hem, scale: 2 },
      outfit.accessories,
    );
    if (outfit.accessories.includes('shoes') && !longHem) {
      p.ellipse(64 + lean - 16, 184 + bob, 10, 5, outfit.color, edgeOf(outfit.color));
      p.ellipse(64 + lean + 16, 184 + bob, 10, 5, outfit.color, edgeOf(outfit.color));
    }
    if (outfit.accessories.includes('hat') && look.hair !== 'hijab') {
      p.ellipse(74 + lean, 28 + bob, 16, 7, '#3a241c', '#24160f');
      p.set(86 + lean, 24 + bob, '#f2c14e');
    }
  } else {
    street(p, look, bob, lean);
  }
  hairFront(p, look, bob, lean);
  const cx = 64 + lean;
  if (hipHand) {
    tube(p, cx - 30, 124 + bob, cx - 18, 146 + bob, 6, look.skin, edgeOf(look.skin));
  } else {
    tube(p, cx - 34, 128 + bob, cx - 42, 162 + bob, 6, look.skin, edgeOf(look.skin));
  }
  tube(p, cx + 34, 128 + bob, cx + 42, 164 + bob, 6, look.skin, edgeOf(look.skin));
  drawFace(p, look, eye, bob, mouth, lean);
  return p;
}

export function chibiHTML(opts: {
  look: PersonLook;
  outfit?: Outfit | null;
  pose?: PoseName;
  uid: string;
}): string {
  const pose = opts.pose ?? 'idle';
  const keyBase = JSON.stringify({
    look: opts.look,
    outfit: opts.outfit
      ? { s: opts.outfit.sketchId, p: opts.outfit.pattern, c: opts.outfit.color, a: opts.outfit.accessories }
      : null,
  });
  const joy = pose === 'cheer' || pose === 'twirl';
  const eye: EyeMode = joy ? 'joy' : 'open';
  const mouth = pose === 'frown' ? 'down' : pose === 'think' ? 'flat' : joy ? 'happy' : 'soft';
  let main = '';
  let frames = 1;
  let blink = '';
  if (pose === 'stride') {
    frames = 6;
    main = cachedPng(`walk2:${keyBase}`, () => {
      const framesPix = [0, 1, 2, 3, 4, 5].map((frame) => renderFrame(opts.look, opts.outfit, frame, 'open', 'soft', frame % 2 === 0));
      const sheet = new Pix(W * 6, H);
      framesPix.forEach((frame, index) => sheet.blit(frame, index * W, 0));
      return sheet;
    });
  } else {
    const hip = pose === 'cheer' || pose === 'twirl';
    main = cachedPng(`still2:${pose}:${mouth}:${keyBase}`, () => renderFrame(opts.look, opts.outfit, 0, eye, mouth, hip));
    if (!joy && pose !== 'frown') blink = cachedPng(`blink2:${keyBase}`, () => renderFrame(opts.look, opts.outfit, 0, 'blink', mouth, hip));
  }
  const fx = gownFx(opts.outfit?.sketchId);
  const trail =
    fx === 'none'
      ? ''
      : `<span class="fx fx-${fx}" aria-hidden="true">${fx === 'petals' || fx === 'stars' ? '<i></i><i></i><i></i><i></i>' : ''}</span>`;
  const hem = opts.outfit && LONG.has(opts.outfit.sketchId) ? ' hem-long' : '';
  return `<div class="person chibi pose-${pose}${hem} fx-${fx}" data-gown="${opts.outfit?.sketchId ?? ''}" data-frames="${frames}" style="--frames:${frames}">
    <i style="background-image:url(${main})"></i>
    ${blink ? `<b style="background-image:url(${blink})"></b>` : ''}
    ${trail}
  </div>`;
}

function formBox(kind: Sil): Box {
  const long = !['sundress', 'twirl', 'candy', 'pencil', 'jacket'].includes(kind);
  return { cx: 60, shoulder: 58, waist: 88, hem: long ? 170 : kind === 'twirl' ? 150 : 138, scale: 2 };
}

export function dressFormURL(
  outfit: Pick<Outfit, 'sketchId' | 'pattern' | 'color' | 'accessories'> | null,
  mode: 'fashion' | 'paper' | 'bare' | 'sketch',
): string {
  const key = JSON.stringify({ outfit, mode });
  return cachedPng(`form:${key}`, () => {
    const p = new Pix(120, 192);
    p.rect(0, 0, 120, 192, mode === 'sketch' ? '#f7f1e4' : '#fff9f4');
    p.rect(56, 118, 8, 52, '#e4d5c8');
    p.ellipse(60, 174, 24, 7, '#8d5a3c', '#6a3e2c');
    p.ellipse(60, 78, 22, 28, '#f6e2d4', '#e2cbb8');
    p.ellipse(60, 48, 14, 16, '#f3d7c6', '#e0c4ae');
    p.rect(52, 60, 16, 12, '#f3d7c6');
    if (outfit && mode !== 'bare') {
      const paper = mode === 'paper' || mode === 'sketch';
      const color = paper ? '#f4e4d4' : outfit.color;
      const pattern: FabricId = paper ? 'solid' : outfit.pattern;
      drawGarment(p, outfit.sketchId, pattern, color, formBox(silhouette(outfit.sketchId)), paper ? [] : outfit.accessories);
      if (paper) {
        for (let y = 64; y < 160; y += 5) p.set(60, y, '#e7a0b0');
      }
    }
    return p;
  });
}

export function sketchURL(id: SketchId): string {
  const outfit: Outfit = { id: 'sk', sketchId: id, pattern: 'solid', color: '#c47a74', accessories: [] };
  return dressFormURL(outfit, 'sketch');
}

export function swatchURL(pattern: FabricId, color: string): string {
  return cachedPng(`sw:${pattern}:${color}`, () => {
    const p = new Pix(16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) p.set(x, y, x === 0 || y === 0 || x === 15 || y === 15 ? edgeOf(color) : clothAt(pattern, color, x, y));
    }
    return p;
  });
}

export function trimURL(id: AccessoryId): string {
  return cachedPng(`trim:${id}`, () => {
    const p = new Pix(16, 16);
    p.rect(0, 0, 16, 16, '#fff4ea');
    if (id === 'bow') {
      p.disc(5, 8, 3, '#e56b93');
      p.disc(11, 8, 3, '#e56b93');
      p.rect(7, 6, 2, 4, '#c23b5a');
    } else if (id === 'buttons') {
      for (const y of [4, 8, 12]) p.disc(8, y, 2, '#f2c14e');
    } else if (id === 'sequins') {
      star(p, 5, 5);
      star(p, 11, 8, '#e56b93');
      star(p, 6, 12, '#7eb6e0');
    } else if (id === 'belt') {
      p.rect(2, 7, 12, 3, '#f2c14e');
      p.rect(7, 6, 3, 5, '#a67c3a');
    } else if (id === 'hat') {
      p.ellipse(8, 9, 6, 3, '#3a241c', '#24160f');
      p.rect(3, 9, 10, 2, '#3a241c');
    } else if (id === 'bag') {
      p.rect(4, 6, 8, 7, '#e7a05a');
      p.rect(6, 4, 4, 3, '#c4844a');
    } else {
      p.ellipse(5, 12, 3, 2, '#c23b5a', '#8d3048');
      p.ellipse(11, 12, 3, 2, '#c23b5a', '#8d3048');
    }
    return p;
  });
}

export function decorURL(id: string): string {
  return cachedPng(`decor:${id}`, () => {
    const p = new Pix(16, 16);
    p.rect(0, 0, 16, 16, '#fff4ea');
    if (id === 'rug') p.ellipse(8, 9, 6, 3, '#e7a0b4', '#c47a90');
    else if (id === 'flowers') {
      rose(p, 6, 8);
      rose(p, 11, 7);
    } else if (id === 'lights') {
      for (const x of [3, 8, 13]) p.disc(x, 8, 2, x === 8 ? '#f2c14e' : '#f2a0b8');
    } else if (id === 'chandelier') {
      p.rect(8, 2, 1, 4, '#e2c27a');
      p.disc(4, 10, 2, '#fff6d0');
      p.disc(8, 12, 2, '#fff6d0');
      p.disc(12, 10, 2, '#fff6d0');
    } else {
      p.ellipse(8, 8, 5, 6, '#d7efec', '#e2c27a');
    }
    return p;
  });
}

export function puppyURL(): string {
  return cachedPng('puppy', () => {
    const p = new Pix(24, 20);
    p.ellipse(8, 12, 6, 5, '#e0a15c', '#a86b3c');
    p.ellipse(16, 11, 5, 4, '#efb56e', '#a86b3c');
    p.disc(4, 6, 3, '#e0a15c');
    p.disc(11, 5, 3, '#efb56e');
    p.set(15, 10, '#3a241c');
    p.set(16, 9, '#fff');
    p.set(18, 12, '#e56b93');
    p.rect(18, 8, 5, 2, '#c4844a');
    return p;
  });
}

export function pipURL(): string {
  return cachedPng('pip-cute', () => {
    const p = new Pix(64, 64);
    p.ellipse(32, 36, 20, 18, '#e25b4a', '#a33b32');
    p.ellipse(32, 14, 8, 6, '#5aaa72', '#3e8f62');
    p.rect(30, 16, 4, 8, '#3e8f62');
    p.set(30, 12, '#d7f0c8');
    drawEye(p, 24, 34, '#5c3a32', 'open', 6, 7);
    drawEye(p, 40, 34, '#5c3a32', 'open', 6, 7);
    for (let x = -3; x <= 3; x++) p.set(32 + x, 46 + (Math.abs(x) === 3 ? 0 : 1), '#c4475c');
    p.ellipse(16, 42, 4, 2, '#f3b0b8');
    p.ellipse(48, 42, 4, 2, '#f3b0b8');
    return p;
  });
}

export function fanURL(skin: string, hair: string, shirt: string): string {
  return cachedPng(`fan:${skin}:${hair}:${shirt}`, () => {
    const p = new Pix(24, 32);
    p.ellipse(12, 10, 7, 7, skin, edgeOf(skin));
    p.ellipse(12, 6, 8, 5, hair, edgeOf(hair));
    p.rect(8, 4, 8, 2, lighten(hair, 0.25));
    drawEye(p, 9, 11, '#5c3a32', 'open', 3, 4);
    drawEye(p, 16, 11, '#5c3a32', 'open', 3, 4);
    p.set(10, 15, '#d26478');
    p.set(11, 16, '#d26478');
    p.set(12, 16, '#d26478');
    p.set(13, 15, '#d26478');
    p.trap(16, 30, 6, 18, 4, 20, (x) => shade(shirt, x, 12), edgeOf(shirt));
    return p;
  });
}

export function photogURL(skin: string, shirt: string): string {
  return cachedPng(`photo:${skin}:${shirt}`, () => {
    const p = new Pix(32, 48);
    p.ellipse(14, 14, 8, 8, skin, edgeOf(skin));
    p.ellipse(14, 10, 9, 5, '#3a241c', '#24160f');
    drawEye(p, 11, 15, '#5c3a32', 'open', 3, 4);
    drawEye(p, 18, 15, '#5c3a32', 'joy', 3, 4);
    p.trap(22, 44, 6, 22, 5, 24, (x) => shade(shirt, x, 14), edgeOf(shirt));
    p.rect(18, 26, 12, 8, '#3a241c');
    p.disc(28, 30, 4, '#d7eef5');
    p.disc(28, 30, 2, '#7eb6e0');
    p.set(26, 28, '#fff');
    p.rect(20, 24, 4, 3, '#f6e7b0');
    return p;
  });
}

function miniDress(p: Pix, x: number, y: number, color: string): void {
  p.trap(y, y + 18, x + 4, x + 10, x, x + 14, (px) => shade(color, px, x + 7), edgeOf(color));
  p.rect(x + 5, y, 4, 3, lighten(color, 0.2));
}

export function shopURL(opts: {
  decor: string[];
  cat: 'sleep' | 'sit' | 'gone';
  disco: boolean;
  posterOn: boolean;
}): string {
  const key = JSON.stringify(opts);
  return cachedPng(`shop:${key}`, () => {
    const p = new Pix(160, 180);
    p.rect(0, 0, 160, 180, '#f6e0d4');
    for (let y = 118; y < 180; y++) {
      const plank = y % 8 < 7 ? (Math.floor(y / 8) % 2 ? '#c98462' : '#b8744e') : '#8d5340';
      p.rect(0, y, 160, 1, plank);
    }
    p.rect(0, 112, 160, 6, '#f3e6da');
    p.trap(18, 78, 48, 112, 36, 124, () => '#9fd0ea', '#c9a27a');
    p.rect(78, 18, 2, 60, '#fffaf6');
    p.rect(48, 46, 64, 2, '#fffaf6');
    p.disc(62, 32, 6, '#fff6d4');
    p.ellipse(100, 30, 10, 4, '#ffffff');
    p.rect(40, 74, 80, 8, '#9dcea0');
    p.rect(70, 70, 2, 10, '#5f8f68');
    if (opts.decor.includes('flowers')) {
      rose(p, 66, 70);
      rose(p, 74, 68);
      rose(p, 80, 72);
    } else {
      rose(p, 74, 70);
    }
    if (opts.cat !== 'gone') {
      p.ellipse(86, 78, 10, 5, '#e0a15c');
      p.disc(84, 74, 5, '#efb56e');
      p.set(80, 70, '#efb56e');
      p.set(88, 70, '#c4844a');
      if (opts.cat === 'sleep') {
        p.rect(81, 74, 3, 1, '#6a4636');
        p.rect(86, 74, 3, 1, '#6a4636');
      } else {
        p.set(82, 73, '#3a241c');
        p.set(87, 73, '#3a241c');
        p.set(83, 72, '#fff');
        p.set(88, 72, '#fff');
      }
      p.set(84, 76, '#e56b93');
    }
    p.rect(8, 22, 28, 34, opts.posterOn ? '#3a241c' : '#f7efe6');
    p.rect(10, 24, 24, 30, opts.posterOn ? '#f2c14e' : '#e7d3c4');
    p.rect(14, 36, 16, 2, opts.posterOn ? '#e56b93' : '#c4b0a4');
    p.rect(16, 42, 12, 2, opts.posterOn ? '#fff6ea' : '#c4b0a4');
    p.rect(6, 58, 2, 48, '#7a5238');
    p.rect(6, 58, 36, 2, '#7a5238');
    miniDress(p, 8, 60, '#e23b6a');
    miniDress(p, 18, 62, '#2f6f86');
    miniDress(p, 28, 60, '#f2c14e');
    const bolts = ['#e56b93', '#2f7c8a', '#f2c14e', '#7a4e8a'];
    bolts.forEach((color, index) => p.rect(10 + index * 2, 100 - index * 6, 28 - index * 4, 6, color));
    p.ellipse(138, 48, 14, 20, '#d7efec', opts.decor.includes('mirror') ? '#e2c27a' : '#c4a574');
    p.ellipse(136, 46, 4, 8, '#ffffff');
    p.rect(124, 78, 28, 4, '#8d5a3c');
    p.rect(126, 66, 24, 5, '#24315c');
    p.rect(128, 60, 20, 5, '#c23b4b');
    p.rect(130, 54, 16, 5, '#3e8f62');
    p.ellipse(80, 158, opts.decor.includes('rug') ? 36 : 24, 8, '#e7a0b4');
    p.ellipse(80, 158, opts.decor.includes('rug') ? 26 : 16, 4, '#f7e1c8');
    p.rect(18, 150, 8, 14, '#c46a4a');
    p.trap(150, 132, 16, 28, 20, 24, () => '#3e8f62', '#2f6b4f');
    p.trap(150, 136, 22, 30, 26, 32, () => '#2f6b4f', '#24563c');
    p.rect(118, 148, 28, 4, '#a86d50');
    p.disc(124, 144, 4, '#f2c14e');
    p.rect(132, 140, 2, 8, '#c23b4b');
    p.rect(70, 0, 2, 10, '#e2c27a');
    if (opts.decor.includes('chandelier')) {
      p.trap(8, 16, 58, 102, 64, 96, () => '#f8e7c4', '#e2c27a');
      for (const x of [60, 72, 84, 96]) p.disc(x, 16, 2, opts.disco ? '#fff' : '#fff6d0');
    } else {
      p.ellipse(80, 12, 10, 5, '#f8e7c4', '#e2c27a');
      p.disc(80, 12, 2, '#fff6d0');
    }
    if (opts.decor.includes('lights')) {
      for (let i = 0; i < 8; i++) p.disc(12 + i * 18, 8 + (i % 2) * 3, 2, ['#ffd0dc', '#ffe29a', '#d9f2c8', '#d4ecff'][i % 4]);
    }
    p.rect(58, 2, 44, 10, '#3a241c');
    p.rect(64, 5, 4, 4, '#f6d7a2');
    p.rect(72, 5, 4, 4, '#f6d7a2');
    p.rect(80, 5, 4, 4, '#f6d7a2');
    p.rect(88, 5, 4, 4, '#f6d7a2');
    return p;
  });
}
