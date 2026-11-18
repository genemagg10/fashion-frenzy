import { darken, lighten, mix } from './color';
import { Pix, cachedPng } from './px';
import type { AccessoryId, FabricId, Outfit, PersonLook, SketchId } from './types';

export type PoseName = 'idle' | 'stand' | 'stride' | 'twirl' | 'cheer' | 'think' | 'frown';
export type GownFx = 'sparkle' | 'swish' | 'petals' | 'stars' | 'none';

const W = 64;
const H = 96;

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
  if (x > mid + 2) return darken(color, 0.12);
  if (x < mid - 3) return lighten(color, 0.12);
  return color;
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
  const y0 = box.shoulder;
  const y1 = box.shoulder + len;
  const reach = puff ? 16 : 12;
  const paint = (x: number, y: number) => paintCloth(pattern, color, x, y, box.cx);
  p.trap(y0, y1, box.cx - 14, box.cx - 8, box.cx - reach, box.cx - reach + 6, paint, edge);
  p.trap(y0, y1, box.cx + 8, box.cx + 14, box.cx + reach - 6, box.cx + reach, paint, edge);
  if (puff) {
    p.disc(box.cx - 14, y0 + 2, 5, color);
    p.disc(box.cx + 14, y0 + 2, 5, color);
    p.disc(box.cx - 14, y0 + 1, 2, lighten(color, 0.35));
    p.disc(box.cx + 14, y0 + 1, 2, lighten(color, 0.35));
  }
  p.disc(box.cx - reach + 2, y1, 2, edge);
  p.disc(box.cx + reach - 2, y1, 2, edge);
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
  const paint = (x: number, y: number) => paintCloth(pattern, color, x, y, box.cx);
  p.trap(box.waist, hem, box.cx - waistHalf, box.cx + waistHalf, box.cx - flare, box.cx + flare, paint, edge);
  p.rect(box.cx - flare, hem - 1, flare * 2, 2, edge);
  for (let x = box.cx - flare + 2; x < box.cx + flare; x += 4) p.set(x, hem - 3, lighten(color, 0.35));
}

function bodice(p: Pix, box: Box, pattern: FabricId, color: string, neck = 4): void {
  const edge = edgeOf(color);
  const paint = (x: number, y: number) => paintCloth(pattern, color, x, y, box.cx);
  p.trap(box.shoulder, box.waist, box.cx - 12, box.cx + 12, box.cx - 8, box.cx + 8, paint, edge);
  p.rect(box.cx - neck, box.shoulder, neck * 2, 2, lighten(color, 0.25));
}

function buttons(p: Pix, box: Box, count: number): void {
  for (let i = 0; i < count; i++) {
    const y = box.shoulder + 6 + i * 5;
    p.disc(box.cx, y, 1.4, '#f6e2a8');
    p.set(box.cx, y, '#a67c3a');
  }
}

