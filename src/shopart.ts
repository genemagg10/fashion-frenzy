import { customerFull, propArt } from './spritekit';
import type { DecorId } from './types';

export function shopSvg(opts: {
  decor: DecorId[];
  customerId: string;
  posterOn: boolean;
}): string {
  const flowers = opts.decor.includes('flowers');
  return `<div class="shop-stage illustrated">
    <img class="prop prop-rack" alt="" src="${propArt('clothes-rack')}">
    <img class="prop prop-mirror" alt="" src="${propArt('mirror')}">
    <img class="prop prop-bolts" alt="" src="${propArt('fabric-bolts')}">
    <img class="prop prop-machine" alt="" src="${propArt('sewing-machine')}">
    <img class="prop prop-plant" alt="" src="${propArt('plant-monstera')}">
    <img class="prop prop-flowers" alt="" src="${propArt(flowers ? 'flowers-pot' : 'pincushion-kit')}">
    <button class="hotspot hot-poster ${opts.posterOn ? 'on' : ''}" type="button" data-act="poster" aria-label="Show poster"></button>
    <button class="hotspot hot-cat" type="button" data-act="cat" aria-label="The plant"></button>
    <button class="hotspot hot-lamp" type="button" data-act="chandelier" aria-label="Lamp"></button>
    <img class="sprite shop-customer" alt="" src="${customerFull(opts.customerId)}">
  </div>`;
}
