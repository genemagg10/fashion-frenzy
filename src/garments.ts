import { darken, lighten, mix } from './color';
import { garmentArt, sewForm, tintedSprite } from './spritekit';
import type { AccessoryId, FabricId, Outfit, SketchId } from './types';

export const FORM_VB = '0 0 400 640';

interface Pt {
  x: number;
  y: number;
}

interface Measure {
  cx: number;
  neckY: number;
  neckHW: number;
  neckDrop: number;
  shoulderY: number;
  shoulderHW: number;
  underY: number;
  underHW: number;
  bustY: number;
  bustHW: number;
  waistY: number;
  waistHW: number;
  hipY: number;
  hipHW: number;
  hemY: number;
  hemHW: number;
  hemRound: number;
}

interface Piece {
  d: string;
  role: 'back' | 'main' | 'sleeve' | 'skirt';
  side?: 1 | -1;
  sheer?: boolean;
}

const FORM: Record<string, Measure> = {
  'sunny-dress': m({
    neckY: 150,
    neckHW: 24,
    neckDrop: 22,
    shoulderY: 170,
    shoulderHW: 74,
    underY: 202,
    underHW: 50,
    bustY: 230,
    bustHW: 72,
    waistY: 286,
    waistHW: 46,
    hipY: 340,
    hipHW: 82,
    hemY: 468,
    hemHW: 128,
    hemRound: 14,
  }),
  'rain-coat': m({
    neckY: 148,
    neckHW: 22,
    neckDrop: 8,
    shoulderY: 170,
    shoulderHW: 98,
    underY: 206,
    underHW: 78,
    bustY: 228,
    bustHW: 90,
    waistY: 292,
    waistHW: 86,
    hipY: 360,
    hipHW: 96,
    hemY: 548,
    hemHW: 104,
    hemRound: 2,
  }),
  'twirl-set': m({
    neckY: 152,
    neckHW: 26,
    neckDrop: 18,
    shoulderY: 172,
    shoulderHW: 70,
    underY: 200,
    underHW: 48,
    bustY: 226,
    bustHW: 66,
    waistY: 278,
    waistHW: 48,
    hipY: 330,
    hipHW: 100,
    hemY: 430,
    hemHW: 150,
    hemRound: 18,
  }),
  'hero-cape': m({
    neckY: 150,
    neckHW: 22,
    neckDrop: 16,
    shoulderY: 170,
    shoulderHW: 70,
    underY: 200,
    underHW: 46,
    bustY: 228,
    bustHW: 64,
    waistY: 286,
    waistHW: 44,
    hipY: 340,
    hipHW: 70,
    hemY: 500,
    hemHW: 108,
    hemRound: 8,
  }),
  'garden-gown': m({
    neckY: 214,
    neckHW: 78,
    neckDrop: 8,
    shoulderY: 214,
    shoulderHW: 86,
    underY: 230,
    underHW: 74,
    bustY: 236,
    bustHW: 76,
    waistY: 292,
    waistHW: 44,
    hipY: 350,
    hipHW: 110,
    hemY: 552,
    hemHW: 168,
    hemRound: 20,
  }),
  'puff-pencil': m({
    neckY: 150,
    neckHW: 28,
    neckDrop: 16,
    shoulderY: 168,
    shoulderHW: 64,
    underY: 196,
    underHW: 48,
    bustY: 224,
    bustHW: 70,
    waistY: 280,
    waistHW: 44,
    hipY: 330,
    hipHW: 58,
    hemY: 500,
    hemHW: 40,
    hemRound: 4,
  }),
  palazzo: m({
    neckY: 152,
    neckHW: 30,
    neckDrop: 20,
    shoulderY: 172,
    shoulderHW: 72,
    underY: 200,
    underHW: 50,
    bustY: 226,
    bustHW: 68,
    waistY: 286,
    waistHW: 58,
    hipY: 330,
    hipHW: 70,
    hemY: 560,
    hemHW: 150,
    hemRound: 4,
  }),
  'crop-jacket': m({
    neckY: 154,
    neckHW: 24,
    neckDrop: 8,
    shoulderY: 174,
    shoulderHW: 84,
    underY: 206,
    underHW: 64,
    bustY: 230,
    bustHW: 80,
    waistY: 292,
    waistHW: 62,
    hipY: 348,
    hipHW: 88,
    hemY: 470,
    hemHW: 118,
    hemRound: 10,
  }),
  'pleat-parade': m({
    neckY: 152,
    neckHW: 28,
    neckDrop: 18,
    shoulderY: 172,
    shoulderHW: 68,
    underY: 200,
    underHW: 48,
    bustY: 224,
    bustHW: 66,
    waistY: 276,
    waistHW: 50,
    hipY: 340,
    hipHW: 92,
    hemY: 490,
    hemHW: 120,
    hemRound: 6,
  }),
  jumpsuit: m({
    neckY: 150,
    neckHW: 26,
    neckDrop: 26,
    shoulderY: 170,
    shoulderHW: 72,
    underY: 202,
    underHW: 48,
    bustY: 228,
    bustHW: 68,
    waistY: 292,
    waistHW: 50,
    hipY: 340,
    hipHW: 72,
    hemY: 560,
    hemHW: 140,
    hemRound: 4,
  }),
};

function m(partial: Omit<Measure, 'cx'>): Measure {
  return { cx: 200, ...partial };
}

function wornOf(src: Measure): Measure {
  const y = (v: number) => 150 + (v - 146) * 0.9;
  const h = (v: number) => v * 0.56;
  return {
    cx: 120,
    neckY: y(src.neckY),
    neckHW: h(src.neckHW),
    neckDrop: src.neckDrop * 0.62,
    shoulderY: y(src.shoulderY),
    shoulderHW: h(src.shoulderHW),
    underY: y(src.underY),
    underHW: h(src.underHW),
    bustY: y(src.bustY),
    bustHW: h(src.bustHW),
    waistY: y(src.waistY),
    waistHW: h(src.waistHW),
    hipY: y(src.hipY),
    hipHW: h(src.hipHW),
    hemY: y(src.hemY),
    hemHW: h(src.hemHW),
    hemRound: src.hemRound * 0.6,
  };
}

/** Hem heights on the body, so coats stop above the shoes and skirts stay skirts. */
const WORN_HEM: Partial<Record<SketchId, number>> = {
  'sunny-dress': 418,
  'rain-coat': 470,
  'twirl-set': 388,
  'hero-cape': 448,
  'garden-gown': 490,
  'puff-pencil': 452,
  palazzo: 468,
  'crop-jacket': 428,
  'pleat-parade': 422,
  jumpsuit: 468,
};

