import type { DecorId } from './types';

function has(decor: DecorId[], id: DecorId): boolean {
  return decor.includes(id);
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
  return `<svg class="shop-svg ${opts.disco ? 'disco' : ''}" viewBox="0 0 640 900" preserveAspectRatio="xMidYMax meet">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f8ebe3"/>
        <stop offset="1" stop-color="#f0d9cc"/>
      </linearGradient>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8ec6e6"/>
        <stop offset="1" stop-color="#f6d6b8"/>
      </linearGradient>
      <pattern id="herring" width="28" height="16" patternUnits="userSpaceOnUse">
        <rect width="28" height="16" fill="#c4896a"/>
        <path d="M0 16 L14 0 L28 16" fill="none" stroke="#a86d50" stroke-width="2"/>
        <path d="M0 0 L14 16 L28 0" fill="none" stroke="#d7a184" stroke-width="1.2" opacity="0.7"/>
      </pattern>
      <pattern id="damask" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M40 8c8 10 8 18 0 28c-8-10-8-18 0-28zM20 40c10 8 18 8 28 0c-10-8-18-8-28 0z" fill="#e7cabb" opacity="0.45"/>
      </pattern>
      <linearGradient id="curtain" x1="0" x2="1">
        <stop offset="0" stop-color="#c4536e"/>
        <stop offset="1" stop-color="#e89aab"/>
      </linearGradient>
    </defs>
    <rect width="640" height="900" fill="url(#wall)"/>
    <rect width="640" height="560" fill="url(#damask)" opacity="0.65"/>
    <rect y="560" width="640" height="340" fill="url(#herring)"/>
    <rect y="548" width="640" height="18" fill="#e7d3c4"/>
    <rect y="560" width="640" height="8" fill="#d7b39a"/>

    <g class="chandelier" data-act="chandelier">
      <line x1="320" y1="0" x2="320" y2="46" stroke="#c2a36a" stroke-width="3"/>
      ${
        fancy
          ? `<g>
            <path d="M250 70 Q320 120 390 70" fill="none" stroke="#e2c27a" stroke-width="4"/>
            <circle cx="250" cy="70" r="7" fill="#fff6d8" class="bulb"/>
            <circle cx="290" cy="96" r="6" fill="#fff6d8" class="bulb"/>
            <circle cx="320" cy="108" r="7" fill="#fff6d8" class="bulb"/>
            <circle cx="350" cy="96" r="6" fill="#fff6d8" class="bulb"/>
            <circle cx="390" cy="70" r="7" fill="#fff6d8" class="bulb"/>
            <circle cx="320" cy="78" r="10" fill="#f2c14e" opacity="0.85"/>
          </g>`
          : `<g>
            <circle cx="320" cy="62" r="16" fill="#f7e7c3" stroke="#e2c27a" stroke-width="3"/>
            <circle cx="320" cy="62" r="6" fill="#fff6d8" class="bulb"/>
          </g>`
      }
      <rect x="250" y="20" width="140" height="90" fill="transparent"/>
    </g>

    ${
      lights
        ? `<g class="string-lights">
          <path d="M40 36 Q180 70 320 36 T600 40" fill="none" stroke="#d7b48a" stroke-width="2"/>
          ${[70, 140, 210, 280, 360, 430, 500, 570]
            .map(
              (x, i) =>
                `<circle class="bulb" cx="${x}" cy="${46 + (i % 2) * 10}" r="5" fill="${['#ffd6e0', '#ffe9a8', '#d9f2df', '#d6ecff'][i % 4]}"/>`,
            )
            .join('')}
        </g>`
        : ''
    }

    <g class="window">
      <path d="M150 78 h340 v210 a170 150 0 0 1 -340 0 z" fill="url(#sky)"/>
      <path d="M150 78 h340 v210 a170 150 0 0 1 -340 0 z" fill="none" stroke="#f7f1ea" stroke-width="14"/>
      <path d="M150 78 h340 v210 a170 150 0 0 1 -340 0 z" fill="none" stroke="#c9a27a" stroke-width="6"/>
      <line x1="320" y1="86" x2="320" y2="430" stroke="#f7f1ea" stroke-width="6"/>
      <line x1="168" y1="250" x2="472" y2="250" stroke="#f7f1ea" stroke-width="6"/>
      <circle cx="230" cy="150" r="26" fill="#fff4d2" opacity="0.95"/>
      <ellipse cx="400" cy="140" rx="34" ry="14" fill="#fff" opacity="0.7"/>
      <ellipse cx="430" cy="148" rx="22" ry="10" fill="#fff" opacity="0.6"/>
      <path d="M168 400 Q240 360 320 400 Q400 360 472 400 L472 430 L168 430 Z" fill="#b7d3a8"/>
      <path d="M168 250 Q200 300 168 360" fill="url(#curtain)"/>
      <path d="M472 250 Q440 300 472 360" fill="url(#curtain)"/>
      <path d="M180 250 Q210 270 190 300" fill="none" stroke="#a84460" stroke-width="3"/>
      <path d="M460 250 Q430 270 450 300" fill="none" stroke="#a84460" stroke-width="3"/>
      <rect x="168" y="418" width="304" height="16" rx="3" fill="#e7d3c4"/>
      ${
        flowers
          ? `<g class="flowers">
            <rect x="300" y="400" width="8" height="28" fill="#6b8f71"/>
            <circle cx="292" cy="396" r="8" fill="#e56b93"/>
            <circle cx="306" cy="390" r="8" fill="#f2c14e"/>
            <circle cx="318" cy="398" r="7" fill="#fff"/>
          </g>`
          : ''
      }
      ${catSvg(opts.cat)}
    </g>

    <g class="sign">
      <rect x="214" y="28" width="212" height="46" rx="10" fill="#2a211c"/>
      <text x="320" y="60" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="28" fill="#f6d7a2">Ella’s</text>
    </g>

    <g class="rack">
      <line x1="70" y1="250" x2="70" y2="470" stroke="#8d6b4a" stroke-width="6" stroke-linecap="round"/>
      <line x1="48" y1="250" x2="150" y2="250" stroke="#8d6b4a" stroke-width="6" stroke-linecap="round"/>
      <path d="M78 250 v70 q20 20 36 0 v-64" fill="#e56b93"/>
      <path d="M108 252 v58 q16 26 30 4 v-56" fill="#24315c"/>
      <path d="M70 330 q18 34 40 8" fill="none" stroke="#f2c14e" stroke-width="8"/>
    </g>

    ${
      mirror
        ? `<g class="mirror">
          <ellipse cx="78" cy="200" rx="36" ry="48" fill="#d5ebe8" stroke="#e2c27a" stroke-width="6"/>
          <ellipse cx="78" cy="200" rx="24" ry="34" fill="#f7fffe" opacity="0.7"/>
        </g>`
        : `<g class="plant">
          <ellipse cx="86" cy="430" rx="28" ry="10" fill="#000" opacity="0.06"/>
          <path d="M86 430 q-30 -50 -8 -90 q20 30 8 90z" fill="#3e8f62"/>
          <path d="M86 430 q30 -40 10 -84 q-16 28 -10 84z" fill="#2f6b4f"/>
          <rect x="72" y="424" width="28" height="24" rx="4" fill="#c46a4a"/>
        </g>`
    }

    <g class="mini-form" transform="translate(500 300) scale(0.42)">
      <ellipse cx="200" cy="612" rx="60" ry="14" fill="#6a3b28"/>
      <rect x="194" y="430" width="12" height="170" fill="#d9d3cc"/>
      <path d="M200 150 C250 160 270 230 250 300 C270 360 230 430 200 430 C170 430 130 360 150 300 C130 230 150 160 200 150 Z" fill="#f3e2d2" stroke="#e4cdb8"/>
      <path d="M150 230 C170 250 200 300 250 250 L270 360 L130 360 Z" fill="#7a4e8a"/>
    </g>

    ${
      rug
        ? `<ellipse cx="330" cy="760" rx="180" ry="46" fill="#e7a0b4" opacity="0.85"/>
           <ellipse cx="330" cy="760" rx="140" ry="34" fill="none" stroke="#f7e1c8" stroke-width="4"/>`
        : ''
    }

    <g class="poster" data-act="poster">
      <rect x="516" y="150" width="92" height="120" rx="8" fill="${opts.posterOn ? '#2a211c' : '#f7efe6'}" stroke="#e2c27a" stroke-width="4"/>
      <text x="562" y="190" text-anchor="middle" fill="${opts.posterOn ? '#f6d7a2' : '#8a7068'}" font-family="Fraunces, Georgia, serif" font-size="16">Show</text>
      <text x="562" y="214" text-anchor="middle" fill="${opts.posterOn ? '#fff' : '#b7a197'}" font-family="Nunito, sans-serif" font-size="12">${opts.posterOn ? 'tonight' : 'soon'}</text>
      <path d="M540 240 l10 16 12-20 10 14 12-18" fill="none" stroke="${opts.posterOn ? '#e56b93' : '#d9c3b8'}" stroke-width="3"/>
    </g>

    <g class="table">
      <rect x="500" y="640" width="110" height="14" rx="4" fill="#a86d50"/>
      <rect x="516" y="654" width="10" height="50" fill="#8d5340"/>
      <rect x="584" y="654" width="10" height="50" fill="#8d5340"/>
      <ellipse cx="530" cy="632" rx="16" ry="10" fill="#f2c14e"/>
      <rect x="546" y="626" width="6" height="16" fill="#c23b4b"/>
      <path d="M570 620 l16 18 M586 620 l-10 12" stroke="#8d8d8d" stroke-width="3" stroke-linecap="round"/>
    </g>

    <g class="customer-enter">
      <g transform="translate(188, 468) scale(0.72)">
        ${opts.customer}
      </g>
    </g>
  </svg>`;
}

