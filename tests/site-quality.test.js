import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const home = read('dist/index.html');

test('las variantes de imagen entregadas existen y conservan sus proporciones', async () => {
  const images = JSON.parse(read('src/data/responsive-media.json'));
  for (const image of Object.values(images)) {
    for (const variant of [image.srcset, image.avifSrcset].filter(Boolean).flatMap(srcset => srcset.split(', '))) {
      const [src, width] = variant.split(' ');
      const file = new URL(`../public${src}`, import.meta.url);
      assert.ok(existsSync(file), src);
      const metadata = await sharp(fileURLToPath(file)).metadata();
      assert.equal(metadata.width, Number(width.slice(0,-1)), src);
      assert.ok(Math.abs(metadata.width / metadata.height - image.width / image.height) < .05, src);
    }
  }
});

test('todas las páginas públicas son indexables y el error 404 no se indexa', () => {
  assert.ok(!home.includes('content="noindex'));
  assert.match(home, /rel="canonical" href="https:\/\/sevielectro.com\/"/);
  assert.match(read('dist/sitemap.xml'), /<loc>https:\/\/sevielectro.com\/<\/loc>/);
  assert.match(read('dist/robots.txt'), /Sitemap: https:\/\/sevielectro.com\/sitemap.xml/);
  for (const file of ['privacidad/index.html','aviso-legal/index.html','cookies/index.html']) {
    const page = read(`dist/${file}`);
    assert.match(page, /name="robots" content="index, follow,/);
    assert.ok(!page.includes('content="noindex'));
  }
  assert.match(read('dist/404.html'), /name="robots" content="noindex, follow"/);
});

test('la imagen social y los iconos existen con las dimensiones declaradas', async () => {
  for (const [file, width, height] of [['media/og-sevielectro.jpg',1200,630],['favicon-32.png',32,32],['apple-touch-icon.png',180,180]]) {
    const metadata = await sharp(fileURLToPath(new URL(`../dist/${file}`,import.meta.url))).metadata();
    assert.equal(metadata.width,width); assert.equal(metadata.height,height);
  }
  const json = home.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
  const schema = JSON.parse(json);
  assert.equal(schema['@type'],'Electrician');
  assert.equal(schema.telephone,'+593984120086');
});

test('los recursos con caché inmutable usan nombres con huella y la carga principal se prioriza', () => {
  for (const [,src] of home.matchAll(/(?:src|href)="(\/media\/responsive\/[^\"]+)"/g)) assert.match(src,/\/[a-f0-9]{12}-\d+\.(?:webp|avif)$/);
  assert.match(home, /class="hero-photo"[^>]*fetchpriority="high"[^>]*loading="eager"/);
  assert.match(home, /client="visible"/);
  assert.match(read('dist/_headers'), /\/media\/responsive\/\*[\s\S]*max-age=31536000, immutable/);
});
