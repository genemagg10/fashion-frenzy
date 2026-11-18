import { darken } from './color';
import { renderGarment } from './garments';
import type { Outfit, PersonLook } from './types';

export const PERSON_VB = '-30 0 300 540';

export type Pose = 'idle' | 'stand' | 'stride' | 'twirl' | 'cheer';

function hairBack(look: PersonLook): string {
  const c = look.hairColor;
  switch (look.hair) {
    case 'puffs':
      return `<circle cx="74" cy="78" r="26" fill="${c}"/><circle cx="166" cy="78" r="26" fill="${c}"/>
        <path d="M82 108 C76 62 164 62 158 108 C146 78 94 78 82 108 Z" fill="${c}"/>`;
    case 'bob':
      return `<path d="M76 96 C66 140 72 176 98 186 C112 168 128 168 142 186 C168 176 174 140 164 96 C152 52 88 52 76 96 Z" fill="${c}"/>`;
    case 'curls': {
      const spots = [
        [78, 70, 18],
        [120, 52, 20],
        [162, 70, 18],
        [64, 108, 16],
        [176, 108, 16],
        [70, 142, 14],
        [170, 142, 14],
        [96, 64, 14],
        [144, 64, 14],
      ];
      return spots
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`)
        .join('');
    }
    case 'bun':
      return `<path d="M84 104 C78 68 96 48 120 46 C144 48 162 68 156 104 C146 80 94 80 84 104 Z" fill="${c}"/>
        <circle cx="120" cy="40" r="18" fill="${c}"/>
        <ellipse cx="120" cy="40" rx="8" ry="5" fill="#fff" opacity="0.18"/>`;
    case 'crop':
      return `<path d="M86 108 C78 74 92 50 120 46 C148 50 162 74 154 108 C142 82 98 82 86 108 Z" fill="${c}"/>
        <path d="M100 58 Q120 50 140 58" fill="none" stroke="${darken(c, 0.2)}" stroke-width="2" opacity="0.5"/>`;
    case 'locs': {
      let s = `<path d="M84 100 C78 64 160 60 158 104 C144 78 96 78 84 100 Z" fill="${c}"/>`;
      const locs = [68, 86, 104, 136, 154, 172];
      for (const x of locs) {
        const len = 70 + ((x * 3) % 40);
        s += `<path d="M ${x - 7} 112 Q ${x - 10} ${112 + len / 2} ${x - 4} ${112 + len} Q ${x + 6} ${118 + len} ${x + 8} 112 Q ${x} 100 ${x - 7} 112 Z" fill="${c}"/>`;
      }
      return s;
    }
    case 'waves':
      return `<path d="M78 96 C58 150 56 210 72 300 C86 318 102 270 98 210 C96 160 104 130 112 118 C120 108 128 108 136 118 C148 132 150 170 148 220 C144 280 160 320 176 300 C190 220 184 150 164 96 C148 50 92 50 78 96 Z" fill="${c}"/>`;
    case 'braid': {
      let s = `<path d="M84 104 C76 66 100 46 120 46 C148 48 166 72 156 108 C144 80 96 80 84 104 Z" fill="${c}"/>`;
      for (let i = 0; i < 8; i++) {
        const y = 150 + i * 16;
        const x = 86 + (i % 2 === 0 ? 0 : 8);
        s += `<circle cx="${x}" cy="${y}" r="10" fill="${c}"/>`;
      }
      s += `<circle cx="90" cy="286" r="8" fill="${darken(c, 0.15)}"/>`;
      return s;
    }
    case 'hijab':
      return `<path d="M70 112 C64 58 176 54 172 112 C186 160 184 214 150 230 L120 206 L90 230 C58 214 54 160 70 112 Z" fill="${c}"/>`;
    default:
      return '';
  }
}

function hairFront(look: PersonLook): string {
  const c = look.hairColor;
  if (look.hair === 'bob') {
    return `<path d="M84 92 Q120 74 156 92 Q146 114 120 110 Q96 114 84 92 Z" fill="${c}"/>`;
  }
  if (look.hair === 'hijab') {
    return `<path d="M82 90 Q120 68 158 90 Q150 108 120 104 Q90 108 82 90 Z" fill="${c}"/>
      <path d="M78 118 Q70 150 86 176" fill="none" stroke="${darken(c, 0.15)}" stroke-width="8" stroke-linecap="round"/>
      <path d="M162 118 Q170 150 154 176" fill="none" stroke="${darken(c, 0.15)}" stroke-width="8" stroke-linecap="round"/>`;
  }
  if (look.hair === 'curls') {
    return `<circle cx="92" cy="78" r="10" fill="${c}"/><circle cx="148" cy="78" r="10" fill="${c}"/><circle cx="120" cy="70" r="9" fill="${c}"/>`;
  }
  if (look.hair === 'waves') {
    return `<path d="M92 86 Q120 74 148 88 Q132 100 120 96 Q108 100 92 86 Z" fill="${c}"/>`;
  }
  return '';
}

function face(look: PersonLook, pose: Pose): string {
  const blush = look.blush ?? '#e7a0a8';
  const smile =
    pose === 'cheer' || pose === 'twirl'
      ? `<path d="M108 122 Q120 136 132 122 Q120 130 108 122 Z" fill="#c45b6a"/>`
      : `<path d="M108 120 Q120 132 132 120" fill="none" stroke="#b55268" stroke-width="2.2" stroke-linecap="round"/>`;
  const freckleDots = look.freckles
    ? [
        [100, 116],
        [108, 120],
        [112, 114],
        [132, 116],
        [140, 120],
        [136, 114],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.15" fill="#a56b48" opacity="0.8"/>`)
        .join('')
    : '';
  const glasses = look.glasses
    ? `<g fill="none" stroke="#2a211c" stroke-width="2">
        <circle cx="104" cy="100" r="14"/>
        <circle cx="136" cy="100" r="14"/>
        <path d="M118 100 h4"/>
      </g>`
    : '';
  return `<g class="face">
    <ellipse cx="96" cy="114" rx="10" ry="6" fill="${blush}" opacity="0.45"/>
    <ellipse cx="144" cy="114" rx="10" ry="6" fill="${blush}" opacity="0.45"/>
    <path d="M120 104 Q123 112 118 114" fill="none" stroke="#2a211c" stroke-opacity="0.35" stroke-width="1.4" stroke-linecap="round"/>
    <g class="eye">
      <ellipse cx="104" cy="100" rx="8.5" ry="6.4" fill="#fff"/>
      <circle cx="105" cy="101" r="3.4" fill="#2a211c"/>
      <circle cx="106.6" cy="99.4" r="1.3" fill="#fff"/>
      <path class="lid" d="M95 100 Q104 92 113 100 Q104 108 95 100 Z" fill="${look.skin}"/>
    </g>
    <g class="eye">
      <ellipse cx="136" cy="100" rx="8.5" ry="6.4" fill="#fff"/>
      <circle cx="137" cy="101" r="3.4" fill="#2a211c"/>
      <circle cx="138.6" cy="99.4" r="1.3" fill="#fff"/>
      <path class="lid" d="M127 100 Q136 92 145 100 Q136 108 127 100 Z" fill="${look.skin}"/>
    </g>
    <path d="M94 86 Q104 80 114 88" fill="none" stroke="${darken(look.hairColor, 0.1)}" stroke-width="2" stroke-linecap="round"/>
    <path d="M126 88 Q136 80 146 86" fill="none" stroke="${darken(look.hairColor, 0.1)}" stroke-width="2" stroke-linecap="round"/>
    ${smile}
    ${freckleDots}
    ${glasses}
  </g>`;
}

function body(look: PersonLook): { legs: string; torso: string; arms: string } {
  const skin = look.skin;
  const leg = (side: string, origin: string, d: string) =>
    `<g class="leg ${side}" style="transform-origin:${origin}"><path d="${d}" fill="${skin}"/></g>`;
  const legs = `<g class="legs">
      ${leg('left', '106px 300px', 'M100 296 C96 348 92 410 98 468 L116 470 C120 412 118 350 118 296 Z')}
      ${leg('right', '134px 300px', 'M122 296 C124 350 122 412 126 470 L144 468 C148 410 144 348 140 296 Z')}
      <ellipse cx="104" cy="474" rx="14" ry="8" fill="${skin}"/>
      <ellipse cx="138" cy="474" rx="14" ry="8" fill="${skin}"/>
    </g>`;
  const torso = `<path d="M80 176 C72 206 78 250 94 272 L146 272 C162 250 168 206 160 176 Q120 190 80 176 Z" fill="${skin}"/>
    <path d="M106 146 h28 l-3 30 h-22 z" fill="${skin}"/>`;
  const arms = `<g class="arm left" style="transform-origin:78px 180px">
      <path d="M86 170 C58 182 40 220 38 262 C36 276 50 280 56 268 C60 230 74 198 96 184 Z" fill="${skin}"/>
      <circle cx="46" cy="270" r="9" fill="${skin}"/>
    </g>
    <g class="arm right" style="transform-origin:162px 180px">
      <path d="M154 170 C182 182 200 220 202 262 C204 276 190 280 184 268 C180 230 166 198 144 184 Z" fill="${skin}"/>
      <circle cx="194" cy="270" r="9" fill="${skin}"/>
    </g>`;
  return { legs, torso, arms };
}

export function renderPerson(opts: {
  look: PersonLook;
  outfit?: Outfit | null;
  pose?: Pose;
  uid: string;
}): string {
  const pose = opts.pose ?? 'idle';
  const { legs, torso, arms } = body(opts.look);
  let back = '';
  let main = '';
  let sleeves = '';
  let shade = '';
  let extras = '';
  let defs = '';
  if (opts.outfit) {
    const g = renderGarment(opts.outfit, opts.uid, 'worn', 'fashion');
    defs = g.defs;
    back = g.back;
    main = g.main;
    sleeves = g.sleeves;
    shade = g.shade;
    extras = g.extras;
  }
  const street = opts.outfit
    ? ''
    : `<g class="street">
        <path d="M84 174 C74 198 80 236 96 252 L144 252 C160 236 166 198 156 174 Q120 188 84 174 Z" fill="#f7f1ea" stroke="#e6d9cc" stroke-width="1.4"/>
        <path d="M98 248 C86 300 78 340 74 378 L108 382 L116 320 L124 382 L166 378 C162 340 154 300 142 248 Z" fill="#e7d5c8"/>
        <path d="M98 248 Q120 258 142 248" fill="none" stroke="#d8c2b4" stroke-width="2"/>
        <ellipse cx="102" cy="486" rx="16" ry="7" fill="#cbb5a2"/>
        <ellipse cx="140" cy="486" rx="16" ry="7" fill="#cbb5a2"/>
      </g>`;
  const beret = opts.look.beret
    ? `<g transform="translate(126 62) rotate(-12)">
        <ellipse cx="0" cy="8" rx="28" ry="8" fill="#1a120e"/>
        <path d="M-24 4 C-28 -14 16 -18 26 -2 C28 8 8 12 -24 4 Z" fill="#2a211c"/>
        <circle cx="8" cy="-6" r="3" fill="#e2b15a"/>
      </g>`
    : '';
  return `<svg class="person pose-${pose}" viewBox="${PERSON_VB}" width="300" height="540">
    <defs>${defs}</defs>
    <ellipse cx="120" cy="512" rx="50" ry="10" fill="#000" opacity="0.08"/>
    ${hairBack(opts.look)}
    ${legs}
    <g class="garment-back">${back}</g>
    ${torso}
    <g class="garment-main">${main}${street}</g>
    ${arms}
    <g class="garment-sleeves">${sleeves}</g>
    <g class="garment-shade">${shade}</g>
    <circle cx="120" cy="98" r="40" fill="${opts.look.skin}"/>
    <ellipse cx="80" cy="104" rx="7" ry="10" fill="${opts.look.skin}"/>
    <ellipse cx="160" cy="104" rx="7" ry="10" fill="${opts.look.skin}"/>
    ${face(opts.look, pose)}
    ${hairFront(opts.look)}
    ${beret}
    <g class="garment-extras">${extras}</g>
  </svg>`;
}
