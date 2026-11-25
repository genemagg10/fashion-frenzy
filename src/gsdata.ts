/** Game-show mode: themes, ready-made outfits, hairstyles and accessories. */

export type GsThemeId = 'fairy' | 'mermaid' | 'space' | 'royal' | 'rock' | 'candy';
export type GsKind = 'girl' | 'boy';
export type GsSlot = 'head' | 'face' | 'neck' | 'back' | 'hand';

export interface GsTheme {
  id: GsThemeId;
  name: string;
  /** What the host says when the stage opens. */
  call: string;
  /** Short chips: what the judges are hoping to see. */
  wants: string[];
  palette: string[];
  /** Stage lighting: tint, glow, floor. */
  light: [string, string, string];
  particle: 'petal' | 'bubble' | 'star' | 'crown' | 'note' | 'candy';
  song: string;
}

export const GS_THEMES: GsTheme[] = [
  {
    id: 'fairy',
    name: 'Fairy Garden',
    call: 'Wings, petals and a little sparkle dust!',
    wants: ['wings', 'petals', 'flowers', 'wand'],
    palette: ['#F4B8C8', '#CDB4E4', '#A8C3A0', '#3E8F62', '#F7F1E6'],
    light: ['#f6b8d8', '#b8f0c8', '#fff3fb'],
    particle: 'petal',
    song: 'fairy',
  },
  {
    id: 'mermaid',
    name: 'Mermaid Lagoon',
    call: 'Shells, pearls and ocean shimmer!',
    wants: ['shells', 'pearls', 'sea colors', 'a trident'],
    palette: ['#2F7C8A', '#8EC6E6', '#CDB4E4', '#F4B8C8', '#F7F1E6'],
    light: ['#7fd8e6', '#b9a8f0', '#e9fbff'],
    particle: 'bubble',
    song: 'mermaid',
  },
  {
    id: 'space',
    name: 'Space Pop',
    call: 'Shiny silver, galaxy prints and star power!',
    wants: ['silver', 'stars', 'galaxy', 'gadgets'],
    palette: ['#24315C', '#7A4E8A', '#CDB4E4', '#8EC6E6', '#E56B93'],
    light: ['#7b6cff', '#ff7ad9', '#eef0ff'],
    particle: 'star',
    song: 'space',
  },
  {
    id: 'royal',
    name: 'Royal Ball',
    call: 'Gowns, crowns and a grand entrance!',
    wants: ['a crown', 'gold', 'a cape', 'ball looks'],
    palette: ['#8EC6E6', '#E56B93', '#7A4E8A', '#24315C', '#F6D56B'],
    light: ['#ffd27a', '#c9a2ff', '#fff8ec'],
    particle: 'crown',
    song: 'royal',
  },
  {
    id: 'rock',
    name: 'Rockstar',
    call: 'Leather, lightning and a big stage voice!',
    wants: ['black & neon', 'a guitar or mic', 'shades', 'boots'],
    palette: ['#2C3338', '#E56B93', '#7A4E8A', '#C23B4B', '#F6D56B'],
    light: ['#ff4fa3', '#5b7cff', '#ffeefa'],
    particle: 'note',
    song: 'rock',
  },
  {
    id: 'candy',
    name: 'Candyland',
    call: 'Sprinkles, swirls and sugar-sweet colors!',
    wants: ['pastels', 'sprinkles', 'a lollipop', 'bows'],
    palette: ['#F4B8C8', '#E56B93', '#8EC6E6', '#F6D56B', '#A8C3A0'],
    light: ['#ffb3d1', '#ffe58a', '#fff7fb'],
    particle: 'candy',
    song: 'candy',
  },
];

export interface GsOutfit {
  id: string;
  name: string;
  kind: GsKind;
  theme: GsThemeId;
  colors: string[];
  /** Outfits that already have wings painted on. */
  winged?: boolean;
}

const o = (id: string, name: string, kind: GsKind, theme: GsThemeId, colors: string[], winged = false): GsOutfit => ({ id, name, kind, theme, colors, winged });

