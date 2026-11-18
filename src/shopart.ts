import type { DecorId } from './types';

function has(decor: DecorId[], id: DecorId): boolean {
  return decor.includes(id);
}

function miniDress(x: number, y: number, fill: string, h = 78): string {
  return `<path d="M ${x} ${y + 8} l -16 10 6 ${h * 0.35} -18 ${h * 0.62} h 56 l -18 -${h * 0.62} 6 -${h * 0.35} z" fill="${fill}"/>`;
}

export function shopSvg(opts: {
  decor: DecorId[];
  customer: string;
  cat: 'sleep' | 'sit' | 'gone';
  disco: boolean;
  posterOn: boolean;
}): string {
  const lights = has(opts.decor, 'lights');
  const rug = has(opts.decor, 'rug');
  const flowers = has(opts.decor, 'flowers');
  const mirror = has(opts.decor, 'mirror');
  const fancy = has(opts.decor, 'chandelier');
  return `<svg class="shop-svg ${opts.disco ? 'disco' : ''}" viewBox="0 0 900 980" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fbe9df"/>
        <stop offset="0.55" stop-color="#f6ddd0"/>
        <stop offset="1" stop-color="#efd0c2"/>
      </linearGradient>
      <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7eb7e0"/>
        <stop offset="1" stop-color="#f6d3b0"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="0%" r="70%">
        <stop offset="0" stop-color="#ffe7b8" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#ffe7b8" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#c98462"/>
        <stop offset="1" stop-color="#a86b48"/>
      </linearGradient>
      <pattern id="planks" width="900" height="46" patternUnits="userSpaceOnUse">
        <rect width="900" height="46" fill="#c17a56"/>
        <rect y="0" width="220" height="44" fill="#d3926c"/>
        <rect x="224" width="180" height="44" fill="#b8744e"/>
        <rect x="408" width="250" height="44" fill="#c88860"/>
        <rect x="662" width="238" height="44" fill="#a86a46"/>
        <path d="M0 44 H900" stroke="#8d5340" stroke-width="2"/>
      </pattern>
    </defs>
    <rect width="900" height="980" fill="url(#wallG)"/>
    <rect width="900" height="420" fill="url(#glow)"/>
    <rect y="620" width="900" height="360" fill="url(#planks)"/>
    <rect y="608" width="900" height="16" fill="#f3e6da"/>
    <rect y="620" width="900" height="6" fill="#e7cbb8"/>

    <g class="chandelier" data-act="chandelier">
      <line x1="450" y1="0" x2="450" y2="36" stroke="#c6a15e" stroke-width="3"/>
      ${
        fancy
          ? `<g>
              <path d="M360 78 Q450 140 540 78" fill="none" stroke="#e6c98a" stroke-width="4"/>
              <circle class="bulb" cx="360" cy="78" r="8" fill="#fff4cc"/>
              <circle class="bulb" cx="405" cy="108" r="7" fill="#fff4cc"/>
              <circle class="bulb" cx="450" cy="122" r="8" fill="#fff4cc"/>
              <circle class="bulb" cx="495" cy="108" r="7" fill="#fff4cc"/>
              <circle class="bulb" cx="540" cy="78" r="8" fill="#fff4cc"/>
            </g>`
          : `<g>
              <ellipse cx="450" cy="58" rx="28" ry="16" fill="#f8e7c4" stroke="#e2c27a" stroke-width="3"/>
              <circle class="bulb" cx="450" cy="58" r="7" fill="#fff6d2"/>
            </g>`
      }
      <rect x="340" y="10" width="220" height="120" fill="transparent"/>
    </g>

    <g class="string-lights">
      <path d="M20 48 Q220 90 450 42 T880 56" fill="none" stroke="#d7b48a" stroke-width="2"/>
      ${[60, 150, 250, 360, 470, 580, 690, 800]
        .map(
          (x, i) =>
            `<circle class="bulb" cx="${x}" cy="${58 + (i % 2) * 12}" r="5.5" fill="${lights ? ['#ffd0dc', '#ffe29a', '#d9f2c8', '#d4ecff'][i % 4] : '#ffe3a8'}"/>`,
        )
        .join('')}
    </g>

    <g class="window">
      <path d="M250 90 h400 v230 a200 170 0 0 1 -400 0 z" fill="url(#skyG)"/>
      <path d="M250 90 h400 v230 a200 170 0 0 1 -400 0 z" fill="none" stroke="#fffaf6" stroke-width="16"/>
      <path d="M250 90 h400 v230 a200 170 0 0 1 -400 0 z" fill="none" stroke="#c9a27a" stroke-width="6"/>
      <line x1="450" y1="100" x2="450" y2="500" stroke="#fffaf6" stroke-width="7"/>
      <line x1="268" y1="300" x2="632" y2="300" stroke="#fffaf6" stroke-width="7"/>
      <circle cx="330" cy="170" r="28" fill="#fff6d4"/>
      <ellipse cx="560" cy="160" rx="40" ry="16" fill="#fff" opacity="0.75"/>
      <path d="M268 470 Q360 430 450 470 Q540 430 632 470 V510 H268 Z" fill="#9dcea0"/>
      <path d="M268 300 Q310 360 268 450" fill="#c4476a"/>
      <path d="M632 300 Q590 360 632 450" fill="#e07a90"/>
      <rect x="268" y="498" width="364" height="18" rx="4" fill="#f0d8c6"/>
      ${
        flowers
          ? `<g>
              <rect x="430" y="478" width="10" height="30" fill="#5f8f68"/>
              <circle cx="418" cy="474" r="9" fill="#e56b93"/>
              <circle cx="436" cy="466" r="9" fill="#f2c14e"/>
              <circle cx="452" cy="476" r="8" fill="#fff"/>
            </g>`
          : `<g>
              <circle cx="470" cy="486" r="7" fill="#e56b93"/>
              <circle cx="486" cy="480" r="6" fill="#f2c14e"/>
            </g>`
      }
      ${catSvg(opts.cat)}
    </g>

    <g class="sign">
      <rect x="330" y="36" width="240" height="48" rx="12" fill="#2a211c"/>
      <text x="450" y="70" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="32" fill="#f6d7a2">Ella’s</text>
    </g>

    <g class="rack-left">
      <line x1="70" y1="250" x2="70" y2="560" stroke="#7a5238" stroke-width="8" stroke-linecap="round"/>
      <line x1="36" y1="250" x2="210" y2="250" stroke="#7a5238" stroke-width="8" stroke-linecap="round"/>
      ${miniDress(70, 250, '#e23b6a', 120)}
      ${miniDress(118, 252, '#2f6f86', 110)}
      ${miniDress(164, 250, '#f2c14e', 100)}
      <path d="M48 360 q30 40 64 8" fill="none" stroke="#7a4e8a" stroke-width="14" stroke-linecap="round"/>
    </g>

    <g class="bolts-left">
      <rect x="24" y="560" width="150" height="16" rx="3" fill="#8d5a3c"/>
      <rect x="36" y="576" width="12" height="70" fill="#8d5a3c"/>
      <rect x="150" y="576" width="12" height="70" fill="#8d5a3c"/>
      <rect x="40" y="520" width="120" height="22" rx="4" fill="#e56b93"/>
      <rect x="48" y="498" width="104" height="22" rx="4" fill="#2f7c8a"/>
      <rect x="56" y="476" width="88" height="22" rx="4" fill="#f2c14e"/>
      <rect x="64" y="456" width="72" height="20" rx="4" fill="#7a4e8a"/>
    </g>

    <g class="mirror">
      <ellipse cx="790" cy="250" rx="${mirror ? 62 : 48}" ry="${mirror ? 86 : 64}" fill="#d7efec" stroke="${mirror ? '#e2c27a' : '#c4a574'}" stroke-width="${mirror ? 8 : 5}"/>
      <ellipse cx="790" cy="250" rx="${mirror ? 44 : 32}" ry="${mirror ? 66 : 46}" fill="#f7fffe" opacity="0.65"/>
      <path d="M770 230 q20 30 36 -8" fill="none" stroke="#e56b93" stroke-width="4" opacity="0.7"/>
    </g>

    <g class="bolts-right">
      <rect x="730" y="390" width="140" height="14" rx="3" fill="#8d5a3c"/>
      <rect x="748" y="404" width="10" height="50" fill="#8d5a3c"/>
      <rect x="842" y="404" width="10" height="50" fill="#8d5a3c"/>
      <rect x="746" y="360" width="108" height="18" rx="3" fill="#24315c"/>
      <rect x="754" y="342" width="92" height="18" rx="3" fill="#c23b4b"/>
      <rect x="762" y="324" width="76" height="18" rx="3" fill="#3e8f62"/>
    </g>

    <g class="mini-form" transform="translate(700 430) scale(0.34)">
      <ellipse cx="200" cy="620" rx="70" ry="16" fill="#6a3b28"/>
      <rect x="194" y="430" width="12" height="180" fill="#ddd4cc"/>
      <path d="M200 150 C250 160 280 240 250 310 C280 380 230 450 200 450 C170 450 120 380 150 310 C120 240 150 160 200 150 Z" fill="#f6e4d4" stroke="#e3cbb6"/>
      <path d="M145 220 C170 250 200 300 255 240 L280 430 L120 430 Z" fill="#e23b6a"/>
      <path d="M170 250 h60" stroke="#fff" stroke-width="4" opacity="0.4"/>
    </g>

    <g class="plant">
      <ellipse cx="120" cy="760" rx="36" ry="10" fill="#000" opacity="0.08"/>
      <path d="M120 760 q-40 -70 -6 -120 q24 40 6 120z" fill="#3e8f62"/>
      <path d="M120 760 q36 -60 8 -110 q-18 36 -8 110z" fill="#2f6b4f"/>
      <rect x="102" y="752" width="36" height="28" rx="6" fill="#c46a4a"/>
    </g>

    <ellipse cx="450" cy="860" rx="${rug ? 250 : 170}" ry="${rug ? 58 : 36}" fill="#e7a0b4"/>
    <ellipse cx="450" cy="860" rx="${rug ? 190 : 120}" ry="${rug ? 40 : 24}" fill="none" stroke="#f7e1c8" stroke-width="4"/>

    <g class="poster" data-act="poster">
      <rect x="760" y="120" width="100" height="130" rx="8" fill="${opts.posterOn ? '#2a211c' : '#f7efe6'}" stroke="#e2c27a" stroke-width="4"/>
      <text x="810" y="168" text-anchor="middle" fill="${opts.posterOn ? '#f6d7a2' : '#8a7068'}" font-family="Fraunces, Georgia, serif" font-size="18">Show</text>
      <text x="810" y="194" text-anchor="middle" fill="${opts.posterOn ? '#fff' : '#b7a197'}" font-family="Nunito, sans-serif" font-size="13">${opts.posterOn ? 'tonight' : 'soon'}</text>
      <path d="M784 230 l12 18 14 -22 12 16 14 -20" fill="none" stroke="${opts.posterOn ? '#e56b93' : '#d9c3b8'}" stroke-width="3"/>
    </g>

    <g class="table">
      <rect x="620" y="800" width="130" height="16" rx="4" fill="#a86d50"/>
      <rect x="636" y="816" width="10" height="46" fill="#8d5340"/>
      <rect x="724" y="816" width="10" height="46" fill="#8d5340"/>
      <ellipse cx="656" cy="790" rx="18" ry="11" fill="#f2c14e"/>
      <rect x="678" y="782" width="8" height="18" fill="#c23b4b"/>
      <path d="M710 776 l18 20 M728 776 l-12 14" stroke="#9a9a9a" stroke-width="3" stroke-linecap="round"/>
    </g>

    <g class="customer-slot" transform="translate(300 500) scale(0.78)">
      <g class="customer-bob">${opts.customer}</g>
    </g>
  </svg>`;
}