function lapels(p: Pix, box: Box, color: string): void {
  const lip = lighten(color, 0.28);
  const edge = edgeOf(color);
  p.trap(box.shoulder, box.shoulder + 12, box.cx - 4, box.cx, box.cx - 8, box.cx - 1, () => lip, edge);
  p.trap(box.shoulder, box.shoulder + 12, box.cx, box.cx + 4, box.cx + 1, box.cx + 8, () => lip, edge);
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
  if (kind === 'butterfly' || kind === 'cape' || kind === 'peacock') {
    const cape = kind === 'peacock' ? '#1f6b4a' : kind === 'butterfly' ? lighten(color, 0.15) : darken(color, 0.08);
    const edge = edgeOf(cape);
    p.trap(box.shoulder - 1, hem + 2, box.cx - 6, box.cx + 6, box.cx - 22, box.cx + 22, (x) => shade(cape, x, box.cx), edge);
    if (kind === 'butterfly') {
      p.disc(box.cx - 16, box.shoulder + 10, 6, lighten(color, 0.35));
      p.disc(box.cx + 16, box.shoulder + 10, 6, lighten(color, 0.35));
      p.disc(box.cx - 16, box.shoulder + 8, 2, '#fff6ea');
      p.disc(box.cx + 16, box.shoulder + 8, 2, '#fff6ea');
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
      for (const y of [box.waist + 6, box.waist + 12, hem - 4]) {
        p.rect(box.cx - 16, y, 32, 2, lighten(color, 0.32));
      }
    }
    drawExtras(p, box, color, kind, extras);
    return;
  }
  if (kind === 'mermaid') {
    bodice(p, box, 'sequins', color);
    const edge = edgeOf(color);
    const paint = (x: number, y: number) => paintCloth('sequins', color, x, y, box.cx);
    p.trap(box.waist, hem - 8, box.cx - 8, box.cx + 8, box.cx - 5, box.cx + 5, paint, edge);
    p.trap(hem - 8, hem, box.cx - 5, box.cx + 5, box.cx - 14, box.cx + 14, paint, edge);
    drawExtras(p, box, color, kind, extras);
    return;
  }
  if (kind === 'kimono') {
    const edge = edgeOf(color);
    const paint = (x: number, y: number) => paintCloth(cloth, color, x, y, box.cx);
    sleeves(p, box, cloth, color, 12, false);
    p.trap(box.shoulder, hem, box.cx - 14, box.cx + 14, box.cx - 16, box.cx + 16, paint, edge);
    p.trap(box.shoulder + 2, hem - 2, box.cx - 2, box.cx + 2, box.cx - 3, box.cx + 3, () => lighten(color, 0.2), edge);
    p.rect(box.cx - 8, box.waist - 1, 16, 3, '#c23b4b');
    p.rect(box.cx - 8, box.waist, 16, 1, '#f2c14e');
    for (let i = 0; i < 5; i++) rose(p, box.cx - 12 + i * 5, box.shoulder + 8 + (i % 2) * 8);
    drawExtras(p, box, color, kind, extras);
    return;
  }
  if (kind === 'princess') {
    sleeves(p, box, cloth, color, 8, true);
    bodice(p, box, cloth, color, 3);
    skirt(p, box, 'tulle', color, hem, 20, 8);
    skirt(p, box, cloth, darken(color, 0.05), hem - 2, 14, 7);
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
    for (let i = 0; i < 10; i++) star(p, box.cx - 12 + ((i * 5) % 24), box.waist + 4 + ((i * 3) % (hem - box.waist - 6)));
  } else if (kind === 'ice') {
    bodice(p, box, 'solid', '#d7eef2');
    skirt(p, box, 'solid', '#e7f6f8', hem, flare, 8);
    for (let i = 0; i < 6; i++) {
      const x = box.cx - 10 + i * 4;
      const y = box.waist + 6 + (i % 3) * 5;
      p.set(x, y, '#ffffff');
      p.set(x, y - 1, '#b9e4ea');
      p.set(x - 1, y, '#b9e4ea');
      p.set(x + 1, y, '#b9e4ea');
    }
  } else if (kind === 'roses' || kind === 'ball' || kind === 'peacock' || kind === 'butterfly' || kind === 'cape') {
    bodice(p, box, cloth, color, kind === 'ball' ? 6 : 4);
    skirt(p, box, kind === 'ball' ? 'tulle' : cloth, color, hem, kind === 'peacock' ? 22 : flare, 8);
    if (kind === 'ball') {
      skirt(p, box, 'tulle', lighten(color, 0.18), hem + 1, flare + 2, 10);
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
  drawExtras(p, box, color, kind, extras);
}

function drawExtras(p: Pix, box: Box, color: string, kind: Sil, extras: AccessoryId[]): void {
  if (extras.includes('buttons') && kind !== 'coat' && kind !== 'jacket') buttons(p, box, 3);
  if (extras.includes('belt')) {
    p.rect(box.cx - 9, box.waist - 1, 18, 3, '#f2c14e');
    p.rect(box.cx - 1, box.waist - 1, 3, 3, '#a67c3a');
  }
  if (extras.includes('bow')) {
    const y = box.shoulder + 1;
    const bow = mix(color, '#e56b93', 0.45);
    p.disc(box.cx - 3, y, 2, bow);
    p.disc(box.cx + 3, y, 2, bow);
    p.set(box.cx, y, edgeOf(bow));
  }
  if (extras.includes('sequins')) {
    for (let i = 0; i < 8; i++) p.set(box.cx - 10 + ((i * 3) % 20), box.waist + 2 + ((i * 5) % 12), '#fff6d0');
  }
  if (extras.includes('bag')) {
    p.rect(box.cx + 12, box.waist + 2, 6, 5, '#f2c14e');
    p.rect(box.cx + 14, box.waist, 2, 3, '#a67c3a');
  }
}

function hairBack(p: Pix, look: PersonLook, bob = 0): void {
  const c = look.hairColor;
  const edge = edgeOf(c);
  const hi = lighten(c, 0.28);
  const y = 18 + bob;
  if (look.hair === 'puffs') {
    p.disc(16, y + 6, 8, c);
    p.disc(48, y + 6, 8, c);
    p.disc(14, y + 3, 3, hi);
    p.disc(46, y + 3, 3, hi);
    p.ellipse(32, y, 16, 12, c, edge);
  } else if (look.hair === 'bob') {
    p.ellipse(32, y + 8, 18, 16, c, edge);
    p.rect(18, y + 4, 28, 3, hi);
  } else if (look.hair === 'curls') {
    for (const [x, yy] of [
      [16, y],
      [24, y - 4],
      [32, y - 6],
      [40, y - 4],
      [48, y],
      [14, y + 8],
      [50, y + 8],
    ] as const) {
      p.disc(x, yy, 5, c);
    }
    p.disc(28, y - 8, 2, hi);
  } else if (look.hair === 'bun') {
    p.ellipse(32, y, 15, 11, c, edge);
    p.disc(32, y - 12, 6, c);
    p.disc(30, y - 14, 2, hi);
  } else if (look.hair === 'crop') {
    p.ellipse(32, y + 2, 15, 10, c, edge);
    p.rect(22, y - 2, 16, 2, hi);
  } else if (look.hair === 'locs') {
    p.ellipse(32, y, 15, 11, c, edge);
    for (const x of [18, 24, 30, 36, 42, 48]) {
      p.rect(x, y + 6, 3, 16 + (x % 5), c);
      p.set(x + 1, y + 6, hi);
    }
  } else if (look.hair === 'waves') {
    p.ellipse(32, y + 4, 18, 14, c, edge);
    p.trap(y + 8, y + 36, 16, 22, 14, 20, () => c, edge);
    p.trap(y + 8, y + 34, 42, 48, 44, 50, () => c, edge);
    p.rect(22, y, 18, 2, hi);
  } else if (look.hair === 'braid') {
    p.ellipse(32, y, 15, 11, c, edge);
    for (let i = 0; i < 7; i++) p.disc(22 + (i % 2) * 3, y + 10 + i * 4, 3, i % 2 ? darken(c, 0.1) : c);
  } else if (look.hair === 'pony') {
    p.ellipse(32, y, 15, 11, c, edge);
    p.trap(y - 2, y + 28, 40, 46, 44, 52, () => c, edge);
    p.disc(46, y + 28, 3, c);
    p.rect(34, y - 4, 8, 2, hi);
  } else if (look.hair === 'hijab') {
    p.ellipse(32, y + 6, 20, 18, c, edge);
    p.trap(y + 10, y + 28, 14, 50, 18, 46, () => c, edge);
    p.rect(20, y - 2, 20, 3, hi);
  }
}

function hairFront(p: Pix, look: PersonLook, bob = 0): void {
  const c = look.hairColor;
  const edge = edgeOf(c);
  const y = 16 + bob;
  if (look.hair === 'hijab') {
    p.trap(y, y + 6, 18, 46, 22, 42, () => c, edge);
    return;
  }
  if (look.hair === 'bob' || look.hair === 'waves' || look.hair === 'puffs') {
    p.trap(y, y + 4, 20, 44, 22, 42, () => c, edge);
  } else if (look.hair === 'curls') {
    p.disc(22, y + 2, 3, c);
    p.disc(32, y - 1, 3, c);
    p.disc(42, y + 2, 3, c);
  } else if (look.hair === 'crop' || look.hair === 'bun' || look.hair === 'pony' || look.hair === 'locs' || look.hair === 'braid') {
    p.trap(y, y + 4, 20, 44, 22, 42, () => c, edge);
  }
  if (look.beret) {
    p.ellipse(36, y - 6, 10, 4, '#3a241c', '#24160f');
    p.rect(28, y - 4, 16, 2, '#3a241c');
    p.set(40, y - 8, '#f2c14e');
  }
}

type EyeMode = 'open' | 'blink' | 'joy';

function drawEye(p: Pix, x: number, y: number, iris: string, mode: EyeMode): void {
  const line = edgeOf(iris);
  if (mode === 'blink') {
    p.rect(x, y + 2, 7, 1, line);
    return;
  }
  if (mode === 'joy') {
    p.set(x, y + 2, line);
    p.set(x + 1, y + 1, line);
    p.set(x + 2, y + 1, line);
    p.set(x + 3, y + 1, line);
    p.set(x + 4, y + 1, line);
    p.set(x + 5, y + 1, line);
    p.set(x + 6, y + 2, line);
    return;
  }
  const white = '#fffdf8';
  const hi = '#ffffff';
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      const inside = row > 0 && row < 4 && col > 0 && col < 6;
      p.set(x + col, y + row, inside ? iris : white);
    }
  }
  p.set(x, y, white);
  p.set(x + 6, y, white);
  p.set(x, y + 4, white);
  p.set(x + 6, y + 4, white);
  p.set(x + 2, y + 1, hi);
  p.set(x + 4, y + 2, hi);
  p.set(x + 3, y + 2, hi);
}

