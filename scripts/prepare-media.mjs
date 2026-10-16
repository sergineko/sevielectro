import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { clients, team } from '../src/data/content.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const media = JSON.parse(await readFile(path.join(root, 'src/data/media.json'), 'utf8'));
const sources = new Map(Object.values(media).map(asset => [asset.src, asset.original]));
sources.set('/media/original/Logo-SeviElectro-1.png', '/media/original/Logo-SeviElectro-1.png');
for (const member of team) if (member.photo && !sources.has(member.photo)) sources.set(member.photo, member.photo);
const output = path.join(root, 'public/media/responsive');
await mkdir(output, { recursive: true });
const manifest = {};
for (const [key, original] of sources) {
  const bytes = await readFile(path.join(root, 'public', original));
  const { width, height } = await sharp(bytes).rotate().metadata();
  const maxWidth = Math.min(width, 1600);
  const widths = [...new Set([160, 320, 640, 960, 1280, maxWidth].filter(w => w <= maxWidth))].sort((a,b) => a-b);
  const hash = createHash('sha256').update(bytes).update('webp-v1-q78').digest('hex').slice(0, 12);
  const variants = [];
  for (const size of widths) {
    const filename = `${hash}-${size}.webp`;
    try { await access(path.join(output, filename)); }
    catch { await sharp(bytes).rotate().resize({ width: size, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(path.join(output, filename)); }
    variants.push({ src: `/media/responsive/${filename}`, width: size });
  }
  const preferred = variants.find(v => v.width >= Math.min(640, maxWidth)) || variants.at(-1);
  manifest[key] = { src: preferred.src, srcset: variants.map(v => `${v.src} ${v.width}w`).join(', '), width, height, full: variants.at(-1).src };
  // Reduce the critical image payload; retain WebP for browsers without AVIF.
  if (['/media/original/SeviElectric.jpg', '/media/original/Logo-SeviElectro-1.png'].includes(original)) {
    const quality = original.endsWith('.png') ? 55 : 45;
    const avifHash = createHash('sha256').update(bytes).update(`avif-v1-q${quality}-444`).digest('hex').slice(0, 12);
    const avif = [];
    for (const size of widths) {
      const filename = `${avifHash}-${size}.avif`;
      try { await access(path.join(output, filename)); }
      catch { await sharp(bytes).rotate().resize({ width: size, withoutEnlargement: true }).avif({ quality, effort: 5, chromaSubsampling: '4:4:4' }).toFile(path.join(output, filename)); }
      avif.push({ src: `/media/responsive/${filename}`, width: size });
    }
    manifest[key].avifSrcset = avif.map(v => `${v.src} ${v.width}w`).join(', ');
  }
}
await writeFile(path.join(root, 'src/data/responsive-media.json'), JSON.stringify(manifest, null, 2) + '\n');
// Social previews and device icons keep the original photography and logotype.
const logoBytes = await readFile(path.join(root, 'public/media/original/Logo-SeviElectro-1.png'));
for (const size of [32, 180]) {
  const logoImage = await sharp(logoBytes).resize({ width: Math.round(size * .88) }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: '#ffffff' } })
    .composite([{ input: logoImage, gravity: 'centre' }]).png()
    .toFile(path.join(root, 'public', size === 32 ? 'favicon-32.png' : 'apple-touch-icon.png'));
}
const ogLogo = await sharp(logoBytes).resize({ width: 350 }).png().toBuffer();
const plate = await sharp({ create: { width: 406, height: 142, channels: 4, background: '#ffffff' } })
  .composite([{ input: ogLogo, gravity: 'centre' }]).png().toBuffer();
await sharp(path.join(root, 'public/media/original/SeviElectric.jpg')).resize(1200,630,{fit:'cover'})
  .composite([{ input: plate, left: 54, top: 434 }]).jpeg({quality:83})
  .toFile(path.join(root, 'public/media/og-sevielectro.jpg'));

// One shared, immutable request for all client marks, with their original colours.
const staticOutput = path.join(root, 'public/media/static');
await mkdir(staticOutput, { recursive: true });
async function staticAsset(bytes, extension) {
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  const filename = `${hash}.${extension}`;
  await writeFile(path.join(staticOutput, filename), bytes);
  return `/media/static/${filename}`;
}
const clientSymbols = [];
for (const [index, [file]] of clients.entries()) {
  const original = path.join(root, 'public', media[file].original);
  const flattened = await sharp(original).rotate().flatten({background:'#ffffff'}).toBuffer();
  const { data, info } = await sharp(flattened).trim({background:'#ffffff',threshold:10}).resize({width:360, height:180, fit:'inside', withoutEnlargement:true})
    .webp({quality:90, effort:5}).toBuffer({resolveWithObject:true});
  clientSymbols.push({id:`client-${index}`, width:info.width, height:info.height, data});
}
const sprite = `<svg xmlns="http://www.w3.org/2000/svg">${clientSymbols.map(({id,width,height,data}) => `<symbol id="${id}" viewBox="0 0 ${width} ${height}"><image width="${width}" height="${height}" href="data:image/webp;base64,${data.toString('base64')}"/></symbol>`).join('')}</svg>`;
const assets = {
  clients: {src:await staticAsset(Buffer.from(sprite), 'svg'), symbols:clientSymbols.map(({id,width,height})=>({id,width,height}))},
  font: await staticAsset(await readFile(path.join(root, 'public/fonts/inter-latin.woff2')), 'woff2'),
  favicon: await staticAsset(await readFile(path.join(root, 'public/favicon-32.png')), 'png'),
  touchIcon: await staticAsset(await readFile(path.join(root, 'public/apple-touch-icon.png')), 'png'),
  socialImage: await staticAsset(await readFile(path.join(root, 'public/media/og-sevielectro.jpg')), 'jpg'),
};
await writeFile(path.join(root, 'src/data/static-assets.json'), JSON.stringify(assets, null, 2)+'\n');
await writeFile(path.join(root, 'src/styles/font-face.css'), `/* Generated by prepare-media.mjs. */\n@font-face{font-family:Inter;src:url('${assets.font}') format('woff2');font-style:normal;font-weight:400 800;font-display:swap}\n`);
console.log(`Responsive delivery ready: ${sources.size} images; originals preserved.`);
