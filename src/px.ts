import { hexToRgb, rgbToHex } from './color';

export class Pix {
  readonly w: number;
  readonly h: number;
  private d: Uint8ClampedArray;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.d = new Uint8ClampedArray(w * h * 4);
  }

  set(x: number, y: number, color: string | null | undefined): void {
    if (!color) return;
    const px = x | 0;
    const py = y | 0;
    if (px < 0 || py < 0 || px >= this.w || py >= this.h) return;
    const [r, g, b] = hexToRgb(color);
    const i = (py * this.w + px) * 4;
    this.d[i] = r;
    this.d[i + 1] = g;
    this.d[i + 2] = b;
    this.d[i + 3] = 255;
  }

  has(x: number, y: number): boolean {
    const px = x | 0;
    const py = y | 0;
    if (px < 0 || py < 0 || px >= this.w || py >= this.h) return false;
    return this.d[(py * this.w + px) * 4 + 3] > 0;
  }

  rect(x: number, y: number, w: number, h: number, color: string): void {
    for (let yy = y | 0; yy < y + h; yy++) {
      for (let xx = x | 0; xx < x + w; xx++) this.set(xx, yy, color);
    }
  }

  disc(cx: number, cy: number, r: number, color: string): void {
    const rad = Math.ceil(r);
    for (let y = -rad; y <= rad; y++) {
      for (let x = -rad; x <= rad; x++) {
        if (x * x + y * y <= r * r) this.set(cx + x, cy + y, color);
      }
    }
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, fill: string, edge?: string): void {
    const x0 = Math.floor(cx - rx - 1);
    const x1 = Math.ceil(cx + rx + 1);
    const y0 = Math.floor(cy - ry - 1);
    const y1 = Math.ceil(cy + ry + 1);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const n = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
        if (n <= 1) this.set(x, y, edge && n > 0.72 ? edge : fill);
      }
    }
  }

  /** Trapezoid from y0 to y1. Left/right are inclusive edges. Edge pixels use `edge`. */
  trap(
    y0: number,
    y1: number,
    x0L: number,
    x0R: number,
    x1L: number,
    x1R: number,
    paint: (x: number, y: number) => string,
    edge: string,
  ): void {
    const top = Math.ceil(Math.min(y0, y1));
    const bot = Math.floor(Math.max(y0, y1));
    const span = y1 - y0 || 1;
    for (let y = top; y <= bot; y++) {
      const t = (y - y0) / span;
      const left = x0L + (x1L - x0L) * t;
      const right = x0R + (x1R - x0R) * t;
      const a = Math.ceil(Math.min(left, right));
      const b = Math.floor(Math.max(left, right));
      for (let x = a; x <= b; x++) {
        const on = x === a || x === b || y === top || y === bot;
        this.set(x, y, on ? edge : paint(x, y));
      }
    }
  }

  blit(src: Pix, dx: number, dy: number): void {
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const i = (y * src.w + x) * 4;
        if (src.d[i + 3] === 0) continue;
        this.set(dx + x, dy + y, rgbToHex(src.d[i], src.d[i + 1], src.d[i + 2]));
      }
    }
  }

  url(): string {
    const canvas = document.createElement('canvas');
    canvas.width = this.w;
    canvas.height = this.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const image = ctx.createImageData(this.w, this.h);
    image.data.set(this.d);
    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL('image/png');
  }
}

const cache = new Map<string, string>();

export function cachedPng(key: string, draw: () => Pix): string {
  const hit = cache.get(key);
  if (hit) return hit;
  const url = draw().url();
  cache.set(key, url);
  return url;
}

export function sheetUrl(frames: Pix[]): string {
  const w = frames[0]?.w ?? 1;
  const h = frames[0]?.h ?? 1;
  const sheet = new Pix(w * frames.length, h);
  frames.forEach((frame, index) => sheet.blit(frame, index * w, 0));
  return sheet.url();
}
