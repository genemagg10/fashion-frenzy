import type {
  AccessoryId,
  Customer,
  DecorId,
  FabricId,
  SketchId,
  Theme,
} from './types';

export interface FabricInfo {
  id: FabricId;
  name: string;
  blurb: string;
  price: number;
  starter?: boolean;
  secret?: boolean;
}

export interface SketchInfo {
  id: SketchId;
  name: string;
  blurb: string;
  note: string;
  tags: string[];
  price: number;
  starter?: boolean;
}

export interface AccessoryInfo {
  id: AccessoryId;
  name: string;
  blurb: string;
  price: number;
  starter?: boolean;
}

export interface DecorInfo {
  id: DecorId;
  name: string;
  blurb: string;
  price: number;
}

export const PALETTE: { id: string; hex: string; name: string }[] = [
  { id: 'blush', hex: '#F4B8C8', name: 'Blush' },
  { id: 'rose', hex: '#E56B93', name: 'Rose' },
  { id: 'cherry', hex: '#C23B4B', name: 'Cherry' },
  { id: 'peach', hex: '#F3A57A', name: 'Peach' },
  { id: 'butter', hex: '#F6D56B', name: 'Butter' },
  { id: 'marigold', hex: '#E8943A', name: 'Marigold' },
  { id: 'sage', hex: '#A8C3A0', name: 'Sage' },
  { id: 'leaf', hex: '#3E8F62', name: 'Leaf' },
  { id: 'sky', hex: '#8EC6E6', name: 'Sky' },
  { id: 'sea', hex: '#2F7C8A', name: 'Sea' },
  { id: 'navy', hex: '#24315C', name: 'Navy' },
  { id: 'lilac', hex: '#CDB4E4', name: 'Lilac' },
  { id: 'plum', hex: '#7A4E8A', name: 'Plum' },
  { id: 'cream', hex: '#F7F1E6', name: 'Cream' },
  { id: 'cocoa', hex: '#6B4332', name: 'Cocoa' },
  { id: 'ink', hex: '#2C3338', name: 'Ink' },
];

export const FABRICS: FabricInfo[] = [
  { id: 'solid', name: 'Solid', blurb: 'One smooth color.', price: 0, starter: true },
  { id: 'stripes', name: 'Stripes', blurb: 'Neat and graphic.', price: 0, starter: true },
  { id: 'polka', name: 'Polka dots', blurb: 'Happy little dots.', price: 0, starter: true },
  { id: 'sequins', name: 'Sequins', blurb: 'Party sparkle.', price: 0, starter: true },
  { id: 'floral', name: 'Flowers', blurb: 'A garden you can wear.', price: 25 },
  { id: 'denim', name: 'Denim', blurb: 'Sturdy twill, gold stitches.', price: 35 },
  { id: 'tulle', name: 'Tulle', blurb: 'Cloudy and twirly.', price: 45 },
  { id: 'velvet', name: 'Velvet', blurb: 'Soft, deep, and plush.', price: 55 },
  { id: 'rainbow', name: 'Rainbow', blurb: 'A secret the cat found.', price: 0, secret: true },
];

