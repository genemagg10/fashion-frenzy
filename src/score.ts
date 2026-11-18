import { colorsClose, luminance, saturation } from './color';
import { sketchById } from './data';
import type { AccessoryId, Customer, FabricId, SketchId } from './types';

export interface Draft {
  sketchId: SketchId;
  pattern: FabricId;
  color: string;
  accessories: AccessoryId[];
  sewQuality: number;
}

export interface Score {
  stars: number;
  coins: number;
  hearts: number;
  line: string;
  sparkle: boolean;
}

export function judge(draft: Draft, customer: Customer): Score {
  const sketch = sketchById(draft.sketchId);
  const colorOk = colorsClose(draft.color, customer.color);
  const moodOk = sketch.tags.includes(customer.mood);
  const sparkly =
    draft.pattern === 'sequins' ||
    draft.pattern === 'rainbow' ||
    draft.accessories.includes('sequins');
  const patternOk =
    (customer.mood === 'sparkly' && (sparkly || draft.pattern === 'polka')) ||
    (customer.mood === 'cozy' &&
      (draft.pattern === 'velvet' || draft.pattern === 'denim' || sketch.tags.includes('cozy'))) ||
    (customer.mood === 'floral' && (draft.pattern === 'floral' || sketch.tags.includes('floral'))) ||
    (customer.mood === 'twirl' && sketch.tags.includes('twirl')) ||
    (customer.mood === 'bold' && saturation(draft.color) > 0.42) ||
    (customer.mood === 'soft' && luminance(draft.color) > 0.62) ||
    (customer.mood === 'cape' && draft.sketchId === 'hero-cape') ||
    (customer.mood === 'party' && (sparkly || sketch.tags.includes('party')));

  let t = 0.5;
  if (colorOk) t += 0.18;
  if (moodOk) t += 0.16;
  if (patternOk) t += 0.12;
  if (draft.accessories.length) t += 0.05;
  t += Math.max(0, Math.min(1, draft.sewQuality)) * 0.12;
  const stars = t >= 0.88 ? 3 : t >= 0.66 ? 2 : 1;
  const line = compliment(customer, { colorOk, moodOk, sparkly, sketch: draft.sketchId });
  return {
    stars,
    coins: [20, 30, 44][stars - 1],
    hearts: stars + 1,
    line,
    sparkle: stars === 3,
  };
}

function compliment(
  customer: Customer,
  flags: { colorOk: boolean; moodOk: boolean; sparkly: boolean; sketch: SketchId },
): string {
  if (customer.mood === 'cape' && flags.sketch === 'hero-cape') return 'I feel like the hero of the story!';
  if (customer.mood === 'sparkly' && flags.sparkly && flags.colorOk) return 'It shines, and it’s my favorite color!';
  if (customer.mood === 'sparkly' && flags.sparkly) return 'So sparkly! I feel like a birthday!';
  if (flags.colorOk && customer.mood === 'cozy') return 'Cozy and my favorite color. Perfect.';
  if (flags.colorOk) return 'That’s my favorite color!';
  if (customer.mood === 'twirl' && flags.moodOk) return 'Watch me twirl!';
  if (customer.mood === 'floral' && flags.moodOk) return 'I look like a whole garden!';
  if (customer.mood === 'cozy' && flags.moodOk) return 'I could wear this in the rain and smile.';
  if (customer.mood === 'bold') return 'So brave and bright!';
  if (customer.mood === 'soft') return 'This feels like tea and sunshine.';
  return 'I never would have thought of this. I love it!';
}
