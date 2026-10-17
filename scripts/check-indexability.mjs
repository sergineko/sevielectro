import { writeFile } from 'node:fs/promises';
import { projects } from '../src/data/content.js';

const target = new URL(process.argv[2] || 'http://127.0.0.1:4321/');
if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password) throw new Error('Indica una URL HTTP(S) pública sin credenciales.');
const errors = [];
const requests = [];
const warnings = [];
const agents = ['Googlebot','Googlebot-Image/1.0','bingbot','DuckDuckBot/1.1','Applebot','YandexBot','Baiduspider','Slurp','MojeekBot','OAI-SearchBot','PerplexityBot'];
const blocked = /\b(noindex|nofollow|none|noimageindex|nosnippet|unavailable_after)\b/i;
const check = (condition, message) => { if (!condition) errors.push(message); };
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([,key,value]) => [key.toLowerCase(),value]));

async function get(path, agent = 'SeviElectroDiscoveryAudit/1.0', readBody = true) {
  const url = new URL(path, target.origin);
  const response = await fetch(url, { headers: { 'User-Agent': agent }, signal: AbortSignal.timeout(10000) });
  const headers = Object.fromEntries(['content-type','x-robots-tag','cf-mitigated','cf-ray','server'].map(name => [name,response.headers.get(name)]));
  const body = readBody ? await response.text() : (await response.arrayBuffer(), '');
  requests.push({ url:url.href,path:url.pathname,agent,status:response.status,finalUrl:response.url,headers });
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
check(imageUrls.length === projects.length+1, 'Faltan fotografías en el sitemap');
const pages = [];
const titles = new Set(), descriptions = new Set();
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
  const title = result.body.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = meta.find(tag => tag.name === 'description')?.content;
  check(Boolean(title && description),`Falta título o descripción en ${path}`);
  if (title) titles.add(title);
  if (description) descriptions.add(description);
  check(result.body.includes('<html lang="es-EC">'),`Idioma incorrecto en ${path}`);
  let schemaTypes = [];
  try {
    const graph = JSON.parse(result.body.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    schemaTypes = graph.map(item => item['@type']);
    const company = graph.find(item => item['@type'] === 'Electrician');
    const page = graph.find(item => item['@type'] === 'WebPage');
    check(Boolean(company.address.streetAddress && company.address.addressRegion && company.address.addressCountry),'Dirección estructurada incompleta');
    check(page.url === canonical,`URL estructurada distinta del canonical en ${path}`);
    check(company.hasOfferCatalog.itemListElement.length === 4,'Catálogo de servicios incompleto');
  } catch { check(false,`JSON-LD ausente o no válido en ${path}`); }
  pages.push({ url:canonical,status:result.status,canonical:canonicalTag?.href,title,description,schemaTypes,robots:policy.map(tag => tag.content) });
}
check(titles.size === pages.length && descriptions.size === pages.length,'Títulos o descripciones duplicados');
check(Boolean(home?.body.includes('id="hero-title"')), 'La portada no entrega su contenido en el HTML inicial');
const advertisedSitemap = robots.body.match(/^Sitemap:\s*(\S+)/im)?.[1];
check(advertisedSitemap === new URL('/sitemap.xml',pageUrls[0] || target).href, 'robots.txt anuncia otro dominio de sitemap');

for (const agent of agents) {
  for (const path of ['/','/robots.txt','/sitemap.xml']) {
    const result = await get(path,agent);
    check(result.status === 200, `${agent}: respuesta ${result.status} en ${path}`);
    if (path === '/') check(result.body === home?.body, `${agent}: contenido distinto al servido al visitante`);
    if (path === '/robots.txt') check(result.body === robots.body, `${agent}: robots.txt distinto`);
  }
}
const font = [...(home?.body || '').matchAll(/<link\b[^>]*>/g)].map(([tag]) => attributes(tag)).find(tag => tag.as === 'font')?.href;
const clientSprite = [...(home?.body || '').matchAll(/<use (?:href|data-client-logo)="([^"#]+)#client-\d+"/g)].map(([,src]) => src);
const assets = [...new Set([...imageUrls.map(url => new URL(url).pathname), ...(font ? [font] : []), ...clientSprite, ...[...(home?.body || '').matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(([,src]) => src)])];
for (const path of assets) {
  const result = await get(path,'Googlebot',false);
  check(result.status === 200, `Googlebot: recurso inaccesible ${path}`);
}
const missing = await get('/comprobacion-ruta-inexistente-404');
check(missing.status === 404, 'La página inexistente no devuelve HTTP 404');

const local = ['localhost','127.0.0.1','[::1]'].includes(target.hostname);
let canonicalDomain;
if (!local && pageUrls[0] && new URL(pageUrls[0]).origin !== target.origin) {
  const destination = await get(pageUrls[0]);
  const matchesNewSite = destination.status === 200 && destination.body.includes('id="hero-title"') && destination.body.includes('"@type":"WebSite"');
  canonicalDomain = { url:pageUrls[0],status:destination.status,matchesNewSite };
  if (!matchesNewSite) warnings.push('El dominio canónico todavía no sirve la nueva web. El SEO del dominio definitivo requiere completar su conexión y migración.');
}
const report = {
  date:new Date().toISOString(), target:target.href,scope:local ? 'local' : 'public',passed:errors.length === 0,
  pages,images:imageUrls.length,agents,canonicalDomain,requests,errors,warnings,
  limitations:[
    'Cambiar el User-Agent comprueba el comportamiento del sitio; no reproduce las IP verificadas de los rastreadores reales.',
    ...(local ? ['Esta prueba no valida las reglas WAF, robots gestionado, autenticación o bloqueo de bots de la cuenta Cloudflare de producción.'] : []),
    'La propiedad y el estado real de indexación deben comprobarse en Search Console. Permitir el acceso no garantiza que un buscador indexe una URL.',
  ],
};
const output = new URL(`../migration/audits/indexability-${local ? 'local' : 'public'}.json`,import.meta.url);
await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,pages:pages.length,images:imageUrls.length,agents:agents.length,requests:requests.length,errors,warnings},null,2));
if (errors.length) process.exitCode = 1;