export const SKETCHES: SketchInfo[] = [
  {
    id: 'sunny-dress',
    name: 'Sunny Dress',
    blurb: 'A twirly dress for happy days.',
    note: 'Scoop neck, a real waist, and a skirt that moves.',
    tags: ['party', 'twirl', 'soft', 'floral'],
    price: 0,
    starter: true,
  },
  {
    id: 'rain-coat',
    name: 'Rain Coat',
    blurb: 'Warm, with a collar and pockets.',
    note: 'Long sleeves, lapels, and room for a rainy day.',
    tags: ['cozy', 'bold'],
    price: 0,
    starter: true,
  },
  {
    id: 'twirl-set',
    name: 'Twirl Set',
    blurb: 'A spinny skirt and a little top.',
    note: 'The skirt is almost a circle. It wants music.',
    tags: ['twirl', 'party', 'sparkly'],
    price: 0,
    starter: true,
  },
  {
    id: 'hero-cape',
    name: 'Hero Cape',
    blurb: 'For stories, shows, and feeling brave.',
    note: 'A slim dress with a cape that opens in front.',
    tags: ['cape', 'party', 'bold', 'sparkly'],
    price: 0,
    starter: true,
  },
  {
    id: 'garden-gown',
    name: 'Garden Gown',
    blurb: 'A huge skirt, like a flower.',
    note: 'Off-the-shoulder bodice and a ballgown skirt.',
    tags: ['floral', 'party', 'twirl', 'sparkly', 'soft'],
    price: 50,
  },
  {
    id: 'puff-pencil',
    name: 'Puff & Pencil',
    blurb: 'Puffy sleeves and a slim skirt.',
    note: 'Cloud sleeves on top, a narrow skirt below.',
    tags: ['soft', 'party', 'bold'],
    price: 40,
  },
  {
    id: 'palazzo',
    name: 'Palazzo Day',
    blurb: 'Pants that swish when you walk.',
    note: 'A tucked top and wide, wide legs.',
    tags: ['cozy', 'bold', 'soft'],
    price: 40,
  },
  {
    id: 'crop-jacket',
    name: 'Cropped Jacket',
    blurb: 'A short jacket with sharp lapels.',
    note: 'The jacket ends at the waist. A skirt peeks out.',
    tags: ['bold', 'cozy'],
    price: 45,
  },
  {
    id: 'pleat-parade',
    name: 'Pleat Parade',
    blurb: 'A skirt with lots of folds.',
    note: 'Accordion pleats that catch the light.',
    tags: ['twirl', 'soft', 'floral'],
    price: 45,
  },
  {
    id: 'jumpsuit',
    name: 'One-Piece Wonder',
    blurb: 'A jumpsuit, all in one.',
    note: 'Sleeveless, waisted, with wide legs.',
    tags: ['bold', 'party', 'cozy'],
    price: 50,
  },
];

export const ACCESSORIES: AccessoryInfo[] = [
  { id: 'bow', name: 'Bow', blurb: 'A tied bow at the waist or neck.', price: 0, starter: true },
  { id: 'buttons', name: 'Buttons', blurb: 'A row of shiny buttons.', price: 0, starter: true },
  { id: 'shoes', name: 'Shoes', blurb: 'A matching pair.', price: 0, starter: true },
  { id: 'sequins', name: 'Sequin dust', blurb: 'Extra sparkles on top.', price: 25 },
  { id: 'belt', name: 'Belt', blurb: 'A belt with a gold buckle.', price: 20 },
  { id: 'hat', name: 'Beret', blurb: 'Tilted, just so.', price: 30 },
  { id: 'bag', name: 'Bag', blurb: 'A little handbag.', price: 30 },
];

export const DECOR: DecorInfo[] = [
  { id: 'flowers', name: 'Window flowers', blurb: 'A bouquet on the sill.', price: 25 },
  { id: 'rug', name: 'Round rug', blurb: 'A blush rug for twirling.', price: 30 },
  { id: 'lights', name: 'String lights', blurb: 'Warm bulbs across the shop.', price: 40 },
  { id: 'mirror', name: 'Gold mirror', blurb: 'So customers can admire.', price: 45 },
  { id: 'chandelier', name: 'Chandelier', blurb: 'Crystals, if you tap kindly.', price: 60 },
];

