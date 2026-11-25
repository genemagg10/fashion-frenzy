export type FabricId =
  | 'solid'
  | 'stripes'
  | 'polka'
  | 'floral'
  | 'denim'
  | 'sequins'
  | 'velvet'
  | 'tulle'
  | 'rainbow';

export type SketchId =
  | 'sunny-dress'
  | 'rain-coat'
  | 'twirl-set'
  | 'hero-cape'
  | 'garden-gown'
  | 'puff-pencil'
  | 'palazzo'
  | 'crop-jacket'
  | 'pleat-parade'
  | 'jumpsuit'
  | 'ball-gown'
  | 'princess-gown'
  | 'mermaid-gown'
  | 'sunset-chiffon'
  | 'garden-roses'
  | 'starry-gown'
  | 'butterfly-cape'
  | 'tiered-ruffle'
  | 'ice-crystal'
  | 'candy-party'
  | 'peacock-train'
  | 'cherry-kimono'
  | 'sparkle-bomber'
  | 'cozy-hoodie'
  | 'garden-shirt'
  | 'dance-tux'
  | 'hero-cape-set'
  | 'knit-set'
  | 'party-zip'
  | 'bold-blazer';

export type AccessoryId = 'bow' | 'buttons' | 'sequins' | 'belt' | 'hat' | 'bag' | 'shoes';

export type DecorId = 'rug' | 'flowers' | 'lights' | 'chandelier' | 'mirror';

export type Mood = 'sparkly' | 'cozy' | 'floral' | 'twirl' | 'bold' | 'soft' | 'cape' | 'party';

export type HairStyle =
  | 'bob'
  | 'curls'
  | 'bun'
  | 'crop'
  | 'locs'
  | 'waves'
  | 'puffs'
  | 'braid'
  | 'pony'
  | 'hijab';

export type Scene =
  | 'title'
  | 'shop'
  | 'sketch'
  | 'studio'
  | 'reaction'
  | 'runway'
  | 'awards'
  | 'lookbook'
  | 'shelf'
  | 'gallery'
  | 'cover'
  | 'reviews'
  | 'gameshow';

export interface PersonLook {
  skin: string;
  hair: HairStyle;
  hairColor: string;
  glasses?: boolean;
  freckles?: boolean;
  beret?: boolean;
  blush?: string;
  /** Everyday clothes the customer walks in wearing. */
  streetTop?: string;
  streetBottom?: string;
  streetKind?: 'dress' | 'separates';
}

export interface Wish {
  colors: string[];
  patterns: FabricId[];
  tags: string[];
  secret?: AccessoryId;
}

export type BoardBit = { kind: 'swatch'; hex: string } | { kind: 'icon'; name: string } | { kind: 'puppy' };

export interface Review {
  id: string;
  name: string;
  stars: number;
  quote: string;
  coins: number;
  look: PersonLook;
}

export interface Customer extends PersonLook {
  id: string;
  name: string;
  request: string;
  hint: string;
  icon: string;
  color: string;
  colorName: string;
  mood: Mood;
  show?: boolean;
  fancy?: boolean;
  /** Boy customers get the boys' line of sketches. */
  boy?: boolean;
  wish: Wish;
  board: BoardBit[];
}

export interface Outfit {
  id: string;
  sketchId: SketchId;
  pattern: FabricId;
  color: string;
  accessories: AccessoryId[];
  stars?: number;
  label?: string;
  themeId?: string;
  /** A Style Showdown look (game-show mode). Older saves simply do not have it. */
  gs?: { kind: 'girl' | 'boy'; skin: string; outfit: string; hair: string; acc: string[]; theme: string; place: number };
}

export interface Theme {
  id: string;
  name: string;
  blurb: string;
  icon: string;
  chips: string[];
  colors: string[];
  patterns: FabricId[];
  sketches: SketchId[];
}

export interface SaveData {
  v: 1;
  coins: number;
  hearts: number;
  stars: number;
  customersServed: number;
  showsDone: number;
  tutorialDone: boolean;
  muted: boolean;
  fabrics: FabricId[];
  sketches: SketchId[];
  accessories: AccessoryId[];
  decor: DecorId[];
  lookbook: Outfit[];
  rainbow: boolean;
  lastTheme?: string;
  tapeFound?: boolean;
  sewCounts?: Partial<Record<'seam' | 'pleat' | 'buttons' | 'zipper' | 'hem', number>>;
  reviews: Review[];
}
