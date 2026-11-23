/** Keep every garment and person at its own aspect ratio, and report drifts. */

export interface AspectRow {
  name: string;
  rendered: number;
  natural: number;
  off: number;
}

const FIT = 'img.sprite, img.sketch-svg, img.puppy, img.fan, img.photog-sprite, img.pip-svg, img.title-model, img.reaction-bust, img.sprite-card, svg.dress-svg';

function ratioOf(el: Element): number | null {
  if (el instanceof SVGSVGElement) {
    const box = el.viewBox?.baseVal;
    if (box && box.width > 0 && box.height > 0) return box.width / box.height;
  }
  if (el instanceof SVGImageElement) {
    const w = el.width.baseVal.value;
    const h = el.height.baseVal.value;
    if (w > 0 && h > 0) return w / h;
  }
  if (el instanceof HTMLImageElement && el.naturalWidth > 0 && el.naturalHeight > 0) {
    return el.naturalWidth / el.naturalHeight;
  }
  return null;
}

function sizeOf(el: Element): { w: number; h: number } | null {
  if (el instanceof HTMLElement || el instanceof SVGSVGElement) {
    const box = el as HTMLElement;
    const w = box.offsetWidth;
    const h = box.offsetHeight;
    if (w >= 8 && h >= 8) return { w, h };
  }
  const rect = el.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return null;
  return { w: rect.width, h: rect.height };
}

function labelOf(el: Element): string {
  if (el instanceof HTMLImageElement) {
    const src = el.currentSrc || el.getAttribute('src') || '';
    const file = src.split('/').pop()?.split('?')[0] || el.className;
    return `${el.className.toString().trim()} ${file}`.trim();
  }
  const cls = el.getAttribute('class') || el.tagName.toLowerCase();
  return cls.trim();
}

export function fitKeptRatios(root: ParentNode = document): void {
  const nodes = [...root.querySelectorAll<HTMLElement>(FIT)];
  for (const el of nodes) {
    if (el.classList.contains('shop-customer')) continue;
    if (el.dataset.lockSize === '1') continue;
    el.style.width = '';
    el.style.height = '';
  }
  for (const el of nodes) {
    if (el.classList.contains('shop-customer')) continue;
    const natural = ratioOf(el);
    const box = sizeOf(el);
    if (!natural || !box) continue;
    const rendered = box.w / box.h;
    if (Math.abs(rendered / natural - 1) <= 0.02) continue;
    let w = box.w;
    let h = box.h;
    if (rendered > natural) w = h * natural;
    else h = w / natural;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.dataset.lockSize = '1';
  }
}

export function auditAspect(root: ParentNode = document): { ok: boolean; rows: AspectRow[] } {
  const nodes = [
    ...root.querySelectorAll('img.sprite, img.sketch-svg, img.puppy, img.shop-customer, img.fan, img.photog-sprite, img.pip-svg, img.title-model, img.reaction-bust, img.sprite-card, svg.dress-svg, svg.dress-svg image'),
  ];
  const rows: AspectRow[] = [];
  for (const el of nodes) {
    const natural = ratioOf(el);
    const box = sizeOf(el);
    if (!natural || !box) continue;
    const rendered = box.w / box.h;
    const off = Math.abs(rendered / natural - 1);
    rows.push({ name: labelOf(el), rendered: round(rendered), natural: round(natural), off: round(off) });
  }
  return { ok: rows.every((row) => row.off <= 0.02), rows };
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function installAspectWatch(): void {
  const win = window as Window & { __ffAspect?: () => { ok: boolean; rows: AspectRow[] } };
  const run = () => {
    document.querySelectorAll<HTMLElement>('[data-lock-size]').forEach((el) => {
      if (!el.classList.contains('shop-customer')) delete el.dataset.lockSize;
    });
    fitKeptRatios(document);
    const report = auditAspect(document);
    win.__ffAspect = () => auditAspect(document);
    const debug = new URLSearchParams(location.search).has('debug') && location.search.includes('aspect');
    let note = document.getElementById('aspect-debug');
    if (!debug) {
      note?.remove();
      return;
    }
    if (!note) {
      note = document.createElement('pre');
      note.id = 'aspect-debug';
      note.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:80;max-width:90vw;max-height:40vh;overflow:auto;background:#2a211c;color:#fff9f4;font:12px/1.4 ui-monospace,monospace;padding:8px 10px;border-radius:12px;margin:0';
      document.body.appendChild(note);
    }
    const bad = report.rows.filter((row) => row.off > 0.02);
    note.textContent = report.ok
      ? `aspect ok (${report.rows.length})`
      : bad.map((row) => `${row.name} off ${Math.round(row.off * 100)}%`).join('\n');
  };
  win.__ffAspect = () => auditAspect(document);
  window.addEventListener('resize', run);
  window.addEventListener('load', run);
  const app = document.getElementById('app');
  if (app) new ResizeObserver(run).observe(app);
  requestAnimationFrame(run);
}