export const GS_OUTFITS: GsOutfit[] = [
  o('petal-gown', 'Rose Petal Gown', 'girl', 'fairy', ['#F4B8C8', '#E56B93']),
  o('dewdrop-dress', 'Dewdrop Dress', 'girl', 'fairy', ['#A8C3A0', '#F7F1E6']),
  o('butterfly-gown', 'Butterfly Gown', 'girl', 'fairy', ['#CDB4E4', '#7A4E8A'], true),
  o('leaf-tunic', 'Leaf Tunic', 'boy', 'fairy', ['#3E8F62', '#6B4332']),
  o('moss-vest', 'Moss Vest', 'boy', 'fairy', ['#3E8F62', '#F7F1E6']),
  o('lilac-prince', 'Lilac Pixie Tunic', 'boy', 'fairy', ['#CDB4E4', '#F7F1E6']),
  o('scale-gown', 'Shimmer Scale Gown', 'girl', 'mermaid', ['#2F7C8A', '#8EC6E6']),
  o('shell-dress', 'Seashell Wave Dress', 'girl', 'mermaid', ['#8EC6E6', '#F4B8C8']),
  o('pearl-bubble', 'Pearl Bubble Dress', 'girl', 'mermaid', ['#CDB4E4', '#8EC6E6']),
  o('surf-shirt', 'Wave Surf Shirt', 'boy', 'mermaid', ['#8EC6E6', '#2F7C8A']),
  o('sailor-captain', 'Sea Captain', 'boy', 'mermaid', ['#24315C', '#F7F1E6']),
  o('scale-vest', 'Scale Vest', 'boy', 'mermaid', ['#2F7C8A', '#F7F1E6']),
  o('holo-mini', 'Holo Mini Dress', 'girl', 'space', ['#CDB4E4', '#F7F1E6']),
  o('galaxy-gown', 'Galaxy Gown', 'girl', 'space', ['#24315C', '#F6D56B']),
  o('space-jumpsuit', 'Rocket Jumpsuit', 'girl', 'space', ['#E56B93', '#7A4E8A']),
  o('astro-suit', 'Astro Suit', 'boy', 'space', ['#F7F1E6', '#E8943A']),
  o('holo-bomber', 'Holo Bomber', 'boy', 'space', ['#CDB4E4', '#8EC6E6']),
  o('galaxy-hoodie', 'Galaxy Hoodie', 'boy', 'space', ['#7A4E8A', '#CDB4E4']),
  o('sky-ballgown', 'Sky Ball Gown', 'girl', 'royal', ['#8EC6E6', '#F6D56B']),
  o('rose-ballgown', 'Rose Ball Gown', 'girl', 'royal', ['#E56B93', '#F4B8C8']),
  o('velvet-gown', 'Velvet Royal Gown', 'girl', 'royal', ['#7A4E8A', '#F6D56B']),
  o('prince-jacket', 'Prince Jacket', 'boy', 'royal', ['#24315C', '#F6D56B']),
  o('tux-tails', 'Tux with Tails', 'boy', 'royal', ['#2C3338', '#C23B4B']),
  o('gold-prince', 'Golden Prince Coat', 'boy', 'royal', ['#F7F1E6', '#F6D56B']),
  o('leather-tutu', 'Leather & Tutu', 'girl', 'rock', ['#2C3338', '#E56B93']),
  o('lightning-sequin', 'Lightning Sequins', 'girl', 'rock', ['#7A4E8A', '#F6D56B']),
  o('plaid-band', 'Plaid Band Tee', 'girl', 'rock', ['#C23B4B', '#2C3338']),
  o('leather-jeans', 'Leather & Jeans', 'boy', 'rock', ['#2C3338', '#C23B4B']),
  o('gold-stage', 'Gold Stage Jacket', 'boy', 'rock', ['#F6D56B', '#2C3338']),
  o('lightning-denim', 'Lightning Denim', 'boy', 'rock', ['#24315C', '#2C3338']),
  o('cupcake-dress', 'Cupcake Dress', 'girl', 'candy', ['#F4B8C8', '#E56B93']),
  o('swirl-dress', 'Peppermint Swirl', 'girl', 'candy', ['#A8C3A0', '#F7F1E6']),
  o('gumdrop-tutu', 'Gumdrop Tutu', 'girl', 'candy', ['#F6D56B', '#E56B93']),
  o('peppermint-shorts', 'Peppermint Stripes', 'boy', 'candy', ['#E56B93', '#A8C3A0']),
  o('cotton-hoodie', 'Cotton Candy Hoodie', 'boy', 'candy', ['#8EC6E6', '#F4B8C8']),
  o('cherry-cocoa', 'Cherry Cocoa Jacket', 'boy', 'candy', ['#6B4332', '#F4B8C8']),
];

export interface GsHair {
  id: string;
  name: string;
  kind: GsKind;
  themes: GsThemeId[];
  color: string;
}