function drawFace(p: Pix, look: PersonLook, mode: EyeMode, bob: number, mouth: 'happy' | 'soft' | 'flat' | 'down' = 'soft'): void {
  const y = 27 + bob;
  const iris = IRISES[look.hair.length % IRISES.length];
  drawEye(p, 20, y, iris, mode);
  drawEye(p, 37, y, iris, mode);
  const blush = look.blush ?? '#f3b0b8';
  p.rect(16, y + 6, 3, 2, blush);
  p.rect(45, y + 6, 3, 2, blush);
  const lip = '#d26478';
  if (mouth === 'happy' || mode === 'joy') {
    p.set(29, y + 10, lip);
    p.set(30, y + 11, lip);
    p.set(31, y + 11, lip);
    p.set(32, y + 11, lip);
    p.set(33, y + 11, lip);
    p.set(34, y + 10, lip);
    p.set(31, y + 10, '#fff');
  } else if (mouth === 'down') {
    p.set(30, y + 12, lip);
    p.set(31, y + 11, lip);
    p.set(32, y + 11, lip);
    p.set(33, y + 12, lip);
  } else if (mouth === 'flat') {
    p.set(30, y + 11, lip);
    p.set(31, y + 11, lip);
    p.set(32, y + 11, lip);
    p.set(33, y + 11, lip);
  } else {
    p.set(30, y + 10, lip);
    p.set(31, y + 11, lip);
    p.set(32, y + 11, lip);
    p.set(33, y + 10, lip);
  }
  if (look.freckles) {
    for (const [fx, fy] of [
      [18, y + 5],
      [21, y + 7],
      [43, y + 5],
      [46, y + 7],
    ] as const) {
      p.set(fx, fy, '#c48a62');
    }
  }
  if (look.glasses) {
    const g = '#6a5346';
    p.rect(19, y - 1, 9, 1, g);
    p.rect(19, y + 5, 9, 1, g);
    p.rect(19, y, 1, 5, g);
    p.rect(27, y, 1, 5, g);
    p.rect(36, y - 1, 9, 1, g);
    p.rect(36, y + 5, 9, 1, g);
    p.rect(36, y, 1, 5, g);
    p.rect(44, y, 1, 5, g);
    p.rect(28, y + 2, 8, 1, g);
  }
}

