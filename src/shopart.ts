import { customerFull, propArt } from './spritekit';
import type { DecorId } from './types';

export function shopSvg(opts: {
  decor: DecorId[];
  customerId: string;
  posterOn: boolean;
}): string {
  const flowers = opts.decor.includes('flowers');
  return `<div class="shop-stage illustrated">
    <div class="shop-bunting" aria-hidden="true">${Array.from({ length: 9 }, () => '<i></i>').join('')}</div>
    <div class="shop-window">
      <div class="window-view" aria-hidden="true">
        <i class="cloud"></i>
        <i class="cloud two"></i>
        <i class="hill"></i>
        <i class="sun"></i>
      </div>
      <b class="shop-sign">Ella’s</b>
      <button class="hotspot hot-poster ${opts.posterOn ? 'on' : ''}" type="button" data-act="poster" aria-label="Show poster"></button>
    </div>
    <div class="mirror-wrap">
      <img class="prop prop-mirror" alt="" src="${propArt('mirror')}">
      <button class="hotspot hot-lamp" type="button" data-act="chandelier" aria-label="Lamp"></button>
    </div>
    <img class="sprite shop-customer" alt="" src="${customerFull(opts.customerId)}">
    <div class="shop-props">
      <div class="prop-cluster">
        <img class="prop prop-rack" alt="" src="${propArt('clothes-rack')}">
        <img class="prop prop-bolts" alt="" src="${propArt('fabric-bolts')}">
        <div class="prop-hit">
          <img class="prop prop-plant" alt="" src="${propArt('plant-monstera')}">
          <button class="hotspot hot-cat" type="button" data-act="cat" aria-label="The plant"></button>
        </div>
      </div>
      <div class="prop-cluster">
        <img class="prop prop-flowers" alt="" src="${propArt(flowers ? 'flowers-pot' : 'pincushion-kit')}">
        <img class="prop prop-machine" alt="" src="${propArt('sewing-machine')}">
      </div>
    </div>
  </div>`;
}