function fitWorn(id: SketchId, measure: Measure): Measure {
  const hem = WORN_HEM[id];
  return hem ? { ...measure, hemY: hem } : measure;
}

function smoothClosed(pts: Pt[]): string {
  const n = pts.length;
  if (n < 3) return '';
  const at = (i: number) => pts[(i + n) % n];
  let d = `M ${at(0).x.toFixed(1)} ${at(0).y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return `${d} Z`;
}

function smoothOpen(pts: Pt[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function flared(measure: Measure, opts?: { cropAt?: number; strap?: boolean }): string {
  const crop = opts?.cropAt;
  const side: Pt[] = [];
  side.push({ x: measure.cx + measure.neckHW, y: measure.neckY });
  if (opts?.strap !== false) {
    side.push({ x: measure.cx + measure.shoulderHW, y: measure.shoulderY });
    side.push({ x: measure.cx + measure.underHW, y: measure.underY });
  }
  side.push({ x: measure.cx + measure.bustHW, y: measure.bustY });
  const endY = crop ?? measure.hemY;
  const endHW = crop ? measure.waistHW + 6 : measure.hemHW;
  if (!crop || measure.waistY < crop) {
    side.push({ x: measure.cx + measure.waistHW, y: Math.min(measure.waistY, endY) });
  }
  if (!crop) {
    side.push({ x: measure.cx + measure.hipHW, y: measure.hipY });
    side.push({ x: measure.cx + endHW, y: endY });
  } else {
    side.push({ x: measure.cx + endHW, y: endY });
  }
  const left = [...side].reverse().map((p) => ({ x: measure.cx - (p.x - measure.cx), y: p.y }));
  const hemRound = crop ? 4 : measure.hemRound;
  const pts: Pt[] = [
    { x: measure.cx, y: measure.neckY + (crop ? Math.min(measure.neckDrop, 18) : measure.neckDrop) },
    ...side,
    { x: measure.cx, y: endY + hemRound },
    ...left,
  ];
  return smoothClosed(pts);
}

function circleSkirt(measure: Measure): string {
  const y = measure.waistY - 6;
  const hem = measure.hemY;
  const hw = measure.hemHW;
  const wHw = measure.waistHW;
  const mid = y + (hem - y) * 0.62;
  return smoothClosed([
    { x: measure.cx - wHw, y },
    { x: measure.cx - hw, y: mid },
    { x: measure.cx - hw * 0.94, y: hem },
    { x: measure.cx, y: hem + measure.hemRound },
    { x: measure.cx + hw * 0.94, y: hem },
    { x: measure.cx + hw, y: mid },
    { x: measure.cx + wHw, y },
    { x: measure.cx, y: y + 10 },
  ]);
}

function pencilSkirt(measure: Measure): string {
  const y = measure.waistY - 4;
  return smoothClosed([
    { x: measure.cx - measure.waistHW, y },
    { x: measure.cx - measure.hipHW, y: measure.hipY },
    { x: measure.cx - measure.hemHW, y: measure.hemY },
    { x: measure.cx, y: measure.hemY + 4 },
    { x: measure.cx + measure.hemHW, y: measure.hemY },
    { x: measure.cx + measure.hipHW, y: measure.hipY },
    { x: measure.cx + measure.waistHW, y },
    { x: measure.cx, y: y + 8 },
  ]);
}

function pantLeg(measure: Measure, dir: number): string {
  const crotch = measure.waistY + Math.min(54, (measure.hemY - measure.waistY) * 0.2);
  const inner = 12;
  const hemHalf = measure.hemHW * 0.48;
  return smoothClosed([
    { x: measure.cx + dir * (inner + 2), y: measure.waistY },
    { x: measure.cx + dir * measure.waistHW, y: measure.waistY + 2 },
    { x: measure.cx + dir * (inner + hemHalf), y: measure.hemY - 8 },
    { x: measure.cx + dir * (inner + hemHalf - 6), y: measure.hemY },
    { x: measure.cx + dir * (inner - 2), y: measure.hemY },
    { x: measure.cx + dir * 2, y: crotch },
  ]);
}

function longSleeve(measure: Measure, dir: number, length: number): string {
  const sx = measure.cx + dir * (measure.shoulderHW - 6);
  const sy = measure.shoulderY + 8;
  const reach = length * 0.34;
  const wx = sx + dir * reach;
  const wy = sy + length;
  return smoothClosed([
    { x: sx - dir * length * 0.22, y: sy - 10 },
    { x: sx + dir * length * 0.16, y: sy + length * 0.08 },
    { x: wx + dir * length * 0.06, y: wy },
    { x: wx - dir * length * 0.05, y: wy + length * 0.1 },
    { x: sx - dir * length * 0.02, y: sy + length * 0.28 },
  ]);
}

function puffSleeve(measure: Measure, dir: number, scale: number): string {
  const sx = measure.cx + dir * (measure.shoulderHW - 8 * scale);
  const sy = measure.shoulderY + 4;
  return smoothClosed([
    { x: sx - dir * 8 * scale, y: sy },
    { x: sx + dir * 26 * scale, y: sy - 18 * scale },
    { x: sx + dir * 34 * scale, y: sy + 14 * scale },
    { x: sx + dir * 16 * scale, y: sy + 40 * scale },
    { x: sx - dir * 2 * scale, y: sy + 20 * scale },
  ]);
}

function capePanel(measure: Measure, dir: number, flare: number): string {
  const outer = measure.hemHW * 0.55 + flare;
  return smoothClosed([
    { x: measure.cx + dir * 2, y: measure.neckY - 4 },
    { x: measure.cx + dir * (measure.shoulderHW + flare * 0.35), y: measure.shoulderY - 6 },
    { x: measure.cx + dir * (outer + flare * 0.25), y: measure.hipY },
    { x: measure.cx + dir * outer, y: measure.hemY },
    { x: measure.cx + dir * (flare * 0.55), y: measure.hemY - 4 },
    { x: measure.cx + dir * 14, y: measure.waistY },
  ]);
}

function piecesFor(id: SketchId, measure: Measure, space: 'form' | 'worn'): Piece[] {
  const sleeve = space === 'form' ? 146 : 92;
  const jacketSleeve = space === 'form' ? 118 : 78;
  const puff = space === 'form' ? 1 : 0.62;
  const flare = space === 'form' ? 78 : 28;
  switch (id) {
    case 'sunny-dress':
      return [{ d: flared(measure), role: 'main' }];
    case 'rain-coat':
      return [
        { d: flared(measure), role: 'main' },
        { d: longSleeve(measure, 1, sleeve), role: 'sleeve', side: 1 },
        { d: longSleeve(measure, -1, sleeve), role: 'sleeve', side: -1 },
      ];
    case 'twirl-set':
      return [
        { d: flared(measure, { cropAt: measure.waistY + 8 }), role: 'main' },
        { d: circleSkirt(measure), role: 'skirt' },
      ];
    case 'hero-cape':
      return [
        { d: capePanel(measure, 1, flare), role: 'back' },
        { d: capePanel(measure, -1, flare), role: 'back' },
        { d: flared({ ...measure, hemHW: measure.hemHW * 0.72, hemY: measure.hemY - (space === 'form' ? 28 : 16) }), role: 'main' },
      ];
    case 'garden-gown':
      return [
        {
          d: flared(
            {
              ...measure,
              neckY: measure.bustY - (space === 'form' ? 18 : 10),
              neckHW: measure.bustHW + 4,
              neckDrop: space === 'form' ? 10 : 6,
              shoulderHW: measure.bustHW + 8,
              underHW: measure.bustHW - 4,
              underY: measure.bustY + 8,
            },
            { cropAt: measure.waistY + 8, strap: false },
          ),
          role: 'main',
        },
        { d: circleSkirt({ ...measure, waistHW: measure.waistHW + 4 }), role: 'skirt' },
      ];
    case 'puff-pencil':
      return [
        { d: flared(measure, { cropAt: measure.waistY + (space === 'form' ? 16 : 10) }), role: 'main' },
        { d: puffSleeve(measure, 1, puff), role: 'sleeve', side: 1 },
        { d: puffSleeve(measure, -1, puff), role: 'sleeve', side: -1 },
        { d: pencilSkirt(measure), role: 'skirt' },
      ];
    case 'palazzo':
      return [
        { d: flared(measure, { cropAt: measure.waistY + 6 }), role: 'main' },
        { d: pantLeg(measure, 1), role: 'skirt' },
        { d: pantLeg(measure, -1), role: 'skirt' },
      ];
    case 'crop-jacket':
      return [
        { d: circleSkirt({ ...measure, hemHW: measure.hemHW * 0.92 }), role: 'skirt' },
        { d: flared(measure, { cropAt: measure.waistY + (space === 'form' ? 18 : 12) }), role: 'main' },
        { d: longSleeve(measure, 1, jacketSleeve), role: 'sleeve', side: 1 },
        { d: longSleeve(measure, -1, jacketSleeve), role: 'sleeve', side: -1 },
      ];
    case 'pleat-parade':
      return [
        { d: flared(measure, { cropAt: measure.waistY + 4 }), role: 'main' },
        { d: circleSkirt({ ...measure, hemRound: 4, hemHW: measure.hemHW * 0.96 }), role: 'skirt' },
      ];
    case 'jumpsuit':
      return [
        { d: flared(measure, { cropAt: measure.waistY + 10 }), role: 'main' },
        { d: pantLeg(measure, 1), role: 'skirt' },
        { d: pantLeg(measure, -1), role: 'skirt' },
      ];
    default:
      return [{ d: flared(measure), role: 'main' }];
  }
}

function petals(cx: number, cy: number, r: number, fill: string): string {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    s += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(r * 0.72).toFixed(1)}" ry="${(r * 0.48).toFixed(1)}" transform="rotate(${(i * 72).toFixed(0)} ${px.toFixed(1)} ${py.toFixed(1)})" fill="${fill}"/>`;
  }
  return s;
}

