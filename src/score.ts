import { hexToRgb } from './color';
import { sketchById } from './data';
import type { AccessoryId, Customer, FabricId, SketchId, Theme, Wish } from './types';

export interface Draft {
  sketchId: SketchId;
  pattern: FabricId | null;
  color: string;
  accessories: AccessoryId[];
  sewQuality: number;
}

export interface Grade {
  color: number;
  cloth: number;
  shape: number;
  sew: number;
  secret: boolean;
  overall: number;
  review: number;
  coins: number;
  tip: number;
  secretBonus: number;
  basePay: number;
  hearts: number;
  line: string;
  sparkle: boolean;
  stars: number;
  mood: 'sparkle' | 'think' | 'frown';
  hint: string;
  starsFor: { color: number; cloth: number; shape: number; sew: number };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function dist(a: string, b: string): number {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
}

export function colorScore(chosen: string, wishes: string[]): number {
  if (!chosen || !wishes.length) return 0;
  let best = 0;
  for (const wish of wishes) {
    const d = dist(chosen, wish);
    const score = d < 48 ? 1 : d < 100 ? 0.78 : d < 150 ? 0.55 : d < 210 ? 0.32 : 0.08;
    best = Math.max(best, score);
  }
  return best;
}

function clothScore(pattern: FabricId | null, wishes: FabricId[]): number {
  if (!pattern) return 0;
  if (wishes.includes(pattern)) return 1;
  const sparkle = new Set<FabricId>(['sequins', 'polka', 'rainbow', 'tulle']);
  const cozy = new Set<FabricId>(['velvet', 'denim', 'solid']);
  const garden = new Set<FabricId>(['floral', 'tulle']);
  const related =
    (sparkle.has(pattern) && wishes.some((item) => sparkle.has(item))) ||
    (cozy.has(pattern) && wishes.some((item) => cozy.has(item))) ||
    (garden.has(pattern) && wishes.some((item) => garden.has(item)));
  return related ? 0.62 : 0.16;
}

function shapeScore(sketchId: SketchId, tags: string[]): number {
  const have = sketchById(sketchId).tags;
  const hits = tags.filter((tag) => have.includes(tag)).length;
  if (!tags.length) return 0.5;
  if (hits >= 2) return 1;
  if (hits === 1) return 0.74;
  return 0.12;
}

function starsOf(score: number): number {
  if (score >= 0.88) return 5;
  if (score >= 0.72) return 4;
  if (score >= 0.52) return 3;
  if (score >= 0.32) return 2;
  return 1;
}

function quote(customer: Customer, grade: { color: number; cloth: number; shape: number; sew: number; secret: boolean }): string {
  const secret = customer.wish.secret;
  const secretWord =
    secret === 'bow' ? 'a bow' : secret === 'belt' ? 'a belt' : secret === 'buttons' ? 'shiny buttons' : secret === 'sequins' ? 'extra sparkle' : secret === 'hat' ? 'a little hat' : secret === 'bag' ? 'a tiny bag' : secret === 'shoes' ? 'matching shoes' : 'one extra';
  if (grade.color >= 0.9 && grade.secret) return 'This feels exactly like the picture in my head!';
  if (grade.color >= 0.75 && !grade.secret && secret) return `The color feels right, and I still dreamed of ${secretWord}!`;
  if (grade.color < 0.35 && grade.shape >= 0.7) return 'I love the shape. A closer color would make me twirl.';
  if (grade.cloth < 0.4 && grade.color >= 0.7) return 'Pretty color! The cloth feels a little different from my wish.';
  if (grade.sew < 0.5) return 'I can see the idea. A slower stitch would make it extra special.';
  if (grade.color < 0.35) return 'Thank you for sewing for me. I might try another color next time.';
  if (grade.shape < 0.4) return 'You worked so hard. A different shape might match my story more.';
  if (grade.color >= 0.75 && grade.shape >= 0.7) return 'I feel wonderful. I want to wear this right now!';
  return 'What a kind surprise. I will remember this fitting!';
}

export function wishFromTheme(theme: Theme): Wish {
  return {
    colors: theme.colors,
    patterns: theme.patterns,
    tags: ['party', 'sparkly', 'twirl'],
  };
}

export function grade(draft: Draft, customer: Customer, wish: Wish = customer.wish): Grade {
  const color = colorScore(draft.color, wish.colors);
  const cloth = clothScore(draft.pattern, wish.patterns);
  const shape = shapeScore(draft.sketchId, wish.tags);
  const sew = clamp01(draft.sewQuality || 0);
  const secret = Boolean(wish.secret && draft.accessories.includes(wish.secret));
  const overall = color * 0.3 + cloth * 0.24 + shape * 0.24 + sew * 0.22;
  const review = starsOf(overall);
  const basePay = Math.round(22 * (0.55 + overall * 1.5));
  const tip = overall >= 0.88 ? 12 : overall >= 0.7 ? 6 : 0;
  const secretBonus = secret ? 10 : 0;
  const coins = basePay + tip + secretBonus;
  const mood = overall >= 0.75 ? 'sparkle' : overall >= 0.45 ? 'think' : 'frown';
  const hint =
    !draft.color || !draft.pattern
      ? 'Pick a color and a cloth. The little pictures are clues, not answers.'
      : overall < 0.4
        ? 'That is a bit far from the feeling. Peek at the mood pictures again.'
        : overall < 0.75
          ? 'Close! A nearby shade or a different cloth could fit even better.'
          : secret
            ? 'They are sparkling. You found the little extra too.'
            : wish.secret
              ? 'They love this. A tiny extra might be the secret cherry.'
              : 'They look so happy.';
  const line = quote(customer, { color, cloth, shape, sew, secret });
  return {
    color,
    cloth,
    shape,
    sew,
    secret,
    overall,
    review,
    coins,
    tip,
    secretBonus,
    basePay,
    hearts: review,
    line,
    sparkle: review >= 5,
    stars: review,
    mood,
    hint,
    starsFor: {
      color: starsOf(color),
      cloth: starsOf(cloth),
      shape: starsOf(shape),
      sew: starsOf(sew),
    },
  };
}

export function liveGrade(draft: Draft, customer: Customer, wish?: Wish): Grade {
  return grade({ ...draft, sewQuality: draft.sewQuality || 0.7 }, customer, wish);
}
