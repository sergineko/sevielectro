import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { projects } from '../src/data/content.js';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const sitemap = read('dist/sitemap.xml');
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([,url]) => url);

test('el sitemap incluye todas las páginas públicas con su canonical y sin bloqueos de indexación', () => {
  const files = readdirSync(new URL('../dist/', import.meta.url), { recursive: true })
    .filter(file => file.endsWith('.html') && file !== '404.html');
  assert.equal(pages.length, files.length);
  assert.equal(new Set(pages).size, pages.length);
  for (const file of files) {
    const html = read(`dist/${file}`);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    assert.ok(pages.includes(canonical), file);
    assert.match(html, /name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/);
    assert.ok(!/<meta\b[^>]*content="[^"]*\b(?:noindex|nofollow|nosnippet|noimageindex)\b/i.test(html), file);
  }
});

test('robots permite cualquier crawler y el sitemap expone las fotografías reales', () => {
  const robots = read('dist/robots.txt');
  assert.match(robots, /^User-agent: \*\s+Allow: \/\s+Sitemap: https:\/\/sevielectro\.com\/sitemap\.xml\s*$/);
  assert.ok(!/Disallow:\s*\S/i.test(robots));
  assert.ok(!/X-Robots-Tag:/i.test(read('dist/_headers')));
  assert.match(sitemap, /xmlns:image="http:\/\/www.google.com\/schemas\/sitemap-image\/1\.1"/);
  const images = [...sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(([,url]) => url);
  assert.equal(images.length,projects.length+1);
  assert.equal(new Set(images).size,images.length);
  for (const image of images) {
    const url = new URL(image);
    assert.equal(url.origin,'https://sevielectro.com');
    assert.ok(existsSync(new URL(`../dist${url.pathname}`,import.meta.url)),image);
  }
});
