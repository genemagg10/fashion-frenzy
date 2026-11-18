import { darken, lighten } from './color';
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
    return `<path d="M86 78 Q120 62 154 78 Q148 92 120 90 Q92 92 86 78 Z" fill="${c}"/>`;
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
    return `<path d="M94 76 Q120 64 146 78 Q136 90 120 86 Q104 90 94 76 Z" fill="${c}"/>`;
  }
  return '';
}

function face(look: PersonLook, pose: Pose): string {
  const blush = look.blush ?? '#e48b98';
  const excited = pose === 'cheer' || pose === 'twirl';
  const smile = excited
    ? `<path d="M106 118 Q120 136 134 118 Q120 128 106 118 Z" fill="#c4475c"/>
       <path d="M112 122 Q120 128 128 122" fill="#fff" opacity="0.55"/>`
    : `<path d="M106 118 Q120 132 134 118" fill="none" stroke="#b5475c" stroke-width="2.4" stroke-linecap="round"/>`;
  const freckleDots = look.freckles
    ? [
        [98, 112],
        [106, 116],
        [110, 110],
        [130, 110],
        [136, 116],
        [144, 112],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#a86a45"/>`)
        .join('')
    : '';
  const glasses = look.glasses
    ? `<g fill="rgba(255,255,255,0.18)" stroke="#2a211c" stroke-width="1.7">
        <circle cx="104" cy="98" r="12"/>
        <circle cx="136" cy="98" r="12"/>
        <path d="M116 98 h8" fill="none"/>
        <path d="M92 96 h-6 M148 96 h6" fill="none" stroke-linecap="round"/>
      </g>`
    : '';
  const eye = (cx: number) => `<g class="eye">
      <ellipse cx="${cx}" cy="98" rx="9" ry="7.2" fill="#fff"/>
      <circle cx="${cx + 0.6}" cy="99" r="3.8" fill="#2a211c"/>
      <circle cx="${cx + 2.1}" cy="97.4" r="1.5" fill="#fff"/>
    </g>`;
  return `<g class="face">
    <ellipse cx="94" cy="112" rx="12" ry="7" fill="${blush}" opacity="0.7"/>
    <ellipse cx="146" cy="112" rx="12" ry="7" fill="${blush}" opacity="0.7"/>
    <path d="M120 104 Q124 112 117 114" fill="none" stroke="#2a211c" stroke-opacity="0.4" stroke-width="1.5" stroke-linecap="round"/>
    ${eye(103)}
    ${eye(137)}
    <path d="M92 84 Q103 78 114 86" fill="none" stroke="${darken(look.hairColor, 0.15)}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M126 86 Q137 78 148 84" fill="none" stroke="${darken(look.hairColor, 0.15)}" stroke-width="2.2" stroke-linecap="round"/>
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
  const torso = `<g class="hip">
      <path d="M108 132 C104 156 106 170 112 178 L128 178 C134 170 136 156 132 132 Z" fill="${skin}"/>
      <path d="M80 176 C72 206 78 250 94 272 L146 272 C162 250 168 206 160 176 Q120 190 80 176 Z" fill="${skin}"/>
    </g>`;
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

function streetWear(look: PersonLook): string {
  const top = look.streetTop ?? '#e23b6a';
  const bottom = look.streetBottom ?? '#2a211c';
  const edge = darken(top, 0.28);
  if (look.streetKind === 'separates') {
    return `<g class="street">
      <path d="M82 172 C74 196 80 236 96 252 L144 252 C160 236 166 196 158 172 Q120 190 82 172 Z" fill="${top}" stroke="${edge}" stroke-width="2"/>
      <path d="M100 176 Q120 196 140 176" fill="none" stroke="${lighten(top, 0.35)}" stroke-width="3" stroke-linecap="round"/>
      <path d="M96 248 L78 392 Q96 404 108 392 L114 300 L120 392 Q132 406 148 392 L162 248 Z" fill="${bottom}"/>
      <path d="M96 248 Q120 260 144 248" fill="none" stroke="${darken(bottom, 0.25)}" stroke-width="3"/>
      <ellipse cx="100" cy="486" rx="18" ry="8" fill="${darken(bottom, 0.15)}"/>
      <ellipse cx="142" cy="486" rx="18" ry="8" fill="${darken(bottom, 0.15)}"/>
    </g>`;
  }
  return `<g class="street">
    <path d="M78 168 C68 210 74 280 64 392 Q120 418 176 392 C166 280 172 210 162 168 Q120 192 78 168 Z" fill="${top}" stroke="${edge}" stroke-width="2.2"/>
    <path d="M96 170 Q120 202 144 170" fill="${lighten(top, 0.22)}"/>
    <path d="M92 250 Q120 262 148 250" fill="none" stroke="${edge}" stroke-width="2" opacity="0.7"/>
    <path d="M86 300 Q100 340 92 388 M154 300 Q140 340 148 388" fill="none" stroke="${edge}" stroke-width="1.6" opacity="0.35" stroke-linecap="round"/>
    <ellipse cx="100" cy="486" rx="18" ry="8" fill="${bottom}"/>
    <ellipse cx="142" cy="486" rx="18" ry="8" fill="${bottom}"/>
    <path d="M86 482 Q100 474 112 482 M130 482 Q142 474 156 482" fill="none" stroke="${lighten(bottom, 0.35)}" stroke-width="1.5"/>
  </g>`;
}

export function renderPerson(opts: {
  look: PersonLook;
  outfit?: Outfit | null;
  pose?: Pose;
  uid: string;
  embed?: boolean;
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
  const street = opts.outfit ? '' : streetWear(opts.look);
  const beret = opts.look.beret
    ? `<g transform="translate(126 62) rotate(-12)">
        <ellipse cx="0" cy="8" rx="28" ry="8" fill="#1a120e"/>
        <path d="M-24 4 C-28 -14 16 -18 26 -2 C28 8 8 12 -24 4 Z" fill="#2a211c"/>
        <circle cx="8" cy="-6" r="3" fill="#e2b15a"/>
      </g>`
    : '';
  const inner = `
    <ellipse cx="120" cy="512" rx="50" ry="10" fill="#000" opacity="0.12"/>
    ${hairBack(opts.look)}
    ${legs}
    <g class="garment-back">${back}</g>
    ${torso}
    <g class="garment-main">${street}${main}</g>
    ${arms}
    <g class="garment-sleeves">${sleeves}</g>
    <g class="garment-shade">${shade}</g>
    <circle cx="120" cy="96" r="42" fill="${opts.look.skin}"/>
    <ellipse cx="78" cy="102" rx="8" ry="11" fill="${opts.look.skin}"/>
    <ellipse cx="162" cy="102" rx="8" ry="11" fill="${opts.look.skin}"/>
    ${face(opts.look, pose)}
    ${hairFront(opts.look)}
    ${beret}
    <g class="garment-extras">${extras}</g>`;
  if (opts.embed) {
    return `<g class="person pose-${pose}">${defs ? `<defs>${defs}</defs>` : ''}${inner}</g>`;
  }
  return `<svg class="person pose-${pose}" viewBox="${PERSON_VB}" width="300" height="540">
    <defs>${defs}</defs>
    ${inner}
  </svg>`;
}