function drawBody(p: Pix, look: PersonLook, frame: number, longHem: boolean): void {
  const skin = look.skin;
  const edge = edgeOf(skin);
  const bob = frame % 2 === 0 ? 0 : -1;
  const step = [0, 1, 2, 1, 0, -1][frame] ?? 0;
  p.ellipse(32, 28 + bob, 14, 15, skin, edge);
  p.ellipse(18, 30 + bob, 3, 4, skin, edge);
  p.ellipse(46, 30 + bob, 3, 4, skin, edge);
  p.rect(28, 40 + bob, 8, 6, skin);
  p.ellipse(32, 54 + bob, 11, 10, skin, edge);
  const arm = (x: number, dy: number) => {
    p.rect(x, 46 + bob + dy, 6, 16, skin);
    p.disc(x + 2, 63 + bob + dy, 3, skin);
    p.set(x, 46 + bob + dy, edge);
    p.set(x + 5, 62 + bob + dy, edge);
  };
  arm(10, frame ? -step : 0);
  arm(48, frame ? step : 0);
  if (!longHem) {
    p.rect(24, 66 + bob, 6, 16 - Math.max(0, step), skin);
    p.rect(34, 66 + bob, 6, 16 - Math.max(0, -step), skin);
    p.ellipse(27, 84 + bob - Math.max(0, step), 4, 3, skin, edge);
    p.ellipse(37, 84 + bob - Math.max(0, -step), 4, 3, skin, edge);
  }
}