export const GS_HAIR: GsHair[] = [
  { id: 'fairy-braid', name: 'Blossom Waves', kind: 'girl', themes: ['fairy', 'candy'], color: '#F4B8C8' },
  { id: 'mermaid-waves', name: 'Ocean Waves', kind: 'girl', themes: ['mermaid'], color: '#2F7C8A' },
  { id: 'space-buns', name: 'Space Buns', kind: 'girl', themes: ['space'], color: '#CDB4E4' },
  { id: 'royal-updo', name: 'Royal Updo', kind: 'girl', themes: ['royal'], color: '#F6D56B' },
  { id: 'rock-streak', name: 'Pink Streak', kind: 'girl', themes: ['rock'], color: '#2C3338' },
  { id: 'candy-pigtails', name: 'Candy Pigtails', kind: 'girl', themes: ['candy'], color: '#E56B93' },
  { id: 'cloud-curls', name: 'Cloud Curls', kind: 'girl', themes: [], color: '#6B4332' },
  { id: 'long-sleek', name: 'Long & Sleek', kind: 'girl', themes: [], color: '#6B4332' },
  { id: 'copper-bob', name: 'Copper Bob', kind: 'girl', themes: [], color: '#C23B4B' },
  { id: 'honey-pony', name: 'Honey Ponytail', kind: 'girl', themes: [], color: '#F6D56B' },
  { id: 'leafy-tousle', name: 'Leafy Tousle', kind: 'boy', themes: ['fairy'], color: '#3E8F62' },
  { id: 'surfer-shag', name: 'Surfer Shag', kind: 'boy', themes: ['mermaid'], color: '#F6D56B' },
  { id: 'electric-spikes', name: 'Electric Spikes', kind: 'boy', themes: ['space'], color: '#24315C' },
  { id: 'prince-part', name: 'Prince Part', kind: 'boy', themes: ['royal'], color: '#6B4332' },
  { id: 'rock-hawk', name: 'Rock Hawk', kind: 'boy', themes: ['rock'], color: '#2C3338' },
  { id: 'fluffy-curls', name: 'Fluffy Curls', kind: 'boy', themes: ['candy'], color: '#6B4332' },
];

export interface GsAccessory {
  id: string;
  name: string;
  slot: GsSlot;
  themes: GsThemeId[];
  color: string;
  /** Drawn width in avatar pixels, and where it sits. */
  w: number;
  anchor: 'crown' | 'band' | 'ears' | 'bow' | 'eyes' | 'neck' | 'tie' | 'back' | 'cape' | 'pack' | 'grip' | 'strap' | 'guitar';
  /** Offsets from the anchor, in avatar pixels. */
  dx?: number;
  dy?: number;
}

