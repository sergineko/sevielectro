export const prerender = true;
// One policy for every crawler, including search and discovery bots.
export function GET({ site }: { site: URL }) {
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}
