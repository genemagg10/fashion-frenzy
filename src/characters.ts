import { customerBust, customerFull, modelSignature, tintedSprite, type BustExpr } from './spritekit';
import type { Outfit, PersonLook } from './types';

const PEOPLE = new Set(['lila', 'theo', 'noor', 'jo', 'amos', 'bea', 'rio', 'sasha', 'jules']);

export type Pose = 'idle' | 'stand' | 'stride' | 'twirl' | 'cheer' | 'think' | 'frown';

function personId(look: PersonLook, who?: string): string | undefined {
  const id = who || (look as { id?: string }).id;
  return id && PEOPLE.has(id) ? id : undefined;
}

export function renderPerson(opts: {
  look: PersonLook;
  outfit?: Outfit | null;
  pose?: Pose;
  uid: string;
  embed?: boolean;
  who?: string;
  bust?: BustExpr;
  showcase?: boolean;
}): string {
  const id = personId(opts.look, opts.who);
  const pose = opts.pose ?? 'idle';
  let src = modelSignature('sunny-dress');
  let kind = 'sprite-model';
  if (opts.bust && id) {
    src = customerBust(id, opts.bust);
    kind = 'sprite-bust';
  } else if (opts.showcase && opts.outfit) {
    src = modelSignature(opts.outfit.sketchId);
  } else if (opts.outfit?.color) {
    src = tintedSprite('model', opts.outfit.sketchId, opts.outfit.color, opts.outfit.pattern);
  } else if (id) {
    src = customerFull(id);
    kind = 'sprite-customer';
  } else if (opts.outfit) {
    src = modelSignature(opts.outfit.sketchId);
  }
  return `<img class="sprite sprite-person ${kind} pose-${pose}" alt="" draggable="false" src="${src}">`;
}