export const GS_ACCESSORIES: GsAccessory[] = [
  { id: 'flower-crown', name: 'Flower Crown', slot: 'head', themes: ['fairy'], color: '#F4B8C8', w: 98, anchor: 'crown', dy: 6 },
  { id: 'gold-crown', name: 'Gold Crown', slot: 'head', themes: ['royal'], color: '#F6D56B', w: 72, anchor: 'crown' },
  { id: 'silver-tiara', name: 'Silver Tiara', slot: 'head', themes: ['royal', 'fairy'], color: '#CDB4E4', w: 74, anchor: 'crown', dy: 4 },
  { id: 'shell-tiara', name: 'Shell Tiara', slot: 'head', themes: ['mermaid'], color: '#F4B8C8', w: 74, anchor: 'crown', dy: 4 },
  { id: 'star-antennae', name: 'Star Antennae', slot: 'head', themes: ['space'], color: '#CDB4E4', w: 96, anchor: 'band' },
  { id: 'cupcake-band', name: 'Cupcake Headband', slot: 'head', themes: ['candy'], color: '#F4B8C8', w: 86, anchor: 'band' },
  { id: 'star-headphones', name: 'Star Headphones', slot: 'head', themes: ['rock', 'space'], color: '#F4B8C8', w: 96, anchor: 'ears' },
  { id: 'lilac-bow', name: 'Big Bow', slot: 'head', themes: ['candy', 'fairy'], color: '#CDB4E4', w: 52, anchor: 'bow' },
  { id: 'heart-shades', name: 'Heart Shades', slot: 'face', themes: ['candy', 'rock'], color: '#E56B93', w: 64, anchor: 'eyes' },
  { id: 'star-shades', name: 'Star Shades', slot: 'face', themes: ['rock', 'space'], color: '#F6D56B', w: 66, anchor: 'eyes' },
  { id: 'gold-specs', name: 'Gold Specs', slot: 'face', themes: ['royal'], color: '#F6D56B', w: 60, anchor: 'eyes' },
  { id: 'visor-shades', name: 'Visor Shades', slot: 'face', themes: ['space'], color: '#8EC6E6', w: 66, anchor: 'eyes' },
  { id: 'pearl-heart', name: 'Pearl Necklace', slot: 'neck', themes: ['royal', 'mermaid'], color: '#F7F1E6', w: 48, anchor: 'neck' },
  { id: 'shell-necklace', name: 'Shell Necklace', slot: 'neck', themes: ['mermaid'], color: '#F4B8C8', w: 50, anchor: 'neck' },
  { id: 'candy-beads', name: 'Candy Beads', slot: 'neck', themes: ['candy'], color: '#E56B93', w: 50, anchor: 'neck' },
  { id: 'red-bowtie', name: 'Red Bowtie', slot: 'neck', themes: ['royal', 'rock'], color: '#C23B4B', w: 34, anchor: 'tie' },
  { id: 'fairy-wings', name: 'Fairy Wings', slot: 'back', themes: ['fairy'], color: '#F4B8C8', w: 240, anchor: 'back' },
  { id: 'butterfly-wings', name: 'Butterfly Wings', slot: 'back', themes: ['fairy'], color: '#CDB4E4', w: 240, anchor: 'back' },
  { id: 'royal-cape', name: 'Royal Cape', slot: 'back', themes: ['royal'], color: '#C23B4B', w: 196, anchor: 'cape' },
  { id: 'jetpack', name: 'Jetpack', slot: 'back', themes: ['space'], color: '#CDB4E4', w: 140, anchor: 'pack' },
  { id: 'fin-wings', name: 'Sea Fin Wings', slot: 'back', themes: ['mermaid'], color: '#8EC6E6', w: 230, anchor: 'back' },
  { id: 'star-wand', name: 'Star Wand', slot: 'hand', themes: ['fairy'], color: '#CDB4E4', w: 46, anchor: 'grip' },
  { id: 'trident', name: 'Golden Trident', slot: 'hand', themes: ['mermaid'], color: '#F6D56B', w: 54, anchor: 'grip' },
  { id: 'scepter', name: 'Royal Scepter', slot: 'hand', themes: ['royal'], color: '#F6D56B', w: 44, anchor: 'grip' },
  { id: 'microphone', name: 'Microphone', slot: 'hand', themes: ['rock'], color: '#CDB4E4', w: 34, anchor: 'grip' },
  { id: 'pink-guitar', name: 'Pink Guitar', slot: 'hand', themes: ['rock'], color: '#E56B93', w: 86, anchor: 'guitar' },
  { id: 'swirl-pop', name: 'Swirl Lollipop', slot: 'hand', themes: ['candy'], color: '#E56B93', w: 56, anchor: 'grip' },
  { id: 'planet-bag', name: 'Planet Bag', slot: 'hand', themes: ['space'], color: '#7A4E8A', w: 66, anchor: 'strap' },
  { id: 'shell-purse', name: 'Shell Purse', slot: 'hand', themes: ['mermaid'], color: '#F4B8C8', w: 64, anchor: 'strap' },
];

export const GS_SKINS: { id: string; hex: string; name: string }[] = [
  { id: 'porcelain', hex: '#FFE0C8', name: 'Light' },
  { id: 'peach', hex: '#FCBC7E', name: 'Peach' },
  { id: 'honey', hex: '#DB9659', name: 'Honey' },
  { id: 'caramel', hex: '#A8683C', name: 'Caramel' },
  { id: 'cocoa', hex: '#6F4127', name: 'Cocoa' },
];

export interface GsLook {
  kind: GsKind;
  skin: string;
  outfit: string;
  hair: string;
  acc: string[];
}

export const GS_RIVALS: { name: string; kind: GsKind }[] = [
  { name: 'Lulu', kind: 'girl' },
  { name: 'Max', kind: 'boy' },
  { name: 'Zara', kind: 'girl' },
  { name: 'Kai', kind: 'boy' },
  { name: 'Mia', kind: 'girl' },
  { name: 'Leo', kind: 'boy' },
  { name: 'Ivy', kind: 'girl' },
  { name: 'Sam', kind: 'boy' },
];

export const gsTheme = (id: string): GsTheme => GS_THEMES.find((t) => t.id === id) ?? GS_THEMES[0];
export const gsOutfit = (id: string): GsOutfit => GS_OUTFITS.find((x) => x.id === id) ?? GS_OUTFITS[0];
export const gsHair = (id: string): GsHair => GS_HAIR.find((x) => x.id === id) ?? GS_HAIR[0];
export const gsAcc = (id: string): GsAccessory | undefined => GS_ACCESSORIES.find((x) => x.id === id);
