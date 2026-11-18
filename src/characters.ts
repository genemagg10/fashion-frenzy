import { chibiHTML, type PoseName } from './sprites';
import type { Outfit, PersonLook } from './types';

export const PERSON_VB = '-30 0 300 540';

export type Pose = PoseName;

export function renderPerson(opts: {
  look: PersonLook;
  outfit?: Outfit | null;
  pose?: Pose;
  uid: string;
  embed?: boolean;
}): string {
  return chibiHTML({
    look: opts.look,
    outfit: opts.outfit,
    pose: opts.pose,
    uid: opts.uid,
  });
}
