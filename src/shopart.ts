import { customerFull } from './spritekit';

const BASE = import.meta.env.BASE_URL || './';

const PORTRAIT = {
  src: `${BASE}sprites/shop/shop-portrait.png`,
  w: 864,
  h: 1152,
  feet: 0.89,
  height: 0.58,
  window: { x: 0.3, y: 0.2, w: 0.4, h: 0.32 },
  lampL: { x: 0.1, y: 0.02, w: 0.16, h: 0.14 },
  lampR: { x: 0.74, y: 0.02, w: 0.16, h: 0.14 },
  plant: { x: 0.6, y: 0.4, w: 0.18, h: 0.28 },
};

const WIDE = {
  src: `${BASE}sprites/shop/shop-wide.png`,
  w: 1280,
  h: 720,
  feet: 0.93,
  height: 0.65,
  window: { x: 0.33, y: 0.12, w: 0.34, h: 0.46 },
  lampL: { x: 0.22, y: 0.0, w: 0.12, h: 0.18 },
  lampR: { x: 0.66, y: 0.0, w: 0.12, h: 0.18 },
  plant: { x: 0.6, y: 0.32, w: 0.14, h: 0.4 },
};

type Box = { x: number; y: number; w: number; h: number };
type Room = typeof PORTRAIT;

export function shopSvg(opts: { customerId: string; posterOn: boolean }): string {
  return `<div class="shop-stage painted" data-shop>
    <img class="shop-bg" alt="" draggable="false" data-room="portrait" src="${PORTRAIT.src}">
    <div class="shop-window-fx" aria-hidden="true">
      <i class="shop-cloud"></i>
      <i class="shop-bird"></i>
      <i class="mote" style="left:18%;top:40%"></i>
      <i class="mote" style="left:46%;top:55%;animation-delay:.8s"></i>
      <i class="mote" style="left:70%;top:36%;animation-delay:1.6s"></i>
      <i class="mote" style="left:32%;top:62%;animation-delay:2.2s"></i>
    </div>
    <i class="lamp-glow lamp-left" aria-hidden="true"></i>
    <i class="lamp-glow lamp-right" aria-hidden="true"></i>
    <i class="contact-shadow" aria-hidden="true"></i>
    <img class="sprite shop-customer" alt="" draggable="false" src="${customerFull(opts.customerId)}">
    <button class="hotspot hot-poster ${opts.posterOn ? 'on' : ''}" type="button" data-act="poster" aria-label="Show poster"></button>
    <button class="hotspot hot-lamp" type="button" data-act="chandelier" aria-label="Lamp"></button>
    <button class="hotspot hot-cat" type="button" data-act="cat" aria-label="The plant"></button>
  </div>`;
}

function placeBox(el: HTMLElement, rect: { x: number; y: number; w: number; h: number }, box: Box): void {
  el.style.left = `${rect.x + box.x * rect.w}px`;
  el.style.top = `${rect.y + box.y * rect.h}px`;
  el.style.width = `${box.w * rect.w}px`;
  el.style.height = `${box.h * rect.h}px`;
}

export function mountShop(root: ParentNode): () => void {
  const stage = root.querySelector('[data-shop]') as HTMLElement | null;
  if (!stage) return () => {};
  const bg = stage.querySelector('.shop-bg') as HTMLImageElement;
  const customer = stage.querySelector('.shop-customer') as HTMLImageElement;
  const shadow = stage.querySelector('.contact-shadow') as HTMLElement;
  const windowFx = stage.querySelector('.shop-window-fx') as HTMLElement;
  const lampL = stage.querySelector('.lamp-left') as HTMLElement;
  const lampR = stage.querySelector('.lamp-right') as HTMLElement;
  const poster = stage.querySelector('.hot-poster') as HTMLElement;
  const lamp = stage.querySelector('.hot-lamp') as HTMLElement;
  const plant = stage.querySelector('.hot-cat') as HTMLElement;

  const layout = () => {
    const cw = stage.clientWidth;
    const ch = stage.clientHeight;
    if (!cw || !ch) return;
    const room: Room = cw / ch >= 1.2 ? WIDE : PORTRAIT;
    if (bg.dataset.room !== (room === WIDE ? 'wide' : 'portrait')) {
      bg.dataset.room = room === WIDE ? 'wide' : 'portrait';
      bg.src = room.src;
    }
    const iw = bg.naturalWidth || room.w;
    const ih = bg.naturalHeight || room.h;
    const scale = Math.max(cw / iw, ch / ih);
    const rect = {
      x: (cw - iw * scale) / 2,
      y: ch - ih * scale,
      w: iw * scale,
      h: ih * scale,
    };
    const feetX = rect.x + rect.w / 2;
    const feetY = rect.y + room.feet * rect.h;
    const height = ch * room.height;
    customer.style.height = `${height}px`;
    customer.style.width = 'auto';
    const width = customer.offsetWidth || height * 0.62;
    customer.style.left = `${feetX - width / 2}px`;
    customer.style.top = `${feetY - height}px`;
    shadow.style.left = `${feetX}px`;
    shadow.style.top = `${feetY}px`;
    shadow.style.width = `${Math.max(48, width * 0.62)}px`;
    placeBox(windowFx, rect, room.window);
    placeBox(poster, rect, room.window);
    placeBox(lampL, rect, room.lampL);
    placeBox(lampR, rect, room.lampR);
    placeBox(lamp, rect, room.lampR);
    placeBox(plant, rect, room.plant);
  };

  let tries = 0;
  const onBg = () => layout();
  const onErr = () => {
    if (tries > 1) return;
    tries += 1;
    const room = bg.dataset.room === 'wide' ? WIDE : PORTRAIT;
    bg.dataset.room = '';
    bg.src = room.src;
  };
  const observer = new ResizeObserver(layout);
  observer.observe(stage);
  customer.addEventListener('load', layout);
  bg.addEventListener('load', onBg);
  bg.addEventListener('error', onErr);
  layout();
  requestAnimationFrame(layout);
  return () => {
    observer.disconnect();
    customer.removeEventListener('load', layout);
    bg.removeEventListener('load', onBg);
    bg.removeEventListener('error', onErr);
  };
}
