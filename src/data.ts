import type {
  AccessoryId,
  BoardBit,
  Customer,
  DecorId,
  FabricId,
  SketchId,
  Theme,
  Wish,
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
  {
    id: 'ball-gown',
    name: 'Tulle Ball Gown',
    blurb: 'A huge skirt with a tulle overlay.',
    note: 'The skirt floats. The bodice stays close.',
    tags: ['party', 'twirl', 'sparkly', 'soft'],
    price: 70,
  },
  {
    id: 'princess-gown',
    name: 'Princess Gown',
    blurb: 'Puff sleeves and a storybook skirt.',
    note: 'Cloud sleeves, a fitted top, and a wide hem.',
    tags: ['party', 'twirl', 'soft', 'sparkly'],
    price: 70,
  },
  {
    id: 'mermaid-gown',
    name: 'Mermaid Gown',
    blurb: 'Fitted through the knees, then a sequin flare.',
    note: 'It shimmers when the light moves.',
    tags: ['party', 'sparkly', 'bold'],
    price: 75,
  },
  {
    id: 'sunset-chiffon',
    name: 'Sunset Chiffon',
    blurb: 'A dress that fades from pink to gold.',
    note: 'Light cloth, like the end of the day.',
    tags: ['soft', 'twirl', 'party'],
    price: 70,
  },
  {
    id: 'garden-roses',
    name: 'Flower Garden Gown',
    blurb: 'Tiny roses stitched all over.',
    note: 'A gown for someone who talks to flowers.',
    tags: ['floral', 'party', 'soft'],
    price: 75,
  },
  {
    id: 'starry-gown',
    name: 'Starry Night Gown',
    blurb: 'A dark dress with twinkling stars.',
    note: 'Wear it when the sky is the guest of honor.',
    tags: ['sparkly', 'party', 'bold'],
    price: 75,
  },
  {
    id: 'butterfly-cape',
    name: 'Butterfly Cape Dress',
    blurb: 'Wings at the shoulders and a soft skirt.',
    note: 'The cape opens like wings.',
    tags: ['cape', 'party', 'sparkly', 'twirl'],
    price: 70,
  },
  {
    id: 'tiered-ruffle',
    name: 'Ruffled Tier Gown',
    blurb: 'Three flounces, one after another.',
    note: 'Each tier gets a little wider.',
    tags: ['twirl', 'party', 'soft'],
    price: 70,
  },
  {
    id: 'ice-crystal',
    name: 'Ice Crystal Gown',
    blurb: 'Pale cloth with little crystal sparks.',
    note: 'Cool colors, warm stitching.',
    tags: ['sparkly', 'soft', 'party'],
    price: 75,
  },
  {
    id: 'candy-party',
    name: 'Candy Party Dress',
    blurb: 'Pastel stripes and a party bow.',
    note: 'Short, sweet, and ready to dance.',
    tags: ['party', 'twirl', 'sparkly', 'bold'],
    price: 65,
  },
  {
    id: 'peacock-train',
    name: 'Peacock Train',
    blurb: 'A long train with jewel-colored eyes.',
    note: 'The train needs room to sweep.',
    tags: ['party', 'bold', 'sparkly', 'floral'],
    price: 80,
  },
  {
    id: 'cherry-kimono',
    name: 'Cherry Blossom Wrap',
    blurb: 'A kimono-inspired dress with blossoms.',
    note: 'Wide sleeves, a bright obi, and tiny flowers.',
    tags: ['floral', 'soft', 'party'],
    price: 75,
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
    request: 'I want to shine at my birthday!',
    hint: 'The pictures are clues. You choose the rest.',
    icon: 'sparkle',
    color: '#E56B93',
    colorName: 'rose',
    mood: 'sparkly',
    wish: { colors: ['#E56B93', '#F4B8C8', '#C23B4B'], patterns: ['sequins', 'polka'], tags: ['sparkly', 'party'], secret: 'bow' },
    board: [
      { kind: 'swatch', hex: '#E56B93' },
      { kind: 'swatch', hex: '#F4B8C8' },
      { kind: 'icon', name: 'sparkle' },
    ],
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
    request: 'I love the ocean on a quiet day.',
    hint: 'Blues and teals feel like the sea.',
    icon: 'umbrella',
    color: '#8EC6E6',
    colorName: 'sky',
    mood: 'cozy',
    wish: { colors: ['#8EC6E6', '#2F7C8A', '#24315C'], patterns: ['velvet', 'denim', 'solid'], tags: ['cozy'], secret: 'belt' },
    board: [
      { kind: 'swatch', hex: '#8EC6E6' },
      { kind: 'swatch', hex: '#2F7C8A' },
      { kind: 'icon', name: 'umbrella' },
    ],
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
    request: 'I want to look like a garden after rain.',
    hint: 'Greens and little flowers, if you see them.',
    icon: 'flower',
    color: '#3E8F62',
    colorName: 'leaf',
    mood: 'floral',
    fancy: true,
    wish: { colors: ['#3E8F62', '#A8C3A0'], patterns: ['floral', 'tulle'], tags: ['floral'], secret: 'bow' },
    board: [
      { kind: 'swatch', hex: '#3E8F62' },
      { kind: 'swatch', hex: '#A8C3A0' },
      { kind: 'icon', name: 'flower' },
    ],
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
    request: 'Play me a song I can spin to.',
    hint: 'Think of music, purple, and a skirt that moves.',
    icon: 'music',
    color: '#7A4E8A',
    colorName: 'plum',
    mood: 'twirl',
    wish: { colors: ['#7A4E8A', '#CDB4E4'], patterns: ['tulle', 'polka', 'sequins'], tags: ['twirl', 'party'], secret: 'sequins' },
    board: [
      { kind: 'swatch', hex: '#7A4E8A' },
      { kind: 'swatch', hex: '#CDB4E4' },
      { kind: 'icon', name: 'music' },
    ],
  },
  {
    id: 'amos',
    name: 'Amos',
    skin: '#5C3A2A',
    hair: 'pony',
    hairColor: '#1A120E',
    streetKind: 'separates',
    streetTop: '#f4f1ea',
    streetBottom: '#1e2a4a',
    request: 'The stage lights are waiting for me.',
    hint: 'A brave color and a strong shape.',
    icon: 'star',
    color: '#C23B4B',
    colorName: 'cherry',
    mood: 'bold',
    wish: { colors: ['#C23B4B', '#E8943A'], patterns: ['stripes', 'solid'], tags: ['bold'], secret: 'buttons' },
    board: [
      { kind: 'swatch', hex: '#C23B4B' },
      { kind: 'icon', name: 'star' },
      { kind: 'swatch', hex: '#E8943A' },
    ],
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
    request: 'Tea with Grandma should feel like a cloud.',
    hint: 'Soft colors. Nothing too sharp.',
    icon: 'cup',
    color: '#CDB4E4',
    colorName: 'lilac',
    mood: 'soft',
    fancy: true,
    wish: { colors: ['#CDB4E4', '#F7F1E6', '#F4B8C8'], patterns: ['velvet', 'solid'], tags: ['soft'], secret: 'bow' },
    board: [
      { kind: 'swatch', hex: '#F7F1E6' },
      { kind: 'swatch', hex: '#CDB4E4' },
      { kind: 'icon', name: 'cup' },
    ],
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
    request: 'Surprise me with a color that shouts.',
    hint: 'Bright is friendly. Loud is welcome.',
    icon: 'palette',
    color: '#E8943A',
    colorName: 'marigold',
    mood: 'bold',
    wish: { colors: ['#E8943A', '#C23B4B', '#7A4E8A'], patterns: ['stripes', 'sequins'], tags: ['bold', 'party'], secret: 'hat' },
    board: [
      { kind: 'swatch', hex: '#E8943A' },
      { kind: 'icon', name: 'palette' },
      { kind: 'swatch', hex: '#C23B4B' },
    ],
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
    request: 'Today I feel like a story with a breeze.',
    hint: 'Sea colors, and maybe something that can fly behind you.',
    icon: 'book',
    color: '#2F7C8A',
    colorName: 'sea',
    mood: 'cape',
    fancy: true,
    wish: { colors: ['#2F7C8A', '#24315C', '#8EC6E6'], patterns: ['solid', 'velvet'], tags: ['cape', 'bold'], secret: 'belt' },
    board: [
      { kind: 'swatch', hex: '#2F7C8A' },
      { kind: 'swatch', hex: '#8EC6E6' },
      { kind: 'icon', name: 'book' },
    ],
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
  wish: { colors: ['#F6D56B', '#E56B93', '#7A4E8A'], patterns: ['sequins', 'tulle', 'solid'], tags: ['party', 'sparkly'] },
  board: [
    { kind: 'swatch', hex: '#F6D56B' },
    { kind: 'icon', name: 'mic' },
    { kind: 'swatch', hex: '#E56B93' },
  ],
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

export const RUNWAY_GOWNS: SketchId[] = [
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
];

const ROUND_BRIEFS: { request: string; hint: string; wish: Wish; board: BoardBit[] }[] = [
  {
    request: 'Something rainy and cheerful, please!',
    hint: 'Puddles and sunshine can live in one outfit.',
    wish: { colors: ['#8EC6E6', '#F6D56B', '#2F7C8A'], patterns: ['polka', 'stripes', 'solid'], tags: ['cozy', 'bold'], secret: 'buttons' },
    board: [
      { kind: 'swatch', hex: '#8EC6E6' },
      { kind: 'swatch', hex: '#F6D56B' },
      { kind: 'icon', name: 'umbrella' },
    ],
  },
  {
    request: 'Can you match my puppy?',
    hint: 'Warm, soft, and a little bit fluffy.',
    wish: { colors: ['#E8943A', '#F3A57A', '#6B4332'], patterns: ['velvet', 'solid'], tags: ['soft', 'cozy'], secret: 'bow' },
    board: [{ kind: 'puppy' }, { kind: 'swatch', hex: '#E8943A' }, { kind: 'swatch', hex: '#F3A57A' }],
  },
  {
    request: 'I have a recital tonight!',
    hint: 'The stage likes a brave color and a shape that moves.',
    wish: { colors: ['#C23B4B', '#7A4E8A', '#F6D56B'], patterns: ['sequins', 'tulle'], tags: ['party', 'twirl', 'bold'], secret: 'sequins' },
    board: [
      { kind: 'swatch', hex: '#C23B4B' },
      { kind: 'icon', name: 'star' },
      { kind: 'swatch', hex: '#7A4E8A' },
    ],
  },
  {
    request: 'Surprise me with a gown.',
    hint: 'The bigger the skirt, the better the story.',
    wish: { colors: ['#CDB4E4', '#E56B93', '#F7F1E6'], patterns: ['tulle', 'floral', 'sequins'], tags: ['party', 'twirl', 'sparkly'], secret: 'bow' },
    board: [
      { kind: 'swatch', hex: '#CDB4E4' },
      { kind: 'swatch', hex: '#E56B93' },
      { kind: 'icon', name: 'sparkle' },
    ],
  },
];

export function briefFor(served: number): { request: string; hint: string; wish: Wish; board: BoardBit[] } | null {
  if (served < 1) return null;
  return ROUND_BRIEFS[(served - 1) % ROUND_BRIEFS.length];
}

export function grantRoundRewards(save: {
  sketches: SketchId[];
  fabrics: FabricId[];
  accessories: AccessoryId[];
}): string[] {
  const notes: string[] = [];
  const sketchQueue: SketchId[] = [
    'garden-gown',
    'ball-gown',
    'princess-gown',
    'puff-pencil',
    'starry-gown',
    'garden-roses',
    'palazzo',
    'mermaid-gown',
    'sunset-chiffon',
    'pleat-parade',
    'butterfly-cape',
    'tiered-ruffle',
    'crop-jacket',
    'ice-crystal',
    'candy-party',
    'jumpsuit',
    'peacock-train',
    'cherry-kimono',
  ];
  const nextSketch = sketchQueue.find((id) => !save.sketches.includes(id));
  if (nextSketch) {
    save.sketches.push(nextSketch);
    notes.push(sketchById(nextSketch).name);
  }
  const fabricQueue: FabricId[] = ['floral', 'denim', 'tulle', 'velvet'];
  if (save.sketches.length % 2 === 0) {
    const nextFabric = fabricQueue.find((id) => !save.fabrics.includes(id));
    if (nextFabric) {
      save.fabrics.push(nextFabric);
      notes.push(fabricById(nextFabric).name);
    }
  }
  const trimQueue: AccessoryId[] = ['sequins', 'belt', 'hat', 'bag'];
  if (save.sketches.length % 3 === 0) {
    const nextTrim = trimQueue.find((id) => !save.accessories.includes(id));
    if (nextTrim) {
      save.accessories.push(nextTrim);
      notes.push(accessoryById(nextTrim).name);
    }
  }
  return notes;
}

export const STARTER_FABRICS: FabricId[] = FABRICS.filter((f) => f.starter).map((f) => f.id);
export const STARTER_SKETCHES: SketchId[] = SKETCHES.filter((s) => s.starter).map((s) => s.id);
export const STARTER_ACCESSORIES: AccessoryId[] = ACCESSORIES.filter((a) => a.starter).map((a) => a.id);