export const CUSTOMERS: Customer[] = [
  {
    id: 'lila',
    name: 'Lila',
    skin: '#E7B48A',
    hair: 'puffs',
    hairColor: '#241910',
    blush: '#e8899a',
    streetKind: 'dress',
    streetTop: '#e23b6a',
    streetBottom: '#2a211c',
    request: 'Something sparkly for my birthday party!',
    hint: 'She loves pink and anything that shines.',
    icon: 'sparkle',
    color: '#E56B93',
    colorName: 'pink',
    mood: 'sparkly',
  },
  {
    id: 'theo',
    name: 'Theo',
    skin: '#F6D3BA',
    hair: 'crop',
    hairColor: '#4A3428',
    glasses: true,
    streetKind: 'separates',
    streetTop: '#2f6f86',
    streetBottom: '#e2a03a',
    request: 'A cozy look for a rainy day, please.',
    hint: 'Blue, soft, and warm would feel just right.',
    icon: 'umbrella',
    color: '#8EC6E6',
    colorName: 'blue',
    mood: 'cozy',
  },
  {
    id: 'noor',
    name: 'Noor',
    skin: '#C48A62',
    hair: 'hijab',
    hairColor: '#3f6b52',
    streetKind: 'dress',
    streetTop: '#c45b8a',
    streetBottom: '#3f6b52',
    request: 'I want to look like a garden.',
    hint: 'Flowers and green are her favorites.',
    icon: 'flower',
    color: '#3E8F62',
    colorName: 'green',
    mood: 'floral',
  },
  {
    id: 'jo',
    name: 'Jo',
    skin: '#8D5A3C',
    hair: 'locs',
    hairColor: '#1A120E',
    streetKind: 'separates',
    streetTop: '#f2c14e',
    streetBottom: '#6b2a4a',
    request: 'I’m going dancing. Big and twirly, please!',
    hint: 'Purple and a skirt that can spin.',
    icon: 'music',
    color: '#7A4E8A',
    colorName: 'purple',
    mood: 'twirl',
  },
  {
    id: 'amos',
    name: 'Amos',
    skin: '#5C3A2A',
    hair: 'crop',
    hairColor: '#1A120E',
    streetKind: 'separates',
    streetTop: '#f4f1ea',
    streetBottom: '#1e2a4a',
    request: 'I need a sharp look for a recital.',
    hint: 'Red, and something with a strong shape.',
    icon: 'star',
    color: '#C23B4B',
    colorName: 'red',
    mood: 'bold',
  },
  {
    id: 'bea',
    name: 'Bea',
    skin: '#F3D0B5',
    hair: 'bun',
    hairColor: '#C4922A',
    streetKind: 'dress',
    streetTop: '#7a4e8a',
    streetBottom: '#f2c14e',
    request: 'Something soft for tea with Grandma.',
    hint: 'Cream, lilac, and gentle shapes.',
    icon: 'cup',
    color: '#CDB4E4',
    colorName: 'lilac',
    mood: 'soft',
  },
  {
    id: 'rio',
    name: 'Rio',
    skin: '#E0A87A',
    hair: 'curls',
    hairColor: '#6B2D12',
    freckles: true,
    streetKind: 'dress',
    streetTop: '#e07a3d',
    streetBottom: '#2a211c',
    request: 'Surprise me with your boldest color!',
    hint: 'The brighter, the better.',
    icon: 'palette',
    color: '#E8943A',
    colorName: 'orange',
    mood: 'bold',
  },
  {
    id: 'sasha',
    name: 'Sasha',
    skin: '#F0C7A0',
    hair: 'braid',
    hairColor: '#2C2118',
    streetKind: 'separates',
    streetTop: '#f7f1e6',
    streetBottom: '#2f7c8a',
    request: 'A cape! I feel like a story today.',
    hint: 'Teal, and a cape if you have one.',
    icon: 'book',
    color: '#2F7C8A',
    colorName: 'teal',
    mood: 'cape',
  },
];

export const JULES: Customer = {
  id: 'jules',
  name: 'Jules',
  skin: '#C68642',
  hair: 'bob',
  hairColor: '#1A120E',
  beret: true,
  streetKind: 'separates',
  streetTop: '#1a120e',
  streetBottom: '#e56b93',
  request: 'We’re putting on a fashion show!',
  hint: 'Design three looks for the theme.',
  icon: 'mic',
  color: '#F6D56B',
  colorName: 'gold',
  mood: 'party',
  show: true,
};