function fabricPaint(uid: string, pattern: FabricId, color: string): { defs: string; fill: string; klass: string } {
  const base = pattern === 'velvet' ? darken(color, 0.12) : color;
  if (pattern === 'solid' || pattern === 'velvet') {
    return {
      defs: '',
      fill: base,
      klass: pattern === 'velvet' ? 'velvet-cloth' : '',
    };
  }
  if (pattern === 'rainbow') {
    return {
      defs: `<linearGradient id="${uid}-rb" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff6b8a"/>
        <stop offset="0.2" stop-color="#ffb703"/>
        <stop offset="0.45" stop-color="#7dce82"/>
        <stop offset="0.7" stop-color="#4cc9f0"/>
        <stop offset="0.88" stop-color="#b388ff"/>
        <stop offset="1" stop-color="#ff6b8a"/>
      </linearGradient>`,
      fill: `url(#${uid}-rb)`,
      klass: 'fabric-rainbow',
    };
  }
  const id = `${uid}-fab`;
  let body = '';
  if (pattern === 'stripes') {
    const alt = lighten(color, 0.28);
    body = `<rect width="18" height="18" fill="${color}"/><rect x="0" width="8" height="18" fill="${alt}"/>`;
    return { defs: `<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse">${body}</pattern>`, fill: `url(#${id})`, klass: '' };
  }
  if (pattern === 'polka') {
    const ground = lighten(color, 0.16);
    const dot = darken(color, 0.12);
    body = `<rect width="28" height="28" fill="${ground}"/>
      <circle cx="8" cy="8" r="5" fill="${dot}"/>
      <circle cx="22" cy="22" r="5" fill="${dot}"/>
      <circle cx="8" cy="8" r="2" fill="#fff" opacity="0.35"/>
      <circle cx="22" cy="22" r="2" fill="#fff" opacity="0.35"/>`;
    return { defs: `<pattern id="${id}" width="28" height="28" patternUnits="userSpaceOnUse">${body}</pattern>`, fill: `url(#${id})`, klass: '' };
  }
  if (pattern === 'floral') {
    const petal = lighten(color, 0.34);
    const center = darken(color, 0.2);
    const leaf = mix(color, '#2f6a45', 0.55);
    body = `<rect width="72" height="72" fill="${color}"/>
      <ellipse cx="14" cy="30" rx="9" ry="4" fill="${leaf}" transform="rotate(-40 14 30)"/>
      <ellipse cx="50" cy="58" rx="9" ry="4" fill="${leaf}" transform="rotate(30 50 58)"/>
      ${petals(22, 22, 7, petal)}<circle cx="22" cy="22" r="2.4" fill="${center}"/>
      ${petals(52, 48, 5.5, lighten(petal, 0.1))}<circle cx="52" cy="48" r="2" fill="${center}"/>`;
    return { defs: `<pattern id="${id}" width="72" height="72" patternUnits="userSpaceOnUse">${body}</pattern>`, fill: `url(#${id})`, klass: '' };
  }
  if (pattern === 'denim') {
    const ground = mix(color, '#35598a', 0.5);
    const a = lighten(ground, 0.18);
    const b = darken(ground, 0.25);
    body = `<rect width="14" height="14" fill="${ground}"/>
      <path d="M0 14 L14 0 M-7 7 L7 -7 M7 21 L21 7" stroke="${a}" stroke-width="2" opacity="0.55"/>
      <path d="M0 7 L7 0 M0 14 L14 0 M7 14 L14 7" stroke="${b}" stroke-width="1.2" opacity="0.35"/>
      <circle cx="3" cy="11" r="0.6" fill="#d7e4f5" opacity="0.5"/>
      <circle cx="10" cy="4" r="0.6" fill="#d7e4f5" opacity="0.45"/>`;
    return { defs: `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse">${body}</pattern>`, fill: `url(#${id})`, klass: 'denim-cloth' };
  }
  if (pattern === 'sequins') {
    const ground = darken(color, 0.42);
    const disc = lighten(color, 0.2);
    const shine = '#fff8e8';
    body = `<rect width="18" height="18" fill="${ground}"/>
      <circle cx="5" cy="5" r="4.4" fill="url(#${uid}-seq)"/>
      <circle cx="14" cy="13" r="4.4" fill="url(#${uid}-seq)"/>
      <circle cx="3.6" cy="3.6" r="1.5" fill="${shine}"/>
      <circle cx="12.6" cy="11.6" r="1.5" fill="${shine}"/>
      <circle cx="6.2" cy="6.4" r="0.7" fill="${disc}" opacity="0.7"/>`;
    const grad = `<radialGradient id="${uid}-seq" cx="35%" cy="35%" r="70%">
      <stop offset="0" stop-color="${shine}"/>
      <stop offset="0.45" stop-color="${disc}"/>
      <stop offset="1" stop-color="${darken(color, 0.35)}"/>
    </radialGradient>`;
    return {
      defs: `${grad}<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse">${body}</pattern>`,
      fill: `url(#${id})`,
      klass: 'sequin-cloth',
    };
  }
  if (pattern === 'tulle') {
    const ground = lighten(color, 0.12);
    body = `<rect width="10" height="10" fill="${ground}" opacity="0.35"/>
      <path d="M0 10 L10 0 M-2 2 L2 -2 M8 12 L12 8" stroke="${darken(color, 0.05)}" stroke-width="0.6" opacity="0.45"/>`;
    return { defs: `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse">${body}</pattern>`, fill: `url(#${id})`, klass: 'tulle-cloth' };
  }
  return { defs: '', fill: color, klass: '' };
}

