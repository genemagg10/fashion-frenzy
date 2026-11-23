/**
 * Plays six customers and asserts the painted shop never falls back
 * to the old cartoon room. Run from the repo with the dev server up:
 *   node scripts/shop-painted-regression.mjs
 * Pass --sheet to also write the contact-sheet screenshots.
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';

const base = process.env.FF_URL || 'http://127.0.0.1:5173/';
const sheet = process.argv.includes('--sheet');
const out = process.env.FF_OUT || '/tmp/ff-sheet';
mkdirSync(out, { recursive: true });

const LEGACY = '.shop-bunting, .shop-window, .window-view, .shop-sign, .prop-rack, .shop-props, .mirror-wrap, .shop-stage.illustrated, .prop';

const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 820, height: 1180 } });
const errors = [];
page.on('pageerror', (err) => errors.push(String(err)));

async function shopInfo() {
  return page.evaluate((legacy) => {
    const bg = document.querySelector('.shop-bg');
    const stage = document.querySelector('.shop-stage');
    return {
      scene: document.querySelector('#app')?.dataset.scene || '',
      painted: !!stage?.classList.contains('painted'),
      src: bg?.getAttribute('src') || '',
      nw: bg?.naturalWidth || 0,
      nh: bg?.naturalHeight || 0,
      legacy: !!document.querySelector(legacy),
      pageScroll: document.documentElement.scrollHeight - document.documentElement.clientHeight,
    };
  }, LEGACY);
}

async function assertShop(label) {
  await page.waitForSelector('.shop-stage.painted .shop-bg', { timeout: 8000 });
  await page.waitForFunction(() => {
    const bg = document.querySelector('.shop-bg');
    return bg && bg.complete && bg.naturalWidth > 100;
  });
  const info = await shopInfo();
  const ok = info.scene === 'shop' && info.painted && !info.legacy && /shop-(portrait|wide)\.png/.test(info.src) && info.nw > 100;
  if (!ok) throw new Error(`${label} shop check failed ${JSON.stringify(info)}`);
  if (info.pageScroll > 4) throw new Error(`${label} page scrolled ${info.pageScroll}`);
  console.log('shop', label, info.src, `${info.nw}x${info.nh}`);
  return info;
}

async function click(sel) {
  const el = page.locator(sel).first();
  await el.waitFor({ state: 'visible', timeout: 8000 });
  await el.click();
}

async function serveOne() {
  const showing = await page.evaluate(() => {
    const el = document.querySelector('[data-act="decline-show"]');
    if (!el) return null;
    return { html: el.outerHTML.slice(0, 180), h1: document.querySelector('h1')?.textContent || '' };
  });
  if (showing) {
    console.log('show-detect', JSON.stringify(showing));
    return 'show';
  }
  await click('[data-act="design"]');
  await click('[data-act="sketch-pick"]');
  await click('[data-act="color"]');
  await click('[data-act="pattern"]');
  await click('[data-act="to-sew"]');
  await click('[data-act="help-sew"]');
  await click('[data-act="finish"]');
  await page.waitForSelector('[data-act="next-customer"]');
  return 'done';
}

await page.goto(base, { waitUntil: 'networkidle' });
await click('[data-act="open-shop"]');
let visits = 1;
await assertShop('visit-1');

let declined = false;
let showed = false;
for (let n = 0; n < 8 && visits < 6; n++) {
  const kind = await serveOne();
  if (kind === 'show') {
    showed = true;
    await page.screenshot({ path: join(out, 'show-offer.png'), animations: 'disabled' });
    await page.waitForTimeout(750);
    const gone = await page.evaluate(async () => {
      const fire = () => {
        const el = document.querySelector('[data-act="decline-show"]');
        el?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      };
      fire();
      if (!document.querySelector('[data-act="decline-show"]')) return { gone: true, try: 1 };
      await new Promise((resolve) => setTimeout(resolve, 900));
      fire();
      return {
        gone: !document.querySelector('[data-act="decline-show"]'),
        try: 2,
        h1: document.querySelector('h1')?.textContent || '',
      };
    });
    console.log('decline result', JSON.stringify(gone));
    if (!gone.gone) throw new Error(`decline did not leave the show offer ${JSON.stringify(gone)} page ${errors.join('|')}`);
    declined = true;
    visits += 1;
    await assertShop(`after-decline-${visits}`);
    continue;
  }
  await click('[data-act="next-customer"]');
  visits += 1;
  await assertShop(`visit-${visits}`);
  if (visits === 3) {
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.waitForTimeout(250);
    await assertShop('rotated-landscape');
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.waitForTimeout(250);
    await assertShop('rotated-back');
  }
}

if (visits < 6) throw new Error(`only ${visits} shop visits`);
if (!declined || !showed) throw new Error(`show path missing declined=${declined} showed=${showed}`);

await click('[data-act="reviews"]');
await page.waitForSelector('.guest-page');
if (await page.locator(LEGACY).count()) throw new Error('legacy on reviews');
await click('[data-act="back"]');
await assertShop('back-from-reviews');

await click('[data-act="lookbook"]');
await page.waitForSelector('h1');
await click('[data-act="back"]');
await assertShop('back-from-lookbook');

await click('[data-act="shelf"]');
await page.waitForSelector('h1');
await click('[data-act="back"]');
await assertShop('back-from-shelf');

if (await page.locator('.hot-cat').count()) {
  await page.locator('.hot-cat').click({ force: true });
  await assertShop('after-cat');
}
if (await page.locator('.hot-poster').count()) {
  await page.locator('.hot-poster').click({ force: true });
  await page.waitForTimeout(200);
  if (await page.locator('[data-act="leave-show"]').count()) {
    await click('[data-act="leave-show"]');
    await click('[data-act="leave-show"]');
    await assertShop('back-from-poster-show');
  } else {
    await assertShop('after-poster-toast');
  }
}

if (errors.length) throw new Error(errors.join('\n'));
console.log(`painted shop held for ${visits} visits`);

if (sheet) {
  const shots = [];
  const views = [
    ['ipad-p', 820, 1180],
    ['ipad-l', 1180, 820],
    ['desk', 1440, 900],
    ['phone-p', 390, 844],
    ['phone-l', 844, 390],
  ];
  async function shoot(scene) {
    for (const [name, w, h] of views) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(280);
      const file = join(out, `${scene}-${name}.png`);
      await page.screenshot({ path: file, animations: 'disabled' });
      const audit = await page.evaluate(() => window.__ffAspect?.() || { ok: true, rows: [] });
      const bad = (audit.rows || []).filter((row) => row.off > 0.02);
      if (!audit.ok) throw new Error(`${scene} ${name} aspect ${JSON.stringify(bad)}`);
      shots.push({ scene, name, file, rows: audit.rows?.length || 0 });
      console.log('shot', scene, name, 'aspect', audit.rows?.length, 'ok');
    }
  }

  await page.setViewportSize({ width: 820, height: 1180 });
  if ((await page.locator('#app').getAttribute('data-scene')) !== 'shop') {
    await page.goto(base, { waitUntil: 'networkidle' });
    await click('[data-act="open-shop"]');
  }
  await shoot('shop');

  if (await page.locator('[data-act="decline-show"]').count()) await click('[data-act="decline-show"]');
  if (await page.locator('[data-act="design"]').count()) {
    await click('[data-act="design"]');
    await click('[data-act="sketch-pick"]');
    await page.waitForSelector('.dress-svg');
    await shoot('color');
    await page.setViewportSize({ width: 820, height: 1180 });
    await click('[data-act="color"]');
    await click('[data-act="pattern"]');
    await click('[data-act="to-sew"]');
    await click('[data-act="help-sew"]');
    await page.waitForSelector('.trims, [data-pane="trim"]');
    await shoot('trim');
    await page.setViewportSize({ width: 820, height: 1180 });
    await click('[data-act="finish"]');
    await click('[data-act="next-customer"]');
    await page.waitForSelector('[data-act="reviews"]', { timeout: 8000 }).catch(() => {});
    if (await page.locator('[data-act="reviews"]').count()) {
      await click('[data-act="reviews"]');
      await shoot('reviews');
    }
  }

  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const raw = localStorage.getItem('fashion-frenzy-v1');
    const save = raw ? JSON.parse(raw) : {};
    save.tutorialDone = true;
    save.customersServed = 6;
    save.coins = 80;
    localStorage.setItem('fashion-frenzy-v1', JSON.stringify(save));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await click('[data-act="open-shop"]');
  if (await page.locator('[data-act="start-show"]').count()) {
    await click('[data-act="start-show"]');
    for (let look = 0; look < 3; look++) {
      await click('[data-act="sketch-pick"]');
      await click('[data-act="color"]');
      await click('[data-act="pattern"]');
      await click('[data-act="to-sew"]');
      await click('[data-act="help-sew"]');
      await click('[data-act="finish"]');
    }
    await page.waitForSelector('.runway, .model-slot', { timeout: 8000 });
    await page.waitForTimeout(400);
    await shoot('runway');
  } else {
    console.log('no show offer for runway shots');
  }

  const { default: sharp } = await import('sharp');
  const scenes = ['color', 'trim', 'shop', 'runway', 'reviews'];
  const cellW = 280;
  const cellH = 360;
  const cols = views.length;
  const rows = scenes.length;
  const sheetW = cols * cellW;
  const sheetH = rows * cellH + 28;
  const composites = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const file = join(out, `${scenes[r]}-${views[c][0]}.png`);
      const buf = await sharp(file)
        .resize(cellW - 8, cellH - 28, { fit: 'contain', background: '#f6efe8' })
        .png()
        .toBuffer();
      composites.push({ input: buf, left: c * cellW + 4, top: r * cellH + 24 });
    }
  }
  const label = Buffer.from(
    `<svg width="${sheetW}" height="${sheetH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f6efe8"/>
      ${views.map((v, i) => `<text x="${i * cellW + 12}" y="18" font-size="14" font-family="sans-serif" fill="#2a211c">${v[0]} ${v[1]}x${v[2]}</text>`).join('')}
      ${scenes.map((s, i) => `<text x="8" y="${i * cellH + 42}" font-size="12" font-family="sans-serif" fill="#c23b5a">${s}</text>`).join('')}
    </svg>`,
  );
  const sheetFile = join(out, 'contact-sheet.png');
  await sharp(label).composite(composites).png().toFile(sheetFile);
  console.log('sheet', sheetFile);
}

await browser.close();
console.log('regression passed');