export const THEMES: Theme[] = [
  {
    id: 'garden',
    name: 'Garden Party',
    blurb: 'Flowers, soft colors, and twirly skirts.',
    icon: 'flower',
    chips: ['Flowers', 'Soft colors', 'Twirly'],
    colors: ['#F4B8C8', '#3E8F62', '#F6D56B', '#CDB4E4'],
    patterns: ['floral', 'polka', 'tulle', 'solid'],
    sketches: ['garden-gown', 'twirl-set', 'sunny-dress', 'pleat-parade'],
  },
  {
    id: 'starry',
    name: 'Starry Night',
    blurb: 'Deep colors, shine, and a little drama.',
    icon: 'sparkle',
    chips: ['Shine', 'Deep colors', 'Drama'],
    colors: ['#24315C', '#F6D56B', '#7A4E8A', '#F7F1E6'],
    patterns: ['sequins', 'velvet', 'solid', 'rainbow'],
    sketches: ['hero-cape', 'garden-gown', 'jumpsuit', 'puff-pencil'],
  },
  {
    id: 'picnic',
    name: 'Sunny Picnic',
    blurb: 'Bright, comfy, and happy.',
    icon: 'palette',
    chips: ['Bright', 'Comfy', 'Happy'],
    colors: ['#F6D56B', '#E8943A', '#A8C3A0', '#F7F1E6'],
    patterns: ['stripes', 'polka', 'floral', 'solid'],
    sketches: ['sunny-dress', 'twirl-set', 'palazzo', 'pleat-parade'],
  },
  {
    id: 'rainy',
    name: 'Rainy Day Chic',
    blurb: 'Coats, cozy colors, puddle-jumping style.',
    icon: 'umbrella',
    chips: ['Cozy', 'Coats', 'Blues'],
    colors: ['#2F7C8A', '#8EC6E6', '#6B4332', '#24315C'],
    patterns: ['denim', 'solid', 'stripes', 'velvet'],
    sketches: ['rain-coat', 'crop-jacket', 'palazzo', 'jumpsuit'],
  },
  {
    id: 'birthday',
    name: 'Birthday Sparkle',
    blurb: 'The most celebration you can sew.',
    icon: 'sparkle',
    chips: ['Sparkle', 'Party', 'Pink & gold'],
    colors: ['#E56B93', '#F6D56B', '#7A4E8A', '#F7F1E6'],
    patterns: ['sequins', 'polka', 'rainbow', 'tulle'],
    sketches: ['twirl-set', 'hero-cape', 'garden-gown', 'sunny-dress'],
  },
];

export function fabricById(id: FabricId): FabricInfo {
  return FABRICS.find((f) => f.id === id) ?? FABRICS[0];
}

export function sketchById(id: SketchId): SketchInfo {
  return SKETCHES.find((s) => s.id === id) ?? SKETCHES[0];
}

export function accessoryById(id: AccessoryId): AccessoryInfo {
  return ACCESSORIES.find((a) => a.id === id) ?? ACCESSORIES[0];
}

export function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function closestPalette(hex: string): string {
  let best = PALETTE[0].hex;
  let bestD = Infinity;
  const parse = (h: string) => {
    const n = Number.parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const A = parse(hex);
  for (const swatch of PALETTE) {
    const B = parse(swatch.hex);
    const d = Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
    if (d < bestD) {
      bestD = d;
      best = swatch.hex;
    }
  }
  return best;
}

export function colorName(hex: string): string {
  let best = PALETTE[0];
  let bestD = Infinity;
  const parse = (h: string) => {
    const n = Number.parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const A = parse(hex);
  for (const swatch of PALETTE) {
    const B = parse(swatch.hex);
    const d = Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
    if (d < bestD) {
      bestD = d;
      best = swatch;
    }
  }
  return best.name;
}

export const STARTER_FABRICS: FabricId[] = FABRICS.filter((f) => f.starter).map((f) => f.id);
export const STARTER_SKETCHES: SketchId[] = SKETCHES.filter((s) => s.starter).map((s) => s.id);
export const STARTER_ACCESSORIES: AccessoryId[] = ACCESSORIES.filter((a) => a.starter).map((a) => a.id);