function shadeDefs(uid: string): string {
  return `<linearGradient id="${uid}-shade" x1="0" y1="0" x2="1" y2="0.15">
      <stop offset="0" stop-color="#1a120e" stop-opacity="0.34"/>
      <stop offset="0.32" stop-color="#1a120e" stop-opacity="0.06"/>
      <stop offset="0.48" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="0.7" stop-color="#1a120e" stop-opacity="0.04"/>
      <stop offset="1" stop-color="#1a120e" stop-opacity="0.22"/>
    </linearGradient>
    <linearGradient id="${uid}-sheen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${uid}-velvet" cx="40%" cy="30%" r="75%">
      <stop offset="0" stop-color="#fff" stop-opacity="0.38"/>
      <stop offset="0.55" stop-color="#fff" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.18"/>
    </radialGradient>`;
}

function folds(measure: Measure, sketch: SketchId): string {
  const skirts = sketch === 'puff-pencil' ? measure.hemHW : measure.hemHW;
  const y0 = sketch === 'palazzo' || sketch === 'jumpsuit' ? measure.waistY + 20 : measure.waistY + 8;
  const y1 = measure.hemY - 8;
  const lines = [-0.55, -0.22, 0.12, 0.42];
  return lines
    .map((t) => {
      const x1 = measure.cx + t * measure.waistHW * 0.4;
      const x2 = measure.cx + t * skirts * 0.85;
      const c = (x1 + x2) / 2 + t * 10;
      return `<path d="M ${x1.toFixed(1)} ${y0.toFixed(1)} Q ${c.toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}, ${x2.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="#1a120e" stroke-opacity="0.22" stroke-width="2" stroke-linecap="round"/>`;
    })
    .join('');
}

function seamLines(measure: Measure, sketch: SketchId, gold: boolean): string {
  const stroke = gold ? '#e2b15a' : '#1a120e';
  const opacity = gold ? 0.95 : 0.45;
  const width = gold ? 1.7 : 1.15;
  const waist = `M ${measure.cx - measure.waistHW} ${measure.waistY} Q ${measure.cx} ${measure.waistY + 8} ${measure.cx + measure.waistHW} ${measure.waistY}`;
  const sideL = `M ${measure.cx - measure.underHW} ${measure.underY} Q ${measure.cx - measure.waistHW - 4} ${measure.waistY}, ${measure.cx - measure.hemHW * 0.72} ${measure.hemY - 6}`;
  const sideR = `M ${measure.cx + measure.underHW} ${measure.underY} Q ${measure.cx + measure.waistHW + 4} ${measure.waistY}, ${measure.cx + measure.hemHW * 0.72} ${measure.hemY - 6}`;
  const extra =
    sketch === 'rain-coat' || sketch === 'crop-jacket'
      ? `M ${measure.cx} ${measure.neckY + measure.neckDrop + 8} L ${measure.cx - 4} ${measure.waistY + (sketch === 'crop-jacket' ? 16 : 40)}`
      : sketch === 'jumpsuit' || sketch === 'palazzo'
        ? `M ${measure.cx - measure.waistHW} ${measure.waistY} Q ${measure.cx} ${measure.waistY + 6} ${measure.cx + measure.waistHW} ${measure.waistY}`
        : '';
  const d = [waist, sideL, sideR, extra].filter(Boolean).join(' ');
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round" stroke-dasharray="${gold ? '0' : '1.5 2.4'}"/>`;
}

