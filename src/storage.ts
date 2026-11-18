import { STARTER_ACCESSORIES, STARTER_FABRICS, STARTER_SKETCHES } from './data';
import type {
  AccessoryId,
  DecorId,
  FabricId,
  Outfit,
  PersonLook,
  Review,
  SaveData,
  SketchId,
} from './types';

const KEY = 'fashion-frenzy-v1';

function empty(): SaveData {
  return {
    v: 1,
    coins: 0,
    hearts: 0,
    stars: 0,
    customersServed: 0,
    showsDone: 0,
    tutorialDone: false,
    muted: false,
    fabrics: [...STARTER_FABRICS],
    sketches: [...STARTER_SKETCHES],
    accessories: [...STARTER_ACCESSORIES],
    decor: [],
    lookbook: [],
    rainbow: false,
    sewCounts: {},
    reviews: [],
  };
}

const FABRIC_IDS = new Set<string>([
  'solid',
  'stripes',
  'polka',
  'floral',
  'denim',
  'sequins',
  'velvet',
  'tulle',
  'rainbow',
]);
const SKETCH_IDS = new Set<string>([
  'sunny-dress',
  'rain-coat',
  'twirl-set',
  'hero-cape',
  'garden-gown',
  'puff-pencil',
  'palazzo',
  'crop-jacket',
  'pleat-parade',
  'jumpsuit',
  'ball-gown',
  'princess-gown',
  'mermaid-gown',
  'sunset-chiffon',
  'garden-roses',
  'starry-gown',
  'butterfly-cape',
  'tiered-ruffle',
  'ice-crystal',
  'candy-party',
  'peacock-train',
  'cherry-kimono',
]);
const ACC_IDS = new Set<string>(['bow', 'buttons', 'sequins', 'belt', 'hat', 'bag', 'shoes']);
const DECOR_IDS = new Set<string>(['rug', 'flowers', 'lights', 'chandelier', 'mirror']);

function asList<T extends string>(value: unknown, allowed: Set<string>): T[] {
  if (!Array.isArray(value)) return [];
  const out: T[] = [];
  for (const item of value) {
    if (typeof item === 'string' && allowed.has(item) && !out.includes(item as T)) {
      out.push(item as T);
    }
  }
  return out;
}

function asOutfit(value: unknown): Outfit | null {
  if (!value || typeof value !== 'object') return null;
  const o = value as Record<string, unknown>;
  if (typeof o.id !== 'string') return null;
  if (typeof o.sketchId !== 'string' || !SKETCH_IDS.has(o.sketchId)) return null;
  if (typeof o.pattern !== 'string' || !FABRIC_IDS.has(o.pattern)) return null;
  if (typeof o.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(o.color)) return null;
  const accessories = asList<AccessoryId>(o.accessories, ACC_IDS);
  const outfit: Outfit = {
    id: o.id,
    sketchId: o.sketchId as SketchId,
    pattern: o.pattern as FabricId,
    color: o.color,
    accessories,
  };
  if (typeof o.stars === 'number') outfit.stars = Math.max(1, Math.min(3, Math.round(o.stars)));
  if (typeof o.label === 'string') outfit.label = o.label.slice(0, 80);
  if (typeof o.themeId === 'string') outfit.themeId = o.themeId.slice(0, 40);
  return outfit;
}

function asReview(value: unknown): Review | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const look = row.look as PersonLook | undefined;
  if (typeof row.id !== 'string' || typeof row.name !== 'string' || typeof row.quote !== 'string') return null;
  if (!look || typeof look.skin !== 'string' || typeof look.hair !== 'string' || typeof look.hairColor !== 'string') return null;
  return {
    id: row.id,
    name: row.name.slice(0, 40),
    stars: clampNum(row.stars, 1, 5),
    quote: row.quote.slice(0, 180),
    coins: clampNum(row.coins, 0, 999),
    look: {
      skin: look.skin,
      hair: look.hair,
      hairColor: look.hairColor,
      glasses: Boolean(look.glasses),
      freckles: Boolean(look.freckles),
      beret: Boolean(look.beret),
      blush: typeof look.blush === 'string' ? look.blush : undefined,
    },
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    if (parsed.v !== 1) return empty();
    const base = empty();
    base.coins = clampNum(parsed.coins, 0, 9999);
    base.hearts = clampNum(parsed.hearts, 0, 9999);
    base.stars = clampNum(parsed.stars, 0, 9999);
    base.customersServed = clampNum(parsed.customersServed, 0, 9999);
    base.showsDone = clampNum(parsed.showsDone, 0, 9999);
    base.tutorialDone = Boolean(parsed.tutorialDone);
    base.muted = Boolean(parsed.muted);
    base.rainbow = Boolean(parsed.rainbow);
    base.tapeFound = Boolean(parsed.tapeFound);
    if (typeof parsed.lastTheme === 'string') base.lastTheme = parsed.lastTheme;
    if (parsed.sewCounts && typeof parsed.sewCounts === 'object') {
      const counts: NonNullable<SaveData['sewCounts']> = {};
      for (const [key, value] of Object.entries(parsed.sewCounts)) {
        if ((key === 'seam' || key === 'pleat' || key === 'buttons' || key === 'zipper' || key === 'hem') && typeof value === 'number') {
          counts[key] = clampNum(value, 0, 99);
        }
      }
      base.sewCounts = counts;
    }
    if (Array.isArray(parsed.reviews)) {
      base.reviews = parsed.reviews
        .map(asReview)
        .filter((review): review is Review => Boolean(review))
        .slice(0, 24);
    }
    const fabrics = asList<FabricId>(parsed.fabrics, FABRIC_IDS);
    const sketches = asList<SketchId>(parsed.sketches, SKETCH_IDS);
    const accessories = asList<AccessoryId>(parsed.accessories, ACC_IDS);
    base.fabrics = Array.from(new Set([...STARTER_FABRICS, ...fabrics]));
    base.sketches = Array.from(new Set([...STARTER_SKETCHES, ...sketches]));
    base.accessories = Array.from(new Set([...STARTER_ACCESSORIES, ...accessories]));
    base.decor = asList<DecorId>(parsed.decor, DECOR_IDS);
    if (base.rainbow && !base.fabrics.includes('rainbow')) base.fabrics.push('rainbow');
    if (Array.isArray(parsed.lookbook)) {
      base.lookbook = parsed.lookbook
        .map(asOutfit)
        .filter((o): o is Outfit => Boolean(o))
        .slice(0, 24);
    }
    return base;
  } catch {
    return empty();
  }
}

function clampNum(n: unknown, min: number, max: number): number {
  if (typeof n !== 'number' || !Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function writeSave(save: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* private mode or full storage — the game still plays */
  }
}
