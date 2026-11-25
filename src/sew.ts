import { stitchLayout } from './garments';
import type { SketchId } from './types';

export type SewKind = 'seam' | 'pleat' | 'buttons' | 'zipper' | 'hem';

export function sewKind(id: SketchId): SewKind {
  switch (id) {
    case 'pleat-parade':
    case 'tiered-ruffle':
      return 'pleat';
    case 'rain-coat':
    case 'crop-jacket':
    case 'cherry-kimono':
    case 'dance-tux':
    case 'knit-set':
    case 'bold-blazer':
      return 'buttons';
    case 'sparkle-bomber':
    case 'cozy-hoodie':
    case 'party-zip':
      return 'zipper';
    case 'garden-shirt':
      return 'hem';
    case 'jumpsuit':
    case 'palazzo':
    case 'mermaid-gown':
      return 'zipper';
    case 'twirl-set':
    case 'sunny-dress':
    case 'candy-party':
      return 'hem';
    default:
      return 'seam';
  }
}

export interface SewPlan {
  kind: SewKind;
  curved: boolean;
  label: string;
  pins: { x: number; y: number }[];
  path: { x: number; y: number }[];
  taps: { x: number; y: number }[];
  snips: { x: number; y: number }[];
}

export function sewPlan(id: SketchId, seed: number): SewPlan {
  const kind = sewKind(id);
  const layout = stitchLayout(id);
  const curved = seed % 2 === 1;
  const start = layout.stitch[0];
  const end = layout.stitch[layout.stitch.length - 1];
  const mid = {
    x: (start.x + end.x) / 2,
    y: Math.min(start.y, end.y) + 28,
  };
  const straight = [start, mid, end];
  if (kind === 'pleat') {
    const y = layout.pins[2]?.y ?? start.y + 40;
    const taps = [-36, -12, 12, 36].map((dx) => ({ x: (layout.pins[2]?.x ?? 200) + dx, y }));
    return {
      kind,
      curved,
      label: 'Tap the pleats from left to right.',
      pins: [],
      path: [],
      taps,
      snips: [],
    };
  }
  if (kind === 'buttons') {
    const x = layout.pins[2]?.x ?? 200;
    const y0 = layout.pins[0]?.y ?? 180;
    const taps = [0, 1, 2, 3].map((i) => ({ x, y: y0 + 28 + i * 36 }));
    return {
      kind,
      curved,
      label: 'Tap each button as it glows.',
      pins: [],
      path: [],
      taps,
      snips: [],
    };
  }
  if (kind === 'zipper') {
    const x = layout.pins[2]?.x ?? 200;
    const top = layout.pins[0]?.y ?? 170;
    const bot = (layout.pins[2]?.y ?? 280) + 90;
    const path = [0, 1, 2, 3, 4, 5].map((i) => ({ x, y: top + ((bot - top) * i) / 5 }));
    return {
      kind,
      curved: false,
      label: 'Drag the zipper down, dot by dot.',
      pins: [],
      path,
      taps: [],
      snips: layout.snips,
    };
  }
  const path = curved ? layout.stitch : straight;
  return {
    kind,
    curved,
    label: kind === 'hem' ? (curved ? 'Follow the curved hem, dot by dot.' : 'Follow the straight hem, dot by dot.') : curved ? 'Follow the curved seam, dot by dot.' : 'Follow the straight seam, dot by dot.',
    pins: layout.pins,
    path,
    taps: [],
    snips: layout.snips,
  };
}