function coatFront(measure: Measure, color: string, cropped: boolean): string {
  const lapel = darken(color, 0.32);
  const collar = darken(color, 0.18);
  const yStop = cropped ? measure.waistY - 4 : measure.bustY + 36;
  const right = `M ${measure.cx + 2} ${measure.neckY + 4}
    L ${measure.cx + 18} ${measure.neckY - 8}
    L ${measure.cx + measure.shoulderHW * 0.62} ${measure.shoulderY + 10}
    L ${measure.cx + 42} ${yStop}
    L ${measure.cx + 10} ${yStop - 16}
    Z`;
  const left = `M ${measure.cx - 2} ${measure.neckY + 4}
    L ${measure.cx - 18} ${measure.neckY - 8}
    L ${measure.cx - measure.shoulderHW * 0.62} ${measure.shoulderY + 10}
    L ${measure.cx - 42} ${yStop}
    L ${measure.cx - 10} ${yStop - 16}
    Z`;
  const collarBand = `M ${measure.cx - 28} ${measure.neckY + 2}
    Q ${measure.cx} ${measure.neckY + 22} ${measure.cx + 28} ${measure.neckY + 2}
    L ${measure.cx + 22} ${measure.neckY + 16}
    Q ${measure.cx} ${measure.neckY + 30} ${measure.cx - 22} ${measure.neckY + 16} Z`;
  let pockets = '';
  if (!cropped) {
    const py = measure.hipY - 6;
    const flap = (x: number) => `<path d="M ${x} ${py} h 42 v 8 q -4 6 -10 6 h -22 q -6 0 -10 -6 z" fill="${darken(color, 0.22)}" stroke="${darken(color, 0.4)}" stroke-width="1"/>
      <path d="M ${x + 4} ${py + 14} h 34 v 28 q 0 6 -6 6 h -22 q -6 0 -6 -6 v -28 z" fill="${darken(color, 0.12)}" opacity="0.9"/>`;
    pockets = flap(measure.cx - measure.hipHW * 0.72) + flap(measure.cx + 8);
  }
  const beltY = measure.waistY;
  const tie = `<path d="M ${measure.cx - measure.waistHW + 4} ${beltY - 6}
      Q ${measure.cx} ${beltY + 4} ${measure.cx + measure.waistHW - 4} ${beltY - 6}
      L ${measure.cx + measure.waistHW - 8} ${beltY + 8}
      Q ${measure.cx} ${beltY + 16} ${measure.cx - measure.waistHW + 8} ${beltY + 8} Z" fill="${darken(color, 0.22)}"/>
    <rect x="${measure.cx - 7}" y="${beltY - 6}" width="14" height="14" rx="2" fill="#f2c14e" stroke="#8a5a12" stroke-width="1"/>`;
  return `<path d="${collarBand}" fill="${collar}" stroke="${darken(color, 0.4)}" stroke-width="1"/>
    <path d="${right}" fill="${lapel}" stroke="${darken(color, 0.45)}" stroke-width="1.2"/>
    <path d="${left}" fill="${lapel}" stroke="${darken(color, 0.45)}" stroke-width="1.2"/>
    <path d="M ${measure.cx} ${measure.neckY + 18} L ${measure.cx - 3} ${cropped ? measure.waistY + 10 : measure.hemY - 16}" fill="none" stroke="${darken(color, 0.45)}" stroke-width="2"/>
    ${pockets}${cropped ? '' : tie}${buttons(measure, color, cropped ? 3 : 5, cropped ? measure.waistY : measure.hipY + 24)}`;
}

function sleeveCuff(measure: Measure, dir: 1 | -1, color: string, cropped: boolean): string {
  const length = measure.cx > 160 ? (cropped ? 118 : 146) : cropped ? 78 : 96;
  const sx = measure.cx + dir * (measure.shoulderHW - 6);
  const sy = measure.shoulderY + 8;
  const wx = sx + dir * length * 0.34;
  const wy = sy + length - 2;
  const w = measure.cx > 160 ? 22 : 14;
  const h = measure.cx > 160 ? 11 : 8;
  return `<rect x="${(wx - w / 2).toFixed(1)}" y="${wy.toFixed(1)}" width="${w}" height="${h}" rx="2" fill="${darken(color, 0.2)}" stroke="${darken(color, 0.4)}" stroke-width="1"/>`;
}

function pleatOverlay(measure: Measure, color: string): string {
  const y = measure.waistY - 4;
  const hem = measure.hemY;
  const n = 14;
  let d = '';
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    const xw0 = measure.cx - measure.waistHW + t0 * measure.waistHW * 2;
    const xw1 = measure.cx - measure.waistHW + t1 * measure.waistHW * 2;
    const xh0 = measure.cx - measure.hemHW + t0 * measure.hemHW * 2;
    const xh1 = measure.cx - measure.hemHW + t1 * measure.hemHW * 2;
    const shade = i % 2 === 0 ? 0.06 : 0.2;
    d += `<path d="M ${xw0.toFixed(1)} ${y} L ${xw1.toFixed(1)} ${y} L ${xh1.toFixed(1)} ${hem} L ${xh0.toFixed(1)} ${hem} Z" fill="${darken(color, shade)}" opacity="0.55"/>`;
  }
  return d;
}

function bow(x: number, y: number, color: string, scale: number): string {
  const knot = darken(color, 0.2);
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale})" stroke="${darken(color, 0.35)}" stroke-width="1">
    <ellipse cx="-16" cy="0" rx="16" ry="11" fill="${color}"/>
    <ellipse cx="16" cy="0" rx="16" ry="11" fill="${color}"/>
    <path d="M -6 5 L -20 26 L -4 14 Z" fill="${color}"/>
    <path d="M 6 5 L 20 26 L 4 14 Z" fill="${color}"/>
    <circle r="6.5" fill="${knot}"/>
    <ellipse cx="-8" cy="-3" rx="6" ry="3" fill="#fff" opacity="0.28"/>
  </g>`;
}

function buttons(measure: Measure, color: string, count: number, endY: number): string {
  const face = lighten(color, 0.45);
  const hole = darken(color, 0.45);
  let s = '';
  for (let i = 0; i < count; i++) {
    const y = measure.neckY + 36 + ((endY - measure.neckY - 36) * i) / Math.max(1, count - 1);
    const x = measure.cx + 8;
    s += `<g>
      <circle cx="${x}" cy="${y.toFixed(1)}" r="6.5" fill="${face}" stroke="${hole}" stroke-width="1"/>
      <circle cx="${x - 2}" cy="${y - 2}" r="0.9" fill="${hole}"/>
      <circle cx="${x + 2}" cy="${y - 2}" r="0.9" fill="${hole}"/>
      <circle cx="${x - 2}" cy="${y + 2}" r="0.9" fill="${hole}"/>
      <circle cx="${x + 2}" cy="${y + 2}" r="0.9" fill="${hole}"/>
    </g>`;
  }
  return s;
}

function belt(measure: Measure, color: string): string {
  const leather = darken(color, 0.28);
  const y = measure.waistY;
  return `<path d="M ${measure.cx - measure.waistHW - 2} ${y - 7}
      Q ${measure.cx} ${y + 2} ${measure.cx + measure.waistHW + 2} ${y - 7}
      L ${measure.cx + measure.waistHW} ${y + 9}
      Q ${measure.cx} ${y + 18} ${measure.cx - measure.waistHW} ${y + 9} Z" fill="${leather}"/>
    <rect x="${measure.cx - 8}" y="${y - 8}" width="16" height="16" rx="2" fill="#f2c14e" stroke="#8a5a12" stroke-width="1"/>
    <rect x="${measure.cx - 3}" y="${y - 3}" width="6" height="6" fill="none" stroke="#8a5a12" stroke-width="1"/>`;
}

function beret(x: number, y: number, color: string, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <ellipse cx="0" cy="10" rx="36" ry="10" fill="${darken(color, 0.25)}"/>
    <path d="M -30 6 C -34 -16, 20 -22, 32 -2 C 36 10, 10 16, -30 6 Z" fill="${color}"/>
    <circle cx="12" cy="-8" r="4" fill="${darken(color, 0.3)}"/>
    <ellipse cx="-6" cy="-4" rx="10" ry="4" fill="#fff" opacity="0.2"/>
  </g>`;
}