function catSvg(cat: 'sleep' | 'sit' | 'gone'): string {
  if (cat === 'gone') return '';
  const eyes =
    cat === 'sleep'
      ? `<path d="M232 392 q6 4 12 0" fill="none" stroke="#2a211c" stroke-width="1.6" stroke-linecap="round"/>
         <path d="M252 392 q6 4 12 0" fill="none" stroke="#2a211c" stroke-width="1.6" stroke-linecap="round"/>`
      : `<circle cx="238" cy="390" r="2.2" fill="#2a211c"/><circle cx="258" cy="390" r="2.2" fill="#2a211c"/>`;
  return `<g class="cat ${cat}" data-act="cat">
    <ellipse cx="250" cy="408" rx="36" ry="16" fill="#d9a066"/>
    <circle cx="246" cy="388" r="16" fill="#e0ac74"/>
    <path d="M232 378 l-6 -14 l12 8 z" fill="#e0ac74"/>
    <path d="M258 378 l8 -14 l-2 16 z" fill="#c4844a"/>
    ${eyes}
    <path d="M246 396 q4 4 8 0" fill="none" stroke="#c46a7a" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M214 404 q-20 10 -8 20" fill="none" stroke="#d9a066" stroke-width="5" stroke-linecap="round"/>
    <rect x="210" y="360" width="80" height="70" fill="transparent"/>
  </g>`;
}
