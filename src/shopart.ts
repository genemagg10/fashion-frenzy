import type { DecorId } from './types';
import { shopURL } from './sprites';

export function shopSvg(opts: {
  decor: DecorId[];
  customer: string;
  cat: 'sleep' | 'sit' | 'gone';
  disco: boolean;
  posterOn: boolean;
}): string {
  const bg = shopURL({
    decor: opts.decor,
    cat: opts.cat,
    disco: opts.disco,
    posterOn: opts.posterOn,
  });
  const cat =
    opts.cat === 'gone'
      ? ''
      : `<button class="hotspot hot-cat" type="button" data-act="cat" aria-label="Cat"></button>`;
  return `<div class="shop-stage ${opts.disco ? 'disco' : ''}">
    <img class="pixel shop-bg" alt="" src="${bg}">
    <button class="hotspot hot-lamp" type="button" data-act="chandelier" aria-label="Lamp"></button>
    ${cat}
    <button class="hotspot hot-poster" type="button" data-act="poster" aria-label="Show poster"></button>
    <div class="shop-customer">${opts.customer}</div>
  </div>`;
}