function handbag(x: number, y: number, color: string, scale: number): string {
  const body = darken(color, 0.08);
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M -12 -4 Q 0 -26 12 -4" fill="none" stroke="${darken(color, 0.45)}" stroke-width="3" stroke-linecap="round"/>
    <rect x="-22" y="-6" width="44" height="34" rx="8" fill="${body}" stroke="${darken(color, 0.35)}" stroke-width="1.2"/>
    <rect x="-22" y="-6" width="44" height="10" rx="4" fill="${darken(color, 0.22)}"/>
    <circle cx="0" cy="12" r="3" fill="#f2c14e" stroke="#8a5a12" stroke-width="0.8"/>
  </g>`;
}

function shoePair(x: number, y: number, color: string, scale: number): string {
  const c = darken(color, 0.38);
  const sole = darken(c, 0.25);
  const one = (dx: number) => `<g transform="translate(${dx} 0)">
      <path d="M -16 0 Q -18 10 0 12 Q 16 10 18 2 Q 8 6 -16 0 Z" fill="${c}"/>
      <path d="M -14 -2 Q -4 -16 8 -2" fill="${c}"/>
      <path d="M -8 -1 h 14" stroke="${lighten(c, 0.3)}" stroke-width="2" stroke-linecap="round"/>
      <path d="M -16 10 Q 0 16 18 8" fill="none" stroke="${sole}" stroke-width="2"/>
    </g>`;
  return `<g transform="translate(${x} ${y}) scale(${scale})">${one(-16)}${one(16)}</g>`;
}

function sequinDust(measure: Measure, color: string, uid: string): string {
  const spots = [
    [0.1, 0.35],
    [-0.25, 0.48],
    [0.3, 0.58],
    [-0.05, 0.7],
    [0.22, 0.42],
    [-0.32, 0.62],
    [0.05, 0.5],
  ];
  const shine = lighten(color, 0.55);
  return spots
    .map(([tx, ty], i) => {
      const x = measure.cx + tx * measure.hemHW;
      const y = measure.waistY + ty * (measure.hemY - measure.waistY);
      const r = 5 + (i % 3);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="url(#${uid}-seq)" stroke="${darken(color, 0.3)}" stroke-width="0.6"/>
        <circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" r="${r * 0.22}" fill="${shine}"/>`;
    })
    .join('');
}

function details(sketch: SketchId, measure: Measure, color: string, uid: string): string {
  let extra = '';
  if (sketch === 'rain-coat' || sketch === 'crop-jacket') {
    extra += coatFront(measure, color, sketch === 'crop-jacket');
  }
  if (sketch === 'twirl-set' || sketch === 'pleat-parade') {
    const y = measure.waistY;
    extra += `<path d="M ${measure.cx - measure.waistHW - 4} ${y - 8} Q ${measure.cx} ${y + 2} ${measure.cx + measure.waistHW + 4} ${y - 8} L ${measure.cx + measure.waistHW} ${y + 8} Q ${measure.cx} ${y + 16} ${measure.cx - measure.waistHW} ${y + 8} Z" fill="${darken(color, 0.22)}"/>`;
  }
  if (sketch === 'pleat-parade') {
    const skirt = circleSkirt({ ...measure, hemRound: 4, hemHW: measure.hemHW * 0.96 });
    extra += `<clipPath id="${uid}-pleat"><path d="${skirt}"/></clipPath>`;
    extra += `<g clip-path="url(#${uid}-pleat)">${pleatOverlay(measure, color)}</g>`;
  }
  if (sketch === 'hero-cape') {
    extra += `<path d="M ${measure.cx - 10} ${measure.neckY + 8} Q ${measure.cx} ${measure.neckY + 28} ${measure.cx + 10} ${measure.neckY + 8}" fill="none" stroke="${darken(color, 0.35)}" stroke-width="2"/>`;
    extra += `<circle cx="${measure.cx}" cy="${measure.neckY + 16}" r="4" fill="#f2c14e" stroke="#8a5a12" stroke-width="0.8"/>`;
  }
  return extra;
}

function accessoriesSvg(
  list: AccessoryId[],
  measure: Measure,
  sketch: SketchId,
  color: string,
  uid: string,
  space: 'form' | 'worn',
): string {
  let s = '';
  const bowScale = space === 'worn' ? 0.62 : 1;
  const small = space === 'worn' ? 0.7 : 1;
  for (const id of list) {
    if (id === 'bow') {
      const atNeck = sketch === 'rain-coat' || sketch === 'hero-cape' || sketch === 'crop-jacket';
      const x = measure.cx;
      const y = atNeck ? measure.neckY + 18 : measure.waistY;
      s += bow(x, y, mix(color, '#ffffff', 0.15), bowScale);
    } else if (id === 'buttons' && sketch !== 'rain-coat' && sketch !== 'crop-jacket') {
      s += buttons(measure, color, 4, measure.waistY);
    } else if (id === 'belt') {
      s += belt(measure, color);
    } else if (id === 'sequins') {
      s += sequinDust(measure, color, uid);
    } else if (id === 'bag') {
      s += handbag(measure.cx + measure.hemHW * 0.45, measure.waistY + 10, color, small);
    } else if (id === 'hat' && space === 'form') {
      s += beret(measure.cx + 6, measure.neckY - 46, darken(color, 0.15), 1);
    } else if (id === 'shoes' && space === 'form') {
      s += shoePair(measure.cx, 600, color, 1.05);
    }
  }
  return s;
}