function street(p: Pix, look: PersonLook, bob: number): void {
  const top = look.streetTop ?? '#e23b6a';
  const bottom = look.streetBottom ?? '#5c3a4a';
  const box: Box = { cx: 32, shoulder: 46 + bob, waist: 62 + bob, hem: 84 + bob, scale: 1 };
  if (look.streetKind === 'separates') {
    bodice(p, box, 'solid', top, 4);
    const edge = edgeOf(bottom);
    const paint = (x: number) => shade(bottom, x, 32);
    p.trap(box.waist, box.hem, 24, 30, 22, 30, paint, edge);
    p.trap(box.waist, box.hem, 34, 40, 34, 42, paint, edge);
  } else {
    bodice(p, box, 'solid', top);
    skirt(p, box, 'solid', top, box.hem, 12, 8);
  }
  if (!look.streetKind || look.streetKind === 'dress') {
    p.ellipse(27, 88 + bob, 5, 3, bottom, edgeOf(bottom));
    p.ellipse(37, 88 + bob, 5, 3, bottom, edgeOf(bottom));
  } else {
    p.ellipse(26, 88 + bob, 5, 3, darken(bottom, 0.1), edgeOf(bottom));
    p.ellipse(38, 88 + bob, 5, 3, darken(bottom, 0.1), edgeOf(bottom));
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

function renderFrame(look: PersonLook, outfit: Outfit | null | undefined, frame: number, eye: EyeMode, mouth: 'happy' | 'soft' | 'flat' | 'down' = 'soft'): Pix {
  const p = new Pix(W, H);
  const bob = frame % 2 === 0 ? 0 : -1;
  const longHem = Boolean(outfit && LONG.has(outfit.sketchId));
  hairBack(p, look, bob);
  drawBody(p, look, outfit ? frame : 0, longHem);
  if (outfit) {
    const hem = longHem ? 92 + bob : outfit.sketchId === 'candy-party' || outfit.sketchId === 'sunny-dress' ? 82 + bob : 86 + bob;
    drawGarment(
      p,
      outfit.sketchId,
      outfit.pattern,
      outfit.color,
      { cx: 32, shoulder: 46 + bob, waist: 60 + bob, hem, scale: 1 },
      outfit.accessories,
    );
    if (outfit.accessories.includes('shoes') && !longHem) {
      p.ellipse(26, 90 + bob, 5, 3, outfit.color, edgeOf(outfit.color));
      p.ellipse(38, 90 + bob, 5, 3, outfit.color, edgeOf(outfit.color));
    }
    if (outfit.accessories.includes('hat') && look.hair !== 'hijab') {
      p.ellipse(32, 12 + bob, 10, 4, '#3a241c', '#24160f');
      p.set(38, 10 + bob, '#f2c14e');
    }
  } else {
    street(p, look, bob);
  }
  hairFront(p, look, bob);
  drawFace(p, look, eye, bob, mouth);
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
    main = cachedPng(`walk:${keyBase}`, () => {
      const framesPix = [0, 1, 2, 3, 4, 5].map((frame) => renderFrame(opts.look, opts.outfit, frame, 'open'));
      const sheet = new Pix(W * 6, H);
      framesPix.forEach((frame, index) => sheet.blit(frame, index * W, 0));
      return sheet;
    });
  } else {
    main = cachedPng(`still:${pose}:${mouth}:${keyBase}`, () => renderFrame(opts.look, opts.outfit, 0, eye, mouth));
    if (!joy && pose !== 'frown') blink = cachedPng(`blink:${keyBase}`, () => renderFrame(opts.look, opts.outfit, 0, 'blink', mouth));
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
  return { cx: 40, shoulder: 36, waist: 54, hem: long ? 108 : kind === 'twirl' ? 96 : 90, scale: 1 };
}

export function dressFormURL(
  outfit: Pick<Outfit, 'sketchId' | 'pattern' | 'color' | 'accessories'> | null,
  mode: 'fashion' | 'paper' | 'bare' | 'sketch',
): string {
  const key = JSON.stringify({ outfit, mode });
  return cachedPng(`form:${key}`, () => {
    const p = new Pix(80, 128);
    p.rect(0, 0, 80, 128, mode === 'sketch' ? '#f7f1e4' : '#fff9f4');
    p.rect(38, 78, 4, 36, '#e4d5c8');
    p.ellipse(40, 116, 16, 5, '#8d5a3c', '#6a3e2c');
    p.ellipse(40, 46, 14, 18, '#f6e2d4', '#e2cbb8');
    p.ellipse(40, 30, 8, 9, '#f3d7c6', '#e0c4ae');
    p.rect(36, 38, 8, 6, '#f3d7c6');
    if (outfit && mode !== 'bare') {
      const paper = mode === 'paper' || mode === 'sketch';
      const color = paper ? '#f4e4d4' : outfit.color;
      const pattern: FabricId = paper ? 'solid' : outfit.pattern;
      drawGarment(p, outfit.sketchId, pattern, color, formBox(silhouette(outfit.sketchId)), paper ? [] : outfit.accessories);
      if (paper) {
        for (let y = 40; y < 100; y += 4) p.set(40, y, '#e7a0b0');
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
  return cachedPng('pip', () => {
    const p = new Pix(32, 32);
    p.disc(16, 18, 10, '#e25b4a');
    p.disc(16, 18, 10, '#e25b4a');
    p.ellipse(16, 16, 9, 8, '#e25b4a', '#a33b32');
    p.rect(14, 6, 4, 5, '#3e8f62');
    p.disc(16, 6, 3, '#5aaa72');
    p.set(15, 5, '#d7f0c8');
    drawEye(p, 8, 14, '#5c3a32', 'open');
    drawEye(p, 17, 14, '#5c3a32', 'open');
    p.set(14, 22, '#fff');
    p.set(15, 23, '#c4475c');
    p.set(16, 23, '#c4475c');
    p.set(17, 22, '#fff');
    p.rect(8, 20, 2, 1, '#f3b0b8');
    p.rect(22, 20, 2, 1, '#f3b0b8');
    return p;
  });
}

export function fanURL(skin: string, hair: string, shirt: string): string {
  return cachedPng(`fan:${skin}:${hair}:${shirt}`, () => {
    const p = new Pix(24, 32);
    p.ellipse(12, 10, 7, 7, skin, edgeOf(skin));
    p.ellipse(12, 6, 8, 5, hair, edgeOf(hair));
    p.rect(8, 4, 8, 2, lighten(hair, 0.25));
    drawEye(p, 6, 9, '#5c3a32', 'open');
    drawEye(p, 13, 9, '#5c3a32', 'open');
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
    drawEye(p, 8, 13, '#5c3a32', 'open');
    drawEye(p, 15, 13, '#5c3a32', 'joy');
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
