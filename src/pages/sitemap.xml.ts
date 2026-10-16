import { projects } from '../data/content';
import media from '../data/media.json';
import responsive from '../data/responsive-media.json';

export const prerender = true;
const publicPaths = ['/', '/aviso-legal/', '/privacidad/', '/cookies/'];
const xml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export function GET({ site }: { site: URL }) {
  const images = [...new Set([media['SeviElectric.jpg'].src, ...projects.map(project => media[project.file].src)])]
    .map(src => new URL(responsive[src].full, site).href);
  const entries = publicPaths.map(path => {
    const photographs = path === '/' ? images.map(src => `<image:image><image:loc>${xml(src)}</image:loc></image:image>`).join('') : '';
    return `<url><loc>${xml(new URL(path, site).href)}</loc>${photographs}</url>`;
  }).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