export function renderGarment(
  outfit: Pick<Outfit, 'sketchId' | 'pattern' | 'color' | 'accessories'>,
  uid: string,
  space: 'form' | 'worn',
  mode: 'fashion' | 'paper' | 'sketch',
): { back: string; main: string; sleeves: string; sleeveL: string; sleeveR: string; shade: string; extras: string; defs: string } {
  const raw = space === 'form' ? FORM[outfit.sketchId] : wornOf(FORM[outfit.sketchId]);
  const measure = space === 'worn' ? fitWorn(outfit.sketchId, raw) : raw;
  const pieces = piecesFor(outfit.sketchId, measure, space);
  const paint = fabricPaint(uid, outfit.pattern, outfit.color);
  const edge = mode === 'sketch' ? '#2a241f' : mode === 'paper' ? '#5c4030' : darken(outfit.color, 0.28);
  const fillFor = (piece: Piece) => {
    if (mode === 'sketch') return 'none';
    if (mode === 'paper') return '#efd7b4';
    if (outfit.pattern === 'tulle' && (piece.role === 'skirt' || piece.role === 'back')) return paint.fill;
    return paint.fill;
  };
  const opacityFor = (piece: Piece) => {
    if (mode !== 'fashion') return 1;
    if (outfit.pattern === 'tulle' && piece.role === 'skirt') return 0.72;
    if (outfit.pattern === 'tulle' && piece.role === 'back') return 0.55;
    return 1;
  };
  const draw = (role: Piece['role'], side?: 1 | -1) =>
    pieces
      .filter((p) => p.role === role && (side === undefined || p.side === side))
      .map((p) => {
        const sw = mode === 'sketch' ? 2.6 : mode === 'paper' ? 2.2 : 1.6;
        const extra =
          mode === 'sketch'
            ? `<path d="${p.d}" fill="none" stroke="#2a241f" stroke-width="4" opacity="0.12" transform="translate(2.2 3)"/>`
            : '';
        const klass = role === 'skirt' ? 'flare' : role === 'back' ? 'cape-piece' : '';
        const capeInk = role === 'back' && mode === 'fashion' ? `<path d="${p.d}" fill="#1a120e" opacity="0.2"/>` : '';
        return `${extra}<path class="g-piece ${klass}" d="${p.d}" fill="${fillFor(p)}" opacity="${opacityFor(p)}" stroke="${edge}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>${capeInk}`;
      })
      .join('');

  let defs = '';
  if (mode === 'fashion') {
    const seqGrad = outfit.accessories.includes('sequins') && outfit.pattern !== 'sequins'
      ? `<radialGradient id="${uid}-seq" cx="35%" cy="35%" r="70%">
          <stop offset="0" stop-color="${lighten(outfit.color, 0.55)}"/>
          <stop offset="0.5" stop-color="${lighten(outfit.color, 0.1)}"/>
          <stop offset="1" stop-color="${darken(outfit.color, 0.35)}"/>
        </radialGradient>`
      : '';
    defs = shadeDefs(uid) + paint.defs + seqGrad;
    const clipId = `${uid}-clip`;
    const clipPaths = pieces.map((p) => `<path d="${p.d}"/>`).join('');
    defs += `<clipPath id="${clipId}">${clipPaths}</clipPath>`;
  }

  let shade = '';
  if (mode === 'fashion') {
    const vb = space === 'form' ? { w: 400, h: 640 } : { w: 320, h: 560 };
    shade = `<g clip-path="url(#${uid}-clip)" class="${paint.klass}">
      <rect x="-40" y="0" width="${vb.w}" height="${vb.h}" fill="url(#${uid}-shade)"/>
      ${outfit.pattern === 'velvet' ? `<rect x="-40" y="0" width="${vb.w}" height="${vb.h}" fill="url(#${uid}-velvet)"/>` : ''}
      ${outfit.pattern === 'sequins' ? `<rect x="-80" y="0" width="80" height="${vb.h}" fill="url(#${uid}-sheen)"><animate attributeName="x" values="-80;${vb.w};-80" dur="3.8s" repeatCount="indefinite"/></rect>` : ''}
      ${folds(measure, outfit.sketchId)}
    </g>`;
    shade += seamLines(measure, outfit.sketchId, outfit.pattern === 'denim');
    shade += details(outfit.sketchId, measure, outfit.color, uid);
    if (outfit.pattern === 'tulle') {
      const skirt = pieces.find((p) => p.role === 'skirt');
      if (skirt) {
        shade += `<g transform="translate(${measure.cx} ${measure.waistY}) scale(1.06 1.03) translate(${-measure.cx} ${-measure.waistY})" opacity="0.28">
          <path d="${skirt.d}" fill="${lighten(outfit.color, 0.2)}"/>
        </g>`;
      }
    }
  }

  const extras =
    mode === 'fashion'
      ? accessoriesSvg(outfit.accessories, measure, outfit.sketchId, outfit.color, uid, space) +
        (space === 'worn' ? wornFeet(outfit) : '')
      : '';

  const sketchMarks =
    mode === 'sketch' && (outfit.sketchId === 'rain-coat' || outfit.sketchId === 'crop-jacket')
      ? `<g fill="none" stroke="#2a241f" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round">
          <path d="M ${measure.cx} ${measure.neckY + 10} L ${measure.cx + 22} ${measure.neckY - 4} L ${measure.cx + measure.shoulderHW * 0.5} ${measure.shoulderY + 14} L ${measure.cx + 40} ${measure.bustY + 28}"/>
          <path d="M ${measure.cx} ${measure.neckY + 10} L ${measure.cx - 22} ${measure.neckY - 4} L ${measure.cx - measure.shoulderHW * 0.5} ${measure.shoulderY + 14} L ${measure.cx - 40} ${measure.bustY + 28}"/>
          <path d="M ${measure.cx} ${measure.neckY + 22} L ${measure.cx} ${outfit.sketchId === 'crop-jacket' ? measure.waistY + 8 : measure.hemY - 24}"/>
          ${outfit.sketchId === 'rain-coat' ? `<rect x="${measure.cx - 70}" y="${measure.hipY}" width="36" height="28" rx="3"/><rect x="${measure.cx + 28}" y="${measure.hipY}" width="36" height="28" rx="3"/>` : ''}
        </g>`
      : '';
  const cuff = (side: 1 | -1) =>
    mode === 'fashion' && (outfit.sketchId === 'rain-coat' || outfit.sketchId === 'crop-jacket')
      ? sleeveCuff(measure, side, outfit.color, outfit.sketchId === 'crop-jacket')
      : '';
  const sleeveL = draw('sleeve', -1) + cuff(-1);
  const sleeveR = draw('sleeve', 1) + cuff(1);
  return {
    defs,
    back: draw('back'),
    main: draw('main') + draw('skirt') + sketchMarks,
    sleeves: sleeveL + sleeveR,
    sleeveL,
    sleeveR,
    shade,
    extras,
  };
}

