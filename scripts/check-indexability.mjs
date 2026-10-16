import { writeFile } from 'node:fs/promises';

const target = new URL(process.argv[2] || 'http://127.0.0.1:4321/');
if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password) throw new Error('Indica una URL HTTP(S) pública sin credenciales.');
const errors = [];
const requests = [];
const blocked = /\b(noindex|nofollow|none|noimageindex|nosnippet|unavailable_after)\b/i;
const check = (condition, message) => { if (!condition) errors.push(message); };
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([,key,value]) => [key.toLowerCase(),value]));

async function get(path, agent = 'SeviElectroDiscoveryAudit/1.0', readBody = true) {
  const url = new URL(path, target.origin);
  const response = await fetch(url, { headers: { 'User-Agent': agent }, signal: AbortSignal.timeout(10000) });
  const headers = Object.fromEntries(['content-type','x-robots-tag','cf-mitigated','cf-ray','server'].map(name => [name,response.headers.get(name)]));
  const body = readBody ? await response.text() : (await response.arrayBuffer(), '');
  requests.push({ path:url.pathname,agent,status:response.status,finalUrl:response.url,headers });
  check(!blocked.test(headers['x-robots-tag'] || ''), `${agent}: cabecera restrictiva en ${url.pathname}`);
  check(headers['cf-mitigated'] !== 'challenge', `${agent}: desafío de Cloudflare en ${url.pathname}`);
  return { status:response.status,body,headers };
}

const robots = await get('/robots.txt');
check(robots.status === 200, 'robots.txt no responde 200');
check(/^User-agent:\s*\*\s*$/im.test(robots.body) && /^Allow:\s*\/\s*$/im.test(robots.body), 'Falta la política de acceso para todos los bots');
check(!/^Disallow:[ \t]*\S/im.test(robots.body), 'robots.txt contiene restricciones de rastreo');
check(!/^Crawl-delay:/im.test(robots.body), 'robots.txt limita el ritmo de rastreo');
const sitemap = await get('/sitemap.xml');
check(sitemap.status === 200, 'El sitemap no responde 200');
const pageUrls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([,url]) => url);
const imageUrls = [...sitemap.body.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(([,url]) => url);
check(pageUrls.length === 4 && new Set(pageUrls).size === 4, 'El sitemap no contiene las cuatro páginas públicas');
check(imageUrls.length === 18, 'Faltan fotografías en el sitemap');
const pages = [];
let home;
for (const canonical of pageUrls) {
  const path = new URL(canonical).pathname;
  const result = await get(path);
  if (path === '/') home = result;
  check(result.status === 200, `La página ${path} no responde 200`);
  const meta = [...result.body.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const policy = meta.filter(tag => ['robots','googlebot','bingbot'].includes(tag.name?.toLowerCase()));
  check(policy.every(tag => !blocked.test(tag.content || '')), `Metaetiqueta restrictiva en ${path}`);
  const canonicalTag = [...result.body.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attributes(tag)).find(tag => tag.rel === 'canonical');
  check(canonicalTag?.href === canonical, `Canonical distinto del sitemap en ${path}`);
  pages.push({ url:canonical,status:result.status,canonical:canonicalTag?.href,robots:policy.map(tag => tag.content) });
}
check(Boolean(home?.body.includes('id="hero-title"')), 'La portada no entrega su contenido en el HTML inicial');
const advertisedSitemap = robots.body.match(/^Sitemap:\s*(\S+)/im)?.[1];
check(advertisedSitemap === new URL('/sitemap.xml',pageUrls[0] || target).href, 'robots.txt anuncia otro dominio de sitemap');

for (const agent of ['Googlebot','Googlebot-Image/1.0','bingbot','OAI-SearchBot','PerplexityBot']) {
  for (const path of ['/','/robots.txt','/sitemap.xml']) {
    const result = await get(path,agent);
    check(result.status === 200, `${agent}: respuesta ${result.status} en ${path}`);
    if (path === '/') check(result.body === home?.body, `${agent}: contenido distinto al servido al visitante`);
    if (path === '/robots.txt') check(result.body === robots.body, `${agent}: robots.txt distinto`);
  }
}
const assets = [...new Set([...imageUrls.map(url => new URL(url).pathname), '/fonts/inter-latin.woff2', ...[...(home?.body || '').matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(([,src]) => src)])];
for (const path of assets) {
  const result = await get(path,'Googlebot',false);
  check(result.status === 200, `Googlebot: recurso inaccesible ${path}`);
}
const missing = await get('/comprobacion-ruta-inexistente-404');
check(missing.status === 404, 'La página inexistente no devuelve HTTP 404');

const local = ['localhost','127.0.0.1','[::1]'].includes(target.hostname);
const report = {
  date:new Date().toISOString(), target:target.href,scope:local ? 'local' : 'public',passed:errors.length === 0,
  pages,images:imageUrls.length,agents:['Googlebot','Googlebot-Image','bingbot','OAI-SearchBot','PerplexityBot'],requests,errors,
  limitations:[
    'Cambiar el User-Agent comprueba el comportamiento del sitio; no reproduce las IP verificadas de los rastreadores reales.',
    ...(local ? ['Esta prueba no valida las reglas WAF, robots gestionado, autenticación o bloqueo de bots de la cuenta Cloudflare de producción.'] : []),
    'La propiedad y el estado real de indexación deben comprobarse en Search Console. Permitir el acceso no garantiza que un buscador indexe una URL.',
  ],
};
const output = new URL(`../migration/audits/indexability-${local ? 'local' : 'public'}.json`,import.meta.url);
await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,pages:pages.length,images:imageUrls.length,requests:requests.length,errors},null,2));
if (errors.length) process.exitCode = 1;