function catSvg(cat: 'sleep' | 'sit' | 'gone'): string {
  if (cat === 'gone') return '';
  const eyes =
    cat === 'sleep'
      ? `<path d="M418 452 q8 5 14 0" fill="none" stroke="#2a211c" stroke-width="1.8" stroke-linecap="round"/>
         <path d="M444 452 q8 5 14 0" fill="none" stroke="#2a211c" stroke-width="1.8" stroke-linecap="round"/>`
      : `<circle cx="426" cy="450" r="2.4" fill="#2a211c"/><circle cx="452" cy="450" r="2.4" fill="#2a211c"/>`;
  return `<g class="cat ${cat}" data-act="cat">
    <ellipse cx="440" cy="474" rx="42" ry="18" fill="#e0a15c"/>
    <circle cx="436" cy="448" r="18" fill="#efb56e"/>
    <path d="M420 436 l-8 -16 14 10 z" fill="#efb56e"/>
    <path d="M452 436 l10 -16 -2 18 z" fill="#c4844a"/>
    ${eyes}
    <path d="M434 458 q6 5 10 0" fill="none" stroke="#c46a7a" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M398 470 q-24 12 -8 22" fill="none" stroke="#e0a15c" stroke-width="6" stroke-linecap="round"/>
    <rect x="390" y="420" width="100" height="80" fill="transparent"/>
  </g>`;
}