function wornFeet(outfit: Pick<Outfit, 'accessories' | 'color'>): string {
  let s = '';
  if (outfit.accessories.includes('shoes')) {
    s += shoePair(120, 482, outfit.color, 0.66);
  }
  if (outfit.accessories.includes('hat')) {
    s += beret(128, 58, darken(outfit.color, 0.1), 0.72);
  }
  return s;
}

export function renderDressForm(
  outfit: Pick<Outfit, 'sketchId' | 'pattern' | 'color' | 'accessories'> | null,
  _uid: string,
  mode: 'fashion' | 'paper' | 'bare' = 'fashion',
): string {
  let href = sewForm('empty');
  if (mode === 'paper') href = sewForm('pattern');
  else if (outfit?.color) href = tintedSprite('form', outfit.sketchId, outfit.color, outfit.pattern);
  const marks = mode === 'paper' && outfit ? `<g class="paper-marks">${paperDecor(outfit.sketchId)}</g>` : '';
  return `<svg class="dress-svg" viewBox="${FORM_VB}" preserveAspectRatio="xMidYMax meet">
    <image id="form-photo" href="${href}" x="20" y="24" width="360" height="590" preserveAspectRatio="xMidYMax meet"/>
    ${marks}
  </svg>`;
}

function runwayMeasure(id: SketchId): Measure {
  const base = FORM['garden-gown'];
  if (id === 'mermaid-gown') return { ...base, hemHW: 78, hipHW: 96, waistHW: 40, hemY: 560 };
  if (id === 'cherry-kimono') return { ...base, hemHW: 140, shoulderHW: 100, hemY: 540 };
  if (id === 'peacock-train') return { ...base, hemHW: 190, hemY: 580 };
  if (id === 'candy-party') return { ...base, hemY: 460, hemHW: 120 };
  if (id === 'puff-pencil') return FORM['puff-pencil'];
  return { ...base, hemHW: 168 };
}

function measureOf(id: SketchId): Measure {
  return FORM[id] ?? runwayMeasure(id);
}

export function stitchLayout(sketchId: SketchId): { pins: Pt[]; stitch: Pt[]; snips: Pt[] } {
  const measure = measureOf(sketchId);
  const pins: Pt[] = [
    { x: measure.cx - measure.shoulderHW + 8, y: measure.shoulderY + 6 },
    { x: measure.cx + measure.shoulderHW - 8, y: measure.shoulderY + 6 },
    { x: measure.cx, y: measure.waistY - 6 },
  ];
  let stitch: Pt[];
  if (sketchId === 'palazzo' || sketchId === 'jumpsuit') {
    stitch = [
      { x: measure.cx - measure.waistHW + 6, y: measure.waistY + 16 },
      { x: measure.cx - measure.hemHW * 0.42, y: measure.hemY - 16 },
      { x: measure.cx - 14, y: measure.hemY - 8 },
      { x: measure.cx + 14, y: measure.hemY - 8 },
      { x: measure.cx + measure.hemHW * 0.42, y: measure.hemY - 16 },
      { x: measure.cx + measure.waistHW - 6, y: measure.waistY + 16 },
    ];
  } else {
    const hem = sketchId === 'garden-gown' ? measure.hemY - 8 : measure.hemY - 12;
    stitch = [
      { x: measure.cx - 16, y: measure.waistY },
      { x: measure.cx - measure.hemHW * 0.78, y: hem },
      { x: measure.cx, y: hem + 8 },
      { x: measure.cx + measure.hemHW * 0.78, y: hem },
      { x: measure.cx + 16, y: measure.waistY },
    ];
  }
  const spread = Math.max(measure.waistHW + 36, 96);
  const snips = [
    { x: measure.cx - spread, y: measure.waistY - 24 },
    { x: measure.cx + spread, y: measure.waistY - 24 },
  ];
  return { pins, stitch, snips };
}

function paperDecor(sketchId: SketchId): string {
  const { stitch, pins } = stitchLayout(sketchId);
  const d = smoothOpen(stitch);
  const { snips } = stitchLayout(sketchId);
  const pinDots = pins
    .map(
      (p, i) => `<g class="pin-spot" data-i="${i}">
        <circle class="pin-hit" data-act="pin" data-i="${i}" cx="${p.x}" cy="${p.y}" r="36" fill="#fff" fill-opacity="0.02"/>
        <circle class="pin-ring" cx="${p.x}" cy="${p.y}" r="16" fill="none" stroke="#e56b93" stroke-width="2"/>
        <circle class="pin-head" cx="${p.x}" cy="${p.y}" r="7" fill="#f4b8c8" stroke="#a33b5c" stroke-width="1.5"/>
      </g>`,
    )
    .join('');
  const snipDots = snips
    .map(
      (p, i) => {
        const end = i === 0 ? stitch[0] : stitch[stitch.length - 1];
        return `<g class="snip-spot" data-i="${i}">
        <path d="M ${end.x} ${end.y} Q ${(end.x + p.x) / 2} ${end.y - 28} ${p.x} ${p.y}" fill="none" stroke="#c23b5a" stroke-width="4" stroke-linecap="round"/>
        <circle class="snip-ring" cx="${p.x}" cy="${p.y}" r="26" fill="none" stroke="#e56b93" stroke-width="3"/>
        <circle class="snip-hit" data-act="snip" data-id="${i}" data-i="${i}" cx="${p.x}" cy="${p.y}" r="44" fill="#fff" fill-opacity="0.02"/>
        <circle cx="${p.x}" cy="${p.y}" r="14" fill="#fff7ea" stroke="#c23b5a" stroke-width="3"/>
      </g>`;
      },
    )
    .join('');
  return `${pinDots}
    <path class="stitch-guide" d="${d}" fill="none" stroke="#e56b93" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 14" opacity="0.9"/>
    <path class="stitch-done" d="" fill="none" stroke="#c23b5a" stroke-width="4" stroke-linecap="round"/>
    <path class="loose-thread" d="" fill="none" stroke="#c23b5a" stroke-width="2" stroke-linecap="round"/>
    ${snipDots}`;
}

export function renderSketchDrawing(sketchId: SketchId, uid: string): string {
  void uid;
  return `<img class="sketch-svg sprite" alt="" src="${garmentArt(sketchId)}">`;
}

export function renderShareCard(
  outfit: Outfit,
  uid: string,
): string {
  const form = renderDressForm(outfit, uid, 'fashion');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440">
    <rect width="1080" height="1440" fill="#fbf6f0"/>
    <rect x="70" y="200" width="940" height="980" rx="48" fill="#fff9f4"/>
    <g transform="translate(250 250) scale(1.45)">
      ${form.replace(/<svg[^>]*>/, '').replace('</svg>', '')}
    </g>
  </svg>`;
}

