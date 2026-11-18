import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('public/sprites');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith('.png')) files.push(full);
  }
  return files;
}

const files = await walk(root);
let wrote = 0;
for (const file of files) {
  const dest = file.replace(/\.png$/, '.webp');
  try {
    const srcStat = await stat(file);
    const destStat = await stat(dest).catch(() => null);
    if (destStat && destStat.mtimeMs >= srcStat.mtimeMs) continue;
  } catch {
    /* write it */
  }
  const input = await readFile(file);
  const webp = await sharp(input).webp({ quality: 82, alphaQuality: 90 }).toBuffer();
  await writeFile(dest, webp);
  wrote += 1;
}
console.log(`webp sprites: ${wrote} updated, ${files.length} pngs`);
