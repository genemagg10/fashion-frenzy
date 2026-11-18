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

function luma(hex: string): number {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  if (!Number.isFinite(n)) return 0.5;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function patternTile(pattern: FabricId, hex: string): HTMLCanvasElement {
  const key = `${pattern}:${hex}`;
  const cached = tiles.get(key);
  if (cached) return cached;
  const c = document.createElement('canvas');
  c.width = 72;
  c.height = 72;
  const g = c.getContext('2d');
  if (!g) return c;
  g.clearRect(0, 0, 72, 72);
  const ink = luma(hex) > 0.62 ? 'rgba(42, 28, 24, 0.82)' : 'rgba(255, 255, 255, 0.92)';
  const accent = luma(hex) > 0.62 ? '#9a3048' : '#ffe08a';
  if (pattern === 'stripes') {
    g.fillStyle = ink;
    for (let x = 0; x < 72; x += 18) g.fillRect(x, 0, 8, 72);
  } else if (pattern === 'polka') {
    g.fillStyle = ink;
    for (let y = 10; y < 72; y += 24) for (let x = 10; x < 72; x += 24) {
      g.beginPath();
      g.arc(x, y, 6, 0, Math.PI * 2);
      g.fill();
    }
  } else if (pattern === 'floral') {
    for (const [x, y] of [[20, 22], [50, 46]] as const) {
      g.fillStyle = accent;
      g.beginPath();
      g.arc(x, y, 8, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = ink;
      g.beginPath();
      g.arc(x, y, 3, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = luma(hex) > 0.62 ? '#2f7a45' : '#b6f0c2';
      g.fillRect(x - 1, y + 6, 3, 8);
    }
  } else if (pattern === 'denim') {
    g.strokeStyle = ink;
    g.lineWidth = 3;
    for (let i = -72; i < 144; i += 12) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i + 72, 72);
      g.stroke();
    }
  } else if (pattern === 'sequins') {
    const star = (sx: number, sy: number, r: number) => {
      g.beginPath();
      g.moveTo(sx, sy - r);
      g.lineTo(sx + r * 0.28, sy - r * 0.28);
      g.lineTo(sx + r, sy);
      g.lineTo(sx + r * 0.28, sy + r * 0.28);
      g.lineTo(sx, sy + r);
      g.lineTo(sx - r * 0.28, sy + r * 0.28);
      g.lineTo(sx - r, sy);
      g.lineTo(sx - r * 0.28, sy - r * 0.28);
      g.closePath();
      g.fill();
    };
    g.fillStyle = '#ffe08a';
    star(18, 20, 9);
    star(50, 46, 10);
    g.fillStyle = '#fff';
    star(48, 16, 6);
    star(22, 50, 6);
  } else if (pattern === 'velvet') {
    g.fillStyle = luma(hex) > 0.62 ? 'rgba(42, 28, 24, 0.28)' : 'rgba(255,255,255,0.45)';
    g.fillRect(0, 0, 72, 26);
    g.fillStyle = ink;
    g.fillRect(0, 34, 72, 6);
  } else if (pattern === 'tulle') {
    g.strokeStyle = ink;
    g.lineWidth = 3;
    for (let y = 6; y < 72; y += 12) {
      g.beginPath();
      g.moveTo(0, y);
      g.quadraticCurveTo(36, y - 8, 72, y);
      g.stroke();
    }
  } else if (pattern === 'rainbow') {
    const hues = ['#ff5d8f', '#ffb703', '#5ecf7a', '#3aa0e0', '#b388ff'];
    hues.forEach((h, i) => {
      g.fillStyle = h;
      g.fillRect(i * 15, 0, 15, 72);
    });
  }
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
    x.globalAlpha = pattern === 'sequins' || pattern === 'rainbow' ? 0.92 : 0.78;
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
  c.width = 180;
  c.height = 120;
  const g = c.getContext('2d');
  if (!g) return '';
  g.imageSmoothingEnabled = true;
  g.fillStyle = hex || '#f4e4d4';
  g.fillRect(0, 0, 180, 120);
  if (pattern !== 'solid') {
    const pat = g.createPattern(patternTile(pattern, hex || '#f4e4d4'), 'repeat');
    if (pat) {
      g.fillStyle = pat;
      g.fillRect(0, 0, 180, 120);
    }
  }
  g.strokeStyle = luma(hex || '#f4e4d4') > 0.8 ? '#6b4332' : 'rgba(255,255,255,0.85)';
  g.lineWidth = 8;
  g.strokeRect(4, 4, 172, 112);
  return c.toDataURL('image/png');
}

const trimCache = new Map<string, string>();

function paintTrim(draw: (g: CanvasRenderingContext2D) => void): string {
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 160;
  const g = c.getContext('2d');
  if (!g) return '';
  g.imageSmoothingEnabled = true;
  g.lineJoin = 'round';
  g.lineCap = 'round';
  draw(g);
  return c.toDataURL('image/png');
}

function ribbonBow(g: CanvasRenderingContext2D): void {
  const ink = '#9a3d55';
  g.lineWidth = 7;
  g.strokeStyle = ink;
  g.fillStyle = '#f07aa3';
  g.beginPath();
  g.moveTo(80, 72);
  g.bezierCurveTo(18, 8, 4, 58, 28, 86);
  g.bezierCurveTo(8, 124, 46, 128, 80, 90);
  g.closePath();
  g.fill();
  g.stroke();
  g.beginPath();
  g.moveTo(80, 72);
  g.bezierCurveTo(142, 8, 156, 58, 132, 86);
  g.bezierCurveTo(152, 124, 114, 128, 80, 90);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = '#e05686';
  g.beginPath();
  g.moveTo(72, 92);
  g.lineTo(40, 150);
  g.quadraticCurveTo(58, 142, 66, 128);
  g.lineTo(80, 104);
  g.lineTo(94, 128);
  g.quadraticCurveTo(102, 142, 120, 150);
  g.lineTo(88, 92);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = '#c23b5a';
  g.beginPath();
  g.ellipse(80, 82, 16, 14, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)';
  g.beginPath();
  g.ellipse(48, 58, 14, 8, -0.7, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(112, 58, 14, 8, 0.7, 0, Math.PI * 2);
  g.fill();
}

export function trimURL(id: string): string {
  const hit = trimCache.get(id);
  if (hit) return hit;
  const url = paintTrim((g) => {
    const ink = '#8a5a48';
    g.lineWidth = 6;
    g.strokeStyle = ink;
    if (id === 'bow') {
      ribbonBow(g);
    } else if (id === 'buttons') {
      g.fillStyle = '#f7c3d4';
      g.beginPath();
      g.roundRect(36, 14, 88, 132, 28);
      g.fill();
      g.stroke();
      for (const y of [48, 80, 112]) {
        g.fillStyle = '#f6d56b';
        g.beginPath();
        g.arc(80, y, 16, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.strokeStyle = '#a67c3a';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(74, y - 6);
        g.lineTo(86, y + 6);
        g.moveTo(86, y - 6);
        g.lineTo(74, y + 6);
        g.stroke();
        g.strokeStyle = ink;
        g.lineWidth = 6;
      }
    } else if (id === 'shoes') {
      const shoe = (x: number) => {
        g.fillStyle = '#f07aa3';
        g.beginPath();
        g.moveTo(x + 8, 78);
        g.quadraticCurveTo(x + 10, 46, x + 36, 42);
        g.quadraticCurveTo(x + 62, 40, x + 70, 70);
        g.lineTo(x + 74, 108);
        g.quadraticCurveTo(x + 40, 122, x + 8, 108);
        g.closePath();
        g.fill();
        g.stroke();
        g.fillStyle = '#fff';
        g.fillRect(x + 6, 102, 70, 12);
        g.strokeRect(x + 6, 102, 70, 12);
        g.fillStyle = '#fff6d0';
        g.beginPath();
        g.ellipse(x + 36, 62, 8, 5, 0, 0, Math.PI * 2);
        g.fill();
      };
      shoe(6);
      shoe(78);
    } else if (id === 'belt') {
      g.fillStyle = '#e7a05a';
      g.beginPath();
      g.roundRect(14, 62, 132, 36, 16);
      g.fill();
      g.stroke();
      g.fillStyle = '#f6d56b';
      g.beginPath();
      g.roundRect(64, 54, 32, 52, 8);
      g.fill();
      g.stroke();
      g.strokeStyle = '#a67c3a';
      g.lineWidth = 3;
      g.strokeRect(74, 66, 12, 16);
    } else if (id === 'hat') {
      g.fillStyle = '#c23b4b';
      g.beginPath();
      g.ellipse(80, 108, 58, 16, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.beginPath();
      g.ellipse(80, 78, 40, 34, 0, Math.PI, 0);
      g.fill();
      g.stroke();
      g.fillStyle = 'rgba(255,255,255,.45)';
      g.beginPath();
      g.ellipse(66, 64, 10, 6, -0.4, 0, Math.PI * 2);
      g.fill();
    } else if (id === 'bag') {
      g.strokeStyle = '#a67c3a';
      g.lineWidth = 6;
      g.beginPath();
      g.arc(80, 58, 28, Math.PI, 0);
      g.stroke();
      g.fillStyle = '#e8943a';
      g.strokeStyle = ink;
      g.beginPath();
      g.roundRect(36, 62, 88, 72, 22);
      g.fill();
      g.stroke();
      g.fillStyle = '#f6d56b';
      g.beginPath();
      g.arc(80, 98, 8, 0, Math.PI * 2);
      g.fill();
    } else {
      g.fillStyle = '#f6d56b';
      const star = (x: number, y: number, r: number) => {
        g.beginPath();
        for (let i = 0; i < 8; i += 1) {
          const rad = i % 2 === 0 ? r : r * 0.4;
          const a = -Math.PI / 2 + (i * Math.PI) / 4;
          const px = x + Math.cos(a) * rad;
          const py = y + Math.sin(a) * rad;
          if (i === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.closePath();
        g.fill();
        g.stroke();
      };
      star(80, 70, 36);
      star(40, 118, 16);
      star(122, 112, 14);
    }
  });
  trimCache.set(id, url);
  return url;
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
