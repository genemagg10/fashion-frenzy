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
  | 'jumpsuit';

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
  | 'cover';

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
}
