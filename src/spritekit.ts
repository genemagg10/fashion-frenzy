import type { FabricId, SketchId } from './types';

const BASE = import.meta.env.BASE_URL || './';

const images = new Map<string, HTMLImageElement>();
const tinted = new Map<string, string>();
const tiles = new Map<string, HTMLCanvasElement>();

export type BustExpr = 'happy' | 'love' | 'thinking' | 'disappointed';
export type PipExpr = 'happy' | 'love' | 'thinking' | 'disappointed' | 'surprised' | 'cheer';

export function spriteUrl(file: string): string {
  const clean = file.replace(/^sprites\//, '').replace(/\.png$/, '.webp');
  return `${BASE}sprites/${clean}`;
}

function pngUrl(file: string): string {
  const clean = file.replace(/^sprites\//, '');
  return `${BASE}sprites/${clean}`;
}

function loadOne(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

export function loadSprite(file: string): Promise<HTMLImageElement> {
  const key = file.replace(/\.png$/, '');
  const hit = images.get(key);
  if (hit) return Promise.resolve(hit);
  const webp = spriteUrl(file);
  const png = pngUrl(file.endsWith('.png') ? file : `${file}.png`);
  return loadOne(webp)
    .catch(() => loadOne(png))
    .then((img) => {
      images.set(key, img);
      return img;
    });
}

export function peekSprite(file: string): HTMLImageElement | undefined {
  return images.get(file.replace(/\.png$/, '').replace(/\.webp$/, ''));
}

export async function preload(files: string[]): Promise<void> {
  await Promise.all(files.map((file) => loadSprite(file).catch(() => undefined)));
}

export function modelSignature(id: SketchId | string): string {
  return spriteUrl(`sprites/models/signature/${id}.png`);
}

export function customerFull(id: string): string {
  return spriteUrl(`sprites/customers/full/${id}.png`);
}

export function customerBust(id: string, expr: BustExpr): string {
  return spriteUrl(`sprites/customers/bust/${id}-${expr}.png`);
}

export function pipSprite(expr: PipExpr): string {
  return spriteUrl(`sprites/pip/pip-${expr}.png`);
}

export function garmentArt(id: string): string {
  return spriteUrl(`sprites/garments/${id}.png`);
}

export function propArt(name: string): string {
  return spriteUrl(`sprites/props/${name}.png`);
}

export function runwayArt(name: string): string {
  return spriteUrl(`sprites/runway/${name}.png`);
}

export function sewForm(step: 'empty' | 'draped' | 'pattern' | 'half' | 'finished'): string {
  const file = {
    empty: 'form-empty',
    draped: 'form-draped-pinned',
    pattern: 'form-pattern-pinned',
    half: 'form-half-sewn',
    finished: 'form-finished-simple',
  }[step];
  return spriteUrl(`sprites/forms/${file}.png`);
}

function patternTile(pattern: FabricId, hex: string): HTMLCanvasElement {
  const key = `${pattern}:${hex}`;
  const cached = tiles.get(key);
  if (cached) return cached;
  const c = document.createElement('canvas');
  c.width = 28;
  c.height = 28;
  const g = c.getContext('2d');
  if (!g) return c;
  g.clearRect(0, 0, 28, 28);
  g.globalAlpha = 1;
  if (pattern === 'stripes') {
    g.fillStyle = 'rgba(255,255,255,.75)';
    for (let x = 0; x < 28; x += 8) g.fillRect(x, 0, 3, 28);
  } else if (pattern === 'polka') {
    g.fillStyle = 'rgba(255,255,255,.8)';
    for (let y = 4; y < 28; y += 10) for (let x = 4; x < 28; x += 10) g.beginPath(), g.arc(x, y, 2.2, 0, Math.PI * 2), g.fill();
  } else if (pattern === 'floral') {
    g.fillStyle = '#e56b93';
    for (const [x, y] of [[8, 8], [20, 18]]) {
      g.beginPath();
      g.arc(x, y, 3, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = '#3e8f62';
    g.fillRect(8, 12, 2, 4);
  } else if (pattern === 'denim') {
    g.strokeStyle = 'rgba(20,40,80,.45)';
    g.lineWidth = 1;
    for (let i = -28; i < 56; i += 5) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i + 28, 28);
      g.stroke();
    }
  } else if (pattern === 'sequins') {
    const star = (sx: number, sy: number) => {
      g.beginPath();
      g.moveTo(sx, sy - 3.2);
      g.lineTo(sx + 0.8, sy - 0.8);
      g.lineTo(sx + 3.2, sy);
      g.lineTo(sx + 0.8, sy + 0.8);
      g.lineTo(sx, sy + 3.2);
      g.lineTo(sx - 0.8, sy + 0.8);
      g.lineTo(sx - 3.2, sy);
      g.lineTo(sx - 0.8, sy - 0.8);
      g.closePath();
      g.fill();
    };
    g.fillStyle = 'rgba(255, 236, 160, 0.95)';
    star(8, 8);
    star(20, 18);
    g.fillStyle = 'rgba(255, 255, 255, 0.9)';
    star(18, 6);
    star(7, 20);
  } else if (pattern === 'velvet') {
    g.fillStyle = 'rgba(255,255,255,.28)';
    g.fillRect(0, 0, 28, 8);
  } else if (pattern === 'tulle') {
    g.strokeStyle = 'rgba(255,255,255,.55)';
    for (let y = 2; y < 28; y += 4) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(28, y);
      g.stroke();
    }
  } else if (pattern === 'rainbow') {
    const hues = ['#ff8fab', '#ffd166', '#80ed99', '#4cc9f0', '#c9a6e0'];
    hues.forEach((h, i) => {
      g.fillStyle = h;
      g.fillRect(i * 6, 0, 6, 28);
    });
  }
  void hex;
  tiles.set(key, c);
  return c;
}

export function tintedSprite(kind: 'model' | 'form' | 'garment', id: string, hex: string, pattern: FabricId | null): string {
  const folder = kind === 'model' ? 'models/tint' : kind === 'form' ? 'forms' : 'garments';
  const baseFile = `sprites/${folder}/${id}.png`;
  const maskFile = `sprites/${folder}/${id}.mask.png`;
  const color = hex || '#f4e4d4';
  const key = `${kind}|${id}|${color}|${pattern ?? 'solid'}`;
  const hit = tinted.get(key);
  if (hit) return hit;
  const base = peekSprite(baseFile);
  const mask = peekSprite(maskFile);
  if (!base || !mask) return spriteUrl(baseFile);
  const c = document.createElement('canvas');
  c.width = base.width;
  c.height = base.height;
  const x = c.getContext('2d');
  if (!x) return spriteUrl(baseFile);
  x.imageSmoothingEnabled = true;
  x.drawImage(base, 0, 0);
  x.globalCompositeOperation = 'multiply';
  x.fillStyle = color;
  x.fillRect(0, 0, c.width, c.height);
  if (pattern && pattern !== 'solid') {
    x.globalCompositeOperation = 'source-atop';
    x.globalAlpha = pattern === 'sequins' || pattern === 'rainbow' ? 0.82 : 0.42;
    const tile = patternTile(pattern, color);
    const pat = x.createPattern(tile, 'repeat');
    if (pat) {
      x.fillStyle = pat;
      x.fillRect(0, 0, c.width, c.height);
    }
    x.globalAlpha = 1;
  }
  x.globalCompositeOperation = 'destination-in';
  x.drawImage(mask, 0, 0);
  const out = document.createElement('canvas');
  out.width = c.width;
  out.height = c.height;
  const y = out.getContext('2d');
  if (!y) return spriteUrl(baseFile);
  y.imageSmoothingEnabled = true;
  y.drawImage(base, 0, 0);
  y.drawImage(c, 0, 0);
  const url = out.toDataURL('image/png');
  tinted.set(key, url);
  return url;
}

export function swatchURL(pattern: FabricId, hex: string): string {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const g = c.getContext('2d');
  if (!g) return '';
  g.fillStyle = hex;
  g.fillRect(0, 0, 32, 32);
  if (pattern !== 'solid') g.drawImage(patternTile(pattern, hex), 2, 2);
  return c.toDataURL('image/png');
}

export function trimURL(id: string): string {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const g = c.getContext('2d');
  if (!g) return '';
  g.fillStyle = '#fff4ea';
  g.fillRect(0, 0, 32, 32);
  g.fillStyle = '#e56b93';
  if (id === 'bow') {
    g.beginPath();
    g.arc(10, 16, 6, 0, Math.PI * 2);
    g.arc(22, 16, 6, 0, Math.PI * 2);
    g.fill();
  } else if (id === 'buttons') {
    g.fillStyle = '#f2c14e';
    for (const y of [8, 16, 24]) g.beginPath(), g.arc(16, y, 3, 0, Math.PI * 2), g.fill();
  } else if (id === 'belt') {
    g.fillStyle = '#f2c14e';
    g.fillRect(4, 13, 24, 6);
  } else if (id === 'hat') {
    g.fillStyle = '#3a241c';
    g.beginPath();
    g.ellipse(16, 18, 10, 5, 0, 0, Math.PI * 2);
    g.fill();
  } else if (id === 'bag') {
    g.fillStyle = '#e7a05a';
    g.fillRect(8, 12, 16, 12);
  } else if (id === 'shoes') {
    g.fillStyle = '#c23b4b';
    g.beginPath();
    g.ellipse(11, 20, 6, 3, 0, 0, Math.PI * 2);
    g.ellipse(21, 20, 6, 3, 0, 0, Math.PI * 2);
    g.fill();
  } else {
    g.fillStyle = '#fff6d0';
    for (const [x, y] of [[8, 10], [20, 16], [12, 22]] as const) {
      g.beginPath();
      g.arc(x, y, 2, 0, Math.PI * 2);
      g.fill();
    }
  }
  return c.toDataURL('image/png');
}

export function puppyURL(): string {
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 36;
  const g = c.getContext('2d');
  if (!g) return '';
  g.fillStyle = '#e0a15c';
  g.beginPath();
  g.ellipse(16, 22, 12, 8, 0, 0, Math.PI * 2);
  g.ellipse(30, 20, 9, 8, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#3a241c';
  g.beginPath();
  g.arc(33, 18, 1.4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#e56b93';
  g.beginPath();
  g.arc(36, 22, 1.6, 0, Math.PI * 2);
  g.fill();
  return c.toDataURL('image/png');
}

export function decorArt(id: string): string {
  if (id === 'mirror') return propArt('mirror');
  if (id === 'flowers') return propArt('flowers-pot');
  if (id === 'chandelier' || id === 'lights') return propArt('sewing-machine');
  return propArt('fabric-bolts');
}

export function filesFor(scene: string, extra: string[] = []): string[] {
  const props = [
    'sprites/props/clothes-rack.png',
    'sprites/props/mirror.png',
    'sprites/props/flowers-pot.png',
    'sprites/props/plant-monstera.png',
    'sprites/props/fabric-bolts.png',
    'sprites/props/sewing-machine.png',
    'sprites/props/pincushion-kit.png',
  ];
  const pips = ['happy', 'love', 'thinking', 'disappointed', 'cheer', 'surprised'].map((e) => `sprites/pip/pip-${e}.png`);
  const sew = ['empty', 'draped-pinned', 'pattern-pinned', 'half-sewn', 'finished-simple'].map((s) => `sprites/forms/form-${s}.png`);
  if (scene === 'title' || scene === 'cover') {
    return ['sprites/models/signature/garden-gown.png', 'sprites/models/signature/sunny-dress.png', 'sprites/models/signature/ball-gown.png', ...pips];
  }
  if (scene === 'shop') return [...props, ...pips, ...extra];
  if (scene === 'sketch') return [...extra, ...pips];
  if (scene === 'studio') return [...sew, ...pips, ...extra];
  if (scene === 'reaction' || scene === 'reviews') return [...pips, ...extra];
  if (scene === 'runway' || scene === 'awards') {
    return [
      ...pips,
      'sprites/runway/photographer-stand.png',
      'sprites/runway/photographer-kneel.png',
      'sprites/runway/fx-flash.png',
      'sprites/runway/trophy.png',
      'sprites/runway/crowd-boy-cheer.png',
      'sprites/runway/crowd-boy-wave.png',
      'sprites/runway/crowd-dad-clap.png',
      'sprites/runway/crowd-girl-clap.png',
      'sprites/runway/crowd-girl-hearteyes.png',
      'sprites/runway/crowd-grandma.png',
      'sprites/runway/crowd-kid-lightstick.png',
      'sprites/runway/crowd-teen-phone.png',
      ...extra,
    ];
  }
  if (scene === 'gallery') {
    return extra;
  }
  return [...pips, ...extra];
}
